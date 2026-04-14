// src/components/ActionMenu.jsx
import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

const ActionMenu = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Actions"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Book
          </button>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Book
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
