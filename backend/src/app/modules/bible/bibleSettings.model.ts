import { model, Schema } from 'mongoose';
import { IBibleSettings, BibleSettingsModel } from './bibleSettings.interface';

const bibleSettingsSchema = new Schema<IBibleSettings, BibleSettingsModel>(
  {
    defaultVersionId: {
      type: Number,
      required: true,
      default: 1, // KJV
    },
    versions: [
      {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        abbreviation: { type: String, required: true },
        isActive: { type: Boolean, required: true, default: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const BibleSettings = model<IBibleSettings, BibleSettingsModel>('BibleSettings', bibleSettingsSchema);
