import { Avatar, Button } from "../../shared/components/ui";
import { currentUser, type MemberProfile } from "./data/memberProfiles";
import { RELATIONSHIPS } from "./vouchMember.data";
import styles from "./VouchMemberModal.module.css";

/**
 * Animated plum-panel success state: the candidate's face and the current
 * user's face pairing up with a jade check, shown once a vouch is confirmed.
 */
export function VouchSuccess({
  profile,
  first,
  onClose,
}: {
  profile: MemberProfile;
  first: string;
  onClose: () => void;
}) {
  return (
    <div className={styles.success}>
      <div className={styles.facePair}>
        <span className={styles.ring} aria-hidden />
        <span className={styles.faceA}>
          <Avatar
            initials={profile.initials}
            tint={profile.tint === "auth" ? "plum" : profile.tint}
            size={74}
            src={profile.photo}
            alt={`${first} ${profile.last}`}
          />
        </span>
        <span className={styles.faceB}>
          <Avatar
            initials={currentUser.initials}
            tint={currentUser.tint}
            size={74}
            src={currentUser.photo}
            alt="You"
          />
          <span className={styles.faceCheck} aria-hidden>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <path
                className={styles.checkPath}
                d="M5 12.5l4 4L19 7"
                stroke="var(--plum)"
                strokeWidth={3.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </div>
      <h2 className={styles.successTitle}>
        That's <em>{first}</em>, backed.
      </h2>
      <p className={styles.successSub}>
        Your face just joined <b>{first}</b>'s circle of vouches — that's how
        trust travels here. Member by member, name by name.
      </p>
      <Button
        variant="ghost-dark"
        size="lg"
        className={styles.doneBtn}
        onClick={onClose}
      >
        Done
      </Button>
    </div>
  );
}

/**
 * The vouch form: relationship radios, optional skill-endorsement chips, the
 * note textarea + counter, and the cancel / submit actions. Owns no state —
 * the modal lifts form state so it survives the loading transition.
 */
export function VouchForm({
  profile,
  first,
  relationship,
  setRelationship,
  endorsed,
  toggleTag,
  note,
  setNote,
  canSubmit,
  status,
  onClose,
  onSubmit,
}: {
  profile: MemberProfile;
  first: string;
  relationship: string;
  setRelationship: (r: string) => void;
  endorsed: string[];
  toggleTag: (tag: string) => void;
  note: string;
  setNote: (n: string) => void;
  canSubmit: boolean;
  status: "form" | "loading" | "done";
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div>
      <div className={styles.eye}>Add your vouch</div>
      <div className={styles.title}>
        Stand behind <em>{first}</em>
      </div>
      <p className={styles.sub}>
        A vouch is you, publicly, saying you know {first} and trust them in
        community spaces. It carries weight here — QueerPulse is
        invite-and-vouch, and your name goes on their profile beside the others
        who've backed them.
      </p>

      <div className={styles.candidate}>
        <Avatar
          initials={profile.initials}
          tint={profile.tint === "auth" ? "plum" : profile.tint}
          size={48}
          src={profile.photo}
        />
        <div>
          <div className={styles.candName}>
            {first} {profile.last}
          </div>
          <div className={styles.candRole}>{profile.role}</div>
        </div>
      </div>

      <div className={styles.label}>How do you know {first}?</div>
      <div className={styles.opts}>
        {RELATIONSHIPS.map((r) => (
          <label
            key={r}
            className={[styles.opt, relationship === r && styles.optChecked]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="radio"
              name="vouch-relationship"
              value={r}
              checked={relationship === r}
              onChange={() => setRelationship(r)}
            />
            {r}
          </label>
        ))}
      </div>

      {profile.tags.length > 0 && (
        <>
          <div className={styles.label}>
            What can you vouch they're great at?{" "}
            <span className={styles.optional}>optional</span>
          </div>
          <div className={styles.chips}>
            {profile.tags.map((tag) => {
              const on = endorsed.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  className={[styles.chip, on && styles.chipOn]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={on}
                >
                  {on && (
                    <span className={styles.chipCheck} aria-hidden>
                      <svg
                        width={13}
                        height={13}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          className={styles.chipCheckPath}
                          d="M5 12.5l4 4L19 7"
                          stroke="var(--jade)"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                  {tag}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className={styles.label}>Your note</div>
      <textarea
        className={styles.textarea}
        placeholder={`How do you know ${first}, and what should other members know?`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className={styles.counter}>
        {note.trim().length < 12
          ? `${12 - note.trim().length} more characters to submit`
          : `${note.trim().length} characters`}
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          className={styles.full}
          onClick={onSubmit}
          disabled={!canSubmit || status === "loading"}
        >
          {status === "loading" ? (
            <>
              <span className={styles.spinner} aria-hidden />
              Sending your vouch…
            </>
          ) : (
            `Vouch for ${first}`
          )}
        </Button>
      </div>
    </div>
  );
}
