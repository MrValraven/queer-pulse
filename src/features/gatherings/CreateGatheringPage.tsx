import {
  useEffect,
  useMemo,
  useRef,
  type ComponentType,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { Button, Eyebrow } from "../../shared/components/ui";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useMediaQuery, useUnsavedChangesGuard } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CreatorDraftConflictStrip } from "../creatorDrafts/CreatorDraftConflictStrip";
import { CreatorDraftNotice } from "../creatorDrafts/CreatorDraftNotice";
import { useIsQuizshowVisible } from "../quizshow/quizshowLaunch";
import { useEvent } from "./api/useEvent";
import { CreateGatheringChapter } from "./CreateGatheringChapter";
import { CreateGatheringMobileBar } from "./CreateGatheringMobileBar";
import { CreateGatheringReview } from "./CreateGatheringReview";
import { CreateGatheringSuccess } from "./CreateGatheringSuccess";
import {
  COMPACT_LAYOUT_QUERY,
  CREATE_GATHERING_CHAPTERS,
  PLEDGE_TEXT_KEYS,
  GATE_ANCHOR,
  REVIEW_CHAPTER_INDEX,
  chapterHeadId,
  chapterIndexOf,
  chapterSectionId,
  confirmAnchor,
  type CreateGatheringChapterId,
} from "./createGathering.data";
import {
  afterRender,
  chapterNeeds,
  chapterSummary,
  focusOpenChapterHead,
  isChapterComplete,
  publishReadiness,
  revealSection,
} from "./createGatheringChapters";
import {
  CREATE_GATHERING_COMMUNITY_PARAM,
  DUPLICATE_GATHERING_PARAM,
} from "./data";
import { DraftResumeStrip, SavedIndicator } from "./DraftResumeStrip";
import { useEventHostScope } from "./eventHostScope";
import { gatheringToFormSeed } from "./gatheringSeed";
import { GatheringPreviewPanel } from "./preview/GatheringPreviewPanel";
import { AccessChapter } from "./steps/AccessChapter";
import { CareChapter } from "./steps/CareChapter";
import { WhatChapter } from "./steps/WhatChapter";
import { WhenWhereChapter } from "./steps/WhenWhereChapter";
import { RUN_BY_FIELD_ANCHOR } from "./steps/RunByField";
import { WhoChapter } from "./steps/WhoChapter";
import {
  useCreateGatheringChapterFlow,
  type CreateGatheringChapterFlow,
} from "./useCreateGatheringChapterFlow";
import {
  createGatheringDraftKey,
  useCreateGatheringDraft,
  type DraftSaveStatus,
} from "./useCreateGatheringDraft";
import { useGatheringForm, type GatheringForm } from "./useGatheringForm";
import { useDropUnhostableCommunity } from "./useHostableCommunities";
import { usePublishGathering } from "./usePublishGathering";
import styles from "./CreateGatheringShell.module.css";

/** Each asking chapter's body. Every body receives `{ form }` and nothing
 *  else. The review chapter's body is built by the page, since it also
 *  carries the readiness and the publish handler. */
const CHAPTER_BODIES: Record<
  Exclude<CreateGatheringChapterId, "review">,
  ComponentType<{ form: GatheringForm }>
> = {
  what: WhatChapter,
  whenWhere: WhenWhereChapter,
  who: WhoChapter,
  access: AccessChapter,
  care: CareChapter,
};

/** Eyebrow, serif title, lead, the draft's saved line and team note, and
 *  Cancel. */
function CreateGatheringHead({
  saveStatus,
  isNoteShown,
}: {
  saveStatus: DraftSaveStatus;
  isNoteShown: boolean;
}) {
  const { t } = useTranslation();
  const { homePath } = useEventHostScope();
  return (
    <header className={styles.head}>
      <div>
        <Eyebrow className={styles.eyebrow}>
          {t("gatherings:create.eyebrow")}
        </Eyebrow>
        <h1 className={styles.title}>
          <Translation
            i18nKey="gatherings:create.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>{t("gatherings:create.v2.lead")}</p>
        <SavedIndicator status={saveStatus} />
        <CreatorDraftNotice
          messageKey="gatherings:creatorDraftNote.body"
          isShown={isNoteShown}
          className={styles.note}
        />
      </div>
      <div className={styles.headActions}>
        <Button variant="ghost" to={homePath ?? routes.host}>
          {t("gatherings:create.nav.cancel")}
        </Button>
      </div>
    </header>
  );
}

