import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { SermonCategoryController } from './sermonCategory.controller';

const router = express.Router();

router.get('/', SermonCategoryController.getAllSermonCategory);
router.get('/:id', SermonCategoryController.getSermonCategoryById);

// Admin only routes
router.post(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SermonCategoryController.createSermonCategory
);

router.patch(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SermonCategoryController.updateSermonCategory
);

router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SermonCategoryController.deleteSermonCategory
);

export const SermonCategoryRoutes = router;
