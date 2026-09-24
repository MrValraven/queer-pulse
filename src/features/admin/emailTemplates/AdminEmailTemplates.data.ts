import type { EmailTemplateAdminDTO } from "./emailTemplate.types";

/**
 * Demo-mode library. The welcome template mirrors the backend seed
 * (`queerpulse-backend/src/email-templates/email-templates.seed.ts`) word for
 * word, so demo and live show the same starter email.
 */
export const EMAIL_TEMPLATES_DEMO: EmailTemplateAdminDTO[] = [
  {
    id: "demo-email-template-welcome",
    label: "Welcome: invite approved",
    purpose: "invite_approved",
    sortOrder: 0,
    isActive: true,
    createdByUserId: null,
    updatedByUserId: null,
    createdAt: "2026-09-24T09:00:00.000Z",
    updatedAt: "2026-09-24T09:00:00.000Z",
    locales: {
      en: {
        subject: "Your QueerPulse invite is ready",
        mode: "blocks",
        html: null,
        blocks: [
          {
            id: "welcome-en-heading",
            type: "heading",
            level: 1,
            text: "Welcome to QueerPulse, {name}",
          },
          {
            id: "welcome-en-intro",
            type: "paragraph",
            text: "Thanks for asking to join. We read your request and we would love to have you here.",
          },
          {
            id: "welcome-en-button",
            type: "button",
            label: "Join QueerPulse",
            href: "{inviteLink}",
          },
          {
            id: "welcome-en-expiry",
            type: "paragraph",
            text: "This link is yours alone and works until {expiresOn}. If it runs out before you get to it, reply to this email and we will send a fresh one.",
          },
          {
            id: "welcome-en-signoff",
            type: "paragraph",
            text: "See you inside,\nThe QueerPulse team",
          },
        ],
      },
      pt: {
        subject: "O teu convite para o QueerPulse está pronto",
        mode: "blocks",
        html: null,
        blocks: [
          {
            id: "welcome-pt-heading",
            type: "heading",
            level: 1,
            text: "Bem-vinde ao QueerPulse, {name}",
          },
          {
            id: "welcome-pt-intro",
            type: "paragraph",
            text: "Obrigado por pedires para entrar. Lemos o teu pedido e adorávamos ter-te cá.",
          },
          {
            id: "welcome-pt-button",
            type: "button",
            label: "Entrar no QueerPulse",
            href: "{inviteLink}",
          },
          {
            id: "welcome-pt-expiry",
            type: "paragraph",
            text: "Este link é só teu e funciona até {expiresOn}. Se expirar antes de o usares, responde a este email e enviamos-te um novo.",
          },
          {
            id: "welcome-pt-signoff",
            type: "paragraph",
            text: "Até já,\nA equipa QueerPulse",
          },
        ],
      },
    },
  },
];
