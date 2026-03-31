import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, User, Mail, Phone,
  MapPin, Briefcase, LogOut, Shield, Star,
  Edit3, Check, X, Loader2,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";

/* ── read-only info row ── */
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-700 font-medium mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  );
}

/* ── editable field ── */
function EditField({ icon: Icon, label, name, value, onChange, type = "text", locked }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${locked ? "bg-gray-100" : "bg-purple-50"}`}>
        <Icon size={13} className={locked ? "text-gray-400" : "text-purple-600"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
        {locked ? (
          <p className="text-sm text-gray-400 font-medium">{value}</p>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full text-sm text-slate-800 font-medium bg-purple-50/60 border border-purple-100 rounded-lg px-3 py-1.5 outline-none focus:border-purple-400 focus:bg-white transition-all placeholder-gray-300"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )}
        {locked && (
          <p className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-1">
            <Shield size={9} /> Cannot be changed
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProviderProfile() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [form, setForm] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get(`${apiUrl}/provider`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = r.data.data || r.data.provider || r.data;
        setProvider(data);
        setForm({
          description: data.description || "",
          phone: data.phone || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          experience: data.experience || "",
          serviceType: data.serviceType || "",
        });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const r = await axios.put(
        `${apiUrl}/provider/profile`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = r.data.data || r.data.provider || r.data;
      setProvider(updated);
      setEditing(false);
      setSaveMsg("success");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      console.error(e);
      setSaveMsg("error");
      setTimeout(() => setSaveMsg(""), 3000);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    // reset form to last saved provider data
    setForm({
      description : provider?.description || "",
      phone: provider?.phone || "",
      city: provider?.city || "",
      state: provider?.state || "",
      pincode: provider?.pincode || "",
      experience: provider?.experience || "",
      serviceType: provider?.serviceType || "",
    });
    setEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const initials =
    provider?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "PR";

  return (
    <div className="flex-1 flex flex-col relative h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#86198f] to-[#c026d3] h-[20vh] px-5 pt-8 pb-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-4 w-14 h-14 rounded-full bg-white/5" />
        <div className="flex items-center justify-between relative">
          <div>
            <h1 className="text-xl font-extrabold text-white">My Profile</h1>
            <p className="text-white/50 text-xs mt-0.5">Account details</p>
          </div>
          {!loading && !editing && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-all"
            >
              <Edit3 size={13} />
              Edit
            </motion.button>
          )}
          {editing && (
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleCancel}
                className="flex items-center gap-1.5 bg-white/20 border border-white/30 px-3 py-2 rounded-xl text-white text-xs font-bold"
              >
                <X size={13} />
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl text-[#86198f] text-xs font-bold shadow disabled:opacity-60"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {saving ? "Saving…" : "Save"}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 px-4 pb-28 space-y-4 max-w-xl mx-auto overflow-y-auto">

        {/* Toast */}
        <AnimatePresence>
          {saveMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
                saveMsg === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}
            >
              {saveMsg === "success" ? (
                <><Check size={15} /> Profile updated successfully!</>
              ) : (
                <><X size={15} /> Failed to save. Please try again.</>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar card */}
        <div className="bg-white relative rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          {loading ? (
            <div className="w-16 h-16 rounded-2xl bg-gray-100 animate-pulse flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#86198f] to-[#c026d3] flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-extrabold text-xl">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0 ">
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2 animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-base font-extrabold text-slate-800">{provider?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{provider?.email}</p>
                  <span className={`absolute top-5 right-5 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    provider?.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${provider?.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                    {provider?.status || "Active"}
                  </span>
                  <span className="text-[10px] text-gray-400">Joined On: {new Date(provider?.createdAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Info / Edit card */}
        <AnimatePresence mode="wait">
          {!loading && provider && (
            <motion.div
              key={editing ? "edit" : "view"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {editing ? "Edit Info" : "Account Info"}
                </p>
                {editing && (
                  <span className="text-[9px] font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                    Name & Email are locked
                  </span>
                )}
              </div>

              {editing ? (
                <>
                  <EditField icon={User}      label="Full Name"    name="name"        value={provider.name}        onChange={handleChange} locked />
                  <EditField icon={Mail}      label="Email"        name="email"       value={provider.email}       onChange={handleChange} locked />
                  <EditField icon={Briefcase} label="Description"  name="description" value={form.description} onChange={handleChange} />
                  <EditField icon={Phone}     label="Phone"        name="phone"       value={form.phone}           onChange={handleChange} />
                  <EditField icon={MapPin}    label="City"         name="city"        value={form.city}            onChange={handleChange} />
                  <EditField icon={MapPin}    label="State"        name="state"       value={form.state}           onChange={handleChange} />
                  <EditField icon={MapPin}    label="Pincode"      name="pincode"     value={form.pincode}         onChange={handleChange} />
                  <EditField icon={Briefcase} label="Experience"   name="experience"  value={form.experience}      onChange={handleChange} />
                  <EditField icon={Star}      label="Service Type" name="serviceType" value={form.serviceType}     onChange={handleChange} />
                </>
              ) : (
                <>
                  <InfoRow icon={User}      label="Full Name"     value={provider.name} />
                  <InfoRow icon={Mail}      label="Email"         value={provider.email} />
                  <InfoRow icon={Briefcase} label="Description"   value={provider.description} />
                  <InfoRow icon={Phone}     label="Phone"         value={provider.phone} />
                  <InfoRow icon={MapPin}    label="Location"      value={[provider.city, provider.state, provider.pincode].filter(Boolean).join(", ")} />
                  <InfoRow icon={Briefcase} label="Experience"    value={provider.experience + " Years"} />
                  <InfoRow icon={Star}      label="Service Types" value={provider.serviceType?.join(", ")} />
                  <InfoRow icon={Shield}    label="Tenant ID"     value={provider.tenantId} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {!editing && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Account</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 py-3 text-red-500"
            >
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <LogOut size={15} className="text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-red-500">Sign Out</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Log out of your account</p>
              </div>
            </button>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}