import { useEffect, useId, useRef, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Collapse, tabIds, tabPanelProps } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReviewTab } from "./api/studioFlagReview.adapters";
import {
  StudioReviewClaimsBadge,
  StudioReviewDisputesBadge,
  StudioReviewReportsBadge,
} from "./StudioReviewClaimsBadge";
import { StudioReviewClaimsPanel } from "./StudioReviewClaimsPanel";
import {
  StudioReviewDisputesPanel,
  StudioReviewReportsPanel,
  StudioReviewWithdrawnPanel,
} from "./StudioReviewPanels";
import {
  STUDIO_REVIEW_TAB_LABEL_KEY,
  STUDIO_REVIEW_TAB_PARAM,
  STUDIO_REVIEW_TABS,
  isStudioReviewTab,
  studioReviewTabOf,
} from "./StudioReviewTabs.data";
import { useStudioListeningPreferences } from "./player/useStudioPlayerPreferences";
import { useReviewCardKeys } from "./StudioReviewQueue";
import { StudioShell } from "./StudioShell";
import { StudioTablist } from "./StudioTablist";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import css from "./StudioFlagReview.module.css";

// Studio safety: Reports, Claims and Disputes carry a count while work waits
// for our team (the rule: a badge when there is something to review).
const REVIEW_TAB_BADGE: Partial<Record<StudioReviewTab, ReactNode>> = {
  reports: <StudioReviewReportsBadge />,
  claims: <StudioReviewClaimsBadge />,
  disputes: <StudioReviewDisputesBadge />,
};

const REVIEW_TABS: {
  id: StudioReviewTab;
  labelKey: string;
  badge?: ReactNode;
}[] = STUDIO_REVIEW_TABS.map((id) => ({
  id,
  labelKey: STUDIO_REVIEW_TAB_LABEL_KEY[id],
  badge: REVIEW_TAB_BADGE[id],
}));

const REVIEW_PANELS = {
  reports: StudioReviewReportsPanel,
  claims: StudioReviewClaimsPanel,
  disputes: StudioReviewDisputesPanel,
  withdrawn: StudioReviewWithdrawnPanel,
} as const;

/** The staff flag review for Studio (spec 7.2): reports from members,
 *  disputes from artists and every release that is down. */
export function StudioFlagReviewLive() {
  const { t } = useTranslation();
  const tabsId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useReviewCardKeys(panelRef);
  // The open queue lives in `?tab=`, so a refresh, Back from a release and
  // the staff menu badge all land on it. Switching replaces the entry, so
  // Back leaves the page instead of stepping through tabs.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = studioReviewTabOf(
    searchParams.get(STUDIO_REVIEW_TAB_PARAM),
  );
  const ActivePanel = REVIEW_PANELS[activeTab];
  const { preferences } = useStudioListeningPreferences();
  // An unknown `?tab=` reads as Reports; the URL is put right in place, so
  // a copied link always names the queue on screen.
  const tabParam = searchParams.get(STUDIO_REVIEW_TAB_PARAM);
  useEffect(() => {
    if (tabParam === null || isStudioReviewTab(tabParam)) return;
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set(STUDIO_REVIEW_TAB_PARAM, "reports");
        return next;
      },
      { replace: true },
    );
  }, [tabParam, setSearchParams]);
  useStudioDocumentTitle(
    t("studio:flagReviewLive.documentTitle", {
      tab: t(STUDIO_REVIEW_TAB_LABEL_KEY[activeTab]),
    }),
  );
  function openTab(tab: StudioReviewTab) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set(STUDIO_REVIEW_TAB_PARAM, tab);
        return next;
      },
      { replace: true },
    );
  }
  return (
    <StudioShell>
      <div className={css.wrap}>
        <header className={css.pageH}>
          <div className={css.eb}>{t("studio:flagReviewLive.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:flagReviewLive.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={css.dek}>{t("studio:flagReviewLive.dek")}</p>
        </header>
        <StudioTablist
          tabs={REVIEW_TABS}
          activeId={activeTab}
          onChange={openTab}
          idPrefix={tabsId}
          label={t("studio:flagReviewLive.tablistLabel")}
        />
        <Collapse isOpen={preferences.areSingleKeyShortcutsOn}>
          <p className={css.keysHint}>
            <Translation
              i18nKey="studio:flagReviewLive.queue.keysHint"
              components={{ key: <kbd className={css.key} /> }}
            />
          </p>
        </Collapse>
        <div
          ref={panelRef}
          {...tabPanelProps(tabsId, activeTab)}
          className={css.panel}
        >
          {/* The queue's own heading, between the page h1 and the card h3s. */}
          <h2 className={css.visuallyHidden}>
            {t(STUDIO_REVIEW_TAB_LABEL_KEY[activeTab])}
          </h2>
          <ActivePanel
            key={activeTab}
            tabButtonId={tabIds(tabsId, activeTab).tab}
          />
        </div>
      </div>
    </StudioShell>
  );
}
