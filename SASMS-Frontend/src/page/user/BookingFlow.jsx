import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";

const STEPS = ["Service", "Address", "Notes", "Confirm"];

export default function BookingFlow() {

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [searchParams] = useSearchParams();

  const preselectedServiceId = searchParams.get("serviceId");

  const [step, setStep] = useState(preselectedServiceId ? 1 : 0);
  const [services, setServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {

    const fetchServices = async () => {

      try {

        const res = await axios.get(
          `${apiUrl}/user/allService`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setServices(res.data.data || []);

        if (preselectedServiceId) {

          const service = res.data.data.find(
            s => s._id === preselectedServiceId
          );

          if (service) {
            setSelectedService(service);
          }

        }

      } catch (err) {
        console.error(err);
      }

    };

    fetchServices();

  }, [preselectedServiceId, token]);


  const filteredServices = services.filter(s =>
    s.serviceName?.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.category?.toLowerCase().includes(serviceSearch.toLowerCase())
  );

useEffect(()=>{
    const fetchAddresses = async () => {

  try {

    const res = await axios.get(
      `${apiUrl}/user/address`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setSavedAddresses(res.data.addresses || []);

  } catch (err) {
    console.error(err);
  }

};

fetchAddresses();
}, []);


  const handleConfirmBooking = async () => {

    try {

      await axios.post(
        `${apiUrl}/user/booking/create`,
        {
          serviceId: selectedService._id,
          address : selectedAddressId,
          notes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate("/user/history");

    } catch (err) {

      console.error(err);

    }

  };


  return (

    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white px-5 pt-6 pb-12">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm mb-4 opacity-90"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        <h1 className="text-xl font-bold">
          Book Service
        </h1>

        {/* STEPPER */}

        <div className="flex items-center mt-6">

          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">

              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold
              ${i <= step ? "bg-white text-emerald-700" : "bg-white/30 text-white"}
              `}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>

              <span
                className={`ml-2 text-xs font-semibold
              ${i <= step ? "text-white" : "text-white/60"}
              `}
              >
                {s}
              </span>

              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-2
                ${i < step ? "bg-white" : "bg-white/30"}
                `}
                />
              )}

            </div>
          ))}

        </div>

      </div>


      {/* CONTENT */}

      <div className="-mt-8 px-4 pb-20">

        {/* STEP 0 SERVICE */}

        {step === 0 && (

          <div className="bg-white rounded-xl shadow-sm p-4">

            <h2 className="font-semibold mb-3 text-gray-700">
              Select Service
            </h2>

            <input
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
              placeholder="Search services..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
            />

            <div className="space-y-2 max-h-72 overflow-y-auto">

              {filteredServices.map(s => (
                <div
                  key={s._id}
                  onClick={() => setSelectedService(s)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                ${selectedService?._id === s._id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-100"}
                `}
                >

                  {s.serviceImage && (
                    <img
                      src={`${apiUrl}${s.serviceImage}`}
                      alt={s.serviceName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}

                  <div className="flex-1">

                    <p className="text-sm font-semibold">
                      {s.serviceName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {s.category}
                    </p>

                  </div>

                  {s.estimatedPrice && (
                    <span className="text-sm font-bold text-emerald-600">
                      ₹{s.estimatedPrice}
                    </span>
                  )}

                </div>
              ))}

            </div>

            <button
              disabled={!selectedService}
              onClick={() => setStep(1)}
              className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold disabled:opacity-40"
            >
              Continue
            </button>

          </div>

        )}


        {/* STEP 1 ADDRESS */}

        {step === 1 && (

          <div className="bg-white rounded-xl shadow-sm p-4">

            <h2 className="font-semibold mb-3 text-gray-700">
              Select Address
            </h2>

            {/* SAVED ADDRESSES */}

            <div className="space-y-2">

              {savedAddresses.map(addr => (

                <div
                  key={addr._id}
                  onClick={() => {
                    setSelectedAddressId(addr._id)
                    setAddress(
                      `${addr.addressLine1}, ${addr.city}, ${addr.state} - ${addr.pincode}`
                    )
                  }}
                  className={`border rounded-lg p-3 cursor-pointer
${selectedAddressId === addr._id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200"}
`}
                >

                  <div className="flex justify-between items-center">

                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded capitalize">
                      {addr.label}
                    </span>

                    {selectedAddressId === addr._id && (
                      <Check size={16} className="text-emerald-600" />
                    )}

                  </div>

                  <p className="text-sm font-semibold mt-1">
                    {addr.fullName}
                  </p>

                  <p className="text-xs text-gray-500">
                    {addr.addressLine1}, {addr.city}
                  </p>

                </div>

              ))}

            </div>

            {/* ADD NEW ADDRESS */}

            <button
              onClick={() => navigate('/user/profile')}
              className="mt-4 w-full border border-dashed border-emerald-400 text-emerald-600 py-2 rounded-lg text-sm"
            >
              + Add New Address
            </button>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() => setStep(0)}
                className="flex-1 border rounded-lg py-3"
              >
                Back
              </button>

              <button
                disabled={!address}
                onClick={() => setStep(2)}
                className="flex-1 bg-emerald-600 text-white rounded-lg py-3"
              >
                Continue
              </button>

            </div>

          </div>

        )}

        {/* STEP 2 NOTES */}

        {step === 2 && (

          <div className="bg-white rounded-xl shadow-sm p-4">

            <h2 className="font-semibold mb-3 text-gray-700">
              Special Notes
            </h2>

            <textarea
              className="w-full border rounded-lg p-3 text-sm"
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex gap-3 mt-6">

              <button
                onClick={() => setStep(1)}
                className="flex-1 border rounded-lg py-3"
              >
                Back
              </button>

              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-emerald-600 text-white rounded-lg py-3"
              >
                Review
              </button>

            </div>

          </div>

        )}


        {/* STEP 3 CONFIRM */}

        {step === 3 && (

          <div className="bg-white rounded-xl shadow-sm p-4">

            <h2 className="font-semibold mb-3">
              Confirm Booking
            </h2>

            <div className="text-sm text-gray-600 space-y-2">

              <p>
                <b>Service:</b> {selectedService?.serviceName}
              </p>

              <p>
                <b>Category:</b> {selectedService?.category}
              </p>

              <p>
                <b>Address:</b> {address}
              </p>

              <p>
                <b>Notes:</b> {notes || "None"}
              </p>

            </div>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() => setStep(2)}
                className="flex-1 border rounded-lg py-3"
              >
                Back
              </button>

              <button
                onClick={handleConfirmBooking}
                className="flex-1 bg-emerald-600 text-white rounded-lg py-3 font-semibold"
              >
                Confirm Booking
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}