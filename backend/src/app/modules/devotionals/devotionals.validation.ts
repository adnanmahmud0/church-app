import { z } from 'zod';

const createDevotionalZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    scriptureRef: z.string({ required_error: 'Scripture reference is required' }),
    scriptureQuote: z.string({ required_error: 'Scripture quote is required' }),
    reflection: z.string({ required_error: 'Reflection is required' }),
    prayer: z.string({ required_error: 'Prayer is required' }),
    isDraft: z.boolean().optional(),
  }),
});

const updateDevotionalZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    scriptureRef: z.string().optional(),
    scriptureQuote: z.string().optional(),
    reflection: z.string().optional(),
    prayer: z.string().optional(),
    isDraft: z.boolean().optional(),
  }),
});



export const DevotionalsValidation = {
  createDevotionalZodSchema,
  updateDevotionalZodSchema,

};
