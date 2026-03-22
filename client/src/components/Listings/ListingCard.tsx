import { memo, useCallback, useMemo } from "react";
import useCountries from "../../hooks/useCountries";
import { ListingType } from "../../types/Listing";
import { ReservationSafeType, ReservationType } from "../../types/Reservation";
import { UserType } from "../../types/user";

import { useNavigate } from "react-router-dom";

import { format } from "date-fns";
import Image, { optimizedImageUrl } from "../../utils/Image";
import HeartButton from "../HeartButton";
import Button from "../Buttons";

interface ListingProps {
  data: ListingType;
  currentUser: UserType | null | undefined;
  reservation?: ReservationType | ReservationSafeType;
  onAction?: (id: string) => void;
  actionLabel?: string;
  disabled?: boolean;
  actionId: string;
}

const ListingCard: React.FC<ListingProps> = ({
  data,
  currentUser,
  reservation,
  onAction,
  disabled,
  actionId,
  actionLabel = "Book",
}) => {
  const navigate = useNavigate();

  const { getByValue } = useCountries();

  const location = getByValue(data.location.value);

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (disabled) return;

      onAction?.(actionId);
    },
    [onAction, actionId, disabled]
  );

  const price = useMemo(() => {
    if (reservation) {
      return reservation.totalPrice as number;
    }

    return data.price;
  }, [reservation, data.price]);

  const reservationDate = useMemo(() => {
    if (!reservation) return null;

    const checkInDate = new Date(reservation.startDate);
    const checkOutDate = new Date(reservation.endDate);

    return `${format(checkInDate, "PP")} ${format(checkOutDate, "PP")}`;
  }, [reservation]);
  return (
    <div
      onClick={() => navigate(`/listing/${data._id}`)}
      className="
    col-span-1 cursor-pointer group"
    >
      <div className="flex flex-col gap-2 w-full">
        <div
          className="
        aspect-square
        w-full
        relative
        overflow-hidden
        rounded-xl
        "
        >
          <Image
            alt="listing"
            src={optimizedImageUrl(data.imageSrc, 400)}
            className="
            object-cover
            w-full
            h-full
            group-hover:scale-110
            transition
            "
          />
          <div className="absolute top-3 right-3">
            <HeartButton listingId={data._id} currentUser={currentUser} />
          </div>
        </div>

        <div className="font-semibold text-lg">
          {location?.region}, {location?.label}
        </div>
        <div className="font-light text-neutral-500">
          {reservationDate || data.category}
        </div>
        <div className="flex flex-row items-center gap-1">
          <div className="font-semibold">$ {price}</div>
          {!reservation && <div className="font-light">night</div>}
        </div>
        {onAction && actionLabel && (
          <Button
            disabled={disabled}
            small
            label={actionLabel}
            onClick={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default memo(ListingCard);
