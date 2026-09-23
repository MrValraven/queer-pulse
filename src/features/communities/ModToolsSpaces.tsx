import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiCompass, FiPlus } from "react-icons/fi";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath } from "../../app/routeMap";
import { useSubcommunities } from "./api/useSubcommunities";
import { AccessTierBadge } from "./CommunityBadges";
import { CreateSpaceForm } from "./CreateSpaceForm";
import { SpaceRequestPanel } from "./SpaceRequestPanel";
import type { LivingCommunity } from "./community.model";
import type { CommunityRole } from "./membership.types";
import detail from "./CommunityDetailPage.module.css";
import styles from "./ModToolsPanels.module.css";
import spaceForm from "./CreateSpaceForm.module.css";

/**
 * Moderator console for spaces (subcommunities). Mounts on every top-level
 * community now (`ModToolsTab` no longer gates it on `allowsSubcommunities`):
 * while spaces are on, it lists the spaces already open and offers the form
 * to open another; while they are off, it offers `SpaceRequestPanel` so the
 * owner (or a co-owner) can ask platform staff to switch them on.
 *
 * The list stays after platform staff turn the switch off, since the spaces
 * themselves stay; the "Create a space" button shows only while
 * `living.allowsSubcommunities`. The form stays closed until that button is
 * pressed, then opens right under the pane intro, above the "Spaces in this
 * community" heading, so it stands as its own card with its own title and
 * that heading keeps labelling the list below it. The heading row and list
 * mount only while there is something to show for them
 * (`hasSpacesToList`): a community with spaces off and none of its own keeps
 * the pane down to just the label, the intro and the request panel.
 */
export function ModToolsSpaces({
  living,
  communityName,
  viewerRole,
}: {
  living: LivingCommunity;
  /** The community's display name: spaces read as "spaces inside {name}",
   *  and the founding form quotes it in the tier and rules hints. */
  communityName: string;
  /** The signed-in moderator's own role in this community, threaded to
   *  `SpaceRequestPanel` so it can tell an owner or co-owner (who may ask
   *  for spaces) from a moderator (who only sees the request's status). */
  viewerRole: CommunityRole | null;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSpaceCreationAllowed = living.allowsSubcommunities;
  const hasSpacesToList =
    living.allowsSubcommunities || living.subcommunityCount > 0;
  const { spaces, isLoading, isError, refetch } = useSubcommunities(
    living.slug,
    { enabled: hasSpacesToList },
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  // The trigger unmounts while the form is open, so focus can only go back
  // to it once the closing render has committed and the button exists again.
  useEffect(() => {
    if (isFormOpen || !shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    triggerRef.current?.focus();
  }, [isFormOpen]);

  const closeForm = () => {
    shouldRestoreFocusRef.current = true;
    setIsFormOpen(false);
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div className={detail.secLbl}>{t("communities:spaces.mod.label")}</div>
      {isSpaceCreationAllowed && (
        <p className={styles.intro}>{t("communities:spaces.mod.intro")}</p>
      )}

      {!isSpaceCreationAllowed && (
        <SpaceRequestPanel slug={living.slug} viewerRole={viewerRole} />
      )}

      {isSpaceCreationAllowed && isFormOpen && (
        <CreateSpaceForm
          parentSlug={living.slug}
          parentName={communityName}
          parentTier={living.accessTier}
          onCreated={(slug) => void navigate(communityPath(slug))}
          onCancel={closeForm}
        />
      )}

      {hasSpacesToList && (
        <>
          <div className={spaceForm.listHead}>
            <div className={styles.resultHead}>
              {t("communities:spaces.mod.list.title")}
            </div>
            {isSpaceCreationAllowed && !isFormOpen && (
              <Button
                ref={triggerRef}
                variant="primary"
                onClick={() => setIsFormOpen(true)}
              >
                <FiPlus aria-hidden />
                {t("communities:spaces.mod.create")}
              </Button>
            )}
          </div>

          {isLoading ? (
            <div aria-busy="true">
              <SkeletonLine height={14} style={{ marginBottom: 10 }} />
              <SkeletonLine height={14} width="70%" />
            </div>
          ) : isError ? (
            <EmptyState
              compact
              icon={<FiAlertTriangle />}
              title={t("communities:detail.modtools.queueError.title")}
              description={t(
                "communities:detail.modtools.queueError.description",
              )}
              action={{
                label: t("communities:detail.modtools.queueError.retry"),
                onClick: refetch,
              }}
            />
          ) : spaces.length === 0 ? (
            <EmptyState
              compact
              icon={<FiCompass />}
              title={t("communities:spaces.mod.list.empty")}
            />
          ) : (
            <ul className={styles.rows}>
              {spaces.map((space) => (
                <li key={space.slug ?? space.name} className={styles.row}>
                  <div className={styles.rowMain}>
                    {space.slug ? (
                      <Link
                        to={communityPath(space.slug)}
                        className={styles.threadLink}
                      >
                        {space.name}
                      </Link>
                    ) : (
                      <span>{space.name}</span>
                    )}
                    <p className={styles.meta}>{space.count}</p>
                  </div>
                  {space.accessTier && (
                    <AccessTierBadge tier={space.accessTier} isSpace />
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
