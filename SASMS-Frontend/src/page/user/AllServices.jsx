import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X, Search, SlidersHorizontal, Tag, Package,
  ChevronRight, ChevronLeft, Check, ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../../component/BottomNav";
import useDarkMode from "../../utils/useDarkMode";

const CATEGORIES = ["HVAC", "Electrical", "IT Support", "Security", "Plumbing", "Electronics", "Repair"];

const SORT_OPTIONS = [
  { key: "default",    label: "Default"           },
  { key: "price_asc",  label: "Price: Low → High"  },
  { key: "price_desc", label: "Price: High → Low"  },
  { key: "newest",     label: "Newest First"        },
];

const PAGE_SIZE = 5;

function SkeletonCard({ darkMode }) {
  return (
    <div className={`rounded-2xl p-4 flex gap-3 animate-pulse ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <div className={`w-16 h-16 rounded-xl flex-shrink-0 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`} />
      <div className="flex-1 space-y-2 pt-1">
        <div className={`h-3.5 rounded-full w-3/4 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`} />
        <div className={`h-3 rounded-full w-1/2 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`} />
        <div className={`h-3 rounded-full w-1/3 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`} />
      </div>
    </div>
  );
}

export default function AllServices() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { darkMode } = useDarkMode();
  const apiUrl    = import.meta.env.VITE_BACKEND_URL;
  const token     = localStorage.getItem("token");

  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState("");

  // Filter state
  const [category, setCategory]         = useState("");
  const [maxPrice, setMaxPrice]         = useState(5000);
  const [showFilter, setShowFilter]     = useState(false);
  const [pendingCategory, setPendingCategory] = useState("");
  const [pendingMaxPrice, setPendingMaxPrice] = useState(5000);

  // Sort state — separate from filters
  const [sortBy, setSortBy]         = useState("default");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  // Read category from URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) setCategory(cat);
  }, [location.search]);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // Reset to page 1 whenever filters / sort / search change
  useEffect(() => { setPage(1); }, [search, category, maxPrice, sortBy]);

  /* ── Derived: filtered + sorted ── */
  const processedServices = useMemo(() => {
    let result = services.filter((s) => {
      const matchSearch =
        s.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category
        ? s.category?.toLowerCase() === category.toLowerCase()
        : true;
      const matchPrice = Number(s.estimatedPrice) <= maxPrice;
      return matchSearch && matchCategory && matchPrice;
    });

    if (sortBy === "price_asc")  result = [...result].sort((a, b) => Number(a.estimatedPrice) - Number(b.estimatedPrice));
    if (sortBy === "price_desc") result = [...result].sort((a, b) => Number(b.estimatedPrice) - Number(a.estimatedPrice));
    if (sortBy === "newest")     result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [services, search, category, maxPrice, sortBy]);

  /* ── Pagination ── */
  const totalPages  = Math.max(1, Math.ceil(processedServices.length / PAGE_SIZE));
  const pageSlice   = processedServices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Filter helpers ── */
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

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortBy)?.label || "Sort";

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-900" : "bg-slate-50"}`}>

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-5 pt-6 pb-14">
        <h1 className="text-xl font-bold text-white">All Services</h1>
        <p className="text-white/60 text-xs mt-1">
          {loading ? "Loading..." : `${processedServices.length} services available`}
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="-mt-6 px-4 mb-3">
        <div className="flex gap-2">
          {/* Search */}
          <div className={`flex-1 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              placeholder="Search services..."
              className={`flex-1 text-sm outline-none placeholder-gray-400 ${darkMode ? "bg-transparent text-white" : "text-slate-700"}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter button */}
          <button
            onClick={openFilter}
            className={`relative rounded-2xl px-4 py-3 shadow-sm border flex items-center gap-1.5 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
          >
            <SlidersHorizontal size={16} className={darkMode ? "text-gray-300" : "text-slate-600"} />
            <span className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-slate-600"}`}>Filter</span>
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
              <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${darkMode ? "bg-emerald-950/40 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>
                {category}
                <button onClick={() => setCategory("")}><X size={11} /></button>
              </span>
            )}
            {maxPrice < 5000 && (
              <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${darkMode ? "bg-emerald-950/40 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>
                Up to ₹{maxPrice}
                <button onClick={() => setMaxPrice(5000)}><X size={11} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Sort bar — separate row ── */}
      <div className="px-4 mb-4">
        <div className="relative inline-block">
          <button
            onClick={() => setShowSortMenu(v => !v)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              sortBy !== "default"
                ? "bg-emerald-600 text-white border-emerald-600"
                : darkMode
                ? "bg-gray-800 border-gray-700 text-gray-300"
                : "bg-white border-gray-200 text-slate-600"
            }`}
          >
            <ArrowUpDown size={13} />
            {currentSortLabel}
          </button>

          {/* Sort dropdown */}
          <AnimatePresence>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.13 }}
                  className={`absolute top-10 left-0 z-50 rounded-2xl shadow-xl border overflow-hidden w-48 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                >
                  {SORT_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => { setSortBy(key); setShowSortMenu(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
                        sortBy === key
                          ? darkMode ? "bg-emerald-900/50 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                          : darkMode ? "text-gray-300 hover:bg-gray-700" : "text-slate-700 hover:bg-gray-50"
                      }`}
                    >
                      {label}
                      {sortBy === key && <Check size={13} className="text-emerald-600" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Services list */}
      <div className="flex-1 px-4 pb-4 space-y-3">
        {loading ? (
          <>
            <SkeletonCard darkMode={darkMode} />
            <SkeletonCard darkMode={darkMode} />
            <SkeletonCard darkMode={darkMode} />
          </>
        ) : pageSlice.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? "bg-emerald-950/40" : "bg-emerald-50"}`}>
              <Package size={28} className="text-emerald-400" />
            </div>
            <p className={`font-semibold text-sm mb-1 ${darkMode ? "text-gray-100" : "text-slate-700"}`}>No services found</p>
            <p className="text-gray-400 text-xs">Try adjusting your search or filters</p>
          </div>
        ) : (
          pageSlice.map((service, i) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-sm border p-4 flex gap-3 active:scale-[0.99] transition-transform`}
            >
              {/* Image */}
              {service.serviceImage ? (
                <img
                  src={service.serviceImage}
                  alt={service.serviceName}
                  onClick={() => navigate(`/user/services/${service._id}`)}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0 cursor-pointer"
                />
              ) : (
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-emerald-950/40" : "bg-emerald-50"}`}>
                  <Tag size={22} className="text-emerald-500" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div
                  onClick={() => navigate(`/user/services/${service._id}`)}
                  className={`text-sm font-bold truncate cursor-pointer hover:text-emerald-600 transition-colors ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  {service.serviceName}
                </div>
                <div className="inline-block mt-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                  {service.category}
                </div>
                {service.description && (
                  <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed text-gray-400">
                    {service.description}
                  </p>
                )}
              </div>

              {/* Price + Book */}
              <div className="flex flex-col items-end justify-between flex-shrink-0">
                <p className="text-base font-bold text-emerald-600">₹{service.estimatedPrice}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/user/booking?serviceId=${service._id}`)}
                  className={`flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 ${darkMode ? "bg-gray-700" : "bg-emerald-50"} px-2.5 py-1 rounded-xl hover:bg-emerald-100 transition-colors`}
                >
                  Book <ChevronRight size={11} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="pb-24 flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center disabled:opacity-40 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
                <span className="text-xs text-gray-500 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center disabled:opacity-40 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              </div>
      )}

      {/* ── Filter Bottom Sheet ── */}
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
              className={`w-full rounded-t-3xl max-h-[85vh] overflow-y-auto ${darkMode ? "bg-gray-900" : "bg-white"}`}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className={`w-10 h-1 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
              </div>

              <div className="px-5 pb-8">
                {/* Title */}
                <div className={`flex justify-between items-center py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                  <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>Filters</h2>
                  <button
                    onClick={() => setShowFilter(false)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
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
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          pendingCategory === c
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : darkMode
                            ? "bg-gray-800 text-gray-300 border-gray-600"
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
                    type="range" min="100" max="5000" step="100"
                    value={pendingMaxPrice}
                    onChange={(e) => setPendingMaxPrice(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>₹100</span><span>₹5000</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={clearFilters}
                    className={`flex-1 border rounded-xl py-3 text-sm font-semibold ${darkMode ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}
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