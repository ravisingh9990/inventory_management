// server/controllers/authController.js
import User from '../models/User.js'; // Use .js extension for ES Modules
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Import bcrypt for password comparison in login

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => { // Use export const
    const { email, password, role, branchId } = req.body;

    console.log('Attempting registration with:', { email, role, branchId });

    // Basic validation
    if (!email || !password || !role) {
        console.error('Registration Error: Missing email, password, or role.');
        return res.status(400).json({ message: 'Please enter all fields (email, password, role).' });
    }
    if (role === 'engineer' && !branchId) {
        console.error('Registration Error: Engineer role requires a branchId.');
        return res.status(400).json({ message: 'Engineer role requires an assigned branch.' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.error(`Registration Error: User with email ${email} already exists.`);
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            role,
            branchId: role === 'engineer' ? branchId : null, // Ensure branchId is null for admin
        });

        if (user) {
            console.log(`User registered successfully: ${user.email} (${user.role})`);
            res.status(201).json({
                _id: user._id,
                email: user.email,
                role: user.role,
                branchId: user.branchId,
                token: generateToken(user._id),
            });
        } else {
            console.error('Registration Error: Invalid user data provided to User.create.');
            res.status(400).json({ message: 'Invalid user data provided.' });
        }
    } catch (error) {
        console.error('Server Error during registration:', error.message);
        // Mongoose validation errors might have a 'code' or 'name' property
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }
        res.status(500).json({ message: 'Server error during registration. Please check server logs for details.' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => { // Use export const
    const { email, password } = req.body;

    console.log('Attempting login for:', email);

    try {
        // Check for user email
        const user = await User.findOne({ email });

        // Ensure bcrypt is imported and used for password comparison
        if (user && (await user.matchPassword(password))) {
            console.log(`User logged in successfully: ${user.email}`);
            res.json({
                _id: user._id,
                email: user.email,
                role: user.role,
                branchId: user.branchId,
                token: generateToken(user._id),
            });
        } else {
            console.error(`Login Error: Invalid credentials for ${email}.`);
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Server Error during login:', error.message);
        res.status(500).json({ message: 'Server error during login. Please try again later.' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => { // Use export const
    // req.user is attached by the protect middleware
    if (req.user) {
        res.json({
            _id: req.user._id,
            email: req.user.email,
            role: req.user.role,
            branchId: req.user.branchId,
        });
    } else {
        console.error('Get User Profile Error: User not found in request after protection.');
        res.status(404).json({ message: 'User profile not found.' });
    }
};

// No longer using module.exports with ES Modules, export individual functions
// module.exports = { registerUser, loginUser, getUserProfile };
