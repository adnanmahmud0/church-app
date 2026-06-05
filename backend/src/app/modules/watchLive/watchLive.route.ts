import express from 'express';
import { WatchLiveController } from './watchLive.controller';
import validateRequest from '../../middlewares/validateRequest';
import { WatchLiveValidation } from './watchLive.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// Public routes
router.get('/youtube/status', WatchLiveController.getYoutubeStatus);
router.get('/youtube/recent', WatchLiveController.getRecentVideos);
router.get('/youtube/channel', WatchLiveController.getChannelInfo);
router.get('/platforms', WatchLiveController.getPlatforms);
router.get('/service-info', WatchLiveController.getServiceInfo);

// Admin routes (Settings)
router.get(
  '/settings',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  WatchLiveController.getSettings
);

router.patch(
  '/settings',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(WatchLiveValidation.updateSettingsZodSchema),
  WatchLiveController.updateSettings
);

router.post(
  '/settings/test-youtube',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  WatchLiveController.testYoutubeConnection
);

// Admin routes (Platforms)
router.post(
  '/platforms',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(WatchLiveValidation.createPlatformZodSchema),
  WatchLiveController.addPlatform
);

router.patch(
  '/platforms/reorder',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(WatchLiveValidation.reorderPlatformsZodSchema),
  WatchLiveController.reorderPlatforms
);

router.patch(
  '/platforms/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(WatchLiveValidation.updatePlatformZodSchema),
  WatchLiveController.updatePlatform
);

router.delete(
  '/platforms/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  WatchLiveController.deletePlatform
);

export const WatchLiveRoutes = router;
