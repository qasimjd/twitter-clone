import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js"
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        let { text, img } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        if (!text && !img) {
            return res.status(400).json({ message: "Please enter text or image." });
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        let newPost = new Post({
            text,
            img,
            user: userId,
        });

        await newPost.save();
        return res.status(200).json({ message: "Post created successfully." });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error.", error });
    }
}

export const deletePost = async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post" });
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log("Error in deletePost controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const commentOnPost = async (req, res) => {

    try {
        const { postId, text } = req.body;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ message: "Please enter a comment." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(400).json({ message: "Post not found." });
        }

        let newComment = {
            text,
            user: userId,
        }
        post.comments.push(newComment);

        if (post.user !== userId) {
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "comment",
            });
            await notification.save();
        }

        await post.save();
        return res.status(200).json({ message: "Comment added successfully." });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error.", error });
    }
}

export const likePost = async (req, res) => {
    try {
        const userId = req.user._id; // Authenticated user's ID
        const { id: postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const isLiked = post.likes.includes(userId);

        // Update likes array
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
            { new: true }
        );

        // Update the user's liked posts
        await User.updateOne(
            { _id: userId },
            isLiked
                ? { $pull: { likedPosts: postId } }
                : { $addToSet: { likedPosts: postId } }
        );

        // Create a notification if the post is liked
        if (!isLiked && post.user.toString() !== userId.toString()) {
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
                postId,
            });
            await notification.save();
        }

        res.status(200).json(updatedPost.likes); // Return updated likes array
    } catch (error) {
        console.error("Error in likePost controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPosts = async (_, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        });
        return res.status(200).json({ posts }); // Returns an array of posts
    } catch (error) {
        return res.status(500).json({ message: "Internal server error.", error });
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        const posts = await Post.find({ _id: { $in: user.likedPosts } }).populate(
            { path: 'user', select: '-password' }).populate({ path: 'comments.user', select: '-password' });
            return res.status(200).json({ posts });
    } catch (error) {
        console.error('Error in getLikedPosts:', error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate({
            path: 'user',
            select: '-password'
        }).populate({ path: 'comments.user', select: '-password' });

        return res.status(200).json({ posts });
    }
    catch (error) {
        console.error('Error in getMyPosts:', error);
        return res.status(500).json({ message: "Internal server error.", error });
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        const following = user.followings;

        const posts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate({
            path: 'user',
            select: '-password'
        }).populate({ path: 'comments.user', select: '-password' });

        return res.status(200).json({ posts });
    }
    catch (error) {
        console.error('Error in getFollowingPosts:', error);
        return res.status(500).json({ message: "Internal server error.", error });
    }
}
