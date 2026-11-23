import {
  cloneElement,
  createElement,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { FiAlertCircle, FiCheck } from "react-icons/fi";
import {
  Avatar,
  Collapse,
  FormField,
  RadioCardGroup,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityFlairDTO } from "./api/communityBadges.api";
import {
  COMMUNITY_BADGE_ICON_LABEL_KEYS,
  COMMUNITY_BADGE_RULE_COPY,
  COMMUNITY_FLAIR_TINT_LABEL_KEYS,
} from "./communityBadgeCopy.data";
import { COMMUNITY_BADGE_ICONS } from "./communityBadgeIcons";
import {
  COMMUNITY_BADGE_ICON_KEYS,
  COMMUNITY_BADGE_RULES,
  COMMUNITY_BADGE_RULE_TYPES,
  COMMUNITY_FLAIR_TINTS,
  type CommunityBadgeIconKey,
  type CommunityBadgeRuleType,
  type CommunityFlairTint,
} from "./communityBadges.catalog";
import { CommunityFlairChip } from "./CommunityFlairChip";
import { CommunityFlairRing } from "./CommunityFlairRing";
import styles from "./ModToolsBadges.module.css";

const SWATCH_CLASS: Record<CommunityFlairTint, string> = {
  jade: styles.swatchJade!,
  accent: styles.swatchAccent!,
  plum: styles.swatchPlum!,
  rose: styles.swatchRose!,
  amber: styles.swatchAmber!,
  violet: styles.swatchViolet!,
};

interface PickerProps<Value> {
  value: Value;
  onChange: (value: Value) => void;
  /** A refusal that names this picker, shown under it and read with it. */
  error?: string | null;
}

/** The refusal line under a field or picker: an icon and the reason. It
 *  folds in and out inside the field's own column, so nothing outside the
 *  fold can clip it, and it keeps its last words while it folds away. */
function FieldError({ id, error }: { id: string; error: string | null }) {
  const [shownError, setShownError] = useState(error);
  if (error !== null && error !== shownError) setShownError(error);
  return (
    <Collapse isOpen={error !== null}>
      <p id={id} className={styles.fieldError} role="alert">
        <FiAlertCircle aria-hidden className={styles.fieldErrorIcon} />
        <span>{shownError}</span>
      </p>
    </Collapse>
  );
}

/** The accessibility props a text field hands its input. */
interface FieldControlProps {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

/**
 * A typed field of the badge form: a sentence-case label above the input and
 * one line under it, the hint until there is a refusal and then the refusal
 * with its icon, each folding in as the other folds out. The input itself is
 * the only child, so `FormField` wires the label to it.
 */
export function CommunityBadgeTextField({
  label,
  labelAside,
  hint = null,
  error,
  children,
}: {
  label: ReactNode;
  labelAside?: ReactNode;
  hint?: ReactNode;
  error: string | null;
  children: ReactElement<FieldControlProps>;
}) {
  const hintId = useId();
  const errorId = useId();
  const isShowingError = error !== null;
  const isShowingHint = hint !== null && !isShowingError;
  const control = cloneElement(children, {
    "aria-describedby": isShowingError
      ? errorId
      : isShowingHint
        ? hintId
        : undefined,
    "aria-invalid": isShowingError ? true : undefined,
  });
  return (
    <div className={styles.textField}>
      <FormField
        className={styles.formField}
        label={label}
        labelAside={labelAside}
      >
        {control}
      </FormField>
      {hint !== null && (
        <Collapse isOpen={isShowingHint}>
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        </Collapse>
      )}
      <FieldError id={errorId} error={error} />
    </div>
  );
}

/** The 24 badge icons as one radio group, six to a row (four on a phone). */
export function CommunityBadgeIconPicker({
  value,
  onChange,
  error = null,
}: PickerProps<CommunityBadgeIconKey>) {
  const { t } = useTranslation();
  const labelId = useId();
  const errorId = useId();
  return (
    <div className={styles.picker}>
      <span id={labelId} className={styles.pickerLabel}>
        {t("communities:badges.form.icon")}
      </span>
      <RadioCardGroup
        value={value}
        onChange={onChange}
        ariaLabel={t("communities:badges.form.icon")}
        ariaLabelledBy={labelId}
        ariaDescribedBy={error === null ? undefined : errorId}
        className={styles.iconGrid}
        optionClassName={styles.iconOption}
        checkedClassName={styles.optionChecked}
        options={COMMUNITY_BADGE_ICON_KEYS.map((iconKey) => ({
          id: iconKey,
          render: (
            <>
              {createElement(COMMUNITY_BADGE_ICONS[iconKey], {
                "aria-hidden": true,
              })}
              <span className="visuallyHidden">
                {t(COMMUNITY_BADGE_ICON_LABEL_KEYS[iconKey])}
              </span>
            </>
          ),
        }))}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

/** The six badge colours as swatches: the chip's ground with its ink edge. */
export function CommunityBadgeTintPicker({
  value,
  onChange,
  error = null,
}: PickerProps<CommunityFlairTint>) {
  const { t } = useTranslation();
  const labelId = useId();
  const errorId = useId();
  return (
    <div className={styles.picker}>
      <span id={labelId} className={styles.pickerLabel}>
        {t("communities:badges.form.tint")}
      </span>
      <RadioCardGroup
        value={value}
        onChange={onChange}
        ariaLabel={t("communities:badges.form.tint")}
        ariaLabelledBy={labelId}
        ariaDescribedBy={error === null ? undefined : errorId}
        className={styles.tintGrid}
        optionClassName={styles.tintOption}
        checkedClassName={styles.optionChecked}
        options={COMMUNITY_FLAIR_TINTS.map((tint) => ({
          id: tint,
          render: (
            <>
              <span
                className={`${styles.swatch} ${SWATCH_CLASS[tint]}`}
                aria-hidden="true"
              >
                {tint === value && <FiCheck />}
              </span>
              <span className={styles.tintName}>
                {t(COMMUNITY_FLAIR_TINT_LABEL_KEYS[tint])}
              </span>
            </>
          ),
        }))}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

interface RuleFieldProps {
  isRuleLocked: boolean;
  ruleType: CommunityBadgeRuleType;
  onRuleChange: (ruleType: CommunityBadgeRuleType) => void;
  threshold: string;
  onThresholdChange: (threshold: string) => void;
  /** The owner left the number field: check it now. */
  onThresholdBlur: () => void;
  thresholdError: string | null;
  isLowered: boolean;
}

/** How members earn the badge: the rule (fixed after create) and its number. */
export function CommunityBadgeRuleField({
  isRuleLocked,
  ruleType,
  onRuleChange,
  threshold,
  onThresholdChange,
  onThresholdBlur,
  thresholdError,
  isLowered,
}: RuleFieldProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const ruleCopy = COMMUNITY_BADGE_RULE_COPY[ruleType];
  const range = COMMUNITY_BADGE_RULES[ruleType];
  return (
    <div className={styles.picker}>
      <span id={labelId} className={styles.pickerLabel}>
        {t("communities:badges.form.rule")}
      </span>
      {isRuleLocked ? (
        <div className={styles.ruleLocked}>
          <span className={styles.ruleLockedName}>{t(ruleCopy.nameKey)}</span>
          <span className={styles.hint}>
            {t("communities:badges.form.ruleLocked")}
          </span>
        </div>
      ) : (
        <RadioCardGroup
          value={ruleType}
          onChange={onRuleChange}
          ariaLabel={t("communities:badges.form.rule")}
          ariaLabelledBy={labelId}
          className={styles.ruleGrid}
          optionClassName={styles.ruleOption}
          checkedClassName={styles.optionChecked}
          options={COMMUNITY_BADGE_RULE_TYPES.map((candidate) => ({
            id: candidate,
            render: t(COMMUNITY_BADGE_RULE_COPY[candidate].nameKey),
          }))}
        />
      )}
      <CommunityBadgeTextField
        label={t(ruleCopy.thresholdLabelKey)}
        hint={t("communities:badges.form.thresholdRange", {
          min: range.min,
          max: range.max,
          unit: t(ruleCopy.unitKey),
        })}
        error={thresholdError}
      >
        <input
          type="number"
          inputMode="numeric"
          min={range.min}
          max={range.max}
          step={1}
          value={threshold}
          onChange={(event) => onThresholdChange(event.target.value)}
          onBlur={onThresholdBlur}
        />
      </CommunityBadgeTextField>
      <Collapse isOpen={isLowered}>
        <p className={styles.note}>{t("communities:badges.form.lowerNote")}</p>
      </Collapse>
    </div>
  );
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => [...word][0]!.toUpperCase())
    .join("");
}

/** The badge as it sits on a name line: a ringed avatar, a name, the chip.
 *  Until the badge has a name, the chip reads the placeholder name. */
export function CommunityBadgeFormPreview({
  flair,
}: {
  flair: CommunityFlairDTO;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const previewName = t("communities:badges.form.previewName");
  const shownFlair: CommunityFlairDTO =
    flair.name === ""
      ? { ...flair, name: t("communities:badges.form.previewPlaceholder") }
      : flair;
  return (
    <section className={styles.preview} aria-labelledby={labelId}>
      <span id={labelId} className={styles.pickerLabel}>
        {t("communities:badges.form.preview")}
      </span>
      <div className={styles.previewLine} data-testid="badge-preview">
        <CommunityFlairRing tint={flair.tint}>
          <Avatar initials={initialsOf(previewName)} size={36} tint="plum" />
        </CommunityFlairRing>
        <span className={styles.previewName}>{previewName}</span>
        <CommunityFlairChip flair={shownFlair} size="md" />
      </div>
      <p className={styles.hint}>{t("communities:badges.form.previewNote")}</p>
    </section>
  );
}
