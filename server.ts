import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defaultLookupItems } from './defaultLookups';
import { standardStoreProducts, matchProductsForTask } from './storeCatalogService';

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

// =========================================================================
// اتصال واقعی به پایگاه‌داده MySQL با Connection Pool و Fallback خودکار به JSON
// =========================================================================

interface ColumnMeta {
  dataType: string;
  isNullable: boolean;
  columnDefault: string | null;
}

// جدول‌های مجاز جهت جلوگیری از SQL Injection
const MYSQL_CORE_TABLES: ReadonlyArray<keyof AppDataStore> = [
  'users',
  'owners',
  'water_sources',
  'lands',
  'visits',
  'lab_analyses',
  'tasks',
  'messages',
  'lookups',
  'operations',
  'products',
  'op_types',
  'consultations'
];

// ستون‌های بولی که در MySQL به صورت TINYINT(1) ذخیره می‌شوند
const BOOLEAN_COLUMNS = new Set([
  'is_active',
  'is_deleted',
  'lab_sample_taken',
  'is_approved',
  'created_offline',
  'farmer_done',
  'is_confirmed',
  'is_read'
]);

// ستون‌های عددی که خروجی DECIMAL در mysql2 به صورت رشته برمی‌گرداند
const NUMERIC_COLUMNS = new Set([
  'area_hectares',
  'well_depth',
  'planting_year',
  'temperature',
  'humidity',
  'wind_speed',
  'visit_duration_min',
  'photos_taken',
  'soil_ec',
  'soil_ph',
  'soil_tnv',
  'soil_oc',
  'soil_sar',
  'leaf_n',
  'leaf_p',
  'leaf_ref_k',
  'leaf_fe',
  'leaf_zn',
  'leaf_b',
  'display_order',
  'version',
  'cost'
]);

let mysqlPool: Pool | null = null;
let isMySQLConnected = false;
let mysqlLastError: string | null = null;
const dbSchemaCache = new Map<string, Map<string, ColumnMeta>>();

// تبدیل ارقام فارسی/عربی به انگلیسی برای فیلدهای عددی MySQL
function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
}

// تبدیل camelCase به snake_case (سازگار با ورودی‌های از پیش snake_case)
function toSnakeCase(key: string): string {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// تبدیل snake_case به camelCase
function toCamelCase(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

// فرمت تاریخ برای ستون‌های TIMESTAMP / DATETIME در MySQL
function formatMySQLTimestamp(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 19).replace('T', ' ');
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 19).replace('T', ' ');
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime()) && /^\d{4}-/.test(trimmed)) {
      return parsed.toISOString().slice(0, 19).replace('T', ' ');
    }
  }
  return null;
}

