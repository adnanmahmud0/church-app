import cron from 'node-cron';
import { ChurchInfo } from '../modules/churchInfo/churchInfo.model';
import { NotificationService } from '../modules/notification/notification.service';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const parseTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const startSundayServiceCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // 0 is Sunday in JavaScript's getDay()
      if (now.getDay() !== 0) {
        return; // It's not Sunday
      }

      const churchInfo = await ChurchInfo.findOne();
      if (!churchInfo || !churchInfo.sunday_service_start_time) {
        return; // No service time configured
      }

      const todayStr = getTodayDateString();
      const startTime = parseTime(churchInfo.sunday_service_start_time);
      const currentTimeMs = now.getTime();
      const startTimeMs = startTime.getTime();
      
      // Calculate minutes difference
      const diffMs = startTimeMs - currentTimeMs;
      const diffMinutes = Math.round(diffMs / 60000);

      // Check for Reminder Notification
      if (
        churchInfo.sunday_service_reminder_enabled &&
        churchInfo.sunday_service_reminders &&
        churchInfo.sunday_service_reminders.length > 0
      ) {
        // Clear old sent reminders if it's a new day
        const firstReminder = churchInfo.sent_reminders?.[0];
        if (firstReminder && !firstReminder.startsWith(todayStr)) {
          churchInfo.sent_reminders = [];
        }

        let hasUpdates = false;

        for (const reminder of churchInfo.sunday_service_reminders) {
          const reminderKey = `${todayStr}_${reminder.minutes}`;
          if (
            diffMinutes === reminder.minutes &&
            !(churchInfo.sent_reminders || []).includes(reminderKey)
          ) {
            const title = reminder.title || 'Sunday Service Reminder';
            const message = reminder.message || `Sunday service will start in ${reminder.minutes} minutes. See you soon!`;
            await NotificationService.sendNotificationToTopic('service_reminder', {
              title: title,
              body: message,
              data: { type: 'service_reminder' }
            });
            
            if (!churchInfo.sent_reminders) churchInfo.sent_reminders = [];
            churchInfo.sent_reminders.push(reminderKey);
            hasUpdates = true;
          }
        }
        
        if (hasUpdates) {
          await churchInfo.save();
        }
      }

      // Check for Start Notification
      if (
        churchInfo.sunday_service_start_notification_enabled &&
        churchInfo.last_start_notification_sent_date !== todayStr
      ) {
        if (diffMinutes === 0) {
          const startTitle = churchInfo.sunday_service_start_title || 'Sunday Service Starting';
          const startMessage = churchInfo.sunday_service_start_message || 'Our Sunday service is starting now. Join us!';
          await NotificationService.sendNotificationToTopic('service_reminder', {
            title: startTitle,
            body: startMessage,
            data: { type: 'service_reminder' }
          });
          
          churchInfo.last_start_notification_sent_date = todayStr;
          await churchInfo.save();
        }
      }
    } catch (error) {
      console.error('Error in Sunday Service Cron Job:', error);
    }
  });
};
