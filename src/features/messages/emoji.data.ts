/* GENERATED FILE. Do not edit: every line below is overwritten on the next run.
 *
 * Written by scripts/generate-emoji-data.mjs from the emojibase-data
 * devDependency. Regenerate with:
 *
 *   node scripts/generate-emoji-data.mjs
 */

export type EmojiGroupKey =
  | "smileys"
  | "people"
  | "animals"
  | "food"
  | "activities"
  | "travel"
  | "objects"
  | "symbols"
  | "flags";

export interface EmojiEntry {
  /** The glyph itself, in emoji presentation. */
  glyph: string;
  /** English label, e.g. "grinning face". Used as the button's accessible name in EN. */
  label: string;
  /** Portuguese label. Used as the button's accessible name in PT. */
  labelPt: string;
  /** Lowercased, space-joined EN + PT search terms, already deduplicated and
   *  stripped of diacritics, so search is a single `terms.includes(query)`. */
  terms: string;
  group: EmojiGroupKey;
}

/** Tab order for the picker's category rail. */
export const EMOJI_GROUP_ORDER: EmojiGroupKey[] = [
  "smileys",
  "people",
  "animals",
  "food",
  "activities",
  "travel",
  "objects",
  "symbols",
  "flags",
];

/* Split into blocks of 400 purely to stay under TypeScript's union-complexity
   limit for a single array literal (TS2590). Not exported, no meaning. */
const EMOJI_BLOCK_0: EmojiEntry[] = [
  {
    glyph: "😀",
    label: "grinning face",
    labelPt: "rosto risonho",
    terms:
      "grinning face rosto risonho cheerful cheery grin happy laugh nice smile smiling teeth engracado feliz lol rindo risada riso sorridente",
    group: "smileys",
  },
  {
    glyph: "😃",
    label: "grinning face with big eyes",
    labelPt: "rosto risonho com olhos bem abertos",
    terms:
      "grinning face with big eyes rosto risonho com olhos bem abertos awesome grin happy mouth open smile smiling teeth yay aberto boca feliz arregalados risada sorrindo aberta sorridente sorriso",
    group: "smileys",
  },
  {
    glyph: "😄",
    label: "grinning face with smiling eyes",
    labelPt: "rosto risonho com olhos sorridentes",
    terms:
      "grinning face with smiling eyes rosto risonho com olhos sorridentes eye grin happy laugh lol mouth open smile aberta boca engracado feliz haha risada riso sorridente sorriso",
    group: "smileys",
  },
  {
    glyph: "😁",
    label: "beaming face with smiling eyes",
    labelPt: "rosto contente com olhos sorridentes",
    terms:
      "beaming face with smiling eyes rosto contente com olhos sorridentes eye grin grinning happy nice smile teeth feliz olho sorrindo rindo sorridente sorriso aberto",
    group: "smileys",
  },
  {
    glyph: "😆",
    label: "grinning squinting face",
    labelPt: "rosto risonho com olhos semicerrados",
    terms:
      "grinning squinting face rosto risonho com olhos semicerrados closed eyes haha hahaha happy laugh lol mouth open rofl smile smiling gargalhada gargalhando kkk fechados rir sorriso estilo xd",
    group: "smileys",
  },
  {
    glyph: "😅",
    label: "grinning face with sweat",
    labelPt: "rosto risonho com gota de suor",
    terms:
      "grinning face with sweat rosto risonho com gota de suor cold dejected excited mouth nervous open smile smiling stress stressed estressada estressado nervoso rindo sorriso frio mas suando",
    group: "smileys",
  },
  {
    glyph: "🤣",
    label: "rolling on the floor laughing",
    labelPt: "rolando no chão de rir",
    terms:
      "rolling on the floor laughing rolando no chao de rir crying face funny haha happy hehe hilarious joy laugh lmao lol rofl roflmao tear choro engracada feliz gargalhada kkk lagrimas rindo risada",
    group: "smileys",
  },
  {
    glyph: "😂",
    label: "face with tears of joy",
    labelPt: "rosto chorando de rir",
    terms:
      "face with tears of joy rosto chorando de rir crying feels funny haha happy hehe hilarious laugh lmao lol rofl roflmao tear alegria engracada engracado gargalhada hahaha kkk lagrimas com",
    group: "smileys",
  },
  {
    glyph: "🙂",
    label: "slightly smiling face",
    labelPt: "rosto levemente sorridente",
    terms:
      "slightly smiling face rosto levemente sorridente happy smile feliz sorrindo sorriso leve",
    group: "smileys",
  },
  {
    glyph: "🙃",
    label: "upside-down face",
    labelPt: "rosto de cabeça para baixo",
    terms: "upside-down face rosto de cabeca para baixo hehe smile invertido",
    group: "smileys",
  },
  {
    glyph: "🫠",
    label: "melting face",
    labelPt: "rosto derretendo",
    terms:
      "melting face rosto derretendo disappear dissolve embarrassed haha heat hot liquid lol melt sarcasm sarcastic calor derreter desaparecer dissolver envergonhada quente sarcasmo sarcastica vergonha",
    group: "smileys",
  },
  {
    glyph: "😉",
    label: "winking face",
    labelPt: "rosto com olho piscando",
    terms:
      "winking face rosto com olho piscando flirt heartbreaker sexy slide tease wink winks flerte piscada",
    group: "smileys",
  },
  {
    glyph: "😊",
    label: "smiling face with smiling eyes",
    labelPt: "rosto sorridente com olhos sorridentes",
    terms:
      "smiling face with eyes rosto sorridente com olhos sorridentes blush eye glad satisfied smile alegre encabulada envergonhada feliz fofo ruborizar satisfeita sim sorriso vergonha",
    group: "smileys",
  },
  {
    glyph: "😇",
    label: "smiling face with halo",
    labelPt: "rosto sorridente com auréola",
    terms:
      "smiling face with halo rosto sorridente com aureola angel angelic angels blessed fairy fairytale fantasy happy innocent peaceful smile spirit tale anjinho anjo inocente sorriso",
    group: "smileys",
  },
  {
    glyph: "🥰",
    label: "smiling face with hearts",
    labelPt: "rosto sorridente com 3 corações",
    terms:
      "smiling face with hearts rosto sorridente com 3 coracoes adore crush heart ily love romance smile you amando amei amo apaixonada coracao paixao te",
    group: "smileys",
  },
  {
    glyph: "😍",
    label: "smiling face with heart-eyes",
    labelPt: "rosto sorridente com olhos de coração",
    terms:
      "smiling face with heart-eyes rosto sorridente com olhos de coracao 143 bae eye feels hearts ily kisses love romance romantic smile xoxo amor apaixonado olhar paixao",
    group: "smileys",
  },
  {
    glyph: "🤩",
    label: "star-struck",
    labelPt: "rosto com olhar maravilhado",
    terms:
      "star-struck rosto com olhar maravilhado excited eyes face grinning smile star starry-eyed wow estrela gargalhando olhos super animada animado feliz superanimada superanimado superfeliz",
    group: "smileys",
  },
  {
    glyph: "😘",
    label: "face blowing a kiss",
    labelPt: "rosto mandando um beijo",
    terms:
      "face blowing a kiss rosto mandando um beijo adorbs bae flirt heart ily love lover miss muah romantic smooch xoxo you flerte jogando beijos",
    group: "smileys",
  },
  {
    glyph: "😗",
    label: "kissing face",
    labelPt: "rosto beijando",
    terms:
      "kissing face rosto beijando 143 date dating flirt ily kiss love smooch smooches xoxo you beijo com",
    group: "smileys",
  },
  {
    glyph: "☺️",
    label: "smiling face",
    labelPt: "rosto sorridente",
    terms:
      "smiling face rosto sorridente happy outlined relaxed smile corada corado relaxado sorrindo nao preenchido sorriso",
    group: "smileys",
  },
  {
    glyph: "😚",
    label: "kissing face with closed eyes",
    labelPt: "rosto beijando com olhos fechados",
    terms:
      "kissing face with closed eyes rosto beijando com olhos fechados 143 bae blush date dating eye flirt ily kisses smooches xoxo os beijinho mandando beijo",
    group: "smileys",
  },
  {
    glyph: "😙",
    label: "kissing face with smiling eyes",
    labelPt: "rosto beijando com olhos sorridentes",
    terms:
      "kissing face with smiling eyes rosto beijando com olhos sorridentes 143 closed date dating eye flirt ily kiss kisses love night smile beijar e sorrir beijinho beijos flerte mandando beijo sorrindo um sorriso",
    group: "smileys",
  },
  {
    glyph: "🥲",
    label: "smiling face with tear",
    labelPt: "rosto sorridente com lágrima",
    terms:
      "smiling face with tear rosto sorridente com lagrima glad grateful happy joy pain proud relieved smile smiley touched aliviada chorar contente emocionado felicidade feliz grata gratidao orgulhosa rir sorrir",
    group: "smileys",
  },
  {
    glyph: "😋",
    label: "face savoring food",
    labelPt: "rosto saboreando comida",
    terms:
      "face savoring food rosto saboreando comida delicious eat full hungry savor smile smiling tasty um yum yummy apetitoso gostosa delicioso gostoso nham com sorriso saboroso",
    group: "smileys",
  },
  {
    glyph: "😛",
    label: "face with tongue",
    labelPt: "rosto mostrando a língua",
    terms:
      "face with tongue rosto mostrando a lingua awesome cool nice party stuck-out sweet para fora com",
    group: "smileys",
  },
  {
    glyph: "😜",
    label: "winking face with tongue",
    labelPt: "rosto piscando e com língua para fora",
    terms:
      "winking face with tongue rosto piscando e com lingua para fora crazy epic eye funny joke loopy nutty party stuck-out wacky weirdo wink yolo brincadeira piscadela mostrando a provocacao",
    group: "smileys",
  },
  {
    glyph: "🤪",
    label: "zany face",
    labelPt: "rosto bizarro",
    terms:
      "zany face rosto bizarro crazy eye eyes goofy large small cara de maluco doida doido excentrico grande louca louco olhar olho pequeno",
    group: "smileys",
  },
  {
    glyph: "😝",
    label: "squinting face with tongue",
    labelPt: "rosto com olhos semicerrados e língua para fora",
    terms:
      "squinting face with tongue rosto com olhos semicerrados e lingua para fora closed eye eyes gross horrible omg stuck-out taste whatever yolo eca horrivel os fechados",
    group: "smileys",
  },
  {
    glyph: "🤑",
    label: "money-mouth face",
    labelPt: "rosto com cifrões",
    terms:
      "money-mouth face rosto com cifroes money mouth paid avarenta caro cifrao dinheiro ganancia grana rica riqueza",
    group: "smileys",
  },
  {
    glyph: "🤗",
    label: "smiling face with open hands",
    labelPt: "rosto abraçando",
    terms:
      "smiling face with open hands rosto abracando hug hugging abraco carinho feliz maos sorrindo",
    group: "smileys",
  },
  {
    glyph: "🤭",
    label: "face with hand over mouth",
    labelPt: "rosto com a mão sobre a boca",
    terms:
      "face with hand over mouth rosto com a mao sobre boca giggle giggling oops realization secret shock sudden surprise whoops hehe ops risadinha risonho sorriso envergonhado vergonha",
    group: "smileys",
  },
  {
    glyph: "🫢",
    label: "face with open eyes and hand over mouth",
    labelPt: "rosto com olhos abertos e mão sobre a boca",
    terms:
      "face with open eyes and hand over mouth rosto com olhos abertos e mao sobre a boca amazement awe disbelief embarrass gasp omg quiet scared shock surprise assustada chocada descrenca em choque espanto nossa passada quieta surpresa temor",
    group: "smileys",
  },
  {
    glyph: "🫣",
    label: "face with peeking eye",
    labelPt: "rosto com olho espiando",
    terms:
      "face with peeking eye rosto com olho espiando captivated embarrass hide hiding peek peep scared shy stare cativada cativado envergonhada envergonhado esconder espiadinha espiar olhar fixamente smiley timida timido vergonha",
    group: "smileys",
  },
  {
    glyph: "🤫",
    label: "shushing face",
    labelPt: "rosto fazendo sinal de silêncio",
    terms:
      "shushing face rosto fazendo sinal de silencio quiet shh shush faca fica quieta quieto",
    group: "smileys",
  },
  {
    glyph: "🤔",
    label: "thinking face",
    labelPt: "rosto pensativo",
    terms:
      "thinking face rosto pensativo chin consider hmm ponder pondering wondering curiosa curioso duvida ideia ideias mao no queixo pensando pensativa",
    group: "smileys",
  },
  {
    glyph: "🫡",
    label: "saluting face",
    labelPt: "rosto saudando",
    terms:
      "saluting face rosto saudando good luck maam ok respect salute sir troops yes boa sorte exercito respeito saudacao senhor sim tropa",
    group: "smileys",
  },
  {
    glyph: "🤐",
    label: "zipper-mouth face",
    labelPt: "rosto com boca de zíper",
    terms:
      "zipper-mouth face rosto com boca de ziper keep mouth quiet secret shut zip zipper fechada calada calado quieta quieto segredo",
    group: "smileys",
  },
  {
    glyph: "🤨",
    label: "face with raised eyebrow",
    labelPt: "rosto com sobrancelha levantada",
    terms:
      "face with raised eyebrow rosto com sobrancelha levantada disapproval disbelief distrust emoji hmm mild skeptic skeptical skepticism surprise what ceticismo confusa confuso cetica cetico desconfiada desconfiado desconfianca",
    group: "smileys",
  },
  {
    glyph: "😐️",
    label: "neutral face",
    labelPt: "rosto neutro",
    terms:
      "neutral face rosto neutro awkward blank deadpan expressionless fine jealous meh oh shade straight unamused unhappy unimpressed whatever putz sem emocao comentarios reacao",
    group: "smileys",
  },
  {
    glyph: "😑",
    label: "expressionless face",
    labelPt: "rosto inexpressivo",
    terms:
      "expressionless face rosto inexpressivo awkward dead fine inexpressive jealous meh not oh omg straight uh unhappy unimpressed whatever aff inespressiva inespressivo nada a dizer sem comentarios expressao tanto faz",
    group: "smileys",
  },
  {
    glyph: "😶",
    label: "face without mouth",
    labelPt: "rosto sem boca",
    terms:
      "face without mouth rosto sem boca awkward blank expressionless mouthless mute quiet secret silence silent speechless calada calado quieto comentarios palavras",
    group: "smileys",
  },
  {
    glyph: "🫥",
    label: "dotted line face",
    labelPt: "rosto com linha pontilhada",
    terms:
      "dotted line face rosto com linha pontilhada depressed disappear hidden hide introvert invisible meh whatever wtv deprimida desaparecer esconder escondido indiferenca introvertido invisivel tanto faz",
    group: "smileys",
  },
  {
    glyph: "😶‍🌫️",
    label: "face in clouds",
    labelPt: "rosto nas nuvens",
    terms:
      "face in clouds rosto nas nuvens absentminded fog head cabeca distraido no nevoeiro",
    group: "smileys",
  },
  {
    glyph: "😏",
    label: "smirking face",
    labelPt: "rosto com sorriso maroto",
    terms:
      "smirking face rosto com sorriso maroto boss dapper flirt homie kidding leer shade slick sly smirk smug snicker suave suspicious swag flerte maldoso malicioso suspeito",
    group: "smileys",
  },
  {
    glyph: "😒",
    label: "unamused face",
    labelPt: "rosto aborrecido",
    terms:
      "unamused face rosto aborrecido bored fine jealous jel jelly pissed smh ugh uhh unhappy weird whatever aff blase nada engracado nao achou graca esta feliz de que quem",
    group: "smileys",
  },
  {
    glyph: "🙄",
    label: "face with rolling eyes",
    labelPt: "rosto com olhos revirados",
    terms:
      "face with rolling eyes rosto com olhos revirados eyeroll shade ugh whatever olhando para cima revirando os rolando tanto faz virando",
    group: "smileys",
  },
  {
    glyph: "😬",
    label: "grimacing face",
    labelPt: "rosto expressando desagrado",
    terms:
      "grimacing face rosto expressando desagrado awk awkward dentist grimace grinning smile smiling careta fazendo sem graca",
    group: "smileys",
  },
  {
    glyph: "😮‍💨",
    label: "face exhaling",
    labelPt: "rosto exalando",
    terms:
      "face exhaling rosto exalando blow blowing exhale exhausted gasp groan relief sigh smiley smoke whisper whistle alivio assobio assopro cansada cansaco choque exalar exausta fumaca suspiro triste",
    group: "smileys",
  },
  {
    glyph: "🤥",
    label: "lying face",
    labelPt: "rosto de mentiroso",
    terms:
      "lying face rosto de mentiroso liar lie pinocchio mentindo mentira nariz crescendo pinoquio",
    group: "smileys",
  },
  {
    glyph: "🫨",
    label: "shaking face",
    labelPt: "rosto tremendo",
    terms:
      "shaking face rosto tremendo crazy daze earthquake omg panic shock surprise vibrate whoa wow choque louco loucura meu deus panico surpresa susto terremoto vibrar vibracao",
    group: "smileys",
  },
  {
    glyph: "🙂‍↔️",
    label: "head shaking horizontally",
    labelPt: "cabeça virando de um lado para o outro",
    terms:
      "head shaking horizontally cabeca virando de um lado para o outro no shake balancar balancando na horizontal negar nao",
    group: "smileys",
  },
  {
    glyph: "🙂‍↕️",
    label: "head shaking vertically",
    labelPt: "cabeça balançando na vertical",
    terms:
      "head shaking vertically cabeca balancando na vertical nod yes confirmacao sim",
    group: "smileys",
  },
  {
    glyph: "😌",
    label: "relieved face",
    labelPt: "rosto aliviado",
    terms: "relieved face rosto aliviado calm peace relief zen alivio em paz",
    group: "smileys",
  },
  {
    glyph: "😔",
    label: "pensive face",
    labelPt: "rosto deprimido",
    terms:
      "pensive face rosto deprimido awful bored dejected died disappointed losing lost sad sucks abatido chateado desanimado pensativo pra baixo",
    group: "smileys",
  },
  {
    glyph: "😪",
    label: "sleepy face",
    labelPt: "rosto sonolento",
    terms:
      "sleepy face rosto sonolento crying good night sad sleep sleeping tired cara de sono com",
    group: "smileys",
  },
  {
    glyph: "🤤",
    label: "drooling face",
    labelPt: "rosto babando",
    terms: "drooling face rosto babando babar salivando",
    group: "smileys",
  },
  {
    glyph: "😴",
    label: "sleeping face",
    labelPt: "rosto dormindo",
    terms:
      "sleeping face rosto dormindo bed bedtime good goodnight nap night sleep tired whatever yawn zzz boa noite cama cansada cansado cochilo dormir soneca sono",
    group: "smileys",
  },
  {
    glyph: "🫩",
    label: "face with bags under eyes",
    labelPt: "rosto com olheiras",
    terms:
      "face with bags under eyes rosto com olheiras bored exhausted fatigued late sleepy tired weary cansada cansado cansaco dorminhoco exausta exausto bolsas embaixo dos olhos",
    group: "smileys",
  },
  {
    glyph: "😷",
    label: "face with medical mask",
    labelPt: "rosto com máscara médica",
    terms:
      "face with medical mask rosto com mascara medica cold dentist dermatologist doctor dr germs medicine sick doente gripado resfriado",
    group: "smileys",
  },
  {
    glyph: "🤒",
    label: "face with thermometer",
    labelPt: "rosto com termômetro",
    terms:
      "face with thermometer rosto com termometro ill sick de cama doente febre febril",
    group: "smileys",
  },
  {
    glyph: "🤕",
    label: "face with head-bandage",
    labelPt: "rosto com atadura na cabeça",
    terms:
      "face with head-bandage rosto com atadura na cabeca bandage hurt injury ouch acidentado doente ferimento machucado curativos",
    group: "smileys",
  },
  {
    glyph: "🤢",
    label: "nauseated face",
    labelPt: "rosto nauseado",
    terms:
      "nauseated face rosto nauseado gross nasty sick vomit doente enjoado enjoo nausea vomito",
    group: "smileys",
  },
  {
    glyph: "🤮",
    label: "face vomiting",
    labelPt: "rosto vomitando",
    terms:
      "face vomiting rosto vomitando barf ew gross puke sick spew throw up vomit doente nojenta nojento nojo vomito",
    group: "smileys",
  },
  {
    glyph: "🤧",
    label: "sneezing face",
    labelPt: "rosto espirrando",
    terms:
      "sneezing face rosto espirrando fever flu gesundheit sick sneeze de cama doente espirro gripado resfriado",
    group: "smileys",
  },
  {
    glyph: "🥵",
    label: "hot face",
    labelPt: "rosto fervendo de calor",
    terms:
      "hot face rosto fervendo de calor dying feverish heat panting red-faced stroke sweating tongue febre febril insolacao lingua fora ofegante quente vermelho suando suor",
    group: "smileys",
  },
  {
    glyph: "🥶",
    label: "cold face",
    labelPt: "rosto gelado",
    terms:
      "cold face rosto gelado blue blue-faced freezing frostbite icicles subzero teeth abaixo de zero azul congelando congelei frio glacial gelido",
    group: "smileys",
  },
  {
    glyph: "🥴",
    label: "woozy face",
    labelPt: "rosto embriagado",
    terms:
      "woozy face rosto embriagado dizzy drunk eyes intoxicated mouth tipsy uneven wavy alcoolizado boca ondulada bebada bebado embriagada intoxicado olhos tortos tonta tonto",
    group: "smileys",
  },
  {
    glyph: "😵",
    label: "face with crossed-out eyes",
    labelPt: "rosto atordoado",
    terms:
      "face with crossed-out eyes rosto atordoado dead dizzy feels knocked out sick tired acabado doente morto tontura",
    group: "smileys",
  },
  {
    glyph: "😵‍💫",
    label: "face with spiral eyes",
    labelPt: "rosto com olhos em espiral",
    terms:
      "face with spiral eyes rosto com olhos em espiral confused dizzy hypnotized omg smiley trouble whoa woah woozy caramba confuso desnorteado eita espirais hipnotizado problema putz tonto tontura uau",
    group: "smileys",
  },
  {
    glyph: "🤯",
    label: "exploding head",
    labelPt: "cabeça explodindo",
    terms:
      "exploding head cabeca explodindo blown explode mind mindblown no shocked way chocada chocado chocante choque incrivel perplexo surpreendente surpresa surpreso",
    group: "smileys",
  },
  {
    glyph: "🤠",
    label: "cowboy hat face",
    labelPt: "rosto com chapéu de caubói",
    terms:
      "cowboy hat face rosto com chapeu de cauboi cowgirl cara sertanejo vaqueiro",
    group: "smileys",
  },
  {
    glyph: "🥳",
    label: "partying face",
    labelPt: "rosto festivo",
    terms:
      "partying face rosto festivo bday birthday celebrate celebration excited happy hat hooray horn party animacao aniversario apito chapeu comemorar comemoracao feliz festa lingua de sogra parabens viva",
    group: "smileys",
  },
  {
    glyph: "🥸",
    label: "disguised face",
    labelPt: "rosto disfarçado",
    terms:
      "disguised face rosto disfarcado disguise eyebrow glasses incognito moustache mustache nose person spy tache tash bigode disfarce espiao nariz pessoa sobrancelha oculos",
    group: "smileys",
  },
  {
    glyph: "😎",
    label: "smiling face with sunglasses",
    labelPt: "rosto sorridente com óculos escuros",
    terms:
      "smiling face with sunglasses rosto sorridente com oculos escuros awesome beach bright bro chilling cool rad relaxed shades slay smile style swag win muito sol na boa sorrindo de sorriso to legal",
    group: "smileys",
  },
  {
    glyph: "🤓",
    label: "nerd face",
    labelPt: "rosto de nerd",
    terms:
      "nerd face rosto de brainy clever expert geek gifted glasses intelligent smart cdf esperto estudioso inteligente inteligencia sabe tudo sabe-tudo oculos grau",
    group: "smileys",
  },
  {
    glyph: "🧐",
    label: "face with monocle",
    labelPt: "rosto com monóculo",
    terms:
      "face with monocle rosto com monoculo classy fancy rich stuffy wealthy conservador",
    group: "smileys",
  },
  {
    glyph: "😕",
    label: "confused face",
    labelPt: "rosto confuso",
    terms:
      "confused face rosto confuso befuddled confusing dunno frown hm meh not sad sorry sure indeciso nao entendi tenho certeza",
    group: "smileys",
  },
  {
    glyph: "🫤",
    label: "face with diagonal mouth",
    labelPt: "rosto com boca diagonal",
    terms:
      "face with diagonal mouth rosto com boca confused confusion disappointed doubt doubtful frustrated frustration meh skeptical unsure whatever wtv confusao cetico decepcao desapontado duvida frustracao indiferenca inseguro tanto faz",
    group: "smileys",
  },
  {
    glyph: "😟",
    label: "worried face",
    labelPt: "rosto preocupado",
    terms:
      "worried face rosto preocupado anxious butterflies nerves nervous sad stress stressed surprised worry decepcionado",
    group: "smileys",
  },
  {
    glyph: "🙁",
    label: "slightly frowning face",
    labelPt: "rosto meio triste",
    terms:
      "slightly frowning face rosto meio triste frown sad tristeza tristinho",
    group: "smileys",
  },
  {
    glyph: "☹️",
    label: "frowning face",
    labelPt: "rosto descontente",
    terms:
      "frowning face rosto descontente frown sad decepcionado decepcao insatisfeito de desaprovacao triste",
    group: "smileys",
  },
  {
    glyph: "😮",
    label: "face with open mouth",
    labelPt: "rosto com boca aberta",
    terms:
      "face with open mouth rosto com boca aberta believe forgot omg shocked surprised sympathy unbelievable unreal whoa wow you boquiaberto empatia pasmo",
    group: "smileys",
  },
  {
    glyph: "😯",
    label: "hushed face",
    labelPt: "rosto surpreso",
    terms:
      "hushed face rosto surpreso epic omg stunned surprised whoa woah espantado uau",
    group: "smileys",
  },
  {
    glyph: "😲",
    label: "astonished face",
    labelPt: "rosto espantado",
    terms:
      "astonished face rosto espantado cost no omg shocked totally way chocado estupefato totalmente",
    group: "smileys",
  },
  {
    glyph: "😳",
    label: "flushed face",
    labelPt: "rosto ruborizado",
    terms:
      "flushed face rosto ruborizado amazed awkward crazy dazed dead disbelief embarrassed geez heat hot impressed jeez what wow atordoado deslumbrado horrorizado impressionado vergonha",
    group: "smileys",
  },
  {
    glyph: "🫪",
    label: "distorted face",
    labelPt: "rosto distorcido",
    terms:
      "distorted face rosto distorcido anxiety bloated panic shocked surprised vulnerable ansiedade chocado inchado panico surpreso vulneravel",
    group: "smileys",
  },
  {
    glyph: "🥺",
    label: "pleading face",
    labelPt: "rosto implorando",
    terms:
      "pleading face rosto implorando begging big eyes mercy not please pretty puppy sad why olhar de cachorrinho olhos grandes perdao por favor que nao pq triste",
    group: "smileys",
  },
  {
    glyph: "🥹",
    label: "face holding back tears",
    labelPt: "rosto segurando as lágrimas",
    terms:
      "face holding back tears rosto segurando as lagrimas admiration aww cry embarrassed feelings grateful gratitude joy please proud resist sad admiracao alegria chorar com raiva emocao gratidao iti malia orgulho por favor resistir tristeza",
    group: "smileys",
  },
  {
    glyph: "😦",
    label: "frowning face with open mouth",
    labelPt: "rosto franzido com boca aberta",
    terms:
      "frowning face with open mouth rosto franzido com boca aberta caught frown guard scared scary surprise what wow assustado decepcionado inesperado uau",
    group: "smileys",
  },
  {
    glyph: "😧",
    label: "anguished face",
    labelPt: "rosto angustiado",
    terms:
      "anguished face rosto angustiado forgot scared scary stressed surprise unhappy what wow sofrendo",
    group: "smileys",
  },
  {
    glyph: "😨",
    label: "fearful face",
    labelPt: "rosto amedrontado",
    terms:
      "fearful face rosto amedrontado afraid anxious blame fear scared worried ansiedade assustado com medo preocupado",
    group: "smileys",
  },
  {
    glyph: "😰",
    label: "anxious face with sweat",
    labelPt: "rosto ansioso com gota de suor",
    terms:
      "anxious face with sweat rosto ansioso com gota de suor blue cold eek mouth nervous open rushed scared yikes boca aberta nervoso azul frio suando",
    group: "smileys",
  },
  {
    glyph: "😥",
    label: "sad but relieved face",
    labelPt: "rosto triste, mas aliviado",
    terms:
      "sad but relieved face rosto triste mas aliviado anxious call close complicated disappointed not sweat time whew decepcionado nao ufa",
    group: "smileys",
  },
  {
    glyph: "😢",
    label: "crying face",
    labelPt: "rosto chorando",
    terms:
      "crying face rosto chorando awful cry feels miss sad tear triste unhappy choro lagrimas",
    group: "smileys",
  },
  {
    glyph: "😭",
    label: "loudly crying face",
    labelPt: "rosto chorando aos berros",
    terms:
      "loudly crying face rosto chorando aos berros bawling cry sad sob tear tears unhappy alto chorar infeliz lagrimas triste",
    group: "smileys",
  },
  {
    glyph: "😱",
    label: "face screaming in fear",
    labelPt: "rosto gritando de medo",
    terms:
      "face screaming in fear rosto gritando de medo epic fearful munch scared scream screamer shocked surprised woah assustada assustado grito susto temeroso",
    group: "smileys",
  },
  {
    glyph: "😖",
    label: "confounded face",
    labelPt: "rosto perplexo",
    terms:
      "confounded face rosto perplexo annoyed confused cringe distraught feels frustrated mad sad bravo frustrado indignado",
    group: "smileys",
  },
  {
    glyph: "😣",
    label: "persevering face",
    labelPt: "rosto perseverante",
    terms:
      "persevering face rosto perseverante concentrate concentration focus headache persevere concentrado concentracao dor de cabeca foco perseveranca",
    group: "smileys",
  },
  {
    glyph: "😞",
    label: "disappointed face",
    labelPt: "rosto desapontado",
    terms:
      "disappointed face rosto desapontado awful blame dejected fail losing sad unhappy decepcao desapontamento decepcionado triste",
    group: "smileys",
  },
  {
    glyph: "😓",
    label: "downcast face with sweat",
    labelPt: "rosto cabisbaixo com gota de suor",
    terms:
      "downcast face with sweat rosto cabisbaixo com gota de suor close cold feels headache nervous sad scared yikes frio suando",
    group: "smileys",
  },
  {
    glyph: "😩",
    label: "weary face",
    labelPt: "rosto desolado",
    terms:
      "weary face rosto desolado crying fail feels hungry mad nooo sad sleepy tired unhappy aborrecido cansado cansei decepcionado exausto infeliz perdi",
    group: "smileys",
  },
  {
    glyph: "😫",
    label: "tired face",
    labelPt: "rosto cansado",
    terms:
      "tired face rosto cansado cost feels nap sad sneeze desesperado exausto",
    group: "smileys",
  },
  {
    glyph: "🥱",
    label: "yawning face",
    labelPt: "rosto bocejando",
    terms:
      "yawning face rosto bocejando bedtime bored goodnight nap night sleep sleepy tired whatever yawn zzz bocejo cansada cansado com sono entediada entediado",
    group: "smileys",
  },
  {
    glyph: "😤",
    label: "face with steam from nose",
    labelPt: "rosto soltando vapor pelo nariz",
    terms:
      "face with steam from nose rosto soltando vapor pelo nariz anger angry feels fume fuming furious fury mad triumph unhappy won brava bravo furiosa furioso irritada irritado fumaca triunfo vitoria",
    group: "smileys",
  },
  {
    glyph: "😡",
    label: "enraged face",
    labelPt: "rosto furioso",
    terms:
      "enraged face rosto furioso anger angry feels mad maddening pouting rage red shade unhappy upset bravo irado vermelho zangado",
    group: "smileys",
  },
  {
    glyph: "😠",
    label: "angry face",
    labelPt: "rosto zangado",
    terms:
      "angry face rosto zangado anger blame feels frustrated mad maddening rage shade unhappy upset irado",
    group: "smileys",
  },
  {
    glyph: "🤬",
    label: "face with symbols on mouth",
    labelPt: "rosto com símbolos na boca",
    terms:
      "face with symbols on mouth rosto com simbolos na boca censor cursing cussing mad pissed swearing censurado fala mal rude xingando",
    group: "smileys",
  },
  {
    glyph: "😈",
    label: "smiling face with horns",
    labelPt: "rosto sorridente com chifres",
    terms:
      "smiling face with horns rosto sorridente com chifres demon devil evil fairy fairytale fantasy purple shade smile tale cara diabinho diabo malicia roxa sorriso",
    group: "smileys",
  },
  {
    glyph: "👿",
    label: "angry face with horns",
    labelPt: "rosto zangado com chifres",
    terms:
      "angry face with horns rosto zangado com chifres demon devil evil fairy fairytale fantasy imp mischievous purple shade tale bravo demonio diabinho diabo",
    group: "smileys",
  },
  {
    glyph: "💀",
    label: "skull",
    labelPt: "caveira",
    terms:
      "skull caveira body dead death face fairy fairytale im lmao monster tale yolo conto corpo fadas morte rosto",
    group: "smileys",
  },
  {
    glyph: "☠️",
    label: "skull and crossbones",
    labelPt: "caveira e ossos cruzados",
    terms:
      "skull and crossbones caveira e ossos cruzados bone dead death face monster morte pirata",
    group: "smileys",
  },
  {
    glyph: "💩",
    label: "pile of poo",
    labelPt: "cocô",
    terms:
      "pile of poo coco bs comic doo dung face fml monster poop smelly smh stink stinks stinky turd estrume excremento fezes pilha",
    group: "smileys",
  },
  {
    glyph: "🤡",
    label: "clown face",
    labelPt: "rosto de palhaço",
    terms: "clown face rosto de palhaco cara circo engracado piada",
    group: "smileys",
  },
  {
    glyph: "👹",
    label: "ogre",
    labelPt: "ogro",
    terms:
      "ogre ogro creature devil face fairy fairytale fantasy mask monster scary tale assustador conto de fadas demoniaco japones malvado monstro mascara oni rosto",
    group: "smileys",
  },
  {
    glyph: "👺",
    label: "goblin",
    labelPt: "duende japonês",
    terms:
      "goblin duende japones angry creature face fairy fairytale fantasy mask mean monster tale bravo conto fadas monstro mascara raiva rosto tengu zangado",
    group: "smileys",
  },
  {
    glyph: "👻",
    label: "ghost",
    labelPt: "fantasma",
    terms:
      "ghost fantasma boo creature excited face fairy fairytale fantasy halloween haunting monster scary silly tale assombrado assombracao buu conto fadas rosto",
    group: "smileys",
  },
  {
    glyph: "👽️",
    label: "alien",
    labelPt: "alienígena",
    terms:
      "alien alienigena creature extraterrestrial face fairy fairytale fantasy monster space tale ufo extraterrestre ovni rosto",
    group: "smileys",
  },
  {
    glyph: "👾",
    label: "alien monster",
    labelPt: "monstro alienígena",
    terms:
      "alien monster monstro alienigena creature extraterrestrial face fairy fairytale fantasy game gamer games pixelated space tale ufo e t extraterrestre invasores ovni pixelado",
    group: "smileys",
  },
  {
    glyph: "🤖",
    label: "robot",
    labelPt: "rosto de robô",
    terms: "robot rosto de robo face monster monstro robotizado",
    group: "smileys",
  },
  {
    glyph: "😺",
    label: "grinning cat",
    labelPt: "rosto de gato sorrindo",
    terms:
      "grinning cat rosto de gato sorrindo animal face mouth open smile smiling aberta boca feliz sorriso",
    group: "smileys",
  },
  {
    glyph: "😸",
    label: "grinning cat with smiling eyes",
    labelPt: "rosto de gato sorrindo com olhos sorridentes",
    terms:
      "grinning cat with smiling eyes rosto de gato sorrindo com olhos sorridentes animal eye face grin smile rindo riso sorriso",
    group: "smileys",
  },
  {
    glyph: "😹",
    label: "cat with tears of joy",
    labelPt: "rosto de gato com lágrimas de alegria",
    terms:
      "cat with tears of joy rosto de gato com lagrimas alegria animal face laugh laughing lol tear chorando choro engracado felicidade feliz rir risos",
    group: "smileys",
  },
  {
    glyph: "😻",
    label: "smiling cat with heart-eyes",
    labelPt: "rosto de gato sorridente com olhos de coração",
    terms:
      "smiling cat with heart-eyes rosto de gato sorridente com olhos coracao animal eye face heart love smile adorei amor apaixonado paixao sorriso",
    group: "smileys",
  },
  {
    glyph: "😼",
    label: "cat with wry smile",
    labelPt: "rosto de gato com sorriso irônico",
    terms:
      "cat with wry smile rosto de gato com sorriso ironico animal face ironic",
    group: "smileys",
  },
  {
    glyph: "😽",
    label: "kissing cat",
    labelPt: "rosto de gato mandando um beijo",
    terms:
      "kissing cat rosto de gato mandando um beijo animal closed eye eyes face kiss beijando fechado olho",
    group: "smileys",
  },
  {
    glyph: "🙀",
    label: "weary cat",
    labelPt: "rosto de gato desolado",
    terms:
      "weary cat rosto de gato desolado animal face oh surprised choque meu deus surpresa surpreso",
    group: "smileys",
  },
  {
    glyph: "😿",
    label: "crying cat",
    labelPt: "rosto de gato chorando",
    terms:
      "crying cat rosto de gato chorando animal cry face sad tear choro lagrima triste",
    group: "smileys",
  },
  {
    glyph: "😾",
    label: "pouting cat",
    labelPt: "rosto de gato mal-humorado",
    terms: "pouting cat rosto de gato mal-humorado animal face bico bravo",
    group: "smileys",
  },
  {
    glyph: "🙈",
    label: "see-no-evil monkey",
    labelPt: "macaco que não vê nada",
    terms:
      "see-no-evil monkey macaco que nao ve nada embarrassed evil face forbidden forgot gesture hide no omg prohibited scared secret smh watch envergonhado veja o mal vi olhos tapados vergonha",
    group: "smileys",
  },
  {
    glyph: "🙉",
    label: "hear-no-evil monkey",
    labelPt: "macaco que não ouve nada",
    terms:
      "hear-no-evil monkey macaco que nao ouve nada animal ears evil face forbidden gesture hear listen no not prohibited secret shh tmi ouca o mal ouco quero ouvir ouvidos tapados",
    group: "smileys",
  },
  {
    glyph: "🙊",
    label: "speak-no-evil monkey",
    labelPt: "macaco que não fala nada",
    terms:
      "speak-no-evil monkey macaco que nao fala nada animal evil face forbidden gesture no not oops prohibited quiet secret speak stealth boca tapada fale posso contar falar segredo silencio ups",
    group: "smileys",
  },
  {
    glyph: "💌",
    label: "love letter",
    labelPt: "carta de amor",
    terms:
      "love letter carta de amor heart mail romance valentine coracao correspondencia com",
    group: "smileys",
  },
  {
    glyph: "💘",
    label: "heart with arrow",
    labelPt: "coração com flecha",
    terms:
      "heart with arrow coracao com flecha 143 adorbs cupid date emotion ily love romance valentine amor cupido emocao flechado paixao s2",
    group: "smileys",
  },
  {
    glyph: "💝",
    label: "heart with ribbon",
    labelPt: "coração com fita",
    terms:
      "heart with ribbon coracao com fita 143 anniversary emotion ily kisses valentine xoxo amor aniversario dia dos namorados presente s2",
    group: "smileys",
  },
  {
    glyph: "💖",
    label: "sparkling heart",
    labelPt: "coração brilhante",
    terms:
      "sparkling heart coracao brilhante 143 emotion excited good ily kisses morning night sparkle xoxo amor emocionante emocao s2",
    group: "smileys",
  },
  {
    glyph: "💗",
    label: "growing heart",
    labelPt: "coração crescendo",
    terms:
      "growing heart coracao crescendo 143 emotion excited heartpulse ily kisses muah nervous pulse xoxo amor animado batendo emocao nervosismo s2",
    group: "smileys",
  },
  {
    glyph: "💓",
    label: "beating heart",
    labelPt: "coração pulsante",
    terms:
      "beating heart coracao pulsante 143 cardio emotion heartbeat ily love pulsating pulse amor batendo emocao s2",
    group: "smileys",
  },
  {
    glyph: "💞",
    label: "revolving hearts",
    labelPt: "corações girando",
    terms:
      "revolving hearts coracoes girando 143 adorbs anniversary emotion heart adoravel amor bonitinho coracao emocao s2",
    group: "smileys",
  },
  {
    glyph: "💕",
    label: "two hearts",
    labelPt: "dois corações",
    terms:
      "two hearts dois coracoes 143 anniversary date dating emotion heart ily kisses love loving xoxo amor aniversario casal coracao emocao s2",
    group: "smileys",
  },
  {
    glyph: "💟",
    label: "heart decoration",
    labelPt: "coração decorativo",
    terms:
      "heart decoration coracao decorativo 143 emotion hearth purple white amor decoracao roxo s2 selo",
    group: "smileys",
  },
  {
    glyph: "❣️",
    label: "heart exclamation",
    labelPt: "exclamação de coração",
    terms:
      "heart exclamation exclamacao de coracao heavy mark punctuation amor pontuacao s2 sinal",
    group: "smileys",
  },
  {
    glyph: "💔",
    label: "broken heart",
    labelPt: "coração partido",
    terms:
      "broken heart coracao partido break crushed emotion heartbroken lonely sad amorosa decepcao desilusao emocao quebrado rompimento s2 sofrendo sofrimento triste",
    group: "smileys",
  },
  {
    glyph: "❤️‍🔥",
    label: "heart on fire",
    labelPt: "coração em chamas",
    terms:
      "heart on fire coracao em chamas burn love lust sacred amor sagrado fogo luxuria",
    group: "smileys",
  },
  {
    glyph: "❤️‍🩹",
    label: "mending heart",
    labelPt: "coração remendado",
    terms:
      "mending heart coracao remendado healthier improving recovering recuperating well bem bom curando mais saudavel melhorando recuperacao",
    group: "smileys",
  },
  {
    glyph: "❤️",
    label: "red heart",
    labelPt: "coração vermelho",
    terms: "red heart coracao vermelho emotion love amor s2",
    group: "smileys",
  },
  {
    glyph: "🩷",
    label: "pink heart",
    labelPt: "coração rosa",
    terms:
      "pink heart coracao rosa 143 adorable cute emotion ily like love special sweet adorei adoravel amo voce amor curtir emocao especial fofo gostar gostei te",
    group: "smileys",
  },
  {
    glyph: "🧡",
    label: "orange heart",
    labelPt: "coração laranja",
    terms: "orange heart coracao laranja 143 emocao s2",
    group: "smileys",
  },
  {
    glyph: "💛",
    label: "yellow heart",
    labelPt: "coração amarelo",
    terms:
      "yellow heart coracao amarelo 143 cardiac emotion ily love amor emocao s2",
    group: "smileys",
  },
  {
    glyph: "💚",
    label: "green heart",
    labelPt: "coração verde",
    terms: "green heart coracao verde 143 emotion ily love romantic emocao s2",
    group: "smileys",
  },
  {
    glyph: "💙",
    label: "blue heart",
    labelPt: "coração azul",
    terms: "blue heart coracao azul 143 emotion ily love romance emocao s2",
    group: "smileys",
  },
  {
    glyph: "🩵",
    label: "light blue heart",
    labelPt: "coração azul-claro",
    terms:
      "light blue heart coracao azul-claro 143 cute cyan emotion ily like love sky special teal adorar adorei amo voce amor emocao especial fofo gostar gostei te",
    group: "smileys",
  },
  {
    glyph: "💜",
    label: "purple heart",
    labelPt: "coração roxo",
    terms:
      "purple heart coracao roxo 143 bestest emotion ily love lilas emocao s2",
    group: "smileys",
  },
  {
    glyph: "🤎",
    label: "brown heart",
    labelPt: "coração marrom",
    terms: "brown heart coracao marrom 143 s2",
    group: "smileys",
  },
  {
    glyph: "🖤",
    label: "black heart",
    labelPt: "coração preto",
    terms: "black heart coracao preto evil wicked negro s2",
    group: "smileys",
  },
  {
    glyph: "🩶",
    label: "grey heart",
    labelPt: "coração cinza",
    terms:
      "grey heart coracao cinza 143 emotion gray ily love silver slate special adorar adorei amo voce amor emocao especial gostar gostei te",
    group: "smileys",
  },
  {
    glyph: "🤍",
    label: "white heart",
    labelPt: "coração branco",
    terms: "white heart coracao branco 143 s2",
    group: "smileys",
  },
  {
    glyph: "💋",
    label: "kiss mark",
    labelPt: "marca de beijo",
    terms:
      "kiss mark marca de beijo dating emotion heart kissing lips romance sexy labios",
    group: "smileys",
  },
  {
    glyph: "💯",
    label: "hundred points",
    labelPt: "cem pontos",
    terms:
      "hundred points cem pontos 100 a+ agree clearly definitely faithful fleek full keep perfect point score true truth yup certamente certeza conte comigo sem duvida top total",
    group: "smileys",
  },
  {
    glyph: "💢",
    label: "anger symbol",
    labelPt: "símbolo de raiva",
    terms:
      "anger symbol simbolo de raiva angry comic mad upset com emocao engracado",
    group: "smileys",
  },
  {
    glyph: "🫯",
    label: "fight cloud",
    labelPt: "nuvem de briga",
    terms:
      "fight cloud nuvem de briga argument brawl debate disagreement ruckus wrestle desacordo discussao luta tumulto",
    group: "smileys",
  },
  {
    glyph: "💥",
    label: "collision",
    labelPt: "colisão",
    terms:
      "collision colisao bomb boom collide comic explode emocao engracado explosao simbolo de",
    group: "smileys",
  },
  {
    glyph: "💫",
    label: "dizzy",
    labelPt: "zonzo",
    terms:
      "dizzy zonzo comic shining shooting star stars brilhante emocao engracado estrelas olhando para as",
    group: "smileys",
  },
  {
    glyph: "💦",
    label: "sweat droplets",
    labelPt: "pingos de suor",
    terms:
      "sweat droplets pingos de suor comic drip droplet drops splashing squirt water wet work workout borrifo com emocao engracado splash",
    group: "smileys",
  },
  {
    glyph: "💨",
    label: "dashing away",
    labelPt: "rapidez",
    terms:
      "dashing away rapidez cloud comic dash fart fast go gone gotta running smoke correr corrida emocao engracado fugir",
    group: "smileys",
  },
  {
    glyph: "🕳️",
    label: "hole",
    labelPt: "buraco",
    terms: "hole buraco no chao",
    group: "smileys",
  },
  {
    glyph: "💬",
    label: "speech balloon",
    labelPt: "balão de diálogo",
    terms:
      "speech balloon balao de dialogo bubble comic dialog message sms talk text typing conversa engracado",
    group: "smileys",
  },
  {
    glyph: "👁️‍🗨️",
    label: "eye in speech bubble",
    labelPt: "olho no balão de diálogo",
    terms:
      "eye in speech bubble olho no balao de dialogo balloon witness testemunha",
    group: "smileys",
  },
  {
    glyph: "🗨️",
    label: "left speech bubble",
    labelPt: "balão de diálogo à esquerda",
    terms:
      "left speech bubble balao de dialogo a esquerda balloon dialog azul conversa",
    group: "smileys",
  },
  {
    glyph: "🗯️",
    label: "right anger bubble",
    labelPt: "balão de raiva à direita",
    terms:
      "right anger bubble balao de raiva a direita angry balloon mad briga conversa discurso discussao dialogo energico furioso irado",
    group: "smileys",
  },
  {
    glyph: "💭",
    label: "thought balloon",
    labelPt: "balão de pensamento",
    terms:
      "thought balloon balao de pensamento bubble cartoon cloud comic daydream decisions dream idea invent invention realize think thoughts wonder engracado ideia inventando invencao pensando",
    group: "smileys",
  },
  {
    glyph: "💤",
    label: "ZZZ",
    labelPt: "zzz",
    terms:
      "zzz comic good goodnight night sleep sleeping sleepy tired boa noite cansada cansado com sono dormindo dormir emocao engracado roncando",
    group: "smileys",
  },
  {
    glyph: "👋",
    label: "waving hand",
    labelPt: "mão acenando",
    terms:
      "waving hand mao acenando bye cya g2g greetings gtg hello hey hi later outtie ttfn ttyl wave yo you aceno ate mais esta ai flw oi ola tai tchau",
    group: "people",
  },
  {
    glyph: "🤚",
    label: "raised back of hand",
    labelPt: "dorso da mão levantado",
    terms:
      "raised back of hand dorso da mao levantado backhand levantada para tudo pare",
    group: "people",
  },
  {
    glyph: "🖐️",
    label: "hand with fingers splayed",
    labelPt: "mão aberta com os dedos separados",
    terms:
      "hand with fingers splayed mao aberta com os dedos separados finger raised stop 5 cinco palma pare",
    group: "people",
  },
  {
    glyph: "✋️",
    label: "raised hand",
    labelPt: "mão levantada",
    terms:
      "raised hand mao levantada 5 five high stop cinco erguida papel pare toca aqui",
    group: "people",
  },
  {
    glyph: "🖖",
    label: "vulcan salute",
    labelPt: "saudação vulcana",
    terms:
      "vulcan salute saudacao vulcana finger hand hands dedos jornada nas estrelas mao star trek spock startrek",
    group: "people",
  },
  {
    glyph: "🫱",
    label: "rightwards hand",
    labelPt: "mão para a direita",
    terms:
      "rightwards hand mao para a direita handshake hold reach right rightward shake apertar aperto pegar segurar",
    group: "people",
  },
  {
    glyph: "🫲",
    label: "leftwards hand",
    labelPt: "mão para a esquerda",
    terms:
      "leftwards hand mao para a esquerda handshake hold left leftward reach shake apertar pegar segurar",
    group: "people",
  },
  {
    glyph: "🫳",
    label: "palm down hand",
    labelPt: "mão com a palma para baixo",
    terms:
      "palm down hand mao com a palma para baixo dismiss drop dropped pick shoo up cair derrubar descartar pegar segurar soltar xo",
    group: "people",
  },
  {
    glyph: "🫴",
    label: "palm up hand",
    labelPt: "mão com a palma para cima",
    terms:
      "palm up hand mao com a palma para cima beckon catch come hold know lift me offer tell acenar levantar oferecer pegar segurar venha",
    group: "people",
  },
  {
    glyph: "🫷",
    label: "leftwards pushing hand",
    labelPt: "mão empurrando para a esquerda",
    terms:
      "leftwards pushing hand mao empurrando para a esquerda block five halt high hold leftward pause push refuse slap stop wait bate aqui bloquear empurrar esperar parar pausar recusar toca",
    group: "people",
  },
  {
    glyph: "🫸",
    label: "rightwards pushing hand",
    labelPt: "mão empurrando para a direita",
    terms:
      "rightwards pushing hand mao empurrando para a direita block five halt high hold pause push refuse rightward slap stop wait bate aqui bloquear empurrar esperar parar pausar recusar toca",
    group: "people",
  },
  {
    glyph: "👌",
    label: "OK hand",
    labelPt: "sinal de ok",
    terms:
      "ok hand sinal de awesome bet dope fleek fosho got gotcha legit okay pinch rad sure sweet three beliscar certo concordo mao rude sinalizando otimo",
    group: "people",
  },
  {
    glyph: "🤌",
    label: "pinched fingers",
    labelPt: "dedos comprimidos",
    terms:
      "pinched fingers dedos comprimidos gesture hand hold huh interrogation patience relax sarcastic ugh what zip beliscado coxinha gesto de mao ha interrogacao italiana italia maravilha o que sarcastico",
    group: "people",
  },
  {
    glyph: "🤏",
    label: "pinching hand",
    labelPt: "mão beliscando",
    terms:
      "pinching hand mao beliscando amount bit fingers little small sort beliscar pequena quantidade pequeno pouco pouquinho",
    group: "people",
  },
  {
    glyph: "✌️",
    label: "victory hand",
    labelPt: "mão em V de vitória",
    terms: "victory hand mao em v de vitoria peace beleza paz sim",
    group: "people",
  },
  {
    glyph: "🤞",
    label: "crossed fingers",
    labelPt: "dedos cruzados",
    terms:
      "crossed fingers dedos cruzados cross finger hand luck boa sorte mao torcendo",
    group: "people",
  },
  {
    glyph: "🫰",
    label: "hand with index finger and thumb crossed",
    labelPt: "mão com dedo indicador e polegar cruzados",
    terms:
      "hand with index finger and thumb crossed mao com dedo indicador e polegar cruzados 3 expensive heart love money snap amor army caro coracao dinheiro estalar k-pop kpop",
    group: "people",
  },
  {
    glyph: "🤟",
    label: "love-you gesture",
    labelPt: 'gesto de "te amo"',
    terms:
      "love-you gesture gesto de te amo fingers hand ily love three you amor mao",
    group: "people",
  },
  {
    glyph: "🤘",
    label: "sign of the horns",
    labelPt: "saudação do rock",
    terms:
      "sign of the horns saudacao do rock finger hand rock-on chifres dedos metal mao",
    group: "people",
  },
  {
    glyph: "🤙",
    label: "call me hand",
    labelPt: 'sinal "me liga"',
    terms: "call me hand sinal liga hang loose shaka legal ligar mao",
    group: "people",
  },
  {
    glyph: "👈️",
    label: "backhand index pointing left",
    labelPt: "dorso da mão com indicador apontando para a esquerda",
    terms:
      "backhand index pointing left dorso da mao com indicador apontando para a esquerda finger hand point costas dedo",
    group: "people",
  },
  {
    glyph: "👉️",
    label: "backhand index pointing right",
    labelPt: "dorso da mão com indicador apontando para a direita",
    terms:
      "backhand index pointing right dorso da mao com indicador apontando para a direita finger hand point apontar costas dedo",
    group: "people",
  },
  {
    glyph: "👆️",
    label: "backhand index pointing up",
    labelPt: "dorso da mão com indicador apontando para cima",
    terms:
      "backhand index pointing up dorso da mao com indicador apontando para cima finger hand point costas dedo",
    group: "people",
  },
  {
    glyph: "🖕",
    label: "middle finger",
    labelPt: "dedo do meio",
    terms: "middle finger dedo do meio hand gesto ofensivo mao",
    group: "people",
  },
  {
    glyph: "👇️",
    label: "backhand index pointing down",
    labelPt: "dorso da mão com indicador apontando para baixo",
    terms:
      "backhand index pointing down dorso da mao com indicador apontando para baixo finger hand point abaixo costas dedo apontado embaixo",
    group: "people",
  },
  {
    glyph: "☝️",
    label: "index pointing up",
    labelPt: "indicador apontando para cima",
    terms:
      "index pointing up indicador apontando para cima finger hand point this dedo eu mao",
    group: "people",
  },
  {
    glyph: "🫵",
    label: "index pointing at the viewer",
    labelPt: "indicador apontando para o visualizador",
    terms:
      "index pointing at the viewer indicador apontando para o visualizador finger hand poke you apontar ai cutucar dedo mao tu voce",
    group: "people",
  },
  {
    glyph: "👍️",
    label: "thumbs up",
    labelPt: "polegar para cima",
    terms:
      "thumbs up polegar para cima +1 good hand like thumb yes beleza concordo dedao joia mao ok sim sinal valeu",
    group: "people",
  },
  {
    glyph: "👎️",
    label: "thumbs down",
    labelPt: "polegar para baixo",
    terms:
      "thumbs down polegar para baixo -1 bad dislike good hand no nope thumb dedao desaprovado desaprovacao mao nao gostei ruim sinal",
    group: "people",
  },
  {
    glyph: "✊️",
    label: "raised fist",
    labelPt: "punho levantado",
    terms:
      "raised fist punho levantado clenched hand punch solidarity pedra erguido solidariedade",
    group: "people",
  },
  {
    glyph: "👊",
    label: "oncoming fist",
    labelPt: "soco",
    terms:
      "oncoming fist soco absolutely agree boom bro bruh bump clenched correct hand knuckle pound punch rock ttyl beleza fechado forca mao punho ta ligado",
    group: "people",
  },
  {
    glyph: "🤛",
    label: "left-facing fist",
    labelPt: "punho esquerdo",
    terms: "left-facing fist punho esquerdo leftwards fechada mao soco",
    group: "people",
  },
  {
    glyph: "🤜",
    label: "right-facing fist",
    labelPt: "punho direito",
    terms: "right-facing fist punho direito rightwards soco",
    group: "people",
  },
  {
    glyph: "👏",
    label: "clapping hands",
    labelPt: "mãos aplaudindo",
    terms:
      "clapping hands maos aplaudindo applause approval awesome clap congrats congratulations excited good great hand homie job nice prayed well yay aplauso bom trabalho palmas parabens sinal",
    group: "people",
  },
  {
    glyph: "🙌",
    label: "raising hands",
    labelPt: "mãos para cima",
    terms:
      "raising hands maos para cima celebration gesture hand hooray praise raised ambas as comemoracao levantando comemorar viva",
    group: "people",
  },
  {
    glyph: "🫶",
    label: "heart hands",
    labelPt: "mãos de coração",
    terms: "heart hands maos de coracao 3 love you amei amo voce amor mao te",
    group: "people",
  },
  {
    glyph: "👐",
    label: "open hands",
    labelPt: "mãos abertas",
    terms: "open hands maos abertas hand hug jazz swerve mao sinal de",
    group: "people",
  },
  {
    glyph: "🤲",
    label: "palms up together",
    labelPt: "palmas unidas para cima",
    terms:
      "palms up together palmas unidas para cima cupped dua hands pray prayer wish devocao juntas oracao",
    group: "people",
  },
  {
    glyph: "🤝",
    label: "handshake",
    labelPt: "aperto de mãos",
    terms:
      "handshake aperto de maos agreement deal hand meeting shake combinado cumprimento",
    group: "people",
  },
  {
    glyph: "🙏",
    label: "folded hands",
    labelPt: "mãos juntas",
    terms:
      "folded hands maos juntas appreciate ask beg blessed bow cmon five gesture hand high please pray thanks thx gesto mao reza rezando rezar",
    group: "people",
  },
  {
    glyph: "✍️",
    label: "writing hand",
    labelPt: "escrevendo à mão",
    terms: "writing hand escrevendo a mao write caneta",
    group: "people",
  },
  {
    glyph: "💅",
    label: "nail polish",
    labelPt: "esmalte de unha",
    terms:
      "nail polish esmalte de unha bored care cosmetics done makeup manicure whatever cosmeticos mao unhas",
    group: "people",
  },
  {
    glyph: "🤳",
    label: "selfie",
    labelPt: "selfie",
    terms: "selfie camera phone celular foto smartphone",
    group: "people",
  },
  {
    glyph: "💪",
    label: "flexed biceps",
    labelPt: "bíceps",
    terms:
      "flexed biceps arm beast bench bodybuilder bro curls flex gains gym jacked muscle press ripped strong weightlift academia contraido engracado forte musculacao musculo",
    group: "people",
  },
  {
    glyph: "🦾",
    label: "mechanical arm",
    labelPt: "braço mecânico",
    terms:
      "mechanical arm braco mecanico accessibility prosthetic acessibilidade protese",
    group: "people",
  },
  {
    glyph: "🦿",
    label: "mechanical leg",
    labelPt: "perna mecânica",
    terms:
      "mechanical leg perna mecanica accessibility prosthetic acessibilidade protese",
    group: "people",
  },
  {
    glyph: "🦵",
    label: "leg",
    labelPt: "perna",
    terms: "leg perna bent foot kick knee limb chute joelho membro dobrada pe",
    group: "people",
  },
  {
    glyph: "🦶",
    label: "foot",
    labelPt: "pé",
    terms:
      "foot pe ankle feet kick stomp calcanhar chutar chute pisar pisao tornozelo",
    group: "people",
  },
  {
    glyph: "👂️",
    label: "ear",
    labelPt: "orelha",
    terms:
      "ear orelha body ears hear hearing listen listening sound corpo escutar ouvido",
    group: "people",
  },
  {
    glyph: "🦻",
    label: "ear with hearing aid",
    labelPt: "ouvido com aparelho auditivo",
    terms:
      "ear with hearing aid ouvido com aparelho auditivo accessibility hard acessibilidade deficiencia auditiva surda surdo",
    group: "people",
  },
  {
    glyph: "👃",
    label: "nose",
    labelPt: "nariz",
    terms:
      "nose nariz body noses nosey odor smell smells cheirar cheiro corpo rosto",
    group: "people",
  },
  {
    glyph: "🧠",
    label: "brain",
    labelPt: "cérebro",
    terms: "brain cerebro intelligent smart inteligente inteligencia",
    group: "people",
  },
  {
    glyph: "🫀",
    label: "anatomical heart",
    labelPt: "coração humano",
    terms:
      "anatomical heart coracao humano beat cardiology heartbeat organ pulse real red anatomia batimento cardiaco cardiologia centro vermelho pulsacao pulso s2 orgao",
    group: "people",
  },
  {
    glyph: "🫁",
    label: "lungs",
    labelPt: "pulmões",
    terms:
      "lungs pulmoes breath breathe exhalation inhalation lung organ respiration anatomia espiracao exalacao inalacao pulmao respiracao orgao",
    group: "people",
  },
  {
    glyph: "🦷",
    label: "tooth",
    labelPt: "dente",
    terms: "tooth dente dentist pearly teeth white branco dentista",
    group: "people",
  },
  {
    glyph: "🦴",
    label: "bone",
    labelPt: "osso",
    terms: "bone osso bones dog skeleton wishbone cachorro esqueleto",
    group: "people",
  },
  {
    glyph: "👀",
    label: "eyes",
    labelPt: "olhos",
    terms:
      "eyes olhos body eye face googly look looking omg peep see seeing olhando olho rosto to de",
    group: "people",
  },
  {
    glyph: "👁️",
    label: "eye",
    labelPt: "olho",
    terms: "eye olho 1 body one parte do corpo rosto",
    group: "people",
  },
  {
    glyph: "👅",
    label: "tongue",
    labelPt: "língua",
    terms: "tongue lingua body lick slurp corpo rosto",
    group: "people",
  },
  {
    glyph: "👄",
    label: "mouth",
    labelPt: "boca",
    terms:
      "mouth boca beauty body kiss kissing lips lipstick batom beijo corpo labios rosto",
    group: "people",
  },
  {
    glyph: "🫦",
    label: "biting lip",
    labelPt: "mordendo o lábio",
    terms:
      "biting lip mordendo o labio anxious bite fear flirt flirting kiss lipstick nervous sexy uncomfortable worried worry ansioso batom beijo flertar labios medo mordida nervoso preocupacao seducao vontade",
    group: "people",
  },
  {
    glyph: "👶",
    label: "baby",
    labelPt: "bebê",
    terms:
      "baby bebe babies children goo infant newborn pregnant young bebezinho gravida nenem pessoas recem-nascido",
    group: "people",
  },
  {
    glyph: "🧒",
    label: "child",
    labelPt: "criança",
    terms:
      "child crianca bright-eyed grandchild kid young younger filho jovem neto pequeno",
    group: "people",
  },
  {
    glyph: "👦",
    label: "boy",
    labelPt: "menino",
    terms:
      "boy menino bright-eyed child grandson kid son young younger garoto guri jovem loiro pessoas pia",
    group: "people",
  },
  {
    glyph: "👧",
    label: "girl",
    labelPt: "menina",
    terms:
      "girl menina bright-eyed child daughter granddaughter kid virgo young younger zodiac filha garota menininha neta pessoas",
    group: "people",
  },
  {
    glyph: "🧑",
    label: "person",
    labelPt: "pessoa",
    terms: "person pessoa adult adulta adulto",
    group: "people",
  },
  {
    glyph: "👱",
    label: "person: blond hair",
    labelPt: "pessoa: cabelo louro",
    terms:
      "person blond hair pessoa cabelo louro blond-haired human loiro loira loura rosto",
    group: "people",
  },
  {
    glyph: "👨",
    label: "man",
    labelPt: "homem",
    terms: "man homem adult bro adulto amigo irmao marido namorado",
    group: "people",
  },
  {
    glyph: "🧔",
    label: "person: beard",
    labelPt: "homem: barba",
    terms: "person beard homem barba bearded whiskers barbudo pessoa",
    group: "people",
  },
  {
    glyph: "🧔‍♂️",
    label: "man: beard",
    labelPt: "homem: barbudo",
    terms: "man beard homem barbudo bearded whiskers barba",
    group: "people",
  },
  {
    glyph: "🧔‍♀️",
    label: "woman: beard",
    labelPt: "mulher: barba",
    terms: "woman beard mulher barba bearded whiskers",
    group: "people",
  },
  {
    glyph: "👨‍🦰",
    label: "man: red hair",
    labelPt: "homem: cabelo vermelho",
    terms:
      "man red hair homem cabelo vermelho adult bro adulto amigo irmao marido namorado",
    group: "people",
  },
  {
    glyph: "👨‍🦱",
    label: "man: curly hair",
    labelPt: "homem: cabelo cacheado",
    terms:
      "man curly hair homem cabelo cacheado adult bro adulto amigo irmao marido namorado",
    group: "people",
  },
  {
    glyph: "👨‍🦳",
    label: "man: white hair",
    labelPt: "homem: cabelo branco",
    terms:
      "man white hair homem cabelo branco adult bro adulto amigo irmao marido namorado",
    group: "people",
  },
  {
    glyph: "👨‍🦲",
    label: "man: bald",
    labelPt: "homem: careca",
    terms: "man bald homem careca adult bro adulto amigo irmao marido namorado",
    group: "people",
  },
  {
    glyph: "👩",
    label: "woman",
    labelPt: "mulher",
    terms: "woman mulher adult lady adulta garota guria loira menina mina",
    group: "people",
  },
  {
    glyph: "👩‍🦰",
    label: "woman: red hair",
    labelPt: "mulher: cabelo vermelho",
    terms:
      "woman red hair mulher cabelo vermelho adult lady adulta garota guria loira menina mina",
    group: "people",
  },
  {
    glyph: "🧑‍🦰",
    label: "person: red hair",
    labelPt: "pessoa: cabelo vermelho",
    terms: "person red hair pessoa cabelo vermelho adult adulta adulto",
    group: "people",
  },
  {
    glyph: "👩‍🦱",
    label: "woman: curly hair",
    labelPt: "mulher: cabelo cacheado",
    terms:
      "woman curly hair mulher cabelo cacheado adult lady adulta garota guria loira menina mina",
    group: "people",
  },
  {
    glyph: "🧑‍🦱",
    label: "person: curly hair",
    labelPt: "pessoa: cabelo cacheado",
    terms: "person curly hair pessoa cabelo cacheado adult adulta adulto",
    group: "people",
  },
  {
    glyph: "👩‍🦳",
    label: "woman: white hair",
    labelPt: "mulher: cabelo branco",
    terms:
      "woman white hair mulher cabelo branco adult lady adulta garota guria loira menina mina",
    group: "people",
  },
  {
    glyph: "🧑‍🦳",
    label: "person: white hair",
    labelPt: "pessoa: cabelo branco",
    terms: "person white hair pessoa cabelo branco adult adulta adulto",
    group: "people",
  },
  {
    glyph: "👩‍🦲",
    label: "woman: bald",
    labelPt: "mulher: careca",
    terms:
      "woman bald mulher careca adult lady adulta garota guria loira menina mina",
    group: "people",
  },
  {
    glyph: "🧑‍🦲",
    label: "person: bald",
    labelPt: "pessoa: careca",
    terms: "person bald pessoa careca adult adulta adulto",
    group: "people",
  },
  {
    glyph: "👱‍♀️",
    label: "woman: blond hair",
    labelPt: "mulher: cabelo loiro",
    terms:
      "woman blond hair mulher cabelo loiro blond-haired blonde garota guria loira loura menina",
    group: "people",
  },
  {
    glyph: "👱‍♂️",
    label: "man: blond hair",
    labelPt: "homem: cabelo loiro",
    terms: "man blond hair homem cabelo loiro blond-haired louro",
    group: "people",
  },
  {
    glyph: "🧓",
    label: "older person",
    labelPt: "idoso",
    terms:
      "older person idoso adult elderly grandparent old wise adulto avo sabio velho vovo",
    group: "people",
  },
  {
    glyph: "👴",
    label: "old man",
    labelPt: "homem idoso",
    terms:
      "old man homem idoso adult bald elderly gramps grandfather grandpa wise adulto avo careca pessoas vovo",
    group: "people",
  },
  {
    glyph: "👵",
    label: "old woman",
    labelPt: "idosa",
    terms:
      "old woman idosa adult elderly grandma grandmother granny lady wise adulta mulher pessoas velhinha vovozinha vovo",
    group: "people",
  },
  {
    glyph: "🙍",
    label: "person frowning",
    labelPt: "franzindo a sobrancelha",
    terms:
      "person frowning franzindo a sobrancelha annoyed disappointed disgruntled disturbed frown frustrated gesture irritated upset brava bravo chateada chateado testa gesto pessoa triste",
    group: "people",
  },
  {
    glyph: "🙍‍♂️",
    label: "man frowning",
    labelPt: "homem franzindo a sobrancelha",
    terms:
      "man frowning homem franzindo a sobrancelha annoyed disappointed disgruntled disturbed frown frustrated gesture irritated upset carrancudo chateado desconfiado gesto magoado menino",
    group: "people",
  },
  {
    glyph: "🙍‍♀️",
    label: "woman frowning",
    labelPt: "mulher franzindo a sobrancelha",
    terms:
      "woman frowning mulher franzindo a sobrancelha annoyed disappointed disgruntled disturbed frown frustrated gesture irritated upset carrancuda desconfiada",
    group: "people",
  },
  {
    glyph: "🙎",
    label: "person pouting",
    labelPt: "pessoa fazendo bico",
    terms:
      "person pouting pessoa fazendo bico disappointed downtrodden frown grimace scowl sulk upset whine beicinho beico careta chateada chateado emburrada emburrado gesto",
    group: "people",
  },
  {
    glyph: "🙎‍♂️",
    label: "man pouting",
    labelPt: "homem fazendo bico",
    terms:
      "man pouting homem fazendo bico disappointed downtrodden frown grimace scowl sulk upset whine apontando cara feia gesto homen",
    group: "people",
  },
  {
    glyph: "🙎‍♀️",
    label: "woman pouting",
    labelPt: "mulher fazendo bico",
    terms:
      "woman pouting mulher fazendo bico disappointed downtrodden frown grimace scowl sulk upset whine cara feia",
    group: "people",
  },
  {
    glyph: "🙅",
    label: "person gesturing NO",
    labelPt: "pessoa fazendo gesto de “não”",
    terms:
      "person gesturing no pessoa fazendo gesto de nao forbidden gesture hand not prohibit jeito nenhum mao proibido sem chance",
    group: "people",
  },
  {
    glyph: "🙅‍♂️",
    label: "man gesturing NO",
    labelPt: "homem fazendo gesto de “não”",
    terms:
      "man gesturing no homem fazendo gesto de nao forbidden gesture hand not prohibit menino mao proibido proibir",
    group: "people",
  },
  {
    glyph: "🙅‍♀️",
    label: "woman gesturing NO",
    labelPt: "mulher fazendo gesto de “não”",
    terms:
      "woman gesturing no mulher fazendo gesto de nao forbidden gesture hand not prohibit mao proibido",
    group: "people",
  },
  {
    glyph: "🙆",
    label: "person gesturing OK",
    labelPt: "pessoa fazendo gesto de “OK”",
    terms:
      "person gesturing ok pessoa fazendo gesto de exercise gesture hand omg exercicio para mao maos cima",
    group: "people",
  },
  {
    glyph: "🙆‍♂️",
    label: "man gesturing OK",
    labelPt: "homem fazendo gesto de “OK”",
    terms:
      "man gesturing ok homem fazendo gesto de exercise gesture hand omg cabeca exercicio menino mao nossa",
    group: "people",
  },
  {
    glyph: "🙆‍♀️",
    label: "woman gesturing OK",
    labelPt: "mulher fazendo gesto de “OK”",
    terms:
      "woman gesturing ok mulher fazendo gesto de exercise gesture hand omg mao",
    group: "people",
  },
  {
    glyph: "💁",
    label: "person tipping hand",
    labelPt: "pessoa com a palma virada para cima",
    terms:
      "person tipping hand pessoa com a palma virada para cima fetch flick flip gossip sarcasm sarcastic sassy seriously whatever ajuda diva divo fala serio fofoca informacoes jogada de cabelo mao sarcasmo",
    group: "people",
  },
  {
    glyph: "💁‍♂️",
    label: "man tipping hand",
    labelPt: "homem com a palma virada para cima",
    terms:
      "man tipping hand homem com a palma virada para cima fetch flick flip gossip sarcasm sarcastic sassy seriously whatever ajuda fofoca garoto gorjeta guri menino sarcasmo sarcastico",
    group: "people",
  },
  {
    glyph: "💁‍♀️",
    label: "woman tipping hand",
    labelPt: "mulher com a palma virada para cima",
    terms:
      "woman tipping hand mulher com a palma virada para cima fetch flick flip gossip sarcasm sarcastic sassy seriously whatever",
    group: "people",
  },
  {
    glyph: "🙋",
    label: "person raising hand",
    labelPt: "pessoa levantando a mão",
    terms:
      "person raising hand pessoa levantando a mao gesture here know me pick question raise duvida eu sei feliz gesto levantar",
    group: "people",
  },
  {
    glyph: "🙋‍♂️",
    label: "man raising hand",
    labelPt: "homem levantando a mão",
    terms:
      "man raising hand homem levantando a mao gesture here know me pick question raise eu sei gesto menino pedir palavra pergunta voluntario",
    group: "people",
  },
  {
    glyph: "🙋‍♀️",
    label: "woman raising hand",
    labelPt: "mulher levantando a mão",
    terms:
      "woman raising hand mulher levantando a mao gesture here know me pick question raise gesto pedir palavra",
    group: "people",
  },
  {
    glyph: "🧏",
    label: "deaf person",
    labelPt: "pessoa surda",
    terms:
      "deaf person pessoa surda accessibility ear gesture hear acessibilidade audicao orelha surdo surdos",
    group: "people",
  },
  {
    glyph: "🧏‍♂️",
    label: "deaf man",
    labelPt: "homem surdo",
    terms: "deaf man homem surdo accessibility ear gesture hear",
    group: "people",
  },
  {
    glyph: "🧏‍♀️",
    label: "deaf woman",
    labelPt: "mulher surda",
    terms: "deaf woman mulher surda accessibility ear gesture hear",
    group: "people",
  },
  {
    glyph: "🙇",
    label: "person bowing",
    labelPt: "pessoa fazendo reverência",
    terms:
      "person bowing pessoa fazendo reverencia apology ask beg bow favor forgive gesture meditate meditation pity regret sorry arrependimento desculpa desculpe gesto meditacao perdao respeitosa",
    group: "people",
  },
  {
    glyph: "🙇‍♂️",
    label: "man bowing",
    labelPt: "homem fazendo reverência",
    terms:
      "man bowing homem fazendo reverencia apology ask beg bow favor forgive gesture meditate meditation pity regret sorry desculpas gesto pedindo respeito",
    group: "people",
  },
  {
    glyph: "🙇‍♀️",
    label: "woman bowing",
    labelPt: "mulher fazendo reverência",
    terms:
      "woman bowing mulher fazendo reverencia apology ask beg bow favor forgive gesture meditate meditation pity regret sorry desculpas desculpe gesto meditar meditacao pedindo respeito",
    group: "people",
  },
  {
    glyph: "🤦",
    label: "person facepalming",
    labelPt: "pessoa decepcionada",
    terms:
      "person facepalming pessoa decepcionada again bewilder disbelief exasperation facepalm no not oh omg shock smh como assim decepcionado decepcao desapontamento descrenca inacreditavel meu deus nao acredito e possivel dececionada",
    group: "people",
  },
  {
    glyph: "🤦‍♂️",
    label: "man facepalming",
    labelPt: "homem decepcionado",
    terms:
      "man facepalming homem decepcionado again bewilder disbelief exasperation facepalm no not oh omg shock smh como assim decepcao desapontamento inacreditavel meu deus nao acredito e possivel",
    group: "people",
  },
  {
    glyph: "🤦‍♀️",
    label: "woman facepalming",
    labelPt: "mulher decepcionada",
    terms:
      "woman facepalming mulher decepcionada again bewilder disbelief exasperation facepalm no not oh omg shock smh como assim decepcao desapontamento inacreditavel meu deus nao acredito e possivel",
    group: "people",
  },
  {
    glyph: "🤷",
    label: "person shrugging",
    labelPt: "pessoa dando de ombros",
    terms:
      "person shrugging pessoa dando de ombros doubt dunno guess idk ignorance indifference knows maybe shrug whatever who dar duvida ignorancia indiferenca nao sei quem sabe la tanto faz",
    group: "people",
  },
  {
    glyph: "🤷‍♂️",
    label: "man shrugging",
    labelPt: "homem dando de ombros",
    terms:
      "man shrugging homem dando de ombros doubt dunno guess idk ignorance indifference knows maybe shrug whatever who dar duvida indiferenca menino nao sei quem sabe la tanto faz",
    group: "people",
  },
  {
    glyph: "🤷‍♀️",
    label: "woman shrugging",
    labelPt: "mulher dando de ombros",
    terms:
      "woman shrugging mulher dando de ombros doubt dunno guess idk ignorance indifference knows maybe shrug whatever who dar duvida garota indiferenca menina nao sei quem sabe la tanto faz",
    group: "people",
  },
  {
    glyph: "🧑‍⚕️",
    label: "health worker",
    labelPt: "profissional de saúde",
    terms:
      "health worker profissional de saude doctor healthcare nurse therapist cuidados enfermeira medico terapeuta",
    group: "people",
  },
  {
    glyph: "👨‍⚕️",
    label: "man health worker",
    labelPt: "homem profissional da saúde",
    terms:
      "man health worker homem profissional da saude doctor healthcare nurse therapist doutor enfermeiro medico terapeuta",
    group: "people",
  },
  {
    glyph: "👩‍⚕️",
    label: "woman health worker",
    labelPt: "mulher profissional da saúde",
    terms:
      "woman health worker mulher profissional da saude doctor healthcare nurse therapist doutora enfermeira garota guria menina medica terapeuta",
    group: "people",
  },
  {
    glyph: "🧑‍🎓",
    label: "student",
    labelPt: "aluno",
    terms: "student aluno graduate estudante graduando",
    group: "people",
  },
  {
    glyph: "👨‍🎓",
    label: "man student",
    labelPt: "estudante",
    terms:
      "man student estudante graduate aluno colando grau formando graduacao homem",
    group: "people",
  },
  {
    glyph: "👩‍🎓",
    label: "woman student",
    labelPt: "aluna",
    terms: "woman student aluna graduate estudante formanda mulher",
    group: "people",
  },
  {
    glyph: "🧑‍🏫",
    label: "teacher",
    labelPt: "professora na escola",
    terms:
      "teacher professora na escola instructor lecturer professor instrutora",
    group: "people",
  },
  {
    glyph: "👨‍🏫",
    label: "man teacher",
    labelPt: "professor",
    terms:
      "man teacher professor instructor lecturer educador homem instrutor mestre",
    group: "people",
  },
  {
    glyph: "👩‍🏫",
    label: "woman teacher",
    labelPt: "professora",
    terms:
      "woman teacher professora instructor lecturer professor instrutora mestra mulher",
    group: "people",
  },
  {
    glyph: "🧑‍⚖️",
    label: "judge",
    labelPt: "juiz no tribunal",
    terms: "judge juiz no tribunal justice law scales balanca",
    group: "people",
  },
  {
    glyph: "👨‍⚖️",
    label: "man judge",
    labelPt: "juiz",
    terms: "man judge juiz justice law scales balanca homem justica",
    group: "people",
  },
  {
    glyph: "👩‍⚖️",
    label: "woman judge",
    labelPt: "juíza",
    terms: "woman judge juiza justice law scales balanca justica mulher",
    group: "people",
  },
  {
    glyph: "🧑‍🌾",
    label: "farmer",
    labelPt: "agricultor",
    terms: "farmer agricultor gardener rancher jardineiro rancheiro",
    group: "people",
  },
  {
    glyph: "👨‍🌾",
    label: "man farmer",
    labelPt: "fazendeiro",
    terms: "man farmer fazendeiro gardener rancher agricultor homem jardineiro",
    group: "people",
  },
  {
    glyph: "👩‍🌾",
    label: "woman farmer",
    labelPt: "fazendeira",
    terms:
      "woman farmer fazendeira gardener rancher agricultora jardineira mulher",
    group: "people",
  },
  {
    glyph: "🧑‍🍳",
    label: "cook",
    labelPt: "chef de cozinha",
    terms: "cook chef de cozinha cozinheiro",
    group: "people",
  },
  {
    glyph: "👨‍🍳",
    label: "man cook",
    labelPt: "cozinheiro",
    terms: "man cook cozinheiro chef homem restaurante",
    group: "people",
  },
  {
    glyph: "👩‍🍳",
    label: "woman cook",
    labelPt: "cozinheira",
    terms: "woman cook cozinheira chef mulher",
    group: "people",
  },
  {
    glyph: "🧑‍🔧",
    label: "mechanic",
    labelPt: "mecânico trabalhando",
    terms:
      "mechanic mecanico trabalhando electrician plumber tradesperson eletricista encanador prestador de servico",
    group: "people",
  },
  {
    glyph: "👨‍🔧",
    label: "man mechanic",
    labelPt: "mecânico",
    terms:
      "man mechanic mecanico electrician plumber tradesperson eletricista encanador homem prestador de servicos",
    group: "people",
  },
  {
    glyph: "👩‍🔧",
    label: "woman mechanic",
    labelPt: "mecânica",
    terms:
      "woman mechanic mecanica electrician plumber tradesperson eletricista encanadora mulher prestadora de servicos",
    group: "people",
  },
  {
    glyph: "🧑‍🏭",
    label: "factory worker",
    labelPt: "funcionário de fábrica",
    terms:
      "factory worker funcionario de fabrica assembly industrial montagem trabalhador",
    group: "people",
  },
  {
    glyph: "👨‍🏭",
    label: "man factory worker",
    labelPt: "operário",
    terms:
      "man factory worker operario assembly industrial fabrica homem industria metalurgico trabalhador",
    group: "people",
  },
  {
    glyph: "👩‍🏭",
    label: "woman factory worker",
    labelPt: "operária",
    terms:
      "woman factory worker operaria assembly industrial fabrica industria mulher trabalhadora",
    group: "people",
  },
  {
    glyph: "🧑‍💼",
    label: "office worker",
    labelPt: "trabalhador de escritório",
    terms:
      "office worker trabalhador de escritorio architect business manager white-collar arquiteto colarinho branco gerente negocios",
    group: "people",
  },
  {
    glyph: "👨‍💼",
    label: "man office worker",
    labelPt: "funcionário de escritório",
    terms:
      "man office worker funcionario de escritorio architect business manager white-collar arquiteto colarinho branco empresario gerente homem",
    group: "people",
  },
  {
    glyph: "👩‍💼",
    label: "woman office worker",
    labelPt: "funcionária de escritório",
    terms:
      "woman office worker funcionaria de escritorio architect business manager white-collar arquiteta branco colarinho empresaria gerente mulher",
    group: "people",
  },
  {
    glyph: "🧑‍🔬",
    label: "scientist",
    labelPt: "cientista",
    terms:
      "scientist cientista biologist chemist engineer mathematician physicist biologo engenheiro fisico quimico",
    group: "people",
  },
  {
    glyph: "👨‍🔬",
    label: "man scientist",
    labelPt: "cientista homem",
    terms:
      "man scientist cientista homem biologist chemist engineer mathematician physicist biologo fisico professor quimico",
    group: "people",
  },
  {
    glyph: "👩‍🔬",
    label: "woman scientist",
    labelPt: "cientista mulher",
    terms:
      "woman scientist cientista mulher biologist chemist engineer mathematician physicist biologa fisica professora quimica",
    group: "people",
  },
  {
    glyph: "🧑‍💻",
    label: "technologist",
    labelPt: "programador",
    terms:
      "technologist programador coder computer developer inventor software desenvolvedor tecnologo",
    group: "people",
  },
  {
    glyph: "👨‍💻",
    label: "man technologist",
    labelPt: "tecnólogo",
    terms:
      "man technologist tecnologo coder computer developer inventor software codificador computador criador desenvolvedor homem programador",
    group: "people",
  },
  {
    glyph: "👩‍💻",
    label: "woman technologist",
    labelPt: "tecnóloga",
    terms:
      "woman technologist tecnologa coder computer developer inventor software codificadora computador criadora desenvolvedora inventora mulher programadora",
    group: "people",
  },
  {
    glyph: "🧑‍🎤",
    label: "singer",
    labelPt: "cantor",
    terms:
      "singer cantor actor entertainer rock rockstar star ator entretenimento estrela",
    group: "people",
  },
  {
    glyph: "👨‍🎤",
    label: "man singer",
    labelPt: "cantor homem",
    terms:
      "man singer cantor homem actor entertainer rock rockstar star artista ator pop",
    group: "people",
  },
  {
    glyph: "👩‍🎤",
    label: "woman singer",
    labelPt: "cantora",
    terms:
      "woman singer cantora actor entertainer rock rockstar star artista atriz mulher pop",
    group: "people",
  },
  {
    glyph: "🧑‍🎨",
    label: "artist",
    labelPt: "artista",
    terms: "artist artista palette paleta",
    group: "people",
  },
  {
    glyph: "👨‍🎨",
    label: "man artist",
    labelPt: "artista plástico",
    terms: "man artist artista plastico palette homem pintor pintura quadros",
    group: "people",
  },
  {
    glyph: "👩‍🎨",
    label: "woman artist",
    labelPt: "artista plástica",
    terms: "woman artist artista plastica palette mulher pintura",
    group: "people",
  },
  {
    glyph: "🧑‍✈️",
    label: "pilot",
    labelPt: "piloto",
    terms: "pilot piloto plane aviao",
    group: "people",
  },
  {
    glyph: "👨‍✈️",
    label: "man pilot",
    labelPt: "piloto de avião homem",
    terms: "man pilot piloto de aviao homem plane",
    group: "people",
  },
  {
    glyph: "👩‍✈️",
    label: "woman pilot",
    labelPt: "piloto de avião mulher",
    terms: "woman pilot piloto de aviao mulher plane garota guria voando",
    group: "people",
  },
  {
    glyph: "🧑‍🚀",
    label: "astronaut",
    labelPt: "astronauta",
    terms: "astronaut astronauta rocket space foguete",
    group: "people",
  },
  {
    glyph: "👨‍🚀",
    label: "man astronaut",
    labelPt: "astronauta homem",
    terms: "man astronaut astronauta homem rocket space espaco foguete",
    group: "people",
  },
  {
    glyph: "👩‍🚀",
    label: "woman astronaut",
    labelPt: "astronauta mulher",
    terms: "woman astronaut astronauta mulher rocket space espaco foguete",
    group: "people",
  },
  {
    glyph: "🧑‍🚒",
    label: "firefighter",
    labelPt: "bombeiro",
    terms: "firefighter bombeiro fire firetruck caminhao de bombeiros",
    group: "people",
  },
  {
    glyph: "👨‍🚒",
    label: "man firefighter",
    labelPt: "bombeiro homem",
    terms:
      "man firefighter bombeiro homem fire firetruck caminhao corpo de bombeiros fogo incendio",
    group: "people",
  },
  {
    glyph: "👩‍🚒",
    label: "woman firefighter",
    labelPt: "bombeira",
    terms:
      "woman firefighter bombeira fire firetruck caminhao corpo de bombeiros fogo incendio mulher",
    group: "people",
  },
  {
    glyph: "👮",
    label: "police officer",
    labelPt: "policial",
    terms:
      "police officer policial apprehend arrest citation cop law over pulled undercover autoridade multar pessoa policia prender",
    group: "people",
  },
  {
    glyph: "👮‍♂️",
    label: "man police officer",
    labelPt: "policial homem",
    terms:
      "man police officer policial homem apprehend arrest citation cop law over pulled undercover policia tira",
    group: "people",
  },
  {
    glyph: "👮‍♀️",
    label: "woman police officer",
    labelPt: "policial mulher",
    terms:
      "woman police officer policial mulher apprehend arrest citation cop law over pulled undercover autoridade multar policia prender tira",
    group: "people",
  },
  {
    glyph: "🕵️",
    label: "detective",
    labelPt: "detetive",
    terms: "detective detetive sleuth spy espiao investigador rosto com lupa",
    group: "people",
  },
  {
    glyph: "🕵️‍♂️",
    label: "man detective",
    labelPt: "detetive homem",
    terms: "man detective detetive homem sleuth spy espiao investigador",
    group: "people",
  },
  {
    glyph: "🕵️‍♀️",
    label: "woman detective",
    labelPt: "detetive mulher",
    terms:
      "woman detective detetive mulher sleuth spy espionar espia investigadora investigar",
    group: "people",
  },
  {
    glyph: "💂",
    label: "guard",
    labelPt: "guarda",
    terms:
      "guard guarda buckingham helmet london palace londres palacio pessoas seguranca",
    group: "people",
  },
  {
    glyph: "💂‍♂️",
    label: "man guard",
    labelPt: "guarda homem",
    terms: "man guard guarda homem buckingham helmet london palace seguranca",
    group: "people",
  },
  {
    glyph: "💂‍♀️",
    label: "woman guard",
    labelPt: "guarda mulher",
    terms:
      "woman guard guarda mulher buckingham helmet london palace londres palacio realeza seguranca",
    group: "people",
  },
  {
    glyph: "🥷",
    label: "ninja",
    labelPt: "ninja",
    terms:
      "ninja assassin fight fighter hidden person secret skills sly soldier stealth war assassino furtividade guerra habilidades luta lutador oculto pessoa soldado",
    group: "people",
  },
  {
    glyph: "👷",
    label: "construction worker",
    labelPt: "trabalhador de construção civil",
    terms:
      "construction worker trabalhador de construcao civil build fix hardhat hat man person rebuild remodel repair work capacete chapeu construir pessoa",
    group: "people",
  },
  {
    glyph: "👷‍♂️",
    label: "man construction worker",
    labelPt: "pedreiro",
    terms:
      "man construction worker pedreiro build fix hardhat hat rebuild remodel repair work construcao homem operario",
    group: "people",
  },
  {
    glyph: "👷‍♀️",
    label: "woman construction worker",
    labelPt: "pedreira",
    terms:
      "woman construction worker pedreira build fix hardhat hat man rebuild remodel repair work capacete construcao contrucao mulher operaria operario pedreiro",
    group: "people",
  },
  {
    glyph: "🫅",
    label: "person with crown",
    labelPt: "pessoa com coroa",
    terms:
      "person with crown pessoa com coroa monarch noble regal royal royalty monarca nobre princesa principe rainha real realeza rei reino",
    group: "people",
  },
  {
    glyph: "🤴",
    label: "prince",
    labelPt: "príncipe",
    terms:
      "prince principe crown fairy fairytale fantasy king royal royalty tale realeza rei",
    group: "people",
  },
  {
    glyph: "👸",
    label: "princess",
    labelPt: "princesa",
    terms:
      "princess princesa crown fairy fairytale fantasy queen royal royalty tale conto coroa fadas fantasia loira menina mulher pessoas rainha",
    group: "people",
  },
  {
    glyph: "👳",
    label: "person wearing turban",
    labelPt: "pessoa com turbante",
    terms: "person wearing turban pessoa com turbante",
    group: "people",
  },
  {
    glyph: "👳‍♂️",
    label: "man wearing turban",
    labelPt: "homem com turbante",
    terms: "man wearing turban homem com turbante",
    group: "people",
  },
  {
    glyph: "👳‍♀️",
    label: "woman wearing turban",
    labelPt: "mulher com turbante",
    terms: "woman wearing turban mulher com turbante",
    group: "people",
  },
  {
    glyph: "👲",
    label: "person with skullcap",
    labelPt: "homem de boné",
    terms:
      "person with skullcap homem de bone cap chinese gua guapi hat mao pi chapeu chines guapimao com pessoas",
    group: "people",
  },
  {
    glyph: "🧕",
    label: "woman with headscarf",
    labelPt: "mulher com véu",
    terms:
      "woman with headscarf mulher com veu bandana head hijab kerchief mantilla tichel cabeca lenco",
    group: "people",
  },
  {
    glyph: "🤵",
    label: "person in tuxedo",
    labelPt: "pessoa de smoking",
    terms:
      "person in tuxedo pessoa de smoking formal wedding festa gala homem noivo",
    group: "people",
  },
  {
    glyph: "🤵‍♂️",
    label: "man in tuxedo",
    labelPt: "homem de smoking",
    terms: "man in tuxedo homem de smoking formal groom wedding",
    group: "people",
  },
  {
    glyph: "🤵‍♀️",
    label: "woman in tuxedo",
    labelPt: "mulher de smoking",
    terms: "woman in tuxedo mulher de smoking formal wedding",
    group: "people",
  },
  {
    glyph: "👰",
    label: "person with veil",
    labelPt: "pessoa com véu",
    terms: "person with veil pessoa com veu wedding casamento noiva pessoas de",
    group: "people",
  },
  {
    glyph: "👰‍♂️",
    label: "man with veil",
    labelPt: "noivo com véu",
    terms: "man with veil noivo com veu wedding",
    group: "people",
  },
  {
    glyph: "👰‍♀️",
    label: "woman with veil",
    labelPt: "noiva com véu",
    terms: "woman with veil noiva com veu bride wedding",
    group: "people",
  },
  {
    glyph: "🤰",
    label: "pregnant woman",
    labelPt: "grávida",
    terms: "pregnant woman gravida estou gravidez mulher",
    group: "people",
  },
  {
    glyph: "🫃",
    label: "pregnant man",
    labelPt: "homem grávido",
    terms:
      "pregnant man homem gravido belly bloated full overeat barriga cheia cheio comi demais excesso de peso gravidez inchado pessoa",
    group: "people",
  },
  {
    glyph: "🫄",
    label: "pregnant person",
    labelPt: "pessoa grávida",
    terms:
      "pregnant person pessoa gravida belly bloated full overeat stuffed barriga cheia cheio comi demais excesso de peso gravidez inchada",
    group: "people",
  },
  {
    glyph: "🤱",
    label: "breast-feeding",
    labelPt: "amamentando",
    terms:
      "breast-feeding amamentando baby breast feeding mom mother nursing woman amamentacao bebe leite materno mae nenem",
    group: "people",
  },
  {
    glyph: "👩‍🍼",
    label: "woman feeding baby",
    labelPt: "mulher alimentando bebê",
    terms:
      "woman feeding baby mulher alimentando bebe feed mom mother nanny newborn nursing amamentando amamentacao amor mamae mae nascido nenem pessoa recem recem-nascido",
    group: "people",
  },
  {
    glyph: "👨‍🍼",
    label: "man feeding baby",
    labelPt: "homem alimentando bebê",
    terms:
      "man feeding baby homem alimentando bebe dad father feed nanny newborn nursing amamentando amamentacao amor nenem pai papai pessoa recem nascido recem-nascido",
    group: "people",
  },
  {
    glyph: "🧑‍🍼",
    label: "person feeding baby",
    labelPt: "pessoa alimentando bebê",
    terms:
      "person feeding baby pessoa alimentando bebe feed nanny newborn nursing parent amamentar amamentacao homem mulher mae nenem pai recem-nascido",
    group: "people",
  },
  {
    glyph: "👼",
    label: "baby angel",
    labelPt: "bebê anjo",
    terms:
      "baby angel bebe anjo church face fairy fairytale fantasy tale conto fadas rosto",
    group: "people",
  },
  {
    glyph: "🎅",
    label: "Santa Claus",
    labelPt: "Papai Noel",
    terms:
      "santa claus papai noel celebration christmas fairy fantasy father holiday merry tale xmas comemoracao festas natal",
    group: "people",
  },
  {
    glyph: "🤶",
    label: "Mrs. Claus",
    labelPt: "Mamãe Noel",
    terms:
      "mrs claus mamae noel celebration christmas fairy fantasy holiday merry mother santa tale xmas comemoracao natal vovo",
    group: "people",
  },
  {
    glyph: "🧑‍🎄",
    label: "Mx Claus",
    labelPt: "noel",
    terms:
      "mx claus noel celebration christmas fairy fantasy holiday merry santa tale xmas chapeu feliz festas gorro mamae natal pessoa",
    group: "people",
  },
  {
    glyph: "🦸",
    label: "superhero",
    labelPt: "super-herói",
    terms:
      "superhero super-heroi good hero superpower bem boa bom heroina heroi super-homem superman superpoder",
    group: "people",
  },
  {
    glyph: "🦸‍♂️",
    label: "man superhero",
    labelPt: "homem super-herói",
    terms:
      "man superhero homem super-heroi good hero superpower bom heroi superpoder",
    group: "people",
  },
  {
    glyph: "🦸‍♀️",
    label: "woman superhero",
    labelPt: "super-heroína",
    terms:
      "woman superhero super-heroina good hero heroine superpower boa heroina heroi mulher superpoder",
    group: "people",
  },
  {
    glyph: "🦹",
    label: "supervillain",
    labelPt: "supervilão",
    terms:
      "supervillain supervilao bad criminal evil superpower villain bandido criminoso mal malvado mau superpoder vilao",
    group: "people",
  },
  {
    glyph: "🦹‍♂️",
    label: "man supervillain",
    labelPt: "homem supervilão",
    terms:
      "man supervillain homem supervilao bad criminal evil superpower villain criminoso mal superpoder vilao",
    group: "people",
  },
  {
    glyph: "🦹‍♀️",
    label: "woman supervillain",
    labelPt: "supervilã",
    terms:
      "woman supervillain supervila bad criminal evil superpower villain criminosa mulher ma superpoder vila",
    group: "people",
  },
  {
    glyph: "🧙",
    label: "mage",
    labelPt: "mago",
    terms:
      "mage mago fantasy magic play sorcerer sorceress sorcery spell summon witch wizard bruxa fantasia feiticeira feiticeiro feitico maga magia rpg",
    group: "people",
  },
  {
    glyph: "🧙‍♂️",
    label: "man mage",
    labelPt: "homem mago",
    terms:
      "man mage homem mago fantasy magic play sorcerer sorceress sorcery spell summon witch wizard feiticeiro",
    group: "people",
  },
  {
    glyph: "🧙‍♀️",
    label: "woman mage",
    labelPt: "maga",
    terms:
      "woman mage maga fantasy magic play sorcerer sorceress sorcery spell summon witch wizard bruxa feiticeira",
    group: "people",
  },
  {
    glyph: "🧚",
    label: "fairy",
    labelPt: "fada",
    terms:
      "fairy fada fairytale fantasy myth person pixie tale wings asas conto encantado fantasia ser",
    group: "people",
  },
  {
    glyph: "🧚‍♂️",
    label: "man fairy",
    labelPt: "homem fada",
    terms:
      "man fairy homem fada fairytale fantasy myth oberon person pixie puck tale wings",
    group: "people",
  },
  {
    glyph: "🧚‍♀️",
    label: "woman fairy",
    labelPt: "mulher fada",
    terms:
      "woman fairy mulher fada fairytale fantasy myth person pixie tale titania wings",
    group: "people",
  },
  {
    glyph: "🧛",
    label: "vampire",
    labelPt: "vampiro",
    terms:
      "vampire vampiro blood dracula fangs halloween scary supernatural teeth undead assustador bruxas dia fantasia monstro sangue terror",
    group: "people",
  },
  {
    glyph: "🧛‍♂️",
    label: "man vampire",
    labelPt: "homem vampiro",
    terms:
      "man vampire homem vampiro blood fangs halloween scary supernatural teeth undead dracula",
    group: "people",
  },
  {
    glyph: "🧛‍♀️",
    label: "woman vampire",
    labelPt: "mulher vampira",
    terms:
      "woman vampire mulher vampira blood fangs halloween scary supernatural teeth undead",
    group: "people",
  },
  {
    glyph: "🧜",
    label: "merperson",
    labelPt: "pessoa sereia",
    terms:
      "merperson pessoa sereia creature fairytale folklore ocean sea siren trident canto cauda contos criatura fada fundo mar oceano ser encantado sirene tridente",
    group: "people",
  },
  {
    glyph: "🧜‍♂️",
    label: "merman",
    labelPt: "sereio",
    terms:
      "merman sereio creature fairytale folklore neptune ocean poseidon sea siren trident triton tritao",
    group: "people",
  },
  {
    glyph: "🧜‍♀️",
    label: "mermaid",
    labelPt: "sereia",
    terms:
      "mermaid sereia creature fairytale folklore merwoman ocean sea siren trident",
    group: "people",
  },
  {
    glyph: "🧝",
    label: "elf",
    labelPt: "elfo",
    terms:
      "elf elfo elves enchantment fantasy folklore magic magical myth duende fantasia legolas magia magico mistico rpg ser encantado",
    group: "people",
  },
  {
    glyph: "🧝‍♂️",
    label: "man elf",
    labelPt: "elfo homem",
    terms:
      "man elf elfo homem elves enchantment fantasy folklore magic magical myth duende",
    group: "people",
  },
  {
    glyph: "🧝‍♀️",
    label: "woman elf",
    labelPt: "elfa",
    terms:
      "woman elf elfa elves enchantment fantasy folklore magic magical myth duende mulher",
    group: "people",
  },
  {
    glyph: "🧞",
    label: "genie",
    labelPt: "gênio",
    terms:
      "genie genio djinn fantasy jinn lamp myth rub wishes desejos fantasia lampada magica mistico",
    group: "people",
  },
  {
    glyph: "🧞‍♂️",
    label: "man genie",
    labelPt: "homem gênio",
    terms: "man genie homem genio djinn fantasy jinn lamp myth rub wishes",
    group: "people",
  },
  {
    glyph: "🧞‍♀️",
    label: "woman genie",
    labelPt: "mulher gênio",
    terms: "woman genie mulher genio djinn fantasy jinn lamp myth rub wishes",
    group: "people",
  },
];

const EMOJI_BLOCK_1: EmojiEntry[] = [
  {
    glyph: "🧟",
    label: "zombie",
    labelPt: "zumbi",
    terms:
      "zombie zumbi apocalypse dead halloween horror scary undead walking apocalipse assustador bruxas dia morto-vivo terror",
    group: "people",
  },
  {
    glyph: "🧟‍♂️",
    label: "man zombie",
    labelPt: "homem zumbi",
    terms:
      "man zombie homem zumbi apocalypse dead halloween horror scary undead walking cazumbi",
    group: "people",
  },
  {
    glyph: "🧟‍♀️",
    label: "woman zombie",
    labelPt: "mulher zumbi",
    terms:
      "woman zombie mulher zumbi apocalypse dead halloween horror scary undead walking cazumbi",
    group: "people",
  },
  {
    glyph: "🧌",
    label: "troll",
    labelPt: "troll",
    terms:
      "troll fairy fantasy monster tale trolling conto fadas fantasia gigante monstro ogro",
    group: "people",
  },
  {
    glyph: "🫈",
    label: "hairy creature",
    labelPt: "criatura peluda",
    terms:
      "hairy creature criatura peluda bigfoot cryptid forest giant sasquatch woodwose yeti criptido eua floresta gigante peludo pe grande",
    group: "people",
  },
  {
    glyph: "💆",
    label: "person getting massage",
    labelPt: "pessoa recebendo massagem facial",
    terms:
      "person getting massage pessoa recebendo massagem facial face headache relax relaxing salon soothe spa tension therapy treatment dor de cabeca pele relaxar rosto tensao",
    group: "people",
  },
  {
    glyph: "💆‍♂️",
    label: "man getting massage",
    labelPt: "homem recebendo massagem facial",
    terms:
      "man getting massage homem recebendo massagem facial face headache relax relaxing salon soothe spa tension therapy treatment acalmar dor de cabeca menino relaxamento relaxar rosto salao tenso tensao",
    group: "people",
  },
  {
    glyph: "💆‍♀️",
    label: "woman getting massage",
    labelPt: "mulher recebendo massagem facial",
    terms:
      "woman getting massage mulher recebendo massagem facial face headache relax relaxing salon soothe spa tension therapy treatment relaxamento",
    group: "people",
  },
  {
    glyph: "💇",
    label: "person getting haircut",
    labelPt: "pessoa cortando o cabelo",
    terms:
      "person getting haircut pessoa cortando o cabelo barber beauty chop cosmetology cut groom hair parlor shears style beleza corte de salao",
    group: "people",
  },
  {
    glyph: "💇‍♂️",
    label: "man getting haircut",
    labelPt: "homem cortando o cabelo",
    terms:
      "man getting haircut homem cortando o cabelo barber beauty chop cosmetology cut groom hair parlor person shears style barbeiro beleza corte menino salao",
    group: "people",
  },
  {
    glyph: "💇‍♀️",
    label: "woman getting haircut",
    labelPt: "mulher cortando o cabelo",
    terms:
      "woman getting haircut mulher cortando o cabelo barber beauty chop cosmetology cut groom hair parlor person shears style corte de salao beleza",
    group: "people",
  },
  {
    glyph: "🚶",
    label: "person walking",
    labelPt: "pessoa andando",
    terms:
      "person walking pessoa andando amble gait hike man pace pedestrian stride stroll walk andar caminhada caminhar passo pedestre perambulando",
    group: "people",
  },
  {
    glyph: "🚶‍♂️",
    label: "man walking",
    labelPt: "homem andando",
    terms:
      "man walking homem andando amble gait hike pace pedestrian stride stroll walk andar caminhar caminhando",
    group: "people",
  },
  {
    glyph: "🚶‍♀️",
    label: "woman walking",
    labelPt: "mulher andando",
    terms:
      "woman walking mulher andando amble gait hike man pace pedestrian stride stroll walk andar caminhada caminhando caminhar passeio pedestre perambulando",
    group: "people",
  },
  {
    glyph: "🚶‍➡️",
    label: "person walking: facing right",
    labelPt: "pessoa andando: de frente para a direita",
    terms:
      "person walking facing right pessoa andando de frente para a direita amble gait hike man pace pedestrian stride stroll walk andar caminhada caminhar passo pedestre perambulando",
    group: "people",
  },
  {
    glyph: "🚶‍♀️‍➡️",
    label: "woman walking: facing right",
    labelPt: "mulher andando: de frente para a direita",
    terms:
      "woman walking facing right mulher andando de frente para a direita amble gait hike man pace pedestrian stride stroll walk andar caminhada caminhando caminhar passeio pedestre perambulando",
    group: "people",
  },
  {
    glyph: "🚶‍♂️‍➡️",
    label: "man walking: facing right",
    labelPt: "homem andando: de frente para a direita",
    terms:
      "man walking facing right homem andando de frente para a direita amble gait hike pace pedestrian stride stroll walk andar caminhar caminhando",
    group: "people",
  },
  {
    glyph: "🧍",
    label: "person standing",
    labelPt: "pessoa em pé",
    terms: "person standing pessoa em pe stand de",
    group: "people",
  },
  {
    glyph: "🧍‍♂️",
    label: "man standing",
    labelPt: "homem em pé",
    terms: "man standing homem em pe stand",
    group: "people",
  },
  {
    glyph: "🧍‍♀️",
    label: "woman standing",
    labelPt: "mulher em pé",
    terms: "woman standing mulher em pe stand",
    group: "people",
  },
  {
    glyph: "🧎",
    label: "person kneeling",
    labelPt: "pessoa ajoelhando",
    terms:
      "person kneeling pessoa ajoelhando kneel knees ajoelhado ajoelhar joelhos pedir por favor",
    group: "people",
  },
  {
    glyph: "🧎‍♂️",
    label: "man kneeling",
    labelPt: "homem ajoelhando",
    terms: "man kneeling homem ajoelhando kneel knees ajoelhado",
    group: "people",
  },
  {
    glyph: "🧎‍♀️",
    label: "woman kneeling",
    labelPt: "mulher ajoelhando",
    terms: "woman kneeling mulher ajoelhando kneel knees ajoelhada",
    group: "people",
  },
  {
    glyph: "🧎‍➡️",
    label: "person kneeling: facing right",
    labelPt: "pessoa ajoelhando: de frente para a direita",
    terms:
      "person kneeling facing right pessoa ajoelhando de frente para a direita kneel knees ajoelhado ajoelhar joelhos pedir por favor",
    group: "people",
  },
  {
    glyph: "🧎‍♀️‍➡️",
    label: "woman kneeling: facing right",
    labelPt: "mulher ajoelhando: de frente para a direita",
    terms:
      "woman kneeling facing right mulher ajoelhando de frente para a direita kneel knees ajoelhada",
    group: "people",
  },
  {
    glyph: "🧎‍♂️‍➡️",
    label: "man kneeling: facing right",
    labelPt: "homem ajoelhando: de frente para a direita",
    terms:
      "man kneeling facing right homem ajoelhando de frente para a direita kneel knees ajoelhado",
    group: "people",
  },
  {
    glyph: "🧑‍🦯",
    label: "person with white cane",
    labelPt: "pessoa com bengala para cego",
    terms:
      "person with white cane pessoa com bengala para cego accessibility blind probing acessibilidade",
    group: "people",
  },
  {
    glyph: "🧑‍🦯‍➡️",
    label: "person with white cane: facing right",
    labelPt: "pessoa com bengala para cego: de frente para a direita",
    terms:
      "person with white cane facing right pessoa com bengala para cego de frente a direita accessibility blind probing acessibilidade",
    group: "people",
  },
  {
    glyph: "👨‍🦯",
    label: "man with white cane",
    labelPt: "homem com bengala para cego",
    terms:
      "man with white cane homem com bengala para cego accessibility blind probing accessibilidade",
    group: "people",
  },
  {
    glyph: "👨‍🦯‍➡️",
    label: "man with white cane: facing right",
    labelPt: "homem com bengala para cego: de frente para a direita",
    terms:
      "man with white cane facing right homem com bengala para cego de frente a direita accessibility blind probing accessibilidade",
    group: "people",
  },
  {
    glyph: "👩‍🦯",
    label: "woman with white cane",
    labelPt: "mulher com bengala para cego",
    terms:
      "woman with white cane mulher com bengala para cego accessibility blind probing accessibilidade cega deficiencia visual",
    group: "people",
  },
  {
    glyph: "👩‍🦯‍➡️",
    label: "woman with white cane: facing right",
    labelPt: "mulher com bengala para cego: de frente para a direita",
    terms:
      "woman with white cane facing right mulher com bengala para cego de frente a direita accessibility blind probing accessibilidade cega deficiencia visual",
    group: "people",
  },
  {
    glyph: "🧑‍🦼",
    label: "person in motorized wheelchair",
    labelPt: "pessoa em cadeira de rodas motorizada",
    terms:
      "person in motorized wheelchair pessoa em cadeira de rodas motorizada accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "🧑‍🦼‍➡️",
    label: "person in motorized wheelchair: facing right",
    labelPt: "pessoa em cadeira de rodas motorizada: de frente para a direita",
    terms:
      "person in motorized wheelchair facing right pessoa em cadeira de rodas motorizada frente para a direita accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "👨‍🦼",
    label: "man in motorized wheelchair",
    labelPt: "homem em cadeira de rodas motorizada",
    terms:
      "man in motorized wheelchair homem em cadeira de rodas motorizada accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "👨‍🦼‍➡️",
    label: "man in motorized wheelchair: facing right",
    labelPt: "homem em cadeira de rodas motorizada: de frente para a direita",
    terms:
      "man in motorized wheelchair facing right homem em cadeira de rodas motorizada frente para a direita accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "👩‍🦼",
    label: "woman in motorized wheelchair",
    labelPt: "mulher em cadeira de rodas motorizada",
    terms:
      "woman in motorized wheelchair mulher em cadeira de rodas motorizada accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "👩‍🦼‍➡️",
    label: "woman in motorized wheelchair: facing right",
    labelPt: "mulher em cadeira de rodas motorizada: de frente para a direita",
    terms:
      "woman in motorized wheelchair facing right mulher em cadeira de rodas motorizada frente para a direita accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "🧑‍🦽",
    label: "person in manual wheelchair",
    labelPt: "pessoa em cadeira de rodas manual",
    terms:
      "person in manual wheelchair pessoa em cadeira de rodas accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "🧑‍🦽‍➡️",
    label: "person in manual wheelchair: facing right",
    labelPt: "pessoa em cadeira de rodas manual: de frente para a direita",
    terms:
      "person in manual wheelchair facing right pessoa em cadeira de rodas frente para a direita accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "👨‍🦽",
    label: "man in manual wheelchair",
    labelPt: "homem em cadeira de rodas manual",
    terms:
      "man in manual wheelchair homem em cadeira de rodas accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "👨‍🦽‍➡️",
    label: "man in manual wheelchair: facing right",
    labelPt: "homem em cadeira de rodas manual: de frente para a direita",
    terms:
      "man in manual wheelchair facing right homem em cadeira de rodas frente para a direita accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "👩‍🦽",
    label: "woman in manual wheelchair",
    labelPt: "mulher em cadeira de rodas manual",
    terms:
      "woman in manual wheelchair mulher em cadeira de rodas accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "👩‍🦽‍➡️",
    label: "woman in manual wheelchair: facing right",
    labelPt: "mulher em cadeira de rodas manual: de frente para a direita",
    terms:
      "woman in manual wheelchair facing right mulher em cadeira de rodas frente para a direita accessibility acessibilidade",
    group: "people",
  },
  {
    glyph: "🏃",
    label: "person running",
    labelPt: "pessoa correndo",
    terms:
      "person running pessoa correndo fast hurry marathon move quick race racing run rush speed correr corrida esporte maratona maratonista pressa",
    group: "people",
  },
  {
    glyph: "🏃‍♂️",
    label: "man running",
    labelPt: "homem correndo",
    terms:
      "man running homem correndo fast hurry marathon move quick race racing run rush speed corrida esporte maratona",
    group: "people",
  },
  {
    glyph: "🏃‍♀️",
    label: "woman running",
    labelPt: "mulher correndo",
    terms:
      "woman running mulher correndo fast hurry marathon move quick race racing run rush speed corredora corrida esporte garota guria maratona menina pressa rapida rapido",
    group: "people",
  },
  {
    glyph: "🏃‍➡️",
    label: "person running: facing right",
    labelPt: "pessoa correndo: de frente para a direita",
    terms:
      "person running facing right pessoa correndo de frente para a direita fast hurry marathon move quick race racing run rush speed correr corrida esporte maratona maratonista pressa",
    group: "people",
  },
  {
    glyph: "🏃‍♀️‍➡️",
    label: "woman running: facing right",
    labelPt: "mulher correndo: de frente para a direita",
    terms:
      "woman running facing right mulher correndo de frente para a direita fast hurry marathon move quick race racing run rush speed corredora corrida esporte garota guria maratona menina pressa rapida rapido",
    group: "people",
  },
  {
    glyph: "🏃‍♂️‍➡️",
    label: "man running: facing right",
    labelPt: "homem correndo: de frente para a direita",
    terms:
      "man running facing right homem correndo de frente para a direita fast hurry marathon move quick race racing run rush speed corrida esporte maratona",
    group: "people",
  },
  {
    glyph: "🧑‍🩰",
    label: "ballet dancer",
    labelPt: "bailarina",
    terms: "ballet dancer bailarina bailarino bale dancarina dancarino",
    group: "people",
  },
  {
    glyph: "💃",
    label: "woman dancing",
    labelPt: "mulher dançando",
    terms:
      "woman dancing mulher dancando dance dancer elegant festive flair flamenco groove lets salsa tango bailarina danca pessoas vamos dancar",
    group: "people",
  },
  {
    glyph: "🕺",
    label: "man dancing",
    labelPt: "homem dançando",
    terms:
      "man dancing homem dancando dance dancer elegant festive flair flamenco groove lets salsa tango",
    group: "people",
  },
  {
    glyph: "🕴️",
    label: "person in suit levitating",
    labelPt: "homem de terno levitando",
    terms: "person in suit levitating homem de terno levitando business",
    group: "people",
  },
  {
    glyph: "👯",
    label: "people with bunny ears",
    labelPt: "pessoas com orelhas de coelho",
    terms:
      "people with bunny ears pessoas com orelhas de coelho bestie bff counterpart dancer double ear identical pair party partying soulmate twin twinsies amigas dancar dancarinas festa gemeas melhores",
    group: "people",
  },
  {
    glyph: "👯‍♂️",
    label: "men with bunny ears",
    labelPt: "homens com orelhas de coelho",
    terms:
      "men with bunny ears homens com orelhas de coelho bestie bff counterpart dancer double ear identical pair party partying people soulmate twin twinsies dancarino festa homem meninos",
    group: "people",
  },
  {
    glyph: "👯‍♀️",
    label: "women with bunny ears",
    labelPt: "mulheres com orelhas de coelho",
    terms:
      "women with bunny ears mulheres com orelhas de coelho bestie bff counterpart dancer double ear identical pair party partying people soulmate twin twinsies dancarinas festa orelha",
    group: "people",
  },
  {
    glyph: "🧖",
    label: "person in steamy room",
    labelPt: "pessoa na sauna",
    terms:
      "person in steamy room pessoa na sauna day luxurious pamper relax spa steam steambath unwind banho homem mulher relaxar",
    group: "people",
  },
  {
    glyph: "🧖‍♂️",
    label: "man in steamy room",
    labelPt: "homem na sauna",
    terms:
      "man in steamy room homem na sauna day luxurious pamper relax spa steam steambath unwind",
    group: "people",
  },
  {
    glyph: "🧖‍♀️",
    label: "woman in steamy room",
    labelPt: "mulher na sauna",
    terms:
      "woman in steamy room mulher na sauna day luxurious pamper relax spa steam steambath unwind",
    group: "people",
  },
  {
    glyph: "🧗",
    label: "person climbing",
    labelPt: "pessoa escalando",
    terms:
      "person climbing pessoa escalando climb climber mountain rock scale up alpinista escalada escalar esporte montanha",
    group: "people",
  },
  {
    glyph: "🧗‍♂️",
    label: "man climbing",
    labelPt: "homem escalando",
    terms:
      "man climbing homem escalando climb climber mountain rock scale up escalar",
    group: "people",
  },
  {
    glyph: "🧗‍♀️",
    label: "woman climbing",
    labelPt: "mulher escalando",
    terms:
      "woman climbing mulher escalando climb climber mountain rock scale up escalar",
    group: "people",
  },
  {
    glyph: "🤺",
    label: "person fencing",
    labelPt: "esgrimista",
    terms:
      "person fencing esgrimista fencer sword esgrima espada esporte pessoa",
    group: "people",
  },
  {
    glyph: "🏇",
    label: "horse racing",
    labelPt: "corrida de cavalos",
    terms:
      "horse racing corrida de cavalos jockey racehorse riding sport cavalo esporte joquei",
    group: "people",
  },
  {
    glyph: "⛷️",
    label: "skier",
    labelPt: "esquiador",
    terms: "skier esquiador ski snow esporte esqui frio neve",
    group: "people",
  },
  {
    glyph: "🏂️",
    label: "snowboarder",
    labelPt: "praticante de snowboard",
    terms:
      "snowboarder praticante de snowboard ski snow sport esporte inverno neve",
    group: "people",
  },
  {
    glyph: "🏌️",
    label: "person golfing",
    labelPt: "golfista",
    terms:
      "person golfing golfista ball birdie caddy driving golf green pga putt range tee bola esporte golfe jogando",
    group: "people",
  },
  {
    glyph: "🏌️‍♂️",
    label: "man golfing",
    labelPt: "homem golfista",
    terms:
      "man golfing homem golfista ball birdie caddy driving golf green pga putt range tee golfe jogando",
    group: "people",
  },
  {
    glyph: "🏌️‍♀️",
    label: "woman golfing",
    labelPt: "mulher golfista",
    terms:
      "woman golfing mulher golfista ball birdie caddy driving golf green pga putt range tee bola esporte garota golfe menina",
    group: "people",
  },
  {
    glyph: "🏄️",
    label: "person surfing",
    labelPt: "surfista",
    terms:
      "person surfing surfista beach ocean sport surf surfer swell waves esporte onda ondas pessoa praia prancha",
    group: "people",
  },
  {
    glyph: "🏄‍♂️",
    label: "man surfing",
    labelPt: "homem surfista",
    terms:
      "man surfing homem surfista beach ocean sport surf surfer swell waves surfando",
    group: "people",
  },
  {
    glyph: "🏄‍♀️",
    label: "woman surfing",
    labelPt: "mulher surfista",
    terms:
      "woman surfing mulher surfista beach ocean person sport surf surfer swell waves esporte garota guria mar menina onda praia surfando surfe",
    group: "people",
  },
  {
    glyph: "🚣",
    label: "person rowing boat",
    labelPt: "pessoa remando",
    terms:
      "person rowing boat pessoa remando canoe cruise fishing lake oar paddle raft river row rowboat barco bote canoa mar oceano remo rio",
    group: "people",
  },
  {
    glyph: "🚣‍♂️",
    label: "man rowing boat",
    labelPt: "homem remando",
    terms:
      "man rowing boat homem remando canoe cruise fishing lake oar paddle raft river row rowboat esporte remador remo",
    group: "people",
  },
  {
    glyph: "🚣‍♀️",
    label: "woman rowing boat",
    labelPt: "mulher remando",
    terms:
      "woman rowing boat mulher remando canoe cruise fishing lake oar paddle raft river row rowboat barco caiaque canoa esporte garota menina pescaria remadora remo rio",
    group: "people",
  },
  {
    glyph: "🏊️",
    label: "person swimming",
    labelPt: "pessoa nadando",
    terms:
      "person swimming pessoa nadando freestyle sport swim swimmer triathlon esporte nadar natacao olimpiada triatlo",
    group: "people",
  },
  {
    glyph: "🏊‍♂️",
    label: "man swimming",
    labelPt: "homem nadando",
    terms:
      "man swimming homem nadando freestyle sport swim swimmer triathlon nadar natacao",
    group: "people",
  },
  {
    glyph: "🏊‍♀️",
    label: "woman swimming",
    labelPt: "mulher nadando",
    terms:
      "woman swimming mulher nadando freestyle man sport swim swimmer triathlon esporte homem nadadora nado natacao olimpiada triatlo",
    group: "people",
  },
  {
    glyph: "⛹️",
    label: "person bouncing ball",
    labelPt: "pessoa jogando basquete",
    terms:
      "person bouncing ball pessoa jogando basquete athletic basketball championship dribble net player throw arremesso atleta bater bola cesta esporte jogador lance livre",
    group: "people",
  },
  {
    glyph: "⛹️‍♂️",
    label: "man bouncing ball",
    labelPt: "homem jogando basquete",
    terms:
      "man bouncing ball homem jogando basquete athletic basketball championship dribble net player throw bola esporte",
    group: "people",
  },
  {
    glyph: "⛹️‍♀️",
    label: "woman bouncing ball",
    labelPt: "mulher jogando basquete",
    terms:
      "woman bouncing ball mulher jogando basquete athletic basketball championship dribble net player throw bola esporte garota jogadora jogo menina",
    group: "people",
  },
  {
    glyph: "🏋️",
    label: "person lifting weights",
    labelPt: "pessoa levantando peso",
    terms:
      "person lifting weights pessoa levantando peso barbell bodybuilder deadlift lifter powerlifting weight weightlifter workout esporte fisiculturista forca levantar",
    group: "people",
  },
  {
    glyph: "🏋️‍♂️",
    label: "man lifting weights",
    labelPt: "homem levantando peso",
    terms:
      "man lifting weights homem levantando peso barbell bodybuilder deadlift lifter powerlifting weight weightlifter workout esporte forca",
    group: "people",
  },
  {
    glyph: "🏋️‍♀️",
    label: "woman lifting weights",
    labelPt: "mulher levantando peso",
    terms:
      "woman lifting weights mulher levantando peso barbell bodybuilder deadlift lifter powerlifting weight weightlifter workout esporte forca garota guria levantadora de levantar malhar menina",
    group: "people",
  },
  {
    glyph: "🚴",
    label: "person biking",
    labelPt: "ciclista",
    terms:
      "person biking ciclista bicycle bicyclist bike cycle cyclist riding sport bicicleta ciclismo esporte pedalar",
    group: "people",
  },
  {
    glyph: "🚴‍♂️",
    label: "man biking",
    labelPt: "homem ciclista",
    terms:
      "man biking homem ciclista bicycle bicyclist bike cycle cyclist riding sport bicicleta esporte passeio",
    group: "people",
  },
  {
    glyph: "🚴‍♀️",
    label: "woman biking",
    labelPt: "mulher ciclista",
    terms:
      "woman biking mulher ciclista bicycle bicyclist bike cycle cyclist riding sport bicicleta ciclismo esporte garota guria menina passeio pedalando pedalar",
    group: "people",
  },
  {
    glyph: "🚵",
    label: "person mountain biking",
    labelPt: "pessoa fazendo mountain bike",
    terms:
      "person mountain biking pessoa fazendo bike bicycle bicyclist cycle cyclist riding sport bicicleta ciclismo ciclista esporte montanha pedalando trilha",
    group: "people",
  },
  {
    glyph: "🚵‍♂️",
    label: "man mountain biking",
    labelPt: "homem fazendo mountain bike",
    terms:
      "man mountain biking homem fazendo bike bicycle bicyclist cycle cyclist riding sport bicicleta ciclista",
    group: "people",
  },
  {
    glyph: "🚵‍♀️",
    label: "woman mountain biking",
    labelPt: "mulher fazendo mountain bike",
    terms:
      "woman mountain biking mulher fazendo bike bicycle bicyclist cycle cyclist riding sport bicicleta ciclista esporte garota guria menina montanha pedalar",
    group: "people",
  },
  {
    glyph: "🤸",
    label: "person cartwheeling",
    labelPt: "pessoa fazendo estrela",
    terms:
      "person cartwheeling pessoa fazendo estrela active cartwheel excited flip gymnastics happy somersault animada animado esporte estrelinha feliz ginasta ginastica",
    group: "people",
  },
  {
    glyph: "🤸‍♂️",
    label: "man cartwheeling",
    labelPt: "homem fazendo estrela",
    terms:
      "man cartwheeling homem fazendo estrela active cartwheel excited flip gymnastics happy somersault animado esporte estrelinha feliz ginastica menino virar",
    group: "people",
  },
  {
    glyph: "🤸‍♀️",
    label: "woman cartwheeling",
    labelPt: "mulher fazendo estrela",
    terms:
      "woman cartwheeling mulher fazendo estrela active cartwheel excited flip gymnastics happy somersault animada esporte feliz ginasta ginastica menina virar",
    group: "people",
  },
  {
    glyph: "🤼",
    label: "people wrestling",
    labelPt: "pessoas lutando",
    terms:
      "people wrestling pessoas lutando combat duel grapple ring tournament wrestle combate esporte greco-romana livre luta lutador pessoa torneio",
    group: "people",
  },
  {
    glyph: "🤼‍♂️",
    label: "men wrestling",
    labelPt: "homens lutando",
    terms:
      "men wrestling homens lutando combat duel grapple ring tournament wrestle combate esporte greco-romana homem livre luta lutador torneio",
    group: "people",
  },
  {
    glyph: "🤼‍♀️",
    label: "women wrestling",
    labelPt: "mulheres lutando",
    terms:
      "women wrestling mulheres lutando combat duel grapple ring tournament wrestle combate esporte greco-romana livre luta lutadora mulher torneio",
    group: "people",
  },
  {
    glyph: "🤽",
    label: "person playing water polo",
    labelPt: "pessoa jogando polo aquático",
    terms:
      "person playing water polo pessoa jogando aquatico sport swimming waterpolo competicao esporte piscina",
    group: "people",
  },
  {
    glyph: "🤽‍♂️",
    label: "man playing water polo",
    labelPt: "homem jogando polo aquático",
    terms:
      "man playing water polo homem jogando aquatico sport swimming waterpolo esporte jogador piscina",
    group: "people",
  },
  {
    glyph: "🤽‍♀️",
    label: "woman playing water polo",
    labelPt: "mulher jogando polo aquático",
    terms:
      "woman playing water polo mulher jogando aquatico sport swimming waterpolo esporte jogadora menina piscina",
    group: "people",
  },
  {
    glyph: "🤾",
    label: "person playing handball",
    labelPt: "handebol",
    terms:
      "person playing handball handebol athletics ball catch chuck hurl lob pitch sport throw toss atleta bola esporte gol jogador passe pessoa",
    group: "people",
  },
  {
    glyph: "🤾‍♂️",
    label: "man playing handball",
    labelPt: "jogador de handebol",
    terms:
      "man playing handball jogador de handebol athletics ball catch chuck hurl lob pitch sport throw toss bola esporte homem jogando menino quadra",
    group: "people",
  },
  {
    glyph: "🤾‍♀️",
    label: "woman playing handball",
    labelPt: "jogadora de handebol",
    terms:
      "woman playing handball jogadora de handebol athletics ball catch chuck hurl lob pitch sport throw toss bola esporte gol jogando menina mulher passe quadra",
    group: "people",
  },
  {
    glyph: "🤹",
    label: "person juggling",
    labelPt: "malabarista",
    terms:
      "person juggling malabarista act balance balancing handle juggle manage multitask skill equilibrio habilidade malabares malabarismo multitarefa",
    group: "people",
  },
  {
    glyph: "🤹‍♂️",
    label: "man juggling",
    labelPt: "homem malabarista",
    terms:
      "man juggling homem malabarista act balance balancing handle juggle manage multitask skill equilibrio habilidade malabares malabarismo multitarefa",
    group: "people",
  },
  {
    glyph: "🤹‍♀️",
    label: "woman juggling",
    labelPt: "mulher malabarista",
    terms:
      "woman juggling mulher malabarista act balance balancing handle juggle manage multitask skill equilibrio habilidade malabarismo multitarefa",
    group: "people",
  },
  {
    glyph: "🧘",
    label: "person in lotus position",
    labelPt: "pessoa na posição de lótus",
    terms:
      "person in lotus position pessoa na posicao de cross legged legs meditation peace relax serenity yoga yogi zen cruzadas ioga meditacao pernas postura relaxar serenidade",
    group: "people",
  },
  {
    glyph: "🧘‍♂️",
    label: "man in lotus position",
    labelPt: "homem na posição de lótus",
    terms:
      "man in lotus position homem na posicao de cross legged legs meditation peace relax serenity yoga yogi zen ioga meditacao",
    group: "people",
  },
  {
    glyph: "🧘‍♀️",
    label: "woman in lotus position",
    labelPt: "mulher na posição de lótus",
    terms:
      "woman in lotus position mulher na posicao de cross legged legs meditation peace relax serenity yoga yogi zen ioga meditacao",
    group: "people",
  },
  {
    glyph: "🛀",
    label: "person taking bath",
    labelPt: "pessoa tomando banho",
    terms:
      "person taking bath pessoa tomando banho bathtub tub banheira espuma agua",
    group: "people",
  },
  {
    glyph: "🛌",
    label: "person in bed",
    labelPt: "pessoa deitada na cama",
    terms:
      "person in bed pessoa deitada na cama bedtime good goodnight hotel nap night sleep tired zzz boa cochilo dormindo dormir noite soneca sono",
    group: "people",
  },
  {
    glyph: "🧑‍🤝‍🧑",
    label: "people holding hands",
    labelPt: "pessoas de mãos dadas",
    terms:
      "people holding hands pessoas de maos dadas bae bestie bff couple dating flirt friends hand hold twins amigos casal gemeos parceiros parceria pessoa",
    group: "people",
  },
  {
    glyph: "👭",
    label: "women holding hands",
    labelPt: "duas mulheres de mãos dadas",
    terms:
      "women holding hands duas mulheres de maos dadas bae bestie bff couple dating flirt friends girls hand hold sisters twins amigas casal gemeas parceiras parceria pessoa",
    group: "people",
  },
  {
    glyph: "👫",
    label: "woman and man holding hands",
    labelPt: "homem e mulher de mãos dadas",
    terms:
      "woman and man holding hands homem e mulher de maos dadas bae bestie bff couple dating flirt friends hand hold twins amigos casal pessoas",
    group: "people",
  },
  {
    glyph: "👬",
    label: "men holding hands",
    labelPt: "dois homens de mãos dadas",
    terms:
      "men holding hands dois homens de maos dadas bae bestie bff boys brothers couple dating flirt friends hand hold twins amigos casal gemeos homem irmaos namorados pessoas",
    group: "people",
  },
  {
    glyph: "💏",
    label: "kiss",
    labelPt: "beijo",
    terms:
      "kiss beijo anniversary babe bae couple date dating heart love mwah person romance together xoxo amor beijar casal coracao pessoas",
    group: "people",
  },
  {
    glyph: "👩‍❤️‍💋‍👨",
    label: "kiss: woman, man",
    labelPt: "beijo: mulher e homem",
    terms:
      "kiss woman man beijo mulher e homem anniversary babe bae couple date dating heart love mwah person romance together xoxo amor beijar casal coracao pessoas",
    group: "people",
  },
  {
    glyph: "👨‍❤️‍💋‍👨",
    label: "kiss: man, man",
    labelPt: "beijo: homem e homem",
    terms:
      "kiss man beijo homem e anniversary babe bae couple date dating heart love mwah person romance together xoxo amor beijar casal coracao pessoas",
    group: "people",
  },
  {
    glyph: "👩‍❤️‍💋‍👩",
    label: "kiss: woman, woman",
    labelPt: "beijo: mulher e mulher",
    terms:
      "kiss woman beijo mulher e anniversary babe bae couple date dating heart love mwah person romance together xoxo amor beijar casal coracao pessoas",
    group: "people",
  },
  {
    glyph: "💑",
    label: "couple with heart",
    labelPt: "casal apaixonado",
    terms:
      "couple with heart casal apaixonado anniversary babe bae dating kiss love person relationship romance together you com um coracao pessoas",
    group: "people",
  },
  {
    glyph: "👩‍❤️‍👨",
    label: "couple with heart: woman, man",
    labelPt: "casal apaixonado: mulher e homem",
    terms:
      "couple with heart woman man casal apaixonado mulher e homem anniversary babe bae dating kiss love person relationship romance together you com um coracao pessoas",
    group: "people",
  },
  {
    glyph: "👨‍❤️‍👨",
    label: "couple with heart: man, man",
    labelPt: "casal apaixonado: homem e homem",
    terms:
      "couple with heart man casal apaixonado homem e anniversary babe bae dating kiss love person relationship romance together you com um coracao pessoas",
    group: "people",
  },
  {
    glyph: "👩‍❤️‍👩",
    label: "couple with heart: woman, woman",
    labelPt: "casal apaixonado: mulher e mulher",
    terms:
      "couple with heart woman casal apaixonado mulher e anniversary babe bae dating kiss love person relationship romance together you com um coracao pessoas",
    group: "people",
  },
  {
    glyph: "👨‍👩‍👦",
    label: "family: man, woman, boy",
    labelPt: "família: homem, mulher e menino",
    terms:
      "family man woman boy familia homem mulher e menino child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👩‍👧",
    label: "family: man, woman, girl",
    labelPt: "família: homem, mulher e menina",
    terms:
      "family man woman girl familia homem mulher e menina child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👩‍👧‍👦",
    label: "family: man, woman, girl, boy",
    labelPt: "família: homem, mulher, menina e menino",
    terms:
      "family man woman girl boy familia homem mulher menina e menino child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👩‍👦‍👦",
    label: "family: man, woman, boy, boy",
    labelPt: "família: homem, mulher, menino e menino",
    terms:
      "family man woman boy familia homem mulher menino e child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👩‍👧‍👧",
    label: "family: man, woman, girl, girl",
    labelPt: "família: homem, mulher, menina e menina",
    terms:
      "family man woman girl familia homem mulher menina e child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👨‍👦",
    label: "family: man, man, boy",
    labelPt: "família: homem, homem e menino",
    terms:
      "family man boy familia homem e menino child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👨‍👧",
    label: "family: man, man, girl",
    labelPt: "família: homem, homem e menina",
    terms:
      "family man girl familia homem e menina child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👨‍👧‍👦",
    label: "family: man, man, girl, boy",
    labelPt: "família: homem, homem, menina e menino",
    terms:
      "family man girl boy familia homem menina e menino child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👨‍👦‍👦",
    label: "family: man, man, boy, boy",
    labelPt: "família: homem, homem, menino e menino",
    terms:
      "family man boy familia homem menino e child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👨‍👧‍👧",
    label: "family: man, man, girl, girl",
    labelPt: "família: homem, homem, menina e menina",
    terms:
      "family man girl familia homem menina e child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👩‍👩‍👦",
    label: "family: woman, woman, boy",
    labelPt: "família: mulher, mulher e menino",
    terms:
      "family woman boy familia mulher e menino child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👩‍👩‍👧",
    label: "family: woman, woman, girl",
    labelPt: "família: mulher, mulher e menina",
    terms:
      "family woman girl familia mulher e menina child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👩‍👩‍👧‍👦",
    label: "family: woman, woman, girl, boy",
    labelPt: "família: mulher, mulher, menina e menino",
    terms:
      "family woman girl boy familia mulher menina e menino child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👩‍👩‍👦‍👦",
    label: "family: woman, woman, boy, boy",
    labelPt: "família: mulher, mulher, menino e menino",
    terms:
      "family woman boy familia mulher menino e child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👩‍👩‍👧‍👧",
    label: "family: woman, woman, girl, girl",
    labelPt: "família: mulher, mulher, menina e menina",
    terms:
      "family woman girl familia mulher menina e child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👦",
    label: "family: man, boy",
    labelPt: "família: homem e menino",
    terms:
      "family man boy familia homem e menino child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👦‍👦",
    label: "family: man, boy, boy",
    labelPt: "família: homem, menino e menino",
    terms:
      "family man boy familia homem menino e child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👧",
    label: "family: man, girl",
    labelPt: "família: homem e menina",
    terms:
      "family man girl familia homem e menina child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👧‍👦",
    label: "family: man, girl, boy",
    labelPt: "família: homem, menina e menino",
    terms:
      "family man girl boy familia homem menina e menino child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👨‍👧‍👧",
    label: "family: man, girl, girl",
    labelPt: "família: homem, menina e menina",
    terms:
      "family man girl familia homem menina e child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👩‍👦",
    label: "family: woman, boy",
    labelPt: "família: mulher e menino",
    terms:
      "family woman boy familia mulher e menino child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👩‍👦‍👦",
    label: "family: woman, boy, boy",
    labelPt: "família: mulher, menino e menino",
    terms:
      "family woman boy familia mulher menino e child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👩‍👧",
    label: "family: woman, girl",
    labelPt: "família: mulher e menina",
    terms:
      "family woman girl familia mulher e menina child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👩‍👧‍👦",
    label: "family: woman, girl, boy",
    labelPt: "família: mulher, menina e menino",
    terms:
      "family woman girl boy familia mulher menina e menino child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "👩‍👧‍👧",
    label: "family: woman, girl, girl",
    labelPt: "família: mulher, menina e menina",
    terms:
      "family woman girl familia mulher menina e child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "🗣️",
    label: "speaking head",
    labelPt: "silhueta falando",
    terms:
      "speaking head silhueta falando face silhouette speak berro cabeca grito voz",
    group: "people",
  },
  {
    glyph: "👤",
    label: "bust in silhouette",
    labelPt: "silhueta de busto",
    terms:
      "bust in silhouette silhueta de busto mysterious shadow misterio pessoas sombra",
    group: "people",
  },
  {
    glyph: "👥",
    label: "busts in silhouette",
    labelPt: "silhueta de bustos",
    terms:
      "busts in silhouette silhueta de bustos bff bust everyone friend friends people amigos busto dupla pessoas",
    group: "people",
  },
  {
    glyph: "🫂",
    label: "people hugging",
    labelPt: "pessoas se abraçando",
    terms:
      "people hugging pessoas se abracando comfort embrace farewell friendship goodbye hello hug love thanks abraco adeus amizade amor carinho conforto obrigado ola",
    group: "people",
  },
  {
    glyph: "👪️",
    label: "family",
    labelPt: "família",
    terms: "family familia child filho mae pai pessoas um",
    group: "people",
  },
  {
    glyph: "🧑‍🧑‍🧒",
    label: "family: adult, adult, child",
    labelPt: "família: adulto, adulto, criança",
    terms: "family adult child familia adulto crianca",
    group: "people",
  },
  {
    glyph: "🧑‍🧑‍🧒‍🧒",
    label: "family: adult, adult, child, child",
    labelPt: "família: adulto, adulto, criança, criança",
    terms:
      "family adult child familia adulto crianca adultos criancas filha filho",
    group: "people",
  },
  {
    glyph: "🧑‍🧒",
    label: "family: adult, child",
    labelPt: "família: adulto, criança",
    terms: "family adult child familia adulto crianca",
    group: "people",
  },
  {
    glyph: "🧑‍🧒‍🧒",
    label: "family: adult, child, child",
    labelPt: "família: adulto, criança, criança",
    terms: "family adult child familia adulto crianca criancas",
    group: "people",
  },
  {
    glyph: "👣",
    label: "footprints",
    labelPt: "pegadas",
    terms:
      "footprints pegadas barefoot clothing footprint omw print walk corpo gravura pe pes descalcos rastro",
    group: "people",
  },
  {
    glyph: "🫆",
    label: "fingerprint",
    labelPt: "impressão digital",
    terms:
      "fingerprint impressao digital clue crime detective forensics identity mystery print safety trace identidade investigacao forense seguranca",
    group: "people",
  },
  {
    glyph: "🐵",
    label: "monkey face",
    labelPt: "rosto de macaco",
    terms: "monkey face rosto de macaco animal banana",
    group: "animals",
  },
  {
    glyph: "🐒",
    label: "monkey",
    labelPt: "macaco",
    terms: "monkey macaco animal banana",
    group: "animals",
  },
  {
    glyph: "🦍",
    label: "gorilla",
    labelPt: "gorila",
    terms: "gorilla gorila animal macaco",
    group: "animals",
  },
  {
    glyph: "🦧",
    label: "orangutan",
    labelPt: "orangotango",
    terms: "orangutan orangotango animal ape monkey macaco primata",
    group: "animals",
  },
  {
    glyph: "🐶",
    label: "dog face",
    labelPt: "rosto de cachorro",
    terms: "dog face rosto de cachorro adorbs animal pet puppies puppy",
    group: "animals",
  },
  {
    glyph: "🐕️",
    label: "dog",
    labelPt: "cachorro",
    terms: "dog cachorro animal animals dogs pet cao",
    group: "animals",
  },
  {
    glyph: "🦮",
    label: "guide dog",
    labelPt: "cão-guia",
    terms:
      "guide dog cao-guia accessibility animal blind acessibilidade cachorro cadela cega cego cegueira cao deficiencia visual guia labrador",
    group: "animals",
  },
  {
    glyph: "🐕‍🦺",
    label: "service dog",
    labelPt: "cão de serviço",
    terms:
      "service dog cao de servico accessibility animal assistance accessibilidade assistencia cachorro cadela cao-guia pastor alemao",
    group: "animals",
  },
  {
    glyph: "🐩",
    label: "poodle",
    labelPt: "poodle",
    terms: "poodle animal dog fluffy cachorro",
    group: "animals",
  },
  {
    glyph: "🐺",
    label: "wolf",
    labelPt: "rosto de lobo",
    terms: "wolf rosto de lobo animal face",
    group: "animals",
  },
  {
    glyph: "🦊",
    label: "fox",
    labelPt: "rosto de raposa",
    terms: "fox rosto de raposa animal face bicho",
    group: "animals",
  },
  {
    glyph: "🦝",
    label: "raccoon",
    labelPt: "guaxinim",
    terms: "raccoon guaxinim animal curious sly astuto curioso travesso",
    group: "animals",
  },
  {
    glyph: "🐱",
    label: "cat face",
    labelPt: "rosto de gato",
    terms: "cat face rosto de gato animal kitten kitty pet felino gatinho",
    group: "animals",
  },
  {
    glyph: "🐈️",
    label: "cat",
    labelPt: "gato",
    terms: "cat gato animal animals cats kitten pet felino",
    group: "animals",
  },
  {
    glyph: "🐈‍⬛",
    label: "black cat",
    labelPt: "gato preto",
    terms:
      "black cat gato preto animal feline halloween meow unlucky azar dia das bruxas felino gata miado miau",
    group: "animals",
  },
  {
    glyph: "🦁",
    label: "lion",
    labelPt: "rosto de leão",
    terms:
      "lion rosto de leao alpha animal face leo mane order rawr roar safari strong zodiac zodiaco",
    group: "animals",
  },
  {
    glyph: "🐯",
    label: "tiger face",
    labelPt: "rosto de tigre",
    terms: "tiger face rosto de tigre animal big cat predator",
    group: "animals",
  },
  {
    glyph: "🐅",
    label: "tiger",
    labelPt: "tigre",
    terms: "tiger tigre animal big cat predator zoo",
    group: "animals",
  },
  {
    glyph: "🐆",
    label: "leopard",
    labelPt: "leopardo",
    terms: "leopard leopardo animal big cat predator zoo onca",
    group: "animals",
  },
  {
    glyph: "🐴",
    label: "horse face",
    labelPt: "rosto de cavalo",
    terms:
      "horse face rosto de cavalo animal dressage equine farm horses equino",
    group: "animals",
  },
  {
    glyph: "🫎",
    label: "moose",
    labelPt: "alce",
    terms:
      "moose alce alces animal antlers elk mammal cervo chifres galhada mamifero rena",
    group: "animals",
  },
  {
    glyph: "🫏",
    label: "donkey",
    labelPt: "burro",
    terms:
      "donkey burro animal ass hinny mammal mule stubborn animais asno jegue mamifero mula relinchar relincho teimosa teimoso",
    group: "animals",
  },
  {
    glyph: "🐎",
    label: "horse",
    labelPt: "cavalo",
    terms:
      "horse cavalo animal equestrian farm racehorse racing corrida equestre",
    group: "animals",
  },
  {
    glyph: "🦄",
    label: "unicorn",
    labelPt: "rosto de unicórnio",
    terms: "unicorn rosto de unicornio face animal",
    group: "animals",
  },
  {
    glyph: "🦓",
    label: "zebra",
    labelPt: "zebra",
    terms: "zebra animal stripe listra listras",
    group: "animals",
  },
  {
    glyph: "🦌",
    label: "deer",
    labelPt: "cervo",
    terms: "deer cervo animal veado",
    group: "animals",
  },
  {
    glyph: "🦬",
    label: "bison",
    labelPt: "bisão",
    terms: "bison bisao animal buffalo herd wisent bisonte bufalo rebanho",
    group: "animals",
  },
  {
    glyph: "🐮",
    label: "cow face",
    labelPt: "rosto de vaca",
    terms:
      "cow face rosto de vaca animal farm milk moo fazenda leite muuu vaquinha",
    group: "animals",
  },
  {
    glyph: "🐂",
    label: "ox",
    labelPt: "boi",
    terms: "ox boi animal animals bull farm taurus zodiac touro zodiaco",
    group: "animals",
  },
  {
    glyph: "🐃",
    label: "water buffalo",
    labelPt: "búfalo-asiático",
    terms: "water buffalo bufalo-asiatico animal zoo bufalo agua",
    group: "animals",
  },
  {
    glyph: "🐄",
    label: "cow",
    labelPt: "vaca",
    terms: "cow vaca animal animals farm milk moo fazenda",
    group: "animals",
  },
  {
    glyph: "🐷",
    label: "pig face",
    labelPt: "rosto de porco",
    terms: "pig face rosto de porco animal bacon farm pork",
    group: "animals",
  },
  {
    glyph: "🐖",
    label: "pig",
    labelPt: "porco",
    terms: "pig porco animal bacon farm pork sow",
    group: "animals",
  },
  {
    glyph: "🐗",
    label: "boar",
    labelPt: "javali",
    terms: "boar javali animal pig",
    group: "animals",
  },
  {
    glyph: "🐽",
    label: "pig nose",
    labelPt: "nariz de porco",
    terms: "pig nose nariz de porco animal face farm smell snout rosto",
    group: "animals",
  },
  {
    glyph: "🐏",
    label: "ram",
    labelPt: "carneiro",
    terms:
      "ram carneiro animal aries horns male sheep zodiac zoo chifre zodiaco",
    group: "animals",
  },
  {
    glyph: "🐑",
    label: "ewe",
    labelPt: "ovelha",
    terms:
      "ewe ovelha animal baa farm female fluffy lamb sheep wool fazenda la",
    group: "animals",
  },
  {
    glyph: "🐐",
    label: "goat",
    labelPt: "cabra",
    terms:
      "goat cabra animal capricorn farm milk zodiac bode capricornio zodiaco",
    group: "animals",
  },
  {
    glyph: "🐪",
    label: "camel",
    labelPt: "camelo",
    terms:
      "camel camelo animal desert dromedary hump one de uma so corcova deserto dromedario",
    group: "animals",
  },
  {
    glyph: "🐫",
    label: "two-hump camel",
    labelPt: "camelo com duas corcovas",
    terms:
      "two-hump camel camelo com duas corcovas animal bactrian desert hump two asiatico corcova deserto",
    group: "animals",
  },
  {
    glyph: "🦙",
    label: "llama",
    labelPt: "lhama",
    terms: "llama lhama alpaca animal guanaco vicuna wool la vicunha",
    group: "animals",
  },
  {
    glyph: "🦒",
    label: "giraffe",
    labelPt: "girafa",
    terms: "giraffe girafa animal spots",
    group: "animals",
  },
  {
    glyph: "🐘",
    label: "elephant",
    labelPt: "elefante",
    terms: "elephant elefante animal",
    group: "animals",
  },
  {
    glyph: "🦣",
    label: "mammoth",
    labelPt: "mamute",
    terms:
      "mammoth mamute animal extinction large tusk wooly extinto grande lanoso presa pre-historico",
    group: "animals",
  },
  {
    glyph: "🦏",
    label: "rhinoceros",
    labelPt: "rinoceronte",
    terms: "rhinoceros rinoceronte animal",
    group: "animals",
  },
  {
    glyph: "🦛",
    label: "hippopotamus",
    labelPt: "hipopótamo",
    terms: "hippopotamus hipopotamo animal hippo",
    group: "animals",
  },
  {
    glyph: "🐭",
    label: "mouse face",
    labelPt: "rosto de camundongo",
    terms: "mouse face rosto de camundongo animal ratinho rato",
    group: "animals",
  },
  {
    glyph: "🐁",
    label: "mouse",
    labelPt: "camundongo",
    terms: "mouse camundongo animal animals ratinho",
    group: "animals",
  },
  {
    glyph: "🐀",
    label: "rat",
    labelPt: "rato",
    terms: "rat rato animal ratazana",
    group: "animals",
  },
  {
    glyph: "🐹",
    label: "hamster",
    labelPt: "rosto de hamster",
    terms: "hamster rosto de animal face pet",
    group: "animals",
  },
  {
    glyph: "🐰",
    label: "rabbit face",
    labelPt: "rosto de coelho",
    terms: "rabbit face rosto de coelho animal bunny pet",
    group: "animals",
  },
  {
    glyph: "🐇",
    label: "rabbit",
    labelPt: "coelho",
    terms: "rabbit coelho animal bunny pet coelhinho da pascoa",
    group: "animals",
  },
  {
    glyph: "🐿️",
    label: "chipmunk",
    labelPt: "esquilo",
    terms: "chipmunk esquilo animal squirrel",
    group: "animals",
  },
  {
    glyph: "🦫",
    label: "beaver",
    labelPt: "castor",
    terms: "beaver castor animal dam teeth dentuco represa",
    group: "animals",
  },
  {
    glyph: "🦔",
    label: "hedgehog",
    labelPt: "porco-espinho",
    terms: "hedgehog porco-espinho animal spiny espinhoso ourico",
    group: "animals",
  },
  {
    glyph: "🦇",
    label: "bat",
    labelPt: "morcego",
    terms: "bat morcego animal vampire vampiro",
    group: "animals",
  },
  {
    glyph: "🐻",
    label: "bear",
    labelPt: "rosto de urso",
    terms: "bear rosto de urso animal face grizzly growl honey",
    group: "animals",
  },
  {
    glyph: "🐻‍❄️",
    label: "polar bear",
    labelPt: "urso polar",
    terms: "polar bear urso animal arctic white branco artico",
    group: "animals",
  },
  {
    glyph: "🐨",
    label: "koala",
    labelPt: "coala",
    terms: "koala coala animal australia bear down face marsupial under",
    group: "animals",
  },
  {
    glyph: "🐼",
    label: "panda",
    labelPt: "rosto de panda",
    terms: "panda rosto de animal bamboo face",
    group: "animals",
  },
  {
    glyph: "🦥",
    label: "sloth",
    labelPt: "preguiça",
    terms:
      "sloth preguica lazy slow bicho-preguica devagar lenta lentidao preguicosa preguicoso",
    group: "animals",
  },
  {
    glyph: "🦦",
    label: "otter",
    labelPt: "lontra",
    terms: "otter lontra animal fishing playful brincalhona pesca",
    group: "animals",
  },
  {
    glyph: "🦨",
    label: "skunk",
    labelPt: "gambá",
    terms: "skunk gamba animal stink fedida fedido fedor",
    group: "animals",
  },
  {
    glyph: "🦘",
    label: "kangaroo",
    labelPt: "canguru",
    terms:
      "kangaroo canguru animal joey jump marsupial australia filhote pula pulo salto",
    group: "animals",
  },
  {
    glyph: "🦡",
    label: "badger",
    labelPt: "texugo",
    terms: "badger texugo animal honey pester incomodar ratel de mel",
    group: "animals",
  },
  {
    glyph: "🐾",
    label: "paw prints",
    labelPt: "patas",
    terms:
      "paw prints patas feet paws print animal pata patinhas de cachorro pegada",
    group: "animals",
  },
  {
    glyph: "🦃",
    label: "turkey",
    labelPt: "peru",
    terms: "turkey peru bird gobble thanksgiving animal ave de natal",
    group: "animals",
  },
  {
    glyph: "🐔",
    label: "chicken",
    labelPt: "galinha",
    terms: "chicken galinha animal bird ornithology ave",
    group: "animals",
  },
  {
    glyph: "🐓",
    label: "rooster",
    labelPt: "galo",
    terms: "rooster galo animal bird ornithology ave",
    group: "animals",
  },
  {
    glyph: "🐣",
    label: "hatching chick",
    labelPt: "pintinho chocando",
    terms:
      "hatching chick pintinho chocando animal baby bird egg ave bebe filhote galinha pinto",
    group: "animals",
  },
  {
    glyph: "🐤",
    label: "baby chick",
    labelPt: "pintinho de perfil",
    terms:
      "baby chick pintinho de perfil animal bird ornithology ave bebe filhote galinha pinto rosto",
    group: "animals",
  },
  {
    glyph: "🐥",
    label: "front-facing baby chick",
    labelPt: "pintinho de frente",
    terms:
      "front-facing baby chick pintinho de frente animal bird newborn ornithology ave bebe fihote galinha olhando para pinto",
    group: "animals",
  },
  {
    glyph: "🐦️",
    label: "bird",
    labelPt: "pássaro",
    terms: "bird passaro animal ornithology",
    group: "animals",
  },
  {
    glyph: "🐧",
    label: "penguin",
    labelPt: "pinguim",
    terms: "penguin pinguim animal antarctica bird ornithology antartica frio",
    group: "animals",
  },
  {
    glyph: "🕊️",
    label: "dove",
    labelPt: "pomba branca",
    terms:
      "dove pomba branca bird fly ornithology peace animal ave paz passaro",
    group: "animals",
  },
  {
    glyph: "🦅",
    label: "eagle",
    labelPt: "águia",
    terms: "eagle aguia animal bird ornithology passaro",
    group: "animals",
  },
  {
    glyph: "🦆",
    label: "duck",
    labelPt: "pato",
    terms: "duck pato animal bird ornithology passaro",
    group: "animals",
  },
  {
    glyph: "🦢",
    label: "swan",
    labelPt: "cisne",
    terms:
      "swan cisne animal bird cygnet duckling ornithology ugly ave patinho feio passaro",
    group: "animals",
  },
  {
    glyph: "🦉",
    label: "owl",
    labelPt: "coruja",
    terms: "owl coruja animal bird ornithology wise passaro sabedoria",
    group: "animals",
  },
  {
    glyph: "🦤",
    label: "dodo",
    labelPt: "dodô",
    terms:
      "dodo animal bird extinction large ornithology ave extinto grande mauricio passaro",
    group: "animals",
  },
  {
    glyph: "🪶",
    label: "feather",
    labelPt: "pena",
    terms: "feather pena bird flight light plumage leve plumagem passaro voo",
    group: "animals",
  },
  {
    glyph: "🦩",
    label: "flamingo",
    labelPt: "flamingo",
    terms:
      "flamingo animal bird flamboyant ornithology tropical ave extravagante",
    group: "animals",
  },
  {
    glyph: "🦚",
    label: "peacock",
    labelPt: "pavão",
    terms:
      "peacock pavao animal bird colorful ornithology ostentatious peahen pretty proud ave colorido orgulhoso pavoa pomposo",
    group: "animals",
  },
  {
    glyph: "🦜",
    label: "parrot",
    labelPt: "papagaio",
    terms:
      "parrot papagaio animal bird ornithology pirate talk ave fala pirata passaro repete",
    group: "animals",
  },
  {
    glyph: "🪽",
    label: "wing",
    labelPt: "asa",
    terms:
      "wing asa angelic ascend aviation bird fly flying heavenly mythology soar angelical anjo ascender aviacao celestial mitologia passaro voando voar alto",
    group: "animals",
  },
  {
    glyph: "🐦‍⬛",
    label: "black bird",
    labelPt: "pássaro preto",
    terms:
      "black bird passaro preto animal beak caw corvid crow ornithology raven rook ave bico corvo gralha passarinho",
    group: "animals",
  },
  {
    glyph: "🪿",
    label: "goose",
    labelPt: "ganso",
    terms:
      "goose ganso animal bird duck flock fowl gaggle gander geese honk ornithology silly ave bobo gansos grasno marreco pato passaro",
    group: "animals",
  },
  {
    glyph: "🐦‍🔥",
    label: "phoenix",
    labelPt: "fênix",
    terms:
      "phoenix fenix ascend ascension emerge fantasy firebird glory immortal rebirth reincarnation reinvent renewal revival revive rise transform fantasia imortal passaro de fogo reemergir reencarnar reencarnacao reincarnacao renascer renascimento reviver transformacao",
    group: "animals",
  },
  {
    glyph: "🐸",
    label: "frog",
    labelPt: "sapo",
    terms: "frog sapo animal face rosto de",
    group: "animals",
  },
  {
    glyph: "🐊",
    label: "crocodile",
    labelPt: "crocodilo",
    terms: "crocodile crocodilo animal zoo jacare",
    group: "animals",
  },
  {
    glyph: "🐢",
    label: "turtle",
    labelPt: "tartaruga",
    terms: "turtle tartaruga animal terrapin tortoise",
    group: "animals",
  },
  {
    glyph: "🦎",
    label: "lizard",
    labelPt: "lagartixa",
    terms: "lizard lagartixa animal reptile lagarto reptil",
    group: "animals",
  },
  {
    glyph: "🐍",
    label: "snake",
    labelPt: "cobra",
    terms: "snake cobra animal bearer ophiuchus serpent zodiac reptil serpente",
    group: "animals",
  },
  {
    glyph: "🐲",
    label: "dragon face",
    labelPt: "rosto de dragão",
    terms: "dragon face rosto de dragao animal fairy fairytale tale",
    group: "animals",
  },
  {
    glyph: "🐉",
    label: "dragon",
    labelPt: "dragão",
    terms: "dragon dragao animal fairy fairytale knights tale game of thrones",
    group: "animals",
  },
  {
    glyph: "🦕",
    label: "sauropod",
    labelPt: "saurópode",
    terms:
      "sauropod sauropode brachiosaurus brontosaurus dinosaur diplodocus braquiosaurus braquiossauro brontossauro brontossuro dinossauro diplodoco",
    group: "animals",
  },
  {
    glyph: "🦖",
    label: "T-Rex",
    labelPt: "tiranossauro rex",
    terms: "t-rex tiranossauro rex dinosaur t tyrannosaurus dinossauro",
    group: "animals",
  },
  {
    glyph: "🐳",
    label: "spouting whale",
    labelPt: "baleia esguichando água",
    terms:
      "spouting whale baleia esguichando agua animal beach face ocean esguicho",
    group: "animals",
  },
  {
    glyph: "🐋",
    label: "whale",
    labelPt: "baleia",
    terms: "whale baleia animal beach ocean mar oceano",
    group: "animals",
  },
  {
    glyph: "🐬",
    label: "dolphin",
    labelPt: "golfinho",
    terms: "dolphin golfinho animal beach flipper ocean oceano",
    group: "animals",
  },
  {
    glyph: "🫍",
    label: "orca",
    labelPt: "orca",
    terms: "orca marine ocean whale baleia marinho oceano",
    group: "animals",
  },
  {
    glyph: "🦭",
    label: "seal",
    labelPt: "foca",
    terms: "seal foca animal lion ocean sea marinho leao leao-marinho oceano",
    group: "animals",
  },
  {
    glyph: "🐟️",
    label: "fish",
    labelPt: "peixe",
    terms:
      "fish peixe animal dinner fishes fishing pisces zodiac peixes pesca pescar signo de zodiaco",
    group: "animals",
  },
  {
    glyph: "🐠",
    label: "tropical fish",
    labelPt: "peixe tropical",
    terms: "tropical fish peixe animal fishes",
    group: "animals",
  },
  {
    glyph: "🐡",
    label: "blowfish",
    labelPt: "baiacu",
    terms: "blowfish baiacu animal fish peixe",
    group: "animals",
  },
  {
    glyph: "🦈",
    label: "shark",
    labelPt: "tubarão",
    terms: "shark tubarao animal fish peixe",
    group: "animals",
  },
  {
    glyph: "🐙",
    label: "octopus",
    labelPt: "polvo",
    terms: "octopus polvo animal creature ocean oceano",
    group: "animals",
  },
  {
    glyph: "🐚",
    label: "spiral shell",
    labelPt: "caramujo",
    terms:
      "spiral shell caramujo animal beach conch sea concha do mar em espiral",
    group: "animals",
  },
  {
    glyph: "🪸",
    label: "coral",
    labelPt: "coral",
    terms:
      "coral change climate ocean reef sea mar mudanca climatica oceano recife",
    group: "animals",
  },
  {
    glyph: "🪼",
    label: "jellyfish",
    labelPt: "água-viva",
    terms:
      "jellyfish agua-viva animal aquarium burn invertebrate jelly life marine ocean ouch plankton sea sting stinger tentacles ai aquario ferrao invertebrado mar marinha medusa oceano queimadura tentaculos",
    group: "animals",
  },
  {
    glyph: "🦀",
    label: "crab",
    labelPt: "caranguejo",
    terms: "crab caranguejo cancer zodiac animal marinho signo de zodiaco",
    group: "animals",
  },
  {
    glyph: "🦞",
    label: "lobster",
    labelPt: "lagosta",
    terms:
      "lobster lagosta animal bisque claws seafood caldo fruto do mar garras",
    group: "animals",
  },
  {
    glyph: "🦐",
    label: "shrimp",
    labelPt: "camarão",
    terms: "shrimp camarao food shellfish small animal comida crustaceo",
    group: "animals",
  },
  {
    glyph: "🦑",
    label: "squid",
    labelPt: "lula",
    terms: "squid lula animal food mollusk comida molusco",
    group: "animals",
  },
  {
    glyph: "🦪",
    label: "oyster",
    labelPt: "ostra",
    terms: "oyster ostra diving pearl frutos do mar mergulho perola",
    group: "animals",
  },
  {
    glyph: "🐌",
    label: "snail",
    labelPt: "caracol",
    terms: "snail caracol animal escargot garden nature slug",
    group: "animals",
  },
  {
    glyph: "🦋",
    label: "butterfly",
    labelPt: "borboleta",
    terms: "butterfly borboleta insect pretty beleza inseto",
    group: "animals",
  },
  {
    glyph: "🐛",
    label: "bug",
    labelPt: "inseto",
    terms: "bug inseto animal garden insect centopeia lagarta",
    group: "animals",
  },
  {
    glyph: "🐜",
    label: "ant",
    labelPt: "formiga",
    terms: "ant formiga animal garden insect inseto",
    group: "animals",
  },
  {
    glyph: "🐝",
    label: "honeybee",
    labelPt: "abelha",
    terms:
      "honeybee abelha animal bee bumblebee honey insect nature spring inseto natureza",
    group: "animals",
  },
  {
    glyph: "🪲",
    label: "beetle",
    labelPt: "besouro",
    terms: "beetle besouro animal bug insect bicho inseto",
    group: "animals",
  },
  {
    glyph: "🐞",
    label: "lady beetle",
    labelPt: "joaninha",
    terms:
      "lady beetle joaninha animal garden insect ladybird ladybug nature besouro inseto tipo de",
    group: "animals",
  },
  {
    glyph: "🦗",
    label: "cricket",
    labelPt: "grilo",
    terms:
      "cricket grilo animal bug grasshopper insect orthoptera gafanhoto inseto",
    group: "animals",
  },
  {
    glyph: "🪳",
    label: "cockroach",
    labelPt: "barata",
    terms:
      "cockroach barata animal insect pest roach baratas inseto nojento nojo praga",
    group: "animals",
  },
  {
    glyph: "🕷️",
    label: "spider",
    labelPt: "aranha",
    terms: "spider aranha animal insect dias das bruxas halloween inseto",
    group: "animals",
  },
  {
    glyph: "🕸️",
    label: "spider web",
    labelPt: "teia de aranha",
    terms: "spider web teia de aranha halloween inseto",
    group: "animals",
  },
  {
    glyph: "🦂",
    label: "scorpion",
    labelPt: "escorpião",
    terms:
      "scorpion escorpiao scorpio scorpius zodiac animal deserto inseto zodiaco",
    group: "animals",
  },
  {
    glyph: "🦟",
    label: "mosquito",
    labelPt: "mosquito",
    terms:
      "mosquito bite disease fever insect malaria pest virus aedes aegypti amarela animal chicungunha dengue doenca febre inseto pernilongo zica",
    group: "animals",
  },
  {
    glyph: "🪰",
    label: "fly",
    labelPt: "mosca",
    terms:
      "fly mosca animal disease insect maggot pest rotting apodrecendo doenca inseto larva mosca-varejeira praga varejeira",
    group: "animals",
  },
  {
    glyph: "🪱",
    label: "worm",
    labelPt: "minhoca",
    terms:
      "worm minhoca animal annelid earthworm parasite anelideo parasita verme",
    group: "animals",
  },
  {
    glyph: "🦠",
    label: "microbe",
    labelPt: "micróbio",
    terms: "microbe microbio amoeba bacteria science virus ameba ciencia",
    group: "animals",
  },
  {
    glyph: "💐",
    label: "bouquet",
    labelPt: "buquê",
    terms:
      "bouquet buque anniversary birthday date flower love plant romance aniversario flor planta",
    group: "animals",
  },
  {
    glyph: "🌸",
    label: "cherry blossom",
    labelPt: "flor de cerejeira",
    terms:
      "cherry blossom flor de cerejeira flower plant spring springtime cereja planta primavera",
    group: "animals",
  },
  {
    glyph: "💮",
    label: "white flower",
    labelPt: "flor branca",
    terms: "white flower flor branca carimbo de parabens",
    group: "animals",
  },
  {
    glyph: "🪷",
    label: "lotus",
    labelPt: "lótus",
    terms:
      "lotus beauty buddhism calm flower hinduism peace purity serenity beleza budismo calma flor de hinduismo paz pureza serenidade vietna india",
    group: "animals",
  },
  {
    glyph: "🏵️",
    label: "rosette",
    labelPt: "roseta",
    terms: "rosette roseta plant flor amarela planta primavera",
    group: "animals",
  },
  {
    glyph: "🌹",
    label: "rose",
    labelPt: "rosa",
    terms: "rose rosa beauty elegant flower love plant red valentine flor",
    group: "animals",
  },
  {
    glyph: "🥀",
    label: "wilted flower",
    labelPt: "flor murcha",
    terms: "wilted flower flor murcha dying morrendo murchando",
    group: "animals",
  },
  {
    glyph: "🌺",
    label: "hibiscus",
    labelPt: "hibisco",
    terms: "hibiscus hibisco flower plant flor planta primavera",
    group: "animals",
  },
  {
    glyph: "🌻",
    label: "sunflower",
    labelPt: "girassol",
    terms: "sunflower girassol flower outdoors plant sun flor planta",
    group: "animals",
  },
  {
    glyph: "🌼",
    label: "blossom",
    labelPt: "flor",
    terms: "blossom flor buttercup dandelion flower plant florescer planta",
    group: "animals",
  },
  {
    glyph: "🌷",
    label: "tulip",
    labelPt: "tulipa",
    terms: "tulip tulipa blossom flower growth plant flor",
    group: "animals",
  },
  {
    glyph: "🪻",
    label: "hyacinth",
    labelPt: "jacinto",
    terms:
      "hyacinth jacinto bloom bluebonnet flower indigo lavender lilac lupine plant purple shrub snapdragon spring violet arbusto flor flor-cranio-do-dragao lavanda lilas lupinus planta primavera roxo violeta",
    group: "animals",
  },
  {
    glyph: "🌱",
    label: "seedling",
    labelPt: "muda de planta",
    terms:
      "seedling muda de planta plant sapling sprout young brotar broto jovem plantinha",
    group: "animals",
  },
  {
    glyph: "🪴",
    label: "potted plant",
    labelPt: "vaso com planta",
    terms:
      "potted plant vaso com planta decor grow house nurturing pot casa chato decoracao nutrir plantar samambaia sem utilidade",
    group: "animals",
  },
  {
    glyph: "🌲",
    label: "evergreen tree",
    labelPt: "conífera",
    terms:
      "evergreen tree conifera christmas forest pine floresta natal pinheirinho pinheiro arvore de",
    group: "animals",
  },
  {
    glyph: "🌳",
    label: "deciduous tree",
    labelPt: "árvore caidiça",
    terms:
      "deciduous tree arvore caidica forest green habitat shedding desfolha natureza cheia",
    group: "animals",
  },
  {
    glyph: "🌴",
    label: "palm tree",
    labelPt: "palmeira",
    terms: "palm tree palmeira beach plant tropical coqueiro arvore de",
    group: "animals",
  },
  {
    glyph: "🌵",
    label: "cactus",
    labelPt: "cacto",
    terms:
      "cactus cacto desert drought nature plant deserto natureza planta seca",
    group: "animals",
  },
  {
    glyph: "🌾",
    label: "sheaf of rice",
    labelPt: "planta de arroz",
    terms:
      "sheaf of rice planta de arroz ear grain grains plant comida espiga fazenda graos do",
    group: "animals",
  },
  {
    glyph: "🌿",
    label: "herb",
    labelPt: "erva",
    terms: "herb erva leaf plant folha planta",
    group: "animals",
  },
  {
    glyph: "☘️",
    label: "shamrock",
    labelPt: "trevo",
    terms: "shamrock trevo irish plant irlanda irlandes planta de tres folhas",
    group: "animals",
  },
  {
    glyph: "🍀",
    label: "four leaf clover",
    labelPt: "trevo de quatro folhas",
    terms:
      "four leaf clover trevo de quatro folhas 4 four-leaf irish lucky plant irlandes planta sorte sortudo",
    group: "animals",
  },
  {
    glyph: "🍁",
    label: "maple leaf",
    labelPt: "folha de bordo",
    terms: "maple leaf folha de bordo falling caida vermelha outono",
    group: "animals",
  },
  {
    glyph: "🍂",
    label: "fallen leaf",
    labelPt: "folhas caídas",
    terms: "fallen leaf folhas caidas autumn fall falling cair folha outono",
    group: "animals",
  },
  {
    glyph: "🍃",
    label: "leaf fluttering in wind",
    labelPt: "folha ao vento",
    terms: "leaf fluttering in wind folha ao vento blow flutter soprando",
    group: "animals",
  },
  {
    glyph: "🪹",
    label: "empty nest",
    labelPt: "ninho vazio",
    terms:
      "empty nest ninho vazio branch home nesting aninhando galhos lar passarinho passaro",
    group: "animals",
  },
  {
    glyph: "🪺",
    label: "nest with eggs",
    labelPt: "ninho com ovos",
    terms:
      "nest with eggs ninho com ovos bird branch egg nesting aninhando galhos lar ovo passarinho passaro",
    group: "animals",
  },
  {
    glyph: "🍄",
    label: "mushroom",
    labelPt: "cogumelo",
    terms: "mushroom cogumelo fungus toadstool champignon fungo mario planta",
    group: "animals",
  },
  {
    glyph: "🪾",
    label: "leafless tree",
    labelPt: "árvore seca",
    terms:
      "leafless tree arvore seca bare barren branches dead drought trunk winter wood inverno sem folhas",
    group: "animals",
  },
  {
    glyph: "🍇",
    label: "grapes",
    labelPt: "uvas",
    terms: "grapes uvas dionysus fruit grape fruta uva",
    group: "food",
  },
  {
    glyph: "🍈",
    label: "melon",
    labelPt: "melão",
    terms: "melon melao cantaloupe fruit fruta",
    group: "food",
  },
  {
    glyph: "🍉",
    label: "watermelon",
    labelPt: "melancia",
    terms: "watermelon melancia fruit fruta",
    group: "food",
  },
  {
    glyph: "🍊",
    label: "tangerine",
    labelPt: "tangerina",
    terms:
      "tangerine tangerina c citrus fruit nectarine orange vitamin citrica fruta laranja",
    group: "food",
  },
  {
    glyph: "🍋",
    label: "lemon",
    labelPt: "limão",
    terms: "lemon limao citrus fruit sour azedo citrico fruta lima siciliano",
    group: "food",
  },
  {
    glyph: "🍋‍🟩",
    label: "lime",
    labelPt: "lima",
    terms:
      "lime lima acidity citrus cocktail fruit garnish key margarita mojito refreshing salsa sour tangy tequila tropical zest acidez caipirinha citrica citrico drink fruta limonada limao verde",
    group: "food",
  },
  {
    glyph: "🍌",
    label: "banana",
    labelPt: "banana",
    terms: "banana fruit potassium fruta",
    group: "food",
  },
  {
    glyph: "🍍",
    label: "pineapple",
    labelPt: "abacaxi",
    terms: "pineapple abacaxi colada fruit pina tropical comida fome fruta",
    group: "food",
  },
  {
    glyph: "🥭",
    label: "mango",
    labelPt: "manga",
    terms: "mango manga food fruit tropical comida fruta",
    group: "food",
  },
  {
    glyph: "🍎",
    label: "red apple",
    labelPt: "maçã vermelha",
    terms: "red apple maca vermelha diet food fruit health ripe fruta",
    group: "food",
  },
  {
    glyph: "🍏",
    label: "green apple",
    labelPt: "maçã verde",
    terms: "green apple maca verde fruit comida fome fruta",
    group: "food",
  },
  {
    glyph: "🍐",
    label: "pear",
    labelPt: "pera",
    terms: "pear pera fruit comida fome fruta",
    group: "food",
  },
  {
    glyph: "🍑",
    label: "peach",
    labelPt: "pêssego",
    terms: "peach pessego fruit fruta",
    group: "food",
  },
  {
    glyph: "🍒",
    label: "cherries",
    labelPt: "cereja",
    terms:
      "cherries cereja berries cherry fruit red comida fome fruta frutas vermelhas",
    group: "food",
  },
  {
    glyph: "🍓",
    label: "strawberry",
    labelPt: "morango",
    terms: "strawberry morango berry fruit comida fome fruta frutas vermelhas",
    group: "food",
  },
  {
    glyph: "🫐",
    label: "blueberries",
    labelPt: "mirtilos",
    terms:
      "blueberries mirtilos berries berry bilberry blue blueberry food fruit alimento azul baga comida fruta mirtilo silvestre",
    group: "food",
  },
  {
    glyph: "🥝",
    label: "kiwi fruit",
    labelPt: "kiwi",
    terms: "kiwi fruit food comida fruta",
    group: "food",
  },
  {
    glyph: "🍅",
    label: "tomato",
    labelPt: "tomate",
    terms: "tomato tomate food fruit vegetable fruta fruto legume vegetal",
    group: "food",
  },
  {
    glyph: "🫒",
    label: "olive",
    labelPt: "azeitona",
    terms: "olive azeitona food alimento comida oliveira",
    group: "food",
  },
  {
    glyph: "🥥",
    label: "coconut",
    labelPt: "coco",
    terms: "coconut coco colada palm pina fruta palmeira",
    group: "food",
  },
  {
    glyph: "🥑",
    label: "avocado",
    labelPt: "abacate",
    terms: "avocado abacate food fruit comida fruta",
    group: "food",
  },
  {
    glyph: "🍆",
    label: "eggplant",
    labelPt: "berinjela",
    terms:
      "eggplant berinjela aubergine vegetable beringela comida legume vegetal",
    group: "food",
  },
  {
    glyph: "🥔",
    label: "potato",
    labelPt: "batata",
    terms: "potato batata food vegetable comida fome legume vegetal",
    group: "food",
  },
  {
    glyph: "🥕",
    label: "carrot",
    labelPt: "cenoura",
    terms: "carrot cenoura food vegetable comida fome legume salada vegetal",
    group: "food",
  },
  {
    glyph: "🌽",
    label: "ear of corn",
    labelPt: "milho",
    terms: "ear of corn milho crops farm maize maze comida espiga de fome",
    group: "food",
  },
  {
    glyph: "🌶️",
    label: "hot pepper",
    labelPt: "pimenta",
    terms: "hot pepper pimenta apimentada apimentado tempero",
    group: "food",
  },
  {
    glyph: "🫑",
    label: "bell pepper",
    labelPt: "pimentão",
    terms:
      "bell pepper pimentao capsicum food vegetable alimento comida pimenta verde vegetal",
    group: "food",
  },
  {
    glyph: "🥒",
    label: "cucumber",
    labelPt: "pepino",
    terms:
      "cucumber pepino food pickle vegetable comida fome legume picles salada vegetal",
    group: "food",
  },
  {
    glyph: "🥬",
    label: "leafy green",
    labelPt: "verdura",
    terms:
      "leafy green verdura bok burgers cabbage choy kale lettuce salad alface comida couve hamburguer repolho chines salada",
    group: "food",
  },
  {
    glyph: "🥦",
    label: "broccoli",
    labelPt: "brócolis",
    terms: "broccoli brocolis cabbage wild brocoli",
    group: "food",
  },
  {
    glyph: "🧄",
    label: "garlic",
    labelPt: "alho",
    terms: "garlic alho flavoring tempero",
    group: "food",
  },
  {
    glyph: "🧅",
    label: "onion",
    labelPt: "cebola",
    terms: "onion cebola flavoring tempero",
    group: "food",
  },
  {
    glyph: "🥜",
    label: "peanuts",
    labelPt: "amendoim",
    terms: "peanuts amendoim food nut peanut vegetable comida",
    group: "food",
  },
  {
    glyph: "🫘",
    label: "beans",
    labelPt: "feijões",
    terms: "beans feijoes food kidney legume small alimento comida feijao grao",
    group: "food",
  },
  {
    glyph: "🌰",
    label: "chestnut",
    labelPt: "castanha",
    terms: "chestnut castanha almond plant planta",
    group: "food",
  },
  {
    glyph: "🫚",
    label: "ginger root",
    labelPt: "gengibre",
    terms:
      "ginger root gengibre beer health herb natural spice cerveja comida erva especiaria raiz saude tempero",
    group: "food",
  },
  {
    glyph: "🫛",
    label: "pea pod",
    labelPt: "vagem",
    terms:
      "pea pod vagem beans beanstalk edamame legume soybean vegetable veggie comida ervilha feijao grao leguminosa pe de vegetal",
    group: "food",
  },
  {
    glyph: "🍄‍🟫",
    label: "brown mushroom",
    labelPt: "cogumelo marrom",
    terms:
      "brown mushroom cogumelo marrom food fungi fungus nature pizza portobello shiitake shroom spore sprout toppings truffle vegetable vegetarian veggie champignon comida fungo fungos natureza trufa vegetal vegetariano",
    group: "food",
  },
  {
    glyph: "🫜",
    label: "root vegetable",
    labelPt: "tubérculo",
    terms:
      "root vegetable tuberculo beet food garden radish salad turnip vegetarian beterraba legume nabo raiz vegetal",
    group: "food",
  },
  {
    glyph: "🍞",
    label: "bread",
    labelPt: "pão",
    terms:
      "bread pao carbs food grain loaf restaurant toast wheat de forma para fatiar restaurante torrada tostex",
    group: "food",
  },
  {
    glyph: "🥐",
    label: "croissant",
    labelPt: "croissant",
    terms:
      "croissant bread breakfast crescent food french roll cafe da manha comida fome pao",
    group: "food",
  },
  {
    glyph: "🥖",
    label: "baguette bread",
    labelPt: "baguete",
    terms: "baguette bread baguete food french bisnaga comida pao frances",
    group: "food",
  },
  {
    glyph: "🫓",
    label: "flatbread",
    labelPt: "pão sírio",
    terms:
      "flatbread pao sirio arepa bread food gordita lavash naan pita alimento comida folha",
    group: "food",
  },
  {
    glyph: "🥨",
    label: "pretzel",
    labelPt: "pretzel",
    terms: "pretzel convoluted twisted pao torcido",
    group: "food",
  },
  {
    glyph: "🥯",
    label: "bagel",
    labelPt: "bagel",
    terms:
      "bagel bakery bread breakfast schmear cafe da manha chimia comida confeitaria pao rosca rosquinha",
    group: "food",
  },
  {
    glyph: "🥞",
    label: "pancakes",
    labelPt: "panquecas",
    terms:
      "pancakes panquecas breakfast crepe food hotcake pancake cafe da manha comida crepes fome",
    group: "food",
  },
  {
    glyph: "🧇",
    label: "waffle",
    labelPt: "waffle",
    terms: "waffle breakfast indecisive iron doce gofre wafel wafle",
    group: "food",
  },
  {
    glyph: "🧀",
    label: "cheese wedge",
    labelPt: "queijo",
    terms: "cheese wedge queijo comida fome suico",
    group: "food",
  },
  {
    glyph: "🍖",
    label: "meat on bone",
    labelPt: "carne",
    terms: "meat on bone carne com osso no churras churrasco restaurante",
    group: "food",
  },
  {
    glyph: "🍗",
    label: "poultry leg",
    labelPt: "coxa de frango",
    terms:
      "poultry leg coxa de frango bone chicken drumstick hungry turkey aves comida coxinha fome osso peru restaurante",
    group: "food",
  },
  {
    glyph: "🥩",
    label: "cut of meat",
    labelPt: "corte de carne",
    terms:
      "cut of meat corte de carne chop lambchop porkchop red steak bife vermelha costela cordeiro costeleta porco",
    group: "food",
  },
  {
    glyph: "🥓",
    label: "bacon",
    labelPt: "bacon",
    terms: "bacon breakfast food meat comida fome toucinho",
    group: "food",
  },
  {
    glyph: "🍔",
    label: "hamburger",
    labelPt: "hambúrguer",
    terms:
      "hamburger hamburguer burger eat fast food hungry burguer cheese restaurante",
    group: "food",
  },
  {
    glyph: "🍟",
    label: "french fries",
    labelPt: "batata frita",
    terms:
      "french fries batata frita fast food comida fome fritas lanchonete restaurante",
    group: "food",
  },
  {
    glyph: "🍕",
    label: "pizza",
    labelPt: "pizza",
    terms: "pizza cheese food hungry pepperoni slice fatia restaurante",
    group: "food",
  },
  {
    glyph: "🌭",
    label: "hot dog",
    labelPt: "cachorro-quente",
    terms:
      "hot dog cachorro-quente frankfurter hotdog sausage cachorro quente pao com salsicha vina",
    group: "food",
  },
  {
    glyph: "🥪",
    label: "sandwich",
    labelPt: "sanduíche",
    terms: "sandwich sanduiche bread pao de forma",
    group: "food",
  },
  {
    glyph: "🌮",
    label: "taco",
    labelPt: "taco",
    terms: "taco mexican comida mexicana mexicano tacos",
    group: "food",
  },
  {
    glyph: "🌯",
    label: "burrito",
    labelPt: "burrito",
    terms: "burrito mexican wrap comida mexicana mexicano",
    group: "food",
  },
  {
    glyph: "🫔",
    label: "tamale",
    labelPt: "tamale",
    terms:
      "tamale food mexican pamonha wrapped alimento comida enrolado mexicano milho",
    group: "food",
  },
  {
    glyph: "🥙",
    label: "stuffed flatbread",
    labelPt: "pão recheado",
    terms:
      "stuffed flatbread pao recheado falafel food gyro kebab comida recheio wrap",
    group: "food",
  },
  {
    glyph: "🧆",
    label: "falafel",
    labelPt: "falafel",
    terms: "falafel chickpea meatball almondega grao de bico",
    group: "food",
  },
  {
    glyph: "🥚",
    label: "egg",
    labelPt: "ovo",
    terms: "egg ovo breakfast food comida fome",
    group: "food",
  },
  {
    glyph: "🍳",
    label: "cooking",
    labelPt: "ovo frito",
    terms:
      "cooking ovo frito breakfast easy egg fry frying over pan restaurant side sunny up comida culinaria frigideira estrelado restaurante",
    group: "food",
  },
  {
    glyph: "🥘",
    label: "shallow pan of food",
    labelPt: "caçarola com comida",
    terms:
      "shallow pan of food cacarola com comida casserole paella fome panela rasa",
    group: "food",
  },
  {
    glyph: "🍲",
    label: "pot of food",
    labelPt: "panela",
    terms: "pot of food panela soup stew ensopado restaurante tigela de comida",
    group: "food",
  },
  {
    glyph: "🫕",
    label: "fondue",
    labelPt: "fondue",
    terms:
      "fondue cheese chocolate food melted pot ski alimento comida derretido panela queijo suico",
    group: "food",
  },
  {
    glyph: "🥣",
    label: "bowl with spoon",
    labelPt: "tigela com colher",
    terms:
      "bowl with spoon tigela com colher breakfast cereal congee oatmeal porridge cafe da manha prato de sopa",
    group: "food",
  },
  {
    glyph: "🥗",
    label: "green salad",
    labelPt: "salada verde",
    terms: "green salad salada verde food comida fome restaurante",
    group: "food",
  },
  {
    glyph: "🍿",
    label: "popcorn",
    labelPt: "pipoca",
    terms: "popcorn pipoca corn movie pop balde cinema",
    group: "food",
  },
  {
    glyph: "🧈",
    label: "butter",
    labelPt: "manteiga",
    terms: "butter manteiga dairy laticinio margarina",
    group: "food",
  },
  {
    glyph: "🧂",
    label: "salt",
    labelPt: "sal",
    terms:
      "salt sal condiment flavor mad salty shaker taste upset comida condimento sabor saleiro salgado",
    group: "food",
  },
  {
    glyph: "🥫",
    label: "canned food",
    labelPt: "comida enlatada",
    terms: "canned food comida enlatada can lata",
    group: "food",
  },
  {
    glyph: "🍱",
    label: "bento box",
    labelPt: "bentô",
    terms: "bento box food almoco japones caixa de restaurante",
    group: "food",
  },
  {
    glyph: "🍘",
    label: "rice cracker",
    labelPt: "biscoito de arroz",
    terms: "rice cracker biscoito de arroz food bolacha",
    group: "food",
  },
  {
    glyph: "🍙",
    label: "rice ball",
    labelPt: "arroz japonês",
    terms:
      "rice ball arroz japones food japanese bolinho de comida fome onigiri restaurante",
    group: "food",
  },
  {
    glyph: "🍚",
    label: "cooked rice",
    labelPt: "arroz cozido",
    terms: "cooked rice arroz cozido food comida fome restaurante",
    group: "food",
  },
  {
    glyph: "🍛",
    label: "curry rice",
    labelPt: "arroz com curry",
    terms: "curry rice arroz com food e restaurante",
    group: "food",
  },
  {
    glyph: "🍜",
    label: "steaming bowl",
    labelPt: "lámen",
    terms:
      "steaming bowl lamen chopsticks food noodle pho ramen soup comida fome macarrao miojo quentinha restaurante sopa tigela de",
    group: "food",
  },
  {
    glyph: "🍝",
    label: "spaghetti",
    labelPt: "espaguete",
    terms:
      "spaghetti espaguete food meatballs pasta restaurant comida fome italiano macarronada macarrao restaurante",
    group: "food",
  },
  {
    glyph: "🍠",
    label: "roasted sweet potato",
    labelPt: "batata assada",
    terms:
      "roasted sweet potato batata assada food batata-doce doce restaurante",
    group: "food",
  },
];

const EMOJI_BLOCK_2: EmojiEntry[] = [
  {
    glyph: "🍢",
    label: "oden",
    labelPt: "oden",
    terms:
      "oden food kebab restaurant seafood skewer stick espetinho frutos do mar no restaurante",
    group: "food",
  },
  {
    glyph: "🍣",
    label: "sushi",
    labelPt: "sushi",
    terms: "sushi food comida japonesa restaurante japones sashimi",
    group: "food",
  },
  {
    glyph: "🍤",
    label: "fried shrimp",
    labelPt: "camarão frito",
    terms: "fried shrimp camarao frito prawn tempura empanado restaurante",
    group: "food",
  },
  {
    glyph: "🍥",
    label: "fish cake with swirl",
    labelPt: "bolinho de peixe",
    terms:
      "fish cake with swirl bolinho de peixe food pastry restaurant croquete redemoinho restaurante",
    group: "food",
  },
  {
    glyph: "🥮",
    label: "moon cake",
    labelPt: "bolo lunar",
    terms:
      "moon cake bolo lunar autumn festival yuebing da lua comida confeitaria chines outono",
    group: "food",
  },
  {
    glyph: "🍡",
    label: "dango",
    labelPt: "dango",
    terms:
      "dango dessert japanese skewer stick sweet bolinho de mochi no espetinho japones comida doce fome mochiko sobremesa",
    group: "food",
  },
  {
    glyph: "🥟",
    label: "dumpling",
    labelPt: "bolinho asiático",
    terms:
      "dumpling bolinho asiatico empanada gyoza jiaozi pierogi potsticker chines massa",
    group: "food",
  },
  {
    glyph: "🥠",
    label: "fortune cookie",
    labelPt: "biscoito da sorte",
    terms: "fortune cookie biscoito da sorte prophecy chines fortuna profecia",
    group: "food",
  },
  {
    glyph: "🥡",
    label: "takeout box",
    labelPt: "caixa para viagem",
    terms:
      "takeout box caixa para viagem chopsticks delivery food oyster pail caixinha levar marmita",
    group: "food",
  },
  {
    glyph: "🍦",
    label: "soft ice cream",
    labelPt: "sorvete italiano",
    terms:
      "soft ice cream sorvete italiano dessert food icecream restaurant serve sweet doce fome sobremesa de casquinha massa na",
    group: "food",
  },
  {
    glyph: "🍧",
    label: "shaved ice",
    labelPt: "raspadinha de gelo",
    terms:
      "shaved ice raspadinha de gelo dessert restaurant sweet restaurante sobremesa",
    group: "food",
  },
  {
    glyph: "🍨",
    label: "ice cream",
    labelPt: "sorvete",
    terms:
      "ice cream sorvete dessert food restaurant sweet creme gelo restaurante sobremesa",
    group: "food",
  },
  {
    glyph: "🍩",
    label: "doughnut",
    labelPt: "donut",
    terms:
      "doughnut donut breakfast dessert food sweet comida fome restaurante rosquinha sonho doce",
    group: "food",
  },
  {
    glyph: "🍪",
    label: "cookie",
    labelPt: "biscoito",
    terms:
      "cookie biscoito chip chocolate dessert sweet bolacha comida doce fome sobremesa",
    group: "food",
  },
  {
    glyph: "🎂",
    label: "birthday cake",
    labelPt: "bolo de aniversário",
    terms:
      "birthday cake bolo de aniversario bday celebration dessert happy pastry sweet comemoracao doce feliz festa niver",
    group: "food",
  },
  {
    glyph: "🍰",
    label: "shortcake",
    labelPt: "pão de ló de morango",
    terms:
      "shortcake pao de lo morango cake dessert pastry slice sweet bolo recheado doce fatia restaurante sobremesa",
    group: "food",
  },
  {
    glyph: "🧁",
    label: "cupcake",
    labelPt: "cupcake",
    terms:
      "cupcake bakery dessert sprinkles sugar sweet treat acucar bolinho bolo comida confeitaria confeito doce sobremesa torta",
    group: "food",
  },
  {
    glyph: "🥧",
    label: "pie",
    labelPt: "torta",
    terms:
      "pie torta apple filling fruit meat pastry pumpkin slice abobora carne doce fatia de fruta maca padaria recheio salgado",
    group: "food",
  },
  {
    glyph: "🍫",
    label: "chocolate bar",
    labelPt: "chocolate",
    terms:
      "chocolate bar candy dessert halloween sweet tooth barra de doce fome",
    group: "food",
  },
  {
    glyph: "🍬",
    label: "candy",
    labelPt: "bala",
    terms:
      "candy bala cavities dessert halloween restaurant sweet tooth wrapper balinha doce",
    group: "food",
  },
  {
    glyph: "🍭",
    label: "lollipop",
    labelPt: "pirulito",
    terms: "lollipop pirulito candy dessert food restaurant sweet bala doce",
    group: "food",
  },
  {
    glyph: "🍮",
    label: "custard",
    labelPt: "pudim",
    terms: "custard pudim dessert pudding sweet de leite ovos restaurante",
    group: "food",
  },
  {
    glyph: "🍯",
    label: "honey pot",
    labelPt: "pote de mel",
    terms:
      "honey pot pote de mel barrel bear food honeypot jar sweet restaurante",
    group: "food",
  },
  {
    glyph: "🍼",
    label: "baby bottle",
    labelPt: "mamadeira",
    terms:
      "baby bottle mamadeira babies birth born drink infant milk newborn bebe leite leitinho mamar nenem",
    group: "food",
  },
  {
    glyph: "🥛",
    label: "glass of milk",
    labelPt: "copo de leite",
    terms: "glass of milk copo de leite drink",
    group: "food",
  },
  {
    glyph: "☕️",
    label: "hot beverage",
    labelPt: "café",
    terms:
      "hot beverage cafe caffeine chai coffee drink morning steaming tea cafezinho cafeina cha inverno quente",
    group: "food",
  },
  {
    glyph: "🫖",
    label: "teapot",
    labelPt: "bule",
    terms:
      "teapot bule brew drink food pot tea alimento bebida chaleira cha comida infusao",
    group: "food",
  },
  {
    glyph: "🍵",
    label: "teacup without handle",
    labelPt: "xícara de chá sem alça",
    terms:
      "teacup without handle xicara de cha sem alca beverage cup drink oolong tea bebida verde",
    group: "food",
  },
  {
    glyph: "🍶",
    label: "sake",
    labelPt: "saquê",
    terms:
      "sake saque bar beverage bottle cup drink restaurant bebida copo garrafa e de japones restaurante",
    group: "food",
  },
  {
    glyph: "🍾",
    label: "bottle with popping cork",
    labelPt: "garrafa de champanhe",
    terms:
      "bottle with popping cork garrafa de champanhe bar drink aniversario champagne champanha cidra comemorar espumante estourar festa parabens",
    group: "food",
  },
  {
    glyph: "🍷",
    label: "wine glass",
    labelPt: "vinho",
    terms:
      "wine glass vinho alcohol bar beverage booze club drink drinking drinks restaurant bebida calice de restaurante taca",
    group: "food",
  },
  {
    glyph: "🍸️",
    label: "cocktail glass",
    labelPt: "coquetel",
    terms:
      "cocktail glass coquetel alcohol bar booze club drink drinking drinks mad martini men beber bebida cachaca happy hour restaurante taca de",
    group: "food",
  },
  {
    glyph: "🍹",
    label: "tropical drink",
    labelPt: "bebida tropical",
    terms:
      "tropical drink bebida alcohol bar booze club cocktail drinking drinks drunk mai party tai tropics coquetel de frutas happy hour restaurante",
    group: "food",
  },
  {
    glyph: "🍺",
    label: "beer mug",
    labelPt: "cerveja",
    terms:
      "beer mug cerveja alcohol ale bar booze drink drinking drinks octoberfest oktoberfest pint stein summer bebida caneca de chopp gelada happy hour restaurante",
    group: "food",
  },
  {
    glyph: "🍻",
    label: "clinking beer mugs",
    labelPt: "canecas de cerveja",
    terms:
      "clinking beer mugs canecas de cerveja alcohol bar booze bottoms cheers clink drinking drinks caneca chope chopp restaurante",
    group: "food",
  },
  {
    glyph: "🥂",
    label: "clinking glasses",
    labelPt: "taças brindando",
    terms:
      "clinking glasses tacas brindando celebrate clink drink glass brinde champagne champanhe comemoracao taca tim-tim",
    group: "food",
  },
  {
    glyph: "🥃",
    label: "tumbler glass",
    labelPt: "copo",
    terms:
      "tumbler glass copo liquor scotch shot whiskey whisky bar bebida drink",
    group: "food",
  },
  {
    glyph: "🫗",
    label: "pouring liquid",
    labelPt: "derramando líquido",
    terms:
      "pouring liquid derramando liquido accident drink empty glass oops pour spill water acabou acidente bebida copo derramar derrubar fim ops pingar vazio agua",
    group: "food",
  },
  {
    glyph: "🥤",
    label: "cup with straw",
    labelPt: "copo com canudo",
    terms:
      "cup with straw copo com canudo drink juice malt soda soft water refrigerante suco agua",
    group: "food",
  },
  {
    glyph: "🧋",
    label: "bubble tea",
    labelPt: "chá perolado",
    terms:
      "bubble tea cha perolado boba food milk pearl bebida bolha comida leite poba perola",
    group: "food",
  },
  {
    glyph: "🧃",
    label: "beverage box",
    labelPt: "suco de caixa",
    terms: "beverage box suco de caixa juice straw sweet caixinha suquinho",
    group: "food",
  },
  {
    glyph: "🧉",
    label: "mate",
    labelPt: "mate",
    terms: "mate drink bebida chimarrao cuia de terere",
    group: "food",
  },
  {
    glyph: "🧊",
    label: "ice",
    labelPt: "cubo de gelo",
    terms: "ice cubo de gelo cold cube iceberg gelado",
    group: "food",
  },
  {
    glyph: "🥢",
    label: "chopsticks",
    labelPt: "hashi",
    terms: "chopsticks hashi jeotgarak kuaizi comida japonesa pauzinhos",
    group: "food",
  },
  {
    glyph: "🍽️",
    label: "fork and knife with plate",
    labelPt: "prato com talheres",
    terms:
      "fork and knife with plate prato com talheres cooking dinner eat almoco faca fome garfo jantar ao lado restaurante",
    group: "food",
  },
  {
    glyph: "🍴",
    label: "fork and knife",
    labelPt: "garfo e faca",
    terms:
      "fork and knife garfo e faca breakfast breaky cooking cutlery delicious dinner eat feed food hungry lunch restaurant yum yummy almoco comer comida fome jantar restaurante talher talheres",
    group: "food",
  },
  {
    glyph: "🥄",
    label: "spoon",
    labelPt: "colher",
    terms: "spoon colher eat tableware talher",
    group: "food",
  },
  {
    glyph: "🔪",
    label: "kitchen knife",
    labelPt: "faca de cozinha",
    terms:
      "kitchen knife faca de cozinha chef cooking hocho tool weapon cozinhar",
    group: "food",
  },
  {
    glyph: "🫙",
    label: "jar",
    labelPt: "jarro",
    terms:
      "jar jarro condiment container empty nothing sauce store armazenar condimento conserva jarra molho nada pote recipiente vazio vidro",
    group: "food",
  },
  {
    glyph: "🏺",
    label: "amphora",
    labelPt: "ânfora",
    terms:
      "amphora anfora aquarius cooking drink jug tool weapon zodiac ornamento chines vaso",
    group: "food",
  },
  {
    glyph: "🎃",
    label: "jack-o-lantern",
    labelPt: "abóbora de halloween",
    terms:
      "jack-o-lantern abobora de halloween celebration jack lantern pumpkin comemoracao dia das bruxas lanterna",
    group: "activities",
  },
  {
    glyph: "🎄",
    label: "Christmas tree",
    labelPt: "árvore de natal",
    terms: "christmas tree arvore de natal celebration comemoracao pinheirinho",
    group: "activities",
  },
  {
    glyph: "🎆",
    label: "fireworks",
    labelPt: "fogos de artifício",
    terms:
      "fireworks fogos de artificio boom celebration entertainment yolo ano novo comemoracao",
    group: "activities",
  },
  {
    glyph: "🎇",
    label: "sparkler",
    labelPt: "vela estrela",
    terms:
      "sparkler vela estrela boom celebration fireworks sparkle comemoracao fogo de artificio",
    group: "activities",
  },
  {
    glyph: "🧨",
    label: "firecracker",
    labelPt: "bombinha",
    terms:
      "firecracker bombinha dynamite explosive fire fireworks light pop popping spark artificio bomba chiando dinamite estourar explosivo faisca fogo luz pirotecnia roubada",
    group: "activities",
  },
  {
    glyph: "✨️",
    label: "sparkles",
    labelPt: "brilhos",
    terms:
      "sparkles brilhos * magic sparkle star brilhantes estrelas faiscas magica",
    group: "activities",
  },
  {
    glyph: "🎈",
    label: "balloon",
    labelPt: "balão",
    terms:
      "balloon balao birthday celebrate celebration aniversario celebracao comemoracao festa parabens",
    group: "activities",
  },
  {
    glyph: "🎉",
    label: "party popper",
    labelPt: "cone de festa",
    terms:
      "party popper cone de festa awesome birthday celebrate celebration excited hooray tada woohoo alegria aniversario celebrar comemoracao eba oba parabens",
    group: "activities",
  },
  {
    glyph: "🎊",
    label: "confetti ball",
    labelPt: "confete",
    terms:
      "confetti ball confete celebrate celebration party woohoo bola celebracao comemoracao eba oba parabens",
    group: "activities",
  },
  {
    glyph: "🎋",
    label: "tanabata tree",
    labelPt: "árvore de tanabata",
    terms:
      "tanabata tree arvore de banner celebration japanese comemoracao estrelas festival japonesa papel tiras",
    group: "activities",
  },
  {
    glyph: "🎍",
    label: "pine decoration",
    labelPt: "decoração de pinhos",
    terms:
      "pine decoration decoracao de pinhos bamboo celebration japanese plant bambu comemoracao pinhas japones pinha",
    group: "activities",
  },
  {
    glyph: "🎎",
    label: "Japanese dolls",
    labelPt: "bonecas japonesas",
    terms:
      "japanese dolls bonecas japonesas celebration doll festival comemoracao japanesas japones",
    group: "activities",
  },
  {
    glyph: "🎏",
    label: "carp streamer",
    labelPt: "bandeira de carpas",
    terms: "carp streamer bandeira de carpas celebration comemoracao koinobori",
    group: "activities",
  },
  {
    glyph: "🎐",
    label: "wind chime",
    labelPt: "carrilhão de vento",
    terms: "wind chime carrilhao de vento bell celebration sino som",
    group: "activities",
  },
  {
    glyph: "🎑",
    label: "moon viewing ceremony",
    labelPt: "contemplação da lua",
    terms:
      "moon viewing ceremony contemplacao da lua celebration cerimonia de comemoracao",
    group: "activities",
  },
  {
    glyph: "🧧",
    label: "red envelope",
    labelPt: "envelope vermelho",
    terms:
      "red envelope vermelho gift good hongbao lai luck money see boa sorte dinheiro presente",
    group: "activities",
  },
  {
    glyph: "🎀",
    label: "ribbon",
    labelPt: "laço de fita",
    terms: "ribbon laco de fita celebration comemoracao presente",
    group: "activities",
  },
  {
    glyph: "🎁",
    label: "wrapped gift",
    labelPt: "presente",
    terms:
      "wrapped gift presente birthday bow box celebration christmas present surprise comemoracao embrulhado mimo",
    group: "activities",
  },
  {
    glyph: "🎗️",
    label: "reminder ribbon",
    labelPt: "fita de lembrete",
    terms:
      "reminder ribbon fita de lembrete celebration celebracao comemoracao laco",
    group: "activities",
  },
  {
    glyph: "🎟️",
    label: "admission tickets",
    labelPt: "ingresso de cinema",
    terms: "admission tickets ingresso de cinema ticket entrada",
    group: "activities",
  },
  {
    glyph: "🎫",
    label: "ticket",
    labelPt: "ingresso",
    terms: "ticket ingresso admission stub entretenimento",
    group: "activities",
  },
  {
    glyph: "🎖️",
    label: "military medal",
    labelPt: "medalha militar",
    terms:
      "military medal medalha militar award celebration condecoracao premio",
    group: "activities",
  },
  {
    glyph: "🏆️",
    label: "trophy",
    labelPt: "troféu",
    terms:
      "trophy trofeu champion champs prize slay sport victory win winning campea campeao premio",
    group: "activities",
  },
  {
    glyph: "🏅",
    label: "sports medal",
    labelPt: "medalha esportiva",
    terms: "sports medal medalha esportiva award gold winner vitoria",
    group: "activities",
  },
  {
    glyph: "🥇",
    label: "1st place medal",
    labelPt: "medalha de ouro",
    terms: "1st place medal medalha de ouro first gold 1o lugar 1º vitoria",
    group: "activities",
  },
  {
    glyph: "🥈",
    label: "2nd place medal",
    labelPt: "medalha de prata",
    terms: "2nd place medal medalha de prata second silver 2o lugar 2º segundo",
    group: "activities",
  },
  {
    glyph: "🥉",
    label: "3rd place medal",
    labelPt: "medalha de bronze",
    terms: "3rd place medal medalha de bronze third 3o lugar 3º terceiro",
    group: "activities",
  },
  {
    glyph: "⚽️",
    label: "soccer ball",
    labelPt: "bola de futebol",
    terms: "soccer ball bola de futebol football futbol sport jogar",
    group: "activities",
  },
  {
    glyph: "⚾️",
    label: "baseball",
    labelPt: "bola de beisebol",
    terms: "baseball bola de beisebol ball sport esportes",
    group: "activities",
  },
  {
    glyph: "🥎",
    label: "softball",
    labelPt: "softbol",
    terms: "softball softbol ball glove sports underarm bola esporte luva",
    group: "activities",
  },
  {
    glyph: "🏀",
    label: "basketball",
    labelPt: "bola de basquete",
    terms: "basketball bola de basquete ball hoop sport cesta esporte jogo",
    group: "activities",
  },
  {
    glyph: "🏐",
    label: "volleyball",
    labelPt: "bola de vôlei",
    terms: "volleyball bola de volei ball game jogar jogo",
    group: "activities",
  },
  {
    glyph: "🏈",
    label: "american football",
    labelPt: "bola de futebol americano",
    terms:
      "american football bola de futebol americano ball bowl sport super esporte",
    group: "activities",
  },
  {
    glyph: "🏉",
    label: "rugby football",
    labelPt: "bola de rugby",
    terms: "rugby football bola de ball sport americano esporte futebol",
    group: "activities",
  },
  {
    glyph: "🎾",
    label: "tennis",
    labelPt: "tênis",
    terms: "tennis tenis ball racquet sport bola esporte raquete",
    group: "activities",
  },
  {
    glyph: "🥏",
    label: "flying disc",
    labelPt: "frisbee",
    terms: "flying disc frisbee ultimate disco esporte voador",
    group: "activities",
  },
  {
    glyph: "🎳",
    label: "bowling",
    labelPt: "boliche",
    terms: "bowling boliche ball game sport strike bola jogo",
    group: "activities",
  },
  {
    glyph: "🏏",
    label: "cricket game",
    labelPt: "críquete",
    terms: "cricket game criquete ball bat betes bola jogo taco",
    group: "activities",
  },
  {
    glyph: "🏑",
    label: "field hockey",
    labelPt: "hóquei de campo",
    terms: "field hockey hoquei de campo ball game stick bola jogo taco",
    group: "activities",
  },
  {
    glyph: "🏒",
    label: "ice hockey",
    labelPt: "hóquei no gelo",
    terms: "ice hockey hoquei no gelo game puck stick disco jogo taco",
    group: "activities",
  },
  {
    glyph: "🥍",
    label: "lacrosse",
    labelPt: "lacrosse",
    terms:
      "lacrosse ball goal sports stick bastao bola esporte gol raquete taco",
    group: "activities",
  },
  {
    glyph: "🏓",
    label: "ping pong",
    labelPt: "pingue-pongue",
    terms:
      "ping pong pingue-pongue ball bat game paddle pingpong table tennis mesa raquete tenis",
    group: "activities",
  },
  {
    glyph: "🏸",
    label: "badminton",
    labelPt: "badminton",
    terms: "badminton birdie game racquet shuttlecock jogo peteca raquete",
    group: "activities",
  },
  {
    glyph: "🥊",
    label: "boxing glove",
    labelPt: "luva de boxe",
    terms: "boxing glove luva de boxe esporte luta",
    group: "activities",
  },
  {
    glyph: "🥋",
    label: "martial arts uniform",
    labelPt: "quimono de artes marciais",
    terms:
      "martial arts uniform quimono de artes marciais judo karate taekwondo esporte faixa preta uniforme",
    group: "activities",
  },
  {
    glyph: "🥅",
    label: "goal net",
    labelPt: "gol",
    terms: "goal net gol esporte futebol goleira goleiro rede",
    group: "activities",
  },
  {
    glyph: "⛳️",
    label: "flag in hole",
    labelPt: "bandeira no buraco",
    terms: "flag in hole bandeira no buraco golf sport esporte golfe",
    group: "activities",
  },
  {
    glyph: "⛸️",
    label: "ice skate",
    labelPt: "patins de gelo",
    terms: "ice skate patins de gelo skating patinacao",
    group: "activities",
  },
  {
    glyph: "🎣",
    label: "fishing pole",
    labelPt: "pesca",
    terms:
      "fishing pole pesca entertainment fish sport entretenimento peixe pescador pescaria recreacao vara",
    group: "activities",
  },
  {
    glyph: "🤿",
    label: "diving mask",
    labelPt: "máscara de mergulho",
    terms:
      "diving mask mascara de mergulho scuba snorkeling esnorquel mergulhador snorkel",
    group: "activities",
  },
  {
    glyph: "🎽",
    label: "running shirt",
    labelPt: "camiseta de corrida",
    terms: "running shirt camiseta de corrida athletics sash esporte faixa",
    group: "activities",
  },
  {
    glyph: "🎿",
    label: "skis",
    labelPt: "esqui",
    terms: "skis esqui ski snow sport bota esporte esquiar neve",
    group: "activities",
  },
  {
    glyph: "🛷",
    label: "sled",
    labelPt: "trenó",
    terms: "sled treno luge sledge sleigh snow toboggan neve toboga",
    group: "activities",
  },
  {
    glyph: "🥌",
    label: "curling stone",
    labelPt: "pedra de curling",
    terms: "curling stone pedra de game rock jogo",
    group: "activities",
  },
  {
    glyph: "🎯",
    label: "bullseye",
    labelPt: "no alvo",
    terms:
      "bullseye no alvo bull dart direct entertainment game hit target certeiro dardos jogo mira mosca tiro",
    group: "activities",
  },
  {
    glyph: "🪀",
    label: "yo-yo",
    labelPt: "ioiô",
    terms: "yo-yo ioio fluctuate toy brinquedo flutua",
    group: "activities",
  },
  {
    glyph: "🪁",
    label: "kite",
    labelPt: "pipa",
    terms: "kite pipa fly soar papagaio planar voar",
    group: "activities",
  },
  {
    glyph: "🔫",
    label: "water pistol",
    labelPt: "pistola d’água",
    terms:
      "water pistol pistola dagua gun handgun revolver tool weapon arma ferramenta agua",
    group: "activities",
  },
  {
    glyph: "🎱",
    label: "pool 8 ball",
    labelPt: "bilhar",
    terms: "pool 8 ball bilhar 8ball billiard eight game bola oito jogo",
    group: "activities",
  },
  {
    glyph: "🔮",
    label: "crystal ball",
    labelPt: "bola de cristal",
    terms:
      "crystal ball bola de cristal fairy fairytale fantasy fortune future magic tale tool adivinhacao destino futuro prever",
    group: "activities",
  },
  {
    glyph: "🪄",
    label: "magic wand",
    labelPt: "varinha mágica",
    terms:
      "magic wand varinha magica magician witch wizard bruxa condao magia mago",
    group: "activities",
  },
  {
    glyph: "🎮️",
    label: "video game",
    labelPt: "videogame",
    terms:
      "video game videogame controller entertainment controle jogo jogos playstation xbox",
    group: "activities",
  },
  {
    glyph: "🕹️",
    label: "joystick",
    labelPt: "joystick",
    terms: "joystick game video videogame atari controle jogo",
    group: "activities",
  },
  {
    glyph: "🎰",
    label: "slot machine",
    labelPt: "caça-níquel",
    terms:
      "slot machine caca-niquel casino gamble gambling game slots aposta azar cassino jogo maquina",
    group: "activities",
  },
  {
    glyph: "🎲",
    label: "game die",
    labelPt: "jogo de dado",
    terms: "game die jogo de dado dice entertainment dados sorte",
    group: "activities",
  },
  {
    glyph: "🧩",
    label: "puzzle piece",
    labelPt: "quebra-cabeça",
    terms:
      "puzzle piece quebra-cabeca clue interlocking jigsaw dica encaixe peca",
    group: "activities",
  },
  {
    glyph: "🧸",
    label: "teddy bear",
    labelPt: "ursinho de pelúcia",
    terms:
      "teddy bear ursinho de pelucia plaything plush stuffed toy bichinho brinquedo enchimento urso",
    group: "activities",
  },
  {
    glyph: "🪅",
    label: "piñata",
    labelPt: "pinhata",
    terms:
      "pinata pinhata candy celebrate celebration cinco de festive mayo party pinada maio comemoracao doce festa festival",
    group: "activities",
  },
  {
    glyph: "🪩",
    label: "mirror ball",
    labelPt: "globo de espelhos",
    terms:
      "mirror ball globo de espelhos dance disco glitter party balada boate bola brilho danca dancar discoteca espelhado espelho festa night",
    group: "activities",
  },
  {
    glyph: "🪆",
    label: "nesting dolls",
    labelPt: "boneca russa",
    terms:
      "nesting dolls boneca russa babooshka baboushka babushka doll matryoshka russia matriosca matrioska",
    group: "activities",
  },
  {
    glyph: "♠️",
    label: "spade suit",
    labelPt: "naipe de espadas",
    terms: "spade suit naipe de espadas card game baralho carta jogo",
    group: "activities",
  },
  {
    glyph: "♥️",
    label: "heart suit",
    labelPt: "naipe de copas",
    terms:
      "heart suit naipe de copas card emotion game hearts baralho carta jogo s2",
    group: "activities",
  },
  {
    glyph: "♦️",
    label: "diamond suit",
    labelPt: "naipe de ouros",
    terms: "diamond suit naipe de ouros card game baralho carta jogo ouro",
    group: "activities",
  },
  {
    glyph: "♣️",
    label: "club suit",
    labelPt: "naipe de paus",
    terms: "club suit naipe de paus card clubs game baralho carta jogo",
    group: "activities",
  },
  {
    glyph: "♟️",
    label: "chess pawn",
    labelPt: "peão de xadrez",
    terms: "chess pawn peao de xadrez dupe expendable truque",
    group: "activities",
  },
  {
    glyph: "🃏",
    label: "joker",
    labelPt: "curinga",
    terms: "joker curinga card game wildcard baralho carta coringa jogo",
    group: "activities",
  },
  {
    glyph: "🀄️",
    label: "mahjong red dragon",
    labelPt: "dragão vermelho de mahjong",
    terms: "mahjong red dragon dragao vermelho de game jogo peca",
    group: "activities",
  },
  {
    glyph: "🎴",
    label: "flower playing cards",
    labelPt: "carta de flores",
    terms:
      "flower playing cards carta de flores card game japanese baralho hanafuda jogo",
    group: "activities",
  },
  {
    glyph: "🎭️",
    label: "performing arts",
    labelPt: "máscara",
    terms:
      "performing arts mascara actor actress art entertainment mask theater theatre thespian arte ator atriz drama dramatica entretenimento espetaculo performance peca teatro",
    group: "activities",
  },
  {
    glyph: "🖼️",
    label: "framed picture",
    labelPt: "quadro emoldurado",
    terms:
      "framed picture quadro emoldurado art frame museum painting arte moldura museu pintura",
    group: "activities",
  },
  {
    glyph: "🎨",
    label: "artist palette",
    labelPt: "paleta de tintas",
    terms:
      "artist palette paleta de tintas art artsy arty colorful creative entertainment museum painter painting arte artista artistica museu pintor pintura tinta",
    group: "activities",
  },
  {
    glyph: "🧵",
    label: "thread",
    labelPt: "carretel",
    terms:
      "thread carretel needle sewing spool string agulha barbante costura linha",
    group: "activities",
  },
  {
    glyph: "🪡",
    label: "sewing needle",
    labelPt: "agulha de costura",
    terms:
      "sewing needle agulha de costura embroidery sew stitches sutures tailoring thread alfaiataria bordados linha pontos suturas vagonite",
    group: "activities",
  },
  {
    glyph: "🧶",
    label: "yarn",
    labelPt: "novelo",
    terms: "yarn novelo ball crochet knit bola croche la tricotar trico",
    group: "activities",
  },
  {
    glyph: "🪢",
    label: "knot",
    labelPt: "nó",
    terms:
      "knot no cord rope tangled tie twine twist amarrar corda cordel emaranhado fio laco marinheiro",
    group: "activities",
  },
  {
    glyph: "🌍️",
    label: "globe showing Europe-Africa",
    labelPt: "globo mostrando Europa e África",
    terms:
      "globe showing europe-africa globo mostrando europa e africa earth europe world terra",
    group: "travel",
  },
  {
    glyph: "🌎️",
    label: "globe showing Americas",
    labelPt: "globo mostrando as Américas",
    terms:
      "globe showing americas globo mostrando as earth world america terra",
    group: "travel",
  },
  {
    glyph: "🌏️",
    label: "globe showing Asia-Australia",
    labelPt: "globo mostrando Ásia e Oceania",
    terms:
      "globe showing asia-australia globo mostrando asia e oceania australia earth world planeta terra",
    group: "travel",
  },
  {
    glyph: "🌐",
    label: "globe with meridians",
    labelPt: "globo com meridianos",
    terms:
      "globe with meridians globo com meridianos earth internet web world worldwide",
    group: "travel",
  },
  {
    glyph: "🗺️",
    label: "world map",
    labelPt: "mapa-múndi",
    terms: "world map mapa-mundi geografia mapa mundo",
    group: "travel",
  },
  {
    glyph: "🗾",
    label: "map of Japan",
    labelPt: "mapa do Japão",
    terms: "map of japan mapa do japao",
    group: "travel",
  },
  {
    glyph: "🧭",
    label: "compass",
    labelPt: "bússola",
    terms:
      "compass bussola direction magnetic navigation orienteering magnetica direcao magnetico navegacao norte orientacao pontos cardeais ima",
    group: "travel",
  },
  {
    glyph: "🏔️",
    label: "snow-capped mountain",
    labelPt: "montanha com neve",
    terms: "snow-capped mountain montanha com neve cold snow alpes frio",
    group: "travel",
  },
  {
    glyph: "⛰️",
    label: "mountain",
    labelPt: "montanha",
    terms: "mountain montanha natureza",
    group: "travel",
  },
  {
    glyph: "🛘",
    label: "landslide",
    labelPt: "deslizamento",
    terms:
      "landslide deslizamento avalanche danger disaster earthquake mountain mudslide rocks desastre montanha perigo rochas terremoto",
    group: "travel",
  },
  {
    glyph: "🌋",
    label: "volcano",
    labelPt: "vulcão",
    terms:
      "volcano vulcao eruption mountain nature erupcao vulcanica lava natureza",
    group: "travel",
  },
  {
    glyph: "🗻",
    label: "mount fuji",
    labelPt: "Monte Fuji",
    terms: "mount fuji monte mountain nature montanha",
    group: "travel",
  },
  {
    glyph: "🏕️",
    label: "camping",
    labelPt: "acampamento",
    terms: "camping acampamento barraca",
    group: "travel",
  },
  {
    glyph: "🏖️",
    label: "beach with umbrella",
    labelPt: "praia e guarda-sol",
    terms: "beach with umbrella praia e guarda-sol",
    group: "travel",
  },
  {
    glyph: "🏜️",
    label: "desert",
    labelPt: "deserto",
    terms: "desert deserto clima seco",
    group: "travel",
  },
  {
    glyph: "🏝️",
    label: "desert island",
    labelPt: "ilha deserta",
    terms: "desert island ilha deserta palmeira praia",
    group: "travel",
  },
  {
    glyph: "🏞️",
    label: "national park",
    labelPt: "parque nacional",
    terms: "national park parque nacional com rio reserva florestal",
    group: "travel",
  },
  {
    glyph: "🏟️",
    label: "stadium",
    labelPt: "estádio",
    terms: "stadium estadio arena",
    group: "travel",
  },
  {
    glyph: "🏛️",
    label: "classical building",
    labelPt: "prédio grego",
    terms: "classical building predio grego arquitetura classico",
    group: "travel",
  },
  {
    glyph: "🏗️",
    label: "building construction",
    labelPt: "construção",
    terms: "building construction construcao crane guindaste obra",
    group: "travel",
  },
  {
    glyph: "🧱",
    label: "brick",
    labelPt: "tijolo",
    terms:
      "brick tijolo bricks clay mortar wall argamassa argila cimento muro parede terra",
    group: "travel",
  },
  {
    glyph: "🪨",
    label: "rock",
    labelPt: "pedra",
    terms:
      "rock pedra boulder heavy solid stone tough pedregulho pesado rocha seixo solido",
    group: "travel",
  },
  {
    glyph: "🪵",
    label: "wood",
    labelPt: "madeira",
    terms: "wood madeira log lumber timber lenha serrada tora tronco",
    group: "travel",
  },
  {
    glyph: "🛖",
    label: "hut",
    labelPt: "cabana",
    terms: "hut cabana home house roundhouse shelter yurt abrigo casa",
    group: "travel",
  },
  {
    glyph: "🏘️",
    label: "houses",
    labelPt: "casas",
    terms: "houses casas house",
    group: "travel",
  },
  {
    glyph: "🏚️",
    label: "derelict house",
    labelPt: "casa abandonada",
    terms: "derelict house casa abandonada home",
    group: "travel",
  },
  {
    glyph: "🏠️",
    label: "house",
    labelPt: "casa",
    terms:
      "house casa building country heart home ranch settle simple suburban suburbia where construcao domicilio lar residencia",
    group: "travel",
  },
  {
    glyph: "🏡",
    label: "house with garden",
    labelPt: "casa com jardim",
    terms:
      "house with garden casa com jardim building country heart home ranch settle simple suburban suburbia where construcao lar",
    group: "travel",
  },
  {
    glyph: "🏢",
    label: "office building",
    labelPt: "edifício comercial",
    terms: "office building edificio comercial city cubical job escritorio",
    group: "travel",
  },
  {
    glyph: "🏣",
    label: "Japanese post office",
    labelPt: "correio japonês",
    terms: "japanese post office correio japones building oriental predio",
    group: "travel",
  },
  {
    glyph: "🏤",
    label: "post office",
    labelPt: "correio",
    terms: "post office correio building european europeu predio",
    group: "travel",
  },
  {
    glyph: "🏥",
    label: "hospital",
    labelPt: "hospital",
    terms: "hospital building doctor medicine doente internado medico predio",
    group: "travel",
  },
  {
    glyph: "🏦",
    label: "bank",
    labelPt: "banco",
    terms: "bank banco building predio",
    group: "travel",
  },
  {
    glyph: "🏨",
    label: "hotel",
    labelPt: "hotel",
    terms: "hotel building predio",
    group: "travel",
  },
  {
    glyph: "🏩",
    label: "love hotel",
    labelPt: "motel",
    terms: "love hotel motel building amor predio",
    group: "travel",
  },
  {
    glyph: "🏪",
    label: "convenience store",
    labelPt: "loja de conveniência",
    terms:
      "convenience store loja de conveniencia 24 building hours horas 24h predio",
    group: "travel",
  },
  {
    glyph: "🏫",
    label: "school",
    labelPt: "escola",
    terms: "school escola building colegio predio da",
    group: "travel",
  },
  {
    glyph: "🏬",
    label: "department store",
    labelPt: "loja de departamentos",
    terms:
      "department store loja de departamentos building estabelecimento comercial",
    group: "travel",
  },
  {
    glyph: "🏭️",
    label: "factory",
    labelPt: "fábrica",
    terms: "factory fabrica building predio",
    group: "travel",
  },
  {
    glyph: "🏯",
    label: "Japanese castle",
    labelPt: "castelo japonês",
    terms: "japanese castle castelo japones building pagoda pagode predio",
    group: "travel",
  },
  {
    glyph: "🏰",
    label: "castle",
    labelPt: "castelo",
    terms: "castle castelo building european europeu medieval predio",
    group: "travel",
  },
  {
    glyph: "💒",
    label: "wedding",
    labelPt: "capela de casamento",
    terms: "wedding capela de casamento chapel hitched nuptials romance",
    group: "travel",
  },
  {
    glyph: "🗼",
    label: "Tokyo tower",
    labelPt: "Torre de Tóquio",
    terms: "tokyo tower torre de toquio japao",
    group: "travel",
  },
  {
    glyph: "🗽",
    label: "Statue of Liberty",
    labelPt: "Estátua da Liberdade",
    terms: "statue of liberty estatua da liberdade new ny nyc york",
    group: "travel",
  },
  {
    glyph: "⛪️",
    label: "church",
    labelPt: "igreja",
    terms:
      "church igreja bless chapel christian cross religion capela crista cristao missa predio religiao",
    group: "travel",
  },
  {
    glyph: "🕌",
    label: "mosque",
    labelPt: "mesquita",
    terms:
      "mosque mesquita islam masjid muslim religion isla muculmano religiao",
    group: "travel",
  },
  {
    glyph: "🛕",
    label: "hindu temple",
    labelPt: "templo hindu",
    terms: "hindu temple templo",
    group: "travel",
  },
  {
    glyph: "🕍",
    label: "synagogue",
    labelPt: "sinagoga",
    terms:
      "synagogue sinagoga jew jewish judaism religion temple judaismo judeu judia religiao templo",
    group: "travel",
  },
  {
    glyph: "⛩️",
    label: "shinto shrine",
    labelPt: "santuário japonês",
    terms:
      "shinto shrine santuario japones religion oriental religiao xintoismo",
    group: "travel",
  },
  {
    glyph: "🕋",
    label: "kaaba",
    labelPt: "caaba islã",
    terms:
      "kaaba caaba isla hajj islam muslim religion umrah muculmano religiao",
    group: "travel",
  },
  {
    glyph: "⛲️",
    label: "fountain",
    labelPt: "fonte",
    terms: "fountain fonte chafariz praca agua",
    group: "travel",
  },
  {
    glyph: "⛺️",
    label: "tent",
    labelPt: "barraca",
    terms: "tent barraca camping acampamento acampar",
    group: "travel",
  },
  {
    glyph: "🌁",
    label: "foggy",
    labelPt: "enevoado",
    terms: "foggy enevoado fog bruma cerracao neblina nevoeiro nevoa",
    group: "travel",
  },
  {
    glyph: "🌃",
    label: "night with stars",
    labelPt: "noite estrelada",
    terms: "night with stars noite estrelada star cidade a estrelas predios",
    group: "travel",
  },
  {
    glyph: "🏙️",
    label: "cityscape",
    labelPt: "cidade",
    terms: "cityscape cidade city predios urbano",
    group: "travel",
  },
  {
    glyph: "🌄",
    label: "sunrise over mountains",
    labelPt: "aurora sobre montanhas",
    terms:
      "sunrise over mountains aurora sobre montanhas morning sun montanha nascer do sol as da manha",
    group: "travel",
  },
  {
    glyph: "🌅",
    label: "sunrise",
    labelPt: "aurora sobre água",
    terms:
      "sunrise aurora sobre agua morning nature sun amanhecer natureza oceano rio sol da manha nascendo",
    group: "travel",
  },
  {
    glyph: "🌆",
    label: "cityscape at dusk",
    labelPt: "cidade ao anoitecer",
    terms:
      "cityscape at dusk cidade ao anoitecer building city evening landscape sun sunset noite paisagem predio por do sol",
    group: "travel",
  },
  {
    glyph: "🌇",
    label: "sunset",
    labelPt: "pôr do sol",
    terms:
      "sunset por do sol building dusk sun anoitecer calor cidade entardecer predio sobre predios",
    group: "travel",
  },
  {
    glyph: "🌉",
    label: "bridge at night",
    labelPt: "ponte à noite",
    terms: "bridge at night ponte a noite pontilhao",
    group: "travel",
  },
  {
    glyph: "♨️",
    label: "hot springs",
    labelPt: "chamas",
    terms: "hot springs chamas hotsprings steaming calor fogo fumaca quente",
    group: "travel",
  },
  {
    glyph: "🎠",
    label: "carousel horse",
    labelPt: "carrossel",
    terms:
      "carousel horse carrossel entertainment cavalo de entretenimento parque diversao",
    group: "travel",
  },
  {
    glyph: "🛝",
    label: "playground slide",
    labelPt: "escorregador",
    terms:
      "playground slide escorregador amusement park play playing sliding theme brincar brinquedo escorregar parque de diversoes parquinho",
    group: "travel",
  },
  {
    glyph: "🎡",
    label: "ferris wheel",
    labelPt: "roda gigante",
    terms:
      "ferris wheel roda gigante amusement park theme entretenimento parque de diversoes",
    group: "travel",
  },
  {
    glyph: "🎢",
    label: "roller coaster",
    labelPt: "montanha russa",
    terms:
      "roller coaster montanha russa amusement park theme entretenimento parque de diversoes tematico",
    group: "travel",
  },
  {
    glyph: "💈",
    label: "barber pole",
    labelPt: "barbearia",
    terms:
      "barber pole barbearia cut fresh haircut shave barbeiro cortar cabelo poste de",
    group: "travel",
  },
  {
    glyph: "🎪",
    label: "circus tent",
    labelPt: "circo",
    terms: "circus tent circo entretenimento lona de tenda",
    group: "travel",
  },
  {
    glyph: "🚂",
    label: "locomotive",
    labelPt: "locomotiva",
    terms:
      "locomotive locomotiva caboose engine railway steam train trains travel trem vapor veiculo",
    group: "travel",
  },
  {
    glyph: "🚃",
    label: "railway car",
    labelPt: "vagão de trem",
    terms:
      "railway car vagao de trem electric train tram travel trolleybus bonde eletrico ferroviario transporte trolebus veiculo",
    group: "travel",
  },
  {
    glyph: "🚄",
    label: "high-speed train",
    labelPt: "trem de alta velocidade",
    terms:
      "high-speed train trem de alta velocidade railway shinkansen speed bala japones trens veloz veiculo",
    group: "travel",
  },
  {
    glyph: "🚅",
    label: "bullet train",
    labelPt: "trem de alta velocidade japonês",
    terms:
      "bullet train trem de alta velocidade japones high-speed nose railway shinkansen speed travel bala ferrovia japao veloz viagem",
    group: "travel",
  },
  {
    glyph: "🚆",
    label: "train",
    labelPt: "trem",
    terms: "train trem arrived choo railway ferrovia veiculo",
    group: "travel",
  },
  {
    glyph: "🚇️",
    label: "metro",
    labelPt: "metrô",
    terms: "metro subway travel trem tunel subterraneo veiculo",
    group: "travel",
  },
  {
    glyph: "🚈",
    label: "light rail",
    labelPt: "trem urbano",
    terms:
      "light rail trem urbano arrived monorail railway chegada cheguei leve veiculo",
    group: "travel",
  },
  {
    glyph: "🚉",
    label: "station",
    labelPt: "estação",
    terms: "station estacao railway train de trem metro",
    group: "travel",
  },
  {
    glyph: "🚊",
    label: "tram",
    labelPt: "bonde elétrico",
    terms: "tram bonde eletrico trolleybus trolebus veiculo",
    group: "travel",
  },
  {
    glyph: "🚝",
    label: "monorail",
    labelPt: "monotrilho",
    terms: "monorail monotrilho vehicle trem veiculo",
    group: "travel",
  },
  {
    glyph: "🚞",
    label: "mountain railway",
    labelPt: "estrada de ferro na montanha",
    terms:
      "mountain railway estrada de ferro na montanha car trip carro teleferico veiculo",
    group: "travel",
  },
  {
    glyph: "🚋",
    label: "tram car",
    labelPt: "bonde",
    terms:
      "tram car bonde bus trolley trolleybus eletrico carro trolebus veiculo",
    group: "travel",
  },
  {
    glyph: "🚌",
    label: "bus",
    labelPt: "ônibus",
    terms: "bus onibus school vehicle transporte publico veiculo",
    group: "travel",
  },
  {
    glyph: "🚍️",
    label: "oncoming bus",
    labelPt: "ônibus se aproximando",
    terms: "oncoming bus onibus se aproximando cars veiculo",
    group: "travel",
  },
  {
    glyph: "🚎",
    label: "trolleybus",
    labelPt: "trólebus",
    terms:
      "trolleybus trolebus bus tram trolley bonde eletrico veiculo onibus movido a eletricidade",
    group: "travel",
  },
  {
    glyph: "🚐",
    label: "minibus",
    labelPt: "van",
    terms: "minibus van bus drive vehicle mini onibus veraneio veiculo",
    group: "travel",
  },
  {
    glyph: "🚑️",
    label: "ambulance",
    labelPt: "ambulância",
    terms: "ambulance ambulancia emergency vehicle veiculo",
    group: "travel",
  },
  {
    glyph: "🚒",
    label: "fire engine",
    labelPt: "carro do corpo de bombeiros",
    terms:
      "fire engine carro do corpo de bombeiros truck bombeiro caminhao fogo incendio veiculo",
    group: "travel",
  },
  {
    glyph: "🚓",
    label: "police car",
    labelPt: "viatura policial",
    terms:
      "police car viatura policial 5 0 cops patrol carro patrulha policia veiculo",
    group: "travel",
  },
  {
    glyph: "🚔️",
    label: "oncoming police car",
    labelPt: "viatura policial se aproximando",
    terms:
      "oncoming police car viatura policial se aproximando policia veiculo",
    group: "travel",
  },
  {
    glyph: "🚕",
    label: "taxi",
    labelPt: "táxi",
    terms: "taxi cab cabbie car drive vehicle yellow veiculo",
    group: "travel",
  },
  {
    glyph: "🚖",
    label: "oncoming taxi",
    labelPt: "táxi se aproximando",
    terms:
      "oncoming taxi se aproximando cab cabbie cars drove hail yellow chegada transporte veiculo",
    group: "travel",
  },
  {
    glyph: "🚗",
    label: "automobile",
    labelPt: "carro",
    terms: "automobile carro car driving vehicle automovel veiculo",
    group: "travel",
  },
  {
    glyph: "🚘️",
    label: "oncoming automobile",
    labelPt: "carro se aproximando",
    terms:
      "oncoming automobile carro se aproximando car cars drove vehicle automovel carona chegada veiculo",
    group: "travel",
  },
  {
    glyph: "🚙",
    label: "sport utility vehicle",
    labelPt: "SUV",
    terms:
      "sport utility vehicle suv car drive recreational sportutility carro trailer veiculo recreacional",
    group: "travel",
  },
  {
    glyph: "🛻",
    label: "pickup truck",
    labelPt: "caminhonete",
    terms:
      "pickup truck caminhonete automobile car flatbed pick-up transportation automovel caminhao carro cacamba picape transporte veiculo",
    group: "travel",
  },
  {
    glyph: "🚚",
    label: "delivery truck",
    labelPt: "caminhão de entrega",
    terms: "delivery truck caminhao de entrega car drive vehicle veiculo",
    group: "travel",
  },
  {
    glyph: "🚛",
    label: "articulated lorry",
    labelPt: "caminhão",
    terms:
      "articulated lorry caminhao car drive move semi truck vehicle articulado trailer veiculo",
    group: "travel",
  },
  {
    glyph: "🚜",
    label: "tractor",
    labelPt: "trator",
    terms: "tractor trator vehicle obra veiculo",
    group: "travel",
  },
  {
    glyph: "🏎️",
    label: "racing car",
    labelPt: "carro de corrida",
    terms: "racing car carro de corrida zoom automobilismo",
    group: "travel",
  },
  {
    glyph: "🏍️",
    label: "motorcycle",
    labelPt: "motocicleta",
    terms: "motorcycle motocicleta racing corrida moto veiculo",
    group: "travel",
  },
  {
    glyph: "🛵",
    label: "motor scooter",
    labelPt: "scooter",
    terms: "motor scooter monareta motinho moto motoca",
    group: "travel",
  },
  {
    glyph: "🦽",
    label: "manual wheelchair",
    labelPt: "cadeira de rodas manual",
    terms: "manual wheelchair cadeira de rodas accessibility acessibilidade",
    group: "travel",
  },
  {
    glyph: "🦼",
    label: "motorized wheelchair",
    labelPt: "cadeira de rodas motorizada",
    terms:
      "motorized wheelchair cadeira de rodas motorizada accessibility acessibilidade",
    group: "travel",
  },
  {
    glyph: "🛺",
    label: "auto rickshaw",
    labelPt: "automóvel riquixá",
    terms: "auto rickshaw automovel riquixa tuk autorriquixa",
    group: "travel",
  },
  {
    glyph: "🚲️",
    label: "bicycle",
    labelPt: "bicicleta",
    terms:
      "bicycle bicicleta bike class cycle cycling cyclist gang ride spin spinning veiculo",
    group: "travel",
  },
  {
    glyph: "🛴",
    label: "kick scooter",
    labelPt: "patinete",
    terms: "kick scooter patinete brinquedo",
    group: "travel",
  },
  {
    glyph: "🛹",
    label: "skateboard",
    labelPt: "skate",
    terms: "skateboard skate board skater wheels rodinhas skatista",
    group: "travel",
  },
  {
    glyph: "🛼",
    label: "roller skate",
    labelPt: "patins de rodas",
    terms: "roller skate patins de rodas blades skates sport esporte patinacao",
    group: "travel",
  },
  {
    glyph: "🚏",
    label: "bus stop",
    labelPt: "ponto de ônibus",
    terms: "bus stop ponto de onibus busstop busao transporte publico",
    group: "travel",
  },
  {
    glyph: "🛣️",
    label: "motorway",
    labelPt: "estrada",
    terms: "motorway estrada highway road caminho viagem viajar",
    group: "travel",
  },
  {
    glyph: "🛤️",
    label: "railway track",
    labelPt: "trilhos",
    terms: "railway track trilhos train trem",
    group: "travel",
  },
  {
    glyph: "🛢️",
    label: "oil drum",
    labelPt: "barril de óleo",
    terms: "oil drum barril de oleo lata latao",
    group: "travel",
  },
  {
    glyph: "⛽️",
    label: "fuel pump",
    labelPt: "posto de gasolina",
    terms:
      "fuel pump posto de gasolina diesel fuelpump gas gasoline station abastecer bomba combustivel alcool",
    group: "travel",
  },
  {
    glyph: "🛞",
    label: "wheel",
    labelPt: "roda",
    terms:
      "wheel roda car circle tire turn vehicle carro circulo direcao girar pneu veiculo volante",
    group: "travel",
  },
  {
    glyph: "🚨",
    label: "police car light",
    labelPt: "sirene",
    terms:
      "police car light sirene alarm alert beacon emergency revolving siren carro da policia farol policial luz de viatura giratoria",
    group: "travel",
  },
  {
    glyph: "🚥",
    label: "horizontal traffic light",
    labelPt: "semáforo horizontal",
    terms:
      "horizontal traffic light semaforo intersection signal stop stoplight cruzamento luz sinal sinaleira transito",
    group: "travel",
  },
  {
    glyph: "🚦",
    label: "vertical traffic light",
    labelPt: "semáforo vertical",
    terms:
      "vertical traffic light semaforo drove intersection signal stop stoplight cruzamento luz sinal sinaleira transito",
    group: "travel",
  },
  {
    glyph: "🛑",
    label: "stop sign",
    labelPt: "sinal de pare",
    terms: "stop sign sinal de pare octagonal",
    group: "travel",
  },
  {
    glyph: "🚧",
    label: "construction",
    labelPt: "em construção",
    terms: "construction em construcao barrier simbolo para",
    group: "travel",
  },
  {
    glyph: "⚓️",
    label: "anchor",
    labelPt: "âncora",
    terms: "anchor ancora ship tool marinha navegar sinal",
    group: "travel",
  },
  {
    glyph: "🛟",
    label: "ring buoy",
    labelPt: "boia",
    terms:
      "ring buoy boia float life lifesaver preserver rescue safety save saver swim colete flutuar guarda-vidas guardar nadar resgate salva salva-vidas seguranca vidas",
    group: "travel",
  },
  {
    glyph: "⛵️",
    label: "sailboat",
    labelPt: "barco a vela",
    terms:
      "sailboat barco a vela boat resort sailing sea yacht iate navegar oceano praia",
    group: "travel",
  },
  {
    glyph: "🛶",
    label: "canoe",
    labelPt: "canoa",
    terms: "canoe canoa boat barco",
    group: "travel",
  },
  {
    glyph: "🚤",
    label: "speedboat",
    labelPt: "lancha",
    terms:
      "speedboat lancha billionaire boat lake luxury millionaire summer travel barco ferias praia verao veiculo",
    group: "travel",
  },
  {
    glyph: "🛳️",
    label: "passenger ship",
    labelPt: "cruzeiro",
    terms: "passenger ship cruzeiro barco embarcacao navio passageiros veiculo",
    group: "travel",
  },
  {
    glyph: "⛴️",
    label: "ferry",
    labelPt: "balsa",
    terms: "ferry balsa boat passenger barco ferry-boat navegar",
    group: "travel",
  },
  {
    glyph: "🛥️",
    label: "motor boat",
    labelPt: "barco",
    terms: "motor boat barco motorboat lancha navio veiculo",
    group: "travel",
  },
  {
    glyph: "🚢",
    label: "ship",
    labelPt: "navio",
    terms:
      "ship navio boat passenger travel aquatico barco cruzeiro ferias veiculo viagem",
    group: "travel",
  },
  {
    glyph: "✈️",
    label: "airplane",
    labelPt: "avião",
    terms:
      "airplane aviao aeroplane fly flying jet plane travel aereo veiculo viajar voar voo",
    group: "travel",
  },
  {
    glyph: "🛩️",
    label: "small airplane",
    labelPt: "avião pequeno",
    terms:
      "small airplane aviao pequeno aeroplane plane aereo jatinho jato veiculo",
    group: "travel",
  },
  {
    glyph: "🛫",
    label: "airplane departure",
    labelPt: "avião decolando",
    terms:
      "airplane departure aviao decolando aeroplane check-in departures plane decolar fui ferias partindo partiu viagem viajando",
    group: "travel",
  },
  {
    glyph: "🛬",
    label: "airplane arrival",
    labelPt: "avião aterrissando",
    terms:
      "airplane arrival aviao aterrissando aeroplane arrivals arriving landing plane aterrissagem chegando pousando veiculo voltando",
    group: "travel",
  },
  {
    glyph: "🪂",
    label: "parachute",
    labelPt: "paraquedas",
    terms:
      "parachute paraquedas hang-glide parasail skydive asa-delta paraquedista saltar de",
    group: "travel",
  },
  {
    glyph: "💺",
    label: "seat",
    labelPt: "assento",
    terms: "seat assento chair cadeira poltrona",
    group: "travel",
  },
  {
    glyph: "🚁",
    label: "helicopter",
    labelPt: "helicóptero",
    terms:
      "helicopter helicoptero copter roflcopter travel vehicle veiculo viagem viajar voo",
    group: "travel",
  },
  {
    glyph: "🚟",
    label: "suspension railway",
    labelPt: "estrada de ferro suspensa",
    terms:
      "suspension railway estrada de ferro suspensa suspensao trem veiculo",
    group: "travel",
  },
  {
    glyph: "🚠",
    label: "mountain cableway",
    labelPt: "teleférico de montanha",
    terms:
      "mountain cableway teleferico de montanha cable gondola lift ski bonde cabo suspenso usado em telefericos nas montanhas na veiculo",
    group: "travel",
  },
  {
    glyph: "🚡",
    label: "aerial tramway",
    labelPt: "teleférico",
    terms:
      "aerial tramway teleferico cable car gondola ropeway aerea bonde linha veiculo",
    group: "travel",
  },
  {
    glyph: "🛰️",
    label: "satellite",
    labelPt: "satélite",
    terms: "satellite satelite space antena espaco",
    group: "travel",
  },
  {
    glyph: "🚀",
    label: "rocket",
    labelPt: "foguete",
    terms: "rocket foguete launch rockets space travel espaco veiculo",
    group: "travel",
  },
  {
    glyph: "🛸",
    label: "flying saucer",
    labelPt: "disco voador",
    terms:
      "flying saucer disco voador aliens extra terrestrial ufo alienigena et terrestre ovni",
    group: "travel",
  },
  {
    glyph: "🛎️",
    label: "bellhop bell",
    labelPt: "sineta",
    terms: "bellhop bell sineta hotel portaria sino",
    group: "travel",
  },
  {
    glyph: "🧳",
    label: "luggage",
    labelPt: "mala",
    terms:
      "luggage mala bag packing roller suitcase travel bagagem rodinhas viagem",
    group: "travel",
  },
  {
    glyph: "⌛️",
    label: "hourglass done",
    labelPt: "ampulheta",
    terms: "hourglass done ampulheta sand time timer areia tempo",
    group: "travel",
  },
  {
    glyph: "⏳️",
    label: "hourglass not done",
    labelPt: "ampulheta contando o tempo",
    terms:
      "hourglass not done ampulheta contando o tempo flowing hours sand timer waiting yolo areia cheia em cima hora relogio",
    group: "travel",
  },
  {
    glyph: "⌚️",
    label: "watch",
    labelPt: "relógio de pulso",
    terms: "watch relogio de pulso clock time hora tempo",
    group: "travel",
  },
  {
    glyph: "⏰️",
    label: "alarm clock",
    labelPt: "despertador",
    terms:
      "alarm clock despertador hours hrs late time waiting alarme atrasada atrasado hora horario relogio",
    group: "travel",
  },
  {
    glyph: "⏱️",
    label: "stopwatch",
    labelPt: "cronômetro",
    terms: "stopwatch cronometro clock time relogio tempo",
    group: "travel",
  },
  {
    glyph: "⏲️",
    label: "timer clock",
    labelPt: "relógio temporizador",
    terms: "timer clock relogio temporizador cronometro",
    group: "travel",
  },
  {
    glyph: "🕰️",
    label: "mantelpiece clock",
    labelPt: "relógio de mesa",
    terms: "mantelpiece clock relogio de mesa time antigo",
    group: "travel",
  },
  {
    glyph: "🕛️",
    label: "twelve o’clock",
    labelPt: "12 horas",
    terms:
      "twelve oclock 12 horas 00 clock time 12h00 doze meia-noite meio-dia relogio",
    group: "travel",
  },
  {
    glyph: "🕧️",
    label: "twelve-thirty",
    labelPt: "doze e meia",
    terms:
      "twelve-thirty doze e meia 12 30 clock thirty time twelve 12h30 relogio",
    group: "travel",
  },
  {
    glyph: "🕐️",
    label: "one o’clock",
    labelPt: "1 hora",
    terms: "one oclock 1 hora 00 clock time 13h 1h 1h00 relogio uma",
    group: "travel",
  },
  {
    glyph: "🕜️",
    label: "one-thirty",
    labelPt: "uma e meia",
    terms:
      "one-thirty uma e meia 1 30 clock one thirty time 13 13h30 1h30 relogio",
    group: "travel",
  },
  {
    glyph: "🕑️",
    label: "two o’clock",
    labelPt: "2 horas",
    terms: "two oclock 2 horas 00 clock time 14h 2h 2h00 duas relogio",
    group: "travel",
  },
  {
    glyph: "🕝️",
    label: "two-thirty",
    labelPt: "duas e meia",
    terms: "two-thirty duas e meia 2 30 clock thirty time two 2h30 relogio",
    group: "travel",
  },
  {
    glyph: "🕒️",
    label: "three o’clock",
    labelPt: "3 horas",
    terms:
      "three oclock 3 horas 00 clock time 15h 3h00 hora horario relogio tres",
    group: "travel",
  },
  {
    glyph: "🕞️",
    label: "three-thirty",
    labelPt: "três e meia",
    terms: "three-thirty tres e meia 3 30 clock thirty three time 3h30 relogio",
    group: "travel",
  },
  {
    glyph: "🕓️",
    label: "four o’clock",
    labelPt: "4 horas",
    terms: "four oclock 4 horas 00 clock time 4h00 horario quatro relogio",
    group: "travel",
  },
  {
    glyph: "🕟️",
    label: "four-thirty",
    labelPt: "quatro e meia",
    terms: "four-thirty quatro e meia 30 4 clock four thirty time 4h30 relogio",
    group: "travel",
  },
  {
    glyph: "🕔️",
    label: "five o’clock",
    labelPt: "5 horas",
    terms: "five oclock 5 horas 00 clock time 5h00 cinco relogio",
    group: "travel",
  },
  {
    glyph: "🕠️",
    label: "five-thirty",
    labelPt: "cinco e meia",
    terms:
      "five-thirty cinco e meia 30 5 clock five thirty time 17h30 5h30 relogio",
    group: "travel",
  },
  {
    glyph: "🕕️",
    label: "six o’clock",
    labelPt: "6 horas",
    terms: "six oclock 6 horas 00 clock time 18h 6h00 relogio seis",
    group: "travel",
  },
  {
    glyph: "🕡️",
    label: "six-thirty",
    labelPt: "seis e meia",
    terms: "six-thirty seis e meia 30 6 clock six thirty 18h30 6h30 relogio",
    group: "travel",
  },
  {
    glyph: "🕖️",
    label: "seven o’clock",
    labelPt: "7 horas",
    terms: "seven oclock 7 horas 0 00 clock 19h 7h00 relogio sete",
    group: "travel",
  },
  {
    glyph: "🕢️",
    label: "seven-thirty",
    labelPt: "sete e meia",
    terms: "seven-thirty sete e meia 30 7 clock seven thirty 7h30 relogio",
    group: "travel",
  },
  {
    glyph: "🕗️",
    label: "eight o’clock",
    labelPt: "8 horas",
    terms: "eight oclock 8 horas 00 clock time 8h00 hora oito relogio",
    group: "travel",
  },
  {
    glyph: "🕣️",
    label: "eight-thirty",
    labelPt: "oito e meia",
    terms: "eight-thirty oito e meia 30 8 clock eight thirty time 8h30 relogio",
    group: "travel",
  },
  {
    glyph: "🕘️",
    label: "nine o’clock",
    labelPt: "9 horas",
    terms: "nine oclock 9 horas 00 clock time 21h 9h00 nove relogio",
    group: "travel",
  },
  {
    glyph: "🕤️",
    label: "nine-thirty",
    labelPt: "nove e meia",
    terms:
      "nine-thirty nove e meia 30 9 clock nine thirty time 9h30 hora relogio",
    group: "travel",
  },
  {
    glyph: "🕙️",
    label: "ten o’clock",
    labelPt: "10 horas",
    terms: "ten oclock 10 horas 0 00 clock 10h00 22h dez relogio",
    group: "travel",
  },
  {
    glyph: "🕥️",
    label: "ten-thirty",
    labelPt: "dez e meia",
    terms:
      "ten-thirty dez e meia 10 30 clock ten thirty time 10h30 22h30 relogio",
    group: "travel",
  },
  {
    glyph: "🕚️",
    label: "eleven o’clock",
    labelPt: "11 horas",
    terms: "eleven oclock 11 horas 00 clock time 11h00 onze relogio",
    group: "travel",
  },
  {
    glyph: "🕦️",
    label: "eleven-thirty",
    labelPt: "onze e meia",
    terms:
      "eleven-thirty onze e meia 11 30 clock eleven thirty time 11h30 23h30 relogio",
    group: "travel",
  },
  {
    glyph: "🌑",
    label: "new moon",
    labelPt: "lua nova",
    terms: "new moon lua nova dark space escuro negra noite",
    group: "travel",
  },
  {
    glyph: "🌒",
    label: "waxing crescent moon",
    labelPt: "lua crescente côncava",
    terms: "waxing crescent moon lua crescente concava dreams space noite",
    group: "travel",
  },
  {
    glyph: "🌓",
    label: "first quarter moon",
    labelPt: "quarto crescente",
    terms: "first quarter moon quarto crescente space lua de",
    group: "travel",
  },
  {
    glyph: "🌔",
    label: "waxing gibbous moon",
    labelPt: "lua crescente convexa",
    terms: "waxing gibbous moon lua crescente convexa space",
    group: "travel",
  },
  {
    glyph: "🌕️",
    label: "full moon",
    labelPt: "lua cheia",
    terms: "full moon lua cheia space luar",
    group: "travel",
  },
  {
    glyph: "🌖",
    label: "waning gibbous moon",
    labelPt: "lua minguante convexa",
    terms: "waning gibbous moon lua minguante convexa space",
    group: "travel",
  },
  {
    glyph: "🌗",
    label: "last quarter moon",
    labelPt: "quarto minguante",
    terms: "last quarter moon quarto minguante space lua de",
    group: "travel",
  },
  {
    glyph: "🌘",
    label: "waning crescent moon",
    labelPt: "lua minguante côncava",
    terms: "waning crescent moon lua minguante concava space",
    group: "travel",
  },
  {
    glyph: "🌙",
    label: "crescent moon",
    labelPt: "lua crescente",
    terms: "crescent moon lua crescente ramadan space",
    group: "travel",
  },
  {
    glyph: "🌚",
    label: "new moon face",
    labelPt: "rosto da lua nova",
    terms: "new moon face rosto da lua nova space com",
    group: "travel",
  },
  {
    glyph: "🌛",
    label: "first quarter moon face",
    labelPt: "rosto da lua de quarto crescente",
    terms:
      "first quarter moon face rosto da lua de quarto crescente space noite",
    group: "travel",
  },
  {
    glyph: "🌜️",
    label: "last quarter moon face",
    labelPt: "rosto da lua de quarto minguante",
    terms: "last quarter moon face rosto da lua de quarto minguante dreams com",
    group: "travel",
  },
  {
    glyph: "🌡️",
    label: "thermometer",
    labelPt: "termômetro",
    terms: "thermometer termometro weather clima temperatura tempo",
    group: "travel",
  },
  {
    glyph: "☀️",
    label: "sun",
    labelPt: "sol",
    terms:
      "sun sol bright rays space sunny weather clima dia claro raios solar tempo",
    group: "travel",
  },
  {
    glyph: "🌝",
    label: "full moon face",
    labelPt: "rosto da lua cheia",
    terms: "full moon face rosto da lua cheia bright com",
    group: "travel",
  },
  {
    glyph: "🌞",
    label: "sun with face",
    labelPt: "rosto do sol",
    terms:
      "sun with face rosto do sol beach bright day heat shine sunny sunshine weather praia",
    group: "travel",
  },
  {
    glyph: "🪐",
    label: "ringed planet",
    labelPt: "planeta com anéis",
    terms: "ringed planet planeta com aneis saturn saturnine saturnino saturno",
    group: "travel",
  },
  {
    glyph: "⭐️",
    label: "star",
    labelPt: "estrela branca média",
    terms:
      "star estrela branca media astronomy medium stars white amarela astronomia",
    group: "travel",
  },
  {
    glyph: "🌟",
    label: "glowing star",
    labelPt: "estrela brilhante",
    terms:
      "glowing star estrela brilhante glittery glow night shining sparkle win brilho cintilante luminosa reluzente",
    group: "travel",
  },
  {
    glyph: "🌠",
    label: "shooting star",
    labelPt: "estrela cadente",
    terms: "shooting star estrela cadente falling night space cai",
    group: "travel",
  },
  {
    glyph: "🌌",
    label: "milky way",
    labelPt: "via láctea",
    terms: "milky way via lactea space ceu espaco estrelado",
    group: "travel",
  },
  {
    glyph: "☁️",
    label: "cloud",
    labelPt: "nuvem",
    terms: "cloud nuvem weather clima",
    group: "travel",
  },
  {
    glyph: "⛅️",
    label: "sun behind cloud",
    labelPt: "sol por trás das nuvens",
    terms:
      "sun behind cloud sol por tras das nuvens cloudy weather clima nublado nuvem",
    group: "travel",
  },
  {
    glyph: "⛈️",
    label: "cloud with lightning and rain",
    labelPt: "chuva com trovão",
    terms:
      "cloud with lightning and rain chuva com trovao thunder thunderstorm clima nuvem relampago temporal",
    group: "travel",
  },
  {
    glyph: "🌤️",
    label: "sun behind small cloud",
    labelPt: "sol com nuvens",
    terms:
      "sun behind small cloud sol com nuvens weather clima ensolarado nublado nuvem",
    group: "travel",
  },
  {
    glyph: "🌥️",
    label: "sun behind large cloud",
    labelPt: "nublado",
    terms: "sun behind large cloud nublado weather clima nuvem sol",
    group: "travel",
  },
  {
    glyph: "🌦️",
    label: "sun behind rain cloud",
    labelPt: "sol com chuva",
    terms: "sun behind rain cloud sol com chuva weather clima nuvem",
    group: "travel",
  },
  {
    glyph: "🌧️",
    label: "cloud with rain",
    labelPt: "nuvem com chuva",
    terms: "cloud with rain nuvem com chuva weather chovendo clima",
    group: "travel",
  },
  {
    glyph: "🌨️",
    label: "cloud with snow",
    labelPt: "nuvem com neve",
    terms: "cloud with snow nuvem com neve cold weather clima frio",
    group: "travel",
  },
  {
    glyph: "🌩️",
    label: "cloud with lightning",
    labelPt: "nuvem com trovão",
    terms: "cloud with lightning nuvem com trovao weather clima relampago",
    group: "travel",
  },
  {
    glyph: "🌪️",
    label: "tornado",
    labelPt: "tornado",
    terms: "tornado cloud weather whirlwind clima furacao nuvem",
    group: "travel",
  },
  {
    glyph: "🌫️",
    label: "fog",
    labelPt: "nevoeiro",
    terms: "fog nevoeiro cloud weather clima furacao neblina nuvem",
    group: "travel",
  },
  {
    glyph: "🌬️",
    label: "wind face",
    labelPt: "rosto de vento",
    terms: "wind face rosto de vento blow cloud clima nuvem soprar sopro",
    group: "travel",
  },
  {
    glyph: "🌀",
    label: "cyclone",
    labelPt: "ciclone",
    terms:
      "cyclone ciclone dizzy hurricane twister typhoon weather clima espiral furacao tonto zonzo",
    group: "travel",
  },
  {
    glyph: "🌈",
    label: "rainbow",
    labelPt: "arco-íris",
    terms:
      "rainbow arco-iris gay genderqueer glbt glbtq lesbian lgbt lgbtq lgbtqia nature pride queer rain trans transgender weather chuva clima lgbtqia+ lesbica natureza orgulho transgenero",
    group: "travel",
  },
  {
    glyph: "🌂",
    label: "closed umbrella",
    labelPt: "guarda-chuva fechado",
    terms: "closed umbrella guarda-chuva fechado clothing rain chuva chuvoso",
    group: "travel",
  },
  {
    glyph: "☂️",
    label: "umbrella",
    labelPt: "guarda-chuva",
    terms:
      "umbrella guarda-chuva clothing rain acessorio chuva clima sombrinha aberta",
    group: "travel",
  },
  {
    glyph: "☔️",
    label: "umbrella with rain drops",
    labelPt: "sombrinha na chuva",
    terms:
      "umbrella with rain drops sombrinha na chuva clothing drop weather acessorio clima gotas guarda-chuva",
    group: "travel",
  },
  {
    glyph: "⛱️",
    label: "umbrella on ground",
    labelPt: "guarda-sol",
    terms:
      "umbrella on ground guarda-sol rain sun chuva clima praia sol sombra sombrinha",
    group: "travel",
  },
  {
    glyph: "⚡️",
    label: "high voltage",
    labelPt: "alta tensão",
    terms:
      "high voltage alta tensao danger electric electricity lightning nature thunder thunderbolt zap eletricidade natureza perigo relampago sinal",
    group: "travel",
  },
  {
    glyph: "❄️",
    label: "snowflake",
    labelPt: "floco de neve",
    terms: "snowflake floco de neve cold snow weather clima frio",
    group: "travel",
  },
  {
    glyph: "☃️",
    label: "snowman",
    labelPt: "boneco de neve",
    terms: "snowman boneco de neve cold man snow clima frio inverno",
    group: "travel",
  },
  {
    glyph: "⛄️",
    label: "snowman without snow",
    labelPt: "boneco de neve sem neve",
    terms: "snowman without snow boneco de neve sem cold man frio inverno",
    group: "travel",
  },
  {
    glyph: "☄️",
    label: "comet",
    labelPt: "cometa",
    terms: "comet cometa space espaco estrela cadente meteoro satelite",
    group: "travel",
  },
  {
    glyph: "🔥",
    label: "fire",
    labelPt: "fogo",
    terms: "fire fogo af burn flame hot lit litaf tool chama",
    group: "travel",
  },
  {
    glyph: "💧",
    label: "droplet",
    labelPt: "gota",
    terms:
      "droplet gota cold comic drop nature sad sweat tear water weather com suor engracado de",
    group: "travel",
  },
  {
    glyph: "🌊",
    label: "water wave",
    labelPt: "onda",
    terms:
      "water wave onda nature ocean surf surfer surfing mar oceano praia surfe tsunami agua",
    group: "travel",
  },
  {
    glyph: "👓️",
    label: "glasses",
    labelPt: "óculos",
    terms: "glasses oculos clothing eye eyeglasses eyewear acessorio",
    group: "objects",
  },
  {
    glyph: "🕶️",
    label: "sunglasses",
    labelPt: "óculos escuros",
    terms: "sunglasses oculos escuros dark eye eyewear glasses de sol",
    group: "objects",
  },
  {
    glyph: "🥽",
    label: "goggles",
    labelPt: "óculos de proteção",
    terms:
      "goggles oculos de protecao dive eye protection scuba swimming welding mergulho natacao olhos ski solda soldagem",
    group: "objects",
  },
  {
    glyph: "🥼",
    label: "lab coat",
    labelPt: "jaleco",
    terms:
      "lab coat jaleco clothes doctor dr experiment jacket scientist white cientista experimento experiencia medico roupa",
    group: "objects",
  },
  {
    glyph: "🦺",
    label: "safety vest",
    labelPt: "colete salva-vidas",
    terms:
      "safety vest colete salva-vidas emergency emergencia refletivo seguranca",
    group: "objects",
  },
  {
    glyph: "👔",
    label: "necktie",
    labelPt: "gravata",
    terms:
      "necktie gravata clothing employed serious shirt tie acessorio roupa",
    group: "objects",
  },
  {
    glyph: "👕",
    label: "t-shirt",
    labelPt: "camiseta",
    terms:
      "t-shirt camiseta blue casual clothes clothing collar dressed shirt shopping tshirt weekend camisa roupa",
    group: "objects",
  },
  {
    glyph: "👖",
    label: "jeans",
    labelPt: "jeans",
    terms:
      "jeans blue casual clothes clothing denim dressed pants shopping trousers weekend calca roupa",
    group: "objects",
  },
  {
    glyph: "🧣",
    label: "scarf",
    labelPt: "cachecol",
    terms: "scarf cachecol bundle cold neck up frio inverno pescoco",
    group: "objects",
  },
  {
    glyph: "🧤",
    label: "gloves",
    labelPt: "luvas",
    terms: "gloves luvas hand inverno luva mao",
    group: "objects",
  },
  {
    glyph: "🧥",
    label: "coat",
    labelPt: "casaco",
    terms: "coat casaco brr bundle cold jacket up agasalho blusa frio jaqueta",
    group: "objects",
  },
  {
    glyph: "🧦",
    label: "socks",
    labelPt: "meias",
    terms: "socks meias stocking meia meiao",
    group: "objects",
  },
  {
    glyph: "👗",
    label: "dress",
    labelPt: "vestido",
    terms:
      "dress vestido clothes clothing dressed fancy shopping peca unica roupa",
    group: "objects",
  },
  {
    glyph: "👘",
    label: "kimono",
    labelPt: "quimono",
    terms: "kimono quimono clothing comfortable roupa vestir",
    group: "objects",
  },
  {
    glyph: "🥻",
    label: "sari",
    labelPt: "sari",
    terms: "sari clothing dress indiana roupa vestido india",
    group: "objects",
  },
  {
    glyph: "🩱",
    label: "one-piece swimsuit",
    labelPt: "maiô",
    terms: "one-piece swimsuit maio bathing suit banho nadar praia roupa",
    group: "objects",
  },
  {
    glyph: "🩲",
    label: "briefs",
    labelPt: "cueca",
    terms:
      "briefs cueca bathing one-piece suit swimsuit underwear banho nadar praia roupa sunga intima",
    group: "objects",
  },
  {
    glyph: "🩳",
    label: "shorts",
    labelPt: "shorts",
    terms:
      "shorts bathing pants suit swimsuit underwear banho bermuda nadar praia roupa",
    group: "objects",
  },
  {
    glyph: "👙",
    label: "bikini",
    labelPt: "biquíni",
    terms:
      "bikini biquini bathing beach clothing pool suit swim banho piscina praia roupa",
    group: "objects",
  },
  {
    glyph: "👚",
    label: "woman’s clothes",
    labelPt: "roupas femininas",
    terms:
      "womans clothes roupas femininas blouse clothing collar dress dressed lady shirt shopping woman azul blusa camiseta feminina roupa",
    group: "objects",
  },
  {
    glyph: "🪭",
    label: "folding hand fan",
    labelPt: "leque dobrável",
    terms:
      "folding hand fan leque dobravel clack clap cool cooling dance flirt flutter hot shy abanar arejar balancar calor danca flertar quente refrescar timidez",
    group: "objects",
  },
  {
    glyph: "👛",
    label: "purse",
    labelPt: "bolsinha",
    terms:
      "purse bolsinha clothes clothing coin dress fancy handbag shopping acessorio bolsa moeda niqueleira porta rosa",
    group: "objects",
  },
  {
    glyph: "👜",
    label: "handbag",
    labelPt: "bolsa de mão",
    terms:
      "handbag bolsa de mao bag clothes clothing dress lady purse shopping acessorio fashion mala",
    group: "objects",
  },
  {
    glyph: "👝",
    label: "clutch bag",
    labelPt: "bolsa pequena",
    terms:
      "clutch bag bolsa pequena clothes clothing dress handbag pouch purse acessorio carteira fashion",
    group: "objects",
  },
  {
    glyph: "🛍️",
    label: "shopping bags",
    labelPt: "sacolas de compras",
    terms: "shopping bags sacolas de compras bag hotel presente",
    group: "objects",
  },
  {
    glyph: "🎒",
    label: "backpack",
    labelPt: "mochila",
    terms:
      "backpack mochila backpacking bag bookbag education rucksack satchel school bolsa escola viagem viajar",
    group: "objects",
  },
  {
    glyph: "🩴",
    label: "thong sandal",
    labelPt: "chinelo",
    terms:
      "thong sandal chinelo beach flip flop sandals shoe thongs zori alpargatas piscina praia rasteirinha sandalia",
    group: "objects",
  },
  {
    glyph: "👞",
    label: "man’s shoe",
    labelPt: "sapato masculino",
    terms:
      "mans shoe sapato masculino brown clothes clothing feet foot kick man shoes shopping acessorio sapatos",
    group: "objects",
  },
  {
    glyph: "👟",
    label: "running shoe",
    labelPt: "tênis de corrida",
    terms:
      "running shoe tenis de corrida athletic clothes clothing fast kick shoes shopping sneaker tennis acessorio correr esportivo sapato",
    group: "objects",
  },
  {
    glyph: "🥾",
    label: "hiking boot",
    labelPt: "bota de trekking",
    terms:
      "hiking boot bota de trekking backpacking brown camping outdoors shoe acampamento acampar caminhada marrom mochilao natureza sapato trilha",
    group: "objects",
  },
  {
    glyph: "🥿",
    label: "flat shoe",
    labelPt: "sapatilha",
    terms:
      "flat shoe sapatilha ballet comfy flats slip-on slipper confortavel de bale sapato sem fivela",
    group: "objects",
  },
  {
    glyph: "👠",
    label: "high-heeled shoe",
    labelPt: "sapato de salto alto",
    terms:
      "high-heeled shoe sapato de salto alto clothes clothing dress fashion heel heels shoes shopping stiletto woman acessorio chique moda mulher scarpin",
    group: "objects",
  },
  {
    glyph: "👡",
    label: "woman’s sandal",
    labelPt: "sandália feminina",
    terms:
      "womans sandal sandalia feminina clothing shoe woman acessorio feminino medio salto",
    group: "objects",
  },
  {
    glyph: "🩰",
    label: "ballet shoes",
    labelPt: "sapatilha de balé",
    terms: "ballet shoes sapatilha de bale dance bailarina danca",
    group: "objects",
  },
  {
    glyph: "👢",
    label: "woman’s boot",
    labelPt: "bota feminina",
    terms:
      "womans boot bota feminina clothes clothing dress shoe shoes shopping woman acessorio calcado medio salto",
    group: "objects",
  },
  {
    glyph: "🪮",
    label: "hair pick",
    labelPt: "pente de cabelo",
    terms:
      "hair pick pente de cabelo afro comb groom crespo garfo pentear retro",
    group: "objects",
  },
  {
    glyph: "👑",
    label: "crown",
    labelPt: "coroa",
    terms:
      "crown coroa clothing family king medieval queen royal royalty win acessorio familia real game of thrones rainha realeza rei reinado",
    group: "objects",
  },
  {
    glyph: "👒",
    label: "woman’s hat",
    labelPt: "chapéu feminino",
    terms:
      "womans hat chapeu feminino clothes clothing garden hats party woman acessorio fashion",
    group: "objects",
  },
  {
    glyph: "🎩",
    label: "top hat",
    labelPt: "cartola",
    terms:
      "top hat cartola clothes clothing fancy formal magic tophat chapeu chique entretenimento roupa",
    group: "objects",
  },
  {
    glyph: "🎓️",
    label: "graduation cap",
    labelPt: "chapéu de formatura",
    terms:
      "graduation cap chapeu de formatura celebration clothing education hat scholar capelo comemoracao",
    group: "objects",
  },
  {
    glyph: "🧢",
    label: "billed cap",
    labelPt: "boné",
    terms: "billed cap bone baseball bent dad hat de beisebol chapeu",
    group: "objects",
  },
  {
    glyph: "🪖",
    label: "military helmet",
    labelPt: "capacete militar",
    terms:
      "military helmet capacete militar army soldier war warrior exercito guerra guerreiro soldado",
    group: "objects",
  },
  {
    glyph: "⛑️",
    label: "rescue worker’s helmet",
    labelPt: "capacacete de socorrista",
    terms:
      "rescue workers helmet capacacete de socorrista aid cross face hat ajuda branca capacete cruz primeiros resgate rosto salvamento socorros vermelho",
    group: "objects",
  },
  {
    glyph: "📿",
    label: "prayer beads",
    labelPt: "rosário de oração",
    terms:
      "prayer beads rosario de oracao clothing necklace religion acessorio religiao reza terco",
    group: "objects",
  },
  {
    glyph: "💄",
    label: "lipstick",
    labelPt: "batom",
    terms: "lipstick batom cosmetics date makeup cosmeticos maquiagem vermelho",
    group: "objects",
  },
  {
    glyph: "💍",
    label: "ring",
    labelPt: "anel",
    terms:
      "ring anel diamond engaged engagement married romance shiny sparkling wedding diamante",
    group: "objects",
  },
];

const EMOJI_BLOCK_3: EmojiEntry[] = [
  {
    glyph: "💎",
    label: "gem stone",
    labelPt: "pedra preciosa",
    terms:
      "gem stone pedra preciosa diamond engagement jewel money romance wedding diamante joia",
    group: "objects",
  },
  {
    glyph: "🔇",
    label: "muted speaker",
    labelPt: "alto-falante silenciado",
    terms:
      "muted speaker alto-falante silenciado mute quiet silent sound calar mudo quieto silenciar silencio som",
    group: "objects",
  },
  {
    glyph: "🔈️",
    label: "speaker low volume",
    labelPt: "alto-falante com volume baixo",
    terms:
      "speaker low volume alto-falante com baixo soft sound mudo musica silencio som",
    group: "objects",
  },
  {
    glyph: "🔉",
    label: "speaker medium volume",
    labelPt: "alto-falante com volume médio",
    terms:
      "speaker medium volume alto-falante com medio sound baixo diminuir som",
    group: "objects",
  },
  {
    glyph: "🔊",
    label: "speaker high volume",
    labelPt: "alto-falante com volume alto",
    terms:
      "speaker high volume alto-falante com alto loud music sound gritar musica som",
    group: "objects",
  },
  {
    glyph: "📢",
    label: "loudspeaker",
    labelPt: "buzina",
    terms:
      "loudspeaker buzina address communication loud public sound alto alto-falante aviso comunicado discurso gritar megafone",
    group: "objects",
  },
  {
    glyph: "📣",
    label: "megaphone",
    labelPt: "megafone",
    terms: "megaphone megafone cheering sound aplausos comunicacao",
    group: "objects",
  },
  {
    glyph: "📯",
    label: "postal horn",
    labelPt: "corneta postal",
    terms: "postal horn corneta post correios",
    group: "objects",
  },
  {
    glyph: "🔔",
    label: "bell",
    labelPt: "sino",
    terms: "bell sino break church sound capela",
    group: "objects",
  },
  {
    glyph: "🔕",
    label: "bell with slash",
    labelPt: "sino silenciado",
    terms:
      "bell with slash sino silenciado forbidden mute no not prohibited quiet silent sound mudo notificacao proibido quieto sem som silencioso silencio",
    group: "objects",
  },
  {
    glyph: "🎼",
    label: "musical score",
    labelPt: "partitura musical",
    terms: "musical score partitura music note musica",
    group: "objects",
  },
  {
    glyph: "🎵",
    label: "musical note",
    labelPt: "nota musical",
    terms: "musical note nota music sound musica",
    group: "objects",
  },
  {
    glyph: "🎶",
    label: "musical notes",
    labelPt: "notas musicais",
    terms: "musical notes notas musicais music note sound musica nota",
    group: "objects",
  },
  {
    glyph: "🎙️",
    label: "studio microphone",
    labelPt: "microfone de estúdio",
    terms: "studio microphone microfone de estudio mic music musica",
    group: "objects",
  },
  {
    glyph: "🎚️",
    label: "level slider",
    labelPt: "controle de volume",
    terms: "level slider controle de volume music musica",
    group: "objects",
  },
  {
    glyph: "🎛️",
    label: "control knobs",
    labelPt: "botões giratórios",
    terms: "control knobs botoes giratorios music controle musica",
    group: "objects",
  },
  {
    glyph: "🎤",
    label: "microphone",
    labelPt: "microfone",
    terms:
      "microphone microfone karaoke mic music sing sound cantar entretenimento musica",
    group: "objects",
  },
  {
    glyph: "🎧️",
    label: "headphone",
    labelPt: "fones de ouvido",
    terms:
      "headphone fones de ouvido earbud sound entretenimento fone musica som",
    group: "objects",
  },
  {
    glyph: "📻️",
    label: "radio",
    labelPt: "rádio",
    terms: "radio entertainment tbt video radiola som",
    group: "objects",
  },
  {
    glyph: "🎷",
    label: "saxophone",
    labelPt: "saxofone",
    terms: "saxophone saxofone instrument music sax instrumento musical musica",
    group: "objects",
  },
  {
    glyph: "🎺",
    label: "trumpet",
    labelPt: "trompete",
    terms: "trumpet trompete instrument music instrumento musical musica",
    group: "objects",
  },
  {
    glyph: "🪊",
    label: "trombone",
    labelPt: "trombone",
    terms:
      "trombone brass instrument jazz music sad slide instrumento musica sopro triste",
    group: "objects",
  },
  {
    glyph: "🪗",
    label: "accordion",
    labelPt: "acordeão",
    terms:
      "accordion acordeao box concertina instrument music squeeze squeezebox instrumento musica sanfona",
    group: "objects",
  },
  {
    glyph: "🎸",
    label: "guitar",
    labelPt: "guitarra",
    terms: "guitar guitarra instrument music strat instrumento musical musica",
    group: "objects",
  },
  {
    glyph: "🎹",
    label: "musical keyboard",
    labelPt: "teclado musical",
    terms: "musical keyboard teclado instrument music piano instrumento musica",
    group: "objects",
  },
  {
    glyph: "🎻",
    label: "violin",
    labelPt: "violino",
    terms: "violin violino instrument music instrumento musical musica",
    group: "objects",
  },
  {
    glyph: "🪕",
    label: "banjo",
    labelPt: "banjo",
    terms: "banjo music stringed cordas instrumento musica",
    group: "objects",
  },
  {
    glyph: "🥁",
    label: "drum",
    labelPt: "tambor",
    terms: "drum tambor drumsticks music baquetas musica percussao",
    group: "objects",
  },
  {
    glyph: "🪘",
    label: "long drum",
    labelPt: "tambor comprido",
    terms:
      "long drum tambor comprido beat conga instrument rhythm atabaque batida instrumento percussao ritmo",
    group: "objects",
  },
  {
    glyph: "🪇",
    label: "maracas",
    labelPt: "maracás",
    terms:
      "maracas cha dance instrument music party percussion rattle shake shaker chacoalhar chocalho danca festa instrumento maraca mexer musica percussao",
    group: "objects",
  },
  {
    glyph: "🪈",
    label: "flute",
    labelPt: "flauta",
    terms:
      "flute flauta band fife flautist instrument marching music orchestra piccolo pipe recorder woodwind banda flautim instrumento marcial musica orquestra pife pifano sopro tubo",
    group: "objects",
  },
  {
    glyph: "🪉",
    label: "harp",
    labelPt: "harpa",
    terms:
      "harp harpa cupid instrument love music orchestra amor cupido instrumento musica orquestra",
    group: "objects",
  },
  {
    glyph: "📱",
    label: "mobile phone",
    labelPt: "telefone celular",
    terms: "mobile phone telefone celular cell communication telephone movel",
    group: "objects",
  },
  {
    glyph: "📲",
    label: "mobile phone with arrow",
    labelPt: "telefone celular com seta",
    terms:
      "mobile phone with arrow telefone celular com seta build call cell communication receive telephone chamada fazer ligar receber smartphone",
    group: "objects",
  },
  {
    glyph: "☎️",
    label: "telephone",
    labelPt: "telefone no gancho",
    terms: "telephone telefone no gancho phone",
    group: "objects",
  },
  {
    glyph: "📞",
    label: "telephone receiver",
    labelPt: "telefone",
    terms:
      "telephone receiver telefone communication phone voip aparelho de comunicacao",
    group: "objects",
  },
  {
    glyph: "📟️",
    label: "pager",
    labelPt: "pager",
    terms: "pager communication comunicacao",
    group: "objects",
  },
  {
    glyph: "📠",
    label: "fax machine",
    labelPt: "fax",
    terms: "fax machine communication comunicacao maquina de",
    group: "objects",
  },
  {
    glyph: "🔋",
    label: "battery",
    labelPt: "pilha",
    terms: "battery pilha bateria",
    group: "objects",
  },
  {
    glyph: "🪫",
    label: "low battery",
    labelPt: "pouca bateria",
    terms:
      "low battery pouca bateria drained electronic energy power acabando cansado descarregada eletronico energia fim fraca pilha sem",
    group: "objects",
  },
  {
    glyph: "🔌",
    label: "electric plug",
    labelPt: "tomada elétrica",
    terms:
      "electric plug tomada eletrica electricity cabo eletricidade energia plugue",
    group: "objects",
  },
  {
    glyph: "💻️",
    label: "laptop",
    labelPt: "laptop",
    terms:
      "laptop computer office pc personal computador notebook pessoal trabalho",
    group: "objects",
  },
  {
    glyph: "🖥️",
    label: "desktop computer",
    labelPt: "computador de mesa",
    terms: "desktop computer computador de mesa monitor",
    group: "objects",
  },
  {
    glyph: "🖨️",
    label: "printer",
    labelPt: "impressora",
    terms:
      "printer impressora computer acessorio computador documento impressao imprimir",
    group: "objects",
  },
  {
    glyph: "⌨️",
    label: "keyboard",
    labelPt: "teclado",
    terms: "keyboard teclado computer acessorio computador digitacao",
    group: "objects",
  },
  {
    glyph: "🖱️",
    label: "computer mouse",
    labelPt: "mouse",
    terms: "computer mouse acessorio computador",
    group: "objects",
  },
  {
    glyph: "🖲️",
    label: "trackball",
    labelPt: "trackball",
    terms: "trackball computer acessorio bolinha computador mouse",
    group: "objects",
  },
  {
    glyph: "💽",
    label: "computer disk",
    labelPt: "minidisc",
    terms:
      "computer disk minidisc minidisk optical computacao disc disco hd md mini rigido",
    group: "objects",
  },
  {
    glyph: "💾",
    label: "floppy disk",
    labelPt: "disquete",
    terms: "floppy disk disquete computer computador disco flexivel",
    group: "objects",
  },
  {
    glyph: "💿️",
    label: "optical disk",
    labelPt: "cd",
    terms: "optical disk cd blu-ray computer dvd computador disco optico",
    group: "objects",
  },
  {
    glyph: "📀",
    label: "dvd",
    labelPt: "DVD",
    terms: "dvd blu-ray cd computer disk optical computador disco optico",
    group: "objects",
  },
  {
    glyph: "🧮",
    label: "abacus",
    labelPt: "ábaco",
    terms:
      "abacus abaco calculation calculator calculadora calculo matematica numero",
    group: "objects",
  },
  {
    glyph: "🎥",
    label: "movie camera",
    labelPt: "câmera de cinema",
    terms:
      "movie camera de cinema bollywood film hollywood record entretenimento filmar filme",
    group: "objects",
  },
  {
    glyph: "🎞️",
    label: "film frames",
    labelPt: "rolo de filmes",
    terms: "film frames rolo de filmes cinema movie filme",
    group: "objects",
  },
  {
    glyph: "📽️",
    label: "film projector",
    labelPt: "projetor de filmes",
    terms: "film projector projetor de filmes cinema movie video filme",
    group: "objects",
  },
  {
    glyph: "🎬️",
    label: "clapper board",
    labelPt: "claquete",
    terms:
      "clapper board claquete action movie cena entretenimento filme tomada",
    group: "objects",
  },
  {
    glyph: "📺️",
    label: "television",
    labelPt: "televisão",
    terms: "television televisao tv video canal",
    group: "objects",
  },
  {
    glyph: "📷️",
    label: "camera",
    labelPt: "câmera",
    terms: "camera photo selfie snap tbt trip video foto",
    group: "objects",
  },
  {
    glyph: "📸",
    label: "camera with flash",
    labelPt: "câmera com flash",
    terms: "camera with flash com video foto fotografia",
    group: "objects",
  },
  {
    glyph: "📹️",
    label: "video camera",
    labelPt: "câmera de vídeo",
    terms: "video camera de camcorder tbt filmadora",
    group: "objects",
  },
  {
    glyph: "📼",
    label: "videocassette",
    labelPt: "videocassete",
    terms:
      "videocassette videocassete old school tape vcr vhs video cassete fita",
    group: "objects",
  },
  {
    glyph: "🔍️",
    label: "magnifying glass tilted left",
    labelPt: "lupa para a esquerda",
    terms:
      "magnifying glass tilted left lupa para a esquerda lab left-pointing science search tool aumento busca ferramenta lente pesquisa procura",
    group: "objects",
  },
  {
    glyph: "🔎",
    label: "magnifying glass tilted right",
    labelPt: "lupa para a direita",
    terms:
      "magnifying glass tilted right lupa para a direita contact lab right-pointing science search tool aumento busca ferramenta lente pesquisa procura",
    group: "objects",
  },
  {
    glyph: "🕯️",
    label: "candle",
    labelPt: "vela",
    terms: "candle vela light acesa luz",
    group: "objects",
  },
  {
    glyph: "💡",
    label: "light bulb",
    labelPt: "lâmpada",
    terms:
      "light bulb lampada comic electric idea eletrica ideia luz quadrinhos tenho uma",
    group: "objects",
  },
  {
    glyph: "🔦",
    label: "flashlight",
    labelPt: "lanterna",
    terms:
      "flashlight lanterna electric light tool torch eletrica ferramenta luz",
    group: "objects",
  },
  {
    glyph: "🏮",
    label: "red paper lantern",
    labelPt: "lanterna vermelha de papel",
    terms:
      "red paper lantern lanterna vermelha de papel bar light restaurant izakaya restaurante",
    group: "objects",
  },
  {
    glyph: "🪔",
    label: "diya lamp",
    labelPt: "lâmpada de óleo",
    terms: "diya lamp lampada de oleo light oil",
    group: "objects",
  },
  {
    glyph: "📔",
    label: "notebook with decorative cover",
    labelPt: "caderno decorado",
    terms:
      "notebook with decorative cover caderno decorado book decorated education school writing agenda capa decoracao escola livro",
    group: "objects",
  },
  {
    glyph: "📕",
    label: "closed book",
    labelPt: "livro fechado",
    terms: "closed book livro fechado education apostila",
    group: "objects",
  },
  {
    glyph: "📖",
    label: "open book",
    labelPt: "livro aberto",
    terms:
      "open book livro aberto education fantasy knowledge library novels reading biblioteca leitura lendo ler livraria",
    group: "objects",
  },
  {
    glyph: "📗",
    label: "green book",
    labelPt: "livro verde",
    terms:
      "green book livro verde education fantasy library reading biblioteca caderno colegio escola estudar lendo ler livraria",
    group: "objects",
  },
  {
    glyph: "📘",
    label: "blue book",
    labelPt: "livro azul",
    terms:
      "blue book livro azul education fantasy library reading apostila escola estudo leitura",
    group: "objects",
  },
  {
    glyph: "📙",
    label: "orange book",
    labelPt: "livro laranja",
    terms:
      "orange book livro laranja education fantasy library reading apostila cartilha",
    group: "objects",
  },
  {
    glyph: "📚️",
    label: "books",
    labelPt: "livros",
    terms:
      "books livros book education fantasy knowledge library novels reading school study biblioteca estudando estudar leitura lendo ler livraria livro",
    group: "objects",
  },
  {
    glyph: "📓",
    label: "notebook",
    labelPt: "caderno",
    terms: "notebook caderno folhas",
    group: "objects",
  },
  {
    glyph: "📒",
    label: "ledger",
    labelPt: "livro contábil",
    terms: "ledger livro contabil notebook caderno",
    group: "objects",
  },
  {
    glyph: "📃",
    label: "page with curl",
    labelPt: "página dobrada",
    terms:
      "page with curl pagina dobrada document paper dobrado documento papel",
    group: "objects",
  },
  {
    glyph: "📜",
    label: "scroll",
    labelPt: "pergaminho",
    terms: "scroll pergaminho paper rolo de papel",
    group: "objects",
  },
  {
    glyph: "📄",
    label: "page facing up",
    labelPt: "página voltada para cima",
    terms:
      "page facing up pagina voltada para cima document paper documento oficial papel",
    group: "objects",
  },
  {
    glyph: "📰",
    label: "newspaper",
    labelPt: "jornal",
    terms: "newspaper jornal communication news paper noticias",
    group: "objects",
  },
  {
    glyph: "🗞️",
    label: "rolled-up newspaper",
    labelPt: "jornal enrolado",
    terms: "rolled-up newspaper jornal enrolado news paper rolled noticias",
    group: "objects",
  },
  {
    glyph: "📑",
    label: "bookmark tabs",
    labelPt: "marcadores de página",
    terms: "bookmark tabs marcadores de pagina mark marker marcador marcar",
    group: "objects",
  },
  {
    glyph: "🔖",
    label: "bookmark",
    labelPt: "marcador de página",
    terms: "bookmark marcador de pagina mark livro",
    group: "objects",
  },
  {
    glyph: "🏷️",
    label: "label",
    labelPt: "etiqueta",
    terms: "label etiqueta tag identificar rotulo",
    group: "objects",
  },
  {
    glyph: "🪙",
    label: "coin",
    labelPt: "moeda",
    terms:
      "coin moeda dollar euro gold metal money rich silver treasure dinheiro dolar ouro prata real rica rico tesouro",
    group: "objects",
  },
  {
    glyph: "💰️",
    label: "money bag",
    labelPt: "saco de dinheiro",
    terms:
      "money bag saco de dinheiro bank bet billion cash cost dollar gold million moneybag paid paying pot rich win dolares",
    group: "objects",
  },
  {
    glyph: "🪎",
    label: "treasure chest",
    labelPt: "baú de tesouro",
    terms:
      "treasure chest bau de tesouro gem gold jewels loot money prize silver valuables wealth dinheiro joia joias ouro prata premio riqueza",
    group: "objects",
  },
  {
    glyph: "💴",
    label: "yen banknote",
    labelPt: "nota de iene",
    terms:
      "yen banknote nota de iene bank bill currency money note cedula dinheiro grana moeda",
    group: "objects",
  },
  {
    glyph: "💵",
    label: "dollar banknote",
    labelPt: "nota de dólar",
    terms:
      "dollar banknote nota de dolar bank bill currency money note dinheiro moeda bancaria",
    group: "objects",
  },
  {
    glyph: "💶",
    label: "euro banknote",
    labelPt: "nota de euro",
    terms:
      "euro banknote nota de 100 bank bill currency money note rich cedula dinheiro grana moeda",
    group: "objects",
  },
  {
    glyph: "💷",
    label: "pound banknote",
    labelPt: "nota de libra",
    terms:
      "pound banknote nota de libra bank bill billion cash currency money note pounds cedula dinheiro grana moeda",
    group: "objects",
  },
  {
    glyph: "💸",
    label: "money with wings",
    labelPt: "dinheiro voando",
    terms:
      "money with wings dinheiro voando bank banknote bill billion cash dollar fly million note pay asas banco cedula indo embora nota",
    group: "objects",
  },
  {
    glyph: "💳️",
    label: "credit card",
    labelPt: "cartão de crédito",
    terms:
      "credit card cartao de credito bank cash charge money pay banco dinheiro debito",
    group: "objects",
  },
  {
    glyph: "🧾",
    label: "receipt",
    labelPt: "recibo",
    terms:
      "receipt recibo accounting bookkeeping evidence invoice proof contabilidade escrituracao evidencia fatura prova",
    group: "objects",
  },
  {
    glyph: "💹",
    label: "chart increasing with yen",
    labelPt: "gráfico subindo com iene",
    terms:
      "chart increasing with yen grafico subindo com iene bank currency graph growth market money rise trend upward ascendente ascensao crescimento dinheiro em alta mercado",
    group: "objects",
  },
  {
    glyph: "✉️",
    label: "envelope",
    labelPt: "envelope",
    terms: "envelope e-mail email letter carta correspondencia",
    group: "objects",
  },
  {
    glyph: "📧",
    label: "e-mail",
    labelPt: "e-mail",
    terms: "e-mail email letter mail carta comunicacao correspondencia",
    group: "objects",
  },
  {
    glyph: "📨",
    label: "incoming envelope",
    labelPt: "envelope chegando",
    terms:
      "incoming envelope chegando delivering e-mail email letter mail receive sent carta comunicacao correspondencia nova recebida",
    group: "objects",
  },
  {
    glyph: "📩",
    label: "envelope with arrow",
    labelPt: "envelope com seta",
    terms:
      "envelope with arrow com seta communication down e-mail email letter mail outgoing send sent carta comunicacao correspondencia",
    group: "objects",
  },
  {
    glyph: "📤️",
    label: "outbox tray",
    labelPt: "bandeja de saída",
    terms:
      "outbox tray bandeja de saida box email letter mail sent caixa comunicacao correspondencia enviada",
    group: "objects",
  },
  {
    glyph: "📥️",
    label: "inbox tray",
    labelPt: "bandeja de entrada",
    terms:
      "inbox tray bandeja de entrada box email letter mail receive zero caixa comunicacao correspondencia e-mail recebida recebido",
    group: "objects",
  },
  {
    glyph: "📦️",
    label: "package",
    labelPt: "pacote",
    terms:
      "package pacote box communication delivery parcel shipping caixa embrulho",
    group: "objects",
  },
  {
    glyph: "📫️",
    label: "closed mailbox with raised flag",
    labelPt: "caixa de correio fechada com bandeira levantada",
    terms:
      "closed mailbox with raised flag caixa de correio fechada com bandeira levantada communication mail postbox correspondencia",
    group: "objects",
  },
  {
    glyph: "📪️",
    label: "closed mailbox with lowered flag",
    labelPt: "caixa de correio fechada com bandeira abaixada",
    terms:
      "closed mailbox with lowered flag caixa de correio fechada com bandeira abaixada mail postbox correspondencia vazia",
    group: "objects",
  },
  {
    glyph: "📬️",
    label: "open mailbox with raised flag",
    labelPt: "caixa de correio aberta com bandeira levantada",
    terms:
      "open mailbox with raised flag caixa de correio aberta com bandeira levantada mail postbox correspondencia",
    group: "objects",
  },
  {
    glyph: "📭️",
    label: "open mailbox with lowered flag",
    labelPt: "caixa de correio aberta com bandeira abaixada",
    terms:
      "open mailbox with lowered flag caixa de correio aberta com bandeira abaixada mail postbox correspondencia e vazia",
    group: "objects",
  },
  {
    glyph: "📮",
    label: "postbox",
    labelPt: "caixa de correio",
    terms: "postbox caixa de correio mail mailbox carta correspondencia enviar",
    group: "objects",
  },
  {
    glyph: "🗳️",
    label: "ballot box with ballot",
    labelPt: "urna eleitoral com cédula",
    terms: "ballot box with urna eleitoral com cedula eleicao votar voto",
    group: "objects",
  },
  {
    glyph: "✏️",
    label: "pencil",
    labelPt: "lápis",
    terms: "pencil lapis",
    group: "objects",
  },
  {
    glyph: "✒️",
    label: "black nib",
    labelPt: "ponta de caneta tinteiro",
    terms: "black nib ponta de caneta tinteiro pen preto tinta",
    group: "objects",
  },
  {
    glyph: "🖋️",
    label: "fountain pen",
    labelPt: "caneta tinteiro",
    terms: "fountain pen caneta tinteiro destro",
    group: "objects",
  },
  {
    glyph: "🖊️",
    label: "pen",
    labelPt: "caneta",
    terms: "pen caneta ballpoint esferografica tinteiro",
    group: "objects",
  },
  {
    glyph: "🖌️",
    label: "paintbrush",
    labelPt: "pincel",
    terms: "paintbrush pincel painting pintando pintar",
    group: "objects",
  },
  {
    glyph: "🖍️",
    label: "crayon",
    labelPt: "giz de cera",
    terms: "crayon giz de cera desenho vermelho",
    group: "objects",
  },
  {
    glyph: "📝",
    label: "memo",
    labelPt: "memorando",
    terms:
      "memo memorando communication media notes pencil anotacoes caderno comunicacao lapis notas",
    group: "objects",
  },
  {
    glyph: "💼",
    label: "briefcase",
    labelPt: "maleta",
    terms: "briefcase maleta office mala pasta",
    group: "objects",
  },
  {
    glyph: "📁",
    label: "file folder",
    labelPt: "pasta de arquivos",
    terms: "file folder pasta de arquivos arquivo",
    group: "objects",
  },
  {
    glyph: "📂",
    label: "open file folder",
    labelPt: "pasta de arquivos aberta",
    terms: "open file folder pasta de arquivos aberta abrir arquivo",
    group: "objects",
  },
  {
    glyph: "🗂️",
    label: "card index dividers",
    labelPt: "divisores de pastas",
    terms:
      "card index dividers divisores de pastas arquivo divisor organizador pasta indice",
    group: "objects",
  },
  {
    glyph: "📅",
    label: "calendar",
    labelPt: "calendário",
    terms: "calendar calendario date data datas",
    group: "objects",
  },
  {
    glyph: "📆",
    label: "tear-off calendar",
    labelPt: "calendário com folhas destacáveis",
    terms:
      "tear-off calendar calendario com folhas destacaveis data destacavel dia folha paginas varias",
    group: "objects",
  },
  {
    glyph: "🗒️",
    label: "spiral notepad",
    labelPt: "bloco espiral",
    terms: "spiral notepad bloco espiral note pad caderno",
    group: "objects",
  },
  {
    glyph: "🗓️",
    label: "spiral calendar",
    labelPt: "calendário espiral",
    terms: "spiral calendar calendario espiral pad bloco data",
    group: "objects",
  },
  {
    glyph: "📇",
    label: "card index",
    labelPt: "índice de cartões",
    terms: "card index indice de cartoes old rolodex school",
    group: "objects",
  },
  {
    glyph: "📈",
    label: "chart increasing",
    labelPt: "gráfico subindo",
    terms:
      "chart increasing grafico subindo data graph growth right trend up upward crescimento diagrama de tendencia",
    group: "objects",
  },
  {
    glyph: "📉",
    label: "chart decreasing",
    labelPt: "gráfico caindo",
    terms:
      "chart decreasing grafico caindo data down downward graph negative trend diagrama de tendencia negativa",
    group: "objects",
  },
  {
    glyph: "📊",
    label: "bar chart",
    labelPt: "gráfico de barras",
    terms: "bar chart grafico de barras data graph barra diagrama",
    group: "objects",
  },
  {
    glyph: "📋️",
    label: "clipboard",
    labelPt: "prancheta",
    terms: "clipboard prancheta do list notes anotacoes",
    group: "objects",
  },
  {
    glyph: "📌",
    label: "pushpin",
    labelPt: "tacha",
    terms: "pushpin tacha collage pin alfinete",
    group: "objects",
  },
  {
    glyph: "📍",
    label: "round pushpin",
    labelPt: "tacha redonda",
    terms:
      "round pushpin tacha redonda location map pin alfinete localizacao mapa",
    group: "objects",
  },
  {
    glyph: "📎",
    label: "paperclip",
    labelPt: "clipe de papel",
    terms: "paperclip clipe de papel",
    group: "objects",
  },
  {
    glyph: "🖇️",
    label: "linked paperclips",
    labelPt: "clipes de papel conectados",
    terms: "linked paperclips clipes de papel conectados link paperclip clipe",
    group: "objects",
  },
  {
    glyph: "📏",
    label: "straight ruler",
    labelPt: "régua reta",
    terms: "straight ruler regua reta angle edge math straightedge",
    group: "objects",
  },
  {
    glyph: "📐",
    label: "triangular ruler",
    labelPt: "régua triangular",
    terms:
      "triangular ruler regua angle math rule set slide triangle geometria matematica triangulo angulo",
    group: "objects",
  },
  {
    glyph: "✂️",
    label: "scissors",
    labelPt: "tesoura",
    terms: "scissors tesoura cut cutting paper tool aberta cortar ferramenta",
    group: "objects",
  },
  {
    glyph: "🗃️",
    label: "card file box",
    labelPt: "caixa de arquivos",
    terms: "card file box caixa de arquivos arquivo cartao documentos ficheiro",
    group: "objects",
  },
  {
    glyph: "🗄️",
    label: "file cabinet",
    labelPt: "gavetas de escritório",
    terms: "file cabinet gavetas de escritorio filing paper arquivo gabinete",
    group: "objects",
  },
  {
    glyph: "🗑️",
    label: "wastebasket",
    labelPt: "lixeira",
    terms: "wastebasket lixeira can garbage trash waste cesto lixo",
    group: "objects",
  },
  {
    glyph: "🔒️",
    label: "locked",
    labelPt: "cadeado",
    terms: "locked cadeado closed lock private fechado trancado",
    group: "objects",
  },
  {
    glyph: "🔓️",
    label: "unlocked",
    labelPt: "cadeado aberto",
    terms: "unlocked cadeado aberto cracked lock open unlock destrancado",
    group: "objects",
  },
  {
    glyph: "🔏",
    label: "locked with pen",
    labelPt: "cadeado com caneta",
    terms:
      "locked with pen cadeado com caneta ink lock nib privacy privacidade privado tinteiro",
    group: "objects",
  },
  {
    glyph: "🔐",
    label: "locked with key",
    labelPt: "cadeado fechado com chave",
    terms:
      "locked with key cadeado fechado com chave bike closed lock secure seguro trancado",
    group: "objects",
  },
  {
    glyph: "🔑",
    label: "key",
    labelPt: "chave",
    terms: "key chave keys lock major password unlock senha trancado trancar",
    group: "objects",
  },
  {
    glyph: "🗝️",
    label: "old key",
    labelPt: "chave antiga",
    terms: "old key chave antiga clue lock fechadura",
    group: "objects",
  },
  {
    glyph: "🔨",
    label: "hammer",
    labelPt: "martelo",
    terms:
      "hammer martelo home improvement repairs tool construcao ferramenta martelada reparo",
    group: "objects",
  },
  {
    glyph: "🪓",
    label: "axe",
    labelPt: "machado",
    terms: "axe machado ax chop hatchet split wood cortar madeira partir",
    group: "objects",
  },
  {
    glyph: "⛏️",
    label: "pick",
    labelPt: "picareta",
    terms: "pick picareta hammer mining tool ferramenta mineracao",
    group: "objects",
  },
  {
    glyph: "⚒️",
    label: "hammer and pick",
    labelPt: "martelo e picareta",
    terms: "hammer and pick martelo e picareta tool ferramenta geologia",
    group: "objects",
  },
  {
    glyph: "🛠️",
    label: "hammer and wrench",
    labelPt: "martelo e chave-inglesa",
    terms:
      "hammer and wrench martelo e chave-inglesa spanner tool chave ferramenta inglesa",
    group: "objects",
  },
  {
    glyph: "🗡️",
    label: "dagger",
    labelPt: "adaga",
    terms: "dagger adaga knife weapon arma faca",
    group: "objects",
  },
  {
    glyph: "⚔️",
    label: "crossed swords",
    labelPt: "espadas cruzadas",
    terms: "crossed swords espadas cruzadas weapon arma batalha guerra",
    group: "objects",
  },
  {
    glyph: "💣️",
    label: "bomb",
    labelPt: "bomba",
    terms:
      "bomb bomba boom comic dangerous explosion hot emocao engracado explosivo explosao perigo",
    group: "objects",
  },
  {
    glyph: "🪃",
    label: "boomerang",
    labelPt: "bumerangue",
    terms:
      "boomerang bumerangue rebound repercussion weapon aborigene arma australia rebote repercussao",
    group: "objects",
  },
  {
    glyph: "🏹",
    label: "bow and arrow",
    labelPt: "arco e flecha",
    terms:
      "bow and arrow arco e flecha archer archery sagittarius tool weapon zodiac arma sagitario zodiaco",
    group: "objects",
  },
  {
    glyph: "🛡️",
    label: "shield",
    labelPt: "escudo",
    terms: "shield escudo weapon arma",
    group: "objects",
  },
  {
    glyph: "🪚",
    label: "carpentry saw",
    labelPt: "serrote",
    terms:
      "carpentry saw serrote carpenter cut lumber tool trim carpinteiro cortar ferramenta madeira serra serrar",
    group: "objects",
  },
  {
    glyph: "🔧",
    label: "wrench",
    labelPt: "chave inglesa",
    terms:
      "wrench chave inglesa home improvement spanner tool ferramenta obra reforma",
    group: "objects",
  },
  {
    glyph: "🪛",
    label: "screwdriver",
    labelPt: "chave de fenda",
    terms: "screwdriver chave de fenda flathead handy screw tool ferramenta",
    group: "objects",
  },
  {
    glyph: "🔩",
    label: "nut and bolt",
    labelPt: "porca e parafuso",
    terms:
      "nut and bolt porca e parafuso home improvement tool construcao ferramenta",
    group: "objects",
  },
  {
    glyph: "⚙️",
    label: "gear",
    labelPt: "engrenagem",
    terms: "gear engrenagem cog cogwheel tool ferramenta",
    group: "objects",
  },
  {
    glyph: "🗜️",
    label: "clamp",
    labelPt: "braçadeira",
    terms:
      "clamp bracadeira compress tool vice compressao ferramenta morsa torno",
    group: "objects",
  },
  {
    glyph: "⚖️",
    label: "balance scale",
    labelPt: "balança",
    terms:
      "balance scale balanca justice libra scales tool weight zodiac ferramenta justica peso zodiaco",
    group: "objects",
  },
  {
    glyph: "🦯",
    label: "white cane",
    labelPt: "bengala para cegos",
    terms:
      "white cane bengala para cegos accessibility blind probing acessibilidade cega cego cegueira deficiente visual",
    group: "objects",
  },
  {
    glyph: "🔗",
    label: "link",
    labelPt: "link",
    terms: "link links aneis corrente dois simbolo vinculo",
    group: "objects",
  },
  {
    glyph: "⛓️‍💥",
    label: "broken chain",
    labelPt: "corrente quebrada",
    terms:
      "broken chain corrente quebrada break breaking cuffs freedom algema liberdade quebrando quebrar",
    group: "objects",
  },
  {
    glyph: "⛓️",
    label: "chains",
    labelPt: "correntes",
    terms: "chains correntes chain corrente metal",
    group: "objects",
  },
  {
    glyph: "🪝",
    label: "hook",
    labelPt: "gancho",
    terms:
      "hook gancho catch crook curve ensnare point selling atracao para venda bandido curva pegar prender",
    group: "objects",
  },
  {
    glyph: "🧰",
    label: "toolbox",
    labelPt: "caixa de ferramentas",
    terms:
      "toolbox caixa de ferramentas box chest mechanic red tool ferramenta mecanico vermelha",
    group: "objects",
  },
  {
    glyph: "🧲",
    label: "magnet",
    labelPt: "ímã",
    terms:
      "magnet ima attraction horseshoe magnetic negative positive shape u atracao ferradura magnetico positivo-negativo",
    group: "objects",
  },
  {
    glyph: "🪜",
    label: "ladder",
    labelPt: "escada",
    terms: "ladder escada climb rung step degrau mao subir",
    group: "objects",
  },
  {
    glyph: "🪏",
    label: "shovel",
    labelPt: "pá",
    terms:
      "shovel pa bury dig garden hole plant scoop snow spade buraco cavar pazinha",
    group: "objects",
  },
  {
    glyph: "⚗️",
    label: "alembic",
    labelPt: "alambique",
    terms: "alembic alambique chemistry tool ferramenta quimica",
    group: "objects",
  },
  {
    glyph: "🧪",
    label: "test tube",
    labelPt: "tubo de ensaio",
    terms:
      "test tube tubo de ensaio chemist chemistry experiment lab science ciencia experimento experiencia laboratorio quimica quimico",
    group: "objects",
  },
  {
    glyph: "🧫",
    label: "petri dish",
    labelPt: "placa de Petri",
    terms:
      "petri dish placa de bacteria biologist biology culture lab biologia biologista biologo ciencia cultura laboratorio",
    group: "objects",
  },
  {
    glyph: "🧬",
    label: "dna",
    labelPt: "dna",
    terms:
      "dna biologist evolution gene genetics life biologista biologo codigo evolucao genetica genetico vida",
    group: "objects",
  },
  {
    glyph: "🔬",
    label: "microscope",
    labelPt: "microscópio",
    terms:
      "microscope microscopio experiment lab science tool ciencia ferramenta microscopico",
    group: "objects",
  },
  {
    glyph: "🔭",
    label: "telescope",
    labelPt: "telescópio",
    terms:
      "telescope telescopio contact extraterrestrial science tool ciencia ferramenta",
    group: "objects",
  },
  {
    glyph: "📡",
    label: "satellite antenna",
    labelPt: "antena parabólica",
    terms:
      "satellite antenna antena parabolica aliens contact dish science comunicacao satelite",
    group: "objects",
  },
  {
    glyph: "💉",
    label: "syringe",
    labelPt: "seringa",
    terms:
      "syringe seringa doctor flu medicine needle shot sick tool vaccination agulha injecao medico remedio vacina vacinacao",
    group: "objects",
  },
  {
    glyph: "🩸",
    label: "drop of blood",
    labelPt: "gota de sangue",
    terms:
      "drop of blood gota de sangue bleed donation injury medicine menstruation doacao medicina menstruacao sangrar",
    group: "objects",
  },
  {
    glyph: "💊",
    label: "pill",
    labelPt: "comprimido",
    terms:
      "pill comprimido doctor drugs medicated medicine pills sick vitamin capsula medicina medico pilula remedio",
    group: "objects",
  },
  {
    glyph: "🩹",
    label: "adhesive bandage",
    labelPt: "atadura adesiva",
    terms: "adhesive bandage atadura adesiva bandaid bandeide curativo",
    group: "objects",
  },
  {
    glyph: "🩼",
    label: "crutch",
    labelPt: "muleta",
    terms:
      "crutch muleta aid cane disability help hurt injured mobility stick ajuda bastao bengala deficiencia desculpa lesao machucar mobilidade",
    group: "objects",
  },
  {
    glyph: "🩺",
    label: "stethoscope",
    labelPt: "estetoscópio",
    terms:
      "stethoscope estetoscopio doctor heart medicine coracao medicina medica medico tum",
    group: "objects",
  },
  {
    glyph: "🩻",
    label: "x-ray",
    labelPt: "raio x",
    terms:
      "x-ray raio x bones doctor medical skeleton skull xray doutor esqueleto medico ossos radiografia",
    group: "objects",
  },
  {
    glyph: "🚪",
    label: "door",
    labelPt: "porta",
    terms: "door porta back closet front fechada",
    group: "objects",
  },
  {
    glyph: "🛗",
    label: "elevator",
    labelPt: "elevador",
    terms:
      "elevator elevador accessibility hoist lift acessibilidade descer elevar subir",
    group: "objects",
  },
  {
    glyph: "🪞",
    label: "mirror",
    labelPt: "espelho",
    terms:
      "mirror espelho makeup reflection reflector speculum especulo maquiagem refletor reflexo reflexao",
    group: "objects",
  },
  {
    glyph: "🪟",
    label: "window",
    labelPt: "janela",
    terms:
      "window janela air frame fresh opening transparent view abertura ar fresco quadro transparente vidro vista",
    group: "objects",
  },
  {
    glyph: "🛏️",
    label: "bed",
    labelPt: "cama",
    terms: "bed cama hotel sleep dormir sono",
    group: "objects",
  },
  {
    glyph: "🛋️",
    label: "couch and lamp",
    labelPt: "sofá e luminária",
    terms: "couch and lamp sofa e luminaria hotel lampada",
    group: "objects",
  },
  {
    glyph: "🪑",
    label: "chair",
    labelPt: "cadeira",
    terms: "chair cadeira seat sit assento sentar",
    group: "objects",
  },
  {
    glyph: "🚽",
    label: "toilet",
    labelPt: "vaso sanitário",
    terms: "toilet vaso sanitario bathroom banheiro patente privada toalete",
    group: "objects",
  },
  {
    glyph: "🪠",
    label: "plunger",
    labelPt: "desentupidor",
    terms:
      "plunger desentupidor cup force plumber poop suction toilet banheiro coco encanador fezes sanitario succao vaso",
    group: "objects",
  },
  {
    glyph: "🚿",
    label: "shower",
    labelPt: "chuveiro",
    terms: "shower chuveiro water banho ducha agua",
    group: "objects",
  },
  {
    glyph: "🛁",
    label: "bathtub",
    labelPt: "banheira",
    terms: "bathtub banheira bath banho",
    group: "objects",
  },
  {
    glyph: "🪤",
    label: "mouse trap",
    labelPt: "ratoeira",
    terms:
      "mouse trap ratoeira bait cheese lure mousetrap snare armadilha atrair isca prender queijo",
    group: "objects",
  },
  {
    glyph: "🪒",
    label: "razor",
    labelPt: "lâmina",
    terms:
      "razor lamina sharp shave afiada afiado barbeador barbear depilar gilete raspar",
    group: "objects",
  },
  {
    glyph: "🧴",
    label: "lotion bottle",
    labelPt: "frasco de loção",
    terms:
      "lotion bottle frasco de locao moisturizer shampoo sunscreen condicionador creme hidratante protetor solar xampu",
    group: "objects",
  },
  {
    glyph: "🧷",
    label: "safety pin",
    labelPt: "alfinete de segurança",
    terms: "safety pin alfinete de seguranca diaper punk rock fralda",
    group: "objects",
  },
  {
    glyph: "🧹",
    label: "broom",
    labelPt: "vassoura",
    terms: "broom vassoura cleaning sweeping witch bruxa limpar limpeza varrer",
    group: "objects",
  },
  {
    glyph: "🧺",
    label: "basket",
    labelPt: "cesta",
    terms:
      "basket cesta farming laundry picnic agricultura agricola lavanderia lavoura piquenique roupa suja",
    group: "objects",
  },
  {
    glyph: "🧻",
    label: "roll of paper",
    labelPt: "rolo de papel",
    terms: "roll of paper rolo de papel toilet towels higienico toalha",
    group: "objects",
  },
  {
    glyph: "🪣",
    label: "bucket",
    labelPt: "balde",
    terms: "bucket balde cask pail vat baldinho barril",
    group: "objects",
  },
  {
    glyph: "🧼",
    label: "soap",
    labelPt: "sabonete",
    terms:
      "soap sabonete bar bathing clean cleaning lather soapdish banho barra espuma limpar limpeza saboneteira",
    group: "objects",
  },
  {
    glyph: "🫧",
    label: "bubbles",
    labelPt: "bolhas",
    terms:
      "bubbles bolhas bubble burp clean floating pearl soap underwater aquatica aquatico arroto bolha embaixo dagua flutuar limpo perolas sabao agua",
    group: "objects",
  },
  {
    glyph: "🪥",
    label: "toothbrush",
    labelPt: "escova de dentes",
    terms:
      "toothbrush escova de dentes bathroom brush clean dental hygiene teeth toiletry banheiro higiene limpeza",
    group: "objects",
  },
  {
    glyph: "🧽",
    label: "sponge",
    labelPt: "esponja",
    terms:
      "sponge esponja absorbing cleaning porous soak absorvente absorcao encharcar limpeza porosa poroso",
    group: "objects",
  },
  {
    glyph: "🧯",
    label: "fire extinguisher",
    labelPt: "extintor de incêndio",
    terms:
      "fire extinguisher extintor de incendio extinguish quench apagar extinguir fogo",
    group: "objects",
  },
  {
    glyph: "🛒",
    label: "shopping cart",
    labelPt: "carrinho de compras",
    terms: "shopping cart carrinho de compras trolley mercado supermercado",
    group: "objects",
  },
  {
    glyph: "🚬",
    label: "cigarette",
    labelPt: "cigarro",
    terms:
      "cigarette cigarro smoking fumante fumar fumo simbolo para e permitido",
    group: "objects",
  },
  {
    glyph: "⚰️",
    label: "coffin",
    labelPt: "caixão",
    terms: "coffin caixao dead death vampire funerario funeral morte velorio",
    group: "objects",
  },
  {
    glyph: "🪦",
    label: "headstone",
    labelPt: "lápide",
    terms:
      "headstone lapide cemetery dead grave graveyard memorial rip tomb tombstone cemiterio descanse em paz morto sepultura tumba tumulo",
    group: "objects",
  },
  {
    glyph: "⚱️",
    label: "funeral urn",
    labelPt: "urna funerária",
    terms: "funeral urn urna funeraria ashes death cinzas morte",
    group: "objects",
  },
  {
    glyph: "🧿",
    label: "nazar amulet",
    labelPt: "olho grego",
    terms:
      "nazar amulet olho grego bead blue charm evil-eye talisman amuleto conta mau-olhado micanga talisma",
    group: "objects",
  },
  {
    glyph: "🪬",
    label: "hamsa",
    labelPt: "hamsá",
    terms:
      "hamsa amulet fatima fortune guide hand mary miriam palm protect protection amuleto guia maria mao palma protecao sorte",
    group: "objects",
  },
  {
    glyph: "🗿",
    label: "moai",
    labelPt: "moai",
    terms: "moai face moyai statue stoneface travel estatua rosto",
    group: "objects",
  },
  {
    glyph: "🪧",
    label: "placard",
    labelPt: "placa",
    terms:
      "placard placa card demonstration notice picket plaque protest sign aviso cartaz demonstracao letreiro piquete protesto sinal",
    group: "objects",
  },
  {
    glyph: "🪪",
    label: "identification card",
    labelPt: "cartão de identificação",
    terms:
      "identification card cartao de identificacao credentials document id license security carta carteira cracha credenciais documento habilitacao identidade licenca motorista rg seguranca",
    group: "objects",
  },
  {
    glyph: "🏧",
    label: "ATM sign",
    labelPt: "símbolo de caixa automático",
    terms:
      "atm sign simbolo de caixa automatico automated bank cash money teller banco dinheiro eletronico grana saque",
    group: "symbols",
  },
  {
    glyph: "🚮",
    label: "litter in bin sign",
    labelPt: "símbolo de lixeira",
    terms:
      "litter in bin sign simbolo de lixeira litterbin coloque o lixo no lata",
    group: "symbols",
  },
  {
    glyph: "🚰",
    label: "potable water",
    labelPt: "água potável",
    terms: "potable water agua potavel drinking beber simbolo torneira",
    group: "symbols",
  },
  {
    glyph: "♿️",
    label: "wheelchair symbol",
    labelPt: "símbolo de cadeira de rodas",
    terms:
      "wheelchair symbol simbolo de cadeira rodas access handicap acesso sinal",
    group: "symbols",
  },
  {
    glyph: "🚹️",
    label: "men’s room",
    labelPt: "banheiro masculino",
    terms:
      "mens room banheiro masculino bathroom lavatory man restroom toilet wc homem lavatorio simbolo toalete",
    group: "symbols",
  },
  {
    glyph: "🚺️",
    label: "women’s room",
    labelPt: "banheiro feminino",
    terms:
      "womens room banheiro feminino bathroom lavatory restroom toilet wc woman lavabo lavatorio mulher simbolo toalete",
    group: "symbols",
  },
  {
    glyph: "🚻",
    label: "restroom",
    labelPt: "banheiro",
    terms:
      "restroom banheiro bathroom lavatory toilet wc lavabo sanitario simbolo toalete",
    group: "symbols",
  },
  {
    glyph: "🚼️",
    label: "baby symbol",
    labelPt: "símbolo de bebê",
    terms: "baby symbol simbolo de bebe changing fralda fraldario trocar",
    group: "symbols",
  },
  {
    glyph: "🚾",
    label: "water closet",
    labelPt: "WC",
    terms:
      "water closet wc bathroom lavatory restroom toilet latrina lavabo privada toalete vaso sanitario",
    group: "symbols",
  },
  {
    glyph: "🛂",
    label: "passport control",
    labelPt: "controle de passaportes",
    terms: "passport control controle de passaportes passaporte",
    group: "symbols",
  },
  {
    glyph: "🛃",
    label: "customs",
    labelPt: "alfândega",
    terms:
      "customs alfandega packing aduana aduaneira bens federal impostos receita",
    group: "symbols",
  },
  {
    glyph: "🛄",
    label: "baggage claim",
    labelPt: "restituição de bagagem",
    terms:
      "baggage claim restituicao de bagagem arrived bags case checked journey packing plane ready travel trip aeroporto bagagens esteira ferias mala recolhimento viagem area",
    group: "symbols",
  },
  {
    glyph: "🛅",
    label: "left luggage",
    labelPt: "depósito de bagagem",
    terms:
      "left luggage deposito de bagagem baggage case locker esquecida malas servico",
    group: "symbols",
  },
  {
    glyph: "⚠️",
    label: "warning",
    labelPt: "aviso",
    terms: "warning aviso caution atencao cuidado sinal",
    group: "symbols",
  },
  {
    glyph: "🚸",
    label: "children crossing",
    labelPt: "crianças atravessando",
    terms:
      "children crossing criancas atravessando child pedestrian traffic crianca pedestre simbolo trafego",
    group: "symbols",
  },
  {
    glyph: "⛔️",
    label: "no entry",
    labelPt: "entrada proibida",
    terms:
      "no entry entrada proibida do fail forbidden not pass prohibited traffic entre nao placa proibido sinal transito",
    group: "symbols",
  },
  {
    glyph: "🚫",
    label: "prohibited",
    labelPt: "proibido",
    terms:
      "prohibited proibido entry forbidden no not smoke entrada nao proibida sinal simbolo",
    group: "symbols",
  },
  {
    glyph: "🚳",
    label: "no bicycles",
    labelPt: "proibido andar de bicicleta",
    terms:
      "no bicycles proibido andar de bicicleta bicycle bike forbidden not prohibited nao permitidas sem",
    group: "symbols",
  },
  {
    glyph: "🚭️",
    label: "no smoking",
    labelPt: "proibido fumar",
    terms:
      "no smoking proibido fumar forbidden not prohibited smoke cigarro nao e permitido simbolo",
    group: "symbols",
  },
  {
    glyph: "🚯",
    label: "no littering",
    labelPt: "proibido jogar lixo no chão",
    terms:
      "no littering proibido jogar lixo chao forbidden litter not prohibited nao jogue simbolo",
    group: "symbols",
  },
  {
    glyph: "🚱",
    label: "non-potable water",
    labelPt: "água não potável",
    terms:
      "non-potable water agua nao potavel dry non-drinking prohibited consumo impropria proibido seco sem",
    group: "symbols",
  },
  {
    glyph: "🚷",
    label: "no pedestrians",
    labelPt: "proibida a passagem de pedestres",
    terms:
      "no pedestrians proibida a passagem de pedestres forbidden not pedestrian prohibited nao pedestre permitidos proibido",
    group: "symbols",
  },
  {
    glyph: "📵",
    label: "no mobile phones",
    labelPt: "proibido o uso de telefone celular",
    terms:
      "no mobile phones proibido o uso de telefone celular cell forbidden not phone prohibited telephone cel nao permitidos sem smartphone",
    group: "symbols",
  },
  {
    glyph: "🔞",
    label: "no one under eighteen",
    labelPt: "proibido para menores de 18 anos",
    terms:
      "no one under eighteen proibido para menores de 18 anos age forbidden not prohibited restriction underage dezoito idade menor restricao",
    group: "symbols",
  },
  {
    glyph: "☢️",
    label: "radioactive",
    labelPt: "radioativo",
    terms:
      "radioactive radioativo sign perigo radiativo radiacao sinal simbolo",
    group: "symbols",
  },
  {
    glyph: "☣️",
    label: "biohazard",
    labelPt: "risco biológico",
    terms: "biohazard risco biologico sign ciencia perigo residuos biologicos",
    group: "symbols",
  },
  {
    glyph: "⬆️",
    label: "up arrow",
    labelPt: "seta para cima",
    terms: "up arrow seta para cima cardinal direction north direcao norte",
    group: "symbols",
  },
  {
    glyph: "↗️",
    label: "up-right arrow",
    labelPt: "seta para cima e para a direita",
    terms:
      "up-right arrow seta para cima e a direita direction intercardinal northeast diagonal direcao flecha nordeste superior",
    group: "symbols",
  },
  {
    glyph: "➡️",
    label: "right arrow",
    labelPt: "seta para a direita",
    terms:
      "right arrow seta para a direita cardinal direction east direcao flecha leste",
    group: "symbols",
  },
  {
    glyph: "↘️",
    label: "down-right arrow",
    labelPt: "seta para baixo e para a direita",
    terms:
      "down-right arrow seta para baixo e a direita direction intercardinal southeast diagonal direcao flecha inferior sudeste",
    group: "symbols",
  },
  {
    glyph: "⬇️",
    label: "down arrow",
    labelPt: "seta para baixo",
    terms:
      "down arrow seta para baixo cardinal direction south abaixo direcao embaixo flecha sul",
    group: "symbols",
  },
  {
    glyph: "↙️",
    label: "down-left arrow",
    labelPt: "seta para baixo e para a esquerda",
    terms:
      "down-left arrow seta para baixo e a esquerda direction intercardinal southwest diagonal direcao flecha inferior sudoeste",
    group: "symbols",
  },
  {
    glyph: "⬅️",
    label: "left arrow",
    labelPt: "seta para a esquerda",
    terms:
      "left arrow seta para a esquerda cardinal direction west atras direcao flecha oeste voltar",
    group: "symbols",
  },
  {
    glyph: "↖️",
    label: "up-left arrow",
    labelPt: "seta para cima e para a esquerda",
    terms:
      "up-left arrow seta para cima e a esquerda direction intercardinal northwest diagonal superior direcao flecha noroeste",
    group: "symbols",
  },
  {
    glyph: "↕️",
    label: "up-down arrow",
    labelPt: "seta para cima e para baixo",
    terms: "up-down arrow seta para cima e baixo flecha vertical",
    group: "symbols",
  },
  {
    glyph: "↔️",
    label: "left-right arrow",
    labelPt: "seta para esquerda e direita",
    terms:
      "left-right arrow seta para esquerda e direita flecha horizontal lados",
    group: "symbols",
  },
  {
    glyph: "↩️",
    label: "right arrow curving left",
    labelPt: "seta curva da direita para a esquerda",
    terms:
      "right arrow curving left seta curva da direita para a esquerda flecha retorno voltar",
    group: "symbols",
  },
  {
    glyph: "↪️",
    label: "left arrow curving right",
    labelPt: "seta curva da esquerda para a direita",
    terms:
      "left arrow curving right seta curva da esquerda para a direita flecha retorno voltar",
    group: "symbols",
  },
  {
    glyph: "⤴️",
    label: "right arrow curving up",
    labelPt: "seta para a direita curvada para cima",
    terms:
      "right arrow curving up seta para a direita curvada cima curva flecha de baixo",
    group: "symbols",
  },
  {
    glyph: "⤵️",
    label: "right arrow curving down",
    labelPt: "seta para a direita curvada para baixo",
    terms:
      "right arrow curving down seta para a direita curvada baixo curva embaixo flecha de cima",
    group: "symbols",
  },
  {
    glyph: "🔃",
    label: "clockwise vertical arrows",
    labelPt: "setas verticais no sentido horário",
    terms:
      "clockwise vertical arrows setas verticais no sentido horario arrow refresh reload flechas recarregar seta em na simbolo de",
    group: "symbols",
  },
  {
    glyph: "🔄",
    label: "counterclockwise arrows button",
    labelPt: "botão de setas em sentido anti-horário",
    terms:
      "counterclockwise arrows button botao de setas em sentido anti-horario again anticlockwise arrow deja refresh rewindershins vu atualizar no seta",
    group: "symbols",
  },
  {
    glyph: "🔙",
    label: "BACK arrow",
    labelPt: 'seta "BACK"',
    terms: "back arrow seta flecha para a esquerda voltar com",
    group: "symbols",
  },
  {
    glyph: "🔚",
    label: "END arrow",
    labelPt: 'seta "END"',
    terms: "end arrow seta fim com para a esquerda final ir o",
    group: "symbols",
  },
  {
    glyph: "🔛",
    label: "ON! arrow",
    labelPt: 'seta "ON!"',
    terms: "on arrow seta mark flecha marca",
    group: "symbols",
  },
  {
    glyph: "🔜",
    label: "SOON arrow",
    labelPt: 'seta "SOON"',
    terms: "soon arrow seta brb omw em breve flecha simbolo com para a direita",
    group: "symbols",
  },
  {
    glyph: "🔝",
    label: "TOP arrow",
    labelPt: 'seta "TOP"',
    terms: "top arrow seta homie up cima para simbolo com",
    group: "symbols",
  },
  {
    glyph: "🛐",
    label: "place of worship",
    labelPt: "local de culto",
    terms:
      "place of worship local de culto pray religion sagrado oracao religiao reza",
    group: "symbols",
  },
  {
    glyph: "⚛️",
    label: "atom symbol",
    labelPt: "símbolo de átomo",
    terms: "atom symbol simbolo de atomo atheist ateu ateismo do",
    group: "symbols",
  },
  {
    glyph: "🕉️",
    label: "om",
    labelPt: "om",
    terms: "om hindu religion religiao",
    group: "symbols",
  },
  {
    glyph: "✡️",
    label: "star of David",
    labelPt: "estrela de Davi",
    terms:
      "star of david estrela de davi jew jewish judaism religion judaico judeu religiao",
    group: "symbols",
  },
  {
    glyph: "☸️",
    label: "wheel of dharma",
    labelPt: "roda do Dharma",
    terms: "wheel of dharma roda do buddhist religion budista religiao",
    group: "symbols",
  },
  {
    glyph: "☯️",
    label: "yin yang",
    labelPt: "yin yang",
    terms:
      "yin yang difficult lives religion tao taoist total yinyang religiao taoista taoistas yin-yang",
    group: "symbols",
  },
  {
    glyph: "✝️",
    label: "latin cross",
    labelPt: "cruz latina",
    terms: "latin cross cruz latina christ christian religion cristao religiao",
    group: "symbols",
  },
  {
    glyph: "☦️",
    label: "orthodox cross",
    labelPt: "cruz ortodoxa",
    terms: "orthodox cross cruz ortodoxa christian religion cristao religiao",
    group: "symbols",
  },
  {
    glyph: "☪️",
    label: "star and crescent",
    labelPt: "estrela e lua crescente",
    terms:
      "star and crescent estrela e lua crescente islam muslim ramadan religion isla muculmano religiao simbolo",
    group: "symbols",
  },
  {
    glyph: "☮️",
    label: "peace symbol",
    labelPt: "símbolo da paz",
    terms: "peace symbol simbolo da paz healing peaceful",
    group: "symbols",
  },
  {
    glyph: "🕎",
    label: "menorah",
    labelPt: "menorá",
    terms:
      "menorah menora candelabrum candlestick hanukkah jewish judaism religion candelabro judeu castical judaismo memorah religiao",
    group: "symbols",
  },
  {
    glyph: "🔯",
    label: "dotted six-pointed star",
    labelPt: "estrela de seis pontas",
    terms:
      "dotted six-pointed star estrela de seis pontas fortune jewish judaism adivinhacao destino",
    group: "symbols",
  },
  {
    glyph: "🪯",
    label: "khanda",
    labelPt: "khanda",
    terms:
      "khanda deg fateh khalsa religion sikh sikhism tegh fe religiao sikhismo siquismo",
    group: "symbols",
  },
  {
    glyph: "♈️",
    label: "Aries",
    labelPt: "signo de Áries",
    terms: "aries signo de horoscope ram zodiac carneiro zodiaco",
    group: "symbols",
  },
  {
    glyph: "♉️",
    label: "Taurus",
    labelPt: "signo de Touro",
    terms: "taurus signo de touro bull horoscope ox zodiac boi zodiaco",
    group: "symbols",
  },
  {
    glyph: "♊️",
    label: "Gemini",
    labelPt: "signo de Gêmeos",
    terms: "gemini signo de gemeos horoscope twins zodiac zodiaco",
    group: "symbols",
  },
  {
    glyph: "♋️",
    label: "Cancer",
    labelPt: "signo de Câncer",
    terms: "cancer signo de crab horoscope zodiac caranguejo zodiaco",
    group: "symbols",
  },
  {
    glyph: "♌️",
    label: "Leo",
    labelPt: "signo de Leão",
    terms: "leo signo de leao horoscope lion zodiac zodiaco",
    group: "symbols",
  },
  {
    glyph: "♍️",
    label: "Virgo",
    labelPt: "signo de Virgem",
    terms: "virgo signo de virgem horoscope zodiac zodiaco",
    group: "symbols",
  },
  {
    glyph: "♎️",
    label: "Libra",
    labelPt: "signo de Libra",
    terms:
      "libra signo de balance horoscope justice scales zodiac balanca justica virgem zodiaco",
    group: "symbols",
  },
  {
    glyph: "♏️",
    label: "Scorpio",
    labelPt: "signo de Escorpião",
    terms:
      "scorpio signo de escorpiao horoscope scorpion scorpius zodiac zodiaco",
    group: "symbols",
  },
  {
    glyph: "♐️",
    label: "Sagittarius",
    labelPt: "signo de Sagitário",
    terms:
      "sagittarius signo de sagitario archer horoscope zodiac arqueiro zodiaco",
    group: "symbols",
  },
  {
    glyph: "♑️",
    label: "Capricorn",
    labelPt: "signo de Capricórnio",
    terms: "capricorn signo de capricornio goat horoscope zodiac cabra zodiaco",
    group: "symbols",
  },
  {
    glyph: "♒️",
    label: "Aquarius",
    labelPt: "signo de Aquário",
    terms:
      "aquarius signo de aquario bearer horoscope water zodiac zodiaco agua",
    group: "symbols",
  },
  {
    glyph: "♓️",
    label: "Pisces",
    labelPt: "signo de Peixes",
    terms: "pisces signo de peixes fish horoscope zodiac zodiaco",
    group: "symbols",
  },
  {
    glyph: "⛎️",
    label: "Ophiuchus",
    labelPt: "signo de Ofiúco",
    terms:
      "ophiuchus signo de ofiuco bearer serpent snake zodiac cobra serpente zodiaco",
    group: "symbols",
  },
  {
    glyph: "🔀",
    label: "shuffle tracks button",
    labelPt: "botão de músicas aleatórias",
    terms:
      "shuffle tracks button botao de musicas aleatorias arrow crossed cruzadas flechas seta setas em direcao a direita",
    group: "symbols",
  },
  {
    glyph: "🔁",
    label: "repeat button",
    labelPt: "botão de repetir",
    terms:
      "repeat button botao de repetir arrow clockwise flechas horario sentido seta setas em",
    group: "symbols",
  },
  {
    glyph: "🔂",
    label: "repeat single button",
    labelPt: "botão de repetir uma única faixa",
    terms:
      "repeat single button botao de repetir uma unica faixa arrow clockwise once horario numero 1 vez sentido seta setas em com",
    group: "symbols",
  },
  {
    glyph: "▶️",
    label: "play button",
    labelPt: "botão reproduzir",
    terms:
      "play button botao reproduzir arrow right triangle direita seta para a triangulo",
    group: "symbols",
  },
  {
    glyph: "⏩️",
    label: "fast-forward button",
    labelPt: "botão avançar",
    terms:
      "fast-forward button botao avancar arrow double fast forward direita dupla flechas passar para a frente rapido seta",
    group: "symbols",
  },
  {
    glyph: "⏭️",
    label: "next track button",
    labelPt: "botão de próxima faixa",
    terms:
      "next track button botao de proxima faixa arrow scene triangle avancar flechas duplas passar para frente cena seta dupla a direita",
    group: "symbols",
  },
  {
    glyph: "⏯️",
    label: "play or pause button",
    labelPt: "botão de reproduzir ou pausar",
    terms:
      "play or pause button botao de reproduzir ou pausar arrow right triangle direita seta para a triangulo",
    group: "symbols",
  },
  {
    glyph: "◀️",
    label: "reverse button",
    labelPt: "botão de voltar",
    terms:
      "reverse button botao de voltar arrow left triangle esquerda seta para a triangulo",
    group: "symbols",
  },
  {
    glyph: "⏪️",
    label: "fast reverse button",
    labelPt: "botão de retroceder",
    terms:
      "fast reverse button botao de retroceder arrow double rewind dupla esquerda seta para a tras voltar",
    group: "symbols",
  },
  {
    glyph: "⏮️",
    label: "last track button",
    labelPt: "botão de faixa anterior",
    terms:
      "last track button botao de faixa anterior arrow previous scene triangle cena flechas para esquerda seta dupla a setas triangulo voltar ultima",
    group: "symbols",
  },
  {
    glyph: "🔼",
    label: "upwards button",
    labelPt: "botão apontando para cima",
    terms:
      "upwards button botao apontando para cima arrow red up acima de triangulo seta vermelho",
    group: "symbols",
  },
  {
    glyph: "⏫️",
    label: "fast up button",
    labelPt: "botão de avanço para cima",
    terms:
      "fast up button botao de avanco para cima arrow double dupla flechas seta",
    group: "symbols",
  },
  {
    glyph: "🔽",
    label: "downwards button",
    labelPt: "botão apontando para baixo",
    terms:
      "downwards button botao apontando para baixo arrow down red de triangulo seta vermelho",
    group: "symbols",
  },
  {
    glyph: "⏬️",
    label: "fast down button",
    labelPt: "botão de avanço para baixo",
    terms:
      "fast down button botao de avanco para baixo arrow double flechas retroceder rapido seta dupla",
    group: "symbols",
  },
  {
    glyph: "⏸️",
    label: "pause button",
    labelPt: "botão pausar",
    terms: "pause button botao pausar bar double vertical barra dupla pausado",
    group: "symbols",
  },
  {
    glyph: "⏹️",
    label: "stop button",
    labelPt: "botão parar",
    terms: "stop button botao parar square quadrado",
    group: "symbols",
  },
  {
    glyph: "⏺️",
    label: "record button",
    labelPt: "botão gravar",
    terms: "record button botao gravar circle circulo",
    group: "symbols",
  },
  {
    glyph: "⏏️",
    label: "eject button",
    labelPt: "botão ejetar",
    terms: "eject button botao ejetar",
    group: "symbols",
  },
  {
    glyph: "🎦",
    label: "cinema",
    labelPt: "cinema",
    terms: "cinema camera film movie entretenimento filme simbolo do",
    group: "symbols",
  },
  {
    glyph: "🔅",
    label: "dim button",
    labelPt: "botão de diminuir brilho",
    terms:
      "dim button botao de diminuir brilho brightness low escurecer simbolo para reduzir",
    group: "symbols",
  },
  {
    glyph: "🔆",
    label: "bright button",
    labelPt: "botão de aumentar brilho",
    terms:
      "bright button botao de aumentar brilho brightness light simbolo para",
    group: "symbols",
  },
  {
    glyph: "📶",
    label: "antenna bars",
    labelPt: "barras de sinal",
    terms:
      "antenna bars barras de sinal bar cell communication mobile phone signal telephone antena com celular conexao forca do internet sinais telefonia movel telefone",
    group: "symbols",
  },
  {
    glyph: "🛜",
    label: "wireless",
    labelPt: "sem fio",
    terms:
      "wireless sem fio broadband computer connectivity hotspot internet network router smartphone wi-fi wifi wlan banda larga computador conectividade ponto de acesso rede roteador",
    group: "symbols",
  },
  {
    glyph: "📳",
    label: "vibration mode",
    labelPt: "modo vibratório",
    terms:
      "vibration mode modo vibratorio cell communication mobile phone telephone cel celular smartphone telefone vibracao",
    group: "symbols",
  },
  {
    glyph: "📴",
    label: "mobile phone off",
    labelPt: "telefone celular desligado",
    terms:
      "mobile phone off telefone celular desligado cell telephone desligue o smartphone",
    group: "symbols",
  },
  {
    glyph: "♀️",
    label: "female sign",
    labelPt: "símbolo de feminino",
    terms: "female sign simbolo de feminino woman mulher",
    group: "symbols",
  },
  {
    glyph: "♂️",
    label: "male sign",
    labelPt: "símbolo de masculino",
    terms: "male sign simbolo de masculino man homem",
    group: "symbols",
  },
  {
    glyph: "⚧️",
    label: "transgender symbol",
    labelPt: "símbolo transgênero",
    terms: "transgender symbol simbolo transgenero",
    group: "symbols",
  },
  {
    glyph: "✖️",
    label: "multiply",
    labelPt: "sinal de multiplicação",
    terms:
      "multiply sinal de multiplicacao cancel multiplication sign x cancelar multiplicar preto",
    group: "symbols",
  },
  {
    glyph: "➕️",
    label: "plus",
    labelPt: "símbolo de adição",
    terms: "plus simbolo de adicao cruz mais matematica sinal maior somar",
    group: "symbols",
  },
  {
    glyph: "➖️",
    label: "minus",
    labelPt: "símbolo de subtração",
    terms:
      "minus simbolo de subtracao heavy math sign diminuir matematica menos sinal travessao",
    group: "symbols",
  },
  {
    glyph: "➗️",
    label: "divide",
    labelPt: "símbolo de divisão",
    terms:
      "divide simbolo de divisao division heavy math sign dividir matematica sinal grande",
    group: "symbols",
  },
  {
    glyph: "🟰",
    label: "heavy equals sign",
    labelPt: "sinal de igual",
    terms:
      "heavy equals sign sinal de igual answer equal equality math conta iguais igualdade matematica resposta resultado",
    group: "symbols",
  },
  {
    glyph: "♾️",
    label: "infinity",
    labelPt: "infinito",
    terms: "infinity infinito forever unbounded universal eternidade ilimitado",
    group: "symbols",
  },
  {
    glyph: "‼️",
    label: "double exclamation mark",
    labelPt: "dupla exclamação",
    terms:
      "double exclamation mark dupla exclamacao bangbang punctuation explosao ponto de duplo pontuacao",
    group: "symbols",
  },
  {
    glyph: "⁉️",
    label: "exclamation question mark",
    labelPt: "exclamação com interrogação",
    terms:
      "exclamation question mark exclamacao com interrogacao interrobang punctuation pergunta pontuacao sinal",
    group: "symbols",
  },
  {
    glyph: "❓️",
    label: "red question mark",
    labelPt: "ponto de interrogação vermelho",
    terms:
      "red question mark ponto de interrogacao vermelho punctuation pergunta pontuacao sinal",
    group: "symbols",
  },
  {
    glyph: "❔️",
    label: "white question mark",
    labelPt: "ponto de interrogação branco",
    terms:
      "white question mark ponto de interrogacao branco outlined punctuation delineado pergunta pontuacao sinal",
    group: "symbols",
  },
  {
    glyph: "❕️",
    label: "white exclamation mark",
    labelPt: "ponto de exclamação branco",
    terms:
      "white exclamation mark ponto de exclamacao branco outlined punctuation delineado pontuacao sinal",
    group: "symbols",
  },
  {
    glyph: "❗️",
    label: "red exclamation mark",
    labelPt: "ponto de exclamação vermelho",
    terms:
      "red exclamation mark ponto de exclamacao vermelho punctuation pontuacao",
    group: "symbols",
  },
  {
    glyph: "〰️",
    label: "wavy dash",
    labelPt: "travessão ondulado",
    terms: "wavy dash travessao ondulado punctuation onda pontuacao",
    group: "symbols",
  },
  {
    glyph: "💱",
    label: "currency exchange",
    labelPt: "câmbio de moeda",
    terms: "currency exchange cambio de moeda bank money banco dinheiro",
    group: "symbols",
  },
  {
    glyph: "💲",
    label: "heavy dollar sign",
    labelPt: "cifrão",
    terms:
      "heavy dollar sign cifrao billion cash charge currency million money pay dinheiro dolar grana moeda simbolo do em negrito",
    group: "symbols",
  },
  {
    glyph: "⚕️",
    label: "medical symbol",
    labelPt: "símbolo da medicina",
    terms:
      "medical symbol simbolo da medicina aesculapius medicine staff bastao de asclepio esculapio",
    group: "symbols",
  },
  {
    glyph: "♻️",
    label: "recycling symbol",
    labelPt: "símbolo de reciclagem",
    terms:
      "recycling symbol simbolo de reciclagem recycle reclicar sinal solido universal",
    group: "symbols",
  },
  {
    glyph: "⚜️",
    label: "fleur-de-lis",
    labelPt: "flor-de-lis",
    terms: "fleur-de-lis flor-de-lis knights cavaleiros simbolo",
    group: "symbols",
  },
  {
    glyph: "🔱",
    label: "trident emblem",
    labelPt: "emblema de tridente",
    terms:
      "trident emblem emblema de tridente anchor poseidon ship tool ferramenta navio simbolo ancora",
    group: "symbols",
  },
  {
    glyph: "📛",
    label: "name badge",
    labelPt: "crachá",
    terms: "name badge cracha identificacao nome",
    group: "symbols",
  },
  {
    glyph: "🔰",
    label: "Japanese symbol for beginner",
    labelPt: "símbolo japonês de principiante",
    terms:
      "japanese symbol for beginner simbolo japones de principiante chevron green leaf tool yellow folha verde e amarela iniciante para amarelo",
    group: "symbols",
  },
  {
    glyph: "⭕️",
    label: "hollow red circle",
    labelPt: "círculo grande oco",
    terms:
      "hollow red circle circulo grande oco heavy large o aro vermelho vazio",
    group: "symbols",
  },
  {
    glyph: "✅️",
    label: "check mark button",
    labelPt: "marca de seleção branca",
    terms:
      "check mark button marca de selecao branca checked checkmark complete completed done fixed tick botao completo feito verificacao grande verificado",
    group: "symbols",
  },
  {
    glyph: "☑️",
    label: "check box with check",
    labelPt: "caixa de seleção marcada com tique",
    terms:
      "check box with caixa de selecao marcada com tique ballot checked done off tick feito marca verificacao cinza",
    group: "symbols",
  },
  {
    glyph: "✔️",
    label: "check mark",
    labelPt: "marca de seleção",
    terms:
      "check mark marca de selecao checked checkmark done heavy tick feito verificacao simples marcar selecionar",
    group: "symbols",
  },
  {
    glyph: "❌️",
    label: "cross mark",
    labelPt: "xis",
    terms:
      "cross mark xis cancel multiplication multiply x cancelar multiplicar multiplicacao vermelho",
    group: "symbols",
  },
  {
    glyph: "❎️",
    label: "cross mark button",
    labelPt: "botão de xis",
    terms:
      "cross mark button botao de xis multiplication multiply square x com caixa marcado multiplicar quadrado em um verde",
    group: "symbols",
  },
  {
    glyph: "➰️",
    label: "curly loop",
    labelPt: "laço encaracolado",
    terms: "curly loop laco encaracolado curl onda ondulado volta",
    group: "symbols",
  },
  {
    glyph: "➿️",
    label: "double curly loop",
    labelPt: "loop encaracolado duas vezes",
    terms:
      "double curly loop encaracolado duas vezes curl duplo encaradolado onda ondulado",
    group: "symbols",
  },
  {
    glyph: "〽️",
    label: "part alternation mark",
    labelPt: "sinal japonês indicando início de música",
    terms:
      "part alternation mark sinal japones indicando inicio de musica canto simbolo",
    group: "symbols",
  },
  {
    glyph: "✳️",
    label: "eight-spoked asterisk",
    labelPt: "asterisco de oito pontas",
    terms: "eight-spoked asterisk asterisco de oito pontas * estrela",
    group: "symbols",
  },
  {
    glyph: "✴️",
    label: "eight-pointed star",
    labelPt: "estrela de oito pontas",
    terms: "eight-pointed star estrela de oito pontas *",
    group: "symbols",
  },
  {
    glyph: "❇️",
    label: "sparkle",
    labelPt: "faísca",
    terms: "sparkle faisca * cruz",
    group: "symbols",
  },
  {
    glyph: "©️",
    label: "copyright",
    labelPt: "símbolo de copyright",
    terms: "copyright simbolo de c direitos autorais",
    group: "symbols",
  },
  {
    glyph: "®️",
    label: "registered",
    labelPt: "símbolo de registrado",
    terms: "registered simbolo de registrado r marca registrada",
    group: "symbols",
  },
  {
    glyph: "™️",
    label: "trade mark",
    labelPt: "símbolo de marca registrada",
    terms: "trade mark simbolo de marca registrada tm trademark",
    group: "symbols",
  },
  {
    glyph: "🫟",
    label: "splatter",
    labelPt: "respingo",
    terms:
      "splatter respingo drip holi ink liquid mess paint spill stain mancha pingo tinta",
    group: "symbols",
  },
  {
    glyph: "#️⃣",
    label: "keycap: #",
    labelPt: "tecla: #",
    terms: "keycap # tecla",
    group: "symbols",
  },
  {
    glyph: "*️⃣",
    label: "keycap: *",
    labelPt: "tecla: *",
    terms: "keycap * tecla",
    group: "symbols",
  },
  {
    glyph: "0️⃣",
    label: "keycap: 0",
    labelPt: "tecla: 0",
    terms: "keycap 0 tecla zero",
    group: "symbols",
  },
  {
    glyph: "1️⃣",
    label: "keycap: 1",
    labelPt: "tecla: 1",
    terms: "keycap 1 tecla one um",
    group: "symbols",
  },
  {
    glyph: "2️⃣",
    label: "keycap: 2",
    labelPt: "tecla: 2",
    terms: "keycap 2 tecla two dois",
    group: "symbols",
  },
  {
    glyph: "3️⃣",
    label: "keycap: 3",
    labelPt: "tecla: 3",
    terms: "keycap 3 tecla three tres",
    group: "symbols",
  },
  {
    glyph: "4️⃣",
    label: "keycap: 4",
    labelPt: "tecla: 4",
    terms: "keycap 4 tecla four quatro",
    group: "symbols",
  },
  {
    glyph: "5️⃣",
    label: "keycap: 5",
    labelPt: "tecla: 5",
    terms: "keycap 5 tecla five cinco",
    group: "symbols",
  },
  {
    glyph: "6️⃣",
    label: "keycap: 6",
    labelPt: "tecla: 6",
    terms: "keycap 6 tecla six seis",
    group: "symbols",
  },
  {
    glyph: "7️⃣",
    label: "keycap: 7",
    labelPt: "tecla: 7",
    terms: "keycap 7 tecla seven sete",
    group: "symbols",
  },
  {
    glyph: "8️⃣",
    label: "keycap: 8",
    labelPt: "tecla: 8",
    terms: "keycap 8 tecla eight oito",
    group: "symbols",
  },
  {
    glyph: "9️⃣",
    label: "keycap: 9",
    labelPt: "tecla: 9",
    terms: "keycap 9 tecla nine nove",
    group: "symbols",
  },
  {
    glyph: "🔟",
    label: "keycap: 10",
    labelPt: "tecla: 10",
    terms: "keycap 10 tecla",
    group: "symbols",
  },
  {
    glyph: "🔠",
    label: "input latin uppercase",
    labelPt: "letras latinas maiúsculas",
    terms:
      "input latin uppercase letras latinas maiusculas abcd letters caracteres latinos maiusculos digitacao inserir",
    group: "symbols",
  },
  {
    glyph: "🔡",
    label: "input latin lowercase",
    labelPt: "letras latinas minúsculas",
    terms:
      "input latin lowercase letras latinas minusculas abcd letters caracteres latinos minusculos digitacao latino",
    group: "symbols",
  },
  {
    glyph: "🔢",
    label: "input numbers",
    labelPt: "números",
    terms: "input numbers numeros 1234 digitacao inserir",
    group: "symbols",
  },
  {
    glyph: "🔣",
    label: "input symbols",
    labelPt: "símbolos",
    terms: "input symbols simbolos digitacao inserir",
    group: "symbols",
  },
  {
    glyph: "🔤",
    label: "input latin letters",
    labelPt: "letras latinas",
    terms:
      "input latin letters letras latinas abc alphabet alfabeto digitacao ingles inserir latino",
    group: "symbols",
  },
  {
    glyph: "🅰️",
    label: "A button (blood type)",
    labelPt: "botão A (tipo sanguíneo)",
    terms: "a button blood type botao tipo sanguineo sangue",
    group: "symbols",
  },
  {
    glyph: "🆎",
    label: "AB button (blood type)",
    labelPt: "botão AB (tipo sanguíneo)",
    terms: "ab button blood type botao tipo sanguineo sangue",
    group: "symbols",
  },
  {
    glyph: "🅱️",
    label: "B button (blood type)",
    labelPt: "botão B (tipo sanguíneo)",
    terms: "b button blood type botao tipo sanguineo sangue",
    group: "symbols",
  },
  {
    glyph: "🆑",
    label: "CL button",
    labelPt: "botão CL",
    terms: "cl button botao limpar simbolo do",
    group: "symbols",
  },
  {
    glyph: "🆒",
    label: "COOL button",
    labelPt: 'botão "COOL"',
    terms: "cool button botao legal simbolo",
    group: "symbols",
  },
  {
    glyph: "🆓",
    label: "FREE button",
    labelPt: 'botão "FREE"',
    terms: "free button botao gratuito gratis simbolo",
    group: "symbols",
  },
  {
    glyph: "ℹ️",
    label: "information",
    labelPt: "informações",
    terms: "information informacoes i informacao simbolo de",
    group: "symbols",
  },
  {
    glyph: "🆔",
    label: "ID button",
    labelPt: "botão ID",
    terms: "id button botao identity identidade simbolo",
    group: "symbols",
  },
  {
    glyph: "Ⓜ️",
    label: "circled M",
    labelPt: "círculo com a letra M",
    terms: "circled m circulo com a letra circle",
    group: "symbols",
  },
  {
    glyph: "🆕",
    label: "NEW button",
    labelPt: 'botão "NEW"',
    terms: "new button botao novo simbolo",
    group: "symbols",
  },
  {
    glyph: "🆖",
    label: "NG button",
    labelPt: "botão NG",
    terms: "ng button botao simbolo",
    group: "symbols",
  },
  {
    glyph: "🅾️",
    label: "O button (blood type)",
    labelPt: "botão O (tipo sanguíneo)",
    terms: "o button blood type botao tipo sanguineo sangue",
    group: "symbols",
  },
  {
    glyph: "🆗",
    label: "OK button",
    labelPt: "botão OK",
    terms: "ok button botao okay sim simbolo",
    group: "symbols",
  },
  {
    glyph: "🅿️",
    label: "P button",
    labelPt: "botão P",
    terms: "p button botao parking estacionamento estacionar garagem de carros",
    group: "symbols",
  },
  {
    glyph: "🆘",
    label: "SOS button",
    labelPt: "botão SOS",
    terms: "sos button botao help ajuda socorro simbolo",
    group: "symbols",
  },
  {
    glyph: "🆙",
    label: "UP! button",
    labelPt: 'botão "UP!"',
    terms: "up button botao mark para cima simbolo",
    group: "symbols",
  },
  {
    glyph: "🆚",
    label: "VS button",
    labelPt: "botão VS",
    terms: "vs button botao versus simbolo",
    group: "symbols",
  },
  {
    glyph: "🈁",
    label: "Japanese “here” button",
    labelPt: "botão japonês de “aqui”",
    terms:
      "japanese here button botao japones de aqui katakana alfabeto koko ココ",
    group: "symbols",
  },
  {
    glyph: "🈂️",
    label: "Japanese “service charge” button",
    labelPt: "botão japonês de “taxa de serviço”",
    terms:
      "japanese service charge button botao japones de taxa servico katakana alfabeto katanaka sa サ",
    group: "symbols",
  },
  {
    glyph: "🈷️",
    label: "Japanese “monthly amount” button",
    labelPt: "botão japonês de “quantidade mensal”",
    terms:
      "japanese monthly amount button botao japones de quantidade mensal ideograph alfabeto ideograma ideografico valor 月",
    group: "symbols",
  },
  {
    glyph: "🈶",
    label: "Japanese “not free of charge” button",
    labelPt: "botão japonês de “não gratuito”",
    terms:
      "japanese not free of charge button botao japones de nao gratuito ideograph alfabeto ideograma ideografico 有",
    group: "symbols",
  },
  {
    glyph: "🈯️",
    label: "Japanese “reserved” button",
    labelPt: "botão japonês de “reservado”",
    terms:
      "japanese reserved button botao japones de reservado ideograph alfabeto ideograma ideografico 指",
    group: "symbols",
  },
  {
    glyph: "🉐",
    label: "Japanese “bargain” button",
    labelPt: "botão japonês de “barganha”",
    terms:
      "japanese bargain button botao japones de barganha ideograph alfabeto ideograma ideografico pechincha 得",
    group: "symbols",
  },
  {
    glyph: "🈹",
    label: "Japanese “discount” button",
    labelPt: "botão japonês de “desconto”",
    terms:
      "japanese discount button botao japones de desconto ideograph alfabeto ideograma ideografico 割",
    group: "symbols",
  },
];

const EMOJI_BLOCK_4: EmojiEntry[] = [
  {
    glyph: "🈚️",
    label: "Japanese “free of charge” button",
    labelPt: "botão japonês de “gratuito”",
    terms:
      "japanese free of charge button botao japones de gratuito ideograph alfabeto graca gratis ideograma ideografico sem custo 無",
    group: "symbols",
  },
  {
    glyph: "🈲",
    label: "Japanese “prohibited” button",
    labelPt: "botão japonês de “proibido”",
    terms:
      "japanese prohibited button botao japones de proibido ideograph alfabeto ideograma ideografico quadrado proibir 禁",
    group: "symbols",
  },
  {
    glyph: "🉑",
    label: "Japanese “acceptable” button",
    labelPt: "botão japonês de “aceitável”",
    terms:
      "japanese acceptable button botao japones de aceitavel ideograph aceitar alfabeto chines ideograma ideografico circular 可",
    group: "symbols",
  },
  {
    glyph: "🈸",
    label: "Japanese “application” button",
    labelPt: "botão japonês de “aplicação”",
    terms:
      "japanese application button botao japones de aplicacao ideograph alfabeto aplicar chines ideograma ideografico quadrado 申",
    group: "symbols",
  },
  {
    glyph: "🈴",
    label: "Japanese “passing grade” button",
    labelPt: "botão japonês de “nota mínima”",
    terms:
      "japanese passing grade button botao japones de nota minima ideograph alfabeto chines ideograma ideografico quadrado juntos 合",
    group: "symbols",
  },
  {
    glyph: "🈳",
    label: "Japanese “vacancy” button",
    labelPt: "botão japonês de “vago”",
    terms:
      "japanese vacancy button botao japones de vago ideograph alfabeto ideograma ideografico vaga vazio 空",
    group: "symbols",
  },
  {
    glyph: "㊗️",
    label: "Japanese “congratulations” button",
    labelPt: "botão japonês de “parabéns”",
    terms:
      "japanese congratulations button botao japones de parabens ideograph alfabeto ideograma ideografico circular janones 祝",
    group: "symbols",
  },
  {
    glyph: "㊙️",
    label: "Japanese “secret” button",
    labelPt: "botão japonês de “segredo”",
    terms:
      "japanese secret button botao japones de segredo ideograph alfabeto ideograma ideografico circular 秘",
    group: "symbols",
  },
  {
    glyph: "🈺",
    label: "Japanese “open for business” button",
    labelPt: "botão japonês de “aberto para negócios”",
    terms:
      "japanese open for business button botao japones de aberto para negocios ideograph chines ideograma ideografico quadrado operando 営",
    group: "symbols",
  },
  {
    glyph: "🈵",
    label: "Japanese “no vacancy” button",
    labelPt: "botão japonês de “sem vagas”",
    terms:
      "japanese no vacancy button botao japones de sem vagas ideograph alfabeto completude ideograma ideografico quadrado 満",
    group: "symbols",
  },
  {
    glyph: "🔴",
    label: "red circle",
    labelPt: "círculo vermelho",
    terms:
      "red circle circulo vermelho geometric bola vermelha grande geometrico",
    group: "symbols",
  },
  {
    glyph: "🟠",
    label: "orange circle",
    labelPt: "círculo laranja",
    terms: "orange circle circulo laranja",
    group: "symbols",
  },
  {
    glyph: "🟡",
    label: "yellow circle",
    labelPt: "círculo amarelo",
    terms: "yellow circle circulo amarelo",
    group: "symbols",
  },
  {
    glyph: "🟢",
    label: "green circle",
    labelPt: "círculo verde",
    terms: "green circle circulo verde",
    group: "symbols",
  },
  {
    glyph: "🔵",
    label: "blue circle",
    labelPt: "círculo azul",
    terms: "blue circle circulo azul geometric bolinha grande geometrico",
    group: "symbols",
  },
  {
    glyph: "🟣",
    label: "purple circle",
    labelPt: "círculo roxo",
    terms: "purple circle circulo roxo",
    group: "symbols",
  },
  {
    glyph: "🟤",
    label: "brown circle",
    labelPt: "círculo marrom",
    terms: "brown circle circulo marrom",
    group: "symbols",
  },
  {
    glyph: "⚫️",
    label: "black circle",
    labelPt: "círculo preto",
    terms: "black circle circulo preto geometric geometrico",
    group: "symbols",
  },
  {
    glyph: "⚪️",
    label: "white circle",
    labelPt: "círculo branco",
    terms: "white circle circulo branco geometric geometrico",
    group: "symbols",
  },
  {
    glyph: "🟥",
    label: "red square",
    labelPt: "quadrado vermelho",
    terms: "red square quadrado vermelho card penalty",
    group: "symbols",
  },
  {
    glyph: "🟧",
    label: "orange square",
    labelPt: "quadrado laranja",
    terms: "orange square quadrado laranja",
    group: "symbols",
  },
  {
    glyph: "🟨",
    label: "yellow square",
    labelPt: "quadrado amarelo",
    terms: "yellow square quadrado amarelo card penalty",
    group: "symbols",
  },
  {
    glyph: "🟩",
    label: "green square",
    labelPt: "quadrado verde",
    terms: "green square quadrado verde",
    group: "symbols",
  },
  {
    glyph: "🟦",
    label: "blue square",
    labelPt: "quadrado azul",
    terms: "blue square quadrado azul anil",
    group: "symbols",
  },
  {
    glyph: "🟪",
    label: "purple square",
    labelPt: "quadrado roxo",
    terms: "purple square quadrado roxo purpura",
    group: "symbols",
  },
  {
    glyph: "🟫",
    label: "brown square",
    labelPt: "quadrado marrom",
    terms: "brown square quadrado marrom",
    group: "symbols",
  },
  {
    glyph: "⬛️",
    label: "black large square",
    labelPt: "quadrado preto grande",
    terms: "black large square quadrado preto grande geometric geometrico",
    group: "symbols",
  },
  {
    glyph: "⬜️",
    label: "white large square",
    labelPt: "quadrado branco grande",
    terms: "white large square quadrado branco grande geometric geometrico",
    group: "symbols",
  },
  {
    glyph: "◼️",
    label: "black medium square",
    labelPt: "quadrado preto médio",
    terms: "black medium square quadrado preto medio geometric geometrico",
    group: "symbols",
  },
  {
    glyph: "◻️",
    label: "white medium square",
    labelPt: "quadrado branco médio",
    terms: "white medium square quadrado branco medio geometric geometrico",
    group: "symbols",
  },
  {
    glyph: "◾️",
    label: "black medium-small square",
    labelPt: "quadrado preto médio menor",
    terms:
      "black medium-small square quadrado preto medio menor geometric geometrico",
    group: "symbols",
  },
  {
    glyph: "◽️",
    label: "white medium-small square",
    labelPt: "quadrado branco médio menor",
    terms:
      "white medium-small square quadrado branco medio menor geometric geometrico",
    group: "symbols",
  },
  {
    glyph: "▪️",
    label: "black small square",
    labelPt: "quadrado preto pequeno",
    terms: "black small square quadrado preto pequeno geometric geometrico",
    group: "symbols",
  },
  {
    glyph: "▫️",
    label: "white small square",
    labelPt: "quadrado branco pequeno",
    terms: "white small square quadrado branco pequeno geometric geometrico",
    group: "symbols",
  },
  {
    glyph: "🔶",
    label: "large orange diamond",
    labelPt: "losango laranja grande",
    terms:
      "large orange diamond losango laranja grande geometric cor de diamante geometrico",
    group: "symbols",
  },
  {
    glyph: "🔷",
    label: "large blue diamond",
    labelPt: "losango azul grande",
    terms:
      "large blue diamond losango azul grande geometric balao diamante geometrico",
    group: "symbols",
  },
  {
    glyph: "🔸",
    label: "small orange diamond",
    labelPt: "losango laranja pequeno",
    terms:
      "small orange diamond losango laranja pequeno geometric cor de diamante geometrico",
    group: "symbols",
  },
  {
    glyph: "🔹",
    label: "small blue diamond",
    labelPt: "losango azul pequeno",
    terms:
      "small blue diamond losango azul pequeno geometric diamante geometrico",
    group: "symbols",
  },
  {
    glyph: "🔺",
    label: "red triangle pointed up",
    labelPt: "triângulo vermelho para cima",
    terms:
      "red triangle pointed up triangulo vermelho para cima geometric geometrico apontando",
    group: "symbols",
  },
  {
    glyph: "🔻",
    label: "red triangle pointed down",
    labelPt: "triângulo vermelho para baixo",
    terms:
      "red triangle pointed down triangulo vermelho para baixo geometric geometrico apontando",
    group: "symbols",
  },
  {
    glyph: "💠",
    label: "diamond with a dot",
    labelPt: "diamante com um ponto",
    terms:
      "diamond with a dot diamante com um ponto comic geometric comico dentro formato de geometrico",
    group: "symbols",
  },
  {
    glyph: "🔘",
    label: "radio button",
    labelPt: "botão de opção",
    terms: "radio button botao de opcao geometric geometrico",
    group: "symbols",
  },
  {
    glyph: "🔳",
    label: "white square button",
    labelPt: "botão quadrado branco",
    terms:
      "white square button botao quadrado branco geometric outlined e preto",
    group: "symbols",
  },
  {
    glyph: "🔲",
    label: "black square button",
    labelPt: "botão quadrado preto",
    terms:
      "black square button botao quadrado preto geometric e branco geometrico",
    group: "symbols",
  },
  {
    glyph: "🏁",
    label: "chequered flag",
    labelPt: "bandeira quadriculada",
    terms:
      "chequered flag bandeira quadriculada checkered finish flags game race racing sport win chegada corrida esporte vitoria",
    group: "flags",
  },
  {
    glyph: "🚩",
    label: "triangular flag",
    labelPt: "bandeira triangular",
    terms:
      "triangular flag bandeira construction golf post informacoes localizacao poste vermelha vermelho",
    group: "flags",
  },
  {
    glyph: "🎌",
    label: "crossed flags",
    labelPt: "bandeiras cruzadas",
    terms:
      "crossed flags bandeiras cruzadas celebration cross japanese bandeira comemoracao cruzar japones japao",
    group: "flags",
  },
  {
    glyph: "🏴",
    label: "black flag",
    labelPt: "bandeira preta",
    terms: "black flag bandeira preta waving tremulando",
    group: "flags",
  },
  {
    glyph: "🏳️",
    label: "white flag",
    labelPt: "bandeira branca",
    terms: "white flag bandeira branca waving paz tremulando",
    group: "flags",
  },
  {
    glyph: "🏳️‍🌈",
    label: "rainbow flag",
    labelPt: "bandeira do arco-íris",
    terms:
      "rainbow flag bandeira do arco-iris bisexual gay genderqueer glbt glbtq lesbian lgbt lgbtq lgbtqia pride queer trans transgender bissexual lesbica orgulho transexual transgenero travesti",
    group: "flags",
  },
  {
    glyph: "🏳️‍⚧️",
    label: "transgender flag",
    labelPt: "bandeira transgênero",
    terms:
      "transgender flag bandeira transgenero blue light pink white azul claro branco rosa",
    group: "flags",
  },
  {
    glyph: "🏴‍☠️",
    label: "pirate flag",
    labelPt: "bandeira de pirata",
    terms:
      "pirate flag bandeira de pirata jolly plunder roger treasure caveira osso saque tesouro",
    group: "flags",
  },
  {
    glyph: "🇦🇨",
    label: "flag: Ascension Island",
    labelPt: "bandeira: Ilha de Ascensão",
    terms: "flag ascension island bandeira ilha de ascensao ac",
    group: "flags",
  },
  {
    glyph: "🇦🇩",
    label: "flag: Andorra",
    labelPt: "bandeira: Andorra",
    terms: "flag andorra bandeira ad",
    group: "flags",
  },
  {
    glyph: "🇦🇪",
    label: "flag: United Arab Emirates",
    labelPt: "bandeira: Emirados Árabes Unidos",
    terms: "flag united arab emirates bandeira emirados arabes unidos ae",
    group: "flags",
  },
  {
    glyph: "🇦🇫",
    label: "flag: Afghanistan",
    labelPt: "bandeira: Afeganistão",
    terms: "flag afghanistan bandeira afeganistao af",
    group: "flags",
  },
  {
    glyph: "🇦🇬",
    label: "flag: Antigua & Barbuda",
    labelPt: "bandeira: Antígua e Barbuda",
    terms: "flag antigua barbuda bandeira e ag",
    group: "flags",
  },
  {
    glyph: "🇦🇮",
    label: "flag: Anguilla",
    labelPt: "bandeira: Anguila",
    terms: "flag anguilla bandeira anguila ai",
    group: "flags",
  },
  {
    glyph: "🇦🇱",
    label: "flag: Albania",
    labelPt: "bandeira: Albânia",
    terms: "flag albania bandeira al",
    group: "flags",
  },
  {
    glyph: "🇦🇲",
    label: "flag: Armenia",
    labelPt: "bandeira: Armênia",
    terms: "flag armenia bandeira am",
    group: "flags",
  },
  {
    glyph: "🇦🇴",
    label: "flag: Angola",
    labelPt: "bandeira: Angola",
    terms: "flag angola bandeira ao",
    group: "flags",
  },
  {
    glyph: "🇦🇶",
    label: "flag: Antarctica",
    labelPt: "bandeira: Antártida",
    terms: "flag antarctica bandeira antartida aq",
    group: "flags",
  },
  {
    glyph: "🇦🇷",
    label: "flag: Argentina",
    labelPt: "bandeira: Argentina",
    terms: "flag argentina bandeira ar",
    group: "flags",
  },
  {
    glyph: "🇦🇸",
    label: "flag: American Samoa",
    labelPt: "bandeira: Samoa Americana",
    terms: "flag american samoa bandeira americana as",
    group: "flags",
  },
  {
    glyph: "🇦🇹",
    label: "flag: Austria",
    labelPt: "bandeira: Áustria",
    terms: "flag austria bandeira at",
    group: "flags",
  },
  {
    glyph: "🇦🇺",
    label: "flag: Australia",
    labelPt: "bandeira: Austrália",
    terms: "flag australia bandeira au",
    group: "flags",
  },
  {
    glyph: "🇦🇼",
    label: "flag: Aruba",
    labelPt: "bandeira: Aruba",
    terms: "flag aruba bandeira aw",
    group: "flags",
  },
  {
    glyph: "🇦🇽",
    label: "flag: Åland Islands",
    labelPt: "bandeira: Ilhas Aland",
    terms: "flag aland islands bandeira ilhas ax",
    group: "flags",
  },
  {
    glyph: "🇦🇿",
    label: "flag: Azerbaijan",
    labelPt: "bandeira: Azerbaijão",
    terms: "flag azerbaijan bandeira azerbaijao az",
    group: "flags",
  },
  {
    glyph: "🇧🇦",
    label: "flag: Bosnia & Herzegovina",
    labelPt: "bandeira: Bósnia e Herzegovina",
    terms: "flag bosnia herzegovina bandeira e ba",
    group: "flags",
  },
  {
    glyph: "🇧🇧",
    label: "flag: Barbados",
    labelPt: "bandeira: Barbados",
    terms: "flag barbados bandeira bb",
    group: "flags",
  },
  {
    glyph: "🇧🇩",
    label: "flag: Bangladesh",
    labelPt: "bandeira: Bangladesh",
    terms: "flag bangladesh bandeira bd",
    group: "flags",
  },
  {
    glyph: "🇧🇪",
    label: "flag: Belgium",
    labelPt: "bandeira: Bélgica",
    terms: "flag belgium bandeira belgica be",
    group: "flags",
  },
  {
    glyph: "🇧🇫",
    label: "flag: Burkina Faso",
    labelPt: "bandeira: Burquina Faso",
    terms: "flag burkina faso bandeira burquina bf",
    group: "flags",
  },
  {
    glyph: "🇧🇬",
    label: "flag: Bulgaria",
    labelPt: "bandeira: Bulgária",
    terms: "flag bulgaria bandeira bg",
    group: "flags",
  },
  {
    glyph: "🇧🇭",
    label: "flag: Bahrain",
    labelPt: "bandeira: Barein",
    terms: "flag bahrain bandeira barein bh",
    group: "flags",
  },
  {
    glyph: "🇧🇮",
    label: "flag: Burundi",
    labelPt: "bandeira: Burundi",
    terms: "flag burundi bandeira bi",
    group: "flags",
  },
  {
    glyph: "🇧🇯",
    label: "flag: Benin",
    labelPt: "bandeira: Benin",
    terms: "flag benin bandeira bj",
    group: "flags",
  },
  {
    glyph: "🇧🇱",
    label: "flag: St. Barthélemy",
    labelPt: "bandeira: São Bartolomeu",
    terms: "flag st barthelemy bandeira sao bartolomeu bl",
    group: "flags",
  },
  {
    glyph: "🇧🇲",
    label: "flag: Bermuda",
    labelPt: "bandeira: Bermudas",
    terms: "flag bermuda bandeira bermudas bm",
    group: "flags",
  },
  {
    glyph: "🇧🇳",
    label: "flag: Brunei",
    labelPt: "bandeira: Brunei",
    terms: "flag brunei bandeira bn",
    group: "flags",
  },
  {
    glyph: "🇧🇴",
    label: "flag: Bolivia",
    labelPt: "bandeira: Bolívia",
    terms: "flag bolivia bandeira bo",
    group: "flags",
  },
  {
    glyph: "🇧🇶",
    label: "flag: Caribbean Netherlands",
    labelPt: "bandeira: Países Baixos Caribenhos",
    terms: "flag caribbean netherlands bandeira paises baixos caribenhos bq",
    group: "flags",
  },
  {
    glyph: "🇧🇷",
    label: "flag: Brazil",
    labelPt: "bandeira: Brasil",
    terms: "flag brazil bandeira brasil br",
    group: "flags",
  },
  {
    glyph: "🇧🇸",
    label: "flag: Bahamas",
    labelPt: "bandeira: Bahamas",
    terms: "flag bahamas bandeira bs",
    group: "flags",
  },
  {
    glyph: "🇧🇹",
    label: "flag: Bhutan",
    labelPt: "bandeira: Butão",
    terms: "flag bhutan bandeira butao bt",
    group: "flags",
  },
  {
    glyph: "🇧🇻",
    label: "flag: Bouvet Island",
    labelPt: "bandeira: Ilha Bouvet",
    terms: "flag bouvet island bandeira ilha bv",
    group: "flags",
  },
  {
    glyph: "🇧🇼",
    label: "flag: Botswana",
    labelPt: "bandeira: Botsuana",
    terms: "flag botswana bandeira botsuana bw",
    group: "flags",
  },
  {
    glyph: "🇧🇾",
    label: "flag: Belarus",
    labelPt: "bandeira: Bielorrússia",
    terms: "flag belarus bandeira bielorrussia by",
    group: "flags",
  },
  {
    glyph: "🇧🇿",
    label: "flag: Belize",
    labelPt: "bandeira: Belize",
    terms: "flag belize bandeira bz",
    group: "flags",
  },
  {
    glyph: "🇨🇦",
    label: "flag: Canada",
    labelPt: "bandeira: Canadá",
    terms: "flag canada bandeira ca",
    group: "flags",
  },
  {
    glyph: "🇨🇨",
    label: "flag: Cocos (Keeling) Islands",
    labelPt: "bandeira: Ilhas Cocos (Keeling)",
    terms: "flag cocos keeling islands bandeira ilhas cc",
    group: "flags",
  },
  {
    glyph: "🇨🇩",
    label: "flag: Congo - Kinshasa",
    labelPt: "bandeira: Congo - Kinshasa",
    terms: "flag congo kinshasa bandeira cd",
    group: "flags",
  },
  {
    glyph: "🇨🇫",
    label: "flag: Central African Republic",
    labelPt: "bandeira: República Centro-Africana",
    terms:
      "flag central african republic bandeira republica centro-africana cf",
    group: "flags",
  },
  {
    glyph: "🇨🇬",
    label: "flag: Congo - Brazzaville",
    labelPt: "bandeira: República do Congo",
    terms: "flag congo brazzaville bandeira republica do cg",
    group: "flags",
  },
  {
    glyph: "🇨🇭",
    label: "flag: Switzerland",
    labelPt: "bandeira: Suíça",
    terms: "flag switzerland bandeira suica ch",
    group: "flags",
  },
  {
    glyph: "🇨🇮",
    label: "flag: Côte d’Ivoire",
    labelPt: "bandeira: Costa do Marfim",
    terms: "flag cote divoire bandeira costa do marfim ci",
    group: "flags",
  },
  {
    glyph: "🇨🇰",
    label: "flag: Cook Islands",
    labelPt: "bandeira: Ilhas Cook",
    terms: "flag cook islands bandeira ilhas ck",
    group: "flags",
  },
  {
    glyph: "🇨🇱",
    label: "flag: Chile",
    labelPt: "bandeira: Chile",
    terms: "flag chile bandeira cl",
    group: "flags",
  },
  {
    glyph: "🇨🇲",
    label: "flag: Cameroon",
    labelPt: "bandeira: Camarões",
    terms: "flag cameroon bandeira camaroes cm",
    group: "flags",
  },
  {
    glyph: "🇨🇳",
    label: "flag: China",
    labelPt: "bandeira: China",
    terms: "flag china bandeira cn",
    group: "flags",
  },
  {
    glyph: "🇨🇴",
    label: "flag: Colombia",
    labelPt: "bandeira: Colômbia",
    terms: "flag colombia bandeira co",
    group: "flags",
  },
  {
    glyph: "🇨🇵",
    label: "flag: Clipperton Island",
    labelPt: "bandeira: Ilha de Clipperton",
    terms: "flag clipperton island bandeira ilha de cp",
    group: "flags",
  },
  {
    glyph: "🇨🇶",
    label: "flag: Sark",
    labelPt: "bandeira: Sark",
    terms: "flag sark bandeira cq",
    group: "flags",
  },
  {
    glyph: "🇨🇷",
    label: "flag: Costa Rica",
    labelPt: "bandeira: Costa Rica",
    terms: "flag costa rica bandeira cr",
    group: "flags",
  },
  {
    glyph: "🇨🇺",
    label: "flag: Cuba",
    labelPt: "bandeira: Cuba",
    terms: "flag cuba bandeira cu",
    group: "flags",
  },
  {
    glyph: "🇨🇻",
    label: "flag: Cape Verde",
    labelPt: "bandeira: Cabo Verde",
    terms: "flag cape verde bandeira cabo cv",
    group: "flags",
  },
  {
    glyph: "🇨🇼",
    label: "flag: Curaçao",
    labelPt: "bandeira: Curaçao",
    terms: "flag curacao bandeira cw",
    group: "flags",
  },
  {
    glyph: "🇨🇽",
    label: "flag: Christmas Island",
    labelPt: "bandeira: Ilha Christmas",
    terms: "flag christmas island bandeira ilha cx",
    group: "flags",
  },
  {
    glyph: "🇨🇾",
    label: "flag: Cyprus",
    labelPt: "bandeira: Chipre",
    terms: "flag cyprus bandeira chipre cy",
    group: "flags",
  },
  {
    glyph: "🇨🇿",
    label: "flag: Czechia",
    labelPt: "bandeira: Tchéquia",
    terms: "flag czechia bandeira tchequia cz",
    group: "flags",
  },
  {
    glyph: "🇩🇪",
    label: "flag: Germany",
    labelPt: "bandeira: Alemanha",
    terms: "flag germany bandeira alemanha de",
    group: "flags",
  },
  {
    glyph: "🇩🇬",
    label: "flag: Diego Garcia",
    labelPt: "bandeira: Diego Garcia",
    terms: "flag diego garcia bandeira dg",
    group: "flags",
  },
  {
    glyph: "🇩🇯",
    label: "flag: Djibouti",
    labelPt: "bandeira: Djibuti",
    terms: "flag djibouti bandeira djibuti dj",
    group: "flags",
  },
  {
    glyph: "🇩🇰",
    label: "flag: Denmark",
    labelPt: "bandeira: Dinamarca",
    terms: "flag denmark bandeira dinamarca dk",
    group: "flags",
  },
  {
    glyph: "🇩🇲",
    label: "flag: Dominica",
    labelPt: "bandeira: Dominica",
    terms: "flag dominica bandeira dm",
    group: "flags",
  },
  {
    glyph: "🇩🇴",
    label: "flag: Dominican Republic",
    labelPt: "bandeira: República Dominicana",
    terms: "flag dominican republic bandeira republica dominicana do",
    group: "flags",
  },
  {
    glyph: "🇩🇿",
    label: "flag: Algeria",
    labelPt: "bandeira: Argélia",
    terms: "flag algeria bandeira argelia dz",
    group: "flags",
  },
  {
    glyph: "🇪🇦",
    label: "flag: Ceuta & Melilla",
    labelPt: "bandeira: Ceuta e Melilla",
    terms: "flag ceuta melilla bandeira e ea",
    group: "flags",
  },
  {
    glyph: "🇪🇨",
    label: "flag: Ecuador",
    labelPt: "bandeira: Equador",
    terms: "flag ecuador bandeira equador ec",
    group: "flags",
  },
  {
    glyph: "🇪🇪",
    label: "flag: Estonia",
    labelPt: "bandeira: Estônia",
    terms: "flag estonia bandeira ee",
    group: "flags",
  },
  {
    glyph: "🇪🇬",
    label: "flag: Egypt",
    labelPt: "bandeira: Egito",
    terms: "flag egypt bandeira egito eg",
    group: "flags",
  },
  {
    glyph: "🇪🇭",
    label: "flag: Western Sahara",
    labelPt: "bandeira: Saara Ocidental",
    terms: "flag western sahara bandeira saara ocidental eh",
    group: "flags",
  },
  {
    glyph: "🇪🇷",
    label: "flag: Eritrea",
    labelPt: "bandeira: Eritreia",
    terms: "flag eritrea bandeira eritreia er",
    group: "flags",
  },
  {
    glyph: "🇪🇸",
    label: "flag: Spain",
    labelPt: "bandeira: Espanha",
    terms: "flag spain bandeira espanha es",
    group: "flags",
  },
  {
    glyph: "🇪🇹",
    label: "flag: Ethiopia",
    labelPt: "bandeira: Etiópia",
    terms: "flag ethiopia bandeira etiopia et",
    group: "flags",
  },
  {
    glyph: "🇪🇺",
    label: "flag: European Union",
    labelPt: "bandeira: União Europeia",
    terms: "flag european union bandeira uniao europeia eu",
    group: "flags",
  },
  {
    glyph: "🇫🇮",
    label: "flag: Finland",
    labelPt: "bandeira: Finlândia",
    terms: "flag finland bandeira finlandia fi",
    group: "flags",
  },
  {
    glyph: "🇫🇯",
    label: "flag: Fiji",
    labelPt: "bandeira: Fiji",
    terms: "flag fiji bandeira fj",
    group: "flags",
  },
  {
    glyph: "🇫🇰",
    label: "flag: Falkland Islands",
    labelPt: "bandeira: Ilhas Malvinas",
    terms: "flag falkland islands bandeira ilhas malvinas fk",
    group: "flags",
  },
  {
    glyph: "🇫🇲",
    label: "flag: Micronesia",
    labelPt: "bandeira: Micronésia",
    terms: "flag micronesia bandeira fm",
    group: "flags",
  },
  {
    glyph: "🇫🇴",
    label: "flag: Faroe Islands",
    labelPt: "bandeira: Ilhas Faroé",
    terms: "flag faroe islands bandeira ilhas fo",
    group: "flags",
  },
  {
    glyph: "🇫🇷",
    label: "flag: France",
    labelPt: "bandeira: França",
    terms: "flag france bandeira franca fr",
    group: "flags",
  },
  {
    glyph: "🇬🇦",
    label: "flag: Gabon",
    labelPt: "bandeira: Gabão",
    terms: "flag gabon bandeira gabao ga",
    group: "flags",
  },
  {
    glyph: "🇬🇧",
    label: "flag: United Kingdom",
    labelPt: "bandeira: Reino Unido",
    terms: "flag united kingdom bandeira reino unido gb",
    group: "flags",
  },
  {
    glyph: "🇬🇩",
    label: "flag: Grenada",
    labelPt: "bandeira: Granada",
    terms: "flag grenada bandeira granada gd",
    group: "flags",
  },
  {
    glyph: "🇬🇪",
    label: "flag: Georgia",
    labelPt: "bandeira: Geórgia",
    terms: "flag georgia bandeira ge",
    group: "flags",
  },
  {
    glyph: "🇬🇫",
    label: "flag: French Guiana",
    labelPt: "bandeira: Guiana Francesa",
    terms: "flag french guiana bandeira francesa gf",
    group: "flags",
  },
  {
    glyph: "🇬🇬",
    label: "flag: Guernsey",
    labelPt: "bandeira: Guernsey",
    terms: "flag guernsey bandeira gg",
    group: "flags",
  },
  {
    glyph: "🇬🇭",
    label: "flag: Ghana",
    labelPt: "bandeira: Gana",
    terms: "flag ghana bandeira gana gh",
    group: "flags",
  },
  {
    glyph: "🇬🇮",
    label: "flag: Gibraltar",
    labelPt: "bandeira: Gibraltar",
    terms: "flag gibraltar bandeira gi",
    group: "flags",
  },
  {
    glyph: "🇬🇱",
    label: "flag: Greenland",
    labelPt: "bandeira: Groenlândia",
    terms: "flag greenland bandeira groenlandia gl",
    group: "flags",
  },
  {
    glyph: "🇬🇲",
    label: "flag: Gambia",
    labelPt: "bandeira: Gâmbia",
    terms: "flag gambia bandeira gm",
    group: "flags",
  },
  {
    glyph: "🇬🇳",
    label: "flag: Guinea",
    labelPt: "bandeira: Guiné",
    terms: "flag guinea bandeira guine gn",
    group: "flags",
  },
  {
    glyph: "🇬🇵",
    label: "flag: Guadeloupe",
    labelPt: "bandeira: Guadalupe",
    terms: "flag guadeloupe bandeira guadalupe gp",
    group: "flags",
  },
  {
    glyph: "🇬🇶",
    label: "flag: Equatorial Guinea",
    labelPt: "bandeira: Guiné Equatorial",
    terms: "flag equatorial guinea bandeira guine gq",
    group: "flags",
  },
  {
    glyph: "🇬🇷",
    label: "flag: Greece",
    labelPt: "bandeira: Grécia",
    terms: "flag greece bandeira grecia gr",
    group: "flags",
  },
  {
    glyph: "🇬🇸",
    label: "flag: South Georgia & South Sandwich Islands",
    labelPt: "bandeira: Ilhas Geórgia do Sul e Sandwich do Sul",
    terms: "flag south georgia sandwich islands bandeira ilhas do sul e gs",
    group: "flags",
  },
  {
    glyph: "🇬🇹",
    label: "flag: Guatemala",
    labelPt: "bandeira: Guatemala",
    terms: "flag guatemala bandeira gt",
    group: "flags",
  },
  {
    glyph: "🇬🇺",
    label: "flag: Guam",
    labelPt: "bandeira: Guam",
    terms: "flag guam bandeira gu",
    group: "flags",
  },
  {
    glyph: "🇬🇼",
    label: "flag: Guinea-Bissau",
    labelPt: "bandeira: Guiné-Bissau",
    terms: "flag guinea-bissau bandeira guine-bissau gw",
    group: "flags",
  },
  {
    glyph: "🇬🇾",
    label: "flag: Guyana",
    labelPt: "bandeira: Guiana",
    terms: "flag guyana bandeira guiana gy",
    group: "flags",
  },
  {
    glyph: "🇭🇰",
    label: "flag: Hong Kong SAR China",
    labelPt: "bandeira: Hong Kong, RAE da China",
    terms: "flag hong kong sar china bandeira rae da hk",
    group: "flags",
  },
  {
    glyph: "🇭🇲",
    label: "flag: Heard & McDonald Islands",
    labelPt: "bandeira: Ilhas Heard e McDonald",
    terms: "flag heard mcdonald islands bandeira ilhas e hm",
    group: "flags",
  },
  {
    glyph: "🇭🇳",
    label: "flag: Honduras",
    labelPt: "bandeira: Honduras",
    terms: "flag honduras bandeira hn",
    group: "flags",
  },
  {
    glyph: "🇭🇷",
    label: "flag: Croatia",
    labelPt: "bandeira: Croácia",
    terms: "flag croatia bandeira croacia hr",
    group: "flags",
  },
  {
    glyph: "🇭🇹",
    label: "flag: Haiti",
    labelPt: "bandeira: Haiti",
    terms: "flag haiti bandeira ht",
    group: "flags",
  },
  {
    glyph: "🇭🇺",
    label: "flag: Hungary",
    labelPt: "bandeira: Hungria",
    terms: "flag hungary bandeira hungria hu",
    group: "flags",
  },
  {
    glyph: "🇮🇨",
    label: "flag: Canary Islands",
    labelPt: "bandeira: Ilhas Canárias",
    terms: "flag canary islands bandeira ilhas canarias ic",
    group: "flags",
  },
  {
    glyph: "🇮🇩",
    label: "flag: Indonesia",
    labelPt: "bandeira: Indonésia",
    terms: "flag indonesia bandeira id",
    group: "flags",
  },
  {
    glyph: "🇮🇪",
    label: "flag: Ireland",
    labelPt: "bandeira: Irlanda",
    terms: "flag ireland bandeira irlanda ie",
    group: "flags",
  },
  {
    glyph: "🇮🇱",
    label: "flag: Israel",
    labelPt: "bandeira: Israel",
    terms: "flag israel bandeira il",
    group: "flags",
  },
  {
    glyph: "🇮🇲",
    label: "flag: Isle of Man",
    labelPt: "bandeira: Ilha de Man",
    terms: "flag isle of man bandeira ilha de im",
    group: "flags",
  },
  {
    glyph: "🇮🇳",
    label: "flag: India",
    labelPt: "bandeira: Índia",
    terms: "flag india bandeira in",
    group: "flags",
  },
  {
    glyph: "🇮🇴",
    label: "flag: British Indian Ocean Territory",
    labelPt: "bandeira: Território Britânico do Oceano Índico",
    terms:
      "flag british indian ocean territory bandeira territorio britanico do oceano indico io",
    group: "flags",
  },
  {
    glyph: "🇮🇶",
    label: "flag: Iraq",
    labelPt: "bandeira: Iraque",
    terms: "flag iraq bandeira iraque iq",
    group: "flags",
  },
  {
    glyph: "🇮🇷",
    label: "flag: Iran",
    labelPt: "bandeira: Irã",
    terms: "flag iran bandeira ira ir",
    group: "flags",
  },
  {
    glyph: "🇮🇸",
    label: "flag: Iceland",
    labelPt: "bandeira: Islândia",
    terms: "flag iceland bandeira islandia is",
    group: "flags",
  },
  {
    glyph: "🇮🇹",
    label: "flag: Italy",
    labelPt: "bandeira: Itália",
    terms: "flag italy bandeira italia it",
    group: "flags",
  },
  {
    glyph: "🇯🇪",
    label: "flag: Jersey",
    labelPt: "bandeira: Jersey",
    terms: "flag jersey bandeira je",
    group: "flags",
  },
  {
    glyph: "🇯🇲",
    label: "flag: Jamaica",
    labelPt: "bandeira: Jamaica",
    terms: "flag jamaica bandeira jm",
    group: "flags",
  },
  {
    glyph: "🇯🇴",
    label: "flag: Jordan",
    labelPt: "bandeira: Jordânia",
    terms: "flag jordan bandeira jordania jo",
    group: "flags",
  },
  {
    glyph: "🇯🇵",
    label: "flag: Japan",
    labelPt: "bandeira: Japão",
    terms: "flag japan bandeira japao jp",
    group: "flags",
  },
  {
    glyph: "🇰🇪",
    label: "flag: Kenya",
    labelPt: "bandeira: Quênia",
    terms: "flag kenya bandeira quenia ke",
    group: "flags",
  },
  {
    glyph: "🇰🇬",
    label: "flag: Kyrgyzstan",
    labelPt: "bandeira: Quirguistão",
    terms: "flag kyrgyzstan bandeira quirguistao kg",
    group: "flags",
  },
  {
    glyph: "🇰🇭",
    label: "flag: Cambodia",
    labelPt: "bandeira: Camboja",
    terms: "flag cambodia bandeira camboja kh",
    group: "flags",
  },
  {
    glyph: "🇰🇮",
    label: "flag: Kiribati",
    labelPt: "bandeira: Quiribati",
    terms: "flag kiribati bandeira quiribati ki",
    group: "flags",
  },
  {
    glyph: "🇰🇲",
    label: "flag: Comoros",
    labelPt: "bandeira: Comores",
    terms: "flag comoros bandeira comores km",
    group: "flags",
  },
  {
    glyph: "🇰🇳",
    label: "flag: St. Kitts & Nevis",
    labelPt: "bandeira: São Cristóvão e Névis",
    terms: "flag st kitts nevis bandeira sao cristovao e kn",
    group: "flags",
  },
  {
    glyph: "🇰🇵",
    label: "flag: North Korea",
    labelPt: "bandeira: Coreia do Norte",
    terms: "flag north korea bandeira coreia do norte kp",
    group: "flags",
  },
  {
    glyph: "🇰🇷",
    label: "flag: South Korea",
    labelPt: "bandeira: Coreia do Sul",
    terms: "flag south korea bandeira coreia do sul kr",
    group: "flags",
  },
  {
    glyph: "🇰🇼",
    label: "flag: Kuwait",
    labelPt: "bandeira: Kuwait",
    terms: "flag kuwait bandeira kw",
    group: "flags",
  },
  {
    glyph: "🇰🇾",
    label: "flag: Cayman Islands",
    labelPt: "bandeira: Ilhas Cayman",
    terms: "flag cayman islands bandeira ilhas ky",
    group: "flags",
  },
  {
    glyph: "🇰🇿",
    label: "flag: Kazakhstan",
    labelPt: "bandeira: Cazaquistão",
    terms: "flag kazakhstan bandeira cazaquistao kz",
    group: "flags",
  },
  {
    glyph: "🇱🇦",
    label: "flag: Laos",
    labelPt: "bandeira: Laos",
    terms: "flag laos bandeira la",
    group: "flags",
  },
  {
    glyph: "🇱🇧",
    label: "flag: Lebanon",
    labelPt: "bandeira: Líbano",
    terms: "flag lebanon bandeira libano lb",
    group: "flags",
  },
  {
    glyph: "🇱🇨",
    label: "flag: St. Lucia",
    labelPt: "bandeira: Santa Lúcia",
    terms: "flag st lucia bandeira santa lc",
    group: "flags",
  },
  {
    glyph: "🇱🇮",
    label: "flag: Liechtenstein",
    labelPt: "bandeira: Liechtenstein",
    terms: "flag liechtenstein bandeira li",
    group: "flags",
  },
  {
    glyph: "🇱🇰",
    label: "flag: Sri Lanka",
    labelPt: "bandeira: Sri Lanka",
    terms: "flag sri lanka bandeira lk",
    group: "flags",
  },
  {
    glyph: "🇱🇷",
    label: "flag: Liberia",
    labelPt: "bandeira: Libéria",
    terms: "flag liberia bandeira lr",
    group: "flags",
  },
  {
    glyph: "🇱🇸",
    label: "flag: Lesotho",
    labelPt: "bandeira: Lesoto",
    terms: "flag lesotho bandeira lesoto ls",
    group: "flags",
  },
  {
    glyph: "🇱🇹",
    label: "flag: Lithuania",
    labelPt: "bandeira: Lituânia",
    terms: "flag lithuania bandeira lituania lt",
    group: "flags",
  },
  {
    glyph: "🇱🇺",
    label: "flag: Luxembourg",
    labelPt: "bandeira: Luxemburgo",
    terms: "flag luxembourg bandeira luxemburgo lu",
    group: "flags",
  },
  {
    glyph: "🇱🇻",
    label: "flag: Latvia",
    labelPt: "bandeira: Letônia",
    terms: "flag latvia bandeira letonia lv",
    group: "flags",
  },
  {
    glyph: "🇱🇾",
    label: "flag: Libya",
    labelPt: "bandeira: Líbia",
    terms: "flag libya bandeira libia ly",
    group: "flags",
  },
  {
    glyph: "🇲🇦",
    label: "flag: Morocco",
    labelPt: "bandeira: Marrocos",
    terms: "flag morocco bandeira marrocos ma",
    group: "flags",
  },
  {
    glyph: "🇲🇨",
    label: "flag: Monaco",
    labelPt: "bandeira: Mônaco",
    terms: "flag monaco bandeira mc",
    group: "flags",
  },
  {
    glyph: "🇲🇩",
    label: "flag: Moldova",
    labelPt: "bandeira: Moldávia",
    terms: "flag moldova bandeira moldavia md",
    group: "flags",
  },
  {
    glyph: "🇲🇪",
    label: "flag: Montenegro",
    labelPt: "bandeira: Montenegro",
    terms: "flag montenegro bandeira me",
    group: "flags",
  },
  {
    glyph: "🇲🇫",
    label: "flag: St. Martin",
    labelPt: "bandeira: São Martinho",
    terms: "flag st martin bandeira sao martinho mf",
    group: "flags",
  },
  {
    glyph: "🇲🇬",
    label: "flag: Madagascar",
    labelPt: "bandeira: Madagascar",
    terms: "flag madagascar bandeira mg",
    group: "flags",
  },
  {
    glyph: "🇲🇭",
    label: "flag: Marshall Islands",
    labelPt: "bandeira: Ilhas Marshall",
    terms: "flag marshall islands bandeira ilhas mh",
    group: "flags",
  },
  {
    glyph: "🇲🇰",
    label: "flag: North Macedonia",
    labelPt: "bandeira: Macedônia do Norte",
    terms: "flag north macedonia bandeira do norte mk",
    group: "flags",
  },
  {
    glyph: "🇲🇱",
    label: "flag: Mali",
    labelPt: "bandeira: Mali",
    terms: "flag mali bandeira ml",
    group: "flags",
  },
  {
    glyph: "🇲🇲",
    label: "flag: Myanmar (Burma)",
    labelPt: "bandeira: Mianmar (Birmânia)",
    terms: "flag myanmar burma bandeira mianmar birmania mm",
    group: "flags",
  },
  {
    glyph: "🇲🇳",
    label: "flag: Mongolia",
    labelPt: "bandeira: Mongólia",
    terms: "flag mongolia bandeira mn",
    group: "flags",
  },
  {
    glyph: "🇲🇴",
    label: "flag: Macao SAR China",
    labelPt: "bandeira: Macau, RAE da China",
    terms: "flag macao sar china bandeira macau rae da mo",
    group: "flags",
  },
  {
    glyph: "🇲🇵",
    label: "flag: Northern Mariana Islands",
    labelPt: "bandeira: Ilhas Marianas do Norte",
    terms: "flag northern mariana islands bandeira ilhas marianas do norte mp",
    group: "flags",
  },
  {
    glyph: "🇲🇶",
    label: "flag: Martinique",
    labelPt: "bandeira: Martinica",
    terms: "flag martinique bandeira martinica mq",
    group: "flags",
  },
  {
    glyph: "🇲🇷",
    label: "flag: Mauritania",
    labelPt: "bandeira: Mauritânia",
    terms: "flag mauritania bandeira mr",
    group: "flags",
  },
  {
    glyph: "🇲🇸",
    label: "flag: Montserrat",
    labelPt: "bandeira: Montserrat",
    terms: "flag montserrat bandeira ms",
    group: "flags",
  },
  {
    glyph: "🇲🇹",
    label: "flag: Malta",
    labelPt: "bandeira: Malta",
    terms: "flag malta bandeira mt",
    group: "flags",
  },
  {
    glyph: "🇲🇺",
    label: "flag: Mauritius",
    labelPt: "bandeira: Maurício",
    terms: "flag mauritius bandeira mauricio mu",
    group: "flags",
  },
  {
    glyph: "🇲🇻",
    label: "flag: Maldives",
    labelPt: "bandeira: Maldivas",
    terms: "flag maldives bandeira maldivas mv",
    group: "flags",
  },
  {
    glyph: "🇲🇼",
    label: "flag: Malawi",
    labelPt: "bandeira: Malaui",
    terms: "flag malawi bandeira malaui mw",
    group: "flags",
  },
  {
    glyph: "🇲🇽",
    label: "flag: Mexico",
    labelPt: "bandeira: México",
    terms: "flag mexico bandeira mx",
    group: "flags",
  },
  {
    glyph: "🇲🇾",
    label: "flag: Malaysia",
    labelPt: "bandeira: Malásia",
    terms: "flag malaysia bandeira malasia my",
    group: "flags",
  },
  {
    glyph: "🇲🇿",
    label: "flag: Mozambique",
    labelPt: "bandeira: Moçambique",
    terms: "flag mozambique bandeira mocambique mz",
    group: "flags",
  },
  {
    glyph: "🇳🇦",
    label: "flag: Namibia",
    labelPt: "bandeira: Namíbia",
    terms: "flag namibia bandeira na",
    group: "flags",
  },
  {
    glyph: "🇳🇨",
    label: "flag: New Caledonia",
    labelPt: "bandeira: Nova Caledônia",
    terms: "flag new caledonia bandeira nova nc",
    group: "flags",
  },
  {
    glyph: "🇳🇪",
    label: "flag: Niger",
    labelPt: "bandeira: Níger",
    terms: "flag niger bandeira ne",
    group: "flags",
  },
  {
    glyph: "🇳🇫",
    label: "flag: Norfolk Island",
    labelPt: "bandeira: Ilha Norfolk",
    terms: "flag norfolk island bandeira ilha nf",
    group: "flags",
  },
  {
    glyph: "🇳🇬",
    label: "flag: Nigeria",
    labelPt: "bandeira: Nigéria",
    terms: "flag nigeria bandeira ng",
    group: "flags",
  },
  {
    glyph: "🇳🇮",
    label: "flag: Nicaragua",
    labelPt: "bandeira: Nicarágua",
    terms: "flag nicaragua bandeira ni",
    group: "flags",
  },
  {
    glyph: "🇳🇱",
    label: "flag: Netherlands",
    labelPt: "bandeira: Países Baixos",
    terms: "flag netherlands bandeira paises baixos nl",
    group: "flags",
  },
  {
    glyph: "🇳🇴",
    label: "flag: Norway",
    labelPt: "bandeira: Noruega",
    terms: "flag norway bandeira noruega no",
    group: "flags",
  },
  {
    glyph: "🇳🇵",
    label: "flag: Nepal",
    labelPt: "bandeira: Nepal",
    terms: "flag nepal bandeira np",
    group: "flags",
  },
  {
    glyph: "🇳🇷",
    label: "flag: Nauru",
    labelPt: "bandeira: Nauru",
    terms: "flag nauru bandeira nr",
    group: "flags",
  },
  {
    glyph: "🇳🇺",
    label: "flag: Niue",
    labelPt: "bandeira: Niue",
    terms: "flag niue bandeira nu",
    group: "flags",
  },
  {
    glyph: "🇳🇿",
    label: "flag: New Zealand",
    labelPt: "bandeira: Nova Zelândia",
    terms: "flag new zealand bandeira nova zelandia nz",
    group: "flags",
  },
  {
    glyph: "🇴🇲",
    label: "flag: Oman",
    labelPt: "bandeira: Omã",
    terms: "flag oman bandeira oma om",
    group: "flags",
  },
  {
    glyph: "🇵🇦",
    label: "flag: Panama",
    labelPt: "bandeira: Panamá",
    terms: "flag panama bandeira pa",
    group: "flags",
  },
  {
    glyph: "🇵🇪",
    label: "flag: Peru",
    labelPt: "bandeira: Peru",
    terms: "flag peru bandeira pe",
    group: "flags",
  },
  {
    glyph: "🇵🇫",
    label: "flag: French Polynesia",
    labelPt: "bandeira: Polinésia Francesa",
    terms: "flag french polynesia bandeira polinesia francesa pf",
    group: "flags",
  },
  {
    glyph: "🇵🇬",
    label: "flag: Papua New Guinea",
    labelPt: "bandeira: Papua-Nova Guiné",
    terms: "flag papua new guinea bandeira papua-nova guine pg",
    group: "flags",
  },
  {
    glyph: "🇵🇭",
    label: "flag: Philippines",
    labelPt: "bandeira: Filipinas",
    terms: "flag philippines bandeira filipinas ph",
    group: "flags",
  },
  {
    glyph: "🇵🇰",
    label: "flag: Pakistan",
    labelPt: "bandeira: Paquistão",
    terms: "flag pakistan bandeira paquistao pk",
    group: "flags",
  },
  {
    glyph: "🇵🇱",
    label: "flag: Poland",
    labelPt: "bandeira: Polônia",
    terms: "flag poland bandeira polonia pl",
    group: "flags",
  },
  {
    glyph: "🇵🇲",
    label: "flag: St. Pierre & Miquelon",
    labelPt: "bandeira: São Pedro e Miquelão",
    terms: "flag st pierre miquelon bandeira sao pedro e miquelao pm",
    group: "flags",
  },
  {
    glyph: "🇵🇳",
    label: "flag: Pitcairn Islands",
    labelPt: "bandeira: Ilhas Pitcairn",
    terms: "flag pitcairn islands bandeira ilhas pn",
    group: "flags",
  },
  {
    glyph: "🇵🇷",
    label: "flag: Puerto Rico",
    labelPt: "bandeira: Porto Rico",
    terms: "flag puerto rico bandeira porto pr",
    group: "flags",
  },
  {
    glyph: "🇵🇸",
    label: "flag: Palestinian Territories",
    labelPt: "bandeira: Territórios palestinos",
    terms: "flag palestinian territories bandeira territorios palestinos ps",
    group: "flags",
  },
  {
    glyph: "🇵🇹",
    label: "flag: Portugal",
    labelPt: "bandeira: Portugal",
    terms: "flag portugal bandeira pt",
    group: "flags",
  },
  {
    glyph: "🇵🇼",
    label: "flag: Palau",
    labelPt: "bandeira: Palau",
    terms: "flag palau bandeira pw",
    group: "flags",
  },
  {
    glyph: "🇵🇾",
    label: "flag: Paraguay",
    labelPt: "bandeira: Paraguai",
    terms: "flag paraguay bandeira paraguai py",
    group: "flags",
  },
  {
    glyph: "🇶🇦",
    label: "flag: Qatar",
    labelPt: "bandeira: Catar",
    terms: "flag qatar bandeira catar qa",
    group: "flags",
  },
  {
    glyph: "🇷🇪",
    label: "flag: Réunion",
    labelPt: "bandeira: Reunião",
    terms: "flag reunion bandeira reuniao re",
    group: "flags",
  },
  {
    glyph: "🇷🇴",
    label: "flag: Romania",
    labelPt: "bandeira: Romênia",
    terms: "flag romania bandeira romenia ro",
    group: "flags",
  },
  {
    glyph: "🇷🇸",
    label: "flag: Serbia",
    labelPt: "bandeira: Sérvia",
    terms: "flag serbia bandeira servia rs",
    group: "flags",
  },
  {
    glyph: "🇷🇺",
    label: "flag: Russia",
    labelPt: "bandeira: Rússia",
    terms: "flag russia bandeira ru",
    group: "flags",
  },
  {
    glyph: "🇷🇼",
    label: "flag: Rwanda",
    labelPt: "bandeira: Ruanda",
    terms: "flag rwanda bandeira ruanda rw",
    group: "flags",
  },
  {
    glyph: "🇸🇦",
    label: "flag: Saudi Arabia",
    labelPt: "bandeira: Arábia Saudita",
    terms: "flag saudi arabia bandeira saudita sa",
    group: "flags",
  },
  {
    glyph: "🇸🇧",
    label: "flag: Solomon Islands",
    labelPt: "bandeira: Ilhas Salomão",
    terms: "flag solomon islands bandeira ilhas salomao sb",
    group: "flags",
  },
  {
    glyph: "🇸🇨",
    label: "flag: Seychelles",
    labelPt: "bandeira: Seicheles",
    terms: "flag seychelles bandeira seicheles sc",
    group: "flags",
  },
  {
    glyph: "🇸🇩",
    label: "flag: Sudan",
    labelPt: "bandeira: Sudão",
    terms: "flag sudan bandeira sudao sd",
    group: "flags",
  },
  {
    glyph: "🇸🇪",
    label: "flag: Sweden",
    labelPt: "bandeira: Suécia",
    terms: "flag sweden bandeira suecia se",
    group: "flags",
  },
  {
    glyph: "🇸🇬",
    label: "flag: Singapore",
    labelPt: "bandeira: Singapura",
    terms: "flag singapore bandeira singapura sg",
    group: "flags",
  },
  {
    glyph: "🇸🇭",
    label: "flag: St. Helena",
    labelPt: "bandeira: Santa Helena",
    terms: "flag st helena bandeira santa sh",
    group: "flags",
  },
  {
    glyph: "🇸🇮",
    label: "flag: Slovenia",
    labelPt: "bandeira: Eslovênia",
    terms: "flag slovenia bandeira eslovenia si",
    group: "flags",
  },
  {
    glyph: "🇸🇯",
    label: "flag: Svalbard & Jan Mayen",
    labelPt: "bandeira: Svalbard e Jan Mayen",
    terms: "flag svalbard jan mayen bandeira e sj",
    group: "flags",
  },
  {
    glyph: "🇸🇰",
    label: "flag: Slovakia",
    labelPt: "bandeira: Eslováquia",
    terms: "flag slovakia bandeira eslovaquia sk",
    group: "flags",
  },
  {
    glyph: "🇸🇱",
    label: "flag: Sierra Leone",
    labelPt: "bandeira: Serra Leoa",
    terms: "flag sierra leone bandeira serra leoa sl",
    group: "flags",
  },
  {
    glyph: "🇸🇲",
    label: "flag: San Marino",
    labelPt: "bandeira: San Marino",
    terms: "flag san marino bandeira sm",
    group: "flags",
  },
  {
    glyph: "🇸🇳",
    label: "flag: Senegal",
    labelPt: "bandeira: Senegal",
    terms: "flag senegal bandeira sn",
    group: "flags",
  },
  {
    glyph: "🇸🇴",
    label: "flag: Somalia",
    labelPt: "bandeira: Somália",
    terms: "flag somalia bandeira so",
    group: "flags",
  },
  {
    glyph: "🇸🇷",
    label: "flag: Suriname",
    labelPt: "bandeira: Suriname",
    terms: "flag suriname bandeira sr",
    group: "flags",
  },
  {
    glyph: "🇸🇸",
    label: "flag: South Sudan",
    labelPt: "bandeira: Sudão do Sul",
    terms: "flag south sudan bandeira sudao do sul ss",
    group: "flags",
  },
  {
    glyph: "🇸🇹",
    label: "flag: São Tomé & Príncipe",
    labelPt: "bandeira: São Tomé e Príncipe",
    terms: "flag sao tome principe bandeira e st",
    group: "flags",
  },
  {
    glyph: "🇸🇻",
    label: "flag: El Salvador",
    labelPt: "bandeira: El Salvador",
    terms: "flag el salvador bandeira sv",
    group: "flags",
  },
  {
    glyph: "🇸🇽",
    label: "flag: Sint Maarten",
    labelPt: "bandeira: Sint Maarten",
    terms: "flag sint maarten bandeira sx",
    group: "flags",
  },
  {
    glyph: "🇸🇾",
    label: "flag: Syria",
    labelPt: "bandeira: Síria",
    terms: "flag syria bandeira siria sy",
    group: "flags",
  },
  {
    glyph: "🇸🇿",
    label: "flag: Eswatini",
    labelPt: "bandeira: Essuatíni",
    terms: "flag eswatini bandeira essuatini sz",
    group: "flags",
  },
  {
    glyph: "🇹🇦",
    label: "flag: Tristan da Cunha",
    labelPt: "bandeira: Tristão da Cunha",
    terms: "flag tristan da cunha bandeira tristao ta",
    group: "flags",
  },
  {
    glyph: "🇹🇨",
    label: "flag: Turks & Caicos Islands",
    labelPt: "bandeira: Ilhas Turcas e Caicos",
    terms: "flag turks caicos islands bandeira ilhas turcas e tc",
    group: "flags",
  },
  {
    glyph: "🇹🇩",
    label: "flag: Chad",
    labelPt: "bandeira: Chade",
    terms: "flag chad bandeira chade td",
    group: "flags",
  },
  {
    glyph: "🇹🇫",
    label: "flag: French Southern Territories",
    labelPt: "bandeira: Territórios Franceses do Sul",
    terms:
      "flag french southern territories bandeira territorios franceses do sul tf",
    group: "flags",
  },
  {
    glyph: "🇹🇬",
    label: "flag: Togo",
    labelPt: "bandeira: Togo",
    terms: "flag togo bandeira tg",
    group: "flags",
  },
  {
    glyph: "🇹🇭",
    label: "flag: Thailand",
    labelPt: "bandeira: Tailândia",
    terms: "flag thailand bandeira tailandia th",
    group: "flags",
  },
  {
    glyph: "🇹🇯",
    label: "flag: Tajikistan",
    labelPt: "bandeira: Tadjiquistão",
    terms: "flag tajikistan bandeira tadjiquistao tj",
    group: "flags",
  },
  {
    glyph: "🇹🇰",
    label: "flag: Tokelau",
    labelPt: "bandeira: Tokelau",
    terms: "flag tokelau bandeira tk",
    group: "flags",
  },
  {
    glyph: "🇹🇱",
    label: "flag: Timor-Leste",
    labelPt: "bandeira: Timor-Leste",
    terms: "flag timor-leste bandeira tl",
    group: "flags",
  },
  {
    glyph: "🇹🇲",
    label: "flag: Turkmenistan",
    labelPt: "bandeira: Turcomenistão",
    terms: "flag turkmenistan bandeira turcomenistao tm",
    group: "flags",
  },
  {
    glyph: "🇹🇳",
    label: "flag: Tunisia",
    labelPt: "bandeira: Tunísia",
    terms: "flag tunisia bandeira tn",
    group: "flags",
  },
  {
    glyph: "🇹🇴",
    label: "flag: Tonga",
    labelPt: "bandeira: Tonga",
    terms: "flag tonga bandeira to",
    group: "flags",
  },
  {
    glyph: "🇹🇷",
    label: "flag: Türkiye",
    labelPt: "bandeira: Turquia",
    terms: "flag turkiye bandeira turquia tr",
    group: "flags",
  },
  {
    glyph: "🇹🇹",
    label: "flag: Trinidad & Tobago",
    labelPt: "bandeira: Trinidad e Tobago",
    terms: "flag trinidad tobago bandeira e tt",
    group: "flags",
  },
  {
    glyph: "🇹🇻",
    label: "flag: Tuvalu",
    labelPt: "bandeira: Tuvalu",
    terms: "flag tuvalu bandeira tv",
    group: "flags",
  },
  {
    glyph: "🇹🇼",
    label: "flag: Taiwan",
    labelPt: "bandeira: Taiwan",
    terms: "flag taiwan bandeira tw",
    group: "flags",
  },
  {
    glyph: "🇹🇿",
    label: "flag: Tanzania",
    labelPt: "bandeira: Tanzânia",
    terms: "flag tanzania bandeira tz",
    group: "flags",
  },
  {
    glyph: "🇺🇦",
    label: "flag: Ukraine",
    labelPt: "bandeira: Ucrânia",
    terms: "flag ukraine bandeira ucrania ua",
    group: "flags",
  },
  {
    glyph: "🇺🇬",
    label: "flag: Uganda",
    labelPt: "bandeira: Uganda",
    terms: "flag uganda bandeira ug",
    group: "flags",
  },
  {
    glyph: "🇺🇲",
    label: "flag: U.S. Outlying Islands",
    labelPt: "bandeira: Ilhas Menores Distantes dos EUA",
    terms:
      "flag u s outlying islands bandeira ilhas menores distantes dos eua um",
    group: "flags",
  },
  {
    glyph: "🇺🇳",
    label: "flag: United Nations",
    labelPt: "bandeira: Nações Unidas",
    terms: "flag united nations bandeira nacoes unidas un",
    group: "flags",
  },
  {
    glyph: "🇺🇸",
    label: "flag: United States",
    labelPt: "bandeira: Estados Unidos",
    terms: "flag united states bandeira estados unidos us",
    group: "flags",
  },
  {
    glyph: "🇺🇾",
    label: "flag: Uruguay",
    labelPt: "bandeira: Uruguai",
    terms: "flag uruguay bandeira uruguai uy",
    group: "flags",
  },
  {
    glyph: "🇺🇿",
    label: "flag: Uzbekistan",
    labelPt: "bandeira: Uzbequistão",
    terms: "flag uzbekistan bandeira uzbequistao uz",
    group: "flags",
  },
  {
    glyph: "🇻🇦",
    label: "flag: Vatican City",
    labelPt: "bandeira: Cidade do Vaticano",
    terms: "flag vatican city bandeira cidade do vaticano va",
    group: "flags",
  },
  {
    glyph: "🇻🇨",
    label: "flag: St. Vincent & Grenadines",
    labelPt: "bandeira: São Vicente e Granadinas",
    terms: "flag st vincent grenadines bandeira sao vicente e granadinas vc",
    group: "flags",
  },
  {
    glyph: "🇻🇪",
    label: "flag: Venezuela",
    labelPt: "bandeira: Venezuela",
    terms: "flag venezuela bandeira ve",
    group: "flags",
  },
  {
    glyph: "🇻🇬",
    label: "flag: British Virgin Islands",
    labelPt: "bandeira: Ilhas Virgens Britânicas",
    terms: "flag british virgin islands bandeira ilhas virgens britanicas vg",
    group: "flags",
  },
  {
    glyph: "🇻🇮",
    label: "flag: U.S. Virgin Islands",
    labelPt: "bandeira: Ilhas Virgens Americanas",
    terms: "flag u s virgin islands bandeira ilhas virgens americanas vi",
    group: "flags",
  },
  {
    glyph: "🇻🇳",
    label: "flag: Vietnam",
    labelPt: "bandeira: Vietnã",
    terms: "flag vietnam bandeira vietna vn",
    group: "flags",
  },
  {
    glyph: "🇻🇺",
    label: "flag: Vanuatu",
    labelPt: "bandeira: Vanuatu",
    terms: "flag vanuatu bandeira vu",
    group: "flags",
  },
  {
    glyph: "🇼🇫",
    label: "flag: Wallis & Futuna",
    labelPt: "bandeira: Wallis e Futuna",
    terms: "flag wallis futuna bandeira e wf",
    group: "flags",
  },
  {
    glyph: "🇼🇸",
    label: "flag: Samoa",
    labelPt: "bandeira: Samoa",
    terms: "flag samoa bandeira ws",
    group: "flags",
  },
  {
    glyph: "🇽🇰",
    label: "flag: Kosovo",
    labelPt: "bandeira: Kosovo",
    terms: "flag kosovo bandeira xk",
    group: "flags",
  },
  {
    glyph: "🇾🇪",
    label: "flag: Yemen",
    labelPt: "bandeira: Iêmen",
    terms: "flag yemen bandeira iemen ye",
    group: "flags",
  },
  {
    glyph: "🇾🇹",
    label: "flag: Mayotte",
    labelPt: "bandeira: Mayotte",
    terms: "flag mayotte bandeira yt",
    group: "flags",
  },
  {
    glyph: "🇿🇦",
    label: "flag: South Africa",
    labelPt: "bandeira: África do Sul",
    terms: "flag south africa bandeira do sul za",
    group: "flags",
  },
  {
    glyph: "🇿🇲",
    label: "flag: Zambia",
    labelPt: "bandeira: Zâmbia",
    terms: "flag zambia bandeira zm",
    group: "flags",
  },
  {
    glyph: "🇿🇼",
    label: "flag: Zimbabwe",
    labelPt: "bandeira: Zimbábue",
    terms: "flag zimbabwe bandeira zimbabue zw",
    group: "flags",
  },
  {
    glyph: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    label: "flag: England",
    labelPt: "bandeira: Inglaterra",
    terms: "flag england bandeira inglaterra gbeng",
    group: "flags",
  },
  {
    glyph: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    label: "flag: Scotland",
    labelPt: "bandeira: Escócia",
    terms: "flag scotland bandeira escocia gbsct",
    group: "flags",
  },
  {
    glyph: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    label: "flag: Wales",
    labelPt: "bandeira: País de Gales",
    terms: "flag wales bandeira pais de gales gbwls",
    group: "flags",
  },
];

/** Every picker-eligible emoji, in Unicode order within each group. */
export const EMOJI_DATA: EmojiEntry[] = [
  ...EMOJI_BLOCK_0,
  ...EMOJI_BLOCK_1,
  ...EMOJI_BLOCK_2,
  ...EMOJI_BLOCK_3,
  ...EMOJI_BLOCK_4,
];
