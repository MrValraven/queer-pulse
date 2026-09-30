import { useId, useRef, useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiRefreshCw,
  FiSettings,
} from "react-icons/fi";
import { Button, ConfirmDialog, Sending } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { feedLastErrorKey, translateFeedError } from "../api/feedImportErrors";
import type { SubprofileView } from "../api/subprofiles.adapters";
import type { SubprofileFeedDTO } from "../api/subprofileFeeds.api";
import { useSubprofileFeedMutations } from "../api/useSubprofileFeedMutations";
import { SECTION_META } from "../subprofile-kinds";
import { FeedReviewQueue } from "./FeedReviewQueue";
import { FeedSettings, type FeedSettingsResult } from "./FeedSettings";
import { feedImportSections } from "./feedImportKinds";
import styles from "./FeedCard.module.css";

const LAST_CHECKED_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

/**
 * One connected feed: its show, whether we can reach it (in plain words when
 * we cannot), when it was last checked, Check now, Settings and Disconnect,
 * then its review queue. Status is written as text with an icon, never colour
 * alone. `shouldFocus` moves focus to the title once (after a connection
 * finishes), so a keyboard user lands on the feed they just added.
 */
export function FeedCard({
  subprofile,
  feed,
  shouldFocus,
  onDisconnected,
}: {
  subprofile: SubprofileView;
  feed: SubprofileFeedDTO;
  shouldFocus: boolean;
  onDisconnected: () => void;
}) {
  const { t } = useTranslation();
  const { date } = useFormat();
  const { showToast } = useToast();
  const { sync, disconnect } = useSubprofileFeedMutations();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardId = useId();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);
  const [result, setResult] = useState<FeedSettingsResult | null>(null);

  useEffect(() => {
    if (shouldFocus) titleRef.current?.focus();
  }, [shouldFocus]);

  const sections = feedImportSections(subprofile.kind);
  const sectionView = subprofile.sections.find(
    (candidate) => candidate.section === feed.section,
  );
  const target = { subprofileId: feed.subprofileId, feedId: feed.id };
  const isFailing = feed.status === "failing";
  const title = feed.title || t("subprofiles:feedImport.feed.untitled");

  function checkNow() {
    setResult(null);
    sync.mutate(target, {
      onSuccess: (checked) => {
        const found = checked.pendingCount - feed.pendingCount;
        setResult({
          tone: "ok",
          text:
            found > 0
              ? t("subprofiles:feedImport.feed.checkedFound", { count: found })
              : t("subprofiles:feedImport.feed.checkedNothing"),
        });
      },
      onError: (error) =>
        setResult({
          tone: "error",
          text: translateFeedError(t, error),
        }),
    });
  }

  // Awaited rather than given per-call callbacks: the card unmounts as the
  // feed leaves the list, and callbacks tied to an unmounted observer may
  // never run, where the toast and the focus hand-off must.
  async function confirmDisconnect() {
    try {
      await disconnect.mutateAsync(target);
    } catch (error) {
      setIsConfirmingDisconnect(false);
      setResult({ tone: "error", text: translateFeedError(t, error) });
      return;
    }
    setIsConfirmingDisconnect(false);
    showToast(t("subprofiles:feedImport.disconnect.done"), "success");
    onDisconnected();
  }

  return (
    <article className={styles.card} aria-labelledby={`${cardId}-title`}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <h3 id={`${cardId}-title`} ref={titleRef} tabIndex={-1}>
            {title}
          </h3>
          {feed.author && <p className={styles.author}>{feed.author}</p>}
          <p className={styles.statusLine}>
            {isFailing ? (
              <span className={styles.failing}>
                <FiAlertCircle aria-hidden />
                {t("subprofiles:feedImport.feed.status.failing")}
              </span>
            ) : (
              <span className={styles.ok}>
                <FiCheck aria-hidden />
                {t("subprofiles:feedImport.feed.status.active")}
              </span>
            )}
            <span>
              {feed.lastSyncedAt
                ? t("subprofiles:feedImport.feed.lastSynced", {
                    when: date(
                      new Date(feed.lastSyncedAt),
                      LAST_CHECKED_FORMAT,
                    ),
                  })
                : t("subprofiles:feedImport.feed.neverSynced")}
            </span>
            <span>
              {t("subprofiles:feedImport.feed.published", {
                count: feed.publishedCount,
              })}
            </span>
          </p>
          {isFailing && (
            <p className={styles.failingNote}>
              {t(feedLastErrorKey(feed.lastError))}
            </p>
          )}
        </div>
        <div
          className={styles.actions}
          role="group"
          aria-label={t("subprofiles:feedImport.feed.actionsLabel", {
            feed: title,
          })}
        >
          <Button
            variant="ghost"
            size="sm"
            disabled={sync.isPending}
            onClick={checkNow}
          >
            {sync.isPending ? (
              <Sending label={t("subprofiles:feedImport.feed.checking")} />
            ) : (
              <>
                <FiRefreshCw aria-hidden />{" "}
                {t("subprofiles:feedImport.feed.checkNow")}
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={isSettingsOpen}
            aria-controls={`${cardId}-settings`}
            onClick={() => setIsSettingsOpen((isOpen) => !isOpen)}
          >
            <FiSettings aria-hidden />{" "}
            {t("subprofiles:feedImport.feed.settings")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsConfirmingDisconnect(true)}
          >
            {t("subprofiles:feedImport.feed.disconnect")}
          </Button>
        </div>
      </header>

      <div id={`${cardId}-settings`} hidden={!isSettingsOpen}>
        {isSettingsOpen && (
          <FeedSettings feed={feed} sections={sections} onResult={setResult} />
        )}
      </div>

      <p className={styles.status} role="status">
        {result?.tone === "ok" ? result.text : ""}
      </p>
      <p className={styles.statusError} role="alert">
        {result?.tone === "error" ? result.text : ""}
      </p>

      <FeedReviewQueue
        feed={feed}
        sectionLabel={t(SECTION_META[feed.section].labelKey)}
        sectionItemCount={sectionView?.items.length ?? 0}
      />

      <ConfirmDialog
        open={isConfirmingDisconnect}
        onClose={() => setIsConfirmingDisconnect(false)}
        onConfirm={() => void confirmDisconnect()}
        tone="destructive"
        loading={disconnect.isPending}
        title={t("subprofiles:feedImport.disconnect.title")}
        description={t("subprofiles:feedImport.disconnect.body")}
        confirmLabel={t("subprofiles:feedImport.disconnect.confirm")}
      />
    </article>
  );
}
