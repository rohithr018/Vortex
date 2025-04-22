import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Register Controller
export const registerUser = async (req, res) => {
    try {
        const { username, fullname, password, githubProfile, email } = req.body;
        if (!username || !fullname || !email || !password || !githubProfile) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if username or email already exists
        const duplicateEmail = await User.findOne({ email });
        const duplicateUser = await User.findOne({ username });

        if (duplicateEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        if (duplicateUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            fullname,
            password: hashedPassword,
            githubProfile,
            email
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login Controller
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No user Found, Try registering' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Wrong Password' });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...userData } = user._doc;
        res.status(200).json({ message: 'Login successful', token, user: userData });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
