import { useState } from "react";
import { FiCheckCircle, FiPlus, FiXCircle } from "react-icons/fi";
import { Button, FormField, Modal, Select } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminPageHeader } from "./ui";
import {
  useAdminGovernanceProposalsList,
  useCreateGovernanceProposal,
} from "./api/useAdminGovernanceProposals";
import type {
  GovernanceProposalDTO,
  GovernanceProposalType,
} from "../governance/api/governanceProposals.api";
import styles from "./AdminGovernancePage.module.css";

const PROPOSAL_TYPES: GovernanceProposalType[] = [
  "council_removal",
  "funding_change",
];

function ProposalCreateForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const create = useCreateGovernanceProposal();

  const [type, setType] = useState<GovernanceProposalType>("council_removal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetMemberId, setTargetMemberId] = useState("");
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");

  const onSave = () => {
    const missingTarget = type === "council_removal" && !targetMemberId.trim();
    if (
      !title.trim() ||
      !description.trim() ||
      !opensAt ||
      !closesAt ||
      missingTarget
    ) {
      showToast(t("admin:governance.proposals.form.validation"), "error");
      return;
    }
    create.mutate(
      {
        type,
        title: title.trim(),
        description: description.trim(),
        opensAt: new Date(opensAt).toISOString(),
        closesAt: new Date(closesAt).toISOString(),
        ...(type === "council_removal"
          ? { targetMemberId: targetMemberId.trim() }
          : {}),
      },
      {
        onSuccess: () => {
          showToast(t("admin:governance.proposals.form.saved"), "success");
          onClose();
        },
        onError: () => {
          showToast(t("admin:governance.proposals.form.error"), "error");
        },
      },
    );
  };

  return (
    <Modal
      onClose={onClose}
      eyebrow={t("admin:governance.proposals.form.eyebrow")}
      title={
        <Translation
          i18nKey="admin:governance.proposals.form.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("admin:governance.proposals.form.sub")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={create.isPending}>
            {t("admin:governance.proposals.form.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={create.isPending}
          >
            {t("admin:governance.proposals.form.save")}
          </Button>
        </>
      }
    >
      <FormField label={t("admin:governance.proposals.form.field.type")}>
        <Select
          value={type}
          onChange={(value) =>
            setType((value as GovernanceProposalType) ?? "council_removal")
          }
          options={PROPOSAL_TYPES.map((option) => ({
            value: option,
            label: t(`admin:governance.proposals.form.field.type.${option}`),
          }))}
        />
      </FormField>
      <FormField label={t("admin:governance.proposals.form.field.title")}>
        <input
          type="text"
          value={title}
          maxLength={200}
          onChange={(event) => setTitle(event.target.value)}
        />
      </FormField>
      <FormField label={t("admin:governance.proposals.form.field.description")}>
        <textarea
          rows={4}
          value={description}
          maxLength={2000}
          onChange={(event) => setDescription(event.target.value)}
        />
      </FormField>
      {type === "council_removal" && (
        <FormField
          label={t("admin:governance.proposals.form.field.targetMemberId")}
          helper={t("admin:governance.proposals.form.field.targetMemberIdHint")}
        >
          <input
            type="text"
            value={targetMemberId}
            placeholder="00000000-0000-0000-0000-000000000000"
            onChange={(event) => setTargetMemberId(event.target.value)}
          />
        </FormField>
      )}
      <div className={styles.editGrid}>
        <FormField label={t("admin:governance.proposals.form.field.opensAt")}>
          <input
            type="datetime-local"
            value={opensAt}
            onChange={(event) => setOpensAt(event.target.value)}
          />
        </FormField>
        <FormField label={t("admin:governance.proposals.form.field.closesAt")}>
          <input
            type="datetime-local"
            value={closesAt}
            onChange={(event) => setClosesAt(event.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  );
}

function ProposalRow({ proposal }: { proposal: GovernanceProposalDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { tally, status } = proposal;
  const hasPassed = status === "passed";

  return (
    <div className={[styles.card, styles.proposalAdminCard].join(" ")}>
      <div className={styles.proposalAdminHead}>
        <h3 className={styles.cardTitle}>{proposal.title}</h3>
        {status !== "open" && (
          <span
            className={
              hasPassed
                ? styles.proposalStatusPassed
                : styles.proposalStatusFailed
            }
          >
            {hasPassed ? (
              <FiCheckCircle aria-hidden />
            ) : (
              <FiXCircle aria-hidden />
            )}{" "}
            {t(`admin:governance.proposals.list.status.${status}`)}
          </span>
        )}
      </div>
      <p className={styles.cardSub}>
        {t(`admin:governance.proposals.list.type.${proposal.type}`)}
      </p>
      <p className={styles.cardSub}>{proposal.description}</p>
      <p className={styles.cardSub}>
        {t("admin:governance.proposals.list.tally", {
          forCount: tally.for,
          againstCount: tally.against,
          forPercent: tally.forPercent,
        })}
      </p>
      <p className={styles.cardSub}>
        {status === "open"
          ? t("admin:governance.proposals.list.closes", {
              date: fmt.date(new Date(proposal.closesAt)),
            })
          : t("admin:governance.proposals.list.closedOn", {
              date: fmt.date(new Date(proposal.closesAt)),
            })}
      </p>
    </div>
  );
}

export function AdminGovernanceProposals() {
  const { t } = useTranslation();
  const { proposals, loading } = useAdminGovernanceProposalsList();
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <AdminPageHeader
        eyebrow={t("admin:governance.proposals.header.eyebrow")}
        title={
          <Translation
            i18nKey="admin:governance.proposals.header.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("admin:governance.proposals.header.sub")}
        actions={
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <FiPlus aria-hidden /> {t("admin:governance.proposals.createCta")}
          </Button>
        }
      />
      <div className={styles.proposalAdminList}>
        {loading ? (
          <p className={styles.cardSub}>…</p>
        ) : proposals.length === 0 ? (
          <p className={styles.cardSub}>
            {t("admin:governance.proposals.empty")}
          </p>
        ) : (
          proposals.map((proposal) => (
            <ProposalRow key={proposal.id} proposal={proposal} />
          ))
        )}
      </div>
      {showForm && <ProposalCreateForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
