import type { Catalog } from "../../types";

/**
 * Pessoas — pt-PT inclusivo. Mesmas chaves que `en/members.ts`.
 *
 * Âmbito: apenas chrome da plataforma. Nomes, biografias, pronomes,
 * competências/etiquetas autodescritas e o vocabulário autodeclarado dos
 * filtros do diretório (profissões, disciplinas, identidades, bairros,
 * idiomas) ficam em inglês nos dados fictícios — em modo live tudo isso
 * chega pela API como palavras de outra pessoa ou os seus próprios dados de
 * perfil estruturados, nunca traduzidos. O domínio de reconhecimento/
 * gamificação (nomes de emblemas, nomes de níveis, texto de vantagens) é
 * igualmente conteúdo: é obtido inteiro via `useRecognition()` em modo live.
 * Ver `docs/i18n/extraction-brief.md` §1.
 */
export const members: Catalog = {
  // ── Cartão do diretório (MemberCardBody) ───────────────────────────────────
  "card.you": "Tu",
  "card.vouchCount_one": "{count} aval",
  "card.vouchCount_other": "{count} avais",
  "card.mutualsCount_one": "{count} contacto em comum",
  "card.mutualsCount_other": "{count} contactos em comum",

  // ── Mensagens de erro do carregamento de imagens (api/uploadProcessing.ts, api/useUploadImage.ts) ──
  "upload.error.unsupportedType":
    "Esse tipo de imagem não é suportado. Usa um ficheiro JPEG, PNG, WebP ou GIF.",
  "upload.error.tooLarge":
    "Essa imagem é demasiado grande — mantém-na abaixo de {maxLabel}.",
  "upload.error.decodeFailed":
    "Não conseguimos ler essa imagem. Tenta um ficheiro diferente.",
  "upload.error.tooSmall":
    "Essa imagem é demasiado pequena — precisa de ter pelo menos {minWidth} × {minHeight}px.",
  "upload.error.retry": "Não conseguimos carregar essa imagem. Tenta novamente.",

  // ── AvatarEditor ───────────────────────────────────────────────────────────
  "avatar.error.generic": "Não conseguimos adicionar essa fotografia. Tenta novamente.",
  "avatar.uploading": "A carregar… {percent}%",
  "avatar.change": "Mudar fotografia",
  "avatar.add": "Adicionar fotografia",
  "avatar.remove": "Remover fotografia",

  // ── WorkItemEditor ─────────────────────────────────────────────────────────
  "workItem.error.generic": "Não conseguimos adicionar essa imagem. Tenta novamente.",
  "workItem.imagePlaceholder": "Trabalho",
  "workItem.uploading": "A carregar…",
  "workItem.change": "Mudar",
  "workItem.add": "Adicionar imagem",
  "workItem.removeImage": "Remover imagem",
  "workItem.categoryPlaceholder": "Categoria (ex.: Identidade)",
  "workItem.categoryLabel": "Categoria do trabalho",
  "workItem.titlePlaceholder": "Título",
  "workItem.titleLabel": "Título do trabalho",
  "workItem.yearPlaceholder": "Ano",
  "workItem.yearLabel": "Ano do trabalho",
  "workItem.remove": "Remover",

  // ── Estados da página de perfil (ProfilePage) ──────────────────────────────
  "profile.loading": "A carregar o perfil…",
  "profile.blocked.title": "Este perfil não está disponível",
  "profile.blocked.description":
    "Bloqueaste esta pessoa, por isso o perfil dela está escondido. Podes desbloqueá-la a partir das tuas ligações a qualquer momento.",
  "profile.blocked.manageAction": "Gerir pessoas bloqueadas",
  "profile.goBack": "← Voltar atrás",
  "profile.notFound.title": "Este perfil não está aqui",
  "profile.notFound.description":
    "Pode ter sido definido como privado, a pessoa pode ter saído, ou este link pode estar desatualizado. Não foi nada que tenhas feito.",
  "profile.notFound.backAction": "Voltar a Pessoas",
  "profile.backToRoom": "← Voltar à sala",
  "profile.previewBanner":
    "Estás a pré-visualizar o teu perfil como <strong>visitante</strong>.",
  "profile.exitPreview": "Sair da pré-visualização",

  // ── Cabeçalho do perfil (ProfileSections) ──────────────────────────────────
  "profile.hero.verifiedBadge": "Pessoa verificada",
  "profile.hero.curatorLink": "● Curadoria do Cinema — ver perfil de programação →",
  "profile.hero.memberSince": "Nesta comunidade desde {since}",
  "profile.hero.location": "{hood}, Lisboa",
  "profile.hero.editCta": "Editar perfil",
  "profile.hero.previewCta": "Ver como visitante",
  "profile.hero.requestIntroCta": "Pedir uma apresentação",
  "profile.hero.sayHelloCta": "Dizer olá",
  "profile.hero.vouchedFor": "Avalizaste {first}",
  "profile.hero.withdrawVouchCta": "Retirar aval",
  "profile.hero.vouchForCta": "Avalizar {first}",
  "profile.hero.recognitionTitle": "Reconhecimento",
  "profile.hero.recognitionSubtitle": "O teu nível, emblemas e vantagens",
  "profile.hero.levelLabel": "Nível {number}",
  "profile.hero.badgesTitle": "Emblemas e nível",
  "profile.hero.badgesDesc": "{earned} conquistados · {discover} por descobrir",
  "profile.hero.badgesArrow": "Ver emblemas e nível →",
  "profile.hero.perksAvailable": "{count} disponíveis",
  "profile.hero.perksTitle": "Vantagens",
  "profile.hero.perksDesc":
    "Bónus que o teu nível desbloqueia — confirmação de presença antecipada, o Trusted Lounge e muito mais.",
  "profile.hero.perksArrow": "Resgatar as tuas vantagens →",

  // ── Secções de conteúdo do perfil (ProfileContentSections, WorkEditor) ────
  "content.now.title": "Agora",
  "content.now.subtitle": "O que ocupa {first} agora",
  "content.now.openLabel": "Disponível para",
  "content.work.title": "Trabalho em destaque",
  "content.work.subtitle": "Só alguns trabalhos, não um portefólio completo",
  "content.board.title": "No quadro de trocas",
  "content.board.subtitle": "O que {first} anda a pedir e a oferecer agora",
  "content.board.looking": "Precisa de",
  "content.board.offering": "Oferece",
  "content.skills.title": "Competências e ofertas",
  "content.skills.subtitle":
    "Aquilo em que {first} pode ajudar — e trocar no quadro de trocas",
  "content.skills.barterCta": "Ver o quadro de trocas completo →",
  "content.groups.title": "Grupos e círculos",
  "content.groups.subtitle": "Onde {first} aparece na comunidade",
  "content.shapings.title": "O que me formou",
  "content.shapings.subtitle": "Não são interesses. São textos, filmes e momentos marcantes.",
  "content.activity.title": "Atividade recente",
  "content.activity.subtitle": "Momentos públicos por toda a plataforma",
  "content.related.title": "Também nesta sala",
  "content.related.subtitle": "Pessoas próximas em ofício ou bairro",

  // ── Etiquetas de "o que me formou" + visibilidade (profileSections.data) ──
  "shaping.film": "Um filme",
  "shaping.book": "Um livro ou texto",
  "shaping.song": "Uma música ou álbum",
  "shaping.moment": "Um momento",
  "visibility.open": "Aberto a novos contactos",
  "visibility.network": "Só para a rede",
  "visibility.private": "Privado",
  "visibility.hint.open": "Qualquer pessoa na QueerPulse pode dizer olá.",
  "visibility.hint.network": "Só pessoas com quem já tens uma ligação.",
  "visibility.hint.private": "É preciso pedir uma apresentação primeiro.",

  // ── Campos de edição de perfil (EditableProfileHero, profileEditControls) ──
  "profileEdit.field.statusVisibility": "Estado e visibilidade",
  "profileEdit.field.name": "Nome",
  "profileEdit.field.firstNameLabel": "Nome próprio",
  "profileEdit.field.firstPlaceholder": "Nome",
  "profileEdit.field.lastNameLabel": "Apelido",
  "profileEdit.field.lastPlaceholder": "Apelido",
  "profileEdit.field.pronouns": "Pronomes",
  "profileEdit.field.neighbourhood": "Bairro",
  "profileEdit.field.neighbourhoodPlaceholder": "ex.: Arroios",
  "profileEdit.field.bio": "Biografia",
  "profileEdit.field.bioHelp":
    "A versão mais longa, na tua página de perfil. Se deixares a biografia curta em branco, o teu cartão no diretório usa o início desta.",
  "profileEdit.field.tags": "Etiquetas",
  "profileEdit.field.addSkillPlaceholder": "Adicionar uma competência…",
  "profileEdit.field.links": "Links",
  "profileEdit.customPronounPlaceholder": "personalizado…",
  "profileEdit.customPronounsLabel": "Pronomes personalizados",
  "profileEdit.addTagPlaceholder": "Adicionar uma etiqueta…",
  "profileEdit.addTagLabel": "Adicionar uma etiqueta",
  "profileEdit.removeTagLabel": "Remover {tag}",
  "profileEdit.visibilityGroupLabel": "Visibilidade do perfil",

  // ── Campo de biografia curta (ProfileShortBioField) ────────────────────────
  "profileEdit.shortBio.label": "Biografia curta",
  "profileEdit.shortBio.help":
    "A linha que as pessoas leem no diretório de Pessoas, antes de abrirem o teu perfil.",
  "profileEdit.shortBio.placeholder":
    "Uma ou duas linhas sobre quem és e o que procuras.",
  "profileEdit.shortBio.counter": "{length} / {max}",
  "profileEdit.shortBio.overLimit": "— o teu cartão mostra só as primeiras duas linhas",

  // ── Barra de edição (ProfileEditBar) ────────────────────────────────────────
  "profileEdit.bar.unsaved": "Estás a editar o teu perfil — alterações por guardar",
  "profileEdit.bar.discard": "Descartar",
  "profileEdit.bar.saving": "A guardar…",
  "profileEdit.bar.tryAgain": "Tentar novamente",
  "profileEdit.bar.save": "Guardar perfil",
  "profileEdit.bar.savedBanner": "Guardado. <strong>O teu perfil está atualizado.</strong>",

  // ── Links sociais (SocialLinksRow, SocialLinksEditor) ──────────────────────
  "social.addLinks": "Adicionar links",
  "social.editLinksLabel": "Editar os teus links",
  "social.editLinks": "Editar",
  "social.platformLabel": "Plataforma do link",
  "social.linkFor": "Link de {platform}",
  "social.removeLinkFor": "Remover link de {platform}",
  "social.addLink": "Adicionar um link",
  "social.other": "Outro link",

  // ── Editor de trabalho (WorkEditor) ─────────────────────────────────────────
  "profileEdit.work.add": "Adicionar trabalho",

  // ── Linha de avais no cabeçalho (HeroVouchRow) ─────────────────────────────
  "hero.vouch.namesPlusYou": "{names}, e tu",
  "hero.vouch.youOnly": "tu",
  "hero.vouch.by": "Quem avaliza: <b>{names}</b>.",
  "hero.vouch.onlyNumberMatters": "É o único número que importa aqui.",
  "hero.vouch.emptySelf":
    "Ainda sem avais. Vão aparecer aqui à medida que quem te conhece juntar o nome — o único número que importa.",
  "hero.vouch.emptyOther":
    "Ainda ninguém avalizou {first}. Se conheces esta pessoa, o teu pode ser o primeiro.",

  // ── Página de perfil público (PublicProfilePage) ────────────────────────────
  "publicProfile.hereForTitle": "Para que <em>estou aqui</em>",
  "publicProfile.visiblePublicly": "Visível publicamente",
  "publicProfile.writing.heading": "Escrita <em>pública</em>",
  "publicProfile.writing.meta_one": "{count} peça · Revista QueerPulse",
  "publicProfile.writing.meta_other": "{count} peças · Revista QueerPulse",
  "publicProfile.hosting.heading": "Organização <em>pública</em>",
  "publicProfile.hosting.meta": "Eventos abertos a qualquer pessoa",
  "publicProfile.locked.postsHeading": "Publicações e <em>mensagens</em>",
  "publicProfile.membersOnly": "Só para pessoas da comunidade",
  "publicProfile.locked.postsTitle":
    "Publicações, respostas e mensagens diretas são <em>só para a comunidade.</em>",
  "publicProfile.locked.postsBody":
    "A QueerPulse mantém o dia a dia da comunidade atrás de um início de sessão, para proteger as pessoas. Junta-te e o feed de {first} desbloqueia-se de imediato — incluindo a possibilidade de enviares mensagem a {first}.",
  "publicProfile.requestInviteArrow": "Pedir um convite →",
  "publicProfile.locked.connectionsHeading": "Ligações",
  "publicProfile.locked.connectionsTitle": "Quem {first} conhece, <em>em privado.</em>",
  "publicProfile.locked.connectionsBody":
    "Para proteger as redes das pessoas da comunidade, não mostramos listas de ligações publicamente. Entra para veres os teus contactos em comum com {first}.",
  "publicProfile.bottomCta.title": "Queres <em>ver tudo?</em>",
  "publicProfile.bottomCta.body":
    "A QueerPulse funciona por convite — {firstName} pode avalizar-te se já se conheceram pessoalmente. Ou pede um convite diretamente a nós.",
  "publicProfile.bottomCta.vouchCta": "Pedir a {firstName} para avalizar",

  // ── Secções de perfil público (PublicProfileSections) ──────────────────────
  "publicProfile.preview.ownerLabel":
    "Pré-visualização do teu perfil público · é assim que quem não é da comunidade te vê",
  "publicProfile.pill.live": "Ativo",
  "publicProfile.pill.off": "Inativo",
  "publicProfile.preview.backToProfile": "← Voltar ao teu perfil",
  "publicProfile.preview.guestLabel":
    "Não tens sessão iniciada · a ver a <b>versão pública</b> deste perfil",
  "publicProfile.head.eyebrow": "Perfil público · @{slug}",
  "publicProfile.head.location": "<b>{hood}</b>, Lisboa",
  "publicProfile.head.memberSince": "Nesta comunidade desde <b>{since}</b>",
  "publicProfile.head.vouchedFor": "<b>Com aval</b> de {count} pessoas",
  "publicProfile.head.requestInviteCta": "Pedir um convite para ligar",
  "publicProfile.head.ctaNote":
    "O perfil completo de {firstName}, publicações e acesso a mensagens diretas abrem assim que te tornares parte da comunidade.",

  // ── Controlo do perfil público (PublicProfileControl) ──────────────────────
  "publicProfile.control.locked.eyebrow": "Perfil público · bloqueado",
  "publicProfile.control.locked.title":
    "Um perfil público é algo em que <em>cresces aos poucos.</em>",
  "publicProfile.control.locked.lede":
    "Os perfis públicos são para quem ajuda a levar o lado público da QueerPulse — quem escreve, organiza encontros ou lidera projetos. É aqui que estás:",
  "publicProfile.control.locked.progress":
    "{met} de {total} cumpridos — continua a aparecer e isto desbloqueia-se sozinho.",
  "publicProfile.control.unlocked.eyebrow": "Perfil público · desbloqueado",
  "publicProfile.control.unlocked.title":
    "Já podes partilhar um <em>perfil público.</em>",
  "publicProfile.control.unlocked.lede":
    "Um perfil público permite que quem ainda não é da comunidade encontre a tua escrita, os teus encontros e uma forma de te contactar — sem abrir o resto da comunidade.",
  "publicProfile.control.switchLabel": "Mostrar um perfil público",
  "publicProfile.control.statusOn":
    "Ativo — qualquer pessoa pode ver o teu perfil público.",
  "publicProfile.control.statusOff": "Inativo — só quem é da comunidade te encontra.",
  "publicProfile.control.viewCta": "Ver perfil público",
  "publicProfile.control.toast.hidden": "O teu perfil público está escondido",
  "publicProfile.control.toast.live": "O teu perfil público está ativo",

  // ── Critérios de elegibilidade pública (publicFigure.ts) ───────────────────
  "publicProfile.eligibility.contributes.label": "Contribui publicamente",
  "publicProfile.eligibility.contributes.hint":
    "Publica textos ou organiza um encontro aberto que o público possa ver.",
  "publicProfile.eligibility.verified.hint":
    "Confirma a tua identidade para que se saiba que és mesmo tu.",
  "publicProfile.eligibility.established.label": "Um ano na QueerPulse",
  "publicProfile.eligibility.established.hint":
    "Os perfis públicos abrem depois do teu primeiro ano aqui.",
  "publicProfile.eligibility.trusted.label": "Aval de 2 ou mais pessoas",
  "publicProfile.eligibility.trusted.hint":
    "Duas ou mais pessoas a avalizarem-te desbloqueia isto.",

  // ── Etiquetas de estatísticas do perfil público (currentUserPublic.data) ──
  "publicProfile.stat.poemsPublished": "Poemas publicados",
  "publicProfile.stat.eventsHosted": "Encontros organizados",
  "publicProfile.stat.yearsOnPlatform": "Ano na QueerPulse",
  "publicProfile.stat.membersReached": "Pessoas alcançadas",

  // ── Pesquisa global (SearchPage) ────────────────────────────────────────────
  "search.type.member": "Pessoas",
  "search.type.gathering": "Encontros",
  "search.type.community": "Comunidades",
  "search.type.board": "Quadro",
  "search.type.topic": "Tópicos",
  "search.type.page": "Páginas",
  "search.type.all": "Tudo",
  "search.comingSoon.badge": "Brevemente",
  "search.comingSoon.title": "A pesquisa está <em>quase a chegar.</em>",
  "search.comingSoon.body":
    "Estamos a ligar a pesquisa em direto à comunidade — pessoas, encontros, comunidades e publicações no quadro, tudo num só lugar. Por agora está em repouso. Ativa <b>{toggleName}</b> para explorares a demonstração.",
  "search.recentSearches": "Pesquisas recentes",
  "search.browseTopics": "Explorar tópicos",
  "search.upcomingGatherings": "Próximos encontros",
  "search.jumpTo": "Ir para <b>{name}</b>",
  "search.resultCount_one": `<b>{count}</b> resultado para "<b>{query}</b>"`,
  "search.resultCount_other": `<b>{count}</b> resultados para "<b>{query}</b>"`,
  "search.empty.title": "Nada encontrado",
  "search.empty.body":
    "Tenta outra palavra — nome de uma pessoa, bairro, competência, ou tipo de encontro.",
  "search.hero.label": "Pesquisar",
  "search.hero.title": "Encontra quem ou o que quiseres <em>na comunidade.</em>",
  "search.hero.placeholder": "Pessoas, encontros, comunidades, publicações no quadro…",

  // ── Filtro avançado do diretório (MemberDirectoryFilterPage) ───────────────
  "directory.eyebrow": "Pessoas · filtro avançado",
  "directory.findPrefix": "Encontra",
  "directory.memberCountSuffix_one": "pessoa,",
  "directory.memberCountSuffix_other": "pessoas,",
  "directory.findSuffix": "exatamente.",
  "directory.lead":
    "Filtra pelo que oferecem, onde vivem, ao que estão <b>disponíveis</b>. Os dados funcionam nos dois sentidos — as pessoas aparecem aqui porque optaram por ser encontráveis por estas razões.",
  "directory.toast.filtersCleared": "Filtros limpos",
  "directory.showingPrefix": "A mostrar",
  "directory.showingOf": "de",
  "directory.memberCountLabel_one": "pessoa",
  "directory.memberCountLabel_other": "pessoas",
  "directory.sortLabel": "Ordenar",
  "directory.sort.recentlyActive": "Ativas recentemente",
  "directory.sort.recentlyJoined": "Juntaram-se recentemente",
  "directory.sort.closestMutuals": "Mais contactos em comum",
  "directory.sort.aToZ": "De A a Z",
  "directory.sort.mostVouched": "Mais avalizadas",
  "directory.removeChipLabel": "Remover {label}",
  "directory.emptyFiltered.title": "Nada corresponde aos teus filtros",
  "directory.emptyFiltered.description":
    "Não há pessoas que cumpram tudo isto agora. Alivia um ou dois filtros e vai aparecer mais gente.",
  "directory.clearFiltersCta": "Limpar filtros",
  "directory.emptyAll.title": "Ainda não há pessoas aqui",
  "directory.emptyAll.description":
    "Este diretório ainda está a encher-se. À medida que as pessoas se juntam à QueerPulse e optam por ser encontráveis, vão aparecer aqui — volta a verificar em breve.",
  "directory.loadingMore": "A carregar…",
  "directory.loadMoreCta": "Carregar mais pessoas",

  // ── Barra lateral de filtros (MemberFilterCards) ────────────────────────────
  "directory.filter.openToTitle": "Ao que estão disponíveis",
  "directory.filter.hoodTitle": "Onde vivem",
  "directory.filter.identityTitle": "Identidade · autodeclarada",
  "directory.filter.ageTitle": "Tempo na comunidade",
  "directory.filter.fromPlaceholder": "De",
  "directory.filter.yearsPlaceholder": "Anos",
  "directory.filter.ageNote":
    'Anos na QueerPulse. <em>Pessoas mais recentes aparecem com um emblema de "primeiro ano" por definição.</em>',
  "directory.filter.languagesTitle": "Idiomas",
  "directory.clearAllFiltersCta": "Limpar todos os filtros",
  "directory.appliedCount_one": "{count} aplicado",
  "directory.appliedCount_other": "{count} aplicados",

  // ── Filtro de profissão (FilterProfessions) ─────────────────────────────────
  "directory.filter.whatTheyDoTitle": "O que fazem",
  "directory.filter.searchPlaceholder": "Pesquisar uma área ou profissão…",
  "directory.filter.searchAriaLabel": "Pesquisar áreas e profissões",
  "directory.filter.noFieldMatch": 'Nenhuma área corresponde a "{query}".',
  "directory.filter.professionTitle": "Profissão",
  "directory.filter.noProfessionMatch":
    'Nenhuma profissão corresponde a "{query}".',
  "directory.filter.matchingSearch":
    "A corresponder à tua pesquisa em todas as áreas.",
  "directory.filter.showingWithinField_one":
    "A mostrar profissões dentro da área selecionada.",
  "directory.filter.showingWithinField_other":
    "A mostrar profissões dentro das áreas selecionadas.",
  "directory.filter.pickField":
    "Escolhe uma área acima, ou pesquisa para encontrar qualquer profissão.",

  // ── Pré-visualização do cartão (DirectoryCardPreview) ──────────────────────
  "directory.preview.caption": "Como o teu cartão aparece no diretório",
  "directory.preview.borrowedNote":
    "Ainda não há nada aqui, por isso o teu cartão usa o início da tua biografia. Escreve uma biografia curta e ele passa a usar essa.",

  // ── Paleta de comandos (CommandPalette) ─────────────────────────────────────
  "commandPalette.ariaLabel": "Pesquisar na QueerPulse",
  "commandPalette.placeholder": "Pesquisar pessoas, encontros, comunidades…",
  "commandPalette.comingSoonBody":
    "A pesquisa em direto está a ser ligada à comunidade. Por agora está em repouso — ativa <em>{toggleName}</em> para explorares a demonstração.",
  "commandPalette.noMatches": "Sem resultados — tenta outra palavra.",
  "commandPalette.seeAllResults": "Ver todos os resultados para “<b>{query}</b>”",
  "commandPalette.openFullSearch": "Abrir pesquisa completa",

  // ── Página de aval para convite (VouchPage) ─────────────────────────────────
  "vouch.page.toast": "O teu aval para {name} já está a caminho do conselho.",
  "vouch.page.success.title": "Isso é <em>um verdadeiro acolhimento.</em>",
  "vouch.page.success.body":
    "O teu aval para {name} já chegou ao conselho da comunidade. Vão saber que já havia alguém a torcer por esta pessoa antes mesmo de ela entrar.",
  "vouch.page.success.connectionsCta": "Voltar às ligações",
  "vouch.page.success.browseCta": "Explorar pessoas",
  "vouch.page.eyebrow": "Aval",
  "vouch.page.title": "Diz-nos que <em>as conheces.</em>",
  "vouch.page.noteLabel": "Adiciona uma nota curta (opcional)",
  "vouch.page.notePlaceholder":
    "Como conheces {name}, e o que deve saber o conselho?",
  "vouch.page.submitCta": "Enviar o meu aval →",
  "vouch.page.skipCta": "Agora não",

  // ── Explicação de porquê avalizar (vouch.data.ts MEANS) ─────────────────────
  "vouch.means.know.title": "Conheces esta pessoa, a sério",
  "vouch.means.know.body":
    "Um aval diz que já conheceste esta pessoa e confias nela em espaços da comunidade. Isso tem peso aqui.",
  "vouch.means.safe.title": "Mantém o espaço seguro",
  "vouch.means.safe.body":
    "A QueerPulse funciona por convite e aval por uma razão. Pessoas a avalizarem pessoas é como nos mantemos numa comunidade pequena e de confiança.",
  "vouch.means.council.title": "É visto pelo conselho",
  "vouch.means.council.body":
    "A tua nota vai para o conselho da comunidade junto com o pedido desta pessoa — não é publicada.",

  // ── Opções de relação para avalizar uma pessoa (vouchMember.data.ts) ──────
  "vouch.relationship.collaborated": "Já colaborámos",
  "vouch.relationship.friends": "Somos amigues",
  "vouch.relationship.group": "Mesmo coletivo ou grupo",
  "vouch.relationship.metThroughQueerPulse": "Conhecemo-nos na QueerPulse",
  "vouch.relationship.neighbours": "Somos vizinhes",

  // ── Modal de avalizar uma pessoa (VouchMemberModal, VouchMemberModalParts) ──
  "vouch.modal.ariaLabel": "Avalizar {first}",
  "vouch.modal.close": "Fechar",
  "vouch.modal.success.title": "Aí está <em>{first}</em>, com aval.",
  "vouch.modal.success.body":
    "A tua cara acabou de entrar no círculo de avais de <b>{first}</b> — é assim que a confiança circula aqui. Pessoa a pessoa, nome a nome.",
  "vouch.modal.success.doneCta": "Concluído",
  "vouch.modal.form.eyebrow": "Adicionar o teu aval",
  "vouch.modal.form.title": "Apoia <em>{first}</em>",
  "vouch.modal.form.sub":
    "Um aval é tu, publicamente, a dizeres que conheces {first} e confias nesta pessoa em espaços da comunidade. Tem peso aqui — a QueerPulse funciona por convite e aval, e o teu nome fica no perfil desta pessoa ao lado de quem mais a apoiou.",
  "vouch.modal.form.relationshipLabel": "Como conheces {first}?",
  "vouch.modal.form.endorseLabel": "Em que podes garantir que esta pessoa é boa?",
  "vouch.modal.form.optional": "opcional",
  "vouch.modal.form.noteLabel": "A tua nota",
  "vouch.modal.form.notePlaceholder":
    "Como conheces {first}, e o que deve saber o resto da comunidade?",
  "vouch.modal.form.charsToSubmit_one": "Falta {count} carácter para poderes enviar",
  "vouch.modal.form.charsToSubmit_other":
    "Faltam {count} carateres para poderes enviar",
  "vouch.modal.form.charsCount_one": "{count} carácter",
  "vouch.modal.form.charsCount_other": "{count} carateres",
  "vouch.modal.form.cancel": "Cancelar",
  "vouch.modal.form.sending": "A enviar o teu aval…",

  // ── Vocabulário de separadores/ordenação/estado dos rascunhos (drafts.data.tsx) ──
  "drafts.tabs.all": "Tudo",
  "drafts.tabs.posts": "Publicações e respostas",
  "drafts.tabs.articles": "Artigos e propostas",
  "drafts.tabs.applications": "Candidaturas",
  "drafts.tabs.grants": "Candidaturas a bolsas",
  "drafts.sort.edited": "Editado recentemente",
  "drafts.sort.deadline": "Prazo mais próximo",
  "drafts.sort.progress": "Menos completo",
  "drafts.sort.title": "Alfabética",
  "drafts.status.draft": "Rascunho",
  "drafts.status.ready": "Pronto",
  "drafts.status.stale": "Parado",
  "drafts.status.atrisk": "Em risco",

  // ── Botões de ação da linha de rascunho (drafts.data.tsx / DraftRow) ────────
  "drafts.action.resume": "Continuar",
  "drafts.action.delete": "Eliminar",
  "drafts.action.send": "Enviar",
  "drafts.action.review": "Rever",
  "drafts.action.keep30": "Manter mais 30 dias",
  "drafts.action.deleteNow": "Eliminar agora",
  "drafts.action.sendReply": "Enviar resposta",
  "drafts.action.edit": "Editar",

  // ── Menu "Começar algo" (drafts.data.tsx CREATE_ITEMS) ──────────────────────
  "drafts.create.newPost.label": "Nova publicação",
  "drafts.create.newPost.sub": "Partilhar numa comunidade",
  "drafts.create.pitchStory.label": "Propor um artigo",
  "drafts.create.pitchStory.sub": "Para a Revista QueerPulse",
  "drafts.create.startApplication.label": "Começar uma candidatura",
  "drafts.create.startApplication.sub": "A partir de uma vaga guardada",

  // ── Meta de substituição "mantido" (drafts.data.tsx KEPT_META) ─────────────
  "drafts.keptMeta.resetNote": "Mantido · reinicia o temporizador de 90 dias",

  // ── Cabeçalho dos rascunhos (DraftsHeader) ──────────────────────────────────
  "drafts.header.eyebrow": "Rascunhos · só tu vês",
  "drafts.header.title": "Coisas que <em>começaste.</em>",
  "drafts.header.lead":
    "Publicações, artigos, candidaturas e propostas que ainda não enviaste. <em>Guardado automaticamente a cada 8 segundos.</em> Rascunhos com mais de 90 dias recebem um lembrete simpático, depois outro, e depois desaparecem em silêncio.",
  "drafts.header.startCta": "Começar algo",

  // ── Controlos de pesquisa + ordenação (DraftsControls) ──────────────────────
  "drafts.controls.searchPlaceholder": "Pesquisar nos teus rascunhos…",
  "drafts.controls.searchAriaLabel": "Pesquisar rascunhos",
  "drafts.controls.clearSearchLabel": "Limpar pesquisa",
  "drafts.controls.sortLabel": "Ordenar",
  "drafts.controls.sortAriaLabel": "Ordenar rascunhos",

  // ── Chrome da página de rascunhos (DraftsPage) ──────────────────────────────
  "drafts.tabsAriaLabel": "Tipos de rascunho",
  "drafts.selectAllAriaLabel": "Selecionar todos os rascunhos visíveis",
  "drafts.selectAll": "Selecionar tudo",
  "drafts.visibleCount_one": "{visible} de {count} rascunho",
  "drafts.visibleCount_other": "{visible} de {count} rascunhos",
  "drafts.empty.defaultTitle": "Ainda não há nada aqui.",
  "drafts.empty.defaultText":
    "Sem rascunhos nesta categoria. Muda de separador, ou começa algo novo.",
  "drafts.empty.noMatchTitle": "Sem resultados.",
  "drafts.empty.noMatchText":
    'Nada nos teus rascunhos corresponde a "{query}". Tenta outra palavra, ou limpa a pesquisa.',
  "drafts.empty.allCaughtUpTitle": "Tudo em dia.",
  "drafts.empty.allCaughtUpText":
    "Não há rascunhos por aí — nada a meio caminho à tua espera. Quando começares algo e te afastares, fica guardado aqui.",
  "drafts.empty.startCta": "Começar algo novo",
  "drafts.toast.deleted_one": "Rascunho eliminado",
  "drafts.toast.deleted_other": "{count} rascunhos eliminados",
  "drafts.toast.undo": "Desfazer",
  "drafts.toast.kept": "Rascunho mantido — mais 30 dias",
  "drafts.dangerNote":
    "<b>Sobre a regra dos 90 dias:</b> rascunhos que não tocas há 87+ dias recebem um lembrete por email, e são eliminados automaticamente ao dia 90. Podes prolongar qualquer rascunho 30 dias de cada vez. <em>Isto existe para manter a tua lista de rascunhos honesta — não para perderes trabalho.</em>",

  // ── Linha de rascunho (DraftRow) ────────────────────────────────────────────
  "drafts.row.selectAriaLabel": "Selecionar rascunho",

  // ── Barra de seleção em massa (DraftsBulkBar) ───────────────────────────────
  "drafts.bulkBar.ariaLabel": "Ações em massa",
  "drafts.bulkBar.selectedCount_one": "<b>{count}</b> selecionado",
  "drafts.bulkBar.selectedCount_other": "<b>{count}</b> selecionados",
  "drafts.bulkBar.deleteCta": "Eliminar selecionados",
  "drafts.bulkBar.cancel": "Cancelar",

  // ── Vocabulário de privacidade das coleções (collections.data.tsx) ─────────
  "collections.privacy.private": "Privada",
  "collections.privacy.shared": "Partilhada",
  "collections.privacy.public": "Pública",
  "collections.privacy.sharedWithCount_one": "Partilhada com {count}",
  "collections.privacy.sharedWithCount_other": "Partilhada com {count}",

  // ── Chrome da página de coleções (CollectionsPage) ──────────────────────────
  "collections.header.eyebrow": "Coleções · pastas para guardados",
  "collections.header.title": "Coisas a que voltas <em>sempre.</em>",
  "collections.header.lead":
    "Itens guardados, agrupados como fizer sentido para ti. As pastas podem ser privadas (padrão), partilhadas com pessoas específicas, ou públicas.",
  "collections.header.newCta": "+ Nova coleção",
  "collections.newCard.title": "Nova coleção",
  "collections.newCard.subtitle": "Agrupa guardados pelo que significam",
  "collections.recentSaves.heading": "Guardado recentemente · ainda sem coleção",
  "collections.recentSaves.unfiledCount": "+ {count} por arquivar",
  "collections.recentSaves.addCta": "+ Adicionar a uma coleção →",
  "collections.toast.created": "Coleção criada",
  "collections.newCollection.defaultMeta": "Acabada de criar — começa a adicionar guardados",
  "collections.updatedJustNow": "Atualizado agora mesmo",

  // ── Modais de coleções (CollectionsModals) ──────────────────────────────────
  "collections.modal.defaultDialogLabel": "Diálogo",
  "collections.modal.close": "Fechar",
  "collections.modal.newCollection.dialogLabel": "Nova coleção",
  "collections.modal.newCollection.eyebrow": "Nova coleção",
  "collections.modal.newCollection.title": "O que estás a <em>reunir?</em>",
  "collections.modal.newCollection.nameLabel": "Nome da coleção",
  "collections.modal.newCollection.namePlaceholder":
    "ex.: Recomendações de Lisboa, Levar à terapia…",
  "collections.modal.newCollection.visibilityLabel": "Quem pode ver",
  "collections.modal.newCollection.cancel": "← Cancelar",
  "collections.modal.newCollection.submit": "Criar coleção →",
  "collections.modal.privacyOption.private": "Privada",
  "collections.modal.privacyOption.shared": "Partilhada com pessoas da comunidade",
  "collections.modal.privacyOption.public": "Pública",
  "collections.modal.view.dialogLabel": "Ver coleção",
  "collections.modal.view.emptyText":
    "Ainda não há nada aqui. Adiciona guardados a partir da lista abaixo da grelha.",
  "collections.modal.view.close": "Fechar",
  "collections.modal.add.dialogLabel": "Adicionar a uma coleção",
  "collections.modal.add.eyebrow": "Adicionar a uma coleção",
  "collections.modal.add.title": "Onde deve ficar isto?",
  "collections.modal.add.cancel": "← Cancelar",
  "collections.modal.add.success.dialogLabel": "Adicionado à coleção",
  "collections.modal.add.success.title": "Adicionado à <em>tua coleção.</em>",
  "collections.modal.add.success.body":
    "Guardado em <b>{name}</b>. Vais encontrá-lo lá sempre que voltares.",
  "collections.modal.add.success.done": "Concluído",

  // ── Tipos de cartão guardados por ti (savedByYou.data.ts) ───────────────────
  "savedByYou.kind.magazine.label": "Revista",
  "savedByYou.kind.magazine.cta": "Ler",
  "savedByYou.kind.film.label": "Cinema",
  "savedByYou.kind.film.cta": "Ver",
  "savedByYou.kind.job.label": "Trabalho",
  "savedByYou.kind.job.cta": "Ver vaga",
  "savedByYou.kind.event.label": "Encontro",
  "savedByYou.kind.event.cta": "Ver",
  "savedByYou.kind.post.label": "Conversa",
  "savedByYou.kind.post.cta": "Abrir conversa",
  "savedByYou.kind.group.label": "Comunidade",
  "savedByYou.kind.group.cta": "Abrir",

  // ── Chrome de guardados por ti (SavedByYou) ─────────────────────────────────
  "savedByYou.removeAriaLabel": "Remover {title} dos guardados",
  "savedByYou.removeTitle": "Remover dos guardados",
  "savedByYou.heading": "Guardado por ti · em toda a QueerPulse",
  "savedByYou.empty.title": "Ainda não guardaste nada",
  "savedByYou.empty.description":
    "Guarda artigos, filmes, vagas e publicações à medida que exploras — vão reunir-se aqui para voltares a eles e organizá-los em coleções.",
  "savedByYou.empty.browseMagazineCta": "Explorar a revista",
  "savedByYou.empty.exploreCinemaCta": "Explorar o Cinema",
  "savedByYou.count_one": "{count} guardado",
  "savedByYou.count_other": "{count} guardados",
  "savedByYou.toast.removed": "Removido dos guardados",

  // ── Os teus espaços (MyPlacesSection) ───────────────────────────────────────
  "myPlaces.status.review": "Em análise",
  "myPlaces.status.question": "Pergunta rápida",
  "myPlaces.status.live": "Ativo",
  "myPlaces.title": "Espaços que <em>giro</em>",
  "myPlaces.subtitle":
    "Anúncios que adicionaste ao diretório. Cada um é revisto pela equipa da comunidade antes de ficar ativo.",
  "myPlaces.refLabel": "Ref. · {ref}",
  "myPlaces.viewListingCta": "Ver anúncio →",
  "myPlaces.awaitingReview": "Aguarda revisão",

  // ── Leitor de QR (QrScannerPage) ─────────────────────────────────────────────
  "qrScanner.mode.safe.label": "Espaço seguro",
  "qrScanner.mode.safe.hint": "Aponta a um autocolante",
  "qrScanner.mode.event.label": "Bilhete de evento",
  "qrScanner.mode.event.hint": "Aponta ao teu bilhete",
  "qrScanner.mode.profile.label": "Perfil",
  "qrScanner.mode.profile.hint": "Aponta a um código de perfil",
  "qrScanner.closeAriaLabel": "Fechar",
  "qrScanner.title": "Ler um código <em>QueerPulse</em>",
  "qrScanner.flashAriaLabel": "Flash",
  "qrScanner.privacyNote": "A câmara fica neste aparelho · nunca enviamos as imagens",
  "qrScanner.hintSuffix":
    "Autocolantes de espaço seguro · bilhetes de encontros · códigos de partilha de perfil",
  "qrScanner.cantScan": "Não consegues ler o código?",
  "qrScanner.enterCodeCta": "Inserir código manualmente",
  "qrScanner.helpCta": "Ajuda com códigos",
  "qrScanner.scanToast": "{name} · espaço seguro verificado",
  "qrScanner.manualToast": "Código aberto · fluxo de colar",

  // ── Chrome da página de emblemas (BadgesPage, BadgesSections) ──────────────
  "badges.backToProfile": "← Voltar ao perfil",
  "badges.pageTitle": "Emblemas e <em>nível</em>",
  "badges.howToEarnXp": "Como ganhar XP →",
  "badges.earnedHeading": "Os teus <em>emblemas</em>",
  "badges.lockedHeading": "Emblemas <em>bloqueados</em>",
  "badges.lockedSub": "Ganha XP e participa em encontros para desbloquear estes.",
  "badges.hideMore": "Esconder ▴",
  "badges.showMore": "Mostrar mais {count} ▾",
  "badges.perksUnlockHeading": "O que o teu nível <em>desbloqueia</em>",
  "badges.perksUnlockSub": "Cada nível dá acesso a novas vantagens da comunidade.",
  "badges.xpToNextLevel": "{xp} / {xpMax} XP para o Nível {nextLevel} · {nextName}",

  // ── Chrome da página de vantagens (PerksPage, PerksSections) ───────────────
  "perks.page.backToBadges": "← Emblemas e nível",
  "perks.page.title": "As tuas <em>vantagens</em>",
  "perks.page.availableToRedeem_one": "{count} vantagem disponível para resgatar",
  "perks.page.availableToRedeem_other":
    "{count} vantagens disponíveis para resgatar",
  "perks.sidebar.yourLevelTitle": "O teu nível",
  "perks.sidebar.xpSummary": "{xp} / {xpMax} XP · {xpToNext} para o Nível {nextLevel}",
  "perks.sidebar.nextUnlockNote":
    "As próximas vantagens desbloqueiam no <strong>Nível {nextLevel} · {nextName}</strong> — organizar sem aprovação e mais convites por mês.",
  "perks.sidebar.seeAllBadgesCta": "Ver todos os emblemas e níveis →",
  "perks.sidebar.explainedTitle": "Vantagens explicadas",
  "perks.sidebar.suggestTitle": "Sugerir uma vantagem",
  "perks.sidebar.suggestPlaceholder": "Partilha uma ideia…",
  "perks.sidebar.sendSuggestionCta": "Enviar sugestão",
  "perks.claim.alreadyActive": "Já ativo",
  "perks.claim.active": "Ativo",
  "perks.claim.claimed": "Resgatado",
};
