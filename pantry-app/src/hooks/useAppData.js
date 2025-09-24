// src/hooks/useAppData.js
import { useEffect, useState } from "react";
import { parseCSV, normalizeName } from "../utils/csv";

export function useAppData() {
  const [recipes, setRecipes] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [ingredientCategoryMap, setIngredientCategoryMap] = useState(new Map());
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  // restore pantry
  useEffect(() => {
    try {
      const raw = localStorage.getItem("selectedIngredients");
      if (raw) setSelected(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  // persist pantry
  useEffect(() => {
    try {
      localStorage.setItem("selectedIngredients", JSON.stringify(Array.from(selected)));
    } catch {}
  }, [selected]);

  // load CSVs
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

        const recipesParsed = recRows.map((r) => ({
          title: r.title,
          category: r.category,
          time: Number(r.time),
          ingredients: (r.ingredients || []).map(normalizeName),
        }));

        const catMap = new Map();
        ingRows.forEach((row) => {
          const name = normalizeName(row.name);
          const cat = normalizeName(row.category || "other") || "other";
          if (name) catMap.set(name, cat);
        });

        const ingSet = new Set();
        recipesParsed.forEach((r) => r.ingredients.forEach((i) => ingSet.add(i)));
        ingSet.forEach((i) => {
          if (!catMap.has(i)) catMap.set(i, "other");
        });

        setIngredientCategoryMap(catMap);
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

  function toggleIngredient(name) {
    const n = normalizeName(name);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  return {
    recipes,
    allIngredients,
    ingredientCategoryMap,
    selected,
    toggleIngredient,
    loading,
    loadErr,
  };
}
