import { Schema, model } from 'mongoose';
import { CommunityGroupModel, ICommunityGroup } from './community.interface';

const CommunityGroupSchema = new Schema<ICommunityGroup, CommunityGroupModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    joinLink: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['whatsapp', 'facebook', 'telegram', 'messenger', 'other'],
      required: true,
    },
    platformLabel: {
      type: String,
      required: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

CommunityGroupSchema.index({ isActive: 1 });

export const CommunityGroup = model<ICommunityGroup, CommunityGroupModel>('CommunityGroup', CommunityGroupSchema);
