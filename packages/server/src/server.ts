import "./config/env";
import app from "./app";
import { connectDatabase } from "@airbnb/database";

const PORT = process.env.PORT || 3000;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
