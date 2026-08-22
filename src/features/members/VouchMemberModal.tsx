import { useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Spinner, useDismiss } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberProfiles } from "./data/memberProfiles";
import { useMemberProfile } from "./api/useMemberProfile";
import { useVouchMember } from "./api/useVouchMember";
import { type VouchRelationship } from "./vouchMember.data";
import { VouchForm, VouchSuccess } from "./VouchMemberModalParts";
import styles from "./VouchMemberModal.module.css";

/**
 * Publicly co-sign an existing member. One or more "how you know them"
 * relationships + an optional note, running loading → animated plum-panel
 * success. At least one relationship is required. On success it calls
 * `onVouched` so the member's "Vouched for by…" row gains the current user's
 * face. Self-contained: owns its form state, and `useDismiss` gives it the
 * shared modal a11y contract (scroll lock, initial focus, Tab trap, Escape,
 * focus restore) since it's only rendered while open.
 *
 * There is deliberately no skill-endorsement picker here. One used to render a
 * chip row bound to local state that `POST /members/:slug/vouch` has no field
 * for, so every selection was silently dropped while the success panel claimed
 * the vouch had recorded it. Re-add the chips only together with a backend
 * endorsement field on `VouchMemberInput` / `vouchFor`.
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
  const [note, setNote] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [status, setStatus] = useState<"form" | "done">("form");
  const vouch = useVouchMember();
  // Escape stays blocked while the POST is in flight, exactly as the
  // hand-rolled listener this replaces did; everything else (scroll lock,
  // initial focus, Tab trap, focus restore) comes from the shared hook.
  const dialogRef = useDismiss(() => {
    if (!vouch.isPending) onClose();
  });

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
      {
        slug,
        relationships,
        note: note.trim(),
        anonymous,
        // Display-only, so the owner's "You vouched for" list gains this
        // person straight away instead of waiting out the session-long
        // `staleTime: Infinity` on `useGivenVouches`.
        ...(profile
          ? {
              member: {
                firstName: profile.first,
                lastName: profile.last,
                avatarUrl: profile.photo,
              },
            }
          : {}),
      },
      {
        onSuccess: () => {
          onVouched();
          setStatus("done");
        },
      },
    );
  };

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !vouch.isPending) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
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
            <FiX aria-hidden />
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
    </div>,
    document.body,
  );
}
