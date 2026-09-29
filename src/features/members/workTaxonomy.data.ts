/**
 * The work taxonomy: every field id (stored as a member's `discipline`) and
 * the profession ids under it, plus the job-board view of the same fields.
 *
 * This file mirrors `queerpulse-backend/src/profiles/professions.ts`, which is
 * the authority. `node scripts/check-work-taxonomy.mjs` fails on any drift
 * between the two: field ids, their order, and each field's profession ids in
 * order. The module stays import-free so that script can transpile and load it
 * alone.
 *
 * Ids are camelCase and stable. Labels live in the catalogs only, under
 * `members:directory.discipline.<id>` and `members:directory.profession.<id>`.
 * `memberDirectoryFilter.data.ts` derives its option lists from these arrays.
 */

/** Every field id with its profession ids, in display order. */
export const PROFESSION_IDS_BY_FIELD: Record<string, readonly string[]> = {
  design: [
    "graphicDesigner",
    "uxDesigner",
    "illustrator",
    "artDirector",
    "productDesigner",
    "webDesigner",
    "motionDesigner",
    "animator",
    "comicArtist",
    "uxResearcher",
    "industrialDesigner",
  ],
  fashion: [
    "fashionDesigner",
    "stylist",
    "model",
    "costumeDesigner",
    "tailor",
    "patternCutter",
    "fashionBuyer",
    "vintageReseller",
    "shoemaker",
  ],
  editorial: [
    "editor",
    "journalist",
    "copywriter",
    "poet",
    "podcaster",
    "author",
    "contentCreator",
    "zinester",
    "publisher",
  ],
  languages: [
    "translator",
    "interpreter",
    "signLanguageInterpreter",
    "subtitler",
    "localisationSpecialist",
  ],
  marketing: [
    "marketingManager",
    "brandStrategist",
    "socialMediaManager",
    "contentStrategist",
    "prCommunications",
    "growthMarketer",
    "communityManager",
    "mediaPlanner",
    "marketResearcher",
  ],
  tech: [
    "softwareEngineer",
    "backendEngineer",
    "dataScientist",
    "productManager",
    "frontendEngineer",
    "fullStackEngineer",
    "mobileEngineer",
    "devOpsEngineer",
    "qaEngineer",
    "securityEngineer",
    "dataAnalyst",
    "machineLearningEngineer",
    "itSupport",
    "technicalWriter",
    "engineeringManager",
    "dataEngineer",
    "sysAdmin",
    "databaseAdministrator",
    "erpConsultant",
    "gameDeveloper",
    "hardwareTechnician",
  ],
  engineering: [
    "civilEngineer",
    "mechanicalEngineer",
    "electricalEngineer",
    "environmentalEngineer",
    "aerospaceEngineer",
    "biomedicalEngineer",
    "industrialEngineer",
    "chemicalEngineer",
    "telecomsEngineer",
    "energyEngineer",
    "qualityEngineer",
    "engineeringTechnician",
  ],
  science: [
    "biologist",
    "ecologist",
    "labResearcher",
    "chemist",
    "physicist",
    "environmentalScientist",
    "mathematician",
    "researcher",
    "statistician",
    "geologist",
    "marineScientist",
    "socialScientist",
    "economist",
    "labTechnician",
    "clinicalResearchAssociate",
  ],
  architecture: [
    "architect",
    "urbanDesigner",
    "interiorArchitect",
    "landscapeArchitect",
    "landSurveyor",
    "draughtsperson",
    "quantitySurveyor",
    "interiorDesigner",
  ],
  healthcare: [
    "therapist",
    "psychologist",
    "nurse",
    "gp",
    "physiotherapist",
    "peerCounsellor",
    "communityHealthWorker",
    "psychiatrist",
    "hospitalDoctor",
    "pharmacist",
    "midwife",
    "doula",
    "dentist",
    "occupationalTherapist",
    "speechTherapist",
    "nutritionist",
    "sexTherapist",
    "sexualHealthWorker",
    "harmReductionWorker",
    "paramedic",
    "healthcareAssistant",
    "radiographer",
    "clinicalLabTechnician",
    "pharmacyTechnician",
    "dentalHygienist",
    "optometrist",
    "audiologist",
    "osteopath",
    "acupuncturist",
  ],
  care: [
    "homeCareWorker",
    "childcareWorker",
    "disabilitySupportWorker",
    "funeralDirector",
    "careHomeAssistant",
    "nanny",
  ],
  education: [
    "teacher",
    "workshopFacilitator",
    "tutor",
    "lecturer",
    "sexEducator",
    "languageTeacher",
    "earlyYearsEducator",
    "specialNeedsTeacher",
    "vocationalTrainer",
    "teachingAssistant",
    "schoolLeader",
    "careersAdviser",
  ],
  legal: [
    "immigrationLawyer",
    "familyLawyer",
    "paralegal",
    "legalAdvocate",
    "humanRightsLawyer",
    "employmentLawyer",
    "criminalLawyer",
    "notary",
    "mediator",
    "solicitor",
    "judge",
    "corporateLawyer",
    "complianceOfficer",
    "legalSecretary",
  ],
  finance: [
    "accountant",
    "bookkeeper",
    "financialAnalyst",
    "financialAdviser",
    "taxAdviser",
    "auditor",
    "bankClerk",
    "bankRelationshipManager",
    "creditAnalyst",
    "insuranceAgent",
    "claimsHandler",
    "actuary",
    "financialController",
  ],
  people: [
    "hrGeneralist",
    "recruiter",
    "hrBusinessPartner",
    "learningDevelopment",
    "deiLead",
    "payrollBenefits",
    "hrAdministrator",
  ],
  operations: [
    "operationsManager",
    "projectManager",
    "programmeCoordinator",
    "officeManager",
    "executiveAssistant",
    "receptionist",
    "adminAssistant",
    "dataEntryClerk",
    "procurementSpecialist",
    "qualityManager",
    "healthSafetyOfficer",
  ],
  management: [
    "consultant",
    "managingDirector",
    "businessAnalyst",
    "strategyLead",
  ],
  sales: [
    "accountExecutive",
    "businessDevelopment",
    "salesRepresentative",
    "salesManager",
    "keyAccountManager",
    "medicalRep",
  ],
  customerService: [
    "customerSupport",
    "customerSuccessManager",
    "callCentreAgent",
    "contactCentreTeamLead",
    "technicalSupportAgent",
  ],
  realEstate: [
    "estateAgent",
    "propertyManager",
    "propertyValuer",
    "condominiumManager",
  ],
  retail: [
    "shopAssistant",
    "florist",
    "bookseller",
    "storeManager",
    "visualMerchandiser",
    "cashier",
    "marketTrader",
    "ecommerceManager",
  ],
  food: [
    "chef",
    "barista",
    "baker",
    "supperClubHost",
    "bartender",
    "waiter",
    "cook",
    "sommelier",
    "brewer",
    "caterer",
    "restaurantManager",
    "kitchenAssistant",
    "pastryChef",
    "butcher",
    "counterAssistant",
  ],
  hospitality: [
    "hotelManager",
    "frontDeskAgent",
    "housekeeper",
    "tourGuide",
    "travelAgent",
    "guesthouseHost",
    "concierge",
    "reservationsAgent",
    "tourismAnimator",
  ],
  nightlife: [
    "promoter",
    "eventProducer",
    "eventPlanner",
    "venueManager",
    "doorHost",
    "stageTechnician",
    "celebrant",
    "eventOperations",
    "eventStaff",
  ],
  photo: [
    "portraitPhotographer",
    "photojournalist",
    "retoucher",
    "eventPhotographer",
    "fashionPhotographer",
  ],
  film: [
    "documentaryFilmmaker",
    "filmmaker",
    "cinematographer",
    "filmEditor",
    "screenwriter",
    "filmProducer",
    "videographer",
    "radioPresenter",
    "cameraOperator",
  ],
  performance: [
    "choreographer",
    "dancer",
    "theatreMaker",
    "performanceArtist",
    "voiceActor",
    "actor",
    "dragPerformer",
    "comedian",
    "burlesquePerformer",
    "circusArtist",
    "hostEmcee",
    "voguer",
    "poleDancer",
    "spokenWordArtist",
    "danceTeacher",
    "stageManager",
  ],
  music: [
    "musicProducer",
    "dj",
    "sessionMusician",
    "soundDesigner",
    "musicIndustryAR",
    "singer",
    "songwriter",
    "composer",
    "musicTeacher",
    "soundEngineer",
  ],
  curation: [
    "curator",
    "archivist",
    "galleryDirector",
    "librarian",
    "historian",
    "conservator",
    "artCritic",
    "exhibitionDesigner",
    "museumEducator",
    "archaeologist",
    "culturalProgrammer",
  ],
  craft: [
    "ceramicist",
    "woodworker",
    "textileArtist",
    "jeweller",
    "printmaker",
    "leatherworker",
    "visualArtist",
    "tilePainter",
    "furnitureRestorer",
    "bookbinder",
    "luthier",
  ],
  beauty: [
    "barber",
    "hairdresser",
    "makeupArtist",
    "nailTechnician",
    "beautician",
    "tattooArtist",
    "piercer",
    "wigMaker",
    "lashBrowTechnician",
  ],
  wellness: [
    "personalTrainer",
    "yogaTeacher",
    "massageTherapist",
    "lifeCoach",
    "pilatesInstructor",
    "meditationTeacher",
    "astrologer",
  ],
  sport: [
    "athlete",
    "sportsCoach",
    "referee",
    "surfInstructor",
    "climbingInstructor",
    "swimmingInstructor",
  ],
  animals: [
    "vet",
    "vetNurse",
    "dogWalker",
    "petGroomer",
    "dogTrainer",
    "animalShelterWorker",
  ],
  trades: [
    "electrician",
    "plumber",
    "carpenter",
    "mechanic",
    "painterDecorator",
    "constructionWorker",
    "gardener",
    "welder",
    "tiler",
    "handyperson",
    "mason",
    "metalworker",
    "hvacTechnician",
    "maintenanceTechnician",
    "siteManager",
    "telecomsInstaller",
    "solarInstaller",
  ],
  manufacturing: [
    "productionOperator",
    "cncOperator",
    "assembler",
    "productionSupervisor",
    "productionManager",
    "qualityInspector",
    "sewingMachinist",
    "foodProductionOperator",
    "plantOperator",
    "mouldMaker",
  ],
  transport: [
    "driver",
    "deliveryRider",
    "warehouseWorker",
    "pilot",
    "flightAttendant",
    "logisticsCoordinator",
    "truckDriver",
    "busDriver",
    "trainDriver",
    "forkliftOperator",
    "postalWorker",
    "stockController",
    "supplyChainManager",
    "freightForwarder",
    "seafarer",
    "drivingInstructor",
  ],
  farming: [
    "farmer",
    "winemaker",
    "permacultureDesigner",
    "beekeeper",
    "fisher",
    "forestryWorker",
    "agronomist",
    "farmWorker",
  ],
  facilities: [
    "cleaner",
    "domesticWorker",
    "laundryWorker",
    "buildingCaretaker",
    "facilitiesManager",
    "wasteWorker",
  ],
  security: [
    "securityGuard",
    "firefighter",
    "policeOfficer",
    "militaryPersonnel",
    "prisonOfficer",
    "lifeguard",
    "emergencyDispatcher",
  ],
  community: [
    "communityOrganiser",
    "housingOrganiser",
    "housingAdvocate",
    "supportCoordinator",
    "accessibilityAdvocate",
    "activist",
    "communityCentreCoordinator",
    "socialWorker",
    "youthWorker",
    "nonprofitDirector",
    "ngoProgrammeLead",
    "volunteerCoordinator",
    "fundraiser",
    "socioculturalAnimator",
    "interculturalMediator",
    "socialCareTechnician",
  ],
  publicSector: [
    "policyAdvisor",
    "civilServant",
    "electedOfficial",
    "diplomat",
    "taxCustomsOfficer",
    "publicInspector",
  ],
  faith: ["clergy", "chaplain", "pastoralWorker"],
  ownBusiness: ["founder", "smallBusinessOwner", "freelancer", "coopMember"],
  games: [
    "gameMaster",
    "ttrpgWriter",
    "gameDesigner",
    "boardGameReviewer",
    "gameNightHost",
    "larpOrganiser",
    "miniaturePainter",
    "cosplayer",
    "streamer",
    "tournamentOrganiser",
    "actualPlayPerformer",
    "fantasyCartographer",
    "diceMaker",
    "propMaker",
    "puzzleDesigner",
    "speedrunner",
    "modder",
    "fanficWriter",
    "gameCritic",
  ],
  adultWork: [
    "sexWorker",
    "adultContentCreator",
    "camPerformer",
    "exoticDancer",
    "professionalDominant",
    "adultFilmPerformer",
  ],
  lifeStage: [
    "student",
    "apprentice",
    "betweenJobs",
    "fullTimeCarer",
    "retired",
  ],
};

