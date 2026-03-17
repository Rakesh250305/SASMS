import Provider from "../models/Provider.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// POST /provider/login
export const providerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const provider = await Provider.findOne({ email }).select("+password");
    if (!provider) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: provider._id, role: "provider" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        role: "provider",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /provider/
export const getProviderInfo = async (req, res) => {
  try {
    const provider = await Provider.findById(req.user.id).select("-password");
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });
    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /provider/profile
export const updateProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");
    res.status(200).json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /provider/change-password
export const changeProviderPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const provider = await Provider.findById(req.user.id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, provider.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Current password is incorrect" });

    provider.password = await bcrypt.hash(newPassword, 10);
    await provider.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};