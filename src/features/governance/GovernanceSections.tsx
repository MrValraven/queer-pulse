import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiArrowUp } from "react-icons/fi";
import {
  Button,
  Reveal,
  Select,
  SkeletonLine,
} from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useGovernanceOverview } from "./api/useGovernanceOverview";
import { submitConcern, type ConcernCategory } from "./api/governance.api";
import { ConcernSubmittedPanel } from "./ConcernSubmittedPanel";
import { CouncilSeatAvatar } from "./CouncilSeatAvatar";
import { CONCERN_OPTIONS } from "./governance.data";
import { resolveGovernanceText } from "./governanceText";
import styles from "./GovernancePage.module.css";

/**
 * Distinct error/retry state for a governance section. Rendered in place of a
 * section's figures/list when its live fetch fails, so an API error surfaces as
 * "we couldn't load this — try again" instead of a silently-empty grid.
 */
export function SectionError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.sectionError} role="alert">
      <p>{t("governance:error.body")}</p>
      <Button variant="ghost" size="md" onClick={onRetry}>
        {t("governance:error.retry")}
      </Button>
    </div>
  );
}

/**
 * PRD-448. The "Community health" tiles. The backend serves them only once the
 * governance team has saved this section on the admin Policy tab; until then
 * the list is empty and the section keeps its heading (the side nav links
 * here) with one line saying the first report is still to come. The fixed
 * quarter and the fixed paragraph about that quarter's reports are gone: the
 * only figures here are the ones the tiles carry.
 *
 * The empty list comes from the backend, so this take-down needs the backend
 * that ships with it: against an older backend the seeded tiles still arrive
 * and render.
 */
export function HealthSection() {
  const { t } = useTranslation();
  const { health, loading, error, retry } = useGovernanceOverview();
  const isEmpty = !loading && !error && health.length === 0;
  return (
    <Reveal as="section" className={styles.section} id="health">
      <div className={styles.eye}>
        {t("governance:sections.health.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.health.title"
          components={{ em: <em /> }}
        />
      </h2>
      {error ? (
        <SectionError onRetry={retry} />
      ) : isEmpty ? (
        <p className={styles.acEmpty}>
          {t("governance:sections.health.notPublished")}
        </p>
      ) : (
        <div className={styles.statGrid}>
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={styles.statCard} aria-hidden>
                  <SkeletonLine width="50%" height={26} />
                  <SkeletonLine
                    width="80%"
                    height={13}
                    style={{ marginTop: 8 }}
                  />
                </div>
              ))
            : health.map((stat) => (
                <div key={stat.labelKey} className={styles.statCard}>
                  <div className={styles.statN}>{stat.value}</div>
                  <div className={styles.statL}>{t(stat.labelKey)}</div>
                  <div
                    className={[
                      styles.statTrend,
                      stat.up ? styles.trendUp : styles.trendOk,
                    ].join(" ")}
                  >
                    {stat.up && (
                      <>
                        <span className="visuallyHidden">
                          {t("governance:health.trend.upDirection")}{" "}
                        </span>
                        <FiArrowUp aria-hidden />
                      </>
                    )}
                    {t(stat.trendKey, stat.trendValues)}
                  </div>
                </div>
              ))}
        </div>
      )}
    </Reveal>
  );
}

