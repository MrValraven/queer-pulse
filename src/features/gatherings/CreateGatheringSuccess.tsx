import { useEffect, useId, useRef } from "react";
import { FiArrowRight, FiCheck, FiEdit3, FiSettings } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useIsQuizshowVisible } from "../quizshow/quizshowLaunch";
import { DEMO_GATHERING_SLUGS, gatheringPath } from "./data";
import { useEventHostScope } from "./eventHostScope";
import { HOUSE_MUSIC_DEMO_SLUGS } from "./houseMusicEvents.data";
import { gatheringOccurrences } from "./gatheringOccurrences";
import { manageGatheringPath } from "./gatheringPaths";
import { GatheringPreviewPanel } from "./preview/GatheringPreviewPanel";
import { ShareKitRow } from "./shareKit/ShareKitRow";
import type { GatheringForm } from "./useGatheringForm";
import styles from "./CreateGatheringSuccess.module.css";

/**
 * The published screen, shown once the create wizard's `createEvent` resolves:
 * a plum success panel with the title, a lead that counts a series' dates,
 * the share kit and the way on to the board or the gathering's own page,
 * beside the gathering's card as the board will show it. The card carries
 * the accessibility the host confirmed, so it is shown there once.
 */
export function CreateGatheringSuccess({
  form,
  /** Slug the backend assigned. Null in demo, where the share kit stays
   *  hidden and the page CTA falls back to the board. */
  createdSlug,
  /** Every saved date's slug in series order (`[createdSlug]` for a single
   *  gathering). Empty in demo. The calendar file links each date to its own
   *  page from it. */
  occurrenceSlugs,
}: {
  /** The published form, for the share kit and the preview card. */
  form: GatheringForm;
  createdSlug: string | null;
  occurrenceSlugs: string[];
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isQuizshowVisible = useIsQuizshowVisible();
  const { isHouseEvent, managePathFor } = useEventHostScope();
  // The publish button that held focus is gone with the wizard. Focus moves
  // to the heading so a screen reader starts reading from the announcement.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  const dateCount = gatheringOccurrences(form).length;
  const memberLead =
    dateCount > 1
      ? t("gatherings:create.v2.success.leadSeries", { dateCount })
      : t("gatherings:create.v2.success.lead");
  // An event QueerPulse hosts is run from its admin manage page, so Manage
  // event takes the primary slot (first in the row and on top once the
  // actions stack) and the event page steps down beside View on board.
  const isManagePrimary = isHouseEvent && managePathFor !== null;
  return (
    <section className={styles.success} aria-labelledby={headingId}>
      <div className={styles.layout}>
        <div className={styles.copy}>
          <span className={styles.icon} aria-hidden>
            <FiCheck />
          </span>
          <h1
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            className={styles.title}
          >
            <Translation
              i18nKey="gatherings:create.success.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.lead}>
            {isHouseEvent
              ? t("admin:musicEvents.house.successLead")
              : memberLead}
          </p>
          {createdSlug && (
            <div className={styles.shareSlot}>
              <ShareKitRow
                form={form}
                slug={createdSlug}
                occurrenceSlugs={occurrenceSlugs}
              />
            </div>
          )}
          <div
            className={
              isManagePrimary
                ? `${styles.actions} ${styles.actionsPrimaryFirst}`
                : styles.actions
            }
          >
            {/* Demo saves nothing, so Manage event opens a demo house event. */}
            {isManagePrimary && managePathFor && (
              <Button
                to={managePathFor(
                  createdSlug ?? HOUSE_MUSIC_DEMO_SLUGS.clubNight,
                )}
                variant="primary"
              >
                <FiSettings aria-hidden />{" "}
                {t("admin:musicEvents.row.manageCta")}
              </Button>
            )}
            {form.format === "quiz" && isQuizshowVisible && (
              <Button
                to={manageGatheringPath(
                  createdSlug ?? DEMO_GATHERING_SLUGS.manage,
                  "quizshow",
                )}
                variant="ghost-dark"
              >
                <FiEdit3 aria-hidden />{" "}
                {t("gatherings:create.success.quizshowCta")}
              </Button>
            )}
            <Button to={routes.gatherings} variant="ghost-dark">
              {t("gatherings:create.success.viewCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
            <Button
              to={createdSlug ? gatheringPath(createdSlug) : routes.gatherings}
              variant={isManagePrimary ? "ghost-dark" : "primary"}
            >
              {t("gatherings:create.success.eventCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </div>
        </div>
        <div className={styles.cardColumn}>
          <div className={styles.card}>
            <GatheringPreviewPanel form={form} variant="success" />
          </div>
        </div>
      </div>
    </section>
  );
}
