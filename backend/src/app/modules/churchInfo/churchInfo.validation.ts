import { z } from 'zod';

const updateChurchInfoZodSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Content cannot be empty').optional(),
    contact_address: z.string().optional(),
    contact_email: z.string().email('Invalid email address').or(z.literal('')).optional(),
    contact_phone: z.string().optional(),
    contact_website: z.string().optional(),
    our_mission_quote: z.string().optional(),
    social_links: z.array(
      z.object({
        platform: z.string(),
        url: z.string().url('Invalid URL').or(z.literal('')),
        isEnabled: z.boolean().optional().default(true),
      })
    ).optional(),
    sunday_service_start_time: z.string().optional(),
    sunday_service_end_time: z.string().optional(),
    sunday_service_reminder_enabled: z.boolean().optional(),
    sunday_service_reminders: z.array(
      z.object({
        minutes: z.number(),
        title: z.string().optional().default(""),
        message: z.string().optional().default(""),
      })
    ).optional(),
    event_reminder_enabled: z.boolean().optional(),
    event_reminders: z.array(
      z.object({
        minutes: z.number(),
        title: z.string().optional().default(""),
        message: z.string().optional().default(""),
      })
    ).optional(),
    event_start_notification_enabled: z.boolean().optional(),
    sunday_service_start_notification_enabled: z.boolean().optional(),
    sunday_service_start_title: z.string().optional(),
    sunday_service_start_message: z.string().optional(),
    timezone: z.string().optional(),
    default_sermon_notification: z.boolean().optional(),
    default_service_reminder_notification: z.boolean().optional(),
    default_custom_notification: z.boolean().optional(),
    sent_reminders: z.array(z.string()).optional(),
    last_start_notification_sent_date: z.string().optional(),
  }),
});

export const ChurchInfoValidation = {
  updateChurchInfoZodSchema,
};
