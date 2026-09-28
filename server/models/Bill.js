import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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

// Covers "last bill of a customer" (runs on every bill create/update/delete)
// and the paginated per-customer bill list.
BillSchema.index({ user_id: 1, customer_id: 1, _id: -1 });
BillSchema.index({ user_id: 1, customer_id: 1, date: 1 });
// Covers the full bill list sorted by date.
BillSchema.index({ user_id: 1, date: -1 });

const bill = mongoose.model('Bill', BillSchema);
export default bill;