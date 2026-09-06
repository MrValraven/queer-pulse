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
    "Como a QueerPulse é gerida: relatórios de saúde da comunidade, moderação e recursos, o conselho consultivo, princípios da plataforma, finanças trimestrais, e como levantar uma preocupação.",

  // ── Navegação lateral ───────────────────────────────────────────────────
  "nav.health": "Saúde da comunidade",
  "nav.moderation": "Moderação",
  "nav.council": "Conselho consultivo",
  "nav.principles": "Princípios",
  "nav.finances": "Finanças",
  "nav.proposals": "Propostas e votações",
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
    "O documento organizativo formal, doze artigos em linguagem simples.",
  "governingDocs.codeOfConduct.label": "Código de Conduta",
  "governingDocs.codeOfConduct.blurb":
    "O que esperamos umas das outras, e o que acontece quando é violado.",
  "governingDocs.transparency.label": "Relatório de Transparência",
  "governingDocs.transparency.blurb":
    "O que a moderação recebeu, o que fez e onde errou. Contado a cada trimestre.",
  "subpageIndex.eyebrow": "Documentos de governação",
  "subpageIndex.title": "Lê a letra pequena.",

  // ── Saúde da comunidade ─────────────────────────────────────────────────
  "sections.health.eyebrow":
    "Relatório de Saúde da Comunidade, 2.º trimestre 2026",
  "sections.health.title": "Os <em>números,</em> com honestidade.",
  "sections.health.prose1":
    "Foram apresentadas doze denúncias este trimestre. Todas foram revistas dentro de 48 horas. Três resultaram no afastamento de pessoas da comunidade (violações repetidas do Código de Cuidado após aviso). Oito foram resolvidas com comunicação direta e sem ação formal.",
  "sections.health.prose2":
    "Foram apresentadas duas contestações a decisões de moderação. Uma foi aceite. Tínhamos tomado a decisão errada e revertemo-la. Publicamos isto porque a transparência é como se constrói a confiança.",

  "health.stat.activeMembers.label": "Pessoas ativas",
  "health.stat.retention.label": "Taxa de retenção de pessoas",
  "health.stat.reportsFiled.label": "Denúncias apresentadas este trimestre",
  "health.stat.membersRemoved.label": "Pessoas afastadas",
  "health.stat.gatheringsHosted.label": "Convívios realizados",
  "health.stat.appealUpheld.label": "Contestação de moderação aceite",

  "health.trend.upThisQuarter": "{count} este trimestre",
  "health.trend.steady": "Estável",
  "health.trend.allResolved": "Todas resolvidas",
  "health.trend.cocViolations": "Violações do Código de Cuidado",
  "health.trend.upVsQ1": "{count} vs T1",
  "health.trend.ofFiled": "de {count} apresentadas",
  /** Prefixo para leitores de ecrã numa tendência a subir; o ícone de seta
   *  ao lado é `aria-hidden`, por isso é isto que transporta a direção. */
  "health.trend.upDirection": "Subiu:",

  // ── Moderação ───────────────────────────────────────────────────────────
  "sections.moderation.eyebrow": "Como funciona a moderação",
  "sections.moderation.title": "O que acontece quando algo <em>corre mal.</em>",
  "sections.moderation.intro":
    "O QueerPulse é moderado por uma pequena equipa de pessoas da comunidade que aceitaram este papel. São responsáveis perante o conselho consultivo, e as suas decisões podem ser contestadas.",
  "sections.moderation.wontTolerate.label": "O que não toleramos:",
  "sections.moderation.wontTolerate.text":
    "Qualquer comportamento que faça alguém sentir-se inseguro ou não bem-vinde por causa da sua identidade, corpo, ou percurso. Assédio de qualquer tipo. Solicitação comercial sem autorização. Violação da privacidade de outra pessoa.",
  "sections.moderation.transparencyLink":
    "Os números por detrás deste processo são publicados a cada trimestre no <a>Relatório de Transparência</a>.",

  "steps.reportFiled.title": "Denúncia apresentada",
  "steps.reportFiled.text":
    "Qualquer pessoa da comunidade pode denunciar outra pessoa, um convívio, uma publicação do fórum, ou qualquer conteúdo. As denúncias são confidenciais. A pessoa denunciada não é informada de quem a apresentou.",
  "steps.review.title": "Revisão em 48 horas",
  "steps.review.text":
    "A equipa de moderação revê a denúncia no prazo de 48 horas. Para questões de segurança urgentes, no mesmo dia. Quem apresentou a denúncia é informado em cada etapa.",
  "steps.decision.title": "Decisão e comunicação",
  "steps.decision.text":
    "Resultados possíveis: nenhuma ação (com explicação), comunicação direta, aviso, suspensão temporária, remoção permanente. A pessoa denunciada é informada do resultado, mas quem denunciou não.",
  "steps.appeal.title": "Direito a contestar",
  "steps.appeal.text":
    "Qualquer pessoa da comunidade pode contestar uma decisão de moderação no prazo de 14 dias. As contestações são revistas pelo conselho consultivo, de forma independente da equipa que tomou a decisão original. O resultado é final.",

  // ── Conselho consultivo ─────────────────────────────────────────────────
  "sections.council.eyebrow": "Conselho consultivo",
  "sections.council.title": "Quem <em>supervisiona</em> isto.",
  "sections.council.intro":
    "O conselho consultivo revê contestações de moderação, propõe mudanças na plataforma, e serve como camada de responsabilização. Os mandatos duram um ano e um lugar pode ser encerrado por voto de dois terços da comunidade. Vê Propostas e votações abaixo.",

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
    "Os excedentes trimestrais entram numa reserva operacional. A nossa meta é três meses de custos de funcionamento, cerca de {target}.",
  "sections.finances.reserveProgress":
    "Reserva operacional: {current} de uma meta de {target}",
  "sections.finances.reserveBarAria": "Progresso da reserva operacional",
  "sections.finances.surplusRedirect":
    "Quando atingirmos a meta, o excedente adicional é redirecionado na íntegra para o fundo de micro-apoios da comunidade. Não acumulamos capital. Redistribuímo-lo.",
  "sections.finances.partnerRestriction":
    "{amount} · Restrito a {scope}. Sem influência editorial, de governação, ou da plataforma.",
  "sections.finances.partnerScope.mentalHealthFund": "o Fundo de Saúde Mental",
  "sections.finances.partnerScope.communityEvents": "eventos comunitários",
  "sections.finances.noCorporateFunding":
    "Não aceitamos financiamento de empresas, marcas, ou entidades governamentais cujos interesses possam entrar em conflito com a autonomia da comunidade. Se isso alguma vez mudar, diremo-lo aqui primeiro, e a comunidade vai votar sobre isso. Vê Propostas e votações abaixo.",

  // ── Propostas e votações ─────────────────────────────────────────────────
  "sections.proposals.eyebrow": "Propostas e votações",
  "sections.proposals.title": "Pomos isso a <em>votos.</em>",
  "sections.proposals.intro":
    "Há duas coisas nesta página decididas por voto da comunidade: encerrar um lugar no conselho consultivo exige dois terços dos votos, e aceitar financiamento fora das nossas fontes habituais exige maioria. Todas as propostas em aberto estão listadas aqui, e as anteriores continuam visíveis com o respetivo resultado.",
  "sections.proposals.type.council_removal": "Lugar no conselho",
  "sections.proposals.type.funding_change": "Mudança de financiamento",
  "sections.proposals.type.member_motion": "Moção da comunidade",
  "sections.proposals.status.passed": "Aprovada",
  "sections.proposals.status.failed": "Não aprovada",
  "sections.proposals.status.gathering": "A reunir apoio",
  "sections.proposals.status.screening": "Em análise",
  "sections.proposals.status.rejected": "Não foi a votos",
  "sections.proposals.status.lapsed": "Sem assinaturas suficientes",
  "sections.proposals.targetSeat": "Lugar em avaliação: {name}",
  "sections.proposals.tallyCaption":
    "{forCount} a favor · {againstCount} contra · {forPercent}% a favor (linha dos dois terços marcada)",
  "sections.proposals.closes": "Votação encerra {date}",
  "sections.proposals.closedOn": "Votação encerrada a {date}",
  "sections.proposals.voteFor": "Votar a favor",
  "sections.proposals.voteAgainst": "Votar contra",
  "sections.proposals.votedFor": "Votaste a favor desta proposta.",
  "sections.proposals.votedAgainst": "Votaste contra esta proposta.",
  "sections.proposals.resolvedHeading": "Propostas anteriores",
  "sections.proposals.empty": "Ainda não foi aberta nenhuma proposta.",

  // ── Moções da comunidade (GOV-01) ───────────────────────────────────────
  // Qualquer pessoa pode pôr algo a votos, por isso uma moção passa por
  // três fases antes de existir uma votação: reúne assinaturas, a equipa
  // analisa-a, e só então abre a votação. Cada cadeia abaixo nomeia a fase
  // em que a moção está mesmo, porque uma moção ainda a reunir nomes nunca
  // pode ler-se como uma votação que correu mal.
  "sections.proposals.raisedBy": "Proposta por {name}",
  "sections.proposals.tallyLabel": "Votos expressos",
  "sections.proposals.gatheringHeading": "A reunir assinaturas",
  "sections.proposals.votingHeading": "Em votação",

  // Apresentar uma moção. A dica e o subtítulo dizem ambos o que acontece
  // a seguir, porque um formulário que arruma a tua moção numa fila em
  // silêncio é a forma mais rápida de a democracia aqui parecer decorativa.
  "sections.proposals.compose.cta": "Pôr algo a votos",
  "sections.proposals.compose.hint":
    "Qualquer pessoa da comunidade pode apresentar uma moção. São precisas dez pessoas a apoiá-la antes de a equipa a analisar, e a tua conta como a primeira.",
  "sections.proposals.compose.eyebrow": "Moção da comunidade",
  "sections.proposals.compose.title": "Pôr algo a votos",
  "sections.proposals.compose.sub":
    "Isto não vai diretamente a votos. A tua moção reúne primeiro assinaturas de outras pessoas, depois a equipa analisa-a, e só então abre a votação.",
  "sections.proposals.compose.titleField": "O que estás a propor?",
  "sections.proposals.compose.titlePlaceholder":
    "Uma linha, em palavras simples.",
  "sections.proposals.compose.descriptionField": "Os argumentos",
  "sections.proposals.compose.descriptionHelper":
    "Diz o que deve mudar e porquê. As pessoas leem isto antes de decidirem se assinam.",
  "sections.proposals.compose.descriptionPlaceholder":
    "O que queres que mude, quem afeta, e o que acontece se nada mudar.",
  "sections.proposals.compose.cancel": "Cancelar",
  "sections.proposals.compose.submit": "Apresentar moção",
  "sections.proposals.compose.submitting": "A apresentar…",
  "sections.proposals.compose.successToast":
    "Moção apresentada. Está agora a reunir assinaturas.",
  "sections.proposals.compose.errorToast":
    "Não foi possível apresentar a moção. Tenta novamente.",

  // A recolha de assinaturas. `progress` recebe a contagem e o limiar;
  // `progressComplete` recebe só a contagem, e serve tanto quando o limiar
  // foi atingido como quando a moção não tem limiar nenhum.
  "sections.proposals.cosign.progress":
    "Assinaturas: {count} das {threshold} necessárias",
  "sections.proposals.cosign.progressComplete": "Assinaturas: {count}",
  "sections.proposals.cosign.cta": "Assinar esta moção",
  "sections.proposals.cosign.withdrawCta": "Retirar a minha assinatura",
  "sections.proposals.cosign.signed": "Assinaste esta moção.",
  "sections.proposals.cosign.proposerNote":
    "Levantaste esta moção, por isso a tua assinatura já é a primeira.",
  "sections.proposals.cosign.signedInOnly":
    "Inicia sessão para assinares esta moção.",
  "sections.proposals.cosign.awaitingReview":
    "Já há assinaturas suficientes. A equipa está a ler esta moção antes de abrir a votação.",
  "sections.proposals.cosign.closes": "As assinaturas encerram {date}",
  "sections.proposals.cosign.closed": "Assinaturas encerradas a {date}",
  "sections.proposals.cosign.errorToast":
    "Não foi possível guardar a tua assinatura. Tenta novamente.",

  // O quórum é a participação, e é uma leitura separada da maioria de dois
  // terços acima dele: uma proposta pode passar os dois terços dos votos
  // expressos e mesmo assim ficar sem quórum por terem votado poucas
  // pessoas. `missed` diz exatamente isso, para que uma proposta com pouca
  // participação nunca se leia como uma que perdeu o argumento.
  "sections.proposals.quorum.label": "Quórum",
  "sections.proposals.quorum.pending":
    "{totalVotes} dos {quorumRequired} votos necessários para o resultado contar",
  "sections.proposals.quorum.met":
    "{totalVotes} votos expressos, acima dos {quorumRequired} necessários para o resultado contar",
  "sections.proposals.quorum.missed":
    "Só foram expressos {totalVotes} dos {quorumRequired} votos necessários, por isso esta proposta ficou sem quórum.",

  // Uma moção resolvida que nunca chegou a votação. O motivo da recusa é
  // publicado para toda a gente, por isso a etiqueta fica neutra e factual.
  "sections.proposals.outcome.lapsed":
    "Esta moção reuniu {count} das {threshold} assinaturas de que precisava, por isso nunca chegou a votação.",
  "sections.proposals.outcome.reviewedOn": "Analisada a {date}",
  "sections.proposals.outcome.rejectedLabel":
    "Porque é que isto não foi a votos",

  // ── Registo de decisões ─────────────────────────────────────────────────
  "sections.decisions.eyebrow": "Decisões recentes",
  "sections.decisions.title": "O que mudou e <em>porquê.</em>",

  "decisions.slidingScale.lead":
    "Maio de 2026: Introduzida escala progressiva para os convívios.",
  "decisions.slidingScale.body":
    "Na sequência de uma discussão no fórum iniciada por Catarina Vaz, o conselho concordou em implementar uma escala progressiva para todos os convívios pagos. 23 pessoas participaram.",
  "decisions.forumLaunched.lead": "Abril de 2026: Fórum lançado.",
  "decisions.forumLaunched.body":
    "Na sequência de pedidos da comunidade por um espaço para discutir temas mais longos. Categorias e diretrizes co-desenhadas com 12 pessoas ao longo de três semanas.",
  "decisions.visibilityDefaults.lead":
    "Março de 2026: Predefinições de visibilidade tornadas mais conservadoras.",
  "decisions.visibilityDefaults.body":
    'Quem chega agora à comunidade passa a ter, por predefinição, "apenas rede" em vez de "aberto", podendo abrir mais quando se sentir confortável.',
  "decisions.languageToggle.lead":
    "Fevereiro de 2026: Alternador de idioma adicionado.",
  "decisions.languageToggle.body":
    "Alternador PT/EN adicionado a todas as páginas, na sequência de pedidos de pessoas lusófonas.",

  // ── Levantar uma preocupação ────────────────────────────────────────────
  "sections.raise.eyebrow": "Levantar uma preocupação",
  "sections.raise.title": "Algo não está <em>bem?</em> Diz-nos.",
  // PRD-261: ver a nota no catálogo EN. A cópia antiga prometia uma
  // confirmação em 48 horas e uma atualização por email que nunca podia
  // chegar.
  "sections.raise.intro":
    "Usa este formulário para denunciar uma pessoa, um conteúdo, uma decisão da plataforma, ou uma preocupação sobre como o QueerPulse é gerido. Todas as submissões são confidenciais, e comprometemo-nos a dar resposta no prazo de três dias.",
  "sections.raise.cardTitle": "Submeter uma preocupação",
  "sections.raise.cardText":
    "A tua identidade permanece confidencial. O QueerPulse não envia emails, por isso ao submeteres recebes um código de referência: guarda-o, e podes ver a qualquer momento o que aconteceu à tua preocupação.",
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
  "sections.raise.submittingCta": "A enviar…",
  "sections.raise.submittedToast":
    "Submetido. Entraremos em contacto no prazo de 48 horas.",
  "sections.raise.errorToast":
    "Escolhe uma categoria e acrescenta alguns detalhes primeiro.",
  "sections.raise.failedToast":
    "Não foi possível enviar neste momento. Tenta novamente.",
  // Mostrado no lugar dos dados de uma secção quando a obtenção falha, para que
  // um erro da API apareça como um pedido de nova tentativa em vez de uma
  // grelha vazia sem explicação.
  "error.body": "Não foi possível carregar esta secção neste momento.",
  "error.retry": "Tentar novamente",

  // ── Relatório de Transparência (/about/governance/transparency) ─────────
  // O documento que o artigo VI, cláusula 3, da Constituição nomeia. Todos os
  // números vêm de `GET /transparency/report`; a cópia abaixo é da plataforma, e
  // as chaves `category.*` / `action.*` / `outcome.*` são as etiquetas dos
  // identificadores estáveis que esse endpoint envia.
  "transparency.meta.title":
    "Relatório de Transparência: números da moderação da QueerPulse",
  "transparency.meta.description":
    "Contado a cada trimestre: denúncias apresentadas e sobre o quê, quanto tempo demorou uma resposta, o que a moderação fez, recursos apresentados, quantas decisões foram revertidas, e todas as exigências que um tribunal, uma força policial ou um organismo governamental fez por informação sobre membros.",

  "transparency.hero.eyebrow": "Relatório de Transparência",
  "transparency.hero.title": "O que a moderação <em>fez mesmo.</em>",
  "transparency.hero.dek1":
    "Todos os números desta página são contados a partir do registo vivo da moderação no momento em que a carregas. Nada é escrito à mão e nada é estimado. Quando um número seria pequeno o suficiente para descrever uma pessoa, é retido, e a página diz onde.",
  "transparency.hero.dek2":
    "O artigo VI da <a>Constituição</a> promete este relatório. É este.",

  "transparency.period.label": "Período do relatório",
  "transparency.period.option.current": "Este trimestre",
  "transparency.period.option.previous": "Trimestre anterior",
  "transparency.period.rangeComplete":
    "<b>{id}</b> decorreu de {start} a {end}. O trimestre está fechado, por isso estes números são definitivos.",
  "transparency.period.rangePartial":
    "<b>{id}</b> ainda está a decorrer. Estes números cobrem de {start} a {until} e vão continuar a mudar até o trimestre fechar.",
  "transparency.period.generated": "Contado a {generated}.",

  "transparency.reports.title": "Denúncias <em>apresentadas</em>",
  "transparency.reports.lead":
    "Uma denúncia é alguém a dizer-nos que algo está errado. Recebidas conta as denúncias apresentadas durante o período; fechadas conta as que foram concluídas nele. São conjuntos diferentes, por isso não têm de coincidir.",
  "transparency.reports.received": "Denúncias recebidas",
  "transparency.reports.resolved": "Denúncias fechadas",
  "transparency.reports.tableCaption": "Denúncias recebidas, por tipo",
  "transparency.reports.categoryColumn": "O que foi denunciado",
  "transparency.reports.countColumn": "Denúncias",

  "transparency.category.privacy":
    "Exposição da identidade ou partilha de informação privada",
  "transparency.category.harassment":
    "Assédio, discurso de ódio ou contacto indesejado",
  "transparency.category.impersonation": "Falsa identidade",
  "transparency.category.spam": "Spam e perturbação",
  "transparency.category.space_safety":
    "Segurança de um espaço, de uma casa ou de um anúncio",
  "transparency.category.other": "Tudo o resto",

  "transparency.timing.title": "Quanto tempo demorou uma <em>resposta</em>",
  "transparency.timing.lead":
    "Medido entre o momento em que a denúncia foi apresentada e o momento em que a moderação a fechou, sobre as denúncias fechadas neste período.",
  "transparency.timing.median": "Metade das denúncias teve resposta em",
  "transparency.timing.p90": "Nove em cada dez tiveram resposta em",
  "transparency.timing.hours": "{value} horas",
  "transparency.timing.withheld":
    "Poucas denúncias fechadas para publicar isto sem descrever casos isolados",

  "transparency.actions.title": "O que a <em>moderação</em> fez",
  "transparency.actions.lead":
    "Cada decisão da moderação é escrita num registo de auditoria no momento em que é tomada. Estas são essas linhas, contadas. Concluir que nenhuma regra foi quebrada é um resultado real e é contado como qualquer outro.",
  "transparency.actions.accountsRemoved": "Contas removidas em definitivo",
  "transparency.actions.tableCaption":
    "Decisões da moderação tomadas durante o período",
  "transparency.actions.actionColumn": "Decisão",
  "transparency.actions.countColumn": "Vezes tomada",

  "transparency.action.dismiss": "Nenhuma regra foi quebrada",
  "transparency.action.warn": "Aviso dado",
  "transparency.action.hide_content": "Conteúdo ocultado",
  "transparency.action.remove_content": "Conteúdo removido",
  "transparency.action.restrict": "Conta restringida por um período",
  "transparency.action.suspend": "Conta suspensa por um período",
  "transparency.action.ban": "Conta removida em definitivo",
  "transparency.action.escalate": "Enviado para revisão adicional",

  "transparency.communities.frozen": "Comunidades congeladas",

  "transparency.appeals.title": "<em>Recursos</em>",
  "transparency.appeals.lead":
    "Qualquer pessoa pode recorrer de uma decisão tomada a seu respeito. Os resultados são contados no período em que o recurso foi apresentado, por isso as linhas abaixo somam sempre os recursos apresentados. Alguns ainda estão em revisão.",
  "transparency.appeals.filed": "Recursos apresentados",
  "transparency.appeals.overturnRate": "Decisões revertidas em recurso",
  "transparency.appeals.ratePercent": "{value}%",
  "transparency.appeals.rateWithheld":
    "Poucos recursos decididos neste período para uma percentagem significar algo",
  "transparency.appeals.tableCaption":
    "Recursos apresentados durante o período, por resultado",
  "transparency.appeals.outcomeColumn": "Resultado",
  "transparency.appeals.countColumn": "Recursos",

  "transparency.outcome.upheld": "Decisão original mantida",
  "transparency.outcome.overturned": "Decisão original revertida",
  "transparency.outcome.awaiting": "Ainda em revisão",

  "transparency.suppressed.value": "Menos de {floor}",
  "transparency.suppressed.unavailable": "Indisponível",

  // ── Exigências legais, governamentais e policiais (PRD-32) ─────────────
  // O registo que o relatório omitia por completo. A secção é sempre
  // apresentada, um registo vazio publica um zero real, e `neverAsked` é a
  // única frase da página que fala por todo o tempo e não apenas pelo trimestre
  // escolhido. As chaves `legal.type.*` / `legal.outcome.*` etiquetam os
  // identificadores estáveis que `LEGAL_REQUEST_TYPES` / `LEGAL_REQUEST_OUTCOMES`
  // enviam.
  "transparency.legal.title": "Exigências de <em>tribunais e polícia</em>",
  "transparency.legal.lead":
    "Um pedido legal é uma exigência de um tribunal, de uma força policial, de um organismo governamental ou de outro braço de um Estado: entregar informação sobre um membro, preservá-la, ou retirar algo. Cada exigência que nos chega é escrita num registo no momento em que chega, e esta secção é esse registo contado.",
  "transparency.legal.neverAsked":
    "Nenhum tribunal, força policial ou organismo governamental alguma vez pediu à QueerPulse informação sobre um membro. Esta frase cobre toda a vida do registo, todos os trimestres em que foi mantido, e a página lê-a do registo sempre que carrega.",
  "transparency.legal.hasBeenAsked":
    "A QueerPulse já recebeu exigências de informação sobre membros. Os números abaixo contam as exigências que chegaram dentro deste período, por isso um período de zeros significa que nenhuma chegou nele.",

  "transparency.legal.unavailable.body":
    "Não conseguimos carregar estes números. É um problema a carregar esta página e não significa que nunca nos tenham pedido nada. Nada aqui deve ser lido como um zero.",

  "transparency.legal.received": "Exigências recebidas",
  "transparency.legal.accountsAffected": "Contas de membros nomeadas",
  "transparency.legal.accountsNotified": "Contas nomeadas informadas",
  "transparency.legal.recordsVoided": "Registos anulados",

  "transparency.legal.typeTableCaption":
    "Exigências recebidas durante o período, por aquilo que chegou",
  "transparency.legal.typeColumn": "Tipo de exigência",
  "transparency.legal.typeCountColumn": "Exigências",

  "transparency.legal.type.subpoena": "Intimação",
  "transparency.legal.type.court_order": "Ordem de tribunal",
  "transparency.legal.type.police_request":
    "Pedido policial feito sem ordem de tribunal",
  "transparency.legal.type.emergency_disclosure_request":
    "Exigência de divulgação de emergência",
  "transparency.legal.type.preservation_request":
    "Exigência de preservação de dados",
  "transparency.legal.type.takedown_demand": "Exigência de remoção de conteúdo",
  "transparency.legal.type.other": "Tudo o resto",

  "transparency.legal.outcomeTitle": "O que fizemos quanto a elas",
  "transparency.legal.outcomeTableCaption":
    "Exigências recebidas durante o período, por aquilo que a QueerPulse fez",
  "transparency.legal.outcomeColumn": "O que fizemos",
  "transparency.legal.outcomeCountColumn": "Exigências",

  "transparency.legal.outcome.complied_in_full": "Cumprimos na totalidade",
  "transparency.legal.outcome.complied_in_part": "Cumprimos em parte",
  "transparency.legal.outcome.narrowed":
    "Contestámos e reduzimos antes de entregar seja o que for",
  "transparency.legal.outcome.refused": "Recusámos",
  "transparency.legal.outcome.withdrawn": "Retirada por quem a enviou",
  "transparency.legal.outcome.pending": "Ainda a ser respondida",

  "transparency.legal.registerTitle": "O próprio registo",

  "transparency.legal.notes.voided":
    "Um registo pode ser anulado, por ter sido introduzido duas vezes ou por erro de introdução. Um registo anulado sai de todos os números acima e passa a ser contado aqui, por isso exigências recebidas mais registos anulados é tudo o que o registo guarda para este período. Esvaziar o registo apareceria como um número nesta página.",
  "transparency.legal.notes.notified":
    "Informar um membro de que a sua conta foi nomeada é algo que a equipa faz à mão, e o número acima é a contagem que a equipa registou ter feito. Uma exigência pode chegar com uma ordem que nos proíbe de informar seja quem for, e enquanto essa ordem se mantiver ninguém pode ser informado.",
  "transparency.legal.notes.gagOrders":
    "Algumas exigências chegam com uma ordem que nos proíbe de as descrever. Essas são contadas em todos os números acima exatamente como qualquer outra exigência, e nada nesta página marca quais são. Contar uma exigência não a descreve.",
  "transparency.legal.notes.contents":
    "Esta secção publica contagens. Não publica quem pediu, nem o país, nem o processo, nem datas, nem contas, nem qualquer descrição do que tenha sido entregue. Isso fica no registo.",
  "transparency.legal.notes.suppression":
    "Uma exigência que nomeia uma ou duas contas é, para quem conhece as pessoas envolvidas, uma pessoa concreta. Por isso qualquer número aqui abaixo de <b>{floor}</b> é retido e mostrado como menos de {floor}. O zero é publicado como zero real, porque um zero não identifica ninguém. Um número retido significa que fomos questionados e estamos a reter a contagem, e nunca significa que nada aconteceu.",

  "transparency.method.title": "Como estes números são <em>feitos</em>",
  "transparency.method.counted":
    "Cada número é uma contagem ou um resumo tirado diretamente do registo da moderação no momento em que carregaste esta página. Não há uma base de dados de relatórios à parte, não há passo de introdução manual, e não há arredondamento além de uma casa decimal nas horas. As mesmas linhas alimentam a fila da própria equipa de moderação, por isso este relatório e a vista interna não podem divergir.",
  "transparency.method.suppression":
    "Uma contagem de uma ou duas não é anónima. Numa comunidade deste tamanho pode ser uma pessoa concreta e um incidente concreto, por isso qualquer número abaixo de <b>{floor}</b> é retido e mostrado como menos de {floor}. O zero é publicado como zero, porque um zero não identifica ninguém. Quando reter um número ainda permitiria deduzi-lo subtraindo os restantes ao total, um segundo número é retido com ele.",
  "transparency.method.pairs":
    "Denúncias recebidas e denúncias fechadas contam conjuntos diferentes. Uma denúncia apresentada na última semana de um trimestre costuma ser respondida no seguinte, por isso os dois números movem-se de forma independente.",

  "transparency.notCounted.title": "O que este relatório não conta",
  "transparency.notCounted.communityModeration":
    "A moderação que as comunidades fazem por si próprias. Quando quem gere uma comunidade remove ou barra alguém, isso entra no registo de governação dessa comunidade e não no da plataforma. Contar a arrumação de uma sala como aplicação de regras da plataforma inflacionaria estes números.",
  "transparency.notCounted.appealTiming":
    "Quanto tempo demorou um recurso. Um recurso regista quando foi apresentado e o que foi decidido, e nada regista quando a decisão foi tomada, por isso o número fica de fora em vez de ser estimado.",
  "transparency.notCounted.outsidePlatform":
    "Danos que aconteceram noutro sítio e nunca foram denunciados aqui. Nada consegue contar o que ninguém nos contou, e um trimestre calmo não é prova de um trimestre seguro.",
  "transparency.notCounted.selfReported":
    "Se uma decisão foi certa. Estas são contagens do que aconteceu. Os números dos recursos são o mais perto que este relatório chega de avaliar o seu próprio trabalho.",

  "transparency.links.constitution": "Ler a Constituição",
  "transparency.links.codeOfConduct": "Ler o Código de Conduta",
  "transparency.links.governance": "Voltar a Governação",
  // PRD-260: ver a nota no catálogo EN.
  "sections.proposals.signedOut":
    "Inicia sessão para veres as propostas que os membros estão a votar.",

  // PRD-261: ver a nota no catálogo EN. Nada aqui pode sugerir um email.
  "concernStatus.submitted.title": "A tua preocupação está connosco",
  "concernStatus.submitted.intro":
    "Ficou registada e está na fila que a equipa de governação vai trabalhando.",
  "concernStatus.submitted.fieldLabel": "O teu código de referência",
  "concernStatus.submitted.copy": "Copiar",
  "concernStatus.submitted.copied": "Copiado",
  "concernStatus.submitted.copiedToast": "Código de referência copiado.",
  "concernStatus.submitted.copyErrorToast":
    "O teu navegador não deixou copiar. Seleciona o código e copia à mão.",
  "concernStatus.submitted.keepIt":
    "Guarda este código num sítio a que consigas voltar. Não guardamos nenhuma cópia que te possa ser devolvida, e o QueerPulse não envia emails, por isso esta é a única forma de consultares a tua preocupação mais tarde.",
  "concernStatus.submitted.checkCta": "Ver esta preocupação",
  "concernStatus.submitted.whatHappensNext":
    "Alguém da equipa de governação lê todas as preocupações. Comprometemo-nos a dar-lhe uma primeira leitura em três dias. Volta com o teu código para veres quando alguém a pegou e como terminou.",
  "concernStatus.submitted.anotherCta": "Levantar outra preocupação",

  "concernStatus.meta.title": "Consultar uma preocupação | QueerPulse",
  "concernStatus.meta.description":
    "Consulta uma preocupação que levantaste no QueerPulse com o código de referência que recebeste.",
  "concernStatus.title": "Consultar uma preocupação",
  "concernStatus.intro":
    "Cola o código de referência que recebeste ao submeter. Mostra em que ponto está essa preocupação, e mais nada sobre ela.",
  "concernStatus.loading": "A consultar\u2026",
  "concernStatus.form.label": "Código de referência",
  "concernStatus.form.cta": "Consultar",

  "concernStatus.meta.submitted": "Submetida a {date}",
  "concernStatus.meta.updated": "Última alteração a {date}",

  "concernStatus.received.title": "Já a temos",
  "concernStatus.received.body":
    "A tua preocupação está registada e à espera. Ainda ninguém a abriu. Comprometemo-nos a dar-lhe uma primeira leitura em três dias, por isso volta cá com este código.",
  "concernStatus.reviewing.title": "Alguém está a analisá-la",
  "concernStatus.reviewing.body":
    "Alguém da equipa de governação pegou na tua preocupação e está a trabalhar nela. Volta cá com este código para veres como termina.",
  "concernStatus.resolved.title": "Esta preocupação foi resolvida",
  "concernStatus.resolved.body":
    "A equipa de governação analisou-a e agiu. Se ainda houver algo errado, levanta uma nova preocupação e diz que esta foi fechada.",
  "concernStatus.dismissed.title": "Esta preocupação foi fechada sem ação",
  "concernStatus.dismissed.body":
    "A equipa de governação leu-a e decidiu não agir. Essa decisão é deles para explicar: se quiseres que seja revista, levanta uma nova preocupação e di-lo.",

  "concernStatus.notFound.title": "Não encontramos esse código",
  "concernStatus.notFound.body":
    "Verifica se tem alguma gralha. Os códigos são longos e cada carácter conta. Sobre um código que não reconhecemos não te podemos dizer mais do que isto.",
  "concernStatus.notFound.cta": "Tentar outro código",
  "concernStatus.unavailable.title": "Não foi possível consultar neste momento",
  "concernStatus.unavailable.body":
    "Algo correu mal do nosso lado. O teu código continua válido.",
  "concernStatus.unavailable.cta": "Tentar novamente",
};
