import { useEffect, useState } from "react";
import { Spinner } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberProfiles } from "./data/memberProfiles";
import { useMemberProfile } from "./api/useMemberProfile";
import { RELATIONSHIPS } from "./vouchMember.data";
import { VouchForm, VouchSuccess } from "./VouchMemberModalParts";
import styles from "./VouchMemberModal.module.css";

/**
 * Publicly co-sign an existing member. A short relationship + optional skill
 * endorsements + note, running loading → animated plum-panel success. On
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
  const [relationship, setRelationship] = useState<string>(RELATIONSHIPS[0]);
  const [endorsed, setEndorsed] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "done">("form");
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "loading") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, status]);

  // Source the member from the same hook the profile page uses, so live mode can
  // vouch for a fetched member (e.g. the house account) that isn't present in the
  // static demo registry. The `?? memberProfiles[slug]` fallback covers the first
  // render before the (demo) query resolves. Mirrors ConnectModal's resolution.
  const { data: profileResult, isLoading: profileLoading } =
    useMemberProfile(slug);
  const profile =
    profileResult?.member ?? (slug ? memberProfiles[slug] : undefined) ?? null;
  // In live mode the fetch is async; only gate the initial render while there's
  // no profile yet, so a member already in the registry shows the form instantly.
  const memberLoading = Boolean(slug) && profileLoading && !profileResult;
  if (!profile && !memberLoading) return null;

  const first = profile?.first ?? "";
  const canSubmit = note.trim().length >= 12;

  const toggleTag = (tag: string) =>
    setEndorsed((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const submit = () => {
    if (!canSubmit || status !== "form") return;
    setStatus("loading");
    window.setTimeout(() => {
      onVouched();
      setStatus("done");
    }, 1100);
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== "loading") onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("members:vouch.modal.ariaLabel", { first })}
        className={`${styles.modal} ${status === "done" ? styles.modalDone : ""}`}
      >
        {status !== "loading" && (
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
              relationship={relationship}
              setRelationship={setRelationship}
              endorsed={endorsed}
              toggleTag={toggleTag}
              note={note}
              setNote={setNote}
              canSubmit={canSubmit}
              status={status}
              onClose={onClose}
              onSubmit={submit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
