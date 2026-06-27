import { IFeedback } from './feedback.interface';
import { Feedback } from './feedback.model';

const createFeedback = async (payload: IFeedback): Promise<IFeedback> => {
  const result = await Feedback.create(payload);
  return result;
};

const getAllFeedbacks = async (): Promise<IFeedback[]> => {
  const result = await Feedback.find().sort({ createdAt: -1 }).populate('userId');
  return result;
};

export const FeedbackService = {
  createFeedback,
  getAllFeedbacks,
};
