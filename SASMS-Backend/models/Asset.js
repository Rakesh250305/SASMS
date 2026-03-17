import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({

  assetName: String,
  category: String,
  quantity: Number,
  assetDescription: String,
  cost: Number,
  status: String,
  assignTo: {
    type: String,
    default: null,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }

}, { timestamps: true });

export default mongoose.model("Asset", assetSchema);