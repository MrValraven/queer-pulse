import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiCheck, FiPlus } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { getEndorsers } from "./api/subprofiles.api";
import { mockEndorsersById } from "./data/subprofiles.data";
import { useEndorsement } from "./api/useEndorsement";
import styles from "./SubprofileEndorse.module.css";

const MAX_CLUSTER_FACES = 5;

/** Up to two initials from a display name, for the avatar fallback. */
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * The persona's endorse control: a one-tap Endorse/Endorsed toggle, the live
 * count, and a small avatar cluster of endorsers (lazily fetched on mount).
 * Endorsing offers an optional one-line note through an inline reveal — the
 * tap itself never requires one. Owners can't endorse their own persona
 * (`isOwnerViewing`), and a logged-out visitor can't either, so both see the
 * read-only count + cluster instead of the button.
 */
export function SubprofileEndorse({
  subprofileId,
  endorsementCount,
  viewerEndorsed,
  isOwnerViewing,
}: {
  subprofileId: string;
  endorsementCount: number;
  viewerEndorsed: boolean;
  isOwnerViewing: boolean;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const { showToast } = useToast();
  const { endorse, withdraw } = useEndorsement(subprofileId);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const { data: endorsersResult } = useQuery({
    queryKey: ["subprofile", "endorsers", subprofileId],
    queryFn: () =>
      demoMode
        ? (mockEndorsersById(subprofileId) ?? { count: 0, endorsers: [] })
        : getEndorsers(subprofileId),
    enabled: Boolean(subprofileId),
  });
  const endorsers = endorsersResult?.endorsers ?? [];

  const canEndorse = !isOwnerViewing && (demoMode || loggedIn);
  const pending = endorse.isPending || withdraw.isPending;

  async function toggle() {
    if (pending) return;
    try {
      if (viewerEndorsed) {
        await withdraw.mutateAsync({
          currentEndorsementCount: endorsementCount,
        });
      } else {
        await endorse.mutateAsync({
          note: note.trim() || undefined,
          currentEndorsementCount: endorsementCount,
        });
        setNote("");
        setNoteOpen(false);
      }
    } catch {
      showToast(t("subprofiles:hero.endorse.error"), "error");
    }
  }

  function submitNote(event: FormEvent) {
    event.preventDefault();
    void toggle();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.controlRow}>
        {canEndorse && (
          <Button
            variant={viewerEndorsed ? "jade" : "ghost"}
            size="md"
            aria-pressed={viewerEndorsed}
            onClick={() => void toggle()}
            disabled={pending}
          >
            {viewerEndorsed ? (
              <>
                <FiCheck aria-hidden />
                {t("subprofiles:hero.endorse.endorsed")}
              </>
            ) : (
              t("subprofiles:hero.endorse.cta")
            )}
          </Button>
        )}

        {canEndorse && !viewerEndorsed && (
          <button
            type="button"
            className={styles.noteToggle}
            aria-expanded={noteOpen}
            onClick={() => setNoteOpen((open) => !open)}
          >
            <FiPlus aria-hidden />
            {t("subprofiles:hero.endorse.addNote")}
          </button>
        )}

        <span className={styles.count}>
          {t("subprofiles:hero.endorse.count", { count: endorsementCount })}
        </span>

        {endorsers.length > 0 && (
          <div className={styles.cluster}>
            {endorsers.slice(0, MAX_CLUSTER_FACES).map((endorser) => (
              <Avatar
                key={endorser.slug}
                initials={initialsFrom(endorser.name)}
                src={endorser.avatarUrl ?? undefined}
                alt={endorser.name}
                title={endorser.name}
                tint="plum"
                size={28}
                className={styles.clusterFace}
              />
            ))}
            <span className="visuallyHidden">
              {t("subprofiles:hero.endorse.endorsedByNames", {
                names: endorsers.map((endorser) => endorser.name).join(", "),
              })}
            </span>
          </div>
        )}
      </div>

      {canEndorse && !viewerEndorsed && noteOpen && (
        <form className={styles.noteForm} onSubmit={submitNote}>
          <label
            className="visuallyHidden"
            htmlFor={`endorse-note-${subprofileId}`}
          >
            {t("subprofiles:hero.endorse.notePlaceholder")}
          </label>
          <input
            id={`endorse-note-${subprofileId}`}
            className={styles.noteInput}
            type="text"
            maxLength={200}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("subprofiles:hero.endorse.notePlaceholder")}
          />
          <Button variant="primary" size="md" type="submit" disabled={pending}>
            {t("subprofiles:hero.endorse.send")}
          </Button>
        </form>
      )}
    </div>
  );
}
