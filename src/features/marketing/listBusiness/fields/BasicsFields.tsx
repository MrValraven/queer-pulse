import {
  CheckLine,
  FormField,
  RadioCardGroup,
  Select,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  ANCHOR,
  CATS,
  catLabel,
  hoodLabel,
  NEIGHBOURHOODS,
  PRICES,
} from "../listBusiness.data";
import { useSimilarListings } from "../api/useSimilarListings";
import { isOwnerBlockHidden } from "../ownerBlock";
import type { ListingForm } from "../useListingForm";
import { DuplicateNotice } from "../DuplicateNotice";
import { StepBasicsBadgeField } from "../StepBasicsBadgeField";
import { StepBasicsOwnerIdentityField } from "../StepBasicsOwnerIdentityField";
import styles from "../ListBusinessPage.module.css";

/**
 * The basics field body: name, categories, the online-only toggle and the
 * neighbourhood, ownership badge and its optional who-runs-it tags, price
 * band and the one-line blurb.
 *
 * The online-only toggle sits here, directly above the neighbourhood, because
 * it decides whether a neighbourhood is asked for at all. It used to live on
 * the practical step, two steps later, so an online business met a
 * required-looking neighbourhood first and picked one it does not have. With
 * the toggle on, the neighbourhood field is gone: no public view shows a
 * neighbourhood for an online listing, and `draftToDto` sends it blank. The
 * picked value stays in the draft, so switching the toggle back off brings
 * it back.
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
  const { draft, set, toggleCat } = form;
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

      <FormField
        className={styles.lbField}
        id={ANCHOR.cats}
        label={t("marketing:listBusiness.step1.catsLabel")}
        required
      >
        <div
          className={styles.chipRow}
          role="group"
          aria-label={t("marketing:listBusiness.step1.catsAria")}
        >
          {CATS.map((c) => {
            const on = draft.cats.includes(c);
            const full = draft.cats.length >= 2 && !on;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                disabled={full}
                className={[styles.chip, on && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleCat(c)}
              >
                {catLabel(t, c)}
              </button>
            );
          })}
        </div>
      </FormField>

      <div id={ANCHOR.online} className={styles.onlineToggleRow}>
        <CheckLine
          checked={draft.online}
          onChange={(online) => set({ online })}
          title={t("marketing:listBusiness.step3.onlineOnly.title")}
          sub={t("marketing:listBusiness.step3.onlineOnly.sub")}
        />
      </div>

      {!draft.online && (
        <FormField
          className={styles.lbField}
          id={ANCHOR.hood}
          label={t("marketing:listBusiness.step1.hoodLabel")}
          required
        >
          <Select
            placeholder={t("marketing:listBusiness.step1.hoodPlaceholder")}
            options={NEIGHBOURHOODS.map((hood) => ({
              value: hood,
              label: hoodLabel(t, hood),
            }))}
            value={draft.hood || null}
            onChange={(value) => set({ hood: value ?? "" })}
          />
        </FormField>
      )}

      <StepBasicsBadgeField form={form} />
      {!isOwnerBlockHidden(draft) && (
        <StepBasicsOwnerIdentityField form={form} />
      )}

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
