import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BibleService } from './bible.service';

const getBooks = catchAsync(async (req: Request, res: Response) => {
  const versionId = parseInt(req.query.version as string, 10) || 1;
  const versionMeta = await BibleService.getVersionMetadata(versionId);
  const result = await BibleService.getBooks(versionId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Books retrieved successfully',
    meta: { version: versionMeta },
    data: result,
  });
});

const getChapters = catchAsync(async (req: Request, res: Response) => {
  const versionId = parseInt(req.query.version as string, 10) || 1;
  const versionMeta = await BibleService.getVersionMetadata(versionId);
  const { bookId } = req.params;
  const result = await BibleService.getChapters(versionId, bookId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Chapters retrieved successfully',
    meta: { version: versionMeta },
    data: result,
  });
});

const getVerses = catchAsync(async (req: Request, res: Response) => {
  const versionId = parseInt(req.query.version as string, 10) || 1;
  const versionMeta = await BibleService.getVersionMetadata(versionId);
  const { bookId, chapter } = req.params;
  const result = await BibleService.getVerses(versionId, bookId, chapter);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Verses retrieved successfully',
    meta: { version: versionMeta },
    data: result,
  });
});

const getVersions = catchAsync(async (req: Request, res: Response) => {
  const result = await BibleService.getVersions();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Versions retrieved successfully',
    data: result,
  });
});

const searchBible = catchAsync(async (req: Request, res: Response) => {
  const versionId = parseInt(req.query.version as string, 10) || 1;
  const versionMeta = await BibleService.getVersionMetadata(versionId);
  const query = req.query.q as string;
  const result = await BibleService.searchBible(versionId, query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Search completed successfully',
    meta: { version: versionMeta },
    data: result,
  });
});

const checkHealth = catchAsync(async (req: Request, res: Response) => {
  const result = await BibleService.checkHealth();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Health check completed',
    data: result,
  });
});

// Admin Controllers
const getAdminSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await BibleService.getAdminSettings();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin settings retrieved successfully',
    data: result,
  });
});

const updateAdminSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await BibleService.updateAdminSettings(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin settings updated successfully',
    data: result,
  });
});

const getCacheStats = catchAsync(async (req: Request, res: Response) => {
  const result = await BibleService.getCacheStats();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cache stats retrieved successfully',
    data: result,
  });
});

const clearCache = catchAsync(async (req: Request, res: Response) => {
  const result = await BibleService.clearCache();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cache cleared successfully',
    data: result,
  });
});

const testVersionAccess = catchAsync(async (req: Request, res: Response) => {
  const versionId = parseInt(req.params.versionId as string, 10);
  const result = await BibleService.testVersionAccess(versionId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Version access check completed',
    data: result,
  });
});

export const BibleController = {
  getBooks,
  getChapters,
  getVerses,
  getVersions,
  searchBible,
  checkHealth,
  getAdminSettings,
  updateAdminSettings,
  getCacheStats,
  clearCache,
  testVersionAccess,
};
