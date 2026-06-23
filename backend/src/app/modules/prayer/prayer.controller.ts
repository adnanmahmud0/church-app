import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PrayerService } from './prayer.service';

const createRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await PrayerService.createRequest(req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Prayer request created successfully',
    data: result,
  });
});

const getRequests = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const deviceFingerprint = req.query.device_fingerprint as string | undefined;
  
  const result = await PrayerService.getRequests(page, limit, req.user, deviceFingerprint);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Prayer requests retrieved successfully',
    pagination: result.meta,
    data: result.data,
  });
});

const getMyRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await PrayerService.getMyRequests(req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your prayer requests retrieved successfully',
    data: result,
  });
});

const getSingleRequest = catchAsync(async (req: Request, res: Response) => {
  const deviceFingerprint = req.query.device_fingerprint as string | undefined;
  const result = await PrayerService.getSingleRequest(req.params.id, req.user, deviceFingerprint);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Prayer request retrieved successfully',
    data: result,
  });
});

const prayForRequest = catchAsync(async (req: Request, res: Response) => {
  const deviceFingerprint = req.body.device_fingerprint;
  const result = await PrayerService.prayForRequest(req.params.id, req.user, deviceFingerprint);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully prayed for this request',
    data: result,
  });
});

const updateRequest = catchAsync(async (req: Request, res: Response) => {
  const deviceFingerprint = req.body.device_fingerprint;
  const result = await PrayerService.updateRequest(req.params.id, req.body, req.user, deviceFingerprint);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Prayer request updated successfully',
    data: result,
  });
});

const deleteRequest = catchAsync(async (req: Request, res: Response) => {
  const deviceFingerprint = req.body?.device_fingerprint;
  const result = await PrayerService.deleteRequest(req.params.id, req.user, deviceFingerprint);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Prayer request deleted successfully',
    data: result,
  });
});

const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await PrayerService.getStats();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Prayer stats retrieved successfully',
    data: result,
  });
});

export const PrayerController = {
  createRequest,
  getRequests,
  getMyRequests,
  getSingleRequest,
  prayForRequest,
  updateRequest,
  deleteRequest,
  getStats,
};
