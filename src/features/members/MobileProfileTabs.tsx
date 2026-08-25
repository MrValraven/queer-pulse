import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MemberProfile } from "./data/memberProfiles";
import type { Member } from "./data/members";
import {
  MOBILE_PROFILE_TAB_DEFS,
  type MobileProfileTabKey,
} from "./mobileProfileTabs.data";
import { MobileProfileTabPanels } from "./MobileProfileTabPanels";
import styles from "./MobileProfile.module.css";

/** Which tab groups have visible content, computed synchronously from
 *  `profile` (all the fields involved are plain arrays, never async).
 *  `community` is always present, exactly like `about` — two of its four
 *  sections (`ProfileCommunitiesSection`, `PlacesSection`) are async-sourced
 *  (a live-communities hook, a listings query), not `profile` fields, so a
 *  sync gate here has no way to see their data. Each of the four sections
 *  inside self-hides when it's genuinely empty (same pattern `about`'s
 *  sections already use), so an always-present tab never shows a blank
 *  panel — it just may render fewer of its four sections. */
function tabHasContent(
  key: MobileProfileTabKey,
  profile: MemberProfile,
): boolean {
  switch (key) {
    case "about":
    case "community":
      return true;
    case "work":
      return (
        (profile.work?.length ?? 0) > 0 || (profile.board?.length ?? 0) > 0
      );
    case "activity":
      return (profile.activity?.length ?? 0) > 0;
  }
}

/**
 * Sticky, segmented content-tab bar for the mobile member profile —
 * Instagram's grid/reels/tagged bar, mapped to this profile's existing
 * sections grouped into about / work / community / activity. A tab with no
 * backing data for this profile doesn't render at all. Switching tabs swaps
 * which group of (unmodified) section components render below the bar; nothing
 * here reimplements a section's own content or empty-state logic.
 */
export function MobileProfileTabs({
  profile,
  isSelf,
  previewing,
  otherMember,
  firstName,
  memberSlug,
}: {
  profile: MemberProfile;
  isSelf: boolean;
  previewing: boolean;
  otherMember: Member | null;
  firstName: string;
  memberSlug: string;
}) {
  const { t } = useTranslation();
  const visibleTabs = MOBILE_PROFILE_TAB_DEFS.filter((def) =>
    tabHasContent(def.key, profile),
  );
  const [activeTab, setActiveTab] = useState<MobileProfileTabKey>(
    () => visibleTabs[0]!.key,
  );
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Defensive fallback only — `MobileProfileView` remounts this component
  // per profile (`key={profile.slug}`), so `activeTab` should always match a
  // visible tab. If it ever doesn't (e.g. a future caller drops the key),
  // show the first tab rather than an empty panel.
  const activeIndex = Math.max(
    visibleTabs.findIndex((tab) => tab.key === activeTab),
    0,
  );
  const currentTab = visibleTabs[activeIndex]!;

  function focusAndActivate(index: number) {
    const tab = visibleTabs[index]!;
    setActiveTab(tab.key);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const lastIndex = visibleTabs.length - 1;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAndActivate(index === lastIndex ? 0 : index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAndActivate(index === 0 ? lastIndex : index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusAndActivate(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusAndActivate(lastIndex);
    }
  }

  return (
    <div className={styles.tabsWrap}>
      <div
        className={styles.tabList}
        role="tablist"
        aria-label={t("members:profile.tabs.ariaLabel")}
        style={
          {
            "--tab-count": visibleTabs.length,
            "--active-index": activeIndex,
          } as CSSProperties
        }
      >
        <span className={styles.tabIndicator} aria-hidden />
        {visibleTabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = index === activeIndex;
          return (
            <button
              key={tab.key}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              id={`profile-tab-${tab.key}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`profile-tabpanel-${tab.key}`}
              tabIndex={isActive ? 0 : -1}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.key)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <Icon className={styles.tabIcon} aria-hidden />
              <span className={styles.tabLabel}>{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>
      <MobileProfileTabPanels
        activeTab={currentTab.key}
        panelId={`profile-tabpanel-${currentTab.key}`}
        tabId={`profile-tab-${currentTab.key}`}
        profile={profile}
        isSelf={isSelf}
        previewing={previewing}
        otherMember={otherMember}
        firstName={firstName}
        memberSlug={memberSlug}
      />
    </div>
  );
}
