import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu, Bell, Package, Users, UserCog, ClipboardList,
  TrendingUp, Clock, ArrowRight, Plus,
  Info,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ServerIcon,
} from "lucide-react";

import AdminDrawer from "../../component/AdminDrawer";
import axios from "axios";

const STAT_CONFIG = [
  { key: "pending",     label: "Pending",     icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50"  },
  { key: "assigned",    label: "Assigned",    icon: UserCheck,     color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "in_progress", label: "In Progress", icon: ClipboardList, color: "text-blue-600",   bg: "bg-blue-50"   },
  { key: "completed",   label: "Completed",   icon: CheckCircle2,  color: "text-green-600",  bg: "bg-green-50"  },
];

export default function AdminDashboard() {

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState([]);
  const [bookingStats, setBookingStats] = useState({});
  const [activities, setActivities] = useState([]);

  const summaryCards = [
    { label: "Total Assets", value: stats.assets, icon: <Package size={22} />, color: "text-blue-700", bg: "bg-blue-50", trend: "+12", path: "/admin/assets" },
    { label: "Active Services", value: stats.services, icon: <ClipboardList size={22} />, color: "text-green-700", bg: "bg-green-50", trend: "+5", path: "/admin/assignments" },
    { label: "Providers", value: stats.providers, icon: <UserCog size={22} />, color: "text-purple-700", bg: "bg-purple-50", trend: "+3", path: "/admin/providers" },
    { label: "Service Bookings", value: stats.users, icon: <ServerIcon size={22} />, color: "text-orange-600", bg: "bg-orange-50", trend: "+24", path: "/admin/serviceRequested" },
  ];
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await axios.get(
          `${apiUrl}/admin`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setData(res.data.data);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    const fetchBookingStats = async () => {
      try {

        const res = await axios.get(
          `${apiUrl}/admin/booking/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setBookingStats(res.data.stats);

      } catch (error) {
        console.error(error);
      }
    };

    const fetchStats = async () => {
      try {

        const res = await axios.get(
          `${apiUrl}/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setStats(res.data.data);

      } catch (error) {
        console.error(error);
      }
    };

    const fetchActivities = async () => {

      const res = await axios.get(
        `${apiUrl}/admin/activities`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setActivities(res.data.data);
    };


    fetchActivities();
    fetchBookingStats();
    fetchStats();
    fetchAdminData();
  }, [token, navigate])

  return (

    <div className="flex flex-col flex-1 bg-[#F5F7FA] relative overflow-hidden">

      <AdminDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Top Bar */}

      <div className="bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#42A5F5] px-5 pt-4 pb-7 relative overflow-hidden">

        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] rounded-full bg-white/10" />
        <div className="absolute -bottom-15 -left-8 w-[120px] h-[120px] rounded-full bg-white/10" />

        <div className="flex items-center justify-between">

          <button
            onClick={() => setDrawerOpen(true)}
            className="bg-white/20 rounded-lg p-2 text-white"
          >
            <Menu size={20} />
          </button>

          <div className="text-white text-[15px] font-bold">
            Dashboard
          </div>

          <div className="relative">

            <button
              onClick={() => navigate("/admin/notifications")}
              className="bg-white/20 rounded-lg p-2 text-white"
            >
              <Bell size={20} />
            </button>

            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-blue-600" />

          </div>

        </div>

        <div className="mt-3 text-white/90">

          <div className="text-xs opacity-70">
            Good morning, {data.name}
          </div>

          <div className="text-lg flex flex-col font-extrabold">
            {data.storeName}
            <small>{data.storeAddress}</small>
          </div>

          <p className="absolute right-1">GST: {data?.GSTNo || ""}</p>

        </div>

      </div>

      {/* Content */}

      <div className="flex-1 overflow-y-auto px-4 py-8 -mt-4">

        {/* Booking Stats */}

        <div className="grid grid-cols-4 my-1 gap-2">
          {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg }) => (
            <div key={key} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon size={15} className={color} />
              </div>
              <p className={`text-sm font-extrabold ${color}`}>{bookingStats[key] ?? "—"}</p>
              <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Overview */}

        <div className="text-sm font-bold text-gray-900 mb-3">
          Overview
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">

          {summaryCards.map((card, i) => (

            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-2xl p-4 shadow-sm text-left relative overflow-hidden"
            >

              <div className={`absolute -bottom-4 -right-4 w-[70px] h-[70px] rounded-full ${card.bg} opacity-70`} />

              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-2 ${card.color}`}>
                {card.icon}
              </div>

              <div className="text-2xl font-extrabold text-gray-900 leading-none">
                {card.value}
              </div>

              <div className="text-[11px] text-gray-500 mt-1 font-medium">
                {card.label}
              </div>

              <div className="flex items-center gap-1 mt-2">

                <TrendingUp size={12} className={card.color} />

                <span className={`text-[11px] font-semibold ${card.color}`}>
                  {card.trend} this week
                </span>

              </div>

            </motion.button>

          ))}

        </div>

        {/* Quick Actions */}

        <div className="text-sm font-bold text-gray-900 mb-3">
          Quick Actions
        </div>

        <div className="flex gap-2 mb-5">

          {[
            { label: "Add Asset", color: "text-blue-700", bg: "bg-blue-50", path: "/admin/assets" },
            { label: "Add Service", color: "text-green-600", bg: "bg-green-50", path: "/admin/service" },
            { label: "Add Provider", color: "text-purple-700", bg: "bg-purple-50", path: "/admin/providers" },
          ].map((action) => (

            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border ${action.bg} ${action.color}`}
            >

              <Plus size={18} />

              <span className="text-[11px] font-bold">
                {action.label}
              </span>

            </button>

          ))}

        </div>

        <div className="flex gap-2 mb-5">
            <button
              onClick={() => navigate("/admin/serviceRequest")}
              className={`flex-1 flex flex-row items-center justify-center gap-1 py-3 rounded-xl border bg-orange-50 text-orange-600`}
            >
              <span className="text-[11px] font-bold">
                Service Requests
              </span>
            </button>
        </div>

        {/* Recent Activity */}

        <div className="flex justify-between items-center mb-3">

          <div className="text-sm font-bold text-gray-900">
            Recent Activity
          </div>

          <button className="flex items-center gap-1 text-xs font-semibold text-blue-700"
            onClick={() => navigate("/admin/notifications")}>

            View All

            <ArrowRight size={12} />

          </button>

        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {activities.slice(0,5).map((act, i) => {

            const ui = getActivityUI(act);

            return (

              <div
                key={act._id || i}
                className={`flex gap-3 p-4 ${i !== activities.length - 1 ? "border-b" : ""
                  }`}
              >

                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${ui.bg} ${ui.color}`}
                >
                  {ui.icon}
                </div>

                <div className="flex-1">

                  <div className="text-xs text-gray-800 font-medium leading-snug">
                    {act.description}
                  </div>

                  <div className="text-[10px] text-gray-400 mt-1">
                    {formatTimeAgo(act.createdAt)}
                  </div>

                </div>

              </div>

            );
          })}

        </div>

      </div>

    </div>

  );


}
const getActivityUI = (activity) => {
  switch (activity.entityType) {

    case "asset":
      return {
        icon: <Package size={16} />,
        color: "text-purple-700",
        bg: "bg-purple-50"
      };

    case "service":
      return {
        icon: <ClipboardList size={16} />,
        color: "text-orange-600",
        bg: "bg-orange-50"
      };

    case "provider":
      return {
        icon: <UserCog size={16} />,
        color: "text-green-700",
        bg: "bg-green-50"
      };

    case "user":
      return {
        icon: <Users size={16} />,
        color: "text-blue-700",
        bg: "bg-blue-50"
      };

    default:
      return {
        icon: <Info size={16} />,
        color: "text-gray-700",
        bg: "bg-gray-100"
      };
  }
};

const formatTimeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return `${Math.floor(diff / 86400)}d ago`;
};

