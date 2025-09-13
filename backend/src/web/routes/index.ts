import { Router } from 'express';
import adminRoutes from './admin';
import apiRoutes from './api';
import authRoutes from './auth';
import dashboardRoutes from './dashboard';
import errorRoutes from './errors';
import publicRoutes from './public';

const router = Router();

// Mount routes
router.use('/admin', adminRoutes);
router.use('/api', apiRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/errors', errorRoutes);
router.use('/', publicRoutes);

export default router;
