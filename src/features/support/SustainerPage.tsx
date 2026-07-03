import { useCallback, useEffect, useRef, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { SustainerHero } from "./SustainerHero";
import { SustainerMemberBanner } from "./SustainerMemberBanner";
import { SustainerImpact } from "./SustainerImpact";
import { SustainerBudget } from "./SustainerBudget";
import { SustainerTiers } from "./SustainerTiers";
import { SustainerHowItWorks } from "./SustainerHowItWorks";
import { SustainerSidebar } from "./SustainerSidebar";
import { SustainerTestimonials } from "./SustainerTestimonials";
import { SustainerFaq } from "./SustainerFaq";
import { SustainerRecapBar } from "./SustainerRecapBar";
import { SustainerPaymentModal } from "./SustainerPaymentModal";
import { useSustainer } from "./useSustainer";
import styles from "./sustainer.module.css";

/**
 * Supporting-membership ("Sustainer") page — QueerPulse is free to join;
 * supporting members cover the cost of running it. Pick a tier or a custom
 * amount, then check out through the (simulated) payment modal.
 */
export function SustainerPage() {
  const store = useSustainer();
  const tiersRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [recapVisible, setRecapVisible] = useState(false);

  const scrollTo = (el: HTMLElement | null) =>
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  const scrollToTiers = useCallback(() => scrollTo(tiersRef.current), []);
  const scrollToBudget = useCallback(() => scrollTo(budgetRef.current), []);

  // Sticky recap follows the selection while the tiers are in view — but not
  // once you're already a supporter, or while the modal is open.
  useEffect(() => {
    function onScroll() {
      const el = tiersRef.current;
      if (!el) return setRecapVisible(false);
      const top = el.getBoundingClientRect().top;
      setRecapVisible(
        top < window.innerHeight * 0.85 && !payOpen && !store.supporter,
      );
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [payOpen, store.supporter]);

  return (
    <PageShell>
      <div className={styles.page}>
        <SustainerHero
          store={store}
          onChooseAmount={scrollToTiers}
          onSeeBudget={scrollToBudget}
        />

        <div className={styles.susBody}>
          <div className="wrap">
            {store.supporter && (
              <SustainerMemberBanner
                store={store}
                onChangeAmount={scrollToTiers}
              />
            )}

            <div className={styles.susLayout}>
              <div>
                <SustainerImpact />
                <SustainerBudget ref={budgetRef} />
                <SustainerTiers
                  ref={tiersRef}
                  store={store}
                  onContinue={() => setPayOpen(true)}
                />
                <SustainerHowItWorks />
              </div>
              <SustainerSidebar store={store} />
            </div>
          </div>
        </div>

        <SustainerTestimonials />
        <SustainerFaq />
      </div>

      <SustainerRecapBar
        store={store}
        visible={recapVisible}
        onContinue={() => setPayOpen(true)}
      />
      {payOpen && (
        <SustainerPaymentModal
          store={store}
          onClose={() => setPayOpen(false)}
        />
      )}
    </PageShell>
  );
}
