import { Schema, model } from 'mongoose';
import { ChurchInfoModel, IChurchInfo } from './churchInfo.interface';

const ChurchInfoSchema = new Schema<IChurchInfo, ChurchInfoModel>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    contact_address: {
      type: String,
      trim: true,
    },
    contact_email: {
      type: String,
      trim: true,
    },
    contact_phone: {
      type: String,
      trim: true,
    },
    contact_website: {
      type: String,
      trim: true,
    },
    our_mission_quote: {
      type: String,
      trim: true,
    },
    sunday_service_time: {
      type: String,
      trim: true,
    },
    sunday_service_start_time: {
      type: String,
      trim: true,
    },
    sunday_service_end_time: {
      type: String,
      trim: true,
    },
    sunday_service_reminder_enabled: {
      type: Boolean,
      default: false,
    },
    sunday_service_reminders: [
      {
        minutes: { type: Number, required: true },
        title: { type: String, default: "" },
        message: { type: String, default: "" },
      }
    ],
    sunday_service_start_notification_enabled: {
      type: Boolean,
      default: false,
    },
    sunday_service_start_title: {
      type: String,
      default: "Sunday Service Starting",
    },
    sunday_service_start_message: {
      type: String,
      default: "Our Sunday service is starting now. Join us!",
    },
    default_sermon_notification: {
      type: Boolean,
      default: false,
    },
    default_service_reminder_notification: {
      type: Boolean,
      default: false,
    },
    default_custom_notification: {
      type: Boolean,
      default: true,
    },
    sent_reminders: {
      type: [String],
      default: [],
    },
    last_start_notification_sent_date: {
      type: String,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    updated_by: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      }
    },
  }
);

export const ChurchInfo = model<IChurchInfo, ChurchInfoModel>('ChurchInfo', ChurchInfoSchema);
