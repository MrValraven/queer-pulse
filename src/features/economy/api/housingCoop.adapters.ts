import type { CoopMeta, FormingCoop } from "../housingCoop.data";
import type { HousingCoopDTO } from "./housingCoop.api";

const PHASE_ORDINAL: Record<HousingCoopDTO["phase"], string> = {
  forming: "Phase 1",
  legal: "Phase 2",
  finance: "Phase 3",
  property: "Phase 4",
  daily: "Phase 5",
};

const PHASE_WORD: Record<HousingCoopDTO["phase"], string> = {
  forming: "forming",
  legal: "legal",
  finance: "finance",
  property: "property",
  daily: "daily",
};

const CTA_LABEL: Record<HousingCoopDTO["ctaKind"], string> = {
  join: "Ask to join",
  updates: "Read updates",
  mentor: "Request mentoring",
};

function euros(amount: number | null): string | undefined {
  if (amount === null || amount <= 0) return undefined;
  if (amount >= 1000 && amount % 1000 === 0) return `€${amount / 1000}k`;
  return `€${amount}`;
}

/** Human elapsed duration from a `YYYY-MM-DD` date to today, e.g. "2 years",
 *  "1 month", "just opened". Pure given `operationalSince` + current time. */
function operatingDuration(operationalSince: string): string {
  const start = new Date(operationalSince);
  const now = new Date();
  const months = Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()),
  );
  const years = Math.floor(months / 12);
  if (years >= 1) return years === 1 ? "1 year" : `${years} years`;
  if (months >= 1) return months === 1 ? "1 month" : `${months} months`;
  return "just opened";
}

function buildMeta(dto: HousingCoopDTO): CoopMeta[] {
  const meta: CoopMeta[] = [];
  const shares = euros(dto.shareAmountEuros);
  if (shares) {
    meta.push({
      label: dto.sharesAreTarget ? "Target shares" : "Member shares",
      value: shares,
    });
  }
  const monthly = euros(dto.monthlyEuros);
  if (monthly) meta.push({ label: "Monthly", value: monthly });
  if (dto.operational && dto.operationalSince) {
    meta.push({
      label: "Operating",
      value: operatingDuration(dto.operationalSince),
    });
  } else if (dto.formingSince) {
    meta.push({ label: "Forming since", value: dto.formingSince });
  }
  return meta;
}

/** Map a live `HousingCoopDTO` to the `FormingCoop` view-model the card UI
 *  renders. Composes the same plain-English display strings the demo mock
 *  (`FORMING_COOPS`) hardcodes, so live output stays visually consistent. */
export function coopDtoToFormingCoop(dto: HousingCoopDTO): FormingCoop {
  return {
    id: dto.slug,
    name: dto.name,
    nameEm: dto.nameEm ?? undefined,
    location: `${dto.area}, ${dto.city} · ${dto.householdCount} households`,
    phaseLabel: `${PHASE_ORDINAL[dto.phase]} · ${PHASE_WORD[dto.phase]}`,
    progress: dto.progress,
    progressLabel: dto.operational ? "Operational since" : `${dto.progress}%`,
    progressEm:
      dto.operational && dto.operationalSince
        ? dto.operationalSince
        : undefined,
    operational: dto.operational,
    description: dto.description,
    meta: buildMeta(dto),
    faces: dto.faces,
    cta: { label: CTA_LABEL[dto.ctaKind], kind: dto.ctaKind },
  };
}
