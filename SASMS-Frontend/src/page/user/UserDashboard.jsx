import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Bell,
  Search,
  Star,
  Clock,
  ChevronRight,
  Wrench,
  Laptop,
  Zap,
  Droplets,
  Shield,
  Wind,
  ArrowRight,
  IndianRupee,
  Castle,
  CarTaxiFrontIcon,
  Bookmark,
  BadgeCheck
} from "lucide-react";
import BottomNav from "../../component/BottomNav";
import StatusBadge from "../../component/StatusBadge";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { getInitials } from "../../utils/avatarUtils";
import useDarkMode from "../../utils/useDarkMode";
const apiUrl = import.meta.env.VITE_BACKEND_URL;

const serviceCategories = [
  { name: "HVAC", icon: <Wind size={22} />, color: "#059669", bg: "#ECFDF5", count: 8 },
  { name: "Electrical", icon: <Zap size={22} />, color: "#F59E0B", bg: "#FFFBEB", count: 12 },
  { name: "Plumbing", icon: <Droplets size={22} />, color: "#10B981", bg: "#ECFDF5", count: 6 },
  { name: "IT Support", icon: <Laptop size={22} />, color: "#047857", bg: "#ECFDF5", count: 15 },
  { name: "Security", icon: <Shield size={22} />, color: "#0EA5E9", bg: "#F0F9FF", count: 4 },
  { name: "Repair", icon: <Wrench size={22} />, color: "#EF4444", bg: "#FEF2F2", count: 9 },
];

