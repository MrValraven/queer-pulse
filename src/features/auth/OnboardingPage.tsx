import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './OnboardingPage.module.css';
import { TOTAL_STEPS } from './onboardingPage.data';
import { StepIntro, StepWelcome, StepPhoto, StepNorms, StepIntents, StepCommunities, StepDone } from './OnboardingSteps';

export function OnboardingPage() {
  // Seven steps in total, indexed 0–6. Step 0 is the warm "let's begin" intro,
  // counted as Step 1 so the "Step X of N" label is honest and continuous.
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');

  // Linear progress: each of the TOTAL_STEPS advances the bar by an equal share.
  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const stepLabel = `Step ${step + 1} of ${TOTAL_STEPS}`;

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
      <div className={styles.progressLabel}>{stepLabel}</div>
      <Link to="/" className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        Queer<em>Pulse</em>
      </Link>

      <div className={styles.page}>
        <div className={`${styles.card} ${dir === 'back' ? styles.cardBack : styles.cardFwd}`} key={step}>
          {step === 0 && <StepIntro stepLabel={stepLabel} onNext={() => go(1)} />}
          {step === 1 && <StepWelcome stepLabel={stepLabel} onNext={() => go(2)} />}
          {step === 2 && <StepPhoto stepLabel={stepLabel} onNext={() => go(3)} onBack={() => go(1)} />}
          {step === 3 && <StepNorms stepLabel={stepLabel} onNext={() => go(4)} onBack={() => go(2)} />}
          {step === 4 && <StepIntents stepLabel={stepLabel} onNext={() => go(5)} onBack={() => go(3)} />}
          {step === 5 && <StepCommunities stepLabel={stepLabel} onNext={() => go(6)} onBack={() => go(4)} />}
          {step === 6 && <StepDone stepLabel={stepLabel} />}
        </div>
      </div>
    </div>
  );
}