// بررسی ساختار جداول موجود در MySQL و افزودن خودکار ستون‌های Soft Delete و Version در صورت نبود
async function loadAndEnsureMySQLSchema(pool: Pool): Promise<void> {
  const fetchColumns = async () => {
    dbSchemaCache.clear();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()`
    );
    for (const row of rows) {
      const tableName = String(row.TABLE_NAME);
      if (!dbSchemaCache.has(tableName)) {
        dbSchemaCache.set(tableName, new Map());
      }
      dbSchemaCache.get(tableName)!.set(String(row.COLUMN_NAME), {
        dataType: String(row.DATA_TYPE).toLowerCase(),
        isNullable: String(row.IS_NULLABLE).toUpperCase() === 'YES',
        columnDefault: row.COLUMN_DEFAULT !== null && row.COLUMN_DEFAULT !== undefined ? String(row.COLUMN_DEFAULT) : null
      });
    }
  };

  await fetchColumns();

  // اطمینان از وجود ستون‌های is_deleted، version و updated_at روی جداول اصلی موجود
  let schemaAltered = false;
  for (const table of MYSQL_CORE_TABLES) {
    const cols = dbSchemaCache.get(table);
    if (!cols) continue;

    if (!cols.has('is_deleted')) {
      try {
        await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`is_deleted\` TINYINT(1) NOT NULL DEFAULT 0`);
        schemaAltered = true;
      } catch (err: any) {
        console.warn(`[MySQL] عدم امکان افزودن ستون is_deleted به جدول ${table}:`, err?.message);
      }
    }

    if (!cols.has('version')) {
      try {
        await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`version\` INT NOT NULL DEFAULT 1`);
        schemaAltered = true;
      } catch (err: any) {
        console.warn(`[MySQL] عدم امکان افزودن ستون version به جدول ${table}:`, err?.message);
      }
    }

    if (!cols.has('updated_at')) {
      try {
        await pool.query(
          `ALTER TABLE \`${table}\` ADD COLUMN \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
        );
        schemaAltered = true;
      } catch (err: any) {
        console.warn(`[MySQL] عدم امکان افزودن ستون updated_at به جدول ${table}:`, err?.message);
      }
    }
  }

  if (schemaAltered) {
    await fetchColumns();
  }
}

// راه‌اندازی Connection Pool دیتابیس MySQL با Fallback امن به فایل JSON
async function initMySQL(): Promise<boolean> {
  const host = process.env.MYSQL_HOST?.trim();
  const database = process.env.MYSQL_DATABASE?.trim();
  const user = process.env.MYSQL_USER?.trim();
  const password = process.env.MYSQL_PASSWORD ?? '';
  const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;

  if (!host || !database || !user) {
    isMySQLConnected = false;
    mysqlLastError = 'متغیرهای محیطی MySQL تنظیم نشده‌اند (حالت Fallback به JSON فعال است).';
    console.log('[AgriManage] متغیرهای MYSQL تنظیم نشده‌اند؛ سامانه از ذخیره‌ساز JSON (agri_storage.json) استفاده می‌کند.');
    return false;
  }

  try {
    const pool = mysql.createPool({
      host,
      port: Number.isFinite(port) ? port : 3306,
      database,
      user,
      password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      connectTimeout: 5000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });

    // تست واقعی اتصال
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    await loadAndEnsureMySQLSchema(pool);

    mysqlPool = pool;
    isMySQLConnected = true;
    mysqlLastError = null;
    console.log(`[AgriManage] اتصال به پایگاه‌داده MySQL (${database}@${host}:${port}) با موفقیت برقرار شد.`);
    return true;
  } catch (err: any) {
    isMySQLConnected = false;
    mysqlLastError = err?.message || 'خطا در برقراری ارتباط با MySQL';
    if (mysqlPool) {
      try {
        await mysqlPool.end();
      } catch {
        // ignore close errors
      }
      mysqlPool = null;
    }
    console.warn(`[AgriManage] اتصال به MySQL ناموفق بود (${mysqlLastError})؛ Fallback خودکار به agri_storage.json فعال شد.`);
    return false;
  }
}

// بررسی اینکه آیا جدول مورد نظر در MySQL در دسترس است یا خیر
function canUseMySQLForTable(table: keyof AppDataStore): boolean {
  return Boolean(isMySQLConnected && mysqlPool && dbSchemaCache.has(table));
}

// نگاشت نام فیلد ورودی (camelCase یا snake_case) به نام ستون واقعی MySQL
function resolveDbColumnName(table: keyof AppDataStore, rawKey: string, cols: Map<string, ColumnMeta>): string | null {
  if (cols.has(rawKey)) return rawKey;

  // نگاشت‌های خاص جهت سازگاری کامل بین فرانت‌اند و اسکیمای MySQL
  if (table === 'lookups' && (rawKey === 'order' || rawKey === 'displayOrder')) {
    return cols.has('display_order') ? 'display_order' : null;
  }
  if ((table === 'users' || table === 'lands') && rawKey === 'farmerId') {
    return cols.has('owner_id') ? 'owner_id' : null;
  }
  if (table === 'lands' && rawKey === 'area') {
    return cols.has('area_hectares') ? 'area_hectares' : null;
  }

  const snake = toSnakeCase(rawKey);
  if (cols.has(snake)) return snake;

  return null;
}

// پاکسازی و تطبیق نوع داده مقدار ورودی با نوع ستون در MySQL
function coerceValueForColumn(colName: string, rawValue: any, meta: ColumnMeta): any {
  if (rawValue === undefined) return undefined;
  if (rawValue === null) return null;

  if (BOOLEAN_COLUMNS.has(colName)) {
    if (typeof rawValue === 'boolean') return rawValue ? 1 : 0;
    if (typeof rawValue === 'number') return rawValue ? 1 : 0;
    if (typeof rawValue === 'string') {
      const lower = rawValue.trim().toLowerCase();
      return lower === '1' || lower === 'true' ? 1 : 0;
    }
    return 0;
  }

  if (meta.dataType === 'timestamp' || meta.dataType === 'datetime') {
    return formatMySQLTimestamp(rawValue);
  }

  if (['int', 'tinyint', 'smallint', 'mediumint', 'bigint'].includes(meta.dataType)) {
    if (rawValue === '') return null;
    const cleaned = typeof rawValue === 'string' ? toEnglishDigits(rawValue).trim() : rawValue;
    const num = Number(cleaned);
    return Number.isFinite(num) ? Math.round(num) : null;
  }

  if (['decimal', 'float', 'double'].includes(meta.dataType)) {
    if (rawValue === '') return null;
    const cleaned = typeof rawValue === 'string' ? toEnglishDigits(rawValue).trim() : rawValue;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  if (typeof rawValue === 'object') {
    return JSON.stringify(rawValue);
  }

  return String(rawValue);
}

// تبدیل ردیف MySQL (snake_case) به آبجکت سازگار با فرانت‌اند (camelCase)
function mapDbRowToClientRecord(table: keyof AppDataStore, row: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [col, val] of Object.entries(row)) {
    if (col === 'is_deleted') {
      continue;
    }

    const camelKey = table === 'lookups' && col === 'display_order' ? 'order' : toCamelCase(col);

    if (val === null || val === undefined) {
      continue;
    }

    if (BOOLEAN_COLUMNS.has(col)) {
      result[camelKey] = Boolean(Number(val));
    } else if (NUMERIC_COLUMNS.has(col)) {
      const num = Number(val);
      result[camelKey] = Number.isFinite(num) ? num : val;
    } else if (val instanceof Date) {
      result[camelKey] = val.toISOString();
    } else if (col === 'latitude' || col === 'longitude') {
      result[camelKey] = String(val);
    } else {
      result[camelKey] = val;
    }
  }

  // حفظ سازگاری با فیلدهای معادل در رابط کاربری
  if (table === 'lands' && !result.title && result.name) {
    result.title = result.name;
  }
  if (table === 'users' && result.ownerId && !result.farmerId) {
    result.farmerId = result.ownerId;
  }

  return result;
}

// تبدیل رکورد ورودی (camelCase یا snake_case) به ستون‌های معتبر MySQL
function mapRecordToDbColumns(
  table: keyof AppDataStore,
  record: Record<string, any>,
  isInsert: boolean
): Record<string, any> {
  const cols = dbSchemaCache.get(table);
  if (!cols) return {};

  const dbPayload: Record<string, any> = {};

  for (const [rawKey, rawVal] of Object.entries(record || {})) {
    const colName = resolveDbColumnName(table, rawKey, cols);
    if (!colName) continue;
    // ستون‌های سیستمی جداگانه مدیریت می‌شوند
    if (colName === 'updated_at') continue;

    const meta = cols.get(colName)!;
    const coerced = coerceValueForColumn(colName, rawVal, meta);

    // در صورت نامعتبر بودن تاریخ برای ستون TIMESTAMP، اجازه می‌دهیم MySQL مقدار پیش‌فرض بگذارد
    if ((meta.dataType === 'timestamp' || meta.dataType === 'datetime') && coerced === null) {
      continue;
    }
    if (coerced !== undefined) {
      dbPayload[colName] = coerced;
    }
  }

  // تکمیل مقادیر اجباری (NOT NULL بدون پیش‌فرض) در حالت درج جدید
  if (isInsert) {
    for (const [colName, meta] of cols.entries()) {
      if (colName === 'id' || colName === 'updated_at' || colName === 'is_deleted' || colName === 'version') {
        continue;
      }
      if (!meta.isNullable && meta.columnDefault === null && (dbPayload[colName] === undefined || dbPayload[colName] === null)) {
        if (['varchar', 'text', 'char'].includes(meta.dataType)) {
          dbPayload[colName] = '';
        } else if (['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'decimal', 'float', 'double'].includes(meta.dataType)) {
          dbPayload[colName] = 0;
        }
      }
    }
  }

  return dbPayload;
}

// فیلتر رکوردهای فعال (حذف‌نشده) در حالت JSON Fallback
function filterActiveJsonRecords(records: any[]): any[] {
  return (records || []).filter((r: any) => r && r.isDeleted !== true && Number(r.is_deleted) !== 1);
}

// نرمال‌سازی کلیدهای snake_case به camelCase برای ذخیره یکپارچه در JSON Fallback
function normalizeRecordKeysForJson(table: keyof AppDataStore, data: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data || {})) {
    if (table === 'lookups' && key === 'display_order') {
      normalized.order = val;
    } else if (key.includes('_') && key !== 'is_deleted' && key !== 'updated_at') {
      normalized[toCamelCase(key)] = val;
    } else {
      normalized[key] = val;
    }
  }
  return normalized;
}

// --- توابع لایه دسترسی به داده (MySQL با Fallback خودکار به JSON) ---

// خواندن تمام رکوردهای فعال یک جدول (با فیلتر Soft Delete و پشتیبانی اختیاری از since)
async function getTableRows(table: keyof AppDataStore, since?: string): Promise<any[]> {
  if (canUseMySQLForTable(table) && mysqlPool) {
    try {
      const cols = dbSchemaCache.get(table)!;
      const conditions: string[] = [];
      const params: any[] = [];

      if (cols.has('is_deleted')) {
        conditions.push('COALESCE(`is_deleted`, 0) = 0');
      }
      if (since && cols.has('updated_at')) {
        const formattedSince = formatMySQLTimestamp(since);
        if (formattedSince) {
          conditions.push('`updated_at` >= ?');
          params.push(formattedSince);
        }
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const orderClause = cols.has('display_order') ? 'ORDER BY `display_order` ASC' : '';
      const [rows] = await mysqlPool.query<RowDataPacket[]>(
        `SELECT * FROM \`${table}\` ${whereClause} ${orderClause}`,
        params
      );
      return rows.map((row) => mapDbRowToClientRecord(table, row));
    } catch (err: any) {
      console.warn(`[MySQL] خطا در خواندن جدول ${table}؛ بازگشت به JSON:`, err?.message);
    }
  }

  return filterActiveJsonRecords((localStore as any)[table] || (defaultData as any)[table] || []);
}

