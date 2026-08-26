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
  "common.notAMemberYet": "Ainda não fazes parte?",
  "common.optionalSuffix": "(opcional)",

  // ── Entrar ──
  "signIn.title": "Bem-vinde de <em>volta</em>",
  "signIn.subtitle": "Entra para continuar de onde ficaste.",
  "signIn.artCaption": "Uma rede queer, <em>enraizada em Lisboa.</em>",
  "signIn.connecting": "A ligar…",
  "signIn.googleCta": "Continuar com o Google",
  "signIn.notice.inviteRequired.title": "Vais precisar de um convite",
  "signIn.notice.inviteRequired.body":
    "O QueerPulse funciona só por convite. Pede a alguém que já conheças, ou pede um convite e tratamos do resto.",
  "signIn.notice.accountSuppressed.title": "Esta conta foi eliminada",
  "signIn.notice.accountSuppressed.body":
    "Pediste-nos para eliminar esta conta, por isso não a vamos recriar em silêncio. Se quiseres voltar, pede um novo convite a alguém da comunidade, ou fala connosco que ajudamos.",
  "signIn.notice.ageAttestationRequired.title": "Falta confirmar uma coisa",
  "signIn.notice.ageAttestationRequired.body":
    "A QueerPulse é para maiores de 18 anos. Volta ao teu link de convite e confirma que tens 18 anos ou mais para entrares.",
  "signIn.notice.inviteInvalid.title": "Esse convite não é válido",
  "signIn.notice.inviteInvalid.body":
    "Este link de convite expirou ou já foi usado. Pede um novo a quem te convidou, ou pede um convite diretamente.",
  "signIn.notice.inviteEmailMismatch.title":
    "Este convite era para outro email",
  "signIn.notice.inviteEmailMismatch.body":
    "Alguém reservou este convite para um endereço específico. Inicia sessão com esse email, ou pede um novo convite para o que estás a usar.",
  "signIn.notice.inviteInviterInactive.title":
    "Quem te convidou já não está por cá",
  "signIn.notice.inviteInviterInactive.body":
    "A pessoa que enviou este convite já não está ativa no QueerPulse, por isso não te consegue trazer para dentro. Pede um novo convite a outra pessoa que conheças, ou pede um diretamente.",
  "signIn.notice.accessDenied.title": "O início de sessão foi cancelado",
  "signIn.notice.accessDenied.body":
    "Parece que cancelaste o ecrã de consentimento da Google. Sem problema, tenta outra vez quando quiseres.",
  "signIn.notice.noEmail.title": "Não conseguimos obter o teu email",
  "signIn.notice.noEmail.body":
    "A Google não partilhou um endereço de email connosco, por isso não conseguimos iniciar a tua sessão. Verifica as definições de partilha da tua conta Google e tenta novamente.",
  "signIn.notice.emailUnverified.title":
    "Verifica primeiro o teu email da Google",
  "signIn.notice.emailUnverified.body":
    "O email da tua conta Google ainda não está verificado. Verifica-o junto da Google e volta a tentar.",
  "signIn.notice.emailInUse.title": "Esse email já tem uma conta",
  "signIn.notice.emailInUse.body":
    "Este endereço já está associado a uma conta QueerPulse, por isso não podemos abrir uma segunda. Inicia sessão com a conta Google com que entraste da primeira vez.",
  "signIn.notice.oauthFailed.title": "Algo correu mal",
  "signIn.notice.oauthFailed.body":
    "O início de sessão não terminou do lado da Google. Nada foi alterado, tenta outra vez daqui a pouco.",
  "signIn.notice.offline.title": "Estás offline",
  "signIn.notice.offline.body":
    "Não conseguimos chegar ao QueerPulse sem ligação. Verifica o teu Wi-Fi ou dados móveis e tenta novamente.",
  "signIn.notice.serverError.title": "Algo correu mal do nosso lado",
  "signIn.notice.serverError.body":
    "O nosso servidor teve um problema{status}. A responsabilidade é nossa. Tenta novamente dentro de momentos.",
  "signIn.notice.unreachable.title": "Não conseguimos chegar ao QueerPulse",
  "signIn.notice.unreachable.body":
    "O servidor não respondeu. Pode estar a arrancar, espera um momento e tenta novamente.",

  // Mostrado por baixo de um aviso de porta fechada do OAuth acima (não nos
  // avisos de sonda de rede). Cobre membros bloqueados de forma permanente da
  // conta Google associada, sem outra via de recuperação aqui.
  "signIn.notice.support": "Continua preso? <a>Fala connosco</a>",

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

  // ── Ilustração "lareira" na página de entrada ──
  "communityArt.ariaLabel":
    "Ilustração de pessoas da comunidade a aproximarem-se de um centro acolhedor e caloroso",

  // ── Convidar (painel de envio + compositor + email/link) ──
  "invite.eyebrow": "Convida alguém a entrar",
  "invite.title": "Traz alguém <em>para aqui</em>",
  "invite.sub":
    "Provavelmente conheces alguém que se sentiria em casa aqui. Convida essa pessoa a juntar-se ao QueerPulse e avaliza-a pelo caminho.",
  "invite.quota.available_one": "{count} convite disponível este mês",
  "invite.quota.available_other": "{count} convites disponíveis este mês",
  "invite.quota.none": "Sem convites disponíveis este mês",
  "invite.quota.resets_one": "Renova amanhã",
  "invite.quota.resets_other": "Renova daqui a {count} dias",
  "invite.quota.resets_zero": "Renova hoje",

  "invite.compose.recipientEmail.label": "Para quem é",
  "invite.compose.recipientEmail.placeholder": "pessoa@exemplo.com",
  "invite.compose.recipientEmail.help":
    "Quem usar este convite entra com o teu aval registado e fica ligade a ti desde o primeiro dia. Se preencheres um endereço, só quem iniciar sessão com essa conta Google o pode usar, por isso um link reencaminhado ou fotografado não deixa entrar mais ninguém; se deixares em branco, qualquer pessoa com o link o pode usar.",
  "invite.compose.recipientEmail.noSend":
    "Preencher isto não envia nada para esse endereço. O link continua a ser partilhado por ti.",
  "invite.compose.recipientEmail.invalid":
    "Isto não parece um endereço de email. Verifica ou deixa o campo vazio.",
  "invite.compose.vouch.label": "O teu aval",
  "invite.compose.vouch.placeholder":
    "Porque é que devia entrar? Uma ou duas frases já ajudam bastante.",
  "invite.compose.note.label": "Nota pessoal",
  "invite.compose.note.placeholder": "Adiciona uma nota pessoal (opcional)",

  "invite.link.previewLabel": "Pré-visualização",
  "invite.link.generateCta": "Gerar link de convite",
  "invite.link.generating": "A gerar…",
  "invite.link.error.generic":
    "Algo correu mal ao gerar o teu link. Tenta outra vez.",
  "invite.link.error.quota":
    "Já usaste todos os convites da tua quota deste mês. Volta a encher quando o mês reiniciar.",
  "invite.link.formNote": "Este link funciona uma vez, para uma pessoa.",
  "invite.link.defaultVouch":
    "Alguém da comunidade acha que devias estar aqui. QueerPulse: uma rede queer avalizada em Lisboa, construída sobre confiança.",
  "invite.link.shareMessage":
    "{senderFirst} convidou-te para o QueerPulse, uma comunidade queer discreta e avalizada. O teu convite pessoal: {url}",

  "invite.ready.headline": "O teu convite está <em>pronto</em>",
  "invite.ready.sub":
    "Partilha da forma que fizer mais sentido. É válido para uma utilização.",
  "invite.ready.pinnedTo":
    "Reservado para {email}. Só uma conta Google com esse endereço o pode usar.",
  "invite.ready.pinnedSend":
    "Não foi enviado nada a essa pessoa. O link é partilhado por ti, da forma que fizer mais sentido.",
  "invite.ready.linkCopied": "Link copiado",
  "invite.ready.copyFailed": "Não foi possível copiar. Tenta selecionar o link",
  "invite.ready.shareThrough": "Partilhar através de",
  "invite.ready.qrHint": "Ou deixa que o leiam",
  "invite.ready.qrLabel":
    "Código QR deste link de convite, lê-o para abrir o convite",
  "invite.ready.oneTimeLink": "Link de utilização única",
  "invite.ready.expiresIn7Days": "Expira em 7 dias",
  "invite.ready.expiresOn": "Expira a {date}",

  "invite.sentList.label": "Convites que enviaste",
  "invite.sentList.filter.all": "Todos",
  "invite.sentList.status.valid": "Pendente",
  "invite.sentList.status.used": "Aceite",
  "invite.sentList.status.expired": "Expirado",
  "invite.sentList.status.revoked": "Revogado",
  "invite.sentList.detail.joined": "Entrou. Bem-vinde {name}",
  "invite.sentList.detail.sentExpires": "Enviado {sent} · expira {expires}",
  "invite.sentList.detail.sentExpired": "Enviado {sent} · expirou {expires}",
  "invite.sentList.detail.sent": "Enviado {sent}",
  "invite.sentList.anyoneWithLink": "Qualquer pessoa com o link",
  "invite.sentList.pinnedNote": "Só este endereço o pode usar",
  "invite.sentList.copyLinkCta": "Copiar link",
  "invite.sentList.copyLinkAriaLabel": "Copiar link do convite para {invite}",
  "invite.sentList.linkCopied": "Link do convite copiado",
  "invite.sentList.copyFailed":
    "Não foi possível copiar o link. Tenta selecioná-lo.",
  "invite.sentList.revokeCta": "Revogar",
  "invite.sentList.revoking": "A revogar…",
  "invite.sentList.revokedToast":
    "Convite revogado. O link deixou de funcionar.",
  "invite.sentList.revokeConfirm.title": "Revogar este convite?",
  "invite.sentList.revokeConfirm.body":
    "O código {code} deixa de funcionar assim que o revogares e não há forma de o recuperar. Se já o entregaste a alguém, essa pessoa não vai conseguir entrar com ele.",
  "invite.sentList.revokeConfirm.confirm": "Revogar",
  "invite.sentList.revokeConfirm.cancel": "Manter ativo",
  "invite.sentList.revokeError":
    "Não conseguimos revogar esse convite agora. Continua ativo, por isso tenta novamente daqui a pouco.",
  "invite.sentList.resendCta": "Enviar de novo",
  "invite.sentList.resending": "A enviar…",
  "invite.sentList.resentToast":
    "Convite enviado de novo: o mesmo link, válido por mais uma semana.",
  "invite.sentList.resendError.notYours":
    "Este convite não é teu para voltares a enviar.",
  "invite.sentList.resendError.notFound":
    "Não encontrámos esse convite. Pode já ter sido removido.",
  "invite.sentList.resendError.notResendable":
    "Só um convite expirado pode ser enviado de novo. Este já foi usado, foi retirado, ou ainda está válido.",
  "invite.sentList.resendError.generic":
    "Não foi possível voltar a enviar agora. Tenta outra vez daqui a pouco.",

  // ── Cartão de pré-visualização do convite (espelha as tags Open Graph) ──
  "sharePreview.heroTitle.line1": "Entra numa sala",
  "sharePreview.heroTitle.line2": "<em>onde já pertences</em>",
  "sharePreview.heroExplainer": "Uma rede queer. Enraizada em Lisboa.",
  "sharePreview.heroSub_one": "Só por convite · {count} pessoa",
  "sharePreview.heroSub_other": "Só por convite · {count} pessoas",
  "sharePreview.title": "{senderName} convidou-te para o QueerPulse",

  // ── Autoatestação 18+ (partilhada por onboarding + pedir convite) ──
  "ageAttestation.confirmLabel": "Confirmo que tenho 18 anos ou mais.",
  "ageAttestation.helper":
    "O QueerPulse é uma comunidade só para adultos, <eligibility>percebe porquê</eligibility>. Não precisas de identificação; confiamos em ti. <under18>Ainda não tens 18?</under18>",
  "adultsOnly.eyebrow": "Adesão",
  "adultsOnly.ariaLabel": "Porque o QueerPulse é só para adultos",
  "adultsOnly.title": "Porque o QueerPulse é <em>só para adultos</em>",
  "adultsOnly.body1":
    "O QueerPulse está aberto a qualquer pessoa com 18 anos ou mais que seja convidada ou avalizada para a comunidade.",
  "adultsOnly.body2":
    "Mantemos o espaço só para adultos por uma razão. Muito do que acontece aqui são conversas francas sobre sexo e saúde sexual, encontros e vida noturna, e o tipo de conversa sem filtros que só é seguro entre adultos. Não é adequado para menores, e misturar os dois poria a segurança de toda a gente em risco. As pessoas com menos de 18 também merecem comunidade queer; este só ainda não é o espaço para isso.",
  "adultsOnly.reassure": "Não precisas de identificação. Confiamos em ti.",
  "adultsOnly.done": "Percebi",

  // ── Bloco humano para menores de 18 ──
  "under18.title": "Vamos estar aqui <em>quando estiveres preparade</em>",
  "under18.body1":
    "A parte comunitária do QueerPulse é 18+ por agora, por isso ainda não podemos criar-te uma conta. Isto não diz nada sobre ti. Mas quase tudo o que fazemos está aberto a toda a gente, sem precisares de iniciar sessão. Pertences à comunidade queer, e há muita dela à tua espera aqui mesmo.",
  "under18.body2":
    "Dá uma vista de olhos à biblioteca e a tudo o resto que já é teu:",
  "under18.link.library": "A biblioteca: livre para explorares, sem conta",
  "under18.link.queer101": "Queer 101: o essencial, sem barreiras",
  "under18.link.comingOut": "Assumir-te, ao teu próprio ritmo",
  "under18.link.resources": "Recursos e apoio da comunidade",
  "under18.link.eligibility": "Porque somos 18+ (os nossos Termos)",
  "under18.backDefault": "Voltar",
  "under18.link.contact": "Fala connosco se algo aqui parecer errado",
  "under18.signedIn.body":
    "Neste momento tens sessão iniciada, por isso vamos fechá-la aqui. Volta quando fizeres 18 anos e alguém te convidará com todo o gosto.",
  "under18.signOut": "Terminar sessão",

  // ── Voltar a concordar quando os Termos ou as Diretrizes mudam (ID-14) ──
  "policyReacceptance.eyebrow": "Antes de continuares",
  "policyReacceptance.title": "Atualizámos <em>as regras que partilhamos</em>",
  "policyReacceptance.lede":
    "Parte do que aceitaste quando entraste mudou. Preferimos perguntar a presumir, por isso lê com calma e diz-nos que estás de acordo.",
  "policyReacceptance.documents.terms": "Termos de Serviço",
  "policyReacceptance.documents.guidelines": "Diretrizes da Comunidade",
  "policyReacceptance.versionChanged":
    "Aceitaste a versão {previous}. Está agora em vigor a versão {current}.",
  "policyReacceptance.versionUnrecorded":
    "Não temos registo de nenhuma aceitação tua. Está agora em vigor a versão {current}.",
  "policyReacceptance.read": "Ler",
  "policyReacceptance.agree": "Li e concordo",
  "policyReacceptance.agreeing": "A guardar…",
  "policyReacceptance.error":
    "Não conseguimos registar isso agora. Verifica a ligação e tenta de novo.",
  "policyReacceptance.signOut": "Terminar sessão",

  // ── Confirmar email (código de seis dígitos) ──

  // ── Entrar por link mágico ──

  // ── Pedir um convite ──
  "requestInvite.eyebrow": "Pedir um convite",
  "requestInvite.title": "Pede para <em>entrar.</em>",
  "requestInvite.sub":
    "O QueerPulse cresce através de confiança. A forma mais certa de entrar é uma pessoa que já cá está avalizar-te, por isso se conheces alguém aqui, pede-lhe. Se não conheces, conta-nos um pouco sobre ti e tratamos do resto.",
  "requestInvite.alreadyMember": "Já fazes parte? Entrar",
  "requestInvite.checkStatusLink": "Já pediste? Consulta o teu pedido",
  "requestInvite.field.name.label": "O teu nome",
  "requestInvite.field.name.placeholder": "Alex",
  "requestInvite.field.name.error": "Diz-nos como te chamas.",
  "requestInvite.field.city.label": "Cidade",
  "requestInvite.field.city.placeholder": "Lisboa",
  "requestInvite.field.email.label": "Email",
  "requestInvite.field.email.placeholder": "tu@exemplo.com",
  "requestInvite.field.email.error":
    "Esse email não parece estar certo. Importas-te de verificar?",
  "requestInvite.field.email.errorRequired":
    "Precisamos de um email para te podermos responder.",
  "requestInvite.field.mutual.label":
    "Email de um membro <optional>(opcional)</optional>",
  "requestInvite.field.mutual.helper":
    "O email de um membro que possa avalizar-te. É como o encontramos, e a forma mais rápida de entrar.",
  "requestInvite.field.mutual.placeholder": "membro@exemplo.com",
  "requestInvite.field.mutual.error":
    "Introduz um email válido, ou deixa em branco.",
  "requestInvite.field.why.label": "Porquê o QueerPulse",
  "requestInvite.field.why.placeholder":
    "O que procuras, e o que te traz aqui. Umas frases sinceras já chegam.",
  "requestInvite.field.why.error":
    "Conta-nos um pouco sobre o que te traz aqui.",
  "requestInvite.agree":
    "Li as <guidelines>diretrizes da comunidade</guidelines> e estou aqui de boa-fé.",
  "requestInvite.readHint":
    "Abre as diretrizes e lê até ao fim para continuar.",
  "requestInvite.submit": "Enviar o meu pedido",
  "requestInvite.sending": "A enviar o teu pedido…",
  "requestInvite.submitError":
    "Não foi possível enviar o teu pedido. Tenta outra vez",
  // 429: o formulário público tem um limite de 3 pedidos/hora por IP. Tentar
  // de imediato não vai resultar, por isso a mensagem define a expectativa
  // com clareza em vez de convidar a essa tentativa.
  "requestInvite.rateLimitedError":
    "Atingiste o limite por agora. Espera um pouco e tenta novamente.",
  "requestInvite.under18BackLabel": "Voltar ao formulário",
  "requestInvite.sent.title": "Estás na <em>lista.</em>",
  "requestInvite.sent.sub_withName":
    "Obrigade, {name}. O teu pedido para entrar no QueerPulse foi enviado. Guarda o código aqui em baixo num sítio seguro, é assim que voltas a saber dele.",
  "requestInvite.sent.sub_noName":
    "Obrigade. O teu pedido para entrar no QueerPulse foi enviado. Guarda o código aqui em baixo num sítio seguro, é assim que voltas a saber dele.",
  "requestInvite.sent.backHome": "Voltar ao início",
  // O caso 409: já existe um pedido em aberto para este email. Não correu nada
  // mal, por isso isto lê-se como confirmação e nunca como falha.
  "requestInvite.already.title": "Já <em>o temos.</em>",
  "requestInvite.already.sub_withName":
    "Já nos tinhas pedido, {name}. O teu pedido continua connosco e continua a ser lido. Não é preciso enviar outro.",
  "requestInvite.already.sub_noName":
    "Já nos tinhas pedido. O teu pedido continua connosco e continua a ser lido. Não é preciso enviar outro.",
  "requestInvite.whatNext.readsIt.title": "Uma pessoa real lê-o",
  "requestInvite.whatNext.readsIt.body":
    "Uma pessoa da comunidade vê cada pedido, à mão. É por isso que pode demorar alguns dias.",
  "requestInvite.whatNext.connection.title": "Procuramos uma ligação",
  "requestInvite.whatNext.connection.body":
    "Se já houver alguém aqui que te possa avalizar, essa é a forma mais certa de entrar. Partilhar o email dessa pessoa ajuda-nos a encontrá-la.",
  // Substitui o antigo passo `hearBack`, que prometia uma mensagem que nenhum
  // serviço de email existe para enviar e depois dizia a quem não tem contactos
  // cá dentro que o silêncio significava desistir. Agora o mecanismo é real:
  // ficam com um código, e a resposta espera por elas na página de estado.
  "requestInvite.whatNext.checkBack.title": "Consultas com o teu código",
  "requestInvite.whatNext.checkBack.body":
    "Não enviamos nada por email, por isso o teu código de referência é a forma de saberes. Abre a tua página de estado quando quiseres, e se for que sim, o teu link de convite está lá à espera.",

  // ── O código de referência, entregue no ecrã de confirmação ──
  // O backend guarda apenas um hash deste código e nada o reenvia, por isso
  // este bloco é todo o mecanismo de entrega. Calmo, e claro sobre a razão:
  // assustar alguém que acabou de pedir para entrar seria pouco simpático e
  // ainda menos eficaz.
  "requestInvite.reference.title": "O teu código de referência",
  "requestInvite.reference.fieldLabel": "Código de referência",
  "requestInvite.reference.copy": "Copiar",
  "requestInvite.reference.copied": "Copiado",
  "requestInvite.reference.copiedToast": "Código de referência copiado.",
  "requestInvite.reference.copyErrorToast":
    "Não conseguimos copiar. Seleciona o código e copia à mão.",
  "requestInvite.reference.body":
    "Este código é a forma de consultares o teu pedido. Guarda-o num sítio onde o voltes a encontrar: não enviamos nada por email, e não conseguimos emitir o código uma segunda vez.",
  "requestInvite.reference.checkCta": "Consultar o meu pedido",
  // O caso 409: já existe um pedido em aberto, por isso não há linha nova nem
  // código novo. Nunca mostrar um espaço vazio; apontar para o que já têm.
  "requestInvite.reference.noCode":
    "O teu primeiro pedido já tem um código, do dia em que o enviaste. Não há um novo aqui, porque não há um pedido novo.",
  "requestInvite.reference.enterCodeCta":
    "Consultar o meu pedido com esse código",

  // Estados antecipados, mostrados a partir de GET /platform-status ANTES do
  // envio, para ninguém preencher o formulário todo só para ser rejeitade ao
  // submeter.
  "requestInvite.closed.title": "Pedidos de convite em pausa",
  "requestInvite.closed.body":
    "Não estamos a receber novos pedidos de convite neste momento. Volta a passar por aqui em breve.",
  "requestInvite.closedError":
    "Os pedidos de convite ficaram em pausa enquanto preenchias isto. Tenta novamente mais tarde.",

  // ── Estado do pedido de entrada (/auth/request-invite/status) ──
  // A vista que a própria pessoa tem do seu pedido. Pública: quem precisa desta
  // página não tem conta, por definição. Seis estados, uma moldura calma. Nunca
  // escrever nada que sugira uma lista de espera: o backend reporta de propósito
  // um pedido em lista de espera como "em análise", porque dizer a alguém que
  // está numa lista é uma decisão que ainda não tomámos.
  "joinRequestStatus.eyebrow": "O teu pedido",
  "joinRequestStatus.backHome": "Voltar ao início",
  "joinRequestStatus.contactCta": "Falar connosco",
  "joinRequestStatus.loading": "A consultar o teu pedido…",

  // O caminho de recuperação: guardaram o código e perderam o link.
  "joinRequestStatus.form.title": "Consulta o teu <em>pedido.</em>",
  "joinRequestStatus.form.lead":
    "Introduz o código de referência que recebeste quando enviaste o pedido, e dizemos-te em que ponto está.",
  "joinRequestStatus.form.label": "Código de referência",
  "joinRequestStatus.form.placeholder": "Cola aqui o teu código",
  "joinRequestStatus.form.helper":
    "É o código comprido do ecrã que viste logo depois de enviares o pedido.",
  "joinRequestStatus.form.error":
    "Introduz o código de referência que recebeste.",
  "joinRequestStatus.form.submit": "Consultar o meu pedido",

  // Ainda com quem revê. Sem data prometida, porque não temos nenhuma.
  "joinRequestStatus.underReview.eyebrow": "Ainda connosco",
  "joinRequestStatus.underReview.title":
    "O teu pedido está a <em>ser lido.</em>",
  "joinRequestStatus.underReview.lead":
    "Enviaste-o {ago}, a {date}. Uma pessoa da comunidade lê cada pedido à mão, e isso pode demorar alguns dias.",
  "joinRequestStatus.underReview.leadNoDate":
    "O teu pedido está com uma pessoa da comunidade. Cada pedido é lido à mão, e isso pode demorar alguns dias.",
  "joinRequestStatus.underReview.leadDateOnly":
    "Enviaste-o a {date}. Uma pessoa da comunidade lê cada pedido à mão, e isso pode demorar alguns dias.",
  "joinRequestStatus.underReview.note":
    "Não tens de fazer nada enquanto esperas. Volta a esta página quando quiseres, o teu código continua a funcionar.",
  "joinRequestStatus.underReview.foot":
    "Mudou alguma coisa, ou queres acrescentar algo ao teu pedido? <a>Falar connosco</a>",

  // Aprovado, convite ainda válido. A boa notícia.
  "joinRequestStatus.approved.eyebrow": "Estás dentro",
  "joinRequestStatus.approved.title": "És <em>bem-vinde aqui.</em>",
  "joinRequestStatus.approved.lead":
    "O teu pedido foi aprovado a {date}. O teu convite está aqui em baixo. Abre-o para criares a tua conta.",
  "joinRequestStatus.approved.leadNoDate":
    "O teu pedido foi aprovado. O teu convite está aqui em baixo. Abre-o para criares a tua conta.",
  "joinRequestStatus.approved.linkLabel": "O teu link de convite",
  "joinRequestStatus.approved.copy": "Copiar",
  "joinRequestStatus.approved.copied": "Copiado",
  "joinRequestStatus.approved.copiedToast": "Link de convite copiado.",
  "joinRequestStatus.approved.copyErrorToast":
    "Não conseguimos copiar. Seleciona o link e copia à mão.",
  "joinRequestStatus.approved.cta": "Abrir o meu convite",
  "joinRequestStatus.approved.note":
    "Este convite traz uma pessoa, e essa pessoa és tu. Guarda o link só para ti.",
  "joinRequestStatus.approved.foot":
    "Problemas a abri-lo? <a>Falar connosco</a>",

  // Aprovado, mas o convite já foi usado, revogado ou expirou. Um estado real,
  // com o seu próprio caminho de recuperação, nunca misturado com o anterior.
  "joinRequestStatus.approvedSpent.eyebrow": "Aprovado",
  "joinRequestStatus.approvedSpent.title":
    "O teu convite <em>já não está válido.</em>",
  "joinRequestStatus.approvedSpent.lead":
    "Foste aprovade a {date}, mas o convite por trás deste código já foi usado ou expirou. Diz-nos e emitimos um novo.",
  "joinRequestStatus.approvedSpent.leadNoDate":
    "Foste aprovade, mas o convite por trás deste código já foi usado ou expirou. Diz-nos e emitimos um novo.",
  "joinRequestStatus.approvedSpent.cta": "Pedir um novo convite",
  "joinRequestStatus.approvedSpent.signInCta": "Já criei a minha conta",
  "joinRequestStatus.approvedSpent.foot":
    "O sim mantém-se. Só o link é que expirou.",

  // Recusado. O estado que exige mais cuidado: dizer o que aconteceu, manter a
  // limitação do nosso lado sempre que isso for honesto, e deixar sempre uma
  // pessoa com quem falar.
  "joinRequestStatus.declined.eyebrow": "Já o lemos",
  "joinRequestStatus.declined.title": "Desta vez <em>não.</em>",
  "joinRequestStatus.declined.lead":
    "Uma pessoa da comunidade leu o teu pedido a {date}, e desta vez não conseguimos receber-te.",
  "joinRequestStatus.declined.leadNoDate":
    "Uma pessoa da comunidade leu o teu pedido, e desta vez não conseguimos receber-te.",
  // `underage` tem título e entrada próprios, e mostra o aviso 18+ de apoio que
  // a plataforma já tem em vez de um motivo: uma pessoa jovem tem de encontrar
  // uma porta aberta com uma data, nunca um veredicto sobre quem é.
  "joinRequestStatus.declined.titleUnderage":
    "Estamos cá <em>quando fizeres 18.</em>",
  "joinRequestStatus.declined.leadUnderage":
    "Uma pessoa da comunidade leu o teu pedido a {date}. O QueerPulse é 18+ por agora, por isso ainda não te podemos receber.",
  "joinRequestStatus.declined.leadUnderageNoDate":
    "Uma pessoa da comunidade leu o teu pedido. O QueerPulse é 18+ por agora, por isso ainda não te podemos receber.",
  "joinRequestStatus.declined.reasonTitle": "O que te podemos dizer",
  "joinRequestStatus.declined.contactCta": "Falar connosco",

  // Formulação virada para a pessoa que pediu, sobre as mesmas chaves fechadas
  // que a fila de moderação usa (`joinRequestDeclineReason.ts`). As etiquetas de
  // admin são notação de quem revê e aqui soariam a acusação, por isso estas
  // dizem o que aconteceu, de quem foi a limitação, e o que fazer a seguir.
  "joinRequestStatus.declineReason.spam_pattern":
    "O teu pedido chegou com um formato que quem revê vê sobretudo em envios automáticos, por isso não teve a leitura que merecia. Se foste tu a escrevê-lo, fala connosco e voltamos a olhar para ele.",
  "joinRequestStatus.declineReason.underage":
    "O QueerPulse é 18+ por agora. Isso tem que ver com a lei e com manter espaços de adultos como espaços de adultos, e não diz nada sobre ti.",
  "joinRequestStatus.declineReason.implausible":
    "Quem reviu não conseguiu situar o suficiente do que escreveste para ficar segure, e um formulário curto dá muito pouco por onde pegar. Se alguém que já cá está te conhece, pede-lhe que te avalize, e podes escrever-nos entretanto.",
  "joinRequestStatus.declineReason.safety_concern":
    "Algo no pedido levantou uma questão de segurança para as pessoas que já cá estão, por isso travámos. Se quiseres falar sobre isso, escreve-nos e uma pessoa vai ler.",
  "joinRequestStatus.declineReason.other":
    "Quem reviu não deixou um motivo que possamos mostrar aqui. Se quiseres perceber, escreve-nos e uma pessoa responde.",

  // Uma só resposta para o 400 (código malformado) e para o 404 (pedido
  // inexistente), para que testar códigos não revele quais existem.
  "joinRequestStatus.notFound.eyebrow": "Sem correspondência",
  "joinRequestStatus.notFound.title": "Não <em>encontrámos isso.</em>",
  "joinRequestStatus.notFound.lead":
    "Não encontrámos nenhum pedido para esse código. Vê se falta um carácter ou se ficou um espaço a mais e tenta outra vez. Se mesmo assim não resultar, fala connosco e uma pessoa ajuda-te.",
  "joinRequestStatus.notFound.retryCta": "Tentar outro código",

  // O servidor não respondeu. Diferente de "sem correspondência": não se sabe
  // nada em nenhum sentido, e vale a pena tentar de novo.
  "joinRequestStatus.unavailable.eyebrow": "Sem resposta",
  "joinRequestStatus.unavailable.title":
    "Não <em>conseguimos chegar ao QueerPulse.</em>",
  "joinRequestStatus.unavailable.lead":
    "O servidor não respondeu, por isso não te podemos dizer nada neste momento. O teu pedido está intacto. Espera um pouco e tenta novamente.",
  "joinRequestStatus.unavailable.retryCta": "Tentar novamente",
  "joinRequestStatus.unavailable.foot":
    "Continua sem resposta? <a>Falar connosco</a>",

  // ── Onboarding (fluxo de 7 passos após o registo, em /onboarding) ──
  "onboarding.stepLabel": "Passo {current} de {total}",
  "onboarding.welcomeToQueerPulse": "Bem-vinde ao QueerPulse",
  "onboarding.stepIntro.heading": "Vamos <em>instalar-te</em> por aqui",
  "onboarding.stepIntro.body":
    "Uns passos rápidos para configurares o teu perfil e começares a encontrar a tua gente. Demora só uns minutos, e podes sempre mudar tudo depois.",
  "onboarding.stepIntro.cta": "Vamos começar",
  "onboarding.preview.makeItYours.title": "Torna-o teu",
  "onboarding.preview.makeItYours.desc":
    "Adiciona uma foto e alguns detalhes para que as pessoas te conheçam melhor.",
  "onboarding.preview.setIntentions.title": "O que te traz aqui?",
  "onboarding.preview.setIntentions.desc":
    "Conta-nos um pouco sobre o que procuras e de que gostavas de fazer parte.",
  "onboarding.preview.findCommunities.title": "Encontra as tuas comunidades",
  "onboarding.preview.findCommunities.desc":
    "Escolhe as comunidades que fazem sentido para ti e descobre onde pertences.",

  "onboarding.stepWelcome.eyebrowSuffix": "Já estás dentro",
  "onboarding.stepWelcome.heading": "Bem-vinde, <em>{firstName}</em>",
  "onboarding.stepWelcome.memberSince": "Aqui desde {since}",
  "onboarding.stepWelcome.invitedYou": "Convidou-te",
  "onboarding.stepWelcome.memberSinceRole": "Aqui desde {since} · {role}",
  "onboarding.stepWelcome.vouchFallback":
    "{firstName} é atente, criative, e exatamente quem esperávamos encontrar aqui.",
  "onboarding.stepWelcome.body1":
    "Estás aqui porque alguém achou que devias estar.",
  "onboarding.stepWelcome.body2":
    "A QueerPulse é uma comunidade para pessoas LGBTQ+ e para quem constrói, cria e contribui à volta delas em Lisboa.",
  "onboarding.stepWelcome.body3":
    "Alguém que te conhece convidou-te a entrar. Agora é a tua vez de fazeres deste espaço o teu.",
  "onboarding.stepWelcome.cta": "Vamos a isto",
  "onboarding.stepWelcome.back": "Voltar",

  "onboarding.stepPhoto.heading": "Põe um rosto ao <em>nome</em>",
  "onboarding.stepPhoto.body":
    "Uma foto e alguns detalhes rápidos ajudam as pessoas a sentirem-se confortáveis a ligar-se a ti. Podes sempre adicionar ou mudar isto depois.",
  "onboarding.stepPhoto.captionPreview":
    "Ótimo aspeto. Toca na foto para a alterar",
  "onboarding.stepPhoto.captionGoogle":
    "Da tua conta Google. Toca na foto para a alterar",
  "onboarding.stepPhoto.captionUpload": "Toca para carregar uma foto",
  "onboarding.stepPhoto.uploadAriaLabel": "Carregar uma foto de perfil",
  "onboarding.stepPhoto.photoAlt": "A tua foto de perfil",
  "onboarding.stepPhoto.placeholder": "a tua foto",
  "onboarding.stepPhoto.continue": "Continuar",
  "onboarding.stepPhoto.skip": "Saltar por agora, podes adicionar isto depois",
  "onboarding.stepPhoto.back": "Voltar",
  "onboarding.stepPhoto.uploadError":
    "Não conseguimos adicionar essa foto. Tenta novamente.",
  "onboarding.stepPhoto.saveError":
    "Não conseguimos guardar isso agora. Tenta novamente.",
  "onboarding.stepPhoto.firstName.label": "Nome próprio",
  "onboarding.stepPhoto.lastName.label": "Apelido",
  "onboarding.stepPhoto.name.helper":
    "É isto que as outras pessoas vão ver no teu perfil. Tirámos isto da tua conta Google, mas podes mudá-lo.",
  "onboarding.stepPhoto.preview.caption":
    "Como vai ficar o teu cartão de perfil",
  "onboarding.stepPhoto.pronouns.label": "Pronomes",
  "onboarding.stepPhoto.pronouns.helper":
    "Como preferires que as outras pessoas se refiram a ti. Totalmente opcional.",
  "onboarding.stepPhoto.pronouns.placeholder": "ex.: they/them",
  "onboarding.stepPhoto.pronouns.quickPickLabel":
    "Escolhas rápidas de pronomes",
  "onboarding.stepPhoto.bio.label": "Uma linha sobre ti",
  "onboarding.stepPhoto.bio.helper":
    "Aparece no teu perfil. Podes mudar isto a qualquer momento nas Definições.",
  "onboarding.stepPhoto.bio.placeholder": "Conta um pouco sobre quem és",

  "onboarding.stepNorms.heading": "Este é um espaço <em>cuidado</em>",
  "onboarding.stepNorms.norm.bePresent.title": "Está presente",
  "onboarding.stepNorms.norm.bePresent.desc":
    "Dá às conversas a tua atenção genuína. Passar ao lado tudo bem; envolveres-te a meio gás não.",
  "onboarding.stepNorms.norm.namesPronouns.title": "Respeita nomes e pronomes",
  "onboarding.stepNorms.norm.namesPronouns.desc":
    "Usa o nome e os pronomes que cada pessoa partilha. Se tiveres dúvidas, pergunta. Isso é sempre bem-vindo aqui.",
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
  "onboarding.stepNorms.readHint":
    "Abre as diretrizes e lê até ao fim para continuar.",
  "onboarding.stepNorms.continue": "Concordo, continuar",
  "onboarding.stepNorms.back": "Voltar",
  "onboarding.stepNorms.control.title": "Tens sempre o controlo",
  "onboarding.stepNorms.control.desc":
    "Podes bloquear, silenciar ou denunciar qualquer pessoa, a qualquer momento. <a>Vê como funciona bloquear e silenciar</a>.",

  "onboarding.stepIntents.heading": "O que te traz <em>aqui?</em>",
  "onboarding.stepIntents.hint":
    "Escolhe pelo menos uma, e quantas fizerem sentido.",
  "onboarding.stepIntents.continue": "Continuar",
  "onboarding.stepIntents.skip":
    "Saltar por agora, podes partilhar isto depois",
  "onboarding.stepIntents.back": "Voltar",
  "onboarding.stepIntents.saveError":
    "Não conseguimos guardar isso agora. Tenta novamente.",
  "onboarding.stepIntents.visibility.title": "Mostrar isto no meu perfil",
  "onboarding.stepIntents.visibility.descPublic":
    "Outros membros vão ver no teu perfil o que procuras.",
  "onboarding.stepIntents.visibility.descPrivate":
    "Fica só para ti. Podes ativar quando quiseres nas Definições.",
  // ── Passo 6: o que fazes (StepWork) ─────────────────────────────────────────
  // Guarda a área e a função no próprio perfil, que é o que os filtros do
  // diretório procuram. Opcional: saltar não guarda nada.
  "onboarding.stepWork.heading": "O que <em>fazes?</em>",
  "onboarding.stepWork.hint":
    "Escolhe a tua área e depois as funções que encaixam. Isto é público e é assim que as pessoas te encontram no diretório de membros.",
  "onboarding.stepWork.continue": "Continuar",
  "onboarding.stepWork.skip": "Saltar por agora, podes adicionar isto depois",
  "onboarding.stepWork.back": "Voltar",
  "onboarding.stepWork.saveError":
    "Não conseguimos guardar isso agora. Tenta novamente.",
  "onboarding.intent.community": "Comunidade",
  "onboarding.intent.gatherings": "Convívios e eventos",
  "onboarding.intent.professional": "Ligações profissionais",
  "onboarding.intent.dating": "Namoro",
  "onboarding.intent.friendship": "Amizade",
  "onboarding.intent.resources": "Recursos e apoio",
  "onboarding.intent.contributing": "Contribuir",
  "onboarding.intent.housing": "Habitação",
  "onboarding.intent.flatmates": "Encontrar colegas de casa",
  "onboarding.intent.activism": "Ativismo",
  "onboarding.intent.creative": "Colaboração criativa",
  "onboarding.intent.media": "Media e cultura",
  "onboarding.intent.discussions": "Discussões",
  "onboarding.intent.mentorship": "Mentoria",

  "onboarding.stepCommunities.heading": "Encontra as tuas <em>comunidades</em>",
  "onboarding.stepCommunities.body":
    "Grupos que talvez gostes, com base nos teus interesses.",
  "onboarding.stepCommunities.join": "Junta-te",
  "onboarding.stepCommunities.joined": "Já estás dentro",
  "onboarding.stepCommunities.leave": "Sair da comunidade",
  "onboarding.stepCommunities.requested": "Pedido enviado",
  "onboarding.stepCommunities.continue": "Continuar",
  "onboarding.stepCommunities.skip":
    "Saltar por agora, explora e junta-te depois",
  "onboarding.stepCommunities.back": "Voltar",
  "onboarding.stepCommunities.empty":
    "Sem sugestões de momento. Podes explorar e juntar-te a comunidades quando quiseres.",

  "onboarding.stepDone.heading": "Já fazes <em>parte disto</em>",
  "onboarding.stepDone.cta": "Ir para o meu início",
  "onboarding.stepDone.notifications.title": "Fica a par de tudo",
  "onboarding.stepDone.notifications.desc":
    "Recebe notificações de mensagens, convites e lembretes de convívios no teu telemóvel. Podes mudar isto a qualquer momento nas Definições.",
  "onboarding.stepDone.stampFailed.title":
    "Não conseguimos guardar que terminaste",
  "onboarding.stepDone.stampFailed.desc":
    "Estás dentro à mesma. Sem isto, podemos voltar a levar-te por esta mesma configuração da próxima vez.",
  "onboarding.stepDone.stampFailed.retry": "Tentar de novo",
  "onboarding.quickStart.browseDirectory.title":
    "Explora o diretório de pessoas",
  "onboarding.quickStart.browseDirectory.desc": "Membros em Lisboa e não só",
  "onboarding.quickStart.gatherings.title": "Vê os próximos convívios",
  "onboarding.quickStart.gatherings.desc": "Eventos reais para a comunidade",
  "onboarding.quickStart.magazine.title": "Lê a revista da comunidade",
  "onboarding.quickStart.magazine.desc":
    "Publicada no primeiro dia de cada mês",
  "onboarding.quickStart.gettingStarted.title":
    "Vê a tua lista de primeiros passos",
  "onboarding.quickStart.gettingStarted.desc":
    "Alguns pequenos marcos para te ajudarem a instalar-te",

  // ── `tour.neighbourhood.elsewhere` é o único sobrevivente do Tour de
  //    boas-vindas removido (antigo /welcome-tour, uma superfície morta
  //    "porte fiel"): o `hoodLabel()` de listBusiness.data.ts continua a
  //    resolver a opção "outro sítio" do dropdown de bairro através desta
  //    string partilhada do catálogo. ──
  "tour.neighbourhood.elsewhere": "Outro sítio em Lisboa",

  // ── Primeiros passos — a lista em /account/getting-started. Cada passo é
  //    detetado a partir de dados reais da conta (ver useGettingStarted). ──
  "gettingStarted.eyebrow": "Novo por aqui",
  "gettingStarted.title": "Primeiros <em>passos</em>",
  "gettingStarted.lede":
    "Alguns primeiros passos para encontrares a tua gente e te instalares. Sem pressa: pela ordem que quiseres, quando quiseres.",
  "gettingStarted.ledeProgress":
    "Bom progresso até agora: já fizeste {done} de {total}. Faltam mais alguns passos para encontrares a tua gente e te instalares.",
  "gettingStarted.progress": "{done} de {total} feitos",
  "gettingStarted.levelStrip.eyebrow": "O teu nível",
  "gettingStarted.levelStrip.progress": "{xp} de {xpMax} XP",
  "gettingStarted.levelStrip.hint":
    "Cada passo que concluis dá XP para o teu próximo nível.",
  "gettingStarted.levelStrip.hintDone":
    "Continua a explorar a QueerPulse para ganhares mais.",
  "gettingStarted.xpSources.eyebrow": "O que já rendeu XP",
  "gettingStarted.xpSources.amount": "+{xp} XP",
  "gettingStarted.xpSources.seeAll": "Ver detalhe completo",
  "gettingStarted.xpSources.seeBadgesPage": "Ir para a página de Emblemas",
  "gettingStarted.stepXp": "+{xp} XP",
  "gettingStarted.stepXpEarned": "+{xp} XP ganhos",
  "gettingStarted.success.badge": "Ganhaste o crachá First Steps.",
  "gettingStarted.meterAria": "{done} de {total} primeiros passos feitos",
  "gettingStarted.checking": "A verificar o teu progresso…",
  "gettingStarted.doneLabel": "Feito",
  "gettingStarted.steps.profile.title": "Preenche o teu perfil",
  "gettingStarted.steps.profile.desc":
    "Uma foto e umas palavras ajudam as pessoas a reconhecer-te e a dizer olá.",
  "gettingStarted.steps.profile.done": "O teu perfil já tem a tua cara.",
  "gettingStarted.steps.profile.cta": "Editar perfil",
  "gettingStarted.steps.community.title": "Entra numa comunidade",
  "gettingStarted.steps.community.desc":
    "Encontra os círculos que combinam contigo (livros, noite, ativismo) e aparece.",
  "gettingStarted.steps.community.done": "Estás dentro. Bem-vinde ao círculo.",
  "gettingStarted.steps.community.cta": "Ver comunidades",
  "gettingStarted.steps.persona.title": "Cria uma persona",
  "gettingStarted.steps.persona.desc":
    "Dá a um lado teu o seu próprio espaço: o teu nome de DJ, a tua arte, a tua escrita.",
  "gettingStarted.steps.persona.done": "A tua persona já tem o seu cantinho.",
  "gettingStarted.steps.persona.cta": "Criar uma persona",
  "gettingStarted.steps.vouch.title": "Avaliza alguém",
  "gettingStarted.steps.vouch.desc":
    "Avaliza alguém em quem confias. É assim que a rede se mantém genuína.",
  "gettingStarted.steps.vouch.done":
    "Avalizaste. Obrigade por manteres tudo genuíno.",
  "gettingStarted.steps.vouch.cta": "Ver membros",
  "gettingStarted.steps.connect.title": "Liga-te a alguém",
  "gettingStarted.steps.connect.desc":
    "Fala com alguém que gostavas de conhecer. Ligares-te abre as mensagens.",
  "gettingStarted.steps.connect.done": "Fizeste a tua primeira ligação.",
  "gettingStarted.steps.connect.cta": "Ver membros",
  "gettingStarted.steps.post.title": "Publica pela primeira vez",
  "gettingStarted.steps.post.desc":
    "Diz olá numa comunidade onde entraste. Sem pressão, uma frase chega.",
  "gettingStarted.steps.post.done": "Já disseste o teu primeiro olá.",
  "gettingStarted.steps.post.cta": "Abrir uma comunidade",
  "gettingStarted.allDone.title": "Está tudo",
  "gettingStarted.allDone.em": "pronto",
  "gettingStarted.allDone.body":
    "Já fizeste o essencial. O resto do QueerPulse é teu para explorares, com calma.",
  "gettingStarted.allDone.cta": "Explorar o QueerPulse",
  "gettingStarted.sideQuests.eyebrow": "A seguir",
  "gettingStarted.sideQuests.title": "Missões <em>secundárias</em>",
  "gettingStarted.sideQuests.lede":
    "Agora que já te instalaste, ainda há mais para descobrir: mais umas coisas para experimentares, cada uma com um crachá ou regalia à espera no fim.",
  "gettingStarted.sideQuests.cta": "Começar",
  "gettingStarted.sideQuests.showMore": "Mostrar mais {count}",
};
