import { Types } from 'mongoose';

export interface IGivingFund {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

export interface IGivingTransaction {
  _id?: Types.ObjectId;
  userId?: string;
  fundId: string | Types.ObjectId | IGivingFund;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBankDetails {
  _id?: Types.ObjectId;
  accountName: string;
  sortCode: string;
  accountNumber: string;
  reference: string;
  note: string;
}
