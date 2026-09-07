import { FiArrowUp } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import {
  authoredGovernanceText,
  resolveGovernanceText,
  seededGovernanceText,
  type GovernanceText,
} from "../governance/governanceText";
import {
  COUNCIL_TINT_BY_KEY,
  principleIcon,
} from "../governance/governanceIcons";
import { initialsOf } from "../../shared/api/refs";
import { trendTakesCount } from "./adminGovernanceHealthFields.utils";
import type { PolicyDraft } from "./adminGovernancePolicyDraft";
import styles from "./AdminGovernancePolicy.module.css";

/**
 * The five sections of the public Governance page, drawn from the draft.
 *
 * Each renders through the SAME helpers the real page uses — the public
 * `governance:` strings rather than the admin dropdown labels, and
 * `resolveGovernanceText` for the seeded-versus-authored split — so the preview
 * can only be wrong in the ways the page itself is wrong. An admin label
 * leaking in here would make it a plausible liar, which is worse than no
 * preview at all.
 */

/** Resolves one piece of governance prose in the console's active language. */
function usePreviewText(): (text: GovernanceText | null) => string {
  const { t, language } = useTranslation();
  return (text) => (text ? resolveGovernanceText(text, t, language) : "");
}

function PreviewHeading({
  eyebrowKey,
  titleKey,
}: {
  eyebrowKey: string;
  titleKey: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      <p className={styles.pageEyebrow}>{t(eyebrowKey)}</p>
      <h3 className={styles.pageTitle}>
        <Translation i18nKey={titleKey} components={{ em: <em /> }} />
      </h3>
    </>
  );
}

/** What members would meet where a section has been emptied. A blank space
 *  cannot show this, and an emptied section is exactly what an editor most
 *  needs to see before saving. */
function PreviewEmpty() {
  const { t } = useTranslation();
  return (
    <p className={styles.pageEmpty}>
      {t("admin:governance.policy.preview.emptySection")}
    </p>
  );
}

