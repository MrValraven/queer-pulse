import { useEffect, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CreatorDraftNotice.module.css";
import { creatorDraftSaveStatusText } from "./creatorDraftSaveStatusText";
import type { CreatorDraftSaveStatus } from "./api/useCreatorDraftAutosave";

const CLOCK_REFRESH_MS = 30_000;

/** The save state as a polite live region; re-reads the clock while saved. */
export function CreatorDraftSaveLine({
  status,
  className,
}: {
  status: CreatorDraftSaveStatus;
  className?: string;
}) {
  const { t } = useTranslation();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const isSaved = status.kind === "saved";
  const savedAt = status.kind === "saved" ? status.savedAt : null;
  const [seenSavedAt, setSeenSavedAt] = useState(savedAt);
  if (savedAt !== seenSavedAt) {
    // A fresh save restarts the clock at its own save time in the same render
    // pass, so its age starts at zero and never from the last interval tick.
    setSeenSavedAt(savedAt);
    if (savedAt !== null) setNowMs(Date.parse(savedAt));
  }

  useEffect(() => {
    if (!isSaved) return undefined;
    const intervalId = window.setInterval(
      () => setNowMs(Date.now()),
      CLOCK_REFRESH_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [isSaved, status]);

  const text = creatorDraftSaveStatusText(status, nowMs, t);
  return (
    <p
      role="status"
      className={
        className ? `${styles.saveLine} ${className}` : styles.saveLine
      }
    >
      {text}
    </p>
  );
}
