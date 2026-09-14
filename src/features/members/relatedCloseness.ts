import type { OpenToEntry, OpenToId } from "./openTo.data";
import { OPEN_TO_PRESETS, openToLabel } from "./openTo.data";
import type { Member } from "./data/members";

/**
 * Why a "People close by" card is close to the PROFILE OWNER. The card sits
 * on someone else's profile, so "Both in X" names the owner and the card's
 * member, and the same card reads identically for every viewer. The
 * viewer-relative equivalent is a different surface: connect's "People you
 * might know" (`connect:suggested.reason*`).
 *
 * The wire carries this token plus at most one name; the sentence is built
 * here, so EN and PT each get their own. Kinds and their order mirror the
 * backend's `src/profiles/related-closeness.ts` exactly. Change them in one
 * repo and the other silently renders nothing for the kind it does not know.
 */
export type RelatedClosenessKind =
  | "vouchedForOwner"
  | "ownerVouchedFor"
  | "community"
  | "openToPreset"
  | "openToCustom"
  | "craft"
  | "hood";

export interface RelatedCloseness {
  kind: RelatedClosenessKind;
  /** The community name / preset id / custom label / tag / neighbourhood the
   *  kind names. `null` for the two vouch kinds, which name nobody but the
   *  two people already on the card. */
  value: string | null;
}

/** Every signal `pickCloseness` ranks, each already gated by its caller. */
export interface ClosenessSignals {
  vouchedForOwner: boolean;
  ownerVouchedFor: boolean;
  sharedCommunity: string | null;
  sharedOpenTo: OpenToEntry | null;
  sharedCraft: string | null;
  sharedHood: string | null;
}

/**
 * The single strongest reason, or `null` when every signal is absent. One chip
 * renders per card, so this ranking is the whole decision. Strongest first: a
 * vouch the owner RECEIVED, a vouch they GAVE, a shared community, a shared
 * "Open to" chip, then the craft/neighbourhood floor. That last pair is the
 * rule that put the card in this list at all, so it reads as a floor rather
 * than a finding.
 *
 * Kept byte-for-byte in step with the backend's `pickCloseness`: live mode
 * receives the answer, demo mode computes it here, and the two must agree or
 * the same profile reads differently in the two modes.
 */
export function pickCloseness(
  signals: ClosenessSignals,
): RelatedCloseness | null {
  if (signals.vouchedForOwner) return { kind: "vouchedForOwner", value: null };
  if (signals.ownerVouchedFor) return { kind: "ownerVouchedFor", value: null };
  if (signals.sharedCommunity)
    return { kind: "community", value: signals.sharedCommunity };
  if (signals.sharedOpenTo)
    return signals.sharedOpenTo.kind === "preset"
      ? { kind: "openToPreset", value: signals.sharedOpenTo.id }
      : { kind: "openToCustom", value: signals.sharedOpenTo.label };
  if (signals.sharedCraft) return { kind: "craft", value: signals.sharedCraft };
  if (signals.sharedHood) return { kind: "hood", value: signals.sharedHood };
  return null;
}

/** The first entry both listed, in the OWNER's chip order. Presets match by
 *  id; customs are the member's own words, so they match case-insensitively
 *  after trimming. */
export function sharedOpenTo(
  ownerOpenTo: OpenToEntry[],
  theirOpenTo: OpenToEntry[],
): OpenToEntry | null {
  const theirPresets = new Set(
    theirOpenTo.flatMap((entry) => (entry.kind === "preset" ? [entry.id] : [])),
  );
  const theirCustoms = new Set(
    theirOpenTo.flatMap((entry) =>
      entry.kind === "custom" ? [entry.label.trim().toLowerCase()] : [],
    ),
  );
  return (
    ownerOpenTo.find((entry) =>
      entry.kind === "preset"
        ? theirPresets.has(entry.id)
        : theirCustoms.has(entry.label.trim().toLowerCase()),
    ) ?? null
  );
}

/** The first tag both listed, in the OWNER's order, matched
 *  case-insensitively and returned in the owner's spelling, since it is their
 *  page the chip renders on. */
export function sharedCraft(
  ownerTags: string[],
  theirTags: string[],
): string | null {
  const theirs = new Set(theirTags.map((tag) => tag.trim().toLowerCase()));
  return ownerTags.find((tag) => theirs.has(tag.trim().toLowerCase())) ?? null;
}

