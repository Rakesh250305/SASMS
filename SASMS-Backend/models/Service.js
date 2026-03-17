import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({

  serviceName: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  estimatedPrice: {
    type: Number,
    required: true
  },

  availability: {
    type: String,
    enum: ["available", "assigned", "unavailable"],
    default: "available"
  },

  serviceImage: {
    type: String
  },

  description: {
    type: String
  },

  tenantId: {
    type: String,
    required: true
  },

   provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
    },

    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },

    assignTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("Service", serviceSchema);