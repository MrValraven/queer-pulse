import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './OnboardingPage.module.css';
import { STEP_LABELS } from './onboardingPage.data';
import { StepIntro, StepWelcome, StepPhoto, StepNorms, StepIntents, StepCommunities, StepDone } from './OnboardingSteps';

export function OnboardingPage() {
  // Step 0 is the warm "let's begin" intro; steps 1–6 are the real flow.
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');

  const progress = step === 0 ? 0 : Math.max(((step - 1) / 5) * 100, 4);
  const label = step === 0 ? 'Getting started' : STEP_LABELS[step - 1];

  function go(next: number) {
    setDir(next >= step ? 'fwd' : 'back');
    setStep(next);
    window.scrollTo(0, 0);
  }

  return (
    <div className={styles.root}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.progressLabel}>{label}</div>
      <Link to="/" className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        Queer<em>Pulse</em>
      </Link>

      <div className={styles.page}>
        <div className={`${styles.card} ${dir === 'back' ? styles.cardBack : styles.cardFwd}`} key={step}>
          {step === 0 && <StepIntro onNext={() => go(1)} />}
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
