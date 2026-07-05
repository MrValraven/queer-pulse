import type { ReactNode } from "react";
import { FadeIn } from "../../shared/components/ui";
import { RATE_CELLS, TIERS, SKEPTICS, TIER_FOOT } from "./studioAbout.data";
import s from "./StudioAboutPage.module.css";

/** A numbered section shell: eyebrow number + heading + children. */
export function AboutSection({
  num,
  heading,
  children,
  delay = 0,
}: {
  num: string;
  heading: ReactNode;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay} className={s.sec} as="section">
      <div className={s.num}>{num}</div>
      <h2>{heading}</h2>
      {children}
    </FadeIn>
  );
}

/** The €0.05 rate band — three cells (02). */
export function RateBand() {
  return (
    <div className={s.rateBand}>
      {RATE_CELLS.map((cell, i) => (
        <div
          key={i}
          className={cell.jade ? `${s.rateCell} ${s.jade}` : s.rateCell}
        >
          <div className={s.v}>{cell.value}</div>
          <div className={s.l}>{cell.label}</div>
        </div>
      ))}
    </div>
  );
}

/** The four earning tiers grid + footnote (03). */
export function Tiers() {
  return (
    <>
      <div className={s.tiers}>
        {TIERS.map((tier) => {
          const variantClass =
            tier.variant === "hi"
              ? s.hi
              : tier.variant === "ceil"
                ? s.ceil
                : "";
          return (
            <div
              key={tier.label}
              className={`${s.tierC} ${variantClass}`.trim()}
            >
              <div className={s.lbl}>{tier.label}</div>
              <div className={s.v}>{tier.value}</div>
              <p>{tier.body}</p>
            </div>
          );
        })}
      </div>
      <div className={s.tierFoot}>{TIER_FOOT}</div>
    </>
  );
}

/** The "hard questions" Q&A cards (05). */
export function Skeptics() {
  return (
    <div className={s.skeptic}>
      {SKEPTICS.map((item, i) => (
        <div key={i} className={s.sk}>
          <h4>{item.q}</h4>
          <p>{item.a}</p>
        </div>
      ))}
    </div>
  );
}