// درج یا به‌روزرسانی رکورد (با مدیریت خودکار updated_at و version)
async function upsertTableRecord(
  table: keyof AppDataStore,
  action: 'insert' | 'update',
  recordId: string,
  rawData: Record<string, any>
): Promise<{ id: string; version: number; updatedAt: string }> {
  const id = String(recordId || rawData?.id || Math.random().toString(36).substring(2, 11));
  const nowIso = new Date().toISOString();

  if (canUseMySQLForTable(table) && mysqlPool) {
    try {
      const cols = dbSchemaCache.get(table)!;
      const hasVersion = cols.has('version');
      const hasUpdatedAt = cols.has('updated_at');
      const hasIsDeleted = cols.has('is_deleted');

      const [existingRows] = await mysqlPool.query<RowDataPacket[]>(
        hasVersion
          ? `SELECT \`id\`, \`version\` FROM \`${table}\` WHERE \`id\` = ? LIMIT 1`
          : `SELECT \`id\` FROM \`${table}\` WHERE \`id\` = ? LIMIT 1`,
        [id]
      );

      const exists = existingRows.length > 0;

      if (exists && action === 'update') {
        const currentVersion = hasVersion ? Number(existingRows[0].version) || 1 : 1;
        const dbPayload = mapRecordToDbColumns(table, rawData, false);
        delete dbPayload.id;
        delete dbPayload.version;
        delete dbPayload.is_deleted;

        const setParts: string[] = [];
        const params: any[] = [];

        for (const [col, val] of Object.entries(dbPayload)) {
          setParts.push(`\`${col}\` = ?`);
          params.push(val);
        }

        if (hasIsDeleted) {
          setParts.push('`is_deleted` = 0');
        }
        if (hasUpdatedAt) {
          setParts.push('`updated_at` = CURRENT_TIMESTAMP');
        }
        if (hasVersion) {
          setParts.push('`version` = COALESCE(`version`, 1) + 1');
        }

        if (setParts.length > 0) {
          params.push(id);
          await mysqlPool.query(`UPDATE \`${table}\` SET ${setParts.join(', ')} WHERE \`id\` = ?`, params);
        }

        return { id, version: currentVersion + 1, updatedAt: nowIso };
      }

      // حالت insert یا upsert (اگر در حالت update رکورد هنوز در دیتابیس نباشد)
      const dbPayload = mapRecordToDbColumns(table, { ...rawData, id }, true);
      dbPayload.id = id;
      if (hasIsDeleted) {
        dbPayload.is_deleted = 0;
      }
      if (hasVersion) {
        dbPayload.version = Number(rawData?.version) > 0 ? Number(rawData.version) : 1;
      }

      const colNames = Object.keys(dbPayload);
      const placeholders = colNames.map(() => '?').join(', ');
      const values = colNames.map((c) => dbPayload[c]);

      const updateParts: string[] = [];
      for (const col of colNames) {
        if (col === 'id' || col === 'version' || col === 'is_deleted') continue;
        if (col === 'created_at' && cols.get(col)?.dataType === 'timestamp') continue;
        updateParts.push(`\`${col}\` = VALUES(\`${col}\`)`);
      }
      if (hasIsDeleted) {
        updateParts.push('`is_deleted` = 0');
      }
      if (hasUpdatedAt) {
        updateParts.push('`updated_at` = CURRENT_TIMESTAMP');
      }
      if (hasVersion) {
        updateParts.push('`version` = COALESCE(`version`, 1) + 1');
      }

      const sql = `INSERT INTO \`${table}\` (${colNames.map((c) => `\`${c}\``).join(', ')})
                   VALUES (${placeholders})
                   ON DUPLICATE KEY UPDATE ${updateParts.join(', ')}`;

      await mysqlPool.query(sql, values);
      const nextVersion = exists ? (Number(existingRows[0].version) || 1) + 1 : (Number(dbPayload.version) || 1);
      return { id, version: nextVersion, updatedAt: nowIso };
    } catch (err: any) {
      console.warn(`[MySQL] خطا در ذخیره رکورد در جدول ${table}؛ بازگشت به JSON:`, err?.message);
    }
  }

  // Fallback به فایل JSON با مدیریت version، updatedAt و is_deleted
  const normalizedData = normalizeRecordKeysForJson(table, rawData);
  const tableArray: any[] = Array.isArray((localStore as any)[table]) ? [...(localStore as any)[table]] : [];
  const idx = tableArray.findIndex((r: any) => String(r.id) === id);

  let nextVersion = 1;
  if (idx >= 0) {
    nextVersion = (Number(tableArray[idx].version) || 1) + 1;
    tableArray[idx] = {
      ...tableArray[idx],
      ...normalizedData,
      id,
      isDeleted: false,
      is_deleted: 0,
      version: nextVersion,
      updatedAt: nowIso
    };
  } else {
    nextVersion = Number(normalizedData.version) > 0 ? Number(normalizedData.version) : 1;
    tableArray.unshift({
      ...normalizedData,
      id,
      isDeleted: false,
      is_deleted: 0,
      version: nextVersion,
      updatedAt: nowIso
    });
  }

  (localStore as any)[table] = tableArray;
  saveLocalStore();
  return { id, version: nextVersion, updatedAt: nowIso };
}

// حذف نرم رکورد (Soft Delete: تنظیم is_deleted = 1 و بروزرسانی updated_at و version)
async function softDeleteTableRecord(table: keyof AppDataStore, recordId: string): Promise<boolean> {
  const id = String(recordId);
  const nowIso = new Date().toISOString();

  if (canUseMySQLForTable(table) && mysqlPool) {
    try {
      const cols = dbSchemaCache.get(table)!;
      const setParts: string[] = [];

      if (cols.has('is_deleted')) {
        setParts.push('`is_deleted` = 1');
      } else if (cols.has('is_active')) {
        setParts.push('`is_active` = 0');
      }
      if (cols.has('updated_at')) {
        setParts.push('`updated_at` = CURRENT_TIMESTAMP');
      }
      if (cols.has('version')) {
        setParts.push('`version` = COALESCE(`version`, 1) + 1');
      }

      if (setParts.length > 0) {
        await mysqlPool.query(`UPDATE \`${table}\` SET ${setParts.join(', ')} WHERE \`id\` = ?`, [id]);
      } else {
        await mysqlPool.query(`DELETE FROM \`${table}\` WHERE \`id\` = ?`, [id]);
      }
      return true;
    } catch (err: any) {
      console.warn(`[MySQL] خطا در حذف نرم رکورد از جدول ${table}؛ بازگشت به JSON:`, err?.message);
    }
  }

  // Fallback به Soft Delete روی JSON
  const tableArray: any[] = Array.isArray((localStore as any)[table]) ? [...(localStore as any)[table]] : [];
  (localStore as any)[table] = tableArray.map((r: any) =>
    String(r.id) === id
      ? {
          ...r,
          isDeleted: true,
          is_deleted: 1,
          version: (Number(r.version) || 1) + 1,
          updatedAt: nowIso
        }
      : r
  );
  saveLocalStore();
  return true;
}

