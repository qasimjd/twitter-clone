import mongoose from "mongoose";
import User from "./user.model.js";

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        require: true
    },
    text: {
        type: String,
        ref: User
    },
    img: {
        type: String,
        ref: User
    },
    likes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: User
        }
    ],
    comments: [
        {
            text: {
                type: String,
                require: true
            },
            user: {
                type: mongoose.Schema.ObjectId,
                ref: User,
                require: true
            }
        }
    ]

}, { timestamps: true })

const Post = mongoose.model("Post", postSchema)

export default Post;