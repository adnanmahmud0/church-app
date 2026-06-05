import { z } from 'zod';

const updateSettingsZodSchema = z.object({
  body: z.object({
    youtubeApiKey: z.string().optional(),
    youtubeChannelId: z.string().optional(),
    serviceSchedule: z.string().optional(),
    serviceTime: z.string().optional(),
    serviceAddress: z.string().optional(),
  }),
});

const createPlatformZodSchema = z.object({
  body: z.object({
    label: z.string({ required_error: 'Label is required' }),
    description: z.string({ required_error: 'Description is required' }),
    icon: z.string({ required_error: 'Icon is required' }),
    color: z.string({ required_error: 'Color is required' }),
    watchUrl: z.string().url('Must be a valid URL'),
    isActive: z.boolean().optional(),
  }),
});

const updatePlatformZodSchema = z.object({
  body: z.object({
    label: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    watchUrl: z.string().url('Must be a valid URL').optional(),
    isActive: z.boolean().optional(),
  }),
});

const reorderPlatformsZodSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        sortOrder: z.number(),
      })
    ),
  }),
});

export const WatchLiveValidation = {
  updateSettingsZodSchema,
  createPlatformZodSchema,
  updatePlatformZodSchema,
  reorderPlatformsZodSchema,
};
