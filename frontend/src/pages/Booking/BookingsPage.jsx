import React, { useState, useEffect } from "react";
import { AccountNav, BookingDate } from "../../components";
import { bookPlaceRoute as getBooking } from "../../utils/Routes";
import { PlaceImg } from "../../components";
import { Link } from "react-router-dom";
import makeReq from "../../libs/axiosInstance";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    makeReq.get(getBooking).then((response) => {
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
                  <h2 className="text-3xl ">{book.place.title}</h2>

                  <div className="text-xl">
                    <hr className="my-5 border-2"  />
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                        />
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
