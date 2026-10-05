// Open-Meteo Weather API Integration for Iranian Pistachio Agro-Climatic Zones

export interface DailyWeatherForecast {
  date: string; // YYYY-MM-DD
  jalaliDateStr: string; // ۱۴۰۴/۰۵/۲۵
  weatherCode: number;
  weatherDescription: string;
  weatherIconType: 'sun' | 'cloud-sun' | 'cloud' | 'cloud-rain' | 'cloud-lightning' | 'snowflake' | 'wind' | 'fog';
  tempMax: number;
  tempMin: number;
  precipitationSum: number; // mm
  precipitationProbability: number; // %
  windSpeedMax: number; // km/h
  uvIndexMax?: number;
  evapotranspiration?: number; // mm (ET0 FAO)
  sprayingCondition: {
    status: 'optimal' | 'moderate' | 'unfavorable' | 'prohibited';
    label: string;
    reason: string;
  };
  frostRisk: boolean;
  heatStressRisk: boolean;
}

export interface CurrentWeatherInfo {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  windSpeed: number; // km/h
  windDirection: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIconType: 'sun' | 'cloud-sun' | 'cloud' | 'cloud-rain' | 'cloud-lightning' | 'snowflake' | 'wind' | 'fog';
  isDay: boolean;
  elevation?: number;
  locationName: string;
  latitude: number;
  longitude: number;
  lastUpdated: string;
}

export interface WeatherData {
  current: CurrentWeatherInfo;
  daily: DailyWeatherForecast[];
  locationName: string;
  latitude: number;
  longitude: number;
  loading: boolean;
  error?: string;
}

export const PRESET_PISTACHIO_REGIONS = [
  { name: 'رفسنجان (پایتخت پسته ایران)', lat: 30.4067, lng: 55.9939, province: 'کرمان' },
  { name: 'کاشمر و بردسکن (خراسان رضوی)', lat: 35.2138, lng: 58.4656, province: 'خراسان رضوی' },
  { name: 'سیرجان (کرمان)', lat: 29.4520, lng: 55.6812, province: 'کرمان' },
  { name: 'زرند (کرمان)', lat: 30.8127, lng: 56.5639, province: 'کرمان' },
  { name: 'شهربابک و انار (کرمان)', lat: 30.8931, lng: 55.2711, province: 'کرمان' },
  { name: 'دامغان (سمنان)', lat: 36.1683, lng: 54.3486, province: 'سمنان' },
  { name: 'مهریز و خاتم (یزد)', lat: 31.5833, lng: 54.4333, province: 'یزد' },
  { name: 'بوئین‌زهرا (قزوین)', lat: 35.7672, lng: 50.0577, province: 'قزوین' },
  { name: 'فیض‌آباد مه ولات (خراسان رضوی)', lat: 35.0150, lng: 58.7800, province: 'خراسان رضوی' },
  { name: 'سبزوار و جوین', lat: 36.2126, lng: 57.6819, province: 'خراسان رضوی' },
];

/**
 * Maps WMO weather code to Persian label and icon
 */
export function interpretWeatherCode(code: number): {
  description: string;
  iconType: 'sun' | 'cloud-sun' | 'cloud' | 'cloud-rain' | 'cloud-lightning' | 'snowflake' | 'wind' | 'fog';
} {
  switch (code) {
    case 0:
      return { description: 'آسمان صاف و آفتابی', iconType: 'sun' };
    case 1:
      return { description: 'غالباً صاف', iconType: 'sun' };
    case 2:
      return { description: 'کمی تا قسمتی ابری', iconType: 'cloud-sun' };
    case 3:
      return { description: 'نیمه‌ابری تا تمام‌ابری', iconType: 'cloud' };
    case 45:
    case 48:
      return { description: 'مه‌آلود و کاهش دید', iconType: 'fog' };
    case 51:
    case 53:
    case 55:
      return { description: 'نم‌نم باران پراکنده', iconType: 'cloud-rain' };
    case 61:
    case 63:
      return { description: 'بارش باران ملایم تا متوسط', iconType: 'cloud-rain' };
    case 65:
      return { description: 'بارش شدید باران', iconType: 'cloud-rain' };
    case 71:
    case 73:
    case 75:
      return { description: 'بارش برف', iconType: 'snowflake' };
    case 77:
      return { description: 'دانه‌های برف ریز', iconType: 'snowflake' };
    case 80:
    case 81:
    case 82:
      return { description: 'رگبار باران', iconType: 'cloud-rain' };
    case 85:
    case 86:
      return { description: 'رگبار برف', iconType: 'snowflake' };
    case 95:
      return { description: 'رعد و برق و تندر', iconType: 'cloud-lightning' };
    case 96:
    case 99:
      return { description: 'رعد و برق همراه با تگرگ', iconType: 'cloud-lightning' };
    default:
      return { description: 'آب و هوای فصلی', iconType: 'cloud-sun' };
  }
}

/**
 * Calculates spraying safety condition based on wind, rain probability and temperature
 */