export function PreviewHealth({ rows }: { rows: PolicyDraft["health"] }) {
  const { t } = useTranslation();
  return (
    <>
      <PreviewHeading
        eyebrowKey="governance:sections.health.eyebrow"
        titleKey="governance:sections.health.title"
      />
      {rows.length === 0 ? (
        <PreviewEmpty />
      ) : (
        <div className={styles.pageStats}>
          {rows.map((stat) => (
            <div key={stat.key} className={styles.pageStat}>
              <div className={styles.pageStatFigure}>
                {stat.n || t("admin:governance.policy.diff.empty")}
              </div>
              <div className={styles.pageStatLabel}>
                {t(`governance:health.stat.${stat.key}.label`)}
              </div>
              <div
                className={[
                  styles.pageStatTrend,
                  stat.up && styles.pageStatTrendUp,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {stat.up && <FiArrowUp />}
                {publicTrendLine(t, stat.trendKey, stat.trendCount)}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className={styles.pageParagraph}>
        {t("governance:sections.health.prose1")}
      </p>
    </>
  );
}

export function PreviewSteps({
  rows,
}: {
  rows: PolicyDraft["moderationSteps"];
}) {
  const { t } = useTranslation();
  return (
    <>
      <PreviewHeading
        eyebrowKey="governance:sections.moderation.eyebrow"
        titleKey="governance:sections.moderation.title"
      />
      <p className={styles.pageParagraph}>
        {t("governance:sections.moderation.intro")}
      </p>
      {rows.length === 0 ? (
        <PreviewEmpty />
      ) : (
        <div className={styles.pageSteps}>
          {rows.map((step, index) => (
            <div key={step.key} className={styles.pageStep}>
              <div className={styles.pageStepNumber}>{index + 1}</div>
              <div>
                <div className={styles.pageStepTitle}>
                  {t(`governance:steps.${step.key}.title`)}
                </div>
                <div className={styles.pageStepText}>
                  {t(`governance:steps.${step.key}.text`)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function PreviewCouncil({ rows }: { rows: PolicyDraft["council"] }) {
  const { t } = useTranslation();
  const text = usePreviewText();
  return (
    <>
      <PreviewHeading
        eyebrowKey="governance:sections.council.eyebrow"
        titleKey="governance:sections.council.title"
      />
      <p className={styles.pageParagraph}>
        {t("governance:sections.council.intro")}
      </p>
      {rows.length === 0 ? (
        <PreviewEmpty />
      ) : (
        <div className={styles.pageCouncil}>
          {rows.map((seat, index) => (
            <div key={`${seat.memberId}-${index}`} className={styles.pageSeat}>
              <div
                className={styles.pageSeatAvatar}
                style={
                  COUNCIL_TINT_BY_KEY[seat.tint] ?? COUNCIL_TINT_BY_KEY.plum
                }
              >
                {/* The public page draws the seat-holder's photo where there
                    is one; this preview always draws the monogram, which is
                    what that page falls back to and the only part of the
                    avatar an editor controls from here. */}
                {seat.member
                  ? initialsOf(seat.member.firstName, seat.member.lastName)
                  : "··"}
              </div>
              <div>
                <div className={styles.pageSeatName}>
                  {seat.member
                    ? `${seat.member.firstName} ${seat.member.lastName}`.trim()
                    : t("admin:governance.overview.council.newSeat")}
                </div>
                <div className={styles.pageSeatRole}>
                  {text(
                    seat.roleKey
                      ? seededGovernanceText(
                          `governance:council.${seat.roleKey}`,
                        )
                      : authoredGovernanceText(seat.role),
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function PreviewPrinciples({
  rows,
}: {
  rows: PolicyDraft["principles"];
}) {
  const { t } = useTranslation();
  const text = usePreviewText();
  return (
    <>
      <PreviewHeading
        eyebrowKey="governance:sections.principles.eyebrow"
        titleKey="governance:sections.principles.title"
      />
      {rows.length === 0 ? (
        <PreviewEmpty />
      ) : (
        <div className={styles.pagePrinciples}>
          {rows.map((principle, index) => {
            const Icon = principleIcon(principle.icon);
            return (
              <div
                key={principle.key ?? `authored-${index}`}
                className={styles.pagePrinciple}
              >
                <span className={styles.pagePrincipleIcon}>
                  <Icon />
                </span>
                <div>
                  <div className={styles.pagePrincipleTitle}>
                    {text(
                      principle.key
                        ? seededGovernanceText(
                            `governance:principles.${principle.key}.title`,
                          )
                        : authoredGovernanceText(principle.title),
                    ) || t("admin:governance.overview.principles.newEntry")}
                  </div>
                  <div className={styles.pagePrincipleText}>
                    {text(
                      principle.key
                        ? seededGovernanceText(
                            `governance:principles.${principle.key}.text`,
                          )
                        : authoredGovernanceText(principle.text),
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export function PreviewDecisions({ rows }: { rows: PolicyDraft["decisions"] }) {
  const { t } = useTranslation();
  const text = usePreviewText();
  return (
    <>
      <PreviewHeading
        eyebrowKey="governance:sections.decisions.eyebrow"
        titleKey="governance:sections.decisions.title"
      />
      {rows.length === 0 ? (
        <PreviewEmpty />
      ) : (
        <div className={styles.pageDecisions}>
          {rows.map((decision, index) => (
            <p
              key={decision.key ?? `authored-${index}`}
              className={styles.pageDecision}
            >
              <strong>
                {text(
                  decision.key
                    ? seededGovernanceText(
                        `governance:decisions.${decision.key}.lead`,
                      )
                    : authoredGovernanceText(decision.lead),
                ) || t("admin:governance.overview.decisions.newEntry")}
              </strong>{" "}
              {text(
                decision.key
                  ? seededGovernanceText(
                      `governance:decisions.${decision.key}.body`,
                    )
                  : authoredGovernanceText(decision.body),
              )}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

/**
 * The trend sentence members actually read, not the admin dropdown label.
 *
 * A count-taking line with no number yet renders the admin label rather than a
 * guessed zero: "0 this quarter" is a claim about the community, and the
 * preview must not make one the editor did not.
 */
function publicTrendLine(
  t: ReturnType<typeof useTranslation>["t"],
  trendKey: string,
  trendCount: number | undefined,
): string {
  const needsCount = trendTakesCount(trendKey);
  if (needsCount && trendCount === undefined) {
    return t(`admin:governance.overview.health.trend.${trendKey}`);
  }
  return t(
    `governance:health.trend.${trendKey}`,
    needsCount ? { count: trendCount } : undefined,
  );
}
