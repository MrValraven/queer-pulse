import { useState, type ReactNode } from "react";
import { FiChevronDown, FiLock } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import type { VouchEdge, VouchPerson } from "./trustGraph/trustGraphModel";
import type { VouchMode } from "./vouchGraph.types";
import styles from "./vouchGraphFooter.module.css";

interface VouchGraphLegendProps {
  mode: VouchMode;
  visIds: string[];
  visEdges: VouchEdge[];
  /** Phones: the legend folds behind a "Legend" toggle. */
  isFoldable?: boolean;
}

interface LegendItem {
  key: string;
  label: string;
  swatch: ReactNode;
  isPresent: boolean;
}

function dot(color: string) {
  return <span className={styles.legDot} style={{ background: color }} />;
}

function safetyItems(
  people: VouchPerson[],
  isIsolated: (id: string) => boolean,
  visEdges: VouchEdge[],
  t: (key: string) => string,
): LegendItem[] {
  return [
    {
      key: "ring",
      label: t("admin:vouchGraph.legend.safety.ring"),
      swatch: dot("var(--danger)"),
      isPresent: people.some((person) => person.inRing || person.ringId),
    },
    {
      key: "isolated",
      label: t("admin:vouchGraph.legend.safety.isolated"),
      swatch: dot("var(--amber)"),
      isPresent: people.some((person) => isIsolated(person.id)),
    },
    {
      key: "reported",
      label: t("admin:vouchGraph.legend.safety.reported"),
      swatch: dot("var(--accent-ink)"),
      isPresent: people.some((person) => (person.reports ?? 0) > 0),
    },
    {
      key: "withdrawn",
      label: t("admin:vouchGraph.legend.safety.withdrawn"),
      swatch: <span className={styles.legDash} />,
      isPresent: visEdges.some((edge) => edge.withdrawn),
    },
  ];
}

function plainItems(
  people: VouchPerson[],
  visEdges: VouchEdge[],
  t: (key: string) => string,
): LegendItem[] {
  const candidates: LegendItem[] = [
    {
      key: "trusted",
      label: t("admin:vouchGraph.legend.plain.trusted"),
      swatch: dot("var(--jade)"),
      isPresent: people.some((person) => person.standing === "trusted"),
    },
    {
      key: "verified",
      label: t("admin:vouchGraph.legend.plain.verified"),
      swatch: <span className={styles.legRing} />,
      isPresent: people.some((person) => person.verified),
    },
    {
      key: "mutual",
      label: t("admin:vouchGraph.legend.plain.mutual"),
      swatch: <span className={styles.legBond} />,
      isPresent: visEdges.some((edge) => edge.mutual && !edge.withdrawn),
    },
    {
      key: "invited",
      label: t("admin:vouchGraph.legend.plain.invited"),
      swatch: <span className={styles.legLineInvite} />,
      isPresent: visEdges.some(
        (edge) => edge.kind === "invite" && !edge.withdrawn,
      ),
    },
    {
      key: "vouched",
      label: t("admin:vouchGraph.legend.plain.vouched"),
      swatch: <span className={styles.legLineVouch} />,
      isPresent: visEdges.some(
        (edge) => edge.kind !== "invite" && !edge.withdrawn,
      ),
    },
    {
      key: "withdrawn",
      label: t("admin:vouchGraph.legend.plain.withdrawn"),
      swatch: <span className={styles.legLineWithdrawn} />,
      isPresent: visEdges.some((edge) => edge.withdrawn),
    },
    {
      key: "anonymous",
      label: t("admin:vouchGraph.legend.plain.anonymous"),
      swatch: <span className={styles.legHatch} />,
      isPresent: visEdges.some((edge) => edge.anonymous),
    },
    {
      key: "private",
      label: t("admin:vouchGraph.legend.plain.private"),
      swatch: <FiLock aria-hidden />,
      isPresent: people.some((person) => person.private),
    },
  ];
  return candidates;
}

/** D4: shows only what is present in view. Null in invites mode and when
 *  nothing qualifies. */
export function VouchGraphLegend({
  mode,
  visIds,
  visEdges,
  isFoldable = false,
}: VouchGraphLegendProps) {
  const { t } = useTranslation();
  const [isFolded, setIsFolded] = useState(true);
  const graph = useTrustGraph();
  if (mode === "invites") return null;

  const people = visIds.flatMap((personId) => {
    const person = graph.peopleById[personId];
    return person ? [person] : [];
  });

  let items: LegendItem[];
  if (mode === "clusters") {
    const visibleSceneIds = new Set(people.map((person) => person.sceneId));
    items = graph.scenes.map((scene) => ({
      key: scene.id,
      label: scene.label,
      swatch: dot(scene.color),
      isPresent: visibleSceneIds.has(scene.id),
    }));
  } else if (mode === "safety") {
    items = safetyItems(
      people,
      (personId) => graph.isIsolated(personId),
      visEdges,
      t,
    );
  } else {
    items = plainItems(people, visEdges, t);
  }
  const isShown = items.some((item) => item.isPresent);

  const isListOpen = !isFoldable || !isFolded;
  const list = (
    <Collapse isOpen={isListOpen} className={styles.legendCollapse}>
      <div className={styles.legend} id="vouch-graph-legend-list">
        {items.map((item) => (
          <span
            key={item.key}
            className={`${styles.leg} ${item.isPresent ? "" : styles.legHidden}`}
            aria-hidden={item.isPresent ? undefined : true}
          >
            {item.swatch}
            {item.label}
          </span>
        ))}
      </div>
    </Collapse>
  );

  return (
    <Collapse isOpen={isShown} className={styles.legendCollapse}>
      {isFoldable && (
        <button
          type="button"
          className={styles.legendToggle}
          aria-expanded={!isFolded}
          aria-controls="vouch-graph-legend-list"
          onClick={() => setIsFolded((wasFolded) => !wasFolded)}
        >
          {t("admin:vouchGraph.modal.legendToggle")}
          <FiChevronDown
            aria-hidden
            className={`${styles.legendChevron} ${isFolded ? "" : styles.legendChevronOpen}`}
          />
        </button>
      )}
      {list}
    </Collapse>
  );
}
