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

  const [form, setForm] = useState<Partial<Visit>>({
    landId: lands[0]?.id || '',
    visitDate: getTodayJalali().formatted,
    cropYearStatus: 'سال بار (ON)',
    growthStage: 'تشکیل میوه و ارزنو شدن',
    psyllid: 'مشاهده پوره در حاشیه برگ‌ها',
    psyllaDensity: 'متوسط (۶ پوره در برگ)',
    miteStatus: 'بدون آلودگی',
    stinkbugStatus: 'بدون آلودگی',
    aphidStatus: 'بدون آلودگی',
    leafminerStatus: 'بدون آلودگی',
    otherPests: '',
    gummosis: 'بدون علائم',
    dieback: 'بدون علائم',
    alternariaStatus: 'بدون علائم',
    botrytisStatus: 'بدون علائم',
    rootRotStatus: 'بدون علائم',
    cankerStatus: 'بدون علائم',
    salinityInjury: 'بدون علائم',
    sunburnStatus: 'بدون علائم',
    windDamage: 'بدون آسیب',
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
  });

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

          <button
            onClick={() => {
              setEditingVisit(null);
              setForm({
                landId: lands[0]?.id || '',
                visitDate: getTodayJalali().formatted,
                cropYearStatus: 'سال بار (ON)',
                growthStage: 'تشکیل میوه و ارزنو شدن',
                psyllid: 'مشاهده پوره در حاشیه برگ‌ها',
                psyllaDensity: 'متوسط (۶ پوره در برگ)',
                miteStatus: 'بدون آلودگی',
                stinkbugStatus: 'بدون آلودگی',
                aphidStatus: 'بدون آلودگی',
                leafminerStatus: 'بدون آلودگی',
                otherPests: '',
                gummosis: 'بدون علائم',
                dieback: 'بدون علائم',
                salinityInjury: 'بدون علائم',
                treeVigor: 'مطلوب',
                fruitLoad: 'متوسط',
                irrigationStatus: 'مناسب',
                expertRecommendation: '',
                isApproved: false
              });
              setShowModal(true);
            }}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" /> ثبت بازدید میدانی
          </button>
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

              {/* بخش ۳: پایش آفات پسته */}
              <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60">
                  <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                    <Bug className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-gray-900">
                    پایش تخصصی آفات پسته
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">پسیل پسته (شیره خشک)</label>
                    <input
                      type="text"
                      placeholder="وضعیت مشاهده پوره و عسلک"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.psyllid || ''}
                      onChange={e => setForm({ ...form, psyllid: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">تراکم پسیل در برگ</label>
                    <input
                      type="text"
                      placeholder="مثال: کم (۱-۲ پوره)، متوسط (۵-۸)، بالا"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.psyllaDensity || ''}
                      onChange={e => setForm({ ...form, psyllaDensity: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">سن‌های پسته (سبز / قرمز)</label>
                    <input
                      type="text"
                      placeholder="بدون آلودگی / مشاهده سن"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.stinkbugStatus || ''}
                      onChange={e => setForm({ ...form, stinkbugStatus: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">کنه زنگ و کنه تارتن</label>
                    <input
                      type="text"
                      placeholder="بدون آلودگی / وجود کنه"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.miteStatus || ''}
                      onChange={e => setForm({ ...form, miteStatus: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">پروانه چوبخوار / برگخوار</label>
                    <input
                      type="text"
                      placeholder="بدون آلودگی / مشاهده خسارت"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.leafminerStatus || ''}
                      onChange={e => setForm({ ...form, leafminerStatus: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">سایر آفات (سوسک، زنبور و...)</label>
                    <input
                      type="text"
                      placeholder="توضیحات سایر آفات"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.otherPests || ''}
                      onChange={e => setForm({ ...form, otherPests: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* بخش ۴: بیماری‌ها و عوارض فیزیولوژیک */}
              <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60">
                  <div className="p-1.5 bg-rose-100 text-rose-800 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-gray-900">
                    بیماری‌ها، شوری و وضعیت شادابی درخت
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">گموز (پوسیدگی طوقه)</label>
                    <input
                      type="text"
                      placeholder="بدون علائم / وجود ترشح صمغ"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.gummosis || ''}
                      onChange={e => setForm({ ...form, gummosis: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">سرخشکیدگی شاخه‌ها (Dieback)</label>
                    <input
                      type="text"
                      placeholder="بدون علائم / خفیف / شدید"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.dieback || ''}
                      onChange={e => setForm({ ...form, dieback: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">خسارت شوری (سوختگی حاشیه برگ)</label>
                    <input
                      type="text"
                      placeholder="بدون علائم / سوختگی نوک برگ"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.salinityInjury || ''}
                      onChange={e => setForm({ ...form, salinityInjury: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">شادابی و رشد رویشی</label>
                    <select
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.treeVigor || 'مطلوب'}
                      onChange={e => setForm({ ...form, treeVigor: e.target.value })}
                    >
                      <option value="عالی و پررشد">عالی و پررشد</option>
                      <option value="مطلوب">مطلوب</option>
                      <option value="ضعیف">ضعیف و کم‌برگ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">بار محصول و خوشه‌ها</label>
                    <select
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.fruitLoad || 'متوسط'}
                      onChange={e => setForm({ ...form, fruitLoad: e.target.value })}
                    >
                      <option value="خیلی پربار">خیلی پربار</option>
                      <option value="خوب">خوب</option>
                      <option value="متوسط">متوسط</option>
                      <option value="کم">کم</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">کمبودهای تغذیه‌ای مشهود</label>
                    <input
                      type="text"
                      placeholder="مثال: زردی آهن، کمبود روی، کمبود پتاسیم"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
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

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div><span className="text-gray-400">باغدار:</span> <span className="font-bold text-gray-800">{getOwnerByLand(viewingVisit.landId)}</span></div>
                <div><span className="text-gray-400">مرحله رشدی:</span> <span className="font-bold text-gray-800">{viewingVisit.growthStage || '---'}</span></div>
                <div><span className="text-gray-400">پسیل پسته:</span> <span className="font-bold text-gray-800">{viewingVisit.psyllid || 'بدون آلودگی'}</span></div>
                <div><span className="text-gray-400">تراکم پسیل:</span> <span className="font-bold text-gray-800">{viewingVisit.psyllaDensity || '---'}</span></div>
                <div><span className="text-gray-400">شادابی:</span> <span className="font-bold text-gray-800">{viewingVisit.treeVigor}</span></div>
                <div><span className="text-gray-400">بار محصول:</span> <span className="font-bold text-gray-800">{viewingVisit.fruitLoad}</span></div>
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
