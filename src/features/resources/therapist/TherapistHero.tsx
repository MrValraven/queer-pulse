import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { Button, ImageSlot, Sending } from "../../../shared/components/ui";
import { usePrefersReducedMotion } from "../../../shared/hooks";
import type { Therapist } from "../mentalHealth.data";
import type { TherapistProfile } from "./therapistProfiles.data";
import styles from "./TherapistProfilePage.module.css";

type MsgPhase = "idle" | "sending" | "sent";

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
  const [msg, setMsg] = useState<MsgPhase>("idle");
  const reduced = usePrefersReducedMotion();
  const firstName = therapist.name.replace(/^Dr\.\s*/, "").split(" ")[0];

  function scrollToBook() {
    document.getElementById("book")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }

  function sendMessage() {
    if (msg !== "idle") return;
    setMsg("sending");
    window.setTimeout(() => setMsg("sent"), 1100);
  }

  return (
    <>
      <Link className={styles.back} to={routes.mentalHealth}>
        <FiArrowLeft aria-hidden /> Therapist directory
      </Link>

      <div className={styles.verified}>
        <span className={styles.seal}>
          <FiCheck aria-hidden />
        </span>
        <p className={styles.verifiedText}>
          <b>Vetted clinician.</b> Credentials checked by QueerPulse Wellbeing
          on {profile.vettedOn}. {profile.vouches.length} independent community{" "}
          {profile.vouches.length === 1 ? "vouch" : "vouches"} in the last 12
          months. <Link to={`${routes.wellbeing}#vetting`}>How we vet →</Link>
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
          {msg === "sent" ? (
            <div className={styles.sentNote}>
              <FiCheck aria-hidden />
              <div>
                <div className={styles.sentTitle}>
                  Message sent to {firstName}.
                </div>
                <p className={styles.sentText}>
                  They'll reply directly to your email if it feels like a fit.
                  No notifications, no pressure.
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
                disabled={msg === "sending"}
              >
                {msg === "sending" ? (
                  <Sending label="Sending…" />
                ) : (
                  "Send a message"
                )}
              </Button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