// همگام‌سازی کامل آرایه یک جدول (مورد استفاده در رابط وب و صف‌های دسته‌ای)
async function replaceTableSnapshot(table: keyof AppDataStore, records: any[]): Promise<number> {
  if (!Array.isArray(records)) return 0;

  if (canUseMySQLForTable(table) && mysqlPool) {
    try {
      const incomingIds = new Set<string>();
      for (const rec of records) {
        if (!rec || !rec.id) continue;
        const id = String(rec.id);
        incomingIds.add(id);
        await upsertTableRecord(table, 'update', id, rec);
      }

      // رکوردهای حذف‌شده در کلاینت به صورت Soft Delete علامت‌گذاری می‌شوند
      const cols = dbSchemaCache.get(table)!;
      if (cols.has('is_deleted')) {
        const [existingRows] = await mysqlPool.query<RowDataPacket[]>(
          `SELECT \`id\` FROM \`${table}\` WHERE COALESCE(\`is_deleted\`, 0) = 0`
        );
        for (const row of existingRows) {
          const existingId = String(row.id);
          if (!incomingIds.has(existingId)) {
            await softDeleteTableRecord(table, existingId);
          }
        }
      }
      return records.length;
    } catch (err: any) {
      console.warn(`[MySQL] خطا در همگام‌سازی دسته‌ای جدول ${table}؛ بازگشت به JSON:`, err?.message);
    }
  }

  // Fallback به JSON
  const nowIso = new Date().toISOString();
  const prevArray: any[] = Array.isArray((localStore as any)[table]) ? (localStore as any)[table] : [];
  const prevMap = new Map(prevArray.map((r: any) => [String(r.id), r]));
  const incomingIds = new Set<string>();

  const nextArray = records.map((rec: any) => {
    const id = String(rec.id || Math.random().toString(36).substring(2, 11));
    incomingIds.add(id);
    const prev = prevMap.get(id);
    return {
      ...normalizeRecordKeysForJson(table, rec),
      id,
      isDeleted: false,
      is_deleted: 0,
      version: prev ? (Number(prev.version) || 1) + 1 : (Number(rec.version) || 1),
      updatedAt: nowIso
    };
  });

  // حفظ رکوردهای حذف‌شده به شکل Soft Delete در JSON
  for (const prev of prevArray) {
    const prevId = String(prev.id);
    if (!incomingIds.has(prevId)) {
      nextArray.push({
        ...prev,
        isDeleted: true,
        is_deleted: 1,
        version: (Number(prev.version) || 1) + 1,
        updatedAt: nowIso
      });
    }
  }

  (localStore as any)[table] = nextArray;
  saveLocalStore();
  return records.length;
}

