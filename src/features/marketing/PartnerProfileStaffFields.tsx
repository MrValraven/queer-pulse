import { FiLock } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { OwnedPartnerDTO } from "./api/partners.api";
import styles from "./PartnerProfileEditPage.module.css";

/**
 * The four fields on a partner's public page that the partner does not set
 * (PRD-263), shown READ-ONLY rather than left out.
 *
 * Hiding them would be the worse choice twice over: a partner who sees its
 * tier printed on the public card and cannot find it in its own editor
 * concludes the editor is broken, and a partner who never sees the boundary
 * has no way to know there is somebody to ask.
 *
 *  - `name` is the identity the approval was granted to, and the slug (so
 *    every inbound link) was allocated from it.
 *  - `tier` and `since` describe the RELATIONSHIP. A partner setting its own
 *    tier is a partner grading its own partnership.
 *  - `eyebrow` prints as "Partner · <type>", so its first word is a
 *    relationship claim too.
 */
export function PartnerProfileStaffFields({
  partner,
}: {
  partner: OwnedPartnerDTO;
}) {
  const { t } = useTranslation();
  const rows: { label: string; value: string }[] = [
    {
      label: t("marketing:submitPartner.fields.name.label"),
      value: partner.name,
    },
    {
      label: t("marketing:partnerProfileEdit.staffFields.tier"),
      value: partner.tier,
    },
    {
      label: t("marketing:partnerProfileEdit.staffFields.since"),
      value: partner.since,
    },
    {
      label: t("marketing:partnerProfileEdit.staffFields.eyebrow"),
      value: partner.eyebrow,
    },
  ];

  return (
    <section className={styles.staffBlock}>
      <h2 className={styles.staffTitle}>
        <FiLock aria-hidden />
        {t("marketing:partnerProfileEdit.staffFields.title")}
      </h2>
      <dl className={styles.staffRows}>
        {rows.map((row) => (
          <div className={styles.staffRow} key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.staffNote}>
        {t("marketing:partnerProfileEdit.staffFields.note")}
      </p>
    </section>
  );
}
