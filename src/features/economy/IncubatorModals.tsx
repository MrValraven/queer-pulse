import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { useSubmitFlow } from "./modalFlow";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ApplicationModals.module.css";

/* ── Apply for cohort 3 ─────────────────────────────────────────────── */
export function CohortApplyModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pitch, setPitch] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const valid =
    name.trim().length > 1 &&
    /.+@.+\..+/.test(email) &&
    pitch.trim().length >= 30;
  const charsLeft = 30 - pitch.trim().length;

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

          <div className={styles.field}>
            <label htmlFor="ca-name">
              {t("economy:incubatorApply.nameLabel")}
            </label>
            <input
              id="ca-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("economy:incubatorApply.namePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ca-email">
              {t("economy:incubatorApply.emailLabel")}
            </label>
            <input
              id="ca-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ca-pitch">
              {t("economy:incubatorApply.pitchLabel")}
            </label>
            <textarea
              id="ca-pitch"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder={t("economy:incubatorApply.pitchPlaceholder")}
            />
          </div>
          <p className={styles.note}>
            {charsLeft > 0
              ? t("economy:incubatorApply.charsNeeded", { count: charsLeft })
              : t("economy:incubatorApply.looksGood")}
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:contactRequest.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={() => valid && submit()}
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
  const { sending, done, submit } = useSubmitFlow();
  const valid =
    name.trim().length > 1 &&
    /.+@.+\..+/.test(email) &&
    expertise.trim().length > 1 &&
    why.trim().length >= 30;
  const charsLeft = 30 - why.trim().length;

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

          <div className={styles.field}>
            <label htmlFor="ms-name">
              {t("economy:mentorSignup.nameLabel")}
            </label>
            <input
              id="ms-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("economy:mentorSignup.namePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ms-email">
              {t("economy:mentorSignup.emailLabel")}
            </label>
            <input
              id="ms-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ms-exp">
              {t("economy:mentorSignup.expertiseLabel")}
            </label>
            <input
              id="ms-exp"
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder={t("economy:mentorSignup.expertisePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ms-why">{t("economy:mentorSignup.whyLabel")}</label>
            <textarea
              id="ms-why"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder={t("economy:mentorSignup.whyPlaceholder")}
            />
          </div>
          <p className={styles.note}>
            {charsLeft > 0
              ? t("economy:mentorSignup.charsNeeded", { count: charsLeft })
              : t("economy:mentorSignup.looksGood")}
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:contactRequest.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={() => valid && submit()}
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
  const { sending, done, submit } = useSubmitFlow();
  const valid = when.trim().length > 1 && message.trim().length >= 20;
  const charsLeft = 20 - message.trim().length;
  const mentorFirstName = mentorName.split(" ")[0] ?? mentorName;

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

          <div className={styles.field}>
            <label htmlFor="rs-when">
              {t("economy:requestSession.whenLabel")}
            </label>
            <input
              id="rs-when"
              type="text"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              placeholder={t("economy:requestSession.whenPlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="rs-msg">
              {t("economy:requestSession.messageLabel")}
            </label>
            <textarea
              id="rs-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("economy:requestSession.messagePlaceholder")}
            />
          </div>
          <p className={styles.note}>
            {charsLeft > 0
              ? t("economy:contactRequest.charsNeeded", { count: charsLeft })
              : t("economy:requestSession.looksGood")}
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:contactRequest.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={() => valid && submit()}
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
