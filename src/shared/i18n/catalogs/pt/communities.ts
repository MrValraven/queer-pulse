import type { Catalog } from "../../types";

/**
 * Comunidades — pt-PT inclusivo. Mesmas chaves que `en/communities.ts`.
 *
 * Notas de tradução:
 * - "Members" → *pessoas*, nunca *Membros* (masculino por omissão, genderiza
 *   toda a comunidade). Ver `docs/i18n/glossary-pt.md`.
 * - "Owner" → *responsável* (substantivo invariável em género); "Mod"/"Co-
 *   steward" mantêm-se como termos curtos e neutros ("Mod", "Corresponsável").
 * - "Founder" (pessoa que acaba de fundar uma comunidade) → *pessoa fundadora*
 *   (reformulação neutra, prioridade 1 da lista de inclusão).
 * - Registo `tu`, caloroso, nunca `você`.
 * - Nomes próprios (QueerPulse) e as marcas de secção ficam iguais.
 * - Nomes de comunidades, descrições, publicações e biografias fictícias em
 *   `communityDetails.data.tsx` / `livingCommunities.data.ts` NÃO são
 *   traduzidos — em modo live vêm da API como texto de quem os escreveu.
 */
export const communities: Catalog = {
  // ── Metadados por rota (PageMeta: separador do browser + partilha) ────────
  "seo.hub.title": "Comunidades · QueerPulse",
  "seo.hub.description":
    "Descobre os coletivos, grupos e círculos de apoio que se juntam pela comunidade queer de Lisboa, e aquele que vai parecer teu.",
  "seo.start.title": "Criar uma comunidade · QueerPulse",
  "seo.start.description":
    "Funda uma comunidade no QueerPulse: diz para que serve, decide para quem é, define os valores partilhados e abre a porta.",
  "seo.detail.title": "{name} · QueerPulse",
  "seo.detail.imageAlt": "Imagem de capa da comunidade {name}",
  "seo.post.title": "Uma publicação em {name} · QueerPulse",

  // ── Merged page shell (CommunitiesHubPage + header + top tabs) ────────────
  "hubShell.title": "Comunidades e",
  "hubShell.titleEm": "coletivos",
  "hubShell.subtitle":
    "Conhece as comunidades que já estão a juntar pessoas por Lisboa fora. Encontra uma onde te apeteça entrar, ou começa a tua própria.",
  "topTabs.mine": "Minhas comunidades",
  "topTabs.discover": "Descobrir",
  "topTabs.ariaLabel": "Vistas de comunidades",

  // ── Categorias de comunidade partilhadas ──────────────────────────────────
  "category.all": "Todas as comunidades",
  "category.social": "Social",
  "category.arts": "Artes",
  "category.activism": "Ativismo",
  "category.support": "Apoio",
  "category.sports": "Desporto",
  "category.professional": "Profissional",

  // ── Diretório de descoberta (CommunitiesPage) ─────────────────────────────
  "discover.search.placeholder": "Pesquisar comunidades por nome ou foco",
  "discover.search.ariaLabel": "Pesquisar comunidades",
  "discover.sort.label": "Ordenar por",
  "discover.sort.newest": "Mais recentes",
  "discover.sort.name": "Nome",
  "discover.empty.none.title": "Ainda sem comunidades",
  "discover.empty.none.description":
    "O diretório ainda está a dar os primeiros passos. Sê das primeiras pessoas a juntar a tua gente. Começa uma comunidade e o resto segue-se.",
  "discover.empty.none.cta": "Começar uma comunidade",
  "discover.empty.search.title": "Nada corresponde à tua pesquisa",
  "discover.empty.search.description":
    "Tenta outra palavra, ou limpa a pesquisa para veres todo o diretório.",
  "discover.empty.search.cta": "Limpar pesquisa",
  "discover.empty.filtered.title": "Nada corresponde aos teus filtros",
  "discover.empty.filtered.description":
    "Ainda não há comunidades nesta categoria. Volta a todas as comunidades para veres tudo por Lisboa.",
  "discover.empty.filtered.cta": "Limpar filtros",
  "discover.loadingMore": "A carregar…",
  "discover.loadMoreCta": "Carregar mais comunidades",
  "discover.toggle.openOnly": "Abertas a todas as pessoas",
  "discover.toggle.busyOnly": "Com atividade esta semana",
  "discover.sort.active": "Mais ativas",
  "discover.resline.count_one": "{count} comunidade",
  "discover.resline.count_other": "{count} comunidades",
  "discover.resline.reset": "Limpar filtros",
  "discover.outro.title": "Não encontraste o <em>espaço</em> certo?",
  "discover.outro.body":
    "As comunidades que existem aqui existem porque alguém decidiu começar uma. Se não encontras o que procuras, se calhar é hora de a criares tu.",
  "discover.outro.body2":
    "Não precisas de uma grande ideia nem de uma multidão atrás de ti. Começa com um punhado de pessoas e vê onde isso te leva.",
  "discover.outro.cta": "Começar uma comunidade",
  "discover.featured.gatheringFlag": "Encontro esta semana",
  "discover.featured.next": "A seguir:",
  "discover.featured.youreIn": "Já fazes parte",
  "discover.featured.openCta": "Abrir comunidade",

  // ── Faixa "Sugestões para ti" (SuggestedCommunitiesSection) ───────────────
  "discover.suggested.heading": "Sugestões para ti",
  "discover.suggested.subtitle":
    "Comunidades onde já estão pessoas com quem tens ligação.",

  // ── Cartão de comunidade / textos do botão de entrada ─────────────────────
  "card.join.public": "Junta-te",
  "card.join.invite": "Junta-te com convite",
  "card.join.request": "Pedir para entrar",
  "card.joined": "Já és membro",
  "card.youreIn": "Já entraste",
  "card.enterQuietly": "Entra em silêncio",
  "card.stats.active_one": "{count} pessoa ativa esta semana",
  "card.stats.active_other": "{count} pessoas ativas esta semana",

  // ── Hub de comunidades (CommunitiesHomePage + digest + feed + sidebar) ───
  "hub.eyebrow": "As tuas comunidades e coletivos",
  "hub.welcome": "Bem-vinde de volta, <em>{name}</em>",
  "hub.sub_one":
    "Isto é o que tem estado a acontecer na tua {count} comunidade.",
  "hub.sub_other":
    "Isto é o que tem estado a acontecer nas tuas {count} comunidades.",
  "hub.discoverCta": "Descobrir comunidades",
  "hub.startCta": "Começar uma comunidade",
  "hub.howItWorksCta": "Como funcionam as comunidades",
  "hub.empty.title": "Ainda não te juntaste a nenhuma comunidade",
  "hub.empty.description":
    "Explora por interesse e encontra o teu lugar. Sem pressa.",
  "hub.digest.label": "Esta semana, em silêncio",
  "hub.digest.note":
    "Sem notificações a mais: só a semana das tuas comunidades num relance.",
  "hub.digest.posts": "novas publicações",
  "hub.digest.active": "pessoas ativas",
  "hub.digest.events": "eventos a caminho",
  "hub.digest.joined": "pessoas juntaram-se",
  "hub.todos.label": "Precisa da tua atenção",
  "hub.todos.requests_one": "{count} pedido",
  "hub.todos.requests_other": "{count} pedidos",
  "hub.todos.reports_one": "{count} denúncia",
  "hub.todos.reports_other": "{count} denúncias",
  "hub.pulse.label": "O teu pulso",
  "hub.pulse.empty.title": "Tudo calmo por agora",
  "hub.pulse.empty.description":
    "Quando as tuas comunidades publicarem algo, aparece aqui.",
  "hub.sidebar.upcoming": "A caminho nas tuas comunidades",
  "hub.sidebar.suggestions": "Comunidades que podes gostar",
  "hub.pulseCard.announcement": "Anúncio",
  "hub.pulseCard.open": "Abrir",

  // ── Pequenos elementos partilhados (tempo relativo, "agora mesmo") ───────
  "common.timeAgo": "há {time}",
  "common.justNow": "agora mesmo",
  "common.unknownTime": "há algum tempo",
  "common.someMember": "Alguém da comunidade",
  "common.error": "Algo correu mal. Tenta de novo daqui a um instante.",
  "common.loading": "A carregar…",
  "common.attachImageAria": "Anexar uma imagem",
  "common.removeImageAria": "Remover esta imagem",
  "common.imageUploadError":
    "Não foi possível carregar essa imagem. Experimenta outra.",
  "common.pinnedToast": "Fixado no topo.",
  "common.unpinnedToast": "Deixou de estar fixado.",

  // ── Página de detalhe da comunidade (hero + sidebar) ──────────────────────
  "detail.breadcrumb": "Comunidades e Coletivos",
  "detail.join.invite": "Junta-te com convite",
  "detail.join.public": "Junta-te à comunidade",
  "detail.join.request": "Pedir para entrar",
  "detail.joined": "Já és membro",
  "detail.requested": "Pedido enviado",
  "detail.frozen.title": "Esta comunidade está em pausa",
  // Uma frase por motivo. Uma pausa manual não tem denúncia nenhuma por trás,
  // por isso nunca pode ser contada como uma revisão de denúncias.
  "detail.frozen.body.manual":
    "A moderação colocou esta comunidade em pausa. Novas publicações e entradas ficam suspensas até a pausa ser levantada.",
  "detail.frozen.body.emergencyReport":
    "Chegou uma denúncia grave e a moderação colocou a comunidade em pausa enquanto a analisa. Novas publicações e entradas ficam suspensas até a pausa ser levantada.",
  "detail.frozen.body.reportPileup":
    "Chegaram várias denúncias em pouco tempo, por isso a comunidade entrou em pausa automaticamente. A moderação está a lê-las agora. Novas publicações e entradas ficam suspensas até a pausa ser levantada.",
  "detail.frozen.body.unknown":
    "Esta comunidade está em pausa. Novas publicações e entradas ficam suspensas até a moderação levantar a pausa.",
  "detail.frozen.since": "Em pausa desde {date} às {time}.",
  "detail.frozen.noteSource": "Da moderação",
  "detail.frozen.composerNotice":
    "Esta comunidade está em pausa, por isso novas publicações estão suspensas. O aviso no topo da página tem os detalhes.",
  "detail.frozen.unfreezeCta": "Levantar a pausa",
  "detail.frozen.errorToast": "Não resultou. Tenta novamente.",

  // ── As boas-vindas únicas a quem acabou de entrar (no Pulso) ──────────────
  "detail.welcome.greeting": "Bem-vinde a {name}",
  "detail.welcome.dismissAria": "Esconder estas boas-vindas",

  // ── Nível de notificações por comunidade (de cada membro) ─────────────────
  "detail.notifications.title": "Notificações",
  "detail.notifications.subtitle":
    "Quanto queres ouvir de {name}. Isto muda só o que te chega e mais ninguém consegue ver.",
  "detail.notifications.groupLabel": "Notificar-me sobre",
  "detail.notifications.groupHint":
    "As tuas definições de notificações da plataforma continuam a aplicar-se por cima disto.",
  "detail.notifications.doneCta": "Concluído",
  "detail.notifications.triggerAria": "Notificações de {name}: {level}",
  "detail.notifications.errorToast":
    "Não conseguimos guardar. Tenta daqui a pouco.",
  "detail.notifications.level.all.title": "Tudo",
  "detail.notifications.level.all.description":
    "Todas as publicações, respostas e anúncios desta comunidade.",
  "detail.notifications.level.announcements.title": "Só anúncios",
  "detail.notifications.level.announcements.description":
    "Só o que a organização ou a moderação marca como anúncio. As publicações normais ficam em silêncio.",
  "detail.notifications.level.mentions.title": "Só menções",
  "detail.notifications.level.mentions.description":
    "Só quando alguém te menciona numa publicação ou resposta aqui.",
  "detail.notifications.level.muted.title": "Silenciada",
  "detail.notifications.level.muted.description":
    "Nada desta comunidade. Continuas a ser membro e o mural continua aqui sempre que o abrires.",
  "detail.notifications.savedToast.all": "Vais ouvir tudo de {name}.",
  "detail.notifications.savedToast.announcements":
    "Vais ouvir os anúncios de {name}.",
  "detail.notifications.savedToast.mentions":
    "Vais ouvir de {name} quando alguém te mencionar.",
  "detail.notifications.savedToast.muted": "{name} ficou silenciada.",
  "detail.save.cta": "Guardar",
  "detail.save.saved": "Guardado",
  // Aviso "as regras da casa mudaram" para quem é membro e concordou com uma
  // versão anterior. Fica na página e pode ser adiado: nunca bloqueia a leitura.
  "detail.rulesUpdate.title": "As regras da casa mudaram",
  "detail.rulesUpdate.body":
    "{name} atualizou as regras da casa depois de teres concordado com elas. Reserva um momento para as leres.",
  "detail.rulesUpdate.readCta": "Ler as regras",
  "detail.rulesUpdate.hideCta": "Esconder as regras",
  "detail.rulesUpdate.acceptCta": "Já as li",
  "detail.rulesUpdate.laterCta": "Mais tarde",
  "detail.rulesUpdate.confirmedToast":
    "Obrigade por leres as regras atualizadas.",
  "detail.rulesUpdate.errorToast":
    "Não foi possível guardar. Tenta de novo daqui a pouco.",
  "detail.save.savedToast": "Comunidade guardada no teu perfil.",
  "detail.save.removedToast": "Comunidade removida dos guardados.",
  "detail.save.saveAriaLabel": "Guardar {name}",
  "detail.save.unsaveAriaLabel": "Remover {name} dos guardados",
  "detail.share.cta": "Partilhar",
  "detail.share.ariaLabel": "Partilhar {name}",
  "detail.share.copiedToast": "Link copiado para a área de transferência.",
  "detail.leave.confirm.title": "Sair de {name}?",
  "detail.leave.confirm.body":
    "Deixas de ver o pulso e os convívios desta comunidade. As tuas publicações e respostas ficam na comunidade exatamente onde estão, com o teu nome. Podes voltar sempre que quiseres. Só precisas de entrar de novo.",
  "detail.leave.confirm.cancel": "Ficar",
  "detail.leave.confirm.confirmCta": "Sair da comunidade",
  "detail.hero.andMore": "e mais {count}",
  "detail.sidebar.organiser": "Organização",
  "detail.sidebar.messageCta": "Enviar mensagem",
  "detail.sidebar.nextGathering": "Próximo convívio",
  "detail.sidebar.rsvpCta": "Confirmar presença",
  "detail.sidebar.relatedCommunities": "Comunidades relacionadas",
  "detail.sidebar.communityThreads": "Conversas recentes",
  "detail.sidebar.communityOpportunities": "Oportunidades abertas",
  "detail.sidebar.pulseError": "Não foi possível carregar isto agora.",

  // ── Comunidades semelhantes (SimilarCommunitiesSection) ───────────────────
  "detail.similar.heading": "Comunidades semelhantes",

  // ── Separadores do hub (rótulos partilhados) ──────────────────────────────
  "detail.tabs.about": "Sobre",
  "detail.tabs.members": "Pessoas",
  "detail.tabs.forum": "Fórum",
  "detail.tabs.pulse": "Pulso",
  "detail.tabs.discussion": "Discussão",
  "detail.tabs.events": "Eventos",
  "detail.tabs.modtools": "Ferramentas de moderação",
  // Mostrado a um dono/moderador num separador escondido dos membros.
  "detail.hiddenFromMembers":
    "Escondido dos membros. Só donos e moderadores veem este separador.",

  // ── Rótulos partilhados de Sobre / Sobre+Recursos ─────────────────────────
  "detail.about.whoFor": "Para quem é",
  "detail.about.upcomingGathering": "Próximo convívio",

  // ── Separador Pessoas (hub simplificado) ──────────────────────────────────
  "detail.members.showingOf_one": "A mostrar {shown} de {count} pessoa",
  "detail.members.showingOf_other": "A mostrar {shown} de {count} pessoas",
  "detail.members.showingCore": "A mostrar as pessoas principais",

  // ── Separador Fórum (hub simplificado) + tópico ───────────────────────────
  "detail.forum.newPostPlaceholder":
    "Começa uma nova discussão nesta comunidade…",
  "detail.forum.postCta": "Publicar",
  "detail.forum.postedToast": "Publicação adicionada ao fórum da comunidade.",
  "detail.thread.replies_one": "{count} resposta",
  "detail.thread.replies_other": "{count} respostas",
  "detail.thread.replyPlaceholder": "Responde a este tópico…",
  "detail.thread.replyCta": "Responder",
  "detail.thread.replyToast": "Resposta publicada.",
  "detail.thread.editedMark": "(editado)",
  "detail.thread.tombstone": "Esta mensagem foi eliminada.",
  "detail.thread.editSave": "Guardar",
  "detail.thread.editCancel": "Cancelar",
  "detail.thread.editAria": "Edita a tua mensagem",
  "detail.thread.upvoteAria": "Votar a favor deste tópico",
  "detail.thread.editSavedToast": "A tua edição está publicada.",
  "detail.thread.deletedToast": "Mensagem eliminada.",
  "detail.thread.restoredToast": "Mensagem restaurada.",
  "detail.thread.loadMoreRepliesCta": "Carregar mais respostas",
  "detail.thread.loadingMoreReplies": "A carregar…",

  // ── Separador Discussão (hub completo) ────────────────────────────────────
  "detail.discussion.searchAria": "Pesquisar discussões",
  "detail.discussion.filterAria": "Filtrar discussões",
  "detail.discussion.searchPlaceholder":
    "Pesquisar nas discussões desta comunidade…",
  "detail.discussion.chip.all": "Todas",
  "detail.discussion.chip.pinned": "Fixadas",
  "detail.discussion.chip.newest": "Mais recentes",
  "detail.discussion.empty.title": "Nada corresponde ainda",
  "detail.discussion.empty.description":
    "Tenta outra pesquisa, ou começa a discussão abaixo.",
  "detail.discussion.empty.searchMore":
    "Nenhuma das discussões carregadas corresponde. Carrega mais para pesquisar as restantes.",
  "detail.discussion.searchScopeNote":
    "A pesquisar apenas as discussões já carregadas. Carrega mais para alargar.",
  "detail.discussion.startedToast": "Discussão iniciada.",
  "detail.discussion.loadMore": "Carregar mais",

  // ── Separador Eventos (hub completo) ──────────────────────────────────────
  "detail.events.upcoming": "Próximos convívios",
  "detail.events.noUpcoming":
    "Ainda não há convívios no calendário. Volta em breve.",
  "detail.events.past": "Convívios passados",
  "detail.events.recapCta": "Ler retrospetiva",
  "detail.events.rsvpCta": "Confirmar presença",
  "detail.events.host.lead":
    "Qualquer pessoa daqui pode pôr algo no calendário. Escolhe uma data, um sítio e um tamanho, e esta comunidade vai ver.",
  "detail.events.host.cta": "Organizar um convívio aqui",

  // ── Separador de pessoas / lista (hub completo) ───────────────────────────
  "detail.roster.searchAria": "Pesquisar pessoas",
  "detail.roster.searchPlaceholder":
    "Pesquisar pessoas por nome, papel ou bairro…",
  "detail.roster.verified": "Verificade",
  "detail.roster.alsoIn": "Também é membro de {names}",
  "detail.roster.messageCta": "Mensagem",
  "detail.roster.showingOf_one": "A mostrar {shown} de {count} pessoa",
  "detail.roster.showingOf_other": "A mostrar {shown} de {count} pessoas",
  "detail.roster.searchScopeNote":
    "A pesquisar apenas as pessoas já carregadas. Carrega mais para alargar.",
  "detail.roster.loadMoreCta": "Carregar mais pessoas",
  "detail.roster.loadingMore": "A carregar…",

  // ── Separador de ferramentas de moderação (hub completo) ──────────────────
  // A barra de secções da consola. Banimentos não tem entrada própria: vive
  // dentro de Pessoas, porque um banimento é o estado de um membro.
  "detail.modtools.nav.label": "Secções das ferramentas de moderação",
  "detail.modtools.nav.overview": "Resumo",
  "detail.modtools.nav.requests": "Pedidos",
  "detail.modtools.nav.reports": "Denúncias",
  "detail.modtools.nav.members": "Pessoas",
  "detail.modtools.nav.invites": "Convites",
  "detail.modtools.nav.support": "Apoio",
  "detail.modtools.nav.card": "Cartão de membro",
  "detail.modtools.nav.danger": "Zona de risco",
  "detail.modtools.overview.attention.label": "A precisar de ti",
  "detail.modtools.overview.attention.requests_one":
    "Uma pessoa está à espera para entrar",
  "detail.modtools.overview.attention.requests_other":
    "{count} pessoas estão à espera para entrar",
  "detail.modtools.overview.attention.reports_one":
    "Uma publicação foi denunciada",
  "detail.modtools.overview.attention.reports_other":
    "{count} publicações foram denunciadas",
  "detail.modtools.overview.attention.support_one":
    "Alguém da QueerPulse ofereceu-vos ajuda",
  "detail.modtools.overview.attention.support_other":
    "{count} ofertas de apoio estão à vossa espera",
  "detail.modtools.overview.attention.clear.title": "Nada à tua espera",
  "detail.modtools.overview.attention.clear.description":
    "Sem pedidos para entrar e sem denúncias. O que aparecer de novo fica aqui.",
  "detail.modtools.insights.label": "Estatísticas da comunidade",
  "detail.modtools.insights.error.title":
    "Não foi possível carregar as estatísticas",
  "detail.modtools.insights.error.description":
    "Algo correu mal ao carregar os números. Tenta novamente.",
  "detail.modtools.insights.error.retryCta": "Tentar novamente",
  "detail.modtools.insights.memberCount": "Pessoas",
  "detail.modtools.insights.newThisWeek": "Novas esta semana",
  "detail.modtools.insights.newThisMonth": "Novas este mês",
  "detail.modtools.insights.postCount": "Publicações",
  "detail.modtools.insights.postsThisWeek": "Publicações esta semana",
  "detail.modtools.insights.activeMembers": "Ativas esta semana",
  "detail.modtools.joinRequests.label": "Pessoas a pedir para entrar",
  "detail.modtools.joinRequests.empty.title": "Sem pedidos à espera",
  "detail.modtools.joinRequests.empty.description":
    "Está tudo em dia. Os novos pedidos aparecem aqui.",
  "detail.modtools.joinRequests.requestedAgo": "Pedido enviado há {time}",
  "detail.modtools.joinRequests.approveCta": "Aprovar",
  "detail.modtools.joinRequests.declineCta": "Recusar",
  // O cartão de quem se candidata. Contexto para uma decisão humana: sem
  // totais, sem ordenação, sem recomendação.
  "detail.modtools.joinRequests.applicant.since": "No QueerPulse desde {date}",
  "detail.modtools.joinRequests.applicant.sharedConnections_one":
    "{count} ligação em comum",
  "detail.modtools.joinRequests.applicant.sharedConnections_other":
    "{count} ligações em comum",
  "detail.modtools.joinRequests.applicant.sharedCommunities_one":
    "{count} comunidade em comum",
  "detail.modtools.joinRequests.applicant.sharedCommunities_other":
    "{count} comunidades em comum",
  "detail.modtools.joinRequests.applicant.involvementLabel":
    "Quer participar assim",
  "detail.modtools.joinRequests.applicant.noteLabel": "Nas palavras da pessoa",
  // Recusar. As duas esperas vêm das constantes do backend (ver
  // `joinRequestReview.data.ts`), interpoladas em vez de escritas no texto.
  "detail.modtools.joinRequests.decline.title": "A recusar {name}",
  "detail.modtools.joinRequests.decline.kindLabel": "Que tipo de não é este?",
  "detail.modtools.joinRequests.decline.notNow.label": "Agora não",
  "detail.modtools.joinRequests.decline.notAFit.label": "Não encaixa",
  "detail.modtools.joinRequests.decline.reapplyAfterDays":
    "Pode pedir outra vez daqui a {days} dias.",
  "detail.modtools.joinRequests.decline.reasonLabel":
    "Uma nota para quem se candidatou (opcional)",
  "detail.modtools.joinRequests.decline.reasonHint":
    "Quem se candidatou lê isto tal e qual. Guarda para outro sítio o que for só para a restante equipa de moderação.",
  "detail.modtools.joinRequests.decline.reasonPlaceholder":
    "O que gostarias que essa pessoa soubesse.",
  "detail.modtools.joinRequests.decline.confirmCta": "Enviar a recusa",
  "detail.modtools.joinRequests.decline.cancelCta": "Cancelar",
  "detail.modtools.reports.label": "Publicações denunciadas",
  "detail.modtools.reports.empty.title": "Tudo em ordem",
  "detail.modtools.queueError.title": "Não foi possível carregar esta fila",
  "detail.modtools.queueError.description":
    "A fila não carregou, por isso trata-a como desconhecida. Tenta novamente e avisa-nos se continuar a acontecer.",
  "detail.modtools.queueError.retry": "Tentar novamente",
  "detail.modtools.reports.empty.description":
    "Nada foi assinalado. A comunidade cuida de si mesma.",
  "detail.modtools.reports.meta":
    "De {author} · denunciado por {reporter} · há {time}",
  "detail.modtools.reports.metaAuthor": "De {author} · denunciado há {time}",
  "detail.modtools.reports.metaErasedAuthor":
    "De uma conta entretanto removida · denunciado há {time}",
  "detail.modtools.reports.severity.emergency": "Emergência",
  "detail.modtools.reports.severity.high": "Prioridade alta",
  "detail.modtools.reports.severity.medium": "Prioridade média",
  "detail.modtools.reports.severity.low": "Prioridade baixa",
  "detail.modtools.reports.overdue": "Fora do prazo de resposta",
  "detail.modtools.reports.state.hidden": "Escondido das pessoas neste momento",
  "detail.modtools.reports.state.removed": "Já removido",
  "detail.modtools.reports.state.deleted": "Já apagado",
  "detail.modtools.reports.excerptTruncated":
    "Isto é apenas o início. Abre o tópico para ler o resto antes de decidires.",
  "detail.modtools.reports.contentMissing":
    "A publicação ou resposta em causa já não existe. Ignorar encerra a denúncia.",
  "detail.modtools.reports.openThread": "Abrir o tópico",
  "detail.modtools.reports.openThreadLabel": "Abrir o tópico desta denúncia",
  "detail.modtools.reports.removeCta": "Remover",
  "detail.modtools.reports.dismissCta": "Ignorar",
  "detail.modtools.reports.escalateCta": "Enviar para a equipa",
  "detail.modtools.reports.staffOnlyNote":
    "Esta denúncia é sobre exposição forçada ou divulgação de dados pessoais. Estas são decididas pela equipa da plataforma, por isso enviá-la para cima é a ação disponível aqui.",
  // Sem uso desde a TS-08: remover uma resposta passa agora pela própria
  // denúncia, tal como remover uma publicação. Mantida para que nada que ainda
  // a resolva mostre a chave em bruto.
  "detail.modtools.members.label": "Pessoas",
  "detail.modtools.members.makeModCta": "Tornar mod",
  "detail.modtools.members.demoteCta": "Remover como mod",
  "detail.modtools.members.makeCoOwnerCta": "Tornar cotitular",
  "detail.modtools.members.removeCoOwnerCta": "Remover cotitular",
  "detail.modtools.members.coOwnerNote":
    "Quem é cotitular partilha os teus poderes aqui: rever pedidos de entrada, moderar publicações, editar a comunidade e gerir as pessoas. Transferir a titularidade, arquivar a comunidade e mudar o papel de quem é cotitular continuam a ser só teus.",
  "detail.modtools.members.removeCta": "Remover da comunidade",
  "detail.modtools.members.ownerTag": "Responsável",
  "detail.modtools.members.actionsAria": "Ações para {name}",
  "detail.modtools.toast.approved": "{name} aprovade. Dá-lhe as boas-vindas.",
  "detail.modtools.toast.declined":
    "O pedido de {name} não foi aprovado desta vez.",
  "detail.modtools.toast.postRemoved":
    "Publicação removida. Já foi contactada a pessoa autora.",
  "detail.modtools.toast.reportDismissed": "Denúncia ignorada.",
  "detail.modtools.toast.reportEscalated":
    "Enviada para a equipa da plataforma. A partir daqui é com elas.",
  "detail.modtools.toast.promoted": "{name} é agora mod.",
  "detail.modtools.toast.demoted": "{name} volta a ser membro.",
  "detail.modtools.toast.coOwnerGranted": "{name} é agora cotitular.",
  "detail.modtools.toast.coOwnerRevoked":
    "{name} deixou de ser cotitular e continua na comunidade como membro.",
  "detail.modtools.toast.removed": "{name} foi removide.",
  "detail.modtools.confirm.removeMember.title": "Remover {name} da comunidade?",
  "detail.modtools.confirm.removeMember.body":
    "Perde o acesso às publicações, encontros e pessoas daqui. Pode voltar a pedir para entrar mais tarde.",
  "detail.modtools.confirm.removeMember.confirmCta": "Remover pessoa",
  "detail.modtools.confirm.grantCoOwner.title": "Tornar {name} cotitular?",
  "detail.modtools.confirm.grantCoOwner.body":
    "Passa a poder fazer tudo o que tu fazes nesta comunidade, à exceção de transferir a titularidade, arquivá-la e mudar o papel de outra pessoa cotitular. Podes reverter quando quiseres.",
  "detail.modtools.confirm.grantCoOwner.confirmCta": "Tornar cotitular",
  "detail.modtools.confirm.revokeCoOwner.title":
    "Remover {name} como cotitular?",
  "detail.modtools.confirm.revokeCoOwner.body":
    "Mantém o lugar aqui como membro e perde os poderes de cotitular. Podes voltar a torná-la cotitular mais tarde.",
  "detail.modtools.confirm.revokeCoOwner.confirmCta": "Remover cotitular",
  "detail.modtools.confirm.removePost.title": "Remover esta publicação?",
  "detail.modtools.confirm.removePost.body":
    "Deixa de estar visível para toda a gente e a denúncia sai da tua fila. O teu motivo fica registado na denúncia, para que a decisão possa ser lida mais tarde. Não é possível anular aqui.",
  "detail.modtools.confirm.removePost.confirmCta": "Remover",
  "detail.modtools.confirm.removePost.reasonLabel": "O que isto infringe",
  "detail.modtools.confirm.removePost.noteLabel": "Porque foi removido",
  "detail.modtools.confirm.removePost.notePlaceholder":
    "Diz o que aconteceu, pelas tuas palavras.",

  // ── Zona de risco (separador de ferramentas de moderação, hub completo) ───
  "detail.dangerZone.heading": "Zona de risco",
  "detail.dangerZone.errorToast": "Algo correu mal. Tenta novamente.",
  "detail.dangerZone.freeze.label": "Congelar a comunidade",
  "detail.dangerZone.freeze.text":
    "Pausa novas publicações e pedidos de entrada enquanto as coisas assentam. As pessoas ainda podem ler.",
  "detail.dangerZone.freeze.cta": "Congelar",
  "detail.dangerZone.freeze.successToast": "{name} foi congelada.",
  "detail.dangerZone.freeze.confirm.title": "Congelar {name}?",
  "detail.dangerZone.freeze.confirm.body":
    "As pessoas não vão poder publicar nem entrar enquanto a comunidade estiver congelada. Podes descongelar quando quiseres.",
  "detail.dangerZone.freeze.confirm.cancel": "Cancelar",
  "detail.dangerZone.freeze.confirm.confirmCta": "Congelar comunidade",
  "detail.dangerZone.archive.label": "Arquivar a comunidade",
  "detail.dangerZone.archive.text":
    "Fecha a comunidade definitivamente. Fica visível em modo só de leitura; ninguém pode publicar, entrar ou geri-la.",
  "detail.dangerZone.archive.cta": "Arquivar",
  "detail.dangerZone.archive.successToast": "{name} foi arquivada.",
  "detail.dangerZone.archive.confirm.title": "Arquivar {name}?",
  "detail.dangerZone.archive.confirm.body":
    "Isto fecha a comunidade definitivamente. Fica só de leitura e não pode ser reaberta. Não é possível desfazer esta ação.",
  "detail.dangerZone.archive.confirm.cancel": "Cancelar",
  "detail.dangerZone.archive.confirm.confirmCta": "Arquivar comunidade",
  "detail.dangerZone.transfer.label": "Transferir a titularidade",
  "detail.dangerZone.transfer.text":
    "Passa a comunidade para outra pessoa membro. Manténs o teu papel atual.",
  "detail.dangerZone.transfer.cta": "Transferir",
  "detail.dangerZone.transfer.successToast":
    "A titularidade foi transferida para {owner}.",
  "detail.dangerZone.transfer.confirm.title":
    "Transferir a titularidade de {name}?",
  "detail.dangerZone.transfer.confirm.body":
    "Escolhe quem passa a ser responsável. Vai ficar com controlo total de {name}.",
  "detail.dangerZone.transfer.confirm.cancel": "Cancelar",
  "detail.dangerZone.transfer.confirm.confirmCta": "Transferir titularidade",
  "detail.dangerZone.transfer.confirm.empty":
    "Ainda não há mais ninguém na lista de pessoas para passar isto.",
  "detail.dangerZone.transfer.confirm.searchPlaceholder": "Procurar pessoas…",

  // ── Ferramentas de moderação · tendências (12 semanas) ────────────────────
  "detail.modtools.insights.trend.membersLabel": "Novas pessoas por semana",
  "detail.modtools.insights.trend.postsLabel": "Publicações por semana",
  "detail.modtools.insights.trend.rising":
    "A subir. {recent} nas últimas {weeks} semanas, face a {previous} nas {weeks} anteriores.",
  "detail.modtools.insights.trend.steady":
    "Estável. {recent} nas últimas {weeks} semanas, face a {previous} nas {weeks} anteriores.",
  "detail.modtools.insights.trend.falling":
    "A descer. {recent} nas últimas {weeks} semanas, face a {previous} nas {weeks} anteriores.",
  "detail.modtools.insights.trend.quiet":
    "Sem movimento. Nada registado nas últimas {total} semanas.",
  "detail.modtools.insights.trend.note":
    "Totais semanais de toda a comunidade. A atividade de cada pessoa continua privada.",

  // ── Ferramentas de moderação · lista de bloqueios ─────────────────────────
  // OPS-05: o que a equipa da plataforma ofereceu a esta comunidade, e as duas
  // respostas que a moderação pode dar.
  "detail.modtools.support.label": "Apoio da QueerPulse",
  "detail.modtools.support.intro":
    "Quando a equipa da plataforma acha que esta comunidade pode precisar de uma ajuda, diz aqui. Aceitem o que vos servir e recusem o resto.",
  "detail.modtools.support.option.message":
    "Alguém da equipa da plataforma escreve-vos diretamente",
  "detail.modtools.support.option.buddy":
    "Uma pessoa da equipa acompanha-vos durante duas semanas",
  "detail.modtools.support.option.toolkit":
    "O guia de desanuviamento, partilhado com a vossa moderação",
  "detail.modtools.support.option.recruit":
    "Ajuda a encontrar mais uma pessoa para moderar convosco",
  "detail.modtools.support.status.new": "À vossa espera",
  "detail.modtools.support.status.acknowledged": "Aceite",
  "detail.modtools.support.status.declined": "Recusado",
  "detail.modtools.support.byOn": "Oferecido por {name} a {date}",
  "detail.modtools.support.note": "Nota: {note}",
  "detail.modtools.support.answeredOn": "Responderam a {date}.",
  "detail.modtools.support.formerStaff": "Alguém da QueerPulse",
  "detail.modtools.support.acceptCta": "Sim, por favor",
  "detail.modtools.support.declineCta": "Agora não",
  "detail.modtools.support.acceptedToast":
    "Aceite. A equipa da plataforma vê a vossa resposta.",
  "detail.modtools.support.declinedToast":
    "Recusado. A equipa da plataforma vê a vossa resposta.",
  "detail.modtools.support.errorToast":
    "A resposta não ficou guardada. Tenta de novo.",
  "detail.modtools.support.empty.title": "Ainda sem ofertas",
  "detail.modtools.support.empty.description":
    "Ninguém da equipa da plataforma ofereceu apoio a esta comunidade. Se o fizerem, aparece aqui.",
  "detail.modtools.bans.label": "Pessoas barradas desta comunidade",
  "detail.modtools.bans.intro":
    "Quem está barrado neste momento, do mais recente para o mais antigo. Levantar um bloqueio reabre a porta desta comunidade.",
  "detail.modtools.bans.empty.title": "Não há ninguém barrado",
  "detail.modtools.bans.empty.description":
    "Os bloqueios aplicados quando removes alguém da comunidade aparecem aqui.",
  "detail.modtools.bans.formerMember": "Alguém que já cá esteve",
  "detail.modtools.bans.byOn": "Barrade por {name} a {date}.",
  "detail.modtools.bans.byGoneOn":
    "Barrade a {date}. Quem aplicou o bloqueio já saiu.",
  "detail.modtools.bans.reason": "Motivo registado: {reason}",
  "detail.modtools.bans.noReason": "Não ficou registado nenhum motivo.",
  "detail.modtools.bans.liftCta": "Levantar bloqueio",
  "detail.modtools.bans.erasedNote":
    "Esta conta foi eliminada, por isso já não há ninguém para readmitir.",
  "detail.modtools.bans.confirm.title": "Levantar o bloqueio de {name}?",
  "detail.modtools.bans.confirm.body":
    "Isto reabre a porta: {name} pode voltar a pedir para entrar. A lista de pessoas fica como está, por isso volta a entrar como qualquer outra pessoa.",
  "detail.modtools.bans.confirm.confirmCta": "Levantar bloqueio",
  "detail.modtools.bans.liftedToast": "O bloqueio de {name} foi levantado.",
  "detail.modtools.bans.errorToast":
    "Não foi possível levantar esse bloqueio. Tenta novamente.",

  // ── Ferramentas de moderação · convidar pessoas ───────────────────────────
  "detail.modtools.invites.label": "Convidar pessoas",
  "detail.modtools.invites.intro":
    "Escolhe pessoas com quem tens ligação e envia-lhes um convite para esta comunidade, até {max} de cada vez. Um convite é uma mensagem que podem aceitar ou deixar ficar. Entrar continua a ser decisão delas.",
  "detail.modtools.invites.searchPlaceholder": "Procurar nas tuas ligações…",
  "detail.modtools.invites.selectedCount": "{selected} de {max} selecionadas",
  "detail.modtools.invites.sendCta": "Enviar convites",
  "detail.modtools.invites.errorToast":
    "Não foi possível enviar esses convites. Tenta novamente.",
  "detail.modtools.invites.empty.title": "Não há mais ninguém para convidar",
  "detail.modtools.invites.empty.description":
    "Todas as pessoas com quem tens ligação já estão nesta comunidade.",
  "detail.modtools.invites.result.invited": "Convites enviados ({total})",
  "detail.modtools.invites.result.skipped": "Ignoradas ({total})",
  "detail.modtools.invites.result.skipRow": "{name}: {reason}",
  "detail.modtools.invites.result.note":
    "Quem aparece em Ignoradas ficou de fora e não recebeu nada. Quem foi convidade decide por si se quer entrar.",
  "detail.modtools.invites.skip.unknownMember": "Não encontrámos esta pessoa.",
  "detail.modtools.invites.skip.self": "Esta é a tua própria conta.",
  "detail.modtools.invites.skip.systemAccount":
    "Esta é uma conta da plataforma.",
  "detail.modtools.invites.skip.alreadyMember": "Já está nesta comunidade.",
  "detail.modtools.invites.skip.pendingRequest":
    "Já pediu para entrar. Responde-lhe na fila de pedidos acima.",
  "detail.modtools.invites.skip.banned": "Está barrade desta comunidade.",

  // ── Zona de perigo · o teu papel + ausência de quem é responsável ─────────
  "detail.dangerZone.yourRole.owner": "Esta comunidade é tua.",
  "detail.dangerZone.yourRole.coOwner":
    "És cotitular desta comunidade. Transferir a titularidade e arquivar continuam a caber a quem é responsável.",
  "detail.dangerZone.yourRole.mod":
    "Moderas esta comunidade. Transferir a titularidade e arquivar continuam a caber a quem é responsável.",
  "detail.dangerZone.ownerReview.label":
    "Comunicar que não se consegue chegar a quem é responsável",
  "detail.dangerZone.ownerReview.text":
    "Se quem é responsável deixou de responder e a comunidade está à espera de decisões que só essa pessoa pode tomar, pede à equipa da plataforma para verificar.",
  "detail.dangerZone.ownerReview.cta": "Pedir verificação à equipa",
  "detail.dangerZone.ownerReview.confirm.title":
    "Pedir à equipa da plataforma para verificar quem é responsável por esta comunidade?",
  "detail.dangerZone.ownerReview.confirm.body":
    "A equipa da plataforma vai ler isto e tentar chegar a essa pessoa. Descreve quando tentaste o contacto e o que está pendente na comunidade.",
  "detail.dangerZone.ownerReview.confirm.reasonLabel": "O que aconteceu",
  "detail.dangerZone.ownerReview.confirm.reasonPlaceholder":
    "Enviámos mensagem a 3 e a 17 de março sobre a fila de pedidos e não tivemos resposta. Há catorze pedidos à espera.",
  "detail.dangerZone.ownerReview.confirm.minHint":
    "Escreve pelo menos {min} caracteres, para a equipa ter algo concreto.",
  "detail.dangerZone.ownerReview.confirm.tooShort":
    "Acrescenta um pouco mais de detalhe. Pelo menos {min} caracteres.",
  "detail.dangerZone.ownerReview.confirm.confirmCta":
    "Enviar à equipa da plataforma",
  "detail.dangerZone.ownerReview.filedToast":
    "Enviado. A equipa da plataforma trata do resto.",
  "detail.dangerZone.ownerReview.errorToast":
    "Algo correu mal. Tenta novamente.",
  "detail.dangerZone.ownerReview.open.staffHeading":
    "Há uma verificação de titularidade em curso",
  "detail.dangerZone.ownerReview.open.ownerHeading":
    "A moderação pediu à equipa da plataforma para verificar quem é responsável por esta comunidade",
  "detail.dangerZone.ownerReview.open.ownerBody":
    "Comunicaram que não conseguiram chegar a ti. Estás a ler isto, por isso podes retirar o pedido.",
  "detail.dangerZone.ownerReview.open.filedBy":
    "Registado por {name} a {date}.",
  "detail.dangerZone.ownerReview.open.filedOn": "Registado a {date}.",
  "detail.dangerZone.ownerReview.open.reason": "O que escreveram: {reason}",
  "detail.dangerZone.ownerReview.open.noReason":
    "Não ficou registado nenhum detalhe.",
  "detail.dangerZone.ownerReview.withdrawCta": "Retirar o pedido",
  "detail.dangerZone.ownerReview.withdraw.title":
    "Retirar esta verificação de titularidade?",
  "detail.dangerZone.ownerReview.withdraw.body":
    "A equipa da plataforma deixa de a analisar. Quem pode registar uma verificação pode voltar a registar outra mais tarde.",
  "detail.dangerZone.ownerReview.withdraw.confirmCta": "Retirar",
  "detail.dangerZone.ownerReview.withdrawnToast":
    "A verificação de titularidade foi retirada.",
  "detail.dangerZone.ownerReview.flagged.heading":
    "Sinalizada para verificação de titularidade",
  "detail.dangerZone.ownerReview.flagged.body":
    "A equipa da plataforma tem esta comunidade sinalizada para verificação de titularidade. Não há nenhum pedido da moderação por trás disto.",

  // ── Separador Pulso (hub completo) ────────────────────────────────────────
  "detail.pulse.joinHint":
    "Podes ler à vontade. Junta-te a {name} para participar.",
  "detail.pulse.composerPlaceholder": "Partilha algo com {name}…",
  "detail.pulse.shareCta": "Partilhar",
  "detail.pulse.pinnedAnnouncement": "Anúncio fixado",
  "detail.pulse.replyLabel_one": "Ver {count} resposta",
  "detail.pulse.replyLabel_other": "Ver {count} respostas",
  "detail.pulse.replyAction": "Responder",
  "detail.pulse.replyPlaceholder": "Escreve uma resposta…",
  "detail.pulse.imageAlt": "Imagem partilhada por {name}",
  "detail.pulse.sharedToast": "Partilhado com a comunidade.",
  "detail.pulse.loadingMore": "A carregar…",
  "detail.pulse.loadMoreCta": "Carregar mais publicações",

  // ── Copiar a ligação de uma publicação (SOC-02) ───────────────────────────
  "detail.pulse.copyLink.ariaLabel": "Copiar a ligação desta publicação",
  "detail.pulse.copyLink.copiedToast": "Ligação copiada. Cola onde quiseres.",
  "detail.pulse.copyLink.failedToast":
    "Não foi possível aceder à área de transferência. Copia antes o endereço da barra.",

  // ── Anúncios (organização / co-organização / moderação) ───────────────────
  "detail.pulse.announcement.toggleLabel": "Publicar como anúncio",
  "detail.pulse.announcement.toggleHint":
    "Fixa no topo do Pulso e notifica toda a comunidade.",
  "detail.pulse.announcement.toggleAria": "Publicar isto como anúncio",
  "detail.pulse.announcement.shareCta": "Anunciar",
  "detail.pulse.announcement.sharedToast":
    "Anunciado. Ficou fixado no topo e a comunidade foi notificada.",
  "detail.pulse.announcement.flag": "Anúncio",

  // ── Pesquisa no mural (no servidor, em todo o histórico) ──────────────────
  "detail.pulse.search.placeholder": "Pesquisar publicações em {name}…",
  "detail.pulse.search.ariaLabel": "Pesquisar publicações em {name}",
  "detail.pulse.search.resultCount_one": "{count} publicação encontrada",
  "detail.pulse.search.resultCount_other": "{count} publicações encontradas",
  "detail.pulse.search.loadMoreCta": "Carregar mais resultados",
  "detail.pulse.search.emptyTitle": "Nenhuma publicação corresponde",
  "detail.pulse.search.emptyDescription":
    "Nada nesta comunidade menciona “{term}”. Tenta uma palavra mais curta ou outra grafia.",
  "detail.pulse.search.errorTitle": "Não foi possível fazer a pesquisa",
  "detail.pulse.search.errorDescription":
    "Algo correu mal ao chegar às publicações desta comunidade. Tenta de novo daqui a pouco.",
  "detail.events.error.title": "Não foi possível carregar os convívios",
  "detail.events.error.description":
    "Algo correu mal ao chegar ao calendário desta comunidade. Tenta de novo daqui a pouco.",
  "detail.events.error.retryCta": "Tentar novamente",
  "detail.pulse.empty.title": "Ainda não há nada por aqui",
  "detail.pulse.empty.description":
    "Publica o primeiro olá. Uma linha sobre a tua semana chega para pôr a sala a conversar.",
  "detail.pulse.empty.visitorDescription":
    "Esta comunidade ainda não publicou nada. Junta-te para fazer parte do que vem a seguir.",

  // ── Página de uma só publicação (/community/:slug/post/:postId) ───────────
  "post.heading": "Uma publicação em {name}",
  "post.backTo": "Voltar a {name}",
  "post.loadMoreReplies": "Carregar mais respostas",
  "post.notFound.title": "Esta publicação não está aqui",
  "post.notFound.description":
    "Pode ter sido removida, ou está numa comunidade de que não fazes parte.",
  "post.notFound.cta": "Ir para a comunidade",

  // ── Separador Sobre + Recursos (hub completo) ─────────────────────────────
  "detail.aboutResources.houseRules": "Regras da casa",
  "detail.aboutResources.resources": "Recursos",

  // ── A prateleira de recursos: leitura para membros, edição para a equipa ──
  "detail.resources.manageCta": "Gerir",
  "detail.resources.doneCta": "Concluído",
  "detail.resources.emptyStaffHint":
    "Ainda não há nada na prateleira. Fixa aquilo que as pessoas pedem sempre: o documento com as regras da casa, o grupo de conversa, as atas das reuniões.",
  "detail.resources.kind.link": "Ligação",
  "detail.resources.kind.doc": "Documento",
  "detail.resources.kind.guide": "Guia",
  "detail.resources.editor.addCta": "Adicionar um recurso",
  "detail.resources.editor.capReached":
    "Esta prateleira leva {max} recursos e está cheia. Remove um para adicionar outro.",
  "detail.resources.editor.dragToReorder": "Arrasta para reordenar",
  "detail.resources.editor.moveUpAria": "Mover {title} para cima",
  "detail.resources.editor.moveDownAria": "Mover {title} para baixo",
  "detail.resources.editor.editAria": "Editar {title}",
  "detail.resources.editor.removeAria": "Remover {title}",
  "detail.resources.editor.errorToast":
    "Não foi guardado. Tenta de novo daqui a pouco.",
  "detail.resources.editor.addedToast": "Adicionado à prateleira.",
  "detail.resources.editor.savedToast": "Recurso atualizado.",
  "detail.resources.editor.removedToast": "Retirado da prateleira.",
  "detail.resources.editor.removeConfirmTitle": "Remover {title}?",
  "detail.resources.editor.removeConfirmBody":
    "Sai da prateleira para toda a gente nesta comunidade. A página para onde aponta fica intacta e podes voltar a fixá-la mais tarde.",
  "detail.resources.editor.removeConfirmCta": "Remover",
  "detail.resources.form.addTitle": "Adicionar um recurso",
  "detail.resources.form.editTitle": "Editar recurso",
  "detail.resources.form.subtitle":
    "Toda a gente nesta comunidade vê a prateleira, por isso guarda-a para aquilo a que as pessoas vão mesmo pegar.",
  "detail.resources.form.titleLabel": "Título",
  "detail.resources.form.titlePlaceholder": "Regras da casa",
  "detail.resources.form.titleRequired": "Dá-lhe um título.",
  "detail.resources.form.urlLabel": "Ligação",
  "detail.resources.form.urlPlaceholder": "https://",
  "detail.resources.form.urlHelper":
    "Um endereço web completo, a começar por http:// ou https://",
  "detail.resources.form.urlRequired":
    "Indica a ligação para onde deve apontar.",
  "detail.resources.form.urlInvalid":
    "Isso não é um endereço web para o qual possamos ligar. Tem de começar por http:// ou https://",
  "detail.resources.form.kindLabel": "Tipo",
  "detail.resources.form.noteLabel": "Nota",
  "detail.resources.form.notePlaceholder": "O que as pessoas vão encontrar lá",
  "detail.resources.form.noteHelper":
    "Opcional. Uma linha por baixo do título, para ninguém ter de abrir para saber o que é.",
  "detail.resources.form.cancelCta": "Cancelar",
  "detail.resources.form.saveCta": "Guardar",
  "detail.resources.form.savingCta": "A guardar…",

  // ── Distintivos: papéis, níveis de acesso, barra de reações ───────────────
  "badges.role.owner": "Responsável",
  "badges.role.coOwner": "Cotitular",
  "badges.role.mod": "Mod",
  "badges.tier.public": "Aberta a todas as pessoas",
  "badges.tier.request": "Pedido para entrar",
  "badges.tier.invite": "Só com convite",
  "badges.tier.private": "Privada",
  "badges.reaction.heart": "Adoro",
  "badges.reaction.celebrate": "Celebrar",
  "badges.reaction.support": "Apoio",
  "badges.reaction.fire": "Fogo",
  "badges.reaction.ariaLabel": "{label}: {count}",

  // ── Modal de adesão ────────────────────────────────────────────────────────
  "join.progress": "Passo {step} de {total}",
  "join.ariaLabel": "Junta-te a {name}",
  "join.intro.eyebrow.request": "A pedir para entrar",
  "join.intro.eyebrow.invite": "A entrar com um convite",
  "join.intro.eyebrow.public": "A Junta-te",
  "join.intro.inviteHint":
    "Esta comunidade é só com convite, por isso o teu pedido segue para a moderação para ser revisto, tal como qualquer pedido para entrar.",
  "join.intro.continueCta": "Continuar",
  "join.about.eyebrow": "Um pouco sobre ti",
  "join.about.title": "Como deve a comunidade conhecer-te?",
  "join.about.hint":
    "Opcional: um pouco de contexto ajuda as pessoas a saberem quem és.",
  "join.about.aboutPlaceholder": "Uma frase sobre ti: o que te traz até aqui?",
  "join.about.submitting": "A enviar…",
  "join.about.errorFallback":
    "Não foi possível concluir. Tenta novamente daqui a pouco.",
  "join.involvement.title": "Como gostarias de participar?",
  "join.involvement.levelLabel": "Nível de envolvimento",
  "join.involvement.sendRequestCta": "Enviar pedido",
  "join.involvement.joinCta": "Junta-te à comunidade",
  "join.involvement.updates.label": "Só quero saber das novidades",
  "join.involvement.updates.desc":
    "Só notícias e eventos: sem qualquer compromisso",
  "join.involvement.active.label": "Membro ativo",
  "join.involvement.active.desc": "Vou aos eventos e junto-me ao grupo",
  "join.involvement.organise.label": "Ajudar a organizar",
  "join.involvement.organise.desc": "Ser voluntárie para ajudar a gerir",
  // Regras da casa, mostradas à entrada e aceites por versão
  "join.rules.eyebrow": "Regras da casa",
  "join.rules.title": "As regras da casa de {name}",
  "join.rules.hint":
    "Lê estas regras antes de entrares. Toda a gente neste espaço concorda com elas.",
  "join.rules.updatedNotice":
    "Estas regras foram atualizadas enquanto tinhas isto aberto. Lê-as outra vez, por favor.",
  "join.rules.acknowledge.title":
    "Li estas regras da casa e concordo em segui-las",
  "join.rules.acknowledge.sub":
    "Podes voltar a lê-las quando quiseres, no separador Sobre da comunidade.",
  "join.rules.continueCta": "Continuar",
  "join.rules.acknowledgeRequired":
    "Confirma que leste as regras da casa para continuares.",
  // As duas recusas que a entrada pode devolver. Nenhuma nomeia quem modera e
  // nenhuma dá um motivo, porque o backend não envia nenhum de propósito.
  "join.refusal.banned.title": "Esta comunidade está fechada para ti",
  "join.refusal.banned.body":
    "Não podes entrar nesta comunidade. Aqui não conseguimos dizer mais do que isto. Se achas que houve um engano, a equipa QueerPulse pode ver isso contigo.",
  "join.refusal.reapply.title": "Podes pedir outra vez mais tarde",
  "join.refusal.reapply.body":
    "Esta comunidade pediu-te para esperares antes de te candidatares de novo. Podes enviar um novo pedido a partir de {date}.",
  "join.refusal.reapply.bodyNoDate":
    "Esta comunidade pediu-te para esperares antes de te candidatares de novo. Podes enviar um novo pedido quando essa espera terminar.",
  "join.refusal.closeCta": "Fechar",
  "join.done.requestTitle": "O teu pedido está com a moderação",
  "join.done.welcomeTitle": "Bem-vinde a {name}",
  "join.done.requestBody":
    "Obrigade por partilhares. A moderação de <strong>{name}</strong> vai ler o teu pedido e dar-te as boas-vindas. Avisamos-te de qualquer forma.",
  "join.done.joinedBody":
    "Já fazes parte de <strong>{name}</strong>. Alguém vai entrar em contacto para te ajudar a instalar-te.",
  "join.done.doneCta": "Concluído",

  // ── Assistente Começar uma Comunidade: estrutura / barra de progresso ────
  "start.hero.back": "Voltar às tuas comunidades",
  "start.hero.eyebrow": "Comunidades e Coletivos · fundar um espaço",
  "start.hero.title": "Começa uma <em>comunidade.</em>",
  "start.hero.lead":
    "Um lugar para a tua gente se juntar: social, de apoio, criativo, ou algo que só tu sabes nomear. <strong>Nada fica público até estares pronte.</strong>",
  "start.next.begin": "Vamos começar",
  "start.next.people": "A seguir: as pessoas",
  "start.next.door": "A seguir: a porta",
  "start.next.who": "A seguir: quem gere",
  "start.next.tone": "A seguir: o tom",
  "start.next.feeling": "A seguir: o sentir",
  "start.next.first": "A seguir: os primeiros",
  "start.next.review": "Rever e abrir",
  "start.next.open": "Abrir as portas",
  "start.next.fallback": "Continuar",
  "start.opening.status": "A abrir as portas…",
  "start.leaveConfirm":
    "Tens uma comunidade por terminar aqui. Queres sair sem a guardar?",
  "start.cancel": "Cancelar",
  "start.back": "Voltar",
  "start.actions.stillNeeded": "Ainda falta:",
  "start.actions.blockedTitle": "Falta preencher mais algumas coisas",

  // ── "Still needed" validation chips (useCommunityForm.ts → PanelActions) ──
  "start.missing.name": "um nome",
  "start.missing.purpose": "para que serve",
  "start.missing.category": "uma categoria",
  "start.missing.whoFor": "para quem é",
  "start.missing.access": "quem a pode encontrar",
  "start.missing.rules": "pelo menos um valor partilhado",
  "start.missing.tagline": "uma frase de assinatura",
  "start.missing.handle": "um endereço",
  "start.missing.consent": "a tua confirmação",
  "start.thread.backTo": "Voltar a {thread}",
  "start.thread.stepOf": "Passo {step} de {total} · <b>{thread}</b>",

  // ── Texto dos painéis do fio condutor (PANELS) ────────────────────────────
  "start.panel.open.thread": "Abrir",
  "start.panel.open.eyebrow": "A fundar um espaço",
  "start.panel.open.title":
    "Toda a comunidade começou com ⟪uma pessoa⟫ a abrir uma porta.",
  "start.panel.open.lead":
    "Este espaço é teu para abrires. Vai passo a passo. Nada fica público até ao último passo, e podes sair e voltar sempre que quiseres.",
  "start.panel.why.thread": "Porquê",
  "start.panel.why.eyebrow": "Capítulo um · o coração",
  "start.panel.why.title": "Vamos começar pelo ⟪porquê.⟫",
  "start.panel.why.lead":
    "Antes de tudo o resto: para que serve este espaço, e para quem é? Diz isso claramente. É o que as pessoas leem primeiro.",
  "start.panel.who.thread": "Quem",
  "start.panel.who.eyebrow": "Capítulo dois · as pessoas",
  "start.panel.who.title": "Quem estás a ⟪juntar?⟫",
  "start.panel.who.lead":
    "As pessoas que este espaço quer acolher. Sê específica/o e acolhedor/a. Isto ajuda as pessoas certas a saberem que é para elas.",
  "start.panel.safety.thread": "Segurança",
  "start.panel.safety.eyebrow": "Capítulo três · a porta",
  "start.panel.safety.title": "Quem pode ⟪encontrar⟫ este espaço?",
  "start.panel.safety.lead":
    "A escolha mais importante que vais fazer. Decide quem pode ver a comunidade, e como se entra. Podes mudar isto mais tarde.",
  "start.panel.running.thread": "Gestão",
  "start.panel.running.eyebrow": "Capítulo quatro · as mãos",
  "start.panel.running.title": "Quem ⟪tem as chaves?⟫",
  "start.panel.running.lead":
    "A maioria dos espaços funciona melhor com mais do que um par de mãos. Adiciona corresponsáveis, e escolhe o que a comunidade pode fazer.",
  "start.panel.tone.thread": "Tom",
  "start.panel.tone.eyebrow": "Capítulo cinco · a cultura",
  "start.panel.tone.title": "Define ⟪o tom.⟫",
  "start.panel.tone.lead":
    "Todo o espaço tem uma cultura. Aqui tens um pequeno pacto para começar. Mantém o que serve, acrescenta as tuas próprias palavras.",
  "start.panel.feeling.thread": "Sentir",
  "start.panel.feeling.eyebrow": "Capítulo seis · a sensação",
  "start.panel.feeling.title": "Dá-lhe ⟪uma sensação.⟫",
  "start.panel.feeling.lead":
    "Uma cor e uma frase que captam o coração do lugar. São pequenos toques, mas são o que faz parecer um lugar de verdade.",
  "start.panel.people.thread": "Pessoas",
  "start.panel.people.eyebrow": "Capítulo sete · os primeiros",
  "start.panel.people.title": "Não abras para ⟪uma sala vazia.⟫",
  "start.panel.people.lead":
    "Um espaço sente-se vivo quando já há alguém lá. Convida algumas pessoas que adorarias ver à porta no primeiro dia.",
  "start.panel.confirm.thread": "Confirmar",
  "start.panel.confirm.eyebrow": "O último passo",
  "start.panel.confirm.title": "Pronte para ⟪abrir as portas?⟫",
  "start.panel.confirm.lead":
    "Aqui está o espaço todo, num relance. Nada aqui é definitivo. Podes mudar tudo depois de entrares.",

  // ── Capítulo 0 — Abertura ──────────────────────────────────────────────────
  "start.opening.reassure":
    "<strong>Nada do que fazes aqui é público até ao último passo.</strong> Tem o teu tempo, salta o que não tens a certeza, e muda de ideias sempre que quiseres. Fundar uma comunidade é uma coisa grande e generosa. Não há uma forma errada de começar.",
  "start.opening.signed":
    "Vais ser a sua primeira pessoa responsável, <strong>{name}</strong>.",

  // ── Capítulo 1 — Porquê ────────────────────────────────────────────────────
  "start.why.nameLabel": "Dá um nome à tua comunidade",
  "start.why.namePlaceholder": "ex.: Nadadoras Sáficas de Domingo",
  "start.why.collisionHead": "Já há alguns espaços parecidos com este:",
  "start.why.purposeLabel": "Para que é?",
  "start.why.purposePlaceholder":
    "Diz claramente: o que acontece aqui, e porque é que importa.",
  "start.why.purposeHint":
    "Isto é a primeira coisa que as pessoas leem. Uma ou duas frases calorosas chegam bem.",
  "start.why.kindLabel": "Que tipo de espaço é?",
  "start.why.tagsLabel": "Etiquetas",
  "start.why.tagsHint":
    "Escolhe até {count}, aparecem no cartão da tua comunidade e são pesquisáveis no Descobrir. Já pré-selecionámos algumas com base na categoria; adiciona ou remove à vontade.",

  // ── Capítulo 2 — Quem ──────────────────────────────────────────────────────
  "start.who.label": "Para quem é este espaço?",
  "start.who.placeholder":
    "ex.: Pessoas trans e não-binárias que querem nadar juntas, todos os níveis, sem pressão para seres rápide.",
  "start.who.hint":
    "Sê específica/o e acolhedor/a. Nomear para <em>quem</em> é ajuda as pessoas certas a saberem que pertencem aqui.",

  // ── Capítulo 3 — Segurança ─────────────────────────────────────────────────
  "start.safety.lead":
    "Este é o que vale a pena parar para pensar. Molda quem se sente seguro aqui. <strong>Podes mudar isto mais tarde</strong>, mas vale a pena aproximares-te da escolha certa agora.",
  "start.safety.safestFlag": "Mais seguro",
  "start.safety.findLabel": "Encontrar",
  "start.safety.joinLabel": "Entrar",
  "start.safety.privateReassure":
    "As comunidades privadas nunca aparecem em Descobrir, na pesquisa, ou nas sugestões de pessoas. Só quem já está dentro consegue ver quem mais está lá.",
  "start.safety.rosterHeading": "Lista de pessoas",
  "start.safety.rosterToggleTitle":
    "<strong>Mostrar a lista de pessoas às pessoas</strong>",
  "start.safety.rosterToggleBody":
    "Quando desligado, as pessoas podem estar aqui sem que o nome delas apareça às outras.",

  // ── Opções de nível de acesso (assistente) ────────────────────────────────
  "start.access.public.name": "Aberta a todas as pessoas",
  "start.access.public.find":
    "Qualquer pessoa na QueerPulse a encontra em Descobrir.",
  "start.access.public.join": "Entram de imediato e já estão dentro.",
  "start.access.public.note":
    "Ótimo para clubes sociais, desporto, e tudo o que cresce de boca em boca.",
  "start.access.request.name": "Pedido para entrar",
  "start.access.request.find":
    "Listada em Descobrir, para que as pessoas a encontrem.",
  "start.access.request.join":
    "Enviam um pedido; tu ou uma pessoa corresponsável decide deixá-las entrar.",
  "start.access.request.note":
    "Uma porta suave. Boa opção quando queres dizer olá antes de alguém entrar.",
  "start.access.invite.name": "Só com convite",
  "start.access.invite.find":
    "Listada, mas a porta precisa de um código ou de um link de convite.",
  "start.access.invite.join": "Só quem convidaste consegue entrar.",
  "start.access.invite.note":
    "Para círculos mais fechados que ainda assim querem ser visíveis.",
  "start.access.private.name": "Privada e não listada",
  "start.access.private.find":
    "Completamente escondida de Descobrir. As pessoas partilham-na de pessoa a pessoa.",
  "start.access.private.join":
    "Só com convite, e ninguém de fora sabe que existe.",
  "start.access.private.note":
    "Para espaços em que ser encontrade é, em si, um risco: grupos de coming-out, sobreviventes, pessoas ainda não assumidas.",

  // ── Capítulo 4 — Gestão ────────────────────────────────────────────────────
  "start.running.stewardsHeading": "Pessoas responsáveis",
  "start.running.stewardsSub":
    "As pessoas corresponsáveis podem dar as boas-vindas a quem chega, manter as conversas vivas, e substituir-te quando não podes. Quem escolheres recebe um convite para ser corresponsável contigo e entra assim que aceitar. Podes adicioná-las ou mudá-las a qualquer momento.",
  "start.running.ownerTag": "Tu · responsável",
  "start.running.coStewardTag": "Corresponsável",
  "start.running.removeAria": "Remover {name}",
  "start.running.addCta": "Adicionar corresponsável",
  "start.running.addStewardModal.eyebrow": "Adicionar corresponsável",
  "start.running.addStewardModal.title": "Escolhe alguém a quem estás ligada",
  "start.running.addStewardModal.sub":
    "As pessoas corresponsáveis só podem ser membros a quem já estás ligada. Pesquisa nas tuas ligações abaixo.",
  "start.running.addStewardModal.searchLabel": "Pesquisar nas tuas ligações",
  "start.running.addStewardModal.loadMore": "Mostrar mais ligações",
  "start.running.addStewardModal.searchPlaceholder":
    "Pesquisa por nome ou @slug…",
  "start.running.addStewardModal.empty":
    "Podes adicionar pessoas corresponsáveis assim que estiveres ligada a outros membros. Vai a Ligações para aumentar o teu círculo primeiro.",
  "start.running.insideHeading": "O que está incluído",
  "start.running.insideSub":
    "Ativa o que fizer sentido. Podes sempre adicionar mais depois de estares em funcionamento.",
  "start.running.alwaysOn": "Sempre ativo",
  "start.running.on": "Ativo",
  "start.running.off": "Inativo",

  // ── Opções de funcionalidades (partilhadas com a pré-visualização) ────────
  "start.feature.discussion.label": "Discussão",
  "start.feature.discussion.desc": "Um quadro partilhado para tópicos.",
  "start.feature.events.label": "Eventos",
  "start.feature.events.desc": "Convívios e um calendário.",
  "start.feature.roster.label": "Lista de pessoas",
  "start.feature.roster.desc": "Uma lista visível de quem está aqui.",

  // ── Capítulo 5 — Tom ───────────────────────────────────────────────────────
  "start.tone.covenantIntro":
    '"Aqui cuidamos umas das outras. Calor primeiro, sempre, e sem espaço para quem tornar este lugar inseguro."',
  "start.tone.addPlaceholder": "Acrescenta um valor por tuas palavras",
  "start.tone.addCta": "Adicionar",
  "start.tone.wrongHeading": "Quando algo corre mal",
  "start.tone.wrongSub":
    "Não vais ter de improvisar. Toda a comunidade começa com a mesma escala gentil. Podes ajustá-la depois, lá dentro.",

  // ── Sugestões de regras do pacto ──────────────────────────────────────────
  "start.rulePreset.warmth":
    "Trata toda a gente com calor e respeito: sem preconceito, nunca.",
  "start.rulePreset.confidentiality":
    "O que se partilha aqui fica aqui. Sem capturas de ecrã, sem expor ninguém.",
  "start.rulePreset.consent":
    "O consentimento primeiro. Pergunta antes de fotos, marcações ou apresentações.",
  "start.rulePreset.welcome":
    "Quem chega de novo recebe boas-vindas calorosas.",

  // ── Escala de resolução de conflitos ──────────────────────────────────────
  "start.ladder.quietWord.title": "Uma palavra em privado",
  "start.ladder.quietWord.desc":
    "Uma pessoa responsável fala primeiro, em privado.",
  "start.ladder.reminder.title": "Um lembrete visível",
  "start.ladder.reminder.desc": "O pacto é relembrado ao grupo.",
  "start.ladder.pause.title": "Uma pausa ou um adeus",
  "start.ladder.pause.desc": "Dano repetido significa pausa, ou saída.",

  // ── Capítulo 6 — Sentir ────────────────────────────────────────────────────
  "start.feeling.colourLabel": "Escolhe uma cor",
  "start.tint.coral": "Coral quente",
  "start.tint.jade": "Jade calmo",
  "start.tint.plum": "Ameixa profundo",
  "start.feeling.coverLabel": "Uma imagem de capa",
  "start.feeling.coverHint":
    "Opcional: uma foto larga que recebe as pessoas no cartão da tua comunidade. Pelo menos 1200 × 600px.",
  "start.feeling.taglineLabel": "Uma frase de assinatura",
  "start.feeling.taglinePlaceholder": "Uma linha que capta a sensação do lugar",
  "start.feeling.taglineHint":
    "Curta e calorosa. Fica por baixo do nome da tua comunidade.",

  // ── Capítulo 7 — Pessoas ───────────────────────────────────────────────────
  "start.people.label": "Pessoas que adorarias ver aqui",
  "start.people.hint":
    "Vão receber um convite caloroso quando abrires: sem pressão, sem spam.",
  "start.people.empty":
    "Ainda não estás em contacto com ninguém. Assim que te ligares a pessoas, poderás convidá-las aqui.",
  "start.people.loadMore": "Mostrar mais ligações",
  "start.people.seedNote":
    "Também podes partilhar o link da tua comunidade assim que abrir. É muitas vezes assim que as primeiras dez pessoas chegam de verdade.",

  // ── Capítulo 8 — Confirmar ─────────────────────────────────────────────────
  "start.confirm.lead":
    "Aqui está o espaço todo, num relance. Nada aqui é definitivo. Podes mudar tudo depois de entrares.",
  "start.confirm.handleLabel": "O endereço da tua comunidade",
  "start.confirm.editCta": "Editar",
  "start.confirm.notSetYet": "Ainda não definido",
  "start.confirm.notChosenYet": "Ainda não escolhido",
  "start.confirm.recap.why": "Porquê",
  "start.confirm.recap.name": "Nome",
  "start.confirm.recap.for": "Para",
  "start.confirm.recap.kind": "Tipo",
  "start.confirm.recap.who": "Quem",
  "start.confirm.recap.gathering": "Reunir",
  "start.confirm.recap.safety": "Segurança",
  "start.confirm.recap.access": "Acesso",
  "start.confirm.recap.roster": "Lista",
  "start.confirm.rosterVisible": "Visível às pessoas",
  "start.confirm.rosterHidden": "Escondida",
  "start.confirm.recap.running": "Gestão",
  "start.confirm.recap.stewards": "Pessoas responsáveis",
  "start.confirm.stewardsValue":
    "{count} convidadas (tu + {co} corresponsáveis)",
  "start.confirm.handleTaken":
    "Esse endereço já está ocupado. Experimenta outro.",
  "start.confirm.recap.inside": "Incluído",
  "start.confirm.recap.toneFeeling": "Tom e sentir",
  "start.confirm.recap.sharedValues": "Valores partilhados",
  "start.confirm.sharedValuesCount": "{count} combinados",
  "start.confirm.recap.tagline": "Frase de assinatura",
  "start.confirm.recap.firstPeople": "Primeiras pessoas",
  "start.confirm.recap.inviting": "A convidar",
  "start.confirm.invitingCount": "{count} logo no primeiro dia",
  "start.confirm.costNote":
    "<strong>Fundar uma comunidade é grátis, e sempre vai ser.</strong> A QueerPulse nunca cobra para juntares a tua gente.",
  "start.confirm.consentText":
    "<strong>Vou cuidar deste espaço com atenção.</strong> Percebo que sou responsável por o manter seguro e acolhedor, e que as diretrizes da comunidade QueerPulse também se aplicam aqui.",

  // ── Coluna de pré-visualização ao vivo ─────────────────────────────────────
  "start.preview.liveLabel": "Pré-visualização ao vivo",
  "start.preview.emptyBody":
    "A tua comunidade toma forma aqui à medida que avanças.",
  "start.preview.purposePlaceholder": "Para que é este espaço?",
  "start.preview.insideLabel": "O que está incluído",
  "start.preview.foundingMembers": "Pessoas fundadoras",
  "start.preview.footNote": "Nada é público ainda. Só tu consegues ver isto.",
  "start.preview.handleFallback": "a-tua-comunidade",

  // ── Opções de categoria (chips + distintivos do assistente) ───────────────
  "start.category.social.label": "Social",
  "start.category.social.badge": "Clube social",
  "start.category.arts.label": "Artes e cultura",
  "start.category.arts.badge": "Coletivo de artes",
  "start.category.activism.label": "Ativismo",
  "start.category.activism.badge": "Grupo de ativismo",
  "start.category.support.label": "Apoio",
  "start.category.support.badge": "Círculo de apoio",
  "start.category.sports.label": "Desporto e movimento",
  "start.category.sports.badge": "Equipa desportiva",
  "start.category.professional.label": "Profissional",
  "start.category.professional.badge": "Rede profissional",

  // ── Painel de sucesso (StartCommunitySuccess) ─────────────────────────────
  "start.success.title": "As tuas portas estão",
  "start.success.em": "abertas.",
  "start.success.closeLabel": "Entrar",
  "start.success.liveYours":
    "<strong>{name}</strong> está no ar e é tua para cuidares.",
  "start.success.invitesOnWay_one": "{count} convite caloroso a caminho.",
  "start.success.invitesOnWay_other": "{count} convites calorosos a caminho.",
  "start.success.inviteWheneverReady":
    "Convida pessoas quando estiveres pronte. Sem pressa.",
  "start.success.postFirstHello":
    "Publica um primeiro olá para que ninguém entre numa sala vazia.",
  "start.success.backToHub": "Voltar ao teu hub",
  "start.success.startAnother": "Começar outra",
  "start.success.body":
    "Abriste algo real hoje. {name} já tem uma casa na QueerPulse, uma porta para a tua gente atravessar. Vai dizer o primeiro olá.",

  // ── Notificações (StartCommunityPage) ─────────────────────────────────────
  "start.toast.createError":
    "Não foi possível abrir a tua comunidade. Tenta novamente.",
  "start.toast.created": "{name} está no ar. Bem-vinde, responsável",

  // ── Texto composto no adaptador (api/communities.adapters.ts, useAllCommunities.ts) ──
  "common.count.members_one": "{count} pessoa",
  "common.count.members_other": "{count} pessoas",
  "common.count.membersOnly": "Só para pessoas da comunidade",
  "detail.founded": "Fundada em {date}",
  "detail.foundedRecently": "Fundada recentemente",
  "detail.foundedJustNow": "Fundada agora mesmo",
  "detail.cadenceDefault": "A encontrar o seu ritmo",
  "detail.nextEvent.soonChip": "em breve",
  "detail.nextEvent.tbaTitle": "Próximo convívio a anunciar",
  "detail.nextEvent.checkEventsTab": "Vê o separador de eventos",
  "detail.nextEvent.openToMembers": "Aberto às pessoas da comunidade",
  "detail.nextEvent.firstTitle": "Primeiro convívio, a anunciar",
  "detail.nextEvent.onceFewPeople": "Assim que houver algumas pessoas",
  "detail.nextEvent.openToAllMembers":
    "Aberto a todas as pessoas da comunidade",
  "detail.topicThread.welcomeTitle": "Bem-vinde a {name}",
  "detail.topicThread.recently": "recentemente",
  "detail.topicThread.justNow": "agora mesmo",
  "detail.topicThread.welcomeSayHello": "Bem-vinde a {name}. Diz olá",
  "detail.topicThread.beginningPost":
    "Isto é o início de {name}. Apresenta-te e diz-nos o que te trouxe até aqui.",
  "detail.organiser.founder": "Pessoa fundadora",
  "detail.organiser.justOpened": "Acabou de abrir {name}. {blurb}",
  "detail.about.whoForLine": "Para quem é: {whoFor}",

  // ── Editar comunidade (EditCommunityModal) ────────────────────────────────
  "edit.cta": "Editar comunidade",
  "edit.eyebrow": "Definições da comunidade",
  "edit.title": "Editar a tua comunidade",
  "edit.save": "Guardar alterações",
  "edit.saving": "A guardar…",
  "edit.cancel": "Cancelar",
  "edit.field.name": "Nome",
  "edit.field.tagline": "Frase de assinatura",
  "edit.field.cover": "Imagem de capa",
  "edit.field.coverHint":
    "Uma foto larga mostrada no cartão da tua comunidade. Pelo menos 1200 × 600px.",
  "edit.field.type": "Que tipo de espaço",
  "edit.field.whoFor": "Para quem é",
  "edit.field.purpose": "Para que serve",
  "edit.field.access": "Quem a pode encontrar",
  "edit.field.rosterVisible": "Mostrar a lista de pessoas às pessoas",
  "edit.ownerOnlyHint": "Só quem é dona da comunidade pode mudar isto.",
  "edit.field.features": "O que há por dentro",
  "edit.field.rules": "Valores partilhados",
  "edit.field.tags": "Etiquetas",
  "edit.field.tagsHint":
    "Escolhe até {count}, aparecem no cartão da tua comunidade e são pesquisáveis no Descobrir.",
  "tagPicker.overlapHint":
    "Estas etiquetas costumam sobrepor-se, escolhe a que encaixa melhor.",
  "edit.suggestTag.trigger":
    "Não encontras a etiqueta que precisas? Sugere uma",
  "edit.suggestTag.title": "Sugerir uma etiqueta",
  "edit.suggestTag.sub":
    "Vamos analisar e podemos adicioná-la à lista selecionada.",
  "edit.suggestTag.labelField": "Nome da etiqueta",
  "edit.suggestTag.labelPlaceholder": "ex.: Família Escolhida",
  "edit.suggestTag.noteField": "Nota (opcional)",
  "edit.suggestTag.notePlaceholder":
    "Porque é que esta etiqueta ajudaria a tua comunidade?",
  "edit.suggestTag.cancel": "Cancelar",
  "edit.suggestTag.submit": "Enviar sugestão",
  "edit.suggestTag.submitting": "A enviar…",
  "edit.suggestTag.successToast": "Obrigado, vamos analisar essa etiqueta.",
  "edit.suggestTag.errorToast":
    "Não foi possível enviar a tua sugestão. Tenta novamente.",
  "edit.rules.add": "Adicionar",
  "edit.rules.addPlaceholder": "Adiciona um valor partilhado…",
  "edit.rules.remove": "Remover regra",
  "edit.toast.saved": "Alterações guardadas",
  "edit.toast.error": "Não foi possível guardar as alterações. Tenta de novo.",
  "edit.preview.title": "O teu cartão",
  "edit.preview.hint":
    "É assim que a tua comunidade aparece no Descobrir e nos perfis das pessoas. Atualiza-se enquanto escreves.",
  "edit.preview.namePlaceholder": "A tua comunidade",
  "edit.preview.taglinePlaceholder": "A tua frase de assinatura aparece aqui.",

  // ── Descobrir: filtro de etiquetas ────────────────────────────────────────
  "discover.filter.tagsTitle": "Etiquetas",
  "discover.filter.tagsAriaLabel": "Filtrar comunidades por etiqueta",
  "discover.filter.tagsSearchPlaceholder": "Pesquisar etiquetas",
  "discover.filter.tagsNoMatch": "Nenhuma etiqueta corresponde a “{query}”.",

  // ── Vocabulário de etiquetas curadas (COMMUNITY_TAGS, communityTags.data.ts) ──
  // Mostradas como pastilhas em cada cartão de comunidade e como as opções do
  // seletor no modal de edição / filtro do Descobrir. Os slugs são um
  // vocabulário fixo e partilhado com o backend — ver o comentário em
  // communityTags.data.ts antes de mexer nesta lista.
  "tag.trans-nonbinary": "Trans & Não-Binárie",
  "tag.sapphic-wlw": "Sáfica / MQM",
  "tag.gay-men": "Homens Gays",
  "tag.bisexual-pan": "Bissexual & Pan",
  "tag.asexual-aromantic": "Assexual & Aromântique",
  "tag.two-spirit": "Two-Spirit",
  "tag.intersex": "Intersexo",
  "tag.bipoc-led": "Liderança BIPOC",
  "tag.disability-chronic-illness": "Deficiência & Doença Crónica",
  "tag.neurodivergent": "Neurodivergente",
  "tag.deaf-hard-of-hearing": "Surdez & Baixa Audição",
  "tag.elders-50-plus": "Pessoas Idosas (50+)",
  "tag.youth-18-24": "Jovens (18-24)",
  "tag.parents-family": "Pais & Família",
  "tag.polyamory-enm": "Poliamor & Não-Monogamia",
  "tag.leather-kink": "Couro & Kink",
  "tag.bear-cub": "Ursos & Cubs",
  "tag.drag-performance": "Drag & Performance",
  "tag.beginner-friendly": "Para Iniciantes",
  "tag.in-person-meetups": "Encontros Presenciais",
  "tag.virtual-online": "Virtual/Online",
  "tag.local-city-based": "Local/Na Cidade",
  "tag.peer-support": "Apoio entre Pares",
  "tag.discussion-group": "Grupo de Discussão",
  "tag.book-club": "Clube do Livro",
  "tag.study-group": "Grupo de Estudo",
  "tag.game-night": "Noite de Jogos",
  "tag.sober-substance-free": "Sóbrio & Livre de Substâncias",
  "tag.twelve-step-recovery": "12 Passos & Recuperação",
  "tag.creative-collective": "Coletivo Criativo",
  "tag.mentorship": "Mentoria",
  "tag.mental-health": "Saúde Mental",
  "tag.coming-out-support": "Apoio para Sair do Armário",
  "tag.health-wellness": "Saúde & Bem-Estar",
  "tag.career-networking": "Carreira & Networking",
  "tag.housing-roommates": "Habitação & Colegas de Casa",
  "tag.legal-immigration": "Jurídico & Imigração",
  "tag.faith-spirituality": "Fé & Espiritualidade",
  "tag.sports-fitness": "Desporto & Fitness",
  "tag.outdoors-hiking": "Ar Livre & Caminhadas",
  "tag.music": "Música",
  "tag.film-tv": "Cinema & TV",
  "tag.tech-gaming": "Tecnologia & Jogos",
  "tag.fashion-style": "Moda & Estilo",
  "tag.food-cooking": "Comida & Culinária",
  "tag.arts-crafts": "Artes & Artesanato",
  "tag.activism-mutual-aid": "Ativismo & Ajuda Mútua",
  "tag.politics-advocacy": "Política & Defesa de Direitos",
  "tag.nightlife-events": "Vida Noturna & Eventos",
  "tag.hiv-wellness": "HIV+ & Bem-Estar",
  "tag.trans-health-medical": "Saúde Trans & Cuidados Médicos",
  "tag.sex-worker-allies": "Aliados de Profissionais do Sexo",
  "tag.accessibility-first": "Acessibilidade em Primeiro Lugar",
};
