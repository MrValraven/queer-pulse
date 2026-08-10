import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";
import { currentUserSlug } from "../members/data/members";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { subprofileEditPath } from "../../app/routeMap";
import { handleFormatError } from "../../shared/handles";
import type { LinkVisibility, SubprofileKind } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { itemsToInputDto } from "./api/subprofiles.adapters";
import { KIND_LABELS, KIND_LABEL_KEYS, defaultSlugForKind, slugify } from "./subprofile-kinds";
import { buildTemplateSections, templateTaglineFor } from "./subprofileTemplates.data";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import { useSubprofiles } from "./api/useSubprofiles";
import type { StartMethod } from "./StartMethodPicker";
import { NewSideStepCraft } from "./NewSideStepCraft";
import { NewSideStepIdentity } from "./NewSideStepIdentity";
import { applyDuplicatePlan, buildDuplicatePlan, type CopyMode } from "./subprofileDuplicate";
import styles from "./NewSideModal.module.css";

/** The full mutation surface — passed to the create helper so every write goes
 *  through the demo-aware hooks (dual-mode preserved). */
type SubprofileMutations = ReturnType<typeof useSubprofileMutations>;

/** Create a draft, tie its address (linked default, or explicitly unlinked
 *  with a handle), then seed it per method: copy from a source via
 *  `applyDuplicatePlan`, seed the kind template, or leave it bare (blank).
 *  Returns the new draft's id. Extracted from the component so the modal
 *  stays under the line budget; every write goes through `mutations` so demo
 *  and live behave identically. */
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
}): Promise<string> {
  const { kind, displayName, method, copyDefaultName, linkVisibility, handle, source, copyMode, mutations, t } =
    args;
  const { create, update, replaceSection, replaceSocials, replaceAffiliations } = mutations;
  // displayName is required and the backend derives the slug — send a valid
  // name (falling back to the source copy name, else the profession).
  const created = await create.mutateAsync({
    kind,
    displayName:
      displayName.trim() ||
      (method === "copy" ? copyDefaultName : KIND_LABELS[kind]),
  });

  if (linkVisibility === "unlinked") {
    // A failure here (e.g. a handle that turns out to be taken) shouldn't
    // strand the draft as unpublishable — it lands in the editor either
    // way, still linked, where the address is editable and re-checked by
    // the publish checklist.
    try {
      await update.mutateAsync({
        id: created.id,
        dto: { linkVisibility: "unlinked", handle },
      });
    } catch {
      /* stays linked; editable in the editor */
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
  return created.id;
}

/**
 * Two-step create wizard: step 1 picks the craft (by-craft family picker,
 * blank, or copy an existing persona); step 2 names it and chooses whether
 * it's linked to the owner's profile or stands alone with its own handle.
 * `createAndSeedSubprofile` does the actual work once step 2 submits — every
 * write goes through `useSubprofileMutations()` (dual-mode).
 */
export function NewSideModal({
  onClose,
  initialKind = null,
}: {
  onClose: () => void;
  /** Pre-select a craft (Moment 4's persona-creation deep-link, `?kind=` on
   *  `MySubprofilesPage`) so the member lands on step 1 with it already
   *  chosen instead of the blank family picker. Caller validates the raw
   *  query param against `SubprofileKind` before passing it in. */
  initialKind?: SubprofileKind | null;
}) {
  const navigate = useNavigate();
  const mutations = useSubprofileMutations();
  const { create } = mutations;
  const { data: mySubprofiles } = useSubprofiles();
  const sources = mySubprofiles ?? [];
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  // The vanity-URL preview shows the signed-in member's own slug. The mock
  // "tiago" seed is only used as a demo-mode fallback if there's no session.
  const ownerSlug = user?.profile.slug ?? (demoMode ? currentUserSlug : "you");

  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<StartMethod>("template");
  const [kind, setKind] = useState<SubprofileKind | null>(initialKind);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [copyMode, setCopyMode] = useState<CopyMode>("full");
  const [displayName, setDisplayName] = useState("");
  const [linkVisibility, setLinkVisibility] = useState<LinkVisibility>("linked");

  const source = sources.find((candidate) => candidate.id === sourceId) ?? null;
  const effectiveKind = method === "copy" ? (source?.kind ?? null) : kind;
  const copyDefaultName = source ? `${source.displayName} copy` : "";
  const step1Ready = effectiveKind !== null && (method !== "copy" || source !== null);

  const effectiveDisplayName =
    displayName.trim() ||
    (method === "copy" ? copyDefaultName : effectiveKind ? KIND_LABELS[effectiveKind] : "");
  const autoSlug =
    slugify(effectiveDisplayName) || (effectiveKind ? defaultSlugForKind(effectiveKind) : "");
  const handleCandidate = autoSlug;
  const step2Ready =
    linkVisibility !== "unlinked" || handleFormatError(handleCandidate) === null;

  const displayNamePlaceholder =
    method === "copy"
      ? copyDefaultName || t("subprofiles:newModal.displayNamePlaceholderDefault")
      : effectiveKind
        ? t("subprofiles:newModal.displayNamePlaceholderExample", {
            kind: t(KIND_LABEL_KEYS[effectiveKind]),
          })
        : t("subprofiles:newModal.displayNamePlaceholderDefault");

  async function submit() {
    if (!effectiveKind || !step2Ready) return;
    try {
      const createdId = await createAndSeedSubprofile({
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
      onClose();
      void navigate(subprofileEditPath(createdId));
    } catch {
      showToast(t("subprofiles:newModal.toastError"), "error");
    }
  }

  return (
    <Modal
      title={
        <Translation
          i18nKey={step === 1 ? "subprofiles:newModal.stepCraftTitle" : "subprofiles:newModal.stepIdentityTitle"}
          components={{ em: <em /> }}
        />
      }
      sub={t(step === 1 ? "subprofiles:newModal.sub" : "subprofiles:newModal.stepIdentitySub")}
      onClose={onClose}
      footer={
        step === 1 ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              {t("subprofiles:newModal.cancel")}
            </Button>
            <Button variant="primary" onClick={() => setStep(2)} disabled={!step1Ready}>
              {t("subprofiles:newModal.continue")}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setStep(1)}>
              {t("subprofiles:newModal.back")}
            </Button>
            <Button
              variant="primary"
              onClick={() => void submit()}
              disabled={!step2Ready || create.isPending}
            >
              {create.isPending
                ? t("subprofiles:newModal.creating")
                : t("subprofiles:newModal.create")}
            </Button>
          </>
        )
      }
    >
      <span className="visuallyHidden" role="status" aria-live="polite">
        {t("subprofiles:newModal.stepOf", { step, total: 2 })}
      </span>

      <div className={styles.stepBody}>
        {step === 1 ? (
          <NewSideStepCraft
            method={method}
            onChangeMethod={setMethod}
            kind={kind}
            onChangeKind={setKind}
            sources={sources}
            sourceId={sourceId}
            onChangeSourceId={setSourceId}
            copyMode={copyMode}
            onChangeCopyMode={setCopyMode}
            effectiveKind={effectiveKind}
            t={t}
          />
        ) : (
          <NewSideStepIdentity
            displayName={displayName}
            onChangeDisplayName={setDisplayName}
            displayNamePlaceholder={displayNamePlaceholder}
            linkVisibility={linkVisibility}
            onChangeLinkVisibility={setLinkVisibility}
            ownerSlug={ownerSlug}
            slug={autoSlug}
            handle={handleCandidate}
            t={t}
          />
        )}
      </div>
    </Modal>
  );
}
