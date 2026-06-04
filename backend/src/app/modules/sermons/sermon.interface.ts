import { Model, Types } from 'mongoose';
import { ISermonSeries } from '../sermonSeries/sermonSeries.interface';

export type ISermon = {
  title: string;
  speaker: string;
  series?: Types.ObjectId | ISermonSeries;
  date: Date;
  duration_seconds?: number;
  audio_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  key_scripture?: string;
  description?: string;
  tags?: string[];
};

export type SermonModel = Model<ISermon>;
