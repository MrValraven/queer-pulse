import { FormField, RadioCardGroup, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ANCHOR,
  CATS,
  catLabel,
  hoodLabel,
  NEIGHBOURHOODS,
  PRICES,
} from "./listBusiness.data";
import { useSimilarListings } from "./api/useSimilarListings";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { DuplicateNotice } from "./DuplicateNotice";
import { StepBasicsBadgeField } from "./StepBasicsBadgeField";
import styles from "./ListBusinessPage.module.css";

/* ===== Step 1 — Basics ===== */
export function StepBasics({
  form,
  editRef,
}: {
  form: ListingForm;
  /** The listing being edited — excluded from its own duplicate check. */
  editRef?: string;
}) {
  const { t } = useTranslation();
  const { draft, set, toggleCat } = form;
  // Live duplicate detection against the real directory — by name, and by
  // proximity once a pin exists (item #5).
  const coords =
    draft.latitude !== null && draft.longitude !== null
      ? { latitude: draft.latitude, longitude: draft.longitude }
      : null;
  const dups = useSimilarListings(draft.name, coords, editRef);
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step1.title")}
        em={t("marketing:listBusiness.step1.em")}
        sub={t("marketing:listBusiness.step1.sub")}
      />

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
      {dups.length > 0 && <DuplicateNotice dups={dups} />}

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

      <FormField
        className={styles.lbField}
        id={ANCHOR.hood}
        label={t("marketing:listBusiness.step1.hoodLabel")}
        required={!draft.online}
        helper={
          draft.online
            ? t("marketing:listBusiness.step1.hoodOnlineHelper")
            : undefined
        }
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
    </div>
  );
}
