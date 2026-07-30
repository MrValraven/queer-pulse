import { FiEdit2 } from "react-icons/fi";
import { subprofileEditPath } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Owner-only "Edit" control for a persona hero — shared by the desktop
 * (`SubprofileShowcase`) and mobile (`SubprofileShowcaseMobile`) self-view
 * paths so both render the owner row identically instead of duplicating
 * this markup in two places.
 */
export function SubprofileEditButton({
  subprofileId,
}: {
  subprofileId: string;
}) {
  const { t } = useTranslation();
  return (
    <Button variant="ghost" size="md" to={subprofileEditPath(subprofileId)}>
      <FiEdit2 aria-hidden /> {t("subprofiles:alsoAs.edit")}
    </Button>
  );
}
