import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { TIERS } from "./eventPage.data";
import { EVENT_CAPACITY, EVENT_FILLED, EVENT_IS_FULL } from "./eventRsvp.data";
import { WaitlistSuccess, ReservedSuccess } from "./EventRsvpSuccess";
import { useRsvp, useUnrsvp } from "./api/useEventMutations";
import styles from "./EventPage.module.css";

/** The static EventPage has no live id, so a stable placeholder slug keeps the
 *  demo no-op path working and gives live mode a slug to target. */
export function EventRsvpCard({ slug = "welcome-dinner" }: { slug?: string }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fmt = useFormat();
  const rsvp = useRsvp(slug);
  const unrsvp = useUnrsvp(slug);
  const [selectedTier, setSelectedTier] = useState(1);
  const [reserved, setReserved] = useState(false);
  const [waitlistPos, setWaitlistPos] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const canSubmit = fullName.trim().length > 0 && emailValid;
  const isFull = EVENT_IS_FULL;
  const spotsRemaining = EVENT_CAPACITY - EVENT_FILLED;
  const fillPercent = Math.round((EVENT_FILLED / EVENT_CAPACITY) * 100);

  function joinWaitlist() {
    rsvp.mutate("maybe");
    // Plausible position derived from the name length for this prototype.
    setWaitlistPos(2 + (fullName.trim().length % 5));
  }

  if (waitlistPos !== null) {
    return (
      <WaitlistSuccess
        waitlistPos={waitlistPos}
        email={email}
        onLeave={() => {
          unrsvp.mutate();
          setWaitlistPos(null);
        }}
      />
    );
  }

  return (
    <div className={styles.ticketCard}>
      {reserved ? (
        <ReservedSuccess
          selectedTier={selectedTier}
          email={email}
          onCancel={() => {
            unrsvp.mutate();
            setReserved(false);
          }}
        />
      ) : (
        <>
          <div className={styles.ticketHead}>
            <div className={styles.ticketHeadTitle}>
              {isFull
                ? t("gatherings:event.rsvp.headTitleFull")
                : t("gatherings:event.rsvp.headTitle")}
            </div>
            <div className={styles.ticketHeadSub}>
              {isFull
                ? t("gatherings:event.rsvp.headSubFull")
                : t("gatherings:event.rsvp.headSub")}
            </div>
          </div>
          <div className={styles.spotsText}>
            <span>
              <Translation
                i18nKey="gatherings:event.rsvp.spotsRemaining"
                values={{ count: isFull ? 0 : spotsRemaining }}
                components={{ strong: <strong /> }}
              />
            </span>
            <span>
              {t("gatherings:event.rsvp.filledOfCapacity", {
                filled: isFull ? EVENT_CAPACITY : EVENT_FILLED,
                capacity: EVENT_CAPACITY,
              })}
            </span>
          </div>
          <div className={styles.spotsBar}>
            <div
              className={styles.spotsFill}
              style={{ width: isFull ? "100%" : `${fillPercent}%` }}
            />
          </div>
          {!isFull && (
            <div className={styles.tiers}>
              {TIERS.map((tier, index) => (
                <button
                  type="button"
                  key={tier.nameKey}
                  className={[
                    styles.tier,
                    selectedTier === index && styles.tierSelected,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelectedTier(index)}
                >
                  <span className={styles.tierRadio} />
                  <span style={{ flex: 1 }}>
                    <span
                      className={styles.tierName}
                      style={{ display: "block" }}
                    >
                      {t(tier.nameKey)}
                    </span>
                    <span className={styles.tierDesc}>{t(tier.descriptionKey)}</span>
                  </span>
                  <span className={styles.tierPrice}>
                    {fmt.currency(tier.price)}
                  </span>
                </button>
              ))}
            </div>
          )}
          <div className={styles.form}>
            <input
              className={styles.input}
              type="text"
              inputMode="text"
              autoComplete="name"
              autoCapitalize="words"
              placeholder={t("gatherings:event.rsvp.namePlaceholder")}
              required
              aria-required="true"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className={styles.input}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder={t("gatherings:event.rsvp.emailPlaceholder")}
              required
              aria-required="true"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!isFull && (
              <input
                className={styles.input}
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder={t("gatherings:event.rsvp.dietaryPlaceholder")}
              />
            )}
            <div className={styles.requiredHint}>
              <span className={styles.req}>*</span>{" "}
              {isFull
                ? t("gatherings:event.rsvp.requiredHintFull")
                : t("gatherings:event.rsvp.requiredHint")}
            </div>
            <button
              type="button"
              className={styles.rsvpBtn}
              onClick={() => {
                if (isFull) {
                  joinWaitlist();
                } else {
                  rsvp.mutate("going");
                  void navigate(routes.checkout);
                }
              }}
              disabled={!canSubmit}
              title={
                !canSubmit ? t("gatherings:event.rsvp.disabledHint") : undefined
              }
            >
              {isFull
                ? t("gatherings:event.rsvp.joinWaitlistCta")
                : t("gatherings:event.rsvp.reserveCta")}{" "}
              →
            </button>
          </div>
          <div className={styles.note}>
            {isFull
              ? t("gatherings:event.rsvp.noteFull")
              : `${t("gatherings:event.rsvp.confirmationEmailNote")} ${t("gatherings:event.rsvp.cancelPolicy")}`}
          </div>
        </>
      )}
    </div>
  );
}
