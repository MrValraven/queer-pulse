import { PolicySelectCell } from "./AdminGovernancePolicyCells";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  CouncilCandidateDTO,
  CouncilSeatDTO,
} from "./api/adminGovernanceOverview.api";

/** The unpicked value. A seat with this in it blocks the save. */
export const NO_SEAT_HOLDER = "";

function candidateName(candidate: CouncilCandidateDTO): string {
  return `${candidate.firstName} ${candidate.lastName}`.trim();
}

/**
 * The seat-holder cell: who sits in this seat, picked from the platform staff
 * roster.
 *
 * This used to be two free-text boxes, a name and a pair of initials, which let
 * the platform's public accountability page name anyone at all and left the
 * name frozen at whatever an admin last typed. A seat now names a staff member
 * and the reader resolves their profile, so this is a closed list.
 *
 * The list excludes everyone already seated — one person, one seat, which the
 * backend also enforces — while always keeping this seat's own holder, or the
 * select would have no value to show for the row it belongs to.
 *
 * A seat whose holder no longer resolves (a deleted account) keeps its stored
 * id and shows a "no longer on the roster" line instead of rendering blank: the
 * public page has already dropped that seat, and this row is where someone can
 * see that and put a person back in it.
 */
export function AdminGovernanceCouncilMemberCell({
  row,
  seatLabel,
  caption,
  candidates,
  seatedMemberIds,
  onPick,
}: {
  row: CouncilSeatDTO;
  /** How this row is named to a screen reader. */
  seatLabel: string;
  caption: string;
  candidates: CouncilCandidateDTO[];
  /** Every member id held by a seat in this council, this one included. */
  seatedMemberIds: string[];
  onPick: (memberId: string) => void;
}) {
  const { t } = useTranslation();

  const isSeatedElsewhere = (candidate: CouncilCandidateDTO): boolean =>
    candidate.id !== row.memberId && seatedMemberIds.includes(candidate.id);

  const options = [
    // The placeholder stays in the list only while nobody is picked, so a
    // filled seat cannot be emptied back into an unsaveable state by accident.
    ...(row.memberId
      ? []
      : [
          {
            value: NO_SEAT_HOLDER,
            label: t("admin:governance.overview.council.pickMember"),
          },
        ]),
    ...candidates
      .filter((candidate) => !isSeatedElsewhere(candidate))
      .map((candidate) => ({
        value: candidate.id,
        label: `${candidateName(candidate)} · @${candidate.slug}`,
      })),
    // A holder the roster no longer lists — they left staff, or the account is
    // gone. Kept as an option so the select has a value for this row; picking
    // anyone else replaces them, which is the point of showing it.
    ...(row.memberId &&
    !candidates.some((candidate) => candidate.id === row.memberId)
      ? [
          {
            value: row.memberId,
            label: row.member
              ? t("admin:governance.overview.council.offRoster", {
                  name: `${row.member.firstName} ${row.member.lastName}`.trim(),
                })
              : t("admin:governance.overview.council.unresolvedMember"),
          },
        ]
      : []),
  ];

  return (
    <PolicySelectCell
      caption={caption}
      ariaLabel={t("admin:governance.policy.aria.seatMember", {
        label: seatLabel,
      })}
      value={row.memberId}
      options={options}
      onChange={onPick}
    />
  );
}
