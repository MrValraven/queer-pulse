import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { LoadErrorState } from "../../shared/components/ui";
import { PageMeta, JsonLd, buildPersonProfileSchema } from "../../shared/seo";
import { socialHref } from "../../shared/social/socialPlatforms";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  usePublicSubprofile,
  type PublicSubprofileArgs,
  type RestrictedState,
} from "./api/usePublicSubprofile";
import { SubprofilePageBody } from "./SubprofilePageBody";
import { SubprofilePageStates } from "./SubprofilePageStates";
import { SubprofilePageSkeleton } from "./SubprofilePageSkeleton";
import { SubprofileDraftBanner } from "./SubprofileDraftBanner";
import { SubprofilePreviewBanner } from "./SubprofilePreviewBanner";
import { SubprofileReportModal } from "./SubprofileReportModal";
import { SubprofilePeopleModal } from "./SubprofilePeopleModal";
import { StudioLightbox } from "./skins/StudioLightbox";
import { GalleryLightbox } from "./skins/GalleryLightbox";
import { getGalleryWorks } from "./skins/galleryWorks";
import { useStudioLightbox } from "./useStudioLightbox";
import { useImageLightbox } from "./useImageLightbox";
import { usePoemDeepLink } from "./usePoemDeepLink";
import { PoemReaderModal } from "./poem/PoemReaderModal";
import { slugify } from "./poem/poemModel";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { personaPublicPath, personaShareUrl } from "./personaLinks.data";
import { DEFAULT_ACCENT, skinVars } from "./subprofilePresence.data";
import { skinFor } from "./subprofile-skins";
import { estimateDraftReadiness } from "./subprofileDraftReadiness";
import type { PersonaAction, PersonaViewMode } from "./personaSkinRender";
import {
  PAGE_STATE_COPY,
  type PersonaPageState,
} from "./subprofilePageStates.data";

type PeopleModalMode = "followers" | "endorsements";

/** The Shared Contract's `RestrictedState` ("members_only", underscore) maps
 *  1:1 onto `SubprofilePageStates`' pre-existing `PersonaPageState` keys
 *  ("members-only", hyphen) — same three states, named before this contract
 *  existed (Phase 1 built the wall copy off the design ground truth's
 *  `personas-states.jsx`, which used hyphens). */
const RESTRICTED_TO_PAGE_STATE: Record<RestrictedState, PersonaPageState> = {
  private: "private",
  members_only: "members-only",
  removed: "removed",
};

/**
 * Public persona page — serves both the standalone `/p/:handle` route and the
 * nested `/members/:slug/:subslug` linked-persona route. Composes the full
 * skinned tree (`data-skin={skinFor(kind)}`, built in `SubprofilePageBody`):
 * cover, per-slot `SkinExtras`, hero, spotlight/sections, the endorsers+
 * affiliations foot, the studio lightbox, and the report/people modals — one
 * renderer for every craft family, styled entirely through
 * `persona-skins.css`'s global `.pp*` classes (see that file +
 * `subprofile-skins.ts`).
 *
 * Mode is co-ownership aware: `viewerIsMember` covers the creator AND any
 * invited co-owner (not just "am I the creator"), so an invited co-owner
 * sees the same "owner" actions the creator does. An owner can also flip
 * themselves into `"visitor"` — their own page exactly as a stranger reads it
 * — from the hero's `View as visitor`. `"preview"` is the Phase-3 editor's
 * concern, reusing the same components with a different `mode`, never mounted
 * here.
 */
