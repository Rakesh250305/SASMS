import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import logo from '../assets/main-Logo.png'

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 2800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400">

      {/* Background circles */}
      <div className="absolute w-72 h-72 bg-white/5 rounded-full -top-20 -right-20"></div>
      <div className="absolute w-56 h-56 bg-white/5 rounded-full -bottom-16 -left-16"></div>
      <div className="absolute w-32 h-32 bg-white/5 rounded-full top-1/3 -right-10"></div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:30px_30px]"></div>

      {/* Logo & Branding */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="z-10 flex flex-col items-center"
      >

        {/* App icon */}
        <div className="h-full p-2 mb-6 flex items-center justify-center rounded-3xl bg-white/20 border border-white/30 shadow-2xl backdrop-blur-lg">
          <img className="h-20 " src={logo} alt="Logo" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h1 className="text-white text-2xl font-extrabold">Smart</h1>
          <h1 className="text-white text-2xl font-extrabold">Asset & Service</h1>

          <p className="text-white/80 text-xs tracking-[3px] uppercase mt-1">
            Management System
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 px-4 py-1 bg-white/20 rounded-full"
        >
          <span className="text-white/90 text-[11px]">
            Manage. Track. Deliver.
          </span>
        </motion.div>

      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex gap-2 mt-12 z-10"
      >
        {["Assets", "Services", "Providers"].map((tag) => (
          <div
            key={tag}
            className="px-3 py-1 text-[11px] text-white/90 bg-white/10 border border-white/20 rounded-full"
          >
            {tag}
          </div>
        ))}
      </motion.div>

      {/* Loading bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-16 left-6 right-6 flex flex-col items-center gap-3"
      >

        <div className="w-full h-[3px] bg-white/20 rounded">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 1.3 }}
            className="h-full bg-white rounded"
          />
        </div>

        <p className="text-white/60 text-xs">Loading...</p>

      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 text-white/40 text-[10px]">
        © 2026 SmartAsset & Service Management System.
      </div>

    </div>
  );
}