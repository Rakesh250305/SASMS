import React from "react";

const statusConfig = {
  available: {
    label: "Available",
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  assigned: {
    label: "Assigned",
    bg: "bg-purple-100",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  unavailable: {
    label: "Unvailable",
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-500",
  },
  "out of stock": {
    label: "Out of stock",
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  maintenance: {
    label: "Maintenance",
    bg: "bg-orange-100",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  pending: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  active: {
    label: "Active",
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  inactive: {
    label: "Inactive",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

export default function StatusBadge({ status, small }) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-3xl h-[5vh] font-semibold whitespace-nowrap
      ${config.bg} ${config.text}
      ${small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}`}
    >
      <span
        className={`rounded-full ${config.dot} ${
          small ? "w-1.5 h-1.5" : "w-2 h-2"
        }`}
      ></span>

      {config.label}
    </span>
  );
}