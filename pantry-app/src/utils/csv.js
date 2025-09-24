// src/utils/csv.js
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    // If it's a recipe row (title/category/time first), rest are ingredients
    if ("title" in row && "category" in row && "time" in row) {
      row.ingredients = cells.slice(3).map((c) => c.trim()).filter(Boolean);
    }
    return row;
  });
}

export function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}
