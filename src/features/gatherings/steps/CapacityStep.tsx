import { useId } from "react";
import { CheckLine, Select } from "../../../shared/components/ui";
import { useMyCommunityOptions } from "../../communities/api/useMyCommunityOptions";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AudienceScopeField } from "../AudienceScopeField";
import { LANGS } from "../createGathering.data";
import { allowedDetailKeys } from "../gatheringCatalog";
import type { GatheringForm } from "../useGatheringForm";
import { AccessibilityAnswersField } from "./AccessibilityAnswersField";
import { FormatDetailsFields } from "./FormatDetailsFields";
import { StepRequirementBadge } from "./StepRequirement";
import styles from "../CreateGatheringPage.module.css";

export function CapacityStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const myCommunityOptions = useMyCommunityOptions();
  const familyDetailKeys = allowedDetailKeys(form.family || null);
  /**
   * Whether the number on screen is still the format's own suggestion, so the
   * hint under the field is true when it says so.
   *
   * `capacityDefault` is already null once the host has touched the field, and
   * the value comparison covers the other way in: a duplicated gathering that
   * carried no capacity seeds `cap` as an empty string and never applies the
   * default, and an empty field must not be told what its number means.
   */
  const formatDefaultCapacity =
    form.capacityDefault !== null &&
    form.cap !== "" &&
    form.cap === String(form.capacityDefault)
      ? form.capacityDefault
      : null;
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step3.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step3.sub")}</p>
      <StepRequirementBadge required={false} />
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
            aria-describedby={
              formatDefaultCapacity === null ? undefined : `${fieldId}-cap-hint`
            }
            value={form.cap}
            onChange={(event) => form.setCapTouched(event.target.value)}
          />
          {/* Only while the number on screen is still the format's own
              suggestion. Once the host types anything, the hint goes: a line
              claiming a default that no longer applies is worse than none. */}
          {formatDefaultCapacity !== null && (
            <p id={`${fieldId}-cap-hint`} className={styles.hint}>
              {t("gatherings:create.step3.capDefaultHint", {
                count: formatDefaultCapacity,
              })}
            </p>
          )}
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
      {/* The format's own questions. Four of the nine families ask nothing, so
          the gate is on the family's question list rather than on the family:
          a "Format details" heading over an empty stretch of page would be a
          promise of fields that are never coming. */}
      {form.family && familyDetailKeys.length > 0 && (
        <>
          <div className={styles.label}>
            {t("gatherings:create.step3.formatDetailsLabel")}
          </div>
          <p className={styles.hint}>
            {t("gatherings:create.step3.formatDetailsHint")}
          </p>
          <FormatDetailsFields
            family={form.family}
            details={form.formatDetails}
            onChange={form.setFormatDetail}
          />
        </>
      )}
      {/* Whether the page says how many people are coming. Defaults off for
          care and support formats: a support circle whose page reads "3 going"
          tells any reader how few people are there, and turns showing up into
          being counted. */}
      <div className={styles.formatDetailCheck}>
        <CheckLine
          checked={form.showAttendeeCount}
          onChange={form.setShowAttendeeCount}
          title={t("gatherings:create.step3.attendeeCountLabel")}
          sub={t("gatherings:create.step3.attendeeCountHint")}
        />
      </div>
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
