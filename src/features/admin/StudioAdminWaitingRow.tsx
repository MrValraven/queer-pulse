import { useState } from "react";
import { Link } from "react-router-dom";
import { m, useIsPresent } from "motion/react";
import { FiCheck, FiX } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, LoadErrorState } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import type { StudioLoadState } from "../studio/api/studioLoadState";
import { studioReasonCopyKey } from "../studio/studioReason";
import type { AdminStudioAccessRequestDTO } from "./api/studioAccessRequestsAdmin.api";
import { isStudioAdminForbidden } from "./studioAdmin.model";
import { AdminAvatar, AdminChip } from "./ui";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
} from "../studio/studioMotion";
import css from "./StudioAdminFounding.module.css";

const ASKED_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/** A failed console read. A 403 names the missing staff access and offers no
 *  Retry; any other failure names its reason and keeps Retry mounted while it
 *  runs, so the focused button stays. */
export function StudioAdminLoadPanel({
  loadState,
  error,
  title,
}: {
  loadState: StudioLoadState;
  error: unknown;
  title: string;
}) {
  const { t } = useTranslation();
  const liveReason = loadState.reason ?? "unknown";
  // A retry resets the error to null, so the reason would read "unknown"
  // mid-retry. Hold the last settled reason until it lands.
  const [settledReason, setSettledReason] = useState(liveReason);
  if (!loadState.isRetrying && settledReason !== liveReason)
    setSettledReason(liveReason);
  if (isStudioAdminForbidden(error))
    return <p className={css.notice}>{t("admin:studioAdmin.forbidden")}</p>;
  const reason = loadState.isRetrying ? settledReason : liveReason;
  return (
    <LoadErrorState
      compact
      title={title}
      description={t(studioReasonCopyKey(reason, "load"))}
      onRetry={loadState.retry}
      isRetrying={loadState.isRetrying}
    />
  );
}

/** One request: avatar, name (a link to the member), the Artist and invite
 *  chips, the day it was asked, and Grant Studio access and Dismiss request.
 *  A row folds away to nothing when it leaves the list. */
export function StudioAdminWaitingRow({
  request,
  isBusy,
  onGrant,
  onDismiss,
}: {
  request: AdminStudioAccessRequestDTO;
  isBusy: boolean;
  onGrant: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const { member } = request;
  return (
    <m.li
      className={css.waitingItem}
      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
      animate={{
        opacity: 1,
        height: "auto",
        transitionEnd: { overflow: "visible" },
      }}
      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : isPresent
            ? STUDIO_DISCLOSURE
            : STUDIO_DISCLOSURE_EXIT
      }
      inert={!isPresent || undefined}
    >
      <div className={css.row}>
        <div className={css.identity}>
          <AdminAvatar
            size="md"
            src={member.avatarUrl ?? undefined}
            initials={initialsFromName(member.displayName, "?")}
            alt=""
          />
          <div className={css.identityText}>
            {member.slug ? (
              <Link
                to={`${routes.members}/${member.slug}`}
                className={css.name}
              >
                {member.displayName}
              </Link>
            ) : (
              <span className={css.name}>{member.displayName}</span>
            )}
            <span className={css.meta}>
              {t("admin:studioAdmin.waiting.askedOn", {
                date: fmt.date(
                  new Date(request.requestedAt),
                  ASKED_DATE_OPTIONS,
                ),
              })}
            </span>
            {(request.wantsToRelease || request.isFromInvite) && (
              <span className={css.chips}>
                {request.wantsToRelease && (
                  <AdminChip tone="coral">
                    {t("admin:studioAdmin.waiting.artistChip")}
                  </AdminChip>
                )}
                {request.isFromInvite && (
                  <AdminChip tone="violet">
                    {t("admin:studioAdmin.waiting.fromInviteChip")}
                  </AdminChip>
                )}
              </span>
            )}
          </div>
        </div>
        <div className={css.actions}>
          <Button
            variant="primary"
            size="sm"
            aria-label={t("admin:studioAdmin.waiting.grantLabel", {
              name: member.displayName,
            })}
            aria-disabled={isBusy || undefined}
            data-waiting-grant
            onClick={onGrant}
          >
            <FiCheck aria-hidden /> {t("admin:studioAdmin.waiting.grantCta")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("admin:studioAdmin.waiting.dismissLabel", {
              name: member.displayName,
            })}
            aria-disabled={isBusy || undefined}
            onClick={onDismiss}
          >
            <FiX aria-hidden /> {t("admin:studioAdmin.waiting.dismissCta")}
          </Button>
        </div>
      </div>
    </m.li>
  );
}
