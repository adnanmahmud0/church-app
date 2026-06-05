import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { DevotionalsService } from './devotionals.service';

const getDevotionals = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const isAdmin = req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN');
  const includeDrafts = isAdmin;

  const result = await DevotionalsService.getDevotionals(page, limit, includeDrafts);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Devotionals retrieved successfully',
    data: result,
  });
});

const getTodayDevotional = catchAsync(async (req: Request, res: Response) => {
  const result = await DevotionalsService.getTodayDevotional();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Today\'s devotional retrieved successfully',
    data: result,
  });
});

const getDevotionalById = catchAsync(async (req: Request, res: Response) => {
  const result = await DevotionalsService.getDevotionalById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Devotional retrieved successfully',
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  // If we have an authenticated user, prefer that. Otherwise fallback to body.userId
  const userId = req.user?.id || req.body.userId;
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'userId is required',
      data: null,
    });
  }

  const result = await DevotionalsService.markAsRead(req.params.id, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Marked as read successfully',
    data: result,
  });
});

const getReadStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'userId query parameter is required',
      data: null,
    });
  }

  const result = await DevotionalsService.getReadStatus(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Read status retrieved successfully',
    data: result,
  });
});

const createDevotional = catchAsync(async (req: Request, res: Response) => {
  const result = await DevotionalsService.createDevotional(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Devotional created successfully',
    data: result,
  });
});

const updateDevotional = catchAsync(async (req: Request, res: Response) => {
  const result = await DevotionalsService.updateDevotional(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Devotional updated successfully',
    data: result,
  });
});

const deleteDevotional = catchAsync(async (req: Request, res: Response) => {
  const result = await DevotionalsService.deleteDevotional(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Devotional deleted successfully',
    data: result,
  });
});

const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DevotionalsService.getStats();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Stats retrieved successfully',
    data: result,
  });
});

export const DevotionalsController = {
  getDevotionals,
  getTodayDevotional,
  getDevotionalById,
  markAsRead,
  getReadStatus,
  createDevotional,
  updateDevotional,
  deleteDevotional,
  getStats,
};
