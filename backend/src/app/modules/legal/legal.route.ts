import express from 'express';
import { LegalController } from './legal.controller';
import validateRequest from '../../middlewares/validateRequest';
import { LegalValidation } from './legal.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get(
  '/admin/list',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  LegalController.getAllLegalDocuments
);

router.get(
  '/admin/:type',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  LegalController.getLegalDocumentAdmin
);

router.put(
  '/:type',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(LegalValidation.upsertLegalZodSchema),
  LegalController.upsertLegalDocument
);

router.get(
  '/:type',
  LegalController.getLegalDocument
);

export const LegalRoutes = router;
