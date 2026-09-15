import type {
  ComposeAudience,
  ComposeHelpline,
  ComposeNudge,
  ComposeThreadState,
} from "./composeThread.types";
import { countWords, toPlainText } from "./composeText";

// ── Advisory rows under the body ────────────────────────────────────────────
// Six things the composer says out loud before a post goes out, because each
// one is something a member usually discovers afterwards: a phone number every
// member can now read, a private community they thought was the town square, a
// photo nobody using a screen reader can see.
//
// Every function here is PURE. No React, no `t()`, no DOM. A nudge carries a
// catalog key plus its interpolation values, so the copy is translated where
// it is rendered and these rules can be reasoned about (and tested) on their
// own.

/** A phone number or an email address sitting in the body. */
const CONTACT_DETAIL = /(\+?\d[\d\s-]{8,}\d|[\w.+-]+@[\w-]+\.\w{2,})/;

/** Wording that says somebody needs help today, in both languages. */
const CRISIS_WORDING =
  /\b(urgent|emergency|unsafe|kicked out|homeless|tonight|suicid|danger|urgente|emergência|sem casa)\b/gi;

/**
 * A street name followed by a number, or a phrase that names where a person
 * lives. An address plus a name is doxxing whatever the author meant by it.
 */
const ADDRESS_WORDING =
  /\b(rua|avenida|av\.|praça|travessa|largo|street|road)\s+[a-zà-ú.\s]{3,30}\d|\b(lives at|his address|her address|their address|mora (na|no|em))\b/i;

/** A line that is nothing but a bold heading, which is what makes a long
 *  guide skimmable. */
const BOLD_HEADING_LINE = /^\*\*[^*]+\*\*\s*$/m;

/** Past this many words, a guide without headings is a wall. */
const LONG_GUIDE_WORDS = 800;

/**
 * The Portuguese services that answer today, in the order the crisis nudge
 * lists them. Real numbers, dialled exactly as written, so they are values.
 */
export const CRISIS_HELPLINES: readonly ComposeHelpline[] = [
  {
    id: "sos-voz-amiga",
    nameKey: "forum:composePage.nudge.crisis.sosVozAmiga",
    number: "213 544 545",
  },
  {
    id: "ilga-portugal",
    nameKey: "forum:composePage.nudge.crisis.ilgaPortugal",
    number: "218 873 918",
  },
  {
    id: "emergencies",
    nameKey: "forum:composePage.nudge.crisis.emergencies",
    number: "112",
  },
];

/** What the rules are evaluated against. */
export interface ComposeNudgeInput {
  state: ComposeThreadState;
  /** The community the post is going to, already resolved, or null for the
   *  town square. */
  community: ComposeAudience | null;
  /**
   * The `dismissKey`s the member has waved away. A nudge whose key is in here
   * is left out of the result. The crisis nudge folds the matched wording into
   * its key on purpose, so a dismissal covers THAT text and newly typed
   * crisis wording raises the row again.
   */
  dismissedKeys?: readonly string[];
}

/** Every advisory the current draft raises, most urgent first. */
export function composeNudges({
  state,
  community,
  dismissedKeys = [],
}: ComposeNudgeInput): ComposeNudge[] {
  const raised: ComposeNudge[] = [
    doxxingNudge(state),
    crisisNudge(state),
    contactNudge(state),
    privateCommunityNudge(state, community),
    missingAltNudge(state),
    longGuideNudge(state),
  ].filter((nudge): nudge is ComposeNudge => nudge !== null);

  return raised.filter(
    (nudge) =>
      !nudge.isDismissible || !dismissedKeys.includes(nudge.dismissKey),
  );
}

/** True when the body names where somebody lives. Read by the blockers too,
 *  so both ends agree on what needs acknowledging. */
export function hasAddressWording(body: string): boolean {
  return ADDRESS_WORDING.test(body);
}

