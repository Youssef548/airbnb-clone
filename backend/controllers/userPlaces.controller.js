import placeModel from "../models/place.model.js";
import { validatePlace } from "../validators/placeValidtor.js";
class userPlacesController {
  static async addPlace(req, res, next) {
    try {
      if (req.isAuthenticated()) {
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

        // Validate the request body against the schema
        const { error } = validatePlace(req.body);
        if (error) {
          // Return a 400 error if the update data is invalid
          return res.status(400).json({ error: error.details[0].message });
        }

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

        return res.json(placeDoc);
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }
    } catch (err) {
      console.error("Error creating place:", err);
      res
        .status(500)
        .json({ error: "An error occurred while creating the place" });
    }
  }

  static async getUserPlaces(req, res) {
    try {
      if (req.isAuthenticated()) {
        const places = await placeModel.find({ owner: req.user._id });
        return res.json(places);
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }
    } catch (err) {
      console.error("Error creating place:", err);
      res.status(500).json({ err: "An error occurred while fetching places" });
    }
  }
  static async getUserPlaceByID(req, res) {
    try {
      if (req.isAuthenticated()) {
        const { id } = req.params;
        const place = await placeModel.findById(id);

        if (!place) return res.status(404).json({ error: "Place not found" });

        res.json(place);
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }
    } catch (err) {
      console.error("Error fetching places:", err);
      res.status(500).json({ err: "An error occurred while fetching places" });
    }
  }
  static async updatePlace(req, res) {
    const { id } = req.params;
    try {
      if (req.isAuthenticated()) {
        const userId = req.user._id;

        const updatedPlace = {
          owner: userId,
          ...req.body,
        };

        const { error } = validatePlace(req.body);
        if (error) {
          // Return a 400 error if the update data is invalid
          return res.status(400).json({ error: error.details[0].message });
        }

        const place = await placeModel.findByIdAndUpdate(id, updatedPlace, {
          new: true,
        });

        if (!place) return res.status(404).json({ error: "Place not found" });

        return res.json(place);
      } else {
        return res.status(401).json({ status: "Unauthorized" });
      }
    } catch (err) {
      console.error("Error fetching places:", err);
      res.status(500).json({ err: "An error occurred while fetching places" });
    }
  }
}

export default userPlacesController;
