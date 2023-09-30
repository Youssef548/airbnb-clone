import React, { useState, useContext, useEffect } from "react";
import { differenceInCalendarDays } from "date-fns";
import { bookPlaceRoute } from "../../utils/Routes";
import axios from "axios";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../../store/UserContext";

const BookingWidget = ({ place }) => {
  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [redirect, setRedirect] = useState("");
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  let numberOfNights = 0;
  if (checkIn && checkOut) {
    numberOfNights = differenceInCalendarDays(
      new Date(checkOut),
      new Date(checkIn)
    );
  }

  const bookPlaceHandler = async () => {
    // Perform validation
    const validationErrors = {};
    if (checkIn === "") {
      validationErrors.checkIn = "Check-in date is required";
    }
    if (checkOut === "") {
      validationErrors.checkOut = "Check-out date is required";
    }
    if (numberOfGuests === "") {
      validationErrors.numberOfGuests = "Number of guests is required";
    }

    if (name === "") {
      validationErrors.name = "Full name is required";
    }

    if (mobile === "") {
      validationErrors.mobile = "Phone number is required";
    } else if (!/^\d{10}$/.test(mobile)) {
      validationErrors.mobile = "Invalid phone number format";
    }

    // If there are validation errors, update the errors state
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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

        const response = await axios.post(bookPlaceRoute, bookData, {
          withCredentials: true,
        });

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
            {errors.checkIn && (
              <span className="text-red-500">{errors.checkIn}</span>
            )}
          </div>
          <div className="py-3 px-4  mb-4 border-l">
            <label>Checkout</label>
            <input
              type="date"
              value={checkOut}
              onChange={(ev) => setCheckOut(ev.target.value)}
            />
            {errors.checkOut && (
              <span className="text-red-500">{errors.checkOut}</span>
            )}
          </div>
        </div>
        <div className="py-3 px-4 border-t">
          <label>Number of guests</label>
          <input
            type="number"
            value={numberOfGuests}
            onChange={(ev) => setNumberOfGuests(ev.target.value)}
          />
          {errors.numberOfGuests && (
            <span className="text-red-500">{errors.numberOfGuests}</span>
          )}
        </div>

        {numberOfNights > 0 && (
          <div className="py-3 px-4 border-t">
            <label>Your full name:</label>
            <input
              type="text"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
            {errors.name && <span className="text-red-500">{errors.name}</span>}

            <label>Phone number:</label>
            <input
              type="tel"
              value={mobile}
              onChange={(ev) => setMobile(ev.target.value)}
            />
            {errors.mobile && (
              <span className="text-red-500">{errors.mobile}</span>
            )}
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
