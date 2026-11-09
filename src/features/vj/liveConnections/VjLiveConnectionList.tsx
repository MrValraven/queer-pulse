import { AnimatePresence } from "motion/react";
import { FiMonitor, FiSmartphone } from "react-icons/fi";
import type {
  VjLiveConnectionDTO,
  VjLiveStageDTO,
} from "../../../shared/contracts/vj";
import { Badge, Button, CollapseListItem } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { relativeAgo } from "../../../shared/lib/relativeAgo";
import styles from "./VjLiveConnections.module.css";

const CONNECTED_AGO_KEYS = {
  justNow: "vj:live.justNow",
  unknown: "vj:live.timeUnknown",
};

interface VjLiveConnectionRowProps {
  connection: VjLiveConnectionDTO;
  /** When the list was last read; each "Connected" time counts from it. */
  now: number;
  /** This row's own stop is on its way. */
  isStopping: boolean;
  /** Some stop is on its way, so every row action waits for it. */
  isActionLocked: boolean;
  onDisconnect: (connectionId: string) => void;
}

interface VjLiveScreenFact {
  label: string;
  /** A fact worth a second look, such as a screen left in a window. */
  isWarning: boolean;
}

/** The short facts a screen reported: its renderer and whether it fills the display. */
function useScreenFacts(connection: VjLiveConnectionDTO): VjLiveScreenFact[] {
  const { t } = useTranslation();
  const facts: VjLiveScreenFact[] = [];
  if (connection.renderer === "webgl2") {
    facts.push({ label: t("vj:live.rendererWebgl"), isWarning: false });
  } else if (connection.renderer === "dom") {
    facts.push({ label: t("vj:live.rendererDom"), isWarning: false });
  } else if (connection.renderer === "simple") {
    facts.push({ label: t("vj:live.rendererSimple"), isWarning: false });
  }
  if (connection.isFullscreen === true) {
    facts.push({ label: t("vj:live.fullscreen"), isWarning: false });
  } else if (connection.isFullscreen === false) {
    facts.push({ label: t("vj:live.windowed"), isWarning: true });
  }
  return facts;
}

/** "Screen 2", or a plain "Screen" while the number is unknown; "Remote". */
function useConnectionName(connection: VjLiveConnectionDTO): string {
  const { t } = useTranslation();
  if (connection.role !== "screen") return t("vj:live.remoteName");
  return connection.screenNumber === null
    ? t("vj:live.screenNameUnknown")
    : t("vj:live.screenName", { number: connection.screenNumber });
}

/** One screen or remote: what it is, since when, and a way to disconnect it. */
function VjLiveConnectionRow({
  connection,
  now,
  isStopping,
  isActionLocked,
  onDisconnect,
}: VjLiveConnectionRowProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const screenFacts = useScreenFacts(connection);
  const connectionName = useConnectionName(connection);
  const isScreen = connection.role === "screen";
  const Icon = isScreen ? FiMonitor : FiSmartphone;
  const connectedLine = t("vj:live.connectedSince", {
    time: relativeAgo(
      connection.connectedAt,
      t,
      formatters,
      CONNECTED_AGO_KEYS,
      now,
    ),
  });

  return (
    <div className={styles.row}>
      <span className={styles.rowIcon} aria-hidden="true">
        <Icon focusable="false" fill="none" />
      </span>
      <div className={styles.rowText}>
        <p className={styles.rowTitle}>
          {connectionName}
          {connection.isLead ? (
            <Badge tone="jade">{t("vj:live.lead")}</Badge>
          ) : null}
        </p>
        <p className={styles.rowFacts}>
          <span className={styles.rowFact}>{connectedLine}</span>
          {screenFacts.map((fact) => (
            <span
              key={fact.label}
              className={
                fact.isWarning
                  ? `${styles.rowFact} ${styles.rowFactWarning}`
                  : styles.rowFact
              }
            >
              {fact.label}
            </span>
          ))}
        </p>
      </div>
      <span className={styles.rowAction}>
        <Button
          variant="quiet"
          size="sm"
          data-vj-live-disconnect={connection.connectionId}
          aria-disabled={isActionLocked || undefined}
          aria-busy={isStopping || undefined}
          onClick={() => {
            if (!isActionLocked) onDisconnect(connection.connectionId);
          }}
        >
          {isScreen
            ? t("vj:live.disconnectScreen")
            : t("vj:live.disconnectRemote")}
        </Button>
      </span>
    </div>
  );
}

/** A group heading names whose show it is: only shown when it tells the
 *  viewer something (more than one show, or a show that is not theirs). */
function useGroupTitle(
  stage: VjLiveStageDTO,
  isTitled: boolean,
): string | null {
  const { t } = useTranslation();
  if (!isTitled) return null;
  if (stage.isOwnStage) return t("vj:live.yourShow");
  // An owner whose profile is gone comes back with an empty name.
  const name = stage.owner.displayName.trim();
  return name === ""
    ? t("vj:live.otherOperatorShow")
    : t("vj:live.operatorShow", { name });
}

function VjLiveStageGroup({
  stage,
  now,
  isTitled,
  stoppingConnectionId,
  onDisconnect,
}: {
  stage: VjLiveStageDTO;
  now: number;
  isTitled: boolean;
  stoppingConnectionId: string | null;
  onDisconnect: (connectionId: string) => void;
}) {
  const title = useGroupTitle(stage, isTitled);
  const headingId = `vj-live-stage-${stage.owner.userId}`;
  return (
    <section aria-labelledby={title === null ? undefined : headingId}>
      {title === null ? null : (
        <h3 id={headingId} className={styles.groupTitle}>
          {title}
        </h3>
      )}
      <ul className={styles.list}>
        <AnimatePresence initial={false}>
          {stage.connections.map((connection) => (
            <CollapseListItem key={connection.connectionId}>
              <VjLiveConnectionRow
                connection={connection}
                now={now}
                isStopping={stoppingConnectionId === connection.connectionId}
                isActionLocked={stoppingConnectionId !== null}
                onDisconnect={onDisconnect}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

/** Every connected screen and remote, grouped by show. While a stop is on
 *  its way (`stoppingConnectionId` set), every row action waits for it. */
export function VjLiveConnectionList({
  stages,
  now,
  stoppingConnectionId,
  onDisconnect,
}: {
  stages: VjLiveStageDTO[];
  now: number;
  stoppingConnectionId: string | null;
  onDisconnect: (connectionId: string) => void;
}) {
  const firstStage = stages[0];
  const isTitled =
    stages.length > 1 || (firstStage !== undefined && !firstStage.isOwnStage);
  return (
    <ul className={styles.groups}>
      <AnimatePresence initial={false}>
        {stages.map((stage) => (
          <CollapseListItem key={stage.owner.userId}>
            <VjLiveStageGroup
              stage={stage}
              now={now}
              isTitled={isTitled}
              stoppingConnectionId={stoppingConnectionId}
              onDisconnect={onDisconnect}
            />
          </CollapseListItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}
