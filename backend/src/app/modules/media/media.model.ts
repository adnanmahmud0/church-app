import { Schema, model } from 'mongoose';

const mediaSchema = new Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['image'], required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export const Media = model('Media', mediaSchema);
