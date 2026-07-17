import { useState } from "react";
import { FiMapPin, FiAward } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminAvatar, type AvatarTone } from "./ui";
import type { AvatarTint } from "../../shared/components/ui/Avatar";
import type { PartnerApplicationView } from "../marketing/api/usePartnerApplications";
import styles from "./AdminPartnerApplicationsPage.module.css";

/** AdminAvatar speaks AvatarTone; the view carries an AvatarTint. tintForSlug
 *  only ever yields coral/jade/plum, so map those through and fall back safely. */
function toTone(tint: AvatarTint): AvatarTone {
  return tint === "coral" || tint === "jade" || tint === "plum" ? tint : "plum";
}

/**
 * One partner application in the admin triage queue. Approve surfaces the org on
 * the public partners page; "Set aside" reveals an optional note the applicant
 * reads, then rejects. Purely presentational — the page owns the mutation.
 */
export function AdminPartnerApplicationCard({
  view,
  leaving,
  onApprove,
  onReject,
}: {
  view: PartnerApplicationView;
  leaving: boolean;
  onApprove: () => void;
  onReject: (note?: string) => void;
}) {
  const { t } = useTranslation();
  const [declining, setDeclining] = useState(false);
  const [note, setNote] = useState("");

  return (
    <div className={`${styles.card} ${leaving ? styles.cardLeaving : ""}`}>
      <div className={styles.head}>
        <AdminAvatar
          initials={view.initials}
          tone={toTone(view.tint)}
          size="md"
        />
        <div>
          <div className={styles.name}>{view.name}</div>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <FiMapPin aria-hidden /> {view.regionLabel}
              {view.city ? ` · ${view.city}` : ""}
            </span>
            {view.tier ? (
              <span className={styles.metaItem}>
                <FiAward aria-hidden /> {view.tier}
              </span>
            ) : null}
          </div>
          <div className={styles.submitted}>{view.submittedLine}</div>
        </div>
      </div>

      <p className={styles.desc}>{view.desc}</p>

      {view.tags.length > 0 && (
        <div className={styles.tags}>
          {view.tags.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>
      )}

      {declining ? (
        <div className={styles.declineBox}>
          <label className={styles.declineLabel} htmlFor={`note-${view.id}`}>
            {t("admin:partners.card.noteLabel", { name: view.name })}
          </label>
          <textarea
            id={`note-${view.id}`}
            className={styles.declineNote}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("admin:partners.card.notePlaceholder")}
          />
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setDeclining(false)}
            >
              {t("admin:partners.card.backCta")}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onReject(note.trim() || undefined)}
            >
              {t("admin:partners.card.setAsideCta")}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.actions}>
          <Button variant="ghost" size="md" onClick={() => setDeclining(true)}>
            {t("admin:partners.card.setAsideCta")}
          </Button>
          <Button variant="jade" size="md" onClick={onApprove}>
            {t("admin:partners.card.approveCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
