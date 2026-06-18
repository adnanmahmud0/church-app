import { Schema, model } from 'mongoose';
import { IDevotional, IDevotionalRead } from './devotionals.interface';

const DevotionalSchema = new Schema<IDevotional>(
  {
    title: { type: String, required: true },
    assignedDateString: { type: String, default: null },
    cycleCount: { type: Number, default: 0 },
    scriptureRef: { type: String, required: true },
    scriptureQuote: { type: String, required: true },
    reflection: { type: String, required: true },
    prayer: { type: String, required: true },
    isDraft: { type: Boolean, required: true, default: false },
    publishedAt: { type: Date },
    lastShownDate: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

const DevotionalReadSchema = new Schema<IDevotionalRead>(
  {
    devotionalId: { type: Schema.Types.ObjectId, ref: 'Devotional', required: true },
    userId: { type: String, required: true },
    readAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Ensure unique read per user per devotional
DevotionalReadSchema.index({ devotionalId: 1, userId: 1 }, { unique: true });

export const Devotional = model<IDevotional>('Devotional', DevotionalSchema);
export const DevotionalRead = model<IDevotionalRead>('DevotionalRead', DevotionalReadSchema);
