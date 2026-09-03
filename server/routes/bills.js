import express from 'express';
import Bill from '../models/Bill.js';
import PDFDocument from 'pdfkit';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pdfkit-table';
import Customer from '../models/Customer.js';

const { Table } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

function convertToDate(dateStr) {
    if (typeof dateStr === 'string') {
        if (dateStr.includes('T')) {
            return new Date(dateStr);
        } else {
            const [day, month, year] = dateStr.split('/').map(Number);
            return new Date(year, month - 1, day);
        }
    }else{
        return dateStr;
    }
}

const updateLastBillOfCustomer = async (customer_id, user_id) => {
    try {
        const lastBill = await Bill.findOne({ customer_id, user_id }).sort({ _id: -1 });
        const last_bill_unit = lastBill?.current_unit || 0;
        const updatedCustomer = await Customer.findOneAndUpdate(
            { _id: customer_id, user_id },
            { last_bill_unit: last_bill_unit },
            { new: true }
        );
        return updatedCustomer ? true : false;
    } catch (error) {
        console.error('Error updating customer:', error);
        return false;
    }
};

// Get all bills belonging to the authenticated user
router.get('/', async (req, res) => {
    try {
        const bills = await Bill.find({ user_id: req.user._id }).populate('customer_id', 'name bill_no').sort({ date: -1 }).exec();
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new bill (customer ownership is verified before creating)
router.post('/', async (req, res) => {
    const {
        customer_id,
        current_unit,
        prev_unit,
        unit_per_rate,
        total_price,
        used_unit,
        extra_unit,
        comments,
        date
    } = req.body;

    try {
        const customer = await Customer.findOne({ _id: customer_id, user_id: req.user._id });
        if (!customer) {
            return res.status(403).json({
                message: 'Selected customer was not found in your account',
                data: null,
                isError: true
            });
        }

        const bill = new Bill({
            user_id: req.user._id,
            customer_id,
            unit_per_rate,
            current_unit: current_unit ? parseFloat(current_unit).toFixed(2) : current_unit,
            prev_unit: prev_unit ? parseFloat(prev_unit).toFixed(2) : prev_unit,
            total_price: total_price ? parseFloat(total_price).toFixed(2) : total_price,
            used_unit: used_unit ? parseFloat(used_unit).toFixed(2) : used_unit,
            extra_unit: extra_unit ? parseFloat(extra_unit).toFixed(2) : extra_unit,
            comments,
            date: date ? convertToDate(date) : date,
        });

        const savedBill = await bill.save();
        const updatedCustomer = await updateLastBillOfCustomer(customer_id, req.user._id);
        if (updatedCustomer) {
            res.json({
                message: 'New Litebill saved and Customer updated successfully!',
                data: savedBill,
                isError: false
            });
        } else {
            res.status(500).json({
                message: 'Error while saving new bill!',
                data: null,
                isError: true
            });
        }
    } catch (err) {
        res.status(500).json({
            message: `Error while saving new bill: ${err.message}`,
            data: null,
            isError: true
        });
    }
});

// Update an existing bill (only if it belongs to the authenticated user)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        current_unit,
        prev_unit,
        unit_per_rate,
        total_price,
        used_unit,
        extra_unit,
        comments,
        date
    } = req.body;

    try {
        const bill = await Bill.findOne({ _id: id, user_id: req.user._id });
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        bill.unit_per_rate = unit_per_rate;
        bill.current_unit = current_unit ? parseFloat(current_unit).toFixed(2) : current_unit;
        bill.prev_unit = prev_unit ? parseFloat(prev_unit).toFixed(2) : prev_unit;
        bill.total_price = total_price ? parseFloat(total_price).toFixed(2) : total_price;
        bill.used_unit = used_unit ? parseFloat(used_unit).toFixed(2) : used_unit;
        bill.extra_unit = extra_unit ? parseFloat(extra_unit).toFixed(2) : extra_unit;
        bill.comments = comments;
        bill.date = date ? convertToDate(date) : bill.date;

        const updatedBill = await bill.save();
        const updatedCustomer = await updateLastBillOfCustomer(bill.customer_id, req.user._id);
        if (updatedCustomer) {
            res.json({
                message: 'Bill updated and Customer updated successfully!',
                data: updatedBill,
                isError: false
            });
        } else {
            res.status(500).json({
                message: 'Error while updating bill!',
                data: null,
                isError: true
            });
        }
    } catch (err) {
        res.status(500).json({
            message: `Error while updating bill: ${err.message}`,
            data: null,
            isError: true
        });
    }
});

