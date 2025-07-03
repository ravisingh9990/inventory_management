// server/models/Transaction.js
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
    },
    type: { // e.g., "Received From Supplier", "Issued To Engineer", "Issued To Branch", "Stock Correction"
        type: String,
        required: true,
    },
    itemId: {
        type: String,
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    itemType: {
        type: String,
        required: true,
    },
    quantity: { // Always positive, sign is implied by type
        type: Number,
        required: true,
        min: 0,
    },
    actingBranchId: { // The branch that initiated this transaction
        type: String,
        required: true,
    },
    actingUserId: { // The user who performed this transaction
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    actingUserRole: {
        type: String,
        enum: ['admin', 'engineer'],
        required: true,
    },
    targetEntity: { // e.g., Engineer Name, Branch Name, Supplier Name, Correction Reason
        type: String,
        required: true,
    },
    targetEntityType: { // e.g., "Engineer", "OtherBranch", "Supplier", "CorrectionReason"
        type: String,
        required: true,
    },
});

export default mongoose.model('Transaction', TransactionSchema);