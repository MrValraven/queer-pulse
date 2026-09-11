import { useAuth } from "../../../app/providers/authContext";
import { tintForSlug } from "../../../shared/api/refs";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  initialsFromName,
  initialsFromParts,
} from "../../../shared/lib/initials";
import type { CohostPick } from "../useGatheringForm";

/** One face and first name in the card's host row. */
export interface PreviewPerson {
  key: string;
  firstName: string;
  initials: string;
  tint: AvatarTint;
  avatarUrl?: string;
}

/** The signed-in member, who is the host of the gathering being written. */
export function useSignedInHost(): PreviewPerson {
  const { t } = useTranslation();
  const { user } = useAuth();
  const profile = user?.profile;
  if (!profile) {
    const youLabel = t("gatherings:create.v2.preview.hostYou");
    return {
      key: "host",
      firstName: youLabel,
      initials: initialsFromName(youLabel),
      tint: "coral",
    };
  }
  return {
    key: profile.slug || "host",
    firstName: profile.firstName,
    initials: initialsFromParts(profile.firstName, profile.lastName),
    tint: "coral",
    avatarUrl: profile.avatarUrl ?? undefined,
  };
}

/**
 * The co-hosts the host picked, as faces for the host row. The form keeps each
 * pick with the name, initials and photo the picker showed (`form.cohosts`),
 * so the card reads them straight off the form and loads nothing. A face
 * without a photo takes the tint its slug always gets.
 */
export function previewCohostPeople(
  cohosts: readonly CohostPick[],
): PreviewPerson[] {
  return cohosts.map((cohost) => ({
    key: cohost.slug,
    firstName: cohost.name.trim().split(/\s+/)[0] || cohost.name,
    initials: cohost.initials,
    tint: tintForSlug(cohost.slug),
    avatarUrl: cohost.avatarUrl ?? undefined,
  }));
}
