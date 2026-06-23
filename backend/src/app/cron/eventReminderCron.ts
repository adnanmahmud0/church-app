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
      if (
        !churchInfo ||
        !churchInfo.event_reminder_enabled ||
        !churchInfo.event_reminders ||
        churchInfo.event_reminders.length === 0
      ) {
        return; // Event reminders disabled or empty
      }

      const now = new Date();
      const currentTimeMs = now.getTime();

      // Find all upcoming events (date is today or in the future)
      // Since `date` is stored as ISO date without time in many cases, we check for >= start of today
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

        // Calculate minutes difference
        const diffMs = startTimeMs - currentTimeMs;
        const diffMinutes = Math.round(diffMs / 60000);

        // If the event is in the past by more than a minute, skip
        if (diffMinutes < 0) continue;

        let hasUpdates = false;

        for (const reminder of churchInfo.event_reminders) {
          const reminderKey = `${reminder.minutes}`;
          
          if (
            diffMinutes === reminder.minutes &&
            !(event.sent_reminders || []).includes(reminderKey)
          ) {
            const title = reminder.title || 'Upcoming Event Reminder';
            const message = reminder.message || `${event.title} starts in ${reminder.minutes} minutes. See you there!`;

            // Get all users who RSVP'd
            const rsvps = await EventRSVP.find({ eventId: event._id });
            const userIds = rsvps.map(rsvp => rsvp.userId).filter(Boolean);

            if (userIds.length > 0) {
              await NotificationService.sendNotificationToUsers(userIds, {
                title: title,
                body: message,
                data: { type: 'event_reminder', eventId: event._id.toString() }
              });
            }
            
            if (!event.sent_reminders) event.sent_reminders = [];
            event.sent_reminders.push(reminderKey);
            hasUpdates = true;
          }
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
