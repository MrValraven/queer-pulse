import { useState, type ReactNode } from "react";
import { Button, FormField } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { useSubmitFlow } from "./modalFlow";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { submitIntake, type IntakeKind } from "../../shared/api/intakes";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ApplicationModals.module.css";

/**
 * Shared submit bridge for the three incubator modals. In demo it runs the
 * simulated flow (`submit()` → timed success); in live it POSTs the form to the
 * member-only `POST /intakes/:kind` and flips to the success panel, toasting on
 * failure. Returns the click handler and the `sending`/`done` flags the modal
 * renders from.
 */
function useIncubatorSubmit(
  kind: IntakeKind,
  buildPayload: () => Record<string, unknown>,
  valid: boolean,
) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { sending, done, submit, run } = useSubmitFlow();

  const onSubmit = () => {
    if (!valid || sending) return;
    if (demoMode) {
      submit();
      return;
    }
    void run(async () => {
      await submitIntake(kind, buildPayload());
    }).catch(() => showToast(t("shared:intake.errorToast"), "error"));
  };

  return { sending, done, onSubmit };
}

/** One text/email input or textarea in an incubator contact form. */
interface IncubatorField {
  key: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email";
  multiline?: boolean;
}

/**
 * The name/email/textarea + char-counter skeleton shared by all three incubator
 * modals below. Each modal supplies its own field list (they differ — the
 * session request has no name/email) plus the trailing counter note. Uses the
 * shared <FormField> for label + control wiring.
 */
function IncubatorContactFields({
  fields,
  note,
}: {
  fields: IncubatorField[];
  note: ReactNode;
}) {
  return (
    <>
      {fields.map((field) => (
        <FormField key={field.key} label={field.label}>
          {field.multiline ? (
            <textarea
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder}
            />
          ) : (
            <input
              type={field.type ?? "text"}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder}
            />
          )}
        </FormField>
      ))}
      <p className={styles.note}>{note}</p>
    </>
  );
}

