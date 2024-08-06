import moment from 'moment-timezone';
import mongoose, { Schema } from 'mongoose';

const CustomerSchema = new mongoose.Schema({
    name: String,
    mobile_number: String,
    bill_no: String,
    rent_date: Date,
    default_unit_per_rate: Number,
    last_bill_unit: Number,
    isActive: { type: Boolean, required: true, default: true },
});

const customer = mongoose.model('Customer', CustomerSchema);
export default customer;