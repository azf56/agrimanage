import React, { useState, useEffect } from 'react';
import { 
  Trees, 
  Home, 
  Layers, 
  ClipboardCheck, 
  FlaskConical, 
  CheckSquare, 
  MapPin, 
  MessageSquare, 
  Users,
  Users as UsersIcon, 
  LogOut, 
  Bell, 
  ShieldCheck, 
  Sprout, 
  Activity, 
  Phone,
  UserCheck,
  Calendar,
  Lock,
  ChevronDown,
  X,
  Menu,
  Sliders,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Globe
} from 'lucide-react';


import { 
  User, 
  Owner, 
  Land, 
  WaterSource, 
  Visit, 
  LabAnalysis, 
  Task, 
  Message,
  LookupItem
} from './types';
import { defaultLookupItems } from './defaultLookups';

import DashboardTab from './components/DashboardTab';
import AraziTab from './components/AraziTab';
import VisitsTab from './components/VisitsTab';
import AnalysesTab from './components/AnalysesTab';
import TasksTab from './components/TasksTab';
import MapReport from './components/MapReport';
import ChatTab from './components/ChatTab';
import UsersTab from './components/UsersTab';
import LookupsTab from './components/LookupsTab';
import JalaliWeatherCalendar from './components/JalaliWeatherCalendar';
import Sidebar, { ActiveTab } from './components/Sidebar';
import Login from './components/Login';
import MobileNavigation from './components/MobileNavigation';
import CpanelDbModal from './components/CpanelDbModal';
import { StoreIntegrationHubModal } from './components/StoreIntegrationHubModal';
import { getTodayJalali, toPersianNumbers } from './jalaliDate';
import { 
  getLocalCachedData, 
  saveLocalCachedData, 
  getOfflineQueue, 
  enqueueOfflineAction, 
  performFullSync, 
  testServerConnection,
  getLastSyncTimeFormatted
} from './offlineSync';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [araziSubTab, setAraziSubTab] = useState<'lands' | 'owners' | 'water'>('lands');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [showCpanelModal, setShowCpanelModal] = useState(false);
  const [showStoreHubModal, setShowStoreHubModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Offline Engine & Network Sync States
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Domain Data States
  const [users, setUsers] = useState<User[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [waterSources, setWaterSources] = useState<WaterSource[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [labAnalyses, setLabAnalyses] = useState<LabAnalysis[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lookups, setLookups] = useState<LookupItem[]>(defaultLookupItems);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = '/api';

  // Instant Offline Boot & Sync Setup
  useEffect(() => {
    // 1. Instant local database cache load (instant zero-latency startup in orchards without network)
    const cached = getLocalCachedData();
    if (cached) {
      if (cached.users?.length) setUsers(cached.users);
      if (cached.owners?.length) setOwners(cached.owners);
      if (cached.lands?.length) setLands(cached.lands);
      if (cached.waterSources?.length) setWaterSources(cached.waterSources);
      if (cached.visits?.length) setVisits(cached.visits);
      if (cached.labAnalyses?.length) setLabAnalyses(cached.labAnalyses);
      if (cached.tasks?.length) setTasks(cached.tasks);
      if (cached.messages?.length) setMessages(cached.messages);
      if (cached.lookups?.length) setLookups(cached.lookups);
    }
    setPendingSyncCount(getOfflineQueue().length);
    setLastSyncTime(getLastSyncTimeFormatted());

    // 2. Network connection change listeners
    const handleOnline = () => {
      setIsOnline(true);
      triggerFullSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. Initial connection test and sync
    const initFetch = async () => {
      try {
        const canConnect = await testServerConnection(API_URL);
        setIsOnline(canConnect);
        if (canConnect) {
          await triggerFullSync();
        }
      } catch (e) {
        console.warn('Backend fetch fallback/offline mode active:', e);
      } finally {
        setIsLoading(false);
      }

      // Check saved user session
      const savedUser = localStorage.getItem('pistachio_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setCurrentUser(u);
          setIsAuthenticated(true);
        } catch (e) {
          console.error(e);
        }
      }
    };

    initFetch();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Full Two-Way Sync Engine Execution
  const triggerFullSync = async () => {
    setIsSyncing(true);
    try {
      const result = await performFullSync(API_URL, (merged) => {
        if (merged.users) setUsers(merged.users);
        if (merged.owners) setOwners(merged.owners);
        if (merged.lands) setLands(merged.lands);
        if (merged.waterSources) setWaterSources(merged.waterSources);
        if (merged.visits) setVisits(merged.visits);
        if (merged.labAnalyses) setLabAnalyses(merged.labAnalyses);
        if (merged.tasks) setTasks(merged.tasks);
        if (merged.messages) setMessages(merged.messages);
        if (merged.lookups) setLookups(merged.lookups);
      });

      if (result.success) {
        setIsOnline(true);
        setPendingSyncCount(getOfflineQueue().length);
        setLastSyncTime(getLastSyncTimeFormatted());
      }
    } catch (e) {
      console.warn('Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync helpers with Outbox queuing for offline resilience
  const syncData = async (table: string, data: any) => {
    // Save to local cache first
    saveLocalCachedData({ [table === 'waterSources' ? 'waterSources' : table === 'labAnalyses' ? 'labAnalyses' : table]: data });

    if (isOnline) {
      try {
        await fetch(`${API_URL}/sync/${table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (e) {
        console.warn(`Direct sync failed for ${table}, saving to offline outbox queue:`, e);
        enqueueOfflineAction(table, 'update', 'batch_' + Date.now(), data);
        setPendingSyncCount(getOfflineQueue().length);
      }
    } else {
      enqueueOfflineAction(table, 'update', 'batch_' + Date.now(), data);
      setPendingSyncCount(getOfflineQueue().length);
    }
  };

  const handleUpdateOwners = (newOwners: Owner[] | ((prev: Owner[]) => Owner[])) => {
    setOwners(prev => {
      const updated = typeof newOwners === 'function' ? newOwners(prev) : newOwners;
      syncData('owners', updated);
      return updated;
    });
  };

  const handleUpdateLands = (newLands: Land[] | ((prev: Land[]) => Land[])) => {
    setLands(prev => {
      const updated = typeof newLands === 'function' ? newLands(prev) : newLands;
      syncData('lands', updated);
      return updated;
    });
  };

  const handleUpdateWaterSources = (newWater: WaterSource[] | ((prev: WaterSource[]) => WaterSource[])) => {
    setWaterSources(prev => {
      const updated = typeof newWater === 'function' ? newWater(prev) : newWater;
      syncData('waterSources', updated);
      return updated;
    });
  };

  const handleUpdateVisits = (newVisits: Visit[] | ((prev: Visit[]) => Visit[])) => {
    setVisits(prev => {
      const updated = typeof newVisits === 'function' ? newVisits(prev) : newVisits;
      syncData('visits', updated);
      return updated;
    });
  };

  const handleUpdateLabAnalyses = (newAnalyses: LabAnalysis[] | ((prev: LabAnalysis[]) => LabAnalysis[])) => {
    setLabAnalyses(prev => {
      const updated = typeof newAnalyses === 'function' ? newAnalyses(prev) : newAnalyses;
      syncData('labAnalyses', updated);
      return updated;
    });
  };

  const handleUpdateTasks = (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
    setTasks(prev => {
      const updated = typeof newTasks === 'function' ? newTasks(prev) : newTasks;
      syncData('tasks', updated);
      return updated;
    });
  };

  const handleUpdateMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    setMessages(prev => {
      const updated = typeof newMessages === 'function' ? newMessages(prev) : newMessages;
      syncData('messages', updated);
      return updated;
    });
  };

  const handleUpdateUsers = (newUsers: User[] | ((prev: User[]) => User[])) => {
    setUsers(prev => {
      const updated = typeof newUsers === 'function' ? newUsers(prev) : newUsers;
      syncData('users', updated);
      return updated;
    });
  };

  const handleUpdateLookups = (newLookups: LookupItem[] | ((prev: LookupItem[]) => LookupItem[])) => {
    setLookups(prev => {
      const updated = typeof newLookups === 'function' ? newLookups(prev) : newLookups;
      syncData('lookups', updated);
      return updated;
    });
  };

  const handleLogin = (u: User) => {
    setCurrentUser(u);
    setIsAuthenticated(true);
    localStorage.setItem('pistachio_user', JSON.stringify(u));
    if (u.isFirstLogin) {
      setShowPasswordChangeModal(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pistachio_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('home');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      alert('گذرواژه جدید باید حداقل ۴ کاراکتر باشد.');
      return;
    }

    if (currentUser) {
      const updatedUser = { ...currentUser, password: newPassword, isFirstLogin: false };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      localStorage.setItem('pistachio_user', JSON.stringify(updatedUser));
      syncData('users', users.map(u => u.id === currentUser.id ? updatedUser : u));
    }
    setShowPasswordChangeModal(false);
    setNewPassword('');
    alert('گذرواژه شما با موفقیت به‌روزرسانی شد.');
  };

  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={handleLogin} 
        systemUsers={users} 
        onImport={(data) => {
          if (data.owners) setOwners(data.owners);
          if (data.lands) setLands(data.lands);
          if (data.visits) setVisits(data.visits);
        }} 
      />
    );
  }

  // Scope data for Farmer role so farmers only see their own lands, visits, analyses, tasks & water sources
  const isFarmer = currentUser?.role === 'farmer';
  const farmerOwnerId = currentUser?.ownerId || currentUser?.farmerId || owners.find(o => o.userId === currentUser?.id || o.mobile === currentUser?.username)?.id;

  const visibleOwners = isFarmer
    ? owners.filter(o => o.id === farmerOwnerId || o.userId === currentUser?.id || o.mobile === currentUser?.username)
    : owners;

  const visibleLands = isFarmer
    ? lands.filter(l => l.ownerId === farmerOwnerId || l.farmerId === farmerOwnerId)
    : lands;

  const visibleLandIds = new Set(visibleLands.map(l => l.id));
  const visibleWaterSourceIds = new Set(visibleLands.map(l => l.waterSourceId).filter(Boolean));

  const visibleWaterSources = isFarmer
    ? waterSources.filter(w => visibleWaterSourceIds.has(w.id))
    : waterSources;

  const visibleVisits = isFarmer
    ? visits.filter(v => visibleLandIds.has(v.landId))
    : visits;

  const visibleLabAnalyses = isFarmer
    ? labAnalyses.filter(a => visibleLandIds.has(a.landId))
    : labAnalyses;

  const visibleTasks = isFarmer
    ? tasks.filter(t => visibleLandIds.has(t.landId))
    : tasks;

  // Count unconfirmed tasks or alerts for badges
  const pendingTasksCount = isFarmer
    ? visibleTasks.filter(t => !t.farmerDone).length
    : visibleTasks.filter(t => t.farmerDone && !t.isConfirmed).length;
  const criticalVisitsCount = visibleVisits.filter(v => (v as any).psyllidSeverity === 'خیلی شدید' || (v as any).psyllidSeverity === 'شدید' || (v.psyllid && v.psyllid.includes('شدید'))).length;

  const getTabLabel = (tab: ActiveTab) => {
    switch (tab) {
      case 'home': return { title: 'داشبورد جامع و آمار باغات', category: 'پیشخوان و پایش' };
      case 'calendar': return { title: 'تقویم زراعی و وضعیت زنده هواشناسی', category: 'پیشخوان و پایش' };
      case 'owners': return { title: 'مدیریت مالکان / باغات / منابع آب', category: 'عملیات و باغات' };
      case 'arazi': return { title: 'مدیریت مالکان / باغات / منابع آب', category: 'عملیات و باغات' };
      case 'visits': return { title: 'بازدید و پایش میدانی باغات', category: 'عملیات و باغات' };
      case 'analyses': return { title: 'آزمایشگاه و آنالیز آب، خاک و برگ', category: 'عملیات و باغات' };
      case 'tasks': return { title: 'برنامه‌های مراقبت و دستورالعمل‌های تلفیقی (IPM)', category: 'عملیات و باغات' };
      case 'map': return { title: 'نقشه هوایی و جغرافیایی باغات', category: 'ابزارها و ارتباطات' };
      case 'chat': return { title: 'سامانه ارتباط و پیام با باغدار', category: 'ابزارها و ارتباطات' };
      case 'lookups': return { title: 'جداول پایه، ارقام و واژگان', category: 'مدیریت سامانه' };
      case 'users': return { title: 'مدیریت کاربران و سطوح دسترسی', category: 'مدیریت سامانه' };
      default: return { title: 'سامانه مدیریت باغات پسته', category: 'سامانه' };
    }
  };

  const currentTabInfo = getTabLabel(activeTab);

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-gray-800 font-sans flex antialiased selection:bg-emerald-200 pb-20 sm:pb-0">
      
      {/* 1. Modern Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        araziSubTab={araziSubTab}
        setAraziSubTab={setAraziSubTab}
        currentUser={currentUser}
        landsCount={visibleLands.length}
        ownersCount={visibleOwners.length}
        lookupsCount={lookups.length}
        pendingTasksCount={pendingTasksCount}
        criticalVisitsCount={criticalVisitsCount}
        isOpenMobile={isSidebarOpenMobile}
        setIsOpenMobile={setIsSidebarOpenMobile}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout}
        onOpenPasswordModal={() => setShowPasswordChangeModal(true)}
        onOpenCpanelModal={isFarmer ? undefined : () => setShowCpanelModal(true)}
        onOpenStoreHubModal={isFarmer ? undefined : () => setShowStoreHubModal(true)}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onTriggerSync={triggerFullSync}
        isSyncing={isSyncing}
      />

      {/* 2. Main Application Wrapper (Pushed for Sidebar) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:mr-20' : 'lg:mr-64'
      }`}>
        
        {/* Sticky Topbar */}
        <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            
            {/* Right Side: Hamburger & Breadcrumb Title */}
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setIsSidebarOpenMobile(true)}
                className="p-2 rounded-2xl bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition lg:hidden"
                title="باز کردن منو"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs & Active Title */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold">
                  <span>سامانه باغات پسته</span>
                  <span>/</span>
                  <span className="text-emerald-700 font-black">{currentTabInfo.category}</span>
                </div>
                <h1 className="text-base sm:text-lg font-black text-gray-800 tracking-tight leading-tight">
                  {currentTabInfo.title}
                </h1>
              </div>
            </div>

            {/* Left Side: Sync, Date, Quick Action, and User Info */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Sync Status Badge (Desktop & Tablet) */}
              <button
                onClick={triggerFullSync}
                disabled={isSyncing}
                title={`وضعیت: ${isOnline ? 'متصل به سرور و دیتابیس' : 'آفلاین (ذخیره روی حافظه محلی)'} | کلیک برای همگام‌سازی`}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition ${
                  !isOnline 
                    ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                    : pendingSyncCount > 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {!isOnline ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="text-[11px]">
                  {!isOnline 
                    ? `آفلاین (${pendingSyncCount} در صف)` 
                    : isSyncing 
                    ? 'در حال سینک...' 
                    : pendingSyncCount > 0 
                    ? `${pendingSyncCount} تغییر منتظر ارسال` 
                    : 'دیتابیس آنلاین'}
                </span>
                <RefreshCw className={`w-3 h-3 text-gray-400 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>

              {/* cPanel Database & Mobile API Modal Trigger (Hidden for Farmer) */}
              {!isFarmer && (
                <>
                  <button
                    onClick={() => setShowCpanelModal(true)}
                    className="hidden lg:flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 px-3 py-1.5 rounded-2xl text-xs font-black transition shadow-2xs"
                    title="مشاهده اسکریپت MySQL هاست cPanel و وب‌سرویس اپ موبایل"
                  >
                    <Database className="w-3.5 h-3.5 text-teal-700" />
                    <span>دیتابیس cPanel و API</span>
                  </button>

                  <button
                    onClick={() => setShowStoreHubModal(true)}
                    className="hidden lg:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-2xl text-xs font-black transition shadow-2xs"
                    title="مرکز وب‌سرویس و اتصال به سامانه فروش نهاده‌ها"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-700" />
                    <span>اتصال به فروشگاه نهاده‌ها</span>
                  </button>
                </>
              )}


              {/* Date & Weather Indicator */}
              <div className="hidden xl:flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-3.5 py-1.5 rounded-2xl text-xs font-bold">
                <span>📅 {getTodayJalali().weekdayName}، {toPersianNumbers(getTodayJalali().day)} {getTodayJalali().monthName} {toPersianNumbers(getTodayJalali().year)}</span>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {!isFarmer && (
                  <button
                    onClick={() => setActiveTab('visits')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1.5"
                    title="ثبت پایش و بازدید جدید"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">ثبت بازدید</span>
                  </button>
                )}

                <button
                  onClick={() => setShowPasswordChangeModal(true)}
                  className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
                  title="تغییر رمز عبور"
                >
                  <Lock className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition lg:hidden"
                  title="خروج از حساب"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full max-w-7xl mx-auto space-y-6">
          
          {/* Tab Content Router */}
          <div className="min-h-[500px]">
          {activeTab === 'home' && (
            <DashboardTab
              owners={visibleOwners}
              lands={visibleLands}
              waterSources={visibleWaterSources}
              visits={visibleVisits}
              labAnalyses={visibleLabAnalyses}
              tasks={visibleTasks}
              user={currentUser}
              onNavigate={(tab) => {
                if (tab === 'owners') {
                  setActiveTab('owners');
                  setAraziSubTab(isFarmer ? 'lands' : 'owners');
                } else {
                  setActiveTab(tab as ActiveTab);
                }
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <JalaliWeatherCalendar
                lands={visibleLands}
                visits={visibleVisits}
                tasks={visibleTasks}
              />
            </div>
          )}

          {(activeTab === 'arazi' || activeTab === 'owners') && (
            <AraziTab
              owners={visibleOwners}
              setOwners={handleUpdateOwners}
              lands={visibleLands}
              setLands={handleUpdateLands}
              waterSources={visibleWaterSources}
              setWaterSources={handleUpdateWaterSources}
              user={currentUser}
              lookups={lookups}
              activeSubTab={araziSubTab}
              onSubTabChange={(tab) => {
                setAraziSubTab(tab);
                setActiveTab('arazi');
              }}
            />
          )}

          {activeTab === 'visits' && (
            <VisitsTab
              visits={visibleVisits}
              setVisits={handleUpdateVisits}
              tasks={visibleTasks}
              setTasks={handleUpdateTasks}
              lands={visibleLands}
              owners={visibleOwners}
              user={currentUser}
              lookups={lookups}
              onNavigateToTasks={() => setActiveTab('tasks')}
            />
          )}

          {activeTab === 'analyses' && (
            <AnalysesTab
              labAnalyses={visibleLabAnalyses}
              setLabAnalyses={handleUpdateLabAnalyses}
              lands={visibleLands}
              owners={visibleOwners}
              user={currentUser}
              lookups={lookups}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksTab
              tasks={visibleTasks}
              setTasks={handleUpdateTasks}
              visits={visibleVisits}
              setVisits={handleUpdateVisits}
              lands={visibleLands}
              owners={visibleOwners}
              user={currentUser}
              onNavigateToVisits={() => setActiveTab('visits')}
            />
          )}

          {activeTab === 'map' && (
            <MapReport
              lands={visibleLands}
              waterSources={visibleWaterSources}
              labAnalyses={visibleLabAnalyses}
            />
          )}

          {activeTab === 'chat' && (
            <ChatTab
              messages={messages}
              setMessages={handleUpdateMessages}
              owners={visibleOwners}
              user={currentUser}
            />
          )}

          {activeTab === 'lookups' && !isFarmer && (
            <LookupsTab
              lookups={lookups}
              setLookups={handleUpdateLookups}
              user={currentUser}
            />
          )}

          {activeTab === 'users' && !isFarmer && (
            <UsersTab
              users={users}
              setUsers={handleUpdateUsers}
              currentUser={currentUser}
            />
          )}
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6 text-center text-xs text-gray-500 font-bold">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-700" />
            <span className="text-gray-800 font-black">سامانه یکپارچه مدیریت باغات پسته و باغبانی هوشمند</span>
          </div>
          <div className="text-gray-400 text-[11px]">
            طراحی شده با زیرساخت استاندارد باغبانی، وب‌سرویس موبایل و نقشه‌های بومی OpenStreetMap
          </div>
        </div>
      </footer>
      </div>

      {/* Mobile Touch Bottom Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onTriggerSync={triggerFullSync}
        isSyncing={isSyncing}
        onOpenCpanelModal={() => setShowCpanelModal(true)}
      />

      {/* cPanel MySQL & Mobile API Management Modal */}
      <CpanelDbModal
        isOpen={showCpanelModal}
        onClose={() => setShowCpanelModal(false)}
        isOnline={isOnline}
        onTriggerSync={triggerFullSync}
        isSyncing={isSyncing}
      />

      {/* Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-base font-black text-gray-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-700" />
                تغییر رمز عبور حساب کاربری
              </h3>
              <button onClick={() => setShowPasswordChangeModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <p className="text-xs text-gray-500 font-bold">
                جهت حفظ امنیت حساب خود در سامانه باغات پسته، رمز عبور جدید را وارد کنید:
              </p>

              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">رمز عبور جدید *</label>
                <input
                  required
                  type="password"
                  placeholder="حداقل ۴ کاراکتر"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 rounded-xl shadow transition text-xs"
                >
                  ذخیره گذرواژه جدید
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="px-4 bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl text-xs"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStoreHubModal && (
        <StoreIntegrationHubModal
          isOpen={showStoreHubModal}
          onClose={() => setShowStoreHubModal(false)}
          onRefreshData={triggerFullSync}
        />
      )}

    </div>
  );
};


export default App;
