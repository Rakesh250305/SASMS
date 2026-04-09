import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import logo from "../assets/main-Logo.png";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, UserCog, User, AlertCircle, Phone, X } from "lucide-react";
import { toast } from "react-toastify";

const roleConfig = {
  admin: {
    label: "Admin",
    icon: <Shield size={15} />,
    color: "#1976D2",
    gradient: "linear-gradient(135deg, #1565C0, #1976D2dd)",
    bg: "#EFF6FF",
    path: "/admin",
    placeholder: "admin@example.com",
  },
  provider: {
    label: "Provider",
    icon: <UserCog size={15} />,
    color: "#86198f",
    gradient: "linear-gradient(135deg, #6b21a8, #86198fdd)",
    bg: "#fdf4ff",
    path: "/provider",
    placeholder: "provider@example.com",
  },
  user: {
    label: "User",
    icon: <User size={15} />,
    color: "#065f46",
    gradient: "linear-gradient(135deg, #047857, #065f46dd)",
    bg: "#ecfdf5",
    path: "/user",
    placeholder: "user@example.com",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  const [selectedRole, setSelectedRole] = useState("admin");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPass, setShowPass]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");   // inline error banner
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetData, setResetData] = useState({
    role: "admin",
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });

  const config = roleConfig[selectedRole];

  /* clear error when user starts retyping */
  const handleEmailChange = (e) => { setError(""); setEmail(e.target.value); };
  const handlePassChange  = (e) => { setError(""); setPassword(e.target.value); };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError("");
    setEmail("");
    setPassword("");
    setResetData((prev) => ({
      ...prev,
      role,
    }));
  };

  const openForgotPassword = () => {
    if (selectedRole === "provider") {
      toast.info("Providers cannot reset password here. Please contact your admin.");
      return;
    }

    setResetData({
      role: selectedRole,
      email: email.trim().toLowerCase(),
      phone: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowForgotModal(true);
  };

  const handleResetChange = (e) => {
    setResetData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetData.email.trim() || !resetData.phone.trim() || !resetData.newPassword.trim() || !resetData.confirmPassword.trim()) {
      toast.error("Please fill all reset fields.");
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      setResetLoading(true);
      await axios.post(`${apiUrl}/auth/forgot-password`, {
        role: resetData.role,
        email: resetData.email.trim().toLowerCase(),
        phone: resetData.phone.trim(),
        newPassword: resetData.newPassword,
      });

      toast.success("Password reset successful. Please log in.");
      setShowForgotModal(false);
      setSelectedRole(resetData.role);
      setEmail(resetData.email.trim().toLowerCase());
      setPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/auth/login`, {
        email:    email.trim().toLowerCase(),
        password,
        role:     selectedRole,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role);

      toast.success("Login successful");

      const role = res.data.role;
      if (role === "admin")    navigate("/admin");
      if (role === "provider") navigate("/provider");
      if (role === "user")     navigate("/user");

    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col overflow-y-auto bg-[#f8faff]`}>

      {/* ── Header ── */}
      <motion.div
        key={selectedRole}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative px-7 pt-10 pb-16 overflow-hidden"
        style={{ background: loading ? "#B0BEC5" : config.gradient }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>

          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 p-1 rounded-lg bg-white/20 flex items-center justify-center">
              <img src={logo} alt="SASMS" className="w-full h-full object-contain" />
            </div>
            <span className="text-white dark:text-gray-300 text-wrap font-bold text-sm tracking-wide">
              Smart Asset &amp; Service Management System
            </span>
          </div>

          <h1 className="text-white dark:text-gray-300 text-2xl font-extrabold mb-1">Welcome back</h1>
          <p className="text-white/75 dark:text-gray-300 text-sm">Sign in to your account to continue</p>

        </motion.div>
      </motion.div>

      {/* ── Form Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex-1 rounded-t-[28px] -mt-7 px-6 pb-10 shadow-xl z-10 dark:bg-gray-800 bg-white `}
      >

        {/* Role tabs */}
        <div className="my-6">
          <div className={`bg-gray-100 dark:bg-gray-700 flex rounded-2xl p-1 gap-1`}>
            {["admin", "provider", "user"].map((role) => {
              const rc     = roleConfig[role];
              const active = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-xl transition-all duration-200
                    ${active ? ` bg-white dark:bg-gray-400 shadow font-bold text-gray-800` : `text-gray-400 font-medium`}`}
                  style={active ? { color: rc.color } : {}}
                >
                  {rc.icon}
                  {rc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`flex items-start gap-2 text-xs font-semibold rounded-xl px-3 py-3 mb-4  bg-red-50 border border-red-100 text-red-600`}
            >
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div className="mb-4">
          <label className={`block text-xs font-semibold mb-1.5 dark:text-gray-400 text-gray-700`}>
            Email Address
          </label>
          <div className="relative">
            <Mail size={15} className={`absolute left-3 top-3.5 dark:text-gray-100 text-gray-400`} />
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
              placeholder={config.placeholder}
              autoComplete="email"
              className={`w-full pl-9 pr-3 py-3 text-sm border rounded-xl outline-none focus:border-blue-400 transition-colors border-gray-200 dark:bg-gray-600 dark:border-gray-400 dark:text-gray-200 dark:focus:bg-gray-600 bg-gray-50 focus:bg-white`}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className={`block text-xs font-semibold mb-1.5 dark:text-gray-400 text-gray-700`}>
            Password
          </label>
          <div className="relative">
            <Lock size={15} className={`absolute left-3 top-3.5 dark:text-gray-100 text-gray-400`} />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={handlePassChange}
              onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={`w-full pl-9 pr-10 py-3 text-sm border rounded-xl outline-none focus:border-blue-400 transition-colors border-gray-200 bg-gray-50 focus:bg-white dark:bg-gray-600 dark:border-gray-400 dark:text-gray-200 dark:focus:bg-gray-600`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className={`absolute right-3 top-3.5 dark:text-gray-100 text-gray-400`}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        {selectedRole !== "provider" ? (
           <div className="text-right mb-6">
          <span
            onClick={openForgotPassword}
            className="text-xs font-semibold cursor-pointer hover:underline"
            style={{ color: config.color }}
          >
            Forgot Password?
          </span>
        </div>
        ) : (
          <div className="my-6"/>
        )}
      
        {/* Submit button */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-opacity active:scale-[0.98]"
          style={{
            background: loading ? "#B0BEC5" : config.gradient,
            transition: "background 0.3s",
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Signing in...
            </span>
          ) : (
            <>
              Sign In <ArrowRight size={17} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className={`flex-1 h-px bg-gray-200`} />
          <span className={`text-xs text-gray-400`}>or</span>
          <div className={`flex-1 h-px bg-gray-200`} />
        </div>

        {/* Register / Provider note */}
        {selectedRole === "provider" ? (
          <div className={`text-center text-xs leading-relaxed px-4 text-gray-400`}>
            <UserCog size={16} className={`mx-auto mb-1.5 dark:text-gray-400 text-gray-500`} />
            Providers cannot self-register. Contact your store admin to receive login credentials.
          </div>
        ) : (
          <div className={`text-center text-sm text-gray-500`}>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="font-bold cursor-pointer hover:underline"
              style={{ color: config.color }}
            >
              Register
            </span>
          </div>
        )}

      </motion.div>

      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:justify-center"
            onClick={() => setShowForgotModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full h-[72vh] overflow-y-auto sm:max-w-md rounded-t-[28px] sm:rounded-[28px] px-6 pt-6 pb-7 shadow-xl dark:bg-gray-800 dark:text-gray-400 text-black bg-white`}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-extrabold">Reset Password</h2>
                  <p className={`text-sm mt-1 text-gray-500`}>
                    Verify your role, email, and phone number to set a new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className={`p-2 rounded-xl bg-gray-100 text-gray-600`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mb-4">
                <label className={`block text-xs font-semibold mb-1.5`}>
                  Account Role
                </label>
                <div className={`bg-gray-100 flex rounded-2xl p-1 gap-1`}>
                  {["admin", "provider", "user"].map((role) => {
                    const rc = roleConfig[role];
                    const active = resetData.role === role;
                    const disabled = role === "provider";
                    return (
                      <button
                        key={role}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return;
                          setResetData((prev) => ({ ...prev, role }));
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-xl transition-all duration-200 ${active ? `bg-white text-gray-800 shadow font-bold` : `text-gray-400 font-medium`} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={active ? { color: rc.color } : {}}
                      >
                        {rc.icon}
                        {rc.label}
                      </button>
                    );
                  })}
                </div>
                <p className={`mt-2 text-xs text-gray-500`}>
                  Provider passwords can only be created or updated by the admin.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 `}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className={`absolute left-3 top-3.5 text-gray-400`} />
                    <input
                      type="email"
                      name="email"
                      value={resetData.email}
                      onChange={handleResetChange}
                      placeholder="Enter your account email"
                      className={`w-full pl-9 pr-3 py-3 text-sm border rounded-xl outline-none focus:border-blue-400 border-gray-200 dark:bg-gray-700 bg-gray-50`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 `}>
                    Registered Phone
                  </label>
                  <div className="relative">
                    <Phone size={15} className={`absolute left-3 top-3.5 text-gray-400`} />
                    <input
                      type="text"
                      name="phone"
                      value={resetData.phone}
                      onChange={handleResetChange}
                      placeholder="Enter registered phone number"
                      className={`w-full pl-9 pr-3 py-3 text-sm border rounded-xl outline-none focus:border-blue-400 border-gray-200 dark:bg-gray-700 bg-gray-50 `}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5`}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className={`absolute left-3 top-3.5 text-gray-400`} />
                    <input
                      type="password"
                      name="newPassword"
                      value={resetData.newPassword}
                      onChange={handleResetChange}
                      placeholder="Create a new password"
                      className={`w-full pl-9 pr-3 py-3 text-sm border rounded-xl outline-none focus:border-blue-400 border-gray-200 dark:bg-gray-700 bg-gray-50 `}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className={`absolute left-3 top-3.5 text-gray-400`} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={resetData.confirmPassword}
                      onChange={handleResetChange}
                      placeholder="Confirm the new password"
                      className={`w-full pl-9 pr-3 py-3 text-sm border rounded-xl outline-none focus:border-blue-400 border-gray-200 dark:bg-gray-700 bg-gray-50 `}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3.5 rounded-xl text-white font-bold shadow-lg disabled:opacity-60"
                  style={{ background: roleConfig[resetData.role].gradient }}
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
