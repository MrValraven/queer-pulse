import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { Button, ImageSlot, Sending } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { usePrefersReducedMotion } from "../../../shared/hooks";
import type { Therapist } from "../mentalHealth.data";
import type { TherapistProfile } from "./therapistProfiles.data";
import styles from "./TherapistProfilePage.module.css";

type MessagePhase = "idle" | "sending" | "sent";

const PILL_TONE: Record<string, string | undefined> = {
  lang: styles.pillLang,
  accept: styles.pillAccept,
};

export function TherapistHero({
  therapist,
  profile,
}: {
  therapist: Therapist;
  profile: TherapistProfile;
}) {
  const { t } = useTranslation();
  const [message, setMessage] = useState<MessagePhase>("idle");
  const reduced = usePrefersReducedMotion();
  const firstName = therapist.name.replace(/^Dr\.\s*/, "").split(" ")[0];

  function scrollToBook() {
    document.getElementById("book")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }

  function sendMessage() {
    if (message !== "idle") return;
    setMessage("sending");
    window.setTimeout(() => setMessage("sent"), 1100);
  }

  return (
    <>
      <Link className={styles.back} to={routes.mentalHealth}>
        <FiArrowLeft aria-hidden />{" "}
        {t("resources:therapistProfilePage.backLink")}
      </Link>

      <div className={styles.verified}>
        <span className={styles.seal}>
          <FiCheck aria-hidden />
        </span>
        <p className={styles.verifiedText}>
          <Translation
            i18nKey="resources:therapistProfilePage.verified.body"
            components={{
              b: <b />,
              a: <Link to={`${routes.wellbeing}#vetting`} />,
            }}
            values={{
              vettedOn: profile.vettedOn,
              count: profile.vouches.length,
            }}
          />
        </p>
      </div>

      <header className={styles.hero}>
        <ImageSlot
          src={therapist.photo}
          alt={therapist.name}
          radius={18}
          height={220}
          tint="coral"
          placeholder={`Portrait: ${therapist.name}`}
          loading="eager"
          fetchPriority="high"
        />
        <div>
          <div className={styles.eyebrow}>{profile.eyebrow}</div>
          <h1 className={styles.name}>
            {profile.namePlain} <em>{profile.nameEm}</em>
          </h1>
          <div className={styles.creds}>
            {profile.credsLine.map((c, i) => (
              <span key={c}>
                {i > 0 && <span className={styles.dot}>·</span>}
                {c}
              </span>
            ))}
          </div>
          <blockquote className={styles.quote}>{profile.quote}</blockquote>
          <div className={styles.pills}>
            {profile.pills.map((p) => (
              <span
                key={p.label}
                className={[styles.pill, p.tone && PILL_TONE[p.tone]]
                  .filter(Boolean)
                  .join(" ")}
              >
                {p.label}
              </span>
            ))}
          </div>
          {message === "sent" ? (
            <div className={styles.sentNote}>
              <FiCheck aria-hidden />
              <div>
                <div className={styles.sentTitle}>
                  {t("resources:mentalHealth.therapistModal.sentTitle", {
                    name: firstName,
                  })}
                </div>
                <p className={styles.sentText}>
                  {t("resources:mentalHealth.therapistModal.sentText")}
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.cta}>
              <Button variant="primary" onClick={scrollToBook}>
                {profile.bookCta}
              </Button>
              <Button
                variant="ghost"
                onClick={sendMessage}
                disabled={message === "sending"}
              >
                {message === "sending" ? (
                  <Sending label={t("resources:suggestEdit.sendingLabel")} />
                ) : (
                  t("resources:therapistProfilePage.sendMessageCta")
                )}
              </Button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
