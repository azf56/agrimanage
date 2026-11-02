import React, { useState } from 'react';
import { Task, Land, Owner, User } from '../types';
import { matchProductsForTask, generateStoreCartRedirectUrl } from '../storeCatalogService';
import { ShoppingBag, CheckCircle2, ExternalLink, ArrowRight, X, AlertTriangle, ShieldCheck, DollarSign, Calculator, Layers, Sparkles } from 'lucide-react';
import { toPersianNumbers } from '../jalaliDate';

interface StorePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  land?: Land;
  owner?: Owner;
  currentUser: User | null;
  onOrderSynced?: () => void;
}

export const StorePrescriptionModal: React.FC<StorePrescriptionModalProps> = ({
  isOpen,
  onClose,
  task,
  land,
  owner,
  currentUser,
  onOrderSynced
}) => {
  if (!isOpen || !task) return null;

  const matchedInputs = matchProductsForTask(task, land);
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    matchedInputs.forEach(m => {
      initial[m.product.id] = m.recommendedAmount;
    });
    return initial;
  });

  const [isSyncingOrder, setIsSyncingOrder] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  const areaHectares = land?.areaHectares ? Number(land.areaHectares) : 1;
  const landTitle = land?.name || land?.title || 'باغ پسته';
  const ownerName = owner?.name || currentUser?.name || 'باغدار گرامی';
  const ownerMobile = owner?.mobile || '09131234567';

  // محاسبه مبلغ کل سبد
  const grandTotal = matchedInputs.reduce((sum, item) => {
    const qty = quantities[item.product.id] || item.recommendedAmount;
    return sum + (qty * item.product.pricePerUnit);
  }, 0);

  // تغییر تعداد درخواستی
  const handleQuantityChange = (productId: string, val: number) => {
    if (val < 1) return;
    setQuantities(prev => ({ ...prev, [productId]: val }));
  };

  // ارسال به سبد خرید فروشگاه (SSO & Prescription Handoff)
  const handleProceedToStore = () => {
    const items = matchedInputs.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: quantities[item.product.id] || item.recommendedAmount,
      unit: item.unit,
      price: item.product.pricePerUnit
    }));

    const redirectUrl = generateStoreCartRedirectUrl(
      'https://shop.avinia.ir',
      ownerMobile,
      ownerName,
      landTitle,
      items
    );

    // برای تجربه کاربری نرم، توکن به سرور هم لاگ می‌شود
    window.open(redirectUrl, '_blank');
  };

  // ثبت دستی به عنوان فاکتور خرید تایید شده در هزینه‌های باغ
  const handleRecordAsFarmExpense = async () => {
    try {
      setIsSyncingOrder(true);
      setSyncSuccessMessage(null);

      const items = matchedInputs.map(item => ({
        name: item.product.name,
        quantity: quantities[item.product.id] || item.recommendedAmount,
        unit: item.unit,
        price: item.product.pricePerUnit
      }));

      const res = await fetch('/api/v1/integration/order-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: ownerMobile,
          orderId: 'MANUAL-' + Date.now().toString().slice(-6),
          items,
          totalAmount: grandTotal,
          landId: land?.id,
          storeInvoiceNumber: 'INV-' + Math.floor(10000 + Math.random() * 90000)
        })
      });

      const json = await res.json();
      if (json.success) {
        setSyncSuccessMessage('اقلام نسخه با موفقیت به عنوان هزینه عملیاتی این قطعه باغ ثبت شد.');
        if (onOrderSynced) onOrderSynced();
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        alert(json.error || 'خطا در ثبت فاکتور');
      }
    } catch (err: any) {
      alert('خطا در برقراری ارتباط با سرور: ' + err.message);
    } finally {
      setIsSyncingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5 rounded-t-3xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <ShoppingBag className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-black">نهاده‌های پیشنهادی سامانه فروش</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                تطبیق هوشمند اقلام استاندارد با نسخه و مساحت {toPersianNumbers(areaHectares)} هکتار {landTitle}
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

        {/* Prescription Summary */}
        <div className="p-5 border-b border-gray-100 bg-emerald-50/40">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                دستورالعمل مبنا
              </span>
              <h4 className="text-sm font-black text-gray-800 mt-1">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{task.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {syncSuccessMessage && (
            <div className="bg-emerald-100/80 border border-emerald-300 text-emerald-900 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-700">اقلام منطبق در کاتالوگ فروشگاه:</span>
            <span className="text-[11px] text-gray-500 font-bold">
              {toPersianNumbers(matchedInputs.length)} قلم نهاده سازگار
            </span>
          </div>

          {matchedInputs.map(item => {
            const currentQty = quantities[item.product.id] || item.recommendedAmount;
            const lineTotal = currentQty * item.product.pricePerUnit;

            return (
              <div
                key={item.product.id}
                className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-sm hover:border-emerald-300 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {item.product.categoryLabel}
                    </span>
                    <h5 className="text-sm font-black text-gray-800 mt-1">{item.product.name}</h5>
                    <p className="text-xs text-gray-500 font-medium">برند: {item.product.brand} | بسته‌بندی: {item.product.packSize}</p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs text-gray-400 block">قیمت واحد</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">
                      {toPersianNumbers(item.product.pricePerUnit.toLocaleString('fa-IR'))} تومان
                    </span>
                  </div>
                </div>

                {/* Dosage details */}
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-gray-600 font-medium">
                    <strong className="text-gray-800">دوز پیشنهادی:</strong> {item.product.applicationRatePer1000L}
                  </span>
                  <span className="text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md font-bold text-[11px]">
                    حجم محاسبه‌شده برای {toPersianNumbers(areaHectares)} هکتار: {toPersianNumbers(item.recommendedAmount)} {item.unit}
                  </span>
                </div>

                {/* Quantity adjuster & subtotal */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600">تعداد سفارش:</span>
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.product.id, currentQty + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 font-black text-sm"
                      >
                        +
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={currentQty}
                        onChange={e => handleQuantityChange(item.product.id, Number(e.target.value))}
                        className="w-12 text-center text-xs font-bold bg-transparent outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.product.id, currentQty - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 font-black text-sm"
                      >
                        -
                      </button>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{item.unit}</span>
                  </div>

                  <div className="text-left">
                    <span className="text-[11px] text-gray-400 block">مبلغ کل این قلم:</span>
                    <span className="text-xs font-black text-gray-900 font-mono">
                      {toPersianNumbers(lineTotal.toLocaleString('fa-IR'))} تومان
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-gray-50 border-t border-gray-200/80 rounded-b-3xl space-y-3">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-gray-200">
            <div>
              <span className="text-xs text-gray-500 font-bold block">برآورد کل اقلام نسخه</span>
              <span className="text-xs text-gray-400">تحویل درب باغ یا انبار کشاورز</span>
            </div>
            <div className="text-left">
              <span className="text-base font-black text-emerald-800 font-mono">
                {toPersianNumbers(grandTotal.toLocaleString('fa-IR'))} تومان
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleProceedToStore}
              className="bg-emerald-700 hover:bg-emerald-800 text-white py-3 px-4 rounded-2xl font-black text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>انتقال مستقیم به سبد خرید فروشگاه</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
            </button>

            <button
              onClick={handleRecordAsFarmExpense}
              disabled={isSyncingOrder}
              className="bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-2xl font-black text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isSyncingOrder ? 'در حال ثبت...' : 'ثبت فاکتور در هزینه‌های قطعه باغ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
