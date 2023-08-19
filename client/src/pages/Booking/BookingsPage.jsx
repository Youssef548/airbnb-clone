import React, { useState, useEffect } from "react";

import { useParams } from "react-router-dom";
import { AccountNav, BookingDate } from "../../components";
import axios from "axios";
import { bookPlaceRoute as getBooking } from "../../utils/Routes";
import { PlaceImg } from "../../components";
import { differenceInCalendarDays, format } from "date-fns";
import { BsCalendar3 } from "react-icons/bs";
import { MdOutlineNightlightRound } from "react-icons/md";
import { FaRegMoneyBillAlt } from "react-icons/fa";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    axios.get(getBooking, { withCredentials: true }).then((response) => {
      setBookings(response.data);
    });
  }, []);

  return (
    <div>
      <AccountNav />
      <div>
        {bookings?.length > 0 &&
          bookings.map((book, index) => {
            return (
              <div
                key={index}
                className="flex gap-4 bg-gray-200 rounded-2xl overflow-hidden"
              >
                <div className="w-48 ">
                  <PlaceImg place={book.place} />
                </div>
                <div className="py-3 pr-3 grow">
                  <h2 className="text-xl">{book.place.title}</h2>
           
                  <div className="text-xl">
                    <BookingDate booking={book} />
             

                    <div className="flex gap-1 items-center">
                      <FaRegMoneyBillAlt />
                      Total price: ${book.price}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default BookingsPage;
