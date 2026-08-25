import { Avatar } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { EndorserDTO } from "../api/subprofiles.api";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";
import { SkinDefList } from "./SkinDefList";
import { deriveCalendar } from "./practiceAvailability";
import { useWeekdayLetters } from "../useWeekdayLetters";

/** Practice skin (therapist): how the therapist works, one prose paragraph
 *  per entry (`skinData.approach`). `null` when the persona hasn't set any. */
export function PracticeApproach({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const approach = persona.skinData?.approach;
  if (!approach || approach.length === 0) return null;

  return (
    <div className="approach">
      <h2>{t("subprofiles:skinExtras.practice.approachTitle")}</h2>
      {approach.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

/** Practice skin (therapist): training / qualifications, most recent first
 *  (`skinData.training`). `null` when the persona hasn't listed any. */
export function PracticeTraining({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const training = persona.skinData?.training;
  if (!training || training.length === 0) return null;

  return (
    <div className="training">
      <h2>{t("subprofiles:skinExtras.practice.trainingTitle")}</h2>
      <ul>
        {training.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** Practice skin (therapist): fee breakdown rows (`skinData.feeSchedule`),
 *  shown in the sidebar. `null` when the persona hasn't set any. */
export function PracticeFees({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const feeSchedule = persona.skinData?.feeSchedule;
  if (!feeSchedule || feeSchedule.length === 0) return null;

  return (
    <div className="fees">
      <h2>{t("subprofiles:skinExtras.practice.feesTitle")}</h2>
      <SkinDefList rows={feeSchedule.map((row) => [row.label, row.value])} />
    </div>
  );
}

/** Practice skin (therapist): where they practise (`skinData.venue`) — a
 *  name plus address lines. `null` when the persona hasn't set one. */
export function PracticeVenue({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const venue = persona.skinData?.venue;
  if (!venue) return null;

  return (
    <div className="venue">
      <h2>{t("subprofiles:skinExtras.practice.venueTitle")}</h2>
      <p className="venue-name">{venue.name}</p>
      {venue.lines.map((line) => (
        <div className="venue-line" key={line}>
          {line}
        </div>
      ))}
    </div>
  );
}

/** Practice skin (therapist): a read-only 4-week availability grid, derived
 *  from `skinData.availability` via `deriveCalendar`. `null` when there's no
 *  availability data or it's malformed. */
export function PracticeAvailability({
  persona,
}: {
  persona: SkinExtrasPersona;
}) {
  const { t } = useTranslation();
  const weekdayLetters = useWeekdayLetters();
  const cal = deriveCalendar(persona.skinData?.availability);
  if (!cal) return null;

  return (
    <div className="availability">
      <h2>{t("subprofiles:skinExtras.practice.availabilityTitle")}</h2>
      <div className="av-weekdays">
        {weekdayLetters.map((letter, index) => (
          <span className="av-weekday" key={`${letter}-${index}`}>
            {letter}
          </span>
        ))}
      </div>
      <div className="av-grid">
        {cal.weeks.map((week, weekIndex) => (
          <div className="av-week" key={weekIndex}>
            {week.map((cell) => (
              <div
                className={`av-cell av-${cell.state}`}
                key={`${cell.month}-${cell.day}`}
              >
                {cell.day}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="av-legend">
        <span className="av-legend-item av-open">
          {t("subprofiles:skinExtras.practice.availabilityOpen")}
        </span>
        <span className="av-legend-item av-full">
          {t("subprofiles:skinExtras.practice.availabilityFull")}
        </span>
      </div>
      <p className="av-slot">
        {t("subprofiles:skinExtras.practice.availabilitySlot", {
          time: cal.slotTime,
        })}
      </p>
    </div>
  );
}

/** First-letters-of-first-two-words initials for an endorser avatar
 *  fallback, e.g. "Jamie Rivers" → "JR". */
function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

/** Practice skin (therapist): community endorsers, replacing the generic
 *  endorsers slot with a "vouched for" framing. `null` when there are none. */
export function PracticeVouches({ endorsers }: { endorsers: EndorserDTO[] }) {
  const { t } = useTranslation();
  if (endorsers.length === 0) return null;

  return (
    <div className="vouches">
      <h2>{t("subprofiles:skinExtras.practice.vouchesTitle")}</h2>
      {endorsers.map((endorser) => (
        <div className="vouch" key={endorser.slug}>
          <Avatar
            initials={initialsOf(endorser.name)}
            src={endorser.avatarUrl ?? undefined}
            alt={endorser.name}
            size={40}
          />
          <b>{endorser.name}</b>
          {endorser.note && <p>{endorser.note}</p>}
        </div>
      ))}
    </div>
  );
}
