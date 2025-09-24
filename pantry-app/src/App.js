import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/* --------- Simple CSV parser --------- */
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const cells = line.split(",").map(c => c.trim());
    const row = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    // For the ingredients column, grab everything after the 3rd index
    row.ingredients = cells.slice(3).map(c => c.trim()).filter(Boolean);
    return row;
  });
}



function normalizeName(name) {
  return String(name).trim().toLowerCase();
}

/* ------------------ UI bits ------------------ */
function Chip({ active, children, onClick }) {
  return (
    <button
      className={`chip ${active ? "chip--active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function RecipeCard({ recipe, matched, missing }) {
  return (
    <div className="card">
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
function IngredientsPage({ allIngredients, selected, toggle }) {
  return (
    <div className="page">
      <h2 className="page__title">Your Ingredients</h2>
      <p className="page__hint">
        Tap ingredients you have. Selected: {selected.size}
      </p>
      <div className="chips">
        {allIngredients.map((name) => (
          <Chip
            key={name}
            active={selected.has(name)}
            onClick={() => toggle(name)}
          >
            {name}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function AllRecipesPage({ recipes, selected }) {
  return (
    <div className="page">
      <h2 className="page__title">All Recipes</h2>
      {recipes.map((r) => {
        const ing = r.ingredients.map(normalizeName);
        const matched = ing.filter((i) => selected.has(i)).length;
        const missing = ing.length - matched;
        return (
          <RecipeCard
            key={r.title}
            recipe={r}
            matched={matched}
            missing={missing}
          />
        );
      })}
    </div>
  );
}

const CATEGORIES = [
  { key: "dessert", label: "Dessert" },
  { key: "savory", label: "Savory Meal" },
  { key: "budget", label: "Meal on a Budget" },
  { key: "vegan", label: "Vegan" },
];

function RecommendationsPage({ recipes, selected, category, setCategory }) {
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
        {CATEGORIES.map((c) => (
          <Chip
            key={c.key}
            active={category === c.key}
            onClick={() => setCategory(c.key)}
          >
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BottomNav({ tab, setTab }) {
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

  const [allIngredients, setAllIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("selectedIngredients");
      if (raw) setSelected(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "selectedIngredients",
        JSON.stringify(Array.from(selected))
      );
    } catch {}
  }, [selected]);

  // Load CSV
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/data/recipes.csv");
        if (!res.ok) throw new Error("Failed to fetch recipes.csv");
        const txt = await res.text();
        const rows = parseCSV(txt);

        const recipesParsed = rows.map((r) => ({
          title: r.title,
          category: r.category,
          time: Number(r.time),
          ingredients: r.ingredients.map(normalizeName),
        }));

        // collect all unique ingredients
        const ingSet = new Set();
        recipesParsed.forEach((r) =>
          r.ingredients.forEach((i) => ingSet.add(i))
        );
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
        <div className="page"><p style={{color:"#b00020"}}>Error: {loadErr}</p></div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">What Can I Cook?</h1>
      </header>

      {tab === "ingredients" && (
        <IngredientsPage
          allIngredients={allIngredients}
          selected={selected}
          toggle={toggle}
        />
      )}

      {tab === "all" && (
        <AllRecipesPage recipes={recipes} selected={selected} />
      )}

      {tab === "picks" && (
        <RecommendationsPage
          recipes={recipes}
          selected={selected}
          category={category}
          setCategory={setCategory}
        />
      )}

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
