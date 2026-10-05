import React, { useState } from 'react';
import { LookupItem, LookupCategory, User } from '../types';
import { defaultLookupItems } from '../defaultLookups';
import { 
  Settings, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Download, 
  Upload, 
  Bug, 
  AlertTriangle, 
  FlaskConical, 
  Sprout, 
  Trees, 
  Sparkles, 
  Droplets, 
  Layers,
  X, 
  Check, 
  Filter, 
  Info,
  Tag,
  BookOpen
} from 'lucide-react';

interface LookupsTabProps {
  lookups: LookupItem[];
  setLookups: (data: LookupItem[] | ((prev: LookupItem[]) => LookupItem[])) => void;
  user: User | null;
}

interface CategoryMeta {
  key: LookupCategory;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  fieldLabel: string;
  placeholderTitle: string;
  exampleTag: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    key: 'pests',
    title: 'آفات پسته',
    subtitle: 'پسیل، سن‌های سبز و قرمز، پروانه چوبخوار، کنه‌ها و سوسک‌ها',
    icon: Bug,
    color: 'text-gray-700',
    badgeBg: 'bg-gray-100 border-gray-200 text-gray-800',
    fieldLabel: 'نام آفت',
    placeholderTitle: 'مثلاً: سنک تخم‌پسته، پسیل معمولی',
    exampleTag: 'آفت مکنده / چوبخوار'
  },
  {
    key: 'diseases',
    title: 'بیماری‌ها و عوارض',
    subtitle: 'گموز طوقه، سرخشکیدگی، آلترناریا، آفتاب‌سوختگی و شوری',
    icon: AlertTriangle,
    color: 'text-gray-700',
    badgeBg: 'bg-gray-100 border-gray-200 text-gray-800',
    fieldLabel: 'نام بیماری یا عارضه',
    placeholderTitle: 'مثلاً: پوسیدگی آرمیلاریایی، سوختگی باکتریایی',
    exampleTag: 'قارچی / فیزیولوژیک'
  },
  {
    key: 'pesticides',
    title: 'سموم، شوینده‌ها و آفت‌کش‌ها',
    subtitle: 'صابون‌های محلول‌پاشی، کائولین، حشره‌کش‌ها، کنه‌کش‌ها و قارچ‌کش‌ها',
    icon: FlaskConical,
    color: 'text-gray-700',
    badgeBg: 'bg-gray-100 border-gray-200 text-gray-800',
    fieldLabel: 'نام ترکیب / سم تجاری',
    placeholderTitle: 'مثلاً: دیفلوبنزورون (دیمیلین)، کائولین سسپند',
    exampleTag: 'ارگانیک / سیستمیک'
  },
  {
    key: 'growth_stages',
    title: 'مراحل رشدی و فنولوژی',
    subtitle: 'خواب زمستانه، تورم جوانه، ارزنو، پوست استخوانی، پر شدن مغز و خندانی',
    icon: Sprout,
    color: 'text-gray-700',
    badgeBg: 'bg-gray-100 border-gray-200 text-gray-800',
    fieldLabel: 'مرحله فنولوژیکی',
    placeholderTitle: 'مثلاً: آغاز گرده‌افشانی، تشکیل پوست نرم',
    exampleTag: 'فاز بهاره / تابستانه'
  },
  {
    key: 'rootstocks_varieties',
    title: 'ارقام و پایه‌های پسته',
    subtitle: 'اکبری، کله‌قوچی، احمدآقایی، فندقی، بادامی، UCB1 و بنه',
    icon: Trees,
    color: 'text-gray-700',
    badgeBg: 'bg-gray-100 border-gray-200 text-gray-800',
    fieldLabel: 'نام رقم و پایه پیوند',
    placeholderTitle: 'مثلاً: رقم ممتاز دامغان روی پایه زرندی',
    exampleTag: 'رقم تجاری / پایه کلونال'
  },
  {
    key: 'fertilizers',
    title: 'کودها و ترکیبات تغذیه‌ای',
    subtitle: 'فروت‌ست، سیلیکات پتاسیم، سولوپتاس، کلات آهن، کلسیم و هیومیک',
    icon: Sparkles,
    color: 'text-gray-700',
    badgeBg: 'bg-gray-100 border-gray-200 text-gray-800',
    fieldLabel: 'نام کود یا ترکیب',
    placeholderTitle: 'مثلاً: کلات روی مایع EDTA، فسفیت کلسیم',
    exampleTag: 'محلول‌پاشی / مصرف خاکی'
  },
  {
    key: 'irrigation_systems',
    title: 'سیستم‌ها و روش‌های آبیاری',
    subtitle: 'قطره‌ای تحت فشار، بابلر، نواری (تیپ)، زیرسطحی و غرقابی',
    icon: Droplets,
    color: 'text-gray-700',
    badgeBg: 'bg-gray-100 border-gray-200 text-gray-800',
    fieldLabel: 'روش آبیاری',
    placeholderTitle: 'مثلاً: قطره‌ای پالسی هوشمند',
    exampleTag: 'تحت فشار / سنتی'
  },
  {
    key: 'soil_textures',
    title: 'بافت‌های خاک',
    subtitle: 'شنی لومی، لومی، لومی رسی، لوم شنی و رسی',
    icon: Layers,
    color: 'text-gray-700',
    badgeBg: 'bg-gray-100 border-gray-200 text-gray-800',
    fieldLabel: 'نام بافت خاک',
    placeholderTitle: 'مثلاً: شنی سنگریزه‌دار (Gravelly Sand)',
    exampleTag: 'بافت سبک / سنگین'
  }
];

