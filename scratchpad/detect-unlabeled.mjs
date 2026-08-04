// Precise unlabeled-control detector.
// Flags <input>/<select>/<textarea> that have NONE of:
//  - an id referenced by a <label htmlFor> anywhere in the same file
//  - aria-label / aria-labelledby / title
//  - a wrapping <label> ancestor
//  - being a direct child of <FormField> (which injects id + htmlFor)
//  - a {...spread} that could carry labelling props (conservatively skipped)
//  - type="hidden" | type="submit" | type="reset" | type="button" | type="image"
import ts from "typescript";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const files = globSync("src/**/*.tsx");
const SKIP_INPUT_TYPES = new Set(["hidden", "submit", "reset", "button", "image"]);
const hits = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  // Collect all htmlFor targets in the file.
  const htmlForTargets = new Set();
  function collectFor(node) {
    if (ts.isJsxAttribute(node) && node.name.getText() === "htmlFor" && node.initializer) {
      const init = node.initializer;
      if (ts.isStringLiteral(init)) htmlForTargets.add(init.text);
      else if (ts.isJsxExpression(init) && init.expression) {
        if (ts.isStringLiteral(init.expression)) htmlForTargets.add(init.expression.text);
        else htmlForTargets.add("__dynamic__"); // dynamic htmlFor — assume it can match
      }
    }
    ts.forEachChild(node, collectFor);
  }
  collectFor(sf);
  const hasDynamicFor = htmlForTargets.has("__dynamic__");

  function getAttrs(opening) {
    const map = new Map();
    let hasSpread = false;
    for (const prop of opening.attributes.properties) {
      if (ts.isJsxSpreadAttribute(prop)) { hasSpread = true; continue; }
      if (ts.isJsxAttribute(prop)) {
        const name = prop.name.getText();
        let val = true;
        const init = prop.initializer;
        if (init && ts.isStringLiteral(init)) val = init.text;
        else if (init && ts.isJsxExpression(init) && init.expression) {
          val = ts.isStringLiteral(init.expression) ? init.expression.text : "__expr__";
        }
        map.set(name, val);
      }
    }
    return { map, hasSpread };
  }

  function hasLabelAncestor(node) {
    let cur = node.parent;
    while (cur) {
      if (ts.isJsxElement(cur)) {
        const tag = cur.openingElement.tagName.getText();
        if (tag === "label") return true;
        if (tag === "FormField") return true;
      }
      cur = cur.parent;
    }
    return false;
  }

  function walk(node) {
    let opening = null;
    let el = null;
    if (ts.isJsxElement(node)) { opening = node.openingElement; el = opening.tagName.getText(); }
    else if (ts.isJsxSelfClosingElement(node)) { opening = node; el = node.tagName.getText(); }

    if (opening && (el === "input" || el === "select" || el === "textarea")) {
      const { map, hasSpread } = getAttrs(opening);
      const type = map.get("type");
      if (!(el === "input" && typeof type === "string" && SKIP_INPUT_TYPES.has(type))) {
        const hasAria =
          map.has("aria-label") || map.has("aria-labelledby") || map.has("title");
        const id = map.get("id");
        let idLabelled = false;
        if (typeof id === "string" && htmlForTargets.has(id)) idLabelled = true;
        if (id === "__expr__" && hasDynamicFor) idLabelled = true;
        const wrapped = hasLabelAncestor(node);
        if (!hasAria && !idLabelled && !wrapped && !hasSpread) {
          const line = sf.getLineAndCharacterOfPosition(opening.getStart()).line + 1;
          hits.push(`${file}:${line}  <${el}${id ? ` id=${JSON.stringify(id)}` : ""}${type ? ` type=${type}` : ""}>`);
        }
      }
    }
    ts.forEachChild(node, walk);
  }
  walk(sf);
}

console.log(`GENUINELY UNLABELED: ${hits.length}\n`);
for (const h of hits.sort()) console.log(h);
