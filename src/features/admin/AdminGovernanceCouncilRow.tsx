import {
  PolicyAuthoredCell,
  PolicySelectCell,
  PolicyStaticCell,
} from "./AdminGovernancePolicyCells";
import {
  COUNCIL_TINTS,
  EMPTY_AUTHORED_TEXT,
  SHORT_TEXT_MAX_LENGTH,
} from "./adminGovernanceOverviewRows.utils";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CouncilSeatDTO } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePolicy.module.css";

const TINT_SWATCH_CLASS: Record<string, string> = {
  jade: styles.tintJade!,
  violet: styles.tintViolet!,
  plum: styles.tintPlum!,
};

/**
 * PRD-265. The cells of one advisory-council seat after the seat-holder: the
 * role, and the colour of the monogram the public page falls back to when that
 * person shows no photo.
 *
 * There is no initials field: the monogram is derived from the name of the
 * member in the seat, so the two cannot disagree.
 *
 * A seat whose role shipped in the bundle shows that role and nothing to type;
 * a seat added afterwards carries the editor's own English and Portuguese,
 * stacked, because the backend requires both and there is no later moment at
 * which the Portuguese would be got.
 */
export function AdminGovernanceCouncilRow({
  row,
  index,
  columnLabels,
  onPatch,
}: {
  row: CouncilSeatDTO;
  index: number;
  /** The section's own column heads, so a cell caption and its head match. */
  columnLabels: { role: string; tint: string };
  onPatch: (partial: Partial<CouncilSeatDTO>) => void;
}) {
  const { t } = useTranslation();
  const seatName = row.member
    ? `${row.member.firstName} ${row.member.lastName}`.trim()
    : t("admin:governance.overview.council.newSeat");

  return (
    <>
      {row.roleKey ? (
        <PolicyStaticCell caption={columnLabels.role} isSecondary>
          {t(`governance:council.${row.roleKey}`)}
        </PolicyStaticCell>
      ) : (
        <PolicyAuthoredCell
          idPrefix={`council-role-${index}`}
          caption={columnLabels.role}
          label={t("admin:governance.overview.council.field.role")}
          value={row.role ?? EMPTY_AUTHORED_TEXT}
          maxLength={SHORT_TEXT_MAX_LENGTH}
          onChange={(role) => onPatch({ role })}
        />
      )}

      <PolicySelectCell
        caption={columnLabels.tint}
        ariaLabel={t("admin:governance.policy.aria.tint", { label: seatName })}
        value={row.tint}
        options={COUNCIL_TINTS.map((tint) => ({
          value: tint,
          label: t(`admin:governance.overview.council.tint.${tint}`),
        }))}
        onChange={(tint) => onPatch({ tint: tint as CouncilSeatDTO["tint"] })}
      >
        <span
          className={[
            styles.tintSwatch,
            TINT_SWATCH_CLASS[row.tint] ?? TINT_SWATCH_CLASS.plum,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />
      </PolicySelectCell>
    </>
  );
}
