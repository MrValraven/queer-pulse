import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

// jsx-a11y's recommended set ships 31 of its 34 rules at "error". We take the
// rule list (and each rule's own options) but force every severity down to
// "warn": the existing tail of a11y debt is real and untriaged, so erroring
// would block every build today for problems nobody has had a chance to fix.
// Promote individual rules to "error" as each is driven to zero.
// The 3 rules recommended turns off (deprecated/superseded ones) stay off.
export const jsxA11yWarnings = Object.fromEntries(
  Object.entries(jsxA11y.flatConfigs.recommended.rules).map(([id, setting]) => {
    const severity = Array.isArray(setting) ? setting[0] : setting;
    if (severity === "off" || severity === 0) return [id, "off"];
    return [id, Array.isArray(setting) ? ["warn", ...setting.slice(1)] : "warn"];
  }),
);

// Options for jsx-a11y/control-has-associated-label. This rule is NOT in the
// recommended set (so it's absent from jsxA11yWarnings above), and its schema
// default for `ignoreElements` is [] — configuring it as a bare "warn" would
// silently un-ignore input/textarea and re-introduce the ~550 htmlFor/id false
// positives described at its use site below. Exported so the fast a11y-only
// config (eslint.a11y.config.js, used by scripts/report-a11y.mjs) applies the
// IDENTICAL options and its ratchet count stays in lockstep with this gate.
export const controlHasAssociatedLabelOptions = {
  ignoreElements: [
    "audio",
    "canvas",
    "embed",
    "input",
    "textarea",
    "tr",
    "video",
  ],
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
  includeRoles: ["alert", "dialog"],
};

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
  globalIgnores(["dist", "coverage", ".superpowers"]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { local: localPlugin, "jsx-a11y": jsxA11y },
    extends: [
      js.configs.recommended,
      // Type-aware linting (parity with the backend, which runs
      // recommendedTypeChecked). This is what makes rules like
      // no-floating-promises / no-misused-promises possible — they need the
      // type checker to know a value is a Promise. Without it, floating
      // promises in this async-handler-heavy codebase went completely
      // undetected. See the rule tuning below for how the noisier
      // type-aware rules are handled.
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        // projectService resolves each file to the tsconfig that includes it
        // (tsconfig.app.json for src, tsconfig.test.json for the *.test files).
        // Files in no project (root config files, e2e, sw.ts) are handled by the
        // disableTypeChecked override block at the end of this config.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // 0. Accessibility. Every jsx-a11y recommended rule, forced to "warn"
      //    (see jsxA11yWarnings above). Never "error" — it must not block CI
      //    while the existing tail is being triaged. Baseline at introduction:
      //    218 warnings, dominated by click-events-have-key-events (81) and
      //    no-static-element-interactions (68) — the same div-with-onClick
      //    pattern counted twice, so ~81 real sites, not 149.
      //    KNOWN FALSE POSITIVES: the `anchor-has-content` hits were the
      //    `<Translation components={{ a: <a href="…" /> }}>` idiom — those
      //    anchors are element *templates* that React clones with children at
      //    render time. The rule can't see that. Don't "fix" them by adding
      //    dummy children. (Current jsx-a11y no longer flags them: 0 hits.)
      //    UPDATE (2026-07-29): the 218/81/68 figures above are the historical
      //    introduction baseline. That tail has since been largely cleared.
      //    UPDATE (2026-08-04): the entire jsx-a11y tail was driven to ZERO
      //    (was 44 — 37 `control-has-associated-label` + 7 interaction rules —
      //    fixed with real accessible names where a control was genuinely
      //    unlabelled, and justified per-line `eslint-disable`s only where the
      //    rule misfires: `<Translation>` link-templates, APG carousels, a
      //    keyboard-dismissed dialog's stop-propagation onClick, table cells,
      //    a live stream with no caption source). Two gates hold it there:
      //    (1) the accessible-name + ARIA-correctness rules below are "error"
      //    (block via `pnpm lint`); (2) `pnpm lint:a11y` RATCHETS the total to
      //    BUDGET = 0 in scripts/report-a11y.mjs, run first in `pnpm build`, so
      //    ANY new warning from ANY jsx-a11y rule fails the build. Promote more
      //    rules to "error" here as you gain confidence they won't misfire.
      ...jsxA11yWarnings,
      // --- ARIA correctness + accessible names (graduated to "error") -------
      // These rules are all at zero and stay there: for a screen-reader-using
      // audience, a bad ARIA attribute or an image with no text alternative is
      // a correctness bug, not stylistic debt. Erroring them means a new
      // violation blocks CI the same way a type error does. `alt-text` guards
      // <img>/<area>/<input type=image> accessible names; the `aria-*` family
      // guards that ARIA props/values/roles are real and valid; the two
      // `role-*-aria-*` rules guard that an explicit role has (and only has) its
      // allowed ARIA props. Promote further rules here as each is driven to zero.
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-activedescendant-has-tabindex": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      // --- Forms accessibility gate (WCAG 1.3.1 / 4.1.2) -------------------
      // The forms sweep drove every visible `<label>` to an associated control
      // (htmlFor+id, wrapping, or a converted div→label), and every otherwise
      // label-less input/select/textarea to an `aria-label`. `label-has-
      // associated-control` (which DOES resolve htmlFor→id) is now at zero, so
      // it graduates from "warn" to "error": a new visible label that isn't
      // wired to a control now blocks CI. This is the anti-regression gate for
      // the forms work — a developer who adds a `<label>` must associate it.
      "jsx-a11y/label-has-associated-control": "error",
      // Complementary control-side check, at "warn". IMPORTANT: this rule cannot
      // resolve a `<label htmlFor="x">` + `<input id="x">` pairing across
      // elements — it only sees self-labelling (aria-label / title / nested
      // text). With `input`/`textarea` un-ignored it reports ~550 false
      // positives on inputs that ARE correctly labelled via htmlFor. So we keep
      // the plugin's default `ignoreElements` (input, textarea, audio, canvas,
      // embed, video, tr): the label-side gate above covers those, while this
      // catches the OTHER controls — icon-only `<button>`/`<a>` with no text —
      // going forward. Do not un-ignore input/textarea here.
      //
      // NOTE: the ignore list must be passed EXPLICITLY. The rule's own schema
      // default for `ignoreElements` is `[]`, not the list the *recommended*
      // config ships — so configuring this as a bare `"warn"` would silently
      // un-ignore input/textarea and re-introduce the ~550 htmlFor/id false
      // positives described above. The options below are the recommended set.
      "jsx-a11y/control-has-associated-label": [
        "warn",
        controlHasAssociatedLabelOptions,
      ],
      // --- Type-aware rules (from recommendedTypeChecked) ------------------
      // The two promise-safety rules are the reason type-aware linting was
      // turned on. Both have been driven to zero and are hard errors: a
      // floating promise in a React handler swallows rejections silently, and
      // an async function passed where a void one is expected (onClick, form
      // handlers) is the same bug wearing a different hat. Keep them at zero.
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      // any-typed access. Mirrors the backend's tuning exactly: `any` itself is
      // allowed (too much untyped third-party surface to ban outright), and the
      // "unsafe-*" family that flags reads/calls THROUGH an `any` stays visible
      // as a warning rather than blocking CI. Promote as the tail is typed out.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      // Lower-value type-aware rules kept as warnings (baselines at
      // introduction: no-unnecessary-type-assertion ~46, require-await ~30,
      // no-base-to-string ~11). Real but not correctness-critical; surfaced,
      // not gated. no-unnecessary-type-assertion is deliberately NOT an error:
      // its autofix is unreliable here because eslint's bundled TypeScript and
      // the build's TypeScript disagree on a few load-bearing assertions (e.g.
      // mapbox GeoJSONSource casts in useLisbonMap.ts that `tsc -b` requires but
      // eslint reports as redundant). Warn, review by hand, don't auto-strip.
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/no-base-to-string": "warn",
      // A `T | unknown` union collapses to `unknown` (one real hit today:
      // AppErrorEnvelope.details in shared/contracts/errors.ts). A legit smell,
      // but it lives in a shared API contract where tightening the type could
      // ripple to every consumer — surface it, don't gate on it.
      "@typescript-eslint/no-redundant-type-constituents": "warn",
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
  // Message reactions ARE emoji by design (WhatsApp/Slack-style ❤️😂👍) — the
  // glyphs are the feature's data, not chrome, so react-icons doesn't apply.
  {
    files: ["src/features/messages/reactionKeys.ts"],
    rules: { "local/no-emoji": "off" },
  },
  // routes.tsx is a flat route registry, not a component — the line limit doesn't apply.
  {
    files: ["src/app/routes.tsx"],
    rules: { "max-lines-per-function": "off" },
  },
  // Files outside every tsconfig project — root config files, Playwright e2e,
  // and the webworker sw.ts (excluded from tsconfig.app for its own lib). The
  // type-aware parser can't resolve them to a project, so turn projectService
  // off here and drop the type-checked rules for these files only. They keep
  // all the syntactic rules.
  {
    files: ["*.config.ts", "e2e/**/*.ts", "src/sw.ts"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      parserOptions: { projectService: false, program: null },
    },
  },
]);
