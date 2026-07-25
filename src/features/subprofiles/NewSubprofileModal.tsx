import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { currentUserSlug } from "../members/data/members";
import type { SubprofileKind } from "./api/subprofiles.api";
import {
  KIND_LABELS,
  KIND_LABEL_KEYS,
  KIND_SECTIONS,
  SECTION_META,
  defaultSlugForKind,
  slugify,
} from "./subprofile-kinds";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import styles from "./MySubprofilesPage.module.css";

const KINDS = Object.keys(KIND_LABELS) as SubprofileKind[];

/** The lead section's icon stands in for the whole kind in the picker. */
function kindIcon(kind: SubprofileKind) {
  return SECTION_META[KIND_SECTIONS[kind][0]!].icon;
}

/**
 * Start a new persona: pick one of the eight kinds and land straight in the
 * editor. Naming is optional — leave the display name blank and the persona is
 * just named after the profession (a Writer lives at /members/you/writer). The
 * address defaults to the slugified display name (or the profession when the
 * name is blank) but can be edited here — a valid address is required to
 * create. Creation makes a draft via `create`; the scaffold comes from the kind.
 */
export function NewSubprofileModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { create, update } = useSubprofileMutations();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [kind, setKind] = useState<SubprofileKind | null>(null);
  const [displayName, setDisplayName] = useState("");
  // The address holds its own value only once the owner types a custom one;
  // until then it's derived from the display name (or the profession).
  const [customSlug, setCustomSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  // Default the address to the slugified display name, falling back to the
  // profession's slug when the name is still blank.
  const autoSlug = slugify(displayName) || (kind ? defaultSlugForKind(kind) : "");
  const slug = slugEdited ? customSlug : autoSlug;
  const normalizedSlug = slugify(slug);
  const slugValid = normalizedSlug.length > 0;

  // Need a profession for the scaffold and a valid address to create.
  const ready = kind !== null && slugValid;

  async function submit() {
    if (!ready || !kind) return;
    try {
      // displayName is required and the backend derives the slug — send a valid
      // name (falling back to the profession) and no slug.
      const created = await create.mutateAsync({
        kind,
        displayName: displayName.trim() || KIND_LABELS[kind],
      });
      // Apply the chosen address via the same PATCH the editor uses. A failure
      // here (e.g. a taken slug) shouldn't strand the draft — they land in the
      // editor where the address is editable.
      const wantedSlug = normalizedSlug;
      if (wantedSlug && wantedSlug !== created.slug) {
        try {
          await update.mutateAsync({
            id: created.id,
            dto: { slug: wantedSlug },
          });
        } catch {
          /* address stays the default; editable in the editor */
        }
      }
      onClose();
      navigate(`/account/subprofiles/${created.id}/edit`);
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
            onClick={submit}
            disabled={!ready || create.isPending}
          >
            {create.isPending
              ? t("subprofiles:newModal.creating")
              : t("subprofiles:newModal.create")}
          </Button>
        </>
      }
    >
      <div className={styles.kindGrid}>
        {KINDS.map((k) => {
          const Icon = kindIcon(k);
          return (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              className={[styles.kindBtn, kind === k && styles.kindBtnOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setKind(k)}
            >
              <Icon size={18} aria-hidden />
              {t(KIND_LABEL_KEYS[k])}
            </button>
          );
        })}
      </div>

      <FormField
        label={t("subprofiles:newModal.displayNameLabel")}
        helper={t("subprofiles:newModal.displayNameHelper")}
      >
        <input
          value={displayName}
          placeholder={
            kind
              ? t("subprofiles:newModal.displayNamePlaceholderExample", {
                  kind: t(KIND_LABEL_KEYS[kind]),
                })
              : t("subprofiles:newModal.displayNamePlaceholderDefault")
          }
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </FormField>

      <FormField
        label={t("subprofiles:newModal.addressLabel")}
        helper={
          <>
            {t("subprofiles:metaForm.livesAt")}{" "}
            <span className={styles.pathPreview}>
              /members/{currentUserSlug}/{normalizedSlug || "…"}
            </span>
          </>
        }
      >
        <input
          value={slug}
          placeholder={t("subprofiles:newModal.addressPlaceholder")}
          aria-invalid={!slugValid}
          onChange={(e) => {
            setSlugEdited(true);
            setCustomSlug(e.target.value);
          }}
        />
      </FormField>
    </Modal>
  );
}
