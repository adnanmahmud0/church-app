import { Model, Types } from 'mongoose';
import { ISermonCategory } from '../sermonCategory/sermonCategory.interface';

export type ISermon = {
  title: string;
  speaker: string;
  category?: Types.ObjectId | ISermonCategory;
  date: Date;
  duration_seconds?: number;
  video_url?: string;
  thumbnail_url?: string;
  key_scripture?: string;
  description?: string;
  tags?: string[];
  share_url?: string;
};

export type SermonModel = Model<ISermon>;
