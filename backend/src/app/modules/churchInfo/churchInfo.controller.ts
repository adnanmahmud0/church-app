import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ChurchInfoService } from './churchInfo.service';

const getChurchInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await ChurchInfoService.getChurchInfo();
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Church info retrieved successfully',
    data: { content: result.content },
  });
});

const updateChurchInfo = catchAsync(async (req: Request, res: Response) => {
  // Try to use email if available, otherwise name, fallback to "Admin"
  const adminName = req.user?.email || req.user?.name || 'Admin';
  
  const result = await ChurchInfoService.updateChurchInfo(req.body, adminName);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Church info updated successfully',
    data: result,
  });
});

export const ChurchInfoController = {
  getChurchInfo,
  updateChurchInfo,
};
