import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { Button, LoadErrorState } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { reasonFor } from "../../shared/api/errorMessage";
import { routes } from "../../app/routeMap";
import { useProfileEvents } from "./api/useProfileEvents";
import { Section } from "./ProfileSections";
import { ProfileEventsPast } from "./ProfileEventsPast";
import { ProfileEventsUpcoming } from "./ProfileEventsUpcoming";
import { usePosterGridFit } from "./usePosterGridFit";
import styles from "./ProfileEventsSection.module.css";

/** The error panel's body, naming the cause: the server's own reason when it
 *  gave one, a server fault for a 5xx, else the connection. */
function loadErrorBody(error: unknown, t: TFunction): string {
  const reason = reasonFor(error);
  if (reason) return reason;
  if (error instanceof ApiError && error.status >= 500) {
    return t("members:profileEvents.loadError.serverBody");
  }
  return t("members:profileEvents.loadError.body");
}

/**
 * "Events you host" (owner) / "Events {firstName} hosts" (visitor): what the
 * member hosts or co-hosts, upcoming first, with the past folded below.
 *
 * A visitor sees nothing when there is nothing to show, and so does everyone
 * on a limited profile or one the server says is not there. The owner keeps
 * the section with a "Host an event" link. On the first load the section
 * renders a bare, childless `data-section-pending` div: on the phone it is a
 * direct child of the tab panel, where the `:has()` rule in
 * `MobileProfile.module.css` reads it as "still deciding" and keeps the
 * About tab's "nothing here yet" fallback hidden. A retry after a failure
 * keeps the error panel up instead, so focus stays on its button.
 */
export function ProfileEventsSection({
  memberSlug,
  isSelf,
  firstName,
  hasOwnGutter = false,
}: {
  memberSlug: string;
  /** Owner view: keeps the section with a prompt when there is nothing. */
  isSelf: boolean;
  /** For the visitor title and the "nothing coming up" line. */
  firstName: string;
  /** The phone's tab panel mounts this bare, so the section brings its own
   *  `.wrap` gutter there. The desktop column already has one. */
  hasOwnGutter?: boolean;
}) {
  const { t } = useTranslation();
  const {
    upcoming,
    past,
    isPending,
    isError,
    isRetrying,
    error,
    isMissing,
    refetch,
    isLimited,
  } = useProfileEvents(memberSlug, isSelf);
  // The posters form a three-column grid only when the section's own column
  // gives each one 240px; anywhere narrower (a phone, a desktop window that
  // keeps the sections sidebar) they sit in a sideways rail.
  const [bodyRef, isGridFit] = usePosterGridFit();
  const isRail = !isGridFit;

  if (isLimited || isMissing) return null;
  if (isPending) return <div data-section-pending />;
  const hasFailed = isError || isRetrying;
  const isEmpty = upcoming.length === 0 && past.length === 0;
  if (isEmpty && !isSelf && !hasFailed) return null;

  const title = isSelf ? (
    <Translation
      i18nKey="members:profileEvents.selfTitle"
      components={{ em: <em /> }}
    />
  ) : (
    <Translation
      i18nKey="members:profileEvents.visitorTitle"
      values={{ firstName }}
      components={{ em: <em /> }}
    />
  );

  const section = (
    <Section id="events" title={title}>
      {hasFailed ? (
        <LoadErrorState
          compact
          headingLevel={3}
          onRetry={refetch}
          isRetrying={isRetrying}
          title={
            <Translation
              i18nKey="members:profileEvents.loadError.title"
              components={{ em: <em /> }}
            />
          }
          description={loadErrorBody(error, t)}
        />
      ) : isEmpty ? (
        <div className={styles.empty}>
          <p className={styles.note}>{t("members:profileEvents.selfEmpty")}</p>
          <Button to={routes.createGathering} variant="soft" size="sm">
            {t("members:profileEvents.hostCta")}
          </Button>
        </div>
      ) : (
        <div ref={bodyRef} className={styles.body}>
          {upcoming.length > 0 ? (
            <ProfileEventsUpcoming items={upcoming} isRail={isRail} />
          ) : (
            <p className={styles.note}>
              {isSelf
                ? t("members:profileEvents.selfNoUpcoming")
                : t("members:profileEvents.noUpcoming", { firstName })}
            </p>
          )}
          {past.length > 0 && (
            <ProfileEventsPast items={past} isRail={isRail} />
          )}
        </div>
      )}
    </Section>
  );
  return hasOwnGutter ? (
    <div className={`wrap ${styles.ownGutter}`}>{section}</div>
  ) : (
    section
  );
}
