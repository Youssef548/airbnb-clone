import { ReservationType } from "../../types/Reservation";
import { ListingType } from "../../types/Listing";
import { UserType } from "../../types/user";
import { useCallback, useEffect, useMemo, useState } from "react";
import { categories } from "../../components/layouts/Navbar/Categories";
import Container from "../../components/Container";
import ListingHead from "../../components/Listings/ListingHead";
import ListingInfo from "../../components/Listings/ListingInfo";
import useLoginModal from "../../hooks/useLoginModal";
import { useNavigate } from "react-router-dom";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { createReservation } from "../../apis/Reservations/reservation";
import toast from "react-hot-toast";
import ListingReservation from "../../components/Listings/ListingReservation";
import { Range } from "react-date-range";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

interface ListingClientProps {
  reservations?: ReservationType[];
  listing: ListingType & {
    user: UserType;
  };
  currentUser?: UserType | null;
}
const ListingClient = ({
  listing,
  reservations = [],
  currentUser,
}: ListingClientProps) => {
  const category = useMemo(() => {
    return categories.find((item) => item.label === listing.category);
  }, [listing.category]);

  const loginMOdal = useLoginModal();
  const navigate = useNavigate();

  const disabledDates = useMemo(() => {
    let dates: Date[] = [];

    reservations.forEach((reservation: any) => {
      const range = eachDayOfInterval({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
      });

      dates = [...dates, ...range];
    });

    return dates;
  }, [reservations]);

  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(listing.price);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);

  const onCreateReservation = useCallback(() => {
    if (!currentUser) {
      return loginMOdal.onOpen();
    }

    setIsLoading(true);

    createReservation({
      totalPrice,
      startDate: dateRange.startDate || new Date(),
      endDate: dateRange.endDate || new Date(),
      listingId: listing._id,
    })
      .then(() => {
        toast.success("Listing reserved!");
        setDateRange(initialDateRange);
        // redirect to /trips
        navigate(`/listing/${listing._id}`, { replace: true });
      })
      .catch(() => {
        toast.error("Something went wrong");
      })
      .finally(() => setIsLoading(false));
  }, [totalPrice, dateRange, listing?._id, currentUser, useNavigate]);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      console.log(dateRange);
      const dayCount = differenceInCalendarDays(
        dateRange.endDate,
        dateRange.startDate
      );

      if (dayCount && listing.price) {
        console.log(dayCount);
        setTotalPrice(dayCount * listing.price);
      } else {
        setTotalPrice(listing.price);
      }
    }
  }, [dateRange, listing.price]);

  return (
    <Container>
      <div className="max-w-screen mx-auto p-6">
        <div className="flex flex-col gap-6">
          <ListingHead
            title={listing.title}
            imageSrc={listing.imageSrc}
            locationValue={listing.location}
            id={listing._id}
            currentUser={currentUser}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
          <ListingInfo
            user={listing.user}
            category={category}
            description={listing.description}
            price={listing.price}
            roomCount={listing.roomCount}
            guestCount={listing.guestCount}
            bathRoomCount={listing.bathRoomCount}
            locationValue={listing.location}
          />
          <div
            className="
          order-first
          mb-10
          md:order-last
          md:col-span-3"
          >
            <ListingReservation
              price={listing.price}
              totalPrice={totalPrice}
              onChangeDate={(value) => setDateRange(value)}
              dateRange={dateRange}
              onSubmit={onCreateReservation}
              disabled={isLoading}
              disabledDates={disabledDates}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ListingClient;
