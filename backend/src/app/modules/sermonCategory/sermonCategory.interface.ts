import { Model } from 'mongoose';

export type ISermonCategory = {
  name: string;
};

export type SermonCategoryModel = Model<ISermonCategory>;
