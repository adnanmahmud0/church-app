import { z } from 'zod';

const recordTransactionZodSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    fundId: z.string({ required_error: 'fundId is required' }),
    amount: z.number({ required_error: 'amount is required' }),
    currency: z.string().default('GBP'),
    reference: z.string({ required_error: 'reference is required' }),
  }),
});

const updateBankDetailsZodSchema = z.object({
  body: z.object({
    accountName: z.string().optional(),
    sortCode: z.string().optional(),
    accountNumber: z.string().optional(),
    reference: z.string().optional(),
    note: z.string().optional(),
  }),
});

const createFundZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'name is required' }),
    description: z.string({ required_error: 'description is required' }),
    icon: z.string().optional(),
    color: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
  }),
});

const updateFundZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
  }),
});

export const GivingValidation = {
  recordTransactionZodSchema,
  updateBankDetailsZodSchema,
  createFundZodSchema,
  updateFundZodSchema,
};
