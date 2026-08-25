import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CreateLandlordBody } from "./api/landlord.api";
import { useSuggestLandlord } from "./api/useSuggestLandlord";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import styles from "./ApplicationModals.module.css";

function splitLines(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function SuggestLandlordModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [hood, setHood] = useState("");
  const [tagline, setTagline] = useState("");
  const [note, setNote] = useState("");
  const [about, setAbout] = useState("");
  const [areas, setAreas] = useState("");
  const [done, setDone] = useState(false);
  const suggestLandlord = useSuggestLandlord();
  const sending = suggestLandlord.isPending;
  const valid = name.trim().length > 1;

  const handleSubmit = () => {
    if (!valid) return;
    const body: CreateLandlordBody = {
      name: name.trim(),
      hood: hood.trim() || undefined,
      tagline: tagline.trim() || undefined,
      note: note.trim() || undefined,
      about: about.trim() ? [about.trim()] : undefined,
      areas: splitLines(areas),
    };
    suggestLandlord.mutate(body, {
      onSuccess: () => setDone(true),
      onError: () => showToast(t("economy:suggestLandlord.error"), "error"),
    });
  };

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      ariaLabel={t("economy:suggestLandlord.ariaLabel")}
    >
      {done ? (
        <SuccessPanel
          title={t("economy:suggestLandlord.success.title")}
          em={t("economy:suggestLandlord.success.em")}
          onClose={onClose}
          closeLabel={t("economy:housingModal.done")}
        >
          <Translation
            i18nKey="economy:suggestLandlord.success.body"
            values={{ name: name.trim() }}
            components={{ strong: <strong /> }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>
            {t("economy:suggestLandlord.eyebrow")}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:suggestLandlord.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("economy:suggestLandlord.sub")}</p>

          <div className={styles.field}>
            <label htmlFor="sl-name">
              {t("economy:suggestLandlord.nameLabel")}
            </label>
            <input
              id="sl-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("economy:suggestLandlord.namePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="sl-hood">
              {t("economy:suggestLandlord.hoodLabel")}
            </label>
            <input
              id="sl-hood"
              type="text"
              value={hood}
              onChange={(e) => setHood(e.target.value)}
              placeholder={t("economy:suggestLandlord.hoodPlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="sl-tagline">
              {t("economy:suggestLandlord.taglineLabel")}
            </label>
            <input
              id="sl-tagline"
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder={t("economy:suggestLandlord.taglinePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="sl-note">
              {t("economy:suggestLandlord.noteLabel")}
            </label>
            <input
              id="sl-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("economy:suggestLandlord.notePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="sl-about">
              {t("economy:suggestLandlord.aboutLabel")}
            </label>
            <textarea
              id="sl-about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder={t("economy:suggestLandlord.aboutPlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="sl-areas">
              {t("economy:suggestLandlord.areasLabel")}
            </label>
            <textarea
              id="sl-areas"
              value={areas}
              onChange={(e) => setAreas(e.target.value)}
              placeholder={t("economy:suggestLandlord.areasPlaceholder")}
            />
          </div>
          <p className={styles.note}>{t("economy:suggestLandlord.note")}</p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button
              type="button"
              className={styles.back}
              onClick={onClose}
              disabled={sending}
            >
              {t("economy:housingModal.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={handleSubmit}
            >
              {sending ? (
                <Sending label={t("economy:suggestLandlord.submitting")} />
              ) : (
                t("economy:suggestLandlord.submitCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
