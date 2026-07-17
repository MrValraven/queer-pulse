import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { useWorkshops } from "../../app/providers/WorkshopsProvider";
import { currentUser, currentUserSlug } from "../members/data/members";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import { buildWorkshop, type WorkshopDraft } from "./addWorkshop.build";
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

/** Plum-panel confirmation shown once the workshop is live. */
function ListedPanel({
  title,
  newId,
  onClose,
}: {
  title: string;
  newId: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <SuccessPanel
      title={t("economy:addWorkshop.listed.title")}
      em={t("economy:addWorkshop.listed.em")}
      onClose={onClose}
      closeLabel={t("economy:addWorkshop.listed.closeLabel")}
      footer={
        newId && (
          <div className={styles.successBtn} style={{ marginTop: 10 }}>
            <Button variant="ghost-dark" to={`${routes.skills}/${newId}`}>
              {t("economy:addWorkshop.listed.viewCta")}
            </Button>
          </div>
        )
      }
    >
      <Translation
        i18nKey="economy:addWorkshop.listed.body"
        values={{ title }}
        components={{ strong: <strong /> }}
      />
    </SuccessPanel>
  );
}

export function AddWorkshopModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { addWorkshop } = useWorkshops();
  const [draft, setDraft] = useState<WorkshopDraft>({
    title: "",
    blurb: "",
    about: "",
    cat: "creative",
    mode: "In-person",
    weeks: "6",
    size: "8",
    price: "150",
    venue: "",
  });
  const [newId, setNewId] = useState<string | null>(null);
  const { sending, done, submit } = useSubmitFlow();

  const set = (patch: Partial<WorkshopDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));
  const num = (v: string) => Number(v) || 0;
  const valid =
    draft.title.trim().length > 2 &&
    draft.blurb.trim().length > 8 &&
    draft.about.trim().length > 12 &&
    num(draft.weeks) >= 1 &&
    num(draft.size) >= 2 &&
    num(draft.price) >= 0;

  const onSubmit = () => {
    if (!valid) return;
    const workshop = buildWorkshop(
      draft,
      {
        name: `${currentUser.first} ${currentUser.last}`,
        initials: currentUser.initials,
        tint: currentUser.tint,
        role: t("economy:addWorkshop.build.tutorRole"),
        memberSlug: currentUserSlug,
      },
      t,
      fmt,
    );
    setNewId(workshop.id);
    submit(() => addWorkshop(workshop));
  };

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      wide
      ariaLabel={t("economy:addWorkshop.ariaLabel")}
    >
      {done ? (
        <ListedPanel title={draft.title} newId={newId} onClose={onClose} />
      ) : (
        <>
          <div className={styles.eyebrow}>
            {t("economy:addWorkshop.eyebrow")}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:addWorkshop.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("economy:addWorkshop.sub")}</p>

          <div className={styles.field}>
            <label htmlFor="aw-title">
              {t("economy:addWorkshop.titleLabel")}
            </label>
            <input
              id="aw-title"
              type="text"
              value={draft.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder={t("economy:addWorkshop.titlePlaceholder")}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="aw-blurb">
              {t("economy:addWorkshop.blurbLabel")}
            </label>
            <input
              id="aw-blurb"
              type="text"
              value={draft.blurb}
              onChange={(e) => set({ blurb: e.target.value })}
              placeholder={t("economy:addWorkshop.blurbPlaceholder")}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="aw-about">
              {t("economy:addWorkshop.aboutLabel")}
            </label>
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
              <label htmlFor="aw-size">
                {t("economy:addWorkshop.sizeLabel")}
              </label>
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
            <label htmlFor="aw-venue">
              {t("economy:addWorkshop.venueLabel")}
            </label>
            <input
              id="aw-venue"
              type="text"
              value={draft.venue}
              onChange={(e) => set({ venue: e.target.value })}
              placeholder={t("economy:addWorkshop.venuePlaceholder")}
            />
          </div>

          <p className={styles.note}>{t("economy:addWorkshop.note")}</p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:addWorkshop.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={onSubmit}
            >
              {sending ? (
                <Sending label={t("economy:addWorkshop.publishingLabel")} />
              ) : (
                t("economy:addWorkshop.publishCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
