import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useWorkshops } from "../../app/providers/WorkshopsProvider";
import { currentUser, currentUserSlug } from "../members/data/members";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import { buildWorkshop, type WorkshopDraft } from "./addWorkshop.build";
import styles from "./ApplicationModals.module.css";

const CATS = [
  { value: "creative", label: "Creative" },
  { value: "craft", label: "Craft" },
  { value: "design", label: "Design" },
  { value: "tech", label: "Tech" },
  { value: "business", label: "Business" },
  { value: "care", label: "Care" },
];
const MODES = ["In-person", "Online", "Hybrid"];

/** Plum-panel confirmation shown once the workshop is live. */
function ListedPanel({
  title,
  newId,
  onClose,
}: {
  title: string;
  newId: string | null;
  onClose: () => void;
}) {
  return (
    <SuccessPanel
      title="Workshop"
      em="listed."
      onClose={onClose}
      closeLabel="Done"
      footer={
        newId && (
          <div className={styles.successBtn} style={{ marginTop: 10 }}>
            <Button variant="ghost-dark" to={`${routes.skills}/${newId}`}>
              View your workshop →
            </Button>
          </div>
        )
      }
    >
      <strong>{title}</strong> is live on Skills &amp; learning. Members can
      browse it, read the plan, and reserve a seat. Edit the details or add
      sessions any time from your workshop page.
    </SuccessPanel>
  );
}

export function AddWorkshopModal({ onClose }: { onClose: () => void }) {
  const { addWorkshop } = useWorkshops();
  const [draft, setDraft] = useState<WorkshopDraft>({
    title: "",
    blurb: "",
    about: "",
    cat: "creative",
    mode: "In-person",
    weeks: "6",
    size: "8",
    price: "150",
    venue: "",
  });
  const [newId, setNewId] = useState<string | null>(null);
  const { sending, done, submit } = useSubmitFlow();

  const set = (patch: Partial<WorkshopDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));
  const num = (v: string) => Number(v) || 0;
  const valid =
    draft.title.trim().length > 2 &&
    draft.blurb.trim().length > 8 &&
    draft.about.trim().length > 12 &&
    num(draft.weeks) >= 1 &&
    num(draft.size) >= 2 &&
    num(draft.price) >= 0;

  const onSubmit = () => {
    if (!valid) return;
    const workshop = buildWorkshop(draft, {
      name: `${currentUser.first} ${currentUser.last}`,
      initials: currentUser.initials,
      tint: currentUser.tint,
      role: "QueerPulse member · running this for the first time",
      memberSlug: currentUserSlug,
    });
    setNewId(workshop.id);
    submit(() => addWorkshop(workshop));
  };

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      wide
      ariaLabel="List a workshop"
    >
      {done ? (
        <ListedPanel title={draft.title} newId={newId} onClose={onClose} />
      ) : (
        <>
          <div className={styles.eyebrow}>Skills &amp; learning</div>
          <h2 className={styles.title}>
            List an <em>advanced workshop.</em>
          </h2>
          <p className={styles.sub}>
            Share a multi-week course you're running. Keep it honest about the
            level and the pace — people are trusting you with real time.
          </p>

          <div className={styles.field}>
            <label htmlFor="aw-title">Workshop title *</label>
            <input
              id="aw-title"
              type="text"
              value={draft.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="e.g. Letterpress, from setting type to a printed page"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="aw-blurb">One-line summary *</label>
            <input
              id="aw-blurb"
              type="text"
              value={draft.blurb}
              onChange={(e) => set({ blurb: e.target.value })}
              placeholder="Who it's for and what they'll walk away with"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="aw-about">What you'll actually do *</label>
            <textarea
              id="aw-about"
              rows={4}
              value={draft.about}
              onChange={(e) => set({ about: e.target.value })}
              placeholder="The shape of the sessions, the level assumed, what people make. One idea per line."
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="aw-cat">Category *</label>
              <select
                id="aw-cat"
                value={draft.cat}
                onChange={(e) => set({ cat: e.target.value })}
              >
                {CATS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="aw-mode">Format *</label>
              <select
                id="aw-mode"
                value={draft.mode}
                onChange={(e) => set({ mode: e.target.value })}
              >
                {MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="aw-weeks">Length (weeks) *</label>
              <input
                id="aw-weeks"
                type="number"
                min={1}
                max={52}
                value={draft.weeks}
                onChange={(e) => set({ weeks: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="aw-size">Cohort size *</label>
              <input
                id="aw-size"
                type="number"
                min={2}
                max={40}
                value={draft.size}
                onChange={(e) => set({ size: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="aw-price">Standard price (€) *</label>
              <input
                id="aw-price"
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) => set({ price: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="aw-venue">Where (venue · neighbourhood)</label>
            <input
              id="aw-venue"
              type="text"
              value={draft.venue}
              onChange={(e) => set({ venue: e.target.value })}
              placeholder="e.g. Estúdio Graça · Graça"
            />
          </div>

          <p className={styles.note}>
            We'll set up a reduced and a solidarity rate automatically from your
            standard price — you can tune them later. Sessions start empty; add
            the week-by-week plan from your workshop page.
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              Cancel
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={onSubmit}
            >
              {sending ? <Sending label="Publishing…" /> : "Publish workshop"}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
