import React, { useMemo } from "react";
import Chip from "../components/Chip";
import RecipeCard from "../components/RecipeCard";
import { normalizeName } from "../utils/csv";

// New cookbook-style categories
const CATEGORIES_UI = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks / Light bites",
  "Appetizers / Starters",
  "Side dishes",
  "Main courses",
  "Desserts",
  "Breads & baked goods",
  "Drinks & cocktails",
];

export default function RecommendationsPage({
  recipes,
  selected,
  category,
  setCategory,
  onOpen,
  saved,
  onToggleSaved,
}) {
  const filtered = useMemo(() => {
    const pool = category ? recipes.filter((r) => r.category === category) : [];
    const scored = pool.map((r) => {
      const ing = r.ingredients.map(normalizeName);
      const matched = ing.filter((i) => selected.has(i)).length;
      const missing = ing.length - matched;
      return { r, matched, missing };
    });
    scored.sort((a, b) => {
      if (b.matched !== a.matched) return b.matched - a.matched;
      if (a.missing !== b.missing) return a.missing - b.missing;
      return a.r.time - b.r.time;
    });
    return scored.slice(0, 5);
  }, [recipes, selected, category]);

  return (
    <div className="page">
      <h2 className="page__title">Top 5 Picks</h2>
      <p className="page__hint">Select a category to continue.</p>

      <div className="chips">
        {CATEGORIES_UI.map((label) => (
          <Chip
            key={label}
            active={category === label}
            onClick={() => setCategory(label)}
          >
            {label}
          </Chip>
        ))}
        {category && (
          <button className="link-clear" onClick={() => setCategory("")}>
            Clear
          </button>
        )}
      </div>

      {!category ? (
        <p className="empty">Choose a category above to see recommendations.</p>
      ) : filtered.length === 0 ? (
        <p className="empty">No matches yet. Try selecting more ingredients.</p>
      ) : (
        <div>
          {filtered.map((x) => (
            <RecipeCard
              key={x.r.title}
              recipe={x.r}
              matched={x.matched}
              missing={x.missing}
              onOpen={() => onOpen(x.r)}
              saved={saved.has(x.r.title)}
              onToggleSave={() => onToggleSaved(x.r.title)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
