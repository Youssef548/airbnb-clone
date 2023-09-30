class InfoController {
  static async getUserInfo(req, res) {
    try {
      if (req.isAuthenticated()) {
        const user = req.user;
        console.log(user.name);
        res.status(200).json({ user });
      } else {
        console.log("JUST AN ERROR");
        // res.status(401).json({ error: "User is not authenticated" });
        res.status(401).send("User is not authenticated");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  }
}

export default InfoController;
