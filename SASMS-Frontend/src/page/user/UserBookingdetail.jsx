import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  User,
  Package,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Phone,
  Mail,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";

// ✅ underscore, matches your DB schema exactly
const STATUS_FLOW = ["pending", "assigned", "in_progress", "completed"];

const STATUS_LABEL = {
  pending:     "Pending",
  assigned:    "Assigned",
  in_progress: "In Progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
};

const STATUS_CONFIG = {
  pending:     { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400"   },
  assigned:    { bg: "bg-indigo-100",  text: "text-indigo-700",  dot: "bg-indigo-400"  },
  in_progress: { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-400"    },
  completed:   { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled:   { bg: "bg-red-100",     text: "text-red-600",     dot: "bg-red-400"     },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-3">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

export default function UserBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);  
  const [loading, setLoading] = useState(true); 

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/user/booking/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBooking(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, token]);

  //  Guard 1 — still fetching
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );

  //  Guard 2 — fetch done but nothing returned
  if (!booking) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
      <p className="text-gray-500 text-sm">Booking not found</p>
      <button
        onClick={() => navigate(-1)}
        className="text-emerald-600 text-sm font-semibold"
      >
        Go Back
      </button>
    </div>
  );

  // ✅ Safe — booking is guaranteed non-null below this line
  const isCancelled = booking.status === "cancelled";
  const currentStep = isCancelled ? -1 : STATUS_FLOW.indexOf(booking.status);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-5 pt-6 pb-14">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/80 text-sm mb-4"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs font-mono mb-1">{booking.bookingId}</p>
            <h1 className="text-xl font-bold text-white">
              {booking.service?.serviceName || "Booking Detail"}
            </h1>
            <p className="text-white/60 text-xs mt-1">{booking.service?.category}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="-mt-6 px-4 pb-24 max-w-xl mx-auto">

        {/* Progress tracker */}
        {!isCancelled ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Booking Progress
            </p>

            <div className="flex items-start">
              {STATUS_FLOW.map((s, i) => (
                <div key={s} className="flex-1 flex flex-col items-center relative">

                  {/* Connector line */}
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`absolute top-3 left-1/2 w-full h-0.5 ${i < currentStep ? "bg-emerald-500" : "bg-gray-200"}`} />
                  )}

                  {/* Dot */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                    i < currentStep
                      ? "bg-emerald-500"
                      : i === currentStep
                      ? "bg-emerald-600 ring-4 ring-emerald-100"
                      : "bg-gray-200"
                  }`}>
                    {i < currentStep
                      ? <CheckCircle2 size={14} className="text-white" />
                      : i === currentStep
                      ? <div className="w-2 h-2 rounded-full bg-white" />
                      : <Circle size={14} className="text-gray-300" />
                    }
                  </div>

                  <span className={`text-[9px] mt-1.5 font-semibold text-center leading-tight ${
                    i <= currentStep ? "text-emerald-600" : "text-gray-400"
                  }`}>
                    {STATUS_LABEL[s]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 rounded-2xl border border-red-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <Package size={18} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-700">Booking Cancelled</p>
              <p className="text-xs text-red-400">This booking has been cancelled</p>
            </div>
          </div>
        )}

        {/* Service */}
        <Section title="Service">
          <div className="flex items-center gap-3">
            {booking.service?.serviceImage ? (
              <img
                src={`http://localhost:5000${booking.service.serviceImage}`}
                alt={booking.service.serviceName}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Package size={22} className="text-emerald-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-800">{booking.service?.serviceName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{booking.service?.category}</p>
              {booking.service?.estimatedPrice && (
                <p className="text-sm font-bold text-emerald-600 mt-1">
                  ₹{booking.service.estimatedPrice}
                </p>
              )}
            </div>
          </div>
          {booking.service?.description && (
            <p className="text-xs text-gray-500 mt-3 leading-relaxed border-t border-gray-50 pt-3">
              {booking.service.description}
            </p>
          )}
        </Section>

        {/* Address */}
        <Section title="Service Address">
          <div className="flex items-start gap-2">
            <MapPin size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">{booking.address?.fullName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{booking.address?.phone}</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {booking.address?.addressLine1}
                {booking.address?.addressLine2 && `, ${booking.address.addressLine2}`}
              </p>
              <p className="text-xs text-gray-400">
                {booking.address?.city}, {booking.address?.state} — {booking.address?.pincode}
              </p>
            </div>
          </div>
        </Section>

        {/* Provider */}
        <Section title="Assigned Provider">
          {booking.provider ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold text-sm">
                  {booking.provider.name?.split(" ").map(w => w[0]).join("").toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{booking.provider.name}</p>
                {booking.provider.phone && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone size={11} className="text-gray-400" />
                    <p className="text-xs text-gray-500">{booking.provider.phone}</p>
                  </div>
                )}
                {booking.provider.email && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail size={11} className="text-gray-400" />
                    <p className="text-xs text-gray-500">{booking.provider.email}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <User size={16} />
              <p className="text-sm">Not yet assigned</p>
            </div>
          )}
        </Section>

        {/* Dates */}
        <Section title="Timeline">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar size={13} />
                <span className="text-xs">Booked on</span>
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </div>

            {booking.scheduledDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={13} />
                  <span className="text-xs">Scheduled for</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {new Date(booking.scheduledDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            )}

            {booking.assignedAt && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <User size={13} />
                  <span className="text-xs">Assigned at</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {new Date(booking.assignedAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short",
                  })}
                </span>
              </div>
            )}

            {booking.startedAt && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={13} />
                  <span className="text-xs">Started at</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {new Date(booking.startedAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short",
                  })}
                </span>
              </div>
            )}

            {booking.completedAt && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span className="text-xs">Completed at</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600">
                  {new Date(booking.completedAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short",
                  })}
                </span>
              </div>
            )}
          </div>
        </Section>

        {/* Assets */}
        {booking.assets?.length > 0 && (
          <Section title="Assets">
            <div className="space-y-2">
              {booking.assets.map((a) => (
                <div key={a._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={13} className="text-gray-400" />
                    <span className="text-sm text-slate-700 font-medium">{a.name}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-400">{a.assetId}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Notes */}
        {booking.providerNote && (
          <Section title="Provider Notes">
            <div className="flex items-start gap-2">
              <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 italic leading-relaxed">{booking.providerNote}</p>
            </div>
          </Section>
        )}

        {/* Admin note */}
        {booking.adminNote && (
          <Section title="Admin Note">
            <div className="flex items-start gap-2">
              <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 italic leading-relaxed">{booking.adminNote}</p>
            </div>
          </Section>
        )}

      </div>

      <BottomNav role="user" />
    </div>
  );
}