import React, { useEffect, useMemo, useState } from "react";

// -----------------------------------------------
// React app (no Tailwind)
// Tabs: Ingredients • All Recipes • Top 5 Picks
// Bottom menu for page switching
// Category prompt before showing recommendations
// -----------------------------------------------

const INGREDIENTS = [
  "egg", "milk", "butter", "flour", "sugar", "salt", "pepper",
  "tomato", "onion", "garlic", "olive oil", "chicken", "beef",
  "rice", "pasta", "spinach", "mushroom", "cheddar", "mozzarella",
  "yogurt", "banana", "strawberry", "chocolate", "baking powder",
  "oats", "lentils", "chickpeas", "tofu", "soy sauce", "lemon",
  "potato", "carrot", "celery", "cumin", "paprika", "coriander",
  "coconut milk", "black beans", "tortilla", "avocado"
];

const RECIPES = [
  { id: 1, title: "Classic Pancakes", category: "dessert", time: 20, ingredients: ["flour", "milk", "egg", "butter", "sugar", "baking powder", "salt"], },
  { id: 2, title: "Garlic Butter Pasta", category: "savory", time: 25, ingredients: ["pasta", "butter", "garlic", "olive oil", "parmesan", "pepper", "salt"], },
  { id: 3, title: "Chicken Rice Bowl", category: "savory", time: 30, ingredients: ["chicken", "rice", "onion", "garlic", "soy sauce", "spinach"], },
  { id: 4, title: "Chocolate Banana Overnight Oats", category: "dessert", time: 10, ingredients: ["oats", "milk", "banana", "chocolate", "yogurt"], },
  { id: 5, title: "Budget Lentil Curry", category: "budget", time: 35, ingredients: ["lentils", "onion", "garlic", "cumin", "coriander", "coconut milk", "tomato", "salt"], },
  { id: 6, title: "Tofu Veggie Stir-fry", category: "vegan", time: 20, ingredients: ["tofu", "soy sauce", "garlic", "onion", "spinach", "mushroom"], },
  { id: 7, title: "Tomato Basil Soup", category: "budget", time: 30, ingredients: ["tomato", "onion", "garlic", "olive oil", "salt", "pepper"], },
  { id: 8, title: "Veggie Tacos", category: "vegan", time: 25, ingredients: ["tortilla", "black beans", "onion", "tomato", "avocado", "cumin", "paprika"], },
  { id: 9, title: "Mushroom Risotto", category: "savory", time: 40, ingredients: ["rice", "mushroom", "onion", "garlic", "butter", "parmesan", "olive oil"], },
  { id: 10, title: "Strawberry Yogurt Parfait", category: "dessert", time: 5, ingredients: ["strawberry", "yogurt", "oats", "honey"], },
];

const EXTRA_INGREDIENTS = ["parmesan", "honey", "basil"];

const CATEGORIES = [
  { key: "dessert", label: "Dessert" },
  { key: "savory", label: "Savory Meal" },
  { key: "budget", label: "Meal on a Budget" },
  { key: "vegan", label: "Vegan" },
];

function normalizeName(name) {
  return String(name).trim().toLowerCase();
}

function scoreRecipe(recipe, selectedSet) {
  const ing = recipe.ingredients.map(normalizeName);
  let matched = 0;
  for (const x of ing) if (selectedSet.has(x)) matched++;
  const missing = ing.length - matched;
  return { matched, missing };
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        margin: "4px",
        borderRadius: "16px",
        border: active ? "2px solid black" : "1px solid gray",
        backgroundColor: active ? "black" : "white",
        color: active ? "white" : "black",
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  );
}

function RecipeCard({ recipe, matched, missing }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "12px", margin: "8px 0", overflow: "hidden" }}>
      <div style={{ padding: "12px" }}>
        <h3>{recipe.title}</h3>
        <small>{recipe.category} • {recipe.time} min</small>
        {typeof matched === "number" && (
          <div style={{ marginTop: "4px" }}>
            Matches: {matched} • Missing: {missing}
          </div>
        )}
      </div>
    </div>
  );
}

function IngredientsPage({ selected, toggle }) {
  const all = useMemo(() => {
    const s = new Set(INGREDIENTS.concat(EXTRA_INGREDIENTS));
    RECIPES.forEach(r => r.ingredients.forEach(i => s.add(normalizeName(i))));
    return Array.from(s).sort();
  }, []);

  return (
    <div>
      <h2>Your Ingredients</h2>
      <p>Tap ingredients you have. Selected: {selected.size}</p>
      <div>
        {all.map((name) => (
          <Chip key={name} active={selected.has(name)} onClick={() => toggle(name)}>
            {name}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function AllRecipesPage({ selected }) {
  return (
    <div>
      <h2>All Recipes</h2>
      {RECIPES.map((r) => {
        const { matched, missing } = scoreRecipe(r, selected);
        return <RecipeCard key={r.id} recipe={r} matched={matched} missing={missing} />;
      })}
    </div>
  );
}

function RecommendationsPage({ selected, category, setCategory }) {
  const filtered = useMemo(() => {
    const pool = category ? RECIPES.filter(r => r.category === category) : [];
    const scored = pool.map(r => ({ r, ...scoreRecipe(r, selected) }));
    scored.sort((a, b) => {
      if (b.matched !== a.matched) return b.matched - a.matched;
      if (a.missing !== b.missing) return a.missing - b.missing;
      return a.r.time - b.r.time;
    });
    return scored.slice(0, 5);
  }, [selected, category]);

  return (
    <div>
      <h2>Top 5 Picks</h2>
      <p>Select a category to continue.</p>
      <div>
        {CATEGORIES.map(c => (
          <Chip key={c.key} active={category === c.key} onClick={() => setCategory(c.key)}>
            {c.label}
          </Chip>
        ))}
        {category && (
          <button onClick={() => setCategory("")} style={{ marginLeft: "8px" }}>Clear</button>
        )}
      </div>
      {!category ? (
        <p>Choose a category above to see recommendations.</p>
      ) : filtered.length === 0 ? (
        <p>No matches yet. Try selecting more ingredients.</p>
      ) : (
        <div>
          {filtered.map((x) => (
            <RecipeCard key={x.r.id} recipe={x.r} matched={x.matched} missing={x.missing} />
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
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1px solid #ddd", background: "#f8f8f8", display: "flex", justifyContent: "space-around", padding: "8px 0" }}>
      {items.map(it => (
        <button key={it.key} onClick={() => setTab(it.key)} style={{ fontWeight: tab === it.key ? "bold" : "normal" }}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("ingredients");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(new Set());

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

  function toggle(name) {
    const n = normalizeName(name);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  }

  return (
    <div style={{ paddingBottom: "60px" }}>
      <h1>What Can I Cook?</h1>
      {tab === "ingredients" && <IngredientsPage selected={selected} toggle={toggle} />}
      {tab === "all" && <AllRecipesPage selected={selected} />}
      {tab === "picks" && <RecommendationsPage selected={selected} category={category} setCategory={setCategory} />}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