// Get bills by customer ID (scoped to the authenticated user)
router.get('/get-bill-by-customer-id/', async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'asc', customer_id = "" } = req.query;

        const sortQuery = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const filter = { customer_id, user_id: req.user._id };
        const bills = await Bill.find(filter).populate('customer_id', 'name bill_no')
            .sort(sortQuery).limit(limit * 1)
            .skip((page - 1) * limit).exec();
        const count = await Bill.countDocuments(filter);
        res.json({
            data: bills,
            message: 'Bills retrieved successfully',
            isError: false,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Format date for PDF
const formatDate = (date) => {
    const options = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

// Generate PDF with table
const generateTableForPDF = async (bills, filePath) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    const data = bills.map(bill => [
        bill.customer_id.name,
        bill.current_unit,
        bill.prev_unit,
        bill.unit_per_rate,
        bill.total_price,
        formatDate(new Date(bill.date))
    ]);

    const tableData = {
        headers: ['Customer', 'Current Unit', 'Previous Unit', 'Unit Per Rate', 'Total Price', 'Date'],
        rows: data
    };

    const table = new Table(doc, {
        width: 500,
        padding: 5,
        columns: [100, 100, 100, 100, 100, 100]
    });

    table.add(tableData);
    table.draw();

    doc.end();
};

// Generate PDF for all bills belonging to the authenticated user
router.get('/generate-pdf', async (req, res) => {
    try {
        const bills = await Bill.find({ user_id: req.user._id }).populate('customer_id');
        const filePath = path.join(__dirname, '../files/bills.pdf');

        await generateTableForPDF(bills, filePath);

        res.download(filePath, (err) => {
            if (err) {
                res.status(500).json({ message: 'Error while downloading the file.', err });
            } else {
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                });
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error generating PDF: ' + err.message });
    }
});

// Generate PDF for a specific bill by ID (only if it belongs to the authenticated user)
router.get('/generate-pdf-by-lite-bill/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const bills = await Bill.find({ _id: id, user_id: req.user._id }).populate('customer_id');
        if (bills.length === 0) {
            return res.status(404).json({ message: 'No bills found with the provided ID.' });
        }

        const filePath = path.join(__dirname, '../files/bills.pdf');

        await generateTableForPDF(bills, filePath);

        res.download(filePath, (err) => {
            if (err) {
                res.status(500).json({ message: 'Error while downloading the file.', err });
            } else {
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                });
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error generating PDF: ' + err.message });
    }
});

// Get the last bill for a customer (scoped to the authenticated user)
router.get('/get-last-bill/:customer_id', async (req, res) => {
    try {
        const customer_id = req.params.customer_id;
        const lastBill = await Bill.findOne({ customer_id, user_id: req.user._id }).sort({ _id: -1 });
        if (lastBill) {
            res.json({
                data: lastBill,
                message: 'Bill retrieved successfully',
                isError: false
            });
        } else {
            res.status(404).json({
                data: [],
                message: 'No bill found for this customer. Please create a new bill',
                isError: true
            });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving last bill: ' + err.message });
    }
});

// Handle Excel file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.post('/upload-excel', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);

    const sheetNames = workbook.SheetNames;
    const parsedRows = [];

    sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        data.forEach((row, index) => {
            if (index === 0) return; // Skip header row
            const [
                customer_id,
                current_unit,
                prev_unit,
                unit_per_rate,
                total_price,
                used_unit,
                extra_unit,
                comments,
                date
            ] = row;

            parsedRows.push({
                customer_id,
                current_unit,
                prev_unit,
                unit_per_rate,
                total_price,
                used_unit,
                extra_unit,
                comments,
                date: convertToDate(date)
            });
        });
    });

    try {
        // Only rows whose customer actually belongs to the authenticated user are imported —
        // uploaded data can never assign bills to another user's customer.
        const requestedCustomerIds = [...new Set(parsedRows.map((row) => String(row.customer_id)))];
        const ownedCustomers = await Customer.find({
            _id: { $in: requestedCustomerIds },
            user_id: req.user._id,
        }).select('_id');
        const ownedIds = new Set(ownedCustomers.map((c) => String(c._id)));

        const bills = parsedRows
            .filter((row) => ownedIds.has(String(row.customer_id)))
            .map((row) => ({ ...row, user_id: req.user._id }));

        const savedBills = await Bill.insertMany(bills);
        res.json({ message: 'Excel file data inserted successfully!', data: savedBills });
    } catch (err) {
        res.status(500).json({ message: 'Error inserting data from Excel file: ' + err.message });
    } finally {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    }
});

// Delete a Bill (only if it belongs to the authenticated user)
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedBill = await Bill.findOneAndDelete({ _id: id, user_id: req.user._id });
        if (!deletedBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        const updtedCustomer = await updateLastBillOfCustomer(deletedBill.customer_id, req.user._id);
        if (updtedCustomer) {
            res.json({
                message: 'Bill Deleted Successfully',
                isError: false
            });
        } else {
            res.json({
                message: 'Error while save new bill!',
                data: null,
                isError: true
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
