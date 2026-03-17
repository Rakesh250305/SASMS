import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Plus,
  Search,
  Star,
  MoreVertical,
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
  BookAIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "../../component/StatusBadge";
import InputField from "../../component/InputField";
import { useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const providers = [
  {
    id: "P001",
    name: "Marcus Williams",
    role: "Senior Technician",
    rating: 4.8,
    services: 142,
    status: "active",
    skills: ["HVAC", "Electrical", "Plumbing"],
    avatar: "MW",
  },
  {
    id: "P002",
    name: "Emma Rodriguez",
    role: "IT Specialist",
    rating: 4.6,
    services: 98,
    status: "active",
    skills: ["IT Support", "Networking", "CCTV"],
    avatar: "ER",
  },
  {
    id: "P003",
    name: "David Kim",
    role: "Maintenance Tech",
    rating: 4.3,
    services: 67,
    status: "inactive",
    skills: ["Painting", "Carpentry", "AC"],
    avatar: "DK",
  },
];

export default function AdminProviders() {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [providerList, setProviderList] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);


  const token = localStorage.getItem("token");

  useEffect(() => {

    const fetchProviders = async () => {

      try {

        const res = await axios.get(
          "http://localhost:5000/admin/provider",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setProviderList(res.data.data);
        console.log(res.data.data);

      } catch (error) {

        toast.error("Failed to fetch providers");

      }

    };

    fetchProviders();

  }, []);


  const [newProvider, setNewProvider] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    password: "",
    tenantId: "",
    city: "",
    state: "",
    pincode: "",
    experience: "",
    serviceType: ""
  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setNewProvider({
      ...newProvider,
      [name]: value
    });

  };


  const handleAddProvider = async () => {

    try {

      const res = await axios.post(
        "http://localhost:5000/admin/provider/create",
        {
          ...newProvider,
          serviceType: newProvider.serviceType.split(",")
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProviderList((prev) => [...prev, res.data.data]);

      toast.success("Provider created");

      setShowAddModal(false);

      setNewProvider({
        name: "",
        description: "",
        email: "",
        phone: "",
        password: "",
        tenantId: "",
        city: "",
        state: "",
        pincode: "",
        experience: "",
        serviceType: ""
      });

    } catch (error) {

      toast.error(error.response?.data?.message || "Provider creation failed");

    }

  };

  const filtered = providerList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Menu Open
  const handleView = (provider) => {
    setSelectedProvider(provider);
    setShowViewModal(true);
    setMenuOpen(null);
  };

  const handleEdit = (provider) => {
    setSelectedProvider(provider);
    setNewProvider(provider);
    setShowEditModal(true);
    setMenuOpen(null);
  };

  const handleUpdateProvider = async () => {
    try {

      const res = await axios.put(
        `http://localhost:5000/admin/Provider/${selectedProvider._id}`,
        newProvider,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedProviderList = res.data.data;

      setProviderList((prev) =>
        prev.map((provider) =>
          provider._id === selectedProvider._id ? updatedProviderList : provider
        )
      );


      toast.success("Provider updated");

      setProviderList((prev) =>
        prev.map((a) =>
          a._id === selectedProvider._id ? res.data.data : a
        )
      );

      // reset form
      setNewProvider({
        name: "",
        description: "",
        email: "",
        phone: "",
        password: "",
        tenantId: "",
        city: "",
        state: "",
        pincode: "",
        experience: "",
        serviceType: ""
      });


      setShowEditModal(false);

    } catch (error) {
      toast.error("Update failed");
    }
  };



  return (

    <div className="flex flex-col flex-1 bg-gray-100 relative h-screen">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#1565C0] to-[#1976D2] p-5">

        <div className="flex items-center gap-3 mb-4">

          <button
            onClick={() => navigate("/admin")}
            className="bg-white/20 p-2 rounded-lg text-white"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="flex-1 text-white font-bold text-lg">
            Service Providers
          </h1>

        </div>

        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">

          <Search size={16} className="text-white/70" />

          <input
            className="bg-transparent outline-none text-white placeholder-white/70 w-full text-sm"
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      {/* PROVIDER LIST */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 mb-3 shadow"
          >

            <div className="flex items-start gap-3">

              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                {p.name.split(" ").map(word => word[0]).join("").toUpperCase() || "N/A"}
              </div>

              <div className="flex-1">

                <div className="flex items-center gap-2">

                  <span className="font-semibold text-gray-800">
                    {p.name || "N/A"}
                  </span>

                  <StatusBadge status={p.status} small />

                </div>

                <div className="text-xs text-gray-500">
                  {p.description || "N/A"}
                </div>

                <div className="flex items-center gap-2 mt-1">

                  <Star size={12} className="text-yellow-400 fill-yellow-400" />

                  <span className="text-xs font-semibold">
                    {p.experience || "N/A"} Years
                  </span>

                </div>

              </div>

              <button
                className="text-gray-400 p-1 relative"
                onClick={() =>
                  setMenuOpen(menuOpen === p._id ? null : p._id)
                }
              >
                <MoreVertical size={18} />
              </button>

              {/* MenuOpen */}
              {menuOpen === p._id && (
                <div className="absolute right-10  mt-8 w-32 bg-white shadow-lg rounded-xl border border-gray-300 text-sm z-50">

                  <button
                    onClick={() => handleView(p)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    View
                  </button>

                  <button
                    onClick={() => handleEdit(p)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    Edit
                  </button>

                </div>
              )}

            </div>

            {/* SKILLS */}

            <div className="flex flex-wrap gap-3 mt-3">

              {p.serviceType.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full"
                >
                  {s}
                </span>
              ))}

            </div>

          </motion.div>

        ))}

      </div>

      {/* FLOAT BUTTON */}
      <button
        onClick={() => {
          setShowAddModal(true)
          setNewProvider({
            name: "",
            description: "",
            email: "",
            phone: "",
            password: "",
            tenantId: "",
            city: "",
            state: "",
            pincode: "",
            experience: "",
            serviceType: ""
          })
        }}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#1565C0] to-[#1976D2] text-white flex items-center justify-center shadow-lg"
      >
        <Plus size={24} />
      </button>

      {/* ADD PROVIDER MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              className="absolute inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
            />

            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 h-[80vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
            >

              <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">

                  <div className="bg-blue-50 p-2 rounded-lg">
                    <UserCog size={18} className="text-blue-600" />
                  </div>

                  <span className="font-bold text-gray-800">
                    Add Provider
                  </span>

                </div>

                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  <X size={16} />
                </button>

              </div>

              <InputField
                label="Name"
                icon={<User size={16} />}
                name="name"
                placeholder="Enter Provider Name"
                value={newProvider.name}
                onChange={handleChange}
              />

              <InputField
                label="Description"
                icon={<Text size={16} />}
                name="description"
                placeholder="Senior Electrician"
                value={newProvider.description}
                onChange={handleChange}
              />

              <InputField
              type="email"
                label="Email"
                icon={<Mail size={16} />}
                name="email"
                placeholder="Provider@gmail.com"
                value={newProvider.email}
                onChange={handleChange}
              />

              <InputField
              type="number"
                label="Phone"
                icon={<Phone size={16} />}
                name="phone"
                placeholder="+91 1234567890"
                value={newProvider.phone}
                onChange={handleChange}
              />

              <InputField
                label="Password"
                icon={<Lock size={16} />}
                name="password"
                type="password"
                placeholder="Password"
                value={newProvider.password}
                onChange={handleChange}
              />

              <InputField
                label="City"
                icon={<Building size={16} />}
                name="city"
                value={newProvider.city}
                placeholder="Bhopal, Satna"
                onChange={handleChange}
              />

              <InputField
                label="State"
                icon={<MapIcon size={16} />}
                name="state"
                placeholder="Madhya Pradesh, Maharastra"
                value={newProvider.state}
                onChange={handleChange}
              />

              <InputField
                label="Pincode"
                icon={<Hash size={16} />}
                name="pincode"
                placeholder="485221"
                value={newProvider.pincode}
                onChange={handleChange}
              />

              <InputField
                label="Experience"
                icon={<Hash size={16} />}
                name="experience"
                placeholder="5+ years"
                value={newProvider.experience}
                onChange={handleChange}
              />

              <InputField
                label="Service Types (comma separated)"
                icon={<BookAIcon size={16} />}
                name="serviceType"
                placeholder="Electrician, Plumber, Carpenter"
                value={newProvider.serviceType}
                onChange={handleChange}
              />

              <button
                onClick={handleAddProvider}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Add Provider
              </button>

            </motion.div>

          </>

        )}

      </AnimatePresence>


      {/* EDIT PROVIDER MODAL */}
      <AnimatePresence>

        {showEditModal && (
          <>
            <motion.div
              className="absolute inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
            />

            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 h-[80vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
            >

              <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">

                  <div className="bg-blue-50 p-2 rounded-lg">
                    <UserCog size={18} className="text-blue-600" />
                  </div>

                  <span className="font-bold text-gray-800">
                    Edit Provider
                  </span>

                </div>

                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  <X size={16} />
                </button>

              </div>

              <div className="flex flex-col h-full overfloe-y-auto">
                <InputField
                  label="Name"
                  icon={<User size={16} />}
                  name="name"
                  placeholder="Enter Provider Name"
                  value={newProvider.name}
                  onChange={handleChange}
                />

                <InputField
                  label="Description"
                  icon={<Text size={16} />}
                  name="description"
                  placeholder="Senior Electrician"
                  value={newProvider.description}
                  onChange={handleChange}
                />

                <InputField
                type="email"
                  label="Email"
                  icon={<Mail size={16} />}
                  name="email"
                  placeholder="Provider@gmail.com"
                  value={newProvider.email}
                  onChange={handleChange}
                />

                <InputField
                type="number"
                  label="Phone"
                  icon={<Phone size={16} />}
                  name="phone"
                  placeholder="+91 1234567890"
                  value={newProvider.phone}
                  onChange={handleChange}
                />

                <InputField
                  label="Password"
                  icon={<Lock size={16} />}
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={newProvider.password}
                  onChange={handleChange}
                />

                <InputField
                  label="City"
                  icon={<Building size={16} />}
                  name="city"
                  value={newProvider.city}
                  placeholder="Bhopal, Satna"
                  onChange={handleChange}
                />

                <InputField
                  label="State"
                  icon={<MapIcon size={16} />}
                  name="state"
                  placeholder="Madhya Pradesh, Maharastra"
                  value={newProvider.state}
                  onChange={handleChange}
                />

                <InputField
                  label="Pincode"
                  icon={<Hash size={16} />}
                  name="pincode"
                  placeholder="485221"
                  value={newProvider.pincode}
                  onChange={handleChange}
                />

                <InputField
                  label="Experience"
                  icon={<Hash size={16} />}
                  name="experience"
                  placeholder="5+ years"
                  value={newProvider.experience}
                  onChange={handleChange}
                />

                <InputField
                  label="Service Types (comma separated)"
                  icon={<BookAIcon size={16} />}
                  name="serviceType"
                  placeholder="Electrician, Plumber, Carpenter"
                  value={newProvider.serviceType}
                  onChange={handleChange}
                />

                <button
                  onClick={handleUpdateProvider}
                  className="w-full my-6 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Update
                </button>
              </div>

            </motion.div>

          </>

        )}

      </AnimatePresence>

      {/* View Provider model */}
      <AnimatePresence>
        {showViewModal && selectedProvider && (
          <>
            <motion.div
              onClick={() => setShowViewModal(false)}
              className="absolute inset-0 bg-black/50 z-40"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 left-0 right-0 bg-white h-[55vh] rounded-t-3xl p-6 z-50"
            >

              <div className="flex justify-between mb-5">
                <h2 className="font-bold text-lg">Provider Details</h2>
                <button onClick={() => setShowViewModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-sm">

                <p><b>Name:</b> {selectedProvider.name}</p>
                <p><b>Description:</b> {selectedProvider.description}</p>
                <p><b>Email:</b> {selectedProvider.email}</p>
                <p><b>Phone:</b> {selectedProvider.phone}</p>
                <p><b>Address:</b> {selectedProvider.city}, {selectedProvider.state}, {selectedProvider.pincode}</p>
                <p><b>Experience:</b> {selectedProvider.experience} years</p>
                <p><b>Registered On:</b> {new Date(selectedProvider.createdAt).toLocaleDateString()}</p>
                <p><b>Password:</b> {selectedProvider.password}</p>
                <p><b>Service Type:</b> {selectedProvider.serviceType?.join(", ")}</p>
                <p><b>Tenant ID:</b> {selectedProvider.tenantId}</p>

                <div className="flex items-center gap-2">
                  <b>Status:</b>
                  <StatusBadge status={selectedProvider.status} />
                </div>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );

}