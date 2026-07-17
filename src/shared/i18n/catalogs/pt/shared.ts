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
    "Só guardamos o que é necessário para manteres a sessão iniciada e em segurança, por predefinição. As análises e os relatórios de erros ficam desligados a menos que digas que sim — sem anúncios, sem perfilagem, nunca. Muda de ideias quando quiseres, nas definições. <a>Lê a política</a>.",

  "consent.actions.rejectNonEssential": "Rejeitar não essenciais",
  "consent.actions.choose": "Escolher",
  "consent.actions.accept": "Aceitar",
  "consent.actions.saveChoices": "Guardar escolhas",

  // Consent preference center
  "consent.preferences.eyebrow": "Privacidade",
  "consent.preferences.title": "As tuas <em>escolhas.</em>",
  "consent.preferences.sub":
    "Os cookies estritamente necessários mantêm a tua sessão iniciada e em segurança — estão sempre ativos. O resto depende de ti, e podes alterá-lo quando quiseres.",
  "consent.preferences.necessary.title": "Estritamente necessários",
  "consent.preferences.necessary.desc":
    "Os teus cookies de sessão e CSRF, mais o tema e o idioma guardados no teu dispositivo. Necessários para o funcionamento da plataforma — nunca usados para te seguir.",
  "consent.preferences.necessary.alwaysOnAria": "Sempre ativo",
  "consent.preferences.rows.analytics.title": "Análises e utilização",
  "consent.preferences.rows.analytics.desc":
    "Padrões anónimos e agregados — que páginas ajudam, quais não resultam. Sem monitorização individual, sem redes de anúncios. Desligado a menos que o ligues.",
  "consent.preferences.rows.monitoring.title": "Erros e falhas",
  "consent.preferences.rows.monitoring.desc":
    "Diagnóstico automático quando algo falha, para resolvermos mais depressa. Não inclui dados de publicidade nem de perfilagem.",

  // Feedback: AuthLoader / RouteFallback / ErrorFallback / RoomLoader
  "feedback.errorFallback.title": "Algo correu mal do nosso <em>lado</em>",
  "feedback.errorFallback.body":
    "Não foi nada que tenhas feito, e nada se perdeu. Tenta outra vez, ou volta ao início — já estamos a tratar disto.",
  "feedback.errorFallback.tryAgain": "Tentar outra vez",
  "feedback.errorFallback.reference": "Referência: {referenceId}",

  "feedback.roomLoader.ariaLabel": "A preparar a sala",
  "feedback.roomLoader.title": "A preparar a tua <em>sala</em>",
  "feedback.roomLoader.caption": "A servir o café, a baixar as luzes…",
  "feedback.roomLoader.steps.signingIn": "A iniciar sessão",
  "feedback.roomLoader.steps.gettingData": "A obter os teus dados",
  "feedback.roomLoader.steps.preparingRoom": "A preparar a sala",

  // Auth session-load failure
  "auth.error.server":
    "Não conseguimos carregar a tua conta — o servidor da QueerPulse teve um erro ({status}). A responsabilidade é nossa, não tua. Tenta outra vez daqui a pouco.",
  "auth.error.network":
    "Não conseguimos contactar a QueerPulse para carregar a tua conta. Verifica a tua ligação e tenta outra vez daqui a pouco.",

  // Provider-level fallback error toasts
  "profile.saveError": "Não conseguimos guardar o teu perfil. Tenta outra vez.",
  "social.blockError":
    "Não conseguimos atualizar esse bloqueio. Tenta outra vez.",
  "social.genericError": "Não conseguimos atualizar isso. Tenta outra vez.",

  // AppNav
  "appNav.links.home": "Início",
  "appNav.links.subprofiles": "Subperfis",
  "appNav.links.messages": "Mensagens",

  // AccountMenu
  "accountMenu.items.profile": "Perfil",
  "accountMenu.items.connections": "Ligações",
  "accountMenu.items.messages": "Mensagens",
  "accountMenu.items.applications": "Candidaturas",
  "accountMenu.items.work": "Trabalho",
  "accountMenu.items.subprofiles": "Subperfis",
  "accountMenu.items.events": "Eventos",
  "accountMenu.items.feed": "Feed",
  "accountMenu.items.drafts": "Rascunhos",
  "accountMenu.items.pitches": "Propostas",
  "accountMenu.items.saved": "Guardados",
  "accountMenu.items.membership": "Adesão",
  "accountMenu.items.settings": "Definições",
  "accountMenu.items.help": "Ajuda",
  "accountMenu.ariaLabel": "Menu da conta",
  "accountMenu.header.subtitle": "Perfil e conta",
  "accountMenu.staff.magazineEditor": "Editor da revista",
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
  "adminSidebar.oversight": "Supervisão",
  "adminSidebar.backToPlatform": "Voltar à plataforma",
  "adminSidebar.toastProfile": "O teu perfil de admin",

  // adminNav.data.ts
  "adminNav.items.overview": "Visão geral",
  "adminNav.items.moderation": "Moderação",
  "adminNav.items.partnerships": "Parcerias",
  "adminNav.items.governance": "Governação",

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

  // QuickExit
  "quickExit.tooltip.withShortcut":
    "<strong>Precisas de sair depressa?</strong> Este botão — ou premir Shift duas vezes — leva-te para uma página do tempo.",
  "quickExit.tooltip.noShortcut":
    "<strong>Precisas de sair depressa?</strong> Este botão leva-te para uma página do tempo.",
  "quickExit.tooltip.dismissAria": "Dispensar a dica de Saída rápida",
  "quickExit.about.aria": "Sobre a Saída rápida",
  "quickExit.about.body":
    "A Saída rápida envia este separador para uma página do tempo e reabre a QueerPulse noutro separador. É uma forma rápida de limpar o ecrã, não anonimato: não consegue apagar o teu histórico anterior, marcadores ou sugestões da barra de endereço. Para mais segurança, usa também uma janela privada e limpa o teu histórico.",
  "quickExit.about.note":
    "Não precisas disto? Podes esconder este botão e voltar a ativá-lo quando quiseres em <strong>Definições → Segurança</strong>.",
  "quickExit.about.gotIt": "Percebido",
  "quickExit.about.hide": "Esconder Saída rápida",
  "quickExit.about.limitsAria": "Sobre a Saída rápida e os seus limites",
  "quickExit.button.aria": "Saída rápida — sair já deste site",
  "quickExit.button.label": "Saída rápida",
  "quickExit.button.shortcutHint": "Atalho: prime Shift duas vezes",
  "quickExit.toastHidden":
    "Saída rápida escondida. Volta a ativá-la em Definições → Segurança.",

  // Avatar
  "avatar.verified": "Pessoa verificada",

  // HubBackLink
  "hubBackLink.backTo": "Voltar a {label}",

  // Modal / ModalSheet
  "modal.close": "Fechar",

  // SearchInput
  "searchInput.placeholder": "Pesquisar…",
  "searchInput.clearAria": "Limpar pesquisa",

  // ComingSoon
  "comingSoon.label": "Brevemente",

  // SuccessPanel
  "successPanel.done": "Concluído",

  // VisibilityBadge (wording matches members:visibility.* precedent)
  "visibilityBadge.open": "Aberto a novos contactos",
  "visibilityBadge.network": "Só para a rede",
  "visibilityBadge.private": "Privado",
  "visibilityBadge.titleTemplate": "Visibilidade: {label}",

  // ImageSlot
  "imageSlot.placeholder": "Imagem",

  // MegaNav / MegaNavDrawer / Sidebar
  "megaNav.panelAria": "Menu {menu}",

  // MegaNav — Community
  "megaNav.community.title": "Comunidade",
  "megaNav.community.feature.eyebrow": "Comunidade",
  "megaNav.community.feature.title": "Encontra a tua gente.",
  "megaNav.community.feature.body":
    "Um diretório de pessoas, fóruns e convívios — o tecido de ligação do dia a dia da rede.",
  "megaNav.community.feature.cta": "Explorar pessoas",
  "megaNav.community.featurePublic.eyebrow": "Comunidade",
  "megaNav.community.featurePublic.title": "Organizar em conjunto.",
  "megaNav.community.featurePublic.body":
    "Campanhas, ajuda mútua e equipas de voluntariado — trabalho onde podes participar, sem precisares de convite.",
  "megaNav.community.featurePublic.cta": "Participar",
  "megaNav.community.col.people.head": "Pessoas",
  "megaNav.community.col.people.membersDirectory": "Diretório de pessoas",
  // Kept as "Dating" (not "Convívios") to avoid colliding with nav:gatherings
  // ("Convívios"), already the platform's term for the events feature.
  "megaNav.community.col.people.dating": "Dating",
  "megaNav.community.col.gather.head": "Convívios",
  "megaNav.community.col.gather.events": "Eventos",
  "megaNav.community.col.gather.hostGathering": "Organizar um convívio",
  "megaNav.community.col.organise.head": "Organizar",
  "megaNav.community.col.organise.volunteer": "Voluntariado",
  "megaNav.community.col.organise.activism": "Ativismo",
  "megaNav.community.col.organise.changeMakers": "Agentes de mudança",

  // MegaNav — Lisbon
  "megaNav.lisbon.title": "Lisboa",
  "megaNav.lisbon.feature.eyebrow": "Lisboa",
  "megaNav.lisbon.feature.title": "Uma Lisboa queer.",
  "megaNav.lisbon.feature.body":
    "Bares, clínicas, salões e lojas que te acolhem — encontrados e avalizados pela comunidade.",
  "megaNav.lisbon.feature.cta": "Explorar o diretório",
  "megaNav.lisbon.featurePublic.eyebrow": "Lisboa",
  "megaNav.lisbon.featurePublic.title": "Sítios que te acolhem.",
  "megaNav.lisbon.featurePublic.body":
    "Bares, clínicas e espaços comunitários avalizados como seguros por quem lá vai.",
  "megaNav.lisbon.featurePublic.cta": "Encontrar espaços seguros",
  "megaNav.lisbon.col.discover.head": "Descobrir",
  "megaNav.lisbon.col.discover.businessDirectory": "Diretório de negócios",
  "megaNav.lisbon.col.discover.spacesMap": "Mapa de espaços",
  "megaNav.lisbon.col.discover.safeSpaces": "Espaços seguros",
  "megaNav.lisbon.col.discover.partners": "Parceiros",
  "megaNav.lisbon.col.livingHere.head": "Viver aqui",
  "megaNav.lisbon.col.livingHere.housing": "Habitação",
  "megaNav.lisbon.col.livingHere.visasResidency": "Vistos e residência",

  // MegaNav — Resources
  "megaNav.resources.title": "Recursos",
  "megaNav.resources.feature.eyebrow": "Apoio",
  "megaNav.resources.feature.title": "Ajuda quando precisares.",
  "megaNav.resources.feature.body":
    "Saúde, segurança e direitos — mais uma biblioteca para aprenderes ao teu ritmo.",
  "megaNav.resources.feature.cta": "Abrir a biblioteca",
  "megaNav.resources.col.health.head": "Saúde e bem-estar",
  "megaNav.resources.col.health.mentalHealth": "Saúde mental",
  "megaNav.resources.col.health.sexualHealth": "Saúde sexual",
  "megaNav.resources.col.health.transHealthcare": "Cuidados de saúde trans",
  "megaNav.resources.col.health.wellbeingHub": "Centro de bem-estar",
  "megaNav.resources.col.safety.head": "Segurança e direitos",
  "megaNav.resources.col.safety.emergency": "Emergência",
  "megaNav.resources.col.safety.safetyGuide": "Guia de segurança",
  "megaNav.resources.col.learn.head": "Aprender e pertencer",
  "megaNav.resources.col.learn.resourceLibrary": "Biblioteca de recursos",
  "megaNav.resources.col.learn.transNbHub": "Centro trans e não-binárie",
  "megaNav.resources.col.learn.comingOut": "Assumir-se",
  "megaNav.resources.col.learn.familyParenting": "Família e parentalidade",
  "megaNav.resources.col.learn.forCaregivers": "Para quem cuida",

  // MegaNav — Culture
  "megaNav.culture.title": "Cultura",
  "megaNav.culture.feature.eyebrow": "A Revista",
  "megaNav.culture.feature.title": "Lê a nova edição.",
  "megaNav.culture.feature.body":
    "Ensaios, entrevistas, críticas e reportagens da comunidade — publicados no primeiro dia de cada mês.",
  "megaNav.culture.feature.cta": "Abrir a Edição 18",
  "megaNav.culture.col.magazine.head": "A Revista",
  "megaNav.culture.col.magazine.currentIssue": "Edição atual",
  "megaNav.culture.col.magazine.allIssues": "Todas as edições",
  "megaNav.culture.col.magazine.stories": "Histórias",
  "megaNav.culture.col.magazine.writeForUs": "Escreve para nós",
  "megaNav.culture.col.screenSound.head": "Ecrã e som",
  "megaNav.culture.col.screenSound.cinema": "Cinema · filme queer",
  "megaNav.culture.col.screenSound.podcast": "The Back Room (podcast)",
  "megaNav.culture.col.screenSound.radio": "Rádio · A tocar agora",
  "megaNav.culture.col.makers.head": "Criação e cena",
  "megaNav.culture.col.makers.studio": "Studio · música queer",
  "megaNav.culture.col.makers.creatives": "Pessoas criativas",
  "megaNav.culture.col.makers.platforms": "Plataformas",
  "megaNav.culture.col.makers.readingGroups": "Grupos de leitura",
  "megaNav.culture.col.makers.lisbonScene": "Cena e rádio de Lisboa",

  // MegaNav — Work
  "megaNav.work.title": "Trabalho",
  "megaNav.work.feature.eyebrow": "O teu espaço de trabalho",
  "megaNav.work.feature.title": "O teu Trabalho, num só lugar.",
  "megaNav.work.feature.body":
    "Acompanha candidaturas, mentorias e apoios — e aparece no trabalho exatamente como és.",
  "megaNav.work.feature.cta": "Abrir o teu espaço de trabalho",
  "megaNav.work.col.career.head": "Carreira",
  "megaNav.work.col.career.yourWork": "O teu Trabalho",
  "megaNav.work.col.career.jobBoard": "Bolsa de emprego",
  "megaNav.work.col.career.skillsLearning": "Competências e aprendizagem",
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
  "megaNav.about.feature.eyebrow": "Sobre",
  "megaNav.about.feature.title": "O que é a QueerPulse.",
  "megaNav.about.feature.body":
    "A nossa missão, como nos governamos, e a letra pequena legal.",
  "megaNav.about.feature.cta": "Sobre a QueerPulse",
  "megaNav.about.col.mission.head": "Missão e governação",
  "megaNav.about.col.mission.aboutQueerPulse": "Sobre a QueerPulse",
  "megaNav.about.col.mission.manifesto": "O Manifesto",
  "megaNav.about.col.mission.cities": "Cidades",
  "megaNav.about.col.using.head": "Usar a QueerPulse",
  "megaNav.about.col.using.helpFaq": "Ajuda e perguntas frequentes",
  "megaNav.about.col.using.roadmap": "Roteiro",
  "megaNav.about.col.using.getTheApp": "Obter a aplicação",
  "megaNav.about.col.using.forOrganisations": "Para organizações",
  "megaNav.about.col.legal.head": "Legal e imprensa",
  "megaNav.about.col.legal.privacyPolicy": "Política de privacidade",
  "megaNav.about.col.legal.termsOfUse": "Termos de utilização",
  "megaNav.about.col.legal.pressKit": "Kit de imprensa",
  "megaNav.about.col.legal.contact": "Contacto",

  // footer.data.ts
  "footerData.col.lisbonLife.head": "Vida em Lisboa",
  "footerData.col.lisbonLife.housingBoard": "Bolsa de habitação",
  "footerData.col.support.head": "Apoio",
  "footerData.col.support.therapistDirectory": "Diretório de terapeutas",
  "footerData.col.support.legalAid": "Apoio jurídico",
  "footerData.col.support.reportSafety": "Denúncias e segurança",
  "footerData.col.members.guideLibrary": "Biblioteca de guias",
  "footerData.base.privacy": "Privacidade",
  "footerData.base.cookies": "Cookies",
  "footerData.base.guidelines": "Diretrizes da comunidade",
  "footerData.base.accessibility": "Acessibilidade",
  "footerData.base.security": "Segurança",
};
