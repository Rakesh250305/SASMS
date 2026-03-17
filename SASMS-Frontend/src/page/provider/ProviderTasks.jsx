import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ChevronLeft, Wrench, MapPin, Clock, ChevronRight,
  Inbox, CheckCircle2, XCircle,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";

const STATUS_TABS = ["all", "assigned", "in_progress", "completed", "cancelled"];

const STATUS_CONFIG = {
  assigned:    { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", label: "Assigned"    },
  in_progress: { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500",   label: "In Progress" },
  completed:   { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500",  label: "Completed"   },
  cancelled:   { bg: "bg-red-100",    text: "text-red-600",    dot: "bg-red-400",    label: "Cancelled"   },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.assigned;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const tabLabel = (t) =>
  t === "all" ? "All" : t === "in_progress" ? "In Progress" : t.charAt(0).toUpperCase() + t.slice(1);

export default function ProviderTasks() {
  const navigate = useNavigate();
  const [tasks,       setTasks]       = useState([]);
  const [activeTab,   setActiveTab]   = useState("all");
  const [loading,     setLoading]     = useState(true);
  const [accepting,   setAccepting]   = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const p = activeTab !== "all" ? `?status=${activeTab}` : "";
        const r = await axios.get(`http://localhost:5000/provider/booking${p}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(r.data.bookings || r.data.data || []);
      } catch(e) { console.error(e); }
      setLoading(false);
    })();
  }, [activeTab]);

  const handleAccept = async (e, id) => {
    e.stopPropagation();
    setAccepting(id);
    try {
      await axios.put(`http://localhost:5000/provider/booking/${id}/status`,
        { status: "in_progress" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(prev => prev.map(t => t._id === id ? { ...t, status: "in_progress" } : t));
    } catch(e) { console.error(e); }
    setAccepting(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#86198f] to-[#c026d3] px-5 pt-6 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <h1 className="text-xl font-extrabold text-white">My Tasks</h1>
        <p className="text-white/50 text-xs mt-0.5">{tasks.length} tasks total</p>
      </div>

      {/* Tabs */}
      <div className="mt-5 mx-4 bg-white rounded-2xl shadow-sm border border-gray-100 px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar mb-4">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === t
                ? "bg-gradient-to-br from-[#86198f] to-[#c026d3] text-white shadow-sm"
                : "text-gray-400"
            }`}>
            {tabLabel(t)}
          </button>
        ))}
      </div>

      <div className="px-4 pb-24 space-y-3">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />)
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-3">
              <Inbox size={24} className="text-purple-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">No tasks found</p>
            <p className="text-xs text-gray-400">
              {activeTab === "all" ? "No tasks assigned yet" : `No ${tabLabel(activeTab).toLowerCase()} tasks`}
            </p>
          </div>
        ) : tasks.map((t, i) => (
          <motion.div key={t._id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
            onClick={() => navigate(`/provider/task/${t._id}`)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
          >
            {/* Top */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-50">
              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <img src={`http://localhost:5000${t.service?.serviceImage}`} className="h-full rounded-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-purple-500 mb-0.5">{t.bookingId}</p>
                <p className="text-sm font-bold text-slate-800 truncate">{t.service?.serviceName}</p>
                <p className="text-xs text-gray-400">{t.service?.category}</p>
              </div>
              <StatusBadge status={t.status} />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 px-4 py-2.5">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={11} className="text-purple-400" />
                {t.address?.city}, {t.address?.state}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={11} />
                {timeAgo(t.assignedAt || t.createdAt)}
              </div>
            </div>

            {/* Accept or navigate */}
            {t.status === "assigned" ? (
              <div className="px-4 pb-4 flex gap-2">
                <button
                  onClick={(e) => handleAccept(e, t._id)}
                  disabled={accepting === t._id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-br from-[#86198f] to-[#c026d3] text-white text-xs font-bold disabled:opacity-50"
                >
                  {accepting === t._id
                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><CheckCircle2 size={13} /> Accept</>}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/provider/task/${t._id}`); }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500"
                >
                  Details
                </button>
              </div>
            ) : (
              <div className="px-4 pb-3 flex justify-end">
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
            <BottomNav/>      
    </div>
  );
}