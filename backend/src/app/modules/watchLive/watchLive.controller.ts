import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { WatchLiveService } from './watchLive.service';

const getYoutubeStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await WatchLiveService.getYoutubeStatus();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'YouTube status fetched successfully',
    data: result,
  });
});

const getRecentVideos = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const result = await WatchLiveService.getRecentVideos(limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Recent videos fetched successfully',
    data: result,
  });
});

const getChannelInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await WatchLiveService.getChannelInfo();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Channel info fetched successfully',
    data: result,
  });
});

const getPlatforms = catchAsync(async (req: Request, res: Response) => {
  const result = await WatchLiveService.getPlatforms();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Platforms fetched successfully',
    data: result,
  });
});

const getServiceInfo = catchAsync(async (req: Request, res: Response) => {
  const settings = await WatchLiveService.getSettings();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service info fetched successfully',
    data: {
      schedule: settings.serviceSchedule,
      time: settings.serviceTime,
      address: settings.serviceAddress,
    },
  });
});

// Admin endpoints

const getSettings = catchAsync(async (req: Request, res: Response) => {
  const settings = await WatchLiveService.getSettings();
  
  // Mask the API key
  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '********';
    return `${key.slice(0, 6)}••••••••••••••••••${key.slice(-4)}`;
  };

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Settings fetched successfully',
    data: {
      youtubeApiKey: maskKey(settings.youtubeApiKey),
      youtubeChannelId: settings.youtubeChannelId,
      serviceSchedule: settings.serviceSchedule,
      serviceTime: settings.serviceTime,
      serviceAddress: settings.serviceAddress,
    },
  });
});

const updateSettings = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  // If the masked key is passed back, don't overwrite it!
  if (payload.youtubeApiKey && payload.youtubeApiKey.includes('••••')) {
    delete payload.youtubeApiKey;
  }

  const result = await WatchLiveService.updateSettings(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Settings updated successfully',
    data: null, // Don't return API key in response
  });
});

const addPlatform = catchAsync(async (req: Request, res: Response) => {
  const result = await WatchLiveService.addPlatform(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Platform added successfully',
    data: result,
  });
});

const updatePlatform = catchAsync(async (req: Request, res: Response) => {
  const result = await WatchLiveService.updatePlatform(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Platform updated successfully',
    data: result,
  });
});

const deletePlatform = catchAsync(async (req: Request, res: Response) => {
  const result = await WatchLiveService.deletePlatform(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Platform deleted successfully',
    data: result,
  });
});

const reorderPlatforms = catchAsync(async (req: Request, res: Response) => {
  await WatchLiveService.reorderPlatforms(req.body.items);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Platforms reordered successfully',
    data: null,
  });
});

const testYoutubeConnection = catchAsync(async (req: Request, res: Response) => {
  const { youtubeApiKey, youtubeChannelId } = req.body;
  const settings = await WatchLiveService.getSettings();
  
  // Use provided key or existing DB key (if masked key is passed, we use DB key)
  let keyToUse = youtubeApiKey;
  if (!keyToUse || keyToUse.includes('••••')) {
    keyToUse = settings.youtubeApiKey || process.env.YOUTUBE_API_KEY;
  }
  
  if (!keyToUse || !youtubeChannelId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'API Key and Channel ID are required for testing',
      data: null,
    });
  }

  const result = await WatchLiveService.testYoutubeConnection(keyToUse, youtubeChannelId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.valid ? 'Connection successful' : 'Connection failed',
    data: result,
  });
});

export const WatchLiveController = {
  getYoutubeStatus,
  getRecentVideos,
  getChannelInfo,
  getPlatforms,
  getServiceInfo,
  getSettings,
  updateSettings,
  addPlatform,
  updatePlatform,
  deletePlatform,
  reorderPlatforms,
  testYoutubeConnection,
};
