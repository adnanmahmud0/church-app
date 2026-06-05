import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CommunityService } from './community.service';
import { USER_ROLES } from '../../../enums/user';

const getAllGroups = catchAsync(async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === USER_ROLES.SUPER_ADMIN || req.user?.role === USER_ROLES.ADMIN;
  
  const result = await CommunityService.getAllGroups(isAdmin);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Community groups retrieved successfully',
    data: result,
  });
});

const getGroupById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CommunityService.getGroupById(id);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Community group retrieved successfully',
    data: result,
  });
});

const createGroup = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityService.createGroup(req.body);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Community group created successfully',
    data: result,
  });
});

const updateGroup = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CommunityService.updateGroup(id, req.body);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Community group updated successfully',
    data: result,
  });
});

const deleteGroup = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CommunityService.deleteGroup(id);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Community group deleted successfully',
    data: result,
  });
});

const reorderGroups = catchAsync(async (req: Request, res: Response) => {
  const { items } = req.body;
  const result = await CommunityService.reorderGroups(items);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Groups reordered successfully',
    data: result,
  });
});

const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityService.getStats();
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Community stats retrieved successfully',
    data: result,
  });
});

export const CommunityController = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  reorderGroups,
  getStats,
};
