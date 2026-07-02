import { useEffect } from "react";
import { FiCheck, FiGift } from "react-icons/fi";
import {
  ACCESS_OPTIONS,
  FEATURE_OPTIONS,
  slugify,
  typeLabelFor,
} from "./startCommunity.data";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

function Recap({
  title,
  step,
  onEdit,
  rows,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  rows: { k: string; v: React.ReactNode; missing?: boolean }[];
}) {
  return (
    <div className={styles.recapGroup}>
      <div className={styles.recapH}>
        {title}
        <button
          type="button"
          className={styles.recapEdit}
          onClick={() => onEdit(step)}
        >
          Edit
        </button>
      </div>
      {rows.map((r) => (
        <div key={r.k} className={styles.recapRow}>
          <span className={styles.rk}>{r.k}</span>
          <span className={`${styles.rv} ${r.missing ? styles.rvMiss : ""}`}>
            {r.v}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Chapter 8 — Confirm: handle, recap, and the consent to open. */
export function StepConfirm({
  form,
  onEdit,
}: {
  form: CommunityForm;
  onEdit: (step: number) => void;
}) {
  const { draft, set } = form;

  // Pre-fill the handle from the name the first time they reach this step.
  useEffect(() => {
    if (!draft.handle.trim() && draft.name.trim()) {
      set({ handle: slugify(draft.name) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const access = ACCESS_OPTIONS.find((a) => a.tier === draft.accessTier);
  const featureLabels = FEATURE_OPTIONS.filter((f) =>
    draft.features.includes(f.id),
  ).map((f) => f.label);
  const invitedCount = draft.invites.length;

  return (
    <div>
      <p className={styles.confirmLead}>
        Here's the whole space, in one glance. Nothing here is fixed — you can
        change all of it once you're inside.
      </p>

      <div className={styles.handleBox}>
        <label htmlFor="sc-handle">Your community's address</label>
        <div className={styles.handleWrap}>
          <span className={styles.handlePre}>queerpulse.app/community/</span>
          <input
            id="sc-handle"
            className={styles.handleInput}
            value={draft.handle}
            onChange={(e) => set({ handle: slugify(e.target.value) })}
          />
        </div>
      </div>

      <Recap
        title="Why"
        step={1}
        onEdit={onEdit}
        rows={[
          {
            k: "Name",
            v: draft.name || "Not set yet",
            missing: !draft.name,
          },
          {
            k: "For",
            v: draft.purpose || "Not set yet",
            missing: !draft.purpose,
          },
          { k: "Kind", v: typeLabelFor(draft.type) },
        ]}
      />
      <Recap
        title="Who"
        step={2}
        onEdit={onEdit}
        rows={[
          {
            k: "Gathering",
            v: draft.whoFor || "Not set yet",
            missing: !draft.whoFor,
          },
        ]}
      />
      <Recap
        title="Safety"
        step={3}
        onEdit={onEdit}
        rows={[
          {
            k: "Access",
            v: access?.name ?? "Not chosen yet",
            missing: !access,
          },
          {
            k: "Roster",
            v: draft.rosterVisible ? "Visible to members" : "Hidden",
          },
        ]}
      />
      <Recap
        title="Running"
        step={4}
        onEdit={onEdit}
        rows={[
          {
            k: "Stewards",
            v: `${draft.stewards.length} (you + ${draft.stewards.length - 1} co)`,
          },
          { k: "Inside", v: featureLabels.join(", ") },
        ]}
      />
      <Recap
        title="Tone & feeling"
        step={5}
        onEdit={onEdit}
        rows={[
          { k: "Shared values", v: `${draft.rules.length} agreed` },
          {
            k: "Tagline",
            v: draft.tagline || "Not set yet",
            missing: !draft.tagline,
          },
        ]}
      />
      {invitedCount > 0 && (
        <Recap
          title="First people"
          step={7}
          onEdit={onEdit}
          rows={[{ k: "Inviting", v: `${invitedCount} on day one` }]}
        />
      )}

      <div className={styles.costNote}>
        <FiGift size={18} aria-hidden />
        <p>
          <b>Founding a community is free, and always will be.</b> QueerPulse
          never charges to gather your people.
        </p>
      </div>

      <button
        type="button"
        className={[styles.consentCheck, draft.consent && styles.consentOn]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={draft.consent}
        onClick={() => set({ consent: !draft.consent })}
      >
        <span className={styles.ccBox}>
          <FiCheck size={12} aria-hidden />
        </span>
        <span className={styles.ccTxt}>
          <b>I'll steward this space with care.</b> I understand I'm responsible
          for keeping it safe and welcoming, and that QueerPulse's community
          guidelines apply here too.
        </span>
      </button>
    </div>
  );
}
