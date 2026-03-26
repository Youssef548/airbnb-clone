import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmptyState from "../../components/EmptyState";
import useUserStore from "../../store/useStore";
import { getReservation } from "../../apis/Reservations/reservation";
import ReservationsClient from "./ReservationsClient";
import { ReservationSafeType } from "@airbnb/shared";
import Loading from "../../components/Loading";

const ReservationsPage = () => {
  const user = useUserStore((state) => state.user);

  const [reservations, setReservations] = useState<ReservationSafeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);

      getReservation({ authorId: user._id })
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
        title="No Reservations found"
        subtitle="Looks like you have no reservations on your properties."
      />
    );
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
