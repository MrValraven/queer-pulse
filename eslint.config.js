import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Local rule: ban emoji glyphs in source — the platform uses react-icons instead
// of emoji (see CLAUDE.md). Country flags have no react-icons equivalent and are
// exempted per-file in the override block below.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u
const localPlugin = {
  rules: {
    'no-emoji': {
      meta: {
        type: 'problem',
        docs: { description: 'Disallow emoji glyphs; use a react-icons icon instead.' },
        messages: { emoji: 'Avoid emoji glyphs — use a react-icons icon (react-icons/fi) instead.' },
      },
      create(context) {
        const report = (node, text) => {
          if (typeof text === 'string' && EMOJI.test(text)) {
            context.report({ node, messageId: 'emoji' })
          }
        }
        return {
          Literal(node) {
            if (typeof node.value === 'string') report(node, node.value)
          },
          JSXText(node) {
            report(node, node.value)
          },
          TemplateElement(node) {
            report(node, node.value?.raw)
          },
        }
      },
    },
  },
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
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
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Conventions from CLAUDE.md, enforced in CI:
      // 1. Icons over emoji (hard error — protects the icon sweep).
      'local/no-emoji': 'error',
      // 2. Components stay small. Warn (non-breaking) — promote to error once the
      //    remaining oversized components are decomposed.
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true, IIFEs: true }],
      // 3. Design tokens, not hardcoded hex, in inline styles. Warn for now.
      'no-restricted-syntax': [
        'warn',
        {
          selector: "JSXAttribute[name.name='style'] Literal[value=/#[0-9a-fA-F]{3,6}/]",
          message: 'Use a design token (var(--…)) instead of a hardcoded hex colour in inline styles.',
        },
      ],
      // 4. Fast-refresh export purity. Fires on our deliberate "provider + useXxx
      //    hook in one file" convention (every provider) and on data/helper files
      //    that export a component alongside a constant. It's a dev-HMR concern,
      //    not correctness — warn (visible) rather than block CI. Promote to error
      //    if/when hooks are split into their own modules.
      'react-refresh/only-export-components': 'warn',
      // 5. setState-in-effect: the remaining hits are intentional timer/animation
      //    patterns guarded by a cleanup (e.g. swap → setTimeout → reset). Warn
      //    until each is reviewed; keep it on the radar without blocking CI.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  // Country-flag emojis (🇵🇹 🇪🇸 …) have no react-icons equivalent — exempt these files.
  {
    files: [
      'src/features/settings/sessions.data.tsx',
      'src/features/marketing/cities.data.tsx',
      'src/features/marketing/CitiesPage.tsx',
    ],
    rules: { 'local/no-emoji': 'off' },
  },
  // routes.tsx is a flat route registry, not a component — the line limit doesn't apply.
  {
    files: ['src/app/routes.tsx'],
    rules: { 'max-lines-per-function': 'off' },
  },
])
