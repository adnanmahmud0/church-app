import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { AdminRoutes } from '../app/modules/admin/admin.route';

import { MediaRoutes } from '../app/modules/media/media.route';
import { SermonSeriesRoutes } from '../app/modules/sermonSeries/sermonSeries.route';
import { SermonRoutes } from '../app/modules/sermons/sermon.route';
import { BibleRoutes } from '../app/modules/bible/bible.route';
import { PrayerRoutes } from '../app/modules/prayer/prayer.route';
import { GivingRoutes } from '../app/modules/giving/giving.route';
import { DevotionalRoutes } from '../app/modules/devotionals/devotionals.route';
import { EventsRoutes } from '../app/modules/events/events.route';
import { CommunityRoutes } from '../app/modules/community/community.route';
import { WatchLiveRoutes } from '../app/modules/watchLive/watchLive.route';

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
  {
    path: '/bible',
    route: BibleRoutes,
  },
  {
    path: '/prayer',
    route: PrayerRoutes,
  },
  {
    path: '/giving',
    route: GivingRoutes,
  },
  {
    path: '/devotionals',
    route: DevotionalRoutes,
  },
  {
    path: '/events',
    route: EventsRoutes,
  },
  {
    path: '/community',
    route: CommunityRoutes,
  },
  {
    path: '/watch-live',
    route: WatchLiveRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
