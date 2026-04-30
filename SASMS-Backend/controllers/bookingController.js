import Booking from "../models/Bookings.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Provider from "../models/Provider.js";
import Asset from "../models/Asset.js";
import Notification from "../models/Notification.js";
import UserAddress from "../models/UserAddress.js";
import Address from "../models/UserAddress.js"; 
import Activity from "../models/Activity.js";

const PROVIDER_WORKING_CHARGE = 50;

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const createNotification = async ({ recipientId, recipientModel, title, message, type, bookingId }) => {
  await Notification.create({
    recipient: recipientId,
    recipientModel,
    title,
    message,
    type,
    booking: bookingId,
  });
};


const generateBookingId = async (serviceName) => {
  // Extract initials from service name → "Laptop Repair" → "LR"
  const initials = serviceName
    .split(" ")
    .map(word => word[0].toUpperCase())
    .join("");

  // Count existing bookings for this service type
  const count = await Booking.countDocuments({
    bookingId: { $regex: `^BK-${initials}-` }
  });

  // Pad the number → 1 → "001"
  const serial = String(count + 1).padStart(3, "0");

  return `BK-${initials}-${serial}`;
};

/* ─────────────────────────────────────────
   USER CONTROLLERS
───────────────────────────────────────── */

// POST /user/booking/create

export const createBooking = async (req, res) => {
  try {
    const { serviceId, address: addressId, notes } = req.body;
    const userId = req.user.id;

    if (!serviceId || !addressId) {
      return res.status(400).json({ success: false, message: "Service and address are required" });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    const addressDoc = await Address.findById(addressId);
    if (!addressDoc) return res.status(404).json({ success: false, message: "Address not found" });

    const adminDoc = await Admin.findOne({ tenantId: service.tenantId });
    if (!adminDoc) return res.status(404).json({ success: false, message: "Admin not found" });

    const user = await User.findById(userId);

    // ✅ Generate booking ID
    const bookingId = await generateBookingId(service.serviceName);

    const booking = new Booking({
      bookingId,  // ✅ pass it in
      user: userId,
      service: serviceId,
      admin: adminDoc._id,
      address: addressDoc.toObject(),
      userNote: notes || "",
    });

    await booking.save();

    //  Notify Admin
    await createNotification({
      recipientId: adminDoc._id,
      recipientModel: "Admin",
      title: "New Booking Received",
      message: `${user.name} booked "${service.serviceName}"`,
      type: "booking_created",
      bookingId: booking._id,
    });

    //  Activity created for user
await Activity.create({
  actorType: "User",
  actorId: req.user.id,
  action: "booking_created",
  entityType: "booking",
  entityId: booking._id,
  description: `Booking ${bookingId} placed for "${service.serviceName}"`,
});



    res.status(201).json({ success: true, message: "Booking created successfully", booking });
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /user/booking - all bookings for logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("service", "serviceName category price serviceImage")
      .populate("provider", "name email phone")
      .populate("assets", "assetName assetId cost")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    res.json({ success: true, data: bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /user/booking/:id - single booking detail
export const getUserBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id })
      .populate("service", "serviceName category estimatedPrice serviceImage description")
      .populate("provider", "name email phone profilePhoto")
      .populate("assets", "assetName assetId category cost");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, data: booking }); // returns res.data.data on frontend
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /user/booking/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (!["pending", "assigned"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: "Cannot cancel booking in current status" });
    }

    booking.status = "cancelled";
    await booking.save();

    await Service.findByIdAndUpdate(booking.service, {
      availability: "available",
      provider: null,
      asset: null,
      assignTo: null,
    });

    // Notify admin
    await createNotification({
      recipientId: booking.admin,
      recipientModel: "Admin",
      title: "Booking Cancelled",
      message: `Booking #${booking.bookingId} was cancelled by the customer`,
      type: "booking_cancelled",
      bookingId: booking._id,
    });

    await Activity.create({
  actorType: "User",
  actorId: req.user.id,
  action: "booking_created",   // or "asset_deleted", "service_created" etc.
  entityType: "booking",
  entityId: booking._id,
  description: `Booking #${booking.bookingId} Cancelled`
});

    // Notify provider if assigned
    if (booking.provider) {
      await createNotification({
        recipientId: booking.provider,
        recipientModel: "Provider",
        title: "Booking Cancelled",
        message: `Booking #${booking.bookingId} has been cancelled`,
        type: "booking_cancelled",
        bookingId: booking._id,
      });
    }

    res.json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   USER ADDRESS CONTROLLERS
───────────────────────────────────────── */

