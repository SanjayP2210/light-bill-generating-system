import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import path, { dirname } from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import customersRoute from './routes/customers.js';
import billsRoute from './routes/bills.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({ path: "server/config/config.env" });
}

app.use('/customers', customersRoute);
app.use('/bills', billsRoute);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
