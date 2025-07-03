// server/controllers/engineerController.js
import Engineer from '../models/Engineer.js'; // .js extension

// @desc    Get all engineers
// @route   GET /api/engineers
// @access  Public (or Private if needed)
const getEngineers = async (req, res) => {
    try {
        const engineers = await Engineer.find({});
        res.json(engineers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching engineers' });
    }
};

// @desc    Add a new engineer
// @route   POST /api/engineers
// @access  Private (Admin only)
const addEngineer = async (req, res) => {
    const { id, name, branchId } = req.body;
    if (!id || !name || !branchId) {
        return res.status(400).json({ message: 'Please enter all fields for the engineer' });
    }
    try {
        const engineerExists = await Engineer.findOne({ id });
        if (engineerExists) {
            return res.status(400).json({ message: 'Engineer with this ID already exists' });
        }
        const engineer = await Engineer.create({ id, name, branchId });
        res.status(201).json(engineer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding engineer' });
    }
};

export { getEngineers, addEngineer };