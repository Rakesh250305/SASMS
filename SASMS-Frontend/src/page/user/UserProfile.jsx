import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Edit3, Check, X,
  Loader2, Shield, Building2, Hash, Navigation, AlignLeft, Users
} from "lucide-react";
import BottomNav from "../../component/BottomNav";

/* ────────────────────────────────────────────
   InfoRow — read-only display
──────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-sm text-slate-700 font-semibold mt-0.5">{value}</p>
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
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${locked ? "bg-gray-100" : "bg-emerald-50"}`}>
        <Icon size={14} className={locked ? "text-gray-400" : "text-emerald-600"} />
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
            className="w-full text-sm text-slate-800 font-medium bg-emerald-50/50 border border-emerald-100 rounded-xl px-3 py-2 outline-none focus:border-emerald-400 focus:bg-white transition-all placeholder-gray-300"
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
export default function UserProfile() {
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(""); // "success" | "error" | ""

  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "", state: "", pincode: "",
    bio: "", gender: ""
  });

  /* Fetch user */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${apiUrl}/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.data || res.data;
        setUser(data);
        setForm({
          name:    data.name    || "",
          phone:   data.phone   || "",
          address: data.address || "",
          city:    data.city    || "",
          state:   data.state   || "",
          pincode: data.pincode || "",
          bio:     data.bio     || "",
          gender:  data.gender  || "",
        });
      } catch (e) {
        if (e.response?.status === 401) navigate("/login");
      }
      setLoading(false);
    })();
  }, []);

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${apiUrl}/user/profile`,
        {
          name:    form.name,
          phone:   form.phone,
          address: form.address,
          city:    form.city,
          state:   form.state,
          pincode: form.pincode,
          bio:     form.bio,
          gender:  form.gender,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(u => ({ ...u, ...form }));
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
      name:    user.name    || "",
      phone:   user.phone   || "",
      address: user.address || "",
      city:    user.city    || "",
      state:   user.state   || "",
      pincode: user.pincode || "",
      bio:     user.bio     || "",
      gender:  user.gender  || "",
    });
    setEditing(false);
  };

  const initials =
    user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      })
    : null;

  /* Compose a single address string for the header badge */
  const locationSummary = [user?.city, user?.state]
    .filter(Boolean).join(", ");

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 size={28} className="text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F6F9]">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-5 pt-10 pb-16 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute bottom-2 left-6 w-20 h-20 rounded-full bg-white/5" />

        <div className="flex items-center gap-4 relative">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white font-extrabold text-xl">{initials}</span>
          </div>

          <div className="min-w-0">
            <p className="text-white font-extrabold text-lg leading-tight truncate">{user?.name}</p>
            <p className="text-white/60 text-xs mt-0.5 truncate">{user?.email}</p>
            <div className="flex items-start gap-2 mt-1.5 flex-wrap">
              <span className="absolute right-0 inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                Active Account
              </span>
              
              {joinedDate && (
                <span className="text-white/40 text-[10px]">Since {joinedDate}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
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
              <p className="text-sm font-bold text-slate-700 mt-0.5">Personal & Address Details</p>
            </div>

            {!editing ? (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3.5 py-2 rounded-xl text-xs font-bold"
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
                  className="flex items-center gap-1 bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-60"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  {saving ? "Saving…" : "Save"}
                </motion.button>
              </div>
            )}
          </div>

          {/* Card body — animated switch between view / edit */}
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
                  <SectionLabel>Personal Info</SectionLabel>
                  <EditField
                    icon={User} label="Full Name" name="name"
                    value={form.name} onChange={handleChange}
                    placeholder="Your full name"
                  />
                  <EditField
                    icon={Mail} label="Email" name="email"
                    value={user?.email} locked
                  />
                  <EditField
                    icon={Phone} label="Phone" name="phone"
                    value={form.phone} onChange={handleChange}
                    placeholder="Your phone number"
                  />
                  <div className="flex items-start gap-3 py-3 border-b border-slate-50">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users size={14} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Gender</p>
                      <div className="flex gap-2">
                        {["Male", "Female", "Other"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, gender: g.toLowerCase() }))}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all
                              ${form.gender === g.toLowerCase()
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-gray-400 border-gray-200"}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <EditField
                    icon={AlignLeft} label="Bio" name="bio"
                    value={form.bio} onChange={handleChange}
                    placeholder="Short bio about yourself"
                  />

                  <SectionLabel>Primary Address</SectionLabel>
                  <EditField
                    icon={MapPin} label="Address" name="address"
                    value={form.address} onChange={handleChange}
                    placeholder="Street / locality / area"
                  />
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
                </>
              ) : (
                <>
                  <SectionLabel>Personal Info</SectionLabel>
                  <InfoRow icon={User}      label="Full Name" value={user?.name} />
                  <InfoRow icon={Mail}      label="Email"     value={user?.email} />
                  <InfoRow icon={Phone}     label="Phone"     value={user?.phone} />
                  <InfoRow icon={Users}     label="Gender"    value={user?.gender} />
                  <InfoRow icon={AlignLeft} label="Bio"       value={user?.bio} />

                  <SectionLabel>Primary Address</SectionLabel>
                  <InfoRow
                    icon={MapPin}
                    label="Address"
                    value={
                      [user?.address, user?.city, user?.state, user?.pincode]
                        .filter(Boolean)
                        .join(", ")
                    }
                  />
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