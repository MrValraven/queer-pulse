import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../../../shared/components/ui";
import { routes } from "../../../app/routeMap";
import styles from "./TrustStrip.module.css";

const STROKE = "rgba(247,243,238,.75)";

interface TrustItem {
  label: string;
  icon: ReactNode;
}

const items: TrustItem[] = [
  {
    label: "Every member vouched for",
    icon: (
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Encrypted messaging",
    icon: (
      <>
        <rect
          x={3}
          y={11}
          width={18}
          height={11}
          rx={2}
          stroke={STROKE}
          strokeWidth={2}
        />
        <path
          d="M7 11V7a5 5 0 0110 0v4"
          stroke={STROKE}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    label: "24h moderation response",
    icon: (
      <>
        <circle cx={12} cy={12} r={9} stroke={STROKE} strokeWidth={2} />
        <polyline
          points="12 7 12 12 15 15"
          stroke={STROKE}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    label: "Block, mute & report",
    icon: (
      <>
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke={STROKE}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={9} cy={7} r={4} stroke={STROKE} strokeWidth={2} />
        <line
          x1={20}
          y1={8}
          x2={20}
          y2={14}
          stroke={STROKE}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <line
          x1={23}
          y1={11}
          x2={17}
          y2={11}
          stroke={STROKE}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    label: "Granular privacy controls",
    icon: (
      <>
        <path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke={STROKE}
          strokeWidth={2}
        />
        <circle cx={12} cy={12} r={3} stroke={STROKE} strokeWidth={2} />
        <line
          x1={3}
          y1={3}
          x2={21}
          y2={21}
          stroke={STROKE}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </>
    ),
  },
];

export function TrustStrip() {
  return (
    <section className={styles.strip}>
      <div className="wrap">
        <Reveal className={styles.row}>
          {items.map((item) => (
            <div key={item.label} className={styles.item}>
              <span className={styles.icon}>
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  {item.icon}
                </svg>
              </span>
              {item.label}
            </div>
          ))}
          <Link to={routes.report} className={styles.policyLink}>
            Safety policy & reporting →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
