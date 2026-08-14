import type { Catalog } from "../../types";

/**
 * Homepage — pt-PT inclusivo. Mesmas chaves que `en/homepage.ts`.
 *
 * Notas de tradução:
 * - "Members" → *pessoas* / *a comunidade*, nunca *Membros*.
 * - Registo `tu`, caloroso, nunca `você`.
 * - Formas neutras (*bem-vinde*-style) só no discurso direto à pessoa
 *   (newsletter, saudações) — nunca como neutro por omissão masculino.
 * - Nomes próprios (QueerPulse, Cinema, Studio, bairros de Lisboa) mantêm-se.
 * - Conteúdo fictício de pessoas/comunidades (nomes, bios, citações, títulos
 *   de publicações no quadro) NÃO é traduzido — em modo live vem da API como
 *   texto de quem o escreveu.
 */
export const homepage: Catalog = {
  // ── Meta da página ─────────────────────────────────────────────────────────
  "meta.title":
    "QueerPulse: a comunidade queer de Lisboa, online e na vida real",
  "meta.description":
    "Uma comunidade queer só por convite para Lisboa, tanto presencial como online: convívios, trocas de saberes e apoio mútuo, entre pessoas que aparecem umas pelas outras.",

  // ── Hero ───────────────────────────────────────────────────────────────────
  "hero.eyebrow": "Ao vivo em Lisboa",
  "hero.title": "A tua gente, <em>aqui mesmo em Lisboa.</em>",
  "hero.sub":
    "É onde a Lisboa queer se encontra mesmo, tanto ao vivo como online. Toda a gente entrou com o voto de confiança de quem já cá estava, por isso a sala inteira escolheu estar. Uma comunidade que é de quem cá está.",
  "hero.requestInviteCta": "Pedir um convite",
  "hero.exploreMembersCta": "Explorar pessoas",
  "hero.note": "Todas as semanas entram pessoas novas, sempre com um voto de confiança.",

  // ── Manifesto ("about") ──────────────────────────────────────────────────
  "manifesto.label": "O nosso manifesto",
  "manifesto.lead":
    "Uma plataforma de comunidade, construída <em>como devia ter sido desde o início.</em>",
  "manifesto.body1":
    "A QueerPulse existe porque já não aguentávamos plataformas que tratam pessoas queer como um segmento de mercado em vez de uma comunidade. Cada funcionalidade aqui nasceu porque alguém precisava dela.",
  "manifesto.body2":
    "A adesão é só por convite e por voto de confiança. Confiamos em ti, e a confiança é o ponto de tudo: todas as pessoas nesta sala escolheram estar aqui, umas pelas outras.",
  "manifesto.safetyCta": "Como mantemos isto seguro",
  "manifesto.assurance.vouched.title": "Convite ou voto de confiança",
  "manifesto.assurance.vouched.description":
    "Cada pessoa entra através de um voto de confiança ou de um pedido de convite analisado, sempre com curadoria.",
  "manifesto.assurance.safeSpaces.title": "Espaços seguros onde já estivemos",
  "manifesto.assurance.safeSpaces.description":
    "Locais que a nossa equipa de moderação visita em pessoa, com data de verificação à vista.",
  "manifesto.assurance.encrypted.title": "Encriptação de ponta a ponta",
  "manifesto.assurance.encrypted.description":
    "As mensagens diretas são encriptadas: as conversas privadas mantêm-se privadas.",
  "manifesto.assurance.privacy.title": "Tu decides o que é visível",
  "manifesto.assurance.privacy.description":
    "Define o teu perfil, fotografias e atividade como públicos, só para a comunidade, ou só para ti.",
  "manifesto.assurance.moderation.title": "Moderação 24 horas por dia",
  "manifesto.assurance.moderation.description":
    "As denúncias têm resposta real, normalmente em poucas horas.",

  // ── TrustStrip ─────────────────────────────────────────────────────────────
  "trustStrip.vouched": "Só por convite e voto de confiança",
  "trustStrip.encrypted": "Encriptação de ponta a ponta",
  "trustStrip.moderation": "Moderação ativa",
  "trustStrip.blockMuteReport": "Bloquear, silenciar, denunciar",
  "trustStrip.privacyControls": "Controlos de privacidade detalhados",
  "trustStrip.reportCta": "Lê a nossa política de segurança",

  // ── PainPoints ("porque construímos isto") ──────────────────────────────────
  "painPoints.eyebrow": "Porque construímos isto",
  "painPoints.title":
    "Construímos a plataforma porque <em>também precisávamos dela.</em>",
  "painPoints.sub":
    "Cada funcionalidade começou por ser algo que gostávamos que já existisse.",

  "painPoints.hero1.eyebrow": "A primeira falha que sentimos",
  "painPoints.hero1.question":
    '"Onde é que eu conheço pessoas que percebem isto?"',
  "painPoints.hero1.heading": "Por isso construímos <em>a rede.</em>",
  "painPoints.hero1.body":
    "Cada pessoa aqui tem o voto de confiança de alguém que já está dentro. Sem swipes, sem mensagens às cegas, sem teres de provar que pertences aqui.",
  "painPoints.hero1.builtLabel": "Construímos a rede de votos de confiança",
  "painPoints.hero1.cta": "Conhecer a comunidade",

  "painPoints.marker1": "Depois de entrares na sala, abrem-se mais portas.",

  "painPoints.exchange1.question":
    '"Preciso de um favor, mas não sei a quem pedir."',
  "painPoints.exchange1.heading": "Por isso construímos <em>o quadro.</em>",
  "painPoints.exchange1.body":
    "Publica o que precisas ou o que podes oferecer, de um quarto livre a uma tradução no próprio dia, e deixa a comunidade responder.",
  "painPoints.exchange1.cta": "Ver o quadro",

  "painPoints.exchange2.question":
    '"Quero gastar o meu dinheiro com pessoas como eu."',
  "painPoints.exchange2.heading": "Por isso construímos <em>o diretório.</em>",
  "painPoints.exchange2.body":
    "Lojas, ateliês e serviços de pessoas queer por toda a Lisboa: fáceis de encontrar, fáceis de apoiar.",
  "painPoints.exchange2.cta": "Ver o diretório",

  "painPoints.exchange3.question":
    '"Quero organizar um convívio, só não sei como."',
  "painPoints.exchange3.heading":
    "Por isso construímos <em>um guia para organizar.</em>",
  "painPoints.exchange3.body":
    "Um guia passo a passo para organizares o teu primeiro jantar comunitário, oficina ou sessão de cinema, com o apoio da comunidade.",
  "painPoints.exchange3.cta": "Começar a organizar",

  "painPoints.exchange4.question":
    '"Tenho um saber para ensinar, e outro que quero aprender."',
  "painPoints.exchange4.heading":
    "Por isso estamos a construir <em>as trocas de saberes.</em>",
  "painPoints.exchange4.body":
    "Troca o que sabes pelo que precisas. Sem faturas, sem algoritmo: só pessoas a ensinarem-se umas às outras. Em breve.",
  "painPoints.exchange4.cta": "Ver no roteiro",

  "painPoints.hero2.eyebrow": "A falha mais difícil de sentir",
  "painPoints.hero2.question": '"E se eu não estiver bem?"',
  "painPoints.hero2.heading":
    "Por isso construímos <em>uma rede de segurança.</em>",
  "painPoints.hero2.body":
    "Terapeutas que percebem, apoio entre pares sem julgamentos, e linhas de crise que atendem: tudo analisado pela comunidade que precisa disto.",
  "painPoints.hero2.builtLabel": "Construímos o centro de bem-estar",
  "painPoints.hero2.cta": "Ver recursos de bem-estar",

  "painPoints.marker2": "E para lá da sala, as perguntas mais difíceis.",

  "painPoints.exchange5.question":
    '"Quero fazer alguma coisa, não só publicar sobre isso."',
  "painPoints.exchange5.heading":
    "Por isso construímos <em>uma forma de agir.</em>",
  "painPoints.exchange5.body":
    "Campanhas locais, entreajuda e organização: formas reais de fazer algo acontecer, em conjunto.",
  "painPoints.exchange5.cta": "Participar",

  "painPoints.exchange6.question": '"Conheço mesmo os meus direitos aqui?"',
  "painPoints.exchange6.heading":
    "Por isso construímos <em>guias em linguagem simples.</em>",
  "painPoints.exchange6.body":
    "Informação legal clara sobre a vida LGBTQ+ em Portugal: sem precisares de um curso de Direito.",
  "painPoints.exchange6.cta": "Ler os guias",

  "painPoints.exchange7.question":
    '"Vou estar mesmo em segurança neste trabalho?"',
  "painPoints.exchange7.heading":
    "Por isso estamos a construir <em>as avaliações de empregadores.</em>",
  "painPoints.exchange7.body":
    "Avaliações honestas de pessoas queer que já lá trabalharam, para saberes antes de aceitares a proposta. Em breve.",
  "painPoints.exchange7.cta": "Ver no roteiro",

  // ── Discovery (destaque de pessoas) ───────────────────────────────────────
  "discovery.eyebrow": "Mais de {count} pessoas, e a crescer",
  "discovery.title": "Aqui é toda a gente <em>real.</em>",
  "discovery.sub":
    "Cada cara aqui é uma pessoa autêntica e com voto de confiança da comunidade queer de Lisboa: um retrato real de alguém a quem podes mesmo dizer olá.",
  "discovery.exploreMembersCta": "Explorar pessoas",
  "discovery.footNote": "Todas as semanas chegam caras novas.",
  "discovery.verifiedBadge": "Verificação",
  "discovery.featuredMember": "Pessoa em destaque",
  "discovery.vouchedBy": "Com voto de confiança de {name}",
  "discovery.viewProfile": "Ver perfil",
  "discovery.sayHello": "Diz olá",
  "membersExplainer.eyebrow": "Só para a comunidade",
  "membersExplainer.title": "A comunidade <em>move</em> a QueerPulse",
  "membersExplainer.titlePlain": "A comunidade move a QueerPulse",
  "membersExplainer.lede":
    "O diretório da comunidade abre-se assim que entras. Eis porque o mantemos assim, e como te juntares.",
  "membersExplainer.pillars.vouched.title": "Pessoas reais, com voto de confiança",
  "membersExplainer.pillars.vouched.body":
    "Cada pessoa é convidada e recebe o voto de confiança de alguém que já cá está. Sem bots, sem estranhos a copiar a lista.",
  "membersExplainer.pillars.inside.title": "O melhor abre-se por dentro",
  "membersExplainer.pillars.inside.body":
    "Perfis completos, comunidades e encontros abrem-se no momento em que te juntas.",
  "membersExplainer.pillars.safe.title": "Só por convite mantém um espaço seguro",
  "membersExplainer.pillars.safe.body":
    "Manter o diretório só para a comunidade é como quem cá está consegue ser plenamente quem é.",
  "membersExplainer.requestInviteCta": "Pedir um convite",
  "membersExplainer.signInCta": "Já faço parte",
  "discovery.featuredMembersAria": "Pessoas em destaque",
  "discovery.featureMemberAria": "Mostrar {name}",

  // ── Live sections (curadoria da equipa, dados reais) ──────────────────────
  "liveDiscovery.eyebrow": "Escolhido pela nossa equipa",
  "liveCommunities.sub":
    "Algumas comunidades que a nossa equipa quis mostrar-te: salas reais, geridas por pessoas reais.",
  "liveCommunities.memberCount": "{count} membros",

  // ── Gatherings (destaque na homepage) ─────────────────────────────────────
  "gatherings.title": "Encontra-te em <em>salas reais.</em>",
  "gatherings.subtitle":
    "Jantares, oficinas, sessões de cinema e caminhadas: convívios reais a acontecer por Lisboa este mês.",
  "gatherings.spots.seatsLeft": "lugares restantes",
  "gatherings.spots.spotsLeft": "vagas restantes",
  "gatherings.spots.going": "pessoas vão",
  "gatherings.spots.casual": "Informal",
  "gatherings.cta.seeDetails": "Ver detalhes do evento",

  // ── Stories ────────────────────────────────────────────────────────────────
  "stories.title": "Contado <em>com as nossas palavras.</em>",
  "stories.subtitle":
    "Ensaios, perfis e reportagens de dentro da comunidade: sem olhar de fora, sem termos de nos explicar.",
  "stories.imagePlaceholder": "imagem da história",

  // ── ChangeMakers ───────────────────────────────────────────────────────────
  "changeMakers.eyebrow": "Agentes de mudança",
  "changeMakers.title": "A construir a <em>Lisboa que queremos.</em>",
  "changeMakers.sub":
    "Pessoas organizadoras, ativistas e gente do dia a dia a impulsionar esta cidade.",
  "changeMakers.cta": "Conhecer os agentes de mudança",
  "changeMakers.portraitPlaceholder": "retrato de {name}",

  // ── Communities (variante G — destaque + índice) ───────────────────────────
  "communities.eyebrow": "Comunidades · Lisboa",
  "communities.title":
    "A comunidade é mais forte <em>quando se constroem juntas</em>",
  "communities.sub":
    "Pesquisa ou filtra a lista e depois abre qualquer comunidade para veres a sala toda: o que é, o que faz, quem está lá dentro, e o que desbloqueias ao entrar.",
  "communities.howCommunitiesWorkCta": "Como funcionam as comunidades",
  "communities.resultCount.all": "<b>{count}</b> comunidades",
  "communities.resultCount.shown": "<b>{count}</b> de {total} comunidades",

  "communities.toolbar.searchPlaceholder": "Pesquisar comunidades…",
  "communities.toolbar.searchAriaLabel": "Pesquisar comunidades",
  "communities.toolbar.langAriaLabel": "Filtrar por idioma",
  "communities.toolbar.langAllOption": "Todos os idiomas",
  "communities.toolbar.hoodAriaLabel": "Filtrar por bairro",
  "communities.toolbar.hoodAllOption": "Todas as zonas",
  "communities.toolbar.sortLabel": "Ordenar",
  "communities.toolbar.sortAriaLabel": "Ordenar comunidades",
  "communities.toolbar.sort.active": "Mais ativas",
  "communities.toolbar.sort.size": "Maiores",
  "communities.toolbar.sort.new": "Mais recentes",
  "communities.toolbar.sort.near": "Mais próximas",

  "communities.category.all": "Todas",
  "communities.category.social": "Social",
  "communities.category.arts": "Artes",
  "communities.category.support": "Apoio",
  "communities.category.activism": "Ativismo",
  "communities.category.sports": "Desporto",
  "communities.category.professional": "Profissional",

  "communities.access.open": "Adesão aberta",
  "communities.access.request": "Adesão por pedido",
  "communities.access.invite": "Só por convite",
  "communities.access.private": "Privada",

  "communities.rail.showingCount": "A mostrar · {count}",
  "communities.rail.noMatches": "Sem resultados",
  "communities.rail.emptyTitle": "Nenhuma comunidade corresponde.",
  "communities.rail.emptyBody": "Alarga o filtro ou limpa a tua pesquisa.",
  "communities.rail.privateNoHeadcount": "Privada: sem contagem de pessoas",
  "communities.clearFiltersCta": "Limpar filtros",

  "communities.spotlight.emptyTitle": "Ainda não há nada aqui.",
  "communities.spotlight.emptyBody":
    "Nenhuma comunidade corresponde a estes filtros. Alarga a pesquisa, ou começa a que está a faltar.",
  "communities.spotlight.startCommunityCta": "Começar uma comunidade",
  "communities.spotlight.quiet.membersOnlyPrivate":
    "Só para a comunidade · privada",
  "communities.spotlight.quiet.discreetSafe":
    "Discreta e segura · sem contagem de pessoas",
  "communities.spotlight.quiet.enterCta": "Entrar",
  "communities.spotlight.whatHappensHere": "O que acontece aqui",
  "communities.spotlight.whatYouGet": "O que ganhas ao entrar",
  "communities.spotlight.keptBy": "Mantida por <b>{name}</b> e {extra}",
  "communities.spotlight.keptByName": "Mantida por <b>{name}</b>",
  "communities.spotlight.sinceLabel": "Desde {year}",

  "communities.room.pulse": "o feed ao vivo",
  "communities.room.discussions": "conversas",
  "communities.room.events": "convívios e confirmações",
  "communities.room.resources": "guias e biblioteca",

  // ── Newsletter ─────────────────────────────────────────────────────────────
  "newsletter.title": "Mantém-te ligade. <em>Uma vez por semana.</em>",
  "newsletter.subtitle":
    "O resumo semanal da QueerPulse chega toda a quinta-feira: pessoas novas para conheceres, convívios a chegar, trocas de saberes abertas e um texto que vale o teu tempo. Sem ruído.",
  "newsletter.emailRequiredToast": "Introduz o teu email",
  "newsletter.subscribedToast": "Estás na lista, até quinta-feira",
  "newsletter.success.title": "Estás na lista, <em>quase.</em>",
  "newsletter.success.body":
    "Vamos começar a enviar o <strong>resumo semanal</strong> para <strong>{email}</strong> todas as quintas-feiras.",
  "newsletter.success.checkInboxNote":
    "Está tudo pronto: não é preciso email de confirmação. Podes alterar ou parar a qualquer momento nas definições.",
  "newsletter.success.useDifferentEmailCta": "Usar outro email",
  "newsletter.emailPlaceholder": "oteu@email.com",
  "newsletter.subscribeCta": "Subscrever",
  "newsletter.note":
    "Só para a comunidade · sem spam · cancela quando quiseres",
  "newsletter.comingSoon":
    "O resumo semanal ainda não está a ser enviado. Ainda o estamos a construir. Quando estiver disponível, poderás subscrever aqui mesmo.",
  // Dupla confirmação em modo live: mensagem honesta de "confirma na tua caixa
  // de entrada", distinta do fluxo de demonstração acima (que finge uma
  // subscrição imediata, sem email).
  "newsletter.live.success.title":
    "Quase lá, <em>vê a tua caixa de entrada.</em>",
  "newsletter.live.success.body":
    "Acabámos de enviar um link de confirmação para <strong>{email}</strong>. Abre-o e começarás a receber o resumo semanal todas as quintas-feiras.",
  "newsletter.live.success.checkInboxNote":
    "Não recebeste? Espera um minuto e vê a pasta de spam. Nada é enviado até confirmares.",
  "newsletter.live.errorToast":
    "Algo correu mal do nosso lado. Tenta novamente daqui a pouco.",
  "newsletter.live.submittingCta": "A enviar…",

  // ── Outro (chamada final) ──────────────────────────────────────────────────
  "outro.title": "Entra numa sala onde <em>já pertences.</em>",
  "outro.sub":
    "A adesão é por convite e mantida pequena de propósito. Se alguém em quem confias já está cá, pede-lhe um voto de confiança.",
  "outro.cta": "Pedir um convite",
};
