import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { userSignup, getInfo, 
    getRecentBookings,
    getAllService,
    updateProfile,
  changePassword,
  uploadUserPhoto,
  deleteUserPhoto
     } from "../controllers/userController.js";

import {
  createBooking,
  getUserBookings,
  getUserBookingById,
  cancelBooking,
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getNotifications,
  markNotificationsRead,
} from "../controllers/bookingController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Login || Signup
router.post('/signup', userSignup);

// Profile
router.get("/", authenticate, authorizeRoles("user"), getInfo);
router.get("/recentBooking", authenticate, authorizeRoles("user"), getRecentBookings);
router.put("/profile", authenticate, authorizeRoles("user"), updateProfile);
router.put("/profile-photo", authenticate, authorizeRoles("user"), upload.single("profilePhoto"), uploadUserPhoto);
router.delete("/profile-photo", authenticate, authorizeRoles("user"), deleteUserPhoto);
router.put("/change-password", authenticate, authorizeRoles("user"), changePassword);

// Services
router.get("/allService", authenticate, authorizeRoles("user"), getAllService);

/* ── Bookings ── */
router.post("/booking/create", authenticate, authorizeRoles("user"), createBooking);
router.get("/booking", authenticate, authorizeRoles("user"), getUserBookings);
router.get("/booking/:id", authenticate, authorizeRoles("user"), getUserBookingById);
router.put("/booking/:id/cancel", authenticate, authorizeRoles("user"), cancelBooking);

/* ── Saved Addresses ── */
router.get("/address", authenticate, authorizeRoles("user"), getUserAddresses);
router.post("/address", authenticate, authorizeRoles("user"), createUserAddress);
router.put("/address/:id", authenticate, authorizeRoles("user"), updateUserAddress);
router.delete("/address/:id", authenticate, authorizeRoles("user"), deleteUserAddress);

/* ── Notifications ── */
router.get("/notifications", authenticate, authorizeRoles("user"), getNotifications);
router.put("/notifications/mark-read", authenticate, authorizeRoles("user"), markNotificationsRead);


export default router;

