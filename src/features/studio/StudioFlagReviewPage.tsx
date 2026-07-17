import { useState } from "react";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { StudioShell } from "./StudioShell";
import { StudioLine } from "./StudioSkeletons";
import { StudioFlagCard } from "./StudioFlagCard";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FLAGS, resolvedFlagImage } from "./studioFlagReview.data";
import s from "./council.module.css";

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

export function StudioFlagReviewPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const loading = useSimulatedLoad();

  function resolve(id: string, verb: string, msg: string) {
    setResolved((r) => ({ ...r, [id]: verb }));
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
            FLAGS.map((flag, flagIndex) => {
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
              delay={Math.min(FLAGS.length, 8) * 60}
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
                    Kitchen <em>warm-up</em>
                  </h3>
                  <div className="who">João Ribeiro · resolved 6 Jun</div>
                </div>
                <span className={s.flagResolvedTag}>
                  {t("studio:flagReview.dismissedClearedTag")}
                </span>
              </div>
              <div className={s.flagClaim} style={{ marginTop: 14 }}>
                <span className="av">SM</span>
                Reviewed by <em>Sara Marques</em> · reporter was told the sample
                is public-domain, with a link
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </StudioShell>
  );
}
