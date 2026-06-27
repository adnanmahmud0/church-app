import { Model } from 'mongoose';

export type LegalDocumentType =
  | 'terms-and-conditions'
  | 'privacy-policy'
  | 'cookie-policy'
  | 'disclaimer'
  | 'refund-and-returns-policy';

export interface ILegal {
  type: LegalDocumentType;
  content: string;
  isActive: boolean;
}

export type LegalModel = Model<ILegal, Record<string, unknown>>;
