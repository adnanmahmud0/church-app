import { z } from 'zod';

const createPrayerRequestZodSchema = z.object({
  body: z.object({
    content: z.string({ required_error: 'Content is required' })
      .min(10, 'Content must be at least 10 characters long')
      .max(500, 'Content must not exceed 500 characters'),
    author_name: z.string()
      .max(50, 'Author name must not exceed 50 characters')
      .optional(),
    is_anonymous: z.boolean().optional(),
    device_fingerprint: z.string().optional(),
  }),
});

const updatePrayerRequestZodSchema = z.object({
  body: z.object({
    content: z.string()
      .min(10, 'Content must be at least 10 characters long')
      .max(500, 'Content must not exceed 500 characters')
      .optional(),
    author_name: z.string()
      .max(50, 'Author name must not exceed 50 characters')
      .optional(),
    is_anonymous: z.boolean().optional(),
    status: z.enum(['active', 'answered']).optional(),
    device_fingerprint: z.string().optional(),
  }),
});

const deletePrayerRequestZodSchema = z.object({
  body: z.object({
    device_fingerprint: z.string().optional(),
  }).optional(),
});

const prayForRequestZodSchema = z.object({
  body: z.object({
    device_fingerprint: z.string({ required_error: 'Device fingerprint is required for unauthenticated users' })
      .optional(),
  }),
});

export const PrayerValidation = {
  createPrayerRequestZodSchema,
  updatePrayerRequestZodSchema,
  deletePrayerRequestZodSchema,
  prayForRequestZodSchema
};
