import { useSearchParams } from "react-router-dom";
import useSearchModal from "../../../hooks/useSearchModal";
import useCountries from "../../../hooks/useCountries";
import { useMemo } from "react";
import { differenceInDays } from "date-fns";

const Search = () => {
  const searchModal = useSearchModal();
  const [params] = useSearchParams();
  const { getByValue } = useCountries();

  const locationValue = params?.get("locationValue");
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  const guestCount = params.get("guestCount");
  const locationLabel = useMemo(() => {
    if (locationValue) {
      return getByValue(locationValue as string)?.label;
    }

    return "anywhere";
  }, [getByValue, locationValue]);

  const durationLabel = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      let diff = differenceInDays(end, start);

      if (diff === 0) diff = 1;
      return `${diff} Days`;
    }

    return "Any week";
  }, [startDate, endDate]);

  const guestLabel = useMemo(() => {
    if (guestCount) return `${guestCount} Guests`;

    return "Add Guests";
  }, [guestCount]);

  return (
    <div
      onClick={searchModal.onOpen}
      className="
  w-full
  border-[1px]
  md:w-auto
  py-2
  rounded-full
  shadow-sm
  transition
  cursor-pointer
  hover:shadow-md
  "
    >
      <div
        className="
    flex
    flex-row
    items-center
    justify-between
    "
      >
        <div
          className="
    text-sm
    font-semibold
    px-6
    "
        >
          {locationLabel}
        </div>
        <div
          className="
        hidden
        sm:block
        text-sm
        font-semibold
        px-6
        border-x-[1px]
        flex-1
        text-center
        "
        >
          {durationLabel}
        </div>
        <div className="text-sm pl-6 pr-2 text-gray-600 flex flex-row items-center gap-3">
          <div className="hidden sm:block">{guestLabel}</div>
          <div className="p-2 bg-rose-500 rounded-full text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
