import { useEffect, useRef } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { cx } from "../../../../shared/lib/cx";
import {
  WRITER_TAB_IDS,
  WRITER_TAB_LABEL_KEYS,
  type WriterTab,
} from "../../writerTabs";
import styles from "../../WriterWorkspacePage.module.css";

export interface WriterWorkspaceTabsProps {
  activeTab: WriterTab;
  onSelectTab: (tab: WriterTab) => void;
}

/**
 * The writer workspace's tab nav, in `WRITER_TAB_IDS` order. On a phone the
 * row is wider than the screen and scrolls sideways inside its own box, so a
 * deep link such as `?tab=payments` scrolls the row to bring the active tab
 * into view. Only the row's `scrollLeft` moves (`scrollIntoView` would also
 * scroll the page). It re-runs whenever a tab resizes, since the labels widen
 * after mount once the Portuguese catalog or the web font arrives, and
 * whenever the row itself resizes, as when a rotated phone narrows it. A
 * visually hidden h2 after the row names the active tab. Extracted so
 * `WriterWorkspacePage` stays under the 200-line component limit.
 */
export function WriterWorkspaceTabs({
  activeTab,
  onSelectTab,
}: WriterWorkspaceTabsProps) {
  const { t } = useTranslation();
  const tabRowRef = useRef<HTMLElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tabRow = tabRowRef.current;
    const activeButton = activeButtonRef.current;
    if (!tabRow || !activeButton) return;
    function revealActiveTab(row: HTMLElement, button: HTMLElement) {
      // Positions in the row's scroll coordinates.
      const rowRect = row.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const activeStart = buttonRect.left - rowRect.left + row.scrollLeft;
      const activeEnd = activeStart + buttonRect.width;
      if (activeStart < row.scrollLeft) {
        row.scrollLeft = activeStart;
      } else if (activeEnd > row.scrollLeft + row.clientWidth) {
        row.scrollLeft = activeEnd - row.clientWidth;
      }
    }
    // Observing fires once straight away, which covers the first reveal.
    const resizeObserver = new ResizeObserver(() =>
      revealActiveTab(tabRow, activeButton),
    );
    resizeObserver.observe(tabRow);
    for (const tabButton of tabRow.children) resizeObserver.observe(tabButton);
    return () => resizeObserver.disconnect();
  }, [activeTab]);

  return (
    <>
      <nav
        ref={tabRowRef}
        className={styles.tabs}
        aria-label={t("magazine:writer.tabs.ariaLabel")}
      >
        {WRITER_TAB_IDS.map((tabId) => (
          <button
            key={tabId}
            ref={activeTab === tabId ? activeButtonRef : undefined}
            type="button"
            className={cx(
              styles.tabButton,
              activeTab === tabId && styles.tabButtonActive,
            )}
            aria-current={activeTab === tabId}
            onClick={() => onSelectTab(tabId)}
          >
            {t(WRITER_TAB_LABEL_KEYS[tabId])}
          </button>
        ))}
      </nav>
      {/* Names the active tab in the heading outline, between the page's h1
          and the tab body's h3s; on screen the tab row already shows it. The
          page renders the tab body straight after this. */}
      <h2 className="visuallyHidden">{t(WRITER_TAB_LABEL_KEYS[activeTab])}</h2>
    </>
  );
}
