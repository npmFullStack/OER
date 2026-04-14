// src/components/Select.jsx
import React from "react";
import Select from "react-select";

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  isClearable = true,
  isSearchable = true,
  className = "",
  error = null,
  label = null,
  required = false,
}) => {
  // Convert options to react-select format if they're not already
  const formattedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );

  // Find the selected option object
  const selectedOption =
    formattedOptions.find((opt) => opt.value === value) || null;

  // Custom styles to match your design system
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#f9fafb",
      borderColor: state.isFocused ? "#2563eb" : "#e5e7eb",
      borderWidth: "1px",
      borderRadius: "0.5rem",
      padding: "0.125rem 0",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(37, 99, 235, 0.2)" : "none",
      "&:hover": {
        borderColor: "#2563eb",
      },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? "#2563eb" : isFocused ? "#eff6ff" : "white",
      color: isSelected ? "white" : "#1f2937",
      cursor: "pointer",
      "&:active": {
        backgroundColor: isSelected ? "#2563eb" : "#dbeafe",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1f2937",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      "&:hover": {
        color: "#374151",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      "&:hover": {
        color: "#ef4444",
      },
    }),
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-textSecondary mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select
        options={formattedOptions}
        value={selectedOption}
        onChange={(selected) => onChange(selected ? selected.value : "")}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        styles={customStyles}
        classNamePrefix="react-select"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default CustomSelect;
