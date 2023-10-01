import React from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { AiOutlineCalendar } from "react-icons/ai";

const BookingDate = ({ booking, className }) => {
  return (
    <div className={"flex flex-col gap-1 items-center" + className}>
      <div className="mb-6 py-2  flex flex-col items-start md:flex-row gap-2 md:items-center">
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
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
