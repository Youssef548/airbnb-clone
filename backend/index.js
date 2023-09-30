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

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  } else {
    next();
  }
});

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
