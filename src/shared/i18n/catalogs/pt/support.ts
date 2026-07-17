import type { Catalog } from "../../types";

/** pt-PT — see `en/support.ts` for the scope-rule note (testimonials are
 * fictional-user content and stay English; everything else here is chrome). */
export const support: Catalog = {
  // ── Hero ──────────────────────────────────────────────────────────────
  "hero.eyebrow": "Adesão de apoio",
  "hero.title": "Mantém a QueerPulse <em>viva</em>",
  "hero.sub":
    "A QueerPulse é gratuita e vai continuar a sê-lo. As pessoas apoiantes ajudam a cobrir os custos de a manter a funcionar — alojamento, ferramentas de moderação, e o sustento da equipa.",
  "hero.chooseAmountCta": "Escolher um valor",
  "hero.seeBudgetCta": "Ver para onde vai",
  "hero.chip.smallTeam": "Criado por uma equipa pequena",
  "hero.chip.noInvestors": "Sem investidores",
  "hero.chip.freeForever": "Gratuito para sempre",
  "hero.supportingNow": "A apoiar agora",
  "hero.supportingMembersLabel": "pessoas a apoiar",
  "hero.progressCount": "{count} de {goal}",
  "hero.toBreakEven": "para cobrir os custos",
  "hero.joinedThisWeek_one": "{count} pessoa juntou-se esta semana",
  "hero.joinedThisWeek_other": "{count} pessoas juntaram-se esta semana",

  // ── Impact ("what you're contributing to") ───────────────────────────
  "impact.heading": "Aquilo para que <em>estás a contribuir</em>",
  "impact.sub":
    "Cada euro vai diretamente para manter esta comunidade a funcionar e cuidada.",
  "impact.card.moderation.title": "Moderação e segurança",
  "impact.card.moderation.desc":
    "Rever denúncias, gerir recursos e manter a comunidade um lugar onde as pessoas querem mesmo estar.",
  "impact.card.hosting.title": "Alojamento e infraestrutura",
  "impact.card.hosting.desc":
    "Servidores, envio de emails, cópias de segurança, e o pequeno exército de serviços que tornam tudo isto fiável.",
  "impact.card.team.title": "A equipa",
  "impact.card.team.desc":
    "Duas pessoas a tempo parcial e um pequeno orçamento para colaboradores externos. Pagamos salários justos. Isso custa dinheiro.",
  "impact.card.freeAccess.title": "Acesso gratuito para toda a gente",
  "impact.card.freeAccess.desc":
    "As pessoas apoiantes tornam possível que a plataforma continue gratuita para toda a gente. Sempre.",

  // ── Budget transparency block ────────────────────────────────────────
  "budget.title": "Para onde vai mesmo o dinheiro",
  "budget.period": "Mês típico · 2026",
  "budget.intro":
    "Dissemos que a transparência não é negociável, por isso aqui está a verdade. É mais ou menos isto que custa manter a QueerPulse a funcionar todos os meses. Sem orçamento de marketing, sem escritório, sem investidores a pagar.",
  "budget.row.team": "Equipa (2 a tempo parcial)",
  "budget.row.magazine": "Revista e colaboradores",
  "budget.row.moderationTools": "Ferramentas de moderação e segurança",
  "budget.row.payments": "Processamento de pagamentos",
  "budget.totalLabel": "Custo mensal de funcionamento",
  "budget.foot":
    "As contas trimestrais completas estão no nosso <link>relatório de transparência</link>. Qualquer excedente vai para o fundo de saúde mental e microbolsas — nunca para lucro.",

  // ── Tiers / amount picker ─────────────────────────────────────────────
  "tiers.heading": "O que parece <em>certo</em>",
  "tiers.sub":
    "Não há valor errado. Cada contributo ajuda, e podes mudar ou cancelar quando quiseres.",
  "tiers.name.supporter": "Apoiante",
  "tiers.name.friend": "Amigue",
  "tiers.name.patron": "Mecenas",
  "tiers.name.custom": "Personalizado",
  "tiers.microlabel.supporter": "Popular entre novas pessoas",
  "tiers.microlabel.friend": "O ponto ideal",
  "tiers.microlabel.patron": "Ideal para quem é assíduo",
  "tiers.mostChosen": "A escolha mais comum",
  "tiers.chooseCta": "Escolher {name}",
  "tiers.selectAriaLabel": "Selecionar o nível {name}",
  "tiers.saveSuffix": "poupas {amount}/ano",
  "tiers.perk.supporter.badge": "Emblema de apoiante no teu perfil",
  "tiers.perk.supporter.thankYou":
    "O teu nome na publicação mensal de agradecimento",
  "tiers.perk.supporter.gratitude": "A nossa gratidão genuína",
  "tiers.perk.friend.everythingSupporter": "Tudo o que vem com Apoiante",
  "tiers.perk.friend.earlyAccess": "Acesso antecipado a novas funcionalidades",
  "tiers.perk.friend.rareBadge": "Emblema de apoiante (Raro)",
  "tiers.perk.friend.xp": "10 XP creditados todos os meses",
  "tiers.perk.patron.everythingFriend": "Tudo o que vem com Amigue",
  "tiers.perk.patron.annualList": "O teu nome na lista anual de apoiantes",
  "tiers.perk.patron.directLine": "Linha direta com a equipa",
  "tiers.perk.patron.roadmap": "Participação nas prioridades do roteiro",
  "tiers.freqAdverb.monthly": "mensalmente",
  "tiers.freqAdverb.annual": "anualmente",
  "tiers.freqAdverb.once": "pontualmente",
  "tiers.customAmountPlaceholder": "Outro",
  "tiers.customAmountAriaLabel": "Valor personalizado",
  "tiers.customText": "Ou contribui com o que puderes, {freq}",
  "tiers.customHelp.perYear": "= {amount} por ano",
  "tiers.customHelp.perMonth": "≈ {amount} por mês",
  "tiers.customHelp.onceNote": "Uma contribuição pontual",
  "tiers.customErr": "Introduz um valor de {sym}1 ou mais.",
  "tiers.yourAmount": "o teu valor",
  "tiers.continueCta": "Continuar com {name}",
  "tiers.chargeNote": "Não há cobrança até reveres e confirmares.",
  "tiers.solidOpt.title":
    "Adicionar <amt>{amount}</amt> para patrocinar uma adesão gratuita",
  "tiers.solidOpt.detail":
    "Retribui a alguém da comunidade que não pode contribuir agora.",
  "tiers.giftOpt.title": "Transformar isto num presente",
  "tiers.giftOpt.detail":
    "Apoia a QueerPulse em nome de outra pessoa — ela recebe o emblema e uma nota tua.",

  // ── Frequency labels ───────────────────────────────────────────────────
  "freq.monthly.per": "por mês",
  "freq.monthly.short": "/mês",
  "freq.monthly.billing": "Mensal",
  "freq.monthly.sub": "Recorrente · cancela quando quiseres",
  "freq.annual.per": "por ano",
  "freq.annual.short": "/ano",
  "freq.annual.billing": "Anual",
  "freq.annual.sub": "Faturado uma vez por ano · cancela quando quiseres",
  "freq.once.per": "pagamento único",
  "freq.once.billing": "Pagamento único",
  "freq.once.sub": "Uma contribuição única",
  "controls.billingFrequencyAriaLabel": "Frequência de faturação",
  "controls.currencyAriaLabel": "Moeda",
  "controls.saveTag": "2 meses grátis",

  // ── How it works ───────────────────────────────────────────────────────
  "howItWorks.heading": "Como <em>funciona</em>",
  "howItWorks.sub": "Sem prisões contratuais, sem letras miúdas escondidas.",
  "howItWorks.step1": "Escolhe um valor que faça sentido para ti",
  "howItWorks.step2": "Paga em segurança — cartão, Apple Pay, PayPal ou SEPA",
  "howItWorks.step3": "O teu emblema de apoiante ativa-se de imediato",
  "howItWorks.step4": "Muda ou cancela quando quiseres, sem perguntas",

  // ── Impact framing (below the amount picker, per contribution level) ──
  "impact.msg.high":
    "financia quase um dia inteiro da equipa a manter este lugar a funcionar e cuidado.",
  "impact.msg.mid":
    "cobre um mês de alojamento e email para dezenas de pessoas.",
  "impact.msg.low": "mantém o fórum e as ferramentas de moderação a funcionar.",

  // ── Impact stats (sidebar) ────────────────────────────────────────────
  "impactStats.mentalHealthFund": "para o fundo de saúde mental",
  "impactStats.freeMemberships": "adesões gratuitas financiadas",
  "impactStats.yearsRunning": "de atividade — continuamos aqui",
  "impactStats.years": "anos",
  "impactStats.communityFunded": "financiado pela comunidade",

  // ── Sidebar ────────────────────────────────────────────────────────────
  "sidebar.statsHead": "O impacto das pessoas apoiantes até agora",
  "sidebar.membersNeeded":
    "pessoas em falta para cobrir todos os custos mensais",
  "sidebar.whyHead": "Porque construímos isto assim",
  "sidebar.whyText":
    "Recusámos propostas de investimento. Não por orgulho — por princípio. No momento em que uma plataforma tem investidores, a comunidade deixa de ser o produto e começa a tornar-se um. A QueerPulse continua gratuita porque as pessoas que a usam escolhem mantê-la viva. É esse o acordo.",
  "sidebar.sign": "— A equipa da QueerPulse",
  "sidebar.reassure.stripe": "Seguro via Stripe",
  "sidebar.reassure.cancel": "Cancela quando quiseres",
  "sidebar.reassure.refund": "Reembolso em 14 dias",

  // ── Testimonials section (heading/sub are chrome; quotes are content) ──
  "testimonials.heading": "Porque é que as pessoas <em>contribuem</em>",
  "testimonials.sub": "Por palavras próprias.",

  // ── FAQ ────────────────────────────────────────────────────────────────
  "faq.heading": "Perguntas, <em>respondidas</em>",
  "faq.sub": "Tudo o que precisas de saber antes de contribuir.",
  "faq.change.q": "Posso mudar ou pausar o meu valor mais tarde?",
  "faq.change.a":
    "A qualquer momento, nas definições da tua conta. Muda o valor, alterna entre mensal e anual, pausa por alguns meses, ou cancela — tudo por conta própria, sem precisares de enviar um email.",
  "faq.cancel.q": "Posso cancelar?",
  "faq.cancel.a":
    "Sim, instantaneamente, a qualquer momento — nas definições da tua conta. Sem perguntas, sem fluxo de retenção, sem culpabilização. O teu emblema de apoiante mantém-se até ao fim do período de faturação.",
  "faq.refunds.q": "Fazem reembolsos?",
  "faq.refunds.a":
    "Se mudares de ideias até 14 dias depois de um pagamento, envia-nos um email e reembolsamos o valor na totalidade, sem precisares de justificar. Depois disso, cancelar impede pagamentos futuros, mas os anteriores não são reembolsados.",
  "faq.methods.q": "Que métodos de pagamento funcionam?",
  "faq.methods.a":
    "Cartão, Apple Pay, PayPal e débito direto SEPA para contas bancárias da UE. Tudo é processado pela Stripe — nunca vemos nem guardamos os dados do teu cartão.",
  "faq.invoice.q": "Posso obter uma fatura ou recibo?",
  "faq.invoice.a":
    "Sim. Todos os pagamentos enviam automaticamente um recibo para o teu email, e podes descarregar uma fatura datada — com nome da empresa e NIF — a partir da tua conta.",
  "faq.taxDeductible.q": "Isto é dedutível nos impostos?",
  "faq.taxDeductible.a":
    "Não — a QueerPulse não é uma instituição de solidariedade registada. A tua contribuição é um pagamento de adesão, não um donativo. Não podemos emitir recibos fiscais para efeitos de dedução.",
  "faq.currency.q": "Posso contribuir numa moeda diferente do euro?",
  "faq.currency.a":
    "O euro é a nossa moeda predefinida e aquela em que temos os nossos custos, mas podes pagar em GBP ou USD usando o seletor de moeda acima dos valores. O teu cartão pode ser de qualquer lugar.",
  "faq.cantAfford.q": "E se não puder pagar?",
  "faq.cantAfford.a":
    "A plataforma é gratuita e vai continuar a sê-lo. Contribuir nunca é obrigatório. Se quiseres apoiar de outras formas — organizando um convívio, avalizando outras pessoas, escrevendo para a revista — isso importa igualmente.",

  // ── Member banner (already a supporter) ───────────────────────────────
  "memberBanner.label": "És uma pessoa apoiante",
  "memberBanner.nextPayment":
    "Próximo pagamento a {date} · Emblema de apoiante ativo",
  "memberBanner.changeAmountCta": "Mudar valor",
  "memberBanner.receiptsCta": "Recibos",
  "memberBanner.cancelCta": "Cancelar",
  "memberBanner.receiptsToast": "Recibos enviados para o teu email.",
  "memberBanner.cancelToast":
    "Adesão cancelada. O teu emblema mantém-se até ao fim do período.",

  // ── Recap bar ──────────────────────────────────────────────────────────
  "recap.customName": "A tua contribuição",
  "recap.continueCta": "Continuar",

  // ── Payment modal ──────────────────────────────────────────────────────
  "modal.checkoutAriaLabel": "Finalização da adesão de apoio",
  "modal.close": "Fechar",
  "modal.head.done": "Tudo <em>pronto</em>",
  "modal.head.gift": "Oferecer uma <em>adesão</em>",
  "modal.head.custom": "Apoiar a <em>QueerPulse</em>",
  "modal.head.tier": "A tornares-te <em>{name}</em>",
  "modal.giftSentToast": "Presente enviado.",
  "modal.welcomeToast": "Bem-vinde a bordo — emblema ativado.",
  "modal.welcomeName.gift": "amigue da QueerPulse",
  "modal.welcomeName.customSupporter": "apoiante",
  "modal.receipt.giftText":
    "Enviámos o teu presente por email e o novo emblema de apoiante está pronto a ativar.",
  "modal.receipt.text":
    "O teu emblema de apoiante está ativo. Agradecemos-te por manteres este lugar vivo.",
  "modal.receipt.giftSuffix": " (presente)",

  // ── Checkout ───────────────────────────────────────────────────────────
  "checkout.giftMembership": "Adesão como presente",
  "checkout.solidLine": "Patrocinar uma adesão gratuita",
  "checkout.totalToday": "Total hoje",
  "checkout.recipientEmailLabel": "Email de quem vai receber o presente",
  "checkout.emailErr": "Introduz um email válido.",
  "checkout.ibanLabel": "IBAN",
  "checkout.ibanErr": "Introduz um IBAN válido.",
  "checkout.accountHolderLabel": "Titular da conta",
  "checkout.accountHolderErr": "Introduz o nome do titular da conta.",
  "checkout.applePayNote":
    "Finalização de compra rápida e privada com Touch ID ou Face ID.",
  "checkout.applePayCta": "Pagar com Apple Pay",
  "checkout.paypalNote": "O PayPal vai pedir-te para confirmares.",
  "checkout.paypalCta": "Continuar com o PayPal",
  "checkout.method.applePay": "Apple Pay",
  "checkout.method.paypal": "PayPal",
  "checkout.method.sepa": "SEPA",
  "checkout.backToCard": "‹ Pagar por cartão em vez disso",
  "checkout.moreWaysToPay": "Mais formas de pagar",
  "checkout.validationToast": "Verifica os campos destacados.",
  "checkout.startCta": "Começar a apoiar — {amount}",
  "checkout.stripeNote": "Fornecido pela Stripe · Pagamento seguro",
  "checkout.fineprint":
    "Ao continuar, aceitas os nossos termos. Cancela quando quiseres; reembolso em 14 dias mediante pedido.",
  "checkout.cardNumberLabel": "Número do cartão",
  "checkout.cardNumberErr":
    "Introduz um número de cartão válido de 16 dígitos.",
  "checkout.expiryLabel": "Validade",
  "checkout.cvcLabel": "CVC",
  "checkout.cvcErr": "3–4 dígitos",
  "checkout.nameOnCardLabel": "Nome no cartão",
  "checkout.nameOnCardErr": "Introduz o nome que consta no cartão.",

  // ── Success / receipt ──────────────────────────────────────────────────
  "success.welcomeTitle": "Bem-vinde, <em>{name}</em>",
  "success.shareLabel": "Ajuda-nos a crescer — conta às pessoas",
  "success.shareAriaLabel.story": "Partilhar a tua história",
  "success.shareAriaLabel.link": "Copiar uma ligação",
  "success.shareAriaLabel.feed": "Publicar no teu feed",
  "success.share.story": "a tua história",
  "success.share.link": "uma ligação copiada",
  "success.share.feed": "o teu feed",
  "success.share.toast":
    "Partilhado em {channel}. Agradecemos-te por espalhares a palavra!",
  "success.receipt.membership": "Adesão",
  "success.receipt.billing": "Faturação",
  "success.receipt.sponsoredMembership": "Adesão patrocinada",
  "success.receipt.reference": "Referência",
  "success.receipt.chargedToday": "Cobrado hoje",
  "success.downloadCta": "Descarregar recibo",
  "success.downloadToast": "Recibo descarregado (PDF).",
  "success.backCta": "Voltar à QueerPulse",
};