export default function UserDashboard() {

  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [data, setData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [services, setServices] = useState([]);
  const searchRef = useRef(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userInitials = getInitials(data?.name, "NA");

  const token = localStorage.getItem("token");

  useEffect(() => {

    const fetchUserData = async () => {
      try {
        const res = await axios.get(
          `${apiUrl}/user`,
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

    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(`${apiUrl}/user/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res.data.unreadCount || 0);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchServices = async () => {
      try {
        const res = await axios.get(
          `${apiUrl}/user/allService`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setServices(res.data.data || []);

      } catch (err) {

        console.error(
          err.response?.data?.message || "Failed to fetch services"
        );

      }
    };


    const fetchRecentBookings = async () => {

      const res = await axios.get(
        `${apiUrl}/user/recentBooking`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBookingHistory(res.data.data);

    };

    fetchUserData();
    fetchRecentBookings();
    fetchServices();
    fetchUnreadCount();

  }, [token, navigate]);

  // Live search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    const q = searchQuery.toLowerCase();
    const results = services.filter(
      (s) => s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
    );
    setSearchResults(results);
  }, [searchQuery, services]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (

    <div className={`flex flex-col min-h-screen relative ${darkMode ? "bg-gray-900" : "bg-slate-50"}`}>

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-5 pt-8 pb-12 relative">
        <div className="absolute bottom-0 left-6 w-20 h-20 rounded-full bg-white/5" />

        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white text-lg font-extrabold">Hello</p>
            <p className="text-white/90 text-sm font-semibold">{data?.name}</p>
            <p className="text-white/70 text-xs">{data?.email}</p>
          </div>

          <div className="flex items-center gap-3">

            <div className="relative">

              <button
                onClick={() => navigate("/user/notifications")}
                className="bg-white/20 p-2 rounded-lg text-white"
              >
                <Bell size={20} />
              </button>


              {unreadCount > 0 && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
              )}

            </div>

            <button
              onClick={() => navigate("/user/profile")}
              className="w-9 h-9 z-20 rounded-xl overflow-hidden bg-white/20 border border-white/40 text-white font-bold text-xs flex items-center justify-center"
            >
              {data?.profilePhoto ? (
                <img src={data.profilePhoto} alt="User" className="w-full h-full object-cover" />
              ) : (
                userInitials
              )}
            </button>


          </div>

        </div>

        {/* Search */}

        <div ref={searchRef} className={`${darkMode ? "bg-gray-100" : "bg-white"} relative rounded-xl px-4 py-3 flex items-center gap-2 shadow-md z-50`}>
          <Search size={18} className="text-gray-400" />

          <input
            className="text-gray-600 text-sm w-full outline-none"
            type="text"
            placeholder="Search for a service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setIsSearching(false);
              }}
              className="text-gray-400"
            >
              ✕
            </button>
          )}

          {/* SEARCH DROPDOWN */}
          {isSearching && (
            <div className={`absolute top-13 left-0 w-full ${darkMode ? "bg-gray-800" : "bg-white"}  rounded-xl shadow-lg max-h-64 overflow-y-auto z-[99999]`}>
              {searchResults.length === 0 ? (
                <div className="p-4 text-sm text-gray-400">
                  No services found for "{searchQuery}"
                </div>
              ) : (
                searchResults.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center gap-3 p-3 border-b last:border-none hover:bg-gray-50 cursor-pointer"
                  >
                    {s.serviceImage && (
                      <img
                        src={s.serviceImage}
                        alt={s.serviceName}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}

                    <div className="flex-1"
                    onClick={() => navigate(`/user/services/${s._id}`)}>
                      <div className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-800"}`}>
                        {s.serviceName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {s.category}
                      </div>
                    </div>

                    <span className="text-xs text-emerald-600 font-semibold"
                    onClick={() => navigate(`/user/booking?serviceId=${s._id}`)}>
                      Book →
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* Content */}

      <div className="flex-1 overflow-y-auto px-4 pb-20 -mt-6">
        {/* Newly Added Services */}
        <div className="flex gap-3 mb-5">

          {services.slice(-2).map((s, i) => (

            <motion.div
              key={i}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/user/booking")}
              className="flex-1 rounded-xl p-4 text-white relative overflow-hidden cursor-pointer bg-gradient-to-br from-emerald-500 to-emerald-700"
            >

              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10"></div>

              <div className="flex justify-between items-center">
                <p className="text-[10px] font-semibold opacity-80 mb-1">
                  Newly Added
                </p>
                <BadgeCheck size={20} />
              </div>

              <p className="text-sm font-extrabold leading-tight mb-1">
                {s.serviceName}
              </p>

              <p className="text-xs flex items-center gap-1 opacity-80 mb-2">
                <Bookmark size={14} /> {s.category.toUpperCase()}
              </p>

              <p className="flex  gap-2 text-lg font-bold">
                From
                <span className="flex items-center">
                  ₹ {s.estimatedPrice}
                </span>
              </p>

            </motion.div>

          ))}

        </div>

        {/* Create Booking Button */}

        <button
          onClick={() => navigate("/user/booking")}
          className="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition mb-6"
        >
          Create Booking
        </button>

        {/* Services */}

        <div className="flex items-center justify-between mb-3">

          <h3 className={`text-sm font-bold ${darkMode ? "text-slate-300" : "text-slate-800"}`}>
            Services
          </h3>

          <button
            onClick={() => navigate("/user/services")}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600"
          >
            See All
            <ArrowRight size={12} />
          </button>

        </div>

        {/* Category Grid */}

        <div className="grid grid-cols-3 gap-3 mb-6">

          {serviceCategories.map((cat) => (

            <motion.button
              key={cat.name}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/user/services?category=${encodeURIComponent(cat.name)}`)}
              className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl py-4 flex flex-col items-center gap-2 shadow-sm relative`}
            >

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: cat.bg, color: cat.color }}
              >
                {cat.icon}
              </div>

              <span className={`text-xs font-semibold ${darkMode ? "text-slate-400" : "text-slate-700"}`}>
                {cat.name}
              </span>

            </motion.button>

          ))}

        </div>

        {/* Booking Section */}

        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-bold  ${darkMode ? "text-slate-300" : "text-slate-800"} `}>My Bookings</h3>
          <button
            onClick={() => navigate("/user/bookings")}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600"
          >
            View All
            <ArrowRight size={12} />
          </button>
        </div>

        {bookingHistory.length === 0 ? (
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6 text-center shadow-sm`}>
            <p className="text-sm text-gray-400">No bookings yet</p>
            <button
              onClick={() => navigate("/user/booking")}
              className="mt-2 text-xs text-emerald-600 font-semibold"
            >
              Create your first booking →
            </button>
          </div>
        ) : (
          bookingHistory.map((activity, i) => {
            const booking = activity.entityId;

            return (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => navigate(`/user/booking/${booking._id}`)}
                className={`${darkMode ? "bg-gray-800" : "bg-white" } rounded-xl p-4 mb-3 shadow-sm cursor-pointer`}
              >
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-xs text-green-400 font-mono">
                      {booking?.bookingId}
                    </p>
                    <p className={`text-sm font-bold ${darkMode ? "text-slate-300" : "text-slate-800"}`}>
                      {booking?.service?.serviceName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking?.provider
                        ? `by ${booking.provider.name}`
                        : "Provider not assigned yet"}
                    </p>
                  </div>
                  <StatusBadge status={booking?.status} small />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    {new Date(booking?.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div
                    className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"
                  >
                    Track
                    <ChevronRight size={12} />
                  </div>
                </div>

              </motion.div>
            );
          })
        )}

        <div className={`text-[8px] text-center font-bold pt-3 pb-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          Smart Assets & Service Management System
        </div>

      </div>

      <BottomNav role="user" />

    </div>

  );
}
