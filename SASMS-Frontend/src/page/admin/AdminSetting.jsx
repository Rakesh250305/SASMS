import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Moon,
  Lock,
  Globe,
  ChevronRight,
  LogOut,
  Shield,
  Database,
  Users,
  Eye,
  ArrowLeft,
  User,
  Store,
  Phone,
  MapPin,
  FileText,
  X,
} from "lucide-react";
import AdminDrawer from "../../component/AdminDrawer";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "../../component/InputField";
import axios from "axios";
import { toast } from "react-toastify";

const settingsSections = [
  {
    title: "Profile",
    items: [
      {
        icon: <User size={18} />,
        label: "Profile Settings",
        desc: "Edit admin and store profile",
        color: "text-blue-700",
        bg: "bg-blue-50",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        icon: <Bell size={18} />,
        label: "Notification Settings",
        desc: "Manage system-wide notifications",
        color: "text-blue-700",
        bg: "bg-blue-50",
      },
      {
        icon: <Database size={18} />,
        label: "Data Management",
        desc: "Backup and export options",
        color: "text-green-700",
        bg: "bg-green-50",
      },
      {
        icon: <Globe size={18} />,
        label: "Language & Region",
        desc: "English (US)",
        color: "text-purple-700",
        bg: "bg-purple-50",
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        icon: <Lock size={18} />,
        label: "Change Password",
        desc: "Update admin password",
        color: "text-orange-600",
        bg: "bg-orange-50",
      },
      {
        icon: <Shield size={18} />,
        label: "Access Control",
        desc: "Manage user permissions",
        color: "text-blue-700",
        bg: "bg-blue-50",
      },
      {
        icon: <Users size={18} />,
        label: "Role Management",
        desc: "Configure user roles",
        color: "text-green-700",
        bg: "bg-green-50",
      },
    ],
  },
  {
    title: "Appearance",
    items: [
      {
        icon: <Moon size={18} />,
        label: "Dark Mode",
        desc: "Toggle dark theme",
        color: "text-purple-700",
        bg: "bg-purple-50",
        toggle: true,
      },
    ],
  },
];

