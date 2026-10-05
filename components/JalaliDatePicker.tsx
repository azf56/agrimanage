import React, { useState, useRef, useEffect } from 'react';
import { 
  getTodayJalali, 
  PERSIAN_MONTHS, 
  PERSIAN_WEEKDAYS_SHORT, 
  getJalaliMonthDays, 
  getFirstWeekdayOfJalaliMonth, 
  formatJalali, 
  parseJalaliString, 
  toPersianNumbers,
  jalaliToISODate
} from '../jalaliDate';
import { 
  fetchAgriWeather, 
  WeatherData, 
  DailyWeatherForecast 
} from '../weatherService';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  Clock,
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  Wind, 
  Thermometer, 
  Droplets,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface JalaliDatePickerProps {
  value?: string;
  onChange: (jalaliStr: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  value = '',
  onChange,
  placeholder = '۱۴۰۴/۰۲/۱۵',
  label,
  required = false,
  className = '',
  disabled = false,
  latitude = 30.4067,
  longitude = 55.9939,
  locationName
}) => {
  const today = getTodayJalali();
  const parsed = parseJalaliString(value) || { year: today.year, month: today.month, day: today.day };

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(parsed.year);
  const [viewMonth, setViewMonth] = useState<number>(parsed.month);
  const [selectedDay, setSelectedDay] = useState<number>(parsed.day);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [hoveredForecast, setHoveredForecast] = useState<DailyWeatherForecast | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal view when value prop updates
  useEffect(() => {
    const p = parseJalaliString(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
      setSelectedDay(p.day);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch weather data when picker opens or coordinates change
  useEffect(() => {
    let isMounted = true;
    if (isOpen && !weatherData) {
      fetchAgriWeather(latitude, longitude, locationName || 'باغ انتخابی')
        .then(data => {
          if (isMounted) {
            setWeatherData(data);
          }
        })
        .catch(err => {
          console.error('DatePicker weather fetch error:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, latitude, longitude, locationName, weatherData]);

  const daysInMonth = getJalaliMonthDays(viewYear, viewMonth);
  const startWeekday = getFirstWeekdayOfJalaliMonth(viewYear, viewMonth);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const formatted = formatJalali({ year: viewYear, month: viewMonth, day }, true);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    setViewYear(today.year);
    setViewMonth(today.month);
    setSelectedDay(today.day);
    onChange(today.formatted);
    setIsOpen(false);
  };

  // Helper to find forecast for a specific Jalali day in the active view
  const getForecastForDay = (day: number): DailyWeatherForecast | undefined => {
    if (!weatherData || !weatherData.daily) return undefined;
    const iso = jalaliToISODate(viewYear, viewMonth, day);
    return weatherData.daily.find(f => f.date === iso);
  };

  // Helper to render weather icon by iconType
  const renderWeatherIcon = (iconType: string, className = 'w-3.5 h-3.5') => {
    switch (iconType) {
      case 'sun':
        return <Sun className={`${className} text-amber-500`} />;
      case 'cloud-sun':
        return <CloudSun className={`${className} text-amber-400`} />;
      case 'cloud':
        return <Cloud className={`${className} text-slate-400`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-blue-500`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-purple-500`} />;
      case 'snowflake':
        return <Snowflake className={`${className} text-sky-400`} />;
      case 'wind':
        return <Wind className={`${className} text-teal-500`} />;
      default:
        return <Sun className={`${className} text-amber-500`} />;
    }
  };

  // Find forecast for current selected value for input display
  const currentValueForecast = (() => {
    const p = parseJalaliString(value);
    if (!p || !weatherData?.daily) return undefined;
    const iso = jalaliToISODate(p.year, p.month, p.day);
    return weatherData.daily.find(f => f.date === iso);
  })();

  return (
    <div className={`relative ${className}`} id="jalali-datepicker-container" ref={containerRef}>
      {label && (
        <label className="text-xs font-black text-gray-700 mb-1 block flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-500" />
            تقویم و وضعیت هوا
          </span>
        </label>
      )}

      {/* Input Display Box */}
      <div
        id="jalali-datepicker-input-button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition hover:border-emerald-400 ${
          isOpen ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
      >
        <div className="flex items-center gap-2">
          <span className={value ? 'text-gray-800 font-mono' : 'text-gray-400'}>
            {value || placeholder}
          </span>
          {/* If there's forecast info for this date, show mini badge */}
          {currentValueForecast && (
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-black bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              {renderWeatherIcon(currentValueForecast.weatherIconType, 'w-3 h-3')}
              <span>{toPersianNumbers(currentValueForecast.tempMax)}°</span>
              <span className="text-gray-400">|</span>
              <span className="text-[9px]">{currentValueForecast.weatherDescription}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-emerald-700">
          {weatherData?.current && (
            <div className="flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
              {renderWeatherIcon(weatherData.current.weatherIconType, 'w-3 h-3')}
              <span className="font-mono">{toPersianNumbers(weatherData.current.temperature)}°C</span>
            </div>
          )}
          <CalendarIcon className="w-4 h-4" />
        </div>
      </div>

      {/* Popup Calendar */}
      {isOpen && (
        <div 
          id="jalali-datepicker-popup"
          className="absolute top-full mt-2 right-0 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-80 sm:w-88 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-xs font-black bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-gray-800 outline-none"
              >
                {PERSIAN_MONTHS.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-xs font-black bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-gray-800 outline-none font-mono"
              >
                {Array.from({ length: 30 }, (_, i) => today.year - 15 + i).map((y) => (
                  <option key={y} value={y}>
                    {toPersianNumbers(y)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-emerald-700"
                title="ماه بعد"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-emerald-700"
                title="ماه قبل"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Weather Bar Header in Calendar */}
          {weatherData?.current && (
            <div className="mb-3 p-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-100 rounded-xl flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                {renderWeatherIcon(weatherData.current.weatherIconType, 'w-4 h-4')}
                <span className="font-black text-gray-800">{weatherData.current.weatherDescription}</span>
              </div>
              <div className="flex items-center gap-2 font-mono font-bold text-gray-700">
                <span className="flex items-center gap-0.5 text-amber-700">
                  <Thermometer className="w-3 h-3" />
                  {toPersianNumbers(weatherData.current.temperature)}°C
                </span>
                <span className="flex items-center gap-0.5 text-blue-700">
                  <Droplets className="w-3 h-3" />
                  {toPersianNumbers(weatherData.current.relativeHumidity)}%
                </span>
                <span className="flex items-center gap-0.5 text-teal-700">
                  <Wind className="w-3 h-3" />
                  {toPersianNumbers(weatherData.current.windSpeed)}k
                </span>
              </div>
            </div>
          )}

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-1">
            {PERSIAN_WEEKDAYS_SHORT.map((wd, i) => (
              <div key={i} className={i === 6 ? 'text-red-400' : ''}>
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="w-9 h-11" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = parsed && parsed.year === viewYear && parsed.month === viewMonth && parsed.day === day;
              const isToday = today.year === viewYear && today.month === viewMonth && today.day === day;
              const forecast = getForecastForDay(day);

              return (
                <button
                  key={`d-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  onMouseEnter={() => forecast && setHoveredForecast(forecast)}
                  onMouseLeave={() => setHoveredForecast(null)}
                  className={`w-9 h-11 rounded-xl text-xs font-bold flex flex-col items-center justify-between p-1 transition relative group ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md'
                      : isToday
                      ? 'bg-emerald-100 text-emerald-900 font-black border border-emerald-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {/* Day Number */}
                  <span className="text-[11px] leading-none">
                    {toPersianNumbers(day)}
                  </span>

                  {/* Weather Icon & Indicator */}
                  {forecast ? (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {renderWeatherIcon(forecast.weatherIconType, 'w-3 h-3')}
                      <span className={`text-[8px] font-mono leading-none ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                        {toPersianNumbers(forecast.tempMax)}°
                      </span>
                    </div>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full opacity-0" />
                  )}

                  {/* Spraying Suitability Dot */}
                  {forecast && (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${
                        forecast.sprayingCondition.status === 'optimal'
                          ? 'bg-emerald-500 ring-1 ring-white'
                          : forecast.sprayingCondition.status === 'moderate'
                          ? 'bg-amber-400 ring-1 ring-white'
                          : 'bg-red-400 ring-1 ring-white'
                      }`}
                      title={forecast.sprayingCondition.label}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Forecast Detail / Hover Inspector */}
          {hoveredForecast && (
            <div className="mt-2.5 p-2 bg-gray-900 text-white rounded-xl text-[10px] space-y-1 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 font-bold text-emerald-300">
                  {renderWeatherIcon(hoveredForecast.weatherIconType, 'w-3.5 h-3.5')}
                  <span>{hoveredForecast.jalaliDateStr}: {hoveredForecast.weatherDescription}</span>
                </div>
                <div className="font-mono text-amber-300">
                  {toPersianNumbers(hoveredForecast.tempMin)}° تا {toPersianNumbers(hoveredForecast.tempMax)}°C
                </div>
              </div>
              <div className="flex items-center justify-between text-gray-300 border-t border-gray-800 pt-1">
                <span>باد: {toPersianNumbers(hoveredForecast.windSpeedMax)} km/h | بارندگی: {toPersianNumbers(hoveredForecast.precipitationProbability)}%</span>
                <span className={`font-bold ${
                  hoveredForecast.sprayingCondition.status === 'optimal' ? 'text-emerald-400' :
                  hoveredForecast.sprayingCondition.status === 'moderate' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {hoveredForecast.sprayingCondition.label}
                </span>
              </div>
            </div>
          )}

          {/* Footer Quick Actions & Legend */}
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-100 text-xs">
            <button
              type="button"
              onClick={handleSetToday}
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline text-[11px]"
            >
              <Clock className="w-3 h-3" />
              امروز ({toPersianNumbers(today.day)} {today.monthName})
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-bold text-[11px]"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JalaliDatePicker;

