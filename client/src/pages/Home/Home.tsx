import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import qs from "qs";
import { getListing } from "../../apis/Listing/listing";
import Container from "../../components/Container";
import EmptyState from "../../components/EmptyState";
import ListingCard from "../../components/Listings/ListingCard";
import Pagination from "../../components/Pagination";
import useUserStore from "../../store/useStore";
import ListingStore from "../../store/listingsStore";
import { safeListingType } from "../../types/Listing";

const Home = () => {
  const currentUser = useUserStore((state) => state.user) ?? null;
  const { listings, setListings, pagination, setPagination, setCurrentPage } = ListingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchListings = useCallback(
    (page: number, updateUrl = true) => {
      setIsLoading(true);

      // Get all current search params (category, location, etc.)
      const currentQuery = searchParams ? qs.parse(searchParams.toString()) : {};

      // Merge with pagination params
      const queryParams = {
        ...currentQuery,
        page,
        limit: 12,
      };

      getListing(queryParams)
        .then((response) => {
          const { listings: fetchedListings, pagination: paginationData } = response.data;
          setListings(fetchedListings);
          setPagination(paginationData);
          setCurrentPage(page);

          // Update URL with current page only if requested
          if (updateUrl) {
            setSearchParams({
              ...currentQuery,
              page: page.toString(),
            } as Record<string, string>);
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch((error) => {
          console.error("Error fetching listings", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [searchParams, setListings, setPagination, setCurrentPage, setSearchParams]
  );

  useEffect(() => {
    // Read page from URL or default to 1
    const pageFromUrl = searchParams.get("page");
    const page = pageFromUrl ? parseInt(pageFromUrl) : 1;

    // Fetch without updating URL to avoid infinite loop
    fetchListings(page, false);
  }, [searchParams, fetchListings]);

  const handlePageChange = useCallback(
    (page: number) => {
      // Get current query params
      const currentQuery = searchParams ? qs.parse(searchParams.toString()) : {};

      // Update URL with new page number
      setSearchParams({
        ...currentQuery,
        page: page.toString(),
      } as Record<string, string>);
    },
    [searchParams, setSearchParams]
  );

  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-500">Loading...</div>
        </div>
      </Container>
    );
  }

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
        {listings.map((listing: safeListingType) => {
          return (
            <ListingCard
              key={listing._id}
              data={listing}
              currentUser={currentUser}
              actionId={listing._id}
            />
          );
        })}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={handlePageChange} />}
    </Container>
  );
};

export default Home;
