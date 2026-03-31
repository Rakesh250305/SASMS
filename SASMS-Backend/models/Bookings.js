import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" }, // Home, Work, Other
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },

    // Relations
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", default: null },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    assets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],

    // Booking details
    address: { type: addressSchema, required: true },
    scheduledDate: { type: Date },
    providerNote: { type: String, default: "" },

    // Status flow: pending → assigned → in_progress → completed | cancelled
    status: {
      type: String,
      enum: ["pending", "assigned", "accepted", "picked_up", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    // Admin assigns provider
    assignedAt: { type: Date },
    providerAcceptedAt: { type: Date },
    assetsPickedUpAt: { type: Date },
    // Provider updates progress
    startedAt: { type: Date },
    completedAt: { type: Date },

    // Admin note when assigning
    adminNote: { type: String, default: "" },

    // Notifications sent flags
    notifiedUser: { type: Boolean, default: false },
    notifiedProvider: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ admin: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });

export default mongoose.model("Booking", bookingSchema);
