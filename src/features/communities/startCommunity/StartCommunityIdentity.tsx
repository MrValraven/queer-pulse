import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CATEGORY_OPTIONS, initialsOf } from "./startCommunity.data";
import { useAllCommunities } from "../useAllCommunities";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

/** Chapter 1 — Why: name, purpose, category, plus a similar-spaces nudge. */
export function StepWhy({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  const all = useAllCommunities();
  const q = draft.name.trim().toLowerCase();
  const similar =
    q.length >= 3
      ? all
          .filter((c) => {
            const n = c.name.toLowerCase();
            return n.includes(q) || q.includes(n.split(" ")[0] ?? n);
          })
          .slice(0, 3)
      : [];

  return (
    <div>
      <div className={styles.field}>
        <label htmlFor="sc-name">
          {t("communities:start.why.nameLabel")}{" "}
          <span className={styles.req}>*</span>
        </label>
        <input
          id="sc-name"
          type="text"
          className={`${styles.input} ${styles.big}`}
          placeholder={t("communities:start.why.namePlaceholder")}
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
        />
        {similar.length > 0 && (
          <div className={styles.collision}>
            <div className={styles.colHead}>
              {t("communities:start.why.collisionHead")}
            </div>
            {similar.map((c) => (
              <div key={c.slug ?? c.name} className={styles.colMatch}>
                <span className={`${styles.trAv} ${styles.tintFacePlum}`}>
                  {initialsOf(c.name)}
                </span>
                <span className={styles.cmInfo}>
                  <b>{c.name}</b>
                  <span>{c.typeLabel}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="sc-purpose">
          {t("communities:start.why.purposeLabel")}{" "}
          <span className={styles.req}>*</span>
        </label>
        <textarea
          id="sc-purpose"
          className={styles.textarea}
          placeholder={t("communities:start.why.purposePlaceholder")}
          value={draft.purpose}
          onChange={(e) => set({ purpose: e.target.value })}
        />
        <span className={styles.hint}>
          {t("communities:start.why.purposeHint")}
        </span>
      </div>

      <div className={styles.field}>
        <label>
          {t("communities:start.why.kindLabel")}{" "}
          <span className={styles.req}>*</span>
        </label>
        <div className={styles.chipRow}>
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.type}
              type="button"
              className={[
                styles.chip,
                draft.type === c.type && styles.chipActive,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={draft.type === c.type}
              onClick={() => set({ type: c.type })}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Chapter 2 — Who: the people this space is meant to hold. */
export function StepWho({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  return (
    <div>
      <div className={styles.field}>
        <label htmlFor="sc-whofor">
          {t("communities:start.who.label")}{" "}
          <span className={styles.req}>*</span>
        </label>
        <textarea
          id="sc-whofor"
          className={styles.textarea}
          placeholder={t("communities:start.who.placeholder")}
          value={draft.whoFor}
          onChange={(e) => set({ whoFor: e.target.value })}
        />
        <span className={styles.hint}>
          <Translation
            i18nKey="communities:start.who.hint"
            components={{ em: <em /> }}
          />
        </span>
      </div>
    </div>
  );
}
