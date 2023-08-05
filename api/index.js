require("dotenv").config();
const express = require("express");
const cors = require("cors");
const usersRouters = require("./routes/users");
const connectDB = require("./db/connect");

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/auth", usersRouters);

app.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
  connectDB(process.env.MONGO_URI);
});
