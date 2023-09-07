import placeModel from "../models/place.model.js";

class PlacesController {

    

  static async index(req, res) {
    try {
      const places = await placeModel.find();
      if (!places) return res.status(404).json({ error: "Places not found" });

      return res.json(places);
    } catch (err) {
      console.log("Err while fetching places");
      res.status(500).json({ error: err.message });
    }
  }

  static async placeById(req, res) {
    const { id } = req.params;
    try {
      const place = await placeModel.findById(id);

      if (!place) {
        return res.status(404).json({ error: "Place not found" });
      }

      res.json(place);
    } catch (err) {
      console.error(`Error getting place by ID ${id}:`, err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the place" });
    }
  }



}

export default PlacesController;
