import { Router } from 'express';
import adminRoutes from './admin/index.js';
import apiRoutes from './api/index.js';
import authRoutes from './auth/index.js';
import dashboardRoutes from './dashboard/index.js';
import errorRoutes from './errors/index.js';
import publicRoutes from './public/index.js';

const router = Router();

// Mount routes
router.use('/admin', adminRoutes);
router.use('/api', apiRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/errors', errorRoutes);
router.use('/', publicRoutes);

export default router;
