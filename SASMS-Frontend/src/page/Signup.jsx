import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, ChevronDown, ArrowLeft, Check, Store, Building2, MapPin, Building2Icon, Hash, NotebookTabs, Link2 } from "lucide-react";
import { toast } from "react-toastify";
import InputField from "../component/InputField";
import ScreenLoader from '../component/ScreenLoader.jsx';

/* ---------------- MAIN COMPONENT ---------------- */

export default function Signup() {

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPass: "",
    role: "admin",

    // admin
    storeName: "",
    storeAddress: "",
    GSTNo: "",
    businessDescription: "",
    website: "",

    // user
    address: "",

    city: "",
    state: "",
    pincode: "",
  });

  /* ---------------- VALIDATION ---------------- */

  const validateStep = () => {

    // STEP 2
    if (step === 2) {
      if (!form.name.trim()) {
        toast.warning("Name is required")
        return false;
      }

      if (!form.email.trim()) {
        toast.warning("Email is required");
        return false;
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        toast.warning("Invalid Email");
        return false;
      }

      if (!form.phone.trim()) {
        toast.warning("Phone number required");
        return false;
      } else if (!/^[0-9]{10}$/.test(form.phone)) {
        toast.info("Phone must be 10 digits");
        return false;
      }
    }

    // STEP 3
    if (step === 3) {

      if (form.role === "admin") {

        if (!form.storeName.trim()) {
          toast.warning("Store name required");
          return false;
        }

        if (!form.storeAddress.trim()) {
          toast.warning("Store address required");
          return false;
        }

        if (!form.city.trim()) {
          toast.warning("City required");
          return false;
        }

        if (!form.state.trim()) {
          toast.warning("State required");
          return false;
        }

        if (!form.pincode.trim()) {
          toast.warning("Pincode required");
          return false;
        }

        if (!/^[0-9]{6}$/.test(form.pincode)) {
          toast.info("Pincode must be 6 digits");
          return false;
        }
      }

      if (form.role === "user") {

        if (!form.address.trim()) {
          toast.warning("Address required");
          return false;
        }

        if (!form.city.trim()) {
          toast.warning("City required");
          return false;
        }

        if (!form.state.trim()) {
          toast.warning("State required");
          return false;
        }

        if (!form.pincode.trim()) {
          toast.warning("Pincode required");
          return false;
        }

        if (!/^[0-9]{6}$/.test(form.pincode)) {
          toast.info("Pincode must be 6 digits");
          return false;
        }
      }
    }

    // STEP 4
    if (step === 4) {

      if (!form.password) {
        toast.warning("Password required");
        return false;
      } else if (form.password.length < 6) {
        toast.info("Password must be 6+ characters");
        return false;
      }

      if (!form.confirmPass) {
        toast.warning("Confirm password required");
        return false;
      }

      if (form.password !== form.confirmPass) {
        toast.info("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* ---------------- NEXT STEP ---------------- */

  const handleNext = () => {

    if (!validateStep()) return;

    if (step < 4) {
      setStep(step + 1);
    }
  };

  /* ---------------- SIGNUP ---------------- */

  const handleSignup = async () => {

    if (!validateStep()) return;
    try {
      setLoading(true);
      const payload = { ...form };
      delete payload.confirmPass;

      if(payload.role === "admin"){
        const res = await axios.post(
        `${apiUrl}/admin/signup`,
        payload
      );
      toast.success(res.data.message);
      } else {
        const res = await axios.post(
        `${apiUrl}/user/signup`,
        payload
      );
      toast.success(res.data.message);
      }
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally{
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className={`min-h-screen flex flex-col overflow-y-auto dark:bg-slate-950 bg-[#f8faff]`}>
      {loading && <ScreenLoader /> }

      {/* HEADER */}
      <div className={`relative px-6 pt-9 pb-14 overflow-hidden bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#42A5F5] `}>

        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate("/login"))}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm mb-5 border dark:text-slate-100 dark:bg-slate-900/60 dark:border-slate-800 text-white bg-white/20 border-white/10`}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-white text-2xl font-extrabold mb-1">
          Create Account
        </h1>

        <p className="text-white/75 text-sm">
          Join Smart Asset & Service Management System
        </p>

        {/* STEP INDICATOR */}

        <div className="flex items-center gap-2 mt-4">

          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>

              <div className={`flex items-center justify-center font-bold text-xs rounded-full
              ${s <= step 
                  ? "dark:bg-slate-100 dark:text-slate-900 dark:w-7 dark:h-7 bg-white text-[#1976D2] w-7 h-7" 
                  : "dark:bg-slate-800 dark:text-slate-400 dark:w-6 dark:h-6 bg-white/30 text-white/70 w-6 h-6"
                  }`}>

                {s < step ? <Check size={14} /> : s}

              </div>

              {s < 4 && (
                <div className={`h-[2px] w-10 rounded
                ${s < step ? 
                  "dark:bg-slate-300/70 bg-white/70" 
                  : "dark:bg-slate-700 bg-white/30"
                }`} />
              )}

            </React.Fragment>
          ))}

        </div>

      </div>

      {/* FORM */}

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex-1 rounded-t-[28px] -mt-7 px-6 pt-7 pb-8 shadow-xl dark:bg-slate-900 bg-white `}
      >

        {/* STEP 1 ROLE */}

        {step === 1 && (

          <div className="my-5">

            <label className={`text-base font-bold dark:text-slate-200 text-gray-800 `}>
              Select Role
            </label>

            <div className="flex flex-col gap-3 py-2">

              {[
                { value: "admin", label: "Admin", desc: "Create Service & Assets", color: "#1976D2", bg: "#EFF6FF" },
                { value: "user", label: "User", desc: "Book services", color: "#065f46", bg: "#d1fae5" }
              ].map((r) => (

                <button
                  type="button"
                  key={r.value}
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`p-3 rounded-xl border text-left relative transition-colors
                  ${form.role === r.value ? "border-[2px]" : "dark:border-slate-800 dark:bg-slate-950 border-gray-200 bg-gray-50" }`}
                  style={{
                    borderColor: form.role === r.value ? r.color : "",
                    background: form.role === r.value ? r.bg : undefined
                  }}
                >

                  {form.role === r.value && (
                    <div className="absolute top-6 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: r.color }}>
                      <Check size={10} color="#fff" />
                    </div>
                  )}

                  <div
                    className={`text-sm font-bold ${form.role === r.value ? "" : "dark:text-slate-200 text-slate-700 "}`}
                    style={{ color: form.role === r.value ? r.color : undefined }}
                  >
                    {r.label}
                  </div>

                  <div className={`text-[11px] mt-1 dark:text-slate-500 text-gray-400 `}>
                    {r.desc}
                  </div>

                </button>

              ))}

            </div>

          </div>

        )}

        {/* STEP 2 PERSONAL */}

        {step === 2 && (

          <>
            <h2 className={`text-base font-bold my-5 dark:text-slate-100 text-gray-800`}>
              Personal Information
            </h2>

            <InputField
              label="Full Name"
              icon={<User size={16} />}
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
            />

            <InputField
              label="Email"
              icon={<Mail size={16} />}
              name="email"
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
            />

            <InputField
              label="Phone"
              icon={<Phone size={16} />}
              name="phone"
              placeholder="+91 9876543210"
              value={form.phone}
              onChange={handleChange}
            />

          </>
        )}

        {/* Organization details - Admin Address - user  */}

        {step === 3 && (

          <>
            <h2 className={`text-base font-bold my-5 dark:text-slate-100 text-gray-800`}>

              {form.role === "admin" && "Organizational Details"}
              {form.role === "user" && "Address Details"}

            </h2>

            {/* ADMIN */}
            {form.role === "admin" && (
              <>
                <InputField
                  label="Store Name"
                  icon={<Store size={16} />}
                  name="storeName"
                  placeholder="Store Name"
                  value={form.storeName}
                  onChange={handleChange}
                  required
                />

                <InputField
                  label="Store Address"
                  icon={<MapPin size={16} />}
                  name="storeAddress"
                  placeholder="Store Address"
                  value={form.storeAddress}
                  onChange={handleChange}
                  required
                />

                <InputField
                  label="City"
                  icon={<Building2 size={16} />}
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  required
                />

                <InputField
                  label="State"
                  icon={<Building2Icon size={16} />}
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  required
                />

                <InputField
                  label="Pincode"
                  icon={<Hash size={16} />}
                  name="pincode"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />

                <InputField
                  label="GST Number (Optional)"
                  icon={<Hash size={16} />}
                  name="GSTNo"
                  placeholder="GST Number"
                  value={form.GSTNo}
                  onChange={handleChange}
                />

                <InputField
                  label="Business Description"
                  icon={<NotebookTabs size={16} />}
                  name="businessDescription"
                  placeholder="Business Description"
                  value={form.businessDescription}
                  onChange={handleChange}
                />

                <InputField
                  label="Website (Optional)"
                  icon={<Link2 size={16} />}
                  name="website"
                  placeholder="website"
                  value={form.website}
                  onChange={handleChange}
                />


              </>
            )}

            {/* USER */}
            {form.role === "user" && (
              <>
                <InputField
                  label="Address"
                  icon={<Building2 size={16} />}
                  name="address"
                  placeholder="Enter Address"
                  value={form.address}
                  onChange={handleChange}
                />

                <InputField
                  label="City"
                  icon={<Building2 size={16} />}
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                />

                <InputField
                  label="State"
                  icon={<Building2Icon size={16} />}
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                />

                <InputField
                  label="Pincode"
                  icon={<Hash size={16} />}
                  name="pincode"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={handleChange}
                />
              </>
            )}

          </>
        )}

        {/* STEP 4 PASSWORD */}

        {step === 4 && (

          <>

            <h2 className={`text-base font-bold my-5 dark:text-slate-100 text-gray-800`}>
              Set Password
            </h2>

            <InputField label="Password" icon={<Lock size={16} />} name="password"
              type="password" placeholder="Create password"
              value={form.password} onChange={handleChange} />

            <InputField label="Confirm Password" icon={<Lock size={16} />} name="confirmPass"
              type="password" placeholder="Confirm password"
              value={form.confirmPass} onChange={handleChange} />

          </>

        )}

        {/* BUTTON */}

        <button
          onClick={step === 4 ? handleSignup : handleNext}
          className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg mt-4 bg-gradient-to-r from-[#1565C0] to-[#1976D2]"
        >

          {step === 4 ? "Create Account" : "Next"}
          <ChevronDown size={18} className="-rotate-90" />

        </button>

      </motion.div>

    </div>

  );
}
