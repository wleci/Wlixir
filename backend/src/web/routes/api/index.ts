import { Router } from 'express';
import v1Routes from './v1/index.js';

const router = Router();

// Mount v1 routes
router.use('/v1', v1Routes);

// Add other API routes here

export default router;
