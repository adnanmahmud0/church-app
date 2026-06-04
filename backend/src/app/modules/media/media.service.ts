import { Media } from './media.model';
import fs from 'fs';
import path from 'path';

const uploadMedia = async (file: Express.Multer.File, type: string, uploadedBy: string) => {
  const url = `/${file.filename}`;
  
  const result = await Media.create({
    filename: file.filename,
    url,
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

  // Delete file from disk
  const filePath = path.join(process.cwd(), 'uploads', media.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const result = await Media.findByIdAndDelete(id);
  return result;
};

export const MediaService = {
  uploadMedia,
  getAllMedia,
  deleteMedia,
};
