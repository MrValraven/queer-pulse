import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

// Local rule: ban emoji glyphs in source — the platform uses react-icons instead
// of emoji (see CLAUDE.md). Country flags have no react-icons equivalent and are
// exempted per-file in the override block below.
const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
const localPlugin = {
  rules: {
    "no-emoji": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow emoji glyphs; use a react-icons icon instead.",
        },
        messages: {
          emoji:
            "Avoid emoji glyphs — use a react-icons icon (react-icons/fi) instead.",
        },
      },
      create(context) {
        const report = (node, text) => {
          if (typeof text === "string" && EMOJI.test(text)) {
            context.report({ node, messageId: "emoji" });
          }
        };
        return {
          Literal(node) {
            if (typeof node.value === "string") report(node, node.value);
          },
          JSXText(node) {
            report(node, node.value);
          },
          TemplateElement(node) {
            report(node, node.value?.raw);
          },
        };
      },
    },
    "no-literal-string": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow user-facing string literals in JSX; route copy through t() or <Translation>.",
        },
        messages: {
          literal:
            "Hardcoded user-facing string. Move it to a catalog and use t() or <Translation>.",
        },
      },
      create(context) {
        // Attributes a screen reader or the user actually reads.
        const USER_FACING_ATTRS = new Set([
          "aria-label",
          "placeholder",
          "title",
          "alt",
        ]);
        // Two+ consecutive letters = prose. Skips punctuation, "·", "→", numbers.
        const PROSE = /[A-Za-z]{2,}/;
        return {
          JSXText(node) {
            if (PROSE.test(node.value)) {
              context.report({ node, messageId: "literal" });
            }
          },
          JSXAttribute(node) {
            if (!USER_FACING_ATTRS.has(node.name?.name)) return;
            const value = node.value;
            if (
              value?.type === "Literal" &&
              typeof value.value === "string" &&
              PROSE.test(value.value)
            ) {
              context.report({ node, messageId: "literal" });
            }
          },
        };
      },
    },
  },
};

export default defineConfig([
  globalIgnores(["dist", "coverage"]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { local: localPlugin },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Underscore-prefixed args/vars are intentional throwaways.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Conventions from CLAUDE.md, enforced in CI:
      // 1. Icons over emoji (hard error — protects the icon sweep).
      "local/no-emoji": "error",
      // 2. Components stay small. Warn (non-breaking) — promote to error once the
      //    remaining oversized components are decomposed.
      "max-lines-per-function": [
        "warn",
        { max: 200, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      // 3. Design tokens, not hardcoded hex, in inline styles. Warn for now.
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXAttribute[name.name='style'] Literal[value=/#[0-9a-fA-F]{3,6}/]",
          message:
            "Use a design token (var(--…)) instead of a hardcoded hex colour in inline styles.",
        },
      ],
      // 4. Fast-refresh export purity. Fires on our deliberate "provider + useXxx
      //    hook in one file" convention (every provider) and on data/helper files
      //    that export a component alongside a constant. It's a dev-HMR concern,
      //    not correctness — warn (visible) rather than block CI. Promote to error
      //    if/when hooks are split into their own modules.
      "react-refresh/only-export-components": "warn",
      // 5. setState-in-effect: the remaining hits are intentional timer/animation
      //    patterns guarded by a cleanup (e.g. swap → setTimeout → reset). Warn
      //    until each is reviewed; keep it on the radar without blocking CI.
      "react-hooks/set-state-in-effect": "warn",
      // 6. User-facing copy should resolve through the i18n catalogs. WARN, not
      //    error, and it can never reach zero — by design. The rule flags any
      //    JSXText with two+ letters, so it cannot tell chrome from the content
      //    the scope rule deliberately keeps in English (brand names, member
      //    bios, article bodies, curator quotes — anything live mode fetches;
      //    see docs/i18n/sweep-agent-brief.md §1). Cinema, for instance, is
      //    fully swept yet still reports ~329 hits, all of them legitimate.
      //    So: treat it as a prompt to ask "is this chrome or content?" on new
      //    code, not as a gate. The real gates are `tsc` and parity.test.ts.
      "local/no-literal-string": "warn",
    },
  },
  // Country-flag emojis (🇵🇹 🇪🇸 …) have no react-icons equivalent — exempt these files.
  {
    files: [
      "src/features/settings/sessions.data.tsx",
      "src/features/marketing/cities.data.tsx",
      "src/features/marketing/CitiesPage.tsx",
      "src/features/marketing/CitiesLiveCards.tsx",
    ],
    rules: { "local/no-emoji": "off" },
  },
  // routes.tsx is a flat route registry, not a component — the line limit doesn't apply.
  {
    files: ["src/app/routes.tsx"],
    rules: { "max-lines-per-function": "off" },
  },
]);