export const LookupsTab: React.FC<LookupsTabProps> = ({
  lookups,
  setLookups,
  user
}) => {
  const [activeCategory, setActiveCategory] = useState<LookupCategory>('pests');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LookupItem | null>(null);

  // Form
  const [form, setForm] = useState<Partial<LookupItem>>({
    category: 'pests',
    title: '',
    code: '',
    scientificName: '',
    tag: '',
    recommendedStage: '',
    description: '',
    isActive: true
  });

  const currentCatMeta = CATEGORIES.find(c => c.key === activeCategory) || CATEGORIES[0];

  // Filter items
  const categoryItems = lookups.filter(item => item.category === activeCategory);
  
  const filteredItems = categoryItems.filter(item => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      item.title.toLowerCase().includes(term) ||
      (item.code || '').toLowerCase().includes(term) ||
      (item.scientificName || '').toLowerCase().includes(term) ||
      (item.tag || '').toLowerCase().includes(term) ||
      (item.description || '').toLowerCase().includes(term) ||
      (item.recommendedStage || '').toLowerCase().includes(term);

    if (statusFilter === 'active') return matchesSearch && item.isActive;
    if (statusFilter === 'inactive') return matchesSearch && !item.isActive;
    return matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      category: activeCategory,
      title: '',
      code: '',
      scientificName: '',
      tag: '',
      recommendedStage: '',
      description: '',
      isActive: true,
      order: categoryItems.length + 1
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: LookupItem) => {
    setEditingItem(item);
    setForm(item);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      alert('عنوان واژه الزامی است.');
      return;
    }

    if (editingItem) {
      setLookups(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...(form as LookupItem) } : item));
    } else {
      const newItem: LookupItem = {
        id: `lookup_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        category: form.category || activeCategory,
        title: form.title.trim(),
        code: form.code?.trim() || undefined,
        scientificName: form.scientificName?.trim() || undefined,
        tag: form.tag?.trim() || undefined,
        recommendedStage: form.recommendedStage?.trim() || undefined,
        description: form.description?.trim() || undefined,
        isActive: form.isActive !== undefined ? form.isActive : true,
        order: categoryItems.length + 1
      };
      setLookups(prev => [...prev, newItem]);
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const handleToggleActive = (id: string) => {
    setLookups(prev => prev.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
  };

  const handleDelete = (item: LookupItem) => {
    if (confirm(`آیا از حذف گزینه «${item.title}» از جدول پایه اطمینان دارید؟`)) {
      setLookups(prev => prev.filter(i => i.id !== item.id));
    }
  };

  const handleResetDefaults = () => {
    if (confirm('آیا مایلید تمام جداول پایه و واژگان به حالت پیش‌فرض استاندارد پسته بازنشانی شوند؟ (اطلاعات سفارشی شما حفظ نمی‌شود)')) {
      setLookups(defaultLookupItems);
      alert('جداول پایه با موفقیت به مقادیر پیش‌فرض بازنشانی شدند.');
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lookups, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pistachio_base_lookups_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setLookups(parsed);
          alert(`تعداد ${parsed.length} واژه و رکورد پایه با موفقیت وارد سامانه شد.`);
        } else {
          alert('فرمت فایل JSON نامعتبر است.');
        }
      } catch (err) {
        alert('خطا در خواندن فایل JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-gray-800">تنظیمات جداول پایه و واژگان تخصصی</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                مخصوص کارشناسان و مدیران
              </span>
            </div>
            <p className="text-xs text-gray-500 font-bold mt-0.5">
              مدیریت پویا و بدون نیاز به کدنویسیِ گزینه‌های دراپ‌داون‌ها (آفات، سموم، مراحل رشدی، پایه‌ها، کودها و بافت خاک)
            </p>
          </div>
        </div>

        {/* Global actions: Reset, Export, Import */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={handleExportJSON}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="دانلود فایل پشتیبان واژگان (JSON)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            خروجی JSON
          </button>

          <label className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-700" />
            ورود داده
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleResetDefaults}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="بازنشانی تمام دسته‌ها به مقادیر پیش‌فرض باغبانی"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            بازنشانی پیش‌فرض
          </button>
        </div>
      </div>

      {/* Main Grid: Category Selection & Items Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Category Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm space-y-1.5">
            <div className="px-3 py-2 text-xs font-black text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>دسته‌بندی‌های پایه</span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">{lookups.length} واژه</span>
            </div>

            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.key;
              const count = lookups.filter(i => i.category === cat.key).length;
              const activeCount = lookups.filter(i => i.category === cat.key && i.isActive).length;

              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    setSearchTerm('');
                  }}
                  className={`w-full text-right p-3 rounded-2xl transition flex items-start gap-3 border ${
                    isSelected 
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/20' 
                      : 'bg-gray-50/70 hover:bg-gray-100/80 text-gray-700 border-gray-100'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-emerald-800 border border-gray-200'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {cat.title}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {activeCount}/{count}
                      </span>
                    </div>
                    <p className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                      {cat.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Notice Box */}
          <div className="bg-emerald-50/70 p-4 rounded-3xl border border-emerald-100 text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-black">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>همگام‌سازی لحظه‌ای دراپ‌داون‌ها</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800 font-medium">
              هر واژه یا موردی که در این بخش اضافه یا ویرایش کنید، بلافاصله در فرم‌های «بازدید و پایش»، «باغات و اراضی»، «آنالیز آزمایشگاهی» و «دستورالعمل‌ها» در دسترس کارشناسان قرار می‌گیرد.
            </p>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Controls Bar for selected category */}
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-xl ${currentCatMeta.badgeBg}`}>
                  <currentCatMeta.icon className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-gray-800">{currentCatMeta.title}</h3>
                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                  {filteredItems.length} مورد
                </span>
              </div>
              <p className="text-xs text-gray-500 font-bold mt-0.5">{currentCatMeta.subtitle}</p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              افزودن گزینه جدید
            </button>
          </div>

          {/* Search and Status Filters */}
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-2.5 items-center">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder={`جستجو در ${currentCatMeta.title}... (عنوان، نام علمی، کد، دوز)`}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-black w-full sm:w-auto justify-center">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
              >
                همه ({categoryItems.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'active' ? 'bg-emerald-700 text-white shadow' : 'text-gray-500'}`}
              >
                فعال ({categoryItems.filter(i => i.isActive).length})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'inactive' ? 'bg-gray-600 text-white shadow' : 'text-gray-500'}`}
              >
                غیرفعال ({categoryItems.filter(i => !i.isActive).length})
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl border p-4 shadow-sm transition hover:border-emerald-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                  item.isActive ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50 opacity-75'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                      {item.title}
                    </h4>

                    {item.code && (
                      <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200">
                        {item.code}
                      </span>
                    )}

                    {item.tag && (
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-gray-500" />
                        {item.tag}
                      </span>
                    )}

                    {!item.isActive && (
                      <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                        غیرفعال در دراپ‌داون
                      </span>
                    )}
                  </div>

                  {item.scientificName && (
                    <p className="text-[11px] font-mono text-gray-600 font-bold italic">
                      {item.scientificName}
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {item.recommendedStage && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-bold">
                      <Sprout className="w-3 h-3 text-emerald-700" />
                      <span>زمان / فاز مصرف: {item.recommendedStage}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleToggleActive(item.id)}
                    className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      item.isActive 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                    title={item.isActive ? 'غیرفعال کردن در منو' : 'فعال کردن در منو'}
                  >
                    {item.isActive ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <XCircle className="w-4 h-4 text-gray-500" />}
                    <span className="hidden sm:inline">{item.isActive ? 'فعال' : 'غیرفعال'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-xl border border-gray-200 transition"
                    title="ویرایش مشخصات"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 rounded-xl border border-gray-200 transition"
                    title="حذف از جدول پایه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="bg-white py-16 text-center text-gray-400 border-2 border-dashed rounded-3xl p-6">
                <BookOpen className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="font-bold text-xs">هیچ گزینه‌ای در این دسته‌بندی با مشخصات وارد شده یافت نشد.</p>
                <button
                  onClick={handleOpenAdd}
                  className="mt-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-black transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> افزودن اولین مورد به {currentCatMeta.title}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Add/Edit Lookup Item */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-base md:text-lg font-black text-gray-800 flex items-center gap-2">
                  <currentCatMeta.icon className="w-5 h-5 text-emerald-700" />
                  {editingItem ? `ویرایش ${currentCatMeta.fieldLabel}` : `افزودن ${currentCatMeta.fieldLabel} جدید`}
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-0.5">
                  دسته‌بندی: {currentCatMeta.title}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">
                  {currentCatMeta.fieldLabel} *
                </label>
                <input
                  required
                  type="text"
                  placeholder={currentCatMeta.placeholderTitle}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.title || ''}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">
                    کد شناسه / استاندارد (اختیاری)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: PSY-02 یا AKB-01"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.code || ''}
                    onChange={e => setForm({ ...form, code: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">
                    برچسب / نوع (اختیاری)
                  </label>
                  <input
                    type="text"
                    placeholder={`مثال: ${currentCatMeta.exampleTag}`}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.tag || ''}
                    onChange={e => setForm({ ...form, tag: e.target.value })}
                  />
                </div>
              </div>

              {(activeCategory === 'pests' || activeCategory === 'diseases' || activeCategory === 'rootstocks_varieties') && (
                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">
                    نام علمی لاتین / گونه (Scientific Name)
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: Kermania pistaciella"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.scientificName || ''}
                    onChange={e => setForm({ ...form, scientificName: e.target.value })}
                  />
                </div>
              )}

              {(activeCategory === 'pests' || activeCategory === 'pesticides' || activeCategory === 'fertilizers' || activeCategory === 'diseases') && (
                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">
                    زمان / مرحله فنولوژی توصیه شده
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: ارزنو تا پر شدن مغز / اسفند ماه"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.recommendedStage || ''}
                    onChange={e => setForm({ ...form, recommendedStage: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">
                  توضیحات تکمیلی، نحوه مصرف، دوز یا علائم خسارت
                </label>
                <textarea
                  rows={3}
                  placeholder="دستورالعمل جامع، علائم شناسایی یا نکات فنی کارشناسی..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    checked={form.isActive !== false}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-black text-gray-800 cursor-pointer">
                    وضعیت: فعال در منوها و دراپ‌داون‌های سامانه
                  </label>
                </div>
                <span className="text-[11px] text-gray-400 font-bold">
                  {form.isActive !== false ? 'نمایش داده می‌شود' : 'مخفی'}
                </span>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-2xl shadow-lg transition text-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingItem ? 'ذخیره تغییرات واژه' : 'ثبت در جدول پایه'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition text-xs"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LookupsTab;
