import { useParams } from "react-router-dom";
import { bookPlaceRoute } from "../../utils/Routes";
import { useEffect, useState } from "react";
import { AddressLink, BookingDate, PlaceGallery } from "../../components";
import makeReq from "../../libs/axiosInstance";

const BookingPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState();

  useEffect(() => {
    if (id) {
      makeReq.get(bookPlaceRoute).then((res) => {
        const foundBooking = res.data.find(({ _id }) => _id === id);
        if (foundBooking) {
          console.log(foundBooking);
          setBooking(foundBooking);
        }
      });
    }
  }, [id]);

  if (!booking) {
    return "";
  }

  return (
    <div className="my-8">
      <div className="container">
        <h1 className="text-3xl">{booking.place.title}</h1>
        <AddressLink className={"my-2 block"}>
          {booking.place.address}
        </AddressLink>
        <div className="bg-gray-200 p-6 my-6 rounded-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl mb-4">Your booking information </h2>
            <BookingDate booking={booking} />{" "}
          </div>

          <div className="bg-primary p-6 text-white rounded-2xl">
            <div>Total price </div>
            <div className="text-3xl">${booking.price}</div>
          </div>
        </div>

        <PlaceGallery place={booking.place} />
      </div>
    </div>
  );
};

export default BookingPage;
