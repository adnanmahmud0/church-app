import { Model } from 'mongoose';

export type ISermonSeries = {
  name: string;
};

export type SermonSeriesModel = Model<ISermonSeries>;
