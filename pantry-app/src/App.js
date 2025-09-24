import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/* --------- Simple CSV parser (expects commas, no quoted fields) --------- */
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    // rows from recipes.csv: everything after index 2 are ingredients
    if ("title" in row && "category" in row && "time" in row) {
      row.ingredients = cells.slice(3).map((c) => c.trim()).filter(Boolean);
    }
    return row;
  });
}

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

/* ------------------ UI bits ------------------ */
function Chip({ active, children, onClick }) {
  return (
    <button className={`chip ${active ? "chip--active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function RecipeCard({ recipe, matched, missing, onOpen }) {
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

/* ------------------ Pages ------------------ */
function IngredientsPage({ allIngredients, ingredientCategoryMap, selected, toggle }) {
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

      {/* Category filter bar */}
      <div className="chips" style={{ marginBottom: 12 }}>
        {categories.map((c) => (
          <Chip key={c} active={activeCat === c} onClick={() => setActiveCat(c)}>
            {c}
          </Chip>
        ))}
      </div>

      {/* Ingredient chips */}
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

function AllRecipesPage({ recipes, selected, onOpen }) {
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
          />
        );
      })}
    </div>
  );
}

const CATEGORIES_UI = [
  { key: "dessert", label: "Dessert" },
  { key: "savory", label: "Savory Meal" },
  { key: "budget", label: "Meal on a Budget" },
  { key: "vegan", label: "Vegan" },
];

function RecommendationsPage({ recipes, selected, category, setCategory, onOpen }) {
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
        {CATEGORIES_UI.map((c) => (
          <Chip key={c.key} active={category === c.key} onClick={() => setCategory(c.key)}>
            {c.label}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------- Recipe Detail Page -------- */
function RecipeDetailPage({ recipe, selected, onBack }) {
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

function BottomNav({ tab, setTab, show }) {
  if (!show) return null;
  const items = [
    { key: "ingredients", label: "Ingredients" },
    { key: "all", label: "All Recipes" },
    { key: "picks", label: "Top 5" },
  ];
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <button
          key={it.key}
          className={`bottom-nav__btn ${tab === it.key ? "is-active" : ""}`}
          onClick={() => setTab(it.key)}
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}

/* ------------------ App ------------------ */
export default function App() {
  const [tab, setTab] = useState("ingredients");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(new Set());

  const [recipes, setRecipes] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [ingredientCategoryMap, setIngredientCategoryMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  // simple in-app “router”: null = list views, object = detail page
  const [detailRecipe, setDetailRecipe] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("selectedIngredients");
      if (raw) setSelected(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("selectedIngredients", JSON.stringify(Array.from(selected)));
    } catch {}
  }, [selected]);

  // Load CSVs from /public/data with a base that works in dev & prod
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const BASE = process.env.PUBLIC_URL || "";
        const [recRes, ingRes] = await Promise.all([
          fetch(`${BASE}/data/recipes.csv`),
          fetch(`${BASE}/data/ingredients.csv`),
        ]);

        if (!recRes.ok) throw new Error("Failed to fetch recipes.csv");
        if (!ingRes.ok) throw new Error("Failed to fetch ingredients.csv");

        const [recTxt, ingTxt] = await Promise.all([recRes.text(), ingRes.text()]);
        const recRows = parseCSV(recTxt);
        const ingRows = parseCSV(ingTxt);

        // Parse recipes
        const recipesParsed = recRows.map((r) => ({
          title: r.title,
          category: r.category,
          time: Number(r.time),
          ingredients: (r.ingredients || []).map(normalizeName),
        }));

        // Build ingredient -> category map
        const map = new Map();
        ingRows.forEach((row) => {
          const name = normalizeName(row.name);
          const cat = normalizeName(row.category || "other") || "other";
          if (name) map.set(name, cat);
        });

        // Aggregate all unique ingredients from recipes
        const ingSet = new Set();
        recipesParsed.forEach((r) => r.ingredients.forEach((i) => ingSet.add(i)));

        // Ensure every ingredient has a category; default to "other"
        const completedMap = new Map(map);
        ingSet.forEach((i) => {
          if (!completedMap.has(i)) completedMap.set(i, "other");
        });

        setIngredientCategoryMap(completedMap);
        setAllIngredients(Array.from(ingSet).sort());
        setRecipes(recipesParsed);
        setLoadErr("");
      } catch (e) {
        setLoadErr(e.message || "Unknown load error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function toggle(name) {
    const n = normalizeName(name);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  // rendering
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
              toggle={toggle}
            />
          )}

          {tab === "all" && (
            <AllRecipesPage
              recipes={recipes}
              selected={selected}
              onOpen={(r) => setDetailRecipe(r)}
            />
          )}

          {tab === "picks" && (
            <RecommendationsPage
              recipes={recipes}
              selected={selected}
              category={category}
              setCategory={setCategory}
              onOpen={(r) => setDetailRecipe(r)}
            />
          )}
        </>
      )}

      <BottomNav tab={tab} setTab={setTab} show={showBottomNav} />
    </div>
  );
}
