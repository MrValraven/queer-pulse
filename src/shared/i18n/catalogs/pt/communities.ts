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
  // ── Categorias de comunidade partilhadas ──────────────────────────────────
  "category.all": "Todas as comunidades",
  "category.social": "Social",
  "category.arts": "Artes",
  "category.activism": "Ativismo",
  "category.support": "Apoio",
  "category.sports": "Desporto",
  "category.professional": "Profissional",
  "category.community": "Comunidade",

  // ── Diretório de descoberta (CommunitiesPage) ─────────────────────────────
  "discover.hero.eyebrow": "Diretório de Comunidades",
  "discover.hero.title": "Encontra a tua <em>gente.</em>",
  "discover.hero.lead":
    "Um diretório vivo de comunidades queer por toda a Lisboa. Clubes sociais, coletivos de artes, grupos de ativismo, equipas desportivas, círculos de apoio e redes profissionais — algo para o momento em que estás agora.",
  "discover.hero.cta": "Ir para o teu hub",
  "discover.empty.none.title": "Ainda sem comunidades",
  "discover.empty.none.description":
    "O diretório ainda está a dar os primeiros passos. Sê das primeiras pessoas a juntar a tua gente — começa uma comunidade e o resto segue-se.",
  "discover.empty.none.cta": "Começar uma comunidade",
  "discover.empty.filtered.title": "Nada corresponde aos teus filtros",
  "discover.empty.filtered.description":
    "Ainda não há comunidades nesta categoria. Volta a todas as comunidades para veres tudo por Lisboa.",
  "discover.empty.filtered.cta": "Limpar filtros",
  "discover.loadingMore": "A carregar…",
  "discover.loadMoreCta": "Carregar mais comunidades",
  "discover.outro.title": "Não encontraste o <em>espaço certo?</em>",
  "discover.outro.sub":
    "Sugere uma comunidade para o diretório, ou publica no quadro para encontrares pessoas com os mesmos interesses — e talvez comecem algo juntas.",
  "discover.outro.cta": "Ver o quadro",

  // ── Cartão de comunidade / textos do botão de entrada ─────────────────────
  "card.join.public": "Junta-te",
  "card.join.invite": "Junta-te com convite",
  "card.join.request": "Pedir para entrar",
  "card.joined": "Já és membro",
  "card.view": "Ver",
  "card.stats.active_one": "{count} pessoa ativa esta semana",
  "card.stats.active_other": "{count} pessoas ativas esta semana",
  "card.stats.posts_one": "{count} publicação",
  "card.stats.posts_other": "{count} publicações",

  // ── Hub de comunidades (CommunitiesHomePage + digest + feed + sidebar) ───
  "hub.eyebrow": "As tuas comunidades",
  "hub.welcome": "Bem-vinde de volta, <em>{name}</em>",
  "hub.sub_one":
    "Isto é o que tem estado a acontecer na tua {count} comunidade.",
  "hub.sub_other":
    "Isto é o que tem estado a acontecer nas tuas {count} comunidades.",
  "hub.discoverCta": "Descobrir comunidades",
  "hub.startCta": "Começar uma comunidade",
  "hub.empty.title": "Ainda não te juntaste a nenhuma comunidade",
  "hub.empty.description":
    "Explora por interesse e encontra o teu lugar — sem pressa.",
  "hub.digest.label": "Esta semana, em silêncio",
  "hub.digest.note":
    "Sem notificações a mais — só a semana das tuas comunidades num relance.",
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
  "hub.sidebar.yourCommunities": "As tuas comunidades",
  "hub.sidebar.discoverMore": "Descobrir mais",
  "hub.sidebar.upcoming": "A caminho nas tuas comunidades",
  "hub.sidebar.suggestions": "Comunidades que podes gostar",
  "hub.pulseCard.announcement": "Anúncio",
  "hub.pulseCard.open": "Abrir",

  // ── Pequenos elementos partilhados (tempo relativo, "agora mesmo") ───────
  "common.timeAgo": "há {time}",
  "common.justNow": "agora mesmo",

  // ── Página de detalhe da comunidade (hero + sidebar) ──────────────────────
  "detail.breadcrumb": "← Comunidades",
  "detail.join.invite": "Junta-te com convite",
  "detail.join.public": "Junta-te à comunidade",
  "detail.join.request": "Pedir para entrar",
  "detail.joined": "Já és membro",
  "detail.requested": "Pedido enviado",
  "detail.hero.andMore": "e mais {count}",
  "detail.sidebar.organiser": "Organização",
  "detail.sidebar.messageCta": "Enviar mensagem",
  "detail.sidebar.nextGathering": "Próximo convívio",
  "detail.sidebar.rsvpCta": "Confirmar presença",
  "detail.sidebar.relatedCommunities": "Comunidades relacionadas",

  // ── Tópico "boas-vindas" fixo, mostrado no fórum de todas as comunidades ──
  "detail.welcomeThread.title": "Boas-vindas às pessoas novas — apresenta-te",
  "detail.welcomeThread.post":
    "Chegaste agora a {name}? Diz olá aqui. Conta-nos o teu nome, de onde és, e o que te trouxe até aqui. Lemos todas as mensagens.",

  // ── Separadores do hub (rótulos partilhados) ──────────────────────────────
  "detail.tabs.about": "Sobre",
  "detail.tabs.members": "Pessoas",
  "detail.tabs.forum": "Fórum",
  "detail.tabs.pulse": "Pulso",
  "detail.tabs.discussion": "Discussão",
  "detail.tabs.events": "Eventos",
  "detail.tabs.modtools": "Ferramentas de moderação",

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
  "detail.discussion.startedToast": "Discussão iniciada.",

  // ── Separador Eventos (hub completo) ──────────────────────────────────────
  "detail.events.upcoming": "Próximos convívios",
  "detail.events.past": "Convívios passados",
  "detail.events.recapCta": "Ler retrospetiva",
  "detail.events.rsvpCta": "Confirmar presença",

  // ── Separador de pessoas / lista (hub completo) ───────────────────────────
  "detail.roster.searchAria": "Pesquisar pessoas",
  "detail.roster.searchPlaceholder":
    "Pesquisar pessoas por nome, papel ou bairro…",
  "detail.roster.verified": "Verificade",
  "detail.roster.alsoIn": "Também é membro de {names}",
  "detail.roster.messageCta": "Mensagem",
  "detail.roster.showingOf_one": "A mostrar {shown} de {count} pessoa",
  "detail.roster.showingOf_other": "A mostrar {shown} de {count} pessoas",

  // ── Separador de ferramentas de moderação (hub completo) ──────────────────
  "detail.modtools.joinRequests.label": "Pessoas a pedir para entrar",
  "detail.modtools.joinRequests.empty.title": "Sem pedidos à espera",
  "detail.modtools.joinRequests.empty.description":
    "Está tudo em dia — os novos pedidos aparecem aqui.",
  "detail.modtools.joinRequests.requestedAgo": "Pedido enviado há {time}",
  "detail.modtools.joinRequests.approveCta": "Aprovar",
  "detail.modtools.joinRequests.declineCta": "Recusar",
  "detail.modtools.reports.label": "Publicações denunciadas",
  "detail.modtools.reports.empty.title": "Tudo em ordem",
  "detail.modtools.reports.empty.description":
    "Nada foi assinalado — a comunidade cuida de si mesma.",
  "detail.modtools.reports.meta":
    "De {author} · denunciado por {reporter} · há {time}",
  "detail.modtools.reports.removeCta": "Remover publicação",
  "detail.modtools.reports.dismissCta": "Ignorar",
  "detail.modtools.members.label": "Pessoas",
  "detail.modtools.members.makeModCta": "Tornar mod",
  "detail.modtools.members.removeCta": "Remover da comunidade",
  "detail.modtools.members.ownerTag": "Responsável",
  "detail.modtools.toast.approved": "{name} aprovade — dá-lhe as boas-vindas.",
  "detail.modtools.toast.declined":
    "O pedido de {name} não foi aprovado desta vez.",
  "detail.modtools.toast.postRemoved":
    "Publicação removida. Já foi contactada a pessoa autora.",
  "detail.modtools.toast.reportDismissed": "Denúncia ignorada.",
  "detail.modtools.toast.promoted": "{name} é agora mod.",
  "detail.modtools.toast.removed": "{name} foi removide.",

  // ── Separador Pulso (hub completo) ────────────────────────────────────────
  "detail.pulse.joinHint":
    "Podes ler à vontade — junta-te a {name} para participar.",
  "detail.pulse.composerPlaceholder": "Partilha algo com {name}…",
  "detail.pulse.shareCta": "Partilhar",
  "detail.pulse.pinnedAnnouncement": "Anúncio fixado",
  "detail.pulse.replyLabel_one": "Ver {count} resposta",
  "detail.pulse.replyLabel_other": "Ver {count} respostas",
  "detail.pulse.replyAction": "Responder",
  "detail.pulse.replyPlaceholder": "Escreve uma resposta…",
  "detail.pulse.sharedToast": "Partilhado com a comunidade.",
  "detail.pulse.loadingMore": "A carregar…",
  "detail.pulse.loadMoreCta": "Carregar mais publicações",

  // ── Separador Sobre + Recursos (hub completo) ─────────────────────────────
  "detail.aboutResources.houseRules": "Regras da casa",
  "detail.aboutResources.resources": "Recursos",
  "detail.aboutResources.sisterCommunities": "Comunidades irmãs",
  "detail.aboutResources.sharedPeople_one": "{count} pessoa em comum",
  "detail.aboutResources.sharedPeople_other": "{count} pessoas em comum",

  // ── Distintivos: papéis, níveis de acesso, barra de reações ───────────────
  "badges.role.owner": "Responsável",
  "badges.role.mod": "Mod",
  "badges.tier.public": "Aberta a todas as pessoas",
  "badges.tier.request": "Pedido para entrar",
  "badges.tier.invite": "Só com convite",
  "badges.tier.private": "Privada",
  "badges.reaction.heart": "Adoro",
  "badges.reaction.celebrate": "Celebrar",
  "badges.reaction.support": "Apoio",
  "badges.reaction.fire": "Fogo",
  "badges.reaction.ariaLabel": "{label} — {count}",

  // ── Modal de adesão ────────────────────────────────────────────────────────
  "join.close": "Fechar",
  "join.progress": "Passo {step} de {total}",
  "join.ariaLabel": "Junta-te a {name}",
  "join.intro.eyebrow.request": "A pedir para entrar",
  "join.intro.eyebrow.invite": "A entrar com um convite",
  "join.intro.eyebrow.public": "A Junta-te",
  "join.intro.invitePlaceholder": "Introduz o teu código de convite",
  "join.intro.verifyCta": "Verificar e continuar",
  "join.intro.continueCta": "Continuar",
  "join.about.eyebrow": "Um pouco sobre ti",
  "join.about.title": "Como deve a comunidade conhecer-te?",
  "join.about.hint":
    "Opcional — um pouco de contexto ajuda as pessoas a saberem quem és.",
  "join.about.namePlaceholder": "O teu nome",
  "join.about.pronounsPlaceholder": "Pronomes, se quiseres partilhar",
  "join.about.aboutPlaceholder": "Uma frase sobre ti — o que te traz até aqui?",
  "join.involvement.eyebrow": "Quase pronto",
  "join.involvement.title": "Como gostarias de participar?",
  "join.involvement.emailPlaceholder": "O teu endereço de email",
  "join.involvement.levelLabel": "Nível de envolvimento",
  "join.involvement.sendRequestCta": "Enviar pedido",
  "join.involvement.joinCta": "Junta-te à comunidade",
  "join.involvement.updates.label": "Só quero saber das novidades",
  "join.involvement.updates.desc":
    "Só notícias e eventos — sem qualquer compromisso",
  "join.involvement.active.label": "Membro ativo",
  "join.involvement.active.desc": "Vou aos eventos e junto-me ao grupo",
  "join.involvement.organise.label": "Ajudar a organizar",
  "join.involvement.organise.desc": "Ser voluntárie para ajudar a gerir",
  "join.done.requestTitle": "O teu pedido está com a moderação",
  "join.done.welcomeTitle": "Bem-vinde a {name}",
  "join.done.requestBody":
    "Obrigade por partilhares — a moderação de <strong>{name}</strong> vai ler o teu pedido e dar-te as boas-vindas. Avisamos-te de qualquer forma.",
  "join.done.joinedBody":
    "Já fazes parte de <strong>{name}</strong>. Alguém vai entrar em contacto para te ajudar a instalar-te.",
  "join.done.doneCta": "Concluído",

  // ── Assistente Começar uma Comunidade: estrutura / barra de progresso ────
  "start.hero.back": "Voltar às tuas comunidades",
  "start.hero.eyebrow": "Comunidades · fundar um espaço",
  "start.hero.title": "Começa uma <em>comunidade.</em>",
  "start.hero.lead":
    "Um lugar para a tua gente se juntar — social, de apoio, criativo, ou algo que só tu sabes nomear. <strong>Nada fica público até estares pronte.</strong>",
  "start.next.begin": "Vamos começar →",
  "start.next.people": "A seguir: as pessoas →",
  "start.next.door": "A seguir: a porta →",
  "start.next.who": "A seguir: quem gere →",
  "start.next.tone": "A seguir: o tom →",
  "start.next.feeling": "A seguir: o sentir →",
  "start.next.first": "A seguir: os primeiros →",
  "start.next.review": "Rever e abrir →",
  "start.next.open": "Abrir as portas →",
  "start.next.fallback": "Continuar →",
  "start.opening.status": "A abrir as portas…",
  "start.cancel": "Cancelar",
  "start.back": "← Voltar",
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
    "Este espaço é teu para abrires. Vai passo a passo — nada fica público até ao último passo, e podes sair e voltar sempre que quiseres.",
  "start.panel.why.thread": "Porquê",
  "start.panel.why.eyebrow": "Capítulo um · o coração",
  "start.panel.why.title": "Vamos começar pelo ⟪porquê.⟫",
  "start.panel.why.lead":
    "Antes de tudo o resto — para que serve este espaço, e para quem é? Diz isso claramente. É o que as pessoas leem primeiro.",
  "start.panel.who.thread": "Quem",
  "start.panel.who.eyebrow": "Capítulo dois · as pessoas",
  "start.panel.who.title": "Quem estás a ⟪juntar?⟫",
  "start.panel.who.lead":
    "As pessoas que este espaço quer acolher. Sê específica/o e acolhedor/a — isto ajuda as pessoas certas a saberem que é para elas.",
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
    "Todo o espaço tem uma cultura. Aqui tens um pequeno pacto para começar — mantém o que serve, acrescenta as tuas próprias palavras.",
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
    "Aqui está o espaço todo, num relance. Nada aqui é definitivo — podes mudar tudo depois de entrares.",

  // ── Capítulo 0 — Abertura ──────────────────────────────────────────────────
  "start.opening.reassure":
    "<strong>Nada do que fazes aqui é público até ao último passo.</strong> Tem o teu tempo, salta o que não tens a certeza, e muda de ideias sempre que quiseres. Fundar uma comunidade é uma coisa grande e generosa — não há uma forma errada de começar.",
  "start.opening.signed":
    "Vais ser a sua primeira pessoa responsável, <strong>{name}</strong>.",

  // ── Capítulo 1 — Porquê ────────────────────────────────────────────────────
  "start.why.nameLabel": "Dá um nome à tua comunidade",
  "start.why.namePlaceholder": "ex.: Nadadoras Sáficas de Domingo",
  "start.why.collisionHead": "Já há alguns espaços parecidos com este —",
  "start.why.purposeLabel": "Para que é?",
  "start.why.purposePlaceholder":
    "Diz claramente — o que acontece aqui, e porque é que importa.",
  "start.why.purposeHint":
    "Isto é a primeira coisa que as pessoas leem. Uma ou duas frases calorosas chegam bem.",
  "start.why.kindLabel": "Que tipo de espaço é?",

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
    "Para espaços em que ser encontrade é, em si, um risco — grupos de coming-out, sobreviventes, pessoas ainda não assumidas.",

  // ── Capítulo 4 — Gestão ────────────────────────────────────────────────────
  "start.running.stewardsHeading": "Pessoas responsáveis",
  "start.running.stewardsSub":
    "As pessoas corresponsáveis podem dar as boas-vindas a quem chega, manter as conversas vivas, e substituir-te quando não podes. Podes adicioná-las ou mudá-las a qualquer momento.",
  "start.running.ownerTag": "Tu · responsável",
  "start.running.coStewardTag": "Corresponsável",
  "start.running.removeAria": "Remover {name}",
  "start.running.addPlaceholder":
    "Adiciona uma pessoa corresponsável pelo nome",
  "start.running.addCta": "Adicionar",
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
  "start.feature.rooms.label": "Salas",
  "start.feature.rooms.desc": "Subcanais para temas.",
  "start.feature.roster.label": "Lista de pessoas",
  "start.feature.roster.desc": "Uma lista visível de quem está aqui.",
  "start.feature.library.label": "Recursos",
  "start.feature.library.desc": "Ficheiros e links partilhados.",

  // ── Capítulo 5 — Tom ───────────────────────────────────────────────────────
  "start.tone.covenantIntro":
    '"Aqui cuidamos umas das outras. Calor primeiro, sempre — e sem espaço para quem tornar este lugar inseguro."',
  "start.tone.addPlaceholder": "Acrescenta um valor por tuas palavras",
  "start.tone.addCta": "Adicionar",
  "start.tone.wrongHeading": "Quando algo corre mal",
  "start.tone.wrongSub":
    "Não vais ter de improvisar. Toda a comunidade começa com a mesma escala gentil — podes ajustá-la depois, lá dentro.",

  // ── Sugestões de regras do pacto ──────────────────────────────────────────
  "start.rulePreset.warmth":
    "Trata toda a gente com calor e respeito — sem preconceito, nunca.",
  "start.rulePreset.confidentiality":
    "O que se partilha aqui fica aqui. Sem capturas de ecrã, sem expor ninguém.",
  "start.rulePreset.consent":
    "O consentimento primeiro. Pergunta antes de fotos, marcações ou apresentações.",
  "start.rulePreset.welcome":
    "Quem chega de novo recebe boas-vindas, não um teste.",

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
  "start.feeling.taglineLabel": "Uma frase de assinatura",
  "start.feeling.taglinePlaceholder": "Uma linha que capta a sensação do lugar",
  "start.feeling.taglineHint":
    "Curta e calorosa — fica por baixo do nome da tua comunidade.",

  // ── Capítulo 7 — Pessoas ───────────────────────────────────────────────────
  "start.people.label": "Pessoas que adorarias ver aqui",
  "start.people.hint":
    "Vão receber um convite caloroso quando abrires — sem pressão, sem spam.",
  "start.people.seedNote":
    "Também podes partilhar o link da tua comunidade assim que abrir — é muitas vezes assim que as primeiras dez pessoas chegam de verdade.",

  // ── Capítulo 8 — Confirmar ─────────────────────────────────────────────────
  "start.confirm.lead":
    "Aqui está o espaço todo, num relance. Nada aqui é definitivo — podes mudar tudo depois de entrares.",
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
  "start.confirm.stewardsValue": "{count} (tu + {co} corresponsáveis)",
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
  "start.preview.footNote": "Nada é público ainda — só tu consegues ver isto.",
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
  "start.category.fallbackBadge": "Comunidade",

  // ── Painel de sucesso (StartCommunitySuccess) ─────────────────────────────
  "start.success.title": "As tuas portas estão",
  "start.success.em": "abertas.",
  "start.success.closeLabel": "Entrar →",
  "start.success.liveYours":
    "<strong>{name}</strong> está no ar e é tua para cuidares.",
  "start.success.invitesOnWay_one": "{count} convite caloroso a caminho.",
  "start.success.invitesOnWay_other": "{count} convites calorosos a caminho.",
  "start.success.inviteWheneverReady":
    "Convida pessoas quando estiveres pronte — sem pressa.",
  "start.success.postFirstHello":
    "Publica um primeiro olá para que ninguém entre numa sala vazia.",
  "start.success.backToHub": "Voltar ao teu hub",
  "start.success.startAnother": "Começar outra",
  "start.success.body":
    "Abriste algo real hoje. {name} já tem uma casa na QueerPulse — uma porta para a tua gente atravessar. Vai dizer o primeiro olá.",

  // ── Notificações (StartCommunityPage) ─────────────────────────────────────
  "start.toast.createError":
    "Não foi possível abrir a tua comunidade — tenta novamente.",
  "start.toast.created": "{name} está no ar — bem-vinde, responsável",

  // ── Texto composto no adaptador (api/communities.adapters.ts, useAllCommunities.ts) ──
  "common.count.members_one": "{count} pessoa",
  "common.count.members_other": "{count} pessoas",
  "common.count.membersOnly": "Só para pessoas da comunidade",
  "detail.founded": "Fundada em {year}",
  "detail.foundedRecently": "Fundada recentemente",
  "detail.foundedJustNow": "Fundada agora mesmo",
  "detail.cadenceDefault": "A encontrar o seu ritmo",
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
  "detail.topicThread.welcomeSayHello": "Bem-vinde a {name} — diz olá",
  "detail.topicThread.beginningPost":
    "Isto é o início de {name}. Apresenta-te e diz-nos o que te trouxe até aqui.",
  "detail.organiser.founder": "Pessoa fundadora",
};
