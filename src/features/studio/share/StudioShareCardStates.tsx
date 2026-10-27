import type { ReactNode } from "react";
import { m, useIsPresent } from "motion/react";
import { FiMusic, FiRefreshCw } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { StudioShareCardPlaceholder } from "./StudioShareCardFrame";
import type { StudioLoadState } from "../api/studioLoadState";
import type { StudioShareCardStatus } from "./studioShareCardModel";
import styles from "./StudioShareCard.module.css";

const CROSSFADE_SECONDS = 0.2;

/** One state's layer. Mounted inside `AnimatePresence` with the state as its
 *  key, so the old layer fades out over the new one inside the fixed frame. */
export function StudioShareCardLayer({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotionPrefs();
  // The layer fading out stays on screen for the crossfade; inert keeps its
  // link and play out of reach meanwhile.
  const isPresent = useIsPresent();
  return (
    <m.div
      className={styles.layer}
      inert={!isPresent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: reducedMotion ? 0 : CROSSFADE_SECONDS,
        ease: "easeOut",
      }}
    >
      {children}
    </m.div>
  );
}

type StudioShareNoticeStatus = "teaser" | "withdrawn" | "unavailable";

const NOTICE_KEY: Record<StudioShareNoticeStatus, string> = {
  teaser: "studio:share.card.teaser",
  withdrawn: "studio:share.card.withdrawn",
  unavailable: "studio:share.card.unavailable",
};

function StudioShareCardNotice({
  status,
}: {
  status: StudioShareNoticeStatus;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.body}>
      <span className={styles.mark} aria-hidden="true">
        <FiMusic />
      </span>
      {/* A span: a post body's paragraph rules must never restyle it. */}
      <span className={styles.notice}>{t(NOTICE_KEY[status])}</span>
    </div>
  );
}

/** A transient read failure: the reason in the card's own words and a Retry.
 *  The status stays "error" while a retry runs, so the layer (and focus on
 *  the button) holds still. */
function StudioShareCardError({ loadState }: { loadState: StudioLoadState }) {
  const { t } = useTranslation();
  const reason = loadState.reason ?? "unknown";
  return (
    <div className={styles.body} role="alert">
      <span className={styles.mark} aria-hidden="true">
        <FiMusic />
      </span>
      <span className={styles.notice}>
        {t(`studio:share.card.error.${reason}`)}
      </span>
      <Button
        variant="quiet"
        size="sm"
        className={styles.retry}
        aria-busy={loadState.isRetrying || undefined}
        aria-disabled={loadState.isRetrying || undefined}
        onClick={() => {
          if (!loadState.isRetrying) loadState.retry();
        }}
      >
        <FiRefreshCw aria-hidden /> {t("studio:share.card.retryCta")}
      </Button>
    </div>
  );
}

function StudioShareCardLoading() {
  const { t } = useTranslation();
  return (
    <StudioShareCardPlaceholder>
      <span className="visuallyHidden">{t("studio:share.card.loading")}</span>
    </StudioShareCardPlaceholder>
  );
}

/** Every state except the loaded card. */
export function StudioShareCardStatusBody({
  status,
  loadState,
}: {
  status: Exclude<StudioShareCardStatus, "ready">;
  /** The read's state; the error body needs it for its reason and Retry. */
  loadState?: StudioLoadState | null;
}) {
  if (status === "loading") return <StudioShareCardLoading />;
  if (status === "error" && loadState) {
    return <StudioShareCardError loadState={loadState} />;
  }
  return (
    <StudioShareCardNotice
      status={status === "error" ? "unavailable" : status}
    />
  );
}
