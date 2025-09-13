import type { RequestHandler } from 'express';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SPA Fallback Middleware
 *
 * This middleware should be mounted LAST in the middleware chain.
 * It serves static files from React build and provides fallback to index.html
 * ONLY for routes that don't match any existing Express routes.
 *
 * This ensures:
 * - Express routes have absolute priority
 * - 404 errors from Express routes fall back to React Router
 * - Static assets (CSS, JS, images) are served correctly
 */
const createSpaFallback = (): RequestHandler[] => {
    const frontendDistPath = path.join(process.cwd(), '..', 'frontend', 'dist');
    const indexHtmlPath = path.join(frontendDistPath, 'index.html');

    // First middleware: serve static files (CSS, JS, images, etc.)
    const staticFiles = express.static(frontendDistPath, {
        // Don't serve index.html automatically for directory requests
        index: false,
        // Add cache headers for static assets in production
        maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0
    });

    // Second middleware: 404 fallback to React Router
    const spa404Fallback: RequestHandler = (req, res, next) => {
        // Only handle GET requests
        if (req.method !== 'GET') {
            return res.status(404).json({ error: 'Not Found' });
        }

        // Skip if request is for API routes - these should return proper API errors
        const url = req.url || req.path || '';
        if (
            url.startsWith('/api/') ||
            url.startsWith('/auth/') ||
            url.startsWith('/admin/') ||
            url.startsWith('/dashboard/') ||
            url.startsWith('/health')
        ) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }

        // Skip if request has file extension (static files that don't exist)
        if (url.includes('.') && !url.endsWith('/')) {
            return res.status(404).send('File not found');
        }

        // Check if Accept header indicates HTML request
        const acceptsHtml = req.accepts('html');
        if (!acceptsHtml) {
            return res.status(404).json({ error: 'Not Found' });
        }

        console.log(`SPA Fallback: Serving React app for route: ${url}`);

        // Serve React index.html for HTML requests to unknown routes
        res.sendFile(indexHtmlPath, (err) => {
            if (err) {
                console.error('Error serving React index.html:', err);
                res.status(500).send('Internal Server Error');
            }
        });
    };

    return [staticFiles, spa404Fallback];
};

export default createSpaFallback;