/** Fields a member can pick for their own profile that no list, filter, count
 *  or job surface ever shows (coordinator ruling 15). */
export const UNLISTED_FIELD_IDS: readonly string[] = ["adultWork"];

/** Fields that describe a member's situation (own business, fandom, life
 *  stage) and so stay on profiles and off job categories and job filters. */
export const PROFILE_ONLY_FIELD_IDS: readonly string[] = [
  "ownBusiness",
  "games",
  "lifeStage",
];

/** The fields a job can be filed under: every listed field minus the
 *  profile-only ones, in `PROFESSION_IDS_BY_FIELD` order. */
export const JOB_FIELD_IDS: readonly string[] = Object.keys(
  PROFESSION_IDS_BY_FIELD,
).filter(
  (fieldId) =>
    !UNLISTED_FIELD_IDS.includes(fieldId) &&
    !PROFILE_ONLY_FIELD_IDS.includes(fieldId),
);

export type JobFieldGroupId =
  | "creativeMedia"
  | "techScience"
  | "business"
  | "healthCare"
  | "educationCommunity"
  | "foodHospitality"
  | "tradesIndustry"
  | "landAnimals"
  | "publicSafety";

export interface JobFieldGroup {
  id: JobFieldGroupId;
  fieldIds: readonly string[];
}

