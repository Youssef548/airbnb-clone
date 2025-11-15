import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getListingById } from "../../apis/Listing/listing";
import { ListingType } from "../../types/Listing";
import EmptyState from "../../components/EmptyState";
import useUserStore from "../../store/useStore";
import ListingClient from "./ListingClient";
import { UserType } from "../../types/user";
import { ReservationSafeType } from "../../types/Reservation";
import { getReservation } from "../../apis/Reservations/reservation";
import Loading from "../../components/Loading";

const ListingPage = () => {
  const user = useUserStore((state) => state.user);

  const { listingId = "" } = useParams<string>();

  const [listingData, setListingData] = useState<
    null | (ListingType & { user: UserType })
  >(null);

  const [reservations, setReservations] = useState<ReservationSafeType[]>();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getListingById(listingId)
      .then((res) => {
        if (res.status === 200) {
          setListingData(res.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, [listingId]);

  useEffect(() => {
    setIsLoading(true);
    getReservation({ listingId })
      .then((res) => {
        if (res.status === 200) {
          setReservations(res.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, [listingId]);

  if (isLoading) {
    return <Loading />;
  }

  if (!listingData) {
    return <EmptyState showReset />;
  }

  return (
    <div>
      <ListingClient
        listing={listingData}
        currentUser={user}
        reservations={reservations}
      />
    </div>
  );
};

export default ListingPage;
