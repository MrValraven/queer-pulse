import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { subprofileEditPath } from "../../app/routeMap";
import { handleFormatError } from "../../shared/handles";
import type { LinkVisibility, SubprofileKind } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { itemsToInputDto } from "./api/subprofiles.adapters";
import {
  KIND_LABELS,
  KIND_LABEL_KEYS,
  defaultSlugForKind,
  slugify,
} from "./subprofile-kinds";
import {
  buildTemplateSections,
  templateTaglineFor,
} from "./subprofileTemplates.data";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import { useSubprofiles } from "./api/useSubprofiles";
import type { StartMethod } from "./StartMethodPicker";
import {
  applyDuplicatePlan,
  buildDuplicatePlan,
  type CopyMode,
} from "./subprofileDuplicate";

/** The full mutation surface — passed to the create helper so every write goes
 *  through the demo-aware hooks (dual-mode preserved). */
type SubprofileMutations = ReturnType<typeof useSubprofileMutations>;

/** The outcome of seeding: the new draft's id, plus whether an explicit
 *  standalone-handle claim failed (the draft still exists, just linked). */
interface CreateAndSeedResult {
  id: string;
  handleClaimFailed: boolean;
}

/** Create a draft, tie its address (linked default, or explicitly unlinked
 *  with a handle), then seed it per method: copy from a source via
 *  `applyDuplicatePlan`, seed the kind template, or leave it bare (blank).
 *  Returns the new draft's id (and whether the standalone-handle claim failed).
 *  Every write goes through `mutations` so demo and live behave identically. */
async function createAndSeedSubprofile(args: {
  kind: SubprofileKind;
  displayName: string;
  method: StartMethod;
  copyDefaultName: string;
  linkVisibility: LinkVisibility;
  handle: string;
  source: SubprofileView | null;
  copyMode: CopyMode;
  mutations: SubprofileMutations;
  t: TranslationApi["t"];
}): Promise<CreateAndSeedResult> {
  const {
    kind,
    displayName,
    method,
    copyDefaultName,
    linkVisibility,
    handle,
    source,
    copyMode,
    mutations,
    t,
  } = args;
  const { create, update, replaceSection, replaceSocials, replaceAffiliations } =
    mutations;
  // displayName is required and the backend derives the slug — send a valid
  // name (falling back to the source copy name, else the profession).
  const created = await create.mutateAsync({
    kind,
    displayName:
      displayName.trim() ||
      (method === "copy" ? copyDefaultName : KIND_LABELS[kind]),
  });

  let handleClaimFailed = false;
  if (linkVisibility === "unlinked") {
    // A failure here (e.g. a handle that turns out to be taken) shouldn't
    // strand the draft as unpublishable — it lands in the editor either way,
    // still linked, where the address is editable and re-checked by the publish
    // checklist. We DO report the failure so the caller can tell the member
    // their handle wasn't claimed, rather than silently swallowing it.
    try {
      await update.mutateAsync({
        id: created.id,
        dto: { linkVisibility: "unlinked", handle },
      });
    } catch {
      handleClaimFailed = true; // stays linked; editable in the editor
    }
  }

  if (method === "copy" && source) {
    // Seed from the source persona: identity + links + items (+ affiliations in
    // full mode). Each step is best-effort inside applyDuplicatePlan.
    const plan = buildDuplicatePlan(source, copyMode);
    await applyDuplicatePlan(created.id, plan, {
      update,
      replaceSocials,
      replaceSection,
      replaceAffiliations,
    });
  } else if (method === "template") {
    // Seed the kind's starter template: example items per section, then a
    // suggested tagline. Each piece is applied independently — a failure on one
    // section (or the tagline) never strands the fresh draft; the owner lands in
    // the editor either way and can fill in what's missing.
    for (const { section, items } of buildTemplateSections(kind, t)) {
      try {
        await replaceSection.mutateAsync({
          id: created.id,
          section,
          items: itemsToInputDto(items),
        });
      } catch {
        /* that section stays empty; editable in the editor */
      }
    }
    const tagline = templateTaglineFor(kind, t);
    if (tagline) {
      try {
        await update.mutateAsync({ id: created.id, dto: { tagline } });
      } catch {
        /* tagline stays blank; editable in the editor */
      }
    }
  }
  // blank: nothing to seed — the draft is created bare.
  return { id: created.id, handleClaimFailed };
}

/** Everything the two-step create wizard's UI reads and writes. Returned by
 *  {@link useNewSideForm} so `NewSideModal` stays a thin render shell. */
