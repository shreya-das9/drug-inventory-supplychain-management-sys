import User from "../../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create user (password will be hashed automatically by pre-save hook)
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    // create token - NOW EXPIRES IN 7 DAYS for easier testing!
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }  // ← CHANGED FROM "1h" TO "7d"
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
 };