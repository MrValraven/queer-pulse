import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { SkeletonAvatar, SkeletonLine } from "../../shared/components/ui";
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
import { SubprofileDraftBanner } from "./SubprofileDraftBanner";
import { SubprofileReportModal } from "./SubprofileReportModal";
import { SubprofilePeopleModal } from "./SubprofilePeopleModal";
import { StudioLightbox } from "./skins/StudioLightbox";
import { GalleryLightbox } from "./skins/GalleryLightbox";
import { getGalleryWorks } from "./skins/galleryWorks";
import { useStudioLightbox } from "./useStudioLightbox";
import { useImageLightbox } from "./useImageLightbox";
import { PoemReaderModal } from "./poem/PoemReaderModal";
import { slugify } from "./poem/poemModel";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { personaPublicPath, personaShareUrl } from "./personaLinks.data";
import { DEFAULT_ACCENT, skinVars } from "./subprofilePresence.data";
import { skinFor } from "./subprofile-skins";
import { estimateDraftReadiness } from "./subprofileDraftReadiness";
import type { PersonaAction, PersonaViewMode } from "./personaSkinRender";
import { PAGE_STATE_COPY, type PersonaPageState } from "./subprofilePageStates.data";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import styles from "./SubprofilePage.module.css";

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
 * sees the same "owner" actions the creator does. This page only ever
 * renders `"public"` or `"owner"` — `"preview"` is the Phase-3 editor's
 * concern, reusing the same components with a different `mode`, never
 * mounted here.
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
  const [peopleModalMode, setPeopleModalMode] = useState<PeopleModalMode | null>(
    null,
  );
  const [poemItem, setPoemItem] = useState<SubprofileItemView | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const poemSlugParam = searchParams.get("poem");
  // The slug `openPoem` itself just set, so the resolve effect below can tell
  // "the param changed because we opened this exact item" apart from "the
  // param changed some other way (mount, back/forward, pasted URL)". Without
  // this, a title collision (two poems slugify the same — realistic with no
  // id, e.g. two "Untitled" poems) would have the effect immediately
  // re-resolve the just-set slug via first-match and silently swap the
  // reader to the WRONG same-titled poem right after opening the second one.
  const internalSlugRef = useRef<string | null>(null);

  // Deep-link: `?poem=<slug>` resolves against the poems section's items
  // (both demo and live share the same `data.sections` view — no mock-only
  // branch) and opens the reader on mount / whenever the param changes
  // externally (initial load, back/forward, a pasted/shared URL). A param
  // that doesn't resolve to a poem is a silent no-op, never a crash or an
  // empty modal.
  useEffect(() => {
    if (!poemSlugParam) return;
    // The param already matches the slug `openPoem` set for the item that's
    // currently open — don't second-guess a direct open with a first-match
    // lookup that could resolve to a different, same-titled poem.
    if (internalSlugRef.current === poemSlugParam) return;
    const poemsSection = sections?.find((section) => section.section === "poems");
    if (!poemsSection) return;
    const targetSlug = poemSlugParam.toLowerCase();
    const matchedPoem = poemsSection.items.find(
      (item) => slugify(item.title) === targetSlug,
    );
    if (matchedPoem) setPoemItem(matchedPoem);
  }, [poemSlugParam, sections]);

  /** Row tap: opens the reader AND sets `?poem=<slug>` (replace, so the back
   *  button doesn't have to step through every poem opened in the session). */
  function openPoem(item: SubprofileItemView) {
    const slug = slugify(item.title);
    internalSlugRef.current = slug;
    setPoemItem(item);
    const next = new URLSearchParams(searchParams);
    next.set("poem", slug);
    setSearchParams(next, { replace: true });
  }

  /** Close: clears the reader AND the `?poem=` param together, so the URL
   *  never points at a closed reader. */
  function closePoem() {
    internalSlugRef.current = null;
    setPoemItem(null);
    const next = new URLSearchParams(searchParams);
    next.delete("poem");
    setSearchParams(next, { replace: true });
  }

  function handleAction(action: PersonaAction) {
    if (action === "report") setReportOpen(true);
    else if (action === "people:endorsers") setPeopleModalMode("endorsements");
    else if (action === "people:followers") setPeopleModalMode("followers");
  }

  if (result.state === "loading") {
    // A skeleton that reserves the real page's shape — a full-bleed cover band
    // above a hero identity block (avatar + name + tagline + bio lines) — so the
    // content swap barely shifts layout (low CLS), instead of a centered spinner
    // that then jumps to a full page.
    return (
      <PageShell>
        <div
          className={styles.skeleton}
          role="status"
          aria-busy="true"
          aria-live="polite"
        >
          <span className={styles.skeletonLabel}>
            {t("subprofiles:page.loading")}
          </span>
          <div className={styles.skeletonCover} aria-hidden />
          <div className="wrap">
            <div className={styles.skeletonHero} aria-hidden>
              <SkeletonAvatar size={96} />
              <div className={styles.skeletonHeroText}>
                <SkeletonLine width="55%" height={30} />
                <SkeletonLine width="38%" height={16} />
                <SkeletonLine width="82%" height={14} />
                <SkeletonLine width="68%" height={14} />
              </div>
            </div>
          </div>
        </div>
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
          title={`${t(PAGE_STATE_COPY[pageState].titleKey)} — QueerPulse`}
          noIndex
        />
        <SubprofilePageStates state={pageState} />
      </PageShell>
    );
  }

  // result.state === "ok" from here on — every other branch returned above.
  const { data } = result;
  const skin = skinFor(data.kind);
  const mode: PersonaViewMode = data.viewerIsMember ? "owner" : "public";
  const isOwnerDraftPreview = data.status === "draft" && data.viewerIsMember;
  const skinStyle = skinVars(data.accent ?? DEFAULT_ACCENT);

  const craftLabel = t(KIND_LABEL_KEYS[data.kind]);
  const canonicalPath = personaPublicPath(data);
  const cardImage = data.coverUrl ?? data.avatarUrl ?? undefined;
  // A real wide cover reads well as a large-image card; falling back to the
  // small avatar/default, `summary` (square thumb) is the better fit.
  const twitterCard = data.coverUrl ? "summary_large_image" : "summary";
  const cardImageAlt = cardImage
    ? t("subprofiles:page.ogImageAlt", { name: data.displayName, craft: craftLabel })
    : undefined;
  // Resolved external profile URLs for the Person's `sameAs`.
  const sameAs = data.socialLinks
    .map((link) => socialHref(link.platform, link.urlOrHandle))
    .filter((href): href is string => Boolean(href));

  return (
    <PageShell>
      <PageMeta
        title={`${data.displayName} · ${craftLabel} — QueerPulse`}
        description={(data.tagline || data.bio || "").slice(0, 160) || undefined}
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
            description: (data.tagline || data.bio || "").slice(0, 300) || undefined,
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
          subjectId={data.slug}
          subjectName={data.displayName}
          onClose={() => setReportOpen(false)}
        />
      )}

      {peopleModalMode && (
        <SubprofilePeopleModal
          persona={data}
          mode={peopleModalMode}
          onClose={() => setPeopleModalMode(null)}
        />
      )}
    </PageShell>
  );
}
