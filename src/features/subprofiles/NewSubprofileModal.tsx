import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";
import { currentUserSlug } from "../members/data/members";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { SubprofileKind } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { itemsToInputDto } from "./api/subprofiles.adapters";
import {
  KIND_LABELS,
  KIND_LABEL_KEYS,
  KIND_SECTIONS,
  SECTION_META,
  defaultSlugForKind,
  slugify,
} from "./subprofile-kinds";
import { buildTemplateSections, templateTaglineFor } from "./subprofileTemplates.data";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import { useSubprofiles } from "./api/useSubprofiles";
import { StartMethodPicker, type StartMethod } from "./StartMethodPicker";
import { CopySourcePicker } from "./CopySourcePicker";
import { CopyModePreview } from "./CopyModePreview";
import { applyDuplicatePlan, buildDuplicatePlan, type CopyMode } from "./subprofileDuplicate";
import styles from "./MySubprofilesPage.module.css";

const KINDS = Object.keys(KIND_LABELS) as SubprofileKind[];

/** The lead section's icon stands in for the whole kind in the picker. */
function kindIcon(kind: SubprofileKind) {
  return SECTION_META[KIND_SECTIONS[kind][0]!].icon;
}

/** The full mutation surface — passed to the create helper so every write goes
 *  through the demo-aware hooks (dual-mode preserved). */
type SubprofileMutations = ReturnType<typeof useSubprofileMutations>;

/** Create a draft, apply the chosen address, then seed it per method: copy from
 *  a source via `applyDuplicatePlan`, seed the kind template, or leave it bare
 *  (blank). Returns the new draft's id. Extracted from the component so the
 *  modal stays under the line budget; every write goes through `mutations` so
 *  demo and live behave identically. */
