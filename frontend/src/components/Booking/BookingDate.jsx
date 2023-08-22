import React from "react";

import { MdOutlineNightlightRound } from "react-icons/md";
import { differenceInCalendarDays, format } from "date-fns";
import { BsCalendar3 } from "react-icons/bs";

const BookingDate = ({ booking, className }) => {
  return (
    <div className={"flex gap-1  items-center" + className}>
      <div className="mt-2 py-2 border-t border-gray-300 flex gap-2  items-center">
        <div className="flex items-center gap-1">
          <MdOutlineNightlightRound />
          {differenceInCalendarDays(
            new Date(booking.checkOut),
            new Date(booking.checkIn)
          )}
          nights :
        </div>

        <div className="flex items-center gap-1">
          <BsCalendar3 />
          {format(new Date(booking.checkIn), "yyyy-MM-dd")} &rarr;
        </div>
        <div className="flex items-center gap-1">
          <BsCalendar3 />
          {format(new Date(booking.checkOut), "yyyy-MM-dd")}
        </div>
      </div>
    </div>
  );
};

export default BookingDate;
