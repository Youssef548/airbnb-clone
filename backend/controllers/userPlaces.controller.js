import placeModel from "../models/place.model.js";

class userPlacesController {
  static async addPlace(req, res, next) {
    try {
      const {
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      } = req.body;

      const placeDoc = await placeModel.create({
        owner: req.user._id,
        price,
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });

      res.json(placeDoc);
    } catch (err) {
      console.error("Error creating place:", err);
      res
        .status(500)
        .json({ error: "An error occurred while creating the place" });
    }
  }
  static async getUserPlaces(req, res) {
    try {
      res.json(await placeModel.find({ owner: req.user._id }));
    } catch (err) {
      console.error("Error creating place:", err);
      res.status(500).json({ err: "An error occurred while fetching places" });
    }
  }
  static async getUserPlaceByID(req, res) {
    try {
      const { id } = req.params;
      const place = await placeModel.findById(id);

      if (!place) return res.status(404).json({ error: "Place not found" });

      res.json(place);
    } catch (err) {
      console.error("Error fetching places:", err);
      res.status(500).json({ err: "An error occurred while fetching places" });
    }
  }
  static async updatePlace(req, res) {
    const { id } = req.params;
    try {
      const userId = req.user._id;
      const updatedPlace = {
        owner: userId,
        ...req.body,
      };

      const place = await placeModel.findByIdAndUpdate(id, updatedPlace, {
        new: true,
      });

      if (!place) return res.status(404).json({ error: "Place not found" });

      res.json(place);
    } catch (err) {
      console.error("Error fetching places:", err);
      res.status(500).json({ err: "An error occurred while fetching places" });
    }
  }
}

export default userPlacesController;
