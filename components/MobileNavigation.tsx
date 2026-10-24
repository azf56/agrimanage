import React from 'react';
import { 
  Home, 
  Layers, 
  ClipboardCheck, 
  CheckSquare, 
  MessageSquare,
  Wifi,
  WifiOff,
  RefreshCw,
  Database
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface MobileNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onTriggerSync: () => void;
  isSyncing: boolean;
  onOpenCpanelModal: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  pendingSyncCount,
  onTriggerSync,
  isSyncing,
  onOpenCpanelModal
}) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'داشبورد', icon: Home },
    { id: 'arazi' as ActiveTab, label: 'مالکان / باغات', icon: Layers },
    { id: 'visits' as ActiveTab, label: 'پایش و بازدید', icon: ClipboardCheck },
    { id: 'tasks' as ActiveTab, label: 'دستورالعمل‌ها', icon: CheckSquare },
    { id: 'chat' as ActiveTab, label: 'مشاوره', icon: MessageSquare }
  ];

  return (
    <>
      {/* Top Mobile Offline Notice Banner (when offline or has pending outbox items) */}
      {(!isOnline || pendingSyncCount > 0) && (
        <div className={`sm:hidden fixed top-0 left-0 right-0 z-40 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold shadow-md transition-colors ${
          !isOnline 
            ? 'bg-amber-600 text-white' 
            : 'bg-emerald-700 text-white'
        }`}>
          <div className="flex items-center gap-1.5">
            {!isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-200" />
                <span>حالت آفلاین باغ (داده‌ها روی حافظه گوشی ذخیره می‌شوند)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-200" />
                <span>اتصال برقرار است ({pendingSyncCount} مورد در صف ارسال)</span>
              </>
            )}
          </div>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing || !isOnline}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'در حال سینک...' : 'ارسال به سرور'}</span>
          </button>
        </div>
      )}

      {/* Bottom Sticky Mobile Navigation Bar */}
      <nav 
        id="mobile-bottom-nav"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl safe-area-pb"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center h-full w-full gap-1 transition-all ${
                  isActive 
                    ? 'text-emerald-700 font-black' 
                    : 'text-gray-500 hover:text-gray-800 font-medium'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-full shadow-sm" />
                )}
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] leading-tight truncate px-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNavigation;
