import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  phone: String,
  profilePhoto: String,
  password: String,
  role: {
    type: String,
    default: "user",
  },
  address: String,
  city: String,
  state: String,
  pincode: String,

  bio: {
    type: String,
    default: "",
  },

  gender: {
    type: String,
    enum :["male", "female", "other", ""], 
    default: "",
  },


  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);
