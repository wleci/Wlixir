import morgan from 'morgan';

const env = (globalThis.CONFIG && globalThis.CONFIG.APP && globalThis.CONFIG.APP.mode) || 'development';
const logger = env === 'development' ? morgan('dev') : morgan('combined');

export default logger;
