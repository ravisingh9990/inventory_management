// server/controllers/initialDataController.js
import Branch from '../models/Branch.js'; // .js extension
import Engineer from '../models/Engineer.js'; // .js extension
import User from '../models/User.js'; // .js extension (Import User model for pre-creating users)

const setupInitialData = async () => {
    try {
        // Check and add branches
        const branchCount = await Branch.countDocuments();
        if (branchCount === 0) {
            console.log("Seeding initial branch data...");
            await Branch.insertMany([
                { id: 'Delhi', name: 'Delhi', location: 'Delhi, India' },
                { id: 'Faridabad', name: 'Faridabad', location: 'Faridabad, India' },
                { id: 'Kanpur', name: 'Kanpur', location: 'Kanpur, India' },
                { id: 'Chandigarh', name: 'Chandigarh', location: 'Chandigarh, India' },
                { id: 'Lucknow', name: 'Lucknow', location: 'Lucknow, India' },
                { id: 'Jaipur', name: 'Jaipur', location: 'Jaipur, India' },
            ]);
            console.log("Branches seeded.");
        }

        // Check and add engineers
        const engineerCount = await Engineer.countDocuments();
        if (engineerCount === 0) {
            console.log("Seeding initial engineer data...");
            await Engineer.insertMany([
                { id: 'eng1', name: 'John Doe', branchId: 'Delhi' },
                { id: 'eng2', name: 'Jane Smith', branchId: 'Faridabad' },
                { id: 'eng3', name: 'Peter Jones', branchId: 'Delhi' },
                { id: 'eng4', name: 'Alice Brown', branchId: 'Kanpur' },
            ]);
            console.log("Engineers seeded.");
        }

        // Pre-create admin and engineer users if they don't exist
        // IMPORTANT: In a real app, you'd register these via the UI or a separate admin script
        // For demo purposes, we'll try to create them if not found.
        const adminUser = await User.findOne({ email: 'admin@telecom.com' });
        if (!adminUser) {
            console.log("Creating default admin user...");
            await User.create({
                email: 'admin@telecom.com',
                password: 'admin123', // This will be hashed by the pre-save hook
                role: 'admin',
                branchId: null, // Admins don't have a specific branch
            });
            console.log("Default admin user created.");
        }

        const engineerUser = await User.findOne({ email: 'engineer@telecom.com' });
        if (!engineerUser) {
            console.log("Creating default engineer user...");
            await User.create({
                email: 'engineer@telecom.com',
                password: 'engineer123', // This will be hashed
                role: 'engineer',
                branchId: 'Delhi', // Assign to Delhi branch for demo
            });
            console.log("Default engineer user created.");
        }

    } catch (error) {
        console.error("Error seeding initial data:", error);
    }
};

export { setupInitialData };