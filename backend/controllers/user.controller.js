import User from "../models/user.model.js"; // adjust path as needed
import bcrypt from "bcryptjs";

export const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ message: "Username parameter is required" });
        }

        const user = await User.findOne({ username }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateUser = async (req, res) => {
    const { username } = req.params;
    const { fullname, email, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();
        res.status(200).json({
            message: 'User updated successfully',
            user: {
                fullname: updatedUser.fullname,
                username: updatedUser.username,
                email: updatedUser.email,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
