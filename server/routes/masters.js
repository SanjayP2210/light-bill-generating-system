import express from 'express';
import MasterItem from '../models/MasterItem.js';

const router = express.Router();

const typeMap = {
    'meter-no': 'meter_no',
    'floor-no': 'floor_no',
};

// Validate the :type route param and attach the resolved internal type.
router.param('type', (req, res, next, type) => {
    const resolvedType = typeMap[type];
    if (!resolvedType) {
        return res.status(404).json({ message: 'Unknown master type', isError: true });
    }
    req.masterType = resolvedType;
    next();
});

// Get all active items of a master type belonging to the authenticated user.
// For meter-no, pass ?floor_no=<value> to only get meters that belong to that floor.
router.get('/:type', async (req, res) => {
    try {
        const filter = {
            isActive: true,
            user_id: req.user._id,
            type: req.masterType,
        };
        if (req.masterType === 'meter_no' && req.query.floor_no) {
            filter.floor_no = req.query.floor_no;
        }
        const items = await MasterItem.find(filter).sort({ value: 1 });
        res.json({
            data: items,
            isError: false,
            message: 'Master items fetched successfully',
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all items (active + inactive) of a master type belonging to the authenticated user.
// For meter-no, pass ?floor_no=<value> to only get meters that belong to that floor.
router.get('/:type/master-list', async (req, res) => {
    try {
        const filter = {
            user_id: req.user._id,
            type: req.masterType,
        };
        if (req.masterType === 'meter_no' && req.query.floor_no) {
            filter.floor_no = req.query.floor_no;
        }
        const items = await MasterItem.find(filter).sort({ floor_no: 1, value: 1 });
        res.json({
            data: items,
            isError: false,
            message: 'Master items fetched successfully',
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new master item, owned by the authenticated user
router.post('/:type', async (req, res) => {
    try {
        const { value, floor_no } = req.body;
        if (!value || !value.trim()) {
            return res.status(400).json({ message: 'Value is required', isError: true });
        }
        if (req.masterType === 'meter_no' && !floor_no) {
            return res.status(400).json({ message: 'Floor No is required', isError: true });
        }

        const duplicateFilter = {
            user_id: req.user._id,
            type: req.masterType,
            value: value.trim(),
        };
        if (req.masterType === 'meter_no') {
            duplicateFilter.floor_no = floor_no;
        }
        const existing = await MasterItem.findOne(duplicateFilter);
        if (existing) {
            return res.status(200).json({ message: 'This value already exists', isError: true });
        }

        const item = new MasterItem({
            user_id: req.user._id,
            type: req.masterType,
            value: value.trim(),
            ...(req.masterType === 'meter_no' ? { floor_no } : {}),
        });
        const savedItem = await item.save();
        res.status(201).json({
            data: savedItem,
            message: 'Saved Successfully',
            isError: false,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Edit a master item (only if it belongs to the authenticated user)
router.put('/:type/:id', async (req, res) => {
    try {
        const { value, isActive, floor_no } = req.body;
        const updates = { value: value?.trim(), isActive };
        if (req.masterType === 'meter_no' && floor_no) {
            updates.floor_no = floor_no;
        }
        const updatedItem = await MasterItem.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user._id, type: req.masterType },
            updates,
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found', isError: true });
        }

        res.json({
            data: updatedItem,
            message: 'Updated Successfully',
            isError: false,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Activate/Deactivate a master item (only if it belongs to the authenticated user)
router.patch('/:type/:id/status', async (req, res) => {
    try {
        const { isActive } = req.body;
        const updatedItem = await MasterItem.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user._id, type: req.masterType },
            { isActive },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found', isError: true });
        }

        res.json({
            data: updatedItem,
            message: 'Updated Successfully',
            isError: false,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a master item (only if it belongs to the authenticated user)
router.delete('/:type/:id', async (req, res) => {
    try {
        const deletedItem = await MasterItem.findOneAndDelete({
            _id: req.params.id,
            user_id: req.user._id,
            type: req.masterType,
        });

        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found', isError: true });
        }

        res.json({
            message: 'Deleted Successfully',
            isError: false,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
