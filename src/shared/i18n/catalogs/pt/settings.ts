import type { Catalog } from "../../types";

/**
 * Definições — pt-PT inclusivo. Mesmas chaves que `en/settings.ts`.
 *
 * Definições relacionadas com segurança (saída rápida), privacidade
 * (visibilidade, exportação/eliminação de dados) e identidade (pronomes,
 * identidades) exigem precisão acima de estilo — ver notas junto de cada
 * chave sensível.
 */
export const settings: Catalog = {
  // ── Navegação das Definições (settings.data.ts NAV) ──────────────────────
  "nav.group.preferences": "Preferências",
  "nav.group.privacyData": "Privacidade e dados",
  "nav.group.account": "Conta",
  "nav.group.personalisation": "Personalização",
  "nav.group.prototype": "Protótipo",
  "nav.group.dangerZone": "Zona de perigo",
  "nav.item.notifications": "Notificações",
  "nav.item.language": "Idioma e terminologia",
  "nav.item.data": "Dados e privacidade",
  "nav.item.visibility": "Visibilidade",
  "nav.item.safety": "Segurança",
  "nav.item.profile": "Perfil",
  "nav.item.account": "Conta",
  "nav.item.profileTheme": "Tema do perfil",
  "nav.item.accessibility": "Acessibilidade",
  "nav.item.interests": "Interesses",
  "nav.item.simulations": "Simulações",
  "nav.item.deleteAccount": "Eliminar conta",

  // ── Guia de terminologia da comunidade (settings.data.ts TERMS) ──────────
  "terms.queer.name": "Queer",
  "terms.queer.def":
    "Um termo abrangente para identidades sexuais e de género que não são heterossexuais nem cisgénero. Reapropriado de um insulto; o uso varia — algumas pessoas mais velhas da comunidade podem preferir não o usar.",
  "terms.cisgender.name": "Cisgénero",
  "terms.cisgender.def":
    "Descreve alguém cuja identidade de género corresponde ao sexo atribuído à nascença. Não é um juízo de valor — é apenas um descritor neutro.",
  "terms.nonBinary.name": "Não-binárie",
  "terms.nonBinary.def":
    "Uma identidade de género que existe fora do binário homem/mulher. Algumas pessoas não-binárias usam pronomes neutros; pergunta sempre, nunca presumas.",
  "terms.twoSpirit.name": "Two-spirit",
  "terms.twoSpirit.def":
    "Um termo usado por algumas culturas indígenas norte-americanas para uma pessoa que incorpora espíritos masculinos e femininos. Não é equivalente aos termos LGBTQ+ ocidentais.",

  // ── SettingsPage.tsx (barra de guardar + confirmação de eliminação) ──────
  "page.saveBar.unsaved": "Tens alterações por guardar.",
  "page.saveBar.discard": "Descartar",
  "page.saveBar.save": "Guardar alterações",
  "page.saveBar.savedToast": "Definições guardadas",
  "page.saveBar.saveErrorToast":
    "Não foi possível guardar as tuas alterações. Tenta novamente.",

  // ── SettingsControls.tsx — DeleteAccountModal (primeira confirmação) ─────
  "controls.deleteModal.title": "Eliminar a tua conta?",
  "controls.deleteModal.body":
    "A eliminação apaga permanentemente o teu perfil, mensagens, publicações nas comunidades e todos os dados associados no prazo de 30 dias. Não pode ser revertida. Recomendamos que descarregues primeiro os teus dados. De seguida, vais confirmar a tua palavra-passe e enviaremos um email para concluíres o pedido.",
  "controls.deleteModal.cancel": "Cancelar",
  "controls.deleteModal.continue": "Continuar para eliminar",

  // ── SettingsModals.tsx — chrome partilhado dos modais ────────────────────
  "modals.common.close": "Fechar",
  "modals.common.done": "Concluído",

  // ── SettingsModals.tsx — SuggestEditModal (guia de terminologia) ─────────
  "modals.suggestEdit.ariaLabel": "Sugerir uma alteração a {term}",
  "modals.suggestEdit.success.title": "Agradecemos — <em>anotado.</em>",
  "modals.suggestEdit.success.body":
    "A tua sugestão de alteração a <strong>{term}</strong> está com a nossa equipa editorial da comunidade. As alterações de terminologia são revistas antes de serem publicadas; iremos avisar-te do que acontece.",
  "modals.suggestEdit.eyebrow": "Terminologia · sugerir uma alteração",
  "modals.suggestEdit.title": "Refina <em>{term}.</em>",
  "modals.suggestEdit.desc":
    "Este guia é editado pela comunidade. Sugere uma redação mais clara ou uma correção — todas as alterações são revistas antes de serem publicadas.",
  "modals.suggestEdit.wordingLabel": "A tua sugestão de redação",
  "modals.suggestEdit.wordingPlaceholder":
    "Uma definição mais clara de «{term}»…",
  "modals.suggestEdit.whyLabel": "Porquê mudar?",
  "modals.suggestEdit.optional": "(opcional)",
  "modals.suggestEdit.whyPlaceholder": "Contexto que ajude a equipa editorial",
  "modals.suggestEdit.sending": "A enviar…",
  "modals.suggestEdit.send": "Enviar sugestão",
  "modals.suggestEdit.cancel": "Cancelar",

  // ── SettingsModals.tsx — DataExportModal (transferência simulada) ───────
  "modals.dataExport.eyebrow": "Dados e privacidade",
  "modals.dataExport.preparingBody":
    "A reunir os teus dados e a preparar um ficheiro JSON. Isto costuma demorar um momento…",
  "modals.dataExport.readyTitle": "A tua exportação está <em>pronta.</em>",
  "modals.dataExport.readyBody":
    "Preparámos os teus dados em <strong>{filename}</strong>. No produto real também te enviaríamos um link seguro por email — aqui já podes descarregá-lo.",
  "modals.dataExport.downloadCta": "Descarregar {filename}",

  // ── SettingsPersonalisation.tsx — ProfileThemePane ───────────────────────
  "personalisation.theme.title": "Tema do <em>perfil.</em>",
  "personalisation.theme.sub":
    "Personaliza o aspeto do teu perfil e do cartão no diretório. Escolhe uma bandeira, um estilo de capa e um padrão — e o que aparece junto ao teu nome.",

  // ── SettingsPersonalisation.tsx — AccessibilityPane ──────────────────────
  "personalisation.accessibility.title":
    "Preferências de <em>acessibilidade.</em>",
  "personalisation.accessibility.sub":
    "Ajusta a visualização, o movimento, a leitura e a interação ao teu gosto. Estas definições aplicam-se a toda a plataforma.",
  "personalisation.accessibility.resetAll": "Repor todas as preferências",
  "personalisation.accessibility.resetNote":
    "Isto repõe todas as definições de visualização para os valores predefinidos. Os dados do teu perfil não são afetados.",
  "personalisation.accessibility.deviceNote":
    "As tuas preferências são guardadas localmente neste dispositivo.",
  "personalisation.accessibility.resetToast":
    "Todas as preferências foram repostas",

  // ── SafetyPane.tsx — controlo de segurança de saída rápida ──────────────
  // Precisão acima de tudo: a saída rápida limpa o *ecrã*, não é anonimato
  // e não apaga o histórico do navegador. Mantém essa distinção exata.
  "safety.title": "Segurança e <em>saída rápida.</em>",
  "safety.sub":
    "Uma forma rápida de limpar o ecrã se alguém entrar na sala. Estas definições vivem só neste dispositivo — nunca ficam associadas à tua conta.",
  "safety.gdprBox":
    "<strong>A saída rápida limpa o ecrã depressa — não é anonimato.</strong> Envia este separador para uma página neutra do estado do tempo e reabre a QueerPulse noutro separador. Não consegue apagar o teu histórico anterior do navegador, marcadores ou sugestões da barra de endereço — para isso, usa também uma janela privada.",
  "safety.section.quickExit": "Saída rápida",
  "safety.toggle.showButton.title": "Mostrar o botão de saída rápida",
  "safety.toggle.showButton.desc":
    "Um botão flutuante, em todas as páginas, que sai do site instantaneamente. Ativo por predefinição, para a segurança de todes.",
  "safety.toggle.doubleTap.title": "Atalho de duplo toque no Shift",
  "safety.toggle.doubleTap.desc":
    "Carrega duas vezes na tecla Shift para saíres sem teres de procurar o botão. Só funciona enquanto o botão de saída rápida estiver ativo.",

  // ── InterestsPane.tsx ─────────────────────────────────────────────────────
  // NOTA: IDENTITIES.options / LOOKING_FOR.options (interests.data.ts) são o
  // valor *guardado* de draft.identities / draft.lookingFor, lido noutros
  // pontos da app (tipo Member, diretório) fora do âmbito desta varredura.
  // Traduzir a etiqueta sem uma divisão id/label-key no mesmo âmbito
  // dessincronizaria silenciosamente o valor guardado da sua apresentação —
  // ficam em inglês, sinalizado no relatório para um follow-up coordenado.
  "interests.title": "Molda o que <em>vês.</em>",
  "interests.sub":
    "Isto é privado — não aparece no teu perfil. Ajuda-nos a mostrar-te convívios, pessoas e conteúdo relevante para ti. Podes mudar isto quando quiseres.",
  "interests.identities.heading": "Que identidades sentes como tuas?",
  "interests.identities.skip": "Saltar",
  "interests.identities.skipped": "Saltado",
  "interests.identities.helper":
    "Seleciona quantas fizerem sentido. Usamos isto para sugerir comunidades e conteúdo relevantes — não para te categorizar.",
  "interests.lookingFor.heading": "O que procuras aqui?",
  "interests.lookingFor.helper": "Seleciona quantas quiseres.",
  "interests.life.heading": "Um pouco sobre a tua vida",
  "interests.life.note": "(privado — ajuda com sugestões locais)",
  "interests.life.cityLabel": "Cidade / região",
  "interests.life.languagesLabel": "Idiomas",
  "interests.life.languagesPlaceholder": "ex.: português, inglês",
  "interests.life.ageLabel": "A tua faixa etária",
  "interests.life.ageNote": "(opcional — nunca é mostrado a outras pessoas)",
  "interests.reading.heading": "O que gostas de ler?",
  "interests.reading.frequencyHeading":
    "Com que frequência queres ter notícias nossas?",
  "interests.content.heading": "Definições de conteúdo",
  "interests.content.helper":
    "Desativar isto nunca afeta o teu acesso à comunidade — só o teu feed.",
  "interests.content.legalNote":
    "Estas preferências são privadas. Só tu e a QueerPulse podem vê-las.",

  // ── interests.data.ts — faixas etárias (só o índice é guardado) ─────────
  "interests.age.under25": "Menos de 25",
  "interests.age.25to35": "25–35",
  "interests.age.35to45": "35–45",
  "interests.age.45plus": "45+",

  // ── interests.data.ts — frequência de email (o id "daily"/"weekly"/
  // "important" é o valor guardado; só título/descrição são traduzidos) ───
  "interests.freq.daily.title": "Resumo diário",
  "interests.freq.daily.desc":
    "Um email por dia com as tuas atualizações principais",
  "interests.freq.weekly.title": "Resumo semanal",
  "interests.freq.weekly.desc": "Um resumo semanal com o que importa",
  "interests.freq.important.title": "Só o importante",
  "interests.freq.important.desc":
    "Apenas notificações que precisam da tua ação",

  // ── interests.data.ts — preferências de leitura (interruptores só de UI,
  // sem valor guardado além do estado local do componente) ────────────────
  "interests.readingPref.longform": "Artigos longos e ensaios",
  "interests.readingPref.memberStories":
    "Histórias e ensaios pessoais de pessoas da comunidade",
  "interests.readingPref.resourcesGuides": "Recursos e guias",
  "interests.readingPref.communityThreads":
    "Tópicos e discussões da comunidade",

  // ── interests.data.ts — definições de conteúdo (idem) ────────────────────
  "interests.contentSetting.dating": "Conteúdo sobre convívios e relações",
  "interests.contentSetting.mentalHealth":
    "Conteúdo sobre saúde mental e bem-estar",
  "interests.contentSetting.sexualityIdentity":
    "Conteúdo sobre exploração da sexualidade e identidade",

  // ── SimulationPreviewModal.tsx ────────────────────────────────────────────
  "previewModal.ariaLabel": "Pré-visualização: {title}",
  "previewModal.kicker": "Pré-visualização",
  "previewModal.deviceGroupAriaLabel": "Largura da pré-visualização",
  "previewModal.mobile": "Telemóvel",
  "previewModal.desktop": "Computador",
  "previewModal.openFullScreen": "Abrir em ecrã inteiro",
  "previewModal.closeAriaLabel": "Fechar pré-visualização",

  // ── SettingsPanes.tsx — NotificationsPane ────────────────────────────────
  "notifications.title": "Preferências de <em>notificações.</em>",
  "notifications.sub":
    "Controlo detalhado sobre o que chega até ti e como. Nunca te enviaremos algo que não tenhas pedido.",
  "notifications.section.gatherings": "Convívios",
  "notifications.section.messagesConnections": "Mensagens e ligações",
  "notifications.section.communitiesBoard": "Comunidades e mural",
  "notifications.section.delivery": "Entrega",
  "notifications.section.newslettersEmail": "Newsletters e email",
  "notifications.gatherings.newAnnounced.title": "Novo convívio anunciado",
  "notifications.gatherings.newAnnounced.desc":
    "Quando é publicado um convívio que corresponde aos teus interesses",
  "notifications.gatherings.rsvpReminder.title":
    "Lembrete de confirmação de presença",
  "notifications.gatherings.rsvpReminder.desc":
    "48 horas antes de um convívio a que confirmaste presença",
  "notifications.gatherings.lastFewSpots.title": "Últimas vagas",
  "notifications.gatherings.lastFewSpots.desc":
    "Quando um convívio que guardaste está quase esgotado",
  "notifications.messages.newMessage.title": "Nova mensagem",
  "notifications.messages.newMessage.desc":
    "Quando alguém te envia uma mensagem direta",
  "notifications.messages.connectionRequest.title": "Pedido de ligação",
  "notifications.messages.connectionRequest.desc":
    "Quando alguém te pede para se ligar a ti",
  "notifications.messages.sayHello.title": "Recebeste um «Olá»",
  "notifications.messages.sayHello.desc": "Quando alguém te acena no perfil",
  "notifications.communities.newPost.title":
    "Nova publicação nas minhas comunidades",
  "notifications.communities.newPost.desc":
    "Atividade nas comunidades a que te juntaste",
  "notifications.communities.threadReply.title":
    "Resposta a um tópico em que participo",
  "notifications.communities.threadReply.desc":
    "Quando alguém responde a um tópico em que participaste",
  "notifications.communities.weeklyDigest.title":
    "Resumo semanal da comunidade",
  "notifications.communities.weeklyDigest.desc":
    "Um resumo tranquilo do que se passa — um email, uma vez por semana",
  "notifications.delivery.email.title": "Notificações por email",
  "notifications.delivery.email.desc":
    "Com que frequência agrupar e enviar notificações por email",
  "notifications.delivery.email.immediately": "Imediatamente",
  "notifications.delivery.email.dailyDigest": "Resumo diário",
  "notifications.delivery.email.weeklyDigest": "Resumo semanal",
  "notifications.delivery.email.never": "Nunca",
  "notifications.delivery.quietHours.title": "Horas de silêncio",
  "notifications.delivery.quietHours.desc": "Não enviar nada entre estas horas",
  "notifications.delivery.quietHours.none": "Sem horas de silêncio",
  "notifications.newsletter.title": "Preferências de newsletters e email",
  "notifications.newsletter.desc":
    "Escolhe que newsletters e fluxos de email recebes — edições da revista, resumos de eventos, anúncios da comunidade e mais.",
  "notifications.newsletter.manage": "Gerir",

  // ── SettingsPanes.tsx — LanguagePane ──────────────────────────────────────
  "language.title": "Idioma e <em>terminologia.</em>",
  "language.sub":
    "Uma referência viva, mantida atualizada pela comunidade. Procura um termo para veres como o usamos em toda a QueerPulse.",
  "language.section.platformPreference": "Preferência de idioma da plataforma",
  "language.interfaceLanguage.title": "Idioma da interface",
  "language.interfaceLanguage.desc":
    "O idioma que a QueerPulse usa nos menus, etiquetas e mensagens do sistema. O português ainda está a ser traduzido em toda a plataforma — algumas páginas ficam em inglês por agora.",
  "language.section.terminologyGuide": "Guia de terminologia da comunidade",
  "language.searchPlaceholder": "Procurar termos…",

  // ── SettingsPanes.tsx — DataPane (privacidade/RGPD — precisão acima de estilo)
  "data.title": "Dados e <em>privacidade.</em>",
  "data.sub":
    "Os teus dados pertencem-te. Recolhemos o mínimo necessário para gerir a plataforma e nunca os vendemos. Podes descarregar ou eliminar tudo a qualquer momento.",
  "data.gdprBox":
    "<strong>Conforme com o RGPD.</strong> A QueerPulse está sujeita à lei de proteção de dados da UE e ao RGPD português. Os teus direitos incluem acesso, correção, portabilidade e eliminação. Esta página é como os exerces.",
  "data.section.yourData": "Os teus dados",
  "data.download.title": "Descarregar os teus dados",
  "data.download.desc":
    "Uma exportação completa do teu perfil, mensagens, publicações nas comunidades e atividade. Entregue como ficheiro JSON no prazo de 48 horas.",
  "data.download.cta": "Pedir exportação",
  "data.downloadMessages.title": "Descarregar as tuas mensagens",
  "data.downloadMessages.desc":
    "O teu histórico completo de mensagens, exportado como texto simples.",
  "data.downloadMessages.cta": "Exportar mensagens",
  "data.correct.title": "Corrigir dados incorretos",
  "data.correct.desc":
    "Se tivermos dados sobre ti que estejam factualmente incorretos, tens o direito de os fazer corrigir.",
  "data.correct.cta": "Contactar a equipa de dados",
  "data.section.cookiePrivacy": "Escolhas de cookies e privacidade",
  "data.consent.analytics.title": "Dados analíticos e de utilização",
  "data.consent.analytics.desc":
    "Padrões de utilização anónimos e agregados para melhorar a plataforma. Sem monitorização individual, sem redes publicitárias. Desligado a menos que o ativares.",
  "data.consent.monitoring.title": "Relatórios de falhas e erros",
  "data.consent.monitoring.desc":
    "Diagnósticos automáticos quando algo falha, para conseguirmos corrigi-lo mais depressa. Sem dados de publicidade ou definição de perfis.",
  "data.cookiePrefs.title": "Gerir preferências de cookies",
  "data.cookiePrefs.desc":
    "Consulta o detalhe completo do que é guardado e muda qualquer escolha. Os cookies estritamente necessários mantêm-te com sessão iniciada e estão sempre ativos.",
  "data.cookiePrefs.cta": "Abrir preferências",
  "data.section.personalisation": "Personalização",
  "data.searchPersonalisation.title": "Personalização da pesquisa",
  "data.searchPersonalisation.desc":
    "Usa os teus interesses e ligações para melhorar as pessoas e convívios sugeridos. Uma preferência de produto — fica na tua conta, não é monitorização.",
  "data.section.dangerZone": "Zona de perigo",
  "data.deactivate.title": "Desativar conta",
  "data.deactivate.desc":
    "O teu perfil torna-se invisível e deixas de receber notificações. Podes reativá-la a qualquer momento voltando a iniciar sessão. Os teus dados são mantidos.",
  "data.deactivate.cta": "Desativar",
  "data.deletePermanently.title": "Eliminar conta permanentemente",
  "data.deletePermanently.desc":
    "Elimina permanentemente o teu perfil, mensagens e todos os dados associados no prazo de 30 dias. Não pode ser revertido.",
  "data.deletePermanently.cta": "Eliminar conta",
  "data.fineprint":
    "Ao abrigo do artigo 17.º do RGPD, tens o direito ao apagamento. Os pedidos de eliminação são processados no prazo de 30 dias. Alguns dados podem ser mantidos quando exista uma obrigação legal para tal.",
  "data.export.full.title": "A preparar a tua exportação completa",
  "data.export.messages.title": "A preparar as tuas mensagens",
  "data.export.messages.note":
    "Exportação simples do teu histórico completo de mensagens.",

  // ── SettingsPanes.tsx — SimulationsPane ───────────────────────────────────
  "simulations.title": "Simulações de <em>fluxos.</em>",
  "simulations.sub":
    "Pré-visualiza as principais jornadas de uma pessoa da comunidade, do início ao fim. Os ecrãs de estado abrem numa pré-visualização em moldura de dispositivo aqui mesmo; os fluxos mais elaborados abrem os ecrãs reais para os percorreres exatamente como qualquer outra pessoa.",
  "simulations.preview": "Pré-visualizar",
  "simulations.start": "Iniciar simulação",

  // ── SettingsPanes.tsx — VisibilityPane (quem pode encontrar/contactar-te)
  // Os ids "open"/"network"/"private" são o valor guardado — nunca traduzir
  // o id, só a etiqueta/descrição mostrada.
  "visibility.title": "Visibilidade do <em>perfil.</em>",
  "visibility.sub":
    "Controla quem te consegue encontrar e contactar. Podes mudar isto a qualquer momento, sem perguntas.",
  "visibility.section.whoCanSee": "Quem pode ver o teu perfil",
  "visibility.open.title": "Aberto a ligações",
  "visibility.open.desc":
    "Qualquer pessoa na rede pode ver o teu perfil e dizer olá",
  "visibility.network.title": "Só a rede",
  "visibility.network.desc": "Visível para pessoas a duas ligações de ti",
  "visibility.private.title": "Manter discreto por agora",
  "visibility.private.desc":
    "Contacto quando for a altura certa. Perfil não visível na pesquisa.",
  "visibility.section.additionalControls": "Controlos adicionais",
  "visibility.newArrivals.title": "Mostrar-me em «Novidades»",
  "visibility.newArrivals.desc":
    "Diz à comunidade que te juntaste recentemente",
  "visibility.suggestedConnections.title": "Aparecer em ligações sugeridas",
  "visibility.suggestedConnections.desc":
    "Permite à plataforma sugerir-te a pessoas com interesses em comum",
  "visibility.activityStatus.title": "Mostrar estado de atividade",
  "visibility.activityStatus.desc":
    "Deixa as pessoas verem a tua última atividade (aproximada)",

  // ── SettingsPanes.tsx — AccountPane ────────────────────────────────────────
  "account.title": "Definições da <em>conta.</em>",
  "account.sub": "Preferências de sessão e segurança.",
  "account.section.account": "Conta",
  "account.emailAddress.title": "Endereço de email",
  "account.emailAddress.desc":
    "O endereço associado à tua conta e início de sessão.",
  "account.section.security": "Segurança",
  "account.twoFactor.title": "Autenticação de dois fatores",
  "account.twoFactor.desc":
    "Adiciona um segundo passo ao iniciar sessão num novo dispositivo",
  "account.loginAlerts.title": "Alertas de início de sessão",
  "account.loginAlerts.desc":
    "Avisa-me por email quando a minha conta é acedida a partir de um novo dispositivo",

  // ── EditProfileSidebar.tsx / editProfileNav.data.tsx ─────────────────────
  "editProfile.nav.group.profile": "Perfil",
  "editProfile.nav.group.privacy": "Privacidade",
  "editProfile.nav.identity.label": "Identidade e foto",
  "editProfile.nav.pronouns.label": "Pronomes e nome",
  "editProfile.nav.bio.label": "Biografia e ocupação",
  "editProfile.nav.links.label": "Ligações e redes sociais",
  "editProfile.nav.skills.label": "Competências e interesses",
  "editProfile.nav.visibility.label": "Visibilidade dos campos",
  "editProfile.nav.more": "Mais",
  "editProfile.nav.pronounsGuideLink": "Guia de pronomes",

  // ── EditProfilePage.tsx (barra de guardar + confirmação de gravação) ─────
  "editProfile.savedBar.updated":
    "Guardado. Atualizado <strong>{sections}</strong>.",
  "editProfile.savedBar.upToDate": "Guardado. O teu perfil está atualizado.",
  "editProfile.saveBar.unsavedLabel": "Alterações por guardar em {sections}",
  "editProfile.saveBar.discard": "Descartar",
  "editProfile.saveBar.saving": "A guardar…",
  "editProfile.saveBar.save": "Guardar perfil",

  // ── EditProfilePane.tsx — toasts ──────────────────────────────────────────
  "editProfile.toast.photoRemoved": "Foto removida.",
  "editProfile.toast.photoRestored": "Foto restaurada a partir da Google.",

  // ── EditProfileSections.tsx — IdentitySection ────────────────────────────
  "editProfile.identity.title": "Identidade <em>e foto</em>",
  "editProfile.identity.sub":
    "É assim que apareces às outras pessoas da comunidade.",
  "editProfile.identity.uploadPhoto": "Carregar nova foto",
  "editProfile.identity.removePhoto": "Remover foto",
  "editProfile.identity.useGooglePhoto": "Usar a tua foto da Google",
  "editProfile.identity.photoHint.default":
    "JPG ou PNG · máx. 5 MB · funciona melhor em formato quadrado",
  "editProfile.identity.photoHint.google":
    "Podemos recuperar a foto da conta com que iniciaste sessão.",
  "editProfile.identity.displayNameLabel": "Nome de apresentação",
  "editProfile.identity.displayNameHint":
    "O teu nome de apresentação é o que as pessoas leem; o teu nome de utilizador abaixo é a tua identificação.",
  "editProfile.identity.locationLabel": "Localização em Lisboa",
  "editProfile.identity.locationOptional": "opcional",
  "editProfile.identity.locationPlaceholder": "ex.: Mouraria, Intendente…",
  "editProfile.identity.locationHint":
    "Apenas ao nível do bairro — nunca a morada exata.",

  // ── EditProfileSections.tsx — PronounsSection ────────────────────────────
  "editProfile.pronouns.title": "Pronomes <em>e nome</em>",
  "editProfile.pronouns.sub":
    "O teu nome escolhido e os teus pronomes aparecem em toda a plataforma. Consulta o <a>guia de pronomes</a> se estiveres a atualizar um nome legal em toda a plataforma.",
  "editProfile.pronouns.label": "Pronomes",
  "editProfile.pronouns.writeOwnLabel": "Escreve os teus",
  "editProfile.pronouns.writeOwnPlaceholder": "Ou escreve os teus…",
  "editProfile.pronouns.hint":
    "Podes selecionar várias etiquetas acima. Os pronomes só são mostrados no teu perfil — não em meta tags nem em URLs.",
  "editProfile.pronouns.chosenNameLabel": "Nome escolhido",
  "editProfile.pronouns.chosenNameOptional":
    "se for diferente do nome de apresentação",
  "editProfile.pronouns.chosenNamePlaceholder":
    "Nome a usar em todas as comunicações",
  "editProfile.pronouns.chosenNameHint":
    "Usado nos emails que enviamos e em qualquer comunicação da plataforma.",

  // ── EditProfileSections.tsx — BioSection ─────────────────────────────────
  "editProfile.bio.title": "Biografia <em>e ocupação</em>",
  "editProfile.bio.sub":
    "Conta à comunidade quem és. Não é preciso linguagem de currículo.",
  "editProfile.bio.label": "Biografia",
  "editProfile.bio.placeholder": "Algumas frases sobre ti…",
  "editProfile.bio.occupationLabel": "Ocupação",
  "editProfile.bio.organisationLabel": "Organização",
  "editProfile.bio.organisationOptional": "opcional",
  "editProfile.bio.organisationPlaceholder": "Onde trabalhas ou estudas",

  // ── LinksSection.tsx ──────────────────────────────────────────────────────
  "editProfile.links.title": "Ligações <em>e redes sociais</em>",
  "editProfile.links.sub":
    "Adiciona o teu site e perfis de redes sociais. Cada um aparece com o respetivo ícone no teu perfil.",
  "editProfile.links.platformAriaLabel": "Plataforma da ligação",
  "editProfile.links.linkAriaLabel": "Ligação de {platform}",
  "editProfile.links.removeAriaLabel": "Remover ligação de {platform}",
  "editProfile.links.addLink": "Adicionar uma ligação",

  // ── EditProfileSections.tsx — SkillsSection ──────────────────────────────
  "editProfile.skills.title": "Competências <em>e interesses</em>",
  "editProfile.skills.sub":
    "Usado para encontrar correspondências na bolsa de competências e para te ligar a pessoas com interesses semelhantes.",
  "editProfile.skills.offerLabel": "Competências que podes oferecer",
  "editProfile.skills.offerPlaceholder":
    "ex.: Aconselhamento jurídico, Design gráfico…",
  "editProfile.skills.add": "Adicionar",
  "editProfile.skills.interestsLabel": "Interesses",
  "editProfile.skills.interestsPlaceholder":
    "ex.: Política de habitação, Cinema, Culinária…",

  // ── EditProfileSections.tsx — VisibilitySection (cosmético, comingSoon) ──
  "editProfile.visibility.title": "Visibilidade <em>dos campos</em>",
  "editProfile.visibility.sub":
    "A visibilidade por campo estará disponível brevemente. Por agora, usa o separador Visibilidade para definir quem pode ver todo o teu perfil.",
  "editProfile.visibility.alwaysOn": "Sempre ativo",
  "editProfile.visibility.optionMembers": "Pessoas",
  "editProfile.visibility.optionConnectionsOnly": "Só ligações",
  "editProfile.visibility.optionHidden": "Oculto",
  "editProfile.visibility.field.displayName.name": "Nome de apresentação",
  "editProfile.visibility.field.displayName.desc":
    "Sempre público dentro da QueerPulse",
  "editProfile.visibility.field.photo.name": "Foto",
  "editProfile.visibility.field.photo.desc": "Foto de perfil",
  "editProfile.visibility.field.pronouns.name": "Pronomes",
  "editProfile.visibility.field.pronouns.desc":
    "Forma como preferes que te tratem",
  "editProfile.visibility.field.bio.name": "Biografia",
  "editProfile.visibility.field.bio.desc": "O teu texto de apresentação",
  "editProfile.visibility.field.occupation.name": "Ocupação",
  "editProfile.visibility.field.occupation.desc": "Cargo e organização",
  "editProfile.visibility.field.location.name": "Localização",
  "editProfile.visibility.field.location.desc": "Bairro em Lisboa",
  "editProfile.visibility.field.skills.name": "Competências",
  "editProfile.visibility.field.skills.desc":
    "Competências e interesses oferecidos",
  "editProfile.visibility.field.link.name": "Ligação",
  "editProfile.visibility.field.link.desc": "URL externo no teu perfil",

  // ── UsernameSection.tsx ────────────────────────────────────────────────────
  "editProfile.username.title": "O teu <em>nome de utilizador</em>",
  "editProfile.username.sub":
    "Esta é a tua identificação em toda a QueerPulse — como as pessoas encontram o teu perfil. Escolhe uma que seja tua; podes mudá-la mais tarde, embora as ligações antigas deixem de apontar para aqui.",
  "editProfile.username.fieldLabel": "Nome de utilizador",
  "editProfile.username.fieldHint":
    "Letras minúsculas, números e hífenes — de 3 a 30 carateres.",
  "editProfile.username.save": "Guardar nome de utilizador",
  "editProfile.username.saving": "A guardar…",
  "editProfile.username.previewPrefix":
    "O teu perfil está em <strong>/members/{handle}</strong>",
  "editProfile.username.toast.updated": "Nome de utilizador atualizado.",
  "editProfile.username.error.taken":
    "Já há alguém com esse nome — tenta outro.",
  "editProfile.username.error.reserved":
    "Essa palavra está reservada para a plataforma — tenta outra.",
  "editProfile.username.error.invalid":
    "Esse nome de utilizador não é permitido — verifica o formato e tenta novamente.",
  "editProfile.username.error.generic":
    "Não conseguimos atualizar o teu nome de utilizador agora — tenta novamente.",

  // ── UsernameField.tsx / usernameField.data.ts ────────────────────────────
  "usernameField.defaultLabel": "Nome de utilizador",
  "usernameField.placeholder": "oteunome",
  "usernameField.checking": "A verificar…",
  "usernameField.free": "Parece livre — este pode ser teu.",
  "usernameField.yours": "Este é o teu nome de utilizador.",
  "usernameField.reason.invalid":
    "Os nomes de utilizador têm de 3 a 30 carateres — letras minúsculas, números e hífenes.",
  "usernameField.reason.reserved":
    "Essa palavra está reservada para a plataforma — tenta outra.",
  "usernameField.reason.taken": "Já há alguém com esse nome — tenta outro.",

  // ── SessionsPage.tsx — chrome (os registos de sessão são mock/dados
  // vindos de GET /account/sessions — ficam em inglês) ─────────────────────
  "sessions.ago.justNow": "agora mesmo",
  "sessions.ago.unknown": "desconhecido",
  "sessions.backToSecurity": "← Segurança",
  "sessions.eyebrow": "Segurança · Sessões ativas",
  "sessions.h1": "Onde tens <em>sessão iniciada</em> agora mesmo.",
  "sessions.lead":
    "Todos os dispositivos com uma sessão ativa. Se algo aqui parecer estranho, termina a sessão — e lê <a>o que fazer a seguir</a>.",
  "sessions.bulk.onlyDevice":
    "Este é o único dispositivo em que tens sessão iniciada.",
  "sessions.bulk.multi_one":
    "Tens sessão iniciada em <strong>{count} dispositivo</strong>. Termina a sessão em qualquer um que não reconheças.",
  "sessions.bulk.multi_other":
    "Tens sessão iniciada em <strong>{count} dispositivos</strong>. Termina a sessão em qualquer um que não reconheças.",
  "sessions.bulk.signOutAll": "Terminar sessão em todos os outros dispositivos",
  "sessions.sectionActiveNow": "Ativas agora",
  "sessions.card.badgeThis": "Esta sessão",
  "sessions.card.badgeReview": "Rever",
  "sessions.card.signedIn": "Sessão iniciada <strong>{when}</strong>",
  "sessions.card.lastActivity": "Última atividade <strong>{when}</strong>",
  "sessions.card.current": "Atual",
  "sessions.card.signOut": "Terminar sessão",
  "sessions.empty.error.title": "Não conseguimos carregar as tuas sessões",
  "sessions.empty.error.desc":
    "Em vez de te mostrarmos uma lista em que não podemos confiar, não mostrámos nada. Tenta novamente dentro de momentos.",
  "sessions.empty.none.title": "Sem sessões ativas",
  "sessions.empty.none.desc":
    "Não há sessão iniciada em lado nenhum agora — nem mesmo neste dispositivo, o que normalmente significa que a tua sessão está prestes a ser renovada.",
  "sessions.toast.signedOut":
    "Sessão terminada. Se não reconhecemos esse dispositivo, enviaremos um email para o endereço registado.",
  "sessions.toast.signedOutError":
    "Não conseguimos terminar essa sessão. Tenta novamente.",
  "sessions.toast.signedOutAll":
    "Sessão terminada em todos os outros dispositivos",
  "sessions.toast.signedOutAllError":
    "Não conseguimos terminar as outras sessões. Tenta novamente.",
  "sessions.footNote":
    "<strong>Algo parece errado?</strong> Termina a sessão em qualquer dispositivo que não reconheças e <a>conta-nos o que aconteceu</a> — vamos ajudar-te a proteger a tua conta. Quando terminas a sessão de um dispositivo não reconhecido, enviamos um email para o endereço registado para que fique um registo à parte do que aconteceu.",

  // ── DataExportPage.tsx — hero + toast + outro ────────────────────────────
  "dataExport.hero.eyebrow": "Os teus dados · RGPD, art.º 20",
  "dataExport.hero.titleLine1": "Os teus dados.",
  "dataExport.hero.titleLine2": "Teus, para levares.",
  "dataExport.hero.sub":
    "Ao abrigo do RGPD, tens o direito de receber uma cópia de todos os dados pessoais que guardamos sobre ti, num formato legível por máquina. É aqui que os pedes. Sem formulários. Sem salas de espera. Só os teus dados.",
  "dataExport.toast.selectType": "Seleciona pelo menos um tipo de dados.",
  "dataExport.outro.titleLine1": "Perguntas sobre",
  "dataExport.outro.titleLine2": "os teus dados?",
  "dataExport.outro.sub":
    "Escreve à nossa equipa de dados. Respondemos a todos os pedidos no prazo de 5 dias úteis.",
  "dataExport.outro.cta": "Contacta-nos",

  // ── DataExportSections.tsx — DataExportSteps ─────────────────────────────
  "dataExport.steps.step1.label": "Escolhe o que exportar",
  "dataExport.steps.step1.desc":
    "Seleciona os tipos de dados que queres incluir no teu arquivo.",
  "dataExport.steps.step2.label": "Confirma a tua identidade",
  "dataExport.steps.step2.desc":
    "Enviamos uma ligação de verificação para o teu endereço registado.",
  "dataExport.steps.step3.label": "Descarrega o teu arquivo",
  "dataExport.steps.step3.desc":
    "Uma ligação de utilização única, disponível durante 7 dias.",

  // ── DataExportSections.tsx — DataExportForm ──────────────────────────────
  "dataExport.form.title": "Pede o teu <em>arquivo de dados</em>",
  "dataExport.form.sub":
    "Seleciona as categorias que queres incluir. Podes pedir uma exportação completa ou apenas tipos de dados específicos. Enviamos-te uma ligação segura assim que o teu arquivo estiver pronto.",
  "dataExport.form.includeLabel": "O que incluir",
  "dataExport.form.formatLabel": "Formato do ficheiro",
  "dataExport.form.legalNote":
    "Ao abrigo do <strong>artigo 20.º do RGPD</strong>, fornecemos os teus dados no prazo de <strong>30 dias</strong> após um pedido verificado. O arquivo é encriptado em trânsito e a ligação de transferência é de utilização única.",
  "dataExport.form.submitting": "A pedir…",
  "dataExport.form.submit": "Pedir o meu arquivo de dados",
  "dataExport.format.both": "Ambos",

  // ── dataExport.data.ts — DATA_TYPES (form checklist) ─────────────────────
  "dataExport.type.profile.label": "Perfil e identidade",
  "dataExport.type.profile.sub": "Nome, pronomes, biografia, foto",
  "dataExport.type.messages.label": "Mensagens",
  "dataExport.type.messages.sub": "Todas as conversas diretas e de grupo",
  "dataExport.type.forumPosts.label": "Publicações no fórum",
  "dataExport.type.forumPosts.sub": "Todas as publicações, respostas, reações",
  "dataExport.type.events.label": "Eventos",
  "dataExport.type.events.sub":
    "Confirmações de presença, histórico de participação",
  "dataExport.type.connections.label": "Ligações",
  "dataExport.type.connections.sub":
    "Pessoas que segues ou com quem tens uma ligação",
  "dataExport.type.activityLog.label": "Registo de atividade",
  "dataExport.type.activityLog.sub":
    "Histórico de início de sessão, sessões em dispositivos",

  // ── DataExportSections.tsx — DataExportStatus ────────────────────────────
  "dataExport.status.ready.title": "O teu arquivo está pronto",
  "dataExport.status.ready.body":
    "Também enviámos esta ligação para o teu endereço registado. É de utilização única.",
  "dataExport.status.ready.bodyWithExpiry":
    "Também enviámos esta ligação para o teu endereço registado. É de utilização única e expira a <strong>{date}</strong>.",
  "dataExport.status.expired.title": "Essa ligação expirou",
  "dataExport.status.expired.body":
    "Por segurança, as ligações de exportação expiram ao fim de 7 dias. Pede um novo arquivo e vamos construí-lo outra vez.",
  "dataExport.status.failed.title": "Isso não funcionou",
  "dataExport.status.failed.body":
    "Não conseguimos construir o teu arquivo agora — nada saiu da tua conta. Tenta novamente dentro de momentos.",
  "dataExport.status.retry": "Pedir novamente",
  "dataExport.status.building.title": "A construir o teu arquivo",
  "dataExport.status.building.body":
    "Estamos a reunir os teus dados e a prepará-los. Isto pode demorar um pouco — enviamos-te um email assim que estiver pronto, para poderes fechar esta página.",
  "dataExport.status.download": "Descarregar {filename}",

  // ── DataExportSections.tsx — DataExportIncluded ──────────────────────────
  "dataExport.included.title": "O que está <em>incluído</em>",
  "dataExport.included.sub":
    "Um resumo de cada categoria de dados que guardamos e o que cada uma contém.",

  // ── dataExport.data.ts — ACCORDION_ITEMS ─────────────────────────────────
  "dataExport.accordion.profile.title": "Perfil e identidade",
  "dataExport.accordion.profile.body":
    "O teu nome de apresentação, nome de utilizador, pronomes, biografia, ocupação, foto de perfil e quaisquer ligações que tenhas adicionado ao teu perfil.",
  "dataExport.accordion.messages.title": "Mensagens",
  "dataExport.accordion.messages.body":
    "Todas as mensagens diretas e conversas de grupo em que participaste. Inclui o conteúdo das mensagens, datas/horas e confirmações de leitura. As mensagens de pessoas que eliminaram a conta são anonimizadas.",
  "dataExport.accordion.forumPosts.title": "Publicações e respostas no fórum",
  "dataExport.accordion.forumPosts.body":
    "Cada publicação e resposta que fizeste no fórum, incluindo o tópico a que pertence, quaisquer edições e reações que deste ou recebeste.",
  "dataExport.accordion.events.title": "Eventos",
  "dataExport.accordion.events.body":
    "Eventos a que confirmaste presença, eventos que marcaste como tendo interesse, confirmação de participação quando aplicável, e quaisquer mensagens relacionadas com eventos.",
  "dataExport.accordion.connections.title": "Ligações",
  "dataExport.accordion.connections.body":
    "Uma lista das pessoas que segues, das pessoas que te seguem, e quaisquer relações de ligação explícitas. Não inclui os contactos de outras pessoas.",
  "dataExport.accordion.activitySessions.title": "Atividade e sessões",
  "dataExport.accordion.activitySessions.body":
    "Datas/horas de início de sessão, tipos de dispositivo (navegador/SO), endereços IP (apenas dos últimos 90 dias) e informação de sessões ativas. Não registamos o histórico de navegação dentro da plataforma.",
  "dataExport.accordion.preferences.title": "Preferências e definições",
  "dataExport.accordion.preferences.body":
    "As tuas preferências de notificações, definições de privacidade, seleção de idioma e qualquer outra configuração de conta que tenhas definido.",
  "dataExport.accordion.payments.title": "Pagamentos (se aplicável)",
  "dataExport.accordion.payments.body":
    "Se contribuíste para eventos pagos ou para o fundo da comunidade, um registo das datas e montantes das transações. Não guardamos dados de cartão — os pagamentos são processados pela Stripe.",

  // ── dataExport.data.ts — shared accordion tag dictionary ─────────────────
  "dataExport.tag.name": "nome",
  "dataExport.tag.pronouns": "pronomes",
  "dataExport.tag.bio": "biografia",
  "dataExport.tag.photo": "foto",
  "dataExport.tag.occupation": "ocupação",
  "dataExport.tag.links": "ligações",
  "dataExport.tag.content": "conteúdo",
  "dataExport.tag.timestamps": "datas e horas",
  "dataExport.tag.readReceipts": "confirmações de leitura",
  "dataExport.tag.attachments": "anexos",
  "dataExport.tag.posts": "publicações",
  "dataExport.tag.replies": "respostas",
  "dataExport.tag.edits": "edições",
  "dataExport.tag.reactions": "reações",
  "dataExport.tag.rsvps": "confirmações de presença",
  "dataExport.tag.attendance": "presença",
  "dataExport.tag.interest": "interesse",
  "dataExport.tag.follows": "quem segues",
  "dataExport.tag.connections": "ligações",
  "dataExport.tag.blockedList": "lista de bloqueados",
  "dataExport.tag.logins": "inícios de sessão",
  "dataExport.tag.deviceTypes": "tipos de dispositivo",
  "dataExport.tag.ipAddresses": "endereços IP",
  "dataExport.tag.sessions": "sessões",
  "dataExport.tag.notifications": "notificações",
  "dataExport.tag.privacy": "privacidade",
  "dataExport.tag.language": "idioma",
  "dataExport.tag.appearance": "aparência",
  "dataExport.tag.transactions": "transações",
  "dataExport.tag.amounts": "montantes",
  "dataExport.tag.dates": "datas",
  "dataExport.demoArchiveNote":
    "Exportação de demonstração gerada no navegador — nenhum dado pessoal saiu deste dispositivo.",

  // ── LinkedAccountsPage.tsx / LinkedAccountsSections.tsx — só chrome. `name`
  // (marca do fornecedor/app) e `detail` (valores de conta mock que
  // representam campos vindos do servidor) ficam em inglês, conforme a
  // política no cabeçalho deste ficheiro. ─────────────────────────────────
  "linkedAccounts.eyebrow": "Segurança · Contas ligadas",
  "linkedAccounts.heading":
    "Métodos de início de sessão e <em>aplicações ligadas.</em>",
  "linkedAccounts.lead":
    "Duas listas separadas. <strong>Métodos de início de sessão</strong> são formas alternativas de iniciar sessão na QueerPulse. <strong>Aplicações ligadas</strong> são serviços de terceiros a quem deste acesso limitado. <em>Podes revogar qualquer uma, a qualquer momento.</em>",
  "linkedAccounts.section.signInMethods": "Métodos de início de sessão",
  "linkedAccounts.ssoNote":
    "<strong>Sobre o SSO e a privacidade.</strong> Ligar a Google ou a Apple significa que esses serviços sabem que tens uma conta QueerPulse, mas não o que fazes aqui. <em>Nunca veem as tuas mensagens, publicações ou participação em comunidades.</em> Se tiveres receio de uma conta Google do trabalho se ligar à tua vida queer, usa antes a ligação mágica — é a nossa opção mais privada.",
  "linkedAccounts.section.connectedApps":
    "Aplicações ligadas · acesso de terceiros",
  "linkedAccounts.section.connectAnother": "Ligar outra",
  "linkedAccounts.browseIntegrations.name": "Explorar integrações disponíveis",
  "linkedAccounts.browseIntegrations.detail":
    "Stripe (faturação de apoiantes), Mastodon, Spotify (Salas de Áudio), exportação iCal e mais 4",
  "linkedAccounts.browse": "Explorar",
  "linkedAccounts.ssoNoteAccent":
    "<strong>As permissões têm um âmbito restrito.</strong> Nenhuma aplicação ligada consegue ler as tuas mensagens diretas, os teus rascunhos, a tua faturação ou a tua participação em comunidades. Se alguma vez quiseres uma auditoria completa, pede uma <a>exportação de dados</a>.",
  "linkedAccounts.confirmUnlink":
    "Desligar/revogar esta ligação? Podes voltar a ligar quando quiseres.",
  "linkedAccounts.toast.revoked": "Ligação revogada",
  "linkedAccounts.toast.calendarCopied": "URL do calendário copiado",

  // ── linkedAccounts.data.ts — estados do badge (enum fixo, não vindo do servidor)
  "linkedAccounts.badge.linked": "Ligado",
  "linkedAccounts.badge.notLinked": "Não ligado",
  "linkedAccounts.badge.alwaysOn": "Sempre ativo",
  "linkedAccounts.badge.unlinked": "Desligado",
  "linkedAccounts.badge.revoked": "Revogado",
  "linkedAccounts.badge.subscribed": "Subscrito",
  "linkedAccounts.badge.devices_one": "{count} dispositivo",
  "linkedAccounts.badge.devices_other": "{count} dispositivos",

  // ── LinkedAccountsSections.tsx — botões de ação ──────────────────────────
  "linkedAccounts.action.unlink": "Desligar",
  "linkedAccounts.action.link": "Ligar",
  "linkedAccounts.action.default": "Predefinido",
  "linkedAccounts.action.manage": "Gerir",
  "linkedAccounts.action.revoke": "Revogar",
  "linkedAccounts.action.copyUrl": "Copiar URL",

  // ── SaveButton.tsx — controlo de guardar reutilizável ────────────────────
  "saveButton.defaultLabel": "Guardar alterações",
  "saveButton.savingLabel": "A guardar…",
  "saveButton.savedLabel": "Guardado",

  // ── NotificationPreferencesPage.tsx + Sections — página de protótipo de
  // matriz de notificações (distinta da NotificationsPane em SettingsPanes) ─
  "notifPrefs.sidebar.account": "Conta",
  "notifPrefs.sidebar.editProfile": "Editar perfil",
  "notifPrefs.sidebar.notifications": "Notificações",
  "notifPrefs.sidebar.privacy": "Privacidade",
  "notifPrefs.sidebar.dangerZone": "Zona de perigo",
  "notifPrefs.sidebar.deactivateAccount": "Desativar conta",
  "notifPrefs.title": "Preferências de <em>notificações</em>",
  "notifPrefs.sub":
    "Controla exatamente o que a QueerPulse te envia, e quando. A predefinição é enviar menos — podes sempre ativar mais.",
  "notifPrefs.digest.sectionLabel": "Resumo por email",
  "notifPrefs.digest.frequencyLabel": "Frequência do resumo",
  "notifPrefs.digest.frequencySub":
    "Um resumo da atividade desde a tua última visita. Nunca promocional.",
  "notifPrefs.digest.freq.never": "Nunca",
  "notifPrefs.digest.freq.daily": "Diariamente",
  "notifPrefs.digest.freq.weeklyMonday": "Semanalmente (segunda-feira)",
  "notifPrefs.digest.freq.fortnightly": "Quinzenalmente",
  "notifPrefs.digest.includesLabel": "O resumo inclui",
  "notifPrefs.digest.includesSub":
    "Que secções aparecem no teu email de resumo.",
  "notifPrefs.digest.includes.forumEvents": "Destaques do fórum + Eventos",
  "notifPrefs.digest.includes.everything": "Tudo",
  "notifPrefs.digest.includes.eventsOnly": "Só eventos",
  "notifPrefs.digest.includes.forumOnly": "Só fórum",
  "notifPrefs.matrix.sectionLabel": "O que desencadeia uma notificação",
  "notifPrefs.matrix.colEvent": "Evento",
  "notifPrefs.matrix.colInApp": "Na app",
  "notifPrefs.matrix.colEmail": "Email",
  "notifPrefs.matrix.colPush": "Push",
  "notifPrefs.row.dm.label": "Mensagem direta recebida",
  "notifPrefs.row.dm.sub": "Alguém te envia uma mensagem direta",
  "notifPrefs.row.forumReply.label": "Resposta no fórum à tua publicação",
  "notifPrefs.row.forumReply.sub": "Alguém responde a um tópico que começaste",
  "notifPrefs.row.forumMention.label": "Menção no fórum",
  "notifPrefs.row.forumMention.sub": "Alguém usa @oteunome numa publicação",
  "notifPrefs.row.rsvpReminder.label": "Lembrete de confirmação de presença",
  "notifPrefs.row.rsvpReminder.sub":
    "24h antes de um evento a que te inscreveste",
  "notifPrefs.row.newEvent.label": "Novo evento na tua área",
  "notifPrefs.row.newEvent.sub": "Eventos que correspondem aos teus interesses",
  "notifPrefs.row.magazineIssue.label": "Nova edição da revista",
  "notifPrefs.row.magazineIssue.sub": "Quando a edição mensal fica disponível",
  "notifPrefs.row.connectionRequest.label": "Pedido de ligação",
  "notifPrefs.row.connectionRequest.sub": "Uma pessoa quer ligar-se a ti",
  "notifPrefs.row.mentalHealthFund.label":
    "Atualização do fundo de saúde mental",
  "notifPrefs.row.mentalHealthFund.sub":
    "Se estiveres a usar o fundo, alterações de estado",
  "notifPrefs.quietHours.sectionLabel": "Horas de silêncio",
  "notifPrefs.quietHours.enableTitle": "Ativar horas de silêncio",
  "notifPrefs.quietHours.enableDesc":
    "Sem notificações push durante estas horas. Email e notificações na app não são afetados.",
  "notifPrefs.quietHours.from": "De",
  "notifPrefs.quietHours.until": "Até",
  "notifPrefs.alwaysOn.sectionLabel": "Sempre ativo · não pode ser desativado",
  "notifPrefs.alwaysOn.securityAlerts.title": "Alertas de segurança",
  "notifPrefs.alwaysOn.securityAlerts.desc":
    "Novo início de sessão a partir de um dispositivo ou localização não reconhecidos.",
  "notifPrefs.alwaysOn.dataExportReady.title": "Exportação de dados pronta",
  "notifPrefs.alwaysOn.dataExportReady.desc":
    "Quando o teu arquivo de dados estiver disponível para descarregar.",
  "notifPrefs.alwaysOn.moderationDecisions.title": "Decisões de moderação",
  "notifPrefs.alwaysOn.moderationDecisions.desc":
    "Se um moderador atuar sobre conteúdo que publicaste.",
  "notifPrefs.saveBar.note": "As alterações são guardadas automaticamente.",
  "notifPrefs.saveBar.label": "Guardar preferências",
  "notifPrefs.toast.saved": "Preferências de notificações guardadas.",

  // ── AccessibilityPreferencesPage.tsx + Sections — a página completa de
  // acessibilidade. Só a Redução de movimento é funcional; o resto são
  // etiquetas em interruptores não funcionais — só as etiquetas são traduzidas.
  "a11y.sidebar.preferences": "Preferências",
  "a11y.sidebar.display": "Visualização",
  "a11y.sidebar.motion": "Movimento",
  "a11y.sidebar.reading": "Leitura",
  "a11y.sidebar.interaction": "Interação",
  "a11y.sidebar.reset": "Repor",
  "a11y.section.display.eyebrow": "Visualização",
  "a11y.section.display.desc":
    "Estas definições aplicam-se a toda a plataforma.",
  "a11y.toggle.highContrast.title": "Modo de alto contraste",
  "a11y.toggle.highContrast.desc":
    "Aumenta o contraste de cor para melhor legibilidade. Afeta texto, contornos e anéis de foco.",
  "a11y.toggle.largerText.title": "Aumentar o tamanho do texto",
  "a11y.toggle.largerText.desc":
    "Torna o texto do corpo ligeiramente maior em todas as páginas.",
  "a11y.toggle.dyslexia.title": "Tipo de letra para dislexia",
  "a11y.toggle.dyslexia.desc":
    "Maior espaçamento entre letras e altura de linha aumentada para melhor legibilidade.",
  "a11y.textSize.label": "Tamanho do texto",
  "a11y.textSize.preview":
    "A raposa castanha atravessou o Príncipe Real e encontrou uma comunidade à espera do outro lado.",
  "a11y.section.motion.eyebrow": "Movimento",
  "a11y.section.motion.desc":
    "Controla animações e transições em toda a plataforma.",
  "a11y.toggle.reduceMotion.title": "Reduzir movimento",
  "a11y.toggle.reduceMotion.desc":
    "Desativa animações, transições e efeitos de pulsação em toda a plataforma.",
  "a11y.toggle.pauseDecorative.title": "Pausar animações decorativas",
  "a11y.toggle.pauseDecorative.desc":
    "Impede que orbes de fundo, pontos pulsantes e indicadores de carregamento animem.",
  "a11y.preview.liveLabel": "Pré-visualização em direto",
  "a11y.preview.cardText":
    "Este cartão anima ao carregar — muda as definições de movimento para veres o efeito.",
  "a11y.section.reading.eyebrow": "Leitura",
  "a11y.section.reading.desc":
    "Ajusta a forma como o conteúdo é apresentado para uma leitura confortável.",
  "a11y.toggle.wideSpacing.title": "Espaçamento entre linhas mais amplo",
  "a11y.toggle.wideSpacing.desc":
    "Aumenta o espaço entre linhas de texto (altura de linha: 2.0).",
  "a11y.toggle.focusRings.title": "Mostrar indicadores de foco",
  "a11y.toggle.focusRings.desc":
    "Adiciona anéis de foco do teclado visíveis em todos os elementos interativos.",
  "a11y.colorTheme.label": "Tema de cor",
  "a11y.colorTheme.headingLabel": "Estilo de cor dos títulos",
  "a11y.colorTheme.default": "Predefinido",
  "a11y.colorTheme.softer": "Suave",
  "a11y.colorTheme.highContrast": "Alto contraste",
  "a11y.section.interaction.eyebrow": "Interação",
  "a11y.section.interaction.desc":
    "Ajusta a forma como interages com a plataforma.",
  "a11y.toggle.largeTargets.title": "Alvos de toque maiores",
  "a11y.toggle.largeTargets.desc":
    "Aumenta o tamanho mínimo de botões e ligações para facilitar a interação por toque.",
  "a11y.toggle.stickyNav.title": "Navegação fixa",
  "a11y.toggle.stickyNav.desc":
    "Mantém a barra de navegação sempre visível ao percorreres a página.",
  "a11y.toggle.skipLink.title": "Ligação para saltar para o conteúdo",
  "a11y.toggle.skipLink.desc":
    "Mostra uma ligação «Saltar para o conteúdo principal» no topo quando pressionas Tab.",

  // ── DeleteAccountPage.tsx / DeleteAccountSection.tsx / DeleteAccountSections.tsx
  // — o fluxo de saída. Precisão acima de estilo (zona de perigo).
  "deleteAccount.page.title": "Estás a sair da <em>QueerPulse?</em>",
  "deleteAccount.page.sub":
    "Lamentamos que te vás embora. Antes de decidires, escolhe a opção que se adequa à tua situação.",
  "deleteAccount.pending.title": "Eliminação <em>agendada.</em>",
  "deleteAccount.pending.sub":
    "Pediste para eliminarmos a tua conta. Eis a situação atual.",
  "deleteAccount.pauseStrip.text":
    "Não tens a certeza? Considera <strong>pausar as notificações</strong> durante um mês em vez disso. Continuas a fazer parte sem o ruído.",
  "deleteAccount.pauseStrip.cta": "Desativar todos os emails e resumos",
  "deleteAccount.toast.pausedEmails":
    "Todas as notificações por email foram pausadas durante 30 dias.",
  "deleteAccount.whatHappens.title.deactivate":
    "O que acontece quando desativas",
  "deleteAccount.whatHappens.title.delete": "O que acontece quando eliminas",
  "deleteAccount.confirm.typeLabel":
    "Escreve <strong>«{phrase}»</strong> para confirmares",
  "deleteAccount.confirm.cancelBtn": "Cancelar",
  "deleteAccount.pending.cancelling": "A cancelar…",
  "deleteAccount.pending.cancelBtn": "Cancelar eliminação",
  "deleteAccount.toast.cancelled": "Eliminação cancelada — bem-vinde de volta.",
  "deleteAccount.toast.cancelError":
    "Não conseguimos cancelar isso agora. Tenta novamente.",
  "deleteAccount.options.deactivate.title": "Desativar",
  "deleteAccount.options.deactivate.desc":
    "O teu perfil torna-se invisível. Os teus dados são preservados. Podes reativá-la a qualquer momento voltando a iniciar sessão.",
  "deleteAccount.options.deactivate.tag": "Reversível",
  "deleteAccount.options.delete.title": "Eliminar conta",
  "deleteAccount.options.delete.desc":
    "Apaga permanentemente a tua conta e todos os dados associados no prazo de 30 dias. Não pode ser revertido.",
  "deleteAccount.options.delete.tag": "Permanente",
  "deleteAccount.pending.banner":
    "<strong>A tua conta está agendada para eliminação.</strong> Está tudo oculto agora e será permanentemente apagado a <strong>{date}</strong>. Mudaste de ideias? Ainda podes cancelar e continuar de onde ficaste.",
  "deleteAccount.wh.deactivate.profileHidden":
    "O teu <strong>perfil fica oculto</strong> de imediato — nenhuma outra pessoa o consegue encontrar ou ver.",
  "deleteAccount.wh.deactivate.dataPreserved":
    "Os teus <strong>dados são totalmente preservados</strong>: mensagens, publicações e histórico mantêm-se intactos.",
  "deleteAccount.wh.deactivate.reactivateInstantly":
    "<strong>Reativa instantaneamente</strong> ao iniciares sessão de novo com a Google.",
  "deleteAccount.wh.deactivate.nameRemoved":
    "O teu <strong>nome é removido</strong> das listas de pessoas e dos resultados de pesquisa.",
  "deleteAccount.wh.deactivate.attributedDeactivated":
    "As confirmações de presença em eventos e as contribuições no fórum ficam <strong>atribuídas a [pessoa desativada]</strong>.",
  "deleteAccount.wh.delete.queuedForDeletion":
    "<strong>Todos os teus dados ficam em fila para eliminação</strong> e são permanentemente apagados no prazo de 30 dias.",
  "deleteAccount.wh.delete.messagesDeleted":
    "As mensagens que enviaste <strong>são eliminadas de todas as conversas</strong> — quem as recebeu também as perde.",
  "deleteAccount.wh.delete.postsRemoved":
    "As tuas publicações no fórum são <strong>permanentemente removidas</strong> — não anonimizadas, eliminadas.",
  "deleteAccount.wh.delete.emailSuppressed":
    "O teu endereço de email é <strong>adicionado a uma lista de supressão</strong> para não recriarmos a tua conta por acidente.",
  "deleteAccount.wh.delete.exportFirst":
    "Podes pedir um <strong>arquivo de dados antes de eliminares</strong> — faz isso primeiro.",
  "deleteAccount.phrase.deactivate": "desativar a minha conta",
  "deleteAccount.phrase.delete": "eliminar a minha conta",
  "deleteAccount.confirmHint.deactivate":
    "Podes desfazer isto a qualquer momento voltando a iniciar sessão.",
  "deleteAccount.confirmHint.delete":
    "Vais ter 30 dias para mudar de ideias. Depois disso não pode ser revertido.",
  "deleteAccount.btnLabel.deactivate": "Desativar a minha conta",
  "deleteAccount.btnLabel.delete": "Eliminar permanentemente a minha conta",

  // ── DestructiveActionFlow.tsx + destructiveFlows.data.tsx — diálogo
  // partilhado de confirmação → carregamento → resultado ──────────────────
  "destructiveFlow.backToHome": "Voltar à QueerPulse",
  "destructiveFlow.error.title": "Isso não <em>correu bem.</em>",
  "destructiveFlow.error.body":
    "Não conseguimos concluir isto agora — nada foi alterado. Verifica a tua ligação e tenta novamente, ou volta dentro de momentos.",
  "destructiveFlow.error.close": "Fechar",
  "destructiveFlow.error.tryAgain": "Tentar novamente",
  "destructiveFlow.confirm.notNow": "Agora não",
  "destructiveFlow.deactivate.eyebrow": "Desativar conta",
  "destructiveFlow.deactivate.title":
    "Ocultar o teu perfil <em>por agora?</em>",
  "destructiveFlow.deactivate.body":
    "O teu perfil torna-se invisível e as notificações param. <strong>Nada é eliminado</strong> — volta a iniciar sessão quando quiseres e continuas exatamente de onde ficaste.",
  "destructiveFlow.deactivate.confirmLabel": "Desativar",
  "destructiveFlow.deactivate.loadingText": "A desativar a tua conta…",
  "destructiveFlow.deactivate.resultTitle": "Sessão <em>terminada.</em>",
  "destructiveFlow.deactivate.resultBody":
    "O teu perfil está oculto e os teus dados estão guardados em segurança. Quando quiseres voltar, inicia sessão e tudo estará à tua espera. Estaremos aqui.",
  "destructiveFlow.delete.eyebrow": "Eliminar conta",
  "destructiveFlow.delete.title": "Eliminar <em>permanentemente?</em>",
  "destructiveFlow.delete.body":
    "Isto coloca o teu perfil, mensagens e todos os dados associados em fila para eliminação no prazo de 30 dias. <strong>Isto não pode ser revertido.</strong>",
  "destructiveFlow.delete.confirmLabel": "Eliminar a minha conta",
  "destructiveFlow.delete.loadingText": "A agendar a eliminação da tua conta…",
  "destructiveFlow.delete.resultTitle": "Está <em>agendado.</em>",
  "destructiveFlow.delete.resultBody":
    "A tua conta está agendada para eliminação. Verifica a tua caixa de entrada para um email de confirmação — tens <strong>30 dias</strong> para cancelar voltando a iniciar sessão. Depois disso, os teus dados são permanentemente apagados. Cuida de ti.",

  // ── ThemeStudio.tsx / profileTheme.data.ts — seletor de tema do perfil.
  // Os NOMES das bandeiras (FLAG_SWATCHES.label) ficam deliberadamente em
  // inglês — vários são neologismos contestados em pt-PT ("aromantic") e
  // ficam sinalizados para revisão por falante nativo em vez de adivinhados.
  "themeStudio.sectionLabel": "Tema do perfil",
  "themeStudio.sub":
    "Mostrado no teu perfil público e no diretório de pessoas.",
  "themeStudio.prideThemesLabel": "Temas de orgulho",
  "themeStudio.coverStyleLabel": "Estilo de capa",
  "themeStudio.coverPatternLabel": "Padrão de capa",
  "themeStudio.badgeDisplayLabel": "Exibição de distintivo",
  "themeStudio.showBadgesToggle": "Mostrar distintivos no perfil",
  "themeStudio.showLevelToggle": "Mostrar nível no perfil",
  "themeStudio.previewLabel": "Pré-visualização",
  "themeStudio.previewHintTop":
    "Atualiza-se em direto à medida que escolhes um tema.",
  "themeStudio.profileCardLabel": "Cartão de perfil",
  "themeStudio.directoryCardLabel": "Cartão no diretório",
  "themeStudio.directoryHint":
    "É assim que o teu perfil aparece nos resultados de pesquisa e no diretório de pessoas.",
  "themeStudio.memberSince": "Lisboa · Aqui desde {year}",
  "themeStudio.levelPreview": "Nív.4 · Familiar",
  "themeStudio.cover.stripe": "Risca arrojada",
  "themeStudio.pattern.none": "Liso",
  "themeStudio.pattern.stripe": "Riscas diagonais",
  "themeStudio.pattern.dots": "Grelha de pontos",
  "themeStudio.pattern.grid": "Grelha",
  "themeStudio.badge.foundingMember": "Pessoa Fundadora (Lendário)",
  "themeStudio.badge.eventHost": "Organiza Encontros (Lendário)",
  "themeStudio.badge.sustainer": "Apoiante (Raro)",
  "themeStudio.badge.regular": "Regular (Raro)",
  "themeStudio.badge.vouch": "Aval (Raro)",
  "themeStudio.backToProfile": "← O meu perfil",
  "themeStudio.saveTheme": "Guardar tema",
  "themeStudio.toast.saved": "Tema guardado",

  // ── MembershipPage.tsx / MembershipSidebar.tsx / membership.data.tsx —
  // Adesão e faturação. "Adesão" para membership (evita confundir com
  // "Subscrição", usado noutro sítio para newsletters); "escalão" para tier;
  // nunca "membro" — ver glossário. ────────────────────────────────────────
  "membership.breadcrumb.current": "Adesão",
  "membership.page.title": "A tua <em>adesão</em>",
  "membership.tabs.plan": "Plano",
  "membership.tabs.billing": "Faturação",
  "membership.tabs.access": "Acesso",

  "membership.tier.hardship.name": "Isenção por dificuldades",
  "membership.tier.hardship.desc":
    "Financiada na íntegra pelas pessoas em Sustentação — apoiada pela comunidade. Sem perguntas, sem prazo de validade, sem comprovativos de rendimento.",
  "membership.tier.solidarity.name": "Solidariedade",
  "membership.tier.solidarity.desc":
    "A escolha mais comum. Contribui com o que realmente consegues — qualquer valor entre {min} e {max}.",
  "membership.tier.sustaining.name": "Sustentação",
  "membership.tier.sustaining.desc":
    "A tua contribuição financia o acesso de quem não o pode pagar. Qualquer valor acima de {threshold} vai diretamente para o fundo de solidariedade.",
  "membership.tier.sub.free": "{amount} / mês",
  "membership.tier.sub.range": "{min}–{max} / mês",
  "membership.tier.sub.plus": "{amount}+ / mês",
  "membership.tier.amount.other": "Outro",
  "membership.tier.amount.otherSub": "valor",
  "membership.tier.customAmountPlaceholder": "por ex. {amount} / mês",

  "membership.current.eyebrow": "Plano atual",
  "membership.current.tierLabel": "Pessoa em Sustentação",
  "membership.current.cadence": "/ mês",
  "membership.current.since": "Na comunidade desde {date}",
  "membership.current.activeBadge": "Em vigor",

  "membership.plan.switchTier": "Mudar de escalão",
  "membership.plan.fineprint":
    "As alterações têm efeito na próxima data de faturação. Nunca ficarás sem acesso a meio do ciclo.",
  "membership.plan.saving": "A guardar…",
  "membership.plan.saveCta": "Guardar alterações →",
  "membership.plan.pauseCta": "Pausar por 1 mês",
  "membership.plan.cancelCta": "Cancelar adesão",
  "membership.plan.pauseConfirmText":
    "Pausar significa que o teu acesso continua até {date} e depois fica suspenso durante 30 dias. Podes retomar quando quiseres. O teu lugar na comunidade nunca é afetado.",
  "membership.plan.confirmPause": "Confirmar pausa",
  "membership.plan.keepActive": "Manter ativa",
  "membership.plan.beforeYouGo": "Antes de saíres",
  "membership.plan.cancelConfirmText":
    "Se for uma questão financeira, há uma isenção por dificuldades — ficas na comunidade sem custos. Se precisares de uma pausa, a opção de pausa mantém a tua conta guardada. Se fizemos algo errado, queremos saber.",
  "membership.plan.keepMembership": "Manter adesão",
  "membership.plan.toast.updated":
    "Plano atualizado. As alterações têm efeito a {date}.",
  "membership.plan.toast.paused":
    "Adesão pausada a partir de {date}. Podes retomar quando quiseres, aqui nesta página.",
  "membership.plan.toast.cancelled":
    "Adesão cancelada. O teu acesso continua até {date}.",

  "membership.sidebar.activeMember": "Adesão ativa",
  "membership.sidebar.solidarityLink": "Sobre os preços solidários →",

  "membership.status.tierLabel": "Escalão de Sustentação",
  "membership.status.renewal": "Próxima renovação: {date}",

  "membership.contribution.label": "contribuídos até agora",
  "membership.contribution.since_one": "Desde {date} · {count} mês",
  "membership.contribution.since_other": "Desde {date} · {count} meses",
  "membership.contribution.impact.therapyHours":
    "Aproximadamente {count} horas do programa de acesso à saúde mental",
  "membership.contribution.impact.microGrants_one":
    "{count} microbolsa para pessoas em dificuldade financeira",
  "membership.contribution.impact.microGrants_other":
    "{count} microbolsas para pessoas em dificuldade financeira",
  "membership.contribution.impact.hardshipAccess_one":
    "Acesso à plataforma para ~{count} pessoa com isenção por dificuldades",
  "membership.contribution.impact.hardshipAccess_other":
    "Acesso à plataforma para ~{count} pessoas com isenção por dificuldades",

  "membership.billing.sectionPaymentHistory": "Histórico de pagamentos",
  "membership.billing.sectionPaymentMethod": "Método de pagamento",
  "membership.billing.sectionInvoices": "Faturas",
  "membership.billing.row.lastPayment": "Último pagamento",
  "membership.billing.row.nextBillingDate": "Próxima data de faturação",
  "membership.billing.row.billingCycle": "Ciclo de faturação",
  "membership.billing.row.amount": "Valor",
  "membership.billing.cycle.monthly": "Mensal",
  "membership.billing.updateCard": "Atualizar cartão",
  "membership.billing.downloadPdf": "Transferir PDF",
  "membership.billing.cardForm.note":
    "Introduz os dados do teu novo cartão. Usamos o Stripe para o processamento seguro — nunca guardamos números de cartão.",
  "membership.billing.cardForm.cardNumberLabel": "Número do cartão",
  "membership.billing.cardForm.expiryLabel": "Validade",
  "membership.billing.cardForm.cvcLabel": "CVC",
  "membership.billing.cardForm.nameLabel": "Nome no cartão",
  "membership.billing.cardForm.namePlaceholder": "Nome completo",
  "membership.billing.cardForm.saving": "A guardar…",
  "membership.billing.cardForm.save": "Guardar cartão",
  "membership.billing.cardForm.cancel": "Cancelar",
  "membership.billing.toast.invalidCard":
    "Introduz um número de cartão válido.",
  "membership.billing.toast.cardUpdated": "Cartão atualizado.",
  "membership.billing.toast.invoiceDownloaded":
    "Fatura de {period} transferida",
  "membership.billing.paymentMethod.expires": "Expira em {date}",

  "membership.invoice.eyebrow": "Fatura · {period}",
  "membership.invoice.title": "A tua <em>fatura.</em>",
  "membership.invoice.paidInFullShort": "Paga na totalidade",
  "membership.invoice.totalLabel": "Total",
  "membership.invoice.lineItemLabel": "Adesão em Sustentação",
  "membership.invoice.vatNote": "IVA em autoliquidação · {amount}",
  "membership.invoice.downloadCta": "Transferir fatura",
  "membership.invoice.docTitle": "QueerPulse — Fatura de adesão",
  "membership.invoice.invoiceNumberLabel": "Número da fatura:",
  "membership.invoice.billingPeriodLabel": "Período de faturação:",
  "membership.invoice.issuedToLabel": "Emitida a:",
  "membership.invoice.lineItemsHeading": "Itens da fatura",
  "membership.invoice.totalRow": "Total",
  "membership.invoice.paidInFullLong":
    "Paga na totalidade. Obrigade por sustentares a comunidade.",

  "membership.access.lead":
    "Tudo o que a tua adesão em Sustentação desbloqueia. Mudar de escalão não afeta o acesso até ao fim do ciclo atual.",
  "membership.access.item.magazine.label": "Revista e conteúdo editorial",
  "membership.access.item.magazine.note": "Todas as edições + arquivo",
  "membership.access.item.forum.label": "Fórum da comunidade",
  "membership.access.item.forum.note": "Publicar, responder, votar",
  "membership.access.item.dm.label": "Mensagens diretas",
  "membership.access.item.dm.note": "Conversas ilimitadas",
  "membership.access.item.readingGroups.label": "Grupos de leitura",
  "membership.access.item.readingGroups.note_one":
    "{count} grupo ativo neste momento",
  "membership.access.item.readingGroups.note_other":
    "{count} grupos ativos neste momento",
  "membership.access.item.gatheringTickets.label": "Bilhetes para encontros",
  "membership.access.item.gatheringTickets.note":
    "Preço de pessoa associada em todos os eventos pagos",
  "membership.access.item.jobBoard.label": "Bolsa de emprego e competências",
  "membership.access.item.jobBoard.note": "Publicar e candidatar-te",
  "membership.access.item.resourceLibrary.label": "Biblioteca de recursos",
  "membership.access.item.resourceLibrary.note":
    "Habitação, saúde, jurídico, finanças",
  "membership.access.item.mentalHealth.label":
    "Programa de acesso à saúde mental",
  "membership.access.item.mentalHealth.note":
    "Encaminhamento subsidiado para terapia",
  "membership.access.item.microGrants.label": "Candidaturas a microbolsas",
  "membership.access.item.microGrants.note": "Trimestral — até {amount}",
  "membership.access.item.directory.label": "Diretório e descoberta de pessoas",
  "membership.access.item.directory.note_one":
    "Encontra e liga-te a {count} pessoa",
  "membership.access.item.directory.note_other":
    "Encontra e liga-te a {count} pessoas",

  // ── CancelMembershipPage.tsx / CancelMembershipSteps.tsx /
  // cancelMembership.data.tsx / CancelConfirmModal.tsx — funil de
  // cancelamento. "Associação" designa o escalão inferior ("Member" em EN,
  // distinto de "Adesão" enquanto funcionalidade e "Sustentação" enquanto
  // escalão superior). Frases de reembolso/fim de acesso traduzidas
  // literalmente, nunca parafraseadas (§6). ───────────────────────────────
  "cancelMembership.page.backLink": "← Adesão",
  "cancelMembership.page.eyebrow": "Cancelar · Sustentação (anual)",
  "cancelMembership.page.title": "É pena estares a <em>pensar nisso.</em>",
  "cancelMembership.page.lead":
    "Sem padrões enganosos — três passos rápidos e sais, ou podes pausar ou mudar de escalão em vez disso. De qualquer forma, sem vergonha nenhuma. O teu acesso à comunidade mantém-se.",
  "cancelMembership.page.cancelledToast": "Adesão cancelada · email enviado",
  "cancelMembership.stepper.options": "Opções",
  "cancelMembership.stepper.tellUsWhy": "Diz-nos porquê",
  "cancelMembership.stepper.confirm": "Confirmar",

  "cancelMembership.alt.pause.eyebrow": "Pausar · Sustentação",
  "cancelMembership.alt.pause.title": "Pausar por <em>3 meses?</em>",
  "cancelMembership.alt.pause.body":
    "Vamos congelar a tua renovação durante <b>3 meses</b>. Manténs o acesso completo durante esse tempo e não te cobramos nada até retomares — podes desfazer isto quando quiseres.",
  "cancelMembership.alt.pause.confirmLabel": "Sim, pausar",
  "cancelMembership.alt.downshift.eyebrow": "Mudar para Associação",
  "cancelMembership.alt.downshift.title": "Mudar para <em>Associação?</em>",
  "cancelMembership.alt.downshift.body":
    "Passas para <b>Associação · {amount} / ano</b>. Manténs todo o acesso à comunidade, mas as vantagens exclusivas de Sustentação (Open Studio, consulta jurídica da ILGA, revista) terminam no fim do teu período atual. Podes voltar a subir de escalão quando quiseres.",
  "cancelMembership.alt.downshift.confirmLabel": "Sim, mudar para Associação",
  "cancelMembership.alt.solidarity.eyebrow": "Tarifa solidária",
  "cancelMembership.alt.solidarity.title":
    "Passar para a <em>tarifa solidária?</em>",
  "cancelMembership.alt.solidarity.body":
    "Vais pagar <b>{amount} / ano</b>, sem perguntas — o fundo da comunidade cobre a diferença, a sério. Manténs <b>todas as vantagens de Sustentação</b> exatamente como estão agora.",
  "cancelMembership.alt.solidarity.confirmLabel":
    "Sim, passar para {amount} / ano",

  "cancelMembership.reason.r1":
    "<b>Ando com o dinheiro apertado.</b> O preço não é o certo para mim agora.",
  "cancelMembership.reason.r2":
    "<b>Não estou a usar o suficiente.</b> Entro menos vezes do que gostaria.",
  "cancelMembership.reason.r3":
    "<b>Vou sair de Lisboa</b> ou já não estou por cá.",
  "cancelMembership.reason.r4":
    "<b>Aconteceu algo na plataforma</b> que quero sinalizar.",
  "cancelMembership.reason.r5":
    "<b>Não vejo valor</b> nas vantagens que estou a pagar.",
  "cancelMembership.reason.r6": "<b>Outro motivo / prefiro não dizer.</b>",

  "cancelMembership.ends.openStudio.title":
    "Open Studio exclusivo de Sustentação",
  "cancelMembership.ends.openStudio.desc":
    "Perdes o teu convite fixo para as sessões mensais.",
  "cancelMembership.ends.magazine.title": "Assinatura da revista",
  "cancelMembership.ends.magazine.desc":
    "A revista trimestral em papel deixa de chegar depois da próxima edição.",
  "cancelMembership.ends.legalConsult.title":
    "Consulta jurídica gratuita da ILGA",
  "cancelMembership.ends.legalConsult.desc":
    "A tua consulta deste ano, se não a usares, expira quando a adesão terminar.",
  "cancelMembership.ends.badge.title": "Emblema de Sustentação",
  "cancelMembership.ends.badge.desc":
    "O pequeno coração no teu perfil desaparece.",

  "cancelMembership.stays.account.title": "A tua conta e ligações",
  "cancelMembership.stays.account.desc":
    "Perfil, mensagens, ligações, comunidades — tudo fica.",
  "cancelMembership.stays.gatherings.title": "Encontros e comunidades",
  "cancelMembership.stays.gatherings.desc":
    "Podes continuar a confirmar presença, participar e organizar encontros.",
  "cancelMembership.stays.wellbeing.title": "Recursos de bem-estar",
  "cancelMembership.stays.wellbeing.desc":
    "Chat de crise, diretório, terapeutas verificados — aberto a todas as pessoas.",
  "cancelMembership.stays.safeSpaces.title": "Rede de espaços seguros",
  "cancelMembership.stays.safeSpaces.desc":
    "A razão de ser da QueerPulse mantém-se gratuita.",

  "cancelMembership.options.currentTitle": "A tua <em>adesão</em> atual",
  "cancelMembership.options.currentTierLabel": "Sustentação · <em>anual</em>",
  "cancelMembership.options.currentMeta":
    "Renovada a <b>{renewedDate}</b> · próxima cobrança <b>{nextChargeDate}</b>",
  "cancelMembership.options.perYear": "/ ano",
  "cancelMembership.options.beforeYouGoTitle":
    "Antes de saíres — <em>três opções mais suaves</em>",
  "cancelMembership.options.sub":
    "Cada uma demora 30 segundos. Podes sempre voltar para cancelar.",
  "cancelMembership.options.pauseTitle": "Pausar por 3 meses",
  "cancelMembership.options.pauseDesc":
    "Congelamos a tua renovação. Manténs o acesso. Não cobramos nada até retomares.",
  "cancelMembership.options.downshiftTitle":
    "Mudar para Associação ({amount} / ano)",
  "cancelMembership.options.downshiftDesc":
    "Manténs todo o acesso à comunidade. Perdes as vantagens exclusivas de Sustentação (open studio, consulta da ILGA, revista).",
  "cancelMembership.options.solidarityTitle": "Passar para a tarifa solidária",
  "cancelMembership.options.solidarityDesc":
    "{amount} / ano, sem perguntas. O fundo cobre a diferença. <b>A sério.</b>",
  "cancelMembership.options.continueCancellingCta": "Continuar a cancelar →",
  "cancelMembership.keepSustainerCta": "Manter a minha Sustentação",

  "cancelMembership.reasons.title": "Ajuda-nos a <em>perceber.</em>",
  "cancelMembership.reasons.sub":
    "Opcional, mas útil. Lemos todas as respostas. Escolhe o que se aplica.",
  "cancelMembership.reasons.addNote":
    "Queres acrescentar mais alguma coisa? (opcional)",
  "cancelMembership.reasons.placeholder":
    "Uma ou duas frases ajudam-nos a perceber padrões. Nada disto é mostrado a outras pessoas.",
  "cancelMembership.backCta": "← Voltar",
  "cancelMembership.continueCta": "Continuar →",

  "cancelMembership.confirm.title": "Uma última <em>confirmação.</em>",
  "cancelMembership.confirm.sub":
    "Aqui está o que muda quando cancelas — e o que não muda.",
  "cancelMembership.confirm.whatEnds": "O que termina",
  "cancelMembership.confirm.whatStays": "O que fica — grátis, para sempre",
  "cancelMembership.confirm.accessContinuesNote":
    "O teu acesso continua até <b>{date}</b>. Sem reembolso — mas também sem mais cobranças.",
  "cancelMembership.confirm.writeToUs":
    "Se algo não estiver bem, escreve para <a>cancel@queerpulse.app</a> — é uma pessoa real que lê.",
  "cancelMembership.confirm.checkboxLabel":
    "Percebo que a minha adesão de Sustentação não vai renovar, e que <b>o meu acesso termina a {date}</b>. Posso voltar quando quiser.",
  "cancelMembership.confirm.cancelMyMembershipCta": "Cancelar a minha adesão",

  "cancelMembership.done.title": "Até à <em>próxima.</em>",
  "cancelMembership.done.accessNote":
    "A tua adesão de Sustentação não vai renovar. O acesso continua até <b>{date}</b>.",
  "cancelMembership.done.emailNote":
    "Enviámos uma confirmação para <b>{email}</b> com tudo explicado.",
  "cancelMembership.done.mistakeNote":
    "Se isto foi um engano, podes voltar a subscrever com um toque a partir do email ou das definições da tua conta — sem penalização.",
  "cancelMembership.backToHomeCta": "Voltar ao início",
  "cancelMembership.resubscribeCta": "Voltar a aderir",

  "cancelMembership.paused.title": "Em pausa — <em>até breve.</em>",
  "cancelMembership.paused.lead1":
    "Congelámos a tua renovação de Sustentação durante <b>3 meses</b>. Manténs o acesso completo durante esse tempo — e não te cobramos um cêntimo até retomares.",
  "cancelMembership.paused.lead2":
    "A tua renovação passa para <b>{date}</b>. Enviámos os detalhes para <b>{email}</b>.",
  "cancelMembership.paused.note":
    "Mudaste de ideias? Podes retomar quando quiseres — continua exatamente onde ficaste, sem penalização.",
  "cancelMembership.backToMembershipCta": "Voltar à adesão",
  "cancelMembership.paused.undoCta": "Desfazer pausa",

  "cancelMembership.downshifted.title": "Bem-vinde à <em>Associação.</em>",
  "cancelMembership.downshifted.lead1":
    "Estás agora no plano <b>Associação</b> — <b>{amount} / ano</b>. Todo o teu acesso à comunidade mantém-se exatamente igual.",
  "cancelMembership.downshifted.lead2":
    "As tuas vantagens exclusivas de Sustentação (Open Studio, consulta da ILGA, revista em papel) terminam no fim do período atual. A tua próxima cobrança é de <b>{amount} a {date}</b>.",
  "cancelMembership.downshifted.note":
    "A confirmação está a caminho de <b>{email}</b>. Podes voltar a subir para Sustentação quando quiseres.",
  "cancelMembership.downshifted.undoCta": "Desfazer — manter Sustentação",

  "cancelMembership.solidarity.title":
    "Estás agora na <em>tarifa solidária.</em>",
  "cancelMembership.solidarity.lead1":
    "A partir da tua próxima renovação vais pagar <b>{amount} / ano</b> — e manténs <b>todas as vantagens de Sustentação</b> exatamente como estão agora. O fundo da comunidade cobre o resto.",
  "cancelMembership.solidarity.lead2":
    "A tua próxima cobrança é de <b>{amount} a {date}</b>. Enviámos os detalhes para <b>{email}</b>.",
  "cancelMembership.solidarity.note":
    "Quando a situação melhorar, podes voltar à tarifa normal quando quiseres — sem pressão, sem lembretes.",
  "cancelMembership.solidarity.undoCta": "Desfazer",

  // ── GiftMembershipPage.tsx / GiftMembershipForm.tsx / giftMembership.data.tsx
  // — fluxo de oferta e patrocínio. Nome/contacto/nota da pessoa destinatária
  // mantêm-se em inglês (conteúdo fictício de exemplo, não chrome). ────────
  "giftMembership.hero.eyebrow": "Sustentação · oferecer e patrocinar",
  "giftMembership.hero.title": "Dá <em>um lugar</em> a outra pessoa.",
  "giftMembership.hero.dek":
    "Há duas formas de fazeres isto. <b>Oferece</b> a alguém que conheces diretamente — uma parceira, um amigo, a pessoa que te apresentou a tudo isto. Ou <b>patrocina anonimamente</b> — a tua oferta entra numa bolsa a que uma pessoa se candidata, sem perguntas, quando precisar. <em>As duas mantêm alguém por perto que, de outra forma, talvez desistisse.</em>",
  "giftMembership.modes.title": "Que <em>oferta</em> estás a fazer?",
  "giftMembership.mode.gift.title": "Oferecer · <em>a alguém que conheces</em>",
  "giftMembership.mode.gift.body":
    "Para: uma parceira. Um amigo. A pessoa colega que anda sempre a perguntar como se junta. <b>Recebe um convite pelo nome</b>, com uma nota pessoal tua. Regista-se com um link de utilização única. Se recusar, és reembolsade.",
  "giftMembership.mode.gift.priceSub": "/ ano · Sustentação · igual à tua",
  "giftMembership.mode.sponsor.title":
    "Patrocinar · <em>anonimamente, para quem precisar</em>",
  "giftMembership.mode.sponsor.body_one":
    "Para: retribuir. A tua oferta entra na <b>bolsa de solidariedade</b>. Pessoas que não conseguem pagar {amount} candidatam-se com uma frase — aprovamos, sem pedir provas. <em>Está {count} pessoa na bolsa neste momento.</em> A tua oferta é emparelhada em poucos dias.",
  "giftMembership.mode.sponsor.body_other":
    "Para: retribuir. A tua oferta entra na <b>bolsa de solidariedade</b>. Pessoas que não conseguem pagar {amount} candidatam-se com uma frase — aprovamos, sem pedir provas. <em>Estão {count} pessoas na bolsa neste momento.</em> A tua oferta é emparelhada em poucos dias.",
  "giftMembership.mode.sponsor.priceSub":
    "dá o valor que quiseres · emparelhado com nome ou anonimamente",
  "giftMembership.form.title":
    "Detalhes da oferta · <em>diz-nos para quem é</em>",
  "giftMembership.form.sub":
    "Tudo editável até aceitarem. Também podes agendar a entrega — para um aniversário, um aniversário de saída do armário, o dia em que mais precisar.",
  "giftMembership.sponsorFoot.title":
    "Ou salta o formulário · <em>patrocina anonimamente</em>",
  "giftMembership.sponsorFoot.body":
    "Se preferires não indicar uma pessoa destinatária, <a>coloca a tua oferta na bolsa de adesões solidárias</a>. Emparelhamo-la com uma pessoa que se candidatou — geralmente dentro de 48 horas. <em>Recebes um obrigado e uma contagem; não um nome.</em>",

  "giftMembership.delivery.now.label": "Agora",
  "giftMembership.delivery.now.desc":
    "Enviado no minuto seguinte · o email chega na hora",
  "giftMembership.delivery.now.note": "entregue de imediato",
  "giftMembership.delivery.schedule.label": "Agendar",
  "giftMembership.delivery.schedule.desc":
    "Escolhe uma data · enviamos às 09:00 no fuso horário da pessoa",
  "giftMembership.delivery.schedule.note":
    "agendado · escolhe a data no passo seguinte",
  "giftMembership.delivery.print.label": "Imprimir e enviar pelo correio",
  "giftMembership.delivery.print.desc":
    "+ {amount} de portes · cartão risografado · chega em 5 a 7 dias",
  "giftMembership.delivery.print.note": "impresso + enviado · +{amount}",

  "giftMembership.anon.no": "Não — mostrar o meu nome à pessoa destinatária",
  "giftMembership.anon.yes": "Sim — anónimo para a pessoa destinatária",
  "giftMembership.anon.initials": "Só as minhas iniciais",

  "giftMembership.form.sectionRecipient": "Pessoa destinatária",
  "giftMembership.form.recipientNameLabel": "O nome da pessoa",
  "giftMembership.form.recipientNameHint": "— como será tratada",
  "giftMembership.form.recipientContactLabel": "O email ou telemóvel da pessoa",
  "giftMembership.form.recipientContactHint":
    "Usamos uma vez · para enviar o convite. A pessoa controla o que acontece depois.",
  "giftMembership.form.sectionFromYou": "Da tua parte",
  "giftMembership.form.senderNameLabel": "Como queres que o teu nome apareça",
  "giftMembership.form.anonLabel": "Queres ficar no anonimato?",
  "giftMembership.form.anonHint": "só para essa pessoa",
  "giftMembership.form.noteLabel": "Uma nota breve",
  "giftMembership.form.noteHint":
    "— opcional · texto simples · impresso no cartão",
  "giftMembership.form.charCount": "{count} / 280 carateres",
  "giftMembership.form.sectionDelivery": "Entrega",
  "giftMembership.form.deliveryIntro": "Quando deve chegar o convite?",
  "giftMembership.form.previewHeading":
    "Pré-visualização · o que a pessoa vai ver",
  "giftMembership.form.previewStamp": "De uma pessoa amiga",
  "giftMembership.form.previewTitle":
    "{name} — alguém <em>está do teu lado.</em>",
  "giftMembership.form.previewSender":
    "— <b>{sender}</b> · com um ano de adesão de Sustentação · {amount} · ativa quando quiseres, até <b>{date}</b>",
  "giftMembership.form.summary":
    "Uma oferta de Sustentação · <b>{amount}</b> · {deliveryNote}",
  "giftMembership.form.payCta": "Pagar · oferecer a {name} →",
  "giftMembership.form.toast.charged":
    "Cobrámos {amount} · convite enviado a {name}",

  // ── SubscriptionsPage.tsx / SubscriptionsSections.tsx / subscriptions.data.tsx
  "subscriptions.page.backLink": "← Definições",
  "subscriptions.page.eyebrow": "Definições · subscrições, alertas e pronomes",
  "subscriptions.page.title": "O que enviamos · <em>como apareces.</em>",
  "subscriptions.page.lead":
    'Três controlos pequenos e cirúrgicos. <em>Cada opt-in é real</em> — desligar uma newsletter significa que nunca mais a enviamos, não "menos dela". Os pronomes são iguais: visíveis exatamente onde escolheres, nunca presumidos.',
  "subscriptions.page.lastSaved":
    "Guardado pela última vez a <b>{date}</b> · todas as alterações são guardadas automaticamente",
  "subscriptions.page.savedToast": "Definições guardadas",
  "subscriptions.page.pitchNote":
    "<b>Queres escrever para o podcast ou para a revista?</b> As propostas são lidas pela equipa editorial, não filtradas automaticamente.",
  "subscriptions.page.pitchStory": "Propor uma história →",
  "subscriptions.page.pitchBackRoom": "Propor-te para o The Back Room →",
  "subscriptions.alert.removedToast": "Alerta removido",

  "subscriptions.newsletter.sectionHeading":
    "Newsletters · {count} disponíveis",
  "subscriptions.newsletter.nl1.name": "Boletim <em>da comunidade</em>",
  "subscriptions.newsletter.nl1.freq":
    "Quinzenal · o que se passa, quem organiza, o que estamos a ler",
  "subscriptions.newsletter.nl1.meta_one":
    "Subscrita · última edição aberta há {count} dia · enviada para {email}",
  "subscriptions.newsletter.nl1.meta_other":
    "Subscrita · última edição aberta há {count} dias · enviada para {email}",
  "subscriptions.newsletter.nl2.name": "Leituras longas · <em>mensal</em>",
  "subscriptions.newsletter.nl2.freq":
    "Uma vez por mês · uma peça maior da revista, entregue na íntegra",
  "subscriptions.newsletter.nl2.meta_one":
    "Subscrita · {percent}% de taxa de abertura · {count} edição enviada",
  "subscriptions.newsletter.nl2.meta_other":
    "Subscrita · {percent}% de taxa de abertura · {count} edições enviadas",
  "subscriptions.newsletter.nl3.name": "Boletim <em>do Trans Hub</em>",
  "subscriptions.newsletter.nl3.freq":
    "Mensal · atualizações de prestadores, avisos de fornecimento de hormonas, notas de casos anonimizadas",
  "subscriptions.newsletter.nl3.meta":
    "Não subscrita · {percent}% de taxa de abertura entre {count} pessoas subscritas",

  "subscriptions.jobAlerts.sectionHeading":
    "Pesquisas guardadas e alertas de emprego",
  "subscriptions.jobAlerts.empty.title": "Ainda sem alertas",
  "subscriptions.jobAlerts.empty.desc":
    "Guarda uma pesquisa e avisamos-te discretamente quando surgir algo que corresponda — sem ruído na caixa de entrada, só o que pediste.",
  "subscriptions.jobAlerts.empty.cta": "Configurar um",
  "subscriptions.jobAlerts.edit": "Editar",
  "subscriptions.jobAlerts.delete": "Eliminar",
  "subscriptions.jobAlerts.statusLabel": "Estado",
  "subscriptions.jobAlerts.matchesLabel": "Correspondências na última semana",
  "subscriptions.jobAlerts.lastSentLabel": "Último envio",
  "subscriptions.jobAlerts.lastSentNotSentYet": "Ainda não enviado",
  "subscriptions.jobAlerts.createCta": "+ Criar um novo alerta",
  "subscriptions.jobAlerts.statusLive": "Ativo · {frequency}",
  "subscriptions.jobAlerts.matchesNew_one": "{count} novo",
  "subscriptions.jobAlerts.matchesNew_other": "{count} novos",
  "subscriptions.jobAlerts.criteria.title": "Cargo: <b>{value}</b>",
  "subscriptions.jobAlerts.criteria.location": "Localização: <b>{value}</b>",
  "subscriptions.jobAlerts.criteria.minSalary":
    "Salário mínimo: <b>{value}</b>",
  "subscriptions.jobAlerts.criteria.hours": "Horas: <b>{value}</b>",
  "subscriptions.jobAlerts.criteria.multiLocation":
    "Localização: <b>{first}</b> ou <b>{second}</b>",
  "subscriptions.jobAlerts.seedD.criteria.queerLedOnly":
    "<b>Só</b> empresas queer verificadas",
  "subscriptions.jobAlerts.seedD.desc":
    "Vagas correspondentes enviadas <em>uma vez por semana</em>, às segundas · formato de resumo",
  "subscriptions.jobAlerts.seedE.desc":
    "Para o biscate · notificações <em>instantâneas</em>",

  "subscriptions.pronouns.sectionHeading":
    "Pronomes · como apareces em toda a QueerPulse",
  "subscriptions.pronouns.currentlyUsing":
    "A usar atualmente <b>{pronoun}</b> no teu perfil · mostrado junto ao teu nome em todas as superfícies visíveis a outras pessoas",
  "subscriptions.pronouns.pickOneOrMore": "Escolhe um ou mais",
  "subscriptions.pronouns.customPlaceholder":
    "Ou escreve o teu · por ex. xe/xem · zie/hir",
  "subscriptions.pronouns.customHint":
    "Usa vírgulas para acrescentar vários, separados por contexto ou situação se preferires. <em>por ex. he/him (formal), they/them (amigos próximos)</em>.",
  "subscriptions.pronouns.whereTheyShow": "Onde aparecem",
  "subscriptions.pronouns.vis.p1.label": "No meu perfil",
  "subscriptions.pronouns.vis.p1.desc": "Sempre visível · padrão da QueerPulse",
  "subscriptions.pronouns.vis.p2.label":
    "Junto ao meu nome em publicações e comentários",
  "subscriptions.pronouns.vis.p2.desc": 'Forma compacta · "{example}"',
  "subscriptions.pronouns.vis.p3.label":
    "Nos meus bilhetes de confirmação e crachás de encontros",
  "subscriptions.pronouns.vis.p3.desc":
    "Visível para quem organiza e outras pessoas confirmadas",
  "subscriptions.pronouns.vis.p4.label": "Na versão pública do meu perfil",
  "subscriptions.pronouns.vis.p4.desc":
    "Desligado por predefinição · para quem não tem sessão iniciada",
  "subscriptions.pronouns.vis.p5.label": "Na tradução automática",
  "subscriptions.pronouns.vis.p5.desc":
    "Usamo-los quando o nosso tradutor automático traduz PT↔EN",

  // ── AlertBuilderModal.tsx ─────────────────────────────────────────────────
  "subscriptions.alertBuilder.ariaLabel.edit": "Editar alerta",
  "subscriptions.alertBuilder.ariaLabel.new": "Nova pesquisa guardada",
  "subscriptions.alertBuilder.title.edit":
    "Afina o teu <em>alerta de emprego.</em>",
  "subscriptions.alertBuilder.title.new": "Cria um <em>alerta de emprego.</em>",
  "subscriptions.alertBuilder.desc":
    "Vamos comparar novas vagas com os teus critérios e enviá-las na frequência que escolheres.",
  "subscriptions.alertBuilder.field.alertName.label": "Nome do alerta",
  "subscriptions.alertBuilder.field.alertName.placeholder":
    "por ex. Vagas de designer · Lisboa",
  "subscriptions.alertBuilder.field.titleKeywords.label":
    "Palavras-chave do cargo",
  "subscriptions.alertBuilder.field.titleKeywords.placeholder":
    "por ex. Designer · sénior · pleno",
  "subscriptions.alertBuilder.field.titleKeywords.hint":
    "Separadas por vírgulas. Corresponde a qualquer uma destas.",
  "subscriptions.alertBuilder.field.location.label": "Localização",
  "subscriptions.alertBuilder.field.minSalary.label": "Salário mínimo",
  "subscriptions.alertBuilder.field.minSalary.placeholder": "por ex. 32 mil €",
  "subscriptions.alertBuilder.field.frequency.label": "Com que frequência",
  "subscriptions.alertBuilder.frequency.instant": "Alertas instantâneos",
  "subscriptions.alertBuilder.frequency.daily": "Resumo diário",
  "subscriptions.alertBuilder.frequency.weekly": "Resumo semanal",
  "subscriptions.alertBuilder.location.lisbon": "Lisboa",
  "subscriptions.alertBuilder.location.remotePt": "Remoto (PT)",
  "subscriptions.alertBuilder.location.anywhere": "Em qualquer lugar",
  "subscriptions.alertBuilder.location.porto": "Porto",
  "subscriptions.alertBuilder.location.berlin": "Berlim",
  "subscriptions.alertBuilder.action.createAlert": "Criar alerta",
  "subscriptions.alertBuilder.action.saveChanges": "Guardar alterações",
  "subscriptions.alertBuilder.action.cancel": "Cancelar",
  "subscriptions.alertBuilder.success.updatedTitle":
    "Alerta <em>atualizado.</em>",
  "subscriptions.alertBuilder.success.createdTitle": "Alerta <em>criado.</em>",
  "subscriptions.alertBuilder.success.sub":
    '"{title}" está ativo com uma frequência de {frequency}. Avisamos-te assim que aparecer uma vaga correspondente.',
  "subscriptions.alertBuilder.success.done": "Concluído",

  // ── LinkProviderModal.tsx ─────────────────────────────────────────────────
  "linkProvider.ariaLabel": "Autorizar {provider}",
  "linkProvider.eyebrow": "Autorizar · {provider}",
  "linkProvider.continueWith": "Continuar com {provider}",
  "linkProvider.requestingAccess": "A QueerPulse está a pedir acesso",
  "linkProvider.authorizing": "A autorizar…",
  "linkProvider.authorizeCta": "Autorizar {provider}",
  "linkProvider.cancel": "Cancelar",
  "linkProvider.linkedTitle": "Ligação com {provider} <em>concluída.</em>",
  "linkProvider.linkedSub":
    "Já podes entrar na QueerPulse com {provider}. Revoga o acesso quando quiseres, a partir desta página — as tuas mensagens e associações a comunidades nunca foram partilhadas.",
  "linkProvider.done": "Concluído",

  // ── IntegrationsModal.tsx ─────────────────────────────────────────────────
  "integrationsModal.ariaLabel": "Integrações disponíveis",
  "integrationsModal.eyebrow": "Ligar outra",
  "integrationsModal.title": "Integrações <em>disponíveis.</em>",
  "integrationsModal.desc":
    "Cada integração tem um âmbito restrito — nenhuma consegue ler as tuas mensagens diretas, rascunhos, faturação ou associações a comunidades.",
  "integrationsModal.connectedTag": "Ligada",
  "integrationsModal.connectCta": "Ligar",

  // ── integrations.data.ts ──────────────────────────────────────────────────
  "integrations.apple.desc":
    "Usa o Iniciar sessão com a Apple como forma alternativa de entrar na QueerPulse.",
  "integrations.apple.scope1":
    "Confirmar o email da tua Apple ID (ou um endereço de reencaminhamento privado)",
  "integrations.apple.scope2":
    "Dizer à Apple que tens uma conta QueerPulse — nada sobre o que fazes aqui",
  "integrations.apple.scope3":
    "Nunca ver as tuas mensagens, publicações ou associações a comunidades",
  "integrations.stripe.desc":
    "Faturação de Sustentação e pagamentos por encontros pagos que organizes.",
  "integrations.mastodon.desc":
    "Publica também os teus artigos públicos na tua conta do fediverso. Só publicações.",
  "integrations.spotify.desc":
    "Dá vida às Salas de Áudio com audição partilhada. Sem acesso à tua biblioteca.",
  "integrations.ical.desc":
    "Subscreve os encontros que confirmaste a partir de qualquer aplicação de calendário.",
  "integrations.notion.desc":
    "Guarda artigos e recursos diretamente numa base de dados do Notion.",
  "integrations.readwise.desc":
    "Envia os teus destaques das edições de leituras longas para o Readwise.",
  "integrations.matrix.desc":
    "Liga o chat da comunidade a uma sala Matrix encriptada.",
  "integrations.pinboard.desc":
    "Guarda recursos e artigos na tua conta do Pinboard.",
};
