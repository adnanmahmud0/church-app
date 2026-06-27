import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { FeedbackController } from './feedback.controller';
import { FeedbackValidation } from './feedback.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/',
  validateRequest(FeedbackValidation.createFeedbackZodSchema),
  FeedbackController.createFeedback
);

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  FeedbackController.getAllFeedbacks
);

export const FeedbackRoutes = router;
