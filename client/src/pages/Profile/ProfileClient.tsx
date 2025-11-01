import { useState } from "react";
import { Icon } from "@iconify/react";
import Avatar from "../../components/Avatar";
import Heading from "../../components/Heading";
import Container from "../../components/Container";
import useEditProfileModal from "../../hooks/useEditProfileModal";
import useChangePasswordModal from "../../hooks/useChangePasswordModal";
import { formatDistanceToNow } from "date-fns";

interface ProfileClientProps {
  profile: any;
  stats?: any;
  isOwnProfile: boolean;
  currentUser: any;
}

const ProfileClient: React.FC<ProfileClientProps> = ({
  profile,
  stats,
  isOwnProfile,
}) => {
  const editProfileModal = useEditProfileModal();
  const changePasswordModal = useChangePasswordModal();

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar src={profile.image} size="xl" />
                {isOwnProfile && (
                  <button
                    onClick={() => editProfileModal.onOpen()}
                    className="absolute bottom-0 right-0 bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition"
                  >
                    <Icon icon="mdi:pencil" fontSize={16} />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-neutral-800">
                  {profile.username}
                </h1>
                <p className="text-neutral-500 mt-1">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Icon
                    icon="mdi:shield-check"
                    className={
                      profile.emailVerified ? "text-green-500" : "text-gray-400"
                    }
                  />
                  <span className="text-sm text-neutral-600">
                    {profile.emailVerified
                      ? "Email Verified"
                      : "Email Not Verified"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Icon icon="mdi:calendar" className="text-neutral-400" />
                  <span className="text-sm text-neutral-600">
                    Joined {formatDistanceToNow(new Date(profile.createdAt))} ago
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isOwnProfile && (
              <div className="flex gap-2">
                <button
                  onClick={() => editProfileModal.onOpen()}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition"
                >
                  <Icon icon="mdi:pencil" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => changePasswordModal.onOpen()}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition"
                >
                  <Icon icon="mdi:lock" />
                  <span>Change Password</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics - Only for own profile */}
        {isOwnProfile && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon="mdi:home"
              label="Listings"
              value={stats.totalListings}
              color="blue"
            />
            <StatCard
              icon="mdi:calendar-check"
              label="Bookings"
              value={stats.totalBookings}
              color="green"
            />
            <StatCard
              icon="mdi:star"
              label="Reviews"
              value={stats.totalReviews}
              color="yellow"
            />
            <StatCard
              icon="mdi:heart"
              label="Favorites"
              value={stats.totalFavorites}
              color="rose"
            />
          </div>
        )}

        {/* Recent Activity - Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <Heading title="Recent Activity" subtitle="Your recent actions" />
          <div className="mt-4 text-center text-neutral-500 py-8">
            <Icon
              icon="mdi:information-outline"
              fontSize={48}
              className="mx-auto mb-4 text-neutral-300"
            />
            <p>Activity feed coming soon!</p>
          </div>
        </div>
      </div>
    </Container>
  );
};

// StatCard Component
interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  color: "blue" | "green" | "yellow" | "rose";
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="text-2xl font-bold text-neutral-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon icon={icon} fontSize={24} />
        </div>
      </div>
    </div>
  );
};

export default ProfileClient;
