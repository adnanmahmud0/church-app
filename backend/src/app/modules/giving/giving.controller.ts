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
  const result = await GivingService.recordTransaction(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Transaction recorded successfully',
    data: result,
  });
});

const getHistory = catchAsync(async (req: Request, res: Response) => {
  const { userId, year } = req.query;
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'userId is required',
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
};
