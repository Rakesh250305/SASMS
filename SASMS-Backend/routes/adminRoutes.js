import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  adminSignup,
  getInfo,
  updateInfo,
  uploadStorePhoto,
  deleteStorePhoto,
  getStats,
  getRecentActivities,
  changePassword,
  createAsset,
  getAdminAssets,
  deleteAsset,
  updateAsset,
  createProvider,
  getAdminProviders,
  updateProvider,
  updateProviderStatus,
  createService,
  getAdminService,
  updateService,
  deleteService,
} from "../controllers/adminController.js";
import {
  getAdminBookings,
  getAdminBookingById,
  assignBooking,
  getAdminBookingStats,
  getNotifications,
  markNotificationsRead,
} from "../controllers/bookingController.js";

import upload, { createUploader } from "../middleware/uploadMiddleware.js";

const router = express.Router();
const adminPhotoUpload = createUploader("uploads/admin");

// auth
router.post("/signup", adminSignup);

/* Profile and Dashboard */
router.get("/", authenticate, authorizeRoles("admin"), getInfo);
router.put("/profile", authenticate, authorizeRoles("admin"), updateInfo);
router.put("/store-photo", authenticate, authorizeRoles("admin"), adminPhotoUpload.single("storePhoto"), uploadStorePhoto);
router.delete("/store-photo", authenticate, authorizeRoles("admin"), deleteStorePhoto);
router.get("/stats", authenticate, authorizeRoles("admin"), getStats);
router.get("/activities", authenticate, authorizeRoles("admin"), getRecentActivities);
router.put("/change-password", authenticate, authorizeRoles("admin"), changePassword);

// assets 
router.get("/assets", authenticate, authorizeRoles("admin"), getAdminAssets);
router.post("/assets/create", authenticate, authorizeRoles("admin"), createAsset);
router.put("/assets/:id", authenticate, authorizeRoles("admin"), updateAsset);
router.delete("/assets/:id", authenticate, authorizeRoles("admin"), deleteAsset,);

// Provider
router.post("/provider/create", authenticate, authorizeRoles("admin"), createProvider);
router.get("/provider", authenticate, authorizeRoles("admin"), getAdminProviders);
router.put("/provider/:id", authenticate, authorizeRoles("admin"), updateProvider);
router.patch("/provider/:id/status", authenticate, authorizeRoles("admin"), updateProviderStatus);

// Services
router.post( "/service/create", authenticate, authorizeRoles("admin"), upload.single("serviceImage"), createService);
router.get("/service", authenticate, authorizeRoles("admin"), getAdminService);
router.put("/service/:id", authenticate, authorizeRoles("admin"),  upload.single("serviceImage"), updateService);
router.delete("/service/:id", authenticate, authorizeRoles("admin"), deleteService);

/* ── Bookings ── */
router.get("/booking", authenticate, authorizeRoles("admin"), getAdminBookings);
router.get("/booking/stats", authenticate, authorizeRoles("admin"), getAdminBookingStats);
router.get("/booking/:id", authenticate, authorizeRoles("admin"), getAdminBookingById);
router.put("/booking/:id/assign", authenticate, authorizeRoles("admin"), assignBooking);

/* ── Notifications ── */
router.get("/notifications", authenticate, authorizeRoles("admin"), getNotifications);
router.put("/notifications/mark-read", authenticate, authorizeRoles("admin"), markNotificationsRead);

export default router;
