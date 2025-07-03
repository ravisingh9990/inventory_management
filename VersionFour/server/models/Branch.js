// server/models/Branch.js
import mongoose from 'mongoose';

const BranchSchema = new mongoose.Schema({
    id: { // e.g., "Delhi", "Faridabad"
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    location: {
        type: String,
        required: true,
    },
});

export default mongoose.model('Branch', BranchSchema);