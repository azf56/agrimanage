import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defaultLookupItems } from './defaultLookups';

dotenv.config();

// Safe directory resolution for both CommonJS (LiteSpeed lsnode.js / dist/server.cjs) and ESM/tsx dev
const getDirname = (): string => {
  if (typeof __dirname !== 'undefined' && __dirname) {
    return __dirname;
  }
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // fallback if import.meta.url is invalid
  }
  return process.cwd();
};

const appDir = getDirname();
// Detect if running from compiled dist/server.cjs or dev tsx server.ts
const isInsideDist = path.basename(appDir) === 'dist';
const projectRoot = isInsideDist ? path.dirname(appDir) : appDir;
const STORAGE_FILE = path.join(projectRoot, 'agri_storage.json');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));

interface AppDataStore {
  users: any[];
  owners: any[];
  water_sources: any[];
  lands: any[];
  visits: any[];
  lab_analyses: any[];
  tasks: any[];
  messages: any[];
  operations: any[];
  products: any[];
  op_types: any[];
  consultations: any[];
  lookups: any[];
}

const seedOwners = [
  { id: '1', name: 'حاج علی رضایی', nationalId: '0921234567', mobile: '09131234567', phone: '03433221100', userId: '101' },
  { id: '2', name: 'مهندس محمد حسینی', nationalId: '0947654321', mobile: '09129876543', phone: '03433221101', userId: '102' },
  { id: '3', name: 'محمدرضا سلطانی', nationalId: '0935544332', mobile: '09133445566', phone: '03433221102', userId: '103' }
];

const seedWaterSources = [
  { id: '1', name: 'چاه موتور عمیق شماره ۱ (دشت سبز)', wellDepth: 140, flowRate: '۳۵ لیتر بر ثانیه (۶ اینچ)', waterEc: '۳.۴', waterPh: '۷.۸', waterSar: '۴.۲', latitude: '35.116', longitude: '57.181' },
  { id: '2', name: 'چاه موتور شماره ۲ (قنات باقرآباد)', wellDepth: 95, flowRate: '۲۲ لیتر بر ثانیه (۴ اینچ)', waterEc: '۲.۱', waterPh: '۷.۵', waterSar: '۲.۸', latitude: '35.125', longitude: '57.195' }
];

const seedLands = [
  { 
    id: '1', 
    name: 'قطعه شماره ۱ - باغ پسته اکبری', 
    title: 'قطعه شماره ۱ - باغ پسته اکبری',
    areaHectares: 6.5, 
    ownerId: '1', 
    waterSourceId: '1', 
    pistachioRootstock: 'پیوند اکبری روی پایه بادامی زرندی', 
    plantingYear: 1382, 
    irrigationSystem: 'قطره‌ای تحت فشار بابلر', 
    irrigationPeriod: '۲۴ روزه', 
    latitude: '35.118', 
    longitude: '57.184' 
  },
  { 
    id: '2', 
    name: 'قطعه شماره ۲ - باغ کله‌قوچی و احمدآقایی', 
    title: 'قطعه شماره ۲ - باغ کله‌قوچی و احمدآقایی',
    areaHectares: 4.2, 
    ownerId: '2', 
    waterSourceId: '1', 
    pistachioRootstock: 'کله‌قوچی و احمدآقایی روی پایه UCB1', 
    plantingYear: 1390, 
    irrigationSystem: 'قطره‌ای نواری (تیپ)', 
    irrigationPeriod: '۱۸ روزه', 
    latitude: '35.122', 
    longitude: '57.189' 
  }
];

