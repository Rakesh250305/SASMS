import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  FileText,
  CheckCircle2,
  Phone,
  Mail,
  AlertCircle,
  Wrench,
  Laptop,
  Printer,
  Monitor,
  Settings,
  Tag,
  CheckCheck,
  Truck,
  XCircle,
  IndianRupee,
  Navigation,
  PhoneCall,
  Wallet,
} from "lucide-react";
import useDarkMode from "../../utils/useDarkMode";

const STATUS_CONFIG = {
  assigned: { label: "Assigned", bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-400" },
  accepted: { label: "Accepted", bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-400" },
  picked_up: { label: "Picked Up", bg: "bg-cyan-100", text: "text-cyan-700", dot: "bg-cyan-400" },
  in_progress: { label: "In Progress", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
};

const PROVIDER_WORKING_CHARGE = 50;
const WORKFLOW = [
  { key: "assigned", label: "Assigned", icon: Tag },
  { key: "accepted", label: "Accepted", icon: CheckCircle2 },
  { key: "picked_up", label: "Assets Picked", icon: Truck },
  { key: "in_progress", label: "In Progress", icon: Wrench },
  { key: "completed", label: "Completed", icon: CheckCheck },
];

const getWorkflow = (hasAssignedAssets) =>
  hasAssignedAssets
    ? WORKFLOW
    : WORKFLOW.filter((step) => step.key !== "picked_up");

const getWorkflowStep = (task, hasAssignedAssets) => {
  if (!task) return 0;
  const workflow = getWorkflow(hasAssignedAssets);
  return Math.max(workflow.findIndex((step) => step.key === task.status), 0);
};

const getCategoryStyle = (category, darkMode) => {
  if (darkMode) return { background: "#0f172a", color: "#c084fc" };
  switch (category) {
    case "laptop": return { background: "#EFF6FF", color: "#1976D2" };
    case "printer": return { background: "#F0FDF4", color: "#388E3C" };
    case "television": return { background: "#FFF7ED", color: "#F57C00" };
    case "acUnit": return { background: "#FFF7ED", color: "#F57C00" };
    case "mobile": return { background: "#F3E8FF", color: "#7B1FA2" };
    default: return { background: "#F5F3FF", color: "#7C3AED" };
  }
};

const getCategoryIcon = (category) => {
  switch (category) {
    case "laptop": return Laptop;
    case "printer": return Printer;
    case "television": return Monitor;
    case "acUnit": return Wrench;
    case "mobile": return Phone;
    default: return Settings;
  }
};

function StatusBadge({ status, darkMode }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.assigned;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? "bg-slate-950 text-slate-100 border border-slate-800" : `${cfg.bg} ${cfg.text}`}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Section({ title, children, darkMode }) {
  return (
    <div className={`rounded-2xl shadow-sm border p-4 ${darkMode ? "bg-slate-900 border-slate-800 shadow-[0_18px_40px_rgba(2,6,23,0.28)]" : "bg-white border-gray-100"}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{title}</p>
      {children}
    </div>
  );
}

function TimelineRow({ label, value, highlight, darkMode }) {
  return (
    <div className={`flex items-center justify-between py-2 border-b last:border-0 ${darkMode ? "border-slate-800" : "border-gray-50"}`}>
      <span className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{label}</span>
      <span className={`text-xs font-semibold ${highlight ? "text-green-600" : darkMode ? "text-slate-200" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

function CostRow({ label, value, sub, bold, accent, darkMode }) {
  return (
    <div className={`flex items-center justify-between py-2 border-b last:border-0 ${bold ? darkMode ? "pt-3 border-t border-slate-800" : "pt-3 border-t border-gray-100" : darkMode ? "border-slate-800" : "border-gray-50"}`}>
      <div>
        <span className={`text-sm ${bold ? darkMode ? "font-bold text-slate-100" : "font-bold text-slate-800" : darkMode ? "text-slate-400" : "text-gray-500"}`}>{label}</span>
        {sub && <p className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{sub}</p>}
      </div>
      <span className={`text-sm font-bold flex items-center gap-0.5 ${accent ? "text-purple-600 text-base" : darkMode ? "text-slate-200" : "text-slate-700"}`}>
        <IndianRupee size={accent ? 14 : 12} />
        {value}
      </span>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onClose, loading, darkMode }) {
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(event) => event.target === event.currentTarget && onClose()}>
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", damping: 26, stiffness: 300 }} className={`w-full max-w-sm rounded-t-3xl overflow-hidden shadow-2xl ${darkMode ? "bg-slate-950 border-t border-slate-800" : "bg-white"}`}>
          <div className={`w-10 h-1 rounded-full mx-auto mt-3 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`} />
          <div className="p-6">
            <h2 className={`text-base font-bold text-center mb-1 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{title}</h2>
            <p className={`text-xs text-center mb-6 leading-relaxed ${darkMode ? "text-slate-400" : "text-gray-400"}`}>{message}</p>
            <div className="flex gap-3">
              <button onClick={onClose} disabled={loading} className={`flex-1 py-3 rounded-2xl border text-sm font-semibold disabled:opacity-50 ${darkMode ? "border-slate-800 text-slate-300 bg-slate-900" : "border-gray-200 text-gray-600"}`}>Cancel</button>
              <button onClick={onConfirm} disabled={loading} className={`flex-1 py-3 rounded-2xl text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 ${confirmColor === "purple" ? "bg-gradient-to-br from-[#86198f] to-[#c026d3]" : confirmColor === "green" ? "bg-green-600" : "bg-red-500"}`}>
                {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : confirmLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ProviderTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [msg, setMsg] = useState(null);
  const [workflowStep, setWorkflowStep] = useState(0);

  const token = localStorage.getItem("token");

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/provider/booking/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const booking = res.data.booking || res.data.data;
      const hasAssignedAssets = Array.isArray(booking?.assets) && booking.assets.length > 0;
      setTask(booking);
      setWorkflowStep(getWorkflowStep(booking, hasAssignedAssets));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [apiUrl, id, token]);

  const updateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      const res = await axios.put(`${apiUrl}/provider/booking/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      const updated = res.data.booking || res.data.data;
      const nextTask = updated || { ...task, status: newStatus };
      const hasAssignedAssets = Array.isArray(nextTask?.assets) && nextTask.assets.length > 0;
      setTask(updated || { ...task, status: newStatus });
      setWorkflowStep(getWorkflowStep(nextTask, hasAssignedAssets));
      setMsg({ type: "success", text: `Status updated to ${newStatus.replace("_", " ")}` });
    } catch (error) {
      setMsg({ type: "error", text: error.response?.data?.message || "Update failed" });
    } finally {
      await fetchTask();
      setActionLoading(false);
      setModal(null);
    }
  };

  const serviceCost = Number(task?.service?.estimatedPrice || 0);
  const assetsCost = (task?.assets || []).reduce((sum, asset) => sum + Number(asset.cost || 0), 0);
  const providerCharge = task ? PROVIDER_WORKING_CHARGE : 0;
  const totalCost = serviceCost + assetsCost + providerCharge;
  const mapsUrl = task?.address ? `https://maps.google.com/?q=${encodeURIComponent([task.address.addressLine1, task.address.city, task.address.state, task.address.pincode].filter(Boolean).join(", "))}` : null;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className={`w-8 h-8 border-4 rounded-full animate-spin ${darkMode ? "border-fuchsia-950 border-t-fuchsia-400" : "border-purple-200 border-t-[#c026d3]"}`} />
      </div>
    );
  }

  if (!task) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-3 ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
        <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Task not found</p>
        <button onClick={() => navigate(-1)} className="text-[#c026d3] text-sm font-semibold">Go Back</button>
      </div>
    );
  }

  const isCompleted = task.status === "completed";
  const isCancelled = task.status === "cancelled";
  const hasAssignedAssets = Array.isArray(task.assets) && task.assets.length > 0;
  const workflow = getWorkflow(hasAssignedAssets);

  return (
    <div className={`flex-1 flex flex-col relative h-screen ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="bg-gradient-to-br from-[#86198f] via-[#c026d3] to-[#d946ef] h-[50vh] px-5 pt-6 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-8 w-16 h-16 rounded-full bg-white/5" />

        <button onClick={() => navigate("/provider/tasks")} className="flex items-center gap-1.5 text-white/80 text-sm mb-4">
          <ChevronLeft size={18} /> My Tasks
        </button>

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-white/50 text-xs font-mono mb-1">{task.bookingId}</p>
            <h1 className="text-xl font-bold text-white leading-tight">{task.service?.serviceName || "Task Detail"}</h1>
            <p className="text-white/60 text-xs mt-1 capitalize">{task.service?.category}</p>
          </div>
          <StatusBadge status={task.status} darkMode={darkMode} />
        </div>
      </div>

      <div className="px-4 pt-3 pb-24 space-y-3 max-w-xl overflow-y-auto">
        <AnimatePresence>
          {msg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-semibold border ${msg.type === "success" ? darkMode ? "bg-green-950/40 text-green-300 border-green-900/60" : "bg-green-50 text-green-700 border-green-100" : darkMode ? "bg-red-950/40 text-red-300 border-red-900/60" : "bg-red-50 text-red-600 border-red-100"}`}>
              {msg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {msg.text}
            </motion.div>
          )}
        </AnimatePresence>

        {!isCancelled && (
          <div className={`rounded-2xl border p-4 ${darkMode ? "bg-slate-900 border-slate-800 shadow-[0_18px_40px_rgba(2,6,23,0.28)]" : "bg-white border-gray-100 shadow-sm"}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Workflow Progress</p>
            <div className="flex items-start">
              {workflow.map(({ key, label, icon: Icon }, index) => (
                <div key={key} className="flex-1 flex flex-col items-center relative">
                  {index < workflow.length - 1 && <div className={`absolute top-3 left-1/2 w-full h-0.5 ${index < workflowStep ? "bg-purple-400" : darkMode ? "bg-slate-700" : "bg-gray-200"}`} />}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${index < workflowStep ? "bg-purple-500" : index === workflowStep ? darkMode ? "bg-[#c026d3] ring-4 ring-fuchsia-950" : "bg-[#c026d3] ring-4 ring-purple-100" : darkMode ? "bg-slate-700" : "bg-gray-200"}`}>
                    {index < workflowStep ? <CheckCircle2 size={13} className="text-white" /> : <Icon size={12} className={index === workflowStep ? "text-white" : darkMode ? "text-slate-500" : "text-gray-400"} />}
                  </div>
                  <span className={`text-[9px] mt-1.5 font-semibold text-center leading-tight px-0.5 ${index <= workflowStep ? "text-[#c026d3]" : darkMode ? "text-slate-500" : "text-gray-400"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className={`rounded-2xl border p-4 flex items-center gap-3 ${darkMode ? "bg-red-950/40 border-red-900/60" : "bg-red-50 border-red-100"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-red-900/50" : "bg-red-100"}`}>
              <AlertCircle size={18} className="text-red-500" />
            </div>
            <div>
              <p className={`text-sm font-bold ${darkMode ? "text-red-200" : "text-red-700"}`}>Task Cancelled</p>
              <p className={`text-xs ${darkMode ? "text-red-300/80" : "text-red-400"}`}>This booking has been cancelled</p>
            </div>
          </div>
        )}

        <Section title="Service" darkMode={darkMode}>
          <div className="flex items-center gap-3">
            {task.service?.serviceImage ? (
              <img src={task.service.serviceImage} alt={task.service?.serviceName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-fuchsia-950/50" : "bg-purple-50"}`}>
                <Wrench size={22} className="text-purple-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{task.service?.serviceName}</p>
              <p className={`text-xs mt-0.5 capitalize ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{task.service?.category}</p>
              {task.service?.description && <p className={`text-xs mt-1 line-clamp-2 ${darkMode ? "text-slate-400" : "text-gray-400"}`}>{task.service.description}</p>}
            </div>
            {task.service?.estimatedPrice && (
              <div className="flex-shrink-0 text-right">
                <p className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Service</p>
                <p className="flex items-center text-sm font-bold text-purple-600"><IndianRupee size={11} />{task.service.estimatedPrice}</p>
              </div>
            )}
          </div>
        </Section>

        <Section title="Customer" darkMode={darkMode}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl overflow-hidden border-2 flex items-center justify-center ${darkMode ? "bg-slate-950 border-slate-800" : "bg-white/20 border-gray-200"}`}>
              {task?.user?.profilePhoto ? <img src={task.user.profilePhoto} alt="profile" className="w-full h-full object-cover" /> : <span className="text-indigo-700 font-bold text-xl">{task.user?.name?.split(" ").map((word) => word[0]).join("").toUpperCase()}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{task.user?.name}</p>
              {task.user?.email && <div className="flex items-center gap-1 mt-0.5"><Mail size={11} className={darkMode ? "text-slate-500" : "text-gray-400"} /><p className={`text-xs truncate ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{task.user.email}</p></div>}
              {task.user?.phone && <div className="flex items-center gap-1 mt-0.5"><Phone size={11} className={darkMode ? "text-slate-500" : "text-gray-400"} /><p className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{task.user.phone}</p></div>}
            </div>
            {task.user?.phone && <a href={`tel:${task.user.phone}`} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 ${darkMode ? "bg-emerald-950/60 border border-emerald-900/60 text-emerald-300" : "bg-green-50 border border-green-100 text-green-700"}`}><PhoneCall size={13} />Call</a>}
          </div>
        </Section>

        <Section title="Service Address" darkMode={darkMode}>
          <div className="flex items-start gap-2">
            <MapPin size={15} className="text-[#c026d3] mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{task.address?.fullName}</p>
              <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{task.address?.phone}</p>
              <p className={`text-xs mt-1 leading-relaxed ${darkMode ? "text-slate-300" : "text-gray-600"}`}>{task.address?.addressLine1}{task.address?.addressLine2 && `, ${task.address.addressLine2}`}</p>
              <p className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{task.address?.city}, {task.address?.state} - {task.address?.pincode}</p>
            </div>
          </div>

          {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={`mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold border ${darkMode ? "bg-slate-950 border-slate-800 text-blue-300" : "bg-blue-50 border-blue-100 text-blue-700"}`}><Navigation size={13} />Open in Maps</a>}
        </Section>

        {task.assets?.length > 0 && (
          <Section title="Assets to Collect" darkMode={darkMode}>
            <div className="space-y-2">
              {task.assets.map((asset) => {
                const categoryStyle = getCategoryStyle(asset.category, darkMode);
                const CategoryIcon = getCategoryIcon(asset.category);
                return (
                  <div key={asset._id} className={`flex items-center gap-3 py-1 ${darkMode ? "" : ""}`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={categoryStyle}>
                      <CategoryIcon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{asset.assetName}</p>
                      <p className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>#{asset.assetId || asset._id?.slice(-6)}{asset.category && <span className="ml-1 capitalize">- {asset.category}</span>}{asset.quantity && <span className="ml-1">- {asset.quantity} pcs</span>}</p>
                    </div>
                    {asset.cost && <span className={`text-xs font-bold flex items-center gap-0.5 flex-shrink-0 ${darkMode ? "text-slate-200" : "text-slate-700"}`}><IndianRupee size={10} />{asset.cost}</span>}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        <div className={`rounded-2xl border p-4 ${darkMode ? "bg-slate-900 border-slate-800 shadow-[0_18px_40px_rgba(2,6,23,0.28)]" : "bg-white border-gray-100 shadow-sm"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Cost Breakdown</p>
          <CostRow label="Service Charge" sub={task.service?.serviceName} value={serviceCost} darkMode={darkMode} />
          {task.assets?.length > 0 && <CostRow label="Assets Cost" sub={`${task.assets.length} item${task.assets.length > 1 ? "s" : ""} assigned`} value={assetsCost} darkMode={darkMode} />}
          <CostRow label="Provider Working Charge" sub="Fixed per task" value={providerCharge} darkMode={darkMode} />
          <div className={`mt-3 pt-3 flex items-center justify-between ${darkMode ? "border-t border-slate-800" : "border-t border-gray-100"}`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${darkMode ? "bg-slate-950" : "bg-purple-50"}`}>
                <Wallet size={14} className="text-purple-600" />
              </div>
              <span className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Total Payable</span>
            </div>
            <span className="text-base font-extrabold text-purple-600 flex items-center gap-0.5"><IndianRupee size={14} />{totalCost}</span>
          </div>
        </div>

        <Section title="Timeline" darkMode={darkMode}>
          <TimelineRow label="Assigned on" value={new Date(task.assignedAt || task.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} darkMode={darkMode} />
          {task.scheduledDate && <TimelineRow label="Scheduled" value={new Date(task.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} darkMode={darkMode} />}
          {task.providerAcceptedAt && <TimelineRow label="Accepted on" value={new Date(task.providerAcceptedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} darkMode={darkMode} />}
          {hasAssignedAssets && task.assetsPickedUpAt && <TimelineRow label="Assets Picked on" value={new Date(task.assetsPickedUpAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} darkMode={darkMode} />}
          {task.startedAt && <TimelineRow label="Started on" value={new Date(task.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} darkMode={darkMode} />}
          {task.completedAt && <TimelineRow label="Completed" value={new Date(task.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} highlight darkMode={darkMode} />}
        </Section>

        {task.adminNote && <Section title="Instructions from Admin" darkMode={darkMode}><div className="flex items-start gap-2"><FileText size={14} className={darkMode ? "text-slate-500 mt-0.5" : "text-gray-400 mt-0.5"} /><p className={`text-sm leading-relaxed ${darkMode ? "text-slate-300" : "text-gray-600"}`}>{task.adminNote}</p></div></Section>}
        {task.providerNote && <Section title="Customer Note" darkMode={darkMode}><div className="flex items-start gap-2"><FileText size={14} className={darkMode ? "text-slate-500 mt-0.5" : "text-gray-400 mt-0.5"} /><p className={`text-sm italic ${darkMode ? "text-slate-300" : "text-gray-600"}`}>{task.providerNote}</p></div></Section>}
      </div>

      {!isCancelled && !isCompleted && (
        <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-sm px-4 pt-3 pb-5 safe-area-bottom shadow-lg ${darkMode ? "bg-slate-950/95 border-t border-slate-800" : "bg-white/95 border-t border-gray-100"}`}>
          <div className="max-w-xl mx-auto space-y-2">
            {workflowStep === 0 && (
              <div className="flex gap-3">
                <button onClick={() => setModal("reject")} className={`flex-1 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 ${darkMode ? "border border-red-900/60 bg-red-950/40 text-red-300" : "border border-red-200 bg-red-50 text-red-500"}`}><XCircle size={16} /> Reject</button>
                <button onClick={() => setModal("accept")} className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-br from-[#86198f] to-[#c026d3] text-white text-sm font-bold flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Accept Task</button>
              </div>
            )}
            {workflowStep === 1 && hasAssignedAssets && <button onClick={() => setModal("picked")} className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2"><Truck size={16} /> Confirm Assets Picked Up</button>}
            {workflowStep === (hasAssignedAssets ? 2 : 1) && <button onClick={() => setModal("progress")} className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2"><Wrench size={16} /> Start Work (Mark In Progress)</button>}
            {workflowStep === (hasAssignedAssets ? 3 : 2) && <button onClick={() => setModal("complete")} className="w-full py-3.5 rounded-2xl bg-green-600 text-white text-sm font-bold flex items-center justify-center gap-2"><CheckCheck size={16} /> Mark as Completed</button>}
          </div>
        </div>
      )}

      {isCompleted && (
        <div className={`fixed bottom-0 left-0 right-0 px-4 py-4 ${darkMode ? "bg-slate-950 border-t border-slate-800" : "bg-white border-t border-gray-100"}`}>
          <div className={`max-w-xl mx-auto flex items-center gap-3 rounded-2xl p-3 border ${darkMode ? "bg-green-950/40 border-green-900/60" : "bg-green-50 border-green-100"}`}>
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
            <div>
              <p className={`text-sm font-bold ${darkMode ? "text-green-200" : "text-green-700"}`}>Task Completed</p>
              <p className={`text-xs ${darkMode ? "text-green-300/80" : "text-green-500"}`}>Great work! This task has been marked as done.</p>
            </div>
          </div>
        </div>
      )}

      {modal === "accept" && <ConfirmModal title="Accept this Task?" message="You'll be responsible for completing this service. Make sure you're available before accepting." confirmLabel={<><CheckCircle2 size={14} /> Accept Task</>} confirmColor="purple" loading={actionLoading} onConfirm={() => updateStatus("accepted")} onClose={() => setModal(null)} darkMode={darkMode} />}
      {modal === "reject" && <ConfirmModal title="Reject this Task?" message="The admin will be notified and the task will be unassigned from you." confirmLabel={<><XCircle size={14} /> Reject Task</>} confirmColor="red" loading={actionLoading} onConfirm={() => updateStatus("cancelled")} onClose={() => setModal(null)} darkMode={darkMode} />}
      {modal === "picked" && <ConfirmModal title="Assets Picked Up?" message="Confirm that you've collected all the assigned assets from the customer and are ready to start." confirmLabel={<><Truck size={14} /> Confirm Pickup</>} confirmColor="purple" loading={actionLoading} onConfirm={() => updateStatus("picked_up")} onClose={() => setModal(null)} darkMode={darkMode} />}
      {modal === "progress" && <ConfirmModal title="Start Work?" message="This will mark the task as In Progress and notify the customer that work has begun." confirmLabel={<><Wrench size={14} /> Start Work</>} confirmColor="purple" loading={actionLoading} onConfirm={() => updateStatus("in_progress")} onClose={() => setModal(null)} darkMode={darkMode} />}
      {modal === "complete" && <ConfirmModal title="Mark as Completed?" message="Confirm the service has been successfully completed and assets returned. This cannot be undone." confirmLabel={<><CheckCheck size={14} /> Mark Completed</>} confirmColor="green" loading={actionLoading} onConfirm={() => updateStatus("completed")} onClose={() => setModal(null)} darkMode={darkMode} />}
    </div>
  );
}
