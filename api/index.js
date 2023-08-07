require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const usersRouters = require("./routes/users");
const infoRouters = require("./routes/info");
const placesRouter = require("./routes/places");

const connectDB = require("./db/connect");

require("./passport/passportConfig");

const app = express();

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
app.use("/places", placesRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
  connectDB(process.env.MONGO_URI);
});
