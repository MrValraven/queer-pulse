import { useMemo, type ComponentType, type ReactNode } from "react";
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
import { CreateGatheringReview } from "./CreateGatheringReview";
import { CreateGatheringSuccess } from "./CreateGatheringSuccess";
import {
  COMPACT_LAYOUT_QUERY,
  CREATE_GATHERING_CHAPTERS,
  PLEDGE_TEXT_KEYS,
  REVIEW_CHAPTER_INDEX,
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
  publishReadiness,
  revealSection,
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
  useCreateGatheringChapterFlow,
  type CreateGatheringChapterFlow,
} from "./useCreateGatheringChapterFlow";
import {
  createGatheringDraftKey,
  removeStoredDraft,
  useCreateGatheringDraft,
  type DraftSaveStatus,
} from "./useCreateGatheringDraft";
import { useGatheringForm, type GatheringForm } from "./useGatheringForm";
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
  const chapterFlow = useCreateGatheringChapterFlow(form);
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
    </PageShell>
  );
}
