import cron from 'node-cron';
import { ChurchInfo } from '../modules/churchInfo/churchInfo.model';
import { Event, EventRSVP } from '../modules/events/events.model';
import { NotificationService } from '../modules/notification/notification.service';

const parseTimeString = (timeStr: string): [number, number] | null => {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3]?.toLowerCase();

  if (modifier === 'pm' && hours < 12) hours += 12;
  if (modifier === 'am' && hours === 12) hours = 0;
  return [hours, minutes];
};

export const startEventReminderCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const churchInfo = await ChurchInfo.findOne();
      if (!churchInfo) return;

      const hasReminders = churchInfo.event_reminder_enabled && churchInfo.event_reminders && churchInfo.event_reminders.length > 0;
      const hasStartNotif = churchInfo.event_start_notification_enabled;

      if (!hasReminders && !hasStartNotif) {
        return; // Nothing to do
      }

      const tz = churchInfo.timezone || 'UTC';
      const now = new Date();
      
      const parts = new Intl.DateTimeFormat('en-US', { 
        timeZone: tz, 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23' 
      }).formatToParts(now);

      const y = Number(parts.find(p => p.type === 'year')?.value);
      const m = Number(parts.find(p => p.type === 'month')?.value) - 1; // 0-indexed month
      const d = Number(parts.find(p => p.type === 'day')?.value);
      const currentHour = Number(parts.find(p => p.type === 'hour')?.value);
      const currentMinute = Number(parts.find(p => p.type === 'minute')?.value);

      const nowInChurchTz = new Date(Date.UTC(y, m, d, currentHour, currentMinute));

      // Find all upcoming events (date is yesterday or in the future to account for tz offsets)
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const upcomingEvents = await Event.find({
        date: { $gte: yesterday },
        isDraft: { $ne: true }
      });

      for (const event of upcomingEvents) {
        if (!event.time || !event.date) continue;

        const parsedTime = parseTimeString(event.time);
        if (!parsedTime) continue; // Invalid time format
        
        const [startHour, startMinute] = parsedTime;
        
        const eventYear = event.date.getUTCFullYear();
        const eventMonth = event.date.getUTCMonth();
        const eventDay = event.date.getUTCDate();

        const eventStartInChurchTz = new Date(Date.UTC(eventYear, eventMonth, eventDay, startHour, startMinute));

        const diffMs = eventStartInChurchTz.getTime() - nowInChurchTz.getTime();
        const diffMinutes = Math.round(diffMs / 60000);

        if (diffMinutes < 0) continue;

        let hasUpdates = false;

        // 1. Process standard reminders
        if (hasReminders) {
          for (const reminder of churchInfo.event_reminders!) {
            const reminderKey = `${reminder.minutes}`;
            
            if (
              diffMinutes === reminder.minutes &&
              !(event.sent_reminders || []).includes(reminderKey)
            ) {
              const title = 'Event Reminder';
              const message = `The event "${event.title}" starts in ${reminder.minutes} minutes. See you there!`;

              const rsvps = await EventRSVP.find({ eventId: event._id });
              const userIds = rsvps.map(rsvp => rsvp.userId).filter(Boolean);

              // Filter out users who have turned off event notifications
              const { User } = await import('../modules/user/user.model');
              const usersToNotify = await User.find({
                _id: { $in: userIds },
                'notificationPreferences.event': { $ne: false }
              });
              const filteredUserIds = usersToNotify.map(u => u._id.toString());

              if (filteredUserIds.length > 0) {
                await NotificationService.sendNotificationToUsers(filteredUserIds, {
                  title: title,
                  body: message,
                  data: { type: 'event', eventId: event._id.toString(), image: event.image || '' }
                });
              }
              
              if (!event.sent_reminders) event.sent_reminders = [];
              event.sent_reminders.push(reminderKey);
              hasUpdates = true;
            }
          }
        }

        // 2. Process start notification
        if (hasStartNotif && diffMinutes === 0 && !(event.sent_reminders || []).includes('start')) {
          const rsvps = await EventRSVP.find({ eventId: event._id });
          const userIds = rsvps.map(rsvp => rsvp.userId).filter(Boolean);

          // Filter out users who have turned off event notifications
          const { User } = await import('../modules/user/user.model');
          const usersToNotify = await User.find({
            _id: { $in: userIds },
            'notificationPreferences.event': { $ne: false }
          });
          const filteredUserIds = usersToNotify.map(u => u._id.toString());

          if (filteredUserIds.length > 0) {
            await NotificationService.sendNotificationToUsers(filteredUserIds, {
              title: 'Event Starting Now',
              body: `The event "${event.title}" is starting now. See you there!`,
              data: { type: 'event', eventId: event._id.toString(), image: event.image || '' }
            });
          }
          
          if (!event.sent_reminders) event.sent_reminders = [];
          event.sent_reminders.push('start');
          hasUpdates = true;
        }

        if (hasUpdates) {
          await event.save();
        }
      }
    } catch (error) {
      console.error('Error in Event Reminder Cron Job:', error);
    }
  });
};
