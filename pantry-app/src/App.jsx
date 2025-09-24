import React, { useState } from "react";
import "./App.css";

import IngredientsPage from "./pages/IngredientsPage";
import AllRecipesPage from "./pages/AllRecipesPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import SavedRecipesPage from "./pages/SavedRecipesPage";

import BottomNav from "./components/BottomNav";
import { useAppData } from "./hooks/useAppData";

export default function App() {
  const {
    recipes,
    allIngredients,
    ingredientCategoryMap,
    selected,
    toggleIngredient,
    clearPantry,
    saved,
    toggleSaved,
    loading,
    loadErr,
  } = useAppData();

  const [tab, setTab] = useState("ingredients");
  const [category, setCategory] = useState("");
  const [detailRecipe, setDetailRecipe] = useState(null);

  if (loading) {
    return (
      <div className="app">
        <header className="app__header">
          <h1 className="app__title">What Can I Cook?</h1>
        </header>
        <div className="page"><p>Loading data…</p></div>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="app">
        <header className="app__header">
          <h1 className="app__title">What Can I Cook?</h1>
        </header>
        <div className="page"><p style={{ color: "#b00020" }}>Error: {loadErr}</p></div>
      </div>
    );
  }

  const showBottomNav = !detailRecipe;

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">What Can I Cook?</h1>
      </header>

      {detailRecipe ? (
        <RecipeDetailPage
          recipe={detailRecipe}
          selected={selected}
          onBack={() => setDetailRecipe(null)}
        />
      ) : (
        <>
          {tab === "ingredients" && (
            <IngredientsPage
              allIngredients={allIngredients}
              ingredientCategoryMap={ingredientCategoryMap}
              selected={selected}
              toggle={toggleIngredient}
              onClear={clearPantry}
            />
          )}

          {tab === "all" && (
            <AllRecipesPage
              recipes={recipes}
              selected={selected}
              onOpen={(r) => setDetailRecipe(r)}
              saved={saved}
              onToggleSaved={toggleSaved}
            />
          )}

          {tab === "picks" && (
            <RecommendationsPage
              recipes={recipes}
              selected={selected}
              category={category}
              setCategory={setCategory}
              onOpen={(r) => setDetailRecipe(r)}
              saved={saved}
              onToggleSaved={toggleSaved}
            />
          )}

          {tab === "saved" && (
            <SavedRecipesPage
              recipes={recipes}
              saved={saved}
              selected={selected}
              onOpen={(r) => setDetailRecipe(r)}
              onToggleSaved={toggleSaved}
            />
          )}
        </>
      )}

      <BottomNav tab={tab} setTab={setTab} show={showBottomNav} />
    </div>
  );
}
