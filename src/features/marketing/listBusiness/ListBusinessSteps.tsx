import {
  FiCheck,
  FiHeart,
  FiHome,
  FiInfo,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { useState } from "react";
import { FormField } from "../../../shared/components/ui";
import {
  CATS,
  findDuplicates,
  GOODFOR,
  initials,
  LANGS,
  NEIGHBOURHOODS,
  PRICES,
  VERIFY,
  type VerifyOption,
} from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import styles from "./ListBusinessPage.module.css";

const VERIFY_ICON: Record<string, typeof FiMail> = {
  email: FiMail,
  instagram: FiInstagram,
  post: FiMapPin,
  later: FiMessageCircle,
};

/* ===== Step 0 — You & the place ===== */
export function StepPath({
  form,
  userName,
}: {
  form: ListingForm;
  userName: string;
}) {
  const { draft, pickPath, set } = form;
  return (
    <>
      <PaneHeader
        title="How do you"
        em="know this place?"
        sub="Both paths are welcome, and both go through the same community review. It just changes a couple of questions later."
      />
      <div
        className={styles.pathGrid}
        role="radiogroup"
        aria-label="Your relationship to the place"
      >
        <button
          type="button"
          role="radio"
          aria-checked={draft.path === "claim"}
          className={[
            styles.pathCard,
            draft.path === "claim" && styles.pathCardOn,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => pickPath("claim")}
        >
          <span className={`${styles.pcIc} ${styles.pcIcOwn}`}>
            <FiHome />
          </span>
          <b>I run this place</b>
          <span>
            You own it, lead it, or work here. We'll ask you to verify ownership
            so the directory stays trustworthy.
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={draft.path === "suggest"}
          className={[
            styles.pathCard,
            draft.path === "suggest" && styles.pathCardOn,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => pickPath("suggest")}
        >
          <span className={`${styles.pcIc} ${styles.pcIcSug}`}>
            <FiHeart />
          </span>
          <b>I'm suggesting a place I love</b>
          <span>
            A spot that's been good to you. The team will reach out to the owner
            before it goes live.
          </span>
        </button>
      </div>

      {draft.path === "claim" && (
        <div className={styles.revealBlock}>
          <label>How should we verify you run this place?</label>
          <p>
            It's what keeps the directory trustworthy. Pick whatever's easiest
            for you.
          </p>
          <div className={styles.stack}>
            {VERIFY.map((v: VerifyOption) => {
              const Icon = VERIFY_ICON[v.id] ?? FiMail;
              const on = draft.verify === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={[styles.verifyOpt, on && styles.optOn]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => set({ verify: v.id })}
                >
                  <span className={styles.voIc}>
                    <Icon size={17} />
                  </span>
                  <span className={styles.radioTxt}>
                    <b>{v.label}</b>
                    <span>{v.desc}</span>
                  </span>
                  <span className={styles.voBadge}>{v.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.consent}>
        <FiInfo size={17} aria-hidden />
        <p>
          You're signed in as <b>{userName}</b> — we'll attach this submission
          to your member profile so the team knows who to thank (and ask, if
          needed).
        </p>
      </div>
    </>
  );
}

/* ===== Step 1 — Basics ===== */
export function StepBasics({ form }: { form: ListingForm }) {
  const { draft, set, toggleCat, pickBadge } = form;
  const dups = findDuplicates(draft.name);
  return (
    <>
      <PaneHeader
        title="Start with"
        em="the basics."
        sub="Just enough to put your place on the map. You can make it sing in the next step."
      />

      <FormField
        label="What's it called?"
        required
        helper="The name as people would search for it."
      >
        <input
          type="text"
          maxLength={60}
          placeholder="e.g. Café Beirão"
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
        />
      </FormField>
      {dups.length > 0 && (
        <div className={styles.dupNotice} role="alert">
          <div className={styles.dnHead}>
            A place by this name may already be in the directory:
          </div>
          {dups.map((m) => (
            <div key={m.name} className={styles.dupMatch}>
              <span className={styles.dmAv}>{initials(m.name)}</span>
              <span className={styles.dmInfo}>
                <b>{m.name}</b>
                <span>
                  {m.cat} · {m.hood}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      <FormField label="What kind of place is it? — pick up to 2" required>
        <div className={styles.chipRow} role="group" aria-label="Category">
          {CATS.map((c) => {
            const on = draft.cats.includes(c);
            const full = draft.cats.length >= 2 && !on;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                disabled={full}
                className={[styles.chip, on && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleCat(c)}
              >
                {c}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField label="Which neighbourhood?" required>
        <select
          value={draft.hood}
          onChange={(e) => set({ hood: e.target.value })}
        >
          <option value="">Pick a Lisbon neighbourhood…</option>
          {NEIGHBOURHOODS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Who runs it?"
        required
        helper="Queer-owned, or a place that genuinely welcomes us? Both belong here — this is a welcome, not a gate."
      >
        <div
          className={styles.optGrid}
          role="radiogroup"
          aria-label="Ownership"
        >
          <button
            type="button"
            role="radio"
            aria-checked={draft.badge === "owned"}
            className={[styles.optCard, draft.badge === "owned" && styles.optOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => pickBadge("owned")}
          >
            <span className={`${styles.ownTag} ${styles.ownTagJade}`}>
              Queer-owned
            </span>
            <b>Owned or led by our community</b>
            <span>You, your co-owners, or leadership are LGBTQ+.</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={draft.badge === "friendly"}
            className={[
              styles.optCard,
              draft.badge === "friendly" && styles.optOn,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => pickBadge("friendly")}
          >
            <span className={`${styles.ownTag} ${styles.ownTagCoral}`}>
              LGBTQ+ friendly
            </span>
            <b>A place that welcomes us</b>
            <span>Not queer-owned, but actively safe and affirming.</span>
          </button>
        </div>
      </FormField>
      {draft.badge === "owned" && (
        <div className={styles.revealBlock}>
          <label>A light touch — how is it queer-owned?</label>
          <p>
            No documents. Just a sentence the reviewer can sanity-check. This is
            what keeps the badge meaningful.
          </p>
          <FormField>
            <input
              type="text"
              maxLength={120}
              placeholder="e.g. Co-owned by me (Sandra, she/her) and Rui (he/him) since 2019"
              value={draft.evidence}
              onChange={(e) => set({ evidence: e.target.value })}
            />
          </FormField>
        </div>
      )}

      <FormField label="Roughly the price?" required>
        <div
          className={styles.chipRow}
          role="radiogroup"
          aria-label="Price band"
        >
          {PRICES.map((p) => {
            const on = draft.price === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={on}
                className={[styles.chip, styles.priceChip, on && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => set({ price: p.id })}
              >
                <span className={styles.priceSym}>{p.sym}</span>
                {p.label}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField
        label="The one-liner"
        required
        helper="This is the blurb on your directory card. One sentence, plain and warm."
        labelAside={`${draft.blurb.length} / 140`}
      >
        <textarea
          maxLength={140}
          placeholder="A queer-run pastelaria by day, community room by night."
          value={draft.blurb}
          onChange={(e) => set({ blurb: e.target.value })}
        />
      </FormField>
    </>
  );
}

/* ===== Step 2 — Story ===== */
export function StepStory({ form }: { form: ListingForm }) {
  const { draft, set, setWit, addWit, delWit, addTag, removeTag, toggleIn } =
    form;
  const [tagInput, setTagInput] = useState("");
  const commitTag = () => {
    addTag(tagInput);
    setTagInput("");
  };
  return (
    <>
      <PaneHeader
        title="Now,"
        em="the story."
        sub="This is what fills out your detail page. Write like you'd describe the place to a friend who's new in town."
      />

      <FormField
        label="Tagline"
        required
        helper={
          <>
            A single line shown big and italic at the top of your page.{" "}
            <em>Make it the heart of the place.</em>
          </>
        }
      >
        <input
          type="text"
          maxLength={120}
          placeholder="Nobody gets misgendered. The back room is always yours."
          value={draft.tagline}
          onChange={(e) => set({ tagline: e.target.value })}
        />
      </FormField>

      <FormField
        label="What it actually is"
        required
        helper="Two to four short lines. The things you'd want a stranger to know walking in."
      >
        <div>
          {draft.whatItIs.map((line, i) => (
            <div key={line.id} className={styles.witLine}>
              <input
                type="text"
                maxLength={90}
                placeholder={
                  i === 0
                    ? "e.g. Galão, pastéis, two daily specials"
                    : "One more thing worth knowing"
                }
                value={line.text}
                onChange={(e) => setWit(i, e.target.value)}
              />
              <button
                type="button"
                className={styles.witDel}
                onClick={() => delWit(i)}
                aria-label="Remove line"
              >
                <FiX />
              </button>
            </div>
          ))}
          {draft.whatItIs.length < 4 && (
            <button type="button" className={styles.witAdd} onClick={addWit}>
              <FiPlus size={14} /> Add another line
            </button>
          )}
        </div>
      </FormField>

      <FormField label="Tags — a few words people might filter by">
        <div className={styles.tagInputWrap}>
          <input
            type="text"
            maxLength={24}
            placeholder="e.g. Wheelchair-accessible"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitTag();
              }
            }}
          />
          <button
            type="button"
            className={styles.hoursToolBtn}
            onClick={commitTag}
          >
            Add
          </button>
        </div>
        {draft.tags.length > 0 && (
          <div className={styles.tagList}>
            {draft.tags.map((t) => (
              <button
                key={t}
                type="button"
                className={styles.tagPill}
                onClick={() => removeTag(t)}
                aria-label={`Remove ${t}`}
              >
                {t} <FiX size={11} />
              </button>
            ))}
          </div>
        )}
      </FormField>

      <FormField
        label="Good for… — tick what's true"
        helper="The little things that tell our people they're safe and welcome."
      >
        <div className={styles.gfGrid} role="group" aria-label="Good for">
          {GOODFOR.map((g) => {
            const on = draft.goodFor.includes(g);
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                className={[styles.chip, on && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleIn("goodFor", g)}
              >
                {on && <FiCheck size={12} />} {g}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField label="Languages spoken — optional">
        <div className={styles.chipRow} role="group" aria-label="Languages">
          {LANGS.map((l) => {
            const on = draft.langs.includes(l);
            return (
              <button
                key={l}
                type="button"
                aria-pressed={on}
                className={[styles.chip, on && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleIn("langs", l)}
              >
                {l}
              </button>
            );
          })}
        </div>
      </FormField>
    </>
  );
}
