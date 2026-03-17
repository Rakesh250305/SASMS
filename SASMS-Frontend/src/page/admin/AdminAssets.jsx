import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Search,
  Plus,
  Filter,
  Package,
  Laptop,
  Wrench,
  Monitor,
  Printer,
  Phone,
  MoreVertical,
  X,
  Check,
  Layers,
  CopyCheck,
  BookCheck,
  BookText,
  Info,
  ReceiptIndianRupee,
  Settings,
  Wind,
  Zap,
  Droplet,
  Droplets,
  Shield,
} from "lucide-react";
import StatusBadge from "../../component/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "../../component/InputField";
import { toast } from "react-toastify";
import axios from "axios";
import { useEffect } from "react";

const tabs = ["All", "Available", "Out of Stock", "Maintenance"];

export default function AdminAssets() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [newAsset, setNewAsset] = useState({
    assetName: "",
    assetDescription: "",
    category: "",
    quantity: "",
    cost: "",
    status: "",
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAllAssets = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/admin/assets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAssets(res.data.data);
      } catch (error) {
        toast.error("Failed to featch Assets");
      }
    };

    fetchAllAssets();
  }, []);

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

  const handleChange = (e) => {
    setNewAsset({
      ...newAsset,
      [e.target.name]: e.target.value
    });
  };

  const filtered = assets.filter((a) => {
    const matchTab =
      activeTab === 0
        ? true
        : a.status === tabs[activeTab].toLowerCase();

    const matchSearch =
      a.assetName.toLowerCase().includes(search.toLowerCase()) ||
      a._id.toString().toLowerCase().includes(search.toLowerCase());

    return matchTab && matchSearch;
  });

  const handleCreateAsset = async () => {
    try {

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/admin/assets/create",
        newAsset,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAssets((prev) => [...prev, res.data.data]);
      toast.success(res.data.message || "Asset created successfully");
      // reset form
      setNewAsset({
        assetName: "",
        category: "",
        quantity: "",
        assetDescription: "",
        cost: "",
        status: "",
      });

    } catch (error) {
      toast.error(error.response?.data?.message || "Asset creation failed");
    }
  };

  // menu Open
  const handleView = (asset) => {
    setSelectedAsset(asset);
    setShowViewModal(true);
    setMenuOpen(null);
  };

  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setNewAsset(asset);
    setShowEditModal(true);
    setMenuOpen(null);
  };

  const handleUpdateAsset = async () => {
    try {

      const res = await axios.put(
        `http://localhost:5000/admin/assets/${selectedAsset._id}`,
        newAsset,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedAsset = res.data.data;

      setAssets((prev) =>
        prev.map((asset) =>
          asset._id === selectedAsset._id ? updatedAsset : asset
        )
      );


      toast.success("Asset updated");

      setAssets((prev) =>
        prev.map((a) =>
          a._id === selectedAsset._id ? res.data.data : a
        )
      );

      // reset form
      setNewAsset({
        assetName: "",
        category: "",
        quantity: "",
        assetDescription: "",
        cost: "",
        status: "",
      });


      setShowEditModal(false);

    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/admin/assets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssets((prev) => prev.filter((a) => a._id !== id));
      toast.success("Asset deleted");
    } catch (error) {
      toast.error(error);
      console.log(error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] relative h-screen">

      {/* HEADER */}
      <div className="bg-gradient-to-br sticky from-[#1565C0] to-[#1976D2] px-5 pt-4 pb-6">

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/admin")}
            className="bg-white/20 text-white p-2 rounded-lg"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 text-white font-bold text-lg">
            Asset Management
          </div>

          <button className="bg-white/20 text-white p-2 rounded-lg">
            <Filter size={18} />
          </button>
        </div>

        {/* STATS */}
        <div className="flex gap-2">
          {[
            { label: "Total", value: assets.length, color: "text-white" },
            {
              label: "Available",
              value: assets.filter((a) => a.status === "available").length,
              color: "text-green-300",
            },
            {
              label: "Assigned",
              value: assets.filter((a) => a.status === "assigned").length,
              color: "text-blue-200",
            },
            {
              label: "Maint.",
              value: assets.filter((a) => a.status === "maintenance").length,
              color: "text-yellow-300",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 bg-white/10 rounded-lg py-2 text-center"
            >
              <div className={`text-lg font-extrabold ${s.color}`}>
                {s.value}
              </div>
              <div className="text-[10px] text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH */}
      <div className="px-4 pt-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white outline-none"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 px-4 pt-4">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap
            ${activeTab === i
                ? "bg-[#1976D2] text-white font-bold shadow"
                : "bg-white text-gray-500 shadow-sm"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto px-4 my-2 pt-4 pb-24">

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-40" />
            <div className="font-semibold">No assets found</div>
            <div className="text-sm">Try adjusting filters</div>
          </div>
        ) : (
          filtered.map((asset, i) => (
            <motion.div
              key={asset._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative bg-white rounded-2xl p-4 mb-3 shadow-sm flex items-center gap-3"
            >
              {/* ICON */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={getCategoryStyle(asset.category)}
              >
                {asset.category === "hvac" ? <Wind size={18} />
                  : asset.category === "electrical" ? <Zap size={18} />
                    : asset.category === "plumbing" ? <Droplets size={18} />
                      : asset.category === "it support" ? <Laptop size={18} />
                        : asset.category === "security" ? <Shield size={18} />
                          : asset.category === "repair" ? <Wrench size={18} />
                            : <Settings size={18} />
                }
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#1A1A2E] truncate">
                  {asset.assetName}
                </div>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusBadge status={asset.status} small />
                </div>

                <div className="text-xs text-gray-400 mt-1">
                  {asset.cost}{" "}INR • {asset.quantity}{" "}Pcs
                  {asset.assignTo ? `• ${asset.assignTo}` : ""}
                </div>
              </div>

              <button
                className="text-gray-400 p-1 relative"
                onClick={() =>
                  setMenuOpen(menuOpen === asset._id ? null : asset._id)
                }
              >
                <MoreVertical size={18} />
              </button>

              {/* MenuOpen */}
              {menuOpen === asset._id && (
                <div className="absolute right-10  mt-8 w-32 bg-white shadow-lg rounded-xl border border-gray-300 text-sm z-50">

                  <button
                    onClick={() => handleView(asset)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    View
                  </button>

                  <button
                    onClick={() => handleEdit(asset)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(asset._id)}
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

      {/* FLOATING BUTTON */}
      <button
        onClick={() => {
          setShowAddModal(true);
          setNewAsset({
            assetName: "",
            category: "",
            quantity: "",
            assetDescription: "",
            cost: "",
            status: "",
          })
        }}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full
        bg-gradient-to-br from-[#1565C0] to-[#1976D2]
        text-white flex items-center justify-center shadow-lg"
      >
        <Plus size={24} />
      </button>

      {/* ADD ASSSET MODAL */}
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
              className="absolute bottom-0 left-0 right-0 bg-white h-[70vh] rounded-t-3xl p-6 z-50"
            >
              <div className="flex justify-between items-center mb-5">
                <div className="font-bold text-lg">
                  Add New Asset
                </div>

                <button
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-100 p-2 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col h-full overflow-y-auto">

                <InputField
                  label="Asset Name"
                  icon={<BookCheck size={16} />}
                  name="assetName"
                  placeholder="Enter Asset Name"
                  value={newAsset.assetName}
                  onChange={handleChange}
                />

                <InputField
                  label="Asset Description"
                  icon={<BookText size={16} />}
                  name="assetDescription"
                  placeholder="Enter Asset Description"
                  value={newAsset.assetDescription}
                  onChange={handleChange}
                />

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Category</label>
                  <div className="relative">

                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <CopyCheck size={16} />
                    </div>
                    <select name="category" value={newAsset.category} onChange={handleChange}
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

                <InputField
                  type="number"
                  label="Quantity Available"
                  icon={<Layers size={16} />}
                  name="quantity"
                  placeholder="Quantity Available"
                  value={newAsset.quantity}
                  onChange={handleChange}
                />

                <InputField
                  type="number"
                  label="Cost"
                  icon={<ReceiptIndianRupee size={16} />}
                  name="cost"
                  placeholder="Cost in INR"
                  value={newAsset.cost}
                  onChange={handleChange}
                />

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                  <div className="relative">

                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Info size={16} />
                    </div>
                    <select name="status" value={newAsset.status} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 text-sm border text-gray-700 border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="available">Available</option>
                      <option value="out of stock">out of stock</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowAddModal(false)
                    handleCreateAsset();
                  }}
                  className="w-full py-3 mb-5 rounded-xl text-white font-bold
                    bg-gradient-to-br from-[#1565C0] to-[#1976D2]
                    flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Save Asset
                </button>
              </div>


            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit assets Modal */}
      <AnimatePresence>
        {showEditModal && (
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
              className="absolute bottom-0 left-0 right-0 bg-white h-[70vh] rounded-t-3xl p-6 z-50"
            >
              <div className="flex justify-between items-center mb-5">
                <div className="font-bold text-lg">
                  Edit Asset
                </div>

                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-100 p-2 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col h-full overflow-y-auto">

                <InputField
                  label="Asset Name"
                  icon={<BookCheck size={16} />}
                  name="assetName"
                  placeholder="Enter Asset Name"
                  value={newAsset.assetName}
                  onChange={handleChange}
                />

                <InputField
                  label="Asset Description"
                  icon={<BookText size={16} />}
                  name="assetDescription"
                  placeholder="Enter Asset Description"
                  value={newAsset.assetDescription}
                  onChange={handleChange}
                />

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Category</label>
                  <div className="relative">

                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <CopyCheck size={16} />
                    </div>
                    <select name="category" value={newAsset.category} onChange={handleChange}
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

                <InputField
                  type="number"
                  label="Quantity Available"
                  icon={<Layers size={16} />}
                  name="quantity"
                  placeholder="Quantity Available"
                  value={newAsset.quantity}
                  onChange={handleChange}
                />

                <InputField
                  type="number"
                  label="Cost"
                  icon={<ReceiptIndianRupee size={16} />}
                  name="cost"
                  placeholder="Cost in INR"
                  value={newAsset.cost}
                  onChange={handleChange}
                />

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                  <div className="relative">

                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Info size={16} />
                    </div>
                    <select name="status" value={newAsset.status} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 text-sm border text-gray-700 border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="available">Available</option>
                      <option value="out of stock">out of stock</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowEditModal(false)
                    handleUpdateAsset();
                  }}
                  className="w-full py-3 mb-5 rounded-xl text-white font-bold
                    bg-gradient-to-br from-[#1565C0] to-[#1976D2]
                    flex items-center justify-center gap-2"
                >
                  Update Asset
                </button>
              </div>


            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Asset model */}
      <AnimatePresence>
        {showViewModal && selectedAsset && (
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
                <h2 className="font-bold text-lg">Asset Details</h2>
                <button onClick={() => setShowViewModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-sm">

                <p><b>Name:</b> {selectedAsset.assetName}</p>
                <p><b>Description:</b> {selectedAsset.assetDescription}</p>
                <p><b>Category:</b> {selectedAsset.category}</p>
                <p><b>Quantity:</b> {selectedAsset.quantity}</p>
                <p><b>Cost:</b> ₹{selectedAsset.cost}</p>

                <div className="flex items-center gap-2">
                  <b>Status:</b>
                  <StatusBadge status={selectedAsset.status} />
                </div>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}