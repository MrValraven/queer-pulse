import { useMemo, useState, type ComponentType } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { Button, Eyebrow } from "../../shared/components/ui";
import { useMediaQuery, useUnsavedChangesGuard } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useEvent } from "./api/useEvent";
import { CreateGatheringChapter } from "./CreateGatheringChapter";
import { CreateGatheringMobileBar } from "./CreateGatheringMobileBar";
import { CreateGatheringReadyPanel } from "./CreateGatheringReadyPanel";
import { CreateGatheringSuccess } from "./CreateGatheringSuccess";
import {
  COMPACT_LAYOUT_QUERY,
  CREATE_GATHERING_CHAPTERS,
  PLEDGE_TEXT_KEYS,
  READY_PANEL_ANCHOR,
  chapterHeadId,
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
  jumpToAnchor,
  readinessItems,
  revealSection,
  revealSectionIfAbove,
} from "./createGatheringChapters";
import {
  CREATE_GATHERING_COMMUNITY_PARAM,
  DUPLICATE_GATHERING_PARAM,
} from "./data";
import { DraftResumeStrip, SavedIndicator } from "./DraftResumeStrip";
import { gatheringToFormSeed } from "./gatheringSeed";
import { GatheringPreviewPanel } from "./preview/GatheringPreviewPanel";
import { AccessChapter } from "./steps/AccessChapter";
import { CareChapter } from "./steps/CareChapter";
import { WhatChapter } from "./steps/WhatChapter";
import { WhenWhereChapter } from "./steps/WhenWhereChapter";
import { WhoChapter } from "./steps/WhoChapter";
import {
  createGatheringDraftKey,
  removeStoredDraft,
  useCreateGatheringDraft,
  type DraftSaveStatus,
} from "./useCreateGatheringDraft";
import { useGatheringForm, type GatheringForm } from "./useGatheringForm";
import { usePublishGathering } from "./usePublishGathering";
import styles from "./CreateGatheringShell.module.css";

/** Each chapter's body. Every body receives `{ form }` and nothing else. */
const CHAPTER_BODIES: Record<
  CreateGatheringChapterId,
  ComponentType<{ form: GatheringForm }>
> = {
  what: WhatChapter,
  whenWhere: WhenWhereChapter,
  who: WhoChapter,
  access: AccessChapter,
  care: CareChapter,
};

function noChapterFlags(): boolean[] {
  return CREATE_GATHERING_CHAPTERS.map(() => false);
}

function withChapterFlag(flags: boolean[], chapterIndex: number): boolean[] {
  return flags.map((flag, index) => (index === chapterIndex ? true : flag));
}

/**
 * Which chapter is open, and what the host has done in each.
 *
 * One chapter is open at a time, and pressing an open head closes it.
 * Continue checks the chapter's gate (`createGatheringChapters.ts`): unmet, it
 * lists what is missing and reports back so the button shakes; met, it opens
 * the next chapter with focus on its head, or after the last chapter closes
 * them all and brings the ready panel into view.
 */
