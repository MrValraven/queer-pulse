import { useId } from "react";
import { Select } from "../../../shared/components/ui";
import { useMyCommunityOptions } from "../../communities/api/useMyCommunityOptions";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AudienceScopeField } from "../AudienceScopeField";
import { LANGS } from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
import { AccessibilityAnswersField } from "./AccessibilityAnswersField";
import styles from "../CreateGatheringPage.module.css";

export function CapacityStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const myCommunityOptions = useMyCommunityOptions();
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step3.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step3.sub")}</p>
      <div className={styles.row2}>
        <div>
          <label className={styles.label} htmlFor={`${fieldId}-cap`}>
            {t("gatherings:create.step3.capLabel")}
          </label>
          <input
            id={`${fieldId}-cap`}
            className={styles.input}
            type="number"
            min={2}
            max={200}
            placeholder={t("gatherings:create.step3.capPlaceholder")}
            value={form.cap}
            onChange={(e) => form.setCap(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label} htmlFor={`${fieldId}-lang`}>
            {t("gatherings:create.step3.langLabel")}
          </label>
          <Select
            id={`${fieldId}-lang`}
            options={LANGS.map((lang) => ({
              value: lang.value,
              label: t(lang.labelKey),
            }))}
            value={form.lang}
            onChange={(value) => form.setLang(value ?? "")}
          />
        </div>
      </div>
      <label className={styles.label} htmlFor={`${fieldId}-cost`}>
        {t("gatherings:create.step3.costLabel")}
      </label>
      <p className={styles.hint}>{t("gatherings:create.step3.costHint")}</p>
      <input
        id={`${fieldId}-cost`}
        className={styles.input}
        type="text"
        maxLength={120}
        placeholder={t("gatherings:create.step3.costPlaceholder")}
        value={form.cost}
        onChange={(event) => form.setCost(event.target.value)}
      />
      <div className={styles.label} id={`${fieldId}-access-label`}>
        {t("gatherings:create.step3.accessLabel")}
      </div>
      <p className={styles.hint}>{t("gatherings:create.step3.accessHint")}</p>
      <AccessibilityAnswersField
        answers={form.accessibilityAnswers}
        onAnswer={form.setAccessibilityAnswer}
      />
      <label className={styles.label} htmlFor={`${fieldId}-notes`}>
        {t("gatherings:create.step3.notesLabel")}
      </label>
      <input
        id={`${fieldId}-notes`}
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step3.notesPlaceholder")}
        value={form.accessNotes}
        onChange={(e) => form.setAccessNotes(e.target.value)}
      />
      {myCommunityOptions.length > 0 && (
        <>
          <label className={styles.label} htmlFor={`${fieldId}-community`}>
            {t("gatherings:create.step3.communityLabel")}
          </label>
          <Select
            id={`${fieldId}-community`}
            options={[
              {
                value: "",
                label: t("gatherings:create.step3.communityNone"),
              },
              ...myCommunityOptions.map((community) => ({
                value: community.slug,
                label: community.name,
              })),
            ]}
            value={form.communitySlug}
            onChange={(value) => form.setCommunitySlug(value ?? "")}
          />
        </>
      )}
      <AudienceScopeField
        fieldId={`${fieldId}-audience`}
        value={form.audienceScope}
        onChange={form.setAudienceScope}
        communityAvailable={form.communitySlug !== ""}
      />
    </div>
  );
}
