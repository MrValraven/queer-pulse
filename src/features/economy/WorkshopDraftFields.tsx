import { useTranslation } from "../../shared/i18n/useTranslation";
import type { WorkshopDraft } from "./addWorkshop.build";
import styles from "./ApplicationModals.module.css";

// Stable English ids (§5.1) — stored on the draft/workshop record; only the
// option label resolves through the catalog at render.
const CATS = [
  { value: "creative", labelKey: "economy:addWorkshop.cat.creative" },
  { value: "craft", labelKey: "economy:addWorkshop.cat.craft" },
  { value: "design", labelKey: "economy:addWorkshop.cat.design" },
  { value: "tech", labelKey: "economy:addWorkshop.cat.tech" },
  { value: "business", labelKey: "economy:addWorkshop.cat.business" },
  { value: "care", labelKey: "economy:addWorkshop.cat.care" },
];
const MODES = [
  { value: "In-person", labelKey: "economy:addWorkshop.mode.inPerson" },
  { value: "Online", labelKey: "economy:addWorkshop.mode.online" },
  { value: "Hybrid", labelKey: "economy:addWorkshop.mode.hybrid" },
];

/** Every field a workshop listing is made of. Owned by no flow in particular:
 *  `AddWorkshopModal` renders it both when listing a new workshop and when its
 *  host edits an existing one, so the two can never drift apart. The caller owns
 *  the draft state and the submit. */
export function WorkshopDraftFields({
  draft,
  set,
}: {
  draft: WorkshopDraft;
  set: (patch: Partial<WorkshopDraft>) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.field}>
        <label htmlFor="aw-title">{t("economy:addWorkshop.titleLabel")}</label>
        <input
          id="aw-title"
          type="text"
          value={draft.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder={t("economy:addWorkshop.titlePlaceholder")}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="aw-blurb">{t("economy:addWorkshop.blurbLabel")}</label>
        <input
          id="aw-blurb"
          type="text"
          value={draft.blurb}
          onChange={(e) => set({ blurb: e.target.value })}
          placeholder={t("economy:addWorkshop.blurbPlaceholder")}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="aw-about">{t("economy:addWorkshop.aboutLabel")}</label>
        <textarea
          id="aw-about"
          rows={4}
          value={draft.about}
          onChange={(e) => set({ about: e.target.value })}
          placeholder={t("economy:addWorkshop.aboutPlaceholder")}
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="aw-cat">
            {t("economy:addWorkshop.categoryLabel")}
          </label>
          <select
            id="aw-cat"
            value={draft.cat}
            onChange={(e) => set({ cat: e.target.value })}
          >
            {CATS.map((c) => (
              <option key={c.value} value={c.value}>
                {t(c.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="aw-mode">
            {t("economy:addWorkshop.formatLabel")}
          </label>
          <select
            id="aw-mode"
            value={draft.mode}
            onChange={(e) => set({ mode: e.target.value })}
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {t(m.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="aw-weeks">
            {t("economy:addWorkshop.weeksLabel")}
          </label>
          <input
            id="aw-weeks"
            type="number"
            min={1}
            max={52}
            value={draft.weeks}
            onChange={(e) => set({ weeks: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="aw-size">{t("economy:addWorkshop.sizeLabel")}</label>
          <input
            id="aw-size"
            type="number"
            min={2}
            max={40}
            value={draft.size}
            onChange={(e) => set({ size: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="aw-price">
            {t("economy:addWorkshop.priceLabel")}
          </label>
          <input
            id="aw-price"
            type="number"
            min={0}
            value={draft.price}
            onChange={(e) => set({ price: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="aw-venue">{t("economy:addWorkshop.venueLabel")}</label>
        <input
          id="aw-venue"
          type="text"
          value={draft.venue}
          onChange={(e) => set({ venue: e.target.value })}
          placeholder={t("economy:addWorkshop.venuePlaceholder")}
        />
      </div>
    </>
  );
}

/** A blank listing, with the defaults the prototype shipped. */
export const EMPTY_WORKSHOP_DRAFT: WorkshopDraft = {
  title: "",
  blurb: "",
  about: "",
  cat: "creative",
  mode: "In-person",
  weeks: "6",
  size: "8",
  price: "150",
  venue: "",
};
