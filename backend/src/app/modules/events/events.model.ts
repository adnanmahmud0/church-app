import { Schema, model } from 'mongoose';
import { IEvent, IEventCategory, IEventRSVP } from './events.interface';

const EventCategorySchema = new Schema<IEventCategory>(
  {
    label: { type: String, required: true },
    color: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const EventCategory = model<IEventCategory>('EventCategory', EventCategorySchema);

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'EventCategory', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    isDraft: { type: Boolean, default: false },
    sent_reminders: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Event = model<IEvent>('Event', EventSchema);

const EventRSVPSchema = new Schema<IEventRSVP>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

EventRSVPSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const EventRSVP = model<IEventRSVP>('EventRSVP', EventRSVPSchema);
