import { useState, type ReactNode } from "react";
import { FiExternalLink } from "react-icons/fi";
import { personaPath } from "../../../app/routeMap";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { personaKindLabelKey } from "../personaWall/personaWallAdmin.model";
import { AdminChip } from "../ui";
import type {
  HiddenLeadPersonaState,
  LeadLinkedPersonaDTO,
} from "./api/leads.types";
import { LEAD_PERSONA_STATE_KEY } from "./leadLabels.data";
import { LeadPersonaThumb } from "./LeadPersonaThumb";
import styles from "./LeadPersona.module.css";

/**
 * The persona a lead is linked to: picture, name, @handle and kind. The name
 * opens the public persona page in a new tab; a persona with no handle has
 * no page, so its name stays plain text. When the persona has left the
 * public directory since, a status line folds open naming why, and the last
 * reason stays drawn while it folds away. `actions` (Unlink persona) sit at
 * the end of the card. It shows persona fields only.
 */
export function LeadPersonaCard({
  persona,
  actions,
}: {
  persona: LeadLinkedPersonaDTO;
  actions?: ReactNode;
}) {
  const { t } = useTranslation();
  const name = persona.displayName;
  const kindLabelKey = personaKindLabelKey(persona.kind);
  const hiddenState =
    persona.publicState === "shown" ? null : persona.publicState;
  const [lastHiddenState, setLastHiddenState] =
    useState<HiddenLeadPersonaState | null>(hiddenState);
  if (hiddenState !== null && hiddenState !== lastHiddenState)
    setLastHiddenState(hiddenState);
  const shownHiddenState = hiddenState ?? lastHiddenState;

  return (
    <div className={styles.card}>
      <div className={styles.cardRow}>
        <LeadPersonaThumb persona={persona} size={48} />
        <div className={styles.cardText}>
          {persona.handle ? (
            <a
              href={personaPath(persona.handle)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cardNameLink}
              aria-label={t("admin:leads.persona.openAria", { name })}
            >
              <span className={styles.cardName}>{name}</span>
              <FiExternalLink className={styles.cardNameIcon} aria-hidden />
            </a>
          ) : (
            <span className={styles.cardName}>{name}</span>
          )}
          <span className={styles.meta}>
            {persona.handle ? (
              <span className={styles.handle}>@{persona.handle}</span>
            ) : null}
            {kindLabelKey ? (
              <span className={styles.kind}>{t(kindLabelKey)}</span>
            ) : null}
          </span>
        </div>
        {actions ? <div className={styles.cardActions}>{actions}</div> : null}
      </div>
      <Collapse isOpen={hiddenState !== null}>
        {shownHiddenState ? (
          <p className={styles.cardState}>
            <AdminChip tone="amber" className={styles.cardStateChip}>
              {t(LEAD_PERSONA_STATE_KEY[shownHiddenState])}
            </AdminChip>
          </p>
        ) : null}
      </Collapse>
    </div>
  );
}
