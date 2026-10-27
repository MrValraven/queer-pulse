import { useId, useState } from "react";
import { m, useIsPresent } from "motion/react";
import { Link } from "react-router-dom";
import { FiCheck, FiCircle } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioDashboardReleaseView,
  StudioReleaseHealthItemView,
} from "./api/studioDashboard.adapters";
import {
  RELEASE_HEALTH_DONE_KEY,
  RELEASE_HEALTH_TODO_KEY,
  releaseHealthFixHref,
} from "./studioReleaseHealth";
import { STUDIO_DISCLOSURE, STUDIO_DISCLOSURE_EXIT } from "./studioMotion";
import css from "./StudioReleaseHealth.module.css";

function StudioReleaseHealthItem({
  releaseId,
  item,
}: {
  releaseId: string;
  item: StudioReleaseHealthItemView;
}) {
  const { t } = useTranslation();
  return (
    <li className={css.item}>
      {item.isDone ? (
        <span className={css.itemDone}>
          <FiCheck className={css.doneIcon} aria-hidden="true" fill="none" />
          {t(RELEASE_HEALTH_DONE_KEY[item.key])}
        </span>
      ) : (
        <Link
          className={css.itemLink}
          to={releaseHealthFixHref(releaseId, item.key)}
        >
          <FiCircle className={css.openIcon} aria-hidden="true" fill="none" />
          {t(RELEASE_HEALTH_TODO_KEY[item.key])}
        </Link>
      )}
      {item.isOptional && (
        <span className={css.optionalTag}>
          {t("studio:numbers.health.optional")}
        </span>
      )}
    </li>
  );
}

/** One release in the checklist: its title, how much is done, and a toggle
 *  that folds out every item, each open one linking to its field. The row
 *  grows in and folds away when it joins or leaves its list (inside an
 *  AnimatePresence), clipping only while it moves so focus rings show. */
export function StudioReleaseHealthRow({
  releaseRow,
}: {
  releaseRow: StudioDashboardReleaseView;
}) {
  const { t } = useTranslation();
  const checklistId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const { release, health } = releaseRow;
  const collapsed = { opacity: 0, height: 0, overflow: "hidden" } as const;
  return (
    <m.li
      className={css.row}
      inert={!isPresent}
      initial={collapsed}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          ...STUDIO_DISCLOSURE,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE.duration,
        },
        transitionEnd: { overflow: "visible" },
      }}
      exit={{
        ...collapsed,
        transition: {
          ...STUDIO_DISCLOSURE_EXIT,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE_EXIT.duration,
        },
      }}
    >
      <div className={css.rowBody}>
        <div className={css.rowHead}>
          <span className={css.rowTitle}>{release.title}</span>
          <span className={css.rowProgress}>
            {t("studio:numbers.health.progress", {
              done: health.doneCount,
              total: health.totalCount,
            })}
          </span>
          <Button
            variant="quiet"
            size="sm"
            aria-expanded={isOpen}
            aria-controls={checklistId}
            onClick={() => setIsOpen((isShowing) => !isShowing)}
          >
            {isOpen
              ? t("studio:numbers.health.hideChecklist", {
                  title: release.title,
                })
              : t("studio:numbers.health.showChecklist", {
                  title: release.title,
                })}
          </Button>
        </div>
        <div id={checklistId}>
          <Collapse isOpen={isOpen}>
            <ul className={css.items}>
              {health.items.map((item) => (
                <StudioReleaseHealthItem
                  key={item.key}
                  releaseId={release.id}
                  item={item}
                />
              ))}
            </ul>
          </Collapse>
        </div>
      </div>
    </m.li>
  );
}
