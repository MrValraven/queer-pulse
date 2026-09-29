import type { RefObject } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinInvolvement } from "./api/communityJoin.api";
import { INVOLVEMENT } from "./joinModal.data";
import type { JoinModalCommunity } from "./JoinModal";
import styles from "./JoinModal.module.css";

/** The heading ref `JoinModal` focuses when the step changes. */
type StepHeadingRef = RefObject<HTMLHeadingElement | null>;

export function JoinStepIntro({
  headingRef,
  community,
  isRequest,
  isInvite,
  isInvited = false,
  onNext,
}: {
  headingRef: StepHeadingRef;
  community: JoinModalCommunity;
  isRequest: boolean;
  isInvite: boolean;
  /** PRD-140: this member holds a standing invitation, so the door is already
   *  open to them and no moderator has anything left to review. */
  isInvited?: boolean;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.eye}>
        {isInvite
          ? t("communities:join.intro.eyebrow.invite")
          : isRequest
            ? t("communities:join.intro.eyebrow.request")
            : t("communities:join.intro.eyebrow.public")}
      </div>
      <h2 ref={headingRef} tabIndex={-1} className={styles.title}>
        {community.name}
      </h2>
      <div className={styles.meta}>
        {community.typeLabel} · {community.count}
      </div>
      <p className={styles.desc}>{community.description}</p>
      {community.tags && community.tags.length > 0 && (
        <div className={styles.tags}>
          {community.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
      {isInvited ? (
        <p className={styles.hint}>{t("communities:join.intro.invitedHint")}</p>
      ) : (
        isInvite && (
          <p className={styles.hint}>
            {t("communities:join.intro.inviteHint")}
          </p>
        )
      )}
      <Button variant="primary" onClick={onNext}>
        {t("communities:join.intro.continueCta")}
      </Button>
    </div>
  );
}

/**
 * "About you" + "level of involvement" in one step. Asking for the applicant's
 * email here would re-collect something the app already has (they are signed in
 * to reach this wizard) with nowhere for it to go, so this step's own job is
 * just: a couple of optional words about you, plus a quick tap for how involved
 * you would like to be.
 *
 * The involvement answer is sent as its own `involvement` field on the join and
 * the free-text `note` carries only what the applicant typed. It used to be
 * folded into the note as a leading "[Help organise]" tag, which meant a
 * moderator read the answer back out of prose and no query could group by it.
 *
 * Name and pronouns are deliberately absent for the same reason the email
 * field was dropped: the account already carries them, and the mods reviewing
 * the request read them off the applicant's profile.
 */
export function JoinStepAbout({
  headingRef,
  isRequest,
  involvement,
  setInvolvement,
  aboutText,
  setAboutText,
  isSubmitting,
  errorMessage,
  onSubmit,
}: {
  headingRef: StepHeadingRef;
  isRequest: boolean;
  involvement: JoinInvolvement;
  setInvolvement: (involvement: JoinInvolvement) => void;
  aboutText: string;
  setAboutText: (v: string) => void;
  /** True while the join/request is in flight. */
  isSubmitting: boolean;
  /** Why the last attempt failed, shown under the submit button. */
  errorMessage: string | null;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.eye}>{t("communities:join.about.eyebrow")}</div>
      <h2 ref={headingRef} tabIndex={-1} className={styles.title}>
        {t("communities:join.about.title")}
      </h2>
      <p className={styles.hint}>{t("communities:join.about.hint")}</p>
      <div className={styles.fields}>
        <textarea
          className={styles.textarea}
          rows={4}
          aria-label={t("communities:join.about.aboutPlaceholder")}
          placeholder={t("communities:join.about.aboutPlaceholder")}
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
        />
        <div>
          <div className={styles.invLabel}>
            {t("communities:join.involvement.levelLabel")}
          </div>
          <div className={styles.opts}>
            {INVOLVEMENT.map((o) => (
              <label
                key={o.value}
                className={[
                  styles.opt,
                  involvement === o.value && styles.optChecked,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="involvement"
                  aria-label={t(o.labelKey)}
                  value={o.value}
                  checked={involvement === o.value}
                  onChange={() => setInvolvement(o.value)}
                />
                <div>
                  <span>{t(o.labelKey)}</span>
                  <small>{t(o.descriptionKey)}</small>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      <Button variant="primary" onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting
          ? t("communities:join.about.submitting")
          : isRequest
            ? t("communities:join.involvement.sendRequestCta")
            : t("communities:join.involvement.joinCta")}
      </Button>
      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

/** The done step's title and body keys: a held join, a request, or a
 *  welcome. */
function doneCopyKeys(isRequest: boolean, isHeldForReview: boolean) {
  if (isHeldForReview)
    return {
      titleKey: "communities:join.done.heldTitle",
      bodyKey: "communities:join.done.heldBody",
    };
  if (isRequest)
    return {
      titleKey: "communities:join.done.requestTitle",
      bodyKey: "communities:join.done.requestBody",
    };
  return {
    titleKey: "communities:join.done.welcomeTitle",
    bodyKey: "communities:join.done.joinedBody",
  };
}

/**
 * The wizard's last step, worded by what the server did. A held join
 * (ENG-428) gets its own copy: the member pressed Join and asked for nothing,
 * so the request wording would describe an action they never took.
 */
export function JoinStepDone({
  headingRef,
  community,
  isRequest,
  isHeldForReview = false,
  onClose,
}: {
  headingRef: StepHeadingRef;
  community: JoinModalCommunity;
  isRequest: boolean;
  /** An instant join the server held for review. */
  isHeldForReview?: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { titleKey, bodyKey } = doneCopyKeys(isRequest, isHeldForReview);
  return (
    <div>
      <div className={styles.successIcon}>
        <svg viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 ref={headingRef} tabIndex={-1} className={styles.title}>
        {t(titleKey, { name: community.name })}
      </h2>
      <p className={styles.desc}>
        <Translation
          i18nKey={bodyKey}
          components={{ strong: <strong /> }}
          values={{ name: community.name }}
        />
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          {t("communities:join.done.doneCta")}
        </Button>
      </div>
    </div>
  );
}
