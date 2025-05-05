import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Link } from "react-router-dom";
import useFollow from "../../hooks/useFollow";

const UserListModal = ({ type, userId, onClose }) => {

    const { data, isLoading } = useQuery({
        queryKey: [type, userId],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${type}/${userId}`);
            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.message);
            }
            return result;
        },
    });

    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    const { toggleFollow } = useFollow();

    const handleOutsideClick = (e) => {
        if (e.target.classList.contains("modal-overlay")) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 modal-overlay"
            onClick={handleOutsideClick}
        >
            <div className="bg-black rounded-lg p-4 min-w-1/3 md:w-1/3" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">{type === "followers" ? "Followers" : "Following"}</h2>
                </div>
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <ul className="space-y-2">
                        {data.map((user) => (
                            <Link
                                to={`/profile/${user.username}`}
                                className='flex items-center justify-between gap-4'
                                key={user._id}
                            >
                                <div className='flex gap-2 items-center' onClick={onClose}>
                                    <div className='avatar'>
                                        <div className='w-8 rounded-full'>
                                            <img src={user.profilePicture || "/avatar.png"}/>
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
                                        {authUser?.followings.includes(user._id)
                                            ? user.followings.includes(authUser?._id)
                                                ? "Friend"
                                                : "Unfollow"
                                            : "Follow"}
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default UserListModal;
