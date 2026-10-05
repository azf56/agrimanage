// Comprehensive Solar Hijri (Shamsi / Jalali) Algorithms & Utilities

export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
];

export const PERSIAN_WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه'
];

export const PERSIAN_WEEKDAYS_SHORT = [
  'ش',
  'ی',
  'د',
  'س',
  'چ',
  'پ',
  'ج'
];

export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Checks if a Jalali year is a leap year (کبیسه)
 */
export function isJalaliLeapYear(year: number): boolean {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178
  ];
  const bl = breaks.length;
  let jp = breaks[0];
  let jm: number;
  let jump: number;
  let leap: number;
  let n: number;
  let i: number;

  if (year < jp || year >= breaks[bl - 1]) {
    throw new Error('Invalid Jalali year: ' + year);
  }

  for (i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (year < jm) {
      break;
    }
    jp = jm;
  }
  n = year - jp;

  if (jump! - n < 6) {
    n = n - jump! + (Math.floor((jump! + 4) / 33) * 33);
  }
  leap = (((((n + 1) % 33) - 1) % 4));
  if (leap === -1) {
    leap = 4;
  }
  return leap === 0;
}

/**
 * Returns the number of days in a given Jalali month
 */
export function getJalaliMonthDays(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

/**
 * Convert Gregorian date to Jalali (Solar Hijri)
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return { year: jy, month: jm, day: jd };
}

/**
 * Convert Jalali (Solar Hijri) date to Gregorian
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { year: number; month: number; day: number } {
  let gy: number;
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }

  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

  gy += 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let gd = days + 1;
  const sal_a = [
    0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31
  ];
  let gm: number;
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm];
    if (gd <= v) break;
    gd -= v;
  }

  return { year: gy, month: gm, day: gd };
}

/**
 * Format a JalaliDate to standard YYYY/MM/DD string (e.g. "۱۴۰۴/۰۲/۱۵" or "1404/02/15")
 */
export function formatJalali(date: JalaliDate, toPersianDigits = true): string {
  const y = String(date.year);
  const m = String(date.month).padStart(2, '0');
  const d = String(date.day).padStart(2, '0');
  const res = `${y}/${m}/${d}`;
  return toPersianDigits ? toPersianNumbers(res) : res;
}

/**
 * Get current Jalali date object with rich metadata
 */
export function getTodayJalali(): {
  year: number;
  month: number;
  day: number;
  formatted: string;
  formattedEnglish: string;
  monthName: string;
  weekdayName: string;
  gregorianDateStr: string;
  fullDateDescription: string;
} {
  const now = new Date();
  const j = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  // Saturday is index 0 in Persian week (Sunday in JS is 0, Saturday is 6)
  const jsDay = now.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  const persianDayIndex = (jsDay + 1) % 7;
  const weekdayName = PERSIAN_WEEKDAYS[persianDayIndex];
  const monthName = PERSIAN_MONTHS[j.month - 1];

  const formattedEnglish = `${j.year}/${String(j.month).padStart(2, '0')}/${String(j.day).padStart(2, '0')}`;
  const formatted = toPersianNumbers(formattedEnglish);
  const fullDateDescription = `${weekdayName}، ${toPersianNumbers(j.day)} ${monthName} ${toPersianNumbers(j.year)}`;

  const gy = now.getFullYear();
  const gm = String(now.getMonth() + 1).padStart(2, '0');
  const gd = String(now.getDate()).padStart(2, '0');
  const gregorianDateStr = `${gy}-${gm}-${gd}`;

  return {
    ...j,
    formatted,
    formattedEnglish,
    monthName,
    weekdayName,
    gregorianDateStr,
    fullDateDescription
  };
}

/**
 * Parse string like "1404/02/15" or "۱۴۰۴/۰۲/۱۵" to JalaliDate
 */
export function parseJalaliString(str?: string): JalaliDate | null {
  if (!str) return null;
  const latin = toEnglishNumbers(str).replace(/[^\d/]/g, '');
  const parts = latin.split('/');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return { year: y, month: m, day: d };
    }
  }
  return null;
}

/**
 * Convert numbers to Persian digits
 */
export function toPersianNumbers(str: string | number): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/\d/g, x => farsiDigits[parseInt(x, 10)]);
}

/**
 * Convert Persian/Arabic digits to standard English digits
 */
export function toEnglishNumbers(str: string): string {
  return str
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632));
}

/**
 * Get weekday index for 1st day of a Jalali month (0 = Saturday, 6 = Friday)
 */
export function getFirstWeekdayOfJalaliMonth(year: number, month: number): number {
  const g = jalaliToGregorian(year, month, 1);
  const gDate = new Date(g.year, g.month - 1, g.day);
  const jsDay = gDate.getDay(); // 0 is Sun, 6 is Sat
  return (jsDay + 1) % 7; // 0 is Sat, 6 is Fri
}

/**
 * Convert a Jalali date to ISO Gregorian string YYYY-MM-DD
 */
export function jalaliToISODate(paramOrYear: JalaliDate | number, month?: number, day?: number): string {
  let jy: number, jm: number, jd: number;
  if (typeof paramOrYear === 'object') {
    jy = paramOrYear.year;
    jm = paramOrYear.month;
    jd = paramOrYear.day;
  } else {
    jy = paramOrYear;
    jm = month || 1;
    jd = day || 1;
  }
  const g = jalaliToGregorian(jy, jm, jd);
  const m = String(g.month).padStart(2, '0');
  const d = String(g.day).padStart(2, '0');
  return `${g.year}-${m}-${d}`;
}
