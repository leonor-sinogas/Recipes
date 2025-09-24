// src/pages/RecipeDetailPage.jsx
import React from "react";
import { normalizeName } from "../utils/csv";

export default function RecipeDetailPage({ recipe, selected, onBack }) {
  const ing = recipe.ingredients.map(normalizeName);
  const have = ing.filter((i) => selected.has(i));
  const missing = ing.filter((i) => !selected.has(i));

  return (
    <div className="page">
      <button className="chip" onClick={onBack} style={{ marginBottom: 12 }}>
        ← Back
      </button>
      <h2 className="page__title">{recipe.title}</h2>
      <p className="page__hint">
        {recipe.category} • {recipe.time} min
      </p>

      <h3 style={{ marginTop: 12 }}>Ingredients you have ({have.length})</h3>
      {have.length ? (
        <ul className="ing-list ing-list--have">
          {have.map((i) => (
            <li key={`have-${i}`}>{i}</li>
          ))}
        </ul>
      ) : (
        <p className="empty">None selected yet.</p>
      )}

      <h3 style={{ marginTop: 16 }}>Ingredients you’re missing ({missing.length})</h3>
      {missing.length ? (
        <ul className="ing-list ing-list--missing">
          {missing.map((i) => (
            <li key={`miss-${i}`}>{i}</li>
          ))}
        </ul>
      ) : (
        <p className="empty">You have everything!</p>
      )}
    </div>
  );
}
