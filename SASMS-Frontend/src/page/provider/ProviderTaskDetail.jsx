import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Package,
  FileText,
  CheckCircle2,
  Phone,
  Mail,
  AlertCircle,
  Wrench,
  User,
  Clock,
  Calendar,
  Laptop,
  Printer,
  Monitor,
  Settings,
  Tag,
  ArrowRight,
  CheckCheck,
  Truck,
  PlayCircle,
  XCircle,
  IndianRupee,
} from "lucide-react";

/* ── Status config ───────────────────────────────────── */
const STATUS_CONFIG = {
  assigned:    { label: "Assigned",    bg: "bg-purple-100",  text: "text-purple-700",  dot: "bg-purple-400"  },
  in_progress: { label: "In Progress", bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-400"    },
  completed:   { label: "Completed",   bg: "bg-green-100",   text: "text-green-700",   dot: "bg-green-500"   },
  cancelled:   { label: "Cancelled",   bg: "bg-red-100",     text: "text-red-600",     dot: "bg-red-400"     },
};

// Provider-side workflow steps
const WORKFLOW = [
  { key: "assigned",    label: "Assigned",      icon: Tag     },
  { key: "picked_up",  label: "Assets Picked",  icon: Truck   },
  { key: "in_progress",label: "In Progress",    icon: Wrench  },
  { key: "completed",  label: "Completed",      icon: CheckCheck },
];

/* ── Category helpers ────────────────────────────────── */
const getCategoryStyle = (cat) => {
  switch (cat) {
    case "laptop":     return { background: "#EFF6FF", color: "#1976D2" };
    case "printer":    return { background: "#F0FDF4", color: "#388E3C" };
    case "television": return { background: "#FFF7ED", color: "#F57C00" };
    case "acUnit":     return { background: "#FFF7ED", color: "#F57C00" };
    case "mobile":     return { background: "#F3E8FF", color: "#7B1FA2" };
    default:           return { background: "#F5F3FF", color: "#7C3AED" };
  }
};
const getCategoryIcon = (cat) => {
  switch (cat) {
    case "laptop":     return Laptop;
    case "printer":    return Printer;
    case "television": return Monitor;
    case "acUnit":     return Wrench;
    case "mobile":     return Phone;
    default:           return Settings;
  }
};

/* ── Small components ───────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.assigned;
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

/* ── Confirm Action Modal ─────────────────────────── */
function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onClose, loading }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="bg-white w-full max-w-sm rounded-t-3xl overflow-hidden shadow-2xl"
        >
          <div className="p-6">
            <h2 className="text-base font-bold text-slate-800 text-center mb-1">{title}</h2>
            <p className="text-xs text-gray-400 text-center mb-6 leading-relaxed">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-3 rounded-2xl text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 ${
                  confirmColor === "purple" ? "bg-[#c026d3]"
                  : confirmColor === "green" ? "bg-green-600"
                  : "bg-red-500"
                }`}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : confirmLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main Page ──────────────────────────────────────── */
export default function ProviderTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState(null); // { type: "accept"|"reject"|"picked"|"progress"|"complete" }
  const [msg, setMsg] = useState(null);

  // Local workflow step — tracked separately since backend only has assigned/in_progress/completed
  const [workflowStep, setWorkflowStep] = useState(0);

  const token = localStorage.getItem("token");
const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/provider/booking/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const t = res.data.booking || res.data.data;
        setTask(t);
        // Set workflow step based on current status
        if (t?.status === "in_progress") setWorkflowStep(2);
        else if (t?.status === "completed") setWorkflowStep(3);
        else setWorkflowStep(0); // assigned
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
  useEffect(() => {
    
    fetchTask();
  }, [id, token]);

  const updateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      const res = await axios.put(
        `${apiUrl}/provider/booking/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data.booking || res.data.data;
      setTask(updated || { ...task, status: newStatus });
      if (newStatus === "in_progress") setWorkflowStep(2);
      if (newStatus === "completed")   setWorkflowStep(3);
      setMsg({ type: "success", text: `Status updated to ${newStatus.replace("_", " ")}` });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Update failed" });
    }
    fetchTask();
    setActionLoading(false);
    setModal(null);
  };

  // Loading / not found guards
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-200 border-t-[#c026d3] rounded-full animate-spin" />
    </div>
  );

  if (!task) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
      <p className="text-gray-500 text-sm">Task not found</p>
      <button onClick={() => navigate(-1)} className="text-[#c026d3] text-sm font-semibold">Go Back</button>
    </div>
  );

  const isAssigned    = task.status === "assigned";
  const isInProgress  = task.status === "in_progress";
  const isCompleted   = task.status === "completed";
  const isCancelled   = task.status === "cancelled";

  // Workflow progress bar steps
  const currentWorkflowStep = workflowStep;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#86198f] via-[#c026d3] to-[#d946ef] px-5 pt-6 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />

        <button
          onClick={() => navigate("/provider/tasks")}
          className="flex items-center gap-1.5 text-white/80 text-sm mb-4"
        >
          <ChevronLeft size={18} />
          My Tasks
        </button>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs font-mono mb-1">{task.bookingId}</p>
            <h1 className="text-xl font-bold text-white">{task.service?.serviceName || "Task Detail"}</h1>
            <p className="text-white/60 text-xs mt-1">{task.service?.category}</p>
          </div>
          <StatusBadge status={task.status} />
        </div>
      </div>

      <div className="mt-2 px-4 pb-32 space-y-3 max-w-xl mx-auto">

        {/* Status message */}
        {msg && (
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-semibold ${
            msg.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
          }`}>
            {msg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {msg.text}
          </div>
        )}
        
        {/* Workflow progress */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Workflow Progress</p>
            <div className="flex items-start">
              {WORKFLOW.map(({ key, label, icon: Icon }, i) => (
                <div key={key} className="flex-1 flex flex-col items-center relative">
                  {i < WORKFLOW.length - 1 && (
                    <div className={`absolute top-3 left-1/2 w-full h-0.5 ${i < currentWorkflowStep ? "bg-purple-400" : "bg-gray-200"}`} />
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all ${
                    i < currentWorkflowStep  ? "bg-purple-500"
                    : i === currentWorkflowStep ? "bg-[#c026d3] ring-4 ring-purple-100"
                    : "bg-gray-200"
                  }`}>
                    {i < currentWorkflowStep
                      ? <CheckCircle2 size={13} className="text-white" />
                      : i === currentWorkflowStep
                      ? <Icon size={12} className="text-white" />
                      : <Icon size={12} className="text-gray-400" />
                    }
                  </div>
                  <span className={`text-[9px] mt-1.5 font-semibold text-center leading-tight ${
                    i <= currentWorkflowStep ? "text-[#c026d3]" : "text-gray-400"
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <div className="bg-red-50 rounded-2xl border border-red-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-700">Task Cancelled</p>
              <p className="text-xs text-red-400">This booking has been cancelled</p>
            </div>
          </div>
        )}

        {/* Service info */}
        <Section title="Service">
          <div className="flex items-center gap-3">
            {task.service?.serviceImage ? (
              <img
                src={`${apiUrl}${task.service.serviceImage}`}
                alt=""
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Wrench size={22} className="text-purple-400" />
              </div>
            )}
            <div className="flex justify-between w-full ">
              <span>
                <p className="text-sm font-bold text-slate-800">{task.service?.serviceName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{task.service?.category}</p>
              {task.service?.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.service.description}</p>
              )}
              </span>
              {task.service?.estimatedPrice && (
                <p className="flex items-center text-xs text-green-600 mt-1 line-clamp-2"><IndianRupee size={10} /> {task.service.estimatedPrice}</p>
              )}
            </div>
          </div>
        </Section>

        {/* Customer */}
        <Section title="Customer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-700 font-bold text-xs">
                {task.user?.name?.split(" ").map(w => w[0]).join("").toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">{task.user?.name}</p>
              {task.user?.phone && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone size={11} className="text-gray-400" />
                  <p className="text-xs text-gray-500">{task.user.phone}</p>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Address */}
        <Section title="Service Address">
          <div className="flex items-start gap-2">
            <MapPin size={15} className="text-[#c026d3] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">{task.address?.fullName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{task.address?.phone}</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {task.address?.addressLine1}
                {task.address?.addressLine2 && `, ${task.address.addressLine2}`}
              </p>
              <p className="text-xs text-gray-400">
                {task.address?.city}, {task.address?.state} — {task.address?.pincode}
              </p>
            </div>
          </div>
        </Section>

        {/* Assets */}
        {task.assets?.length > 0 && (
          <Section title="Assets to Collect">
            <div className="space-y-2">
              {task.assets.map((a) => {
                const catStyle = getCategoryStyle(a.category);
                const CatIcon = getCategoryIcon(a.category);
                return (
                  <div key={a._id} className="flex items-center gap-3 py-1">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={catStyle}
                    >
                      <CatIcon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 font-semibold">{a.assetName}</p>
                      <p className="text-[10px] text-gray-400">
                        #{a.assetId || a._id?.slice(-6)}
                        {a.category && <span className="ml-1 capitalize">· {a.category}</span>}
                        {a.quantity && <span className="ml-1">· {a.quantity} pcs</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Timeline */}
        <Section title="Timeline">
          <TimelineRow label="Assigned on" value={new Date(task.assignedAt || task.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
          {task.scheduledDate && <TimelineRow label="Scheduled" value={new Date(task.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />}
          {task.startedAt && <TimelineRow label="Started" value={new Date(task.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />}
          {task.completedAt && <TimelineRow label="Completed" value={new Date(task.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} highlight />}
        </Section>

        {/* Admin note */}
        {task.adminNote && (
          <Section title="Instructions from Admin">
            <div className="flex items-start gap-2">
              <FileText size={14} className="text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600 leading-relaxed">{task.adminNote}</p>
            </div>
          </Section>
        )}

        {/* Customer note */}
        {task.providerNote && (
          <Section title="Customer Note">
            <div className="flex items-start gap-2">
              <FileText size={14} className="text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600 italic">{task.providerNote}</p>
            </div>
          </Section>
        )}
      </div>

      {/* ── Sticky action bar ─────────────────────────── */}
      {!isCancelled && !isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 safe-area-bottom">
          <div className="max-w-xl mx-auto">

            {/* ASSIGNED → Accept or Reject */}
            {isAssigned && (
              <div className="flex gap-3">
                <button
                  onClick={() => setModal("reject")}
                  className="flex-1 py-3.5 rounded-2xl border border-red-200 text-red-500 text-sm font-bold flex items-center justify-center gap-2 bg-red-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  onClick={() => setModal("accept")}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-br from-[#86198f] to-[#c026d3] text-white text-sm font-bold flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Accept Task
                </button>
              </div>
            )}

            {/* workflowStep 1 = accepted, waiting to pick up assets */}
            {isAssigned && workflowStep === 1 && (
              <button
                onClick={() => setModal("picked")}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#86198f] to-[#c026d3] text-white text-sm font-bold flex items-center justify-center gap-2"
              >
                <Truck size={16} />
                Mark Assets Picked Up
              </button>
            )}

            {/* IN_PROGRESS → Mark Completed */}
            {isInProgress && (
              <div className="space-y-2">
                <button
                  onClick={() => setModal("complete")}
                  className="w-full py-3.5 rounded-2xl bg-green-600 text-white text-sm font-bold flex items-center justify-center gap-2"
                >
                  <CheckCheck size={16} />
                  Mark as Completed
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed banner */}
      {isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
          <div className="max-w-xl mx-auto flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl p-3">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-700">Task Completed</p>
              <p className="text-xs text-green-500">Great work! This task has been marked as done.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────── */}
      {modal === "accept" && (
        <ConfirmModal
          title="Accept this Task?"
          message="You'll be responsible for completing this service. Make sure you're available before accepting."
          confirmLabel={<><CheckCircle2 size={14} /> Accept Task</>}
          confirmColor="purple"
          loading={actionLoading}
          onConfirm={() => {
            setWorkflowStep(1);
            setModal(null);
            setMsg({ type: "success", text: "Task accepted! Proceed to collect assets." });
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "reject" && (
        <ConfirmModal
          title="Reject this Task?"
          message="The admin will be notified and the task will be unassigned from you."
          confirmLabel={<><XCircle size={14} /> Reject Task</>}
          confirmColor="red"
          loading={actionLoading}
          onConfirm={() => updateStatus("cancelled")}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "picked" && (
        <ConfirmModal
          title="Assets Picked Up?"
          message="Confirm that you've collected all the assigned assets and are ready to start."
          confirmLabel={<><Truck size={14} /> Confirm Pickup</>}
          confirmColor="purple"
          loading={actionLoading}
          onConfirm={() => updateStatus("in_progress")}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "complete" && (
        <ConfirmModal
          title="Mark as Completed?"
          message="Confirm the service has been successfully completed. This cannot be undone."
          confirmLabel={<><CheckCheck size={14} /> Mark Completed</>}
          confirmColor="green"
          loading={actionLoading}
          onConfirm={() => updateStatus("completed")}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}