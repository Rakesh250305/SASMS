
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Bell,
  ClipboardList,
  Settings,
  Package,
} from "lucide-react";
import useDarkMode from "../utils/useDarkMode";

const userNav = [
  { icon: <LayoutDashboard size={22} />, label: "Home", path: "/user", color: "text-emerald-800", bg: "bg-emerald-800" },
  { icon: <Calendar size={22} />, label: "Bookings", path: "/user/bookings", color: "text-emerald-800", bg: "bg-emerald-800" },
  { icon: <Package size={22} />, label: "Services", path: "/user/services", color: "text-emerald-800", bg: "bg-emerald-800" },
  { icon: <Settings size={22} />, label: "Settings", path: "/user/settings", color: "text-emerald-800", bg: "bg-emerald-800" },
];

const providerNav = [
  { icon: <LayoutDashboard size={22} />, label: "Home", path: "/provider", color: "text-fuchsia-600", bg: "bg-fuchsia-600" },
  { icon: <ClipboardList size={22} />, label: "Tasks", path: "/provider/tasks", color: "text-fuchsia-600", bg: "bg-fuchsia-600" },
  { icon: <Bell size={22} />, label: "Alerts", path: "/provider/notifications", color: "text-fuchsia-600", bg: "bg-fuchsia-600" },
  { icon: <Settings size={22} />, label: "Settings", path: "/provider/settings", color: "text-fuchsia-600", bg: "bg-fuchsia-600" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useDarkMode();

  const role = localStorage.getItem('role');

  const items = role === "user" ? userNav : providerNav;

  return (
    <div className={`fixed bottom-0 left-0 right-0 flex border-t py-1 pb-2 ${darkMode ? "bg-gray-950 border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.35)]" : "bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"}`}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs relative transition
              ${isActive ? `${item.color} font-bold` : darkMode ? "text-gray-500" : "text-gray-400"}
            `}
          >
            {isActive && (
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-9 h-[3px] ${item.bg} rounded-b-md`}></div>
            )}

            {item.icon}

            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
