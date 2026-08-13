import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListSpaceForm } from "./useListSpaceForm";
import styles from "./ApplicationModals.module.css";
import check from "./ListSpaceFields.module.css";

const SPACE_TYPES = [
  { value: "sublet", labelKey: "economy:listSpace.type.sublet" },
  { value: "room", labelKey: "economy:listSpace.type.room" },
  { value: "short", labelKey: "economy:listSpace.type.short" },
  { value: "studio", labelKey: "economy:listSpace.type.studio" },
];

/** The "list a space" form body — text fields plus the transparency + broker
 * disclosures (P2.6). Presentational: all state lives in `useListSpaceForm`. */
export function ListSpaceFields({ form }: { form: ListSpaceForm }) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.field}>
        <label htmlFor="ls-title">{t("economy:listSpace.titleLabel")}</label>
        <input
          id="ls-title"
          type="text"
          value={form.title}
          onChange={(event) => form.setTitle(event.target.value)}
          placeholder={t("economy:listSpace.titlePlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="ls-area">{t("economy:listSpace.areaLabel")}</label>
        <input
          id="ls-area"
          type="text"
          value={form.area}
          onChange={(event) => form.setArea(event.target.value)}
          placeholder={t("economy:listSpace.areaPlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="ls-rent">{t("economy:listSpace.rentLabel")}</label>
        <input
          id="ls-rent"
          type="number"
          min={0}
          value={form.rent}
          onChange={(event) => form.setRent(event.target.value)}
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
          value={form.bedrooms}
          onChange={(event) => form.setBedrooms(event.target.value)}
          placeholder={t("economy:listSpace.bedroomsPlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="ls-type">{t("economy:listSpace.typeLabel")}</label>
        <select
          id="ls-type"
          value={form.type}
          onChange={(event) => form.setType(event.target.value)}
        >
          <option value="">{t("economy:listSpace.chooseOne")}</option>
          {SPACE_TYPES.map((spaceType) => (
            <option key={spaceType.value} value={spaceType.value}>
              {t(spaceType.labelKey)}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="ls-access">
          {t("economy:listSpace.accessLabel")}
        </label>
        <textarea
          id="ls-access"
          value={form.accessibility}
          onChange={(event) => form.setAccessibility(event.target.value)}
          placeholder={t("economy:listSpace.accessPlaceholder")}
        />
      </div>

      <div className={check.guide}>
        <p className={check.guideTitle}>{t("economy:listSpace.photoGuide.title")}</p>
        <ul className={check.guideList}>
          <li>{t("economy:listSpace.photoGuide.lit")}</li>
          <li>{t("economy:listSpace.photoGuide.rooms")}</li>
          <li>{t("economy:listSpace.photoGuide.consent")}</li>
        </ul>
      </div>

      <div className={styles.field}>
        <label htmlFor="ls-tour">{t("economy:listSpace.tourLabel")}</label>
        <input
          id="ls-tour"
          type="url"
          inputMode="url"
          value={form.virtualTour}
          onChange={(event) => form.setVirtualTour(event.target.value)}
          placeholder={t("economy:listSpace.tourPlaceholder")}
          aria-invalid={form.virtualTourInvalid || undefined}
          aria-describedby={
            form.virtualTourInvalid ? "ls-tour-error" : "ls-tour-hint"
          }
        />
        {form.virtualTourInvalid ? (
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
          checked={form.billsIncluded}
          onChange={(event) => form.setBillsIncluded(event.target.checked)}
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
          checked={form.isAgent}
          onChange={(event) => form.setIsAgent(event.target.checked)}
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