/** The six chapters, each wrapped around its own body. The review chapter
 *  has no Continue: its body ends with Publish. */
function ChapterList({
  form,
  chapterFlow,
  reviewBody,
}: {
  form: GatheringForm;
  chapterFlow: CreateGatheringChapterFlow;
  reviewBody: ReactNode;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <>
      {CREATE_GATHERING_CHAPTERS.map((chapter, chapterIndex) => {
        const ChapterBody =
          chapter.id === "review" ? null : CHAPTER_BODIES[chapter.id];
        const hasBeenContinued =
          chapterFlow.continuedChapters[chapterIndex] === true;
        return (
          <CreateGatheringChapter
            key={chapter.id}
            chapterIndex={chapterIndex}
            titleKey={chapter.titleKey}
            introKey={chapter.introKey}
            isOptional={chapter.isOptional}
            isOpen={chapterFlow.openChapterIndex === chapterIndex}
            isDone={hasBeenContinued && isChapterComplete(form, chapterIndex)}
            hasBeenContinued={hasBeenContinued}
            summary={chapterSummary(form, chapterIndex, { t, fmt })}
            visibleNeeds={
              chapterFlow.attemptedChapters[chapterIndex] === true
                ? chapterNeeds(form, chapterIndex)
                : []
            }
            onToggle={() => chapterFlow.toggleChapter(chapterIndex)}
            {...(ChapterBody
              ? {
                  onContinue: () =>
                    chapterFlow.continueFromChapter(chapterIndex),
                }
              : {})}
          >
            {ChapterBody ? <ChapterBody form={form} /> : reviewBody}
          </CreateGatheringChapter>
        );
      })}
    </>
  );
}

/** The draft's two strips over the chapters: "Resume your draft?" and the
 *  conflict choice. Both fold in and out; while the resume strip folds away
 *  the Collapse keeps rendering it with its last offer. */
function CreateGatheringDraftStrips({
  draft,
  chapterFlow,
}: {
  draft: ReturnType<typeof useCreateGatheringDraft>;
  chapterFlow: CreateGatheringChapterFlow;
}) {
  // Both strip answers remove the strip with focus on it, so focus moves to
  // the chapter head the host continues from. A complete draft resumes on the
  // review chapter, which is revealed like Continue reveals it, so its recap
  // and Publish come into view with its head. The chapter the resume opens is
  // only known once it renders, so the head's `aria-expanded` tells.
  const handleResume = () => {
    draft.resume();
    chapterFlow.openAfterResume();
    afterRender(() => {
      const isReviewOpen =
        document
          .getElementById(chapterHeadId(REVIEW_CHAPTER_INDEX))
          ?.getAttribute("aria-expanded") === "true";
      if (isReviewOpen) {
        revealSection(
          chapterSectionId(REVIEW_CHAPTER_INDEX),
          chapterHeadId(REVIEW_CHAPTER_INDEX),
        );
        return;
      }
      focusOpenChapterHead();
    });
  };

  const handleStartFresh = () => {
    draft.startFresh();
    afterRender(focusOpenChapterHead);
  };

  return (
    <>
      <Collapse isOpen={draft.resumeOffer !== null}>
        {draft.resumeOffer && (
          <DraftResumeStrip
            offer={draft.resumeOffer}
            onResume={handleResume}
            onStartFresh={handleStartFresh}
          />
        )}
      </Collapse>
      <CreatorDraftConflictStrip
        isOpen={draft.conflict !== null}
        isBusy={draft.isConflictBusy}
        isServerDraftGone={draft.conflict?.revision === null}
        onLoadNewer={draft.loadNewer}
        onKeepThisVersion={draft.keepThisVersion}
      />
    </>
  );
}

