import Container from "../../components/Container";
import Heading from "../../components/Heading";
import { ReservationSafeType } from "../../types/Reservation";
import { UserType } from "../../types/user";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import toast from "react-hot-toast";
import {
  deleteReservation,
  getReservation,
} from "../../apis/Reservations/reservation";
import ListingCard from "../../components/Listings/ListingCard";
import ListingGrid from "../../components/Listings/ListingGrid";

interface TripsClientProps {
  reservations: ReservationSafeType[];
  setReservations: Dispatch<SetStateAction<ReservationSafeType[]>>;
  currentUser?: UserType | null | undefined;
}

const TripsClient: React.FC<TripsClientProps> = ({
  reservations = [],
  currentUser,
  setReservations,
}) => {
  const [deleteId, setDeletingId] = useState<string>("");

  const [, setIsLoading] = useState(true);

  const onCancel = useCallback((id: string) => {
    setDeletingId(id);

    deleteReservation(id)
      .then((res) => {
        setIsLoading(true);
        if (res.status === 204) {
          toast.success("Reservation canceled");
          getReservation({ userId: currentUser?._id }).then((res) => {
            if (res.status == 200) {
              setReservations(res.data);
            } else {
              toast.error("Something went wrong");
            }
          });
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
      <ListingGrid>
        {reservations.map((reservation) => {
          return (
            <ListingCard
              key={reservation._id}
              data={reservation.listing}
              reservation={reservation}
              actionId={reservation._id}
              onAction={onCancel}
              disabled={deleteId === reservation._id}
              actionLabel="Cancel reservation"
              currentUser={currentUser}
            />
          );
        })}
      </ListingGrid>
    </Container>
  );
};

export default TripsClient;
