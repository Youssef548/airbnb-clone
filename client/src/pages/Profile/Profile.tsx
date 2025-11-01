import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useUserStore from "../../store/useStore";
import EmptyState from "../../components/EmptyState";
import Loading from "../../components/Loading";
import ProfileClient from "./ProfileClient";
import toast from "react-hot-toast";
import axios from "axios";

const ProfilePage = () => {
  const { userId } = useParams();
  const currentUser = useUserStore((state) => state.user);
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = !userId || userId === currentUser?._id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);

        if (isOwnProfile && currentUser) {
          // Fetch authenticated user's full profile
          const token = localStorage.getItem("token");
          const [profileRes, statsRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/users/stats`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          setProfileData(profileRes.data);
          setStats(statsRes.data);
        } else if (userId) {
          // Fetch public profile
          const profileRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/users/${userId}`
          );
          setProfileData(profileRes.data);
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast.error(error.response?.data?.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, currentUser, isOwnProfile]);

  if (isLoading) {
    return <Loading />;
  }

  if (!currentUser && isOwnProfile) {
    return (
      <EmptyState
        title="Unauthorized"
        subtitle="Please login to view your profile"
      />
    );
  }

  if (!profileData) {
    return (
      <EmptyState title="Profile not found" subtitle="This user does not exist" />
    );
  }

  return (
    <ProfileClient
      profile={profileData}
      stats={stats}
      isOwnProfile={isOwnProfile}
      currentUser={currentUser}
    />
  );
};

export default ProfilePage;
