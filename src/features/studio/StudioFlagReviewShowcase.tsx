import { useMemo, useState } from "react";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { StudioShell } from "./StudioShell";
import { StudioLine } from "./StudioSkeletons";
import { StudioFlagCard } from "./StudioFlagCard";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { buildFlags, resolvedFlagImage } from "./studioFlagReview.data";
import { DAY_MONTH, fixtureDate } from "./studioFixtureDate";
import s from "./council.module.css";

// The already-resolved mock flag: the track title and the reporter's and
// reviewer's names stay literal, the date formats in the active locale, and
// the phrases around them resolve through `studioShowcase:flagReview.resolved.*`.
const FLAG_TRACK_TITLE_PRE = "Kitchen ";
const FLAG_TRACK_TITLE_EM = "warm-up";
const FLAG_REPORTER_NAME = "João Ribeiro";
const FLAG_RESOLVED_DATE_ISO = "2026-06-06";
const REVIEWER_INITIALS = "SM";
const REVIEWER_NAME = "Sara Marques";

/** Mirrors a .flag review card: cover + title row, reason block, action row. */
function FlagCardSkeleton() {
  return (
    <div className={s.flag}>
      <div className={s.flagTop}>
        <StudioLine
          width={46}
          height={46}
          style={{ borderRadius: 8, flex: "none" }}
        />
        <div style={{ flex: 1 }}>
          <StudioLine width="45%" height={17} />
          <StudioLine width="65%" height={12} style={{ marginTop: 8 }} />
        </div>
      </div>
      <StudioLine
        width="100%"
        height={70}
        style={{ marginTop: 16, borderRadius: 12 }}
      />
      <StudioLine width="55%" height={13} style={{ marginTop: 16 }} />
    </div>
  );
}

/** Demo only: the council's flag review, as the showcase has it. */
export function StudioFlagReviewShowcase() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const loading = useSimulatedLoad();
  const flags = useMemo(() => buildFlags(t, fmt), [t, fmt]);

  function resolve(id: string, verb: string, msg: string) {
    setResolved((current) => ({ ...current, [id]: verb }));
    showToast(msg, "success");
  }

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={`${s.eb} ${s.ebJade}`}>
            {t("studio:flagReview.header.eyebrow")}
          </div>
          <h1>
            <Translation
              i18nKey="studio:flagReview.header.title"
              components={{ em: <em /> }}
            />
          </h1>
          <div className={s.dek}>
            <Translation
              i18nKey="studio:flagReview.header.dek"
              components={{ em: <em /> }}
            />
          </div>
        </div>

        <div className={s.flags}>
          {loading &&
            Array.from({ length: 3 }).map((_, skeletonIndex) => (
              <FlagCardSkeleton key={skeletonIndex} />
            ))}
          {!loading &&
            flags.map((flag, flagIndex) => {
              const done = resolved[flag.id];
              return (
                <FadeIn
                  key={flag.id}
                  delay={Math.min(flagIndex, 8) * 60}
                  className={[s.flag, done && s.flagResolved]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <StudioFlagCard flag={flag} done={done} onResolve={resolve} />
                </FadeIn>
              );
            })}

          {/* Already resolved */}
          {!loading && (
            <FadeIn
              delay={Math.min(flags.length, 8) * 60}
              className={`${s.flag} ${s.flagResolved}`}
            >
              <div className={s.flagTop}>
                <span className={s.flagCv}>
                  <ImageSlot
                    src={resolvedFlagImage}
                    tint="coral"
                    width={46}
                    height={46}
                    radius={8}
                    placeholder=""
                  />
                </span>
                <div className={s.flagTi}>
                  <h3>
                    {FLAG_TRACK_TITLE_PRE}
                    <em>{FLAG_TRACK_TITLE_EM}</em>
                  </h3>
                  <div className={s.who}>
                    {t("studioShowcase:flagReview.resolved.reporterLine", {
                      name: FLAG_REPORTER_NAME,
                      date: fmt.date(
                        fixtureDate(FLAG_RESOLVED_DATE_ISO),
                        DAY_MONTH,
                      ),
                    })}
                  </div>
                </div>
                <span className={s.flagResolvedTag}>
                  {t("studio:flagReview.dismissedClearedTag")}
                </span>
              </div>
              <div className={s.flagClaim} style={{ marginTop: 14 }}>
                <span className={s.av}>{REVIEWER_INITIALS}</span>
                <span className={s.claimText}>
                  <Translation
                    i18nKey="studio:flagReview.reviewedByLine"
                    components={{ em: <em /> }}
                    values={{ reviewer: REVIEWER_NAME }}
                  />{" "}
                  · {t("studioShowcase:flagReview.resolved.note")}
                </span>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </StudioShell>
  );
}
