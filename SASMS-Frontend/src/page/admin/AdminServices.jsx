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
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import StatusBadge from "../../component/StatusBadge";
import InputField from "../../component/InputField";
import { toast } from "react-toastify";
import axios from "axios";

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
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedService, setSelectedService] = useState(null);

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
      console.log(res.data);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewService((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

    const token = localStorage.getItem("token");

  const handleCreateService = async () => {

    const formData = new FormData();

    formData.append("serviceName", newService.serviceName);
    formData.append("description", newService.description);
    formData.append("estimatedPrice", newService.estimatedPrice);
    formData.append("category", newService.category);
    formData.append("availability", newService.availability);
    formData.append("serviceImage", newService.serviceImage);

    try {

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

    } catch {

      toast.error("Service creation failed");

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
    setShowEditModal(true);
    setMenuOpen(null);
  };

  const handleUpdateService = async () => {
    try {

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
      setNewService({
        serviceName: "",
        category: "",
        estimatedPrice: "",
        availability: "",
        serviceImage: "",
        description: "",
      });


      setShowEditModal(false);

    } catch {
      toast.error("Update failed");
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
              src={`${apiUrl}${service.serviceImage}`}
              className="w-11 h-11 rounded-xl object-cover"
            />

            {/* INFO */}
            <div className="flex-1 min-w-0">

              <div className="text-sm font-bold text-gray-800 truncate">
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
              <div className="absolute right-10 mt-8 w-32 bg-white shadow-lg rounded-xl border text-sm z-50">

                <button
                  onClick={() => handleView(service)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  View
                </button>

                <button
                  onClick={() => handleEdit(service)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(service._id)}
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
          setNewService({
            serviceName: "",
            category: "",
            estimatedPrice: "",
            availability: "",
            serviceImage: "",
            description: "",
          })
        }}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-gradient-to-r from-[#1565C0] to-[#1976D2] text-white flex items-center justify-center shadow-lg"
      >
        <Plus size={24} />
      </button>

      {/* Add MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 max-h-[65%] overflow-y-auto"
          >

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
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    serviceImage: e.target.files[0],
                  })
                }
                className="w-full border border-gray-200 rounded-xl p-3 text-sm"

              />
            </div>

            <button
              onClick={handleCreateService}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold"
            >
              <Check size={18} />
              Create Service
            </button>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 max-h-[65%] overflow-y-auto"
          >

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
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    serviceImage: e.target.files[0],
                  })
                }
                className="w-full border border-gray-200 rounded-xl p-3 text-sm"

              />
            </div>

            <button
              onClick={handleUpdateService}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold"
            >
              <Check size={18} />
              Update
            </button>

          </motion.div>
        )}
      </AnimatePresence>


      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedService && (
          <>
            <motion.div
              onClick={() => setShowViewModal(false)}
              className="absolute inset-0 bg-black/50 z-40"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 left-0 right-0 bg-white h-[60vh] rounded-t-3xl p-6 z-50 overflow-y-auto"
            >

              <div className="flex justify-between mb-5">
                <h2 className="font-bold text-lg">Service Details</h2>
                <button onClick={() => setShowViewModal(false)}>
                  <X size={18} />
                </button>
              </div>

              {selectedService.serviceImage && (
                <img
                  src={`${apiUrl}${selectedService.serviceImage}`}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}

              <div className="space-y-3 text-sm">

                <p><b>Name:</b> {selectedService.serviceName}</p>

                <p><b>Description:</b> {selectedService.description}</p>

                <p><b>Category:</b> {selectedService.category}</p>

                <p><b>Estimated Price:</b> ₹{selectedService.estimatedPrice}</p>

                <p>
                  <b>Availability:</b>{" "}
                  <StatusBadge status={selectedService.availability} />
                </p>

                <p>
                  <b>Created:</b>{" "}
                  {new Date(selectedService.createdAt).toLocaleDateString()}
                </p>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}