import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiAlertTriangle } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import {
  Button,
  Collapse,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PERSONA_WALL_MAX_PICKS } from "../subprofiles/api/personaWall.api";
import { useAdminPersonaWall } from "./api/useAdminPersonaWall";
import { PERSONA_WALL_SKELETON_ROW_KEYS } from "./personaWall/personaWallAdmin.data";
import {
  PERSONA_WALL_ERROR_VALUES,
  personaWallErrorKeyOf,
} from "./personaWall/personaWallAdmin.model";
import { PersonaWallAddDialog } from "./personaWall/PersonaWallAddDialog";
import { PersonaWallFillOrder } from "./personaWall/PersonaWallFillOrder";
import { PersonaWallPicksSection } from "./personaWall/PersonaWallPicksSection";
import { PersonaWallPreview } from "./personaWall/PersonaWallPreview";
import { AdminPageHeader } from "./ui";
import css from "./AdminPersonaWallPage.module.css";

const SKELETON_ROW_HEIGHT = 72;

/**
 * The People Directory hero wall curation page (`/admin/personas/wall`,
 * Admin only): the picks with their Add persona dialog, the fill order for
 * the tiles no pick takes, and a live preview of the wall.
 */
export function AdminPersonaWallPage() {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const { data: wall, isError, error, refetch } = useAdminPersonaWall();
  const isWallLoaded = wall !== undefined;
  const isWallFull =
    wall !== undefined && wall.picks.length >= PERSONA_WALL_MAX_PICKS;

  // A demo/live switch empties the wall until the other mode answers; the
  // dialog must not pop back open when it does.
  const [wasWallLoaded, setWasWallLoaded] = useState(isWallLoaded);
  if (wasWallLoaded !== isWallLoaded) {
    setWasWallLoaded(isWallLoaded);
    if (!isWallLoaded) setIsAdding(false);
  }

  return (
    <AdminShell
      title={t("admin:personaWall.title")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:common.adminBreadcrumb")}
          title={t("admin:personaWall.title")}
          sub={t("admin:personaWall.intro")}
        />
      </FadeIn>

      {wall ? (
        <FadeIn key="body" delay={80}>
          <Collapse isOpen={isError}>
            <p className={css.refreshError} role="alert">
              <FiAlertTriangle aria-hidden />
              <span>
                {t(personaWallErrorKeyOf(error), PERSONA_WALL_ERROR_VALUES)}
              </span>
              <Button variant="ghost" size="sm" onClick={() => void refetch()}>
                {t("admin:personaWall.loadError.retryCta")}
              </Button>
            </p>
          </Collapse>
          <div className={css.bodyFrame}>
            <div className={css.body}>
              <div className={css.main}>
                <PersonaWallPicksSection
                  wall={wall}
                  onAdd={() => setIsAdding(true)}
                />
                <PersonaWallFillOrder fillOrder={wall.fillOrder} />
              </div>
              <div className={css.aside}>
                <PersonaWallPreview preview={wall.preview} />
              </div>
            </div>
          </div>
        </FadeIn>
      ) : isError ? (
        <FadeIn key="error" delay={80}>
          <EmptyState
            icon={<FiAlertTriangle aria-hidden />}
            title={t("admin:personaWall.loadError.title")}
            description={t(
              personaWallErrorKeyOf(error),
              PERSONA_WALL_ERROR_VALUES,
            )}
            headingLevel={2}
            action={{
              label: t("admin:personaWall.loadError.retryCta"),
              onClick: () => void refetch(),
            }}
          />
        </FadeIn>
      ) : (
        <FadeIn key="loading" delay={80}>
          <div className={css.skeletonRows}>
            {PERSONA_WALL_SKELETON_ROW_KEYS.map((rowKey) => (
              <SkeletonLine key={rowKey} height={SKELETON_ROW_HEIGHT} />
            ))}
          </div>
        </FadeIn>
      )}

      <AnimatePresence>
        {isAdding && (
          <PersonaWallAddDialog
            isFull={isWallFull}
            onClose={() => setIsAdding(false)}
          />
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
