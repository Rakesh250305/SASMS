import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Inbox,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";
import useDarkMode from "../../utils/useDarkMode";

const STATUS_TABS = ["all", "assigned", "accepted", "picked_up", "in_progress", "completed", "cancelled"];
const STATUS_CONFIG = {
  assigned: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", label: "Assigned" },
  accepted: { bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-500", label: "Accepted" },
  picked_up: { bg: "bg-cyan-100", text: "text-cyan-700", dot: "bg-cyan-500", label: "Picked Up" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", label: "In Progress" },
  completed: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400", label: "Cancelled" },
};

function StatusBadge({ status, darkMode }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.assigned;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${darkMode ? "bg-slate-950 text-slate-200 border border-slate-800" : `${cfg.bg} ${cfg.text}`}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const tabLabel = (tab) =>
  tab === "all" ? "All" : tab === "in_progress" ? "In Progress" : tab === "picked_up" ? "Picked Up" : `${tab.charAt(0).toUpperCase()}${tab.slice(1)}`;

export default function ProviderTasks() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const query = activeTab !== "all" ? `?status=${activeTab}` : "";
        const res = await axios.get(`${apiUrl}/provider/booking${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data.bookings || res.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [activeTab, apiUrl, token]);

  const handleAccept = async (event, id) => {
    event.stopPropagation();
    setAccepting(id);
    try {
      await axios.put(`${apiUrl}/provider/booking/${id}/status`, { status: "accepted" }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/provider/task/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className={`flex-1 flex flex-col relative h-screen ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="bg-gradient-to-br from-[#86198f] to-[#c026d3] px-5 pt-6 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <h1 className="text-xl font-extrabold text-white">My Tasks</h1>
        <p className="text-white/50 text-xs mt-0.5">{tasks.length} tasks total</p>
      </div>

      <div className={`mt-5 mx-4 rounded-2xl border px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar mb-4 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100 shadow-sm"}`}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === tab ? "bg-gradient-to-br from-[#86198f] to-[#c026d3] text-white shadow-sm" : darkMode ? "text-slate-400" : "text-gray-400"}`}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      <div className="px-4 pb-24 space-y-3 overflow-y-auto">
        {loading ? (
          [1, 2, 3].map((item) => <div key={item} className={`rounded-2xl h-32 animate-pulse border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`} />)
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${darkMode ? "bg-fuchsia-950/40" : "bg-purple-50"}`}>
              <Inbox size={24} className={darkMode ? "text-fuchsia-700" : "text-purple-300"} />
            </div>
            <p className={`text-sm font-semibold mb-1 ${darkMode ? "text-slate-200" : "text-slate-600"}`}>No tasks found</p>
            <p className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{activeTab === "all" ? "No tasks assigned yet" : `No ${tabLabel(activeTab).toLowerCase()} tasks`}</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.3) }}
              onClick={() => navigate(`/provider/task/${task._id}`)}
              className={`rounded-2xl border overflow-hidden cursor-pointer active:scale-[0.99] transition-transform ${darkMode ? "bg-slate-900 border-slate-800 shadow-[0_18px_40px_rgba(2,6,23,0.28)]" : "bg-white border-gray-100 shadow-sm"}`}
            >
              <div className={`flex items-center gap-3 p-4 border-b ${darkMode ? "border-slate-800" : "border-gray-50"}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-fuchsia-950/40" : "bg-purple-50"}`}>
                  <img src={task.service?.serviceImage} alt={task.service?.serviceName} className="h-full rounded-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-purple-500 mb-0.5">{task.bookingId}</p>
                  <p className={`text-sm font-bold truncate ${darkMode ? "text-white" : "text-slate-800"}`}>{task.service?.serviceName}</p>
                  <p className={`text-xs uppercase mt-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{task.service?.category}</p>
                </div>
                <StatusBadge status={task.status} darkMode={darkMode} />
              </div>

              <div className="flex items-center gap-4 px-4 py-2.5">
                <div className={`flex items-center gap-1 text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                  <MapPin size={11} className="text-purple-400" />
                  {task.address?.city}, {task.address?.state}
                </div>
                <div className={`flex items-center gap-1 text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                  <Clock size={11} />
                  {timeAgo(task.assignedAt || task.createdAt)}
                </div>
              </div>

              {task.status === "assigned" ? (
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={(event) => handleAccept(event, task._id)}
                    disabled={accepting === task._id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-br from-[#86198f] to-[#c026d3] text-white text-xs font-bold disabled:opacity-50"
                  >
                    {accepting === task._id ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 size={13} /> Accept</>}
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/provider/task/${task._id}`);
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-semibold ${darkMode ? "border-slate-800 bg-slate-950 text-slate-300" : "border-gray-200 text-gray-500"}`}
                  >
                    Details
                  </button>
                </div>
              ) : (
                <div className="px-4 pb-3 flex justify-end">
                  <ChevronRight size={14} className={darkMode ? "text-slate-600" : "text-gray-300"} />
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}
