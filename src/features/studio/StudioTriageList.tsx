import { useMemo, useState } from "react";
import { FiInbox } from "react-icons/fi";
import { ImageSlot, FadeIn, EmptyState } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SUBS, TABS } from "./studioTriage.data";
import s from "./council.module.css";

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

export function StudioTriageList({
  tab,
  onBackToNew,
}: {
  tab: string;
  onBackToNew: () => void;
}) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const loading = useSimulatedLoad();

  const subs = useMemo(() => {
    switch (tab) {
      case "yours":
        return SUBS.filter((sub) =>
          sub.badges.some((badge) => badge.cls === "claimed"),
        );
      case "atDeadline":
        return SUBS.filter((sub) => {
          const day = parseInt(sub.day.replace(/\D/g, ""), 10);
          return sub.of && day >= 11;
        });
      case "shortlisted":
      case "answered":
        return [];
      default:
        return SUBS;
    }
  }, [tab]);

  const activeTab = TABS.find((tabOption) => tabOption.id === tab) ?? TABS[0]!;

  return (
    <section className={s.subList}>
      {loading ? (
        Array.from({ length: SUBS.length }).map((_, skeletonIndex) => (
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
        subs.map((sub, subIndex) => (
          <FadeIn
            key={`${sub.titlePre}${sub.titleEm ?? ""}`}
            delay={Math.min(subIndex, 8) * 60}
          >
            <div
              className={[s.subRow, active === subIndex && s.subRowActive]
                .filter(Boolean)
                .join(" ")}
              role="button"
              tabIndex={0}
              onClick={() => setActive(subIndex)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActive(subIndex);
                }
              }}
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
                  <b>{sub.day}</b>
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
        ))
      )}
    </section>
  );
}
