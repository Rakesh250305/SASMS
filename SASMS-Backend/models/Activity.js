import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    // Actor
    actorType: {
      type: String,
      enum: ["Admin", "User"],
      required: true
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "actorType"  // dynamic ref based on actorType
    },

    // For admin activities only
    tenantId: { type: String },

    // What happened
    action: {
      type: String,
      enum: [
        // Admin actions
        "asset_created", "asset_deleted",
        "service_created", "service_deleted",
        "provider_created", "provider_deleted",
        // User actions
        "booking_created", "booking_cancelled",
      ],
      required: true
    },

    entityType: {
      type: String,
      enum: ["asset", "service", "provider", "booking"],
      required: true
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },

    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);