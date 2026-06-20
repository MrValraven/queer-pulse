import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, ImageSlot } from '../../shared/components/ui';
import { NORMS, INTENTS, COMMUNITIES_LIST, QUICK_STARTS, ONBOARDING_PREVIEW } from './onboardingPage.data';
import styles from './OnboardingPage.module.css';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepIntro({ onNext }: { onNext: () => void }) {
  return (
    <>
      <div className={styles.eye}>Welcome to QueerPulse</div>
      <div className={styles.h}>
        Let's start your <em>onboarding</em>
      </div>
      <div className={styles.p}>
        A few quick steps to set up your profile and find your people. It takes about two minutes —
        and you can change anything later.
      </div>
      <div className={styles.normCards}>
        {ONBOARDING_PREVIEW.map((item) => (
          <div key={item.title} className={styles.normCard}>
            <div className={styles.ncDot} />
            <div>
              <div className={styles.ncTitle}>{item.title}</div>
              <div className={styles.ncDesc}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.nav}>
        <Button onClick={onNext}>Let's begin</Button>
      </div>
    </>
  );
}

export function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <>
      <div className={styles.checkWrap}>
        <svg viewBox="0 0 72 72" width={72} height={72}>
          <circle className={styles.checkCircle} cx={36} cy={36} r={33} />
          <path className={styles.checkMark} d="M22 36l10.5 11.5L50 24" />
        </svg>
      </div>
      <div className={styles.eye}>You're in</div>
      <div className={styles.h}>
        Welcome, <em>Sofia</em>
      </div>
      <div className={styles.vouchCard}>
        <div className={styles.vcAv}>TM</div>
        <div>
          <div className={styles.vcName}>Tomás Mendes</div>
          <div className={styles.vcRole}>Member since Oct 2024 · Architect</div>
          <div className={styles.vcNote}>
            "Sofia is exactly the kind of person this community was built for — thoughtful,
            creative, and genuinely invested in making queer spaces better."
          </div>
        </div>
      </div>
      <div className={styles.p}>
        QueerPulse is a cared-for professional network rooted in Lisbon. You were invited
        because someone here knows your worth.
      </div>
      <div className={styles.nav}>
        <Button onClick={onNext}>Let's get started</Button>
      </div>
    </>
  );
}

export function StepPhoto({ onNext, onBack }: StepProps) {
  return (
    <>
      <div className={styles.eye}>Step 2 of 6</div>
      <div className={styles.h}>
        Put a face to the <em>name</em>
      </div>
      <div className={styles.p}>
        A photo helps members feel comfortable connecting with you. You can always add this later.
      </div>
      <div className={styles.photoWrap}>
        <ImageSlot shape="circle" tint="coral" width={130} height={130} placeholder="your photo" initials="S" />
        <div style={{ fontSize: 13, color: 'var(--ink-40)', marginTop: 10 }}>
          Drag a photo here, or click to upload
        </div>
      </div>
      <div className={styles.nav}>
        <Button onClick={onNext}>Continue</Button>
        <button className={styles.skip} onClick={onNext}>Skip for now</button>
        <button className={styles.back} onClick={onBack}>← Back</button>
      </div>
    </>
  );
}

export function StepNorms({ onNext, onBack }: StepProps) {
  const [agreed, setAgreed] = useState(false);
  return (
    <>
      <div className={styles.eye}>Step 3 of 6</div>
      <div className={styles.h}>
        This is a <em>cared-for</em> space
      </div>
      <div className={styles.normCards}>
        {NORMS.map((norm) => (
          <div key={norm.title} className={styles.normCard}>
            <div className={styles.ncDot} />
            <div>
              <div className={styles.ncTitle}>{norm.title}</div>
              <div className={styles.ncDesc}>{norm.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <label className={styles.agreeRow}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span className={styles.agreeLabel}>
          I've read and agree to the <Link to="/guidelines">Community Guidelines</Link>
        </span>
      </label>
      <div className={styles.nav}>
        <Button onClick={onNext} disabled={!agreed}>I agree, continue</Button>
        <button className={styles.back} onClick={onBack}>← Back</button>
      </div>
    </>
  );
}

export function StepIntents({ onNext, onBack }: StepProps) {
  const [selectedIntents, setSelectedIntents] = useState<Set<string>>(
    new Set(['Community', 'Professional connections', 'Creative collaboration']),
  );
  function toggleIntent(intent: string) {
    setSelectedIntents((current) => {
      const next = new Set(current);
      if (next.has(intent)) next.delete(intent);
      else next.add(intent);
      return next;
    });
  }
  return (
    <>
      <div className={styles.eye}>Step 4 of 6</div>
      <div className={styles.h}>
        What brings you <em>here?</em>
      </div>
      <div className={styles.chipHint}>Select as many as you like</div>
      <div className={styles.chips}>
        {INTENTS.map((intent) => (
          <button
            key={intent}
            className={[styles.chip, selectedIntents.has(intent) && styles.chipSelected].filter(Boolean).join(' ')}
            onClick={() => toggleIntent(intent)}
          >
            {intent}
          </button>
        ))}
      </div>
      <div className={styles.nav}>
        <Button onClick={onNext}>Continue</Button>
        <button className={styles.back} onClick={onBack}>← Back</button>
      </div>
    </>
  );
}

export function StepCommunities({ onNext, onBack }: StepProps) {
  const [joined, setJoined] = useState<Set<string>>(new Set(['cc1']));
  function toggleJoin(id: string) {
    setJoined((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  return (
    <>
      <div className={styles.eye}>Step 5 of 6</div>
      <div className={styles.h}>
        Find your <em>communities</em>
      </div>
      <div className={styles.p} style={{ marginBottom: 20 }}>
        Groups you might like based on your interests.
      </div>
      <div className={styles.communityGrid}>
        {COMMUNITIES_LIST.map((community) => {
          const isJoined = joined.has(community.id);
          return (
            <div
              key={community.id}
              className={[styles.commCard, isJoined && styles.commJoined].filter(Boolean).join(' ')}
            >
              <div className={styles.ccName}>{community.name}</div>
              <div className={styles.ccCount}>{community.count}</div>
              <div className={styles.ccDesc}>{community.desc}</div>
              <button
                className={[styles.ccJoin, isJoined && styles.ccJoinActive].filter(Boolean).join(' ')}
                onClick={() => toggleJoin(community.id)}
              >
                {isJoined ? '✓ Joined' : 'Join'}
              </button>
            </div>
          );
        })}
      </div>
      <div className={styles.nav}>
        <Button onClick={onNext}>Continue</Button>
        <button className={styles.skip} onClick={onNext}>Skip for now</button>
        <button className={styles.back} onClick={onBack}>← Back</button>
      </div>
    </>
  );
}

export function StepDone() {
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.h}>
        You're <em>part of it</em> now
      </div>
      <div className={styles.quickStart}>
        {QUICK_STARTS.map((qs) => (
          <Link key={qs.to} to={qs.to} className={styles.qsCard}>
            <span className={styles.qsIcon} style={{ background: qs.iconBg }}>{qs.icon}</span>
            <div className={styles.qsBody}>
              <div className={styles.qsTitle}>{qs.title}</div>
              <div className={styles.qsDesc}>{qs.desc}</div>
            </div>
            <span className={styles.qsArrow}>→</span>
          </Link>
        ))}
      </div>
      <div className={styles.nav}>
        <Button onClick={() => navigate('/feed')}>Go to my home</Button>
      </div>
    </>
  );
}