function doxxingNudge(state: ComposeThreadState): ComposeNudge | null {
  if (!hasAddressWording(state.body)) return null;
  return {
    id: "doxxing",
    tone: "warn",
    titleKey: "forum:composePage.nudge.doxxing.title",
    bodyKey: "forum:composePage.nudge.doxxing.body",
    dismissKey: "doxxing",
    // The one row that cannot be waved away. Dismissing it is exactly the
    // action a member takes when they are sure and wrong, and the cost lands
    // on the person whose address it is.
    isDismissible: false,
    requiresAcknowledgement: true,
    acknowledgementLabelKey: "forum:composePage.nudge.doxxing.acknowledge",
  };
}

function crisisNudge(state: ComposeThreadState): ComposeNudge | null {
  const searched = `${state.title} ${state.body}`;
  // A global regex carries `lastIndex` between calls, so it is matched against
  // a fresh string each time and never reused mid-scan.
  const matches = searched.match(CRISIS_WORDING);
  if (!matches) return null;
  // The dismissal is keyed on WHAT matched, so waving the row away covers the
  // wording that raised it and newly typed crisis wording raises it again.
  const signature = [...new Set(matches.map((match) => match.toLowerCase()))]
    .sort()
    .join(",");
  return {
    id: "crisis",
    tone: "help",
    titleKey: "forum:composePage.nudge.crisis.title",
    bodyKey: "forum:composePage.nudge.crisis.body",
    dismissKey: `crisis:${signature}`,
    isDismissible: true,
    requiresAcknowledgement: false,
    helplines: CRISIS_HELPLINES,
  };
}

function contactNudge(state: ComposeThreadState): ComposeNudge | null {
  if (!CONTACT_DETAIL.test(state.body)) return null;
  return {
    id: "contact",
    tone: "warn",
    titleKey: "forum:composePage.nudge.contact.title",
    bodyKey: "forum:composePage.nudge.contact.body",
    dismissKey: "contact",
    isDismissible: true,
    requiresAcknowledgement: false,
  };
}

function privateCommunityNudge(
  state: ComposeThreadState,
  community: ComposeAudience | null,
): ComposeNudge | null {
  if (!community || !community.slug || !community.isPrivate) return null;
  return {
    id: "privateCommunity",
    tone: "neutral",
    titleKey: "forum:composePage.nudge.privateCommunity.title",
    // Two endings, because "it will not appear in the town square" is false
    // the moment the member ticks cross-post, and a nudge that says a false
    // thing is worse than no nudge.
    bodyKey: state.crossPost
      ? "forum:composePage.nudge.privateCommunity.bodyCrossPosted"
      : "forum:composePage.nudge.privateCommunity.body",
    values: {
      community: community.name,
      count: community.memberCount ?? 0,
    },
    dismissKey: "privateCommunity",
    isDismissible: true,
    requiresAcknowledgement: false,
  };
}

function missingAltNudge(state: ComposeThreadState): ComposeNudge | null {
  const missing = state.photos.filter((photo) => !photo.alt.trim()).length;
  if (missing === 0) return null;
  return {
    id: "missingAlt",
    tone: "neutral",
    titleKey: "forum:composePage.nudge.missingAlt.title",
    bodyKey: "forum:composePage.nudge.missingAlt.body",
    values: { count: missing },
    dismissKey: "missingAlt",
    isDismissible: true,
    requiresAcknowledgement: false,
  };
}

function longGuideNudge(state: ComposeThreadState): ComposeNudge | null {
  if (state.kind !== "guide") return null;
  const words = countWords(toPlainText(state.body));
  if (words <= LONG_GUIDE_WORDS) return null;
  if (BOLD_HEADING_LINE.test(state.body)) return null;
  return {
    id: "longGuideNoHeadings",
    tone: "neutral",
    titleKey: "forum:composePage.nudge.longGuide.title",
    bodyKey: "forum:composePage.nudge.longGuide.body",
    values: { count: words },
    dismissKey: "longGuideNoHeadings",
    isDismissible: true,
    requiresAcknowledgement: false,
  };
}
