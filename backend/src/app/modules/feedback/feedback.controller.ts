import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IFeedback } from './feedback.interface';
import { FeedbackService } from './feedback.service';

const createFeedback = catchAsync(async (req: Request, res: Response) => {
  const { ...feedbackData } = req.body;
  
  if (req.user) {
    feedbackData.userId = req.user.id;
  }

  const result = await FeedbackService.createFeedback(feedbackData);

  sendResponse<IFeedback>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Feedback submitted successfully',
    data: result,
  });
});

const getAllFeedbacks = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackService.getAllFeedbacks();

  sendResponse<IFeedback[]>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Feedbacks retrieved successfully',
    data: result,
  });
});

export const FeedbackController = {
  createFeedback,
  getAllFeedbacks,
};