/* ── Apply for cohort 3 ─────────────────────────────────────────────── */
export function CohortApplyModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pitch, setPitch] = useState("");
  const valid =
    name.trim().length > 1 &&
    /.+@.+\..+/.test(email) &&
    pitch.trim().length >= 30;
  const charsLeft = 30 - pitch.trim().length;
  const { sending, done, onSubmit } = useIncubatorSubmit(
    "incubator_cohort",
    () => ({ name: name.trim(), email: email.trim(), pitch: pitch.trim() }),
    valid,
  );

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:incubatorApply.success.title")}
          em={t("economy:incubatorApply.success.em")}
          onClose={onClose}
          closeLabel={t("economy:contactRequest.done")}
        >
          <Translation
            i18nKey="economy:incubatorApply.success.body"
            components={{ strong: <strong /> }}
            values={{ name: name.split(" ")[0] ?? "" }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>
            {t("economy:incubatorApply.eyebrow")}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:incubatorApply.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("economy:incubatorApply.sub")}</p>

          <IncubatorContactFields
            fields={[
              {
                key: "name",
                label: t("economy:incubatorApply.nameLabel"),
                placeholder: t("economy:incubatorApply.namePlaceholder"),
                value: name,
                onChange: setName,
              },
              {
                key: "email",
                label: t("economy:incubatorApply.emailLabel"),
                placeholder: t("economy:incubatorApply.emailPlaceholder"),
                value: email,
                onChange: setEmail,
                type: "email",
              },
              {
                key: "pitch",
                label: t("economy:incubatorApply.pitchLabel"),
                placeholder: t("economy:incubatorApply.pitchPlaceholder"),
                value: pitch,
                onChange: setPitch,
                multiline: true,
              },
            ]}
            note={
              charsLeft > 0
                ? t("economy:incubatorApply.charsNeeded", { count: charsLeft })
                : t("economy:incubatorApply.looksGood")
            }
          />

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:contactRequest.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={onSubmit}
            >
              {sending ? (
                <Sending label={t("economy:resume.submittingLabel")} />
              ) : (
                t("economy:incubatorApply.submitCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── Become a mentor ────────────────────────────────────────────────── */
export function MentorSignupModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [expertise, setExpertise] = useState("");
  const [why, setWhy] = useState("");
  const valid =
    name.trim().length > 1 &&
    /.+@.+\..+/.test(email) &&
    expertise.trim().length > 1 &&
    why.trim().length >= 30;
  const charsLeft = 30 - why.trim().length;
  const { sending, done, onSubmit } = useIncubatorSubmit(
    "incubator_mentor",
    () => ({
      name: name.trim(),
      email: email.trim(),
      expertise: expertise.trim(),
      why: why.trim(),
    }),
    valid,
  );

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:mentorSignup.success.title")}
          em={t("economy:mentorSignup.success.em")}
          onClose={onClose}
          closeLabel={t("economy:contactRequest.done")}
        >
          <Translation
            i18nKey="economy:mentorSignup.success.body"
            components={{ strong: <strong /> }}
            values={{ name: name.split(" ")[0] ?? "" }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>
            {t("economy:mentorSignup.eyebrow")}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:mentorSignup.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("economy:mentorSignup.sub")}</p>

          <IncubatorContactFields
            fields={[
              {
                key: "name",
                label: t("economy:mentorSignup.nameLabel"),
                placeholder: t("economy:mentorSignup.namePlaceholder"),
                value: name,
                onChange: setName,
              },
              {
                key: "email",
                label: t("economy:mentorSignup.emailLabel"),
                placeholder: t("economy:mentorSignup.emailPlaceholder"),
                value: email,
                onChange: setEmail,
                type: "email",
              },
              {
                key: "expertise",
                label: t("economy:mentorSignup.expertiseLabel"),
                placeholder: t("economy:mentorSignup.expertisePlaceholder"),
                value: expertise,
                onChange: setExpertise,
              },
              {
                key: "why",
                label: t("economy:mentorSignup.whyLabel"),
                placeholder: t("economy:mentorSignup.whyPlaceholder"),
                value: why,
                onChange: setWhy,
                multiline: true,
              },
            ]}
            note={
              charsLeft > 0
                ? t("economy:mentorSignup.charsNeeded", { count: charsLeft })
                : t("economy:mentorSignup.looksGood")
            }
          />

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:contactRequest.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={onSubmit}
            >
              {sending ? (
                <Sending label={t("economy:resume.submittingLabel")} />
              ) : (
                t("economy:mentorSignup.submitCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── Request a mentoring session ─────────────────────────────────────── */
export function RequestSessionModal({
  mentorName,
  mentorRole,
  onClose,
}: {
  mentorName: string;
  mentorRole: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [when, setWhen] = useState("");
  const [message, setMessage] = useState("");
  const valid = when.trim().length > 1 && message.trim().length >= 20;
  const charsLeft = 20 - message.trim().length;
  const mentorFirstName = mentorName.split(" ")[0] ?? mentorName;
  const { sending, done, onSubmit } = useIncubatorSubmit(
    "incubator_session",
    () => ({
      mentorName,
      mentorRole,
      when: when.trim(),
      message: message.trim(),
    }),
    valid,
  );

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:requestSession.success.title")}
          em={t("economy:requestSession.success.em")}
          onClose={onClose}
          closeLabel={t("economy:contactRequest.done")}
        >
          <Translation
            i18nKey="economy:requestSession.success.body"
            components={{ strong: <strong /> }}
            values={{ name: mentorFirstName }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>
            {t("economy:requestSession.eyebrow", { role: mentorRole })}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:requestSession.title"
              components={{ em: <em /> }}
              values={{ name: mentorName }}
            />
          </h2>
          <p className={styles.sub}>
            {t("economy:requestSession.sub", { firstName: mentorFirstName })}
          </p>

          <IncubatorContactFields
            fields={[
              {
                key: "when",
                label: t("economy:requestSession.whenLabel"),
                placeholder: t("economy:requestSession.whenPlaceholder"),
                value: when,
                onChange: setWhen,
              },
              {
                key: "message",
                label: t("economy:requestSession.messageLabel"),
                placeholder: t("economy:requestSession.messagePlaceholder"),
                value: message,
                onChange: setMessage,
                multiline: true,
              },
            ]}
            note={
              charsLeft > 0
                ? t("economy:contactRequest.charsNeeded", { count: charsLeft })
                : t("economy:requestSession.looksGood")
            }
          />

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:contactRequest.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={onSubmit}
            >
              {sending ? (
                <Sending label={t("economy:negotiate.sendingLabel")} />
              ) : (
                t("economy:requestSession.sendCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
