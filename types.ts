export type UserRole = 'admin' | 'operator' | 'expert' | 'farmer' | 'lab';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  ownerId?: string; // Links user account to specific Owner/Farmer record
  farmerId?: string; // Backward compatibility
  isFirstLogin?: boolean;
}

export interface Owner {
  id: string;
  name: string;
  nationalId: string;
  mobile: string;
  phone?: string;
  userId?: string;
  createdAt?: string;
}

// Backward compatibility alias
export type Farmer = Owner;

export interface WaterSource {
  id: string;
  name: string;
  wellDepth?: number;
  flowRate?: string; // دبی (لیتر بر ثانیه یا اینچ)
  waterEc?: string; // هدایت الکتریکی آب
  waterPh?: string; // پی‌اچ آب
  waterSar?: string; // نسبت جذب سدیم
  latitude?: string | number;
  longitude?: string | number;
}

export interface Land {
  id: string;
  name: string; // or title
  title?: string;
  areaHectares: number;
  area?: number; // compat
  ownerId: string;
  farmerId?: string; // compat
  waterSourceId?: string;
  pistachioRootstock: string; // رقم یا پایه پسته: اکبری، کله‌قوچی، احمدآقایی، فندقی، بادامی، UCB1 و...
  plantingYear?: number; // سال احداث یا پیوند
  irrigationSystem: string; // قطره‌ای، غرقابی، بابلر، نواری و...
  irrigationPeriod: string; // مدار آبیاری (مثلاً ۲۴ روزه، ۳۰ روزه)
  latitude?: string | number;
  longitude?: string | number;
  osmUrl?: string;
  googleMapUrl?: string;
  location?: string;
  cropType?: string;
}

export interface Visit {
  id: string;
  landId: string;
  visitDate: string;
  cropYearStatus?: string; // سال بار / سال استراحت (ON / OFF)
  growthStage?: string; // مرحله رشدی: تورم جوانه، ارزنو، پر شدن مغز، خندانی، پس از برداشت و...

  // آفات حشره‌ای
  psyllid?: string; // پسیل معمولی پسته
  psyllaDensity?: string; // تراکم پسیل (تعداد پوره یا حشره کامل در برگ)
  stinkbugStatus?: string; // سن‌های پسته (سن سبز و...)
  twigBorerStatus?: string; // سرشاخه‌خوار پسته
  seedWaspStatus?: string; // زنبور مغزخوار پسته
  trunkBorerStatus?: string; // تنه‌خوار (سوسک چوب‌خوار)
  leopardMothStatus?: string; // کرم خراط
  carobMothStatus?: string; // کرم گلوگاه / پروانه میوه
  scaleInsectStatus?: string; // شپشک‌های سپردار
  gallAphidStatus?: string; // شته‌های گال‌ساز
  aphidStatus?: string; // سازگاری با نسخه‌های قبلی
  leafminerStatus?: string; // سازگاری با نسخه‌های قبلی
  otherPests?: string;

  // کنه‌ها
  spiderMiteStatus?: string; // کنه تارعنکبوتی
  otherFolivorousMitesStatus?: string; // سایر کنه‌های برگ‌خوار
  miteStatus?: string; // سازگاری با نسخه‌های قبلی

  // بیماری‌های قارچی
  verticilliumStatus?: string; // پژمردگی ورتیسیلیومی
  gummosis?: string; // پوسیدگی ریشه و طوقه (گموز)
  dieback?: string; // سرشاخه‌خشکیدگی / بوتریوسفاریا
  alternariaStatus?: string; // لکه برگی آلترناریایی (لکه سیاه)
  aspergillusStatus?: string; // آلودگی آسپرژیلوسی میوه (خطر آفلاتوکسین)
  septoriaStatus?: string; // لکه برگی سپتوریایی
  armillariaStatus?: string; // پوسیدگی آرمیلاریایی ریشه
  powderyMildewStatus?: string; // سفیدک سطحی
  botrytisStatus?: string; // سازگاری
  rootRotStatus?: string; // سازگاری

