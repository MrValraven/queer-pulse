import { useId, type ReactNode } from "react";
import { FiExternalLink } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioOwnerClaimView } from "./api/studioSafetyFields";
import { StudioClaimCounterForm } from "./StudioClaimCounterForm";
import { StudioClaimStatusChip } from "./StudioClaimStatusChip";
import { StudioSafetyHelpLinks } from "./StudioSafetyHelpLinks";
import css from "./StudioClaimPanel.module.css";

const DATE_FORMAT = {
  day: "numeric",
  month: "short",
  year: "numeric",
} as const;

function Quote({ labelKey, text }: { labelKey: string; text: string | null }) {
  const { t } = useTranslation();
  return (
    <Collapse isOpen={text !== null}>
      <p className={css.label}>{t(labelKey)}</p>
      <blockquote className={css.quote}>{text}</blockquote>
    </Collapse>
  );
}

function Fact({
  labelKey,
  children,
}: {
  labelKey: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <dt className={css.factLabel}>{t(labelKey)}</dt>
      <dd className={css.factValue}>{children}</dd>
    </div>
  );
}

/** One copyright claim on the owner's track (spec 8): what was claimed, the
 *  owner's counter-notice and the claimant's reply, the outcome. It never
 *  names or hints at the claimant. The offline banner sits once above the
 *  panels (StudioWithheldBanner), so a panel never repeats it. */
export function StudioClaimPanel({
  claim,
  trackTitle,
  releaseId,
}: {
  claim: StudioOwnerClaimView;
  trackTitle: string;
  releaseId: string;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const headingId = useId();
  const dateOf = (iso: string | null) =>
    iso ? format.date(new Date(iso), DATE_FORMAT) : "";
  const isDecided = claim.status === "upheld" || claim.status === "rejected";
  return (
    <section className={css.panel} aria-labelledby={headingId}>
      <h2 id={headingId} className={css.heading}>
        {t("studio:claimPanel.heading")}
      </h2>
      <p className={css.trackLine}>
        {t("studio:claimPanel.trackLabel", { title: trackTitle })}
      </p>
      <div className={css.statusLine}>
        <StudioClaimStatusChip status={claim.status} viewpoint="owner" />
        {claim.acceptedAt ? (
          <span className={css.meta}>
            {/* "Held since" only while the claim keeps the track offline. */}
            {t(
              claim.isHolding
                ? "studio:claimPanel.acceptedOn"
                : "studio:claimPanel.acceptedDate",
              { date: dateOf(claim.acceptedAt) },
            )}
          </span>
        ) : null}
      </div>
      <dl className={css.facts}>
        <Fact labelKey="studio:claimPanel.claimedWork">
          {claim.originalWork}
          {claim.originalLink ? (
            <>
              {" "}
              <a
                className={css.link}
                href={claim.originalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("studio:claimPanel.originalLink")}
                <FiExternalLink aria-hidden />
                <span className="visuallyHidden">
                  {` ${t("studio:support.opensInNewTab")}`}
                </span>
              </a>
            </>
          ) : null}
        </Fact>
        <Fact labelKey="studio:claimPanel.claimedDetails">{claim.details}</Fact>
        <Fact labelKey="studio:claimPanel.filedByLabel">
          {t(`studio:claimPanel.claimantRole.${claim.claimantRole}`)}
        </Fact>
      </dl>
      <Quote
        labelKey="studio:claimPanel.counterLabel"
        text={claim.counterNote}
      />
      <Quote
        labelKey="studio:claimPanel.claimantReplyHeading"
        text={claim.claimantReply}
      />
      <Collapse isOpen={claim.status === "countered"}>
        <p className={css.meta}>{t("studio:claimPanel.reviewing")}</p>
      </Collapse>
      <Collapse isOpen={isDecided}>
        <p className={css.outcome}>
          {isDecided ? t(`studio:claimPanel.outcome.${claim.status}`) : null}
        </p>
        <p className={css.meta}>
          {t("studio:claimPanel.decidedOn", { date: dateOf(claim.decidedAt) })}
        </p>
      </Collapse>
      {/* An upheld claim keeps the track offline for good: the way on is
          the artist's rights and our team. */}
      <Collapse isOpen={claim.status === "upheld"}>
        <StudioSafetyHelpLinks leadKey="studio:claimPanel.upheldNextStep" />
      </Collapse>
      <Quote
        labelKey="studio:claimPanel.staffNoteHeading"
        text={claim.staffNote}
      />
      <StudioClaimCounterForm claim={claim} releaseId={releaseId} />
    </section>
  );
}