const seedVisits = [
  {
    id: '1',
    landId: '1',
    visitDate: '۱۴۰۴/۰۲/۱۵',
    cropYearStatus: 'سال بار (ON)',
    growthStage: 'تشکیل میوه و ارزنو شدن دانه‌ها',
    psyllid: 'مشاهده پوره در حاشیه برگ‌ها',
    psyllaDensity: 'متوسط (حدود ۶ پوره در هر برگ)',
    miteStatus: 'بدون آلودگی',
    stinkbugStatus: 'مشاهده سن سبز در علف‌های حاشیه',
    aphidStatus: 'بدون آلودگی',
    leafminerStatus: 'بدون آلودگی',
    otherPests: 'کمی زنبور مغزخوار پسته',
    gummosis: 'بدون علائم',
    dieback: 'خفیف در سرشاخه‌های غربی',
    alternariaStatus: 'بدون علائم',
    botrytisStatus: 'بدون علائم',
    rootRotStatus: 'بدون علائم',
    cankerStatus: 'بدون علائم',
    salinityInjury: 'سوختگی نوک برگ در ۱۰٪ درختان',
    sunburnStatus: 'بدون علائم',
    windDamage: 'بدون آسیب',
    treeVigor: 'مطلوب و شاداب',
    fruitLoad: 'خوب و پربار',
    earlySplitting: 'بدون مشکل',
    blankingRate: 'نرمال (زیر ۱۰٪)',
    irrigationStatus: 'خاک مرطوب و مناسب',
    soilMoisture: 'مناسب',
    nutrientDeficiency: 'کمبود روی و پتاسیم مشهود است',
    weedStatus: 'کنترل شده',
    temperature: 32,
    humidity: 26,
    windSpeed: 12,
    weatherCondition: 'آفتابی',
    visitDurationMin: 45,
    photosTaken: 3,
    ipmApplied: 'کارت زرد چسبنده، صابون محلول‌پاشی',
    labSampleTaken: true,
    nextVisitDate: '۱۴۰۴/۰۳/۰۱',
    privateNote: 'باغدار اقدامات تغذیه زمستانه را به خوبی اجرا کرده است.',
    expertRecommendation: 'محلول‌پاشی صابون گیاهی یا عصاره گوگردی جهت کنترل پسیل؛ همراه با کود سیلیکات پتاسیم و کلات روی جهت استحکام دانه‌ها.',
    isApproved: true,
    convertedToTaskId: '1'
  },
  {
    id: '2',
    landId: '2',
    visitDate: '۱۴۰۴/۰۲/۱۸',
    cropYearStatus: 'سال بار (ON)',
    growthStage: 'ارزنو شدن و شروع رشد جنین',
    psyllid: 'پوره‌های سن ۱ و ۲ در برگ‌های جوان',
    psyllaDensity: 'حدود ۴ پوره در برگ',
    miteStatus: 'مشاهده لکه‌های نقره‌ای ناشی از کنه گالی',
    stinkbugStatus: 'بدون آلودگی',
    aphidStatus: 'بدون آلودگی',
    leafminerStatus: 'بدون آلودگی',
    otherPests: 'مشاهده سنک تخم‌گذار در اطراف تنه',
    gummosis: 'بدون علائم',
    dieback: 'بدون علائم',
    alternariaStatus: 'بدون علائم',
    botrytisStatus: 'بدون علائم',
    rootRotStatus: 'بدون علائم',
    cankerStatus: 'بدون علائم',
    salinityInjury: 'سوختگی خفیف حاشیه برگ‌ها',
    sunburnStatus: 'بدون علائم',
    windDamage: 'بدون آسیب',
    treeVigor: 'بسیار خوب و باطراوت',
    fruitLoad: 'عالی (خوشه‌های متراکم)',
    earlySplitting: 'بدون مشکل',
    blankingRate: 'نرمال',
    irrigationStatus: 'آبیاری منظم قطره‌ای نواری',
    soilMoisture: 'مناسب و یکنواخت',
    nutrientDeficiency: 'کمبود کلسیم و بور مشاهده شد',
    weedStatus: 'مبارزه مکانیکی انجام شده',
    temperature: 30,
    humidity: 28,
    windSpeed: 8,
    weatherCondition: 'صاف و آفتابی',
    visitDurationMin: 40,
    photosTaken: 2,
    ipmApplied: 'تله فرومونی نظارتی، علف‌تراشی حاشیه باغ',
    labSampleTaken: false,
    nextVisitDate: '۱۴۰۴/۰۳/۰۵',
    privateNote: 'تراکم خوشه‌ها بسیار مطلوب است، نیاز به کلسیم-بور جهت جلوگیری از لکه پوست استخوانی.',
    expertRecommendation: 'محلول‌پاشی کلات کلسیم-بور (Calcium-Boron) به همراه عصاره جلبک دریایی در هوای خنک عصر؛ پایش مجدد کنه با کنه‌کش انویدور در صورت افزایش تراکم.',
    isApproved: false
  }
];

