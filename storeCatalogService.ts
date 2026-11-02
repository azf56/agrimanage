import { Task, Land, StoreProduct, MatchedStoreInput } from './types';

// کاتالوگ استاندارد نهاده‌های تخصصی باغات پسته (تطبیق داده شده با بازار نهاده کشاورزی ایران)
export const standardStoreProducts: StoreProduct[] = [
  {
    id: 'prod_polygan_soap',
    name: 'صابون محلول‌پاشی ارگانیک پالیگان (گالن ۲۰ لیتری)',
    brand: 'کیمیا شیمی / Polygan',
    category: 'pesticide',
    categoryLabel: 'شوینده و آفت‌کش ارگانیک',
    activeIngredient: 'Potassium Salts of Fatty Acids (صابون پتاسیمی)',
    packSize: 'گالن ۲۰ لیتری',
    pricePerUnit: 1850000,
    unit: 'گالن',
    applicationRatePer1000L: '۲ الی ۲.۵ لیتر در ۱۰۰۰ لیتر آب',
    standardRatePerHectare: 2.5, // لیتر در هکتار
    inStock: true,
    stockCount: 45,
    description: 'شستشوی مؤثر عسلک پسیل و از بین بردن پوره‌های سنین اولیه بدون ایجاد مقاومت دارویی و بدون دوره کارنس.',
    matchingKeywords: ['صابون', 'پالیگان', 'پسیل', 'شیره', 'عسلک', 'شستشو', 'شوینده']
  },
  {
    id: 'prod_cal_bor',
    name: 'کلات کلسیم-بور مایع غلیظ (Cal-Bor)',
    brand: 'اگروسولوشن / AgroSolution',
    category: 'nutrition',
    categoryLabel: 'کود تقویتی و ضد لکه',
    activeIngredient: 'Calcium 12% + Boron 2% (کلسیم و بور کمپلکس شده)',
    packSize: 'بطری ۵ لیتری',
    pricePerUnit: 1450000,
    unit: 'بطری ۵ لیتری',
    applicationRatePer1000L: '۲ لیتر در ۱۰۰۰ لیتر آب',
    standardRatePerHectare: 2.0, // لیتر در هکتار
    inStock: true,
    stockCount: 60,
    description: 'استحکام دیواره سلولی پوست استخوانی، جلوگیری از لکه پوست استخوانی و سقط جنین و سرسیاهی دانه پسته.',
    matchingKeywords: ['کلسیم', 'بور', 'پوست استخوانی', 'سرسیاهی', 'لکه', 'calcium', 'boron']
  },
  {
    id: 'prod_k2so4_soluble',
    name: 'سولفات پتاسیم محلول در آب (سولپات ۵۰٪ K2O)',
    brand: 'تسکو / Tessenderlo بلژیک',
    category: 'nutrition',
    categoryLabel: 'کود پرکننده مغز',
    activeIngredient: 'Potassium Sulfate (K2O 50% + S 18%)',
    packSize: 'کیسه ۲۵ کیلوگرمی',
    pricePerUnit: 2950000,
    unit: 'کیسه ۲۵ کیلویی',
    applicationRatePer1000L: '۵ کیلوگرم در ۱۰۰۰ لیتر محلول‌پاشی یا ۲۵ کیلوگرم در هکتار همراه آب آبیاری',
    standardRatePerHectare: 15, // کیلوگرم در هکتار
    inStock: true,
    stockCount: 120,
    description: 'تسریع و بهبود پر شدن مغز پسته، افزایش وزن صد دانه و کاهش درصد پوکی و دهان‌بستگی.',
    matchingKeywords: ['پتاسیم', 'سولفات پتاسیم', 'سولپات', 'پر شدن مغز', 'خندانی', 'پتاس']
  },
  {
    id: 'prod_zn_chelate',
    name: 'کود کلات روی ۱۴٪ EDTA ویژه پسته',
    brand: 'پلنت فید / PlantFeed',
    category: 'nutrition',
    categoryLabel: 'کود ریزمغذی برگی',
    activeIngredient: 'Zinc EDTA 14%',
    packSize: 'بسته ۱ کیلوگرمی',
    pricePerUnit: 420000,
    unit: 'بسته ۱ کیلویی',
    applicationRatePer1000L: '۱ تا ۱.۵ کیلوگرم در ۱۰۰۰ لیتر آب',
    standardRatePerHectare: 1.2,
    inStock: true,
    stockCount: 85,
    description: 'رفع عارضه جارویی شدن (روست)، بهبود اندازه برگچه‌ها و تحریک تمایز جوانه‌های زایشی سال بعد.',
    matchingKeywords: ['روی', 'زنک', 'zn', 'زینک', 'روزت', 'کلات روی', 'جارویی']
  },
  {
    id: 'prod_enidor_mite',
    name: 'کنه‌کش تخصصی انویدور (اسپیرودیکلوفن ۲۴۰ SC)',
    brand: 'بایر آلمان / Bayer',
    category: 'pesticide',
    categoryLabel: 'سموم دفع آفات',
    activeIngredient: 'Spirodiclofen 240 g/L',
    packSize: 'بطری ۱ لیتری',
    pricePerUnit: 2100000,
    unit: 'لیتر',
    applicationRatePer1000L: '۰.۴ الی ۰.۵ لیتر در ۱۰۰۰ لیتر آب',
    standardRatePerHectare: 0.5,
    inStock: true,
    stockCount: 30,
    description: 'کنترل قطعی انواع کنه‌های زنگار و تارتن پسته در تمامی مراحل رشدی تخم، پوره و حشره بالغ.',
    matchingKeywords: ['کنه', 'انویدور', 'اسپیرودیکلوفن', 'زنگار', 'تارتن', 'تار عنکبوتی']
  },
  {
    id: 'prod_seaweed_extract',
    name: 'عصاره خالص جلبک دریایی آسکوفیلوم (Ascophyllum)',
    brand: 'آلگارین / AlgaRin',
    category: 'nutrition',
    categoryLabel: 'محرک رشد و ضد تنش',
    activeIngredient: 'Ascophyllum Nodosum Extract 100% + Betaines',
    packSize: 'بطری ۱ لیتری',
    pricePerUnit: 890000,
    unit: 'لیتر',
    applicationRatePer1000L: '۱ الی ۱.۵ لیتر در ۱۰۰۰ لیتر آب',
    standardRatePerHectare: 1.2,
    inStock: true,
    stockCount: 50,
    description: 'افزایش مقاومت درخت به تنش‌های گرمایی تابستان و خشکی، تسریع جذب عناصر غذایی در کنار کلسیم و روی.',
    matchingKeywords: ['جلبک', 'دریایی', 'آسکوفیلوم', 'ضد تنش', 'محرک رشد', 'آمینو اسید', 'تنش گرمایی']
  },
  {
    id: 'prod_kaolin_powder',
    name: 'پودر کائولین میکرونیزه فرآوری‌شده (پوشش ضد گرمازدگی)',
    brand: 'سپید پوشش پارس / Kaolin WP',
    category: 'pesticide',
    categoryLabel: 'حفاظتی و دافع فیزیکی',
    activeIngredient: 'Processed Aluminum Silicate 95%',
    packSize: 'کیسه ۲۵ کیلوگرمی',
    pricePerUnit: 850000,
    unit: 'کیسه ۲۵ کیلویی',
    applicationRatePer1000L: '۴۰ تا ۵۰ کیلوگرم در ۱۰۰۰ لیتر آب',
    standardRatePerHectare: 40,
    inStock: true,
    stockCount: 70,
    description: 'ایجاد پوشش سفید بازتابنده روی تاج درخت، کاهش دمای برگ تا ۵ درجه و مهار تخم‌ریزی پسیل پسته.',
    matchingKeywords: ['کائولین', 'ضد آفتاب', 'آفتاب سوختگی', 'گرمازدگی', 'سفید کننده', 'دافع']
  },
  {
    id: 'prod_sulfur_liquid',
    name: 'گوگرد مایع حشره‌کش و قارچ‌کش پالایشگاهی',
    brand: 'گوگرد آریا / Liquid Sulfur',
    category: 'pesticide',
    categoryLabel: 'ترکیبات گوگردی',
    activeIngredient: 'Elemental Sulfur 80% micronized',
    packSize: 'گالن ۲۰ لیتری',
    pricePerUnit: 1650000,
    unit: 'گالن ۲۰ لیتری',
    applicationRatePer1000L: '۳ لیتر در ۱۰۰۰ لیتر آب',
    standardRatePerHectare: 3.0,
    inStock: true,
    stockCount: 35,
    description: 'کنترل کنه و دورکننده حشرات مکنده، اصلاح سطحی خاک و ضدعفونی اندام‌های هوایی درخت.',
    matchingKeywords: ['گوگرد', 'سولفور', 'سولفوریک', 'قارچ', 'ضدعفونی']
  }
];

