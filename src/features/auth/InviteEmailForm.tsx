import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDraftsActions } from "../../app/providers/DraftsProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { Draft, DraftAction, DraftMeta } from "../members/drafts.data";
import { SENDER_NAME } from "./invite.data";
import styles from "./InvitePage.module.css";

interface InviteEmailFormProps {
  onSent: (inviteeName: string) => void;
}

type DraftState = "idle" | "saving" | "saved";

/** Compose the cross-app Drafts entry for an in-progress invite. Chrome copy,
 *  authored here rather than fetched, so it routes through `t()`. */
function buildInviteDraft(
  t: TFunction,
  draftId: string,
  first: string,
  know: string,
  filled: number,
): Draft {
  const name = first.trim();
  const meta: DraftMeta[] = [
    {
      kind: "custom",
      label: t("auth:invite.draft.savedJustNow"),
      variant: "pulse",
    },
  ];
  const actions: DraftAction[] = [
    { label: t("auth:common.resume"), variant: "primary" },
    { label: t("auth:common.delete"), variant: "danger", deletes: true },
  ];
  return {
    id: draftId,
    kind: "INVITE",
    kindVariant: "post",
    title: t("auth:invite.draft.title", {
      name: name || t("auth:invite.draft.titleFallbackName"),
    }),
    desc: know.trim() || t("auth:invite.draft.descFallback"),
    meta,
    progress: Math.min(95, 25 + filled * 25),
    actions,
  };
}

export function InviteEmailForm({ onSent }: InviteEmailFormProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { addDraft, removeDraft } = useDraftsActions();
  const [first, setFirst] = useState("");
  const [know, setKnow] = useState("");
  const [note, setNote] = useState("");
  const [draftState, setDraftState] = useState<DraftState>("idle");
  // One stable id per form session so re-saving updates the same Drafts entry.
  const [draftId] = useState(() => `invite-${Date.now()}`);

  function saveDraft() {
    if (draftState === "saving") return;
    setDraftState("saving");
    // Simulate a write — flips to a persisted "Saved" confirmation and pushes a
    // real entry onto the cross-app Drafts store.
    window.setTimeout(() => {
      const filled = [first, know, note].filter((v) => v.trim()).length;
      removeDraft(draftId); // replace any earlier save of this same draft
      addDraft(buildInviteDraft(t, draftId, first, know, filled));
      setDraftState("saved");
      showToast(t("auth:invite.draft.savedToast"), "success");
    }, 650);
  }

  /** Editing after a save means there's something new to save again. */
  function markDirty() {
    setDraftState((s) => (s === "saved" ? "idle" : s));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSent(first.trim() || "Rosa");
      }}
    >
      <div className={styles.card}>
        <div className={styles.twoCol}>
          <FormField label={t("auth:invite.email.firstName.label")}>
            <input
              type="text"
              placeholder={t("auth:invite.email.firstName.placeholder")}
              value={first}
              onChange={(e) => {
                setFirst(e.target.value);
                markDirty();
              }}
            />
          </FormField>
          <FormField label={t("auth:invite.email.lastName.label")}>
            <input
              type="text"
              placeholder={t("auth:invite.email.lastName.placeholder")}
            />
          </FormField>
        </div>
        <FormField label={t("auth:invite.email.email.label")}>
          <input
            type="email"
            placeholder={t("auth:invite.email.email.placeholder")}
          />
        </FormField>
        <FormField
          label={t("auth:invite.email.howYouKnowThem.label")}
          labelAside={`${know.length}/300`}
          helper={t("auth:invite.email.howYouKnowThem.helper")}
        >
          <textarea
            maxLength={300}
            placeholder={t("auth:invite.email.howYouKnowThem.placeholder")}
            value={know}
            onChange={(e) => {
              setKnow(e.target.value);
              markDirty();
            }}
          />
        </FormField>
        <FormField
          label={
            <>
              {t("auth:invite.email.note.label")}{" "}
              <span
                style={{
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: 11,
                }}
              >
                {t("auth:common.optionalSuffix")}
              </span>
            </>
          }
          labelAside={`${note.length}/200`}
        >
          <textarea
            maxLength={200}
            placeholder={t("auth:invite.email.note.placeholder")}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              markDirty();
            }}
          />
        </FormField>
      </div>

      <div className={styles.epLabel}>
        {t("auth:invite.email.preview.label")}
      </div>
      <div className={styles.emailPreview}>
        <div className={styles.epContent}>
          <div className={styles.epBrand}>
            {"Queer"}
            <em>{"Pulse"}</em>
          </div>
          <div className={styles.epSubject}>
            {t("auth:invite.email.preview.subject", { name: SENDER_NAME })}
          </div>
          <div className={styles.epNote}>
            “{note.trim() || t("auth:invite.email.preview.noteFallback")}”
          </div>
          <div className={styles.epBtn}>
            {t("auth:invite.email.preview.openCta")}
          </div>
          <div className={styles.epExpire}>
            {t("auth:invite.email.preview.expiresIn7Days")}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit">{t("auth:invite.email.submit")}</Button>
        <Button
          type="button"
          variant="ghost"
          onClick={saveDraft}
          disabled={draftState !== "idle"}
        >
          {draftState === "saving" && t("auth:common.saving")}
          {draftState === "saved" && (
            <>
              <FiCheck aria-hidden /> {t("auth:invite.email.savedToDrafts")}
            </>
          )}
          {draftState === "idle" && t("auth:invite.email.saveAsDraft")}
        </Button>
      </div>
      <div className={styles.formNote}>{t("auth:invite.email.formNote")}</div>
    </form>
  );
}
