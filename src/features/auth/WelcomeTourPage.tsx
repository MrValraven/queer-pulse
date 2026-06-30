import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { TOUR_STEP_FILLS, TOUR_STEP_LABELS } from "./welcomeTour.data";
import {
  TourWelcome,
  TourProfile,
  TourInterests,
  TourCommunities,
  TourConnections,
  TourExplore,
} from "./WelcomeTourSteps";
import styles from "./WelcomeTourPage.module.css";

/**
 * Faithful port of the original `QueerPulse Welcome.html` — a six-step guided
 * welcome (vouch → profile → interests → communities → connections → explore).
 * Distinct from the OnboardingPage flow at /welcome.
 */
export function WelcomeTourPage() {
  const [step, setStep] = useState(1);

  function go(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={styles.root}>
      <nav className={styles.topNav}>
        <Link to={routes.homepage} className={styles.brand}>
          <span className={styles.pulseDot} aria-hidden />
          Queer<em>Pulse</em>
        </Link>
        <Link to={routes.homepage} className={styles.skip}>
          Skip setup →
        </Link>
      </nav>

      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.progress}>
            <div className={styles.bar}>
              <div
                className={styles.fill}
                style={{ width: TOUR_STEP_FILLS[step - 1] }}
              />
            </div>
            <div className={styles.stepsLabel}>
              {TOUR_STEP_LABELS[step - 1]}
            </div>
          </div>

          <div key={step} className={styles.step}>
            {step === 1 && <TourWelcome onNext={() => go(2)} />}
            {step === 2 && (
              <TourProfile onNext={() => go(3)} onBack={() => go(1)} />
            )}
            {step === 3 && (
              <TourInterests onNext={() => go(4)} onBack={() => go(2)} />
            )}
            {step === 4 && (
              <TourCommunities onNext={() => go(5)} onBack={() => go(3)} />
            )}
            {step === 5 && (
              <TourConnections onNext={() => go(6)} onBack={() => go(4)} />
            )}
            {step === 6 && <TourExplore />}
          </div>
        </div>
      </div>
    </div>
  );
}
