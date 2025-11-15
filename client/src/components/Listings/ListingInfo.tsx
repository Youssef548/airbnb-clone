import { UserType } from "../../types/user";
import type { IconifyIcon } from "@iconify/types";
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
  price: number;
  coordinates?: [number, number];
}

const ListingInfo = ({
  user,
  description,
  price,
  guestCount,
  roomCount,
  bathRoomCount,
  category,
  coordinates,
}: ListingInfoProps) => {

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
      <div className="text-lg font-light text-neutral-500">{description}</div>
      <div className="text-lg font-semibold text-neutral-800">
        ${price} per night
      </div>
      <hr />
      {category && (
        <ListingCategory icon={category.icon} label={category.label} />
      )}
      <hr />
      <Map center={coordinates} />
    </div>
  );
};

export default ListingInfo;
