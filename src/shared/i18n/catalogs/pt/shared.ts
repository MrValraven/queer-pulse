import type { Catalog } from "../../types";

/**
 * European Portuguese (pt-PT), inclusive/gender-neutral per the priority order
 * in docs/i18n/glossary-pt.md: neutral rephrasing first ("Members" → "Pessoas",
 * never "Membros"), warm second-person ("tu"), then -e/elu forms only when
 * addressing the member directly. Mirrors `en/shared.ts` key-for-key — see
 * that file's comments for which component each section belongs to.
 */
export const shared: Catalog = {
  "brand.wordmark": "Queer<em>Pulse</em>",

  "loading.label": "A carregar…",

  // Consent banner
  "consent.banner.ariaLabel": "Escolhas de cookies e privacidade",
  "consent.banner.title": "Uma palavra breve sobre <em>cookies.</em>",
  "consent.banner.body":
    "Só guardamos o que é necessário para manteres a sessão iniciada e em segurança, por predefinição. Os relatórios de erros ficam desligados a menos que digas que sim: sem anúncios, sem análise de comportamento, sem perfilagem, nunca. Muda de ideias quando quiseres, nas definições. <a>Lê a política</a>.",

  "consent.actions.rejectNonEssential": "Rejeitar não essenciais",
  "consent.actions.choose": "Escolher",
  "consent.actions.accept": "Aceitar",
  "consent.actions.saveChoices": "Guardar escolhas",

  // Consent preference center
  "consent.preferences.eyebrow": "Privacidade",
  "consent.preferences.title": "As tuas <em>escolhas.</em>",
  "consent.preferences.sub":
    "Os cookies estritamente necessários mantêm a tua sessão iniciada e em segurança. Estão sempre ativos. O resto depende de ti, e podes alterá-lo quando quiseres.",
  "consent.preferences.necessary.title": "Estritamente necessários",
  "consent.preferences.necessary.desc":
    "Os teus cookies de sessão e CSRF, mais o tema e o idioma guardados no teu dispositivo. Necessários para o funcionamento da plataforma. Nunca usados para te seguir.",
  "consent.preferences.necessary.alwaysOnAria": "Sempre ativo",
  "consent.preferences.rows.monitoring.title": "Erros e falhas",
  "consent.preferences.rows.monitoring.desc":
    "Diagnóstico automático quando algo falha, para resolvermos mais depressa. Não inclui dados de publicidade nem de perfilagem.",

  // Feedback: AuthLoader / RouteFallback / ErrorFallback / RoomLoader
  "feedback.errorFallback.title": "Algo correu mal do nosso <em>lado</em>",
  "feedback.errorFallback.body":
    "Não foi nada que tenhas feito, e nada se perdeu. Tenta outra vez, ou volta ao início. Já estamos a tratar disto.",
  "feedback.errorFallback.tryAgain": "Tentar outra vez",
  "feedback.errorFallback.reference": "Referência: {referenceId}",

  "loadError.title": "Não conseguimos <em>carregar</em>",
  "loadError.body":
    "O pedido não voltou. A falha é nossa. Tenta outra vez daqui a um momento.",
  "loadError.retryCta": "Tentar outra vez",

  "feedback.roomLoader.ariaLabel": "A preparar a sala",
  "feedback.roomLoader.title": "A preparar a tua <em>sala</em>",
  "feedback.roomLoader.caption": "A servir o café, a baixar as luzes…",
  "feedback.roomLoader.steps.signingIn": "A iniciar sessão",
  "feedback.roomLoader.steps.gettingData": "A obter os teus dados",
  "feedback.roomLoader.steps.preparingRoom": "A preparar a sala",

  // Auth session-load failure
  "auth.error.server":
    "Não conseguimos carregar a tua conta. O servidor da QueerPulse teve um erro ({status}). A responsabilidade é nossa. Tenta outra vez daqui a pouco.",
  "auth.error.network":
    "Não conseguimos contactar a QueerPulse para carregar a tua conta. Verifica a tua ligação e tenta outra vez daqui a pouco.",
  "auth.error.expired":
    "A tua sessão expirou. Inicia sessão outra vez para continuares de onde ficaste.",

  // Provider-level fallback error toasts
  "profile.saveError": "Não conseguimos guardar o teu perfil. Tenta outra vez.",
  "social.blockError":
    "Não conseguimos atualizar esse bloqueio. Tenta outra vez.",
  "social.genericError": "Não conseguimos atualizar isso. Tenta outra vez.",

  // AppNav

  // AccountMenu
  "accountMenu.items.profile": "Perfil",
  "accountMenu.items.connections": "Ligações",
  // ACQ-08 — o convite feito por quem já é membro, com a contagem de convites
  // por usar colada pelo `useInviteQuotaBadge`.
  "accountMenu.items.invite": "Convidar alguém",
  "accountMenu.items.vouch": "Avalizar alguém",
  "accountMenu.items.messages": "Mensagens",
  "accountMenu.items.work": "Trabalho",
  // Descoberta de personas, Fase 5, Momento 3 — a linha "As tuas personas"
  // (badge via usePersonaBadge). Separado de `accountMenu.items.subprofiles`
  // acima, uma entrada pré-existente com outro texto.
  "accountMenu.items.personas": "As tuas personas",
  "accountMenu.items.events": "Eventos",
  "accountMenu.items.cards": "Cartões",
  "accountMenu.items.drafts": "Rascunhos",
  "accountMenu.items.pitches": "Propostas",
  "accountMenu.items.saved": "Guardados",
  "accountMenu.items.settings": "Definições",
  "accountMenu.items.gettingStarted": "Primeiros passos",
  "accountMenu.items.installApp": "Instalar a app",
  "accountMenu.items.help": "Ajuda",
  "installAppModal.title": "Instalar a app",
  "installAppModal.sub":
    "Adiciona a QueerPulse ao teu ecrã principal em poucos toques. A mesma app, sem loja de aplicações.",
  "accountMenu.ariaLabel": "Menu da conta",
  "accountMenu.header.subtitle": "Perfil e conta",
  "accountSheet.title": "A sua conta",
  // ProfileInviteCard — a faixa discreta de convites no fim do perfil de quem
  // é dono dele (ACQ-08). Fica em `shared:` ao lado de `accountMenu.*` porque
  // as duas entradas são um par. Nunca aparece sem convites por dar, por isso
  // não há caso de zero aqui.
  "inviteCard.ariaLabel": "Os teus convites",
  "inviteCard.title_one": "Resta-te {count} convite este mês",
  "inviteCard.title_other": "Restam-te {count} convites este mês",
  "inviteCard.body": "Traz alguém que gostavas de ver por aqui.",
  "inviteCard.resets_one": "O limite renova amanhã.",
  "inviteCard.resets_other": "O limite renova daqui a {count} dias.",
  "inviteCard.resets_zero": "O limite renova hoje.",
  "inviteCard.cta": "Convidar alguém",
  "accountSheet.viewProfile": "Ver perfil",
  "accountMenu.staff.magazineEditor": "Editor da revista",
  "accountMenu.staff.magazineWriter": "Espaço de quem escreve",
  "accountMenu.staff.admin": "Admin",
  "accountMenu.mod.modTools": "Ferramentas de moderação",
  "accountMenu.controls.populatePlatform": "Preencher a plataforma",
  "accountMenu.controls.on": "Ativo",
  "accountMenu.controls.off": "Inativo",
  "accountMenu.controls.noApi": "Sem API",
  "accountMenu.controls.actingAs": "A atuar como",
  "accountMenu.controls.simulatedRoleAria": "Cargo de equipa simulado",
  "accountMenu.controls.roleStaff": "Equipa",
  "accountMenu.controls.roleMod": "Moderação",
  "accountMenu.controls.roleMember": "Pessoa",
  "accountMenu.controls.navigation": "Navegação",
  "accountMenu.controls.navigationLayoutAria": "Esquema de navegação",
  "accountMenu.controls.navTopBar": "Barra superior",
  "accountMenu.controls.navSidebar": "Barra lateral",

  // AdminRoleSwitcher
  "adminRoleSwitcher.avatarPlaceholderAria": "Avatar da conta",
  "adminRoleSwitcher.roleStaffAdmin": "Admin da equipa",
  "adminRoleSwitcher.roleCommunityMod": "Moderação de comunidade",
  "adminRoleSwitcher.scopeAll": "Todas as comunidades",
  "adminRoleSwitcher.scopeStewarded": "Espaços que moderas",
  "adminRoleSwitcher.yourRoles": "Os teus cargos",
  "adminRoleSwitcher.staffOversight": "Supervisão da plataforma",
  "adminRoleSwitcher.communitiesYouSteward": "Comunidades que moderas",
  "adminRoleSwitcher.toastNowStaff": "Agora a atuar como admin da equipa",

  // AdminShell
  "adminShell.toggleTheme": "Alternar tema",
  "adminShell.alerts": "Alertas",
  "adminShell.searchPlaceholder": "Pesquisar relatórios, pessoas, comunidades…",
  "adminShell.toastSearchIllustrative":
    "A pesquisa é apenas ilustrativa neste protótipo",
  "adminShell.toastNoAlerts": "Sem alertas novos",

  // AdminSidebar
  "adminSidebar.badge": "Admin",
  "adminSidebar.navLabel": "Secções de administração",
  "adminSidebar.backToPlatform": "Voltar à plataforma",

  // AdminAccountMenu — o controlo de conta no fundo da barra lateral.
  "adminSidebar.account.accessHeading": "O teu acesso",
  "adminSidebar.account.tierMember": "Membro",
  "adminSidebar.account.allAreas": "Todas as áreas de administração",
  "adminSidebar.account.profile": "O meu perfil",
  "adminSidebar.account.settings": "Definições da conta",
  "adminSidebar.account.sessions": "Sessões ativas",

  // adminNav.data.ts
  "adminNav.sections.trust": "Confiança e segurança",
  "adminNav.sections.people": "Pessoas e acessos",
  "adminNav.sections.communities": "Comunidades",
  "adminNav.sections.directory": "Diretório",
  "adminNav.sections.editorial": "Editorial",
  "adminNav.sections.partners": "Parcerias e reconhecimento",
  "adminNav.sections.site": "Conteúdo do site",
  "adminNav.sections.platform": "Plataforma",
  "adminNav.pendingSuffix": "pendentes",

  "adminNav.items.overview": "Visão geral",
  "adminNav.items.landing": "Página inicial",
  "adminNav.items.pressKit": "Kit de imprensa",
  "adminNav.items.moderation": "Moderação",
  "adminNav.items.staff": "Equipa e papéis",
  "adminNav.items.concerns": "Preocupações",
  "adminNav.items.intakes": "Submissões e mensagens",
  "adminNav.items.safeSpaces": "Espaços seguros",
  "adminNav.items.topics": "Tópicos",
  "adminNav.items.listings": "Espaços",
  "adminNav.items.housingListings": "Revisão de alojamento",
  "adminNav.items.media": "Imagens enviadas",
  "adminNav.items.invites": "Convites",
  "adminNav.items.changemakerNominations": "Nomeações",
  "adminNav.items.commissionInterests": "Encomendas",
  "adminNav.items.readingGroupProposals": "Grupos de leitura",
  "adminNav.items.guideFeedback": "Feedback dos guias",
  "adminNav.items.magazineSubmissions": "Propostas",
  "adminNav.items.writerApplications": "Candidaturas a escritor",
  "adminNav.items.partnerships": "Parcerias",
  "adminNav.items.verifications": "Verificações",
  "adminNav.items.orgTiers": "Níveis de parceria",
  "adminNav.items.resourceGuides": "Guias de recursos",
  "adminNav.items.resourceListings": "Diretório de recursos",
  "adminNav.items.resourceSuggestions": "Sugestões de recursos",
  "adminNav.items.communityTagRequests": "Pedidos de etiquetas de comunidades",
  "adminNav.items.housingGroups": "Grupos de habitação",
  "adminNav.items.housingCoops": "Cooperativas de habitação",
  "adminNav.items.governance": "Governação",
  "adminNav.items.roadmap": "Roteiro",
  "adminNav.items.reports": "Relatórios",
  "adminNav.items.systemAccounts": "Contas de sistema",

  // errorHandling.ts / errorMessage.ts
  "apiError.server": "Algo correu mal do nosso lado. Tenta outra vez.",
  "apiError.forbidden": "Não tens acesso a isso.",
  "apiError.accountRestricted":
    "Não podes fazer isso enquanto estiver em vigor uma restrição de moderação. Podes recorrer nas definições da tua conta.",
  "apiError.generic": "Algo correu mal.",
  "apiError.genericRetry": "Algo correu mal. Tenta outra vez.",
  "apiError.tryAgainTail": " Tenta outra vez.",

  // PullToRefresh live region

  // deviceUserAgent.ts

  // BackToSettingsLink
  "backToSettingsLink.label": "Voltar às definições",

  // Sidebar
  "sidebar.ariaPrimary": "Principal",
  "sidebar.collapseAll": "Fechar tudo",
  "sidebar.ariaSections": "Secções",

  // SidebarFooter
  "sidebarFooter.collapse": "Recolher",
  "sidebarFooter.expandAria": "Expandir barra lateral",
  "sidebarFooter.collapseAria": "Recolher barra lateral",

  // SkipToContentLink
  "skipToContent.label": "Saltar para o conteúdo principal",

  // RouteAnnouncer
  "routeAnnouncer.pageLoaded": "Página carregada",

  // Avatar
  "avatar.verified": "Pessoa verificada",

  // HubBackLink
  "hubBackLink.backTo": "Voltar a {label}",

  // Modal / ModalSheet
  "modal.close": "Fechar",

  // Toast — botão de dispensar (fechar) em cada toast
  "toast.dismiss": "Dispensar",

  // SearchInput
  "searchInput.placeholder": "Pesquisar…",
  "searchInput.clearAria": "Limpar pesquisa",

  // Select — unified searchable dropdown
  // The "Refine" drawer and the active-filter chips under it, shared by
  // every filter bar that keeps its controls behind one toggle.
  "refine.label": "Refinar",
  "filters.activeLabel": "Filtrado por",
  "filters.clearAll": "Limpar tudo",
  "filters.remove": "Remover filtro",
  "select.placeholder": "Selecionar…",
  "select.searchPlaceholder": "Escreva para filtrar…",
  "select.noResults": "Sem correspondências",
  "select.clear": "Limpar seleção",
  "select.loading": "A carregar…",
  "select.multiSummary": "{count} selecionados",

  // ComingSoon
  "comingSoon.label": "Brevemente",

  // SuccessPanel
  "successPanel.done": "Concluído",

  // ConfirmDialog — default footer actions (callers usually pass their own)
  "confirmDialog.cancel": "Cancelar",
  "confirmDialog.confirm": "Confirmar",

  // SaveButton — visible/aria label for the bookmark toggle
  "saveButton.save": "Guardar",
  "saveButton.saved": "Guardado",

  // Stars — read-only rating accessible label
  "stars.ariaLabel": "{value} de {max} estrelas",

  // MemberSelectList — empty search result
  "memberSelect.noResults": "Sem resultados",
  "memberSelect.searching": "A procurar...",

  // VisibilityBadge (wording matches members:visibility.* precedent)
  "visibilityBadge.open": "Aberto a novos contactos",
  "visibilityBadge.network": "Só para a rede",
  "visibilityBadge.private": "Privado",
  "visibilityBadge.titleTemplate": "Visibilidade: {label}",

  // StaffBadge
  "staffBadge.admin.long": "Equipa QueerPulse",
  "staffBadge.admin.short": "Equipa",
  "staffBadge.moderator.long": "Moderação QueerPulse",
  "staffBadge.moderator.short": "Moderação",
  // Papéis de equipa com distintivo: quem recebeu um domínio da plataforma
  // para gerir. Uma etiqueta para cada um, nos dois tamanhos, a dizer em
  // palavras simples o que a pessoa decide.
  "staffBadge.grant.magazineEditor": "Edição da revista",
  "staffBadge.grant.housingModerator": "Moderação de habitação",
  "staffBadge.grant.directoryModerator": "Moderação do diretório",
  "staffBadge.grant.resourceCurator": "Curadoria de recursos",
  "staffBadge.grant.editorial": "Equipa editorial",
  "staffBadge.grant.communities": "Equipa de comunidades",

  // ImageSlot
  "imageSlot.placeholder": "Imagem",

  // MegaNav / MegaNavDrawer / Sidebar
  "megaNav.panelAria": "Menu {menu}",
  "megaNav.footer.accessibility": "Acessibilidade",
  "megaNav.footer.emergency": "Recursos de emergência",

  // MegaNav — Community
  "megaNav.community.title": "Comunidade",
  "megaNav.community.subtitle": "Pessoas & encontros",
  "megaNav.community.feature.eyebrow": "Comunidade",
  "megaNav.community.feature.title": "Encontra a tua gente.",
  "megaNav.community.feature.body":
    "Um diretório de pessoas, fóruns e convívios: o tecido de ligação do dia a dia da rede.",
  "megaNav.community.feature.cta": "Explorar pessoas",
  "megaNav.community.featurePublic.eyebrow": "Comunidade",
  "megaNav.community.featurePublic.title": "Organizar em conjunto.",
  "megaNav.community.featurePublic.body":
    "Campanhas, ajuda mútua e equipas de voluntariado: trabalho onde podes participar, sem precisares de convite.",
  "megaNav.community.featurePublic.cta": "Participar",
  "megaNav.community.col.people.head": "Pessoas",
  "megaNav.community.col.people.membersDirectory": "Diretório de pessoas",
  "megaNav.community.col.people.topics": "Tópicos",
  // Kept as "Dating" (not "Convívios") to avoid colliding with nav:gatherings
  // ("Convívios"), already the platform's term for the events feature.
  "megaNav.community.col.people.dating": "Dating",
  "megaNav.community.col.gather.head": "Convívios",
  "megaNav.community.col.gather.events": "Eventos",
  "megaNav.community.col.organise.activismVolunteering":
    "Ativismo e Voluntariado",
  "megaNav.community.col.organise.changeMakers": "Agentes de mudança",

  // MegaNav — Lisbon
  "megaNav.lisbon.title": "Lisboa",
  "megaNav.lisbon.subtitle": "Descobrir & viver aqui",
  "megaNav.lisbon.feature.eyebrow": "Lisboa",
  "megaNav.lisbon.feature.title": "Encontra os teus espaços locais.",
  "megaNav.lisbon.feature.body":
    "Bares, clínicas, salões e lojas que te acolhem: todos revistos, com os espaços verificados bem identificados.",
  "megaNav.lisbon.feature.cta": "Explorar espaços locais",
  "megaNav.lisbon.featurePublic.eyebrow": "Lisboa",
  "megaNav.lisbon.featurePublic.title": "Como verificamos os espaços locais.",
  "megaNav.lisbon.featurePublic.body":
    "Cada espaço é revisto antes de receber o selo de verificado. Vê como funciona, e quais foram removidos.",
  "megaNav.lisbon.featurePublic.cta": "Ver como funciona a verificação",
  "megaNav.lisbon.col.discover.head": "Descobrir",
  "megaNav.lisbon.col.discover.businessDirectory":
    "Diretório de negócios locais",
  "megaNav.lisbon.col.discover.partners": "Parceiros",
  "megaNav.lisbon.col.livingHere.head": "Viver aqui",
  "megaNav.lisbon.col.livingHere.housing": "Habitação",
  "megaNav.lisbon.col.livingHere.visasResidency": "Vistos e residência",

  // MegaNav — Resources
  "megaNav.resources.title": "Recursos",
  "megaNav.resources.subtitle": "Saúde, segurança, biblioteca",
  "megaNav.resources.feature.eyebrow": "Apoio",
  "megaNav.resources.feature.title": "Ajuda quando precisares.",
  "megaNav.resources.feature.body":
    "Saúde, segurança e direitos, mais uma biblioteca para aprenderes ao teu ritmo.",
  "megaNav.resources.feature.cta": "Abrir a biblioteca",
  "megaNav.resources.col.health.head": "Saúde e segurança",
  "megaNav.resources.col.health.mentalHealth": "Saúde mental",
  "megaNav.resources.col.health.sexualHealth": "Saúde sexual",
  "megaNav.resources.col.health.transHealthcare": "Cuidados de saúde trans",
  "megaNav.resources.col.health.wellbeingHub": "Centro de bem-estar",
  "megaNav.resources.col.safety.safetyGuide": "Guia de segurança",
  "megaNav.resources.col.learn.head": "Aprender e pertencer",
  "megaNav.resources.col.learn.resourceLibrary": "Biblioteca de recursos",
  "megaNav.resources.col.learn.guideIndex": "Todos os guias A–Z",
  "megaNav.resources.col.learn.transNbHub": "Centro trans e não-binárie",
  "megaNav.resources.col.learn.comingOut": "Assumir-se",
  "megaNav.resources.col.learn.familyParenting": "Família e parentalidade",
  "megaNav.resources.col.learn.forCaregivers": "Para quem cuida",

  // MegaNav — Culture
  "megaNav.culture.title": "Cultura",
  "megaNav.culture.subtitle": "Ler, ver, criar",
  "megaNav.culture.feature.eyebrow": "A Revista",
  "megaNav.culture.feature.title": "Lê a nova edição.",
  "megaNav.culture.feature.body":
    "Ensaios, entrevistas, críticas e reportagens da comunidade, publicados no primeiro dia de cada mês.",
  "megaNav.culture.feature.cta": "Abrir a Edição 18",
  "megaNav.culture.col.magazine.head": "A Revista",
  "megaNav.culture.col.magazine.currentIssue": "Edição atual",
  "megaNav.culture.col.magazine.allIssues": "Todas as edições",
  "megaNav.culture.col.magazine.stories": "Histórias",
  "megaNav.culture.col.magazine.writeForUs": "Escreve para nós",
  "megaNav.culture.col.screenSound.cinema": "Cinema · filme queer",
  "megaNav.culture.col.makers.head": "Criação e cena",
  "megaNav.culture.col.makers.studio": "Studio · música queer",
  "megaNav.culture.col.makers.platforms": "Plataformas",
  "megaNav.culture.col.makers.readingGroups": "Grupos de leitura",
  "megaNav.culture.col.makers.lisbonScene": "Cena e rádio de Lisboa",

  // MegaNav — Work
  "megaNav.work.title": "Trabalho",
  "megaNav.work.subtitle": "Carreira & economia",
  "megaNav.work.feature.eyebrow": "O teu espaço de trabalho",
  "megaNav.work.feature.title": "O teu Trabalho, num só lugar.",
  "megaNav.work.feature.body":
    "Acompanha candidaturas, mentorias e apoios, e aparece no trabalho exatamente como és.",
  "megaNav.work.feature.cta": "Abrir o teu espaço de trabalho",
  "megaNav.work.col.career.head": "Carreira",
  "megaNav.work.col.career.yourWork": "O teu Trabalho",
  "megaNav.work.col.career.jobBoard": "Bolsa de emprego",
  "megaNav.work.col.career.mentorship": "Mentoria",
  "megaNav.work.col.career.employerReviews":
    "Avaliações de entidades empregadoras",
  "megaNav.work.col.economy.head": "Economia",
  "megaNav.work.col.economy.skillsExchange": "Troca de competências",
  "megaNav.work.col.economy.solidarityPricing": "Preços solidários",
  "megaNav.work.col.economy.grants": "Bolsas e apoios",
  "megaNav.work.col.economy.howItWorks": "Como funciona a nossa economia",
  "megaNav.work.col.economy.offerSkill": "Oferecer uma competência",

  // MegaNav — About
  "megaNav.about.title": "Sobre",
  "megaNav.about.subtitle": "A plataforma & legal",
  "megaNav.about.feature.eyebrow": "Sobre",
  "megaNav.about.feature.title": "O que é a QueerPulse.",
  "megaNav.about.feature.body":
    "A nossa missão, como nos governamos, e a letra pequena legal.",
  "megaNav.about.feature.cta": "Sobre a QueerPulse",
  "megaNav.about.col.mission.head": "Missão e governação",
  "megaNav.about.col.mission.aboutQueerPulse": "Sobre a QueerPulse",
  "megaNav.about.col.using.head": "Usar a QueerPulse",
  "megaNav.about.col.using.helpFaq": "Ajuda e perguntas frequentes",
  "megaNav.about.col.using.roadmap": "Roteiro",
  "megaNav.about.col.using.forOrganisations": "Para organizações",
  "megaNav.about.col.legal.head": "Legal e imprensa",
  "megaNav.about.col.legal.privacyPolicy": "Política de privacidade",
  "megaNav.about.col.legal.termsOfUse": "Termos de utilização",
  "megaNav.about.col.legal.dataRequest": "Pedir os teus dados",
  /** LG-01: a declaração de acessibilidade publicada em /policies/accessibility. */
  "megaNav.about.col.legal.accessibility": "Declaração de acessibilidade",
  "megaNav.about.col.legal.pressKit": "Kit de imprensa",
  "megaNav.about.col.legal.contact": "Contacto",

  // footer.data.ts
  "footerData.col.lisbonLife.head": "Vida em Lisboa",
  "footerData.col.lisbonLife.housingBoard": "Bolsa de habitação",
  "footerData.col.support.head": "Apoio",
  "footerData.col.support.therapistDirectory": "Diretório de terapeutas",
  "footerData.col.support.legalAid": "Apoio jurídico",
  "footerData.col.support.hateCrimeGuide": "Recursos sobre crimes de ódio",
  "footerData.col.support.reportSafety": "Denúncias e segurança",
  "footerData.col.members.guideLibrary": "Biblioteca de guias",
  "footerData.base.privacy": "Privacidade",
  "footerData.base.cookies": "Cookies",
  "footerData.base.guidelines": "Diretrizes da comunidade",
  "footerData.base.accessibility": "Acessibilidade",
  "footerData.base.security": "Segurança",
  "footerData.base.imprint": "Informação legal",

  // Shown as an error toast when a live intake-form submission
  // (grant/suggest-edit/sober-host/panel/incubator) fails to reach the backend.
  "intake.errorToast":
    "Não foi possível enviar agora. Tenta novamente daqui a instantes.",

  // mediaRef.* — category labels for a `MediaReference.type`
  // (shared/media/mediaReferences.ts), read by both the My-uploads pane
  // and the admin media console to describe where an uploaded image is
  // in use.
  "mediaRef.profile-photo": "Foto de perfil",
  "mediaRef.showcase": "Destaque",
  "mediaRef.story-cover": "Capa de matéria",
  "mediaRef.event-photo": "Evento",
  "mediaRef.event-cover": "Evento",
  "mediaRef.group-avatar": "Grupo de conversa",
  "mediaRef.listing": "Estabelecimento",
  "mediaRef.persona-avatar": "Persona",
  "mediaRef.persona-cover": "Persona",
  "mediaRef.persona-item": "Persona",
  "mediaRef.community-post": "Publicação da comunidade",
  "mediaRef.community-cover": "Comunidade",
  "mediaRef.community-avatar": "Comunidade",
  "mediaRef.card-crest": "Cartão de sócio",
  "mediaRef.card-background": "Cartão de sócio",
  "mediaRef.cinema-cover": "Título de cinema",
  "mediaRef.landlord": "Senhorio",
  "mediaRef.company-work": "Empresa",
  "mediaRef.housing": "Habitação",
  "mediaRef.magazine-author": "Pessoa autora",
  "mediaRef.changemaker": "Agente de mudança",
  "mediaRef.collection": "Coleção",
  "mediaRef.magazine-article": "Matéria da revista",
  "mediaRef.magazine-deck": "Deck da revista",
  "mediaRef.message-photo": "Conversa",
  "mediaRef.press-contact": "Contacto de imprensa",

  // calendar.* keys, for the shared APG-compliant Calendar/DatePicker
  // primitive (Calendar.tsx, CalendarCell.tsx, CalendarHeader.tsx,
  // DatePicker.tsx, RangeCalendar.tsx).
  "calendar.chooseDate": "Escolher data",
  "calendar.chooseTime": "Escolher hora",
  "calendar.chooseMonth": "Escolher mês",
  "calendar.chooseRange": "Escolher intervalo de datas",
  "calendar.prevMonth": "Mês anterior",
  "calendar.nextMonth": "Próximo mês",
  "calendar.prevYear": "Ano anterior",
  "calendar.nextYear": "Próximo ano",
  "calendar.today": "Hoje",
  "calendar.clear": "Limpar",
  "calendar.monthLabel": "Mês",
  "calendar.yearLabel": "Ano",
  "calendar.startDate": "Data de início",
  "calendar.endDate": "Data de fim",
  "calendar.segment.day": "Dia",
  "calendar.segment.month": "Mês",
  "calendar.segment.year": "Ano",
  "calendar.segment.hour": "Hora",
  "calendar.segment.minute": "Minuto",
  "calendar.segment.meridiem": "AM/PM",
  "calendar.state.today": "hoje",
  "calendar.state.selected": "selecionado",
  "calendar.state.unavailable": "indisponível",
  "calendar.preset.today": "Hoje",
  "calendar.preset.tomorrow": "Amanhã",
  "calendar.preset.nextWeek": "Próxima semana",

  // reframe.*: controlo de pan/zoom para recorte (ImageReframer.tsx,
  // PhotoReframeModal.tsx, useImageReframerState.ts), mostrado quando alguém
  // reenquadra uma foto ao enviá-la.
  "reframe.title": "Reenquadrar foto",
  "reframe.save": "Guardar",
  "reframe.cancel": "Cancelar",
  "reframe.zoom": "Zoom",
  "reframe.reset": "Repor",
  "reframe.alt": "Foto para reenquadrar",
  "reframe.frame": "Área de reenquadramento",
  "reframe.ratio.group": "Proporção",
  "reframe.ratio.original": "Original",
  "reframe.ratio.square": "Quadrado",
  "reframe.ratio.native": "Forma da capa",

  // announcement.*: faixa de aviso em todo o site, escrita por quem administra
  // (AnnouncementBanner.tsx), montada tanto no AppShell como no PageShell —
  // mostrada a todas as pessoas visitantes, com ou sem sessão iniciada (ADM-25).
  "announcement.dismiss": "Dispensar este aviso",

  // pt/shared.ts
  "adminNav.items.housingGroupListings": "Anúncios de grupo",
  "adminNav.items.landlords": "Senhorios",
  "adminNav.items.volunteerHours": "Horas de voluntariado",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-49 — PRD-49 - the quiet marker on a meganav / mobile drawer / sidebar link whose destination is not launched yet (Cinema, Studio in live mode). Rendered by NavBuildBadge INSIDE the link, so it also becomes the tail of the link's accessible name: 'Cinema Being built'. Keep it short, uppercase-safe and free of any timing promise: it says the thing is under construction, never that it arrives soon or on a date.
  "megaNav.beingBuilt": "Em construção",
};
