import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  User,
  Phone,
  MapPin,
  Edit3,
  Check,
  X,
  Loader2,
  Plus,
  Trash2,
  Eye,
  Home,
  Briefcase,
} from "lucide-react";
import BottomNav from "../../component/BottomNav";
import useDarkMode from "../../utils/useDarkMode";

const emptyAddress = {
  label: "home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
};

const labelIcons = { home: Home, office: Briefcase, other: MapPin };
const labelColors = {
  home: {
    light: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    dark: { bg: "bg-blue-950/60", text: "text-blue-300", border: "border-blue-900/70" },
  },
  office: {
    light: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
    dark: { bg: "bg-amber-950/60", text: "text-amber-300", border: "border-amber-900/70" },
  },
  other: {
    light: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
    dark: { bg: "bg-violet-950/60", text: "text-violet-300", border: "border-violet-900/70" },
  },
};

function getLabelTheme(label, darkMode) {
  const palette = labelColors[label] || labelColors.other;
  return darkMode ? palette.dark : palette.light;
}

function validateAddress(form) {
  if (!form.fullName.trim()) return "Full name is required";
  if (!form.phone.trim()) return "Phone number is required";
  if (!/^\d{10}$/.test(form.phone.trim())) return "Phone number must be 10 digits";
  if (!form.addressLine1.trim()) return "Address line 1 is required";
  if (!form.city.trim()) return "City is required";
  if (!form.state.trim()) return "State is required";
  if (!form.pincode.trim()) return "Pincode is required";
  if (!/^\d{6}$/.test(form.pincode.trim())) return "Pincode must be 6 digits";
  return "";
}

