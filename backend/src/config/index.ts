import dotenv from 'dotenv';
dotenv.config();

globalThis.CONFIG = {

    APP: {
        mode: process.env.APP_MODE || 'development',
        name: process.env.APP_NAME || 'Wlixir',
        version: process.env.APP_VERSION || '1.0.0'
    }

};
