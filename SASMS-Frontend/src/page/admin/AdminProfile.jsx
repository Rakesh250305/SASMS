import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Edit3, Check, X,
  Loader2, Shield, Hash, AlignLeft,
  Building2, Globe, FileText, Store, ChevronLeft,
  Camera, ImagePlus, Trash2,
} from "lucide-react";
import { getInitials } from "../../utils/avatarUtils";
import useDarkMode from "../../utils/useDarkMode";

/* ────────────────────────────────────────────
   InfoRow — read-only display
──────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-sm text-slate-700 font-semibold mt-0.5 leading-snug break-all">{value}</p>
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
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${locked ? "bg-gray-100" : "bg-blue-50"}`}>
        <Icon size={14} className={locked ? "text-gray-400" : "text-blue-600"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">{label}</p>
        {locked ? (
          <div className="flex items-center gap-1.5">
            <p className="text-sm text-gray-400 font-medium break-all">{value}</p>
            <Shield size={10} className="text-gray-300 flex-shrink-0" />
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className="w-full text-sm text-slate-800 font-medium bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-2 outline-none focus:border-blue-400 focus:bg-white transition-all placeholder-gray-300"
          />
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   SectionLabel
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
export default function AdminProfile() {
  const navigate  = useNavigate();
  const apiUrl    = import.meta.env.VITE_BACKEND_URL;
  const token     = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  const [admin, setAdmin]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState("");

  // Store photo state
  const [storePhoto, setStorePhoto]           = useState(null);
  const [photoPreview, setPhotoPreview]       = useState(null);
  const [uploadingPhoto, setUploadingPhoto]   = useState(false);
  const [showPhotoMenu, setShowPhotoMenu]     = useState(false);
  const { darkMode } = useDarkMode();

  const [form, setForm] = useState({
    name: "", phone: "",
    storeName: "", storeAddress: "",
    GSTNo: "", website: "",
    city: "", state: "", pincode: "",
    businessDescription: "",
  });

  /* ── Fetch admin ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${apiUrl}/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data || res.data;
        setAdmin(data);
        // storePhoto may be a relative path like "/uploads/store.jpg"
        if (data.storePhoto) setStorePhoto(data.storePhoto);
        setForm({
          name:                data.name                || "",
          phone:               data.phone               || "",
          storeName:           data.storeName           || "",
          storeAddress:        data.storeAddress        || "",
          GSTNo:               data.GSTNo               || "",
          website:             data.website             || "",
          city:                data.city                || "",
          state:               data.state               || "",
          pincode:             data.pincode             || "",
          businessDescription: data.businessDescription || "",
        });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  /* ── Photo picker ── */
  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setShowPhotoMenu(false);
    uploadPhoto(file);
    e.target.value = "";
  };

  const uploadPhoto = async (file) => {
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("storePhoto", file);
      const res = await axios.put(
        `${apiUrl}/admin/store-photo`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const saved = res.data.storePhoto || res.data.data?.storePhoto;
      if (saved) {
        setStorePhoto(saved);
        setPhotoPreview((current) => {
          if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
          return null;
        });
        setAdmin((current) => (current ? { ...current, storePhoto: saved } : current));
      }
    } catch (e) {
      console.error("Photo upload failed", e);
    }
    setUploadingPhoto(false);
  };

  const removePhoto = async () => {
    setShowPhotoMenu(false);
    try {
      await axios.delete(`${apiUrl}/admin/store-photo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStorePhoto(null);
      setPhotoPreview((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return null;
      });
      setAdmin((current) => (current ? { ...current, storePhoto: "" } : current));
    } catch (e) {
      console.error("Remove photo failed", e);
    }
  };

  /* ── Profile form ── */
  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { setSaveMsg("error"); return; }
    setSaving(true);
    setSaveMsg("");
    try {
      await axios.put(
        `${apiUrl}/admin/profile`,
        {
          name:                form.name.trim(),
          phone:               form.phone.trim(),
          storeName:           form.storeName.trim(),
          storeAddress:        form.storeAddress.trim(),
          GSTNo:               form.GSTNo.trim(),
          website:             form.website.trim(),
          city:                form.city.trim(),
          state:               form.state.trim(),
          pincode:             form.pincode.trim(),
          businessDescription: form.businessDescription.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdmin(u => ({ ...u, ...form }));
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
      name:                admin.name                || "",
      phone:               admin.phone               || "",
      storeName:           admin.storeName           || "",
      storeAddress:        admin.storeAddress        || "",
      GSTNo:               admin.GSTNo               || "",
      website:             admin.website             || "",
      city:                admin.city                || "",
      state:               admin.state               || "",
      pincode:             admin.pincode             || "",
      businessDescription: admin.businessDescription || "",
    });
    setEditing(false);
  };

  /* ── Helpers ── */
  const initials   = getInitials(admin?.name, "AD");
  const joinedDate = admin?.createdAt
    ? new Date(admin.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 size={28} className="text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-[#F3F6F9]"}`}>

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#42A5F5] px-5 pt-5 pb-16 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute bottom-2 left-6 w-20 h-20 rounded-full bg-white/5" />

        {/* Back */}
        <button
          onClick={() => navigate("/admin/settings")}
          className="flex items-center gap-1.5 text-white/70 text-sm mb-5 relative"
        >
          <ChevronLeft size={18} /> Settings
        </button>

        <div className="flex items-center gap-4 relative">

          {/* ── Store Photo Avatar ── */}
          <div className="relative flex-shrink-0">
            {/* Avatar circle */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg bg-white/20">
              {admin.storePhoto ? (
                <img
                  src={admin.storePhoto}
                  alt="Store"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white font-extrabold text-xl">{initials}</span>
                </div>
              )}
            </div>

            {/* Uploading overlay */}
            {uploadingPhoto && (
              <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                <Loader2 size={18} className="text-white animate-spin" />
              </div>
            )}

            {/* Camera button */}
            <button
              onClick={() => setShowPhotoMenu(v => !v)}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100"
            >
              <Camera size={13} className="text-[#1976D2]" />
            </button>

            {/* Photo action menu */}
            <AnimatePresence>
              {showPhotoMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-20 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 w-44"
                >
                  <button
                    onClick={() => { setShowPhotoMenu(false); fileInputRef.current?.click(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-gray-50"
                  >
                    <ImagePlus size={14} className="text-blue-600" />
                    {admin.storePhoto ? "Change Photo" : "Upload Photo"}
                  </button>
                  {admin.storePhoto && (
                    <button
                      onClick={removePhoto}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 border-t border-gray-50"
                    >
                      <Trash2 size={14} />
                      Remove Photo
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Name / email */}
          <div className="min-w-0 flex-1">
            <p className="text-white font-extrabold text-lg leading-tight truncate">{admin?.name}</p>
            <p className="text-white/60 text-xs mt-0.5 truncate">{admin?.email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex absolute right-2 items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                Owner
              </span>
              
              {joinedDate && (
                <span className="text-white/40 text-[10px]">Since {joinedDate}</span>
              )}
            </div>
          </div>
        </div>

        {/* Store name sub-label in header */}
        {admin?.storeName && (
          <div className="relative mt-3 flex items-center gap-2">
            <Store size={11} className="text-white/50" />
            <p className="text-white/60 text-xs font-semibold">{admin.storeName}</p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* Backdrop to close photo menu */}
      {showPhotoMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowPhotoMenu(false)} />
      )}

      {/* ── Body ── */}
      <div className="absolute -mt-10 pb-12 w-full px-4 space-y-3">

        {/* Toast */}
        <AnimatePresence>
          {saveMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm ${
                saveMsg === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}
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
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Profile</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">Account & Store Details</p>
            </div>

            {!editing ? (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3.5 py-2 rounded-xl text-xs font-bold"
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
                  className="flex items-center gap-1 bg-[#1976D2] text-white px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-60"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  {saving ? "Saving…" : "Save"}
                </motion.button>
              </div>
            )}
          </div>

          {/* Card body */}
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
                  <SectionLabel>Account Info</SectionLabel>
                  <EditField icon={User}  label="Admin Name" name="name"  value={form.name}  onChange={handleChange} placeholder="Your name" />
                  <EditField icon={Mail}  label="Email"      name="email" value={admin?.email} locked />
                  <EditField icon={Phone} label="Phone"      name="phone" value={form.phone}  onChange={handleChange} placeholder="Contact number" />

                  <SectionLabel>Store Info</SectionLabel>
                  <EditField icon={Store}     label="Store Name"            name="storeName"           value={form.storeName}           onChange={handleChange} placeholder="Your store name" />
                  <EditField icon={MapPin}    label="Store Address"         name="storeAddress"        value={form.storeAddress}        onChange={handleChange} placeholder="Store street address" />
                  <EditField icon={FileText}  label="GST Number"            name="GSTNo"               value={form.GSTNo}               onChange={handleChange} placeholder="GST registration number" />
                  <EditField icon={Globe}     label="Website"               name="website"             value={form.website}             onChange={handleChange} placeholder="https://yourstore.com" />
                  <EditField icon={AlignLeft} label="Business Description"  name="businessDescription" value={form.businessDescription} onChange={handleChange} placeholder="Brief about your business" />

                  <SectionLabel>Location</SectionLabel>
                  <EditField icon={Building2} label="City"    name="city"    value={form.city}    onChange={handleChange} placeholder="City" />
                  <EditField icon={MapPin}    label="State"   name="state"   value={form.state}   onChange={handleChange} placeholder="State" />
                  <EditField icon={Hash}      label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" />
                </>
              ) : (
                <>
                  <SectionLabel>Account Info</SectionLabel>
                  <InfoRow icon={User}   label="Admin Name" value={admin?.name} />
                  <InfoRow icon={Mail}   label="Email"      value={admin?.email} />
                  <InfoRow icon={Phone}  label="Phone"      value={admin?.phone} />
                  <InfoRow icon={Shield} label="Role"       value="Owner / Administrator" />

                  <SectionLabel>Store Info</SectionLabel>
                  <InfoRow icon={Store}     label="Store Name"           value={admin?.storeName} />
                  <InfoRow icon={MapPin}    label="Store Address"        value={admin?.storeAddress} />
                  <InfoRow icon={FileText}  label="GST Number"           value={admin?.GSTNo} />
                  <InfoRow icon={Globe}     label="Website"              value={admin?.website} />
                  <InfoRow icon={AlignLeft} label="Business Description" value={admin?.businessDescription} />

                  <SectionLabel>Location</SectionLabel>
                  <InfoRow
                    icon={MapPin}
                    label="Address"
                    value={[admin?.city, admin?.state, admin?.pincode].filter(Boolean).join(", ")}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
