import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Edit3, Check, X,
  Loader2, Plus, Trash2, Eye, Home,
  Briefcase, Shield
} from "lucide-react";
import BottomNav from "../../component/BottomNav";

/* ────────────────────────────────────────────
   Sub-components
──────────────────────────────────────────── */

const labelIcons = { home: Home, office: Briefcase, other: MapPin };
const labelColors = {
  home: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  office: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  other: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
};

/* ────────────────────────────────────────────
   Address Form Modal
──────────────────────────────────────────── */
function AddressModal({ open, onClose, onSave, initial, isEdit }) {
  const empty = { label: "home", fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(initial || empty);
  }, [open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const field = (k, placeholder, icon) => (
    <div className="flex items-center gap-3 border-b border-slate-50 py-2.5 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <input
        value={form[k] || ""}
        onChange={e => set(k, e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm bg-transparent outline-none placeholder-gray-300 text-slate-700 font-medium"
      />
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="w-full bg-white rounded-t-3xl pt-2 p-6 max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{isEdit ? "Edit Address" : "Add New Address"}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Fill in the delivery details</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={15} className="text-gray-500" />
              </button>
            </div>

            {/* Label Selector */}
            <div className="flex gap-2 mb-5">
              {["home", "office", "other"].map(l => {
                const LIcon = labelIcons[l];
                const c = labelColors[l];
                return (
                  <button
                    key={l}
                    onClick={() => set("label", l)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all capitalize
                      ${form.label === l ? `${c.bg} ${c.text} ${c.border}` : "bg-white border-gray-200 text-gray-400"}`}
                  >
                    <LIcon size={11} />
                    {l}
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 rounded-2xl px-4 mb-4">
              {field("fullName", "Full Name", <User size={13} className="text-emerald-600" />)}
              {field("phone", "Phone Number", <Phone size={13} className="text-emerald-600" />)}
            </div>

            <div className="bg-slate-50 rounded-2xl px-4 mb-4">
              {field("addressLine1", "Address Line 1", <MapPin size={13} className="text-emerald-600" />)}
              {field("addressLine2", "Address Line 2 (optional)", <MapPin size={13} className="text-gray-300" />)}
            </div>

            <div className="bg-slate-50 rounded-2xl px-4 mb-6">
              {field("city", "City", <MapPin size={13} className="text-emerald-600" />)}
              {field("state", "State", <MapPin size={13} className="text-emerald-600" />)}
              {field("pincode", "Pincode", <MapPin size={13} className="text-emerald-600" />)}
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {saving ? "Saving…" : (isEdit ? "Update" : "Save Address")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────
   Address Card
──────────────────────────────────────────── */
function AddressCard({ addr, onEdit, onDelete, onView }) {
  const LIcon = labelIcons[addr.label] || MapPin;
  const c = labelColors[addr.label] || labelColors.other;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
    >
      {/* Label badge */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <LIcon size={11} className={c.text} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}>{addr.label}</span>
      </div>

      {/* Name · Phone */}
      <p className="text-sm font-bold text-slate-800">
        {addr.fullName}
        <span className="text-gray-300 font-normal mx-1.5">·</span>
        <span className="text-gray-500 font-semibold">{addr.phone}</span>
      </p>

      {/* Address line */}
      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""},&nbsp;
        {addr.city}, {addr.state} – {addr.pincode}
      </p>

      {/* Divider */}
      <div className="border-t border-gray-50 mt-3 mb-2" />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {[
          { label: "View",   action: () => onView(addr),   bg: "bg-blue-50",    text: "text-blue-600",    icon: Eye    },
          { label: "Edit",   action: () => onEdit(addr),   bg: "bg-emerald-50", text: "text-emerald-600", icon: Edit3  },
          { label: "Delete", action: () => onDelete(addr), bg: "bg-red-50",     text: "text-red-500",     icon: Trash2 },
        ].map(({ label, action, bg, text, icon: Icon }, i, arr) => (
          <button
            key={label}
            onClick={action}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold ${bg} ${text} transition-opacity active:opacity-70
              ${i === 0 ? "rounded-l-xl" : ""} ${i === arr.length - 1 ? "rounded-r-xl" : "border-r border-white"}`}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   View Address Sheet
──────────────────────────────────────────── */
function ViewAddressSheet({ addr, onClose }) {
  if (!addr) return null;
  const LIcon = labelIcons[addr.label] || MapPin;
  const c = labelColors[addr.label] || labelColors.other;
  return (
    <AnimatePresence>
      {addr && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="w-full bg-white rounded-t-3xl pt-2 p-6"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <LIcon size={18} className={c.text} />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{addr.label}</p>
                  <p className="text-base font-bold text-slate-800">{addr.fullName}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={15} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4 bg-slate-50 rounded-2xl p-4">
              {[
                { label: "Phone", value: addr.phone },
                { label: "Address Line 1", value: addr.addressLine1 },
                { label: "Address Line 2", value: addr.addressLine2 },
                { label: "City", value: addr.city },
                { label: "State", value: addr.state },
                { label: "Pincode", value: addr.pincode },
              ].filter(r => r.value).map(r => (
                <div key={r.label} className="flex justify-between items-start">
                  <p className="text-xs text-gray-400 font-semibold w-28 flex-shrink-0">{r.label}</p>
                  <p className="text-sm text-slate-700 font-semibold text-right flex-1">{r.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────
   Delete Confirm Modal
──────────────────────────────────────────── */
function DeleteModal({ open, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm items-end flex z-50" >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="w-full bg-white rounded-t-3xl pt-2 p-6 h-auto overflow-y-auto"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 text-center mb-1">Delete Address?</h3>
            <p className="text-sm text-gray-400 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500">
                Cancel
              </button>
              <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────
   Main Component
──────────────────────────────────────────── */
export default function UserAddress() {
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [addressModal, setAddressModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [viewingAddr, setViewingAddr] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* Fetch user */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${apiUrl}/user`, { headers: { Authorization: `Bearer ${token}` } });
        const data = res.data.data || res.data;
        setUser(data);
      } catch (e) {
        if (e.response?.status === 401) navigate("/login");
      }
      setLoading(false);
    })();
  }, []);

  /* Fetch addresses after user loaded */
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${apiUrl}/user/address`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAddresses(res.data.addresses || []));
  }, [user]);

  const saveAddress = async (addrForm) => {
    if (editingAddr) {
      const res = await axios.put(`${apiUrl}/user/address/${editingAddr._id}`, addrForm, { headers: { Authorization: `Bearer ${token}` } });
      setAddresses(prev => prev.map(a => a._id === editingAddr._id ? res.data.address : a));
    } else {
      const res = await axios.post(`${apiUrl}/user/address`, addrForm, { headers: { Authorization: `Bearer ${token}` } });
      setAddresses(prev => [...prev, res.data.address]);
    }
    setAddressModal(false);
    setEditingAddr(null);
  };

  const deleteAddress = async () => {
    await axios.delete(`${apiUrl}/user/address/${deleteTarget._id}`, { headers: { Authorization: `Bearer ${token}` } });
    setAddresses(prev => prev.filter(a => a._id !== deleteTarget._id));
    setDeleteTarget(null);
  };

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

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

        {/* Avatar + name */}
        <div className="flex items-center gap-4 relative">
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white font-extrabold text-xl">{initials}</span>
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-tight">{user?.name}</p>
            <p className="text-white/60 text-xs mt-0.5">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              Active Account
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="absolute -mt-10 pb-28 space-y-4 w-full">

        {/* ── Addresses Card ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-50">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Saved Addresses</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{addresses.length} {addresses.length === 1 ? "Address" : "Addresses"}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => { setEditingAddr(null); setAddressModal(true); }}
              className="flex items-center gap-1.5 bg-white text-emerald-600 border-dashed border-1 hover:bg-emerald-600 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-emerald-200"
            >
              <Plus size={13} /> Add New
            </motion.button>
          </div>

          {/* Address list */}
          <div className="p-4 space-y-3">
            {addresses.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <MapPin size={22} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-300">No saved addresses yet</p>
                <p className="text-xs text-gray-300 mt-1">Tap "Add New" to save one</p>
              </div>
            ) : (
              <AnimatePresence>
                {addresses.map(addr => (
                  <AddressCard
                    key={addr._id}
                    addr={addr}
                    onEdit={a => { setEditingAddr(a); setAddressModal(true); }}
                    onDelete={a => setDeleteTarget(a)}
                    onView={a => setViewingAddr(a)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>

      {/* ── Modals ── */}
      <AddressModal
        open={addressModal}
        onClose={() => { setAddressModal(false); setEditingAddr(null); }}
        onSave={saveAddress}
        initial={editingAddr}
        isEdit={!!editingAddr}
      />

      <ViewAddressSheet addr={viewingAddr} onClose={() => setViewingAddr(null)} />

      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteAddress}
      />

      <BottomNav />
    </div>
  );
}