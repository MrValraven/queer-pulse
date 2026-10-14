import { useEffect, useId, useRef } from "react";
import { FiCheckCircle, FiClock, FiInfo } from "react-icons/fi";
import type { IconType } from "react-icons";
import { Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import type { StudioDisputeStatus } from "./api/studio.types";
import { StudioReleaseDisputeForm } from "./StudioReleaseDisputeForm";
import css from "./StudioReleaseDispute.module.css";

const DATE_FORMAT = { day: "numeric", month: "long", year: "numeric" } as const;

/** Each dispute state leads with its own chip, so the three never read alike. */
const STATUS_CHIP: Record<
  StudioDisputeStatus,
  { icon: IconType; labelKey: string; className: string | undefined }
> = {
  open: {
    icon: FiClock,
    labelKey: "studio:dispute.openStatus",
    className: css.chipOpen,
  },
  upheld: {
    icon: FiCheckCircle,
    labelKey: "studio:dispute.upheldTitle",
    className: css.chipUpheld,
  },
  rejected: {
    icon: FiInfo,
    labelKey: "studio:dispute.rejectedTitle",
    className: css.chipRejected,
  },
};

function StudioDisputeStatusChip({ status }: { status: StudioDisputeStatus }) {
  const { t } = useTranslation();
  const chip = STATUS_CHIP[status];
  const Icon = chip.icon;
  return (
    <p className={css.statusLine}>
      <span className={`${css.chip} ${chip.className ?? ""}`}>
        <Icon aria-hidden />
        {t(chip.labelKey)}
      </span>
    </p>
  );
}

/**
 * The owner's dispute about a takedown, in its own row under the hero
 * (spec 5.4): the form while a dispute can be filed, the open dispute while
 * our team reads it, and the decision with their reply. Shown to the owner
 * of a taken-down release, and of a release restored after a dispute.
 */
export function StudioReleaseDisputePanel({
  release,
}: {
  release: StudioReleaseView;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const shouldFocusStatusRef = useRef(false);
  const dispute = release.dispute;
  const isTakenDown = release.status === "taken_down";
  // A release taken down again after an upheld dispute still carries that
  // dispute as its latest; "restored" would be stale, so it shows no outcome.
  const shownStatus =
    isTakenDown && dispute?.status === "upheld"
      ? null
      : (dispute?.status ?? null);
  const decidedStatus =
    shownStatus === "upheld" || shownStatus === "rejected" ? shownStatus : null;

  // After sending, focus lands on the status the panel now shows, so the
  // confirmation is read out where the form was.
  useEffect(() => {
    if (!shouldFocusStatusRef.current || shownStatus !== "open") return;
    shouldFocusStatusRef.current = false;
    const frame = requestAnimationFrame(() => statusRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [shownStatus]);

  if (!release.isOwner || (!isTakenDown && shownStatus !== "upheld"))
    return null;
  const dateOf = (iso: string) => format.date(new Date(iso), DATE_FORMAT);

  return (
    <section className={css.panel} aria-labelledby={headingId}>
      <h2 id={headingId} ref={headingRef} tabIndex={-1} className={css.heading}>
        {t(
          shownStatus
            ? "studio:dispute.yourDisputeHeading"
            : "studio:dispute.heading",
        )}
      </h2>

      <Collapse isOpen={shownStatus === "open"}>
        <div ref={statusRef} tabIndex={-1} className={css.status}>
          <StudioDisputeStatusChip status="open" />
          {dispute && (
            <>
              <p className={css.dates}>
                {t("studio:dispute.sentOn", {
                  date: dateOf(dispute.createdAt),
                })}
              </p>
              <p className={css.label}>{t("studio:dispute.yourNoteLabel")}</p>
              <blockquote className={css.quote}>{dispute.note}</blockquote>
            </>
          )}
        </div>
      </Collapse>

      <Collapse isOpen={decidedStatus !== null}>
        {dispute && decidedStatus && (
          <div className={css.outcome}>
            <StudioDisputeStatusChip status={decidedStatus} />
            <p className={css.dates}>
              <span>
                {t("studio:dispute.sentOn", {
                  date: dateOf(dispute.createdAt),
                })}
              </span>
              {dispute.decidedAt && (
                <span>
                  {t("studio:dispute.decidedOn", {
                    date: dateOf(dispute.decidedAt),
                  })}
                </span>
              )}
            </p>
            {dispute.staffReply && (
              <>
                <p className={css.label}>{t("studio:dispute.replyLabel")}</p>
                <blockquote className={css.quote}>
                  {dispute.staffReply}
                </blockquote>
              </>
            )}
          </div>
        )}
      </Collapse>

      {isTakenDown && (
        <StudioReleaseDisputeForm
          releaseId={release.id}
          canDispute={release.canDispute}
          hasEarlierDispute={dispute !== null}
          onSent={() => {
            shouldFocusStatusRef.current = true;
          }}
          onRefused={() => headingRef.current?.focus()}
        />
      )}

      <Collapse
        isOpen={isTakenDown && !release.canDispute && shownStatus !== "open"}
      >
        <p className={css.meta}>{t("studio:dispute.limitReached")}</p>
      </Collapse>
    </section>
  );
}
