import React, { useState } from 'react';
import { Task, Land, Owner, User, TaskCategory, Visit } from '../types';
import { 
  ClipboardCheck, Plus, Search, CheckCircle2, Clock, AlertTriangle, ShieldAlert, 
  Sprout, Activity, Check, X, Filter, UserCheck, Calendar, Sparkles, FileText, 
  ArrowRight, CheckCheck, Eye, Layers, Trees, ShieldCheck, Sun, Thermometer, Droplets, Wind, ExternalLink
} from 'lucide-react';
import { JalaliDatePicker } from './JalaliDatePicker';
import { getTodayJalali, toPersianNumbers } from '../jalaliDate';

interface TasksTabProps {
  tasks: Task[];
  setTasks: (data: Task[] | ((prev: Task[]) => Task[])) => void;
  visits?: Visit[];
  setVisits?: (data: Visit[] | ((prev: Visit[]) => Visit[])) => void;
  lands: Land[];
  owners: Owner[];
  user: User | null;
  onNavigateToVisits?: () => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  setTasks,
  visits = [],
  setVisits,
  lands,
  owners,
  user,
  onNavigateToVisits
}) => {
  // Main Sub-tabs: 'tasks' (Approved Guidelines & Tasks) vs 'recommendations' (Field Visit Recommendations)
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'recommendations'>('tasks');

  // Filtering states for Tasks Sub-tab
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TaskCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'pending' | 'confirmed'>('all');
  const [showModal, setShowModal] = useState(false);

  // Filtering states for Recommendations Sub-tab
  const [recSearchTerm, setRecSearchTerm] = useState('');
  const [recStatusFilter, setRecStatusFilter] = useState<'all' | 'pending' | 'converted'>('all');
  const [recLandFilter, setRecLandFilter] = useState<string>('all');

  // Convert recommendation modal
  const [convertingVisit, setConvertingVisit] = useState<Visit | null>(null);
  const [convertForm, setConvertForm] = useState<{
    title: string;
    category: TaskCategory;
    landId: string;
    description: string;
    dueDate: string;
  }>({
    title: '',
    category: 'pest_control',
    landId: '',
    description: '',
    dueDate: getTodayJalali().formatted
  });

  // Full visit inspection preview modal
  const [viewingVisit, setViewingVisit] = useState<Visit | null>(null);

  // Farmer action modal
  const [farmerActionTask, setFarmerActionTask] = useState<Task | null>(null);
  const [farmerNoteInput, setFarmerNoteInput] = useState('');

  // Manual Task creation form
  const [form, setForm] = useState<Partial<Task>>({
    landId: lands[0]?.id || '',
    category: 'pest_control',
    title: '',
    description: '',
    dueDate: getTodayJalali().formatted
  });

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

  // Recommendations extracted from visits that have an expert recommendation or IPM note
  const visitRecommendations = visits.filter(v => 
    (v.expertRecommendation && v.expertRecommendation.trim().length > 0) || 
    (v.ipmApplied && v.ipmApplied.trim().length > 0)
  );

  // Count pending recommendations that have not yet been converted into tasks
  const pendingRecommendationsCount = visitRecommendations.filter(v => 
    !v.convertedToTaskId && !tasks.some(t => t.visitId === v.id)
  ).length;

  const pendingTasksCount = tasks.filter(t => t.farmerDone && !t.isConfirmed).length;

  // Save manual task
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.landId) {
      alert('عنوان دستورالعمل و انتخاب باغ پسته الزامی است.');
      return;
    }

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      landId: form.landId,
      category: form.category || 'pest_control',
      title: form.title,
      description: form.description,
      dueDate: form.dueDate,
      createdBy: user?.id || '1',
      createdByName: user?.name || 'کارشناس سامانه',
      createdAt: getTodayJalali().formatted,
      farmerDone: false,
      isConfirmed: false
    };

    setTasks(prev => [newTask, ...prev]);
    setShowModal(false);
    setForm({ landId: lands[0]?.id || '', category: 'pest_control', title: '', description: '', dueDate: getTodayJalali().formatted });
  };

  // Open convert modal for a specific visit recommendation
  const openConvertModal = (visit: Visit) => {
    setConvertingVisit(visit);
    
    // Auto detect category from recommendation text or visit status
    let autoCategory: TaskCategory = 'pest_control';
    const text = (visit.expertRecommendation || '') + (visit.ipmApplied || '');
    if (text.includes('کود') || text.includes('تغذیه') || text.includes('پتاسیم') || text.includes('روی') || text.includes('ازت')) {
      autoCategory = 'nutrition';
    } else if (text.includes('آبیاری') || text.includes('هرس') || text.includes('شخم') || text.includes('پیوند')) {
      autoCategory = 'agronomy';
    }

    const land = lands.find(l => l.id === visit.landId);
    const landTitle = land ? (land.name || land.title) : 'باغ پسته';

    setConvertForm({
      title: `دستورالعمل اجرایی بر اساس پایش مورخ ${visit.visitDate} (${landTitle})`,
      category: autoCategory,
      landId: visit.landId,
      description: visit.expertRecommendation || visit.ipmApplied || '',
      dueDate: visit.nextVisitDate || getTodayJalali().formatted
    });
  };

  // Confirm conversion of recommendation to a new official instruction (Task)
  const handleConfirmConversion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingVisit || !convertForm.title || !convertForm.landId) {
      alert('عنوان دستورالعمل و انتخاب باغ الزامی است.');
      return;
    }

    const newTaskId = Math.random().toString(36).substr(2, 9);
    const newTask: Task = {
      id: newTaskId,
      landId: convertForm.landId,
      visitId: convertingVisit.id,
      sourceRecommendation: convertingVisit.expertRecommendation,
      visitDate: convertingVisit.visitDate,
      category: convertForm.category,
      title: convertForm.title,
      description: convertForm.description,
      dueDate: convertForm.dueDate,
      createdBy: user?.id || '1',
      createdByName: user?.name || 'کارشناس باغبانی',
      createdAt: getTodayJalali().formatted,
      farmerDone: false,
      isConfirmed: true, // Officially approved and converted
      confirmedBy: user?.id || '1',
      confirmedByName: user?.name || 'کارشناس ناظر',
      confirmedAt: getTodayJalali().formatted
    };

    // Add new Task
    setTasks(prev => [newTask, ...prev]);

    // Update Visit state to mark it as converted & approved
    if (setVisits) {
      setVisits(prev => prev.map(v => v.id === convertingVisit.id ? {
        ...v,
        isApproved: true,
        convertedToTaskId: newTaskId,
        convertedAt: getTodayJalali().formatted
      } : v));
    }

    setConvertingVisit(null);
    // Switch to active tasks to immediately view the created guideline
    setActiveSubTab('tasks');
  };

  // Quick 1-click conversion
  const handleQuickConvert = (visit: Visit) => {
    const newTaskId = Math.random().toString(36).substr(2, 9);
    const land = lands.find(l => l.id === visit.landId);
    const landTitle = land ? (land.name || land.title) : 'باغ پسته';

    let autoCategory: TaskCategory = 'pest_control';
    const text = (visit.expertRecommendation || '') + (visit.ipmApplied || '');
    if (text.includes('کود') || text.includes('تغذیه') || text.includes('پتاسیم') || text.includes('روی') || text.includes('ازت')) {
      autoCategory = 'nutrition';
    } else if (text.includes('آبیاری') || text.includes('هرس') || text.includes('شخم') || text.includes('پیوند')) {
      autoCategory = 'agronomy';
    }

    const newTask: Task = {
      id: newTaskId,
      landId: visit.landId,
      visitId: visit.id,
      sourceRecommendation: visit.expertRecommendation,
      visitDate: visit.visitDate,
      category: autoCategory,
      title: `دستورالعمل مبارزه و تغذیه بر اساس پایش ${visit.visitDate}`,
      description: visit.expertRecommendation || visit.ipmApplied || 'دستورالعمل ابلاغی کارشناس',
      dueDate: visit.nextVisitDate || getTodayJalali().formatted,
      createdBy: user?.id || '1',
      createdByName: user?.name || 'کارشناس باغبانی',
      createdAt: getTodayJalali().formatted,
      farmerDone: false,
      isConfirmed: true,
      confirmedBy: user?.id || '1',
      confirmedByName: user?.name || 'کارشناس ناظر',
      confirmedAt: getTodayJalali().formatted
    };

    setTasks(prev => [newTask, ...prev]);

    if (setVisits) {
      setVisits(prev => prev.map(v => v.id === visit.id ? {
        ...v,
        isApproved: true,
        convertedToTaskId: newTaskId,
        convertedAt: getTodayJalali().formatted
      } : v));
    }
  };

  // Farmer reports task done
  const handleFarmerDone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerActionTask) return;

    setTasks(prev => prev.map(t => t.id === farmerActionTask.id ? {
      ...t,
      farmerDone: true,
      farmerDoneAt: getTodayJalali().formatted,
      farmerNote: farmerNoteInput || 'انجام شد'
    } : t));

    setFarmerActionTask(null);
    setFarmerNoteInput('');
  };

  // Expert confirms task
  const handleConfirmTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      isConfirmed: true,
      confirmedBy: user?.id || '1',
      confirmedByName: user?.name || 'مدیر کل سامانه',
      confirmedAt: getTodayJalali().formatted
    } : t));
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLandName(t.landId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'confirmed') matchesStatus = t.isConfirmed;
    else if (statusFilter === 'pending') matchesStatus = t.farmerDone && !t.isConfirmed;
    else if (statusFilter === 'open') matchesStatus = !t.farmerDone;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filter recommendations
  const filteredRecommendations = visitRecommendations.filter(v => {
    const landName = getLandName(v.landId);
    const ownerName = getOwnerByLand(v.landId);
    const matchesSearch = (v.expertRecommendation || '').toLowerCase().includes(recSearchTerm.toLowerCase()) ||
      (v.ipmApplied || '').toLowerCase().includes(recSearchTerm.toLowerCase()) ||
      landName.toLowerCase().includes(recSearchTerm.toLowerCase()) ||
      ownerName.toLowerCase().includes(recSearchTerm.toLowerCase()) ||
      (v.visitDate || '').includes(recSearchTerm);

    const matchesLand = recLandFilter === 'all' || v.landId === recLandFilter;

    const isConverted = !!v.convertedToTaskId || tasks.some(t => t.visitId === v.id);
    let matchesStatus = true;
    if (recStatusFilter === 'pending') matchesStatus = !isConverted;
    else if (recStatusFilter === 'converted') matchesStatus = isConverted;

    return matchesSearch && matchesLand && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header controls & Main Sub-tab navigation */}
      <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-800">سامانه دستورالعمل‌ها و توصیه‌های باغبانی (IPM)</h2>
              <p className="text-xs text-gray-500 font-bold">
                پیوند یکپارچه بازدیدهای کارشناسی با دستورالعمل‌های رسمی و کنترل اجرای باغدار
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {activeSubTab === 'tasks' && user?.role !== 'farmer' && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition"
              >
                <Plus className="w-4 h-4" /> دستورالعمل جدید دستی
              </button>
            )}
          </div>
        </div>

        {/* Sub-tab Switcher: Approved Tasks vs Visit Recommendations */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
              activeSubTab === 'tasks'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            <span>دستورالعمل‌ها و وظایف مصوب</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activeSubTab === 'tasks' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {tasks.length}
            </span>
          </button>

          {user?.role !== 'farmer' && (
            <button
              onClick={() => setActiveSubTab('recommendations')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
                activeSubTab === 'recommendations'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>توصیه‌ها و پیشنهادات پایش میدانی</span>
              {pendingRecommendationsCount > 0 ? (
                <span className="text-[10px] bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                  {pendingRecommendationsCount} در انتظار صدور
                </span>
              ) : (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeSubTab === 'recommendations' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {visitRecommendations.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: APPROVED INSTRUCTIONS & IPM TASKS */}
      {/* ========================================================================= */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          {/* Filter Badges & Search for Tasks */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200/80 text-xs font-black">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-gray-400 ml-1">دسته:</span>
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition ${categoryFilter === 'all' ? 'bg-gray-800 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                همه
              </button>
              <button
                onClick={() => setCategoryFilter('pest_control')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${categoryFilter === 'pest_control' ? 'bg-gray-800 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <ShieldAlert className="w-3.5 h-3.5" /> آفات و بیماری‌ها
              </button>
              <button
                onClick={() => setCategoryFilter('nutrition')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${categoryFilter === 'nutrition' ? 'bg-gray-800 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Sprout className="w-3.5 h-3.5" /> تغذیه و کوددهی
              </button>
              <button
                onClick={() => setCategoryFilter('agronomy')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${categoryFilter === 'agronomy' ? 'bg-gray-800 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Activity className="w-3.5 h-3.5" /> عملیات زراعی
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="جستجو در دستورالعمل‌ها..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="text-gray-400 ml-1">وضعیت:</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  همه
                </button>
                <button
                  onClick={() => setStatusFilter('open')}
                  className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'open' ? 'bg-rose-700 text-white' : 'text-rose-700 bg-rose-50 border border-rose-200'}`}
                >
                  🔴 در انتظار انجام
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-amber-800 bg-amber-50 border border-amber-200'}`}
                >
                  ⏳ در انتظار تایید
                </button>
                <button
                  onClick={() => setStatusFilter('confirmed')}
                  className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'confirmed' ? 'bg-emerald-700 text-white' : 'text-emerald-800 bg-emerald-50 border border-emerald-200'}`}
                >
                  ✅ تایید شده
                </button>
              </div>
            </div>
          </div>

          {/* Task Cards List */}
          <div className="space-y-4">
            {filteredTasks.map(task => {
              const landName = getLandName(task.landId);
              const ownerName = getOwnerByLand(task.landId);
              const matchedVisit = visits.find(v => v.id === task.visitId);

              return (
                <div key={task.id} className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-sm hover:border-emerald-300 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1">
                        {task.category === 'pest_control' && <ShieldAlert className="w-3 h-3 text-gray-500" />}
                        {task.category === 'nutrition' && <Sprout className="w-3 h-3 text-emerald-600" />}
                        {task.category === 'agronomy' && <Activity className="w-3 h-3 text-gray-500" />}
                        {task.category === 'pest_control' ? 'مدیریت آفات و بیماری‌ها' : task.category === 'nutrition' ? 'برنامه تغذیه و کوددهی' : 'عملیات زراعی و باغی'}
                      </span>

                      <span className="text-xs font-bold text-gray-700">باغ: {landName}</span>
                      <span className="text-xs text-gray-400">({ownerName})</span>
                      
                      {task.dueDate && (
                        <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-gray-100">
                          <Calendar className="w-3 h-3 text-gray-400" /> مهلت: {task.dueDate}
                        </span>
                      )}

                      {/* Origin Visit Link Badge */}
                      {task.visitId && (
                        <button
                          type="button"
                          onClick={() => {
                            if (matchedVisit) setViewingVisit(matchedVisit);
                            else if (onNavigateToVisits) onNavigateToVisits();
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1"
                          title="مشاهده گزارش بازدید مبدا"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                          صادر شده از پایش میدانی {task.visitDate ? `(${task.visitDate})` : ''}
                        </button>
                      )}
                    </div>

                    <h3 className="text-base font-black text-gray-800">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-gray-600 leading-relaxed font-medium whitespace-pre-line bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                        {task.description}
                      </p>
                    )}

                    {task.farmerNote && (
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 mt-2">
                        <span className="font-black text-gray-900">گزارش باغدار:</span> {task.farmerNote}
                        {task.farmerDoneAt && <span className="font-mono text-gray-500 text-[10px] mr-2">({task.farmerDoneAt})</span>}
                      </div>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col md:items-end gap-2 w-full md:w-auto shrink-0">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 border ${
                      task.isConfirmed ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      task.farmerDone ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {task.isConfirmed ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : task.farmerDone ? <Clock className="w-4 h-4 text-amber-700" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                      {task.isConfirmed ? 'تایید نهایی کارشناس' : task.farmerDone ? 'انجام شد (منتظر تایید کارشناس)' : 'در انتظار اجرا توسط باغدار'}
                    </span>

                    <div className="flex items-center gap-2">
                      {!task.farmerDone && (
                        <button
                          onClick={() => {
                            setFarmerActionTask(task);
                            setFarmerNoteInput('');
                          }}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> اعلام انجام کار
                        </button>
                      )}

                      {task.farmerDone && !task.isConfirmed && (user?.role === 'admin' || user?.role === 'expert' || user?.role === 'operator') && (
                        <button
                          onClick={() => handleConfirmTask(task.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> تایید کارشناسی
                        </button>
                      )}

                      {user?.role !== 'farmer' && (
                        <button
                          onClick={() => {
                            if (confirm('آیا از حذف این دستورالعمل مطمئن هستید؟')) {
                              setTasks(prev => prev.filter(t => t.id !== task.id));
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="حذف وظیفه"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center text-gray-400 space-y-3">
                <ClipboardCheck className="w-10 h-10 mx-auto text-gray-300" />
                <p className="font-bold text-xs">هیچ دستورالعمل یا وظیفه‌ای با فیلترهای انتخابی یافت نشد.</p>
                {user?.role !== 'farmer' && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-1.5 bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl"
                  >
                    <Plus className="w-4 h-4" /> تعریف دستورالعمل جدید
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: FIELD VISIT RECOMMENDATIONS & ACTIONS */}
      {/* ========================================================================= */}
      {activeSubTab === 'recommendations' && (
        <div className="space-y-4">
          {/* Guide Banner */}
          <div className="bg-white border border-gray-200/80 p-4 md:p-5 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">
                  کارتابل تبدیل توصیه‌های کارشناسی به دستورالعمل‌های رسمی باغبانی
                </h4>
                <p className="text-[11px] md:text-xs text-gray-600 font-bold mt-0.5">
                  کلیه توصیه‌های ثبت‌شده در پایش میدانی در این تب گردآوری شده‌اند. با کلیک بر روی <strong className="text-emerald-700">«تایید و صدور دستورالعمل»</strong>، توصیه کارشناسی به یک دستورالعمل رسمی قابل ابلاغ و ردیابی برای باغدار تبدیل می‌گردد.
                </p>
              </div>
            </div>
          </div>

          {/* Filters & Search for Recommendations */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200/80 text-xs font-black">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-56">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="جستجو در توصیه‌ها و آفات..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={recSearchTerm}
                  onChange={e => setRecSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={recLandFilter}
                onChange={e => setRecLandFilter(e.target.value)}
                className="p-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none"
              >
                <option value="all">همه باغات پسته</option>
                {lands.map(l => (
                  <option key={l.id} value={l.id}>{l.name || l.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 ml-1">وضعیت تایید و تبدیل:</span>
              <button
                onClick={() => setRecStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition ${recStatusFilter === 'all' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                همه ({visitRecommendations.length})
              </button>
              <button
                onClick={() => setRecStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl transition ${recStatusFilter === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-800 bg-amber-50 border border-amber-200'}`}
              >
                ⏳ در انتظار صدور ({pendingRecommendationsCount})
              </button>
              <button
                onClick={() => setRecStatusFilter('converted')}
                className={`px-3 py-1.5 rounded-xl transition ${recStatusFilter === 'converted' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-800 bg-emerald-50 border border-emerald-200'}`}
              >
                ✅ صادر شده به دستورالعمل ({visitRecommendations.length - pendingRecommendationsCount})
              </button>
            </div>
          </div>

          {/* Recommendations Cards List */}
          <div className="space-y-4">
            {filteredRecommendations.map(visit => {
              const landName = getLandName(visit.landId);
              const ownerName = getOwnerByLand(visit.landId);
              const matchedTask = tasks.find(t => t.visitId === visit.id);
              const isConverted = !!visit.convertedToTaskId || !!matchedTask;

              return (
                <div 
                  key={visit.id} 
                  className={`bg-white rounded-3xl border p-5 shadow-sm transition space-y-3.5 ${
                    isConverted ? 'border-emerald-200/90' : 'border-amber-200/90 hover:border-emerald-300'
                  }`}
                >
                  {/* Top metadata row */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-gray-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                        <Trees className="w-3.5 h-3.5 text-emerald-700" />
                        باغ: {landName}
                      </span>
                      <span className="text-xs font-bold text-gray-500">مالک: {ownerName}</span>
                      <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded-lg border border-gray-200 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" /> تاریخ پایش: {visit.visitDate}
                      </span>
                      {visit.growthStage && (
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">
                          فاز: {visit.growthStage}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isConverted ? (
                        <span className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          تبدیل شده به دستورالعمل رسمی
                        </span>
                      ) : (
                        <span className="text-xs font-black px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          پیش‌نویس توصیه - آماده صدور دستورالعمل
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pest/Disease Context Badges */}
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold text-gray-600">
                    {visit.psyllid && (
                      <span className="bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-md">
                        پسیل: <strong className="text-gray-800">{visit.psyllid}</strong> {visit.psyllaDensity ? `(${visit.psyllaDensity})` : ''}
                      </span>
                    )}
                    {visit.nutrientDeficiency && (
                      <span className="bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-md">
                        کمبود تغذیه: <strong className="text-gray-800">{visit.nutrientDeficiency}</strong>
                      </span>
                    )}
                    {visit.ipmApplied && (
                      <span className="bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-md">
                        اقدامات IPM اجرا شده: <strong className="text-gray-800">{visit.ipmApplied}</strong>
                      </span>
                    )}
                  </div>

                  {/* Recommendation Content Box */}
                  <div className="bg-emerald-50/40 border border-emerald-200/80 p-4 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>توصیه تخصصی کارشناس و اقدامات باغبانی:</span>
                    </div>
                    <p className="text-xs text-gray-800 font-bold leading-relaxed whitespace-pre-line">
                      {visit.expertRecommendation || visit.ipmApplied || 'بدون توصیه متنی'}
                    </p>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingVisit(visit)}
                        className="text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> مشاهده گزارش کامل پایش
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isConverted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleQuickConvert(visit)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                            title="صدور فوری با تنظیمات استاندارد"
                          >
                            <Check className="w-3.5 h-3.5" /> صدور فوری
                          </button>

                          <button
                            type="button"
                            onClick={() => openConvertModal(visit)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1.5"
                          >
                            <ArrowRight className="w-3.5 h-3.5" /> تایید و تبدیل به دستورالعمل جدید
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSubTab('tasks');
                            if (matchedTask) {
                              setSearchTerm(matchedTask.title);
                            }
                          }}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> مشاهده در لیست دستورالعمل‌ها
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRecommendations.length === 0 && (
              <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center text-gray-400 space-y-3">
                <Sparkles className="w-10 h-10 mx-auto text-gray-300" />
                <p className="font-bold text-xs">توصیه کارشناسی با فیلترهای مشخص‌شده یافت نشد.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONVERT RECOMMENDATION TO OFFICIAL INSTRUCTION (TASK) */}
      {/* ========================================================================= */}
      {convertingVisit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-base font-black text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-700" />
                  تبدیل توصیه کارشناسی به دستورالعمل رسمی
                </h3>
                <span className="text-xs font-bold text-gray-500">
                  باغ: {getLandName(convertingVisit.landId)} ({convertingVisit.visitDate})
                </span>
              </div>
              <button onClick={() => setConvertingVisit(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmConversion} className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">عنوان رسمی دستورالعمل *</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: دستورالعمل محلول‌پاشی صابون و سیلیکات پتاسیم"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={convertForm.title}
                  onChange={e => setConvertForm({ ...convertForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">دسته‌بندی عملیات *</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={convertForm.category}
                    onChange={e => setConvertForm({ ...convertForm, category: e.target.value as TaskCategory })}
                  >
                    <option value="pest_control">آفات و بیماری‌ها (سم‌پاشی و مبارزه)</option>
                    <option value="nutrition">تغذیه و کوددهی (محلول‌پاشی و خاکی)</option>
                    <option value="agronomy">عملیات زراعی (آبیاری، هرس، شخم)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">باغ پسته هدف *</label>
                  <select
                    disabled
                    className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none cursor-not-allowed"
                    value={convertForm.landId}
                  >
                    {lands.map(l => (
                      <option key={l.id} value={l.id}>{l.name || l.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                {(() => {
                  const selLand = lands.find(l => l.id === convertForm.landId);
                  return (
                    <JalaliDatePicker
                      label="مهلت اجرای دستورالعمل توسط باغدار *"
                      placeholder="۱۴۰۴/۰۲/۳۰"
                      value={convertForm.dueDate}
                      latitude={Number(selLand?.latitude) || 30.4067}
                      longitude={Number(selLand?.longitude) || 55.9939}
                      locationName={selLand?.name ? `باغ: ${selLand.name}` : undefined}
                      onChange={val => setConvertForm(prev => ({ ...prev, dueDate: val }))}
                    />
                  );
                })()}
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">شرح تفصیلی دستورالعمل و دوز مصرفی *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="شرح دقیق اقدامات، سموم، کودها، دوز در هزار و نکات ایمنی..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={convertForm.description}
                  onChange={e => setConvertForm({ ...convertForm, description: e.target.value })}
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>با تایید این فرم، دستورالعمل در کارتابل باغدار قرار گرفته و وضعیت توصیه به «تایید شده» تغییر می‌یابد.</span>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCheck className="w-4 h-4" /> تایید نهایی و صدور دستورالعمل
                </button>
                <button
                  type="button"
                  onClick={() => setConvertingVisit(null)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition text-xs"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANUAL TASK CREATION */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-black text-gray-800">تعریف دستورالعمل / وظیفه باغبانی</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">باغ پسته هدف *</label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.landId}
                  onChange={e => setForm({ ...form, landId: e.target.value })}
                >
                  {lands.map(l => (
                    <option key={l.id} value={l.id}>{l.name || l.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">دسته‌بندی عملیات</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value as TaskCategory })}
                  >
                    <option value="pest_control">آفات و بیماری‌ها</option>
                    <option value="nutrition">تغذیه و کوددهی</option>
                    <option value="agronomy">عملیات زراعی</option>
                  </select>
                </div>

                <div>
                  {(() => {
                    const selLand = lands.find(l => l.id === form.landId);
                    return (
                      <JalaliDatePicker
                        label="مهلت انجام (تاریخ سررسید)"
                        placeholder="۱۴۰۴/۰۲/۲۰"
                        value={form.dueDate || ''}
                        latitude={Number(selLand?.latitude) || 30.4067}
                        longitude={Number(selLand?.longitude) || 55.9939}
                        locationName={selLand?.name ? `باغ: ${selLand.name}` : undefined}
                        onChange={val => setForm(prev => ({ ...prev, dueDate: val }))}
                      />
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">عنوان دستورالعمل *</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: سم‌پاشی صابون کشاورزی پالیگان"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.title || ''}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">توضیحات و دستورالعمل اجرایی</label>
                <textarea
                  rows={3}
                  placeholder="شرح کامل نحوه انجام، میزان مصرف در هزار لیتر، نکات ایمنی..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-xl shadow-lg transition text-xs"
                >
                  ثبت دستورالعمل
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition text-xs"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FARMER COMPLETION REPORT */}
      {/* ========================================================================= */}
      {farmerActionTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-base font-black text-gray-800">گزارش انجام دستورالعمل توسط باغدار</h3>
              <button onClick={() => setFarmerActionTask(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFarmerDone} className="space-y-4">
              <div className="bg-emerald-50 p-3 rounded-xl text-xs text-emerald-900 border border-emerald-200 font-bold">
                عنوان: {farmerActionTask.title}
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">توضیحات و نحوه اجرای عملیات</label>
                <textarea
                  rows={3}
                  placeholder="مثال: عملیات سمپاشی در ساعات خنک صبح با موفقیت انجام شد..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={farmerNoteInput}
                  onChange={e => setFarmerNoteInput(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 rounded-xl shadow transition text-xs"
                >
                  تایید و ارسال گزارش انجام
                </button>
                <button
                  type="button"
                  onClick={() => setFarmerActionTask(null)}
                  className="px-4 bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl text-xs"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW FULL VISIT REPORT */}
      {/* ========================================================================= */}
      {viewingVisit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-800">
                  جزئیات کامل گزارش پایش {getLandName(viewingVisit.landId)}
                </h3>
                <span className="text-xs font-mono font-bold text-gray-500">تاریخ ثبت: {viewingVisit.visitDate}</span>
              </div>
              <button onClick={() => setViewingVisit(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Weather Data */}
              {(viewingVisit.weatherCondition || viewingVisit.temperature !== undefined) && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-gray-900 flex items-center gap-1.5 text-xs">
                      <Sun className="w-4 h-4 text-amber-500" /> شرایط اقلیمی در زمان پایش
                    </h4>
                    <span className="bg-white text-gray-800 border border-gray-200 px-2.5 py-0.5 rounded-lg font-black text-[11px]">
                      {viewingVisit.weatherCondition || 'آفتابی'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-white p-2 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center justify-center gap-1">
                        <Thermometer className="w-3 h-3 text-amber-600" /> دما
                      </span>
                      <span className="font-black text-gray-800 font-mono text-xs">
                        {viewingVisit.temperature !== undefined ? `${toPersianNumbers(Number(viewingVisit.temperature))} °C` : '---'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-sky-600" /> رطوبت
                      </span>
                      <span className="font-black text-gray-800 font-mono text-xs">
                        {viewingVisit.humidity !== undefined ? `${toPersianNumbers(Number(viewingVisit.humidity))} %` : '---'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center justify-center gap-1">
                        <Wind className="w-3 h-3 text-teal-600" /> باد
                      </span>
                      <span className="font-black text-gray-800 font-mono text-xs">
                        {viewingVisit.windSpeed !== undefined ? `${toPersianNumbers(Number(viewingVisit.windSpeed))} km/h` : '---'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div><span className="text-gray-400">مالک:</span> <span className="font-bold text-gray-800">{getOwnerByLand(viewingVisit.landId)}</span></div>
                <div><span className="text-gray-400">مرحله رشدی:</span> <span className="font-bold text-gray-800">{viewingVisit.growthStage || '---'}</span></div>
                <div><span className="text-gray-400">پسیل پسته:</span> <span className="font-bold text-gray-800">{viewingVisit.psyllid || 'بدون آلودگی'}</span></div>
                <div><span className="text-gray-400">تراکم پسیل:</span> <span className="font-bold text-gray-800">{viewingVisit.psyllaDensity || '---'}</span></div>
                <div><span className="text-gray-400">شادابی:</span> <span className="font-bold text-gray-800">{viewingVisit.treeVigor || '---'}</span></div>
                <div><span className="text-gray-400">بار محصول:</span> <span className="font-bold text-gray-800">{viewingVisit.fruitLoad || '---'}</span></div>
              </div>

              {viewingVisit.expertRecommendation && (
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                  <h4 className="font-black text-emerald-900 mb-1 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-emerald-700" /> توصیه تخصصی کارشناس:
                  </h4>
                  <p className="text-gray-800 leading-relaxed font-bold whitespace-pre-line">{viewingVisit.expertRecommendation}</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setViewingVisit(null);
                  openConvertModal(viewingVisit);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-black px-5 py-2 rounded-xl text-xs flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" /> تبدیل به دستورالعمل
              </button>

              <button
                onClick={() => setViewingVisit(null)}
                className="bg-gray-100 text-gray-700 font-bold px-6 py-2 rounded-xl text-xs hover:bg-gray-200"
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

export default TasksTab;
