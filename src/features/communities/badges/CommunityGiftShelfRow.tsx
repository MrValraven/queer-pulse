import { createElement, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiGift } from "react-icons/fi";
import { Button, FadeIn } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ReportListingModal } from "../../economy/ReportListingModal";
import type { CommunityShelfGiftDTO } from "./api/communityBadges.api";
import { communityBadgeIcon } from "./communityBadgeIcons";
import { communityGiftNameKey } from "./communityBadgeCopy.data";
import {
  communityGiftOf,
  resolveCommunityFlairTint,
} from "./communityBadges.catalog";
import { isMarkShowing } from "./communityBadgeSheet.model";
import styles from "./CommunityBadgeSheet.module.css";

export interface CommunityGiftShelfRowProps {
  gift: CommunityShelfGiftDTO;
  isPending: boolean;
  onToggleHidden: () => void;
}

const SHELF_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
};

/**
 * One received gift on the recipient's own shelf: the gift, who sent it, the
 * note, when it came and whether it still shows beside their name. The
 * recipient hides or shows its mark here, and can report it to our team.
 */
export function CommunityGiftShelfRow({
  gift,
  isPending,
  onToggleHidden,
}: CommunityGiftShelfRowProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [isReporting, setIsReporting] = useState(false);
  // Read once per mount: the line under the gift only needs the day.
  const [now] = useState(() => Date.now());
  const entry = communityGiftOf(gift.giftKey);
  const giftName = t(communityGiftNameKey(gift.giftKey));
  const senderName = gift.sender
    ? `${gift.sender.firstName} ${gift.sender.lastName}`.trim()
    : null;
  const isShowing = isMarkShowing(gift, now);
  // Past its 7 days a gift has no mark left to hide or show.
  const hasMarkEnded = Date.parse(gift.markEndsAt) <= now;
  const reportSubject = senderName
    ? t("communities:badges.shelf.reportSubject", {
        gift: giftName,
        name: senderName,
      })
    : t("communities:badges.shelf.reportSubjectDeleted", { gift: giftName });
  const markState = gift.isHidden ? "hidden" : isShowing ? "showing" : "ended";

  return (
    <article className={styles.giftRow}>
      <span
        className={styles.giftIcon}
        data-tint={resolveCommunityFlairTint(entry?.tint)}
        aria-hidden
      >
        {createElement(entry ? communityBadgeIcon(entry.iconKey) : FiGift)}
      </span>
      <div className={styles.giftBody}>
        <p className={styles.giftName}>{giftName}</p>
        <p className={styles.giftFrom}>
          {senderName
            ? t("communities:badges.shelf.from", { name: senderName })
            : t("communities:badges.shelf.fromDeleted")}
        </p>
        {gift.note && (
          <p className={styles.giftNote}>
            <q>{gift.note}</q>
          </p>
        )}
        <p className={styles.giftMeta}>
          {t("communities:badges.shelf.sentOn", {
            date: fmt.date(new Date(gift.sentAt), SHELF_DATE_FORMAT),
          })}
        </p>
        <FadeIn key={markState}>
          {markState === "showing" && (
            <p className={styles.giftMark}>
              {t("communities:badges.shelf.showingUntil", {
                date: fmt.date(new Date(gift.markEndsAt), SHELF_DATE_FORMAT),
              })}
            </p>
          )}
          {markState === "hidden" && (
            <p className={styles.giftMarkHidden}>
              {t("communities:badges.shelf.hiddenNote")}
            </p>
          )}
        </FadeIn>
        {(!hasMarkEnded || gift.note) && (
          <div className={styles.giftActions}>
            {!hasMarkEnded && (
              <Button
                variant="ghost"
                size="sm"
                className={styles.actionButton}
                aria-disabled={isPending || undefined}
                onClick={() => {
                  if (!isPending) onToggleHidden();
                }}
              >
                {gift.isHidden
                  ? t("communities:badges.shelf.show")
                  : t("communities:badges.shelf.hide")}
              </Button>
            )}
            {gift.note && (
              <Button
                variant="quiet"
                size="sm"
                className={styles.actionButton}
                aria-label={
                  senderName
                    ? t("communities:badges.shelf.reportAria", {
                        gift: giftName,
                        name: senderName,
                      })
                    : t("communities:badges.shelf.reportAriaDeleted", {
                        gift: giftName,
                      })
                }
                onClick={() => setIsReporting(true)}
              >
                {t("communities:badges.shelf.report")}
              </Button>
            )}
          </div>
        )}
      </div>
      <AnimatePresence>
        {isReporting && (
          <ReportListingModal
            key="report-gift"
            subjectType="community_gift"
            subjectId={gift.id}
            subjectName={reportSubject}
            onClose={() => setIsReporting(false)}
          />
        )}
      </AnimatePresence>
    </article>
  );
}
