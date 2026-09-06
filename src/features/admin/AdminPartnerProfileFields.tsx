import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminPartnerApplicationsPage.module.css";

export interface AdminPartnerProfileDraft {
  name: string;
  tier: string;
  since: string;
  eyebrow: string;
  tagline: string;
  desc: string;
  city: string;
  regionLabel: string;
  phone: string;
  phoneNote: string;
  email: string;
  website: string;
  address: string;
}

/**
 * The staff half of PRD-263: the partner fields the console could not reach.
 *
 * `PATCH /admin/partners/:id` used to accept the featured flag and a
 * testimonial and nothing else, while `tier`, `since` and `eyebrow` were
 * written once from the application form's DEFAULTS and then frozen. The
 * visible consequence was that every partner in the directory carried the same
 * "Community partner" tier, and that a partner whose phone number or address
 * changed kept the wrong one on a public page until somebody edited the row by
 * hand.
 *
 * `tier`, `since`, `eyebrow` and `name` are staff-only for good: they are
 * claims about the RELATIONSHIP and about the identity the approval was
 * granted to, and a partner grading its own partnership is not a partnership.
 * Everything else on this form the partner can also change itself, in its own
 * editor (`/account/partner-profile`), through the same validated write
 * boundary.
 */
export function AdminPartnerProfileFields({
  draft,
  onChange,
}: {
  draft: AdminPartnerProfileDraft;
  onChange: <Field extends keyof AdminPartnerProfileDraft>(
    field: Field,
    value: AdminPartnerProfileDraft[Field],
  ) => void;
}) {
  const { t } = useTranslation();

  const textRows: {
    field: keyof AdminPartnerProfileDraft;
    labelKey: string;
    isMultiline?: boolean;
  }[] = [
    { field: "name", labelKey: "admin:partnerProfile.name" },
    { field: "tier", labelKey: "admin:partnerProfile.tier" },
    { field: "since", labelKey: "admin:partnerProfile.since" },
    { field: "eyebrow", labelKey: "admin:partnerProfile.eyebrow" },
    { field: "tagline", labelKey: "admin:partnerProfile.tagline" },
    { field: "desc", labelKey: "admin:partnerProfile.desc", isMultiline: true },
    { field: "city", labelKey: "admin:partnerProfile.city" },
    { field: "regionLabel", labelKey: "admin:partnerProfile.regionLabel" },
    { field: "phone", labelKey: "admin:partnerProfile.phone" },
    { field: "phoneNote", labelKey: "admin:partnerProfile.phoneNote" },
    { field: "email", labelKey: "admin:partnerProfile.email" },
    { field: "website", labelKey: "admin:partnerProfile.website" },
    { field: "address", labelKey: "admin:partnerProfile.address" },
  ];

  return (
    <>
      {textRows.map((row) => {
        const controlId = `admin-partner-${row.field}`;
        return (
          <div key={row.field}>
            <label className={styles.fieldLabel} htmlFor={controlId}>
              {t(row.labelKey)}
            </label>
            {row.isMultiline ? (
              <textarea
                id={controlId}
                className={styles.textarea}
                rows={3}
                value={draft[row.field]}
                onChange={(event) => onChange(row.field, event.target.value)}
              />
            ) : (
              <input
                id={controlId}
                className={styles.textInput}
                value={draft[row.field]}
                onChange={(event) => onChange(row.field, event.target.value)}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
