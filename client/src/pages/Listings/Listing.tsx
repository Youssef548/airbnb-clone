import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getListingById } from "../../apis/Listing/listing";
import { ListingType } from "../../types/Listing";
import EmptyState from "../../components/EmptyState";
import useUserStore from "../../store/useStore";
import ListingClient from "./ListingClient";
import { UserType } from "../../types/user";



const ListingPage = () => {
    const user = useUserStore((state) => state.user);

  const { listingId = "" } = useParams<string>();

  const [listingData, setListingData] = useState<null | ListingType & { user: UserType }>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getListingById(listingId)
      .then((res) => {
        if (res.status === 200) {
          setListingData(res.data);
        } else if (res.status === 404) {
          console.log("Listing not found");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if(!listingData) {
    return <EmptyState showReset/>
  }

  return <div>
    
    <ListingClient 
        listing={listingData}
        currentUser={user}
    />
  </div>;
};

export default ListingPage;
