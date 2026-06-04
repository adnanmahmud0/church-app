import { Model } from 'mongoose';

export type IBibleVersion = {
  id: number;
  name: string;
  abbreviation: string;
  isActive: boolean;
};

export type IBibleSettings = {
  defaultVersionId: number;
  versions: IBibleVersion[];
};

export type BibleSettingsModel = Model<IBibleSettings>;
