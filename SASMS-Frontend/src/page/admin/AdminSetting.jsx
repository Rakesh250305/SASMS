import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Moon, Lock, Globe, ChevronRight,
  LogOut, Shield, Database, Users, Eye,
  ArrowLeft, User,
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
        route: "/admin/profile",
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = e =>
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New and Confirm Password do not match");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiUrl}/admin/change-password`,
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password updated successfully");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleItemClick = (item) => {
    if (item.route) { navigate(item.route); return; }
    if (item.label === "Change Password") { setShowPasswordModal(true); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">

      <AdminDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1565C0] to-[#1976D2] px-5 py-4">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate("/admin")} className="bg-white/20 text-white p-2 rounded-lg">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 text-white font-bold text-lg">Settings</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {settingsSections.map((section) => (
          <div key={section.title} className="mb-5">
            <div className="text-[11px] font-bold tracking-wider uppercase mb-2 pl-1 text-gray-400">
              {section.title}
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {section.items.map((item, i) => (
                <div
                  key={item.label}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                    i !== section.items.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-[#1A1A2E]">{item.label}</div>
                    <div className="text-[11px] mt-0.5 text-gray-400">{item.desc}</div>
                  </div>
                  {item.toggle ? (
                    <div className="w-11 h-6 rounded-full bg-gray-300 relative">
                      <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow" />
                    </div>
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm bg-red-50 text-red-600"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      {/* ── Change Password Sheet ── */}
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
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-6 z-50"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Update your admin account password</p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <ArrowLeft size={15} className="text-gray-500 rotate-[135deg]" />
                </button>
              </div>

              <div className="space-y-3">
                <InputField
                  type="password" label="Current Password" icon={<Eye size={16} />}
                  name="currentPassword" placeholder="Current password"
                  value={passwordData.currentPassword} onChange={handlePasswordChange}
                />
                <InputField
                  type="password" label="New Password" icon={<Eye size={16} />}
                  name="newPassword" placeholder="New password"
                  value={passwordData.newPassword} onChange={handlePasswordChange}
                />
                <InputField
                  type="password" label="Confirm Password" icon={<Eye size={16} />}
                  name="confirmPassword" placeholder="Confirm new password"
                  value={passwordData.confirmPassword} onChange={handlePasswordChange}
                />
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassword}
                  className="flex-1 py-3 rounded-2xl bg-[#1976D2] text-white text-sm font-bold"
                >
                  Update Password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}