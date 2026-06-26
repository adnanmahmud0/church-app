import cron from 'node-cron';
import { Devotional } from '../modules/devotionals/devotionals.model';
import { NotificationService } from '../modules/notification/notification.service';
import { ChurchInfo } from '../modules/churchInfo/churchInfo.model';

export const startDevotionalCron = () => {
  // Run every minute to check if today's devotional has sent a notification
  cron.schedule('* * * * *', async () => {
    try {
      // Get the church timezone to ensure 'today' is accurate
      const churchInfo = await ChurchInfo.findOne();
      const tz = churchInfo?.timezone || 'UTC';
      const appearanceTime = churchInfo?.devotional_appearance_time || '00:00';
      
      const now = new Date();
      
      const parts = new Intl.DateTimeFormat('en-US', { 
        timeZone: tz, 
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(now);

      const y = Number(parts.find(p => p.type === 'year')?.value);
      const m = Number(parts.find(p => p.type === 'month')?.value) - 1;
      const d = Number(parts.find(p => p.type === 'day')?.value);
      const h = Number(parts.find(p => p.type === 'hour')?.value);
      const min = Number(parts.find(p => p.type === 'minute')?.value);

      const [appHStr, appMStr] = appearanceTime.split(':');
      const appH = Number(appHStr) || 0;
      const appM = Number(appMStr) || 0;

      const nowMinutes = h * 60 + min;
      const appMinutes = appH * 60 + appM;

      const effectiveDate = new Date(Date.UTC(y, m, d));
      if (nowMinutes < appMinutes) {
        effectiveDate.setUTCDate(effectiveDate.getUTCDate() - 1);
      }

      const todayStr = effectiveDate.toISOString().split('T')[0];

      // Find an active devotional assigned for today that hasn't notified yet
      const todayDevotional = await Devotional.findOne({
        isDraft: false,
        assignedDateString: todayStr,
        notificationSent: false
      });

      if (todayDevotional) {
        // Send push notification to the 'devotional' topic
        await NotificationService.sendNotificationToTopic('devotional', {
          title: 'Daily Devotional',
          body: `Today's devotional "${todayDevotional.title}" is ready. Read it now!`,
          data: {
            type: 'devotional',
            devotionalId: todayDevotional._id.toString(),
          },
        });

        // Mark as sent so it doesn't trigger again today
        todayDevotional.notificationSent = true;
        await todayDevotional.save();
      }
    } catch (error) {
      console.error('Error in Devotional Cron Job:', error);
    }
  });
};