  // بیماری‌های باکتریایی
  bacterialBlightStatus?: string; // سوختگی باکتریایی
  crownGallStatus?: string; // سرطان طوقه (گال طوقه)
  cankerStatus?: string; // سازگاری

  // فیتوپلاسما و ویروس
  witchesBroomStatus?: string; // جاروک پسته (جارو جادویی / بوته‌ای شدن سرشاخه)

  // نماتدها
  rootKnotNematodeStatus?: string; // نماتد ریشه‌گره

  // ناهنجاری‌های غیرزنده
  salinityInjury?: string; // شوری خاک و آب
  springFrostStatus?: string; // سرمازدگی بهاره
  blankingAndNonSplittingStatus?: string; // پوکی و خندانی نشدن
  zincBoronDeficiencyStatus?: string; // کمبود روی (روزت) و بور
  sunburnStatus?: string; // آفتاب‌سوختگی
  windDamage?: string; // آسیب باد

  // وضعیت درخت
  treeVigor?: string; // شادابی و رشد رویشی
  fruitLoad?: string; // بار محصول (عالی، متوسط، کم)
  earlySplitting?: string; // زودخندانی
  blankingRate?: string; // پوکی میوه

  // تغذیه و آبیاری
  irrigationStatus?: string;
  soilMoisture?: string; // رطوبت خاک
  nutrientDeficiency?: string; // کمبودهای تغذیه‌ای
  weedStatus?: string; // علف هرز

  // اطلاعات هواشناسی در زمان بازدید
  temperature?: number | string; // دما (°C)
  humidity?: number | string; // رطوبت نسبی (%)
  windSpeed?: number | string; // سرعت باد (km/h)
  weatherCondition?: string; // وضعیت آب و هوا (آفتابی، نیمه ابری، ابری، بارانی و...)

  // اطلاعات تکمیلی
  visitDurationMin?: number;
  photosTaken?: number;
  ipmApplied?: string; // اقدامات IPM اجرا شده
  labSampleTaken?: boolean; // آیا نمونه‌برداری آزمایشگاهی شد؟
  nextVisitDate?: string; // تاریخ بازدید بعدی
  privateNote?: string; // یادداشت محرمانه کارشناس

  // توصیه و تایید
  expertRecommendation?: string; // توصیه تخصصی کارشناس
  isApproved: boolean; // تایید توسط مدیر / سرکارشناس
  convertedToTaskId?: string; // شناسه دستورالعمل صادر شده از این توصیه
  convertedAt?: string; // تاریخ تبدیل به دستورالعمل
}

export interface LabAnalysis {
  id: string;
  landId: string;
  analysisDate: string;
  
  // آنالیز خاک
  soilEc?: string | number;
  soilPh?: string | number;
  soilTexture?: string; // بافت خاک: شنی، لومی، رسی و...
  soilTnv?: string | number; // درصد کربنات کلسیم معادل (آهک کل)
  soilOc?: string | number; // درصد کربن آلی
  soilSar?: string | number; // نسبت جذب سدیم خاک

  // آنالیز برگ
  leafN?: string | number; // ازت برگ %
  leafP?: string | number; // فسفر %
  leafRefK?: string | number; // پتاسیم %
  leafFe?: string | number; // آهن ppm
  leafZn?: string | number; // روی ppm
  leafB?: string | number; // بور ppm
  
  leafInterpretation?: string; // تفسیر نتایج آزمایش
  attachment?: TestAttachment;
}

// Backward compatibility interfaces
export interface TestAttachment {
  name: string;
  data: string; // base64
  type: string; // mime type
}

export type SoilTest = LabAnalysis;
export type WaterTest = WaterSource;
export type PlantTest = LabAnalysis;

