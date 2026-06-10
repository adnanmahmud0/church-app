import express from 'express';
import { ChurchInfoController } from './churchInfo.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ChurchInfoValidation } from './churchInfo.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// Public routes
router.get('/', ChurchInfoController.getChurchInfo);
router.get('/contact-and-mission', ChurchInfoController.getContactAndMission);
router.get('/service-info', ChurchInfoController.getServiceInfo);

router.get(
  '/admin',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  ChurchInfoController.getAdminChurchInfo
);

router.put(
  '/admin',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(ChurchInfoValidation.updateChurchInfoZodSchema),
  ChurchInfoController.updateChurchInfo
);

export const ChurchInfoRoutes = router;
