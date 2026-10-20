import type { RefObject } from "react";
import { Collapse } from "../../../shared/components/ui";
import { LazyStudioShareCard } from "./LazyStudioShareCard";
import { findStudioLink } from "./studioLinkTarget";
import { draftWithoutStudioLink } from "./studioPostText";
import styles from "./StudioComposerPreview.module.css";

/**
 * The card a composer shows as soon as its text holds a Studio link, folding
 * in and out through the shared Collapse. Its remove control (the card's own
 * X) takes the link out of the draft, which folds the preview away. A draft
 * that already holds a link when the composer opens (an edit) shows it
 * without growing in. `isRemovable` false leaves the X off the card, for a
 * composer that already has its own control for taking the link out.
 */
export function StudioComposerPreview({
  text,
  onTextChange,
  fieldRef,
  isRemovable = true,
}: {
  text: string;
  /** Receives the draft with the link taken out when the card's X is
   *  pressed. Unused when `isRemovable` is false. */
  onTextChange?: (next: string) => void;
  /** The composer's text field. Focus returns to it after a remove, since
   *  the X goes inert with the panel folding away. */
  fieldRef?: RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
  /** False leaves the card's own X off. Defaults to true. */
  isRemovable?: boolean;
}) {
  const match = findStudioLink(text);
  const removeLink = isRemovable ? onTextChange : undefined;
  return (
    <Collapse isOpen={match !== null}>
      {match && (
        <div className={styles.root}>
          <LazyStudioShareCard
            // A new link swaps the card; a changed `&t=` keeps it mounted.
            key={`${match.target.kind}:${match.target.id}`}
            target={match.target}
            surface="composer"
            onRemove={
              removeLink
                ? () => {
                    removeLink(draftWithoutStudioLink(text, match));
                    fieldRef?.current?.focus();
                  }
                : undefined
            }
          />
        </div>
      )}
    </Collapse>
  );
}
