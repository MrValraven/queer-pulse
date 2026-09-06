import { useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofileDirectoryPage.module.css";

/** Which half of the persona hub is on screen. Mirrors `?view=` exactly. */
export type SubprofileDirectoryView = "browse" | "following";

const VIEW_TABS: { key: SubprofileDirectoryView; labelKey: string }[] = [
  { key: "browse", labelKey: "subprofiles:directory.tabs.browse" },
  { key: "following", labelKey: "subprofiles:directory.tabs.following" },
];

/**
 * The persona hub's two tabs: everyone's personas, and the ones you follow.
 *
 * Following lives here rather than on the owner dashboard because the hub is
 * where personas are found in the first place: the empty state's "go find
 * some" is the tab next door, not another page, and the Follow control that
 * fills this list is on the persona pages this same tab links out to.
 *
 * A full `role="tablist"` with a roving tabindex, mirroring
 * `CommunitiesTopTabs`: arrow keys move between the tabs, only the active one
 * is in the tab sequence, and each names the panel it controls. The panel
 * carries the matching `id="subprofile-directory-panel-<view>"`.
 */
export function SubprofileDirectoryTabs({
  active,
  onChange,
}: {
  active: SubprofileDirectoryView;
  onChange: (view: SubprofileDirectoryView) => void;
}) {
  const { t } = useTranslation();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveTo = (index: number) => {
    const nextIndex = (index + VIEW_TABS.length) % VIEW_TABS.length;
    const nextTab = VIEW_TABS[nextIndex];
    if (!nextTab) return;
    onChange(nextTab.key);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        moveTo(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        moveTo(index - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(VIEW_TABS.length - 1);
        break;
    }
  };

  return (
    <div
      className={styles.viewTabs}
      role="tablist"
      aria-label={t("subprofiles:directory.tabs.ariaLabel")}
    >
      {VIEW_TABS.map((tab, index) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`subprofile-directory-tab-${tab.key}`}
            aria-selected={isActive}
            aria-controls={`subprofile-directory-panel-${tab.key}`}
            tabIndex={isActive ? 0 : -1}
            className={[styles.viewTab, isActive && styles.viewTabOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(tab.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
