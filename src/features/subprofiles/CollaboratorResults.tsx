import type { KeyboardEvent, Ref } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { initialsOf, tintForSlug } from "../../shared/api/refs";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ConnectionView } from "../connect/connections.data";
import type { ConnectionCandidates } from "../connect/useConnectionCandidates";
import type { CollaboratorDTO } from "./api/subprofiles.api";
import styles from "./CollaboratorPicker.module.css";

/** First+rest initials from a display name (a saved credit carries a name,
 *  not the first/last split `initialsOf` wants). */
function initialsFromName(name: string): string {
  const [first = "", ...rest] = name.trim().split(/\s+/);
  return initialsOf(first, rest.join(" "));
}

/**
 * What the open search shows. A failed load comes first (an outage must not
 * read as an empty network), then the loading line, then the matches or the
 * empty state that fits: no connections at all points the way to Connections,
 * since that is the only way to make someone creditable.
 */
export function CollaboratorResults({
  resultsId,
  listRef,
  candidates,
  onPick,
  onOptionKeyDown,
}: {
  resultsId: string;
  listRef: Ref<HTMLUListElement>;
  candidates: ConnectionCandidates;
  onPick: (person: ConnectionView) => void;
  onOptionKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => void;
}) {
  const { t } = useTranslation();
  const { matches, isAwaitingMatches, hasConnections, isError, refetch } =
    candidates;

  if (isError) {
    return (
      <div id={resultsId} className={styles.resultsNote}>
        <p role="status">
          {t("subprofiles:itemEditor.collaboratorsLoadError")}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={refetch}>
          {t("shared:loadError.retryCta")}
        </Button>
      </div>
    );
  }
  if (!hasConnections) {
    return (
      <div id={resultsId} className={styles.resultsNote}>
        <p role="status">
          {t("subprofiles:itemEditor.collaboratorsNoConnections")}
        </p>
        <Button variant="ghost" size="sm" to={routes.connections}>
          {t("subprofiles:itemEditor.collaboratorsFindPeople")}
        </Button>
      </div>
    );
  }
  if (isAwaitingMatches || matches.length === 0) {
    return (
      <p id={resultsId} role="status" className={styles.resultsEmpty}>
        {t(
          isAwaitingMatches
            ? "subprofiles:itemEditor.collaboratorsLoading"
            : "subprofiles:itemEditor.collaboratorsEmpty",
        )}
      </p>
    );
  }
  return (
    <ul
      ref={listRef}
      id={resultsId}
      className={styles.results}
      aria-label={t("subprofiles:itemEditor.collaboratorsResultsLabel")}
    >
      {matches.map((person, index) => (
        <li key={person.slug}>
          <button
            type="button"
            className={styles.option}
            aria-label={t("subprofiles:itemEditor.collaboratorsAdd", {
              name: person.name,
            })}
            onClick={() => onPick(person)}
            onKeyDown={(event) => onOptionKeyDown(event, index)}
          >
            <Avatar
              initials={person.initials}
              tint={person.tint}
              src={person.photo}
              size={32}
            />
            <span className={styles.optionText}>
              <span className={styles.optionName}>{person.name}</span>
              {(person.pron ?? person.role) && (
                <span className={styles.optionMeta}>
                  {person.pron ?? person.role}
                </span>
              )}
            </span>
            <FiPlus className={styles.optionAdd} aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** The people already credited, each removable. Drawn from the saved credit
 *  itself, so someone you've since disconnected from still shows — and can
 *  still be taken off — even though the search no longer offers them. */
export function CollaboratorPills({
  collaborators,
  onRemove,
}: {
  collaborators: CollaboratorDTO[];
  onRemove: (handle: string) => void;
}) {
  const { t } = useTranslation();
  if (collaborators.length === 0) return null;
  return (
    <ul
      className={styles.pills}
      aria-label={t("subprofiles:itemEditor.collaboratorsPickedLabel")}
    >
      {collaborators.map((collaborator) => {
        const name = collaborator.name || collaborator.handle;
        return (
          <li key={collaborator.handle} className={styles.pill}>
            <Avatar
              initials={initialsFromName(name)}
              tint={tintForSlug(collaborator.slug ?? collaborator.handle)}
              src={collaborator.avatarUrl ?? undefined}
              size={24}
            />
            <span className={styles.pillName}>{name}</span>
            <button
              type="button"
              className={styles.pillRemove}
              aria-label={t("subprofiles:itemEditor.collaboratorsRemove", {
                name,
              })}
              onClick={() => onRemove(collaborator.handle)}
            >
              <FiX aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
