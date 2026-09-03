import express from 'express';
import Customer from '../models/Customer.js';
import Bill from '../models/Bill.js';

const router = express.Router();

// Get all active customers belonging to the authenticated user
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find({ isActive: true, user_id: req.user._id });
        res.json({
            data: customers,
            isError: false,
            message : 'customer get successfully'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get all customers (active + inactive) belonging to the authenticated user
router.get('/master-list', async (req, res) => {
    try {
        const customers = await Customer.find({ user_id: req.user._id });
        res.json({
            data: customers,
            isError: false,
            message: 'customer get successfully'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new customer, owned by the authenticated user
router.post('/', async (req, res) => {
    const {
        name,
        mobile_number,
        bill_no,
        floor_no,
        rent_date,
        default_unit_per_rate
    } = req.body;
    const customer = new Customer({
        user_id: req.user._id,
        name,
        mobile_number,
        bill_no,
        floor_no,
        rent_date,
        default_unit_per_rate,
    });

    try {
        const savedCustomer = await customer.save();
        if (savedCustomer) {
            res.status(201).json({
                data: savedCustomer,
                message: 'Customer Save Successfully',
                isError: false
            });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Edit a customer (only if it belongs to the authenticated user)
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name,
            mobile_number,
            bill_no,
            floor_no,
            rent_date,
            default_unit_per_rate, isActive } = req.body;
        const updatedCustomer = await Customer.findOneAndUpdate(
            { _id: id, user_id: req.user._id },
            {
                name,
                mobile_number,
                bill_no,
                floor_no,
                rent_date,
                default_unit_per_rate,
                isActive: isActive
            },
            { new: true } // Return the updated document
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json(updatedCustomer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Activate/Deactivate a customer (only if it belongs to the authenticated user)
router.patch('/active-deactive-customer/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { isActive } = req.body;
        const updatedCustomer = await Customer.findOneAndUpdate(
            { _id: id, user_id: req.user._id },
            {
                isActive: isActive
            },
            { new: true } // Return the updated document
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json(updatedCustomer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Delete a customer (only if it belongs to the authenticated user)
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Check if the customer is referenced in the Bills collection
        const billCount = await Bill.countDocuments({ customer_id: id, user_id: req.user._id });

        if (billCount > 0) {
            // Customer is referenced in Orders, so do not delete
            return res.status(200).json({
                message: 'Cannot delete customer. This customer is referenced in one or more bill.',
                isError: true
            });
        }
        const deletedCustomer = await Customer.findOneAndDelete({ _id: id, user_id: req.user._id });

        if (!deletedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json({
            message: 'Customer Deleted Successfully',
            isError: false
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
