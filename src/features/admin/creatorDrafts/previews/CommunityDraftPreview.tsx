import { useMemo } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  ACCESS_OPTIONS,
  CATEGORY_OPTIONS,
  TINT_OPTIONS,
  type CommunityDraft,
  type Steward,
} from "../../../communities/startCommunity/startCommunity.data";
import { StartCommunityPreview } from "../../../communities/startCommunity/StartCommunityPreview";
import { emptyDraft } from "../../../communities/startCommunity/useCommunityForm";
import type { CommunityDraftPreview as CommunityDraftPreviewData } from "../../api/adminCreatorDrafts.api";
import { CreatorDraftPreviewFrame } from "./CreatorDraftPreviewFrame";
import styles from "./CreatorDraftPreviews.module.css";

/** The steward `emptyDraft` asks for. The founding-members block stays
 *  hidden in a staff preview, so this name and these initials never show. */
const PLACEHOLDER_STEWARD: Steward = {
  key: "owner",
  name: "",
  initials: "",
  tint: "plum",
  role: "owner",
};

/** The value when it is a string, else the wizard's own empty value. */
function textOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

/** The value when it is a list of strings, else the wizard's own list. */
function textListOr(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) &&
    value.every((entry) => typeof entry === "string")
    ? value
    : fallback;
}

/** The value when it is one of `allowed`, else the wizard's own value. */
function oneOf<Value extends string>(
  value: unknown,
  allowed: readonly Value[],
  fallback: Value | "",
): Value | "" {
  return allowed.find((candidate) => candidate === value) ?? fallback;
}

/** The allow-listed draft over the wizard's empty shape, field by field: a
 *  value of the wrong type keeps the empty draft's own value, so a malformed
 *  payload renders as a sparser card. An image the server could not resolve
 *  arrives as null, where the wizard stores "". */
function previewToDraft(preview: CommunityDraftPreviewData): CommunityDraft {
  const empty = emptyDraft(PLACEHOLDER_STEWARD);
  return {
    ...empty,
    name: textOr(preview.name, empty.name),
    purpose: textOr(preview.purpose, empty.purpose),
    type: oneOf(
      preview.type,
      CATEGORY_OPTIONS.map((option) => option.type),
      empty.type,
    ),
    whoFor: textOr(preview.whoFor, empty.whoFor),
    accessTier: oneOf(
      preview.accessTier,
      ACCESS_OPTIONS.map((option) => option.tier),
      empty.accessTier,
    ),
    features: textListOr(preview.features, empty.features),
    rules: textListOr(preview.rules, empty.rules),
    nowReading: textOr(preview.nowReading, empty.nowReading),
    tint:
      TINT_OPTIONS.find((option) => option.key === preview.tint)?.key ??
      empty.tint,
    coverImageUrl: textOr(preview.coverImageUrl, ""),
    avatarImageUrl: textOr(preview.avatarImageUrl, ""),
    tagline: textOr(preview.tagline, empty.tagline),
    handle: textOr(preview.handle, empty.handle),
    tags: textListOr(preview.tags, empty.tags),
    stewards: [],
    invites: [],
    consent: false,
    welcomeMessage: "",
    rosterVisible: false,
  };
}

/**
 * A Start-a-Community draft as the wizard's own live card shows it, for
 * staff, inside the inert preview frame. The founding members stay hidden:
 * the stewards and invites are the founder's private picks. The wizard's own
 * frame stays off too (its sticky column hides below 980px, and its label and
 * note speak to the founder), so the card shows alone at every width.
 */
export function CommunityDraftPreview({
  preview,
}: {
  preview: CommunityDraftPreviewData;
}) {
  const { t } = useTranslation();
  const draft = useMemo(() => previewToDraft(preview), [preview]);
  return (
    <CreatorDraftPreviewFrame label={t("admin:creatorDrafts.preview.label")}>
      <div className={styles.communityFrame}>
        <div className={styles.communityCard}>
          <StartCommunityPreview
            draft={draft}
            avatarPreviewUrl={draft.avatarImageUrl || null}
            coverPreviewUrl={draft.coverImageUrl || null}
            shouldShowFoundingMembers={false}
            shouldShowWizardChrome={false}
          />
        </div>
      </div>
    </CreatorDraftPreviewFrame>
  );
}
