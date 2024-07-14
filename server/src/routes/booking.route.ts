import { Router } from "express";
import { isAuth } from "../middleware/auth.middleware";
import validateSchema from "../middleware/validationFactory.middleware";
import { cancelBookSchema, createBookSchema } from "../schemas/booking.schema";
import {
  cancelBooking,
  createBooking,
  getBookings,
} from "../controllers/booking.controller";

const router = Router();

router.post("/create", isAuth, validateSchema(createBookSchema), createBooking);
router.get("/bookings", isAuth, getBookings);
router.delete("/cancel/:bookingId", isAuth, cancelBooking);

export default router;
