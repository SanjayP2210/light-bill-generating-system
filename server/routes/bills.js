import express from 'express';
import Bill from '../models/Bill.js';
import multer from 'multer';
import xlsx from 'xlsx';
// pdfkit-table's default export is a PDFDocument subclass that adds doc.table().
import PDFDocument from 'pdfkit-table';
import Customer from '../models/Customer.js';

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
        const lastBill = await Bill.findOne({ customer_id, user_id })
            .sort({ _id: -1 })
            .select('current_unit')
            .lean();
        const last_bill_unit = lastBill?.current_unit || 0;
        const result = await Customer.updateOne(
            { _id: customer_id, user_id },
            { last_bill_unit: last_bill_unit }
        );
        return result.matchedCount > 0;
    } catch (error) {
        console.error('Error updating customer:', error);
        return false;
    }
};

// Get all bills belonging to the authenticated user
router.get('/', async (req, res) => {
    try {
        const bills = await Bill.find({ user_id: req.user._id })
            .populate('customer_id', 'name bill_no')
            .sort({ date: -1 })
            .lean();
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
        const customer = await Customer.exists({ _id: customer_id, user_id: req.user._id });
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

const SORTABLE_BILL_FIELDS = new Set(['date', 'current_unit', 'prev_unit', 'total_price', 'used_unit', '_id']);

// Get bills by customer ID (scoped to the authenticated user)
router.get('/get-bill-by-customer-id/', async (req, res) => {
    try {
        const { sortBy = 'date', sortOrder = 'asc', customer_id = "" } = req.query;
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 500);

        const sortField = SORTABLE_BILL_FIELDS.has(sortBy) ? sortBy : 'date';
        const sortQuery = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
        const filter = { customer_id, user_id: req.user._id };

        // The page and the total count are independent — run them in parallel.
        const [bills, count] = await Promise.all([
            Bill.find(filter)
                .populate('customer_id', 'name bill_no')
                .sort(sortQuery)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Bill.countDocuments(filter),
        ]);

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

// Builds the bills table PDF in memory and streams it straight to the
// response. Nothing is written to disk (Vercel's filesystem is read-only,
// and a shared file path would mix up concurrent downloads).
const sendBillsPdf = async (res, bills, fileName) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    doc.pipe(res);

    const rows = bills.map(bill => [
        bill.customer_id?.name ?? '',
        String(bill.current_unit ?? ''),
        String(bill.prev_unit ?? ''),
        String(bill.unit_per_rate ?? ''),
        String(bill.total_price ?? ''),
        bill.date ? formatDate(new Date(bill.date)) : '',
    ]);

    await doc.table(
        {
            headers: ['Customer', 'Current Unit', 'Previous Unit', 'Unit Per Rate', 'Total Price', 'Date'],
            rows,
        },
        { width: 535, columnsSize: [110, 80, 80, 80, 80, 105] }
    );

    doc.end();
};

// Generate PDF for all bills belonging to the authenticated user
router.get('/generate-pdf', async (req, res) => {
    try {
        const bills = await Bill.find({ user_id: req.user._id })
            .populate('customer_id', 'name')
            .sort({ date: -1 })
            .lean();
        await sendBillsPdf(res, bills, 'bills.pdf');
    } catch (err) {
        console.error('[bills:generate-pdf]', err);
        if (!res.headersSent) res.status(500).json({ message: 'Error generating PDF: ' + err.message });
        else res.end();
    }
});

// Generate PDF for a specific bill by ID (only if it belongs to the authenticated user)
router.get('/generate-pdf-by-lite-bill/:id', async (req, res) => {
    try {
        const bills = await Bill.find({ _id: req.params.id, user_id: req.user._id })
            .populate('customer_id', 'name')
            .lean();
        if (bills.length === 0) {
            return res.status(404).json({ message: 'No bills found with the provided ID.' });
        }
        await sendBillsPdf(res, bills, 'bill.pdf');
    } catch (err) {
        console.error('[bills:generate-pdf-by-lite-bill]', err);
        if (!res.headersSent) res.status(500).json({ message: 'Error generating PDF: ' + err.message });
        else res.end();
    }
});

// Get the last bill for a customer (scoped to the authenticated user)
router.get('/get-last-bill/:customer_id', async (req, res) => {
    try {
        const customer_id = req.params.customer_id;
        const lastBill = await Bill.findOne({ customer_id, user_id: req.user._id }).sort({ _id: -1 }).lean();
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

// Excel uploads are parsed from memory — no temp files on disk.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/upload-excel', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'Invalid file', isError: true });
        }
        next();
    });
}, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const parsedRows = [];

        workbook.SheetNames.forEach(sheetName => {
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

        // Only rows whose customer actually belongs to the authenticated user are imported —
        // uploaded data can never assign bills to another user's customer.
        const requestedCustomerIds = [...new Set(parsedRows.map((row) => String(row.customer_id)))];
        const ownedCustomers = await Customer.find({
            _id: { $in: requestedCustomerIds },
            user_id: req.user._id,
        }).select('_id').lean();
        const ownedIds = new Set(ownedCustomers.map((c) => String(c._id)));

        const bills = parsedRows
            .filter((row) => ownedIds.has(String(row.customer_id)))
            .map((row) => ({ ...row, user_id: req.user._id }));

        const savedBills = await Bill.insertMany(bills);

        // Keep each affected customer's last_bill_unit in sync, in parallel.
        const affectedCustomerIds = [...new Set(bills.map((b) => String(b.customer_id)))];
        await Promise.all(affectedCustomerIds.map((id) => updateLastBillOfCustomer(id, req.user._id)));

        res.json({ message: 'Excel file data inserted successfully!', data: savedBills });
    } catch (err) {
        res.status(500).json({ message: 'Error inserting data from Excel file: ' + err.message });
    }
});

// Delete a Bill (only if it belongs to the authenticated user)
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedBill = await Bill.findOneAndDelete({ _id: id, user_id: req.user._id }).select('customer_id').lean();
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
