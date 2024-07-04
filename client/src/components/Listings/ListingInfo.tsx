import { UserType } from "../../types/user";
import { Icon } from "@iconify/react";
import type { IconifyIcon } from "@iconify/types";
import useCountries from "../../hooks/useCountries";
import Avatar from "../Avatar";
import ListingCategory from "./ListingCategory";
import Map from "../Map";

interface ListingInfoProps {
  user: UserType;
  description: string;
  guestCount: number;
  roomCount: number;
  bathRoomCount: number;
  category:
    | {
        icon: IconifyIcon;
        label: string;
      }
    | undefined;
  locationValue: string;
  price: number;
}

const ListingInfo = ({
  user,
  description,
  price,
  guestCount,
  roomCount,
  bathRoomCount,
  category,
  locationValue,
}: ListingInfoProps) => {
  const { getByValue } = useCountries();

  const coordinates = getByValue(locationValue)?.latlng;

  return (
    <div className="col-span-4 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div
          className="
         text-xl
         font-semibold
         flex
         flex-row
         items-center
         gap-2
        "
        >
          <div>Hosted by {user?.username}</div>
          <Avatar src={user?.image} />
        </div>
        <div
          className="
        flex
        flex-row
        items-center
        gap-4
        font-light
        text-neutral-500
        "
        >
          {guestCount} guests
          <div>{roomCount} bedrooms</div>
          <div>{bathRoomCount} bathrooms</div>
        </div>
      </div>
      <hr />
      {category && (
        <ListingCategory icon={category.icon} label={category.label} />
      )}
      <hr />
      <Map center={coordinates}/>
    </div>
  );
};

export default ListingInfo;
