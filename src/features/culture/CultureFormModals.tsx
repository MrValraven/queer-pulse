import { Button } from "../../shared/components/ui";
import {
  ModalShell,
  SuccessPanel,
  Sending,
  ChipSelect,
  useChipSet,
  useSubmitFlow,
} from "./CultureModalKit";
import {
  PICK_KINDS,
  PROJECT_LOOKING_FOR,
  SHOWCASE_MEDIUMS,
  PLAYLIST_VIBES,
  replyByDate,
} from "./cultureModals.data";
import styles from "./CultureModals.module.css";

/** Shared submit button that swaps to a spinner while sending. */
function SubmitBtn({
  sending,
  label,
  onClick,
}: {
  sending: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button variant="primary" disabled={sending} onClick={onClick}>
      {sending ? <Sending label="Sending…" /> : label}
    </Button>
  );
}

/* ── Suggest a pick ──────────────────────────────────────────────────── */
export function SuggestPickModal({ onClose }: { onClose: () => void }) {
  const { sending, done, submit } = useSubmitFlow();
  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title="Pick"
          em="nominated."
          steps={[
            "It joins the ballot for the last-Sunday vote.",
            <>
              We'll email you the results by <strong>{replyByDate(1)}</strong>.
            </>,
          ]}
          onClose={onClose}
        >
          Thank you for nominating something for the club. The community decides
          what we read, watch and listen to next.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Book · Film · Music Club</div>
          <h2 className={styles.title}>
            Suggest a <em>pick</em>
          </h2>
          <p className={styles.sub}>
            Nominate something for the community to vote on this month.
          </p>
          <div className={styles.field}>
            <label htmlFor="pk-kind">Format</label>
            <select id="pk-kind" defaultValue={PICK_KINDS[0]}>
              {PICK_KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="pk-title">Title</label>
            <input
              id="pk-title"
              type="text"
              placeholder="e.g. Detransition, Baby"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pk-author">Author / artist / director</label>
            <input id="pk-author" type="text" placeholder="Who made it?" />
          </div>
          <div className={styles.field}>
            <label htmlFor="pk-why">Why this one?</label>
            <textarea
              id="pk-why"
              placeholder="A sentence on why the club should pick it…"
            />
          </div>
          <div className={styles.foot}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <SubmitBtn
              sending={sending}
              label="Nominate pick"
              onClick={() => submit()}
            />
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── Post a project (commission board) ───────────────────────────────── */
export function PostProjectModal({ onClose }: { onClose: () => void }) {
  const { sending, done, submit } = useSubmitFlow();
  const { selected, toggle } = useChipSet();
  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title="Project"
          em="posted."
          steps={[
            "A moderator reviews new posts within 48 hours.",
            <>
              Once live, you'll get interest by email — first replies usually
              arrive within a week.
            </>,
          ]}
          onClose={onClose}
        >
          Your call for collaborators is in the queue. We keep the board small
          and intentional, so every post is read by a human first.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Commission Board</div>
          <h2 className={styles.title}>
            Post a <em>project</em>
          </h2>
          <p className={styles.sub}>
            Tell the community what you're making and who you need.
          </p>
          <div className={styles.field}>
            <label htmlFor="pp-title">Project title</label>
            <input
              id="pp-title"
              type="text"
              placeholder="What are you making?"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pp-desc">Description</label>
            <textarea
              id="pp-desc"
              placeholder="What it is, where you're at, and what collaboration looks like…"
            />
          </div>
          <div className={styles.field}>
            <label>Looking for</label>
            <ChipSelect
              options={PROJECT_LOOKING_FOR}
              selected={selected}
              onToggle={toggle}
            />
          </div>
          <div className={styles.foot}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <SubmitBtn
              sending={sending}
              label="Post project"
              onClick={() => submit()}
            />
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── Submit your work (art showcase) ─────────────────────────────────── */
export function SubmitWorkModal({ onClose }: { onClose: () => void }) {
  const { sending, done, submit } = useSubmitFlow();
  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title="Work"
          em="submitted."
          steps={[
            "Submissions are reviewed once a month by rotating member curators.",
            <>
              You'll hear back by <strong>{replyByDate(4)}</strong>, selected or
              not.
            </>,
          ]}
          onClose={onClose}
        >
          Thank you for trusting us with your work. The showcase rotates eight
          pieces at a time, chosen by the community.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Art Showcase</div>
          <h2 className={styles.title}>
            Submit your <em>work</em>
          </h2>
          <p className={styles.sub}>
            Up to three pieces. Reviewed monthly by member curators.
          </p>
          <div className={styles.field}>
            <label htmlFor="sw-title">Title of the work</label>
            <input
              id="sw-title"
              type="text"
              placeholder="e.g. Corpo Estranho, 2024"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="sw-medium">Medium</label>
            <select id="sw-medium" defaultValue="">
              <option value="" disabled>
                Choose a medium
              </option>
              {SHOWCASE_MEDIUMS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="sw-link">Link to the work</label>
            <input
              id="sw-link"
              type="url"
              placeholder="Portfolio, image or video URL"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="sw-about">About the piece</label>
            <textarea
              id="sw-about"
              placeholder="A short statement the curators can read…"
            />
          </div>
          <div className={styles.foot}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <SubmitBtn
              sending={sending}
              label="Submit work"
              onClick={() => submit()}
            />
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── Submit a playlist (radio) ───────────────────────────────────────── */
export function SubmitPlaylistModal({ onClose }: { onClose: () => void }) {
  const { sending, done, submit } = useSubmitFlow();
  const { selected, toggle } = useChipSet();
  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title="Playlist"
          em="received."
          steps={[
            "A curator listens to every submission — no algorithm, no skips.",
            <>
              If it's a fit, we'll book you a slot and email you by{" "}
              <strong>{replyByDate(3)}</strong>.
            </>,
          ]}
          onClose={onClose}
        >
          Thank you for offering to take a turn on community radio. We rotate
          guest DJs so the sound stays human.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Community Radio</div>
          <h2 className={styles.title}>
            Submit a <em>playlist</em>
          </h2>
          <p className={styles.sub}>
            Pitch a set for a guest DJ slot. No ads, no algorithm.
          </p>
          <div className={styles.field}>
            <label htmlFor="pl-name">Playlist name</label>
            <input
              id="pl-name"
              type="text"
              placeholder="e.g. A noite que ficou em Lisboa"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pl-link">Link to the set</label>
            <input
              id="pl-link"
              type="url"
              placeholder="Spotify, SoundCloud or a tracklist URL"
            />
          </div>
          <div className={styles.field}>
            <label>Vibe</label>
            <ChipSelect
              options={PLAYLIST_VIBES}
              selected={selected}
              onToggle={toggle}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pl-note">Curator's note</label>
            <textarea
              id="pl-note"
              placeholder="When is this for? What's it about?…"
            />
          </div>
          <div className={styles.foot}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <SubmitBtn
              sending={sending}
              label="Submit playlist"
              onClick={() => submit()}
            />
          </div>
        </>
      )}
    </ModalShell>
  );
}
