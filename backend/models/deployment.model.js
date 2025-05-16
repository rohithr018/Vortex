import mongoose from 'mongoose';

const deploymentSchema = new mongoose.Schema(
    {
        deploymentId: { type: String, required: true, unique: true },
        repoName: { type: String, required: true },
        branch: { type: String, required: true },
        username: { type: String, required: true },
        logs: [
            {
                message: String,
                level: String,
                timestamp: Date,
            }
        ],
        url: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model('Deployment', deploymentSchema);
