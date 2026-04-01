import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  // providerLogin,
  getProviderInfo,
  updateProviderProfile,
  uploadProviderPhoto,
  deleteProviderPhoto,
  changeProviderPassword,
} from "../controllers/providerController.js";
import {
  getProviderBookings,
  getProviderBookingById,
  updateBookingStatus,
  getProviderStats,
  getNotifications,
  markNotificationsRead,
} from "../controllers/bookingController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* ── Profile ── */
router.get("/", authenticate, authorizeRoles("provider"), getProviderInfo);
router.put("/profile", authenticate, authorizeRoles("provider"), updateProviderProfile);
router.put("/profile-photo", authenticate, authorizeRoles("provider"), upload.single("profilePhoto"), uploadProviderPhoto);
router.delete("/profile-photo", authenticate, authorizeRoles("provider"), deleteProviderPhoto);
router.put("/change-password", authenticate, authorizeRoles("provider"), changeProviderPassword);

/* ── Dashboard Stats ── */
router.get("/stats", authenticate, authorizeRoles("provider"), getProviderStats);

/* ── Bookings / Tasks ── */
router.get("/booking", authenticate, authorizeRoles("provider"), getProviderBookings);
router.get("/booking/:id", authenticate, authorizeRoles("provider"), getProviderBookingById);
router.put("/booking/:id/status", authenticate, authorizeRoles("provider"), updateBookingStatus);

/* ── Notifications ── */
router.get("/notifications", authenticate, authorizeRoles("provider"), getNotifications);
router.put("/notifications/mark-read", authenticate, authorizeRoles("provider"), markNotificationsRead);

export default router;
