import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getListingById } from "../../apis/Listing/listing";
import { ListingType, UserType, ReservationSafeType } from "@airbnb/shared";
import EmptyState from "../../components/EmptyState";
import useUserStore from "../../store/useStore";
import ListingClient from "./ListingClient";
import { getReservation } from "../../apis/Reservations/reservation";
import Loading from "../../components/Loading";

const ListingPage = () => {
  const user = useUserStore((state) => state.user);
  const { listingId = "" } = useParams<string>();

  const { data, isLoading } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: async () => {
      const [listingRes, reservationsRes] = await Promise.all([
        getListingById(listingId),
        getReservation({ listingId }),
      ]);

      const listingData: (ListingType & { user: UserType }) | null =
        listingRes.status === 200 ? listingRes.data : null;

      const reservations: ReservationSafeType[] =
        reservationsRes.status === 200 ? reservationsRes.data : [];

      return { listingData, reservations };
    },
    enabled: !!listingId,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!data?.listingData) {
    return <EmptyState showReset />;
  }

  return (
    <div>
      <ListingClient
        listing={data.listingData}
        currentUser={user}
        reservations={data.reservations}
      />
    </div>
  );
};

export default ListingPage;
