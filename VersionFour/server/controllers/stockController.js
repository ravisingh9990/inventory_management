// server/controllers/stockController.js
import StockItem from '../models/StockItem.js'; // .js extension

// @desc    Get all stock items (can be filtered by branch)
// @route   GET /api/stock?branchId=...
// @access  Private (Admin can see all, Engineer can see their branch's)
const getStockItems = async (req, res) => {
    const { branchId } = req.query;
    let query = {};

    // If user is engineer, only show their branch's stock
    if (req.user.role === 'engineer' && req.user.branchId) {
        query.branchId = req.user.branchId;
    } else if (branchId) { // Admin can filter by any branchId
        query.branchId = branchId;
    }

    try {
        const stockItems = await StockItem.find(query);
        res.json(stockItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching stock items' });
    }
};

// @desc    Update stock item quantity (used by transactions)
// @route   PUT /api/stock/:id
// @access  Private (Used internally by transaction logic, or by admin)
const updateStockItem = async (req, res) => {
    const { id } = req.params; // This will be the MongoDB _id of the stock item document
    const { currentStock } = req.body;

    try {
        const stockItem = await StockItem.findById(id);

        if (!stockItem) {
            return res.status(404).json({ message: 'Stock item not found' });
        }

        // Role-based access for updating stock
        if (req.user.role === 'engineer' && stockItem.branchId !== req.user.branchId) {
            return res.status(403).json({ message: 'Not authorized to update stock for this branch' });
        }

        stockItem.currentStock = currentStock;
        await stockItem.save();
        res.json(stockItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating stock item' });
    }
};

// @desc    Create a new stock item (if it doesn't exist for a branch)
// @route   POST /api/stock
// @access  Private (Used internally by transaction logic, or by admin)
const createStockItem = async (req, res) => {
    const { branchId, itemId, itemName, itemType, currentStock } = req.body;

    if (!branchId || !itemId || !itemName || !itemType || currentStock === undefined) {
        return res.status(400).json({ message: 'Please provide all required fields for stock item' });
    }

    // Role-based access for creating stock
    if (req.user.role === 'engineer' && branchId !== req.user.branchId) {
        return res.status(403).json({ message: 'Not authorized to create stock for this branch' });
    }

    try {
        const stockItemExists = await StockItem.findOne({ branchId, itemId });
        if (stockItemExists) {
            return res.status(400).json({ message: 'Stock item already exists for this branch and item ID. Use PUT to update.' });
        }

        const newStockItem = await StockItem.create({
            branchId,
            itemId,
            itemName,
            itemType,
            currentStock,
        });
        res.status(201).json(newStockItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating stock item' });
    }
};


export { getStockItems, updateStockItem, createStockItem };