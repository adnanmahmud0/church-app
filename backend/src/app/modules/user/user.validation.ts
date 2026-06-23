import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    image: z.string().optional(),
    deviceId: z.string().optional(),
  }),
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  image: z.string().optional(),
  notificationPreferences: z
    .object({
      sermon: z.boolean().optional(),
      event: z.boolean().optional(),
      prayer: z.boolean().optional(),
      service_reminder: z.boolean().optional(),
      custom: z.boolean().optional(),
    })
    .optional(),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};