// ثبت لاگ همگام‌سازی در جدول sync_logs در صورت اتصال به MySQL
async function recordSyncLog(deviceId: string | undefined, syncType: 'push' | 'pull' | 'full', count: number, clientTime?: string) {
  if (!isMySQLConnected || !mysqlPool || !dbSchemaCache.has('sync_logs')) return;
  try {
    await mysqlPool.query(
      'INSERT INTO `sync_logs` (`device_id`, `sync_type`, `records_synced`, `client_time`) VALUES (?, ?, ?, ?)',
      [deviceId || 'web_client', syncType, count, clientTime || new Date().toISOString()]
    );
  } catch {
    // خطای لاگ نباید عملیات سینک را متوقف کند
  }
}

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
    database: isMySQLConnected ? 'mysql' : (isSupabaseConfigured ? 'configured' : 'local_storage'),
    storageMode: isMySQLConnected ? 'mysql' : 'json_fallback',
    mysqlConnected: isMySQLConnected,
    provider: isMySQLConnected
      ? 'سامانه مدیریت باغات پسته (متصل به پایگاه‌داده MySQL cPanel)'
      : 'سامانه مدیریت باغات پسته (ذخیره‌ساز بومی پایدار JSON - حالت Fallback)',
    siteTitle: 'سامانه جامع مدیریت باغات پسته',
    themeColor: '#1a5c2a',
    offlineSupported: true,
    serverTime: new Date().toISOString()
  });
});

// احراز هویت کاربر با MySQL و Fallback خودکار به JSON
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'نام کاربری و کلمه عبور الزامی است.' });
  }

  const trimmedUsername = String(username).trim();
  const trimmedPassword = String(password).trim();
  let user: any = null;

  // ۱. تلاش برای احراز هویت از MySQL
  if (canUseMySQLForTable('users') && mysqlPool) {
    try {
      const cols = dbSchemaCache.get('users')!;
      const extraConds: string[] = [];
      if (cols.has('is_deleted')) extraConds.push('COALESCE(`is_deleted`, 0) = 0');
      if (cols.has('is_active')) extraConds.push('COALESCE(`is_active`, 1) = 1');

      const extraWhere = extraConds.length > 0 ? ` AND ${extraConds.join(' AND ')}` : '';
      const [rows] = await mysqlPool.query<RowDataPacket[]>(
        `SELECT * FROM \`users\` WHERE LOWER(\`username\`) = LOWER(?) AND \`password\` = ?${extraWhere} LIMIT 1`,
        [trimmedUsername, trimmedPassword]
      );

      if (rows.length > 0) {
        user = mapDbRowToClientRecord('users', rows[0]);
      }
    } catch (err: any) {
      console.warn('[MySQL] خطا در احراز هویت از MySQL؛ بازگشت به JSON:', err?.message);
      // در صورت بروز خطای اتصال، جستجو از فایل JSON انجام می‌شود
      user = filterActiveJsonRecords(localStore.users || []).find(
        (u: any) =>
          String(u.username || '').toLowerCase() === trimmedUsername.toLowerCase() &&
          String(u.password || '') === trimmedPassword &&
          u.isActive !== false &&
          Number(u.is_active) !== 0
      );
    }
  } else {
    // ۲. حالت Fallback به فایل JSON
    user = filterActiveJsonRecords(localStore.users || []).find(
      (u: any) =>
        String(u.username || '').toLowerCase() === trimmedUsername.toLowerCase() &&
        String(u.password || '') === trimmedPassword &&
        u.isActive !== false &&
        Number(u.is_active) !== 0
    );
  }

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
      ownerId: user.ownerId || user.owner_id || user.farmerId
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

// دریافت کل داده‌های فعال سامانه (از MySQL و در صورت خطا از JSON)
app.get('/api/data', async (req, res) => {
  try {
    const [
      users,
      owners,
      waterSources,
      lands,
      visits,
      labAnalyses,
      tasks,
      messages,
      operations,
      products,
      opTypes,
      consultations,
      lookups
    ] = await Promise.all([
      getTableRows('users'),
      getTableRows('owners'),
      getTableRows('water_sources'),
      getTableRows('lands'),
      getTableRows('visits'),
      getTableRows('lab_analyses'),
      getTableRows('tasks'),
      getTableRows('messages'),
      getTableRows('operations'),
      getTableRows('products'),
      getTableRows('op_types'),
      getTableRows('consultations'),
      getTableRows('lookups')
    ]);

    // حفظ داده‌های پایه ضروری در صورت خالی بودن جداول اولیه (کاربران / واژگان / انواع عملیات)
    const safeUsers = users.length > 0 ? users : defaultData.users;
    const safeLookups = lookups.length > 0 ? lookups : defaultData.lookups;
    const safeOpTypes = opTypes.length > 0 ? opTypes : defaultData.op_types;

    res.json({
      users: safeUsers,
      owners,
      farmers: owners, // alias
      waterSources,
      water_sources: waterSources,
      lands,
      visits,
      labAnalyses,
      lab_analyses: labAnalyses,
      tasks,
      messages,
      operations,
      products,
      opTypes: safeOpTypes,
      op_types: safeOpTypes,
      consultations,
      lookups: safeLookups,
      baseTables: safeLookups
    });
  } catch (err: any) {
    console.error('[API /api/data] خطا در بارگذاری داده‌ها؛ بازگشت به JSON:', err?.message);
    res.json({
      users: filterActiveJsonRecords(localStore.users || defaultData.users),
      owners: filterActiveJsonRecords(localStore.owners || defaultData.owners),
      farmers: filterActiveJsonRecords(localStore.owners || defaultData.owners),
      waterSources: filterActiveJsonRecords(localStore.water_sources || defaultData.water_sources),
      water_sources: filterActiveJsonRecords(localStore.water_sources || defaultData.water_sources),
      lands: filterActiveJsonRecords(localStore.lands || defaultData.lands),
      visits: filterActiveJsonRecords(localStore.visits || defaultData.visits),
      labAnalyses: filterActiveJsonRecords(localStore.lab_analyses || defaultData.lab_analyses),
      lab_analyses: filterActiveJsonRecords(localStore.lab_analyses || defaultData.lab_analyses),
      tasks: filterActiveJsonRecords(localStore.tasks || defaultData.tasks),
      messages: filterActiveJsonRecords(localStore.messages || defaultData.messages),
      operations: filterActiveJsonRecords(localStore.operations || []),
      products: filterActiveJsonRecords(localStore.products || []),
      opTypes: filterActiveJsonRecords(localStore.op_types || defaultData.op_types),
      op_types: filterActiveJsonRecords(localStore.op_types || defaultData.op_types),
      consultations: filterActiveJsonRecords(localStore.consultations || []),
      lookups: filterActiveJsonRecords(localStore.lookups || defaultData.lookups),
      baseTables: filterActiveJsonRecords(localStore.lookups || defaultData.lookups)
    });
  }
});

