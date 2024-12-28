import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import genrateToken from "../lib/jwt.js";

export const signup = async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;

        // Validate required fields
        if (!username || !fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        // Validate email format
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (!emailRegex.test(email)) {
        //     return res.status(400).json({ message: "Invalid email format." });
        // }

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            fullName,
            email,
            password: hashedPassword,
        });

        // Generate token
        genrateToken(newUser._id, res);

        // Save user to database
        const savedUser = await newUser.save();

        // Send success response
        res.status(201).json({
            id: savedUser._id,
            username: savedUser.username,
            fullName: savedUser.fullName,
            email: savedUser.email,
            profilePicture: savedUser.profilePicture,
            bio: savedUser.bio,
            link: savedUser.link,
            followers: savedUser.followers,
            followings: savedUser.followings,
        });
    } catch (error) {
        console.error("Signup error stack trace:", error.stack);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        // Validate required fields
        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if user exists
        const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }], });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // Check if password is correct
        const validPassword = await bcrypt.compare(password, user?.password || "");
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // Generate token
        genrateToken(user._id, res);

        // Send success response
        res.status(200).json({
            id: user._id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            link: user.link,
            followers: user.followers,
            followings: user.followings,
        });

    } catch (error) {
        console.error("Login error stack trace:", error.stack);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("token").json({ message: "Logged out." });
    } catch (error) {
        console.error("Logout error stack trace:", error.stack);
        res.status(500).json({ message: error.message });
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        return res.status(200).json(user);
    } catch (error) {
        console.log("error in checkAuth", error.message);
        return res.status(500).json({ message: error.message });
    }
}