import { useState } from "react";
import { Collapse } from "../../../../shared/components/ui";
import styles from "./ListingTeam.module.css";

interface ListingTeamRowErrorProps {
  /** The refusal to show; null or empty folds the line away. */
  errorMessage?: string | null;
}

/** A row's refusal, folded in and out; the last message stays while it folds. */
export function ListingTeamRowError({
  errorMessage,
}: ListingTeamRowErrorProps) {
  const [shownMessage, setShownMessage] = useState(errorMessage ?? "");
  if (errorMessage && errorMessage !== shownMessage) {
    setShownMessage(errorMessage);
  }
  return (
    <Collapse isOpen={Boolean(errorMessage)} className={styles.rowError}>
      <p className={styles.rowErrorText} role="alert">
        {errorMessage || shownMessage}
      </p>
    </Collapse>
  );
}
