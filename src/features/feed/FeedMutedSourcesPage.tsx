import { Link } from "react-router-dom";
import { FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { useFeedMutes } from "./api/useFeedMutes";
import styles from "./FeedMutedSourcesPage.module.css";

/**
 * "Sources you've turned down" (SOC-18).
 *
 * A mute a member cannot find again is a mute they cannot undo, so every
 * source they quieted is listed here with its real name, a link to go and see
 * what they have been missing, and a one-tap way to bring it back.
 *
 * The page says plainly what muting did and did not do: it never removed them
 * from anything. That sentence is the whole reason the feature can exist
 * without costing communities their members.
 */
export function FeedMutedSourcesPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { sources, isLoading, unmute } = useFeedMutes();

  return (
    <AppShell>
      <div className={styles.page}>
        <div className="wrap">
          <Link to={routes.feed} className={styles.back}>
            <FiArrowLeft aria-hidden /> {t("feed:mute.backToFeed")}
          </Link>
          <h1 className={styles.title}>{t("feed:mute.pageTitle")}</h1>
          <p className={styles.blurb}>{t("feed:mute.pageBlurb")}</p>

          {isLoading ? (
            <div className={styles.list}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={styles.row} aria-hidden>
                  <SkeletonLine width="45%" height={15} />
                  <SkeletonLine
                    width="25%"
                    height={12}
                    style={{ marginTop: 8 }}
                  />
                </div>
              ))}
            </div>
          ) : sources.length === 0 ? (
            <EmptyState
              icon={<FiEyeOff />}
              title={t("feed:mute.emptyTitle")}
              description={t("feed:mute.emptyDescription")}
              action={{ label: t("feed:mute.backToFeed"), to: routes.feed }}
            />
          ) : (
            <ul className={styles.list}>
              {sources.map((source) => (
                <li key={source.sourceId} className={styles.row}>
                  <div className={styles.rowText}>
                    <div className={styles.rowName}>
                      {source.link ? (
                        <Link to={source.link} className={styles.rowLink}>
                          {source.name}
                        </Link>
                      ) : (
                        source.name
                      )}
                    </div>
                    <div className={styles.rowMeta}>
                      {t(`feed:mute.kind.${source.sourceKind}`)} ·{" "}
                      {t("feed:mute.mutedOn", {
                        date: fmt.date(new Date(source.mutedAt)),
                      })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      unmute({
                        sourceKind: source.sourceKind,
                        sourceId: source.sourceId,
                        name: source.name,
                      })
                    }
                  >
                    {t("feed:mute.unmute")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
