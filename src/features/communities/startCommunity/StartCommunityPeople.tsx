import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AvatarTint } from "../../../shared/components/ui";
import { useConnectionsList } from "../../connect/api/useConnectionsList";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

const FACE: Record<AvatarTint, string> = {
  coral: styles.tintFaceCoral!,
  jade: styles.tintFaceJade!,
  plum: styles.tintFacePlum!,
  default: styles.tintFacePlum!,
  auth: styles.tintFacePlum!,
};

/**
 * Chapter 7 — People: invite a few to be there on day one. You can only invite
 * people you're already connected to, so the picker is your real connections
 * (`useConnectionsList("all")` — the mock relationships in demo, the server's
 * connection list in live), never a hardcoded roster.
 */
export function StepPeople({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, toggleInvite } = form;
  const { views: connections } = useConnectionsList("all");
  return (
    <div>
      <div className={styles.field}>
        <label>{t("communities:start.people.label")}</label>
        <span className={styles.hint}>
          {t("communities:start.people.hint")}
        </span>
        {connections.length === 0 ? (
          <p className={styles.hint}>{t("communities:start.people.empty")}</p>
        ) : (
          <div className={styles.inviteList}>
            {connections.map((c) => {
              const on = draft.invites.includes(c.slug);
              return (
                <button
                  key={c.slug}
                  type="button"
                  className={[styles.inviteChip, on && styles.inviteOn]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={on}
                  onClick={() => toggleInvite(c.slug)}
                >
                  <span className={`${styles.icAv} ${FACE[c.tint]}`}>
                    {c.initials}
                  </span>
                  <span className={styles.icName}>{c.name}</span>
                  {on && (
                    <span className={styles.icCheck}>
                      <FiCheck size={14} aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <p className={styles.seedNote}>
        {t("communities:start.people.seedNote")}
      </p>
    </div>
  );
}
