import { useRef } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfile } from "../../app/providers/useProfile";
import type { ImageSlotTint } from "../../shared/components/ui";
import { AvatarEditor } from "./AvatarEditor";
import { ProfileEditIdentityFields } from "./ProfileEditIdentityFields";
import { ProfileEditDetailFields } from "./ProfileEditDetailFields";
import { useEnterEditFocus } from "./useEnterEditFocus";
import styles from "./ProfileEdit.module.css";

function resolveTint(tint: string): ImageSlotTint {
  return tint === "coral" || tint === "jade" || tint === "plum" ? tint : "plum";
}

/**
 * Phone-width edit-mode layout: a centered single column echoing the read-only
 * mobile view (circular pride-ringed avatar + centered identity fields), then
 * the left-aligned detail fields. Reuses the same shared field groups and draft
 * bindings as the desktop `EditableProfileHero`; only the arrangement and the
 * avatar shape differ.
 */
export function MobileEditableProfileHero({
  focusLinks = false,
}: {
  focusLinks?: boolean;
}) {
  const { t } = useTranslation();
  const { profile, draft, updateDraft } = useProfile();
  const heroRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEnterEditFocus(focusLinks, heroRef, linksRef, reduced);

  return (
    <header className={styles.mEditHeader} ref={heroRef}>
      <h1 className="visuallyHidden">
        {`${draft.first} ${draft.last}`.trim() ||
          t("members:profileEdit.field.name")}
      </h1>
      <div className={styles.mEditAvatar}>
        <AvatarEditor
          variant="circle"
          photo={draft.photo}
          initials={profile.initials}
          tint={resolveTint(profile.tint)}
          name={`${draft.first} ${draft.last}`}
          onChange={(key) => updateDraft({ photo: key })}
          onRemove={() => updateDraft({ photo: undefined })}
        />
      </div>
      <ProfileEditIdentityFields centered />
      <ProfileEditDetailFields linksRef={linksRef} />
    </header>
  );
}
