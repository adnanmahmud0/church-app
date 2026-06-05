import { Schema, model } from 'mongoose';
import { IWatchLiveSettingsDoc, IWatchLivePlatformDoc } from './watchLive.interface';

const WatchLiveSettingsSchema = new Schema<IWatchLiveSettingsDoc>(
  {
    youtubeApiKey: { type: String, default: '' },
    youtubeChannelId: { type: String, default: '' },
    serviceSchedule: { type: String, default: 'Every Sunday' },
    serviceTime: { type: String, default: '10:00 AM – 12:30 PM' },
    serviceAddress: { type: String, default: '71 Stoneyburn Street, EH47 8JT' },
  },
  {
    timestamps: true,
  }
);

// We want to ensure only one settings document exists
WatchLiveSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const WatchLivePlatformSchema = new Schema<IWatchLivePlatformDoc>(
  {
    label: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    isYoutube: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    watchUrl: { type: String, default: null },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const WatchLiveSettings = model<IWatchLiveSettingsDoc, any>('WatchLiveSettings', WatchLiveSettingsSchema);
export const WatchLivePlatform = model<IWatchLivePlatformDoc>('WatchLivePlatform', WatchLivePlatformSchema);
