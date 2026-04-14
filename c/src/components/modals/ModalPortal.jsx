// src/components/modals/ModalPortal.jsx
import React from "react";
import ReactDOM from "react-dom";

const ModalPortal = ({ children, isOpen }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    children,
    document.getElementById("modal-root") || document.body,
  );
};

export default ModalPortal;
