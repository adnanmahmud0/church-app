import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { SermonService } from './sermon.service';

const createSermon = catchAsync(async (req: Request, res: Response) => {
  const result = await SermonService.createSermon(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon created successfully',
    data: result,
  });
});

const getAllSermons = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['search', 'series_id']);
  const paginationOptions = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  
  const result = await SermonService.getAllSermons(filters, paginationOptions);
  
  // Custom response format for pagination as defined in SERMONS_INTEGRATION.md
  res.status(StatusCodes.OK).json({
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Sermons retrieved successfully',
    data: {
      data: result.data,
      pagination: result.meta
    }
  });
});

const getSermonById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SermonService.getSermonById(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon detail retrieved successfully',
    data: result,
  });
});

const updateSermon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SermonService.updateSermon(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon updated successfully',
    data: result,
  });
});

const deleteSermon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SermonService.deleteSermon(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sermon deleted successfully',
    data: result,
  });
});

export const SermonController = {
  createSermon,
  getAllSermons,
  getSermonById,
  updateSermon,
  deleteSermon,
};
