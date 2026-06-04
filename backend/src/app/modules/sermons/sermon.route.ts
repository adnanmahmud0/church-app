import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { SermonController } from './sermon.controller';

const router = express.Router();

router.get('/', SermonController.getAllSermons);
router.get('/:id', SermonController.getSermonById);

// Admin only routes
router.post(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SermonController.createSermon
);

router.patch(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SermonController.updateSermon
);

router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SermonController.deleteSermon
);

export const SermonRoutes = router;
