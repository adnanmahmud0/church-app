import { model, Schema } from 'mongoose';
import { ISermonSeries, SermonSeriesModel } from './sermonSeries.interface';

const sermonSeriesSchema = new Schema<ISermonSeries, SermonSeriesModel>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    cover_image_url: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const SermonSeries = model<ISermonSeries, SermonSeriesModel>('SermonSeries', sermonSeriesSchema);
