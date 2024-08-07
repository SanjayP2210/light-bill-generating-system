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


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


app.use(express.static(path.join(__dirname, "../client/dist")));

app.use('/api/customers', customersRoute);
app.use('/api/bills', billsRoute);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
});


// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err?.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
