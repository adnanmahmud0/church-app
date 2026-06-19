import express from 'express';
import { MediaController } from './media.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.post('/upload', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), upload.single('file'), MediaController.uploadMedia);
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), MediaController.getAllMedia);
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), MediaController.deleteMedia);

export const MediaRoutes = router;
