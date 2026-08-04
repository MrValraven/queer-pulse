import type { Catalog } from "../../types";

/**
 * Autenticação — pt-PT ("palavra-passe", não "senha"; tu, não você; formas
 * neutras em -e — "bem-vinde", "convidade", "obrigade" — quando a cópia se
 * dirige diretamente à pessoa e uma reformulação neutra ficaria forçada).
 */
export const auth: Catalog = {
  // ── Chrome partilhado ──
  "common.backToProfile": "Voltar ao perfil",
  "common.copied": "Copiado",
  "common.copy": "Copiar",
  "common.delete": "Eliminar",
  "common.notAMemberYet": "Ainda não fazes parte?",
  "common.optionalSuffix": "(opcional)",
  "common.resume": "Retomar",
  "common.saving": "A guardar…",

  // ── Entrar ──
  "signIn.title": "Bem-vinde de <em>volta</em>",
  "signIn.subtitle": "Entra para continuar de onde ficaste.",
  "signIn.artCaption": "Uma rede queer, <em>enraizada em Lisboa.</em>",
  "signIn.email": "Email",
  "signIn.password": "Palavra-passe",
  "signIn.submit": "Entrar",
  "signIn.forgot": "Esqueceste-te da palavra-passe?",
  "signIn.connecting": "A ligar…",
  "signIn.googleCta": "Continuar com o Google",
  "signIn.notice.inviteRequired.title": "Vais precisar de um convite",
  "signIn.notice.inviteRequired.body":
    "O QueerPulse funciona só por convite. Pede a alguém que já conheças, ou pede um convite e tratamos do resto.",
  "signIn.notice.accountSuppressed.title": "Esta conta foi eliminada",
  "signIn.notice.accountSuppressed.body":
    "Pediste-nos para eliminar esta conta, por isso não a vamos recriar em silêncio. Se quiseres voltar, pede um novo convite a alguém da comunidade — ou fala connosco que ajudamos.",
  "signIn.notice.ageAttestationRequired.title": "Falta confirmar uma coisa",
  "signIn.notice.ageAttestationRequired.body":
    "A QueerPulse é para maiores de 18 anos. Volta ao teu link de convite e confirma que tens 18 anos ou mais para entrares.",
  "signIn.notice.inviteInvalid.title": "Esse convite não é válido",
  "signIn.notice.inviteInvalid.body":
    "Este link de convite expirou ou já foi usado. Pede um novo a quem te convidou, ou pede um convite diretamente.",
  "signIn.notice.inviteEmailMismatch.title": "Este convite era para outro email",
  "signIn.notice.inviteEmailMismatch.body":
    "Alguém reservou este convite para um endereço específico. Inicia sessão com esse email, ou pede um novo convite para o que estás a usar.",
  "signIn.notice.inviteInviterInactive.title": "Quem te convidou já não está por cá",
  "signIn.notice.inviteInviterInactive.body":
    "A pessoa que enviou este convite já não está ativa no QueerPulse, por isso não te consegue trazer para dentro. Pede um novo convite a outra pessoa que conheças, ou pede um diretamente.",
  "signIn.notice.accessDenied.title": "O início de sessão foi cancelado",
  "signIn.notice.accessDenied.body":
    "Parece que cancelaste o ecrã de consentimento da Google. Sem problema — tenta outra vez quando quiseres.",
  "signIn.notice.noEmail.title": "Não conseguimos obter o teu email",
  "signIn.notice.noEmail.body":
    "A Google não partilhou um endereço de email connosco, por isso não conseguimos iniciar a tua sessão. Verifica as definições de partilha da tua conta Google e tenta novamente.",
  "signIn.notice.emailUnverified.title":
    "Verifica primeiro o teu email da Google",
  "signIn.notice.emailUnverified.body":
    "O email da tua conta Google ainda não está verificado. Verifica-o junto da Google e volta a tentar.",
  "signIn.notice.oauthFailed.title": "Algo correu mal",
  "signIn.notice.oauthFailed.body":
    "O início de sessão não terminou do lado da Google. Nada foi alterado — tenta outra vez daqui a pouco.",
  "signIn.notice.offline.title": "Estás offline",
  "signIn.notice.offline.body":
    "Não conseguimos chegar ao QueerPulse sem ligação. Verifica o teu Wi-Fi ou dados móveis e tenta novamente.",
  "signIn.notice.serverError.title": "Algo correu mal do nosso lado",
  "signIn.notice.serverError.body":
    "O nosso servidor teve um problema{status}. A responsabilidade é nossa, não tua — tenta novamente dentro de momentos.",
  "signIn.notice.unreachable.title": "Não conseguimos chegar ao QueerPulse",
  "signIn.notice.unreachable.body":
    "O servidor não respondeu. Pode estar a arrancar — espera um momento e tenta novamente.",

  // O registo está desligado em toda a plataforma (ou a plataforma está
  // bloqueada). Não é culpa de quem visita, e não há nada a repetir — a cópia
  // diz isso com clareza e não convida a tentar de novo em ciclo.
  "signIn.notice.registrationDisabled.title": "Novas contas em pausa",
  "signIn.notice.registrationDisabled.body":
    "Não estamos a criar contas novas neste momento. Se já tens uma conta, continuas a poder entrar normalmente.",

  // Estados antecipados, mostrados a partir de GET /platform-status ANTES do
  // envio, para ninguém passar pelo ecrã da Google só para ser rejeitade no
  // regresso.
  "signIn.closed.title": "Novas contas em pausa",
  "signIn.closed.body":
    "Podes continuar a entrar numa conta já existente, aqui em baixo.",

  // ── Criar conta ──
  "createAccount.eyebrow": "Quase lá",
  "createAccount.title": "Cria a tua <em>conta</em>",
  "createAccount.vouchText":
    "<strong>{name}</strong> convidou-te para o QueerPulse.",
  "createAccount.requiredLegend": "Os campos com <req>*</req> são obrigatórios",
  "createAccount.legalNote":
    "Tens de ter 18 anos ou mais para te juntares (consulta a nossa <eligibility>política de elegibilidade</eligibility>). Ao continuar, aceitas os nossos <terms>Termos</terms> e a <privacy>Política de Privacidade</privacy>.",
  "createAccount.signinPrompt": "Já tens conta? <signin>Entrar</signin>",
  "createAccount.submit": "Criar conta",
  "createAccount.section.account": "Conta",
  "createAccount.section.about": "Sobre ti",
  "createAccount.section.visibility": "Visibilidade",
  "createAccount.field.firstName.label": "Primeiro nome",
  "createAccount.field.firstName.placeholder": "Alex",
  "createAccount.field.lastName.label": "Apelido",
  "createAccount.field.lastName.placeholder": "Morais",
  "createAccount.field.email.label": "Email",
  "createAccount.field.email.helper":
    "Da tua conta Google — não pode ser alterado aqui.",
  "createAccount.field.displayName.label": "Nome a mostrar",
  "createAccount.field.displayName.helper":
    "Como vais aparecer em todo o QueerPulse.",
  "createAccount.field.displayName.placeholder": "Como queres que te chamem?",
  "createAccount.field.pronouns.label": "Pronomes",
  "createAccount.field.pronouns.placeholder": "ex.: ela/dela",
  "createAccount.field.location.label": "Localização",
  "createAccount.field.location.placeholder": "Lisboa",
  "createAccount.field.bio.label": "Bio",
  "createAccount.field.bio.placeholder": "Umas palavras sobre ti",
  "createAccount.error.firstRequired":
    "Falta o teu primeiro nome — importas-te de o adicionar?",
  "createAccount.error.lastRequired":
    "Falta o teu apelido — importas-te de o adicionar?",
  "createAccount.error.inviteRedeemFailed":
    "Não conseguimos confirmar o teu convite, mas a tua conta está pronta — já estás dentro.",
  "createAccount.visibility.open.label": "Disponível para ligações",
  "createAccount.visibility.open.sub":
    "Qualquer pessoa na rede pode ver o teu perfil e dizer olá",
  "createAccount.visibility.network.label": "Só a rede",
  "createAccount.visibility.network.sub":
    "Alcançável através de ligações em comum",
  "createAccount.visibility.private.label": "Em privado por agora",
  "createAccount.visibility.private.sub": "Contacto quando estiver preparade",

  // ── Ilustração "lareira" na página de entrada ──
  "communityArt.ariaLabel":
    "Ilustração de pessoas da comunidade a aproximarem-se de um centro acolhedor e caloroso",

  // ── Convidar (painel de envio + compositor + email/link) ──
  "invite.eyebrow": "Convida alguém a entrar",
  "invite.title": "Traz alguém <em>para aqui</em>",
  "invite.sub":
    "O QueerPulse cresce por convite, nunca por publicidade. Avaliza alguém em quem confias.",
  "invite.quota.available_one": "{count} convite disponível este mês",
  "invite.quota.available_other": "{count} convites disponíveis este mês",
  "invite.quota.none": "Sem convites disponíveis este mês",
  "invite.quota.resets_one": "Renova amanhã",
  "invite.quota.resets_other": "Renova daqui a {count} dias",
  "invite.quota.resets_zero": "Renova hoje",
  "invite.deliveryMethod.ariaLabel": "Escolhe como enviar o convite",
  "invite.deliveryMethod.email": "Email",
  "invite.deliveryMethod.link": "Partilhar um link",

  "invite.compose.vouch.label": "O teu aval",
  "invite.compose.vouch.placeholder":
    "Porque é que devia entrar? Uma ou duas frases já ajudam bastante.",
  "invite.compose.note.label": "Nota pessoal",
  "invite.compose.note.placeholder": "Adiciona uma nota pessoal (opcional)",

  "invite.draft.title": "Convite para {name}",
  "invite.draft.titleFallbackName": "alguém novo",
  "invite.draft.descFallback": "Um rascunho de convite em progresso",
  "invite.draft.savedJustNow": "Guardado agora mesmo",
  "invite.draft.savedToast": "Rascunho guardado",

  "invite.email.firstName.label": "Primeiro nome",
  "invite.email.firstName.placeholder": "Alex",
  "invite.email.lastName.label": "Apelido",
  "invite.email.lastName.placeholder": "Morais",
  "invite.email.email.label": "Email",
  "invite.email.email.placeholder": "tu@exemplo.com",
  "invite.email.howYouKnowThem.label": "Como a conheces",
  "invite.email.howYouKnowThem.helper":
    "Ajuda-nos a perceber a ligação — nunca é mostrado publicamente.",
  "invite.email.howYouKnowThem.placeholder": "Conhecemo-nos em…",
  "invite.email.note.label": "Nota pessoal",
  "invite.email.note.placeholder": "Adiciona uma nota pessoal (opcional)",
  "invite.email.preview.label": "Pré-visualização",
  "invite.email.preview.subject": "{name} convidou-te para o QueerPulse",
  "invite.email.preview.noteFallback": "Achei que ias pertencer aqui.",
  "invite.email.preview.openCta": "Abrir o teu convite",
  "invite.email.preview.expiresIn7Days": "Expira em 7 dias",
  "invite.email.submit": "Enviar convite",
  "invite.email.saveAsDraft": "Guardar como rascunho",
  "invite.email.savedToDrafts": "Guardado em Rascunhos",
  "invite.email.formNote":
    "Vai receber um link de utilização única, só para essa pessoa.",

  "invite.link.previewLabel": "Pré-visualização",
  "invite.link.generateCta": "Gerar link de convite",
  "invite.link.generating": "A gerar…",
  "invite.link.error.generic":
    "Algo correu mal ao gerar o teu link — tenta outra vez.",
  "invite.link.formNote": "Este link funciona uma vez, para uma pessoa.",
  "invite.link.defaultVouch":
    "Uma comunidade queer discreta e avalizada em Lisboa — sem anúncios, sem algoritmo. Acho que ias pertencer aqui.",
  "invite.link.shareMessage":
    "{senderFirst} convidou-te para o QueerPulse — uma comunidade queer discreta e avalizada. O teu convite pessoal: {url}",

  "invite.ready.headline": "O teu convite está <em>pronto</em>",
  "invite.ready.sub":
    "Partilha da forma que fizer mais sentido — é válido para uma utilização.",
  "invite.ready.linkCopied": "Link copiado",
  "invite.ready.copyFailed":
    "Não foi possível copiar — tenta selecionar o link",
  "invite.ready.copyLinkAriaLabel": "Copiar link de convite",
  "invite.ready.shareThrough": "Partilhar através de",
  "invite.ready.qrHint": "Ou deixa que o leiam",
  "invite.ready.qrLabel": "Código QR deste link de convite — lê-o para abrir o convite",
  "invite.ready.oneTimeLink": "Link de utilização única",
  "invite.ready.expiresIn7Days": "Expira em 7 dias",
  "invite.ready.expiresOn": "Expira a {date}",

  "invite.sent.headline": "Convite enviado para <em>{name}</em>",
  "invite.sent.sub": "Avisamos-te quando {name} entrar.",
  "invite.sent.summary.invited": "Convite para",
  "invite.sent.summary.sent": "Enviado",
  "invite.sent.summary.sentToday": "Hoje às {time}",
  "invite.sent.summary.expires": "Expira",

  "invite.sentList.label": "Convites que enviaste",
  "invite.sentList.filter.all": "Todos",
  "invite.sentList.status.valid": "Pendente",
  "invite.sentList.status.used": "Aceite",
  "invite.sentList.status.expired": "Expirado",
  "invite.sentList.status.revoked": "Revogado",
  "invite.sentList.detail.joined": "Entrou — bem-vinde {name}",
  "invite.sentList.detail.sentExpires": "Enviado {sent} · expira {expires}",
  "invite.sentList.detail.sentExpired": "Enviado {sent} · expirou {expires}",
  "invite.sentList.detail.sent": "Enviado {sent}",
  "invite.sentList.revokeCta": "Revogar",
  "invite.sentList.revoking": "A revogar…",
  "invite.sentList.revokedToast": "Convite revogado — o link deixou de funcionar.",
  "invite.sentList.resendCta": "Enviar de novo",
  "invite.sentList.resending": "A enviar…",
  "invite.sentList.resentToast": "Convite enviado de novo — o mesmo link, válido por mais uma semana.",
  "invite.sentList.resendError.notYours":
    "Este convite não é teu para voltares a enviar.",
  "invite.sentList.resendError.notFound":
    "Não encontrámos esse convite — pode já ter sido removido.",
  "invite.sentList.resendError.notResendable":
    "Só um convite expirado pode ser enviado de novo — este já foi usado, foi retirado, ou ainda está válido.",
  "invite.sentList.resendError.generic":
    "Não foi possível voltar a enviar agora — tenta outra vez daqui a pouco.",

  // ── Cartão de pré-visualização do convite (espelha as tags Open Graph) ──
  "sharePreview.heroTitle.line1": "Entra numa sala",
  "sharePreview.heroTitle.line2": "<em>onde já pertences</em>",
  "sharePreview.heroExplainer": "Uma rede queer. Enraizada em Lisboa.",
  "sharePreview.heroSub": "Só por convite · 247 pessoas",
  "sharePreview.title": "{senderName} convidou-te para o QueerPulse",

  // ── Autoatestação 18+ (partilhada por onboarding + pedir convite) ──
  "ageAttestation.confirmLabel": "Confirmo que tenho 18 anos ou mais.",
  "ageAttestation.helper":
    "O QueerPulse é uma comunidade só para adultos — <eligibility>percebe porquê</eligibility>. Não precisas de identificação; confiamos em ti. <under18>Ainda não tens 18?</under18>",

  // ── Bloco humano para menores de 18 ──
  "under18.title": "Vamos estar aqui <em>quando estiveres preparade</em>",
  "under18.body1":
    "Por agora, o QueerPulse é uma comunidade 18+, por isso ainda não podemos criar-te uma conta — e isto não é um julgamento sobre ti. Pertences à comunidade queer; esta sala em particular é que ainda não está aberta a menores de 18. Volta quando fizeres 18 anos e vais ter aqui um lugar.",
  "under18.body2": "Entretanto, há bastante coisa aqui que já é para ti:",
  "under18.link.queer101": "Queer 101 — o essencial, sem barreiras",
  "under18.link.comingOut": "Assumir-te, ao teu próprio ritmo",
  "under18.link.resources": "Recursos e apoio da comunidade",
  "under18.link.eligibility": "Porque somos 18+ (os nossos Termos)",
  "under18.backDefault": "Voltar",

  // ── Confirmar email (código de seis dígitos) ──

  // ── Entrar por link mágico ──

  // ── Pedir um convite ──
  "requestInvite.eyebrow": "Pedir um convite",
  "requestInvite.title": "Pede para <em>entrar.</em>",
  "requestInvite.sub":
    "O QueerPulse cresce através de confiança, não de publicidade. A forma mais certa de entrar é uma pessoa que já cá está avalizar-te — se conheces alguém aqui, pede-lhe. Se não conheces, conta-nos um pouco sobre ti e tratamos do resto.",
  "requestInvite.alreadyMember": "Já fazes parte? Entrar",
  "requestInvite.field.name.label": "O teu nome",
  "requestInvite.field.name.placeholder": "Alex",
  "requestInvite.field.name.error": "Diz-nos como te chamas.",
  "requestInvite.field.city.label": "Cidade",
  "requestInvite.field.city.placeholder": "Lisboa",
  "requestInvite.field.email.label": "Email",
  "requestInvite.field.email.placeholder": "tu@exemplo.com",
  "requestInvite.field.email.error":
    "Esse email não parece estar certo — importas-te de verificar?",
  "requestInvite.field.email.errorRequired":
    "Precisamos de um email para te podermos responder.",
  "requestInvite.field.mutual.label":
    "Conheces alguém aqui <optional>(opcional)</optional>",
  "requestInvite.field.mutual.helper":
    "Nomear uma pessoa em comum é a forma mais rápida de entrar — mas não é obrigatório.",
  "requestInvite.field.mutual.placeholder": "Uma pessoa que possa avalizar-te",
  "requestInvite.field.mutual.messagePrefix":
    "Alguém que me conhece por aqui: {name}",
  "requestInvite.field.why.label": "Porquê o QueerPulse",
  "requestInvite.field.why.placeholder":
    "O que procuras, e o que te traz aqui. Umas frases sinceras já chegam.",
  "requestInvite.field.why.error":
    "Conta-nos um pouco sobre o que te traz aqui.",
  "requestInvite.agree":
    "Li as <guidelines>diretrizes da comunidade</guidelines> e estou aqui de boa-fé.",
  "requestInvite.submit": "Enviar o meu pedido",
  "requestInvite.sending": "A enviar o teu pedido…",
  "requestInvite.submitError":
    "Não foi possível enviar o teu pedido — tenta outra vez",
  "requestInvite.under18BackLabel": "Voltar ao formulário",
  "requestInvite.sent.title": "Estás na <em>lista.</em>",
  "requestInvite.sent.sub_withName":
    "Obrigade, {name} — o teu pedido para entrar no QueerPulse foi enviado. Aqui está o que acontece a seguir.",
  "requestInvite.sent.sub_noName":
    "Obrigade — o teu pedido para entrar no QueerPulse foi enviado. Aqui está o que acontece a seguir.",
  "requestInvite.sent.backHome": "Voltar ao início",
  // O caso 409: já existe um pedido em aberto para este email. Não correu nada
  // mal, por isso isto lê-se como confirmação e nunca como falha.
  "requestInvite.already.title": "Já <em>o temos.</em>",
  "requestInvite.already.sub_withName":
    "Já nos tinhas pedido, {name} — o teu pedido continua connosco e continua a ser lido. Não é preciso enviar outro.",
  "requestInvite.already.sub_noName":
    "Já nos tinhas pedido — o teu pedido continua connosco e continua a ser lido. Não é preciso enviar outro.",
  "requestInvite.whatNext.readsIt.title": "Uma pessoa real lê-o",
  "requestInvite.whatNext.readsIt.body":
    "Sem algoritmo, sem pontuação de lista de espera — uma pessoa da comunidade vê cada pedido.",
  "requestInvite.whatNext.connection.title": "Procuramos uma ligação",
  "requestInvite.whatNext.connection.body":
    "Se já houver alguém aqui que te possa avalizar, essa é a forma mais certa de entrar. Nomear uma pessoa em comum ajuda.",
  "requestInvite.whatNext.hearBack.title": "Se for que sim, alguém entra em contacto",
  "requestInvite.whatNext.hearBack.body":
    "Uma pessoa da comunidade envia o teu link de convite para o endereço que nos deste, normalmente dentro de umas semanas. Não conseguimos responder a todos os pedidos, por isso, se ficar tudo calado, pedir a alguém que já conheces aqui é a forma mais certa de entrar.",

  // Estados antecipados, mostrados a partir de GET /platform-status ANTES do
  // envio, para ninguém preencher o formulário todo só para ser rejeitade ao
  // submeter.
  "requestInvite.closed.title": "Pedidos de convite em pausa",
  "requestInvite.closed.body":
    "Não estamos a receber novos pedidos de convite neste momento. Volta a passar por aqui em breve.",
  "requestInvite.closedError":
    "Os pedidos de convite ficaram em pausa enquanto preenchias isto. Tenta novamente mais tarde.",

  // ── Onboarding (fluxo de 7 passos após o registo, em /onboarding) ──
  "onboarding.stepLabel": "Passo {current} de {total}",
  "onboarding.welcomeToQueerPulse": "Bem-vinde ao QueerPulse",
  "onboarding.stepIntro.heading": "Vamos começar o teu <em>acolhimento</em>",
  "onboarding.stepIntro.body":
    "Uns passos rápidos para configurares o teu perfil e encontrares a tua gente. Demora cerca de dois minutos — e podes mudar tudo depois.",
  "onboarding.stepIntro.cta": "Vamos começar",
  "onboarding.preview.makeItYours.title": "Torna-o teu",
  "onboarding.preview.makeItYours.desc":
    "Adiciona uma foto para que as pessoas possam pôr um rosto ao teu nome.",
  "onboarding.preview.setIntentions.title": "Define as tuas intenções",
  "onboarding.preview.setIntentions.desc":
    "Conta-nos o que te traz aqui, e vamos personalizar tudo.",
  "onboarding.preview.findCommunities.title": "Encontra as tuas comunidades",
  "onboarding.preview.findCommunities.desc":
    "Junta-te aos grupos que combinam com o que te importa.",

  "onboarding.stepWelcome.eyebrowSuffix": "Já estás dentro",
  "onboarding.stepWelcome.heading": "Bem-vinde, <em>{firstName}</em>",
  "onboarding.stepWelcome.memberSince": "Aqui desde {since}",
  "onboarding.stepWelcome.invitedYou": "Convidou-te",
  "onboarding.stepWelcome.memberSinceRole": "Aqui desde {since} · {role}",
  "onboarding.stepWelcome.vouchFallback":
    "{firstName} é exatamente o tipo de pessoa para quem esta comunidade foi criada — atente, criative, e genuinamente empenhade em tornar os espaços queer melhores.",
  "onboarding.stepWelcome.body":
    "O QueerPulse é uma rede profissional cuidada, enraizada em Lisboa. Foste convidade porque alguém aqui reconhece o teu valor.",
  "onboarding.stepWelcome.cta": "Vamos a isto",
  "onboarding.stepWelcome.back": "Voltar",

  "onboarding.stepPhoto.heading": "Põe um rosto ao <em>nome</em>",
  "onboarding.stepPhoto.body":
    "Uma foto ajuda as pessoas a sentirem-se confortáveis a ligar-se a ti. Podes sempre adicionar isto depois.",
  "onboarding.stepPhoto.captionPreview":
    "Ótimo aspeto — toca na foto para a alterar",
  "onboarding.stepPhoto.captionGoogle":
    "Da tua conta Google — toca na foto para a alterar",
  "onboarding.stepPhoto.captionUpload": "Toca para carregar uma foto",
  "onboarding.stepPhoto.uploadAriaLabel": "Carregar uma foto de perfil",
  "onboarding.stepPhoto.photoAlt": "A tua foto de perfil",
  "onboarding.stepPhoto.placeholder": "a tua foto",
  "onboarding.stepPhoto.continue": "Continuar",
  "onboarding.stepPhoto.skip": "Saltar por agora — podes adicionar isto depois",
  "onboarding.stepPhoto.back": "Voltar",
  "onboarding.stepPhoto.uploadError":
    "Não conseguimos adicionar essa foto. Tenta novamente.",
  "onboarding.stepPhoto.saveError":
    "Não conseguimos guardar a tua foto. Tenta novamente.",

  "onboarding.stepNorms.heading": "Este é um espaço <em>cuidado</em>",
  "onboarding.stepNorms.norm.bePresent.title": "Está presente",
  "onboarding.stepNorms.norm.bePresent.desc":
    "Dá às conversas a tua atenção genuína. Passar ao lado tudo bem; envolveres-te a meio gás não.",
  "onboarding.stepNorms.norm.namesPronouns.title": "Respeita nomes e pronomes",
  "onboarding.stepNorms.norm.namesPronouns.desc":
    "Usa o nome e os pronomes que cada pessoa partilha. Se tiveres dúvidas, pergunta — isso é sempre bem-vindo aqui.",
  "onboarding.stepNorms.norm.staysHere.title":
    "O que se partilha aqui, fica aqui",
  "onboarding.stepNorms.norm.staysHere.desc":
    "As pessoas partilham aqui coisas que talvez não partilhem noutro lado. Trata isso como um privilégio.",
  "onboarding.stepNorms.norm.askBeforePhoto.title":
    "Pergunta antes de fotografar",
  "onboarding.stepNorms.norm.askBeforePhoto.desc":
    "Nos convívios, pergunta sempre antes de fotografar outras pessoas, mesmo num espaço partilhado.",
  "onboarding.stepNorms.agree":
    "Li e concordo com as <guidelines>Diretrizes da Comunidade</guidelines>",
  "onboarding.stepNorms.continue": "Concordo, continuar",
  "onboarding.stepNorms.back": "Voltar",

  "onboarding.stepIntents.heading": "O que te traz <em>aqui?</em>",
  "onboarding.stepIntents.hint":
    "Escolhe pelo menos uma — escolhe quantas fizerem sentido.",
  "onboarding.stepIntents.continue": "Continuar",
  "onboarding.stepIntents.back": "Voltar",
  "onboarding.stepIntents.saveError":
    "Não conseguimos guardar isso agora. Tenta novamente.",
  "onboarding.intent.community": "Comunidade",
  "onboarding.intent.gatherings": "Convívios e eventos",
  "onboarding.intent.professional": "Ligações profissionais",
  "onboarding.intent.dating": "Namoro",
  "onboarding.intent.resources": "Recursos e apoio",
  "onboarding.intent.contributing": "Contribuir",
  "onboarding.intent.housing": "Habitação",
  "onboarding.intent.flatmates": "Encontrar colegas de casa",
  "onboarding.intent.activism": "Ativismo",
  "onboarding.intent.creative": "Colaboração criativa",

  "onboarding.stepCommunities.heading": "Encontra as tuas <em>comunidades</em>",
  "onboarding.stepCommunities.body":
    "Grupos que talvez gostes, com base nos teus interesses.",
  "onboarding.stepCommunities.join": "Junta-te",
  "onboarding.stepCommunities.joined": "Já estás dentro",
  "onboarding.stepCommunities.requested": "Pedido enviado",
  "onboarding.stepCommunities.continue": "Continuar",
  "onboarding.stepCommunities.skip":
    "Saltar por agora — explora e junta-te depois",
  "onboarding.stepCommunities.back": "Voltar",
  "onboarding.stepCommunities.empty":
    "Sem sugestões de momento — podes explorar e juntar-te a comunidades quando quiseres.",

  "onboarding.stepDone.heading": "Já fazes <em>parte disto</em>",
  "onboarding.stepDone.cta": "Ir para o meu início",
  "onboarding.quickStart.browseDirectory.title":
    "Explora o diretório de pessoas",
  "onboarding.quickStart.browseDirectory.desc":
    "Membros em Lisboa e não só",
  "onboarding.quickStart.gatherings.title": "Vê os próximos convívios",
  "onboarding.quickStart.gatherings.desc": "Eventos reais para a comunidade",
  "onboarding.quickStart.magazine.title": "Lê a revista da comunidade",
  "onboarding.quickStart.magazine.desc":
    "Publicada no primeiro dia de cada mês",

  // ── Tour de boas-vindas (fluxo separado de 6 passos, em /welcome-tour) ──
  "tour.skipSetup": "Saltar configuração",
  "tour.stepLabel": "Passo {current} de {total}",
  "tour.allSet": "Já estás dentro!",
  "tour.nav.back": "Voltar",
  "tour.nav.continue": "Continuar",

  "tour.welcome.eyebrow": "Já estás dentro",
  "tour.welcome.heading": "Bem-vinde ao <em>QueerPulse.</em>",
  "tour.welcome.body":
    "Alguém na comunidade achou que pertencias aqui — e foi assim que todas as pessoas chegaram. Ainda bem que chegaste.",
  "tour.welcome.q101Label": "Ainda a encontrar as palavras?",
  "tour.welcome.q101Body":
    "Se estás a explorar de novo a tua identidade — não só a chegar a Lisboa — o <q101>Queer 101</q101> é um lugar tranquilo para começar. Não precisas de conta para o ler.",
  "tour.welcome.cta": "Vamos preparar-te",

  "tour.profile.eyebrow": "O teu perfil",
  "tour.profile.heading": "Conta-nos um pouco sobre <em>ti.</em>",
  "tour.profile.body":
    "É assim que a comunidade te vai conhecer. Podes mudar tudo depois.",
  "tour.profile.namePlaceholder": "O teu nome",
  "tour.profile.pronounsPlaceholder": "Pronomes (opcional)",
  "tour.profile.rolePlaceholder": "O que fazes — o teu papel ou prática",
  "tour.profile.neighbourhoodDefault": "O teu bairro em Lisboa",
  "tour.profile.visibilityLabel": "Quão visível queres estar?",

  "tour.visibility.open.title": "Disponível para ligações",
  "tour.visibility.open.desc":
    "Qualquer pessoa na rede pode ver o teu perfil e dizer olá",
  "tour.visibility.network.title": "Só a rede",
  "tour.visibility.network.desc": "Alcançável através de ligações em comum",
  "tour.visibility.private.title": "Em privado por agora",
  "tour.visibility.private.desc": "Contacto quando estiver preparade",

  "tour.interests.eyebrow": "O teu mundo",
  "tour.interests.heading": "O que é que te <em>importa?</em>",
  "tour.interests.body":
    "Usamos isto para sugerir ligações, convívios e comunidades. Seleciona quantos quiseres.",
  "tour.interest.design": "Design",
  "tour.interest.tech": "Tecnologia",
  "tour.interest.film": "Cinema",
  "tour.interest.music": "Música",
  "tour.interest.activism": "Ativismo",
  "tour.interest.wellbeing": "Bem-estar",
  "tour.interest.food": "Gastronomia",
  "tour.interest.sports": "Desporto",
  "tour.interest.writing": "Escrita",
  "tour.interest.craft": "Artesanato",
  "tour.interest.policy": "Políticas públicas",
  "tour.interest.community": "Comunidade",

  "tour.communities.eyebrow": "Os teus espaços",
  "tour.communities.heading": "Que comunidades <em>te chamam?</em>",
  "tour.communities.body":
    "Junta-te agora ou explora depois — podes sempre mudar isto. As tuas escolhas são privadas.",

  "tour.connections.eyebrow": "Primeiras ligações",
  "tour.connections.heading":
    "Três pessoas que valem <em>a pena cumprimentar.</em>",
  "tour.connections.body":
    "Estas são pessoas que costumam receber bem quem chega. Uma mensagem rápida já faz diferença.",
  "tour.connections.sayHello": "Diz olá",
  "tour.connections.sent": "Enviado",

  "tour.explore.eyebrow": "Já está tudo pronto",
  "tour.explore.heading": "Bem-vinde à <em>comunidade.</em>",
  "tour.explore.body":
    "Já fazes parte, oficialmente. Aqui está por onde começar — não há resposta certa, só o que te chama mais atenção.",
  "tour.explore.cta": "Ir para o QueerPulse",

  "tour.exploreCard.members.name": "Pessoas",
  "tour.exploreCard.members.desc": "Explora e diz olá a pessoas na rede",
  "tour.exploreCard.gatherings.name": "Convívios",
  "tour.exploreCard.gatherings.desc":
    "Confirma presença em algo a acontecer perto de ti",
  "tour.exploreCard.communities.name": "Comunidades",
  "tour.exploreCard.communities.desc":
    "Encontra um grupo ativo para te juntares",
  "tour.exploreCard.culture.name": "Cultura",
  "tour.exploreCard.culture.desc":
    "Clube do livro, mostra de arte, mural de encomendas, rádio",
  "tour.exploreCard.economy.name": "Economia",
  "tour.exploreCard.economy.desc":
    "Incubadora, ferramentas freelance, transparência salarial",
  "tour.exploreCard.queer101.name": "Queer 101",
  "tour.exploreCard.queer101.desc":
    "Ainda a explorar a tua identidade? Um lugar tranquilo para começar",
  "tour.exploreCard.volunteer.name": "Voluntariado",
  "tour.exploreCard.volunteer.desc":
    "Encontra uma forma de retribuir à comunidade local",
  "tour.exploreCard.arriving.name": "Chegaste a Lisboa?",
  "tour.exploreCard.arriving.desc":
    "Um guia para te instalares na cena queer local",
  "tour.exploreCard.sexualHealth.name": "Saúde sexual",
  "tour.exploreCard.sexualHealth.desc":
    "Testes, PrEP, recursos de VIH — específicos e diretos",
  "tour.exploreCard.safeSpaces.name": "Espaços seguros",
  "tour.exploreCard.safeSpaces.desc":
    "Locais validados pela comunidade — conquistados, não autodeclarados",
  "tour.exploreCard.sober.name": "Sobriedade social",
  "tour.exploreCard.sober.desc":
    "Uma vida social plena, sem o álcool no centro",

  "tour.neighbourhood.principeReal": "Príncipe Real",
  "tour.neighbourhood.mouraria": "Mouraria",
  "tour.neighbourhood.bairroAlto": "Bairro Alto",
  "tour.neighbourhood.caisDoSodre": "Cais do Sodré",
  "tour.neighbourhood.arroios": "Arroios",
  "tour.neighbourhood.alfama": "Alfama",
  "tour.neighbourhood.graca": "Graça",
  "tour.neighbourhood.marvila": "Marvila",
  "tour.neighbourhood.estrela": "Estrela",
  "tour.neighbourhood.intendente": "Intendente",
  "tour.neighbourhood.elsewhere": "Outro sítio em Lisboa",
  "tour.neighbourhood.newToLisbon":
    "Novo em Lisboa — ainda a encontrar o meu caminho",
};
