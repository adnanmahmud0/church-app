import { Model } from 'mongoose';

export type ISermonSeries = {
  name: string;
  description?: string;
  cover_image_url?: string;
};

export type SermonSeriesModel = Model<ISermonSeries>;
