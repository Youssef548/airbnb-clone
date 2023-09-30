import React from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { AiOutlineCalendar } from "react-icons/ai";

const BookingDate = ({ booking, className }) => {
  return (
    <div className={"flex flex-col gap-1 items-center" + className}>
      <div className="mt-2 py-2 border-t border-gray-300 flex flex-col md:flex-row gap-2 items-center">
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            {/* Your SVG icon */}
          </svg>
          {differenceInCalendarDays(
            new Date(booking.checkOut),
            new Date(booking.checkIn)
          )}{" "}
          nights :
        </div>

        <div className="flex items-center gap-1">
          <AiOutlineCalendar />
          <span className="hidden md:inline">
            {format(new Date(booking.checkIn), "yyyy-MM-dd")} &rarr;
          </span>
          <span className="md:hidden">
            {format(new Date(booking.checkIn), "MM/dd/yyyy")} &rarr;
          </span>
        </div>
        <div className="flex items-center gap-1">
          <AiOutlineCalendar />
          <span className="hidden md:inline">
            {format(new Date(booking.checkOut), "yyyy-MM-dd")}
          </span>
          <span className="md:hidden">
            {format(new Date(booking.checkOut), "MM/dd/yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingDate;
