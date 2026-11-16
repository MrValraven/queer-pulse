import { FiMapPin } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { FadeIn } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPageHeader } from "../ui";
import { leadReasonOf, type LeadDTO } from "./api/leads.types";
import { useLead } from "./api/useLead";
import { AdminLeadFrame } from "./AdminLeadFrame";
import { LeadAssigneesPanel } from "./LeadAssigneesPanel";
import { LeadContactActions } from "./LeadContactActions";
import { LeadDeleteSection } from "./LeadDeleteSection";
import { LeadDetailsPanel } from "./LeadDetailsPanel";
import { LeadHistoryPanel } from "./LeadHistoryPanel";
import { LEAD_TYPE_LABEL_KEY } from "./leadLabels.data";
import { LeadFadeInline } from "./LeadFadeInline";
import {
  AdminLeadLoadError,
  AdminLeadNotFound,
  AdminLeadSkeleton,
} from "./LeadPageStates";
import { LeadPersonaPanel } from "./LeadPersonaPanel";
import { LeadStagePill } from "./LeadStagePill";
import styles from "./AdminLead.module.css";

/**
 * One lead (`/admin/leads/:leadId`, Admins and the Music manager & producer
 * grant): its details with the stage, the staff in charge, the linked
 * persona, the history with notes, and Delete lead at the bottom. The
 * admin frame stays mounted while the body moves from the outline to the
 * lead or to a state.
 */
export function AdminLeadPage() {
  const { leadId = "" } = useParams();
  return (
    <AdminLeadFrame>
      <AdminLeadBody leadId={leadId} />
    </AdminLeadFrame>
  );
}

function AdminLeadBody({ leadId }: { leadId: string }) {
  const { data: lead, error, isError, isFetching, refetch } = useLead(leadId);

  // A read that answers "not found" wins over a lead still in the cache: a
  // write refused because the lead was deleted elsewhere reads it again, and
  // that answer lands here.
  if (leadReasonOf(error) === "LEAD_NOT_FOUND") {
    return (
      <FadeIn key="notFound">
        <AdminLeadNotFound />
      </FadeIn>
    );
  }
  // A loaded lead stays on screen through any other failed read.
  if (lead) {
    return (
      <FadeIn key={`lead-${lead.id}`}>
        <AdminLeadContent lead={lead} />
      </FadeIn>
    );
  }
  if (isError) {
    return (
      <FadeIn key="error">
        <AdminLeadLoadError
          error={error}
          isRetrying={isFetching}
          onRetry={() => void refetch()}
        />
      </FadeIn>
    );
  }
  return (
    <FadeIn key="loading">
      <AdminLeadSkeleton />
    </FadeIn>
  );
}

/** The stage pill, the type, then the location after a pin when the lead
 *  has one: one line right under the name, so the stage reads with the
 *  title. The stage stays out of the heading itself, which names the lead
 *  alone. */
function LeadHeaderSub({ lead }: { lead: LeadDTO }) {
  const { t } = useTranslation();
  return (
    <span className={styles.headerSub}>
      <LeadStagePill stage={lead.stage} />
      <span>{t(LEAD_TYPE_LABEL_KEY[lead.type])}</span>
      <LeadFadeInline isShown={lead.location !== null}>
        <span className={styles.headerLocation}>
          <FiMapPin className={styles.headerIcon} aria-hidden />
          {lead.location}
        </span>
      </LeadFadeInline>
    </span>
  );
}

/** The header with Email and Call beside the name (under it on a phone),
 *  then the two columns: details on the left, In charge then persona then
 *  history on the right (In charge opens the right column), Delete lead
 *  across both at the bottom. The DOM keeps the reading order (details, in
 *  charge, persona, history, delete), which is how a narrow page stacks
 *  them; the grid places them side by side. */
function AdminLeadContent({ lead }: { lead: LeadDTO }) {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <AdminPageHeader
        eyebrow={t("shared:adminNav.sections.communities")}
        title={lead.name}
        sub={<LeadHeaderSub lead={lead} />}
        actions={<LeadContactActions lead={lead} />}
      />
      <div className={styles.bodyFrame}>
        <div className={styles.body}>
          <div className={styles.detailsArea}>
            <LeadDetailsPanel key={lead.id} lead={lead} />
          </div>
          <div className={styles.assigneesArea}>
            <LeadAssigneesPanel key={lead.id} lead={lead} />
          </div>
          <div className={styles.personaArea}>
            <LeadPersonaPanel lead={lead} />
          </div>
          <div className={styles.historyArea}>
            <LeadHistoryPanel lead={lead} />
          </div>
          <div className={styles.footerRow}>
            <LeadDeleteSection lead={lead} />
          </div>
        </div>
      </div>
    </div>
  );
}
