import { Schema, model } from 'mongoose';
import { IGivingFund, IGivingTransaction, IBankDetails } from './giving.interface';

const GivingFundSchema = new Schema<IGivingFund>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true, default: 'dollar-sign' },
    color: { type: String, required: true, default: '#3B82F6' },
    isActive: { type: Boolean, required: true, default: true },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

const GivingTransactionSchema = new Schema<IGivingTransaction>(
  {
    userId: { type: String, required: false },
    fundId: { type: Schema.Types.ObjectId, ref: 'GivingFund', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'GBP' },
    status: { type: String, required: true, default: 'completed' },
    reference: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

const BankDetailsSchema = new Schema<IBankDetails>(
  {
    accountName: { type: String, required: true },
    sortCode: { type: String, required: true },
    accountNumber: { type: String, required: true },
    reference: { type: String, required: true },
    note: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

export const GivingFund = model<IGivingFund>('GivingFund', GivingFundSchema);
export const GivingTransaction = model<IGivingTransaction>('GivingTransaction', GivingTransactionSchema);
export const BankDetails = model<IBankDetails>('BankDetails', BankDetailsSchema);
