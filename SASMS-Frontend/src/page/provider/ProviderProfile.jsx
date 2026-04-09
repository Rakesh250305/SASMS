import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Edit3,
  Check,
  X,
  Loader2,
  Shield,
  Briefcase,
  Star,
  Hash,
  Navigation,
  AlignLeft,
  Clock,
  Building2,
  Camera,
  ImagePlus,
  Trash2,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";
import { getInitials } from "../../utils/avatarUtils";
import useDarkMode from "../../utils/useDarkMode";

function InfoRow({ icon: Icon, label, value, darkMode }) {
  if (!value) return null;

  return (
    <div className={`flex items-start gap-3 py-3.5 border-b last:border-0 ${darkMode ? "border-slate-800" : "border-slate-50"}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${darkMode ? "bg-fuchsia-950/50" : "bg-fuchsia-50"}`}>
        <Icon size={14} className={darkMode ? "text-fuchsia-300" : "text-fuchsia-600"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{label}</p>
        <p className={`text-sm font-semibold mt-0.5 leading-snug ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{value}</p>
      </div>
    </div>
  );
}

function EditField({ icon: Icon, label, name, value, onChange, type = "text", locked, placeholder, darkMode }) {
  return (
    <div className={`flex items-start gap-3 py-3 border-b last:border-0 ${darkMode ? "border-slate-800" : "border-slate-50"}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${locked ? darkMode ? "bg-slate-900" : "bg-gray-100" : darkMode ? "bg-fuchsia-950/50" : "bg-fuchsia-50"}`}>
        <Icon size={14} className={locked ? darkMode ? "text-slate-500" : "text-gray-400" : darkMode ? "text-fuchsia-300" : "text-fuchsia-600"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{label}</p>
        {locked ? (
          <div className="flex items-center gap-1.5">
            <p className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-gray-400"}`}>{value}</p>
            <Shield size={10} className={darkMode ? "text-slate-600" : "text-gray-300"} />
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className={`w-full text-sm font-medium rounded-xl px-3 py-2 outline-none border transition-all ${
              darkMode
                ? "text-slate-100 bg-slate-900 border-slate-800 focus:border-fuchsia-500 placeholder:text-slate-500"
                : "text-slate-800 bg-fuchsia-50/50 border-fuchsia-100 focus:border-fuchsia-400 focus:bg-white placeholder:text-gray-300"
            }`}
          />
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children, darkMode }) {
  return (
    <div className="flex items-center gap-2 pt-3 pb-1">
      <p className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${darkMode ? "text-slate-500" : "text-gray-300"}`}>{children}</p>
      <div className={`flex-1 h-px ${darkMode ? "bg-slate-800" : "bg-slate-100"}`} />
    </div>
  );
}

export default function ProviderProfile() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [form, setForm] = useState({
    description: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
    experience: "",
    serviceType: "",
  });

  const syncForm = (data) => {
    setForm({
      description: data?.description || "",
      phone: data?.phone || "",
      city: data?.city || "",
      state: data?.state || "",
      pincode: data?.pincode || "",
      experience: data?.experience || "",
      serviceType: Array.isArray(data?.serviceType) ? data.serviceType.join(", ") : data?.serviceType || "",
    });
  };

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await axios.get(`${apiUrl}/provider`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data || res.data.provider || res.data;
        setProvider(data);
        setPhotoUrl(data.profilePhoto || "");
        syncForm(data);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
          return;
        }
        toast.error(error.response?.data?.message || "Unable to load provider profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [apiUrl, navigate, token]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";
    setShowMenu(false);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("profilePhoto", file);
      const res = await axios.put(`${apiUrl}/provider/profile-photo`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const url = res.data.profilePhoto || res.data.data?.profilePhoto || "";
      setPhotoUrl(url);
      setProvider((prev) => ({ ...prev, profilePhoto: url }));
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setShowMenu(false);
    try {
      await axios.delete(`${apiUrl}/provider/profile-photo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhotoUrl("");
      setProvider((prev) => ({ ...prev, profilePhoto: "" }));
      toast.success("Profile photo removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove photo");
    }
  };

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSave = async () => {
    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        phone: form.phone.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        description: form.description.trim(),
        experience: form.experience,
        serviceType: form.serviceType
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const res = await axios.put(`${apiUrl}/provider/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = res.data.data || res.data.provider || res.data;
      setProvider(updated);
      syncForm(updated);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    syncForm(provider);
    setEditing(false);
  };

  const initials = getInitials(provider?.name, "NA");
  const joinedDate = provider?.createdAt
    ? new Date(provider.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const serviceTypes = Array.isArray(provider?.serviceType)
    ? provider.serviceType.join(", ")
    : provider?.serviceType || "";

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
        <Loader2 size={28} className="text-fuchsia-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-slate-950" : "bg-[#F3F6F9]"}`}>
      <div className={`px-5 pt-10 pb-16 relative overflow-hidden bg-gradient-to-br from-[#c026d3] via-[#a21caf] to-[#86198] `}>
        <div className="absolute bottom-2 left-6 w-20 h-20 rounded-full bg-white/5" />

        <div className="flex items-center gap-4 relative">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/20 flex items-center justify-center shadow-lg">
              {photoUrl ? (
                <img src={photoUrl} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-extrabold text-xl">{initials}</span>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 size={18} className="text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="absolute -bottom-1.5 -right-1.5">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100"
              >
                <Camera size={13} className="text-fuchsia-600" />
              </button>
            </div>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -4 }}
                  transition={{ duration: 0.13 }}
                  className={`absolute top-20 left-10 rounded-2xl shadow-2xl overflow-hidden w-44 z-[999] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold ${darkMode ? "text-slate-200 hover:bg-slate-800" : "text-slate-700 hover:bg-gray-50"}`}
                  >
                    <ImagePlus size={14} className="text-fuchsia-600" />
                    {photoUrl ? "Change Photo" : "Upload Photo"}
                  </button>

                  {photoUrl && (
                    <button
                      onClick={handleRemovePhoto}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold border-t ${darkMode ? "border-slate-800 text-red-300 hover:bg-slate-800" : "border-gray-100 text-red-500 hover:bg-red-50"}`}
                    >
                      <Trash2 size={14} />
                      Remove Photo
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-white font-extrabold text-lg leading-tight truncate">{provider?.name}</p>
            <p className="text-white/60 text-xs mt-0.5 truncate">{provider?.email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex absolute right-2 items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${provider?.status === "active" ? "bg-white/20 text-white" : "bg-white/10 text-white/60"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${provider?.status === "active" ? "bg-green-300" : "bg-gray-400"}`} />
                {provider?.status === "active" ? "Active" : provider?.status || "Inactive"}
              </span>
              {joinedDate && <span className="text-white/40 text-[10px]">Since {joinedDate}</span>}
            </div>
          </div>
        </div>
      </div>

      {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="-mt-10 pb-28 w-full px-4 space-y-3 relative">
        <div className={`rounded-3xl border overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800 shadow-[0_24px_60px_rgba(2,6,23,0.36)]" : "bg-white border-gray-100 shadow-sm"}`}>
          <div className={`flex items-center justify-between px-5 pt-5 pb-3 border-b ${darkMode ? "border-slate-800" : "border-slate-50"}`}>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-gray-400"}`}>My Profile</p>
              <p className={`text-sm font-bold mt-0.5 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>Account & Service Details</p>
            </div>

            {!editing ? (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setEditing(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border ${darkMode ? "bg-slate-950 border-slate-800 text-fuchsia-300" : "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100"}`}
              >
                <Edit3 size={12} /> Edit
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={handleCancel}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold ${darkMode ? "bg-slate-950 text-slate-300 border border-slate-800" : "bg-gray-100 text-gray-500"}`}
                >
                  <X size={12} /> Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 bg-[#c026d3] text-white px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-60"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  {saving ? "Saving..." : "Save"}
                </motion.button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={editing ? "edit" : "view"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="px-5 py-1 pb-4"
            >
              {editing ? (
                <>
                  <SectionLabel darkMode={darkMode}>Account Info</SectionLabel>
                  <EditField icon={User} label="Full Name" name="name" value={provider?.name} locked darkMode={darkMode} />
                  <EditField icon={Mail} label="Email" name="email" value={provider?.email} locked darkMode={darkMode} />

                  <SectionLabel darkMode={darkMode}>Contact</SectionLabel>
                  <EditField icon={Phone} label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Your contact number" darkMode={darkMode} />
                  <EditField icon={AlignLeft} label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Brief about your service" darkMode={darkMode} />

                  <SectionLabel darkMode={darkMode}>Location</SectionLabel>
                  <EditField icon={Building2} label="City" name="city" value={form.city} onChange={handleChange} placeholder="City" darkMode={darkMode} />
                  <EditField icon={Navigation} label="State" name="state" value={form.state} onChange={handleChange} placeholder="State" darkMode={darkMode} />
                  <EditField icon={Hash} label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" darkMode={darkMode} />

                  <SectionLabel darkMode={darkMode}>Professional</SectionLabel>
                  <EditField icon={Clock} label="Experience (Years)" name="experience" value={form.experience} onChange={handleChange} placeholder="e.g. 5" type="number" darkMode={darkMode} />
                  <EditField icon={Star} label="Service Type" name="serviceType" value={form.serviceType} onChange={handleChange} placeholder="e.g. AC Repair, Plumbing" darkMode={darkMode} />
                </>
              ) : (
                <>
                  <SectionLabel darkMode={darkMode}>Account Info</SectionLabel>
                  <InfoRow icon={User} label="Full Name" value={provider?.name} darkMode={darkMode} />
                  <InfoRow icon={Mail} label="Email" value={provider?.email} darkMode={darkMode} />
                  <InfoRow icon={Shield} label="Tenant ID" value={provider?.tenantId} darkMode={darkMode} />

                  <SectionLabel darkMode={darkMode}>Contact</SectionLabel>
                  <InfoRow icon={Phone} label="Phone" value={provider?.phone} darkMode={darkMode} />
                  <InfoRow icon={AlignLeft} label="Description" value={provider?.description} darkMode={darkMode} />

                  <SectionLabel darkMode={darkMode}>Location</SectionLabel>
                  <InfoRow icon={Navigation} label="Address" value={[provider?.city, provider?.state, provider?.pincode].filter(Boolean).join(", ")} darkMode={darkMode} />

                  <SectionLabel darkMode={darkMode}>Professional</SectionLabel>
                  <InfoRow icon={Clock} label="Experience" value={provider?.experience ? `${provider.experience} Years` : null} darkMode={darkMode} />
                  <InfoRow icon={Star} label="Service Types" value={serviceTypes} darkMode={darkMode} />
                  <InfoRow icon={Briefcase} label="Role" value={provider?.role} darkMode={darkMode} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
