import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MediaService } from './media.service';

const uploadMedia = async (req: Request, res: Response) => {
  try {
    const files = req.files as Partial<Record<string, Express.Multer.File[]>>;
    const file = req.file || (files && (files['image']?.[0] || files['media']?.[0] || files['doc']?.[0] || files['file']?.[0]));
    
    if (!file) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'No file uploaded' });
    }

    const { type } = req.body;
    const user = (req as any).user;
    
    let mediaType = type;
    if (!mediaType) {
      if (file.mimetype.startsWith('image/')) mediaType = 'image';
      else if (file.mimetype.startsWith('video/')) mediaType = 'video';
      else if (file.mimetype.startsWith('audio/')) mediaType = 'audio';
      else mediaType = 'image';
    }

    const result = await MediaService.uploadMedia(file, mediaType, user?._id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Media uploaded successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

const getAllMedia = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const result = await MediaService.getAllMedia(type as string);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Media retrieved successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await MediaService.deleteMedia(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Media deleted successfully',
      data: null,
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

export const MediaController = {
  uploadMedia,
  getAllMedia,
  deleteMedia,
};
