// src/components/modals/NewBookShelves.jsx
import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import ModalPortal from "./ModalPortal";

const NewBookShelves = ({ isOpen, onClose }) => {
  const [shelves, setShelves] = useState([
    { id: 1, name: "Aisle 1 - Left" },
    { id: 2, name: "Aisle 1 - Right" },
    { id: 3, name: "Aisle 2 - Left" },
    { id: 4, name: "Aisle 2 - Right" },
    { id: 5, name: "Aisle 3 - Left" },
    { id: 6, name: "Aisle 3 - Right" },
    { id: 7, name: "Reference Section" },
    { id: 8, name: "Reserve Section" },
    { id: 9, name: "Periodical Section" },
    { id: 10, name: "Multimedia Section" },
  ]);

  const [newShelfName, setNewShelfName] = useState("");

  const handleAddShelf = () => {
    if (newShelfName.trim()) {
      setShelves([
        ...shelves,
        {
          id: Date.now(),
          name: newShelfName,
        },
      ]);
      setNewShelfName("");
    }
  };

  const handleDeleteShelf = (id) => {
    setShelves(shelves.filter((shelf) => shelf.id !== id));
  };

  const handleSave = () => {
    // Here you would typically save the shelves to your backend/localStorage
    console.log("Saved shelves:", shelves);
    onClose();
  };

  return (
    <ModalPortal isOpen={isOpen}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - Smaller width */}
      <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
          {/* Header - Removed pin icon */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Book Shelves
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Add New Shelf Form - Removed location field */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Add New Shelf
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Shelf name (e.g., Aisle 4 - Left)"
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddShelf()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button
                onClick={handleAddShelf}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Shelves List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Existing Shelves ({shelves.length})
            </h3>
            <div className="space-y-2">
              {shelves.map((shelf) => (
                <div
                  key={shelf.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="font-medium text-gray-900">
                    {shelf.name}
                  </span>
                  <button
                    onClick={() => handleDeleteShelf(shelf.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Delete shelf"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default NewBookShelves;