export type TaskCategory = 'pest_control' | 'nutrition' | 'agronomy';

export interface Task {
  id: string;
  landId: string;
  visitId?: string;
  sourceRecommendation?: string; // متن توصیه کارشناسی اصلی
  visitDate?: string; // تاریخ بازدید مبدا
  category: TaskCategory; // pest_control | nutrition | agronomy
  title: string;
  description?: string;
  dueDate?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;

  // وضعیت انجام توسط کشاورز
  farmerDone: boolean;
  farmerDoneAt?: string;
  farmerNote?: string;

  // تایید کارشناس/مدیر
  isConfirmed: boolean;
  confirmedBy?: string;
  confirmedByName?: string;
  confirmedAt?: string;
}

export interface Message {
  id: string;
  ownerId: string;
  senderRole: UserRole;
  senderId: string;
  senderName?: string;
  text?: string;
  imagePath?: string;
  createdAt: string;
  isRead: boolean;
}

export interface AISettings {
  enabled: boolean;
  labExtractionEnabled: boolean;
  provider: 'local_smart' | 'gemini';
  customApiKey?: string;
  clinicAdvisorEnabled: boolean;
}

export interface OpType {
  id: string;
  label: string;
  category: 'material-based' | 'labor-based';
  iconName: string;
}

export interface Operation {
  id: string;
  landId: string;
  date: string;
  typeId: string;
  title: string;
  description: string;
  materialsUsed?: string;
  cost?: number;
}

export interface MarketProduct {
  id: string;
  name: string;
  typeId: string;
  brand: string;
  description: string;
  usageGuide: string;
  source: 'manual' | 'ai';
}

export interface Consultation {
  id: string;
  farmerId: string;
  landId?: string;
  imageUrl: string;
  message: string;
  aiPreliminaryAnalysis?: string;
  expertResponse?: string;
  status: 'pending' | 'responded';
  timestamp: number;
}

export type ViewType = 
  | 'home'
  | 'dashboard'
  | 'arazi'
  | 'visits'
  | 'analyses'
  | 'tasks'
  | 'map'
  | 'chat'
  | 'users'
  | 'lookups'
  | 'smart-clinic'
  | 'product-market';

export type LookupCategory = 
  | 'pests'              // آفات پسته
  | 'diseases'           // بیماری‌ها و عوارض
  | 'pesticides'         // سموم، شوینده‌ها و آفت‌کش‌ها
  | 'growth_stages'      // مراحل رشدی و فنولوژی
  | 'rootstocks_varieties' // ارقام و پایه‌های پسته
  | 'fertilizers'        // کودها و ترکیبات تغذیه‌ای
  | 'irrigation_systems' // سیستم‌ها و روش‌های آبیاری
  | 'soil_textures';     // بافت‌های خاک

export interface LookupItem {
  id: string;
  category: LookupCategory;
  title: string;
  code?: string;
  scientificName?: string; // نام علمی یا استاندارد لاتین
  description?: string; // توضیحات، دستورالعمل یا دوز پیشنهادی
  recommendedStage?: string; // فاز رشدی پیشنهادی
  tag?: string; // برچسب اختیاری مثل ارگانیک، شیمیایی، سیستمیک، قارچ‌کش و...
  isActive: boolean;
  order?: number;
}

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

export interface OfflineQueueItem {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  recordId: string;
  data: any;
  timestamp: number;
  retries: number;
}

export interface SyncPushPayload {
  deviceId: string;
  clientTime: string;
  queue: OfflineQueueItem[];
}

export interface SyncPullResponse {
  serverTime: string;
  changes: {
    owners?: Owner[];
    lands?: Land[];
    water_sources?: WaterSource[];
    visits?: Visit[];
    lab_analyses?: LabAnalysis[];
    tasks?: Task[];
    lookups?: LookupItem[];
    messages?: Message[];
  };
}

export interface CpanelDbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  ssl?: boolean;
}