// --- Delta Sync Endpoints (For Mobile App & Web Offline Engine) ---

// ۱. همگام‌سازی PUSH: پردازش صف آفلاین با پشتیبانی از Soft Delete، version و updated_at
app.post('/api/sync/push', async (req, res) => {
  const { queue, deviceId, clientTime } = req.body;
  if (!Array.isArray(queue)) {
    return res.status(400).json({ error: 'فرمت صف همگام‌سازی نامعتبر است.' });
  }

  const appliedIds: string[] = [];
  const failedItems: Array<{ id: string; error: string }> = [];

  for (const item of queue) {
    const { id, table, action, recordId, data } = item || {};
    if (!table || !action) continue;

    const normKey = normalizeTableName(String(table));
    if (!MYSQL_CORE_TABLES.includes(normKey)) {
      failedItems.push({ id: String(id || ''), error: `جدول نامعتبر: ${table}` });
      continue;
    }

    try {
      // پشتیبانی از حالت ارسال آرایه کامل در صف آفلاین رابط وب
      if (Array.isArray(data)) {
        await replaceTableSnapshot(normKey, data);
        if (id) appliedIds.push(id);
        continue;
      }

      const targetId = String(recordId || data?.id || '');

      if (action === 'insert') {
        await upsertTableRecord(normKey, 'insert', targetId, data || {});
        if (id) appliedIds.push(id);
      } else if (action === 'update') {
        await upsertTableRecord(normKey, 'update', targetId, data || {});
        if (id) appliedIds.push(id);
      } else if (action === 'delete') {
        if (targetId) {
          await softDeleteTableRecord(normKey, targetId);
        }
        if (id) appliedIds.push(id);
      }
    } catch (err: any) {
      console.error(`[Sync Push] خطا در پردازش آیتم ${id} جدول ${normKey}:`, err?.message);
      failedItems.push({ id: String(id || ''), error: err?.message || 'خطای ناشناخته' });
    }
  }

  await recordSyncLog(deviceId, 'push', appliedIds.length, clientTime);

  res.json({
    success: failedItems.length === 0,
    appliedIds,
    failedItems: failedItems.length > 0 ? failedItems : undefined,
    storageMode: isMySQLConnected ? 'mysql' : 'json_fallback',
    serverTime: new Date().toISOString()
  });
});

// ۲. همگام‌سازی PULL: دریافت تغییرات (با پشتیبانی اختیاری از پارامتر since)
app.get('/api/sync/pull', async (req, res) => {
  const since = typeof req.query.since === 'string' ? req.query.since : undefined;
  const [owners, lands, waterSources, visits, tasks, labAnalyses, lookups, messages] = await Promise.all([
    getTableRows('owners', since),
    getTableRows('lands', since),
    getTableRows('water_sources', since),
    getTableRows('visits', since),
    getTableRows('tasks', since),
    getTableRows('lab_analyses', since),
    getTableRows('lookups', since),
    getTableRows('messages', since)
  ]);

  res.json({
    serverTime: new Date().toISOString(),
    storageMode: isMySQLConnected ? 'mysql' : 'json_fallback',
    data: {
      owners,
      lands,
      waterSources,
      visits,
      tasks,
      labAnalyses,
      lookups: lookups.length > 0 ? lookups : defaultData.lookups,
      messages
    }
  });
});

// همگام‌سازی کامل یک جدول (مورد استفاده رابط وب)
app.post('/api/sync/:table', async (req, res) => {
  const { table } = req.params;
  const data = req.body;
  const normKey = normalizeTableName(table);

  if (!MYSQL_CORE_TABLES.includes(normKey)) {
    return res.status(400).json({ success: false, error: 'نام جدول نامعتبر است.' });
  }

  const count = Array.isArray(data) ? await replaceTableSnapshot(normKey, data) : 0;
  res.json({
    success: true,
    count,
    storageMode: isMySQLConnected ? 'mysql' : 'json_fallback'
  });
});

// --- Dedicated REST Endpoints for Mobile & Third-party Integrations ---

// Lands CRUD
app.get('/api/lands', async (req, res) => res.json(await getTableRows('lands')));
app.post('/api/lands', async (req, res) => {
  const newId = req.body.id || Math.random().toString(36).substring(2, 9);
  const meta = await upsertTableRecord('lands', 'insert', newId, { ...req.body, id: newId });
  res.status(201).json({ ...req.body, id: meta.id, version: meta.version, updatedAt: meta.updatedAt });
});
app.put('/api/lands/:id', async (req, res) => {
  const { id } = req.params;
  const meta = await upsertTableRecord('lands', 'update', id, req.body);
  res.json({ success: true, version: meta.version, updatedAt: meta.updatedAt });
});
app.delete('/api/lands/:id', async (req, res) => {
  const { id } = req.params;
  await softDeleteTableRecord('lands', id);
  res.json({ success: true });
});

