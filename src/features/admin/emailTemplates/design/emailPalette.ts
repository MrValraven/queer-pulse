/**
 * The one palette every email design draws from. Email clients cannot read
 * CSS custom properties, so every colour is a hex copy of a token in
 * `src/styles/tokens/colors.css` (or a flattened blend of one). Each line names
 * the token it mirrors and, for text, its contrast ratio on the surfaces it is
 * meant for. Change both together.
 *
 * Fonts are stacks built for their fallbacks: no web font loads in an inbox,
 * so Fraunces lands on Georgia and DM Sans on Helvetica or Arial.
 */
export const EMAIL_PALETTE = {
  colors: {
    cream: "#f7f3ee", // --cream (page ground; 14.23:1 on plum, 15.61:1 on plum deep)
    creamDeep: "#efe8df", // --cream darkened, no token (inner panels on cream; plum 12.94:1 on it)
    creamMuted: "#b8b0b5", // --cream at 70% flattened onto --plum-deep (8.14:1 on plum deep)
    paper: "#ffffff", // --paper
    ink: "#48484c", // --ink at 80% flattened onto --paper (9.10:1 on paper)
    inkStrong: "#313135", // --ink at 90% flattened onto --paper (12.95:1 on paper)
    inkMuted: "#6a6a6d", // --ink at 65% flattened onto --paper (5.39:1 on paper, 4.88:1 on cream)
    plum: "#2d1b3d", // --plum (15.72:1 on paper)
    plumDeep: "#241430", // --plum-deep
    accentText: "#a84430", // --accent-text (5.94:1 on paper, 5.18:1 on coral tint)
    accentFill: "#d5431e", // --accent-fill (4.52:1 with a white label)
    accentSoft: "#ffc4af", // --accent-soft (11.31:1 on plum deep, 10.31:1 on plum)
    coral: "#e8775a", // --accent, a fill only (the pulse dot, a divider dot)
    coralTint: "#fcece8", // --accent at 14% flattened onto --paper (card ground)
    jade: "#4a8c6f", // --jade, a fill only (a divider dot)
    jadeText: "#3c7159", // --jade-ink (5.68:1 on paper, 5.14:1 on cream)
    line: "#e2dfe4", // --plum at 14% flattened onto --paper
  },
  fonts: {
    serif: "Fraunces, Georgia, 'Times New Roman', serif",
    sans: "'DM Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
} as const;
