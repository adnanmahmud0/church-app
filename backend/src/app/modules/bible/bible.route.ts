import express from 'express';
import { BibleController } from './bible.controller';

const router = express.Router();

// Public routes for mobile app
router.get('/health', BibleController.checkHealth);
router.get('/versions', BibleController.getVersions);
router.get('/books', BibleController.getBooks);
router.get('/books/:bookId/chapters', BibleController.getChapters);
router.get('/books/:bookId/chapters/:chapter', BibleController.getVerses);
router.get('/search', BibleController.searchBible);

// Admin routes (would typically be protected by admin middleware)
router.get('/settings', BibleController.getAdminSettings);
router.patch('/settings', BibleController.updateAdminSettings);
router.get('/cache-stats', BibleController.getCacheStats);
router.post('/clear-cache', BibleController.clearCache);

export const BibleRoutes = router;