/** The route. A demo switch remounts the wizard, so a form typed in one mode
 *  never autosaves into the other mode's draft slot. */
export function CreateGatheringPage() {
  const { demoMode } = useDemoMode();
  return <CreateGatheringWizard key={demoMode ? "demo" : "live"} />;
}

export interface CreateGatheringWizardProps {
  /** The frame around the wizard and its success screen. The member route
   *  uses the site's `PageShell`. */
  Frame?: ComponentType<{ children: ReactNode }>;
  /** Replaces the default head (eyebrow, title, saved line, Cancel). */
  head?: ReactNode;
}

/**
 * The whole create flow, inside whatever host scope wraps it. In the member
 * scope it behaves as the route always has. An event QueerPulse hosts
 * (`scope.isHouseEvent`) ignores `?community=` and `?duplicate=`, starts on
 * the scope's fixed family, and never offers, saves or forgets the signed-in
 * staff member's own event draft.
 */
export function CreateGatheringWizard({
  Frame = PageShell,
  head,
}: CreateGatheringWizardProps = {}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const scope = useEventHostScope();
  const { isHouseEvent } = scope;
  // A community's Events tab links here as `?community=<slug>` so the host
  // lands with that community already picked (see `createGatheringPath`). Read
  // once, on mount, by the form hook.
  const [searchParams] = useSearchParams();
  const communitySlugParam = isHouseEvent
    ? ""
    : (searchParams.get(CREATE_GATHERING_COMMUNITY_PARAM) ?? "");
  // "Duplicate gathering" (PRD-190): `?duplicate=<slug>` fetches that gathering and
  // seeds the wizard from it whenever the fetch lands. `useMemo` keeps the
  // seed's identity stable so it is applied exactly once.
  const duplicateSlug = isHouseEvent
    ? null
    : searchParams.get(DUPLICATE_GATHERING_PARAM);
  const { data: duplicateSource } = useEvent(duplicateSlug ?? undefined);
  const isQuizshowVisible = useIsQuizshowVisible();
  const seed = useMemo(
    () =>
      duplicateSlug && duplicateSource
        ? gatheringToFormSeed(duplicateSource.gathering)
        : undefined,
    [duplicateSlug, duplicateSource],
  );
  const form = useGatheringForm({
    communitySlug: communitySlugParam,
    ...(seed ? { seed } : {}),
    fixedFamily: scope.fixedFamily ?? undefined,
  });
  useDropUnhostableCommunity(form);
  const chapterFlow = useCreateGatheringChapterFlow(form);
  const draftKey = createGatheringDraftKey(user?.id);
  // Publish success reaches the draft's `forget` through this ref, since the
  // draft hook reads `publishing` and so comes after it.
  const forgetDraftRef = useRef<() => void>(() => undefined);
  const publishing = usePublishGathering({
    form,
    // A house event never touched the staff member's own draft.
    onPublished: () => {
      if (!isHouseEvent) forgetDraftRef.current();
    },
    onVenueRefused: () =>
      chapterFlow.openChapterAtField(
        chapterIndexOf("whenWhere"),
        GATE_ANCHOR.venue,
      ),
    onRunByRefused: () =>
      chapterFlow.openChapterAtField(
        chapterIndexOf("who"),
        RUN_BY_FIELD_ANCHOR,
      ),
    quizshowSourceSlug:
      isQuizshowVisible && duplicateSource?.gathering.quizshow?.hasQuiz
        ? duplicateSource.gathering.slug
        : null,
  });
  const draft = useCreateGatheringDraft({
    form,
    legacyStorageKey: draftKey,
    // A duplicate's seed lands after any resume and would overwrite it. The
    // draft slot is the signed-in member's own, so a house event leaves it
    // alone.
    shouldOfferResume: !duplicateSlug && !isHouseEvent,
    communitySlugParam,
    isSavingEnabled:
      !isHouseEvent && !publishing.isPublished && !publishing.isPending,
  });
  useEffect(() => {
    forgetDraftRef.current = draft.forget;
  });
  const isCompact = useMediaQuery(COMPACT_LAYOUT_QUERY);
  const pageClassName = isHouseEvent
    ? `${styles.page} ${styles.pageHouse}`
    : styles.page;

  // Warn before an in-progress event is abandoned. Off once it is published,
  // so the success CTAs navigate without a false prompt.
  useUnsavedChangesGuard({
    active: form.dirty && !publishing.isPublished && !publishing.isPending,
    confirmMessage: t("gatherings:create.nav.leaveConfirm"),
  });

  const readiness = publishReadiness(form);
  const { requiredItems, metRequiredCount, isReady } = readiness;

  // Publish stays pressable while not ready (`aria-disabled`), and a press
  // then sends the host to the first thing missing: a required field, else
  // the first unticked pledge in the review chapter.
  const handlePublish = () => {
    if (publishing.isPending) return;
    if (isReady) {
      publishing.publish();
      return;
    }
    const firstUnmetItem = requiredItems.find((item) => !item.isMet);
    if (firstUnmetItem) {
      chapterFlow.openChapterAtField(
        firstUnmetItem.chapterIndex,
        firstUnmetItem.anchor,
      );
      return;
    }
    const firstUncheckedIndex = form.checks.findIndex(
      (isChecked) => !isChecked,
    );
    if (firstUncheckedIndex !== -1) {
      chapterFlow.openChapterAtField(
        REVIEW_CHAPTER_INDEX,
        confirmAnchor(firstUncheckedIndex),
      );
    }
  };

  if (publishing.isPublished) {
    return (
      <Frame>
        <section className={pageClassName}>
          <div className="wrap">
            <CreateGatheringSuccess
              form={form}
              createdSlug={publishing.createdSlug}
              occurrenceSlugs={publishing.occurrenceSlugs}
            />
          </div>
        </section>
      </Frame>
    );
  }

  const reviewBody = (
    <CreateGatheringReview
      form={form}
      readiness={readiness}
      isPublishing={publishing.isPending}
      onEditChapter={chapterFlow.openChapter}
      onJumpToItem={(item) =>
        chapterFlow.openChapterAtField(item.chapterIndex, item.anchor)
      }
      onPublish={handlePublish}
    />
  );

  return (
    <Frame>
      <section className={pageClassName}>
        <div className="wrap">
          {head ?? (
            <CreateGatheringHead
              saveStatus={draft.saveStatus}
              isNoteShown={draft.isNoteShown}
            />
          )}
          {/* A house event never offers the member's draft, so it has no
              draft strips at all. */}
          {!isHouseEvent && (
            <CreateGatheringDraftStrips
              draft={draft}
              chapterFlow={chapterFlow}
            />
          )}
          <div className={styles.grid}>
            <div className={styles.formColumn}>
              <ChapterList
                form={form}
                chapterFlow={chapterFlow}
                reviewBody={reviewBody}
              />
            </div>
            <aside
              className={styles.rail}
              aria-label={t("gatherings:create.v2.rail.label")}
            >
              <GatheringPreviewPanel form={form} variant="rail" />
            </aside>
          </div>
        </div>
      </section>
      {/* The review chapter ends with its own Publish and hint, so the bar
          steps aside while it is open. The page keeps its bottom padding
          either way, so nothing jumps. */}
      {isCompact && chapterFlow.openChapterIndex !== REVIEW_CHAPTER_INDEX && (
        <CreateGatheringMobileBar
          metRequiredCount={metRequiredCount}
          requiredCount={requiredItems.length}
          checkedCount={form.checkedCount}
          pledgeCount={PLEDGE_TEXT_KEYS.length}
          isReady={isReady}
          onReview={() => chapterFlow.openChapter(REVIEW_CHAPTER_INDEX)}
        />
      )}
    </Frame>
  );
}