/**
 * بررسی هوشمند و تطبیق نهاده‌های فروشگاه بر اساس شرح وظیفه، توصیه کارشناس و مساحت قطعه باغ
 */
export function matchProductsForTask(task: Task, land?: Land): MatchedStoreInput[] {
  const content = `${task.title || ''} ${task.description || ''} ${task.sourceRecommendation || ''}`.toLowerCase();
  const area = land?.areaHectares ? Number(land.areaHectares) : 1;

  const matched: MatchedStoreInput[] = [];

  for (const product of standardStoreProducts) {
    const isKeywordMatched = product.matchingKeywords.some(kw => content.includes(kw.toLowerCase()));
    const isCategoryMatched = (task.category === 'pest_control' && product.category === 'pesticide') ||
                              (task.category === 'nutrition' && product.category === 'nutrition');

    if (isKeywordMatched) {
      // محاسبه میزان مورد نیاز بر اساس مساحت هکتار باغ
      const rawAmount = Math.max(1, Math.round(product.standardRatePerHectare * area * 10) / 10);
      
      let unitLabel = 'لیتر / کیلوگرم';
      if (product.unit.includes('گالن')) unitLabel = 'لیتر';
      else if (product.unit.includes('کیسه')) unitLabel = 'کیلوگرم';
      else if (product.unit.includes('بطری') || product.unit.includes('لیتر')) unitLabel = 'لیتر';
      else if (product.unit.includes('بسته')) unitLabel = 'کیلوگرم';

      // محاسبه برآورد هزینه حدودی
      let estimatedCost = 0;
      if (product.unit.includes('۲۰')) {
        const galons = Math.ceil(rawAmount / 20);
        estimatedCost = galons * product.pricePerUnit;
      } else if (product.unit.includes('۲۵')) {
        const bags = Math.ceil(rawAmount / 25);
        estimatedCost = bags * product.pricePerUnit;
      } else if (product.unit.includes('۵')) {
        const bottles = Math.ceil(rawAmount / 5);
        estimatedCost = bottles * product.pricePerUnit;
      } else {
        estimatedCost = Math.ceil(rawAmount) * product.pricePerUnit;
      }

      matched.push({
        product,
        recommendedAmount: rawAmount,
        unit: unitLabel,
        estimatedCost,
        reason: `تطبیق با توصیه: "${task.title}" (مساحت ${area} هکتار)`
      });
    }
  }

  // اگر هیچ تطبیق کلمه‌ای نبود اما دسته‌بندی وجود داشت، بر اساس دسته‌بندی ۱ محصول پیش‌فرض ارائه شود
  if (matched.length === 0) {
    const fallbackProduct = task.category === 'pest_control' 
      ? standardStoreProducts[0] // صابون پالیگان
      : task.category === 'nutrition'
      ? standardStoreProducts[1] // کلسیم بور
      : null;

    if (fallbackProduct) {
      const rawAmount = Math.max(1, Math.round(fallbackProduct.standardRatePerHectare * area * 10) / 10);
      matched.push({
        product: fallbackProduct,
        recommendedAmount: rawAmount,
        unit: 'لیتر',
        estimatedCost: Math.ceil(rawAmount) * fallbackProduct.pricePerUnit,
        reason: `پیشنهاد پایه دسته‌بندی ${task.category === 'pest_control' ? 'آفات' : 'تغذیه'}`
      });
    }
  }

  return matched;
}

/**
 * ایجاد توکن و لینک انتقال سبد به سامانه فروش نهاده‌ها (SSO & Cart Link Generator)
 */
export function generateStoreCartRedirectUrl(
  storeUrl: string,
  userMobile: string,
  userName: string,
  landName: string,
  items: Array<{ productId: string; productName: string; quantity: number; unit: string; price: number }>
): string {
  const baseUrl = storeUrl ? storeUrl.replace(/\/+$/, '') : 'https://shop.avinia.ir';
  
  // بسته داده امن جهت انتقال به سبد فروشگاه
  const cartPayload = {
    user: {
      mobile: userMobile,
      name: userName,
      source: 'agrimanage_applet',
      timestamp: Date.now()
    },
    context: {
      land: landName,
      sourceNote: 'نسخه صادر شده از سامانه مدیریت هوشمند پسته (AgriManage)'
    },
    items: items.map(i => ({
      id: i.productId,
      name: i.productName,
      qty: i.quantity,
      unit: i.unit,
      price: i.price
    }))
  };

  const encodedPayload = encodeURIComponent(JSON.stringify(cartPayload));
  return `${baseUrl}/checkout/prescription-bridge?payload=${encodedPayload}`;
}
