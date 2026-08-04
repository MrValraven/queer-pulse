import { useState } from "react";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Button, Sending } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Therapist } from "../mentalHealth.data";
import {
  DAY_LETTERS,
  DAY_NAMES,
  type TherapistProfile,
} from "./therapistProfiles.data";
import styles from "./TherapistProfilePage.module.css";

type Phase = "idle" | "holding" | "held";

export function TherapistSidebar({
  therapist,
  profile,
}: {
  therapist: Therapist;
  profile: TherapistProfile;
}) {
  const { t } = useTranslation();
  const [sel, setSel] = useState<{ w: number; d: number } | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const accepting = therapist.acceptingNew;
  const firstName = therapist.name.replace(/^Dr\.\s*/, "").split(" ")[0];

  const cell = sel ? (profile.availability[sel.w]?.[sel.d] ?? null) : null;
  const slotLabel =
    sel && cell
      ? `${DAY_NAMES[sel.d]} ${cell.label} ${cell.month}, ${profile.slotTime}`
      : null;

  function hold() {
    if (phase !== "idle" || (accepting && !sel)) return;
    setPhase("holding");
    window.setTimeout(() => setPhase("held"), 1100);
  }

  return (
    <>
      <div className={styles.sideCard} id="book">
        <h4 className={styles.sideLabel}>
          {accepting
            ? t("resources:therapistProfilePage.sidebar.bookHeadingAccepting")
            : t("resources:therapistProfilePage.sidebar.bookHeadingWaitlist")}
        </h4>
        <div className={styles.availGrid}>
          {DAY_LETTERS.map((d, i) => (
            <div className={styles.avDay} key={i}>
              {d}
            </div>
          ))}
          {profile.availability.map((week, w) =>
            week.map((c, d) => {
              const isSel = sel?.w === w && sel?.d === d;
              const cls = [
                styles.avCell,
                c.state === "open" && styles.avOpen,
                c.state === "full" && styles.avFull,
                isSel && styles.avYou,
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  type="button"
                  key={`${w}-${d}`}
                  className={cls}
                  disabled={c.state !== "open" || phase === "held"}
                  aria-pressed={isSel}
                  aria-label={
                    c.state === "open"
                      ? `${DAY_NAMES[d]} ${c.label} ${c.month} — available`
                      : undefined
                  }
                  onClick={() => setSel({ w, d })}
                >
                  {c.label}
                </button>
              );
            }),
          )}
        </div>
        <div className={styles.legend}>
          <span className={styles.legendOpen}>
            {t("resources:therapistProfilePage.sidebar.legendAvailable")}
          </span>
          <span className={styles.legendFull}>
            {t("resources:therapistProfilePage.sidebar.legendBooked")}
          </span>
        </div>
        {phase === "held" ? (
          <div className={styles.held}>
            <FiCheck aria-hidden />
            <p>
              {accepting
                ? t("resources:therapistProfilePage.sidebar.heldAccepting", {
                    slot: slotLabel ?? undefined,
                    name: firstName,
                  })
                : t("resources:therapistProfilePage.sidebar.heldWaitlist", {
                    name: firstName,
                  })}
            </p>
          </div>
        ) : (
          <Button
            variant="primary"
            className={styles.holdBtn}
            onClick={hold}
            disabled={phase === "holding" || (accepting && !sel)}
          >
            {phase === "holding" ? (
              <Sending
                label={
                  accepting
                    ? t("resources:therapistProfilePage.sidebar.holdingLabel")
                    : t("resources:therapistProfilePage.sidebar.joiningLabel")
                }
              />
            ) : accepting ? (
              slotLabel ? (
                <>
                  {t("resources:therapistProfilePage.sidebar.holdSlotCta", {
                    slot: slotLabel,
                  })}{" "}
                  <FiArrowRight aria-hidden />
                </>
              ) : (
                t("resources:therapistProfilePage.sidebar.pickSlotCta")
              )
            ) : (
              profile.bookCta
            )}
          </Button>
        )}
      </div>

      <div className={styles.sideCard}>
        <h4 className={styles.sideLabel}>
          {t("resources:therapistProfilePage.sidebar.feesHeading")}
        </h4>
        {profile.fees.map((f) => (
          <div className={styles.feeRow} key={f.label}>
            <span>{f.label}</span>
            <b
              className={
                f.tone === "sliding"
                  ? styles.feeSliding
                  : f.tone === "free"
                    ? styles.feeFree
                    : styles.feeStrong
              }
            >
              {f.value}
            </b>
          </div>
        ))}
      </div>

      <div className={styles.sideCard}>
        <h4 className={styles.sideLabel}>
          {t("resources:therapistProfilePage.sidebar.whereHeading")}
        </h4>
        <p className={styles.venueAddr}>
          <b className={styles.venueName}>{profile.venue.name}</b>
          {profile.venue.lines.map((l) => (
            <span key={l}>
              {l}
              <br />
            </span>
          ))}
        </p>
        <p className={styles.venueAccess}>{profile.venue.access}</p>
      </div>

      <div className={`${styles.sideCard} ${styles.crisis}`}>
        <h4 className={`${styles.sideLabel} ${styles.crisisLabel}`}>
          {t("resources:therapistProfilePage.sidebar.crisisHeading")}
        </h4>
        <p className={styles.crisisText}>
          {t("resources:therapistProfilePage.sidebar.crisisText")}
        </p>
        <Button
          variant="ghost"
          className={styles.crisisBtn}
          href="tel:213544545"
        >
          {t("resources:therapistProfilePage.sidebar.sosVozAmigaCta")}
        </Button>
      </div>
    </>
  );
}
