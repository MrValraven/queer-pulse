import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ImageUploadField } from "../../subprofiles/ImageUploadField";
import { TINT_OPTIONS, type TintKey } from "./startCommunity.data";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

const ORB: Record<TintKey, string> = {
  coral: styles.orbCoral!,
  jade: styles.orbJade!,
  plum: styles.orbPlum!,
};

/** Chapter 6 — Feeling: a colour and a line that capture the heart. */
export function StepFeeling({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, set, setTint, setAvatarPreviewUrl } = form;
  return (
    <div>
      <div className={styles.field}>
        <label>{t("communities:start.feeling.colourLabel")}</label>
        <div className={styles.tintRow}>
          {TINT_OPTIONS.map((tint) => (
            <button
              key={tint.key}
              type="button"
              className={[
                styles.tintSwatch,
                draft.tint === tint.key && styles.tintSelected,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={draft.tint === tint.key}
              onClick={() => setTint(tint.key)}
            >
              <span className={`${styles.tsOrb} ${ORB[tint.key]}`} />
              <span className={styles.tsLabel}>{t(tint.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label>{t("communities:start.feeling.avatarLabel")}</label>
        <ImageUploadField
          kind="community-avatar"
          circle
          size={112}
          value={draft.avatarImageUrl}
          onChange={(avatarImageUrl) => set({ avatarImageUrl })}
          // The picked image is fetchable right now; the stored key is not, so
          // the sticky card preview beside the wizard reads it from here.
          onPreviewChange={(previewUrl) => setAvatarPreviewUrl(previewUrl)}
          placeholder={draft.name || t("communities:start.feeling.avatarLabel")}
        />
        <span className={styles.hint}>
          {t("communities:start.feeling.avatarHint")}
        </span>
      </div>

      <div className={styles.field}>
        <label>{t("communities:start.feeling.coverLabel")}</label>
        <ImageUploadField
          kind="community-cover"
          value={draft.coverImageUrl}
          onChange={(coverImageUrl) => set({ coverImageUrl })}
          size={150}
          placeholder={draft.name || t("communities:start.feeling.coverLabel")}
        />
        <span className={styles.hint}>
          {t("communities:start.feeling.coverHint")}
        </span>
      </div>

      <div className={styles.field}>
        <label htmlFor="sc-tagline">
          {t("communities:start.feeling.taglineLabel")}{" "}
          <span className={styles.req}>*</span>
        </label>
        <input
          id="sc-tagline"
          type="text"
          className={styles.input}
          placeholder={t("communities:start.feeling.taglinePlaceholder")}
          value={draft.tagline}
          maxLength={90}
          onChange={(e) => set({ tagline: e.target.value })}
        />
        <span className={styles.hint}>
          {t("communities:start.feeling.taglineHint")}
        </span>
      </div>
    </div>
  );
}
