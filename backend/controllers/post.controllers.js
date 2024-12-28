import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js"

export const createPoat = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        let { text, image } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        if (!text && !image) {
            return res.status(400).json({ message: "Please enter text or image." });
        }

        if (image) {
            const uploadedResponse = await cloudinary.uploader.upload(image);
            image = uploadedResponse.secure_url;
        }

        let newPost = new Post({
            text,
            image,
            user: userId,
        });

        await newPost.save();
        return res.status(200).json({ message: "Post created successfully." });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error.", error });
    }
}

export const deletePoat = async (req, res) => {

    try {
        const postId = req.params.id;
        const userId = req.user._id.toString();

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(400).json({ message: "Post not found." });
        }

        if (post.user.toString() !== userId) {
            return res.status(400).json({ message: "You are not authorized to delete this post." });
        }

        if (post.img) {
            const publicId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await post.remove();
    } catch (error) {
        return res.status(500).json({ message: "Internal server error.", error });
    }

}

export const commentOnPost = async (req, res) => {

    try {
        const { postId, text } = req.body;
        const userId = req.user._id.toString();

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
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        const user = await User.findById(userId);

        if (!post) {
            return res.status(400).json({ message: "Post not found." });
        }
        if (post.likes.includes(userId)) {
            post.likes.pull(userId);
            await post.save();

            user.likedPosts.pull(postId);
            await user.save();

            if (post.user !== userId.toString()) {
                const notification = new Notification({
                    from: userId,
                    to: post.user,
                    type: "like",
                });
                await notification.save();
            }

            return res.status(200).json({ message: "Post unliked successfully." });
        } else {
            post.likes.push(userId);
            await post.save();

            user.likedPosts.push(postId);
            await user.save();

            return res.status(200).json({ message: "Post liked successfully." });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error.", error });
    }
}

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate(
            {
                path: 'user',
                select: '-password'
            }).populate({
                path: 'comments.user',
                select: '-password'
            })
        return res.status(200).json({ posts });
    }
    catch (error) {
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

        const post = await Post.find({ _id: { $in: user.likedPosts } }).populate(
            { path: 'user', select: '-password' }).populate({ path: 'comments.user', select: '-password' });
        return res.status(200).json({ post });

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
