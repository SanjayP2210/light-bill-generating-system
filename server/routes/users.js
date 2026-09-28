import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes here are admin-only. Listing/managing users never exposes
// another user's customer/bill data — that stays scoped by user_id
// everywhere else in the app.
router.use(protect, authorize('admin'));

router.get('/', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({
            isError: false,
            data: users.map((u) => u.toSafeObject()),
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', isError: true });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', isError: true });
        }
        res.status(200).json({ isError: false, data: user.toSafeObject() });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', isError: true });
    }
});

router.put('/:id/status', async (req, res) => {
    try {
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be true or false', isError: true });
        }
        if (String(req.user._id) === String(req.params.id) && !isActive) {
            return res.status(400).json({ message: 'You cannot deactivate your own account', isError: true });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found', isError: true });
        }
        res.status(200).json({ isError: false, message: 'User status updated', data: user.toSafeObject() });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', isError: true });
    }
});

router.put('/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Role must be "user" or "admin"', isError: true });
        }
        if (String(req.user._id) === String(req.params.id)) {
            return res.status(400).json({ message: 'You cannot change your own role', isError: true });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found', isError: true });
        }
        res.status(200).json({ isError: false, message: 'User role updated', data: user.toSafeObject() });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', isError: true });
    }
});

export default router;
