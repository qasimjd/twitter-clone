import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../../hooks/useFollow";

const RightPanel = () => {

	const { data: sugestedUsers, isLoading } = useQuery({
		queryKey: ["usersForRightPanel"],
		queryFn: async () => {
			const response = await fetch("/api/user/sugested");
			if (!response.ok) {
				throw new Error("Something went wrong");
			}
			const data = await response.json();
			return data;
		},
		onSuccess: (data) => {
			console.log(data);
		},
		onError: (error) => {
			console.log(error);
		},
	});

	const { toggleFollow } = useFollow();

	if (sugestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>

	return (
		<div className='hidden lg:block mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-4'>
				<p className='font-bold pb-2'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						sugestedUsers?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profilePicture || "/avatar.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm w-20'
										onClick={(e) => {
											e.preventDefault()
											toggleFollow(user._id);
										}}
									>
										Follow
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;