import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SkinDefList } from "./SkinDefList";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** Practice `afterBio` slot: fee/session logistics (`skinData.practical`).
 *  `null` when the persona hasn't set one. */
export function PracticePractical({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const practical = persona.skinData?.practical;
  if (!practical) return null;

  const allRows: Array<[string, string]> = [
    [t("subprofiles:skinExtras.practice.fee"), practical.fee],
    [t("subprofiles:skinExtras.practice.sliding"), practical.sliding],
    [t("subprofiles:skinExtras.practice.length"), practical.length],
    [t("subprofiles:skinExtras.practice.languages"), practical.languages],
    [t("subprofiles:skinExtras.practice.mode"), practical.mode],
    [t("subprofiles:skinExtras.practice.next"), practical.next],
  ];
  const rows = allRows.filter(([, value]) => Boolean(value));
  if (rows.length === 0) return null;

  return (
    <div className="practical">
      <SkinDefList rows={rows} />
    </div>
  );
}

/** Practice `end` slot (first half): what a first session looks like
 *  (`skinData.firstSession`). `null` when the persona hasn't set any steps. */
export function PracticeFirstSession({
  persona,
}: {
  persona: SkinExtrasPersona;
}) {
  const { t } = useTranslation();
  const steps = persona.skinData?.firstSession;
  if (!steps || steps.length === 0) return null;

  return (
    <div className="firstsession">
      <h2>{t("subprofiles:skinExtras.practice.firstSessionTitle")}</h2>
      <ol>
        {steps.map((step) => (
          <li key={`${step.title}|${step.body}`}>
            <b>{step.title}</b>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Practice `end` slot (second half): accessibility notes about the space
 *  (`skinData.access`). `null` when the persona hasn't listed any. */
export function PracticeAccess({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const access = persona.skinData?.access;
  if (!access || access.length === 0) return null;

  return (
    <div className="access">
      <h2>{t("subprofiles:skinExtras.practice.accessTitle")}</h2>
      <ul>
        {access.map((line) => (
          <li key={line}>
            <FiCheck aria-hidden />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The practice skin's foot fixture: referred-by credits (`skinData.
 * referrals`) plus a fixed "we don't collect public testimonials" note — a
 * deliberate professional-boundary choice, not a placeholder. Unlike the
 * other blocks here, this ALWAYS renders content for a practice persona (it
 * isn't part of the `SubprofileSkinExtras` slot switch): the page's foot
 * swaps it in for endorsers on `skin==="practice"` — see
 * `phase1-design/structure-notes.md`'s page tree — so the disclaimer must
 * show even with zero referrals. Rendered directly by the foot (Task 5), not
 * dispatched through the slot switch.
 */
export function PracticeReferrals({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const referrals = persona.skinData?.referrals ?? [];

  return (
    <div className="referrals">
      {referrals.map((referral) => (
        <div className="ref" key={`${referral.name}|${referral.note}`}>
          <b>{referral.name}</b>
          <small>{referral.note}</small>
        </div>
      ))}
      <p className="refnote">
        {t("subprofiles:skinExtras.practice.referralsNote")}
      </p>
    </div>
  );
}
