import mongoose from 'mongoose';

const MasterItemSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['meter_no', 'floor_no'], required: true, index: true },
    value: { type: String, required: true },
    // Only set when type === 'meter_no' — the parent Floor No's value this meter belongs to.
    floor_no: { type: String, index: true },
    isActive: { type: Boolean, required: true, default: true },
});

const MasterItem = mongoose.model('MasterItem', MasterItemSchema);
export default MasterItem;
