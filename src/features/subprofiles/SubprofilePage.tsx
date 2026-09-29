import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { usePublicSubprofile } from "./api/usePublicSubprofile";
import { ProfileMovedNote } from "../members/ProfileMovedNote";
import { useMovedPersonaAddressRedirect } from "./useMovedPersonaRedirect";
import { useLegacyNestedPersonaRedirect } from "./useLegacyNestedPersonaRedirect";
import { PersonaMovedNote } from "./PersonaMovedNote";
import { RehomedPersonaNote } from "./RehomedPersonaNote";
import { SubprofilePageBody } from "./SubprofilePageBody";
import { SubprofilePageHeadMeta } from "./SubprofilePageHeadMeta";
import { SubprofilePageResultState } from "./SubprofilePageResultState";
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
import { personaShareUrl } from "./personaLinks.data";
import { DEFAULT_ACCENT, skinVars } from "./subprofilePresence.data";
import { skinFor } from "./subprofile-skins";
import { estimateDraftReadiness } from "./subprofileDraftReadiness";
import type { PersonaAction, PersonaViewMode } from "./personaSkinRender";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

type PeopleModalMode = "followers" | "endorsements";

/** The owner's draft banner, handed to `SubprofilePageBody` as its `lead`.
 *  A therapist's owner bar carries the draft state and Publish itself. */
function draftBannerFor(data: PublicSubprofileView, mode: PersonaViewMode) {
  if (data.kind === "therapist" && mode === "owner") return null;
  return (
    <SubprofileDraftBanner
      subprofileId={data.id}
      {...estimateDraftReadiness(data)}
    />
  );
}

/**
 * Public persona page. Every persona's address is `/p/:handle`. The nested
 * `/members/:slug/:subslug` route is the legacy linked-persona address: it
 * still resolves here, and `useLegacyNestedPersonaRedirect` replaces it with
 * the persona's `/p/<handle>` address the moment the load carries a handle.
 * Composes the full skinned tree (`data-skin={skinFor(kind)}`, built in
 * `SubprofilePageBody`):
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
  const { handle, slug, subslug } = useParams();

  // The two public entry points, discriminated: a standalone `/p/:handle`
  // persona, or a linked one nested under `/members/:slug/:subslug`.
  const result = usePublicSubprofile(
    handle ? { handle } : { ownerSlug: slug ?? "", subslug: subslug ?? "" },
  );
  // PRD-204: forward an address released by a rename that is still inside its
  // reclaim cooldown. See `useMovedPersonaAddressRedirect` for which of this
  // page's two addresses moves for which reason.
  const isForwardingToMovedAddress = useMovedPersonaAddressRedirect(
    handle,
    slug,
    result.state === "moved" ? result.error : undefined,
  );
  // Old nested links land on the persona's `/p/<handle>` address. Either
  // forwarding leaves this page nowhere to paint until it settles.
  const isRedirectingAway =
    useLegacyNestedPersonaRedirect(!handle, result) ||
    isForwardingToMovedAddress;
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

  // The forwarding checks are held ABOVE every wall below, which would
  // otherwise claim the moved 404 as an absence and paint for a frame on the
  // way through. The navigation can only run from an effect, so this ordering
  // is the fix, and reversing it would silently undo the whole thing. See
  // `SubprofilePageResultState` for the loading/error/not-found/moved/
  // restricted walls this delegates to.
  if (result.state !== "ok" || isRedirectingAway) {
    return (
      <SubprofilePageResultState
        result={result}
        isRedirectingAway={isRedirectingAway}
      />
    );
  }

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
  const poemShareUrl = personaShareUrl(data);

  return (
    <PageShell>
      <SubprofilePageHeadMeta
        data={data}
        isOwnerDraftPreview={isOwnerDraftPreview}
      />

      {/* Says which address was followed and where it now leads. Each renders
          only when this very navigation carried its own forwarding state, so a
          first-hand visit and a reload show nothing. See `PersonaMovedNote`. */}
      <PersonaMovedNote />
      <ProfileMovedNote />
      <RehomedPersonaNote />

      <SubprofilePageBody
        data={data}
        skin={skin}
        mode={mode}
        // No cover rise under the owner's draft banner, which leads the page.
        coverRise={!isOwnerDraftPreview}
        navBand
        lead={isOwnerDraftPreview && draftBannerFor(data, mode)}
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
          shareUrl={
            poemShareUrl
              ? `${poemShareUrl}?poem=${slugify(poemItem.title)}`
              : null
          }
          onClose={closePoem}
        />
      )}

      {lightbox.index !== null && lightbox.works.length > 0 && (
        <StudioLightbox
          items={lightbox.works}
          index={lightbox.index}
          onClose={lightbox.close}
          onMove={lightbox.move}
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
