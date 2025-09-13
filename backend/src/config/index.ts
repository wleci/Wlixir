import dotenv from 'dotenv';
dotenv.config();

globalThis.CONFIG = {

    APP: {
        mode: process.env.APP_MODE || 'development',
        name: process.env.APP_NAME || 'Wlixir',
        version: process.env.APP_VERSION || '1.0.0'
    },

    WEB: {
        hostname: process.env.WEB_HOST || 'localhost',
        port: parseInt(process.env.WEB_PORT || '3000', 10),
        baseUrl: process.env.WEB_BASE_URL || "http://localhost:3000"
    }

};
