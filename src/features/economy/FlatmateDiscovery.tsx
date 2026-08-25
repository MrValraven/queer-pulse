import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheck,
  FiClock,
  FiHeart,
  FiHome,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useFlatmateDecision } from "./api/useFlatmateDecision";
import { FlatmateIdentityTags } from "./FlatmateIdentityTags";
import { FlatmateMatchReasons } from "./FlatmateMatchReasons";
import { SayHelloModal } from "./SayHelloModal";
import { VerificationBadge } from "./VerificationBadge";
import { demoWouldMatch, type Profile } from "./flatmates.data";
import styles from "./FlatmatesPage.module.css";

/**
 * Opt-in discovery deck: one profile at a time with a considered like/pass. It's
 * "find a flatmate", not a dating carousel — same gated match score/reasons as
 * the board, no streaks, no urgency. A mutual like is the only thing that
 * unlocks a hello.
 */
export function FlatmateDiscovery({
  profiles,
  onSayHello,
}: {
  profiles: Profile[];
  onSayHello: (profileId: number) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const decision = useFlatmateDecision();
  const [index, setIndex] = useState(0);
  const [matched, setMatched] = useState<Profile | null>(null);
  const [helloFor, setHelloFor] = useState<Profile | null>(null);

  const current = profiles[index];
  const advance = () => setIndex((previous) => previous + 1);

  const decide = (verdict: "like" | "pass") => {
    if (!current || decision.isPending) return;
    decision.mutate(
      {
        slug: current.profileSlug,
        decision: verdict,
        demoMatched: demoMode && demoWouldMatch(current),
      },
      {
        onSuccess: (result) => {
          if (result.matched) setMatched(current);
          else advance();
        },
        onError: () =>
          showToast(t("economy:flatmates.discovery.error"), "error"),
      },
    );
  };

  if (helloFor) {
    return (
      <SayHelloModal
        profile={helloFor}
        onSent={() => onSayHello(helloFor.id)}
        onClose={() => {
          setHelloFor(null);
          setMatched(null);
          advance();
        }}
      />
    );
  }

  if (matched) {
    return (
      <div className={styles.discoveryMatch}>
        <div className={styles.discoveryMatchIcon}>
          <FiHeart aria-hidden />
        </div>
        <h3>
          <Translation
            i18nKey="economy:flatmates.discovery.matchTitle"
            values={{ name: matched.name }}
            components={{ em: <em /> }}
          />
        </h3>
        <p>
          {t("economy:flatmates.discovery.matchBody", { name: matched.name })}
        </p>
        <div className={styles.discoveryMatchActions}>
          <Button
            type="button"
            variant="jade"
            onClick={() => setHelloFor(matched)}
          >
            {t("economy:flatmates.discovery.sayHello")}
          </Button>
          <Button
            type="button"
            variant="ghost-dark"
            onClick={() => {
              setMatched(null);
              advance();
            }}
          >
            {t("economy:flatmates.discovery.keepBrowsing")}
          </Button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <EmptyState
        className={styles.empty}
        icon={<FiHome />}
        title={t("economy:flatmates.discovery.doneTitle")}
        description={t("economy:flatmates.discovery.doneBody")}
      />
    );
  }

  return (
    <div className={styles.discoveryDeck}>
      <p className={styles.discoveryProgress}>
        {t("economy:flatmates.discovery.progress", {
          current: index + 1,
          total: profiles.length,
        })}
      </p>
      <DiscoveryCard profile={current} />
      <div className={styles.discoveryActions}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => decide("pass")}
          disabled={decision.isPending}
        >
          <FiX aria-hidden /> {t("economy:flatmates.discovery.pass")}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => decide("like")}
          disabled={decision.isPending}
        >
          <FiCheck aria-hidden /> {t("economy:flatmates.discovery.like")}
        </Button>
      </div>
    </div>
  );
}

/** The single-profile presentation inside the deck — the same content as a board
 * card, laid out for one-at-a-time reading. */
function DiscoveryCard({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  return (
    <article className={styles.discoveryCard}>
      <div className={styles.cardTop}>
        <Avatar
          initials={profile.initials}
          tint={profile.tint}
          src={profile.photo}
          alt={profile.name}
          verified={profile.verificationLevel === "id_verified"}
          size={64}
        />
        <div className={styles.identity}>
          <span className={styles.nameRow}>
            <Link to={`/members/${profile.slug}`} className={styles.name}>
              {profile.name}
            </Link>
            <MemberStaffBadge slug={profile.slug} />
            <VerificationBadge level={profile.verificationLevel} size="sm" />
            {profile.matchScore != null && (
              <span className={styles.matchBadge}>
                {t("economy:flatmates.card.matchScore", {
                  score: profile.matchScore,
                })}
              </span>
            )}
          </span>
          <div className={styles.pronouns}>
            {[profile.pronouns, profile.genderIdentity]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
      </div>
      <div className={styles.details}>
        <span className={styles.detail}>
          <FiMapPin /> {profile.neighbourhoodLabel}
        </span>
        <span className={styles.detail}>
          <FiClock /> {profile.movein}
        </span>
        <span className={styles.detail}>{profile.budget}</span>
      </div>
      <p className={styles.note}>{profile.note}</p>
      <FlatmateMatchReasons profile={profile} />
      <FlatmateIdentityTags profile={profile} />
      <div className={styles.tags}>
        {profile.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
