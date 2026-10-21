import { useMemo } from "react";
import { FiInbox } from "react-icons/fi";
import { ImageSlot, FadeIn, EmptyState } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { buildSubs, TABS, type Sub } from "./studioTriage.data";
import { triageSubmissionKeyOf } from "./StudioTriageDetail.data";
import s from "./council.module.css";

/** A press, Enter and Space pick a row, through native listeners (the row
 *  is a `role="button"` block, since its rich content cannot sit in a
 *  button). A callback ref, so the listeners follow the row's lifetime. */
function pickHandlerRef(onPick: () => void) {
  return (row: HTMLDivElement | null) => {
    if (!row) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target !== row) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      onPick();
    };
    const onClick = () => onPick();
    row.addEventListener("keydown", onKeyDown);
    row.addEventListener("click", onClick);
    return () => {
      row.removeEventListener("keydown", onKeyDown);
      row.removeEventListener("click", onClick);
    };
  };
}

function SubmissionRowSkeleton() {
  return (
    <div className={s.subRow}>
      <div className={s.subTop}>
        <span className={s.skel} style={{ width: 48, height: 48 }} />
        <div>
          <div className={s.skel} style={{ width: "60%", height: 17 }} />
          <div
            className={s.skel}
            style={{ width: "40%", height: 12, marginTop: 8 }}
          />
          <div
            className={s.skel}
            style={{ width: 120, height: 16, marginTop: 10, borderRadius: 999 }}
          />
        </div>
        <div className={s.skel} style={{ width: 40, height: 28 }} />
      </div>
      <div
        className={s.skel}
        style={{ width: "85%", height: 13, marginTop: 14 }}
      />
    </div>
  );
}

/** The submissions in the open queue. Picking a row shows it in the detail
 *  beside the list (`detailId`). */
export function StudioTriageList({
  tab,
  submissions,
  selectedKey,
  detailId,
  onSelect,
  onBackToNew,
}: {
  tab: string;
  submissions?: Sub[];
  selectedKey?: string;
  detailId?: string;
  onSelect?: (submissionKey: string) => void;
  onBackToNew: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const loading = useSimulatedLoad();

  const builtSubs = useMemo(() => buildSubs(t, fmt), [t, fmt]);
  const allSubs = submissions ?? builtSubs;

  const subs = useMemo(() => {
    switch (tab) {
      case "yours":
        return allSubs.filter((sub) =>
          sub.badges.some((badge) => badge.cls === "claimed"),
        );
      case "atDeadline":
        return allSubs.filter((sub) => sub.of && sub.day >= 11);
      case "shortlisted":
      case "answered":
        return [];
      default:
        return allSubs;
    }
  }, [tab, allSubs]);

  const activeTab = TABS.find((tabOption) => tabOption.id === tab) ?? TABS[0]!;

  return (
    <section className={s.subList}>
      {loading ? (
        Array.from({ length: allSubs.length }).map((_, skeletonIndex) => (
          <SubmissionRowSkeleton key={skeletonIndex} />
        ))
      ) : subs.length === 0 ? (
        <EmptyState
          compact
          icon={<FiInbox />}
          title={t("studio:triage.list.empty.title")}
          description={
            <Translation
              i18nKey="studio:triage.list.empty.description"
              components={{ em: <em /> }}
              values={{ queue: t(activeTab.queueKey) }}
            />
          }
          action={{
            label: t("studio:triage.list.backToNewCta"),
            onClick: onBackToNew,
          }}
        />
      ) : (
        subs.map((sub, subIndex) => {
          const submissionKey = triageSubmissionKeyOf(sub);
          const isActive = selectedKey === submissionKey;
          return (
            <FadeIn key={submissionKey} delay={Math.min(subIndex, 8) * 30}>
              <div
                className={[s.subRow, isActive && s.subRowActive]
                  .filter(Boolean)
                  .join(" ")}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-controls={detailId}
                ref={pickHandlerRef(() => onSelect?.(submissionKey))}
              >
                <div className={s.subTop}>
                  <span className={s.srCov}>
                    <ImageSlot
                      src={sub.image}
                      tint={sub.tint}
                      width={48}
                      height={48}
                      radius={8}
                      placeholder=""
                    />
                  </span>
                  <div>
                    <h3>
                      {sub.titlePre}
                      {sub.titleEm && <em>{sub.titleEm}</em>}
                    </h3>
                    <div className={s.subWho}>{sub.who}</div>
                    <div className={s.badges}>
                      {sub.badges.map((badge) => (
                        <span
                          key={badge.label}
                          className={
                            badge.cls === "first"
                              ? s.first
                              : badge.cls === "claimed"
                                ? s.claimed
                                : undefined
                          }
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={s.deadline}>
                    <b>
                      {t("studioShowcase:triage.sub.day", { day: sub.day })}
                    </b>
                    {sub.of && t("studio:triage.list.dayOfTotal")}
                  </div>
                </div>
                <div className={s.subNote}>{sub.note}</div>
                <div className={s.metaStrip}>
                  {sub.meta.map((metaItem, metaIndex) => (
                    <span key={metaIndex}>{metaItem}</span>
                  ))}
                </div>
              </div>
            </FadeIn>
          );
        })
      )}
    </section>
  );
}
