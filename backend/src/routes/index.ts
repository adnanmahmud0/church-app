import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { AdminRoutes } from '../app/modules/admin/admin.route';
import { MediaRoutes } from '../app/modules/media/media.route';
import { SermonSeriesRoutes } from '../app/modules/sermonSeries/sermonSeries.route';
import { SermonRoutes } from '../app/modules/sermons/sermon.route';

const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/media',
    route: MediaRoutes,
  },
  {
    path: '/sermon-series',
    route: SermonSeriesRoutes,
  },
  {
    path: '/sermons',
    route: SermonRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
