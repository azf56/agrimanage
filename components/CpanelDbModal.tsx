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
  Globe,
  GitBranch,
  Terminal,
  ExternalLink,
  ShieldCheck,
  FileCode
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
  const [activeTab, setActiveTab] = useState<'sql' | 'mysql_test' | 'mobile_api' | 'offline_engine' | 'github_deploy'>('github_deploy');
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedCpanelYml, setCopiedCpanelYml] = useState(false);
  const [copiedActionYml, setCopiedActionYml] = useState(false);
  const [copiedHtaccess, setCopiedHtaccess] = useState(false);
  const [copiedNodeConfig, setCopiedNodeConfig] = useState(false);
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

          <button
            onClick={() => setActiveTab('github_deploy')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'github_deploy'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            اتصال به گیت‌هاب و استقرار (Git & Deploy)
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

          {/* TAB 5: GitHub & cPanel Deployment Guide */}
          {activeTab === 'github_deploy' && (
            <div className="space-y-6">
              
              {/* Introduction Banner & Multi-site Notice */}
              <div className="bg-gradient-to-l from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <GitBranch className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-black text-white">تنظیمات اختصاصی دامنه avinia.ir در هاست چندسایتی cPanel</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    با توجه به میزبانی سایر وب‌سایت‌ها روی این هاست (مانند سایت اصلی روی <code className="text-emerald-300 font-mono">public_html</code>)، تمام تنظیمات به صورت کاملاً تفکیک‌شده و ایزوله برای دامنه <strong className="text-white">avinia.ir</strong> و پوشه مخزن <strong className="text-emerald-300 font-mono">repositories/agrimanage</strong> آماده شده است تا کمترین تداخلی با سایر سایت‌های هاست شما به وجود نیاید.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 text-xs bg-slate-800/90 px-3.5 py-2.5 rounded-xl border border-slate-700 font-mono text-emerald-300 shrink-0">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>avinia.ir</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                    <span>repositories/agrimanage</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Addon Domain in cPanel */}
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-700 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">گام ۰</span>
                    <h4 className="text-xs font-black text-emerald-950">ایجاد دامنه افزوده (Addon Domain) در cPanel بدون تداخل با سایت‌های دیگر</h4>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200">مهم برای عدم بازنویسی سایت‌های دیگر</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  در cPanel به بخش <strong>Domains</strong> (یا <strong>Addon Domains</strong>) بروید و دامنه <code className="bg-white px-1.5 py-0.5 rounded font-mono text-emerald-800 font-bold">avinia.ir</code> را اضافه کنید.
                  دقت کنید که گزینه <strong>Document Root</strong> حتماً مسیر اختصاصی مانند <code className="bg-white px-1.5 py-0.5 rounded font-mono text-emerald-800 font-bold">public_html/avinia.ir</code> یا <code className="bg-white px-1.5 py-0.5 rounded font-mono text-emerald-800 font-bold">avinia.ir</code> باشد و به هیچ وجه ریشه <code className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono">public_html/</code> انتخاب نشود تا سایت اصلی شما دست‌نخورده باقی بماند.
                </p>
              </div>

              {/* Step 2: Setup Node.js App in cPanel */}
              <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-700 text-white text-xs px-2 py-0.5 rounded-full font-bold">بخش بک‌اند</span>
                    <h4 className="text-xs font-black text-blue-950">تنظیم سرویس اجرای بک‌اند در cPanel (Setup Node.js App)</h4>
                  </div>
                  <button
                    onClick={() => {
                      const cfg = `Node.js Version: 20.x (or 18.x)\nApplication Mode: Production\nApplication Root: repositories/agrimanage\nApplication URL: avinia.ir\nApplication Startup File: dist/server.cjs\nEnvironment Variables:\nPORT=3000\nNODE_ENV=production\nVITE_API_BASE_URL=https://avinia.ir/api\n`;
                      navigator.clipboard.writeText(cfg);
                      setCopiedNodeConfig(true);
                      setTimeout(() => setCopiedNodeConfig(false), 2500);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
                  >
                    {copiedNodeConfig ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedNodeConfig ? 'کپی شد!' : 'کپی مشخصات Setup Node.js App'}
                  </button>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed font-medium">
                  در cPanel وارد منوی <strong>Setup Node.js App</strong> شوید و روی <strong>Create Application</strong> کلیک کنید و مقادیر زیر را درج نمایید:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200">
                    <span className="text-gray-500 block text-[11px]">نسخه نودجی‌اس (Node.js version):</span>
                    <span className="font-bold font-mono text-blue-900">20.x یا 18.x (LTS)</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200">
                    <span className="text-gray-500 block text-[11px]">حالت برنامه (Application mode):</span>
                    <span className="font-bold text-blue-900">Production</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200">
                    <span className="text-gray-500 block text-[11px]">پوشه ریشه برنامه (Application root):</span>
                    <span className="font-bold font-mono text-emerald-700 dir-ltr text-right block">repositories/agrimanage</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200">
                    <span className="text-gray-500 block text-[11px]">آدرس دامنه برنامه (Application URL):</span>
                    <span className="font-bold font-mono text-blue-900 dir-ltr text-right block">avinia.ir</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200 md:col-span-2">
                    <span className="text-gray-500 block text-[11px]">فایل راه‌انداز اولیه (Application startup file):</span>
                    <span className="font-bold font-mono text-blue-900">dist/server.cjs</span>
                    <span className="text-[11px] text-gray-500 mr-2">(تولید شده توسط اسکریپت بیلد esbuild سرور Express)</span>
                  </div>
                </div>
                <p className="text-[11px] text-blue-800">پس از ایجاد، دکمه <strong>Run NPM Install</strong> را در همان صفحه بزنید تا کتابخانه‌ها نصب شوند و سپس روی <strong>Start / Restart</strong> کلیک کنید.</p>
              </div>

              {/* Step 3: cPanel Git™ Version Control */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="bg-gray-50/80 px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-700 text-white text-xs px-2 py-0.5 rounded-full font-bold">روش ۱</span>
                    <h4 className="text-xs font-black text-gray-900">کلون در repositories/agrimanage با cPanel Git™ Version Control</h4>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">اتصال مستقیم از GitHub</span>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  {/* Step 3.1 */}
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-xs">
                      ۱
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="font-bold text-gray-900">دریافت کلید SSH در cPanel و ثبت به عنوان Deploy Key در GitHub:</div>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        در منوی <strong>SSH Access</strong> در cPanel روی <strong>Manage SSH Keys</strong> و سپس <strong>Generate a New Key</strong> کلیک کرده، پس از ساخت کلید عمومی (Public Key) را کپی و روی <strong>Authorize</strong> بزنید. در مخزن GitHub به <strong>Settings &larr; Deploy Keys</strong> بروید و کلید را اضافه کنید.
                      </p>
                    </div>
                  </div>

                  {/* Step 3.2 */}
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-xs">
                      ۲
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="font-bold text-gray-900">ایجاد ریپازیتوری در cPanel (در پوشه repositories/agrimanage):</div>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        در منوی <strong>Git™ Version Control</strong> در cPanel دکمه <strong>Create</strong> را بزنید:
                      </p>
                      <ul className="list-disc list-inside space-y-1 pr-2 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200/80">
                        <li><strong>Clone URL:</strong> آدرس SSH مخزن گیت‌هاب (مثلاً <code className="text-emerald-700 font-mono dir-ltr">git@github.com:YOUR_USER/agrimanage.git</code>)</li>
                        <li><strong>Repository Path:</strong> <code className="text-gray-900 font-bold font-mono dir-ltr">repositories/agrimanage</code></li>
                        <li><strong>Repository Name:</strong> <code className="text-gray-900 font-bold font-mono">agrimanage</code></li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 3.3: .cpanel.yml */}
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-xs">
                      ۳
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-gray-900">فایل استقرار خودکار (<code className="text-emerald-800 font-mono">.cpanel.yml</code>) مخصوص avinia.ir:</div>
                        <button
                          onClick={() => {
                            const yaml = `---\ndeployment:\n  tasks:\n    - export DEPLOYPATH=$(if [ -d "/home/$USER/public_html/avinia.ir" ]; then echo "/home/$USER/public_html/avinia.ir/"; else echo "/home/$USER/avinia.ir/"; fi)\n    - /bin/mkdir -p $DEPLOYPATH\n    - /bin/cp -R dist/* $DEPLOYPATH/\n    - /bin/cp .htaccess $DEPLOYPATH/ 2>/dev/null || true\n`;
                            navigator.clipboard.writeText(yaml);
                            setCopiedCpanelYml(true);
                            setTimeout(() => setCopiedCpanelYml(false), 2500);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                        >
                          {copiedCpanelYml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedCpanelYml ? 'کپی شد!' : 'کپی فایل .cpanel.yml'}
                        </button>
                      </div>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        این فایل از پیش در ریشه پروژه شما ایجاد شده است. این اسکریپت هوشمند مسیر دامنه <code className="text-gray-800 font-mono">avinia.ir</code> را شناسایی کرده و فایل‌ها را فقط در همان پوشه کپی می‌کند تا سایت اصلی هاست آسیبی نبیند:
                      </p>
                      <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] dir-ltr text-left overflow-x-auto border border-slate-800">
{`---
deployment:
  tasks:
    - export DEPLOYPATH=$(if [ -d "/home/$USER/public_html/avinia.ir" ]; then echo "/home/$USER/public_html/avinia.ir/"; else echo "/home/$USER/avinia.ir/"; fi)
    - /bin/mkdir -p $DEPLOYPATH
    - /bin/cp -R dist/* $DEPLOYPATH/
    - /bin/cp .htaccess $DEPLOYPATH/ 2>/dev/null || true`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: .htaccess for avinia.ir */}
              <div className="border border-purple-200 bg-purple-50/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-700 text-white text-xs px-2 py-0.5 rounded-full font-bold">وب‌سرور آپاچی</span>
                    <h4 className="text-xs font-black text-purple-950">فایل تنظیمات .htaccess اختصاصی دامنه avinia.ir (پشتیبانی از React SPA و SSL)</h4>
                  </div>
                  <button
                    onClick={() => {
                      const htContent = `# .htaccess for avinia.ir\nOptions -Indexes\nServerSignature Off\n\n<IfModule mod_rewrite.c>\n  RewriteEngine On\n  RewriteBase /\n\n  # Force HTTPS\n  RewriteCond %{HTTPS} off\n  RewriteCond %{HTTP_HOST} ^(www\\.)?avinia\\.ir$ [NC]\n  RewriteRule ^(.*)$ https://avinia.ir/$1 [L,R=301]\n\n  # SPA Fallback\n  RewriteCond %{REQUEST_FILENAME} -f [OR]\n  RewriteCond %{REQUEST_FILENAME} -d\n  RewriteRule ^ - [L]\n\n  RewriteCond %{REQUEST_URI} ^/api [NC]\n  RewriteRule ^ - [L]\n\n  RewriteRule ^ index.html [L]\n</IfModule>\n`;
                      navigator.clipboard.writeText(htContent);
                      setCopiedHtaccess(true);
                      setTimeout(() => setCopiedHtaccess(false), 2500);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
                  >
                    {copiedHtaccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedHtaccess ? 'کپی شد!' : 'کپی فایل .htaccess'}
                  </button>
                </div>
                <p className="text-xs text-purple-900 leading-relaxed">
                  فایل <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-purple-800">.htaccess</code> در پوشه دامنه <code className="font-mono">avinia.ir</code> قرار می‌گیرد و تضمین می‌کند که روت‌های ری‌اکت در هنگام رفرش صفحه با خطای ۴۰۴ مواجه نشوند و درخواست‌های <code className="font-mono">/api</code> به درستی هدایت شوند.
                </p>
                <pre className="p-3 bg-slate-900 text-purple-300 rounded-xl font-mono text-[11px] dir-ltr text-left overflow-x-auto border border-slate-800">
{`# React SPA Rewrite & HTTPS for avinia.ir
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>`}
                </pre>
              </div>

              {/* Method 2: GitHub Actions CI/CD for avinia.ir */}
              <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-700 text-white text-xs px-2 py-0.5 rounded-full font-bold">روش ۲</span>
                    <h4 className="text-xs font-black text-indigo-950">استقرار خودکار به دامنه avinia.ir با GitHub Actions (بدون مصرف رم سرور)</h4>
                  </div>
                  <button
                    onClick={() => {
                      const actionYml = `name: Deploy AgriManage to cPanel (avinia.ir)\n\non:\n  push:\n    branches: [ main ]\n\njobs:\n  build-and-deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm run build\n      - name: Sync to avinia.ir\n        uses: SamKirkland/FTP-Deploy-Action@v4.3.5\n        with:\n          server: \${{ secrets.CPANEL_FTP_SERVER }}\n          username: \${{ secrets.CPANEL_FTP_USERNAME }}\n          password: \${{ secrets.CPANEL_FTP_PASSWORD }}\n          local-dir: ./dist/\n          server-dir: /public_html/avinia.ir/\n`;
                      navigator.clipboard.writeText(actionYml);
                      setCopiedActionYml(true);
                      setTimeout(() => setCopiedActionYml(false), 2500);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
                  >
                    {copiedActionYml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedActionYml ? 'کپی شد!' : 'کپی workflow اختصاصی avinia.ir'}
                  </button>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  با این متد، پروژه بر روی سرورهای GitHub کامپایل شده و خروجی پوشه <code className="bg-white px-1 py-0.5 rounded border font-mono">dist</code> مستقیماً از طریق اکانت FTP به مسیر <code className="bg-white px-1.5 py-0.5 rounded border font-mono font-bold text-indigo-900">/public_html/avinia.ir/</code> منتقل می‌گردد و هیچ تداخلی با سایر سایت‌های هاست شما ندارد.
                </p>
                <div className="bg-white p-3 rounded-xl border border-indigo-200 text-xs space-y-2">
                  <div className="font-bold text-indigo-900">اقدامات ساده راه‌اندازی:</div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700 pr-1">
                    <li>فایل آماده <code className="text-indigo-800 font-mono">.github/workflows/deploy.yml</code> با مقصد <code className="font-mono font-bold">/public_html/avinia.ir/</code> تنظیم شده است.</li>
                    <li>در cPanel وارد <strong>FTP Accounts</strong> شوید و یک اکانت FTP برای دامنه <code className="font-mono">avinia.ir</code> با دسترسی به همان پوشه بسازید.</li>
                    <li>در GitHub به <strong>Settings &larr; Secrets and variables &larr; Actions</strong> بروید و ۳ مقدار <code className="font-mono">CPANEL_FTP_SERVER</code>، <code className="font-mono">CPANEL_FTP_USERNAME</code> و <code className="font-mono">CPANEL_FTP_PASSWORD</code> را تعریف کنید.</li>
                  </ol>
                </div>
              </div>

              {/* SSH Terminal Quick Commands */}
              <div className="bg-gray-900 text-gray-100 p-4 rounded-2xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    دستورات خط فرمان ترمینال cPanel برای مسیر repositories/agrimanage:
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">Bash Shell</span>
                </div>
                <pre className="text-[11px] text-emerald-300 font-mono bg-black/50 p-3 rounded-xl dir-ltr text-left overflow-x-auto leading-relaxed border border-gray-800">
{`# 1. رفتن به پوشه مخازن و کلون یا آپدیت کد
mkdir -p ~/repositories && cd ~/repositories
git clone git@github.com:YOUR_USERNAME/agrimanage.git
cd agrimanage

# 2. نصب وابستگی‌ها و ایجاد خروجی فرانت و بک‌اند
npm install
npm run build

# 3. انتقال فرانت‌اند به داکیومنت روت دامنه avinia.ir
mkdir -p ~/public_html/avinia.ir
cp -r dist/* ~/public_html/avinia.ir/
cp .htaccess ~/public_html/avinia.ir/`}
                </pre>
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
