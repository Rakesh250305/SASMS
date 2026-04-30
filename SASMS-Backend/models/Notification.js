import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "recipientModel" },
    recipientModel: { type: String, required: true, enum: ["User", "Admin", "Provider"] },

    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "booking_created",    // admin gets this
        "booking_assigned",   // user + provider get this
        "booking_rejected",   // admin gets this
        "booking_in_progress",// user gets this
        "booking_completed",  // user gets this
        "booking_cancelled",  // user + provider get this
      ],
      required: true,
    },

    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model("Notification", notificationSchema);
