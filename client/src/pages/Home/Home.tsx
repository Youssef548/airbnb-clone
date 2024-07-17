import { useEffect, useState } from "react";
import { getListing } from "../../apis/Listing/listing";
import Container from "../../components/Container";
import EmptyState from "../../components/EmptyState";
import ListingCard from "../../components/Listings/ListingCard";
import useUserStore from "../../store/useStore";
import ListingStore from "../../store/listingsStore";

const Home = () => {
  const currentUser = useUserStore((state) => state.user) ?? null;
  const { listings, setListings } = ListingStore();

  useEffect(() => {
    getListing({})
      .then((data) => {
        setListings(data.data);
      })
      .catch((error) => {
        console.error("Error fetching listings", error);
      });
  }, []);

  if (listings.length === 0) {
    return <EmptyState showReset />;
  }
  return (
    <Container>
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
      gap-8"
      >
        {listings.map((listing: any) => {
          return (
            <ListingCard
              key={listing._id}
              data={listing}
              currentUser={currentUser}
              actionId={listing.actionId}
            />
          );
        })}
      </div>
    </Container>
  );
};

export default Home;
