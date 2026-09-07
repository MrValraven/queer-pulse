import {
  PolicyAuthoredCell,
  PolicySelectCell,
  PolicyStaticCell,
} from "./AdminGovernancePolicyCells";
import {
  EMPTY_AUTHORED_TEXT,
  LONG_TEXT_MAX_LENGTH,
  PRINCIPLE_ICONS,
  principleRowLabel,
  SHORT_TEXT_MAX_LENGTH,
} from "./adminGovernanceOverviewRows.utils";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PrincipleDTO } from "./api/adminGovernanceOverview.api";

/**
 * PRD-265. One principle's cells: the promise, the icon beside it, and the
 * sentence underneath.
 *
 * A seeded principle shows the words members read and offers only the icon,
 * because its EN and PT are in the bundle. An authored one carries both
 * languages of both fields.
 */
export function AdminGovernancePrincipleRow({
  row,
  index,
  columnLabels,
  onPatch,
}: {
  row: PrincipleDTO;
  index: number;
  /** The section's own column heads, so a cell caption and its head match. */
  columnLabels: { icon: string; text: string };
  onPatch: (partial: Partial<PrincipleDTO>) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <PolicySelectCell
        caption={columnLabels.icon}
        ariaLabel={t("admin:governance.policy.aria.icon", {
          label: principleRowLabel(row, t),
        })}
        value={row.icon}
        options={PRINCIPLE_ICONS.map((icon) => ({
          value: icon,
          label: t(`admin:governance.overview.principles.icon.${icon}`),
        }))}
        onChange={(icon) => onPatch({ icon })}
      />

      {row.key ? (
        <PolicyStaticCell caption={columnLabels.text} isSecondary>
          {t(`governance:principles.${row.key}.text`)}
        </PolicyStaticCell>
      ) : (
        <PolicyAuthoredCell
          idPrefix={`principle-text-${index}`}
          caption={columnLabels.text}
          label={t("admin:governance.overview.principles.field.bodyText")}
          value={row.text ?? EMPTY_AUTHORED_TEXT}
          maxLength={LONG_TEXT_MAX_LENGTH}
          isMultiline
          onChange={(text) => onPatch({ text })}
        />
      )}
    </>
  );
}

/** The first column of a principle row: the promise itself. Seeded principles
 *  show the bundle's words; authored ones are typed in both languages. */
export function AdminGovernancePrincipleLead({
  row,
  index,
  caption,
  onPatch,
}: {
  row: PrincipleDTO;
  index: number;
  caption: string;
  onPatch: (partial: Partial<PrincipleDTO>) => void;
}) {
  const { t } = useTranslation();

  if (row.key) {
    return (
      <PolicyStaticCell caption={caption}>
        {t(`governance:principles.${row.key}.title`)}
      </PolicyStaticCell>
    );
  }
  return (
    <PolicyAuthoredCell
      idPrefix={`principle-title-${index}`}
      caption={caption}
      label={t("admin:governance.overview.principles.field.titleText")}
      value={row.title ?? EMPTY_AUTHORED_TEXT}
      maxLength={SHORT_TEXT_MAX_LENGTH}
      onChange={(title) => onPatch({ title })}
    />
  );
}
