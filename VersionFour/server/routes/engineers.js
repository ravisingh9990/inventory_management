// server/routes/engineers.js
import express from 'express';
import { getEngineers, addEngineer } from '../controllers/engineerController.js'; // .js extension
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // .js extension

const router = express.Router();

router.route('/')
    .get(protect, getEngineers) // Anyone logged in can see engineers
    .post(protect, authorizeRoles('admin'), addEngineer); // Only admins can add engineers

export default router;