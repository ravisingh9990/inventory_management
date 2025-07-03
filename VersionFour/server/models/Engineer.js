// server/models/Engineer.js
import mongoose from 'mongoose';

const EngineerSchema = new mongoose.Schema({
    id: { // e.g., "eng1", "eng2"
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    branchId: { // Link to the branch this engineer belongs to
        type: String,
        required: true,
    },
});

export default mongoose.model('Engineer', EngineerSchema);