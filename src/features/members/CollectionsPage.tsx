import { type ReactNode } from "react";
import { FiArrowRight, FiFolder, FiPlus } from "react-icons/fi";
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
  privacyLabel,
  type Collection,
  type Privacy,
  type Thumb,
  type RecentSave,
} from "./collections.data";
import { SavedByYou } from "./SavedByYou";
import {
  AddToCollectionModal,
  NewCollectionModal,
  ViewCollectionModal,
} from "./CollectionsModals";
import { useCollectionsController } from "./useCollectionsController";
import styles from "./CollectionsPage.module.css";

const thumbClass: Record<Thumb, string> = {
  a: styles.thumbA!,
  b: styles.thumbB!,
  c: styles.thumbC!,
  d: styles.thumbD!,
  e: styles.thumbE!,
};

const kindClass: Record<RecentSave["kindVariant"], string> = {
  therapist: styles.kindTherapist!,
  article: styles.kindArticle!,
  business: styles.kindBusiness!,
};

const privacyIcon: Record<Privacy, ReactNode> = {
  private: (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  shared: (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="4" />
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  ),
  public: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
};

/** A single collection card in the grid. */
function CollectionCard({ c, onOpen }: { c: Collection; onOpen: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={`${styles.card} ${c.featured ? styles.featured : ""}`}
      onClick={onOpen}
    >
      <div className={styles.ic}>{c.count}</div>
      <div>
        <div className={styles.name}>{c.name}</div>
        <div className={styles.meta}>{c.meta}</div>
      </div>
      <div className={styles.thumbs}>
        {c.thumbs.map((thumb, i) => (
          <span key={i} className={`${styles.thumb} ${thumbClass[thumb]}`} />
        ))}
        <span className={styles.more}>{c.more}</span>
      </div>
      <div className={styles.foot}>
        <span className={styles.priv}>
          {privacyIcon[c.privacy]}
          {privacyLabel(c.privacy, c.sharedWithCount, t)}
        </span>
        <span>{c.updated}</span>
      </div>
    </button>
  );
}

/** Loading placeholder mirroring CollectionCard — same min-height + rhythm. */
function CollectionCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width={40} height={38} />
      <div>
        <SkeletonLine width="70%" height={20} />
        <SkeletonLine width="50%" height={12} style={{ marginTop: 8 }} />
      </div>
      <SkeletonLine
        height={42}
        style={{ marginTop: "auto", borderRadius: 10 }}
      />
      <div className={styles.foot}>
        <SkeletonLine width="30%" height={11} />
        <SkeletonLine width="25%" height={11} />
      </div>
    </div>
  );
}

/** Loading placeholder mirroring RecentSaveRow's 3-column grid. */
function RecentRowSkeleton() {
  return (
    <div className={styles.recentRow} aria-hidden>
      <SkeletonLine
        width={30}
        height={30}
        style={{ borderRadius: 7, flex: "none" }}
      />
      <div className={styles.recentInfo}>
        <SkeletonLine width="60%" height={14} />
        <SkeletonLine width="35%" height={12} style={{ marginTop: 6 }} />
      </div>
      <SkeletonLine width={120} height={12} />
    </div>
  );
}

/** A recent, unfiled save — clicking opens the "add to collection" picker. */
function RecentSaveRow({ r, onAdd }: { r: RecentSave; onAdd: () => void }) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.recentRow} onClick={onAdd}>
      <div className={`${styles.recentKind} ${kindClass[r.kindVariant]}`}>
        {r.kind}
      </div>
      <div className={styles.recentInfo}>
        <b>{r.title}</b>
        <span>{r.saved}</span>
      </div>
      <span className={styles.recentAdd}>
        {t("members:collections.recentSaves.addCta")} <FiArrowRight aria-hidden />
      </span>
    </button>
  );
}

export function CollectionsPage() {
  const { t } = useTranslation();
  const {
    demoMode,
    collections,
    loading,
    recentSaves,
    modal,
    setModal,
    createCollection,
    addSaveToCollection,
    removeSaveFromCollection,
    renameCollection,
    deleteCollection,
    isRenaming,
    isDeleting,
    viewing,
    viewingItems,
  } = useCollectionsController();

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div>
            <div className={styles.eyebrow}>
              {t("members:collections.header.eyebrow")}
            </div>
            <h1 className={styles.h1}>
              <Translation
                i18nKey="members:collections.header.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.lead}>
              {t("members:collections.header.lead")}
            </p>
          </div>
          <Button variant="primary" onClick={() => setModal({ type: "new" })}>
            {t("members:collections.header.newCta")}
          </Button>
        </header>

        <SavedByYou />

        {!loading && collections.length === 0 ? (
          <EmptyState
            icon={<FiFolder />}
            title={t("members:collections.emptyLive.title")}
            description={t("members:collections.emptyLive.description")}
          />
        ) : (
        <div className={styles.grid}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <CollectionCardSkeleton key={i} />
            ))
          ) : (
            <>
              {collections.map((c, i) => (
                <FadeIn key={c.id} delay={Math.min(i, 8) * 60}>
                  <CollectionCard
                    c={c}
                    onOpen={() => setModal({ type: "view", id: c.id })}
                  />
                </FadeIn>
              ))}

              <button
                type="button"
                className={styles.newCard}
                onClick={() => setModal({ type: "new" })}
              >
                <div className={styles.plus}>
                  <FiPlus aria-hidden />
                </div>
                <b>{t("members:collections.newCard.title")}</b>
                <span>{t("members:collections.newCard.subtitle")}</span>
              </button>
            </>
          )}
        </div>
        )}

        {(loading || recentSaves.length > 0) && (
          <>
            <div className={styles.secH}>
              <span>{t("members:collections.recentSaves.heading")}</span>
              <span className={styles.ct}>
                {t("members:collections.recentSaves.unfiledCount", {
                  count: recentSaves.length,
                })}
              </span>
            </div>
            <div className={styles.recentList}>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <RecentRowSkeleton key={i} />
                  ))
                : recentSaves.map((r, i) => (
                    <FadeIn key={r.id} delay={Math.min(i, 8) * 60}>
                      <RecentSaveRow
                        r={r}
                        onAdd={() => setModal({ type: "add", save: r })}
                      />
                    </FadeIn>
                  ))}
            </div>
          </>
        )}
      </div>

      {modal?.type === "new" && (
        <NewCollectionModal
          onClose={() => setModal(null)}
          onCreate={createCollection}
        />
      )}
      {viewing && (
        <ViewCollectionModal
          collection={viewing}
          items={viewingItems}
          onClose={() => setModal(null)}
          onRemoveItem={
            demoMode
              ? undefined
              : (ref) => removeSaveFromCollection(viewing.id, ref)
          }
          onRename={(nextName) => renameCollection(viewing.id, nextName)}
          onDelete={deleteCollection}
          isRenaming={isRenaming}
          isDeleting={isDeleting}
        />
      )}
      {modal?.type === "add" && (
        <AddToCollectionModal
          itemTitle={modal.save.title}
          collections={collections}
          onClose={() => setModal(null)}
          onPick={(id) => addSaveToCollection(id, modal.save)}
        />
      )}
    </AppShell>
  );
}
