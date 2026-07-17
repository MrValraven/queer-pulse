import { FiInbox, FiSend, FiSlash } from "react-icons/fi";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ConnectionsGridSkeleton } from "./ConnectionsSkeleton";
import {
  BlockedCard,
  IncomingCard,
  SentCard,
  VouchedCard,
} from "./ConnectionCards";
import type { ConnectionView } from "./connections.data";
import styles from "./ConnectionsPage.module.css";

const stagger = (i: number) => Math.min(i, 8) * 60;

export function IncomingPanel({
  loading,
  views,
  onAccept,
  onDecline,
}: {
  loading: boolean;
  views: ConnectionView[];
  onAccept: (v: ConnectionView) => void;
  onDecline: (v: ConnectionView) => void;
}) {
  const { t } = useTranslation();
  if (loading) return <ConnectionsGridSkeleton count={4} />;
  return (
    <div className={styles.grid}>
      {views.map((v, i) => (
        <FadeIn key={v.slug} delay={stagger(i)}>
          <IncomingCard
            view={v}
            onAccept={() => onAccept(v)}
            onDecline={() => onDecline(v)}
          />
        </FadeIn>
      ))}
      {views.length === 0 && (
        <EmptyState
          compact
          icon={<FiInbox />}
          title={t("connect:panels.requestsEmptyTitle")}
          description={t("connect:panels.incomingEmptyDescription")}
          action={{
            label: t("connect:allTab.findMembers"),
            to: routes.members,
          }}
        />
      )}
    </div>
  );
}

export function SentPanel({
  loading,
  views,
  onWithdraw,
}: {
  loading: boolean;
  views: ConnectionView[];
  onWithdraw: (v: ConnectionView) => void;
}) {
  const { t } = useTranslation();
  if (loading) return <ConnectionsGridSkeleton count={4} />;
  return (
    <div className={styles.grid}>
      {views.map((v, i) => (
        <FadeIn key={v.slug} delay={stagger(i)}>
          <SentCard view={v} onWithdraw={() => onWithdraw(v)} />
        </FadeIn>
      ))}
      {views.length === 0 && (
        <EmptyState
          compact
          icon={<FiSend />}
          title={t("connect:panels.requestsEmptyTitle")}
          description={t("connect:panels.sentEmptyDescription")}
          action={{
            label: t("connect:allTab.findMembers"),
            to: routes.members,
          }}
        />
      )}
    </div>
  );
}

export function BlockedPanel({
  loading,
  views,
  onUnblock,
}: {
  loading: boolean;
  views: ConnectionView[];
  onUnblock: (v: ConnectionView) => void;
}) {
  const { t } = useTranslation();
  if (loading) return <ConnectionsGridSkeleton count={2} />;
  return (
    <div className={styles.grid}>
      {views.map((v, i) => (
        <FadeIn key={v.slug} delay={stagger(i)}>
          <BlockedCard view={v} onUnblock={() => onUnblock(v)} />
        </FadeIn>
      ))}
      {views.length === 0 && (
        <EmptyState
          compact
          icon={<FiSlash />}
          title={t("connect:panels.blockedEmptyTitle")}
          description={t("connect:panels.blockedEmptyDescription")}
        />
      )}
    </div>
  );
}

export function VouchedPanel({
  loading,
  views,
  noteFor,
}: {
  loading: boolean;
  views: ConnectionView[];
  noteFor: (v: ConnectionView) => string;
}) {
  return (
    <>
      <p className={styles.paneIntro}>
        <Translation
          i18nKey="connect:panelIntro.vouched"
          components={{ em: <em /> }}
        />
      </p>
      {loading ? (
        <ConnectionsGridSkeleton count={4} />
      ) : (
        <div className={styles.grid}>
          {views.map((v, i) => (
            <FadeIn key={v.slug} delay={stagger(i)}>
              <VouchedCard view={v} note={noteFor(v)} />
            </FadeIn>
          ))}
        </div>
      )}
    </>
  );
}
