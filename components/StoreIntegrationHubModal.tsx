import React, { useState } from 'react';
import { 
  X, Check, Copy, ExternalLink, ArrowRight, RefreshCw, Send, CheckCircle2, 
  AlertCircle, ShieldCheck, Database, ShoppingBag, Code, Terminal, Key, Globe
} from 'lucide-react';
import { toPersianNumbers } from '../jalaliDate';

interface StoreIntegrationHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const StoreIntegrationHubModal: React.FC<StoreIntegrationHubModalProps> = ({
  isOpen,
  onClose,
  onRefreshData
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'endpoints' | 'tester' | 'guide'>('tester');
  const [testMobile, setTestMobile] = useState('09131234567');
  const [testApiKey, setTestApiKey] = useState('agri_store_secret_2025');
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Webhook simulation state
  const [isSimulatingOrder, setIsSimulatingOrder] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // تست لایو اندپوینت نسخه‌ها
  const handleRunPrescriptionTest = async () => {
    try {
      setIsLoadingTest(true);
      setTestError(null);
      setTestResult(null);

      const url = `/api/v1/integration/prescriptions?mobile=${encodeURIComponent(testMobile)}&apiKey=${encodeURIComponent(testApiKey)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setTestError(data.error || `خطای HTTP ${res.status}`);
      } else {
        setTestResult(data);
      }
    } catch (err: any) {
      setTestError('عدم برقراری ارتباط با وب‌سرویس: ' + err.message);
    } finally {
      setIsLoadingTest(false);
    }
  };

  // تست وب‌هوک سفارش از فروشگاه
  const handleSimulateOrderWebhook = async () => {
    try {
      setIsSimulatingOrder(true);
      setWebhookResult(null);

      const payload = {
        mobile: testMobile,
        orderId: 'STORE-ORD-' + Math.floor(1000 + Math.random() * 9000),
        storeInvoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000),
        totalAmount: 3300000,
        date: '۱۴۰۴/۰۲/۲۵',
        items: [
          { name: 'صابون محلول‌پاشی ارگانیک پالیگان (گالن ۲۰ لیتری)', quantity: 1, unit: 'گالن', price: 1850000 },
          { name: 'کلات کلسیم-بور مایع غلیظ (Cal-Bor)', quantity: 1, unit: 'بطری ۵ لیتری', price: 1450000 }
        ]
      };

      const res = await fetch('/api/v1/integration/order-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testApiKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setWebhookResult(data);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert('خطا در تست وب‌هوک: ' + err.message);
    } finally {
      setIsSimulatingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white p-5 rounded-t-3xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Globe className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-black">مرکز اتصال به سامانه فروش نهاده‌ها (Integration Hub)</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                هماهنگی وب‌سرویس‌ها، نام کاربری مشترک و انتقال نسخه به سبد خرید
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'tester'
                ? 'bg-white text-emerald-800 border-t border-x border-gray-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> تستر آنلاین و زنده API
          </button>

          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'endpoints'
                ? 'bg-white text-emerald-800 border-t border-x border-gray-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> آدرس‌ها و کلیدهای ارتباطی
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-white text-emerald-800 border-t border-x border-gray-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> راهنمای برنامه‌نویس فروشگاه
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: LIVE TESTER */}
          {activeTab === 'tester' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-black text-emerald-900">
                  <Terminal className="w-4 h-4 text-emerald-700" />
                  <span>تست زنده دریافت توصیه‌ها توسط سامانه فروش</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  وقتی مشتری در سامانه فروش لاگین می‌کند، فروشگاه با ارسال شماره موبایل او به این وب‌سرویس، تمام توصیه‌ها و نسخه‌های باز باغ او را همراه با مقدار محاسبه‌شده نهاده‌ها دریافت می‌کند.
                </p>
              </div>

              {/* Input Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">شماره موبایل باغدار (جهت تست):</label>
                  <input
                    type="text"
                    value={testMobile}
                    onChange={e => setTestMobile(e.target.value)}
                    placeholder="مثال: 09131234567"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex gap-2 mt-1.5 text-[11px] text-gray-400">
                    <span>شماره‌های تستی موجود:</span>
                    <button
                      type="button"
                      onClick={() => setTestMobile('09131234567')}
                      className="text-emerald-700 hover:underline font-mono"
                    >
                      09131234567 (حاج علی)
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setTestMobile('09129876543')}
                      className="text-emerald-700 hover:underline font-mono"
                    >
                      09129876543 (مهندس حسینی)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کلید API سرور به سرور (Bearer Token):</label>
                  <input
                    type="text"
                    value={testApiKey}
                    onChange={e => setTestApiKey(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">پیش‌فرض: agri_store_secret_2025</span>
                </div>

                <div className="sm:col-span-2 pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={handleRunPrescriptionTest}
                    disabled={isLoadingTest}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-sm flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isLoadingTest ? 'در حال ارسال درخواست...' : 'اجرای تست فراخوانی توصیه‌ها (GET)'}</span>
                  </button>

                  <button
                    onClick={handleSimulateOrderWebhook}
                    disabled={isSimulatingOrder}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-sm flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{isSimulatingOrder ? 'در حال ارسال وب‌هوک...' : 'تست وب‌هوک ثبت خرید فاکتور در باغ (POST)'}</span>
                  </button>
                </div>
              </div>

              {/* Error Output */}
              {testError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{testError}</span>
                </div>
              )}

              {/* Webhook Result Alert */}
              {webhookResult && (
                <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <span>{webhookResult.message}</span>
                      <span className="block text-[11px] font-mono text-emerald-800 mt-0.5">
                        شناسه عملیات هزینه ثبت شده: {webhookResult.operationId} (قطعه: {webhookResult.landName})
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-md font-mono">200 OK</span>
                </div>
              )}

              {/* JSON Live Response */}
              {testResult && (
                <div className="bg-gray-900 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto space-y-2 border border-gray-800 shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-gray-400 text-[11px]">
                    <span>پاسخ دریافتی زنده از API (HTTP 200 OK):</span>
                    <span>{testResult.activePrescriptionsCount} نسخه فعال یافت شد</span>
                  </div>
                  <pre className="text-[11px] leading-relaxed">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ENDPOINTS INFO */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-800">۱. وب‌سرویس دریافت نسخه‌های فعال باغدار:</span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">GET</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex items-center justify-between font-mono text-xs text-gray-800">
                  <span className="truncate">https://avinia.ir/api/v1/integration/prescriptions?mobile=09131234567</span>
                  <button
                    onClick={() => copyToClipboard('https://avinia.ir/api/v1/integration/prescriptions?mobile=09131234567', 'ep1')}
                    className="p-1 text-gray-500 hover:text-emerald-700 transition"
                    title="کپی آدرس"
                  >
                    {copiedKey === 'ep1' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  هدر الزامی: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">Authorization: Bearer agri_store_secret_2025</code>
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-800">۲. وب‌هوک اعلام خرید فاکتور (Order Sync Webhook):</span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">POST</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex items-center justify-between font-mono text-xs text-gray-800">
                  <span className="truncate">https://avinia.ir/api/v1/integration/order-sync</span>
                  <button
                    onClick={() => copyToClipboard('https://avinia.ir/api/v1/integration/order-sync', 'ep2')}
                    className="p-1 text-gray-500 hover:text-emerald-700 transition"
                    title="کپی آدرس"
                  >
                    {copiedKey === 'ep2' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  فروشگاه پس از پرداخت مشتری، مشخصات اقلام را برای ثبت در هزینه‌های قطعه باغ پسته به این آدرس ارسال می‌نماید.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-800">۳. کلید امنیتی ارتباط سرور-به-سرور (Secret Key):</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex items-center justify-between font-mono text-xs text-gray-800">
                  <span>agri_store_secret_2025</span>
                  <button
                    onClick={() => copyToClipboard('agri_store_secret_2025', 'key')}
                    className="p-1 text-gray-500 hover:text-emerald-700 transition"
                  >
                    {copiedKey === 'key' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  این کلید در متغیر محیطی <code className="font-mono">STORE_INTEGRATION_KEY</code> فایل <code className="font-mono">.env</code> هاست ذخیره شده است.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DEVELOPER CODE SAMPLES */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-2xl text-xs font-mono space-y-2 border border-gray-800">
                <div className="flex items-center justify-between text-gray-400 pb-2 border-b border-gray-800">
                  <span>کد نمونه در پلتفرم فروشگاه (Node.js / Express):</span>
                  <button
                    onClick={() => copyToClipboard(`// دریافت نسخه‌های کشاورز بر اساس شماره موبایل لاگین شده
async function fetchFarmerPrescriptions(mobile) {
  const res = await fetch('https://avinia.ir/api/v1/integration/prescriptions?mobile=' + encodeURIComponent(mobile), {
    headers: { 'Authorization': 'Bearer agri_store_secret_2025' }
  });
  const data = await res.json();
  if (data.success && data.activePrescriptionsCount > 0) {
    // نمایش باکس توصیه در بالای داشبورد یا سبد خرید
    console.log('نسخه‌های فعال باغدار:', data.prescriptions);
  }
}`, 'code_node')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-sans"
                  >
                    <Copy className="w-3.5 h-3.5" /> کپی کد
                  </button>
                </div>
                <pre className="text-[11px] text-emerald-300 leading-relaxed overflow-x-auto">
{`// دریافت نسخه‌های کشاورز بر اساس شماره موبایل لاگین شده
async function fetchFarmerPrescriptions(mobile) {
  const res = await fetch('https://avinia.ir/api/v1/integration/prescriptions?mobile=' + encodeURIComponent(mobile), {
    headers: { 'Authorization': 'Bearer agri_store_secret_2025' }
  });
  const data = await res.json();
  if (data.success && data.activePrescriptionsCount > 0) {
    // نمایش باکس توصیه در بالای داشبورد یا سبد خرید
    console.log('نسخه‌های فعال باغدار:', data.prescriptions);
  }
}`}
                </pre>
              </div>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-2xl text-xs font-mono space-y-2 border border-gray-800">
                <div className="flex items-center justify-between text-gray-400 pb-2 border-b border-gray-800">
                  <span>کد نمونه در پلتفرم فروشگاه (PHP / Laravel / cURL):</span>
                </div>
                <pre className="text-[11px] text-cyan-300 leading-relaxed overflow-x-auto">
{`$mobile = $user->mobile; // مثلا 09131234567
$response = Http::withHeaders([
    'Authorization' => 'Bearer agri_store_secret_2025'
])->get("https://avinia.ir/api/v1/integration/prescriptions?mobile={$mobile}");

if ($response->successful()) {
    $prescriptions = $response->json()['prescriptions'];
    // افزودن دکمه "خرید پکیج این نسخه" به سبد خرید
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-xl text-xs font-black transition"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
