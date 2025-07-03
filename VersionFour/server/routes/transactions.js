// server/routes/transactions.js
import express from 'express';
import { getTransactions, addTransaction } from '../controllers/transactionController.js'; // .js extension
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // .js extension

const router = express.Router();

router.route('/')
    .get(protect, getTransactions) // Engineers see their branch's transactions, Admins see all or filter
    .post(protect, authorizeRoles('admin', 'engineer'), addTransaction); // Admins/Engineers can add transactions

export default router;