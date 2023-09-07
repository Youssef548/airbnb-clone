class InfoController {
  static async getUserInfo(req, res) {
    if (req.isAuthenticated()) {
      const user = req.user;

      console.log(user.name);

      res.json({ user });
    } else {
      res.send(404);
    }
  }
}

export default InfoController;
