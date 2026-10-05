import React, { useState } from 'react';
import { LabAnalysis, Land, Owner, User, LookupItem } from '../types';
import { FlaskConical, Plus, Search, Edit2, Trash2, FileSpreadsheet, Eye, X, Check, FileText, Layers, Sprout } from 'lucide-react';
import { JalaliDatePicker } from './JalaliDatePicker';
import { getTodayJalali } from '../jalaliDate';

interface AnalysesTabProps {
  labAnalyses: LabAnalysis[];
  setLabAnalyses: (data: LabAnalysis[] | ((prev: LabAnalysis[]) => LabAnalysis[])) => void;
  lands: Land[];
  owners: Owner[];
  user: User | null;
  lookups?: LookupItem[];
}

export const AnalysesTab: React.FC<AnalysesTabProps> = ({
  labAnalyses,
  setLabAnalyses,
  lands,
  owners,
  user,
  lookups = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<LabAnalysis | null>(null);
  const [viewingAnalysis, setViewingAnalysis] = useState<LabAnalysis | null>(null);

  const soilTextureItems = lookups.filter(l => l.category === 'soil_textures' && l.isActive);

  const [form, setForm] = useState<Partial<LabAnalysis>>({
    landId: lands[0]?.id || '',
    analysisDate: getTodayJalali().formatted,
    soilEc: 3.2,
    soilPh: 7.6,
    soilTexture: 'شنی لومی (Sandy Loam)',
    soilTnv: 18.5,
    soilOc: 0.85,
    soilSar: 3.1,
    leafN: 2.3,
    leafP: 0.16,
    leafRefK: 1.45,
    leafFe: 92,
    leafZn: 18,
    leafB: 48,
    leafInterpretation: ''
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.landId) {
      alert('انتخاب باغ الزامی است.');
      return;
    }

    if (editingAnalysis) {
      setLabAnalyses(prev => prev.map(a => a.id === editingAnalysis.id ? { ...a, ...form as LabAnalysis } : a));
    } else {
      const newAnalysis: LabAnalysis = {
        id: Math.random().toString(36).substr(2, 9),
        ...(form as LabAnalysis)
      };
      setLabAnalyses(prev => [newAnalysis, ...prev]);
    }
    setShowModal(false);
    setEditingAnalysis(null);
  };

  const filteredAnalyses = labAnalyses.filter(a => {
    return getLandName(a.landId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.analysisDate || '').includes(searchTerm) ||
      (a.leafInterpretation || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-3xl border border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-800">آنالیزهای آزمایشگاهی آب، خاک و برگ پسته</h2>
            <p className="text-xs text-gray-500 font-bold">ثبت نتایج آزمایشات، تعیین عناصر غذایی، شوری، آهک و تفسیر تغذیه‌ای</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="جستجو در آزمایش‌ها..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              setEditingAnalysis(null);
              setForm({
                landId: lands[0]?.id || '',
                analysisDate: '۱۴۰۴/۰۱/۲۰',
                soilEc: 3.2,
                soilPh: 7.6,
                soilTexture: 'شنی لومی (Sandy Loam)',
                soilTnv: 18.5,
                soilOc: 0.85,
                soilSar: 3.1,
                leafN: 2.3,
                leafP: 0.16,
                leafRefK: 1.45,
                leafFe: 92,
                leafZn: 18,
                leafB: 48,
                leafInterpretation: ''
              });
              setShowModal(true);
            }}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" /> ثبت برگه آنالیز جدید
          </button>
        </div>
      </div>

      {/* Analyses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAnalyses.map(analysis => {
          const landName = getLandName(analysis.landId);
          const ownerName = getOwnerByLand(analysis.landId);

          return (
            <div key={analysis.id} className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-sm hover:border-emerald-300 transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-xl">
                    📅 {analysis.analysisDate}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingAnalysis(analysis)}
                      className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                      title="مشاهده کامل"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingAnalysis(analysis);
                        setForm(analysis);
                        setShowModal(true);
                      }}
                      className="p-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition"
                      title="ویرایش"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('آیا از حذف این آنالیز مطمئن هستید؟')) {
                          setLabAnalyses(prev => prev.filter(a => a.id !== analysis.id));
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
                <p className="text-xs text-emerald-700 font-bold mb-3">باغدار: {ownerName}</p>

                <div className="space-y-2 text-xs bg-gray-50/80 p-3 rounded-2xl border border-gray-200/70">
                  <div className="font-black text-gray-800 border-b border-gray-200 pb-1 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-gray-600" /> آنالیز خاک:
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <div>EC: <span className="font-bold text-gray-900">{analysis.soilEc}</span></div>
                    <div>pH: <span className="font-bold text-gray-900">{analysis.soilPh}</span></div>
                    <div>آهک: <span className="font-bold text-gray-900">{analysis.soilTnv}%</span></div>
                  </div>

                  <div className="font-black text-gray-800 border-b border-gray-200 pt-1 pb-1 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-700" /> عناصر برگ پسته:
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <div>N: <span className="font-bold text-gray-900">{analysis.leafN}%</span></div>
                    <div>P: <span className="font-bold text-gray-900">{analysis.leafP}%</span></div>
                    <div>K: <span className="font-bold text-emerald-700">{analysis.leafRefK}%</span></div>
                    <div>Fe: <span className="font-bold text-gray-900">{analysis.leafFe}ppm</span></div>
                    <div>Zn: <span className="font-bold text-gray-900">{analysis.leafZn}ppm</span></div>
                    <div>B: <span className="font-bold text-gray-900">{analysis.leafB}ppm</span></div>
                  </div>

                  {analysis.leafInterpretation && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-400 block mb-0.5 font-medium">تفسیر آزمایشگاه:</span>
                      <p className="text-gray-700 font-bold line-clamp-2">{analysis.leafInterpretation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAnalyses.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 border-2 border-dashed rounded-3xl">
            هیچ برگه آنالیز آزمایشگاهی ثبت نشده است.
          </div>
        )}
      </div>

      {/* Modal: New / Edit Analysis */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-black text-gray-800">
                  {editingAnalysis ? 'ویرایش نتایج آنالیز آزمایشگاهی' : 'ثبت برگه آزمایش خاک و برگ پسته'}
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-0.5">ورود داده‌های آزمایشگاهی، تعیین عناصر پرمصرف و کم‌مصرف و تفسیر</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80">
                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">انتخاب قطعه باغ *</label>
                  <select
                    required
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.landId || ''}
                    onChange={e => setForm({ ...form, landId: e.target.value })}
                  >
                    <option value="">انتخاب قطعه باغ...</option>
                    {lands.map(l => (
                      <option key={l.id} value={l.id}>{l.name || l.title} (باغدار: {getOwnerByLand(l.id)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  {(() => {
                    const selLand = lands.find(l => l.id === form.landId);
                    return (
                      <JalaliDatePicker
                        required
                        label="تاریخ نمونه‌برداری و آزمایش"
                        placeholder="۱۴۰۵/۰۵/۲۵"
                        value={form.analysisDate || ''}
                        latitude={Number(selLand?.latitude) || 30.4067}
                        longitude={Number(selLand?.longitude) || 55.9939}
                        locationName={selLand?.name ? `باغ: ${selLand.name}` : undefined}
                        onChange={val => setForm(prev => ({ ...prev, analysisDate: val }))}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* بخش خاک */}
              <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60">
                  <div className="p-1.5 bg-gray-200 text-gray-800 rounded-lg">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-gray-900">آنالیز فیزیکی و شیمیایی خاک</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">شوری خاک EC (dS/m)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.soilEc || ''}
                      onChange={e => setForm({ ...form, soilEc: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">اسیدیته خاک pH</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.soilPh || ''}
                      onChange={e => setForm({ ...form, soilPh: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">بافت خاک</label>
                    {soilTextureItems.length > 0 ? (
                      <select
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        value={form.soilTexture || ''}
                        onChange={e => setForm({ ...form, soilTexture: e.target.value })}
                      >
                        <option value="">-- انتخاب بافت خاک --</option>
                        {soilTextureItems.map(st => (
                          <option key={st.id} value={st.title}>
                            {st.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="شنی لومی، لومی، رسی"
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        value={form.soilTexture || ''}
                        onChange={e => setForm({ ...form, soilTexture: e.target.value })}
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">آهک کل TNV (%)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.soilTnv || ''}
                      onChange={e => setForm({ ...form, soilTnv: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">کربن آلی OC (%)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.soilOc || ''}
                      onChange={e => setForm({ ...form, soilOc: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">نسبت جذب سدیم SAR</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.soilSar || ''}
                      onChange={e => setForm({ ...form, soilSar: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* بخش برگ */}
              <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-gray-900">آنالیز عناصر برگ پسته (ماکرو و میکرو)</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">ازت برگ N (%)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.leafN || ''}
                      onChange={e => setForm({ ...form, leafN: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">فسفر برگ P (%)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.leafP || ''}
                      onChange={e => setForm({ ...form, leafP: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">پتاسیم برگ K (%)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.leafRefK || ''}
                      onChange={e => setForm({ ...form, leafRefK: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">آهن Fe (ppm)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.leafFe || ''}
                      onChange={e => setForm({ ...form, leafFe: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">روی Zn (ppm)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.leafZn || ''}
                      onChange={e => setForm({ ...form, leafZn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-700 mb-1 block">بور B (ppm)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.leafB || ''}
                      onChange={e => setForm({ ...form, leafB: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">تفسیر جامع آزمایشگاه و توصیه‌های کودی</label>
                <textarea
                  rows={3}
                  placeholder="تحلیل وضعیت عناصر و توصیه‌های تغذیه برگی یا خاکی پسته..."
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.leafInterpretation || ''}
                  onChange={e => setForm({ ...form, leafInterpretation: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-2xl shadow-lg transition text-xs"
                >
                  {editingAnalysis ? 'ذخیره تغییرات آنالیز' : 'ثبت برگه آنالیز آزمایشگاه'}
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

      {/* Modal: View Details */}
      {viewingAnalysis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-800">
                  برگه کامل آنالیز {getLandName(viewingAnalysis.landId)}
                </h3>
                <span className="text-xs font-mono font-bold text-gray-500">تاریخ: {viewingAnalysis.analysisDate}</span>
              </div>
              <button onClick={() => setViewingAnalysis(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h4 className="font-black text-gray-900 mb-2 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-gray-700" /> آنالیز خاک:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-gray-800">
                  <div>EC: <b className="font-mono font-bold">{viewingAnalysis.soilEc}</b></div>
                  <div>pH: <b className="font-mono font-bold">{viewingAnalysis.soilPh}</b></div>
                  <div>بافت خاک: <b>{viewingAnalysis.soilTexture || '---'}</b></div>
                  <div>آهک کل: <b className="font-mono font-bold">{viewingAnalysis.soilTnv}%</b></div>
                  <div>کربن آلی: <b className="font-mono font-bold">{viewingAnalysis.soilOc}%</b></div>
                  <div>SAR: <b className="font-mono font-bold">{viewingAnalysis.soilSar}</b></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h4 className="font-black text-emerald-800 mb-2 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4" /> عناصر برگ:
                </h4>
                <div className="grid grid-cols-3 gap-2 text-gray-800">
                  <div>ازت (N): <b className="font-mono font-bold">{viewingAnalysis.leafN}%</b></div>
                  <div>فسفر (P): <b className="font-mono font-bold">{viewingAnalysis.leafP}%</b></div>
                  <div>پتاسیم (K): <b className="font-mono font-bold text-emerald-700">{viewingAnalysis.leafRefK}%</b></div>
                  <div>آهن (Fe): <b className="font-mono font-bold">{viewingAnalysis.leafFe} ppm</b></div>
                  <div>روی (Zn): <b className="font-mono font-bold">{viewingAnalysis.leafZn} ppm</b></div>
                  <div>بور (B): <b className="font-mono font-bold">{viewingAnalysis.leafB} ppm</b></div>
                </div>
              </div>

              {viewingAnalysis.leafInterpretation && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <h4 className="font-black text-gray-900 mb-1">تفسیر آزمایشگاه:</h4>
                  <p className="text-gray-800 leading-relaxed font-bold">{viewingAnalysis.leafInterpretation}</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6 flex justify-end">
              <button
                onClick={() => setViewingAnalysis(null)}
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
export default AnalysesTab;
