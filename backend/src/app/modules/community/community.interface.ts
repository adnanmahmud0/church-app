import { Model } from 'mongoose';

export type IPlatform = 'whatsapp' | 'facebook' | 'telegram' | 'messenger' | 'other';

export interface ICommunityGroup {
  title: string;
  description: string;
  joinLink: string;
  platform: IPlatform;
  platformLabel: string;
  sortOrder: number;
  isActive: boolean;
}

export type CommunityGroupModel = Model<ICommunityGroup, Record<string, unknown>>;
