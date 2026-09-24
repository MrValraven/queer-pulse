import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatMonthYear } from "../../../../shared/lib/date";
import { CredentialProofThumb } from "../../CredentialProofThumb";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../../api/subprofiles.adapters";
import type { PersonaViewMode } from "../../personaSkinRender";
import { TherapistSection } from "./TherapistSection";
import type { TherapistView } from "./therapistView";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import styles from "./TherapistCredentials.module.css";

interface TherapistCredentialsProps {
  data: PublicSubprofileView;
  view: TherapistView;
  mode: PersonaViewMode;
}

/**
 * "Where Sofia trained": the persona's `credentials` items as a hairline
 * list. Title and issuer on the left, the date on the right (under the text
 * on phones), and the certificate photo when the owner added one. Every item
 * shows, as `SubprofileSections` shows them; this layout has no spotlight, so
 * a featured item stays in its list. `null` without items.
 */
export function TherapistCredentials({
  data,
  view,
  mode,
}: TherapistCredentialsProps) {
  const { t } = useTranslation();
  const items =
    data.sections.find((section) => section.section === "credentials")?.items ??
    [];
  if (items.length === 0) return null;
  const name = view.firstName;

  return (
    <TherapistSection
      label={t("subprofiles:therapist.credentials.label")}
      heading={
        name
          ? t("subprofiles:therapist.credentials.heading", { name })
          : t("subprofiles:therapist.credentials.headingNameless")
      }
      editTarget={THERAPIST_EDIT_TARGETS.credentials}
    >
      <ul className={styles.list}>
        {items.map((item, itemIndex) => (
          <CredentialRow
            key={item.id || `${item.title}-${itemIndex}`}
            item={item}
            isInteractive={mode !== "preview"}
          />
        ))}
      </ul>
    </TherapistSection>
  );
}

function CredentialRow({
  item,
  isInteractive,
}: {
  item: SubprofileItemView;
  isInteractive: boolean;
}) {
  const { language } = useTranslation();
  const hasProof = Boolean(item.imageUrl);
  return (
    <li className={styles.row} data-has-proof={hasProof || undefined}>
      <div className={styles.text}>
        <p className={styles.title}>{item.title}</p>
        {item.subtitle && <p className={styles.issuer}>{item.subtitle}</p>}
        {item.meta && <p className={styles.meta}>{item.meta}</p>}
      </div>
      {item.date && (
        <p className={styles.when}>{formatMonthYear(item.date, language)}</p>
      )}
      {hasProof && (
        <div className={styles.proof}>
          <CredentialProofThumb item={item} interactive={isInteractive} />
        </div>
      )}
    </li>
  );
}
