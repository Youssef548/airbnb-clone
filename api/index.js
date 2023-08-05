const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.get("/test", (req, res) => {
  res.send("test ok");
});

app.listen(process.env.PORT, () =>
  console.log(`Server listening on ${process.env.PORT}`)
);
