const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message || "Server error during registration" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      return res.json({
        token: generateToken(user),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    res.status(401).json({ message: "Invalid email or password" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    // No token blacklisting needed, front-end will remove token
    res.json({ message: "Logged out successfully" });
  } catch {
    res.status(500).json({ message: "Could not logout" });
  }
};

// ⭐ UPDATE DOCTOR LOCATION
exports.updateLocation = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can update location" });
    }

    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      location: {
        type: "Point",
        coordinates: [longitude, latitude]
      }
    });

    res.json({ message: "Location updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error updating location" });
  }
};

// ⭐ GET NEARBY DOCTORS (for patients)
// ⭐ GET NEARBY DOCTORS (for patients)
exports.getNearbyDoctors = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    // STEP 1: Find doctors who DO have valid coordinates (real location)
    const doctorsWithLocation = await User.find({
      role: "doctor",
      "location.coordinates": { $exists: true }
    });

    // STEP 2: Calculate distance manually for each doctor
    const R = 6371; // Earth radius (km)
    const toRad = (val) => (val * Math.PI) / 180;

    const doctorsWithin10Km = doctorsWithLocation
      .map((doc) => {
        const [docLng, docLat] = doc.location.coordinates;

        const dLat = toRad(docLat - latitude);
        const dLng = toRad(docLng - longitude);

        // Haversine formula
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(latitude)) *
            Math.cos(toRad(docLat)) *
            Math.sin(dLng / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // in KM

        return {
          ...doc.toObject(),
          distance: Number(distance.toFixed(2)),
        };
      })
      .filter((doc) => doc.distance <= 10);

    // STEP 3: Doctors WITHOUT LOCATION (location undefined)
    const doctorsWithoutLocation = await User.find({
      role: "doctor",
      "location.coordinates": { $exists: false }
    }).lean();

    const doctorsWithNoCoords = doctorsWithoutLocation.map((doc) => ({
      ...doc,
      distance: null
    }));

    // STEP 4: Combine both
    const finalList = [...doctorsWithin10Km, ...doctorsWithNoCoords];

    res.json(finalList);
  } catch (err) {
    console.error("NEARBY ERROR:", err);
    res.status(500).json({ message: "Error finding doctors" });
  }
};



// ⭐ DOCTOR: Get all reports assigned to this doctor
exports.getMyReports = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can view reports" });
    }

    const reports = await Report.find({ doctor: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(reports);

  } catch (err) {
    res.status(500).json({ message: "Failed to load reports" });
  }
};

exports.languageUpdate = async (req, res) => {
  try {
    const { language } = req.body;
    await User.findByIdAndUpdate(req.user.id, { language });
    res.json({ success: true, message: 'Language updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update language' });
  }
}