export function calculateSprayingCondition(
  windSpeedMax: number,
  precipSum: number,
  precipProb: number,
  tempMax: number,
  tempMin: number
): { status: 'optimal' | 'moderate' | 'unfavorable' | 'prohibited'; label: string; reason: string } {
  if (precipSum > 1 || precipProb > 50) {
    return {
      status: 'prohibited',
      label: 'ممنوع (احتمال بارش)',
      reason: 'شسته‌شدن سموم و هدررفت محلول‌پاشی'
    };
  }

  if (windSpeedMax > 22) {
    return {
      status: 'prohibited',
      label: 'نامناسب (باد شدید)',
      reason: `سرعت باد ${Math.round(windSpeedMax)} km/h (بادبردگی و خطر برای کاربر)`
    };
  }

  if (tempMax > 38) {
    return {
      status: 'unfavorable',
      label: 'هشدار گرمازدگی و گیاه‌سوزی',
      reason: `دمای بالای ${Math.round(tempMax)}°C (فقط اوایل صبح یا خنکی عصر سمپاشی شود)`
    };
  }

  if (windSpeedMax > 14) {
    return {
      status: 'moderate',
      label: 'مشروط با احتیاط',
      reason: `باد ملایم تا متوسط (${Math.round(windSpeedMax)} km/h)`
    };
  }

  return {
    status: 'optimal',
    label: 'بسیار مساعد برای سمپاشی',
    reason: 'سرعت باد مناسب و عدم احتمال بارش'
  };
}

/**
 * Fetches real weather data from free Open-Meteo API
 */
export async function fetchAgriWeather(
  latitude = 35.118,
  longitude = 57.184,
  locationName = 'باغات پسته منطقه'
): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,et0_fao_evapotranspiration&timezone=auto&forecast_days=14`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`خطا در ارتباط با وب‌سرویس هواشناسی: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const daily = data.daily || {};

    const { description: currDesc, iconType: currIcon } = interpretWeatherCode(current.weather_code || 0);

    const currentInfo: CurrentWeatherInfo = {
      temperature: Math.round(current.temperature_2m ?? 24),
      apparentTemperature: Math.round(current.apparent_temperature ?? 23),
      relativeHumidity: Math.round(current.relative_humidity_2m ?? 35),
      windSpeed: Math.round(current.wind_speed_10m ?? 8),
      windDirection: current.wind_direction_10m ?? 0,
      weatherCode: current.weather_code ?? 0,
      weatherDescription: currDesc,
      weatherIconType: currIcon,
      isDay: current.is_day === 1,
      elevation: data.elevation,
      locationName,
      latitude,
      longitude,
      lastUpdated: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    const dailyForecasts: DailyWeatherForecast[] = [];
    const timeArray: string[] = daily.time || [];

    for (let i = 0; i < timeArray.length; i++) {
      const dateStr = timeArray[i]; // e.g. "2026-08-16"
      const [gy, gm, gd] = dateStr.split('-').map(Number);
      
      // Dynamic import or reference of Jalali converter
      let jalaliStr = '';
      try {
        const { gregorianToJalali, formatJalali } = await import('./jalaliDate');
        const j = gregorianToJalali(gy, gm, gd);
        jalaliStr = formatJalali(j);
      } catch {
        jalaliStr = dateStr;
      }

      const wCode = daily.weather_code?.[i] ?? 0;
      const { description, iconType } = interpretWeatherCode(wCode);
      const tMax = Math.round(daily.temperature_2m_max?.[i] ?? 30);
      const tMin = Math.round(daily.temperature_2m_min?.[i] ?? 18);
      const pSum = Number(daily.precipitation_sum?.[i] ?? 0);
      const pProb = Math.round(daily.precipitation_probability_max?.[i] ?? 0);
      const wSpeed = Math.round(daily.wind_speed_10m_max?.[i] ?? 10);
      const uv = daily.uv_index_max?.[i];
      const et0 = daily.et0_fao_evapotranspiration?.[i];

      const sprayCondition = calculateSprayingCondition(wSpeed, pSum, pProb, tMax, tMin);

      dailyForecasts.push({
        date: dateStr,
        jalaliDateStr: jalaliStr,
        weatherCode: wCode,
        weatherDescription: description,
        weatherIconType: iconType,
        tempMax: tMax,
        tempMin: tMin,
        precipitationSum: pSum,
        precipitationProbability: pProb,
        windSpeedMax: wSpeed,
        uvIndexMax: uv,
        evapotranspiration: et0 ? Number(et0.toFixed(1)) : undefined,
        sprayingCondition: sprayCondition,
        frostRisk: tMin <= 2,
        heatStressRisk: tMax >= 40
      });
    }

    return {
      current: currentInfo,
      daily: dailyForecasts,
      locationName,
      latitude,
      longitude,
      loading: false
    };
  } catch (error: any) {
    console.error('Weather fetch error:', error);
    return {
      current: {
        temperature: 28,
        apparentTemperature: 27,
        relativeHumidity: 30,
        windSpeed: 10,
        windDirection: 180,
        weatherCode: 0,
        weatherDescription: 'صاف و آفتابی (آفلاین)',
        weatherIconType: 'sun',
        isDay: true,
        locationName,
        latitude,
        longitude,
        lastUpdated: 'هم‌اکنون'
      },
      daily: [],
      locationName,
      latitude,
      longitude,
      loading: false,
      error: error.message || 'عدم دسترسی به داده‌های زنده هواشناسی'
    };
  }
}
