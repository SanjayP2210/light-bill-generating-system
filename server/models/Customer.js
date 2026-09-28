import moment from 'moment-timezone';
import mongoose, { Schema } from 'mongoose';

const CustomerSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: String,
    mobile_number: String,
    bill_no: String,
    floor_no: String,
    rent_date: Date,
    default_unit_per_rate: Number,
    last_bill_unit: Number,
    isActive: { type: Boolean, required: true, default: true },
});

// Covers the active-customer list.
CustomerSchema.index({ user_id: 1, isActive: 1 });

const customer = mongoose.model('Customer', CustomerSchema);
export default customer;