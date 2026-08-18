import { Schema, model } from 'mongoose';
import { ILegal, LegalModel } from './legal.interface';

const legalSchema = new Schema<ILegal, LegalModel>(
  {
    type: {
      type: String,
      enum: [
        'terms-and-conditions',
        'privacy-policy',
        'cookie-policy',
        'disclaimer',
        'refund-and-returns-policy',
        'delete-account',
      ],
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Legal = model<ILegal, LegalModel>('Legal', legalSchema);
