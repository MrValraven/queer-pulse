import {
  CheckLine,
  FormField,
  RadioCardGroup,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR, PRICES } from "../listBusiness.data";
import { useSimilarListings } from "../api/useSimilarListings";
import type { ListingForm } from "../useListingForm";
import { DuplicateNotice } from "../DuplicateNotice";
import { StepBasicsBadgeField } from "../StepBasicsBadgeField";
import { BasicsCategoryField } from "./BasicsCategoryField";
import { BasicsLocationField } from "./BasicsLocationField";
import styles from "../ListBusinessPage.module.css";

/**
 * The basics field body: on an edit the online-only switch first (above the
 * categories it decides; a new listing answers it on step 0), then the name,
 * the categories for the listing's kind with the 18+ acknowledgement, the
 * neighbourhood or "Based in", the ownership badge, the price band and the
 * one-line blurb. Switching kind keeps the other kind's categories,
 * neighbourhood, address and hours in the draft (`withListingKind`).
 *
 * Rendered by BOTH the create wizard's step 1 pane (`StepBasics`, which adds
 * the pane header around it) and the single-screen owner editor's Basics
 * section, so the two surfaces can never drift apart. Returns a fragment on
 * purpose: every field stays a direct child of the caller's `.stepBody` flex
 * column, which owns the field-to-field rhythm and the open-dropdown stacking
 * escalation.
 */
export function BasicsFields({
  form,
  editRef,
  duplicateCheckBaselineName,
}: {
  form: ListingForm;
  /** The listing being edited, excluded from its own duplicate check. */
  editRef?: string;
  /** The name an edit loaded with. While the trimmed name still equals it,
   *  the duplicate check does not run, so a listing whose own name looks like
   *  another entry opens without an alert. Left out, it always runs. */
  duplicateCheckBaselineName?: string;
}) {
  const { t } = useTranslation();
  const { draft, set, setOnline } = form;
  const isEdit = editRef !== undefined;
  // Live duplicate detection against the real directory: by name, and by
  // proximity once a pin exists (item #5). An empty name disables the read.
  const coords =
    draft.latitude !== null && draft.longitude !== null
      ? { latitude: draft.latitude, longitude: draft.longitude }
      : null;
  const isNameUnchanged =
    duplicateCheckBaselineName !== undefined &&
    draft.name.trim() === duplicateCheckBaselineName.trim();
  const duplicates = useSimilarListings(
    isNameUnchanged ? "" : draft.name,
    coords,
    editRef,
  );

  return (
    <>
      {/* An edit has no Path step, so the kind switch sits first, above the
          categories it decides. The create flow asks on step 0. */}
      {isEdit && (
        <div id={ANCHOR.online} className={styles.onlineToggleRow}>
          <CheckLine
            checked={draft.online}
            onChange={setOnline}
            title={t("marketing:listBusiness.step3.onlineOnly.title")}
            sub={t("marketing:listBusiness.step1.onlineToggle.sub")}
          />
        </div>
      )}
      <FormField
        className={styles.lbField}
        id={ANCHOR.name}
        label={t("marketing:listBusiness.step1.nameLabel")}
        required
        helper={t("marketing:listBusiness.step1.nameHelper")}
      >
        <input
          type="text"
          maxLength={60}
          placeholder={t("marketing:listBusiness.step1.namePlaceholder")}
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
        />
      </FormField>
      {duplicates.length > 0 && <DuplicateNotice dups={duplicates} />}
      <BasicsCategoryField form={form} />
      <BasicsLocationField form={form} />
      <StepBasicsBadgeField form={form} />

      <FormField
        className={styles.lbField}
        id={ANCHOR.price}
        label={t("marketing:listBusiness.step1.priceLabel")}
        required
      >
        <RadioCardGroup
          className={styles.priceRow}
          optionClassName={`${styles.chip} ${styles.priceChip}`}
          checkedClassName={styles.chipOn}
          ariaLabel={t("marketing:listBusiness.step1.priceAria")}
          value={draft.price}
          onChange={(id) => set({ price: id })}
          options={PRICES.map((p) => ({
            id: p.id,
            render: (
              <>
                <span className={styles.priceSym}>{p.sym}</span>
                <span className={styles.priceLbl}>{t(p.labelKey)}</span>
              </>
            ),
          }))}
        />
      </FormField>

      <FormField
        className={styles.lbField}
        id={ANCHOR.blurb}
        label={t("marketing:listBusiness.step1.blurbLabel")}
        required
        helper={t("marketing:listBusiness.step1.blurbHelper")}
        labelAside={`${draft.blurb.length} / 140`}
      >
        <textarea
          maxLength={140}
          placeholder={t("marketing:listBusiness.step1.blurbPlaceholder")}
          value={draft.blurb}
          onChange={(e) => set({ blurb: e.target.value })}
        />
      </FormField>
    </>
  );
}
