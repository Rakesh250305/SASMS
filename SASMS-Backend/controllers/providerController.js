import Provider from "../models/Provider.js";
import bcrypt from "bcrypt";
import { put } from "@vercel/blob";
import { del } from "@vercel/blob";

// GET /provider/
export const getProviderInfo = async (req, res) => {
  try {
    const provider = await Provider.findById(req.user.id).select("-password");
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });
    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /provider/profile
export const updateProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");
    res.status(200).json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /provider/change-password
export const changeProviderPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const provider = await Provider.findById(req.user.id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, provider.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Current password is incorrect" });

    provider.password = await bcrypt.hash(newPassword, 10);
    await provider.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Uplaod Provider Profile Photo 
export const uploadProviderPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile photo is required",
      });
    }

    const account = await Provider.findById(req.user.id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload to Vercel Blob
    const blob = await put(
      `provider/${Date.now()}-${req.file.originalname}`,
      req.file.buffer,
      {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );

    // blob.url → public URL
    account.profilePhoto = blob.url;
    await account.save();

    res.status(200).json({
      success: true,
      message: "Photo uploaded Successfully",
      profilePhoto: blob.url,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Provider Profile Photo
export const deleteProviderPhoto = async (req, res) => {
  try {
    const account = await Provider.findById(req.user.id);

    if (account?.profilePhoto) {
      await del(account.profilePhoto, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }

    account.profilePhoto = "";
    await account.save();

    res.json({ success: true, message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const uploadProviderPhoto = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "Profile photo is required" });
//     }

//     const provider = await Provider.findById(req.user.id);
//     if (!provider) {
//       return res.status(404).json({ success: false, message: "Provider not found" });
//     }

//     const previousPhoto = provider.profilePhoto;
//     provider.profilePhoto = buildUploadPath("uploads/providers", req.file.filename);
//     await provider.save();

//     await removeUploadedFile(previousPhoto);

//     res.status(200).json({
//       success: true,
//       message: "Profile photo updated successfully",
//       profilePhoto: provider.profilePhoto,
//       provider: await Provider.findById(req.user.id).select("-password"),
//     });
//   } catch (err) {
//     if (req.file?.path) {
//       await removeUploadedFile(req.file.path);
//     }
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const  = async (req, res) => {
//   try {
//     const provider = await Provider.findById(req.user.id);
//     if (!provider) {
//       return res.status(404).json({ success: false, message: "Provider not found" });
//     }

//     const previousPhoto = provider.profilePhoto;
//     provider.profilePhoto = "";
//     await provider.save();

//     await removeUploadedFile(previousPhoto);

//     res.status(200).json({
//       success: true,
//       message: "Profile photo deleted successfully",
//       provider: await Provider.findById(req.user.id).select("-password"),
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
