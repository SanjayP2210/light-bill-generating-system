import express from 'express';
import Bill from '../models/Bill.js';
import PDFDocument from 'pdfkit';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
import pkg from 'pdfkit-table';
import customer from '../models/Customer.js';
const { Table } = pkg;

function convertToDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number); // Split string and convert to numbers
    // Note: JavaScript months are 0-based (0 = January, 11 = December)
    return new Date(year, month - 1, day); // Create a new Date object
}

// Get all bills
router.get('/', async (req, res) => {
    try {
        const bills = await Bill.find().populate('customer_id', 'name bill_no').sort({ date: -1 }).exec();
        res.json(bills);
    } catch (err) {
        res.json({ message: err });
    }
});

// Add a new bill
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
    const bill = new Bill({
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

    try {
        const savedBill = await bill.save();
        if (savedBill) {
           const updtedCustomer =  await customer.findByIdAndUpdate(
               customer_id,
                { last_bill_unit: current_unit },
                { new: true }
            );
            if (updtedCustomer) {
                res.json({
                    message: 'New Litebill saved and Customer updated successfully!',
                    data: savedBill,
                    isError : false
                });
            }
        } else {
            res.json({
                message: 'Error while save new bill!',
                data: null,
                isError: true
            });
        }
    } catch (err) {
        res.json({
            message: `Error while save new bill! ${err}`,
            data: null,
            isError: true
        });
    }
});

// Update an existing bill
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
        const bill = await Bill.findById(id);

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
        bill.date = date ? new Date(date) : '';

        const updatedBill = await bill.save();

        if (updatedBill) {
            const lastBill = await Bill.findOne({ customer_id: bill?.customer_id }).sort({ _id: -1 });
            if (lastBill) { 
                const updtedCustomer =  await customer.findByIdAndUpdate(
                    bill?.customer_id,
                    { last_bill_unit: lastBill?.current_unit },
                     { new: true }
                 );
                 if (updtedCustomer) {
                     res.json({
                         message: 'Litebill updated and Customer updated successfully!',
                         data: updatedBill,
                         isError : false
                     });
                 }
            }
        } else {
            res.json({
                message: 'Error while save new bill!',
                data: null,
                isError: true
            });
        }
    } catch (err) {
        res.json({
            message: `Error while save new bill! ${err.message}`,
            data: null,
            isError: true
        });
    }
});

