import { Fragment, useEffect } from "react";
import { FiLock, FiPlay, FiSearch, FiX } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { VouchGraphCanvas } from "./VouchGraphCanvas";
import { VouchGraphInspector } from "./VouchGraphInspector";
import { useVouchGraph, type VouchMode } from "./useVouchGraph";
import {
  SCENES,
  T_MAX,
  T_MIN,
  monthDateFromValue,
  personById,
  shortestPath,
} from "./adminVouchGraph.data";
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
  if (!pathA) return null;
  let content;
  if (pathA && pathB) {
    const path = shortestPath(pathA, pathB);
    content = path ? (
      <span>
        <b>{t("admin:vouchGraph.pathbar.stepPath", { count: path.length })}</b>{" "}
        {path.map((id) => personById[id]!.initials).join(" → ")}
      </span>
    ) : (
      <span>
        {t("admin:vouchGraph.pathbar.noPath", {
          a: personById[pathA]!.initials,
          b: personById[pathB]!.initials,
        })}
      </span>
    );
  } else {
    content = (
      <span>
        {t("admin:vouchGraph.pathbar.fromHint", {
          name: personById[pathA]!.initials,
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
  if (mode === "clusters") {
    return (
      <div className={styles.legend}>
        {Object.values(SCENES).map((s) => (
          <span key={s.label ?? s.labelKey} className={styles.leg}>
            <span className={styles.legDot} style={{ background: s.color }} />
            {s.labelKey ? t(s.labelKey) : s.label}
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
        <span className={styles.legHatch} />
        {t("admin:vouchGraph.legend.plain.anonymous")}
      </span>
      <span className={styles.leg}>
        <FiLock aria-hidden /> {t("admin:vouchGraph.legend.plain.private")}
      </span>
    </div>
  );
}

export function AdminVouchGraphModal({
  focusId,
  onClose,
}: {
  focusId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  useScrollLock();
  const { showToast } = useToast();
  const g = useVouchGraph(focusId);
  const focusPerson = personById[g.focus]!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
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
                  {personById[id]!.initials}
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
            expanded={g.sel ? g.expanded.has(g.sel) : false}
            onGo={g.select}
            onVerify={() =>
              showToast(t("admin:vouchGraph.modal.verifyToast"), "success")
            }
            onExpand={g.toggleExpand}
            onCite={() =>
              showToast(t("admin:vouchGraph.modal.citeToast"), "success")
            }
          />
        </div>

        <footer className={styles.bottom}>
          <Legend mode={g.mode} />
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
              min={T_MIN}
              max={T_MAX}
              value={g.timeCut}
              onChange={(e) => g.setTime(Number(e.target.value))}
              aria-label={t("admin:vouchGraph.modal.timeCutAriaLabel")}
            />
            <span className={styles.timeLbl}>
              {fmt.date(monthDateFromValue(g.timeCut), {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
