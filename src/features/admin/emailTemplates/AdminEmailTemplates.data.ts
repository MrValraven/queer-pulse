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
        subject: "Your QueerPulse invite is here, {name}",
        preheader: "We're so glad you found us. Your invite is waiting inside.",
        mode: "blocks",
        html: null,
        blocks: [
          {
            id: "welcome-en-hero",
            type: "hero",
            eyebrow: "Your invite is here",
            headline: "Welcome to *QueerPulse*!",
            text: "**Hi {name}!**\nThank you for wanting to be part of this. Someone on our team read your request, and we're genuinely happy you found your way to us.",
          },
          {
            id: "welcome-en-ticket",
            type: "ticket",
            label: "Your invite",
            title: "Valid until {expiresOn}",
            text: "This link is just for you. If it runs out before you get to it, reply to this email and we'll happily send you a fresh one.",
            buttonLabel: "Join QueerPulse",
            href: "{inviteLink}",
          },
          {
            id: "welcome-en-divider",
            type: "divider",
          },
          {
            id: "welcome-en-about",
            type: "paragraph",
            text: "QueerPulse is an invite-only community for queer and trans folks, rooted in Lisbon. It's a place to find your people and share what matters, with no ads and no algorithm deciding what you see.",
          },
          {
            id: "welcome-en-inside",
            type: "heading",
            level: 2,
            text: "What's waiting for you",
          },
          {
            id: "welcome-en-features",
            type: "featureList",
            items: [
              {
                icon: "communities",
                title: "Communities",
                text: "Find your people, from book clubs to run crews, and join conversations that feel like home.",
              },
              {
                icon: "gatherings",
                title: "Gatherings near you",
                text: "Meetups, parties and slow coffees, planned by the community for the community.",
              },
              {
                icon: "directory",
                title: "The local directory",
                text: "Queer-owned and queer-friendly places, recommended by people who've been there.",
              },
            ],
          },
          {
            id: "welcome-en-reply",
            type: "paragraph",
            text: "Questions, nerves, or just want to say hi? Reply to this email. It comes straight to a real person on our team.",
          },
          {
            id: "welcome-en-signature",
            type: "signature",
            name: "The QueerPulse team",
            role: "",
            note: "We can't wait to meet you.",
            photoUrl: "",
          },
        ],
      },
      pt: {
        subject: "O teu convite para o QueerPulse chegou, {name}",
        preheader:
          "Que bom que nos encontraste. O teu convite está à tua espera lá dentro.",
        mode: "blocks",
        html: null,
        blocks: [
          {
            id: "welcome-pt-hero",
            type: "hero",
            eyebrow: "O teu convite chegou",
            headline: "Bem-vinde ao *QueerPulse*!",
            text: "**Olá, {name}!**\nAgradecemos-te por quereres fazer parte disto. Uma pessoa da nossa equipa leu o teu pedido, e ficámos mesmo felizes por nos teres encontrado.",
          },
          {
            id: "welcome-pt-ticket",
            type: "ticket",
            label: "O teu convite",
            title: "Válido até {expiresOn}",
            text: "Este link é só para ti. Se expirar antes de o usares, responde a este email e enviamos-te um novo com todo o gosto.",
            buttonLabel: "Entrar no QueerPulse",
            href: "{inviteLink}",
          },
          {
            id: "welcome-pt-divider",
            type: "divider",
          },
          {
            id: "welcome-pt-about",
            type: "paragraph",
            text: "O QueerPulse é uma comunidade só por convite para pessoas queer e trans, com raízes em Lisboa. É um sítio para encontrares a tua gente e partilhares o que importa, sem anúncios e sem nenhum algoritmo a decidir o que vês.",
          },
          {
            id: "welcome-pt-inside",
            type: "heading",
            level: 2,
            text: "O que te espera",
          },
          {
            id: "welcome-pt-features",
            type: "featureList",
            items: [
              {
                icon: "communities",
                title: "Comunidades",
                text: "Encontra a tua gente, de clubes de leitura a grupos de corrida, e entra em conversas que sabem a casa.",
              },
              {
                icon: "gatherings",
                title: "Encontros perto de ti",
                text: "Convívios, festas e cafés sem pressa, organizados pela comunidade para a comunidade.",
              },
              {
                icon: "directory",
                title: "O diretório local",
                text: "Espaços queer e acolhedores, recomendados por quem já lá esteve.",
              },
            ],
          },
          {
            id: "welcome-pt-reply",
            type: "paragraph",
            text: "Dúvidas, nervos, ou só te apetece dizer olá? Responde a este email. Chega diretamente a uma pessoa da nossa equipa.",
          },
          {
            id: "welcome-pt-signature",
            type: "signature",
            name: "A equipa QueerPulse",
            role: "",
            note: "Mal podemos esperar por te conhecer.",
            photoUrl: "",
          },
        ],
      },
    },
  },
];
