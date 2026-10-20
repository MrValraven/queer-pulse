import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiUser } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useScrollLock } from "../../shared/hooks";
import { LoadErrorState, SkeletonLine } from "../../shared/components/ui";
import {
  pushModal,
  popModal,
  isTopmostModal,
} from "../../shared/components/ui/modalStack";
import { useModalExit } from "../../shared/components/ui/useModalExit";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GraphModalShell, GraphModalStatus } from "./GraphModalShell";
import { VouchGraphModalLayout } from "./VouchGraphModalLayout";
import { useTrustNetwork } from "./api/useTrustNetwork";
import { TrustGraphProvider } from "./trustGraph/TrustGraphContext";
import { useTrustNetworkUrl } from "./useTrustNetworkUrl";
import type { VouchGraphUrlView } from "./vouchGraph.types";
import styles from "./vouchGraphInspector.module.css";
import shellStyles from "./vouchGraphShell.module.css";

const CONTENT_FADE_SECONDS = 0.16;
const CONTENT_FADE_EASE = [0.22, 0.68, 0.16, 1] as const;

interface AdminVouchGraphModalProps {
  initialView: VouchGraphUrlView;
  onClose: () => void;
}

/**
 * The trust network modal. `useTrustNetworkUrl` re-renders on every `tn*`
 * write, so it lives in this thin wrapper and the memoised content below
 * only ever sees stable props: writing the view to the URL never re-renders
 * the graph. `initialView` is read once, at mount; later URL writes come
 * from this modal itself.
 */
export const AdminVouchGraphModal = memo(
  function AdminVouchGraphModal({
    initialView,
    onClose,
  }: AdminVouchGraphModalProps) {
    const { sync, cancel } = useTrustNetworkUrl();
    const [mountView] = useState(initialView);
    const onCloseRef = useRef(onClose);
    useEffect(() => {
      onCloseRef.current = onClose;
    }, [onClose]);
    // Drops this modal's pending sync before the parent clears the `tn*`
    // params, so a debounced write cannot land after the close and reopen
    // the network.
    const close = useCallback(() => {
      cancel();
      onCloseRef.current();
    }, [cancel]);
    return (
      <TrustNetworkModalContent
        initialView={mountView}
        sync={sync}
        close={close}
      />
    );
  },
  (previous, next) => previous.onClose === next.onClose,
);

const TrustNetworkModalContent = memo(function TrustNetworkModalContent({
  initialView,
  sync,
  close,
}: {
  initialView: VouchGraphUrlView;
  sync: (view: VouchGraphUrlView) => void;
  close: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  useScrollLock();
  // The one exit for every state: Escape, the scrim, each close button and
  // the top bar all go through `exit.close`, which is silenced mid-exit.
  const exit = useModalExit(close);
  const { isClosing } = exit;
  // The view the layout mounts with: read once from the URL, then replaced
  // only by a jump to a member outside the loaded graph (ADM-10). Each jump
  // bumps `jumpCount`, which remounts the layout on the new view.
  const [mountedView, setMountedView] = useState(initialView);
  const [jumpCount, setJumpCount] = useState(0);
  const lastViewRef = useRef(initialView);
  const activeFocus = mountedView.focus;

  const handleViewChange = useCallback(
    (view: VouchGraphUrlView) => {
      lastViewRef.current = view;
      sync(view);
    },
    [sync],
  );

  // A jump keeps the tab, filters and list view, and starts a fresh
  // selection and path on the new member.
  const jumpToMember = useCallback(
    (slug: string) => {
      const nextView: VouchGraphUrlView = {
        ...lastViewRef.current,
        focus: slug,
        selectedId: slug,
        pathA: null,
        pathB: null,
      };
      lastViewRef.current = nextView;
      setMountedView(nextView);
      setJumpCount((count) => count + 1);
      sync(nextView);
    },
    [sync],
  );
  // `focus` pins `activeFocus` into the fetched node set even when their join
  // date falls outside the graph's cap, so both the initial member and any
  // "All members" search pick always resolve (ADM-10).
  const {
    data,
    isLoading,
    isError: hasTrustNetworkError,
    refetch: refetchTrustNetwork,
  } = useTrustNetwork(activeFocus);

  // Stable per-instance id so the graph registers itself on the shared modal
  // stack (`shared/components/ui/modalStack`), same as `AdminDrawer` and
  // `AdminModal`. Two things depend on it (FE-ADM-28): the graph only reacts
  // to Escape while it is the topmost dialog, so backing out of the "Cite"
  // `ConfirmDialog` on top no longer tears the whole graph down and loses the
  // focus node, the crumbs and the replay position; and the member drawer
  // underneath stops closing on the same press, because the graph now sits
  // above it on the stack.
  const graphModalId = useId();

  useEffect(() => {
    pushModal(graphModalId);
    return () => popModal(graphModalId);
  }, [graphModalId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isClosing) return;
      if (isTopmostModal(graphModalId)) close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close, graphModalId, isClosing]);

  // The error check runs before the loading one. `isLoading` goes false on a
  // failure while `data` stays undefined, so without it the modal held its
  // loading skeleton forever and never said anything had gone wrong (DES-22).
  let contentKey: string;
  let content: ReactNode;
  if (hasTrustNetworkError && !data) {
    contentKey = "error";
    content = (
      <GraphModalStatus onClose={exit.close}>
        <LoadErrorState
          onRetry={() => void refetchTrustNetwork()}
          title={t("admin:vouchGraph.loadError.title")}
          description={t("admin:vouchGraph.loadError.body")}
        />
      </GraphModalStatus>
    );
  } else if (isLoading || !data) {
    contentKey = "loading";
    content = (
      <GraphModalStatus onClose={exit.close}>
        <div className={styles.insEmpty} aria-busy="true">
          <h4>{t("admin:vouchGraph.modal.loadingTitle")}</h4>
          <SkeletonLine
            height={280}
            style={{ marginTop: 16, borderRadius: 16 }}
          />
        </div>
      </GraphModalStatus>
    );
  } else if (!data.peopleById[activeFocus]) {
    contentKey = "empty";
    content = (
      <GraphModalStatus onClose={exit.close}>
        <div className={styles.insEmpty}>
          <span className={styles.insEmptyIc}>
            <FiUser aria-hidden />
          </span>
          <h4>{t("admin:vouchGraph.modal.emptyTitle")}</h4>
          <p>{t("admin:vouchGraph.modal.emptyBody")}</p>
        </div>
      </GraphModalStatus>
    );
  } else {
    // The key remounts the whole inner view (crumbs, expanded, selection)
    // on every jump to a member outside the graph, which suits a jump
    // across the platform.
    contentKey = `graph-${jumpCount}`;
    content = (
      <TrustGraphProvider data={data}>
        <VouchGraphModalLayout
          initialView={mountedView}
          onClose={exit.close}
          onJumpToMember={jumpToMember}
          onViewChange={handleViewChange}
        />
      </TrustGraphProvider>
    );
  }

  // One shell for every state, so loading to loaded and a member jump keep
  // the overlay and shell in place and only the content fades across. Each
  // state fills the shell through the stage view's absolute column.
  return (
    <GraphModalShell exit={exit}>
      <AnimatePresence initial={false} mode="wait">
        <m.div
          key={contentKey}
          className={shellStyles.stageView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : CONTENT_FADE_SECONDS,
            ease: CONTENT_FADE_EASE,
          }}
        >
          {content}
        </m.div>
      </AnimatePresence>
    </GraphModalShell>
  );
});
