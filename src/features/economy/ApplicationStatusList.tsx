import { FiColumns } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AppCardSkeleton } from "./ApplicationStatusSkeleton";
import { AppCard } from "./ApplicationStatusCard";
import type { Application, ActionKind } from "./applicationStatus.data";
import styles from "./ApplicationStatusPage.module.css";

export interface Group {
  id: string;
  title?: string;
  hint?: string;
  muted?: boolean;
  compare?: boolean;
  items: Application[];
}

export function ApplicationStatusList({
  loading,
  groups,
  canCompare,
  onCompare,
  onAction,
}: {
  loading: boolean;
  groups: Group[];
  canCompare: boolean;
  onCompare: () => void;
  onAction: (appId: string, kind: ActionKind) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.list} aria-busy={loading}>
      {loading ? (
        <div className={styles.groupItems}>
          {Array.from({ length: 4 }).map((_, i) => (
            <AppCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.id} className={styles.group}>
            {(g.title || (g.compare && canCompare)) && (
              <div
                className={[styles.groupHead, g.muted && styles.groupHeadMuted]
                  .filter(Boolean)
                  .join(" ")}
              >
                {g.title && (
                  <span className={styles.groupTitle}>{g.title}</span>
                )}
                <span className={styles.groupCount}>{g.items.length}</span>
                {g.hint && <span className={styles.groupHint}>{g.hint}</span>}
                {g.compare && canCompare && (
                  <Button
                    size="md"
                    variant="ghost"
                    className={styles.compareBtn}
                    onClick={onCompare}
                  >
                    <FiColumns
                      size={15}
                      aria-hidden
                      style={{ marginRight: 6 }}
                    />{" "}
                    {t("economy:applicationStatus.compareOffersCta")}
                  </Button>
                )}
              </div>
            )}
            <div className={styles.groupItems}>
              {g.items.map((a, i) => (
                <FadeIn key={a.id} delay={Math.min(i, 8) * 60}>
                  <AppCard
                    app={a}
                    muted={g.muted}
                    onAction={(kind) => onAction(a.id, kind)}
                  />
                </FadeIn>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
