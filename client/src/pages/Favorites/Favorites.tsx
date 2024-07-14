import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import useUserStore from "../../store/useStore";
import { safeListingType } from "../../types/Listing";
import { getFavoriteListings } from "../../apis/Favorites/favorite";
import toast from "react-hot-toast";
import FavoritesClient from "./FavoritesClient";

const FavoritesPage = () => {
  const user = useUserStore((state) => state.user);

  const [listings, setListings] = useState<safeListingType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>();
  useEffect(() => {
    setIsLoading(true);
    getFavoriteListings()
      .then((res) => {
        if (res.status === 200) {
          setListings(res.data);
        } else {
          toast.error("something went wrong");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (listings?.length === 0) {
    return (
      <div>
        <EmptyState
          title="No favorites found"
          subtitle="Looks like you have no favorite listings."
        />
      </div>
    );
  }

  if (!user) {
    return <EmptyState title="Unauthorized" subtitle="Please login" />;
  }
  return (
    <div>
      <FavoritesClient
        currentUser={user}
        listings={listings}
        setListings={setListings}
      />
    </div>
  );
};

export default FavoritesPage;
