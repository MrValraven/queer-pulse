import { useMemo, useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import {
  buildDeliveryOptions,
  buildAnonOptions,
  GIFT_ANNUAL,
  ACTIVATE_BY_DATE,
} from "./giftMembership.data";
import styles from "./GiftMembershipPage.module.css";

export function GiftMembershipForm() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const deliveryOptions = useMemo(() => buildDeliveryOptions(t, fmt), [t, fmt]);
  const anonOptions = useMemo(() => buildAnonOptions(t), [t]);
  const giftAmount = fmt.currency(GIFT_ANNUAL);
  const [rName, setRName] = useState("Rita Vasquez");
  const [rContact, setRContact] = useState("rita@example.com");
  const [sName, setSName] = useState("Tomás Mendes");
  const [anon, setAnon] = useState("no");
  const [note, setNote] = useState(
    "For everything you do at the Thursday clinic. From all of us, but mostly from me.",
  );
  const [delivery, setDelivery] = useState<"now" | "schedule" | "print">("now");

  const firstName = rName.trim().split(" ")[0] || "Friend";
  let sender = sName.trim() || "A friend";
  if (anon === "yes") sender = "A friend";
  if (anon === "initials") {
    sender =
      sName
        .trim()
        .split(" ")
        .map((part) => part[0])
        .join("") + ".";
  }
  const deliveryNote =
    deliveryOptions.find((option) => option.id === delivery)?.note ??
    t("settings:giftMembership.delivery.now.note");

  function submit(e: FormEvent) {
    e.preventDefault();
    showToast(
      t("settings:giftMembership.form.toast.charged", {
        amount: giftAmount,
        name: firstName,
      }),
      "success",
    );
  }

  return (
    <form onSubmit={submit}>
      <div className={styles.formSectionH}>
        {t("settings:giftMembership.form.sectionRecipient")}
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label>
            {t("settings:giftMembership.form.recipientNameLabel")}{" "}
            <span className={styles.opt}>
              {t("settings:giftMembership.form.recipientNameHint")}
            </span>
          </label>
          <input
            type="text"
            value={rName}
            onChange={(e) => setRName(e.target.value)}
            placeholder="Tomás Mendes"
          />
        </div>
        <div className={styles.field}>
          <label>
            {t("settings:giftMembership.form.recipientContactLabel")}
          </label>
          <input
            type="text"
            value={rContact}
            onChange={(e) => setRContact(e.target.value)}
          />
          <div className={styles.fieldHint}>
            {t("settings:giftMembership.form.recipientContactHint")}
          </div>
        </div>
      </div>

      <div className={styles.formSectionH}>
        {t("settings:giftMembership.form.sectionFromYou")}
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label>{t("settings:giftMembership.form.senderNameLabel")}</label>
          <input
            type="text"
            value={sName}
            onChange={(e) => setSName(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label>
            {t("settings:giftMembership.form.anonLabel")}{" "}
            <span className={styles.opt}>
              {t("settings:giftMembership.form.anonHint")}
            </span>
          </label>
          <select value={anon} onChange={(e) => setAnon(e.target.value)}>
            {anonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label>
          {t("settings:giftMembership.form.noteLabel")}{" "}
          <span className={styles.opt}>
            {t("settings:giftMembership.form.noteHint")}
          </span>
        </label>
        <textarea
          maxLength={280}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="For everything you do at the Thursday clinic. From all of us, but mostly from me."
        />
        <div className={styles.fieldHint}>
          {t("settings:giftMembership.form.charCount", { count: note.length })}
        </div>
      </div>

      <div className={styles.formSectionH}>
        {t("settings:giftMembership.form.sectionDelivery")}
      </div>
      <p className={styles.deliveryIntro}>
        {t("settings:giftMembership.form.deliveryIntro")}
      </p>
      <div className={styles.deliveryGrid}>
        {deliveryOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`${styles.delivery} ${delivery === option.id ? styles.selected : ""}`}
            onClick={() => setDelivery(option.id)}
          >
            <b>{option.label}</b>
            <span>{option.desc}</span>
          </button>
        ))}
      </div>

      <div className={styles.previewH}>
        {t("settings:giftMembership.form.previewHeading")}
      </div>
      <div className={styles.previewCard}>
        <span className={styles.previewStamp}>
          {t("settings:giftMembership.form.previewStamp")}
        </span>
        <h2>
          <Translation
            i18nKey="settings:giftMembership.form.previewTitle"
            values={{ name: firstName }}
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.previewNote}>
          {note.trim() ? `"${note.trim()}"` : ""}
        </p>
        <div className={styles.previewSender}>
          <Translation
            i18nKey="settings:giftMembership.form.previewSender"
            values={{
              sender,
              amount: giftAmount,
              date: fmt.date(ACTIVATE_BY_DATE),
            }}
            components={{ b: <b /> }}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.summary}>
          <Translation
            i18nKey="settings:giftMembership.form.summary"
            values={{ amount: giftAmount, deliveryNote }}
            components={{ b: <b /> }}
          />
        </div>
        <Button variant="primary" type="submit">
          {t("settings:giftMembership.form.payCta", { name: firstName })}
        </Button>
      </div>
    </form>
  );
}
