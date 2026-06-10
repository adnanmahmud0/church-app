import express from 'express';
import { GivingController } from './giving.controller';
import validateRequest from '../../middlewares/validateRequest';
import { GivingValidation } from './giving.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import optionalAuth from '../../middlewares/optionalAuth';

const router = express.Router();

// Public / App routes
router.get('/funds', optionalAuth, GivingController.getFunds);
router.get('/bank-details', GivingController.getBankDetails);
router.post(
  '/record',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(GivingValidation.recordTransactionZodSchema),
  GivingController.recordTransaction
);
router.get(
  '/history',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  GivingController.getHistory
);

// Admin / Dashboard routes
router.get(
  '/summary',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  GivingController.getSummary
);

router.post(
  '/funds',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(GivingValidation.createFundZodSchema),
  GivingController.createFund
);

router.patch(
  '/funds/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(GivingValidation.updateFundZodSchema),
  GivingController.updateFund
);

router.delete(
  '/funds/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  GivingController.deleteFund
);

router.patch(
  '/bank-details',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(GivingValidation.updateBankDetailsZodSchema),
  GivingController.updateBankDetails
);

export const GivingRoutes = router;
