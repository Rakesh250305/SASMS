import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Tag, ArrowRight, CircleDollarSign, ClipboardList, Store, MapPin, Pin, Link } from "lucide-react";
import useDarkMode from "../../utils/useDarkMode";

export default function UserServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const darkMode = useDarkMode().darkMode;
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/user/allService`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const foundService = (res.data.data || []).find((item) => item._id === id);
        setService(foundService || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [apiUrl, id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-base font-semibold text-slate-700">Service not found</p>
        <button
          onClick={() => navigate("/user/services")}
          className="text-sm font-semibold text-emerald-600"
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-white"} `}>
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-5 pt-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-white/90 mb-4"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        <p className="text-white/70 text-xs uppercase tracking-wider mb-2">Service Detail</p>
        <h1 className="text-2xl font-bold text-white">{service.serviceName}</h1>
        <p className="text-white/70 text-sm mt-1">{service.category}</p>
      </div>

      <div className="-mt-4 px-4 pb-5">
        <div className={`${darkMode ? "bg-gray-800 border-gray-100" : "bg-slate-100 border-black"} rounded-3xl shadow-sm border  overflow-hidden`}>
          {service.serviceImage ? (
            <img
              src={service.serviceImage}
              alt={service.serviceName}
              className="w-full h-56 object-cover"
            />
          ) : (
            <div className="h-56 bg-emerald-50 flex items-center justify-center">
              <Tag size={42} className="text-emerald-500" />
            </div>
          )}

          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                <ClipboardList size={13} />
                {service.category}
              </span>
              <span className="inline-flex items-center gap-1 text-lg font-bold text-emerald-600">
                ₹{service.estimatedPrice}
              </span>
            </div>

            <div>
              <p className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-600"} uppercase tracking-widest mb-2`}>About Service</p>
              <p className="text-sm leading-relaxed text-slate-600">
                {service.description || "No description available for this service yet."}
              </p>
            </div>

            {/* Store Details */}
            {service.store && (
              <div>
                <p className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-600"} uppercase tracking-widest mb-2`}>Store Details</p>
                <div className={`${darkMode ? "bg-gray-700 text-slate-400" : "bg-slate-50 text-slate-700"} rounded-2xl p-4 space-y-3`}>
                  <div className="flex items-start gap-2">
                    <Store size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">
                        {service.store.storeName || "Store name not available"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm">
                        {[
                          // service.store.storeAddress,
                          service.store.city,
                          service.store.state,
                          service.store.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Store address not available"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 items-center">
                    <Link size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <a href={service.store.website} target="_blank" rel="noopener noreferrer" className="text-sm cursor-pointer">
                        {service.store.website}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={`${darkMode ? "bg-gray-700 text-slate-400" : "bg-slate-50 text-slate-700"} rounded-2xl pl-0 p-4`}>
              <p className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-600"} uppercase tracking-widest mb-3`}>Quick Summary</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Service Name</span>
                  <span className="text-sm font-semibold text-emerald-600">{service.serviceName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Category</span>
                  <span className="text-sm font-semibold text-emerald-700">{service.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estimated Price</span>
                  <span className="text-sm font-semibold text-emerald-700">₹{service.estimatedPrice}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/user/booking?serviceId=${service._id}`)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2"
            >
              Book This Service
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