export interface NewSideForm {
  step: 1 | 2;
  setStep: (step: 1 | 2) => void;
  method: StartMethod;
  setMethod: (method: StartMethod) => void;
  kind: SubprofileKind | null;
  setKind: (kind: SubprofileKind | null) => void;
  sourceId: string | null;
  setSourceId: (id: string | null) => void;
  copyMode: CopyMode;
  setCopyMode: (mode: CopyMode) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  linkVisibility: LinkVisibility;
  setLinkVisibility: (value: LinkVisibility) => void;
  sources: SubprofileView[];
  effectiveKind: SubprofileKind | null;
  ownerSlug: string;
  slug: string;
  handle: string;
  displayNamePlaceholder: string;
  step1Ready: boolean;
  step2Ready: boolean;
  /** True for the whole `submit()` span (create + seed + navigation), so the
   *  Create button can't fire twice and mint duplicate personas. */
  submitting: boolean;
  submit: () => Promise<void>;
}

/**
 * All state + derivation + submission for the two-step "new persona" wizard,
 * lifted out of `NewSideModal` so each stays under the line budget. Step 1 picks
 * the craft/blank/copy; step 2 names it and chooses linked-vs-standalone; then
 * `submit()` creates and seeds the draft and routes to its editor.
 */
export function useNewSideForm(
  initialKind: SubprofileKind | null,
  onClose: () => void,
): NewSideForm {
  const navigate = useNavigate();
  const mutations = useSubprofileMutations();
  const { data: mySubprofiles } = useSubprofiles();
  const sources = mySubprofiles ?? [];
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();

  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<StartMethod>("template");
  const [kind, setKind] = useState<SubprofileKind | null>(initialKind);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [copyMode, setCopyMode] = useState<CopyMode>("full");
  const [displayName, setDisplayName] = useState("");
  const [linkVisibility, setLinkVisibility] =
    useState<LinkVisibility>("linked");
  const [submitting, setSubmitting] = useState(false);

  // The vanity-URL preview shows the signed-in member's own slug. The mock
  // "tiago" seed is only a demo-mode fallback with no session — loaded lazily
  // (dynamic import) so the demo member registry never rides the live bundle.
  const [demoSlug, setDemoSlug] = useState<string | null>(null);
  const sessionSlug = user?.profile.slug;
  useEffect(() => {
    if (!demoMode || sessionSlug) return;
    let cancelled = false;
    void import("../members/data/members").then((registry) => {
      if (!cancelled) setDemoSlug(registry.currentUserSlug);
    });
    return () => {
      cancelled = true;
    };
  }, [demoMode, sessionSlug]);
  const ownerSlug = sessionSlug ?? (demoMode ? (demoSlug ?? "you") : "you");

  const source = sources.find((candidate) => candidate.id === sourceId) ?? null;
  const effectiveKind = method === "copy" ? (source?.kind ?? null) : kind;
  const copyDefaultName = source ? `${source.displayName} copy` : "";
  const step1Ready =
    effectiveKind !== null && (method !== "copy" || source !== null);

  const effectiveDisplayName =
    displayName.trim() ||
    (method === "copy"
      ? copyDefaultName
      : effectiveKind
        ? KIND_LABELS[effectiveKind]
        : "");
  const autoSlug =
    slugify(effectiveDisplayName) ||
    (effectiveKind ? defaultSlugForKind(effectiveKind) : "");
  const handleCandidate = autoSlug;
  const step2Ready =
    linkVisibility !== "unlinked" ||
    handleFormatError(handleCandidate) === null;

  const displayNamePlaceholder =
    method === "copy"
      ? copyDefaultName ||
        t("subprofiles:newModal.displayNamePlaceholderDefault")
      : effectiveKind
        ? t("subprofiles:newModal.displayNamePlaceholderExample", {
            kind: t(KIND_LABEL_KEYS[effectiveKind]),
          })
        : t("subprofiles:newModal.displayNamePlaceholderDefault");

  async function submit() {
    // `submitting` spans the ENTIRE flow (create + seed + navigate), not just
    // `create.isPending` which flips false while seeding still runs — otherwise
    // a second click here mints a duplicate persona.
    if (!effectiveKind || !step2Ready || submitting) return;
    setSubmitting(true);
    try {
      const { id, handleClaimFailed } = await createAndSeedSubprofile({
        kind: effectiveKind,
        displayName,
        method,
        copyDefaultName,
        linkVisibility,
        handle: handleCandidate,
        source,
        copyMode,
        mutations,
        t,
      });
      if (handleClaimFailed) {
        showToast(
          t("subprofiles:newModal.toastHandleClaimFailed", {
            handle: handleCandidate,
          }),
          "error",
        );
      }
      onClose();
      void navigate(subprofileEditPath(id));
    } catch {
      // Only reset on failure — a success navigates away and unmounts.
      setSubmitting(false);
      showToast(t("subprofiles:newModal.toastError"), "error");
    }
  }

  return {
    step,
    setStep,
    method,
    setMethod,
    kind,
    setKind,
    sourceId,
    setSourceId,
    copyMode,
    setCopyMode,
    displayName,
    setDisplayName,
    linkVisibility,
    setLinkVisibility,
    sources,
    effectiveKind,
    ownerSlug,
    slug: autoSlug,
    handle: handleCandidate,
    displayNamePlaceholder,
    step1Ready,
    step2Ready,
    submitting,
    submit,
  };
}
