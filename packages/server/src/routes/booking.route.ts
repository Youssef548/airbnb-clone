import { Router } from "express";
import { isAuth } from "../middleware/auth.middleware";
import validateSchema from "../middleware/validationFactory.middleware";
import { cancelBookSchema, createBookSchema } from "@airbnb/database";
import {
  cancelBooking,
  createBooking,
  getMyBookings,
} from "../controllers/booking.controller";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

/**
 * @swagger
 * /booking:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [totalPrice, startDate, endDate, listingId]
 *             properties:
 *               totalPrice: { type: number }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               listingId: { type: string }
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Date conflict or invalid data
 *       401:
 *         description: Authentication required
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings with populated listings
 *       401:
 *         description: Authentication required
 *
 * /booking/{bookingId}:
 *   delete:
 *     summary: Cancel a booking (guest or listing owner)
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       403:
 *         description: Not authorized to cancel
 */
router.post("/", isAuth, validateSchema(createBookSchema), createBooking);
router.get("/", isAuth, getMyBookings);

//TODO: add admin middleware (I didn't create admin role yet)
// router.get("/", isAdmin, isAuth, getBookings);
router.delete(
  "/:bookingId",
  isAuth,
  validateObjectId("bookingId"),
  cancelBooking
);

export default router;
