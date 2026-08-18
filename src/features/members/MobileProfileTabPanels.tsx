import type { ReactNode } from "react";
import type { MemberProfile } from "./data/memberProfiles";
import type { Member } from "./data/members";
import type { MobileProfileTabKey } from "./mobileProfileTabs.data";
import {
  ActivitySection,
  BoardSection,
  GroupsSection,
  NowSection,
  RelatedSection,
  SelectedWorkSection,
  ShapingsSection,
  SkillsSection,
} from "./ProfileContentSections";
import { ProfileCommunitiesSection } from "./ProfileCommunitiesSection";
import { PlacesSection } from "./PlacesSection";
import styles from "./MobileProfile.module.css";

/**
 * Gives a single `.wrap` gutter to a `ProfileContentSections` section that
 * doesn't carry one itself (unlike `ProfileCommunitiesSection`/
 * `PlacesSection`, which self-wrap because they're also rendered bare on
 * desktop — see `MobileProfileView`'s doc comment for why this whole tree
 * isn't wrapped a second time from above). `data-section-wrap` pairs with a
 * `:empty` rule in `MobileProfile.module.css` so a section that renders
 * `null` (its own internal empty-state logic, untouched here) collapses to
 * nothing instead of leaving a phantom `.tabPanel` flex-gap gap.
 */
function SectionWrap({ children }: { children: ReactNode }) {
  return (
    <div className="wrap" data-section-wrap>
      {children}
    </div>
  );
}

/**
 * Renders the sections belonging to the active mobile profile tab, inside a
 * single `role="tabpanel"`. Pure content switch — `MobileProfileTabs` owns
 * the tablist chrome, active-tab state, and which tabs are present at all.
 * Every section keeps its own internal empty-state logic (some render
 * `null`, some render a prompt); this just groups them by tab.
 *
 * `isSelf` here is the RAW "is this the owner's page" flag, mirroring
 * `ProfilePage`'s own variable — required as-is by `ProfileCommunitiesSection`
 * (see its doc comment: it must resolve from the owner's draft even while
 * previewing). Every other section instead wants `selfView` (`isSelf &&
 * !previewing`), same as `ProfilePage` passes to `ProfileContent`/
 * `PlacesSection` today — so an owner clicking "Preview as visitor" actually
 * sees the visitor's read-only view instead of their own edit affordances.
 */
export function MobileProfileTabPanels({
  activeTab,
  panelId,
  tabId,
  profile,
  isSelf,
  previewing,
  otherMember,
  firstName,
  memberSlug,
}: {
  activeTab: MobileProfileTabKey;
  panelId: string;
  tabId: string;
  profile: MemberProfile;
  isSelf: boolean;
  previewing: boolean;
  otherMember: Member | null;
  firstName: string;
  memberSlug: string;
}) {
  const selfView = isSelf && !previewing;
  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      className={styles.tabPanel}
    >
      {activeTab === "about" && (
        <>
          <SectionWrap>
            <NowSection profile={profile} isSelf={selfView} />
          </SectionWrap>
          <SectionWrap>
            <ShapingsSection profile={profile} />
          </SectionWrap>
          <SectionWrap>
            <SkillsSection profile={profile} />
          </SectionWrap>
        </>
      )}
      {activeTab === "work" && (
        <>
          <SectionWrap>
            <SelectedWorkSection profile={profile} />
          </SectionWrap>
          <SectionWrap>
            <BoardSection profile={profile} isSelf={selfView} />
          </SectionWrap>
        </>
      )}
      {activeTab === "community" && (
        <>
          {/* Self-wraps (also rendered bare on desktop) — no SectionWrap. */}
          <ProfileCommunitiesSection
            isSelf={isSelf}
            previewing={previewing}
            otherMember={otherMember}
            firstName={firstName}
          />
          <SectionWrap>
            <GroupsSection profile={profile} />
          </SectionWrap>
          {/* Self-wraps (also rendered bare on desktop) — no SectionWrap. */}
          <PlacesSection
            memberSlug={memberSlug}
            isSelf={selfView}
            firstName={firstName}
          />
          <SectionWrap>
            <RelatedSection profile={profile} />
          </SectionWrap>
        </>
      )}
      {activeTab === "activity" && (
        <SectionWrap>
          <ActivitySection profile={profile} />
        </SectionWrap>
      )}
    </div>
  );
}
