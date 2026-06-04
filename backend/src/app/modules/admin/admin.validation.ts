import { z } from 'zod';

const createAdminZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }).email(),
    password: z.string({ required_error: 'Password is required' }).min(8),
  }),
});

const updateAdminZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
  }),
});

const updateProfileZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    currentPassword: z.string().optional(),
  }).refine((data) => {
    if (data.password && !data.currentPassword) {
      return false;
    }
    return true;
  }, {
    message: "Current password is required to change password",
    path: ["currentPassword"]
  }),
});

export const AdminValidation = {
  createAdminZodSchema,
  updateAdminZodSchema,
  updateProfileZodSchema,
};
