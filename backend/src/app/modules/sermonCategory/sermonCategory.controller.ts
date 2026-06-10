import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SermonCategoryService } from './sermonCategory.service';

const createSermonCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SermonCategoryService.createSermonCategory(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon Category created successfully',
    data: result,
  });
});

const getAllSermonCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SermonCategoryService.getAllSermonCategory();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon category retrieved successfully',
    data: result,
  });
});

const getSermonCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SermonCategoryService.getSermonCategoryById(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon Category retrieved successfully',
    data: result,
  });
});

const updateSermonCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SermonCategoryService.updateSermonCategory(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon Category updated successfully',
    data: result,
  });
});

const deleteSermonCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SermonCategoryService.deleteSermonCategory(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon Category deleted successfully',
    data: result,
  });
});

export const SermonCategoryController = {
  createSermonCategory,
  getAllSermonCategory,
  getSermonCategoryById,
  updateSermonCategory,
  deleteSermonCategory,
};
