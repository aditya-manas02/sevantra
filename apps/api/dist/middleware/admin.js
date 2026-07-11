"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const adminMiddleware = (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== 'PLATFORM_ADMIN') {
        return res.status(403).json({ error: 'Access denied. Platform Admin privileges required.' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
