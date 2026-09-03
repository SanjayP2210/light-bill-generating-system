import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Reads the JWT from the httpOnly cookie, verifies it, loads the user and
// attaches it to req.user. Responds 401 on any failure.
export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: 'Authentication required', isError: true });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id).select('+passwordChangedAt');

        if (!user) {
            return res.status(401).json({ message: 'Authentication required', isError: true });
        }

        if (user.wasPasswordChangedAfter(decoded.iat)) {
            return res.status(401).json({ message: 'Session expired, please log in again', isError: true });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated', isError: true });
        }

        req.user = user;
        next();
    } catch (error) {
        // Skip logging routine/expected JWT errors (missing/expired/invalid
        // token) — log anything else (e.g. a DB error) so it's visible.
        if (error?.name !== 'JsonWebTokenError' && error?.name !== 'TokenExpiredError') {
            console.error('[auth:protect]', error);
        }
        return res.status(401).json({ message: 'Authentication required', isError: true });
    }
};

// Restricts a route to the given roles, e.g. authorize('admin').
// Backend-enforced authorization; never rely on the frontend for this.
export const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied', isError: true });
    }
    next();
};
