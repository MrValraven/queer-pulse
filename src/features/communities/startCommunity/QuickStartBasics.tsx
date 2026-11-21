import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CATEGORY_OPTIONS } from "./startCommunity.data";
import type { CommunityForm } from "./useCommunityForm";
import pageStyles from "./StartCommunityPage.module.css";
import styles from "./QuickStartCommunity.module.css";

/** Quick step one: the name, the kind of space and the tagline. */
export function QuickStepName({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  return (
    <div>
      <div className={pageStyles.field}>
        <label htmlFor="quick-start-name">
          {t("communities:start.quick.name.label")}{" "}
          <span className={pageStyles.req}>*</span>
        </label>
        <input
          id="quick-start-name"
          type="text"
          className={pageStyles.input}
          placeholder={t("communities:start.why.namePlaceholder")}
          value={draft.name}
          onChange={(event) => set({ name: event.target.value })}
        />
      </div>

      <div className={pageStyles.field}>
        <span id="quick-start-kind-label" className={styles.groupLabel}>
          {t("communities:start.why.kindLabel")}{" "}
          <span className={pageStyles.req}>*</span>
        </span>
        {/* Picking a category sets only the type: the quick flow opens with
            no tags, so adding them stays the founder's own choice. */}
        <div
          className={pageStyles.chipRow}
          role="group"
          aria-labelledby="quick-start-kind-label"
        >
          {CATEGORY_OPTIONS.map((category) => {
            const isPicked = draft.type === category.type;
            return (
              <button
                key={category.type}
                type="button"
                className={[
                  pageStyles.chip,
                  styles.categoryChip,
                  isPicked && pageStyles.chipActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={isPicked}
                onClick={() => set({ type: category.type })}
              >
                {t(category.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div className={pageStyles.field}>
        <label htmlFor="quick-start-tagline">
          {t("communities:start.feeling.taglineLabel")}{" "}
          <span className={pageStyles.req}>*</span>
        </label>
        <input
          id="quick-start-tagline"
          type="text"
          className={pageStyles.input}
          placeholder={t("communities:start.feeling.taglinePlaceholder")}
          value={draft.tagline}
          maxLength={90}
          onChange={(event) => set({ tagline: event.target.value })}
        />
      </div>
    </div>
  );
}

/** Quick step two: what the community is for and who it is for. */
export function QuickStepWho({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  return (
    <div>
      <div className={pageStyles.field}>
        <label htmlFor="quick-start-purpose">
          {t("communities:start.why.purposeLabel")}{" "}
          <span className={pageStyles.req}>*</span>
        </label>
        <textarea
          id="quick-start-purpose"
          className={pageStyles.textarea}
          placeholder={t("communities:start.why.purposePlaceholder")}
          value={draft.purpose}
          onChange={(event) => set({ purpose: event.target.value })}
        />
      </div>

      <div className={pageStyles.field}>
        <label htmlFor="quick-start-who-for">
          {t("communities:start.who.label")}{" "}
          <span className={pageStyles.req}>*</span>
        </label>
        <textarea
          id="quick-start-who-for"
          className={pageStyles.textarea}
          placeholder={t("communities:start.who.placeholder")}
          value={draft.whoFor}
          onChange={(event) => set({ whoFor: event.target.value })}
        />
      </div>
    </div>
  );
}
