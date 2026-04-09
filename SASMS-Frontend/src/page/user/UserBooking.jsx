import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Package,
  FileText,
  XCircle,
  ChevronRight,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../../component/BottomNav";
import useDarkMode from "../../utils/useDarkMode";
const apiUrl = import.meta.env.VITE_BACKEND_URL;

const STATUS_TABS = ["all", "pending", "assigned", "in_progress", "completed", "cancelled"];

const STATUS_CONFIG = {
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
  assigned: { label: "Assigned", bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-400" },
  in_progress: { label: "In Progress", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
  completed: { label: "Completed", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ── Cancel Confirmation Modal ─────────────────────────── */
function CancelModal({ booking, onConfirm, onClose, loading, darkMode }) {
  const [cancelReason, setCancelReason] = useState("");
  return (
    <AnimatePresence>
      {booking && (
        
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className={`absolute bottom-0 w-full rounded-t-3xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className={`w-10 h-1 rounded-full ${darkMode ? "bg-gray-600" : "bg-gray-200"}`} />
              </div>
            <div className="p-6 pt-2">
              

              {/* Title */}
              <h2 className={`text-base font-bold text-center mb-1 ${darkMode ? "text-white" : "text-slate-800"}`}>
                Cancel Booking?
              </h2>
              <p className="text-xs text-gray-400 text-center mb-5 leading-relaxed">
                This action cannot be undone. Your booking will be permanently cancelled.
              </p>
              
              {/* Reason input */}
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className={`w-full border rounded-xl p-3 text-sm mb-4 outline-none focus:ring-2 focus:ring-red-200 ${darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200"}`}
              />

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className={`flex-1 py-3 rounded-2xl border text-sm font-semibold transition-colors disabled:opacity-50 ${darkMode ? "border-gray-700 text-gray-300 bg-gray-800" : "border-gray-200 text-gray-600 bg-white active:bg-gray-50"}`}
                >
                  Keep Booking
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold active:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <XCircle size={15} />
                      Yes, Cancel
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Booking Card ──────────────────────────────────────── */
function BookingCard({ booking, onCancelClick, darkMode }) {
  const navigate = useNavigate();
  const canCancel = booking.status === "pending";

  return (
    <div
      onClick={() => navigate(`/user/booking/${booking._id}`)}
      className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-sm border overflow-hidden cursor-pointer active:scale-[0.99] transition-transform`}
    >
      {/* Top strip */}
      <div className={`flex items-center gap-3 p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-50"}`}>
        {booking.service?.serviceImage ? (
          <img
            src={booking.service.serviceImage}
            alt={booking.service?.serviceName}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Package size={22} className="text-emerald-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-emerald-600 mb-0.5">{booking.bookingId}</p>
          <p className={`text-sm font-bold truncate ${darkMode ? "text-white" : "text-slate-800"}`}>
            {booking.service?.serviceName || "Service"}
          </p>
          <p className="text-xs text-gray-400 truncate uppercase">{booking.service?.category}</p>
        </div>

        <StatusBadge status={booking.status} />
      </div>

      {/* Details grid */}
      <div className={`px-4 py-3 grid grid-cols-2 gap-y-2 gap-x-4 ${darkMode ? "text-slate-500" : "text-slate-700"} `}>
        <div className="flex items-start gap-2">
          <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Address</p>
            <p className={`text-xs font-medium leading-tight`}>
              {booking.address?.addressLine1}, {booking.address?.city}
            </p>
            <p className="text-[10px] text-gray-400">
              {booking.address?.state} — {booking.address?.pincode}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <User size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Provider</p>
            <p className="text-xs font-medium leading-tight">
              {booking.provider?.name || "Not assigned"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Booked On</p>
            <p className="text-xs font-medium">
              {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Scheduled</p>
            <p className="text-xs font-medium">
              {booking.scheduledDate
                ? new Date(booking.scheduledDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short",
                })
                : "TBD"}
            </p>
          </div>
        </div>

        {booking.providerNote && (
          <div className="col-span-2 flex items-start gap-2">
            <FileText size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Note</p>
              <p className="text-xs italic">{booking.providerNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* Cancel button */}
      {canCancel && (
        <div className="px-4 pb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancelClick(booking);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-semibold bg-red-50 active:bg-red-100 transition-colors"
          >
            <XCircle size={14} />
            Cancel Booking
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function UserBookings() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 5 });
        if (activeTab !== "all") params.append("status", activeTab);

        const res = await axios.get(
          `${apiUrl}/user/booking?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBookings(res.data.data || []);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [activeTab, page, token]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await axios.put(
        `${apiUrl}/user/booking/${cancelTarget._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update status in-place
      setBookings((prev) =>
        prev.map((b) =>
          b._id === cancelTarget._id ? { ...b, status: "cancelled" } : b
        )
      );
      setCancelTarget(null);
    } catch (err) {
      console.error(err);
    }
    setCancelling(false);
  };

  const tabLabel = (t) =>
    t === "in_progress" ? "In Progress" : t.charAt(0).toUpperCase() + t.slice(1);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-slate-50"}`}>

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-5 pt-6 pb-14">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">My Bookings</h1>
            <p className="text-white/60 text-xs mt-1">{total} total bookings</p>
          </div>
          <button
            onClick={() => navigate("/user/booking")}
            className="bg-white/20 border border-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            + New Booking
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="-mt-6 px-4 mb-4">
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-sm border px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar`}>
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === t
                  ? "bg-emerald-600 text-white shadow-sm"
                  : darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              {tabLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-24">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-2xl h-48 animate-pulse ${darkMode ? "bg-gray-800" : "bg-white"}`} />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? "bg-emerald-950/40" : "bg-emerald-50"}`}>
              <Inbox size={28} className="text-emerald-400" />
            </div>
            <p className={`font-semibold text-sm mb-1 ${darkMode ? "text-gray-100" : "text-slate-700"}`}>No bookings found</p>
            <p className="text-gray-400 text-xs mb-5">
              {activeTab === "all"
                ? "You haven't made any bookings yet"
                : `No ${tabLabel(activeTab).toLowerCase()} bookings`}
            </p>
            <button
              onClick={() => navigate("/user/booking")}
              className="bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl"
            >
              Book a Service
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {bookings.map((b) => (
                <BookingCard
                  key={b._id}
                  booking={b}
                  onCancelClick={setCancelTarget}
                  darkMode={darkMode}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center disabled:opacity-40 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
                <span className="text-xs text-gray-500 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center disabled:opacity-40 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelModal
        booking={cancelTarget}
        onConfirm={handleConfirmCancel}
        onClose={() => !cancelling && setCancelTarget(null)}
        loading={cancelling}
        darkMode={darkMode}
      />

      <BottomNav role="user" />
    </div>
  );
}
