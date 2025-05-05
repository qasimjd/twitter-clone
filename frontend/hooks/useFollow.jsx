import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: toggleFollow } = useMutation({
    mutationFn: async (userId) => {
      const response = await fetch(`/api/user/follow-unfollow/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to toggle follow status.");
      }

      return response.json();
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries(["userProfile", userId]); // Refresh the profile of the user
      queryClient.invalidateQueries(["authUser"]); // Refresh the current user's data
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong.");
    },
  });

  return { toggleFollow };
};

export default useFollow;
