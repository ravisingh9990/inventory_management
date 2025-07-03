// server/server.js
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; // .js extension for local module import

// Import routes with .js extension
import authRoutes from './routes/auth.js';
import branchRoutes from './routes/branches.js';
import engineerRoutes from './routes/engineers.js';
import stockRoutes from './routes/stock.js';
import transactionRoutes from './routes/transactions.js';

// Optional: for initial data setup
// import { setupInitialData } from './controllers/initialDataController.js';

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Body parser for JSON data

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/engineers', engineerRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/transactions', transactionRoutes);

// Simple root route
app.get('/', (req, res) => {
    res.send('StockWise Pro API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Initial data setup (optional, for demonstration)
// Uncomment the import and this line to run initial data setup on server start
// setupInitialData();