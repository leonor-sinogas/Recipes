// src/pages/AllRecipesPage.jsx
import React, { useMemo } from "react";
import RecipeCard from "../components/RecipeCard";
import { normalizeName } from "../utils/csv";

// Display order for cookbook-style categories
const CATEGORY_ORDER = [
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

export default function AllRecipesPage({ recipes, selected, onOpen, saved, onToggleSaved }) {
  function score(r) {
    const ing = r.ingredients.map(normalizeName);
    const matched = ing.filter((i) => selected.has(i)).length;
    const missing = ing.length - matched;
    return { matched, missing };
  }

  const grouped = useMemo(() => {
    const map = new Map(); // category -> array of recipes
    for (const r of recipes) {
      const cat = r.category || "Uncategorized";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(r);
    }

    // Build category list: known categories in fixed order, then any extras alphabetically
    const extras = Array.from(map.keys()).filter(c => !CATEGORY_ORDER.includes(c)).sort();
    const order = CATEGORY_ORDER.concat(extras);

    return { map, order };
  }, [recipes]);

  return (
    <div className="page">
      <h2 className="page__title">All Recipes</h2>

      {grouped.order.map((cat) => {
        const items = grouped.map.get(cat) || [];
        if (!items.length) return null;

        return (
          <section key={cat} className="recipe-category">
            <h3 className="ingredient-group__title">{cat}</h3>
            {items.map((r) => {
              const { matched, missing } = score(r);
              return (
                <RecipeCard
                  key={r.title}
                  recipe={r}
                  matched={matched}
                  missing={missing}
                  onOpen={() => onOpen(r)}
                  saved={saved.has(r.title)}
                  onToggleSave={() => onToggleSaved(r.title)}
                />
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
