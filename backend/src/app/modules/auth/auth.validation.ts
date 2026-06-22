import { z } from 'zod';

const createVerifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    oneTimeCode: z.number({ required_error: 'One time code is required' }),
  }),
});

const createDeviceInitZodSchema = z.object({
  body: z.object({
    deviceId: z.string({ required_error: 'Device ID is required' }),
    fcmToken: z.string({ required_error: 'FCM Token is required' }),
    platform: z.enum(['android', 'ios', 'web']).optional(),
  }),
});

const createLoginZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    deviceId: z.string().optional(),
  }),
});

const createForgetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
  }),
});

const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string({ required_error: 'Password is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Current Password is required',
    }),
    newPassword: z.string({ required_error: 'New Password is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

export const AuthValidation = {
  createDeviceInitZodSchema,
  createVerifyEmailZodSchema,
  createForgetPasswordZodSchema,
  createLoginZodSchema,
  createResetPasswordZodSchema,
  createChangePasswordZodSchema,
  createResendVerifyEmailZodSchema: z.object({
    body: z.object({
      email: z.string({ required_error: 'Email is required' }),
    }),
  }),
  createRefreshTokenZodSchema: z.object({
    body: z.object({
      refreshToken: z.string().min(1).optional(),
    }),
  }),
};
