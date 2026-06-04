import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { SermonSeriesController } from './sermonSeries.controller';

const router = express.Router();

router.get('/', SermonSeriesController.getAllSermonSeries);
router.get('/:id', SermonSeriesController.getSermonSeriesById);

// Admin only routes
router.post(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SermonSeriesController.createSermonSeries
);

router.patch(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SermonSeriesController.updateSermonSeries
);

router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SermonSeriesController.deleteSermonSeries
);

export const SermonSeriesRoutes = router;
