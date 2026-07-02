import { useMemo, useState } from "react";
import { FiInbox } from "react-icons/fi";
import { ImageSlot, FadeIn, EmptyState } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { SUBS } from "./studioTriage.data";
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
  const [active, setActive] = useState(0);
  const loading = useSimulatedLoad();

  const subs = useMemo(() => {
    switch (tab) {
      case "Yours":
        return SUBS.filter((sub) =>
          sub.badges.some((b) => b.cls === "claimed"),
        );
      case "At deadline":
        return SUBS.filter((sub) => {
          const day = parseInt(sub.day.replace(/\D/g, ""), 10);
          return sub.of && day >= 11;
        });
      case "Shortlisted":
      case "Answered":
        return [];
      default:
        return SUBS;
    }
  }, [tab]);

  return (
    <section className={s.subList}>
      {loading ? (
        Array.from({ length: SUBS.length }).map((_, i) => (
          <SubmissionRowSkeleton key={i} />
        ))
      ) : subs.length === 0 ? (
        <EmptyState
          compact
          icon={<FiInbox />}
          title="Nothing in this queue"
          description={
            <>
              No submissions sit in <em>{tab.toLowerCase()}</em> right now. When
              something lands, you'll find it waiting here.
            </>
          }
          action={{ label: "Back to new", onClick: onBackToNew }}
        />
      ) : (
        subs.map((sub, i) => (
          <FadeIn
            key={`${sub.titlePre}${sub.titleEm ?? ""}`}
            delay={Math.min(i, 8) * 60}
          >
            <div
              className={[s.subRow, active === i && s.subRowActive]
                .filter(Boolean)
                .join(" ")}
              role="button"
              tabIndex={0}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(i);
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
                    {sub.badges.map((b) => (
                      <span
                        key={b.label}
                        className={
                          b.cls === "first"
                            ? s.first
                            : b.cls === "claimed"
                              ? s.claimed
                              : undefined
                        }
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={s.deadline}>
                  <b>{sub.day}</b>
                  {sub.of && "of 14 to answer"}
                </div>
              </div>
              <div className={s.subNote}>{sub.note}</div>
              <div className={s.metaStrip}>
                {sub.meta.map((m, j) => (
                  <span key={j}>{m}</span>
                ))}
              </div>
            </div>
          </FadeIn>
        ))
      )}
    </section>
  );
}