export function ModerationSection() {
  const { t } = useTranslation();
  const { moderationSteps, error, retry } = useGovernanceOverview();
  return (
    <Reveal as="section" className={styles.section} id="moderation">
      <div className={styles.eye}>
        {t("governance:sections.moderation.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.moderation.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        <p>{t("governance:sections.moderation.intro")}</p>
      </div>
      {error && <SectionError onRetry={retry} />}
      <div className={styles.steps}>
        {moderationSteps.map((step, index) => (
          <div key={step.titleKey} className={styles.step}>
            <div className={styles.stepNum}>{index + 1}</div>
            <div>
              <div className={styles.stepTitle}>{t(step.titleKey)}</div>
              <div className={styles.stepText}>{t(step.textKey)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.prose} style={{ marginTop: 16 }}>
        <p>
          <strong>
            {t("governance:sections.moderation.wontTolerate.label")}
          </strong>{" "}
          {t("governance:sections.moderation.wontTolerate.text")}
        </p>
        {/* The figures behind this section. The steps above describe the
            process; the report says what the process actually did. */}
        <p>
          <Translation
            i18nKey="governance:sections.moderation.transparencyLink"
            components={{ a: <Link to={routes.transparencyReport} /> }}
          />
        </p>
      </div>
    </Reveal>
  );
}

export function CouncilSection() {
  // `language` as well as `t`: a PRD-265 authored entry carries its own EN/PT
  // rather than a key, so the active language is what picks between them.
  const { t, language } = useTranslation();
  const { loggedIn } = useAuth();
  const { council, error, retry } = useGovernanceOverview();
  return (
    <Reveal as="section" className={styles.section} id="council">
      <div className={styles.eye}>
        {t("governance:sections.council.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.council.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        <p>{t("governance:sections.council.intro")}</p>
      </div>
      {error && <SectionError onRetry={retry} />}
      {!error && council.length === 0 && (
        <p className={styles.acEmpty}>
          {t("governance:sections.council.empty")}
        </p>
      )}
      <div className={styles.acList}>
        {council.map((seat) => (
          <div key={seat.slug} className={styles.acItem}>
            <CouncilSeatAvatar seat={seat} />
            <div>
              <div className={styles.acName}>
                {/* `/members/*` is gated, so only a signed-in member is sent to
                    the profile; a signed-out visitor reads the same name with
                    nothing to click, rather than being bounced to a sign-in
                    wall by a public page. */}
                {loggedIn ? (
                  <Link to={`/members/${seat.slug}`} className={styles.acLink}>
                    {seat.name}
                  </Link>
                ) : (
                  seat.name
                )}
              </div>
              <div className={styles.acRole}>
                {resolveGovernanceText(seat.role, t, language)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

export function PrinciplesSection() {
  // `language` as well as `t`: a PRD-265 authored entry carries its own EN/PT
  // rather than a key, so the active language is what picks between them.
  const { t, language } = useTranslation();
  const { principles, error, retry } = useGovernanceOverview();
  return (
    <Reveal as="section" className={styles.section} id="principles">
      <div className={styles.eye}>
        {t("governance:sections.principles.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.principles.title"
          components={{ em: <em /> }}
        />
      </h2>
      {error && <SectionError onRetry={retry} />}
      <div className={styles.prinList}>
        {principles.map((principle) => (
          <div key={principle.id} className={styles.prinItem}>
            <span className={styles.prinIcon}>
              <principle.icon />
            </span>
            <div>
              <div className={styles.prinTitle}>
                {resolveGovernanceText(principle.title, t, language)}
              </div>
              <div className={styles.prinText}>
                {resolveGovernanceText(principle.text, t, language)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

export function DecisionsSection() {
  // `language` as well as `t`: a PRD-265 authored entry carries its own EN/PT
  // rather than a key, so the active language is what picks between them.
  const { t, language } = useTranslation();
  const { decisions, error, retry } = useGovernanceOverview();
  return (
    <Reveal as="section" className={styles.section} id="decisions">
      <div className={styles.eye}>
        {t("governance:sections.decisions.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.decisions.title"
          components={{ em: <em /> }}
        />
      </h2>
      {error && <SectionError onRetry={retry} />}
      <div className={styles.prose}>
        {decisions.map((decision) => (
          <p key={decision.id}>
            <strong>{resolveGovernanceText(decision.lead, t, language)}</strong>{" "}
            {resolveGovernanceText(decision.body, t, language)}
          </p>
        ))}
      </div>
    </Reveal>
  );
}

/**
 * PRD-261. The public "Submit a concern" form, and the reference code it hands
 * back.
 *
 * WHAT CHANGED AND WHY. The card used to promise "a confirmation within 48
 * hours and an update when the matter is resolved", and collected an email
 * "so we can update you". None of that was deliverable: QueerPulse sends no
 * email and never will, and the in-app `ConcernUpdate` bell only reaches a
 * submitter who was SIGNED IN. An anonymous person reporting harm, or appealing
 * a decision that went against them, was left waiting for a confirmation that
 * could not arrive.
 *
 * So the email field is gone (it collected a real address under a promise
 * nothing could keep), and a successful submit now renders
 * `ConcernSubmittedPanel` in place of the form: a reference code the person
 * keeps, and a status page it opens. That code is the only thing that can ever
 * carry an outcome back to someone without an account, which is why it replaces
 * the toast rather than sitting beside it.
 */
export function RaiseSection() {
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const [category, setCategory] = useState<ConcernCategory | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Non-null once a submission has landed: the form is replaced by the panel
  // that shows the code. `""` means "submitted, but the API returned no code"
  // (an older backend), where the panel confirms receipt and offers no code it
  // does not have.
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const reset = () => {
    setCategory("");
    setDescription("");
    setSubmittedCode(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    // Category and a few words of detail are the minimum a triager needs to
    // act; without them the row would land in the dashboard as an empty task.
    if (!category || !description.trim()) {
      showToast(t("governance:sections.raise.errorToast"), "error");
      return;
    }
    // Demo mode has no backend. It hands back a demo code that RESOLVES on the
    // status page, so the whole journey (code, copy, check back) is reviewable
    // in the sandbox rather than dead-ending on a not-found screen.
    if (demoMode) {
      const { DEMO_SUBMITTED_CONCERN_CODE } =
        await import("./concernStatus.data");
      setSubmittedCode(DEMO_SUBMITTED_CONCERN_CODE);
      return;
    }
    setSubmitting(true);
    try {
      const ack = await submitConcern({
        category,
        description: description.trim(),
      });
      setSubmittedCode(ack.statusToken ?? "");
    } catch {
      showToast(t("governance:sections.raise.failedToast"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Reveal as="section" className={styles.section} id="raise">
      <div className={styles.eye}>{t("governance:sections.raise.eyebrow")}</div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.raise.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        <p>{t("governance:sections.raise.intro")}</p>
      </div>
      {submittedCode !== null ? (
        <ConcernSubmittedPanel
          code={submittedCode || null}
          onSubmitAnother={reset}
        />
      ) : (
        <div className={styles.raiseCard}>
          <div className={styles.rcTitle}>
            {t("governance:sections.raise.cardTitle")}
          </div>
          <p className={styles.rcText}>
            {t("governance:sections.raise.cardText")}
          </p>
          <form
            className={styles.rcForm}
            onSubmit={(event) => void handleSubmit(event)}
          >
            <Select
              label={t("governance:sections.raise.selectPlaceholder")}
              placeholder={t("governance:sections.raise.selectPlaceholder")}
              value={category || null}
              onChange={(value) =>
                setCategory((value ?? "") as ConcernCategory | "")
              }
              options={CONCERN_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
            />
            <textarea
              className={styles.rcTextarea}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("governance:sections.raise.textareaPlaceholder")}
              aria-label={t("governance:sections.raise.textareaPlaceholder")}
            />
            <Button type="submit" disabled={submitting}>
              {submitting
                ? t("governance:sections.raise.submittingCta")
                : t("governance:sections.raise.submitCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </form>
        </div>
      )}
    </Reveal>
  );
}
