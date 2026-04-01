import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Edit3, Check, X,
  Loader2, Shield, Briefcase, Star, Hash,
  Navigation, AlignLeft, LogOut, Clock, Building2,
  Camera, ImagePlus, Trash2,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";
import { getInitials } from "../../utils/avatarUtils";

/* ────────────────────────────────────────────
   InfoRow — read-only display
──────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-sm text-slate-700 font-semibold mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   EditField — editable input or locked
──────────────────────────────────────────── */
function EditField({ icon: Icon, label, name, value, onChange, type = "text", locked, placeholder }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${locked ? "bg-gray-100" : "bg-purple-50"}`}>
        <Icon size={14} className={locked ? "text-gray-400" : "text-purple-600"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">{label}</p>
        {locked ? (
          <div className="flex items-center gap-1.5">
            <p className="text-sm text-gray-400 font-medium">{value}</p>
            <Shield size={10} className="text-gray-300" />
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className="w-full text-sm text-slate-800 font-medium bg-purple-50/50 border border-purple-100 rounded-xl px-3 py-2 outline-none focus:border-purple-400 focus:bg-white transition-all placeholder-gray-300"
          />
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Section divider label inside card
──────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 pt-3 pb-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 whitespace-nowrap">
        {children}
      </p>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

/* ────────────────────────────────────────────
   Main Component
──────────────────────────────────────────── */
export default function ProviderProfile() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(""); // "success" | "error" | ""
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [form, setForm] = useState({
    description: "", phone: "", city: "", state: "",
    pincode: "", experience: "", serviceType: "",
  });

  /* Fetch provider */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${apiUrl}/provider`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.provider;
        setProvider(data);
        setPhotoUrl(data.profilePhoto || "");
        setForm({
          description: data.description || "",
          phone: data.phone || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          experience: data.experience || "",
          serviceType: Array.isArray(data.serviceType) ? data.serviceType.join(", ") : data.serviceType || "",
        });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  // useEffect(() => {
  //   return () => {
  //     if (photoPreview?.startsWith("blob:")) {
  //       URL.revokeObjectURL(photoPreview);
  //     }
  //   };
  // }, [photoPreview]);

  /* Photo upload — backend receives file, uploads to Vercel Blob, returns { url } */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setShowMenu(false);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("profilePhoto", file);
      const res = await axios.put(`${apiUrl}/provider/profile-photo`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      // Vercel Blob returns a public `url` field
      const url = res.data.profilePhoto || res.data.data?.profilePhoto || "";
      setPhotoUrl(url);
      setProvider(u => ({ ...u, profilePhoto: url }));
    } catch (err) {
      console.error("Upload failed", err);
    }
    setUploading(false);
  };

  const handleRemovePhoto = async () => {
    setShowMenu(false);
    try {
      await axios.delete(`${apiUrl}/provider/profile-photo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhotoUrl("");
      setProvider(u => ({ ...u, profilePhoto: "" }));
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const payload = {
        ...form,
        serviceType: form.serviceType
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
      const r = await axios.put(
        `${apiUrl}/provider/profile`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = r.data.data || r.data.provider || r.data;
      setProvider(updated);
      setEditing(false);
      setSaveMsg("success");
    } catch {
      setSaveMsg("error");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handleCancel = () => {
    setForm({
      description: provider?.description || "",
      phone: provider?.phone || "",
      city: provider?.city || "",
      state: provider?.state || "",
      pincode: provider?.pincode || "",
      experience: provider?.experience || "",
      serviceType: Array.isArray(provider?.serviceType) ? provider.serviceType.join(", ") : provider?.serviceType || "",
    });
    setEditing(false);
  };

  const initials = getInitials(provider?.name, "NA");

  const joinedDate = provider?.createdAt
    ? new Date(provider.createdAt).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    })
    : null;

  const serviceTypes = Array.isArray(provider?.serviceType)
    ? provider.serviceType.join(", ")
    : provider?.serviceType || "";

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 size={28} className="text-purple-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F6F9]">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#86198f] via-[#a21caf] to-[#c026d3] px-5 pt-10 pb-16 relative">
        <div className="absolute bottom-2 left-6 w-20 h-20 rounded-full bg-white/5" />

        <div className="flex items-center gap-4 relative">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/30 flex items-center justify-center">
              {photoUrl
                ? <img src={photoUrl} alt="profile" className="w-full h-full object-cover" />
                : <span className="text-white font-extrabold text-xl">{initials}</span>
              }
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 size={18} className="text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Camera button — relative parent is NOT overflow-hidden so menu shows */}
            <div className="absolute -bottom-1.5 -right-1.5">
              <button
                onClick={() => setShowMenu(v => !v)}
                className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100"
              >
                <Camera size={13} className="text-emerald-600" />
              </button>

              
            </div>
            {/* Menu — drops down from button, outside any overflow clip */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.13 }}
                    className="absolute top-20 left-10 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-44 z-[999]"
                  >
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-gray-50"
                    >
                      <ImagePlus size={14} className="text-purple-600" />
                      {photoUrl ? "Change Photo" : "Upload Photo"}
                    </button>

                    {photoUrl && (
                      <button
                        onClick={handleRemovePhoto}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 border-t border-gray-100"
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
              {/* Active badge — top-right absolute like UserProfile */}
              <span className={`inline-flex absolute right-2 items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${provider?.status === "active"
                ? "bg-white/20 text-white"
                : "bg-white/10 text-white/60"
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${provider?.status === "active" ? "bg-green-300" : "bg-gray-400"}`} />
                {provider?.status === "active" ? "Active" : provider?.status || "Inactive"}
              </span>
              {joinedDate && (
                <span className="text-white/40 text-[10px]">Since {joinedDate}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop to close menu */}
      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="absolute -mt-10 pb-28 w-full px-4 space-y-3">

        {/* Toast */}
        <AnimatePresence>
          {saveMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm
                ${saveMsg === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-600 border border-red-100"}`}
            >
              {saveMsg === "success"
                ? <><Check size={14} /> Profile updated successfully!</>
                : <><X size={14} /> Failed to save. Try again.</>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-50">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">My Profile</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">Account & Service Details</p>
            </div>

            {!editing ? (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-100 px-3.5 py-2 rounded-xl text-xs font-bold"
              >
                <Edit3 size={12} /> Edit
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={handleCancel}
                  className="flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-2 rounded-xl text-xs font-bold"
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
                  {saving ? "Saving…" : "Save"}
                </motion.button>
              </div>
            )}
          </div>

          {/* Card body — animated switch */}
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
                  {/* Locked fields */}
                  <SectionLabel>Account Info</SectionLabel>
                  <EditField icon={User} label="Full Name" name="name" value={provider?.name} locked />
                  <EditField icon={Mail} label="Email" name="email" value={provider?.email} locked />

                  {/* Editable personal */}
                  <SectionLabel>Contact</SectionLabel>
                  <EditField
                    icon={Phone} label="Phone" name="phone"
                    value={form.phone} onChange={handleChange}
                    placeholder="Your contact number"
                  />
                  <EditField
                    icon={AlignLeft} label="Description" name="description"
                    value={form.description} onChange={handleChange}
                    placeholder="Brief about your service"
                  />

                  {/* Location */}
                  <SectionLabel>Location</SectionLabel>
                  <EditField
                    icon={Building2} label="City" name="city"
                    value={form.city} onChange={handleChange}
                    placeholder="City"
                  />
                  <EditField
                    icon={Navigation} label="State" name="state"
                    value={form.state} onChange={handleChange}
                    placeholder="State"
                  />
                  <EditField
                    icon={Hash} label="Pincode" name="pincode"
                    value={form.pincode} onChange={handleChange}
                    placeholder="6-digit pincode"
                  />

                  {/* Professional */}
                  <SectionLabel>Professional</SectionLabel>
                  <EditField
                    icon={Clock} label="Experience (Years)" name="experience"
                    value={form.experience} onChange={handleChange}
                    placeholder="e.g. 5"
                    type="number"
                  />
                  <EditField
                    icon={Star} label="Service Type" name="serviceType"
                    value={form.serviceType} onChange={handleChange}
                    placeholder="e.g. AC Repair, Plumbing"
                  />
                </>
              ) : (
                <>
                  {/* View mode */}
                  <SectionLabel>Account Info</SectionLabel>
                  <InfoRow icon={User} label="Full Name" value={provider?.name} />
                  <InfoRow icon={Mail} label="Email" value={provider?.email} />
                  <InfoRow icon={Shield} label="Tenant ID" value={provider?.tenantId} />

                  <SectionLabel>Contact</SectionLabel>
                  <InfoRow icon={Phone} label="Phone" value={provider?.phone} />
                  <InfoRow icon={AlignLeft} label="Description" value={provider?.description} />

                  <SectionLabel>Location</SectionLabel>
                  <InfoRow
                    icon={MapPin}
                    label="Address"
                    value={[provider?.city, provider?.state, provider?.pincode].filter(Boolean).join(", ")}
                  />

                  <SectionLabel>Professional</SectionLabel>
                  <InfoRow icon={Clock} label="Experience" value={provider?.experience ? `${provider.experience} Years` : null} />
                  <InfoRow icon={Star} label="Service Types" value={serviceTypes} />
                  <InfoRow icon={Briefcase} label="Role" value={provider?.role} />
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
