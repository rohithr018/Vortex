import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        fullname: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        githubProfile: { type: String, required: true },
        password: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);
