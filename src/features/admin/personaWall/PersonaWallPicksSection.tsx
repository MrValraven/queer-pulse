import { useId, useMemo, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  PersonaWallAdminDTO,
  PersonaWallPickDTO,
} from "../../subprofiles/api/personaWall.api";
import { focusNeighbourControl } from "../useStudioAdminReorderRow";
import { desktopOnlyPickIds } from "./personaWallAdmin.model";
import { PersonaWallHead } from "./PersonaWallHead";
import { PersonaWallPickRow } from "./PersonaWallPickRow";
import { usePersonaWallPickActions } from "./usePersonaWallPickActions";
import css from "./PersonaWallPicks.module.css";

/**
 * The picks on the wall curation page (Admin only): the head with its count
 * and Add persona, an empty line while nothing is picked, and the picks in
 * wall order. Each row moves with Move up, Move down or a drag, and leaves
 * with Remove from wall. The page owns the Add persona dialog; `onAdd`
 * opens it.
 */
export function PersonaWallPicksSection({
  wall,
  onAdd,
}: {
  wall: PersonaWallAdminDTO;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const { picks } = wall;
  const { isBusy, statusMessage, move, remove } =
    usePersonaWallPickActions(picks);
  const desktopOnlyIds = useMemo(() => desktopOnlyPickIds(picks), [picks]);

  function removeAt(pick: PersonaWallPickDTO, index: number) {
    remove(pick, () =>
      focusNeighbourControl({
        list: listRef.current,
        index,
        findControl: (row) =>
          row.querySelector<HTMLElement>("[data-pick-remove]"),
        fallback: headingRef.current,
      }),
    );
  }

  return (
    <section className={css.section} aria-labelledby={headingId}>
      <PersonaWallHead
        headingId={headingId}
        headingRef={headingRef}
        count={picks.length}
        isBusy={isBusy}
        onAdd={onAdd}
      />
      <Collapse isOpen={picks.length === 0}>
        <p className={css.empty}>
          <span className={css.emptyLead}>
            {t("admin:personaWall.empty.title")}
          </span>
          <span>{t("admin:personaWall.empty.body")}</span>
        </p>
      </Collapse>
      <ol
        ref={listRef}
        className={css.list}
        aria-labelledby={headingId}
        aria-hidden={picks.length === 0 || undefined}
      >
        <AnimatePresence initial={false}>
          {picks.map((pick, index) => (
            <PersonaWallPickRow
              key={pick.id}
              pick={pick}
              index={index}
              count={picks.length}
              isBusy={isBusy}
              isDesktopOnly={desktopOnlyIds.has(pick.id)}
              onMove={(targetIndex) => move(pick, targetIndex)}
              onDropAt={(draggedId) => {
                const dragged = picks.find(
                  (candidate) => candidate.id === draggedId,
                );
                if (dragged) move(dragged, index);
              }}
              onRemove={() => removeAt(pick, index)}
            />
          ))}
        </AnimatePresence>
      </ol>
      <p className="visuallyHidden" role="status">
        {statusMessage}
      </p>
    </section>
  );
}
