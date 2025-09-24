import React from "react";
import RecipeCard from "../components/RecipeCard";
import { normalizeName } from "../utils/csv";

export default function AllRecipesPage({ recipes, selected, onOpen, saved, onToggleSaved }) {
  function score(r) {
    const ing = r.ingredients.map(normalizeName);
    const matched = ing.filter((i) => selected.has(i)).length;
    const missing = ing.length - matched;
    return { matched, missing };
  }

  return (
    <div className="page">
      <h2 className="page__title">All Recipes</h2>
      {recipes.map((r) => {
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
    </div>
  );
}
