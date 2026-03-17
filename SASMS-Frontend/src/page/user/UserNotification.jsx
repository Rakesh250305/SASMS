import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Bell,
  BellOff,
  CheckCheck,
  Calendar,
  Package,
  UserCheck,
  XCircle,
  ClipboardList,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../../component/BottomNav";

/* ── Notification type → icon + colors ─────────────────── */
const TYPE_CONFIG = {
  booking_created:    { icon: ClipboardList, bg: "bg-emerald-100", color: "text-emerald-600" },
  booking_assigned:   { icon: UserCheck,     bg: "bg-indigo-100",  color: "text-indigo-600"  },
  booking_in_progress:{ icon: Package,       bg: "bg-blue-100",    color: "text-blue-600"    },
  booking_completed:  { icon: CheckCheck,    bg: "bg-emerald-100", color: "text-emerald-600" },
  booking_cancelled:  { icon: XCircle,       bg: "bg-red-100",     color: "text-red-500"     },
  default:            { icon: Info,          bg: "bg-gray-100",    color: "text-gray-500"    },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)           return "Just now";
  if (diff < 3600)         return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)        return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)       return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function NotifCard({ notif, onMarkRead }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.default;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors cursor-pointer
        ${notif.isRead
          ? "bg-white border-gray-100"
          : "bg-emerald-50/60 border-emerald-100"
        }`}
      onClick={() => !notif.isRead && onMarkRead([notif._id])}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon size={18} className={cfg.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-bold leading-tight ${notif.isRead ? "text-slate-700" : "text-slate-900"}`}>
            {notif.title}
          </p>
          {!notif.isRead && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{timeAgo(notif.createdAt)}</p>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-100 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-gray-100 rounded-full w-2/3" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
      </div>
    </div>
  );
}

export default function UserNotification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/user/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (ids) => {
    try {
      await axios.put(
        "http://localhost:5000/user/notifications/mark-read",
        { ids },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n._id) ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/user/notifications/mark-read",
        { ids: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Group by Today / Yesterday / Earlier
  const grouped = notifications.reduce((acc, n) => {
    const date = new Date(n.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    const key = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : "Earlier";
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  const groupOrder = ["Today", "Yesterday", "Earlier"];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-5 pt-6 pb-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Notifications</h1>
            <p className="text-white/60 text-xs mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 px-4 pb-24">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <BellOff size={28} className="text-emerald-400" />
            </div>
            <p className="text-slate-700 font-semibold text-sm mb-1">No notifications yet</p>
            <p className="text-gray-400 text-xs">We'll notify you when something happens</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groupOrder.map((group) => {
              if (!grouped[group]) return null;
              return (
                <div key={group}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                    {group}
                  </p>
                  <div className="flex flex-col gap-2">
                    <AnimatePresence>
                      {grouped[group].map((n) => (
                        <NotifCard key={n._id} notif={n} onMarkRead={handleMarkRead} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav role="user" />
    </div>
  );
}