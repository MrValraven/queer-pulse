import { FiBookmark, FiGlobe, FiLock, FiPlus } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isSavedItemUnavailable,
  type SavedItem,
} from "../../app/providers/useSaved";
import type { SavedListDTO } from "./api/SavedLists.api";
import { SavedListDetailModal } from "./SavedListDetailModal";
import { SavedUnavailableNote } from "./SavedUnavailableNote";
import { SavedListFileModal, SavedListNewModal } from "./SavedListModals";
import { useSavedListsController } from "./SavedListsPage.controller";
import styles from "./SavedListsPage.module.css";

/** One list in the grid. Its footer carries the only two visibility states the
 *  product has: private, or a link anybody holding it can open. */
function SavedListCard({
  list,
  meta,
  onOpen,
}: {
  list: SavedListDTO;
  meta: string;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.card} onClick={onOpen}>
      <span className={styles.count}>{list.itemCount}</span>
      <span>
        <span className={styles.name}>{list.name}</span>
      </span>
      <span className={styles.foot}>
        <span
          className={`${styles.state} ${list.isShared ? styles.stateShared : ""}`}
        >
          {list.isShared ? <FiGlobe aria-hidden /> : <FiLock aria-hidden />}
          {list.isShared
            ? t("members:savedLists.state.shared")
            : t("members:savedLists.state.private")}
        </span>
        <span className={styles.meta}>{meta}</span>
      </span>
    </button>
  );
}

/** Loading placeholder mirroring SavedListCard's rhythm. */
function SavedListCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width={40} height={38} />
      <SkeletonLine width="70%" height={20} />
      <div className={styles.foot}>
        <SkeletonLine width="30%" height={11} />
        <SkeletonLine width="35%" height={11} />
      </div>
    </div>
  );
}

/**
 * A recent save, offered for filing into one of the member's named lists.
 *
 * The row stays tappable when the subject can no longer be opened (PRD-169):
 * it opens the file modal rather than navigating, so it cannot land anybody on
 * a not-found page, and filing a lost save into a list is still a reasonable
 * thing to want. What it must not do is stay silent, or the member finds out
 * only once the list is built. `SavedUnavailableNote` carries the state as
 * text, on the same terms as the saved card, the filed-item row and the
 * shared-list row: never a reason, since the API deliberately does not say one.
 */
function SavedListRecentRow({
  item,
  onFile,
}: {
  item: SavedItem;
  onFile: () => void;
}) {
  const { t } = useTranslation();
  const isUnavailable = isSavedItemUnavailable(item);
  return (
    <button
      type="button"
      className={`${styles.recentRow}${
        isUnavailable ? ` ${styles.recentRowUnavailable}` : ""
      }`}
      onClick={onFile}
    >
      <span className={styles.recentKind}>
        {item.kind.slice(0, 3).toUpperCase()}
      </span>
      <span className={styles.recentInfo}>
        <b>{item.title}</b>
        {item.meta && <span className={styles.recentMeta}>{item.meta}</span>}
        {isUnavailable && <SavedUnavailableNote />}
      </span>
      <span className={styles.recentAdd}>
        {t("members:savedLists.recent.fileCta")}
      </span>
    </button>
  );
}

/**
 * The member's saved lists: what used to be Collections, pointed at the
 * saved-lists API so a list can actually be handed to somebody.
 *
 * "Here are the eight queer-friendly clinics I collected, take a look" is one
 * of the most ordinary acts of care in this community, and it was impossible
 * while collections were hardcoded owner-private. A saved list can carry a
 * revocable link, and the share panel inside each list says exactly what that
 * link exposes before one is ever made.
 */
export function SavedListsPage() {
  const { t } = useTranslation();
  const {
    lists,
    fileableLists,
    isLoading,
    recentSaves,
    modal,
    setModal,
    openList,
    openListItems,
    areOpenListItemsLoading,
    metaFor,
    createList,
    renameList,
    deleteList,
    shareList,
    revokeShare,
    fileItem,
    unfileItem,
    isRenaming,
    isDeleting,
    isSharing,
    isRevoking,
  } = useSavedListsController();

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div>
            <div className={styles.eyebrow}>
              {t("members:savedLists.header.eyebrow")}
            </div>
            <h1 className={styles.h1}>
              <Translation
                i18nKey="members:savedLists.header.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.lead}>{t("members:savedLists.header.lead")}</p>
          </div>
          <Button variant="primary" onClick={() => setModal({ type: "new" })}>
            {t("members:savedLists.header.newCta")}
          </Button>
        </header>

        {!isLoading && lists.length === 0 ? (
          <EmptyState
            icon={<FiBookmark />}
            title={t("members:savedLists.empty.title")}
            description={t("members:savedLists.empty.description")}
          />
        ) : (
          <div className={styles.grid}>
            {isLoading ? (
              Array.from({ length: 5 }).map((_unused, index) => (
                <SavedListCardSkeleton key={index} />
              ))
            ) : (
              <>
                {lists.map((list, index) => (
                  <FadeIn key={list.id} delay={Math.min(index, 8) * 60}>
                    <SavedListCard
                      list={list}
                      meta={metaFor(list)}
                      onOpen={() =>
                        setModal({ type: "detail", listId: list.id })
                      }
                    />
                  </FadeIn>
                ))}
                <button
                  type="button"
                  className={styles.newCard}
                  onClick={() => setModal({ type: "new" })}
                >
                  <span className={styles.plus}>
                    <FiPlus aria-hidden />
                  </span>
                  <b>{t("members:savedLists.newCard.title")}</b>
                  <span>{t("members:savedLists.newCard.subtitle")}</span>
                </button>
              </>
            )}
          </div>
        )}

        {recentSaves.length > 0 && (
          <>
            <div className={styles.secH}>
              <span>{t("members:savedLists.recent.heading")}</span>
              <span className={styles.count2}>
                {t("members:savedLists.recent.count", {
                  count: recentSaves.length,
                })}
              </span>
            </div>
            <div className={styles.recentList}>
              {recentSaves.map((item, index) => (
                <FadeIn key={item.id} delay={Math.min(index, 8) * 60}>
                  <SavedListRecentRow
                    item={item}
                    onFile={() => setModal({ type: "file", item })}
                  />
                </FadeIn>
              ))}
            </div>
          </>
        )}
      </div>

      {modal?.type === "new" && (
        <SavedListNewModal
          onClose={() => setModal(null)}
          onCreate={createList}
        />
      )}
      {openList && (
        <SavedListDetailModal
          list={openList}
          items={openListItems}
          areItemsLoading={areOpenListItemsLoading}
          onClose={() => setModal(null)}
          onRename={(nextName) => renameList(openList.id, nextName)}
          onDelete={() => void deleteList(openList.id).catch(() => undefined)}
          onRemoveItem={(ref) =>
            void unfileItem(openList.id, ref).catch(() => undefined)
          }
          onShare={() => void shareList(openList.id).catch(() => undefined)}
          onRevoke={() => void revokeShare(openList.id).catch(() => undefined)}
          isRenaming={isRenaming}
          isDeleting={isDeleting}
          isSharing={isSharing}
          isRevoking={isRevoking}
        />
      )}
      {modal?.type === "file" && (
        <SavedListFileModal
          item={modal.item}
          lists={fileableLists}
          onClose={() => setModal(null)}
          onFile={(listId) => fileItem(listId, modal.item)}
        />
      )}
    </AppShell>
  );
}
