import { ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { RESOLUTION_LABEL_KEYS, type Flag } from "./studioFlagReview.data";
import s from "./council.module.css";

interface StudioFlagCardProps {
  flag: Flag;
  done?: string;
  onResolve: (id: string, verb: string, msg: string) => void;
}

export function StudioFlagCard({ flag, done, onResolve }: StudioFlagCardProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return (
    <>
      <div className={s.flagTop}>
        <span className={s.flagCv}>
          <ImageSlot
            src={flag.image}
            tint={flag.tint}
            width={46}
            height={46}
            radius={8}
            placeholder=""
          />
        </span>
        <div className={s.flagTi}>
          <h3>
            {flag.titlePre}
            {flag.titleEm && <em>{flag.titleEm}</em>}
            {flag.titlePost}
          </h3>
          <div className="who">{flag.who}</div>
        </div>
        {done ? (
          <span className={s.flagResolvedTag}>
            {t("studio:flagReview.resolvedTag", {
              verb: t(RESOLUTION_LABEL_KEYS[done] ?? done),
            })}
          </span>
        ) : (
          <button
            type="button"
            className={s.flagPlay}
            aria-label={t("studio:flagReview.playAria")}
          >
            <svg viewBox="0 0 12 14" fill="currentColor">
              <path d="M1 1l10 6-10 6z" />
            </svg>
          </button>
        )}
      </div>

      {!done && (
        <>
          <div className={s.flagReason}>
            <span className={s.flagCat}>{flag.cat}</span>
            <p>{flag.reason}</p>
            <div className={s.rmeta}>{flag.rmeta}</div>
          </div>
          <div className={s.flagClaim}>
            <span
              className="av"
              style={
                flag.unclaimed
                  ? {
                      background: "rgba(247,243,238,.1)",
                      color: "rgba(247,243,238,.4)",
                    }
                  : undefined
              }
            >
              {flag.claimAv}
            </span>
            {flag.claim}
            <span className={s.dl}>{flag.deadline}</span>
          </div>
          <div className={s.flagActions}>
            {flag.unclaimed ? (
              <>
                <button
                  type="button"
                  className={`${s.bt} ${s.btP}`}
                  onClick={() =>
                    showToast(t("studio:flagReview.toast.claimed"), "success")
                  }
                >
                  {t("studio:flagReview.claimReviewCta")}
                </button>
                <span className={s.grow} />
                <button
                  type="button"
                  className={`${s.bt} ${s.btDismiss}`}
                  onClick={() =>
                    onResolve(
                      flag.id,
                      "dismissed",
                      t("studio:flagReview.toast.lineupConfirmed"),
                    )
                  }
                >
                  {t("studio:flagReview.dismissCta")}
                </button>
                <button
                  type="button"
                  className={`${s.bt} ${s.btUphold}`}
                  onClick={() =>
                    onResolve(
                      flag.id,
                      "corrected",
                      t("studio:flagReview.toast.lineupCorrected"),
                    )
                  }
                >
                  {t("studio:flagReview.correctLineupCta")}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`${s.bt} ${s.btDismiss}`}
                  onClick={() =>
                    onResolve(
                      flag.id,
                      "dismissed",
                      t("studio:flagReview.toast.dismissedCreditsConfirmed"),
                    )
                  }
                >
                  {t("studio:flagReview.dismissCta")}
                </button>
                <button
                  type="button"
                  className={s.bt}
                  onClick={() =>
                    showToast(
                      t("studio:flagReview.toast.correctionRequested"),
                      "info",
                    )
                  }
                >
                  {t("studio:flagReview.requestFixCta")}
                </button>
                <span className={s.grow} />
                <button
                  type="button"
                  className={`${s.bt} ${s.btUphold}`}
                  onClick={() =>
                    onResolve(
                      flag.id,
                      "held",
                      t("studio:flagReview.toast.heldUntilCorrected"),
                    )
                  }
                >
                  {t("studio:flagReview.holdUntilFixedCta")}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
