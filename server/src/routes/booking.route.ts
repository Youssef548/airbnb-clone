import { Router } from "express";
import { isAuth } from "../middleware/auth.middleware";
import validateSchema from "../middleware/validationFactory.middleware";
import { createBookSchema } from "../schemas/booking.schema";
import { createBooking, getBookings } from "../controllers/booking.controller";

const router = Router();

router.post("/create", isAuth, validateSchema(createBookSchema), createBooking);
router.get("/bookings", isAuth, getBookings);

export default router;
