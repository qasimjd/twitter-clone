import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const Posts = ({ feedType, userId }) => {
	const { username } = useParams();


	const getPostEndpoint = () => {
		if (feedType === "forYou") return `${import.meta.env.VITE_API_URL}/api/posts/allPost`;
		if (feedType === "following") return `${import.meta.env.VITE_API_URL}/api/posts/following`;
		if (feedType === "posts") return `${import.meta.env.VITE_API_URL}/api/posts/user/${username}`;
		if (feedType === "liked") return `${import.meta.env.VITE_API_URL}/api/posts/liked/${userId}`;

		return "/api/posts/allPost";
	}

	const { data: POSTS, isLoading } = useQuery({
		queryKey: ["posts", feedType, username, userId],
		queryFn: async () => {
			const response = await fetch(getPostEndpoint());
			if (!response.ok) {
				throw new Error("An error occurred while fetching the data.");
			}
			const data = await response.json();
			return data.posts; // Extract the posts array from the response
		},
	});

	return (
		<>
			{isLoading && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && POSTS?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && POSTS && (
				<div className='space-y-4'>
					{POSTS.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;