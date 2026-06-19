import { Media } from './media.model';
import fs from 'fs';
import path from 'path';

const uploadMedia = async (file: Express.Multer.File, type: string, uploadedBy: string) => {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('IMGBB_API_KEY is not configured in the environment variables. Please add it to your .env file.');
  }

  const formData = new URLSearchParams();
  formData.append('image', file.buffer.toString('base64'));

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to upload image to ImgBB');
  }

  const result = await Media.create({
    filename: file.originalname,
    url: data.data.url,
    type,
    size: file.size,
    mimetype: file.mimetype,
    uploadedBy
  });
  return result;
};

const getAllMedia = async (type?: string) => {
  const query = type ? { type } : {};
  return await Media.find(query).sort({ createdAt: -1 }).populate('uploadedBy', 'name email');
};

const deleteMedia = async (id: string) => {
  const media = await Media.findById(id);
  if (!media) {
    throw new Error('Media not found');
  }

  // No need to delete file from disk since it's hosted on ImgBB
  // In a real production app, we would call the ImgBB API to delete the image if they provided an endpoint, 
  // but ImgBB's free API does not support deletion.

  const result = await Media.findByIdAndDelete(id);
  return result;
};

export const MediaService = {
  uploadMedia,
  getAllMedia,
  deleteMedia,
};
