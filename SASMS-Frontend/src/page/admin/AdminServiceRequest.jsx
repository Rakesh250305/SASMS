import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronLeft,
  Search,
  Users,
  ClipboardList,
  Mail,
  Phone,
  Calendar,
  Clock,
  Package,
  ChevronRight,
  Inbox,
  UserCheck,
  SlidersHorizontal,
  X,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDarkMode from "../../utils/useDarkMode";

const STATUS_CONFIG = {
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
  assigned: { label: "Assigned", bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-400" },
  in_progress: { label: "In Progress", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
};

const STATUS_FILTERS = ["all", "pending", "assigned", "in_progress", "completed", "cancelled"];

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-orange-100", text: "text-orange-600" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
];

const PAGE_SIZE = 5;

const formatCategory = (value) =>
  value
    ? value.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase()
    : "UNCATEGORIZED";

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 flex gap-3 animate-pulse border border-gray-100">
      <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-gray-100 rounded-full w-2/3" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
      </div>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const filterLabel = (s) =>
  s === "all" ? "All" :
    s === "in_progress" ? "In Progress" :
      s.charAt(0).toUpperCase() + s.slice(1);

export default function AdminServiceRequest() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [activeTab, setActiveTab] = useState("bookings");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { darkMode } = useDarkMode();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/admin/booking?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  // Derive unique users from bookings
  const derivedUsers = useMemo(() => {
    const map = new Map();
    bookings.forEach((b) => {
      if (b.user && !map.has(b.user._id)) {
        map.set(b.user._id, { ...b.user, bookingCount: 0, lastBooking: b.createdAt });
      }
      if (b.user) {
        const u = map.get(b.user._id);
        u.bookingCount = (u.bookingCount || 0) + 1;
        if (new Date(b.createdAt) > new Date(u.lastBooking)) u.lastBooking = b.createdAt;
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  // Count per status for filter chips
  const statusCounts = useMemo(() => {
    const counts = { all: bookings.length };
    STATUS_FILTERS.slice(1).forEach((s) => {
      counts[s] = bookings.filter((b) => b.status === s).length;
    });
    return counts;
  }, [bookings]);

  const pendingCount = statusCounts.pending || 0;

  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (statusFilter !== "all") list = list.filter((b) => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingId?.toLowerCase().includes(q) ||
          b.service?.serviceName?.toLowerCase().includes(q) ||
          b.user?.name?.toLowerCase().includes(q) ||
          b.user?.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, statusFilter, search]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return derivedUsers;
    const q = search.toLowerCase();
    return derivedUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
    );
  }, [derivedUsers, search]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, statusFilter]);

  const pagedBookings = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredBookings.slice(start, start + PAGE_SIZE);
  }, [filteredBookings, page]);

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  const totalPages = Math.max(
    1,
    Math.ceil((activeTab === "bookings" ? filteredBookings.length : filteredUsers.length) / PAGE_SIZE)
  );

  const TABS = [
    { key: "bookings", label: "Bookings", icon: ClipboardList, count: pendingCount },
    { key: "users", label: "Users", icon: Users, count: derivedUsers.length },
  ];

  return (
    <div className={`h-screen flex flex-1 flex-col relative ${darkMode ? "bg-gray-900" : "bg-[#F5F7FA]"}`}>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#42A5F5] sticky px-5 pt-6 pb-6 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-8 w-20 h-20 rounded-full bg-white/5" />

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/admin")}
            className="bg-white/20 text-white p-2 rounded-lg"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white mb-1">Service Requests</h1>
            <p className="text-white/60 text-xs">
              {bookings.length} bookings · {pendingCount} need attention
            </p>
          </div>

        </div>



        {/* Search + filter row */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2.5">
            <Search size={15} className="text-white/70 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "bookings" ? "Search bookings..." : "Search users..."}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-white/50"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-white/60">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mt-2 mx-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden mb-3">
        {TABS.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSearch(""); setStatusFilter("all"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2 ${activeTab === key
                ? `${darkMode ? "text-blue-300 border-gray-700 bg-gray-600" : "text-[#1976D2] border-[#1976D2] bg-blue-50/50"} `
                : `text-gray-400 ${darkMode ? "bg-gray-700" : "bg-white"} border-transparent`
              }`}
          >
            <Icon size={15} />
            {label}
            {count > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === key ? "bg-[#1976D2] text-white" : "bg-gray-100 text-gray-500"
                }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Status filter chips — only on bookings tab */}
      <AnimatePresence>
        {activeTab === "bookings" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 mb-3"
          >
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {STATUS_FILTERS.map((s) => {
                const active = statusFilter === s;
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${active
                        ? "bg-[#1976D2] text-white border-[#1976D2] shadow-sm"
                        : `${darkMode ? "bg-white/80" : "bg-white"} text-gray-500 border-gray-200`
                      }`}
                  >
                    {cfg && !active && (
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    )}
                    {filterLabel(s)}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                      {statusCounts[s] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active filter summary */}
            {(statusFilter !== "all" || search) && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Showing <span className="font-semibold text-slate-700">{filteredBookings.length}</span> booking{filteredBookings.length !== 1 ? "s" : ""}
                  {statusFilter !== "all" && <> · <span className={`font-semibold ${STATUS_CONFIG[statusFilter]?.text}`}>{filterLabel(statusFilter)}</span></>}
                  {search && <> matching "<span className="font-semibold">{search}</span>"</>}
                </p>
                <button
                  onClick={() => { setStatusFilter("all"); setSearch(""); }}
                  className="text-xs text-[#1976D2] font-semibold flex items-center gap-1"
                >
                  <X size={11} />
                  Clear
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 px-4 pb-10 space-y-3 overflow-y-auto">

        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>

        ) : activeTab === "bookings" ? (
          filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className={`w-16 h-16 rounded-2xl ${darkMode ? "bg-gray-600 text-blue-500" : " text-blue-400 bg-blue-50"} flex items-center justify-center mb-4`}>
                <Inbox size={28} />
              </div>
              <p className="text-slate-700 font-semibold text-sm mb-1">No bookings found</p>
              <p className="text-gray-400 text-xs mb-4">
                {search
                  ? `No ${statusFilter !== "all" ? filterLabel(statusFilter).toLowerCase() : ""} results for "${search}"`
                  : statusFilter !== "all"
                    ? `No ${filterLabel(statusFilter).toLowerCase()} bookings`
                    : "No service bookings yet"}
              </p>
              {(statusFilter !== "all" || search) && (
                <button
                  onClick={() => { setStatusFilter("all"); setSearch(""); }}
                  className="text-xs text-[#1976D2] font-semibold border border-[#1976D2] px-4 py-2 rounded-xl"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            pagedBookings.map((b, i) => (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                onClick={() => navigate(`/admin/booking/${b._id}`)}
                className={`${darkMode ? "bg-ray-700" : "bg-white"} rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.99] transition-transform`}
              >
                {/* Top */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-50">
                  {b.service?.serviceImage ? (
                    <img
                      src={b.service.serviceImage}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-[#1976D2] mb-0.5">{b.bookingId}</p>
                    <p className={`text-sm font-bold ${darkMode ? "text-slate-400" : "text-slate-800"} truncate`}>
                      {b.service?.serviceName || "Service"}
                    </p>
                    <p className="text-[10px] font-bold tracking-wide text-gray-400">
                      {formatCategory(b.service?.category)}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                {/* Details */}
                <div className="px-4 py-3 grid grid-cols-2 gap-y-2.5 gap-x-4">
                  <div className="flex items-center gap-2">
                    
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 bg-blue-100 flex items-center justify-center flex-shrink-0 ">
                      {b.user.profilePhoto ? (
                        <img
                          src={b.user.profilePhoto}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-blue-100 text-blue-700 text-xs font-bold ">{b.user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Customer</p>
                      <p className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-700"} font-medium`}>{b.user?.name || "—"}</p>
                      <p className="text-[10px] text-gray-400 truncate">{b.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <UserCheck size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Provider</p>
                      <p className={`text-xs font-medium ${b.provider ? "text-slate-700" : "text-amber-600"}`}>
                        {b.provider?.name || "Not assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Booked</p>
                      <p className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-700"} font-medium`}>{timeAgo(b.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Location</p>
                      <p className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-700"} font-medium`}>
                        {b.address?.city}, {b.address?.state}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={`px-4 py-2.5 flex items-center justify-between ${b.status === "pending" ? `${darkMode ? "bg-gray-800" : "bg-amber-50"}` : `${darkMode ? "bg-gray-600" : "bg-gray-50"}`
                  }`}>
                  {b.status === "pending" ? (
                    <span className="text-xs font-semibold text-amber-600">⚡ Needs assignment</span>
                  ) : b.status === "assigned" ? (
                    <span className="text-xs font-semibold text-indigo-600">👷 {b.provider?.name}</span>
                  ) : b.status === "in_progress" ? (
                    <span className="text-xs font-semibold text-blue-600">🔧 In progress</span>
                  ) : b.status === "completed" ? (
                    <span className="text-xs font-semibold text-green-600">✓ Completed</span>
                  ) : (
                    <span className="text-xs text-gray-400">Tap to view details</span>
                  )}
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </motion.div>
            ))
          )

        ) : (
          /* ── USERS TAB ─────────────────────────────── */
          filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className={`w-16 h-16 rounded-2xl ${darkMode ? "bg-gray-600" : "bg-blue-50"} flex items-center justify-center mb-4`}>
                <Users size={28} className="text-blue-400" />
              </div>
              <p className="text-slate-700 font-semibold text-sm mb-1">No users found</p>
              <p className="text-gray-400 text-xs">
                {search ? `No results for "${search}"` : "No users have booked yet"}
              </p>
            </div>
          ) : (
            pagedUsers.map((user, i) => {
              const clr = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const initials = user.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
              const userBookings = bookings.filter(b => b.user?._id === user._id);
              const pendingUserBookings = userBookings.filter(b => b.status === "pending").length;

              return (
                <motion.div
                  key={user._id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className={`${darkMode? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm border border-gray-100 p-4`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${clr.bg} ${clr.text}`}>
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${darkMode ? "text-slate-400" : "text-slate-800"}`}>{user.name}</p>
                      {user.email && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Mail size={11} className="text-gray-400" />
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-gray-400" />
                          <p className="text-xs text-gray-400">{user.phone}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                          <ClipboardList size={11} />
                          {userBookings.length} booking{userBookings.length !== 1 ? "s" : ""}
                        </span>
                        {pendingUserBookings > 0 && (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            {pendingUserBookings} pending
                          </span>
                        )}
                        {(user.lastBooking || userBookings[0]?.createdAt) && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Clock size={11} />
                            {timeAgo(user.lastBooking || userBookings[0]?.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {userBookings.length > 0 && (
                      <button
                        onClick={() => { setActiveTab("bookings"); setSearch(user.name); setStatusFilter("all"); }}
                        className={`w-8 h-8 rounded-xl ${darkMode ? "bg-gray-700" : "bg-blue-50"} flex items-center justify-center flex-shrink-0`}
                      >
                        <ChevronRight size={14} className="text-[#1976D2]" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )
        )}
        {!loading && totalPages > 1 && (
          <div className="sticky -bottom-5 pt-2 pb-1">
            <div className={`${darkMode ? "bg-gray-700" : "bg-white"} rounded-2xl border border-gray-100 shadow-sm px-3 py-3 flex items-center justify-between`}>
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-600 disabled:opacity-40"
              >
                Prev
              </button>

              <div className="text-center">
                <p className={`text-xs font-semibold ${darkMode ? "text-slate-500" : "text-slate-700"}`}>Page {page} of {totalPages}</p>
                <p className="text-[10px] text-gray-400">
                  {activeTab === "bookings" ? filteredBookings.length : filteredUsers.length} total
                </p>
              </div>

              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-[#1976D2] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
