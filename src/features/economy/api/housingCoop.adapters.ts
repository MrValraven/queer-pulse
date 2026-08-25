import type { CoopMeta, FormingCoop } from "../housingCoop.data";
import type { HousingCoopDTO } from "./housingCoop.api";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";

/** Phase 1–5, the ordinal the card prints before the phase word. */
const PHASE_NUMBER: Record<HousingCoopDTO["phase"], number> = {
  forming: 1,
  legal: 2,
  finance: 3,
  property: 4,
  daily: 5,
};

const PHASE_WORD_KEY: Record<HousingCoopDTO["phase"], string> = {
  forming: "economy:housingCoop.card.phaseWord.forming",
  legal: "economy:housingCoop.card.phaseWord.legal",
  finance: "economy:housingCoop.card.phaseWord.finance",
  property: "economy:housingCoop.card.phaseWord.property",
  daily: "economy:housingCoop.card.phaseWord.daily",
};

const CTA_LABEL_KEY: Record<HousingCoopDTO["ctaKind"], string> = {
  join: "economy:housingCoop.card.cta.join",
  updates: "economy:housingCoop.card.cta.updates",
  mentor: "economy:housingCoop.card.cta.mentor",
};

/**
 * Share/monthly figures, rounded and compacted the way the card wants them
 * ("€12K", "€800"). `notation: "compact"` is what makes this locale-correct:
 * pt-PT writes "12 mil €" with the symbol suffixed, so the old hand-rolled
 * `€${amount / 1000}k` was only ever right in English.
 */
function euros(amount: number | null, fmt: Formatters): string | undefined {
  if (amount === null || amount <= 0) return undefined;
  return fmt.currency(amount, "EUR", {
    notation: amount >= 1000 && amount % 1000 === 0 ? "compact" : "standard",
    maximumFractionDigits: 0,
  });
}

/** Human elapsed duration from a `YYYY-MM-DD` date to today, e.g. "2 years",
 *  "1 month", "just opened". Pure given `operationalSince` + current time. */
function operatingDuration(operationalSince: string, t: TFunction): string {
  const start = new Date(operationalSince);
  const now = new Date();
  const months = Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth()),
  );
  const years = Math.floor(months / 12);
  if (years >= 1)
    return t("economy:housingCoop.card.duration.years", { count: years });
  if (months >= 1)
    return t("economy:housingCoop.card.duration.months", { count: months });
  return t("economy:housingCoop.card.duration.justOpened");
}

function buildMeta(
  dto: HousingCoopDTO,
  t: TFunction,
  fmt: Formatters,
): CoopMeta[] {
  const meta: CoopMeta[] = [];
  const shares = euros(dto.shareAmountEuros, fmt);
  if (shares) {
    meta.push({
      label: t(
        dto.sharesAreTarget
          ? "economy:housingCoop.card.meta.targetShares"
          : "economy:housingCoop.card.meta.memberShares",
      ),
      value: shares,
    });
  }
  const monthly = euros(dto.monthlyEuros, fmt);
  if (monthly)
    meta.push({
      label: t("economy:housingCoop.card.meta.monthly"),
      value: monthly,
    });
  if (dto.operational && dto.operationalSince) {
    meta.push({
      label: t("economy:housingCoop.card.meta.operating"),
      value: operatingDuration(dto.operationalSince, t),
    });
  } else if (dto.formingSince) {
    meta.push({
      label: t("economy:housingCoop.card.meta.formingSince"),
      value: dto.formingSince,
    });
  }
  return meta;
}

/**
 * Map a live `HousingCoopDTO` to the `FormingCoop` view-model the card UI
 * renders.
 *
 * i18n: every phrase composed here (the phase line, the meta labels, the CTA,
 * the elapsed-time line) is chrome, so it resolves through `t`; the money and
 * the progress percentage go through `fmt`. Only the co-op's own `name`,
 * `description` and `formingSince` pass through as typed.
 */
export function coopDtoToFormingCoop(
  dto: HousingCoopDTO,
  t: TFunction,
  fmt: Formatters,
): FormingCoop {
  return {
    id: dto.slug,
    name: dto.name,
    nameEm: dto.nameEm ?? undefined,
    location: t("economy:housingCoop.card.location", {
      area: dto.area,
      city: dto.city,
      count: dto.householdCount,
    }),
    phaseLabel: t("economy:housingCoop.card.phaseLabel", {
      number: PHASE_NUMBER[dto.phase],
      phase: t(PHASE_WORD_KEY[dto.phase]),
    }),
    progress: dto.progress,
    progressLabel: dto.operational
      ? t("economy:housingCoop.card.operationalSince")
      : fmt.number(dto.progress / 100, { style: "percent" }),
    progressEm:
      dto.operational && dto.operationalSince
        ? dto.operationalSince
        : undefined,
    operational: dto.operational,
    operatorVerified: dto.operatorVerified,
    description: dto.description,
    meta: buildMeta(dto, t, fmt),
    faces: dto.faces,
    cta: { label: t(CTA_LABEL_KEY[dto.ctaKind]), kind: dto.ctaKind },
  };
}
