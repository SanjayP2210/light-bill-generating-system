import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import sendTokenResponse from '../utils/sendTokenResponse.js';
import sendEmail from '../utils/sendEmail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again later.', isError: true },
});

// ------------------------------------------------------------------
// Register
// ------------------------------------------------------------------
router.post('/register', async (req, res) => {
    try {
        let { name, email, password, confirmPassword } = req.body;
        name = name?.trim();
        email = email?.trim().toLowerCase();

        if (!name) {
            return res.status(400).json({ message: 'Name is required', isError: true });
        }
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ message: 'A valid email is required', isError: true });
        }
        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters', isError: true });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match', isError: true });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email is already registered', isError: true });
        }

        const user = await User.create({ name, email, password, role: 'user', isActive: true });

        sendTokenResponse(user, 201, res, 'Registration successful');
    } catch (error) {
        console.error('[auth:register]', error);
        res.status(500).json({ message: 'Something went wrong', isError: true });
    }
});

// ------------------------------------------------------------------
// Login
// ------------------------------------------------------------------
router.post('/login', loginLimiter, async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email?.trim().toLowerCase();

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required', isError: true });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password', isError: true });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password', isError: true });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated', isError: true });
        }

        sendTokenResponse(user, 200, res, 'Login successful');
    } catch (error) {
        console.error('[auth:login]', error);
        res.status(500).json({ message: 'Something went wrong', isError: true });
    }
});

// ------------------------------------------------------------------
// Logout
// ------------------------------------------------------------------
router.post('/logout', (req, res) => {
    res.cookie('token', 'none', {
        httpOnly: true,
        expires: new Date(Date.now() + 1000),
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.status(200).json({ isError: false, message: 'Logged out successfully' });
});

// ------------------------------------------------------------------
// Current user
// ------------------------------------------------------------------
router.get('/me', protect, (req, res) => {
    res.status(200).json({ isError: false, data: req.user.toSafeObject() });
});

// ------------------------------------------------------------------
// Update profile (name, phone, avatar only — email is immutable here)
// ------------------------------------------------------------------
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const update = {};
        if (name !== undefined) {
            if (!name?.trim()) {
                return res.status(400).json({ message: 'Name is required', isError: true });
            }
            update.name = name.trim();
        }
        if (phone !== undefined) update.phone = phone?.trim();

        const user = await User.findByIdAndUpdate(req.user._id, update, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ isError: false, message: 'Profile updated successfully', data: user.toSafeObject() });
    } catch (error) {
        console.error('[auth:profile]', error);
        res.status(500).json({ message: 'Something went wrong', isError: true });
    }
});

// ------------------------------------------------------------------
// Avatar upload (local disk storage — 2MB limit, images only)
// ------------------------------------------------------------------
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/avatars');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user._id}-${Date.now()}${ext}`);
    },
});

const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
});

router.put('/avatar', protect, (req, res) => {
    avatarUpload.single('avatar')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'Invalid file', isError: true });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded', isError: true });
        }
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: avatarUrl },
            { new: true }
        );
        res.status(200).json({ isError: false, message: 'Avatar updated successfully', data: user.toSafeObject() });
    });
});

// ------------------------------------------------------------------
// Change password
// ------------------------------------------------------------------
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required', isError: true });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters', isError: true });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match', isError: true });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect', isError: true });
        }

        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res, 'Password changed successfully');
    } catch (error) {
        console.error('[auth:change-password]', error);
        res.status(500).json({ message: 'Something went wrong', isError: true });
    }
});

// ------------------------------------------------------------------
// Forgot password
// ------------------------------------------------------------------
router.post('/forgot-password', async (req, res) => {
    const genericMessage = { isError: false, message: 'If an account exists, a password reset link has been sent.' };
    try {
        const email = req.body?.email?.trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ message: 'Email is required', isError: true });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json(genericMessage);
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Reset — Bill Generating System',
                text: `You requested a password reset. Use the link below (valid for 30 minutes):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
                html: `<p>You requested a password reset. This link is valid for 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, ignore this email.</p>`,
            });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Could not send reset email. Please try again later.', isError: true });
        }

        res.status(200).json(genericMessage);
    } catch (error) {
        console.error('[auth:forgot-password]', error);
        res.status(200).json(genericMessage);
    }
});

// ------------------------------------------------------------------
// Reset password
// ------------------------------------------------------------------
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters', isError: true });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match', isError: true });
        }

        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired', isError: true });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ isError: false, message: 'Password reset successfully. Please log in.' });
    } catch (error) {
        console.error('[auth:reset-password]', error);
        res.status(500).json({ message: 'Something went wrong', isError: true });
    }
});

// ------------------------------------------------------------------
// Deactivate own account (self-service — data is kept, not deleted)
// ------------------------------------------------------------------
router.put('/deactivate', protect, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.status(400).json({ message: 'Admin account cannot be deactivated', isError: true });
        }

        await User.findByIdAndUpdate(req.user._id, { isActive: false });

        res.cookie('token', 'none', {
            httpOnly: true,
            expires: new Date(Date.now() + 1000),
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });

        res.status(200).json({ isError: false, message: 'Your account has been deactivated' });
    } catch (error) {
        console.error('[auth:deactivate]', error);
        res.status(500).json({ message: 'Something went wrong', isError: true });
    }
});

export default router;
