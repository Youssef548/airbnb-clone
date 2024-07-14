import { Dispatch, SetStateAction, useEffect } from "react";
import { safeListingType } from "../../types/Listing";
import { UserType } from "../../types/user";
import Container from "../../components/Container";
import Heading from "../../components/Heading";
import ListingCard from "../../components/Listings/ListingCard";
import { getFavoriteListings } from "../../apis/Favorites/favorite";

interface FavoritesClientProps {
  currentUser: UserType | null | undefined;
  listings: safeListingType[];
  setListings: Dispatch<SetStateAction<safeListingType[]>>;
}

const FavoritesClient: React.FC<FavoritesClientProps> = ({
  currentUser,
  listings,
  setListings,
}) => {
  useEffect(() => {
    if (!currentUser) return;
    getFavoriteListings().then((res) => {
      if (res.status === 200) {
        setListings(res.data);
      }
    });
  }, [currentUser?.favoriteListingsIds]);
  return (
    <Container>
      <Heading title="Favorites" subTitle="List of places you have favorited" />
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
        {listings.map((list) => (
          <ListingCard
            currentUser={currentUser}
            key={list._id}
            data={list}
            actionId={list._id}
          />
        ))}
      </div>
    </Container>
  );
};

export default FavoritesClient;
