import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import axios from "axios";
import logo from '../assets/main-Logo.png'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, UserCog, User } from "lucide-react";
import { toast } from "react-toastify";

const roleConfig = {
  admin: {
    label: "Admin",
    icon: <Shield size={16} />,
    color: "#1976D2",
    bg: "#EFF6FF",
    path: "/admin",
  },
  provider: {
    label: "Provider",
    icon: <UserCog size={16} />,
    color: "#86198f",
    bg: "#c026d3",
    path: "/provider",
  },
  user: {
    label: "User",
    icon: <User size={16} />,
    color: "#065f46",
    bg: "#d1fae5",
    path: "/user",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedRole, setSelectedRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const config = roleConfig[selectedRole];

const handleLogin = async (e) => {
  e.preventDefault();

    if (!email || !password) {
    toast.warning("Please fill all fields");
    return;
  }

  try {
    setLoading(true);
    const res = await axios.post(
      `${apiUrl}/auth/login`,
      {
        email,
        password,
        role: selectedRole
      }
    );
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    const role = res.data.role;

    if (role === "admin") navigate("/admin");
    if (role === "provider") navigate("/provider");
    if (role === "user") navigate("/user");

    toast.success("Login successful");
  } catch (err) {

    if (err.response && err.response.data) {
      toast.info(err.response.data.message);
    } else {
      toast.error("Server Error!");
    }

  }

  setLoading(false);
};

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faff] overflow-y-auto">

      {/* HEADER */}
      <div className={`relative px-7 pt-10 pb-16 overflow-hidden`}
      style={{
            background: loading
            ? "#B0BEC5"
            : `linear-gradient(135deg, ${config.color}, ${config.color}dd)`
          }}
      >

        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-8 -left-6 w-24 h-24 rounded-full bg-white/10"></div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-5">

            <div className="w-9 h-9 p-1 rounded-lg bg-white/20 flex items-center justify-center">
              <img src={logo} alt="" />
            </div>

            <span className="text-white font-bold text-sm tracking-wide">
              Smart Asset & Service 
            </span>

          </div>

          <h1 className="text-white text-2xl font-extrabold mb-1">
            Welcome back
          </h1>

          <p className="text-white/75 text-sm">
            Sign in to your account to continue
          </p>
          

        </motion.div>
      </div>

      {/* FORM CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white rounded-t-[28px] -mt-7 px-6 pt-7 pb-6 shadow-xl"
      >

        {/* ROLE TABS */}
        <div className="my-6">

          <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">

            {["admin","provider","user"].map((role) => {

              const rc = roleConfig[role];
              const active = selectedRole === role;

              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-xl transition
                  ${active ? "bg-white shadow text-black font-bold" : "text-gray-500"}`}
                >
                  {rc.icon}
                  {rc.label}
                </button>
              );

            })}

          </div>

        </div>

        {/* EMAIL */}
        <div className="mb-4">

          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Email
          </label>

          <div className="relative">

            <Mail size={16} className="absolute left-3 top-3.5 text-gray-400"/>

            <input
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full pl-9 pr-3 py-3 text-sm border rounded-xl bg-gray-50 outline-none focus:border-blue-500"
            />

          </div>

        </div>

        {/* PASSWORD */}
        <div className="mb-2">

          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Password
          </label>

          <div className="relative">

            <Lock size={16} className="absolute left-3 top-3.5 text-gray-400"/>

            <input
              type={showPass ? "text":"password"}
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full pl-9 pr-9 py-3 text-sm border rounded-xl bg-gray-50 outline-none focus:border-blue-500"
            />

            <button
              onClick={()=>setShowPass(!showPass)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>

          </div>

        </div>

        {/* FORGOT PASSWORD */}
        <div className="text-right mb-6">
          <span
            className="text-xs font-semibold cursor-pointer"
            style={{color:config.color}}
          >
            Forgot Password?
          </span>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          type="button"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg"
          style={{
            background: loading
            ? "#B0BEC5"
            : `linear-gradient(135deg, ${config.color}, ${config.color}dd)`
          }}
        >

          {loading ? "Signing in..." :
          <>
          Sign In
          <ArrowRight size={18}/>
          </>}

        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-[1px] bg-gray-200"></div>
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-[1px] bg-gray-200"></div>
        </div>

        {/* REGISTER */}
        <div className="text-center text-sm text-gray-500">
          <span>Don't have an account?</span>
          <span
            onClick={()=>navigate("/signup")}
            className="font-bold ml-1 cursor-pointer"
            style={{color:config.color}}
          >
            Register
          </span>
        </div>

     

      </motion.div>

    </div>
  );
}