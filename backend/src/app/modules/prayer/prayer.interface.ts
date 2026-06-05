import { Model, Types } from 'mongoose';

export type IPrayerRequest = {
  author_name?: string;
  author_user_id?: Types.ObjectId;
  content: string;
  is_anonymous: boolean;
  status: 'active' | 'answered' | 'archived';
  pray_count: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PrayerRequestModel = Model<IPrayerRequest>;

export type IPrayerInteraction = {
  prayer_request_id: Types.ObjectId;
  user_id?: Types.ObjectId;
  device_fingerprint?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PrayerInteractionModel = Model<IPrayerInteraction>;
