import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import { formatMemberSince } from "../../utils/db/timeFromater.js";
import UserListModal from "../../components/UserListModal";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useFollow from "../../../hooks/useFollow";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

const ProfilePage = () => {
	const { username } = useParams()
	const queryClient = useQueryClient();

	const [coverImg, setCoverImg] = useState(null);
	const [profileImg, setProfileImg] = useState(null);
	const [feedType, setFeedType] = useState("posts");
	const { toggleFollow } = useFollow();

	const [modalType, setModalType] = useState(null); // New state for modal type
	const [showModal, setShowModal] = useState(false); // State to toggle the modal

	const handleOpenModal = (type) => {
		setModalType(type);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setModalType(null);
		setShowModal(false);
	};



	const { mutateAsync: updateProfile, isPending: uploadingPicture } = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/user/update-profile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					profilePicture: profileImg,
					coverPicture: coverImg,
				}),
			});
			const result = await res.json();
			if (!res.ok) {
				throw new Error(result.message);
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			toast.success("Profile updated successfully");
		},
		onError: (error) => {
			console.log(error.message);
			toast.error("Failed to update profile");
		},
	});

	const coverImgRef = useRef(null);
	const profileImgRef = useRef(null);

	const { data: user, isLoading } = useQuery({
		queryKey: ["userProfile", username],
		queryFn: async () => {
			const res = await fetch(`/api/user/profile/${username}`);
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message);
			}
			return data;
		},
	});

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const isMyProfile = user?._id === authUser?._id;
	const memberSinsce = formatMemberSince(user?.createdAt);
	const alredyFollowing = user?.followers.includes(authUser?._id);

	const { data: POSTS } = useQuery({ queryKey: ["posts", username] });

	const handleImgChange = (e, state) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				state === "coverImg" && setCoverImg(reader.result);
				state === "profileImg" && setProfileImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<>
			<div className='flex-[4_4_0] border-r border-gray-700 min-h-screen '>
				{/* HEADER */}
				{isLoading && <ProfileHeaderSkeleton />}
				{!isLoading && !user && <p className='text-center text-lg mt-4'>User not found</p>}
				<div className='flex flex-col'>
					{!isLoading && user && (
						<>
							<div className='flex gap-10 px-4 py-2 items-center'>
								<Link to='/'>
									<FaArrowLeft className='w-4 h-4' />
								</Link>
								<div className='flex flex-col'>
									<p className='font-bold text-lg'>{user?.fullName}</p>
									<span className='text-sm text-slate-500'>{POSTS?.length} posts</span>
								</div>
							</div>
							{/* COVER IMG */}
							<div className='relative group/cover'>
								<img
									src={coverImg || user?.coverPicture || "https://www.schudio.com/wp-content/uploads/2024/08/twitter-embed-header.jpg"}
									className='h-52 w-full object-cover'
									alt='cover image'
								/>
								{isMyProfile && (
									<div
										className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
										onClick={() => coverImgRef.current.click()}
									>
										<MdEdit className='w-5 h-5 text-white' />
									</div>
								)}

								<input
									type='file'
									accept="image/*"
									hidden
									ref={coverImgRef}
									onChange={(e) => handleImgChange(e, "coverImg")}
								/>
								<input
									type='file'
									accept="image/*"
									hidden
									ref={profileImgRef}
									onChange={(e) => handleImgChange(e, "profileImg")}
								/>
								{/* USER AVATAR */}
								<div className='avatar absolute -bottom-16 left-4'>
									<div className='w-32 rounded-full relative group/avatar'>
										<img src={profileImg || user?.profilePicture || "/avatar.png"} />
										{isMyProfile && (
											<div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
												<MdEdit
													className='w-4 h-4 text-white'
													onClick={() => profileImgRef.current.click()}
												/>
											</div>
										)}
									</div>
								</div>
							</div>
							<div className='flex justify-end px-4 mt-5'>
								{isMyProfile && <EditProfileModal />}
								{!isMyProfile && (
									<button
										className='btn btn-outline rounded-full btn-sm w-20'
										onClick={(e) => {
											e.preventDefault();
											toggleFollow(user?._id)
										}}
									>
										{alredyFollowing ? "Unfollow" : "Follow"}
									</button>
								)}
								{(coverImg || profileImg) && (
									<button
										className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
										onClick={async () => {
											if (coverImg || profileImg) {
												await updateProfile();
												setCoverImg(null);
												setProfileImg(null);
											}
										}}
									>
										{uploadingPicture ? <LoadingSpinner size="sm" /> : "Save"}
									</button>
								)}
							</div>

							<div className='flex flex-col gap-4 mt-14 px-4'>
								<div className='flex flex-col'>
									<span className='font-bold text-lg'>{user?.fullName}</span>
									<span className='text-sm text-slate-500'>@{user?.username}</span>
									<span className='text-sm my-1'>{user?.bio}</span>
								</div>

								<div className='flex gap-2 flex-wrap'>
									{user?.link && (
										<div className='flex gap-1 items-center '>
											<>
												<FaLink className='w-3 h-3 text-slate-500' />
												<a
													href={user?.link}
													target='_blank'
													rel='noreferrer'
													className='text-sm text-blue-500 hover:underline'
												>
													{user?.link}
												</a>
											</>
										</div>
									)}
									<div className='flex gap-2 items-center'>
										<IoCalendarOutline className='w-4 h-4 text-slate-500' />
										<span className='text-sm text-slate-500'>{memberSinsce}</span>
									</div>
								</div>
								<div className="flex gap-2">
									<div
										className="flex gap-1 items-center cursor-pointer"
										onClick={() => handleOpenModal("followings")}
									>
										<span className="font-bold text-xs">{user?.followings.length}</span>
										<span className="text-slate-500 text-xs">Following</span>
									</div>
									<div
										className="flex gap-1 items-center cursor-pointer"
										onClick={() => handleOpenModal("followers")}
									>
										<span className="font-bold text-xs">{user?.followers.length}</span>
										<span className="text-slate-500 text-xs">Followers</span>
									</div>
								</div>
							</div>
							{showModal && (
								<UserListModal
									type={modalType}
									userId={user?._id}
									onClose={handleCloseModal}
								/>
							)}
							<div className='flex w-full border-b border-gray-700 mt-4'>
								<div
									className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
									onClick={() => setFeedType("posts")}
								>
									Posts
									{feedType === "posts" && (
										<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
									)}
								</div>
								<div
									className='flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer'
									onClick={() => setFeedType("liked")}
								>
									Liked
									{feedType === "liked" && (
										<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary' />
									)}
								</div>
							</div>
						</>
					)}

					{user && <Posts feedType={feedType} userId={user?._id} />}
				</div>
			</div>
		</>
	);
};
export default ProfilePage;