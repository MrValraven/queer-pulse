import { FiLock, FiUser, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { AvatarTone } from "./ui";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import {
  TONE,
  monthDate,
  relationshipLabel,
  type VouchEdge,
} from "./trustGraph/trustGraphModel";
import styles from "./AdminVouchGraph.module.css";

interface Props {
  sel: string | null;
  /** Edge id of the connection the replay is currently on — its row lights up. */
  activeEdgeId?: string | null;
  expanded: boolean;
  onGo: (id: string) => void;
  onExpand: (id: string) => void;
  /** Real account-level verify action (ADM-9 fix — the former "Use as
   *  verification basis" button fired a success toast and did nothing else).
   *  Wired to the same `POST /admin/members/:id/verify` endpoint
   *  `AdminMemberDrawer`'s Verify button already calls. */
  onVerify: (id: string) => void;
  /** True while a verify mutation for `sel` is in flight — disables the
   *  button so it can't be double-clicked. */
  verifying: boolean;
  /** Real navigation to the moderation queue for this subject, pre-filtered
   *  to their reports (ADM-8 deep-link; also replaces the former "Cite in
   *  audit log" button, which fired a success toast and did nothing else). */
  onOpenModeration: (id: string) => void;
  /** Deselect the node — dismisses the mobile bottom sheet. */
  onCloseSheet: () => void;
}

function VAvatar({
  initials,
  tone,
  className,
}: {
  initials: string;
  tone: AvatarTone;
  className: string;
}) {
  const ink = TONE[tone];
  return (
    <span
      className={className}
      style={{ background: ink.fill, color: ink.stroke }}
    >
      {initials}
    </span>
  );
}

function Banner({
  kind,
  title,
  body,
}: {
  kind: string;
  title: string;
  body: string;
}) {
  return (
    <div className={`${styles.flag} ${styles[`flag_${kind}`]}`}>
      <b>{title}</b>
      <span>{body}</span>
    </div>
  );
}

function VouchList({
  title,
  edges,
  selId,
  activeEdgeId,
  onGo,
}: {
  title: string;
  edges: VouchEdge[];
  selId: string;
  activeEdgeId?: string | null;
  onGo: (id: string) => void;
}) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  return (
    <div className={styles.insSec}>
      <div className={styles.insT}>{title}</div>
      {edges.length === 0 ? (
        <div className={styles.insNone}>
          {t("admin:vouchGraph.inspector.none")}
        </div>
      ) : (
        edges.map((e) => {
          const otherId = e.from === selId ? e.to : e.from;
          const o = graph.peopleById[otherId]!;
          return (
            <button
              key={e.id}
              type="button"
              className={`${styles.insRow}${e.withdrawn ? ` ${styles.insRowWd}` : ""}${e.id === activeEdgeId ? ` ${styles.insRowActive}` : ""}`}
              onClick={() => onGo(otherId)}
            >
              <VAvatar
                initials={o.initials}
                tone={o.tone}
                className={styles.mini!}
              />
              <span className={styles.insRowTx}>
                <span className={styles.rn}>
                  {o.name}
                  {e.mutual && (
                    <span className={styles.mut}>
                      {t("admin:vouchGraph.inspector.mutualTag")}
                    </span>
                  )}
                  {e.kind && (
                    <span className={styles.tag}>
                      {t(`admin:vouchGraph.edgeKind.${e.kind}`)}
                    </span>
                  )}
                  {e.relationship && (
                    <span className={styles.tag}>
                      {relationshipLabel(t, e.relationship)}
                    </span>
                  )}
                </span>
                {e.reason && <span className={styles.rr}>“{e.reason}”</span>}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}

export function VouchGraphInspector({
  sel,
  activeEdgeId,
  expanded,
  onGo,
  onExpand,
  onVerify,
  verifying,
  onOpenModeration,
  onCloseSheet,
}: Props) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const graph = useTrustGraph();

  if (!sel) {
    return (
      <aside className={styles.inspector} data-state="empty">
        <div className={styles.insEmpty}>
          <span className={styles.insEmptyIc}>
            <FiUser aria-hidden />
          </span>
          <h4>{t("admin:vouchGraph.inspector.emptyTitle")}</h4>
          <p>{t("admin:vouchGraph.inspector.emptyBody")}</p>
        </div>
      </aside>
    );
  }

  const p = graph.peopleById[sel]!;
  const first = p.name.split(" ")[0];
  const vouchedBy = graph.edges.filter((e) => e.to === sel && !e.withdrawn);
  const vouchedFor = graph.edges.filter((e) => e.from === sel && !e.withdrawn);
  const withdrawn = graph.edges.filter(
    (e) => (e.to === sel || e.from === sel) && e.withdrawn,
  );
  const iso = graph.isIsolated(sel);
  const pendingAffected = vouchedFor.some(
    (e) => graph.peopleById[e.to]!.standing === "new",
  );

  return (
    <aside className={styles.inspector} data-state="open">
      <button
        type="button"
        className={styles.insGrab}
        onClick={onCloseSheet}
        aria-label={t("admin:common.close")}
      />
      <button
        type="button"
        className={styles.insSheetClose}
        onClick={onCloseSheet}
        aria-label={t("admin:common.close")}
      >
        <FiX aria-hidden />
      </button>
      <div className={styles.insHead}>
        <VAvatar
          initials={p.initials}
          tone={p.tone}
          className={styles.insAv!}
        />
        <div>
          <div className={styles.insN}>{p.name}</div>
          <div className={styles.insP}>
            <span className={styles.pron}>{p.pronoun}</span> · {p.role}
          </div>
        </div>
      </div>

      <div className={styles.sealed}>
        <FiLock aria-hidden /> {t("admin:vouchGraph.inspector.sealed")}
      </div>

      {p.standing === "flagged" && (
        <Banner
          kind="danger"
          title={t("admin:vouchGraph.inspector.ringBanner.title")}
          body={t("admin:vouchGraph.inspector.ringBanner.body")}
        />
      )}
      {iso && (
        <Banner
          kind="amber"
          title={t("admin:vouchGraph.inspector.isolationBanner.title")}
          body={t("admin:vouchGraph.inspector.isolationBanner.body")}
        />
      )}
      {!!p.reports && (
        <Banner
          kind="coral"
          title={t("admin:vouchGraph.inspector.reportsBanner.title", {
            count: p.reports,
          })}
          body={t("admin:vouchGraph.inspector.reportsBanner.body")}
        />
      )}
      {p.private && (
        <Banner
          kind="plum"
          title={t("admin:vouchGraph.inspector.privateBanner.title")}
          body={t("admin:vouchGraph.inspector.privateBanner.body")}
        />
      )}

      <div className={styles.insStats}>
        <div className={styles.stat}>
          <div className={styles.statV}>{vouchedBy.length}</div>
          <div className={styles.statL}>
            {t("admin:vouchGraph.inspector.vouchesIn")}
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statV}>{vouchedFor.length}</div>
          <div className={styles.statL}>
            {t("admin:vouchGraph.inspector.vouchesOut")}
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statV}>
            {fmt.date(monthDate(p.joined), { month: "short", year: "numeric" })}
          </div>
          <div className={styles.statL}>
            {t("admin:vouchGraph.inspector.joined")}
          </div>
        </div>
      </div>

      <VouchList
        title={t("admin:vouchGraph.inspector.vouchedForBy")}
        edges={vouchedBy}
        selId={sel}
        activeEdgeId={activeEdgeId}
        onGo={onGo}
      />
      <VouchList
        title={t("admin:vouchGraph.inspector.hasVouchedFor")}
        edges={vouchedFor}
        selId={sel}
        activeEdgeId={activeEdgeId}
        onGo={onGo}
      />
      {withdrawn.length > 0 && (
        <VouchList
          title={t("admin:vouchGraph.inspector.withdrawn")}
          edges={withdrawn}
          selId={sel}
          activeEdgeId={activeEdgeId}
          onGo={onGo}
        />
      )}

      {!p.private && (
        <div className={styles.affected}>
          <div className={styles.insT}>
            {t("admin:vouchGraph.inspector.affectedTitle", { name: first })}
          </div>
          <p>
            {t("admin:vouchGraph.inspector.affectedCount", {
              count: vouchedFor.length,
            })}
            {pendingAffected &&
              t("admin:vouchGraph.inspector.affectedPendingNote")}{" "}
            {t("admin:vouchGraph.inspector.ownVouchesStay", {
              count: vouchedBy.length,
            })}
          </p>
        </div>
      )}

      <div className={styles.insActions}>
        {!p.private && (
          <Button
            variant="jade"
            size="md"
            disabled={p.verified || verifying}
            onClick={() => onVerify(sel)}
          >
            {p.verified
              ? t("admin:vouchGraph.inspector.verifiedCta")
              : t("admin:vouchGraph.inspector.useAsVerificationCta")}
          </Button>
        )}
        <Button variant="ghost" size="md" onClick={() => onExpand(sel)}>
          {expanded
            ? t("admin:vouchGraph.inspector.collapseCta")
            : t("admin:vouchGraph.inspector.expandCta")}
        </Button>
        <Button variant="ghost" size="md" onClick={() => onOpenModeration(sel)}>
          {t("common:cta.openModerationQueue")}
        </Button>
      </div>
    </aside>
  );
}
