import { useState, type FormEvent } from "react";
import { Button, FormField } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import type { AccessTier, CreateSubcommunityBody } from "./api/communities.api";
import { useCreateSubcommunity } from "./api/useCreateSubcommunity";
import { slugify } from "./startCommunity/startCommunity.data";
import { isTierSelectable, TIER_ORDER } from "./spaceTierOptions";
import { SpaceRulesField } from "./SpaceRulesField";
import styles from "./CreateSpaceForm.module.css";

/** Catalog key for each tier's short name, shared with `AccessTierBadge`. */
const TIER_NAME_KEY: Record<AccessTier, string> = {
  public: "communities:badges.tier.public",
  request: "communities:badges.tier.request",
  invite: "communities:badges.tier.invite",
  private: "communities:badges.tier.private",
};

interface CreateSpaceFormProps {
  parentSlug: string;
  parentName: string;
  /** The parent's own tier: a space may never sit more open than it. */
  parentTier: AccessTier;
  /** Called with the new space's slug once the server confirms it exists. */
  onCreated: (slug: string) => void;
}

/**
 * Founds a space under `parentSlug`, mirroring the fields `StartCommunity`
 * collects across a whole wizard, in one pane a moderator fills top to
 * bottom. `rules` here are the space's own additions; the parent's rules
 * inherit down automatically and are never re-typed here.
 */
export function CreateSpaceForm({
  parentSlug,
  parentName,
  parentTier,
  onCreated,
}: CreateSpaceFormProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const create = useCreateSubcommunity(parentSlug);

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [tagline, setTagline] = useState("");
  const [purpose, setPurpose] = useState("");
  const [accessTier, setAccessTier] = useState<AccessTier>(parentTier);
  const [rules, setRules] = useState<string[]>([]);

  const reset = () => {
    setName("");
    setHandle("");
    setTagline("");
    setPurpose("");
    setAccessTier(parentTier);
    setRules([]);
  };

  const canSubmit =
    name.trim().length > 0 &&
    handle.trim().length > 0 &&
    tagline.trim().length > 0 &&
    purpose.trim().length > 0 &&
    !create.isPending;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    const body: CreateSubcommunityBody = {
      handle: slugify(handle.trim()),
      name: name.trim(),
      tagline: tagline.trim(),
      purpose: purpose.trim(),
      accessTier,
      rules: rules.map((rule) => rule.trim()).filter((rule) => rule.length > 0),
    };
    create.mutate(body, {
      onSuccess: (detail) => {
        showToast(t("communities:spaces.mod.created"), "success");
        reset();
        onCreated(detail.slug);
      },
      onError: (error) => {
        // The backend suffixes a taken handle itself, so its one 409 here
        // means platform staff turned "Allow spaces" off for this community.
        // No field on the form can fix that, so the toast names the cause.
        if (
          error instanceof ApiError &&
          error.status === 409 &&
          (error.data as { code?: string } | undefined)?.code ===
            "SUBCOMMUNITIES_NOT_ALLOWED"
        ) {
          showToast(t("communities:spaces.mod.notAllowed"), "error");
          return;
        }
        showToast(t("communities:spaces.mod.createError"), "error");
      },
    });
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h3 className={styles.formTitle}>{t("communities:spaces.mod.create")}</h3>

      <FormField label={t("communities:spaces.mod.form.name")} required>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </FormField>

      <FormField label={t("communities:spaces.mod.form.handle")} required>
        <input
          value={handle}
          onChange={(event) => setHandle(slugify(event.target.value))}
        />
      </FormField>

      <FormField label={t("communities:spaces.mod.form.tagline")} required>
        <input
          value={tagline}
          onChange={(event) => setTagline(event.target.value)}
        />
      </FormField>

      <FormField label={t("communities:spaces.mod.form.purpose")} required>
        <textarea
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
        />
      </FormField>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          {t("communities:spaces.mod.form.tier")}
        </legend>
        <div className={styles.tierList}>
          {TIER_ORDER.map((tier) => {
            const isSelectable = isTierSelectable(tier, parentTier);
            const isChecked = accessTier === tier;
            return (
              <label
                key={tier}
                className={[
                  styles.tierOption,
                  isChecked && styles.tierOptionChecked,
                  !isSelectable && styles.tierOptionDisabled,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="space-access-tier"
                  aria-label={t(TIER_NAME_KEY[tier])}
                  value={tier}
                  checked={isChecked}
                  disabled={!isSelectable}
                  onChange={() => setAccessTier(tier)}
                />
                <span className={styles.tierOptionBody}>
                  <span className={styles.tierName}>
                    {t(TIER_NAME_KEY[tier])}
                  </span>
                  {!isSelectable && (
                    <span className={styles.tierLockedHint}>
                      {t("communities:spaces.mod.form.tierLocked", {
                        name: parentName,
                      })}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <SpaceRulesField
        legend={t("communities:spaces.mod.form.rules")}
        hint={t("communities:spaces.mod.form.rulesHint", { name: parentName })}
        rules={rules}
        onChange={setRules}
      />

      <div className={styles.submitRow}>
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {create.isPending
            ? t("communities:common.loading")
            : t("communities:spaces.mod.form.submit")}
        </Button>
      </div>
    </form>
  );
}
