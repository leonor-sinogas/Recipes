// src/components/Chip.jsx
import React from "react";

export default function Chip({ active, children, onClick }) {
  return (
    <button className={`chip ${active ? "chip--active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}
