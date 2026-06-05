import express from 'express';
import { CommunityController } from './community.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CommunityValidation } from './community.validation';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import optionalAuth from '../../middlewares/optionalAuth';

const router = express.Router();

// Public / User Routes
router.get('/', optionalAuth, CommunityController.getAllGroups);
router.get('/:id', optionalAuth, CommunityController.getGroupById);

// Admin Routes
router.get('/admin/stats', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CommunityController.getStats);
router.patch('/reorder', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(CommunityValidation.reorderCommunityGroupsZodSchema), CommunityController.reorderGroups);

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(CommunityValidation.createCommunityGroupZodSchema), CommunityController.createGroup);
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(CommunityValidation.updateCommunityGroupZodSchema), CommunityController.updateGroup);
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CommunityController.deleteGroup);

export const CommunityRoutes = router;
