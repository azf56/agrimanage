import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  Layers, 
  ClipboardCheck, 
  FlaskConical, 
  CheckSquare, 
  MapPin, 
  MessageSquare, 
  Settings, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Sprout, 
  UserCheck, 
  LogOut, 
  Lock, 
  Trees, 
  X,
  Sliders,
  Database,
  Globe
} from 'lucide-react';
import { User } from '../types';

export type ActiveTab = 'home' | 'calendar' | 'owners' | 'arazi' | 'visits' | 'analyses' | 'tasks' | 'map' | 'chat' | 'users' | 'lookups';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  araziSubTab: 'lands' | 'owners' | 'water';
  setAraziSubTab: (tab: 'lands' | 'owners' | 'water') => void;
  currentUser: User | null;
  landsCount: number;
  ownersCount: number;
  lookupsCount: number;
  pendingTasksCount: number;
  criticalVisitsCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
  onOpenPasswordModal: () => void;
  onOpenCpanelModal?: () => void;
  onOpenStoreHubModal?: () => void;
  isOnline?: boolean;
  pendingSyncCount?: number;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  araziSubTab,
  setAraziSubTab,
  currentUser,
  landsCount,
  ownersCount,
  lookupsCount,
  pendingTasksCount,
  criticalVisitsCount,
  isOpenMobile,
  setIsOpenMobile,
  isCollapsed,
  setIsCollapsed,
  onLogout,
  onOpenPasswordModal,
  onOpenCpanelModal,
  onOpenStoreHubModal,
  isOnline = true,
  pendingSyncCount = 0,
  onTriggerSync,
  isSyncing = false
}) => {
  // Submenu state for "مدیریت سامانه"
  const [isSystemManagementOpen, setIsSystemManagementOpen] = useState(
    activeTab === 'lookups' || activeTab === 'users'
  );

  // Auto expand submenu if user navigates to lookups or users
  useEffect(() => {
    if (activeTab === 'lookups' || activeTab === 'users') {
      setIsSystemManagementOpen(true);
    }
  }, [activeTab]);

  const handleTabClick = (tab: ActiveTab, araziSub?: 'lands' | 'owners' | 'water') => {
    setActiveTab(tab);
    if (araziSub) {
      setAraziSubTab(currentUser?.role === 'farmer' && araziSub === 'owners' ? 'lands' : araziSub);
    } else if (tab === 'owners') {
      setAraziSubTab(currentUser?.role === 'farmer' ? 'lands' : 'owners');
    } else if (tab === 'arazi') {
      setAraziSubTab('lands');
    }
    // Close mobile sidebar on navigation
    setIsOpenMobile(false);
  };

  const isSystemTabActive = activeTab === 'lookups' || activeTab === 'users';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 bg-[#164e26] text-white flex flex-col justify-between transition-all duration-300 shadow-2xl ${
          isOpenMobile ? 'translate-x-0 w-72' : 'translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Top: Branding & Header */}
        <div className="p-4 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-green-400 rounded-2xl shadow-md shrink-0 flex items-center justify-center">
              <Trees className="w-5 h-5 text-emerald-950" />
            </div>
            {(!isCollapsed || isOpenMobile) && (
              <div className="truncate text-right">
                <h1 className="font-black text-sm text-white tracking-tight leading-tight truncate">
                  سامانه باغات پسته
                </h1>
                <span className="text-[10px] text-emerald-300/80 font-bold block">
                  مدیریت و پایش هوشمند IPM
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button 
            onClick={() => setIsOpenMobile(false)}
            className="p-1.5 rounded-xl bg-white/10 text-emerald-200 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition items-center justify-center"
            title={isCollapsed ? 'گسترش منو' : 'جمع کردن منو'}
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Middle: Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-emerald-700/50">
          
          {/* Main Navigation Group */}
          <div className="space-y-1">
            {(!isCollapsed || isOpenMobile) && (
              <div className="text-[10px] font-black uppercase text-emerald-300/70 px-3 mb-1">
                پیشخوان و پایش
              </div>
            )}

            {/* Dashboard */}
            <button
              onClick={() => handleTabClick('home')}
              title="داشبورد و آمار"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition text-right group ${
                activeTab === 'home'
                  ? 'bg-emerald-500 text-emerald-950 shadow-md font-black'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <Home className={`w-4 h-4 shrink-0 ${activeTab === 'home' ? 'text-emerald-950' : 'text-emerald-300 group-hover:scale-110'} transition`} />
              {(!isCollapsed || isOpenMobile) && <span>داشبورد و آمار</span>}
            </button>

            {/* Calendar */}
            <button
              onClick={() => handleTabClick('calendar')}
              title="تقویم و هواشناسی"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition text-right group ${
                activeTab === 'calendar'
                  ? 'bg-emerald-500 text-emerald-950 shadow-md font-black'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'calendar' ? 'text-emerald-950' : 'text-emerald-300 group-hover:scale-110'} transition`} />
              {(!isCollapsed || isOpenMobile) && <span>تقویم و هواشناسی</span>}
            </button>
          </div>

          {/* Orchard Operations Group */}
          <div className="space-y-1">
            {(!isCollapsed || isOpenMobile) && (
              <div className="text-[10px] font-black uppercase text-emerald-300/70 px-3 mb-1">
                عملیات و باغات
              </div>
            )}

            {/* Owners / Lands / Water Sources */}
            <button
              onClick={() => handleTabClick('arazi', 'owners')}
              title="مالکان / باغات / منابع آب"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition text-right group ${
                activeTab === 'owners' || activeTab === 'arazi'
                  ? 'bg-emerald-500 text-emerald-950 shadow-md font-black'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Users className={`w-4 h-4 shrink-0 ${(activeTab === 'owners' || activeTab === 'arazi') ? 'text-emerald-950' : 'text-emerald-300 group-hover:scale-110'} transition`} />
                {(!isCollapsed || isOpenMobile) && <span className="truncate">مالکان / باغات / منابع آب</span>}
              </div>
              {(!isCollapsed || isOpenMobile) && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  (activeTab === 'owners' || activeTab === 'arazi')
                    ? 'bg-emerald-900/20 text-emerald-950'
                    : 'bg-emerald-900/80 text-emerald-200'
                }`}>
                  {ownersCount} / {landsCount}
                </span>
              )}
            </button>

            {/* Visits & Scouting */}
            <button
              onClick={() => handleTabClick('visits')}
              title="بازدید و پایش"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition text-right group ${
                activeTab === 'visits'
                  ? 'bg-emerald-500 text-emerald-950 shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <ClipboardCheck className={`w-4 h-4 shrink-0 ${activeTab === 'visits' ? 'text-emerald-950' : 'text-emerald-300 group-hover:scale-110'} transition`} />
                {(!isCollapsed || isOpenMobile) && <span className="truncate">بازدید و پایش</span>}
              </div>
              {criticalVisitsCount > 0 && (!isCollapsed || isOpenMobile) && (
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-mono animate-pulse">
                  {criticalVisitsCount} هشدار
                </span>
              )}
            </button>

            {/* Lab Analyses */}
            <button
              onClick={() => handleTabClick('analyses')}
              title="آنالیز آب، خاک و برگ"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition text-right group ${
                activeTab === 'analyses'
                  ? 'bg-emerald-500 text-emerald-950 shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <FlaskConical className={`w-4 h-4 shrink-0 ${activeTab === 'analyses' ? 'text-emerald-950' : 'text-emerald-300 group-hover:scale-110'} transition`} />
              {(!isCollapsed || isOpenMobile) && <span>آنالیز آب، خاک و برگ</span>}
            </button>

            {/* IPM Tasks */}
            <button
              onClick={() => handleTabClick('tasks')}
              title="دستورالعمل‌ها (IPM)"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition text-right group ${
                activeTab === 'tasks'
                  ? 'bg-emerald-500 text-emerald-950 shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <CheckSquare className={`w-4 h-4 shrink-0 ${activeTab === 'tasks' ? 'text-emerald-950' : 'text-emerald-300 group-hover:scale-110'} transition`} />
                {(!isCollapsed || isOpenMobile) && <span className="truncate">دستورالعمل‌ها (IPM)</span>}
              </div>
              {pendingTasksCount > 0 && (!isCollapsed || isOpenMobile) && (
                <span className="text-[10px] bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full font-mono font-bold">
                  {pendingTasksCount}
                </span>
              )}
            </button>
          </div>

          {/* GIS & Communication Group */}
          <div className="space-y-1">
            {(!isCollapsed || isOpenMobile) && (
              <div className="text-[10px] font-black uppercase text-emerald-300/70 px-3 mb-1">
                ابزارها و ارتباطات
              </div>
            )}

            {/* Map */}
            <button
              onClick={() => handleTabClick('map')}
              title="نقشه باغات (GIS)"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition text-right group ${
                activeTab === 'map'
                  ? 'bg-emerald-500 text-emerald-950 shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <MapPin className={`w-4 h-4 shrink-0 ${activeTab === 'map' ? 'text-emerald-950' : 'text-emerald-300 group-hover:scale-110'} transition`} />
              {(!isCollapsed || isOpenMobile) && <span>نقشه هوایی و GIS</span>}
            </button>

            {/* Chat */}
            <button
              onClick={() => handleTabClick('chat')}
              title="گفتگو و ارتباط با باغدار"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition text-right group ${
                activeTab === 'chat'
                  ? 'bg-emerald-500 text-emerald-950 shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <MessageSquare className={`w-4 h-4 shrink-0 ${activeTab === 'chat' ? 'text-emerald-950' : 'text-emerald-300 group-hover:scale-110'} transition`} />
              {(!isCollapsed || isOpenMobile) && <span>گفتگو با باغدار</span>}
            </button>
          </div>

          {/* Submenu for "مدیریت سامانه" containing Base Tables & Vocabularies + User Management (Hidden for Farmer role) */}
          {currentUser?.role !== 'farmer' && (
            <div className="space-y-1 pt-2 border-t border-emerald-800/60">
              {/* Submenu Trigger */}
              <button
                onClick={() => setIsSystemManagementOpen(!isSystemManagementOpen)}
                title="مدیریت سامانه"
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition text-right group ${
                  isSystemTabActive
                    ? 'bg-emerald-800 text-emerald-200 border border-emerald-600/50'
                    : 'text-emerald-100 hover:bg-emerald-800/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Sliders className={`w-4 h-4 shrink-0 ${isSystemTabActive ? 'text-emerald-300' : 'text-emerald-400 group-hover:scale-110'} transition`} />
                  {(!isCollapsed || isOpenMobile) && <span className="truncate">مدیریت سامانه</span>}
                </div>
                {(!isCollapsed || isOpenMobile) && (
                  <ChevronDown 
                    className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${
                      isSystemManagementOpen ? 'rotate-180' : ''
                    }`} 
                  />
                )}
              </button>

              {/* Submenu Items List */}
              {isSystemManagementOpen && (
                <div className={`space-y-1 pt-1 ${(!isCollapsed || isOpenMobile) ? 'pr-4 border-r-2 border-emerald-700/60 mr-3' : ''}`}>
                  {/* 1. جداول پایه و واژگان */}
                  <button
                    onClick={() => handleTabClick('lookups')}
                    title="جداول پایه و واژگان"
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition text-right group ${
                      activeTab === 'lookups'
                        ? 'bg-emerald-400 text-emerald-950 shadow-sm font-black'
                        : 'text-emerald-200 hover:bg-emerald-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Database className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'lookups' ? 'text-emerald-950' : 'text-emerald-400'}`} />
                      {(!isCollapsed || isOpenMobile) && <span className="truncate">جداول پایه و واژگان</span>}
                    </div>
                    {(!isCollapsed || isOpenMobile) && (
                      <span className="text-[10px] bg-emerald-900 text-emerald-200 px-1.5 py-0.2 rounded font-mono font-bold">
                        {lookupsCount}
                      </span>
                    )}
                  </button>

                  {/* 2. مدیریت کاربران سامانه (برای ادمین و اپراتور) */}
                  {(currentUser?.role === 'admin' || currentUser?.role === 'operator') && (
                    <button
                      onClick={() => handleTabClick('users')}
                      title="مدیریت کاربران سامانه"
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition text-right group ${
                        activeTab === 'users'
                          ? 'bg-emerald-400 text-emerald-950 shadow-sm font-black'
                          : 'text-emerald-200 hover:bg-emerald-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <UserCheck className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'users' ? 'text-emerald-950' : 'text-emerald-400'}`} />
                        {(!isCollapsed || isOpenMobile) && <span className="truncate">مدیریت کاربران</span>}
                      </div>
                    </button>
                  )}

                  {/* 3. دیتابیس cPanel و وب‌سرویس موبایل */}
                  {onOpenCpanelModal && (
                    <button
                      onClick={() => {
                        onOpenCpanelModal();
                        setIsOpenMobile(false);
                      }}
                      title="پایگاه داده cPanel، سینک آفلاین و وب‌سرویس موبایل"
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-teal-200 hover:bg-teal-900/60 hover:text-white transition text-right group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Database className="w-3.5 h-3.5 shrink-0 text-teal-300" />
                        {(!isCollapsed || isOpenMobile) && <span className="truncate">دیتابیس cPanel و API موبایل</span>}
                      </div>
                    </button>
                  )}

                  {onOpenStoreHubModal && (
                    <button
                      onClick={() => {
                        onOpenStoreHubModal();
                        setIsOpenMobile(false);
                      }}
                      title="مرکز وب‌سرویس و اتصال به سامانه فروش نهاده‌ها"
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-teal-200 hover:bg-teal-900/60 hover:text-white transition text-right group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Globe className="w-3.5 h-3.5 shrink-0 text-teal-300" />
                        {(!isCollapsed || isOpenMobile) && <span className="truncate">اتصال به فروشگاه نهاده‌ها</span>}
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </nav>

        {/* Sync & Connectivity Status Widget */}
        {(!isCollapsed || isOpenMobile) && onTriggerSync && (
          <div className="mx-3 mb-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-emerald-100 font-bold truncate">
                {isOnline ? 'دیتابیس آنلاین' : 'آفلاین (حافظه گوشی)'}
              </span>
            </div>
            <button
              onClick={onTriggerSync}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1 text-[10px] bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded-lg font-bold transition disabled:opacity-50"
              title="همگام‌سازی فوری با سرور"
            >
              <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
              <span>{isSyncing ? 'سینک...' : 'سینک'}</span>
            </button>
          </div>
        )}

        {/* Bottom: User Profile & Actions */}
        <div className="p-3 border-t border-emerald-800/60 bg-emerald-950/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/30 border border-emerald-400/30 flex items-center justify-center font-black text-emerald-200 text-xs shrink-0">
                {currentUser?.name?.slice(0, 1) || 'ک'}
              </div>
              {(!isCollapsed || isOpenMobile) && (
                <div className="truncate text-right">
                  <div className="text-xs font-black text-white truncate">{currentUser?.name}</div>
                  <div className="text-[10px] text-emerald-300/80 font-bold truncate">
                    {currentUser?.role === 'admin' ? 'مدیر ارشد سامانه' :
                     currentUser?.role === 'expert' ? 'کارشناس باغبانی' :
                     currentUser?.role === 'operator' ? 'اپراتور' : 'باغدار'}
                  </div>
                </div>
              )}
            </div>

            {(!isCollapsed || isOpenMobile) ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenPasswordModal}
                  className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition"
                  title="تغییر رمز عبور"
                >
                  <Lock className="w-4 h-4" />
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-xl transition"
                  title="خروج از حساب"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogout}
                className="p-1.5 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-xl transition"
                title="خروج از حساب"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