/** The job board's two-level field filter, in display order. Every job field
 *  sits in exactly one group. */
export const JOB_FIELD_GROUPS: readonly JobFieldGroup[] = [
  {
    id: "creativeMedia",
    fieldIds: [
      "design",
      "fashion",
      "editorial",
      "photo",
      "film",
      "performance",
      "music",
      "craft",
      "curation",
    ],
  },
  {
    id: "techScience",
    fieldIds: ["tech", "engineering", "science", "architecture"],
  },
  {
    id: "business",
    fieldIds: [
      "management",
      "operations",
      "people",
      "finance",
      "marketing",
      "sales",
      "customerService",
      "realEstate",
      "legal",
    ],
  },
  {
    id: "healthCare",
    fieldIds: ["healthcare", "care", "wellness", "sport", "beauty"],
  },
  {
    id: "educationCommunity",
    fieldIds: ["education", "languages", "community", "faith"],
  },
  {
    id: "foodHospitality",
    fieldIds: ["food", "hospitality", "nightlife", "retail"],
  },
  {
    id: "tradesIndustry",
    fieldIds: ["trades", "manufacturing", "transport", "facilities"],
  },
  { id: "landAnimals", fieldIds: ["farming", "animals"] },
  { id: "publicSafety", fieldIds: ["publicSector", "security"] },
];

