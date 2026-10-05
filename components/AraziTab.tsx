import React, { useState, useEffect } from 'react';
import { Owner, Land, WaterSource, User, LookupItem } from '../types';
import { Trees, Droplets, Users, Plus, Search, Edit2, Trash2, MapPin, Check, X, Phone, UserCheck, Shield, Sparkles, Info, ArrowLeft, ExternalLink } from 'lucide-react';
import OSMMapPicker from './OSMMapPicker';
import { toPersianNumbers } from '../jalaliDate';

interface AraziTabProps {
  owners: Owner[];
  setOwners: (data: Owner[] | ((prev: Owner[]) => Owner[])) => void;
  lands: Land[];
  setLands: (data: Land[] | ((prev: Land[]) => Land[])) => void;
  waterSources: WaterSource[];
  setWaterSources: (data: WaterSource[] | ((prev: WaterSource[]) => WaterSource[])) => void;
  user: User | null;
  lookups?: LookupItem[];
  activeSubTab?: 'lands' | 'owners' | 'water';
  onSubTabChange?: (tab: 'lands' | 'owners' | 'water') => void;
}

export const AraziTab: React.FC<AraziTabProps> = ({
  owners,
  setOwners,
  lands,
  setLands,
  waterSources,
  setWaterSources,
  user,
  lookups = [],
  activeSubTab,
  onSubTabChange
}) => {
  const [subTab, setSubTabState] = useState<'lands' | 'owners' | 'water'>(activeSubTab || 'lands');
  const [searchTerm, setSearchTerm] = useState('');

  const setSubTab = (tab: 'lands' | 'owners' | 'water') => {
    setSubTabState(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  useEffect(() => {
    if (activeSubTab) {
      setSubTabState(activeSubTab);
    }
  }, [activeSubTab]);

  // Lookup subsets
  const rootstockItems = lookups.filter(l => l.category === 'rootstocks_varieties' && l.isActive);
  const irrigationItems = lookups.filter(l => l.category === 'irrigation_systems' && l.isActive);

  // Modals state
  const [showLandModal, setShowLandModal] = useState(false);
  const [editingLand, setEditingLand] = useState<Land | null>(null);

  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  const [showWaterModal, setShowWaterModal] = useState(false);
  const [editingWater, setEditingWater] = useState<WaterSource | null>(null);

  // Land Form
  const [landForm, setLandForm] = useState<Partial<Land>>({
    name: '',
    areaHectares: 1.0,
    ownerId: '',
    waterSourceId: '',
    pistachioRootstock: 'پیوند اکبری روی پایه بادامی',
    plantingYear: 1390,
    irrigationSystem: 'قطره‌ای تحت فشار',
    irrigationPeriod: '۲۴ روزه',
    latitude: 35.118,
    longitude: 57.184
  });

  // Owner Form
  const [ownerForm, setOwnerForm] = useState<Partial<Owner>>({
    name: '',
    nationalId: '',
    mobile: '',
    phone: ''
  });

  // Water Form
  const [waterForm, setWaterForm] = useState<Partial<WaterSource>>({
    name: '',
    wellDepth: 100,
    flowRate: '۳۰ لیتر بر ثانیه',
    waterEc: '۲.۵',
    waterPh: '۷.۶',
    waterSar: '۳.۰',
    latitude: 35.116,
    longitude: 57.181
  });

  // Handle Land Submit
  const handleSaveLand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landForm.name || !landForm.ownerId) {
      alert('نام باغ و انتخاب مالک الزامی است. در صورتی که مالک ثبت نشده، از دکمه «ثبت مالک جدید» استفاده فرمایید.');
      return;
    }

    if (editingLand) {
      setLands(prev => prev.map(l => l.id === editingLand.id ? { ...l, ...landForm as Land } : l));
    } else {
      const newLand: Land = {
        id: Math.random().toString(36).substr(2, 9),
        ...(landForm as Land)
      };
      setLands(prev => [...prev, newLand]);
    }
    setShowLandModal(false);
    setEditingLand(null);
  };

  // Handle Owner Submit
  const handleSaveOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerForm.name || !ownerForm.nationalId || !ownerForm.mobile) {
      alert('نام، کد ملی و شماره همراه الزامی است.');
      return;
    }

    const newOwnerId = editingOwner ? editingOwner.id : Math.random().toString(36).substr(2, 9);
    const updatedOwner: Owner = {
      id: newOwnerId,
      ...(ownerForm as Owner)
    };

    if (editingOwner) {
      setOwners(prev => prev.map(o => o.id === editingOwner.id ? updatedOwner : o));
    } else {
      setOwners(prev => [...prev, updatedOwner]);
      // If land modal was open, automatically select this new owner
      setLandForm(prev => ({ ...prev, ownerId: newOwnerId, farmerId: newOwnerId }));
    }
    setShowOwnerModal(false);
    setEditingOwner(null);
  };

  // Handle Water Source Submit
  const handleSaveWater = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waterForm.name) {
      alert('نام منبع آب الزامی است.');
      return;
    }

    if (editingWater) {
      setWaterSources(prev => prev.map(w => w.id === editingWater.id ? { ...w, ...waterForm as WaterSource } : w));
    } else {
      const newWater: WaterSource = {
        id: Math.random().toString(36).substr(2, 9),
        ...(waterForm as WaterSource)
      };
      setWaterSources(prev => [...prev, newWater]);
    }
    setShowWaterModal(false);
    setEditingWater(null);
  };

  const getOwnerName = (id: string) => owners.find(o => o.id === id)?.name || 'نامشخص';
  const getWaterName = (id?: string) => waterSources.find(w => w.id === id)?.name || 'تعریف نشده';

  const filteredLands = lands.filter(l => (l.name || l.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || getOwnerName(l.ownerId).toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOwners = owners.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.mobile.includes(searchTerm) || o.nationalId.includes(searchTerm));
  const filteredWater = waterSources.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Informational Guidance Banner */}
      <div className="bg-white border border-gray-200/80 p-4 md:p-5 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-gray-100 text-gray-700 rounded-2xl shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-black text-gray-900 flex items-center gap-1.5">
              مدیریت زنجیره اراضی: مالکان، باغات و منابع آب
            </h4>
            <p className="text-[11px] md:text-xs text-gray-600 font-bold mt-0.5">
              برای شروع، ابتدا در تب <strong className="text-blue-700">«مالکان و باغداران»</strong> مشخصات مالک را تعریف کنید؛ سپس در تب <strong className="text-emerald-700">«باغات پسته»</strong> قطعه باغ را ثبت و به مالک متصل نمایید.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={() => {
              setEditingOwner(null);
              setOwnerForm({ name: '', nationalId: '', mobile: '', phone: '' });
              setShowOwnerModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> ثبت مالک جدید
          </button>
          <button
            onClick={() => {
              setEditingLand(null);
              setLandForm({
                name: '', areaHectares: 1.0, ownerId: owners[0]?.id || '',
                waterSourceId: waterSources[0]?.id || '',
                pistachioRootstock: 'پیوند اکبری روی پایه بادامی',
                plantingYear: 1390, irrigationSystem: 'قطره‌ای تحت فشار',
                irrigationPeriod: '۲۴ روزه', latitude: 35.118, longitude: 57.184
              });
              setShowLandModal(true);
            }}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> ثبت باغ جدید
          </button>
        </div>
      </div>

      {/* Subtabs header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSubTab('owners')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 whitespace-nowrap ${
              subTab === 'owners' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" /> ۱. مالکان و باغداران ({owners.length})
          </button>
          <button
            onClick={() => setSubTab('lands')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 whitespace-nowrap ${
              subTab === 'lands' ? 'bg-emerald-700 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trees className="w-4 h-4" /> ۲. باغات پسته ({lands.length})
          </button>
          <button
            onClick={() => setSubTab('water')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 whitespace-nowrap ${
              subTab === 'water' ? 'bg-teal-700 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Droplets className="w-4 h-4" /> ۳. منابع آب و چاه‌ها ({waterSources.length})
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder={subTab === 'owners' ? 'جستجوی نام مالک، کد ملی، شماره تماس...' : 'جستجو در این بخش...'}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {subTab === 'lands' && (
            <button
              onClick={() => {
                setEditingLand(null);
                setLandForm({
                  name: '', areaHectares: 1.0, ownerId: owners[0]?.id || '',
                  waterSourceId: waterSources[0]?.id || '',
                  pistachioRootstock: 'پیوند اکبری روی پایه بادامی',
                  plantingYear: 1390, irrigationSystem: 'قطره‌ای تحت فشار',
                  irrigationPeriod: '۲۴ روزه', latitude: 35.118, longitude: 57.184
                });
                setShowLandModal(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> افزودن باغ
            </button>
          )}

          {subTab === 'owners' && (
            <button
              onClick={() => {
                setEditingOwner(null);
                setOwnerForm({ name: '', nationalId: '', mobile: '', phone: '' });
                setShowOwnerModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> ثبت باغدار / مالک جدید
            </button>
          )}

          {subTab === 'water' && (
            <button
              onClick={() => {
                setEditingWater(null);
                setWaterForm({ name: '', wellDepth: 100, flowRate: '۳۰ لیتر بر ثانیه', waterEc: '۲.۵', waterPh: '۷.۶', waterSar: '۳.۰', latitude: 35.116, longitude: 57.181 });
                setShowWaterModal(true);
              }}
              className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> افزودن چاه موتور
            </button>
          )}
        </div>
      </div>

      {/* Lands List */}
      {subTab === 'lands' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLands.map(land => (
            <div key={land.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:border-emerald-200 transition group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl">
                    <Trees className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                    <button 
                      onClick={() => {
                        setEditingLand(land);
                        setLandForm(land);
                        setShowLandModal(true);
                      }}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                      title="ویرایش"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`آیا از حذف باغ ${land.name || land.title} اطمینان دارید؟`)) {
                          setLands(prev => prev.filter(l => l.id !== land.id));
                        }
                      }}
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-black text-gray-800 text-base mb-1">{land.name || land.title}</h3>
                <p className="text-xs text-emerald-700 font-bold mb-3">مالک: {getOwnerName(land.ownerId)}</p>

                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">مساحت:</span>
                    <span className="font-black text-gray-800">{land.areaHectares || land.area} هکتار</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">رقم / پایه:</span>
                    <span className="font-bold text-gray-700 truncate max-w-[170px]">{land.pistachioRootstock || 'نامشخص'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">سیستم و دور:</span>
                    <span className="font-bold text-gray-700">{land.irrigationSystem} ({land.irrigationPeriod})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">منبع آب:</span>
                    <span className="font-bold text-blue-700">{getWaterName(land.waterSourceId)}</span>
                  </div>
                </div>
              </div>

              {land.latitude && land.longitude && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {Number(land.latitude).toFixed(3)}, {Number(land.longitude).toFixed(3)}
                  </span>
                  <span className="text-emerald-700 font-bold">ثبت شده روی نقشه</span>
                </div>
              )}
            </div>
          ))}
          {filteredLands.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-400 border-2 border-dashed rounded-3xl">
              هیچ قطعه باغ پسته‌ای یافت نشد.
            </div>
          )}
        </div>
      )}

      {/* Owners List */}
      {subTab === 'owners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 text-xs font-black text-blue-900">
              <Users className="w-4 h-4 text-blue-700" />
              <span>فهرست کل مالکان و بهره‌برداران باغات ({owners.length} نفر)</span>
            </div>
            <span className="text-[11px] text-gray-500 font-bold">
              برای تخصیص باغ، مالک باید در این بخش ثبت شده باشد
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOwners.map(owner => {
              const ownerLands = lands.filter(l => l.ownerId === owner.id || (l as any).farmerId === owner.id);
              const totalArea = ownerLands.reduce((acc, l) => acc + (Number(l.areaHectares) || Number(l.area) || 0), 0);

              return (
                <div key={owner.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:border-blue-200 transition flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-3 bg-blue-50 text-blue-800 rounded-2xl group-hover:scale-105 transition">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => {
                            setEditingOwner(owner);
                            setOwnerForm(owner);
                            setShowOwnerModal(true);
                          }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                          title="ویرایش مشخصات"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`آیا از حذف مشخصات ${owner.name} مطمئن هستید؟`)) {
                              setOwners(prev => prev.filter(o => o.id !== owner.id));
                            }
                          }}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-black text-gray-800 text-base mb-1">{owner.name}</h3>
                    
                    <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-2xl border border-gray-100 mt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">کد ملی:</span>
                        <span className="font-mono font-bold text-gray-800">{toPersianNumbers(owner.nationalId)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">شماره همراه:</span>
                        <span className="font-mono font-bold text-emerald-700">{toPersianNumbers(owner.mobile)}</span>
                      </div>
                      {owner.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">تلفن ثابت:</span>
                          <span className="font-mono text-gray-700">{toPersianNumbers(owner.phone)}</span>
                        </div>
                      )}
                    </div>

                    {/* Connected Gardens summary */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold flex items-center gap-1">
                          <Trees className="w-3.5 h-3.5 text-emerald-600" /> باغات متصل:
                        </span>
                        <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                          {toPersianNumbers(ownerLands.length)} قطعه ({toPersianNumbers(totalArea.toFixed(1))} هکتار)
                        </span>
                      </div>

                      {ownerLands.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {ownerLands.map(l => (
                            <span key={l.id} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-bold truncate max-w-[140px]">
                              {l.name || l.title}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm(owner.name);
                            setSubTab('lands');
                          }}
                          className="flex-1 text-[11px] font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-xl text-center transition border border-emerald-200"
                        >
                          مشاهده باغات این مالک
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLand(null);
                            setLandForm({
                              name: '', areaHectares: 1.0, ownerId: owner.id,
                              waterSourceId: waterSources[0]?.id || '',
                              pistachioRootstock: 'پیوند اکبری روی پایه بادامی',
                              plantingYear: 1390, irrigationSystem: 'قطره‌ای تحت فشار',
                              irrigationPeriod: '۲۴ روزه', latitude: 35.118, longitude: 57.184
                            });
                            setShowLandModal(true);
                          }}
                          className="text-[11px] font-black text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition border border-blue-200"
                          title="افزودن باغ جدید برای این مالک"
                        >
                          + باغ جدید
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOwners.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-500 bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-black text-gray-800 text-base">هیچ مالک یا باغداری یافت نشد</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto font-bold">
                  مشخصات فردی، کد ملی و شماره همراه مالکان باغات پسته را ثبت نمایید تا بتوانید قطعات باغ را به آن‌ها تخصیص دهید.
                </p>
                <button
                  onClick={() => {
                    setEditingOwner(null);
                    setOwnerForm({ name: '', nationalId: '', mobile: '', phone: '' });
                    setShowOwnerModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black inline-flex items-center gap-2 shadow-md transition"
                >
                  <Plus className="w-4 h-4" /> ثبت اولین باغدار / مالک
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Water Sources List */}
      {subTab === 'water' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWater.map(water => (
            <div key={water.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:border-blue-200 transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-blue-50 text-blue-800 rounded-2xl">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => {
                        setEditingWater(water);
                        setWaterForm(water);
                        setShowWaterModal(true);
                      }}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`آیا از حذف منبع آب ${water.name} مطمئن هستید؟`)) {
                          setWaterSources(prev => prev.filter(w => w.id !== water.id));
                        }
                      }}
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-black text-gray-800 text-base mb-1">{water.name}</h3>
                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-2xl border border-gray-100 mt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">عمق چاه:</span>
                    <span className="font-bold text-gray-800">{water.wellDepth || '---'} متر</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">دبی خروجی:</span>
                    <span className="font-bold text-gray-800">{water.flowRate || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">شوری (EC) و pH:</span>
                    <span className="font-bold text-blue-700">EC: {water.waterEc || '---'} | pH: {water.waterPh || '---'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredWater.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-400 border-2 border-dashed rounded-3xl">
              هیچ منبع آبی ثبت نشده است.
            </div>
          )}
        </div>
      )}

      {/* Modal: Land */}
      {showLandModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-black text-gray-800">
                {editingLand ? 'ویرایش قطعه باغ پسته' : 'ثبت قطعه باغ پسته جدید'}
              </h3>
              <button onClick={() => setShowLandModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLand} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">نام یا عنوان باغ *</label>
                  <input
                    required
                    type="text"
                    placeholder="مثال: قطعه شماره ۱ اکبری"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={landForm.name || landForm.title || ''}
                    onChange={e => setLandForm({ ...landForm, name: e.target.value, title: e.target.value })}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-black text-gray-700 block">مالک / باغدار *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingOwner(null);
                        setOwnerForm({ name: '', nationalId: '', mobile: '', phone: '' });
                        setShowOwnerModal(true);
                      }}
                      className="text-[11px] text-blue-700 hover:text-blue-800 font-black flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition"
                      title="ثبت باغدار جدید در سامانه"
                    >
                      <Plus className="w-3 h-3" /> ثبت مالک جدید
                    </button>
                  </div>
                  <select
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={landForm.ownerId || ''}
                    onChange={e => setLandForm({ ...landForm, ownerId: e.target.value, farmerId: e.target.value })}
                  >
                    <option value="">-- انتخاب مالک یا باغدار --</option>
                    {owners.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.mobile} | کد ملی: {o.nationalId})
                      </option>
                    ))}
                  </select>
                  {owners.length === 0 && (
                    <p className="text-[11px] text-red-600 font-bold mt-1">
                      ⚠️ هنوز هیچ مالکی ثبت نشده است. لطفاً ابتدا از دکمه بالا «ثبت مالک جدید» را بزنید.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">مساحت (هکتار) *</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={landForm.areaHectares || 1.0}
                    onChange={e => setLandForm({ ...landForm, areaHectares: parseFloat(e.target.value) || 1.0, area: parseFloat(e.target.value) || 1.0 })}
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">منبع آب و چاه موتور</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={landForm.waterSourceId || ''}
                    onChange={e => setLandForm({ ...landForm, waterSourceId: e.target.value })}
                  >
                    <option value="">انتخاب منبع آب...</option>
                    {waterSources.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-black text-gray-700">رقم و پایه پسته *</label>
                    <span className="text-[10px] text-emerald-700 font-bold">از جدول پایه یا دستی</span>
                  </div>
                  {rootstockItems.length > 0 ? (
                    <div className="space-y-1.5">
                      <select
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        value={landForm.pistachioRootstock || ''}
                        onChange={e => setLandForm({ ...landForm, pistachioRootstock: e.target.value })}
                      >
                        <option value="">-- انتخاب رقم و پایه استاندارد پسته --</option>
                        {rootstockItems.map(item => (
                          <option key={item.id} value={item.title}>
                            {item.title} {item.tag ? `(${item.tag})` : ''}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="یا وارد کردن دستی رقم و پایه..."
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        value={landForm.pistachioRootstock || ''}
                        onChange={e => setLandForm({ ...landForm, pistachioRootstock: e.target.value })}
                      />
                    </div>
                  ) : (
                    <input
                      required
                      type="text"
                      placeholder="مثال: اکبری، کله‌قوچی، احمدآقایی، UCB1"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={landForm.pistachioRootstock || ''}
                      onChange={e => setLandForm({ ...landForm, pistachioRootstock: e.target.value })}
                    />
                  )}
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">سال احداث / پیوند</label>
                  <input
                    type="number"
                    placeholder="مثال: 1385"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={landForm.plantingYear || ''}
                    onChange={e => setLandForm({ ...landForm, plantingYear: parseInt(e.target.value) || undefined })}
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">سیستم آبیاری *</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={landForm.irrigationSystem || 'قطره‌ای تحت فشار (بابلر / قطره‌چکان)'}
                    onChange={e => setLandForm({ ...landForm, irrigationSystem: e.target.value })}
                  >
                    {irrigationItems.length > 0 ? (
                      irrigationItems.map(irr => (
                        <option key={irr.id} value={irr.title}>
                          {irr.title}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="قطره‌ای تحت فشار (بابلر / قطره‌چکان)">قطره‌ای تحت فشار (بابلر / قطره‌چکان)</option>
                        <option value="قطره‌ای نواری (تیپ سطحی)">قطره‌ای نواری (تیپ سطحی)</option>
                        <option value="آبیاری زیرسطحی متخلخل (Subsurface Drip)">آبیاری زیرسطحی متخلخل</option>
                        <option value="غرقابی سنتی جوی و پشته‌ای">غرقابی سنتی جوی و پشته‌ای</option>
                        <option value="غرقابی نواری و کرتی">غرقابی نواری و کرتی</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">مدار آبیاری *</label>
                  <input
                    required
                    type="text"
                    placeholder="مثال: ۲۴ روزه یا ۱۸ روزه"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={landForm.irrigationPeriod || ''}
                    onChange={e => setLandForm({ ...landForm, irrigationPeriod: e.target.value })}
                  />
                </div>
              </div>

              {/* Map Location Picker */}
              <div className="pt-2">
                <OSMMapPicker
                  inline={true}
                  title="انتخاب موقعیت قطعه باغ روی نقشه OpenStreetMap"
                  initialLat={Number(landForm.latitude) || 35.118}
                  initialLng={Number(landForm.longitude) || 57.184}
                  onLocationChange={(lat, lng, url) => setLandForm(prev => ({ ...prev, latitude: lat, longitude: lng, osmUrl: url }))}
                  onSelect={({ lat, lng, url }) => setLandForm(prev => ({ ...prev, latitude: lat, longitude: lng, osmUrl: url }))}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-2xl shadow-lg transition text-xs"
                >
                  {editingLand ? 'ذخیره تغییرات باغ' : 'ثبت قطعه باغ'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLandModal(false)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition text-xs"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Owner */}
      {showOwnerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-black text-gray-800">
                {editingOwner ? 'ویرایش مشخصات باغدار' : 'ثبت باغدار جدید'}
              </h3>
              <button onClick={() => setShowOwnerModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOwner} className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">نام و نام خانوادگی *</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: حاج علی رضایی"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={ownerForm.name || ''}
                  onChange={e => setOwnerForm({ ...ownerForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">کد ملی (۱۰ رقم) *</label>
                <input
                  required
                  type="text"
                  maxLength={10}
                  placeholder="0921234567"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={ownerForm.nationalId || ''}
                  onChange={e => setOwnerForm({ ...ownerForm, nationalId: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">شماره تلفن همراه (نام کاربری سامانه) *</label>
                <input
                  required
                  type="text"
                  maxLength={11}
                  placeholder="09131234567"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={ownerForm.mobile || ''}
                  onChange={e => setOwnerForm({ ...ownerForm, mobile: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">تلفن ثابت (اختیاری)</label>
                <input
                  type="text"
                  placeholder="03433221100"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={ownerForm.phone || ''}
                  onChange={e => setOwnerForm({ ...ownerForm, phone: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-2xl shadow-lg transition text-xs"
                >
                  ذخیره اطلاعات باغدار
                </button>
                <button
                  type="button"
                  onClick={() => setShowOwnerModal(false)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition text-xs"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Water Source */}
      {showWaterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-black text-gray-800">
                {editingWater ? 'ویرایش مشخصات منبع آب' : 'ثبت چاه موتور / منبع آب'}
              </h3>
              <button onClick={() => setShowWaterModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWater} className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">نام یا شماره چاه موتور *</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: چاه موتور شماره ۱ دشت سبز"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={waterForm.name || ''}
                  onChange={e => setWaterForm({ ...waterForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">عمق چاه (متر)</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={waterForm.wellDepth || ''}
                    onChange={e => setWaterForm({ ...waterForm, wellDepth: parseFloat(e.target.value) || undefined })}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-700 mb-1 block">دبی (لیتر/ثانیه)</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={waterForm.flowRate || ''}
                    onChange={e => setWaterForm({ ...waterForm, flowRate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-black text-gray-700 mb-1 block">شوری EC (dS/m)</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={waterForm.waterEc || ''}
                    onChange={e => setWaterForm({ ...waterForm, waterEc: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-700 mb-1 block">اسیدیته pH</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={waterForm.waterPh || ''}
                    onChange={e => setWaterForm({ ...waterForm, waterPh: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-700 mb-1 block">SAR</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    value={waterForm.waterSar || ''}
                    onChange={e => setWaterForm({ ...waterForm, waterSar: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-2xl shadow-lg transition text-xs"
                >
                  ذخیره منبع آب
                </button>
                <button
                  type="button"
                  onClick={() => setShowWaterModal(false)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition text-xs"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AraziTab;
