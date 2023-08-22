require("dotenv").config();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: __dirname + "/.env" });
}

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const usersRouters = require("./routes/users");
const infoRouters = require("./routes/info");
const userPlacesRouter = require("./routes/userPlaces");
const placesRouter = require("./routes/places");
const bookingRouter = require("./routes/bookingRouter");

const connectDB = require("./db/connect");

require("./passport/passportConfig");

const app = express();

const port = process.env.PORT || 5000;

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.json());

// Session middleware

app.use(
  session({
    secret: "your_secret_key_here", // Replace with your own secret key
    resave: false,
    httpOnly: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", usersRouters);
app.use("/profile", infoRouters);
app.use("/user-places", userPlacesRouter);
app.use("/places", placesRouter);
app.use("/booking", bookingRouter);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
  connectDB(process.env.MONGO_URI);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend", "build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));
  });
}
