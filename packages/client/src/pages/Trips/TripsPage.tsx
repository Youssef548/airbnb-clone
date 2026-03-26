import { useEffect, useState } from "react";
import { getReservation } from "../../apis/Reservations/reservation";
import toast from "react-hot-toast";
import EmptyState from "../../components/EmptyState";
import useUserStore from "../../store/useStore";
import { ReservationSafeType } from "@airbnb/shared";
import TripsClient from "./TripsClient";
import Loading from "../../components/Loading";

const TripsPage = () => {
  const user = useUserStore((state) => state.user);

  const [reservations, setReservations] = useState<ReservationSafeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);

      getReservation({})
        .then((res) => {
          if (res.status == 200) {
            setReservations(res.data);
          } else {
            toast.error("Something went wrong");
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return <EmptyState title="Unauthorized" subtitle="Please login" />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (reservations?.length === 0) {
    return (
      <EmptyState
        title="No trips found"
        subtitle="Looks like you have not made any trips."
      />
    );
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