const seedLabAnalyses = [
  {
    id: '1',
    landId: '1',
    analysisDate: '۱۴۰۴/۰۱/۲۰',
    soilEc: 3.2,
    soilPh: 7.6,
    soilTexture: 'شنی لومی (Sandy Loam)',
    soilTnv: 18.5,
    soilOc: 0.85,
    soilSar: 3.1,
    leafN: 2.3,
    leafP: 0.16,
    leafRefK: 1.45,
    leafFe: 92,
    leafZn: 18,
    leafB: 48,
    leafInterpretation: 'وضعیت نیتروژن و فسفر در حد نرمال است. مقدار روی (Zn) و پتاسیم (K) نیازمند تغذیه برگی و تقویتی در فاز پر شدن مغز پسته می‌باشد.'
  }
];

const seedTasks = [
  {
    id: '1',
    landId: '1',
    visitId: '1',
    category: 'pest_control',
    title: 'محلول‌پاشی صابون ارگانیک پالیگان علیه پسیل پسته',
    description: 'محلول‌پاشی صابون کشاورزی با دوز ۲ در هزار در ساعات اولیه صبح یا غروب خنک جهت شستشوی عسلک و کنترل پوره‌های سن پایین پسیل پسته.',
    dueDate: '۱۴۰۴/۰۲/۲۵',
    createdBy: '1',
    createdByName: 'مهندس اکبری (سرکارشناس)',
    createdAt: '۱۴۰۴/۰۲/۱۵',
    farmerDone: true,
    farmerDoneAt: '۱۴۰۴/۰۲/۲۲',
    farmerNote: 'محلول‌پاشی با سمپاش توربولاینر با موفقیت انجام شد.',
    isConfirmed: true,
    confirmedBy: '1',
    confirmedByName: 'مدیر کل سامانه',
    confirmedAt: '۱۴۰۴/۰۲/۲۳'
  },
  {
    id: '2',
    landId: '1',
    visitId: '1',
    category: 'nutrition',
    title: 'محلول‌پاشی سیلیکات پتاسیم و کلات روی',
    description: 'جهت رفع تنش گرمایی تابستان و تقویت پوست استخوانی دانه پسته و پیشگیری از آفتاب‌سوختگی.',
    dueDate: '۱۴۰۴/۰۳/۰۵',
    createdBy: '1',
    createdByName: 'مهندس اکبری (سرکارشناس)',
    createdAt: '۱۴۰۴/۰۲/۱۵',
    farmerDone: false,
    isConfirmed: false
  },
  {
    id: '3',
    landId: '2',
    category: 'agronomy',
    title: 'تنظیم دور آبیاری و کنترل قطره‌چکان‌ها',
    description: 'بررسی گرفتگی نازل‌های آبیاری قطره‌ای و شستشوی خطوط لوله‌های فرعی با اسید فسفریک.',
    dueDate: '۱۴۰۴/۰۳/۱۰',
    createdBy: '1',
    createdByName: 'مهندس اکبری (سرکارشناس)',
    createdAt: '۱۴۰۴/۰۲/۱۶',
    farmerDone: false,
    isConfirmed: false
  }
];

