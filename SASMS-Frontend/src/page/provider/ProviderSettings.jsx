import { useEffect, useState } from "react";
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
  User,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";

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
        color: "text-blue-700",
        bg: "bg-blue-50",
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
        icon: <Shield size={18} />,
        label: "Access Control",
        desc: "Manage user permissions",
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

export function ProviderSettings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex-1 flex flex-col relative h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#86198f] to-[#c026d3] h-[13vh] px-5 pt-6 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <h1 className="text-xl font-extrabold text-white">Settings</h1>
        <p className="text-white/50 text-xs mt-0.5">System Settings</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 py-4">

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
                      navigate('/provider/profile');
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-4 cursor-pointer ${i !== section.items.length - 1
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
                    <div className="text-[11px] text-gray-400 mt-0.5">
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

      <BottomNav />
    </div>
  );
}
