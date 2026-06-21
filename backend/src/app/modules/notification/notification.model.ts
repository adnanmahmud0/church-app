import { model, Schema } from 'mongoose';
import {
  INotificationLog,
  INotificationToken,
  NotificationLogModel,
  NotificationTokenModel,
} from './notification.interface';

const notificationTokenSchema = new Schema<
  INotificationToken,
  NotificationTokenModel
>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    platform: {
      type: String,
      enum: ['android', 'ios', 'web'],
      default: 'android',
    },
  },
  { timestamps: true }
);

export const NotificationToken = model<
  INotificationToken,
  NotificationTokenModel
>('NotificationToken', notificationTokenSchema);

const notificationLogSchema = new Schema<
  INotificationLog,
  NotificationLogModel
>(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const NotificationLog = model<INotificationLog, NotificationLogModel>(
  'NotificationLog',
  notificationLogSchema
);
