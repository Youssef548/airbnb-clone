import passport from "passport";
import userModel from "../models/user.model.js";
import { hashPassword } from "../utils/bcryptUtils.js";

class UserController {
  static async createUser(req, res) {
    const { name, email, password } = req.body;

    try {
      if (!name || !email || !password) {
        return res
          .status(401)
          .json({ message: "Please provide all the required fields" });
      }
      const user = await userModel.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "This email is used already" });
      }

      const hashedPass = await hashPassword(password);
      const newUser = new userModel({
        name,
        email,
        password: hashedPass,
      });
      await newUser.save();

      res
        .status(201)
        .json({ message: "User registered successfully.", user: newUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  static async signUser(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(401).json({ meesage: info.message });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ message: "Login successfully.", user });
      });
    })(req, res, next);
  }

  static async logoutUser(req, res, next) {
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while logging out." });
      }

      res.status(200).json({ message: "Logged out successfully." });
    });
  }
}

export default UserController;
