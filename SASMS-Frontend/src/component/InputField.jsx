import React from 'react'

export default function InputField({ label, icon, name, placeholder, type = "text", value, onChange }) {
  return (
    <div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {label}
            </label>
        
            <div className="relative">
        
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
              </div>
        
              <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-3 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-blue-500"
              />
        
            </div>
          </div>
      
    </div>
  )
}
