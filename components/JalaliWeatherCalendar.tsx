import React, { useState, useEffect } from 'react';
import { 
  getTodayJalali, 
  PERSIAN_MONTHS, 
  PERSIAN_WEEKDAYS_SHORT, 
  getJalaliMonthDays, 
  getFirstWeekdayOfJalaliMonth, 
  jalaliToISODate, 
  toPersianNumbers, 
  formatJalali 
} from '../jalaliDate';
import { 
  fetchAgriWeather, 
  WeatherData, 
  PRESET_PISTACHIO_REGIONS, 
  DailyWeatherForecast 
} from '../weatherService';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  Wind, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Droplets, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  RotateCw, 
  MapPin, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { Land, Visit, Task } from '../types';

interface JalaliWeatherCalendarProps {
  lands?: Land[];
  visits?: Visit[];
  tasks?: Task[];
  onSelectDate?: (jalaliStr: string) => void;
}

export const JalaliWeatherCalendar: React.FC<JalaliWeatherCalendarProps> = ({
  lands = [],
  visits = [],
  tasks = [],
  onSelectDate
}) => {
  const today = getTodayJalali();
  const [viewYear, setViewYear] = useState<number>(today.year);
  const [viewMonth, setViewMonth] = useState<number>(today.month);
  const [selectedDay, setSelectedDay] = useState<number>(today.day);
  const [selectedForecast, setSelectedForecast] = useState<DailyWeatherForecast | null>(null);

  // Active Station Location
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number }>({
    name: lands[0]?.name ? `باغ: ${lands[0].name}` : PRESET_PISTACHIO_REGIONS[0].name,
    lat: Number(lands[0]?.latitude) || PRESET_PISTACHIO_REGIONS[0].lat,
    lng: Number(lands[0]?.longitude) || PRESET_PISTACHIO_REGIONS[0].lng
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);

  // Load weather when coordinates change
  const loadWeather = async (lat: number, lng: number, name: string) => {
    setLoadingWeather(true);
    try {
      const data = await fetchAgriWeather(lat, lng, name);
      setWeatherData(data);
      if (data.daily && data.daily.length > 0) {
        setSelectedForecast(data.daily[0]);
      }
    } catch (e) {
      console.error('Weather load error:', e);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedLocation.lat, selectedLocation.lng, selectedLocation.name);
  }, [selectedLocation.lat, selectedLocation.lng]);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleGoToday = () => {
    setViewYear(today.year);
    setViewMonth(today.month);
    setSelectedDay(today.day);
  };

  // Weather icon renderer with subdued, harmonious tones
  const renderWeatherIcon = (iconType: string, className = "w-4 h-4") => {
    switch (iconType) {
      case 'sun':
        return <Sun className={`${className} text-amber-500`} />;
      case 'cloud-sun':
        return <CloudSun className={`${className} text-amber-500`} />;
      case 'cloud':
        return <Cloud className={`${className} text-gray-400`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-gray-500`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-gray-600`} />;
      case 'snowflake':
        return <Snowflake className={`${className} text-gray-400`} />;
      case 'wind':
        return <Wind className={`${className} text-emerald-600`} />;
      default:
        return <Sun className={`${className} text-amber-500`} />;
    }
  };

  // Build calendar matrix
  const daysInMonth = getJalaliMonthDays(viewYear, viewMonth);
  const startWeekday = getFirstWeekdayOfJalaliMonth(viewYear, viewMonth); // 0 = Sat ... 6 = Fri

  // Map forecast by ISO date string
  const forecastMap: Record<string, DailyWeatherForecast> = {};
  if (weatherData?.daily) {
    weatherData.daily.forEach(f => {
      forecastMap[f.date] = f;
    });
  }

  // Count visits and tasks on a given day
  const getActivitiesForJalaliDay = (day: number) => {
    const formatted = formatJalali({ year: viewYear, month: viewMonth, day }, true);
    const dayVisits = visits.filter(v => v.visitDate === formatted || v.visitDate?.includes(`${toPersianNumbers(day)}`));
    const dayTasks = tasks.filter(t => t.dueDate === formatted || t.createdAt?.includes(formatted));
    return { visits: dayVisits, tasks: dayTasks };
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Linear Streamlined Weather & Location Strip */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 md:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Right: Date and Station Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-black text-gray-800">
              <CalendarIcon className="w-4 h-4 text-emerald-700" />
              <span>{today.weekdayName}، {toPersianNumbers(today.day)} {today.monthName} {toPersianNumbers(today.year)}</span>
            </div>

            <div className="h-4 w-px bg-gray-200 hidden sm:block" />

            {/* Station Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500 font-medium">ایستگاه:</span>
              <select
                value={`${selectedLocation.lat},${selectedLocation.lng}`}
                onChange={(e) => {
                  const [lat, lng] = e.target.value.split(',').map(Number);
                  const foundPreset = PRESET_PISTACHIO_REGIONS.find(p => p.lat === lat && p.lng === lng);
                  const foundLand = lands.find(l => Number(l.latitude) === lat && Number(l.longitude) === lng);
                  const name = foundLand ? `باغ: ${foundLand.name || foundLand.title}` : (foundPreset?.name || 'موقعیت انتخابی');
                  setSelectedLocation({ lat, lng, name });
                }}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-lg px-2.5 py-1 font-bold outline-none text-xs focus:ring-1 focus:ring-emerald-700 cursor-pointer"
              >
                <optgroup label="باغات ثبت شده">
                  {lands.filter(l => l.latitude && l.longitude).map(l => (
                    <option key={l.id} value={`${l.latitude},${l.longitude}`}>
                      {l.name || l.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="ایستگاه‌های اصلی اقلیم پسته">
                  {PRESET_PISTACHIO_REGIONS.map((region, idx) => (
                    <option key={idx} value={`${region.lat},${region.lng}`}>
                      {region.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Left: Compact Weather Telemetry */}
          <div className="flex items-center gap-4 text-xs">
            {loadingWeather ? (
              <div className="flex items-center gap-2 text-gray-400 py-1">
                <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>در حال دریافت داده‌های اقلیمی...</span>
              </div>
            ) : weatherData?.current ? (
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                
                {/* Temp & Icon */}
                <div className="flex items-center gap-1.5">
                  {renderWeatherIcon(weatherData.current.weatherIconType, "w-5 h-5")}
                  <span className="text-base font-black text-gray-900 font-mono">
                    {toPersianNumbers(weatherData.current.temperature)}°
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">
                    {weatherData.current.weatherDescription}
                  </span>
                </div>

                {/* Wind */}
                <div className="flex items-center gap-1 text-gray-700 font-medium" title="سرعت باد لحظه‌ای">
                  <Wind className="w-3.5 h-3.5 text-gray-400" />
                  <span>باد:</span>
                  <strong className="font-mono text-gray-900">{toPersianNumbers(weatherData.current.windSpeed)}</strong>
                  <span className="text-[10px] text-gray-400">km/h</span>
                </div>

                {/* Humidity */}
                <div className="flex items-center gap-1 text-gray-700 font-medium hidden md:flex" title="رطوبت نسبی">
                  <Droplets className="w-3.5 h-3.5 text-gray-400" />
                  <span>رطوبت:</span>
                  <strong className="font-mono text-gray-900">{toPersianNumbers(weatherData.current.relativeHumidity)}%</strong>
                </div>

                {/* Apparent Temp */}
                <div className="flex items-center gap-1 text-gray-700 font-medium hidden lg:flex" title="دمای حسی">
                  <Thermometer className="w-3.5 h-3.5 text-gray-400" />
                  <span>حس:</span>
                  <strong className="font-mono text-gray-900">{toPersianNumbers(weatherData.current.apparentTemperature)}°</strong>
                </div>

                {/* Refresh button */}
                <button
                  onClick={() => loadWeather(selectedLocation.lat, selectedLocation.lng, selectedLocation.name)}
                  disabled={loadingWeather}
                  className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition"
                  title="بروزرسانی وضعیت هوا"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${loadingWeather ? 'animate-spin' : ''}`} />
                </button>
              </div>
            ) : (
              <span className="text-xs text-gray-400">اطلاعات هواشناسی در دسترس نیست</span>
            )}
          </div>

        </div>
      </div>

      {/* 2. Main Two-Column View: Minimalist Month Grid (Left) + Rich Details Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Simplified Calendar Grid */}
        <div className="lg:col-span-8 bg-white p-5 md:p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-gray-900 text-sm md:text-base">
                {PERSIAN_MONTHS[viewMonth - 1]} {toPersianNumbers(viewYear)}
              </h3>
              <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                تقویم زراعی و وضعیت سمپاشی
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGoToday}
                className="bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 font-bold px-2.5 py-1 rounded-lg text-xs transition"
              >
                امروز
              </button>

              <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50 p-0.5">
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-white rounded text-gray-600 hover:text-gray-900 transition"
                  title="ماه بعد"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-white rounded text-gray-600 hover:text-gray-900 transition"
                  title="ماه قبل"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekdays Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 py-1">
            {PERSIAN_WEEKDAYS_SHORT.map((wd, i) => (
              <div key={i} className={`py-1 ${i === 6 ? 'text-rose-600' : ''}`}>
                {wd}
              </div>
            ))}
          </div>

          {/* Calm & Clean Day Cells Matrix */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots before first day */}
            {Array.from({ length: startWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[58px] rounded-xl bg-gray-50/40" />
            ))}

            {/* Actual Days of the Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = viewYear === today.year && viewMonth === today.month && dayNum === today.day;
              const isSelected = dayNum === selectedDay;
              
              const isoDate = jalaliToISODate({ year: viewYear, month: viewMonth, day: dayNum });
              const dayForecast = forecastMap[isoDate];
              const { visits: dayVisits, tasks: dayTasks } = getActivitiesForJalaliDay(dayNum);
              const hasActivities = dayVisits.length > 0 || dayTasks.length > 0;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => {
                    setSelectedDay(dayNum);
                    if (dayForecast) setSelectedForecast(dayForecast);
                    const formatted = formatJalali({ year: viewYear, month: viewMonth, day: dayNum });
                    if (onSelectDate) onSelectDate(formatted);
                  }}
                  className={`min-h-[58px] p-2 rounded-xl border text-right transition flex flex-col justify-between relative group ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/70 ring-1 ring-emerald-700'
                      : isToday
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-gray-100 hover:border-gray-300 bg-white hover:bg-gray-50/80'
                  }`}
                >
                  {/* Row 1: Day Number + Mini Weather Icon */}
                  <div className="flex justify-between items-start w-full">
                    <span className={`text-xs font-bold leading-none ${
                      isToday
                        ? 'text-emerald-800 font-black'
                        : isSelected
                        ? 'text-emerald-950 font-black'
                        : 'text-gray-800'
                    }`}>
                      {toPersianNumbers(dayNum)}
                    </span>

                    {/* Subtle small weather icon */}
                    {dayForecast && (
                      <div className="opacity-80 group-hover:opacity-100 transition">
                        {renderWeatherIcon(dayForecast.weatherIconType, "w-3.5 h-3.5")}
                      </div>
                    )}
                  </div>

                  {/* Row 2: Status Indicator Dots Only (Zero Text Clutter) */}
                  <div className="flex items-center justify-between w-full mt-1">
                    {/* Spraying Indicator Dot */}
                    {dayForecast ? (
                      <span 
                        className={`w-2 h-2 rounded-full ${
                          dayForecast.sprayingCondition.status === 'optimal'
                            ? 'bg-emerald-600'
                            : dayForecast.sprayingCondition.status === 'moderate'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`} 
                        title={`وضعیت سمپاشی: ${dayForecast.sprayingCondition.label}`}
                      />
                    ) : (
                      <span className="w-2 h-2" />
                    )}

                    {/* Scheduled Activities Indicator Dot */}
                    {hasActivities && (
                      <span 
                        className="w-1.5 h-1.5 rounded-full bg-gray-500" 
                        title={`${dayVisits.length + dayTasks.length} برنامه باغبانی`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Minimalist Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>سمپاشی مساعد</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>احتیاط / باد</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>منع محلول‌پاشی</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                <span>وظایف / بازدید</span>
              </span>
            </div>
            <span className="text-gray-400 hidden md:inline">انتخاب روز برای مشاهده تحلیل کامل</span>
          </div>

        </div>

        {/* 3. Selected Day Comprehensive Details Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Day Detail Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            
            {/* Header: Selected Date & Tag */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h4 className="font-black text-gray-900 text-sm">
                  {toPersianNumbers(selectedDay)} {PERSIAN_MONTHS[viewMonth - 1]} {toPersianNumbers(viewYear)}
                </h4>
              </div>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                {viewYear === today.year && viewMonth === today.month && selectedDay === today.day ? 'امروز' : 'پیش‌بینی'}
              </span>
            </div>

            {selectedForecast ? (
              <div className="space-y-3.5">
                
                {/* Weather condition box */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    {renderWeatherIcon(selectedForecast.weatherIconType, "w-6 h-6")}
                    <div>
                      <div className="text-xs font-black text-gray-900">
                        {selectedForecast.weatherDescription}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                        حداکثر {toPersianNumbers(selectedForecast.tempMax)}° | حداقل {toPersianNumbers(selectedForecast.tempMin)}°
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spraying Suitability Decision Card */}
                <div className={`p-3.5 rounded-xl border ${
                  selectedForecast.sprayingCondition.status === 'optimal'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : selectedForecast.sprayingCondition.status === 'moderate'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-black mb-1">
                    {selectedForecast.sprayingCondition.status === 'optimal' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                    )}
                    <span>وضعیت محلول‌پاشی: {selectedForecast.sprayingCondition.label}</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed">
                    {selectedForecast.sprayingCondition.reason}
                  </p>
                </div>

                {/* Quantitative Key Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-500 block mb-0.5 text-[11px]">حداکثر سرعت باد:</span>
                    <strong className="text-gray-900 font-bold font-mono">
                      {toPersianNumbers(selectedForecast.windSpeedMax)} km/h
                    </strong>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-500 block mb-0.5 text-[11px]">احتمال بارش:</span>
                    <strong className="text-gray-900 font-bold font-mono">
                      {toPersianNumbers(selectedForecast.precipitationProbability)}% ({toPersianNumbers(selectedForecast.precipitationSum)} mm)
                    </strong>
                  </div>

                  {selectedForecast.evapotranspiration !== undefined && (
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 col-span-2 flex justify-between items-center">
                      <span className="text-gray-500 text-[11px]">تبخیر و تعرق مرجع (ET0):</span>
                      <strong className="text-gray-900 font-bold font-mono">
                        {toPersianNumbers(selectedForecast.evapotranspiration)} mm/day
                      </strong>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl">
                اطلاعات اقلیمی برای این روز در دسترس نیست.
              </div>
            )}

          </div>

          {/* Activities scheduled for this day */}
          {(() => {
            const { visits: dayVisits, tasks: dayTasks } = getActivitiesForJalaliDay(selectedDay);
            return (
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h4 className="font-black text-gray-800 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>برنامه‌های باغبانی این روز</span>
                  </h4>
                  <span className="text-[10px] font-bold text-gray-500 font-mono">
                    {toPersianNumbers(dayVisits.length + dayTasks.length)} مورد
                  </span>
                </div>

                {dayVisits.length === 0 && dayTasks.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-xl">
                    برنامه یا بازدیدی برای این تاریخ ثبت نشده است.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {dayVisits.map(v => (
                      <div key={v.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                        <div className="font-bold text-gray-800">بازدید گیاه‌پزشکی</div>
                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{v.expertRecommendation || 'بدون توضیحات'}</p>
                      </div>
                    ))}
                    {dayTasks.map(t => (
                      <div key={t.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                        <div className="font-bold text-gray-800">{t.title}</div>
                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{t.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

        </div>

      </div>

      {/* 4. 14-Day Horizontal Forecast Strip (Subdued & Clean) */}
      {weatherData?.daily && weatherData.daily.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-black text-gray-800 text-xs flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-emerald-700" />
              <span>پیش‌بینی ۱۴ روزه اقلیم باغات ({selectedLocation.name})</span>
            </h4>
            <span className="text-[11px] text-gray-400 font-medium">برای انتخاب کلیک کنید</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
            {weatherData.daily.map((item, idx) => {
              const isSelected = selectedForecast?.date === item.date;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedForecast(item)}
                  className={`min-w-[110px] p-3 rounded-xl border transition text-center flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/70 ring-1 ring-emerald-700'
                      : 'border-gray-100 hover:border-gray-300 bg-gray-50/50 hover:bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-gray-700">{item.jalaliDateStr}</span>
                  {renderWeatherIcon(item.weatherIconType, "w-5 h-5")}
                  
                  <div className="text-xs font-bold text-gray-900 font-mono">
                    {toPersianNumbers(item.tempMax)}° / {toPersianNumbers(item.tempMin)}°
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    item.sprayingCondition.status === 'optimal'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.sprayingCondition.status === 'moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.sprayingCondition.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default JalaliWeatherCalendar;
