import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Moon,
  Globe,
  ChevronRight,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";
import useDarkMode from "../../utils/useDarkMode";

const settingsSections = [
  {
    title: "Profile",
    items: [
      { icon: <User size={18} />, label: "Profile Settings", desc: "Manage profile data", color: "text-blue-700", bg: "bg-blue-50" },
      { icon: <Bell size={18} />, label: "Notification Settings", desc: "Manage task alerts", color: "text-blue-700", bg: "bg-blue-50" },
      { icon: <Globe size={18} />, label: "Language & Region", desc: "English (US)", color: "text-purple-700", bg: "bg-purple-50" },
    ],
  },
  {
    title: "Security",
    items: [
      { icon: <Shield size={18} />, label: "Access Control", desc: "Manage account permissions", color: "text-blue-700", bg: "bg-blue-50" },
    ],
  },
  {
    title: "Appearance",
    items: [
      { icon: <Moon size={18} />, label: "Dark Mode", desc: "Toggle dark theme", color: "text-purple-700", bg: "bg-purple-50", toggle: true },
    ],
  },
];

export function ProviderSettings() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    localStorage.setItem("role", "provider");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className={`flex-1 flex flex-col relative h-screen ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="bg-gradient-to-br from-[#86198f] to-[#c026d3] h-[13vh] px-5 pt-6 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <h1 className="text-xl font-extrabold text-white">Settings</h1>
        <p className="text-white/50 text-xs mt-0.5">System Settings</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 py-4">
        {settingsSections.map((section) => (
          <div key={section.title} className="mb-5">
            <div className={`text-[11px] font-bold tracking-wider uppercase mb-2 pl-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{section.title}</div>

            <div className={`rounded-2xl overflow-hidden border ${darkMode ? "bg-slate-900 border-slate-800 shadow-[0_18px_40px_rgba(2,6,23,0.28)]" : "bg-white border-gray-100 shadow-sm"}`}>
              {section.items.map((item, index) => (
                <div
                  key={item.label}
                  onClick={() => {
                    if (item.toggle) {
                      toggleDarkMode();
                    } else if (item.label === "Profile Settings") {
                      navigate("/provider/profile");
                    } else if (item.label === "Notification Settings") {
                      navigate("/provider/notifications");
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-4 cursor-pointer ${index !== section.items.length - 1 ? darkMode ? "border-b border-slate-800" : "border-b border-gray-100" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${darkMode ? "bg-slate-950" : item.bg} ${item.color}`}>
                    {item.icon}
                  </div>

                  <div className="flex-1">
                    <div className={`text-[13px] font-semibold ${darkMode ? "text-white" : "text-[#1A1A2E]"}`}>{item.label}</div>
                    <div className={`text-[11px] mt-0.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{item.desc}</div>
                  </div>

                  {item.toggle ? (
                    <div className={`w-11 h-6 rounded-full transition-all relative ${darkMode ? "bg-fuchsia-600" : "bg-gray-300"}`}>
                      <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-all ${darkMode ? "left-[22px]" : "left-[2px]"}`} />
                    </div>
                  ) : (
                    <ChevronRight size={16} className={darkMode ? "text-slate-600" : "text-gray-400"} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleLogout} className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border ${darkMode ? "bg-slate-900 border-slate-800 text-red-400" : "bg-red-50 border-red-100 text-red-600"}`}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
