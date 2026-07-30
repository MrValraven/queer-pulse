import { leadingInitials } from "../../../shared/lib/initials";
import type { GlanceRow, Vouch } from "../../safety/safeSpaces";
import type { VerifiedSpaceAsideData } from "../../safety/SafeSpaceVerifiedAside";
import { tintForSlug } from "./directory.adapters";
import type { DirectorySafeSpaceVouchDTO } from "./directory.api";

/**
 * Bridge the directory detail's RAW `safeSpaceVouches` (`{name, byline, text,
 * when}` — no `initials`/`tint`) onto the safety feature's `Vouch` shape,
 * which `SafeSpaceVouchesList` renders. The safe-spaces hub's own detail DTO
 * carries `initials`/`tint` pre-derived server-side
 * (`toSafeSpaceDetail` in queerpulse-backend/src/listings/listing-response.ts);
 * the directory detail DTO intentionally does not (see `DirectoryDetailDTO`'s
 * doc comment), so this derives them client-side to MATCH that backend
 * function exactly, not just approximate it: the backend's `initialsForName`
 * (listing-response.ts:128-134) takes the first letter of the FIRST and
 * SECOND word (not first+last) — the frontend's `leadingInitials` is that
 * same first+second-word algorithm (the sibling `submittedToPlace` in this
 * file already reuses it, via its `initials()` re-export, for the same
 * backend-parity reason). `tintForSlug` is keyed on the voucher's *name*
 * (there is no per-voucher slug), mirroring the backend calling
 * `tintForSlug(vouch.name)` for the exact same hub vouches.
 */
export function directoryVouchesToSafetyVouches(
  vouches: DirectorySafeSpaceVouchDTO[],
): Vouch[] {
  return vouches.map((vouch) => ({
    initials: leadingInitials(vouch.name),
    name: vouch.name,
    tint: tintForSlug(vouch.name),
    byline: vouch.byline,
    text: vouch.text,
    when: vouch.when,
  }));
}

/**
 * Build the `SafeSpaceVerifiedAside`'s minimal data shape from a verified
 * listing's own identity. The directory detail's trust block carries no
 * `glance` facts (unlike the hub's own detail DTO — see `DirectoryDetailDTO`'s
 * doc comment); `reVerifiedAt` is the only trust-specific fact surfaced here
 * as a glance row (mirroring the hub's own "Last verified" row) — `verifier`
 * is deliberately NOT repeated here since `SafeSpaceTrustBanner`, rendered
 * directly above this aside, already states it in the "Last re-verified …
 * {verifier}" banner copy. When `reVerifiedAt` is absent the resulting
 * `glance` is empty and `SafeSpaceVerifiedAside` skips that card entirely.
 */
export function directoryTrustToAsideData(input: {
  name: string;
  address: string;
  reVerifiedAt: string | null;
  lastVerifiedLabel: string;
}): VerifiedSpaceAsideData {
  const glance: GlanceRow[] = [];
  if (input.reVerifiedAt) {
    glance.push({
      label: input.lastVerifiedLabel,
      value: input.reVerifiedAt,
      accent: true,
    });
  }
  return { name: input.name, address: input.address, glance };
}
