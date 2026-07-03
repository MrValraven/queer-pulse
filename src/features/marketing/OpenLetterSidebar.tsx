import { useState, type FormEvent } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import {
  CURRENT_MEMBER,
  VISIBILITY_OPTIONS,
  type Signature,
} from "./openLetter.data";
import s from "./OpenLetterPage.module.css";

const tintClass: Record<Signature["tint"], string | undefined> = {
  accent: s.tintAccent,
  jade: s.tintJade,
  plum: s.tintPlum,
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface SidebarProps {
  signatures: Signature[];
  signed: boolean;
  onSign: (entry: Signature) => void;
}

export function OpenLetterSidebar({
  signatures,
  signed,
  onSign,
}: SidebarProps) {
  return (
    <aside className={s.side}>
      <SignCard signed={signed} onSign={onSign} />
      <div className={s.card}>
        <div className={s.listCard}>
          <h4>Recent signatures</h4>
          {signatures.map((sig, i) => (
            <div className={s.sigRow} key={`${sig.name}-${i}`}>
              <div className={`${s.sigAv} ${tintClass[sig.tint]}`}>
                {sig.av}
              </div>
              <div className={s.sigText}>
                <b>{sig.name}</b>
                <em>{sig.note ? `"${sig.note}"` : "—"}</em>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={s.status}>
        <b>Why we run open letters this way:</b> every signature has a verified
        member name behind it. <em>That makes them harder to dismiss.</em> We
        won't do anonymous-mass petitions — the model is fewer, real, named
        signatures.
      </div>
    </aside>
  );
}

function SignCard({ signed, onSign }: Pick<SidebarProps, "signed" | "onSign">) {
  const [name, setName] = useState(CURRENT_MEMBER.name);
  const [visibility, setVisibility] = useState("full");
  const [note, setNote] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (signed) return;
    const trimmed = name.trim() || CURRENT_MEMBER.name;
    const shown =
      visibility === "anon"
        ? "A member"
        : visibility === "initials"
          ? `${initials(trimmed)}.`
          : trimmed;
    onSign({
      av: initials(trimmed),
      tint: "jade",
      name: shown,
      note: note.trim() || undefined,
    });
  };

  return (
    <form className={s.card} id="sign" onSubmit={submit}>
      <div className={s.signHead}>
        <h4>Sign the open letter</h4>
        <div className={s.as}>
          As {CURRENT_MEMBER.name} · {CURRENT_MEMBER.pronouns}
        </div>
      </div>
      <div className={s.signBody}>
        <div className={s.field}>
          <label htmlFor="ol-name">Display name on the list</label>
          <input
            id="ol-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={signed}
          />
        </div>
        <div className={s.field}>
          <label htmlFor="ol-vis">Show as · visibility</label>
          <select
            id="ol-vis"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            disabled={signed}
          >
            {VISIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className={s.field}>
          <label htmlFor="ol-note">
            Add a sentence (optional)
            <span className={s.fieldAside}>{note.length}/280</span>
          </label>
          <textarea
            id="ol-note"
            placeholder="Why this matters to you · 280 chars"
            maxLength={280}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={signed}
          />
        </div>
        <div className={s.signActions}>
          <Button
            type="submit"
            variant={signed ? "jade" : "primary"}
            disabled={signed}
          >
            {signed ? (
              <>
                <FiCheck aria-hidden /> You signed the letter
              </>
            ) : (
              "Sign the letter"
            )}
          </Button>
        </div>
        <p className={s.signFoot}>
          Members only. We never share your data with the recipient
          organisation. You can withdraw your signature any time.
        </p>
      </div>
    </form>
  );
}
