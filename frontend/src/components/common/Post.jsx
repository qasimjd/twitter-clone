import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaTrash } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import {formatTime} from "../../utils/db/timeFromater.js";

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const postOwner = post.user;

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();

	const isMyPost = authUser?._id === postOwner._id;
	const isLiked = post.likes.includes(authUser?._id);

	const formattedDate = formatTime(post.createdAt);

	// Mutation for deleting a post
	const { mutate: deletePost, isLoading: isDeleting } = useMutation({
		mutationFn: async () => {
			const response = await fetch(`/api/posts/delete/${post._id}`, {
				method: "DELETE",
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || "Something went wrong");
			}
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["posts"]);
			toast.success("Post deleted successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete the post");
		},
	});
	const handleDeletePost = () => {
		if (window.confirm("Are you sure you want to delete this post?")) {
			deletePost();
		}
	};

	// Mutation for liking a post
	const { mutate: likePost } = useMutation({
		mutationFn: async (postId) => {
			const res = await fetch(`/api/posts/like/${postId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ postId }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to like the post");
			return data; // Updated likes array
		},
		onMutate: async (postId) => {
			// Cancel any outgoing refetches (so they don't overwrite optimistic updates)
			await queryClient.cancelQueries(["posts"]);

			// Snapshot the previous value
			const previousPosts = queryClient.getQueryData(["posts"]);

			// Optimistically update the cache
			queryClient.setQueryData(["posts"], (oldPosts = []) => {
				return oldPosts.map((post) =>
					post._id === postId
						? {
							...post,
							likes: post.likes.includes(authUser._id)
								? post.likes.filter((id) => id !== authUser._id) // Unlike
								: [...post.likes, authUser._id], // Like
						}
						: post
				);
			});

			// Return a context object with the snapshot
			return { previousPosts };
		},
		onError: (err, postId, context) => {
			// Rollback to the previous value
			queryClient.setQueryData(["posts"], context.previousPosts);
			toast.error(err.message || "Failed to like the post");
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries(["posts"]);
		},
	});
	const handleLikePost = () => {
		likePost(post._id);
	};

	// Mutation for posting a comment
	const { mutate: postComment, isLoading: isCommenting } = useMutation({
		mutationFn: async ({ postId }) => {
			const res = await fetch(`/api/posts/comment`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ text: comment, postId }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to post the comment");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			setComment("");
			toast.success("Comment posted successfully");
		},
		onError: (err) => {
			toast.error(err.message || "Failed to post the comment");
		},
	});
	const handlePostComment = (e) => {
		e.preventDefault();
		if (!comment.trim()) return;
		if (isCommenting) return;
		postComment({ postId: post._id, text: comment });
	};

	return (
		<div className="flex gap-2 items-start p-4 border-b border-gray-700">
			<div className="avatar">
				<Link to={`/profile/${postOwner.username}`} className="w-8 rounded-full">
					<img src={postOwner.profilePicture || "/avatar.png"} alt="Profile" />
				</Link>
			</div>
			<div className="flex flex-col flex-1">
				<div className="flex gap-2 items-center">
					<Link to={`/profile/${postOwner.username}`} className="font-bold">
						{postOwner.fullName}
					</Link>
					<span className="text-gray-700 flex gap-1 text-sm">
						<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
						<span>·</span>
						<span>{formattedDate}</span>
					</span>
					{isMyPost && (
						<span className="flex justify-end flex-1">
							{isDeleting ? (
								<LoadingSpinner size="sm" />
							) : (
								<FaTrash
									className="cursor-pointer hover:text-red-500"
									onClick={handleDeletePost}
								/>
							)}
						</span>
					)}
				</div>
				<div className="flex flex-col gap-3 overflow-hidden">
					<span>{post.text}</span>
					{post.img && (
						<img
							src={post.img}
							className="h-80 object-contain rounded-lg border border-gray-700"
							alt="Post content"
						/>
					)}
				</div>
				<div className="flex justify-between mt-3">
					<div className="flex gap-4 items-center w-2/3 justify-between">
						<div
							className="flex gap-1 items-center cursor-pointer group"
							onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
						>
							<FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
							<span className="text-sm text-slate-500 group-hover:text-sky-400">
								{post.comments.length}
							</span>
						</div>
						{/* DaisyUI Modal for Comments */}
						<dialog id={`comments_modal${post._id}`} className="modal border-none outline-none">
							<div className="modal-box rounded border border-gray-600">
								<h3 className="font-bold text-lg mb-4">COMMENTS</h3>
								<div className="flex flex-col gap-3 max-h-60 overflow-auto">
									{post.comments.length === 0 ? (
										<p className="text-sm text-slate-500">
											No comments yet 🤔 Be the first one 😉
										</p>
									) : (
										post.comments.map((comment) => (
											<div key={comment._id} className="flex gap-2 items-start">
												<div className="avatar">
													<div className="w-8 rounded-full">
														<img src={comment.user.profileImg || "/avatar.png"} alt="Comment User" />
													</div>
												</div>
												<div className="flex flex-col">
													<div className="flex items-center gap-1">
														<span className="font-bold">{comment.user.fullName}</span>
														<span className="text-gray-700 text-sm">
															@{comment.user.username}
														</span>
													</div>
													<div className="text-sm">{comment.text}</div>
												</div>
											</div>
										))
									)}
								</div>
								<form className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2" onSubmit={handlePostComment}>
									<textarea
										className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
										placeholder="Add a comment..."
										value={comment}
										onChange={(e) => setComment(e.target.value)}
									/>
									<button className="btn btn-primary rounded-full btn-sm text-white px-4">
										{isCommenting ? <LoadingSpinner size="sm" /> : "Post"}
									</button>
								</form>
							</div>
							<div className="modal-backdrop" onClick={() => document.getElementById("comments_modal" + post._id).close()}>
								<button className="outline-none text-white">close</button>
							</div>
						</dialog>
						<div className="flex gap-1 items-center group cursor-pointer">
							<BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
							<span className="text-sm text-slate-500 group-hover:text-green-500">0</span>
						</div>
						<div className="flex gap-1 items-center group cursor-pointer" onClick={handleLikePost}>
							{!isLiked ? (
								<FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
							) : (
								<FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500" />
							)}
							<span
								className={`text-sm group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"
									}`}
							>
								{post.likes.length}
							</span>
						</div>
					</div>
					<div className="flex w-1/3 justify-end gap-2 items-center">
						<FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Post;
