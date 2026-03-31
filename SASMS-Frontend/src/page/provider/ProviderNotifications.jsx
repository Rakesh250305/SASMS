import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, BellOff, CheckCheck,
  ClipboardList, UserCheck, Package,
  XCircle, CheckCircle2, Info,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";

const TYPE_CONFIG = {
  booking_created:     { icon: ClipboardList, bg: "bg-purple-100", color: "text-purple-600" },
  booking_assigned:    { icon: UserCheck,     bg: "bg-indigo-100", color: "text-indigo-600" },
  booking_in_progress: { icon: Package,       bg: "bg-blue-100",   color: "text-blue-600"   },
  booking_completed:   { icon: CheckCircle2,  bg: "bg-green-100",  color: "text-green-600"  },
  booking_cancelled:   { icon: XCircle,       bg: "bg-red-100",    color: "text-red-500"    },
  default:             { icon: Info,          bg: "bg-gray-100",   color: "text-gray-500"   },
};

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)     return "Just now";
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function NotifCard({ n, onRead }) {
  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => !n.isRead && onRead([n._id])}
      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
        n.isRead ? "bg-white border-gray-100" : "bg-purple-50/60 border-purple-100"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon size={17} className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-bold leading-tight ${n.isRead ? "text-slate-600" : "text-slate-900"}`}>
            {n.title}
          </p>
          {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#c026d3] flex-shrink-0 mt-1" />}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
        {n.booking && (
          <span className="inline-block mt-1.5 text-[10px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            #{n.booking.bookingId}
          </span>
        )}
        <p className="text-[10px] text-gray-400 mt-1.5">{timeAgo(n.createdAt)}</p>
      </div>
    </motion.div>
  );
}

function Skeleton() {
  return (
    <div className="flex gap-3 p-4 bg-white rounded-2xl border border-gray-100 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-gray-100 rounded-full w-2/3" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
      </div>
    </div>
  );
}

export default function ProviderNotifications() {
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [notifs,    setNotifs]    = useState([]);
  const [unread,    setUnread]    = useState(0);
  const [loading,   setLoading]   = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get(`${apiUrl}/provider/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifs(r.data.notifications || []);
        setUnread(r.data.unreadCount   || 0);
      } catch(e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const markRead = async (ids) => {
    try {
      await axios.put(`${apiUrl}/provider/notifications/mark-read`,
        { ids }, { headers: { Authorization: `Bearer ${token}` } });
      setNotifs(prev => prev.map(n => ids.includes(n._id) ? { ...n, isRead: true } : n));
      setUnread(prev => Math.max(0, prev - ids.length));
    } catch(e) { console.error(e); }
  };

  const markAll = async () => {
    try {
      await axios.put(`${apiUrl}/provider/notifications/mark-read`,
        { ids: [] }, { headers: { Authorization: `Bearer ${token}` } });
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch(e) { console.error(e); }
  };

  // Group Today / Yesterday / Earlier
  const groups = notifs.reduce((acc, n) => {
    const diff = Math.floor((Date.now() - new Date(n.createdAt)) / 86400000);
    const k = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : "Earlier";
    (acc[k] = acc[k] || []).push(n);
    return acc;
  }, {});

  return (
    <div className="flex-1 flex flex-col relative h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#86198f] to-[#c026d3] px-5 pt-6 pb-6 h-[30vh] relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white">Notifications</h1>
            <p className="text-white/50 text-xs mt-0.5">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
          {unread > 0 && (
            <button onClick={markAll}
              className="flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl">
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 px-4 pb-24 overflow-y-auto">
        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} />)}</div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-3">
              <BellOff size={24} className="text-purple-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">No notifications yet</p>
            <p className="text-xs text-gray-400">Task activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-5">
            {["Today", "Yesterday", "Earlier"].map(group => {
              if (!groups[group]) return null;
              return (
                <div key={group}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{group}</p>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {groups[group].map(n => <NotifCard key={n._id} n={n} onRead={markRead} />)}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
            <BottomNav/>
    </div>
  );
}