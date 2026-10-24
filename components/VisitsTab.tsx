import React, { useState } from 'react';
import { Visit, Land, Owner, User, LookupItem, Task, TaskCategory } from '../types';
import { 
  ClipboardCheck, Plus, Search, Edit2, Trash2, CheckCircle2, Clock, AlertTriangle, 
  Bug, ShieldAlert, Eye, X, Filter, FileText, Check, Sparkles, FlaskConical, Sprout, Tag,
  Sun, CloudSun, Cloud, CloudRain, Wind, Thermometer, Droplets, RefreshCw, ShieldCheck,
  ArrowRight, CheckCheck
} from 'lucide-react';
import { JalaliDatePicker } from './JalaliDatePicker';
import { getTodayJalali, toPersianNumbers, jalaliToISODate, parseJalaliString } from '../jalaliDate';
import { fetchAgriWeather } from '../weatherService';

interface VisitsTabProps {
  visits: Visit[];
  setVisits: (data: Visit[] | ((prev: Visit[]) => Visit[])) => void;
  tasks?: Task[];
  setTasks?: (data: Task[] | ((prev: Task[]) => Task[])) => void;
  lands: Land[];
  owners: Owner[];
  user: User | null;
  lookups?: LookupItem[];
  onNavigateToTasks?: () => void;
}

