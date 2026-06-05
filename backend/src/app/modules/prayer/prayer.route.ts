import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import optionalAuth from '../../middlewares/optionalAuth';
import validateRequest from '../../middlewares/validateRequest';
import { PrayerController } from './prayer.controller';
import { PrayerValidation } from './prayer.validation';

const router = express.Router();

router.post(
  '/requests',
  optionalAuth,
  validateRequest(PrayerValidation.createPrayerRequestZodSchema),
  PrayerController.createRequest
);

router.get(
  '/requests',
  PrayerController.getRequests
);

router.get(
  '/requests/mine',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PrayerController.getMyRequests
);

router.get(
  '/requests/stats',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PrayerController.getStats
);

router.get(
  '/requests/:id',
  PrayerController.getSingleRequest
);

router.post(
  '/requests/:id/pray',
  optionalAuth,
  validateRequest(PrayerValidation.prayForRequestZodSchema),
  PrayerController.prayForRequest
);

router.patch(
  '/requests/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(PrayerValidation.updatePrayerRequestZodSchema),
  PrayerController.updateRequest
);

router.delete(
  '/requests/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PrayerController.deleteRequest
);

export const PrayerRoutes = router;
