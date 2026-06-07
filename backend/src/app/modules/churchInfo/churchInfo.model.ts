import { Schema, model } from 'mongoose';
import { ChurchInfoModel, IChurchInfo } from './churchInfo.interface';

const ChurchInfoSchema = new Schema<IChurchInfo, ChurchInfoModel>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    updated_by: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      }
    },
  }
);

export const ChurchInfo = model<IChurchInfo, ChurchInfoModel>('ChurchInfo', ChurchInfoSchema);
