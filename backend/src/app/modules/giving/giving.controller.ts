import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { GivingService } from './giving.service';

const getFunds = catchAsync(async (req: Request, res: Response) => {
  const isAdmin = req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN');
  const activeOnly = !isAdmin; // Admins see all funds, regular users see only active

  const result = await GivingService.getFunds(activeOnly);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Funds retrieved successfully',
    data: result,
  });
});

const createFund = catchAsync(async (req: Request, res: Response) => {
  const result = await GivingService.createFund(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Fund created successfully',
    data: result,
  });
});

const updateFund = catchAsync(async (req: Request, res: Response) => {
  const result = await GivingService.updateFund(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Fund updated successfully',
    data: result,
  });
});

const deleteFund = catchAsync(async (req: Request, res: Response) => {
  const result = await GivingService.deleteFund(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Fund deleted successfully',
    data: result,
  });
});

const getBankDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await GivingService.getBankDetails();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Bank details retrieved successfully',
    data: result,
  });
});

const updateBankDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await GivingService.updateBankDetails(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Bank details updated successfully',
    data: result,
  });
});

const recordTransaction = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
    req.body.userId = req.user.id;
  }
  const result = await GivingService.recordTransaction(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Transaction recorded successfully',
    data: result,
  });
});

const getHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { year } = req.query;
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'User is not authenticated',
      data: null,
    });
  }

  const result = await GivingService.getHistory(userId as string, year as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Giving history retrieved successfully',
    data: result,
  });
});

const getSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await GivingService.getSummary();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Giving summary retrieved successfully',
    data: result,
  });
});

const getTotalThisYear = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'User is not authenticated',
      data: null,
    });
  }

  const result = await GivingService.getTotalThisYear(userId as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Total giving this year retrieved successfully',
    data: result,
  });
});

const getProfileGivingSummary = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'User is not authenticated',
      data: null,
    });
  }

  const result = await GivingService.getProfileGivingSummary(userId as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile giving summary retrieved successfully',
    data: result,
  });
});

const deleteTransaction = catchAsync(async (req: Request, res: Response) => {
  const result = await GivingService.deleteTransaction(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Transaction deleted successfully',
    data: result,
  });
});

export const GivingController = {
  getFunds,
  createFund,
  updateFund,
  deleteFund,
  getBankDetails,
  updateBankDetails,
  recordTransaction,
  getHistory,
  getSummary,
  getTotalThisYear,
  getProfileGivingSummary,
  deleteTransaction,
};
