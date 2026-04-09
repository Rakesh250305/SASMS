import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
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
  MoveLeft,
  User,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "../../component/InputField";
import axios from "axios";
import { toast } from "react-toastify";
import BottomNav from "../../component/BottomNav";
import useDarkMode from "../../utils/useDarkMode";

const settingsSections = [
  {
    title: "Profile",
    items: [
      {
        icon: <User size={18} />,
        label: "Profile Settings",
        desc: "Manage Profile Data",
        color: "text-blue-700",
        bg: "bg-blue-50",
      },
      {
        icon: <Bell size={18} />,
        label: "Notification Settings",
        desc: "Manage system-wide notifications",
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
        icon: <MapPin size={18} />,
        label: "Manage Address",
        desc: "Manage Addresses",
        color: "text-blue-700",
        bg: "bg-blue-50",
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

export default function UserSettings() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const handleUpdatePassword = async () => {

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New and Confirm Password do not match");
      return;
    }

    try {

      const token = localStorage.getItem("token");

      await axios.put(
        `${apiUrl}/user/change-password`,
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={`flex flex-col min-h-screen pb-16 ${darkMode ? "bg-gray-900" : "bg-[#F5F7FA]"}`}>

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-5 pt-6 pb-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="text-xs text-gray-400">System Settings</p>
          </div>
        </div>
      </div>


      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {settingsSections.map((section) => (
          <div key={section.title} className="mb-5">

            {/* Section Title */}
            <div className={`text-[11px] font-bold tracking-wider uppercase mb-2 pl-1 ${darkMode ? "text-gray-400" : "text-gray-400"}`}>
              {section.title}
            </div>

            {/* Card */}
            <div className={`${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"} rounded-2xl overflow-hidden shadow-sm`}>

              {section.items.map((item, i) => (
                <div
                  key={item.label}
                  onClick={() => {
                    if (item.toggle) {
                      toggleDarkMode();
                    } else if (item.label === "Profile Settings") {
                      navigate('/user/profile')
                    } else if (item.label === "Manage Address") {
                      navigate('/user/address')
                    }
                    else if (item.label === "Change Password") {
                      setShowPasswordModal(true);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-4 cursor-pointer ${i !== section.items.length - 1
                    ? darkMode ? "border-b border-gray-700" : "border-b border-gray-100"
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
                    <div className={`text-[13px] font-semibold ${darkMode ? "text-white" : "text-[#1A1A2E]"}`}>
                      {item.label}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-400"}`}>
                      {item.desc}
                    </div>
                  </div>

                  {/* Toggle */}
                  {item.toggle ? (
                    <div
                      className={`w-11 h-6 rounded-full transition-all relative ${darkMode ? "bg-emerald-600" : "bg-gray-300"}`}
                    >
                      <div
                        className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-all ${darkMode ? "left-[22px]" : "left-[2px]"}`}
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
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm ${darkMode ? "bg-gray-800 text-red-400" : "bg-red-50 text-red-600"}`}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Chanage Password */}
      <AnimatePresence>
        {showPasswordModal && (
         <>
            <motion.div
              onClick={() => setShowPasswordModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/10 backdrop-blur-xs"

            />
            
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
              className={`absolute bottom-0 left-0 w-full z-[50] rounded-t-3xl p-6 pt-0 pb-6 z-50 overflow-hidden ${darkMode ? "bg-gray-800 text-white" : "bg-white"}`}
            >

              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className={`w-10 h-1 rounded-full ${darkMode ? "bg-gray-600" : "bg-gray-200"}`} />
              </div>
              <h2 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-black"}`}>Change Password</h2>
              <div className="space-y-3">

                <InputField
                  type="password"
                  label="Current Psssword"
                  icon={<Eye size={16} />}
                  name="currentPassword"
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  dark={darkMode}
                />

                <InputField
                  type="password"
                  label="New Psssword"
                  icon={<Eye size={16} />}
                  name="newPassword"
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  dark={darkMode}
                />

                <InputField
                  type="password"
                  label="Confirm Psssword"
                  icon={<Eye size={16} />}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  dark={darkMode}
                />
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-semibold ${darkMode ? "border-gray-600 text-gray-200" : "border-gray-300 text-black"}`}
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdatePassword}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                >
                  Update
                </button>
              </div>
            </motion.div>
         </>
        )}
      </AnimatePresence>

      <BottomNav />

    </div>
  );
}
