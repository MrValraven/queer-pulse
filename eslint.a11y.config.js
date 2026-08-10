import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import {
  jsxA11yWarnings,
  controlHasAssociatedLabelOptions,
} from "./eslint.config.js";

/**
 * FAST accessibility-only ESLint config, consumed by scripts/report-a11y.mjs.
 *
 * WHY THIS EXISTS: the main eslint.config.js enables typescript-eslint's
 * `recommendedTypeChecked` with `projectService: true`, which boots the full
 * TypeScript type-checker for every file — a second whole-project typecheck on
 * top of `tsc -b`. That is what makes a plain `eslint .` take ~60s. The a11y
 * ratchet only reads `jsx-a11y/*` messages, and EVERY jsx-a11y rule is purely
 * syntactic (it walks the JSX AST; it needs no type information). So this config
 * keeps the TypeScript PARSER (so .ts/.tsx syntax parses) but omits
 * `projectService` entirely — no type-checker boot, an order of magnitude
 * faster, and identical jsx-a11y output.
 *
 * IN LOCKSTEP WITH THE GATE: the jsx-a11y rule surface is imported from
 * eslint.config.js (`jsxA11yWarnings` = the recommended set forced to "warn",
 * plus `controlHasAssociatedLabelOptions` for the one non-recommended rule the
 * gate adds). It is a SINGLE SOURCE OF TRUTH — do not fork the rule list here,
 * or the ratchet count (scripts/report-a11y.mjs, BUDGET = 0) would drift from
 * what `pnpm lint` actually enforces. Severity (warn vs the gate's promoted
 * "error"s) is irrelevant to the count: the reporter counts messages of any
 * severity, and jsx-a11y rule OPTIONS — the only thing that changes which sites
 * fire — are identical because they come from the same exports.
 *
 * Globs and ignores mirror the gate's first config block so coverage matches.
 */
export default defineConfig([
  globalIgnores(["dist", "coverage", ".superpowers"]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "jsx-a11y": jsxA11y },
    languageOptions: {
      // The TypeScript parser handles .ts/.tsx SYNTAX. Crucially, no `project`
      // / `projectService` is set, so it never invokes the type-checker — this
      // is the entire speedup. jsx is auto-enabled for the .tsx extension.
      parser: tseslint.parser,
    },
    rules: {
      ...jsxA11yWarnings,
      "jsx-a11y/control-has-associated-label": [
        "warn",
        controlHasAssociatedLabelOptions,
      ],
    },
  },
]);
