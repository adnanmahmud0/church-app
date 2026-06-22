import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { NotificationService } from './notification.service';

const saveDeviceToken = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.saveDeviceToken(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Device token saved successfully',
    data: result,
  });
});

const sendNotification = catchAsync(async (req: Request, res: Response) => {
  const topic = req.body.topic || 'custom';
  const result = await NotificationService.sendNotificationToTopic(topic, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification sent successfully',
    data: result,
  });
});

export const NotificationController = {
  saveDeviceToken,
  sendNotification,
};
