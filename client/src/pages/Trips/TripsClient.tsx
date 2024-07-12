import { useNavigate } from "react-router-dom";
import Container from "../../components/Container";
import Heading from "../../components/Heading";
import { ReservationSafeType } from "../../types/Reservation";
import { UserType } from "../../types/user";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { deleteReservation } from "../../apis/Reservations/reservation";
import ListingCard from "../../components/Listings/ListingCard";

interface TripsClieentProps {
  reservations: ReservationSafeType[];
  currentUser?: UserType | null | undefined;
}

const TripsClient: React.FC<TripsClieentProps> = ({
  reservations = [],
  currentUser,
}) => {
  console.log(reservations);

  const navigate = useNavigate();
  const [deleteId, setDeletingId] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);

  const onCancel = useCallback((id: string) => {
    setDeletingId(id);

    deleteReservation(id)
      .then((res) => {
        setIsLoading(true);
        if (res.status === 204) {
          toast.success("Reservation canceled");
        } else {
          toast.error(res?.data?.error);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error);
      })
      .finally(() => {
        setIsLoading(false);
        setDeletingId("");
      });
  }, []);

  return (
    <Container>
      <Heading
        title="Trips"
        subTitle="Where you've been and where you're going"
      />
      <div
        className="
      mt-10
      grid
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-5
      2xl:grid-cols-6
      gap-8
      "
      >
        {reservations.map((reservation) => {
          return (
            <ListingCard
              key={reservation._id}
              data={reservation.listing}
              reservation={reservation}
              actionId={reservation._id}
              onAction={() => {}}
              disabled={deleteId === reservation._id}
              actionLabel="Cancel reservation"
              currentUser={currentUser}
            />
          );
        })}
        {/* {reservations.map(
          (reservation) => {
            console.log(reservation);
          }
       
        )} */}
      </div>
    </Container>
  );
};

export default TripsClient;
