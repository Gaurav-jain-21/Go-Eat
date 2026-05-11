const HotelLocation = require("../models/HotelLocation");

const UserLocation = require("../models/UserLocation");

const geolib = require("geolib");

const saveHotelLocation = async (req, res) => {
  try {
    const location = await HotelLocation.create(req.body);

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const saveUserLocation = async (req, res) => {
  try {
    const location = await UserLocation.findOneAndUpdate(
      {
        userId: req.user.id,
      },
      {
        userId: req.user.id,
        coordinates: req.body.coordinates,
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const nearbyHotels = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;

    const hotels = await HotelLocation.find({
      coordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },

          $maxDistance: 5000,
        },
      },
    });

    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const calculateDistance = async (req, res) => {
  try {
    const { userLat, userLng, hotelLat, hotelLng } = req.query;

    const distance = geolib.getDistance(
      {
        latitude: userLat,
        longitude: userLng,
      },
      {
        latitude: hotelLat,
        longitude: hotelLng,
      },
    );

    res.status(200).json({
      distanceInMeters: distance,
      distanceInKm: (distance / 1000).toFixed(2),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deliveryCheck = async (req, res) => {
  try {
    const { userLat, userLng, hotelLat, hotelLng } = req.query;

    const distance = geolib.getDistance(
      {
        latitude: userLat,
        longitude: userLng,
      },
      {
        latitude: hotelLat,
        longitude: hotelLng,
      },
    );

    if (distance <= 10000) {
      return res.status(200).json({
        deliveryAvailable: true,
        distanceInKm: (distance / 1000).toFixed(2),
      });
    }

    return res.status(200).json({
      deliveryAvailable: false,
      distanceInKm: (distance / 1000).toFixed(2),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  saveHotelLocation,
  saveUserLocation,
  nearbyHotels,
  calculateDistance,
  deliveryCheck,
};
