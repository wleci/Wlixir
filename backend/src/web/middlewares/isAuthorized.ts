import type { RequestHandler } from 'express';

const isAuthorized: RequestHandler = (req, res, next) => {
    // placeholder: allow all for now
    next();
};

export default isAuthorized;
