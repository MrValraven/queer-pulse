import { MobileProfileHeader } from "./MobileProfileHeader";
import { MobilePersonaHighlights } from "./MobilePersonaHighlights";
import { MobileProfileTabs } from "./MobileProfileTabs";
import type { MemberProfile } from "./data/memberProfiles";
import type { Member } from "./data/members";

/**
 * Instagram-style composition of the mobile member profile: pride-ringed
 * avatar header, persona "story highlights" row, and the sticky segmented
 * content-tab bar — replacing the desktop hero + stacked sections on narrow
 * viewports. Every child owns its own data/visibility rules; this component
 * only wires the already-resolved profile values through in order.
 *
 * Deliberately NOT wrapped in a single `.wrap` here: the sticky tab bar
 * (`MobileProfileTabs`) needs to span the full viewport width
 * (Instagram-style, edge-to-edge), and the Community tab's
 * `ProfileCommunitiesSection` / `PlacesSection` already carry their own
 * `.wrap` gutter (shared with their desktop rendering) — wrapping this whole
 * tree in a second `.wrap` would double their horizontal padding. The header
 * and highlights row instead apply the gutter themselves (see `.mheader` /
 * `.highlightsRow` in `MobileProfile.module.css`), and every other tab
 * section gets its single `.wrap` from `MobileProfileTabPanels`.
 */
export function MobileProfileView({
  profile,
  isSelf,
  selfView,
  previewing,
  otherMember,
  ownerSlug,
  onEdit,
  onEditLinks,
  onPreview,
}: {
  profile: MemberProfile;
  isSelf: boolean;
  selfView: boolean;
  previewing: boolean;
  otherMember: Member | null;
  ownerSlug: string;
  onEdit: () => void;
  onEditLinks: () => void;
  onPreview: () => void;
}) {
  // `selfView` (isSelf && !previewing) isn't needed here — every child below
  // derives the same thing itself from `isSelf` + `previewing`. Accepted for
  // interface parity with the desktop branch's resolved values.
  void selfView;

  return (
    <>
      <MobileProfileHeader
        profile={profile}
        self={isSelf}
        asVisitor={isSelf && previewing}
        previewing={previewing}
        otherMember={otherMember}
        ownerSlug={ownerSlug}
        onEdit={onEdit}
        onEditLinks={onEditLinks}
        onPreview={onPreview}
      />
      <MobilePersonaHighlights
        ownerSlug={ownerSlug}
        isSelf={isSelf}
        previewing={previewing}
      />
      {/* Remounts the whole tab tree (active tab + scroll position inside it)
          per profile — without this, navigating /members/a → /members/b keeps
          whichever tab was last active on the previous profile. */}
      <MobileProfileTabs
        key={profile.slug}
        profile={profile}
        isSelf={isSelf}
        previewing={previewing}
        otherMember={otherMember}
        firstName={profile.first}
        memberSlug={ownerSlug}
      />
    </>
  );
}
