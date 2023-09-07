import bookingModel from "../models/booking.model.js";

const getUserDataFromCookies = (req) => {
  if (req.isAuthenticated()) {
    // Access user data from the session object
    console.log(req.user);
    const userData = req.user;
    return userData;
  } else {
    return null; // User is not authenticated
  }
};

class BookingController {
  static async addBooking(req, res) {
    const userData = await getUserDataFromCookies(req);
    try {
      const { place, checkIn, checkOut, numberOfGuests, name, mobile, price } =
        req.body;

      const booking = await bookingModel.create({
        place,
        user: userData._id,
        checkIn,
        checkOut,
        numberOfGuests,
        name,
        mobile,
        price,
      });
      res.json({ data: booking, message: "Booking added successfully" });
    } catch (err) {
      console.error("Error adding booking:", err);
      res
        .status(500)
        .json({ error: "An error occurred while adding the booking" });
    }
  }
  static async getBookings(req, res) {
    try {
      const userData = getUserDataFromCookies(req);
      res.json(
        await bookingModel.find({ user: userData._id }).populate("place")
      );
    } catch (err) {
      console.error(`Error getting user's booking`, err);
      res.status(500).json({
        error:
          "An error occurred while fetching user's bookingsssssssssssssssss",
      });
    }
  }
}

export default BookingController;
