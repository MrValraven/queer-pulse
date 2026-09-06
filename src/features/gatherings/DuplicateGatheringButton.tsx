import { FiCopy } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { duplicateGatheringPath } from "./data";

/**
 * "Run this again" — open the create wizard pre-filled from this gathering
 * (PRD-190).
 *
 * A plain link rather than a mutation: nothing is created until the host
 * finishes the wizard and publishes. That matters, because the two things a
 * duplicate must NOT inherit are the date and the publish pledges, and both
 * are questions the wizard asks — a one-click "clone" would have answered
 * them on the host's behalf.
 */
export function DuplicateGatheringButton({ slug }: { slug: string }) {
  const { t } = useTranslation();
  return (
    <Button variant="ghost" size="sm" to={duplicateGatheringPath(slug)}>
      <FiCopy aria-hidden /> {t("gatherings:manage.overview.duplicateCta")}
    </Button>
  );
}
