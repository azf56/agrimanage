import { LookupItem } from './types';

export const defaultLookupItems: LookupItem[] = [
  // --- آفات پسته (pests) ---
  {
    id: 'pest_1',
    category: 'pests',
    title: 'پسیل پسته (شیره خشک)',
    scientificName: 'Agonoscena pistaciae',
    code: 'PSY-01',
    tag: 'مهم‌ترین آفت پسته',
    description: 'تغذیه پوره و حشره کامل از شیره نباتی برگ و ترشح عسلک سفید و خشک، ریزش جوانه‌ها و برگ‌ها',
    recommendedStage: 'ارزنو تا پر شدن مغز',
    isActive: true,
    order: 1
  },
  {
    id: 'pest_2',
    category: 'pests',
    title: 'سن سبز پسته (سن اودالوس)',
    scientificName: 'Brachynema signatum / Nezara',
    code: 'STK-01',
    tag: 'آفت مکنده',
    description: 'نیش زدن دانه‌های تازه تشکیل شده پسته در بهار و ایجاد قطره صمغ و سیاه شدگی و ماسیدگی دانه',
    recommendedStage: 'ارزنو و تشکیل پوست استخوانی',
    isActive: true,
    order: 2
  },
  {
    id: 'pest_3',
    category: 'pests',
    title: 'سن قرمز پسته',
    scientificName: 'Acrosternum heegeri',
    code: 'STK-02',
    tag: 'آفت مکنده',
    description: 'خسارت لکه ماسیدگی در مرحله مغز بستن و انتقال قارچ نماتوسپورا و عارضه ماسیدگی میوه',
    recommendedStage: 'پر شدن مغز و تابستان',
    isActive: true,
    order: 3
  },
  {
    id: 'pest_4',
    category: 'pests',
    title: 'پروانه چوبخوار پسته (کرمانیا)',
    scientificName: 'Kermania pistaciella',
    code: 'KER-01',
    tag: 'آفت چوبخوار',
    description: 'نفوذ لارو به درون محور خوشه و شاخه‌های جوان یکساله، سیاه شدن مغز چوب و خشکیدگی دانه‌ها',
    recommendedStage: 'تورم جوانه و پس از گلدهی',
    isActive: true,
    order: 4
  },
  {
    id: 'pest_5',
    category: 'pests',
    title: 'کنه زنگار پسته',
    scientificName: 'Tegoloctus califarnicus',
    code: 'MIT-01',
    tag: 'کنه اختصاصی',
    description: 'ایجاد حالت برنزه و زنگار روی برگ‌ها و پوست سبز میوه در ماه‌های گرم تیر و مرداد',
    recommendedStage: 'تیر و مرداد',
    isActive: true,
    order: 5
  },
  {
    id: 'pest_6',
    category: 'pests',
    title: 'کنه معمولی تارتن پسته',
    scientificName: 'Tetranychus urticae',
    code: 'MIT-02',
    tag: 'کنه تارتن',
    description: 'تارزدن زیر برگ‌ها به ویژه در باغات حاشیه جاده‌های خاکی و غبارآلود',
    recommendedStage: 'تابستان',
    isActive: true,
    order: 6
  },
  {
    id: 'pest_7',
    category: 'pests',
    title: 'پروانه پوست‌خوار میوه پسته (کراش)',
    scientificName: 'Arimania comaroffi',
    code: 'CRSH-01',
    tag: 'آفت میوه‌خوار',
    description: 'تغذیه لارو از پوست سبز میوه پسته و ایجاد لکه‌های سیاه و خشکیدگی خوشه‌ها',
    recommendedStage: 'خرداد و تیر',
    isActive: true,
    order: 7
  },
  {
    id: 'pest_8',
    category: 'pests',
    title: 'زنبور مغزخوار سیاه پسته',
    scientificName: 'Eurytoma plotnikovi',
    code: 'WSP-01',
    tag: 'آفت بذرخوار',
    description: 'تخم‌گذاری داخل دانه در بهار و تغذیه لارو از جنین دانه و سیاه شدن دانه‌ها روی درخت',
    recommendedStage: 'اردیبهشت',
    isActive: true,
    order: 8
  },
  {
    id: 'pest_9',
    category: 'pests',
    title: 'سوسک سرشاخه‌خوار پسته',
    scientificName: 'Hylesinus vestitus',
    code: 'HYL-01',
    tag: 'آفت چوبخوار',
    description: 'حمله حشرات کامل به جوانه‌های طوقه برگ و گل و قطع آن‌ها در اوایل بهار و پاییز',
    recommendedStage: 'پاییز و زمستان / هرس چوب‌های خشک',
    isActive: true,
    order: 9
  },
  {
    id: 'pest_10',
    category: 'pests',
    title: 'کاپنودیس (سوسک طوقه و ریشه پسته)',
    scientificName: 'Capnodis cariosa',
    code: 'CAP-01',
    tag: 'سوسک ریشه',
    description: 'تغذیه لارو در طوقه و ریشه‌های ضخیم، انسداد آوندهای آبکش و زردی و مرگ ناگهانی درخت',
    recommendedStage: 'بهار و اوایل تابستان',
    isActive: true,
    order: 10
  },

  // --- بیماری‌ها و عوارض (diseases) ---
  {
    id: 'dis_1',
    category: 'diseases',
    title: 'گموز پسته (پوسیدگی طوقه و ریشه)',
    scientificName: 'Phytophthora spp.',
    code: 'PHY-01',
    tag: 'قارچ خاکزاد خطرناک',
    description: 'ترشح صمغ قهوه‌ای از طوقه، زردی و ریزش ناگهانی برگ‌ها به ویژه در باغات با آبیاری غرقابی سنگین',
    recommendedStage: 'بهار و تابستان (پس از آبیاری)',
    isActive: true,
    order: 1
  },
  {
    id: 'dis_2',
    category: 'diseases',
    title: 'سرخشکیدگی شاخه‌های پسته (Dieback)',
    scientificName: 'Paecilomyces / Natrassia',
    code: 'DIE-01',
    tag: 'بیماری قارچی شاخه',
    description: 'خشک شدن شاخه‌ها از نوک به سمت پایین، تغییر رنگ بافت آوندی به قهوه‌ای تا سیاه زیر پوست',
    recommendedStage: 'پاییز، زمستان و بهار',
    isActive: true,
    order: 2
  },
  {
    id: 'dis_3',
    category: 'diseases',
    title: 'لکه برگی و میوه آلترناریایی',
    scientificName: 'Alternaria alternata',
    code: 'ALT-01',
    tag: 'بیماری قارچی برگ و میوه',
    description: 'ایجاد لکه‌های قهوه‌ای تیره تا سیاه با حاشیه مشخص روی برگ و پوست سبز پسته در شرایط رطوبت بالا',
    recommendedStage: 'تیر و مرداد',
    isActive: true,
    order: 3
  },
  {
    id: 'dis_4',
    category: 'diseases',
    title: 'لکه کرکی پسته (سپتوریا / بوتریتیس)',
    scientificName: 'Septoria / Botrytis',
    code: 'BOT-01',
    tag: 'بیماری قارچی',
    description: 'پیدایش لکه‌های گرد و خاکستری در زیر برگ و سوختگی گل‌آذین‌ها در بهار مرطوب و پرباران',
    recommendedStage: 'فروردین و اردیبهشت',
    isActive: true,
    order: 4
  },
  {
    id: 'dis_5',
    category: 'diseases',
    title: 'خسارت شوری (سوختگی حاشیه برگ)',
    scientificName: 'Salinity Stress',
    code: 'SAL-01',
    tag: 'تنش غیرزیستی فیزیولوژیک',
    description: 'تجمع املاح سدیم و کلر در نوک و حاشیه برگ، نکروزه شدن و خشکیدگی حاشیه‌ای',
    recommendedStage: 'فصل گرما (خرداد تا مرداد)',
    isActive: true,
    order: 5
  },
  {
    id: 'dis_6',
    category: 'diseases',
    title: 'آفتاب‌سوختگی میوه و برگ',
    scientificName: 'Sunburn Damage',
    code: 'SUN-01',
    tag: 'تنش گرمایی',
    description: 'سیاه و چروکیده شدن سمت رو به آفتاب میوه‌ها در دمای بالای ۳۸ درجه سانتی‌گراد',
    recommendedStage: 'تیر و مرداد',
    isActive: true,
    order: 6
  },
  {
    id: 'dis_7',
    category: 'diseases',
    title: 'عارضه لکه پوست استخوانی و سرسیاهی',
    scientificName: 'Black Tip / Shell Necrosis',
    code: 'BLT-01',
    tag: 'کمبود کلسیم و بور',
    description: 'سیاه شدن نوک دانه در اوایل فصل یا لکه تیره روی پوست استخوانی ناشی از کمبود کلسیم و نیش حشرات',
    recommendedStage: 'اردیبهشت و خرداد',
    isActive: true,
    order: 7
  },
  {
    id: 'dis_8',
    category: 'diseases',
    title: 'زودخندانی و ترک‌خوردگی پوست سبز (Early Splitting)',
    scientificName: 'Early Splitting',
    code: 'SPL-01',
    tag: 'عارضه کیفیت و آفلاتوکسین',
    description: 'شکافتن پوست نرم میوه قبل از رسیدن و آلودگی به قارچ آسپرژیلوس و تولید زهرابه آفلاتوکسین',
    recommendedStage: 'مرداد و شهریور',
    isActive: true,
    order: 8
  },

  // --- سموم، شوینده‌ها و ترکیبات حفاظتی (pesticides) ---
  {
    id: 'pestc_1',
    category: 'pesticides',
    title: 'صابون محلول‌پاشی ارگانیک پالیگان / سیتووت',
    code: 'SOAP-01',
    tag: 'ارگانیک / شوینده',
    description: 'شستشوی عسلک پسیل، اختلال در تنفس پوره‌های سنین ۱ و ۲ پسیل پسته (دوز ۲ تا ۲.۵ در هزار)',
    recommendedStage: 'ارزنو تا قبل از برداشت',
    isActive: true,
    order: 1
  },
  {
    id: 'pestc_2',
    category: 'pesticides',
    title: 'کائولین فرآوری‌شده (پودر پوششی)',
    code: 'KAO-01',
    tag: 'معدنی / دافع فیزیکی',
    description: 'پوشش سفید روی درخت جهت کاهش دمای سایه‌انداز، جلوگیری از آفتاب‌سوختگی و فراری دادن پسیل (۵۰ کیلو در ۱۰۰۰ لیتر)',
    recommendedStage: 'خرداد و تیر (شروع گرمای شدید)',
    isActive: true,
    order: 2
  },
  {
    id: 'pestc_3',
    category: 'pesticides',
    title: 'گوگرد مایع و وتابل میکرونیزه',
    code: 'SUL-01',
    tag: 'معدنی / کنه‌کش و پسیل‌کش',
    description: 'دورکنندگی قوی پسیل، کنترل کنه‌های زنگار و تارتن و قارچ‌های سطحی (دوز ۳ تا ۴ در هزار در هوای خنک)',
    recommendedStage: 'اردیبهشت تا تیر (دمای زیر ۳۴ درجه)',
    isActive: true,
    order: 3
  },
  {
    id: 'pestc_4',
    category: 'pesticides',
    title: 'استامی‌پراید (موسپیلان)',
    code: 'ACE-01',
    tag: 'شیمیایی سیستمیک',
    description: 'حشره‌کش نئونیکوتینوئیدی با دوز ۰.۵ در هزار برای کنترل طغیان حشرات کامل و پوره پسیل',
    recommendedStage: 'اردیبهشت و خرداد',
    isActive: true,
    order: 4
  },
  {
    id: 'pestc_5',
    category: 'pesticides',
    title: 'اسپیروتترامات (موونتو)',
    code: 'MOV-01',
    tag: 'سیستمیک دوطرفه',
    description: 'انتقال از آوندهای چوب و آبکش، مهار بیوسنتز چربی در پوره‌های پسیل و شپشک (دوز ۰.۵ در هزار)',
    recommendedStage: 'پس از کامل شدن سطح برگ‌ها (اواخر اردیبهشت)',
    isActive: true,
    order: 5
  },
  {
    id: 'pestc_6',
    category: 'pesticides',
    title: 'پایری‌پروکسی‌فن (آدمیرال)',
    code: 'ADM-01',
    tag: 'تنظیم‌کننده رشد حشرات (IGR)',
    description: 'عقیم‌سازی حشرات کامل و جلوگیری از دگردیسی پوره‌ها به حشره کامل (دوز ۰.۷ در هزار)',
    recommendedStage: 'اوایل فصل و همزمان با ظهور نسل اول',
    isActive: true,
    order: 6
  },
  {
    id: 'pestc_7',
    category: 'pesticides',
    title: 'مونوپتاسیم فسفیت (فسفیت پتاسیم)',
    code: 'PHOS-01',
    tag: 'قارچ‌کش و الیسیتور دفاعی',
    description: 'تحریک سیستم دفاعی گیاه و پیشگیری و درمان قارچ گموز و پوسیدگی طوقه (دوز ۲ تا ۲.۵ در هزار)',
    recommendedStage: 'بهار و اواخر تابستان',
    isActive: true,
    order: 7
  },
  {
    id: 'pestc_8',
    category: 'pesticides',
    title: 'مس نوردوکس / اکسی‌کلرور مس',
    code: 'COP-01',
    tag: 'قارچ‌کش و باکتری‌کش حفاظتی',
    description: 'کنترل گموز، سرخشکیدگی و شانکرها و ضدعفونی تنه و طوقه با خمیر مس',
    recommendedStage: 'خواب زمستانه و پس از هرس',
    isActive: true,
    order: 8
  },
  {
    id: 'pestc_9',
    category: 'pesticides',
    title: 'هگزی‌تیازوکس (نیسورون)',
    code: 'NISS-01',
    tag: 'کنه‌کش اختصاصی',
    description: 'کنترل تخم و لارو سنین اولیه کنه‌های تارتن و زنگار پسته (دوز ۰.۵ تا ۰.۷۵ در هزار)',
    recommendedStage: 'اوایل تابستان با مشاهده اولین کنه‌ها',
    isActive: true,
    order: 9
  },

  // --- مراحل رشدی و فنولوژی (growth_stages) ---
  {
    id: 'stage_1',
    category: 'growth_stages',
    title: 'خواب زمستانه درختان',
    code: 'STAGE-01',
    description: 'دوران رکود درخت، سپری شدن نیاز سرمایی (آذر، دی و بهمن)',
    isActive: true,
    order: 1
  },
  {
    id: 'stage_2',
    category: 'growth_stages',
    title: 'تورم جوانه‌های زایشی و رویشی',
    code: 'STAGE-02',
    description: 'شروع فعالیت ریشه و تورم فلس‌های جوانه (اسفند ماه)',
    isActive: true,
    order: 2
  },
  {
    id: 'stage_3',
    category: 'growth_stages',
    title: 'نوک‌سبز و شروع باز شدن گل‌آذین‌ها',
    code: 'STAGE-03',
    description: 'پیدایش نوک برگچه‌ها و ظهور خوشه‌های نر و ماده (اوایل فروردین)',
    isActive: true,
    order: 3
  },
  {
    id: 'stage_4',
    category: 'growth_stages',
    title: 'تمام‌گل و گرده‌افشانی',
    code: 'STAGE-04',
    description: 'پذیرش دانه گرده توسط کلاله گل‌های ماده (فروردین ماه)',
    isActive: true,
    order: 4
  },
  {
    id: 'stage_5',
    category: 'growth_stages',
    title: 'تشکیل دانه و مرحله ارزنو',
    code: 'STAGE-05',
    description: 'دانه‌ها به اندازه ارزنو تا عدس شده‌اند (اواخر فروردین تا اردیبهشت)',
    isActive: true,
    order: 5
  },
  {
    id: 'stage_6',
    category: 'growth_stages',
    title: 'فندقی شدن دانه و تشکیل پوست استخوانی',
    code: 'STAGE-06',
    description: 'پوسته داخلی شروع به لیگنینی شدن و سفت شدن می‌کند (خرداد ماه)',
    isActive: true,
    order: 6
  },
  {
    id: 'stage_7',
    category: 'growth_stages',
    title: 'پر شدن مغز دانه پسته',
    code: 'STAGE-07',
    description: 'جنین شروع به رشد سریع و پر کردن حجم درون پوست استخوانی می‌کند (تیر و مرداد)',
    isActive: true,
    order: 7
  },
  {
    id: 'stage_8',
    category: 'growth_stages',
    title: 'شروع خندانی و نرم شدن پوست رویی',
    code: 'STAGE-08',
    description: 'پوست بیرونی تغییر رنگ داده و پوست استخوانی در ناحیه شکاف خندان می‌شود (شهریور)',
    isActive: true,
    order: 8
  },
  {
    id: 'stage_9',
    category: 'growth_stages',
    title: 'برداشت محصول و فرآوری',
    code: 'STAGE-09',
    description: 'جداسازی خوشه‌ها از درخت و انتقال سریع به پایانه‌های ضبط و پوست‌گیری (شهریور و مهر)',
    isActive: true,
    order: 9
  },
  {
    id: 'stage_10',
    category: 'growth_stages',
    title: 'پس از برداشت و تغذیه پاییزه (فروت‌ست)',
    code: 'STAGE-10',
    description: 'محلول‌پاشی تقویت جوانه‌های سال بعد و به خواب رفتن تدریجی درخت (مهر و آبان)',
    isActive: true,
    order: 10
  },

  // --- ارقام و پایه‌های پسته (rootstocks_varieties) ---
  {
    id: 'var_1',
    category: 'rootstocks_varieties',
    title: 'پیوند رقم اکبری روی پایه بادامی زرندی',
    code: 'AKB-BAD',
    tag: 'رقم کشیده و تجاری',
    description: 'رقمی دیرگل و دیررس با بازارپسندی صادراتی بالا، متحمل به شوری متوسط خاک روی پایه بادامی زرندی',
    isActive: true,
    order: 1
  },
  {
    id: 'var_2',
    category: 'rootstocks_varieties',
    title: 'پیوند رقم احمدآقایی روی پایه بادامی زرندی',
    code: 'AHM-BAD',
    tag: 'رقم کشیده با خندانی عالی',
    description: 'رقمی متوسط‌گل و زودرس‌تر از اکبری، با سفیدی پوست و خندانی بسیار مطلوب',
    isActive: true,
    order: 2
  },
  {
    id: 'var_3',
    category: 'rootstocks_varieties',
    title: 'پیوند رقم کله‌قوچی روی پایه بادامی',
    code: 'GHUCH-BAD',
    tag: 'رقم درشت فندقی',
    description: 'زودگل‌ترین رقم تجاری (حساس به سرمای دیررس بهاره)، میوه فندقی درشت و تناژ باردهی سنگین',
    isActive: true,
    order: 3
  },
  {
    id: 'var_4',
    category: 'rootstocks_varieties',
    title: 'پیوند رقم فندقی (اوحدی) روی پایه بنه',
    code: 'FND-BANEH',
    tag: 'رقم کروی و پرمحصول',
    description: 'متوسط‌گل و میان‌رس، سازگاری فوق‌العاده با شرایط سخت اقلیمی و پایه بومی بنه',
    isActive: true,
    order: 4
  },
  {
    id: 'var_5',
    category: 'rootstocks_varieties',
    title: 'پیوند رقم اکبری روی پایه کشت‌بافتی UCB1',
    code: 'AKB-UCB1',
    tag: 'پایه هیبرید پررشد',
    description: 'پایه هیبرید آمریکایی با رشد رویشی بسیار سریع، مقاومت به گموز (فیتوفتورا) و نماتد',
    isActive: true,
    order: 5
  },
  {
    id: 'var_6',
    category: 'rootstocks_varieties',
    title: 'پیوند رقم احمدآقایی روی پایه کشت‌بافتی UCB1',
    code: 'AHM-UCB1',
    tag: 'پایه هیبرید UCB1',
    description: 'رسیدن سریع‌تر به باردهی اقتصادی با پایه کلونال کشت بافتی',
    isActive: true,
    order: 6
  },
  {
    id: 'var_7',
    category: 'rootstocks_varieties',
    title: 'رقم خنجری دامغان',
    code: 'KHAN-DAM',
    tag: 'رقم محلی دامغان',
    description: 'رقم دیرگل و باکیفیت بادامی شکل منطقه دامغان با مقاومت به سرمای زمستانه',
    isActive: true,
    order: 7
  },
  {
    id: 'var_8',
    category: 'rootstocks_varieties',
    title: 'رقم شاه‌پسند دامغان',
    code: 'SHAH-DAM',
    tag: 'رقم بادامی درشت',
    description: 'رقمی ممتاز و کشیده بومی استان سمنان با رنگ‌پذیری پوست استخوانی زیبا',
    isActive: true,
    order: 8
  },
  {
    id: 'var_9',
    category: 'rootstocks_varieties',
    title: 'پایه پسته بنه (Pistacia atlantica)',
    code: 'ROOT-ATL',
    tag: 'پایه بومی مقاوم',
    description: 'ریشه‌زایی عمیق، مقاومت بسیار بالا به خشکی شدید و تنش کم‌آبی',
    isActive: true,
    order: 9
  },

  // --- کودها و ترکیبات تغذیه‌ای (fertilizers) ---
  {
    id: 'fert_1',
    category: 'fertilizers',
    title: 'کود فروت‌ست (ترکیب روی، بور و اسید آمینه)',
    code: 'FRUIT-SET',
    tag: 'تغذیه بهاره و پاییزه',
    description: 'محلول‌پاشی در زمان تورم جوانه‌ها در اسفند و پس از برداشت در مهر جهت گرده‌افشانی و بستن میوه',
    recommendedStage: 'اسفند و مهر',
    isActive: true,
    order: 1
  },
  {
    id: 'fert_2',
    category: 'fertilizers',
    title: 'سیلیکات پتاسیم مایع',
    code: 'SIL-K',
    tag: 'افزایش مقاومت به تنش و پسیل',
    description: 'استحکام‌بخش دیواره سلولی برگ و پوست میوه، مهار نیش پسیل و محافظت در برابر اشعه شدید UV',
    recommendedStage: 'خرداد تا مرداد',
    isActive: true,
    order: 2
  },
  {
    id: 'fert_3',
    category: 'fertilizers',
    title: 'سولفات پتاسیم محلول (سولپات)',
    code: 'SOP-01',
    tag: 'درشت‌کننده و پرکننده مغز',
    description: 'مصرف خاکی همراه آب آبیاری در فاز پر شدن مغز پسته (کاهش پوکی و افزایش درصد خندانی)',
    recommendedStage: 'تیر و مرداد',
    isActive: true,
    order: 3
  },
  {
    id: 'fert_4',
    category: 'fertilizers',
    title: 'نیترات کلسیم مایع / کلسیم کلاته',
    code: 'CAL-01',
    tag: 'استحکام پوست استخوانی',
    description: 'جلوگیری از لکه سیاه پوست و زودخندانی نابهنگام و افزایش انبارداری پسته',
    recommendedStage: 'اردیبهشت و خرداد',
    isActive: true,
    order: 4
  },
  {
    id: 'fert_5',
    category: 'fertilizers',
    title: 'کلات آهن EDDHA (۶ درصد)',
    code: 'FE-EDDHA',
    tag: 'رفع زردی خاک‌های آهکی',
    description: 'پایداری بالا در pH خاک‌های قلیایی و آهکی باغات پسته ایران، مصرف همراه آب در اوایل بهار',
    recommendedStage: 'فروردین و اردیبهشت',
    isActive: true,
    order: 5
  },
  {
    id: 'fert_6',
    category: 'fertilizers',
    title: 'اسید هیومیک و فولویک اسید اصلاحی',
    code: 'HUMIC-01',
    tag: 'اصلاح‌کننده خاک و ریشه‌زا',
    description: 'بهبود ظرفیت تبادل کاتیونی خاک، جذب بهتر عناصر میکرو و آزادسازی فسفر تثبیت شده',
    recommendedStage: 'همراه با هر دوره آبیاری در بهار و تابستان',
    isActive: true,
    order: 6
  },
  {
    id: 'fert_7',
    category: 'fertilizers',
    title: 'کود دامی پوسیده و فرآوری شده (چالکود زمستانه)',
    code: 'MANURE-01',
    tag: 'کود پایه آلی زمستانه',
    description: 'تغذیه ریشه‌ای همراه با گوگرد گرانوله و کودهای فسفاته و پتاسه در کانال کود زمستانه',
    recommendedStage: 'دی و بهمن',
    isActive: true,
    order: 7
  },

  // --- سیستم‌های آبیاری (irrigation_systems) ---
  {
    id: 'irr_1',
    category: 'irrigation_systems',
    title: 'قطره‌ای تحت فشار (بابلر / قطره‌چکان)',
    code: 'DRIP-BUB',
    description: 'راندمان آبیاری ۸۵ تا ۹۰ درصد، جلوگیری از تماس مستقیم آب با طوقه درخت و کنترل گموز',
    isActive: true,
    order: 1
  },
  {
    id: 'irr_2',
    category: 'irrigation_systems',
    title: 'قطره‌ای نواری (تیپ سطحی)',
    code: 'TAPE-01',
    description: 'پخش یکنواخت در دو طرف ردیف درختان، قابلیت تعویض و مدیریت آسان',
    isActive: true,
    order: 2
  },
  {
    id: 'irr_3',
    category: 'irrigation_systems',
    title: 'آبیاری زیرسطحی متخلخل (Subsurface Drip)',
    code: 'SUB-DRIP',
    description: 'حداکثر راندمان مصرف آب، به صفر رساندن تبخیر سطحی در مناطق کویری پسته',
    isActive: true,
    order: 3
  },
  {
    id: 'irr_4',
    category: 'irrigation_systems',
    title: 'غرقابی سنتی جوی و پشته‌ای',
    code: 'FLOOD-FUR',
    description: 'هدایت آب در جوی‌های کنار درخت با فاصله از تنه اصلی',
    isActive: true,
    order: 4
  },
  {
    id: 'irr_5',
    category: 'irrigation_systems',
    title: 'غرقابی نواری و کرتی',
    code: 'FLOOD-BASIN',
    description: 'سیستم سنتی با مصرف آب بالا و خطر تشدید بیماری‌های طوقه',
    isActive: true,
    order: 5
  },

  // --- بافت‌های خاک (soil_textures) ---
  {
    id: 'soil_1',
    category: 'soil_textures',
    title: 'شنی لومی (Sandy Loam)',
    code: 'SL',
    description: 'بهترین بافت برای باغات پسته، تهویه و نفوذپذیری ریشه عالی و آب‌گذری مناسب',
    isActive: true,
    order: 1
  },
  {
    id: 'soil_2',
    category: 'soil_textures',
    title: 'لومی (Loam)',
    code: 'L',
    description: 'بافت متعادل با ظرفیت نگهداری آب و عناصر غذایی مناسب',
    isActive: true,
    order: 2
  },
  {
    id: 'soil_3',
    category: 'soil_textures',
    title: 'لومی رسی (Clay Loam)',
    code: 'CL',
    description: 'بافت نیمه‌سنگین، نیاز به مدیریت دقیق دور آبیاری برای جلوگیری از خفگی ریشه',
    isActive: true,
    order: 3
  },
  {
    id: 'soil_4',
    category: 'soil_textures',
    title: 'لوم شنی رسی (Sandy Clay Loam)',
    code: 'SCL',
    description: 'بافت متوسط تا سنگین متداول در برخی دشت‌های کویری',
    isActive: true,
    order: 4
  },
  {
    id: 'soil_5',
    category: 'soil_textures',
    title: 'شنی (Sand)',
    code: 'S',
    description: 'بافت بسیار سبک، آب‌شویی سریع عناصر و نیاز به دور آبیاری کوتاه',
    isActive: true,
    order: 5
  },
  {
    id: 'soil_6',
    category: 'soil_textures',
    title: 'رسی سنگین (Clay)',
    code: 'C',
    description: 'نفوذپذیری کم، خطر بالای غرقاب شدن و شیوع گموز طوقه در آبیاری سنگین',
    isActive: true,
    order: 6
  }
];
