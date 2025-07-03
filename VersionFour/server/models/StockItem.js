// server/models/StockItem.js
import mongoose from 'mongoose';

const StockItemSchema = new mongoose.Schema({
    branchId: { // Which branch this stock belongs to
        type: String,
        required: true,
    },
    itemId: { // Unique ID for the item (e.g., "FOC-100m")
        type: String,
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    itemType: {
        type: String,
        enum: ['Cable', 'Device', 'Connector', 'Tool', 'Other'],
        required: true,
    },
    currentStock: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    // Ensure unique combination of itemId and branchId
    indexes: [{ unique: true, fields: ['itemId', 'branchId'] }]
});

export default mongoose.model('StockItem', StockItemSchema);