/** A member's neighbourhood as a viewer may read it: hidden by their own
 *  `hoodVisible` toggle, and by anything but an `open` profile. Those are the
 *  same two layers the backend's related card applies (`gateLocation` plus the
 *  visibility check in `ProfilesService.loadRelated`). */
function visibleHood(member: Member): string | null {
  if (member.visibility !== "open") return null;
  if (member.hoodVisible === false) return null;
  return member.hood || null;
}

/**
 * Demo mode's answer to the question live mode asks the backend: why is this
 * registry member close to this profile owner? Applies the same privacy
 * toggles the backend applies before ranking, so a mock member who hid their
 * vouchers or their hood is as quiet here as a real one would be.
 *
 * Demo groups (`Member.groups`) stand in for communities: the mock registry
 * has no community rosters, and a reading circle in `groups` is the same fact
 * the live chip names.
 */
export function closenessBetween(
  owner: Member,
  them: Member,
): RelatedCloseness | null {
  const ownerHood = visibleHood(owner);
  const theirHood = visibleHood(them);
  const sharedGroups = owner.groups
    .map((group) => group.name)
    .filter((name) =>
      them.groups.some(
        (group) =>
          group.name.trim().toLowerCase() === name.trim().toLowerCase(),
      ),
    )
    // Alphabetical, matching the backend's `ORDER BY c.name ASC`, so one pair
    // always yields the same community rather than shuffling between reads.
    .sort((a, b) => a.localeCompare(b));
  return pickCloseness({
    // `Member.vouchers` is the slugs of people who vouched FOR that member, so
    // the owner's list carries the incoming direction and theirs the outgoing.
    vouchedForOwner:
      owner.vouchersVisible !== false && owner.vouchers.includes(them.slug),
    ownerVouchedFor:
      them.vouchersVisible !== false && them.vouchers.includes(owner.slug),
    sharedCommunity: sharedGroups[0] ?? null,
    sharedOpenTo:
      them.visibility === "open"
        ? sharedOpenTo(owner.openTo, them.openTo)
        : null,
    sharedCraft: sharedCraft(owner.tags, them.tags),
    sharedHood: ownerHood && ownerHood === theirHood ? ownerHood : null,
  });
}

const PRESET_IDS = new Set<string>(OPEN_TO_PRESETS.map((preset) => preset.id));

/** A preset id's label, or the id itself when this build does not know it.
 *  The id list is shared with the backend, so an unknown one means the two
 *  repos have drifted. Render the raw token rather than a missing-key string,
 *  which is at least readable while someone fixes the drift. */
function presetLabel(
  id: string | null,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  if (!id) return "";
  if (!PRESET_IDS.has(id)) return id;
  return openToLabel({ kind: "preset", id: id as OpenToId }, t);
}

/**
 * The chip's sentence. `ownerFirst` is the profile owner's first name, because
 * every vouch line names them ("Vouched for Inês"), and a chip that said "the
 * owner" would be the only place on the page that talks about the member in
 * the third person abstract.
 */
export function closenessLabel(
  closeness: RelatedCloseness,
  ownerFirst: string,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  switch (closeness.kind) {
    case "vouchedForOwner":
      return t("members:content.related.closeness.vouchedForOwner", {
        first: ownerFirst,
      });
    case "ownerVouchedFor":
      return t("members:content.related.closeness.ownerVouchedFor", {
        first: ownerFirst,
      });
    case "community":
      return t("members:content.related.closeness.community", {
        name: closeness.value ?? "",
      });
    case "openToPreset":
      return t("members:content.related.closeness.openTo", {
        label: presetLabel(closeness.value, t),
      });
    case "openToCustom":
      return t("members:content.related.closeness.openTo", {
        label: closeness.value ?? "",
      });
    case "craft":
      return t("members:content.related.closeness.craft", {
        label: closeness.value ?? "",
      });
    case "hood":
      return t("members:content.related.closeness.hood", {
        name: closeness.value ?? "",
      });
  }
}

/** Chips carry one of three tones: a vouch is the platform's own trust
 *  signal (jade), an availability chip is an invitation (accent), and the
 *  rest are quiet facts. Most cards land on the craft/hood floor, and a grid
 *  of four loud chips would flatten the two that mean the most. */
export function closenessTone(
  kind: RelatedClosenessKind,
): "vouch" | "invite" | "quiet" {
  if (kind === "vouchedForOwner" || kind === "ownerVouchedFor") return "vouch";
  if (kind === "openToPreset" || kind === "openToCustom") return "invite";
  return "quiet";
}
