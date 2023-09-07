// import express from "express";
import { Router } from "express";
import bookingController from "../controllers/booking.controller.js";
import isAuthMiddleWare from "../middlewares/isAuth.js";
const router = Router();

router.post("/", isAuthMiddleWare, bookingController.addBooking);
router.get("/", isAuthMiddleWare, bookingController.getBookings);

export default router;
