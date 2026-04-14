// src/components/StatCard.jsx
import React from "react";

const StatCard = ({ title, value, icon: Icon, description }) => {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 p-4 overflow-hidden transition-all duration-300 hover:border-blue-200 hover:shadow-md group">
      {/* Top accent line that appears on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/30 to-transparent rounded-full -mr-16 -mt-16" />

      <div className="relative flex items-center gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 p-2.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-blue-700 leading-tight">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-blue-400" />
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
