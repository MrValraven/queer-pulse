import { ESLint } from "eslint";

const eslint = new ESLint({
  overrideConfig: {
    rules: {
      // Turn ON control-has-associated-label WITHOUT ignoring input/textarea,
      // so we see every unlabeled control.
      "jsx-a11y/control-has-associated-label": [
        "warn",
        {
          labelAttributes: [],
          controlComponents: [],
          ignoreElements: ["audio", "canvas", "embed", "video", "tr"],
          ignoreRoles: [
            "grid",
            "listbox",
            "menu",
            "menubar",
            "radiogroup",
            "row",
            "tablist",
            "toolbar",
            "tree",
            "treegrid",
          ],
          depth: 5,
        },
      ],
    },
  },
});

import { readFileSync } from "node:fs";

const results = await eslint.lintFiles(["src/**/*.tsx"]);
const byElement = new Map();
const formHits = []; // input/select/textarea only
for (const r of results) {
  let srcLines = null;
  for (const m of r.messages) {
    if (m.ruleId !== "jsx-a11y/control-has-associated-label") continue;
    if (!srcLines) srcLines = readFileSync(r.filePath, "utf8").split("\n");
    const line = srcLines[m.line - 1] ?? "";
    // element name is at the reported column
    const tail = line.slice(m.column - 1);
    const mm = tail.match(/^<\s*([A-Za-z][\w.]*)/);
    const el = mm ? mm[1] : "??:" + tail.slice(0, 20);
    byElement.set(el, (byElement.get(el) ?? 0) + 1);
    if (["input", "select", "textarea"].includes(el)) {
      const rel = r.filePath.replace(`${process.cwd()}/`, "");
      formHits.push(`${rel}:${m.line}  ${line.trim().slice(0, 90)}`);
    }
  }
}
console.log("=== by element type ===");
for (const [el, n] of [...byElement.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`${String(n).padStart(4)}  ${el}`);
}
console.log(`\n=== input/select/textarea hits: ${formHits.length} ===`);
for (const h of formHits) console.log(h);
