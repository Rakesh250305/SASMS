import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Provider from "../models/Provider.js";

const router = express.Router();
const roleModels = {
  admin: Admin,
  provider: Provider,
  user: User,
};

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const loweremail = email.toLowerCase().trim();

    // Search in ALL three collections simultaneously
    const [admin, provider, user] = await Promise.all([
      Admin.findOne({ email: loweremail }),
      Provider.findOne({ email: loweremail }),
      User.findOne({ email: loweremail }),
    ]);

    // Find which collection the email actually belongs to
    const foundIn = admin ? "admin" : provider ? "provider" : user ? "user" : null;

    // Email not found anywhere
    if (!foundIn) {
      return res.status(404).json({
        success: false,
        message: "Account not found. Please check your email or register.",
      });
    }

    // Email found but role doesn't match what user selected
    if (foundIn !== role) {
      return res.status(403).json({
        success: false,
        message: `This email is not registered as a ${role}. Please select the correct role.`,
      });
    }

    // Get the correct account object
    const account = admin ?? provider ?? user;

    if (foundIn === "provider" && account.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your provider account is deactivated. Please contact the admin.",
      });
    }

    // Password check
    if (!foundIn === "provider"){
      const match = await bcrypt.compare(password, account.password);
      if (!match) {
      return res.status(400).json({
        success: false,
        message: "Email or password is incorrect.",
      });
    }
    }

    // JWT Token
    const token = jwt.sign(
      {
        id: account._id,
        role: account.role,
        tenantId: account.tenantId || "",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      role: account.role,
      userId: account._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email, phone, role, newPassword } = req.body;

    if (!email || !phone || !role || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, phone, role, and new password are required.",
      });
    }

    if (role === "provider") {
      return res.status(403).json({
        success: false,
        message: "Providers cannot reset password here. Please contact your admin.",
      });
    }

    const Model = roleModels[role];
    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected.",
      });
    }

    const lowerEmail = email.toLowerCase().trim();
    const normalizedPhone = String(phone).trim();

    const account = await Model.findOne({ email: lowerEmail });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found for the selected role.",
      });
    }

    if ((account.phone || "").trim() !== normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number does not match this account.",
      });
    }

    account.password = await bcrypt.hash(newPassword, 10);
    await account.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
    });
  }
});

export default router;