const seedUsers = [
  { id: '1', username: 'admin', password: '123', name: 'مدیر کل سامانه باغات پسته', role: 'admin' },
  { id: '2', username: 'operator1', password: '123', name: 'مهندس رمضانی (اپراتور سامانه)', role: 'operator' },
  { id: '3', username: 'expert1', password: '123', name: 'دکتر کریمی (متخصص گیاه‌پزشکی پسته)', role: 'expert' },
  { id: '101', username: '09131234567', password: '123', name: 'حاج علی رضایی (باغدار)', role: 'farmer', ownerId: '1' }
];

const seedMessages = [
  {
    id: '1',
    ownerId: '1',
    senderRole: 'farmer',
    senderId: '101',
    senderName: 'حاج علی رضایی',
    text: 'سلام مهندس، بعد از محلول‌پاشی صابون، پسیل کاملاً مهار شد. برای مرحله بعد کود آهن تزریق کنیم؟',
    createdAt: '۱۴۰۴/۰۲/۲۴ ۱۰:۳۰',
    isRead: true
  },
  {
    id: '2',
    ownerId: '1',
    senderRole: 'expert',
    senderId: '3',
    senderName: 'دکتر کریمی (متخصص گیاه‌پزشکی)',
    text: 'سلام و خدا قوت حاج آقا. بله با شروع خرداد ماه و مدار آبیاری بعدی، کود سولفات پتاسیم و اسید هیومیک همراه آب مصرف شود.',
    createdAt: '۱۴۰۴/۰۲/۲۴ ۱۱:۱۵',
    isRead: true
  }
];

const defaultData: AppDataStore = {
  users: seedUsers,
  owners: seedOwners,
  water_sources: seedWaterSources,
  lands: seedLands,
  visits: seedVisits,
  lab_analyses: seedLabAnalyses,
  tasks: seedTasks,
  messages: seedMessages,
  operations: [],
  products: [],
  op_types: [
    { id: 'opt_1', label: 'مبارزه با آفات پسته (پسیل، سن، کنه)', category: 'material-based', iconName: 'ShieldAlert' },
    { id: 'opt_2', label: 'کوددهی و تغذیه برگی و خاکی', category: 'material-based', iconName: 'Sprout' },
    { id: 'opt_3', label: 'آبیاری منظم و مداربندی', category: 'labor-based', iconName: 'Droplet' },
    { id: 'opt_4', label: 'هرس و پیوند باغات', category: 'labor-based', iconName: 'Activity' },
    { id: 'opt_5', label: 'برداشت و فرآوری پسته', category: 'labor-based', iconName: 'ClipboardCheck' },
  ],
  consultations: [],
  lookups: defaultLookupItems
};

let localStore: AppDataStore = { ...defaultData };

function loadLocalStore() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      localStore = {
        ...defaultData,
        ...parsed,
        users: (parsed.users && parsed.users.length > 0) ? parsed.users : defaultData.users,
        owners: (parsed.owners && parsed.owners.length > 0) ? parsed.owners : (parsed.farmers || defaultData.owners),
        water_sources: (parsed.water_sources && parsed.water_sources.length > 0) ? parsed.water_sources : defaultData.water_sources,
        lands: (parsed.lands && parsed.lands.length > 0) ? parsed.lands : defaultData.lands,
        visits: (parsed.visits && parsed.visits.length > 0) ? parsed.visits : defaultData.visits,
        lab_analyses: (parsed.lab_analyses && parsed.lab_analyses.length > 0) ? parsed.lab_analyses : defaultData.lab_analyses,
        tasks: (parsed.tasks && parsed.tasks.length > 0) ? parsed.tasks : defaultData.tasks,
        messages: (parsed.messages && parsed.messages.length > 0) ? parsed.messages : defaultData.messages,
        op_types: (parsed.op_types && parsed.op_types.length > 0) ? parsed.op_types : defaultData.op_types,
        lookups: (parsed.lookups && parsed.lookups.length > 0) ? parsed.lookups : defaultData.lookups,
      };
    } else {
      saveLocalStore();
    }
  } catch (e) {
    console.warn('Could not read local store file, initializing defaults:', e);
    localStore = { ...defaultData };
  }
}

