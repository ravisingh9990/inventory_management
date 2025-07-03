// server/controllers/branchController.js
import Branch from '../models/Branch.js'; // .js extension

// @desc    Get all branches
// @route   GET /api/branches
// @access  Public (or Private for specific roles if needed)
const getBranches = async (req, res) => {
    try {
        const branches = await Branch.find({});
        res.json(branches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching branches' });
    }
};

// @desc    Add a new branch
// @route   POST /api/branches
// @access  Private (Admin only)
const addBranch = async (req, res) => {
    const { id, name, location } = req.body;
    if (!id || !name || !location) {
        return res.status(400).json({ message: 'Please enter all fields for the branch' });
    }
    try {
        const branchExists = await Branch.findOne({ $or: [{ id }, { name }] });
        if (branchExists) {
            return res.status(400).json({ message: 'Branch with this ID or Name already exists' });
        }
        const branch = await Branch.create({ id, name, location });
        res.status(201).json(branch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding branch' });
    }
};

export { getBranches, addBranch };