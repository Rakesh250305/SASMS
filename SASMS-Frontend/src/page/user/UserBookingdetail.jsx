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
  Download,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";
import useDarkMode from "../../utils/useDarkMode";

const PROVIDER_WORKING_CHARGE = 50;

const STATUS_LABEL = {
  pending: "Pending",
  assigned: "Assigned",
  accepted: "Accepted",
  picked_up: "Assets Picked",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_CONFIG = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
  assigned: { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-400" },
  accepted: { bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-400" },
  picked_up: { bg: "bg-cyan-100", text: "text-cyan-700", dot: "bg-cyan-400" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
};

const getStatusFlow = (hasAssignedAssets) =>
  hasAssignedAssets
    ? ["pending", "assigned", "accepted", "picked_up", "in_progress", "completed"]
    : ["pending", "assigned", "accepted", "in_progress", "completed"];

const getFinalizedCostSummary = (booking) => {
  const serviceCost = Number(booking?.costSummary?.serviceCost ?? booking?.service?.estimatedPrice ?? 0);
  const usedAssetsCost = Number(booking?.costSummary?.usedAssetsCost ?? 0);
  const additionalAssetsCost = Number(booking?.costSummary?.additionalAssetsCost ?? 0);
  const providerCharge = Number(
    booking?.costSummary?.providerCharge ?? (booking?.provider ? PROVIDER_WORKING_CHARGE : 0)
  );

  return {
    serviceCost,
    usedAssetsCost,
    additionalAssetsCost,
    providerCharge,
    totalCost: Number(
      booking?.costSummary?.totalCost ??
        serviceCost + usedAssetsCost + additionalAssetsCost + providerCharge
    ),
  };
};

function StatusBadge({ status, darkMode = false }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
        darkMode ? "bg-slate-800/90 text-slate-100 border border-slate-700/80" : `${cfg.bg} ${cfg.text}`
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function Section({ title, children, darkMode = false }) {
  return (
    <div
      className={`rounded-2xl p-4 mt-3 border ${
        darkMode
          ? "bg-slate-900/95 border-slate-800 shadow-[0_18px_40px_rgba(2,6,23,0.35)]"
          : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
        {title}
      </p>
      {children}
    </div>
  );
}

export default function UserBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const { darkMode } = useDarkMode();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${apiUrl}/user/booking/${id}`,
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
  }, [apiUrl, id, token]);

  //  Guard 1 — still fetching
  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className={`w-8 h-8 border-4 rounded-full animate-spin ${darkMode ? "border-emerald-900 border-t-emerald-400" : "border-emerald-200 border-t-emerald-600"}`} />
    </div>
  );

  //  Guard 2 — fetch done but nothing returned
  if (!booking) return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-3 ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Booking not found</p>
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
  const isCompleted = booking.status === "completed";
  const hasAssignedAssets = Array.isArray(booking.assets) && booking.assets.length > 0;
  const statusFlow = getStatusFlow(hasAssignedAssets);
  const workflowStatus = booking.status;
  const currentStep = isCancelled ? -1 : statusFlow.indexOf(workflowStatus);
  const finalizedCostSummary = getFinalizedCostSummary(booking);
  const showAssetCharges = isCompleted && Boolean(booking.costSummary);
  const usedAssignedAssets = booking.usedAssignedAssets || [];
  const additionalAssetsUsed = booking.additionalAssetsUsed || [];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>

      {/* Header */}
      <div className={`px-5 pt-6 pb-14  bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900`}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/80 text-sm mb-4"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        <div className="flex items-start justify-between uppercase">
          <div>
            <p className="text-white/60 text-xs font-mono mb-1">{booking.bookingId}</p>
            <h1 className="text-xl font-bold text-white normal-case">
              {booking.service?.serviceName || "Booking Detail"}
            </h1>
            <p className="text-white/60 text-xs mt-1">{booking.service?.category}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={booking.status} darkMode={darkMode} />
            <button
              type="button"
              onClick={()=> window.print()}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                darkMode
                  ? "bg-slate-900/75 text-emerald-100 border-emerald-900/60"
                  : "bg-white/15 text-white border-white/20"
              }`}
            >
              <Download size={12} />
              Download
            </button>
          </div>
        </div>
      </div>

      <div id="print-section" className="-mt-6 px-4 pb-24 max-w-xl mx-auto">

        {/* Progress tracker */}
        {!isCancelled ? (
          <div className={`rounded-2xl p-4 border ${
            darkMode
              ? "bg-slate-900/95 border-slate-800 shadow-[0_18px_40px_rgba(2,6,23,0.35)]"
              : "bg-white border-gray-100 shadow-sm"
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
              Booking Progress
            </p>

            <div className="flex items-start">
              {statusFlow.map((s, i) => (
                <div key={s} className="flex-1 flex flex-col items-center relative">

                  {/* Connector line */}
                  {i < statusFlow.length - 1 && (
                    <div className={`absolute top-3 left-1/2 w-full h-0.5 ${i < currentStep ? "bg-emerald-500" : darkMode ? "bg-slate-700" : "bg-gray-200"}`} />
                  )}

                  {/* Dot */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${i < currentStep
                      ? "bg-emerald-500"
                      : i === currentStep
                        ? darkMode
                          ? "bg-emerald-500 ring-4 ring-emerald-950"
                          : "bg-emerald-600 ring-4 ring-emerald-100"
                        : darkMode
                          ? "bg-slate-700"
                          : "bg-gray-200"
                    }`}>
                    {i < currentStep
                      ? <CheckCircle2 size={14} className="text-white" />
                      : i === currentStep
                        ? <div className="w-2 h-2 rounded-full bg-white" />
                        : <Circle size={14} className={darkMode ? "text-slate-500" : "text-gray-300"} />
                    }
                  </div>

                  <span className={`text-[9px] mt-1.5 font-semibold text-center leading-tight ${i <= currentStep ? "text-emerald-600" : darkMode ? "text-slate-500" : "text-gray-400"
                    }`}>
                    {STATUS_LABEL[s]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`rounded-2xl border p-4 flex items-center gap-3 ${darkMode ? "bg-red-950/40 border-red-900/60" : "bg-red-50 border-red-100"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-red-900/50" : "bg-red-100"}`}>
              <Package size={18} className="text-red-400" />
            </div>
            <div>
              <p className={`text-sm font-bold ${darkMode ? "text-red-200" : "text-red-700"}`}>Booking Cancelled</p>
              <p className={`text-xs ${darkMode ? "text-red-300/80" : "text-red-400"}`}>This booking has been cancelled</p>
            </div>
          </div>
        )}

        {/* Service */}
        <Section title="Service Details" darkMode={darkMode}>
          <div className="flex items-center gap-3">
            {booking.service?.serviceImage ? (
              <img
                src={booking.service.serviceImage}
                alt={booking.service.serviceName}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-emerald-950/50" : "bg-emerald-50"}`}>
                <Package size={22} className="text-emerald-400" />
              </div>
            )}
            <div className="flex justify-between w-full items-start">
              <div>
                <p className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{booking.service?.serviceName}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-gray-400"}`}>{booking.service?.category}</p>
              </div>
              {booking.service?.estimatedPrice && (
                <p className="text-sm font-bold text-emerald-600 mt-1">
                  Rs.{booking.service.estimatedPrice}
                </p>
              )}
            </div>
          </div>
          {booking.service?.description && (
            <p className={`text-xs mt-3 leading-relaxed pt-3 border-t ${darkMode ? "text-slate-300 border-slate-800" : "text-gray-500 border-gray-50"}`}>
              {booking.service.description}
            </p>
          )}
        </Section>

        {/* Address */}
        <Section title="User Address" darkMode={darkMode}>
          <div className="flex items-start gap-2">
            <MapPin size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{booking.address?.fullName}</p>
              <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{booking.address?.phone}</p>
              <p className={`text-xs mt-1 leading-relaxed ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
                {booking.address?.addressLine1}
                {booking.address?.addressLine2 && `, ${booking.address.addressLine2}`}
              </p>
              <p className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                {booking.address?.city}, {booking.address?.state} - {booking.address?.pincode}
              </p>
            </div>
          </div>
        </Section>

        {/* Provider */}
        <Section title="Assigned Provider" darkMode={darkMode}>
          {booking.provider ? (
            <div className="flex items-center gap-3">
               <div className={`w-12 h-12 rounded-2xl overflow-hidden flex flex-shrink-0 items-center justify-center ${darkMode ? "bg-indigo-950/60" : "bg-indigo-100"}`}>
              {booking?.provider.profilePhoto
                ? <img src={booking.provider.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                : <span className={`${darkMode ? "text-indigo-200" : "text-indigo-600"} font-bold text-sm`}>{booking.provider.name?.split(" ").map(w => w[0]).join("").toUpperCase()}</span>
              }
              </div>
              <div className="flex  justify-between w-full">
                <div className="flex-1">
                  <p className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{booking.provider.name}</p>
                  {booking.provider.phone && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone size={11} className={darkMode ? "text-slate-500" : "text-gray-400"} />
                      <p className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{booking.provider.phone}</p>
                    </div>
                  )}
                  {booking.provider.email && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail size={11} className={darkMode ? "text-slate-500" : "text-gray-400"} />
                      <p className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{booking.provider.email}</p>
                    </div>
                  )}
                </div>
                {booking.provider?.phone && (
                  <a
                    href={`tel:${booking.provider.phone}`}
                    className={`flex items-center h-[4vh] gap-1.5 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 ${
                      darkMode ? "bg-emerald-950/60 text-emerald-300 border border-emerald-900/60" : "bg-green-50 text-green-700"
                    }`}
                  >
                    <Phone size={12} />
                    Call Provider
                  </a>
                )}

              </div>
            </div>
          ) : (
            <div className={`flex items-center gap-2 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
              <User size={16} />
              <p className="text-sm">Not yet assigned</p>
            </div>
          )}
        </Section>

        {/* Dates */}
        <Section title="Timeline" darkMode={darkMode}>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                <Calendar size={13} />
                <span className="text-xs">Booked on</span>
              </div>
              <span className={`text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </div>

            {booking.scheduledDate && (
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  <Clock size={13} />
                  <span className="text-xs">Scheduled for</span>
                </div>
                <span className={`text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                  {new Date(booking.scheduledDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            )}

            {booking.assignedAt && (
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  <User size={13} />
                  <span className="text-xs">Assigned at</span>
                </div>
                <span className={`text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                  {new Date(booking.assignedAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short",
                  })}
                </span>
              </div>
            )}

            {booking.providerAcceptedAt && (
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  <CheckCircle2 size={13} />
                  <span className="text-xs">Accepted at</span>
                </div>
                <span className={`text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                  {new Date(booking.providerAcceptedAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short",
                  })}
                </span>
              </div>
            )}

            {hasAssignedAssets && booking.assetsPickedUpAt && (
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  <Package size={13} />
                  <span className="text-xs">Assets picked up</span>
                </div>
                <span className={`text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                  {new Date(booking.assetsPickedUpAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short",
                  })}
                </span>
              </div>
            )}

            {booking.startedAt && (
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  <Clock size={13} />
                  <span className="text-xs">Started at</span>
                </div>
                <span className={`text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
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
          <Section title="Assigned Assets" darkMode={darkMode}>
            <div className="space-y-2">
              {booking.assets.map((a) => (
                <div key={a._id} className={`flex items-center justify-between gap-3 rounded-xl px-2 py-2 ${darkMode ? "bg-slate-950/70" : ""}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Package size={13} className={darkMode ? "text-slate-500" : "text-gray-400"} />
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{a.assetName}</p>
                      {a.category && (
                        <p className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{a.category}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-mono ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{a.assetId}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="Cost Summary" darkMode={darkMode}>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Service Cost</span>
              <span className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>Rs.{finalizedCostSummary.serviceCost}</span>
            </div>
            {showAssetCharges && usedAssignedAssets.length > 0 && (
              <div className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Used Assigned Assets
                  <span className={`ml-1 text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>({usedAssignedAssets.length} used)</span>
                </span>
                <span className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>Rs.{finalizedCostSummary.usedAssetsCost}</span>
              </div>
            )}
            {showAssetCharges && additionalAssetsUsed.length > 0 && (
              <div className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Additional Assets
                  <span className={`ml-1 text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>({additionalAssetsUsed.length} added)</span>
                </span>
                <span className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>Rs.{finalizedCostSummary.additionalAssetsCost}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Provider Working Charge</span>
              <span className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>Rs.{finalizedCostSummary.providerCharge}</span>
            </div>
            {!showAssetCharges && (
              <p className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                Asset charges are finalized when the provider completes the service.
              </p>
            )}
            <div className={`pt-3 mt-1 border-t flex items-center justify-between ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
              <span className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Total Amount</span>
              <span className="text-base font-extrabold text-emerald-600">Rs.{finalizedCostSummary.totalCost}</span>
            </div>
          </div>
        </Section>

        {isCompleted && usedAssignedAssets.length > 0 && (
          <Section title="Used Assigned Assets" darkMode={darkMode}>
            <div className="space-y-2">
              {usedAssignedAssets.map((asset, index) => (
                <div key={`${asset.assetId || asset.assetName}-${index}`} className={`flex items-center justify-between gap-3 rounded-xl px-2 py-2 ${darkMode ? "bg-slate-950/70" : ""}`}>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{asset.assetName}</p>
                    <p className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                      {asset.assetId ? `#${asset.assetId}` : "Assigned asset"}{asset.category ? ` - ${asset.category}` : ""}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-emerald-600">Rs.{Number(asset.cost || 0)}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {isCompleted && additionalAssetsUsed.length > 0 && (
          <Section title="Additional Assets Used" darkMode={darkMode}>
            <div className="space-y-2">
              {additionalAssetsUsed.map((asset, index) => (
                <div key={`${asset.name}-${index}`} className={`flex items-center justify-between gap-3 rounded-xl px-2 py-2 ${darkMode ? "bg-slate-950/70" : ""}`}>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{asset.name}</p>
                    {asset.note && <p className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{asset.note}</p>}
                  </div>
                  <p className="text-xs font-semibold text-emerald-600">Rs.{Number(asset.cost || 0)}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

      </div>

      <BottomNav role="user" />
    </div>
  );
}
