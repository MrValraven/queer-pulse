import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Reveal, SectionHead } from "../../../shared/components/ui";
import { linkToPath, routes } from "../../../app/routeMap";
import { wellbeingResources } from "../data/wellbeing";
import type { WellbeingIcon, WellbeingTone } from "../data/types";
import styles from "./Wellbeing.module.css";

const TONE_COLOR: Record<WellbeingTone, string> = {
  violet: "var(--violet)",
  jade: "var(--jade)",
  coral: "var(--accent)",
  plum: "var(--plum)",
};
const TONE_BG: Record<WellbeingTone, string> = {
  violet: "rgba(122,82,184,.1)",
  jade: "rgba(74,140,111,.1)",
  coral: "rgba(232,119,90,.1)",
  plum: "rgba(45,27,61,.07)",
};

function Icon({ name, color }: { name: WellbeingIcon; color: string }) {
  const common = { stroke: color, strokeWidth: 2, fill: "none" } as const;
  const paths: Record<WellbeingIcon, ReactNode> = {
    heart: (
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        {...common}
        strokeLinejoin="round"
      />
    ),
    people: (
      <>
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          {...common}
          strokeLinecap="round"
        />
        <circle cx={9} cy={7} r={4} {...common} />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          {...common}
          strokeLinecap="round"
        />
      </>
    ),
    phone: (
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        {...common}
        strokeLinejoin="round"
      />
    ),
    shield: (
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        {...common}
        strokeLinejoin="round"
      />
    ),
    briefcase: (
      <>
        <rect x={2} y={7} width={20} height={14} rx={2} {...common} />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" {...common} />
      </>
    ),
    info: (
      <>
        <circle cx={12} cy={12} r={10} {...common} />
        <line
          x1={12}
          y1={8}
          x2={12}
          y2={12}
          {...common}
          strokeLinecap="round"
        />
        <line
          x1={12}
          y1={16}
          x2={12.01}
          y2={16}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </>
    ),
  };
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      {paths[name]}
    </svg>
  );
}

export function Wellbeing() {
  return (
    <section className={styles.wellbeing} id="wellbeing">
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <>
                Your <em>wellbeing matters here.</em>
              </>
            }
            subtitle="A professional network without health infrastructure is incomplete. Resources, directories, and care — built in, not bolted on."
            action={
              <Button variant="ghost" to={routes.wellbeing}>
                All resources →
              </Button>
            }
          />
        </Reveal>

        <div className={styles.grid}>
          {wellbeingResources.map((resource, index) => (
            <Reveal key={resource.title} delay={index * 55}>
              <Link to={linkToPath(resource.href)} className={styles.card}>
                <span
                  className={styles.icon}
                  style={{ background: TONE_BG[resource.tone] }}
                >
                  <Icon
                    name={resource.icon}
                    color={TONE_COLOR[resource.tone]}
                  />
                </span>
                <div className={styles.name}>{resource.title}</div>
                <p className={styles.desc}>{resource.description}</p>
                <span className={styles.cta}>{resource.ctaLabel}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