function useChapterFlow(form: GatheringForm) {
  const [openChapterIndex, setOpenChapterIndex] = useState<number | null>(0);
  const [continuedChapters, setContinuedChapters] = useState(noChapterFlags);
  const [attemptedChapters, setAttemptedChapters] = useState(noChapterFlags);
  const [isOpeningAfterResume, setIsOpeningAfterResume] = useState(false);
  // A resume restores the form in the same batch that sets this flag, so this
  // render already reads the restored values: open the first chapter still
  // asking for something, or none when nothing is missing.
  if (isOpeningAfterResume) {
    setIsOpeningAfterResume(false);
    const firstIncompleteIndex = CREATE_GATHERING_CHAPTERS.findIndex(
      (_chapter, chapterIndex) => !isChapterComplete(form, chapterIndex),
    );
    setOpenChapterIndex(
      firstIncompleteIndex === -1 ? null : firstIncompleteIndex,
    );
  }

  /** Open a chapter from its head, or close it when it is already open. A
   *  long chapter closing above can leave the one just opened starting above
   *  the viewport, so its top is brought back into view. */
  const toggleChapter = (chapterIndex: number) => {
    const isOpening = openChapterIndex !== chapterIndex;
    setOpenChapterIndex(isOpening ? chapterIndex : null);
    if (isOpening) {
      afterRender(() =>
        revealSectionIfAbove(
          chapterSectionId(chapterIndex),
          chapterHeadId(chapterIndex),
        ),
      );
    }
  };

  const continueFromChapter = (chapterIndex: number): boolean => {
    if (!isChapterComplete(form, chapterIndex)) {
      setAttemptedChapters((previous) =>
        withChapterFlag(previous, chapterIndex),
      );
      return false;
    }
    setContinuedChapters((previous) => withChapterFlag(previous, chapterIndex));
    const nextIndex = chapterIndex + 1;
    if (nextIndex < CREATE_GATHERING_CHAPTERS.length) {
      setOpenChapterIndex(nextIndex);
      afterRender(() =>
        revealSection(chapterSectionId(nextIndex), chapterHeadId(nextIndex)),
      );
    } else {
      setOpenChapterIndex(null);
      afterRender(() => revealSection(READY_PANEL_ANCHOR, READY_PANEL_ANCHOR));
    }
    return true;
  };

  /** Open a chapter and send the host to one of its fields, flashing it. */
  const openChapterAtField = (chapterIndex: number, anchor: string) => {
    setOpenChapterIndex(chapterIndex);
    afterRender(() => jumpToAnchor(anchor, styles.gateFlash));
  };

  return {
    openChapterIndex,
    continuedChapters,
    attemptedChapters,
    toggleChapter,
    continueFromChapter,
    openChapterAtField,
    openAfterResume: () => setIsOpeningAfterResume(true),
  };
}

type ChapterFlow = ReturnType<typeof useChapterFlow>;

/** Eyebrow, serif title, lead, the draft's saved line, and Cancel. */
function CreateGatheringHead({ saveStatus }: { saveStatus: DraftSaveStatus }) {
  const { t } = useTranslation();
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
      </div>
      <div className={styles.headActions}>
        <Button variant="ghost" to={routes.host}>
          {t("gatherings:create.nav.cancel")}
        </Button>
      </div>
    </header>
  );
}

/** The five chapters, each wrapped around its own body. */
function ChapterList({
  form,
  chapterFlow,
}: {
  form: GatheringForm;
  chapterFlow: ChapterFlow;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <>
      {CREATE_GATHERING_CHAPTERS.map((chapter, chapterIndex) => {
        const ChapterBody = CHAPTER_BODIES[chapter.id];
        const hasBeenContinued =
          chapterFlow.continuedChapters[chapterIndex] === true;
        return (
          <CreateGatheringChapter
            key={chapter.id}
            chapterIndex={chapterIndex}
            titleKey={chapter.titleKey}
            introKey={chapter.introKey}
            isOptional={chapter.isOptional}
            isLast={chapterIndex === CREATE_GATHERING_CHAPTERS.length - 1}
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
            onContinue={() => chapterFlow.continueFromChapter(chapterIndex)}
          >
            <ChapterBody form={form} />
          </CreateGatheringChapter>
        );
      })}
    </>
  );
}

