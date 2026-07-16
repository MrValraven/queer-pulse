/**
 * The completeness requirements an unlinked persona must meet to publish, in the
 * order they're shown. Each requirement maps the exact contract-C5 unmet codes
 * that fail it (`codes`) to friendly, second-person copy, plus the reassuring
 * line shown once it's met (`met`). The live 422 body / demo check returns those
 * same codes, so the checklist reads them straight through.
 */
export interface PublishRequirement {
  key: string;
  title: string;
  /** Copy shown when this requirement is satisfied. */
  met: string;
  /** Contract-C5 codes that fail this requirement. */
  codes: string[];
  /** Per-code copy shown when the requirement isn't met yet. */
  fail: Record<string, string>;
}

export const PUBLISH_REQUIREMENTS: PublishRequirement[] = [
  {
    key: "handle",
    title: "A handle that's yours",
    met: "This is where people will find you — queerpulse.app/p/your-handle.",
    codes: ["handle_invalid", "handle_taken", "handle_reserved"],
    fail: {
      handle_invalid:
        "Handles are 3–30 characters: lowercase letters, numbers and hyphens.",
      handle_taken: "Someone already has that handle — try another.",
      handle_reserved: "That handle is reserved. Pick a different one.",
    },
  },
  {
    key: "avatar",
    title: "A photo or image",
    met: "Your avatar helps people recognise this persona.",
    codes: ["avatar_missing"],
    fail: {
      avatar_missing:
        "Add an avatar so people can put a face, or a mark, to the name.",
    },
  },
  {
    key: "bio",
    title: "A bio of at least 80 characters",
    met: "Enough for someone to get who you are at a glance.",
    codes: ["bio_too_short"],
    fail: {
      bio_too_short:
        "Tell people a little more — your bio needs at least 80 characters.",
    },
  },
  {
    key: "items",
    title: "At least three things to show",
    met: "Enough work for the page to feel alive.",
    codes: ["not_enough_items"],
    fail: {
      not_enough_items:
        "Add a few more pieces — you need at least three across your sections.",
    },
  },
  {
    key: "language",
    title: "Language that keeps everyone welcome",
    met: "Nothing flagged.",
    codes: ["blocked_terms"],
    fail: {
      blocked_terms:
        "Something in your name, handle or bio was flagged — please reword it.",
    },
  },
];
