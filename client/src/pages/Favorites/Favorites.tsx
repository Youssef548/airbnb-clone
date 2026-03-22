import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import useUserStore from "../../store/useStore";
import { getFavoriteListings } from "../../apis/Favorites/favorite";
import toast from "react-hot-toast";
import FavoritesClient from "./FavoritesClient";
import ListingStore from "../../store/listingsStore";
import Loading from "../../components/Loading";

const FavoritesPage = () => {
  const user = useUserStore((state) => state.user);
  const { listings, setListings } = ListingStore();
  const [isLoading, setIsLoading] = useState<boolean>();
  useEffect(() => {
    setIsLoading(true);
    getFavoriteListings()
      .then((res) => {
        if (res.status === 200) {
          setListings(res.data.favorites || res.data);
        } else {
          toast.error("something went wrong");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Loading />;
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
