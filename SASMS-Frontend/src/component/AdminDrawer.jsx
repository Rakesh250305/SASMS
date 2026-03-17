import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  UserCog,
  ClipboardList,
  Bell,
  X,
  LogOut,
  Settings,
  ChevronRight,
  Shield,
} from "lucide-react";
import logo from '../assets/main-Logo.png'

const navItems = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/admin" },
  { icon: <Package size={20} />, label: "Asset Management", path: "/admin/assets" },
  { icon: <UserCog size={20} />, label: "Service Providers", path: "/admin/providers" },
  { icon: <ClipboardList size={20} />, label: "Service Management", path: "/admin/service" },
  { icon: <Users size={20} />, label: "Service Requests", path: "/admin/serviceRequest" },
  { icon: <Bell size={20} />, label: "Notifications", path: "/admin/notifications" },
  { icon: <Settings size={20} />, label: "Settings", path: "/admin/settings" },
];

export default function AdminDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-[200]"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 ${
          open ? "left-0" : "-left-[300px]"
        } w-[280px] h-screen bg-white z-[300] transition-all duration-300 ease-in-out flex flex-col shadow-lg`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#42A5F5] p-6 pt-8 pb-6 relative">

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-lg text-white"
          >
            <X size={18} />
          </button>

          {/* Icon */}
          <div className="w-14 h-14 p-2 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center mb-3">
            <img  src={logo} alt="" />
          </div>

          <div className="text-white text-base font-bold">Admin Panel</div>

          {/* Role Badge */}
          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full" />
            <span className="text-white text-[11px] font-semibold">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => goTo(item.path)}
                className={`w-full  flex items-center gap-4 px-5 py-3 text-left border-l-4 transition
                ${
                  isActive
                    ? "bg-blue-50 border-blue-600 text-blue-600"
                    : "border-transparent text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className={isActive ? "text-blue-600" : "text-gray-500"}>
                  {item.icon}
                </span>

                <span
                  className={`flex-1 text-sm ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>

                {isActive && <ChevronRight size={16} className="text-blue-600" />}
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div className="border-t py-3">
          <button
            onClick={() => goTo("/login")}
            className="w-full flex items-center gap-4 px-5 py-3 text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}