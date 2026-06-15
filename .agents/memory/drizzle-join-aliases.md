---
name: Drizzle ORM join aliases
description: When using table aliases in SQL expressions within Drizzle's select builder, aliased names like `p.first_name` cause "missing FROM-clause entry" errors. Also, sql.raw() does not handle parameter binding.
---

## Rule
For complex multi-table joins that need column aliases (e.g., `concat(p.first_name, ' ', p.last_name)`), use `db.execute(sql\`...\`)` with a raw SQL base query string + `sql.raw()` for the static part and `sql\`\`` template tags for dynamic WHERE values.

**Pattern used in HanapCare:**
```ts
const BASE_QUERY = `SELECT a.id, concat(p.first_name, ...) FROM appointments a LEFT JOIN patients p ON ...`;

// No params:
const r = await db.execute(sql`${sql.raw(BASE_QUERY)} ORDER BY a.id`);

// With param:
const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE a.date = ${someDate}`);
```

**Why:** Drizzle's `.select()` builder generates SQL using full table names (not aliases), so `sql\`concat(p.first_name, ...)\`` inside the builder refers to alias `p` which doesn't exist in the generated SQL. The `sql` template tag properly parameterizes values; `sql.raw()` does NOT — it just injects the string as-is with no parameter binding.

**How to apply:** Any route needing cross-table joined columns with aliases → use raw SQL approach above. Simple single-table queries → use Drizzle's builder normally.
