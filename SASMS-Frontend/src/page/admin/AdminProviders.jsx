import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Plus,
  Search,
  Star,
  X,
  Check,
  UserCog,
  User,
  Text,
  Mail,
  Phone,
  Lock,
  MapIcon,
  Hash,
  Building,
  BookAIcon,
  Edit,
  MapPin,
  Shield,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "../../component/StatusBadge";
import InputField from "../../component/InputField";
import { toast } from "react-toastify";
import axios from "axios";
import useDarkMode from "../../utils/useDarkMode";

export default function AdminProviders() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [providerList, setProviderList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const { darkMode } = useDarkMode();

  const emptyProvider = {
    name: "", description: "", email: "", phone: " ",
    password: "", city: "", state: "", pincode: "",
    experience: "", serviceType: [],
  };
  const [newProvider, setNewProvider] = useState(emptyProvider);

  /* ── fetch ── */
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await axios.get(`${apiUrl}/admin/provider`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProviderList(res.data.data || []);
      } catch {
        toast.error("Failed to fetch providers");
      }
    };
    fetchProviders();
  }, [apiUrl, token]);

  /* ── validation ── */
  const validateProvider = (isEdit = false) => {
    const e = {};
    if (!newProvider.name.trim()) e.name = "Name is required";
    if (!newProvider.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(newProvider.email)) e.email = "Invalid email";
    if (!newProvider.phone.trim()) e.phone = "Phone is required";
    else if (!/^[0-9]{10}$/.test(newProvider.phone)) e.phone = "Must be 10 digits";
    if (!isEdit && !newProvider.password.trim()) e.password = "Password is required";
    else if (!isEdit && newProvider.password.length < 6) e.password = "Min 6 characters";
    if (!newProvider.city.trim()) e.city = "City is required";
    if (!newProvider.state.trim()) e.state = "State is required";
    if (!newProvider.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(newProvider.pincode)) e.pincode = "Invalid pincode";
    if (!newProvider.experience.trim()) e.experience = "Experience is required";
    if (!Array.isArray(newProvider.serviceType) || newProvider.serviceType.length === 0) {
      e.serviceType = "At least one skill is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setNewProvider((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ── add ── */
  const handleAddProvider = async () => {
    if (!validateProvider()) { toast.warning("Please fix the errors"); return; }
    try {
      const res = await axios.post(
        `${apiUrl}/admin/provider/create`,
        newProvider,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProviderList((prev) => [...prev, res.data.data || res.data.provider]);
      toast.success("Provider created");
      setShowAddModal(false);
      setNewProvider(emptyProvider);
      setSkillInput("");
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Provider creation failed");
    }
  };

  const handleToggleStatus = async (provider) => {
    try {
      const newStatus = provider.status === "active" ? "inactive" : "active";

      const res = await axios.patch(
        `${apiUrl}/admin/provider/${provider._id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProviderList((prev) =>
        prev.map((p) =>
          p._id === provider._id ? { ...p, status: res.data.data?.status || newStatus } : p
        )
      );

      setSelectedProvider((prev) =>
        prev && prev._id === provider._id
          ? { ...prev, status: res.data.data?.status || newStatus }
          : prev
      );

      toast.success(`Provider ${newStatus === "active" ? "activated" : "deactivated"}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    }
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;

    setNewProvider((prev) => {
      const exists = prev.serviceType.some(
        (skill) => skill.toLowerCase() === value.toLowerCase()
      );
      if (exists) return prev;

      return { ...prev, serviceType: [...prev.serviceType, value] };
    });

    setErrors((prev) => ({ ...prev, serviceType: "" }));
    setSkillInput("");
  };

  const removeSkill = (index) => {
    setNewProvider((prev) => ({
      ...prev,
      serviceType: prev.serviceType.filter((_, i) => i !== index),
    }));
  };

  /* ── update ── */
  const handleUpdateProvider = async () => {
    if (!validateProvider(true)) { toast.warning("Please fix the errors"); return; }
    try {
      // BUG FIX: was "/admin/Provider/" (capital P) — now lowercase
      const res = await axios.put(
        `${apiUrl}/admin/provider/${selectedProvider._id}`,
        newProvider,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // BUG FIX: was updating twice — removed duplicate setProviderList call
      setProviderList((prev) =>
        prev.map((p) => p._id === selectedProvider._id ? res.data.data : p)
      );
      setSelectedProvider((prev) =>
        prev && prev._id === selectedProvider._id ? res.data.data : prev
      );
      toast.success("Provider updated");
      setShowEditModal(false);
      setNewProvider(emptyProvider);
      setSkillInput("");
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  /* ── helpers ── */
  const handleView = (p) => { setSelectedProvider(p); setShowViewModal(true); };
  const handleEdit = (p) => {
    setSelectedProvider(p);
    setNewProvider({
      ...p,
      serviceType: Array.isArray(p.serviceType) ? p.serviceType : [],
    });
    setSkillInput("");
    setErrors({});
    setShowEditModal(true);
  };

  const filtered = providerList.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) =>
    name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??";

  /* ── shared form fields ── */
  const providerForm = (
    <>
      <InputField label="Name" icon={<User size={16} />} name="name" placeholder="Enter provider name" value={newProvider.name} onChange={handleChange} error={errors.name} />
      <InputField label="Description" icon={<Text size={16} />} name="description" placeholder="Senior Electrician" value={newProvider.description} onChange={handleChange} />
      <InputField label="Email" icon={<Mail size={16} />} name="email" type="email" placeholder="provider@email.com" value={newProvider.email} onChange={handleChange} error={errors.email} />
      <InputField label="Phone" icon={<Phone size={16} />} name="phone" type="tel" placeholder="10-digit number" value={newProvider.phone} onChange={handleChange} error={errors.phone} />
      <InputField label="Password" icon={<Lock size={16} />} name="password" type="password" placeholder="Min 6 characters" value={newProvider.password} onChange={handleChange} error={errors.password} />
      <InputField label="City" icon={<Building size={16} />} name="city" placeholder="Bhopal" value={newProvider.city} onChange={handleChange} error={errors.city} />
      <InputField label="State" icon={<MapIcon size={16} />} name="state" placeholder="Madhya Pradesh" value={newProvider.state} onChange={handleChange} error={errors.state} />
      <InputField label="Pincode" icon={<Hash size={16} />} name="pincode" placeholder="485221" value={newProvider.pincode} onChange={handleChange} error={errors.pincode} />
      <InputField label="Experience (yrs)" icon={<Star size={16} />} name="experience" placeholder="e.g. 5" value={newProvider.experience} onChange={handleChange} error={errors.experience} />
      <div className="mb-4">
        <label className={`block text-xs font-semibold ${darkMode ? "text-slate-200" : "text-gray-700"} mb-2`}>
          Skills
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-700" : "text-gray-700"} `}>
              <BookAIcon size={16} />
            </div>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Type a skill and press Enter"
              className={`w-full pl-10 pr-3 py-3 text-sm border rounded-xl outline-none ${darkMode ? "bg-slate-800 text-white  placeholder:text-slate-400 focus:border-gray-500" : "bg-gray-50 focus:border-blue-500"} ${errors.serviceType ? "border-red-400" : "border-gray-200"
                }`}
            />
          </div>
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold"
          >
            Add
          </button>
        </div>
        {errors.serviceType && (
          <p className="text-xs text-red-500 mt-1">{errors.serviceType}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {newProvider.serviceType.map((skill, index) => (
            <div
              key={`${skill}-${index}`}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1"
            >
              {skill}
              <button type="button" onClick={() => removeSkill(index)} className="flex items-center">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className={`flex flex-col flex-1 relative h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#42A5F5] px-5 pt-4 pb-5 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-xl text-white">
            <ArrowLeft size={18} />
          </button>
          <h1 className="flex-1 text-white font-extrabold text-lg">Service Providers</h1>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
            {providerList.length} total
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white/20 border border-white/25 px-4 py-2.5 rounded-xl">
          <Search size={15} className="text-white/70 flex-shrink-0" />
          <input
            className="bg-transparent outline-none text-white placeholder-white/60 w-full text-sm"
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <UserCog size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm">No providers found</p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${darkMode ? "bg-gray-800" : "bg-white border-gray-100"} rounded-2xl p-4 mb-3 shadow-sm border `}
            >
              <div className="flex items-center gap-3 ">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-gray-200/70 bg-white/20 cursor-pointer"
                  onClick={() => handleView(p)}>
                  {p.profilePhoto ? (
                    <img
                      src={p.profilePhoto}
                      alt="Store"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-blue-700 text-sm font-bold text-xl">{initials(p.name)}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0" onClick={() => handleView(p)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold ${darkMode ? "text-gray-400" : "text-slate-800"} text-sm`}>{p.name}</span>
                    <StatusBadge status={p.status} small />
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{p.description || "—"}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold text-gray-600">{p.experience} yrs exp</span>
                  </div>
                </div>

                <button onClick={() => handleEdit(p)} className="p-2 bg-blue-50 rounded-xl text-blue-600 flex-shrink-0">
                  <Edit size={15} />
                </button>
              </div>

              {p.serviceType?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.serviceType.map((s) => (
                    <span key={s} className="px-2.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-600 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleToggleStatus(p)}
                className={`text-[10px] mt-1 px-2 py-2 w-full rounded-full font-semibold
    ${p.status === "active"
                    ? "bg-red-100 text-red-500"
                    : "bg-green-100 text-green-600"
                  }`}
              >
                {p.status === "active" ? "Deactivate" : "Activate"}
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* ── FLOATING BUTTON ── */}
      <button
        onClick={() => { 
          setNewProvider(emptyProvider); 
          setErrors({}); 
          setSkillInput(""); 
          setShowAddModal(true); 
        }}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#1565C0] to-[#1976D2] text-white flex items-center justify-center shadow-lg"
      >
        <Plus size={24} />
      </button>

      {/* ── Add Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              key="add-backdrop"
              onClick={() => setShowAddModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-40"
            />

            <motion.div
              key="add-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className={`absolute bottom-0 left-0 w-full pb-18 ${darkMode ? "bg-gray-800" : "bg-white"} h-[70vh] rounded-t-3xl pt-0 p-6 z-50`}
            >

              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className={`w-10 h-1 ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full`} />
              </div>

              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-2 rounded-xl"><UserCog size={17} className="text-blue-600" /></div>
                  <span className={`${darkMode ? "text-gray-400" : "text-gray-700"} font-bold `}>Add Provider</span>
                </div>
                <button onClick={() => setShowAddModal(false)} className={`w-8 h-8 ${darkMode ? "bg-gray-400" : "bg-gray-100"}  rounded-xl flex items-center justify-center`}>
                  <X size={15} />
                </button>
              </div>
              <div className="flex flex-col h-full flex-1 overflow-y-auto pb-6">
                {providerForm}
                <button onClick={handleAddProvider} className="w-full mt-4 py-3.5 bg-gradient-to-br from-[#1565C0] to-[#1976D2] text-white rounded-xl font-bold flex items-center justify-center gap-2">
                  <Check size={17} /> Add Provider
                </button>
              </div>
            </motion.div>
          </>

        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              key="edit-backdrop"
              onClick={() => setShowEditModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-40"
            />

            <motion.div
              key="edit-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className={`absolute bottom-0 left-0 w-full pb-18 ${darkMode ? "bg-gray-800" : "bg-white"} h-[70vh] rounded-t-3xl pt-0 p-6 z-50`}
            >

              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className={`w-10 h-1 ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full`} />
              </div>
              <div className="flex items-center justify-between pb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-2 rounded-xl"><UserCog size={17} className="text-blue-600" /></div>
                  <span className={` ${darkMode ? "text-gray-400" : "text-gray-700"} font-bold`}>Edit Provider</span>
                </div>
                <button onClick={() => setShowEditModal(false)} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                  <X size={15} />
                </button>
              </div>
              <div className="flex-1 h-full overflow-y-auto pb-6">
                {providerForm}
                <button onClick={handleUpdateProvider} className="w-full mt-4 py-3.5 bg-gradient-to-br from-[#1565C0] to-[#1976D2] text-white rounded-xl font-bold flex items-center justify-center gap-2">
                  <Check size={17} /> Update Provider
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── View Modal ── */}
      <AnimatePresence>
        {showViewModal && selectedProvider && (
          <>
            <motion.div
              onClick={() => setShowViewModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className={`absolute bottom-0 left-0 h-[60vh] overflow-y-auto w-full  ${darkMode ? "bg-gray-800" : "bg-white"} rounded-t-3xl z-50 overflow-hidden`}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className={`w-10 h-1 ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full`} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-gray-200/70 bg-white/20 cursor-pointer">
                  {selectedProvider.profilePhoto ? (
                    <img
                      src={selectedProvider.profilePhoto}
                      alt="Store"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-blue-100 text-blue-700 text-sm font-bold">{initials(selectedProvider.name)}</span>
                    </div>
                  )}
                </div>

                  <div>
                    <h2 className={`font-extrabold text-base ${darkMode ? "text-slate-400" : "text-slate-800"} leading-tight`}>
                      {selectedProvider.name}
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">{selectedProvider.description || "—"}</p>
                  </div>
                </div>
                <button onClick={() => setShowViewModal(false)} className={`w-8 h-8 ${darkMode ? "bg-gray-400" : "bg-gray-100"} rounded-xl flex items-center justify-center`}>
                  <X size={15} className="text-gray-500" />
                </button>
              </div>

              {/* Status bar */}
              <div className={`px-5 py-3 ${darkMode ? "" : "bg-gray-50"} border-y border-gray-100 flex items-center justify-between`}>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                <StatusBadge status={selectedProvider.status} />
              </div>

              {/* Stats row */}
              <div className="px-5 py-4 grid grid-cols-2 gap-3">
                <div className={`${darkMode ? "bg-gray-600" : "bg-blue-50"} rounded-2xl p-3.5`}>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Experience</p>
                  <p className="text-xl font-extrabold text-blue-700">
                    {selectedProvider.experience}
                    <span className="text-sm font-semibold ml-1">yrs</span>
                  </p>
                </div>
                <div className={`${darkMode ? "bg-gray-600" : "bg-purple-50"} rounded-2xl p-3.5`}>
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Joined</p>
                  <p className="text-sm font-extrabold text-purple-700">
                    {new Date(selectedProvider.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Current Password */}
              <div className={`${darkMode ? "bg-gray-600" : "bg-gray-50"} rounded-2xl mx-5 px-4 py-2 my-2`}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Password</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Eye size={13} className="text-blue-500" />
                  </div>
                  <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-700"} font-medium`}>{selectedProvider.password}</span>
                </div>
              </div>

              {/* Info rows */}
              <div className="px-5 pb-2 space-y-2">

                <div className={`${darkMode ? "bg-gray-600 text-slate-400" : "text-slate-700 bg-gray-50"} rounded-2xl p-3.5 space-y-2.5`}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</p>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Mail size={13} className="text-blue-500" />
                    </div>
                    <span className="text-sm font-medium">{selectedProvider.email}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Phone size={13} className="text-green-600" />
                    </div>
                    <span className="text-sm font-medium">{selectedProvider.phone || "—"}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <MapPin size={13} className="text-orange-500" />
                    </div>
                    <span className="text-sm font-medium">
                      {[selectedProvider.city, selectedProvider.state, selectedProvider.pincode].filter(Boolean).join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Shield size={13} className="text-purple-500" />
                    </div>
                    <span className="text-sm font-mono">{selectedProvider.tenantId || "—"}</span>
                  </div>
                </div>

                {/* Service types */}
                {selectedProvider.serviceType?.length > 0 && (
                  <div className={`${darkMode ? "bg-gray-600" : "bg-gray-50"} rounded-2xl p-3.5`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Service Types</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProvider.serviceType.map((s) => (
                        <span key={s} className="px-2.5 py-1 text-[11px] font-semibold bg-blue-100 text-blue-700 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
