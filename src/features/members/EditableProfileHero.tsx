import { Reveal } from '../../shared/components/ui'
import type { ImageSlotTint } from '../../shared/components/ui'
import { useProfile } from '../../app/providers/ProfileProvider'
import { AvatarEditor } from './AvatarEditor'
import {
  InlineText,
  InlineTextarea,
  PronounPicker,
  TagEditor,
  VisibilityPicker,
} from './profileEditControls'
import base from './ProfilePage.module.css'
import styles from './ProfileEdit.module.css'

function resolveTint(tint: string): ImageSlotTint {
  return tint === 'coral' || tint === 'jade' || tint === 'plum' ? tint : 'plum'
}

/**
 * Edit-mode twin of `ProfileHero`: the same hero layout, but every field the user
 * can change is an inline control bound to the draft in `ProfileProvider`. Saving
 * and discarding live in the sticky `ProfileEditBar` rendered by the page.
 */
export function EditableProfileHero() {
  const { profile, draft, updateDraft } = useProfile()

  return (
    <header className={base.phero}>
      <div className="wrap">
        <div className={base.pheroGrid}>
          <Reveal className={base.portraitWrap}>
            <AvatarEditor
              photo={draft.photo}
              initials={profile.initials}
              tint={resolveTint(profile.tint)}
              name={`${draft.first} ${draft.last}`}
              onChange={(url) => updateDraft({ photo: url })}
              onRemove={() => updateDraft({ photo: undefined })}
            />
          </Reveal>

          <Reveal delay={80}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Status &amp; visibility</label>
              <VisibilityPicker
                value={draft.visibility}
                onChange={(v) => updateDraft({ visibility: v })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Name</label>
              <div className={styles.nameEdit}>
                <InlineText
                  value={draft.first}
                  ariaLabel="First name"
                  placeholder="First"
                  className={styles.nameInput}
                  onChange={(v) => updateDraft({ first: v })}
                />
                <InlineText
                  value={draft.last}
                  ariaLabel="Last name"
                  placeholder="Last"
                  className={`${styles.nameInput} ${styles.lastInput}`}
                  onChange={(v) => updateDraft({ last: v })}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Role</label>
              <InlineText
                value={draft.role}
                ariaLabel="Role or title"
                placeholder="e.g. Fullstack Developer"
                className={styles.roleInput}
                onChange={(v) => updateDraft({ role: v })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Pronouns</label>
              <PronounPicker
                value={draft.pronouns}
                onChange={(v) => updateDraft({ pronouns: v })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Neighbourhood</label>
              <InlineText
                value={draft.hood}
                ariaLabel="Neighbourhood"
                placeholder="e.g. Arroios"
                className={styles.hoodInput}
                onChange={(v) => updateDraft({ hood: v })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Bio</label>
              <InlineTextarea
                value={draft.bio}
                ariaLabel="Bio"
                className={styles.bioInput}
                onChange={(v) => updateDraft({ bio: v })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Tags</label>
              <TagEditor
                tags={draft.tags}
                placeholder="Add a skill…"
                onChange={(tags) => updateDraft({ tags })}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </header>
  )
}
