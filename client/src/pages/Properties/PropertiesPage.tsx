import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmptyState from "../../components/EmptyState";
import useUserStore from "../../store/useStore";
import { getListing } from "../../apis/Listing/listing";
import PropertiesClient from "./PropertiesClient";
import ListingStore from "../../store/listingsStore";
import Loading from "../../components/Loading";

const PropertiesPage = () => {
  const user = useUserStore((state) => state.user);
  const { listings, setListings } = ListingStore();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoading(true);

      getListing({ userId: user._id })
        .then((res) => {
          if (res.status == 200) {
            setListings(res.data.listings);
          } else {
            toast.error("Something went wrong");
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  if (!user) {
    return <EmptyState title="Unauthorized" subtitle="Please login" />;
  }

  if (listings?.length === 0) {
    return (
      <EmptyState
        title="No properties found"
        subtitle="Looks like you have not made any properties."
      />
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <PropertiesClient
        listings={listings}
        currentUser={user}
        setListings={setListings}
      />
    </div>
  );
};

export default PropertiesPage;
