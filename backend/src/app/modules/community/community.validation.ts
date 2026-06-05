import { z } from 'zod';

const createCommunityGroupZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).max(100),
    description: z.string({ required_error: 'Description is required' }),
    joinLink: z.string({ required_error: 'Join link is required' }).url('Must be a valid URL'),
    platform: z.enum(['whatsapp', 'facebook', 'telegram', 'messenger', 'other']),
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateCommunityGroupZodSchema = z.object({
  body: z.object({
    title: z.string().max(100).optional(),
    description: z.string().optional(),
    joinLink: z.string().url('Must be a valid URL').optional(),
    platform: z.enum(['whatsapp', 'facebook', 'telegram', 'messenger', 'other']).optional(),
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

const reorderCommunityGroupsZodSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        id: z.string({ required_error: 'ID is required' }),
        sortOrder: z.number({ required_error: 'Sort order is required' }),
      })
    ),
  }),
});

export const CommunityValidation = {
  createCommunityGroupZodSchema,
  updateCommunityGroupZodSchema,
  reorderCommunityGroupsZodSchema,
};
