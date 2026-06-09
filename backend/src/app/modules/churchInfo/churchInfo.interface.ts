import { Model } from 'mongoose';

export interface IChurchInfo {
  content: string;
  contact_address?: string;
  contact_email?: string;
  contact_phone?: string;
  sunday_service_time?: string;
  updated_at: Date;
  updated_by: string;
}

export type ChurchInfoModel = Model<IChurchInfo, Record<string, unknown>>;
