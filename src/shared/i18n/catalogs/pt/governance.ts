import type { Catalog } from "../../types";

/**
 * Cópia da página de Governação e Transparência. Prosa processual/constitucional
 * — traduzida com precisão e literalidade. `FIN_STATS`/`INCOME`/`EXPENSE`/`EVENTS`
 * (as cifras trimestrais em `governance.data.ts`) ficam deliberadamente FORA
 * deste catálogo: em modo live, `GET /governance/finances` serve exatamente essa
 * forma, logo são conteúdo obtido pela API, não cópia da plataforma — ver o
 * comentário de cabeçalho em `api/governance.api.ts`. `HEALTH`, `STEPS`,
 * `COUNCIL`, `PRINCIPLES`, `DECISIONS` e a prosa de excedente/parceiros da
 * secção de finanças não têm backend próprio (fixas e idênticas em ambos os
 * modos), por isso SÃO cópia da plataforma e estão traduzidas abaixo.
 *
 * Registo: tu (nunca você). Formas inclusivas por reformulação neutra —
 * "membros" torna-se "pessoas" em todo o lado (ver docs/i18n/glossary-pt.md).
 */
export const governance: Catalog = {
  // ── Meta (pesquisa/IA) ──────────────────────────────────────────────────
  "page.meta.title": "Como a QueerPulse é gerida: conselho, finanças, recursos",
  "page.meta.description":
    "Como a QueerPulse é gerida — relatórios de saúde da comunidade, moderação e recursos, o conselho consultivo, princípios da plataforma, finanças trimestrais, e como levantar uma preocupação.",

  // ── Navegação lateral ───────────────────────────────────────────────────
  "nav.health": "Saúde da comunidade",
  "nav.moderation": "Moderação",
  "nav.council": "Conselho consultivo",
  "nav.principles": "Princípios",
  "nav.finances": "Finanças",
  "nav.decisions": "Registo de decisões",
  "nav.raise": "Levantar uma preocupação",

  // ── Hero ────────────────────────────────────────────────────────────────
  "page.hero.eyebrow": "Governação e Transparência",
  "page.hero.title": "Como gerimos isto, e quem <em>decide.</em>",
  "page.hero.lead":
    "O QueerPulse é uma plataforma comunitária. Isso significa ser transparente sobre como é governado, como as decisões são tomadas, e o que acontece quando algo corre mal. Esta página é esse registo.",

  // ── Documentos de governação (índice de rodapé) ────────────────────────
  "governingDocs.constitution.label": "Constituição",
  "governingDocs.constitution.blurb":
    "O documento organizativo formal — doze artigos em linguagem simples.",
  "governingDocs.codeOfConduct.label": "Código de Conduta",
  "governingDocs.codeOfConduct.blurb":
    "O que esperamos umas das outras, e o que acontece quando é violado.",
  "governingDocs.transparencyReport.label": "Relatório de transparência",
  "governingDocs.transparencyReport.blurb":
    "Ações de moderação, finanças e pedidos de dados, em aberto.",
  "subpageIndex.eyebrow": "Documentos de governação",
  "subpageIndex.title": "Lê a letra pequena.",

  // ── Saúde da comunidade ─────────────────────────────────────────────────
  "sections.health.eyebrow":
    "Relatório de Saúde da Comunidade — 2.º trimestre 2026",
  "sections.health.title": "Os <em>números,</em> com honestidade.",
  "sections.health.prose1":
    "Foram apresentadas doze denúncias este trimestre. Todas foram revistas dentro de 48 horas. Três resultaram no afastamento de pessoas da comunidade (violações repetidas do Código de Cuidado após aviso). Oito foram resolvidas com comunicação direta e sem ação formal.",
  "sections.health.prose2":
    "Foram apresentadas duas contestações a decisões de moderação. Uma foi aceite — tínhamos tomado a decisão errada e revertemo-la. Publicamos isto porque a transparência é como se constrói a confiança.",

  "health.stat.activeMembers.label": "Pessoas ativas",
  "health.stat.retention.label": "Taxa de retenção de pessoas",
  "health.stat.reportsFiled.label": "Denúncias apresentadas este trimestre",
  "health.stat.membersRemoved.label": "Pessoas afastadas",
  "health.stat.gatheringsHosted.label": "Convívios realizados",
  "health.stat.appealUpheld.label": "Contestação de moderação aceite",

  "health.trend.upThisQuarter": "↑ {count} este trimestre",
  "health.trend.steady": "Estável",
  "health.trend.allResolved": "Todas resolvidas",
  "health.trend.cocViolations": "Violações do Código de Cuidado",
  "health.trend.upVsQ1": "↑ {count} vs T1",
  "health.trend.ofFiled": "de {count} apresentadas",

  // ── Moderação ───────────────────────────────────────────────────────────
  "sections.moderation.eyebrow": "Como funciona a moderação",
  "sections.moderation.title": "O que acontece quando algo <em>corre mal.</em>",
  "sections.moderation.intro":
    "O QueerPulse é moderado por uma pequena equipa de pessoas da comunidade que aceitaram este papel. São responsáveis perante o conselho consultivo, e as suas decisões podem ser contestadas.",
  "sections.moderation.wontTolerate.label": "O que não toleramos:",
  "sections.moderation.wontTolerate.text":
    "Qualquer comportamento que faça alguém sentir-se inseguro ou não bem-vinde por causa da sua identidade, corpo, ou percurso. Assédio de qualquer tipo. Solicitação comercial sem autorização. Violação da privacidade de outra pessoa.",

  "steps.reportFiled.title": "Denúncia apresentada",
  "steps.reportFiled.text":
    "Qualquer pessoa da comunidade pode denunciar outra pessoa, um convívio, uma publicação do fórum, ou qualquer conteúdo. As denúncias são confidenciais — a pessoa denunciada não é informada de quem a apresentou.",
  "steps.review.title": "Revisão em 48 horas",
  "steps.review.text":
    "A equipa de moderação revê a denúncia no prazo de 48 horas. Para questões de segurança urgentes, no mesmo dia. Quem apresentou a denúncia é informado em cada etapa.",
  "steps.decision.title": "Decisão e comunicação",
  "steps.decision.text":
    "Resultados possíveis: nenhuma ação (com explicação), comunicação direta, aviso, suspensão temporária, remoção permanente. A pessoa denunciada é informada do resultado, mas quem denunciou não.",
  "steps.appeal.title": "Direito a contestar",
  "steps.appeal.text":
    "Qualquer pessoa da comunidade pode contestar uma decisão de moderação no prazo de 14 dias. As contestações são revistas pelo conselho consultivo, não pela equipa original. O resultado é final.",

  // ── Conselho consultivo ─────────────────────────────────────────────────
  "sections.council.eyebrow": "Conselho consultivo",
  "sections.council.title": "Quem <em>supervisiona</em> isto.",
  "sections.council.intro":
    "O conselho consultivo revê contestações de moderação, propõe mudanças na plataforma, e serve como camada de responsabilização. Os mandatos duram um ano e podem ser encerrados por voto de dois terços da comunidade.",

  "council.psychologistChair": "Psicologia · Presidência",
  "council.lawyerLegalAdvisor": "Direito · Aconselhamento jurídico",
  "council.housingActivist": "Ativismo pela habitação",
  "council.healthcareAdvocate": "Defesa da saúde",

  // ── Princípios ──────────────────────────────────────────────────────────
  "sections.principles.eyebrow": "Princípios da plataforma",
  "sections.principles.title":
    "O que esta plataforma <em>vai e não vai fazer.</em>",

  "principles.noSellingData.title": "Nunca vendemos dados de pessoas",
  "principles.noSellingData.text":
    "Os dados das pessoas são usados apenas para gerir a plataforma. Nunca os partilhamos, vendemos, ou usamos para publicidade.",
  "principles.visibilityChoice.title":
    "A visibilidade é sempre uma escolha tua",
  "principles.visibilityChoice.text":
    "Tu controlas quem pode ver o teu perfil, publicações e atividade. As predefinições são conservadoras.",
  "principles.noAlgorithms.title": "Nenhum algoritmo decide quem vês",
  "principles.noAlgorithms.text":
    "Não há algoritmo de envolvimento. As pessoas não são ordenadas por prioridade. Vês o que escolheres ver.",
  "principles.communityVoice.title": "A comunidade tem voz nas decisões",
  "principles.communityVoice.text":
    "Mudanças significativas são discutidas no Fórum antes de serem implementadas; as propostas seguem para o conselho.",
  "principles.transparency.title": "A transparência não é negociável",
  "principles.transparency.text":
    "Relatórios trimestrais de saúde. Estatísticas de moderação publicadas. Reuniões do conselho resumidas publicamente.",
  "principles.accessNotConditional.title":
    "O acesso não depende da capacidade de pagar",
  "principles.accessNotConditional.text":
    "Uma escala progressiva para todos os convívios pagos. Ninguém é excluído por motivos financeiros.",

  // ── Finanças ────────────────────────────────────────────────────────────
  "sections.finances.eyebrow": "2.º trimestre 2026 · Transparência financeira",
  "sections.finances.title":
    "Quanto custa, quanto entra, <em>para onde vai.</em>",
  "sections.finances.intro":
    "Publicamos as nossas finanças todos os trimestres. O QueerPulse é financiado por quem o usa, e essas pessoas merecem saber exatamente como o dinheiro é angariado e gasto. Sem interesses de investidores. Sem metas de crescimento. Sem plano de saída.",
  "sections.finances.incomeHeading": "De onde vem o dinheiro",
  "sections.finances.expenseHeading": "Para onde vai o dinheiro",
  "sections.finances.clickHint":
    "Clica em qualquer linha para ver a discriminação completa.",
  "sections.finances.totalIncome": "Receita total · {amount}",
  "sections.finances.totalExpense": "Despesa total · {amount}",
  "sections.finances.eventsHeading": "Como funcionam as finanças dos convívios",
  "sections.finances.surplusHeading": "O que fazemos com o excedente.",
  "sections.finances.surplusBody":
    "Os excedentes trimestrais entram numa reserva operacional. A nossa meta é três meses de custos de funcionamento — cerca de {target}.",
  "sections.finances.reserveProgress":
    "Reserva operacional: {current} de uma meta de {target}",
  "sections.finances.surplusRedirect":
    "Quando atingirmos a meta, o excedente adicional é redirecionado na íntegra para o fundo de micro-apoios da comunidade. Não acumulamos capital. Redistribuímo-lo.",
  "sections.finances.partnerRestriction":
    "{amount} · Restrito a {scope}. Sem influência editorial, de governação, ou da plataforma.",
  "sections.finances.partnerScope.mentalHealthFund": "o Fundo de Saúde Mental",
  "sections.finances.partnerScope.communityEvents": "eventos comunitários",
  "sections.finances.noCorporateFunding":
    "Não aceitamos financiamento de empresas, marcas, ou entidades governamentais cujos interesses possam entrar em conflito com a autonomia da comunidade. Se isso alguma vez mudar, diremo-lo aqui primeiro — e a comunidade vai votar sobre isso.",

  // ── Registo de decisões ─────────────────────────────────────────────────
  "sections.decisions.eyebrow": "Decisões recentes",
  "sections.decisions.title": "O que mudou e <em>porquê.</em>",

  "decisions.slidingScale.lead":
    "Maio de 2026 — Introduzida escala progressiva para os convívios.",
  "decisions.slidingScale.body":
    "Na sequência de uma discussão no fórum iniciada por Catarina Vaz, o conselho concordou em implementar uma escala progressiva para todos os convívios pagos. 23 pessoas participaram.",
  "decisions.forumLaunched.lead": "Abril de 2026 — Fórum lançado.",
  "decisions.forumLaunched.body":
    "Na sequência de pedidos da comunidade por um espaço para discutir temas mais longos. Categorias e diretrizes co-desenhadas com 12 pessoas ao longo de três semanas.",
  "decisions.visibilityDefaults.lead":
    "Março de 2026 — Predefinições de visibilidade tornadas mais conservadoras.",
  "decisions.visibilityDefaults.body":
    'Quem chega agora à comunidade passa a ter, por predefinição, "apenas rede" em vez de "aberto", podendo abrir mais quando se sentir confortável.',
  "decisions.languageToggle.lead":
    "Fevereiro de 2026 — Alternador de idioma adicionado.",
  "decisions.languageToggle.body":
    "Alternador PT/EN adicionado a todas as páginas, na sequência de pedidos de pessoas lusófonas.",

  // ── Levantar uma preocupação ────────────────────────────────────────────
  "sections.raise.eyebrow": "Levantar uma preocupação",
  "sections.raise.title": "Algo não está <em>bem?</em> Diz-nos.",
  "sections.raise.intro":
    "Usa este formulário para denunciar uma pessoa, um conteúdo, uma decisão da plataforma, ou uma preocupação sobre como o QueerPulse é gerido. Todas as submissões são confidenciais e revistas no prazo de 48 horas.",
  "sections.raise.cardTitle": "Submeter uma preocupação",
  "sections.raise.cardText":
    "A tua identidade é mantida confidencial. Vais receber uma confirmação no prazo de 48 horas e uma atualização quando o assunto for resolvido.",
  "sections.raise.selectPlaceholder": "Que tipo de preocupação?",
  "sections.raise.option.member": "Denunciar uma pessoa ou comportamento",
  "sections.raise.option.gathering": "Denunciar um convívio ou evento",
  "sections.raise.option.content": "Problema de conteúdo ou da plataforma",
  "sections.raise.option.appeal": "Decisão de moderação que quero contestar",
  "sections.raise.option.other": "Outra coisa",
  "sections.raise.textareaPlaceholder":
    "Descreve o que aconteceu, ou o que está errado, com o detalhe que te for confortável…",
  "sections.raise.emailPlaceholder": "O teu email (para te podermos atualizar)",
  "sections.raise.submitCta": "Submeter",
  "sections.raise.submittedToast":
    "Submetido — entraremos em contacto no prazo de 48 horas",
  "sections.raise.comingSoonToast":
    "A receção de preocupações ainda não está ativa — este formulário não está ligado.",
};
