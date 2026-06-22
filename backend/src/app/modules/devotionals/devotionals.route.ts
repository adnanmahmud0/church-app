import express from 'express';
import { DevotionalsController } from './devotionals.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { DevotionalsValidation } from './devotionals.validation';
import optionalAuth from '../../middlewares/optionalAuth';

const router = express.Router();

// Public / App routes
router.get('/', optionalAuth, DevotionalsController.getDevotionals);
router.get('/today', optionalAuth, DevotionalsController.getTodayDevotional);
router.get('/read-status', optionalAuth, DevotionalsController.getReadStatus);
router.get(
  '/profile-summary',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.GUEST),
  DevotionalsController.getProfileDevotionalSummary
);

router.get('/:id', optionalAuth, DevotionalsController.getDevotionalById);
router.post(
  '/:id/read',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.GUEST),
  DevotionalsController.markAsRead
);

// Admin routes
router.post(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(DevotionalsValidation.createDevotionalZodSchema),
  DevotionalsController.createDevotional
);

router.get(
  '/admin/stats',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  DevotionalsController.getStats
);

router.patch(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(DevotionalsValidation.updateDevotionalZodSchema),
  DevotionalsController.updateDevotional
);

router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  DevotionalsController.deleteDevotional
);

export const DevotionalRoutes = router;
