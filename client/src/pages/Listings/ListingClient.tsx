import { ReservationType } from "../../types/Reservation";
import { ListingType } from "../../types/Listing";
import { UserType } from "../../types/user";
import { useMemo } from "react";
import { categories } from "../../components/layouts/Navbar/Categories";
import Container from "../../components/Container";
import ListingHead from "../../components/Listings/ListingHead";
import ListingInfo from "../../components/Listings/ListingInfo";

interface ListingClientProps {
  reservation?: ReservationType;
  listing: ListingType & {
    user: UserType;
  };
  currentUser?: UserType | null;
}
const ListingClient = ({ listing, currentUser }: ListingClientProps) => {
  const category = useMemo(() => {
    return categories.find((item) => item.label === listing.category);
  }, [listing.category]);

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
        </div>
      </div>
    </Container>
  );
};

export default ListingClient;
