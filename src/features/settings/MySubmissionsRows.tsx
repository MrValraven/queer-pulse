import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MyPartnerApplicationDTO } from "../marketing/api/partnerApplicationMine.hooks";
import type { MySentBarterProposalRow } from "../economy/barterProposals.data";
import type {
  MyResourceSuggestionDTO,
  ResourceSuggestionStatus,
} from "../resources/api/resourceSuggestions.api";
import type { BarterProposalStatus } from "../economy/api/barter.api";
import type { PartnerStatus } from "../marketing/api/partners.api";
import { SubmissionCard, type SubmissionTone } from "./MySubmissionsSections";

/**
 * Each intake's own status vocabulary, mapped onto the page's shared visual
 * tone. The map is per kind rather than one flattened table on purpose: the
 * three vocabularies only partly correspond, and pretending otherwise would
 * make the page say something none of the three sources said.
 */
const PARTNER_TONE: Record<PartnerStatus, SubmissionTone> = {
  pending: "waiting",
  approved: "taken",
  rejected: "refused",
};

const BARTER_TONE: Record<BarterProposalStatus, SubmissionTone> = {
  pending: "waiting",
  accepted: "taken",
  declined: "refused",
};

const RESOURCE_TONE: Record<ResourceSuggestionStatus, SubmissionTone> = {
  pending: "waiting",
  approved: "taken",
  declined: "refused",
  // Not a verdict. The queue closed the row without anybody weighing it, so it
  // gets the neutral tone and its own sentence below.
  archived: "closed",
};

/** An application to be listed as a QueerPulse partner (PRD-37). */
export function PartnerApplicationRow({
  application,
}: {
  application: MyPartnerApplicationDTO;
}) {
  const { t } = useTranslation();
  const isRefused = application.status === "rejected";
  return (
    <SubmissionCard
      kindLabel={t("settings:mySubmissions.partner.kind")}
      title={application.name}
      detail={application.city}
      ownMessage={application.tagline}
      tone={PARTNER_TONE[application.status]}
      statusLabel={t(
        `settings:mySubmissions.partner.status.${application.status}`,
      )}
      sentAt={application.createdAt}
      decidedAt={application.decidedAt}
      noteLabel={t("settings:mySubmissions.partner.noteLabel")}
      note={application.reviewNote}
      // An older refusal comes back with no note because the reason was
      // written while it was private and never reached the applicant. Saying
      // so beats a refusal that appears to have had no reason at all.
      missingNote={
        isRefused ? t("settings:mySubmissions.partner.noReason") : null
      }
    />
  );
}

/** A swap the member proposed against somebody else's listing (PRD-43). */
export function BarterProposalRow({
  proposal,
}: {
  proposal: MySentBarterProposalRow;
}) {
  const { t } = useTranslation();
  const headline =
    proposal.listing?.offer ||
    proposal.listing?.want ||
    t("settings:mySubmissions.barter.listingGone");
  return (
    <SubmissionCard
      kindLabel={t("settings:mySubmissions.barter.kind")}
      title={headline}
      detail={proposal.listing?.name || null}
      ownMessage={proposal.message}
      tone={BARTER_TONE[proposal.status]}
      statusLabel={t(`settings:mySubmissions.barter.status.${proposal.status}`)}
      sentAt={proposal.createdAt}
      decidedAt={proposal.decidedAt}
      explanation={
        proposal.wasListingEditedAfterProposal
          ? t("settings:mySubmissions.barter.editedAfter")
          : null
      }
      // The one kind with a destination that exists. `/work/barter/mine` holds
      // the proposer's own half of the exchange, including the thread. The
      // other two intakes have no member-facing page to send anybody to, so
      // they get no link rather than a link that goes nowhere.
      linkTo={routes.myBarter}
      linkLabel={t("settings:mySubmissions.barter.link")}
    />
  );
}

/** An entry the member suggested for the resources directory (PRD-45). */
export function ResourceSuggestionRow({
  suggestion,
}: {
  suggestion: MyResourceSuggestionDTO;
}) {
  const { t } = useTranslation();
  return (
    <SubmissionCard
      kindLabel={t("settings:mySubmissions.resource.kind")}
      title={suggestion.name}
      ownMessage={suggestion.description}
      tone={RESOURCE_TONE[suggestion.status]}
      statusLabel={t(
        `settings:mySubmissions.resource.status.${suggestion.status}`,
      )}
      sentAt={suggestion.createdAt}
      decidedAt={suggestion.decidedAt}
      // `archived` sends no notification at all, so this page is the only
      // place a member ever learns of it. It says plainly that nobody refused
      // anything.
      explanation={
        suggestion.status === "archived"
          ? t("settings:mySubmissions.resource.archivedNote")
          : null
      }
      noteLabel={t("settings:mySubmissions.resource.noteLabel")}
      note={suggestion.decisionNote}
      missingNote={
        suggestion.status === "declined"
          ? t("settings:mySubmissions.resource.noReason")
          : null
      }
    />
  );
}