router.get('/get-bill-by-customer-id/:customer_id', async (req, res) => {
    try {
        const customer_id = req.params.customer_id;
        console.log('customer_id', customer_id);
        const lastBill = await Bill.find({ customer_id }).populate('customer_id', 'name bill_no').sort({ date: -1 }).exec();
        if (lastBill) {
            res.json({
                data: lastBill,
                message: 'Bill Get Successfully',
                isError: false
            });
        } else {
            res.json({
                data: [],
                message: 'No Bill Found For This Customer. Please Create New Bill',
                isError: true
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const formatDate = (date) => {
    const options = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

// Generate PDF
const generateTableForPDf = async (bills, filePath) => {
    const doc = new PDFDocument();

    // Pipe the PDF into the response
    // doc.pipe(res);
    doc.pipe(fs.createWriteStream(filePath));
    const data = bills.map((bill, index) => {
        const {
            current_unit,
            prev_unit,
            unit_per_rate,
            total_price,
            used_unit,
            extra_unit,
            comments,
            date
        } = bill;
        return [
            current_unit,
            prev_unit,
            unit_per_rate,
            total_price,
            used_unit,
            extra_unit,
            comments,
            date
        ]
    })
    // Define table data
    console.log('data', data);
    const tableData = {
        headers: ['Customer', 'Current Unit', 'Previous Unit', 'Unit Per Rate', 'Total Price', 'Date'],
        rows: data
    };

    const table = new Table(doc, {
        width: 500, // Table width
        padding: 5, // Cell padding
        columns: [150, 150, 150] // Column widths
    });

    table.add(tableData);
    table.draw();

    // Finalize the PDF and end the stream
    doc.end();
}

// Function to create PDF
const createPDF = async (bills, filePath) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    // Title
    doc.fontSize(18).text('Bills', { align: 'center' });
    doc.moveDown();

    // Table Header
    doc.fontSize(12).font('Helvetica-Bold');
    const tableHeader = ['Customer', 'Current Unit', 'Previous Unit', 'Unit Per Rate', 'Total Price', 'Date'];
    const tableWidth = doc.page.width - 72 * 2; // Page width minus margins
    const columnWidth = tableWidth / tableHeader.length;
    const startX = 72; // X position of the table
    const startY = 100; // Y position of the table

    // Draw table header
    tableHeader.forEach((header, i) => {
        doc.text(header, startX + i * columnWidth, startY, { width: columnWidth, align: 'center' });
    });
    doc.moveDown();

    // Draw header border
    doc.strokeColor('black').lineWidth(1)
        .rect(startX, startY - 10, tableWidth, 20) // Header border
        .stroke();

    // Draw column borders
    for (let i = 1; i < tableHeader.length; i++) {
        doc.moveTo(startX + i * columnWidth, startY - 10)
            .lineTo(startX + i * columnWidth, startY + 10)
            .stroke();
    }

    // Draw table rows and borders
    doc.font('Helvetica');
    const rows = 10; // Number of rows (adjust as needed)
    const rowHeight = 20;
    bills.forEach((bill, index) => {
        const yPos = startY + 20 + index * rowHeight; // Position for each row
        doc.text(bill.customer_id.name || 'N/A', 72, 120 + index * 20, { width: columnWidth, align: 'center' });
        doc.text(bill.current_unit || 'N/A', 72 + columnWidth, 120 + index * 20, { width: columnWidth, align: 'center' });
        doc.text(bill.prev_unit || 'N/A', 72 + columnWidth * 2, 120 + index * 20, { width: columnWidth, align: 'center' });
        doc.text(bill.unit_per_rate || 'N/A', 72 + columnWidth * 3, 120 + index * 20, { width: columnWidth, align: 'center' });
        doc.text(bill.total_price || 'N/A', 72 + columnWidth * 4, 120 + index * 20, { width: columnWidth, align: 'center' });
        doc.text(formatDate(new Date(bill.date), 'MMM dd hh:mm a') || 'N/A', 72 + columnWidth * 5, 120 + index * 20, { width: columnWidth, align: 'center' });
        // Draw row border
        doc.strokeColor('black').lineWidth(1)
            .rect(startX, yPos - rowHeight + 2, tableWidth, rowHeight) // Row border
            .stroke();

        // Draw vertical column border for the last row
        if (index === rows - 1) {
            doc.strokeColor('black').lineWidth(1)
                .moveTo(startX + tableWidth, startY - 10)
                .lineTo(startX + tableWidth, yPos + rowHeight)
                .stroke();
        }
    });
    doc.end();
};

router.get('/generate-pdf', async (req, res) => {
    try {
        const bills = await Bill.find().populate('customer_id');
        const filePath = path.join(__dirname, '../files/bills.pdf');

        await generateTableForPDf(bills, filePath);

        res.download(filePath, (err) => {
            if (err) {
                res.status(500).json({ message: 'Error while downloading the file.', err: err });
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

router.get('/generate-pdf-by-lite-bill/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const bills = await Bill.find({ _id: id }).populate('customer_id');
        if (bills.length === 0) {
            return res.status(404).json({ message: 'No bills found with the provided ID.' });
        }

        const filePath = path.join(__dirname, '../files/bills.pdf');

        await generateTableForPDf(bills, filePath);

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

router.get('/get-last-bill/:customer_id', async (req, res) => {
    try {
        const customer_id = req.params.customer_id;
        console.log('customer_id', customer_id);
        const lastBill = await Bill.findOne({ customer_id }).sort({ _id: -1 });
        if (lastBill) {
            res.json({
                data: lastBill,
                message: 'Bill Get Successfully',
                isError: false
            });
        } else {
            res.json({
                data: [],
                message: 'No Bill Found For This Customer. Please Create New Bill',
                isError: true
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/upload-data-from-table/:customer_id', (req, res) => {
    const customer_id = req.params.customer_id;
    const data = req.body;

    data.forEach(async row => {
        const {
            current_unit,
            prev_unit,
            unit_per_rate,
            total_price,
            used_unit,
            extra_unit,
            comments,
            date
        } = row;
        const bill = new Bill({
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

        try {
            await bill.save();
        } catch (err) {
            console.log(err);
            res.send({
                messgae: err,
                isError: true
            });
        }
    });
    res.send({
        messgae: 'File uploaded and data added',
        isError: false
    });
});

// Upload Excel
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-excel/:customer_id', upload.single('file'), (req, res) => {
    const customer_id = req.params.customer_id;
    const workbook = xlsx.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    data.forEach(async row => {
        const {
            current_unit,
            prev_unit,
            unit_per_rate,
            total_price,
            used_unit,
            extra_unit,
            comments,
            date
        } = row;
        const bill = new Bill({
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

        try {
            await bill.save();
        } catch (err) {
            console.log(err);
        }
    });

    res.send('File uploaded and data added');
});

// Delete a Bill
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedBill = await Bill.findByIdAndDelete(id);
        if (!deletedBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.json({
            message: 'Bill Deleted Successfully',
            isError: false
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
