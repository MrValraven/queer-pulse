import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { refreshSession } from "../../../shared/api/client";
import { API_BASE_URL, apiAvailable } from "../../../shared/api/config";
import { DEMO_EDITORS, DEMO_PIECES } from "../data/desk.data";

/** One editor on a piece, as the `/magazine-desk` gateway sends them. */
export interface Viewer {
  userId: string;
  name: string;
  initials: string;
}

export interface DeskPresence {
  viewersByPiece: Record<string, Viewer[]>;
  watchPiece: (pieceId: string) => void;
  unwatchPiece: (pieceId: string) => void;
}

interface PieceViewersFrame {
  pieceId: string;
  viewers: Viewer[];
}

interface DeskViewersFrame {
  byPiece: Record<string, Viewer[]>;
}

/** Retry schedule after a server-forced drop (token expiry, refused handshake,
 *  lockdown). socket.io never reconnects on its own after one, so this does,
 *  after refreshing the session cookie the gateway just turned away. */
const RECONNECT_BASE_DELAY_MS = 2_000;
const RECONNECT_MAX_DELAY_MS = 60_000;

/** Demo: the second demo editor has the first demo piece open, so a row and
 *  the peek panel show a stack without a backend. */
const DEMO_VIEWER_EDITOR = DEMO_EDITORS[1];
const DEMO_VIEWED_PIECE = DEMO_PIECES[0];
const DEMO_VIEWERS_BY_PIECE: Record<string, Viewer[]> =
  DEMO_VIEWER_EDITOR && DEMO_VIEWED_PIECE
    ? {
        [DEMO_VIEWED_PIECE.id]: [
          {
            userId: DEMO_VIEWER_EDITOR.id,
            name: DEMO_VIEWER_EDITOR.name,
            initials: DEMO_VIEWER_EDITOR.initials,
          },
        ],
      }
    : {};

const ignorePiece = () => undefined;

/**
 * Who else is looking at which piece on the desk, so two editors do not
 * rework the same draft at once. Live mode opens ONE socket to
 * `/magazine-desk` for as long as the desk is mounted, joins the desk-wide
 * feed on every (re)connect, and replays the pieces this tab watches so a
 * reconnect restores them. The signed-in editor is left out of every list.
 */
export function useDeskPresence(): DeskPresence {
  const { demoMode } = useDemoMode();
  const { loggedIn, user } = useAuth();
  const currentUserId = user?.id ?? null;
  const isLive = !demoMode && loggedIn && apiAvailable;
  const [liveViewersByPiece, setLiveViewersByPiece] = useState<
    Record<string, Viewer[]>
  >({});
  const socketRef = useRef<Socket | null>(null);
  const watchedPieceIdsRef = useRef(new Set<string>());

  useEffect(() => {
    if (!isLive) return;
    let isDisposed = false;
    let reconnectAttempt = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    void import("socket.io-client").then(({ io }) => {
      if (isDisposed) return;
      const socket = io(`${API_BASE_URL}/magazine-desk`, {
        withCredentials: true,
        transports: ["websocket"],
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("desk:watch");
        for (const pieceId of watchedPieceIdsRef.current) {
          socket.emit("piece:watch", { pieceId });
        }
      });
      // The first snapshot proves the handshake was admitted.
      socket.on("desk:viewers", (frame: DeskViewersFrame) => {
        reconnectAttempt = 0;
        setLiveViewersByPiece(frame.byPiece);
      });
      socket.on("piece:viewers", (frame: PieceViewersFrame) => {
        setLiveViewersByPiece((previous) => ({
          ...previous,
          [frame.pieceId]: frame.viewers,
        }));
      });
      socket.on("disconnect", (reason) => {
        if (isDisposed) return;
        // Faces from before the drop may have left; the next snapshot after
        // reconnecting fills the map again.
        setLiveViewersByPiece({});
        if (reason !== "io server disconnect") return;
        const delay = Math.min(
          RECONNECT_MAX_DELAY_MS,
          RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttempt,
        );
        reconnectAttempt += 1;
        reconnectTimer = setTimeout(() => {
          // The same single-flight, cross-tab refresh the chat socket uses.
          // A failed refresh means the session is gone: stay disconnected and
          // let the next HTTP 401 drive sign-out.
          void refreshSession().then((isRefreshed) => {
            if (isDisposed || !isRefreshed) return;
            socket.connect();
          });
        }, delay);
      });
    });

    return () => {
      isDisposed = true;
      clearTimeout(reconnectTimer);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [isLive]);

  // Emit only on a live connection: socket.io would buffer a frame sent while
  // down and flush it on connect, doubling the replay the connect handler
  // already sends from `watchedPieceIdsRef`.
  const watchPiece = useCallback((pieceId: string) => {
    watchedPieceIdsRef.current.add(pieceId);
    const socket = socketRef.current;
    if (socket?.connected) socket.emit("piece:watch", { pieceId });
  }, []);

  const unwatchPiece = useCallback((pieceId: string) => {
    watchedPieceIdsRef.current.delete(pieceId);
    const socket = socketRef.current;
    if (socket?.connected) socket.emit("piece:unwatch", { pieceId });
  }, []);

  const viewersByPiece = useMemo(() => {
    const source = isLive
      ? liveViewersByPiece
      : demoMode
        ? DEMO_VIEWERS_BY_PIECE
        : {};
    const withoutSelf: Record<string, Viewer[]> = {};
    for (const [pieceId, viewers] of Object.entries(source)) {
      const others = viewers.filter(
        (viewer) => viewer.userId !== currentUserId,
      );
      if (others.length > 0) withoutSelf[pieceId] = others;
    }
    return withoutSelf;
  }, [isLive, demoMode, liveViewersByPiece, currentUserId]);

  // One stable object per change, so a consumer can list it in effect deps.
  return useMemo(
    () =>
      isLive
        ? { viewersByPiece, watchPiece, unwatchPiece }
        : {
            viewersByPiece,
            watchPiece: ignorePiece,
            unwatchPiece: ignorePiece,
          },
    [isLive, viewersByPiece, watchPiece, unwatchPiece],
  );
}
