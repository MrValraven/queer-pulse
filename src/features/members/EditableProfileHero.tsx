import { useRef } from "react";
import { Reveal } from "../../shared/components/ui";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfile } from "../../app/providers/useProfile";
import type { ImageSlotTint } from "../../shared/components/ui";
import { AvatarEditor } from "./AvatarEditor";
import { ProfileEditIdentityFields } from "./ProfileEditIdentityFields";
import { ProfileEditDetailFields } from "./ProfileEditDetailFields";
import { useEnterEditFocus } from "./useEnterEditFocus";
import base from "./ProfilePage.module.css";

function resolveTint(tint: string): ImageSlotTint {
  return tint === "coral" || tint === "jade" || tint === "plum" ? tint : "plum";
}

/**
 * Desktop edit-mode twin of `ProfileHero`: the two-column hero grid, but every
 * field is an inline control bound to the draft in `ProfileProvider`. Field
 * groups are shared with the mobile editor via `ProfileEditIdentityFields` /
 * `ProfileEditDetailFields`. Save/discard live in the page's `ProfileEditBar`.
 */
export function EditableProfileHero({
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
    <header className={base.phero} ref={heroRef}>
      <h1 className="visuallyHidden">
        {`${draft.first} ${draft.last}`.trim() ||
          t("members:profileEdit.field.name")}
      </h1>
      <div className="wrap">
        <div className={base.pheroGrid}>
          <Reveal className={base.portraitWrap}>
            <AvatarEditor
              photo={draft.photo}
              initials={profile.initials}
              tint={resolveTint(profile.tint)}
              name={`${draft.first} ${draft.last}`}
              onChange={(key) => updateDraft({ photo: key })}
              onRemove={() => updateDraft({ photo: undefined })}
            />
          </Reveal>

          <Reveal delay={80}>
            <ProfileEditIdentityFields />
            <ProfileEditDetailFields linksRef={linksRef} />
          </Reveal>
        </div>
      </div>
    </header>
  );
}
