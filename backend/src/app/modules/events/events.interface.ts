import { Types } from 'mongoose';

export interface IEventCategory {
  _id?: Types.ObjectId;
  label: string;
  color: string;
  sortOrder: number;
}

export interface IEvent {
  _id?: Types.ObjectId;
  title: string;
  categoryId: Types.ObjectId | IEventCategory;
  date: Date;
  time: string;
  location: string;
  description: string;
  image?: string;
  isDraft: boolean;
  sent_reminders?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEventRSVP {
  _id?: Types.ObjectId;
  eventId: Types.ObjectId | IEvent;
  userId: string;
  createdAt?: Date;
}
