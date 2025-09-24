import React from "react";
import RecipeCard from "../components/RecipeCard";
import { normalizeName } from "../utils/csv";

export default function SavedRecipesPage({
  recipes,
  saved,
  selected,
  onOpen,
  onToggleSaved,
}) {
  const savedList = recipes.filter((r) => saved.has(r.title));

  function score(r) {
    const ing = r.ingredients.map(normalizeName);
    const matched = ing.filter((i) => selected.has(i)).length;
    const missing = ing.length - matched;
    return { matched, missing };
  }

  return (
    <div className="page">
      <h2 className="page__title">Saved Recipes</h2>
      {savedList.length === 0 ? (
        <p className="empty">
          You haven’t saved any recipes yet. Tap the ★ on a card to save one.
        </p>
      ) : (
        savedList.map((r) => {
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
        })
      )}
    </div>
  );
}
