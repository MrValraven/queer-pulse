import { useMemo, type ReactNode } from "react";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  buildRateCells,
  buildTiers,
  buildSkeptics,
  buildTierFoot,
} from "./studioAbout.data";
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
  const { t } = useTranslation();
  const rateCells = useMemo(() => buildRateCells(t), [t]);
  return (
    <div className={s.rateBand}>
      {rateCells.map((cell, i) => (
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
  const { t } = useTranslation();
  const tiers = useMemo(() => buildTiers(t), [t]);
  const tierFoot = useMemo(() => buildTierFoot(), []);
  return (
    <>
      <div className={s.tiers}>
        {tiers.map((tier) => {
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
      <div className={s.tierFoot}>{tierFoot}</div>
    </>
  );
}

/** The "hard questions" Q&A cards (05). */
export function Skeptics() {
  const { t } = useTranslation();
  const skeptics = useMemo(() => buildSkeptics(t), [t]);
  return (
    <div className={s.skeptic}>
      {skeptics.map((item, i) => (
        <div key={i} className={s.sk}>
          <h4>{item.q}</h4>
          <p>{item.a}</p>
        </div>
      ))}
    </div>
  );
}
