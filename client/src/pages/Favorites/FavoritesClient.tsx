import { Dispatch, SetStateAction, useEffect } from "react";
import { safeListingType } from "../../types/Listing";
import { UserType } from "../../types/user";
import Container from "../../components/Container";
import Heading from "../../components/Heading";
import ListingCard from "../../components/Listings/ListingCard";
import ListingGrid from "../../components/Listings/ListingGrid";
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
        setListings(res.data.favorites);
      }
    });
  }, [currentUser?.favoriteListingsIds]);
  return (
    <Container>
      <Heading title="Favorites" subTitle="List of places you have favorited" />
      <ListingGrid>
        {listings.map((list) => (
          <ListingCard
            currentUser={currentUser}
            key={list._id}
            data={list}
            actionId={list._id}
          />
        ))}
      </ListingGrid>
    </Container>
  );
};

export default FavoritesClient;
