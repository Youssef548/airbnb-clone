import { useEffect, useState } from "react";
import { getReservation } from "../../apis/Reservations/reservation";
import EmptyState from "../../components/EmptyState";
import useUserStore from "../../store/useStore";
import { ReservationSafeType } from "../../types/Reservation";
import TripsClient from "./TripsClient";
import Loading from "../../components/Loading";

const TripsPage = () => {
  const user = useUserStore((state) => state.user);

  const [reservations, setReservations] = useState<ReservationSafeType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoading(true);

      getReservation({ userId: user._id })
        .then((res) => {
          if (res.status == 200) {
            setReservations(res.data);
          } else {
            console.log("SOMETHING WENT WRONG");
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  if (!user) {
    return <EmptyState title="Unauthorized" subtitle="Please login" />;
  }

  if (reservations?.length === 0) {
    return (
      <EmptyState
        title="No trips found"
        subtitle="Looks like you have not made any trips."
      />
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <TripsClient
        reservations={reservations}
        currentUser={user}
        setReservations={setReservations}
      />
    </div>
  );
};

export default TripsPage;
