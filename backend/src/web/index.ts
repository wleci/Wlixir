import express from 'express';
import routes from './routes/index.js';
import * as middlewares from './middlewares/index.js';

class WebServer {

    private app = express();

    constructor() {

    }

    private loadMiddlewares() {
        this.app.use(middlewares.logger);
        try {
            // bodyParser accepts options
            if (typeof middlewares.bodyParser === 'function') {
                this.app.use(middlewares.bodyParser({ limitBytes: 2 * 1024 * 1024 }));
            }

            // compression returns a factory
            if (typeof middlewares.compression === 'function') {
                this.app.use(middlewares.compression());
            }

            // rateLimit is a factory
            if (typeof middlewares.rateLimit === 'function') {
                this.app.use(middlewares.rateLimit());
            }

            // session factory
            if (typeof middlewares.session === 'function') {
                this.app.use(middlewares.session());
            }
        } catch (err) {
            // if middleware factory throws during setup, log and continue
            // eslint-disable-next-line no-console
            console.error('Error initializing middleware:', err);
        }
        // SPA will be served by spaFallback middleware after all routes
    }

    private loadRoutes() {
        // Mount all Express routes first
        this.app.use(routes);

        // SPA Fallback - MUST be last! Handles 404s by serving React app
        // This will only trigger if no Express route matched
        const spaMiddlewares = middlewares.spaFallback();
        spaMiddlewares.forEach(middleware => {
            this.app.use(middleware);
        });
    } public start() {
        this.loadMiddlewares();
        this.loadRoutes();
        const host = CONFIG.WEB.hostname
        const port = CONFIG.WEB.port;
        const webBase = CONFIG.WEB.baseUrl

        this.app.listen(port, host, () => {
            console.log(`Server running at http://${host}:${port}
                  ${webBase}`);
        });
    }


}

export default WebServer;
