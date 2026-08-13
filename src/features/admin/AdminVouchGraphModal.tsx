import { Fragment, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiLock, FiPlay, FiSearch, FiUser, FiX } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks";
import { SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { VouchGraphCanvas } from "./VouchGraphCanvas";
import { VouchGraphInspector } from "./VouchGraphInspector";
import { useVouchGraph, type VouchMode } from "./useVouchGraph";
import { useTrustNetwork } from "./api/useTrustNetwork";
import { TrustGraphProvider } from "./trustGraph/TrustGraphContext";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { monthDate } from "./trustGraph/trustGraphModel";
import styles from "./AdminVouchGraph.module.css";

/** `admin:vouchGraph.modes.*` catalog keys, resolved with `t()`. */
const MODE_KEYS: { key: VouchMode; labelKey: string }[] = [
  { key: "plain", labelKey: "vouchGraph.modes.network" },
  { key: "clusters", labelKey: "vouchGraph.modes.scenes" },
  { key: "safety", labelKey: "vouchGraph.modes.safety" },
];

function PathBar({
  pathA,
  pathB,
  onClear,
}: {
  pathA: string | null;
  pathB: string | null;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  if (!pathA) return null;
  let content;
  if (pathA && pathB) {
    const path = graph.shortestPath(pathA, pathB);
    content = path ? (
      <span>
        <b>{t("admin:vouchGraph.pathbar.stepPath", { count: path.length })}</b>{" "}
        {path.map((id) => graph.peopleById[id]!.initials).join(" → ")}
      </span>
    ) : (
      <span>
        {t("admin:vouchGraph.pathbar.noPath", {
          a: graph.peopleById[pathA]!.initials,
          b: graph.peopleById[pathB]!.initials,
        })}
      </span>
    );
  } else {
    content = (
      <span>
        {t("admin:vouchGraph.pathbar.fromHint", {
          name: graph.peopleById[pathA]!.initials,
        })}
      </span>
    );
  }
  return (
    <div className={styles.pathbar}>
      {content}
      <button type="button" onClick={onClear}>
        {t("admin:vouchGraph.pathbar.clear")}
      </button>
    </div>
  );
}

function Legend({ mode }: { mode: VouchMode }) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  if (mode === "clusters") {
    return (
      <div className={styles.legend}>
        {graph.scenes.map((s) => (
          <span key={s.id} className={styles.leg}>
            <span className={styles.legDot} style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    );
  }
  if (mode === "safety") {
    return (
      <div className={styles.legend}>
        <span className={styles.leg}>
          <span
            className={styles.legDot}
            style={{ background: "var(--danger)" }}
          />
          {t("admin:vouchGraph.legend.safety.ring")}
        </span>
        <span className={styles.leg}>
          <span
            className={styles.legDot}
            style={{ background: "var(--amber)" }}
          />
          {t("admin:vouchGraph.legend.safety.isolated")}
        </span>
        <span className={styles.leg}>
          <span
            className={styles.legDot}
            style={{ background: "var(--accent-ink)" }}
          />
          {t("admin:vouchGraph.legend.safety.reported")}
        </span>
        <span className={styles.leg}>
          <span className={styles.legDash} />
          {t("admin:vouchGraph.legend.safety.withdrawn")}
        </span>
      </div>
    );
  }
  return (
    <div className={styles.legend}>
      <span className={styles.leg}>
        <span className={styles.legDot} style={{ background: "var(--jade)" }} />
        {t("admin:vouchGraph.legend.plain.trusted")}
      </span>
      <span className={styles.leg}>
        <span className={styles.legRing} />
        {t("admin:vouchGraph.legend.plain.verified")}
      </span>
      <span className={styles.leg}>
        <span className={styles.legBond} />
        {t("admin:vouchGraph.legend.plain.mutual")}
      </span>
      <span className={styles.leg}>
        <span className={styles.legLineInvite} />
        {t("admin:vouchGraph.legend.plain.invited")}
      </span>
      <span className={styles.leg}>
        <span className={styles.legLineVouch} />
        {t("admin:vouchGraph.legend.plain.vouched")}
      </span>
      <span className={styles.leg}>
        <span className={styles.legLineWithdrawn} />
        {t("admin:vouchGraph.legend.plain.withdrawn")}
      </span>
      <span className={styles.leg}>
        <span className={styles.legHatch} />
        {t("admin:vouchGraph.legend.plain.anonymous")}
      </span>
      <span className={styles.leg}>
        <FiLock aria-hidden /> {t("admin:vouchGraph.legend.plain.private")}
      </span>
    </div>
  );
}

/** Thin overlay + close-button chrome shared by the loading/empty states,
 *  before the real graph shell (header/canvas/footer) can be rendered. */
function GraphModalShell({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.shell}
        role="dialog"
        aria-modal="true"
        aria-label={t("admin:vouchGraph.modal.ariaLabel")}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("admin:common.close")}
        >
          <FiX />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function GraphModalInner({
  focusSlug,
  onClose,
}: {
  focusSlug: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const graph = useTrustGraph();
  const g = useVouchGraph(graph, focusSlug);
  const focusPerson = graph.peopleById[g.focus]!;

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.shell}
        role="dialog"
        aria-modal="true"
        aria-label={t("admin:vouchGraph.modal.ariaLabel")}
      >
        <header className={styles.top}>
          <div className={styles.titleBlock}>
            <span className={styles.eyebrow}>
              {t("admin:vouchGraph.modal.eyebrow")}
            </span>
            <div className={styles.h}>
              {focusPerson.name}{" "}
              <span className={styles.pron}>{focusPerson.pronoun}</span>
            </div>
          </div>

          <div className={styles.crumbs}>
            {g.crumbs.map((id, i) => (
              <Fragment key={`${id}-${i}`}>
                <button
                  type="button"
                  className={styles.crumb}
                  onClick={() => g.gotoCrumb(i)}
                >
                  {graph.peopleById[id]!.initials}
                </button>
                <span className={styles.crumbSep}>›</span>
              </Fragment>
            ))}
            <span className={`${styles.crumb} ${styles.crumbCur}`}>
              {focusPerson.initials}
            </span>
          </div>

          <div className={styles.search}>
            <FiSearch aria-hidden />
            <input
              value={g.search}
              onChange={(e) => g.setSearch(e.target.value)}
              placeholder={t("admin:vouchGraph.modal.searchPlaceholder")}
              aria-label={t("admin:vouchGraph.modal.searchAriaLabel")}
            />
          </div>

          <div className={styles.modes}>
            {MODE_KEYS.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`${styles.mode}${g.mode === m.key ? ` ${styles.modeOn}` : ""}`}
                onClick={() => g.changeMode(m.key)}
              >
                {t(`admin:${m.labelKey}`)}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t("admin:common.close")}
          >
            <FiX />
          </button>
        </header>

        <div className={styles.main}>
          <VouchGraphCanvas
            visIds={g.visIds}
            visEdges={g.visEdges}
            focus={g.focus}
            mode={g.mode}
            sel={g.sel}
            pathNodes={g.pathNodes}
            pathEdges={g.pathEdges}
            search={g.search}
            onSelect={g.select}
            onRecenter={g.recenter}
            onPickPath={g.pickPath}
          >
            <PathBar pathA={g.pathA} pathB={g.pathB} onClear={g.clearPath} />
          </VouchGraphCanvas>

          <VouchGraphInspector
            sel={g.sel}
            activeEdgeId={g.timeCut < g.eventCount ? g.activeEdgeId : null}
            expanded={g.sel ? g.expanded.has(g.sel) : false}
            onGo={g.select}
            onVerify={() =>
              showToast(t("admin:vouchGraph.modal.verifyToast"), "success")
            }
            onExpand={g.toggleExpand}
            onCite={() =>
              showToast(t("admin:vouchGraph.modal.citeToast"), "success")
            }
            onCloseSheet={() => g.select(null)}
          />
        </div>

        <footer className={styles.bottom}>
          <Legend mode={g.mode} />
          {graph.truncated && (
            <span className={styles.leg}>
              {t("admin:vouchGraph.modal.truncatedNotice")}
            </span>
          )}
          <div className={styles.timeWrap}>
            <button
              type="button"
              className={styles.replay}
              onClick={g.replay}
              disabled={g.replaying}
            >
              <FiPlay aria-hidden /> {t("admin:vouchGraph.modal.replayCta")}
            </button>
            <input
              type="range"
              min={0}
              max={g.eventCount}
              step={1}
              value={g.timeCut}
              onChange={(e) => g.setTime(Number(e.target.value))}
              aria-label={t("admin:vouchGraph.modal.timeCutAriaLabel")}
              disabled={g.eventCount === 0}
            />
            <span className={styles.timeLbl}>
              {g.currentEvent ? (
                <>
                  <b>{graph.peopleById[g.currentEvent.to]?.name}</b> ·{" "}
                  {t(
                    `admin:vouchGraph.edgeKind.${g.currentEvent.kind ?? "vouch"}`,
                  )}{" "}
                  ·{" "}
                  {fmt.date(monthDate(g.currentEvent.date), {
                    month: "short",
                    year: "numeric",
                  })}
                </>
              ) : (
                t("admin:vouchGraph.modal.replayStart")
              )}
            </span>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

export function AdminVouchGraphModal({
  focusSlug,
  onClose,
}: {
  focusSlug: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  useScrollLock();
  const { data, isLoading } = useTrustNetwork();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (isLoading || !data) {
    return (
      <GraphModalShell onClose={onClose}>
        <div className={styles.insEmpty} aria-busy="true">
          <h4>{t("admin:vouchGraph.modal.loadingTitle")}</h4>
          <SkeletonLine
            height={280}
            style={{ marginTop: 16, borderRadius: 16 }}
          />
        </div>
      </GraphModalShell>
    );
  }

  if (!data.peopleById[focusSlug]) {
    return (
      <GraphModalShell onClose={onClose}>
        <div className={styles.insEmpty}>
          <span className={styles.insEmptyIc}>
            <FiUser aria-hidden />
          </span>
          <h4>{t("admin:vouchGraph.modal.emptyTitle")}</h4>
          <p>{t("admin:vouchGraph.modal.emptyBody")}</p>
        </div>
      </GraphModalShell>
    );
  }

  return (
    <TrustGraphProvider data={data}>
      <GraphModalInner focusSlug={focusSlug} onClose={onClose} />
    </TrustGraphProvider>
  );
}
