import { useMemo, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Spinner } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
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
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { personaPublicPath } from "./personaLinks.data";
import { ACCENT_TOKENS, DEFAULT_ACCENT } from "./subprofilePresence.data";
import { skinFor } from "./subprofile-skins";
import { estimateDraftReadiness } from "./subprofileDraftReadiness";
import type { PersonaViewMode } from "./personaSkinRender";
import { PAGE_STATE_COPY, type PersonaPageState } from "./subprofilePageStates.data";
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
  const galleryPhotos = useMemo(
    () => (result.state === "ok" ? getGalleryWorks(result.data.sections) : []),
    [result],
  );
  const galleryLightbox = useImageLightbox(galleryPhotos);
  const [reportOpen, setReportOpen] = useState(false);
  const [peopleModalMode, setPeopleModalMode] = useState<PeopleModalMode | null>(
    null,
  );

  function handleAction(action: string) {
    if (action === "report") setReportOpen(true);
    else if (action === "people:endorsers") setPeopleModalMode("endorsements");
    else if (action === "people:followers") setPeopleModalMode("followers");
  }

  if (result.state === "loading") {
    return (
      <PageShell>
        <div className={styles.loadingWrap} role="status" aria-live="polite">
          <Spinner />
          <span>{t("subprofiles:page.loading")}</span>
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
  const accentTokens = ACCENT_TOKENS[data.accent ?? DEFAULT_ACCENT];
  const skinVars = {
    "--sk-tint": accentTokens.tint,
    "--sk-on": accentTokens.on,
  } as CSSProperties;

  return (
    <PageShell>
      <PageMeta
        title={`${data.displayName} · ${t(KIND_LABEL_KEYS[data.kind])} — QueerPulse`}
        description={(data.tagline || data.bio || "").slice(0, 160) || undefined}
        image={data.coverUrl ?? data.avatarUrl ?? undefined}
        canonical={personaPublicPath(data)}
        // An owner's own unpublished draft preview must never index — only a
        // published persona is meant to be publicly discoverable.
        noIndex={isOwnerDraftPreview || undefined}
        type="profile"
      />

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
        skinVars={skinVars}
        onAction={handleAction}
        onOpenWorkAt={lightbox.openAt}
        onOpenWorkItem={lightbox.openItem}
        onOpenGalleryPhoto={galleryLightbox.openItem}
      />

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
