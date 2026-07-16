import { useState } from "react";
import { Button, SuccessPanel } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  PublishUnmetError,
  useSubprofileMutations,
} from "./api/useSubprofileMutations";
import { PublishChecklist } from "./PublishChecklist";
import styles from "./SubprofileEditor.module.css";

interface ChecklistState {
  unmet: string[];
  unknown: boolean;
}

/**
 * The publish surface: a Publish action that, on a rejected completeness check,
 * feeds the unmet codes to `PublishChecklist`; on success, the plum success
 * panel. Published personas get an Unpublish action to return to draft. Live
 * mode may not surface the 422 `{unmet}` body, so a non-`PublishUnmetError`
 * rejection renders the checklist in its "still to check" state.
 */
export function SubprofilePublishPanel({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { publish, unpublish } = useSubprofileMutations();
  const { showToast } = useToast();
  const [checklist, setChecklist] = useState<ChecklistState | null>(null);
  const [justPublished, setJustPublished] = useState(false);

  const isPublished = subprofile.status === "published";
  const isLinked = subprofile.linkVisibility === "linked";

  async function onPublish() {
    setChecklist(null);
    try {
      await publish.mutateAsync(subprofile.id);
      setJustPublished(true);
      showToast("Your persona is live", "success");
    } catch (err) {
      if (err instanceof PublishUnmetError) {
        setChecklist({ unmet: err.unmet, unknown: false });
      } else {
        setChecklist({ unmet: [], unknown: true });
        showToast(
          "We couldn't publish — check the requirements below.",
          "error",
        );
      }
    }
  }

  async function onUnpublish() {
    try {
      await unpublish.mutateAsync(subprofile.id);
      setJustPublished(false);
      setChecklist(null);
      showToast("Back to draft — only you can see it now.", "info");
    } catch {
      showToast("We couldn't do that just now — try again.", "error");
    }
  }

  if (justPublished) {
    return (
      <SuccessPanel
        title="You're"
        em="live"
        onClose={() => setJustPublished(false)}
        closeLabel="Keep editing"
      >
        {isLinked
          ? "This persona now shows on your main profile as another side of you."
          : "This persona stands on its own now — people can find it by its handle and in the directory."}
      </SuccessPanel>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.publishBar}>
        <p className={styles.publishCopy}>
          {isPublished
            ? "This persona is live. Your edits save as you go."
            : isLinked
              ? "Publish to show this persona on your main profile."
              : "Publish to give this persona its own handle and a directory listing."}
        </p>
        <div className={styles.publishActions}>
          {isPublished && (
            <Button
              variant="ghost"
              onClick={onUnpublish}
              disabled={unpublish.isPending}
            >
              {unpublish.isPending ? "Working…" : "Move to draft"}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onPublish}
            disabled={publish.isPending}
          >
            {publish.isPending
              ? "Publishing…"
              : isPublished
                ? "Re-check & publish"
                : "Publish"}
          </Button>
        </div>
      </div>
      {checklist && (
        <div className={styles.checklistWrap}>
          <PublishChecklist
            unmet={checklist.unmet}
            unknown={checklist.unknown}
          />
        </div>
      )}
    </div>
  );
}
