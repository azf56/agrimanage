import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Smartphone, 
  Server, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Wifi, 
  WifiOff,
  Code,
  HardDrive,
  Globe
} from 'lucide-react';
import { getOfflineQueue, clearOfflineQueue, getDeviceId, getLastSyncTimeFormatted } from '../offlineSync';

interface CpanelDbModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const CpanelDbModal: React.FC<CpanelDbModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  onTriggerSync,
  isSyncing
}) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'mysql_test' | 'mobile_api' | 'offline_engine'>('sql');
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loadingSql, setLoadingSql] = useState(false);

  // MySQL Test State
  const [mysqlHost, setMysqlHost] = useState('localhost');
  const [mysqlPort, setMysqlPort] = useState('3306');
  const [mysqlDb, setMysqlDb] = useState('agrimanage_pistachio');
  const [mysqlUser, setMysqlUser] = useState('cpanel_user');
  const [mysqlPass, setMysqlPass] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Offline Queue State
  const [queueCount, setQueueCount] = useState(0);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQueueCount(getOfflineQueue().length);
      setDeviceId(getDeviceId());
      fetchSqlSchema();
    }
  }, [isOpen]);

  const fetchSqlSchema = async () => {
    setLoadingSql(true);
    try {
      const res = await fetch('/api/database/sql-schema');
      if (res.ok) {
        const text = await res.text();
        setSqlSchema(text);
      }
    } catch (e) {
      console.error('Error fetching sql schema:', e);
    } finally {
      setLoadingSql(false);
    }
  };

  const handleCopySql = () => {
    if (!sqlSchema) return;
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const element = document.createElement('a');
    const file = new Blob([sqlSchema], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'cpanel_pistachio_schema.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleTestMysql = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingConnection(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/database/test-mysql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: mysqlHost,
          port: mysqlPort,
          database: mysqlDb,
          user: mysqlUser,
          password: mysqlPass
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error || 'خطا در برقراری اتصال با سرور MySQL' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'عدم دسترسی به سرور API' });
    } finally {
      setTestingConnection(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Database className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-black">پایگاه داده cPanel، سینک آفلاین و وب‌سرویس موبایل</h2>
              <p className="text-xs text-emerald-200 font-medium">پشتیبانی یکپارچه از هاست اشتراکی cPanel، اپلیکیشن Native و پنل تحت وب</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/15 rounded-xl transition text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Server className="w-4 h-4" />
            اسکریپت پایگاه داده cPanel (phpMyAdmin)
          </button>

          <button
            onClick={() => setActiveTab('mysql_test')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'mysql_test'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="w-4 h-4" />
            تست اتصال MySQL
          </button>

          <button
            onClick={() => setActiveTab('offline_engine')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'offline_engine'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            موتور آفلاین گوشی و صف سینک
            {queueCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {queueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mobile_api')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'mobile_api'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            مستندات REST API اپ موبایل
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: SQL Schema for cPanel */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  دستورالعمل استقرار در هاست اشتراکی cPanel:
                </div>
                <ol className="list-decimal list-inside space-y-1.5 pr-2 text-gray-700 leading-relaxed font-medium">
                  <li>وارد کنترل‌پنل <strong>cPanel</strong> هاست خود شوید و به بخش <strong>MySQL Databases</strong> بروید.</li>
                  <li>یک پایگاه‌داده جدید (مثلاً <code className="bg-white px-1.5 py-0.5 rounded border">agrimanage_pistachio</code>) و یک کاربر بسازید و تمام دسترسی‌ها (ALL PRIVILEGES) را بدهید.</li>
                  <li>وارد بخش <strong>phpMyAdmin</strong> شده، دیتابیس خود را انتخاب کرده و اسکریپت SQL زیر را در تب <strong>SQL</strong> یا از طریق <strong>Import</strong> اجرا کنید.</li>
                </ol>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-gray-500" />
                  محتوای فایل <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">cpanel_schema.sql</code> (UTF8mb4 Persian):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'کپی شد!' : 'کپی اسکریپت SQL'}
                  </button>
                  <button
                    onClick={handleDownloadSql}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    دانلود فایل .sql
                  </button>
                </div>
              </div>

              <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-900">
                <pre className="p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-72 leading-relaxed dir-ltr text-left">
                  {loadingSql ? 'در حال بارگذاری فایل SQL...' : (sqlSchema || '-- SQL Schema is ready for export --')}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: MySQL Connection Tester */}
          {activeTab === 'mysql_test' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  آزمایش ارتباط زنده با سرور دیتابیس MySQL cPanel
                </p>
                <p className="text-gray-600">
                  اگر می‌خواهید بک‌اند مستقیماً به دیتابیس هاست متصل شود، آدرس سرور و اطلاعات لاگین دیتابیس را وارد کرده و دکمه تست را فشار دهید. (نکته: در صورت خطای اتصال، IP سرور را در بخش Remote MySQL سی‌پنل اضافه فرمایید).
                </p>
              </div>

              <form onSubmit={handleTestMysql} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">آدرس سرور MySQL (Host / IP)</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={mysqlHost}
                      onChange={e => setMysqlHost(e.target.value)}
                      placeholder="مثال: mysql.yourdomain.com یا localhost"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">پورت (Port)</label>
                    <input
                      type="number"
                      dir="ltr"
                      value={mysqlPort}
                      onChange={e => setMysqlPort(e.target.value)}
                      placeholder="3306"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نام پایگاه داده (Database Name)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={mysqlDb}
                    onChange={e => setMysqlDb(e.target.value)}
                    placeholder="cpaneluser_agrimanage"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">نام کاربری دیتابیس (DB User)</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={mysqlUser}
                      onChange={e => setMysqlUser(e.target.value)}
                      placeholder="cpaneluser_dbuser"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">کلمه عبور (DB Password)</label>
                    <input
                      type="password"
                      dir="ltr"
                      value={mysqlPass}
                      onChange={e => setMysqlPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={testingConnection}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${testingConnection ? 'animate-spin' : ''}`} />
                  {testingConnection ? 'در حال برقراری اتصال با MySQL...' : 'تست زنده اتصال به هاست cPanel'}
                </button>
              </form>

              {testResult && (
                <div className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{testResult.success ? 'اتصال موفقیت‌آمیز' : 'خطا در اتصال'}</p>
                    <p className="leading-relaxed">{testResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Offline Engine & Sync Queue */}
          {activeTab === 'offline_engine' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                  <span className="text-xs text-gray-500 font-bold block">وضعیت شبکه دستگاه</span>
                  <div className="flex items-center gap-2 text-sm font-black">
                    {isOnline ? (
                      <>
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-emerald-700">آنلاین و متصل به سرور</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                        <span className="text-amber-700">آفلاین (ذخیره روی گوشی)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                  <span className="text-xs text-gray-500 font-bold block">صف انتظار ارسال (Outbox)</span>
                  <span className="text-lg font-black text-gray-800">
                    {queueCount} رکورد جدید
                  </span>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                  <span className="text-xs text-gray-500 font-bold block">آخرین همگام‌سازی موفق</span>
                  <span className="text-xs font-bold text-gray-700">
                    {getLastSyncTimeFormatted()}
                  </span>
                </div>
              </div>

              <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl space-y-3">
                <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-emerald-700" />
                  سازوکار کارکرد آفلاین در باغات پسته (Offline-First Architecture)
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  تمامی اطلاعات اراضی، پایش‌ها و دستورالعمل‌ها به صورت اتوماتیک در پایگاه‌داده محلی مرورگر و گوشی کارشناس (IndexedDB / LocalStorage) ذخیره می‌شوند. کارشناس در وسط باغ بدون اینترنت می‌تواند بازدیدها را ثبت کند. به محض اتصال مجدد به اینترنت، موتور سینک داده‌ها را به سرور cPanel منتقل می‌کند.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => {
                      onTriggerSync();
                      setQueueCount(getOfflineQueue().length);
                    }}
                    disabled={isSyncing || !isOnline}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'در حال همگام‌سازی...' : 'همگام‌سازی فوری با سرور مرکزی'}
                  </button>

                  <button
                    onClick={() => {
                      clearOfflineQueue();
                      setQueueCount(0);
                    }}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-xs transition"
                  >
                    تخلیه دستی صف ارسال
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 font-mono flex items-center justify-between border-t pt-3">
                <span>شناسه یکتای دستگاه (Device UUID):</span>
                <span className="font-bold text-gray-700 dir-ltr">{deviceId}</span>
              </div>
            </div>
          )}

          {/* TAB 4: Mobile App REST API Specification */}
          {activeTab === 'mobile_api' && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-2">
                <h4 className="font-black text-gray-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  اندپوینت‌های آماده جهت استفاده در اپلیکیشن Native (React Native / Flutter / Kotlin / Swift)
                </h4>
                <p className="text-gray-600 leading-relaxed font-medium">
                  اپلیکیشن موبایل از طریق این وب‌سرویس‌ها با سرور و دیتابیس MySQL هاست cPanel تبادل اطلاعات می‌نماید:
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                
                {/* Auth */}
                <div className="border border-gray-200 rounded-xl p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">POST</span>
                      <span className="font-bold text-gray-800">/api/auth/login</span>
                    </div>
                    <span className="text-[10px] font-sans text-gray-500">احراز هویت باغدار یا کارشناس</span>
                  </div>
                  <pre className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded dir-ltr text-left">
{`{
  "username": "09131234567",
  "password": "123"
}`}
                  </pre>
                </div>

                {/* Push Sync */}
                <div className="border border-gray-200 rounded-xl p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">POST</span>
                      <span className="font-bold text-gray-800">/api/sync/push</span>
                    </div>
                    <span className="text-[10px] font-sans text-emerald-700 font-bold">ارسال بسته‌ای رکوردهای ثبت‌شده در حالت آفلاین</span>
                  </div>
                  <pre className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded dir-ltr text-left">
{`{
  "deviceId": "dev_phone_uuid",
  "queue": [
    { "table": "visits", "action": "insert", "recordId": "v_101", "data": { ... } },
    { "table": "tasks", "action": "update", "recordId": "t_2", "data": { "farmerDone": true } }
  ]
}`}
                  </pre>
                </div>

                {/* Pull Sync */}
                <div className="border border-gray-200 rounded-xl p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">GET</span>
                      <span className="font-bold text-gray-800">/api/sync/pull?since=2026-08-01</span>
                    </div>
                    <span className="text-[10px] font-sans text-gray-500">دریافت آخرین تغییرات و دستورالعمل‌ها</span>
                  </div>
                </div>

                {/* Direct REST CRUD */}
                <div className="border border-gray-200 rounded-xl p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-teal-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">REST</span>
                      <span className="font-bold text-gray-800">/api/lands | /api/visits | /api/tasks | /api/lookups</span>
                    </div>
                    <span className="text-[10px] font-sans text-gray-500">سرویس‌های CRUD استاندارد</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs">
          <span className="text-gray-500 font-bold">سامانه پسته | ساختار وب، موبایل Native و cPanel MySQL</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold transition"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
};

export default CpanelDbModal;
