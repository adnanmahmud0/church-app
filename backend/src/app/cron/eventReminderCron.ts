import cron from 'node-cron';
import { ChurchInfo } from '../modules/churchInfo/churchInfo.model';
import { Event, EventRSVP } from '../modules/events/events.model';
import { NotificationService } from '../modules/notification/notification.service';

const parseEventDateTime = (date: Date, timeStr: string) => {
  const eventDate = new Date(date);
  const [hours, minutes] = timeStr.split(':').map(Number);
  eventDate.setHours(hours, minutes, 0, 0);
  return eventDate;
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

      const now = new Date();
      const currentTimeMs = now.getTime();

      // Find all upcoming events (date is today or in the future)
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const upcomingEvents = await Event.find({
        date: { $gte: startOfToday },
        isDraft: { $ne: true }
      });

      for (const event of upcomingEvents) {
        if (!event.time) continue;

        const eventStart = parseEventDateTime(event.date, event.time);
        const startTimeMs = eventStart.getTime();

        const diffMs = startTimeMs - currentTimeMs;
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
                  data: { type: 'event', eventId: event._id.toString() }
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
              data: { type: 'event', eventId: event._id.toString() }
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
