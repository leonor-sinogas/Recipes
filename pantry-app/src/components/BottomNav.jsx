import React from "react";

export default function BottomNav({ tab, setTab, show = true }) {
  if (!show) return null;
  const items = [
    { key: "ingredients", label: "Ingredients" },
    { key: "all", label: "All Recipes" },
    { key: "picks", label: "Top 5" },
    { key: "saved", label: "Saved" }, // 👈 new tab
  ];
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <button
          key={it.key}
          className={`bottom-nav__btn ${tab === it.key ? "is-active" : ""}`}
          onClick={() => setTab(it.key)}
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}