export function CreateGatheringPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  // A community's Events tab links here as `?community=<slug>` so the host
  // lands with that community already picked (see `createGatheringPath`). Read
  // once, on mount, by the form hook.
  const [searchParams] = useSearchParams();
  const communitySlugParam =
    searchParams.get(CREATE_GATHERING_COMMUNITY_PARAM) ?? "";
  // "Run this again" (PRD-190): `?duplicate=<slug>` fetches that gathering and
  // seeds the wizard from it whenever the fetch lands. `useMemo` keeps the
  // seed's identity stable so it is applied exactly once.
  const duplicateSlug = searchParams.get(DUPLICATE_GATHERING_PARAM);
  const { data: duplicateSource } = useEvent(duplicateSlug ?? undefined);
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
  });
  const chapterFlow = useChapterFlow(form);
  const draftKey = createGatheringDraftKey(user?.id);
  const publishing = usePublishGathering({
    form,
    onPublished: () => removeStoredDraft(draftKey),
  });
  const draft = useCreateGatheringDraft({
    form,
    storageKey: draftKey,
    // A duplicate's seed lands after any resume and would overwrite it.
    shouldOfferResume: !duplicateSlug,
    communitySlugParam,
    isSavingEnabled: !publishing.isPublished && !publishing.isPending,
  });
  const isCompact = useMediaQuery(COMPACT_LAYOUT_QUERY);

  // Warn before an in-progress gathering is abandoned. Off once it is
  // published, so the success CTAs navigate without a false prompt.
  useUnsavedChangesGuard({
    active: form.dirty && !publishing.isPublished && !publishing.isPending,
    confirmMessage: t("gatherings:create.nav.leaveConfirm"),
  });

  const readiness = readinessItems(form);
  const requiredItems = readiness.filter((item) => !item.isOptional);
  const metRequiredCount = requiredItems.filter((item) => item.isMet).length;
  const isReady = metRequiredCount === requiredItems.length && form.allChecked;

  // Publish stays pressable while not ready (`aria-disabled`), and a press
  // then sends the host to the first thing missing: a required field, else
  // the first unticked pledge.
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
      jumpToAnchor(confirmAnchor(firstUncheckedIndex), styles.gateFlash);
    }
  };

  // Both strip answers remove the strip with focus on it, so focus moves to
  // the chapter head the host continues from.
  const handleResume = () => {
    draft.resume();
    chapterFlow.openAfterResume();
    afterRender(focusOpenChapterHead);
  };

  const handleStartFresh = () => {
    draft.startFresh();
    afterRender(focusOpenChapterHead);
  };

  if (publishing.isPublished) {
    return (
      <PageShell>
        <section className={styles.page}>
          <div className="wrap">
            <CreateGatheringSuccess
              form={form}
              createdSlug={publishing.createdSlug}
              occurrenceSlugs={publishing.occurrenceSlugs}
            />
          </div>
        </section>
      </PageShell>
    );
  }

  const readyPanel = (
    <CreateGatheringReadyPanel
      form={form}
      items={readiness}
      isReady={isReady}
      isPublishing={publishing.isPending}
      onJumpToItem={(item) =>
        chapterFlow.openChapterAtField(item.chapterIndex, item.anchor)
      }
      onPublish={handlePublish}
    />
  );

  return (
    <PageShell>
      <section className={styles.page}>
        <div className="wrap">
          <CreateGatheringHead saveStatus={draft.saveStatus} />
          {draft.resumeOffer && (
            <DraftResumeStrip
              offer={draft.resumeOffer}
              onResume={handleResume}
              onStartFresh={handleStartFresh}
            />
          )}
          <div className={styles.grid}>
            <div className={styles.formColumn}>
              <ChapterList form={form} chapterFlow={chapterFlow} />
              {/* At 900px and under the rail stacks above the form, so the
                  ready panel moves under the chapters it reports on. */}
              {isCompact && readyPanel}
            </div>
            <aside
              className={styles.rail}
              aria-label={t("gatherings:create.v2.rail.label")}
            >
              <GatheringPreviewPanel form={form} variant="rail" />
              {!isCompact && readyPanel}
            </aside>
          </div>
        </div>
      </section>
      {isCompact && (
        <CreateGatheringMobileBar
          metRequiredCount={metRequiredCount}
          requiredCount={requiredItems.length}
          checkedCount={form.checkedCount}
          pledgeCount={PLEDGE_TEXT_KEYS.length}
          isReady={isReady}
          isPublishing={publishing.isPending}
          onPublish={handlePublish}
        />
      )}
    </PageShell>
  );
}
