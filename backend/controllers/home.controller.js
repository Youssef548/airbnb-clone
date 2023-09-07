import userModel from "../models/user.model.js";

class HomeController {
  static async index(req, res) {
    res.send(await userModel.find());
  }
  static async post(req, res) {
    let user = await new userModel({ name: "manga", email: "sparta" }).save();
    res.send(user);
  }
}
export default HomeController;
