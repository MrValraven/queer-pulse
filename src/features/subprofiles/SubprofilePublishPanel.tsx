import { useState } from "react";
import { Button, SuccessPanel } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  PublishUnmetError,
  useSubprofileMutations,
} from "./api/useSubprofileMutations";
import { evaluatePublishRequirements } from "./subprofileDraftReadiness";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { useEditorFieldJump } from "./useEditorFieldJump";
import {
  FIELD_ANCHOR_ID,
  PUBLISH_REQUIREMENTS,
  requirementsFor,
} from "./publishChecklist.data";
import { PublishChecklist, SubprofilePolishList } from "./PublishChecklist";
import type { PublishAttempt } from "./PublishChecklist";
import { PersonaDangerZone } from "./PersonaDangerZone";
import { usePersonaCreatorSlug } from "./usePersonaCreatorSlug";
import { personaOwnerAddress } from "./personaLinks.data";
import sharedStyles from "./SubprofileEditor.module.css";
import styles from "./SubprofilePublishPanel.module.css";

/** Ties the Publish button to the line explaining why it's disabled. A fixed
 *  id is safe: one publish pane is mounted per editor. */
const PUBLISH_HINT_ID = "persona-publish-hint";

/** The unmet codes a LINKED persona's 422 can still carry, mapped to the same
 *  fail copy the unlinked checklist already shows for them: its handle is
 *  server-derived and the rest of the checklist does not apply, but the
 *  server can still refuse the derived handle (taken, reserved, invalid) or
 *  flag the screened text (a blocked term), and a linked persona has no
 *  checklist row to surface that through. */
const LINKED_HANDLE_FAIL_CODES = [
  "handle_invalid",
  "handle_reserved",
  "handle_taken",
  "handle_is_kind",
  "blocked_terms",
];
const LINKED_PUBLISH_FAIL_KEY: Record<string, string> = Object.fromEntries(
  PUBLISH_REQUIREMENTS.flatMap((requirement) =>
    Object.entries(requirement.failKey),
  ).filter(([code]) => LINKED_HANDLE_FAIL_CODES.includes(code)),
);

/** A past attempt, plus the screened text it actually judged. */
interface StoredAttempt extends PublishAttempt {
  screenedText: string;
}

/** The three fields the server's blocked-term screen reads, joined with a
 *  separator no field can contain, so "did the screened text change?" is one
 *  string comparison. Mirrors `containsBlockedTerm` on the backend. */
function screenedFieldsOf(meta: {
  displayName: string;
  bio: string;
  handle: string;
}): string {
  return [meta.displayName, meta.bio, meta.handle].join("\u0000");
}

/**
 * The publish surface: the live `PublishChecklist` (every requirement, judged
 * against the working editor state as it's typed) above the Publish action,
 * which stays DISABLED until the client-checkable requirements are met — so the
 * button is only offered when pressing it can work, and what's left is on
 * screen and clickable rather than discovered by being rejected. On success,
 * the plum success panel; published personas get an Unpublish action to return
 * to draft.
 *
 * A publish attempt still refines the list: "no blocked language" is
 * server-side only and a taken handle needs the availability round trip, so a
 * 422 fills in what the browser couldn't judge. Live mode may not surface the
 * `{unmet}` body, so a non-`PublishUnmetError` rejection leaves those rows in
 * their "still to check" state.
 *
 * Below all of that, the `PersonaDangerZone` band: this pane's
 * Publish/Unpublish mutations and the delete/leave actions are siblings on the
 * same persona, so pairing "make it live" with "get rid of it entirely" here
 * (rather than only on the dashboard) keeps every persona-lifecycle action in
 * one place.
 */
