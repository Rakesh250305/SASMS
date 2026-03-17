import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Provider from "../models/Provider.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let account;
    // Select model based on role
    if (role === "admin") {
      account = await Admin.findOne({ email });
    } else if (role === "provider") {
      account = await Provider.findOne({ email });
    } else {
      account = await User.findOne({ email });
    }

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // Password check
    const match = await bcrypt.compare(password, account.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
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
    res.status(500).json({
      success: false,
      message: "Login Failed",
    });
  }
});

export default router;