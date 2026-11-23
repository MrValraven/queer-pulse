import { useId } from "react";
import {
  Collapse,
  FadeIn,
  LoadErrorState,
  ModalSheet,
  SkeletonLine,
  Tabs,
  tabPanelProps,
} from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityBadgesResponse } from "./api/communityBadges.api";
import { useCommunityBadges } from "./api/useCommunityBadges";
import { CommunityBadgeList } from "./CommunityBadgeList";
import { communityBadgeErrorText } from "./communityBadgeErrors";
import type { BadgeSheetTab } from "./communityBadgeSheet.model";
import { CommunityGiftShelf } from "./CommunityGiftShelf";
import styles from "./CommunityBadgeSheet.module.css";

export interface CommunityBadgeSheetProps {
  slug: string;
  communityName: string;
  tab: BadgeSheetTab;
  focusBadgeId: string | null;
  onTabChange: (tab: BadgeSheetTab) => void;
  onClose: () => void;
}

const SKELETON_ROWS = [0, 1, 2];

function isBadgeSheetTab(value: string): value is BadgeSheetTab {
  return value === "badges" || value === "gifts";
}

function BadgeSheetLead({
  response,
  communityName,
}: {
  response: CommunityBadgesResponse | undefined;
  communityName: string;
}) {
  const { t } = useTranslation();
  if (!response) return null;
  return (
    <FadeIn
      key={response.isMember ? "member" : "visitor"}
      className={styles.lead}
    >
      {response.isMember ? (
        <>
          <p className={styles.leadText}>
            {t("communities:badges.sheet.lead.member")}
          </p>
          <p className={styles.leadHint}>
            {t("communities:badges.sheet.wearHint", { name: communityName })}
          </p>
        </>
      ) : (
        <p className={styles.leadText}>
          {t("communities:badges.sheet.lead.visitor", { name: communityName })}
        </p>
      )}
    </FadeIn>
  );
}

/**
 * The badges of one community in a bottom sheet (a centred dialog on wider
 * screens). A member reads their progress, wears an earned badge and opens
 * their gift shelf from the Gifts tab. A visitor only ever sees the badge
 * list, whatever the link asked for, and the shelf is never requested.
 */
export function CommunityBadgeSheet({
  slug,
  communityName,
  tab,
  focusBadgeId,
  onTabChange,
  onClose,
}: CommunityBadgeSheetProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tabsId = useId();
  const badgesQuery = useCommunityBadges(slug);
  const response = badgesQuery.data;
  const isMember = response?.isMember === true;
  const activeTab: BadgeSheetTab = isMember ? tab : "badges";
  const title = t("communities:badges.sheet.title", { name: communityName });
  const panelProps = isMember ? tabPanelProps(tabsId, activeTab) : {};

  return (
    <ModalSheet onClose={onClose} ariaLabel={title}>
      <header className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <BadgeSheetLead response={response} communityName={communityName} />
      </header>
      <Collapse isOpen={isMember}>
        <Tabs
          idPrefix={tabsId}
          label={t("communities:badges.sheet.tabsLabel")}
          variant="underline"
          className={styles.tabs}
          active={activeTab}
          onChange={(nextTab) => {
            if (isBadgeSheetTab(nextTab)) onTabChange(nextTab);
          }}
          tabs={[
            { id: "badges", label: t("communities:badges.sheet.tab.badges") },
            { id: "gifts", label: t("communities:badges.sheet.tab.gifts") },
          ]}
        />
      </Collapse>
      <div {...panelProps} className={styles.panel}>
        {badgesQuery.isPending && (
          <div className={styles.list} aria-hidden>
            {SKELETON_ROWS.map((index) => (
              <div key={index} className={styles.skeletonBadge}>
                <SkeletonLine width="40%" height={24} />
                <SkeletonLine width="75%" />
                <SkeletonLine width="100%" height={6} />
              </div>
            ))}
          </div>
        )}
        {badgesQuery.isError && !response && (
          <FadeIn>
            <LoadErrorState
              compact
              onRetry={() => void badgesQuery.refetch()}
              isRetrying={badgesQuery.isRefetching}
              description={communityBadgeErrorText(badgesQuery.error, t, fmt)}
            />
          </FadeIn>
        )}
        {response && (
          <FadeIn key={activeTab}>
            {activeTab === "gifts" ? (
              <CommunityGiftShelf slug={slug} communityName={communityName} />
            ) : (
              <CommunityBadgeList
                slug={slug}
                communityName={communityName}
                response={response}
                focusBadgeId={focusBadgeId}
              />
            )}
          </FadeIn>
        )}
      </div>
    </ModalSheet>
  );
}
