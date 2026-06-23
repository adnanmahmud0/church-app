import { Model } from 'mongoose';

export interface IChurchInfo {
  content: string;
  contact_address?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_website?: string;
  our_mission_quote?: string;
  social_links?: { platform: string; url: string; isEnabled: boolean }[];
  sunday_service_time?: string;
  sunday_service_start_time?: string;
  sunday_service_end_time?: string;
  sunday_service_reminder_enabled?: boolean;
  sunday_service_reminders?: { minutes: number; title: string; message: string }[];
  event_reminder_enabled?: boolean;
  event_reminders?: { minutes: number; title: string; message: string }[];
  sunday_service_start_notification_enabled?: boolean;
  sunday_service_start_title?: string;
  sunday_service_start_message?: string;
  default_sermon_notification?: boolean;
  default_service_reminder_notification?: boolean;
  default_custom_notification?: boolean;
  sent_reminders?: string[];
  last_start_notification_sent_date?: string;
  updated_at: Date;
  updated_by: string;
}

export type ChurchInfoModel = Model<IChurchInfo, Record<string, unknown>>;
