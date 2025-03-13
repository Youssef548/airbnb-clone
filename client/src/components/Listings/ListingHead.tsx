import useCountries from "../../hooks/useCountries";
import { UserType } from "../../types/user";
import Heading from "../Heading";
import HeartButton from "../HeartButton";
import { CountrySelectValue } from "../Inputs/CountrySelect";

interface ListingHeaderProps {
  title: string;
  locationValue: CountrySelectValue;
  imageSrc: string;
  id: string;
  currentUser: UserType | null | undefined;
}

const ListingHead = ({
  title,
  locationValue,
  imageSrc,
  id,
  currentUser,
}: ListingHeaderProps) => {
  const { getByValue } = useCountries();

  const location = getByValue(locationValue.value);

  return (
    <>
      <Heading
        title={title}
        subTitle={`${location?.region}, ${location?.label}`}
      />
      <div
        className="
    w-full
    h-[60vh]
    overflow-hidden
    rounded-xl
    relative
  "
      >
        <img
          alt="image"
          src={imageSrc}
          className="w-full h-full"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className="absolute top-5 right-5">
          <HeartButton listingId={id} currentUser={currentUser} />
        </div>
      </div>
    </>
  );
};

export default ListingHead;
