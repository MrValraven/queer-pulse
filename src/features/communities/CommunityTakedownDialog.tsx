import { useId, useMemo, useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCommunity } from "./api/useCommunity";
import { CommunityRulePicker } from "./CommunityRulePicker";
import type { CommunityRuleOptionDTO } from "./api/communityBans.api";
import type { CommunityTakedownInput } from "./api/communities.api";
import styles from "./CommunityRuleCitation.module.css";

/** The server's own ceilings (`RemoveCommunityPostDto`), so the field stops
 *  where the request would be refused rather than after it. */
const REASON_MAX_LENGTH = 500;
const NOTE_MAX_LENGTH = 1000;

/** What is coming down. The backend writes the same two values into the
 *  author's notification payload (`subject`), so the copy on both ends of the
 *  act reads about the same thing. */
export type CommunityTakedownSubject = "post" | "reply";

/**
 * The community's house rules as citation options.
 *
 * `CommunityDetailDTO.rules` is a plain `string[]` and the picker speaks the
 * `{ index, text }` shape a ban's citation already uses, so the index handed
 * back is the 0-based position the server resolves its snapshot from. Read
 * through `useCommunity`, which owns the demo/live branch and answers from the
 * detail query the community page has already cached, so opening this dialog
 * costs no second request on the surface it is opened from.
 */
function useCommunityRuleOptions(slug: string): CommunityRuleOptionDTO[] {
  const { living } = useCommunity(slug);
  const rules = living?.rules;
  return useMemo(
    () => (rules ?? []).map((text, index) => ({ index, text })),
    [rules],
  );
}

/**
 * A moderator taking down somebody else's post or reply, with somewhere to say
 * why.
 *
 * Until now a takedown was silent: the author found a tombstone where their
 * words had been and had no way to learn what happened, since QueerPulse sends
 * no email and there is no way to message a community's moderators. The
 * reason and the cited house rule collected here travel to them with the
 * notification, and the whole decision is written to the community's own
 * governance log.
 *
 * THIS IS NOT THE AUTHOR'S DELETE. Somebody clearing their own words still
 * gets the plain confirmation (`ConfirmDeleteModal`): nothing is logged and
 * nobody is notified, because the only person who could be told is the one who
 * did it. The two are separate dialogs precisely so neither drifts into the
 * other.
 *
 * EVERY FIELD IS OPTIONAL and the dialog submits with all three empty. A
 * takedown blocked on a form is a takedown that does not happen when it needs
 * to. The copy is explicit about which of the three the author reads and which
 * one only the moderators see, because that split is how a private note ends
 * up in a member's notification.
 */
export function CommunityTakedownDialog({
  subject,
  slug,
  isBusy,
  onClose,
  onConfirm,
}: {
  subject: CommunityTakedownSubject;
  /** The community the content sits in, for its house rules. */
  slug: string;
  /** True while the delete is in flight, so the dialog stays mounted and busy
   *  until the server answers rather than confirming early. */
  isBusy: boolean;
  onClose: () => void;
  onConfirm: (takedown: CommunityTakedownInput) => void;
}) {
  const { t } = useTranslation();
  const rules = useCommunityRuleOptions(slug);
  const reasonId = useId();
  const reasonHintId = useId();
  const noteId = useId();
  const noteHintId = useId();
  const [reason, setReason] = useState("");
  const [ruleIndex, setRuleIndex] = useState<number | null>(null);
  const [internalNote, setInternalNote] = useState("");

  const isReply = subject === "reply";

  // Only what was actually written travels. An untouched field is absent
  // rather than sent as "", so the server stores nothing for it and the
  // author's notification says "no reason was recorded" instead of showing
  // them an empty pair of quotes.
  const submit = () => {
    const trimmedReason = reason.trim();
    const trimmedNote = internalNote.trim();
    onConfirm({
      ...(trimmedReason ? { reason: trimmedReason } : {}),
      ...(ruleIndex === null ? {} : { ruleIndex }),
      ...(trimmedNote ? { internalNote: trimmedNote } : {}),
    });
  };

  return (
    <Modal
      title={
        isReply
          ? t("communities:detail.modtools.takedown.reply.title")
          : t("communities:detail.modtools.takedown.post.title")
      }
      sub={
        isReply
          ? t("communities:detail.modtools.takedown.reply.body")
          : t("communities:detail.modtools.takedown.post.body")
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isBusy}>
            {t("communities:detail.modtools.takedown.cancelCta")}
          </Button>
          <Button variant="danger" onClick={submit} disabled={isBusy}>
            {isBusy
              ? t("communities:common.loading")
              : t("communities:detail.modtools.takedown.confirmCta")}
          </Button>
        </>
      }
    >
      <div className={styles.editorForm}>
        <div className={styles.editorGroup}>
          <label className={styles.editorLegend} htmlFor={reasonId}>
            {t("communities:detail.modtools.takedown.reasonLabel")}
          </label>
          <textarea
            id={reasonId}
            className={styles.editorTextarea}
            value={reason}
            maxLength={REASON_MAX_LENGTH}
            disabled={isBusy}
            aria-describedby={reasonHintId}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t(
              "communities:detail.modtools.takedown.reasonPlaceholder",
            )}
          />
          <p className={styles.editorHint} id={reasonHintId}>
            {t("communities:detail.modtools.takedown.reasonHint")}
          </p>
        </div>

        {/* The same citation control a ban uses, fed from the community's own
            current rules. Citing stays optional: some conduct no rule
            anticipated, and a community with no rules has nothing to cite. */}
        <CommunityRulePicker
          rules={rules}
          value={ruleIndex}
          onChange={setRuleIndex}
          disabled={isBusy}
        />

        <div className={styles.editorGroup}>
          <label className={styles.editorLegend} htmlFor={noteId}>
            {t("communities:detail.modtools.takedown.noteLabel")}
          </label>
          <textarea
            id={noteId}
            className={styles.editorTextarea}
            value={internalNote}
            maxLength={NOTE_MAX_LENGTH}
            disabled={isBusy}
            aria-describedby={noteHintId}
            onChange={(event) => setInternalNote(event.target.value)}
            placeholder={t(
              "communities:detail.modtools.takedown.notePlaceholder",
            )}
          />
          <p className={styles.editorHint} id={noteHintId}>
            {t("communities:detail.modtools.takedown.noteHint")}
          </p>
        </div>
      </div>
    </Modal>
  );
}
