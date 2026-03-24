import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  X,
  Search,
  SlidersHorizontal,
  Tag,
  Package,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import BottomNav from "../../component/BottomNav";

const CATEGORIES = ["HVAC", "Electrical", "IT Support", "Security", "Plumbing", "Electronics", "Repair"];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 flex gap-3 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
      </div>
    </div>
  );
}

export default function AllServices() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) {
      setCategory(cat);
    }
  }, [location.search]);

  // filters
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [pendingCategory, setPendingCategory] = useState("");
  const [pendingMaxPrice, setPendingMaxPrice] = useState(5000);

  const token = localStorage.getItem("token");

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/user/allService`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data?.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category ? s.category?.toLowerCase() === category.toLowerCase() : true;
      const matchPrice = Number(s.estimatedPrice) <= maxPrice;
      return matchSearch && matchCategory && matchPrice;
    });
  }, [services, search, category, maxPrice]);

  const activeFilterCount = [category, maxPrice < 5000].filter(Boolean).length;

  const openFilter = () => {
    setPendingCategory(category);
    setPendingMaxPrice(maxPrice);
    setShowFilter(true);
  };

  const applyFilters = () => {
    setCategory(pendingCategory);
    setMaxPrice(pendingMaxPrice);
    setShowFilter(false);
  };

  const clearFilters = () => {
    setPendingCategory("");
    setPendingMaxPrice(5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-5 pt-6 pb-14">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Browse Services</h1>
            <p className="text-white/60 text-xs mt-1">
              {loading ? "Loading..." : `${filteredServices.length} services available`}
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="-mt-6 px-4 mb-4">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              placeholder="Search services..."
              className="flex-1 text-sm outline-none text-slate-700 placeholder-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>

          <button
            onClick={openFilter}
            className="relative bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-1.5"
          >
            <SlidersHorizontal size={16} className="text-slate-600" />
            <span className="text-sm font-semibold text-slate-600">Filter</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active filter chips */}
        {(category || maxPrice < 5000) && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {category && (
              <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                {category}
                <button onClick={() => setCategory("")}>
                  <X size={11} />
                </button>
              </span>
            )}
            {maxPrice < 5000 && (
              <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                Up to ₹{maxPrice}
                <button onClick={() => setMaxPrice(5000)}>
                  <X size={11} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Services list */}
      <div className="flex-1 px-4 pb-24 space-y-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <Package size={28} className="text-emerald-400" />
            </div>
            <p className="text-slate-700 font-semibold text-sm mb-1">No services found</p>
            <p className="text-gray-400 text-xs">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredServices.map((service, i) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/user/booking?serviceId=${service._id}`)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3 cursor-pointer active:scale-[0.99] transition-transform"
            >
              {/* Image */}
              {service.serviceImage ? (
                <img
                  src={`${apiUrl}${service.serviceImage}`}
                  alt={service.serviceName}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Tag size={22} className="text-emerald-500" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 truncate">{service.serviceName}</h3>

                <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                  {service.category}
                </span>

                {service.description && (
                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                )}
              </div>

              {/* Price + Book */}
              <div className="flex flex-col items-end justify-between flex-shrink-0">
                <p className="text-base font-bold text-emerald-600">₹{service.estimatedPrice}</p>
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                  Book
                  <ChevronRight size={11} />
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowFilter(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              <div className="px-5 pb-8">
                {/* Title */}
                <div className="flex justify-between items-center py-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-slate-800">Filters</h2>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>

                {/* Category */}
                <div className="mt-5 mb-6">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setPendingCategory(pendingCategory === c ? "" : c)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${pendingCategory === c
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-600 border-gray-200"
                          }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Max Price</p>
                    <span className="text-sm font-bold text-emerald-600">₹{pendingMaxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={pendingMaxPrice}
                    onChange={(e) => setPendingMaxPrice(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>₹100</span>
                    <span>₹5000</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-emerald-600 text-white rounded-xl py-3 text-sm font-semibold"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav role="user" />
    </div>
  );
}
