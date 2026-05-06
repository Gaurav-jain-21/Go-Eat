const Hotel = require("../models/Hotel");

exports.registerHotel = async (req, res) => {
  try {
    const { name, description, phone, address, latitude, longitude } = req.body;

    const existing = await Hotel.findOne({ owner: req.user.id });
    if (existing)
      return res
        .status(400)
        .json({ message: "You already registered a hotel" });

    const hotel = await Hotel.create({
      owner: req.user.id,
      name,
      description,
      phone,
      address,
      image: req.file ? req.file.path : null,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    res
      .status(201)
      .json({
        message: "Hotel registered! Waiting for admin approval.",
        hotel,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user.id }).populate("foods");
    if (!hotel) return res.status(404).json({ message: "No hotel found" });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user.id });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const { name, description, phone, address, isOpen } = req.body;
    if (name) hotel.name = name;
    if (description) hotel.description = description;
    if (phone) hotel.phone = phone;
    if (address) hotel.address = address;
    if (isOpen !== undefined) hotel.isOpen = isOpen;
    if (req.file) hotel.image = req.file.path;

    await hotel.save();
    res.json({ message: "Hotel updated", hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ isApproved: true, isOpen: true })
      .populate("foods")
      .select("-owner");
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate("foods");
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.approveHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true },
    );
    res.json({ message: "Hotel approved", hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
