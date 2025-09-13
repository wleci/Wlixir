import express from 'express';
import routes from './routes/index.js';
import * as middlewares from './middlewares/index.js';

class WebServer {

    private app = express();

    constructor() {

    }

    private loadMiddlewares() {
        this.app.use(middlewares.logger);
        this.app.use(middlewares.helmet);
        this.app.use(middlewares.cors);
        this.app.use(middlewares.rateLimit);
        this.app.use(middlewares.bodyParser);
        this.app.use(middlewares.compression);
        this.app.use(middlewares.session);
        this.app.use(middlewares.csrf);
        this.app.use(middlewares.staticFiles);
    }

    private loadRoutes() {
        this.app.use(routes);
    }

    public start() {
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
