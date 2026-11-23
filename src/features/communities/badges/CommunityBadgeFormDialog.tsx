import { useId, useRef, useState, type FormEvent } from "react";
import { Button, Modal } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityBadgeAdminDTO } from "./api/communityBadges.api";
import {
  useCreateCommunityBadge,
  useUpdateCommunityBadge,
} from "./api/useCommunityBadgeMutations";
import {
  createBodyFromDraft,
  draftFieldProblem,
  draftFromAdminBadge,
  draftProblems,
  draftWithRule,
  emptyCommunityBadgeDraft,
  isThresholdLowered,
  previewFlairFromDraft,
  refusalField,
  updateBodyFromDraft,
  type CommunityBadgeCheckedField,
  type CommunityBadgeDraft,
  type CommunityBadgeDraftProblem,
  type CommunityBadgeFormField,
} from "./communityBadgeForm.model";
import { communityBadgeDisplayName } from "./communityBadgeDisplayName";
import {
  communityBadgeErrorText,
  communityBadgeRefusal,
} from "./communityBadgeErrors";
import { COMMUNITY_BADGE_NAME_MAX_LENGTH } from "./communityBadges.catalog";
import {
  CommunityBadgeFormPreview,
  CommunityBadgeIconPicker,
  CommunityBadgeRuleField,
  CommunityBadgeTextField,
  CommunityBadgeTintPicker,
} from "./CommunityBadgeFormPickers";
import styles from "./ModToolsBadges.module.css";

export type CommunityBadgeFormMode =
  { kind: "create" } | { kind: "edit"; badge: CommunityBadgeAdminDTO };

/** The refusal held under each field, from the form or the server. A field
 *  with nothing to say has no entry. */
type FieldRefusals = Partial<Record<CommunityBadgeFormField, unknown>>;

/**
 * Create a badge, or edit one. The form checks the name and the number the
 * way the server does when the owner leaves a field they changed and again
 * before it sends, and a refusal from either lands under the field it names
 * and only there; a refusal no field owns is a toast. The preview draws the
 * badge as it will sit beside a member's name. Mount it inside
 * `<AnimatePresence>`.
 */
export function CommunityBadgeFormDialog({
  slug,
  mode,
  onClose,
}: {
  slug: string;
  mode: CommunityBadgeFormMode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const formId = useId();
  const editedBadge = mode.kind === "edit" ? mode.badge : null;
  const [draft, setDraft] = useState<CommunityBadgeDraft>(() =>
    editedBadge ? draftFromAdminBadge(editedBadge) : emptyCommunityBadgeDraft(),
  );
  const [refusals, setRefusals] = useState<FieldRefusals>({});
  // Fields the owner has typed in or picked: only those get the blur check,
  // so tabbing past an untouched field, or closing, raises nothing.
  const changedFields = useRef(new Set<CommunityBadgeFormField>());
  const createBadge = useCreateCommunityBadge(slug);
  const updateBadge = useUpdateCommunityBadge(slug);
  const isPending = createBadge.isPending || updateBadge.isPending;

  const errorFor = (field: CommunityBadgeFormField): string | null =>
    refusals[field] === undefined
      ? null
      : communityBadgeErrorText(refusals[field], t, fmt);

  const setFieldRefusal = (field: CommunityBadgeFormField, error: unknown) =>
    setRefusals((previous) => ({ ...previous, [field]: error }));

  const refuseProblem = (problem: CommunityBadgeDraftProblem) =>
    setFieldRefusal(
      problem.field,
      communityBadgeRefusal(problem.code, { ruleType: draft.ruleType }),
    );

  const change = (
    patch: Partial<CommunityBadgeDraft>,
    field: CommunityBadgeFormField,
  ) => {
    setDraft((previous) => ({ ...previous, ...patch }));
    changedFields.current.add(field);
    if (refusals[field] !== undefined) setFieldRefusal(field, undefined);
  };

  const checkOnBlur = (field: CommunityBadgeCheckedField) => {
    if (!changedFields.current.has(field)) return;
    const problem = draftFieldProblem(draft, field);
    if (problem) refuseProblem(problem);
  };

  const handleRefusal = (error: unknown) => {
    const field = refusalField(error);
    if (field) setFieldRefusal(field, error);
    else showToast(communityBadgeErrorText(error, t, fmt), "error");
  };

  const finish = (badge: CommunityBadgeAdminDTO, toastKey: string) => {
    showToast(
      t(toastKey, { badge: communityBadgeDisplayName(badge, t) }),
      "success",
    );
    onClose();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problems = draftProblems(draft);
    problems.forEach(refuseProblem);
    if (problems.length > 0) return;
    if (editedBadge) {
      updateBadge.mutate(
        {
          badgeId: editedBadge.id,
          body: updateBodyFromDraft(draft, editedBadge),
        },
        {
          onSuccess: (badge) =>
            finish(badge, "communities:badges.form.savedToast"),
          onError: handleRefusal,
        },
      );
      return;
    }
    createBadge.mutate(createBodyFromDraft(draft), {
      onSuccess: (badge) =>
        finish(badge, "communities:badges.form.createdToast"),
      onError: handleRefusal,
    });
  };

  return (
    <Modal
      wide
      title={
        editedBadge
          ? t("communities:badges.form.editTitle", {
              badge: communityBadgeDisplayName(editedBadge, t),
            })
          : t("communities:badges.form.createTitle")
      }
      onClose={onClose}
      footer={
        <div className={styles.formActions}>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            {t("communities:badges.form.cancel")}
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {editedBadge
              ? t("communities:badges.form.save")
              : t("communities:badges.manage.create")}
          </Button>
        </div>
      }
    >
      <form id={formId} className={styles.form} onSubmit={submit} noValidate>
        <CommunityBadgeTextField
          label={t("communities:badges.form.name")}
          labelAside={t("communities:badges.counter", {
            count: [...draft.name].length,
            max: COMMUNITY_BADGE_NAME_MAX_LENGTH,
          })}
          error={errorFor("name")}
        >
          <input
            type="text"
            value={draft.name}
            onChange={(event) => change({ name: event.target.value }, "name")}
            onBlur={() => checkOnBlur("name")}
          />
        </CommunityBadgeTextField>
        <CommunityBadgeIconPicker
          value={draft.iconKey}
          onChange={(iconKey) => change({ iconKey }, "icon")}
          error={errorFor("icon")}
        />
        <CommunityBadgeTintPicker
          value={draft.tint}
          onChange={(tint) => change({ tint }, "tint")}
          error={errorFor("tint")}
        />
        <CommunityBadgeRuleField
          isRuleLocked={editedBadge !== null}
          ruleType={draft.ruleType}
          onRuleChange={(ruleType) =>
            change(draftWithRule(draft, ruleType), "threshold")
          }
          threshold={draft.threshold}
          onThresholdChange={(threshold) => change({ threshold }, "threshold")}
          onThresholdBlur={() => checkOnBlur("threshold")}
          thresholdError={errorFor("threshold")}
          isLowered={
            editedBadge !== null && isThresholdLowered(draft, editedBadge)
          }
        />
        {editedBadge === null && (
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={draft.isEnabled}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  isEnabled: event.target.checked,
                }))
              }
            />
            <span>{t("communities:badges.form.enabled")}</span>
          </label>
        )}
        <CommunityBadgeFormPreview
          flair={previewFlairFromDraft(draft, editedBadge?.starterKey ?? null)}
        />
      </form>
    </Modal>
  );
}
