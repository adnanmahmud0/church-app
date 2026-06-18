import { model, Schema } from 'mongoose';
import { ISermon, SermonModel } from './sermon.interface';

const sermonSchema = new Schema<ISermon, SermonModel>(
  {
    title: {
      type: String,
      required: true,
    },
    speaker: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'SermonCategory',
    },
    date: {
      type: Date,
      required: true,
    },
    duration_seconds: {
      type: Number,
    },
    video_url: { type: String },
    thumbnail_url: {
      type: String,
    },
    key_scripture: {
      type: String,
    },
    description: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);


sermonSchema.virtual('share_url').get(function () {
  const baseUrl = process.env.CORS_ORIGIN || 'https://church-app.com';
  // Fallback to avoid 'localhost' in production if misconfigured, though CORS_ORIGIN is best guess
  return `${baseUrl}/share/sermons/${this._id}`;
});

export const Sermon = model<ISermon, SermonModel>('Sermon', sermonSchema);
