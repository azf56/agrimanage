import React from 'react';
import { Owner, Land, WaterSource, Visit, LabAnalysis, Task, User } from '../types';
import { 
  Trees, 
  Droplets, 
  Users, 
  ClipboardCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  Plus,
  Bug,
  Compass
} from 'lucide-react';
import { JalaliWeatherCalendar } from './JalaliWeatherCalendar';
import { toPersianNumbers } from '../jalaliDate';

interface DashboardTabProps {
  owners: Owner[];
  lands: Land[];
  waterSources: WaterSource[];
  visits: Visit[];
  labAnalyses: LabAnalysis[];
  tasks: Task[];
  user: User | null;
  onNavigate: (tab: any) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  owners,
  lands,
  waterSources,
  visits,
  labAnalyses,
  tasks,
  user,
  onNavigate
}) => {
  const totalHectares = lands.reduce((acc, l) => acc + (Number(l.areaHectares) || Number(l.area) || 0), 0);
  const openTasks = tasks.filter(t => !t.farmerDone);
  const pendingTasks = tasks.filter(t => t.farmerDone && !t.isConfirmed);
  const confirmedTasks = tasks.filter(t => t.isConfirmed);

  const approvedVisits = visits.filter(v => v.isApproved);
  const pendingVisits = visits.filter(v => !v.isApproved);
  const criticalVisits = visits.filter(v => v.psyllidSeverity === 'خیلی شدید' || v.psyllidSeverity === 'شدید');

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Compact Streamlined Header & Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 md:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
              {user?.role === 'admin' ? 'مدیر ارشد سامانه' : 
               user?.role === 'expert' ? 'کارشناس گیاه‌پزشکی و باغبانی' : 
               user?.role === 'operator' ? 'اپراتور سامانه' : 'باغدار'}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              نسخه ۲.۸
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
            خوش آمدید، {user?.name || 'کاربر گرامی'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            پایش یکپارچه سلامت باغات پسته، کنترل آفات کلیدی و برنامه تغذیه تلفیقی
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => onNavigate('visits')}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت بازدید میدانی</span>
          </button>
          
          <button 
            onClick={() => onNavigate('tasks')}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-700" />
            <span>برنامه مراقبت (IPM)</span>
          </button>

          <button 
            onClick={() => onNavigate('owners')}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-gray-500" />
            <span>باغداران</span>
          </button>
        </div>
      </div>

      {/* 2. Structured KPI Metrics with Clear Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Prominent Critical Alert Card (Highlighted Status) */}
        <div 
          onClick={() => onNavigate('visits')}
          className="lg:col-span-1 bg-amber-50/70 border border-amber-200 hover:border-amber-300 rounded-2xl p-4 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-100/80 text-amber-800 rounded-xl group-hover:scale-105 transition">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-200/50 px-2 py-0.5 rounded">
              اولویت پیگیری
            </span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-black text-amber-950 font-mono">
              {toPersianNumbers(criticalVisits.length + pendingTasks.length)}
            </div>
            <div className="text-xs font-black text-amber-900 mt-0.5">
              هشدارهای گیاه‌پزشکی و اقدامات
            </div>
          </div>

          <div className="text-[11px] text-amber-800 font-medium flex items-center justify-between border-t border-amber-200/60 pt-2">
            <span>{toPersianNumbers(criticalVisits.length)} کانون پسیل شدید</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" />
          </div>
        </div>

        {/* Standard Metric 1: Total Pistachio Orchard Area */}
        <div 
          onClick={() => onNavigate('arazi')}
          className="bg-white border border-gray-200/80 hover:border-emerald-300 rounded-2xl p-4 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl group-hover:scale-105 transition">
              <Trees className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-gray-400">سطح کل</span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-black text-gray-800 font-mono">
              {toPersianNumbers(totalHectares.toLocaleString('fa-IR'))}
              <span className="text-xs font-normal text-gray-500 mr-1">هکتار</span>
            </div>
            <div className="text-xs font-bold text-gray-700 mt-0.5">
              باغات پسته تحت پایش
            </div>
          </div>

          <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between border-t border-gray-100 pt-2">
            <span>{toPersianNumbers(lands.length)} قطعه باغ ثبت شده</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-700" />
          </div>
        </div>

        {/* Standard Metric 2: Owners & Farmers */}
        <div 
          onClick={() => onNavigate('owners')}
          className="bg-white border border-gray-200/80 hover:border-emerald-300 rounded-2xl p-4 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-gray-50 text-gray-700 rounded-xl group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-gray-400">بهره‌برداران</span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-black text-gray-800 font-mono">
              {toPersianNumbers(owners.length)}
              <span className="text-xs font-normal text-gray-500 mr-1">نفر</span>
            </div>
            <div className="text-xs font-bold text-gray-700 mt-0.5">
              مالکان و باغداران
            </div>
          </div>

          <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between border-t border-gray-100 pt-2">
            <span>اطلاعات تماس و مالکیت</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-700" />
          </div>
        </div>

        {/* Standard Metric 3: Expert Scouting Visits */}
        <div 
          onClick={() => onNavigate('visits')}
          className="bg-white border border-gray-200/80 hover:border-emerald-300 rounded-2xl p-4 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-gray-50 text-gray-700 rounded-xl group-hover:scale-105 transition">
              <ClipboardCheck className="w-5 h-5 text-gray-700" />
            </div>
            <span className="text-[11px] font-semibold text-gray-400">پایش میدانی</span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-black text-gray-800 font-mono">
              {toPersianNumbers(visits.length)}
              <span className="text-xs font-normal text-gray-500 mr-1">گزارش</span>
            </div>
            <div className="text-xs font-bold text-gray-700 mt-0.5">
              بازدیدهای کارشناسی
            </div>
          </div>

          <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between border-t border-gray-100 pt-2">
            <span>{toPersianNumbers(approvedVisits.length)} تایید شده</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-700" />
          </div>
        </div>

        {/* Standard Metric 4: Water Wells & Sources */}
        <div 
          onClick={() => onNavigate('arazi')}
          className="bg-white border border-gray-200/80 hover:border-emerald-300 rounded-2xl p-4 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-gray-50 text-gray-700 rounded-xl group-hover:scale-105 transition">
              <Droplets className="w-5 h-5 text-gray-700" />
            </div>
            <span className="text-[11px] font-semibold text-gray-400">منابع آب</span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-black text-gray-800 font-mono">
              {toPersianNumbers(waterSources.length)}
              <span className="text-xs font-normal text-gray-500 mr-1">چاه / منبع</span>
            </div>
            <div className="text-xs font-bold text-gray-700 mt-0.5">
              منابع آبیاری باغات
            </div>
          </div>

          <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between border-t border-gray-100 pt-2">
            <span>پایش EC و دبی آب</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-700" />
          </div>
        </div>

      </div>

      {/* 3. Real Shamsi Calendar & Live Weather Station Component */}
      <JalaliWeatherCalendar 
        lands={lands} 
        visits={visits} 
        tasks={tasks}
        onSelectDate={(date) => {
          // Handled inside component
        }}
      />

      {/* 4. Active Care Programs & Pest Surveillance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Tasks / IPM Protocols (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm md:text-base font-black text-gray-800 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                برنامه مراقبت یکپارچه و وظایف فعال باغبانی
              </h3>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                دستورالعمل‌های محلول‌پاشی، تغذیه خاکی و کنترل تلفیقی آفات (IPM)
              </p>
            </div>
            <button 
              onClick={() => onNavigate('tasks')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              مشاهده همه <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.slice(0, 4).map(task => {
              const land = lands.find(l => l.id === task.landId);
              return (
                <div 
                  key={task.id} 
                  className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200/70 text-gray-700">
                        {task.category === 'pest_control' ? 'کنترل آفات' : 
                         task.category === 'nutrition' ? 'تغذیه و کود' : 'عملیات باغبانی'}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        باغ: {land?.name || land?.title || 'عمومی'}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-xs sm:text-sm">{task.title}</h4>
                    {task.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-1">{task.description}</p>
                    )}
                  </div>

                  <div className="self-end md:self-center">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                      task.isConfirmed 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' 
                        : task.farmerDone 
                        ? 'bg-amber-50 text-amber-800 border border-amber-200/60' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {task.isConfirmed ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : 
                       task.farmerDone ? <Clock className="w-3 h-3 text-amber-600" /> : 
                       <AlertTriangle className="w-3 h-3 text-gray-400" />}
                      <span>{task.isConfirmed ? 'تایید نهایی' : task.farmerDone ? 'منتظر تایید کارشناس' : 'در انتظار اجرا'}</span>
                    </span>
                  </div>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="py-10 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl text-xs">
                هیچ دستورالعمل یا وظیفه فعالی ثبت نشده است.
              </div>
            )}
          </div>
        </div>

        {/* Pest Summary & Recent Contacts (1 Column) */}
        <div className="space-y-4">
          
          {/* Key Pest & Psyllid Status */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-black text-gray-800 text-xs sm:text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
              <Bug className="w-4 h-4 text-emerald-700" />
              وضعیت آفات کلیدی باغات پسته
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              پایش مستمر پسیل معمولی پسته (شیره خشک) و سن‌های زیان‌آور در کانون‌های آلودگی.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl text-xs font-semibold">
                <span className="text-gray-600">سطح آلودگی پسیل:</span>
                <span className="text-emerald-800 font-bold">تحت کنترل و پایش</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl text-xs font-semibold">
                <span className="text-gray-600">آخرین بازدید ثبت شده:</span>
                <span className="text-gray-800 font-mono font-bold">
                  {visits[0]?.visitDate || '---'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Access to Key Orchard Owners */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-black text-gray-800 text-xs sm:text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                باغداران ثبت شده
              </h3>
              <button 
                onClick={() => onNavigate('owners')}
                className="text-[11px] text-emerald-700 font-bold hover:underline"
              >
                دفترچه مالکان
              </button>
            </div>

            <div className="space-y-2">
              {owners.slice(0, 3).map(owner => (
                <div key={owner.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-xl text-xs">
                  <span className="font-bold text-gray-800">{owner.name}</span>
                  <span className="text-gray-500 font-mono">{toPersianNumbers(owner.mobile || '---')}</span>
                </div>
              ))}
              {owners.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">هنوز باغداری ثبت نشده است.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardTab;
