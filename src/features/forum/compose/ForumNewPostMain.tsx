import { useId, useRef, useState, type RefObject } from "react";
import { FiCommand } from "react-icons/fi";
import { Collapse, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ComposeBlocksRow } from "./ComposeBlocksRow";
import { ComposeBodyField } from "./ComposeBodyField";
import { ComposeFooter } from "./ComposeFooter";
import { ComposeKindChips } from "./ComposeKindChips";
import { ComposeNudgeList } from "./ComposeNudgeList";
import { ComposePhotoAttach, ComposePhotoGrid } from "./ComposePhotoGrid";
import { ComposePollPanel } from "./ComposePollPanel";
import { ComposePrompts } from "./ComposePrompts";
import { ComposeTitleField } from "./ComposeTitleField";
import { ComposeWarningsPanel } from "./ComposeWarningsPanel";
import { ForumNewPostSections } from "./ForumNewPostSections";
import { emptyPoll } from "./useComposeThreadState";
import type { ComposeAudience, PublishMode } from "./composeThread.types";
import type { ComposeThreadPage } from "./useComposeThreadPage";
import styles from "./ForumNewPostPage.module.css";

// ── The writing column ──────────────────────────────────────────────────────
// The paper card: what kind of post this is, the words, what rides with them,
// and the four filing questions, closed by the sticky footer.
//
// It owns three things and no more, all of them about THIS card rather than
// about the post: the two panels the blocks row discloses, and where the caret
// goes when Enter leaves the title. Everything else is the page's, because the
// overlays and the publish need it too.
//
// The three blocks that come and go under the body (photos, content warnings,
// the poll) open and close through `Collapse`, so attaching one grows the card
// smoothly and everything below it glides down.

export interface ForumNewPostMainProps {
  page: ComposeThreadPage;
  communities: readonly ComposeAudience[];
  /** True while a publish request is in flight. */
  isPublishing: boolean;
  onPublish: (mode: PublishMode) => void;
  onCancel: () => void;
  onOpenShortcuts: () => void;
  /** Lets the page put the caret in the title after a starter chip seeds it. */
  titleRef: RefObject<HTMLTextAreaElement | null>;
}

export function ForumNewPostMain({
  page,
  communities,
  isPublishing,
  onPublish,
  onCancel,
  onOpenShortcuts,
  titleRef,
}: ForumNewPostMainProps) {
  const { t } = useTranslation();
  const { state, setters, photos } = page;
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const warningsPanelId = useId();
  const pollPanelId = useId();
  const [isWarningsPanelOpen, setIsWarningsPanelOpen] = useState(false);

  return (
    <div className={styles.main}>
      <div className={styles.mainHead}>
        <ComposeKindChips kind={state.kind} onKindChange={setters.setKind} />
        <div className={styles.mainHeadActions}>
          <IconButton
            aria-label={t("forum:composePage.shortcuts.title")}
            size="sm"
            onClick={onOpenShortcuts}
          >
            <FiCommand aria-hidden />
          </IconButton>
        </div>
      </div>

      <div className={styles.mainBody}>
        <ComposePrompts
          title={state.title}
          body={state.body}
          onPickPrompt={(title) => {
            setters.setTitle(title);
            // Every starter line is a question, so the chip answers the kind
            // chips too — but only while the member has not answered them
            // themselves, because re-picking a kind also re-defaults the
            // category.
            if (!state.kind) setters.setKind("question");
            // The member is now looking at a title they did not type: land the
            // caret in it, so the next keystroke edits their own words rather
            // than starting somewhere else on the page.
            titleRef.current?.focus();
          }}
        />

        <ComposeTitleField
          title={state.title}
          onTitleChange={setters.setTitle}
          kind={state.kind}
          titleTip={page.titleTip}
          textareaRef={titleRef}
          onEnterKey={() => bodyRef.current?.focus()}
        />

        <ComposeBodyField
          body={state.body}
          onBodyChange={setters.setBody}
          kind={state.kind}
          wordCount={page.wordCount}
          textareaRef={bodyRef}
          attachSlot={
            <ComposePhotoAttach
              inputRef={photos.inputRef}
              onOpenPicker={photos.openPicker}
              onAddFiles={(files) => void photos.addFiles(files)}
              hasReachedLimit={photos.hasReachedLimit}
              isUploading={photos.isUploading}
              error={photos.error}
            />
          }
        />

        <Collapse isOpen={state.photos.length > 0}>
          <ComposePhotoGrid
            photos={state.photos}
            onAltChange={photos.setAlt}
            onRemove={photos.remove}
            onMove={photos.move}
          />
        </Collapse>

        <ComposeBlocksRow
          isContentWarningPanelOpen={isWarningsPanelOpen}
          onToggleContentWarningPanel={() =>
            setIsWarningsPanelOpen((isOpen) => !isOpen)
          }
          contentWarningPanelId={warningsPanelId}
          hasPoll={!!state.poll}
          onTogglePoll={() => setters.setPoll(state.poll ? null : emptyPoll())}
          pollPanelId={pollPanelId}
        />

        <Collapse isOpen={isWarningsPanelOpen}>
          <ComposeWarningsPanel
            id={warningsPanelId}
            selectedWarnings={state.contentWarnings}
            onToggleWarning={setters.toggleContentWarning}
          />
        </Collapse>

        <Collapse isOpen={!!state.poll}>
          {state.poll && (
            <ComposePollPanel
              id={pollPanelId}
              poll={state.poll}
              onSetOption={setters.setPollOption}
              onAddOption={setters.addPollOption}
              onRemoveOption={setters.removePollOption}
              onSetAllowMultiple={setters.setPollAllowMultiple}
              onSetCloses={setters.setPollCloses}
            />
          )}
        </Collapse>

        <ComposeNudgeList
          nudges={page.nudges}
          onDismiss={page.dismissNudge}
          isDoxxingAcknowledged={page.isDoxxingAcknowledged}
          onAcknowledgeDoxxing={page.setDoxxingAcknowledged}
        />

        <ForumNewPostSections page={page} communities={communities} />
      </div>

      <ComposeFooter
        draftStatus={page.draftStatus}
        blockers={page.blockers}
        canPublish={page.canPublish}
        isPublishing={isPublishing}
        onCancel={onCancel}
        onPublish={onPublish}
      />
    </div>
  );
}
