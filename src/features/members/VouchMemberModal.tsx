import { useEffect, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Spinner } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberProfiles } from "./data/memberProfiles";
import { useMemberProfile } from "./api/useMemberProfile";
import { useVouchMember } from "./api/useVouchMember";
import { type VouchRelationship } from "./vouchMember.data";
import { VouchForm, VouchSuccess } from "./VouchMemberModalParts";
import styles from "./VouchMemberModal.module.css";

/**
 * Publicly co-sign an existing member. One or more "how you know them"
 * relationships + optional skill endorsements + note, running loading →
 * animated plum-panel success. At least one relationship is required. On
 * success it calls `onVouched` so the member's "Vouched for by…" row gains the
 * current user's face. Self-contained: owns its form state and locks scroll
 * while mounted (it's only rendered when open).
 */
export function VouchMemberModal({
  slug,
  onClose,
  onVouched,
}: {
  slug: string;
  onClose: () => void;
  /** Called once, when the vouch is confirmed (success state reached). */
  onVouched: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [relationships, setRelationships] = useState<VouchRelationship[]>([]);
  const [endorsed, setEndorsed] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [status, setStatus] = useState<"form" | "done">("form");
  const vouch = useVouchMember();
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !vouch.isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, vouch.isPending]);

  // Source the member from the same hook the profile page uses, so live mode can
  // vouch for a fetched member (e.g. the house account) that isn't present in the
  // static demo registry. The `?? memberProfiles[slug]` fallback is DEMO-ONLY and
  // covers the first render before the (demo) query resolves — in live mode we
  // never substitute a mock persona for a real member the fetch hasn't yielded.
  // Mirrors ConnectModal's resolution.
  const { data: profileResult, isLoading: profileLoading } =
    useMemberProfile(slug);
  const profile =
    profileResult?.member ??
    (demoMode && slug ? memberProfiles[slug] : undefined) ??
    null;
  // In live mode the fetch is async; only gate the initial render while there's
  // no profile yet, so a member already in the registry shows the form instantly.
  const memberLoading = Boolean(slug) && profileLoading && !profileResult;
  if (!profile && !memberLoading) return null;

  const first = profile?.first ?? "";

  const toggleTag = (tag: string) =>
    setEndorsed((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const toggleRelationship = (value: VouchRelationship) =>
    setRelationships((prev) =>
      prev.includes(value)
        ? prev.filter((r) => r !== value)
        : [...prev, value],
    );

  const submit = () => {
    // At least one "how you know them" is required, and the note is optional.
    // Guard the empty selection as well as a double-submit while in flight.
    if (vouch.isPending || relationships.length === 0) return;
    vouch.mutate(
      { slug, relationships, note: note.trim(), anonymous },
      {
        onSuccess: () => {
          onVouched();
          setStatus("done");
        },
      },
    );
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !vouch.isPending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("members:vouch.modal.ariaLabel", { first })}
        className={`${styles.modal} ${status === "done" ? styles.modalDone : ""}`}
      >
        {!vouch.isPending && (
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t("members:vouch.modal.close")}
          >
            ×
          </button>
        )}

        <div className={styles.scroll}>
          {memberLoading || !profile ? (
            <div className={styles.loading}>
              <Spinner />
              <span>{t("members:profile.loading")}</span>
            </div>
          ) : status === "done" ? (
            <VouchSuccess profile={profile} first={first} onClose={onClose} />
          ) : (
            <VouchForm
              profile={profile}
              first={first}
              relationships={relationships}
              toggleRelationship={toggleRelationship}
              endorsed={endorsed}
              toggleTag={toggleTag}
              note={note}
              setNote={setNote}
              anonymous={anonymous}
              setAnonymous={setAnonymous}
              isPending={vouch.isPending}
              isError={vouch.isError}
              onClose={onClose}
              onSubmit={submit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
