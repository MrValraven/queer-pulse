import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './OnboardingPage.module.css';
import { STEP_LABELS } from './onboardingPage.data';
import { StepWelcome, StepPhoto, StepNorms, StepIntents, StepCommunities, StepDone } from './OnboardingSteps';

export function OnboardingPage() {
  const [step, setStep] = useState(1);

  const progress = Math.max(((step - 1) / 5) * 100, 4);

  function go(next: number) {
    setStep(next);
    window.scrollTo(0, 0);
  }

  return (
    <div className={styles.root}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.progressLabel}>{STEP_LABELS[step - 1]}</div>
      <Link to="/" className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        Queer<em>Pulse</em>
      </Link>

      <div className={styles.page}>
        <div className={styles.card} key={step}>
          {step === 1 && <StepWelcome onNext={() => go(2)} />}
          {step === 2 && <StepPhoto onNext={() => go(3)} onBack={() => go(1)} />}
          {step === 3 && <StepNorms onNext={() => go(4)} onBack={() => go(2)} />}
          {step === 4 && <StepIntents onNext={() => go(5)} onBack={() => go(3)} />}
          {step === 5 && <StepCommunities onNext={() => go(6)} onBack={() => go(4)} />}
          {step === 6 && <StepDone />}
        </div>
      </div>
    </div>
  );
}