function AddressModal({ open, onClose, onSave, initial, isEdit, darkMode }) {
  const [form, setForm] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...emptyAddress, ...initial } : emptyAddress);
    }
  }, [open, initial]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const field = (key, placeholder, icon, type = "text", maxLength) => (
    <div className={`flex items-center gap-3 py-3 last:border-0 border-b ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-emerald-950/60" : "bg-emerald-50"}`}>
        {icon}
      </div>
      <input
        type={type}
        value={form[key] || ""}
        maxLength={maxLength}
        onChange={(e) => setField(key, e.target.value)}
        placeholder={placeholder}
        className={`flex-1 text-sm bg-transparent outline-none font-medium ${darkMode ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-gray-300"}`}
      />
    </div>
  );

  const handleSave = async () => {
    const validationError = validateAddress(form);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };

    try {
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 24 }}
            className={`w-full rounded-t-3xl pt-2 p-6 max-h-[72vh] overflow-y-auto border-t ${darkMode ? "bg-gray-900 border-slate-800" : "bg-white border-slate-100"}`}
          >
            <div className={`w-10 h-1 rounded-full mx-auto mb-5 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`} />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className={`font-bold text-lg ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                  {isEdit ? "Edit Address" : "Add New Address"}
                </h3>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-gray-400"}`}>
                  Fill in the delivery details
                </p>
              </div>
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${darkMode ? "bg-gray-800 text-slate-300 border border-slate-800" : "bg-gray-100 text-gray-500"}`}
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex gap-2 mb-5">
              {["home", "office", "other"].map((label) => {
                const LabelIcon = labelIcons[label];
                const theme = getLabelTheme(label, darkMode);
                const selected = form.label === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setField("label", label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
                      selected
                        ? `${theme.bg} ${theme.text} ${theme.border}`
                        : darkMode
                          ? "bg-gray-800 border-slate-800 text-slate-400"
                          : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    <LabelIcon size={11} />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className={`rounded-2xl px-4 mb-4 border ${darkMode ? "bg-gray-800 border-slate-800" : "bg-slate-50 border-transparent"}`}>
              {field("fullName", "Full Name", <User size={13} className="text-emerald-500" />)}
              {field("phone", "Phone Number", <Phone size={13} className="text-emerald-500" />, "tel", 10)}
            </div>

            <div className={`rounded-2xl px-4 mb-4 border ${darkMode ? "bg-gray-800 border-slate-800" : "bg-slate-50 border-transparent"}`}>
              {field("addressLine1", "Address Line 1", <MapPin size={13} className="text-emerald-500" />)}
              {field("addressLine2", "Address Line 2 (optional)", <MapPin size={13} className={darkMode ? "text-slate-500" : "text-gray-300"} />)}
            </div>

            <div className={`rounded-2xl px-4 mb-6 border ${darkMode ? "bg-gray-800 border-slate-800" : "bg-slate-50 border-transparent"}`}>
              {field("city", "City", <MapPin size={13} className="text-emerald-500" />)}
              {field("state", "State", <MapPin size={13} className="text-emerald-500" />)}
              {field("pincode", "Pincode", <MapPin size={13} className="text-emerald-500" />, "text", 6)}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 py-3 rounded-2xl border text-sm font-bold ${darkMode ? "border-slate-800 text-slate-300 bg-gray-800" : "border-gray-200 text-gray-500 bg-white"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {saving ? "Saving..." : isEdit ? "Update" : "Save Address"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AddressCard({ addr, onEdit, onDelete, onView, darkMode }) {
  const LabelIcon = labelIcons[addr.label] || MapPin;
  const theme = getLabelTheme(addr.label, darkMode);

  return (
    <motion.div
      layout
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className={`rounded-2xl border p-4 ${darkMode ? "bg-gray-700 border-slate-800 shadow-[0_18px_40px_rgba(2,6,23,0.28)]" : "bg-white border-gray-100 shadow-sm"}`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <LabelIcon size={11} className={theme.text} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.text}`}>{addr.label}</span>
      </div>

      <p className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
        {addr.fullName}
        <span className={darkMode ? "text-slate-600 font-normal mx-1.5" : "text-gray-300 font-normal mx-1.5"}>.</span>
        <span className={darkMode ? "text-slate-400 font-semibold" : "text-gray-500 font-semibold"}>{addr.phone}</span>
      </p>

      <p className={`text-xs mt-1 leading-relaxed ${darkMode ? "text-slate-400" : "text-gray-400"}`}>
        {addr.addressLine1}
        {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
      </p>

      <div className={`mt-3 mb-2 border-t ${darkMode ? "border-slate-800" : "border-gray-50"}`} />

      <div className="flex items-center gap-2">
        {[
          { label: "View", action: () => onView(addr), classes: darkMode ? "bg-gray-900 text-blue-300" : "bg-blue-50 text-blue-600", icon: Eye },
          { label: "Edit", action: () => onEdit(addr), classes: darkMode ? "bg-gray-900 text-emerald-300" : "bg-emerald-50 text-emerald-600", icon: Edit3 },
          { label: "Delete", action: () => onDelete(addr), classes: darkMode ? "bg-gray-900 text-red-300" : "bg-red-50 text-red-500", icon: Trash2 },
        ].map(({ label, action, classes, icon: Icon }, index, arr) => (
          <button
            key={label}
            onClick={action}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition-opacity active:opacity-70 ${classes} ${
              index === 0 ? "rounded-l-xl" : ""
            } ${index === arr.length - 1 ? "rounded-r-xl" : darkMode ? "border-r border-slate-800" : "border-r border-white"}`}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function ViewAddressSheet({ addr, onClose, darkMode }) {
  if (!addr) return null;

  const LabelIcon = labelIcons[addr.label] || MapPin;
  const theme = getLabelTheme(addr.label, darkMode);

  return (
    <AnimatePresence>
      {addr && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className={`w-full rounded-t-3xl pt-2 p-6 border-t ${darkMode ? "bg-gray-900 border-slate-800" : "bg-white border-slate-100"}`}
          >
            <div className={`w-10 h-1 rounded-full mx-auto mb-5 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`} />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.bg}`}>
                  <LabelIcon size={18} className={theme.text} />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>{addr.label}</p>
                  <p className={`text-base font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{addr.fullName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-800 text-slate-300 border border-slate-800" : "bg-gray-100 text-gray-500"}`}
              >
                <X size={15} />
              </button>
            </div>
            <div className={`space-y-4 rounded-2xl p-4 border ${darkMode ? "bg-gray-800 border-slate-800" : "bg-slate-50 border-transparent"}`}>
              {[
                { label: "Phone", value: addr.phone },
                { label: "Address Line 1", value: addr.addressLine1 },
                { label: "Address Line 2", value: addr.addressLine2 },
                { label: "City", value: addr.city },
                { label: "State", value: addr.state },
                { label: "Pincode", value: addr.pincode },
              ]
                .filter((row) => row.value)
                .map((row) => (
                  <div key={row.label} className="flex justify-between items-start gap-4">
                    <p className={`text-xs font-semibold w-28 flex-shrink-0 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{row.label}</p>
                    <p className={`text-sm font-semibold text-right flex-1 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{row.value}</p>
                  </div>
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DeleteModal({ open, onClose, onConfirm, darkMode, deleting }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className={`w-full rounded-t-3xl pt-2 p-6 border-t ${darkMode ? "bg-gray-900 border-slate-800" : "bg-white border-slate-100"}`}
          >
            <div className={`w-10 h-1 rounded-full mx-auto mb-5 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`} />
            <h3 className={`font-bold text-lg text-center mb-1 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Delete Address?</h3>
            <p className={`text-sm text-center mb-6 ${darkMode ? "text-slate-400" : "text-gray-400"}`}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={deleting}
                className={`flex-1 py-3 rounded-2xl border text-sm font-bold ${darkMode ? "border-slate-800 text-slate-300 bg-gray-800" : "border-gray-200 text-gray-500 bg-white"}`}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function UserAddress() {
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [addressModal, setAddressModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [viewingAddr, setViewingAddr] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, addressRes] = await Promise.all([
          axios.get(`${apiUrl}/user`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/user/address`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const userData = userRes.data.data || userRes.data;
        setUser(userData);
        setAddresses(addressRes.data.addresses || []);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
          return;
        }

        toast.error(error.response?.data?.message || "Unable to load addresses right now");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, navigate, token]);

  const closeAddressModal = () => {
    setAddressModal(false);
    setEditingAddr(null);
  };

  const saveAddress = async (addrForm) => {
    try {
      if (editingAddr) {
        const res = await axios.put(`${apiUrl}/user/address/${editingAddr._id}`, addrForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedAddress = res.data.address || res.data.data || addrForm;
        setAddresses((prev) => prev.map((address) => (address._id === editingAddr._id ? updatedAddress : address)));
        toast.success("Address updated successfully");
      } else {
        const res = await axios.post(`${apiUrl}/user/address`, addrForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const createdAddress = res.data.address || res.data.data || addrForm;
        setAddresses((prev) => [createdAddress, ...prev]);
        toast.success("Address added successfully");
      }

      closeAddressModal();
    } catch (error) {
      toast.error(error.response?.data?.message || (editingAddr ? "Could not update address" : "Could not add address"));
      throw error;
    }
  };

  const deleteAddress = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await axios.delete(`${apiUrl}/user/address/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses((prev) => prev.filter((address) => address._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.success("Address deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete address");
    } finally {
      setDeleting(false);
    }
  };

  const initials = user?.name?.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "NA";

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-slate-50"}`}>
        <Loader2 size={28} className="text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-[#F3F6F9]"}`}>
      <div className={`px-5 pt-10 pb-16 relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 `}>
        <div className="absolute bottom-2 left-6 w-20 h-20 rounded-full bg-white/5" />

        <div className="flex items-center gap-4 relative">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/20 flex items-center justify-center shadow-lg">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={initials} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-extrabold text-xl">{initials}</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-tight">{user?.name}</p>
            <p className="text-white/60 text-xs mt-0.5">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 bg-white/15 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              Active Account
            </span>
          </div>
        </div>
      </div>

      <div className="-mt-10 pb-28 space-y-4 w-full relative">
        <div className={`rounded-3xl mx-2 border overflow-hidden ${darkMode ? "bg-gray-800 border-slate-800 shadow-[0_24px_60px_rgba(2,6,23,0.36)]" : "bg-white border-gray-100 shadow-sm"}`}>
          <div className={`flex items-center justify-between px-5 pt-5 pb-3 border-b ${darkMode ? "border-slate-800" : "border-slate-50"}`}>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Saved Addresses</p>
              <p className={`text-sm font-bold mt-0.5 ${darkMode ? "text-slate-200" : "text-slate-600"}`}>
                {addresses.length} {addresses.length === 1 ? "Address" : "Addresses"}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                setEditingAddr(null);
                setAddressModal(true);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border ${darkMode ? "bg-gray-900 border-slate-800 text-emerald-300 hover:bg-emerald-600 hover:text-white" : "bg-white border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white"}`}
            >
              <Plus size={13} /> Add New
            </motion.button>
          </div>

          <div className="p-4 space-y-3">
            {addresses.length === 0 ? (
              <div className="py-10 text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${darkMode ? "bg-gray-900 border border-slate-800" : "bg-gray-50"}`}>
                  <MapPin size={22} className={darkMode ? "text-slate-500" : "text-gray-300"} />
                </div>
                <p className={`text-sm font-bold ${darkMode ? "text-slate-300" : "text-gray-400"}`}>No saved addresses yet</p>
                <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-gray-300"}`}>Tap "Add New" to save one</p>
              </div>
            ) : (
              <AnimatePresence>
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr._id}
                    addr={addr}
                    darkMode={darkMode}
                    onEdit={(address) => {
                      setEditingAddr(address);
                      setAddressModal(true);
                    }}
                    onDelete={(address) => setDeleteTarget(address)}
                    onView={(address) => setViewingAddr(address)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <AddressModal
        open={addressModal}
        onClose={closeAddressModal}
        onSave={saveAddress}
        initial={editingAddr}
        isEdit={!!editingAddr}
        darkMode={darkMode}
      />

      <ViewAddressSheet addr={viewingAddr} onClose={() => setViewingAddr(null)} darkMode={darkMode} />

      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteAddress}
        darkMode={darkMode}
        deleting={deleting}
      />

      <BottomNav role="user" />
    </div>
  );
}
