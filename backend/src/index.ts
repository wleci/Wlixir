// Import global CONFIG for all files
import MessageLogger from './cli/logger/index.js';
import './config';

const logger = new MessageLogger('Global');

logger.info(`Starting ${globalThis.CONFIG.APP.name} v${globalThis.CONFIG.APP.version} in ${globalThis.CONFIG.APP.mode} mode...`);