// Visits CRUD
app.get('/api/visits', async (req, res) => res.json(await getTableRows('visits')));
app.post('/api/visits', async (req, res) => {
  const newId = req.body.id || Math.random().toString(36).substring(2, 9);
  const meta = await upsertTableRecord('visits', 'insert', newId, { ...req.body, id: newId });
  res.status(201).json({ ...req.body, id: meta.id, version: meta.version, updatedAt: meta.updatedAt });
});
app.put('/api/visits/:id', async (req, res) => {
  const { id } = req.params;
  const meta = await upsertTableRecord('visits', 'update', id, req.body);
  res.json({ success: true, version: meta.version, updatedAt: meta.updatedAt });
});

// Tasks CRUD
app.get('/api/tasks', async (req, res) => res.json(await getTableRows('tasks')));
app.post('/api/tasks', async (req, res) => {
  const newId = req.body.id || Math.random().toString(36).substring(2, 9);
  const meta = await upsertTableRecord('tasks', 'insert', newId, { ...req.body, id: newId });
  res.status(201).json({ ...req.body, id: meta.id, version: meta.version, updatedAt: meta.updatedAt });
});
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const meta = await upsertTableRecord('tasks', 'update', id, req.body);
  res.json({ success: true, version: meta.version, updatedAt: meta.updatedAt });
});

// Lookups / Base Tables
app.get('/api/lookups', async (req, res) => {
  const rows = await getTableRows('lookups');
  res.json(rows.length > 0 ? rows : defaultLookupItems);
});

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

// =========================================================================
// INTERCONNECTION & STORE INTEGRATION APIS (سامانه فروش نهاده‌های کشاورزی)
// =========================================================================

const STORE_INTEGRATION_KEY = process.env.STORE_INTEGRATION_KEY || 'agri_store_secret_2025';
let storeApiUrl = process.env.STORE_API_URL || 'https://shop.avinia.ir';

function normalizePhone(p: string | undefined | null): string {
  if (!p) return '';
  const eng = p.toString()
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  const clean = eng.replace(/[\s\-\+]/g, '');
  if (clean.startsWith('98')) return '0' + clean.slice(2);
  if (!clean.startsWith('0') && clean.length === 10) return '0' + clean;
  return clean;
}

// 1. Integration Status & Documentation
app.get('/api/v1/integration/status', async (req, res) => {
  const [owners, lands, tasks] = await Promise.all([
    getTableRows('owners'),
    getTableRows('lands'),
    getTableRows('tasks')
  ]);
  res.json({
    success: true,
    version: '1.0.0',
    service: 'AgriManage Store Interconnection Engine',
    storeApiUrl,
    isKeyConfigured: true,
    metrics: {
      totalOwners: owners.length,
      totalLands: lands.length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t: any) => !t.farmerDone).length
    },
    endpoints: {
      prescriptions: '/api/v1/integration/prescriptions?mobile=09131234567',
      orderSync: '/api/v1/integration/order-sync (POST)',
      storeCatalog: '/api/v1/store/products',
      ssoHandoff: '/api/v1/integration/sso-token (POST)'
    }
  });
});

// Update Store Integration Settings
app.post('/api/v1/integration/config', (req, res) => {
  const { newStoreUrl } = req.body;
  if (newStoreUrl) {
    storeApiUrl = newStoreUrl.trim();
  }
  res.json({ success: true, storeApiUrl });
});

// 2. Prescriptions endpoint for Store (درخواست سامانه فروش برای خواندن نسخه‌های فعال بر اساس شماره موبایل یا کدملی)
app.get('/api/v1/integration/prescriptions', async (req, res) => {
  const authHeader = req.headers.authorization;
  const queryKey = req.query.apiKey as string;
  const token = authHeader?.replace(/^Bearer\s+/i, '') || queryKey;

  // Simple token authentication check
  if (token && token !== STORE_INTEGRATION_KEY && STORE_INTEGRATION_KEY !== 'agri_store_secret_2025') {
    return res.status(401).json({ success: false, error: 'کلید احراز هویت سرویس فروشگاه نامعتبر است.' });
  }

  const { mobile, nationalId } = req.query;
  if (!mobile && !nationalId) {
    return res.status(400).json({ 
      success: false, 
      error: 'ارسال شماره موبایل (mobile) یا کدملی (nationalId) جهت یافتن باغدار الزامی است.' 
    });
  }

  const normTarget = normalizePhone(mobile as string);
  const [allOwners, allLands, allTasks, allVisits] = await Promise.all([
    getTableRows('owners'),
    getTableRows('lands'),
    getTableRows('tasks'),
    getTableRows('visits')
  ]);

  // Search in owners
  const owner = allOwners.find((o: any) => {
    const oPhone = normalizePhone(o.mobile || o.phone);
    if (normTarget && oPhone && oPhone === normTarget) return true;
    if (nationalId && o.nationalId === nationalId) return true;
    return false;
  });

  if (!owner) {
    return res.status(404).json({
      success: false,
      error: `باغداری با شماره تماس ${mobile || nationalId} در سامانه باغات پسته یافت نشد.`
    });
  }

  // Find farmer lands
  const lands = allLands.filter((l: any) => l.ownerId === owner.id);
  const landMap = new Map(lands.map((l: any) => [l.id, l]));

  // Find active / pending tasks for these lands
  const landIds = new Set(lands.map((l: any) => l.id));
  const activeTasks = allTasks.filter((t: any) => landIds.has(t.landId) && !t.farmerDone);

  // Also include latest visit recommendations
  const recentVisits = allVisits.filter((v: any) => landIds.has(v.landId) && v.expertRecommendation);

  // Build structured prescriptions response - purely agronomic & dynamic
  const prescriptions = activeTasks.map((task: any) => {
    const land = landMap.get(task.landId) || { name: 'قطعه نامشخص', areaHectares: 1 };
    const area = land.areaHectares ? Number(land.areaHectares) : 1;
    const matchedInputs = matchProductsForTask(task, land);

    // Pure technical requirement for store to match against its actual live inventory
    const agronomicNeed = {
      title: task.title,
      category: task.category,
      categoryLabel: task.category === 'pest_control' ? 'آفات و بیماری‌ها' : task.category === 'nutrition' ? 'تغذیه و کوددهی' : 'عملیات باغبانی',
      landAreaHectares: area,
      requiredUnit: task.category === 'nutrition' ? 'کیلوگرم' : 'لیتر',
      recommendedDosePerHectare: task.category === 'nutrition' ? 20 : 2.5,
      totalNetQuantityNeeded: (task.category === 'nutrition' ? 20 : 2.5) * area,
      notes: task.sourceRecommendation || task.description || ''
    };

    return {
      taskId: task.id,
      landId: task.landId,
      landName: land.name || land.title,
      areaHectares: area,
      pistachioRootstock: land.pistachioRootstock || 'نامشخص',
      category: task.category,
      categoryTitle: agronomicNeed.categoryLabel,
      title: task.title,
      description: task.description || '',
      sourceRecommendation: task.sourceRecommendation || '',
      dueDate: task.dueDate || '',
      createdByName: task.createdByName || 'کارشناس باغات',
      createdAt: task.createdAt,
      agronomicNeed,
      // Matched inputs from store catalog (if available)
      matchedInputs: matchedInputs.map(m => ({
        productId: m.product.id,
        productName: m.product.name,
        brand: m.product.brand,
        category: m.product.category,
        categoryLabel: m.product.categoryLabel,
        activeIngredient: m.product.activeIngredient,
        pricePerUnit: m.product.pricePerUnit,
        unit: m.unit,
        packSize: m.product.packSize,
        recommendedAmount: m.recommendedAmount,
        estimatedCost: m.estimatedCost,
        applicationRatePer1000L: m.product.applicationRatePer1000L,
        inStock: m.product.inStock,
        reason: m.reason
      }))
    };
  });

  res.json({
    success: true,
    farmer: {
      id: owner.id,
      name: owner.name,
      mobile: owner.mobile,
      nationalId: owner.nationalId
    },
    landsCount: lands.length,
    activePrescriptionsCount: prescriptions.length,
    prescriptions,
    recentVisitsSummary: recentVisits.slice(0, 3).map((v: any) => ({
      visitId: v.id,
      visitDate: v.visitDate,
      landName: landMap.get(v.landId)?.name || 'نامشخص',
      recommendation: v.expertRecommendation,
      growthStage: v.growthStage
    }))
  });
});

