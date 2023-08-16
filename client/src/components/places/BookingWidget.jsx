import React, { useState, useContext } from "react";
import { differenceInCalendarDays } from "date-fns";
import { bookPlaceRoute } from "../../utils/Routes";
import axios from "axios";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../../store/UserContext";

const BookingWidget = ({ place }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [redirect, setRedirect] = useState("");
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  let numberOfNights = 0;
  if (checkIn && checkOut) {
    numberOfNights = differenceInCalendarDays(
      new Date(checkOut),
      new Date(checkIn)
    );
  }

  const bookPlaceHandler = async () => {
    try {
      if (user) {
        const bookData = {
          place: place._id,
          checkIn,
          checkOut,
          numberOfGuests,
          name,
          mobile,
          price: numberOfNights * place.price,
        };

        const response = await axios.post(bookPlaceRoute, bookData);

        const bookingId = response.data.data._id;
        console.log(bookingId);
        setRedirect(`/account/bookings/${bookingId}`);
      } else {
        navigate("/login");
        alert("you need to login first");
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="bg-white shadow p-4 rounded-2xl ">
      <div className="text-2xl text-center">
        Price : ${place.price} / per night
      </div>
      <div className="border rounded-2xl mt-4">
        <div className="flex">
          <div className="py-3 px-4 ">
            <label>Check- in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(ev) => setCheckIn(ev.target.value)}
            />
          </div>
          <div className="py-3 px-4  mb-4 border-l">
            <label>Checkout</label>
            <input
              type="date"
              value={checkOut}
              onChange={(ev) => setCheckOut(ev.target.value)}
            />
          </div>
        </div>
        <div className="py-3 px-4 border-t">
          <label>Number of guests</label>
          <input
            type="number"
            value={numberOfGuests}
            onChange={(ev) => setNumberOfGuests(ev.target.value)}
          />
        </div>

        {numberOfNights > 0 && (
          <div className="py-3 px-4 border-t">
            <label>Your full name:</label>
            <input
              type="text"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
            <label>Phone number:</label>
            <input
              type="tel"
              value={mobile}
              onChange={(ev) => setMobile(ev.target.value)}
            />
          </div>
        )}
      </div>

      <button className="primary" onClick={bookPlaceHandler}>
        Book this place
        {numberOfNights > 0 && (
          <>
            <span> ${numberOfNights * place.price}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default BookingWidget;