export const VisitsTab: React.FC<VisitsTabProps> = ({
  visits,
  setVisits,
  tasks = [],
  setTasks,
  lands,
  owners,
  user,
  lookups = [],
  onNavigateToTasks
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [viewingVisit, setViewingVisit] = useState<Visit | null>(null);
  const [autoCreateTask, setAutoCreateTask] = useState(true);

  // Active Lookup filtered sets
  const growthStages = lookups.filter(l => l.category === 'growth_stages' && l.isActive);
  const pestItems = lookups.filter(l => l.category === 'pests' && l.isActive);
  const diseaseItems = lookups.filter(l => l.category === 'diseases' && l.isActive);
  const pesticideItems = lookups.filter(l => l.category === 'pesticides' && l.isActive);
  const fertilizerItems = lookups.filter(l => l.category === 'fertilizers' && l.isActive);

  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherFetchSuccess, setWeatherFetchSuccess] = useState(false);

  const PEST_SEVERITY_OPTIONS = [
    'بدون آلودگی (سالم)',
    'بسیار کم (تک‌بوته / لکه‌ای)',
    'کم (زیر آستانه زیان اقتصادی)',
    'متوسط (در آستانه طغیان / نیاز به پایش)',
    'زیاد (نیازمند مبارزه و محلول‌پاشی فوری)',
    'بسیار شدید (طغیانی / بحرانی)'
  ];

  const PSYLLA_DENSITY_OPTIONS = [
    'بدون پوره و تخم (صفر)',
    'کم (۱ تا ۳ پوره در هر برگچه)',
    'متوسط (۴ تا ۷ پوره در هر برگچه)',
    'زیاد (۸ تا ۱۵ پوره به همراه عسلک)',
    'بسیار شدید (بیش از ۱۵ پوره و شیره خشک)'
  ];

  const DISEASE_ABIOTIC_OPTIONS = [
    'بدون علائم (سالم)',
    'علائم اولیه / مشکوک (زیر ۵٪ درختان)',
    'خفیف (۵ تا ۱۵٪ درختان)',
    'متوسط (۱۵ تا ۳۰٪ باغ)',
    'شدید (بیش از ۳۰٪ باغ / نیازمند تیمار فوری)',
    'بحرانی / فراگیر'
  ];

  const defaultFormValues: Partial<Visit> = {
    landId: lands[0]?.id || '',
    visitDate: getTodayJalali().formatted,
    cropYearStatus: 'سال بار (ON)',
    growthStage: 'تشکیل میوه و ارزنو شدن',
    // ۱. آفات حشره‌ای
    psyllid: 'بدون آلودگی (سالم)',
    psyllaDensity: 'بدون پوره و تخم (صفر)',
    stinkbugStatus: 'بدون آلودگی (سالم)',
    twigBorerStatus: 'بدون آلودگی (سالم)',
    seedWaspStatus: 'بدون آلودگی (سالم)',
    trunkBorerStatus: 'بدون آلودگی (سالم)',
    leopardMothStatus: 'بدون آلودگی (سالم)',
    carobMothStatus: 'بدون آلودگی (سالم)',
    scaleInsectStatus: 'بدون آلودگی (سالم)',
    gallAphidStatus: 'بدون آلودگی (سالم)',
    otherPests: '',
    // ۲. کنه‌ها
    spiderMiteStatus: 'بدون آلودگی (سالم)',
    otherFolivorousMitesStatus: 'بدون آلودگی (سالم)',
    miteStatus: 'بدون آلودگی (سالم)',
    // ۳. بیماری‌های قارچی
    verticilliumStatus: 'بدون علائم (سالم)',
    gummosis: 'بدون علائم (سالم)',
    dieback: 'بدون علائم (سالم)',
    alternariaStatus: 'بدون علائم (سالم)',
    aspergillusStatus: 'بدون علائم (سالم)',
    septoriaStatus: 'بدون علائم (سالم)',
    armillariaStatus: 'بدون علائم (سالم)',
    powderyMildewStatus: 'بدون علائم (سالم)',
    // ۴. بیماری‌های باکتریایی
    bacterialBlightStatus: 'بدون علائم (سالم)',
    crownGallStatus: 'بدون علائم (سالم)',
    // ۵. فیتوپلاسما و ویروس
    witchesBroomStatus: 'بدون علائم (سالم)',
    // ۶. نماتدها
    rootKnotNematodeStatus: 'بدون علائم (سالم)',
    // ۷. ناهنجاری‌های غیرزنده
    salinityInjury: 'بدون علائم (سالم)',
    springFrostStatus: 'بدون علائم (سالم)',
    blankingAndNonSplittingStatus: 'بدون علائم (سالم)',
    zincBoronDeficiencyStatus: 'بدون علائم (سالم)',
    // وضعیت عمومی درخت
    treeVigor: 'مطلوب',
    fruitLoad: 'متوسط',
    earlySplitting: 'بدون مشکل',
    blankingRate: 'نرمال',
    irrigationStatus: 'مناسب',
    soilMoisture: 'مناسب',
    nutrientDeficiency: '',
    weedStatus: 'کنترل شده',
    temperature: 30,
    humidity: 25,
    windSpeed: 10,
    weatherCondition: 'آفتابی',
    visitDurationMin: 40,
    photosTaken: 2,
    ipmApplied: '',
    labSampleTaken: false,
    nextVisitDate: '',
    expertRecommendation: '',
    isApproved: false
  };

  const [form, setForm] = useState<Partial<Visit>>(defaultFormValues);

  const handleAutoFetchWeather = async () => {
    const selLand = lands.find(l => l.id === form.landId);
    const lat = Number(selLand?.latitude) || 30.4067;
    const lng = Number(selLand?.longitude) || 55.9939;
    const locationName = selLand?.name ? `باغ: ${selLand.name}` : 'منطقه باغ';
    
    setIsFetchingWeather(true);
    setWeatherFetchSuccess(false);
    try {
      const data = await fetchAgriWeather(lat, lng, locationName);
      if (data) {
        let temp: number = data.current.temperature;
        let hum: number = data.current.relativeHumidity;
        let wind: number = data.current.windSpeed;
        let desc: string = data.current.weatherDescription;

        if (form.visitDate) {
          const parsed = parseJalaliString(form.visitDate);
          if (parsed && data.daily) {
            const iso = jalaliToISODate(parsed.year, parsed.month, parsed.day);
            const matchedDaily = data.daily.find(d => d.date === iso);
            if (matchedDaily) {
              temp = matchedDaily.tempMax;
              wind = matchedDaily.windSpeedMax;
              desc = matchedDaily.weatherDescription;
            }
          }
        }

        setForm(prev => ({
          ...prev,
          temperature: temp,
          humidity: hum,
          windSpeed: wind,
          weatherCondition: desc
        }));
        setWeatherFetchSuccess(true);
        setTimeout(() => setWeatherFetchSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to auto-fetch weather:', err);
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const getLandName = (id: string) => {
    const l = lands.find(item => item.id === id);
    return l ? (l.name || l.title) : 'نامشخص';
  };

  const getOwnerByLand = (landId: string) => {
    const l = lands.find(item => item.id === landId);
    if (!l) return '---';
    const o = owners.find(item => item.id === l.ownerId);
    return o ? o.name : '---';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.landId) {
      alert('انتخاب باغ پسته الزامی است.');
      return;
    }

    let createdTaskId: string | undefined = undefined;

    if (editingVisit) {
      setVisits(prev => prev.map(v => v.id === editingVisit.id ? { ...v, ...form as Visit } : v));
    } else {
      const newVisitId = Math.random().toString(36).substr(2, 9);
      
      // If expert recommendation is present and autoCreateTask is enabled, issue an IPM instruction (Task)
      if (form.expertRecommendation && form.expertRecommendation.trim().length > 0 && autoCreateTask && setTasks) {
        createdTaskId = Math.random().toString(36).substr(2, 9);
        const land = lands.find(l => l.id === form.landId);
        const landTitle = land ? (land.name || land.title) : 'باغ پسته';

        let autoCategory: TaskCategory = 'pest_control';
        const text = (form.expertRecommendation || '') + (form.ipmApplied || '');
        if (text.includes('کود') || text.includes('تغذیه') || text.includes('پتاسیم') || text.includes('روی') || text.includes('ازت')) {
          autoCategory = 'nutrition';
        } else if (text.includes('آبیاری') || text.includes('هرس') || text.includes('شخم') || text.includes('پیوند')) {
          autoCategory = 'agronomy';
        }

        const newTask: Task = {
          id: createdTaskId,
          landId: form.landId,
          visitId: newVisitId,
          sourceRecommendation: form.expertRecommendation,
          visitDate: form.visitDate || getTodayJalali().formatted,
          category: autoCategory,
          title: `دستورالعمل اجرایی بر اساس پایش مورخ ${form.visitDate || getTodayJalali().formatted} (${landTitle})`,
          description: form.expertRecommendation,
          dueDate: form.nextVisitDate || form.visitDate || getTodayJalali().formatted,
          createdBy: user?.id || '1',
          createdByName: user?.name || 'کارشناس پایش',
          createdAt: getTodayJalali().formatted,
          farmerDone: false,
          isConfirmed: form.isApproved || false,
          confirmedBy: form.isApproved ? (user?.id || '1') : undefined,
          confirmedByName: form.isApproved ? (user?.name || 'کارشناس ناظر') : undefined,
          confirmedAt: form.isApproved ? getTodayJalali().formatted : undefined
        };

        setTasks(prev => [newTask, ...prev]);
      }

      const newVisit: Visit = {
        id: newVisitId,
        ...(form as Visit),
        convertedToTaskId: createdTaskId,
        convertedAt: createdTaskId ? getTodayJalali().formatted : undefined
      };
      setVisits(prev => [newVisit, ...prev]);
    }
    setShowModal(false);
    setEditingVisit(null);
  };

  const toggleApproval = (id: string) => {
    setVisits(prev => prev.map(v => v.id === id ? { ...v, isApproved: !v.isApproved } : v));
  };

  const filteredVisits = visits.filter(v => {
    const matchesSearch = getLandName(v.landId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.visitDate || '').includes(searchTerm) ||
      (v.psyllid || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterApproved === 'approved') return matchesSearch && v.isApproved;
    if (filterApproved === 'pending') return matchesSearch && !v.isApproved;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-3xl border border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-800">گزارشات و پایش میدانی باغات پسته</h2>
            <p className="text-xs text-gray-500 font-bold">پایش دوره‌ای آفات (پسیل، سن)، بیماری‌ها، وضعیت تغذیه و صدور تاییدیه</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="جستجو در گزارش‌ها..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-black">
            <button
              onClick={() => setFilterApproved('all')}
              className={`px-3 py-1.5 rounded-lg transition ${filterApproved === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              همه ({visits.length})
            </button>
            <button
              onClick={() => setFilterApproved('approved')}
              className={`px-3 py-1.5 rounded-lg transition ${filterApproved === 'approved' ? 'bg-emerald-700 text-white shadow' : 'text-gray-500'}`}
            >
              تایید شده
            </button>
            <button
              onClick={() => setFilterApproved('pending')}
              className={`px-3 py-1.5 rounded-lg transition ${filterApproved === 'pending' ? 'bg-amber-600 text-white shadow' : 'text-gray-500'}`}
            >
              در انتظار
            </button>
          </div>

          {user?.role !== 'farmer' && (
            <button
              onClick={() => {
                setEditingVisit(null);
                setForm({
                  ...defaultFormValues,
                  landId: lands[0]?.id || '',
                  visitDate: getTodayJalali().formatted
                });
                setShowModal(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition"
            >
              <Plus className="w-4 h-4" /> ثبت بازدید میدانی
            </button>
          )}
        </div>
      </div>

      {/* Visits Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVisits.map(visit => {
          const landName = getLandName(visit.landId);
          const ownerName = getOwnerByLand(visit.landId);

          return (
            <div key={visit.id} className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-sm hover:border-emerald-300 transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-xl">
                      📅 {visit.visitDate}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      visit.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {visit.isApproved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {visit.isApproved ? 'تایید شده' : 'در انتظار بررسی'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {user?.role === 'farmer' ? (
                      <button
                        onClick={() => setViewingVisit(visit)}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition flex items-center gap-1 text-[11px] font-black"
                        title="مشاهده جزئیات گزارش"
                      >
                        <Eye className="w-3.5 h-3.5" /> مشاهده
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setViewingVisit(visit)}
                          className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                          title="مشاهده کامل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingVisit(visit);
                            setForm(visit);
                            setShowModal(true);
                          }}
                          className="p-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition"
                          title="ویرایش"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('آیا از حذف این گزارش بازدید اطمینان دارید؟')) {
                              setVisits(prev => prev.filter(v => v.id !== visit.id));
                            }
                          }}
                          className="p-1.5 bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="font-black text-gray-800 text-base mb-1">{landName}</h3>
                <p className="text-xs text-emerald-700 font-bold mb-2.5">باغدار: {ownerName}</p>

                {/* Weather pill badge */}
                {(visit.weatherCondition || visit.temperature !== undefined || visit.windSpeed !== undefined) && (
                  <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-[11px] text-gray-700 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>{visit.weatherCondition || 'آفتابی'}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-gray-600">
                      {visit.temperature !== undefined && (
                        <span className="flex items-center gap-0.5 text-gray-800 font-bold">
                          <Thermometer className="w-3 h-3 text-amber-600" />
                          {toPersianNumbers(Number(visit.temperature))}°C
                        </span>
                      )}
                      {visit.humidity !== undefined && (
                        <span className="flex items-center gap-0.5 text-gray-800 font-bold">
                          <Droplets className="w-3 h-3 text-sky-600" />
                          {toPersianNumbers(Number(visit.humidity))}%
                        </span>
                      )}
                      {visit.windSpeed !== undefined && (
                        <span className="flex items-center gap-0.5 text-gray-800 font-bold">
                          <Wind className="w-3 h-3 text-teal-600" />
                          {toPersianNumbers(Number(visit.windSpeed))}k
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-xs bg-gray-50/80 p-3 rounded-2xl border border-gray-200/70">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">مرحله رشدی:</span>
                    <span className="font-bold text-gray-800">{visit.growthStage || '---'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      <Bug className="w-3.5 h-3.5 text-gray-600" /> وضعیت پسیل:
                    </span>
                    <span className="font-bold text-gray-900 truncate max-w-[140px]">{visit.psyllid || 'بدون آلودگی'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">شادابی و باردهی:</span>
                    <span className="font-bold text-gray-800">{visit.treeVigor} | بار: {visit.fruitLoad}</span>
                  </div>
                  {visit.expertRecommendation && (
                    <div className="pt-2 border-t border-gray-200 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-medium">توصیه کارشناسی:</span>
                        {(() => {
                          const isConverted = !!visit.convertedToTaskId || tasks.some(t => t.visitId === visit.id);
                          if (isConverted) {
                            return (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" /> دستورالعمل صادر شده
                              </span>
                            );
                          }
                          return (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-amber-700" /> پیش‌نویس توصیه
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-gray-700 font-bold line-clamp-2">{visit.expertRecommendation}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
                {user?.role === 'farmer' && (
                  <button
                    type="button"
                    onClick={() => setViewingVisit(visit)}
                    className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    مشاهده کامل گزارش
                  </button>
                )}

                {(user?.role === 'admin' || user?.role === 'operator' || user?.role === 'expert') && (
                  <button
                    onClick={() => toggleApproval(visit.id)}
                    className={`text-xs font-black px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      visit.isApproved
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm'
                    }`}
                  >
                    {visit.isApproved ? 'لغو تایید' : 'تایید رسمی گزارش'}
                  </button>
                )}

                {visit.expertRecommendation && onNavigateToTasks && (
                  <button
                    type="button"
                    onClick={onNavigateToTasks}
                    className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
                    title="مشاهده در بخش دستورالعمل‌ها"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-700" />
                    کارتابل دستورالعمل‌ها
                  </button>
                )}

                {visit.nextVisitDate && (
                  <span className="text-[11px] text-gray-500 font-bold mr-auto">
                    بازدید بعدی: {visit.nextVisitDate}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredVisits.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 border-2 border-dashed rounded-3xl">
            هیچ گزارش بازدیدی ثبت نشده است.
          </div>
        )}
      </div>

      {/* Modal: New / Edit Visit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-black text-gray-800">
                  {editingVisit ? 'ویرایش فرم بازدید کارشناسی باغات پسته' : 'ثبت گزارش بازدید میدانی جدید'}
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-0.5">ثبت تخصصی پایش آفات، بیماری‌ها، وضعیت درختان و توصیه‌های باغبانی</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* بخش ۱: اطلاعات عمومی */}
              <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-gray-900">
                    مشخصات پایه بازدید و فنولوژی
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">انتخاب باغ پسته *</label>
                    <select
                      required
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.landId || ''}
                      onChange={e => setForm({ ...form, landId: e.target.value })}
                    >
                      <option value="">انتخاب قطعه باغ...</option>
                      {lands.map(l => (
                        <option key={l.id} value={l.id}>{l.name || l.title} (مالک: {getOwnerByLand(l.id)})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    {(() => {
                      const selLand = lands.find(l => l.id === form.landId);
                      return (
                        <JalaliDatePicker
                          required
                          label="تاریخ بازدید"
                          placeholder="۱۴۰۵/۰۵/۲۵"
                          value={form.visitDate || ''}
                          latitude={Number(selLand?.latitude) || 30.4067}
                          longitude={Number(selLand?.longitude) || 55.9939}
                          locationName={selLand?.name ? `باغ: ${selLand.name}` : undefined}
                          onChange={val => setForm(prev => ({ ...prev, visitDate: val }))}
                        />
                      );
                    })()}
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">وضعیت سال بار</label>
                    <select
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.cropYearStatus || 'سال بار (ON)'}
                      onChange={e => setForm({ ...form, cropYearStatus: e.target.value })}
                    >
                      <option value="سال بار (ON)">سال باردهی (ON - پربار)</option>
                      <option value="سال استراحت (OFF)">سال استراحت (OFF - کم‌بار)</option>
                      <option value="متوسط">متوسط / نرمال</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-black text-gray-700">مرحله فنولوژیکی و رشدی</label>
                      <span className="text-[10px] text-gray-500 font-bold">انتخاب از جدول پایه یا یادداشت دستی</span>
                    </div>
                    {growthStages.length > 0 ? (
                      <div className="space-y-1.5">
                        <select
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                          value={form.growthStage || ''}
                          onChange={e => setForm({ ...form, growthStage: e.target.value })}
                        >
                          <option value="">-- انتخاب مرحله رشدی پسته --</option>
                          {growthStages.map(stg => (
                            <option key={stg.id} value={stg.title}>
                              {stg.title} {stg.description ? `(${stg.description.slice(0, 35)}...)` : ''}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="یا یادداشت دستی مرحله رشدی..."
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                          value={form.growthStage || ''}
                          onChange={e => setForm({ ...form, growthStage: e.target.value })}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="مثال: تورم جوانه، پس از گلدهی، ارزنو، پر شدن مغز، خندانی"
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        value={form.growthStage || ''}
                        onChange={e => setForm({ ...form, growthStage: e.target.value })}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* بخش ۲: شرایط جوی و داده‌های ثبت هواشناسی */}
              <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-gray-200/60">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-sky-100 text-sky-800 rounded-lg">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900">
                        داده‌های جوی و هواشناسی در زمان بازدید
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                        ثبت دما، رطوبت، باد و ارزیابی ایمنی محلول‌پاشی
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoFetchWeather}
                    disabled={isFetchingWeather}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                      isFetchingWeather 
                        ? 'bg-gray-200 text-gray-500 cursor-wait'
                        : weatherFetchSuccess
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-sm'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingWeather ? 'animate-spin' : ''}`} />
                    {isFetchingWeather ? 'در حال دریافت...' : weatherFetchSuccess ? '✓ داده‌های زنده بارگذاری شد' : 'دریافت خودکار از ایستگاه هواشناسی باغ'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  {/* فیلد ۱: دما */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-gray-500" />
                      دما (°C)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="مثال: ۳۲"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.temperature ?? ''}
                      onChange={e => setForm({ ...form, temperature: e.target.value === '' ? undefined : Number(e.target.value) })}
                    />
                  </div>

                  {/* فیلد ۲: رطوبت نسبی */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-gray-500" />
                      رطوبت نسبی (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="مثال: ۲۵"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.humidity ?? ''}
                      onChange={e => setForm({ ...form, humidity: e.target.value === '' ? undefined : Number(e.target.value) })}
                    />
                  </div>

                  {/* فیلد ۳: سرعت باد */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-gray-500" />
                      سرعت باد (km/h)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="مثال: ۱۲"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.windSpeed ?? ''}
                      onChange={e => setForm({ ...form, windSpeed: e.target.value === '' ? undefined : Number(e.target.value) })}
                    />
                  </div>

                  {/* فیلد ۴: وضعیت آب و هوا */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 flex items-center gap-1">
                      <CloudSun className="w-3.5 h-3.5 text-gray-500" />
                      وضعیت آب و هوا
                    </label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.weatherCondition || 'آفتابی'}
                      onChange={e => setForm({ ...form, weatherCondition: e.target.value })}
                    >
                      <option value="آفتابی">☀️ آفتابی و صاف</option>
                      <option value="صاف و گرم">☀️ صاف و گرم</option>
                      <option value="نیمه ابری">⛅ نیمه ابری</option>
                      <option value="ابری">☁️ تمام ابری</option>
                      <option value="بارانی">🌧️ بارانی / نم‌نم باران</option>
                      <option value="رعد و برق">⛈️ رگبار و رعدوبرق</option>
                      <option value="وزش باد شدید">💨 وزش باد شدید / طوفانی</option>
                      <option value="گرد و غبار">🌫️ غبارآلود / طوفان شن</option>
                    </select>
                  </div>
                </div>

                {/* Quick select chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-gray-500 font-bold ml-1">انتخاب سریع وضعیت:</span>
                  {[
                    { label: 'آفتابی', icon: '☀️' },
                    { label: 'نیمه ابری', icon: '⛅' },
                    { label: 'ابری', icon: '☁️' },
                    { label: 'بارانی', icon: '🌧️' },
                    { label: 'وزش باد شدید', icon: '💨' },
                    { label: 'گرد و غبار', icon: '🌫️' }
                  ].map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setForm({ ...form, weatherCondition: item.label })}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                        form.weatherCondition === item.label
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>

                {/* Spraying safety recommendation bar based on input values */}
                {(form.windSpeed !== undefined || form.temperature !== undefined || form.weatherCondition) && (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                    (Number(form.windSpeed) > 15 || form.weatherCondition === 'بارانی' || form.weatherCondition === 'وزش باد شدید')
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      {(Number(form.windSpeed) > 15 || form.weatherCondition === 'بارانی' || form.weatherCondition === 'وزش باد شدید') ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span>
                        {(Number(form.windSpeed) > 15 || form.weatherCondition === 'بارانی' || form.weatherCondition === 'وزش باد شدید')
                          ? `هشدار شرایط نامساعد: سرعت باد (${form.windSpeed || 0} km/h) یا بارش؛ عملیات محلول‌پاشی/سم‌پاشی توصیه نمی‌شود.`
                          : `ارزیابی ایمنی سم‌پاشی: شرایط جوی مساعد است (باد آرام ${form.windSpeed || 0} km/h و هوای پایدار).`
                        }
                      </span>
                    </div>
                    {form.temperature !== undefined && (
                      <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-gray-200 shrink-0">
                        {toPersianNumbers(Number(form.temperature))}°C
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* گروه ۱: آفات حشره‌ای */}
              <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/80 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                      <Bug className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900">
                        گروه ۱: آفات حشره‌ای
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold">
                        انتخاب میزان و شدت آلودگی هر یک از آفات حشره‌ای پسته
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg">
                    ۹ شاخص تخصصی
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ۱. پسیل معمولی پسته */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">پسیل معمولی پسته</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.psyllid || 'بدون آلودگی (سالم)'}
                      onChange={e => setForm({ ...form, psyllid: e.target.value })}
                    >
                      {!PEST_SEVERITY_OPTIONS.includes(form.psyllid || '') && form.psyllid && (
                        <option value={form.psyllid}>{form.psyllid}</option>
                      )}
                      {PEST_SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* تراکم پسیل در برگ */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">تراکم پوره پسیل در برگ</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.psyllaDensity || 'بدون پوره و تخم (صفر)'}
                      onChange={e => setForm({ ...form, psyllaDensity: e.target.value })}
                    >
                      {!PSYLLA_DENSITY_OPTIONS.includes(form.psyllaDensity || '') && form.psyllaDensity && (
                        <option value={form.psyllaDensity}>{form.psyllaDensity}</option>
                      )}
                      {PSYLLA_DENSITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۲. سن‌های پسته (سن سبز و...) */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">سن‌های پسته (سن سبز و...)</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.stinkbugStatus || 'بدون آلودگی (سالم)'}
                      onChange={e => setForm({ ...form, stinkbugStatus: e.target.value })}
                    >
                      {!PEST_SEVERITY_OPTIONS.includes(form.stinkbugStatus || '') && form.stinkbugStatus && (
                        <option value={form.stinkbugStatus}>{form.stinkbugStatus}</option>
                      )}
                      {PEST_SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۳. سرشاخه‌خوار پسته */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">سرشاخه‌خوار پسته</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.twigBorerStatus || 'بدون آلودگی (سالم)'}
                      onChange={e => setForm({ ...form, twigBorerStatus: e.target.value })}
                    >
                      {PEST_SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۴. زنبور مغزخوار پسته */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">زنبور مغزخوار پسته</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.seedWaspStatus || 'بدون آلودگی (سالم)'}
                      onChange={e => setForm({ ...form, seedWaspStatus: e.target.value })}
                    >
                      {PEST_SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۵. تنه‌خوار (سوسک چوب‌خوار) */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">تنه‌خوار (سوسک چوب‌خوار)</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.trunkBorerStatus || 'بدون آلودگی (سالم)'}
                      onChange={e => setForm({ ...form, trunkBorerStatus: e.target.value })}
                    >
                      {PEST_SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۶. کرم خراط */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">کرم خراط</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.leopardMothStatus || 'بدون آلودگی (سالم)'}
                      onChange={e => setForm({ ...form, leopardMothStatus: e.target.value })}
                    >
                      {PEST_SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۷. کرم گلوگاه / پروانه میوه */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">کرم گلوگاه / پروانه میوه</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.carobMothStatus || 'بدون آلودگی (سالم)'}
                      onChange={e => setForm({ ...form, carobMothStatus: e.target.value })}
                    >
                      {PEST_SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۸. شپشک‌های سپردار */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">شپشک‌های سپردار</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.scaleInsectStatus || 'بدون آلودگی (سالم)'}
                      onChange={e => setForm({ ...form, scaleInsectStatus: e.target.value })}
                    >
                      {PEST_SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۹. شته‌های گال‌ساز */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">شته‌های گال‌ساز</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.gallAphidStatus || 'بدون آلودگی (سالم)'}
                      onChange={e => setForm({ ...form, gallAphidStatus: e.target.value })}
                    >
                      {PEST_SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* توضیحات تکمیلی آفات */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-black text-gray-700 mb-1 block">یادداشت تکمیلی آفات حشره‌ای (اختیاری)</label>
                    <input
                      type="text"
                      placeholder="توضیحات تکمیلی در خصوص کانون آلودگی یا سایر حشرات مشاهده‌شده..."
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.otherPests || ''}
                      onChange={e => setForm({ ...form, otherPests: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* گروه ۲: کنه‌ها */}
              <div className="bg-orange-50/40 p-5 rounded-2xl border border-orange-200/80 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-orange-200/60">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 text-orange-800 rounded-lg">
                      <Bug className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900">
                        گروه ۲: کنه‌ها
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold">
                        ارزیابی آلودگی کنه‌های تارعنکبوتی و برگ‌خوار
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-orange-100 text-orange-800 px-2.5 py-1 rounded-lg">
                    ۲ شاخص تخصصی
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ۱. کنه تارعنکبوتی */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">کنه تارعنکبوتی</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.spiderMiteStatus || form.miteStatus || 'بدون آلودگی (سالم)'}
                      onChange={e => setForm({ ...form, spiderMiteStatus: e.target.value, miteStatus: e.target.value })}
                    >
                      {!PEST_SEVERITY_OPTIONS.includes(form.spiderMiteStatus || form.miteStatus || '') && (form.spiderMiteStatus || form.miteStatus) && (
                        <option value={form.spiderMiteStatus || form.miteStatus}>{form.spiderMiteStatus || form.miteStatus}</option>
                      )}
                      {PEST_SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۲. سایر کنه‌های برگ‌خوار */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">سایر کنه‌های برگ‌خوار</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.otherFolivorousMitesStatus || 'بدون آلودگی (سالم)'}
                      onChange={e => setForm({ ...form, otherFolivorousMitesStatus: e.target.value })}
                    >
                      {PEST_SEVERITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* گروه ۳: بیماری‌های قارچی */}
              <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-200/80 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-100 text-rose-800 rounded-lg">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900">
                        گروه ۳: بیماری‌های قارچی
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold">
                        پایش بیماری‌های قارچی ریشه، طوقه، سرشاخه، برگ و میوه پسته
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg">
                    ۸ شاخص تخصصی
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* ۱. پژمردگی ورتیسیلیومی */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">پژمردگی ورتیسیلیومی</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.verticilliumStatus || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, verticilliumStatus: e.target.value })}
                    >
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۲. پوسیدگی ریشه و طوقه (گموز) */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">پوسیدگی ریشه و طوقه (گموز)</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.gummosis || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, gummosis: e.target.value })}
                    >
                      {!DISEASE_ABIOTIC_OPTIONS.includes(form.gummosis || '') && form.gummosis && (
                        <option value={form.gummosis}>{form.gummosis}</option>
                      )}
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۳. سرشاخه‌خشکیدگی / بوتریوسفاریا */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">سرشاخه‌خشکیدگی / بوتریوسفاریا</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.dieback || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, dieback: e.target.value })}
                    >
                      {!DISEASE_ABIOTIC_OPTIONS.includes(form.dieback || '') && form.dieback && (
                        <option value={form.dieback}>{form.dieback}</option>
                      )}
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۴. لکه برگی آلترناریایی (لکه سیاه) */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">لکه برگی آلترناریایی (لکه سیاه)</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.alternariaStatus || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, alternariaStatus: e.target.value })}
                    >
                      {!DISEASE_ABIOTIC_OPTIONS.includes(form.alternariaStatus || '') && form.alternariaStatus && (
                        <option value={form.alternariaStatus}>{form.alternariaStatus}</option>
                      )}
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۵. آلودگی آسپرژیلوسی میوه (خطر آفلاتوکسین) */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">آلودگی آسپرژیلوسی میوه (خطر آفلاتوکسین)</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.aspergillusStatus || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, aspergillusStatus: e.target.value })}
                    >
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۶. لکه برگی سپتوریایی */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">لکه برگی سپتوریایی</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.septoriaStatus || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, septoriaStatus: e.target.value })}
                    >
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۷. پوسیدگی آرمیلاریایی ریشه */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">پوسیدگی آرمیلاریایی ریشه</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.armillariaStatus || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, armillariaStatus: e.target.value })}
                    >
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۸. سفیدک سطحی */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">سفیدک سطحی</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.powderyMildewStatus || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, powderyMildewStatus: e.target.value })}
                    >
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* گروه‌های ۴، ۵ و ۶ در یک ردیف ساختاریافته: باکتریایی، فیتوپلاسما/ویروس، نماتدها */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* گروه ۴: بیماری‌های باکتریایی */}
                <div className="bg-purple-50/40 p-5 rounded-2xl border border-purple-200/80 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 text-purple-800 rounded-lg">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-gray-900">
                        گروه ۴: بیماری‌های باکتریایی
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-black text-gray-700 mb-1 block">سوختگی باکتریایی</label>
                      <select
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        value={form.bacterialBlightStatus || 'بدون علائم (سالم)'}
                        onChange={e => setForm({ ...form, bacterialBlightStatus: e.target.value })}
                      >
                        {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-700 mb-1 block">سرطان طوقه (گال طوقه)</label>
                      <select
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        value={form.crownGallStatus || 'بدون علائم (سالم)'}
                        onChange={e => setForm({ ...form, crownGallStatus: e.target.value })}
                      >
                        {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* گروه ۵: فیتوپلاسما و ویروس */}
                <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-200/80 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-gray-900">
                        گروه ۵: فیتوپلاسما و ویروس
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-black text-gray-700 mb-1 block">جاروک پسته (جارو جادویی / بوته‌ای شدن سرشاخه)</label>
                      <select
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        value={form.witchesBroomStatus || 'بدون علائم (سالم)'}
                        onChange={e => setForm({ ...form, witchesBroomStatus: e.target.value })}
                      >
                        {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* گروه ۶: نماتدها */}
                <div className="bg-stone-100/70 p-5 rounded-2xl border border-stone-200/80 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-stone-200 text-stone-800 rounded-lg">
                        <Tag className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-gray-900">
                        گروه ۶: نماتدها
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-black text-gray-700 mb-1 block">نماتد ریشه‌گره</label>
                      <select
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        value={form.rootKnotNematodeStatus || 'بدون علائم (سالم)'}
                        onChange={e => setForm({ ...form, rootKnotNematodeStatus: e.target.value })}
                      >
                        {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* گروه ۷: ناهنجاری‌های غیرزنده و وضعیت عمومی درخت */}
              <div className="bg-teal-50/40 p-5 rounded-2xl border border-teal-200/80 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900">
                        گروه ۷: ناهنجاری‌های غیرزنده و شاخص‌های تغذیه‌ای-محیطی
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold">
                        تنش‌های محیطی، شوری، سرمازدگی، پوکی و کمبود عناصر
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-teal-100 text-teal-800 px-2.5 py-1 rounded-lg">
                    ۴ شاخص اصلی + وضعیت درخت
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* ۱. شوری خاک و آب */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">شوری خاک و آب</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.salinityInjury || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, salinityInjury: e.target.value })}
                    >
                      {!DISEASE_ABIOTIC_OPTIONS.includes(form.salinityInjury || '') && form.salinityInjury && (
                        <option value={form.salinityInjury}>{form.salinityInjury}</option>
                      )}
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۲. سرمازدگی بهاره */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">سرمازدگی بهاره</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.springFrostStatus || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, springFrostStatus: e.target.value })}
                    >
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۳. پوکی و خندانی نشدن */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">پوکی و خندانی نشدن</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.blankingAndNonSplittingStatus || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, blankingAndNonSplittingStatus: e.target.value })}
                    >
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* ۴. کمبود روی (روزت) و بور */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">کمبود روی (روزت) و بور</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.zincBoronDeficiencyStatus || 'بدون علائم (سالم)'}
                      onChange={e => setForm({ ...form, zincBoronDeficiencyStatus: e.target.value })}
                    >
                      {DISEASE_ABIOTIC_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* شادابی و رشد رویشی */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">شادابی و رشد رویشی</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.treeVigor || 'مطلوب'}
                      onChange={e => setForm({ ...form, treeVigor: e.target.value })}
                    >
                      <option value="عالی و پررشد">عالی و پررشد</option>
                      <option value="مطلوب">مطلوب</option>
                      <option value="ضعیف">ضعیف و کم‌برگ</option>
                    </select>
                  </div>

                  {/* بار محصول و خوشه‌ها */}
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">بار محصول و خوشه‌ها</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.fruitLoad || 'متوسط'}
                      onChange={e => setForm({ ...form, fruitLoad: e.target.value })}
                    >
                      <option value="خیلی پربار">خیلی پربار</option>
                      <option value="خوب">خوب</option>
                      <option value="متوسط">متوسط</option>
                      <option value="کم">کم</option>
                    </select>
                  </div>

                  {/* سایر کمبودهای تغذیه‌ای */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-black text-gray-700 mb-1 block">یادداشت سایر کمبودهای تغذیه‌ای (اختیاری)</label>
                    <input
                      type="text"
                      placeholder="مثال: زردی آهن، کمبود پتاسیم، کلسیم یا نیتروژن..."
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.nutrientDeficiency || ''}
                      onChange={e => setForm({ ...form, nutrientDeficiency: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* بخش ۵: توصیه کارشناسی و تکمیلی */}
              <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-gray-900">
                    توصیه تخصصی کارشناس و اقدامات
                  </h4>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-black text-gray-700">توصیه کارشناسی، نسخه محلول‌پاشی و تغذیه *</label>
                    <span className="text-[10px] text-gray-500 font-bold">درج سریع از جداول پایه:</span>
                  </div>

                  {(pesticideItems.length > 0 || fertilizerItems.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-2 bg-white p-2 rounded-xl border border-gray-200 max-h-24 overflow-y-auto">
                      {pesticideItems.map(p => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => {
                            const snippet = `• سم/ترکیب: ${p.title} ${p.description ? `(${p.description})` : ''}\n`;
                            setForm(prev => ({
                              ...prev,
                              expertRecommendation: (prev.expertRecommendation || '') + (prev.expertRecommendation ? '\n' : '') + snippet
                            }));
                          }}
                          className="bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                          title="کلیک برای درج در نسخه"
                        >
                          <FlaskConical className="w-2.5 h-2.5 text-gray-500" />
                          + {p.title}
                        </button>
                      ))}
                      {fertilizerItems.map(f => (
                        <button
                          type="button"
                          key={f.id}
                          onClick={() => {
                            const snippet = `• کود/تغذیه: ${f.title} ${f.description ? `(${f.description})` : ''}\n`;
                            setForm(prev => ({
                              ...prev,
                              expertRecommendation: (prev.expertRecommendation || '') + (prev.expertRecommendation ? '\n' : '') + snippet
                            }));
                          }}
                          className="bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                          title="کلیک برای درج در نسخه"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-gray-500" />
                          + {f.title}
                        </button>
                      ))}
                    </div>
                  )}

                  <textarea
                    rows={4}
                    placeholder="دستورالعمل جامع محلول‌پاشی، کوددهی، تنظیم دور آبیاری و مبارزه با آفات..."
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.expertRecommendation || ''}
                    onChange={e => setForm({ ...form, expertRecommendation: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {(() => {
                      const selLand = lands.find(l => l.id === form.landId);
                      return (
                        <JalaliDatePicker
                          label="تاریخ پیشنهادی بازدید بعدی"
                          placeholder="۱۴۰۵/۰۶/۰۱"
                          value={form.nextVisitDate || ''}
                          latitude={Number(selLand?.latitude) || 30.4067}
                          longitude={Number(selLand?.longitude) || 55.9939}
                          locationName={selLand?.name ? `باغ: ${selLand.name}` : undefined}
                          onChange={val => setForm(prev => ({ ...prev, nextVisitDate: val }))}
                        />
                      );
                    })()}
                  </div>

                  <div className="flex flex-col gap-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-gray-800">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        checked={form.isApproved || false}
                        onChange={e => setForm({ ...form, isApproved: e.target.checked })}
                      />
                      تایید رسمی این گزارش بازدید
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-emerald-800">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        checked={autoCreateTask}
                        onChange={e => setAutoCreateTask(e.target.checked)}
                      />
                      صدور همزمان توصیه کارشناسی به عنوان دستورالعمل در بخش دستورالعمل‌ها (IPM)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-2xl shadow-lg transition text-xs"
                >
                  {editingVisit ? 'ذخیره تغییرات گزارش' : 'ثبت نهایی گزارش بازدید'}
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

      {/* Modal: View Visit Details */}
      {viewingVisit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-black text-gray-800">
                  جزئیات کامل گزارش بازدید {getLandName(viewingVisit.landId)}
                </h3>
                <span className="text-xs font-mono font-bold text-gray-500">تاریخ ثبت: {viewingVisit.visitDate}</span>
              </div>
              <button onClick={() => setViewingVisit(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Weather Status Box in Details View */}
              {(viewingVisit.weatherCondition || viewingVisit.temperature !== undefined || viewingVisit.humidity !== undefined || viewingVisit.windSpeed !== undefined) && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-gray-900 flex items-center gap-1.5 text-xs">
                      <Sun className="w-4 h-4 text-amber-500" /> شرایط و داده‌های هواشناسی ثبت‌شده
                    </h4>
                    <span className="bg-white text-gray-800 border border-gray-200 px-2.5 py-0.5 rounded-lg font-black text-[11px]">
                      {viewingVisit.weatherCondition || 'آفتابی'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-white p-2 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center justify-center gap-1">
                        <Thermometer className="w-3 h-3 text-amber-600" /> دمای محیط
                      </span>
                      <span className="font-black text-gray-800 font-mono text-xs">
                        {viewingVisit.temperature !== undefined ? `${toPersianNumbers(Number(viewingVisit.temperature))} °C` : '---'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-sky-600" /> رطوبت نسبی
                      </span>
                      <span className="font-black text-gray-800 font-mono text-xs">
                        {viewingVisit.humidity !== undefined ? `${toPersianNumbers(Number(viewingVisit.humidity))} %` : '---'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center justify-center gap-1">
                        <Wind className="w-3 h-3 text-teal-600" /> سرعت باد
                      </span>
                      <span className="font-black text-gray-800 font-mono text-xs">
                        {viewingVisit.windSpeed !== undefined ? `${toPersianNumbers(Number(viewingVisit.windSpeed))} km/h` : '---'}
                      </span>
                    </div>
                  </div>

                  {/* Spray suitability assessment */}
                  <div className="text-[11px] font-bold text-gray-700 bg-white p-2 rounded-xl border border-gray-200 flex items-center gap-1.5">
                    {(Number(viewingVisit.windSpeed) > 15 || viewingVisit.weatherCondition === 'بارانی' || viewingVisit.weatherCondition === 'وزش باد شدید') ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-amber-900">سرعت باد بالا یا بارندگی در زمان بازدید؛ محلول‌پاشی غیرایمن ارزیابی شده است.</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-900">شرایط اقلیمی مساعد برای پایش و سم‌پاشی استاندارد.</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* اطلاعات پایه */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div><span className="text-gray-400 block mb-0.5">باغدار:</span> <span className="font-bold text-gray-800">{getOwnerByLand(viewingVisit.landId)}</span></div>
                <div><span className="text-gray-400 block mb-0.5">مرحله رشدی:</span> <span className="font-bold text-gray-800">{viewingVisit.growthStage || '---'}</span></div>
                <div><span className="text-gray-400 block mb-0.5">شادابی درختان:</span> <span className="font-bold text-gray-800">{viewingVisit.treeVigor || '---'}</span></div>
                <div><span className="text-gray-400 block mb-0.5">بار محصول:</span> <span className="font-bold text-gray-800">{viewingVisit.fruitLoad || '---'}</span></div>
              </div>

              {/* نمایش گروه‌بندی شده آفات و بیماری‌ها */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* گروه ۱: آفات حشره‌ای */}
                <div className="bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200/70 space-y-1.5">
                  <h5 className="font-black text-amber-900 border-b border-amber-200/60 pb-1 mb-2">۱. آفات حشره‌ای</h5>
                  <div className="flex justify-between"><span>پسیل معمولی پسته:</span><strong className="text-gray-900">{viewingVisit.psyllid || 'بدون آلودگی'}</strong></div>
                  <div className="flex justify-between"><span>تراکم پوره پسیل:</span><strong className="text-gray-900">{viewingVisit.psyllaDensity || '---'}</strong></div>
                  <div className="flex justify-between"><span>سن‌های پسته:</span><strong className="text-gray-900">{viewingVisit.stinkbugStatus || 'بدون آلودگی'}</strong></div>
                  <div className="flex justify-between"><span>سرشاخه‌خوار پسته:</span><strong className="text-gray-900">{viewingVisit.twigBorerStatus || 'بدون آلودگی'}</strong></div>
                  <div className="flex justify-between"><span>زنبور مغزخوار پسته:</span><strong className="text-gray-900">{viewingVisit.seedWaspStatus || 'بدون آلودگی'}</strong></div>
                  <div className="flex justify-between"><span>تنه‌خوار (سوسک چوب‌خوار):</span><strong className="text-gray-900">{viewingVisit.trunkBorerStatus || 'بدون آلودگی'}</strong></div>
                  <div className="flex justify-between"><span>کرم خراط:</span><strong className="text-gray-900">{viewingVisit.leopardMothStatus || 'بدون آلودگی'}</strong></div>
                  <div className="flex justify-between"><span>کرم گلوگاه / پروانه میوه:</span><strong className="text-gray-900">{viewingVisit.carobMothStatus || 'بدون آلودگی'}</strong></div>
                  <div className="flex justify-between"><span>شپشک‌های سپردار:</span><strong className="text-gray-900">{viewingVisit.scaleInsectStatus || 'بدون آلودگی'}</strong></div>
                  <div className="flex justify-between"><span>شته‌های گال‌ساز:</span><strong className="text-gray-900">{viewingVisit.gallAphidStatus || 'بدون آلودگی'}</strong></div>
                </div>

                {/* گروه ۳: بیماری‌های قارچی */}
                <div className="bg-rose-50/40 p-3.5 rounded-2xl border border-rose-200/70 space-y-1.5">
                  <h5 className="font-black text-rose-900 border-b border-rose-200/60 pb-1 mb-2">۳. بیماری‌های قارچی</h5>
                  <div className="flex justify-between"><span>پژمردگی ورتیسیلیومی:</span><strong className="text-gray-900">{viewingVisit.verticilliumStatus || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>پوسیدگی ریشه و طوقه (گموز):</span><strong className="text-gray-900">{viewingVisit.gummosis || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>سرشاخه‌خشکیدگی / بوتریوسفاریا:</span><strong className="text-gray-900">{viewingVisit.dieback || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>لکه برگی آلترناریایی:</span><strong className="text-gray-900">{viewingVisit.alternariaStatus || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>آلودگی آسپرژیلوسی (آفلاتوکسین):</span><strong className="text-gray-900">{viewingVisit.aspergillusStatus || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>لکه برگی سپتوریایی:</span><strong className="text-gray-900">{viewingVisit.septoriaStatus || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>پوسیدگی آرمیلاریایی ریشه:</span><strong className="text-gray-900">{viewingVisit.armillariaStatus || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>سفیدک سطحی:</span><strong className="text-gray-900">{viewingVisit.powderyMildewStatus || 'بدون علائم'}</strong></div>
                </div>

                {/* گروه ۲، ۴، ۵، ۶ */}
                <div className="bg-purple-50/40 p-3.5 rounded-2xl border border-purple-200/70 space-y-1.5">
                  <h5 className="font-black text-purple-900 border-b border-purple-200/60 pb-1 mb-2">۲، ۴، ۵ و ۶. کنه‌ها، باکتریایی، ویروس و نماتد</h5>
                  <div className="flex justify-between"><span>کنه تارعنکبوتی:</span><strong className="text-gray-900">{viewingVisit.spiderMiteStatus || viewingVisit.miteStatus || 'بدون آلودگی'}</strong></div>
                  <div className="flex justify-between"><span>سایر کنه‌های برگ‌خوار:</span><strong className="text-gray-900">{viewingVisit.otherFolivorousMitesStatus || 'بدون آلودگی'}</strong></div>
                  <div className="flex justify-between"><span>سوختگی باکتریایی:</span><strong className="text-gray-900">{viewingVisit.bacterialBlightStatus || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>سرطان طوقه (گال طوقه):</span><strong className="text-gray-900">{viewingVisit.crownGallStatus || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>جاروک پسته (فیتوپلاسما):</span><strong className="text-gray-900">{viewingVisit.witchesBroomStatus || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>نماتد ریشه‌گره:</span><strong className="text-gray-900">{viewingVisit.rootKnotNematodeStatus || 'بدون علائم'}</strong></div>
                </div>

                {/* گروه ۷: ناهنجاری‌های غیرزنده */}
                <div className="bg-teal-50/40 p-3.5 rounded-2xl border border-teal-200/70 space-y-1.5">
                  <h5 className="font-black text-teal-900 border-b border-teal-200/60 pb-1 mb-2">۷. ناهنجاری‌های غیرزنده</h5>
                  <div className="flex justify-between"><span>شوری خاک و آب:</span><strong className="text-gray-900">{viewingVisit.salinityInjury || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>سرمازدگی بهاره:</span><strong className="text-gray-900">{viewingVisit.springFrostStatus || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>پوکی و خندانی نشدن:</span><strong className="text-gray-900">{viewingVisit.blankingAndNonSplittingStatus || 'بدون علائم'}</strong></div>
                  <div className="flex justify-between"><span>کمبود روی (روزت) و بور:</span><strong className="text-gray-900">{viewingVisit.zincBoronDeficiencyStatus || 'بدون علائم'}</strong></div>
                  {viewingVisit.nutrientDeficiency && (
                    <div className="flex justify-between"><span>سایر کمبودها:</span><strong className="text-gray-900">{viewingVisit.nutrientDeficiency}</strong></div>
                  )}
                </div>
              </div>

              {viewingVisit.expertRecommendation && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <h4 className="font-black text-emerald-800 mb-1">توصیه کارشناسی:</h4>
                  <p className="text-gray-800 leading-relaxed font-bold">{viewingVisit.expertRecommendation}</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6 flex justify-end">
              <button
                onClick={() => setViewingVisit(null)}
                className="bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default VisitsTab;
