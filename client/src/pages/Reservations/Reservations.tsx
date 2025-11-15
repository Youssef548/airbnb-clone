import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import useUserStore from "../../store/useStore";
import { getReservation } from "../../apis/Reservations/reservation";
import ReservationsClient from "./ReservationsClient";
import { ReservationSafeType } from "../../types/Reservation";
import Loading from "../../components/Loading";

const ReservationsPage = () => {
  const user = useUserStore((state) => state.user);

  const [reservations, setReservations] = useState<ReservationSafeType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoading(true);

      getReservation({ authorId: user._id })
        .then((res) => {
          if (res.status == 200) {
            setReservations(res.data);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  if (reservations?.length === 0) {
    return (
      <EmptyState
        title="No Reservations found"
        subtitle="Looks like you have not reservations."
      />
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <EmptyState title="Unauthorized" subtitle="Please login" />;
  }
  return (
    <div>
      <ReservationsClient
        currentUser={user}
        reservations={reservations}
        setReservations={setReservations}
      />
    </div>
  );
};

export default ReservationsPage;
