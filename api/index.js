require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("./passport/passportConfig");
const cors = require("cors");
const usersRouters = require("./routes/users");
const connectDB = require("./db/connect");

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: "your_secret_key_here", // Replace with your own secret key
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/auth", usersRouters);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
  connectDB(process.env.MONGO_URI);
});
