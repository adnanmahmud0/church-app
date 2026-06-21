import { Model, Types } from 'mongoose';

export type INotificationToken = {
  token: string;
  user?: Types.ObjectId;
  platform?: 'android' | 'ios' | 'web';
};

export type NotificationTokenModel = Model<INotificationToken>;

export type INotificationLog = {
  title: string;
  body: string;
  sentAt: Date;
  successCount: number;
  failureCount: number;
};

export type NotificationLogModel = Model<INotificationLog>;
