import Container from "../../components/Container";
import Heading from "../../components/Heading";
import { UserType } from "../../types/user";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import toast from "react-hot-toast";
import ListingCard from "../../components/Listings/ListingCard";
import ListingGrid from "../../components/Listings/ListingGrid";
import { safeListingType } from "../../types/Listing";
import { deleteListing, getListing } from "../../apis/Listing/listing";

interface PropertiesClientProps {
  listings: safeListingType[];
  setListings: Dispatch<SetStateAction<safeListingType[]>>;
  currentUser?: UserType | null | undefined;
}

const PropertiesClient: React.FC<PropertiesClientProps> = ({
  listings = [],
  currentUser,
  setListings,
}) => {
  const [deleteId, setDeletingId] = useState<string>("");

  const [, setIsLoading] = useState(true);

  const onCancel = useCallback((id: string) => {
    setDeletingId(id);

    deleteListing(id)
      .then((res) => {
        setIsLoading(true);
        if (res.status === 204) {
          toast.success("Listing deleted");
          getListing({ userId: currentUser?._id }).then((res) => {
            if (res.status == 200) {
              setListings(res.data.listings || res.data);
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
      .finally(() => {
        setIsLoading(false);
        setDeletingId("");
      });
  }, [currentUser?._id, setListings]);

  return (
    <Container>
      <Heading title="Properties" subTitle="List of your properties" />
      <ListingGrid>
        {listings.map((listing) => {
          return (
            <ListingCard
              key={listing._id}
              data={listing}
              actionId={listing._id}
              onAction={onCancel}
              disabled={deleteId === listing._id}
              actionLabel="Delete Property"
              currentUser={currentUser}
            />
          );
        })}
      </ListingGrid>
    </Container>
  );
};

export default PropertiesClient;
