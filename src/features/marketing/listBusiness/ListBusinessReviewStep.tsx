import { type ReactNode } from "react";
import { FiShield } from "react-icons/fi";
import { CheckLine } from "../../../shared/components/ui";
import {
  DAYS,
  PRICES,
  slugify,
  VERIFY,
  type ListingDraft,
} from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import styles from "./ListBusinessPage.module.css";

function label(list: { id: string; label: string }[], id: string): string {
  return list.find((x) => x.id === id)?.label ?? id;
}

function hoursSummary(draft: ListingDraft): string {
  const open = DAYS.filter((d) => draft.hours[d.id]?.open);
  if (!open.length) return "";
  return open.map((d) => d.id).join(", ");
}

function onlineSummary(draft: ListingDraft): string {
  const bits: string[] = [];
  if (draft.social.instagram) bits.push("Instagram");
  if (draft.social.website) bits.push("Website");
  if (draft.social.email) bits.push("Email");
  if (draft.social.phone) bits.push("Phone");
  return bits.join(" · ");
}

function Row({
  k,
  children,
  quote,
}: {
  k: string;
  children: ReactNode;
  quote?: boolean;
}) {
  const empty = children === "" || children === null || children === undefined;
  return (
    <div className={styles.recapRow}>
      <span className={styles.rk}>{k}</span>
      <span
        className={[styles.rv, quote && styles.rvQuote]
          .filter(Boolean)
          .join(" ")}
      >
        {empty ? <span className={styles.rvMiss}>Not added</span> : children}
      </span>
    </div>
  );
}

function Group({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className={styles.recapGroup}>
      <div className={styles.recapHead}>
        <span>{title}</span>
        <button type="button" className={styles.recapEdit} onClick={onEdit}>
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

export function StepReview({
  form,
  userName,
  userInitials,
  onEdit,
}: {
  form: ListingForm;
  userName: string;
  userInitials: string;
  onEdit: (step: number) => void;
}) {
  const { draft, set } = form;
  return (
    <>
      <PaneHeader
        title="One last look"
        em="before it goes to the team."
        sub="Here's everything you've told us. Edit any part by jumping back — nothing's locked until you send."
      />

      <div className={styles.slugBox}>
        <div className={styles.sbK}>Your listing will live at</div>
        <div className={styles.sbUrl}>
          queerpulse.app/directory/<b>{slugify(draft.name)}</b>
        </div>
      </div>

      <Group title="You & the place" onEdit={() => onEdit(0)}>
        <Row k="Listing as">
          {draft.path === "claim"
            ? "I run this place"
            : draft.path === "suggest"
              ? "Suggesting a place I love"
              : ""}
        </Row>
        {draft.path === "claim" && (
          <Row k="Verification">{label(VERIFY, draft.verify)}</Row>
        )}
      </Group>

      <Group title="Basics" onEdit={() => onEdit(1)}>
        <Row k="Name">{draft.name}</Row>
        <Row k="Category">{draft.cats.join(", ")}</Row>
        <Row k="Neighbourhood">{draft.hood}</Row>
        <Row k="Ownership">
          {draft.badge === "owned"
            ? "Queer-owned"
            : draft.badge === "friendly"
              ? "LGBTQ+ friendly"
              : ""}
        </Row>
        <Row k="Price">{draft.price ? label(PRICES, draft.price) : ""}</Row>
        <Row k="One-liner">{draft.blurb}</Row>
      </Group>

      <Group title="Story" onEdit={() => onEdit(2)}>
        <Row k="Tagline" quote>
          {draft.tagline}
        </Row>
        <Row k="What it is">
          {draft.whatItIs
            .map((w) => w.text.trim())
            .filter(Boolean)
            .join(" · ")}
        </Row>
        <Row k="Tags">{draft.tags.join(", ")}</Row>
        <Row k="Good for">{draft.goodFor.join(", ")}</Row>
        <Row k="Languages">{draft.langs.join(", ")}</Row>
      </Group>

      <Group title="Practical" onEdit={() => onEdit(3)}>
        <Row k="Address">{draft.address}</Row>
        <Row k="Hours">{hoursSummary(draft)}</Row>
        <Row k="Online">{onlineSummary(draft)}</Row>
      </Group>

      <Group title="Photos & you" onEdit={() => onEdit(4)}>
        <Row k="You">
          {draft.ownerName}
          {draft.ownerRole ? ` · ${draft.ownerRole}` : ""}
        </Row>
        <Row k="Name shown">
          {draft.visibility === "public"
            ? "My name and role"
            : draft.visibility === "role"
              ? "My role only"
              : "Anonymous"}
        </Row>
      </Group>

      {draft.linkToProfile && (
        <div className={styles.vouchLine}>
          <span className={styles.vlAv}>{userInitials}</span>
          <p>
            <b>Vouched by you, {userName}.</b> Your name rides along so the team
            knows a trusted member stands behind this. Members can add their
            vouch once it's live.
          </p>
        </div>
      )}

      <h3 className={styles.groupH}>Before you send</h3>
      <div className={styles.consentChecks}>
        <div className={styles.flagOuting}>
          <CheckLine
            checked={draft.consentOuting}
            onChange={(v) => set({ consentOuting: v })}
            title="I understand this listing will be public and searchable."
            sub="Listing a place as queer-owned, with a name attached, is a public disclosure. I've chosen what's visible above and I'm okay with it being out in the world."
          />
        </div>
        <CheckLine
          checked={draft.consentGuide}
          onChange={(v) => set({ consentGuide: v })}
          title="Everything here is accurate to the best of my knowledge."
          sub="I've read the community guidelines and how my data is used."
        />
      </div>

      <div className={styles.submitNote}>
        <span className={styles.ic}>
          <FiShield size={15} />
        </span>
        <p>
          <b>A human reviews every listing.</b> This keeps the directory
          community-verified — nothing auto-publishes. We'll read it within a
          few days and email you when it's live (or if we have a question). You
          can edit or withdraw it any time before then.
        </p>
      </div>
    </>
  );
}
