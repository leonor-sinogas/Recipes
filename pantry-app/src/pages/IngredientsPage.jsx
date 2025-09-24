// src/pages/IngredientsPage.jsx
import React, { useMemo } from "react";
import Chip from "../components/Chip";

export default function IngredientsPage({
  allIngredients,
  ingredientCategoryMap,
  selected,
  toggle,
  onClear, // Clear All handler from App.jsx
}) {
  // Build: { category -> [ingredient, ...] }, sorted
  const grouped = useMemo(() => {
    const map = new Map(); // category -> array of names
    for (const name of allIngredients) {
      const cat = ingredientCategoryMap.get(name) || "other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(name);
    }
    // sort ingredients within each category
    for (const arr of map.values()) arr.sort((a, b) => a.localeCompare(b));
    // sort categories (alpha, but put "other" last)
    const cats = Array.from(map.keys())
      .sort((a, b) => {
        if (a === "other") return 1;
        if (b === "other") return -1;
        return a.localeCompare(b);
      });
    return { map, cats };
  }, [allIngredients, ingredientCategoryMap]);

  return (
    <div className="page">
      <h2 className="page__title">Your Ingredients</h2>
      <p className="page__hint">
        Tap ingredients to toggle. Selected: {selected.size}
      </p>

      {/* Actions */}
      <div className="ingredients-actions">
        <button className="chip" onClick={onClear}>Clear All</button>
      </div>

      {/* Grouped lists */}
      <div className="ingredient-groups">
        {grouped.cats.map((cat) => {
          const items = grouped.map.get(cat) || [];
          return (
            <section key={cat} className="ingredient-group">
              <h3 className="ingredient-group__title">{cat}</h3>
              {items.length === 0 ? (
                <p className="empty">No items.</p>
              ) : (
                <div className="chips">
                  {items.map((name) => (
                    <Chip
                      key={name}
                      active={selected.has(name)}
                      onClick={() => toggle(name)}
                    >
                      {name}
                    </Chip>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