function saveLocalStore() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(localStore, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving local store:', e);
  }
}

// Initialize on startup
loadLocalStore();

// --- Supabase Client (Fault-tolerant with auto fallback) ---
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

let supabase: any = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    isSupabaseConfigured = true;
  } catch (e) {
    console.warn('Supabase initialization failed:', e);
    supabase = null;
  }
}

// App Settings (AI Configuration - Optional)
interface AppSettingsState {
  aiEnabled: boolean;
  labExtractionEnabled: boolean;
  provider: 'local_smart' | 'gemini';
  customApiKey?: string;
  clinicAdvisorEnabled: boolean;
}

let currentSettings: AppSettingsState = {
  aiEnabled: false,
  labExtractionEnabled: false,
  provider: 'local_smart',
  customApiKey: '',
  clinicAdvisorEnabled: false
};

// Normalize table names
function normalizeTableName(table: string): keyof AppDataStore {
  const map: Record<string, keyof AppDataStore> = {
    'farmers': 'owners',
    'owners': 'owners',
    'water_sources': 'water_sources',
    'waterSources': 'water_sources',
    'water_tests': 'water_sources',
    'lands': 'lands',
    'visits': 'visits',
    'lab_analyses': 'lab_analyses',
    'labAnalyses': 'lab_analyses',
    'soil_tests': 'lab_analyses',
    'plant_tests': 'lab_analyses',
    'tasks': 'tasks',
    'messages': 'messages',
    'users': 'users',
    'operations': 'operations',
    'products': 'products',
    'op_types': 'op_types',
    'opTypes': 'op_types',
    'consultations': 'consultations',
    'lookups': 'lookups',
    'base_tables': 'lookups',
    'baseTables': 'lookups'
  };
  return map[table] || (table as keyof AppDataStore);
}

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    database: isSupabaseConfigured ? 'configured' : 'local_storage',
    provider: 'سامانه مدیریت باغات پسته (ذخیره‌ساز بومی پایدار و آماده cPanel)',
    siteTitle: 'سامانه جامع مدیریت باغات پسته',
    themeColor: '#1a5c2a',
    offlineSupported: true,
    serverTime: new Date().toISOString()
  });
});

// Auth Login endpoint (Supports both Web and Mobile App clients)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'نام کاربری و کلمه عبور الزامی است.' });
  }

  const user = (localStore.users || []).find(
    (u: any) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password.trim()
  );

  if (!user) {
    return res.status(401).json({ error: 'نام کاربری یا کلمه عبور اشتباه است.' });
  }

  // Generate lightweight JWT-like token for mobile & web sessions
  const token = 'agri_' + Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString('base64');

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      ownerId: user.ownerId || user.farmerId
    }
  });
});

app.get('/api/settings', (req, res) => {
  res.json({
    ...currentSettings,
    hasCustomKey: !!currentSettings.customApiKey,
    customApiKey: currentSettings.customApiKey ? '********' : ''
  });
});

app.post('/api/settings', (req, res) => {
  const { aiEnabled, labExtractionEnabled, provider, customApiKey, clinicAdvisorEnabled } = req.body;
  if (typeof aiEnabled === 'boolean') currentSettings.aiEnabled = aiEnabled;
  if (typeof labExtractionEnabled === 'boolean') currentSettings.labExtractionEnabled = labExtractionEnabled;
  if (provider === 'local_smart' || provider === 'gemini') currentSettings.provider = provider;
  if (typeof clinicAdvisorEnabled === 'boolean') currentSettings.clinicAdvisorEnabled = clinicAdvisorEnabled;
  if (typeof customApiKey === 'string' && customApiKey !== '********') {
    currentSettings.customApiKey = customApiKey.trim();
  }
  res.json({ success: true, settings: { ...currentSettings, customApiKey: currentSettings.customApiKey ? '********' : '' } });
});

