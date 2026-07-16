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
  "workHub.emptyLive.title": "O teu espaço de trabalho está pronto quando quiseres",
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
  "workHub.next.mentor.label": "{name} respondeu sobre o teu emparelhamento de mentoria",
  "workHub.next.mentor.context": "Uma primeira chamada de apresentação está em cima da mesa.",
  "workHub.next.mentor.cta": "Ler resposta",
  "workHub.next.grant.label": "Prazo do micro-subsídio esta sexta-feira",
  "workHub.next.grant.context": "{fund} · até {amount}.",
  "workHub.next.grant.urgency": "Prazo sex.",
  "workHub.next.grant.cta": "Ver subsídio",
  "workHub.next.profile.label": "O teu perfil de trabalho está {percent}% completo",
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
  "workProfile.success.title": "O teu perfil de trabalho está <em>definido.</em>",
  "workProfile.success.sub":
    "Apareces às empresas exatamente como escolheres — e nunca de outra forma.",
  "workProfile.success.backCta": "Voltar ao teu espaço de trabalho",
  "workProfile.success.editCta": "Continuar a editar",
  "workProfile.eyebrow": "Perfil de trabalho",
  "workProfile.title": "Como apareces <em>no trabalho.</em>",
  "workProfile.sub":
    "Isto controla o que as empresas veem — e o que fica só contigo. Nada aqui é partilhado sem a tua autorização.",
  "workProfile.saveCta": "Guardar perfil de trabalho",
  "workProfile.savedToast": "Perfil de trabalho guardado",

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
  "workProfile.focus.difficultWorkplace": "Navegar um ambiente de trabalho difícil",
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

  "jobs.employers.title": "Empresas queer <em>em que confiamos</em>",
  "jobs.employers.subtitle":
    "Estas organizações são geridas por ou para a comunidade queer. Trabalhar aqui significa que o teu dinheiro fica na rede.",

  // ── Distintivos de segurança (vocabulário partilhado) ──────────────────
  "safetyBadge.verified.label": "Verificada como segura",
  "safetyBadge.verified.blurb":
    "Conquistado, não reclamado. Confirmamos as políticas inclusivas no papel e cruzamos com pelo menos três avaliações anónimas de pessoas LGBTQ+ que ali trabalham ou trabalharam. Reavaliado todos os anos.",
  "safetyBadge.trans.label": "Amiga de pessoas trans",
  "safetyBadge.trans.blurb":
    "Prática documentada de inclusão trans: cuidados de saúde de afirmação de género no plano, um processo de mudança de nome e pronomes, e instalações neutras quanto ao género — confirmado por avaliações de quem lá trabalha.",
  "safetyBadge.out.label": "Seguro para te assumires",
  "safetyBadge.out.blurb":
    "A comunidade avalia esta empresa com 8+/10 em \"seguro para te assumires no trabalho\" — ser aberte sobre quem és aqui é um não-acontecimento, não um risco.",
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

  "housing.tipsHeading": "Habitação em Lisboa — <em>o que precisas de saber</em>",
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
  "housing.tip.emergency.title": "Em caso de emergência, pede ajuda à comunidade",
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
  "housingModal.recommend.whatShouldKnow": "O que devem saber as outras pessoas?",
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
  "listSpace.titlePlaceholder": "ex.: Quarto soalheiro numa casa partilhada queer",
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
  "employerReviews.recent.browseCta": "Ver vagas inclusivas para pessoas queer →",
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
  "jobApply.error.missingFields": "Adiciona o teu nome e email antes de enviar.",
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
};
