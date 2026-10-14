import { useId } from "react";
import { Avatar, Button, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isStudioCreditRole,
  type StudioPersonaRefView,
} from "./api/studio.adapters";
import { STUDIO_CREDIT_ROLES, type StudioCreditRole } from "./api/studio.types";
import type { StudioLoadState } from "./api/studioLoadState";
import { StudioLoadError } from "./StudioLoadStates";
import { STUDIO_CREDIT_ROLE_LABEL_KEY } from "./studioDiscoveryLabels";
import css from "./StudioCreditEditor.module.css";

/** The preview for an exact handle: the persona's public card, a role and
 *  "Credit {name}", or the line saying no public persona has that handle.
 *  The card reads the persona alone; its member never reaches the client. */
export function StudioCreditCandidateCard({
  candidate,
  loadState,
  role,
  onRoleChange,
  onAdd,
  onClear,
  isAdding,
}: {
  candidate: StudioPersonaRefView | null;
  loadState: StudioLoadState;
  role: StudioCreditRole;
  onRoleChange: (role: StudioCreditRole) => void;
  onAdd: () => void;
  onClear: () => void;
  isAdding: boolean;
}) {
  const { t } = useTranslation();
  const roleFieldId = useId();
  if (loadState.isNotFound)
    return (
      <p className={css.note} role="status">
        {t("studio:credits.editor.notFound")}
      </p>
    );
  if (loadState.isError) return <StudioLoadError loadState={loadState} />;
  if (!candidate)
    return (
      <p className={css.note} role="status">
        {t("studio:credits.editor.finding")}
      </p>
    );
  return (
    <div className={css.candidate}>
      <div className={css.candidatePersona}>
        <Avatar
          initials={candidate.initials}
          src={candidate.avatarUrl ?? undefined}
          size={40}
          alt=""
        />
        <div className={css.candidateText}>
          <span className={css.candidateName}>{candidate.name}</span>
          <span className={css.candidateHandle}>
            {t("studio:credits.editor.handleLine", {
              handle: candidate.handle,
            })}
          </span>
        </div>
      </div>
      <div className={css.candidateRole}>
        <label htmlFor={roleFieldId} className={css.fieldLabel}>
          {t("studio:credits.editor.roleLabel")}
        </label>
        <Select
          id={roleFieldId}
          size="sm"
          options={STUDIO_CREDIT_ROLES.map((option) => ({
            value: option,
            label: t(STUDIO_CREDIT_ROLE_LABEL_KEY[option]),
          }))}
          value={role}
          onChange={(value) => {
            if (isStudioCreditRole(value)) onRoleChange(value);
          }}
        />
      </div>
      <div className={css.candidateActions}>
        <Button variant="ghost" onClick={onClear}>
          {t("studio:credits.editor.clearCta")}
        </Button>
        <Button
          variant="primary"
          aria-disabled={isAdding || undefined}
          aria-busy={isAdding || undefined}
          onClick={onAdd}
        >
          {t("studio:credits.editor.addCta", { name: candidate.name })}
        </Button>
      </div>
    </div>
  );
}
