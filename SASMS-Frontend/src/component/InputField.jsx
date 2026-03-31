import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function InputField({ label, icon, name, placeholder, type = "text", value, onChange, error, dark = false }) {
  const [show, setShow] = useState(false);

  const isPassword = type === "password";
  return (
    <div>
      <div className="mb-4">
        <label className={`block text-xs font-semibold mb-2 ${dark ? "text-slate-200" : "text-gray-700"}`}>
          {label}
        </label>

        <div className="relative">

          <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-slate-400" : "text-gray-400"}`}>
            {icon}
          </div>

          <input
            name={name}
            type={isPassword ? (show ? "text" : "password") : type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full pl-10 pr-3 py-3 text-sm border rounded-xl outline-none focus:border-blue-500 ${
              dark ? "bg-slate-800 text-white placeholder:text-slate-400" : "bg-gray-50"
            } ${
              error ? "border-red-400" : dark ? "border-slate-700" : "border-gray-200"
            }`}
          />

          {/* Eye icon */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow(!show)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${dark ? "text-slate-400" : "text-gray-400"}`}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}

        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

    </div>
  )
}