// Full Data Fetch Endpoint
app.get('/api/data', async (req, res) => {
  res.json({
    users: localStore.users || defaultData.users,
    owners: localStore.owners || defaultData.owners,
    farmers: localStore.owners || defaultData.owners, // alias
    waterSources: localStore.water_sources || defaultData.water_sources,
    water_sources: localStore.water_sources || defaultData.water_sources,
    lands: localStore.lands || defaultData.lands,
    visits: localStore.visits || defaultData.visits,
    labAnalyses: localStore.lab_analyses || defaultData.lab_analyses,
    lab_analyses: localStore.lab_analyses || defaultData.lab_analyses,
    tasks: localStore.tasks || defaultData.tasks,
    messages: localStore.messages || defaultData.messages,
    operations: localStore.operations || [],
    products: localStore.products || [],
    opTypes: localStore.op_types || defaultData.op_types,
    op_types: localStore.op_types || defaultData.op_types,
    consultations: localStore.consultations || [],
    lookups: localStore.lookups || defaultData.lookups,
    baseTables: localStore.lookups || defaultData.lookups
  });
});

// --- Delta Sync Endpoints (For Mobile App & Web Offline Engine) ---

// 1. Sync PUSH: Process batch offline operations from mobile/web outbox queue
app.post('/api/sync/push', async (req, res) => {
  const { queue, deviceId, clientTime } = req.body;
  if (!Array.isArray(queue)) {
    return res.status(400).json({ error: 'فرمت صف همگام‌سازی نامعتبر است.' });
  }

  const appliedIds: string[] = [];

  for (const item of queue) {
    const { id, table, action, recordId, data } = item;
    const normKey = normalizeTableName(table);
    let tableArray: any[] = (localStore as any)[normKey] || [];

    if (action === 'insert') {
      const existsIndex = tableArray.findIndex(r => r.id === (recordId || data?.id));
      if (existsIndex >= 0) {
        tableArray[existsIndex] = { ...tableArray[existsIndex], ...data };
      } else {
        tableArray = [data, ...tableArray];
      }
      appliedIds.push(id);
    } else if (action === 'update') {
      tableArray = tableArray.map(r => r.id === (recordId || data?.id) ? { ...r, ...data } : r);
      appliedIds.push(id);
    } else if (action === 'delete') {
      tableArray = tableArray.filter(r => r.id !== (recordId || data?.id));
      appliedIds.push(id);
    }

    (localStore as any)[normKey] = tableArray;
  }

  saveLocalStore();

  res.json({
    success: true,
    appliedIds,
    serverTime: new Date().toISOString()
  });
});

// 2. Sync PULL: Delta sync changes for mobile apps
app.get('/api/sync/pull', (req, res) => {
  const since = req.query.since as string;
  res.json({
    serverTime: new Date().toISOString(),
    data: {
      owners: localStore.owners,
      lands: localStore.lands,
      waterSources: localStore.water_sources,
      visits: localStore.visits,
      tasks: localStore.tasks,
      labAnalyses: localStore.lab_analyses,
      lookups: localStore.lookups,
      messages: localStore.messages
    }
  });
});

// Generic Table Sync Endpoint
app.post('/api/sync/:table', async (req, res) => {
  const { table } = req.params;
  const data = req.body;
  const normKey = normalizeTableName(table);

  if (Array.isArray(data)) {
    (localStore as any)[normKey] = data;
    saveLocalStore();
  }

  res.json({ success: true, count: Array.isArray(data) ? data.length : 0 });
});

// --- Dedicated REST Endpoints for Mobile & Third-party Integrations ---

// Lands CRUD
app.get('/api/lands', (req, res) => res.json(localStore.lands || []));
app.post('/api/lands', (req, res) => {
  const newLand = { id: req.body.id || Math.random().toString(36).substring(2, 9), ...req.body };
  localStore.lands = [newLand, ...(localStore.lands || [])];
  saveLocalStore();
  res.status(201).json(newLand);
});
app.put('/api/lands/:id', (req, res) => {
  const { id } = req.params;
  localStore.lands = (localStore.lands || []).map(l => l.id === id ? { ...l, ...req.body } : l);
  saveLocalStore();
  res.json({ success: true });
});
app.delete('/api/lands/:id', (req, res) => {
  const { id } = req.params;
  localStore.lands = (localStore.lands || []).filter(l => l.id !== id);
  saveLocalStore();
  res.json({ success: true });
});

