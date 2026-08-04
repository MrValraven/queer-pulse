import type { Catalog } from "../../types";

/** Subperfis — pt-PT inclusivo. Mesmas chaves que `en/subprofiles.ts`. */
export const subprofiles: Catalog = {
  // Diretório (SubprofileDirectoryPage)
  "directory.eyebrow": "Diretório · personas",
  "directory.subtitle":
    "Personas profissionais pseudónimas de toda a comunidade. Sem rankings, sem algoritmo — só o trabalho.",
  "directory.searchPlaceholder": "Pesquisar personas",
  "directory.searchAria": "Pesquisar personas",
  "directory.filterLabel": "Filtrar por ofício",
  "directory.filterAll": "Tudo",
  "directory.loading": "A carregar personas…",
  "directory.empty.title": "Ainda não há personas aqui",
  "directory.empty.description":
    "Nada corresponde a isto por agora. Experimenta outro ofício ou limpa a pesquisa para veres toda a gente.",
  "directory.empty.clear": "Limpar filtros",
  "directory.error.title": "Não conseguimos carregar o diretório",
  "directory.error.description":
    "Algo correu mal ao contactar o servidor. Isto não é um diretório vazio — tenta novamente daqui a pouco.",
  "directory.error.retry": "Tentar novamente",
  "directory.openToCollabsChip": "Aberto a colaborações",
  "directory.tagFilterHeading": "Tags",
  "directory.tagFilterLabel": "Filtrar por tag",

  // Afinidades do cartão do diretório (SubprofileCard)
  "card.openToCollabs": "Aberto a colaborar",
  "card.linkCount_one": "{count} link",
  "card.linkCount_other": "{count} links",
  "card.view": "Ver",

  // Bloco "Também como…" no perfil principal (ProfileSubprofilesSection)
  "alsoAs.title": "Também a trabalhar como",
  "alsoAs.subtitlePublic": "Personas profissionais ligadas a este perfil.",
  "alsoAs.subtitleSelf": "As personas profissionais que ligaste aqui.",
  "alsoAs.subtitleEmpty": "Outro lado do teu trabalho pode viver aqui.",
  "alsoAs.viewPersona": "Visitar",
  "alsoAs.switchLabel": "Outros lados",
  "alsoAs.previewLabel": "Ver outro lado",
  "alsoAs.count_one": "{count} lado",
  "alsoAs.count_other": "{count} lados",
  "alsoAs.announce": "A mostrar {name}",
  "alsoAs.featuredEyebrow": "Destaque",
  "alsoAs.addAnother": "Adicionar outro lado",
  "alsoAs.edit": "Editar",
  "alsoAs.moveUp": "Mover para cima",
  "alsoAs.moveDown": "Mover para baixo",
  "alsoAs.expandCard": "Ver detalhes",
  "alsoAs.filterLabel": "Filtrar por ofício",
  "alsoAs.filterAll": "Todas",
  "alsoAs.showAll": "Ver todas (mais {count})",
  "alsoAs.showFewer": "Ver menos",
  "alsoAs.empty.title": "Mostra mais do que <em>fazes</em>",
  "alsoAs.empty.description":
    "A tua música, o teu código, a tua escrita — ligado aqui ou por si só.",
  "alsoAs.empty.cta": "Criar um subperfil",

  // Navegação + paleta de comandos
  "nav.browse": "Subperfis",
  "nav.mine": "Subperfis",
  "command.mine.name": "Os meus subperfis",
  "command.mine.sub": "As tuas personas profissionais",
  "command.browse.name": "Explorar subperfis",
  "command.browse.sub": "O diretório de personas",

  // Título do diretório (SubprofileDirectoryPage) — o <em> a coral ficou como
  // JSX em bruto antes de existir o <Translation>; agora passa por ele.
  "directory.title": "As muitas formas de <em>criar</em>",

  // Rótulos de ofício — `kind` é um campo PERSISTIDO (guardado no subperfil),
  // por isso usa indireção por chave: o id canónico em inglês
  // (developer/writer/…) nunca muda, só a etiqueta apresentada. Em vez de
  // género gramatical numa profissão (evitando "programador/a" etc.), cada
  // etiqueta nomeia o ofício, não a pessoa.
  "kind.developer": "Programação",
  "kind.writer": "Escrita",
  "kind.musician": "Música",
  "kind.visual_artist": "Arte visual",
  "kind.filmmaker": "Realização",
  "kind.designer": "Design",
  "kind.maker": "Maker",
  "kind.drag": "Arte drag",
  "kind.dj": "DJ",
  "kind.dancer": "Dança",
  "kind.performer": "Performance",
  "kind.photographer": "Fotografia",
  "kind.videomaker": "Videografia",
  "kind.chef": "Cozinha",
  "kind.mixologist": "Coquetelaria",
  "kind.therapist": "Terapia",
  "kind.generic": "Generalista",

  // Rótulos de secção — `section` também é persistido (SubprofileItemDTO.section).
  "section.projects": "Projetos",
  "section.open_source": "Código aberto",
  "section.publications": "Publicações",
  "section.readings": "Leituras",
  "section.discography": "Discografia",
  "section.gigs": "Concertos",
  "section.portfolio": "Portefólio",
  "section.exhibitions": "Exposições",
  "section.filmography": "Filmografia",
  "section.screenings": "Exibições",
  "section.selected_work": "Trabalho selecionado",
  "section.clients": "Clientes",
  "section.collections": "Coleções",
  "section.workshops": "Oficinas",
  "section.shows": "Espetáculos",
  "section.looks": "Looks",
  "section.mixes": "Sets",
  "section.performances": "Atuações",
  "section.reel": "Reel",
  "section.appearances": "Aparições",
  "section.series": "Séries",
  "section.videos": "Vídeos",
  "section.menus": "Menus",
  "section.residencies": "Residências",
  "section.cocktails": "Cocktails",
  "section.specialisms": "Especialidades",
  "section.credentials": "Credenciais",
  "section.showcase": "Mostra",
  "section.links": "Links",

  // Estado / visibilidade de ligação — também campos persistidos.
  "status.draft": "Rascunho",
  "status.published": "Publicado",
  "link.linked": "Ligado",
  "link.standalone": "Autónomo",
  "link.help.linked":
    "Aparece no teu perfil principal como outro lado teu — as pessoas conseguem ver que é a mesma pessoa.",
  "link.help.unlinked":
    "Existe por si só, sem ligação visível ao teu perfil principal. Ganha um identificador público assim que passa a verificação de completude.",

  // Opções de visibilidade (SubprofileMetaForm) — campo `visibility` persistido.
  "visibility.open.label": "Aberto a todas as pessoas",
  "visibility.open.help":
    "Qualquer pessoa da comunidade pode encontrar e ver esta persona.",
  "visibility.network.label": "A tua rede",
  "visibility.network.help": "Só quem está na tua rede consegue vê-la.",
  "visibility.private.label": "Só tu",
  "visibility.private.help":
    "Guardada só para ti, enquanto a vais construindo.",

  // Presença — cores de destaque (SubprofilePresenceFields) e estado de
  // disponibilidade (SubprofileAvailability, SubprofileCard,
  // SubprofilePresenceFields) — também campos persistidos.
  "accent.plum": "Ameixa",
  "accent.coral": "Coral",
  "accent.jade": "Jade",
  "accent.amber": "Âmbar",
  "accent.violet": "Violeta",
  "availability.openToCollabs": "Aberto a colaborações",
  "availability.booking": "A aceitar marcações",
  "availability.notAvailable": "Sem disponibilidade agora",

  // Rótulos/placeholders dos campos do editor de itens (SubprofileItemEditor)
  "field.title.label": "Título",
  "field.title.placeholder": "Como se chama?",
  "field.subtitle.label": "Subtítulo",
  "field.subtitle.placeholder": "Uma etiqueta, local ou editora",
  "field.description.label": "Descrição",
  "field.description.placeholder": "Uma ou duas frases",
  "field.url.label": "Link",
  "field.url.placeholder": "https://",
  "field.date.label": "Data",
  "field.date.placeholder": "por ex. 2025",
  "field.meta.label": "Detalhe",
  "field.meta.placeholder": "Uma nota breve",
  "field.tags.label": "Tags",
  "field.tags.placeholder": "por ex. React, TypeScript",

  // Lista de requisitos de publicação (PublishChecklist + publishChecklist.data.ts)
  "checklist.title": "Quase <em>lá</em>",
  "checklist.ledeUnknown":
    "Ainda não conseguimos publicar isto. Percorre estes pontos e tenta outra vez.",
  "checklist.ledeDefault":
    "Ainda faltam alguns pormenores para esta persona poder existir por si só.",
  "checklist.statePass": "Feito",
  "checklist.stateFail": "Precisa de atenção",
  "checklist.stateUnknown": "Por verificar",
  "checklist.reqHandleTitle": "Um identificador só teu",
  "checklist.reqHandleMet":
    "É aqui que as pessoas te vão encontrar — queerpulse.app/p/o-teu-identificador.",
  "checklist.reqHandleFailInvalid":
    "Os identificadores têm 3–30 carateres: letras minúsculas, números e hífenes.",
  "checklist.reqHandleFailTaken":
    "Já existe alguém com esse identificador — tenta outro.",
  "checklist.reqHandleFailReserved":
    "Esse identificador está reservado. Escolhe um diferente.",
  "checklist.reqAvatarTitle": "Uma fotografia ou imagem",
  "checklist.reqAvatarMet":
    "O teu avatar ajuda as pessoas a reconhecerem esta persona.",
  "checklist.reqAvatarFail":
    "Adiciona um avatar para as pessoas poderem associar um rosto, ou uma marca, ao nome.",
  "checklist.reqBioTitle": "Uma biografia com pelo menos 80 carateres",
  "checklist.reqBioMet":
    "Suficiente para alguém perceber quem és, num relance.",
  "checklist.reqBioFail":
    "Conta um pouco mais — a tua biografia precisa de pelo menos 80 carateres.",
  "checklist.reqItemsTitle": "Pelo menos três coisas para mostrar",
  "checklist.reqItemsMet": "Trabalho suficiente para a página parecer viva.",
  "checklist.reqItemsFail":
    "Acrescenta mais algumas peças — precisas de pelo menos três em todas as tuas secções.",
  "checklist.reqLanguageTitle": "Linguagem que acolhe toda a gente",
  "checklist.reqLanguageMet": "Nada foi assinalado.",
  "checklist.reqLanguageFail":
    "Algo no teu nome, identificador ou biografia foi assinalado — por favor reformula-o.",

  // Sugestões de polimento, não bloqueantes (PublishChecklist.tsx)
  "checklist.polishTitle": "Uns retoques finais",
  "checklist.polishCover": "Uma imagem de capa",
  "checklist.polishSocials": "Um link social",
  "checklist.polishAvailability": "A tua disponibilidade",
  "checklist.polishDone": "Página cuidada",

  // Painel de gestão (MySubprofilesPage + MySubprofileRow)
  "mine.title": "Os teus <em>subperfis</em>",
  "mine.sub":
    "Um lado profissional teu para cada coisa que fazes — ligado ao teu perfil principal, ou por si só.",
  "mine.newCta": "Novo subperfil",
  "mine.atCap": "Chegaste ao máximo de personas que uma conta pode ter.",
  "mine.emptyTitle": "Ainda sem subperfis",
  "mine.emptyDescription":
    "Cria um para cada ofício que queiras partilhar — a tua música, o teu código, a tua escrita — e escolhe se fica associado ao teu nome.",
  "mine.emptyCta": "Criar o primeiro",
  "mine.untitled": "Persona sem nome",
  "mine.defaultName": "Essa persona",
  "mine.toastDeleted": "{name} eliminada",
  "mine.toastDeleteError":
    "Não conseguimos eliminar isso agora — tenta outra vez.",
  "mine.deleteModalTitle": "Eliminar esta persona?",
  "mine.deleteModalSub":
    "“{name}” e tudo o que lá está vai desaparecer para sempre.",
  "mine.deleteModalDefaultName": "Esta persona",
  "mine.deleteModalKeep": "Manter",
  "mine.deleteModalConfirm": "Eliminar",
  "mine.deleteModalDeleting": "A eliminar…",
  "mine.deleteModalBody": "Isto não pode ser desfeito.",
  "mine.deleteModalBodyShared":
    "Isto remove {name} para todos os {n} coproprietários — não pode ser desfeito.",
  "mine.rowEdit": "Editar",
  "mine.rowDelete": "Eliminar",
  "mine.endorsementCount_one": "{count} endosso",
  "mine.endorsementCount_other": "{count} endossos",
  "mine.followerCount_one": "{count} seguidor",
  "mine.followerCount_other": "{count} seguidores",

  // Página do editor (SubprofileEditorPage)
  "editor.loading": "A carregar a tua persona…",
  "editor.notFoundTitle": "Não encontrámos essa persona",
  "editor.notFoundDescription":
    "Pode ter sido removida, ou o link não está certo.",
  "editor.notFoundAction": "Voltar aos teus subperfis",
  "editor.backLink": "Os teus subperfis",

  // Formulário base (SubprofileMetaForm)
  "metaForm.sectionTitle": "O essencial",
  "metaForm.avatarLabel": "Avatar",
  "metaForm.avatarPlaceholder": "Avatar",
  "metaForm.displayNameLabel": "Nome apresentado",
  "metaForm.displayNameError":
    "Esta persona precisa de um nome para ficar visível.",
  "metaForm.displayNamePlaceholder": "Como esta persona é conhecida",
  "metaForm.taglineLabel": "Frase de apresentação",
  "metaForm.taglineHelper": "Uma linha sobre o que fazes.",
  "metaForm.taglinePlaceholder":
    "por ex. Eletrónica noturna para pistas de dança queer",
  "metaForm.bioLabel": "Biografia",
  "metaForm.bioHelper":
    "Pelo menos 80 carateres para publicares uma persona autónoma.",
  "metaForm.bioPlaceholder": "Umas frases nas tuas próprias palavras.",
  "metaForm.linkLabel": "Ligar ao teu perfil principal",
  "metaForm.addressLabel": "Endereço do perfil",
  "metaForm.livesAt": "Fica em",
  "metaForm.addressPlaceholder": "por ex. engenharia",
  "metaForm.handleLabel": "Identificador",
  "metaForm.visibilityLabel": "Quem pode ver",

  // Campos de presença (SubprofilePresenceFields): capa, cor, disponibilidade, CTA
  "metaForm.coverLabel": "Imagem de capa",
  "metaForm.coverPlaceholder": "Imagem de capa",
  "metaForm.accentLabel": "Cor de destaque",
  "metaForm.availabilityLabel": "Disponibilidade",
  "metaForm.availabilityUnset": "Não definida",
  "metaForm.ctaLabelLabel": "Texto do botão",
  "metaForm.ctaLabelPlaceholder": "por ex. Marcar uma sessão",
  "metaForm.ctaUrlLabel": "Link do botão",
  "metaForm.ctaUrlPlaceholder": "https://",
  "metaForm.ctaHelper":
    "Adiciona um texto e um link para mostrar um botão na tua página.",
  "metaForm.ctaMismatch":
    "Adiciona os dois — texto e link — ou deixa ambos em branco.",

  "metaForm.save": "Guardar detalhes",
  "metaForm.saving": "A guardar…",
  "metaForm.leaveConfirm":
    "Tens alterações por guardar neste perfil. Queres sair sem as guardar?",
  "metaForm.toastSaved": "Detalhes guardados",
  "metaForm.toastError":
    "Não conseguimos guardar isso agora — tenta outra vez.",

  // Editor de item (SubprofileItemEditor)
  "itemEditor.itemNumber": "Item {n}",
  "itemEditor.moveUp": "Mover para cima",
  "itemEditor.moveDown": "Mover para baixo",
  "itemEditor.remove": "Remover",
  "itemEditor.tagsHelper": "Separa com vírgulas",
  "itemEditor.feature": "Tornar isto o destaque",
  "itemEditor.unfeature": "Remover do destaque",
  "itemEditor.featuredBadge": "Destaque",

  // Editor de chips de colaboração (HandleChipInput, dentro de SubprofileItemEditor)
  "itemEditor.collaboratorsLabel": "Pessoas colaboradoras",
  "itemEditor.collaboratorsPlaceholder": "@identificador",
  "itemEditor.collaboratorsHelper":
    "Escreve um @identificador e prime enter ou vírgula para o creditar aqui.",
  "itemEditor.collaboratorsCapHint":
    "É o máximo de pessoas colaboradoras que podes acrescentar.",
  "itemEditor.collaboratorRemove": "Remover @{handle}",

  // Editor de links sociais (SubprofileSocialLinksEditor)
  "socialEditor.title": "Links sociais",
  "socialEditor.add": "Adicionar um link",
  "socialEditor.platformLabel": "Plataforma do link",
  "socialEditor.linkFor": "Link de {platform}",
  "socialEditor.removeLinkFor": "Remover link de {platform}",
  "socialEditor.other": "Outro link",
  "socialEditor.save": "Guardar links",
  "socialEditor.saving": "A guardar…",
  "socialEditor.saved": "Links guardados",
  "socialEditor.error": "Não conseguimos guardar isso agora — tenta outra vez.",
  "socialEditor.capHint": "É o máximo de links que podes acrescentar.",

  // Editor de secção (SubprofileSectionEditor)
  "sectionEditor.empty":
    "Ainda nada aqui — acrescenta o primeiro quando quiseres.",
  "sectionEditor.addTo": "Acrescentar a {section}",
  "sectionEditor.capHint": "É o máximo que podes acrescentar a uma secção.",
  "sectionEditor.save": "Guardar secção",
  "sectionEditor.saving": "A guardar…",
  "sectionEditor.toastSaved": "Alterações guardadas em {section}",
  "sectionEditor.toastError":
    "Não conseguimos guardar isso agora — tenta outra vez.",

  // Painel de publicação (SubprofilePublishPanel)
  "publishPanel.successTitle": "Estás",
  "publishPanel.successEm": "no ar",
  "publishPanel.closeLabel": "Continuar a editar",
  "publishPanel.viewLive": "Ver ao vivo",
  "publishPanel.successLinked":
    "Esta persona já aparece no teu perfil principal como outro lado teu.",
  "publishPanel.successUnlinked":
    "Esta persona já existe por si só — as pessoas conseguem encontrá-la pelo identificador e no diretório.",
  "publishPanel.copyPublished":
    "Esta persona está no ar. As tuas edições ficam guardadas à medida que avanças.",
  "publishPanel.copyLinkedUnpublished":
    "Publica para mostrar esta persona no teu perfil principal.",
  "publishPanel.copyUnlinkedUnpublished":
    "Publica para dar a esta persona o seu próprio identificador e uma entrada no diretório.",
  "publishPanel.moveToDraft": "Voltar a rascunho",
  "publishPanel.working": "A processar…",
  "publishPanel.publish": "Publicar",
  "publishPanel.publishing": "A publicar…",
  "publishPanel.recheck": "Verificar e publicar",
  "publishPanel.toastLive": "A tua persona está no ar",
  "publishPanel.toastPublishError":
    "Não conseguimos publicar — vê os requisitos abaixo.",
  "publishPanel.toastUnpublished":
    "De volta a rascunho — só tu consegues vê-la agora.",
  "publishPanel.toastError":
    "Não conseguimos fazer isso agora — tenta outra vez.",

  // Modal de novo subperfil (NewSubprofileModal)
  "newModal.title": "Começar uma nova <em>persona</em>",
  "newModal.sub":
    "Cada uma é um lado profissional teu — escolhe para que serve.",
  "newModal.cancel": "Cancelar",
  "newModal.create": "Criar rascunho",
  "newModal.creating": "A criar…",
  "newModal.displayNameLabel": "Nome apresentado",
  "newModal.displayNameHelper":
    "Opcional — deixa em branco para a persona ser conhecida pelo ofício.",
  "newModal.displayNamePlaceholderDefault": "Como esta persona é conhecida",
  "newModal.displayNamePlaceholderExample": "por ex. {kind}",
  "newModal.addressLabel": "Endereço do perfil",
  "newModal.addressPlaceholder": "por ex. poesia",
  "newModal.toastError":
    "Não conseguimos começar essa agora — tenta outra vez.",

  // Duplicar uma persona — seletor de método inicial (StartMethodPicker) e
  // seletor de fonte/modo de cópia (CopySourcePicker, CopyModePreview),
  // usados no fluxo de criação quando já existem outras personas.
  "start.label": "Como queres começar?",
  "start.helper": "Escolhe um ponto de partida — depois podes mudar tudo.",
  "start.copyDisabledHelper":
    "Cria primeiro uma persona para depois a poderes copiar aqui.",
  "start.template": "A partir de um modelo",
  "start.blank": "Em branco",
  "start.copy": "Copiar uma existente",
  "copy.noSources": "Ainda não tens nenhuma persona para copiar.",
  "copy.sourceLabel": "Escolhe uma persona para copiar",
  "copy.modeLabel": "O que copiar",
  "copy.modeFull": "Tudo",
  "copy.modeContent": "Só o conteúdo",
  "copy.summaryCounts": "{items} itens · {links} links",
  "copy.summaryAffiliations": "{affiliations} afiliações",
  "copy.summaryIdentity": "· mais nome, biografia e estilo",
  "copy.summaryNoIdentity": "· identidade em branco",

  // Modelos iniciais (Fase 4a) — seletor no momento de criação
  // (NewSubprofileModal) e o botão "Inserir exemplos" no editor
  // (SubprofileSectionEditor). O texto dos exemplos lê-se como um
  // preenchimento simpático e editável — a ideia é que a pessoa o substitua
  // pelo seu próprio trabalho, não que o mantenha tal como está.
  "template.helper":
    "Os modelos preenchem as tuas secções com alguns exemplos e sugerem uma frase de apresentação — tudo pode ser editado ou apagado.",
  "template.insertExamples": "Inserir exemplos",

  // Frases de apresentação sugeridas por ofício — aplicadas junto com os
  // modelos de secção, mas totalmente editáveis.
  "template.tagline.developer":
    "A construir coisas, sobretudo para quem eu amo.",
  "template.tagline.writer":
    "Palavras que não conseguia guardar só para mim.",
  "template.tagline.musician":
    "Som para noites queer e manhãs tranquilas.",
  "template.tagline.visual_artist":
    "Imagens que guardam o que as palavras não conseguem.",
  "template.tagline.filmmaker": "Histórias contadas fotograma a fotograma.",
  "template.tagline.designer":
    "A tornar as coisas mais fáceis, e um pouco mais bonitas.",
  "template.tagline.maker": "Feito à mão, feito com cuidado.",
  "template.tagline.drag": "Glamour com uma mensagem para dar.",
  "template.tagline.dj": "Sets feitos para a pista de dança.",
  "template.tagline.dancer": "Movimento como outra forma de falar.",
  "template.tagline.performer": "Em palco, para quem precisar.",
  "template.tagline.photographer":
    "A guardar parado o que normalmente passa depressa demais.",
  "template.tagline.videomaker":
    "Imagens em movimento, feitas com intenção.",
  "template.tagline.chef":
    "A cozinhar para mesas queer, um prato de cada vez.",
  "template.tagline.mixologist": "Bebidas preparadas para a noite que vem aí.",
  "template.tagline.therapist":
    "Um espaço afirmativo para pensar as coisas com calma.",
  "template.tagline.generic": "Umas quantas coisas que fiz, reunidas aqui.",

  // Exemplos por secção (usados tanto pelo modelo inicial como pelo botão
  // "Inserir exemplos") — um ou dois itens por secção, de acordo com os
  // campos que essa secção realmente mostra.
  "template.section.projects.item1.title": "O meu projeto em destaque",
  "template.section.projects.item1.desc":
    "Uma ou duas linhas sobre o que construíste e porque é importante.",
  "template.section.projects.item2.title":
    "Outro projeto que vale a pena mostrar",
  "template.section.projects.item2.desc":
    "O que faz, para quem é, e o que aprendeste ao construí-lo.",
  "template.section.open_source.item1.title":
    "Um projeto para o qual contribuo",
  "template.section.open_source.item1.desc":
    "O que faz e como estás envolvido — mantenedor, colaborador, ou a começar agora.",
  "template.section.publications.item1.title": "Algo que escrevi",
  "template.section.publications.item1.subtitle": "Onde foi publicado",
  "template.section.publications.item1.desc":
    "Uma linha sobre do que trata e porque o escreveste.",
  "template.section.readings.item1.title": "Uma leitura ou evento",
  "template.section.readings.item1.subtitle": "Onde aconteceu",
  "template.section.discography.item1.title": "Um lançamento",
  "template.section.discography.item1.subtitle": "Faixa, EP ou álbum",
  "template.section.gigs.item1.title": "Um concerto",
  "template.section.gigs.item1.subtitle": "Onde tocaste",
  "template.section.portfolio.item1.title": "Uma peça que fiz",
  "template.section.portfolio.item1.desc":
    "O que é e o que envolveu criá-la.",
  "template.section.portfolio.item2.title": "Outra peça",
  "template.section.portfolio.item2.desc":
    "Um segundo exemplo — troca por aquilo que melhor mostra o teu trabalho.",
  "template.section.exhibitions.item1.title": "Uma exposição",
  "template.section.exhibitions.item1.subtitle": "Onde esteve patente",
  "template.section.filmography.item1.title": "Um filme que fiz",
  "template.section.filmography.item1.subtitle": "O teu papel nele",
  "template.section.filmography.item1.desc":
    "Sobre o que é, numa ou duas frases.",
  "template.section.screenings.item1.title": "Uma exibição",
  "template.section.screenings.item1.subtitle": "Onde passou",
  "template.section.selected_work.item1.title": "Um projeto de que me orgulho",
  "template.section.selected_work.item1.subtitle": "O cliente ou o briefing",
  "template.section.selected_work.item1.desc":
    "O que fizeste e o problema que resolveu.",
  "template.section.clients.item1.title":
    "Um cliente ou marca com quem trabalhaste",
  "template.section.collections.item1.title": "Uma coleção",
  "template.section.collections.item1.desc":
    "Do que é feita e o que a inspirou.",
  "template.section.workshops.item1.title": "Uma oficina que dei",
  "template.section.workshops.item1.subtitle": "Onde aconteceu",
  "template.section.shows.item1.title": "Um espetáculo",
  "template.section.shows.item1.subtitle": "Onde atuaste",
  "template.section.looks.item1.title": "Um look",
  "template.section.looks.item1.desc":
    "O que o inspirou e como o construíste.",
  "template.section.mixes.item1.title": "Um set",
  "template.section.mixes.item1.subtitle": "Onde o tocaste",
  "template.section.mixes.item2.title": "Outro set",
  "template.section.mixes.item2.subtitle": "Um segundo exemplo para trocares",
  "template.section.performances.item1.title": "Uma atuação",
  "template.section.performances.item1.subtitle": "Onde aconteceu",
  "template.section.reel.item1.title": "O meu reel",
  "template.section.reel.item1.desc": "O que mostra e de onde é.",
  "template.section.appearances.item1.title": "Uma aparição",
  "template.section.appearances.item1.subtitle":
    "O espetáculo, evento ou palco",
  "template.section.series.item1.title": "Uma série",
  "template.section.series.item1.desc":
    "Sobre o que é e o que liga tudo.",
  "template.section.videos.item1.title": "Um vídeo",
  "template.section.videos.item1.subtitle": "De onde é",
  "template.section.videos.item1.desc":
    "O que mostra, numa ou duas linhas.",
  "template.section.showcase.item1.title": "Algo que fiz",
  "template.section.showcase.item1.subtitle": "Uma etiqueta curta para isto",
  "template.section.showcase.item1.desc": "O que é e porque está aqui.",
  "template.section.menus.item1.title": "Um menu ou prato de assinatura",
  "template.section.menus.item1.subtitle": "O evento ou o espaço",
  "template.section.menus.item1.desc":
    "O que leva e a história por trás do prato.",
  "template.section.residencies.item1.title": "Uma residência ou pop-up",
  "template.section.residencies.item1.subtitle": "Onde aconteceu",
  "template.section.cocktails.item1.title": "Um cocktail de assinatura",
  "template.section.cocktails.item1.subtitle": "O destilado base",
  "template.section.cocktails.item1.desc":
    "O que leva e o que o inspirou.",
  "template.section.specialisms.item1.title": "Uma área com que trabalho",
  "template.section.specialisms.item1.desc":
    "Para quem é e como a abordas.",
  "template.section.credentials.item1.title": "Uma qualificação ou formação",
  "template.section.credentials.item1.subtitle": "A entidade que a atribui",

  // Campo de imagem (ImageUploadField)
  "imageUpload.defaultPlaceholder": "Imagem",
  "imageUpload.uploading": "A carregar…",
  "imageUpload.change": "Alterar",
  "imageUpload.add": "Adicionar imagem",
  "imageUpload.remove": "Remover imagem",
  "imageUpload.error":
    "Não conseguimos adicionar essa imagem. Tenta outra vez.",

  // Cabeçalho da persona (SubprofileHero)
  "hero.message": "Mensagem",
  "hero.edit": "Editar persona",
  "hero.report.cta": "Denunciar esta persona",
  "hero.report.ariaLabel": "Denunciar {name}",

  // Controlo de endosso (SubprofileEndorse)
  "hero.endorse.cta": "Endossar",
  "hero.endorse.endorsed": "Endossado",
  "hero.endorse.count_one": "{count} endosso",
  "hero.endorse.count_other": "{count} endossos",
  "hero.endorse.addNote": "Adicionar nota",
  "hero.endorse.notePlaceholder": "Diz uma palavra sobre porquê (opcional)",
  "hero.endorse.send": "Enviar",
  "hero.endorse.error": "Não conseguimos guardar isso agora — tenta outra vez.",
  "hero.endorse.endorsedByNames": "Endossado por {names}",

  // Controlo de seguir (SubprofileFollow)
  "hero.follow.cta": "Seguir",
  "hero.follow.following": "A seguir",
  "hero.follow.count_one": "{count} seguidor",
  "hero.follow.count_other": "{count} seguidores",
  "hero.follow.error": "Não conseguimos guardar isso agora — tenta outra vez.",

  // Controlo de partilha (SubprofileShare, MySubprofileRow)
  "share.cta": "Partilhar",
  "share.ariaLabel": "Partilhar esta persona",
  "share.copied": "Link copiado",

  // Modal de cartão de partilha (SubprofileShareCard) + código QR
  // (SubprofileQR) — pontos de entrada no SubprofileHero (público) e no
  // MySubprofileRow (responsável).
  "shareCard.cta": "Código QR",
  "shareCard.title": "Leva contigo",
  "shareCard.subtitle":
    "Digitaliza para abrir a página de {name} noutro dispositivo, ou guarda os detalhes abaixo.",
  "shareCard.download": "Transferir cartão de contacto",
  "shareCard.qrAria": "Código QR que liga à página da persona de {name}",
  "shareCard.copyLink": "Copiar link",
  "qr.loading": "A gerar código QR…",
  "qr.error": "Não conseguimos gerar o código QR — aqui tens o link em alternativa.",

  // Destaque do item em foco (SubprofileSpotlight)
  "spotlight.eyebrow": "Destaque",
  "spotlight.visit": "Visitar",

  // Créditos de colaboração num item público (ItemCollaborators, em SubprofileSections)
  "collab.with": "com",

  // Página pública da persona (SubprofilePage + subprofilePage.data.ts)
  "page.loading": "A carregar persona…",
  "page.ownerTie": "Parte de <em>{name}</em>",
  "page.visit": "Visitar",
  "page.notFoundTitle": "Esta persona não está aqui",
  "page.notFoundMetaTitle": "Persona não encontrada — QueerPulse",
  "page.notFoundDescription":
    "Pode ter sido despublicada, mantida privada, ou este link pode estar desatualizado. Não há nada de errado do teu lado.",
  "page.notFoundAction": "Explorar personas",
  "page.notFoundBack": "Voltar atrás",

  // Afiliações ("Parte de") — secção pública (SubprofileAffiliations) e editor
  // do responsável (SubprofileAffiliationsEditor, SubprofileAffiliationRow).
  // `role` é um campo predefinido e PERSISTIDO (AFFILIATION_ROLE_KEYS em
  // affiliations.data.ts) — indireção por chave, tal como em `kind`.
  "affiliation.heading": "Parte de",
  "affiliation.type.event": "Evento",
  "affiliation.type.community": "Comunidade",
  "affiliation.role.performing": "A atuar",
  "affiliation.role.attending": "A participar",
  "affiliation.role.hosting": "A receber",
  "affiliation.role.member": "Pessoa membro",
  "affiliation.role.mod": "Mod",
  "affiliation.role.founder": "Pessoa fundadora",

  "affiliationsEditor.title": "Parte de",
  "affiliationsEditor.note":
    "Liga esta persona aos eventos e comunidades de que fazes parte.",
  "affiliationsEditor.empty":
    "Ainda nada ligado — acrescenta um evento ou uma comunidade abaixo.",
  "affiliationsEditor.itemNumber": "Item {n}",
  "affiliationsEditor.remove": "Remover",
  "affiliationsEditor.typeLabel": "Tipo",
  "affiliationsEditor.roleLabel": "Função",
  "affiliationsEditor.slugLabel": "Endereço do evento ou da comunidade",
  "affiliationsEditor.slugPlaceholder": "por ex. clube-de-leitura-queer",
  "affiliationsEditor.slugHelper":
    "Vamos verificar que corresponde a um evento ou comunidade reais quando guardares.",
  "affiliationsEditor.add": "Adicionar um link",
  "affiliationsEditor.capHint": "É o máximo de links que podes acrescentar.",
  "affiliationsEditor.save": "Guardar links",
  "affiliationsEditor.saving": "A guardar…",
  "affiliationsEditor.saved": "Links guardados",
  "affiliationsEditor.error":
    "Não conseguimos guardar isso agora — tenta outra vez.",

  // Painel de responsáveis conjuntos (SubprofileOwnersPanel, no editor)
  "owners.title": "Responsáveis conjuntos",
  "owners.note": "Todas as pessoas aqui podem editar esta persona em conjunto.",
  "owners.creatorTag": "Criadora",
  "owners.youTag": "Tu",
  "owners.pendingHeading": "Convites pendentes",
  "owners.inviteCta": "Convidar um responsável",
  "owners.revokeAria": "Revogar o convite a {name}",
  "owners.toastRevoked": "Convite revogado",
  "owners.toastRevokeError":
    "Não conseguimos revogar isso agora — tenta outra vez.",
  "owners.leaveCta": "Sair da persona",
  "owners.leaveModalTitle": "Sair desta persona?",
  "owners.leaveModalBody":
    "Vais perder a capacidade de a editar. Os outros responsáveis mantêm tudo como está.",
  "owners.leaveModalKeep": "Ficar",
  "owners.leaveModalConfirm": "Sair",
  "owners.leaveModalLeaving": "A sair…",
  "owners.toastLeft": "Saíste desta persona",
  "owners.toastLeaveError": "Não conseguimos fazer isso agora — tenta outra vez.",

  // Modal de convite a um responsável (InviteCoOwnerModal)
  "invite.title": "Convidar um responsável",
  "invite.sub":
    "A pessoa vai precisar de aceitar antes de poder gerir esta persona.",
  "invite.searchPlaceholder": "Procura nas tuas ligações",
  "invite.searchAria": "Procura nas tuas ligações",
  "invite.empty": "Não há mais ligações para convidar.",
  "invite.cta": "Convidar",
  "invite.inviting": "A convidar…",
  "invite.toastSent":
    "Convite enviado — a pessoa vai precisar de aceitar antes de poder gerir esta persona.",
  "invite.toastError": "Não conseguimos enviar esse convite — tenta outra vez.",

  // Painel de convites recebidos (PersonaInvitesBanner, em MySubprofilesPage)
  "invites.regionLabel": "Convites para seres responsável conjunta de uma persona",
  "invites.message": "{inviter} convidou-te para seres responsável conjunta de <em>{persona}</em>",
  "invites.accept": "Aceitar",
  "invites.accepting": "A aceitar…",
  "invites.decline": "Recusar",
  "invites.declining": "A recusar…",
  "invites.toastAccepted": "Agora és responsável conjunta de {name}",
  "invites.toastAcceptError": "Não conseguimos aceitar esse convite — tenta outra vez.",
  "invites.toastDeclined": "Convite recusado",
  "invites.toastDeclineError": "Não conseguimos recusar esse convite — tenta outra vez.",
};
