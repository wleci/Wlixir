import { Router } from 'express';

const router = Router();

// Public Express routes only
// Static React files are now handled by spaFallback middleware

router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.get('/api-docs', (req, res) => {
    res.json({ message: 'API Documentation will be here' });
});

// Test route to verify Express has priority over React Router
router.get('/contact', (req, res) => {
    res.json({
        message: 'This is Express /contact route - Express has priority!',
        source: 'Express Server',
        timestamp: new Date().toISOString()
    });
});

// Add other public Express routes here
// React Router routes will be handled by the SPA fallback middleware

export default router;
