import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { TIERS } from "./eventPage.data";
import { EVENT_CAPACITY, EVENT_FILLED } from "./eventRsvp.data";
import styles from "./EventPage.module.css";

/** What the member filled in before submitting. `dietaryNeeds` is the only
 *  field the RSVP API can actually carry (PATCH /events/:slug/rsvp/details);
 *  the name and email are the prototype's own contact fields, echoed back on
 *  the confirmation screen. */
export interface EventRsvpDraft {
  selectedTier: number;
  fullName: string;
  email: string;
  dietaryNeeds: string;
}

/** The sliding-scale tier picker — only offered while spots remain. */
function RsvpTierPicker({
  selectedTier,
  onSelectTier,
}: {
  selectedTier: number;
  onSelectTier: (index: number) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.tiers}>
      {TIERS.map((tier, index) => (
        <button
          type="button"
          key={tier.nameKey}
          className={[styles.tier, selectedTier === index && styles.tierSelected]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSelectTier(index)}
        >
          <span className={styles.tierRadio} />
          <span style={{ flex: 1 }}>
            <span className={styles.tierName} style={{ display: "block" }}>
              {t(tier.nameKey)}
            </span>
            <span className={styles.tierDesc}>{t(tier.descriptionKey)}</span>
          </span>
          <span className={styles.tierPrice}>{fmt.currency(tier.price)}</span>
        </button>
      ))}
    </div>
  );
}

/** How full the gathering is — the "N spots remaining" line and its bar. */
function RsvpSpots({ isFull }: { isFull: boolean }) {
  const { t } = useTranslation();
  const spotsRemaining = EVENT_CAPACITY - EVENT_FILLED;
  const fillPercent = Math.round((EVENT_FILLED / EVENT_CAPACITY) * 100);
  return (
    <>
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
    </>
  );
}

/**
 * The pre-RSVP body of the ticket card: how full the gathering is, the sliding
 * scale, and the contact fields. Self-contained — it owns every field's state
 * and hands the finished draft to `onSubmit`, so the card above it only deals
 * with the mutation and the confirmed state.
 */
export function EventRsvpForm({
  isFull,
  isSubmitting,
  onSubmit,
}: {
  isFull: boolean;
  isSubmitting: boolean;
  onSubmit: (draft: EventRsvpDraft) => void;
}) {
  const { t } = useTranslation();
  const [selectedTier, setSelectedTier] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dietaryNeeds, setDietaryNeeds] = useState("");

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const canSubmit = fullName.trim().length > 0 && isEmailValid && !isSubmitting;

  return (
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
      <RsvpSpots isFull={isFull} />
      {!isFull && (
        <RsvpTierPicker
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
        />
      )}
      <div className={styles.form}>
        <input
          className={styles.input}
          type="text"
          inputMode="text"
          autoComplete="name"
          autoCapitalize="words"
          aria-label={t("gatherings:event.rsvp.namePlaceholder")}
          placeholder={t("gatherings:event.rsvp.namePlaceholder")}
          required
          aria-required="true"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
        <input
          className={styles.input}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-label={t("gatherings:event.rsvp.emailPlaceholder")}
          placeholder={t("gatherings:event.rsvp.emailPlaceholder")}
          required
          aria-required="true"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {!isFull && (
          <input
            className={styles.input}
            type="text"
            inputMode="text"
            autoComplete="off"
            aria-label={t("gatherings:event.rsvp.dietaryPlaceholder")}
            placeholder={t("gatherings:event.rsvp.dietaryPlaceholder")}
            value={dietaryNeeds}
            onChange={(event) => setDietaryNeeds(event.target.value)}
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
          onClick={() =>
            onSubmit({ selectedTier, fullName, email, dietaryNeeds })
          }
          disabled={!canSubmit}
          title={!canSubmit ? t("gatherings:event.rsvp.disabledHint") : undefined}
        >
          {isFull
            ? t("gatherings:event.rsvp.joinWaitlistCta")
            : t("gatherings:event.rsvp.reserveCta")}{" "}
          <FiArrowRight aria-hidden />
        </button>
      </div>
      <div className={styles.note}>
        {isFull
          ? t("gatherings:event.rsvp.noteFull")
          : `${t("gatherings:event.rsvp.confirmationEmailNote")} ${t("gatherings:event.rsvp.cancelPolicy")}`}
      </div>
    </>
  );
}
