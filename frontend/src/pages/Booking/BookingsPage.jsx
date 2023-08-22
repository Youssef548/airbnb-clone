import React, { useState, useEffect } from "react";

import { AccountNav, BookingDate } from "../../components";
import axios from "axios";
import { bookPlaceRoute as getBooking } from "../../utils/Routes";
import { PlaceImg } from "../../components";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { Link, Navigate } from "react-router-dom";

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
              <Link
                key={index}
                to={book._id}
                className="flex gap-4 bg-gray-200 rounded-2xl overflow-hidden cursor-pointer"
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
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default BookingsPage;
