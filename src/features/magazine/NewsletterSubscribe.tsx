import { useState, type FormEvent } from "react";
import { FiCheckCircle, FiMail } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STREAM_LABEL_KEY, type Stream } from "./newsletterArchive.data";
import styles from "./NewsletterArchivePage.module.css";

interface Props {
  /** The stream currently selected via the tabs — pre-selected in the form. */
  stream: Stream | "all";
}

export function NewsletterSubscribe({ stream }: Props) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<{
    email: string;
    stream: Stream | "all";
  } | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone({ email: email.trim(), stream });
    showToast(t("magazine:newsletter.subscribe.confirmToast"), "success");
    setEmail("");
  }

  if (done) {
    return (
      <div className={styles.subDone} role="status">
        <span className={styles.subDoneIcon} aria-hidden>
          <FiCheckCircle />
        </span>
        <div>
          <h3 className={styles.subDoneTitle}>
            <Translation
              i18nKey="magazine:newsletter.subscribe.doneTitle"
              components={{ em: <em /> }}
            />
          </h3>
          <p className={styles.subDoneBody}>
            <Translation
              i18nKey="magazine:newsletter.subscribe.doneBody"
              components={{ strong: <strong /> }}
              values={{
                stream: t(STREAM_LABEL_KEY[done.stream]),
                email: done.email,
              }}
            />
          </p>
          <p className={styles.subDoneNext}>
            <FiMail aria-hidden /> {t("magazine:newsletter.subscribe.doneNext")}
          </p>
          <Button variant="ghost-dark" onClick={() => setDone(null)}>
            {t("magazine:newsletter.subscribe.anotherCta")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form className={styles.sub} onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder={t("magazine:newsletter.subscribe.emailPlaceholder")}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button variant="primary" type="submit">
          {t("magazine:newsletter.subscribe.submitCta")}
        </Button>
      </form>
      <p className={styles.subFoot}>
        {stream === "all" ? (
          t("magazine:newsletter.subscribe.footAll")
        ) : (
          <Translation
            i18nKey="magazine:newsletter.subscribe.footOne"
            components={{ strong: <strong /> }}
            values={{ stream: t(STREAM_LABEL_KEY[stream]) }}
          />
        )}
        {t("magazine:newsletter.subscribe.footShared")}
      </p>
    </>
  );
}
