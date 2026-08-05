import { PageShell } from "../../shared/components/layout";
import { Button, ImageSlot, Outro, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { EQUIPMENT, CARE_KEYS } from "./sharedEquipment.data";
import styles from "./resources.module.css";

export function SharedEquipmentPage() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const pageTitle = t("resources:sharedEquipment.meta.title");
  const pageDescription = t("resources:sharedEquipment.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/shared-equipment" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:sharedEquipment.hero.eyebrow")}
        eyebrowDotColor="var(--accent)"
        title={
          <Translation
            i18nKey="resources:sharedEquipment.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:sharedEquipment.hero.lead")}
        anchors={[
          {
            label: t("resources:sharedEquipment.hero.anchor.kit"),
            href: "#kit",
          },
          {
            label: t("resources:sharedEquipment.hero.anchor.care"),
            href: "#care",
          },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="kit">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:sharedEquipment.kit.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:sharedEquipment.kit.lead")}
          </Reveal>
          {/* The lending inventory (availability / "on loan" status + request
              slots) is prototype fiction. Live mode has no equipment registry
              yet, so it shows an honest coming-soon note instead of fake stock. */}
          {!demoMode ? (
            <Reveal as="p" className={styles.leadP}>
              {t("resources:sharedEquipment.kit.live.body")}
            </Reveal>
          ) : (
          <div className={styles.grid}>
            {EQUIPMENT.map((item, i) => {
              const name = t(item.nameKey);
              return (
                <Reveal
                  key={item.nameKey}
                  className={styles.card}
                  delay={i * 55}
                >
                  <ImageSlot tint={item.tint} placeholder={name} height={160} />
                  <div
                    className={styles.cardName}
                    style={{ fontSize: 19, marginTop: 4 }}
                  >
                    {name}
                  </div>
                  <div className={styles.cardSpec}>{t(item.specsKey)}</div>
                  <div className={styles.cardFoot}>
                    <span className={styles.cardLoc}>{t(item.statusKey)}</span>
                    <Button
                      variant={item.available ? "jade" : "ghost"}
                      disabled={!item.available}
                      onClick={() =>
                        showToast(
                          demoMode
                            ? t("resources:sharedEquipment.requestToast", {
                                name,
                              })
                            : t("resources:sharedEquipment.requestLiveToast"),
                        )
                      }
                    >
                      {item.available
                        ? t("resources:sharedEquipment.requestSlotCta")
                        : t("resources:sharedEquipment.onLoanCta")}
                    </Button>
                  </div>
                </Reveal>
              );
            })}
          </div>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="care">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:sharedEquipment.care.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <div className={styles.checklist}>
            {CARE_KEYS.map((careKey) => (
              <Reveal
                key={careKey}
                className={styles.checkItem}
                style={{ gridTemplateColumns: "1fr" }}
              >
                <div className={styles.cardSpec} style={{ flex: "none" }}>
                  {t(careKey)}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:sharedEquipment.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:sharedEquipment.outro.sub")}
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          {t("resources:sharedEquipment.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
