import React, { useState, useEffect } from "react";
import { AccountNav, BookingDate } from "../../components";
import axios from "axios";
import { bookPlaceRoute as getBooking } from "../../utils/Routes";
import { PlaceImg } from "../../components";
import { Link } from "react-router-dom";

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
      <div className="flex flex-col gap-10 bg-gray-100 px-5 py-10">
        {bookings?.length > 0 &&
          bookings.map((book, index) => {
            return (
              <Link
                key={index}
                to={book._id}
                className="flex flex-col md:flex-row gap-4   overflow-hidden cursor-pointer"
              >
                <div className="w-full  md:w-[300px] md:h-[200px]">
                  <PlaceImg
                    place={book.place}
                    className="rounded-lg w-full h-full"
                  />
                </div>

                <div className="flex flex-col">
                  <h2 className="text-xl">{book.place.title}</h2>

                  <div className="text-xl">
                    <BookingDate booking={book} />

                    <div className="flex gap-1 items-center">
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