async function createAndSeedSubprofile(args: {
  kind: SubprofileKind;
  displayName: string;
  method: StartMethod;
  copyDefaultName: string;
  normalizedSlug: string;
  source: SubprofileView | null;
  copyMode: CopyMode;
  mutations: SubprofileMutations;
  t: TranslationApi["t"];
}): Promise<string> {
  const { kind, displayName, method, copyDefaultName, normalizedSlug, source, copyMode, mutations, t } =
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
  // Apply the chosen address via the same PATCH the editor uses. A failure here
  // (e.g. a taken slug) shouldn't strand the draft — they land in the editor
  // where the address is editable.
  if (normalizedSlug && normalizedSlug !== created.slug) {
    try {
      await update.mutateAsync({ id: created.id, dto: { slug: normalizedSlug } });
    } catch {
      /* address stays the default; editable in the editor */
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

/** The copy branch's body: pick which persona to copy, then (once one is
 *  chosen) choose full-vs-content with a live summary. Extracted to keep the
 *  modal component under the line budget. */
function NewSubprofileCopyPane({
  sources,
  sourceId,
  onSelectSource,
  source,
  copyMode,
  onChangeCopyMode,
  t,
}: {
  sources: SubprofileView[];
  sourceId: string | null;
  onSelectSource: (id: string) => void;
  source: SubprofileView | null;
  copyMode: CopyMode;
  onChangeCopyMode: (mode: CopyMode) => void;
  t: TranslationApi["t"];
}) {
  return (
    <>
      <CopySourcePicker
        sources={sources}
        selectedId={sourceId}
        onSelect={onSelectSource}
        t={t}
      />
      {source && (
        <CopyModePreview
          source={source}
          mode={copyMode}
          onChange={onChangeCopyMode}
          t={t}
        />
      )}
    </>
  );
}

/**
 * Start a new persona three ways: from a kind template (default), blank, or by
 * copying one of the owner's existing personas. Naming is optional — leave the
 * display name blank and the persona is named after the profession (a Writer
 * lives at /members/you/writer). The address defaults to the slugified display
 * name (or the profession) but can be edited here — a valid address is required
 * to create. Creation makes a draft via `create`; template seeds the kind's
 * scaffold, copy seeds from the source via `applyDuplicatePlan`.
 */
export function NewSubprofileModal({ onClose }: { onClose: () => void }) {
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
  const [kind, setKind] = useState<SubprofileKind | null>(null);
  const [displayName, setDisplayName] = useState("");
  // The address holds its own value only once the owner types a custom one;
  // until then it's derived from the display name (or the profession).
  const [customSlug, setCustomSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  // Defaults to "start from a template" — the friendlier first-run path.
  const [method, setMethod] = useState<StartMethod>("template");
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [copyMode, setCopyMode] = useState<CopyMode>("full");
  const source = sources.find((candidate) => candidate.id === sourceId) ?? null;

  // In copy mode the kind comes from the source and the name defaults to
  // "<source> copy"; template/blank keep the picked-kind behaviour.
  const effectiveKind = method === "copy" ? (source?.kind ?? null) : kind;
  const copyDefaultName = source ? `${source.displayName} copy` : "";
  const autoSlug =
    slugify(displayName) ||
    (method === "copy"
      ? slugify(copyDefaultName) || (effectiveKind ? defaultSlugForKind(effectiveKind) : "")
      : effectiveKind
        ? defaultSlugForKind(effectiveKind)
        : "");
  const slug = slugEdited ? customSlug : autoSlug;
  const normalizedSlug = slugify(slug);
  const slugValid = normalizedSlug.length > 0;

  // Need an effective kind, a valid address, and — in copy mode — a source.
  const ready =
    effectiveKind !== null && slugValid && (method !== "copy" || source !== null);

  async function submit() {
    if (!ready || !effectiveKind) return;
    try {
      const createdId = await createAndSeedSubprofile({
        kind: effectiveKind,
        displayName,
        method,
        copyDefaultName,
        normalizedSlug,
        source,
        copyMode,
        mutations,
        t,
      });
      onClose();
      void navigate(`/account/subprofiles/${createdId}/edit`);
    } catch {
      showToast(t("subprofiles:newModal.toastError"), "error");
    }
  }

  return (
    <Modal
      title={
        <Translation
          i18nKey="subprofiles:newModal.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("subprofiles:newModal.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("subprofiles:newModal.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => void submit()}
            disabled={!ready || create.isPending}
          >
            {create.isPending
              ? t("subprofiles:newModal.creating")
              : t("subprofiles:newModal.create")}
          </Button>
        </>
      }
    >
      <StartMethodPicker
        method={method}
        onChange={setMethod}
        copyDisabled={sources.length === 0}
        t={t}
      />

      {method !== "copy" && (
        <div className={styles.kindGrid}>
          {KINDS.map((candidateKind) => {
            const Icon = kindIcon(candidateKind);
            return (
              <button
                key={candidateKind}
                type="button"
                aria-pressed={kind === candidateKind}
                className={[styles.kindBtn, kind === candidateKind && styles.kindBtnOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setKind(candidateKind)}
              >
                <Icon size={18} aria-hidden />
                {t(KIND_LABEL_KEYS[candidateKind])}
              </button>
            );
          })}
        </div>
      )}

      {method === "copy" && (
        <NewSubprofileCopyPane
          sources={sources}
          sourceId={sourceId}
          onSelectSource={setSourceId}
          source={source}
          copyMode={copyMode}
          onChangeCopyMode={setCopyMode}
          t={t}
        />
      )}

      <FormField
        label={t("subprofiles:newModal.displayNameLabel")}
        helper={t("subprofiles:newModal.displayNameHelper")}
      >
        <input
          value={displayName}
          placeholder={
            method === "copy"
              ? copyDefaultName || t("subprofiles:newModal.displayNamePlaceholderDefault")
              : effectiveKind
                ? t("subprofiles:newModal.displayNamePlaceholderExample", {
                    kind: t(KIND_LABEL_KEYS[effectiveKind]),
                  })
                : t("subprofiles:newModal.displayNamePlaceholderDefault")
          }
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </FormField>

      <FormField
        label={t("subprofiles:newModal.addressLabel")}
        helper={
          <>
            {t("subprofiles:metaForm.livesAt")}{" "}
            <span className={styles.pathPreview}>
              /members/{ownerSlug}/{normalizedSlug || "…"}
            </span>
          </>
        }
      >
        <input
          value={slug}
          placeholder={t("subprofiles:newModal.addressPlaceholder")}
          aria-invalid={!slugValid}
          onChange={(event) => {
            setSlugEdited(true);
            setCustomSlug(event.target.value);
          }}
        />
      </FormField>
    </Modal>
  );
}
