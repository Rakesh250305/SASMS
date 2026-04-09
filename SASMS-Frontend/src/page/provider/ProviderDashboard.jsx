import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Bell,
  ClipboardList,
  CheckCircle2,
  Wrench,
  Package,
  ChevronRight,
  ArrowRight,
  MapPin,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";
import { getInitials } from "../../utils/avatarUtils";
import useDarkMode from "../../utils/useDarkMode";

const STATUS_CONFIG = {
  assigned: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  completed: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
};

function StatusBadge({ status, darkMode }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.assigned;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${darkMode ? "bg-slate-950 text-slate-200 border border-slate-800" : `${cfg.bg} ${cfg.text}`}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status === "in_progress" ? "In Progress" : status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [provider, setProvider] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providerRes, taskRes, statsRes, notifRes] = await Promise.all([
          axios.get(`${apiUrl}/provider`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/provider/booking?limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/provider/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/provider/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setProvider(providerRes.data.data || providerRes.data.provider || providerRes.data);
        setTasks(taskRes.data.bookings || taskRes.data.data || []);
        setStats(statsRes.data.stats || statsRes.data.data || {});
        setUnreadCount(notifRes.data.unreadCount || 0);
      } catch (error) {
        if (error.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, navigate, token]);

  const initials = getInitials(provider?.name, "PR");

  const statItems = [
    { label: "Assigned", val: stats.assigned, icon: ClipboardList, color: "text-purple-600", surface: darkMode ? "bg-slate-950" : "bg-purple-50" },
    { label: "In Progress", val: stats.in_progress, icon: Wrench, color: "text-blue-600", surface: darkMode ? "bg-slate-950" : "bg-blue-50" },
    { label: "Completed", val: stats.completed, icon: CheckCircle2, color: "text-green-600", surface: darkMode ? "bg-slate-950" : "bg-green-50" },
    { label: "Total", val: stats.total, icon: Package, color: "text-slate-500", surface: darkMode ? "bg-slate-950" : "bg-gray-100" },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="bg-gradient-to-br from-[#86198f] to-[#c026d3] px-5 pt-8 pb-12 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-6 w-20 h-20 rounded-full bg-white/5" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white text-lg font-semibold">Hello, {provider?.name}</p>
            <p className="text-white/90 text-sm font-semibold">{provider?.description}</p>
            <p className="text-white/70 text-xs">{provider?.email}</p>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="relative">
              <button onClick={() => navigate("/provider/notifications")} className="relative bg-white/20 p-2.5 rounded-xl">
                <Bell size={18} className="text-white" />
              </button>
              {unreadCount > 0 && <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />}
            </div>
            <button onClick={() => navigate("/provider/profile")} className="relative bg-white/20 w-10 h-10 overflow-hidden border border-white/20 text-white font-extrabold text-sm rounded-xl flex items-center justify-center">
              {provider?.profilePhoto ? <img src={provider.profilePhoto} alt="Provider" className="w-full h-full object-cover" /> : initials}
            </button>
          </div>
        </div>
      </div>

      <div className={`flex-1 px-4 pb-20 pt-5 space-y-5 rounded-t-3xl -mt-7 absolute w-full overflow-y-auto ${darkMode ? "bg-slate-950" : "bg-white"}`}>
        <p className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Overview</p>

        <div className="grid grid-cols-4 gap-2">
          {statItems.map(({ label, val, icon: Icon, color, surface }) => (
            <div key={label} className={`rounded-2xl p-3 border text-center ${darkMode ? "bg-slate-900 border-slate-800 shadow-[0_18px_40px_rgba(2,6,23,0.28)]" : "bg-white border-gray-100 shadow-sm"}`}>
              <div className={`w-8 h-8 rounded-xl ${surface} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon size={15} className={color} />
              </div>
              <p className={`text-lg font-extrabold ${color}`}>{val ?? "-"}</p>
              <p className={`text-[9px] font-semibold leading-tight mt-0.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/provider/tasks")} className="bg-gradient-to-br from-[#86198f] to-[#c026d3] rounded-2xl p-4 text-left relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
            <ClipboardList size={20} className="text-white mb-2.5" />
            <p className="text-white font-bold text-sm">My Tasks</p>
            <p className="text-white/60 text-xs">View all assigned</p>
          </motion.button>

          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/provider/profile")} className={`rounded-2xl p-4 text-left border relative overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800 shadow-[0_18px_40px_rgba(2,6,23,0.28)]" : "bg-white border-gray-100 shadow-sm"}`}>
            <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full ${darkMode ? "bg-fuchsia-950/50" : "bg-purple-50"}`} />
            <Package size={20} className="text-purple-600 mb-2.5" />
            <p className={`font-bold text-sm ${darkMode ? "text-slate-100" : "text-slate-800"}`}>My Profile</p>
            <p className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Account & settings</p>
          </motion.button>
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Recent Tasks</p>
          <button onClick={() => navigate("/provider/tasks")} className="flex items-center gap-1 text-xs font-semibold text-purple-600">
            View All <ArrowRight size={11} />
          </button>
        </div>

        {loading ? (
          [1, 2].map((item) => <div key={item} className={`rounded-2xl h-24 animate-pulse border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`} />)
        ) : tasks.length === 0 ? (
          <div className={`rounded-2xl border p-8 text-center ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <ClipboardList size={28} className={`${darkMode ? "text-fuchsia-800" : "text-purple-200"} mx-auto mb-2`} />
            <p className={`text-sm font-semibold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>No tasks yet</p>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Assigned tasks will appear here</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/provider/task/${task._id}`)}
              className={`rounded-2xl border overflow-hidden cursor-pointer active:scale-[0.99] transition-transform ${darkMode ? "bg-slate-900 border-slate-800 shadow-[0_18px_40px_rgba(2,6,23,0.28)]" : "bg-white border-gray-100 shadow-sm"}`}
            >
              <div className="flex items-center gap-3 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-fuchsia-950/50" : "bg-purple-50"}`}>
                  <img src={task.service?.serviceImage} alt={task.service?.serviceName} className="h-full rounded-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-purple-500 mb-0.5">{task.bookingId}</p>
                  <p className={`text-sm font-bold truncate ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{task.service?.serviceName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={task.status} darkMode={darkMode} />
                    <span className={`text-[10px] flex items-center gap-0.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                      <MapPin size={9} />
                      {task.address?.city}
                    </span>
                  </div>
                </div>
                <ChevronRight size={15} className={`${darkMode ? "text-slate-600" : "text-gray-300"} flex-shrink-0`} />
              </div>
            </motion.div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}
