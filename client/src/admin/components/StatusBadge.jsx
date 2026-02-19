import React from 'react'

const statusColors = {
  uploaded: "bg-gray-200 text-gray-800",
  processing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`px-2 py-1 rounded text-xs ${
        statusColors[status] || "bg-gray-200"
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

