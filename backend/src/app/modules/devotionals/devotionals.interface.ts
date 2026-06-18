import { Types } from 'mongoose';

export interface IDevotional {
  _id?: Types.ObjectId;
  title: string;
  assignedDateString?: string;
  scriptureRef: string;
  scriptureQuote: string;
  reflection: string;
  prayer: string;
  isDraft: boolean;
  publishedAt?: Date;
  lastShownDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDevotionalRead {
  _id?: Types.ObjectId;
  devotionalId: Types.ObjectId | IDevotional;
  userId: string;
  readAt: Date;
}