const JOB_FIELD_ID_SET: ReadonlySet<string> = new Set(JOB_FIELD_IDS);

const GROUP_BY_JOB_FIELD: ReadonlyMap<string, JobFieldGroupId> = new Map(
  JOB_FIELD_GROUPS.flatMap((group) =>
    group.fieldIds.map((fieldId) => [fieldId, group.id] as const),
  ),
);

const FIELD_BY_PROFESSION_ID: ReadonlyMap<string, string> = new Map(
  Object.entries(PROFESSION_IDS_BY_FIELD).flatMap(([fieldId, professionIds]) =>
    professionIds.map((professionId) => [professionId, fieldId] as const),
  ),
);

/** Catalog key for a field's label. */
export function fieldLabelKey(fieldId: string): string {
  return `members:directory.discipline.${fieldId}`;
}

/** Catalog key for a profession's label. */
export function professionLabelKey(professionId: string): string {
  return `members:directory.profession.${professionId}`;
}

/** Catalog key for a job field group's heading. */
export function jobFieldGroupLabelKey(groupId: JobFieldGroupId): string {
  return `economy:jobs.fieldGroup.${groupId}`;
}

/** True when `value` names a field a job can be filed under. */
export function isJobFieldId(value: string): boolean {
  return JOB_FIELD_ID_SET.has(value);
}

/** The display group holding a job field, or undefined for any other id. */
export function jobFieldGroupOf(fieldId: string): JobFieldGroupId | undefined {
  return GROUP_BY_JOB_FIELD.get(fieldId);
}

/** True when `professionId` is filed under `fieldId`. */
export function professionBelongsToField(
  professionId: string,
  fieldId: string,
): boolean {
  return FIELD_BY_PROFESSION_ID.get(professionId) === fieldId;
}
