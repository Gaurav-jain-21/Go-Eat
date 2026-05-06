const Hotel = require("../models/Hotel");
exports.getNearbyHotels = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Please provide lat and lng" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDist = parseFloat(radius) * 1000 || 10000;

    const hotels = await Hotel.find({
      isApproved: true,
      isOpen: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDist,
        },
      },
    }).populate("foods");

    res.json({
      count: hotels.length,
      hotels,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDistanceToHotel = async (req, res) => {
  try {
    const { lat, lng, hotelId } = req.query;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const [hotelLng, hotelLat] = hotel.location.coordinates;

    const R = 6371;
    const dLat = toRad(hotelLat - parseFloat(lat));
    const dLng = toRad(hotelLng - parseFloat(lng));

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(parseFloat(lat))) *
        Math.cos(toRad(hotelLat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    res.json({
      hotel: hotel.name,
      distance: `${distance.toFixed(2)} km`,
      withinRange: distance <= 10,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toRad = (value) => (value * Math.PI) / 180;
