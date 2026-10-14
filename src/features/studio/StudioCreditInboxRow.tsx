import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import {
  Button,
  CollapseListItem,
  ImageSlot,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioCreditInboxRowView } from "./api/studioDiscovery.adapters";
import css from "./StudioCredits.module.css";
import { StudioPersonaRefLink } from "./StudioPersonaRefLink";

/** One credit: who credited which of the member's personas, as what, on
 *  which track (linked, with its release). Persona names only; the member
 *  behind the requesting persona never reaches this page. A pending row
 *  offers Accept and Decline, an accepted one Remove; each section passes
 *  only the handlers its rows use. The row folds in and out through
 *  `CollapseListItem`, inert while it leaves. */
export function StudioCreditInboxRow({
  row,
  isBusy,
  onAccept,
  onDecline,
  onRemove,
}: {
  row: StudioCreditInboxRowView;
  isBusy: boolean;
  onAccept?: (row: StudioCreditInboxRowView) => void;
  onDecline?: (row: StudioCreditInboxRowView) => void;
  onRemove?: (row: StudioCreditInboxRowView) => void;
}) {
  const { t } = useTranslation();
  const lineValues = {
    requester: row.requestingPersona.name,
    persona: row.creditedPersona.name,
    role: t(row.roleLabelKey),
    track: row.track.title,
  };
  const ariaValues = {
    persona: row.creditedPersona.name,
    track: row.track.title,
  };
  const isPending = row.status === "pending";
  return (
    <CollapseListItem>
      <div className={css.row}>
        <span className={css.cover}>
          <ImageSlot
            src={row.release.coverUrl ?? undefined}
            tint={row.release.tint}
            width={48}
            height={48}
            radius={8}
            placeholder=""
          />
        </span>
        <div className={css.rowText}>
          <p className={css.line}>
            <Translation
              i18nKey={
                isPending
                  ? "studio:credits.inbox.requestLine"
                  : "studio:credits.inbox.acceptedLine"
              }
              values={lineValues}
              slots={{
                requester: (
                  <StudioPersonaRefLink
                    persona={row.requestingPersona}
                    // The chip's underline marks a link, so a persona with
                    // no handle stays plain text.
                    className={
                      row.requestingPersona.href ? (css.personaChip ?? "") : ""
                    }
                  >
                    {row.requestingPersona.name}
                  </StudioPersonaRefLink>
                ),
                track: (
                  <Link to={row.track.href} className={css.inlineLink}>
                    {row.track.title}
                  </Link>
                ),
              }}
            />
          </p>
          <p className={css.releaseLine}>
            <Translation
              i18nKey="studio:credits.inbox.releaseLine"
              values={{ release: row.release.title }}
              slots={{
                release: (
                  <Link to={row.release.href} className={css.inlineLink}>
                    {row.release.title}
                  </Link>
                ),
              }}
            />
          </p>
        </div>
        <div className={css.actions}>
          {isPending ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("studio:credits.inbox.declineAria", ariaValues)}
                aria-disabled={isBusy || undefined}
                onClick={() => onDecline?.(row)}
              >
                {t("studio:credits.inbox.declineCta")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                aria-label={t("studio:credits.inbox.acceptAria", ariaValues)}
                aria-disabled={isBusy || undefined}
                onClick={() => onAccept?.(row)}
              >
                <FiCheck aria-hidden /> {t("studio:credits.inbox.acceptCta")}
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("studio:credits.inbox.removeAria", ariaValues)}
              aria-disabled={isBusy || undefined}
              onClick={() => onRemove?.(row)}
            >
              {t("studio:credits.removeCta")}
            </Button>
          )}
        </div>
      </div>
    </CollapseListItem>
  );
}
