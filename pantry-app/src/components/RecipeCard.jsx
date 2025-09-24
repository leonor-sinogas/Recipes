import React from "react";

export default function RecipeCard({ recipe, matched, missing, onOpen, saved = false, onToggleSave }) {
  return (
    <div className="card" onClick={onOpen} style={{ cursor: "pointer", position: "relative" }}>
      {/* Star button in top-right */}
      <button
        className={`star-btn ${saved ? "is-saved" : ""}`}
        aria-label={saved ? "Unsave recipe" : "Save recipe"}
        onClick={(e) => {
          e.stopPropagation(); // don’t open detail when clicking star
          onToggleSave && onToggleSave();
        }}
      >
        ★
      </button>

      <div className="card__body">
        <h3 className="card__title">{recipe.title}</h3>
        <small className="card__meta">
          {recipe.category} • {recipe.time} min
        </small>
        {typeof matched === "number" && (
          <div className="card__match">
            Matches: {matched} • Missing: {missing}
          </div>
        )}
      </div>
    </div>
  );
}
