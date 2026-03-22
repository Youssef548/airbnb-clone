import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { ReservationSafeType } from "../../types/Reservation";
import { UserType } from "../../types/user";
import Container from "../../components/Container";
import Heading from "../../components/Heading";
import {
  deleteReservation,
  getReservation,
} from "../../apis/Reservations/reservation";
import toast from "react-hot-toast";
import ListingCard from "../../components/Listings/ListingCard";
import ListingGrid from "../../components/Listings/ListingGrid";

interface ReservationsProps {
  reservations: ReservationSafeType[];
  setReservations: Dispatch<SetStateAction<ReservationSafeType[]>>;
  currentUser?: UserType | null | undefined;
}

const ReservationsClient: React.FC<ReservationsProps> = ({
  reservations,
  setReservations,
  currentUser,
}) => {
  const [deleteId, setDeletedId] = useState<string>("");

  const onCancel = useCallback((id: string) => {
    setDeletedId(id);

    deleteReservation(id)
      .then((res) => {
        if (res.status === 204) {
          toast.success("Reservation Canceled");
          getReservation({ authorId: currentUser?._id }).then((res) => {
            if (res.status == 200) {
              setReservations(res.data);
            } else {
              toast.error("Something went wrong");
            }
          });
        } else {
          toast.error("Something went wrong");
        }
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ?? "Something went wrong";
        toast.error(message);
      })
      .finally(() => setDeletedId(""));
  }, [currentUser?._id, setReservations]);

  return (
    <Container>
      <Heading title="Reservations" subTitle="Bookings on your properties" />
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
              actionLabel="Cancel guest reservations"
              currentUser={currentUser}
            />
          );
        })}
      </ListingGrid>
    </Container>
  );
};

export default ReservationsClient;
