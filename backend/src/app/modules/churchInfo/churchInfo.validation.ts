import { z } from 'zod';

const updateChurchInfoZodSchema = z.object({
  body: z.object({
    content: z.string({
      required_error: 'Content is required',
    }).min(1, 'Content cannot be empty'),
    contact_address: z.string().optional(),
    contact_email: z.string().email('Invalid email address').optional(),
    contact_phone: z.string().optional(),
    contact_website: z.string().optional(),
    sunday_service_time: z.string().optional(),
    our_mission_quote: z.string().optional(),
  }),
});

export const ChurchInfoValidation = {
  updateChurchInfoZodSchema,
};
