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
  "card.vouchCount_one": "{count} voto de confiança",
  "card.vouchCount_other": "{count} votos de confiança",
  "card.mutualsCount_one": "{count} contacto em comum",
  "card.mutualsCount_other": "{count} contactos em comum",

  // ── Faixa "ativo recentemente" (ActivityBandPill) ─────────────────────────
  "activityBand.thisMonth": "Ativo este mês",
  "activityBand.last3Months": "Ativo nos últimos 3 meses",
  "activityBand.dormant": "Sem atividade recente",

  // ── Mensagens de erro do carregamento de imagens (api/uploadProcessing.ts, api/useUploadImage.ts) ──
  "upload.error.unsupportedType":
    "Esse tipo de imagem não é suportado. Usa um ficheiro JPEG, PNG, WebP ou GIF.",
  "upload.error.tooLarge":
    "Essa imagem é demasiado grande. Mantém-na abaixo de {maxLabel}.",
  "upload.error.decodeFailed":
    "Não conseguimos ler essa imagem. Tenta um ficheiro diferente.",
  "upload.error.tooSmall":
    "Essa imagem é demasiado pequena (mínimo de {minWidth} × {minHeight}px). Capturas de ecrã e fotos guardadas de apps de mensagens costumam vir reduzidas. Tenta carregar a foto original da tua galeria.",
  "upload.error.stripFailed":
    "Não conseguimos processar essa imagem em segurança, por isso não a carregámos. Tenta um ficheiro diferente.",
  "upload.error.retry":
    "Não conseguimos carregar essa imagem. Tenta novamente.",

  // ── AvatarEditor ───────────────────────────────────────────────────────────
  "avatar.error.generic":
    "Não conseguimos adicionar essa fotografia. Tenta novamente.",
  "avatar.uploading": "A carregar… {percent}%",
  "avatar.change": "Mudar fotografia",
  "avatar.add": "Adicionar fotografia",
  "avatar.remove": "Remover fotografia",
  "avatar.useGoogle": "Usar fotografia da Google",
  "avatar.googleAdded": "Adicionámos a tua fotografia da Google.",

  // ── AvatarEditor · modal de escolha de fotografia (PhotoPickerModal) ───────
  "avatar.picker.title": "Escolher uma foto",
  "avatar.picker.upload": "Carregar do dispositivo",
  "avatar.picker.retry": "Tentar novamente",
  "avatar.picker.yourPhotos": "As tuas fotos",
  "avatar.picker.empty":
    "Ainda não carregaste fotos. Carrega uma do teu dispositivo ou usa a tua foto da Google.",
  "avatar.picker.loadError":
    "Não foi possível carregar as tuas fotos. Tenta novamente.",
  "avatar.picker.inUse": "Em uso",
  "avatar.picker.useThis": "Usar esta foto",
  "avatar.picker.delete": "Eliminar foto",
  "avatar.picker.deleteConfirmTitle": "Eliminar esta foto?",
  "avatar.picker.deleteConfirmBody":
    "Isto remove o carregamento definitivamente. Não é possível anular.",
  "avatar.picker.deleteConfirmBodyInUse":
    "Esta foto está a ser usada como a tua {usedAs}. Ao eliminá-la, também é removida daí. Não é possível anular.",
  "avatar.picker.deleteConfirmCta": "Eliminar foto",
  "avatar.picker.deleted": "Foto eliminada.",
  "avatar.picker.deleteError":
    "Não foi possível eliminar essa foto. Tenta novamente.",

  // ── WorkItemEditor ─────────────────────────────────────────────────────────
  "workItem.error.generic":
    "Não conseguimos adicionar essa imagem. Tenta novamente.",
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
  "workItem.linkPlaceholder": "Link (opcional, ex.: https://bandcamp.com/…)",
  "workItem.linkLabel": "Link do trabalho",
  "workItem.secondLinkPlaceholder":
    "Segundo link (opcional, ex.: https://bandcamp.com/…)",
  "workItem.secondLinkLabel": "Segundo link do trabalho",
  "workItem.linkedNote":
    "Está ligado a uma página da QueerPulse. Não editável aqui.",
  "workItem.addSecondLink": "Adicionar um segundo link",
  "workItem.removeSecondLink": "Remover o segundo link",
  "workItem.remove": "Remover",

  // ── Estados da página de perfil (ProfilePage) ──────────────────────────────
  "profile.loading": "A carregar o perfil…",
  "profile.blocked.title": "Este perfil não está disponível",
  "profile.blocked.description":
    "Bloqueaste esta pessoa, por isso o perfil dela está escondido. Podes desbloqueá-la a partir das tuas ligações a qualquer momento.",
  "profile.blocked.manageAction": "Gerir pessoas bloqueadas",
  "profile.goBack": "Voltar atrás",
  "profile.notFound.title": "Este perfil não está aqui",
  "profile.notFound.description":
    "Pode ter sido definido como privado, a pessoa pode ter saído, ou este link pode estar desatualizado. Não foi nada que tenhas feito.",
  "profile.notFound.backAction": "Voltar a Pessoas",
  "profile.loadError.title": "Não conseguimos carregar o teu perfil",
  "profile.loadError.description":
    "Algo correu mal ao obter o teu perfil. Verifica a tua ligação e tenta novamente.",
  "profile.loadError.retryAction": "Tentar novamente",
  "profile.backToRoom": "Voltar à sala",
  // Rótulos do link de regresso para as outras páginas de onde um perfil pode
  // ser aberto (ver profileBackTarget.ts); "generic" cobre o que não tem mapa.
  "profile.backTo.generic": "Voltar",
  "profile.backTo.home": "Voltar à página inicial",
  "profile.backTo.communities": "Voltar às comunidades",
  "profile.backTo.community": "Voltar à comunidade",
  "profile.backTo.forum": "Voltar ao fórum",
  "profile.backTo.thread": "Voltar à conversa",
  "profile.backTo.gatherings": "Voltar aos convívios",
  "profile.backTo.gathering": "Voltar ao convívio",
  "profile.backTo.events": "Voltar aos eventos",
  "profile.backTo.event": "Voltar ao evento",
  "profile.backTo.feed": "Voltar ao feed",
  "profile.backTo.messages": "Voltar às mensagens",
  "profile.backTo.search": "Voltar à pesquisa",
  "profile.backTo.directory": "Voltar ao diretório",
  "profile.backTo.connections": "Voltar às tuas ligações",
  "profile.backTo.calendar": "Voltar ao calendário",
  "profile.backTo.changemakers": "Voltar aos Changemakers",
  "profile.previewBanner":
    "Estás a pré-visualizar o teu perfil como <strong>visitante</strong>.",
  "profile.exitPreview": "Sair da pré-visualização",

  // ── Cabeçalho do perfil (ProfileSections) ──────────────────────────────────
  "profile.hero.verifiedBadge": "Pessoa verificada",
  "profile.hero.viewPhotoAria": "Ver foto de {name}",
  "profile.hero.curatorLink": "Curadoria do Cinema: ver perfil de programação",
  "profile.hero.memberSince": "Nesta comunidade desde {since}",
  "profile.hero.location": "{hood}, Lisboa",
  "profile.hero.editCta": "Editar perfil",
  "profile.hero.previewCta": "Ver como visitante",
  "profile.hero.sayHelloCta": "Dizer olá",
  "profile.hero.vouchedFor": "Deste um voto de confiança a {first}",
  "profile.hero.vouchedShort": "Com voto de confiança",
  "profile.hero.withdrawVouchCta": "Retirar voto de confiança",
  "profile.hero.vouchForCta": "Dar voto de confiança a {first}",
  "profile.hero.levelLabel": "Nível {number}",
  "profile.hero.badgesChip": "{earned} / {total} emblemas",
  "profile.hero.perksChip": "{count} vantagens",
  "profile.hero.perksTitle": "Vantagens",
  "profile.hero.hearPronunciation": "Ouvir como se diz o nome de {name}",
  "profile.hero.notHereFor.label": "Não estou aqui para",
  "profile.hero.writtenBy.en": "{name} escreveu isto em inglês",
  "profile.hero.writtenBy.pt": "{name} escreveu isto em português",

  // ── Cartão de contactos em comum (ProfileMutualsCard) ───────────────────────
  "profile.mutuals.title": "Contactos em comum",
  "profile.mutuals.one": "Ambos conhecem <strong>{nameA}</strong>.",
  "profile.mutuals.two":
    "Ambos conhecem <strong>{nameA}</strong> e <strong>{nameB}</strong>.",
  "profile.mutuals.many":
    "Ambos conhecem <strong>{nameA}</strong>, <strong>{nameB}</strong> e mais {othersCount}.",

  // ── Modal "Dizer olá" (ProfileHelloModal) ───────────────────────────────────
  "profile.hello.title": "Dizer olá a {first}",
  "profile.hello.intro":
    "Escolhe o que te trouxe até aqui, ou começa já a escrever.",
  "profile.hello.reasonsLabel": "O que te trouxe até aqui",
  "profile.hello.draftTemplate":
    'Olá {first}, vi isto no teu perfil, "{reason}", e quis dizer olá. ',
  "profile.hello.draftLabel": "A tua mensagem",
  "profile.hello.draftPlaceholder": "Diz o que tens em mente.",
  "profile.hello.cancel": "Cancelar",
  "profile.hello.send": "Enviar",
  "profile.hello.sentToast": "Enviado. {first} costuma responder em breve.",
  "profile.hello.errorToast":
    "Não foi possível abrir a mensagem. Tenta novamente.",

  // ── Barra lateral do perfil (ProfileRail, Task 3) ───────────────────────────
  "profile.railLabel": "Resumo do perfil de {name}",
  "profile.nav.title": "Secções",
  "profile.nav.label": "Ir para uma secção",
  "profile.nav.openTo": "Disponível para",
  "profile.nav.board": "No quadro de trocas",
  "profile.nav.work": "Trabalho em destaque",
  "profile.nav.subprofiles": "Também trabalha como",
  "profile.nav.communities": "Comunidades",
  "profile.nav.places": "Lugares",
  "profile.nav.skills": "Competências e ofertas",
  "profile.nav.groups": "Grupos e círculos",
  "profile.nav.shapings": "O que me formou",
  "profile.nav.related": "Também nesta sala",

  // ── Sinais de confiança + explicação (ProfileTrustSignals, ProfileTrustModal — Task 4) ──
  "profile.trust.verified": "Verificado",
  "profile.trust.staff": "Equipa",
  "profile.trust.vouchCount_one": "{count} voto de confiança",
  "profile.trust.vouchCount_other": "{count} votos de confiança",
  "profile.trust.modalTitle": "Sinais de confiança",
  "profile.trust.modalIntro":
    "Um guia rápido sobre o que vais ver no perfil de alguém.",
  "profile.trust.verifiedDescription":
    "A identidade desta pessoa foi confirmada pela QueerPulse.",
  "profile.trust.staffDescription":
    "Esta pessoa faz parte da equipa QueerPulse.",
  "profile.trust.vouchesTerm": "Votos de confiança",
  "profile.trust.vouchesDescription":
    "Outros membros que deram, pessoalmente, um voto de confiança à entrada desta pessoa na comunidade.",

  // ── Menu de definições do perfil (ProfileSettingsMenu) ──────────────────────
  "profile.rail.settingsMenuAria": "Definições do perfil",
  "profile.rail.whoSeesWhat": "Quem vê o quê",
  "profile.rail.bringMeBack": "Voltar a ficar visível",
  "profile.rail.hideMe24h": "Ficar oculto 24h",
  "profile.rail.yourData": "Os teus dados",
  "profile.rail.showQr": "Mostrar código QR",

  // ── Modal do código QR do perfil (ProfileQrModal) ────────────────────────────
  "profile.qr.title": "O código QR do teu perfil",
  "profile.qr.intro": "Digitaliza para abrir o teu perfil.",
  "profile.qr.save": "Guardar nas fotos",
  "profile.qr.doneCta": "Concluído",
  "profile.qr.mobileTriggerAria": "Mostrar o código QR do teu perfil",

  // ── Linha de estatísticas + separadores de conteúdo (ProfileStatsRow, ProfileTabBar) ──
  "profile.stats.vouches": "Votos de confiança",
  "profile.stats.communities": "Comunidades",
  "profile.stats.personas": "Também como",
  "profile.tabs.about": "Sobre",
  "profile.tabs.work": "Trabalho",
  "profile.tabs.community": "Comunidade",
  "profile.tabs.activity": "Atividade",
  "profile.tabs.ariaLabel": "Secções do perfil",

  // ── Secção de comunidades (ProfileCommunities) ──────────────────────────────
  "profile.communities.title": "Comunidades",
  "profile.communities.subtitleSelf":
    "Comunidades que estás a destacar no teu perfil.",
  "profile.communities.subtitlePublic": "Comunidades de que {first} faz parte.",
  "profile.communities.role.owner": "Fundador",
  "profile.communities.role.coOwner": "Cotitular",
  "profile.communities.role.mod": "Moderador",
  "profile.communities.role.member": "Membro",
  "profile.communities.empty.title": "Destaca as tuas comunidades",
  "profile.communities.empty.description":
    "Mostra as comunidades que tens ou de que fazes parte. Escolhe quais destacar em Editar perfil.",
  "profile.communities.empty.cta": "Escolher comunidades",

  // ── Secções de conteúdo do perfil (ProfileContentSections, WorkEditor) ────
  "content.now.title": "Agora",
  "content.now.subtitle": "O que ocupa {first} agora",
  "content.now.openLabel": "Disponível para",
  "content.work.title": "Trabalho em destaque",
  "content.work.subtitle": "Só alguns trabalhos, escolhidos a dedo",
  "content.work.viewLink": "Ver",
  "content.work.visitLink": "Visitar",
  "content.board.title": "No quadro de trocas",
  "content.board.subtitle": "O que {first} anda a pedir e a oferecer agora",
  "content.board.looking": "Precisa de",
  "content.board.offering": "Oferece",

  // ── Linha do quadro de trocas (BoardRow) ───────────────────────────────
  "profile.board.postedAgo": "Publicado {time}",
  "profile.board.expiresWarning_one": "Expira em {count} dia",
  "profile.board.expiresWarning_other": "Expira em {count} dias",
  "profile.board.foundIt": "Encontrado, fechado",
  "profile.board.foundItWithNote": "Encontrado. {note}",
  "profile.board.markFoundCta": "Marcar como encontrado",
  "profile.board.markFoundCancel": "Cancelar",
  "profile.board.markFoundConfirm": "Confirmar",
  "profile.board.foundNoteLabel": "Nota sobre como foi encontrado",
  "profile.board.foundNotePlaceholder": "Adiciona uma nota (opcional)",
  "content.skills.title": "Competências e ofertas",
  "content.skills.subtitle":
    "Aquilo em que {first} pode ajudar, e trocar no quadro de trocas",
  "content.skills.barterCta": "Ver o quadro de trocas completo",
  "content.groups.title": "Grupos e círculos",
  "content.groups.subtitle": "Onde {first} aparece na comunidade",
  "content.shapings.title": "O que me formou",
  "content.shapings.subtitle":
    "Não são interesses. São textos, filmes e momentos marcantes.",
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
  // ── Seletor de área e função (WorkFieldPicker) ──────────────────────────────
  // Aparece em três sítios — o editor de perfil, o passo "o que fazes" do
  // onboarding e Definições → Interesses — por isso o vocabulário tem de ler
  // sempre igual.
  "profileEdit.work.label": "O que fazes",
  "profileEdit.work.help":
    "Público. Aparece no teu perfil e é assim que as pessoas te encontram em “O que fazem” e “Profiss\u00e3o” no diret\u00f3rio.",
  "workPicker.fieldHeading": "A tua área",
  "workPicker.professionHeading": "A tua função",
  "workPicker.professionPrompt":
    "Escolhe uma área acima para veres as funções dessa área.",
  "profileEdit.field.addSkillPlaceholder": "Procurar competências…",
  "profileEdit.field.links": "Links",
  "profileEdit.field.photo": "Foto",
  "profileEdit.field.lookingFor": "À procura de",
  "profileEdit.customPronounPlaceholder": "personalizado…",
  "profileEdit.customPronounsLabel": "Pronomes personalizados",
  "profileEdit.searchTagPlaceholder": "Procurar competências…",
  "profileEdit.popularTagsLabel": "Populares",

  // ── Modal de todas as etiquetas (ProfileTagBrowserModal) ──────────────────
  "profileEdit.tagBrowser.open": "Ver todas",
  "profileEdit.tagBrowser.title": "Todas as etiquetas",
  "profileEdit.tagBrowser.selectedCount_one": "{count} etiqueta no teu perfil",
  "profileEdit.tagBrowser.selectedCount_other":
    "{count} etiquetas no teu perfil",
  "profileEdit.tagBrowser.searchLabel": "Procurar etiquetas",
  "profileEdit.tagBrowser.searchPlaceholder": "Procurar etiquetas…",
  "profileEdit.tagBrowser.noMatches":
    "Nenhuma etiqueta corresponde a “{query}”.",
  "profileEdit.tagBrowser.done": "Concluído",
  "profileEdit.tagCategory.design": "Design e criação visual",
  "profileEdit.tagCategory.words": "Palavras e comunicação",
  "profileEdit.tagCategory.tech": "Tecnologia",
  "profileEdit.tagCategory.community": "Comunidade, cuidado e organização",
  "profileEdit.tagCategory.practical": "Prático e profissional",
  "profileEdit.tagCategory.performance": "Música e performance",
  "profileEdit.addTagLabel": "Adicionar uma etiqueta",
  "profileEdit.removeTagLabel": "Remover {tag}",
  "profileEdit.visibilityGroupLabel": "Visibilidade do perfil",
  "profileEdit.discardConfirm":
    "Tens alterações por guardar. Descartá-las e sair da edição?",
  "profileEdit.validation.nameRequired": "Introduz o teu nome próprio.",
  "profileEdit.validation.invalidUrl":
    "Isto não parece um link ou identificador válido.",

  // ── Pronúncia, biografia em português, nota de limites (ProfileEditDetailFields) ──
  "profileEdit.pronunciation.label": "Pronúncia do nome",
  "profileEdit.pronunciation.help":
    "Escreve-a foneticamente para que a digam bem. Aparece junto ao teu nome com um botão para ouvir.",
  "profileEdit.pronunciation.placeholder": "ex.: kuh-tuh-RI-nuh",
  "profileEdit.bioPt.label": "Biografia em português",
  "profileEdit.bioPt.help":
    "Uma versão opcional da tua biografia em português. Se adicionares uma, quem visita pode alternar entre idiomas.",
  "profileEdit.bioPt.placeholder":
    "Escreve-a em português se quiseres que as pessoas possam alternar.",
  "profileEdit.notHereFor.label": "Não estou aqui para",
  "profileEdit.notHereFor.help":
    "Um limite que gostarias que as pessoas conhecessem antes de te contactarem.",
  "profileEdit.notHereFor.placeholder": "ex.: Networking do meu trabalho",

  // ── Campo de biografia curta (ProfileShortBioField) ────────────────────────
  "profileEdit.shortBio.label": "Biografia curta",
  "profileEdit.shortBio.help":
    "A linha que as pessoas leem no diretório de Pessoas, antes de abrirem o teu perfil.",
  "profileEdit.shortBio.placeholder":
    "Uma ou duas linhas sobre quem és e o que procuras.",
  "profileEdit.shortBio.counter": "{length} / {max}",
  // Vem a seguir ao contador "{length} / {max}", por isso abre com o seu
  // próprio separador em vez de um travessão.
  "profileEdit.shortBio.overLimit":
    "· o teu cartão mostra só as primeiras duas linhas",

  // ── Estado "Agora" + Disponível para (ProfileNowField, OpenToEditor) ───────
  "profileEdit.now.label": "Agora",
  "profileEdit.now.help":
    "O que te ocupa neste momento. Muda sempre que quiseres. Se deixares vazio, esta secção não aparece no teu perfil.",
  "profileEdit.now.placeholder":
    "A acabar um fanzine, a aprender a soldar, à procura de sala de ensaio…",
  "profileEdit.openTo.label": "Disponível para",
  "profileEdit.openTo.help":
    "O que te faria bem agora. As pessoas podem tocar nestes para te contactar sobre isso mesmo.",
  "profileEdit.openTo.presetsLabel": "Coisas para que estás disponível",
  "profileEdit.openTo.addPlaceholder": "Ou diz à tua maneira…",
  "profileEdit.openTo.addLabel": "Adicionar algo para que estás disponível",
  "profileEdit.openTo.removeLabel": "Remover {label}",

  // ── À procura de (LookingForEditor) ─────────────────────────────────────────
  "profileEdit.lookingFor.heading": "O que procuras aqui?",
  "profileEdit.lookingFor.helper": "Seleciona as que quiseres.",
  "profileEdit.lookingFor.toggleLabel": "Mostrar no meu perfil o que procuro",

  // ── Barra de edição (ProfileEditBar) ────────────────────────────────────────
  "profileEdit.bar.unsaved":
    "Estás a editar o teu perfil, alterações por guardar",
  "profileEdit.bar.unsavedIn": "Alterações por guardar em {sections}",
  "profileEdit.bar.discard": "Descartar",
  "profileEdit.bar.saving": "A guardar…",
  "profileEdit.bar.tryAgain": "Tentar novamente",
  "profileEdit.bar.save": "Guardar perfil",
  "profileEdit.bar.savedBanner":
    "Guardado. <strong>O teu perfil está atualizado.</strong>",

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

  // ── Editor do quadro de trocas (BoardEditor) ────────────────────────────────
  "profileEdit.board.subtitle": "O que estás a pedir e a oferecer agora",
  "profileEdit.board.add": "Adicionar ao quadro",
  "profileEdit.board.kindLabel": "A pedir ou a oferecer",
  "profileEdit.board.titlePlaceholder": "ex.: Um estúdio emprestado",
  "profileEdit.board.titleLabel": "O que procuras ou ofereces",
  "profileEdit.board.removeLabel": "Remover {title}",

  // ── Editor de competências (SkillsEditor) ───────────────────────────────────
  "profileEdit.skills.subtitle":
    "Aquilo em que podes ajudar, e trocar no quadro de trocas",
  "profileEdit.skills.add": "Adicionar",
  "profileEdit.skills.namePlaceholder": "Uma competência ou serviço…",
  "profileEdit.skills.nameLabel": "Competência ou serviço",
  "profileEdit.skills.metaPlaceholder": "Detalhe (opcional)",
  "profileEdit.skills.metaLabel": "Detalhe da competência",
  "profileEdit.skills.removeLabel": "Remover {name}",

  // ── Editor de grupos (GroupsEditor) ─────────────────────────────────────────
  "profileEdit.groups.subtitle":
    "Grupos, círculos e coletivos de que fazes parte",
  "profileEdit.groups.add": "Adicionar um grupo",
  "profileEdit.groups.namePlaceholder": "Nome do grupo ou círculo",
  "profileEdit.groups.nameLabel": "Nome do grupo",
  "profileEdit.groups.rolePlaceholder": "O teu papel",
  "profileEdit.groups.roleLabel": "O teu papel",
  "profileEdit.groups.removeLabel": "Remover {name}",

  // ── Editor do que te formou (ShapingsEditor) ────────────────────────────────
  "profileEdit.shapings.subtitle":
    "Até um filme, um livro, uma música e um momento que te formaram",
  "profileEdit.shapings.titlePlaceholder": "Título",
  "profileEdit.shapings.titleLabel": "Título: {label}",
  "profileEdit.shapings.notePlaceholder": "Porque ficou contigo",
  "profileEdit.shapings.noteLabel": "Nota: {label}",

  // ── Linha de votos de confiança no cabeçalho (HeroVouchRow) ────────────────
  "hero.vouch.namesPlusYou": "{names}, e tu",
  "hero.vouch.youOnly": "tu",
  "hero.vouch.anonymous": "Anónimo",
  "hero.vouch.by": "Quem te deu um voto de confiança: <b>{names}</b>.",
  "hero.vouch.onlyNumberMatters":
    "Um rosto conhecido deu-lhes um voto de confiança.",
  "hero.vouch.onlyNumberMattersSelf":
    "Um rosto conhecido deu-te um voto de confiança.",
  "hero.vouch.emptySelf":
    "Ainda sem votos de confiança. Vão aparecer aqui à medida que quem te conhece juntar o nome. É o único número que importa.",
  "hero.vouch.emptyOther":
    "Ainda ninguém deu um voto de confiança a {first}. Se conheces esta pessoa, o teu pode ser o primeiro.",
  // A pista de confiança relativa a quem está a ver. Só aparece a partir de
  // um, e o backend nem sequer a envia quando esta pessoa escondeu a lista de
  // quem lhe deu voto de confiança.
  "hero.vouch.mutualVouchers_one":
    "{count} pessoa que conheces deu voto de confiança",
  "hero.vouch.mutualVouchers_other":
    "{count} pessoas que conheces deram voto de confiança",

  // ── Linha de intenção "Aqui para" (ProfileHero) ─────────────────────────────
  "hero.hereFor.label": "Aqui para",
  "hero.hereFor.hintPublic": "visível no teu perfil",
  "hero.hereFor.hintPrivate": "só tu consegues ver",

  // ── Linha de etiquetas do hero (ProfileHeroMain) ────────────────────────────
  "hero.tags.label": "Etiquetas",

  // ── Linha "trabalha em" do hero (ProfileWorkRow) ────────────────────────────
  "hero.worksIn.label": "Trabalha em",

  // ── Página de perfil público (PublicProfilePage) ────────────────────────────
  // ── /public-profile/:slug — o perfil público, visível sem sessão ──────────
  // O texto de "não encontrado" é essencial: um perfil não publicado, uma
  // pessoa desativada e um slug que nunca existiu têm de ler exatamente igual.
  // Nada aqui pode sugerir que alguém está cá mas escondido — isso tornaria
  // esta página uma forma de confirmar que uma pessoa está no QueerPulse.
  "publicBySlug.meta.title": "{name} · QueerPulse",
  "publicBySlug.aboutHeading": "Sobre",
  "publicBySlug.linksHeading": "Noutros sítios",
  "publicBySlug.workHeading": "Trabalho",
  "publicBySlug.activityHeading": "Atividade recente",
  "publicBySlug.activityEmpty": "Ainda nada público por aqui.",
  "publicBySlug.joinTitle": "O QueerPulse é só por convite",
  "publicBySlug.joinBody":
    "Um sítio onde a Lisboa queer se junta: sem anúncios, sem algoritmo. Precisas de alguém que te traga, ou podes pedir-nos diretamente.",
  "publicBySlug.notFound.metaTitle": "Não encontrado · QueerPulse",
  "publicBySlug.notFound.title": "Não há nada neste link",
  "publicBySlug.notFound.description":
    "Não há nada para mostrar aqui. Vale a pena confirmares o endereço que seguiste.",
  "publicBySlug.notFound.backCta": "Ir para o QueerPulse",

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
    "A QueerPulse mantém o dia a dia da comunidade atrás de um início de sessão, para proteger as pessoas. Junta-te e o feed de {first} desbloqueia-se de imediato, incluindo a possibilidade de enviares mensagem a {first}.",
  "publicProfile.requestInviteArrow": "Pedir um convite",
  "publicProfile.locked.connectionsHeading": "Ligações",
  "publicProfile.locked.connectionsTitle":
    "Quem {first} conhece, <em>em privado.</em>",
  "publicProfile.locked.connectionsBody":
    "Para proteger as redes das pessoas da comunidade, não mostramos listas de ligações publicamente. Entra para veres os teus contactos em comum com {first}.",
  "publicProfile.bottomCta.title": "Queres <em>ver tudo?</em>",
  "publicProfile.bottomCta.body":
    "A QueerPulse funciona por convite. {firstName} pode dar-te um voto de confiança se já se conheceram pessoalmente. Ou pede um convite diretamente a nós.",

  // ── Secções de perfil público (PublicProfileSections) ──────────────────────
  "publicProfile.preview.ownerLabel":
    "Pré-visualização do teu perfil público · é assim que quem não é da comunidade te veria",
  "publicProfile.preview.notYet":
    "Os perfis públicos ainda não estão abertos. Esta pré-visualização só é visível para ti.",
  "publicProfile.pill.live": "Ativo",
  "publicProfile.pill.off": "Inativo",
  "publicProfile.preview.backToProfile": "Voltar ao teu perfil",
  "publicProfile.preview.guestLabel":
    "Não tens sessão iniciada · a ver a <b>versão pública</b> deste perfil",
  "publicProfile.head.eyebrow": "Perfil público · @{slug}",
  "publicProfile.head.location": "<b>{hood}</b>, Lisboa",
  "publicProfile.head.memberSince": "Nesta comunidade desde <b>{since}</b>",
  "publicProfile.head.vouchedFor":
    "<b>Com voto de confiança</b> de {count} pessoas",
  "publicProfile.head.requestInviteCta": "Pedir um convite para ligar",
  "publicProfile.head.ctaNote":
    "O perfil completo de {firstName}, publicações e acesso a mensagens diretas abrem assim que te tornares parte da comunidade.",

  // ── Controlo do perfil público (PublicProfileModal) ──────────────────────
  "publicProfile.control.locked.eyebrow": "Perfil público · bloqueado",
  "publicProfile.control.locked.title":
    "Um perfil público é algo em que <em>cresces aos poucos.</em>",
  "publicProfile.control.locked.lede":
    "Os perfis públicos são para quem ajuda a levar o lado público da QueerPulse: quem escreve, organiza convívios ou lidera projetos. É aqui que estás:",
  "publicProfile.control.unlocked.eyebrow": "Perfil público · desbloqueado",
  "publicProfile.control.unlocked.title":
    "Já podes partilhar um <em>perfil público.</em>",
  "publicProfile.control.unlocked.lede":
    "Um perfil público vai permitir que quem ainda não é da comunidade encontre a tua escrita, os teus convívios e uma forma de te contactar, sem abrir o resto da comunidade.",
  "publicProfile.control.notYet":
    "Os perfis públicos ainda não estão abertos, por isso nada aqui é publicado em lado nenhum e ninguém fora da QueerPulse te vê. Guardamos o que escolheres, e é isso que vamos ativar no dia em que abrirem.",
  "publicProfile.control.switchLabel": "Mostrar um perfil público",
  "publicProfile.control.statusOn":
    "Ativo: guardado para quando os perfis públicos abrirem.",
  "publicProfile.control.statusOff": "Inativo: nada teu se torna público.",
  "publicProfile.control.viewCta": "Pré-visualizar o teu perfil público",
  "publicProfile.control.toast.hidden":
    "Guardado: o teu perfil fica só para a comunidade",
  "publicProfile.control.toast.live":
    "Guardado: vamos ativar isto quando os perfis públicos abrirem",
  "publicProfile.control.toast.failed":
    "Não conseguimos guardar. A tua preferência ficou como estava. Tenta outra vez daqui a pouco.",
  "publicProfile.control.checking.title": "A ver <em>onde estás</em>",
  "publicProfile.control.checking.body":
    "Um momento. Estamos a somar as tuas contribuições, apadrinhamentos e tempo por aqui.",
  "publicProfile.control.error.title": "Não conseguimos verificar agora",
  "publicProfile.control.error.body":
    "Algo impediu o carregamento do teu progresso. A culpa não é tua. Tenta outra vez daqui a pouco.",
  "publicProfile.control.error.retry": "Tentar de novo",

  // ── Public-profile hero badge (PublicProfileBadge) ──────────────────────────
  "publicProfile.badge.label": "Ficar público",

  // ── Critérios de elegibilidade pública (publicFigure.ts) ───────────────────
  "publicProfile.eligibility.verified.hint":
    "Confirma a tua identidade para que se saiba que és mesmo tu.",
  "publicProfile.eligibility.tenure.label": "Uma temporada na QueerPulse",
  "publicProfile.eligibility.tenure.hint":
    "Os perfis públicos abrem depois dos teus primeiros 90 dias aqui.",
  "publicProfile.eligibility.tenure.remaining_one": "falta {count} dia",
  "publicProfile.eligibility.tenure.remaining_other": "faltam {count} dias",
  "publicProfile.eligibility.family.contribution.label": "Contribuição pública",
  "publicProfile.eligibility.family.contribution.hint":
    "Publicar textos, organizar eventos abertos e personas",
  "publicProfile.eligibility.family.trust.label": "Confiança da comunidade",
  "publicProfile.eligibility.family.trust.hint":
    "Apadrinhamentos, recomendações e ligações de outros membros",
  "publicProfile.eligibility.family.participation.label":
    "Participação constante",
  "publicProfile.eligibility.family.participation.hint":
    "Ir a encontros, publicar e manter-te ativo recentemente",
  "publicProfile.eligibility.progress.pct":
    "{pct}% do caminho para um perfil público",
  "publicProfile.eligibility.gates.heading": "Primeiro, o essencial",
  "publicProfile.eligibility.families.heading": "Depois, como tudo soma",
  "publicProfile.eligibility.actions.heading": "O que te faz avançar",
  "publicProfile.eligibility.action.verify": "Confirma a tua identidade",
  "publicProfile.eligibility.action.tenure":
    "Continua a aparecer. O tempo trata disto",
  "publicProfile.eligibility.action.host":
    "Publica algo ou organiza um evento aberto",
  "publicProfile.eligibility.action.vouch":
    "Pede a quem te conhece para te apadrinhar",
  "publicProfile.eligibility.action.attend": "Aparece a um encontro ou dois",
  "publicProfile.eligibility.action.points": "+{points}",
  "publicProfile.eligibility.family.amount": "{points} / {cap}",
  "publicProfile.eligibility.standing.blocked":
    "Isto não pode abrir agora. Não há nada a fazer aqui. Vai resolver-se.",

  // ── Etiquetas de estatísticas do perfil público (currentUserPublic.data) ──
  "publicProfile.stat.poemsPublished": "Poemas publicados",
  "publicProfile.stat.eventsHosted": "Convívios organizados",
  "publicProfile.stat.yearsOnPlatform": "Ano na QueerPulse",
  "publicProfile.stat.membersReached": "Pessoas alcançadas",

  // ── Pré-visualização do perfil público em modo real: ainda nada publicado ───
  //    (`GET /public/profiles/:slug` responde 404 até a pessoa ligar o perfil
  //    público, por isso este é o estado normal e nunca um erro).
  "publicProfile.previewOff.title":
    "O teu perfil público ainda não está ligado",
  "publicProfile.previewOff.description":
    "Se o ligares, quem está fora da QueerPulse vê o teu nome, pronomes, frase de apresentação, biografia, os links e trabalhos que escolheste mostrar e a tua atividade pública recente. Mais nada sai da área de pessoas.",
  "publicProfile.previewOff.cta": "Abrir definições de perfil",

  // ── Pesquisa global (SearchPage) ────────────────────────────────────────────
  "search.type.member": "Pessoas",
  "search.type.community": "Comunidades",
  "search.type.event": "Eventos",
  "search.type.forum": "Fórum",
  "search.type.forumPost": "Respostas do fórum",
  "search.type.business": "Negócios",
  "search.type.magazine": "Revista",
  "search.type.job": "Vagas",
  "search.type.housing": "Habitação",
  "search.type.resource": "Recursos",
  "search.type.subprofile": "Subperfis",
  "search.type.board": "Quadro",
  "search.type.topic": "Tópicos",
  "search.type.page": "Páginas",
  "search.type.all": "Tudo",
  // ── Aviso de início de sessão (SearchResults) — para quem não tem sessão iniciada em modo real ──
  "search.signInRequired.badge": "Entrar",
  "search.signInRequired.title": "A pesquisa é para <em>membros</em>",
  "search.signInRequired.body":
    "Inicia sessão para pesquisar pessoas, comunidades, eventos, o fórum e negócios locais.",
  "search.recentSearches": "Pesquisas recentes",
  "search.browseTopics": "Explorar tópicos",
  "search.upcomingEvents": "Próximos eventos",
  "search.jumpTo": "Ir para <b>{name}</b>",
  "search.seeAllIn": "Ver tudo em {category}",
  // ── Paginação de uma categoria além da primeira página (SearchLoadMore, SOC-08) ──
  "search.loadMore.action": "Carregar mais resultados",
  "search.loadMore.loading": "A carregar…",
  "search.loadMore.retry": "Tentar de novo",
  "search.loadMore.failed": "Essa página não carregou.",
  "search.loadMore.end": "Isto é tudo para esta pesquisa.",
  "search.resultCount_one": `<b>{count}</b> resultado para "<b>{query}</b>"`,
  "search.resultCount_other": `<b>{count}</b> resultados para "<b>{query}</b>"`,
  "search.empty.title": "Nada encontrado",
  "search.empty.body":
    "Tenta outra palavra: nome de uma pessoa, bairro, competência, ou tipo de convívio.",
  "search.hero.label": "Pesquisar",
  "search.hero.title":
    "Encontra quem ou o que quiseres <em>na comunidade.</em>",
  "search.hero.placeholder":
    "Pessoas, convívios, comunidades, publicações no quadro…",

  // ── Filtro avançado do diretório (MemberDirectoryFilterPage) ───────────────
  "directory.eyebrow": "Pessoas · filtro avançado",
  "directory.findPrefix": "Encontra",
  "directory.memberCountSuffix_one": "pessoa,",
  "directory.memberCountSuffix_other": "pessoas,",
  "directory.findSuffix": "exatamente.",
  "directory.lead":
    "Filtra pelo que oferecem, onde vivem, ao que estão <b>disponíveis</b>. Os dados funcionam nos dois sentidos. As pessoas aparecem aqui porque optaram por ser encontráveis por estas razões.",
  "directory.toast.filtersCleared": "Filtros limpos",
  "directory.showingPrefix": "A mostrar",
  "directory.showingOf": "de",
  "directory.memberCountLabel_one": "pessoa",
  "directory.memberCountLabel_other": "pessoas",
  "directory.sortLabel": "Ordenar",
  "directory.sort.recentlyJoined": "Juntaram-se recentemente",
  "directory.sort.recentlyActive": "Ativos recentemente",
  "directory.sort.closestMutuals": "Mais contactos em comum",
  "directory.sort.aToZ": "De A a Z",
  "directory.sort.mostVouched": "Com mais votos de confiança",
  "directory.removeChipLabel": "Remover {label}",
  "directory.emptyFiltered.title": "Nada corresponde aos teus filtros",
  "directory.emptyFiltered.description":
    "Não há pessoas que cumpram tudo isto agora. Alivia um ou dois filtros e vai aparecer mais gente.",
  "directory.clearFiltersCta": "Limpar filtros",
  "directory.emptyAll.title": "Ainda não há pessoas aqui",
  "directory.emptyAll.description":
    "Este diretório ainda está a encher-se. À medida que as pessoas se juntam à QueerPulse e optam por ser encontráveis, vão aparecer aqui. Volta a verificar em breve.",
  "directory.error.title": "Não conseguimos carregar o diretório",
  "directory.error.description":
    "Algo correu mal ao procurar pessoas. Isto não é um diretório vazio. Tenta novamente daqui a pouco.",
  "directory.error.retry": "Tentar novamente",
  "directory.loadingMore": "A carregar…",
  "directory.loadMoreCta": "Carregar mais pessoas",
  "directory.filtersCta": "Filtros",
  "directory.hideFiltersCta": "Ocultar filtros",
  "directory.filtersSheetLabel": "Filtrar pessoas",
  "directory.showResultsCta_one": "Ver {count} pessoa",
  "directory.showResultsCta_other": "Ver {count} pessoas",

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
  // Nome acessível de uma opção de filtro com contagem. O emblema visível é
  // aria-hidden para que isto possa ser uma frase: um leitor de ecrã a ler a
  // marcação em bruto ouviria "Mentoria 7".
  "directory.filter.optionWithCount_one": "{label}, {count} pessoa",
  "directory.filter.optionWithCount_other": "{label}, {count} pessoas",
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

  // ── Chips de área "O que fazem" (memberDirectoryFilter.data → DISCIPLINES).
  //    O valor GUARDADO é o id estável (`design`, `tech`, …); isto é só o
  //    rótulo, resolvido ao renderizar (i18n §5.1).
  "directory.discipline.design": "Design",
  "directory.discipline.editorial": "Edição",
  "directory.discipline.healthcare": "Saúde",
  "directory.discipline.legal": "Direito",
  "directory.discipline.education": "Educação",
  "directory.discipline.tech": "Tecnologia",
  "directory.discipline.photo": "Fotografia",
  "directory.discipline.film": "Cinema",
  "directory.discipline.performance": "Performance",
  "directory.discipline.music": "Música",
  "directory.discipline.architecture": "Arquitetura",
  "directory.discipline.community": "Comunidade",
  "directory.discipline.curation": "Curadoria",
  "directory.discipline.food": "Gastronomia",
  "directory.discipline.craft": "Artesanato",
  "directory.discipline.science": "Ciência",

  // ── Chips de "Profissão" (memberDirectoryFilter.data → PROFESSIONS_BY_FIELD).
  //    Traduzidas como a área/atividade (não o substantivo de agente com
  //    género), seguindo o precedente já usado em economy.ts
  //    ("rateBoard.roleOption.softwareEngineer" → "Engenharia de software").
  "directory.profession.graphicDesigner": "Design gráfico",
  "directory.profession.uxDesigner": "Design de UX",
  "directory.profession.illustrator": "Ilustração",
  "directory.profession.artDirector": "Direção de arte",
  "directory.profession.editor": "Edição",
  "directory.profession.journalist": "Jornalismo",
  "directory.profession.copywriter": "Copywriting",
  "directory.profession.translator": "Tradução",
  "directory.profession.poet": "Poesia",
  "directory.profession.therapist": "Terapia",
  "directory.profession.psychologist": "Psicologia",
  "directory.profession.nurse": "Enfermagem",
  "directory.profession.gp": "Clínica geral",
  "directory.profession.physiotherapist": "Fisioterapia",
  "directory.profession.peerCounsellor": "Aconselhamento entre pares",
  "directory.profession.communityHealthWorker": "Saúde comunitária",
  "directory.profession.immigrationLawyer": "Direito de imigração",
  "directory.profession.familyLawyer": "Direito da família",
  "directory.profession.paralegal": "Apoio jurídico",
  "directory.profession.legalAdvocate": "Defesa de direitos",
  "directory.profession.teacher": "Ensino",
  "directory.profession.workshopFacilitator": "Dinamização de oficinas",
  "directory.profession.researcher": "Investigação",
  "directory.profession.tutor": "Explicações",
  "directory.profession.softwareEngineer": "Engenharia de software",
  "directory.profession.backendEngineer": "Engenharia backend",
  "directory.profession.dataScientist": "Ciência de dados",
  "directory.profession.productManager": "Gestão de produto",
  "directory.profession.portraitPhotographer": "Fotografia de retrato",
  "directory.profession.photojournalist": "Fotojornalismo",
  "directory.profession.retoucher": "Retoque fotográfico",
  "directory.profession.documentaryFilmmaker": "Realização de documentários",
  "directory.profession.filmmaker": "Realização",
  "directory.profession.cinematographer": "Direção de fotografia",
  "directory.profession.filmEditor": "Montagem",
  "directory.profession.choreographer": "Coreografia",
  "directory.profession.dancer": "Dança",
  "directory.profession.theatreMaker": "Criação teatral",
  "directory.profession.performanceArtist": "Arte da performance",
  "directory.profession.musicProducer": "Produção musical",
  "directory.profession.dj": "DJ",
  "directory.profession.sessionMusician": "Música de sessão",
  "directory.profession.soundDesigner": "Design de som",
  "directory.profession.musicIndustryAR": "A&R",
  "directory.profession.architect": "Arquitetura",
  "directory.profession.urbanDesigner": "Design urbano",
  "directory.profession.interiorArchitect": "Arquitetura de interiores",
  "directory.profession.communityOrganiser": "Organização comunitária",
  "directory.profession.housingOrganiser": "Organização habitacional",
  "directory.profession.housingAdvocate": "Defesa da habitação",
  "directory.profession.supportCoordinator": "Coordenação de apoio",
  "directory.profession.accessibilityAdvocate": "Defesa da acessibilidade",
  "directory.profession.activist": "Ativismo",
  "directory.profession.curator": "Curadoria",
  "directory.profession.archivist": "Arquivo",
  "directory.profession.galleryDirector": "Direção de galeria",
  "directory.profession.chef": "Cozinha",
  "directory.profession.barista": "Barismo",
  "directory.profession.baker": "Panificação",
  "directory.profession.supperClubHost": "Organização de jantares",
  "directory.profession.ceramicist": "Cerâmica",
  "directory.profession.woodworker": "Marcenaria",
  "directory.profession.textileArtist": "Arte têxtil",
  "directory.profession.biologist": "Biologia",
  "directory.profession.ecologist": "Ecologia",
  "directory.profession.labResearcher": "Investigação laboratorial",

  // ── Vocabulário partilhado "disponível para" (openTo.data → OPEN_TO_PRESETS).
  //    Um id → um rótulo, reutilizado pelos chips do perfil
  //    (content.now.openLabel), pelas checkboxes do filtro do diretório
  //    (directory.filter.openToTitle) e pelo grupo de motivos do formulário
  //    de contacto (connect:form.reasonOpenToGroup). Redigido como a própria
  //    pessoa o diria, não como categoria de mercado.
  "openTo.collaborating": "Colaborações",
  "openTo.mentoring": "Mentoria",
  "openTo.casualMeetups": "Café e jantares longos",
  "openTo.commissions": "Encomendas",
  "openTo.clientWork": "Novos clientes",
  "openTo.referrals": "Referências",
  "openTo.swaps": "Trocas de competências",
  "openTo.studioVisits": "Visitas ao estúdio",
  "openTo.interviewees": "Dar entrevistas",

  // ── Filtro "Onde vivem" (memberDirectoryFilter.data → NEIGHBOURHOODS). Os
  //    nomes de bairros de Lisboa são nomes próprios e mantêm-se idênticos em
  //    qualquer idioma; só esta opção de "ver tudo" precisa de tradução.
  "directory.hood.all": "Toda a Lisboa",

  // ── Chips do filtro "Identidade · autodeclarada" (memberDirectoryFilter.data
  //    → IDENTITY_OPTIONS). Mesma separação id-guardado / rótulo-traduzido.
  //    NOTA: "qpoc" fica deliberadamente por traduzir, à espera de revisão
  //    nativa pt-PT da terminologia racial/POC (i18n sweep §6) — ver o
  //    relatório da sweep.
  "directory.identity.transNonBinary": "Trans e não-binárie",
  "directory.identity.lesbian": "Lésbica",
  "directory.identity.gay": "Gay",
  "directory.identity.biPan": "Bi / Pan",
  "directory.identity.aroAce": "Espectro aro/ace",
  "directory.identity.qpoc": "QPOC / queer of colour",
  "directory.identity.disabledChronicIllness": "Deficiência / doença crónica",

  // ── Pré-visualização do cartão (DirectoryCardPreview) ──────────────────────
  "directory.preview.caption": "Como o teu cartão aparece no diretório",
  "directory.preview.borrowedNote":
    "Ainda não há nada aqui, por isso o teu cartão usa o início da tua biografia. Escreve uma biografia curta e ele passa a usar essa.",

  // ── Paleta de comandos (CommandPalette) ─────────────────────────────────────
  "commandPalette.ariaLabel": "Pesquisar na QueerPulse",
  "commandPalette.escKey": "esc",
  "commandPalette.placeholder": "Pesquisar pessoas, convívios, comunidades…",
  "commandPalette.signInBody":
    "Inicia sessão para pesquisar em toda a QueerPulse.",
  "commandPalette.noMatches": "Sem resultados. Tenta outra palavra.",
  "commandPalette.seeAllResults":
    "Ver todos os resultados para “<b>{query}</b>”",
  "commandPalette.openFullSearch": "Abrir pesquisa completa",

  // ── Página de voto de confiança: escolher alguém (VouchPage) ─────────
  "vouch.page.eyebrow": "Voto de confiança",
  "vouch.page.title": "Diz-nos que <em>as conheces.</em>",
  "vouch.page.lede":
    "Encontra a pessoa a quem queres dar um voto de confiança. O voto é público e leva o teu nome, e podes retirá-lo quando quiseres.",
  "vouch.picker.searchPlaceholder": "Procurar pessoas pelo nome",
  "vouch.picker.searchAria": "Procurar pessoas para dar um voto de confiança",
  "vouch.picker.noResults":
    "Ninguém aqui corresponde a “{query}”. Tenta outra grafia.",
  "vouch.picker.alreadyVouched": "Com o teu voto",
  "vouch.picker.vouchCta": "Dar voto de confiança a {name}",
  "vouch.picker.error.title": "A lista de pessoas não carregou",
  "vouch.picker.error.description":
    "Algo correu mal a caminho do diretório. Tenta outra vez.",
  "vouch.picker.error.retry": "Tentar outra vez",

  // ── Explicação de porquê dar um voto de confiança (vouch.data.ts MEANS) ─────
  "vouch.means.know.title": "Conheces esta pessoa, a sério",
  "vouch.means.know.body":
    "Um voto de confiança diz que já conheceste esta pessoa e confias nela em espaços da comunidade. Isso tem peso aqui.",
  "vouch.means.safe.title": "Mantém o espaço seguro",
  "vouch.means.safe.body":
    "A QueerPulse funciona por convite e voto de confiança por uma razão. Pessoas a darem votos de confiança a pessoas é como nos mantemos numa comunidade pequena e de confiança.",
  "vouch.means.council.title": "É visto pelo conselho",
  "vouch.means.council.body":
    "A tua nota vai para o conselho da comunidade junto com o pedido desta pessoa. Não é publicada.",

  // ── Opções de relação para dar um voto de confiança (vouchMember.data.ts) ──
  "vouch.relationship.collaborated": "Já colaborámos",
  "vouch.relationship.friends": "Somos amigues",
  "vouch.relationship.group": "Mesmo coletivo ou grupo",
  "vouch.relationship.metThroughQueerPulse": "Conhecemo-nos na QueerPulse",
  "vouch.relationship.neighbours": "Somos vizinhes",

  // ── Etiquetas de "textura" da relação, só de leitura (HeroVouchRow) —
  // frases nominais curtas na terceira pessoa, não a cópia na primeira
  // pessoa acima; descrevem a relação de quem deu o voto com este perfil. ──
  "vouch.relationshipChip.collaborated": "Colaboração",
  "vouch.relationshipChip.friends": "Amigues",
  "vouch.relationshipChip.group": "Mesmo coletivo",
  "vouch.relationshipChip.met_through": "Conhecidos na QueerPulse",
  "vouch.relationshipChip.neighbours": "Vizinhes",

  // ── Modal de dar um voto de confiança (VouchMemberModal, VouchMemberModalParts) ──
  "vouch.modal.ariaLabel": "Dar voto de confiança a {first}",
  "vouch.modal.close": "Fechar",
  "vouch.modal.success.title":
    "Aí está <em>{first}</em>, com voto de confiança.",
  "vouch.modal.success.body":
    "A tua cara acabou de entrar no círculo de votos de confiança de <b>{first}</b>. É assim que a confiança circula aqui. Pessoa a pessoa, nome a nome.",
  "vouch.modal.success.doneCta": "Concluído",
  "vouch.modal.form.eyebrow": "Adicionar o teu voto de confiança",
  "vouch.modal.form.title": "Dá um voto de confiança a <em>{first}</em>",
  "vouch.modal.form.sub":
    "Um voto de confiança é tu, publicamente, a dizeres que conheces {first} e confias nesta pessoa em espaços da comunidade. Tem peso aqui. A QueerPulse funciona por convite e voto de confiança, e o teu nome fica no perfil desta pessoa ao lado de quem mais a apoiou.",
  "vouch.modal.form.relationshipLabel": "Como conheces {first}?",
  "vouch.modal.form.relationshipHint": "seleciona todas as que se aplicam",
  // A linha de chips de competências foi removida (nada guardava as escolhas),
  // e com ela as chaves `endorseLabel` / `optional`.
  "vouch.modal.form.noteLabel": "A tua nota",
  "vouch.modal.form.notePlaceholder":
    "Como conheces {first}, e o que deve saber o resto da comunidade?",
  "vouch.modal.form.noteOptional": "Opcional, mas uma nota diz mais",
  "vouch.modal.form.charsCount_one": "{count} carácter",
  "vouch.modal.form.charsCount_other": "{count} carateres",
  "vouch.modal.form.cancel": "Cancelar",
  "vouch.modal.form.sending": "A enviar o teu voto de confiança…",
  "vouch.modal.form.anonymousLabel":
    "Dar voto de confiança anonimamente. O teu nome fica oculto de outros membros",
  "vouch.modal.error":
    "Não conseguimos guardar o teu voto de confiança. Tenta novamente.",

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
    "Não há rascunhos por aí. Nada a meio caminho à tua espera. Quando começares algo e te afastares, fica guardado aqui.",
  "drafts.empty.startCta": "Começar algo novo",
  "drafts.toast.deleted_one": "Rascunho eliminado",
  "drafts.toast.deleted_other": "{count} rascunhos eliminados",
  "drafts.toast.undo": "Desfazer",
  "drafts.toast.kept": "Rascunho mantido: mais 30 dias",
  "drafts.dangerNote":
    "<b>Sobre a regra dos 90 dias:</b> rascunhos que não tocas há 87+ dias recebem um lembrete por email, e são eliminados automaticamente ao dia 90. Podes prolongar qualquer rascunho 30 dias de cada vez. <em>Isto mantém a tua lista de rascunhos honesta e protege o teu trabalho.</em>",

  // ── Linha de rascunho (DraftRow) ────────────────────────────────────────────
  "drafts.row.selectAriaLabel": "Selecionar rascunho",
  "drafts.meta.startedAgo": "Começado {time}",
  "drafts.meta.lastEditedAgo": "Editado pela última vez {time}",
  "drafts.meta.savedAgo": "Guardado {time}",
  "drafts.meta.daysLeft_one": "{count} dia",
  "drafts.meta.daysLeft_other": "{count} dias",
  "drafts.meta.closesOn": "Fecha a {date} · {daysPhrase}",
  "drafts.meta.deletesIn": "Elimina-se em {daysPhrase} · regra dos 90 dias",

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
  "collections.recentSaves.heading":
    "Guardado recentemente · ainda sem coleção",
  "collections.recentSaves.unfiledCount": "+ {count} por arquivar",
  "collections.recentSaves.addCta": "+ Adicionar a uma coleção",
  "collections.toast.created": "Coleção criada",
  "collections.toast.createError":
    "Não foi possível criar essa coleção. Tenta de novo.",
  "collections.toast.addError":
    "Não foi possível adicionar isso à tua coleção. Tenta de novo.",
  "collections.toast.removed": "Removido da coleção",
  "collections.toast.removeError":
    "Não foi possível remover esse item. Tenta de novo.",
  "collections.toast.renamed": "Coleção renomeada",
  "collections.toast.renameError":
    "Não foi possível renomear essa coleção. Tenta de novo.",
  "collections.toast.deleted": "Coleção eliminada",
  "collections.toast.deleteError":
    "Não foi possível eliminar essa coleção. Tenta de novo.",
  "collections.newCollection.defaultMeta":
    "Acabada de criar. Começa a adicionar guardados",
  "collections.updatedJustNow": "Atualizado agora mesmo",
  // Card de coleção em modo live (valores vêm do servidor).
  "collections.live.updated": "Atualizado {time}",
  "collections.live.itemCount_one": "{count} guardado",
  "collections.live.itemCount_other": "{count} guardados",
  "collections.emptyLive.title": "Ainda sem coleções",
  "collections.emptyLive.description":
    "Agrupa os artigos, convívios e lugares que guardas em pastas. Cria a tua primeira coleção para começar.",

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
  "collections.modal.newCollection.privateOnlyNote":
    "As coleções são privadas. Mais ninguém vê o que arquivas aqui.",
  "collections.modal.newCollection.cancel": "Cancelar",
  "collections.modal.newCollection.submit": "Criar coleção",
  "collections.modal.privacyOption.private": "Privada",
  "collections.modal.privacyOption.shared":
    "Partilhada com pessoas da comunidade",
  "collections.modal.privacyOption.public": "Pública",
  "collections.modal.view.dialogLabel": "Ver coleção",
  "collections.modal.view.emptyText":
    "Ainda não há nada aqui. Adiciona guardados a partir da lista abaixo da grelha.",
  "collections.modal.view.close": "Fechar",
  "collections.modal.view.removeItem": "Remover da coleção",
  "collections.modal.view.rename": "Mudar o nome",
  "collections.modal.view.renameLabel": "Nome da coleção",
  "collections.modal.view.renameSave": "Guardar",
  "collections.modal.view.renameCancel": "Cancelar",
  "collections.modal.view.delete": "Eliminar coleção",
  "collections.modal.view.deleteConfirm.title": "Eliminar {name}?",
  "collections.modal.view.deleteConfirm.body":
    "A coleção desaparece, os guardados ficam. Tudo o que arquivaste aqui continua nos teus guardados.",
  "collections.modal.view.deleteConfirm.cta": "Eliminar coleção",
  "collections.modal.add.dialogLabel": "Adicionar a uma coleção",
  "collections.modal.add.eyebrow": "Adicionar a uma coleção",
  "collections.modal.add.title": "Onde deve ficar isto?",
  "collections.modal.add.filing": "A arquivar…",
  "collections.modal.add.cancel": "Cancelar",
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
  "savedByYou.kind.event.label": "Convívio",
  "savedByYou.kind.event.cta": "Ver",
  "savedByYou.kind.post.label": "Conversa",
  "savedByYou.kind.post.cta": "Abrir conversa",
  "savedByYou.kind.group.label": "Comunidade",
  "savedByYou.kind.group.cta": "Abrir",
  "savedByYou.kind.housing.label": "Habitação",
  "savedByYou.kind.housing.cta": "Ver anúncio",
  "savedByYou.kind.flatmate.label": "Colega de casa",
  "savedByYou.kind.flatmate.cta": "Ver perfil",
  "savedByYou.kind.landlord.label": "Pessoa proprietária",
  "savedByYou.kind.landlord.cta": "Ver pessoa proprietária",
  "savedByYou.kind.listing.label": "Negócio",
  "savedByYou.kind.listing.cta": "Ver anúncio",

  // ── Chrome de guardados por ti (SavedByYou) ─────────────────────────────────
  "savedByYou.removeAriaLabel": "Remover {title} dos guardados",
  "savedByYou.removeTitle": "Remover dos guardados",
  "savedByYou.heading": "Guardado por ti · em toda a QueerPulse",
  "savedByYou.empty.title": "Ainda não guardaste nada",
  "savedByYou.empty.description":
    "Guarda artigos, filmes, vagas e publicações à medida que exploras. Vão reunir-se aqui para voltares a eles e organizá-los em coleções.",
  "savedByYou.empty.browseMagazineCta": "Explorar a revista",
  "savedByYou.empty.exploreCinemaCta": "Explorar o Cinema",
  "savedByYou.count_one": "{count} guardado",
  "savedByYou.count_other": "{count} guardados",
  "savedByYou.toast.removed": "Removido dos guardados",

  // ── Espaços (PlacesSection) ──────────────────────────────────────────────────
  // Mesmo vocabulário de estado do registo que "Os teus espaços" acima,
  // reutilizado na secção do perfil que mostra tanto à pessoa dona do perfil
  // como a quem a visita o que este membro gere no diretório.
  "places.status.review": "Em análise",
  "places.status.question": "Pergunta rápida",
  "places.status.live": "Ativo",
  "places.selfTitle": "Espaços que <em>geres</em>",
  "places.visitorTitle": "Espaços que {firstName} <em>gere</em>",
  "places.selfSubtitle":
    "Anúncios que adicionaste ao diretório. Cada um é revisto pela equipa da comunidade antes de ficar ativo.",
  "places.refLabel": "Ref. · {ref}",
  "places.quickEditCta": "Edição rápida",
  "places.editCta": "Editor completo",
  "places.deleteCta": "Eliminar",
  "places.deleteConfirm":
    "Eliminar <b>{name}</b> definitivamente? Não pode ser anulado.",
  "places.deleteCancel": "Manter",
  "places.deleteYes": "Eliminar anúncio",
  "places.deleted": "Anúncio eliminado.",
  "places.viewListingCta": "Ver anúncio",
  "places.awaitingReview": "Aguarda revisão",
  "places.coManaging": "Ajudas a gerir",

  // ── Convites para ajudar a gerir um espaço de outra pessoa, respondidos
  //    aqui porque é aqui que um convite aceite vai parar.
  "places.coManagerInvites.title_one": "1 convite à espera de resposta",
  "places.coManagerInvites.title_other":
    "{count} convites à espera de resposta",
  "places.coManagerInvites.sub":
    "Alguém te pediu ajuda para gerir um espaço. Sem pressa: nada muda até responderes.",
  "places.coManagerInvites.fromNamed": "Convite de <b>{name}</b>.",
  "places.coManagerInvites.from": "Um convite para ajudar a gerir este espaço.",
  "places.coManagerInvites.acceptCta": "Aceitar",
  "places.coManagerInvites.declineCta": "Recusar",
  "places.coManagerInvites.acceptedToast":
    "Passaste a ajudar a gerir {listing}.",
  "places.coManagerInvites.declinedToast": "Convite recusado.",
  "places.coManagerInvites.error":
    "Não conseguimos enviar a tua resposta. Tenta outra vez.",
  "places.empty.title": "Ainda sem espaços",
  "places.empty.description":
    "Gere um estúdio, loja, clínica ou espaço em Lisboa? Regista-o no diretório. Assim que ficar ativo, aparece aqui também.",
  "places.empty.action": "Registar o meu espaço",

  "places.quickEdit.title": "Edição rápida",
  "places.quickEdit.sub": "Atualiza os dados principais de {name}.",
  "places.quickEdit.blurbLabel": "Frase de apresentação",
  "places.quickEdit.blurbHelper": "Mostrada por baixo do nome do teu anúncio.",
  "places.quickEdit.hoursNoteLabel": "Nota sobre o horário",
  "places.quickEdit.hoursNoteHelper":
    'Uma linha curta mostrada por baixo do teu horário, por exemplo "Fechado em feriados."',
  "places.quickEdit.websiteLabel": "Site",
  "places.quickEdit.phoneLabel": "Telefone",
  "places.quickEdit.cancel": "Cancelar",
  "places.quickEdit.save": "Guardar alterações",
  "places.quickEdit.saving": "A guardar…",
  "places.quickEdit.savedToast": "Anúncio atualizado.",
  "places.quickEdit.errorToast":
    "Não foi possível guardar as alterações. Tenta novamente.",
  "places.quickEdit.moreLink":
    "Precisas de alterar categorias, morada ou fotos? <a>Abrir o editor completo.</a>",

  // ── Chrome da página de emblemas (BadgesPage, BadgesSections) ──────────────
  "badges.backToProfile": "Voltar ao perfil",
  "badges.pageTitle": "Emblemas e <em>nível</em>",
  "badges.howToEarnXp": "Como ganhar XP",
  "badges.loading": "A carregar os teus emblemas…",
  "badges.errorTitle": "Não conseguimos carregar os teus emblemas",
  "badges.errorDescription":
    "Algo correu mal ao aceder ao teu reconhecimento. Tenta novamente daqui a pouco.",
  "badges.emptyTitle": "Ainda sem emblemas",
  "badges.emptyDescription":
    "Aparece, organiza e participa. Os teus primeiros emblemas surgem aqui à medida que avanças.",

  // ── Detalhe de XP ("o que rendeu XP") ───────────────────────────────────────
  "badges.xpBreakdown.heading": "O que <em>rendeu</em> XP",
  "badges.xpBreakdown.sub":
    "Todas as fontes de XP, ganhas ou ainda por ganhar.",
  "badges.xpBreakdown.progress": "{units} de {cap}",
  "badges.xpBreakdown.perUnitAmount": "+{xp} XP cada",
  "badges.xpBreakdown.sources.profile": "Perfil completo",
  "badges.xpBreakdown.sources.profileDesc": "Uma foto e uma bio no teu perfil.",
  "badges.xpBreakdown.sources.communities": "Comunidades a que te juntaste",
  "badges.xpBreakdown.sources.communitiesDesc": "Entrares numa comunidade.",
  "badges.xpBreakdown.sources.personas": "Personas publicadas",
  "badges.xpBreakdown.sources.personasDesc": "Publicares uma persona.",
  "badges.xpBreakdown.sources.vouches": "Avais que deste",
  "badges.xpBreakdown.sources.vouchesDesc": "Dares aval a outra pessoa.",
  "badges.xpBreakdown.sources.connections": "Ligações feitas",
  "badges.xpBreakdown.sources.connectionsDesc": "Ligares-te a outro membro.",
  "badges.xpBreakdown.sources.events": "Convívios em que participaste",
  "badges.xpBreakdown.sources.eventsDesc": "Participares num convívio.",
  "badges.xpBreakdown.sources.posts": "Publicações na comunidade",
  "badges.xpBreakdown.sources.postsDesc": "Publicares numa comunidade.",
  "badges.xpBreakdown.sources.endorsements": "Endossos recebidos",
  "badges.xpBreakdown.sources.endorsementsDesc":
    "Seres endossade por outro membro.",
  "badges.xpBreakdown.sources.tenure": "Dias na QueerPulse",
  "badges.xpBreakdown.sources.tenureDesc":
    "Fazeres parte da QueerPulse, dia a dia.",
  "badges.xpBreakdown.sources.verified": "Verificado",
  "badges.xpBreakdown.sources.verifiedDesc": "Verificares a tua conta.",
  "badges.xpBreakdown.sources.gettingStarted": "Passos dos primeiros dias",
  "badges.xpBreakdown.sources.gettingStartedDesc":
    "Concluíres um passo dos primeiros dias.",
  // ── O lado da contribuição (SUS-05): ver a nota no catálogo EN. ──
  "badges.xpBreakdown.sources.volunteering": "Sessões de voluntariado",
  "badges.xpBreakdown.sources.volunteeringDesc":
    "Uma sessão de voluntariado confirmada por quem publicou a oportunidade.",
  "badges.xpBreakdown.sources.hosting": "Convívios que organizaste",
  "badges.xpBreakdown.sources.hostingDesc":
    "Organizares ou coorganizares um convívio aberto.",
  "badges.xpBreakdown.sources.magazine": "Peças publicadas na revista",
  "badges.xpBreakdown.sources.magazineDesc":
    "Uma peça tua publicada na revista.",
  "badges.xpBreakdown.sources.answers": "Perguntas respondidas no diretório",
  "badges.xpBreakdown.sources.answersDesc":
    "Responderes a uma pergunta na ficha de um espaço do diretório.",
  "badges.xpBreakdown.sources.resources": "Recursos aprovados",
  "badges.xpBreakdown.sources.resourcesDesc":
    "Um recurso que sugeriste e que foi aprovado.",
  "badges.xpBreakdown.sources.badges": "Bónus de emblemas",
  "badges.xpBreakdown.sources.badgesDesc": "Os emblemas que já ganhaste.",
  "badges.xpBreakdown.sources.other": "Outro",
  "badges.xpBreakdown.sources.otherDesc": "Outra atividade na QueerPulse.",

  // ── Emblemas v2: hero + mostrador de nível ───────────────────────────────
  "badges.hero.levelWord": "Nível",
  "badges.hero.statEarnedLabel": "No espólio",
  "badges.hero.statRareLabel": "Mais raro",
  "badges.hero.statNearLabel": "Emblema mais próximo",
  "badges.hero.statNearAllEarned": "Todos eles",
  "badges.hero.statRareNone": "Ainda nenhum",
  // Era "Imprimir o teu espólio", mas o diálogo que abre não tem impressão,
  // exportação nem partilha: só um botão Fechar. Voltar ao nome antigo no dia
  // em que existir mesmo um ficheiro para levar.
  "badges.hero.viewCase": "Ver o teu espólio",
  "badges.hero.xpProgress": "{xp} / {xpMax} XP",
  "badges.hero.xpToNextName": "{xp} XP para <b>{nextName}</b>",
  "badges.hero.maxLevel": "Chegaste ao topo da escada.",
  "badges.hero.youAreHere": "Estás aqui",
  "badges.hero.seeAllLevels": "Ver os sete níveis",
  "badges.hero.toGo": "faltam {count}",

  // ── Emblemas v2: momento ("mais perto de ganhar") ────────────────────────
  "badges.momentum.eyebrow": "Impulso",
  "badges.momentum.heading": "Mais perto de <em>ganhar</em>",
  "badges.momentum.previewEarn": "Pré-visualizar o momento de ganhar",
  "badges.momentum.progress": "{units} de {target}",
  "badges.momentum.cannotBeChased": "Vem de outro membro",
  "badges.momentum.xpReward": "+{xp} XP",
  "badges.momentum.allEarnedDesc":
    "Tudo nas tuas categorias não silenciadas já foi ganho.",
  "badges.momentum.unmuteCategory": "Reativar uma categoria",
  "badges.momentum.fastestXp": "XP mais rápido",

  // ── Emblemas v2: o espólio (grelha + controlos) ──────────────────────────
  "badges.case.eyebrow": "O espólio",
  "badges.case.heading": "Os teus <em>emblemas</em>",
  "badges.case.sub": "{earned} ganhos · {remaining} ainda por aí",
  "badges.case.showLocked": "Mostrar bloqueados",
  "badges.case.notForMe": "Não é para mim",
  "badges.case.muteTitle": "Silenciar uma categoria",
  "badges.case.muteDesc":
    "As categorias silenciadas nunca te são sugeridas. Sem lembretes, sem contarem contra ti.",
  "badges.case.sortLabel": "Ordenar emblemas",
  "badges.case.sortClosest": "Mais próximos primeiro",
  "badges.case.sortRarest": "Mais raros primeiro",
  "badges.case.sortXp": "Mais XP",
  "badges.case.sortCategory": "Por categoria",
  "badges.case.filterAll": "Tudo",
  "badges.case.mutedNoteSingle":
    "{category} está silenciada. Nada dela te será sugerido.",
  "badges.case.mutedNotePlural":
    "{categories} estão silenciadas. Nada delas te será sugerido.",
  "badges.case.hiddenFlag": "Escondido",
  "badges.case.rarestFlag": "O mais raro do teu espólio",
  "badges.case.rarityCommon": "Comum",
  "badges.case.rarityRare": "Raro",
  "badges.case.rarityLegendary": "Lendário",
  "badges.case.emptyTitle": "Ainda nada no espólio.",
  "badges.case.emptyDesc":
    "É exatamente assim que deve ser na primeira semana. Alguns destes estão ao alcance sem saíres de casa. Os restantes chegam com o tempo.",

  // ── Emblemas v2: painel de detalhe ────────────────────────────────────────
  "badges.drawer.whatItTakes": "O que é preciso",
  "badges.drawer.rarity": "Raridade",
  "badges.drawer.worth": "Vale",
  "badges.drawer.checkedBy": "Verificado por",
  "badges.drawer.checkedBySystem": "Sistema",
  "badges.drawer.checkedByHost": "Anfitrião",
  "badges.drawer.checkedByPerson": "Uma pessoa",
  "badges.drawer.checkedByMember": "Um membro",
  "badges.drawer.howCheckedHeading": "Como é verificado",
  "badges.drawer.verifyAutoTitle": "Contado automaticamente",
  "badges.drawer.verifyAutoBody":
    "Contado automaticamente a partir da tua própria atividade. Nada é registado que já não seja teu.",
  "badges.drawer.verifyHostTitle": "Confirmado à porta",
  "badges.drawer.verifyHostBody":
    "Confirmado pelo anfitrião que te regista à entrada.",
  "badges.drawer.verifyReviewTitle": "Lido por uma pessoa",
  "badges.drawer.verifyReviewBody":
    "Alguém da equipa da comunidade lê antes de contar. Essa demora é propositada.",
  "badges.drawer.verifyPeerTitle": "Dado nas palavras de outra pessoa",
  "badges.drawer.verifyPeerBody":
    "Dado por outro membro, nas próprias palavras. Não pode ser pedido, comprado nem forçado.",
  "badges.drawer.noteHeading": "A tua nota sobre este",
  "badges.drawer.notePlaceholder":
    "Uma linha para ti. O que foi isto, realmente?",
  "badges.drawer.noteHelp": "Só tu vês isto.",
  "badges.drawer.visibleOnProfile": "Visível no teu perfil",
  "badges.drawer.privateToYou": "Privado, só para ti",
  "badges.drawer.visibilityNote":
    "Se o esconderes, os outros membros deixam de o ver no teu perfil. Fica sempre aqui para ti.",
  "badges.drawer.visibilityErrorToast":
    "Não conseguimos mudar a visibilidade desse emblema. Tenta novamente daqui a pouco.",
  "badges.drawer.earnedThisWeek": "esta semana",
  "badges.drawer.progressCount": "{units} de {target} feitos",
  "badges.drawer.previous": "Emblema anterior",
  "badges.drawer.next": "Próximo emblema",
  "badges.drawer.count": "{index} de {total}",
  "badges.drawer.seasonalTag": "Sazonal",
  "badges.drawer.close": "Fechar",

  // ── Emblemas v2: faixa sazonal ────────────────────────────────────────────
  "badges.seasonal.eyebrow": "Sazonal",
  "badges.seasonal.heading": "Só <em>este ano</em>",
  "badges.seasonal.sub":
    "Emblemas que não voltam a poder ser ganhos depois de fechada a janela. Expiram, mas a memória fica.",

  // ── Emblemas v2: escada ────────────────────────────────────────────────────
  "badges.ladderV2.eyebrow": "A escada",
  "badges.ladderV2.heading": "O que cada nível <em>desbloqueia</em>",
  "badges.ladderV2.sub":
    "Quase tudo o que o QueerPulse oferece está aberto desde o Nível 1. Estes degraus mostram o que cada nível acrescenta a isso, e nada que não esteja construído.",
  "badges.ladderV2.passed": "Ultrapassado",
  "badges.ladderV2.ahead": "Por vir",
  "badges.ladderV2.beyondTitle": "Depois de {name}",
  "badges.ladderV2.beyondBody": "A escada acaba. A comunidade, não.",

  // ── Emblemas v2: extrato de XP ────────────────────────────────────────────
  "badges.ledger.eyebrow": "Extrato",
  "badges.ledger.heading": "De onde vieram os <em>pontos</em>",
  "badges.ledger.subWithCount":
    "{count} eventos. O teu nível deriva desta lista, nunca é guardado à parte.",
  "badges.ledger.subEmpty":
    "O teu nível deriva desta lista, nunca é guardado à parte.",
  "badges.ledger.sparkXp": "{xp} XP",
  "badges.ledger.sparkAriaLabel": "XP ao longo do tempo, a terminar em {xp} XP",
  "badges.ledger.colDate": "Data",
  "badges.ledger.colWhat": "O que aconteceu",
  "badges.ledger.colXp": "XP",
  "badges.ledger.colTotal": "Total",
  "badges.ledger.showAll": "Mostrar todos os {count} eventos",
  "badges.ledger.showLess": "Mostrar menos",
  "badges.ledger.emptyTitle": "Ainda sem histórico.",
  "badges.ledger.emptyBody":
    "Cada ponto fica aqui com uma data e uma descrição, para veres sempre de onde veio o teu nível.",
  "badges.ledger.integrityHeading": "Porque podes confiar nisto",
  "badges.ledger.integrity1Title": "Contado a partir do que já fizeste.",
  "badges.ledger.integrity1Body":
    "As presenças vêm da tua própria confirmação num encontro que já começou. Não há nada extra para entregar.",
  "badges.ledger.integrity2Title": "Cada ponto tem uma linha.",
  "badges.ledger.integrity2Body":
    "Cada aumento entra nesta lista com data e descrição, para o total poder ser conferido com ela.",
  "badges.ledger.integrity3Title": "Os pontos nunca são retirados.",
  "badges.ledger.integrity3Body":
    "O teu total só sobe. Um aval retirado ou uma publicação apagada deixam-no onde estava.",
  "badges.ledger.integrity4Title": "Escolhes o que se vê.",
  "badges.ledger.integrity4Body":
    "Qualquer emblema que ganhes pode ser escondido do teu perfil, um a um. Um emblema escondido fica nesta página para ti.",
  "badges.ledger.integrity5Title": "Sem tabela de classificação.",
  "badges.ledger.integrity5Body":
    "Os membros nunca são comparados entre si. A raridade descreve o próprio emblema.",
  "badges.ledger.footnoteCount":
    "{badges} emblemas · {levels} níveis · um extrato que podes auditar.",
  "badges.ledger.footnoteContact":
    "Algo parece errado? Fala com a equipa da comunidade.",

  // ── Emblemas v2: momento de ganhar + cartão do espólio ────────────────────
  "badges.earn.kickerBadge": "Emblema ganho",
  "badges.earn.kickerGiven": "Recebeste isto",
  "badges.earn.body":
    "São +{xp} XP, e são teus quer decidas mostrá-los ou não.",
  "badges.earn.putInCase": "Guardar no espólio",
  "badges.earn.footnote":
    "Nível {level} · {name} · privado até dizeres o contrário",
  "badges.caseCard.title": "O teu espólio",
  "badges.caseCard.subtitle": "QueerPulse · Lisboa",
  "badges.caseCard.emptyDesc": "Um espólio vazio. Volta daqui a um mês.",
  "badges.caseCard.footStats": "{count} emblemas · {xp} XP",
  "badges.caseCard.close": "Fechar",

  // ── Chrome da página de vantagens (PerksPage, PerksSections) ───────────────
  "perks.page.backToBadges": "Emblemas e nível",
  "perks.page.title": "As tuas <em>vantagens</em>",
  "perks.page.availableToRedeem_one":
    "{count} vantagem disponível para resgatar",
  "perks.page.availableToRedeem_other":
    "{count} vantagens disponíveis para resgatar",
  "perks.page.loading": "A carregar as tuas vantagens…",
  "perks.page.errorTitle": "Não conseguimos carregar as tuas vantagens",
  "perks.page.errorDescription":
    "Algo correu mal ao aceder ao teu reconhecimento. Tenta novamente daqui a pouco.",
  "perks.page.emptyTitle": "Ainda sem vantagens",
  "perks.page.emptyDescription":
    "Sobe de nível e os teus benefícios de membro aparecem aqui para resgatar.",
  "perks.sidebar.yourLevelTitle": "O teu nível",
  "perks.sidebar.xpSummary":
    "{xp} / {xpMax} XP · {xpToNext} para o Nível {nextLevel}",
  "perks.sidebar.nextUnlockNote":
    "O teu próximo degrau é o <strong>Nível {nextLevel} · {nextName}</strong>. O que ele abre está listado na escada.",
  "perks.sidebar.seeAllBadgesCta": "Ver todos os emblemas e níveis",
  "perks.sidebar.explainedTitle": "Vantagens explicadas",
  "perks.sidebar.suggestTitle": "Sugerir uma vantagem",
  "perks.sidebar.suggestPlaceholder": "Partilha uma ideia…",
  "perks.sidebar.sendSuggestionCta": "Enviar sugestão",
  "perks.sidebar.suggestUnavailableToast":
    "As sugestões de vantagens ainda não estão abertas. Obrigade pela paciência.",
  "perks.claim.alreadyActive": "Já ativo",
  "perks.claim.active": "Ativo",
  "perks.claim.claimed": "Resgatado",
  "perks.claim.claiming": "A resgatar…",
  "perks.claim.errorToast":
    "Não conseguimos resgatar essa vantagem. Tenta novamente daqui a pouco.",

  // ── A tua rede (ProfileNetworkStats + NetworkListModal) — só do dono ─────────
  "network.title": "A tua rede",
  "network.group.connected": "Ligações",
  "network.group.vouchedGiven": "Votos de confiança que deste",
  "network.group.vouchedReceived": "Votos de confiança que recebeste",
  "network.row.connected": "ligade {time}",
  "network.row.connectedNoTime": "ligade",
  "network.row.vouchedGiven": "deste um voto de confiança {time}",
  "network.row.vouchedGivenNoTime": "deste um voto de confiança",
  "network.row.vouchedReceived": "deu-te um voto de confiança {time}",
  "network.row.vouchedReceivedNoTime": "deu-te um voto de confiança",
  "network.viewAllAria": "Ver todas as {count} em {group}",
  "network.modalSub_one": "{count} pessoa",
  "network.modalSub_other": "{count} pessoas",
  "network.searchPlaceholder": "Procurar por nome",
  "network.searchAria": "Procurar nesta lista por nome",
  "network.noMatches": "Ninguém aqui corresponde a “{query}”.",

  // ── Painel "Quem vê o quê" (WhoSeesWhatSheet + Presets/FieldToggles/Identities/HiddenFrom/Reports/NameChange) ──
  "profile.whoSeesWhat.title": "Quem vê o quê",

  "profile.whoSeesWhat.presets.heading": "Predefinições rápidas",
  "profile.whoSeesWhat.presets.sub":
    "Um toque define a tua foto, bairro, votos de confiança e o que procuras, tudo junto.",
  "profile.whoSeesWhat.presets.findable.label": "Encontrável",
  "profile.whoSeesWhat.presets.findable.desc":
    "Foto, bairro, votos de confiança e o que procuras ficam todos visíveis.",
  "profile.whoSeesWhat.presets.careful.label": "Reservado",
  "profile.whoSeesWhat.presets.careful.desc":
    "A foto e o bairro ficam privados. Os votos de confiança e o que procuras continuam visíveis.",
  "profile.whoSeesWhat.presets.closed.label": "Fechado",
  "profile.whoSeesWhat.presets.closed.desc":
    "Foto, bairro, votos de confiança e o que procuras ficam todos privados.",

  "profile.whoSeesWhat.activity.heading": "Há quanto tempo estiveste por cá",
  "profile.whoSeesWhat.activity.sub":
    "Os outros membros conseguem ver mais ou menos há quanto tempo estiveste por cá. Guardamos o mês e nada mais preciso: sem datas, sem horas, sem um ponto a dizer que estás online agora.",
  "profile.whoSeesWhat.activity.hideLabel": "Esconder isto dos outros membros",
  "profile.whoSeesWhat.activity.hideDesc":
    "Desliga a linha para toda a gente e tira-te da ordenação Ativos recentemente. Continuas a vê-la aqui.",
  "profile.whoSeesWhat.activity.current":
    "Neste momento apareces como: {band}.",
  "profile.whoSeesWhat.activity.none":
    "Ainda não há nada registado, por isso o teu perfil não mostra linha nenhuma.",
  "profile.whoSeesWhat.activity.error":
    "Não foi possível guardar. Tenta outra vez.",
  "profile.whoSeesWhat.activity.demo":
    "Isto é a demonstração. Inicia sessão para mudares a definição a sério.",
  "profile.whoSeesWhat.fields.heading": "Controlos instantâneos",
  "profile.whoSeesWhat.fields.sub": "Cada um destes produz efeito de imediato.",
  "profile.whoSeesWhat.fields.photo.label": "Foto",
  "profile.whoSeesWhat.fields.photo.desc":
    "Mostra a tua foto no perfil e no cartão do diretório.",
  "profile.whoSeesWhat.fields.hood.label": "Bairro",
  "profile.whoSeesWhat.fields.hood.desc":
    "Mostra em que bairro de Lisboa estás.",
  "profile.whoSeesWhat.fields.vouchers.label": "Votos de confiança",
  "profile.whoSeesWhat.fields.vouchers.desc":
    "Mostra quem te deu um voto de confiança.",
  "profile.whoSeesWhat.fields.intent.label": "O que procuras",
  "profile.whoSeesWhat.fields.intent.desc":
    "Mostra o que procuras no teu perfil.",

  "profile.whoSeesWhat.identities.heading": "Identidades",
  "profile.whoSeesWhat.identities.sub":
    "Escolhe que identidades tuas aparecem na pesquisa e no diretório.",
  "profile.whoSeesWhat.identities.empty":
    "Ainda não adicionaste nenhuma identidade.",
  "profile.whoSeesWhat.identities.emptyLink": "Adicionar identidades",

  "profile.whoSeesWhat.hiddenFrom.heading": "Escondido de",
  "profile.whoSeesWhat.hiddenFrom.sub":
    "O teu perfil fica invisível para quem estiver nesta lista, mesmo que estejam ligados a ti.",
  "profile.whoSeesWhat.hiddenFrom.demoNote":
    "Esta é uma conta de demonstração, por isso esconder o teu perfil de alguém não está simulado aqui.",
  "profile.whoSeesWhat.hiddenFrom.empty":
    "Ainda não escondeste o teu perfil de ninguém.",
  "profile.whoSeesWhat.hiddenFrom.addButton": "Esconder de alguém",
  "profile.whoSeesWhat.hiddenFrom.remove": "Remover",
  "profile.whoSeesWhat.hiddenFrom.removeAria": "Remover {name}",
  "profile.whoSeesWhat.hiddenFrom.pickerTitle": "Esconder o teu perfil de",
  "profile.whoSeesWhat.hiddenFrom.pickerSearchPlaceholder": "Procurar por nome",
  "profile.whoSeesWhat.hiddenFrom.pickerNoResults":
    "Ninguém com esse nome. Experimenta escrever de outra forma.",
  "profile.whoSeesWhat.hiddenFrom.pickerLoadMore": "Mostrar mais pessoas",
  "profile.whoSeesWhat.hiddenFrom.pickerLoadingMore": "A carregar…",
  "profile.whoSeesWhat.hiddenFrom.toast.hidden":
    "Escondido. Essa pessoa deixa de ver o teu perfil.",
  "profile.whoSeesWhat.hiddenFrom.toast.unhidden":
    "Já não está escondido. Essa pessoa volta a ver o teu perfil.",
  "profile.whoSeesWhat.hiddenFrom.toast.error":
    "Algo correu mal. Tenta novamente.",

  "profile.whoSeesWhat.reports.heading": "Denúncias que fizeste",
  "profile.whoSeesWhat.reports.sub":
    "Um registo do que denunciaste e em que ponto está.",
  "profile.whoSeesWhat.reports.filedTemplate": "Feita {time}",
  "profile.whoSeesWhat.reports.empty": "Ainda não fizeste nenhuma denúncia.",
  "profile.whoSeesWhat.reports.error":
    "Não conseguimos carregar as tuas denúncias.",
  "profile.whoSeesWhat.reports.status.open": "Em aberto",
  "profile.whoSeesWhat.reports.status.resolved": "Resolvida",
  "profile.whoSeesWhat.reports.status.escalated": "Escalada",

  "profile.whoSeesWhat.nameChange.heading": "O teu nome de utilizador",
  "profile.whoSeesWhat.nameChange.sub":
    "O teu nome de utilizador é @{handle}. Muda-o quando quiseres.",
  "profile.whoSeesWhat.nameChange.button": "Mudar o nome de utilizador",

  "profile.whoSeesWhat.toast.saved": "Guardado.",
  "profile.whoSeesWhat.toast.error":
    "Não foi possível guardar. Tenta novamente.",

  // ── Painel "Os teus dados" (AccountDataSheet + Export/StepAway/Dsar) ────────
  "profile.accountData.title": "Os teus dados",

  "profile.accountData.export.title": "Descarregar os teus dados",
  "profile.accountData.export.intro":
    "Pede uma cópia de tudo o que a QueerPulse guarda sobre ti. Vamos preparar o ficheiro em segundo plano, e isto pode demorar alguns minutos.",
  "profile.accountData.export.cta": "Pedir exportação",
  "profile.accountData.export.requesting": "A pedir…",
  "profile.accountData.export.status.queued": "Em fila",
  "profile.accountData.export.status.processing": "A preparar",
  "profile.accountData.export.status.ready": "Pronto",
  "profile.accountData.export.status.failed": "Falhou",
  "profile.accountData.export.status.expired": "Expirado",
  "profile.accountData.export.statusNote":
    "Estamos a preparar o teu ficheiro. Esta página atualiza-se sozinha, sem precisares de recarregar.",
  "profile.accountData.export.downloadCta": "Descarregar ficheiro",
  "profile.accountData.export.expiresNote": "Este link expira a {date}.",
  "profile.accountData.export.retryCta": "Tentar novamente",
  "profile.accountData.export.toast.startError":
    "Não conseguimos iniciar a tua exportação. Tenta novamente.",

  "profile.accountData.stepAway.title": "Afastar-te",
  "profile.accountData.stepAway.hide.title": "Ocultar-me",
  "profile.accountData.stepAway.hide.body":
    "O teu perfil torna-se invisível e deixas de receber notificações. É totalmente reversível: volta a iniciar sessão quando quiseres reativá-la. Enquanto oculte, as outras pessoas veem-te listade como membro desativade.",
  "profile.accountData.stepAway.hide.cta": "Ocultar-me",
  "profile.accountData.stepAway.hide.confirm.title": "Ocultar o teu perfil?",
  "profile.accountData.stepAway.hide.confirm.body":
    "Vais ser desligade e o teu perfil fica oculto de imediato. Volta a iniciar sessão quando quiseres. Nada é eliminado.",
  "profile.accountData.stepAway.hide.confirm.cta": "Sim, oculta-me",
  "profile.accountData.stepAway.erase.title": "Apagar-me",
  "profile.accountData.stepAway.erase.body":
    "Elimina permanentemente a tua conta. Há um período de carência de 30 dias para mudares de ideias antes de a eliminação se tornar irreversível.",
  "profile.accountData.stepAway.erase.blockedByDependencies":
    "Há ainda algumas coisas que dependem de ti antes de podermos eliminar a tua conta:",
  "profile.accountData.stepAway.erase.cta": "Apagar-me",
  "profile.accountData.stepAway.erase.disabledHint":
    "Transfere ou fecha tudo o que está listado acima e o botão Apagar-me fica disponível.",
  "profile.accountData.stepAway.erase.confirm.title":
    "Pedir a eliminação da conta?",
  "profile.accountData.stepAway.erase.confirm.body":
    "Isto inicia um período de carência de 30 dias. O teu perfil em {profile} desaparece já, vais ser desligade, e tudo é permanentemente eliminado ao fim dos 30 dias, a não ser que canceles primeiro.",
  "profile.accountData.stepAway.erase.confirm.cta": "Pedir eliminação",
  "profile.accountData.stepAway.erase.confirm.reasonLabel":
    "Diz-nos porquê, se quiseres (opcional)",
  "profile.accountData.stepAway.erase.confirm.reasonPlaceholder":
    "Opcional, e ajuda-nos a melhorar",
  "profile.accountData.stepAway.dependency.transferCta": "Transferir",
  "profile.accountData.stepAway.dependency.closeCta": "Fechar anúncio",
  "profile.accountData.stepAway.dependency.closeConfirm.title":
    "Fechar “{name}”?",
  "profile.accountData.stepAway.dependency.closeConfirm.body":
    "Isto retira o anúncio do diretório. Deixa de ficar visível para qualquer pessoa.",
  "profile.accountData.stepAway.dependency.closedToast": "Anúncio fechado.",
  "profile.accountData.stepAway.pending.banner":
    "<strong>A tua conta está agendada para eliminação.</strong> Está tudo oculto agora e será permanentemente apagado a <strong>{date}</strong>. Mudaste de ideias? Ainda podes cancelar.",
  "profile.accountData.stepAway.pending.cancelling": "A cancelar…",
  "profile.accountData.stepAway.pending.cancelCta": "Cancelar eliminação",
  "profile.accountData.stepAway.pending.cancelledToast":
    "Eliminação cancelada. Bem-vinde de volta.",
  "profile.accountData.stepAway.pending.cancelErrorToast":
    "Não conseguimos cancelar isso. Tenta novamente.",
  "profile.accountData.stepAway.toast.actionError":
    "Algo correu mal. Tenta novamente.",

  "profile.accountData.dsar.article.access": "Acesso (Art. 15.º)",
  "profile.accountData.dsar.article.rectification": "Retificação (Art. 16.º)",
  "profile.accountData.dsar.article.erasure": "Apagamento (Art. 17.º)",
  "profile.accountData.dsar.article.objection": "Oposição (Art. 21.º)",
  "profile.accountData.dsar.title": "Pedir outra coisa",
  "profile.accountData.dsar.intro":
    "Acede, corrige ou opõe-te ao uso dos teus dados: tudo o que fica para além do que Descarregar e Apagar já cobrem.",
  "profile.accountData.dsar.articleGroupLabel": "Qual direito?",
  "profile.accountData.dsar.detailsLabel": "De que precisas?",
  "profile.accountData.dsar.detailsPlaceholder":
    "Descreve o que gostarias que fizéssemos",
  "profile.accountData.dsar.submitting": "A enviar…",
  "profile.accountData.dsar.submitCta": "Enviar pedido",
  "profile.accountData.dsar.pastTitle": "Pedidos anteriores",
  "profile.accountData.dsar.pastHint":
    "Respondemos a cada pedido com uma notificação no QueerPulse, e o estado aqui é atualizado quando o fizermos.",
  "profile.accountData.dsar.pastLoading": "A carregar os teus pedidos…",
  "profile.accountData.dsar.pastError":
    "Não conseguimos carregar os teus pedidos anteriores.",
  "profile.accountData.dsar.pastEmpty": "Ainda não fizeste nenhum pedido.",
  "profile.accountData.dsar.pastRowDueBy": "Resposta até {date}",
  "profile.accountData.dsar.toast.submitted":
    "Pedido recebido, referência {ref}. Respondemos com uma notificação no QueerPulse até {date}.",
  "profile.accountData.dsar.toast.submitError":
    "Não conseguimos enviar esse pedido. Tenta novamente.",

  // --- Listas de guardados (SOC-12) ----------------------------------------
  // Mesmo conjunto de chaves do catálogo EN. A frase que avisa que o link é
  // público aparece antes de o link existir, tal como no EN.
  "savedLists.header.eyebrow": "Os teus guardados",
  "savedLists.header.title": "Listas que vale a pena <em>passar adiante</em>",
  "savedLists.header.lead":
    "Tudo o que guardas fica numa lista. Cria outras pelas razões por que guardaste as coisas: um primeiro encontro, um sítio aberto até tarde, as clínicas que indicarias a uma amiga.",
  "savedLists.header.newCta": "Nova lista",

  "savedLists.empty.title": "Ainda não guardaste nada",
  "savedLists.empty.description":
    "Guarda um artigo, um sítio ou um encontro e aparece aqui. Podes agrupar os teus guardados em listas quando quiseres.",

  "savedLists.newCard.title": "Nova lista",
  "savedLists.newCard.subtitle":
    "Agrupa guardados pela razão por que os guardaste",

  "savedLists.card.meta_one": "1 coisa · atualizada {time}",
  "savedLists.card.meta_other": "{count} coisas · atualizada {time}",

  "savedLists.state.private": "Privada",
  "savedLists.state.shared": "Link ativo",

  "savedLists.recent.heading": "Guardados recentemente",
  "savedLists.recent.count_one": "1 guardado",
  "savedLists.recent.count_other": "{count} guardados",
  "savedLists.recent.fileCta": "Adicionar a uma lista",

  "savedLists.new.eyebrow": "Nova lista",
  "savedLists.new.title": "Dá um nome à tua lista",
  "savedLists.new.nameLabel": "Nome da lista",
  "savedLists.new.namePlaceholder": "Saúde trans-friendly",
  "savedLists.new.privateNote":
    "As listas novas são privadas. Podes criar um link de partilha mais tarde, dentro da lista.",
  "savedLists.new.cancel": "Cancelar",
  "savedLists.new.submit": "Criar lista",

  "savedLists.file.eyebrow": "Adicionar a uma lista",
  "savedLists.file.title": "Que lista?",
  "savedLists.file.cancel": "Cancelar",
  "savedLists.file.filing": "A adicionar…",
  "savedLists.file.empty":
    "Ainda não tens listas. Cria uma e este guardado vai direto para lá.",
  "savedLists.file.success.title": "Adicionado",
  "savedLists.file.success.body":
    "Já está em {name}, e continua nos teus guardados.",
  "savedLists.file.success.done": "Concluído",

  "savedLists.detail.rename": "Mudar o nome",
  "savedLists.detail.renameLabel": "Nome da lista",
  "savedLists.detail.renameSave": "Guardar",
  "savedLists.detail.renameCancel": "Cancelar",
  "savedLists.detail.removeItem": "Tirar {title} desta lista",
  "savedLists.detail.delete": "Apagar lista",
  "savedLists.detail.close": "Fechar",
  "savedLists.detail.empty": "Ainda não há nada nesta lista.",
  "savedLists.detail.defaultNote":
    "Esta lista tem tudo o que guardaste. Para tirar alguma coisa daqui, deixa de a guardar.",
  "savedLists.detail.deleteConfirm.title": "Apagar {name}?",
  "savedLists.detail.deleteConfirm.body":
    "A lista desaparece. Tudo o que está nela continua guardado, e continua em qualquer outra lista onde o tenhas posto. Qualquer link de partilha desta lista deixa de funcionar.",
  "savedLists.detail.deleteConfirm.cta": "Apagar lista",

  "savedLists.share.private.heading": "Esta lista é privada",
  "savedLists.share.private.body":
    "Só tu a vês. Se quiseres passá-la a alguém, podes criar um link.",
  "savedLists.share.private.warning":
    "Qualquer pessoa com o link consegue abrir esta lista. Não há palavra-passe nem início de sessão, por isso o link é a chave: envia-o só a quem confias com ele.",
  "savedLists.share.private.cta": "Criar link de partilha",
  "savedLists.share.points.noAccount":
    "Não precisam de conta na QueerPulse para a ler.",
  "savedLists.share.points.anonymous":
    "Veem o nome da lista e o que está nela. Não veem o teu nome, o teu perfil nem a tua foto.",
  "savedLists.share.points.revocable":
    "Podes desligar o link a qualquer momento. Todas as cópias dele deixam de funcionar de imediato.",

  "savedLists.share.live.heading":
    "Qualquer pessoa com este link consegue abri-lo",
  "savedLists.share.live.body":
    "O link funciona sem conta. Mostra o nome da lista e o que está nela, e nada sobre ti.",
  "savedLists.share.live.fieldLabel": "Link de partilha desta lista",
  "savedLists.share.live.copy": "Copiar",
  "savedLists.share.live.copied": "Copiado",
  "savedLists.share.live.copiedToast": "Link copiado",
  "savedLists.share.live.copyErrorToast": "Não foi possível copiar o link",
  "savedLists.share.live.revoke": "Desligar o link",
  "savedLists.share.live.since": "Ativo desde {time}",

  "savedLists.shared.metaTitle": "Uma lista partilhada",
  "savedLists.shared.loading": "A abrir a lista…",
  "savedLists.shared.eyebrow": "Partilhada contigo",
  "savedLists.shared.count_one": "1 coisa",
  "savedLists.shared.count_other": "{count} coisas",
  "savedLists.shared.note":
    "Alguém fez esta lista na QueerPulse e enviou-te o link. Pode desligá-lo quando quiser, e esta página deixa de funcionar quando o fizer.",
  "savedLists.shared.gone.title": "Esta lista não está disponível",
  "savedLists.shared.gone.body":
    "O link pode ter sido desligado, ou pode nunca ter sido real. Pede um link novo a quem to enviou.",

  "savedLists.toast.created": "Lista criada",
  "savedLists.toast.createError": "Não foi possível criar a lista",
  "savedLists.toast.renamed": "Nome da lista alterado",
  "savedLists.toast.renameError": "Não foi possível mudar o nome da lista",
  "savedLists.toast.deleted": "Lista apagada",
  "savedLists.toast.deleteError": "Não foi possível apagar a lista",
  "savedLists.toast.shared": "Link de partilha criado",
  "savedLists.toast.shareError": "Não foi possível criar o link",
  "savedLists.toast.revoked": "Link desligado",
  "savedLists.toast.revokeError": "Não foi possível desligar o link",
  "savedLists.toast.fileError": "Não foi possível adicionar a essa lista",
  "savedLists.toast.unfiled": "Tirado da lista",
  "savedLists.toast.unfileError": "Não foi possível tirar da lista",
};
