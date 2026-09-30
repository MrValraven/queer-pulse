import { useEffect, useRef, useState } from "react";
import { LoadErrorState, SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SubprofileView } from "../api/subprofiles.adapters";
import { useSubprofileFeeds } from "../api/useSubprofileFeeds";
import { FeedCard } from "./FeedCard";
import { FeedConnectFlow } from "./FeedConnectFlow";
import styles from "./FeedImportPane.module.css";

/**
 * The editor's Import pane (shown only for the kinds in `FEED_IMPORT_KINDS`):
 * the connected feeds with their review queues, and the flow to connect
 * another. The pane router renders the title and lede above it, like every
 * other pane.
 *
 * Focus is handed on when the layout changes under the member: to the new
 * feed's title once a connection finishes, and, after a feed is disconnected
 * (the button that opened the dialog goes with its card), to the "Bring your
 * show in" heading, once the list has caught up.
 */
export function FeedImportPane({ subprofile }: { subprofile: SubprofileView }) {
  const { t } = useTranslation();
  const feedsQuery = useSubprofileFeeds(subprofile.id);
  const connectHeadingRef = useRef<HTMLHeadingElement>(null);
  const isHeadingFocusPending = useRef(false);
  const [focusFeedId, setFocusFeedId] = useState<string | null>(null);
  const feeds = feedsQuery.data ?? [];

  // A disconnect removes a card, which is what changes `feeds.length`; the
  // heading is on screen by then (the connect flow shows below the limit).
  useEffect(() => {
    if (!isHeadingFocusPending.current || !connectHeadingRef.current) return;
    isHeadingFocusPending.current = false;
    connectHeadingRef.current.focus();
  }, [feeds.length]);

  return (
    <div className={styles.pane} aria-busy={feedsQuery.isLoading}>
      {feedsQuery.isLoading ? (
        <div role="status" aria-label={t("subprofiles:feedImport.loading")}>
          <SkeletonLine />
        </div>
      ) : feedsQuery.isError ? (
        <LoadErrorState
          compact
          headingLevel={3}
          title={t("subprofiles:feedImport.loadError")}
          onRetry={() => void feedsQuery.refetch()}
          isRetrying={feedsQuery.isRefetching}
        />
      ) : (
        <>
          {feeds.map((feed) => (
            <FeedCard
              key={feed.id}
              subprofile={subprofile}
              feed={feed}
              shouldFocus={focusFeedId === feed.id}
              onDisconnected={() => {
                isHeadingFocusPending.current = true;
              }}
            />
          ))}
          <FeedConnectFlow
            subprofile={subprofile}
            hasFeeds={feeds.length > 0}
            feedCount={feeds.length}
            headingRef={connectHeadingRef}
            onDone={setFocusFeedId}
          />
        </>
      )}
    </div>
  );
}
