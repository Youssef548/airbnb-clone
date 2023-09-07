import express from "express";
import session from "express-session";
import { config } from "dotenv";
import homeRouter from "./routes/home.router.js";
import placeRouter from "./routes/place.router.js";
import userRouter from "./routes/user.router.js";
import bookingRouter from "./routes/booking.router.js";
import infoRouter from "./routes/info.router.js";
import userPlacesRouter from "./routes/userPlaces.router.js";
import mongoose from "mongoose";
import "./passport/passportConfig.js";
import MongoStore from "connect-mongo";
import passport from "passport";
import cors from "cors";
config();
const app = express();
const port = 3000;

const MongoDBStore = new MongoStore(session);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sessionStore = new MongoDBStore({
  mongooseConnection: mongoose.connection,
  collection: "sessions", // Collection where session data will be stored
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "qwpjepqjwekpqekqe",
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: function (origin, callback) {
      // Check if the origin is allowed (you can implement your own logic here)
      const allowedOrigins = [process.env.frontEndOrigin];
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // You can include credentials with this setup
  })
);

app.use(homeRouter);
app.use("/auth", userRouter);
app.use("/profile", infoRouter);
app.use("/user-places", userPlacesRouter);
app.use("/places", placeRouter);
app.use("/booking", bookingRouter);

async function bootstrap() {
  await mongoose.connect(process.env.MONGODB_URI);

  app.listen(port, () => {
    console.log(`localhost:${port}`);
  });
}
bootstrap();
