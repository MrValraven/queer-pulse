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

  // Bloco "Também como…" no perfil principal (ProfileSubprofilesSection)
  "alsoAs.title": "Também a trabalhar como",
  "alsoAs.subtitlePublic": "Personas profissionais ligadas a este perfil.",
  "alsoAs.subtitleSelf": "As personas profissionais que ligaste aqui.",
  "alsoAs.subtitleEmpty": "Outro lado do teu trabalho pode viver aqui.",
  "alsoAs.manage": "Gerir subperfis →",
  "alsoAs.empty.title": "Adiciona um subperfil profissional",
  "alsoAs.empty.description":
    "Mostra outro lado do teu trabalho — a tua música, o teu código, a tua escrita — ligado aqui ou por si só.",
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
  "mine.rowEdit": "Editar",
  "mine.rowDelete": "Eliminar",

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
  "metaForm.save": "Guardar detalhes",
  "metaForm.saving": "A guardar…",
  "metaForm.toastSaved": "Detalhes guardados",
  "metaForm.toastError":
    "Não conseguimos guardar isso agora — tenta outra vez.",

  // Editor de item (SubprofileItemEditor)
  "itemEditor.itemNumber": "Item {n}",
  "itemEditor.moveUp": "Mover para cima",
  "itemEditor.moveDown": "Mover para baixo",
  "itemEditor.remove": "Remover",
  "itemEditor.tagsHelper": "Separa com vírgulas",

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

  // Campo de imagem (ImageUploadField)
  "imageUpload.defaultPlaceholder": "Imagem",
  "imageUpload.uploading": "A carregar…",
  "imageUpload.change": "Alterar",
  "imageUpload.add": "Adicionar imagem",
  "imageUpload.remove": "Remover imagem",
  "imageUpload.error":
    "Não conseguimos adicionar essa imagem. Tenta outra vez.",

  // Página pública da persona (SubprofilePage + subprofilePage.data.ts)
  "page.loading": "A carregar persona…",
  "page.ownerTie": "Parte de <em>{name}</em>",
  "page.visit": "Visitar",
  "page.notFoundTitle": "Esta persona não está aqui",
  "page.notFoundDescription":
    "Pode ter sido despublicada, mantida privada, ou este link pode estar desatualizado. Não há nada de errado do teu lado.",
  "page.notFoundAction": "Explorar personas",
  "page.notFoundBack": "Voltar atrás",
};
