import type { Catalog } from "../../types";

/** Subperfis — pt-PT inclusivo. Mesmas chaves que `en/subprofiles.ts`. */
export const subprofiles: Catalog = {
  // Diretório (SubprofileDirectoryPage)
  "directory.eyebrow": "Diretório · personas",
  "directory.subtitle":
    "Personas profissionais pseudónimas de toda a comunidade. Sem rankings, sem algoritmo. Só o trabalho.",
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
    "Algo correu mal ao contactar o servidor. Isto não é um diretório vazio. Tenta novamente daqui a pouco.",
  "directory.error.retry": "Tentar novamente",
  "directory.openToCollabsChip": "Aberto a colaborações",
  "directory.tagFilterHeading": "Tags",
  "directory.tagFilterLabel": "Filtrar por tag",

  "directory.filtersNote_one": "{count} ofício para explorar.",
  "directory.filtersNote_other": "{count} ofícios para explorar.",
  "directory.showMore": "Ver mais",
  "directory.shownOfTotal": "{shown} de {total}",

  // Lembrete final do diretório (SubprofileDirectoryFooterPrompt — descoberta
  // de personas, Fase 5, Momento 2). Dispensável; texto estático, sem dados ao vivo.
  "directory.footerPrompt.message":
    "Cada persona aqui foi criada por alguém que se juntou por outra razão. <em>A tua também pode ser.</em>",
  "directory.footerPrompt.cta": "Cria a tua",
  "directory.footerPrompt.notNow": "Agora não",

  // Afinidades do cartão do diretório (SubprofileCard)
  "card.openToCollabs": "Aberto a colaborar",
  "card.linkCount_one": "{count} link",
  "card.linkCount_other": "{count} links",
  "card.followerCount_one": "{count} seguidor",
  "card.followerCount_other": "{count} seguidores",
  "card.openPersona": "Abrir esta persona",
  "card.view": "Ver",

  // Bloco "Também como…" no perfil principal (ProfileSubprofilesSection)
  "alsoAs.title": "Também a trabalhar como",
  "alsoAs.subtitlePublic": "Personas profissionais ligadas a este perfil.",
  "alsoAs.subtitleSelf": "As personas profissionais que ligaste aqui.",
  "alsoAs.subtitleEmpty": "Outra persona do teu trabalho pode viver aqui.",
  "alsoAs.viewPersona": "Visitar",
  "alsoAs.switchLabel": "Mais personas",
  "alsoAs.previewLabel": "Ver outra persona",
  "alsoAs.count_one": "{count} persona",
  "alsoAs.count_other": "{count} personas",
  "alsoAs.announce": "A mostrar {name}",
  "alsoAs.featuredEyebrow": "Destaque",
  "alsoAs.addAnother": "Adicionar outra persona",
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
    "A tua música, o teu código, a tua escrita, ligado aqui ou por si só.",
  "alsoAs.empty.cta": "Criar uma persona",

  // Sugestão mais forte para quem vê o próprio perfil vazio (SidesPrompt, em
  // ProfileSubprofilesSection — descoberta de personas, Fase 5, Momento 1).
  // Mostrada até este lembrete ser dispensado ou o limite partilhado ser
  // atingido; depois disso, volta ao texto simples de `alsoAs.empty.*` acima.
  "alsoAs.sidesPrompt.eyebrow": "Uma sugestão discreta",
  "alsoAs.sidesPrompt.heading": "Fazes mais do que <em>uma coisa</em>.",
  "alsoAs.sidesPrompt.description":
    "Uma persona dá a esse outro ofício a sua própria página, ligada aqui, ou totalmente independente.",
  "alsoAs.sidesPrompt.cta": "Criar uma persona",
  "alsoAs.sidesPrompt.notNow": "Agora não",

  // Navegação + paleta de comandos
  "nav.browse": "Personas",
  "nav.mine": "As tuas personas",
  "command.mine.name": "As minhas personas",
  "command.mine.sub": "As tuas personas profissionais",
  "command.browse.name": "Explorar personas",
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
  "kind.astrologer": "Astrologia",
  "kind.generic": "Generalista",
  // Expanded kind labels (personas expansion — 75 new crafts)
  "kind.comedian": "Comédia",
  "kind.vocalist": "Canto",
  "kind.burlesque": "Burlesco",
  "kind.circus": "Circo e aéreo",
  "kind.spoken_word": "Spoken word",
  "kind.host": "Apresentação",
  "kind.voguer": "Ballroom e vogue",
  "kind.illustrator": "Ilustração",
  "kind.tattoo_artist": "Tatuagem",
  "kind.animator": "Animação",
  "kind.comic_artist": "Banda desenhada",
  "kind.game_designer": "Videojogos",
  "kind.artist_3d": "Arte 3D",
  "kind.printmaker": "Gravura",
  "kind.journalist": "Jornalismo",
  "kind.poet": "Poesia",
  "kind.editor": "Edição",
  "kind.screenwriter": "Argumento",
  "kind.translator": "Tradução",
  "kind.zinester": "Fanzines",
  "kind.academic": "Investigação",
  "kind.ceramicist": "Cerâmica",
  "kind.jeweler": "Joalharia",
  "kind.textile_artist": "Têxteis",
  "kind.woodworker": "Madeira",
  "kind.florist": "Floricultura",
  "kind.data_scientist": "Dados",
  "kind.coach": "Coaching",
  "kind.bodyworker": "Massagem",
  "kind.yoga_teacher": "Yoga e movimento",
  "kind.nutritionist": "Nutrição",
  "kind.doula": "Doula",
  "kind.personal_trainer": "Treino pessoal",
  "kind.sex_educator": "Educação sexual",
  "kind.peer_support": "Apoio entre pares",
  "kind.baker": "Pastelaria e pão",
  "kind.barista": "Barista",
  "kind.brewer": "Cerveja e destilados",
  "kind.sommelier": "Escanção",
  "kind.caterer": "Catering",
  "kind.hair_stylist": "Cabelo",
  "kind.barber": "Barbearia",
  "kind.makeup_artist": "Maquilhagem",
  "kind.nail_artist": "Unhas",
  "kind.esthetician": "Estética",
  "kind.piercer": "Piercing",
  "kind.fashion_designer": "Moda",
  "kind.stylist": "Styling",
  "kind.model": "Modelo",
  "kind.costume_designer": "Guarda-roupa",
  "kind.curator": "Curadoria",
  "kind.gallerist": "Galeria",
  "kind.art_dealer": "Comércio de arte",
  "kind.archivist": "Arquivo",
  "kind.conservator": "Conservação",
  "kind.registrar": "Gestão de coleções",
  "kind.exhibition_designer": "Design expositivo",
  "kind.art_critic": "Crítica de arte",
  "kind.docent": "Mediação",
  "kind.preparator": "Montagem",
  "kind.historian": "História",
  "kind.art_historian": "História da arte",
  "kind.oral_historian": "História oral",
  "kind.genealogist": "Genealogia",
  "kind.heritage": "Património",
  "kind.archival_researcher": "Pesquisa em arquivo",
  "kind.memory_keeper": "Memória cultural",
  "kind.organizer": "Organização",
  "kind.activist": "Ativismo",
  "kind.event_producer": "Produção de eventos",
  "kind.promoter": "Promoção",
  "kind.teacher": "Ensino",
  "kind.facilitator": "Facilitação",
  "kind.tutor": "Explicações",
  "kind.lecturer": "Docência universitária",
  "kind.pole_dancer": "Pole dance",

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
  "section.charts": "Leituras de mapas",
  "section.sky": "No céu",
  "section.showcase": "Mostra",
  "section.links": "Links",
  "section.gallery": "Galeria de fotos",
  // Expanded section labels (personas expansion — 81 new sections)
  "section.sets": "Espetáculos",
  "section.tour": "Digressão",
  "section.recordings": "Gravações",
  "section.acts": "Números",
  "section.pieces": "Peças",
  "section.hosted": "Noites que apresentei",
  "section.balls": "Bailes e categorias",
  "section.flash": "Flash",
  "section.healed": "Trabalho cicatrizado",
  "section.books": "Livros",
  "section.strips": "Tiras e fanzines",
  "section.games": "Jogos",
  "section.jams": "Jams e protótipos",
  "section.models": "Modelos e renders",
  "section.editions": "Edições",
  "section.reporting": "Reportagem",
  "section.bylines": "Onde publiquei",
  "section.poems": "Poemas",
  "section.edited": "Editados",
  "section.scripts": "Argumentos",
  "section.productions": "Produções",
  "section.translations": "Traduções",
  "section.languages": "Línguas entre que trabalho",
  "section.zines": "Fanzines",
  "section.distros": "Onde encontrar",
  "section.papers": "Artigos",
  "section.teaching": "Docência",
  "section.wares": "Louça",
  "section.firings": "Fornadas e residências",
  "section.commissions": "Encomendas",
  "section.builds": "Construções",
  "section.arrangements": "Arranjos",
  "section.events": "Eventos",
  "section.analyses": "Análises",
  "section.programmes": "Programas",
  "section.treatments": "Tratamentos",
  "section.classes": "Aulas",
  "section.trainings": "Formações",
  "section.support": "Como te acompanho",
  "section.training": "Treino",
  "section.resources": "Recursos",
  "section.groups": "Grupos",
  "section.bakes": "Pães e bolos",
  "section.markets": "Mercados e pontos de venda",
  "section.brews": "Cafés",
  "section.releases": "Lançamentos",
  "section.taprooms": "Onde beber",
  "section.lists": "Cartas de vinhos",
  "section.pairings": "Harmonizações e jantares",
  "section.services": "Serviços",
  "section.cuts": "Cortes",
  "section.nail_sets": "Conjuntos",
  "section.aftercare": "Cuidados depois",
  "section.piercings": "Piercings",
  "section.editorials": "Editoriais",
  "section.book": "Book",
  "section.campaigns": "Campanhas",
  "section.sketches": "Esboços e construção",
  "section.texts": "Textos e catálogos",
  "section.programme": "Programa",
  "section.artists": "Artistas representados",
  "section.available": "Obras disponíveis",
  "section.advisory": "Consultoria",
  "section.finding_aids": "Instrumentos de pesquisa",
  "section.loans": "Empréstimos e logística",
  "section.installations": "Instalações",
  "section.reviews": "Críticas",
  "section.tours": "Visitas",
  "section.talks": "Conversas",
  "section.installs": "Montagens",
  "section.research": "Investigação",
  "section.lectures": "Conferências",
  "section.testimonies": "Testemunhos",
  "section.findings": "Descobertas",
  "section.sites": "Lugares",
  "section.actions": "Ações e datas",
  "section.writing": "Escrita e conversas",
  "section.nights": "Noites",
  "section.roster": "Quem toca",
  "section.courses": "Cursos",
  "section.subjects": "Matérias",

  // Estado / visibilidade de ligação — também campos persistidos.
  "status.draft": "Rascunho",
  "status.published": "Publicado",
  "link.linked": "Ligado",
  "link.standalone": "Autónomo",
  "link.help.linked":
    "Aparece no teu perfil principal como outra persona tua. As pessoas conseguem ver que é a mesma pessoa.",
  "link.help.unlinked":
    "Existe por si só. Nada aqui aponta de volta ao teu perfil principal, por isso podes manter este trabalho à parte do resto da tua vida. Ganha um identificador público assim que passa a verificação de completude.",

  // Chips de estado de concerto/projeto (ItemRow, skins stage + studio/workshop)
  // e legenda de marcas dietéticas (skin Table) — campos persistidos
  // `gigState`/`workState` e marcas estruturadas dos pratos (`v`/`ve`/`gf`).
  "gigState.sold_out": "Esgotado",
  "gigState.cancelled": "Cancelado",
  "gigState.guest": "Set convidado",
  "workState.shipped": "Lançado",
  "workState.archived": "Arquivado",
  "workState.in_progress": "Em curso",
  "dietary.v": "vegetariano",
  "dietary.ve": "vegano",
  "dietary.gf": "sem glúten",

  // Opções de visibilidade (useSubprofileMetaEditor, mostradas por
  // SubprofileLinkFields) — campo `visibility` persistido.
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

  // Rótulos/placeholders dos campos do editor de itens
  // (SubprofileItemDrawerFields, na SubprofileItemDrawer)
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
    "É aqui que as pessoas te vão encontrar: queerpulse.app/p/o-teu-identificador.",
  "checklist.reqHandleFailInvalid":
    "Os identificadores têm 3–30 carateres: letras minúsculas, números e hífenes.",
  "checklist.reqHandleFailTaken":
    "Já existe alguém com esse identificador. Tenta outro.",
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
    "Conta um pouco mais. A tua biografia precisa de pelo menos 80 carateres.",
  "checklist.reqItemsTitle": "Pelo menos três coisas para mostrar",
  "checklist.reqItemsMet": "Trabalho suficiente para a página parecer viva.",
  "checklist.reqItemsFail":
    "Acrescenta mais algumas peças. Precisas de pelo menos três em todas as tuas secções.",
  "checklist.reqLanguageTitle": "Linguagem que acolhe toda a gente",
  "checklist.reqLanguageMet": "Nada foi assinalado.",
  "checklist.reqLanguageFail":
    "Uma palavra no teu nome, identificador ou biografia pode não cair bem a toda a gente. Importas-te de a reformular?",

  // Sugestões de polimento, não bloqueantes (PublishChecklist.tsx)
  "checklist.polishTitle": "Uns retoques finais",
  "checklist.polishCover": "Uma imagem de capa",
  "checklist.polishSocials": "Um link social",
  "checklist.polishAvailability": "A tua disponibilidade",
  "checklist.polishDone": "Página cuidada",

  // Painel de gestão (MySubprofilesPage + SideCard)
  "mine.title": "As tuas outras <em>personas</em>",
  "mine.sub":
    "Uma persona profissional tua para cada coisa que fazes, ligada ao teu perfil principal, ou por si só.",
  "mine.newCta": "Nova persona",
  "mine.newSideTile": "Nova persona",
  "mine.count": "{n} de {max}",
  "mine.atCap": "Chegaste ao máximo de personas que uma conta pode ter.",
  "mine.untitled": "Persona sem nome",
  "mine.defaultName": "Essa persona",
  "mine.toastDeleted": "{name} eliminada",
  "mine.toastDeleteError":
    "Não conseguimos eliminar isso agora. Tenta outra vez.",
  "mine.deleteModalTitle": "Eliminar esta persona?",
  "mine.deleteModalSub":
    "“{name}” e tudo o que lá está vai desaparecer para sempre.",
  "mine.deleteModalDefaultName": "Esta persona",
  "mine.deleteModalKeep": "Manter",
  "mine.deleteModalConfirm": "Eliminar",
  "mine.deleteModalDeleting": "A eliminar…",
  "mine.deleteModalBody": "Isto não pode ser desfeito.",
  "mine.deleteModalBodyShared":
    "Isto remove {name} para todos os {n} coproprietários. Não pode ser desfeito.",
  "mine.rowEdit": "Editar",
  "mine.rowDelete": "Eliminar",
  "mine.endorsementCount_one": "{count} recomendação",
  "mine.endorsementCount_other": "{count} recomendações",
  "mine.followerCount_one": "{count} seguidor",
  "mine.followerCount_other": "{count} seguidores",

  // Estados de carregamento / vazio / erro do painel (SubprofileDashboardStates,
  // Fase 2 Tarefa 2) — construídos isoladamente, ligados à página mais tarde.
  "mine.loadingAria": "A carregar as tuas personas…",
  "mine.empty.eyebrow": "As tuas personas",
  "mine.empty.title": "Tens um perfil. <em>Não és uma coisa só.</em>",
  "mine.empty.sub":
    "Cada ofício que praticas pode ter a sua própria página, ligada ao teu nome, ou totalmente independente. Começa pelo primeiro.",
  "mine.empty.newCta": "Cria a tua primeira persona",
  "mine.empty.browseCta": "Vê o que outras pessoas criaram",
  "mine.emptySamples.stage.name": "Hot Mess Express",
  "mine.emptySamples.stage.line": "Dupla de DJs · festas queer",
  "mine.emptySamples.practice.name": "Sofia Neves",
  "mine.emptySamples.practice.line": "Psicoterapia para pessoas adultas LGBTQ+ · PT / EN",
  "mine.emptySamples.table.name": "Casa Corvo",
  "mine.emptySamples.table.line": "Clube de jantar para quem chega com fome e sai tarde",
  "mine.error.title": "Não conseguimos carregar as tuas",
  "mine.error.em": "personas",
  "mine.error.description":
    "Algo correu mal ao contactar o servidor. Nada aqui se perdeu. Tenta novamente daqui a pouco.",
  "mine.error.retry": "Tentar novamente",

  // Página do editor (SubprofileEditorPage)
  "editor.loading": "A carregar a tua persona…",
  "editor.notFoundTitle": "Não encontrámos essa persona",
  "editor.notFoundDescription":
    "Pode ter sido removida, ou o link não está certo.",
  "editor.notFoundAction": "Voltar às tuas personas",
  "editor.backLink": "As tuas personas",

  // Editor base (useSubprofileMetaEditor, usado pelos painéis Identidade/
  // Presença/Endereço)
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
  "metaForm.coverHelper":
    "Um banner largo no topo da tua página de persona. Enquadra-o em 3:1 (pelo menos 1500 × 500px); a página mantém o que centraste no enquadramento e corta um pouco em cima e em baixo nos ecrãs largos.",
  "metaForm.coverPlaceholder": "Imagem de capa",
  "metaForm.accentLabel": "Cor de destaque",
  "metaForm.bannerEdgeLabel": "Borda do banner",
  "metaForm.bannerEdgeHelper":
    "Escolha como a capa encontra a página. Adicione uma imagem de capa para ativar.",
  "metaForm.bannerEdgeContained": "Contida",
  "metaForm.bannerEdgeBleed": "Sangrar na página",
  "metaForm.availabilityLabel": "Disponibilidade",
  "metaForm.availabilityUnset": "Não definida",
  "metaForm.ctaLabelLabel": "Texto do botão",
  "metaForm.ctaLabelPlaceholder": "por ex. Marcar uma sessão",
  "metaForm.ctaUrlLabel": "Link do botão",
  "metaForm.ctaUrlPlaceholder": "https://",
  "metaForm.ctaHelper":
    "Adiciona um texto e um link para mostrar um botão na tua página.",
  "metaForm.ctaMismatch":
    "Adiciona os dois, texto e link, ou deixa ambos em branco.",

  "metaForm.save": "Guardar detalhes",
  "metaForm.saving": "A guardar…",
  "metaForm.leaveConfirm":
    "Tens alterações por guardar neste perfil. Queres sair sem as guardar?",
  "metaForm.toastSaved": "Detalhes guardados",
  "metaForm.toastError":
    "Não conseguimos guardar isso agora. Tenta outra vez.",

  // Gaveta de item (SubprofileItemDrawerFields, aberta pela SubprofileItemDrawer)
  "itemEditor.itemNumber": "Item {n}",
  "itemEditor.untitledPhoto": "Foto",
  "itemEditor.moveUp": "Mover para cima",
  "itemEditor.moveDown": "Mover para baixo",
  "itemEditor.dragToReorder": "Arrasta para reordenar",
  "itemEditor.remove": "Remover",
  "itemEditor.tagsHelper": "Separa com vírgulas",
  "itemEditor.feature": "Tornar isto o destaque",
  "itemEditor.unfeature": "Remover do destaque",
  "itemEditor.featuredBadge": "Destaque",

  // Seletor de pessoas colaboradoras (CollaboratorSelect, dentro de SubprofileItemDrawerFields)
  "itemEditor.collaboratorsLabel": "Pessoas colaboradoras",
  "itemEditor.collaboratorsPlaceholder": "Pesquisar pessoas para creditar",
  "itemEditor.collaboratorsSearchPlaceholder": "Pesquisar por nome ou @identificador",
  "itemEditor.collaboratorsEmpty": "Nenhuma pessoa corresponde a essa pesquisa.",
  "itemEditor.collaboratorsHelper":
    "Pesquisa pessoas e escolhe-as para creditar o trabalho delas aqui.",
  "itemEditor.collaboratorsCapHint":
    "É o máximo de pessoas colaboradoras que podes acrescentar.",

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
  "socialEditor.error": "Não conseguimos guardar isso agora. Tenta outra vez.",
  "socialEditor.capHint": "É o máximo de links que podes acrescentar.",

  // Editor de links por item (projetos / código aberto)
  "itemLinks.label": "Links",
  "itemLinks.helper": "Adiciona um link do repositório, demo ou documentação.",
  "itemLinks.add": "Adicionar link",

  // Editor de secção (SubprofileSectionEditor)
  "sectionEditor.empty":
    "Ainda nada aqui. Acrescenta o primeiro quando quiseres.",
  "sectionEditor.addTo": "Acrescentar a {section}",
  "sectionEditor.capHint": "É o máximo que podes acrescentar a uma secção.",
  "sectionEditor.save": "Guardar secção",
  "sectionEditor.saving": "A guardar…",
  "sectionEditor.toastSaved": "Alterações guardadas em {section}",
  "sectionEditor.toastError":
    "Não conseguimos guardar isso agora. Tenta outra vez.",

  // Painel de publicação (SubprofilePublishPanel)
  "publishPanel.successTitle": "Estás",
  "publishPanel.successEm": "no ar",
  "publishPanel.closeLabel": "Continuar a editar",
  "publishPanel.viewLive": "Ver ao vivo",
  "publishPanel.successLinked":
    "Esta persona já aparece no teu perfil principal como mais uma das tuas personas.",
  "publishPanel.successUnlinked":
    "Esta persona já existe por si só. As pessoas conseguem encontrá-la pelo identificador e no diretório.",
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
    "Não conseguimos publicar. Vê os requisitos abaixo.",
  "publishPanel.toastUnpublished":
    "De volta a rascunho. Só tu consegues vê-la agora.",
  "publishPanel.toastError":
    "Não conseguimos fazer isso agora. Tenta outra vez.",

  // Assistente de nova persona, dois passos (NewSideModal + NewSideStepCraft
  // + NewSideStepIdentity). Passo 1 escolhe o ofício; passo 2 dá-lhe nome e
  // escolhe ligada-vs-autónoma.
  "newModal.stepCraftTitle": "Começar uma nova <em>persona</em>",
  "newModal.sub":
    "Cada uma é uma persona profissional tua. Escolhe para que serve.",
  "newModal.stepIdentityTitle": "Dá-lhe um <em>nome</em>",
  "newModal.stepIdentitySub":
    "Como é conhecida, e se dá para ver que és tu.",
  "newModal.stepOf": "Passo {step} de {total}",
  "newModal.cancel": "Cancelar",
  "newModal.back": "Voltar",
  "newModal.continue": "Continuar",
  "newModal.create": "Criar rascunho",
  "newModal.creating": "A criar…",
  "newModal.craftSummary":
    "Uma persona de {kind} tem uma página {skin} com {sections}.",
  "newModal.displayNameLabel": "Nome apresentado",
  "newModal.displayNameHelper":
    "Opcional. Deixa em branco para a persona ser conhecida pelo ofício.",
  "newModal.displayNamePlaceholderDefault": "Como esta persona é conhecida",
  "newModal.displayNamePlaceholderExample": "por ex. {kind}",
  "newModal.linkChoiceLabel": "Ligada ao teu perfil, ou com endereço próprio?",
  "newModal.linkedAddressNote": "Sempre tua. Nada a reclamar.",
  "newModal.standaloneNote":
    "Endereço próprio, sem nada a apontar de volta para ti. Tua para manteres à parte.",
  "newModal.handleStateClaim":
    "É teu se publicares primeiro. Os identificadores são por ordem de chegada.",
  "newModal.toastError":
    "Não conseguimos começar essa agora. Tenta outra vez.",

  // Duplicar uma persona — seletor de método inicial (StartMethodPicker) e
  // seletor de fonte/modo de cópia (CopySourcePicker, CopyModePreview),
  // usados no fluxo de criação quando já existem outras personas.
  "start.label": "Como queres começar?",
  "start.helper": "Escolhe um ponto de partida. Depois podes mudar tudo.",
  "start.copyDisabledHelper":
    "Cria primeiro uma persona para depois a poderes copiar aqui.",
  "start.template": "Por ofício",
  "start.blank": "Em branco",
  "start.copy": "Copiar uma",
  "copy.noSources": "Ainda não tens nenhuma persona para copiar.",
  "copy.sourceLabel": "Escolhe uma persona para copiar",
  "copy.modeLabel": "O que copiar",
  "copy.modeFull": "Tudo",
  "copy.modeContent": "Só o conteúdo",
  "copy.summaryCounts": "{items} itens · {links} links",
  "copy.summaryAffiliations": "{affiliations} afiliações",
  "copy.summaryIdentity": "· mais nome, biografia e estilo",
  "copy.summaryNoIdentity": "· identidade em branco",

  // Ofícios agrupados por família (kindFamilies.data.ts) — o passo "Por
  // ofício" agrupa os 17 ofícios sob estas seis famílias de página.
  "family.stage.label": "Palco",
  "family.stage.note": "Para ofícios que acontecem à frente de uma sala.",
  "family.studio.label": "Estúdio",
  "family.studio.note": "O trabalho primeiro, as legendas depois.",
  "family.page.label": "Página",
  "family.page.note": "Uma coluna de livro. As palavras é que contam.",
  "family.workshop.label": "Oficina",
  "family.workshop.note": "Coisas feitas, listadas sem rodeios.",
  "family.practice.label": "Consultório",
  "family.practice.note": "Calmo, credível, sem tipografia de destaque.",
  "family.table.label": "Mesa",
  "family.table.note": "Uma ementa para o que fazes e serves.",
  "family.chart.label": "Mapa",
  "family.chart.note": "Uma página de efemérides, lida pelo céu.",
  // Expanded craft families (personas expansion — 6 new page families)
  "family.chair.label": "Cadeira",
  "family.chair.note": "Um espelho iluminado e uma tabela de preços que nunca te pergunta o género.",
  "family.runway.label": "Passerelle",
  "family.runway.note": "Uma folha de lookbook: nome enorme, créditos minúsculos, imagens altas.",
  "family.gallery.label": "Galeria",
  "family.gallery.note": "Ar de museu. Cada item é uma legenda de parede.",
  "family.history.label": "Registo",
  "family.history.note": "Papel envelhecido e uma cronologia: datas à margem, fontes nomeadas.",
  "family.collective.label": "Cartaz",
  "family.collective.note": "Tinta riso em papel barato: um apelo no topo, datas que se leem à distância.",
  "family.classroom.label": "Sala de aula",
  "family.classroom.note": "Um quadro e um enunciado: semanas numeradas, preços ditos antes de perguntares.",

  // Modelos iniciais (Fase 4a) — seletor no momento de criação
  // (NewSideModal) e o botão "Inserir exemplos" no editor
  // (SubprofileSectionEditor). O texto dos exemplos lê-se como um
  // preenchimento simpático e editável — a ideia é que a pessoa o substitua
  // pelo seu próprio trabalho, não que o mantenha tal como está.
  "template.helper":
    "Os modelos preenchem as tuas secções com alguns exemplos e sugerem uma frase de apresentação. Tudo pode ser editado ou apagado.",
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
  "template.tagline.astrologer":
    "Mapas lidos com calma, para a vida que estás a viver.",
  "template.tagline.pole_dancer": "No varão e na sala: atuo e ensino.",
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
    "O que faz e como estás envolvido: mantenedor, colaborador, ou a começar agora.",
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
    "Um segundo exemplo. Troca por aquilo que melhor mostra o teu trabalho.",
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
  "template.section.classes.item1.title": "Uma aula que dou",
  "template.section.classes.item1.subtitle": "Nível · estúdio",
  "template.section.classes.item1.desc": "O que cobre e para quem é.",
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
  "template.section.charts.item1.title": "Uma leitura que ofereces",
  "template.section.charts.item1.subtitle": "Duração · preço",
  "template.section.charts.item1.desc": "O que abrange, e para quem é.",
  "template.section.sky.item1.title": "Um círculo ou workshop",
  "template.section.sky.item1.subtitle": "Onde acontece",
  "template.section.sky.item1.desc":
    "O que esperar. Sem conhecimento prévio assumido.",

  // Campo de imagem (ImageUploadField)
  "imageUpload.defaultPlaceholder": "Imagem",
  "imageUpload.change": "Alterar",
  "imageUpload.add": "Adicionar imagem",
  "imageUpload.remove": "Remover imagem",
  "imageUpload.removeConfirm.title": "Remover esta imagem?",
  "imageUpload.removeConfirm.body":
    "Ela será limpa deste campo. Podes adicionar outra quando quiseres.",
  "imageUpload.removeConfirm.confirm": "Remover",
  "imageUpload.removeConfirm.cancel": "Manter",

  // Cabeçalho da persona (SubprofileHero)
  "hero.message": "Mensagem",
  "hero.edit": "Editar persona",
  "hero.report.cta": "Denunciar esta persona",
  "hero.more.ariaLabel": "Mais ações para {name}",
  "hero.viewPhotoAria": "Ver foto de {name}",
  "hero.standalone": "Independente · {address}",
  "hero.noAddressYet": "Ainda sem endereço: define um handle para lhe dar um",

  // Bloco de título do skin oficina (SubprofileTitleBlock) — dl decorativo
  // mostrado apenas no skin oficina (controlado por CSS); "state" mostra
  // "Rascunho" no modo de pré-visualização (editor da Fase 3), "Publicada"
  // em todos os outros casos — a página de uma persona só é acessível depois
  // de publicada.
  "hero.titleblock.craft": "Ofício",
  "hero.titleblock.address": "Endereço",
  "hero.titleblock.sections": "Secções",
  "hero.titleblock.state": "Estado",

  // Controlo de recomendação (SubprofileEndorse)
  "hero.endorse.cta": "Recomendar",
  "hero.endorse.endorsed": "Recomendaste",
  "hero.endorse.count_one": "{count} recomendação",
  "hero.endorse.count_other": "{count} recomendações",
  "hero.endorse.addNote": "Adicionar nota",
  "hero.endorse.notePlaceholder": "Diz uma palavra sobre porquê (opcional)",
  "hero.endorse.send": "Enviar",
  "hero.endorse.error": "Não conseguimos guardar isso agora. Tenta outra vez.",
  "hero.endorse.endorsedByNames": "Com recomendação de {names}",

  // Endorse-with-note modal (EndorseSubprofileModal, EndorseSubprofileModalParts)
  "hero.endorse.modal.ariaLabel": "Recomendar {name}",
  "hero.endorse.modal.close": "Fechar",
  "hero.endorse.modal.eyebrow": "Adiciona a tua recomendação",
  "hero.endorse.modal.title": "Recomendar <em>{name}</em>",
  "hero.endorse.modal.sub":
    "Uma recomendação és tu, publicamente, a apoiar o trabalho de {name}. Se quiseres, deixa uma nota: uma palavra sobre o que fazem bem vale mais do que o número sozinho.",
  "hero.endorse.modal.noteLabel": "A tua nota",
  "hero.endorse.modal.optional": "opcional",
  "hero.endorse.modal.notePlaceholder":
    "Porque vale a pena recomendar {name}? O que devem os outros saber?",
  "hero.endorse.modal.noteOptional": "Opcional, mas uma nota diz mais",
  "hero.endorse.modal.charsCount_one": "{count} caráter",
  "hero.endorse.modal.charsCount_other": "{count} carateres",
  "hero.endorse.modal.cancel": "Cancelar",
  "hero.endorse.modal.save": "Guardar nota",
  "hero.endorse.modal.withdraw": "Retirar a recomendação",
  "hero.endorse.modal.sending": "A guardar…",
  "hero.endorse.modal.you": "Tu",
  "hero.endorse.modal.savedToast": "A tua nota foi guardada.",
  "hero.endorse.modal.withdrawnToast": "A tua recomendação foi retirada.",
  "hero.endorse.modal.success.title": "Obrigade pela tua <em>recomendação</em>.",
  "hero.endorse.modal.success.body":
    "A tua cara acabou de se juntar a quem recomenda <b>{name}</b>. É assim que o bom trabalho viaja por aqui. Pessoa a pessoa, nome a nome.",
  "hero.endorse.modal.success.doneCta": "Concluído",

  // Controlo de seguir (SubprofileFollow)
  "hero.follow.cta": "Seguir",
  "hero.follow.following": "A seguir",
  "hero.follow.count_one": "{count} seguidor",
  "hero.follow.count_other": "{count} seguidores",
  "hero.follow.error": "Não conseguimos guardar isso agora. Tenta outra vez.",

  // Controlo de partilha (SubprofileShare, MySubprofilesPage)
  "share.cta": "Partilhar",
  "share.ariaLabel": "Partilhar esta persona",
  "share.copied": "Link copiado",
  "share.copyFailed":
    "O teu navegador não nos deixou copiar. O link está aqui, seleciona-o e copia-o à mão.",
  "share.copyFailedWithUrl":
    "O teu navegador não nos deixou copiar. Aqui fica o link: {url}",
  "share.resolvingAddress":
    "Um momento, estamos a procurar o endereço desta persona.",

  // Modal de cartão de partilha (SubprofileShareCard) + código QR
  // (SubprofileQR) — pontos de entrada no SubprofileHero (público) e no
  // MySubprofilesPage (responsável).
  "shareCard.cta": "Código QR",
  "shareCard.title": "Leva contigo",
  "shareCard.subtitle":
    "Digitaliza para abrir a página de {name} noutro dispositivo, ou guarda os detalhes abaixo.",
  "shareCard.download": "Transferir cartão de contacto",
  "shareCard.qrAria": "Código QR que liga à página da persona de {name}",
  "shareCard.copyLink": "Copiar link",
  "qr.loading": "A gerar código QR…",
  "qr.error": "Não conseguimos gerar o código QR. Aqui tens o link em alternativa.",

  // Destaque do item em foco (SubprofileSpotlight)
  "spotlight.eyebrow": "Comece aqui",
  "spotlight.open": "Abrir",

  // Créditos de colaboração num item público (ItemCollaborators, em
  // SubprofileSections; também os créditos do item em destaque no
  // SubprofileSpotlight)
  "collab.with": "com",

  // Linhas de item de secção (SubprofileItemRow) — detalhes de concerto do
  // skin palco.
  "row.doors": "Portas {doors}",
  "row.ticketAria": "Comprar bilhetes para {title}",
  "row.played": "Já realizados",

  // Blocos de item de secção (SubprofileItemTile) — grelha de secção visual;
  // o número de "prancha" é decoração do skin estúdio (escondido por CSS
  // nos outros skins).
  "tile.plate": "Nº {number}",

  // Secção de galeria sem legendas (SubprofileSections) — texto alternativo
  // por foto, já que estes blocos não têm título/subtítulo próprio.
  "galleryPhotoAlt": "{name}, foto {number} da galeria",
  // Célula de galeria clicável + a lightbox de galeria em ecrã inteiro
  // (GalleryLightbox).
  "galleryPhotoOpen": "Abrir a foto {number} de {name} em ecrã inteiro",
  "galleryLightboxLabel": "Fotos de {name}",

  // Limite da secção de galeria no editor (SubprofileSectionEditor) — mostrado
  // no lugar do botão de acrescentar quando a galeria universal atinge o
  // máximo de 6 fotos.
  "galleryFull": "Máximo de 6 fotos",

  // Modal de adicionar fotos à galeria (várias de uma vez) — carregamento do
  // dispositivo + seletor de fotos anteriores, aberto pelo botão de acrescentar
  // da secção de galeria.
  "gallery.addTitle": "Adicionar fotos",
  "gallery.remaining": "Adiciona até mais {count}",
  "gallery.fromDevice": "Carregar do dispositivo",
  "gallery.uploading": "A carregar… {percent}%",
  "gallery.pastUploads": "As tuas fotos anteriores",
  "gallery.empty":
    "Ainda não carregaste nada. Adiciona do teu dispositivo aqui em cima.",
  "gallery.loadError": "Não conseguimos carregar as tuas fotos.",
  "gallery.retry": "Tentar novamente",
  "gallery.selectPhoto": "Adicionar esta foto",
  "gallery.deselectPhoto": "Remover esta foto",
  "gallery.inUse": "Em uso",
  "gallery.addCta": "Adicionar {count} à galeria",
  "gallery.someSkipped":
    "Só {count} puderam ser adicionadas. A galeria comporta 6.",

  // Página pública da persona (SubprofilePage.tsx)
  "page.loading": "A carregar persona…",
  "page.ownerTie": "Outra persona de <em>{name}</em>",
  "page.visit": "Visitar",
  "page.notFoundTitle": "Esta persona não está aqui",
  "page.notFoundMetaTitle": "Persona não encontrada · QueerPulse",
  "page.notFoundDescription":
    "Pode ter sido despublicada, mantida privada, ou este link pode estar desatualizado. Não há nada de errado do teu lado.",
  "page.notFoundAction": "Explorar personas",
  "page.notFoundBack": "Voltar atrás",

  // As outras três páginas de "não podemos mostrar isto" (SubprofilePageStates)
  // — já construídas, ainda não alcançáveis pelos dados atuais (ver
  // subprofilePageStates.data.ts para o porquê).
  "pageState.private.title": "Esta persona é privada",
  "pageState.private.description":
    "A pessoa responsável guarda esta persona só para si, por agora. Não há nada de errado do teu lado.",
  "pageState.private.action": "Explorar o diretório",
  "pageState.membersOnly.title": "Só para membros",
  "pageState.membersOnly.description":
    "Esta persona é visível para membros da comunidade com sessão iniciada.",
  "pageState.membersOnly.action": "Iniciar sessão",
  "pageState.membersOnly.secondaryAction": "Pedir um convite",
  "pageState.removed.title": "Esta persona foi retirada",
  "pageState.removed.description":
    "Já não cumpre as nossas diretrizes de comunidade e deixou de estar visível.",
  "pageState.removed.action": "Ler as diretrizes",

  // Barra de rascunho quando a pessoa responsável vê a sua própria persona por
  // publicar (SubprofileDraftBanner) — construída, ainda não ligada (ver o
  // comentário do próprio componente para o porquê).
  "draftBanner.message": "Rascunho. Mais ninguém consegue abrir este endereço ainda.",
  "draftBanner.readiness": "{ready} de {total} prontos para publicar",
  "draftBanner.edit": "Editar",
  "draftBanner.publish": "Publicar",

  // Anel de progresso de publicação do painel (SideReadinessRing, Fase 2) —
  // nome acessível do `.ring`; o `<i>` visível mostra só o número, isto
  // explica o que ele significa.
  "ring.ariaLabel": "{pct}% completo",

  // Cartão do painel (SideCard, Fase 2 Tarefa 5) — textos ainda não cobertos
  // por `mine.*` (nome por defeito, contagens de recomendações/seguidores,
  // Editar/Eliminar), `share.*` (Partilhar), `status.*` (Rascunho), ou
  // `link.*`/`availability.*` (as legendas dos pills de ligação/disponibilidade).
  "side.noTagline": "Ainda sem linha",
  "side.statusLive": "Ativo",
  "side.viewCta": "Ver",
  "side.thingsLeft_one": "Falta {count} coisa",
  "side.thingsLeft_other": "Faltam {count} coisas",
  "side.readyToPublish": "Pronto para publicar",
  "side.coOwners": "{count} coproprietários",

  // Afiliações ("Parte de") — secção pública (SubprofileAffiliations) e editor
  // do responsável (SubprofileAffiliationsEditor, SubprofileAffiliationRow).
  // `role` é um campo predefinido e PERSISTIDO (AFFILIATION_ROLE_KEYS em
  // affiliations.data.ts) — indireção por chave, tal como em `kind`.
  // Pré-visualização de citações de recomendação no rodapé (SubprofileAffiliations)
  // — "Ver todas N" abre o SubprofilePeopleModal no modo de recomendações.
  "foot.seeAllEndorsements_one": "Ver a {count} recomendação",
  "foot.seeAllEndorsements_other": "Ver todas as {count} recomendações",

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
    "Ainda nada ligado. Acrescenta um evento ou uma comunidade abaixo.",
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
    "Não conseguimos guardar isso agora. Tenta outra vez.",

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
    "Não conseguimos revogar isso agora. Tenta outra vez.",
  "owners.leaveCta": "Sair da persona",
  "owners.leaveModalTitle": "Sair desta persona?",
  "owners.leaveModalBody":
    "Vais perder a capacidade de a editar. Os outros responsáveis mantêm tudo como está.",
  "owners.leaveModalKeep": "Ficar",
  "owners.leaveModalConfirm": "Sair",
  "owners.leaveModalLeaving": "A sair…",
  "owners.toastLeft": "Saíste desta persona",
  "owners.toastLeaveError": "Não conseguimos fazer isso agora. Tenta outra vez.",
  "owners.removeAria": "Remover {name} da co-propriedade",
  "owners.removeConfirmTitle": "Remover {name}?",
  "owners.removeConfirmBody":
    "{name} perde todo o acesso a esta persona: edição, publicação, convites. Não fica com nada. Podes voltar a convidar essa pessoa mais tarde, se quiseres.",
  "owners.removeConfirmAction": "Remover",
  "owners.toastRemoved": "{name} já não faz parte desta persona",
  "owners.toastRemoveError":
    "Não conseguimos remover essa pessoa agora. Tenta outra vez.",

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
    "Convite enviado. A pessoa vai precisar de aceitar antes de poder gerir esta persona.",
  "invite.toastError": "Não conseguimos enviar esse convite. Tenta outra vez.",

  // Modal de convite a um responsável — etapa de confirmação/aviso (IDN-2):
  // aparece antes de o convite ser mesmo enviado, para que aceitar um convite
  // de responsável conjunto nunca seja uma surpresa quanto ao acesso que dá
  // ou, no caso de uma persona autónoma, ao que revela.
  "invite.confirmTitle": "Antes de enviares este convite",
  "invite.confirmBack": "Voltar",
  "invite.confirmSend": "Enviar convite",
  "invite.disclosureAccessTitle": "Acesso total de gestão",
  "invite.disclosureAccessBody":
    "Assim que {name} aceitar, vai poder editar, publicar e gerir todas as partes desta persona, tal como tu. É o único nível de acesso que os responsáveis conjuntos têm.",
  "invite.disclosureIdentityTitle": "Isto revela a tua identidade",
  "invite.disclosureIdentityBody":
    "Esta persona é autónoma, por isso quem a segue não consegue saber que é tua. Aceitar este convite muda isso: {name} vai poder ver a tua conta real assim que aceitar.",
  "invite.acknowledgeLinked":
    "Percebo que {name} vai ter acesso total de gestão a esta persona.",
  "invite.acknowledgeUnlinked":
    "Percebo que {name} vai ter acesso total de gestão a esta persona, e vai poder ver a minha identidade real.",

  // Painel de convites recebidos (PersonaInvitesBanner, em MySubprofilesPage)
  "invites.regionLabel": "Convites para seres responsável conjunta de uma persona",
  "invites.message": "{inviter} convidou-te para seres responsável conjunta de <em>{persona}</em>",
  "invites.accept": "Aceitar",
  "invites.accepting": "A aceitar…",
  "invites.decline": "Recusar",
  "invites.declining": "A recusar…",
  "invites.toastAccepted": "Agora és responsável conjunta de {name}",
  "invites.toastAcceptError": "Não conseguimos aceitar esse convite. Tenta outra vez.",
  "invites.toastDeclined": "Convite recusado",
  "invites.toastDeclineError": "Não conseguimos recusar esse convite. Tenta outra vez.",

  // Etapa de confirmação/aviso antes de aceitar um convite recebido (IDN-2):
  // o par, do lado de quem recebe, da etapa de confirmação do modal de
  // convite acima. Aceitar nunca deve ser uma surpresa quanto ao acesso que
  // dá ou, no caso de uma persona autónoma, ao que revela sobre quem aceita.
  "invites.confirmTitle": "Antes de aceitares",
  "invites.confirmSub": "Sobre seres responsável conjunta de {name}",
  "invites.confirmCancel": "Ainda não",
  "invites.confirmAccept": "Aceitar convite",
  "invites.disclosureAccessTitle": "Acesso total de gestão",
  "invites.disclosureAccessBody":
    "Aceitar dá-te o mesmo acesso total que os outros responsáveis conjuntos de {name}: vais poder editar, publicar e gerir todas as partes da persona. É o único nível de acesso que os responsáveis conjuntos têm, não há um nível só de visualização.",
  "invites.disclosureIdentityTitle": "Isto revela a tua identidade",
  "invites.disclosureIdentityBody":
    "{name} é autónoma, por isso quem a segue não consegue saber quem a gere. Aceitar este convite muda isso: a tua conta real fica visível para os outros responsáveis conjuntos assim que aceitares, e a deles fica visível para ti.",
  "invites.acknowledgeLinked":
    "Percebo que aceitar me dá acesso total de gestão a {name}.",
  "invites.acknowledgeUnlinked":
    "Percebo que aceitar me dá acesso total de gestão a {name}, e revela a minha identidade real aos outros responsáveis conjuntos.",

  // Modal de denúncia (SubprofileReportModal) + motivos específicos de
  // persona (subprofileReportModal.data.ts) — cada motivo continua a mapear
  // para um ReasonCode estável e já existente (ver o comentário do próprio
  // ficheiro), portanto isto é só texto sobre a mesma taxonomia partilhada
  // de /reports.
  "reportModal.title": "Denunciar {name}?",
  "reportModal.lead":
    "As denúncias são revistas pela nossa equipa de moderação. O teu nome nunca é partilhado com a pessoa que denuncias.",
  "reportModal.reasonLabel": "Qual é o problema?",
  "reportModal.reasons.impersonating": "A fingir ser outra pessoa",
  "reportModal.reasons.hateOrHarassment": "Discurso de ódio ou assédio",
  "reportModal.reasons.notReal": "Não é uma prática ou serviço real",
  "reportModal.reasons.sexualContent": "Conteúdo sexual sem aviso",
  "reportModal.reasons.spam": "Spam",
  "reportModal.reasons.somethingElse": "Outra coisa",
  "reportModal.noteLabel": "Mais alguma coisa? (opcional)",
  "reportModal.notePlaceholder":
    "Acrescenta qualquer detalhe que possa ajudar quem modera a rever isto.",
  "reportModal.cancelCta": "Cancelar",
  "reportModal.submitCta": "Enviar denúncia",
  "reportModal.submitting": "A enviar…",
  "reportModal.error": "Não conseguimos enviar essa denúncia. Tenta outra vez.",
  "reportModal.success.title": "Denúncia enviada",
  "reportModal.success.body":
    "Obrigado. Uma pessoa moderadora vai rever esta persona. Podemos contactar-te para mais detalhes, mas nunca partilhamos a tua denúncia com quem denunciaste.",
  "reportModal.success.doneCta": "Concluído",

  // Modal de pessoas (SubprofilePeopleModal) — lista de seguidores/recomendações,
  // aberta a partir dos botões ".pp-meta" do cabeçalho e do "Ver todos N" do
  // rodapé.
  "peopleModal.followersTitle_one": "{count} seguidor",
  "peopleModal.followersTitle_other": "{count} seguidores",
  "peopleModal.endorsementsTitle_one": "{count} recomendação",
  "peopleModal.endorsementsTitle_other": "{count} recomendações",
  "peopleModal.loading": "A carregar…",
  "peopleModal.noEndorsements": "Ainda sem recomendações",
  "peopleModal.noEndorsementsBody":
    "Quando alguém recomendar o trabalho desta persona, aparece aqui.",
  "peopleModal.noFollowers": "Ainda sem seguidores",
  "peopleModal.noNote": "Recomendou sem deixar nota",
  "peopleModal.removeAriaLabel": "Remover a tua recomendação a {name}",
  "peopleModal.removeCta": "Remover",
  "peopleModal.removeError": "Não conseguimos remover isso agora. Tenta outra vez.",
  "peopleModal.followersPrivateTitle": "Seguidores são privados",
  "peopleModal.followersPrivateBody":
    "Só a pessoa responsável por {name} vê quem a segue. Para toda a gente, seguir é anónimo. O teu nome nunca aparece aqui.",

  // Extras específicos de cada skin (SubprofileSkinExtras + skins/*.tsx) —
  // os blocos por família que a árvore de design da Fase 1 chama SkinExtras.
  "skinExtras.stage.nextUpLabel": "A seguir",
  "skinExtras.stage.bookerTitle": "Para quem contrata",
  "skinExtras.stage.bookerFee": "Cachê",
  "skinExtras.stage.bookerRider": "Rider técnico",
  "skinExtras.stage.bookerPress": "Imprensa",
  "skinExtras.stage.bookerContact": "Contacto",

  "skinExtras.studio.checklistTitle": "Checklist",
  "skinExtras.studio.plateLabel": "Prancha {n}",
  "skinExtras.studio.previous": "Trabalho anterior",
  "skinExtras.studio.next": "Trabalho seguinte",

  "skinExtras.page.excerptFrom": "De",

  "skinExtras.workshop.scaleLabel": "Sem escala",

  "skinExtras.practice.fee": "Valor",
  "skinExtras.practice.sliding": "Escala variável",
  "skinExtras.practice.length": "Duração da sessão",
  "skinExtras.practice.languages": "Idiomas",
  "skinExtras.practice.mode": "Formato",
  "skinExtras.practice.next": "Próxima disponibilidade",
  "skinExtras.practice.firstSessionTitle": "Como é uma primeira sessão",
  "skinExtras.practice.accessTitle": "O espaço em si",
  "skinExtras.practice.referralsNote":
    "Sem testemunhos públicos. A confidencialidade de quem é acompanhado vem primeiro. São apenas pessoas que já recomendaram este espaço a outras.",
  "skinExtras.practice.approachTitle": "Como trabalho",
  "skinExtras.practice.trainingTitle": "Formação e qualificações",
  "skinExtras.practice.feesTitle": "Valores",
  "skinExtras.practice.venueTitle": "Onde atendo",
  "skinExtras.practice.availabilityTitle": "Disponibilidade",
  "skinExtras.practice.availabilitySlot": "As sessões começam habitualmente às {time}",
  "skinExtras.practice.availabilityOpen": "Livre",
  "skinExtras.practice.availabilityFull": "Cheio",
  "skinExtras.practice.vouchesTitle": "Recomendado pela comunidade",

  "skinExtras.chart.skyNowLabel": "O céu hoje",
  "skinExtras.chart.birthDataTitle": "O que preciso de ti",
  "skinExtras.chart.birthDate": "Data",
  "skinExtras.chart.birthTime": "Hora",
  "skinExtras.chart.birthPlace": "Local",
  "skinExtras.chart.ethicsTitle": "O que uma leitura não é",
  // Expanded skin extras (personas expansion — chair/runway/gallery/history/collective/classroom render blocks)
  "skinExtras.chair.rate": "Preço",
  "skinExtras.chair.walkins": "Sem marcação",
  "skinExtras.chair.where": "Onde",
  "skinExtras.chair.quiet": "Horas calmas",
  "skinExtras.chair.beforeYouSitTitle": "Antes de te sentares",
  "skinExtras.runway.creditsTitle": "Créditos",
  "skinExtras.runway.press": "Imprensa",
  "skinExtras.runway.stockists": "À venda em",
  "skinExtras.runway.made": "Feito",
  "skinExtras.runway.contact": "Direto",
  "skinExtras.gallery.onViewLabel": "Em exposição",
  "skinExtras.gallery.visitTitle": "Visitar",
  "skinExtras.gallery.hours": "Horário",
  "skinExtras.gallery.address": "Morada",
  "skinExtras.gallery.access": "Acesso",
  "skinExtras.gallery.admission": "Entrada",
  "skinExtras.history.recordTitle": "O próprio registo",
  "skinExtras.history.held": "Guardado em",
  "skinExtras.history.access": "Acesso",
  "skinExtras.history.consent": "Consentimento",
  "skinExtras.history.gapsLabel": "Onde o registo é escasso",
  "skinExtras.collective.nextLabel": "A seguir",
  "skinExtras.collective.principlesTitle": "Como trabalhamos",
  "skinExtras.classroom.cost": "Custo",
  "skinExtras.classroom.materials": "Materiais",
  "skinExtras.classroom.where": "Onde e quando",
  "skinExtras.classroom.extras": "Também",
  "skinExtras.classroom.promisesTitle": "O que levas contigo",

  // Editor e leitor de poema com formatação (ofício poesia, skin página) —
  // blocos estruturados de estrofe/separador/nota com formatação em itálico/negrito.
  "poem.editor.label": "Poema",
  "poem.editor.stanzaPlaceholder": "Escreve uma estrofe. Enter para uma nova linha",
  "poem.editor.notePlaceholder": "Uma epígrafe ou dedicatória",
  "poem.editor.addStanza": "Estrofe",
  "poem.editor.addBreak": "Separador",
  "poem.editor.addNote": "Nota",
  "poem.editor.moveUp": "Mover bloco para cima",
  "poem.editor.moveDown": "Mover bloco para baixo",
  "poem.editor.remove": "Remover bloco",
  "poem.editor.dragToReorder": "Arrasta para reordenar",
  "poem.editor.blockLabel.stanza": "Estrofe {index} de {total}",
  "poem.editor.blockLabel.note": "Nota",
  "poem.editor.blockLabel.break": "Separador de secção",
  "poem.editor.italic": "Itálico",
  "poem.editor.bold": "Negrito",
  "poem.editor.toolbarAria": "Formatação de texto",
  "poem.editor.tabEdit": "Editar",
  "poem.editor.tabPreview": "Pré-visualização",
  "poem.editor.paneToggleAria": "Vista do editor",
  "poem.editor.resplit.title": "As quebras de linha deste poema podem ter-se perdido",
  "poem.editor.resplit.body": "Isto parece um poema mais antigo, guardado como uma única linha longa. Podemos sugerir novas quebras de linha a partir da pontuação. Depois poderás sempre editá-las.",
  "poem.editor.resplit.action": "Voltar a dividir em linhas",
  "poem.row.openAria": "Ler o poema “{title}”",
  "poem.reader.withLabel": "Com {names}",
  "poem.reader.sectionBreak": "Separador de secção",
  "poem.reader.copyLink": "Copiar link",
  "poem.reader.copyLinkAria": "Copiar link para o poema “{title}”",
  "poem.reader.copy": "Copiar poema",
  "poem.reader.copied": "Poema copiado",

  // Traduções/versões do poema — várias versões do mesmo poema (por ex.
  // original + traduções), percorridas por separadores no editor e no leitor.
  "poem.versions.add": "Adicionar uma tradução",
  "poem.versions.untitled": "Versão {index}",
  "poem.versions.namePlaceholder": "por ex. Português, English, Original",
  "poem.versions.nameAria": "Nome da tradução",
  "poem.versions.makeDefault": "Tornar predefinida",
  "poem.versions.remove": "Remover tradução",
  "poem.versions.tablistAria": "Traduções do poema",
  "poem.versions.readerAria": "Escolher uma tradução",

  // Rodapé público de direitos de autor + proveniência (WorkRightsFooter, protect-your-work Tarefa 3)
  "rights.copyright": "© {year} {author}. Todos os direitos reservados.",
  "rights.firstPublished": "Publicado pela primeira vez na QueerPulse · {date}",

  // Skin-blocks editor (personas expansion — page-block editor pane, rail entry & field labels)
  "editorRail.skinBlocks": "Blocos da página",
  "editorPane.skinBlocks.title": "Blocos da página",
  "editorPane.skinBlocks.lede": "Os detalhes próprios da tua página: condições de marcação, horários, o que trazer. Aparecem na tua página pública.",
  "pending.area.skin": "Blocos da página",
  "pending.skinEdited": "Atualização em {field}",
  "skinBlock.addItem": "Adicionar",
  "skinBlock.removeItem": "Remover",
  "skinBlock.moveUp": "Mover para cima",
  "skinBlock.moveDown": "Mover para baixo",
  "skinBlock.dragToReorder": "Arraste para reordenar",
  "skinBlock.lineLabel": "{label} {index}",
  "skinBlock.entryLabel": "Entrada {index}",
  "skinBlock.stage.booker.title": "Para quem contrata",
  "skinBlock.stage.booker.fee": "Cachê",
  "skinBlock.stage.booker.rider": "Rider técnico",
  "skinBlock.stage.booker.press": "Imprensa",
  "skinBlock.stage.booker.contact": "Contacto",
  "skinBlock.page.excerpt.title": "Excerto",
  "skinBlock.page.excerpt.from": "Atribuição",
  "skinBlock.page.excerpt.lines": "Linhas do excerto",
  "skinBlock.page.colophon.title": "Colofão",
  "skinBlock.table.menuMeta.title": "Detalhes do menu",
  "skinBlock.table.menuMeta.no": "Cabeçalho",
  "skinBlock.table.menuMeta.when": "Horário",
  "skinBlock.table.menuMeta.practical": "Notas práticas",
  "skinBlock.practice.practical.title": "Detalhes práticos",
  "skinBlock.practice.practical.fee": "Valor",
  "skinBlock.practice.practical.sliding": "Escala variável",
  "skinBlock.practice.practical.length": "Duração da sessão",
  "skinBlock.practice.practical.languages": "Idiomas",
  "skinBlock.practice.practical.mode": "Formato",
  "skinBlock.practice.practical.next": "Próxima disponibilidade",
  "skinBlock.practice.firstSession.title": "Como é uma primeira sessão",
  "skinBlock.practice.firstSession.stepTitle": "Título do passo",
  "skinBlock.practice.firstSession.body": "O que acontece",
  "skinBlock.practice.access.title": "O espaço em si",
  "skinBlock.practice.referrals.title": "Recomendações",
  "skinBlock.practice.referrals.name": "Nome",
  "skinBlock.practice.referrals.note": "Nota",
  "skinBlock.practice.approach.title": "Como trabalho",
  "skinBlock.practice.training.title": "Formação e qualificações",
  "skinBlock.practice.feeSchedule.title": "Valores",
  "skinBlock.practice.feeSchedule.label": "Descrição",
  "skinBlock.practice.feeSchedule.value": "Valor",
  "skinBlock.practice.venue.title": "Onde atendo",
  "skinBlock.practice.venue.name": "Nome do espaço",
  "skinBlock.practice.venue.lines": "Morada",
  "skinBlock.practice.availability.title": "Disponibilidade",
  "skinBlock.practice.availability.startDate": "O calendário começa (uma segunda-feira)",
  "skinBlock.practice.availability.slotTime": "Hora de início da sessão",
  "skinBlock.practice.availability.help": "Toca num dia para alternar: livre, depois cheio, depois sem sessões.",
  "skinBlock.practice.availability.cellLabel": "Espaço {slot}: {state}",
  "skinBlock.practice.availability.state_open": "livre",
  "skinBlock.practice.availability.state_full": "cheio",
  "skinBlock.practice.availability.state_off": "sem sessões",
  "skinBlock.chart.sky.title": "O céu hoje",
  "skinBlock.chart.sky.moon": "Lua",
  "skinBlock.chart.sky.phase": "Fase",
  "skinBlock.chart.sky.note": "Nota",
  "skinBlock.chart.birthData.title": "O que preciso de ti",
  "skinBlock.chart.birthData.date": "Data",
  "skinBlock.chart.birthData.time": "Hora",
  "skinBlock.chart.birthData.place": "Local",
  "skinBlock.chart.birthData.note": "Nota",
  "skinBlock.chart.ethics.title": "O que uma leitura não é",
  "skinBlock.chair.chair.title": "Na cadeira",
  "skinBlock.chair.chair.rate": "Preço",
  "skinBlock.chair.chair.walkins": "Sem marcação",
  "skinBlock.chair.chair.where": "Onde",
  "skinBlock.chair.chair.quiet": "Horas calmas",
  "skinBlock.chair.beforeYouSit.title": "Antes de te sentares",
  "skinBlock.runway.credits.title": "Créditos",
  "skinBlock.runway.credits.press": "Imprensa",
  "skinBlock.runway.credits.stockists": "Pontos de venda",
  "skinBlock.runway.credits.made": "Feito com",
  "skinBlock.runway.credits.contact": "Direto",
  "skinBlock.gallery.onView.title": "Em exposição",
  "skinBlock.gallery.onView.showTitle": "Título",
  "skinBlock.gallery.onView.artist": "Artista",
  "skinBlock.gallery.onView.dates": "Datas",
  "skinBlock.gallery.onView.room": "Sala",
  "skinBlock.gallery.visit.title": "Visitar",
  "skinBlock.gallery.visit.hours": "Horário",
  "skinBlock.gallery.visit.address": "Morada",
  "skinBlock.gallery.visit.access": "Acesso",
  "skinBlock.gallery.visit.admission": "Entrada",
  "skinBlock.history.record.title": "O próprio registo",
  "skinBlock.history.record.held": "Guardado em",
  "skinBlock.history.record.access": "Acesso",
  "skinBlock.history.record.consent": "Consentimento",
  "skinBlock.history.record.gaps": "Lacunas",
  "skinBlock.collective.nextAction.title": "A seguir",
  "skinBlock.collective.nextAction.what": "O quê",
  "skinBlock.collective.nextAction.when": "Quando",
  "skinBlock.collective.nextAction.where": "Onde",
  "skinBlock.collective.principles.title": "Como trabalhamos",
  "skinBlock.classroom.fees.title": "Preços",
  "skinBlock.classroom.fees.cost": "Custo",
  "skinBlock.classroom.fees.materials": "Materiais",
  "skinBlock.classroom.fees.where": "Onde",
  "skinBlock.classroom.fees.extras": "Extras",
  "skinBlock.classroom.fees.note": "Nota",
  "skinBlock.classroom.promises.title": "O que levas contigo",

  // Navegação lateral do editor (EditorRail, editorRail.data.ts) — os grupos
  // Este lado / Conteúdo / Pessoas / Publicar.
  "editorRail.navLabel": "Navegação do editor de persona",
  "editorRail.backLink": "As tuas personas",
  "editorRail.thisSide": "Esta persona",
  "editorRail.identity": "Identidade",
  "editorRail.presence": "Presença e contacto",
  "editorRail.address": "Endereço e alcance",
  "editorRail.content": "Conteúdo",
  "editorRail.people": "Pessoas",
  "editorRail.publishGroup": "Publicar",
  "editorRail.publish": "Publicar",
  "editorRail.getItLive": "Pôr no ar",

  // Cabeçalhos dos painéis do editor (EditorPaneRouter, editorPaneHeaders.data.ts)
  // — o h2 + subtítulo mostrados acima de cada painel, exceto os painéis de
  // Conteúdo por secção, que usam o próprio rótulo `section.*` da secção.
  "editorPane.identity.title": "Identidade",
  "editorPane.identity.lede":
    "O nome, avatar, frase de apresentação e biografia que apresentam esta persona.",
  "editorPane.presence.title": "Presença",
  "editorPane.presence.lede":
    "Imagem de capa, cor de destaque, disponibilidade e links sociais.",
  "editorPane.address.title": "Endereço",
  "editorPane.address.lede":
    "Escolhe como as pessoas encontram esta persona, e quem a pode ver.",
  "editorPane.content.lede":
    "Acrescenta as peças de trabalho que compõem esta secção.",
  "editorPane.publish.title": "Publicar",
  "editorPane.publish.lede": "Vê o que falta e depois publica esta persona.",

  // Pré-visualização ao vivo (EditorPreview) — mostra a página pública da
  // persona dentro do próprio editor.
  "editorPreview.label": "Pré-visualização ao vivo",
  "editorPreview.openLive": "Abrir ao vivo",

  // Barra fixa de guardar (EditorSavebar) — só é dona do interruptor de
  // pré-visualização; cada painel continua a guardar-se com o seu próprio
  // botão (ver o comentário do componente).
  "editorSavebar.status": "Cada secção guarda-se sozinha",
  "editorSavebar.hidePreview": "Esconder pré-visualização",
  "editorSavebar.showPreview": "Mostrar pré-visualização",

  // Lista global de alterações por guardar, "Guardar tudo" (EditorSavebar) —
  // substitui os botões de guardar por secção por uma única lista do que
  // está por guardar em todo o editor, agrupada por área da barra lateral,
  // mais um único par guardar/descartar.
  "pending.area.meta": "Este lado",
  "pending.area.socials": "Links sociais",
  "pending.area.affiliations": "Parte de",
  "pending.metaEdited": "Alteração em {field}",
  "pending.metaSet": "{field} → {value}",
  "pending.metaImage": "Atualização em {field}",
  "pending.metaImageRemoved": "Remoção de {field}",
  "pending.rowSummary": "{area}: {summary}",
  "pending.count.added": "{count} adicionados",
  "pending.count.removed": "{count} removidos",
  "pending.count.edited": "{count} editados",
  "pending.count.reordered": "reordenado",
  "pending.more": "+{count} mais",
  "pending.savedToast": "Guardadas {count} alterações",
  "pending.saveAll": "Guardar todas as alterações ({count})",
  "pending.saving": "A guardar…",
  "pending.discardAll": "Descartar tudo",
  "pending.saveError": "Não conseguimos guardar {areas}",
  "pending.heading": "Alterações por guardar",
  "pending.field.displayName": "Nome",
  "pending.field.tagline": "Frase de apresentação",
  "pending.field.bio": "Biografia",
  "pending.field.avatarUrl": "Avatar",
  "pending.field.coverUrl": "Imagem de capa",
  "pending.field.slug": "Endereço",
  "pending.field.handle": "Identificador",
  "pending.field.link": "Visibilidade (ligada)",
  "pending.field.visibility": "Quem pode ver",
  "pending.field.accent": "Cor de destaque",
  "pending.field.availability": "Disponibilidade",
  "pending.field.ctaLabel": "Texto do botão",
  "pending.field.ctaUrl": "Link do botão",
  "pending.field.coverBleed": "Borda do banner",

  // Gaveta de itens (SubprofileItemDrawer, EditorItemRow) — a lista de linhas
  // fechadas + a gaveta lateral que substituiu os antigos cartões de item
  // sempre abertos (antes `SubprofileItemEditor`, agora descontinuado).
  "itemDrawer.addTitle": "Acrescentar a {section}",
  "itemDrawer.editTitle": "Editar este item de {section}",
  "itemDrawer.cancel": "Cancelar",
  "itemDrawer.discardTitle": "Deitar isto fora?",
  "itemDrawer.discardBody":
    "Escreveste aqui alguma coisa e ainda não foi guardada. Se fechares, desaparece.",
  "itemDrawer.discardConfirm": "Deitar fora",
  "itemDrawer.discardKeep": "Continuar a editar",
  "itemDrawer.saveItem": "Guardar item",
  "itemRow.edit": "Editar",

  // Proteja este trabalho (ProtectWorkSection): descarregar/copiar/enviar
  // por email o registo de autoria do item, apenas para o dono, mostrado na
  // gaveta assim que o item está guardado (ver `authorshipRecord.ts` para o
  // conteúdo do registo em si).
  "protect.heading": "Proteja este trabalho",
  "protect.blurb":
    "Descarregue um registo datado do seu trabalho e envie-o para si próprio. É uma prova independente que pode guardar.",
  "protect.download": "Descarregar registo de autoria",
  "protect.copy": "Copiar registo",
  "protect.copied": "Copiado para a área de transferência",
  "protect.email": "Enviar para o meu email",
  "protect.failed": "Não foi possível gerar o registo. Tente novamente.",
  "protect.emailSubject": "Registo de autoria: {title}",
  // O texto do próprio registo (rights/authorshipRecord.ts). Só as etiquetas
  // são traduzidas; os valores ao lado (título, autoria, data, hash) são dados,
  // e o hash cobre a obra em si, por isso um registo traduzido verifica-se
  // exatamente como um em inglês.
  "protect.record.heading": "REGISTO DE AUTORIA: QueerPulse",
  "protect.record.work": "Obra",
  "protect.record.author": "Autoria",
  "protect.record.firstPublished": "Primeira publicação",
  "protect.record.contentHash": "SHA-256 do conteúdo",
  "protect.record.canonicalForm":
    "Forma canónica: título + corpo em texto simples, com quebras LF, sem espaços nas pontas",

  // Histórico de versões (ItemRevisionHistoryModal): lista de revisões
  // guardadas + ver + restaurar, aberto pelo botão "Histórico" na gaveta do
  // editor de item assim que um item está guardado (hooks `useItemRevisions`/
  // `useRestoreItemRevision` da Tarefa 9).
  "history.button": "Histórico",
  "history.heading": "Histórico de versões",
  "history.view": "Ver",
  "history.restore": "Restaurar",
  "history.empty": "Ainda não há versões anteriores. As edições guardadas aparecem aqui.",
  "history.restored": "Versão restaurada",
  "history.restoreFailed": "Não foi possível restaurar esta versão. Tente novamente.",

  // Campos ricos por secção (richFields.data.ts, mostrados por
  // SubprofileItemDrawerFields) — detalhes de concertos, suporte/edição de
  // trabalho visual, e estado/trecho de código de projetos, sobre o conjunto
  // base `field.*`.
  "richField.gigState.label": "Estado",
  "richField.gigState.option.none": "Normal",
  "richField.gigState.option.sold_out": "Esgotado",
  "richField.gigState.option.cancelled": "Cancelado",
  "richField.gigState.option.guest": "Set convidado",
  "richField.venue.label": "Local",
  "richField.venue.placeholder": "por ex. O Pátio",
  "richField.doors.label": "Abertura de portas",
  "richField.doors.placeholder": "por ex. 21h",
  "richField.ticketUrl.label": "Link de bilhetes",
  "richField.ticketUrl.placeholder": "https://",
  "richField.medium.label": "Suporte",
  "richField.medium.placeholder": "por ex. Óleo sobre tela",
  "richField.dimensions.label": "Dimensões",
  "richField.dimensions.placeholder": "por ex. 40 × 60 cm",
  "richField.edition.label": "Edição",
  "richField.edition.placeholder": "por ex. 3 de 10",
  "richField.workState.label": "Estado",
  "richField.workState.option.none": "Normal",
  "richField.workState.option.shipped": "Lançado",
  "richField.workState.option.archived": "Arquivado",
  "richField.workState.option.in_progress": "Em curso",
  "richField.snippet.label": "Trecho de código",
  "richField.snippet.placeholder": "Uma linha por trecho",

  // Aviso de mudança de endereço (AddressChangeWarningModal) — mostrado antes
  // de o endereço de uma persona PUBLICADA mudar mesmo: ao trocar entre
  // ligada/autónoma, ou ao editar um slug/identificador já ao vivo.
  "addressWarning.switchTitle": "Mudar onde esta persona é encontrada?",
  "addressWarning.editTitle": "Mudar o endereço desta persona?",
  "addressWarning.noticeTitle": "Este endereço está no ar",
  "addressWarning.noticeBody":
    "Já há pessoas com links para {from}. Depois de confirmares, esta persona passa a {to}.",
  "addressWarning.oldLinksDie": "Os links antigos para {path} deixam de funcionar",
  "addressWarning.handleReleased":
    "O teu identificador volta a ficar disponível. Qualquer pessoa o pode reclamar",
  "addressWarning.followersKept":
    "Os teus seguidores e as tuas recomendações mantêm-se exatamente como estão",
  "addressWarning.cancel": "Manter o endereço atual",
  "addressWarning.confirm": "Mudar endereço",

  // Painel de publicação — extras (SubprofilePublishPanel) — uma estimativa
  // rápida, feita no cliente, mostrada antes de tentares publicar (separada
  // da lista de verificação oficial `checklist.*` abaixo), e a linha de
  // eliminar na zona de perigo.
  "publishPanel.estimateTitle": "Estimativa rápida",
  "publishPanel.estimateNote":
    "Uma ideia rápida de como estás. A lista de verificação abaixo é que decide mesmo se podes publicar.",
  "publishPanel.deleteCopy":
    "Eliminar esta persona remove-a, e tudo o que está nela, para sempre.",
  "publishPanel.deleteCta": "Eliminar esta persona",

  // Medidor da lista de verificação (PublishChecklist) — a barra `.meter`
  // ao lado das linhas de passa/falha acima.
  "checklist.meterAria": "{passed} de {total} requisitos cumpridos",
  "checklist.meterLabel": "{passed}/{total}",

  // Eliminar com confirmação escrita (SubprofileDeleteModal, zona de perigo
  // do editor) — a lista "o que vais perder" mais a confirmação por nome
  // escrito.
  "deleteConfirm.losingItems_one": "{count} item nas tuas secções",
  "deleteConfirm.losingItems_other": "{count} itens nas tuas secções",
  "deleteConfirm.losingEndorsements_one": "{count} recomendação",
  "deleteConfirm.losingEndorsements_other": "{count} recomendações",
  "deleteConfirm.losingFollowers_one": "{count} seguidor",
  "deleteConfirm.losingFollowers_other": "{count} seguidores",
  "deleteConfirm.losingHandle":
    "O teu identificador, @{handle}, volta a ficar disponível",
  "deleteConfirm.typeLabel": 'Escreve "{name}" para confirmar',
  "deleteConfirm.typeHelper": "Isto garante que tens mesmo a certeza.",

  // Persona audit remediation (2026-08-11)
  "section.countLabel_one": "{count} item",
  "section.countLabel_other": "{count} itens",
  "page.ogImageAlt": "{name}, {craft} na QueerPulse",
  "peopleModal.followersCountOnlyTitle": "Os seguidores ficam privados",
  "peopleModal.followersCountOnlyBody":
    "{name} tem {count} seguidores, mas seguir é anónimo. Mostramos o número e mantemos todos os nomes privados.",
  "publishPanel.saveFirstHint":
    "Guarda as alterações primeiro. A publicação verifica o perfil guardado.",
  "editor.errorTitle": "Não foi possível carregar esta persona",
  "editor.errorDescription":
    "Algo correu mal ao contactar o servidor. Nada se perdeu. Verifica a ligação e tenta novamente.",
  "editor.errorRetry": "Tentar novamente",
  "metaForm.ctaLabelError":
    "Adiciona um rótulo para as pessoas saberem o que este botão faz.",
  "metaForm.ctaUrlError": "Adiciona um link para onde este botão aponta.",
  "metaForm.bioMinRemaining_one": "Falta {count} caráter para publicar",
  "metaForm.bioMinRemaining_other": "Faltam {count} carateres para publicar",
  "metaForm.bioMinMet": "Já dá para publicar",
  "pending.blockedName":
    "Esta persona precisa de um nome. Adiciona-o no separador Identidade.",
  "pending.blockedHandle":
    "Esse endereço já está em uso. Escolhe outro no separador Endereço.",
  "newModal.toastHandleClaimFailed":
    "Esse identificador foi reservado agora mesmo. Mantivemos esta persona associada ao teu perfil por enquanto. Podes reclamar um novo endereço no editor.",
  "invite.loadMore": "Mostrar mais ligações",
  "invite.loadingMore": "A carregar…",

  "editorSavebar.mobilePreview": "Pré-visualizar",
  "mobilePreview.ariaLabel": "Pré-visualização da tua página de persona",
};