export function SubprofilePublishPanel({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { publish, unpublish } = useSubprofileMutations();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const editor = useSubprofileEditorContext();
  const jumpToField = useEditorFieldJump();
  const [storedAttempt, setStoredAttempt] = useState<StoredAttempt | null>(
    null,
  );
  const [justPublished, setJustPublished] = useState(false);

  const isPublished = subprofile.status === "published";
  const isLinked = subprofile.linkVisibility === "linked";
  // Read off the LIVE editor snapshot (meta fields + working rows), not the
  // saved persona, so the list tracks unsaved edits as they're made.
  const clientCodes = evaluatePublishRequirements(editor, subprofile.kind);
  const unmetCount = Object.values(clientCodes).filter(Boolean).length;
  const hasRequirements = requirementsFor(subprofile.linkVisibility).length > 0;
  // Publish verifies the SAVED server row. With unsaved edits in the editor,
  // the check would run against a stale (often empty) row and reject — so gate
  // Publish behind a Save first rather than firing it against stale state.
  const { dirty } = editor;

  // An attempt answers for the text it was SENT with. Once any screened field
  // changes, its verdict on the one thing only the server can judge (blocked
  // language, and a taken handle) no longer describes what's on screen, so it
  // is dropped and those rows return to "still to check". Derived rather than
  // cleared in an effect: the attempt and the fields it judged are read in the
  // same render, so the list can never paint one frame of a stale verdict.
  const screenedText = screenedFieldsOf(editor.meta);
  const attempt: PublishAttempt | null =
    storedAttempt && storedAttempt.screenedText === screenedText
      ? storedAttempt
      : null;

  // Where the now-live persona can be viewed: its handle once it has one,
  // else the nested fallback under the CREATOR's main profile (the only
  // slug that route resolves by) for a legacy or demo linked row that never
  // got one. Reading the signed-in member's slug here sent every co-owner of a
  // shared persona to a not-found wall.
  const creatorSlug = usePersonaCreatorSlug(
    subprofile.id,
    subprofile.memberCount,
  );
  const ownerAddress = personaOwnerAddress(subprofile, creatorSlug);
  const livePath = ownerAddress.status === "ready" ? ownerAddress.path : null;

  async function onPublish() {
    setStoredAttempt(null);
    try {
      await publish.mutateAsync(subprofile.id);
      setJustPublished(true);
      showToast(t("subprofiles:publishPanel.toastLive"), "success");
    } catch (err) {
      if (err instanceof PublishUnmetError) {
        setStoredAttempt({ unmet: err.unmet, unknown: false, screenedText });
        // A linked persona renders no checklist (it has no requirements), so
        // a 422 here would otherwise fail silently: surface it as a toast and
        // send the owner to the one field it can still be about.
        if (!hasRequirements) {
          // Map each unmet code to its fail-copy key first, then narrow with
          // the type guard below: indexing a `Record` after a separate
          // `find` on the codes would leave the value typed
          // `string | undefined` for the compiler, even though the key is
          // known present.
          const failMessageKey = err.unmet
            .map((code) => LINKED_PUBLISH_FAIL_KEY[code])
            .find((key): key is string => key !== undefined);
          if (failMessageKey) {
            showToast(t(failMessageKey), "error");
            jumpToField({ pane: "address", anchors: [FIELD_ANCHOR_ID.handle] });
          } else {
            showToast(t("subprofiles:publishPanel.toastPublishError"), "error");
          }
        }
      } else {
        setStoredAttempt({ unmet: [], unknown: true, screenedText });
        showToast(t("subprofiles:publishPanel.toastPublishError"), "error");
      }
    }
  }

  async function onUnpublish() {
    try {
      await unpublish.mutateAsync(subprofile.id);
      setJustPublished(false);
      setStoredAttempt(null);
      showToast(t("subprofiles:publishPanel.toastUnpublished"), "info");
    } catch {
      showToast(t("subprofiles:publishPanel.toastError"), "error");
    }
  }

  if (justPublished) {
    return (
      <SuccessPanel
        title={t("subprofiles:publishPanel.successTitle")}
        em={t("subprofiles:publishPanel.successEm")}
        onClose={() => setJustPublished(false)}
        closeLabel={t("subprofiles:publishPanel.closeLabel")}
        footer={
          livePath && (
            <Button variant="ghost-dark" to={livePath}>
              {t("subprofiles:publishPanel.viewLive")}
            </Button>
          )
        }
      >
        {isLinked
          ? t("subprofiles:publishPanel.successLinked")
          : t("subprofiles:publishPanel.successUnlinked")}
      </SuccessPanel>
    );
  }

  // What keeps Publish disabled, if anything. Unmet requirements come first:
  // with a requirement outstanding, "save your changes" would be the wrong
  // thing to go and do.
  const blockedHintKey =
    unmetCount > 0
      ? "subprofiles:publishPanel.blockedHint"
      : dirty
        ? "subprofiles:publishPanel.saveFirstHint"
        : null;

  return (
    <div className="ed-grid">
      {/* Nothing for a linked persona: it publishes on its display name alone,
          so the checklist renders null and the wrapper goes with it. */}
      {hasRequirements && (
        <div className={sharedStyles.checklistWrap}>
          <PublishChecklist
            clientCodes={clientCodes}
            attempt={attempt}
            linkVisibility={subprofile.linkVisibility}
            onJump={jumpToField}
          />
        </div>
      )}

      <div className={sharedStyles.publishBar}>
        <p className={sharedStyles.publishCopy}>
          {isPublished
            ? t("subprofiles:publishPanel.copyPublished")
            : isLinked
              ? t("subprofiles:publishPanel.copyLinkedUnpublished")
              : t("subprofiles:publishPanel.copyUnlinkedUnpublished")}
        </p>
        <div className={sharedStyles.publishActions}>
          {isPublished && (
            <Button
              variant="ghost"
              onClick={() => void onUnpublish()}
              disabled={unpublish.isPending}
            >
              {unpublish.isPending
                ? t("subprofiles:publishPanel.working")
                : t("subprofiles:publishPanel.moveToDraft")}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => void onPublish()}
            disabled={publish.isPending || dirty || unmetCount > 0}
            // A disabled button explains nothing on its own; point at the line
            // below that says which of the two reasons it is.
            aria-describedby={blockedHintKey ? PUBLISH_HINT_ID : undefined}
          >
            {publish.isPending
              ? t("subprofiles:publishPanel.publishing")
              : isPublished
                ? t("subprofiles:publishPanel.recheck")
                : t("subprofiles:publishPanel.publish")}
          </Button>
        </div>
        {blockedHintKey && (
          <p
            id={PUBLISH_HINT_ID}
            className={styles.saveFirstHint}
            role="status"
          >
            {t(blockedHintKey, { count: unmetCount })}
          </p>
        )}
      </div>

      <SubprofilePolishList subprofile={subprofile} />

      <PersonaDangerZone subprofile={subprofile} />
    </div>
  );
}
