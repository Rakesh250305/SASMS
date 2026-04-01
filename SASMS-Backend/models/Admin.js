import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
role: {
    type: String,
    default: "admin"
  },
  tenantId: {
    type: String,
    unique: true,
    sparse: true,
  },

  // Admin specific
  storeName : String,
  storeAddress : String,
  GSTNo : String,
  businessDescription : String,
  website : String,
  storePhoto: String,

  city: String,
  state: String,
  pincode: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Admin", adminSchema);
