import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminGovernanceCouncilRow } from "./AdminGovernanceCouncilRow";
import { AdminGovernanceGridRow } from "./AdminGovernanceGridRow";
import { AdminGovernanceSectionCard } from "./AdminGovernanceSectionCard";
import {
  AdminGovernanceCouncilMemberCell,
  NO_SEAT_HOLDER,
} from "./AdminGovernanceCouncilMemberCell";
import { useCouncilCandidates } from "./api/useAdminGovernanceOverview";
import {
  COUNCIL_TINTS,
  councilRowLabel,
  EMPTY_AUTHORED_TEXT,
  SEEDED_COUNCIL_ROLE_KEYS,
} from "./adminGovernanceOverviewRows.utils";
import {
  isPolicyRowChanged,
  type PolicyEditorProps,
} from "./adminGovernancePolicySection.utils";
import { useOverviewRowReorder } from "./useOverviewRowReorder";
import type { CouncilSeatDTO } from "./api/adminGovernanceOverview.api";

// Three columns now the name and initials pair collapsed into one picker: the
// seat-holder, their role, and the monogram colour.
const GRID_COLUMNS = "minmax(0, 1.35fr) minmax(0, 1.3fr) minmax(0, 1.05fr)";

/** A seat added but not yet filled. The save bar refuses it. */
const EMPTY_SEAT = { memberId: NO_SEAT_HOLDER, member: null } as const;

/** PRD-265. Who sits on the advisory council, and in what order members meet
 *  them. */
export function AdminGovernanceCouncilEditor({
  rows,
  publishedRows,
  setRows,
  meta,
  isActive,
  isChanged,
}: PolicyEditorProps<CouncilSeatDTO>) {
  const { t } = useTranslation();
  const { data: candidates } = useCouncilCandidates();
  const { containerRef, rowProps, announcement } = useOverviewRowReorder(
    rows,
    setRows,
  );
  // Passed down whole rather than per-row so each select can leave out the
  // people already sitting elsewhere on this council.
  const seatedMemberIds = rows.map((row) => row.memberId).filter(Boolean);

  const patch = (index: number, partial: Partial<CouncilSeatDTO>): void => {
    setRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...partial } : row,
      ),
    );
  };

  // The four bundle role descriptors describe the four people who were on the
  // council when the page shipped, so a fifth seat gets an authored role rather
  // than reusing one of them and being misdescribed.
  const availableRoleKeys = SEEDED_COUNCIL_ROLE_KEYS.filter(
    (key) => !rows.some((row) => row.roleKey === key),
  );

  const columnLabels = {
    member: t("admin:governance.overview.council.field.member"),
    role: t("admin:governance.overview.council.field.role"),
    tint: t("admin:governance.overview.council.field.tint"),
  };

  return (
    <AdminGovernanceSectionCard
      sectionId="council"
      title={
        <Translation
          i18nKey="admin:governance.overview.council.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("admin:governance.overview.council.sub")}
      columns={[columnLabels.member, columnLabels.role, columnLabels.tint]}
      gridColumns={GRID_COLUMNS}
      meta={meta}
      isActive={isActive}
      isChanged={isChanged}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setRows((previous) => [
                ...previous,
                {
                  ...EMPTY_SEAT,
                  role: EMPTY_AUTHORED_TEXT,
                  tint: COUNCIL_TINTS[0],
                },
              ])
            }
          >
            {t("admin:governance.overview.council.addSeat")}
          </Button>
          {availableRoleKeys.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const nextKey = availableRoleKeys[0];
                if (!nextKey) return;
                setRows((previous) => [
                  ...previous,
                  {
                    ...EMPTY_SEAT,
                    roleKey: nextKey,
                    tint: COUNCIL_TINTS[0],
                  },
                ]);
              }}
            >
              {t("admin:governance.overview.edit.restoreSeeded")}
            </Button>
          )}
        </>
      }
    >
      <div ref={containerRef}>
        {rows.map((row, index) => (
          // Index-keyed: a list mixing seeded and authored seats has no field
          // that is unique across both.
          <AdminGovernanceGridRow
            key={index}
            {...rowProps(index, councilRowLabel(row, t))}
            ordinal={index + 1}
            isChanged={isPolicyRowChanged(row, publishedRows[index])}
            onRemove={() =>
              setRows((previous) =>
                previous.filter((_, rowIndex) => rowIndex !== index),
              )
            }
            lead={
              <AdminGovernanceCouncilMemberCell
                row={row}
                seatLabel={councilRowLabel(row, t)}
                caption={columnLabels.member}
                candidates={candidates ?? []}
                seatedMemberIds={seatedMemberIds}
                onPick={(memberId) => patch(index, { memberId })}
              />
            }
          >
            <AdminGovernanceCouncilRow
              row={row}
              index={index}
              columnLabels={columnLabels}
              onPatch={(partial) => patch(index, partial)}
            />
          </AdminGovernanceGridRow>
        ))}
      </div>
      {/* Polite live region for the move buttons: a drag is visible, a button
          press is not, so the row's new position is spoken. */}
      <p className="visuallyHidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </AdminGovernanceSectionCard>
  );
}
