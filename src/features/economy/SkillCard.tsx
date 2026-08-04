import { FiArrowRight } from "react-icons/fi";
import {
  Avatar,
  SkeletonAvatar,
  SkeletonLine,
  Tag,
  TagRow,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { activateOnKey } from "../../shared/lib/activateOnKey";
import { useMemberContact } from "../connect/useMemberContact";
import { memberProfiles } from "../members/data/memberProfiles";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { Skill } from "./skills.data";
import styles from "./SkillsPage.module.css";

export function SkillCard({ skill }: { skill: Skill }) {
  const { t } = useTranslation();
  const member = memberProfiles[skill.member]!;
  const { connected, contact } = useMemberContact(skill.member);
  const reachOut = () =>
    contact({ slug: skill.member, name: `${member.first} ${member.last}` });
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <Avatar initials={member.initials} tint={member.tint} size={40} />
        <span className={[styles.skType, styles[skill.type]].join(" ")}>
          {skill.type === "offering"
            ? t("economy:skills.card.teaching")
            : t("economy:skills.card.learning")}
        </span>
      </div>
      <div>
        <div className={styles.skill}>{skill.skill}</div>
        <div className={styles.nameRow}>
          <div className={styles.name}>
            {member.first} {member.last}
          </div>
          <MemberStaffBadge slug={skill.member} />
        </div>
      </div>
      <div className={styles.desc}>{skill.description}</div>
      <TagRow>
        {skill.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </TagRow>
      <div className={styles.foot}>
        <span className={styles.hood}>{member.hood}</span>
        <span
          role="button"
          tabIndex={0}
          className={styles.reach}
          onClick={reachOut}
          onKeyDown={(event) => activateOnKey(event, reachOut)}
        >
          {connected ? (
            t("connect:contact.message")
          ) : (
            <>
              Reach out <FiArrowRight aria-hidden />
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export function SkillSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.cardTop}>
        <SkeletonAvatar size={40} />
        <SkeletonLine width={72} height={22} style={{ borderRadius: 6 }} />
      </div>
      <div>
        <SkeletonLine width="80%" height={20} />
        <SkeletonLine width="45%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div>
        <SkeletonLine width="100%" height={13} />
        <SkeletonLine width="90%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div className={styles.tags}>
        <SkeletonLine width={64} height={22} style={{ borderRadius: 6 }} />
        <SkeletonLine width={78} height={22} style={{ borderRadius: 6 }} />
      </div>
      <div className={styles.foot}>
        <SkeletonLine width={80} height={13} />
        <SkeletonLine width={80} height={13} />
      </div>
    </div>
  );
}
