import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import { generateTenantId } from "../utils/generateTenantId.js";
import Asset from "../models/Asset.js";
import Provider from "../models/Provider.js";
import Service from "../models/Service.js";
import Activity from "../models/Activity.js";
import Bookings from "../models/Bookings.js";

export const adminSignup = async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      phone,
      password,
      storeName,
      storeAddress,
      GSTNo,
      businessDescription,
      website,
      city,
      state,
      pincode,
    } = req.body;

    const existing = await Admin.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const tenantId = await generateTenantId();

    const admin = new Admin({
      name,
      email,
      phone,
      role,
      password: hashed,
      tenantId,
      storeName,
      storeAddress,
      GSTNo,
      businessDescription,
      website,
      city,
      state,
      pincode,
    });

    await admin.save();

    res.status(201).json({
      message: "Admin created Successfully",
      tenantId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get admin Information
export const getInfo = async (req, res) => {
  try {
    const account = await Admin.findById(req.user.id).select("-password");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fetched Successfully",
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fetch Failed",
    });
  }
};

// Get Dashboard Stats
export const getStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const adminId = req.user.id;

    const totalAssets = await Asset.countDocuments({ createdBy: adminId });

    const totalProviders = await Provider.countDocuments({ tenantId });

    const totalServices = await Service.countDocuments({ tenantId });

    const totalServiceRequests = await Bookings.countDocuments({
      admin: adminId,
    });

    res.status(200).json({
      success: true,
      data: {
        assets: totalAssets,
        providers: totalProviders,
        services: totalServices,
        users: totalServiceRequests,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Recent Activities
export const getRecentActivities = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const activities = await Activity.find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  console.log(req.body);
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    admin.password = hashed;

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Asset
export const createAsset = async (req, res) => {
  try {
    const { assetName, assetDescription, category, quantity, cost, status } =
      req.body;
    const asset = new Asset({
      assetName,
      assetDescription,
      category,
      quantity,
      cost,
      status,
      createdBy: req.user.id,
    });

    await asset.save();

    res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: asset,
    });

       await Activity.create({
      actorType: "Admin",
      actorId: req.user.id,
      tenantId: req.user.tenantId,
      action: "asset_created",
      entityType: "asset",
      entityId: asset._id,
      description: `New Asset added: ${assetName}`,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Asset creation failed",
    });
  }
};

// Get Admin assets
export const getAdminAssets = async (req, res) => {
  try {
    const adminId = req.user.id;
    const assets = await Asset.find({ createdBy: adminId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: assets,
      message: "Assets fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assets",
      error: error.message,
    });
  }
};

// Update Asset
export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedAsset = await Asset.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json({
      success: true,
      data: updatedAsset,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Assets
export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({
        success:false,
        message:"Asset not found"
      });
    }

    await asset.deleteOne();

    res.status(200).json({
      success:true,
      message:"Asset deleted successfully"
    });

      await Activity.create({
      actorType: "Admin",
      actorId: req.user.id,
      tenantId: req.user.tenantId,
      action: "asset_deleted",
      entityType: "asset",
      entityId: asset._id,
      description: `Asset Deleted: ${assetName}`,
    });

  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    });
  }
};

// Admin Provider Create
export const createProvider = async (req, res) => {
  try {
    const {
      name,
      description,
      email,
      phone,
      password,
      city,
      state,
      pincode,
      experience,
      serviceType,
    } = req.body;

    const lowerEmail = email.trim().toLowerCase();

    const existing = await Provider.findOne({ email: lowerEmail });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Provider already registered",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const provider = new Provider({
      name,
      description,
      email: lowerEmail,
      phone,
      password: hashed,
      tenantId: req.user?.tenantId,
      city,
      state,
      pincode,
      experience,
      serviceType,
      createdBy: req.user.id,
    });

    await provider.save();

    // Save activity
    await Activity.create({
      actorType: "Admin",
      actorId: req.user.id,
      tenantId: req.user.tenantId,
      action: "provider_created",
      entityType: "provider",
      entityId: provider._id,
      description: `New provider added: ${name}`,
    });

    res.status(201).json({
      success: true,
      message: "Provider created",
      provider,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Admin Providers
export const getAdminProviders = async (req, res) => {
  try {
    const adminTenantId = req.user.tenantId;
    const providers = await Provider.find({ tenantId: adminTenantId });

    res.status(200).json({
      success: true,
      data: providers,
      message: "Providers fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Providers",
      error: error.message,
    });
  }
};

// Update Provider
export const updateProvider = async (req, res) => {
  try {

    const { id } = req.params;
    const updateData = { ...req.body };

    // If new password provided → hash it
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedProvider = await Provider.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedProvider) {
      return res.status(404).json({
        success:false,
        message:"Service Provider not found"
      });
    }

    res.status(200).json({
      success:true,
      data:updatedProvider,
      message:"Provider updated successfully"
    });

  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

// Add Service
export const createService = async (req, res) => {
  try {
    const { serviceName, category, estimatedPrice, availability, description } =
      req.body;

    const serviceImage = req.file
      ? `/uploads/services/${req.file.filename}`
      : "";

    const service = new Service({
      serviceName,
      category,
      estimatedPrice: Number(estimatedPrice),
      availability,
      description,
      serviceImage,
      tenantId: req.user.tenantId,
    });

    await service.save();

    await Activity.create({
      actorType: "Admin",
      actorId: req.user.id,
      tenantId: req.user.tenantId,
      action: "service_created", // or "asset_deleted", "service_created" etc.
      entityType: "service",
      entityId: service._id,
      description: `New Service added: ${serviceName}`,
    });

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Admin Services
export const getAdminService = async (req, res) => {
  try {
    const adminTenantId = req.user.tenantId;
    const services = await Service.find({ tenantId: adminTenantId }).sort({createdAt: -1});

    res.status(200).json({
      success: true,
      data: services,
      message: "Services fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Services",
      error: error.message,
    });
  }
};

// Update Service
export const updateService = async (req, res) => {
  try {
    console.log(req.body);

    const { id } = req.params;

    const updateData = {
      serviceName: req.body.serviceName,
      description: req.body.description,
      estimatedPrice: req.body.estimatedPrice,
      category: req.body.category,
      availability: req.body.availability,
    };

    // if new image uploaded
    if (req.file) {
      updateData.serviceImage = `/uploads/services/${req.file.filename}`;
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
    );

    if (!updatedService) {
      return res.status(404).json({
        success:false,
        message:"Service not found"
      });
    }

    res.status(200).json({
      success:true,
      data:updatedService,
      message:"Service updated successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

// Delete Service
export const deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });

      // Save activity
    await Activity.create({
      actorType: "Admin",
      actorId: req.user.id,
      tenantId: req.user.tenantId,
      action: "service_deleted",
      entityType: "service",
      entityId: service._id,
      description: `Service Deleted: ${serviceName}`,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
