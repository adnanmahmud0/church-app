import cron from 'node-cron';
import { ChurchInfo } from '../modules/churchInfo/churchInfo.model';
import { NotificationService } from '../modules/notification/notification.service';

const getTodayDateString = (tz: string) => {
  const parts = new Intl.DateTimeFormat('en-US', { 
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' 
  }).formatToParts(new Date());
  const y = parts.find(p => p.type === 'year')?.value;
  const m = parts.find(p => p.type === 'month')?.value;
  const d = parts.find(p => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
};

export const startSundayServiceCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const churchInfo = await ChurchInfo.findOne();
      if (!churchInfo || !churchInfo.sunday_service_start_time) {
        return; // No service time configured
      }

      const tz = churchInfo.timezone || 'UTC';
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-US', { 
        timeZone: tz, 
        weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' 
      }).formatToParts(now);
      
      const currentDay = parts.find(p => p.type === 'weekday')?.value;
      if (currentDay !== 'Sunday') {
        return; // It's not Sunday in the configured timezone
      }

      const todayStr = getTodayDateString(tz);
      const currentHour = Number(parts.find(p => p.type === 'hour')?.value);
      const currentMinute = Number(parts.find(p => p.type === 'minute')?.value);
      
      const [startHour, startMin] = churchInfo.sunday_service_start_time.split(':').map(Number);
      
      // Calculate minutes difference
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const startTimeInMinutes = startHour * 60 + startMin;
      const diffMinutes = startTimeInMinutes - currentTimeInMinutes;

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
