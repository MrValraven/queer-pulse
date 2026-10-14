import { useId, useState } from "react";
import { tabIds, tabPanelProps } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReviewTab } from "./api/studioFlagReview.adapters";
import {
  StudioReviewDisputesPanel,
  StudioReviewReportsPanel,
  StudioReviewWithdrawnPanel,
} from "./StudioReviewPanels";
import { StudioShell } from "./StudioShell";
import { StudioTablist } from "./StudioTablist";
import css from "./StudioFlagReview.module.css";

const REVIEW_TAB_LABEL_KEY: Record<StudioReviewTab, string> = {
  reports: "studio:flagReviewLive.tabs.reports",
  disputes: "studio:flagReviewLive.tabs.disputes",
  withdrawn: "studio:flagReviewLive.tabs.withdrawn",
};

const REVIEW_TABS: { id: StudioReviewTab; labelKey: string }[] = (
  ["reports", "disputes", "withdrawn"] as const
).map((id) => ({ id, labelKey: REVIEW_TAB_LABEL_KEY[id] }));

const REVIEW_PANELS = {
  reports: StudioReviewReportsPanel,
  disputes: StudioReviewDisputesPanel,
  withdrawn: StudioReviewWithdrawnPanel,
} as const;

/** The staff flag review for Studio (spec 7.2): reports from members,
 *  disputes from artists and every release that is down. */
export function StudioFlagReviewLive() {
  const { t } = useTranslation();
  const tabsId = useId();
  const [activeTab, setActiveTab] = useState<StudioReviewTab>("reports");
  const ActivePanel = REVIEW_PANELS[activeTab];
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
          onChange={setActiveTab}
          idPrefix={tabsId}
          label={t("studio:flagReviewLive.tablistLabel")}
        />
        <div {...tabPanelProps(tabsId, activeTab)} className={css.panel}>
          {/* The queue's own heading, between the page h1 and the card h3s. */}
          <h2 className={css.visuallyHidden}>
            {t(REVIEW_TAB_LABEL_KEY[activeTab])}
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
