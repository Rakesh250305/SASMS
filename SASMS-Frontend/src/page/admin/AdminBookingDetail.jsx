import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Package,
  UserCheck,
  Clock,
  FileText,
  CheckCircle2,
  Phone,
  Mail,
  Check,
  AlertCircle,
  Search,
  X,
  Plus,
  UserPlus,
  BoxSelect,
  Laptop,
  Printer,
  Monitor,
  Wrench,
  Settings,
} from "lucide-react";

/* ─────────────────────────── constants ─────────────── */
const STATUS_FLOW = ["pending", "assigned", "in_progress", "completed"];

const STATUS_CONFIG = {
  pending:     { label: "Pending",     bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400"   },
  assigned:    { label: "Assigned",    bg: "bg-indigo-100",  text: "text-indigo-700",  dot: "bg-indigo-400"  },
  in_progress: { label: "In Progress", bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-400"    },
  completed:   { label: "Completed",   bg: "bg-green-100",   text: "text-green-700",   dot: "bg-green-500"   },
  cancelled:   { label: "Cancelled",   bg: "bg-red-100",     text: "text-red-600",     dot: "bg-red-400"     },
};

const getCategoryStyle = (category) => {
  switch (category) {
    case "laptop":     return { background: "#EFF6FF", color: "#1976D2" };
    case "printer":    return { background: "#F0FDF4", color: "#388E3C" };
    case "television": return { background: "#FFF7ED", color: "#F57C00" };
    case "acUnit":     return { background: "#FFF7ED", color: "#F57C00" };
    case "mobile":     return { background: "#F3E8FF", color: "#7B1FA2" };
    default:           return { background: "#EFF6FF", color: "#1976D2" };
  }
};

const getCategoryIcon = (category) => {
  switch (category) {
    case "laptop":     return Laptop;
    case "printer":    return Printer;
    case "television": return Monitor;
    case "acUnit":     return Wrench;
    case "mobile":     return Phone;
    default:           return Settings;
  }
};
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

function TimelineRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs font-semibold ${highlight ? "text-green-600" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

/* ─────────────────────────── Provider Modal ─────────── */
function ProviderModal({ providers, selected, onConfirm, onClose }) {
  const [query, setQuery] = useState("");
  const [tempSelected, setTempSelected] = useState(selected);

  const filtered = useMemo(() => {
    if (!query.trim()) return providers;
    const q = query.toLowerCase();
    return providers.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q)
    );
  }, [providers, query]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="bg-white w-full max-w-lg  rounded-t-3xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Select Provider</h2>
              <p className="text-xs text-gray-400 mt-0.5">{providers.length} providers available</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
            >
              <X size={15} className="text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="text-sm bg-transparent outline-none flex-1 text-slate-700 placeholder-gray-400"
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X size={13} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Provider list */}
          <div className="overflow-y-auto max-h-72 px-5 py-3 space-y-2">
            {providers.length === 0 ? (
              <div className="text-center py-10">
                <UserCheck size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No providers found</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No results for "{query}"</p>
            ) : (
              filtered.map((p) => {
                const isSelected = tempSelected === p._id;
                return (
                  <div
                    key={p._id}
                    onClick={() => setTempSelected(isSelected ? "" : p._id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#1976D2] bg-blue-50"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-[#1976D2]" : "bg-indigo-100"
                    }`}>
                      <span className={`font-bold text-xs ${isSelected ? "text-white" : "text-indigo-700"}`}>
                        {p.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {p.email && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Mail size={9} />{p.email}
                          </span>
                        )}
                        {p.phone && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                            <Phone size={9} />{p.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Check */}
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-[#1976D2]" : "border-2 border-gray-200"
                    }`}>
                      {isSelected && <Check size={11} className="text-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600"
            >
              Cancel
            </button>
            <button
              disabled={!tempSelected}
              onClick={() => { onConfirm(tempSelected); onClose(); }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#1976D2] text-white text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <UserCheck size={15} />
              Confirm Provider
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────── Asset Modal ────────────── */
function AssetModal({ assets, selected, onConfirm, onClose }) {
  const [query, setQuery] = useState("");
  const [tempSelected, setTempSelected] = useState([...selected]);

  const filtered = useMemo(() => {
    if (!query.trim()) return assets;
    const q = query.toLowerCase();
    return assets.filter(
      (a) =>
        a.assetName?.toLowerCase().includes(q) ||
        a.assetId?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
    );
  }, [assets, query]);

  const toggle = (id) => {
    setTempSelected((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="bg-white w-full max-w-lg rounded-t-3xl overflow-hidden shadow-2xl"
        >

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Select Assets</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {assets.length} available · {tempSelected.length} selected
              </p>
            </div>
            <div className="flex items-center gap-2">
              {tempSelected.length > 0 && (
                <button
                  onClick={() => setTempSelected([])}
                  className="text-xs text-gray-400 font-medium px-2 py-1 rounded-lg hover:bg-gray-100"
                >
                  Clear
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
              >
                <X size={15} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, asset ID, category..."
                className="text-sm bg-transparent outline-none flex-1 text-slate-700 placeholder-gray-400"
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X size={13} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Asset list */}
          <div className="overflow-y-auto max-h-80 px-5 py-3 space-y-2">
            {assets.length === 0 ? (
              <div className="text-center py-10">
                <Package size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No assets available</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No results for "{query}"</p>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((a) => {
                  const isSelected = tempSelected.includes(a._id);
                  const catStyle = getCategoryStyle(a.category);
                  const CatIcon = getCategoryIcon(a.category);
                  return (
                    <div
                      key={a._id}
                      onClick={() => toggle(a._id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#1976D2] bg-blue-50"
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      {/* Category icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={isSelected ? { background: "#1976D2", color: "#fff" } : catStyle}
                      >
                        <CatIcon size={17} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{a.assetName}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-mono text-gray-400">#{a.assetId}</span>
                          {a.category && (
                            <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full capitalize">
                              {a.category}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          ₹{a.cost} · {a.quantity} pcs
                          {a.status && (
                            <span className={`ml-1 font-semibold ${
                              a.status === "available" ? "text-green-600" : "text-amber-600"
                            }`}>
                              · {a.status}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Check circle */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-[#1976D2]" : "border-2 border-gray-200"
                      }`}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(tempSelected); onClose(); }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#1976D2] text-white text-sm font-bold flex items-center justify-center gap-2"
            >
              <BoxSelect size={15} />
              {tempSelected.length > 0
                ? `Add ${tempSelected.length} Asset${tempSelected.length > 1 ? "s" : ""}`
                : "Confirm (none)"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────── Main Page ─────────────── */
export default function AdminBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [providers, setProviders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState(null);

  // modal visibility
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [bRes, pRes, aRes] = await Promise.all([
          axios.get(`http://localhost:5000/admin/booking/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/admin/provider", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/admin/assets", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const b = bRes.data.booking;
        setBooking(b);
        setProviders(pRes.data.data || []);
        setAssets(aRes.data.data || []);

        if (b?.provider) setSelectedProvider(b.provider._id || b.provider);
        if (b?.assets?.length) setSelectedAssets(b.assets.map((a) => a._id || a));
        if (b?.adminNote) setAdminNote(b.adminNote);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [id, token]);

  const handleAssign = async () => {
    if (!selectedProvider) {
      setMsg({ type: "error", text: "Please select a provider first" });
      return;
    }
    setAssigning(true);
    setMsg(null);
    try {
      const res = await axios.put(
        `http://localhost:5000/admin/booking/${id}/assign`,
        { providerId: selectedProvider, assetIds: selectedAssets, adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooking(res.data.booking);
      setMsg({ type: "success", text: "Booking assigned successfully!" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Assignment failed" });
    }
    setAssigning(false);
  };

  // helpers to get objects from IDs
  const selectedProviderObj = providers.find((p) => p._id === selectedProvider);
  const selectedAssetObjs = assets.filter((a) => selectedAssets.includes(a._id));

  if (loading) return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-[#1976D2] rounded-full animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center gap-3">
      <p className="text-gray-500 text-sm">Booking not found</p>
      <button onClick={() => navigate(-1)} className="text-[#1976D2] text-sm font-semibold">Go Back</button>
    </div>
  );

  const canAssign = ["pending", "assigned"].includes(booking.status);
  const isCancelled = booking.status === "cancelled";
  const currentStep = isCancelled ? -1 : STATUS_FLOW.indexOf(booking.status);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#42A5F5] px-5 pt-6 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <button
          onClick={() => navigate("/admin/serviceRequest")}
          className="flex items-center gap-1.5 text-white/80 text-sm mb-4"
        >
          <ChevronLeft size={18} />
          All Bookings
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs font-mono mb-1">{booking.bookingId}</p>
            <h1 className="text-xl font-bold text-white">{booking.service?.serviceName || "Booking Detail"}</h1>
            <p className="text-white/60 text-xs mt-1">{booking.service?.category}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="mt-2 px-4 pb-24 space-y-3 max-w-2xl mx-auto">

        {/* Progress */}
        {!isCancelled ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Progress</p>
            <div className="flex items-start">
              {STATUS_FLOW.map((s, i) => (
                <div key={s} className="flex-1 flex flex-col items-center relative">
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`absolute top-3 left-1/2 w-full h-0.5 ${i < currentStep ? "bg-blue-500" : "bg-gray-200"}`} />
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                    i < currentStep ? "bg-blue-500" : i === currentStep ? "bg-[#1976D2] ring-4 ring-blue-100" : "bg-gray-200"
                  }`}>
                    {i < currentStep ? <CheckCircle2 size={14} className="text-white" /> :
                     i === currentStep ? <div className="w-2 h-2 rounded-full bg-white" /> : null}
                  </div>
                  <span className={`text-[9px] mt-1.5 font-semibold text-center leading-tight ${i <= currentStep ? "text-[#1976D2]" : "text-gray-400"}`}>
                    {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 rounded-2xl border border-red-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-700">Booking Cancelled</p>
              <p className="text-xs text-red-400">This booking has been cancelled by the customer</p>
            </div>
          </div>
        )}

        {/* Customer */}
        <Section title="Customer">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-700 font-bold text-sm">
                {booking.user?.name?.split(" ").map(w => w[0]).join("").toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">{booking.user?.name}</p>
              {booking.user?.email && (
                <div className="flex items-center gap-1 mt-0.5"><Mail size={11} className="text-gray-400" /><p className="text-xs text-gray-500">{booking.user.email}</p></div>
              )}
              {booking.user?.phone && (
                <div className="flex items-center gap-1 mt-0.5"><Phone size={11} className="text-gray-400" /><p className="text-xs text-gray-500">{booking.user.phone}</p></div>
              )}
            </div>
          </div>
        </Section>

        {/* Service */}
        <Section title="Service">
          <div className="flex items-center gap-3">
            {booking.service?.serviceImage ? (
              <img src={`http://localhost:5000${booking.service.serviceImage}`} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Package size={22} className="text-blue-400" />
              </div>
            )}
            <div className="flex justify-between w-full">
              <div>
                <p className="text-sm font-bold text-slate-800">{booking.service?.serviceName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{booking.service?.category}</p>
                {booking.service?.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{booking.service.description}</p>}
              </div>
              {booking.service?.estimatedPrice && (
                <p className="text-sm font-bold text-[#1976D2] flex-shrink-0 ml-2">₹{booking.service.estimatedPrice}</p>
              )}
            </div>
          </div>
        </Section>

        {/* Address */}
        <Section title="Service Address">
          <div className="flex items-start gap-2">
            <MapPin size={15} className="text-[#1976D2] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">{booking.address?.fullName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{booking.address?.phone}</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {booking.address?.addressLine1}{booking.address?.addressLine2 && `, ${booking.address.addressLine2}`}
              </p>
              <p className="text-xs text-gray-400">{booking.address?.city}, {booking.address?.state} — {booking.address?.pincode}</p>
            </div>
          </div>
        </Section>

        {/* Timeline */}
        <Section title="Timeline">
          <TimelineRow label="Booked on" value={new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
          {booking.scheduledDate && <TimelineRow label="Scheduled" value={new Date(booking.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />}
          {booking.assignedAt && <TimelineRow label="Assigned at" value={new Date(booking.assignedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />}
          {booking.startedAt && <TimelineRow label="Started at" value={new Date(booking.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />}
          {booking.completedAt && <TimelineRow label="Completed at" value={new Date(booking.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} highlight />}
        </Section>

        {booking.providerNote && (
          <Section title="Customer Note">
            <div className="flex items-start gap-2">
              <FileText size={14} className="text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600 italic">{booking.providerNote}</p>
            </div>
          </Section>
        )}

        {!canAssign && booking.assets?.length > 0 && (
          <Section title="Assets Assigned">
            <div className="space-y-2">
              {booking.assets.map((a) => {
                const catStyle = getCategoryStyle(a.category);
                const CatIcon = getCategoryIcon(a.category);
                return (
                  <div key={a._id} className="flex items-center gap-3 py-1.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={catStyle}
                    >
                      <CatIcon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 font-semibold">{a.assetName}</p>
                      <p className="text-[10px] text-gray-400">
                        #{a.assetId}
                        {a.category && <span className="ml-1 capitalize">· {a.category}</span>}
                        {a.cost && <span className="ml-1">· ₹{a.cost}</span>}
                      </p>
                    </div>
                    {a.status && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        a.status === "available" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {a.status}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── ASSIGN PANEL ─────────────────────────── */}
        {canAssign && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {booking.status === "assigned" ? "Re-assign Task" : "Assign Task"}
            </p>

            {/* Status message */}
            {msg && (
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                msg.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
              }`}>
                {msg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {msg.text}
              </div>
            )}

            {/* Provider selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-700">Provider <span className="text-red-400">*</span></p>
                {selectedProviderObj && (
                  <button onClick={() => setSelectedProvider("")} className="text-[10px] text-gray-400 font-medium">Remove</button>
                )}
              </div>

              {selectedProviderObj ? (
                /* Selected provider card */
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-[#1976D2] rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-[#1976D2] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">
                      {selectedProviderObj.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{selectedProviderObj.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {selectedProviderObj.email && <span className="flex items-center gap-1 text-[10px] text-gray-500"><Mail size={9} />{selectedProviderObj.email}</span>}
                      {selectedProviderObj.phone && <span className="flex items-center gap-1 text-[10px] text-gray-500 flex-shrink-0"><Phone size={9} />{selectedProviderObj.phone}</span>}
                    </div>
                  </div>
                  <CheckCircle2 size={18} className="text-[#1976D2] flex-shrink-0" />
                </div>
              ) : (
                /* Add provider button */
                <button
                  onClick={() => setShowProviderModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:border-[#1976D2] hover:text-[#1976D2] transition-colors"
                >
                  <UserPlus size={16} />
                  Select Provider
                </button>
              )}

              {selectedProviderObj && (
                <button
                  onClick={() => setShowProviderModal(true)}
                  className="w-full mt-2 text-xs text-[#1976D2] font-semibold text-center py-1.5"
                >
                  Change Provider
                </button>
              )}
            </div>

            <div className="border-t border-gray-100" />

            {/* Asset selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-700">
                  Assets <span className="text-gray-400 font-normal">(optional)</span>
                </p>
                {selectedAssetObjs.length > 0 && (
                  <button onClick={() => setSelectedAssets([])} className="text-[10px] text-gray-400 font-medium">Clear all</button>
                )}
              </div>

              {/* Selected assets chips */}
              {selectedAssetObjs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedAssetObjs.map((a) => (
                    <span key={a._id} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-[#1976D2] text-xs font-semibold px-2.5 py-1.5 rounded-xl">
                      <Package size={11} />
                      {a.assetName}
                      <button onClick={() => setSelectedAssets(prev => prev.filter(id => id !== a._id))}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowAssetModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:border-[#1976D2] hover:text-[#1976D2] transition-colors"
              >
                <Plus size={16} />
                {selectedAssetObjs.length > 0 ? `${selectedAssetObjs.length} Selected — Edit` : "Add Assets"}
              </button>
            </div>

            <div className="border-t border-gray-100" />

            {/* Admin note */}
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">
                Admin Note <span className="text-gray-400 font-normal">(optional)</span>
              </p>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Instructions or special notes for the provider..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-slate-700 bg-gray-50 outline-none focus:border-[#1976D2] focus:ring-2 focus:ring-blue-100 resize-none placeholder-gray-300"
              />
            </div>

            {/* Assign button */}
            <button
              onClick={handleAssign}
              disabled={assigning || !selectedProvider}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#1976D2] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              {assigning ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserCheck size={16} />
                  {booking.status === "assigned" ? "Re-assign" : "Assign Provider"}
                  {selectedAssets.length > 0 && ` + ${selectedAssets.length} asset${selectedAssets.length > 1 ? "s" : ""}`}
                </>
              )}
            </button>
          </div>
        )}

        {/* Assigned provider read-only */}
        {!canAssign && booking.provider && (
          <Section title="Assigned Provider">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-700 font-bold text-sm">
                  {booking.provider.name?.split(" ").map(w => w[0]).join("").toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{booking.provider.name}</p>
                {booking.provider.email && (
                  <div className="flex items-center gap-1 mt-0.5"><Mail size={11} className="text-gray-400" /><p className="text-xs text-gray-500">{booking.provider.email}</p></div>
                )}
                {booking.provider.phone && (
                  <div className="flex items-center gap-1 mt-0.5"><Phone size={11} className="text-gray-400" /><p className="text-xs text-gray-500">{booking.provider.phone}</p></div>
                )}
              </div>
            </div>
            {booking.adminNote && (
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-start gap-2">
                <FileText size={13} className="text-gray-400 mt-0.5" />
                <p className="text-xs text-gray-600 italic">{booking.adminNote}</p>
              </div>
            )}
          </Section>
        )}
      </div>

      {/* Provider Modal */}
      {showProviderModal && (
        <ProviderModal
          providers={providers}
          selected={selectedProvider}
          onConfirm={(id) => setSelectedProvider(id)}
          onClose={() => setShowProviderModal(false)}
        />
      )}

      {/* Asset Modal */}
      {showAssetModal && (
        <AssetModal
          assets={assets}
          selected={selectedAssets}
          onConfirm={(ids) => setSelectedAssets(ids)}
          onClose={() => setShowAssetModal(false)}
        />
      )}
    </div>
  );
}