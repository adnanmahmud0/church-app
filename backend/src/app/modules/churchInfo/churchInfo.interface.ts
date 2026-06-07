import { Model } from 'mongoose';

export interface IChurchInfo {
  content: string;
  updated_at: Date;
  updated_by: string;
}

export type ChurchInfoModel = Model<IChurchInfo, Record<string, unknown>>;
