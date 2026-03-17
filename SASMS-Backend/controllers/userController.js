import User from '../models/User.js'
import bcrypt from "bcrypt";
import Service from '../models/Service.js';
import Activity from '../models/Activity.js';

// User Signup
export const userSignup = async (req, res) => {

  try {
    const { name, email, phone, password, role, address, city, state, pincode} = req.body;
    const lowerEmail = email.toLowerCase();
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
  console.log("Update Profile");
}

// Get All Services
export const getAllService = async (req, res) => {
  try {

    const services = await Service.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: services,
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