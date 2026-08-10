import type { CSSProperties } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  Eyebrow,
  SkeletonAvatar,
  SuccessPanel,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EMPTY_SIDES_SAMPLES } from "./subprofileDashboardStates.data";

const SKELETON_COUNT = 4;

/**
 * The dashboard's "still fetching" state: a `.sides` grid of flat `.side.sk`
 * card outlines (accent-header wash + a cut-out avatar skeleton + `.sk-b`
 * shimmer bars standing in for name/tagline/meta) — same shell the populated
 * `SideCard` grid will render into once wired up, so there's no layout jump
 * when the real data lands. One `aria-busy` region rather than one
 * announcement per card; the cards themselves are decorative until then.
 */
export function LoadingSides() {
  const { t } = useTranslation();
  return (
    <div
      className="sides"
      role="status"
      aria-busy="true"
      aria-label={t("subprofiles:mine.loadingAria")}
    >
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div className="side sk" key={index} aria-hidden>
          <div className="side-top" />
          <div className="side-body">
            <div className="side-av">
              <SkeletonAvatar size={58} />
            </div>
            <span className="sk-b" style={{ width: "58%", height: 22 }} />
            <span className="sk-b" style={{ width: "85%", height: 14 }} />
            <span
              className="sk-b"
              style={{ width: "40%", height: 12, marginTop: 8 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptySidesProps {
  /** Opens the create-a-side wizard (Task 3's `NewSideModal`). */
  onNew: () => void;
  /** Sends the member to the persona directory to see other people's sides. */
  onBrowse: () => void;
}

/**
 * The dashboard's first-run state: a two-column `.empty-hero` — copy + two
 * CTAs on the left, three rotated `.empty-card[data-skin-hint]` sample tiles
 * on the right hinting at what a finished side can look like. Replaces the
 * page's current single-column generic `EmptyState` (see the Phase 2
 * groundwork doc, Part C) once Task 6 wires this in.
 */
export function EmptySides({ onNew, onBrowse }: EmptySidesProps) {
  const { t } = useTranslation();
  return (
    <div className="empty-hero">
      <div className="empty-copy">
        <Eyebrow>{t("subprofiles:mine.empty.eyebrow")}</Eyebrow>
        <h1>
          <Translation
            i18nKey="subprofiles:mine.empty.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p>{t("subprofiles:mine.empty.sub")}</p>
        <div className="empty-actions">
          <Button variant="primary" size="lg" onClick={onNew}>
            {t("subprofiles:mine.empty.newCta")}
          </Button>
          <Button variant="ghost" size="lg" onClick={onBrowse}>
            {t("subprofiles:mine.empty.browseCta")}
          </Button>
        </div>
      </div>
      <div className="empty-samples">
        {EMPTY_SIDES_SAMPLES.map((sample, index) => (
          <div
            key={sample.skinHint}
            className="empty-card"
            data-skin-hint={sample.skinHint}
            style={{ "--i": index + 1 } as CSSProperties}
            aria-hidden
          >
            <b>{t(sample.nameKey)}</b>
            <small>{t(sample.lineKey)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ErrorSidesProps {
  /** Re-runs `useSubprofiles()`'s query (its `refetch`). */
  onRetry: () => void;
}

/**
 * The dashboard's "couldn't load" state. Per `docs/STYLE-RULES.md` an error
 * surface is never a plain white/`.bigstate` card — it gets the repo's
 * standard plum panel (the same treatment `ErrorFallback` uses for a caught
 * render error), reusing the shared `SuccessPanel` primitive: it already
 * *is* that plum panel (serif title + coral `<em>`, `ghost-dark` action), so
 * this just swaps its jade check for a coral alert icon and repurposes
 * `onClose`/`closeLabel` as the retry action.
 */
export function ErrorSides({ onRetry }: ErrorSidesProps) {
  const { t } = useTranslation();
  return (
    <SuccessPanel
      title={t("subprofiles:mine.error.title")}
      em={t("subprofiles:mine.error.em")}
      icon={<FiAlertTriangle size={26} color="var(--accent)" aria-hidden />}
      iconTone="coral"
      onClose={onRetry}
      closeLabel={t("subprofiles:mine.error.retry")}
    >
      {t("subprofiles:mine.error.description")}
    </SuccessPanel>
  );
}
