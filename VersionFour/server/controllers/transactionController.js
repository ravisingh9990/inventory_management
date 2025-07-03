// server/controllers/transactionController.js
import Transaction from '../models/Transaction.js'; // .js extension
import StockItem from '../models/StockItem.js'; // .js extension
import Branch from '../models/Branch.js'; // .js extension

// @desc    Get all transactions (can be filtered)
// @route   GET /api/transactions?branchId=...
// @access  Private (Admin can see all, Engineer can see their branch's)
const getTransactions = async (req, res) => {
    const { branchId } = req.query;
    let query = {};

    // If user is engineer, only show transactions initiated by their branch
    if (req.user.role === 'engineer' && req.user.branchId) {
        query.actingBranchId = req.user.branchId;
    } else if (branchId) { // Admin can filter by any actingBranchId
        query.actingBranchId = branchId;
    }

    try {
        const transactions = await Transaction.find(query);
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching transactions' });
    }
};

// @desc    Add a new transaction
// @route   POST /api/transactions
// @access  Private (Admin or Engineer)
const addTransaction = async (req, res) => {
    const {
        type,
        itemId,
        itemName,
        itemType,
        quantity,
        actingBranchId, // This should come from frontend based on selected branch
        targetEntity,
        targetEntityType
    } = req.body;

    // Validate input
    if (!type || !itemId || !itemName || !itemType || quantity === undefined || quantity <= 0 || !actingBranchId || !targetEntity || !targetEntityType) {
        return res.status(400).json({ message: 'Please provide all required transaction fields.' });
    }

    // Ensure the user is authorized to act for this branch
    if (req.user.role === 'engineer' && req.user.branchId !== actingBranchId) {
        return res.status(403).json({ message: 'Not authorized to add transactions for this branch.' });
    }

    try {
        // Find or create the stock item for the acting branch
        let actingBranchStockItem = await StockItem.findOne({ branchId: actingBranchId, itemId });

        let newActingBranchStock = actingBranchStockItem ? actingBranchStockItem.currentStock : 0;

        if (type.includes('Issued')) {
            if (!actingBranchStockItem || actingBranchStockItem.currentStock < quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${itemName} at ${actingBranchId}. Available: ${actingBranchStockItem ? actingBranchStockItem.currentStock : 0}` });
            }
            newActingBranchStock -= quantity;
        } else if (type.includes('Received')) {
            newActingBranchStock += quantity;
        } else if (type === 'Stock Correction') {
            // For correction, quantity can be positive or negative
            newActingBranchStock += quantity;
            if (newActingBranchStock < 0) {
                return res.status(400).json({ message: `Stock correction would result in negative stock for ${itemName}.` });
            }
        }

        if (actingBranchStockItem) {
            actingBranchStockItem.currentStock = newActingBranchStock;
            await actingBranchStockItem.save();
        } else {
            // Only create new stock item if it's a 'Received' transaction
            if (type.includes('Received') || type === 'Stock Correction') {
                await StockItem.create({
                    branchId: actingBranchId,
                    itemId,
                    itemName,
                    itemType,
                    currentStock: newActingBranchStock,
                });
            } else {
                return res.status(400).json({ message: `Cannot issue ${itemName}. Item not found in stock at ${actingBranchId}.` });
            }
        }

        // Handle inter-branch transfers (update target branch's stock)
        if (type === 'Issued To Branch') {
            const targetBranchName = targetEntity; // This is the branch name
            const targetBranch = await Branch.findOne({ name: targetBranchName });

            if (targetBranch) {
                let targetBranchStockItem = await StockItem.findOne({ branchId: targetBranch.id, itemId });
                let newTargetBranchStock = targetBranchStockItem ? targetBranchStockItem.currentStock : 0;
                newTargetBranchStock += quantity; // Stock increases at target branch

                if (targetBranchStockItem) {
                    targetBranchStockItem.currentStock = newTargetBranchStock;
                    await targetBranchStockItem.save();
                } else {
                    await StockItem.create({
                        branchId: targetBranch.id,
                        itemId,
                        itemName,
                        itemType,
                        currentStock: newTargetBranchStock,
                    });
                }
            } else {
                console.warn(`Target branch '${targetBranchName}' not found for Issued To Branch transaction.`);
            }
        }

        // Create the transaction record
        const transaction = await Transaction.create({
            type,
            itemId,
            itemName,
            itemType,
            quantity: Math.abs(quantity), // Store absolute quantity in transaction record
            actingBranchId,
            actingUserId: req.user._id, // User ID from authenticated request
            actingUserRole: req.user.role, // User role from authenticated request
            targetEntity,
            targetEntityType,
        });

        res.status(201).json(transaction);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding transaction.' });
    }
};

export { getTransactions, addTransaction };