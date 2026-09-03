// Idempotent setup script — safe to run more than once.
//
// 1. Creates the predefined admin account (admin@billgenerator.com) if it
//    does not already exist. Does NOT touch it if it already exists.
// 2. Assigns every pre-existing Customer/Bill document that has no
//    `user_id` yet to that admin account, so existing data keeps working
//    once the app starts filtering by user.
//
// Never drops collections, deletes documents, or touches records that
// already have a user_id.
//
// Run with:  npm run seed:admin

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Bill from '../models/Bill.js';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: 'server/config/config.env' });
}

const ADMIN_EMAIL = 'admin@billgenerator.com';
const ADMIN_PASSWORD = 'Admin@123';

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (admin) {
        console.log(`Admin account already exists (${ADMIN_EMAIL}) — leaving it untouched.`);
    } else {
        admin = await User.create({
            name: 'Admin',
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
            isActive: true,
        });
        console.log(`Created admin account: ${ADMIN_EMAIL}`);
    }

    const customerResult = await Customer.updateMany(
        { user_id: { $exists: false } },
        { $set: { user_id: admin._id } }
    );
    console.log(`Customers migrated to admin: ${customerResult.modifiedCount}`);

    const billResult = await Bill.updateMany(
        { user_id: { $exists: false } },
        { $set: { user_id: admin._id } }
    );
    console.log(`Bills migrated to admin: ${billResult.modifiedCount}`);

    console.log('Done.');
    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error('Seed/migration failed:', err);
    process.exit(1);
});
