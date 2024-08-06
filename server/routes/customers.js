import express from 'express';
import Customer from '../models/Customer.js';
import Bill from '../models/Bill.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find({ isActive: true });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get all customers
router.get('/master-list', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new customer
router.post('/', async (req, res) => {
    const {
        name,
        mobile_number,
        bill_no,
        rent_date,
        default_unit_per_rate
    } = req.body;
    const customer = new Customer({
        name,
        mobile_number,
        bill_no,
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

// Edit a customer
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name,
            mobile_number,
            bill_no,
            rent_date,
            default_unit_per_rate, isActive } = req.body;
        const updatedCustomer = await Customer.findByIdAndUpdate(
            id,
            {
                name,
                mobile_number,
                bill_no,
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


// Edit a customer
router.patch('/active-deactive-customer/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { isActive } = req.body;
        const updatedCustomer = await Customer.findByIdAndUpdate(
            id,
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


// Delete a customer
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Check if the customer is referenced in the Orders collection
        const billCount = await Bill.countDocuments({ customer_id: id });

        if (billCount > 0) {
            // Customer is referenced in Orders, so do not delete
            return res.status(200).json({
                message: 'Cannot delete customer. This customer is referenced in one or more bill.',
                isError: true
            });
        }
        const deletedCustomer = await Customer.findByIdAndDelete(id);

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
