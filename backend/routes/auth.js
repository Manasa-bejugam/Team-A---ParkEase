const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "secret123"; // use env in production

// Helper: normalize email
function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : email;
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, vehicleNumber, vehicleType, phone, role } =
      req.body;

    const normalizedEmail = normalizeEmail(email);
    const normalizedVehicle = vehicleNumber ? vehicleNumber.trim().toUpperCase() : vehicleNumber;

    // check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { vehicleNumber: normalizedVehicle }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === normalizedEmail ? "Email" : "Vehicle Number";
      return res.status(400).json({ message: `User already exists with this ${field}` });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      vehicleNumber: normalizedVehicle,
      vehicleType,
      phone,
      role: role || 'user', // Default to 'user' if not specified
    });

    await user.save();

    // Create JWT token (same as login)
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return token and user data (auto-login after registration)
    res.json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vehicleNumber: user.vehicleNumber
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    console.log("Login body:", req.body);
    const { email, vehicleNumber, identifier, password } = req.body;
    const loginId = (identifier || email || vehicleNumber || "").trim();

    if (!loginId || !password) {
      return res.status(400).json({ message: "Email/Vehicle Number and Password are required" });
    }

    // Try finding by email (lowercase) or vehicleNumber (uppercase)
    let user = await User.findOne({ email: loginId.toLowerCase() });
    if (!user) {
      user = await User.findOne({ vehicleNumber: loginId.toUpperCase() });
    }

    if (!user) {
      return res.status(400).json({ message: "No account found with this Email or Vehicle Number" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "24h", // Increased to 24h for convenience
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        vehicleNumber: user.vehicleNumber
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
});

const authMiddleware = require("../middleware/authMiddleware");

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to your dashboard!", user: req.user });
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// // GET /api/user/vehicle → Return vehicle details
// router.get("/vehicle", authMiddleware, async (req, res) => {
//   try {
//     // If authMiddleware sets req.user with id or full user object:
//     // prefer fresh data (without password)
//     const user = await User.findById(req.user.id || req.user._id).select(
//       "vehicleNumber vehicleType"
//     );

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({
//       vehicleNumber: user.vehicleNumber || "Not provided",
//       vehicleType: user.vehicleType || "Not provided",
//     });
//   } catch (error) {
//     console.error("Vehicle route error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });
