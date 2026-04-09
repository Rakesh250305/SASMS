import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  BellOff,
  CheckCheck,
  ClipboardList,
  UserCheck,
  Package,
  XCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";
import useDarkMode from "../../utils/useDarkMode";

const TYPE_CONFIG = {
  booking_created: { icon: ClipboardList, bg: "bg-purple-100", color: "text-purple-600" },
  booking_assigned: { icon: UserCheck, bg: "bg-indigo-100", color: "text-indigo-600" },
  booking_in_progress: { icon: Package, bg: "bg-blue-100", color: "text-blue-600" },
  booking_completed: { icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600" },
  booking_cancelled: { icon: XCircle, bg: "bg-red-100", color: "text-red-500" },
  default: { icon: Info, bg: "bg-gray-100", color: "text-gray-500" },
};

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function NotifCard({ notification, onRead, darkMode }) {
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.default;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => !notification.isRead && onRead([notification._id])}
      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
        notification.isRead
          ? darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-gray-100"
          : darkMode
            ? "bg-fuchsia-950/30 border-fuchsia-900/60"
            : "bg-purple-50/60 border-purple-100"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-slate-950" : cfg.bg}`}>
        <Icon size={17} className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-bold leading-tight ${notification.isRead ? darkMode ? "text-slate-300" : "text-slate-600" : darkMode ? "text-slate-100" : "text-slate-900"}`}>
            {notification.title}
          </p>
          {!notification.isRead && <span className="w-2 h-2 rounded-full bg-[#c026d3] flex-shrink-0 mt-1" />}
        </div>
        <p className={`text-xs mt-0.5 leading-relaxed ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{notification.message}</p>
        {notification.booking && (
          <span className={`inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full ${darkMode ? "text-fuchsia-300 bg-slate-950 border border-slate-800" : "text-purple-600 bg-purple-50"}`}>
            #{notification.booking.bookingId}
          </span>
        )}
        <p className={`text-[10px] mt-1.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{timeAgo(notification.createdAt)}</p>
      </div>
    </motion.div>
  );
}

function Skeleton({ darkMode }) {
  return (
    <div className={`flex gap-3 p-4 rounded-2xl border animate-pulse ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
      <div className={`w-10 h-10 rounded-xl flex-shrink-0 ${darkMode ? "bg-slate-800" : "bg-gray-100"}`} />
      <div className="flex-1 space-y-2 pt-1">
        <div className={`h-3.5 rounded-full w-2/3 ${darkMode ? "bg-slate-800" : "bg-gray-100"}`} />
        <div className={`h-3 rounded-full w-full ${darkMode ? "bg-slate-800" : "bg-gray-100"}`} />
        <div className={`h-3 rounded-full w-1/4 ${darkMode ? "bg-slate-800" : "bg-gray-100"}`} />
      </div>
    </div>
  );
}

export default function ProviderNotifications() {
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${apiUrl}/provider/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifs(res.data.notifications || []);
        setUnread(res.data.unreadCount || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [apiUrl, token]);

  const markRead = async (ids) => {
    try {
      await axios.put(`${apiUrl}/provider/notifications/mark-read`, { ids }, { headers: { Authorization: `Bearer ${token}` } });
      setNotifs((prev) => prev.map((item) => (ids.includes(item._id) ? { ...item, isRead: true } : item)));
      setUnread((prev) => Math.max(0, prev - ids.length));
    } catch (error) {
      console.error(error);
    }
  };

  const markAll = async () => {
    try {
      await axios.put(`${apiUrl}/provider/notifications/mark-read`, { ids: [] }, { headers: { Authorization: `Bearer ${token}` } });
      setNotifs((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnread(0);
    } catch (error) {
      console.error(error);
    }
  };

  const groups = notifs.reduce((acc, item) => {
    const diff = Math.floor((Date.now() - new Date(item.createdAt)) / 86400000);
    const key = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : "Earlier";
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});

  return (
    <div className={`flex-1 flex flex-col relative h-screen ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="bg-gradient-to-br from-[#86198f] to-[#c026d3] px-5 pt-6 pb-6 h-[10vh] relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white">Notifications</h1>
            <p className="text-white/50 text-xs mt-0.5">{unread > 0 ? `${unread} unread` : "All caught up"}</p>
          </div>
          {unread > 0 && (
            <button onClick={markAll} className="flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl">
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 px-4 pb-24 overflow-y-auto">
        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4].map((item) => <Skeleton key={item} darkMode={darkMode} />)}</div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${darkMode ? "bg-fuchsia-950/40" : "bg-purple-50"}`}>
              <BellOff size={24} className={darkMode ? "text-fuchsia-700" : "text-purple-300"} />
            </div>
            <p className={`text-sm font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>No notifications yet</p>
            <p className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Task activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-5">
            {["Today", "Yesterday", "Earlier"].map((group) => {
              if (!groups[group]) return null;
              return (
                <div key={group}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 px-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{group}</p>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {groups[group].map((notification) => (
                        <NotifCard key={notification._id} notification={notification} onRead={markRead} darkMode={darkMode} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