export function SubprofilePage() {
  const { t } = useTranslation();
  const { handle, slug, subslug } = useParams();

  const args: PublicSubprofileArgs = handle
    ? { handle }
    : { ownerSlug: slug ?? "", subslug: subslug ?? "" };
  const result = usePublicSubprofile(args);
  const lightbox = useStudioLightbox(
    result.state === "ok" ? result.data.sections : undefined,
  );
  // `result` is a fresh object each render, so depending on it defeats the
  // memo. Depend on the stable `sections` reference the query cache holds.
  const sections = result.state === "ok" ? result.data.sections : undefined;
  const galleryPhotos = useMemo(
    () => (sections ? getGalleryWorks(sections) : []),
    [sections],
  );
  const galleryLightbox = useImageLightbox(galleryPhotos);
  const [reportOpen, setReportOpen] = useState(false);
  const [peopleModalMode, setPeopleModalMode] =
    useState<PeopleModalMode | null>(null);
  // The owner reading their own persona as a stranger would. Page-local and
  // deliberately not in the URL: it is a way of looking, not an address — and
  // a shared link that dropped someone else into "preview" would be nonsense.
  const [previewingAsVisitor, setPreviewingAsVisitor] = useState(false);
  const { poemItem, openPoem, closePoem } = usePoemDeepLink(sections);

  function handleAction(action: PersonaAction) {
    if (action === "report") setReportOpen(true);
    else if (action === "people:endorsers") setPeopleModalMode("endorsements");
    else if (action === "people:followers") setPeopleModalMode("followers");
    else if (action === "preview:enter") {
      setPreviewingAsVisitor(true);
      // A stranger arrives at the top of the page; start the preview there
      // rather than wherever the owner happened to be scrolled to.
      window.scrollTo({ top: 0 });
    }
  }

  if (result.state === "loading") {
    return (
      <PageShell>
        <SubprofilePageSkeleton />
      </PageShell>
    );
  }

  if (result.state === "error") {
    return (
      <PageShell>
        <PageMeta title={t("subprofiles:page.notFoundMetaTitle")} noIndex />
        <LoadErrorState onRetry={result.retry} />
      </PageShell>
    );
  }

  if (result.state === "not-found") {
    return (
      <PageShell>
        <PageMeta title={t("subprofiles:page.notFoundMetaTitle")} noIndex />
        <SubprofilePageStates state="not-found" />
      </PageShell>
    );
  }

  if (result.state === "restricted") {
    const pageState = RESTRICTED_TO_PAGE_STATE[result.restricted];
    return (
      <PageShell>
        <PageMeta
          title={`${t(PAGE_STATE_COPY[pageState].titleKey)} · QueerPulse`}
          noIndex
        />
        <SubprofilePageStates state={pageState} />
      </PageShell>
    );
  }

  // result.state === "ok" from here on — every other branch returned above.
  const { data } = result;
  const skin = skinFor(data.kind);
  const isOwnerPreviewingAsVisitor = data.viewerIsMember && previewingAsVisitor;
  const mode: PersonaViewMode = !data.viewerIsMember
    ? "public"
    : previewingAsVisitor
      ? "visitor"
      : "owner";
  const isOwnerDraftPreview = data.status === "draft" && data.viewerIsMember;
  const skinStyle = skinVars(data.accent ?? DEFAULT_ACCENT);

  const craftLabel = t(KIND_LABEL_KEYS[data.kind]);
  const canonicalPath = personaPublicPath(data);
  const cardImage = data.coverUrl ?? data.avatarUrl ?? undefined;
  // A real wide cover reads well as a large-image card; falling back to the
  // small avatar/default, `summary` (square thumb) is the better fit.
  const twitterCard = data.coverUrl ? "summary_large_image" : "summary";
  const cardImageAlt = cardImage
    ? t("subprofiles:page.ogImageAlt", {
        name: data.displayName,
        craft: craftLabel,
      })
    : undefined;
  // Resolved external profile URLs for the Person's `sameAs`.
  const sameAs = data.socialLinks
    .map((link) => socialHref(link.platform, link.urlOrHandle))
    .filter((href): href is string => Boolean(href));

  return (
    <PageShell>
      <PageMeta
        title={`${data.displayName} · ${craftLabel} · QueerPulse`}
        description={
          (data.tagline || data.bio || "").slice(0, 160) || undefined
        }
        image={cardImage}
        imageAlt={cardImageAlt}
        twitterCard={twitterCard}
        canonical={canonicalPath}
        // An owner's own unpublished draft preview must never index — only a
        // published persona is meant to be publicly discoverable.
        noIndex={isOwnerDraftPreview || undefined}
        type="profile"
      />

      {/* Structured data for the public persona — never for an owner's own
          unpublished draft preview, which must not be discoverable at all. */}
      {!isOwnerDraftPreview && (
        <JsonLd
          schema={buildPersonProfileSchema({
            name: data.displayName,
            url: canonicalPath,
            jobTitle: craftLabel,
            image: cardImage ?? null,
            sameAs,
            description:
              (data.tagline || data.bio || "").slice(0, 300) || undefined,
          })}
        />
      )}

      {isOwnerDraftPreview && (
        <SubprofileDraftBanner
          subprofileId={data.id}
          {...estimateDraftReadiness(data)}
        />
      )}

      <SubprofilePageBody
        data={data}
        skin={skin}
        mode={mode}
        // The banner runs to the very top of the page, under the floating pill
        // nav — except when the owner's draft banner sits above it, which the
        // rise would otherwise slide up over.
        coverRise={!isOwnerDraftPreview}
        skinVars={skinStyle}
        onAction={handleAction}
        onOpenWorkAt={lightbox.openAt}
        onOpenWorkItem={lightbox.openItem}
        onOpenGalleryPhoto={galleryLightbox.openItem}
        onOpenPoem={openPoem}
      />

      {poemItem && (
        <PoemReaderModal
          item={poemItem}
          authorName={data.displayName}
          shareUrl={`${personaShareUrl(data)}?poem=${slugify(poemItem.title)}`}
          onClose={closePoem}
        />
      )}

      {lightbox.index !== null && lightbox.works.length > 0 && (
        <StudioLightbox
          items={lightbox.works}
          index={lightbox.index}
          onClose={lightbox.close}
          onMove={lightbox.move}
          authorName={data.displayName}
        />
      )}

      {galleryLightbox.index !== null && galleryPhotos.length > 0 && (
        <GalleryLightbox
          items={galleryPhotos}
          index={galleryLightbox.index}
          name={data.displayName}
          onClose={galleryLightbox.close}
          onMove={galleryLightbox.move}
        />
      )}

      {reportOpen && (
        <SubprofileReportModal
          subjectId={data.id}
          subjectName={data.displayName}
          onClose={() => setReportOpen(false)}
        />
      )}

      {isOwnerPreviewingAsVisitor && (
        <SubprofilePreviewBanner onExit={() => setPreviewingAsVisitor(false)} />
      )}

      {peopleModalMode && (
        <SubprofilePeopleModal
          persona={data}
          mode={peopleModalMode}
          asVisitor={isOwnerPreviewingAsVisitor}
          onClose={() => setPeopleModalMode(null)}
        />
      )}
    </PageShell>
  );
}
