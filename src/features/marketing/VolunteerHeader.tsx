import { FiPlus, FiUsers } from "react-icons/fi";
import { FilterPageHeader } from "../../shared/components/filterPage";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";

export interface VolunteerHeaderProps {
  isLoggedIn: boolean;
  /** The viewer has applicants to review, so "Manage applicants" shows. */
  hasOpportunitiesToManage: boolean;
  /** PRD-454. A signed-out visitor's "Post an opportunity" opens the
   *  volunteer explainer through this; a member links straight to the form. */
  onOpenExplainer: () => void;
}

/** The volunteer board's header on the shared filter page: eyebrow, title,
 *  lead, the vetted note with its live dot, then the actions. Posting is the
 *  primary call with its plus icon, matching the housing board's header;
 *  "Manage applicants" sits beside it as a ghost. */
export function VolunteerHeader({
  isLoggedIn,
  hasOpportunitiesToManage,
  onOpenExplainer,
}: VolunteerHeaderProps) {
  const { t } = useTranslation();
  const postLabel = (
    <>
      <FiPlus aria-hidden /> {t("marketing:volunteer.hero.postCta")}
    </>
  );
  return (
    <FilterPageHeader
      eyebrow={t("marketing:volunteer.hero.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:volunteer.hero.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:volunteer.hero.sub")}
      note={t("marketing:volunteer.hero.note")}
      isNoteLive
      actions={
        <>
          {isLoggedIn ? (
            <Button to={routes.postVolunteer} variant="primary">
              {postLabel}
            </Button>
          ) : (
            <Button onClick={onOpenExplainer} variant="primary">
              {postLabel}
            </Button>
          )}
          {hasOpportunitiesToManage && (
            <Button to={routes.manageVolunteerApplicants} variant="ghost">
              <FiUsers aria-hidden /> {t("marketing:volunteer.hero.manageCta")}
            </Button>
          )}
        </>
      }
    />
  );
}