// Visits CRUD
app.get('/api/visits', (req, res) => res.json(localStore.visits || []));
app.post('/api/visits', (req, res) => {
  const newVisit = { id: req.body.id || Math.random().toString(36).substring(2, 9), ...req.body };
  localStore.visits = [newVisit, ...(localStore.visits || [])];
  saveLocalStore();
  res.status(201).json(newVisit);
});
app.put('/api/visits/:id', (req, res) => {
  const { id } = req.params;
  localStore.visits = (localStore.visits || []).map(v => v.id === id ? { ...v, ...req.body } : v);
  saveLocalStore();
  res.json({ success: true });
});

// Tasks CRUD
app.get('/api/tasks', (req, res) => res.json(localStore.tasks || []));
app.post('/api/tasks', (req, res) => {
  const newTask = { id: req.body.id || Math.random().toString(36).substring(2, 9), ...req.body };
  localStore.tasks = [newTask, ...(localStore.tasks || [])];
  saveLocalStore();
  res.status(201).json(newTask);
});
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  localStore.tasks = (localStore.tasks || []).map(t => t.id === id ? { ...t, ...req.body } : t);
  saveLocalStore();
  res.json({ success: true });
});

// Lookups / Base Tables
app.get('/api/lookups', (req, res) => res.json(localStore.lookups || defaultLookupItems));

// cPanel MySQL Schema Download / View Endpoint
app.get('/api/database/sql-schema', (req, res) => {
  try {
    const schemaPath = path.join(projectRoot, 'cpanel_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(sqlContent);
    }
  } catch (e) {
    console.error('Error serving sql schema:', e);
  }
  res.status(404).send('فایل cpanel_schema.sql یافت نشد.');
});

// Test Remote MySQL Connection (Simulated/Direct driver test for cPanel hosts)
app.post('/api/database/test-mysql', async (req, res) => {
  const { host, port, database, user, password } = req.body;
  if (!host || !database || !user) {
    return res.status(400).json({ success: false, error: 'آدرس هاست، نام دیتابیس و نام‌کاربری الزامی است.' });
  }

  try {
    // Dynamic import to prevent crash if mysql2 module is lazy loaded
    const mysql = await import('mysql2/promise');
    const connection = await mysql.createConnection({
      host,
      port: Number(port) || 3306,
      database,
      user,
      password,
      connectTimeout: 5000
    });

    await connection.ping();
    await connection.end();

    res.json({
      success: true,
      message: `ارتباط با پایگاه‌داده MySQL هاست (${database}@${host}) با موفقیت برقرار گردید.`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: `عدم برقراری ارتباط با هاست: ${err.message || 'لطفاً Remote MySQL را در cPanel فعال کنید.'}`
    });
  }
});

// Start Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = isInsideDist ? appDir : path.join(projectRoot, 'dist');
    console.log(`[AgriManage] Serving production static files from: ${distPath}`);

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, {
        index: 'index.html',
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
          } else if (filePath.endsWith('.js') || filePath.endsWith('.cjs') || filePath.endsWith('.mjs')) {
            res.setHeader('Content-Type', 'application/javascript');
          }
        }
      }));

      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        const indexHtml = path.join(distPath, 'index.html');
        if (fs.existsSync(indexHtml)) {
          res.sendFile(indexHtml);
        } else {
          res.status(404).send('فایل index.html در پوشه dist یافت نشد.');
        }
      });
    } else {
      app.get('/', (req, res) => {
        res.send('سامانه فعال است. جهت بارگذاری رابط کاربری وب، لطفاً دستور npm run build را در پوشه repositories/agrimanage اجرا نمایید.');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pistachio Management Server running on http://localhost:${PORT}`);
  });
}

startServer();
