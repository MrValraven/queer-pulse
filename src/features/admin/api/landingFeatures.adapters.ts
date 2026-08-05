import type { TFunction } from "../../../shared/i18n/types";
import type {
  AdminLandingFeatureDTO,
  LandingHiddenReason,
} from "./landingFeatures.api";

// i18n scope rule (docs/i18n/extraction-brief.md §1): `hiddenReason` is a
// backend-classified enum, not API content, so its human label is chrome this
// code resolves through `translate()` — mirroring `ACTIVITY_LABEL_KEY` in
// `adminCommunities.adapters.ts`. Task 8 owns the `admin` catalog and must
// define the five keys in `HIDDEN_REASON_KEY` below before this label
// renders anything but the raw translation key.
const HIDDEN_REASON_KEY: Record<LandingHiddenReason, string> = {
  consent_revoked: "admin:landing.hidden.consent_revoked",
  went_private: "admin:landing.hidden.went_private",
  unpublished: "admin:landing.hidden.unpublished",
  not_public: "admin:landing.hidden.not_public",
  deleted: "admin:landing.hidden.deleted",
};

/** Admin landing-feature-slot view model: the wire DTO plus a human
 *  `hiddenLabel` resolved from `hiddenReason` via `t()` (`null` when the
 *  target is still eligible and nothing needs surfacing). */
export interface LandingFeatureVM {
  id: string;
  section: AdminLandingFeatureDTO["section"];
  targetId: string;
  position: number;
  active: boolean;
  copy: Record<string, unknown>;
  target: { slug: string; name: string; avatarUrl?: string | null } | null;
  eligible: boolean;
  hiddenReason: LandingHiddenReason | null;
  hiddenLabel: string | null;
}

/** GET/POST/PATCH `/admin/landing/features` item → the admin picker's
 *  `LandingFeatureVM`. */
export function dtoToLandingFeatureVM(
  dto: AdminLandingFeatureDTO,
  translate: TFunction,
): LandingFeatureVM {
  return {
    id: dto.id,
    section: dto.section,
    targetId: dto.targetId,
    position: dto.position,
    active: dto.active,
    copy: dto.copy,
    target: dto.target,
    eligible: dto.eligible,
    hiddenReason: dto.hiddenReason,
    hiddenLabel: dto.hiddenReason
      ? translate(HIDDEN_REASON_KEY[dto.hiddenReason])
      : null,
  };
}
