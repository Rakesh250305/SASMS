import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  Plus,
  User,
  Package,
  UserCog,
  BookText,
  X,
  ReceiptIndianRupee,
  BookTextIcon,
  CopyCheck,
  Info,
  Search,
  MoreVertical,
  Settings,
  Droplets,
  Laptop,
  Shield,
  Wrench,
  Wind,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import StatusBadge from "../../component/StatusBadge";
import InputField from "../../component/InputField";
import { toast } from "react-toastify";
import axios from "axios";

const getCategoryStyle = (category) => {
  switch (category) {
    case "hvac":
      return { background: "#EFF6FF", color: "#1976D2" };
    case "electrical":
      return { background: "#F0FDF4", color: "#388E3C" };
    case "plumbing":
      return { background: "#FFF7ED", color: "#F57C00" };
    case "it support":
      return { background: "#FFF7ED", color: "#F57C00" };
    case "security":
      return { background: "#F3E8FF", color: "#7B1FA2" };
    case "repair":
      return { background: "#F3E8FF", color: "#7B1FA2" };
    default:
      return { background: "#EFF6FF", color: "#1976D2" };
  }
};

export default function AdminServices() {

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [showAddModal, setShowAddModal] = useState(false);

  const [newService, setNewService] = useState({
    serviceName: "",
    category: "",
    estimatedPrice: "",
    availability: "",
    serviceImage: "",
    description: "",
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabs = ["All", "Available", "Assigned", "Unavailable"];

  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [creating, setCreating] = useState(false);
const [updating, setUpdating] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceImagePreview, setServiceImagePreview] = useState("");

  const filtered = services.filter((s) => {

    const matchTab =
      activeTab === 0
        ? true
        : s.availability === tabs[activeTab].toLowerCase();

    const matchSearch =
      s.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      s._id.toString().toLowerCase().includes(search.toLowerCase());

    return matchTab && matchSearch;

  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${apiUrl}/admin/service`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setServices(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);

    }
  };

  useEffect(() => {
    fetchServices();
  }, [])

  useEffect(() => {
    return () => {
      if (serviceImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(serviceImagePreview);
      }
    };
  }, [serviceImagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewService((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


const validateForm = () => {
  if (!newService.serviceName.trim()) {
    toast.error("Service name is required");
    return false;
  }

  if (newService.serviceName.length < 3) {
    toast.error("Service name must be at least 3 characters");
    return false;
  }

  if (!newService.description.trim()) {
    toast.error("Description is required");
    return false;
  }

  if (newService.description.length < 10) {
    toast.error("Description must be at least 10 characters");
    return false;
  }

  if (!newService.estimatedPrice) {
    toast.error("Price is required");
    return false;
  }

  if (Number(newService.estimatedPrice) <= 0) {
    toast.error("Price must be greater than 0");
    return false;
  }

  if (!newService.category) {
    toast.error("Please select a category");
    return false;
  }

  if (!newService.availability) {
    toast.error("Please select availability");
    return false;
  }

  // only for create
  if (!newService.serviceImage && !showEditModal) {
    toast.error("Please upload service image");
    return false;
  }

  return true;
};

  const resetServiceForm = () => {
    setNewService({
      serviceName: "",
      category: "",
      estimatedPrice: "",
      availability: "",
      serviceImage: "",
      description: "",
    });
    setServiceImagePreview("");
  };

const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Only image files are allowed");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    toast.error("Image must be less than 2MB");
    return;
  }

  setNewService((prev) => ({
    ...prev,
    serviceImage: file,
  }));

  setServiceImagePreview(URL.createObjectURL(file));
};

  const token = localStorage.getItem("token");

  const handleCreateService = async () => {
      if (!validateForm()) return;
    if (creating) return;

    const formData = new FormData();

    formData.append("serviceName", newService.serviceName);
    formData.append("description", newService.description);
    formData.append("estimatedPrice", newService.estimatedPrice);
    formData.append("category", newService.category);
    formData.append("availability", newService.availability);
    formData.append("serviceImage", newService.serviceImage);

    try {
  setCreating(true);
      await axios.post(
        `${apiUrl}/admin/service/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      await fetchServices();

      toast.success("Service Created");

      setShowAddModal(false);
      resetServiceForm();

    } catch {

      toast.error("Service creation failed");

    } finally {
    setCreating(false);
  }

  };

  const handleView = (service) => {
    setSelectedService(service);
    setShowViewModal(true);
    setMenuOpen(null);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setNewService(service);
    setServiceImagePreview(service.serviceImage || "");
    setShowEditModal(true);
    setMenuOpen(null);
  };

  const handleUpdateService = async () => {
      if (!validateForm()) return;
    if (updating) return;
    try {
 setUpdating(true);
      const newFd = new FormData();

      newFd.append("serviceName", newService.serviceName);
      newFd.append("description", newService.description);
      newFd.append("estimatedPrice", newService.estimatedPrice);
      newFd.append("category", newService.category);
      newFd.append("availability", newService.availability);
      newFd.append("serviceImage", newService.serviceImage);

      const res = await axios.put(
        `${apiUrl}/admin/service/${selectedService._id}`,
        newFd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        }
      );

      const updatedService = res.data.data;

      setServices((prev) =>
        prev.map((service) =>
          service._id === selectedService._id ? updatedService : service
        )
      );


      toast.success("Service updated");

      setServices((prev) =>
        prev.map((a) =>
          a._id === selectedService._id ? res.data.data : a
        )
      );

      // reset form
      resetServiceForm();


      setShowEditModal(false);

    } catch {
      toast.error("Update failed");
    } finally {
    setUpdating(false);
  }
  };

  const handleDelete = async (id) => {
    try {

      await axios.delete(
        `${apiUrl}/admin/service/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setServices(services.filter((a) => a._id !== id));

      toast.success("Service deleted");

    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-gray-100 relative">

      {/* HEADER */}
      <div className="bg-gradient-to-r sticky from-[#1565C0] to-[#1976D2] p-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="bg-white/20 p-2 rounded-lg text-white"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="flex-1 text-white font-bold text-lg">
            Service Management
          </h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pt-4">
        <div className="relative">

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white outline-none"
          />

        </div>
      </div>

      {/* Filter tabs  */}
      <div className="flex gap-2 px-4 py-2 pt-4">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap
      ${activeTab === i
                ? "bg-gradient-to-br from-[#1565C0] to-[#1976D2] text-white font-bold shadow"
                : "bg-white text-gray-500 shadow-sm"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Services LIST */}
      <div className="pb-15 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-40" />
            <div className="font-semibold">No services found</div>
          </div>
        ) : (
          filtered.map((service, i) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative bg-white rounded-2xl m-2 p-4 mb-3 shadow-sm flex items-center gap-3"
            >

              {/* IMAGE */}
              <img
                onClick={() => handleView(service)}
                src={service.serviceImage}
                className="w-11 h-11 rounded-xl object-cover"
              />

              {/* INFO */}
              <div className="flex-1 min-w-0">

                <div className="text-sm font-bold text-gray-800 truncate"
                  onClick={() => handleView(service)}>
                  {service.serviceName}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={service.availability} small />
                </div>

                <div className="text-xs text-gray-400 mt-1">
                  ₹{service.estimatedPrice} • {service.category}
                </div>

              </div>

              {/* MENU BUTTON */}
              <button
                className="text-gray-400 p-1 relative"
                onClick={() =>
                  setMenuOpen(menuOpen === service._id ? null : service._id)
                }
              >
                <MoreVertical size={18} />
              </button>

              {/* MENU */}
              {menuOpen === service._id && (
                <div className="absolute right-10 mt-8 w-32 bg-white shadow-lg rounded-xl border border-gray-300 text-sm z-50">
                  <button
                    onClick={() => handleEdit(service)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      setShowDeleteModal(true)
                      setSelectedService(service)
                      setMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100"
                  >
                    Delete
                  </button>

                </div>
              )}

            </motion.div>
          ))
        )}
      </div>

      {/* FAB BUTTON */}
      <button
        onClick={() => {
          setShowAddModal(true)
          resetServiceForm()
        }}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-gradient-to-r from-[#1565C0] to-[#1976D2] text-white flex items-center justify-center shadow-lg"
      >
        <Plus size={24} />
      </button>

      {/* Add Service MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              onClick={() => setShowAddModal(false)}
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
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pt-0 p-6 z-50 max-h-[65%] overflow-y-auto"
            >

              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              <div className="flex items-center justify-between mb-5">

                <div className="flex items-center gap-2">
                  <BookText size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold">Add Service</h2>
                </div>

                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  <X size={16} />
                </button>

              </div>

              <InputField
                label="Service Name"
                icon={<User size={16} />}
                name="serviceName"
                placeholder="AC Repair"
                value={newService.serviceName}
                onChange={handleChange}
              />

              <InputField
                label="Description"
                icon={<BookTextIcon size={16} />}
                name="description"
                placeholder="description"
                value={newService.description}
                onChange={handleChange}
              />

              <InputField
                type="number"
                label="Estimated Price"
                icon={<ReceiptIndianRupee size={16} />}
                name="estimatedPrice"
                placeholder="500"
                value={newService.estimatedPrice}
                onChange={handleChange}
              />

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Category</label>
                <div className="relative">

                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <CopyCheck size={16} />
                  </div>
                  <select name="category" value={newService.category} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 text-sm border  text-gray-700 border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="hvac">HVAC</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="it support">IT Support</option>
                    <option value="security">Security</option>
                    <option value="repair">Repair</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>


              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Availability</label>
                <div className="relative">

                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Info size={16} />
                  </div>
                  <select name="availability" value={newService.availability} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 text-sm border  text-gray-700 border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-blue-500"
                  >
                    <option value="">Select Availability</option>
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>


              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Service Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm"

                />

                {serviceImagePreview && (
                  <img
                    src={serviceImagePreview}
                    alt="Service preview"
                    className="w-full h-40 mt-3 rounded-xl object-cover border border-gray-200"
                  />
                )}
              </div>

              <button
  onClick={handleCreateService}
  disabled={creating}
  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition ${
    creating
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-gradient-to-r from-blue-700 to-blue-600 text-white"
  }`}
>
  {creating ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Creating...
    </>
  ) : (
    <>
      <Check size={18} />
      Create Service
    </>
  )}
</button>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Service MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              onClick={() => setShowEditModal(false)}
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
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl pt-0 p-6 z-50 max-h-[65%] overflow-y-auto"
            >

              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              <div className="flex items-center justify-between mb-5">

                <div className="flex items-center gap-2">
                  <BookText size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold">Edit Service</h2>
                </div>

                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  <X size={16} />
                </button>

              </div>

              <InputField
                label="Service Name"
                icon={<User size={16} />}
                name="serviceName"
                placeholder="AC Repair"
                value={newService.serviceName}
                onChange={handleChange}
              />

              <InputField
                label="Description"
                icon={<BookTextIcon size={16} />}
                name="description"
                placeholder="description"
                value={newService.description}
                onChange={handleChange}
              />

              <InputField
                type="number"
                label="Estimated Price"
                icon={<ReceiptIndianRupee size={16} />}
                name="estimatedPrice"
                placeholder="500"
                value={newService.estimatedPrice}
                onChange={handleChange}
              />

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Category</label>
                <div className="relative">

                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <CopyCheck size={16} />
                  </div>
                  <select name="category" value={newService.category} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 text-sm border  text-gray-700 border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="hvac">HVAC</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="it support">IT Support</option>
                    <option value="security">Security</option>
                    <option value="repair">Repair</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>


              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Availability</label>
                <div className="relative">

                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Info size={16} />
                  </div>
                  <select name="availability" value={newService.availability} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 text-sm border  text-gray-700 border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-blue-500"
                  >
                    <option value="">Select Availability</option>
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>


              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Service Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm"

                />

                {serviceImagePreview && (
                  <img
                    src={serviceImagePreview}
                    alt="Service preview"
                    className="w-full h-40 mt-3 rounded-xl object-cover border border-gray-200"
                  />
                )}
              </div>

            <button
  onClick={handleUpdateService}
  disabled={updating}
  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition ${
    updating
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-gradient-to-r from-blue-700 to-blue-600 text-white"
  }`}
>
  {updating ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Updating...
    </>
  ) : (
    <>
      <Check size={18} />
      Update
    </>
  )}
</button>

            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* View Service Modal */}
      <AnimatePresence>
        {showViewModal && selectedService && (
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
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-6 z-50 overflow-hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={getCategoryStyle(selectedService.category)}
                  >
                    {selectedService.category === "hvac" ? <Wind size={18} />
                      : selectedService.category === "electrical" ? <Zap size={18} />
                        : selectedService.category === "plumbing" ? <Droplets size={18} />
                          : selectedService.category === "it support" ? <Laptop size={18} />
                            : selectedService.category === "security" ? <Shield size={18} />
                              : selectedService.category === "repair" ? <Wrench size={18} />
                                : <Settings size={18} />}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-800 leading-tight">
                      {selectedService.serviceName}
                    </h2>
                    <span className="text-[11px] font-semibold text-gray-400 capitalize">
                      {selectedService.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center"
                >
                  <X size={15} className="text-gray-500" />
                </button>
              </div>

              {/* Service Image */}
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <img
                  src={selectedService.serviceImage}
                  className="w-full h-30 rounded-xl object-cover"
                /></div>

              {/* Availability bar */}
              <div className="px-5 py-1 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Status
                </span>
                <StatusBadge status={selectedService.availability} />
              </div>


              {/* Details grid */}
              <div className="px-5 py-4 grid grid-cols-2 gap-3">

                <div className="bg-green-50 rounded-2xl p-3.5">
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">
                    Extimated Price
                  </p>
                  <p className="text-xl font-extrabold text-green-700">
                    ₹{selectedService.estimatedPrice}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-3.5">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                    CreatedAt
                  </p>
                  <p className="text-xl font-extrabold text-blue-700">
                    <span className="text-sm font-semibold ml-1">{new Date(selectedService.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

              </div>

              {/* Description */}
              {selectedService.description && (
                <div className="px-5 pb-2">
                  <div className="bg-gray-50 rounded-2xl p-3.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      Description
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedService.description}
                    </p>
                  </div>
                </div>
              )}



            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* Delete Confirmation Modal */}

      <AnimatePresence>
        {showDeleteModal && selectedService && (
          <>
            <motion.div
              onClick={() => setShowDeleteModal(false)}
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
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-6 z-50 overflow-hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                <h3 className="font-bold text-lg text-slate-800 mb-2">Confirm Deletion</h3>
                <p className="text-slate-600 mb-4">
                  Are you sure you want to delete this Service? This action cannot be undone.
                </p>
                <div className="flex justify-between gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 w-1/2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedService._id);
                      setShowDeleteModal(false);
                    }}
                    className="px-4 py-2 w-1/2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
