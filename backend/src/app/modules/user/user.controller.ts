import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

const createUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { ...userData } = req.body;
    const { user, accessToken, refreshToken } = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user;
    const image = getSingleFilePath(req.files as Partial<Record<string, File[]>> | undefined, 'image');

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const updateProfileJson = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user;
    const result = await UserService.updateProfileToDB(user, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);


const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsersFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const toggleFavoriteSermon = catchAsync(async (req: Request, res: Response) => {
  const { sermonId } = req.params;
  const user = req.user;
  const result = await UserService.toggleFavoriteSermonToDB(user, sermonId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Favorite sermon toggled successfully',
    data: result,
  });
});

const getFavoriteSermons = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await UserService.getFavoriteSermonsFromDB(user, limit);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Favorite sermons retrieved successfully',
    data: result,
  });
});

const getUserGivingSummary = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserGivingSummaryFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Giving summary retrieved successfully',
    data: result,
  });
});

const getUserGivingHistory = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const year = req.query.year ? Number(req.query.year) : undefined;

  const result = await UserService.getUserGivingHistoryFromDB(user, page, limit, year);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Giving history retrieved successfully',
    data: result.data,
    pagination: result.pagination as any,
  });
});

const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  await UserService.deleteAccountFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Account deleted successfully',
    data: null,
  });
});

export const UserController = { createUser, getUserProfile, updateProfile, updateProfileJson, getAllUsers, toggleFavoriteSermon, getFavoriteSermons, getUserGivingSummary, getUserGivingHistory, deleteAccount };
