import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: String,

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: String,

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: "provider"
  },

  tenantId: {
    type: String,
    required: true
  },

  city: String,
  state: String,
  pincode: String,

  experience: String,

  serviceType: [
    {
      type: String
    }
  ],

  status: {
    type: String,
    default: "active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Provider", providerSchema);