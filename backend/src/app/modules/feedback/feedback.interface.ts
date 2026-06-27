import { Types } from 'mongoose';

export type IFeedback = {
  title: string;
  description: string;
  userId?: Types.ObjectId;
};
