import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SermonSeriesService } from './sermonSeries.service';

const createSermonSeries = catchAsync(async (req: Request, res: Response) => {
  const result = await SermonSeriesService.createSermonSeries(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon Series created successfully',
    data: result,
  });
});

const getAllSermonSeries = catchAsync(async (req: Request, res: Response) => {
  const result = await SermonSeriesService.getAllSermonSeries();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon series retrieved successfully',
    data: result,
  });
});

const getSermonSeriesById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SermonSeriesService.getSermonSeriesById(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon Series retrieved successfully',
    data: result,
  });
});

const updateSermonSeries = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SermonSeriesService.updateSermonSeries(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon Series updated successfully',
    data: result,
  });
});

const deleteSermonSeries = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SermonSeriesService.deleteSermonSeries(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon Series deleted successfully',
    data: result,
  });
});

export const SermonSeriesController = {
  createSermonSeries,
  getAllSermonSeries,
  getSermonSeriesById,
  updateSermonSeries,
  deleteSermonSeries,
};
