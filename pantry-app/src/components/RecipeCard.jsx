// src/components/RecipeCard.jsx
import React from "react";

export default function RecipeCard({ recipe, matched, missing, onOpen }) {
  return (
    <div className="card" onClick={onOpen} style={{ cursor: "pointer" }}>
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
