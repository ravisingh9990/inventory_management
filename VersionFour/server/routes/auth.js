// server/routes/auth.js
import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController.js'; // Add .js extension
import { protect } from '../middleware/authMiddleware.js'; // Add .js extension

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

export default router; // Use export default for the router