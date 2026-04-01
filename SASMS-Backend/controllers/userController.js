import User from '../models/User.js'
import bcrypt from "bcrypt";
import Service from '../models/Service.js';
import Activity from '../models/Activity.js';
import Admin from '../models/Admin.js';
import { put } from "@vercel/blob";
import { del } from "@vercel/blob";

// User Signup
export const userSignup = async (req, res) => {

  try {
    const { name, email, phone, password, role, address, city, state, pincode} = req.body;
    const loweremail = email.toLowerCase().trim();
    // Check if user already exists
    const existingUser = await User.findOne({ email: lowerEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: lowerEmail,
      phone,
      password: hashedPassword,
      role,
      address,
      city,
      state,
      pincode,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message });
  }

};

// Get user Information
export const getInfo = async (req, res) => {
  try {
    const account = await User.findById(req.user.id).select("-password");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fetched Successfully",
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fetch Failed",
    });
  }
};

// Get Recent Bookings
export const getRecentBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const activities = await Activity.find({ 
      actorId: userId,
      actorType: "User"
    })
    .populate({
      path: "entityId",
      model: "Booking",
      populate: [
        { path: "service", select: "serviceName category serviceImage" },
        { path: "provider", select: "name" }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(3);

    res.status(200).json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error("REcent BOKING error:", error)
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Change Password 
export const changePassword = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// update Profile 
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, gender, address, city, state, pincode } = req.body;
 
    // Build update object — only include fields that were sent
    const updates = {};
    if (name    !== undefined) updates.name    = name.trim();
    if (phone   !== undefined) updates.phone   = phone.trim();
    if (bio     !== undefined) updates.bio     = bio.trim();
    if (gender  !== undefined) updates.gender  = gender.toLowerCase();
    if (address !== undefined) updates.address = address.trim();
    if (city    !== undefined) updates.city    = city.trim();
    if (state   !== undefined) updates.state   = state.trim();
    if (pincode !== undefined) updates.pincode = pincode.trim();
 
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");
 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
 
    res.status(200).json({ message: "Profile updated successfully", data: user });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Uplaod User Profile Photo 
export const uploadUserPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile photo is required",
      });
    }

    const account = await User.findById(req.user.id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload to Vercel Blob
    const blob = await put(
      `user/${Date.now()}-${req.file.originalname}`,
      req.file.buffer,
      {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );

    // blob.url → public URL
    account.profilePhoto = blob.url;
    await account.save();

    res.status(200).json({
      success: true,
      message: "Photo uploaded Successfully",
      profilePhoto: blob.url,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete user Profile Photo
export const deleteUserPhoto = async (req, res) => {
  try {
    const account = await User.findById(req.user.id);

    if (account?.profilePhoto) {
      await del(account.profilePhoto, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }

    account.profilePhoto = "";
    await account.save();

    res.json({ success: true, message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Services
export const getAllService = async (req, res) => {
  try {

    const services = await Service.find({ availability: "available" }).sort({ createdAt: -1 });
    const tenantIds = [...new Set(services.map((service) => service.tenantId).filter(Boolean))];
    const admins = await Admin.find({ tenantId: { $in: tenantIds } }).select(
      "tenantId storePhoto storeName storeAddress city state pincode website"
    );
    const adminByTenantId = new Map(
      admins.map((admin) => [admin.tenantId, admin])
    );

    const servicesWithStore = services.map((service) => {
      const admin = adminByTenantId.get(service.tenantId);
      return {
        ...service.toObject(),
        store: admin
          ? {
              storePhoto: admin.storePhoto || "",
              storeName: admin.storeName || "",
              storeAddress: admin.storeAddress || "",
              city: admin.city || "",
              state: admin.state || "",
              pincode: admin.pincode || "",
              website: admin.website || "",
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      data: servicesWithStore,
      message: "Services fetched successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch Services",
      error: error.message
    });

  }
};
