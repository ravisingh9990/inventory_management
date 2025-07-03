// server/routes/stock.js
import express from 'express';
import { getStockItems, updateStockItem, createStockItem } from '../controllers/stockController.js'; // .js extension
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // .js extension

const router = express.Router();

router.route('/')
    .get(protect, getStockItems) // Engineers see their branch, Admins see all or filter
    .post(protect, authorizeRoles('admin', 'engineer'), createStockItem); // Admins/Engineers can create new stock items (via transactions)

router.route('/:id')
    .put(protect, authorizeRoles('admin', 'engineer'), updateStockItem); // Admins/Engineers can update stock items

export default router;