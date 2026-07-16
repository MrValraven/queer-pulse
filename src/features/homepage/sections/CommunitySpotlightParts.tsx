import {
  FiActivity,
  FiBook,
  FiCalendar,
  FiMessageSquare,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityFace, RoomKey } from "./Communities.data";
import { FACE_TINT } from "./communityClasses";
import styles from "./Communities.module.css";

/** Compact bar sparkline built from an 8-point growth trend. */
export function Sparkline({
  trend,
  steady,
}: {
  trend: number[];
  steady: boolean;
}) {
  const w = 64;
  const h = 20;
  const gap = 2;
  const n = trend.length;
  const bw = (w - (n - 1) * gap) / n;
  const max = Math.max(...trend, 1);
  return (
    <svg
      className={[styles.spark, steady && styles.sparkSteady]
        .filter(Boolean)
        .join(" ")}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
    >
      {trend.map((v, i) => {
        const bh = Math.max(2, Math.round((v / max) * h));
        return (
          <rect
            key={i}
            x={+(i * (bw + gap)).toFixed(1)}
            y={h - bh}
            width={+bw.toFixed(1)}
            height={bh}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

export function RosterFaces({
  faces,
  more,
}: {
  faces: CommunityFace[];
  more: number;
}) {
  return (
    <div className={styles.faces}>
      {faces.map((f, i) => (
        <span
          key={`${f.initials}-${i}`}
          className={[styles.face, FACE_TINT[f.tint]].filter(Boolean).join(" ")}
        >
          {f.initials}
        </span>
      ))}
      <span className={[styles.face, styles.faceMore].join(" ")}>+{more}</span>
    </div>
  );
}

const ROOM_ICON: Record<RoomKey, IconType> = {
  Pulse: FiActivity,
  Discussions: FiMessageSquare,
  Events: FiCalendar,
  Resources: FiBook,
};
// i18n Pattern A — the room names themselves (Pulse/Discussions/Events/
// Resources) are kept in English as product feature names (like Cinema/
// Studio); only the tooltip description is chrome and gets translated.
const ROOM_DESC_KEY: Record<RoomKey, string> = {
  Pulse: "homepage:communities.room.pulse",
  Discussions: "homepage:communities.room.discussions",
  Events: "homepage:communities.room.events",
  Resources: "homepage:communities.room.resources",
};

export function RoomChips({ rooms }: { rooms: RoomKey[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.rooms}>
      {rooms.map((r) => {
        const Icon = ROOM_ICON[r];
        return (
          <span key={r} className={styles.room} title={t(ROOM_DESC_KEY[r])}>
            <Icon aria-hidden />
            {r}
          </span>
        );
      })}
    </div>
  );
}
