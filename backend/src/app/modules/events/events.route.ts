import express from 'express';
import { EventsController } from './events.controller';
import validateRequest from '../../middlewares/validateRequest';
import { EventsValidation } from './events.validation';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import optionalAuth from '../../middlewares/optionalAuth';

const router = express.Router();

// Admin Routes - Categories
router.post('/categories', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(EventsValidation.createEventCategoryZodSchema), EventsController.createCategory);
router.patch('/categories/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(EventsValidation.updateEventCategoryZodSchema), EventsController.updateCategory);
router.delete('/categories/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), EventsController.deleteCategory);

// Admin Routes - Events
router.get('/admin', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), EventsController.getAdminEvents);
router.get('/stats', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), EventsController.getStats);
router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(EventsValidation.createEventZodSchema), EventsController.createEvent);
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(EventsValidation.updateEventZodSchema), EventsController.updateEvent);
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), EventsController.deleteEvent);

// Public Routes
router.get('/categories', EventsController.getCategories);
router.get('/latest', optionalAuth, EventsController.getLatestEvents);
router.get('/', optionalAuth, EventsController.getUpcomingEvents);
router.get('/history', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.GUEST), EventsController.getPastEvents);
router.get('/:id', optionalAuth, EventsController.getEventById);

// Public Auth Routes
router.post('/:id/rsvp', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.GUEST), EventsController.rsvpEvent);

export const EventsRoutes = router;
