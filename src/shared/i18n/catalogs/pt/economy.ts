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
    "Ferramentas, mentoria e solidariedade para fundadoras, freelancers e profissionais queer — porque a independência económica faz parte da libertação queer.",
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
  "incubator.step.apply.title": "Candidatar",
  "incubator.step.apply.desc":
    "Uma candidatura curta — a tua ideia, onde estás, do que precisas. Sem necessidade de pitch deck. Decisão em 3 semanas.",
  "incubator.step.apply.meta": "Candidaturas abertas · Prazo 30 jul",
  "incubator.step.match.title": "Emparelhamento com mentoria",
  "incubator.step.match.desc":
    "Emparelhado com uma pessoa mentora da comunidade com base no teu setor, fase e naquilo que nos disseste que precisas. Encontram-se quinzenalmente durante seis meses.",
  "incubator.step.match.meta": "Set–fev · Sessões quinzenais",
  "incubator.step.cohort.title": "Sessões de coorte",
  "incubator.step.cohort.desc":
    "Workshops mensais com toda a coorte — jurídico, finanças, angariação de fundos, design — além de tempo para apoio entre pares e conversa honesta.",
  "incubator.step.cohort.meta": "Primeiro sábado de cada mês",
  "incubator.step.demo.title": "Noite de demonstração",
  "incubator.step.demo.desc":
    "Partilha o que construíste com a comunidade, investidores e imprensa. Baixo risco, alto apoio. Decides quanto revelar.",
  "incubator.step.demo.meta": "Março · Apenas por convite",

  // ── FreelanceTab (grelha de ferramentas) ────────────────────────────────
  "freelance.title": "Ferramentas para <em>freelancers.</em>",
  "freelance.sub":
    "Ferramentas reais e funcionais — criadas por e para freelancers queer em Portugal. Gratuitas, sem registo, e nada do que introduzires sai do teu dispositivo.",
  "freelance.section.documents": "Documentos que <em>te pagam.</em>",
  "freelance.section.numbers": "Conhece os teus <em>números.</em>",
  "freelance.section.together": "Mais fortes <em>juntas.</em>",

  "tool.invoice.title": "Gerador de faturas",
  "tool.invoice.desc":
    "Cria uma fatura-recibo limpa e correta para Portugal — NIF, opções de IVA, notas sobre a isenção do art. 53.º e a dispensa do art. 101.º-B — e guarda-a como PDF real. Os teus dados ficam guardados para a próxima vez.",
  "tool.invoice.cta": "Abrir gerador de faturas",
  "tool.contract.title": "Gerador de contratos",
  "tool.contract.desc":
    "Monta um contrato de prestação de serviços freelance cláusula a cláusula — âmbito, pagamento, propriedade intelectual, cancelamento, confidencialidade. Descarrega um PDF ou copia o texto para editar.",
  "tool.contract.cta": "Abrir gerador de contratos",
  "tool.scope.title": "Gerador de âmbito e orçamento",
  "tool.scope.desc":
    "Define exatamente o que vais entregar, o que não vais, revisões e prazos — acrescenta um preço para transformar tudo num orçamento. Exporta um PDF que evita a maioria dos conflitos.",
  "tool.scope.cta": "Abrir gerador de âmbito",
  "tool.reciboGuide.title": "Guia de recibos verdes",
  "tool.reciboGuide.desc":
    "Um guia em linguagem simples sobre o sistema fiscal para freelancers em Portugal — registo, retenção, IVA, Segurança Social e o teu primeiro ano. Sempre atualizado.",
  "tool.reciboGuide.cta": "Ler o guia",

  "tool.takeHome.title": "Calculadora de rendimento líquido",
  "tool.takeHome.desc":
    "Transforma o teu rendimento bruto de freelancer no que realmente ficas a ganhar — depois de IRS e Segurança Social, com os coeficientes do regime simplificado e os teus primeiros anos incluídos.",
  "tool.takeHome.cta": "Abrir calculadora",
  "tool.dayRate.title": "Calculadora de valor-dia",
  "tool.dayRate.desc":
    "Parte do rendimento de que precisas para chegar a um valor-dia (e por hora) que realmente te sustente — despesas gerais, dias não pagos e IVA incluídos.",
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
    "Compara o que realmente ficarias a ganhar como freelancer face a um salário equivalente — líquido por líquido, com os custos que um recibo de vencimento esconde.",
  "tool.comparator.cta": "Comparar",

  "tool.rateBoard.title": "Quadro de transparência de valores",
  "tool.rateBoard.desc":
    "Valores-dia anónimos partilhados pela comunidade, por função e experiência — para que ninguém tenha de adivinhar quanto cobrar. Acrescenta o teu, vê como te posicionas.",
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
    "Ainda não há nada partilhado para este setor. Limpa o filtro para ver todas as submissões — ou junta a tua para ajudar a próxima pessoa a negociar.",
  "salary.empty.clear": "Limpar filtros",
  "salary.disclaimer":
    "Todas as entradas são anónimas. Não é guardado nome, email nem empregador. As entradas são revistas por uma pessoa moderadora antes de aparecerem.",
  "salary.helpBody":
    "Ajuda a comunidade partilhando o que ganhas. Quantas mais entradas, mais útil isto se torna para todas as pessoas — sobretudo para quem está a começar a negociar.",
  "salary.submitLong": "Submeter o teu salário",
  "salary.submitToast": "Submetido de forma anónima — obrigada",

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
    "Candidata-te a uma vaga, encontra uma pessoa mentora ou guarda uma vaga e tudo se vai juntar aqui — candidaturas, subsídios, saberes e avaliações numa só vista.",
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
  "workHub.card.mentor.label": "Mentoria",
  "workHub.card.mentor.primary": "1 mentoria ativa",
  "workHub.card.mentor.next": "{count} pessoas mentoras com vagas abertas",
  "workHub.card.skills.label": "Troca de saberes",
  "workHub.card.skills.primary": "A ensinar 2 · A aprender 1",
  "workHub.card.skills.next": "Um novo pedido combina contigo",
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
    "Apareces às empresas exatamente como escolheres — e nunca de outra forma.",
  "workProfile.success.backCta": "Voltar ao teu espaço de trabalho",
  "workProfile.success.editCta": "Continuar a editar",
  "workProfile.eyebrow": "Perfil de trabalho",
  "workProfile.title": "Como apareces <em>no trabalho.</em>",
  "workProfile.sub":
    "Isto controla o que as empresas veem — e o que fica só contigo. Nada aqui é partilhado sem a tua autorização.",
  "workProfile.saveCta": "Guardar perfil de trabalho",
  "workProfile.savingLabel": "A guardar…",
  "workProfile.savedToast": "Perfil de trabalho guardado",
  "workProfile.saveFailedToast":
    "Não conseguimos guardar — as tuas definições ficaram exatamente como estavam. Tenta outra vez daqui a pouco.",

  "workProfile.card.meterLabel": "Perfil {percent}% completo",
  "workProfile.card.note":
    "Isto controla como apareces às empresas — e o que fica só contigo.",
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
    "As candidaturas usam o teu nome utilizado — nunca um nome legal.",
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
    "Negócios geridos por pessoas queer e empresas verificadas como inclusivas — vagas onde podes aparecer como és. Sem rainbow capitalism. Cada anúncio é validado pela comunidade.",
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
  "jobs.card.applyCta": "Candidatar →",
  "jobs.card.applyAriaLabel": "Candidatar a {title}",

  "jobs.safetyBanner.text":
    "Ajustado ao teu perfil de trabalho — a mostrar <strong>empresas verificadas como seguras</strong>.",
  "jobs.safetyBanner.link": "Alterar no teu perfil de trabalho",
  "jobs.safetyBanner.showVerified": "Mostrar só verificadas",
  "jobs.safetyBanner.showAll": "Mostrar todas",
  "jobs.safetyBanner.showAllCount": "Mostrar todas (mais {count})",

  "jobs.empty.title": "Nenhuma vaga corresponde neste momento",
  "jobs.empty.verifiedDescription":
    "Ainda não há nada verificado como seguro nesta categoria. Mostra todas as vagas ou escolhe outra categoria.",
  "jobs.empty.description":
    "Sem vagas nesta categoria de momento. Vê todas as vagas ou volta em breve — há anúncios novos todas as semanas.",
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
    "Conquistado, não reclamado. Confirmamos as políticas inclusivas no papel e cruzamos com pelo menos três avaliações anónimas de pessoas LGBTQ+ que ali trabalham ou trabalharam. Reavaliado todos os anos.",
  "safetyBadge.trans.label": "Amiga de pessoas trans",
  "safetyBadge.trans.blurb":
    "Prática documentada de inclusão trans: cuidados de saúde de afirmação de género no plano, um processo de mudança de nome e pronomes, e instalações neutras quanto ao género — confirmado por avaliações de quem lá trabalha.",
  "safetyBadge.out.label": "Seguro para te assumires",
  "safetyBadge.out.blurb":
    'A comunidade avalia esta empresa com 8+/10 em "seguro para te assumires no trabalho" — ser aberte sobre quem és aqui é um não-acontecimento, não um risco.',
  "safetyBadge.affiliation.run.label": "Gerida por pessoas queer",
  "safetyBadge.affiliation.run.blurb":
    "Liderada ou detida por pessoas queer — decisões, cultura e dinheiro ficam dentro da comunidade. Verificado durante a validação, não auto-declarado.",
  "safetyBadge.affiliation.friendly.label": "Amiga da comunidade queer",
  "safetyBadge.affiliation.friendly.blurb":
    "Uma empresa acolhedora, com políticas inclusivas e uma presença LGBTQ+ real — mas não liderada por pessoas queer. Bem-vinda, apenas não é detida pela comunidade.",

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
  "jobDetail.saveTitle": "Guardar anúncio",
  "jobDetail.savedToast": "Anúncio guardado no teu perfil.",
  "jobDetail.unsavedToast": "Anúncio removido das guardadas.",
  "jobDetail.chip.applyBy": "Candidaturas até {date}",

  "jobDetail.section.about": "Sobre a vaga",
  "jobDetail.section.dayToDay": "No dia a dia",
  "jobDetail.section.lookingFor": "O que procuramos",
  "jobDetail.section.offer": "O que oferecemos",
  "jobDetail.section.aboutCompany": "Sobre {company}",
  "jobDetail.section.viewCompany": "Ver perfil da empresa →",
  "jobDetail.section.safety": "Segurança",
  "jobDetail.section.safetyBody":
    "Como {company} é avaliada pela comunidade nas coisas que importam a profissionais queer.",
  "jobDetail.section.safetyReviews": "Ver avaliações de segurança →",

  "jobDetail.sidebar.salary": "Salário",
  "jobDetail.sidebar.type": "Tipo",
  "jobDetail.sidebar.location": "Localização",
  "jobDetail.sidebar.category": "Categoria",
  "jobDetail.sidebar.deadline": "Prazo",
  "jobDetail.sidebar.applyCta": "Candidatar agora →",

  // ── HousingPage / HousingBoard / HousingSections ───────────────────────
  "housing.tabs.housing": "Habitação",
  "housing.tabs.flatmates": "Colegas de casa",
  "housing.hero.eyebrow": "Quadro de Habitação · Lisboa",
  "housing.hero.title":
    "Encontra uma casa — e as pessoas com quem <em>a partilhar.</em>",
  "housing.hero.lead":
    "Um quadro de habitação específico para pessoas queer em Lisboa. Vê espaços para arrendar, ou encontra alguém com quem partilhes casa e possas ser tu mesme — tudo dentro da rede da comunidade.",
  "housing.hero.note":
    "Cada anúncio e perfil é publicado por uma pessoa membro verificada da QueerPulse",

  "housing.filter.all": "Todos os anúncios",
  "housing.filter.sublet": "Sublocação",
  "housing.filter.room": "Quarto partilhado",
  "housing.filter.short": "Curta duração",
  "housing.filter.studio": "Estúdio / apartamento inteiro",
  "housing.listSpaceCta": "+ Anunciar o teu espaço",

  "housing.empty.filteredTitle": "Sem anúncios deste tipo neste momento",
  "housing.empty.title": "O quadro de habitação está parado neste momento",
  "housing.empty.filteredDescription":
    "Ainda não há nada publicado nesta categoria. Limpa o filtro para ver todos os espaços abertos pela comunidade — há anúncios novos com frequência.",
  "housing.empty.description":
    "Ainda não há espaços publicados. Quando as pessoas partilharem sublocações, quartos partilhados e estadias de curta duração, vão aparecer aqui — volta em breve, ou anuncia o teu próprio espaço.",
  "housing.empty.clearFilters": "Limpar filtros",
  "housing.empty.listSpace": "Anunciar um espaço",
  "housing.listing.photoAlt": "Foto · {hood}",
  "housing.listing.from": "A partir de {date}",

  "housing.landlords.heading":
    "Pessoas proprietárias <em>com aval da comunidade</em>",
  "housing.landlords.subtitle":
    "A comunidade já confirmou que estas pessoas proprietárias são queer-friendly, de confiança e justas. Não é uma garantia — faz sempre a tua própria verificação.",
  "housing.landlords.endorsedBadge": "Aval da comunidade",

  "housing.tipsHeading":
    "Habitação em Lisboa — <em>o que precisas de saber</em>",
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
    "Pessoas a comprar e gerir casas em conjunto — como se formam as cooperativas, e como te podes juntar a uma.",

  // ── HousingModals (mensagem à pessoa anunciante / recomendar) ──────────
  "housingModal.close": "Fechar",
  "housingModal.charsToSend_one": "Falta mais {count} caráter para enviar",
  "housingModal.charsToSend_other": "Faltam mais {count} carateres para enviar",
  "housingModal.charsToSubmit_one": "Falta mais {count} caráter para submeter",
  "housingModal.charsToSubmit_other":
    "Faltam mais {count} carateres para submeter",
  "housingModal.charsCount_one": "{count} caráter",
  "housingModal.charsCount_other": "{count} carateres",
  "housingModal.cancel": "Cancelar",
  "housingModal.done": "Concluído",

  "housingModal.message.ariaLabel": "Enviar mensagem a quem anunciou",
  "housingModal.message.successTitle": "Mensagem <em>enviada.</em>",
  "housingModal.message.successBody":
    "A tua mensagem está a caminho de <strong>{toName}</strong>, que costuma responder <strong>{responseTime}</strong>. Vais receber aqui uma notificação quando o fizer. Os contactos são partilhados assim que ambas as partes concordarem em avançar.",
  "housingModal.message.eyebrow": "Enviar mensagem a quem anunciou",
  "housingModal.message.title": "Enviar mensagem a <em>{toName}</em>",
  "housingModal.message.body":
    "Sobre <strong>{listingTitle}</strong>. Mantém um tom humano — uma frase sobre quem és e porque te interessa já ajuda muito. O teu perfil é partilhado com a mensagem.",
  "housingModal.message.note":
    "Para tua segurança, mantém a conversa dentro da QueerPulse até se terem conhecido pessoalmente. Nunca envies um depósito antes de visitar o espaço.",
  "housingModal.message.send": "Enviar mensagem",

  "housingModal.recommend.ariaLabel": "Recomendar uma pessoa proprietária",
  "housingModal.recommend.successTitle": "Agradecemos. <em>Registada.</em>",
  "housingModal.recommend.successBody":
    "A tua recomendação para <strong>{landlordName}</strong> vai aparecer assim que uma pessoa moderadora confirmar que arrendaste com esta pessoa — é assim que o quadro se mantém de confiança. É este tipo de gesto que torna a mudança de casa de alguém muito mais segura.",
  "housingModal.recommend.eyebrow": "Recomendar uma pessoa proprietária",
  "housingModal.recommend.title": "Recomendar <em>{landlordName}</em>",
  "housingModal.recommend.body":
    "Arrendaste com esta pessoa e correu bem. Conta a outras pessoas da comunidade o que podem esperar — os pormenores concretos e úteis que gostavas de ter sabido antes.",
  "housingModal.recommend.ratingLabel": "A tua avaliação",
  "housingModal.recommend.starAriaLabel_one": "{count} estrela",
  "housingModal.recommend.starAriaLabel_other": "{count} estrelas",
  "housingModal.recommend.whatShouldKnow":
    "O que devem saber as outras pessoas?",
  "housingModal.recommend.placeholder":
    "Como foram as reparações, os contratos, os depósitos? Foi respeitada a tua privacidade e as tuas relações? Os pormenores ajudam.",
  "housingModal.recommend.note":
    "As recomendações são verificadas antes de aparecerem. Recomenda apenas pessoas proprietárias com quem tenhas mesmo arrendado.",
  "housingModal.recommend.submit": "Submeter recomendação",

  // ── ListSpaceModal ──────────────────────────────────────────────────────
  "listSpace.type.sublet": "Sublocação",
  "listSpace.type.room": "Quarto partilhado",
  "listSpace.type.short": "Curta duração",
  "listSpace.type.studio": "Estúdio / apartamento inteiro",
  "listSpace.success.title": "Anúncio",
  "listSpace.success.em": "submetido.",
  "listSpace.success.body":
    "Obrigade por partilhares <strong>{title}</strong>. Uma pessoa moderadora verifica todos os anúncios antes de entrarem no ar — normalmente dentro de um dia — para o quadro se manter de confiança para todas as pessoas à procura de um lugar seguro para viver.",
  "listSpace.eyebrow": "Quadro de habitação",
  "listSpace.title": "Anuncia o teu <em>espaço.</em>",
  "listSpace.sub":
    "Abre o teu espaço a uma pessoa verificada da comunidade. Só precisas de alguns detalhes agora — podes acrescentar fotos assim que for aprovado.",
  "listSpace.titleLabel": "Título do anúncio *",
  "listSpace.titlePlaceholder":
    "ex.: Quarto soalheiro numa casa partilhada queer",
  "listSpace.areaLabel": "Bairro / zona *",
  "listSpace.areaPlaceholder": "ex.: Arroios, Lisboa",
  "listSpace.rentLabel": "Renda mensal (€) *",
  "listSpace.rentPlaceholder": "ex.: 650",
  "listSpace.typeLabel": "Tipo de espaço *",
  "listSpace.chooseOne": "Escolhe uma opção…",
  "listSpace.note":
    "Os anúncios são revistos antes de aparecerem. Nunca peças um depósito antes de a pessoa visitar o espaço pessoalmente.",
  "listSpace.submitting": "A submeter…",
  "listSpace.submitCta": "Submeter anúncio",

  // ── HousingListingPage (+ secções) ─────────────────────────────────────
  "housingListing.back": "← Quadro de habitação",
  "housingListing.section.about": "Sobre este espaço",
  "housingListing.section.features": "Características",
  "housingListing.section.facts": "Factos",
  "housingListing.section.idealFor": "Ideal para",
  "housingListing.messageCtaArrow": "Enviar mensagem a {name} →",
  "housingListing.messageCta": "Enviar mensagem a {name}",
  "housingListing.listedBy": "Anunciado por",
  "housingListing.verifiedMember": "Pessoa membro verificada",
  "housingListing.availableFrom":
    "Disponível a partir de {date} · publicado por uma pessoa membro verificada",
  "housingListing.repliesUsually": "Costuma responder <b>{time}</b>",
  "housingListing.staySafe.title": "Mantém-te em segurança",
  "housingListing.staySafe.body":
    "<b>Nunca pagues um depósito antes de visitares o espaço pessoalmente.</b> Mantém a conversa dentro da QueerPulse até se terem conhecido. Se algo parecer estranho, a Queer Housing Justice Network pode aconselhar-te.",
  "housingListing.moreOnBoard": "Mais no quadro",

  // ── ContactRequestModal (fluxo partilhado de "contactar") ──────────────
  "contactRequest.defaultTitle": "Enviar um",
  "contactRequest.defaultEm": "pedido.",
  "contactRequest.defaultSuccessTitle": "Pedido",
  "contactRequest.defaultSuccessEm": "enviado.",
  "contactRequest.defaultSendLabel": "Enviar pedido",
  "contactRequest.defaultSendingLabel": "A enviar…",
  "contactRequest.defaultSuccessBody":
    "A tua mensagem está a caminho de <strong>{firstName}</strong>. Vai responder diretamente à tua caixa de entrada aqui — os contactos são partilhados assim que ambas as partes concordarem em avançar.",
  "contactRequest.messageLabel": "A tua mensagem *",
  "contactRequest.messagePlaceholder":
    "Uma frase sobre quem és e o que procuras já ajuda muito.",
  "contactRequest.charsNeeded_one":
    "Falta mais {count} caráter para dar contexto.",
  "contactRequest.charsNeeded_other":
    "Faltam mais {count} carateres para dar contexto.",
  "contactRequest.looksGood":
    "Está ótimo — mantém a conversa aqui até ambas as partes decidirem avançar.",
  "contactRequest.cancel": "Cancelar",
  "contactRequest.done": "Concluído",

  // ── LandlordPage ─────────────────────────────────────────────────────────
  "landlordPage.eyebrow": "Pessoa proprietária com aval da comunidade",
  "landlordPage.recommendCta": "Recomendar {name}",
  "landlordPage.recommendCount_one": "{count} recomendação de pessoas membro",
  "landlordPage.recommendCount_other":
    "{count} recomendações de pessoas membro",
  "landlordPage.section.about": "Sobre {name}",
  "landlordPage.section.whereTheyRent": "Onde arrenda",
  "landlordPage.section.recommendations": "Recomendações de pessoas membro",
  "landlordPage.sidebar.atAGlance": "Resumo",
  "landlordPage.sidebar.rentedFrom": "Já arrendaste com {name}?",
  "landlordPage.sidebar.rentedFromBody":
    "A tua recomendação é o que torna esta lista de confiança — e o que torna a mudança de outra pessoa muito mais segura. Demora dois minutos.",
  "landlordPage.sidebar.recommendCta": "Recomendar esta pessoa proprietária",
  "landlordPage.sidebar.howToRent": "Como arrendar com esta pessoa",
  "landlordPage.sidebar.requestIntro": "Pedir uma apresentação →",
  "landlordPage.toast.recommended_one":
    "Recomendação submetida — {count} estrela",
  "landlordPage.toast.recommended_other":
    "Recomendação submetida — {count} estrelas",
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
    "Já enviámos a tua nota a <strong>{firstName}</strong>. Se tiver algo que corresponda, vai entrar em contacto por aqui — sem pressão de qualquer forma.",
  "landlordPage.intro.sendLabel": "Pedir apresentação",

  // ── ModalKit (moldura de modal partilhada + painel de sucesso) ──────────
  "modalKit.closeAriaLabel": "Fechar",
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
  "flatmates.postProfileCta": "Publicar o teu perfil",

  "flatmates.empty.title":
    "O quadro de colegas de casa está parado neste momento",
  "flatmates.empty.description":
    "Ainda não há perfis publicados. Quando as pessoas partilharem o que procuram — um quarto, uma pessoa colega de casa, um bairro, um orçamento — vão aparecer aqui. Volta em breve, ou publica o teu próprio perfil.",
  "flatmates.empty.filteredTitle": "Nenhum perfil corresponde a esses filtros",
  "flatmates.empty.filteredDescription":
    "Ninguém corresponde a essa combinação exata neste momento. Tenta alargar os filtros — ou publica o teu próprio perfil e deixa que a pessoa certa te encontre.",
  "flatmates.empty.clearFilters": "Limpar filtros",

  "flatmates.outro.title": "Uma casa onde <em>pertences.</em>",
  "flatmates.outro.sub":
    "A pessoa certa para partilhar casa pode fazer uma cidade parecer um lar. Não tenhas pressa, confia no teu instinto, e usa a comunidade.",
  "flatmates.outro.askForum": "Perguntar no fórum →",

  "flatmates.card.memberSince": "Membro desde {date}",
  "flatmates.card.sayHello": "Dizer olá →",
  "flatmates.card.helloSent": "Olá enviado",

  // ── PostProfileModal / PostProfileForm ─────────────────────────────────
  "postProfileModal.ariaLabel": "Publicar o teu perfil de colega de casa",
  "postProfileModal.success.title": "Já estás no <em>quadro.</em>",
  "postProfileModal.success.body":
    "O teu perfil está publicado. As pessoas vão contactar-te diretamente — fica atente às tuas mensagens QueerPulse.",
  "postProfileModal.success.backCta": "Voltar aos perfis",

  "postProfileForm.title": "Publicar o teu perfil",
  "postProfileForm.sub":
    "Demora cerca de dois minutos. O teu perfil fica publicado de imediato — as pessoas contactam-te diretamente, sem algoritmo de correspondência.",
  "postProfileForm.lookingForLabel": "O que procuras?",
  "postProfileForm.seekingDesc":
    "Estás à procura de um quarto num apartamento ou casa",
  "postProfileForm.offeringDesc":
    "Tens um quarto ou casa partilhada para oferecer",
  "postProfileForm.nameLabel": "O teu nome",
  "postProfileForm.namePlaceholder": "Primeiro nome ou alcunha",
  "postProfileForm.pronounsLabel": "Pronomes (opcional)",
  "postProfileForm.pronounsPlaceholder": "ex.: ela, ele, elu",
  "postProfileForm.neighbourhoodLabel": "Bairro",
  "postProfileForm.neighbourhoodPlaceholder": "Preferência / localização",
  "postProfileForm.anywhereCentral": "Em qualquer zona central",
  "postProfileForm.budgetLabel": "Orçamento / mês",
  "postProfileForm.budgetPlaceholder": "ex.: 700–900 €",
  "postProfileForm.moveInLabel": "Disponível / entrada a partir de",
  "postProfileForm.moveInPlaceholder": "Quando?",
  "postProfileForm.moveIn.jul2026": "Julho de 2026",
  "postProfileForm.moveIn.aug2026": "Agosto de 2026",
  "postProfileForm.moveIn.sep2026": "Setembro de 2026",
  "postProfileForm.aboutLabel": "Sobre ti e o que procuras num lar",
  "postProfileForm.aboutPlaceholder":
    "Conta um pouco sobre ti — o teu ritmo, o teu trabalho, que tipo de casa te faz sentir bem. Não precisas de te vender; sê apenas honesta.",
  "postProfileForm.lifestyleTagsLabel": "Tags de estilo de vida",
  "postProfileForm.emailLabel": "O teu email (não é mostrado publicamente)",
  "postProfileForm.emailPlaceholder":
    "Para que as pessoas te possam contactar via QueerPulse",
  "postProfileForm.submitCta": "Publicar perfil →",

  // ── CompanyPage (+ Cover / Sidebar / Tabs) ──────────────────────────────
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
    "A seguir {name} — vais saber quando surgirem novas vagas",
  "company.cover.toast.unfollowed": "Deixaste de seguir {name}",

  "company.sidebar.detailsTitle": "Detalhes do estúdio",
  "company.sidebar.peopleTitle": "Pessoas daqui na QueerPulse",
  "company.sidebar.hiringContactTitle": "Contacto de recrutamento",
  "company.sidebar.messagePerson": "Enviar mensagem a {name}",
  "company.sidebar.sendMessage": "Enviar mensagem",

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
    "Obrigade — a tua avaliação de {companyName} já está publicada. A {companyName} não pode editar nem remover o que escreveste.",
  "companyReview.title": "Como é que era <em>na realidade?</em>",
  "companyReview.sub":
    "O teu relato honesto ajuda a próxima pessoa queer a decidir se aceita a entrevista. Verificado por adesão à comunidade.",
  "companyReview.headlineLabel": "Título",
  "companyReview.headlinePlaceholder": "Resume numa frase",
  "companyReview.roleLabel": "A tua função / tempo de casa",
  "companyReview.rolePlaceholder": "ex.: Designer, 2 anos na função",
  "companyReview.prosLabel": "O que funcionou — o lado bom",
  "companyReview.prosPlaceholder":
    "Pronomes respeitados, inclusão real, liderança que percebe do assunto…",
  "companyReview.consLabel": "O que foi difícil — o resto",
  "companyReview.consPlaceholder": "Onde o acompanhamento ficou aquém…",
  "companyReview.cancel": "← Cancelar",
  "companyReview.posting": "A publicar…",
  "companyReview.submitCta": "Publicar avaliação →",
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
    "Avaliações anónimas de empresas de Lisboa feitas por pessoas LGBTQ+. Para lá do logótipo do Orgulho — como é realmente estar assumida ali, portas adentro do escritório.",

  "employerReviews.how.title": "Como <em>funciona</em>",
  "employerReviews.how.sub":
    "Anónimo, verificado por adesão à comunidade, não editável por empresas.",
  "employerReviews.how.write.title": "Escreve de forma anónima",
  "employerReviews.how.write.desc":
    "A tua identidade nunca é associada à tua avaliação. Verificamos que és uma pessoa membro — mais nada fica registado.",
  "employerReviews.how.rate.title": "Avalia o que importa",
  "employerReviews.how.rate.desc":
    "Segurança para te assumires, sensibilidade da gestão, inclusão trans, capacidade de resposta dos RH, e cultura real vs. valores declarados.",
  "employerReviews.how.help.title": "Ajuda a próxima pessoa",
  "employerReviews.how.help.desc":
    "A tua avaliação ajuda outras pessoas queer a fazer escolhas melhores sobre onde levam o seu talento e todo o seu ser.",

  "employerReviews.recent.title": "Avaliações <em>recentes</em>",
  "employerReviews.recent.sub":
    "Escritas por pessoas membro · anónimas · atualizadas continuamente",
  "employerReviews.recent.browseCta":
    "Ver vagas inclusivas para pessoas queer →",
  "employerReviews.recent.writeCta": "Escrever uma avaliação →",

  "employerReviews.verify.title": "Como funciona a <em>verificação</em>",
  "employerReviews.verify.verifiedSafe.label": "Verificada como segura",
  "employerReviews.verify.verifiedSafe.desc":
    "Políticas inclusivas confirmadas no papel, depois cruzadas com 3+ avaliações anónimas de pessoas colaboradoras. Reverificado todos os anos.",
  "employerReviews.verify.queerRun.label":
    "Gerida por pessoas queer vs. amiga da comunidade queer",
  "employerReviews.verify.queerRun.desc":
    "Gerida por pessoas queer significa liderada ou detida por pessoas queer. Amiga da comunidade queer é acolhedora mas não liderada pela comunidade — nunca confundimos as duas coisas.",
  "employerReviews.verify.confidence.label": "Confiança na pontuação",
  "employerReviews.verify.confidence.desc":
    "Cada pontuação mostra em quantas avaliações se baseia. Mais avaliações, mais confiança — um 9 com 3 pessoas não é o mesmo que um 9 com 30.",

  "employerReviews.write.title": "Escreve uma <em>avaliação.</em>",
  "employerReviews.write.body":
    "Já lá passaste. Sabes como era na realidade. A tua avaliação ajuda a próxima pessoa queer a decidir se aceita aquela entrevista. Demora 5 minutos e é completamente anónima.",
  "employerReviews.write.note":
    "Só para pessoas membro · anónimo · a tua identidade nunca é guardada com a tua avaliação",
  "employerReviews.write.rulesTitle": "Os nossos princípios de avaliação",
  "employerReviews.write.rule.anonymous":
    "As avaliações são anónimas — o teu nome nunca é associado",
  "employerReviews.write.rule.verifyMembership":
    "Verificamos que és uma pessoa membro da QueerPulse, nada mais",
  "employerReviews.write.rule.noEdit":
    "As empresas não podem editar, remover ou responder a avaliações",
  "employerReviews.write.rule.moderation":
    "Moderamos por rigor factual, não por conforto",
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
    "Obrigade — a tua avaliação anónima de {company} já está publicada. O teu nome nunca é guardado com ela, e a {company} não pode editar nem remover o que escreveste.",

  // ── GrantsPage (+ guia / barra lateral) ────────────────────────────────
  // Nota de âmbito: os anúncios de bolsas em grants.data.tsx (nomes, entidades,
  // montantes, descrições) são um diretório curado de programas de financiamento
  // externos reais — conteúdo informativo, não interface da plataforma. Em modo
  // live viriam de um diretório mantido/obtido da API. Ficam em inglês.
  "grants.hero.eyebrow": "Bolsas e financiamento",
  "grants.hero.title": "Dinheiro para <em>trabalho queer.</em>",
  "grants.hero.lead":
    "Guia feito pela comunidade sobre bolsas, residências e financiamento para pessoas e organizações LGBTQ+ — em Portugal e por toda a Europa. Mantido por quem já se candidatou com sucesso.",
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
  "grants.section.pt": "<em>Portugal</em> — programas nacionais",
  "grants.section.eu": "<em>UE e Internacional</em>",

  "grants.status.open": "Aberta agora",
  "grants.status.rolling": "Em contínuo",
  "grants.status.closed": "Fechada",

  "grants.card.learnMore": "Saber mais",

  "grants.empty.title": "Nada corresponde ao teu filtro",
  "grants.empty.description":
    "Não há oportunidades nessa categoria neste momento. Limpa o filtro para ver todas as bolsas e residências que a comunidade está a acompanhar.",
  "grants.empty.clearFilters": "Limpar filtros",

  "grants.guide.title": "Escrever uma <em>candidatura forte</em>",
  "grants.guide.sub":
    "Conselhos de pessoas da comunidade que já conseguiram financiamento — de micro a grande.",
  "grants.guide.step.criteria.title": "Lê os critérios duas vezes",
  "grants.guide.step.criteria.body":
    "A maioria das recusas vem de candidaturas que encaixam tecnicamente mas não espelham a linguagem de quem financia. Mapeia o teu projeto sobre as palavras concretas que usam.",
  "grants.guide.step.story.title": "Conta uma história concreta",
  "grants.guide.step.story.body":
    "Quem financia lê centenas de candidaturas. Uma única história concreta e humana de impacto fica melhor do que afirmações genéricas.",
  "grants.guide.step.community.title": "Mostra a tua comunidade",
  "grants.guide.step.community.body":
    "Quem financia trabalho queer quer ver a comunidade lá dentro — não como beneficiária, mas a participar e a decidir.",
  "grants.guide.step.review.title": "Pede uma leitura",
  "grants.guide.step.review.body":
    "Antes de submeteres, pede a alguém de fora do projeto que leia a tua candidatura. Um olhar novo apanha os pressupostos que já deixaste de ver.",

  "grants.outro.title": "O teu projeto <em>merece apoio.</em>",
  "grants.outro.sub":
    "Encontraste algo que encaixa? Candidata-te com confiança — e se conseguires, retribui: acrescenta a oportunidade para a próxima pessoa.",
  "grants.outro.cta": "Ver bolsas abertas",

  "grants.subpages.title": "Também em bolsas",
  "grants.subpages.microGrants.label": "Micro Bolsas",
  "grants.subpages.microGrants.blurb":
    "Bolsas pequenas e rápidas da comunidade — candidata-te em minutos.",

  "grants.sidebar.microGrants.title": "As nossas <em>Micro Bolsas</em>",
  "grants.sidebar.microGrants.body":
    "A QueerPulse tem o seu próprio programa de micro bolsas (200 €–2 000 €) para projetos comunitários em Lisboa. Mais rápido e mais simples do que a maioria das bolsas externas.",
  "grants.sidebar.microGrants.cta": "Candidata-te →",
  "grants.sidebar.skillsExchange.title": "Troca de competências",
  "grants.sidebar.skillsExchange.body":
    "Se precisas de apoio mas as bolsas te parecem formais demais, o quadro de trocas liga pessoas que trocam competências entre si — sem dinheiro pelo meio.",
  "grants.sidebar.skillsExchange.cta": "Explorar as trocas →",
  "grants.sidebar.appHelp.title": "Ajuda com a <em>candidatura</em>",
  "grants.sidebar.appHelp.body":
    "Pessoas da comunidade com experiência em candidaturas dão workshops e apoio individual através da troca de competências.",
  "grants.sidebar.appHelp.cta": "Encontrar mentoria →",

  // ── JobApplyPage (+ cabeçalho / formulário / barra lateral) ────────────
  "jobApply.backToJob": "← Voltar à vaga",
  "jobApply.backToJobs": "← Voltar às vagas",
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
  "jobApply.browse": "Procurar →",
  "jobApply.portfolio": "Ligações do portefólio",
  "jobApply.portfolioHelper":
    "O teu perfil QueerPulse é anexado automaticamente. Desmarca em Privacidade se preferires que não.",
  "jobApply.sitePlaceholder": "O teu site ou Are.na",
  "jobApply.instagramPlaceholder": "@teuhandle",

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
    "O intervalo publicado é {salary}. Podes indicar um valor fora deste — vão considerar.",
  "jobApply.salaryPlaceholder": "ex.: 1400 €/mês, ou em aberto",

  "jobApply.extraTitle": "Mais alguma coisa",
  "jobApply.extraOptional": "— opcional",
  "jobApply.extraSub":
    "Há mais alguma coisa que queiras que a {org} saiba? Horário, necessidades de acesso, referências — o que for relevante.",
  "jobApply.extraLabel": "Notas para a equipa de recrutamento",
  "jobApply.extraPlaceholder":
    "Preferia terças e quintas-feiras no escritório para conseguir ir buscar o meu filho à escola…",

  "jobApply.draftSavedJustNow": "Rascunho guardado · agora mesmo",
  "jobApply.saveDraft": "Guardar rascunho",
  "jobApply.sending": "A enviar…",
  "jobApply.sendCta": "Enviar candidatura →",

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
    "Enviada à {org} para a vaga de {title}. Não há mais nada a fazer por agora — a bola está do lado delas.",

  "jobApply.toast.draftSaved": "Rascunho guardado — retomas quando quiseres.",
  "jobApply.error.missingFields":
    "Adiciona o teu nome e email antes de enviar.",
  "jobApply.error.alreadyApplied":
    "Já te candidataste a esta vaga — consulta as tuas candidaturas.",
  "jobApply.error.generic":
    "Não conseguimos enviar a tua candidatura. Tenta novamente.",

  "jobApply.availability.now.title": "Imediatamente",
  "jobApply.availability.now.desc": "Disponível já",
  "jobApply.availability.soon.title": "Em 2–4 semanas",
  "jobApply.availability.soon.desc": "Período de aviso prévio",
  "jobApply.availability.later.title": "Em 1–3 meses",
  "jobApply.availability.later.desc": "A terminar compromissos",

  "jobApply.tip.autocorrect":
    "Revê bem a tua nota de apresentação — o corretor automático adora reescrever “queer”.",
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
    "Uma bolsa de trocas estruturada — competências por competências, saber por saber. Sem dinheiro, sem comissões da plataforma. Publica o que podes oferecer e o que esperas receber em troca.",
  "barter.principle.noMoney.title": "Sem dinheiro",
  "barter.principle.noMoney.body":
    "Cada troca é entre pessoas. O valor é definido por quem participa, não pela plataforma.",
  "barter.principle.reputation.title": "Com reputação",
  "barter.principle.reputation.body":
    "As ofertas vêm de pessoas verificadas. O teu aval na comunidade é o teu histórico de confiança.",
  "barter.principle.wants.title": "O que precisas também conta",
  "barter.principle.wants.body":
    "Publica o que procuras, não só o que podes dar. Precisar é tão bem-vindo como oferecer.",

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
  "barter.card.proposeCta": "Propor uma troca →",
  "barter.toast.messageSent": "Mensagem enviada a {name}",
  "barter.postedToday": "Hoje",
  "barter.postedDaysAgo_one": "há {count} dia",
  "barter.postedDaysAgo_other": "há {count} dias",

  "barter.empty.title": "Nada corresponde aos teus filtros",
  "barter.empty.description":
    "Ainda não há trocas que encaixem nessa combinação. Tenta alargar a pesquisa — ou publica o que tens para oferecer e deixa que a troca certa te encontre.",
  "barter.empty.clearFilters": "Limpar filtros",

  "barter.postStrip.success.title": "Está <em>em cima da mesa.</em>",
  "barter.postStrip.success.body":
    "A tua troca já está no topo do quadro. Avisamos-te quando alguém propuser uma troca.",
  "barter.postStrip.success.postAnother": "Publicar outra →",
  "barter.postStrip.title": "Põe algo <em>em cima da mesa.</em>",
  "barter.postStrip.body":
    "Cada troca começa com uma publicação. Diz à comunidade o que podes oferecer e o que esperas receber em troca.",
  "barter.postStrip.offerPlaceholder":
    "Posso oferecer — ex.: aulas de português, design de logótipo…",
  "barter.postStrip.wantPlaceholder":
    "Procuro — ex.: ajuda com impostos, ajuda numa mudança…",
  "barter.postStrip.submitCta": "Publicar na troca →",
  "barter.postStrip.namePlaceholder": "Tu",
  "barter.postStrip.hoodPlaceholder": "A tua publicação",
  "barter.postStrip.detailPlaceholder":
    "Publicado agora mesmo — envia uma mensagem para começar a troca.",
  "barter.postStrip.tagNew": "novo",
  "barter.postStrip.tagYourPost": "a tua publicação",

  "barter.outro.title": "As competências são <em>a moeda.</em>",
  "barter.outro.sub":
    "A Troca QueerPulse está aberta a todas as pessoas da comunidade. Quanto mais ofereces, mais podes pedir.",
  "barter.outro.cta": "Junta-te à rede",

  // ── BarterDetailPage (+ ProposeCard / QuestionModal) ────────────────────
  "barterDetail.back": "← Troca de competências",
  "barterDetail.sub.offering":
    "Disponível para a comunidade — troca por algo que a pessoa precisa.",
  "barterDetail.sub.seeking": "À procura disto — e a oferecer algo em troca.",
  "barterDetail.sub.both":
    "A oferecer uma coisa, à procura de outra. Propõe uma troca que funcione para os dois lados.",
  "barterDetail.locationWithHood": "{hood} · Lisboa",
  "barterDetail.locationLisbon": "Lisboa",
  "barterDetail.repliesFast": "Costuma responder rápido",
  "barterDetail.messageCta": "Enviar mensagem a {firstName} →",
  "barterDetail.section.offering": "O que <em>tem para oferecer</em>",
  "barterDetail.section.lookingFor": "O que <em>procura</em>",
  "barterDetail.section.howItWorks": "Como funciona <em>uma troca</em>",

  "barterDetail.steps.propose.title": "Propor",
  "barterDetail.steps.propose.text":
    "Envia uma mensagem a dizer o que trocarias e porque é que a troca funciona para ti.",
  "barterDetail.steps.agree.title": "Combinar",
  "barterDetail.steps.agree.text":
    "Definem a troca juntos — âmbito, calendário, formato. Sem dinheiro a trocar de mãos.",
  "barterDetail.steps.exchange.title": "Trocar",
  "barterDetail.steps.exchange.text":
    "Cada pessoa entrega a sua parte. Encontram-se em Lisboa ou fazem à distância, o que for mais prático.",
  "barterDetail.steps.vouch.title": "Aval",
  "barterDetail.steps.vouch.text":
    "Depois, deixa um aval para que a próxima pessoa saiba que correu bem.",

  "barterDetail.sidebar.quickFacts": "Resumo rápido",
  "barterDetail.sidebar.type": "Tipo",
  "barterDetail.sidebar.category": "Categoria",
  "barterDetail.sidebar.posted": "Publicado",
  "barterDetail.sidebar.area": "Zona",
  "barterDetail.sidebar.tagged": "Etiquetas",

  "barterDetail.propose.title": "Propor uma troca",
  "barterDetail.propose.lead": "Sem dinheiro — <em>só troca.</em>",
  "barterDetail.propose.placeholder":
    "Diz a {firstName} o que oferecerias em troca, e porque é que esta troca funciona para ti.",
  "barterDetail.propose.sendCta": "Enviar proposta →",
  "barterDetail.propose.askFirst": "Perguntar antes",
  "barterDetail.propose.footNote":
    "Nada fica combinado até os dois dizerem que sim. As trocas são entre pessoas — a QueerPulse nunca fica com uma parte.",
  "barterDetail.propose.errorEmpty": "Escreve uma linha sobre o que trocarias.",
  "barterDetail.propose.toastSent": "Troca proposta a {name}.",

  "barterQuestion.eyebrow": "Antes de propores",
  "barterQuestion.title": "Faz uma pergunta a <em>{firstName}</em>.",
  "barterQuestion.sub":
    "Ainda não é o momento certo para propores uma troca? Pergunta primeiro o que precisas de saber — calendário, o que procura, como funcionaria. Descontraído e sem pressão.",
  "barterQuestion.fieldLabel": "A tua pergunta *",
  "barterQuestion.placeholder":
    "Olá {firstName} — uma pergunta rápida antes de propor uma troca…",
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
    "A tua pergunta está a caminho de <strong>{name}</strong>. Nenhuma troca fica combinada até os dois dizerem que sim — isto é só uma conversa para ver se pode resultar. Vais receber uma notificação aqui quando a pessoa responder.",

  // ── PostJobPage (gate + composer + steps + sidebar + preview + confirmation) ──
  "postJob.gate.title":
    "Publicar uma vaga é para <em>empresas verificadas</em>",
  "postJob.gate.sub":
    "Para manter a bolsa de emprego de confiança, só pessoas afiliadas a uma empresa podem publicar vagas. Afilia a tua para continuar — é rápido.",
  "postJob.gate.affiliateCta": "Afiliar a tua empresa",
  "postJob.gate.backCta": "Voltar à bolsa",
  "postJob.gate.point1":
    "Confirmamos que as empresas são genuinamente queer-inclusivas, não apenas de fachada.",
  "postJob.gate.point2":
    "As vagas são publicadas em nome da tua empresa verificada, com o logótipo e o selo.",
  "postJob.gate.point3":
    "Sem comissões de colocação — isto é uma bolsa da comunidade, não um mercado.",

  "postJob.stepLabels.type": "Tipo e função",
  "postJob.stepLabels.details": "Detalhes",
  "postJob.stepLabels.pay": "Remuneração e benefícios",
  "postJob.stepLabels.screening": "Triagem",
  "postJob.stepLabels.review": "Revisão",

  "postJob.topbar.back": "Vagas e competências",
  "postJob.topbar.savedJustNow": "Guardado agora mesmo",
  "postJob.topbar.autosaves": "O rascunho é guardado automaticamente",
  "postJob.nav.back": "← Voltar",
  "postJob.nav.continue": "Continuar →",
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
  "postJob.option.seniority.leadPrincipal": "Lead / Principal",

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
    "O formato da função — escolhe o mais próximo.",
  "postJob.step1.locationPlaceholder":
    "ex.: Arroios, Lisboa — ou um bairro / concelho",
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
    "Descreve o trabalho, para quem é, e como é o sucesso — escreve como explicarias a uma pessoa da comunidade num evento.",
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
    "A transparência é um valor da comunidade aqui — e resulta.",
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
    "Troca competências em vez de (ou juntamente com) dinheiro — uma opção de pleno direito na QueerPulse.",
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
    "As vagas são publicadas em nome da tua empresa verificada — é isso que mantém a bolsa de confiança.",
  "postJob.step4.verifiedEmployerAria": "Empresa verificada",
  "postJob.step4.notYou": "Não és tu?",

  "postJob.skills.title": "Competências",
  "postJob.skills.sub":
    "Adiciona a partir da lista partilhada para que as pessoas possam filtrar e encontrar-te — texto livre também funciona.",
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
  "postJob.step5.dash": "—",
  "postJob.step5.notSpecified": "Não especificado",
  "postJob.step5.questionCount_one": "{count} pergunta",
  "postJob.step5.questionCount_other": "{count} perguntas",
  "postJob.step5.editCta": "Editar",
  "postJob.step5.agreement":
    "Confirmo que esta vaga cumpre o <link>Código de Cuidado</link> — sem discriminação de identidade, e uma remuneração justa. <strong>A QueerPulse é um espaço de solidariedade, não um canal de exploração.</strong>",

  "postJob.sidebar.livePreview": "Pré-visualização",
  "postJob.sidebar.fullView": "Ver tudo",
  "postJob.sidebar.hiring": "A contratar",
  "postJob.sidebar.titlePlaceholder": "O teu título vai aparecer aqui",
  "postJob.sidebar.descPlaceholder": "Adiciona uma descrição…",
  "postJob.sidebar.viewFullCta": "Ver a vaga completa →",
  "postJob.sidebar.howThisWorks": "Como funciona",
  "postJob.sidebar.point1":
    "As vagas são <strong>visíveis apenas para membros</strong>, nunca públicas.",
  "postJob.sidebar.point2":
    "As vagas <strong>expiram ao fim de 60 dias</strong> — aviso ao dia 45.",
  "postJob.sidebar.point3":
    "<strong>Sem comissões de colocação.</strong> Uma bolsa da comunidade, não um mercado.",
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
    "As respostas ficam todas num só lugar — revê, envia mensagem, ou marca como preenchida a partir do teu gestor de vagas.",
  "postJob.confirm.responses.openManager": "Abrir gestor de vagas",
  "postJob.confirm.share.title": "Partilha",
  "postJob.confirm.share.body": "Aumenta o alcance dentro da comunidade.",
  "postJob.confirm.share.postToFeed": "Publicar no Feed",
  "postJob.confirm.share.copyLink": "Copiar link",
  "postJob.confirm.share.toastFeed": "Partilhado no teu feed",
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
    "Estás a navegar algo — uma transição de carreira, um bloqueio criativo, sair do armário profissionalmente, um ambiente de trabalho difícil, uma cidade nova. Beneficiarias de falar com alguém que já passou por isso.",
  "mentorship.choose.mentee.for":
    "Para: qualquer pessoa, em qualquer fase, que precise de orientação →",
  "mentorship.choose.mentor.title": "Posso ser mentor",
  "mentorship.choose.mentor.desc":
    "Já passaste por coisas suficientes para teres algo a oferecer. Não precisas de ser especialista — só precisas de ter navegado algo que outra pessoa está a navegar agora.",
  "mentorship.choose.mentor.for":
    "Para: pessoas com experiência dispostas a partilhá-la →",

  "mentorship.strip.title": "Mentores atuais <em>na rede</em>",
  "mentorship.strip.sub":
    "Estas pessoas abriram-se à mentoria. Podes pedir um par através do formulário acima.",

  "mentorship.outro.title": "Tens algo <em>para dar?</em>",
  "mentorship.outro.sub":
    "A mentoria é uma forma. Explora oportunidades de voluntariado para encontrar outras formas de contribuir para a comunidade à tua volta.",
  "mentorship.outro.cta": "Ver funções de voluntariado →",

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
  "mentorship.match.done": "Concluído!",
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

  "mentorship.nav.continue": "Continuar →",
  "mentorship.nav.back": "← Voltar",
  "mentorship.nav.submit": "Submeter →",
  "mentorship.cta.requestMatch": "Pedir um par",
  "mentorship.cta.joinWaitlist": "Entrar na lista de espera",

  // ── MentorDetailPage (+ header / sections / sidebar / cycle nav) ───────
  "mentorDetail.backToAll": "← Todos os mentores",
  "mentorDetail.messageCta": "Enviar mensagem a {firstName}",
  "mentorDetail.cyclePrevious": "← Anterior",
  "mentorDetail.cycleNext": "Seguinte →",
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
    "Sem custo inicial. A mentoria aqui é entre pessoas — podes sempre fazer uma pergunta antes de te comprometeres.",
  "mentorDetail.sidebar.notSureYet": "Ainda não tens a certeza?",
  "mentorDetail.sidebar.askQuestion": "→ Enviar uma pergunta a {firstName}",
  "mentorDetail.sidebar.browseAll": "→ Explorar todos os mentores",

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
  "applicationStatus.legend.done": "Concluído — este passo está feito",
  "applicationStatus.legend.active": "Estás aqui — passo atual",
  "applicationStatus.legend.upcoming": "Por vir — ainda não começou",
  "applicationStatus.legend.closed": "Fechado — terminado ou retirado",

  "applicationStatus.group.offers.title": "Ofertas — a tua decisão",
  "applicationStatus.group.inProgress.title": "Em curso",
  "applicationStatus.group.drafts.title": "Rascunhos",
  "applicationStatus.group.drafts.hint":
    "Por terminar — conclui estas antes que fechem.",
  "applicationStatus.group.closedWithdrawn.title": "Fechadas e retiradas",
  "applicationStatus.group.closedWithdrawn.hint":
    "Sem ação necessária — guardadas para referência.",
  "applicationStatus.compareOffersCta": "Comparar ofertas",

  "applicationStatus.empty.title": "Ainda sem candidaturas",
  "applicationStatus.empty.description":
    "Quando te candidatares a uma vaga, bolsa ou oportunidade, vais poder acompanhar todas — e comparar ofertas lado a lado — aqui mesmo.",
  "applicationStatus.empty.browseCta": "Explorar vagas",

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
  "applicationStatus.company.viewDirectory": "Ver no diretório →",
  "applicationStatus.note.from": "Uma nota de {company}",

  "msg.message.title": "Enviar mensagem",
  "msg.message.em": "à pessoa recrutadora.",
  "msg.message.sub":
    "Vai direto para a caixa de entrada — sem confirmação de leitura, sem algoritmo pelo meio.",
  "msg.followup.title": "Enviar um",
  "msg.followup.em": "seguimento.",
  "msg.followup.sub":
    "Um empurrãozinho simpático. Já escrevemos algo caloroso — edita como quiseres.",
  "msg.followup.preset":
    "Olá — só uma nota simpática para saber como está a minha candidatura. Continuo com muito interesse na vaga e disponível para partilhar o que for útil. Sem qualquer pressa, e agradeço o teu tempo.",
  "msg.conversation.title": "Abrir a",
  "msg.conversation.em": "conversa.",
  "msg.conversation.sub": "Continua a conversa diretamente.",
  "msg.recipientHiringTeam": "Equipa de contratação",
  "msg.historyWith":
    "O histórico completo com {firstName} — todas as mensagens e marcos, em ordem.",
  "msg.you": "Tu",
  "msg.yourReply": "A tua resposta",
  "msg.replyPlaceholder": "Escreve uma resposta…",
  "msg.sendingLabel": "A enviar…",
  "msg.sendCta": "Enviar →",
  "msg.yourMessageLabel": "A tua mensagem",
  "msg.messagePlaceholder": "Escreve à vontade.",
  "msg.cancel": "← Cancelar",
  "msg.success.title": "Mensagem",
  "msg.success.em": "enviada.",
  "msg.success.body":
    "A tua mensagem para {firstName} está a caminho. Vais receber a resposta diretamente na tua caixa de entrada.",

  "calendar.eyebrow": "Entrevista",
  "calendar.close": "← Fechar",
  "calendar.icsLabel": "Ficheiro .ics",
  "calendar.googleLabel": "Google Calendar →",
  "calendar.addingLabel": "A adicionar…",
  "calendar.success.title": "Guardado no teu",
  "calendar.success.em": "calendário.",
  "calendar.success.google":
    "Abrimos o Google Calendar — basta guardares. Também te vamos lembrar na manhã do dia.",
  "calendar.success.ics":
    "O convite (.ics) foi descarregado — abre-o para adicionar o evento. Também te vamos lembrar na manhã do dia.",
  "calendar.when": "Quando",
  "calendar.where": "Onde",
  "calendar.with": "Com",

  "withdraw.eyebrow": "Retirar",
  "withdraw.title": "Desistir de <em>{company}?</em>",
  "withdraw.sub":
    "Isto retira-te da consideração para <b>{title}</b>. Vamos enviar uma nota breve e educada em teu nome — não precisas de escrever nada.",
  "withdraw.reasonLabel": "Motivo (só tu vês isto)",
  "withdraw.reasonPlaceholder": "Escolhe um motivo, ou deixa em aberto",
  "withdraw.cantUndo":
    "Isto não pode ser desfeito — terias de te candidatar de novo.",
  "withdraw.keepIt": "← Manter",
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
    "Negociar é normal — a maioria das ofertas tem margem. Aqui está a tua vantagem, as tuas alavancas, e cinco formas de pedir.",
  "negotiate.onTheTable": "Em cima da mesa",
  "negotiate.holiday": "Férias",
  "negotiate.whatMattersMost": "O que mais te importa",
  "negotiate.pickAngle": "Escolhe a tua abordagem",
  "negotiate.draftLabel":
    "O teu rascunho de resposta — edita para soar como tu",
  "negotiate.copyDraft": "Copiar rascunho",
  "negotiate.copiedToast": "Rascunho copiado",
  "negotiate.sendingLabel": "A enviar…",
  "negotiate.sendCta": "Enviar resposta →",
  "negotiate.success.title": "Contraproposta",
  "negotiate.success.em": "enviada.",
  "negotiate.success.body":
    "A tua resposta está a caminho de {company}. Pedir é normal e esperado — fizeste exatamente bem.",
  "lever.baseSalary": "Salário base",
  "lever.holidayDays": "Dias de férias",
  "lever.remoteDays": "Dias remotos",
  "lever.learningBudget": "Orçamento de formação",
  "lever.startDate": "Data de início",
  "lever.titleScope": "Título e âmbito",
  "principle.anchor": "Ancora-te no valor que trazes, nunca no que precisas.",
  "principle.nameNumber":
    "Diz um número claro e depois fica em silêncio — deixa-os responder.",
  "principle.trade":
    "Se o salário base não mexer, troca: dias, orçamento, título, flexibilidade.",
  "principle.stayWarm":
    "Mantém a proximidade. Isto é uma relação, não uma transação.",
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
    "Ganhar espaço para decidir — com calma, sem pressão.",

  "offer.respondByEyebrow": "A tua oferta · responde até {date}",
  "offer.saidYes": "A {company} <em>disse sim.</em>",
  "offer.sub":
    "Aqui está tudo em cima da mesa. Leva o teu tempo — depois escolhe.",
  "offer.salary": "Salário",
  "offer.holiday": "Férias",
  "offer.start": "Início",
  "offer.declinePolitely": "Recusar com educação",
  "offer.decliningLabel": "A recusar…",
  "offer.acceptCta": "Aceitar oferta →",
  "offer.acceptingLabel": "A aceitar…",
  "offer.success.title": "Oferta",
  "offer.success.emAccepted": "aceite.",
  "offer.success.emDeclined": "recusada.",
  "offer.undo.changedMind":
    "Mudaste de ideias? Podes desfazer durante {seconds}s.",
  "offer.undo.button": "Desfazer",
  "offer.undo.confirmed": "Isto está agora confirmado.",
  "offer.success.acceptedBody":
    "Parabéns — a {company} vai enviar o teu contrato no prazo de dois dias úteis.",
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
  "resume.saveClose": "← Guardar e fechar",
  "resume.submittingLabel": "A submeter…",
  "resume.submitCta": "Submeter candidatura →",
  "resume.success.title": "Candidatura",
  "resume.success.em": "enviada.",
  "resume.success.body":
    "Boa — a tua candidatura para {company} foi enviada. Já está no teu separador Ativas.",

  "compare.eyebrow": "As tuas ofertas",
  "compare.title": "Duas ofertas, <em>lado a lado.</em>",
  "compare.sub":
    "Uma vista calma do que está em cima da mesa. Compara os números e responde quando quiseres.",
  "compare.whatsIncluded": "O que está incluído",
  "compare.respondCta": "Responder →",
  "compare.close": "← Fechar",
  "compareRow.salary": "Salário",
  "compareRow.holiday": "Férias",
  "compareRow.startDate": "Data de início",
  "compareRow.respondBy": "Responder até",
  "compareRow.howItPays": "Como paga",

  // ── WorkshopsSection / WorkshopPage (+ sidebar / reserve / add modals) ──
  "workshopsSection.newBadge": "Novo",
  "workshopsSection.loadMoreCta": "Ver mais workshops",
  "workshopsSection.loadingMore": "A carregar…",
  "workshopsSection.withTutor": "com <b>{name}</b>",
  "workshopsSection.seatsLeft_one": "<b>{count}</b> lugar disponível",
  "workshopsSection.seatsLeft_other": "<b>{count}</b> lugares disponíveis",
  "workshopsSection.cohortFull": "Turma completa",
  "workshopsSection.viewCta": "Ver workshop →",
  "workshopsSection.heading": "Workshops <em>avançados</em>",
  "workshopsSection.blurb":
    "Cursos estruturados de várias semanas, liderados por pessoas da comunidade que se aprofundam numa técnica. Turmas pequenas, preços em escala variável, e no final fazes algo real. Também dás um curso? Publica-o aqui.",
  "workshopsSection.listCta": "Publicar um workshop",

  "workshopPage.notFound.title": "Workshop não encontrado",
  "workshopPage.notFound.description":
    "Este workshop pode ter terminado ou ter sido retirado. Explora o que está a decorrer agora em Competências e aprendizagem.",
  "workshopPage.notFound.backCta": "Voltar a Competências",
  "workshopPage.backToSkills": "Competências e aprendizagem",
  "workshopPage.footerBackCta": "← Todos os workshops e competências",
  "workshopPage.newBadge": "Novo",

  "workshopSections.about.title": "O que vais <em>mesmo fazer</em>",
  "workshopSections.sessions.title_one": "A <em>{count} sessão</em>",
  "workshopSections.sessions.title_other": "As <em>{count} sessões</em>",
  "workshopSections.needs.title": "O que <em>está incluído</em>, o que trazer",
  "workshopSections.pastWork.title": "O que a turma anterior <em>fez</em>",
  "workshopSections.pastWork.intro": "Algumas peças da última turma:",

  "workshopSidebar.reserveTitle": "Reservar um lugar",
  "workshopSidebar.spotsFilled": "Lugares preenchidos",
  "workshopSidebar.startDate": "Data de início",
  "workshopSidebar.cancellation": "Cancelamento",
  "workshopSidebar.cohortFull": "Turma completa",
  "workshopSidebar.reserveCta": "Reservar um lugar →",
  "workshopSidebar.askQuestion": "Fazer uma pergunta",
  "workshopSidebar.askQuestionToast":
    "Vamos passar a tua pergunta a {firstName}.",
  "workshopSidebar.footNote":
    "Tarifa de solidariedade · basta dizê-lo no formulário, sem qualquer prova. Ninguém vê que tarifa escolheste.",
  "workshopSidebar.taughtBy": "Dado por",
  "workshopSidebar.where": "Onde",

  "workshopReserve.ariaLabel": "Reservar um lugar em {title}",
  "workshopReserve.success.title": "Lugar",
  "workshopReserve.success.em": "reservado.",
  "workshopReserve.success.closeLabel": "Concluído",
  "workshopReserve.success.body":
    "O teu lugar em <strong>{title}</strong> fica reservado por 48 horas. Enviámos a {firstName} um link de pagamento na tarifa <strong>{amount}</strong> — paga quando estiveres pronte, sem pressa. Vemo-nos {date}.",
  "workshopReserve.title": "Reservar um lugar em <em>{title}</em>",
  "workshopReserve.sub":
    "{seatsLeft} de {seatsTotal} lugares disponíveis. Reservar garante o teu lugar — sem pagamento por agora.",
  "workshopReserve.nameLabel": "O teu nome *",
  "workshopReserve.namePlaceholder": "Como te devemos chamar?",
  "workshopReserve.emailLabel": "Email *",
  "workshopReserve.emailPlaceholder": "Para onde enviamos o link de pagamento",
  "workshopReserve.tierLabel": "Quanto vais pagar *",
  "workshopReserve.noteLabel": "Algo que a pessoa tutora deva saber",
  "workshopReserve.notePlaceholder":
    "Necessidades de acesso, nível de experiência, uma pergunta…",
  "workshopReserve.slidingNote":
    "Escolhe a tarifa que for certa para ti. Sem provas, sem perguntas — a escala variável existe para manter isto aberto a todes.",
  "workshopReserve.cancel": "Cancelar",
  "workshopReserve.holdingLabel": "A reservar…",
  "workshopReserve.submitCta": "Reservar o meu lugar",

  "addWorkshop.ariaLabel": "Publicar um workshop",
  "addWorkshop.eyebrow": "Competências e aprendizagem",
  "addWorkshop.title": "Publica um <em>workshop avançado.</em>",
  "addWorkshop.sub":
    "Partilha um curso de várias semanas que estás a dar. Sê honesto sobre o nível e o ritmo — as pessoas estão a confiar-te tempo real.",
  "addWorkshop.titleLabel": "Título do workshop *",
  "addWorkshop.titlePlaceholder":
    "ex.: Tipografia, desde a composição até uma página impressa",
  "addWorkshop.blurbLabel": "Resumo numa linha *",
  "addWorkshop.blurbPlaceholder": "Para quem é e com o que vão ficar",
  "addWorkshop.aboutLabel": "O que vais mesmo fazer *",
  "addWorkshop.aboutPlaceholder":
    "A forma das sessões, o nível assumido, o que as pessoas fazem. Uma ideia por linha.",
  "addWorkshop.categoryLabel": "Categoria *",
  "addWorkshop.formatLabel": "Formato *",
  "addWorkshop.weeksLabel": "Duração (semanas) *",
  "addWorkshop.sizeLabel": "Tamanho da turma *",
  "addWorkshop.priceLabel": "Preço padrão (€) *",
  "addWorkshop.venueLabel": "Onde (local · bairro)",
  "addWorkshop.venuePlaceholder": "ex.: Estúdio Graça · Graça",
  "addWorkshop.note":
    "Vamos configurar automaticamente uma tarifa reduzida e uma de solidariedade a partir do teu preço padrão — podes ajustá-las depois. As sessões começam vazias; adiciona o plano semana a semana a partir da página do teu workshop.",
  "addWorkshop.failedNote":
    "Não conseguimos publicar agora — nada ficou listado. Os teus dados continuam aqui, por isso tenta outra vez daqui a pouco.",
  "addWorkshop.cancel": "Cancelar",
  "addWorkshop.publishingLabel": "A publicar…",
  "addWorkshop.publishCta": "Publicar workshop",
  "addWorkshop.listed.title": "Workshop",
  "addWorkshop.listed.em": "publicado.",
  "addWorkshop.listed.closeLabel": "Concluído",
  "addWorkshop.listed.viewCta": "Ver o teu workshop →",
  "addWorkshop.listed.body":
    "<strong>{title}</strong> já está publicado em Competências e aprendizagem. As pessoas podem explorá-lo, ler o plano, e reservar um lugar. Edita os detalhes ou adiciona sessões a qualquer momento a partir da página do teu workshop.",

  "addWorkshop.cat.creative": "Criativo",
  "addWorkshop.cat.craft": "Artesanato",
  "addWorkshop.cat.design": "Design",
  "addWorkshop.cat.tech": "Tecnologia",
  "addWorkshop.cat.business": "Negócios",
  "addWorkshop.cat.care": "Cuidado",
  "addWorkshop.mode.inPerson": "Presencial",
  "addWorkshop.mode.online": "Online",
  "addWorkshop.mode.hybrid": "Híbrido",
  "addWorkshop.build.tutorRole":
    "Pessoa membro da QueerPulse · a fazer isto pela primeira vez",

  // ── addWorkshop.build.ts (valores por omissão para um workshop publicado
  // por uma pessoa membro) ────────────────────────────────────────────────
  // Os workshops ainda não têm backend live (ver WorkshopsProvider) — este
  // construtor corre sempre no cliente, por isso os valores por omissão são
  // chrome, não conteúdo obtido por fetch. `draft.title`/`blurb`/`about`/
  // `venue` são as palavras da própria pessoa e mantêm-se por traduzir, tal
  // como o texto livre do salário de uma vaga.
  "addWorkshop.build.freeTier": "Gratuito · paga o que puderes",
  "addWorkshop.build.free": "Gratuito",
  "addWorkshop.build.standardRate": "Preço normal",
  "addWorkshop.build.reduced": "Reduzido",
  "addWorkshop.build.solidaritySlot": "Solidariedade · 1 lugar",
  "addWorkshop.build.weeks_one": "{count} semana",
  "addWorkshop.build.weeks_other": "{count} semanas",
  "addWorkshop.build.format": "Workshop · {weeks} · grupo de {size}",
  "addWorkshop.build.priceSub": "{weeks} · escala flexível disponível",
  "addWorkshop.build.heroPlaceholder": "{title} · workshop",
  "addWorkshop.build.startDateTba": "A anunciar",
  "addWorkshop.build.cancellation": "Reembolso total · antes de começar",
  "addWorkshop.build.sessionTitle": "Semana {n} · a planear",
  "addWorkshop.build.sessionDesc":
    "Acrescenta o que esta sessão aborda a partir da página do teu workshop.",
  "addWorkshop.build.sessionDateTba": "A confirmar",
  "addWorkshop.build.sessionLength": "3 h",
  "addWorkshop.build.needsMaterialsLabel": "Materiais",
  "addWorkshop.build.needsMaterialsDetail":
    "Quem dá o workshop confirma o que é fornecido antes da primeira sessão.",
  "addWorkshop.build.needsIncludedTag": "incluído",
  "addWorkshop.build.needsYourselfLabel": "A tua presença",
  "addWorkshop.build.needsYourselfDetail":
    "Vem com curiosidade. O resto resolve-se com o teu grupo.",
  "addWorkshop.build.venueTba": "Local a confirmar",
  "addWorkshop.build.venueSharedOnReserve": "Partilhado quando reservares",
  "addWorkshop.build.accessNote":
    "Quem dá o workshop partilha os detalhes de acesso — percursos sem degraus, casas de banho, transportes — antes de te comprometeres.",

  // ── SkillsPage (+ section / card) ───────────────────────────────────────
  "skills.hero.eyebrow": "Competências e aprendizagem",
  "skills.hero.title": "Aprende com a tua <em>comunidade.</em>",
  "skills.hero.lead":
    "Sem propinas, sem algoritmos, sem falsa autoridade. Só pessoas boas naquilo que fazem e dispostas a partilhar o que sabem — e pessoas que querem melhorar.",
  "skills.filter.browseBy": "Explorar por:",
  "skills.filter.all": "Todas as competências",
  "skills.filter.design": "Design",
  "skills.filter.tech": "Tecnologia",
  "skills.filter.business": "Negócios",
  "skills.filter.craft": "Artesanato",
  "skills.filter.care": "Cuidado",
  "skills.filter.creative": "Criativo",
  "skills.intro":
    "Tudo aqui é oferecido e pedido por pessoas da comunidade. Se queres aprender algo, publica um Pedido no quadro. Se queres ensinar algo, publica uma Oferta.",
  "skills.empty.title": "Ainda ninguém partilhou uma competência aqui",
  "skills.empty.description":
    "Quando as pessoas se oferecerem para ensinar aquilo em que são boas — ou pedirem para aprender algo novo — vai aparecer aqui. Sê a primeira pessoa: publica um workshop, ou o que podes ensinar no quadro.",
  "skills.empty.listWorkshopCta": "Publicar um workshop",
  "skills.empty.postBoardCta": "Publicar no quadro",
  "skills.section.offeringTitle": "Pessoas a <em>oferecer-se</em> para ensinar",
  "skills.section.offeringEmpty":
    "Ainda ninguém se ofereceu para ensinar nesta categoria. Limpa o filtro para ver tudo o que a comunidade está a partilhar.",
  "skills.section.lookingTitle": "Pessoas <em>a querer</em> aprender",
  "skills.section.lookingEmpty":
    "Ainda ninguém pediu para aprender nesta categoria. Limpa o filtro para ver o que o resto da comunidade quer aprender.",
  "skills.section.nothingMatches": "Nada corresponde ao teu filtro",
  "skills.section.clearFilters": "Limpar filtros",
  "skills.offerStrip.title": "Tens algo <em>para ensinar?</em>",
  "skills.offerStrip.body":
    "Publica uma oferta de competência no quadro — o que podes ensinar, como, e para quem é. A comunidade vai encontrar-te.",
  "skills.offerStrip.cta": "Publicar no quadro",
  "skills.outro.title":
    "A melhor forma de melhorar é <em>conhecer alguém mais avançado.</em>",
  "skills.outro.sub":
    "Junta-te à rede e encontra pessoas que te podem ajudar a crescer — e pessoas que podes ajudar em troca.",
  "skills.outro.cta": "Pedir um convite",
  "skills.card.teaching": "A ensinar",
  "skills.card.learning": "A aprender",
  "skills.card.reachOut": "Contactar →",

  // ── SolidarityPage (+ directory) ────────────────────────────────────────
  "solidarity.hero.eyebrow": "Cuidado comunitário",
  "solidarity.hero.titleLine1": "Paga o que",
  "solidarity.hero.titleEm": "puderes.",
  "solidarity.hero.sub":
    "Profissionais da comunidade QueerPulse que oferecem tarifas em escala variável — porque o acesso a bons cuidados não devia depender do que ganhas.",
  "solidarity.hero.note":
    "Todes os profissionais foram verificados por pelo menos duas pessoas da comunidade.",
  "solidarity.how.step1.title": "Encontra o teu profissional",
  "solidarity.how.step1.body":
    "Filtra por profissão, bairro, ou idioma. Cada listagem explica como funciona a escala variável — sem surpresas.",
  "solidarity.how.step2.title": "Contacta diretamente",
  "solidarity.how.step2.body":
    "Contacta através da plataforma ou por email. Tu decides a conversa — não tens de explicar a tua situação financeira a mais ninguém primeiro.",
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
  "solidarityDirectory.contactCta": "Contactar →",
  "solidarityDirectory.empty.title": "Sem resultados para essa procura",
  "solidarityDirectory.empty.description":
    "Ainda ninguém corresponde a essa pesquisa. Tenta outra profissão ou limpa a pesquisa para ver todas as pessoas que oferecem cuidado em escala variável.",
  "solidarityDirectory.empty.clearFilters": "Limpar filtros",
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
  "ivaTracker.form.whatForPlaceholder": "ex.: Design de logótipo — Café Aurora",
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
    "A aproximar-se — resta apenas {remaining} de margem. Planeia bem o resto do ano antes de ultrapassares {threshold}.",
  "ivaTracker.status.overNote":
    "Ultrapassaste o limite de isenção de {threshold}. Podes terminar o ano isento, mas no próximo ano vais cobrar IVA — e ultrapassar {overrun} (25% acima) obriga-te a sair de imediato.",
  "ivaTracker.status.overrunTitle": "Tens de sair da <em>isenção.</em>",
  "ivaTracker.status.overrunBody":
    "Ultrapassaste {overrun} — mais de 25% acima do limite — pelo que a isenção do art. 53.º termina ainda este ano. Vais ter de começar a cobrar IVA e retirar a nota de isenção das tuas faturas.",
  "ivaTracker.status.overrunNote": "Até agora as tuas faturas tinham: {note}",

  // ── InvoiceForm / InvoiceFormFields / InvoiceLineItems / InvoicePreview / InvoiceGeneratorPage ──
  "invoiceTool.title": "Cria uma <em>fatura.</em>",
  "invoiceTool.sub":
    "Preenche os detalhes e vê a tua fatura-recibo a construir-se sozinha. Quando estiver como queres, guarda-a diretamente em PDF — sem conta, sem envios, nada sai do teu navegador.",
  "invoiceTool.issuer.legend": "Os teus dados",
  "invoiceTool.issuer.nameLabel": "Nome / empresa",
  "invoiceTool.issuer.namePlaceholder": "O teu nome ou estúdio",
  "invoiceTool.issuer.nifLabel": "NIF",
  "invoiceTool.issuer.emailLabel": "Email",
  "invoiceTool.issuer.addressLabel": "Morada",
  "invoiceTool.issuer.addressPlaceholder": "Rua, código postal, cidade",
  "invoiceTool.issuer.ibanLabel": "IBAN",
  "invoiceTool.client.legend": "Cliente",
  "invoiceTool.client.nameLabel": "Nome do cliente",
  "invoiceTool.client.namePlaceholder": "A quem estás a faturar",
  "invoiceTool.client.nifLabel": "NIF do cliente",
  "invoiceTool.client.addressLabel": "Morada do cliente",
  "invoiceTool.optional": "Opcional",
  "invoiceTool.meta.legend": "Fatura",
  "invoiceTool.meta.numberLabel": "Número da fatura",
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
    "Este documento é um âmbito de trabalho, não um contrato vinculativo. Tudo o que não conste em “O que está incluído” fica fora do âmbito e é orçamentado à parte.",
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
    "Um acordo de prestação de serviços claro, pronto em minutos. Preenche o trabalho, escolhe as cláusulas que te protegem e exporta um PDF real — tudo no teu navegador.",
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
    "Compara o que levarias para casa numa e noutra situação, com o mesmo rendimento bruto — e pesa os custos que não aparecem no recibo de vencimento.",
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
    "com {gross} brutos — cerca de {monthly} a mais por mês no teu bolso, antes dos custos abaixo.",
  "comparator.result.subLess":
    "com {gross} brutos — cerca de {monthly} a menos por mês, antes dos custos abaixo.",
  "comparator.result.costsTitle":
    "O que o <em>recibo de vencimento</em> não mostra",
  "comparator.hiddenCost.noHoliday":
    "Sem férias pagas — tu financias o teu próprio tempo livre.",
  "comparator.hiddenCost.noSubsidio":
    "Sem subsídio de férias nem de Natal (os dois meses extra de quem é assalariado).",
  "comparator.hiddenCost.noSickLeave":
    "Sem baixa por doença paga nem cobertura de desemprego garantida.",
  "comparator.hiddenCost.ownSS":
    "Pagas a tua própria Segurança Social, trimestralmente.",
  "comparator.hiddenCost.lumpyIncome":
    "O rendimento é irregular — meses de fartura e meses de vacas magras.",
  "comparator.hiddenCost.upside":
    "Mas: despesas dedutíveis, autonomia, e podes cobrar mais.",

  // ── RateBoardForm / RateBoardStats / RateBoardPage ─────────────────────
  "rateBoard.title": "O que <em>cobramos</em> mesmo.",
  "rateBoard.sub":
    "Tarifas diárias anónimas partilhadas pela comunidade, para ninguém ter de adivinhar. Adiciona a tua, vê onde te situas. Guardado neste dispositivo.",
  "rateBoard.form.title": "Adiciona a tua tarifa",
  "rateBoard.form.hint":
    "Sem nome, sem email — só os números. Fica neste dispositivo até exportares.",
  "rateBoard.form.roleLabel": "Função",
  "rateBoard.form.experienceLabel": "Experiência",
  "rateBoard.form.dayRateLabel": "Tarifa diária (€)",
  "rateBoard.form.dayRatePlaceholder": "ex.: 350",
  "rateBoard.form.typeLabel": "Tipo",
  "rateBoard.form.addCta": "Adicionar ao quadro",
  "rateBoard.form.compareLabel": "Vê onde te situas",
  "rateBoard.form.comparePlaceholder": "A tua tarifa diária (€)",
  "rateBoard.form.compareHint":
    "Mostramos o teu percentil em relação a todas as pessoas aqui — nada é adicionado ao quadro.",
  "rateBoard.form.addedToast": "Adicionado anonimamente",
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
    "Sê a primeira pessoa a adicionar uma tarifa, ou importa um ficheiro JSON que alguém te tenha partilhado. A distribuição aparece aqui assim que houver dados.",
  "rateBoard.stats.communityMedian": "Tarifa diária mediana da comunidade",
  "rateBoard.stats.across": "em",
  "rateBoard.stats.rateCount_one": "{count} tarifa",
  "rateBoard.stats.rateCount_other": "{count} tarifas",
  "rateBoard.stats.roleCount_one": "{count} função",
  "rateBoard.stats.roleCount_other": "{count} funções",
  "rateBoard.stats.yourRateSits": "A tua tarifa de {rate} situa-se no",
  "rateBoard.stats.percentileValue": "percentil {percentile}",
  "rateBoard.stats.aboveMost":
    "Acima de {percent}% das tarifas partilhadas aqui.",
  "rateBoard.stats.belowMost":
    "Abaixo da maioria das tarifas aqui — podes estar a deixar dinheiro em cima da mesa.",
  "rateBoard.disclaimer":
    "Partilhado anonimamente por membros da comunidade e não verificado — os valores são autodeclarados e cada situação é diferente. Trata isto como um ponto de partida para a conversa, não uma garantia. Guardado apenas neste dispositivo.",
  "rateBoard.export": "Exportar JSON",
  "rateBoard.import": "Importar JSON",
  "rateBoard.importAriaLabel": "Importar um ficheiro JSON do quadro de tarifas",
  "rateBoard.exportedToast": "Exportado",
  "rateBoard.invalidFileToast":
    "Esse ficheiro não é um quadro de tarifas — esperava-se um array JSON.",
  "rateBoard.noValidEntriesToast":
    "Não foram encontradas entradas válidas nesse ficheiro.",
  "rateBoard.importedToast_one": "{count} entrada importada",
  "rateBoard.importedToast_other": "{count} entradas importadas",
  "rateBoard.readErrorToast":
    "Não foi possível ler esse ficheiro — é JSON válido?",
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
    "No teu valor esperado de {gross}, isso são cerca de {monthly} por mês que guardas para o IRS e a Segurança Social — e não gastas.",
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
    "Indica o teu bruto anual e estimamos o que sobra depois do IRS e da Segurança Social no regime simplificado — recalculado em tempo real.",
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
  "takeHome.statusOption.eni": "ENI — empresário em nome individual (25,2% SS)",
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
    "Parte do rendimento que precisas para chegar a uma tarifa diária (e horária) que realmente te sustente — com despesas gerais, dias não pagos e IVA incluídos.",
  "dayRate.annualLabel": "Rendimento anual pretendido (€)",
  "dayRate.daysLabel": "Dias faturáveis por ano",
  "dayRate.overheadLabel": "Despesas gerais (% do rendimento)",
  "dayRate.hoursLabel": "Horas por dia faturável",
  "dayRate.ivaLabel": "Taxa de IVA",
  "dayRate.result.heading": "A tua tarifa diária",
  "dayRate.result.minLabel": "Tarifa diária mínima (sem IVA)",
  "dayRate.result.withIvaLabel": "Com IVA",
  "dayRate.result.hourlyLabel": "Por hora (sem IVA)",
  "dayRate.result.note": "Um ponto de partida — ajusta ao teu setor e mercado.",

  // ── SlidingScaleForm / SlidingScalePreview / SlidingScalePage ──────────
  "slidingScale.title": "Cobra com <em>solidariedade.</em>",
  "slidingScale.sub":
    "Publica uma escala variável para que cada pessoa pague o que couber nos seus meios — e continues a receber de forma justa. Exporta um cartão para partilhar.",
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
  "slidingScale.preview.priceFallback": "—",
  "slidingScale.preview.outro":
    "Paga o nível que for honesto para ti. Escolher um valor mais alto mantém este trabalho acessível a todas as pessoas.",
  "slidingScale.disclaimer":
    "Estes níveis são o preço definido por esta pessoa profissional — uma escala variável oferecida de boa fé, não uma tarifa de mercado fixa nem um teste de meios.",

  // ── ReciboVerdeGuidePage (page chrome only — see report re: GUIDE_SECTIONS) ──
  // Scope note: the guide's own section titles/bodies (reciboVerdeGuide.data.tsx
  // GUIDE_SECTIONS) are dense, article-citing pt-PT tax/legal explanations —
  // flagged and deliberately left English rather than risk a subtly wrong tax
  // instruction. Only this page's surrounding chrome is translated.
  "reciboGuide.heroTitle": "O guia dos <em>recibos verdes.</em>",
  "reciboGuide.heroLead":
    "Tornares-te freelancer em Portugal não devia significar afogares-te em jargão. Aqui tens todo o sistema de recibos verdes em linguagem simples e próxima — como te registares, o que vais dever, e o punhado de datas que realmente importam. Lê uma secção de cada vez.",
  "reciboGuide.ctaTitle": "Vamos <em>enviar uma?</em>",
  "reciboGuide.ctaText":
    "A ferramenta de faturação transforma tudo o que leste numa fatura-recibo pronta — com os coeficientes certos, as notas certas e as contas certas.",
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
    "Um kit de ferramentas para formar uma cooperativa de habitação queer em Portugal — desde encontrar as pessoas, até à constituição legal, ao financiamento, ao imóvel, à governação do dia a dia. <em>Cinco fases, modelos reais, pessoas já em cada uma delas.</em>",
  "housingCoop.hero.statsHead": "Cooperativas a formar-se agora",
  "housingCoop.phases.title": "Cinco <em>fases</em> da ideia às chaves",
  "housingCoop.phases.sub":
    "Calendário realista: 14–28 meses. Cada fase tem modelos, exemplos reais de cooperativas já existentes, e uma pessoa mentora para recorreres quando precisares.",
  "housingCoop.grid.title": "Cooperativas a <em>formar-se agora</em>",
  "housingCoop.grid.seeAll": "Ver as 8 →",
  "housingCoop.templates.title": "Modelos & <em>ferramentas</em>",
  "housingCoop.templates.sub":
    "Todos os documentos que gostávamos que nos tivessem dado. Preparados com a equipa jurídica da QueerPulse, traduzidos PT & EN, testados nos primeiros dois anos da Casa Sambizanga.",
  "housingCoop.templates.download": "Descarregar →",
  "housingCoop.startCta.eyebrow": "Começa uma cooperativa",
  "housingCoop.startCta.title": "Ainda não tens <em>o teu grupo</em>?",
  "housingCoop.startCta.body":
    "Publica que estás a começar e ligamos-te a outras pessoas na tua cidade à procura da mesma coisa. A maioria das cooperativas começa com 2–3 pessoas e cresce para 6+ nos primeiros 6 meses. <em>A Casa Sambizanga começou com três.</em>",
  "housingCoop.startCta.postCta": "Publica que estás a começar",
  "housingCoop.startCta.storyCta": "Lê a história da Casa Sambizanga",
  "housingCoop.startCta.resourcesHead": "Recursos & pessoas mentoras",

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
  "housingCoop.toast.preparingDownload":
    "A preparar “{name}” para descarregar…",
  "housingCoop.toast.postHelp":
    "Vamos ajudar-te a encontrar o teu grupo — confirma a tua caixa de entrada.",
  "housingCoop.toast.story": "A história da Casa Sambizanga está a chegar.",

  // ── JoinCoopModal ────────────────────────────────────────────────────────
  "joinCoop.askToJoinAriaLabel": "Pedir para te juntares a {name}",
  "joinCoop.success.title": "Pedido",
  "joinCoop.success.em": "enviado.",
  "joinCoop.success.closeLabel": "Concluído",
  "joinCoop.success.body":
    "A organização de <strong>{name}</strong> vai ver o teu interesse e entrar em contacto para marcar uma primeira conversa. Ainda sem compromisso — as primeiras conversas servem para perceber se encaixa bem, para os dois lados.",
  "joinCoop.title": "Pedir para te juntares a <em>{name}.</em>",
  "joinCoop.sub":
    "{location}. Conta-lhes um pouco sobre quem se vai juntar — vão entrar em contacto para marcar uma primeira conversa.",
  "joinCoop.nameLabel": "O teu nome *",
  "joinCoop.namePlaceholder": "Como te devemos chamar?",
  "joinCoop.householdLabel": "Quem se vai juntar *",
  "joinCoop.chooseOne": "Escolhe uma opção…",
  "joinCoop.noteLabel": "Algo que gostasses que soubessem",
  "joinCoop.notePlaceholder":
    "O que te atrai nesta cooperativa? A tua situação, prazos, esperanças…",
  "joinCoop.disclaimer":
    "O teu pedido é partilhado apenas com a organização desta cooperativa. Juntar-se a uma cooperativa é uma conversa longa, não um clique — leva o teu tempo.",
  "joinCoop.cancel": "Cancelar",
  "joinCoop.sending": "A enviar…",
  "joinCoop.sendCta": "Enviar pedido",
  "joinCoop.household.justMe": "Só eu",
  "joinCoop.household.mePlusPartners": "Eu + acompanhante(s)",
  "joinCoop.household.small": "Um agregado de 3–4",
  "joinCoop.household.large": "Um agregado de 5+",

  // ── OfferPage (Asks & Offers board detail) ─────────────────────────────
  // Scope note: MAIN/OTHERS in OfferPage.tsx (the zine-collab ask, the free
  // portraits/mentoring/sublet offers, poster names/roles/bios) are
  // member-authored marketplace posts — in live mode fetched from the board.
  // Left in English. Only the surrounding chrome below is translated.
  "offerBoard.backLink": "← Pedidos & Ofertas",
  "offerBoard.pill.looking": "Procura",
  "offerBoard.pill.offering": "Oferece",
  "offerBoard.respondCta": "Responder a {name} →",
  "offerBoard.seeProfileCta": "Ver o perfil",
  "offerBoard.postedBy": "Publicado por",
  "offerBoard.sidebarNote":
    "{name} é uma pessoa membro em situação regular. Cada pessoa membro tem o aval de alguém que já está na comunidade.",
  "offerBoard.sidebarNoteVerified":
    "{name} é uma pessoa membro em situação regular e foi verificada pela equipa. Cada pessoa membro tem o aval de alguém que já está na comunidade.",
  "offerBoard.sayHelloCta": "Diz olá a {name}",
  "offerBoard.moreFromBoard": "Mais do <em>quadro</em>",

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
    "← Escolher uma empresa existente",
  "affiliateCompanyModal.roleLabel": "O teu cargo lá",
  "affiliateCompanyModal.cancel": "Cancelar",
  "affiliateCompanyModal.creating": "A criar…",
  "affiliateCompanyModal.verifying": "A verificar…",
  "affiliateCompanyModal.createCta": "Criar e continuar",
  "affiliateCompanyModal.confirmCta": "Confirmar e continuar",
  "affiliateCompanyModal.createErrorToast":
    "Não foi possível criar essa empresa. Tenta novamente.",

  // ── IncubatorModals: CohortApplyModal ────────────────────────────────────
  "incubatorApply.success.title": "Candidatura",
  "incubatorApply.success.em": "recebida.",
  "incubatorApply.success.body":
    "Obrigade, <strong>{name}</strong>. As candidaturas à Coorte 3 são lidas pela equipa do programa depois do prazo de 30 de julho — terás resposta dentro de três semanas, seja qual for a decisão.",
  "incubatorApply.eyebrow": "Incubadora · Coorte 3",
  "incubatorApply.title": "Candidata-te a <em>construir a tua ideia.</em>",
  "incubatorApply.sub":
    "Seis meses de mentoria, responsabilização entre pares e apresentações calorosas. Não é preciso pitch deck — diz-nos só o que estás a criar e em que ponto estás.",
  "incubatorApply.nameLabel": "O teu nome *",
  "incubatorApply.namePlaceholder": "Nome e apelido",
  "incubatorApply.emailLabel": "Email *",
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
  "mentorSignup.expertiseLabel": "Em que podes ajudar? *",
  "mentorSignup.expertisePlaceholder":
    "ex.: Produto, angariação de fundos, jurídico, contratação",
  "mentorSignup.whyLabel": "Porquê fazer mentoria? *",
  "mentorSignup.whyPlaceholder":
    "Uma ou duas frases sobre o que trazes e a quem gostarias mais de apoiar.",
  "mentorSignup.charsNeeded_one": "Falta {count} caráter para enviar.",
  "mentorSignup.charsNeeded_other": "Faltam {count} carateres para enviar.",
  "mentorSignup.looksGood":
    "Analisamos todas as pessoas mentoras antes do match — deves ter notícias em breve.",
  "mentorSignup.submitCta": "Inscrever-me para fazer mentoria",

  // ── IncubatorModals: RequestSessionModal ─────────────────────────────────
  "requestSession.success.title": "Sessão",
  "requestSession.success.em": "pedida.",
  "requestSession.success.body":
    "O teu pedido chegou a <strong>{name}</strong>. As pessoas mentoras respondem dentro de alguns dias para confirmar uma hora — fica atente ao teu email, é de lá que virá o contacto.",
  "requestSession.eyebrow": "Incubadora · {role}",
  "requestSession.title": "Pede uma sessão com <em>{name}.</em>",
  "requestSession.sub":
    "Uma nota breve já ajuda bastante. Diz no que estás a trabalhar e quando gostarias de te encontrar — {firstName} vai responder para combinar.",
  "requestSession.whenLabel": "Horário preferido *",
  "requestSession.whenPlaceholder":
    "ex.: Noites de semana, ou terças/quintas à tarde",
  "requestSession.messageLabel": "Sobre o que gostarias de falar? *",
  "requestSession.messagePlaceholder":
    "Algumas frases sobre em que ponto estás e onde mais gostarias de ajuda.",
  "requestSession.looksGood":
    "Está bem. As pessoas mentoras costumam responder dentro de alguns dias.",
  "requestSession.sendCta": "Enviar pedido",
};
