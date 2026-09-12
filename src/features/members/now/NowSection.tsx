import { useState } from "react";
import { VisibilityBadge } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { MemberProfile } from "../data/memberProfiles";
import { Section } from "../ProfileSections";
import { useNowInsights } from "../api/useNowInsights";
import { StatsFunnelLine } from "../StatsFunnelLine";
import { NowCard } from "./NowCard";
import { UpdateNowModal } from "./UpdateNowModal";

/**
 * The profile's "Now" section: a section head plus the dark plum card that
 * carries the member's current status, their boundary note and the doors they
 * are open to.
 *
 * The owner sees three extras a visitor never does: the figures line above the
 * card, the relative "updated" stamp and Update button inside it, and the
 * visibility badge in the head. All three ride on `isSelf`, and the insights
 * query is disabled for anyone else, so a visitor's render costs one request
 * fewer rather than fetching numbers it would then hide.
 */
export function NowSection({
  profile,
  isSelf = false,
}: {
  profile: MemberProfile;
  /** Your own chips are inert: there's no one to reach out to. */
  isSelf?: boolean;
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const { data: insights = null } = useNowInsights(isSelf, profile.slug);
  // Three independent fields feed this card, and the section only disappears
  // when ALL THREE are empty: an empty card reads as a bug, but so does a
  // stated boundary with nowhere to render. `notHereFor` is edited on its own
  // (ProfileEditDetailFields), so "a boundary note, no status, no open doors"
  // is a real profile, and since the hero's copy of the note was removed this
  // card is the only place it appears. Keep `profileSectionNav.data.ts`'s
  // `now` entry in step with this condition: it mirrors it for the rail.
  if (
    !profile.now?.trim() &&
    profile.openTo.length === 0 &&
    !profile.notHereFor?.trim()
  )
    return null;
  return (
    <Section
      id="now"
      title={t("members:content.now.title")}
      subtitle={t("members:content.now.subtitle", { first: profile.first })}
      aside={
        isSelf ? (
          <VisibilityBadge
            mode={profile.visibility}
            label={t(`members:content.now.visibility.${profile.visibility}`)}
          />
        ) : undefined
      }
    >
      {isSelf && insights && (
        <StatsFunnelLine
          hellos={insights.hellos}
          replies={insights.replies}
          windowDays={insights.windowDays}
        />
      )}
      <NowCard
        profile={profile}
        isSelf={isSelf}
        insights={isSelf ? insights : null}
        onUpdate={() => setIsEditing(true)}
      />
      {isEditing && (
        <UpdateNowModal profile={profile} onClose={() => setIsEditing(false)} />
      )}
    </Section>
  );
}
