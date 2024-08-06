import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    current_unit: Number,
    prev_unit: Number,
    unit_per_rate: Number,
    total_price: Number,
    used_unit:Number,
    extra_unit: Number,
    comments : String,
    date: { type: Date, default: Date.now },
});

const bill = mongoose.model('Bill', BillSchema);
export default bill;