import { model, Schema } from 'mongoose';
import { ISermonCategory, SermonCategoryModel } from './sermonCategory.interface';

const sermonCategorySchema = new Schema<ISermonCategory, SermonCategoryModel>(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const SermonCategory = model<ISermonCategory, SermonCategoryModel>('SermonCategory', sermonCategorySchema);