export function AdminSettings() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    storeName: "",
    storeAddress: "",
    GSTNo: "",
    website: "",
    city: "",
    state: "",
    pincode: "",
    businessDescription: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiUrl}/admin`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const admin = res.data.data || {};
        setProfileData({
          name: admin.name || "",
          email: admin.email || "",
          phone: admin.phone || "",
          storeName: admin.storeName || "",
          storeAddress: admin.storeAddress || "",
          GSTNo: admin.GSTNo || "",
          website: admin.website || "",
          city: admin.city || "",
          state: admin.state || "",
          pincode: admin.pincode || "",
          businessDescription: admin.businessDescription || "",
        });
      } catch (error) {
        toast.error("Failed to fetch admin profile");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [apiUrl]);

  const handleUpdatePassword = async () => {

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    toast.error("New and Confirm Password do not match");
    return;
  }

  try {

    const token = localStorage.getItem("token");

    await axios.put(
      `${apiUrl}/admin/change-password`,
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    toast.success("Password updated successfully");

    setShowPasswordModal(false);

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to change Password");
  }
  };

  const handleUpdateProfile = async () => {
    if (!profileData.name.trim()) {
      toast.error("Admin name is required");
      return;
    }

    try {
      setSavingProfile(true);
      const token = localStorage.getItem("token");
      const payload = {
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
        storeName: profileData.storeName.trim(),
        storeAddress: profileData.storeAddress.trim(),
        GSTNo: profileData.GSTNo.trim(),
        website: profileData.website.trim(),
        city: profileData.city.trim(),
        state: profileData.state.trim(),
        pincode: profileData.pincode.trim(),
        businessDescription: profileData.businessDescription.trim(),
      };

      await axios.put(
        `${apiUrl}/admin/profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Profile updated successfully");
      setShowProfileModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };


  return (
    <div className={`flex flex-col min-h-screen bg-[#F5F7FA]`}>

      <AdminDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1565C0] to-[#1976D2] px-5 py-4 ">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/admin")}
            className="bg-white/20 text-white p-2 rounded-lg"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 text-white font-bold text-lg">
            Settings
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {settingsSections.map((section) => (
          <div key={section.title} className="mb-5">

            {/* Section Title */}
            <div className={`text-[11px] font-bold tracking-wider uppercase mb-2 pl-1 text-gray-400`}>
              {section.title}
            </div>

            {/* Card */}
            <div className={`bg-white rounded-2xl overflow-hidden shadow-sm`}>

              {section.items.map((item, i) => (
                <div
                  key={item.label}
                  onClick={() => {
                    if (item.label === "Profile Settings") {
                      setShowProfileModal(true);
                    } else if (item.label === "Change Password") {
                      setShowPasswordModal(true);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors hover:bg-slate-50 ${i !== section.items.length - 1
                      ? "border-b border-gray-100"
                      : ""
                    }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}
                  >
                    {item.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <div className={`text-[13px] font-semibold text-[#1A1A2E]`}>
                      {item.label}
                    </div>
                    <div className={`text-[11px] mt-0.5 text-gray-400`}>
                      {item.desc}
                    </div>
                  </div>

                  {/* Toggle */}
                  {item.toggle ? (
                    <div
                      className={`w-11 h-6 rounded-full transition-all bg-gray-300 relative`}
                    >
                      <div
                        className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-all left-[2px]`}
                      ></div>
                    </div>
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm bg-red-50 text-red-600`}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

  <AnimatePresence>
        {showProfileModal && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setShowProfileModal(false)}
    className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
  >

    <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className={`absolute bottom-0 left-0 right-0 bg-white h-[75vh] rounded-t-3xl p-6 z-50 overflow-y-auto`}
            >

      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <p className={`text-sm mt-1 text-slate-500`}>
            Update your admin and store details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowProfileModal(false)}
          className={`p-2 rounded-xl bg-slate-100 text-slate-700`}
        >
          <X size={16} />
        </button>
      </div>

      <div className={`rounded-2xl p-4 mb-5 bg-slate-50 border border-slate-200`}>
        <div className="text-xs uppercase tracking-wide font-semibold text-slate-400">Account Email</div>
        <div className={`mt-1 text-sm font-medium break-all text-slate-700`}>
          {profileData.email || "No email available"}
        </div>
      </div>

      {profileLoading ? (
        <p className="text-sm text-gray-400">Loading profile...</p>
      ) : (
        <div className="space-y-3">
          <InputField label="Admin Name" icon={<User size={16} />} name="name" placeholder="Admin name" value={profileData.name} onChange={handleProfileChange} />
          <InputField label="Phone" icon={<Phone size={16} />} name="phone" placeholder="Phone number" value={profileData.phone} onChange={handleProfileChange} />
          <InputField label="Store Name" icon={<Store size={16} />} name="storeName" placeholder="Store name" value={profileData.storeName} onChange={handleProfileChange} />
          <InputField label="Store Address" icon={<MapPin size={16} />} name="storeAddress" placeholder="Store address" value={profileData.storeAddress} onChange={handleProfileChange} />
          <InputField label="GST No" icon={<FileText size={16} />} name="GSTNo" placeholder="GST number" value={profileData.GSTNo} onChange={handleProfileChange} />
          <InputField label="Website" icon={<Globe size={16} />} name="website" placeholder="Website" value={profileData.website} onChange={handleProfileChange} />
          <InputField label="City" icon={<MapPin size={16} />} name="city" placeholder="City" value={profileData.city} onChange={handleProfileChange} />
          <InputField label="State" icon={<MapPin size={16} />} name="state" placeholder="State" value={profileData.state} onChange={handleProfileChange} />
          <InputField label="Pincode" icon={<MapPin size={16} />} name="pincode" placeholder="Pincode" value={profileData.pincode} onChange={handleProfileChange} />
          <InputField label="Business Description" icon={<FileText size={16} />} name="businessDescription" placeholder="Business description" value={profileData.businessDescription} onChange={handleProfileChange} />
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <button
          onClick={() => setShowProfileModal(false)}
          className="flex-1 py-2 rounded-xl border text-sm font-semibold"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateProfile}
          disabled={savingProfile || profileLoading}
          className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
        >
          {savingProfile ? "Saving..." : "Save"}
        </button>
      </div>

    </motion.div>

  </motion.div>
)}
  </AnimatePresence>

  <AnimatePresence>
        {showPasswordModal && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setShowPasswordModal(false)}
    className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
  >

    <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className={`absolute bottom-0 left-0 right-0 bg-white h-[60vh] rounded-t-3xl p-6 z-50 overflow-y-auto`}
            >

      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold">Change Password</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowPasswordModal(false)}
          className={`p-2 rounded-xl bg-slate-100 text-slate-700`}
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">

          <InputField
            type="password"
            label="Current Psssword"
            icon={<Eye size={16}/>}
            name="currentPassword"
            placeholder="Current Password"
          value={passwordData.currentPassword}
          onChange={handlePasswordChange}
          />

          <InputField
            type="password"
            label="New Psssword"
            icon={<Eye size={16}/>}
            name="newPassword"
            placeholder="New Password"
          value={passwordData.newPassword}
          onChange={handlePasswordChange}
          />

          <InputField
            type="password"
            label="Confirm Psssword"
            icon={<Eye size={16}/>}
            name="confirmPassword"
            placeholder="Confirm Password"
          value={passwordData.confirmPassword}
          onChange={handlePasswordChange}
          />

      </div>

      <div className="flex gap-3 mt-5">

        <button
          onClick={() => setShowPasswordModal(false)}
          className="flex-1 py-2 rounded-xl border text-sm font-semibold"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdatePassword}
          className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold"
        >
          Update
        </button>

      </div>

    </motion.div>

  </motion.div>
)}
  </AnimatePresence>
    </div>
  );
}
