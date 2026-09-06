import type { Catalog } from "../../types";

/**
 * Economia — pt-PT inclusivo. Mesmas chaves que `en/economy.ts`.
 *
 * Notas de tradução:
 * - Registo `tu`, caloroso, nunca `você`.
 * - "Members"/"you" evita género por omissão masculino; usa segunda pessoa e
 *   reformulação neutra sempre que possível.
 * - Termos fiscais (IVA, IRS, Segurança Social, recibos verdes, regime
 *   simplificado) mantêm-se tal como usados em Portugal — nunca traduzidos
 *   nem simplificados; o registo destas cadeias é deliberadamente conservador
 *   e literal (nunca mais informal do que o inglês).
 * - Conteúdo fictício (descrições de vagas, biografias de empresas, entradas
 *   do quadro de salários) NÃO é traduzido — em modo live vem da API.
 */
export const economy: Catalog = {
  // ── EconomyPage (hub) ──────────────────────────────────────────────────
  "hub.eyebrow": "Economia queer",
  "hub.title": "Constrói algo que <em>perdura.</em>",
  "hub.lead":
    "Ferramentas, mentoria e solidariedade para fundadoras, freelancers e profissionais queer, porque a independência económica faz parte da libertação queer.",
  "hub.tab.incubator": "Incubadora de negócios",
  "hub.tab.freelance": "Ferramentas para freelancers",
  "hub.tab.salary": "Quadro de salários",
  "hub.outro.title": "Constrói <em>connosco.</em>",
  "hub.outro.sub":
    "Uma economia queer mais forte beneficia todas as pessoas. Começa pelas ferramentas, fica pela comunidade.",
  "hub.outro.browseCta": "Ver vagas",
  "hub.outro.hostCta": "Encontrar uma pessoa mentora",

  // ── IncubatorTab ────────────────────────────────────────────────────────
  "incubator.hero.title": "Um espaço para construíres <em>a tua</em> ideia.",
  "incubator.hero.body":
    "A incubadora QueerPulse apoia fundadoras queer em Lisboa com seis meses de mentoria estruturada, responsabilização entre pares e ligações a investidores e colaboradores que percebem do que se trata.",
  "incubator.hero.applyCta": "Candidatar à 3.ª coorte",
  "incubator.hero.mentorCta": "Tornar-te mentor",
  "incubator.stats.founders": "fundadoras em 2 coortes",
  "incubator.stats.mentors": "pessoas mentoras da comunidade",
  "incubator.stats.raised": "angariados por antigas participantes",
  "incubator.programme.title": "Como <em>funciona</em> o programa.",
  "incubator.mentors.title": "Pessoas <em>mentoras</em> atuais.",
  "incubator.mentors.requestCta": "Pedir sessão",
  "incubator.mentors.empty.title":
    "O emparelhamento com mentores está a chegar",
  "incubator.mentors.empty.description":
    "Assim que a bolsa de mentores da comunidade estiver ativa, vais ser emparelhado com alguém do teu setor aqui mesmo.",
  "incubator.step.apply.title": "Candidatar",
  "incubator.step.apply.desc":
    "Uma candidatura curta, a tua ideia, onde estás, do que precisas. Sem necessidade de pitch deck. Decisão em 3 semanas.",
  "incubator.step.apply.meta": "Candidaturas abertas · Prazo 30 jul",
  "incubator.step.match.title": "Emparelhamento com mentoria",
  "incubator.step.match.desc":
    "Emparelhado com uma pessoa mentora da comunidade com base no teu setor, fase e naquilo que nos disseste que precisas. Encontram-se quinzenalmente durante seis meses.",
  "incubator.step.match.meta": "Set–fev · Sessões quinzenais",
  "incubator.step.cohort.title": "Sessões de coorte",
  "incubator.step.cohort.desc":
    "Workshops mensais com toda a coorte, jurídico, finanças, angariação de fundos, design, além de tempo para apoio entre pares e conversa honesta.",
  "incubator.step.cohort.meta": "Primeiro sábado de cada mês",
  "incubator.step.demo.title": "Noite de demonstração",
  "incubator.step.demo.desc":
    "Partilha o que construíste com a comunidade, investidores e imprensa. Baixo risco, alto apoio. Decides quanto revelar.",
  "incubator.step.demo.meta": "Março · Apenas por convite",

  // ── FreelanceTab (grelha de ferramentas) ────────────────────────────────
  "freelance.title": "Ferramentas para <em>freelancers.</em>",
  "freelance.sub":
    "Ferramentas reais e funcionais, criadas por e para freelancers queer em Portugal. Gratuitas, sem registo, e nada do que introduzires sai do teu dispositivo.",
  "freelance.section.documents": "Documentos que <em>te pagam.</em>",
  "freelance.section.numbers": "Conhece os teus <em>números.</em>",
  "freelance.section.together": "Mais fortes <em>juntas.</em>",

  "tool.invoice.title": "Gerador de faturas",
  "tool.invoice.desc":
    "Cria uma fatura-recibo limpa e correta para Portugal, NIF, opções de IVA, notas sobre a isenção do art. 53.º e a dispensa do art. 101.º-B, e guarda-a como PDF real. Os teus dados ficam guardados para a próxima vez.",
  "tool.invoice.cta": "Abrir gerador de faturas",
  "tool.contract.title": "Gerador de contratos",
  "tool.contract.desc":
    "Monta um contrato de prestação de serviços freelance cláusula a cláusula, âmbito, pagamento, propriedade intelectual, cancelamento, confidencialidade. Descarrega um PDF ou copia o texto para editar.",
  "tool.contract.cta": "Abrir gerador de contratos",
  "tool.scope.title": "Gerador de âmbito e orçamento",
  "tool.scope.desc":
    "Define exatamente o que vais entregar, o que não vais, revisões e prazos, acrescenta um preço para transformar tudo num orçamento. Exporta um PDF que evita a maioria dos conflitos.",
  "tool.scope.cta": "Abrir gerador de âmbito",
  "tool.reciboGuide.title": "Guia de recibos verdes",
  "tool.reciboGuide.desc":
    "Um guia em linguagem simples sobre o sistema fiscal para freelancers em Portugal, registo, retenção, IVA, Segurança Social e o teu primeiro ano. Sempre atualizado.",
  "tool.reciboGuide.cta": "Ler o guia",

  "tool.takeHome.title": "Calculadora de rendimento líquido",
  "tool.takeHome.desc":
    "Transforma o teu rendimento bruto de freelancer no que realmente ficas a ganhar, depois de IRS e Segurança Social, com os coeficientes do regime simplificado e os teus primeiros anos incluídos.",
  "tool.takeHome.cta": "Abrir calculadora",
  "tool.dayRate.title": "Calculadora de valor-dia",
  "tool.dayRate.desc":
    "Parte do rendimento de que precisas para chegar a um valor-dia (e por hora) que realmente te sustente, despesas gerais, dias não pagos e IVA incluídos.",
  "tool.dayRate.cta": "Abrir calculadora",
  "tool.ivaTracker.title": "Rastreador do limiar do IVA",
  "tool.ivaTracker.desc":
    "Acompanha o teu rendimento faturado face ao limite de isenção do art. 53.º (15 000 €), para nunca seres apanhada de surpresa ao ultrapassá-lo. Guardado no teu dispositivo.",
  "tool.ivaTracker.cta": "Abrir rastreador",
  "tool.setAside.title": "Planeador de reserva fiscal",
  "tool.setAside.desc":
    "Calcula que fatia de cada fatura pôr de lado agora, e mantém um saldo acumulado, para que as contas do IRS e da Segurança Social nunca te apanhem desprevenida.",
  "tool.setAside.cta": "Abrir planeador",
  "tool.comparator.title": "Freelancer vs. assalariada",
  "tool.comparator.desc":
    "Compara o que realmente ficarias a ganhar como freelancer face a um salário equivalente, líquido por líquido, com os custos que um recibo de vencimento esconde.",
  "tool.comparator.cta": "Comparar",

  "tool.rateBoard.title": "Quadro de transparência de valores",
  "tool.rateBoard.desc":
    "Valores-dia anónimos partilhados pela comunidade, por função e experiência, para que ninguém tenha de adivinhar quanto cobrar. Acrescenta o teu, vê como te posicionas.",
  "tool.rateBoard.cta": "Abrir o quadro",
  "tool.slidingScale.title": "Cartão de preços em escala móvel",
  "tool.slidingScale.desc":
    "Publica uma escala móvel para que cada pessoa pague conforme os seus meios e tu continues a receber de forma justa. Cria um cartão e exporta-o para partilhar.",
  "tool.slidingScale.cta": "Criar um cartão",

  // ── SalaryTab ───────────────────────────────────────────────────────────
  "salary.title": "Transparência <em>salarial.</em>",
  "salary.sub":
    "Submissões anónimas da comunidade. Filtra por setor, função ou tipo de contrato. Conhecimento é poder.",
  "salary.submitCta": "+ Submeter o teu",
  "salary.filter.all": "Todos os setores",
  "salary.filter.tech": "Tecnologia",
  "salary.filter.design": "Design",
  "salary.filter.creative": "Criativo",
  "salary.filter.ngo": "ONG / sem fins lucrativos",
  "salary.filter.law": "Direito",
  "salary.table.role": "Função",
  "salary.table.annual": "Anual (bruto)",
  "salary.table.experience": "Experiência",
  "salary.table.type": "Tipo",
  "salary.empty.title": "Ainda sem entradas neste setor",
  "salary.empty.description":
    "Ainda não há nada partilhado para este setor. Limpa o filtro para ver todas as submissões, ou junta a tua para ajudar a próxima pessoa a negociar.",
  "salary.empty.clear": "Limpar filtros",
  "salary.emptyLive.title": "O painel de salários está a chegar",
  "salary.emptyLive.description":
    "Sê a primeira pessoa a adicionar um salário anónimo e ajuda quem vem a seguir a chegar preparado à negociação.",
  "salary.disclaimer":
    "Todas as entradas são anónimas. Não é guardado nome, email nem empregador. As entradas são revistas por uma pessoa moderadora antes de aparecerem.",
  "salary.helpBody":
    "Ajuda a comunidade partilhando o que ganhas. Quantas mais entradas, mais útil isto se torna para todas as pessoas, sobretudo para quem está a começar a negociar.",
  "salary.submitLong": "Submeter o teu salário",
  "salary.submitToast": "Submetido de forma anónima. Obrigade",

  // ── WorkHubPage ─────────────────────────────────────────────────────────
  "workHub.eyebrow": "O teu espaço de trabalho",
  "workHub.title": "O teu trabalho, <em>{name}.</em>",
  "workHub.status.live": "Tudo sobre o teu trabalho, num só lugar.",
  "workHub.section.needsYou": "O que precisa de ti",
  "workHub.section.whereThingsStand": "Como estão as coisas",
  "workHub.section.profile": "O teu perfil de trabalho",
  "workHub.emptyLive.title":
    "O teu espaço de trabalho está pronto quando quiseres",
  "workHub.emptyLive.description":
    "Candidata-te a uma vaga, encontra uma pessoa mentora ou guarda uma vaga e tudo se vai juntar aqui, candidaturas, subsídios, saberes e avaliações numa só vista.",
  "workHub.emptyLive.cta": "Ver vagas",

  // ── work.data.tsx (linha de estado + próximas ações + cartões de estado) ─
  "workHub.statusLine.apps_one": "{count} candidatura ativa",
  "workHub.statusLine.apps_other": "{count} candidaturas ativas",
  "workHub.statusLine.offers": "{count} proposta para responder",
  "workHub.statusLine.noOffers": "ainda sem propostas",
  "workHub.statusLine.mentorThreads": "2 conversas de mentoria",

  "workHub.next.offer.label": "Responde à tua proposta de {company}",
  "workHub.next.offer.context": "Estão à espera da tua decisão.",
  "workHub.next.offer.urgency": "Fecha em {days} dias",
  "workHub.next.offer.cta": "Rever proposta",
  "workHub.next.mentor.label":
    "{name} respondeu sobre o teu emparelhamento de mentoria",
  "workHub.next.mentor.context":
    "Uma primeira chamada de apresentação está em cima da mesa.",
  "workHub.next.mentor.cta": "Ler resposta",
  "workHub.next.grant.label": "Prazo do micro-subsídio esta sexta-feira",
  "workHub.next.grant.context": "{fund} · até {amount}.",
  "workHub.next.grant.urgency": "Prazo sex.",
  "workHub.next.grant.cta": "Ver subsídio",
  "workHub.next.profile.label":
    "O teu perfil de trabalho está {percent}% completo",
  "workHub.next.profile.context":
    "Acrescenta a tua preferência de visibilidade no trabalho para seres emparelhada em segurança.",
  "workHub.next.profile.cta": "Concluir perfil",

  "workHub.card.apps.label": "Candidaturas",
  "workHub.card.apps.primary": "{active} ativas / {sent} enviadas",
  "workHub.card.apps.noOffers": "Ainda sem propostas",
  "workHub.card.apps.trackAll":
    "Acompanha todas as vagas a que te candidataste",
  "workHub.card.apps.viewAll": "Ver todas as candidaturas",
  "workHub.card.mentor.label": "Mentoria",
  "workHub.card.mentor.primary": "1 mentoria ativa",
  "workHub.card.mentor.next": "{count} pessoas mentoras com vagas abertas",
  "workHub.card.saved.label": "Vagas guardadas",
  "workHub.card.saved.primary": "5 vagas guardadas",
  "workHub.card.saved.next": "2 a fechar esta semana",
  "workHub.card.grants.label": "Subsídios e financiamento",
  "workHub.card.grants.primary": "2 prazos este mês",
  "workHub.card.grants.next": "{fund} abre em breve",
  "workHub.card.reviews.label": "Avaliações de empregadores",
  "workHub.card.reviews.primary": "Já avaliaste 2",
  "workHub.card.reviews.next": "1 rascunho por terminar",

  // ── WorkProfilePage / WorkProfileCard / WorkProfileSections ────────────
  "workProfile.success.title":
    "O teu perfil de trabalho está <em>definido.</em>",
  "workProfile.success.sub":
    "Apareces às empresas exatamente como escolheres, e nunca de outra forma.",
  "workProfile.success.backCta": "Voltar ao teu espaço de trabalho",
  "workProfile.success.editCta": "Continuar a editar",
  "workProfile.eyebrow": "Perfil de trabalho",
  "workProfile.title": "Como apareces <em>no trabalho.</em>",
  "workProfile.sub":
    "Isto controla o que as empresas veem, e o que fica só contigo. Nada aqui é partilhado sem a tua autorização.",
  "workProfile.saveCta": "Guardar perfil de trabalho",
  "workProfile.savingLabel": "A guardar…",
  "workProfile.savedToast": "Perfil de trabalho guardado",
  "workProfile.saveFailedToast":
    "Não conseguimos guardar, as tuas definições ficaram exatamente como estavam. Tenta outra vez daqui a pouco.",

  "workProfile.card.meterLabel": "Perfil {percent}% completo",
  "workProfile.card.note":
    "Isto controla como apareces às empresas, e o que fica só contigo.",
  "workProfile.card.editCta": "Editar perfil de trabalho",

  "workProfile.identity.title": "Identidade <em>profissional</em>",
  "workProfile.identity.sub": "Como és identificade e descrite às empresas.",
  "workProfile.identity.nameInUse": "Nome utilizado",
  "workProfile.identity.legalName": "Nome legal",
  "workProfile.identity.legalNameOptional": "mantido privado",
  "workProfile.identity.legalNamePlaceholder": "Só quando exigido por lei",
  "workProfile.identity.legalNameHint":
    "Guardado de forma privada e usado apenas quando a lei o exige.",
  "workProfile.identity.pronouns": "Pronomes",
  "workProfile.identity.pronounsWriteOwn": "Escreve os teus",
  "workProfile.identity.pronounsPlaceholder": "ex.: xe/xem",
  "workProfile.identity.pronounsAdd": "Adicionar",
  "workProfile.identity.pronounsRemoveAria": "Remover {pronoun}",
  "workProfile.identity.headline": "Título profissional",
  "workProfile.identity.location": "Localização",
  "workProfile.identity.bio": "Biografia curta",
  "workProfile.identity.bioPlaceholder":
    "Umas linhas sobre o que fazes e o que procuras…",

  "workProfile.showUp.title": "Como apareces <em>no trabalho</em>",
  "workProfile.showUp.sub":
    "Tu decides o que as empresas veem. Nada aqui é partilhado sem a tua autorização.",
  "workProfile.showUp.outAtWork": "Assumide no trabalho",
  "workProfile.showUp.outAtWorkAriaLabel": "Assumide no trabalho",
  "workProfile.showUp.transSupport": "Apoio trans e não-binárie",
  "workProfile.showUp.transSupportOptional": "opcional",
  "workProfile.showUp.matrixLabel": "O que as empresas veem vs a comunidade",
  "workProfile.showUp.matrixField": "Campo",
  "workProfile.showUp.matrixEmployers": "Empresas veem",
  "workProfile.showUp.matrixCommunity": "Comunidade vê",
  "workProfile.showUp.safeOnly.label":
    "Mostrar-me apenas a empresas verificadas como seguras pela comunidade",
  "workProfile.showUp.safeOnly.desc":
    "Ignora tudo o que ainda não foi validado pela rede.",

  "workProfile.outAtWork.out.label": "Totalmente assumide",
  "workProfile.outAtWork.out.desc":
    "A tua identidade queer fica visível para quem vir o teu perfil de trabalho.",
  "workProfile.outAtWork.verified.label":
    "Assumide apenas para empresas verificadas",
  "workProfile.outAtWork.verified.desc":
    "Só empresas verificadas como seguras pela comunidade veem isto. As restantes veem um perfil neutro.",
  "workProfile.outAtWork.private.label": "Privado",
  "workProfile.outAtWork.private.desc":
    "A tua identidade queer nunca é mostrada às empresas. Tu decides a quem contas, e quando.",

  "workProfile.transSupport.chosenName.label":
    "Candidaturas apenas com nome utilizado",
  "workProfile.transSupport.chosenName.desc":
    "As candidaturas usam o teu nome utilizado. Nunca um nome legal.",
  "workProfile.transSupport.hideLegal.label":
    "Não mostrar o meu nome legal às empresas",
  "workProfile.transSupport.hideLegal.desc":
    "Mantido privado e usado apenas quando exigido por lei.",
  "workProfile.transSupport.transitionFriendly.label":
    "Preferir empresas amigas de pessoas em transição",
  "workProfile.transSupport.transitionFriendly.desc":
    "Prioriza empresas verificadas por políticas inclusivas para pessoas trans.",

  "workProfile.visMatrix.nameInUse": "Nome utilizado",
  "workProfile.visMatrix.legalName": "Nome legal",
  "workProfile.visMatrix.pronouns": "Pronomes",
  "workProfile.visMatrix.queerIdentity": "Identidade queer",
  "workProfile.visMatrix.skillsFocus": "Saberes e focos",
  "workProfile.visMatrix.visible": "Visível",
  "workProfile.visMatrix.hidden": "Oculto",
  "workProfile.visMatrix.yourChoice": "A tua escolha",
  "workProfile.visMatrix.perSettingAbove": "Consoante a definição acima",

  "workProfile.skillsFocus.title": "Saberes <em>e foco</em>",
  "workProfile.skillsFocus.sub":
    "Usados para te emparelhar na troca de saberes e com mentorias.",
  "workProfile.skillsFocus.skills": "Saberes",
  "workProfile.skillsFocus.focusAreas": "Áreas de foco",

  "workProfile.skill.branding": "Identidade de marca",
  "workProfile.skill.backend": "Engenharia backend",
  "workProfile.skill.fundraising": "Angariação de fundos",
  "workProfile.skill.photography": "Fotografia",
  "workProfile.skill.copywriting": "Copywriting",
  "workProfile.skill.product": "Produto",

  "workProfile.focus.careerDirection": "Direção de carreira",
  "workProfile.focus.comingOut": "Assumir-se profissionalmente",
  "workProfile.focus.creativePractice": "Prática criativa",
  "workProfile.focus.startingBusiness": "Começar um negócio",
  "workProfile.focus.difficultWorkplace":
    "Navegar um ambiente de trabalho difícil",
  "workProfile.focus.mentalHealth": "Saúde mental no trabalho",

  // ── JobsPage (quadro de vagas) ─────────────────────────────────────────
  "jobs.eyebrow": "Quadro de vagas",
  "jobs.title": "Trabalho que <em>não te pede para te esconderes.</em>",
  "jobs.lead":
    "Negócios geridos por pessoas queer e empresas verificadas como inclusivas, vagas onde podes aparecer como és. Sem rainbow capitalism. Cada anúncio é validado pela comunidade.",
  "jobs.badge.queerRun": "Gerido por pessoas queer",
  "jobs.badge.verified": "Verificado pela comunidade",
  "jobs.badge.location": "Lisboa + remoto",
  "jobs.postCta": "+ Publicar uma vaga",

  "jobs.filter.all": "Todas as vagas",
  "jobs.filter.design": "Design",
  "jobs.filter.tech": "Tecnologia",
  "jobs.filter.arts": "Artes e cultura",
  "jobs.filter.care": "Cuidados",
  "jobs.filter.food": "Restauração",
  "jobs.filter.community": "Comunidade",

  "jobs.card.applyBy": "Candidaturas até {date}",
  "jobs.card.deadlineOpen": "Sem prazo",
  "jobs.card.save": "Guardar",
  "jobs.card.saved": "Guardada",
  "jobs.card.saveAriaLabel": "Guardar {title}",
  "jobs.card.unsaveAriaLabel": "Remover {title} das guardadas",
  "jobs.card.savedToast": "{title} guardada",
  "jobs.card.unsavedToast": "{title} removida das guardadas",
  "jobs.card.applyCta": "Candidatar",
  "jobs.card.applyAriaLabel": "Candidatar a {title}",

  "jobs.safetyBanner.text":
    "Ajustado ao teu perfil de trabalho, a mostrar <strong>empresas verificadas como seguras</strong>.",
  "jobs.safetyBanner.link": "Alterar no teu perfil de trabalho",
  "jobs.safetyBanner.showVerified": "Mostrar só verificadas",
  "jobs.safetyBanner.showAll": "Mostrar todas",
  "jobs.safetyBanner.showAllCount": "Mostrar todas (mais {count})",

  "jobs.loadError.title": "Não foi possível carregar o quadro de vagas",
  "jobs.loadError.description":
    "As vagas continuam lá. Tenta de novo daqui a um instante.",
  "jobs.empty.title": "Nenhuma vaga corresponde neste momento",
  "jobs.empty.verifiedDescription":
    "Ainda não há nada verificado como seguro nesta categoria. Mostra todas as vagas ou escolhe outra categoria.",
  "jobs.empty.description":
    "Sem vagas nesta categoria de momento. Vê todas as vagas ou volta em breve, há anúncios novos todas as semanas.",
  "jobs.empty.showAll": "Mostrar todas as vagas",
  "jobs.empty.clearCategory": "Limpar categoria",

  "jobs.loadingMore": "A carregar…",
  "jobs.loadMoreCta": "Carregar mais vagas",

  "jobs.employers.title": "Empresas queer <em>em que confiamos</em>",
  "jobs.employers.subtitle":
    "Estas organizações são geridas por ou para a comunidade queer. Trabalhar aqui significa que o teu dinheiro fica na rede.",
  "jobs.employers.loadingMore": "A carregar…",
  "jobs.employers.loadMoreCta": "Carregar mais empresas",

  // ── Distintivos de segurança (vocabulário partilhado) ──────────────────
  "safetyBadge.verified.label": "Verificada como segura",
  "safetyBadge.verified.blurb":
    "Este selo é conquistado. Confirmamos as políticas inclusivas no papel e cruzamos com pelo menos três avaliações anónimas de quem lá trabalha ou trabalhou. Reverificado todos os anos.",
  "safetyBadge.trans.label": "Amiga de pessoas trans",
  "safetyBadge.trans.blurb":
    "Prática documentada de inclusão trans: cuidados de saúde de afirmação de género no plano, um processo de mudança de nome e pronomes, e instalações neutras quanto ao género, confirmado por avaliações de quem lá trabalha.",
  "safetyBadge.out.label": "Seguro para te assumires",
  "safetyBadge.out.blurb":
    'A comunidade avalia esta empresa com 8+/10 em "seguro para te assumires no trabalho", ser aberte sobre quem és aqui é um não-acontecimento.',
  "safetyBadge.affiliation.run.label": "Gerida por pessoas queer",
  "safetyBadge.affiliation.run.blurb":
    "Liderada ou detida por pessoas queer, decisões, cultura e dinheiro ficam dentro da comunidade. Verificado por nós durante a validação.",
  "safetyBadge.affiliation.friendly.label": "Amiga da comunidade queer",
  "safetyBadge.affiliation.friendly.blurb":
    "Uma empresa acolhedora, com políticas inclusivas e uma presença LGBTQ+ real, mas não liderada por pessoas queer. Bem-vinda, apenas não é detida pela comunidade.",

  // ── jobs.adapters.ts (chrome composto em modo live) ────────────────────
  // O adaptador live tem de emitir chaves, nunca inglês composto, para que
  // demo e live mostrem a mesma frase traduzida.
  "jobs.pay.barterOrDiscuss": "Troca / a combinar",
  "jobs.pay.competitive": "Competitivo",
  "jobs.pay.openToBarter": "Aberto a troca",
  "jobs.pay.toDiscuss": "A combinar",
  "jobs.pay.perHour": "/hora",
  "jobs.pay.perDay": "/dia",
  "jobs.pay.perProject": "/projeto",
  "jobs.pay.perMonth": "/mês",
  "jobs.pay.perYear": "/ano",
  "jobs.posted.on": "Publicada a {date}",
  "jobs.posted.recently": "Publicada recentemente",
  "jobs.qrLabel.inclusive": "Inclusiva",

  // ── JobDetailPage (+ cabeçalho / corpo / barra lateral) ────────────────
  "jobDetail.breadcrumb.jobs": "Vagas",
  "jobDetail.savedToast": "Anúncio guardado no teu perfil.",
  "jobDetail.unsavedToast": "Anúncio removido das guardadas.",
  "jobDetail.chip.applyBy": "Candidaturas até {date}",

  "jobDetail.section.about": "Sobre a vaga",
  "jobDetail.section.dayToDay": "No dia a dia",
  "jobDetail.section.lookingFor": "O que procuramos",
  "jobDetail.section.offer": "O que oferecemos",
  "jobDetail.section.aboutCompany": "Sobre {company}",
  "jobDetail.section.viewCompany": "Ver perfil da empresa",
  "jobDetail.section.safety": "Segurança",
  "jobDetail.section.safetyBody":
    "Como {company} é avaliada pela comunidade nas coisas que importam a profissionais queer.",
  "jobDetail.section.safetyReviews": "Ver avaliações de segurança",

  "jobDetail.sidebar.salary": "Salário",
  "jobDetail.sidebar.type": "Tipo",
  "jobDetail.sidebar.location": "Localização",
  "jobDetail.sidebar.category": "Categoria",
  "jobDetail.sidebar.deadline": "Prazo",
  "jobDetail.sidebar.applyCta": "Candidatar agora",
  "jobDetail.sidebar.shareToCommunityCta": "Partilhar numa comunidade",

  // ── ShareToCommunityModal ───────────────────────────────────────────────
  "shareToCommunity.eyebrow": "Passa a palavra",
  "shareToCommunity.title": "Partilha numa <em>comunidade.</em>",
  "shareToCommunity.ariaLabel": "Partilha numa comunidade",
  "shareToCommunity.sub":
    "Publica isto numa das tuas salas. Aparece no mural da sala e no feed, sob as regras dessa comunidade.",
  "shareToCommunity.communityLabel": "Que comunidade",
  "shareToCommunity.communityPlaceholder": "Escolhe uma comunidade",
  "shareToCommunity.noteLabel": "Diz alguma coisa sobre isto",
  "shareToCommunity.notePlaceholder":
    "Porque é que isto pode servir a alguém daqui…",
  "shareToCommunity.defaultNote":
    "Partilho isto caso sirva a alguém daqui: {title} na {organization}.",
  "shareToCommunity.moderationNote":
    "Publicado em teu nome, nessa comunidade. A moderação de lá pode editar ou remover, como em qualquer publicação.",
  "shareToCommunity.noCommunities":
    "Ainda não estás em nenhuma comunidade. Junta-te a uma e podes partilhar coisas lá.",
  "shareToCommunity.cancel": "Cancelar",
  "shareToCommunity.shareCta": "Publicar",
  "shareToCommunity.sending": "A publicar…",
  "shareToCommunity.errorNotAllowed":
    "De momento não podes publicar nessa comunidade. Pode estar congelada, arquivada, ou podes já ter saído.",
  "shareToCommunity.errorGone": "Essa comunidade já não existe. Escolhe outra.",
  "shareToCommunity.errorFailed":
    "A tua publicação não foi enviada. Tenta outra vez daqui a um bocado.",
  "shareToCommunity.success.title": "Está",
  "shareToCommunity.success.em": "publicado.",
  "shareToCommunity.success.body":
    "A tua publicação está no <strong>{community}</strong> e no feed.",
  "shareToCommunity.success.closeLabel": "Concluído",
  "jobDetail.report.cta": "Denunciar esta vaga",
  "jobDetail.report.ariaLabel": "Denunciar {name}",

  // ── HousingPage / HousingBoard / HousingSections ───────────────────────
  "housing.meta.title": "Quadro de habitação e colegas de casa em Lisboa",
  "housing.meta.description":
    "Encontra um quarto, uma sublocação ou um colega de casa em Lisboa no quadro de habitação da QueerPulse. Vê os anúncios, filtra por tipo, ou anuncia o teu próprio espaço.",
  "housing.tabs.housing": "Habitação",
  "housing.tabs.flatmates": "Colegas de casa",
  "housing.hero.eyebrow": "Quadro de Habitação · Lisboa",
  "housing.hero.title":
    "Encontra uma casa, e as pessoas com quem <em>a partilhar.</em>",
  "housing.hero.lead":
    "Um quadro de habitação específico para pessoas queer em Lisboa. Vê espaços para arrendar, ou encontra alguém com quem partilhes casa e possas ser tu mesme. Tudo dentro da rede da comunidade.",
  "housing.hero.note":
    "Cada anúncio e perfil é publicado por uma pessoa membro verificada da QueerPulse",

  "housing.filter.all": "Todos os anúncios",
  "housing.filter.sublet": "Sublocação",
  "housing.filter.room": "Quarto partilhado",
  "housing.filter.short": "Curta duração",
  "housing.filter.studio": "Estúdio / apartamento inteiro",
  "housing.listSpaceCta": "+ Anunciar o teu espaço",
  "housing.loadError.title": "Não foi possível carregar o quadro de habitação",
  "housing.loadError.description":
    "As casas continuam lá. Tenta de novo daqui a um instante.",
  "housing.loadMore": "Ver mais casas",
  "housing.loadingMore": "A carregar mais casas…",
  "housing.filterBar.area": "Bairro",
  "housing.filterBar.areaAny": "Qualquer bairro",
  "housing.filterBar.areaSelected": "{count} selecionados",
  "housing.filterBar.areaClear": "Limpar bairros",
  "housing.filterBar.price": "Preço (€ / mês)",
  "housing.filterBar.min": "Mín.",
  "housing.filterBar.max": "Máx.",
  "housing.filterBar.priceMin": "Preço mínimo",
  "housing.filterBar.priceMax": "Preço máximo",
  "housing.filterBar.beds": "Quartos",
  "housing.filterBar.bedsAny": "Qualquer",
  "housing.filterBar.bedsStudio": "Estúdio",
  "housing.filterBar.beds1": "1+",
  "housing.filterBar.beds2": "2+",
  "housing.filterBar.beds3": "3+",
  "housing.filterBar.availableBy": "Disponível até",
  "housing.filterBar.bills": "Despesas incluídas",
  // PRD-250. Filtros que faltavam apesar de os dados já existirem.
  "housing.filterBar.furnished": "Mobilado",
  "housing.filterBar.pets": "Aceita animais",
  "housing.filterBar.accessibility": "Com info de acesso",
  "housing.filterBar.verified": "Só verificados",
  "housing.filterBar.flagsLabel": "Tem de ter",
  "housing.filterBar.chip.priceRange": "€{min}–€{max}",
  "housing.filterBar.chip.priceFrom": "A partir de €{min}",
  "housing.filterBar.chip.priceUpTo": "Até €{max}",
  // PRD-250. `depositMax` é o aria-label do campo.
  "housing.filterBar.deposit": "Caução",
  "housing.filterBar.depositMax": "Caução máxima",
  "housing.filterBar.chip.depositUpTo": "Caução até €{max}",
  "housing.filterBar.chip.beds": "{beds} quartos",
  "housing.filterBar.chip.availableBy": "Até {date}",
  "housing.map.ariaLabel": "Mapa de anúncios por bairro",
  "housing.map.error":
    "Não foi possível carregar o mapa. Use a vista de lista.",
  "housing.map.count": "{count} casas",
  "housing.map.empty": "Ainda não há casas com estes filtros.",
  "housing.map.jumpToList": "Ir para {count} casas",
  "housing.map.viewList": "Lista",
  "housing.map.viewMap": "Mapa",
  "housing.saveSearch.cta": "Guardar esta procura",
  "housing.saveSearch.namePlaceholder": "Dá um nome a esta procura",
  "housing.saveSearch.nameLabel": "Nome desta procura guardada",
  "housing.saveSearch.save": "Guardar",
  "housing.saveSearch.cancel": "Cancelar",
  "housing.saveSearch.saved":
    "Procura guardada, avisamos-te quando aparecer uma casa assim.",
  "housing.saveSearch.error":
    "Não deu para guardar essa procura. Tenta outra vez daqui a pouco.",
  "housing.savedSearches.title": "As tuas procuras guardadas",
  "housing.savedSearches.alertsOn": "Alertas ativos",
  "housing.savedSearches.remove": "Remover procura guardada {name}",
  "housing.savedSearches.removed": "Procura guardada removida",

  "housing.empty.filteredTitle": "Sem anúncios deste tipo neste momento",
  "housing.empty.title": "O quadro de habitação está parado neste momento",
  "housing.empty.filteredDescription":
    "Ainda não há nada publicado nesta categoria. Limpa o filtro para ver todos os espaços abertos pela comunidade, há anúncios novos com frequência.",
  "housing.empty.description":
    "Ainda não há espaços publicados. Quando as pessoas partilharem sublocações, quartos partilhados e estadias de curta duração, vão aparecer aqui. Volta em breve, ou anuncia o teu próprio espaço.",
  "housing.empty.clearFilters": "Limpar filtros",
  "housing.empty.listSpace": "Anunciar um espaço",
  "housing.listing.photoAlt": "Foto · {hood}",
  "housing.listing.from": "A partir de {date}",
  "housing.card.saveAriaLabel": "Guardar {title}",
  "housing.card.unsaveAriaLabel": "Remover {title} das guardadas",
  "housing.card.savedToast": "{title} guardada",
  "housing.card.unsavedToast": "{title} removida das guardadas",

  "housing.landlords.heading":
    "Pessoas proprietárias <em>recomendadas pela comunidade</em>",
  "housing.landlords.subtitle":
    "A comunidade já confirmou que estas pessoas proprietárias são queer-friendly, de confiança e justas. Não é uma garantia, faz sempre a tua própria verificação.",
  "housing.landlords.endorsedBadge": "Recomendação da comunidade",
  "housing.landlords.suggestCta": "Sugerir uma pessoa proprietária",
  "housing.landlords.emptyTitle":
    "Ainda sem pessoas proprietárias recomendadas",
  "housing.landlords.emptyBody":
    "Sê a primeira pessoa a indicar alguém em quem confiaste, queer-friendly, de confiança e justa.",

  "housing.tipsHeading":
    "Habitação em Lisboa, <em>o que precisas de saber</em>",
  "housing.tip.budget.title": "Orça para um mercado competitivo",
  "housing.tip.budget.text":
    "Quartos em bairros centrais custam entre 700 e 1000 €/mês. Estúdios entre 900 e 1400 €. As coisas movem-se depressa. Tem os documentos prontos: NIF, comprovativo de rendimentos ou fiador, e uma mensagem de apresentação.",
  "housing.tip.board.title": "Usa o quadro da comunidade",
  "housing.tip.board.text":
    "O quadro da QueerPulse mostra habitação, quase sempre, antes de chegar a qualquer portal. Publica “procuro quarto em [bairro]” e a rede responde. Funciona.",
  "housing.tip.rights.title": "Conhece os teus direitos no arrendamento",
  "housing.tip.rights.text":
    "A lei do arrendamento em Portugal é razoavelmente protetora. É exigido um contrato escrito. Não é possível um despejo sem aviso prévio adequado. A ILGA Portugal pode aconselhar-te se enfrentares discriminação.",
  "housing.tip.shortTerm.title": "Começar por algo temporário está bem",
  "housing.tip.shortTerm.text":
    "É perfeitamente válido chegar com uma sublocação de curta duração por 2–3 meses e encontrar habitação de longo prazo quando já conheceres melhor a cidade.",
  "housing.tip.gut.title": "Confia no teu instinto nas visitas",
  "housing.tip.gut.text":
    "Conhece a pessoa proprietária antes de assinar. Pergunta sobre quem mais vive lá. Uma má sensação vale mais do que um bom preço.",
  "housing.tip.emergency.title":
    "Em caso de emergência, pede ajuda à comunidade",
  "housing.tip.emergency.text":
    "Se ficares subitamente sem casa ou numa situação de habitação perigosa, publica no quadro. A comunidade responde depressa a uma necessidade genuína.",

  "housing.subpages.eyebrow": "Habitação",
  "housing.subpages.title": "Mais sobre habitação",
  "housing.subpages.coop.label": "Cooperativa de Habitação",
  "housing.subpages.coop.blurb":
    "Pessoas a comprar e gerir casas em conjunto, como se formam as cooperativas, e como te podes juntar a uma.",

  "housing.outro.title": "Encontrar casa <em>em conjunto.</em>",
  "housing.outro.sub":
    "Cada anúncio aqui vem de alguém da comunidade. Anuncia o teu espaço, ou publica o que procuras. A rede move-se depressa pelos seus.",
  "housing.outro.listCta": "Anunciar o teu espaço",
  "housing.outro.askForum": "Perguntar no fórum",

  // ── HousingModals (mensagem à pessoa anunciante / recomendar) ──────────
  "housingModal.charsToSend_one": "Falta mais {count} caráter para enviar",
  "housingModal.charsToSend_other": "Faltam mais {count} carateres para enviar",
  "housingModal.charsToSubmit_one": "Falta mais {count} caráter para submeter",
  "housingModal.charsToSubmit_other":
    "Faltam mais {count} carateres para submeter",
  "housingModal.charsCount_one": "{count} caráter",
  "housingModal.charsCount_other": "{count} carateres",
  "housingModal.cancel": "Cancelar",
  "housingModal.done": "Concluído",
  // PRD-245. Igual a `marketing:directory.detail.enquiry.openThreadCta`.
  "housingModal.message.openThreadCta": "Abrir a conversa",

  "housingModal.message.ariaLabel": "Enviar mensagem a quem anunciou",
  "housingModal.message.successTitle": "Mensagem <em>enviada.</em>",
  "housingModal.message.successBody":
    "A tua mensagem está a caminho de <strong>{toName}</strong>, que costuma responder <strong>{responseTime}</strong>. Vais receber aqui uma notificação quando o fizer. Os contactos são partilhados assim que ambas as partes concordarem em avançar.",
  "housingModal.message.successBodyNoReplyTime":
    "A tua mensagem está a caminho de <strong>{toName}</strong>. Vais receber aqui uma notificação quando responder. Os contactos são partilhados assim que ambas as partes concordarem em avançar.",
  "housingModal.message.eyebrow": "Enviar mensagem a quem anunciou",
  "housingModal.message.title": "Enviar mensagem a <em>{toName}</em>",
  "housingModal.message.body":
    "Sobre <strong>{listingTitle}</strong>. Mantém um tom humano, uma frase sobre quem és e porque te interessa já ajuda muito. O teu perfil é partilhado com a mensagem.",
  "housingModal.message.note":
    "Para tua segurança, mantém a conversa dentro da QueerPulse até se terem conhecido pessoalmente. Nunca envies um depósito antes de visitar o espaço.",
  "housingModal.message.send": "Enviar mensagem",
  "housingModal.message.error":
    "Não foi possível enviar a tua mensagem, não foi entregue. Verifica a ligação e tenta novamente.",
  "housingModal.message.draftNamed":
    'Olá, {name}! Tenho interesse em "{listingTitle}". Ainda está disponível? Um pouco sobre mim: ',
  "housingModal.message.draftGeneric":
    'Olá! Tenho interesse em "{listingTitle}". Ainda está disponível? Um pouco sobre mim: ',

  "housingModal.recommend.ariaLabel": "Recomendar uma pessoa proprietária",
  "housingModal.recommend.successTitle": "Agradecemos. <em>Registada.</em>",
  "housingModal.recommend.successBody":
    "A tua recomendação para <strong>{landlordName}</strong> vai aparecer assim que uma pessoa moderadora confirmar que arrendaste com esta pessoa. É assim que o quadro se mantém de confiança. É este tipo de gesto que torna a mudança de casa de alguém muito mais segura.",
  "housingModal.recommend.eyebrow": "Recomendar uma pessoa proprietária",
  "housingModal.recommend.title": "Recomendar <em>{landlordName}</em>",
  "housingModal.recommend.body":
    "Arrendaste com esta pessoa e correu bem. Conta a outras pessoas da comunidade o que podem esperar, os pormenores concretos e úteis que gostavas de ter sabido antes.",
  "housingModal.recommend.ratingLabel": "A tua avaliação",
  "housingModal.recommend.starAriaLabel_one": "{count} estrela",
  "housingModal.recommend.starAriaLabel_other": "{count} estrelas",
  "housingModal.recommend.whatShouldKnow":
    "O que devem saber as outras pessoas?",
  "housingModal.recommend.placeholder":
    "Como foram as reparações, os contratos, os depósitos? Foi respeitada a tua privacidade e as tuas relações? Os pormenores ajudam.",
  // PRD-249. A declaração de arrendamento, obrigatória em recomendações novas.
  "housingModal.recommend.attestLabel": "Arrendei mesmo a {landlordName}.",
  "housingModal.recommend.tenancyLabel":
    "Mais ou menos quando arrendaste a esta pessoa?",
  "housingModal.recommend.tenancyFrom": "De",
  "housingModal.recommend.tenancyTo": "Até",
  "housingModal.recommend.stillRenting": "Ainda arrendo a esta pessoa",
  "housingModal.recommend.tenancyHint":
    "O mês chega. Ninguém te está a pedir o dia.",
  "housingModal.recommend.unverifiedNote":
    "Isto vai para uma página sobre {landlordName}, uma pessoa real que não tem conta aqui. Vai ficar marcado como declarado pelo próprio e não verificado, porque a QueerPulse não consegue verificar nada disto, e {landlordName} pode pedir para responder.",
  "housingModal.recommend.note":
    "As recomendações são verificadas antes de aparecerem. Recomenda apenas pessoas proprietárias com quem tenhas mesmo arrendado.",
  "housingModal.recommend.submit": "Submeter recomendação",
  "housingModal.recommend.error":
    "Não foi possível submeter a tua recomendação, verifica a ligação e tenta novamente.",

  // ── ListSpaceModal ──────────────────────────────────────────────────────
  "listSpace.type.sublet": "Sublocação",
  "listSpace.type.room": "Quarto partilhado",
  "listSpace.type.short": "Curta duração",
  "listSpace.type.studio": "Estúdio / apartamento inteiro",
  "listSpace.success.title": "Anúncio",
  "listSpace.success.em": "submetido.",
  "listSpace.success.body":
    "Obrigade por partilhares <strong>{title}</strong>. Uma pessoa moderadora verifica todos os anúncios antes de entrarem no ar, normalmente dentro de um dia, para o quadro se manter de confiança para todas as pessoas à procura de um lugar seguro para viver.",
  "listSpace.eyebrow": "Quadro de habitação",
  "listSpace.title": "Anuncia o teu <em>espaço.</em>",
  "listSpace.sub":
    "Abre o teu espaço a uma pessoa verificada da comunidade. Conta como é viver lá, junta algumas fotos, e uma pessoa moderadora lê cada anúncio antes de chegar ao quadro.",
  "listSpace.titleLabel": "Título do anúncio *",
  "listSpace.titlePlaceholder":
    "ex.: Quarto soalheiro numa casa partilhada queer",
  "listSpace.areaLabel": "Bairro / zona *",
  "listSpace.areaPlaceholder": "ex.: Arroios, Lisboa",
  "listSpace.rentLabel": "Renda mensal (€) *",
  "listSpace.rentPlaceholder": "ex.: 650",
  // PRD-250. Opcional. Em branco significa "não indicada", e nesse caso a casa
  // fica de fora das pesquisas com limite de caução.
  "listSpace.depositLabel": "Caução (€)",
  "listSpace.depositPlaceholder": "ex.: 900",
  "listSpace.depositHint":
    "Deixa em branco se ainda não definiste uma caução. Quem filtra por caução não vê casas que não indicaram nenhuma.",
  "listSpace.bedroomsLabel": "Quartos",
  "listSpace.bedroomsPlaceholder": "ex.: 1, usa 0 para um estúdio",
  "listSpace.typeLabel": "Tipo de espaço *",
  "listSpace.chooseOne": "Escolhe uma opção…",
  "listSpace.accessLabel": "Acessos e circulação *",
  "listSpace.accessPlaceholder":
    "ex.: Segundo andar, sem elevador, um lance de escadas. Sem degraus lá dentro.",
  "listSpace.photoGuide.title": "Umas boas fotos fazem toda a diferença",
  "listSpace.photoGuide.lit":
    "Fotografa com luz natural, quartos bem iluminados passam confiança.",
  "listSpace.photoGuide.rooms":
    "Mostra mais do que um quarto, e também a cozinha e a casa de banho.",
  "listSpace.photoGuide.consent":
    "Deixa de fora os rostos de colegas de casa, a menos que tenham dado autorização.",
  // ── ListSpaceDetailFields + ListSpacePhotoField (LOC-09) ───────────────
  "listSpace.areaHint":
    "Só o bairro. Todas as casas deste quadro ficam em {city}.",
  // PRD-241. A morada, que nenhum formulário recolhia até agora.
  "listSpace.addressLabel": "Morada",
  "listSpace.addressPlaceholder": "ex.: Rua da Escola Politécnica 42",
  "listSpace.addressHint":
    "Opcional e privada. Só é partilhada com quem te ligas ou a quem aceitas uma visita. Todos os outros veem o bairro.",
  "listSpace.blurbLabel": "Resumo numa linha",
  "listSpace.blurbPlaceholder":
    "ex.: Um quarto duplo numa casa partilhada queer de quatro pessoas",
  "listSpace.blurbHint":
    "A linha que as pessoas leem no quadro. Se ficar em branco, usamos o início da tua descrição.",
  "listSpace.descriptionLabel": "Sobre esta casa",
  "listSpace.descriptionPlaceholder":
    "Como é o espaço, quem mais lá vive, como é a rua, tudo o que gostarias de saber antes de te mudares.",
  "listSpace.descriptionHint":
    "Algumas frases honestas ajudam mais do que uma lista longa. É isto que as pessoas leem antes de te escreverem.",
  "listSpace.availableLabel": "Disponível a partir de",
  "listSpace.availableHint": "Deixa vazio se o espaço já está livre.",
  "listSpace.minStayLabel": "Estadia mínima (meses)",
  "listSpace.minStayPlaceholder": "ex.: 6",
  "listSpace.minStayHint": "Deixa vazio se estás aberte a qualquer duração.",
  "listSpace.featuresLabel": "O que o espaço tem",
  "listSpace.idealForLabel": "Para quem é indicado",
  "listSpace.idealForHint":
    "Descreve a casa e as questões práticas. Todas as casas aqui estão abertas a toda a comunidade.",
  "listSpace.photos.label": "Fotos",
  "listSpace.photos.hint":
    "Até {max}. A primeira é a foto que as pessoas veem no quadro. Os dados de localização são removidos de cada foto antes de sair do teu dispositivo.",
  "listSpace.photos.add": "Adicionar foto",
  "listSpace.photos.uploading": "A adicionar…",
  "listSpace.photos.full": "Este anúncio já tem todas as fotos que cabem",
  "listSpace.photos.cover": "Capa",
  "listSpace.photos.remove": "Remover a foto {position}",
  "listSpace.photos.previewAlt": "Foto {position} do teu anúncio",
  "listSpace.photos.error":
    "Não foi possível adicionar essa foto. Verifica a ligação e tenta outra vez.",
  "listSpace.feature.furnished": "Mobilado",
  "listSpace.feature.light": "Luz natural",
  "listSpace.feature.balcony": "Varanda",
  "listSpace.feature.outdoor": "Espaço exterior",
  "listSpace.feature.lift": "Elevador",
  "listSpace.feature.washing": "Máquina de lavar roupa",
  "listSpace.feature.dishwasher": "Máquina de lavar loiça",
  "listSpace.feature.heating": "Aquecimento",
  "listSpace.feature.cooling": "Ar condicionado",
  "listSpace.feature.desk": "Espaço de secretária",
  "listSpace.feature.bathroom": "Casa de banho privativa",
  "listSpace.feature.kitchen": "Cozinha partilhada",
  "listSpace.feature.bike": "Arrumação para bicicletas",
  "listSpace.feature.pets": "Animais bem-vindos",
  "listSpace.feature.quiet": "Rua sossegada",
  "listSpace.ideal.new": "Quem chegou agora a Lisboa",
  "listSpace.ideal.longStay": "Estadias longas",
  "listSpace.ideal.shortStay": "Estadias curtas",
  "listSpace.ideal.wfh": "Trabalhar a partir de casa",
  "listSpace.ideal.students": "Estudantes",
  "listSpace.ideal.couples": "Casais",
  "listSpace.ideal.pet": "Quem tem um animal",
  "listSpace.ideal.quiet": "Uma casa sossegada",
  "listSpace.ideal.social": "Uma casa sociável",
  "listSpace.ideal.cyclists": "Quem anda de bicicleta",
  "listSpace.tourLabel": "Link de visita virtual",
  "listSpace.tourPlaceholder": "Matterport, um passeio em vídeo no YouTube…",
  "listSpace.tourHint":
    "Opcional, um link https que as pessoas podem abrir para ver antes de visitar.",
  "listSpace.tourError": "Esse link tem de começar por https://",
  "listSpace.billsLabel": "As despesas estão incluídas na renda",
  "listSpace.billsHint":
    "Água, luz, internet, para as pessoas saberem o que pagam.",
  "listSpace.agentLabel": "Estou a anunciar como agente ou agência",
  "listSpace.agentHint":
    "Agentes são bem-vindos aqui. Só mostramos um pequeno selo para ficar claro quem oferece o espaço.",
  "listSpace.note":
    "Os anúncios são revistos antes de aparecerem. Nunca peças um depósito antes de a pessoa visitar o espaço pessoalmente.",
  "listSpace.submitting": "A submeter…",
  "listSpace.submitCta": "Submeter anúncio",
  "listSpace.error":
    "Não foi possível submeter o teu anúncio, não foi entregue. Verifica a ligação e tenta novamente.",

  // ── MyHousingListingsPage (HSG-1/HSG-3) ─────────────────────────────────
  "myHousingListings.entryLink": "Os meus anúncios",
  "myHousingListings.eyebrow": "Quadro de habitação",
  "myHousingListings.title": "Os meus <em>anúncios.</em>",
  "myHousingListings.sub":
    "Tudo o que publicaste no quadro de habitação, gere aqui.",
  "myHousingListings.empty.title": "Ainda não publicaste nenhum anúncio",
  "myHousingListings.empty.description":
    "Quando anunciares um quarto, sublocação ou partilha, aparece aqui para poderes geri-lo.",
  "myHousingListings.empty.cta": "Anuncia o teu espaço",
  "myHousingListings.error.title": "Não foi possível carregar os teus anúncios",
  "myHousingListings.error.body":
    "Algo correu mal do nosso lado. Verifica a ligação e tenta novamente.",
  "myHousingListings.error.retry": "Tentar novamente",
  "myHousingListings.status.review": "Em revisão",
  "myHousingListings.status.question": "Precisa de resposta",
  "myHousingListings.status.live": "No ar",
  "myHousingListings.status.filled": "Ocupado",
  "myHousingListings.status.expired": "Expirado",
  "myHousingListings.status.rejected": "Não publicado",
  "myHousingListings.status.takenDown": "Removido",
  "myHousingListings.decision.question":
    "Uma pessoa moderadora pediu uma alteração",
  "myHousingListings.decision.rejected": "Porque não foi publicado",
  "myHousingListings.decision.takenDown": "Porque foi removido",
  "myHousingListings.decision.questionHint":
    "Edita o anúncio com isto resolvido e volta para a fila.",
  "myHousingListings.postedOn": "Publicado {date}",
  "myHousingListings.expiresOn": "Expira {date}",
  "myHousingListings.expiredHint": "Expirado, prolonga para voltar a publicar",
  // PRD-244. O único aviso que chega ANTES de o anúncio expirar.
  "myHousingListings.expiringInDays_one":
    "Expira em {count} dia, prolonga para o manteres no quadro",
  "myHousingListings.expiringInDays_other":
    "Expira em {count} dias, prolonga para o manteres no quadro",
  "myHousingListings.filledHint": "Marcado como ocupado, escondido do quadro",
  "myHousingListings.actions.edit": "Editar",
  "myHousingListings.actions.view": "Ver anúncio",
  "myHousingListings.actions.markFilled": "Marcar como ocupado",
  "myHousingListings.actions.markAvailable": "Marcar como disponível",
  "myHousingListings.actions.extend": "Prolongar",
  "myHousingListings.actions.delete": "Eliminar",
  "myHousingListings.delete.confirmTitle": "Eliminar este anúncio?",
  "myHousingListings.delete.confirmBody":
    "Isto remove-o do quadro definitivamente, quem tiver o link vê uma página de não encontrado. Não é possível desfazer.",
  "myHousingListings.delete.confirmCta": "Eliminar anúncio",
  "myHousingListings.toast.filled": "Marcado como ocupado",
  "myHousingListings.toast.available": "Marcado como disponível outra vez",
  "myHousingListings.toast.extended": "Anúncio prolongado",
  "myHousingListings.toast.deleted": "Anúncio eliminado",
  "myHousingListings.toast.updated": "Anúncio atualizado",
  "myHousingListings.toast.error": "Isso não foi entregue, tenta novamente.",
  "myHousingListings.edit.eyebrow": "Quadro de habitação",
  "myHousingListings.edit.title": "Edita o teu <em>anúncio.</em>",
  "myHousingListings.edit.sub":
    "As tuas alterações ficam guardadas de imediato e atualizam o anúncio no quadro.",
  "myHousingListings.edit.submitting": "A guardar…",
  "myHousingListings.edit.submitCta": "Guardar alterações",

  // ── SuggestLandlordModal ────────────────────────────────────────────────
  "suggestLandlord.ariaLabel": "Sugerir uma pessoa proprietária",
  "suggestLandlord.eyebrow": "Quadro de habitação",
  "suggestLandlord.title": "Sugerir uma <em>pessoa proprietária.</em>",
  "suggestLandlord.sub":
    "Conheces alguém que arrenda espaços queer-friendly e genuinamente decentes? Conta-nos sobre essa pessoa, uma pessoa moderadora confirma tudo antes de entrar no quadro.",
  "suggestLandlord.nameLabel": "Nome da pessoa proprietária *",
  "suggestLandlord.namePlaceholder": "ex.: Mariana Sousa",
  "suggestLandlord.hoodLabel": "Bairro",
  "suggestLandlord.hoodPlaceholder": "ex.: Arroios, Lisboa",
  "suggestLandlord.taglineLabel": "Frase de apresentação",
  "suggestLandlord.taglinePlaceholder":
    "ex.: Rendas justas, reparações rápidas",
  "suggestLandlord.noteLabel": "Nota curta para o cartão do quadro",
  "suggestLandlord.notePlaceholder":
    "O que é que as pessoas membro devem saber rapidamente?",
  "suggestLandlord.aboutLabel": "Mais sobre esta pessoa",
  "suggestLandlord.aboutPlaceholder":
    "Como é arrendar com esta pessoa? Detalhes ajudam outras pessoas membro.",
  "suggestLandlord.areasLabel": "Onde arrenda",
  "suggestLandlord.areasPlaceholder":
    "Uma zona por linha, ex.:\nArroios\nAnjos\nGraça",
  "suggestLandlord.note":
    "As sugestões são revistas antes de entrarem no quadro. Sugere apenas pessoas proprietárias com quem tu ou alguém de confiança já arrendou.",
  "suggestLandlord.submitting": "A enviar…",
  "suggestLandlord.submitCta": "Sugerir pessoa proprietária",
  "suggestLandlord.success.title": "Obrigade.",
  "suggestLandlord.success.em": "Enviado para revisão.",
  "suggestLandlord.success.body":
    "Uma pessoa moderadora vai rever <strong>{name}</strong> antes de a adicionar ao quadro. Avisamos-te se precisarmos de mais alguma coisa.",
  "suggestLandlord.error":
    "Não foi possível enviar, importas-te de tentar outra vez?",

  // ── HousingListingPage (+ secções) ─────────────────────────────────────
  "housingListing.back": "Quadro de habitação",
  "housingListing.section.about": "Sobre este espaço",
  "housingListing.section.features": "Características",
  "housingListing.section.facts": "Factos",
  "housingListing.section.idealFor": "Ideal para",
  "housingListing.section.accessibility": "Acessos e circulação",
  "housingListing.section.virtualTour": "Visita virtual",
  "housingListing.virtualTour.frameTitle": "Visita virtual desta casa",
  "housingListing.virtualTour.linkNote":
    "Dá uma volta antes de visitares. Esta visita abre num novo separador.",
  "housingListing.virtualTour.openCta": "Abrir visita virtual",
  "housingGallery.photoAlt": "{title}, foto {index} de {total}",
  "housingGallery.openAt": "Abrir fotos de {title}, foto {index} de {total}",
  "housingGallery.counter": "{index} / {total}",
  "housingGallery.slideAnnouncement": "Foto {index} de {total}, {label}",
  "housingGallery.close": "Fechar fotos",
  "housingGallery.prev": "Foto anterior",
  "housingGallery.next": "Foto seguinte",
  "housingListing.billsIncluded": "Despesas incluídas",
  "housingListing.billsExcluded": "Despesas não incluídas",
  "housingListing.agentBadge.label": "Anúncio de agente",
  "housingListing.agentBadge.tooltip":
    "Anunciado por um agente ou agência em nome de quem lá vive. Agentes são bem-vindos. Este selo só o torna claro.",
  "housingListing.messageCtaArrow": "Enviar mensagem a {name}",
  "housingListing.messageCta": "Enviar mensagem a {name}",
  "housingListing.listedBy": "Anunciado por",

  // ── Verificação de identidade — selos honestos + verificação em degraus ─
  "verification.badge.id.label": "Identidade verificada",
  "verification.badge.id.tooltip":
    "Esta pessoa concluiu uma verificação de identidade externa. Confirma quem é. Não é uma garantia de segurança nem um voto de confiança.",
  "verification.badge.phone.label": "Telefone verificado",
  "verification.badge.phone.tooltip":
    "Esta pessoa confirmou um número de telefone. É uma verificação ligeira, não é prova de identidade.",
  // ── Compromisso afirmativo (base LGBTQ+ obrigatória) ───────────────────
  "affirmingPledge.ariaLabel": "O compromisso de habitação afirmativa LGBTQ+",
  "affirmingPledge.title": "Casas onde és <em>afirmada</em>",
  "affirmingPledge.sub":
    "Todas as casas e todos os colegas de casa na QueerPulse são afirmativos LGBTQ+. É o padrão aqui, para toda a gente. Antes de publicar ou contactar, assume o compromisso.",
  "affirmingPledge.point.affirm":
    "Vou manter as casas e os colegas de casa afirmativos, pessoas trans, não binárias e queer são bem-vindas e respeitadas aqui.",
  "affirmingPledge.point.noHarm":
    "Não vou discriminar, expor ninguém, nem tratar alguém pelo género errado.",
  "affirmingPledge.point.report":
    "Se uma casa ou pessoa aqui quebrar isto, posso denunciar.",
  "affirmingPledge.cancel": "Agora não",
  "affirmingPledge.acceptCta": "Assumir o compromisso",
  "affirmingPledge.accepting": "A guardar…",
  "affirmingPledge.error":
    "Não foi possível guardar o compromisso agora. Tenta de novo.",
  "affirmingBaseline.badge": "Afirmativo LGBTQ+",
  "affirmingBaseline.badgeTooltip":
    "Todas as casas e todos os colegas de casa aqui são afirmativos LGBTQ+. É a base de que todos os anúncios partem.",
  "affirmingBaseline.note":
    "Todas as casas e todos os colegas de casa aqui são afirmativos LGBTQ+. É o <em>padrão.</em>",
  "affirmingBaseline.detailNote":
    "Esta é a base de todas as casas aqui, em todos os anúncios.",
  // ── Pedidos de verificação — enviar, acompanhar, recorrer (Fase 2) ─────
  "verification.request.ariaLabel": "Pedir verificação",
  "verification.request.title": "Pedir verificação",
  "verification.request.subForm":
    "Uma pessoa moderadora lê cada pedido à mão, por isso conta-nos um pouco por palavras tuas. Não há nenhum documento para enviar, nunca.",
  "verification.request.levelLabel": "De que nível precisas?",
  "verification.request.level.phone.hint":
    "Uma verificação leve de que conseguimos contactar-te. Suficiente para a maioria dos anúncios.",
  "verification.request.level.id.hint":
    "Uma verificação mais completa, para os anúncios e funções que a pedem.",
  "verification.request.contextLabel": "Conta-nos um pouco (opcional)",
  "verification.request.contextPlaceholder":
    "Um link para o teu perfil noutro sítio, ou alguém em comum que te conheça. O que ajudar uma pessoa moderadora a reconhecer-te.",
  "verification.request.contextHint":
    "As tuas próprias palavras chegam, uma pessoa moderadora lê isto à mão.",
  "verification.request.submitCta": "Enviar pedido",
  "verification.request.submitting": "A enviar",
  "verification.request.submitError":
    "Não foi possível enviar o teu pedido. Importas-te de tentar de novo?",
  "verification.request.cancel": "Agora não",
  "verification.request.sub.pending":
    "Uma pessoa moderadora lê os pedidos à mão, por isso isto pode demorar alguns dias. Avisamos-te assim que houver decisão.",
  "verification.request.sub.in_review":
    "Uma pessoa moderadora está a analisar isto agora. Avisamos-te assim que houver decisão.",
  "verification.request.sub.appealing":
    "O teu recurso está com uma pessoa moderadora agora. Avisamos-te assim que houver decisão.",
  "verification.request.sub.rejected":
    "Este pedido precisa de mais um passo antes de podermos subir o teu nível.",
  "verification.request.statusPill.pending": "Enviado",
  "verification.request.statusPill.in_review": "Em análise",
  "verification.request.statusPill.appealing": "Recurso em análise",
  "verification.request.statusPill.rejected": "Precisa de mais um passo",
  "verification.request.appealChip": "Recurso",
  "verification.request.yourNote": "A tua nota",
  "verification.request.moderatorNote": "O que a pessoa moderadora disse",
  "verification.request.withdrawCta": "Retirar pedido",
  "verification.request.withdrawing": "A retirar",
  "verification.request.withdrawnToast": "Pedido retirado.",
  "verification.request.withdrawError":
    "Não foi possível retirar o pedido. Importas-te de tentar de novo?",
  "verification.request.appealCta": "Recorrer desta decisão",
  "verification.request.appealSending": "A enviar recurso",
  "verification.request.appealError":
    "Não foi possível enviar o teu recurso. Importas-te de tentar de novo?",
  "verification.request.newRequestCta": "Começar um novo pedido",
  "verification.request.later": "Vejo mais tarde",
  "verification.request.approved.title": "O teu pedido foi",
  "verification.request.approved.em": "aprovado",
  "verification.request.approved.body":
    "Uma pessoa moderadora subiu o teu nível. Já podes tentar de novo.",
  "verification.request.approved.continueCta": "Continuar",
  "housingListing.availableFrom":
    "Disponível a partir de {date} · publicado por uma pessoa membro verificada",
  "housingListing.repliesUsually": "Costuma responder <b>{time}</b>",
  "housingListing.staySafe.title": "Mantém-te em segurança",
  "housingListing.staySafe.body":
    "<b>Nunca pagues um depósito antes de visitares o espaço pessoalmente.</b> Mantém a conversa dentro da QueerPulse até se terem conhecido. Se algo parecer estranho, a Queer Housing Justice Network pode aconselhar-te.",
  "housingListing.moreOnBoard": "Mais no quadro",
  "housingListing.save": "Guardar",
  "housingListing.saved": "Guardada",
  "housingListing.savedToast": "{title} guardada",
  "housingListing.unsavedToast": "{title} removida das guardadas",
  // Estado de erro de carregamento (não 404): mostra tentar de novo em vez de
  // redirecionar em silêncio.
  "housingListing.error.title": "Não conseguimos carregar este espaço",
  "housingListing.error.body":
    "Algo correu mal do nosso lado. Tenta de novo daqui a um instante.",
  "housingListing.error.retry": "Tentar de novo",

  // PRD-248. Estado de erro de carregamento (não 404): mostra tentar de novo em
  // vez de redirecionar em silêncio para o quadro.
  // PRD-249. O formulário público de direito de resposta, a única superfície
  // escrita para quem não é membro. Nada aqui promete resposta: a plataforma
  // não envia email nenhum.
  "landlordReply.eyebrow": "Direito de resposta",
  "landlordReply.title": "Responde ao que escreveram sobre ti",
  "landlordReply.intro":
    "Alguém te enviou isto porque um membro da QueerPulse escreveu sobre ter arrendado a ti. A QueerPulse é só por convite, por isso não consegues ler essa página, e este formulário é a forma de responderes.",
  "landlordReply.checkNotice":
    "Nada do que escreves aqui é publicado logo. Alguém da equipa lê primeiro e confirma que és a pessoa nomeada. É esse passo que faz este formulário existir.",
  "landlordReply.nameLabel": "O teu nome",
  "landlordReply.contactLabel": "Uma forma de te contactarem",
  "landlordReply.contactHint":
    "Um telefone, ou onde fores mais fácil de encontrar. A equipa pode precisar de te perguntar algo antes de publicar.",
  "landlordReply.replyLabel": "O que queres dizer",
  "landlordReply.replyPlaceholder": "A tua resposta, nas tuas palavras.",
  "landlordReply.replyHint":
    "Isto é publicado como as tuas palavras, ao lado do que escreveram sobre ti.",
  "landlordReply.send": "Enviar à equipa",
  "landlordReply.error": "Não foi enviado. Tenta outra vez.",
  "landlordReply.doneTitle": "A equipa recebeu",
  "landlordReply.doneBody":
    "Alguém vai ler isto e confirmar quem és antes de publicar seja o que for. Guarda esta página se quiseres anotar o que enviaste.",
  "landlordPage.error.title": "Não conseguimos carregar este perfil",
  "landlordPage.error.body":
    "Algo correu mal do nosso lado. Tenta de novo daqui a um instante.",
  "landlordPage.error.retry": "Tentar de novo",

  // ── Selo de anúncio verificado (P2.3) ──────────────────────────────────
  "verifiedListing.label": "Anúncio verificado",
  "verifiedListing.tooltip":
    "Quem anuncia tem identidade verificada, este anúncio passou na nossa revisão e não levantou alertas. É uma verificação real. Fica aquém de ser uma garantia de segurança ou um voto de confiança.",

  // ── Pedir uma visita (P2.3) ────────────────────────────────────────────
  "housingViewing.request.cta": "Pedir uma visita",
  "housingViewing.request.myViewingsLink": "As tuas visitas",
  "housingViewing.request.ariaLabel": "Pedir uma visita",
  "housingViewing.request.eyebrow": "Pedir uma visita",
  "housingViewing.request.title": "Vê <em>ao vivo</em> primeiro",
  "housingViewing.request.body":
    "Marca uma visita a <strong>{listingTitle}</strong>, por vídeo ou presencial, antes de falar em dinheiro. Ver a casa ao vivo é a forma mais segura de saber que é real.",
  "housingViewing.request.modeLabel": "Como preferes ver a casa?",
  "housingViewing.request.video": "Videochamada",
  "housingViewing.request.inPerson": "Presencial",
  "housingViewing.request.slotOne": "Uma hora que te dê jeito",
  "housingViewing.request.slotTwo": "Outra opção (opcional)",
  "housingViewing.request.slotPastError":
    "Escolhe uma hora que ainda esteja por vir.",
  "housingViewing.request.slotOrderError":
    "A segunda opção tem de ser depois da primeira.",
  "housingViewing.request.noteLabel": "Uma nota para quem anuncia",
  "housingViewing.request.notePlaceholder":
    "Diz olá e menciona o que gostavas de ver ou perguntar.",
  "housingViewing.request.safety":
    "Uma visita por vídeo ou presencial antes de pagar é a melhor forma de evitar uma burla de arrendamento.",
  "housingViewing.request.send": "Enviar pedido de visita",
  "housingViewing.request.error":
    "Não foi possível enviar o pedido. Tenta de novo daqui a pouco.",
  "housingViewing.request.successTitle": "Visita <em>pedida.</em>",
  "housingViewing.request.successBody":
    "Quem anuncia vai escolher uma hora ou sugerir outra. Vais encontrá-la em As tuas visitas.",

  // ── As tuas visitas (P2.3) ─────────────────────────────────────────────
  "housingViewing.list.back": "Mural de habitação",
  "housingViewing.list.title": "As tuas <em>visitas</em>",
  "housingViewing.list.sub":
    "Todos os sítios que pediste para ver, e todos os pedidos para ver o teu. Aceita uma hora, sugere outra, ou deixa uma avaliação depois de se conhecerem.",
  "housingViewing.list.loadError.title":
    "Não foi possível carregar as tuas visitas",
  "housingViewing.list.loadError.description":
    "As tuas visitas continuam lá. Tenta de novo daqui a um instante.",
  "housingViewing.list.empty":
    "Ainda não há visitas. Quando pedires uma a partir de um anúncio, aparece aqui.",
  "housingViewing.list.group.needsResponse": "À tua espera",
  "housingViewing.list.group.upcoming": "A caminho",
  "housingViewing.list.group.past": "Anteriores",
  "housingViewing.list.withLister": "Com {name}",
  "housingViewing.list.fromEnquirer": "De {name}",
  "housingViewing.list.video": "Vídeo",
  "housingViewing.list.inPerson": "Presencial",
  "housingViewing.list.someone": "alguém",
  "housingViewing.list.acceptAt": "Aceitar {time}",
  "housingViewing.list.propose": "Propor outras horas",
  "housingViewing.list.decline": "Recusar",
  "housingViewing.list.waiting": "À espera da resposta de {name}",
  "housingViewing.list.cancel": "Cancelar",
  "housingViewing.list.markCompleted": "Marcar como feita",
  "housingViewing.list.leaveReview": "Deixar avaliação",
  "housingViewing.status.requested": "Pedida",
  "housingViewing.status.accepted": "Aceite",
  "housingViewing.status.declined": "Recusada",
  "housingViewing.status.cancelled": "Cancelada",
  "housingViewing.status.completed": "Concluída",

  // ── Propor outras horas ────────────────────────────────────────────────
  "housingViewing.propose.ariaLabel": "Propor outras horas",
  "housingViewing.propose.title": "Propor outras horas",
  "housingViewing.propose.body":
    "Sugere uma ou duas horas que te deem mais jeito. A outra pessoa pode aceitar uma.",
  "housingViewing.propose.send": "Enviar novas horas",

  // ── Avaliação cega após uma visita concluída (P2.4) ────────────────────
  "housingViewing.review.ariaLabel": "Deixar avaliação",
  "housingViewing.review.eyebrow": "Depois da visita",
  "housingViewing.review.title": "Como correu com <em>{name}?</em>",
  "housingViewing.review.body":
    "As avaliações são dos dois lados e cegas: nenhum vê as palavras do outro até ambos escreverem, para que nenhuma avaliação seja influenciada pela outra.",
  "housingViewing.review.ratingLabel": "A tua classificação",
  "housingViewing.review.whatWasItLike": "Como foi?",
  "housingViewing.review.placeholder":
    "A casa era como descrita? Foi fácil lidar com a pessoa? Detalhes honestos e gentis ajudam quem vier a seguir.",
  "housingViewing.review.blindNote":
    "A tua avaliação fica escondida até a outra pessoa deixar a dela, ou passadas duas semanas, o que vier primeiro.",
  "housingViewing.review.submit": "Enviar avaliação",
  "housingViewing.review.error":
    "Não foi possível enviar a avaliação. Tenta de novo daqui a pouco.",
  "housingViewing.review.successTitle": "Avaliação <em>guardada.</em>",
  "housingViewing.review.successBody":
    "Obrigade. Fica privada até <strong>{name}</strong> deixar a sua, ou passarem duas semanas.",

  // ── Bloco de avaliações no anúncio (P2.4) ──────────────────────────────
  "housingViewing.reviews.heading": "Avaliações",
  "housingViewing.reviews.empty":
    "Ainda não há avaliações, aparecem aqui quando membros visitarem esta casa e partilharem como correu.",
  "housingViewing.reviews.outOf": "em 5",
  "housingViewing.reviews.count_one": "{count} avaliação",
  "housingViewing.reviews.count_other": "{count} avaliações",
  "housingViewing.reviews.anonymous": "Um membro",
  "housingViewing.reviews.ratingAria_one": "{count} estrela",
  "housingViewing.reviews.ratingAria_other": "{count} estrelas",

  // ── ReportListingModal ─────────────────────────────────────────────────
  "housingListing.report": "Denunciar",
  "housingListing.reportAriaLabel": "Denunciar {title}",
  "housingListing.reportModal.ariaLabel": "Denunciar",
  "housingListing.reportModal.eyebrow": "Denunciar à nossa equipa",
  "housingListing.reportModal.title": "O que se passa com <em>{title}?</em>",
  "housingListing.reportModal.lead":
    "As denúncias ajudam-nos a manter o QueerPulse fiável. Conta-nos o que se passa, detalhes ajudam a equipa de revisão. O teu nome nunca é partilhado com quem denuncias.",
  "housingListing.reportModal.concernLabel": "Qual é a preocupação?",
  "housingListing.reportModal.detailLabel": "Conta-nos mais",
  "housingListing.reportModal.detailPlaceholder":
    "O que fez isto parecer inseguro, discriminatório, ou pouco fiável? Sê tão específique quanto te sintas confortável.",
  "housingListing.reportModal.charsRemaining_one":
    "Falta {count} carácter para submeter",
  "housingListing.reportModal.charsRemaining_other":
    "Faltam {count} carateres para submeter",
  "housingListing.reportModal.charsCount_one": "{count} carácter",
  "housingListing.reportModal.charsCount_other": "{count} carateres",
  "housingListing.reportModal.confidentialNote":
    "As denúncias são confidenciais. As pessoas moderadoras veem o teu nome; a pessoa ou entidade que denuncias nunca o vê. Em caso de emergência, liga primeiro para o <strong>112</strong>.",
  "housingListing.reportModal.cancelCta": "Cancelar",
  "housingListing.reportModal.submitting": "A submeter…",
  "housingListing.reportModal.submitCta": "Submeter denúncia",
  "housingListing.reportModal.success.title": "Denúncia",
  "housingListing.reportModal.success.em": "recebida.",
  "housingListing.reportModal.success.body":
    "Obrigade. Uma pessoa moderadora vai rever {title}. Podemos contactar-te para mais detalhe, mas nunca partilharemos a tua denúncia com quem denunciaste.",
  "housingListing.reportModal.success.equalityPointer":
    "A discriminação no acesso à habitação também pode ser levada a um organismo nacional de igualdade, não tens de escolher. Denunciá-la aqui ajuda-nos a agir na plataforma.",
  "housingListing.reportModal.doneCta": "Concluído",
  "housingListing.reportModal.error":
    "Não foi possível enviar a tua denúncia, não chegou até nós. Verifica a ligação e tenta novamente.",

  // ── ContactRequestModal (fluxo partilhado de "contactar") ──────────────
  "contactRequest.defaultTitle": "Enviar um",
  "contactRequest.defaultEm": "pedido.",
  "contactRequest.defaultSuccessTitle": "Pedido",
  "contactRequest.defaultSuccessEm": "enviado.",
  "contactRequest.defaultSendLabel": "Enviar pedido",
  "contactRequest.defaultSendingLabel": "A enviar…",
  "contactRequest.defaultSuccessBody":
    "A tua mensagem está a caminho de <strong>{firstName}</strong>. Vai responder diretamente à tua caixa de entrada aqui, os contactos são partilhados assim que ambas as partes concordarem em avançar.",
  "contactRequest.messageLabel": "A tua mensagem *",
  "contactRequest.messagePlaceholder":
    "Uma frase sobre quem és e o que procuras já ajuda muito.",
  "contactRequest.charsNeeded_one":
    "Falta mais {count} caráter para dar contexto.",
  "contactRequest.charsNeeded_other":
    "Faltam mais {count} carateres para dar contexto.",
  "contactRequest.looksGood":
    "Está ótimo. Mantém a conversa aqui até ambas as partes decidirem avançar.",
  "contactRequest.cancel": "Cancelar",
  "contactRequest.done": "Concluído",
  "contactRequest.sendError":
    "Não foi possível enviar, importas-te de tentar outra vez?",

  // ── LandlordPage ─────────────────────────────────────────────────────────
  "landlordPage.eyebrow": "Pessoa proprietária recomendada pela comunidade",
  "landlordPage.recommendCta": "Recomendar {name}",
  "landlordPage.recommendCount_one": "{count} recomendação de pessoas membro",
  "landlordPage.recommendCount_other":
    "{count} recomendações de pessoas membro",
  "landlordPage.section.about": "Sobre {name}",
  "landlordPage.section.whereTheyRent": "Onde arrenda",
  "landlordPage.section.recommendations": "Recomendações de pessoas membro",
  // PRD-249. Uma recomendação é uma avaliação pública e nomeada de uma pessoa
  // real que não tem conta aqui. Passa a estar marcada como declarada pelo
  // próprio e não verificada, e quem é nomeado ganha direito de resposta.
  "landlordPage.rating.selfReported_one": "Indicado por {count} membro",
  "landlordPage.rating.selfReported_other": "Indicado por {count} membros",
  "landlordPage.rating.attestedOf_one":
    "{count} de {total} diz que viveu aqui.",
  "landlordPage.rating.attestedOf_other":
    "{count} de {total} dizem que viveram aqui.",
  "landlordPage.section.recommendationsNote":
    "Isto são membros a escrever sobre os seus próprios contratos com {name}. A QueerPulse não verificou nenhum deles, e {name} não é membro aqui.",
  "landlordPage.recommendation.selfAttestedBadge":
    "Declarado pelo próprio, não verificado",
  "landlordPage.recommendation.noTenancyGiven":
    "Não foram dadas datas do contrato.",
  "landlordPage.recommendation.reply.heading": "{name} respondeu a isto",
  "landlordPage.recommendation.reply.askCta":
    "És {name}? Pede para responder a isto",
  "landlordPage.sidebar.atAGlance": "Resumo",
  "landlordPage.sidebar.rentedFrom": "Já arrendaste com {name}?",
  "landlordPage.sidebar.rentedFromBody":
    "A tua recomendação é o que torna esta lista de confiança, e o que torna a mudança de outra pessoa muito mais segura. Demora dois minutos.",
  "landlordPage.sidebar.recommendCta": "Recomendar esta pessoa proprietária",
  "landlordPage.sidebar.howToRent": "Como arrendar com esta pessoa",
  "landlordPage.sidebar.requestIntro": "Pedir uma apresentação",
  "landlordPage.toast.recommended_one":
    "Recomendação submetida, {count} estrela",
  "landlordPage.toast.recommended_other":
    "Recomendação submetida, {count} estrelas",
  "landlordPage.intro.eyebrow": "Habitação · Apresentação",
  "landlordPage.intro.title": "Pedir uma",
  "landlordPage.intro.em": "apresentação.",
  "landlordPage.intro.sub":
    "Vamos transmitir uma nota simpática a {name} da tua parte. Conta um pouco sobre o que procuras e quando gostarias de te mudar.",
  "landlordPage.intro.preset":
    "Olá {firstName}, encontrei-te através do quadro de habitação da QueerPulse. Procuro um lugar em ",
  "landlordPage.intro.successTitle": "Apresentação",
  "landlordPage.intro.successEm": "pedida.",
  "landlordPage.intro.successBody":
    "Já enviámos a tua nota a <strong>{firstName}</strong>. Se tiver algo que corresponda, vai entrar em contacto por aqui, sem pressão de qualquer forma.",
  "landlordPage.intro.sendLabel": "Pedir apresentação",
  "landlordPage.intro.fallbackName": "Uma pessoa da comunidade",
  "landlordPage.save": "Guardar",
  "landlordPage.saved": "Guardada",
  "landlordPage.savedToast": "{name} guardada",
  "landlordPage.unsavedToast": "{name} removida das guardadas",
  "landlordPage.report": "Denunciar",
  "landlordPage.reportAriaLabel": "Denunciar {name}",

  // ── ModalKit (moldura de modal partilhada + painel de sucesso) ──────────
  "modalKit.close": "Fechar",

  // ── FlatmatesBoard / FlatmatesFilterBar / FlatmateCard ─────────────────
  // Nota de âmbito: nomes de bairros, tags de estilo de vida e campos por
  // perfil (nota, orçamento, data de entrada) são conteúdo fictício deste
  // quadro — mantidos em inglês (ver docs/i18n/extraction-brief.md §1). Só o
  // chrome envolvente (etiquetas, CTAs, estados vazios) é traduzido abaixo.
  "flatmates.filter.show": "Mostrar",
  "flatmates.filter.all": "Todos os perfis",
  "flatmates.filter.seeking": "À procura de um quarto",
  "flatmates.filter.offering": "Tem um quarto disponível",
  "flatmates.filter.anyNeighbourhood": "Qualquer bairro",
  "flatmates.filter.anyBudget": "Qualquer orçamento",
  "flatmates.filter.budget.upTo700": "Até 700 €",
  "flatmates.filter.budget.700to900": "700–900 €",
  "flatmates.filter.budget.900to1100": "900–1100 €",
  "flatmates.filter.budget.1100plus": "1100 €+",
  "flatmates.filter.anyMoveIn": "Qualquer data de entrada",
  "flatmates.filter.moveIn.now": "Disponível já",
  "flatmates.filter.moveIn.jul": "Julho",
  "flatmates.filter.moveIn.aug": "Agosto",
  "flatmates.filter.moveIn.flex": "Flexível",
  "flatmates.filter.lifestyle": "Estilo de vida",

  "flatmates.count_one": "{count} perfil ativo esta semana",
  "flatmates.count_other": "{count} perfis ativos esta semana",
  "flatmates.loadMore": "Ver mais pessoas",
  "flatmates.loadError.title":
    "Não foi possível carregar o quadro de colegas de casa",
  "flatmates.loadError.description":
    "Os perfis continuam lá. Tenta de novo daqui a um instante.",
  "flatmates.loadingMore": "A carregar mais pessoas…",
  "flatmates.postProfileCta": "Publicar o teu perfil",

  "flatmates.empty.title":
    "O quadro de colegas de casa está parado neste momento",
  "flatmates.empty.description":
    "Ainda não há perfis publicados. Quando as pessoas partilharem o que procuram, um quarto, uma pessoa colega de casa, um bairro, um orçamento, vão aparecer aqui. Volta em breve, ou publica o teu próprio perfil.",
  "flatmates.empty.filteredTitle": "Nenhum perfil corresponde a esses filtros",
  "flatmates.empty.filteredDescription":
    "Ninguém corresponde a essa combinação exata neste momento. Tenta alargar os filtros, ou publica o teu próprio perfil e deixa que a pessoa certa te encontre.",
  "flatmates.empty.clearFilters": "Limpar filtros",

  "flatmates.outro.title": "Uma casa onde <em>pertences.</em>",
  "flatmates.outro.sub":
    "A pessoa certa para partilhar casa pode fazer uma cidade parecer um lar. Não tenhas pressa, confia no teu instinto, e usa a comunidade.",
  "flatmates.outro.askForum": "Perguntar no fórum",

  "flatmates.card.memberSince": "Membro desde {date}",
  "flatmates.card.sayHello": "Dizer olá",
  "flatmates.card.helloSent": "Olá enviado",
  "flatmates.card.sayHelloError":
    "Não foi possível enviar o teu olá. Tenta novamente daqui a pouco.",
  "flatmates.card.matchScore": "{score}% compatível",
  "flatmates.card.save": "Guardar",
  "flatmates.card.saved": "Guardado",
  "flatmates.card.savedToast": "Perfil de {name} guardado",
  "flatmates.card.unsavedToast": "Perfil de {name} removido dos guardados",
  "flatmates.card.reportAriaLabel": "Denunciar o perfil de {name}",
  "flatmates.card.safeSpaceLabel": "Necessidades de espaço seguro",
  "flatmates.card.householdLabel": "Casa",
  "flatmates.card.whyMatched": "Porque combinam",

  // Fatores explicáveis de compatibilidade — a interface mapeia cada `factor`
  // aqui. As especificidades de espaço seguro são ocultadas pelo backend para
  // quem não tem permissão para as ver.
  "flatmates.reason.budget": "Orçamento encaixa",
  "flatmates.reason.neighbourhood": "Mesmo bairro",
  "flatmates.reason.lifestyle": "Estilo de vida em comum",
  "flatmates.reason.timing": "As datas coincidem",
  "flatmates.reason.safeSpace": "Valores de espaço seguro em comum",
  "flatmates.reason.household": "As bases da casa combinam",

  // ── PostProfileModal / PostProfileForm ─────────────────────────────────
  "postProfileModal.ariaLabel": "Publicar o teu perfil de colega de casa",
  "postProfileModal.error":
    "Não foi possível guardar o teu perfil, importas-te de tentar de novo?",
  "postProfileModal.success.title": "Já estás no <em>quadro.</em>",
  "postProfileModal.success.body":
    "O teu perfil está publicado. As pessoas vão contactar-te diretamente. Fica atente às tuas mensagens QueerPulse.",
  "postProfileModal.success.backCta": "Voltar aos perfis",

  "postProfileForm.title": "Publicar o teu perfil",
  "postProfileForm.sub":
    "Demora cerca de dois minutos. O teu perfil fica publicado de imediato, as pessoas contactam-te diretamente, sem algoritmo de correspondência.",
  "postProfileForm.lookingForLabel": "O que procuras?",
  "postProfileForm.seekingDesc":
    "Estás à procura de um quarto num apartamento ou casa",
  "postProfileForm.offeringDesc":
    "Tens um quarto ou casa partilhada para oferecer",
  "postProfileForm.pronounsLabel": "Pronomes (opcional)",
  "postProfileForm.pronounsPlaceholder": "ex.: ela, ele, elu",
  "postProfileForm.pronounsWriteOwn": "Escreve os teus",
  "postProfileForm.pronounsAdd": "Adicionar",
  "postProfileForm.pronounsRemoveAria": "Remover {pronoun}",
  "postProfileForm.neighbourhoodLabel": "Bairro",
  "postProfileForm.neighbourhoodPlaceholder": "Preferência / localização",
  "postProfileForm.anywhereCentral": "Em qualquer zona central",
  "postProfileForm.budgetLabel": "Orçamento / mês (€)",
  "postProfileForm.budgetPlaceholder": "ex.: 750",
  "postProfileForm.moveInLabel": "Disponível / entrada a partir de",
  "postProfileForm.moveInPlaceholder": "Quando?",
  "postProfileForm.moveIn.jul2026": "Julho de 2026",
  "postProfileForm.moveIn.aug2026": "Agosto de 2026",
  "postProfileForm.moveIn.sep2026": "Setembro de 2026",
  "postProfileForm.aboutLabel": "Sobre ti e o que procuras num lar",
  "postProfileForm.aboutPlaceholder":
    "Conta um pouco sobre ti, o teu ritmo, o teu trabalho, que tipo de casa te faz sentir bem. Não precisas de te vender; sê apenas honesta.",
  "postProfileForm.lifestyleTagsLabel": "Tags de estilo de vida",
  "postProfileForm.submitCta": "Publicar perfil",

  // ── Normas da casa (opcional, dados comuns) ─────────────────────────────
  "postProfileForm.householdLabel": "Casa (opcional)",
  "postProfileForm.householdHint":
    "Alguns pontos básicos da vida partilhada, se quiseres que se saibam à partida.",
  "postProfileForm.householdNoPreference": "Sem preferência",
  "postProfileForm.household.smoking": "Fumar",
  "postProfileForm.household.pets": "Animais",
  "postProfileForm.household.guests": "Visitas",
  "postProfileForm.household.cleanliness": "Limpeza",
  "postProfileForm.household.sleepSchedule": "Horário de sono",
  "postProfileForm.household.noise": "Ruído",
  "postProfileForm.household.sharing": "Espaço partilhado vs. privado",

  // ── Identidade e espaço seguro (RGPD Art.9, opcional) ───────────────────
  "postProfileForm.identityLabel": "Identidade e espaço seguro",
  "postProfileForm.identityHint":
    "Tudo opcional. Partilha só o que te ajuda a sentir em casa, escolhes quem vê, e podes retirar quando quiseres.",
  "postProfileForm.consentLabel":
    "Sim, guardem os meus pronomes, género e necessidades de espaço seguro, e mostrem-nos às pessoas que eu escolher abaixo para nos encontrarmos. Tens o controlo: podes limpá-los <em>quando quiseres.</em>",
  "postProfileForm.genderLabel": "Género (opcional)",
  "postProfileForm.genderPlaceholder": "ex.: não-binárie, mulher trans",
  "postProfileForm.safeSpaceLabel": "O que torna uma casa segura",
  "postProfileForm.safeSpaceHint":
    "Escolhe o que te importa. Isto diz o que procuras numa casa. Nunca quem é bem-vinde.",
  // Prompts de casa afirmativos para pessoas trans (Art.9, dentro do consentimento).
  "postProfileForm.identityHousehold.label": "Viver como tu em casa",
  "postProfileForm.identityHousehold.hint":
    "Tudo opcional, e só visto por quem tu escolheres. Partilha o que ajudaria uma casa a sentir-se tua.",
  "postProfileForm.identityHousehold.outAtHome": "Ser aberte em casa",
  "postProfileForm.identityHousehold.bathroom": "Partilhar casa de banho",
  "postProfileForm.identityHousehold.mailName": "Nome no correio e entregas",
  "postProfileForm.identityHousehold.medication": "Privacidade com medicação",

  "postProfileForm.visibilityLabel": "Quem pode ver isto",
  "postProfileForm.visibility.public": "Qualquer pessoa no quadro",
  "postProfileForm.visibility.members": "Qualquer membro",
  "postProfileForm.visibility.matches": "Só quem deu match comigo",
  "postProfileForm.visibility.hidden": "Só eu",

  // ── CompanyPage (+ Cover / Sidebar / Tabs) ──────────────────────────────
  "company.loadError.title": "Não foi possível carregar esta empresa",
  "company.loadError.description":
    "O perfil continua lá. Tenta de novo daqui a um instante.",
  "company.notFound.title": "Empresa não encontrada",
  "company.notFound.description":
    "Este perfil de empresa não existe ou foi retirado. Explora o quadro de vagas para encontrar empregadores geridos por pessoas queer e verificados como inclusivos.",
  "company.notFound.backCta": "Voltar ao quadro de vagas",

  "company.cover.backCta": "Todas as empresas",
  "company.cover.seeOpenRoles_one": "Ver {count} vaga aberta",
  "company.cover.seeOpenRoles_other": "Ver {count} vagas abertas",
  "company.cover.follow": "Seguir empresa",
  "company.cover.following": "A seguir",
  "company.cover.message": "Enviar mensagem",
  "company.cover.openRoleStat_one": "Vaga aberta",
  "company.cover.openRoleStat_other": "Vagas abertas",
  "company.cover.toast.followed":
    "A seguir {name}. Vais saber quando surgirem novas vagas",
  "company.cover.toast.unfollowed": "Deixaste de seguir {name}",

  "company.sidebar.detailsTitle": "Detalhes do estúdio",
  "company.sidebar.peopleTitle": "Pessoas daqui na QueerPulse",
  "company.sidebar.hiringContactTitle": "Contacto de recrutamento",
  "company.sidebar.messagePerson": "Enviar mensagem a {name}",
  "company.sidebar.sendMessage": "Enviar mensagem",
  "company.report.cta": "Denunciar esta empresa",
  "company.report.ariaLabel": "Denunciar {name}",

  "company.tabs.about": "Sobre",
  "company.tabs.jobs": "Vagas",
  "company.tabs.reviews": "Avaliações",
  "company.tabs.work": "Trabalhos",

  "company.jobs.empty.title": "Sem vagas abertas neste momento",
  "company.jobs.empty.description":
    "Esta empresa não está a recrutar na QueerPulse neste momento. Segue-a no topo da página para saberes quando surgir uma vaga.",
  "company.jobs.postRole": "Publicar uma vaga",

  "company.reviews.outOf5_one": "/ 5 · {count} avaliação",
  "company.reviews.outOf5_other": "/ 5 · {count} avaliações",
  "company.reviews.writeReview": "Escrever uma avaliação",
  "company.reviews.loadError.title": "Não foi possível carregar as avaliações",
  "company.reviews.loadError.description":
    "As avaliações continuam lá. Tenta de novo daqui a um instante.",
  "company.reviews.empty.title": "Ainda sem avaliações",
  "company.reviews.empty.description":
    "Já trabalhaste aqui ou com esta empresa? Sê a primeira pessoa a contar à próxima pessoa queer como é mesmo.",
  "company.reviews.starsAriaLabel": "{count} em 5",
  "company.reviews.loadingMore": "A carregar…",
  "company.reviews.loadMoreCta": "Carregar mais avaliações",

  "company.work.intro": "Uma pequena seleção de projetos recentes do estúdio.",

  // ── CompanyReviewModal ──────────────────────────────────────────────────
  // Nota de âmbito: os prefixos compostos do corpo da avaliação ("The good:
  // …", "The hard parts: …") e a byline ("{role} · Rated {stars}/5 · just
  // now") ficam gravados no registo da avaliação, mostrado a quem quer que
  // veja depois, independentemente do idioma — mantidos em inglês
  // deliberadamente, tal como as etiquetas de resposta da candidatura. Só o
  // chrome do próprio modal é traduzido abaixo.
  "companyReview.overallRatingAriaLabel": "Avaliação geral",
  "companyReview.starAriaLabel_one": "{count} estrela",
  "companyReview.starAriaLabel_other": "{count} estrelas",
  "companyReview.success.title": "Avaliação",
  "companyReview.success.em": "publicada.",
  "companyReview.success.body":
    "Obrigade, a tua avaliação de {companyName} já está publicada. A {companyName} não pode editar nem remover o que escreveste.",
  "companyReview.title": "Como é que era <em>na realidade?</em>",
  "companyReview.sub":
    "O teu relato honesto ajuda a próxima pessoa queer a decidir se aceita a entrevista. Verificado por adesão à comunidade.",
  "companyReview.headlineLabel": "Título",
  "companyReview.headlinePlaceholder": "Resume numa frase",
  "companyReview.roleLabel": "A tua função / tempo de casa",
  "companyReview.rolePlaceholder": "ex.: Designer, 2 anos na função",
  "companyReview.prosLabel": "O que funcionou, o lado bom",
  "companyReview.prosPlaceholder":
    "Pronomes respeitados, inclusão real, liderança que percebe do assunto…",
  "companyReview.consLabel": "O que foi difícil, o resto",
  "companyReview.consPlaceholder": "Onde o acompanhamento ficou aquém…",
  "companyReview.missingHint": "Preenche {fields} para desbloquear o botão.",
  "companyReview.missing.company": "uma empresa",
  "companyReview.missing.headline": "um título",
  "companyReview.missing.rating": "uma classificação em estrelas",
  "companyReview.missing.role": "o teu cargo",
  "companyReview.missing.prosOrCons": "o que resultou ou o que foi difícil",
  "companyReview.cancel": "Cancelar",
  "companyReview.posting": "A publicar…",
  "companyReview.submitCta": "Publicar avaliação",
  "companyReview.toast.alreadyReviewed": "Já avaliaste esta empresa.",
  "companyReview.toast.error":
    "Não conseguimos publicar a tua avaliação. Tenta novamente.",

  // ── EmployerReviewsPage (+ Card) ─────────────────────────────────────────
  // Nota de âmbito: nomes de empresas, pontuações, citações e o texto/meta de
  // cada avaliação em employerReviews.data.ts são conteúdo fictício — em modo
  // live seriam registos de empresas e avaliações reais. Mantidos em inglês.
  "employerReviews.hero.eyebrow": "Avaliações de Empregadores",
  "employerReviews.hero.title":
    "O teu local de trabalho é <em>realmente seguro?</em>",
  "employerReviews.hero.lead":
    "Avaliações anónimas de empresas de Lisboa feitas por pessoas LGBTQ+. Para lá do logótipo do Orgulho, como é realmente estar assumida ali, portas adentro do escritório.",

  "employerReviews.how.title": "Como <em>funciona</em>",
  "employerReviews.how.sub":
    "Anónimo, verificado por adesão à comunidade, e as empresas nunca o podem editar.",
  "employerReviews.how.write.title": "Escreve de forma anónima",
  "employerReviews.how.write.desc":
    "A tua identidade nunca é associada à tua avaliação. Verificamos que és uma pessoa membro, mais nada fica registado.",
  "employerReviews.how.rate.title": "Avalia o que importa",
  "employerReviews.how.rate.desc":
    "Segurança para te assumires, sensibilidade da gestão, inclusão trans, capacidade de resposta dos RH, e cultura real vs. valores declarados.",
  "employerReviews.how.help.title": "Ajuda a próxima pessoa",
  "employerReviews.how.help.desc":
    "A tua avaliação ajuda outras pessoas queer a fazer escolhas melhores sobre onde levam o seu talento e todo o seu ser.",

  "employerReviews.recent.title": "Avaliações <em>recentes</em>",
  "employerReviews.recent.sub":
    "Escritas por pessoas membro · anónimas · atualizadas continuamente",
  "employerReviews.recent.browseCta": "Ver vagas inclusivas para pessoas queer",
  "employerReviews.recent.writeCta": "Escrever uma avaliação",
  "employerReviews.loadError.title":
    "Não foi possível carregar os empregadores",
  "employerReviews.loadError.description":
    "A lista continua lá. Tenta de novo daqui a um instante.",
  "employerReviews.emptyLive.title": "Ainda sem empregadores avaliados",
  "employerReviews.emptyLive.description":
    "Ainda não há avaliações publicadas. Sê a primeira pessoa a partilhar como é realmente trabalhar num sítio.",

  "employerReviews.verify.title": "Como funciona a <em>verificação</em>",
  "employerReviews.verify.verifiedSafe.label": "Verificada como segura",
  "employerReviews.verify.verifiedSafe.desc":
    "Políticas inclusivas confirmadas no papel, depois cruzadas com 3+ avaliações anónimas de pessoas colaboradoras. Reverificado todos os anos.",
  "employerReviews.verify.queerRun.label":
    "Gerida por pessoas queer vs. amiga da comunidade queer",
  "employerReviews.verify.queerRun.desc":
    "Gerida por pessoas queer significa liderada ou detida por pessoas queer. Amiga da comunidade queer é acolhedora mas não liderada pela comunidade. Nunca confundimos as duas coisas.",
  "employerReviews.verify.confidence.label": "Confiança na pontuação",
  "employerReviews.verify.confidence.desc":
    "Cada pontuação mostra em quantas avaliações se baseia. Mais avaliações, mais confiança, um 9 com 3 pessoas não é o mesmo que um 9 com 30.",

  "employerReviews.write.title": "Escreve uma <em>avaliação.</em>",
  "employerReviews.write.body":
    "Já lá passaste. Sabes como era na realidade. A tua avaliação ajuda a próxima pessoa queer a decidir se aceita aquela entrevista. Demora 5 minutos e é completamente anónima.",
  "employerReviews.write.note":
    "Só para pessoas membro · anónimo · a tua identidade nunca é guardada com a tua avaliação",
  "employerReviews.write.rulesTitle": "Os nossos princípios de avaliação",
  "employerReviews.write.rule.anonymous":
    "As avaliações são anónimas, o teu nome nunca é associado",
  "employerReviews.write.rule.verifyMembership":
    "Verificamos que és uma pessoa membro da QueerPulse, nada mais",
  "employerReviews.write.rule.noEdit":
    "As empresas não podem editar, remover ou responder a avaliações",
  "employerReviews.write.rule.moderation": "Moderamos por rigor factual",
  "employerReviews.write.rule.retract":
    "Podes atualizar ou retirar a tua avaliação a qualquer momento",
  "employerReviews.write.rule.noBuying":
    "Nenhuma empresa pode comprar uma pontuação mais alta ou destaque",

  "employerReviews.outro.title": "O teu trabalho <em>importa.</em>",
  "employerReviews.outro.sub":
    "Mereces saber onde te estás a meter. Tal como todas as outras pessoas.",
  "employerReviews.outro.cta": "Pedir um convite",

  "employerReviewCard.basedOn_one": "com base em {count} avaliação",
  "employerReviewCard.basedOn_other": "com base em {count} avaliações",
  "employerReviewCard.readAll_one": "Ler a avaliação",
  "employerReviewCard.readAll_other": "Ler todas as {count} avaliações",
  "employerReviewCard.showLess": "Mostrar menos",

  // ── WriteReviewModal (fluxo de avaliação anónima da EmployerReviewsPage) ─
  // Nota de âmbito: tal como no CompanyReviewModal — o texto/meta composto da
  // avaliação é conteúdo gravado mostrado a quem vir depois; mantido em inglês
  // deliberadamente.
  "writeReviewModal.eyebrow": "Escrever uma avaliação · anónima",
  "writeReviewModal.sub":
    "O teu relato honesto ajuda a próxima pessoa queer a decidir se aceita a entrevista. Verificado por adesão à comunidade, nunca associado ao teu nome.",
  "writeReviewModal.companyLabel": "Empresa",
  "writeReviewModal.roleLabel": "A tua função / equipa",
  "writeReviewModal.rolePlaceholder": "ex.: Engenharia, Design, Operações",
  "writeReviewModal.prosPlaceholder":
    "Pronomes respeitados, cuidados de saúde trans reais, liderança que percebe do assunto…",
  "writeReviewModal.consPlaceholder":
    "Logótipo do Orgulho sem acompanhamento real, RH que não sabia como ajudar…",
  "writeReviewModal.success.body":
    "Obrigade, a tua avaliação anónima de {company} já está publicada. O teu nome nunca é guardado com ela, e a {company} não pode editar nem remover o que escreveste.",

  // ── GrantsPage (+ guia / barra lateral) ────────────────────────────────
  // Nota de âmbito: os anúncios de bolsas em grants.data.tsx (nomes, entidades,
  // montantes, descrições) são um diretório curado de programas de financiamento
  // externos reais — conteúdo informativo, não interface da plataforma. Em modo
  // live viriam de um diretório mantido/obtido da API. Ficam em inglês.
  "grants.hero.eyebrow": "Bolsas e financiamento",
  "grants.hero.title": "Dinheiro para <em>trabalho queer.</em>",
  "grants.hero.lead":
    "Guia feito pela comunidade sobre bolsas, residências e financiamento para pessoas e organizações LGBTQ+, em Portugal e por toda a Europa. Mantido por quem já se candidatou com sucesso.",
  "grants.hero.stat.tracked": "oportunidades acompanhadas",
  "grants.hero.stat.open": "abertas neste momento",
  "grants.hero.stat.communityLabel": "Comunidade",
  "grants.hero.stat.maintained": "mantido por",

  "grants.filter.all": "Tudo",
  "grants.filter.individual": "Para pessoas",
  "grants.filter.org": "Para organizações",
  "grants.filter.arts": "Artes e cultura",
  "grants.filter.community": "Projetos comunitários",
  "grants.filter.eu": "UE / Internacional",

  "grants.section.qp": "Da <em>QueerPulse</em>",
  "grants.section.pt": "<em>Portugal</em>, programas nacionais",
  "grants.section.eu": "<em>UE e Internacional</em>",

  "grants.status.open": "Aberta agora",
  "grants.status.rolling": "Em contínuo",
  "grants.status.closed": "Fechada",

  "grants.card.learnMore": "Saber mais",

  "grants.empty.title": "Nada corresponde ao teu filtro",
  "grants.empty.description":
    "Não há oportunidades nessa categoria neste momento. Limpa o filtro para ver todas as bolsas e residências que a comunidade está a acompanhar.",
  "grants.empty.clearFilters": "Limpar filtros",
  "grants.emptyLive.title": "O acompanhamento de bolsas está a chegar",
  "grants.emptyLive.description":
    "Estamos a construir um feed vivo, mantido pela comunidade, de bolsas e residências para trabalho queer. Volta em breve, ou candidata-te entretanto a uma das nossas Micro Bolsas.",

  "grants.guide.title": "Escrever uma <em>candidatura forte</em>",
  "grants.guide.sub":
    "Conselhos de pessoas da comunidade que já conseguiram financiamento, de micro a grande.",
  "grants.guide.step.criteria.title": "Lê os critérios duas vezes",
  "grants.guide.step.criteria.body":
    "A maioria das recusas vem de candidaturas que encaixam tecnicamente mas não espelham a linguagem de quem financia. Mapeia o teu projeto sobre as palavras concretas que usam.",
  "grants.guide.step.story.title": "Conta uma história concreta",
  "grants.guide.step.story.body":
    "Quem financia lê centenas de candidaturas. Uma única história concreta e humana de impacto fica melhor do que afirmações genéricas.",
  "grants.guide.step.community.title": "Mostra a tua comunidade",
  "grants.guide.step.community.body":
    "Quem financia trabalho queer quer ver a comunidade lá dentro, a participar e a decidir.",
  "grants.guide.step.review.title": "Pede uma leitura",
  "grants.guide.step.review.body":
    "Antes de submeteres, pede a alguém de fora do projeto que leia a tua candidatura. Um olhar novo apanha os pressupostos que já deixaste de ver.",

  "grants.outro.title": "O teu projeto <em>merece apoio.</em>",
  "grants.outro.sub":
    "Encontraste algo que encaixa? Candidata-te com confiança, e se conseguires, retribui: acrescenta a oportunidade para a próxima pessoa.",
  "grants.outro.cta": "Ver bolsas abertas",

  "grants.subpages.title": "Também em bolsas",
  "grants.subpages.microGrants.label": "Micro Bolsas",
  "grants.subpages.microGrants.blurb":
    "Bolsas pequenas e rápidas da comunidade, candidata-te em minutos.",

  "grants.sidebar.microGrants.title": "As nossas <em>Micro Bolsas</em>",
  "grants.sidebar.microGrants.body":
    "A QueerPulse tem o seu próprio programa de micro bolsas (200 €–2 000 €) para projetos comunitários em Lisboa. Mais rápido e mais simples do que a maioria das bolsas externas.",
  "grants.sidebar.microGrants.cta": "Candidata-te",
  "grants.sidebar.skillsExchange.title": "Troca de competências",
  "grants.sidebar.skillsExchange.body":
    "Se precisas de apoio mas as bolsas te parecem formais demais, o quadro de trocas liga pessoas que trocam competências entre si, sem dinheiro pelo meio.",
  "grants.sidebar.skillsExchange.cta": "Explorar as trocas",
  "grants.sidebar.appHelp.title": "Ajuda com a <em>candidatura</em>",
  "grants.sidebar.appHelp.body":
    "Pessoas da comunidade com experiência em candidaturas dão apoio individual através da mentoria.",
  "grants.sidebar.appHelp.cta": "Encontrar mentoria",

  // ── JobApplyPage (+ cabeçalho / formulário / barra lateral) ────────────
  "jobApply.backToJob": "Voltar à vaga",
  "jobApply.backToJobs": "Voltar às vagas",
  "jobApply.header.eyebrow": "Candidatura · {title}",
  "jobApply.header.title": "Conta à <em>{org}</em> quem és.",
  "jobApply.header.closes": "Fecha a {date}",
  "jobApply.header.progressLabel": "Candidatura completa",

  "jobApply.aboutYouTitle": "Sobre ti",
  "jobApply.aboutYouSub":
    "Preenchemos o que conseguimos a partir do teu perfil. Edita o que tiver mudado.",
  "jobApply.fullName": "Nome completo",
  "jobApply.pronouns": "Pronomes",
  "jobApply.pronounsHelper": "Mostrado à equipa de recrutamento.",
  "jobApply.email": "Email",
  "jobApply.location": "Onde vives?",

  "jobApply.yourWorkTitle": "O teu trabalho",
  "jobApply.yourWorkSub":
    "Um CV é ótimo. Um portefólio é melhor. Envia os dois se puderes.",
  "jobApply.cv": "CV ou currículo",
  "jobApply.cvDrop": "Larga aqui o PDF, ou clica para escolher",
  "jobApply.cvHint": "Máx. 5 MB · PDF / DOCX",
  "jobApply.browse": "Procurar",
  "jobApply.portfolio": "Ligações do portefólio",
  "jobApply.portfolioHelper":
    "O teu perfil QueerPulse é anexado automaticamente. Desmarca em Privacidade se preferires que não.",
  "jobApply.sitePlaceholder": "O teu site ou Are.na",
  "jobApply.identityIg": "IG",
  "jobApply.instagramPlaceholder": "@teuhandle",
  "jobApply.identityQp": "QP",

  "jobApply.whyTitle": "Porquê esta vaga?",
  "jobApply.whySub":
    "Não precisas de mais do que dois parágrafos curtos. Foca o que te atrai na {org} e o que trazes.",
  "jobApply.coverNote": "Nota de apresentação",
  "jobApply.charCount": "{used} / {max}",
  "jobApply.coverPlaceholder":
    "O que te atraiu para esta vaga? Que talentos trazes? Em que gostavas de crescer?",
  "jobApply.availableFrom": "Disponível a partir de",
  "jobApply.salaryExpectation": "Expectativa salarial",
  "jobApply.salaryHelper":
    "O intervalo publicado é {salary}. Podes indicar um valor fora deste. Vão considerar.",
  "jobApply.salaryPlaceholder": "ex.: 1400 €/mês, ou em aberto",

  "jobApply.extraTitle": "Mais alguma coisa",
  "jobApply.extraOptional": " (opcional)",
  "jobApply.extraSub":
    "Há mais alguma coisa que queiras que a {org} saiba? Horário, necessidades de acesso, referências, o que for relevante.",
  "jobApply.extraLabel": "Notas para a equipa de recrutamento",
  "jobApply.extraPlaceholder":
    "Preferia terças e quintas-feiras no escritório para conseguir ir buscar o meu filho à escola…",

  "jobApply.draftSavedJustNow": "Rascunho guardado · agora mesmo",
  "jobApply.saveDraft": "Guardar rascunho",
  "jobApply.sending": "A enviar…",
  "jobApply.sendCta": "Enviar candidatura",

  "jobApply.sidebar.closes": "Fecha a <b>{date}</b>",
  "jobApply.sidebar.tipsTitle": "Antes de enviares",

  "jobApply.success.title": "A tua candidatura está a caminho de",
  "jobApply.success.closeLabel": "Acompanhar a tua candidatura",
  "jobApply.success.step1":
    "A {org} vai ver o teu perfil QueerPulse e tudo o que anexaste.",
  "jobApply.success.step2":
    "Vais receber uma notificação assim que responderem.",
  "jobApply.success.step3":
    "A maioria das equipas aqui responde no prazo de 10 dias.",
  "jobApply.success.footerCta": "Voltar a todas as vagas",
  "jobApply.success.body":
    "Enviada à {org} para a vaga de {title}. Não há mais nada a fazer por agora, a bola está do lado delas.",

  "jobApply.toast.draftSaved": "Rascunho guardado, retomas quando quiseres.",
  "jobApply.error.missingFields":
    "Adiciona o teu nome e email antes de enviar.",
  "jobApply.error.alreadyApplied":
    "Já te candidataste a esta vaga, consulta as tuas candidaturas.",
  "jobApply.error.generic":
    "Não conseguimos enviar a tua candidatura. Tenta novamente.",

  "jobApply.availability.now.title": "Imediatamente",
  "jobApply.availability.now.desc": "Disponível já",
  "jobApply.availability.soon.title": "Em 2–4 semanas",
  "jobApply.availability.soon.desc": "Período de aviso prévio",
  "jobApply.availability.later.title": "Em 1–3 meses",
  "jobApply.availability.later.desc": "A terminar compromissos",

  "jobApply.tip.autocorrect":
    "Revê bem a tua nota de apresentação, o corretor automático adora reescrever “queer”.",
  "jobApply.tip.profileLink":
    "Basta ligares o teu perfil QueerPulse. Vão ver o teu trabalho.",
  "jobApply.tip.replyTime":
    "A maioria das equipas aqui responde a todas as candidaturas no prazo de 10 dias.",
  "jobApply.tip.fixedComp":
    "A remuneração é fixa conforme publicado, mas o título e a data de início costumam ser negociáveis.",

  // ── BarterPage (+ Card / PostStrip) ─────────────────────────────────────
  "barter.hero.eyebrow": "Troca de competências queer",
  "barter.hero.title": "Troca aquilo que <em>sabes.</em>",
  "barter.hero.lead":
    "Uma bolsa de trocas estruturada, competências por competências, saber por saber. Sem dinheiro, sem comissões da plataforma. Publica o que podes oferecer e o que esperas receber em troca.",
  "barter.principle.noMoney.title": "Sem dinheiro",
  "barter.principle.noMoney.body":
    "Cada troca é entre pessoas. O valor é definido entre quem participa.",
  "barter.principle.reputation.title": "Com reputação",
  "barter.principle.reputation.body":
    "As ofertas vêm de pessoas verificadas. O teu voto de confiança na comunidade é o teu histórico de fiabilidade.",
  "barter.principle.wants.title": "O que precisas também conta",
  "barter.principle.wants.body":
    "Publica o que procuras, tanto como o que podes dar. Precisar é tão bem-vindo como oferecer.",

  "barter.search.placeholder": "Pesquisar nas trocas…",
  "barter.mode.all": "Todas",
  "barter.mode.offering": "A oferecer",
  "barter.mode.seeking": "À procura",
  "barter.count_one": "<b>{count}</b> publicação",
  "barter.count_other": "<b>{count}</b> publicações",

  "barter.cat.all": "Todas as categorias",
  "barter.cat.creative": "Criativo",
  "barter.cat.tech": "Tecnologia",
  "barter.cat.legal": "Jurídico e administrativo",
  "barter.cat.care": "Cuidado e saúde",
  "barter.cat.food": "Comida e hospitalidade",
  "barter.cat.body": "Corpo e movimento",
  "barter.cat.fallback": "Troca de competências",

  "barter.badge.offering": "A oferecer",
  "barter.badge.seeking": "À procura",
  "barter.badge.both": "A oferecer e à procura",

  "barter.card.offeringLabel": "A oferecer",
  "barter.card.wantLabel": "À procura de",
  "barter.card.proposeCta": "Propor uma troca",
  "barter.card.yoursCta": "A tua troca",
  "barter.toast.messageSent": "Mensagem enviada a {name}",
  "barter.postedToday": "Hoje",
  "barter.postedDaysAgo_one": "há {count} dia",
  "barter.postedDaysAgo_other": "há {count} dias",

  "barter.emptyLive.title": "Ainda não há trocas publicadas",
  "barter.emptyLive.description":
    "Sê a primeira pessoa a oferecer uma competência ou um bem, põe algo em cima da mesa aqui em baixo e deixa que a troca certa te encontre.",
  "barter.errorLive.title": "A troca não carregou",
  "barter.errorLive.description":
    "Correu algo mal do nosso lado ao ir buscar o quadro. Tenta outra vez daqui a um bocado.",
  "barter.errorLive.retry": "Tentar outra vez",
  "barter.empty.title": "Nada corresponde aos teus filtros",
  "barter.empty.description":
    "Ainda não há trocas que encaixem nessa combinação. Tenta alargar a pesquisa, ou publica o que tens para oferecer e deixa que a troca certa te encontre.",
  "barter.empty.clearFilters": "Limpar filtros",

  "barter.postStrip.success.title": "Está <em>em cima da mesa.</em>",
  "barter.postStrip.success.body":
    "A tua troca já está no topo do quadro. Avisamos-te quando alguém propuser uma troca.",
  "barter.postStrip.success.postAnother": "Publicar outra",
  "barter.postStrip.title": "Põe algo <em>em cima da mesa.</em>",
  "barter.postStrip.body":
    "Cada troca começa com uma publicação. Diz à comunidade o que podes oferecer e o que esperas receber em troca.",
  "barter.postStrip.offerPlaceholder":
    "Posso oferecer, ex.: aulas de português, design de logótipo…",
  "barter.postStrip.wantPlaceholder":
    "Procuro, ex.: ajuda com impostos, ajuda numa mudança…",
  "barter.postStrip.categoryLabel": "Categoria",
  "barter.postStrip.categoryPlaceholder": "Escolhe uma categoria",
  "barter.postStrip.submitCta": "Publicar na troca",
  "barter.postStrip.submitting": "A publicar…",
  "barter.postStrip.errorInvalid":
    "Confirma as duas linhas e a categoria e tenta outra vez.",
  "barter.postStrip.errorFailed":
    "A tua troca não foi publicada. Tenta outra vez daqui a um bocado.",
  "barter.postStrip.namePlaceholder": "Tu",
  "barter.postStrip.hoodPlaceholder": "A tua publicação",
  "barter.postStrip.detailPlaceholder":
    "Publicado agora mesmo, envia uma mensagem para começar a troca.",
  "barter.postStrip.tagNew": "novo",
  "barter.postStrip.tagYourPost": "a tua publicação",

  "barter.outro.title": "As competências são <em>a moeda.</em>",
  "barter.outro.sub":
    "A Troca QueerPulse está aberta a todas as pessoas da comunidade. Quanto mais ofereces, mais podes pedir.",
  "barter.outro.cta": "Junta-te à rede",

  // ── BarterDetailPage (+ ProposeCard / QuestionModal) ────────────────────
  "barterDetail.back": "Troca de competências",
  "barterDetail.goneLive.title": "Esta troca já não existe",
  "barterDetail.goneLive.description":
    "A publicação foi retirada do quadro, ou já não está disponível para ti. Vê o que mais há na troca de competências.",
  "barterDetail.emptyLive.cta": "Voltar à troca de competências",
  "barterDetail.sub.offering":
    "Disponível para a comunidade, troca por algo que a pessoa precisa.",
  "barterDetail.sub.seeking": "À procura disto, e a oferecer algo em troca.",
  "barterDetail.sub.both":
    "A oferecer uma coisa, à procura de outra. Propõe uma troca que funcione para os dois lados.",
  "barterDetail.locationWithHood": "{hood} · Lisboa",
  "barterDetail.repliesFast": "Costuma responder rápido",
  "barterDetail.messageCta": "Enviar mensagem a {firstName}",
  "barterDetail.section.offering": "O que <em>tem para oferecer</em>",
  "barterDetail.section.lookingFor": "O que <em>procura</em>",
  "barterDetail.section.howItWorks": "Como funciona <em>uma troca</em>",

  "barterDetail.steps.propose.title": "Propor",
  "barterDetail.steps.propose.text":
    "Envia uma mensagem a dizer o que trocarias e porque é que a troca funciona para ti.",
  "barterDetail.steps.agree.title": "Combinar",
  "barterDetail.steps.agree.text":
    "Definem a troca juntos, âmbito, calendário, formato. Sem dinheiro a trocar de mãos.",
  "barterDetail.steps.exchange.title": "Trocar",
  "barterDetail.steps.exchange.text":
    "Cada pessoa entrega a sua parte. Encontram-se em Lisboa ou fazem à distância, o que for mais prático.",
  "barterDetail.steps.vouch.title": "Voto de confiança",
  "barterDetail.steps.vouch.text":
    "Depois, deixa um voto de confiança para que a próxima pessoa saiba que correu bem.",

  "barterDetail.sidebar.quickFacts": "Resumo rápido",
  "barterDetail.sidebar.type": "Tipo",
  "barterDetail.sidebar.category": "Categoria",
  "barterDetail.sidebar.posted": "Publicado",
  "barterDetail.sidebar.area": "Zona",
  "barterDetail.sidebar.tagged": "Etiquetas",

  "barterDetail.propose.title": "Propor uma troca",
  "barterDetail.propose.lead": "Sem dinheiro, <em>só troca.</em>",
  "barterDetail.propose.placeholder":
    "Diz a {firstName} o que oferecerias em troca, e porque é que esta troca funciona para ti.",
  "barterDetail.propose.sendCta": "Enviar proposta",
  "barterDetail.propose.askFirst": "Perguntar antes",
  "barterDetail.propose.footNote":
    "Nada fica combinado até os dois dizerem que sim. As trocas são entre pessoas, a QueerPulse nunca fica com uma parte.",
  "barterDetail.propose.footNoteLive":
    "A tua proposta vai direta para a caixa de entrada da pessoa, e a conversa continua aí. Nada fica combinado até os dois dizerem que sim.",
  "barterDetail.propose.errorEmpty": "Escreve uma linha sobre o que trocarias.",
  "barterDetail.propose.toastSent": "Troca proposta a {name}.",
  "barterDetail.propose.sending": "A enviar…",
  "barterDetail.propose.alreadySent":
    "Já tens uma proposta com {firstName}. O que enviares agora chega como seguimento.",
  "barterDetail.propose.errorAlreadySent":
    "Já tens uma proposta nesta troca. Continua a conversa nas tuas mensagens.",
  "barterDetail.propose.errorNotAllowed":
    "Não podes propor uma troca aqui. Pode ser a tua própria publicação, ou tu e esta pessoa não se conseguem contactar.",
  "barterDetail.propose.errorGone":
    "Esta troca já não existe. Vê o que mais há na troca de competências.",
  "barterDetail.propose.errorFailed":
    "A tua proposta não foi enviada. Tenta outra vez daqui a um bocado.",
  "barterDetail.propose.yoursTitle": "Esta troca é tua",
  "barterDetail.propose.yoursLead":
    "As propostas de outras pessoas chegam à tua caixa de entrada. Responde aí para combinar a troca.",

  "barterQuestion.eyebrow": "Antes de propores",
  "barterQuestion.title": "Faz uma pergunta a <em>{firstName}</em>.",
  "barterQuestion.sub":
    "Ainda não é o momento certo para propores uma troca? Pergunta primeiro o que precisas de saber, calendário, o que procura, como funcionaria. Descontraído e sem pressão.",
  "barterQuestion.fieldLabel": "A tua pergunta *",
  "barterQuestion.placeholder":
    "Olá {firstName}, uma pergunta rápida antes de propor uma troca…",
  "barterQuestion.charsRemaining_one":
    "Falta mais {count} caráter para enviares.",
  "barterQuestion.charsRemaining_other":
    "Faltam mais {count} carateres para enviares.",
  "barterQuestion.keepOnPlatform":
    "Mantém a conversa na QueerPulse até ambas as partes concordarem em avançar.",
  "barterQuestion.cancel": "Cancelar",
  "barterQuestion.sendCta": "Enviar pergunta",
  "barterQuestion.sendingLabel": "A enviar…",
  "barterQuestion.success.title": "Pergunta",
  "barterQuestion.success.em": "enviada.",
  "barterQuestion.success.closeLabel": "Concluído",
  "barterQuestion.success.body":
    "A tua pergunta está a caminho de <strong>{name}</strong>. Nenhuma troca fica combinada até os dois dizerem que sim. Isto é só uma conversa para ver se pode resultar. Vais receber uma notificação aqui quando a pessoa responder.",

  // ── PostJobPage (gate + composer + steps + sidebar + preview + confirmation) ──
  "postJob.gate.title":
    "Publicar uma vaga é para <em>empresas verificadas</em>",
  "postJob.gate.sub":
    "Para manter a bolsa de emprego de confiança, só pessoas afiliadas a uma empresa podem publicar vagas. Afilia a tua para continuar. É rápido.",
  "postJob.gate.affiliateCta": "Afiliar a tua empresa",
  "postJob.gate.backCta": "Voltar à bolsa",
  "postJob.gate.point1":
    "Confirmamos que as empresas são genuinamente queer-inclusivas na prática.",
  "postJob.gate.point2":
    "As vagas são publicadas em nome da tua empresa verificada, com o logótipo e o selo.",
  "postJob.gate.point3":
    "Sem comissões de colocação. Isto é uma bolsa da comunidade.",

  "postJob.stepLabels.type": "Tipo e função",
  "postJob.stepLabels.details": "Detalhes",
  "postJob.stepLabels.pay": "Remuneração e benefícios",
  "postJob.stepLabels.screening": "Triagem",
  "postJob.stepLabels.review": "Revisão",
  "postJob.stepLabels.ariaLabel": "Progresso da publicação da vaga",

  "postJob.topbar.back": "Vagas e competências",
  "postJob.topbar.savedJustNow": "Guardado agora mesmo",
  "postJob.topbar.autosaves": "O rascunho é guardado automaticamente",
  "postJob.nav.back": "Voltar",
  "postJob.nav.continue": "Continuar",
  "postJob.nav.saveDraft": "Guardar rascunho",
  "postJob.nav.publish": "Publicar vaga",
  "postJob.nav.publishing": "A publicar…",
  "postJob.toast.saveDraft": "Rascunho guardado na tua empresa.",
  "postJob.toast.fillHighlighted": "Preenche os campos destacados.",
  "postJob.toast.agreeRequired":
    "Adiciona um título, uma descrição, e concorda com o Código de Cuidado.",
  "postJob.toast.notAuthorised":
    "Não tens autorização para publicar em nome de {company}. Muda para uma empresa de que fazes parte da equipa.",
  "postJob.toast.publishError":
    "Não foi possível publicar a tua vaga. Tenta novamente.",

  "postJob.field.optional": "opcional",
  "postJob.field.category": "Categoria",
  "postJob.field.commitment": "Compromisso",
  "postJob.field.experienceLevel": "Nível de experiência",
  "postJob.field.format": "Formato",
  "postJob.field.timezone": "Fuso horário",
  "postJob.field.location": "Localização",
  "postJob.field.level": "Nível",
  "postJob.field.where": "Onde",
  "postJob.field.pay": "Remuneração",
  "postJob.field.starts": "Início",
  "postJob.field.arrangement": "Modalidade",
  "postJob.field.title": "Título",
  "postJob.field.description": "Descrição",
  "postJob.field.perks": "Benefícios",
  "postJob.field.thisSpaceIs": "Este espaço é",
  "postJob.field.skills": "Competências",
  "postJob.field.screening": "Triagem",
  "postJob.field.postingAs": "A publicar como",
  "postJob.field.respondVia": "Responder via",

  "postJob.option.category.legalAdmin": "Jurídico e administrativo",
  "postJob.option.category.designCreative": "Design e criativo",
  "postJob.option.category.techEngineering": "Tecnologia e engenharia",
  "postJob.option.category.writingEditing": "Escrita e edição",
  "postJob.option.category.translation": "Tradução",
  "postJob.option.category.teachingTutoring": "Ensino e explicações",
  "postJob.option.category.healthWellbeing": "Saúde e bem-estar",
  "postJob.option.category.practicalHelp": "Ajuda prática",
  "postJob.option.category.other": "Outro",

  "postJob.option.commitment.fullTime": "Tempo inteiro",
  "postJob.option.commitment.partTime": "Tempo parcial",
  "postJob.option.commitment.contract": "Contrato",
  "postJob.option.commitment.freelanceGig": "Freelance / trabalho pontual",
  "postJob.option.commitment.volunteer": "Voluntariado",
  "postJob.option.commitment.internship": "Estágio",

  "postJob.option.seniority.anyLevel": "Qualquer nível",
  "postJob.option.seniority.entry": "Iniciante",
  "postJob.option.seniority.mid": "Intermédio",
  "postJob.option.seniority.senior": "Sénior",
  "postJob.option.seniority.leadPrincipal": "Liderança / Principal",

  "postJob.option.format.remote": "Remoto",
  "postJob.option.format.inPersonLisbon": "Presencial (Lisboa)",
  "postJob.option.format.hybrid": "Híbrido",
  "postJob.option.format.either": "Indiferente",

  "postJob.option.timezone.noPreference": "Sem preferência",
  "postJob.option.timezone.wetLisbon": "WET / Lisboa (UTC+0)",
  "postJob.option.timezone.cet": "CET (UTC+1)",
  "postJob.option.timezone.threeHoursOfLisbon": "±3h de Lisboa",
  "postJob.option.timezone.anyOverlap": "Qualquer sobreposição",

  "postJob.option.ratePer.hour": "Hora",
  "postJob.option.ratePer.day": "Dia",
  "postJob.option.ratePer.project": "Projeto",
  "postJob.option.ratePer.month": "Mês",
  "postJob.option.ratePer.year": "Ano",
  "postJob.option.ratePer.toDiscuss": "A combinar",

  "postJob.step1.eyebrow": "Passo 1 de 5",
  "postJob.step1.title": "A <em>função</em>",
  "postJob.step1.sub":
    "Como o trabalho está estruturado. Estes tornam-se os principais filtros com que as pessoas pesquisam a bolsa.",
  "postJob.step1.arrangementTitle": "Modalidade",
  "postJob.step1.arrangementSub":
    "O formato da função. Escolhe o mais próximo.",
  "postJob.step1.locationPlaceholder":
    "ex.: Arroios, Lisboa, ou um bairro / concelho",
  "postJob.step1.locationError": "Indica onde isto está baseado.",

  "postJob.step2.eyebrow": "Passo 2 de 5",
  "postJob.step2.title": "Os <em>detalhes</em>",
  "postJob.step2.sub":
    "Um título claro e uma descrição honesta trazem respostas muito mais úteis.",
  "postJob.step2.titlePlaceholder":
    'ex.: "Designer gráfico júnior, foco editorial"',
  "postJob.step2.titleError": "Dá um título à tua vaga.",
  "postJob.step2.titleCounter": "{used}/{max}",
  "postJob.step2.lookingForLabel": "O que procuras",
  "postJob.step2.descriptionPlaceholder":
    "Descreve o trabalho, para quem é, e como é o sucesso. Escreve como explicarias a uma pessoa da comunidade num evento.",
  "postJob.step2.descriptionError": "Adiciona uma descrição.",
  "postJob.step2.charsCount_one": "{count} caráter",
  "postJob.step2.charsCount_other": "{count} carateres",
  "postJob.step2.timelineTitle": "Calendário",
  "postJob.step2.applyBy": "Candidaturas até",
  "postJob.step2.startDate": "Data de início",
  "postJob.step2.startDatePlaceholder": "ex.: já, junho, flexível",

  "postJob.step3.eyebrow": "Passo 3 de 5",
  "postJob.step3.title": "Remuneração <em>e benefícios</em>",
  "postJob.step3.sub":
    "A transparência é um valor da comunidade aqui, e resulta.",
  "postJob.step3.rateTitle": "Valor",
  "postJob.step3.currency": "Moeda",
  "postJob.step3.min": "Mín.",
  "postJob.step3.max": "Máx.",
  "postJob.step3.optAbbrev": "opc.",
  "postJob.step3.per": "Por",
  "postJob.step3.hidePay.name": "Ocultar valores exatos",
  "postJob.step3.hidePay.desc":
    'Mostra "Competitivo" em vez de um número. Ainda vale a pena partilhar um intervalo na descrição.',
  "postJob.step3.barter.name": "Aberto a troca de competências ou permuta",
  "postJob.step3.barter.desc":
    "Troca competências em vez de (ou juntamente com) dinheiro, uma opção de pleno direito na QueerPulse.",
  "postJob.step3.nudge":
    "<strong>As vagas com um valor definido recebem ~2× mais respostas.</strong> As pessoas agradecem não ter de perguntar.",
  "postJob.step3.benefitsTitle": "Benefícios",
  "postJob.step3.benefitsSub":
    "Escolhe tudo o que se aplica. Aparecem como etiquetas na tua vaga.",

  "postJob.step4.eyebrow": "Passo 4 de 5",
  "postJob.step4.title": "Competências, <em>triagem</em> e quem publica",
  "postJob.step4.sub":
    "É aqui que as vagas da QueerPulse vão além de uma bolsa de emprego genérica.",
  "postJob.step4.screeningTitle": "Perguntas de triagem",
  "postJob.step4.screeningSub":
    "Faz até 3 perguntas às quais quem se candidata tem de responder. Ótimo para filtrar rapidamente.",
  "postJob.step4.questionPlaceholder": "ex.: Estás baseade em Portugal?",
  "postJob.step4.removeQuestionAria": "Remover pergunta",
  "postJob.step4.addQuestion": "Adicionar uma pergunta",
  "postJob.step4.spaceIsTitle": "Este espaço é…",
  "postJob.step4.spaceIsSub":
    "Sinais opcionais que dizem às pessoas o que esperar. Marca só o que for genuinamente verdade.",
  "postJob.step4.whosPostingTitle": "Quem publica",
  "postJob.step4.whosPostingSub":
    "As vagas são publicadas em nome da tua empresa verificada. É isso que mantém a bolsa de confiança.",
  "postJob.step4.verifiedEmployerAria": "Empresa verificada",
  "postJob.step4.notYou": "Não és tu?",

  "postJob.skills.title": "Competências",
  "postJob.skills.sub":
    "Adiciona a partir da lista partilhada para que as pessoas possam filtrar e encontrar-te, texto livre também funciona.",
  "postJob.skills.placeholder": "Começa a escrever uma competência…",
  "postJob.skills.addCta": "Adicionar",
  "postJob.skills.removeAria": "Remover {skill}",
  "postJob.skills.popular": "Popular nesta comunidade",

  "postJob.step5.eyebrow": "Passo 5 de 5",
  "postJob.step5.title": "Resposta e <em>revisão</em>",
  "postJob.step5.sub":
    "Escolhe como as pessoas te contactam e depois dá uma última vista de olhos.",
  "postJob.step5.respondTitle": "Como responder",
  "postJob.step5.respondSub":
    "Escolhe um ou mais. Os métodos selecionados revelam o seu próprio campo.",
  "postJob.step5.emailLabel": "Endereço de email",
  "postJob.step5.emailPlaceholder": "tu@exemplo.com",
  "postJob.step5.linkLabel": "Link externo",
  "postJob.step5.linkPlaceholder": "https://…",
  "postJob.step5.summaryTitle": "Resumo",
  "postJob.step5.dash": "Por definir",
  "postJob.step5.notSpecified": "Não especificado",
  "postJob.step5.questionCount_one": "{count} pergunta",
  "postJob.step5.questionCount_other": "{count} perguntas",
  "postJob.step5.editCta": "Editar",
  "postJob.step5.agreement":
    "Confirmo que esta vaga cumpre o <link>Código de Cuidado</link>, sem discriminação de identidade, e uma remuneração justa. <strong>A QueerPulse é um espaço de solidariedade.</strong>",

  "postJob.sidebar.livePreview": "Pré-visualização",
  "postJob.sidebar.fullView": "Ver tudo",
  "postJob.sidebar.hiring": "A contratar",
  "postJob.sidebar.titlePlaceholder": "O teu título vai aparecer aqui",
  "postJob.sidebar.descPlaceholder": "Adiciona uma descrição…",
  "postJob.sidebar.viewFullCta": "Ver a vaga completa",
  "postJob.sidebar.howThisWorks": "Como funciona",
  "postJob.sidebar.point1":
    "As vagas são <strong>visíveis apenas para membros</strong>, nunca públicas.",
  "postJob.sidebar.point2":
    "As vagas <strong>expiram ao fim de 60 dias</strong>, aviso ao dia 45.",
  "postJob.sidebar.point3":
    "<strong>Sem comissões de colocação.</strong> Uma bolsa da comunidade.",
  "postJob.sidebar.point4":
    "<strong>Edita ou fecha</strong> a qualquer momento a partir do perfil da tua empresa.",

  "postJob.preview.ariaLabel": "Pré-visualização da vaga",
  "postJob.preview.untitled": "Vaga sem título",
  "postJob.preview.verifiedEmployer": "empresa verificada",
  "postJob.preview.aboutRole": "Sobre esta função",
  "postJob.preview.noDescription": "Ainda sem descrição.",
  "postJob.preview.inclusivityTitle": "Este espaço é",
  "postJob.preview.youllBeAsked": "Vais ser questionade sobre",
  "postJob.preview.respondViaLabel": "Responder via",
  "postJob.preview.respondCta": "Responder",

  "postJob.confirm.title": "“{title}” está <em>publicada</em>",
  "postJob.confirm.sub":
    "As pessoas já a podem ver. Avisamos-te assim que alguém responder, e lembramos-te antes de expirar, dentro de 60 dias.",
  "postJob.confirm.viewListing": "Ver vaga",
  "postJob.confirm.postAnother": "Publicar outra",
  "postJob.confirm.performance.title": "Desempenho",
  "postJob.confirm.performance.body":
    "Acompanha visualizações, gravações e respostas ao longo da vida da tua vaga.",
  "postJob.confirm.performance.views": "Visualizações",
  "postJob.confirm.performance.saves": "Gravações",
  "postJob.confirm.performance.replies": "Respostas",
  "postJob.confirm.responses.title": "Respostas",
  "postJob.confirm.responses.body":
    "As respostas ficam todas num só lugar. Revê, envia mensagem, ou marca como preenchida a partir do teu gestor de vagas.",
  "postJob.confirm.responses.openManager": "Abrir gestor de vagas",
  "postJob.confirm.share.title": "Partilha",
  "postJob.confirm.share.body":
    "Copia o link e põe-no onde as tuas pessoas já estão.",
  "postJob.confirm.share.copyLink": "Copiar link",
  "postJob.confirm.share.toastLink": "Link copiado",
  "postJob.confirm.whatsNext.title": "A seguir",
  "postJob.confirm.whatsNext.body":
    "A tua função já aparece na bolsa e no perfil da tua empresa. As vagas novas têm a nota “ainda não revista” até serem verificadas pela comunidade.",

  // ── MentorshipPage (+ match modal/steps) ────────────────────────────────
  "mentorship.hero.eyebrow": "Mentoria",
  "mentorship.hero.title":
    "Alguém mais à frente no caminho <em>quer ajudar-te.</em>",
  "mentorship.hero.lead":
    "Mentoria formal um-para-um entre profissionais queer em Lisboa. Se estás a ter dificuldades, alguém na rede já passou por isso. Se já conseguiste ultrapassar, podes retribuir.",
  "mentorship.stat.activeMentors": "Mentores ativos na rede",
  "mentorship.stat.matchesMade": "Pares feitos até agora",
  "mentorship.stat.areasOfFocus": "Áreas de foco",

  "mentorship.choose.title": "O que te traz <em>aqui?</em>",
  "mentorship.choose.mentee.title": "Procuro um mentor",
  "mentorship.choose.mentee.desc":
    "Estás a navegar algo, uma transição de carreira, um bloqueio criativo, sair do armário profissionalmente, um ambiente de trabalho difícil, uma cidade nova. Beneficiarias de falar com alguém que já passou por isso.",
  "mentorship.choose.mentee.for":
    "Para: qualquer pessoa, em qualquer fase, que precise de orientação",
  "mentorship.choose.mentor.title": "Posso ser mentor",
  "mentorship.choose.mentor.desc":
    "Já passaste por coisas suficientes para teres algo a oferecer. Não precisas de ser especialista. Só precisas de ter navegado algo que outra pessoa está a navegar agora.",
  "mentorship.choose.mentor.for":
    "Para: pessoas com experiência dispostas a partilhá-la",

  "mentorship.emptyLive.title": "Diretório de mentores em breve",
  "mentorship.emptyLive.description":
    "Ainda estamos a construir a rede de mentores. Volta em breve para explorar e ligar-te a mentores da comunidade.",
  "mentorship.strip.title": "Mentores atuais <em>na rede</em>",
  "mentorship.strip.sub":
    "Estas pessoas abriram-se à mentoria. Podes pedir um par através do formulário acima.",

  "mentorship.outro.title": "Tens algo <em>para dar?</em>",
  "mentorship.outro.sub":
    "A mentoria é uma forma. Explora oportunidades de voluntariado para encontrar outras formas de contribuir para a comunidade à tua volta.",
  "mentorship.outro.cta": "Ver funções de voluntariado",

  "mentorship.matchArea.careerDirection": "Direção de carreira",
  "mentorship.matchArea.comingOutProfessionally":
    "Sair do armário profissionalmente",
  "mentorship.matchArea.creativePractice": "Prática criativa",
  "mentorship.matchArea.startingBusiness": "Começar um negócio",
  "mentorship.matchArea.difficultWorkplace":
    "Navegar um ambiente de trabalho difícil",
  "mentorship.matchArea.newToLisbon": "Recém-chegade a Lisboa",
  "mentorship.matchArea.settlingInLisbon": "A instalar-te em Lisboa",
  "mentorship.matchArea.mentalHealthAtWork": "Saúde mental no trabalho",
  "mentorship.matchArea.legalRightsIssues": "Questões legais ou de direitos",
  "mentorship.matchArea.legalRightsNavigation": "Navegação de direitos legais",

  "mentorship.match.findMentorAria": "Encontrar um mentor",
  "mentorship.match.becomeMentorAria": "Tornar-te mentor",
  "mentorship.match.closeAria": "Fechar",
  "mentorship.match.stepOf": "Passo {step} de {total}",

  "mentorship.match.success.mentee.title": "Pedido recebido.",
  "mentorship.match.success.mentor.title": "Obrigade.",
  "mentorship.match.success.mentee.body":
    "Vamos rever o teu pedido e enviar-te uma sugestão de par no prazo de 2 semanas. A apresentação chega por email.",
  "mentorship.match.success.mentor.body":
    "Vamos adicionar-te à bolsa de mentores e contactar-te quando tivermos um bom par para ti. Significa muito.",
  "mentorship.match.success.done": "Concluído",

  "mentorship.mentee.step1.eyebrow": "A encontrar-te um mentor",
  "mentorship.mentee.step1.title": "Com o que precisas de ajuda?",
  "mentorship.mentee.step1.sub":
    "Escolhe as áreas onde mais beneficiarias de orientação. Vamos juntar-te a alguém com experiência direta nelas.",
  "mentorship.mentee.step2.eyebrow": "Sobre ti",
  "mentorship.mentee.step2.title": "O que deve o teu mentor saber?",
  "mentorship.mentee.step2.namePlaceholder": "O teu nome",
  "mentorship.mentee.step2.rolePlaceholder": "A tua função ou prática",
  "mentorship.mentee.step2.frequencyPlaceholder":
    "Com que frequência gostarias de te encontrar?",
  "mentorship.mentee.step2.frequency.monthly": "Uma vez por mês",
  "mentorship.mentee.step2.frequency.twiceMonthly": "Duas vezes por mês",
  "mentorship.mentee.step2.frequency.asNeeded": "Conforme necessário",
  "mentorship.mentee.step2.notePlaceholder":
    "Uma frase sobre o que se passa e que tipo de apoio ajudaria…",
  "mentorship.mentee.step3.eyebrow": "Quase pronto",
  "mentorship.mentee.step3.title": "Como te contactamos?",
  "mentorship.mentee.step3.emailPlaceholder": "O teu endereço de email",
  "mentorship.mentee.step3.sub":
    "Vamos rever o teu pedido e sugerir um par no prazo de 2 semanas. Vais receber uma apresentação por email e continuar a partir daí.",
  "mentorship.mentee.toastSubmitted": "Pedido de par recebido",

  "mentorship.mentor.step1.eyebrow": "A tornares-te mentor",
  "mentorship.mentor.step1.title": "O que podes oferecer?",
  "mentorship.mentor.step1.sub":
    "Não precisas de ser especialista. Precisas de ter navegado algo que outra pessoa está a navegar agora.",
  "mentorship.mentor.step2.eyebrow": "A tua disponibilidade",
  "mentorship.mentor.step2.title": "Quanto tempo podes dar?",
  "mentorship.mentor.step2.namePlaceholder": "O teu nome e função",
  "mentorship.mentor.step2.menteesPlaceholder":
    "Quantas pessoas mentorandas por trimestre?",
  "mentorship.mentor.step2.mentees.one": "1 pessoa",
  "mentorship.mentor.step2.mentees.two": "2 pessoas",
  "mentorship.mentor.step2.mentees.three": "3 pessoas",
  "mentorship.mentor.step2.formatPlaceholder": "Formato de encontro preferido",
  "mentorship.mentor.step2.format.inPersonLisbon": "Presencial em Lisboa",
  "mentorship.mentor.step2.format.video": "Chamada de vídeo",
  "mentorship.mentor.step2.format.either": "Tanto faz",
  "mentorship.mentor.step2.emailPlaceholder": "O teu endereço de email",
  "mentorship.mentor.toastSubmitted": "Adicionade à bolsa de mentores",

  "mentorship.nav.continue": "Continuar",
  "mentorship.nav.back": "Voltar",
  "mentorship.nav.submit": "Submeter",
  "mentorship.cta.requestMatch": "Pedir um par",
  "mentorship.cta.joinWaitlist": "Entrar na lista de espera",

  // ── MentorDetailPage (+ header / sections / sidebar / cycle nav) ───────
  "mentorDetail.backToAll": "Todos os mentores",
  "mentorDetail.emptyLive.title": "Este perfil de mentor está a chegar",
  "mentorDetail.emptyLive.description":
    "O diretório de mentores ainda não está ativo. Volta para explorar a mentoria quando abrir.",
  "mentorDetail.emptyLive.cta": "Voltar à mentoria",
  "mentorDetail.messageCta": "Enviar mensagem a {firstName}",
  "mentorDetail.cyclePrevious": "Anterior",
  "mentorDetail.cycleNext": "Seguinte",
  "mentorDetail.cyclePosition": "{position} de {total}",
  "mentorDetail.section.howTheyMentor": "Como {firstName} <em>mentora</em>",
  "mentorDetail.section.fitFor": "Para quem <em>és a pessoa certa</em>",
  "mentorDetail.fit.benefitIf": "Beneficiarias se…",
  "mentorDetail.fit.andIdeally": "E, idealmente…",
  "mentorDetail.fit.andMaybe": "E talvez…",
  "mentorDetail.fit.notRightCall": "Não é a escolha certa se…",
  "mentorDetail.section.process": "O <em>processo</em>, passo a passo",
  "mentorDetail.sidebar.workWith": "Trabalhar com {firstName}",
  "mentorDetail.sidebar.noUpfrontCost":
    "Sem custo inicial. A mentoria aqui é entre pessoas. Podes sempre fazer uma pergunta antes de te comprometeres.",
  "mentorDetail.sidebar.notSureYet": "Ainda não tens a certeza?",
  "mentorDetail.sidebar.askQuestion": "Enviar uma pergunta a {firstName}",
  "mentorDetail.sidebar.browseAll": "Explorar todos os mentores",

  // ── ApplicationStatusPage (+ header/list/card, listing-manager modals) ──
  "applicationStatus.header.eyebrow": "As tuas vagas",
  "applicationStatus.header.title": "Onde tudo <em>está.</em>",
  "applicationStatus.header.sub":
    "Acompanha todas as candidaturas, vê há quanto tempo as empresas têm a tua nas mãos, e sabe quando fazer um seguimento.",
  "applicationStatus.header.counterSent": "/ {count} enviadas",
  "applicationStatus.header.activeLabel": "Candidaturas ativas",

  "applicationStatus.tab.all": "Todas",
  "applicationStatus.tab.active": "Ativas",
  "applicationStatus.tab.offer": "Ofertas",
  "applicationStatus.tab.closed": "Fechadas",
  "applicationStatus.tab.draft": "Rascunhos",

  "applicationStatus.legend.key": "Legenda",
  "applicationStatus.legend.done": "Concluído. Este passo está feito",
  "applicationStatus.legend.active": "Estás aqui, passo atual",
  "applicationStatus.legend.upcoming":
    "Por vir. Este passo ainda está à frente",
  "applicationStatus.legend.closed": "Fechado, terminado ou retirado",

  "applicationStatus.group.offers.title": "Ofertas, a tua decisão",
  "applicationStatus.group.inProgress.title": "Em curso",
  "applicationStatus.group.drafts.title": "Rascunhos",
  "applicationStatus.group.drafts.hint":
    "Por terminar, conclui estas antes que fechem.",
  "applicationStatus.group.closedWithdrawn.title": "Fechadas e retiradas",
  "applicationStatus.group.closedWithdrawn.hint":
    "Sem ação necessária, guardadas para referência.",
  "applicationStatus.compareOffersCta": "Comparar ofertas",

  "applicationStatus.empty.title": "Ainda sem candidaturas",
  "applicationStatus.empty.description":
    "Quando te candidatares a uma vaga, bolsa ou oportunidade, vais poder acompanhar todas, e comparar ofertas lado a lado, aqui mesmo.",
  "applicationStatus.empty.browseCta": "Explorar vagas",

  "applicationStatus.error.title":
    "Não foi possível carregar as tuas candidaturas",
  "applicationStatus.error.description":
    "Algo correu mal ao obter as tuas candidaturas. Espera um momento e tenta de novo, nada do que enviaste se perdeu.",

  // Elementos do acompanhamento em modo real — o subtítulo da data de
  // candidatura, as etapas derivadas do estado, as linhas de estado e os
  // selos que os cartões vindos da API mostram (a ficção detalhada de
  // recrutador/entrevista/oferta é apenas do modo demo).
  "applicationStatus.live.appliedOn": "Candidatura em {date}",
  "applicationStatus.live.action.viewSubmission": "Ver candidatura",
  "applicationStatus.live.stage.submitted": "Enviada",
  "applicationStatus.live.stage.review": "Em análise",
  "applicationStatus.live.stage.decision": "Decisão",
  "applicationStatus.live.stage.offer": "Oferta",
  "applicationStatus.live.stage.declined": "Desta vez não",
  "applicationStatus.live.status.submitted":
    "Enviada à empresa. Vais ver as atualizações aqui à medida que responderem.",
  "applicationStatus.live.status.reviewing":
    "A empresa está a ler a tua candidatura agora.",
  "applicationStatus.live.status.accepted":
    "Boas notícias, a tua candidatura foi aceite.",
  "applicationStatus.live.status.declined":
    "Desta vez não resultou. Fica guardada aqui para o teu registo.",
  "applicationStatus.live.badge.submitted": "Acabada de enviar",
  "applicationStatus.live.badge.reviewing": "Em análise",
  "applicationStatus.live.badge.accepted": "Aceite",
  "applicationStatus.live.badge.declined": "Fechada",

  "applicationStatus.card.stepOf": "Passo {step} de {total}",
  "applicationStatus.card.whatThisMeans": "O que isto significa",

  "applicationStatus.close": "Fechar",
  "applicationStatus.submission.eyebrow": "A tua candidatura",
  "applicationStatus.submission.attachments": "Anexos",
  "applicationStatus.company.eyebrow": "A empresa",
  "applicationStatus.company.statPeople": "Pessoas",
  "applicationStatus.company.statVerified": "Verificada pela comunidade",
  "applicationStatus.company.statWeekPilot": "Piloto semanal",
  "applicationStatus.company.sector": "Setor",
  "applicationStatus.company.based": "Localização",
  "applicationStatus.company.viewDirectory": "Ver no diretório",
  "applicationStatus.note.from": "Uma nota de {company}",

  // Linhas de estado geradas pelo applicationStatus.patches.tsx logo após a
  // pessoa tomar uma ação (ver nota de âmbito no catálogo EN).
  "applicationStatus.patch.withdrawn":
    "Retiraste esta candidatura agora mesmo. A empresa foi notificada com delicadeza.",
  "applicationStatus.patch.followedUp":
    "<b>Seguimento enviado agora mesmo.</b> Foram gentilmente lembrados. Costumas ter resposta em poucos dias.",
  "applicationStatus.patch.submitted":
    "Enviada agora mesmo. O prazo indicado é de 7 dias. Vamos de olho no relógio por ti.",
  "applicationStatus.patch.accepted":
    "<b>Oferta aceite.</b> Vão enviar-te o contrato por email nos próximos dois dias úteis.",
  "applicationStatus.patch.declined":
    "Recusaste esta oferta. Foram agradecidos calorosamente em teu nome.",

  "msg.message.title": "Enviar mensagem",
  "msg.message.em": "à pessoa recrutadora.",
  "msg.message.sub":
    "Vai direto para a caixa de entrada, sem confirmação de leitura, sem algoritmo pelo meio.",
  "msg.followup.title": "Enviar um",
  "msg.followup.em": "seguimento.",
  "msg.followup.sub":
    "Um empurrãozinho simpático. Já escrevemos algo caloroso. Edita como quiseres.",
  "msg.followup.preset":
    "Olá. Só uma nota simpática para saber como está a minha candidatura. Continuo com muito interesse na vaga e disponível para partilhar o que for útil. Sem qualquer pressa, e agradeço o teu tempo.",
  "msg.conversation.title": "Abrir a",
  "msg.conversation.em": "conversa.",
  "msg.conversation.sub": "Continua a conversa diretamente.",
  "msg.recipientHiringTeam": "Equipa de contratação",
  "msg.historyWith":
    "O histórico completo com {firstName}, todas as mensagens e marcos, em ordem.",
  "msg.you": "Tu",
  "msg.yourReply": "A tua resposta",
  "msg.replyPlaceholder": "Escreve uma resposta…",
  "msg.sendingLabel": "A enviar…",
  "msg.sendCta": "Enviar",
  "msg.yourMessageLabel": "A tua mensagem",
  "msg.messagePlaceholder": "Escreve à vontade.",
  "msg.cancel": "Cancelar",
  "msg.success.title": "Mensagem",
  "msg.success.em": "enviada.",
  "msg.success.body":
    "A tua mensagem para {firstName} está a caminho. Vais receber a resposta diretamente na tua caixa de entrada.",

  "calendar.eyebrow": "Entrevista",
  "calendar.close": "Fechar",
  "calendar.icsLabel": "Ficheiro .ics",
  "calendar.googleLabel": "Google Calendar",
  "calendar.addingLabel": "A adicionar…",
  "calendar.success.title": "Guardado no teu",
  "calendar.success.em": "calendário.",
  "calendar.success.google":
    "Abrimos o Google Calendar, basta guardares. Também te vamos lembrar na manhã do dia.",
  "calendar.success.ics":
    "O convite (.ics) foi descarregado, abre-o para adicionar o evento. Também te vamos lembrar na manhã do dia.",
  "calendar.when": "Quando",
  "calendar.where": "Onde",
  "calendar.with": "Com",

  "withdraw.eyebrow": "Retirar",
  "withdraw.title": "Desistir de <em>{company}?</em>",
  "withdraw.sub":
    "Isto retira-te da consideração para <b>{title}</b>. Vamos enviar uma nota breve e educada em teu nome, não precisas de escrever nada.",
  "withdraw.reasonLabel": "Motivo (só tu vês isto)",
  "withdraw.reasonPlaceholder": "Escolhe um motivo, ou deixa em aberto",
  "withdraw.cantUndo":
    "Isto não pode ser desfeito, terias de te candidatar de novo.",
  "withdraw.keepIt": "Manter",
  "withdraw.sendingLabel": "A retirar…",
  "withdraw.submitCta": "Retirar candidatura",
  "withdraw.success.title": "Candidatura",
  "withdraw.success.em": "retirada.",
  "withdraw.success.body":
    "Avisámos {company} com educação. Esta vaga passou para o separador Fechadas.",
  "withdrawReason.acceptedAnother": "Aceitei outra vaga",
  "withdrawReason.noLongerFit": "Já não é adequado",
  "withdrawReason.payDidntWork": "A remuneração ou condições não resultaram",
  "withdrawReason.tookTooLong": "O processo demorou demasiado",
  "withdrawReason.preferNotToSay": "Prefiro não dizer",

  "negotiate.eyebrow": "Negociação da oferta",
  "negotiate.title": "Pede o que <em>vale.</em>",
  "negotiate.sub":
    "Negociar é normal, a maioria das ofertas tem margem. Aqui está a tua vantagem, as tuas alavancas, e cinco formas de pedir.",
  "negotiate.onTheTable": "Em cima da mesa",
  "negotiate.holiday": "Férias",
  "negotiate.whatMattersMost": "O que mais te importa",
  "negotiate.pickAngle": "Escolhe a tua abordagem",
  "negotiate.draftLabel": "O teu rascunho de resposta. Edita para soar como tu",
  "negotiate.copyDraft": "Copiar rascunho",
  "negotiate.copiedToast": "Rascunho copiado",
  "negotiate.sendingLabel": "A enviar…",
  "negotiate.sendCta": "Enviar resposta",
  "negotiate.success.title": "Contraproposta",
  "negotiate.success.em": "enviada.",
  "negotiate.success.body":
    "A tua resposta está a caminho de {company}. Pedir é normal e esperado, fizeste exatamente bem.",
  "lever.baseSalary": "Salário base",
  "lever.holidayDays": "Dias de férias",
  "lever.remoteDays": "Dias remotos",
  "lever.learningBudget": "Orçamento de formação",
  "lever.startDate": "Data de início",
  "lever.titleScope": "Título e âmbito",
  "principle.anchor": "Ancora-te no valor que trazes, nunca no que precisas.",
  "principle.nameNumber":
    "Diz um número claro e depois fica em silêncio, deixa-os responder.",
  "principle.trade":
    "Se o salário base não mexer, troca: dias, orçamento, título, flexibilidade.",
  "principle.stayWarm": "Mantém a proximidade. Isto é uma relação.",
  "negotiate.angle.collaborative.name": "O pedido colaborativo",
  "negotiate.angle.collaborative.blurb":
    "Caloroso, focado na parceria. Melhor quando já há sintonia.",
  "negotiate.angle.market.name": "O argumento de mercado",
  "negotiate.angle.market.blurb":
    "Baseado em dados e confiante. Melhor quando tens os valores de mercado do teu lado.",
  "negotiate.angle.bundle.name": "O pacote",
  "negotiate.angle.bundle.blurb":
    "Trocar entre alavancas. Melhor quando o teto salarial é fixo.",
  "negotiate.angle.enthusiastic.name": "Começar com um sim",
  "negotiate.angle.enthusiastic.blurb":
    "Entusiasmo primeiro, número depois. Desarmante e eficaz.",
  "negotiate.angle.time.name": "Pedir tempo",
  "negotiate.angle.time.blurb":
    "Ganhar espaço para decidir, com calma, sem pressão.",

  "offer.respondByEyebrow": "A tua oferta · responde até {date}",
  "offer.saidYes": "A {company} <em>disse sim.</em>",
  "offer.sub":
    "Aqui está tudo em cima da mesa. Leva o teu tempo, depois escolhe.",
  "offer.salary": "Salário",
  "offer.holiday": "Férias",
  "offer.start": "Início",
  "offer.declinePolitely": "Recusar com educação",
  "offer.decliningLabel": "A recusar…",
  "offer.acceptCta": "Aceitar oferta",
  "offer.acceptingLabel": "A aceitar…",
  "offer.success.title": "Oferta",
  "offer.success.emAccepted": "aceite.",
  "offer.success.emDeclined": "recusada.",
  "offer.undo.changedMind":
    "Mudaste de ideias? Podes desfazer durante {seconds}s.",
  "offer.undo.button": "Desfazer",
  "offer.undo.confirmed": "Isto está agora confirmado.",
  "offer.success.acceptedBody":
    "Parabéns, a {company} vai enviar o teu contrato no prazo de dois dias úteis.",
  "offer.success.declinedBody":
    "Agradecemos calorosamente à {company} em teu nome. A porta fica aberta para o futuro.",

  "resume.eyebrowPrefix": "Retomar rascunho · {deadline}",
  "resume.title": "Termina a tua <em>candidatura.</em>",
  "resume.progress_one": "{percent}% concluído · falta {count} coisa",
  "resume.progress_other": "{percent}% concluído · faltam {count} coisas",
  "resume.coverLetterLabel": "Carta de apresentação",
  "resume.coverLetterPlaceholder":
    "Umas linhas sinceras sobre porquê esta vaga.",
  "resume.availabilityLabel": "Disponibilidade",
  "resume.availabilityPlaceholder": "ex.: aviso prévio de duas semanas",
  "resume.saveClose": "Guardar e fechar",
  "resume.submittingLabel": "A submeter…",
  "resume.submitCta": "Submeter candidatura",
  "resume.success.title": "Candidatura",
  "resume.success.em": "enviada.",
  "resume.success.body":
    "Boa, a tua candidatura para {company} foi enviada. Já está no teu separador Ativas.",

  "compare.eyebrow": "As tuas ofertas",
  "compare.title": "Duas ofertas, <em>lado a lado.</em>",
  "compare.sub":
    "Uma vista calma do que está em cima da mesa. Compara os números e responde quando quiseres.",
  "compare.whatsIncluded": "O que está incluído",
  "compare.respondCta": "Responder",
  "compare.close": "Fechar",
  "compareRow.salary": "Salário",
  "compareRow.holiday": "Férias",
  "compareRow.startDate": "Data de início",
  "compareRow.respondBy": "Responder até",
  "compareRow.howItPays": "Como paga",

  // ── SolidarityPage (+ directory) ────────────────────────────────────────
  "solidarity.hero.eyebrow": "Cuidado comunitário",
  "solidarity.hero.titleLine1": "Paga o que",
  "solidarity.hero.titleEm": "puderes.",
  "solidarity.hero.sub":
    "Profissionais da comunidade QueerPulse que oferecem tarifas em escala variável, porque o acesso a bons cuidados não devia depender do que ganhas.",
  "solidarity.hero.note":
    "Todes os profissionais foram verificados por pelo menos duas pessoas da comunidade.",
  "solidarity.how.step1.title": "Encontra o teu profissional",
  "solidarity.how.step1.body":
    "Filtra por profissão, bairro, ou idioma. Cada listagem explica como funciona a escala variável, sem surpresas.",
  "solidarity.how.step2.title": "Contacta diretamente",
  "solidarity.how.step2.body":
    "Contacta através da plataforma ou por email. Tu decides a conversa, não tens de explicar a tua situação financeira a mais ninguém primeiro.",
  "solidarity.how.step3.title": "Paga o que puderes",
  "solidarity.how.step3.body":
    "Cada profissional define o seu próprio intervalo e abordagem. Alguns usam escalas por rendimento, outros pedem que proponhas o valor. A listagem explica como.",
  "solidarity.outro.title": "Cuidar é um <em>ato coletivo.</em>",
  "solidarity.outro.sub":
    "A QueerPulse liga a comunidade a profissionais que acreditam no acesso tanto quanto tu.",
  "solidarity.outro.cta": "Junta-te à rede",

  "solidarity.filter.all": "Todas",
  "solidarity.filter.therapy": "Terapia",
  "solidarity.filter.legal": "Jurídico",
  "solidarity.filter.medical": "Medicina",
  "solidarity.filter.dental": "Dentista",
  "solidarity.filter.vet": "Veterinária",
  "solidarity.filter.finance": "Contabilidade",
  "solidarity.filter.body": "Trabalho corporal",

  "solidarityDirectory.professionLabel": "Profissão",
  "solidarityDirectory.searchPlaceholder": "Pesquisar por nome, zona…",
  "solidarityDirectory.count_one": "<b>{count}</b> profissional",
  "solidarityDirectory.count_other": "<b>{count}</b> profissionais",
  "solidarityDirectory.badgeMember": "Comunidade",
  "solidarityDirectory.badgeVerified": "Perfil verificado",
  "solidarityDirectory.slidingScaleLabel": "Escala variável",
  "solidarityDirectory.contactCta": "Contactar",
  "solidarityDirectory.empty.title": "Sem resultados para essa procura",
  "solidarityDirectory.empty.description":
    "Ainda ninguém corresponde a essa pesquisa. Tenta outra profissão ou limpa a pesquisa para ver todas as pessoas que oferecem cuidado em escala variável.",
  "solidarityDirectory.empty.clearFilters": "Limpar filtros",
  "solidarityDirectory.emptyLive.title": "Diretório em breve",
  "solidarityDirectory.emptyLive.description":
    "Estamos a verificar profissionais que oferecem tarifários solidários. Em breve vais poder encontrá-los e contactá-los aqui.",
  "solidarityDirectory.register.titleLine1": "Ofereces",
  "solidarityDirectory.register.titleEm": "tarifários solidários?",
  "solidarityDirectory.register.body":
    "Se és profissional na comunidade e já ofereces tarifas em escala variável, junta-te a esta lista. Demora dez minutos e ajuda as pessoas a encontrar-te.",
  "solidarityDirectory.register.cta": "Regista a tua prática",
  "solidarityDirectory.register.questionsLink":
    "Perguntas primeiro? Contacta-nos",

  // ── tools/ToolPage (shared document-generator shell, all freelance tools) ──
  "toolPage.backToEconomy": "Voltar à Economia",
  "toolPage.eyebrowFreelance": "Ferramentas para freelancers",
  "toolPage.eyebrowCommunity": "Comunidade",
  "toolPage.downloadPdf": "Descarregar PDF",
  "toolPage.copyText": "Copiar texto",
  "toolPage.copiedToast": "Copiado para a área de transferência",
  "toolPage.reset": "Repor",

  // ── tax.constants.ts — IVA rate dropdown labels (InvoiceFormFields, DayRateCalculatorPage) ──
  "tax.ivaRate.0": "0% (isento)",
  "tax.ivaRate.6": "6% (reduzida)",
  "tax.ivaRate.13": "13% (intermédia)",
  "tax.ivaRate.23": "23% (normal)",

  // ── IvaTrackerForm / IvaTrackerPage / IvaTrackerStatus ─────────────────
  "ivaTracker.title": "Fica abaixo do <em>limite.</em>",
  "ivaTracker.sub":
    "Regista o teu rendimento faturado em relação ao limite de isenção de IVA de 15 000 € (art. 53.º). Guardado apenas neste dispositivo.",
  "ivaTracker.form.whatForLabel": "Do que se tratou",
  "ivaTracker.form.whatForPlaceholder": "ex.: Design de logótipo, Café Aurora",
  "ivaTracker.form.amountLabel": "Valor (€)",
  "ivaTracker.form.dateLabel": "Data",
  "ivaTracker.form.addCta": "Adicionar fatura",
  "ivaTracker.form.loggedHead": "Faturas registadas",
  "ivaTracker.form.empty":
    "Ainda não registaste nada. Adiciona a tua primeira fatura acima.",
  "ivaTracker.form.removeAriaLabel": "Remover {label}",
  "ivaTracker.status.eyebrow": "Rumo ao limite de 15 000 €",
  "ivaTracker.status.barAriaLabel":
    "Rendimento faturado em relação ao limite de isenção de IVA",
  "ivaTracker.status.invoiced": "Faturado",
  "ivaTracker.status.headroomLeft": "Margem restante",
  "ivaTracker.status.overBy": "Acima em",
  "ivaTracker.status.thresholdUsed": "Limite utilizado",
  "ivaTracker.status.safeNote":
    "Confortavelmente abaixo do limite. Continua a registar faturas e vais ver a tua margem a diminuir em tempo real.",
  "ivaTracker.status.nearNote":
    "A aproximar-se, resta apenas {remaining} de margem. Planeia bem o resto do ano antes de ultrapassares {threshold}.",
  "ivaTracker.status.overNote":
    "Ultrapassaste o limite de isenção de {threshold}. Podes terminar o ano isento, mas no próximo ano vais cobrar IVA, e ultrapassar {overrun} (25% acima) obriga-te a sair de imediato.",
  "ivaTracker.status.overrunTitle": "Tens de sair da <em>isenção.</em>",
  "ivaTracker.status.overrunBody":
    "Ultrapassaste {overrun}, mais de 25% acima do limite, pelo que a isenção do art. 53.º termina ainda este ano. Vais ter de começar a cobrar IVA e retirar a nota de isenção das tuas faturas.",
  "ivaTracker.status.overrunNote": "Até agora as tuas faturas tinham: {note}",

  // ── InvoiceForm / InvoiceFormFields / InvoiceLineItems / InvoicePreview / InvoiceGeneratorPage ──
  "invoiceTool.title": "Cria uma <em>fatura.</em>",
  "invoiceTool.sub":
    "Preenche os detalhes e vê a tua fatura-recibo a construir-se sozinha. Quando estiver como queres, guarda-a diretamente em PDF, sem conta, sem envios, nada sai do teu navegador.",
  "invoiceTool.issuer.legend": "Os teus dados",
  "invoiceTool.issuer.nameLabel": "Nome / empresa",
  "invoiceTool.issuer.namePlaceholder": "O teu nome ou estúdio",
  "invoiceTool.issuer.nifLabel": "NIF",
  "invoiceTool.issuer.emailLabel": "Email",
  "invoiceTool.issuer.emailPlaceholder": "tu@exemplo.com",
  "invoiceTool.issuer.addressLabel": "Morada",
  "invoiceTool.issuer.addressPlaceholder": "Rua, código postal, cidade",
  "invoiceTool.issuer.ibanLabel": "IBAN",
  "invoiceTool.issuer.ibanPlaceholder": "PT50 0000 0000 0000 0000 0000 0",
  "invoiceTool.client.legend": "Cliente",
  "invoiceTool.client.nameLabel": "Nome do cliente",
  "invoiceTool.client.namePlaceholder": "A quem estás a faturar",
  "invoiceTool.client.nifLabel": "NIF do cliente",
  "invoiceTool.client.addressLabel": "Morada do cliente",
  "invoiceTool.optional": "Opcional",
  "invoiceTool.meta.legend": "Fatura",
  "invoiceTool.meta.numberLabel": "Número da fatura",
  "invoiceTool.meta.numberPlaceholder": "FR 2026/001",
  "invoiceTool.meta.issueDateLabel": "Data de emissão",
  "invoiceTool.meta.dueDateLabel": "Data de vencimento",
  "invoiceTool.meta.ivaRateLabel": "Taxa de IVA",
  "invoiceTool.lines.legend": "Linhas da fatura",
  "invoiceTool.lines.description": "Descrição",
  "invoiceTool.lines.qty": "Qtd.",
  "invoiceTool.lines.unit": "Unitário (€)",
  "invoiceTool.lines.total": "Total",
  "invoiceTool.lines.descAriaLabel": "Descrição da linha {index}",
  "invoiceTool.lines.qtyAriaLabel": "Quantidade da linha {index}",
  "invoiceTool.lines.unitAriaLabel": "Preço unitário da linha {index}",
  "invoiceTool.lines.descPlaceholder": "O que entregaste",
  "invoiceTool.lines.removeAriaLabel": "Remover linha {index}",
  "invoiceTool.lines.addCta": "Adicionar linha",
  "invoiceTool.notes.legend": "Notas",
  "invoiceTool.notes.placeholder":
    "Condições de pagamento, agradecimentos, o que o cliente precisar de saber.",
  "invoiceTool.preview.yourNameFallback": "O teu nome",
  "invoiceTool.preview.docLabel": "Fatura-Recibo",
  "invoiceTool.preview.issued": "Emitida a {date}",
  "invoiceTool.preview.due": "Vencimento a {date}",
  "invoiceTool.preview.billedTo": "Faturado a",
  "invoiceTool.preview.nifLine": "NIF {nif}",
  "invoiceTool.preview.subtotal": "Subtotal",
  "invoiceTool.preview.ivaLabel": "IVA ({rate}%)",
  "invoiceTool.preview.total": "Total",
  "invoiceTool.preview.notesTitle": "Notas",

  // ── ScopeForm / ScopePreview / ScopeGeneratorPage ──────────────────────
  "scopeTool.title": "Define o <em>âmbito.</em>",
  "scopeTool.sub":
    "Um âmbito claro (e o que fica de fora) evita a maioria dos conflitos. Cria um e envia um PDF.",
  "scopeTool.projectLabel": "Projeto",
  "scopeTool.projectPlaceholder": "ex.: Renovação de marca e site",
  "scopeTool.clientLabel": "Nome do cliente",
  "scopeTool.clientPlaceholder": "Para quem é",
  "scopeTool.includedLegend": "O que está incluído",
  "scopeTool.includedHint": "As entregas a que te comprometes.",
  "scopeTool.includedPlaceholder": "Uma entrega",
  "scopeTool.includedAdd": "Adicionar entrega",
  "scopeTool.excludedLegend": "Não incluído",
  "scopeTool.excludedHint":
    "Nomear exclusões à partida evita a maioria dos conflitos.",
  "scopeTool.excludedPlaceholder": "Algo fora do âmbito",
  "scopeTool.excludedAdd": "Adicionar exclusão",
  "scopeTool.itemAriaLabel": "Item {index} de {legend}",
  "scopeTool.removeItemAriaLabel": "Remover item {index} de {legend}",
  "scopeTool.revisionsLabel": "Revisões",
  "scopeTool.revisionsPlaceholder": "ex.: 2 rondas por entrega",
  "scopeTool.milestonesLabel": "Marcos & condições",
  "scopeTool.milestonesPlaceholder":
    "Calendário de pagamentos, prazos, condições…",
  "scopeTool.priceLabel": "Preço (opcional)",
  "scopeTool.pricePlaceholder": "Deixa vazio para ser só o âmbito",
  "scopeTool.validUntilLabel": "Válido até",
  "scopeTool.preview.yourNameFallback": "O teu nome",
  "scopeTool.preview.quote": "Orçamento",
  "scopeTool.preview.scopeOfWork": "Âmbito de Trabalho",
  "scopeTool.preview.untitledProject": "Projeto sem título",
  "scopeTool.preview.forClient": "Para {client}",
  "scopeTool.preview.forYourClient": "Para o teu cliente",
  "scopeTool.preview.included": "O que está incluído",
  "scopeTool.preview.addDeliverable": "Adiciona pelo menos uma entrega.",
  "scopeTool.preview.notIncluded": "Não incluído",
  "scopeTool.preview.revisions": "Revisões",
  "scopeTool.preview.milestones": "Marcos & condições",
  "scopeTool.preview.total": "Total",
  "scopeTool.preview.validUntil": "Válido até {date}",
  "scopeTool.disclaimer":
    "Este documento é um âmbito de trabalho. Só um contrato assinado cria obrigações vinculativas. Tudo o que fique de fora de “O que está incluído” cai fora do âmbito e é orçamentado à parte.",
  "scopeTool.plainText.quote": "ORÇAMENTO",
  "scopeTool.plainText.scopeOfWork": "ÂMBITO DE TRABALHO",
  "scopeTool.plainText.from": "De: {name}",
  "scopeTool.plainText.for": "Para: {name}",
  "scopeTool.plainText.project": "Projeto: {name}",
  "scopeTool.plainText.included": "O que está incluído",
  "scopeTool.plainText.notIncluded": "Não incluído",
  "scopeTool.plainText.revisions": "Revisões: {value}",
  "scopeTool.plainText.terms": "Condições: {value}",
  "scopeTool.plainText.total": "Total: {value}",
  "scopeTool.plainText.validUntil": "Válido até: {date}",

  // ── ContractForm / ContractClauses / ContractPreview / ContractGeneratorPage ──
  // Scope note: CLAUSES/DOC_STRINGS in contract.data.ts are the CONTRACT
  // DOCUMENT's own output-language toggle (English/Português, chosen by the
  // member for the generated legal document) — orthogonal to the app's UI
  // language and already bilingual by design. Left untouched. Only the
  // surrounding app chrome (this section) follows the app locale.
  "contractTool.title": "Cria um <em>contrato.</em>",
  "contractTool.sub":
    "Um acordo de prestação de serviços claro, pronto em minutos. Preenche o trabalho, escolhe as cláusulas que te protegem e exporta um PDF real. Tudo no teu navegador.",
  "contractTool.docLanguageLegend": "Idioma do documento",
  "contractTool.docLanguageAriaLabel": "Idioma do documento",
  "contractTool.providerLegend": "Tu (o Prestador)",
  "contractTool.clientLegend": "O teu cliente",
  "contractTool.nameLabel": "Nome",
  "contractTool.nifLabel": "NIF / IVA",
  "contractTool.providerNamePlaceholder": "O teu nome ou estúdio",
  "contractTool.providerNifPlaceholder": "123 456 789",
  "contractTool.clientNamePlaceholder": "Nome do cliente ou empresa",
  "contractTool.clientNifPlaceholder": "987 654 321",
  "contractTool.projectTitleLabel": "Título do projeto",
  "contractTool.projectTitlePlaceholder":
    "ex.: Identidade de marca para a Casa Aurora",
  "contractTool.scopeLabel": "Âmbito de trabalho",
  "contractTool.scopePlaceholder":
    "O que vais entregar, e o que fica fora do âmbito.",
  "contractTool.feeLabel": "Honorários",
  "contractTool.feePlaceholder": "ex.: 2400 € + IVA",
  "contractTool.timelineLabel": "Prazos",
  "contractTool.timelinePlaceholder": "ex.: 6 semanas a partir da assinatura",
  "contractTool.paymentTermsLabel": "Condições de pagamento",
  "contractTool.paymentTermsPlaceholder":
    "ex.: 50% na assinatura, 50% na entrega",
  "contractTool.governingLawLabel": "Lei aplicável",
  "contractTool.governingLawPlaceholder": "Portugal",

  // ── ComparatorForm / ComparatorResult / ComparatorPage ─────────────────
  "comparator.title": "Freelancer ou <em>por conta de outrem?</em>",
  "comparator.sub":
    "Compara o que levarias para casa numa e noutra situação, com o mesmo rendimento bruto, e pesa os custos que não aparecem no recibo de vencimento.",
  "comparator.form.grossLabel": "Rendimento bruto anual (€)",
  "comparator.form.grossPlaceholder": "ex.: 30000",
  "comparator.form.activityLabel": "Tipo de atividade freelancer",
  "comparator.form.yearLabel": "Ano fiscal",
  "comparator.form.startupLabel": "Início de atividade",
  "comparator.activityOption.services": "Profissão liberal (0,75)",
  "comparator.activityOption.otherServices": "Outros serviços (0,35)",
  "comparator.activityOption.goods": "Venda de bens / hotelaria (0,15)",
  "comparator.activityOption.ipCapital":
    "Propriedade intelectual / capital (0,95)",
  "comparator.startupOption.none": "Fora dos primeiros 2 anos",
  "comparator.startupOption.year1": "Primeiro ano (coeficiente ×0,5)",
  "comparator.startupOption.year2": "Segundo ano (coeficiente ×0,75)",
  "comparator.result.freelanceLabel": "Freelancer",
  "comparator.result.salariedLabel": "Por conta de outrem",
  "comparator.result.perMonth": "/ mês",
  "comparator.result.segurancaSocial": "− Segurança Social",
  "comparator.result.irs": "− IRS",
  "comparator.result.effectiveRate": "Taxa efetiva",
  "comparator.result.bottomLine": "A conclusão",
  "comparator.result.summaryMore":
    "Como freelancer ficarias com <em>mais {amount}</em> por ano",
  "comparator.result.summaryLess":
    "Como freelancer ficarias com <em>menos {amount}</em> por ano",
  "comparator.result.subMore":
    "com {gross} brutos, cerca de {monthly} a mais por mês no teu bolso, antes dos custos abaixo.",
  "comparator.result.subLess":
    "com {gross} brutos, cerca de {monthly} a menos por mês, antes dos custos abaixo.",
  "comparator.result.costsTitle":
    "O que o <em>recibo de vencimento</em> não mostra",
  "comparator.hiddenCost.noHoliday":
    "Sem férias pagas. Tu financias o teu próprio tempo livre.",
  "comparator.hiddenCost.noSubsidio":
    "Sem subsídio de férias nem de Natal (os dois meses extra de quem é assalariado).",
  "comparator.hiddenCost.noSickLeave":
    "Sem baixa por doença paga nem cobertura de desemprego garantida.",
  "comparator.hiddenCost.ownSS":
    "Pagas a tua própria Segurança Social, trimestralmente.",
  "comparator.hiddenCost.lumpyIncome":
    "O rendimento é irregular, meses de fartura e meses de vacas magras.",
  "comparator.hiddenCost.upside":
    "Mas: despesas dedutíveis, autonomia, e podes cobrar mais.",

  // ── RateBoardForm / RateBoardStats / RateBoardPage ─────────────────────
  "rateBoard.title": "O que <em>cobras</em> mesmo.",
  "rateBoard.sub":
    "Um quadro de tarifas privado que vive neste dispositivo. Adiciona as tuas tarifas, vê a distribuição a crescer e exporta o ficheiro quando quiseres comparar com pessoas em quem confias.",
  "rateBoard.form.title": "Adiciona a tua tarifa",
  "rateBoard.form.hint":
    "Sem nome, sem email. Só os números. Fica neste dispositivo até exportares.",
  "rateBoard.form.roleLabel": "Função",
  "rateBoard.form.experienceLabel": "Experiência",
  "rateBoard.form.dayRateLabel": "Tarifa diária (€)",
  "rateBoard.form.dayRatePlaceholder": "ex.: 350",
  "rateBoard.form.typeLabel": "Tipo",
  "rateBoard.form.addCta": "Adicionar ao quadro",
  "rateBoard.form.compareLabel": "Vê onde te situas",
  "rateBoard.form.comparePlaceholder": "A tua tarifa diária (€)",
  "rateBoard.form.compareHint":
    "Mostramos o teu percentil face às tarifas deste quadro. Nada é adicionado ao quadro.",
  "rateBoard.form.addedToast": "Adicionado ao teu quadro",
  "rateBoard.experienceOption.junior": "Júnior (0–2 anos)",
  "rateBoard.experienceOption.mid": "Intermédio (3–5 anos)",
  "rateBoard.experienceOption.senior": "Sénior (6–9 anos)",
  "rateBoard.experienceOption.lead": "Lead (10+ anos)",
  "rateBoard.typeOption.freelance": "Freelancer",
  "rateBoard.typeOption.employed": "Por conta de outrem (equivalente diário)",
  "rateBoard.roleOption.designer": "Design",
  "rateBoard.roleOption.softwareEngineer": "Engenharia de software",
  "rateBoard.roleOption.writer": "Escrita",
  "rateBoard.roleOption.photographer": "Fotografia",
  "rateBoard.roleOption.consultant": "Consultoria",
  "rateBoard.roleOption.other": "Outro",
  "rateBoard.stats.emptyTitle": "Ainda nada <em>aqui.</em>",
  "rateBoard.stats.emptyBody":
    "Adiciona a tua primeira tarifa, ou importa um ficheiro JSON que alguém te tenha partilhado. A distribuição aparece aqui assim que este dispositivo tiver dados.",
  "rateBoard.stats.communityMedian": "Tarifa diária mediana neste quadro",
  "rateBoard.stats.across": "em",
  "rateBoard.stats.rateCount_one": "{count} tarifa",
  "rateBoard.stats.rateCount_other": "{count} tarifas",
  "rateBoard.stats.roleCount_one": "{count} função",
  "rateBoard.stats.roleCount_other": "{count} funções",
  "rateBoard.stats.yourRateSits": "A tua tarifa de {rate} situa-se no",
  "rateBoard.stats.percentileValue": "percentil {percentile}",
  "rateBoard.stats.aboveMost": "Acima de {percent}% das tarifas deste quadro.",
  "rateBoard.stats.belowMost":
    "Abaixo da maioria das tarifas deste quadro. Podes estar a deixar dinheiro em cima da mesa.",
  "rateBoard.disclaimer":
    "Tudo o que está aqui foi escrito por ti e pelas pessoas que te enviaram um ficheiro: valores autodeclarados e não verificados. Cada situação é diferente, por isso trata estes números como um ponto de partida para a conversa. Guardado apenas neste dispositivo e nunca enviado para lado nenhum.",
  "rateBoard.export": "Exportar JSON",
  "rateBoard.import": "Importar JSON",
  "rateBoard.importAriaLabel": "Importar um ficheiro JSON do quadro de tarifas",
  "rateBoard.exportedToast": "Exportado",
  "rateBoard.invalidFileToast":
    "Esse ficheiro não é um quadro de tarifas, esperava-se um array JSON.",
  "rateBoard.noValidEntriesToast":
    "Não foram encontradas entradas válidas nesse ficheiro.",
  "rateBoard.importedToast_one": "{count} entrada importada",
  "rateBoard.importedToast_other": "{count} entradas importadas",
  "rateBoard.readErrorToast":
    "Não foi possível ler esse ficheiro. É JSON válido?",
  "rateBoard.readErrorGenericToast": "Não foi possível ler esse ficheiro.",

  // ── SetAsideForm / SetAsideResult / SetAsidePlannerPage ────────────────
  "setAside.title": "Poupa para o <em>imposto.</em>",
  "setAside.sub":
    "Calcula quanto de cada fatura poupar agora, para as contas do IRS e da Segurança Social não doerem depois.",
  "setAside.yourYearLegend": "O teu ano",
  "setAside.grossLabel": "Bruto anual esperado",
  "setAside.grossPlaceholder": "30000",
  "setAside.grossHint":
    "Tudo o que esperas faturar este ano, antes de impostos.",
  "setAside.activityLabel": "Atividade",
  "setAside.yearLabel": "Ano fiscal",
  "setAside.activityOption.services":
    "Serviços (profissões liberais, art. 151.º)",
  "setAside.activityOption.otherServices":
    "Outros serviços (fora do conjunto de 0,75)",
  "setAside.activityOption.goods": "Venda de bens / hotelaria",
  "setAside.logInvoiceLegend": "Registar uma fatura",
  "setAside.logInvoiceHint":
    "Adiciona cada pagamento à medida que chega. Totalizamos o que devias ter poupado.",
  "setAside.amountLabel": "Valor recebido",
  "setAside.amountPlaceholder": "1200",
  "setAside.dateLabel": "Data",
  "setAside.addCta": "Adicionar à poupança",
  "setAside.removeAriaLabel": "Remover fatura de {amount}",
  "setAside.result.parkKicker": "Por cada fatura, poupa",
  "setAside.result.title":
    "Poupa <em>{percent}%</em> de cada euro que faturas.",
  "setAside.result.body":
    "No teu valor esperado de {gross}, isso são cerca de {monthly} por mês que guardas para o IRS e a Segurança Social, e não gastas.",
  "setAside.result.parkPerMonth": "Poupar por mês",
  "setAside.result.parkThisYear": "Poupar este ano",
  "setAside.result.potLabel": "A tua poupança para impostos",
  "setAside.result.potCount_one": "{count} fatura registada",
  "setAside.result.potCount_other": "{count} faturas registadas",
  "setAside.result.potEmpty":
    "Regista a tua primeira fatura para começares a poupança.",
  "setAside.result.potSub":
    "{percent}% dos {logged} que já registaste. Mantém este valor intocado.",

  // ── TakeHomeForm / TakeHomeResult / TakeHomeCalculatorPage ─────────────
  "takeHome.title": "O que realmente <em>levas para casa.</em>",
  "takeHome.sub":
    "Indica o teu bruto anual e estimamos o que sobra depois do IRS e da Segurança Social no regime simplificado, recalculado em tempo real.",
  "takeHome.grossLabel": "Rendimento bruto anual (€)",
  "takeHome.grossPlaceholder": "ex.: 30000",
  "takeHome.activityLabel": "Tipo de atividade",
  "takeHome.statusLabel": "Situação profissional",
  "takeHome.yearLabel": "Ano fiscal",
  "takeHome.startupLabel": "Início de atividade",
  "takeHome.activityOption.services": "Profissão liberal (0,75)",
  "takeHome.activityOption.otherServices": "Outros serviços (0,35)",
  "takeHome.activityOption.goods": "Venda de bens / hotelaria (0,15)",
  "takeHome.activityOption.ipCapital":
    "Propriedade intelectual / capital (0,95)",
  "takeHome.startupOption.none": "Fora dos primeiros 2 anos",
  "takeHome.startupOption.year1": "Ano 1 (coeficiente ×0,5)",
  "takeHome.startupOption.year2": "Ano 2 (coeficiente ×0,75)",
  "takeHome.statusOption.freelancer": "Freelancer (21,4% SS)",
  "takeHome.statusOption.eni": "ENI, empresário em nome individual (25,2% SS)",
  "takeHome.result.netLabel": "Levas para casa, após IRS & Segurança Social",
  "takeHome.result.perMonth": "por mês",
  "takeHome.result.keepCaption":
    "Ficas com <em>{percent}%</em> de cada euro que faturas. Taxa efetiva IRS + SS: {rate}%.",
  "takeHome.result.barAriaLabel":
    "Ficas com {percent}% do teu rendimento bruto",
  "takeHome.result.annualGross": "Bruto anual",
  "takeHome.result.segurancaSocial": "− Segurança Social",
  "takeHome.result.taxableIncome": "Rendimento tributável",
  "takeHome.result.irs": "− IRS",
  "takeHome.result.netTakeHome": "Líquido final",

  // ── DayRateCalculatorPage / DayRateResult ──────────────────────────────
  "dayRate.title": "Calcula o teu <em>dia.</em>",
  "dayRate.sub":
    "Parte do rendimento que precisas para chegar a uma tarifa diária (e horária) que realmente te sustente, com despesas gerais, dias não pagos e IVA incluídos.",
  "dayRate.annualLabel": "Rendimento anual pretendido (€)",
  "dayRate.daysLabel": "Dias faturáveis por ano",
  "dayRate.overheadLabel": "Despesas gerais (% do rendimento)",
  "dayRate.hoursLabel": "Horas por dia faturável",
  "dayRate.ivaLabel": "Taxa de IVA",
  "dayRate.result.heading": "A tua tarifa diária",
  "dayRate.result.minLabel": "Tarifa diária mínima (sem IVA)",
  "dayRate.result.withIvaLabel": "Com IVA",
  "dayRate.result.hourlyLabel": "Por hora (sem IVA)",
  "dayRate.result.note": "Um ponto de partida, ajusta ao teu setor e mercado.",

  // ── SlidingScaleForm / SlidingScalePreview / SlidingScalePage ──────────
  "slidingScale.title": "Cobra com <em>solidariedade.</em>",
  "slidingScale.sub":
    "Publica uma escala variável para que cada pessoa pague o que couber nos seus meios, e continues a receber de forma justa. Exporta um cartão para partilhar.",
  "slidingScale.yourNameLabel": "O teu nome",
  "slidingScale.yourNamePlaceholder": "O nome que as pessoas vão ver",
  "slidingScale.serviceLabel": "Serviço / oferta",
  "slidingScale.servicePlaceholder": "ex.: Sessão de coaching individual",
  "slidingScale.introLabel": "Linha de introdução",
  "slidingScale.introPlaceholder": "Uma frase calorosa que enquadra a escala.",
  "slidingScale.tierLegend": "Nível {index}",
  "slidingScale.tierNameLabel": "Nome do nível",
  "slidingScale.tierNamePlaceholder": "ex.: Apoio",
  "slidingScale.tierPriceLabel": "Preço",
  "slidingScale.tierPricePlaceholder": "ex.: 60 €",
  "slidingScale.tierForWhomLabel": "Para quem é",
  "slidingScale.tierForWhomPlaceholder":
    "A orientação honesta que ajuda as pessoas a autosselecionar-se.",
  "slidingScale.preview.kind": "Escala variável",
  "slidingScale.preview.yourNameFallback": "O teu nome",
  "slidingScale.preview.offeringFallback": "A tua oferta",
  "slidingScale.preview.tierFallback": "Nível",
  "slidingScale.preview.priceFallback": "Por definir",
  "slidingScale.preview.outro":
    "Paga o nível que for honesto para ti. Escolher um valor mais alto mantém este trabalho acessível a todas as pessoas.",
  "slidingScale.disclaimer":
    "Estes níveis são o preço definido por esta pessoa profissional, uma escala variável oferecida de boa fé. Os valores variam de profissional para profissional, e ninguém te pede prova de rendimentos.",

  // ── ReciboVerdeGuidePage (page chrome only — see report re: GUIDE_SECTIONS) ──
  // Scope note: the guide's own section titles/bodies (reciboVerdeGuide.data.tsx
  // GUIDE_SECTIONS) are dense, article-citing pt-PT tax/legal explanations —
  // flagged and deliberately left English rather than risk a subtly wrong tax
  // instruction. Only this page's surrounding chrome is translated.
  "reciboGuide.heroTitle": "O guia dos <em>recibos verdes.</em>",
  "reciboGuide.heroLead":
    "Tornares-te freelancer em Portugal não devia significar afogares-te em jargão. Aqui tens todo o sistema de recibos verdes em linguagem simples e próxima, como te registares, o que vais dever, e o punhado de datas que realmente importam. Lê uma secção de cada vez.",
  "reciboGuide.ctaTitle": "Vamos <em>enviar uma?</em>",
  "reciboGuide.ctaText":
    "A ferramenta de faturação transforma tudo o que leste numa fatura-recibo pronta, com os coeficientes certos, as notas certas e as contas certas.",
  "reciboGuide.makeInvoiceCta": "Cria uma fatura",
  "reciboGuide.backToEconomy": "Voltar à Economia",
  "reciboGuide.disclaimerTitle": "Não é <em>aconselhamento fiscal.</em>",

  // ── HousingCoopPage (+ Sections) ────────────────────────────────────────
  // Scope note: housingCoop.data.ts's FORMING_COOPS (specific co-ops, member
  // counts, financials) is a directory of real-world entries — in live mode
  // this would be fetched. Left in English, same as the grants directory.
  // COOP_STATS/COOP_PHASES/COOP_TEMPLATES/COOP_RESOURCES are platform-authored
  // programme content (same shape as `incubator.step.*`, which IS translated)
  // and are now swept below.
  "housingCoop.backLabel": "Habitação",
  "housingCoop.hero.eyebrow":
    "Formação de cooperativas de habitação · começa em Portugal, expansível",
  "housingCoop.hero.title": "Cria uma cooperativa <em>em conjunto</em>.",
  "housingCoop.hero.sub":
    "Um kit de ferramentas para formar uma cooperativa de habitação queer em Portugal, desde encontrar as pessoas, até à constituição legal, ao financiamento, ao imóvel, à governação do dia a dia. <em>Cinco fases, modelos reais, pessoas já em cada uma delas.</em>",
  "housingCoop.hero.statsHead": "Cooperativas a formar-se agora",
  "housingCoop.phases.title": "Cinco <em>fases</em> da ideia às chaves",
  "housingCoop.phases.sub":
    "Calendário realista: 14–28 meses. Cada fase tem modelos, exemplos reais de cooperativas já existentes, e uma pessoa mentora para recorreres quando precisares.",
  "housingCoop.grid.title": "Cooperativas a <em>formar-se agora</em>",
  "housingCoop.grid.seeAll": "Ver as 8",
  "housingCoop.templates.title": "Modelos & <em>ferramentas</em>",
  "housingCoop.templates.sub":
    "Todos os documentos que gostávamos que nos tivessem dado. Preparados com a equipa jurídica da QueerPulse, traduzidos PT & EN, testados nos primeiros dois anos da Casa Sambizanga.",
  "housingCoop.templates.read": "Ler",
  "housingCoop.startCta.eyebrow": "Começa uma cooperativa",
  "housingCoop.startCta.title": "Ainda não tens <em>o teu grupo</em>?",
  "housingCoop.startCta.body":
    "Publica que estás a começar e ligamos-te a outras pessoas na tua cidade à procura da mesma coisa. A maioria das cooperativas começa com 2–3 pessoas e cresce para 6+ nos primeiros 6 meses. <em>A Casa Sambizanga começou com três.</em>",
  "housingCoop.startCta.postCta": "Publica que estás a começar",
  "housingCoop.startCta.storyCta": "Lê a história da Casa Sambizanga",
  "housingCoop.startCta.resourcesHead": "Recursos & pessoas mentoras",

  // ── Estado vazio de "a formar-se agora" (CoopEmptyState) ────────────────
  "housingCoop.empty.title": "Ainda nenhuma cooperativa",
  "housingCoop.empty.titleEm": "a formar-se",
  "housingCoop.empty.body":
    "É aqui que vais encontrar grupos a organizar habitação em conjunto. Publica que estás a começar e vamos ajudar-te a encontrar o teu grupo.",
  "housingCoop.empty.cta": "Publica que estás a começar",

  // ── CoopTemplatePage (documentos-modelo de formação) ────────────────────
  "coopTemplate.back": "Voltar às cooperativas de habitação",
  "coopTemplate.disclaimer":
    "Este é um modelo de partida. Adapta-o com o teu grupo e, sempre que for juridicamente relevante, com um advogado ou notário.",

  // ── CoopTemplatePage: prosa dos documentos-modelo de formação ───────────
  // pt-PT co-op template — DRAFT machine translation, requires professional
  // legal review before launch. This is legal/governance prose translated as a
  // first draft; it is NOT legally verified. Do not treat any figure or clause
  // as advice. Keys are at EN/pt parity (see catalog parity test) and mirror the
  // document shape in src/features/economy/coopTemplateContent.data.tsx.
  // founding-values
  "coopTemplate.doc.founding-values.tag": "Fase 1 · modelo",
  "coopTemplate.doc.founding-values.title": "Carta de valores",
  "coopTemplate.doc.founding-values.titleEm": "fundadores",
  "coopTemplate.doc.founding-values.intro":
    "A vossa carta de valores fundadores é a primeira coisa que o grupo escreve em conjunto, antes de um pedido de crédito, antes de um contrato de arrendamento, antes de alguém assinar seja o que for com um banco ou um notário. Põe por palavras o que estão a construir e para quem, para que daqui a seis meses, quando o dinheiro apertar ou uma decisão for difícil, tenham algo a que voltar em conjunto. Trata tudo o que se segue como um primeiro rascunho: lê-o em voz alta em grupo, risca o que não encaixa, e reescreve-o pelas tuas próprias palavras até soar a vocês.",
  "coopTemplate.doc.founding-values.s0.h":
    "Porque estamos a formar esta cooperativa",
  "coopTemplate.doc.founding-values.s0.b0":
    "Começa com uma ou duas frases que digam, com clareza, para que serve esta cooperativa. Não uma declaração de missão para quem está de fora, uma resposta privada para quem vai assinar os títulos de capital. Do que se estão a proteger uns aos outros, e o que estão a construir?",
  "coopTemplate.doc.founding-values.s0.b1.0":
    "Estamos a formar esta cooperativa para que ninguém tenha de escolher entre continuar no armário e ter casa.",
  "coopTemplate.doc.founding-values.s0.b1.1":
    "Queremos uma casa onde o envelhecimento, a deficiência e as necessidades de cuidados sejam planeados, e não descobertos tarde demais.",
  "coopTemplate.doc.founding-values.s0.b1.2":
    "Estamos a juntar o que temos para que quem, sozinho, seria expulso pelos preços possa continuar na cidade a que chama casa.",
  "coopTemplate.doc.founding-values.s1.h":
    "Quem somos, e para quem é esta casa",
  "coopTemplate.doc.founding-values.s1.b0":
    "Diz explicitamente quem pertence aqui e em que termos. O silêncio sobre este ponto tende a favorecer quem já tem poder na sala, por isso, põe-no por escrito.",
  "coopTemplate.doc.founding-values.s1.b1.0":
    "Esta é uma casa que afirma as pessoas queer e trans. Usamos os nomes e pronomes que as pessoas nos pedem para usar, sem discussão, desde o primeiro dia.",
  "coopTemplate.doc.founding-values.s1.b1.1":
    "Comprometemo-nos a trabalhar ativamente contra o racismo, a transfobia, o capacitismo e o classismo em quem admitimos, na forma como falamos uns com os outros, e em quem tem prioridade nas reparações e no orçamento.",
  "coopTemplate.doc.founding-values.s1.b1.2":
    "Vamos tornar os nossos espaços físicos e os nossos processos de decisão tão acessíveis quanto formos capazes, e vamos continuar a melhorá-los à medida que as necessidades dos nossos membros mudam.",
  "coopTemplate.doc.founding-values.s1.b1.3":
    "Os novos membros entram através de [descreve aqui o vosso processo, um período experimental, um sistema de recomendação, uma votação de todo o grupo].",
  "coopTemplate.doc.founding-values.s2.h": "Como decidimos em conjunto",
  "coopTemplate.doc.founding-values.s2.b0":
    "Escolhe um método antes de precisares de um sob pressão. Muitas cooperativas começam pelo consenso e acrescentam uma alternativa para quando o consenso emperra.",
  "coopTemplate.doc.founding-values.s2.b1.0":
    "As decisões do dia a dia (pequenas reparações, política de visitas, o calendário partilhado) são tomadas por quem é afetado, informando o grupo depois.",
  "coopTemplate.doc.founding-values.s2.b1.1":
    "As decisões ao nível da casa (alterações ao orçamento, novos membros, regras da casa) vão à assembleia plena, com um quórum definido.",
  "coopTemplate.doc.founding-values.s2.b1.2":
    "Quando não se chega a consenso depois de um esforço genuíno, recorremos a [uma maioria qualificada, um período de reflexão e nova votação, uma pessoa facilitadora externa]. Decide isto agora, enquanto ainda é hipotético.",
  "coopTemplate.doc.founding-values.s3.h": "Como cuidamos uns dos outros",
  "coopTemplate.doc.founding-values.s3.b0":
    "Os compromissos de segurança e de cuidado pertencem aqui, dentro do documento que o grupo lê mesmo.",
  "coopTemplate.doc.founding-values.s3.b1.0":
    "Verificamos como está cada pessoa, sobretudo os membros que atravessam um momento difícil, sem que isso seja tarefa de uma só pessoa.",
  "coopTemplate.doc.founding-values.s3.b1.1":
    "Temos um plano para o que acontece se um membro estiver em perigo em casa, por parte de um parceiro, um familiar, ou qualquer outra pessoa, e esse plano não depende de esse membro pedir ajuda de forma perfeita.",
  "coopTemplate.doc.founding-values.s3.b1.2":
    "Nunca revelamos a orientação ou identidade de ninguém, a familiares, senhorios, empregadores ou aos contactos de cada um, nunca, por motivo algum.",
  "coopTemplate.doc.founding-values.s4.h": "Dinheiro e justiça",
  "coopTemplate.doc.founding-values.s4.b0":
    "Diz com clareza o que significa justiça para o vosso grupo antes de o modelo financeiro (ver o Modelo financeiro explicado) o transformar em números.",
  "coopTemplate.doc.founding-values.s4.b1.0":
    "As contribuições são ajustadas ao que cada pessoa consegue realmente pagar, e não divididas de forma idêntica por defeito.",
  "coopTemplate.doc.founding-values.s4.b1.1":
    "Ninguém perde a sua casa por causa de dinheiro sem que o grupo tente primeiro, em conjunto, todas as alternativas (ver o Acordo de honestidade financeira e o Processo de resolução de conflitos).",
  "coopTemplate.doc.founding-values.s4.b1.2":
    "A informação financeira da cooperativa está sempre disponível a todos os membros. Aqui não há contas fechadas.",
  "coopTemplate.doc.founding-values.s5.h": "Rever estes valores",
  "coopTemplate.doc.founding-values.s5.b0":
    "Os valores desviam-se se ninguém os voltar a ler. Marca uma data concreta no calendário.",
  "coopTemplate.doc.founding-values.s5.b1.0":
    "Voltamos a ler esta carta em conjunto pelo menos uma vez por ano, e depois de qualquer acontecimento importante que a tenha posto à prova.",
  "coopTemplate.doc.founding-values.s5.b1.1":
    "As alterações precisam de [uma maioria qualificada / consenso total, decidam qual] e só produzem efeito depois de todos os membros terem visto a redação proposta.",
  "coopTemplate.doc.founding-values.s5.b2":
    "Esta carta é um modelo de partida. A versão que conta é aquela em que o vosso grupo desagua depois de discutir, e que revê todos os anos.",
  // financial-honesty
  "coopTemplate.doc.financial-honesty.tag": "Fase 1 · modelo",
  "coopTemplate.doc.financial-honesty.title": "Acordo de honestidade",
  "coopTemplate.doc.financial-honesty.titleEm": "financeira",
  "coopTemplate.doc.financial-honesty.intro":
    "As cooperativas de habitação falham mais vezes por problemas de dinheiro não ditos do que por qualquer questão jurídica. Este acordo existe para que quem esteja com dificuldades o diga logo na segunda semana, enquanto o problema ainda é pequeno, e para que ninguém tenha de adivinhar quanto as outras pessoas ganham, devem ou receiam. Adapta os pormenores ao vosso grupo; mantém o princípio de que toda a gente vê os mesmos números.",
  "coopTemplate.doc.financial-honesty.s0.h":
    "O que significa aqui total transparência",
  "coopTemplate.doc.financial-honesty.s0.b0":
    "Transparência financeira não significa que todos revelam a totalidade das suas finanças pessoais. Significa que todos veem os mesmos números sobre a cooperativa, e que o grupo acorda antecipadamente que informação individual é partilhada, e porquê.",
  "coopTemplate.doc.financial-honesty.s0.b1.0":
    "Cada membro pode consultar o livro de contas partilhado da cooperativa a qualquer momento, em qualquer altura do ano.",
  "coopTemplate.doc.financial-honesty.s0.b1.1":
    "Os valores das contribuições individuais (se ajustados ao rendimento) são visíveis para o grupo, mas os recibos de vencimento ou as declarações de IRS que lhes dão origem não o são, a menos que um membro opte por partilhá-los.",
  "coopTemplate.doc.financial-honesty.s0.b1.2":
    "Não existem acordos paralelos sobre dinheiro fora deste documento e do livro de contas partilhado.",
  "coopTemplate.doc.financial-honesty.s1.h":
    "O que cada membro revela, e quando",
  "coopTemplate.doc.financial-honesty.s1.b0":
    "Sê específico quanto ao que é pedido na entrada face ao que é contínuo.",
  "coopTemplate.doc.financial-honesty.s1.b1.0":
    "Na entrada: se consegues cobrir o valor total do título de capital, em que calendário, e qualquer apoio que tragas para o fundo de solidariedade do grupo ou de que precises dele.",
  "coopTemplate.doc.financial-honesty.s1.b1.1":
    "De forma contínua: qualquer mudança que afete a tua capacidade de pagar, perda de emprego, doença, alteração de horário, comunicada a [uma pessoa responsável pelas finanças / todo o grupo] assim que souberes, bem antes de falhares um pagamento.",
  "coopTemplate.doc.financial-honesty.s1.b1.2":
    "Anualmente: uma revisão conjunta para verificar se as contribuições ainda refletem as circunstâncias reais das pessoas.",
  "coopTemplate.doc.financial-honesty.s2.h": "O livro de contas partilhado",
  "coopTemplate.doc.financial-honesty.s2.b0":
    "Nomeia a ferramenta e a regra de acesso concretas.",
  "coopTemplate.doc.financial-honesty.s2.b1.0":
    "O livro de contas vive em [uma folha de cálculo partilhada, um programa de contabilidade] que qualquer membro pode abrir, ler e exportar a qualquer momento.",
  "coopTemplate.doc.financial-honesty.s2.b1.1":
    "Uma ou duas pessoas funcionam como responsáveis pelas finanças, com rotação a cada [ano], encarregues de manter os registos atualizados e abertos a todo o grupo.",
  "coopTemplate.doc.financial-honesty.s2.b1.2":
    "Cada pagamento, de entrada ou de saída, é registado no prazo de [uma semana], com uma nota em linguagem simples. Nenhuma rubrica que ninguém saiba explicar.",
  "coopTemplate.doc.financial-honesty.s3.h":
    "Lidar com atrasos de pagamento com dignidade",
  "coopTemplate.doc.financial-honesty.s3.b0":
    "Escreve este processo antes de alguém estar realmente em atraso. É muito mais difícil chegar a acordo quando já é pessoal.",
  "coopTemplate.doc.financial-honesty.s3.b1.0":
    "Um pagamento em falta dá origem a uma conversa privada e não punitiva no prazo de duas semanas, entre as pessoas diretamente envolvidas.",
  "coopTemplate.doc.financial-honesty.s3.b1.1":
    "A pessoa e quem é responsável pelas finanças acordam em conjunto um plano de pagamento; ao grupo diz-se apenas que existe um plano, e os pormenores pessoais ficam com essa pessoa, a menos que os queira partilhar.",
  "coopTemplate.doc.financial-honesty.s3.b1.2":
    "O fundo de solidariedade (abaixo) é oferecido antes de qualquer conversa sobre a saída de um membro.",
  "coopTemplate.doc.financial-honesty.s4.h":
    "Fundo de solidariedade e de emergência",
  "coopTemplate.doc.financial-honesty.s4.b0":
    "Um fundo concreto é o que faz com que o «cuidamos uns dos outros» sobreviva a uma emergência real.",
  "coopTemplate.doc.financial-honesty.s4.b1.0":
    "Cada membro contribui, a título de exemplo ilustrativo, com 10–20 € por mês para um fundo de emergência partilhado, separado dos custos de funcionamento.",
  "coopTemplate.doc.financial-honesty.s4.b1.1":
    "O fundo pode cobrir a falta de um membro, a título de exemplo ilustrativo, até três meses enquanto se prepara um plano de prazo mais longo.",
  "coopTemplate.doc.financial-honesty.s4.b1.2":
    "Os pedidos são aprovados por [as pessoas responsáveis pelas finanças / maioria simples] no prazo de uma semana, sem obrigação de justificar a dificuldade em pormenor.",
  "coopTemplate.doc.financial-honesty.s5.h": "Revisão anual",
  "coopTemplate.doc.financial-honesty.s5.b0":
    "Marca uma data fixa para que isto seja revisto no prazo previsto, em calma e fora de qualquer crise.",
  "coopTemplate.doc.financial-honesty.s5.b1.0":
    "Uma vez por ano, o grupo revê: se as contribuições ainda correspondem às circunstâncias, se o fundo de emergência está devidamente dotado, e se alguém tem preocupações de dinheiro por dizer.",
  "coopTemplate.doc.financial-honesty.s5.b2":
    "Este acordo é um ponto de partida. Adapta os valores, os prazos e os papéis aos números reais do vosso grupo, e revê-o todos os anos.",
  // crl-statutes
  "coopTemplate.doc.crl-statutes.tag": "Fase 2 · jurídico",
  "coopTemplate.doc.crl-statutes.title": "Estatutos-modelo",
  "coopTemplate.doc.crl-statutes.titleEm": "CRL",
  "coopTemplate.doc.crl-statutes.intro":
    "A Cooperativa de Responsabilidade Limitada (CRL) é a forma jurídica sob a qual a maioria das cooperativas de habitação da QueerPulse se regista em Portugal. O que se segue é um modelo, em linguagem simples, das secções de que os teus estatutos precisam, não é o texto jurídico em si, nem constitui aconselhamento jurídico. Leva este esboço, e a tua carta de valores fundadores, a um advogado ou notário com experiência em direito cooperativo antes de redigires ou registares seja o que for.",
  "coopTemplate.doc.crl-statutes.s0.h": "Nome e sede (sede social)",
  "coopTemplate.doc.crl-statutes.s0.b0":
    "Os teus estatutos abrem com o nome da cooperativa e a sua morada registada (sede social), habitualmente o próprio imóvel ou a morada de um membro até à escritura do imóvel.",
  "coopTemplate.doc.crl-statutes.s0.b1.0":
    "Denominação legal, incluindo a designação obrigatória «Cooperativa de Responsabilidade Limitada» ou «CRL».",
  "coopTemplate.doc.crl-statutes.s0.b1.1": "Sede: município e morada completa.",
  "coopTemplate.doc.crl-statutes.s0.b1.2":
    "Duração: a maioria das cooperativas regista-se por tempo indeterminado.",
  "coopTemplate.doc.crl-statutes.s1.h": "Objeto e âmbito (objeto)",
  "coopTemplate.doc.crl-statutes.s1.b0":
    "Esta cláusula define o que a cooperativa efetivamente faz. Mantém-na específica para a habitação, mas suficientemente ampla para abranger atividades relacionadas.",
  "coopTemplate.doc.crl-statutes.s1.b1.0":
    "Objeto principal: adquirir, desenvolver e gerir habitação para os seus membros numa base não especulativa e de cobertura de custos.",
  "coopTemplate.doc.crl-statutes.s1.b1.1":
    "Atividades secundárias que podes querer abranger: espaços comuns partilhados, bancos de ferramentas, pequena programação comunitária.",
  "coopTemplate.doc.crl-statutes.s1.b1.2":
    "Uma cláusula que exclua a revenda de frações com fins lucrativos, mantendo a habitação da cooperativa fora do mercado especulativo.",
  "coopTemplate.doc.crl-statutes.s2.h": "Adesão: admissão e saída",
  "coopTemplate.doc.crl-statutes.s2.b0":
    "A lei cooperativa exige, em princípio, uma adesão aberta e não discriminatória, permitindo ainda assim que definas critérios de admissão justos e alinhados com os vossos valores.",
  "coopTemplate.doc.crl-statutes.s2.b1.0":
    "Critérios e processo de admissão, por exemplo, um período experimental, uma entrevista, uma votação da assembleia.",
  "coopTemplate.doc.crl-statutes.s2.b1.1":
    "Condições para a saída voluntária, e o pré-aviso exigido (habitualmente de três a seis meses).",
  "coopTemplate.doc.crl-statutes.s2.b1.2":
    "Fundamentos e processo para a saída involuntária, remete para o teu Processo de resolução de conflitos, para que isto não seja decidido caso a caso sem regra.",
  "coopTemplate.doc.crl-statutes.s3.h": "Direitos e deveres dos membros",
  "coopTemplate.doc.crl-statutes.s3.b0.0":
    "Direito a participar e votar na assembleia geral, um membro, um voto, independentemente da dimensão do título de capital. Este é um princípio cooperativo fundamental, e vale sempre.",
  "coopTemplate.doc.crl-statutes.s3.b0.1":
    "Direito a informação financeira completa sobre a cooperativa (remete para o teu Acordo de honestidade financeira).",
  "coopTemplate.doc.crl-statutes.s3.b0.2":
    "Dever de pagar o capital social e as contribuições contínuas conforme acordado.",
  "coopTemplate.doc.crl-statutes.s3.b0.3":
    "Dever de participar na governação até um mínimo acordado, comparecer às assembleias, servir por rotação.",
  "coopTemplate.doc.crl-statutes.s4.h": "Capital e títulos (capital social)",
  "coopTemplate.doc.crl-statutes.s4.b0":
    "A lei cooperativa portuguesa fixa valores mínimos dos títulos de capital e regras para a admissão e o reembolso dos membros, um advogado confirma os valores atuais. Os estatutos precisam de indicar:",
  "coopTemplate.doc.crl-statutes.s4.b1.0":
    "O valor nominal de um título de capital, e quantos cada membro tem de deter.",
  "coopTemplate.doc.crl-statutes.s4.b1.1":
    "Como se pagam os títulos: na totalidade na admissão, ou em prestações (ver o teu Acordo de quota do sócio).",
  "coopTemplate.doc.crl-statutes.s4.b1.2":
    "Como se valorizam e reembolsam os títulos à saída, e em que prazo, para que a cooperativa não seja obrigada a reembolsar de uma só vez de forma a pôr em risco as suas finanças.",
  "coopTemplate.doc.crl-statutes.s5.h": "Órgãos de governação",
  "coopTemplate.doc.crl-statutes.s5.b0":
    "As CRL portuguesas estruturam-se habitualmente em torno de três órgãos. Os teus estatutos atribuem poderes específicos a cada um:",
  "coopTemplate.doc.crl-statutes.s5.b1.0":
    "Assembleia geral: a totalidade dos membros, e a autoridade máxima. Aprova o orçamento, admite e exclui membros, altera os estatutos.",
  "coopTemplate.doc.crl-statutes.s5.b1.1":
    "Direção: um pequeno grupo eleito que trata da administração corrente entre assembleias.",
  "coopTemplate.doc.crl-statutes.s5.b1.2":
    "Conselho fiscal: um órgão independente que analisa as contas e presta contas à assembleia, mantido separado da direção, para que um pequeno grupo não controle ao mesmo tempo a despesa e a fiscalização.",
  "coopTemplate.doc.crl-statutes.s6.h": "Excedentes, reservas e dissolução",
  "coopTemplate.doc.crl-statutes.s6.b0.0":
    "Qualquer excedente de exploração fica na cooperativa, afeto a reservas ou reinvestido no imóvel. É isto que mantém a cooperativa não especulativa.",
  "coopTemplate.doc.crl-statutes.s6.b0.1":
    "Um fundo de reserva legal mínimo, constituído ao longo do tempo, para reparações imprevistas ou faltas de tesouraria.",
  "coopTemplate.doc.crl-statutes.s6.b0.2":
    "Em caso de dissolução, os bens que restarem depois de saldadas as dívidas são transferidos para outra cooperativa ou entidade de fim social, nunca distribuídos aos membros como ganho inesperado. Isto é tanto uma exigência legal como um compromisso de valores.",
  "coopTemplate.doc.crl-statutes.s6.b1":
    "Isto é um esboço em linguagem simples. Os estatutos registáveis são um documento formal à parte: leva isto, juntamente com a tua carta de valores fundadores, a um advogado ou notário que trabalhe com direito cooperativo antes de redigires o documento que vais efetivamente depositar.",
  // share-agreement
  "coopTemplate.doc.share-agreement.tag": "Fase 2 · jurídico",
  "coopTemplate.doc.share-agreement.title": "Acordo de quota do",
  "coopTemplate.doc.share-agreement.titleEm": "sócio",
  "coopTemplate.doc.share-agreement.intro":
    "Um acordo de quota do sócio é o contrato individual entre a cooperativa e uma pessoa associada. Transforma os estatutos, que são do grupo, num documento que uma pessoa concreta assina, com números concretos ao lado do seu nome. Lê-o como um modelo para preencher em conjunto e verificar com um advogado antes de alguém assinar.",
  "coopTemplate.doc.share-agreement.s0.h": "A que dá direito a quota",
  "coopTemplate.doc.share-agreement.s0.b0":
    "Diz com clareza a que é que a adesão dá direito, e a que não dá.",
  "coopTemplate.doc.share-agreement.s0.b1.0":
    "Uma quota de sócio no valor, a título de exemplo ilustrativo, de 5000 €, que dá ao membro o direito de ocupar [uma fração descrita] e a um voto na assembleia geral.",
  "coopTemplate.doc.share-agreement.s0.b1.1":
    "Uma quota não é a propriedade de uma fração ou de um metro quadrado específicos. É a adesão à cooperativa, que detém o imóvel coletivamente.",
  "coopTemplate.doc.share-agreement.s0.b1.2":
    "A quota mantém-se no seu valor nominal enquanto o valor de mercado do imóvel se move; à saída é reembolsada por esse valor nominal ajustado (ver abaixo).",
  "coopTemplate.doc.share-agreement.s1.h": "Calendário de pagamento",
  "coopTemplate.doc.share-agreement.s1.b0":
    "Define como a quota é paga, já que poucos membros conseguem pagar o valor total à cabeça.",
  "coopTemplate.doc.share-agreement.s1.b1.0":
    "Pagamento total na admissão, ou um plano de prestações, por exemplo, 24 pagamentos mensais, acordado individualmente e registado no livro de contas partilhado.",
  "coopTemplate.doc.share-agreement.s1.b1.1":
    "O que acontece se falhar uma prestação: remete para o processo de atrasos do teu Acordo de honestidade financeira em vez de o repetir aqui.",
  "coopTemplate.doc.share-agreement.s2.h": "Sair: condições de reembolso",
  "coopTemplate.doc.share-agreement.s2.b0":
    "Esta é a cláusula que os membros leem com mais atenção, e a que mais precisa de ser justa em vez de punitiva.",
  "coopTemplate.doc.share-agreement.s2.b1.0":
    "Em caso de saída voluntária com o pré-aviso acordado, a cooperativa reembolsa o valor nominal da quota, ajustado por [inflação / um índice acordado], no prazo, a título de exemplo ilustrativo, de 12 meses após a saída.",
  "coopTemplate.doc.share-agreement.s2.b1.1":
    "A cooperativa não é obrigada a reembolsar de uma só vez se isso puser em risco as suas finanças. Indica à partida o prazo máximo de reembolso, para que não seja negociado sob pressão.",
  "coopTemplate.doc.share-agreement.s2.b1.2":
    "Não se aplica qualquer penalização de saída aos membros que saem em situação regular; as saídas motivadas por dificuldades passam primeiro pelo fundo de solidariedade.",
  "coopTemplate.doc.share-agreement.s3.h": "Quem pode deter uma quota",
  "coopTemplate.doc.share-agreement.s3.b0.0":
    "As quotas são detidas por pessoas associadas individuais e maiores de idade, e a sua transmissão por herança, venda ou doação carece de aprovação da assembleia. Isto mantém a adesão ligada à participação real.",
  "coopTemplate.doc.share-agreement.s3.b0.1":
    "O agregado de um membro, parceiros, filhos, família escolhida que viva com essa pessoa, não precisa de uma quota separada para cada um, mas indica com clareza quem conta como vivendo ao abrigo de uma só adesão.",
  "coopTemplate.doc.share-agreement.s4.h": "Proteção do valor entregue",
  "coopTemplate.doc.share-agreement.s4.b0":
    "Como uma quota não é uma caução de arrendamento, normalmente não está abrangida pelo regime português de proteção de cauções de inquilinos, di-lo explicitamente, e diz o que a protege em vez disso.",
  "coopTemplate.doc.share-agreement.s4.b1.0":
    "O valor da quota é mantido na conta da cooperativa, registado individualmente no livro de contas, e confirmado por escrito ao membro todos os anos.",
  "coopTemplate.doc.share-agreement.s4.b1.1":
    "Um conselho fiscal independente (ver os teus estatutos CRL) verifica que as contas das quotas correspondem ao que é devido a cada membro.",
  "coopTemplate.doc.share-agreement.s5.h": "Assinaturas",
  "coopTemplate.doc.share-agreement.s5.b0":
    "Um bloco de assinaturas simples, datado, com o membro e um representante da direção da cooperativa, mais uma linha que torna explícita a natureza de modelo:",
  "coopTemplate.doc.share-agreement.s5.b1.0":
    "Nome do membro, data, assinatura.",
  "coopTemplate.doc.share-agreement.s5.b1.1":
    "Nome do representante da cooperativa, cargo, data, assinatura.",
  "coopTemplate.doc.share-agreement.s5.b1.2":
    "Nota: este acordo foi adaptado a partir de um modelo da QueerPulse em [data] e revisto por [nome do advogado/notário] antes da assinatura.",
  "coopTemplate.doc.share-agreement.s5.b2":
    "Preenche todos os parênteses acima com os números reais do vosso grupo, e põe um advogado a verificar a versão final antes de alguém assinar.",
  // finance-model
  "coopTemplate.doc.finance-model.tag": "Fase 3 · finanças",
  "coopTemplate.doc.finance-model.title": "Modelo financeiro",
  "coopTemplate.doc.finance-model.titleEm": "explicado",
  "coopTemplate.doc.finance-model.intro":
    "Esta explicação percorre como o dinheiro numa cooperativa de habitação se soma na prática, o que estás a pagar, onde é que um crédito e o apoio municipal podem encaixar, e como definir uma contribuição mensal que seja sustentável em vez de otimista. O exemplo resolvido no fim usa apenas números ilustrativos; os teus valores reais dependem inteiramente do teu imóvel, da tua cidade e do teu grupo.",
  "coopTemplate.doc.finance-model.s0.h": "As camadas de custo",
  "coopTemplate.doc.finance-model.s0.b0":
    "Os custos de uma cooperativa vêm em três camadas, e ajuda mantê-las visualmente separadas em vez de juntas num único número assustador.",
  "coopTemplate.doc.finance-model.s0.b1.0":
    "Aquisição: o preço de compra do imóvel, mais notário, registo e imposto de transmissão (IMT).",
  "coopTemplate.doc.finance-model.s0.b1.1":
    "Obras: renovação, adequação às normas, adaptações de acessibilidade, muitas vezes subestimadas nos edifícios antigos de Lisboa e do Porto.",
  "coopTemplate.doc.finance-model.s0.b1.2":
    "Custos correntes: prestação do crédito ou empréstimo, seguros, reserva de manutenção, consumos dos espaços partilhados, e a própria administração da cooperativa (contabilidade, acompanhamento notarial).",
  "coopTemplate.doc.finance-model.s1.h":
    "Quotas dos membros, crédito e apoio municipal",
  "coopTemplate.doc.finance-model.s1.b0":
    "A maioria das cooperativas da QueerPulse combina três fontes de financiamento em vez de depender de uma só.",
  "coopTemplate.doc.finance-model.s1.b1.0":
    "As quotas dos membros (ver o teu Acordo de quota do sócio) cobrem uma parte da aquisição, normalmente o suficiente para tornar o rácio entre o crédito e o valor do imóvel viável para um financiador.",
  "coopTemplate.doc.finance-model.s1.b1.1":
    "Um crédito ou empréstimo cooperativo, muitas vezes através da Caixa de Crédito Agrícola Mútuo (CCAM) ou de outro financiador habituado a mutuários cooperativos, cobre o restante da aquisição e, por vezes, as obras.",
  "coopTemplate.doc.finance-model.s1.b1.2":
    "O apoio municipal, um arrendamento de longa duração sobre um imóvel do município, um subsídio de renovação, ou um coinvestimento de um fundo de habitação, pode, em alguns casos, reduzir ou substituir totalmente o custo de aquisição. Pergunta à pessoa de ligação ao fundo de habitação da QueerPulse o que está atualmente disponível na tua cidade.",
  "coopTemplate.doc.finance-model.s2.h": "Definir as contribuições mensais",
  "coopTemplate.doc.finance-model.s2.b0":
    "Trabalha de trás para a frente, a partir do que as pessoas conseguem realmente pagar, e só depois confirma que o número cobre os custos reais.",
  "coopTemplate.doc.finance-model.s2.b1.0":
    "Soma o total dos custos correntes mensais: prestação do empréstimo mais reserva mais seguros mais administração.",
  "coopTemplate.doc.finance-model.s2.b1.1":
    "Decide como se dividem as contribuições: por igual, ou ajustadas ao rendimento e à dimensão do agregado (remete para a vossa carta de valores fundadores e para o Acordo de honestidade financeira).",
  "coopTemplate.doc.finance-model.s2.b1.2":
    "Prevê uma margem, a maioria das cooperativas orça 5–10 % acima dos custos conhecidos para as surpresas que aparecem sempre no primeiro ano.",
  "coopTemplate.doc.finance-model.s3.h": "Constituir reservas",
  "coopTemplate.doc.finance-model.s3.b0.0":
    "Uma reserva de manutenção, dotada desde o primeiro mês, ainda antes de alguma coisa avariar, criá-la mais tarde, depois de uma infiltração no telhado, é muito mais difícil.",
  "coopTemplate.doc.finance-model.s3.b0.1":
    "Um valor-alvo para a reserva, muitas vezes falado como vários meses de custos correntes, acordado pelo grupo em vez de presumido.",
  "coopTemplate.doc.finance-model.s3.b0.2":
    "A reserva é separada do fundo de emergência/solidariedade, uma protege o edifício, o outro protege os membros.",
  "coopTemplate.doc.finance-model.s4.h":
    "Onde encaixam os parceiros da QueerPulse",
  "coopTemplate.doc.finance-model.s4.b0.0":
    "A CCAM e financiadores semelhantes, favoráveis a cooperativas: financiamento estruturado para mutuários coletivos em vez de créditos individuais.",
  "coopTemplate.doc.finance-model.s4.b0.1":
    "O fundo municipal de habitação: coinvestimento, arrendamentos de longa duração sobre edifícios municipais, ou subsídios associados a metas de habitação acessível. As condições variam de cidade para cidade e mudam ao longo do tempo, por isso confirma as condições atuais com a pessoa de ligação ao fundo de habitação da QueerPulse em vez de te fiares neste documento.",
  "coopTemplate.doc.finance-model.s4.b0.2":
    "A equipa jurídica da QueerPulse: uma primeira leitura das condições de financiamento antes de assinares. Procura também aconselhamento jurídico e financeiro independente.",
  "coopTemplate.doc.finance-model.s5.h":
    "Um exemplo resolvido (apenas números ilustrativos)",
  "coopTemplate.doc.finance-model.s5.b0":
    "Nenhum dos valores abaixo é um orçamento real, existem para mostrar como as peças encaixam numa cooperativa hipotética de 6 agregados.",
  "coopTemplate.doc.finance-model.s5.b1.0":
    "Imóvel + obras: 900 000 € (ilustrativo)",
  "coopTemplate.doc.finance-model.s5.b1.1":
    "Quotas dos membros, 6 agregados × 8000 €: 48 000 € (ilustrativo)",
  "coopTemplate.doc.finance-model.s5.b1.2":
    "Coinvestimento municipal: 150 000 € (ilustrativo)",
  "coopTemplate.doc.finance-model.s5.b1.3":
    "Montante restante financiado por um crédito cooperativo: 702 000 € (ilustrativo)",
  "coopTemplate.doc.finance-model.s5.b1.4":
    "Custo corrente mensal estimado por agregado, incluindo reserva: 420–480 € (ilustrativo)",
  "coopTemplate.doc.finance-model.s5.b2":
    "Trata este modelo como uma estrutura de partida. Os números aqui são ilustrativos. Constrói os teus números reais com o teu financiador, o teu município e, para tudo o que for vinculativo, um contabilista ou advogado.",
  // conflict-resolution
  "coopTemplate.doc.conflict-resolution.tag": "Fase 5 · governação",
  "coopTemplate.doc.conflict-resolution.title": "Processo de resolução de",
  "coopTemplate.doc.conflict-resolution.titleEm": "conflitos",
  "coopTemplate.doc.conflict-resolution.intro":
    "Todas as cooperativas têm conflitos, a diferença entre as que duram e as que não duram está normalmente em terem ou não construído um processo antes de precisarem dele. Este está adaptado do que a Casa Sambizanga usa no dia a dia; trata-o como uma estrutura de partida para percorrer e ajustar com o teu próprio grupo, sobretudo os passos que envolvem a possível saída de alguém.",
  "coopTemplate.doc.conflict-resolution.s0.h":
    "Princípios: reparar em vez de punir",
  "coopTemplate.doc.conflict-resolution.s0.b0":
    "Define o tom antes dos passos. Um processo que só existe para punir tende a levar as pessoas a esconder problemas em vez de os levantar.",
  "coopTemplate.doc.conflict-resolution.s0.b1.0":
    "O objetivo de qualquer passo abaixo é reparar a relação ou a situação o suficiente para que a cooperativa continue a funcionar. Apurar quem tinha razão fica de fora.",
  "coopTemplate.doc.conflict-resolution.s0.b1.1":
    "Qualquer pessoa pode levantar uma preocupação sem que isso seja tratado como uma acusação contra ela por a ter levantado.",
  "coopTemplate.doc.conflict-resolution.s0.b1.2":
    "As questões de segurança (ver abaixo) são a única categoria em que a reparação fica para trás face à proteção imediata.",
  "coopTemplate.doc.conflict-resolution.s1.h": "Desacordos do dia a dia",
  "coopTemplate.doc.conflict-resolution.s1.b0":
    "A maior parte do atrito nunca precisa de um processo formal, di-lo explicitamente para que as pessoas não agravem coisas pequenas por ansiedade.",
  "coopTemplate.doc.conflict-resolution.s1.b1.0":
    "Barulho, tarefas, visitas, uso dos espaços partilhados: levantados diretamente, a sós, o mais próximo possível do momento em que acontecem.",
  "coopTemplate.doc.conflict-resolution.s1.b1.1":
    "Se começar uma conversa direta sozinho parecer difícil demais, pede a uma terceira pessoa do grupo para estar presente. O papel dela é simplesmente estar ali, para que não sejam duas pessoas sozinhas num momento difícil.",
  "coopTemplate.doc.conflict-resolution.s2.h": "O processo por etapas",
  "coopTemplate.doc.conflict-resolution.s2.b0":
    "Quando uma conversa direta não resolve algo, ou parece inseguro tentá-la sozinho, o processo agrava-se por etapas, cada uma menos exigente do que a seguinte, para que a maioria das coisas se resolva antes de chegar à assembleia.",
  "coopTemplate.doc.conflict-resolution.s2.b1.0":
    "Etapa 1, direta: as pessoas envolvidas conversam, a sós, idealmente na semana em que a questão surge.",
  "coopTemplate.doc.conflict-resolution.s2.b1.1":
    "Etapa 2, facilitada: se a etapa 1 não resultar, um terceiro membro, escolhido por acordo e não designado, facilita uma conversa entre as pessoas envolvidas.",
  "coopTemplate.doc.conflict-resolution.s2.b1.2":
    "Etapa 3, assembleia: se continuar por resolver, ou afetar toda a casa, é levado a todo o grupo como um ponto de agenda claro e acordado com antecedência.",
  "coopTemplate.doc.conflict-resolution.s2.b1.3":
    "Etapa 4, mediação externa: para tudo o que o grupo não consiga resolver internamente, chama-se uma pessoa mediadora externa, a expensas da cooperativa, antes de se considerar qualquer decisão sobre a saída de alguém.",
  "coopTemplate.doc.conflict-resolution.s3.h": "Questões de dano e segurança",
  "coopTemplate.doc.conflict-resolution.s3.b0":
    "Algumas situações passam diretamente para a ação de proteção, e não devem esperar pela etapa 1.",
  "coopTemplate.doc.conflict-resolution.s3.b1.0":
    "Tudo o que envolva violência, assédio ou a segurança imediata de um membro vai diretamente para os membros que têm um papel de resposta de segurança, ignorando por completo o processo por etapas.",
  "coopTemplate.doc.conflict-resolution.s3.b1.1":
    "A pessoa que sofreu o dano decide, tanto quanto possível, o que acontece a seguir, seja espaço, uma conversa facilitada, ou a saída temporária de alguém de casa.",
  "coopTemplate.doc.conflict-resolution.s3.b1.2":
    "A cooperativa não investiga nem julga por si própria matérias criminais; apoia a pessoa afetada no acesso a ajuda externa, se a quiser, e toma decisões sobre a segurança da habitação partilhada em paralelo.",
  "coopTemplate.doc.conflict-resolution.s4.h": "Limites e responsabilização",
  "coopTemplate.doc.conflict-resolution.s4.b0.0":
    "Responsabilização, aqui, significa alguém mudar efetivamente o comportamento que causou o dano, com apoio e com seguimento.",
  "coopTemplate.doc.conflict-resolution.s4.b0.1":
    "Os acordos feitos em qualquer etapa, um comportamento alterado, um limite, uma ação de reparação, são postos por escrito e recebem uma data de revisão, para que sejam verificados em vez de dados como resolvidos.",
  "coopTemplate.doc.conflict-resolution.s5.h": "Quando alguém tem de sair",
  "coopTemplate.doc.conflict-resolution.s5.b0":
    "Este é o passo mais difícil, e aquele que mais vale a pena decidir com calma, com antecedência, em vez de a meio de uma crise.",
  "coopTemplate.doc.conflict-resolution.s5.b1.0":
    "A saída involuntária só é considerada depois da etapa 4, exceto em situações de segurança em que é necessária uma separação imediata e temporária.",
  "coopTemplate.doc.conflict-resolution.s5.b1.1":
    "A decisão exige [um limiar acordado, por exemplo, uma maioria qualificada da assembleia, excluindo quem está diretamente envolvido] e segue as condições de saída dos teus estatutos CRL e do Acordo de quota do sócio.",
  "coopTemplate.doc.conflict-resolution.s5.b1.2":
    "Sempre que possível, a cooperativa apoia o membro que sai a encontrar habitação alternativa. Isto é uma rede de segurança habitacional.",
  "coopTemplate.doc.conflict-resolution.s6.h": "Rever o processo",
  "coopTemplate.doc.conflict-resolution.s6.b0":
    "Revê isto depois de ser efetivamente usado, além do calendário previsto.",
  "coopTemplate.doc.conflict-resolution.s6.b1.0":
    "Depois de qualquer uso da etapa 3 ou seguinte, o grupo revê se o próprio processo funcionou, separando isso do desfecho daquele conflito em concreto.",
  "coopTemplate.doc.conflict-resolution.s6.b1.1":
    "Anualmente, a par da revisão da carta de valores fundadores, verifica se o processo por etapas, o papel de facilitação e o papel de resposta de segurança ainda servem o grupo à medida que este cresceu ou mudou.",
  "coopTemplate.doc.conflict-resolution.s6.b2":
    "Este processo é um modelo de partida adaptado da prática de outra cooperativa da QueerPulse. Percorre todos os passos em grupo antes de precisares dele, e ajusta os papéis e os limiares para que sirvam o vosso.",

  // ── Estatísticas do hero (housingCoop.data → COOP_STATS) ────────────────
  "housingCoop.stats.activeGroups": "Grupos ativos",
  "housingCoop.stats.householdsHoused": "Agregados alojados",
  "housingCoop.stats.inPhase": "Em fase 4–5",
  "housingCoop.stats.cities": "Cidades",
  "housingCoop.stats.citiesLisbon": "Lisboa · ",

  // ── Calendário de cinco fases (housingCoop.data → COOP_PHASES) ──────────
  "housingCoop.phase.findPeople.name": "Encontrar",
  "housingCoop.phase.findPeople.nameEm": "as pessoas",
  "housingCoop.phase.findPeople.time": "2–4 meses",
  "housingCoop.phase.findPeople.desc":
    "4–12 agregados familiares que partilham valores, calendário e hábitos financeiros. Teste de afinidades, honestidade financeira, cláusula de saída.",
  "housingCoop.phase.legalIncorporation.name": "Constituição",
  "housingCoop.phase.legalIncorporation.nameEm": "legal",
  "housingCoop.phase.legalIncorporation.time": "1–3 meses",
  "housingCoop.phase.legalIncorporation.desc":
    "Estrutura de cooperativa CRL, estatutos, quotas de membro. Modelos específicos para a lei portuguesa.",
  "housingCoop.phase.financeStructure.name": "Financiamento &",
  "housingCoop.phase.financeStructure.nameEm": "estrutura",
  "housingCoop.phase.financeStructure.time": "3–8 meses",
  "housingCoop.phase.financeStructure.desc":
    "Capital social dos membros, financiamento bancário ético, apoios do Estado, mecânica do fundo do grupo.",
  "housingCoop.phase.findProperty.name": "Encontrar",
  "housingCoop.phase.findProperty.nameEm": "o imóvel",
  "housingCoop.phase.findProperty.time": "6–12 meses",
  "housingCoop.phase.findProperty.desc":
    "Levantamento, negociação, assinatura. A maioria dos grupos compra. Alguns optam por arrendamento com opção de compra. Outros arrendam a longo prazo do parque público.",
  "housingCoop.phase.dailyGovernance.name": "Governação",
  "housingCoop.phase.dailyGovernance.nameEm": "diária",
  "housingCoop.phase.dailyGovernance.time": "Para sempre",
  "housingCoop.phase.dailyGovernance.desc":
    "Tomada de decisões, conflitos, reparações, novos membros, sucessão. Ferramentas que aguentam o tédio & os dias maus.",

  // ── Modelos para descarregar (housingCoop.data → COOP_TEMPLATES) ────────
  "housingCoop.template.foundingValues.tag": "Fase 1 · modelo",
  "housingCoop.template.foundingValues.name": "Valores fundadores &",
  "housingCoop.template.foundingValues.nameEm": "teste de afinidades",
  "housingCoop.template.foundingValues.meta": "PDF · PT + EN · 14 páginas",
  "housingCoop.template.financialHonesty.tag": "Fase 1 · modelo",
  "housingCoop.template.financialHonesty.name": "Honestidade financeira",
  "housingCoop.template.financialHonesty.nameEm": "folha de trabalho",
  "housingCoop.template.financialHonesty.meta":
    "Folha de cálculo · uma folha por membro",
  "housingCoop.template.crlStatutes.tag": "Fase 2 · legal",
  "housingCoop.template.crlStatutes.name": "Cooperativa CRL",
  "housingCoop.template.crlStatutes.nameEm": "estatutos",
  "housingCoop.template.crlStatutes.meta": "DOCX · lei portuguesa · validado",
  "housingCoop.template.shareAgreement.tag": "Fase 2 · legal",
  "housingCoop.template.shareAgreement.name": "Quota de membro",
  "housingCoop.template.shareAgreement.nameEm": "acordo",
  "housingCoop.template.shareAgreement.meta":
    "PDF · cláusulas para família escolhida",
  "housingCoop.template.financeModel.tag": "Fase 3 · financiamento",
  "housingCoop.template.financeModel.name": "Financiamento do grupo",
  "housingCoop.template.financeModel.nameEm": "modelo",
  "housingCoop.template.financeModel.meta":
    "Folha de cálculo · com dados de Lisboa & Porto",
  "housingCoop.template.conflictResolution.tag": "Fase 5 · governação",
  "housingCoop.template.conflictResolution.name": "Resolução de conflitos",
  "housingCoop.template.conflictResolution.nameEm": "processo",
  "housingCoop.template.conflictResolution.meta":
    "PDF · adaptado da Casa Sambizanga",

  // ── Lista de mentores/parceiros (housingCoop.data → COOP_RESOURCES).
  //    Os campos `em` (nomes próprios: "Casa Sambizanga", "CCAM") ficam no
  //    ficheiro de dados, não no catálogo.
  "housingCoop.resource.sambizangaMentorsPost": " · mentoria",
  "housingCoop.resource.sambizangaMentorsMeta": "4 ativas",
  "housingCoop.resource.qpLegalTeamPre": "Equipa jurídica da QP",
  "housingCoop.resource.qpLegalTeamMeta": "3 juristas",
  "housingCoop.resource.housingFundLiaisonPre":
    "Ligação ao fundo de habitação de Lisboa",
  "housingCoop.resource.housingFundLiaisonMeta": "1 contacto",
  "housingCoop.resource.caixaPre": "Caixa ",
  "housingCoop.resource.caixaPost": " · atendimento a cooperativas",
  "housingCoop.resource.caixaMeta": "Parceria",
  "housingCoop.resource.monthlyAssemblyPre": "Assembleia mensal da cooperativa",
  "housingCoop.resource.monthlyAssemblyMeta": "1.º sábado",

  "housingCoop.toast.updates":
    "Vais passar a receber as atualizações de {name} no teu feed.",
  "housingCoop.toast.mentoring":
    "Pedido de mentoria enviado à Casa Sambizanga.",
  "housingCoop.toast.seeAll":
    "O diretório completo de cooperativas está a chegar.",
  "housingCoop.toast.postHelp":
    "Vamos ajudar-te a encontrar o teu grupo. Confirma a tua caixa de entrada.",
  "housingCoop.toast.story": "A história da Casa Sambizanga está a chegar.",

  // ── JoinCoopModal ────────────────────────────────────────────────────────
  "joinCoop.askToJoinAriaLabel": "Pedir para te juntares a {name}",
  "joinCoop.success.title": "Pedido",
  "joinCoop.success.em": "enviado.",
  "joinCoop.success.closeLabel": "Concluído",
  "joinCoop.success.body":
    "A organização de <strong>{name}</strong> vai ver o teu interesse e entrar em contacto para marcar uma primeira conversa. Ainda sem compromisso, as primeiras conversas servem para perceber se encaixa bem, para os dois lados.",
  "joinCoop.title": "Pedir para te juntares a <em>{name}.</em>",
  "joinCoop.sub":
    "{location}. Conta-lhes um pouco sobre quem se vai juntar. Vão entrar em contacto para marcar uma primeira conversa.",
  "joinCoop.nameLabel": "O teu nome *",
  "joinCoop.namePlaceholder": "Como te devemos chamar?",
  "joinCoop.householdLabel": "Quem se vai juntar *",
  "joinCoop.chooseOne": "Escolhe uma opção…",
  "joinCoop.noteLabel": "Algo que gostasses que soubessem",
  "joinCoop.notePlaceholder":
    "O que te atrai nesta cooperativa? A tua situação, prazos, esperanças…",
  "joinCoop.disclaimer":
    "O teu pedido é partilhado apenas com a organização desta cooperativa. Juntar-se a uma cooperativa é uma conversa longa, por isso leva o teu tempo.",
  "joinCoop.cancel": "Cancelar",
  "joinCoop.sending": "A enviar…",
  "joinCoop.sendCta": "Enviar pedido",
  "joinCoop.error": "Não foi possível enviar o teu pedido. Tenta novamente.",
  "joinCoop.household.justMe": "Só eu",
  "joinCoop.household.mePlusPartners": "Eu + acompanhante(s)",
  "joinCoop.household.small": "Um agregado de 3–4",
  "joinCoop.household.large": "Um agregado de 5+",

  // ── OfferPage (Asks & Offers board detail) ─────────────────────────────
  // Scope note: MAIN/OTHERS in OfferPage.tsx (the zine-collab ask, the free
  // portraits/mentoring/sublet offers, poster names/roles/bios) are
  // member-authored marketplace posts — in live mode fetched from the board.
  // Left in English. Only the surrounding chrome below is translated.
  "offerBoard.backLink": "Pedidos & Ofertas",
  "offerBoard.pill.looking": "Procura",
  "offerBoard.pill.offering": "Oferece",
  "offerBoard.respondCta": "Responder a {name}",
  "offerBoard.seeProfileCta": "Ver o perfil",
  "offerBoard.postedBy": "Publicado por",
  "offerBoard.sidebarNote":
    "{name} é uma pessoa membro em situação regular. Cada pessoa membro tem o voto de confiança de alguém que já está na comunidade.",
  "offerBoard.sidebarNoteVerified":
    "{name} é uma pessoa membro em situação regular e foi verificada pela equipa. Cada pessoa membro tem o voto de confiança de alguém que já está na comunidade.",
  "offerBoard.sayHelloCta": "Diz olá a {name}",
  "offerBoard.moreFromBoard": "Mais do <em>quadro</em>",
  "offerBoard.comingSoon.title": "Pedidos & Ofertas está a caminho",
  "offerBoard.comingSoon.body":
    "O quadro da comunidade, onde os membros publicam o que procuram e o que podem oferecer, chega brevemente. Volta daqui a pouco.",

  // ── SalarySubmitModal ────────────────────────────────────────────────────
  "salarySubmitModal.subtitle":
    "Completamente anónimo. Nada que te possa identificar é guardado.",
  "salarySubmitModal.jobTitlePlaceholder": "Cargo / função",
  "salarySubmitModal.sectorPlaceholder": "Setor (ex.: Tecnologia, ONG, Design)",
  "salarySubmitModal.annualSalaryPlaceholder": "Salário anual (€)",
  "salarySubmitModal.yearsExpPlaceholder": "Anos de experiência",
  "salarySubmitModal.employmentTypeLabel": "Tipo de vínculo",
  "salarySubmitModal.type.fullTime": "Tempo inteiro",
  "salarySubmitModal.type.partTime": "Meio tempo",
  "salarySubmitModal.type.freelance": "Freelancer",
  "salarySubmitModal.type.contract": "Contrato a termo",
  "salarySubmitModal.submitCta": "Enviar anonimamente",

  // ── AffiliateCompanyModal ────────────────────────────────────────────────
  "affiliateRole.founder": "Pessoa fundadora / proprietária",
  "affiliateRole.hiringLead": "Responsável de contratação",
  "affiliateRole.teamMember": "Membro da equipa",
  "affiliateRole.recruiter": "Pessoa recrutadora",
  "affiliateRole.volunteerCoordinator": "Coordenação de voluntariado",
  "affiliateCompanyModal.ariaLabel": "Associar a tua empresa",
  "affiliateCompanyModal.eyebrow": "Acesso de empregador",
  "affiliateCompanyModal.title":
    "Para que empresa estás a <em>publicar a vaga?</em>",
  "affiliateCompanyModal.sub":
    "Escolhe a organização para a qual estás autorizado a contratar. Confirmamos as associações com empregadores para manter o quadro fiável.",
  "affiliateCompanyModal.notListed.name": "A minha empresa não está listada",
  "affiliateCompanyModal.notListed.meta": "Adicioná-la ao diretório",
  "affiliateCompanyModal.addCompany.nameLabel": "Nome da empresa",
  "affiliateCompanyModal.addCompany.namePlaceholder": "ex.: Atelier Pulso",
  "affiliateCompanyModal.addCompany.taglineLabel": "Frase de apresentação",
  "affiliateCompanyModal.addCompany.taglinePlaceholder":
    "O que a empresa faz, numa frase.",
  "affiliateCompanyModal.addCompany.aboutLabel": "Sobre",
  "affiliateCompanyModal.addCompany.aboutPlaceholder":
    "Uma breve descrição da empresa e de como funciona.",
  "affiliateCompanyModal.addCompany.pickExisting":
    "Escolher uma empresa existente",
  "affiliateCompanyModal.roleLabel": "O teu cargo lá",
  "affiliateCompanyModal.cancel": "Cancelar",
  "affiliateCompanyModal.creating": "A criar…",
  "affiliateCompanyModal.verifying": "A verificar…",
  "affiliateCompanyModal.createCta": "Criar e continuar",
  "affiliateCompanyModal.confirmCta": "Confirmar e continuar",
  "affiliateCompanyModal.createErrorToast":
    "Não foi possível criar essa empresa. Tenta novamente.",

  // ── Coming soon (live mode: honest stand-in for flows with no backend yet) ─
  "comingSoon.title": "Ainda não está",
  "comingSoon.em": "ativo.",
  "comingSoon.body":
    "Este formulário faz parte da pré-visualização, vai ligar-se a sério quando a QueerPulse arrancar. Nada do que escreveres aqui é enviado para lado nenhum.",
  "comingSoon.close": "Percebido",

  // ── IncubatorModals: CohortApplyModal ────────────────────────────────────
  "incubatorApply.success.title": "Candidatura",
  "incubatorApply.success.em": "recebida.",
  "incubatorApply.success.body":
    "Obrigade, <strong>{name}</strong>. As candidaturas à Coorte 3 são lidas pela equipa do programa depois do prazo de 30 de julho. Terás resposta dentro de três semanas, seja qual for a decisão.",
  "incubatorApply.eyebrow": "Incubadora · Coorte 3",
  "incubatorApply.title": "Candidata-te a <em>construir a tua ideia.</em>",
  "incubatorApply.sub":
    "Seis meses de mentoria, responsabilização entre pares e apresentações calorosas. Não é preciso pitch deck. Diz-nos só o que estás a criar e em que ponto estás.",
  "incubatorApply.nameLabel": "O teu nome *",
  "incubatorApply.namePlaceholder": "Nome e apelido",
  "incubatorApply.emailLabel": "Email *",
  "incubatorApply.emailPlaceholder": "tu@exemplo.com",
  "incubatorApply.pitchLabel": "O que estás a construir? *",
  "incubatorApply.pitchPlaceholder":
    "Algumas frases sobre a tua ideia, em que ponto estás, e onde mais precisas de ajuda.",
  "incubatorApply.charsNeeded_one":
    "Falta {count} caráter no teu pitch para enviar.",
  "incubatorApply.charsNeeded_other":
    "Faltam {count} carateres no teu pitch para enviar.",
  "incubatorApply.looksGood":
    "Está bem. As decisões saem dentro de três semanas após o prazo.",
  "incubatorApply.submitCta": "Enviar candidatura",

  // ── IncubatorModals: MentorSignupModal ───────────────────────────────────
  "mentorSignup.success.title": "Já estás na",
  "mentorSignup.success.em": "lista.",
  "mentorSignup.success.body":
    "Obrigade, <strong>{name}</strong>. A equipa de mentoria vai entrar em contacto para te associar a uma pessoa fundadora cujo setor e fase combinem com o que ofereces. As pessoas mentoras encontram-se com quem apoiam quinzenalmente ao longo da coorte.",
  "mentorSignup.eyebrow": "Incubadora · Mentoria",
  "mentorSignup.title": "Torna-te <em>pessoa mentora.</em>",
  "mentorSignup.sub":
    "Dá algumas horas por mês a uma pessoa fundadora queer que está a encontrar o seu caminho. Fazemos o match por setor, fase, e aquilo que realmente sabes.",
  "mentorSignup.nameLabel": "O teu nome *",
  "mentorSignup.namePlaceholder": "Nome e apelido",
  "mentorSignup.emailLabel": "Email *",
  "mentorSignup.emailPlaceholder": "tu@exemplo.com",
  "mentorSignup.expertiseLabel": "Em que podes ajudar? *",
  "mentorSignup.expertisePlaceholder":
    "ex.: Produto, angariação de fundos, jurídico, contratação",
  "mentorSignup.whyLabel": "Porquê fazer mentoria? *",
  "mentorSignup.whyPlaceholder":
    "Uma ou duas frases sobre o que trazes e a quem gostarias mais de apoiar.",
  "mentorSignup.charsNeeded_one": "Falta {count} caráter para enviar.",
  "mentorSignup.charsNeeded_other": "Faltam {count} carateres para enviar.",
  "mentorSignup.looksGood":
    "Analisamos todas as pessoas mentoras antes do match. Deves ter notícias em breve.",
  "mentorSignup.submitCta": "Inscrever-me para fazer mentoria",

  // ── IncubatorModals: RequestSessionModal ─────────────────────────────────
  "requestSession.success.title": "Sessão",
  "requestSession.success.em": "pedida.",
  "requestSession.success.body":
    "O teu pedido chegou a <strong>{name}</strong>. As pessoas mentoras respondem dentro de alguns dias para confirmar uma hora. Fica atente ao teu email, é de lá que virá o contacto.",
  "requestSession.eyebrow": "Incubadora · {role}",
  "requestSession.title": "Pede uma sessão com <em>{name}.</em>",
  "requestSession.sub":
    "Uma nota breve já ajuda bastante. Diz no que estás a trabalhar e quando gostarias de te encontrar, {firstName} vai responder para combinar.",
  "requestSession.whenLabel": "Horário preferido *",
  "requestSession.whenPlaceholder":
    "ex.: Noites de semana, ou terças/quintas à tarde",
  "requestSession.messageLabel": "Sobre o que gostarias de falar? *",
  "requestSession.messagePlaceholder":
    "Algumas frases sobre em que ponto estás e onde mais gostarias de ajuda.",
  "requestSession.looksGood":
    "Está bem. As pessoas mentoras costumam responder dentro de alguns dias.",
  "requestSession.sendCta": "Enviar pedido",

  // ── companies.data.tsx — títulos estruturais dentro do "Sobre" de cada empresa ─
  "company.about.howWeWorkHeading": "Como trabalhamos",
  "company.about.whatWeLookForHeading": "O que procuramos",

  // ── Segurança na habitação — aviso anti-burla, direitos, preços (Wave A) ──
  "housingSafety.banner.ariaLabel": "Segurança na habitação",
  "housingSafety.banner.eyebrow": "Antes de avançares",
  "housingSafety.banner.title": "Umas coisas que te mantêm <em>seguro</em>",
  "housingSafety.banner.dismiss": "Dispensar",
  "housingSafety.banner.moreCta": "Conhece os teus direitos, deteta uma burla",
  "housingSafety.tips.neverPayFirst":
    "Nunca pagues nada antes de teres um contrato assinado.",
  "housingSafety.tips.videoCall":
    "Pede uma videochamada. Vê a pessoa e o espaço em direto.",
  "housingSafety.tips.lowPrice":
    "Um preço muito abaixo do normal costuma ser um aviso.",
  "housingSafety.tips.noTransfers":
    "Sem transferências nem sinais antes de confirmares com quem estás a falar.",
  "housingSafety.tips.stayOnPlatform":
    "Mantém a conversa aqui. É mais fácil pedir ajuda se algo correr mal.",
  "housingSafety.tips.neverSightUnseen":
    "Nunca arrendes um espaço que tu, ou alguém de confiança, não tenham visto ao vivo.",
  "housingSafety.price.title": "Quanto custa mesmo arrendar em Lisboa",
  "housingSafety.price.lead":
    "Uma referência rápida. Se um espaço estiver muito abaixo destes valores, pergunta-te porquê antes de avançares.",
  "housingSafety.price.room.label":
    "Quarto individual num apartamento partilhado",
  "housingSafety.price.double.label": "Quarto partilhado, por pessoa",
  "housingSafety.price.studio.label": "Estúdio só para ti",
  "housingSafety.price.perMonth": "/ mês",
  "housingSafety.price.note":
    "Intervalos aproximados para Lisboa, como referência. Uma avaliação formal é outra coisa.",
  "housingSafety.page.eyebrow": "Segurança na habitação",
  "housingSafety.page.title": "Arrendar, com <em>segurança</em>",
  "housingSafety.page.lead":
    "Um guia curto e claro para detetar uma burla e conhecer os teus direitos enquanto inquilino em Portugal, para encontrares casa sem ficares na dúvida.",
  "housingSafety.page.antiScamTitle": "Detetar uma <em>burla</em>",
  "housingSafety.page.rightsTitle":
    "Os teus direitos enquanto inquilino em Portugal",
  "housingSafety.rights.lease.title": "Um contrato escrito e registado",
  "housingSafety.rights.lease.point.1":
    "O teu arrendamento deve ser um contrato escrito, um acordo verbal deixa-te com muito menos para te defenderes.",
  "housingSafety.rights.lease.point.2":
    "Deve identificar as duas partes, o imóvel, a renda e a duração. Guarda a tua cópia assinada.",
  "housingSafety.rights.lease.point.3":
    "O senhorio tem de registar o contrato nas Finanças. Desde 2025 podes registá-lo tu, se ele não o fizer.",
  "housingSafety.rights.lease.point.4":
    "Um contrato de habitação dura pelo menos um ano, salvo se um prazo mais curto for algo que tu pediste.",
  "housingSafety.rights.deposit.title": "Caução e renda adiantada",
  "housingSafety.rights.deposit.point.1":
    "A caução está limitada a duas rendas.",
  "housingSafety.rights.deposit.point.2":
    "A renda pedida por antecipação tem o mesmo limite, ou seja, cerca de duas rendas é o teto do que te podem pedir à cabeça. Acima disso, pede a justificação por escrito.",
  "housingSafety.rights.rentIncrease.title": "Aumentos de renda",
  "housingSafety.rights.rentIncrease.point.1":
    "A renda pode subir no máximo uma vez a cada 12 meses, e só com 30 dias de aviso por escrito.",
  "housingSafety.rights.rentIncrease.point.2":
    "O aumento está limitado ao coeficiente que o INE publica todos os anos. Para 2026 é de 2,24%.",
  "housingSafety.rights.rentIncrease.point.3":
    "Uma subida acima desse limite, ou sem o aviso, merece ser questionada. Pede o valor por escrito antes de o pagares.",
  "housingSafety.rights.eviction.title": "Despejo e a tua casa",
  "housingSafety.rights.eviction.point.1":
    "Só podes ser despejado através de um tribunal ou do Balcão Nacional do Arrendamento. Nunca de imediato.",
  "housingSafety.rights.eviction.point.2":
    "Mudar a fechadura, cortar-te a água ou a luz, ou tirar-te as coisas de casa é crime, ao abrigo da Lei n.º 12/2019.",
  "housingSafety.rights.eviction.point.3":
    "Se algo disto acontecer, é matéria criminal. Fotografa tudo, guarda as mensagens e vai à polícia ou a uma associação de inquilinos.",
  "housingSafety.rights.discrimination.title":
    "Se fores tratado de forma injusta",
  "housingSafety.rights.discrimination.point.1":
    "A lei do arrendamento não prevê proteções específicas para pessoas LGBTQ+, mas a discriminação pode na mesma ser denunciada a um organismo para a igualdade.",
  "housingSafety.rights.discrimination.point.2":
    "Guarda o anúncio, as mensagens e qualquer recusa que te tenham dado. É o registo escrito que sustenta uma queixa.",
  "housingSafety.disclaimer.title":
    "Orientação, não <em>aconselhamento jurídico</em>",
  "housingSafety.disclaimer.body":
    "Mantivemos isto rigoroso e claro, mas cada situação é única. Para algo que conte mesmo, fala com uma associação de inquilinos ou com um advogado.",
  "housingSafety.backToHousing": "Voltar à habitação",

  // ── Localização do anúncio — área aproximada vs morada exata (Wave A) ──
  "housingListing.section.location": "Onde fica",
  "housingListing.location.approxNote":
    "Por agora vês a área aproximada. A morada exata aparece assim que tu e a pessoa ficarem ligados.",
  "housingListing.location.exactNote":
    "Estão ligados, por isso esta é a localização exata.",
  // PRD-241, o terceiro estado: quem já tem acesso mas o anúncio não tem morada.
  "housingListing.location.noAddressOnFileNote":
    "Tens acesso à morada exata e quem anunciou ainda não a adicionou. Pede-lha quando combinares a visita.",
  // Os dois estados de quem é dono do anúncio. As duas chaves acima apontavam
  // uma pessoa para si própria.
  "housingListing.location.ownExactNote":
    "Este anúncio é teu, por isso estás a ver a morada exata que guardaste.",
  "housingListing.location.ownNoAddressNote":
    "Ainda não adicionaste uma morada a este anúncio. Adiciona uma e quem tiver acesso vai ver o sítio exato.",
  "housingListing.location.addressLabel": "Morada",
  "housingListing.location.mapAreaAria":
    "Mapa que mostra a área aproximada de {title}",
  "housingListing.location.mapExactAria":
    "Mapa que mostra a localização exata de {title}",

  // ── Diz olá — primeira mensagem, com partilha opcional de pronomes (Wave A) ─
  "sayHello.ariaLabel": "Diz olá a {name}",
  "sayHello.title": "Diz <em>olá</em>",
  "sayHello.lede":
    "Uma primeira mensagem curta e calorosa faz toda a diferença. Diz o que procuras e o que trarias para uma casa.",
  "sayHello.messageLabel": "A tua mensagem",
  "sayHello.messagePlaceholder":
    "Olá! Procuro um sítio calmo e queer-friendly a partir de setembro…",
  "sayHello.sharePronouns": "Deixar {name} ver os meus pronomes, {pronouns}",
  "sayHello.sharePronounsHint":
    "Partilhado só com esta pessoa, e só quando quiseres.",
  "sayHello.noPronounsHint":
    "Adiciona pronomes ao teu perfil para os partilhares aqui.",
  "sayHello.cancel": "Cancelar",
  "sayHello.send": "Enviar olá",
  "sayHello.sending": "A enviar…",
  "sayHello.success.title": "O teu olá está a <em>caminho.</em>",
  "sayHello.success.body":
    "{name} vai ver a tua mensagem na caixa de entrada. Terás resposta por lá se quiser falar.",
  "sayHello.success.bodyWithPronouns":
    "{name} vai ver a tua mensagem e os teus pronomes na caixa de entrada. Terás resposta por lá se quiser falar.",
  "sayHello.success.close": "Concluído",

  // ── Companheiros de casa — alternar lista/descoberta + modo descoberta (Wave A) ─
  "flatmates.view.label": "Escolhe como explorar",
  "flatmates.view.list": "Lista",
  "flatmates.view.discovery": "Descoberta",
  "flatmates.discovery.progress": "{current} de {total}",
  "flatmates.discovery.pass": "Passar",
  "flatmates.discovery.like": "Gostar",
  "flatmates.discovery.sayHello": "Diz olá",
  "flatmates.discovery.keepBrowsing": "Continuar a explorar",
  "flatmates.discovery.error": "Não foi possível guardar. Tenta daqui a pouco.",
  "flatmates.discovery.matchTitle": "Disseram olá os <em>dois</em>",
  "flatmates.discovery.matchBody":
    "Tu e {name} gostaram um do outro. Começa a conversa quando quiseres.",
  "flatmates.discovery.doneTitle": "Por agora, é toda a gente",
  "flatmates.discovery.doneBody":
    "Já viste todos os perfis que encaixam nos teus filtros. Volta em breve, entra gente nova com frequência.",

  // ── Grupos de habitação verificados + pedido de entrada (Wave A) ──
  "housingGroups.backLabel": "Habitação",
  "housingGroups.hero.eyebrow": "Habitação verificada",
  "housingGroups.hero.title":
    "Grupos em que quem arrenda queer <em>confia</em>",
  "housingGroups.hero.sub":
    "Grupos de habitação pequenos e triados, onde cada anúncio indica a renda, descreve a acessibilidade com honestidade e nenhum intermediário entra.",
  "housingGroups.grid.title": "Encontra as tuas <em>pessoas</em>",
  "housingGroups.grid.sub":
    "Pede para entrar num grupo e alguém da equipa vem dizer olá. Cada grupo tem as suas regras.",
  "housingGroups.gated": "Pedir para entrar",
  "housingGroups.members": "{count} membros",
  "housingGroups.view": "Ver",
  "housingGroups.empty.title": "Ainda não há grupos",
  "housingGroups.empty.titleEm": "abertos",
  "housingGroups.empty.body":
    "Os grupos de habitação verificados estão a formar-se cidade a cidade. Volta em breve, ou começa um com pessoas em quem já confias.",
  "housingGroups.detail.backLabel": "Todos os grupos",
  "housingGroups.detail.askToJoin": "Pedir para entrar",
  "housingGroups.detail.join": "Entrar neste grupo",
  "housingGroups.norms.title": "Como",
  "housingGroups.norms.titleEm": "cuidamos uns dos outros",
  "housingGroups.norms.sub":
    "Regras com que toda a gente aqui concorda. Quem as quebra, sai. É mesmo esse o ponto.",
  "housingGroups.listings.title": "Quartos e apartamentos lá dentro",
  // ENG-171, o lado da leitura. "alguém da equipa" segue a escolha que o
  // catálogo já faz para "steward" em `housingGroups.grid.sub`.
  "housingGroups.listings.locked.title": "Os quartos ficam dentro do grupo",
  "housingGroups.listings.locked.none":
    "Este grupo guarda os quartos partilhados aqui para quem já deixou entrar. Pede para entrar e alguém da equipa vem dizer olá.",
  "housingGroups.listings.locked.pending":
    "O teu pedido para entrar ainda está com a equipa do grupo. Os quartos partilhados aqui abrem-se assim que alguém disser que sim.",
  "housingGroups.listings.locked.declined":
    "O teu pedido para entrar não foi aprovado, por isso os quartos partilhados aqui ficam dentro do grupo.",
  "housingGroups.listings.perMonth": "€{price} / mês",
  "housingGroups.listings.accessLabel": "Acessibilidade:",
  "housingGroups.listings.empty":
    "Sem quartos listados de momento. Entra para seres o primeiro a ver o próximo.",

  // ── Entrar num grupo de habitação — pedido triado (Wave A) ──
  "joinGroup.ariaLabel": "Pedir para entrar em {name}",
  "joinGroup.eyebrow": "Pedir para entrar",
  "joinGroup.title": "Pedir para entrar em <em>{name}</em>",
  "joinGroup.sub":
    "Alguém da equipa lê cada pedido. Conta-lhes um pouco sobre ti, não há respostas erradas.",
  "joinGroup.nameLabel": "O teu nome",
  "joinGroup.namePlaceholder": "O nome por que te tratam",
  "joinGroup.relationshipLabel": "Como fazes parte da comunidade",
  "joinGroup.relationshipPlaceholder":
    "Um amigo respondeu por mim, já fui a alguns encontros…",
  "joinGroup.optional": "(opcional)",
  "joinGroup.disclaimer":
    "As tuas respostas são vistas apenas pela equipa do grupo, nunca publicadas.",
  "joinGroup.cancel": "Cancelar",
  "joinGroup.sending": "A enviar…",
  "joinGroup.sendCta": "Enviar pedido",
  "joinGroup.error": "Não foi possível enviar. Tenta daqui a pouco.",
  "joinGroup.success.title": "O teu pedido está <em>feito.</em>",
  "joinGroup.success.closeLabel": "Concluído",
  "joinGroup.success.body":
    "Alguém da equipa de <strong>{name}</strong> vai analisá-lo e responder-te. Terás notícias na tua caixa de entrada.",

  // ── Cooperativa de habitação — marca de operador verificado (Wave A) ──
  "housingCoop.operatorVerified": "Operador verificado",

  // ── 2026-08-21 code-review 4.6 fixes ──
  "placeholder.notSet": "Sem dados",
  "member.fallbackName": "Uma pessoa da comunidade",
  "housing.fact.rent": "Renda",
  // PRD-250. Só aparece quando quem anuncia indicou mesmo uma caução.
  "housing.fact.deposit": "Caução",
  "housing.fact.rentPerMonth": "{amount} / mês",
  "housing.fact.area": "Zona",
  "housing.fact.available": "Disponível",
  "housing.fact.availableNow": "Já",
  "housing.fact.minimumStay": "Estadia mínima",
  "housing.fact.minimumStayMonths_one": "{count} mês",
  "housing.fact.minimumStayMonths_other": "{count} meses",
  "housing.fact.bills": "Despesas",
  "housing.fact.billsIncluded": "Incluídas",
  "housing.fact.billsNotIncluded": "Não incluídas",
  "housing.beds.count_one": "{count} quarto",
  "housing.beds.count_other": "{count} quartos",
  "housing.period.month": "mês",
  "housing.lister.memberSince": "Aqui desde {year}",
  "company.badge.queerRun": "Gerida por pessoas queer",
  "company.badge.queerRunVerified": "Gerida por pessoas queer · verificada",
  "company.badge.queerLed": "Liderada por pessoas queer",
  "company.badge.queerLedVerified": "Liderada por pessoas queer · verificada",
  "company.badge.verified": "Verificada",
  "company.badge.employer": "Entidade empregadora",
  "company.reviews.starsBar_one": "{count} estrela",
  "company.reviews.starsBar_other": "{count} estrelas",
  "company.stats.founded": "Fundada em",
  "company.stats.people_one": "Pessoa",
  "company.stats.people_other": "Pessoas",
  "company.stats.avgReview_one": "Avaliação média · {count} avaliação",
  "company.stats.avgReview_other": "Avaliação média · {count} avaliações",
  "company.stats.noScore": "Sem nota",
  "company.membersLabel_one": "Ver {count} membro",
  "company.membersLabel_other": "Ver os {count} membros",
  "company.hiringContact.fallbackName": "A equipa",
  "company.hiringContact.fallbackRole":
    "As candidaturas são lidas pela equipa daqui.",
  "landlord.recommendation.when": "Recomendação de {date}",
  // PRD-249. Precisão ao mês. "Diz que": a plataforma relata uma afirmação, não
  // a confirma.
  "landlord.recommendation.tenancy.range": "Diz que arrendou de {from} a {to}",
  "landlord.recommendation.tenancy.ongoing": "Diz que arrenda desde {from}",
  "landlord.recommendation.reply.published": "Publicado pela equipa, {date}",
  "housingCoop.card.phaseLabel": "Fase {number} · {phase}",
  "housingCoop.card.phaseWord.forming": "formação",
  "housingCoop.card.phaseWord.legal": "constituição legal",
  "housingCoop.card.phaseWord.finance": "financiamento",
  "housingCoop.card.phaseWord.property": "imóvel",
  "housingCoop.card.phaseWord.daily": "dia a dia",
  "housingCoop.card.cta.join": "Pedir para entrar",
  "housingCoop.card.cta.updates": "Ler novidades",
  "housingCoop.card.cta.mentor": "Pedir mentoria",
  "housingCoop.card.location_one": "{area}, {city} · {count} agregado",
  "housingCoop.card.location_other": "{area}, {city} · {count} agregados",
  "housingCoop.card.meta.targetShares": "Quotas-alvo",
  "housingCoop.card.meta.memberShares": "Quotas dos membros",
  "housingCoop.card.meta.monthly": "Mensal",
  "housingCoop.card.meta.operating": "Em funcionamento",
  "housingCoop.card.meta.formingSince": "Em formação desde",
  "housingCoop.card.operationalSince": "A funcionar desde",
  "housingCoop.card.progressThrough": "<em>{percent}</em> concluído",
  "housingCoop.card.duration.years_one": "{count} ano",
  "housingCoop.card.duration.years_other": "{count} anos",
  "housingCoop.card.duration.months_one": "{count} mês",
  "housingCoop.card.duration.months_other": "{count} meses",
  "housingCoop.card.duration.justOpened": "abriu agora",
  "tax.disclaimer":
    "Informação geral, sem valor de aconselhamento fiscal ou jurídico. As regras " +
    "mudam e cada situação é diferente. Confirma com um contabilista certificado " +
    "antes de te guiares por isto.",
  "tax.retentionRate.23": "23% (valor por defeito desde 2025)",
  "tax.retentionRate.25": "25% (opcional)",
  "tax.retentionRate.16_5": "16,5% (propriedade intelectual ou industrial)",
  "tax.retentionRate.11_5": "11,5% (atividades fora da tabela do art. 151.º)",
  "tax.retentionRate.0": "Sem retenção (dispensa, art. 101.º-B)",
  "postJob.step3.maxPlaceholder": "Opcional",
  "postJob.confirm.share.linkCopied": "Copiado",
  "postJob.confirm.share.toastLinkFailed":
    "Não conseguimos aceder à área de transferência. Abre o anúncio e copia o link da barra de endereço do navegador.",
  "rateBoard.eyebrow": "Neste dispositivo",
  "housingCoop.empty.bodyComingSoon":
    "É aqui que vais encontrar grupos a organizar habitação em conjunto. Ainda ninguém começou uma por aqui, e publicar que estás a começar abre em breve.",
  "housingCoop.startCta.comingSoonNote":
    "Publicar que estás a começar abre em breve. Até lá, podes pedir para entrar em qualquer cooperativa já em formação aqui em cima.",
  "myHousingListings.edit.backToReviewWarning":
    "Este anúncio está publicado neste momento. Ao guardares uma alteração, ele volta para revisão e sai do quadro público até um moderador o aprovar de novo. Normalmente é rápido.",
  "myHousingListings.toast.backToReview":
    "Guardado. O teu anúncio voltou para revisão, por isso está fora do quadro até um moderador o aprovar.",
  // ── Anúncios em grupos de habitação: editar e retirar o teu (BE-HSG-20) ──
  "groupListing.manage.editCta": "Editar",
  "groupListing.manage.editAriaLabel": "Editar o anúncio {title}",
  "groupListing.manage.withdrawCta": "Retirar",
  "groupListing.manage.withdrawAriaLabel": "Retirar o anúncio {title}",

  "groupListing.edit.ariaLabel": "Editar o anúncio {title}",
  "groupListing.edit.eyebrow": "O teu quarto",
  "groupListing.edit.title": "Corrige <em>o teu anúncio</em>",
  "groupListing.edit.sub":
    "Corrige a renda, reescreve a descrição ou atualiza o que disseste sobre acessibilidade.",
  "groupListing.edit.backToReviewWarning":
    "Tudo neste formulário aparece na página do grupo, por isso guardar uma alteração envia o quarto de volta para revisão. Sai da página do grupo até um moderador o aprovar de novo. Normalmente é rápido.",
  "groupListing.edit.submitCta": "Guardar e enviar para revisão",
  "groupListing.edit.submitting": "A guardar…",

  "groupListing.field.titleLabel": "Quarto ou apartamento",
  "groupListing.field.titlePlaceholder":
    "Quarto soalheiro num apartamento partilhado",
  "groupListing.field.neighbourhoodLabel": "Zona",
  "groupListing.field.neighbourhoodPlaceholder": "Arroios",
  "groupListing.field.priceLabel": "Renda por mês",
  "groupListing.field.pricePlaceholder": "480",
  "groupListing.field.priceHint":
    "Um valor real em euros. Indicar a renda à partida é uma regra da casa por aqui.",
  "groupListing.field.priceError":
    "Indica um valor inteiro em euros, no mínimo 1.",
  "groupListing.field.descriptionLabel": "Como é o sítio",
  "groupListing.field.descriptionPlaceholder":
    "Quem lá vive, como é o apartamento, o que procuras em quem vier partilhar.",
  "groupListing.field.accessLabel": "Acessibilidade",
  "groupListing.field.accessPlaceholder":
    "Terceiro andar, sem elevador. A porta da casa de banho tem 70cm. Entrada do prédio sem degraus.",
  "groupListing.field.accessHint":
    "Descreve escadas, elevador, percursos sem degraus e larguras de porta com honestidade. Todos os anúncios aqui têm de o fazer.",

  "groupListing.withdraw.confirmTitle": "Retirar este quarto?",
  "groupListing.withdraw.confirmBody":
    "{title} sai da página do grupo para toda a gente. Isto não se pode desfazer, por isso publica outra vez se o quarto voltar a ficar livre.",
  "groupListing.withdraw.confirmCta": "Retirar o anúncio",

  "groupListing.toast.backToReview":
    "Guardado. O teu quarto voltou para revisão, por isso está fora da página do grupo até um moderador o aprovar.",
  "groupListing.toast.editFailed": "Não foi possível guardar essa alteração",
  "groupListing.toast.withdrawn":
    "Esse quarto está fora. Obrigade por manteres o grupo em ordem.",
  "groupListing.toast.withdrawFailed": "Não foi possível retirar esse anúncio",

  // ── Anúncios de grupo: publicar um quarto e ver onde estão os teus ──
  "groupListing.post.ariaLabel": "Publicar um quarto em {group}",
  "groupListing.post.eyebrow": "Partilhar um quarto",
  "groupListing.post.title": "Publica um quarto <em>no grupo</em>",
  "groupListing.post.sub":
    "Diz a quem está em {group} o que está livre, quanto custa e como é chegar ao sítio.",
  "groupListing.post.reviewNotice":
    "Um moderador lê todos os quartos antes de irem para a página do grupo. O teu fica em revisão até lá e nós dizemos-te aqui o que ficou decidido.",
  "groupListing.post.submitCta": "Enviar para revisão",
  "groupListing.post.submitting": "A enviar…",
  "groupListing.post.failed": "Não foi possível enviar esse quarto",
  "groupListing.post.success.title": "O teu quarto está",
  "groupListing.post.success.titleEm": "com um moderador",
  "groupListing.post.success.body":
    "Um moderador de <strong>{group}</strong> lê-o a seguir e ele vai para a página do grupo assim que for aprovado. De uma forma ou de outra, encontra-lo aqui nos teus quartos.",

  "groupListing.mine.title": "Os teus quartos",
  "groupListing.mine.titleEm": "neste grupo",
  "groupListing.mine.sub":
    "Tudo o que partilhaste aqui e em que ponto está cada um. Nada chega à página do grupo antes de um moderador o ler.",
  "groupListing.mine.postCta": "Publicar um quarto",
  "groupListing.mine.empty":
    "Ainda não partilhaste nenhum quarto aqui. Quando o fizeres, aparece neste sítio com o estado da revisão.",
  "groupListing.mine.postedOn": "Publicado a {date}",

  // PRD-242. Onde um membro vê o que aconteceu à sua candidatura a uma
  // cooperativa ou a um grupo de habitação. "Notificação" é sempre o sino: a
  // QueerPulse não envia email nenhum.
  "housingJoinRequests.coop.title": "As tuas candidaturas",
  "housingJoinRequests.coop.titleEm": "a cooperativas",
  "housingJoinRequests.coop.sub":
    "Todas as cooperativas a que pediste para entrar, e o ponto de situação de cada pedido. Recebes uma notificação assim que houver decisão.",
  "housingJoinRequests.group.title": "A tua candidatura",
  "housingJoinRequests.group.titleEm": "a este grupo",
  "housingJoinRequests.group.sub":
    "O ponto de situação do teu pedido para entrar. Recebes uma notificação assim que quem gere o grupo decidir.",
  "housingJoinRequests.askedOn": "Pedido em {date}",
  "housingJoinRequests.status.pending": "À espera de decisão",
  "housingJoinRequests.status.accepted": "Estás dentro",
  "housingJoinRequests.status.declined": "Desta vez não",
  "housingJoinRequests.outcome.pending":
    "Ainda ninguém decidiu. Assim que decidirem, aparece aqui.",
  "housingJoinRequests.outcome.accepted":
    "Foste aceite. O que vier a seguir parte de quem gere o espaço.",
  "housingJoinRequests.outcome.declined":
    "Este pedido não foi aprovado. Podes voltar a pedir mais tarde, ou ver os outros.",
  "joinCoop.success.whereToCheck":
    "Encontras esta candidatura, e a decisão sobre ela, mais abaixo nesta página.",
  "joinGroup.success.whereToCheck":
    "Encontras esta candidatura, e a decisão de quem gere o grupo, no topo da página do grupo.",

  "groupListing.mine.status.review": "À espera de revisão",
  "groupListing.mine.status.question": "Uma pergunta para ti",
  "groupListing.mine.status.live": "Na página do grupo",
  "groupListing.mine.status.declined": "Não publicado",
  "groupListing.mine.status.takenDown": "Retirado",

  "groupListing.mine.decision.question": "Um moderador perguntou-te uma coisa",
  "groupListing.mine.decision.declined": "Porque é que este não vai para o ar",
  "groupListing.mine.decision.takenDown": "Porque é que este foi retirado",
  "groupListing.mine.decision.questionHint":
    "Responde a editar o quarto. Ao guardares, ele volta para as mãos de um moderador.",
  "groupListing.mine.decision.editHint":
    "Edita o quarto para corrigir o que está indicado aqui. Ao guardares, ele volta para as mãos de um moderador.",

  // ── Recomendações de senhorios: retirar a tua (BE-HSG-18) ──
  "landlordPage.recommendation.yoursBadge": "Tua",
  "landlordPage.recommendation.withdrawCta": "Retirar",
  "landlordPage.withdraw.confirmTitle": "Retirar a tua recomendação?",
  "landlordPage.withdraw.confirmBody":
    "Sai da página de {name} e deixa de contar para a avaliação. Podes escrever outra quando quiseres.",
  "landlordPage.withdraw.confirmCta": "Retirar",
  "landlordPage.toast.recommendationWithdrawn": "A tua recomendação está fora.",
  "landlordPage.toast.withdrawFailed":
    "Não foi possível retirar essa recomendação",

  // ── Consola de candidaturas do lado de quem publica (BE-HSG-16) ──
  "jobDetail.sidebar.reviewApplicationsCta": "Ver candidaturas",
  "jobApplications.eyebrow": "Candidaturas",
  "jobApplications.fallbackJobTitle": "O teu anúncio",
  "jobApplications.countTotal_one": "{count} pessoa candidatou-se.",
  "jobApplications.countTotal_other": "{count} pessoas candidataram-se.",
  "jobApplications.countWaiting_one": "{count} está à espera de uma decisão.",
  "jobApplications.countWaiting_other":
    "{count} estão à espera de uma decisão.",
  "jobApplications.countWaitingNone": "Neste momento não há nada à tua espera.",
  "jobApplications.notifyNote":
    "Quem aceitares ou recusares recebe uma mensagem direta tua, por isso fica atento à tua caixa de entrada para a resposta.",
  "jobApplications.viewListing": "Ver o anúncio",
  "jobApplications.appliedOn": "Candidatou-se a {date}",
  "jobApplications.applicantRemoved": "Alguém que entretanto saiu",
  "jobApplications.status.submitted": "Nova",
  "jobApplications.status.reviewing": "Em análise",
  "jobApplications.status.accepted": "Aceite",
  "jobApplications.status.declined": "Recusada",
  "jobApplications.action.startReview": "Começar a analisar",
  "jobApplications.action.decline": "Recusar",
  "jobApplications.action.accept": "Aceitar",
  "jobApplications.decisionFinal":
    "Esta decisão é final e a pessoa já foi avisada.",
  "jobApplications.decideFailed": "Não foi possível atualizar essa candidatura",
  "jobApplications.confirmAccept.title": "Aceitar esta candidatura?",
  "jobApplications.confirmAccept.body":
    "A pessoa recebe uma mensagem direta tua a dizê-lo. Aceitar é final, por isso pensa um momento antes.",
  "jobApplications.confirmAccept.cta": "Aceitar",
  "jobApplications.confirmDecline.title": "Recusar esta candidatura?",
  "jobApplications.confirmDecline.body":
    "A pessoa recebe uma mensagem direta tua a dizê-lo. Recusar é final, e uma palavra amável na tua resposta faz toda a diferença.",
  "jobApplications.confirmDecline.cta": "Recusar",
  "jobApplications.empty.title": "Ainda sem candidaturas",
  "jobApplications.empty.description":
    "Quando alguém se candidatar, aparece aqui, com o que te tiver escrito.",
  "jobApplications.forbidden.title": "Este anúncio é de outra pessoa",
  "jobApplications.forbidden.description":
    "Só quem publicou uma vaga pode ler as candidaturas dela. Se o anúncio é teu, entra com a conta com que o publicaste.",
  "jobApplications.forbidden.cta": "Voltar ao quadro",
  "jobApplications.missing.title": "Esse anúncio já não existe",
  "jobApplications.missing.description":
    "Pode ter sido retirado. Vê o que mais está aberto.",
  "jobApplications.error.title": "Não conseguimos carregar as candidaturas",
  "jobApplications.error.description":
    "Algo correu mal do nosso lado. Tenta outra vez daqui a pouco.",
  "jobApplications.error.retry": "Tentar outra vez",

  // ── Paginação da bolsa de competências + caixa de propostas de quem publica ──
  "barter.loadMore": "Ver mais trocas",
  "barter.loadingMore": "A carregar mais trocas…",

  "barterProposals.entryLink": "As tuas trocas e propostas",
  "barterProposals.eyebrow": "Bolsa de competências",
  "barterProposals.title": "Propostas nas tuas trocas",
  "barterProposals.countListings_one": "{count} troca publicada.",
  "barterProposals.countListings_other": "{count} trocas publicadas.",
  "barterProposals.countWaiting_one": "{count} proposta está à tua espera.",
  "barterProposals.countWaiting_other": "{count} propostas estão à tua espera.",
  "barterProposals.countWaitingNone":
    "Não tens nada à espera de resposta neste momento.",
  "barterProposals.backToBoard": "Voltar à bolsa de competências",
  "barterProposals.pickerLegend": "Escolhe qual das tuas trocas queres ler",
  "barterProposals.pendingBadgeLabel_one": "{count} proposta à espera",
  "barterProposals.pendingBadgeLabel_other": "{count} propostas à espera",
  "barterProposals.proposedOn": "Proposta a {date}",
  "barterProposals.proposerRemoved": "Um membro que entretanto saiu",
  "barterProposals.status.pending": "À tua espera",
  "barterProposals.status.accepted": "Aceite",
  "barterProposals.status.declined": "Recusada",
  "barterProposals.action.accept": "Aceitar",
  "barterProposals.action.decline": "Recusar",
  "barterProposals.decisionFinal":
    "Esta resposta é final e a pessoa já foi avisada.",
  "barterProposals.confirmAccept.title": "Aceitar esta troca?",
  "barterProposals.confirmAccept.body":
    "A pessoa recebe a tua resposta nas mensagens, onde podem combinar a troca em conjunto. Aceitar é definitivo, por isso pensa um momento.",
  "barterProposals.confirmAccept.cta": "Aceitar",
  "barterProposals.confirmDecline.title": "Recusar esta troca?",
  "barterProposals.confirmDecline.body":
    "A pessoa recebe a tua resposta nas mensagens. Recusar é definitivo, e uma palavra simpática faz toda a diferença.",
  "barterProposals.confirmDecline.cta": "Recusar",
  "barterProposals.decide.errorFailed":
    "A tua resposta não ficou guardada. Tenta outra vez daqui a pouco.",
  "barterProposals.decide.errorNotOwner":
    "Esta troca é de outra pessoa, por isso só ela pode responder às propostas.",
  "barterProposals.decide.errorGone":
    "Esta troca ou esta proposta já não existe. Atualiza para veres o que ainda cá está.",
  "barterProposals.decide.errorAlreadyDecided":
    "Esta proposta já tem resposta. Atualiza para veres como ficou.",
  "barterProposals.empty.title": "Ainda não há propostas nesta troca",
  "barterProposals.empty.description":
    "Quando alguém propuser uma troca aparece aqui, com o que te escreveu.",
  "barterProposals.noListings.title": "Ainda não publicaste nenhuma troca",
  "barterProposals.noListings.description":
    "Põe alguma coisa em cima da mesa e as propostas de outros membros chegam aqui.",
  "barterProposals.noListings.cta": "Ir para a bolsa de competências",
  "barterProposals.forbidden.title": "Esta troca é de outra pessoa",
  "barterProposals.forbidden.description":
    "Só quem publicou uma troca pode ler as suas propostas. Se esta é tua, entra com a conta com que a publicaste.",
  "barterProposals.missing.title": "Essa troca já não existe",
  "barterProposals.missing.description":
    "Pode ter sido retirada do quadro. Vê o que mais há na bolsa.",
  "barterProposals.error.title": "Não conseguimos carregar as propostas",
  "barterProposals.error.description":
    "Algo correu mal do nosso lado. Tenta outra vez daqui a pouco.",
  "barterProposals.error.retry": "Tentar outra vez",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-35 — PRD-35 - taking down your own flatmate profile, from the profile editor's danger zone. The confirm copy states only what DELETE /flatmate-profiles/mine actually does: the profile row goes, every like and pass pointing at it cascades away (so any mutual match ends), and conversations already opened by a say-hello survive as ordinary DMs. pt-PT reuses the catalogue's existing terms: 'quadro de colegas de casa' for the board, 'perfil' for the profile. Also adds the edit-mode heading, lede and submit label for the same form, which said 'Post your profile' over an existing profile.
  // PRD-42+43 — PRD-42/43 - the barter poster's own index (MyBarterPage), the correction form (EditBarterPage) and its shared fields, plus the board's link into them. Plural keys use the _one/_other pair the rest of this catalog uses.
  // PRD-44 — PRD-44 - the poster's own jobs index (/work/jobs/mine) and the edit form (/work/jobs/:slug/edit). `myJobs.hub.*` backs the Work hub card, `myJobs.entryLink` the jobs-board link. `myJobs.hub.primary` is a CLDR plural (_one/_other).
  // PRD-47a — PRD-47a - the employer's right of reply to a review of them. The reply block on the company page reviews tab (CompanyReviewReply.tsx), the owner's compose/edit affordance, the edited-after-reply notice, the per-review report control, and the read-only reply block on the employer reviews page card (EmployerReviewCard.tsx).
  // PRD-47b — PRD-47b - the lister's right of reply under a review on a housing listing, plus the honest load-failure and edited-after-reply states. Rendered by HousingReviewList / HousingReviewCard / HousingReviewReply. Existing keys under economy:housingViewing.reviews.* (heading, empty, outOf, count, anonymous, ratingAria) are reused unchanged.
  "flatmateDangerZone.heading": "Zona de risco",
  "flatmateDangerZone.takeDown.label": "Retirar o teu perfil do quadro",
  "flatmateDangerZone.takeDown.text":
    "Já encontraste casa, ou queres os teus pronomes, etiquetas de identidade, respostas sobre a casa e orçamento fora de um quadro aberto a toda a comunidade? Podes remover o teu perfil quando quiseres. Não há como voltar atrás.",
  "flatmateDangerZone.takeDown.cta": "Retirar perfil",
  "flatmateDangerZone.confirm.title": "Retirar o teu perfil de colega de casa?",
  "flatmateDangerZone.confirm.body":
    "O teu perfil sai do quadro de colegas de casa de imediato, com tudo o que tem: pronomes, identidade de género, necessidades de espaço seguro, respostas sobre a casa, bairro e orçamento. Todos os gostos e passes que outras pessoas deram nele vão também, por isso qualquer correspondência que tivesses termina.",
  "flatmateDangerZone.confirm.keeps":
    "As conversas que já começaste ficam nas Mensagens para as duas pessoas. Podes publicar um novo perfil mais tarde, e começa vazio.",
  "flatmateDangerZone.confirm.cta": "Retirar",
  "flatmateDangerZone.confirm.retryCta": "Tentar de novo",
  "flatmateDangerZone.confirm.error":
    "Não foi possível retirar o teu perfil. Continua no quadro. Tenta de novo.",
  "flatmateDangerZone.toast.deleted":
    "O teu perfil de colega de casa saiu do quadro.",
  "postProfileForm.editTitle": "O teu perfil de colega de casa",
  "postProfileForm.editSub":
    "Muda o que quiseres aqui e guarda, e o quadro atualiza de imediato. Também podes retirar o perfil todo, em baixo.",
  "postProfileForm.editSubmitCta": "Guardar alterações",
  "barter.hero.mineCta": "As tuas trocas e as propostas que enviaste",
  "myBarter.eyebrow": "A tua troca de saberes",
  "myBarter.title": "As tuas <em>trocas</em>",
  "myBarter.sub":
    "As trocas que publicaste e as propostas que fizeste nas trocas de outras pessoas.",
  "myBarter.backToBoard": "Voltar ao mural",
  "myBarter.posted.heading": "Trocas que publicaste",
  "myBarter.posted.status.open": "No mural",
  "myBarter.posted.status.closed": "Fechada",
  "myBarter.posted.waiting_one": "{count} proposta espera resposta tua.",
  "myBarter.posted.waiting_other": "{count} propostas esperam resposta tua.",
  "myBarter.posted.noneWaiting": "Nenhuma proposta a aguardar resposta.",
  "myBarter.posted.actions.proposals": "Ler propostas",
  "myBarter.posted.actions.edit": "Editar",
  "myBarter.posted.actions.view": "Ver no mural",
  "myBarter.posted.actions.close": "Retirar do mural",
  "myBarter.posted.empty.title": "Ainda nao publicaste nenhuma troca",
  "myBarter.posted.empty.description":
    "Publica o que sabes fazer e o que gostavas de receber em troca. E no mural que as pessoas se encontram.",
  "myBarter.posted.empty.cta": "Ir para o mural",
  "myBarter.posted.error.title":
    "Nao conseguimos carregar as trocas que publicaste",
  "myBarter.posted.error.body":
    "O pedido nao chegou. As tuas trocas continuam la.",
  "myBarter.sent.heading": "Propostas que enviaste",
  "myBarter.sent.status.pending": "A aguardar resposta",
  "myBarter.sent.status.accepted": "Aceite",
  "myBarter.sent.status.declined": "Recusada",
  "myBarter.sent.sentOn": "Enviada a {date}",
  "myBarter.sent.answeredOn": "respondida a {date}",
  "myBarter.sent.editedAfter":
    "Quem publicou alterou esta troca depois da tua proposta. Confirma que ainda te serve antes de avancares.",
  "myBarter.sent.listingGone": "Esta troca ja nao esta no mural",
  "myBarter.sent.unknownPoster": "Membro",
  "myBarter.sent.actions.view": "Ver a troca",
  "myBarter.sent.actions.thread": "Abrir a conversa",
  "myBarter.sent.empty.title": "Ainda nao propuseste nenhuma troca",
  "myBarter.sent.empty.description":
    "Quando propuseres uma troca a alguem, ela aparece aqui com a resposta que receberes.",
  "myBarter.sent.empty.cta": "Ver o mural",
  "myBarter.sent.error.title":
    "Nao conseguimos carregar as propostas que enviaste",
  "myBarter.sent.error.body":
    "O pedido nao chegou. As tuas propostas continuam la.",
  "myBarter.close.confirmTitle": "Retirar esta troca do mural?",
  "myBarter.close.confirmBody":
    "Deixa de receber novas propostas. As propostas que ja tem ficam como estao e nao ha forma de a voltar a publicar.",
  "myBarter.close.confirmCta": "Retirar",
  "myBarter.close.done": "A troca saiu do mural.",
  "myBarter.close.errorNotYours":
    "Nao publicaste esta troca, por isso nao a podes fechar.",
  "myBarter.close.errorGone": "Esta troca ja nao existe.",
  "myBarter.close.errorFailed":
    "Nao conseguimos fechar a troca. Tenta novamente.",
  "barterEdit.back": "Voltar as tuas trocas",
  "barterEdit.eyebrow": "A tua troca de saberes",
  "barterEdit.title": "Editar a tua <em>troca</em>",
  "barterEdit.sub":
    "Corrige um erro, afina as palavras ou muda o que estas a pedir.",
  "barterEdit.pendingNotice_one":
    "{count} pessoa ja propos algo nesta troca. Se mudares o que ofereces ou o que pedes, essa pessoa vai ver que a troca mudou depois da proposta.",
  "barterEdit.pendingNotice_other":
    "{count} pessoas ja propuseram algo nesta troca. Se mudares o que ofereces ou o que pedes, essas pessoas vao ver que a troca mudou depois da proposta.",
  "barterEdit.cancel": "Cancelar",
  "barterEdit.saveCta": "Guardar alteracoes",
  "barterEdit.saving": "A guardar",
  "barterEdit.field.mode": "O que e esta publicacao",
  "barterEdit.field.category": "Categoria",
  "barterEdit.field.offer": "O que ofereces",
  "barterEdit.field.offerHelper": "Uma linha. E o titulo que aparece no mural.",
  "barterEdit.field.offerDetail": "Mais sobre o que ofereces",
  "barterEdit.field.offerDetailHelper":
    "O que esta incluido, quanto, e como e trabalhar contigo.",
  "barterEdit.field.want": "O que procuras",
  "barterEdit.field.wantHelper":
    "Uma linha. O que para ti seria uma troca justa.",
  "barterEdit.field.wantDetail": "Mais sobre o que procuras",
  "barterEdit.field.wantDetailHelper":
    "O detalhe ajuda quem le a perceber se te consegue mesmo ajudar.",
  "barterEdit.field.tags": "Etiquetas",
  "barterEdit.field.tagsHelper": "Separa por virgulas. Ate oito.",
  "barterEdit.save.done": "A tua troca foi atualizada.",
  "barterEdit.save.errorInvalid":
    "Ha algo no formulario que ainda nao funciona. Confirma que cada lado da troca diz aquilo que anuncia.",
  "barterEdit.save.errorNotYours":
    "Nao publicaste esta troca, por isso nao a podes editar.",
  "barterEdit.save.errorGone": "Esta troca ja nao existe.",
  "barterEdit.save.errorFailed":
    "Nao conseguimos guardar as alteracoes. Tenta novamente.",
  "barterEdit.loadError.title": "Nao conseguimos carregar esta troca",
  "barterEdit.loadError.body": "O pedido nao chegou. A tua troca continua la.",
  "barterEdit.gone.title": "Esta troca desapareceu",
  "barterEdit.gone.body":
    "Ja nao esta no mural, por isso nao ha nada para editar.",
  "barterEdit.gone.cta": "Voltar as tuas trocas",
  "barterEdit.notYours.title": "Esta troca nao e tua",
  "barterEdit.notYours.body": "So quem publicou uma troca a pode alterar.",
  "barterEdit.notYours.cta": "Voltar ao mural",
  "myJobs.eyebrow": "Bolsa de trabalho",
  "myJobs.title": "Vagas <em>que publicaste.</em>",
  "myJobs.sub":
    "Tudo o que publicaste, aberto ou fechado. Corrige um detalhe, vê quem se candidatou ou retira uma vaga.",
  "myJobs.postCta": "Publicar outra vaga",
  "myJobs.entryLink": "Vagas que publicaste",
  "myJobs.noOrganization": "Sem empresa",
  "myJobs.status.open": "Aberta",
  "myJobs.status.closed": "Fechada",
  "myJobs.postedOn": "Publicada a {date}",
  "myJobs.postedRecently": "Publicada recentemente",
  "myJobs.closedHint": "já não aparece na bolsa",
  "myJobs.actions.view": "Ver anúncio",
  "myJobs.actions.edit": "Editar",
  "myJobs.actions.applications": "Candidaturas",
  "myJobs.actions.close": "Fechar",
  "myJobs.close.confirmTitle": "Fechar este anúncio?",
  "myJobs.close.confirmBody":
    "Sai da bolsa e deixa de receber candidaturas. Quem já se candidatou mantém a candidatura e continuas a poder lê-la.",
  "myJobs.close.confirmCta": "Fechar anúncio",
  "myJobs.toast.closed": "Anúncio fechado",
  "myJobs.toast.closeError": "Não foi possível fechar esse anúncio",
  "myJobs.empty.title": "Ainda não publicaste nenhuma vaga",
  "myJobs.empty.description":
    "Assim que publicares uma vaga, ela aparece aqui, com as candidaturas que reunir e uma forma de corrigir o que estiver errado.",
  "myJobs.empty.cta": "Publicar uma vaga",
  "myJobs.error.title": "Não foi possível carregar as tuas publicações",
  "myJobs.error.description":
    "Os teus anúncios continuam lá. O que falhou foi o pedido para os obter.",
  "myJobs.loadMore": "Carregar mais",
  "myJobs.loadingMore": "A carregar",
  "myJobs.hub.label": "Vagas que publicaste",
  "myJobs.hub.primary_one": "{count} vaga publicada",
  "myJobs.hub.primary_other": "{count} vagas publicadas",
  "myJobs.hub.next": "Edita-as ou vê quem se candidatou",
  "editJob.eyebrow": "A tua publicação",
  "editJob.title": "Editar <em>esta vaga.</em>",
  "editJob.sub":
    "Muda o que estiver errado. O anúncio mantém o mesmo endereço, por isso as ligações que já partilhaste continuam a funcionar.",
  "editJob.quietNote":
    "Guardar é discreto. Nada volta para revisão e ninguém que já se candidatou é notificado.",
  "editJob.section.role": "A vaga",
  "editJob.section.pay": "Remuneração",
  "editJob.section.whatYouOffer": "O que ofereces",
  "editJob.section.benefitsSub": "Benefícios que acompanham a vaga.",
  "editJob.section.inclusivitySub":
    "O que faz deste um sítio seguro para trabalhar.",
  "editJob.section.tagsSub": "Competências que procuras.",
  "editJob.section.screening": "Perguntas de triagem",
  "editJob.section.screeningSub":
    "Até três perguntas que todas as candidaturas respondem.",
  "editJob.section.contact": "Como te contactar",
  "editJob.field.title": "Título da vaga",
  "editJob.field.description": "Em que consiste a vaga",
  "editJob.field.descriptionHelper":
    "É este o texto que aparece no cartão da vaga.",
  "editJob.field.category": "Categoria",
  "editJob.field.commitment": "Regime",
  "editJob.field.seniority": "Nível",
  "editJob.field.format": "Onde se trabalha",
  "editJob.field.city": "Cidade",
  "editJob.field.timezone": "Sobreposição de fuso horário",
  "editJob.field.deadline": "Candidaturas até",
  "editJob.field.startDate": "Data de início",
  "editJob.field.startDateHelper":
    "Texto livre, por exemplo: assim que puderes.",
  "editJob.field.currency": "Moeda",
  "editJob.field.rateMin": "De",
  "editJob.field.rateMax": "Até",
  "editJob.field.ratePer": "Por",
  "editJob.field.hidePay": "Esconder os valores",
  "editJob.field.hidePayHelper":
    "O cartão passa a dizer Competitivo em vez de um intervalo.",
  "editJob.field.barter": "Aberto a troca",
  "editJob.field.barterHelper":
    "Considerarias uma troca de competências em vez de dinheiro.",
  "editJob.field.email": "Email",
  "editJob.field.link": "Ligação externa",
  "editJob.field.linkHelper": "Um endereço completo, começado por https.",
  "editJob.field.screeningQuestion": "Pergunta {index}",
  "editJob.screening.add": "Adicionar uma pergunta",
  "editJob.screening.remove": "Remover",
  "editJob.save": "Guardar alterações",
  "editJob.saving": "A guardar",
  "editJob.cancel": "Cancelar",
  "editJob.toast.saved": "Anúncio atualizado",
  "editJob.saveFailed": "Não foi possível guardar as alterações",
  "editJob.backToJobs": "Voltar às tuas publicações",
  "editJob.forbidden.title": "Esta publicação não é tua",
  "editJob.forbidden.description": "Só quem publicou uma vaga a pode editar.",
  "editJob.missing.title": "Esta publicação já não existe",
  "editJob.missing.description": "Foi retirada ou o endereço está errado.",
  "editJob.error.title": "Não foi possível carregar esta publicação",
  "editJob.error.description":
    "O anúncio continua lá. O que falhou foi o pedido para o obter.",
  "editJob.error.titleRequired": "Dá um título à vaga.",
  "editJob.error.titleTooLong": "Mantém o título abaixo de 200 caracteres.",
  "editJob.error.descriptionRequired": "Diz em que consiste a vaga.",
  "editJob.error.descriptionTooLong": "Essa descrição é demasiado longa.",
  "editJob.error.cityRequired": "Indica a cidade.",
  "editJob.error.rateRange": "O valor máximo não pode ser inferior ao mínimo.",
  "editJob.error.emailRequired":
    "Adiciona o email para onde as candidaturas devem escrever.",
  "editJob.error.linkRequired":
    "Adiciona a ligação que as candidaturas devem seguir.",
  "company.reviews.reply.employerResponseTitle":
    "Resposta da entidade empregadora",
  "company.reviews.reply.editedAfterReply":
    "Esta avaliacao foi alterada depois da resposta da entidade empregadora, por isso a resposta pode estar a responder a outras palavras.",
  "company.reviews.reply.replyCta": "Responder como entidade empregadora",
  "company.reviews.reply.editReplyCta": "Editar a tua resposta",
  "company.reviews.reply.placeholder":
    "Responde a esta avaliacao em publico. Quem ler a pagina vai ver a resposta em nome da entidade empregadora.",
  "company.reviews.reply.cancel": "Cancelar",
  "company.reviews.reply.save": "Publicar resposta",
  "company.reviews.reply.savingLabel": "A publicar...",
  "company.reviews.reply.successToast": "A tua resposta ja esta na pagina.",
  "company.reviews.reply.errorToast":
    "Nao foi possivel guardar a resposta. Tenta de novo.",
  "company.reviews.editedOn": "Editada a {date}",
  "company.reviews.report.cta": "Denunciar esta avaliacao",
  "company.reviews.report.ariaLabel":
    "Denunciar a avaliacao com o titulo {title}",
  "employerReviewCard.reply.title": "Resposta da entidade empregadora",
  "employerReviewCard.reply.editedAfterReply":
    "Esta avaliacao foi alterada depois da resposta da entidade empregadora, por isso a resposta pode estar a responder a outras palavras.",
  "housingReview.loadError.title":
    "Não foi possível carregar as avaliações desta casa",
  "housingReview.loadError.body":
    "As avaliações continuam lá. O pedido não chegou a responder. Tenta novamente daqui a pouco.",
  "housingReview.editedOn": "Editada a {date}",
  "housingReview.editedAfterReply":
    "Esta avaliação foi alterada depois de a resposta ter sido escrita, por isso a resposta pode estar a responder a outras palavras.",
  "housingReview.report.cta": "Denunciar esta avaliação",
  "housingReview.report.subjectName": "a avaliação de {name}",
  "housingReview.reply.listerResponseTitle": "Resposta de quem anuncia",
  "housingReview.reply.cta": "Responder a esta avaliação",
  "housingReview.reply.editCta": "Editar a tua resposta",
  "housingReview.reply.placeholder":
    "Responde por palavras tuas. Quem ler este anúncio vai ver a resposta.",
  "housingReview.reply.publicNote":
    "Uma resposta por avaliação, e é pública. Escrever de novo substitui a anterior.",
  "housingReview.reply.cancel": "Cancelar",
  "housingReview.reply.save": "Publicar resposta",
  "housingReview.reply.savingLabel": "A publicar...",
  "housingReview.reply.successToast": "A tua resposta está no anúncio.",
  "housingReview.reply.errorToast":
    "A tua resposta não foi guardada. Continua aqui, podes tentar de novo.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-35 — PRD-35 - taking down your own flatmate profile, from the profile editor's danger zone. The confirm copy states only what DELETE /flatmate-profiles/mine actually does: the profile row goes, every like and pass pointing at it cascades away (so any mutual match ends), and conversations already opened by a say-hello survive as ordinary DMs. pt-PT reuses the catalogue's existing terms: 'quadro de colegas de casa' for the board, 'perfil' for the profile. Also adds the edit-mode heading, lede and submit label for the same form, which said 'Post your profile' over an existing profile.
  // PRD-42+43 — PRD-42/43 - the barter poster's own index (MyBarterPage), the correction form (EditBarterPage) and its shared fields, plus the board's link into them. Plural keys use the _one/_other pair the rest of this catalog uses.
  // PRD-44 — PRD-44 - the poster's own jobs index (/work/jobs/mine) and the edit form (/work/jobs/:slug/edit). `myJobs.hub.*` backs the Work hub card, `myJobs.entryLink` the jobs-board link. `myJobs.hub.primary` is a CLDR plural (_one/_other).
  // PRD-47a — PRD-47a - the employer's right of reply to a review of them. The reply block on the company page reviews tab (CompanyReviewReply.tsx), the owner's compose/edit affordance, the edited-after-reply notice, the per-review report control, and the read-only reply block on the employer reviews page card (EmployerReviewCard.tsx).
  // PRD-47b — PRD-47b - the lister's right of reply under a review on a housing listing, plus the honest load-failure and edited-after-reply states. Rendered by HousingReviewList / HousingReviewCard / HousingReviewReply. Existing keys under economy:housingViewing.reviews.* (heading, empty, outOf, count, anonymous, ratingAria) are reused unchanged.

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // BLIND-EDIT — BLIND-EDIT: housing reviews close to edits at reveal. ONE key, and it is NOT wired by this agent, because there is no edit affordance anywhere in the housing UI to attach it to (verified: `updateHousingReview` in housingReviews.api.ts has zero callers, and `useHousingReviews.ts` exposes no edit hook). The only correct home for it is the blind note in `ReviewViewingModal.tsx`, which this agent does not own. Land it together with an edit affordance: on its own it promises a correction the UI cannot deliver. The exact insertion is in this agent's report.
  // LANDLORD-MOD — LANDLORD-MOD (PRD-47d) - the per-recommendation report control on the landlord page, and the byline of a recommendation whose author erased their account. The entry-level report control in the hero keeps its existing copy: this is the narrower one, so acting on it takes down one tenant's warning instead of every warning about that landlord. The formerMember string mirrors marketing:listBusiness.coManagers.formerMember word for word, so the same absence reads the same way wherever a member has left.
  // PRD-35 — PRD-35 - taking down your own flatmate profile, from the profile editor's danger zone. The confirm copy states only what DELETE /flatmate-profiles/mine actually does: the profile row goes, every like and pass pointing at it cascades away (so any mutual match ends), and conversations already opened by a say-hello survive as ordinary DMs. pt-PT reuses the catalogue's existing terms: 'quadro de colegas de casa' for the board, 'perfil' for the profile. Also adds the edit-mode heading, lede and submit label for the same form, which said 'Post your profile' over an existing profile.
  // PRD-42+43 — PRD-42/43 - the barter poster's own index (MyBarterPage), the correction form (EditBarterPage) and its shared fields, plus the board's link into them. Plural keys use the _one/_other pair the rest of this catalog uses.
  // PRD-44 — PRD-44 - the poster's own jobs index (/work/jobs/mine) and the edit form (/work/jobs/:slug/edit). `myJobs.hub.*` backs the Work hub card, `myJobs.entryLink` the jobs-board link. `myJobs.hub.primary` is a CLDR plural (_one/_other).
  // PRD-47a — PRD-47a - the employer's right of reply to a review of them. The reply block on the company page reviews tab (CompanyReviewReply.tsx), the owner's compose/edit affordance, the edited-after-reply notice, the per-review report control, and the read-only reply block on the employer reviews page card (EmployerReviewCard.tsx).
  // PRD-47b — PRD-47b - the lister's right of reply under a review on a housing listing, plus the honest load-failure and edited-after-reply states. Rendered by HousingReviewList / HousingReviewCard / HousingReviewReply. Existing keys under economy:housingViewing.reviews.* (heading, empty, outOf, count, anonymous, ratingAria) are reused unchanged.
  "housingViewing.review.editableUntilPublic":
    "Podes alterar o que escreveste até a tua avaliação ficar pública. A partir daí fica como a enviaste.",
  "landlordPage.recommendation.report.cta": "Denunciar esta recomendação",
  "landlordPage.recommendation.report.ariaLabel":
    "Denunciar a recomendação de {name}",
  "landlordPage.recommendation.formerMember": "Alguém que entretanto saiu",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // BLIND-EDIT-FE — BLIND-EDIT-FE: the member-facing half of the housing blind-review edit. NOTE: `housingViewing.review.editableUntilPublic` is NOT declared here, it is claimed by the BLIND-EDIT manifest, and this agent wires it exactly where that manifest recommended (appended after `housingViewing.review.blindNote` in the note block, now inside the shared `ReviewViewingForm`, so it shows on both the first submission and the correction). Keys below are new. `housingViewing.reviews.ratingAria` is reused as-is (existing CLDR plural).
  // BLIND-EDIT — BLIND-EDIT: housing reviews close to edits at reveal. ONE key, and it is NOT wired by this agent, because there is no edit affordance anywhere in the housing UI to attach it to (verified: `updateHousingReview` in housingReviews.api.ts has zero callers, and `useHousingReviews.ts` exposes no edit hook). The only correct home for it is the blind note in `ReviewViewingModal.tsx`, which this agent does not own. Land it together with an edit affordance: on its own it promises a correction the UI cannot deliver. The exact insertion is in this agent's report.
  // LANDLORD-MOD — LANDLORD-MOD (PRD-47d) - the per-recommendation report control on the landlord page, and the byline of a recommendation whose author erased their account. The entry-level report control in the hero keeps its existing copy: this is the narrower one, so acting on it takes down one tenant's warning instead of every warning about that landlord. The formerMember string mirrors marketing:listBusiness.coManagers.formerMember word for word, so the same absence reads the same way wherever a member has left.
  // PRD-35 — PRD-35 - taking down your own flatmate profile, from the profile editor's danger zone. The confirm copy states only what DELETE /flatmate-profiles/mine actually does: the profile row goes, every like and pass pointing at it cascades away (so any mutual match ends), and conversations already opened by a say-hello survive as ordinary DMs. pt-PT reuses the catalogue's existing terms: 'quadro de colegas de casa' for the board, 'perfil' for the profile. Also adds the edit-mode heading, lede and submit label for the same form, which said 'Post your profile' over an existing profile.
  // PRD-42+43 — PRD-42/43 - the barter poster's own index (MyBarterPage), the correction form (EditBarterPage) and its shared fields, plus the board's link into them. Plural keys use the _one/_other pair the rest of this catalog uses.
  // PRD-44 — PRD-44 - the poster's own jobs index (/work/jobs/mine) and the edit form (/work/jobs/:slug/edit). `myJobs.hub.*` backs the Work hub card, `myJobs.entryLink` the jobs-board link. `myJobs.hub.primary` is a CLDR plural (_one/_other).
  // PRD-47a — PRD-47a - the employer's right of reply to a review of them. The reply block on the company page reviews tab (CompanyReviewReply.tsx), the owner's compose/edit affordance, the edited-after-reply notice, the per-review report control, and the read-only reply block on the employer reviews page card (EmployerReviewCard.tsx).
  // PRD-47b — PRD-47b - the lister's right of reply under a review on a housing listing, plus the honest load-failure and edited-after-reply states. Rendered by HousingReviewList / HousingReviewCard / HousingReviewReply. Existing keys under economy:housingViewing.reviews.* (heading, empty, outOf, count, anonymous, ratingAria) are reused unchanged.
  "housingViewing.review.loading": "A carregar a tua avaliação.",
  "housingViewing.review.loadError.title":
    "Não foi possível carregar esta avaliação",
  "housingViewing.review.loadError.description":
    "Algo correu mal do nosso lado. Tenta novamente daqui a pouco.",
  "housingViewing.review.editAriaLabel": "A tua avaliação",
  "housingViewing.review.editEyebrow": "Ainda privada",
  "housingViewing.review.editTitle":
    "Alterar a tua avaliação sobre <em>{name}</em>",
  "housingViewing.review.editBody":
    "Corrige uma gralha, diz melhor o que querias dizer, muda a classificação. Ainda ninguém leu isto.",
  "housingViewing.review.saveChanges": "Guardar alterações",
  "housingViewing.review.saving": "A guardar...",
  "housingViewing.review.editSavedTitle": "Avaliação <em>atualizada.</em>",
  "housingViewing.review.editSavedBody":
    "As tuas alterações ficaram guardadas. Continua privada até <strong>{name}</strong> escrever a dela, ou até passarem duas semanas.",
  "housingViewing.review.editError":
    "Não foi possível guardar a alteração. Tenta novamente daqui a pouco.",
  "housingViewing.review.editNotYours":
    "Esta avaliação é de outra pessoa, por isso não pode ser alterada aqui.",
  "housingViewing.review.editMissing":
    "Esta avaliação já não existe, por isso não há nada para alterar.",
  "housingViewing.review.gonePublicEyebrow": "Já pública",
  "housingViewing.review.gonePublicTitle":
    "Esta avaliação já é <em>pública.</em>",
  "housingViewing.review.gonePublicBody":
    "Esta avaliação ficou pública, por isso já não pode ser alterada. Uma avaliação pode ser corrigida até ao momento em que fica pública.",
  "housingViewing.list.yourReview": "A tua avaliação",
};