// GET /user/address
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await UserAddress.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /user/address
export const createUserAddress = async (req, res) => {
  try {
    const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      await UserAddress.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const address = await UserAddress.create({
      user: req.user.id,
      label, fullName, phone, addressLine1, addressLine2, city, state, pincode,
      isDefault: isDefault || false,
    });
    res.status(201).json({ success: true, address });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /user/address/:id
export const updateUserAddress = async (req, res) => {
  try {
    const { isDefault, ...rest } = req.body;

    if (isDefault) {
      await UserAddress.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const address = await UserAddress.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { ...rest, isDefault: isDefault || false },
      { new: true }
    );
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });
    res.json({ success: true, address });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /user/address/:id
export const deleteUserAddress = async (req, res) => {
  try {
    const address = await UserAddress.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });
    res.json({ success: true, message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   ADMIN CONTROLLERS
───────────────────────────────────────── */

// GET /admin/booking - all bookings under this admin
export const getAdminBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { admin: req.user.id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone profilePhoto")
      .populate("service", "serviceName serviceImage category estimatedPrice")
      .populate("provider", "name email phone profilePhoto")
      .populate("assets", "assetName assetId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);
    res.json({ success: true, bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /admin/booking/:id
export const getAdminBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, admin: req.user.id })
      .populate("user", "name email phone profilePhoto")
      .populate("service", "serviceName category estimatedPrice description serviceImage")
      .populate("provider", "name email phone profilePhoto")
      .populate("assets", "assetName assetId category status cost");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /admin/booking/:id/assign  — assign provider + assets
export const assignBooking = async (req, res) => {
  try {
    const { providerId, assetIds, adminNote, scheduledDate } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, admin: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (!["pending", "assigned"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: "Cannot assign this booking" });
    }

    const provider = await Provider.findOne({ _id: providerId, tenantId: req.user.tenantId });
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });

    booking.provider = providerId;
    booking.assets = assetIds || [];
    booking.adminNote = adminNote || "";
    booking.scheduledDate = scheduledDate || null;
    booking.status = "assigned";
    booking.assignedAt = new Date();
    await booking.save();

    await Service.findByIdAndUpdate(booking.service, {
      availability: "assigned",
      provider: providerId,
      asset: assetIds?.[0] || null,
      assignTo: booking.user,
    });

    await booking.populate([
      { path: "user", select: "name email phone" },
      { path: "service", select: "serviceName category estimatedPrice description serviceImage" },
      { path: "provider", select: "name email phone" },
      { path: "assets", select: "assetName assetId category status cost" },
    ]);

    // Notify user
    await createNotification({
      recipientId: booking.user._id,
      recipientModel: "User",
      title: "Provider Assigned",
      message: `Your booking #${booking.bookingId} has been assigned to ${provider.name}`,
      type: "booking_assigned",
      bookingId: booking._id,
    });

    // Notify provider
    await createNotification({
      recipientId: providerId,
      recipientModel: "Provider",
      title: "New Task Assigned",
      message: `You have been assigned booking #${booking.bookingId} for "${booking.service.serviceName}"`,
      type: "booking_assigned",
      bookingId: booking._id,
    });

    res.json({ success: true, message: "Booking assigned successfully", booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /admin/booking/stats
export const getAdminBookingStats = async (req, res) => {
  try {
    const adminId = req.user.id;
    const [pending, assigned, in_progress, completed, cancelled] = await Promise.all([
      Booking.countDocuments({ admin: adminId, status: "pending" }),
      Booking.countDocuments({ admin: adminId, status: "assigned" }),
      Booking.countDocuments({ admin: adminId, status: "in_progress" }),
      Booking.countDocuments({ admin: adminId, status: "completed" }),
      Booking.countDocuments({ admin: adminId, status: "cancelled" }),
    ]);
    res.json({ success: true, stats: { pending, assigned, in_progress, completed, cancelled, total: pending + assigned + in_progress + completed + cancelled } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   PROVIDER CONTROLLERS
───────────────────────────────────────── */

// GET /provider/booking - all tasks for this provider
export const getProviderBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { provider: req.user.id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("user", "name phone profilePhoto")
      .populate("service", "serviceName category description estimatedPrice serviceImage")
      .populate("assets", "assetName assetId category cost")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);
    res.json({ success: true, bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /provider/booking/:id
export const getProviderBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, provider: req.user.id })
      .populate("user", "name phone profilePhoto")
      .populate("service", "serviceName category estimatedPrice description serviceImage")
      .populate("assets", "assetName assetId category cost");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /provider/booking/:id/status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const usedAssignedAssetIds = Array.isArray(req.body.usedAssignedAssetIds)
      ? req.body.usedAssignedAssetIds
      : [];
    const additionalAssetsUsedInput = Array.isArray(req.body.additionalAssetsUsed)
      ? req.body.additionalAssetsUsed
      : [];

    const booking = await Booking.findOne({ _id: req.params.id, provider: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const workflowState = booking.status;
    const hasAssignedAssets = Array.isArray(booking.assets) && booking.assets.length > 0;

    const allowedTransitions = {
      assigned: ["accepted", "pending"],
      accepted: hasAssignedAssets ? ["picked_up", "pending"] : ["in_progress", "pending"],
      picked_up: ["in_progress", "pending"],
      in_progress: ["completed"],
    };

    const allowed = allowedTransitions[workflowState];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${workflowState} to ${status}` });
    }

    if (status === "pending") {
      booking.status = "pending";
      booking.provider = null;
      booking.assets = [];
      booking.assignedAt = null;
      booking.providerAcceptedAt = null;
      booking.assetsPickedUpAt = null;
      booking.startedAt = null;
      booking.completedAt = null;
      booking.usedAssignedAssets = [];
      booking.additionalAssetsUsed = [];
      booking.costSummary = null;
      booking.adminNote = "";
    } else if (status === "accepted") {
      booking.status = "accepted";
      booking.providerAcceptedAt = booking.providerAcceptedAt || new Date();
    } else if (status === "picked_up") {
      if (!hasAssignedAssets) {
        return res.status(400).json({ success: false, message: "No assets assigned for this booking" });
      }
      booking.status = "picked_up";
      booking.assetsPickedUpAt = booking.assetsPickedUpAt || new Date();
    } else if (status === "in_progress") {
      booking.status = "in_progress";
      booking.startedAt = new Date();
    } else if (status === "completed") {
      const assignedAssetIds = (booking.assets || []).map((assetId) => String(assetId));
      const invalidAssetId = usedAssignedAssetIds.find(
        (assetId) => !assignedAssetIds.includes(String(assetId))
      );

      if (invalidAssetId) {
        return res.status(400).json({
          success: false,
          message: "Selected used assets must belong to this booking",
        });
      }

      const usedAssignedAssetsDocs = usedAssignedAssetIds.length
        ? await Asset.find({ _id: { $in: usedAssignedAssetIds } }).select(
            "assetName assetId category cost"
          )
        : [];

      const usedAssignedAssets = usedAssignedAssetsDocs.map((asset) => ({
        asset: asset._id,
        assetName: asset.assetName || "",
        assetId: asset.assetId || "",
        category: asset.category || "",
        cost: Number(asset.cost || 0),
      }));

      const additionalAssetsUsed = additionalAssetsUsedInput
        .map((item) => ({
          name: String(item?.name || "").trim(),
          note: String(item?.note || "").trim(),
          cost: Number(item?.cost || 0),
        }))
        .filter((item) => item.name && item.cost >= 0);

      const service = await Service.findById(booking.service).select("estimatedPrice");
      const serviceCost = Number(service?.estimatedPrice || 0);
      const usedAssetsCost = usedAssignedAssets.reduce(
        (sum, asset) => sum + Number(asset.cost || 0),
        0
      );
      const additionalAssetsCost = additionalAssetsUsed.reduce(
        (sum, asset) => sum + Number(asset.cost || 0),
        0
      );
      const providerCharge = booking.provider ? PROVIDER_WORKING_CHARGE : 0;

      booking.status = "completed";
      booking.completedAt = new Date();
      booking.usedAssignedAssets = usedAssignedAssets;
      booking.additionalAssetsUsed = additionalAssetsUsed;
      booking.costSummary = {
        serviceCost,
        usedAssetsCost,
        additionalAssetsCost,
        providerCharge,
        totalCost: serviceCost + usedAssetsCost + additionalAssetsCost + providerCharge,
      };
    }

    await booking.save();

    if (status === "completed") {
      await Service.findByIdAndUpdate(booking.service, {
        availability: "available",
        provider: null,
        asset: null,
        assignTo: null,
      });
    }

    if (status === "pending") {
      await Service.findByIdAndUpdate(booking.service, {
        availability: "available",
        provider: null,
        asset: null,
        assignTo: null,
      });

      await createNotification({
        recipientId: booking.admin,
        recipientModel: "Admin",
        title: "Provider Rejected Task",
        message: `Booking #${booking.bookingId} was rejected and moved back to pending`,
        type: "booking_rejected",
        bookingId: booking._id,
      });
    }

    if (status === "in_progress" || status === "completed") {
      const notifType =
        status === "in_progress"
          ? "booking_in_progress"
          : "booking_completed";
      const notifMsg =
        status === "in_progress"
          ? `Your booking #${booking.bookingId} is now in progress`
          : `Your booking #${booking.bookingId} has been completed`;

      await createNotification({
        recipientId: booking.user,
        recipientModel: "User",
        title:
          status === "in_progress"
            ? "Work In Progress"
            : "Booking Completed",
        message: notifMsg,
        type: notifType,
        bookingId: booking._id,
      });
    }

    res.json({ success: true, message: `Status updated to ${status}`, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /provider/stats
export const getProviderStats = async (req, res) => {
  try {
    const providerId = req.user.id;
    const [assigned, in_progress, completed] = await Promise.all([
      Booking.countDocuments({ provider: providerId, status: "assigned" }),
      Booking.countDocuments({ provider: providerId, status: "in_progress" }),
      Booking.countDocuments({ provider: providerId, status: "completed" }),
    ]);
    res.json({ success: true, stats: { assigned, in_progress, completed, total: assigned + in_progress + completed } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   NOTIFICATIONS (shared)
───────────────────────────────────────── */

// GET /[role]/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("booking", "bookingId status")
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /[role]/notifications/mark-read
export const markNotificationsRead = async (req, res) => {
  try {
    const { ids } = req.body; // array of notification ids, or empty = mark all
    const filter = { recipient: req.user.id };
    if (ids && ids.length) filter._id = { $in: ids };
    await Notification.updateMany(filter, { isRead: true });
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
