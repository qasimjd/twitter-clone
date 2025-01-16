import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart, FaMessage } from "react-icons/fa6";

const NotificationPage = () => {

	const queryClient = useQueryClient();
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const response = await fetch("/api/notifications");
			const data = await response.json();

			if (!response.ok) {
				throw new Error("Something went wrong");
			}
			return data;
		},

	});

	const { mutate } = useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/notifications", {
				method: "DELETE",
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error("Something went wrong");
			}
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["notifications"]);
		},
		onError: (error) => {
			console.log(error);
		}
	});

	const deleteNotifications = () => {
		if (notifications.length === 0) return;
		notifications.length > 0 &&
			confirm("Are you sure you want to delete all notifications?") &&
			mutate();
	};

	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{notifications?.length === 0 && <div className='text-center p-4 text-slate-500'>No notifications found.</div>}
				{notifications?.map((notification) => (
					<div className='border-b border-gray-700' key={notification._id}>
						<div className='flex gap-2 p-4'>
							{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
							{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
							{notification.type === "comment" && <FaMessage className='w-7 h-7 text-slate-600' />}
							<Link to={`/profile/${notification.from.username}`}>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={notification.from.profilePicture || "/avatar.png"} />
									</div>
								</div>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.from.username}</span>{" "}
									{notification.type === "follow" ? "followed you" : notification.type === "like" ? "liked your post" : notification.type === "comment" && "commented on your post"}
								</div>
							</Link>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
export default NotificationPage;