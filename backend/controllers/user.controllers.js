import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import cloudinary from '../lib/cloudinary.js';

import bcrypt from 'bcryptjs';

export const getProfile = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const otherId = await User.findById(id);
        const myId = await User.findById(req.user._id);

        if (otherId._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: 'you cant follow you self' })
        }

        if (!otherId || !myId) return res.status(400).json({ error: 'user not found' });

        const isFollowing = myId.followings.includes(otherId._id);
        if (isFollowing) {
            await myId.updateOne({ $pull: { followings: otherId._id } });
            await otherId.updateOne({ $pull: { followers: myId._id } });

        } else {
            await myId.updateOne({ $push: { followings: otherId._id } });
            await otherId.updateOne({ $push: { followers: myId._id } });
        }

        const notification = new Notification({
            from: req.user._id,
            to: otherId._id,
            type: 'follow',
        });
        await notification.save();

        res.status(200).json({ message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log('error in followUnfollow function', error)
    }

}

export const grtsugestedUsers = async (req, res) => {
    try {
        const myId = await User.findById(req.user._id);
        const sugestedUsers = await User.find({ _id: { $nin: myId.followings } }).select('-password').limit(5);
        res.status(200).json(sugestedUsers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
        let { profilePicture, coverPicture } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({ message: 'User not found' });

        if ((!currentPassword && newPassword) || (currentPassword && !newPassword)) {
            return res.status(400).json({ message: 'Please enter your current password and new password' });
        }

        if (currentPassword && newPassword) {

            const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordMatch) return res.status(400).json({ message: 'Invalid password' });
            if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
        }


        if (profilePicture) {
            if (user.profilePicture) {
                await cloudinary.uploader.destroy(user.profilePicture.split('/').pop().split('.')[0]);
            }
            uploadedResponse = await cloudinary.uploader.upload(profilePicture);
            profilePicture = uploadedResponse.secure_url
        }

        if (coverPicture) {
            if (user.coverPicture) {
                await cloudinary.uploader.destroy(user.coverPicture.split('/').pop().split('.')[0])
            }
            uploadedResponse = await cloudinary.uploader.upload(coverPicture);
            coverPicture = uploadedResponse.secure_url
        }

        user.profilePicture = profilePicture || user.profilePicture
        user.coverPicture = coverPicture || user.coverPicture
        user.fullName = fullName || user.fullName
        user.email = email || user.email
        user.username = username || user.username
        user.bio = bio || user.bio
        user.link = link || user.link

        await user.save();
        user.password = null
        return res.status(200).json(user);

    } catch (error) {
        console.log('error in updateProfile function', error)
        res.status(500).json({ message: error.message });
    }
}

