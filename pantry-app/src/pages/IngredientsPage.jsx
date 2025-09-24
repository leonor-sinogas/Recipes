// src/pages/IngredientsPage.jsx
import React, { useMemo, useState } from "react";
import Chip from "../components/Chip";

export default function IngredientsPage({
  allIngredients,
  ingredientCategoryMap,
  selected,
  toggle,
}) {
  const [activeCat, setActiveCat] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set(["all"]);
    allIngredients.forEach((name) => {
      const cat = ingredientCategoryMap.get(name) || "other";
      cats.add(cat);
    });
    return Array.from(cats);
  }, [allIngredients, ingredientCategoryMap]);

  const visible = useMemo(() => {
    if (activeCat === "all") return allIngredients;
    return allIngredients.filter(
      (name) => (ingredientCategoryMap.get(name) || "other") === activeCat
    );
  }, [allIngredients, activeCat, ingredientCategoryMap]);

  return (
    <div className="page">
      <h2 className="page__title">Your Ingredients</h2>
      <p className="page__hint">
        Choose a category, then tap ingredients you have. Selected: {selected.size}
      </p>

      <div className="chips" style={{ marginBottom: 12 }}>
        {categories.map((c) => (
          <Chip key={c} active={activeCat === c} onClick={() => setActiveCat(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="chips">
        {visible.length === 0 ? (
          <span className="empty">No ingredients in this category.</span>
        ) : (
          visible.map((name) => (
            <Chip key={name} active={selected.has(name)} onClick={() => toggle(name)}>
              {name}
            </Chip>
          ))
        )}
      </div>
    </div>
  );
}
