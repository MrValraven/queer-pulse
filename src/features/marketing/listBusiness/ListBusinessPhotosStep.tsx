import { FiShield } from "react-icons/fi";
import {
  CheckLine,
  FormField,
  ImageSlot,
  Toggle,
} from "../../../shared/components/ui";
import {
  ANCHOR,
  NOTIFY,
  REL,
  VIS,
  type OptionRow,
  type OwnerRel,
  type OwnerVisibility,
  type PhotoKey,
} from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import styles from "./ListBusinessPage.module.css";

const GALLERY: { key: PhotoKey; wide?: boolean; caption: string }[] = [
  { key: "wide", wide: true, caption: "Wide shot of the space" },
  { key: "d1", caption: "A detail" },
  { key: "d2", caption: "A detail" },
  { key: "vibe", caption: "People / vibe" },
];
const ALT_LABELS: Record<PhotoKey, string> = {
  wide: "Wide shot · alt text",
  d1: "Detail 1 · alt text",
  d2: "Detail 2 · alt text",
  vibe: "Vibe · alt text",
};

function RadioStack({
  options,
  value,
  onChange,
  label,
}: {
  options: OptionRow[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div className={styles.stack} role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            className={[styles.radioOpt, on && styles.optOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(o.id)}
          >
            <span className={styles.roDot} aria-hidden />
            <span className={styles.radioTxt}>
              <b>{o.label}</b>
              <span>{o.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function StepPhotosYou({
  form,
  userName,
}: {
  form: ListingForm;
  userName: string;
}) {
  const { draft, set, setAlt, toggleIn } = form;
  return (
    <>
      <PaneHeader
        title="Photos, and"
        em="a little about you."
        sub="Pictures help people feel the room before they arrive. And we like to know who's behind the door."
      />

      <FormField
        label="A few photos — optional"
        helper="Landscape works best · aim for ≥1200px wide · under 5MB each · no text-heavy graphics."
      >
        <div className={styles.galGrid}>
          {GALLERY.map((g) => (
            <ImageSlot
              key={g.key}
              className={g.wide ? styles.galWide : undefined}
              tint="coral"
              radius={14}
              height={g.wide ? 150 : 110}
              placeholder={g.caption}
              alt={draft.alt[g.key]}
            />
          ))}
        </div>
        <div className={styles.altList}>
          {GALLERY.map((g) => (
            <div key={g.key} className={styles.altRow}>
              <span className={styles.altK}>{ALT_LABELS[g.key]}</span>
              <input
                type="text"
                maxLength={100}
                placeholder="Describe it for blind & low-vision members"
                value={draft.alt[g.key]}
                onChange={(e) => setAlt(g.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </FormField>

      <h3 className={styles.groupH}>A little about you</h3>

      <FormField id={ANCHOR.rel} label="Your connection to the place" required>
        <RadioStack
          options={REL}
          value={draft.rel}
          onChange={(id) => set({ rel: id as OwnerRel })}
          label="Your connection"
        />
      </FormField>

      <div className={styles.twoCol}>
        <FormField id={ANCHOR.ownerName} label="Your name" required>
          <input
            type="text"
            maxLength={50}
            placeholder="e.g. Sandra Lopes"
            value={draft.ownerName}
            onChange={(e) => set({ ownerName: e.target.value })}
          />
        </FormField>
        <FormField id={ANCHOR.ownerRole} label="Your role" required>
          <input
            type="text"
            maxLength={40}
            placeholder="e.g. Owner & baker"
            value={draft.ownerRole}
            onChange={(e) => set({ ownerRole: e.target.value })}
          />
        </FormField>
      </div>

      <FormField
        label="A line or two about you — optional"
        labelAside={`${draft.ownerBio.length} / 220`}
      >
        <textarea
          maxLength={220}
          placeholder="We took over a 60-year-old pastelaria in 2019 and rebuilt it around one rule: everyone's welcome, exactly as they are."
          value={draft.ownerBio}
          onChange={(e) => set({ ownerBio: e.target.value })}
        />
      </FormField>

      <FormField label="Who can see your name?" required>
        <RadioStack
          options={VIS}
          value={draft.visibility}
          onChange={(id) => set({ visibility: id as OwnerVisibility })}
          label="Name visibility"
        />
      </FormField>

      <FormField label="Link to your member profile? — optional">
        <div className={styles.memToggle}>
          <div className={styles.mtTxt}>
            <b>Show I'm a QueerPulse member</b>
            <span>
              Puts a familiar, verified face on the listing. You're signed in as{" "}
              {userName}.
            </span>
          </div>
          <Toggle
            checked={draft.linkToProfile}
            onChange={(v) => set({ linkToProfile: v })}
            label="Link to member profile"
          />
        </div>
      </FormField>

      <h3 className={styles.groupH}>Staying in the loop</h3>
      <FormField
        id={ANCHOR.contactEmail}
        label="Your contact email"
        required
        helper="For you, the submitter — kept private, never shown on the listing."
      >
        <input
          type="email"
          placeholder="So we can reach you about this listing"
          value={draft.contactEmail}
          onChange={(e) => set({ contactEmail: e.target.value })}
        />
      </FormField>

      <FormField label="Email me when… — optional">
        <div className={styles.stack}>
          {NOTIFY.map((n) => (
            <CheckLine
              key={n.id}
              checked={draft.notify.includes(n.id)}
              onChange={() => toggleIn("notify", n.id)}
              title={n.label}
            />
          ))}
        </div>
      </FormField>

      <div className={styles.consent}>
        <FiShield size={17} aria-hidden />
        <p>
          You're in control of what's public.{" "}
          <b>Contact details you leave blank stay off the listing.</b> Want your
          name kept private? Pick "role only" or "anonymous" above — that's
          completely fine.
        </p>
      </div>
    </>
  );
}
