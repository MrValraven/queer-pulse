import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HOUSING_CITY } from "./api/housingListing.api";
import { ListSpaceDetailFields } from "./ListSpaceDetailFields";
import type { ListSpaceForm } from "./useListSpaceForm";
import styles from "./ApplicationModals.module.css";
import check from "./ListSpaceFields.module.css";

const SPACE_TYPES = [
  { value: "sublet", labelKey: "economy:listSpace.type.sublet" },
  { value: "room", labelKey: "economy:listSpace.type.room" },
  { value: "short", labelKey: "economy:listSpace.type.short" },
  { value: "studio", labelKey: "economy:listSpace.type.studio" },
];

/**
 * The "list a space" form body: the basics, then everything that carries the
 * home itself (`ListSpaceDetailFields`), then the transparency + broker
 * disclosures (P2.6). Presentational: all state lives in `useListSpaceForm`.
 *
 * The neighbourhood field is the NEIGHBOURHOOD only. Lisbon is the one city
 * this product serves, so it is stated rather than asked for, and the form no
 * longer copies the neighbourhood into the city column.
 */
export function ListSpaceFields({ form }: { form: ListSpaceForm }) {
  const { t } = useTranslation();
  const { values, setField } = form;
  return (
    <>
      <div className={styles.field}>
        <label htmlFor="ls-title">{t("economy:listSpace.titleLabel")}</label>
        <input
          id="ls-title"
          type="text"
          value={values.title}
          onChange={(event) => setField("title", event.target.value)}
          placeholder={t("economy:listSpace.titlePlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="ls-area">{t("economy:listSpace.areaLabel")}</label>
        <input
          id="ls-area"
          type="text"
          value={values.area}
          onChange={(event) => setField("area", event.target.value)}
          placeholder={t("economy:listSpace.areaPlaceholder")}
          aria-describedby="ls-area-hint"
        />
        <p id="ls-area-hint" className={check.fieldHint}>
          {t("economy:listSpace.areaHint", { city: HOUSING_CITY })}
        </p>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="ls-rent">{t("economy:listSpace.rentLabel")}</label>
          <input
            id="ls-rent"
            type="number"
            min={0}
            value={values.rent}
            onChange={(event) => setField("rent", event.target.value)}
            placeholder={t("economy:listSpace.rentPlaceholder")}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="ls-bedrooms">
            {t("economy:listSpace.bedroomsLabel")}
          </label>
          <input
            id="ls-bedrooms"
            type="number"
            min={0}
            max={20}
            value={values.bedrooms}
            onChange={(event) => setField("bedrooms", event.target.value)}
            placeholder={t("economy:listSpace.bedroomsPlaceholder")}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="ls-type">{t("economy:listSpace.typeLabel")}</label>
        <Select
          id="ls-type"
          placeholder={t("economy:listSpace.chooseOne")}
          value={values.type || null}
          onChange={(value) => setField("type", value ?? "")}
          options={SPACE_TYPES.map((spaceType) => ({
            value: spaceType.value,
            label: t(spaceType.labelKey),
          }))}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="ls-access">{t("economy:listSpace.accessLabel")}</label>
        <textarea
          id="ls-access"
          value={values.accessibility}
          onChange={(event) => setField("accessibility", event.target.value)}
          placeholder={t("economy:listSpace.accessPlaceholder")}
        />
      </div>

      <ListSpaceDetailFields form={form} />

      <div className={styles.field}>
        <label htmlFor="ls-tour">{t("economy:listSpace.tourLabel")}</label>
        <input
          id="ls-tour"
          type="url"
          inputMode="url"
          value={values.virtualTour}
          onChange={(event) => setField("virtualTour", event.target.value)}
          placeholder={t("economy:listSpace.tourPlaceholder")}
          aria-invalid={form.isVirtualTourInvalid || undefined}
          aria-describedby={
            form.isVirtualTourInvalid ? "ls-tour-error" : "ls-tour-hint"
          }
        />
        {form.isVirtualTourInvalid ? (
          <p id="ls-tour-error" className={check.fieldError} role="alert">
            {t("economy:listSpace.tourError")}
          </p>
        ) : (
          <p id="ls-tour-hint" className={check.fieldHint}>
            {t("economy:listSpace.tourHint")}
          </p>
        )}
      </div>

      <label className={check.check}>
        <input
          type="checkbox"
          checked={values.billsIncluded}
          onChange={(event) => setField("billsIncluded", event.target.checked)}
        />
        <span className={check.checkText}>
          {t("economy:listSpace.billsLabel")}
          <span className={check.checkHint}>
            {t("economy:listSpace.billsHint")}
          </span>
        </span>
      </label>

      <label className={check.check}>
        <input
          type="checkbox"
          checked={values.isAgent}
          onChange={(event) => setField("isAgent", event.target.checked)}
        />
        <span className={check.checkText}>
          {t("economy:listSpace.agentLabel")}
          <span className={check.checkHint}>
            {t("economy:listSpace.agentHint")}
          </span>
        </span>
      </label>
    </>
  );
}
