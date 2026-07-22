import type { AnySpace } from "../safety/safeSpaces";
import type {
  SafeSpaceCandidate,
  SafeSpacePromiseInput,
  SafeSpaceStatus,
  SafeSpaceVouchInput,
  SetSafeSpaceInput,
} from "./api/adminSafeSpaces.api";

/**
 * Editable draft for `AdminSafeSpaceModal`. Kept as plain strings for the
 * number/date-shaped fields (`tier`, `reVerifiedAt`) so a half-typed value
 * never throws — parsed back to the wire shape only in `draftToInput`.
 * Candidates carry no tier/verifier/promises/vouches (the queue endpoint is
 * intentionally thin — see `adminSafeSpaces.api.ts`), so every edit starts
 * from a blank profile plus whatever status the candidate already has.
 */
export interface SafeSpaceFormDraft {
  status: SafeSpaceStatus;
  tier: string;
  verifier: string;
  reVerifiedAt: string;
  sub: string;
  promises: SafeSpacePromiseInput[];
  vouches: SafeSpaceVouchInput[];
  reason: string;
}

/** A blank draft seeded with the candidate's current status. */
export function emptyDraft(candidate: SafeSpaceCandidate): SafeSpaceFormDraft {
  return {
    status: candidate.safeSpaceStatus,
    tier: "",
    verifier: "",
    reVerifiedAt: "",
    sub: "",
    promises: [],
    vouches: [],
    reason: "",
  };
}

/**
 * Seed the draft from the listing's EXISTING safe-space profile, when one
 * exists. The candidates queue (`SafeSpaceCandidate`) only carries the
 * status, not the tier/verifier/promises/vouches — but `setSafeSpace` does a
 * full-array replace of `promises`/`vouches` on save. Opening the editor
 * without first loading the current profile would silently wipe out
 * whatever promises/vouches the listing already had the moment the
 * moderator saved any change. `space` is `undefined` for a brand-new mark
 * (status "none", never fetched) or when the fetch found nothing (404 in
 * live mode, no matching mock in demo mode) — either way, fall back to a
 * blank draft rather than throwing.
 */
export function draftFromSpace(
  candidate: SafeSpaceCandidate,
  space: AnySpace | undefined,
): SafeSpaceFormDraft {
  const base = emptyDraft(candidate);
  if (!space) return base;

  if (space.kind === "verified") {
    const verifiedProfile = space.data;
    return {
      ...base,
      tier: String(verifiedProfile.tier),
      verifier: verifiedProfile.verifier,
      reVerifiedAt: verifiedProfile.reVerified,
      sub: verifiedProfile.sub,
      promises: verifiedProfile.promises.map((promise) => ({
        title: promise.title,
        desc: promise.desc,
      })),
      // Strip `initials`/`tint` — those are server-derived display
      // properties, not part of `SetSafeSpaceInput`'s vouch shape.
      vouches: verifiedProfile.vouches.map((vouch) => ({
        name: vouch.name,
        byline: vouch.byline,
        text: vouch.text,
        when: vouch.when,
      })),
    };
  }

  const removedProfile = space.data;
  return {
    ...base,
    reason: removedProfile.reason,
  };
}

/** A blank promise row for the repeatable "Add promise" control. */
export function emptyPromise(): SafeSpacePromiseInput {
  return { title: "", desc: "" };
}

/** A blank vouch row for the repeatable "Add vouch" control. */
export function emptyVouch(): SafeSpaceVouchInput {
  return { name: "", byline: "", text: "", when: "" };
}

/**
 * Reduce a draft to the `SetSafeSpaceInput` the API expects: trims every
 * text field, drops fully-empty optional fields and rows rather than
 * sending blanks, and only carries `reason` when the moderator is removing
 * the listing.
 */
export function draftToInput(draft: SafeSpaceFormDraft): SetSafeSpaceInput {
  const input: SetSafeSpaceInput = { status: draft.status };

  const trimmedTier = draft.tier.trim();
  if (trimmedTier) input.tier = Number(trimmedTier);

  const trimmedVerifier = draft.verifier.trim();
  if (trimmedVerifier) input.verifier = trimmedVerifier;

  const trimmedReVerifiedAt = draft.reVerifiedAt.trim();
  if (trimmedReVerifiedAt) input.reVerifiedAt = trimmedReVerifiedAt;

  const trimmedSub = draft.sub.trim();
  if (trimmedSub) input.sub = trimmedSub;

  const nonEmptyPromises = draft.promises.filter(
    (promise) => promise.title.trim() || promise.desc.trim(),
  );
  if (nonEmptyPromises.length > 0) input.promises = nonEmptyPromises;

  const nonEmptyVouches = draft.vouches.filter(
    (vouch) => vouch.name.trim() || vouch.text.trim(),
  );
  if (nonEmptyVouches.length > 0) input.vouches = nonEmptyVouches;

  if (draft.status === "removed") {
    const trimmedReason = draft.reason.trim();
    if (trimmedReason) input.reason = trimmedReason;
  }

  return input;
}
