import { Schema, model } from 'mongoose';
import { IPrayerRequest, IPrayerInteraction, PrayerRequestModel, PrayerInteractionModel } from './prayer.interface';

const prayerRequestSchema = new Schema<IPrayerRequest, PrayerRequestModel>(
  {
    author_name: {
      type: String,
      default: 'Anonymous',
    },
    author_user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    is_anonymous: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'answered'],
      default: 'active',
    },
    pray_count: {
      type: Number,
      default: 0,
    },
    device_fingerprint: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const prayerInteractionSchema = new Schema<IPrayerInteraction, PrayerInteractionModel>(
  {
    prayer_request_id: {
      type: Schema.Types.ObjectId,
      ref: 'PrayerRequest',
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    device_fingerprint: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const PrayerRequest = model<IPrayerRequest, PrayerRequestModel>('PrayerRequest', prayerRequestSchema);
export const PrayerInteraction = model<IPrayerInteraction, PrayerInteractionModel>('PrayerInteraction', prayerInteractionSchema);