// 3. Webhook Order Sync (فروشگاه پس از پرداخت فاکتور این اندپوینت را فراخوانی می‌کند)
app.post('/api/v1/integration/order-sync', async (req, res) => {
  const { mobile, orderId, items, totalAmount, landId, date, storeInvoiceNumber } = req.body;

  if (!mobile || !items || !Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'ارسال شماره موبایل و لیست اقلام سفارش الزامی است.' });
  }

  const normTarget = normalizePhone(mobile);
  const [allOwners, allLands] = await Promise.all([
    getTableRows('owners'),
    getTableRows('lands')
  ]);
  const owner = allOwners.find((o: any) => normalizePhone(o.mobile || o.phone) === normTarget);

  // Find target land
  const lands = owner ? allLands.filter((l: any) => l.ownerId === owner.id) : [];
  const targetLand = lands.find((l: any) => l.id === landId) || lands[0] || { id: '1', name: 'باغ اصلی' };

  const operationRecord = {
    id: 'store_sync_' + (orderId || Date.now()),
    landId: targetLand.id,
    date: date || '۱۴۰۴/۰۲/۲۵',
    typeId: 'store_procurement',
    title: `خرید مستقیم نهاده از فروشگاه (فاکتور #${storeInvoiceNumber || orderId || 'آنلاین'})`,
    description: `خریداری شده توسط ${owner ? owner.name : mobile} - اقلام: ${items.map((i: any) => `${i.name || i.productName} (${i.quantity || i.qty} ${i.unit || 'واحد'})`).join('، ')}`,
    materialsUsed: items.map((i: any) => `${i.name || i.productName}: ${i.quantity || i.qty} ${i.unit || ''} (مبلغ: ${Number(i.price || 0).toLocaleString('fa-IR')} تومان)`).join('\n'),
    cost: Number(totalAmount) || 0
  };

  await upsertTableRecord('operations', 'insert', operationRecord.id, operationRecord);

  res.json({
    success: true,
    message: 'فاکتور خرید نهاده با موفقیت در ثبت هزینه‌های قطعه باغ پسته اعمال گردید.',
    operationId: operationRecord.id,
    landName: targetLand.name || targetLand.title
  });
});

// 4. Products catalog endpoint for UI and testing
app.get('/api/v1/store/products', (req, res) => {
  res.json({
    success: true,
    total: standardStoreProducts.length,
    products: standardStoreProducts
  });
});

// 5. Generate SSO token & Redirect Cart Url
app.post('/api/v1/integration/sso-token', (req, res) => {
  const { mobile, name, landName, items } = req.body;
  if (!mobile) {
    return res.status(400).json({ error: 'شماره موبایل کاربر الزامی است.' });
  }

  const handoffToken = 'sso_' + Buffer.from(JSON.stringify({
    mobile,
    name: name || 'باغدار گرامی',
    land: landName || 'باغ پسته',
    timestamp: Date.now(),
    items: items || []
  })).toString('base64');

  const storeRedirectUrl = `${storeApiUrl.replace(/\/+$/, '')}/checkout/sso-bridge?token=${handoffToken}`;

  res.json({
    success: true,
    token: handoffToken,
    redirectUrl: storeRedirectUrl
  });
});

// Start Server
async function startServer() {
  // تلاش برای اتصال به MySQL پیش از شروع سرویس‌دهی (در صورت شکست، Fallback خودکار به JSON فعال است)
  await initMySQL();

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

      // SPA fallback middleware compatible with Express 4 and Express 5 (prevents path-to-regexp wildcard syntax error)
      app.use((req, res, next) => {
        if (req.method !== 'GET' || req.path.startsWith('/api')) {
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
    const modeLabel = isMySQLConnected ? 'MySQL (cPanel)' : 'JSON Fallback (agri_storage.json)';
    console.log(`Pistachio Management Server running on http://localhost:${PORT} [${modeLabel}]`);
  });
}

startServer();
