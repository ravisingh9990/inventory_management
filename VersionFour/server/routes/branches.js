// server/routes/branches.js
import express from 'express';
import { getBranches, addBranch } from '../controllers/branchController.js'; // .js extension
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // .js extension

const router = express.Router();

router.route('/')
    .get(protect, getBranches) // Anyone logged in can see branches
    .post(protect, authorizeRoles('admin'), addBranch); // Only admins can add branches

export default router;