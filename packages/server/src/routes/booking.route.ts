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

router.post("/", isAuth, validateSchema(createBookSchema), createBooking);
router.get("/", isAuth, getMyBookings)

//TODO: add admin middleware (I didn't create admin role yet)
// router.get("/", isAdmin, isAuth, getBookings);
router.delete("/:bookingId", isAuth, validateObjectId("bookingId"), cancelBooking);

export default router;
