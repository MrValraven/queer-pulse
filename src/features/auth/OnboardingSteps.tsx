import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { Button, ImageSlot } from '../../shared/components/ui';
import { routes } from '../../app/routeMap';
import { currentUser, getMember } from '../members/data/members';
import { NORMS, INTENTS, COMMUNITIES_LIST, QUICK_STARTS, ONBOARDING_PREVIEW } from './onboardingPage.data';
import styles from './OnboardingPage.module.css';

const INVITER = getMember('ines')!;
const INVITER_NAME = `${INVITER.first} ${INVITER.last}`;
const INVITER_ROLE = INVITER.role.split(' · ')[0];

interface StepProps {
  stepLabel: string;
  onNext: () => void;
  onBack: () => void;
}

/** A clearly-styled "skip for now" affordance for non-critical steps. */
function SkipLink({ onSkip, label = 'Skip for now — you can add this later' }: { onSkip: () => void; label?: string }) {
  return (
    <button type="button" className={styles.skip} onClick={onSkip}>
      {label} <FiArrowRight aria-hidden />
    </button>
  );
}

export function StepIntro({ stepLabel, onNext }: { stepLabel: string; onNext: () => void }) {
  return (
    <>
      <div className={styles.eye}>{stepLabel} · Welcome to QueerPulse</div>
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

export function StepWelcome({ stepLabel, onNext }: { stepLabel: string; onNext: () => void }) {
  return (
    <>
      <div className={styles.checkWrap}>
        <svg viewBox="0 0 72 72" width={72} height={72}>
          <circle className={styles.checkCircle} cx={36} cy={36} r={33} />
          <path className={styles.checkMark} d="M22 36l10.5 11.5L50 24" />
        </svg>
      </div>
      <div className={styles.eye}>{stepLabel} · You're in</div>
      <div className={styles.h}>
        Welcome, <em>{currentUser.first}</em>
      </div>
      <div className={styles.vouchCard}>
        <div className={styles.vcAv} aria-hidden>
          {INVITER.photo ? (
            <img
              src={INVITER.photo}
              alt=""
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            INVITER.initials
          )}
        </div>
        <div>
          <div className={styles.vcName}>{INVITER_NAME}</div>
          <div className={styles.vcRole}>Member since {INVITER.since} · {INVITER_ROLE}</div>
          <div className={styles.vcNote}>
            "{currentUser.first} is exactly the kind of person this community was built for — thoughtful,
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

export function StepPhoto({ stepLabel, onNext, onBack }: StepProps) {
  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
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
        <SkipLink onSkip={onNext} />
        <button className={styles.back} onClick={onBack}>← Back</button>
      </div>
    </>
  );
}

export function StepNorms({ stepLabel, onNext, onBack }: StepProps) {
  const [agreed, setAgreed] = useState(false);
  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
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
          I've read and agree to the <Link to={routes.guidelines}>Community Guidelines</Link>
        </span>
      </label>
      <div className={styles.nav}>
        <Button onClick={onNext} disabled={!agreed}>I agree, continue</Button>
        <button className={styles.back} onClick={onBack}>← Back</button>
      </div>
    </>
  );
}

export function StepIntents({ stepLabel, onNext, onBack }: StepProps) {
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
  // At least one intent is required so we can actually personalize the experience.
  const hasSelection = selectedIntents.size > 0;
  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h}>
        What brings you <em>here?</em>
      </div>
      <div className={styles.chipHint}>Pick at least one — choose as many as fit.</div>
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
        <Button onClick={onNext} disabled={!hasSelection}>Continue</Button>
        <button className={styles.back} onClick={onBack}>← Back</button>
      </div>
    </>
  );
}

export function StepCommunities({ stepLabel, onNext, onBack }: StepProps) {
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
      <div className={styles.eye}>{stepLabel}</div>
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
                {isJoined ? <><FiCheck /> Joined</> : 'Join'}
              </button>
            </div>
          );
        })}
      </div>
      <div className={styles.nav}>
        <Button onClick={onNext}>Continue</Button>
        <SkipLink onSkip={onNext} label="Skip for now — explore and join later" />
        <button className={styles.back} onClick={onBack}>← Back</button>
      </div>
    </>
  );
}

export function StepDone({ stepLabel }: { stepLabel: string }) {
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h}>
        You're <em>part of it</em> now
      </div>
      <div className={styles.quickStart}>
        {QUICK_STARTS.map((qs) => (
          <Link key={qs.to} to={qs.to} className={styles.qsCard}>
            <span className={styles.qsIcon} style={{ background: qs.iconBg }}><qs.icon /></span>
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
