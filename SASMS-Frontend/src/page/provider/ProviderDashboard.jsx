import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Bell, ClipboardList, CheckCircle2, Wrench,
  Package, ChevronRight, ArrowRight, Clock, MapPin,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";
import { getInitials, resolveImageUrl } from "../../component/avatarUtils";

const STATUS_CONFIG = {
  assigned:    { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  in_progress: { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500"   },
  completed:   { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
  cancelled:   { bg: "bg-red-100",    text: "text-red-600",    dot: "bg-red-400"    },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.assigned;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status === "in_progress" ? "In Progress" : status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [provider, setProvider] = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const token = localStorage.getItem("token");

   const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(`${apiUrl}/provider/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res.data.unreadCount || 0);
      } catch (error) {
        console.error(error);
      }
    };

    useEffect(()=>{
      fetchUnreadCount();
    },[])

  useEffect(() => {
    (async () => {
      try {
        const [pR, tR, sR] = await Promise.all([
          axios.get(`${apiUrl}/provider`,                { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/provider/booking?limit=5`,{ headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/provider/stats`,          { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setProvider(pR.data.data || pR.data.provider || pR.data);
        setTasks(tR.data.bookings || tR.data.data || []);
        setStats(sR.data.stats   || sR.data.data   || {});
      } catch (e) {
        if (e.response?.status === 401) navigate("/login");
      }
      setLoading(false);
    })();
  }, []);

  const initials = getInitials(provider?.name, "PR");
  const profilePhoto = resolveImageUrl(apiUrl, provider?.profilePhoto);

  const STATS = [
    { label: "Assigned",    val: stats.assigned,    icon: ClipboardList, c: "text-purple-600", bg: "bg-purple-50" },
    { label: "In Progress", val: stats.in_progress, icon: Wrench,        c: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Completed",   val: stats.completed,   icon: CheckCircle2,  c: "text-green-600",  bg: "bg-green-50"  },
    { label: "Total",       val: stats.total,       icon: Package,       c: "text-gray-500",   bg: "bg-gray-100"  },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#86198f] to-[#c026d3] px-5 pt-8 pb-12 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-6 w-20 h-20 rounded-full bg-white/5" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div>
            <p className="text-white text-lg font-semibold">Hello, {provider?.name}</p>
            <p className="text-white/90 text-sm font-semibold">{provider?.description}</p>
            <p className="text-white/70 text-xs">{provider?.email}</p>
          </div>
          </div>
           <div className="flex items-center gap-2 justify-center">
              <div className="relative">
                <button onClick={() => navigate("/provider/notifications")} className="relative bg-white/20 p-2.5 rounded-xl">
            <Bell size={18} className="text-white" />
          </button>
          {unreadCount > 0 && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full " />
            )}
              </div>
          <button onClick={() => navigate("/provider/profile")} className="relative bg-white/20 w-10 h-10 overflow-hidden border border-white/20 text-white font-extrabold text-sm rounded-xl flex items-center justify-center">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Provider" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </button>
            </div>
        </div>
      </div>

      <div className="flex-1 px-4 pb-20 pt-5 space-y-5 rounded-t-3xl -mt-7 absolute w-full bg-white overflow-y-auto">
            <p className="text-sm font-bold text-slate-800">Overview</p>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {STATS.map(({ label, val, icon: Icon, c, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon size={15} className={c} />
              </div>
              <p className={`text-lg font-extrabold ${c}`}>{val ?? "—"}</p>
              <p className="text-[9px] text-gray-400 font-semibold leading-tight mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/provider/tasks")}
            className="bg-gradient-to-br from-[#86198f] to-[#c026d3] rounded-2xl p-4 text-left relative overflow-hidden"
          >
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
            <ClipboardList size={20} className="text-white mb-2.5" />
            <p className="text-white font-bold text-sm">My Tasks</p>
            <p className="text-white/60 text-xs">View all assigned</p>
          </motion.button>

          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/provider/profile")}
            className="bg-white rounded-2xl p-4 text-left border border-gray-100 shadow-sm relative overflow-hidden"
          >
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-purple-50" />
            <Package size={20} className="text-purple-600 mb-2.5" />
            <p className="text-slate-800 font-bold text-sm">My Profile</p>
            <p className="text-gray-400 text-xs">Account & settings</p>
          </motion.button>
        </div>

        {/* Recent tasks */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">Recent Tasks</p>
          <button onClick={() => navigate("/provider/tasks")}
            className="flex items-center gap-1 text-xs font-semibold text-purple-600">
            View All <ArrowRight size={11} />
          </button>
        </div>

        {loading ? (
          [1,2].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />)
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <ClipboardList size={28} className="text-purple-200 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No tasks yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Assigned tasks will appear here</p>
          </div>
        ) : tasks.map((t, i) => (
          <motion.div key={t._id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/provider/task/${t._id}`)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <img src={`${apiUrl}${t.service?.serviceImage}`} className="h-full rounded-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-purple-500 mb-0.5">{t.bookingId}</p>
                <p className="text-sm font-bold text-slate-800 truncate">{t.service?.serviceName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={t.status} />
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <MapPin size={9} />{t.address?.city}
                  </span>
                </div>
              </div>
              <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>
      <BottomNav/>
    </div>
  );
}
