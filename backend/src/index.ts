import './config/index.js';
import MessageLogger from './cli/logger/index.js';
import WebServer from './web/index.js';
const logger = new MessageLogger('Menu');

const startApp = async () => {
    const webServer = new WebServer();
    webServer.start();
    try {
        logger.success(`Starting ${globalThis.CONFIG.APP.name} v${globalThis.CONFIG.APP.version} in ${globalThis.CONFIG.APP.mode} mode...`);
    } catch (error) {
        logger.error('Error starting the application:', error);
    }

};

startApp();
