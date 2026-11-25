import { useId, type RefObject } from "react";
import { RadioCardGroup } from "../../../shared/components/ui";
import {
  QUIZ_BADGE_DESCRIPTION_MAX_LENGTH,
  QUIZ_BADGE_NAME_MAX_LENGTH,
  QUIZ_BADGE_RARITIES,
  QUIZ_BADGE_TINTS,
  type QuizBadgeRarity,
} from "../../../shared/contracts/quizWinBadges";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CommunityBadgeIconPicker,
  CommunityBadgeTextField,
  CommunityBadgeTintPicker,
  FieldError,
} from "../../communities/badges/CommunityBadgeFormPickers";
import { RARITY_LABEL_KEY } from "../../members/badgeSelectors";
import { quizBadgeCodePointLength } from "../../quizshow/winBadges/quizWinBadgeText";
import {
  isQuizBadgeTint,
  type QuizBadgeDraft,
  type QuizBadgeFormField,
} from "./quizBadgeForm.model";
import styles from "./AdminQuizBadges.module.css";

type QuizBadgeTextField =
  "nameEn" | "namePt" | "descriptionEn" | "descriptionPt";

interface TextFieldSpec {
  field: QuizBadgeTextField;
  labelKey: string;
  maxLength: number;
  isPortuguese: boolean;
  isMultiline: boolean;
}

// English and Portuguese sit side by side above the phone breakpoint, so the
// order runs English name, Portuguese name, then the two descriptions.
const TEXT_FIELDS: readonly TextFieldSpec[] = [
  {
    field: "nameEn",
    labelKey: "quizshow:winBadges.admin.form.nameEn",
    maxLength: QUIZ_BADGE_NAME_MAX_LENGTH,
    isPortuguese: false,
    isMultiline: false,
  },
  {
    field: "namePt",
    labelKey: "quizshow:winBadges.admin.form.namePt",
    maxLength: QUIZ_BADGE_NAME_MAX_LENGTH,
    isPortuguese: true,
    isMultiline: false,
  },
  {
    field: "descriptionEn",
    labelKey: "quizshow:winBadges.admin.form.descriptionEn",
    maxLength: QUIZ_BADGE_DESCRIPTION_MAX_LENGTH,
    isPortuguese: false,
    isMultiline: true,
  },
  {
    field: "descriptionPt",
    labelKey: "quizshow:winBadges.admin.form.descriptionPt",
    maxLength: QUIZ_BADGE_DESCRIPTION_MAX_LENGTH,
    isPortuguese: true,
    isMultiline: true,
  },
];

interface AdminQuizBadgeFormFieldsProps {
  draft: QuizBadgeDraft;
  onChange: (draft: QuizBadgeDraft) => void;
  errors: Partial<Record<QuizBadgeFormField, string>>;
  /** Lands on the English name input, the form's first field. */
  nameEnRef?: RefObject<HTMLInputElement | null>;
}

/**
 * The quiz badge form's fields: the English and Portuguese name and
 * description with a code point counter each, the icon and colour pickers
 * shared with community badges, and the rarity. A refusal shows under the
 * field it names.
 */
export function AdminQuizBadgeFormFields({
  draft,
  onChange,
  errors,
  nameEnRef,
}: AdminQuizBadgeFormFieldsProps) {
  const { t } = useTranslation();
  const rarityLabelId = useId();
  const rarityErrorId = useId();
  const rarityError = errors.rarity ?? null;

  return (
    <div className={styles.fields}>
      {TEXT_FIELDS.map((spec) => {
        const value = draft[spec.field];
        // Clamped in code points, as the server counts, so an emoji is one.
        const changeText = (text: string) =>
          onChange({
            ...draft,
            [spec.field]: Array.from(text).slice(0, spec.maxLength).join(""),
          });
        return (
          <CommunityBadgeTextField
            key={spec.field}
            label={t(spec.labelKey)}
            labelAside={t("quizshow:winBadges.admin.form.counter", {
              count: quizBadgeCodePointLength(value),
              max: spec.maxLength,
            })}
            hint={
              spec.isPortuguese
                ? t("quizshow:winBadges.admin.form.ptHint")
                : null
            }
            error={errors[spec.field] ?? null}
          >
            {spec.isMultiline ? (
              <textarea
                rows={3}
                value={value}
                onChange={(event) => changeText(event.target.value)}
              />
            ) : (
              <input
                ref={spec.field === "nameEn" ? nameEnRef : undefined}
                type="text"
                value={value}
                onChange={(event) => changeText(event.target.value)}
              />
            )}
          </CommunityBadgeTextField>
        );
      })}
      <div className={styles.fieldWide}>
        <CommunityBadgeIconPicker
          label={t("quizshow:winBadges.admin.form.icon")}
          value={draft.iconKey}
          onChange={(iconKey) => onChange({ ...draft, iconKey })}
          error={errors.iconKey ?? null}
        />
      </div>
      <div className={styles.fieldWide}>
        <CommunityBadgeTintPicker
          label={t("quizshow:winBadges.admin.form.tint")}
          tints={QUIZ_BADGE_TINTS}
          value={draft.tint}
          onChange={(tint) => {
            if (isQuizBadgeTint(tint)) onChange({ ...draft, tint });
          }}
          error={errors.tint ?? null}
        />
      </div>
      <div className={`${styles.fieldWide} ${styles.rarity}`}>
        <span id={rarityLabelId} className={styles.fieldLabel}>
          {t("quizshow:winBadges.admin.form.rarity")}
        </span>
        <RadioCardGroup<QuizBadgeRarity>
          value={draft.rarity}
          onChange={(rarity) => onChange({ ...draft, rarity })}
          ariaLabel={t("quizshow:winBadges.admin.form.rarity")}
          ariaLabelledBy={rarityLabelId}
          ariaDescribedBy={rarityError === null ? undefined : rarityErrorId}
          className={styles.rarityGrid}
          optionClassName={styles.rarityOption}
          checkedClassName={styles.rarityChecked}
          options={QUIZ_BADGE_RARITIES.map((rarity) => ({
            id: rarity,
            render: t(RARITY_LABEL_KEY[rarity]),
          }))}
        />
        <FieldError id={rarityErrorId} error={rarityError} />
      </div>
    </div>
  );
}
