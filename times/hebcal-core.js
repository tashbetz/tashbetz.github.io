/*! @hebcal/core v6.9.2, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
var hebcal = (function (exports) {
'use strict';

/** DO NOT EDIT THIS AUTO-GENERATED FILE! */
const version = '6.9.2';

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
/** @private */
const lengths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** @private */
const monthLengths = [lengths, lengths.slice()];
monthLengths[1][2] = 29;
/**
 * @private
 */
function mod$1(x, y) {
    return x - y * Math.floor(x / y);
}
/**
 * @private
 */
function quotient(x, y) {
    return Math.floor(x / y);
}
/**
 * @private
 * @param abs - R.D. number of days
 */
function yearFromFixed(abs) {
    const l0 = abs - 1;
    const n400 = quotient(l0, 146097);
    const d1 = mod$1(l0, 146097);
    const n100 = quotient(d1, 36524);
    const d2 = mod$1(d1, 36524);
    const n4 = quotient(d2, 1461);
    const d3 = mod$1(d2, 1461);
    const n1 = quotient(d3, 365);
    const year = 400 * n400 + 100 * n100 + 4 * n4 + n1;
    return n100 !== 4 && n1 !== 4 ? year + 1 : year;
}
/*
const ABS_14SEP1752 = 639797;
const ABS_2SEP1752 = 639785;
*/
/*
 * Formerly in namespace, now top-level
 */
/**
 * Returns true if the Gregorian year is a leap year.
 *
 * Uses the proleptic Gregorian rule (divisible by 4, except centuries
 * that are not divisible by 400) for **all** years, including those
 * before the Gregorian calendar was adopted in 1582.
 * @param year Gregorian year
 * @returns `true` if February has 29 days in `year`
 * @example
 * isGregLeapYear(2000); // true
 * isGregLeapYear(2020); // true
 * isGregLeapYear(2023); // false
 * isGregLeapYear(2100); // false (divisible by 100 but not 400)
 */
function isGregLeapYear(year) {
    return !(year % 4) && (!!(year % 100) || !(year % 400));
}
/**
 * Number of days in the Gregorian month for given year
 * @param month Gregorian month (1=January, 12=December)
 * @param year Gregorian year
 * @returns an integer 28-31
 * @example
 * daysInGregMonth(2, 2024); // 29 (February in a leap year)
 * daysInGregMonth(2, 2023); // 28
 * daysInGregMonth(7, 2024); // 31 (July)
 */
function daysInGregMonth(month, year) {
    // 1 based months
    return monthLengths[+isGregLeapYear(year)][month];
}
/**
 * Returns true if the object is a Javascript `Date`.
 *
 * Note that this only tests the type: an invalid date such as
 * `new Date('foo')` is still a `Date` and returns `true`.
 * @example
 * isDate(new Date()); // true
 * isDate('2024-01-01'); // false
 * isDate(1700000000000); // false
 */
function isDate(obj) {
    // eslint-disable-next-line no-prototype-builtins
    return typeof obj === 'object' && Date.prototype.isPrototypeOf(obj);
}
/**
 * @private
 * @param year
 * @param month (1-12)
 * @param day (1-31)
 */
function toFixed(year, month, day) {
    const py = year - 1;
    return (365 * py +
        quotient(py, 4) -
        quotient(py, 100) +
        quotient(py, 400) +
        quotient(367 * month - 362, 12) +
        (month <= 2 ? 0 : isGregLeapYear(year) ? -1 : -2) +
        day);
}
/**
 * Converts Gregorian date to absolute R.D. (Rata Die) days.
 * R.D. 1 is the imaginary date Monday, January 1, 1 (Gregorian).
 *
 * Only the local-time year, month and day of `date` are used; hours,
 * minutes, seconds and milliseconds are ignored.
 *
 * Dates are interpreted on the **proleptic** Gregorian calendar, which
 * applies the Gregorian rules uniformly to every year without the
 * ten-day discontinuity of the Gregorian Reformation of 1582.
 * @param date Gregorian date
 * @returns R.D. number of days
 * @throws {TypeError} if `date` is not a `Date`
 * @throws {RangeError} if `date` is an Invalid Date
 * @see {@link abs2greg}
 * @example
 * greg2abs(new Date(2008, 10, 13)); // 733359 (13 November 2008)
 * greg2abs(new Date(2005, 3, 2)); // 732038 (2 April 2005)
 */
function greg2abs(date) {
    if (!isDate(date)) {
        throw new TypeError(`not a Date: ${date}`);
    }
    else if (isNaN(date.getTime())) {
        throw new RangeError('Invalid Date');
    }
    const abs = toFixed(date.getFullYear(), date.getMonth() + 1, date.getDate());
    /*
      if (abs < ABS_14SEP1752 && abs > ABS_2SEP1752) {
        throw new RangeError(`Invalid Date: ${date}`);
      }
      */
    return abs;
}
/**
 * Converts from Rata Die (R.D. number) to Gregorian date.
 * See the footnote on page 384 of ``Calendrical Calculations, Part II:
 * Three Historical Calendars'' by E. M. Reingold,  N. Dershowitz, and S. M.
 * Clamen, Software--Practice and Experience, Volume 23, Number 4
 * (April, 1993), pages 383-404 for an explanation.
 *
 * Note that this function returns the daytime portion of the date.
 * For example, the 15th of Cheshvan 5769 began at sundown on
 * 12 November 2008 and continues through 13 November 2008. This
 * function would return only the date 13 November 2008.
 *
 * The returned `Date` is in the local (i.e. host system) time zone with
 * hours, minutes, seconds and milliseconds all set to zero, and is on the
 * **proleptic** Gregorian calendar (see {@link greg2abs}).
 * @param abs - R.D. number of days
 * @returns Gregorian date at local midnight
 * @throws {TypeError} if `abs` is not a number
 * @see {@link greg2abs}
 * @example
 * const abs = hebrew2abs(5769, months.CHESHVAN, 15);
 * const date = abs2greg(abs); // 13 November 2008
 * const year = date.getFullYear(); // 2008
 * const monthNum = date.getMonth() + 1; // 11
 * const day = date.getDate(); // 13
 */
function abs2greg(abs) {
    if (typeof abs !== 'number' || isNaN(abs)) {
        throw new TypeError(`not a Number: ${abs}`);
    }
    abs = Math.trunc(abs);
    /*
      if (abs < ABS_14SEP1752 && abs > ABS_2SEP1752) {
        throw new RangeError(`Invalid Date: ${abs}`);
      }
      */
    const year = yearFromFixed(abs);
    const priorDays = abs - toFixed(year, 1, 1);
    const correction = abs < toFixed(year, 3, 1) ? 0 : isGregLeapYear(year) ? 1 : 2;
    const month = quotient(12 * (priorDays + correction) + 373, 367);
    const day = abs - toFixed(year, month, 1) + 1;
    const dt = new Date(year, month - 1, day);
    if (year < 100 && year >= 0) {
        dt.setFullYear(year);
    }
    return dt;
}

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Gregorian date helper functions.
 *
 * These are aliases retained for backwards compatibility. Each member
 * simply forwards to the identically-behaving top-level function, which
 * is the preferred form in new code because it tree-shakes cleanly:
 *
 * | Namespace | Top-level equivalent |
 * | --- | --- |
 * | `greg.abs2greg` | {@link abs2greg} |
 * | `greg.daysInMonth` | {@link daysInGregMonth} |
 * | `greg.greg2abs` | {@link greg2abs} |
 * | `greg.isDate` | {@link isDate} |
 * | `greg.isLeapYear` | {@link isGregLeapYear} |
 * @example
 * import {greg} from '@hebcal/hdate';
 * greg.greg2abs(new Date(2008, 10, 13)); // 733359
 * greg.isLeapYear(2024);                 // true
 */
exports.greg = void 0;
(function (greg) {
})(exports.greg || (exports.greg = {}));
exports.greg.abs2greg = abs2greg;
exports.greg.daysInMonth = daysInGregMonth;
exports.greg.greg2abs = greg2abs;
exports.greg.isDate = isDate;
exports.greg.isLeapYear = isGregLeapYear;

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
/**
 * Removes niqqud from Hebrew string
 * @example
 * hebrewStripNikkud('אֱלוּל');     // 'אלול'
 * hebrewStripNikkud('חֶשְׁוָן');   // 'חשון'
 */
function hebrewStripNikkud(str) {
    if (typeof str !== 'string') {
        throw new TypeError(`bad nikkud str: ${str}`);
    }
    const a = str.normalize();
    // now strip out niqqud and trope
    return a.replace(/[\u0590-\u05bd]/g, '').replace(/[\u05bf-\u05c7]/g, '');
}

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
/*
 * More minimal HDate
 */
const NISAN$5 = 1;
const IYYAR$2 = 2;
const SIVAN$2 = 3;
const TAMUZ$2 = 4;
const AV$2 = 5;
const ELUL$1 = 6;
const TISHREI$2 = 7;
const CHESHVAN$2 = 8;
const KISLEV$2 = 9;
const TEVET$2 = 10;
const SHVAT$1 = 11;
const ADAR_I$2 = 12;
const ADAR_II$2 = 13;
/**
 * Hebrew months of the year (NISAN=1, TISHREI=7).
 *
 * Months are numbered from Nisan, the first month of the ecclesiastical
 * year, even though the civil year begins with Tishrei on Rosh Hashanah
 * (see {@link HDate.getTishreiMonth} for Tishrei-based numbering).
 *
 * In a common year month 12 is Adar; in a leap year month 12 is Adar I
 * and month 13 is Adar II.
 * @readonly
 * @enum {number}
 * @example
 * import {months, getMonthName} from '@hebcal/hdate';
 * months.TISHREI;                     // 7
 * getMonthName(months.ADAR_I, 5784);  // 'Adar I' (5784 is a leap year)
 * getMonthName(months.ADAR_I, 5783);  // 'Adar'
 */
const months = {
    /** Nissan / ניסן */
    NISAN: NISAN$5,
    /** Iyyar / אייר */
    IYYAR: IYYAR$2,
    /** Sivan / סיון */
    SIVAN: SIVAN$2,
    /** Tamuz (sometimes Tammuz) / תמוז */
    TAMUZ: TAMUZ$2,
    /** Av / אב */
    AV: AV$2,
    /** Elul / אלול */
    ELUL: ELUL$1,
    /** Tishrei / תִּשְׁרֵי */
    TISHREI: TISHREI$2,
    /** Cheshvan / חשון */
    CHESHVAN: CHESHVAN$2,
    /** Kislev / כסלו */
    KISLEV: KISLEV$2,
    /** Tevet / טבת */
    TEVET: TEVET$2,
    /** Sh'vat / שבט */
    SHVAT: SHVAT$1,
    /** Adar or Adar Rishon / אדר */
    ADAR_I: ADAR_I$2,
    /** Adar Sheini (only on leap years) / אדר ב׳ */
    ADAR_II: ADAR_II$2,
};
const NISAN_STR = 'Nisan';
const monthNames0 = [
    '',
    NISAN_STR,
    'Iyyar',
    'Sivan',
    'Tamuz',
    'Av',
    'Elul',
    'Tishrei',
    'Cheshvan',
    'Kislev',
    'Tevet',
    "Sh'vat",
];
/*
 * Transliterations of Hebrew month names.
 * Regular years are index 0 and leap years are index 1.
 * @private
 */
const monthNames = [
    [...monthNames0, 'Adar', NISAN_STR],
    [...monthNames0, 'Adar I', 'Adar II', NISAN_STR],
];
// Typed-array cache for elapsedDays, indexed by `year - ED_CACHE_MIN`.
// The range covers Hebrew years ~AD 1240 through ~AD 3240, which spans
// every realistic modern use. Years outside the range fall through
// uncached. 0 is the "not computed" sentinel; every valid input
// (year >= 1) produces a result >= 1, so it can't collide.
// elapsedDays(6999) is ~2.56M, well within Int32 range.
const ED_CACHE_MIN = 5000;
const ED_CACHE_MAX = 6999;
const edCache = new Int32Array(ED_CACHE_MAX - ED_CACHE_MIN + 1);
const EPOCH = -1373428;
// Avg year length in the cycle (19 solar years with 235 lunar months)
const AVG_HEBYEAR_DAYS = 365.24682220597794;
/**
 * @private
 */
function assertNumber(n, name) {
    if (typeof n !== 'number' || isNaN(n)) {
        throw new TypeError(`param '${name}' not a number: ${n}`);
    }
}
/**
 * Converts Hebrew date to R.D. (Rata Die) fixed days.
 * R.D. 1 is the imaginary date Monday, January 1, 1 on the (proleptic)
 * Gregorian Calendar.
 *
 * R.D. is the common currency between the two calendars: convert a
 * Hebrew date to R.D. with this function, then to a Gregorian `Date`
 * with {@link abs2greg}.
 * @param year Hebrew year
 * @param month Hebrew month (1=NISAN, 7=TISHREI)
 * @param day Hebrew date (1-30)
 * @returns R.D. number of days
 * @throws {TypeError} if any argument is not a number
 * @throws {RangeError} if `year` is less than 1
 * @see {@link abs2hebrew}
 * @example
 * import {hebrew2abs, months} from '@hebcal/hdate';
 * hebrew2abs(5769, months.CHESHVAN, 15); // 733359
 */
function hebrew2abs(year, month, day) {
    assertNumber(year, 'year');
    assertNumber(month, 'month');
    assertNumber(day, 'day');
    if (year < 1) {
        throw new RangeError(`hebrew2abs: invalid year ${year}`);
    }
    let tempabs = day;
    if (month < TISHREI$2) {
        const endMonth = monthsInYear(year);
        for (let m = TISHREI$2; m <= endMonth; m++) {
            tempabs += daysInMonth(m, year);
        }
        for (let m = NISAN$5; m < month; m++) {
            tempabs += daysInMonth(m, year);
        }
    }
    else {
        for (let m = TISHREI$2; m < month; m++) {
            tempabs += daysInMonth(m, year);
        }
    }
    return EPOCH + elapsedDays(year) + tempabs - 1;
}
/**
 * @private
 */
function newYear(year) {
    return EPOCH + elapsedDays(year);
}
/**
 * Converts absolute R.D. days to Hebrew date
 * @param abs absolute R.D. days
 * @returns the Hebrew date as a plain `{yy, mm, dd}` object
 * @throws {TypeError} if `abs` is not a number
 * @throws {RangeError} if `abs` precedes the Hebrew epoch
 * @see {@link hebrew2abs}
 * @example
 * abs2hebrew(733359); // {yy: 5769, mm: 8, dd: 15} (15 Cheshvan 5769)
 */
function abs2hebrew(abs) {
    assertNumber(abs, 'abs');
    abs = Math.trunc(abs);
    if (abs <= EPOCH) {
        throw new RangeError(`abs2hebrew: ${abs} is before epoch`);
    }
    // first, quickly approximate year
    let year = Math.floor((abs - EPOCH) / AVG_HEBYEAR_DAYS);
    while (newYear(year) <= abs) {
        ++year;
    }
    --year;
    let month = abs < hebrew2abs(year, 1, 1) ? 7 : 1;
    while (abs > hebrew2abs(year, month, daysInMonth(month, year))) {
        ++month;
    }
    const day = 1 + abs - hebrew2abs(year, month, 1);
    return { yy: year, mm: month, dd: day };
}
/**
 * Returns true if Hebrew year is a leap year.
 *
 * The Hebrew calendar is lunisolar: 7 years out of every 19-year
 * (Metonic) cycle are leap years, in which a 13th month (Adar I) is
 * inserted before Adar so that Nisan stays in the spring.
 * @param year Hebrew year
 * @returns `true` if `year` has 13 months
 * @example
 * isLeapYear(5783); // false
 * isLeapYear(5784); // true
 */
function isLeapYear(year) {
    return (1 + year * 7) % 19 < 7;
}
/**
 * Number of months in this Hebrew year (either 12 or 13 depending on leap year).
 *
 * Because Adar II is the last month of a leap year and Adar the last
 * month of a common year, this doubles as "the number of the final
 * month", which is how the anniversary rules identify Adar.
 * @param year Hebrew year
 * @returns 12 or 13
 * @example
 * monthsInYear(5783); // 12
 * monthsInYear(5784); // 13
 */
function monthsInYear(year) {
    return 12 + +isLeapYear(year); // boolean is cast to 1 or 0
}
// Static day counts indexed by month number. 0 marks months whose length
// depends on the year (CHESHVAN, KISLEV, ADAR_I).
const STATIC_DAYS_IN_MONTH = [
    0, 30, 29, 30, 29, 30, 29, 30, 0, 0, 29, 30, 0, 29,
];
/**
 * Number of days in Hebrew month in a given year (29 or 30).
 *
 * Most months have a fixed length. Cheshvan and Kislev vary to absorb
 * the 353/354/355-day variation of the Hebrew year (see
 * {@link longCheshvan} and {@link shortKislev}), and Adar I has 30 days
 * in a leap year but 29 in a common year.
 * @param month Hebrew month (e.g. months.TISHREI)
 * @param year Hebrew year
 * @returns an integer 29-30
 * @example
 * import {daysInMonth, months} from '@hebcal/hdate';
 * daysInMonth(months.CHESHVAN, 5769); // 29
 * daysInMonth(months.KISLEV, 5769);   // 30
 */
function daysInMonth(month, year) {
    const d = STATIC_DAYS_IN_MONTH[month];
    if (d !== 0)
        return d;
    if (month === ADAR_I$2)
        return isLeapYear(year) ? 30 : 29;
    if (month === CHESHVAN$2)
        return longCheshvan(year) ? 30 : 29;
    return shortKislev(year) ? 29 : 30; // KISLEV
}
/**
 * Returns a transliterated string name of Hebrew month in year,
 * for example 'Elul' or 'Cheshvan'.
 *
 * The year matters only for the 12th month, which is named `'Adar'` in a
 * common year and `'Adar I'` in a leap year. To translate the result into
 * another locale, pass it to {@link Locale.gettext}.
 * @param month Hebrew month (e.g. months.TISHREI)
 * @param year Hebrew year
 * @returns transliterated month name
 * @throws {TypeError} if `month` is out of range 1-14
 * @example
 * import {getMonthName, months} from '@hebcal/hdate';
 * getMonthName(months.CHESHVAN, 5769); // 'Cheshvan'
 * getMonthName(months.ADAR_I, 5784);   // 'Adar I' (leap year)
 * getMonthName(months.ADAR_I, 5783);   // 'Adar'   (common year)
 */
function getMonthName(month, year) {
    assertNumber(month, 'month');
    assertNumber(year, 'year');
    if (month < 1 || month > 14) {
        throw new TypeError(`bad monthNum: ${month}`);
    }
    return monthNames[+isLeapYear(year)][month];
}
/**
 * Days from sunday prior to start of Hebrew calendar to mean
 * conjunction of Tishrei in Hebrew YEAR, after applying the four
 * postponement rules (dechiyot) that fix Rosh Hashanah.
 *
 * This is an implementation detail of the calendar arithmetic rather
 * than a supported entry point; prefer {@link hebrew2abs} or
 * {@link daysInYear}. Results for years 5000-6999 are cached.
 * @internal
 * @param year Hebrew year
 * @returns days elapsed since the epoch
 */
function elapsedDays(year) {
    if (year >= ED_CACHE_MIN && year <= ED_CACHE_MAX) {
        const idx = year - ED_CACHE_MIN;
        const n = edCache[idx];
        if (n !== 0)
            return n;
        const elapsed = elapsedDays0(year);
        edCache[idx] = elapsed;
        return elapsed;
    }
    return elapsedDays0(year);
}
/**
 * Days from sunday prior to start of Hebrew calendar to mean
 * conjunction of Tishrei in Hebrew YEAR
 * @private
 * @param year Hebrew year
 */
function elapsedDays0(year) {
    const prevYear = year - 1;
    const mElapsed = 235 * Math.floor(prevYear / 19) + // Months in complete 19 year lunar (Metonic) cycles so far
        12 * (prevYear % 19) + // Regular months in this cycle
        Math.floor(((prevYear % 19) * 7 + 1) / 19); // Leap months this cycle
    const pElapsed = 204 + 793 * (mElapsed % 1080);
    const hElapsed = 5 +
        12 * mElapsed +
        793 * Math.floor(mElapsed / 1080) +
        Math.floor(pElapsed / 1080);
    const parts = (pElapsed % 1080) + 1080 * (hElapsed % 24);
    const day = 1 + 29 * mElapsed + Math.floor(hElapsed / 24);
    let altDay = day;
    if (parts >= 19440 ||
        (2 === day % 7 && parts >= 9924 && !isLeapYear(year)) ||
        (1 === day % 7 && parts >= 16789 && isLeapYear(prevYear))) {
        altDay++;
    }
    if (altDay % 7 === 0 || altDay % 7 === 3 || altDay % 7 === 5) {
        return altDay + 1;
    }
    else {
        return altDay;
    }
}
/**
 * Number of days in the hebrew YEAR.
 * A common Hebrew calendar year can have a length of 353, 354 or 355 days
 * A leap Hebrew calendar year can have a length of 383, 384 or 385 days
 *
 * The three lengths within each group are deficient, regular and
 * complete years respectively; see {@link shortKislev} and
 * {@link longCheshvan} for which month absorbs the difference.
 * @param year Hebrew year
 * @returns 353-355 in a common year, 383-385 in a leap year
 * @example
 * daysInYear(5783); // 355
 * daysInYear(5784); // 383 (leap year)
 */
function daysInYear(year) {
    return elapsedDays(year + 1) - elapsedDays(year);
}
/**
 * true if Cheshvan is long in Hebrew year.
 *
 * Cheshvan normally has 29 days, but gains a 30th in a "complete"
 * (שלמה) year, one of the two ways the calendar stretches a year to
 * keep Rosh Hashanah off a forbidden weekday.
 * @param year Hebrew year
 * @returns `true` if Cheshvan has 30 days
 * @example
 * longCheshvan(5783); // true
 * longCheshvan(5784); // false
 */
function longCheshvan(year) {
    return daysInYear(year) % 10 === 5;
}
/**
 * true if Kislev is short in Hebrew year.
 *
 * Kislev normally has 30 days, but drops to 29 in a "deficient" (חסרה)
 * year, the counterpart to {@link longCheshvan} that shortens a year by
 * a day.
 * @param year Hebrew year
 * @returns `true` if Kislev has 29 days
 * @example
 * shortKislev(5783); // false
 * shortKislev(5784); // true
 */
function shortKislev(year) {
    return daysInYear(year) % 10 === 3;
}
/**
 * Converts Hebrew month string name to numeric.
 *
 * Accepts transliterated names (`'Cheshvan'`, `'Sh'vat'`), Hebrew-script
 * names with or without nikud (`'חשון'`, `'תִּשְׁרֵי'`), an optional bet
 * prefix (`'בתמוז'`), and passes numbers through unchanged. Matching is
 * case-insensitive and only needs enough of the name to be unambiguous.
 * `'Adar'` resolves to Adar I; `'Adar II'` (and `'אדר ב׳'`) to Adar II.
 * @param monthName monthName
 * @returns Hebrew month number (1=NISAN, 7=TISHREI)
 * @throws {TypeError} if `monthName` is neither a string nor a number
 * @throws {RangeError} if the name is not recognized, or a numeric month
 *   is outside 1-14
 * @example
 * monthFromName('Cheshvan'); // 8
 * monthFromName('חשון');     // 8
 * monthFromName('Adar II');  // 13
 * monthFromName(7);          // 7 (passthrough)
 */
function monthFromName(monthName) {
    if (typeof monthName === 'number') {
        if (isNaN(monthName) || monthName < 1 || monthName > 14) {
            throw new RangeError(`bad monthName: ${monthName}`);
        }
        return monthName;
    }
    if (typeof monthName !== 'string') {
        throw new TypeError(`bad monthName: ${monthName}`);
    }
    let c = monthName.trim().toLowerCase();
    // remove all niqud and trailing gershayim (for Adar Alef/Bet)
    c = hebrewStripNikkud(c).replace(/׳$/, '');
    // If Hebrew month starts with a bet (for example `בתמוז`) then ignore it
    if (c.startsWith('ב')) {
        c = c.substring(1);
    }
    /*
    the Hebrew months are unique to their second letter
    N         Nisan  (November?)
    I         Iyyar
    E        Elul
    C        Cheshvan
    K        Kislev
    1        1Adar
    2        2Adar
    Si Sh     Sivan, Shvat
    Ta Ti Te Tamuz, Tishrei, Tevet
    Av Ad    Av, Adar
  
    אב אד אי אל   אב אדר אייר אלול
    ח            חשון
    ט            טבת
    כ            כסלו
    נ            ניסן
    ס            סיון
    ש            שבט
    תמ תש        תמוז תשרי
    */
    switch (c[0]) {
        case 'n':
        case 'נ':
            if (c[1] === 'o') {
                break; /* this catches "november" */
            }
            return NISAN$5;
        case 'i':
            return IYYAR$2;
        case 'e':
            return ELUL$1;
        case 'c':
        case 'ח':
            return CHESHVAN$2;
        case 'k':
        case 'כ':
            return KISLEV$2;
        case 's':
            switch (c[1]) {
                case 'i':
                    return SIVAN$2;
                case 'h':
                    return SHVAT$1;
            }
            break;
        case 't':
            switch (c[1]) {
                case 'a':
                    return TAMUZ$2;
                case 'i':
                    return TISHREI$2;
                case 'e':
                    return TEVET$2;
            }
            break;
        case 'a':
            switch (c[1]) {
                case 'v':
                    return AV$2;
                case 'd':
                    if (/(1|[^i]i|a|א)$/i.test(c)) {
                        return ADAR_I$2;
                    }
                    return ADAR_II$2; // else assume sheini
            }
            break;
        case 'ס':
            return SIVAN$2;
        case 'ט':
            return TEVET$2;
        case 'ש':
            return SHVAT$1;
        case 'א':
            switch (c[1]) {
                case 'ב':
                    return AV$2;
                case 'ד':
                    if (/(1|[^i]i|a|א)$/i.test(c)) {
                        return ADAR_I$2;
                    }
                    return ADAR_II$2; // else assume sheini
                case 'י':
                    return IYYAR$2;
                case 'ל':
                    return ELUL$1;
            }
            break;
        case 'ת':
            switch (c[1]) {
                case 'מ':
                    return TAMUZ$2;
                case 'ש':
                    return TISHREI$2;
            }
            break;
    }
    throw new RangeError(`bad monthName: ${monthName}`);
}

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
const NISAN$4 = months.NISAN;
const CHESHVAN$1 = months.CHESHVAN;
const KISLEV$1 = months.KISLEV;
const TEVET$1 = months.TEVET;
const SHVAT = months.SHVAT;
const ADAR_I$1 = months.ADAR_I;
const ADAR_II$1 = months.ADAR_II;
/**
 * Returns true if the object is a SimpleHebrewDate
 * @private
 */
function isSimpleHebrewDate$1(obj0) {
    const obj = obj0;
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.yy === 'number' &&
        typeof obj.mm === 'number' &&
        typeof obj.dd === 'number');
}
/**
 * Normalizes any accepted form of an event date into a `SimpleHebrewDate`.
 *
 * When the caller passes an object (a `SimpleHebrewDate` or anything
 * structurally compatible with it, such as an `HDate`), this returns a
 * copy rather than the object itself: callers keep their original event
 * date around and reuse it across years, and the anniversary functions
 * are free to modify the value they get back from here.
 * @private
 */
function toSimpleHebrewDate(obj) {
    if (isSimpleHebrewDate$1(obj)) {
        const hd = obj;
        return { yy: hd.yy, mm: hd.mm, dd: hd.dd };
    }
    else if (isDate(obj)) {
        const abs = greg2abs(obj);
        return abs2hebrew(abs);
    }
    else {
        // typeof obj === 'number'
        return abs2hebrew(obj);
    }
}
/**
 * Calculates yahrzeit, the anniversary of a death, and returns it as a
 * `SimpleHebrewDate` (`{yy, mm, dd}`).
 * `hyear` must be after original `date` of death.
 * Returns `undefined` when requested year preceeds or is same as original year.
 *
 * Hebcal uses the algorithm defined in "Calendrical Calculations"
 * by Edward M. Reingold and Nachum Dershowitz.
 *
 * **This is not the same calculation as a birthday.** When the original
 * date does not exist in the target year, a yahrzeit falls *earlier* —
 * on the last day of the preceding month — because the anniversary
 * should not be observed later than the day itself. A birthday in the
 * same situation is *postponed* to the first of the following month.
 * See {@link getBirthdayHD} for the contrast.
 *
 * The two also differ in whether the original year is a legal `hyear`.
 * A yahrzeit is by definition an *anniversary* of a death, so the
 * earliest one that exists is the first: the day of the death itself is
 * not a yahrzeit, and a "zeroth" yahrzeit has no meaning to return.
 * `hyear` must therefore be strictly after the year of death, and this
 * function returns `undefined` otherwise. A birth date, by contrast, is
 * a real and meaningful day in its own right, so
 * {@link getBirthdayHD} accepts the year of birth and hands back the
 * original date.
 *
 * The customary anniversary date of a death is more complicated and depends
 * also on the character of the year in which the first anniversary occurs.
 * There are several cases:
 *
 * * If the date of death is Marcheshvan 30, the anniversary in general depends
 *   on the first anniversary; if that first anniversary was not Marcheshvan 30,
 *   use the day before Kislev 1.
 * * If the date of death is Kislev 30, the anniversary in general again depends
 *   on the first anniversary — if that was not Kislev 30, use the day before
 *   Tevet 1.
 * * If the date of death is Adar II, the anniversary is the same day in the
 *   last month of the Hebrew year (Adar or Adar II).
 * * If the date of death is Adar I 30, the anniversary in a Hebrew year that
 *   is not a leap year (in which Adar only has 29 days) is the last day in
 *   Shevat.
 * * In all other cases, use the normal (that is, same month number) anniversary
 *   of the date of death. [Calendrical Calculations p. 113]
 *
 * The `date` argument is never modified, so a single original date can be
 * reused to generate a run of years.
 * @see {@link yahrzeit} for the same result as an `HDate` instance
 * @example
 * import {getYahrzeitHD} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // 30 Adar I 5774
 * getYahrzeitHD(5780, dt); // {yy: 5780, mm: 11, dd: 30} (30 Sh'vat)
 * @param hyear Hebrew year in which to find the anniversary
 * @param date Gregorian or Hebrew date of death
 * @returns anniversary occurring in `hyear`, or `undefined`
 *   when `hyear` is on or before the original year
 */
function getYahrzeitHD(hyear, date) {
    let hDeath = toSimpleHebrewDate(date);
    if (hyear <= hDeath.yy) {
        // Hebrew year ${hyear} occurs on or before original date in ${hDeath.yy}
        return undefined;
    }
    if (hDeath.mm === CHESHVAN$1 &&
        hDeath.dd === 30 &&
        !longCheshvan(hDeath.yy + 1)) {
        // If it's Heshvan 30 it depends on the first anniversary;
        // if that was not Heshvan 30, use the day before Kislev 1.
        hDeath = abs2hebrew(hebrew2abs(hyear, KISLEV$1, 1) - 1);
    }
    else if (hDeath.mm === KISLEV$1 &&
        hDeath.dd === 30 &&
        shortKislev(hDeath.yy + 1)) {
        // If it's Kislev 30 it depends on the first anniversary;
        // if that was not Kislev 30, use the day before Teveth 1.
        hDeath = abs2hebrew(hebrew2abs(hyear, TEVET$1, 1) - 1);
    }
    else if (hDeath.mm === ADAR_II$1) {
        // If it's Adar II, use the same day in last month of year (Adar or Adar II).
        hDeath.mm = monthsInYear(hyear);
    }
    else if (hDeath.mm === ADAR_I$1 && hDeath.dd === 30 && !isLeapYear(hyear)) {
        // If it's the 30th in Adar I and year is not a leap year
        // (so Adar has only 29 days), use the last day in Shevat.
        hDeath.dd = 30;
        hDeath.mm = SHVAT;
    }
    // In all other cases, use the normal anniversary of the date of death.
    // advance day to rosh chodesh if needed
    if (hDeath.mm === CHESHVAN$1 && hDeath.dd === 30 && !longCheshvan(hyear)) {
        hDeath.mm = KISLEV$1;
        hDeath.dd = 1;
    }
    else if (hDeath.mm === KISLEV$1 && hDeath.dd === 30 && shortKislev(hyear)) {
        hDeath.mm = TEVET$1;
        hDeath.dd = 1;
    }
    hDeath.yy = hyear;
    return hDeath;
}
/**
 * Calculates a birthday or anniversary (non-yahrzeit) and returns it as
 * a `SimpleHebrewDate` (`{yy, mm, dd}`).
 * `hyear` must be on or after original `date` of anniversary.
 * Returns `undefined` when requested year preceeds the original year.
 *
 * Hebcal uses the algorithm defined in "Calendrical Calculations"
 * by Edward M. Reingold and Nachum Dershowitz.
 *
 * **This is not the same calculation as a yahrzeit.** When the original
 * date is missing from the target year, a birthday is *postponed* to the
 * first of the following month, whereas a yahrzeit moves *earlier* to
 * the last day of the preceding month. Passing the same original date to
 * both functions can therefore return dates almost a month apart.
 *
 * Unlike {@link getYahrzeitHD}, `hyear` may equal the original year, in
 * which case the original date is returned unchanged. A birth date is a
 * meaningful day in its own right — it is the day the person was born,
 * not merely the zeroth anniversary of it. A death has no comparable
 * day: a yahrzeit only begins to exist on the first anniversary, which
 * is why {@link getYahrzeitHD} rejects the year of death.
 *
 * The birthday of someone born in Adar of an ordinary year or Adar II of
 * a leap year is also always in the last month of the year, be that Adar
 * or Adar II. The birthday in an ordinary year of someone born during the
 * first 29 days of Adar I in a leap year is on the corresponding day of Adar;
 * in a leap year, the birthday occurs in Adar I, as expected.
 *
 * Someone born on the thirtieth day of Marcheshvan, Kislev, or Adar I
 * has his birthday postponed until the first of the following month in
 * years where that day does not occur. [Calendrical Calculations p. 111]
 *
 * The `date` argument is never modified, so a single original date can be
 * reused to generate a run of years.
 * @see {@link birthdayOrAnniversary} for the same result as an `HDate` instance
 * @example
 * import {getBirthdayHD} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // 30 Adar I 5774
 * getBirthdayHD(5780, dt); // {yy: 5780, mm: 1, dd: 1} (1 Nisan)
 * @param hyear Hebrew year in which to find the anniversary
 * @param date Gregorian or Hebrew date of the original event
 * @returns anniversary occurring in `hyear`, or `undefined`
 *   when `hyear` precedes the original year
 */
function getBirthdayHD(hyear, date) {
    const orig = toSimpleHebrewDate(date);
    const origYear = orig.yy;
    if (hyear === origYear) {
        return orig;
    }
    else if (hyear < origYear) {
        // Hebrew year ${hyear} occurs on or before original date in ${origYear}
        return undefined;
    }
    const isOrigLeap = isLeapYear(origYear);
    let month = orig.mm;
    let day = orig.dd;
    if ((month === ADAR_I$1 && !isOrigLeap) || (month === ADAR_II$1 && isOrigLeap)) {
        month = monthsInYear(hyear);
    }
    else if (month === CHESHVAN$1 && day === 30 && !longCheshvan(hyear)) {
        month = KISLEV$1;
        day = 1;
    }
    else if (month === KISLEV$1 && day === 30 && shortKislev(hyear)) {
        month = TEVET$1;
        day = 1;
    }
    else if (month === ADAR_I$1 &&
        day === 30 &&
        isOrigLeap &&
        !isLeapYear(hyear)) {
        month = NISAN$4;
        day = 1;
    }
    return { yy: hyear, mm: month, dd: day };
}

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
const GERESH = '׳';
const GERSHAYIM = '״';
const heb2num = {
    א: 1,
    ב: 2,
    ג: 3,
    ד: 4,
    ה: 5,
    ו: 6,
    ז: 7,
    ח: 8,
    ט: 9,
    י: 10,
    כ: 20,
    ל: 30,
    מ: 40,
    נ: 50,
    ס: 60,
    ע: 70,
    פ: 80,
    צ: 90,
    ק: 100,
    ר: 200,
    ש: 300,
    ת: 400,
};
const num2heb = {};
for (const [key, val] of Object.entries(heb2num)) {
    num2heb[val] = key;
}
function num2digits(num) {
    const digits = [];
    while (num > 0) {
        if (num === 15 || num === 16) {
            digits.push(9, num - 9);
            break;
        }
        let incr = 100;
        let i;
        for (i = 400; i > num; i -= incr) {
            if (i === incr) {
                incr = incr / 10;
            }
        }
        digits.push(i);
        num -= i;
    }
    return digits;
}
/**
 * Converts a numerical value to a string of Hebrew letters.
 *
 * When specifying years of the Hebrew calendar in the present millennium,
 * we omit the thousands (which is presently 5 [ה]).
 * @example
 * gematriya(5774) // 'תשע״ד' - cropped to 774
 * gematriya(25) // 'כ״ה'
 * gematriya(60) // 'ס׳'
 * gematriya(3761) // 'ג׳תשס״א'
 * gematriya(1123) // 'א׳קכ״ג'
 */
function gematriya(num) {
    const num1 = parseInt(num, 10);
    if (!num1 || num1 < 0) {
        throw new TypeError(`invalid number: ${num}`);
    }
    let str = '';
    const thousands = Math.floor(num1 / 1000);
    if (thousands > 0 && thousands !== 5) {
        const tdigits = num2digits(thousands);
        for (const tdig of tdigits) {
            str += num2heb[tdig];
        }
        str += GERESH;
    }
    const digits = num2digits(num1 % 1000);
    if (digits.length === 1) {
        return str + num2heb[digits[0]] + GERESH;
    }
    for (let i = 0; i < digits.length; i++) {
        if (i + 1 === digits.length) {
            str += GERSHAYIM;
        }
        str += num2heb[digits[i]];
    }
    return str;
}
/**
 * Converts a string of Hebrew letters to a numerical value.
 *
 * Only considers the value of Hebrew letters `א` through `ת`.
 * Ignores final Hebrew letters such as `ך` (kaf sofit) or `ם` (mem sofit)
 * and vowels (nekudot).
 * @example
 * gematriyaStrToNum('תשע״ד');   // 774
 * gematriyaStrToNum('ט״ו');     // 15
 * gematriyaStrToNum('ג׳תשס״א'); // 3761 (thousands prefix)
 */
function gematriyaStrToNum(str) {
    if (typeof str !== 'string') {
        throw new TypeError(`bad gematriya str: ${str}`);
    }
    let num = 0;
    const gereshIdx = str.indexOf(GERESH);
    if (gereshIdx !== -1 && gereshIdx !== str.length - 1) {
        const thousands = str.substring(0, gereshIdx);
        num += gematriyaStrToNum(thousands) * 1000;
        str = str.substring(gereshIdx);
    }
    for (const ch of str) {
        const n = heb2num[ch];
        if (typeof n === 'number') {
            num += n;
        }
    }
    return num;
}

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
/**
 * Formats a number with leading zeros so the resulting string is 4 digits long.
 * Similar to `string.padStart(4, '0')` but will also format
 * negative numbers similar to how the JavaScript date formats
 * negative year numbers (e.g. `-37` is formatted as `-000037`).
 * @example
 * pad4(7);     // '0007'
 * pad4(2024);  // '2024'
 * pad4(-37);   // '-000037'
 */
function pad4(num) {
    if (num < 0) {
        return '-00' + pad4(-num);
    }
    else if (num < 10) {
        return '000' + num;
    }
    else if (num < 100) {
        return '00' + num;
    }
    else if (num < 1000) {
        return '0' + num;
    }
    return String(num);
}
/**
 * Formats a number with leading zeros so the resulting string is 2 digits long.
 * Similar to `string.padStart(2, '0')`.
 * @example
 * pad2(3);   // '03'
 * pad2(11);  // '11'
 */
function pad2(num) {
    if (num >= 0 && num < 10) {
        return '0' + num;
    }
    return String(num);
}

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
const _formatters = new Map();
/**
 * @private
 */
function getFormatter$1(tzid) {
    const fmt = _formatters.get(tzid);
    if (fmt)
        return fmt;
    const f = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: tzid,
    });
    _formatters.set(tzid, f);
    return f;
}
const dateFormatRegex = /^(\d+).(\d+).(\d+),?\s+(\d+).(\d+).(\d+)/;
/**
 * Returns a string similar to `Date.toISOString()` but in the
 * timezone `tzid`. Contrary to the typical meaning of `Z` at the end
 * of the string, this is not actually a UTC date.
 * @example
 * const dt = new Date(Date.UTC(2021, 0, 31, 7, 30, 50));
 * getPseudoISO('UTC', dt);                // '2021-01-31T07:30:50Z'
 * getPseudoISO('America/New_York', dt);   // '2021-01-31T02:30:50Z'
 * getPseudoISO('Asia/Jerusalem', dt);     // '2021-01-31T09:30:50Z'
 */
function getPseudoISO(tzid, date) {
    const str = getFormatter$1(tzid).format(date);
    const m = dateFormatRegex.exec(str);
    if (m === null) {
        throw new Error(`Unable to parse formatted string: ${str}`);
    }
    let hour = m[4];
    if (hour === '24') {
        hour = '00';
    }
    m[3] = pad4(parseInt(m[3], 10));
    return `${m[3]}-${m[1]}-${m[2]}T${hour}:${m[5]}:${m[6]}Z`;
}
/**
 * Returns number of minutes `tzid` is offset from UTC on date `date`.
 * @example
 * const january = new Date(Date.UTC(2020, 0, 15, 12));
 * getTimezoneOffset('America/New_York', january);    //  300 (UTC-5)
 * getTimezoneOffset('America/Los_Angeles', january); //  480 (UTC-8)
 * getTimezoneOffset('Asia/Jerusalem', january);      // -120 (UTC+2)
 */
function getTimezoneOffset(tzid, date) {
    const utcStr = getPseudoISO('UTC', date);
    const localStr = getPseudoISO(tzid, date);
    const diffMs = new Date(utcStr).getTime() - new Date(localStr).getTime();
    return Math.ceil(diffMs / 1000 / 60);
}
/**
 * Formats the date portion of `dt` as `YYYY-MM-DD` using the date's
 * local-time fields (year/month/day), not its UTC fields. The year is
 * always padded to at least 4 digits and negative years are prefixed
 * with `-`, matching the formatting that `pad4` applies.
 *
 * This is intentionally separate from `Date.prototype.toISOString()`,
 * which always reports in UTC and may report a different day for
 * dates near midnight in non-UTC time zones.
 * @example
 * isoDateString(new Date(2008, 10, 13)); // '2008-11-13'
 * isoDateString(new Date(2021, 0, 31));  // '2021-01-31'
 */
function isoDateString(dt) {
    return (pad4(dt.getFullYear()) +
        '-' +
        pad2(dt.getMonth() + 1) +
        '-' +
        pad2(dt.getDate()));
}

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
var poAshkenazi$1 = { "headers": { "plural-forms": "nplurals=2; plural=(n > 1);", "language": "und-x-ashkenaz" }, "contexts": { "": { "Tevet": ["Teves"] } } };

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
var poHe$1 = { "headers": { "plural-forms": "nplurals=2; plural=(n > 1);", "language": "he" }, "contexts": { "": { "Adar": ["אֲדָר"], "Adar I": ["אֲדָר א׳"], "Adar II": ["אֲדָר ב׳"], "Av": ["אָב"], "Cheshvan": ["חֶשְׁוָן"], "Elul": ["אֱלוּל"], "Iyyar": ["אִיָּיר"], "Kislev": ["כִּסְלֵו"], "Nisan": ["נִיסָן"], "Sh'vat": ["שְׁבָט"], "Sivan": ["סִיוָן"], "Tamuz": ["תַּמּוּז"], "Tammuz": ["תַּמּוּז"], "Tevet": ["טֵבֵת"], "Tishrei": ["תִּשְׁרֵי"] } } };

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
const noopLocale = {
    headers: { 'plural-forms': 'nplurals=2; plural=(n!=1);' },
    contexts: { '': {} },
};
const alias = {
    h: 'he',
    a: 'ashkenazi',
    s: 'en',
    '': 'en',
};
/** @private */
const locales = new Map();
/** @private */
function getEnOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
/** @private */
function checkLocale(locale) {
    if (typeof locale !== 'string') {
        throw new TypeError(`Invalid locale name: ${locale}`);
    }
    locale = alias[locale] || locale;
    return locale.toLowerCase();
}
/** @private */
function getExistingLocale(locale) {
    const locale1 = checkLocale(locale);
    const loc = locales.get(locale1);
    if (!loc) {
        throw new RangeError(`Locale '${locale}' not found`);
    }
    return loc;
}
/**
 * A locale in Hebcal is used for translations/transliterations of
 * holidays. `@hebcal/hdate` supports four locales by default
 * * `en` - default, Sephardic transliterations (e.g. "Shabbat")
 * * `ashkenazi` - Ashkenazi transliterations (e.g. "Shabbos")
 * * `he` - Hebrew (e.g. "שַׁבָּת")
 * * `he-x-NoNikud` - Hebrew without nikud (e.g. "שבת")
 *
 * The locale set that ships here covers only what this package needs:
 * month names, a handful of connective words, and the parts of speech
 * used by {@link HDate.render}. Packages built on top of it (such as
 * `@hebcal/core`) register their own holiday translations into the same
 * locales with {@link Locale.addTranslations}.
 *
 * Every method is static — `Locale` is a namespace, not something you
 * instantiate. Locale names are matched case-insensitively, and the
 * single letters `h`, `a` and `s` are accepted as aliases for `he`,
 * `ashkenazi` and `en` respectively.
 * @example
 * import {Locale, HDate, months} from '@hebcal/hdate';
 *
 * Locale.gettext('Cheshvan', 'he');        // 'חֶשְׁוָן'
 * Locale.gettext('Cheshvan', 'ashkenazi'); // 'Cheshvan'
 * Locale.ordinal(15, 'en');                // '15th'
 *
 * const hd = new HDate(15, months.CHESHVAN, 5769);
 * hd.render('en'); // '15th of Cheshvan, 5769'
 * hd.render('he'); // '15 חֶשְׁוָן, 5769'
 */
class Locale {
    /**
     * Returns translation only if `locale` offers a non-empty translation for `id`.
     * Otherwise, returns `undefined`.
     * @param id Message ID to translate
     * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to no-op locale.
     * @example
     * Locale.lookupTranslation('Adar II', 'he-x-NoNikud'); // 'אדר ב׳'
     * Locale.lookupTranslation('Foobar', 'he-x-NoNikud');  // undefined
     */
    static lookupTranslation(id, locale) {
        const loc = (typeof locale === 'string' && locales.get(checkLocale(locale))) ||
            noopLocale.contexts[''];
        const array = loc[id];
        if (array?.length && array[0].length) {
            return array[0];
        }
        return undefined;
    }
    /**
     * By default, if no translation was found, returns `id`.
     * @param id Message ID to translate
     * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to no-op locale.
     * @example
     * Locale.gettext('Elul', 'he');          // 'אֱלוּל'
     * Locale.gettext('Tevet', 'ashkenazi');  // 'Teves'
     * Locale.gettext('Unknown', 'he');       // 'Unknown' (falls back to id)
     */
    static gettext(id, locale) {
        const text = this.lookupTranslation(id, locale);
        if (text === undefined) {
            return id;
        }
        return text;
    }
    /**
     * Register locale translations, replacing the locale entirely if it
     * was already registered. Use {@link Locale.addTranslations} to merge
     * into an existing locale instead.
     * @param locale Locale name (i.e.: `'he'`, `'fr'`)
     * @param data parsed data from a `.po` file.
     * @throws {TypeError} if `data` is not in the compact `.po` format
     * @example
     * import {Locale} from '@hebcal/hdate';
     * // typically `import poFr from './fr.po'` — inlined here for clarity
     * const poFr = {headers: {}, contexts: {'': {Shabbat: ['Chabbat']}}};
     * Locale.addLocale('fr', poFr);
     * Locale.gettext('Shabbat', 'fr'); // 'Chabbat'
     */
    static addLocale(locale, data) {
        locale = checkLocale(locale);
        const ctx = data.contexts;
        if (typeof ctx !== 'object' || typeof ctx[''] !== 'object') {
            throw new TypeError(`Locale '${locale}' invalid compact format`);
        }
        locales.set(locale, ctx['']);
    }
    /**
     * Adds a translation to `locale`, replacing any previous translation.
     * @param locale Locale name (i.e: `'he'`, `'fr'`).
     * @param id Message ID to translate
     * @param translation Translation text
     * @example
     * Locale.addTranslation('ashkenazi', 'Foobar', 'Quux');
     * Locale.gettext('Foobar', 'ashkenazi'); // 'Quux'
     */
    static addTranslation(locale, id, translation) {
        const loc = getExistingLocale(locale);
        if (typeof id !== 'string' || id.length === 0) {
            throw new TypeError(`Invalid id string: ${id}`);
        }
        const isArray = Array.isArray(translation);
        if (isArray) {
            const t0 = translation[0];
            if (typeof t0 !== 'string' || t0.length === 0) {
                throw new TypeError(`Invalid translation array: ${translation}`);
            }
        }
        else if (typeof translation !== 'string') {
            throw new TypeError(`Invalid translation string: ${translation}`);
        }
        loc[id] = isArray ? translation : [translation];
    }
    /**
     * Adds multiple translations to `locale`, replacing any previous translations.
     *
     * The locale must already be registered (typically via `addLocale`);
     * to register a brand-new locale instead, call `addLocale` directly.
     * Use this method to merge an additional `.po` file (e.g. holiday
     * translations supplied by a separate `@hebcal/*` package) into an
     * existing locale.
     * @param locale Locale name (i.e: `'he'`, `'fr'`).
     * @param data parsed data from a `.po` file.
     * @throws {RangeError} if `locale` has not been registered
     * @throws {TypeError} if `data` is not in the compact `.po` format
     * @example
     * import {Locale} from '@hebcal/hdate';
     * Locale.addTranslations('ashkenazi', {
     *   headers: {},
     *   contexts: {'': {Sukkot: ['Sukkos'], Shavuot: ['Shavuos']}},
     * });
     * Locale.gettext('Sukkot', 'ashkenazi'); // 'Sukkos'
     * Locale.gettext('Tevet', 'ashkenazi');  // 'Teves' (existing translations kept)
     */
    static addTranslations(locale, data) {
        const loc = getExistingLocale(locale);
        const ctx = data.contexts;
        if (typeof ctx !== 'object' || typeof ctx[''] !== 'object') {
            throw new TypeError(`Locale '${locale}' invalid compact format`);
        }
        Object.assign(loc, ctx['']);
    }
    /**
     * Returns the names of registered locales
     * @example
     * Locale.getLocaleNames(); // ['ashkenazi', 'en', 'he', 'he-x-nonikud']
     */
    static getLocaleNames() {
        const keys = Array.from(locales.keys());
        return keys.sort((a, b) => a.localeCompare(b));
    }
    /**
     * Checks whether a locale has been registered
     * @param locale Locale name (i.e: `'he'`, `'fr'`).
     * @example
     * Locale.hasLocale('he'); // true
     * Locale.hasLocale('fr'); // false
     */
    static hasLocale(locale) {
        const locale1 = checkLocale(locale);
        return locales.has(locale1);
    }
    /**
     * Renders a number in ordinal, such as 1st, 2nd or 3rd
     * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to no-op locale.
     * @example
     * Locale.ordinal(3, 'en'); // '3rd'
     * Locale.ordinal(3, 'es'); // '3º'
     * Locale.ordinal(3, 'fr'); // '3.'
     * Locale.ordinal(3, 'he'); // '3'
     */
    static ordinal(n, locale) {
        const locale1 = checkLocale(locale || '');
        if (locale1 === 'en' || locale1.startsWith('ashkenazi')) {
            return getEnOrdinal(n);
        }
        else if (Locale.isHebrewLocale(locale1)) {
            return String(n);
        }
        else if (locale1 === 'es') {
            return n + 'º';
        }
        return n + '.';
    }
    /**
     * Removes nekudot from Hebrew string
     * @example
     * Locale.hebrewStripNikkud('אֱלוּל'); // 'אלול'
     */
    static hebrewStripNikkud(str) {
        return hebrewStripNikkud(str);
    }
    /**
     * Returns a new `LocaleData` derived from `data` with niqqud (vowel
     * points) stripped from every translation value. The input is not
     * modified.
     *
     * This is the helper used internally to build the `he-x-NoNikud`
     * locale from `he`; call it when registering a derived "no nikud"
     * variant of a custom Hebrew-script locale.
     * @param data locale data to copy
     * @returns a new `LocaleData` with niqqud removed
     * @see {@link Locale.hebrewStripNikkud}
     * @example
     * import {Locale} from '@hebcal/hdate';
     * const withNikud = {
     *   headers: {},
     *   contexts: {'': {Elul: ['אֱלוּל']}},
     * };
     * const stripped = Locale.copyLocaleNoNikud(withNikud);
     * stripped.contexts[''].Elul[0];   // 'אלול'
     * withNikud.contexts[''].Elul[0];  // 'אֱלוּל' (input unchanged)
     */
    static copyLocaleNoNikud(data) {
        const strs = data.contexts[''];
        const m = {};
        for (const [key, val] of Object.entries(strs)) {
            m[key] = [hebrewStripNikkud(val[0])];
        }
        return {
            headers: data.headers,
            contexts: { '': m },
        };
    }
    /**
     * Returns true if `locale` is a Hebrew locale (i.e. `he` or `he-x-NoNikud`)
     * @example
     * Locale.isHebrewLocale('he');           // true
     * Locale.isHebrewLocale('he-x-NoNikud'); // true
     * Locale.isHebrewLocale('en');           // false
     */
    static isHebrewLocale(locale) {
        if (typeof locale !== 'string') {
            return false;
        }
        locale = alias[locale] || locale;
        locale = locale.toLowerCase();
        return locale.startsWith('he');
    }
}
Locale.addLocale('en', noopLocale);
/* Ashkenazic transliterations */
Locale.addLocale('ashkenazi', poAshkenazi$1);
/* Hebrew with nikkud */
Locale.addLocale('he', poHe$1);
/* Hebrew without nikkud */
const poHeNoNikud$1 = Locale.copyLocaleNoNikud(poHe$1);
Locale.addLocale('he-x-NoNikud', poHeNoNikud$1);

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
/*
    Hebcal - A Jewish Calendar Generator
    Copyright (c) 1994-2020 Danny Sadinoff
    Portions copyright Eyal Schachter and Michael J. Radwin

    https://github.com/hebcal/hebcal-es6

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation; either version 2
    of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
function mod(x, y) {
    return x - y * Math.floor(x / y);
}
function isSimpleHebrewDate(obj) {
    return obj.yy !== undefined;
}
const UNITS_DAY = 'day';
const UNITS_WEEK = 'week';
const UNITS_MONTH = 'month';
const UNITS_YEAR = 'year';
/**
 * A `HDate` represents a Hebrew calendar date.
 *
 * An instance of this class encapsulates a date in the Hebrew calendar system.
 * It consists of a year, month, and day, without any associated time or location data.
 * The Hebrew calendar is a lunisolar calendar, meaning it is based on both lunar and solar cycles.
 *
 * A Hebrew date internally stores three numbers:
 * - year: The Hebrew year (1-9999). Counted from the traditional Hebrew date of creation (3761 BCE in the Gregorian calendar)
 * - month: The Hebrew month (1-13). Month 1 is Nisan, month 7 is Tishrei. There are 12 months in a regular year and 13 months in a leap year.
 * - day: The day of the month (1-30)
 *
 * This class uses Rata Die to convert between the Hebrew and Gregorian calendars.
 *
 * To calculate times of day, use `Zmanim` class from `@hebcal/core`
 * @see {@link https://en.wikipedia.org/wiki/Rata_Die | Rata Die}
 * @see {@link https://hebcal.github.io/api/core/classes/Zmanim.html | Zmanim}
 */
class HDate {
    /** Hebrew year, 1-9999 */
    yy;
    /** Hebrew month of year (1=NISAN, 7=TISHREI) */
    mm;
    /** Hebrew day within the month (1-30) */
    dd;
    /** absolute Rata Die (R.D.) days */
    rd;
    /**
     * Create a Hebrew date. There are 3 basic forms for the `HDate()` constructor.
     *
     * 1. No parameters - represents the current Hebrew date at time of instantiation
     * 2. One parameter
     *    * `Date` - represents the Hebrew date corresponding to the Gregorian date using
     *       local time. Hours, minutes, seconds and milliseconds are ignored.
     *    * `HDate` - clones a copy of the given Hebrew date
     *    * `number` - Converts absolute R.D. days to Hebrew date.
     *       R.D. 1 == the imaginary date January 1, 1 (Gregorian)
     * 3. Three parameters: Hebrew day, Hebrew month, Hebrew year. Hebrew day should
     *    be a number between 1-30, Hebrew month can be a number or string, and
     *    Hebrew year is always a number.
     * @example
     * import {HDate, months} from '@hebcal/hdate';
     *
     * const hd1 = new HDate();
     * const hd2 = new HDate(new Date(2008, 10, 13));
     * const hd3 = new HDate(15, 'Cheshvan', 5769);
     * const hd4 = new HDate(15, months.CHESHVAN, 5769);
     * const hd5 = new HDate(733359); // ==> 15 Cheshvan 5769
     * const monthName = 'אייר';
     * const hd6 = new HDate(5, monthName, 5773);
     * @param [day] - Day of month (1-30) if a `number`.
     *   If a `Date` is specified, represents the Hebrew date corresponding to the
     *   Gregorian date using local time.
     *   If an `HDate` is specified, clones a copy of the given Hebrew date.
     * @param [month] - Hebrew month of year (1=NISAN, 7=TISHREI)
     * @param [year] - Hebrew year
     */
    constructor(day, month, year) {
        if (arguments.length === 2 || arguments.length > 3) {
            throw new TypeError('HDate constructor requires 0, 1 or 3 arguments');
        }
        if (arguments.length === 3) {
            // Hebrew day, Hebrew month, Hebrew year
            this.dd = this.mm = 1;
            const yy = typeof year === 'string' ? parseInt(year, 10) : year;
            if (isNaN(yy)) {
                throw new TypeError(`HDate called with bad year: ${year}`);
            }
            this.yy = yy;
            setMonth(this, month); // will throw if we can't parse
            const dd = typeof day === 'string' ? parseInt(day, 10) : day;
            if (isNaN(dd)) {
                throw new TypeError(`HDate called with bad day: ${day}`);
            }
            setDate(this, dd);
        }
        else {
            // 0 arguments
            if (day === undefined || day === null) {
                day = new Date();
            }
            // 1 argument
            const abs0 = typeof day === 'number' && !isNaN(day)
                ? day
                : isDate(day)
                    ? greg2abs(day)
                    : isSimpleHebrewDate(day)
                        ? day
                        : null;
            if (abs0 === null) {
                throw new TypeError(`HDate called with bad arg: ${day}`);
            }
            const isNumber = typeof abs0 === 'number';
            const d = isNumber ? abs2hebrew(abs0) : abs0;
            this.yy = d.yy;
            this.mm = d.mm;
            this.dd = d.dd;
            if (isNumber) {
                this.rd = abs0;
            }
        }
    }
    /**
     * Returns the Hebrew year of this Hebrew date
     * @returns an integer >= 1
     * @example
     * const hd = new HDate(new Date(2008, 10, 13)); // 15 Cheshvan 5769
     * hd.getFullYear(); // 5769
     */
    getFullYear() {
        return this.yy;
    }
    /**
     * Returns `true` if this Hebrew date occurs during a Hebrew leap year
     * @example
     * const hd = new HDate(new Date(2008, 10, 13)); // 15 Cheshvan 5769
     * hd.isLeapYear(); // false
     */
    isLeapYear() {
        return isLeapYear(this.yy);
    }
    /**
     * Returns the Hebrew month (1=NISAN, 7=TISHREI) of this Hebrew date
     * @returns an integer 1-13
     * @example
     * const hd = new HDate(new Date(2008, 10, 13)); // 15 Cheshvan 5769
     * hd.getMonth(); // 8
     */
    getMonth() {
        return this.mm;
    }
    /**
     * The Tishrei-based month of this Hebrew date. 1 is Tishrei, 7 is Nisan, 13 is Elul in a leap year
     * @returns an integer 1-13
     * @example
     * const hd = new HDate(new Date(2008, 10, 13)); // 15 Cheshvan 5769
     * hd.getTishreiMonth(); // 2
     */
    getTishreiMonth() {
        const nummonths = monthsInYear(this.getFullYear());
        return (this.getMonth() + nummonths - 6) % nummonths || nummonths;
    }
    /**
     * Number of days in the month of this Hebrew date (29 or 30)
     * @returns an integer 29-30
     * @example
     * const hd = new HDate(new Date(2008, 10, 13)); // 15 Cheshvan 5769
     * hd.daysInMonth(); // 29
     */
    daysInMonth() {
        return daysInMonth(this.getMonth(), this.getFullYear());
    }
    /**
     * Gets the day within the month (1-30)
     * @returns an integer 1-30
     * @example
     * const hd = new HDate(new Date(2008, 10, 13)); // 15 Cheshvan 5769
     * hd.getDate(); // 15
     */
    getDate() {
        return this.dd;
    }
    /**
     * Returns the day of the week for this Hebrew date,
     * where 0 represents Sunday, 1 represents Monday, 6 represents Saturday.
     *
     * For the day of the month, see `getDate()`
     * @returns an integer 0-6
     * @example
     * const hd = new HDate(new Date(2008, 10, 13)); // 15 Cheshvan 5769
     * hd.getDay(); // 4 (Thursday)
     */
    getDay() {
        return mod(this.abs(), 7);
    }
    /**
     * Converts this Hebrew date to the corresponding Gregorian date.
     *
     * The returned `Date` object will be in the local (i.e. host system) time zone.
     * Hours, minutes, seconds and milliseconds will all be zero.
     *
     * Note that this function returns the daytime portion of the date.
     * For example, the 15th of Cheshvan 5769 began at sundown on
     * 12 November 2008 and continues through 13 November 2008. This
     * function would return only the date 13 November 2008.
     * @example
     * const hd = new HDate(15, 'Cheshvan', 5769);
     * const date = hd.greg(); // 13 November 2008
     * const year = date.getFullYear(); // 2008
     * const monthNum = date.getMonth() + 1; // 11
     * const day = date.getDate(); // 13
     */
    greg() {
        return abs2greg(this.abs());
    }
    /**
     * Converts from Hebrew date representation to R.D. (Rata Die) fixed days.
     * R.D. 1 is the imaginary date Monday, January 1, 1 (Gregorian).
     * Note also that R.D. = Julian Date − 1,721,424.5
     * @see {@link https://en.wikipedia.org/wiki/Rata_Die | Rata Die}
     * @example
     * const hd = new HDate(15, 'Cheshvan', 5769);
     * hd.abs(); // 733359
     */
    abs() {
        if (typeof this.rd !== 'number') {
            this.rd = hebrew2abs(this.yy, this.mm, this.dd);
        }
        return this.rd;
    }
    /**
     * Converts Hebrew date to R.D. (Rata Die) fixed days.
     * R.D. 1 is the imaginary date Monday, January 1, 1 on the Gregorian
     * Calendar.
     * @param year Hebrew year
     * @param month Hebrew month (1=NISAN, 7=TISHREI)
     * @param day Hebrew date (1-30)
     * @example
     * import {HDate, months} from '@hebcal/hdate';
     * HDate.hebrew2abs(5769, months.CHESHVAN, 15); // 733359
     */
    static hebrew2abs(year, month, day) {
        return hebrew2abs(year, month, day);
    }
    /**
     * Returns a transliterated Hebrew month name, e.g. `'Elul'` or `'Cheshvan'`.
     * @example
     * const hd = new HDate(new Date(2008, 10, 13)); // 15 Cheshvan 5769
     * hd.getMonthName(); // 'Cheshvan'
     */
    getMonthName() {
        return getMonthName(this.getMonth(), this.getFullYear());
    }
    /**
     * Renders this Hebrew date as a translated or transliterated string,
     * including ordinal e.g. `'15th of Cheshvan, 5769'`.
     * @example
     * import {HDate, months} from '@hebcal/hdate';
     *
     * const hd = new HDate(15, months.CHESHVAN, 5769);
     * console.log(hd.render('en')); // '15th of Cheshvan, 5769'
     * console.log(hd.render('he')); // '15 חֶשְׁוָן, 5769'
     * console.log(hd.render('en', false)); // '15th of Cheshvan'
     * console.log(hd.render('he', false)); // '15 חֶשְׁוָן'
     * @param [locale] Optional locale name (defaults to active locale).
     * @param [showYear=true] Display year (defaults to true).
     * @see {@link Locale}
     */
    render(locale, showYear = true) {
        const locale0 = locale || 'en';
        const day = this.getDate();
        const monthName0 = Locale.gettext(this.getMonthName(), locale0);
        const monthName = monthName0.replace(/'/g, '’');
        const nth = Locale.ordinal(day, locale0);
        const dayOf = getDayOfTranslation(locale0);
        const dateStr = `${nth}${dayOf} ${monthName}`;
        if (showYear) {
            const fullYear = this.getFullYear();
            return `${dateStr}, ${fullYear}`;
        }
        else {
            return dateStr;
        }
    }
    /**
     * Renders this Hebrew date in Hebrew gematriya, regardless of locale.
     * @param suppressNikud - suppress nekudot (default false)
     * @param suppressYear - suppress Hebrew year (default false)
     * @example
     * import {HDate, months} from '@hebcal/hdate';
     * const hd = new HDate(15, months.CHESHVAN, 5769);
     * hd.renderGematriya(); // 'ט״ו חֶשְׁוָן תשס״ט'
     * hd.renderGematriya(true); // 'ט״ו חשון תשס״ט'
     * hd.renderGematriya(false, true); // 'ט״ו חֶשְׁוָן'
     */
    renderGematriya(suppressNikud = false, suppressYear = false) {
        const d = this.getDate();
        const locale = suppressNikud ? 'he-x-NoNikud' : 'he';
        const m = Locale.gettext(this.getMonthName(), locale);
        const prefix = gematriya(d) + ' ' + m;
        if (suppressYear) {
            return prefix;
        }
        const y = this.getFullYear();
        return prefix + ' ' + gematriya(y);
    }
    /**
     * Returns an `HDate` corresponding to the specified day of week
     * **before** this Hebrew date.
     *
     * Strictly before: if this date already falls on `dayOfWeek`, the
     * previous occurrence a week earlier is returned.
     * @example
     * const wed = new HDate(new Date('Wednesday February 19, 2014'));
     * wed.before(6).greg().toDateString(); // 'Sat Feb 15 2014'
     * @param dayOfWeek day of week: Sunday=0, Saturday=6
     * @returns a new `HDate`; the original is not modified
     */
    before(dayOfWeek) {
        return onOrBefore(dayOfWeek, this, -1);
    }
    /**
     * Returns an `HDate` corresponding to the specified day of week
     * **on or before** this Hebrew date
     * @example
     * const wed = new HDate(new Date('Wednesday February 19, 2014'));
     * const sat = new HDate(new Date('Saturday February 22, 2014'));
     * const sun = new HDate(new Date('Sunday February 23, 2014'));
     * wed.onOrBefore(6).greg().toDateString(); // 'Sat Feb 15 2014'
     * sat.onOrBefore(6).greg().toDateString(); // 'Sat Feb 22 2014'
     * sun.onOrBefore(6).greg().toDateString(); // 'Sat Feb 22 2014'
     * @param dayOfWeek day of week: Sunday=0, Saturday=6
     * @returns a new `HDate`; the original is not modified
     */
    onOrBefore(dayOfWeek) {
        return onOrBefore(dayOfWeek, this, 0);
    }
    /**
     * Returns an `HDate` corresponding to the specified day of week
     * **nearest** to this Hebrew date.
     *
     * Ties are broken forward: a date exactly 3 days from `dayOfWeek` in
     * both directions resolves to the later one.
     * @example
     * const wed = new HDate(new Date('Wednesday February 19, 2014'));
     * const tue = new HDate(new Date('Tuesday February 18, 2014'));
     * wed.nearest(6).greg().toDateString(); // 'Sat Feb 22 2014'
     * tue.nearest(6).greg().toDateString(); // 'Sat Feb 15 2014'
     * @param dayOfWeek day of week: Sunday=0, Saturday=6
     * @returns a new `HDate`; the original is not modified
     */
    nearest(dayOfWeek) {
        return onOrBefore(dayOfWeek, this, 3);
    }
    /**
     * Returns an `HDate` corresponding to the specified day of week
     * **on or after** this Hebrew date
     * @example
     * const wed = new HDate(new Date('Wednesday February 19, 2014'));
     * const sat = new HDate(new Date('Saturday February 22, 2014'));
     * const sun = new HDate(new Date('Sunday February 23, 2014'));
     * wed.onOrAfter(6).greg().toDateString(); // 'Sat Feb 22 2014'
     * sat.onOrAfter(6).greg().toDateString(); // 'Sat Feb 22 2014'
     * sun.onOrAfter(6).greg().toDateString(); // 'Sat Mar 01 2014'
     * @param dayOfWeek day of week: Sunday=0, Saturday=6
     * @returns a new `HDate`; the original is not modified
     */
    onOrAfter(dayOfWeek) {
        return onOrBefore(dayOfWeek, this, 6);
    }
    /**
     * Returns an `HDate` corresponding to the specified day of week
     * **after** this Hebrew date.
     *
     * Strictly after: if this date already falls on `dayOfWeek`, the next
     * occurrence a week later is returned.
     * @example
     * const wed = new HDate(new Date('Wednesday February 19, 2014'));
     * const sat = new HDate(new Date('Saturday February 22, 2014'));
     * const sun = new HDate(new Date('Sunday February 23, 2014'));
     * wed.after(6).greg().toDateString(); // 'Sat Feb 22 2014'
     * sat.after(6).greg().toDateString(); // 'Sat Mar 01 2014'
     * sun.after(6).greg().toDateString(); // 'Sat Mar 01 2014'
     * @param dayOfWeek day of week: Sunday=0, Saturday=6
     * @returns a new `HDate`; the original is not modified
     */
    after(dayOfWeek) {
        return onOrBefore(dayOfWeek, this, 7);
    }
    /**
     * Returns the next Hebrew date
     * @returns a new `HDate` one day later; the original is not modified
     * @example
     * const hd = new HDate(new Date(2008, 10, 13)); // 15 Cheshvan 5769
     * hd.next().toString(); // '16 Cheshvan 5769'
     */
    next() {
        return new HDate(this.abs() + 1);
    }
    /**
     * Returns the previous Hebrew date
     * @returns a new `HDate` one day earlier; the original is not modified
     * @example
     * const hd = new HDate(new Date(2008, 10, 13)); // 15 Cheshvan 5769
     * hd.prev().toString(); // '14 Cheshvan 5769'
     */
    prev() {
        return new HDate(this.abs() - 1);
    }
    /**
     * Returns a cloned `HDate` object with a specified amount of time added
     *
     * Units are case insensitive, and support plural and short forms.
     * Note, short forms are case sensitive.
     *
     * | Unit | Shorthand | Description
     * | --- | --- | --- |
     * | `day` | `d` | days |
     * | `week` | `w` | weeks |
     * | `month` | `M` | months |
     * | `year` | `y` | years |
     * @example
     * import {HDate, months} from '@hebcal/hdate';
     *
     * const hd1 = new HDate(15, months.CHESHVAN, 5769);
     * hd1.add(7, 'd').toString();     // '22 Cheshvan 5769'
     * hd1.add(1, 'weeks').toString(); // '22 Cheshvan 5769'
     * hd1.add(1, 'year').toString();  // '15 Cheshvan 5770'
     * @param amount number of units to add (negative values subtract)
     * @param [units=d] unit of time, defaults to days
     * @returns a new `HDate`; the original is not modified
     * @throws {TypeError} if `units` is not a recognized unit of time
     */
    add(amount, units = 'd') {
        amount = typeof amount === 'string' ? parseInt(amount, 10) : amount;
        if (!amount) {
            return new HDate(this);
        }
        units = standardizeUnits(units);
        if (units === UNITS_DAY) {
            return new HDate(this.abs() + amount);
        }
        else if (units === UNITS_WEEK) {
            return new HDate(this.abs() + 7 * amount);
        }
        else if (units === UNITS_YEAR) {
            return new HDate(this.getDate(), this.getMonth(), this.getFullYear() + amount);
        }
        else {
            // units === UNITS_MONTH
            let hd = new HDate(this);
            const sign = amount > 0 ? 1 : -1;
            amount = Math.abs(amount);
            for (let i = 0; i < amount; i++) {
                hd = new HDate(hd.abs() + sign * hd.daysInMonth());
            }
            return hd;
        }
    }
    /**
     * Returns a cloned `HDate` object with a specified amount of time subracted
     *
     * Units are case insensitive, and support plural and short forms.
     * Note, short forms are case sensitive.
     *
     * | Unit | Shorthand | Description
     * | --- | --- | --- |
     * | `day` | `d` | days |
     * | `week` | `w` | weeks |
     * | `month` | `M` | months |
     * | `year` | `y` | years |
     * @example
     * import {HDate, months} from '@hebcal/hdate';
     *
     * const hd1 = new HDate(15, months.CHESHVAN, 5769);
     * hd1.subtract(1, 'weeks').toString(); // '8 Cheshvan 5769'
     * hd1.subtract(3, 'M').toString();     // '16 Av 5768'
     * @param amount number of units to subtract (negative values add)
     * @param [units=d] unit of time, defaults to days
     * @returns a new `HDate`; the original is not modified
     * @throws {TypeError} if `units` is not a recognized unit of time
     */
    subtract(amount, units = 'd') {
        return this.add(amount * -1, units);
    }
    /**
     * Returns the difference in days between the two given HDates.
     *
     * The result is positive if `this` date is comes chronologically
     * after the `other` date, and negative
     * if the order of the two dates is reversed.
     *
     * The result is zero if the two dates are identical.
     * @example
     * import {HDate, months} from '@hebcal/hdate';
     *
     * const hd1 = new HDate(25, months.KISLEV, 5770);
     * const hd2 = new HDate(15, months.CHESHVAN, 5769);
     * const days = hd1.deltaDays(hd2); // 394
     * @param other Hebrew date to compare
     */
    deltaDays(other) {
        return this.abs() - other.abs();
    }
    /**
     * Compares this Hebrew date to another date, returning `true` if the dates match.
     * @param other Hebrew date to compare
     * @example
     * const hd1 = new HDate(new Date(2008, 10, 13));
     * const hd2 = new HDate(15, 'Cheshvan', 5769);
     * hd1.isSameDate(hd2); // true
     */
    isSameDate(other) {
        return this.yy === other.yy && this.mm === other.mm && this.dd === other.dd;
    }
    /**
     * Returns a string representation of this Hebrew date using English transliterations
     * @example
     * const hd = new HDate(new Date(2008, 10, 13)); // 15 Cheshvan 5769
     * hd.toString(); // '15 Cheshvan 5769'
     */
    toString() {
        const day = this.getDate();
        const fullYear = this.getFullYear();
        const monthName = this.getMonthName();
        return `${day} ${monthName} ${fullYear}`;
    }
    /**
     * Returns true if Hebrew year is a leap year
     * @param year Hebrew year
     * @example
     * HDate.isLeapYear(5783); // false
     * HDate.isLeapYear(5784); // true
     */
    static isLeapYear(year) {
        return isLeapYear(year);
    }
    /**
     * Number of months in this Hebrew year (either 12 or 13 depending on leap year)
     * @param year Hebrew year
     * @example
     * HDate.monthsInYear(5783); // 12
     * HDate.monthsInYear(5784); // 13
     */
    static monthsInYear(year) {
        return monthsInYear(year);
    }
    /**
     * Number of days in Hebrew month in a given year (29 or 30)
     * @param month Hebrew month (e.g. months.TISHREI)
     * @param year Hebrew year
     * @example
     * import {HDate, months} from '@hebcal/hdate';
     * HDate.daysInMonth(months.CHESHVAN, 5769); // 29
     */
    static daysInMonth(month, year) {
        return daysInMonth(month, year);
    }
    /**
     * Returns a transliterated string name of Hebrew month in year,
     * for example 'Elul' or 'Cheshvan'.
     * @param month Hebrew month (e.g. months.TISHREI)
     * @param year Hebrew year
     * @example
     * import {HDate, months} from '@hebcal/hdate';
     * HDate.getMonthName(months.CHESHVAN, 5769); // 'Cheshvan'
     */
    static getMonthName(month, year) {
        return getMonthName(month, year);
    }
    /**
     * Returns the Hebrew month number (NISAN=1, TISHREI=7)
     * @param month A number, or Hebrew month name string
     * @example
     * import {HDate, months} from '@hebcal/hdate';
     * HDate.monthNum(months.CHESHVAN); // 8
     * HDate.monthNum('Cheshvan'); // 8
     * HDate.monthNum('חשון'); // 8
     */
    static monthNum(month) {
        if (typeof month === 'number') {
            if (isNaN(month) || month > 14) {
                throw new RangeError(`bad monthNum: ${month}`);
            }
            return month;
        }
        if (typeof month !== 'string') {
            throw new TypeError(`bad monthNum: ${month}`);
        }
        return month.charCodeAt(0) >= 48 && month.charCodeAt(0) <= 57 /* number */
            ? parseInt(month, 10)
            : monthFromName(month);
    }
    /**
     * Number of days in the Hebrew year.
     * Regular years can have 353, 354, or 355 days.
     * Leap years can have 383, 384, or 385 days.
     * @param year Hebrew year
     * @example
     * HDate.daysInYear(5783); // 355
     * HDate.daysInYear(5784); // 383
     */
    static daysInYear(year) {
        return daysInYear(year);
    }
    /**
     * true if Cheshvan is long in Hebrew year
     * @param year Hebrew year
     * @example
     * HDate.longCheshvan(5783); // true
     * HDate.longCheshvan(5784); // false
     */
    static longCheshvan(year) {
        return longCheshvan(year);
    }
    /**
     * true if Kislev is short in Hebrew year
     * @param year Hebrew year
     * @example
     * HDate.shortKislev(5783); // false
     * HDate.shortKislev(5784); // true
     */
    static shortKislev(year) {
        return shortKislev(year);
    }
    /**
     * Converts Hebrew month string name to numeric
     * @example
     * import {HDate, months} from '@hebcal/hdate';
     * HDate.monthFromName(months.CHESHVAN); // 8
     * HDate.monthFromName('Cheshvan'); // 8
     * HDate.monthFromName('חשון'); // 8
     */
    static monthFromName(monthName) {
        return monthFromName(monthName);
    }
    /**
     * Convenience function for determining the R.D. date
     * near a specified R.D. date, corresponding to the specified day of week.
     *
     * Note: Applying this function to d+6 gives us the `dayOfWeek` on or after an
     * absolute day d. Similarly, applying it to d+3 gives the `dayOfWeek` nearest to
     * absolute date d, applying it to d-1 gives the `dayOfWeek` previous to absolute
     * date d, and applying it to d+7 gives the `dayOfWeek` following absolute date d.
     *
     * The instance methods {@link HDate.before}, {@link HDate.onOrBefore},
     * {@link HDate.nearest}, {@link HDate.onOrAfter} and {@link HDate.after}
     * wrap this with those offsets already applied.
     * @param dayOfWeek day of week: Sunday=0, Saturday=6
     * @param absdate R.D. number of days
     * @returns R.D. number of days
     * @example
     * import {HDate} from '@hebcal/hdate';
     * // 733359 is Thursday 13 November 2008
     * HDate.dayOnOrBefore(6, 733359); // 733354 (Saturday 8 November 2008)
     * HDate.dayOnOrBefore(6, 733359 + 6); // 733361 (Saturday 15 November 2008)
     */
    static dayOnOrBefore(dayOfWeek, absdate) {
        return absdate - ((absdate - dayOfWeek) % 7);
    }
    /**
     * Tests if the object is an instance of `HDate`
     * @example
     * HDate.isHDate(new HDate()); // true
     * HDate.isHDate(new Date()); // false
     * HDate.isHDate(null); // false
     * HDate.isHDate(12345); // false
     * HDate.isHDate('15 Cheshvan 5769'); // false
     */
    static isHDate(obj0) {
        const obj = obj0;
        return (obj !== null &&
            typeof obj === 'object' &&
            typeof obj.yy === 'number' &&
            typeof obj.mm === 'number' &&
            typeof obj.dd === 'number' &&
            typeof obj.greg === 'function' &&
            typeof obj.abs === 'function');
    }
    /**
     * Construct a new instance of `HDate` from a Gematriya-formatted string.
     *
     * The string must have the form day-month-year, with the month name
     * written in Hebrew script (nikud optional, an optional bet prefix
     * allowed). A year below 1000 is assumed to omit the thousands and has
     * `currentThousands` added to it.
     * @param str Hebrew date in gematriya, e.g. `'כ״ז בְּתַמּוּז תשפ״ג'`
     * @param [currentThousands=5000] added to a year below 1000
     * @returns the parsed Hebrew date
     * @throws {TypeError} if `str` is not a string
     * @throws {RangeError} if `str` is not 3 or 4 space-separated parts,
     *   or the month name is not recognized
     * @example
     * HDate.fromGematriyaString('כ״ז בְּתַמּוּז תשפ״ג').toString(); // '27 Tamuz 5783'
     * HDate.fromGematriyaString('כ׳ סיון תש״ד').toString(); // '20 Sivan 5704'
     * HDate.fromGematriyaString('ה׳ אִיָיר תש״ח').toString(); // '5 Iyyar 5708'
     */
    static fromGematriyaString(str, currentThousands = 5000) {
        if (typeof str !== 'string') {
            throw new TypeError(`bad gematriya str: ${str}`);
        }
        const parts = str.split(' ').filter(x => x.length !== 0);
        const numParts = parts.length;
        if (numParts !== 3 && numParts !== 4) {
            throw new RangeError(`cannot parse gematriya str: "${str}"`);
        }
        const day = gematriyaStrToNum(parts[0]);
        const monthStr = numParts === 3 ? parts[1] : parts[1] + ' ' + parts[2];
        const month = monthFromName(monthStr);
        const yearStr = numParts === 3 ? parts[2] : parts[3];
        let year = gematriyaStrToNum(yearStr);
        if (year < 1000) {
            year += currentThousands;
        }
        return new HDate(day, month, year);
    }
}
function standardizeUnits(units) {
    switch (units) {
        case 'd':
            return UNITS_DAY;
        case 'w':
            return UNITS_WEEK;
        case 'M':
            return UNITS_MONTH;
        case 'y':
            return UNITS_YEAR;
    }
    const str = String(units || '')
        .toLowerCase()
        .replace(/s$/, '');
    switch (str) {
        case UNITS_DAY:
        case UNITS_WEEK:
        case UNITS_MONTH:
        case UNITS_YEAR:
            return str;
    }
    throw new TypeError(`Invalid units '${units}'`);
}
function getDayOfTranslation(locale) {
    switch (locale) {
        case 'en':
        case 's':
        case 'a':
        case 'ashkenazi':
            return ' of';
    }
    const ofStr = Locale.lookupTranslation('of', locale);
    if (ofStr) {
        return ' ' + ofStr;
    }
    if (locale.startsWith('ashkenazi')) {
        return ' of';
    }
    return '';
}
/**
 * Sets the day of the month of the date. Returns the object it was called upon
 * @private
 * @param month A number, or Hebrew month name string
 */
function setMonth(hd, month) {
    hd.mm = HDate.monthNum(month);
    fix(hd);
    return hd;
}
function setDate(hd, date) {
    hd.dd = date;
    fix(hd);
    return hd;
}
function fix(hd) {
    fixMonth(hd);
    fixDate(hd);
}
function fixDate(hd) {
    if (hd.dd < 1) {
        if (hd.mm === months.TISHREI) {
            hd.yy -= 1;
        }
        hd.dd += daysInMonth(hd.mm, hd.yy);
        hd.mm -= 1;
        fix(hd);
    }
    if (hd.dd > daysInMonth(hd.mm, hd.yy)) {
        if (hd.mm === months.ELUL) {
            hd.yy += 1;
        }
        hd.dd -= daysInMonth(hd.mm, hd.yy);
        if (hd.mm === monthsInYear(hd.yy)) {
            hd.mm = 1; // rollover to NISAN
        }
        else {
            hd.mm += 1;
        }
        fix(hd);
    }
    fixMonth(hd);
}
function fixMonth(hd) {
    if (hd.mm === months.ADAR_II && !hd.isLeapYear()) {
        hd.mm -= 1; // to Adar I
        fix(hd);
    }
    else if (hd.mm < 1) {
        hd.mm += monthsInYear(hd.yy);
        hd.yy -= 1;
        fix(hd);
    }
    else if (hd.mm > monthsInYear(hd.yy)) {
        hd.mm -= monthsInYear(hd.yy);
        hd.yy += 1;
        fix(hd);
    }
    delete hd.rd;
}
function onOrBefore(day, t, offset) {
    return new HDate(HDate.dayOnOrBefore(day, t.abs() + offset));
}

/*! @hebcal/hdate v0.22.7, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */
/**
 * Calculates yahrzeit, the anniversary of a death, and returns it as an
 * {@link HDate}.
 *
 * Same calculation as {@link getYahrzeitHD}, but the result comes back
 * as an `HDate` instance rather than a plain `{yy, mm, dd}` object, so it
 * can be rendered (`render`, `renderGematriya`) or used for further
 * Hebrew calendar arithmetic directly.
 *
 * Note that a yahrzeit is *not* calculated the same way as a birthday:
 * when the original date is missing from `hyear` it moves earlier rather
 * than later. See {@link getYahrzeitHD} for the full algorithm and its
 * edge cases (Marcheshvan 30, Kislev 30, Adar I / Adar II).
 *
 * `hyear` must be strictly after the year of death. A yahrzeit is an
 * *anniversary* of a death, so the first one is the earliest that
 * exists — the day of the death itself is not a yahrzeit, and there is
 * no meaningful "zeroth" one to return. This is the one place where
 * {@link birthdayOrAnniversary} legitimately accepts a year that this
 * function rejects: a birth date is a real day in its own right.
 *
 * The `date` argument is never modified, so a single original date can be
 * reused to generate a run of years.
 * @param hyear Hebrew year in which to find the anniversary
 * @param date Gregorian or Hebrew date of death
 * @returns anniversary occurring in `hyear`, or `undefined` when `hyear`
 *   is on or before the year of death
 * @see {@link getYahrzeitHD}
 * @see {@link birthdayOrAnniversary}
 * @example
 * import {yahrzeit} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
 * yahrzeit(5780, dt)?.toString();          // '30 Sh\'vat 5780'
 * yahrzeit(5780, dt)?.renderGematriya();   // 'ל׳ שְׁבָט תש״פ'
 * yahrzeit(5774, dt);                      // undefined (year of death)
 */
function yahrzeit(hyear, date) {
    const hd = getYahrzeitHD(hyear, date);
    return hd && new HDate(hd);
}
/**
 * Calculates a birthday or anniversary (non-yahrzeit) and returns it as
 * an {@link HDate}.
 *
 * Same calculation as {@link getBirthdayHD}, but the result comes back
 * as an `HDate` instance rather than a plain `{yy, mm, dd}` object, so it
 * can be rendered (`render`, `renderGematriya`) or used for further
 * Hebrew calendar arithmetic directly.
 *
 * Note that a birthday is *not* calculated the same way as a yahrzeit:
 * when the original date is missing from `hyear` it is postponed rather
 * than moved earlier. See {@link getBirthdayHD} for the full algorithm
 * and its edge cases.
 *
 * `hyear` may be the original year, in which case the original date is
 * returned unchanged: someone's birth date is a meaningful day in its
 * own right, not merely the zeroth anniversary of itself. A death has no
 * equivalent — a yahrzeit begins at the first anniversary — which is why
 * {@link yahrzeit} rejects the year of death.
 *
 * The `date` argument is never modified, so a single original date can be
 * reused to generate a run of years.
 * @param hyear Hebrew year in which to find the anniversary
 * @param date Gregorian or Hebrew date of the original event
 * @returns anniversary occurring in `hyear`, or `undefined` when `hyear`
 *   precedes the original year
 * @see {@link getBirthdayHD}
 * @see {@link yahrzeit}
 * @example
 * import {birthdayOrAnniversary} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
 * birthdayOrAnniversary(5780, dt)?.toString(); // '1 Nisan 5780'
 * birthdayOrAnniversary(5774, dt)?.toString(); // '30 Adar I 5774'
 * birthdayOrAnniversary(5773, dt);             // undefined
 */
function birthdayOrAnniversary(hyear, date) {
    const hd = getBirthdayHD(hyear, date);
    return hd && new HDate(hd);
}

var poAshkenazi = { "headers": { "plural-forms": "nplurals=2; plural=(n > 1);", "language": "und-x-ashkenaz" }, "contexts": { "": { "Shabbat": ["Shabbos"], "Achrei Mot": ["Achrei Mos"], "Bechukotai": ["Bechukosai"], "Beha'alotcha": ["Beha’aloscha"], "Bereshit": ["Bereshis"], "Chukat": ["Chukas"], "Erev Shavuot": ["Erev Shavuos"], "Erev Sukkot": ["Erev Sukkos"], "Ki Tavo": ["Ki Savo"], "Ki Teitzei": ["Ki Seitzei"], "Ki Tisa": ["Ki Sisa"], "Matot": ["Matos"], "Pesach Shabbat Chol ha-Moed": ["Pesach Shabbos Chol ha-Moed"], "Purim Katan": ["Purim Koton"], "Rosh Hashana LaBehemot": ["Rosh Hashana LaBeheimos"], "Shabbat Chazon": ["Shabbos Chazon"], "Shabbat HaChodesh": ["Shabbos HaChodesh"], "Shabbat HaGadol": ["Shabbos HaGadol"], "Shabbat Nachamu": ["Shabbos Nachamu"], "Shabbat Parah": ["Shabbos Parah"], "Shabbat Shekalim": ["Shabbos Shekalim"], "Shabbat Shuva": ["Shabbos Shuvah"], "Shabbat Zachor": ["Shabbos Zachor"], "Shavuot": ["Shavuos"], "Shavuot I": ["Shavuos I"], "Shavuot II": ["Shavuos II"], "Shemot": ["Shemos"], "Shmini Atzeret": ["Shmini Atzeres"], "Simchat Torah": ["Simchas Torah"], "Sukkot": ["Sukkos"], "Sukkot I": ["Sukkos I"], "Sukkot II": ["Sukkos II"], "Sukkot II (CH''M)": ["Sukkos II (CH’’M)"], "Sukkot III (CH''M)": ["Sukkos III (CH’’M)"], "Sukkot IV (CH''M)": ["Sukkos IV (CH’’M)"], "Sukkot V (CH''M)": ["Sukkos V (CH’’M)"], "Sukkot VI (CH''M)": ["Sukkos VI (CH’’M)"], "Sukkot VII (Hoshana Raba)": ["Sukkos VII (Hoshana Raba)"], "Sukkot Shabbat Chol ha-Moed": ["Sukkos Shabbos Chol ha-Moed"], "Ta'anit Bechorot": ["Ta’anis Bechoros"], "Ta'anit BeHaB": ["Ta’anis BeHaB"], "Ta'anit Esther": ["Ta’anis Esther"], "Toldot": ["Toldos"], "Vaetchanan": ["Vaeschanan"], "Yitro": ["Yisro"], "Vezot Haberakhah": ["Vezos Haberakhah"], "Parashat": ["Parshas"], "Leil Selichot": ["Leil Selichos"], "Shabbat Mevarchim Chodesh": ["Shabbos Mevorchim Chodesh"], "Shabbat Shirah": ["Shabbos Shirah"], "Asara B'Tevet": ["Asara B’Teves"], "Birkat Hachamah": ["Birkas HaChamah"], "Birkat HaChamah": ["Birkas HaChamah"], "Shushan Purim Katan": ["Shushan Purim Koton"], "Alot HaShachar": ["Alos HaShachar"], "Misheyakir": ["Misheyakir"], "Misheyakir Machmir": ["Misheyakir Machmir"], "Sunrise": ["Sunrise"], "Kriat Shema, sof zeman": ["Krias Shema, sof zman"], "Tefilah, sof zeman": ["Tefilah, sof zman"], "Kriat Shema, sof zeman (MGA)": ["Krias Shema, sof zman (MGA)"], "Kriat Shema, sof zeman (GRA)": ["Krias Shema, sof zman (GRA)"], "Tefilah, sof zeman (MGA)": ["Tefilah, sof zman (MGA)"], "Tefilah, sof zeman (GRA)": ["Tefilah, sof zman (GRA)"], "Chatzot HaLailah": ["Chatzos HaLailah"], "Chatzot HaYom": ["Chatzos"], "Chatzot hayom": ["Chatzos"], "Mincha Gedolah": ["Mincha Gedolah"], "Mincha Ketanah": ["Mincha Ketanah"], "Plag HaMincha": ["Plag HaMincha"], "Sunset": ["Sunset"], "Bein HaShemashot": ["Bein HaShemashos"], "Tzeit HaKochavim": ["Tzeis HaKochavim"] } } };

var poHe = { "headers": { "plural-forms": "nplurals=2; plural=(n > 1);", "language": "he_IL" }, "contexts": { "": { "Shabbat": ["שַׁבָּת"], "Parashat": ["פָּרָשַׁת"], "Achrei Mot": ["אַחֲרֵי מוֹת"], "Balak": ["בָּלָק"], "Bamidbar": ["בְּמִדְבַּר"], "Bechukotai": ["בְּחֻקֹּתַי"], "Beha'alotcha": ["בְּהַעֲלֹתְךָ"], "Behar": ["בְּהַר"], "Bereshit": ["בְּרֵאשִׁית"], "Beshalach": ["בְּשַׁלַּח"], "Bo": ["בֹּא"], "Chayei Sara": ["חַיֵּי שָֹרָה"], "Chukat": ["חֻקַּת"], "Devarim": ["דְּבָרִים"], "Eikev": ["עֵקֶב"], "Emor": ["אֱמוֹר"], "Ha'azinu": ["הַאֲזִינוּ"], "Kedoshim": ["קְדֹשִׁים"], "Ki Tavo": ["כִּי־תָבוֹא"], "Ki Teitzei": ["כִּי־תֵצֵא"], "Ki Tisa": ["כִּי תִשָּׂא"], "Korach": ["קֹרַח"], "Lech-Lecha": ["לֶךְ־לְךָ"], "Masei": ["מַסְעֵי"], "Matot": ["מַטּוֹת"], "Metzora": ["מְצֹרָע"], "Miketz": ["מִקֵּץ"], "Mishpatim": ["מִשְׁפָּטִים"], "Nasso": ["נָשׂא"], "Nitzavim": ["נִצָּבִים"], "Noach": ["נֹחַ"], "Pekudei": ["פְקוּדֵי"], "Pinchas": ["פִּינְחָס"], "Re'eh": ["רְאֵה"], "Sh'lach": ["שְׁלַח־לְךָ"], "Shemot": ["שְׁמוֹת"], "Shmini": ["שְּׁמִינִי"], "Shoftim": ["שׁוֹפְטִים"], "Tazria": ["תַזְרִיעַ"], "Terumah": ["תְּרוּמָה"], "Tetzaveh": ["תְּצַוֶּה"], "Toldot": ["תּוֹלְדוֹת"], "Tzav": ["צַו"], "Vaera": ["וָאֵרָא"], "Vaetchanan": ["וָאֶתְחַנַּן"], "Vayakhel": ["וַיַּקְהֵל"], "Vayechi": ["וַיְחִי"], "Vayeilech": ["וַיֵּלֶךְ"], "Vayera": ["וַיֵּרָא"], "Vayeshev": ["וַיֵּשֶׁב"], "Vayetzei": ["וַיֵּצֵא"], "Vayigash": ["וַיִּגַּשׁ"], "Vayikra": ["וַיִּקְרָא"], "Vayishlach": ["וַיִּשְׁלַח"], "Vezot Haberakhah": ["וְזֹאת הַבְּרָכָה"], "Yitro": ["יִתְרוֹ"], "Asara B'Tevet": ["עֲשָׂרָה בְּטֵבֵת"], "Candle lighting": ["הַדְלָקַת נֵרוֹת"], "Chanukah": ["חֲנוּכָּה"], "Chanukah: 1 Candle": ["חֲנוּכָּה: א׳ נֵר"], "Chanukah: 2 Candles": ["חֲנוּכָּה: ב׳ נֵרוֹת"], "Chanukah: 3 Candles": ["חֲנוּכָּה: ג׳ נֵרוֹת"], "Chanukah: 4 Candles": ["חֲנוּכָּה: ד׳ נֵרוֹת"], "Chanukah: 5 Candles": ["חֲנוּכָּה: ה׳ נֵרוֹת"], "Chanukah: 6 Candles": ["חֲנוּכָּה: ו׳ נֵרוֹת"], "Chanukah: 7 Candles": ["חֲנוּכָּה: ז׳ נֵרוֹת"], "Chanukah: 8 Candles": ["חֲנוּכָּה: ח׳ נֵרוֹת"], "Chanukah: 8th Day": ["חֲנוּכָּה: יוֹם ח׳"], "Days of the Omer": ["סְפִירַת הָעוֹמֶר"], "Omer": ["עוֹמֶר"], "day of the Omer": ["בָּעוֹמֶר"], "Erev Pesach": ["עֶרֶב פֶּסַח"], "Erev Purim": ["עֶרֶב פּוּרִים"], "Erev Rosh Hashana": ["עֶרֶב רֹאשׁ הַשָּׁנָה"], "Erev Shavuot": ["עֶרֶב שָׁבוּעוֹת"], "Erev Simchat Torah": ["עֶרֶב שִׂמְחַת תּוֹרָה"], "Erev Sukkot": ["עֶרֶב סֻכּוֹת"], "Erev Tish'a B'Av": ["עֶרֶב תִּשְׁעָה בְּאָב"], "Erev Yom Kippur": ["עֶרֶב יוֹם כִּפּוּר"], "Havdalah": ["הַבְדָּלָה"], "Lag BaOmer": ["ל״ג בָּעוֹמֶר"], "Leil Selichot": ["סְלִיחוֹת"], "Pesach": ["פֶּסַח"], "Pesach I": ["פֶּסַח א׳"], "Pesach II": ["פֶּסַח ב׳"], "Pesach II (CH''M)": ["פֶּסַח ב׳ (חוה״מ)"], "Pesach III (CH''M)": ["פֶּסַח ג׳ (חוה״מ)"], "Pesach IV (CH''M)": ["פֶּסַח ד׳ (חוה״מ)"], "Pesach Sheni": ["פֶּסַח שֵׁנִי"], "Pesach V (CH''M)": ["פֶּסַח ה׳ (חוה״מ)"], "Pesach VI (CH''M)": ["פֶּסַח ו׳ (חוה״מ)"], "Pesach VII": ["פֶּסַח ז׳"], "Pesach VIII": ["פֶּסַח ח׳"], "Pesach Shabbat Chol ha-Moed": ["שַׁבַּת חֹל הַמּוֹעֵד פֶּסַח"], "Purim": ["פּוּרִים"], "Purim Katan": ["פּוּרִים קָטָן"], "Rosh Chodesh": ["רֹאשׁ חוֹדֶשׁ"], "Rosh Hashana": ["רֹאשׁ הַשָּׁנָה"], "Rosh Hashana I": ["רֹאשׁ הַשָּׁנָה א׳"], "Rosh Hashana II": ["רֹאשׁ הַשָּׁנָה ב׳"], "Shabbat Chazon": ["שַׁבַּת חֲזוֹן"], "Shabbat HaChodesh": ["שַׁבַּת הַחֹדֶשׁ"], "Shabbat HaGadol": ["שַׁבַּת הַגָּדוֹל"], "Shabbat Nachamu": ["שַׁבַּת נַחֲמוּ"], "Shabbat Parah": ["שַׁבַּת פָּרָה"], "Shabbat Shekalim": ["שַׁבַּת שְׁקָלִים"], "Shabbat Shuva": ["שַׁבַּת שׁוּבָה"], "Shabbat Zachor": ["שַׁבַּת זָכוֹר"], "Shavuot": ["שָׁבוּעוֹת"], "Shavuot I": ["שָׁבוּעוֹת א׳"], "Shavuot II": ["שָׁבוּעוֹת ב׳"], "Shmini Atzeret": ["שְׁמִינִי עֲצֶרֶת"], "Shushan Purim": ["שׁוּשָׁן פּוּרִים"], "Sigd": ["חַג הַסִּיגְד"], "Simchat Torah": ["שִׂמְחַת תּוֹרָה"], "Sukkot": ["סֻכּוֹת"], "Sukkot I": ["סֻכּוֹת א׳"], "Sukkot II": ["סֻכּוֹת ב׳"], "Sukkot II (CH''M)": ["סֻכּוֹת ב׳ (חוה״מ)"], "Sukkot III (CH''M)": ["סֻכּוֹת ג׳ (חוה״מ)"], "Sukkot IV (CH''M)": ["סֻכּוֹת ד׳ (חוה״מ)"], "Sukkot V (CH''M)": ["סֻכּוֹת ה׳ (חוה״מ)"], "Sukkot VI (CH''M)": ["סֻכּוֹת ו׳ (חוה״מ)"], "Sukkot VII (Hoshana Raba)": ["סֻכּוֹת ז׳ (הוֹשַׁעְנָא רַבָּה)"], "Sukkot Shabbat Chol ha-Moed": ["שַׁבַּת חֹל הַמּוֹעֵד סֻכּוֹת"], "Ta'anit Bechorot": ["תַּעֲנִית בְּכוֹרוֹת"], "Ta'anit BeHaB": ["תַּעֲנִית בה״ב"], "Ta'anit Esther": ["תַּעֲנִית אֶסְתֵּר"], "Tish'a B'Av": ["תִּשְׁעָה בְּאָב"], "Tu B'Av": ["ט״וּ בְּאָב"], "Tu BiShvat": ["ט״וּ בִּשְׁבָט"], "Tu B'Shvat": ["ט״וּ בִּשְׁבָט"], "Tzom Gedaliah": ["צוֹם גְּדַלְיָה"], "Tzom Tammuz": ["צוֹם י״ז בְּתַמּוּז"], "Yom HaAtzma'ut": ["יוֹם הָעַצְמָאוּת"], "Yom HaShoah": ["יוֹם הַשּׁוֹאָה"], "Yom HaZikaron": ["יוֹם הַזִּכָּרוֹן"], "Yom Kippur": ["יוֹם כִּפּוּר"], "Yom Yerushalayim": ["יוֹם יְרוּשָׁלַיִם"], "Yom HaAliyah": ["יוֹם הַעֲלִיָּה"], "Yom HaAliyah School Observance": ["שְׁמִירָת בֵּית הַסֵפֶר לְיוֹם הַעֲלִיָּה"], "Rosh Chodesh Adar": ["רֹאשׁ חוֹדֶשׁ אֲדָר"], "Rosh Chodesh Adar I": ["רֹאשׁ חוֹדֶשׁ אֲדָר א׳"], "Rosh Chodesh Adar II": ["רֹאשׁ חוֹדֶשׁ אֲדָר ב׳"], "Rosh Chodesh Av": ["רֹאשׁ חוֹדֶשׁ אָב"], "Rosh Chodesh Cheshvan": ["רֹאשׁ חוֹדֶשׁ חֶשְׁוָן"], "Rosh Chodesh Elul": ["רֹאשׁ חוֹדֶשׁ אֱלוּל"], "Rosh Chodesh Iyyar": ["רֹאשׁ חוֹדֶשׁ אִיָּיר"], "Rosh Chodesh Kislev": ["רֹאשׁ חוֹדֶשׁ כִּסְלֵו"], "Rosh Chodesh Nisan": ["רֹאשׁ חוֹדֶשׁ נִיסָן"], "Rosh Chodesh Sh'vat": ["רֹאשׁ חוֹדֶשׁ שְׁבָט"], "Rosh Chodesh Sivan": ["רֹאשׁ חוֹדֶשׁ סִיוָן"], "Rosh Chodesh Tamuz": ["רֹאשׁ חוֹדֶשׁ תַּמּוּז"], "Rosh Chodesh Tammuz": ["רֹאשׁ חוֹדֶשׁ תַּמּוּז"], "Rosh Chodesh Tevet": ["רֹאשׁ חוֹדֶשׁ טֵבֵת"], "min": ["דַּקּוֹת"], "Fast begins": ["תְּחִילַּת הַצוֹם"], "Fast ends": ["סִיּוּם הַצוֹם"], "Rosh Hashana LaBehemot": ["רֹאשׁ הַשָּׁנָה לְמַעְשַׂר בְּהֵמָה"], "Tish'a B'Av (observed)": ["(תִּשְׁעָה בְּאָב (נִדְחָה"], "Shabbat Mevarchim Chodesh": ["שַׁבַּת מְבָרְכִים חוֹדֶשׁ"], "Shabbat Shirah": ["שַׁבַּת שִׁירָה"], "Lovingkindness": ["חֶסֶד"], "Might": ["גְּבוּרָה"], "Beauty": ["תִּפְאֶרֶת"], "Eternity": ["נֶּצַח"], "Splendor": ["הוֹד"], "Foundation": ["יְּסוֹד"], "Majesty": ["מַּלְכוּת"], "day": ["יוֹם"], "Yom Kippur Katan": ["יוֹם כִּפּוּר קָטָן"], "Yizkor": ["יִזְכּוֹר"], "Family Day": ["יוֹם הַמִּשׁפָּחָה"], "Yitzhak Rabin Memorial Day": ["יוֹם הַזִּכָּרוֹן לְיִצְחָק רַבִּין"], "Jabotinsky Day": ["יוֹם זַ׳בּוֹטִינְסְקִי"], "Herzl Day": ["יוֹם הֶרְצְל"], "Ben-Gurion Day": ["יוֹם בֶּן־גּוּרִיּוֹן"], "Hebrew Language Day": ["יוֹם הַשָׂפָה הַעִברִית"], "Birkat Hachamah": ["בִּרְכַּת הַחַמָּה"], "Birkat HaChamah": ["בִּרְכַּת הַחַמָּה"], "Shushan Purim Katan": ["שׁוּשָׁן פּוּרִים קָטָן"], "Purim Meshulash": ["פּוּרִים מְשׁוּלָּשׁ"], "Chag HaBanot": ["חַג הַבָּנוֹת"], "Molad": ["מוֹלָד הָלְּבָנָה"], "chalakim": ["חֲלָקִים"], "Alot HaShachar": ["עֲלוֹת הַשַּׁחַר"], "Misheyakir": ["מִשֶּׁיַּכִּיר"], "Misheyakir Machmir": ["מִשֶּׁיַּכִּיר מַחְמִיר"], "Sunrise": ["נֵץ הַחַמָּה"], "Kriat Shema, sof zeman": ["סוֹף זְמַן קְרִיאַת שְׁמַע"], "Tefilah, sof zeman": ["סוֹף זְמַן תְּפִלָּה"], "Kriat Shema, sof zeman (MGA)": ["סוֹף זְמַן קְרִיאַת שְׁמַע (מג״א)"], "Kriat Shema, sof zeman (GRA)": ["סוֹף זְמַן קְרִיאַת שְׁמַע (גְּרָ״א)"], "Tefilah, sof zeman (MGA)": ["סוֹף זְמַן תְּפִלָּה (מג״א)"], "Tefilah, sof zeman (GRA)": ["סוֹף זְמַן תְּפִלָּה (גְּרָ״א)"], "Chatzot HaLailah": ["חֲצוֹת הַלַּיְלָה"], "Chatzot HaYom": ["חֲצוֹת הַיּוֹם"], "Chatzot hayom": ["חֲצוֹת הַיּוֹם"], "Mincha Gedolah": ["מִנְחָה גְּדוֹלָה"], "Mincha Ketanah": ["מִנְחָה קְטַנָּה"], "Plag HaMincha": ["פְּלַג הַמִּנְחָה"], "Sunset": ["שְׁקִיעַת הַחַמָּה"], "Bein HaShemashot": ["בֵּין הַשְּׁמָשׁוֹת"], "Tzeit HaKochavim": ["צֵאת הַכּוֹכָבִים"], "Biur Chametz": ["בִּעוּר חָמֵץ"], "Finish eating chametz": ["סוֹף זְמַן אֲכִילַת חָמֵץ"] } } };

var noNikudOverride = { "headers": { "plural-forms": "nplurals=2; plural=(n != 1);", "language": "he-x-NoNikud" }, "contexts": { "": { "Korach": ["קורח"], "Chukat": ["חוקת"], "Erev Yom Kippur": ["ערב יום כיפור"], "Yom Kippur": ["יום כיפור"], "Yom Kippur Katan": ["יום כיפור קטן"], "Pesach Shabbat Chol ha-Moed": ["שבת חול המועד פסח"], "Sukkot Shabbat Chol ha-Moed": ["שבת חול המועד סוכות"], "Erev Sukkot": ["ערב סוכות"], "Sukkot": ["סוכות"], "Sukkot I": ["סוכות א׳"], "Sukkot II": ["סוכות ב׳"], "Sukkot II (CH''M)": ["סוכות ב׳ (חוה״מ)"], "Sukkot III (CH''M)": ["סוכות ג׳ (חוה״מ)"], "Sukkot IV (CH''M)": ["סוכות ד׳ (חוה״מ)"], "Sukkot V (CH''M)": ["סוכות ה׳ (חוה״מ)"], "Sukkot VI (CH''M)": ["סוכות ו׳ (חוה״מ)"], "Sukkot VII (Hoshana Raba)": ["סוכות ז׳ (הושענא רבה)"] } } };

Locale.addTranslations('he', poHe);
Locale.addTranslations('ashkenazi', poAshkenazi);
/* Hebrew without nikkud */
const poHeNoNikud = Locale.copyLocaleNoNikud(poHe);
Locale.addTranslations('he-x-NoNikud', poHeNoNikud);
Locale.addTranslations('he-x-NoNikud', noNikudOverride);

/**
 * Holiday flags for Event. These flags are typically
 * combined using bitwise arithmetic to form a mask.
 */
const flags = {
    /** Chag, yontiff, yom tov */
    CHAG: 0x000001,
    /** Light candles before sundown */
    LIGHT_CANDLES: 0x000002,
    /** End of holiday (end of Yom Tov)  */
    YOM_TOV_ENDS: 0x000004,
    /** Observed only in the Diaspora (chutz l'aretz)  */
    CHUL_ONLY: 0x000008,
    /** Observed only in Israel */
    IL_ONLY: 0x000010,
    /** Light candles in the evening at Tzeit time (3 small stars) */
    LIGHT_CANDLES_TZEIS: 0x000020,
    /** Candle-lighting for Chanukah */
    CHANUKAH_CANDLES: 0x000040,
    /** Rosh Chodesh, beginning of a new Hebrew month */
    ROSH_CHODESH: 0x000080,
    /** Minor fasts like Tzom Tammuz, Ta'anit Esther, ... */
    MINOR_FAST: 0x000100,
    /** Shabbat Shekalim, Zachor, ... */
    SPECIAL_SHABBAT: 0x000200,
    /** Weekly sedrot on Saturdays */
    PARSHA_HASHAVUA: 0x000400,
    /** Daily page of Talmud (Bavli) */
    DAF_YOMI: 0x000800,
    /** Days of the Omer */
    OMER_COUNT: 0x001000,
    /** Yom HaShoah, Yom HaAtzma'ut, ... */
    MODERN_HOLIDAY: 0x002000,
    /** Yom Kippur and Tish'a B'Av */
    MAJOR_FAST: 0x004000,
    /** On the Saturday before Rosh Chodesh */
    SHABBAT_MEVARCHIM: 0x008000,
    /** Molad */
    MOLAD: 0x010000,
    /** Yahrzeit or Hebrew Anniversary */
    USER_EVENT: 0x020000,
    /** Daily Hebrew date ("11th of Sivan, 5780") */
    HEBREW_DATE: 0x040000,
    /** A holiday that's not major, modern, rosh chodesh, or a fast day */
    MINOR_HOLIDAY: 0x080000,
    /** Evening before a major or minor holiday */
    EREV: 0x100000,
    /** Chol haMoed, intermediate days of Pesach or Sukkot */
    CHOL_HAMOED: 0x200000,
    /** Mishna Yomi */
    MISHNA_YOMI: 0x400000,
    /** Yom Kippur Katan, minor day of atonement on the day preceeding each Rosh Chodesh */
    YOM_KIPPUR_KATAN: 0x800000,
    /** Daily page of Jerusalem Talmud (Yerushalmi) */
    YERUSHALMI_YOMI: 0x1000000,
    /** Nach Yomi */
    NACH_YOMI: 0x2000000,
    /** Daily Learning */
    DAILY_LEARNING: 0x4000000,
    /** Yizkor */
    YIZKOR: 0x8000000,
    /** BeHaB fast days on Monday, Thursday and Monday after Pesach and Sukkot */
    BEHAB: 0x10000000,
};
const flagToCategory = [
    [flags.MAJOR_FAST, 'holiday', 'major', 'fast'],
    [flags.CHANUKAH_CANDLES, 'holiday', 'minor'],
    [flags.HEBREW_DATE, 'hebdate'],
    [flags.MINOR_FAST, 'holiday', 'fast'],
    [flags.MINOR_HOLIDAY, 'holiday', 'minor'],
    [flags.MODERN_HOLIDAY, 'holiday', 'modern'],
    [flags.MOLAD, 'molad'],
    [flags.OMER_COUNT, 'omer'],
    [flags.PARSHA_HASHAVUA, 'parashat'], // backwards-compat
    [flags.ROSH_CHODESH, 'roshchodesh'],
    [flags.SHABBAT_MEVARCHIM, 'mevarchim'],
    [flags.SPECIAL_SHABBAT, 'holiday', 'shabbat'],
    [flags.USER_EVENT, 'user'],
    [flags.YIZKOR, 'yizkor'],
];
/**
 * Represents an Event with a title, date, and flags.
 *
 * Events are used to represent holidays, candle-lighting times,
 * Torah readings, Omer days, Hebrew dates, and more. Most concrete event
 * types are subclasses (e.g. {@link HolidayEvent}, {@link TimedEvent},
 * {@link ParshaEvent}, {@link OmerEvent}) and are produced by
 * {@link calendar}.
 *
 * To get the title of the event in a language other than English with
 * Sephardic transliterations, use the {@link Event.render} method.
 *
 * @example
 * import {Event, HDate, flags} from '@hebcal/core';
 * const ev = new Event(new HDate(6, 'Sivan', 5749), 'Shavuot', flags.CHAG);
 * ev.getDate().toString(); // '6 Sivan 5749'
 * ev.getDesc();             // 'Shavuot'
 * ev.render('he');          // 'שָׁבוּעוֹת'
 */
class Event {
    /**
     * Constructs Event
     * @param date Hebrew date event occurs
     * @param desc Description (not translated)
     * @param [mask=0] optional bitmask of holiday flags (see {@link flags})
     * @param [attrs={}] optional additional attributes (e.g. `eventTimeStr`, `cholHaMoedDay`)
     */
    constructor(date, desc, mask = 0, attrs) {
        if (!HDate.isHDate(date)) {
            throw new TypeError(`Invalid Event date: ${date}`);
        }
        if (typeof desc !== 'string') {
            throw new TypeError(`Invalid Event description: ${desc}`);
        }
        this.date = date;
        this.desc = desc;
        this.mask = +mask;
        if (typeof attrs === 'object' && attrs !== null) {
            Object.assign(this, attrs);
        }
    }
    /**
     * Hebrew date of this event
     */
    getDate() {
        return this.date;
    }
    /**
     * Gregorian date of this event
     */
    greg() {
        return this.date.greg();
    }
    /**
     * Untranslated title of this event. Note that these description
     * strings are always in English and will remain stable across releases.
     * To get the title of the event in another language, use the
     * `render()` method.
     */
    getDesc() {
        return this.desc;
    }
    /**
     * Bitmask of optional event flags. See {@link flags}
     */
    getFlags() {
        return this.mask;
    }
    /**
     * Returns (translated) description of this event
     * @example
     * const ev = new Event(new HDate(6, 'Sivan', 5749), 'Shavuot', flags.CHAG);
     * ev.render('en'); // 'Shavuot'
     * ev.render('he'); // 'שָׁבוּעוֹת'
     * ev.render('ashkenazi'); // 'Shavuos'
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    render(locale) {
        return Locale.gettext(this.desc, locale);
    }
    /**
     * Returns a brief (translated) description of this event.
     *
     * For most events this is the same as {@link render}. Some subclasses
     * (e.g. {@link CandleLightingEvent}, {@link HavdalahEvent},
     * {@link OmerEvent}) produce shorter text without an attached time or
     * extra qualifier — useful for compact UI display.
     * @example
     * import {CandleLightingEvent} from '@hebcal/core';
     * // For a regular Event, renderBrief() == render():
     * const ev = new Event(new HDate(6, 'Sivan', 5749), 'Shavuot', flags.CHAG);
     * ev.renderBrief('en'); // 'Shavuot'
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    renderBrief(locale) {
        return this.render(locale);
    }
    /**
     * Returns the event's emoji character (e.g. `🕯️`, `🕎`, `🇮🇱`, `🍏🍯`),
     * or `null` if no emoji is associated with this event.
     * Subclasses override this to provide holiday-specific emoji.
     */
    getEmoji() {
        return this.emoji || null;
    }
    /**
     * Returns a simplified (untranslated) description for this event, suitable
     * for grouping related events under a single name.
     *
     * For example, {@link HolidayEvent} strips qualifiers so that
     * `"Erev Pesach"` → `"Pesach"` and `"Sukkot III (CH''M)"` → `"Sukkot"`.
     * For many events the basename and the event description are identical.
     * @example
     * import {HolidayEvent, HDate, months, flags} from '@hebcal/core';
     * const ev = new HolidayEvent(
     *   new HDate(14, months.NISAN, 5784), 'Erev Pesach', flags.EREV);
     * ev.getDesc();    // 'Erev Pesach'
     * ev.basename();   // 'Pesach'
     */
    basename() {
        return this.getDesc();
    }
    /**
     * Returns a URL to hebcal.com or sefaria.org for more detail on the event,
     * or `undefined` for events with no detail page.
     *
     * Subclasses such as {@link HolidayEvent}, {@link ChanukahEvent},
     * {@link AsaraBTevetEvent}, {@link ParshaEvent}, and {@link OmerEvent}
     * override this with their own URL patterns.
     */
    url() {
        return undefined;
    }
    /**
     * Is this event observed in Israel?
     * @example
     * const ev1 = new Event(new HDate(7, 'Sivan', 5749), 'Shavuot II', flags.CHAG | flags.CHUL_ONLY);
     * ev1.observedInIsrael(); // false
     * const ev2 = new Event(new HDate(26, 'Kislev', 5749), 'Chanukah: 3 Candles', 0);
     * ev2.observedInIsrael(); // true
     */
    observedInIsrael() {
        return !(this.mask & flags.CHUL_ONLY);
    }
    /**
     * Is this event observed in the Diaspora?
     * @example
     * const ev1 = new Event(new HDate(7, 'Sivan', 5749), 'Shavuot II', flags.CHAG | flags.CHUL_ONLY);
     * ev1.observedInDiaspora(); // true
     * const ev2 = new Event(new HDate(26, 'Kislev', 5749), 'Chanukah: 3 Candles', 0);
     * ev2.observedInDiaspora(); // true
     */
    observedInDiaspora() {
        return !(this.mask & flags.IL_ONLY);
    }
    /**
     * Is this event observed in Israel/Diaspora?
     * @example
     * const ev1 = new Event(new HDate(7, 'Sivan', 5749), 'Shavuot II', flags.CHAG | flags.CHUL_ONLY);
     * ev1.observedIn(false); // true
     * ev1.observedIn(true); // false
     * const ev2 = new Event(new HDate(26, 'Kislev', 5749), 'Chanukah: 3 Candles', 0);
     * ev2.observedIn(false); // true
     * ev2.observedIn(true); // true
     * @param il
     */
    observedIn(il) {
        return il ? this.observedInIsrael() : this.observedInDiaspora();
    }
    /**
     * Returns an array of category strings classifying this event, derived
     * from its {@link flags} bitmask. The first element is the broad category
     * (e.g. `'holiday'`, `'roshchodesh'`, `'parashat'`, `'omer'`), followed
     * by zero or more refinements (e.g. `'major'`, `'minor'`, `'fast'`).
     *
     * Returns `['unknown']` if no flag maps to a known category.
     * @example
     * import {Event, HDate, flags} from '@hebcal/core';
     * new Event(new HDate(10, 'Tishrei', 5784), 'Yom Kippur', flags.MAJOR_FAST)
     *   .getCategories(); // ['holiday', 'major', 'fast']
     * new Event(new HDate(1, 'Shvat', 5784), 'Rosh Chodesh Sh\'vat', flags.ROSH_CHODESH)
     *   .getCategories(); // ['roshchodesh']
     */
    getCategories() {
        const mask = this.getFlags();
        for (const attrs of flagToCategory) {
            const attr0 = attrs[0];
            if (mask & attr0) {
                return attrs.slice(1);
            }
        }
        return ['unknown'];
    }
}

/** Daily Hebrew date ("11th of Sivan, 5780") */
class HebrewDateEvent extends Event {
    /**
     * @param date
     */
    constructor(date) {
        super(date, date.toString(), flags.HEBREW_DATE);
    }
    /**
     * @param [locale] Optional locale name (defaults to empty locale)
     * @example
     * import {HDate, HebrewDateEvent, months} from '@hebcal/core';
     *
     * const hd = new HDate(15, months.CHESHVAN, 5769);
     * const ev = new HebrewDateEvent(hd);
     * console.log(ev.render('en')); // '15th of Cheshvan, 5769'
     * console.log(ev.render('he')); // 'ט״ו חֶשְׁוָן תשס״ט'
     */
    render(locale) {
        const locale1 = locale?.toLowerCase();
        const locale0 = locale1 ?? 'en';
        const hd = this.getDate();
        switch (locale0) {
            case 'h':
            case 'he':
                return hd.renderGematriya(false);
            case 'he-x-nonikud':
                return hd.renderGematriya(true);
            default:
                return hd.render(locale0, true);
        }
    }
    /**
     * @private
     * @param locale
     */
    renderBriefHebrew(locale) {
        const hd = this.getDate();
        const dd = hd.getDate();
        const mm = Locale.gettext(hd.getMonthName(), locale);
        return gematriya(dd) + ' ' + mm;
    }
    /**
     * @param [locale] Optional locale name (defaults to empty locale)
     * @example
     * import {HDate, HebrewDateEvent, months} from '@hebcal/core';
     *
     * const hd = new HDate(15, months.CHESHVAN, 5769);
     * const ev = new HebrewDateEvent(hd);
     * console.log(ev.renderBrief()); // '15th of Cheshvan'
     * console.log(ev.renderBrief('he')); // 'ט״ו חֶשְׁוָן'
     */
    renderBrief(locale) {
        const locale1 = locale?.toLowerCase();
        const locale0 = locale1 ?? 'en';
        const hd = this.getDate();
        if (hd.getMonth() === months.TISHREI && hd.getDate() === 1) {
            return this.render(locale0);
        }
        switch (locale0) {
            case 'h':
            case 'he':
            case 'he-x-nonikud':
                return this.renderBriefHebrew(locale0);
            default:
                return hd.render(locale0, false);
        }
    }
}

// Low-Level
const expectedPositive = (entityName, num) => `Non-positive ${entityName}: ${num}`;
const expectedFinite = (entityName, num) => `Non-finite ${entityName}: ${num}`;
const forbiddenBigIntToNumber = (entityName) => `Cannot convert bigint to ${entityName}`;
const invalidObject = 'Invalid object';
const numberOutOfRange = (entityName, val, min, max) => invalidEntity$1(entityName, val) + `; must be between ${min}-${max}`;
// Entity/Fields/Bags
const invalidEntity$1 = (fieldName, val) => `Invalid ${fieldName}: ${val}`;

const nanoInMicro$1 = 1_000;
const nanoInMilli$1 = 1_000_000;
const nanoInSec$1 = 1_000_000_000;
const nanoInMinute$1 = 60_000_000_000;
const nanoInHour$1 = 3_600_000_000_000;
function normalizeOptions(options) {
    if (options === undefined) {
        return Object.create(null);
    }
    return requireObjectLike(options);
}
function toFiniteNumber(arg, entityName = 'number') {
    if (typeof arg === 'bigint') {
        throw new TypeError(forbiddenBigIntToNumber(entityName));
    }
    arg = Number(arg);
    if (!Number.isFinite(arg)) {
        throw new RangeError(expectedFinite(entityName, arg));
    }
    return arg;
}
function toIntegerWithTrunc(arg, entityName) {
    return Math.trunc(toFiniteNumber(arg, entityName)) || 0; // ensure no -0
}
function toPositiveIntegerWithTruncation(arg, entityName) {
    return requireNumberIsPositive(toIntegerWithTrunc(arg, entityName), entityName);
}
/*
Already known to be number.
*/
function requireNumberIsPositive(num, entityName = 'number') {
    if (num <= 0) {
        throw new RangeError(expectedPositive(entityName, num));
    }
    return num;
}
/*
min/max are inclusive
*/
function constrainToRange$1(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
function isObjectLike$1(arg) {
    return arg !== null && (typeof arg === 'object' || typeof arg === 'function');
}
function requireObjectLike(arg) {
    if (!isObjectLike$1(arg)) {
        throw new TypeError(invalidObject);
    }
    return arg;
}

const invalidEntity = invalidEntity$1;

const missingField = fieldName => `Missing ${fieldName}`;

const noValidFields = validFields => "No valid fields: " + validFields.join();

const invalidBag = "Invalid bag";

const invalidChoice = (fieldName, val, choiceMap) => invalidEntity$1(fieldName, val) + "; must be " + Object.keys(choiceMap).join();

const forbiddenValueOf$1 = "Cannot use valueOf";

const invalidCallingContext = "Invalid calling context";

const missingYear = allowEra => "Missing year" + (allowEra ? "/era/eraYear" : "");

const invalidLeapMonth = "Invalid leap month";

const invalidCalendar = calendarId => invalidEntity$1("Calendar", calendarId);

const exoticCalendarRequired = (calendarId, remedy) => `Unknown calendar ${calendarId}; might need ${remedy}`;

const invalidTimeZone = calendarId => invalidEntity$1("TimeZone", calendarId);

const outOfBoundsDate = "Out-of-bounds date";

const failedParse = s => `Cannot parse: ${s}`;

const invalidSubstring = substring => `Invalid substring: ${substring}`;

const invalidFormatType = branding => `Cannot format ${branding}`;

const mismatchingFormatTypes = "Mismatching types for formatting";

const constrainToRange = constrainToRange$1;

const isObjectLike = isObjectLike$1;

function throwRangeError(message) {
  throw new RangeError(message);
}

function throwTypeError(message) {
  throw new TypeError(message);
}

function clampProp(props, propName, min, max, overflow) {
  return clampEntity(propName, ((props, propName) => {
    const propVal = props[propName];
    return void 0 === propVal && throwTypeError(missingField(propName)), propVal;
  })(props, propName), min, max, overflow);
}

function clampEntity(entityName, num, min, max, overflow, choices) {
  const clamped = constrainToRange(num, min, max);
  return overflow && num !== clamped && throwRangeError(((entityName, val, min, max, choices) => choices ? numberOutOfRange(entityName, choices[val], choices[min], choices[max]) : numberOutOfRange(entityName, val, min, max))(entityName, num, min, max, choices)), 
  clamped;
}

function memoize(generator, MapClass = Map) {
  const map = new MapClass;
  return (key, ...otherArgs) => {
    if (map.has(key)) {
      return map.get(key);
    }
    const val = generator(key, ...otherArgs);
    return map.set(key, val), val;
  };
}

const createNameDescriptors = name => createPropDescriptors({
  name: name
}, 1);

const createPropDescriptors = (propVals, readonly) => mapProps(value => ({
  value: value,
  configurable: 1,
  writable: !readonly
}), propVals);

const createStringTagDescriptors = value => ({
  [Symbol.toStringTag]: {
    value: value,
    configurable: 1
  }
});

function mapProps(transformer, props) {
  const res = {};
  for (const propName in props) {
    res[propName] = transformer(props[propName], propName);
  }
  return res;
}

function zipPropsConst(propNames, propVal) {
  const res = {};
  for (const propName of propNames) {
    res[propName] = propVal;
  }
  return res;
}

function createPropGetters(propNames) {
  const getters = {};
  for (const propName of propNames) {
    getters[propName] = slots => slots[propName];
  }
  return getters;
}

function pluckProps(propNames, props, dest = Object.create(null)) {
  for (const propName of propNames) {
    dest[propName] = props[propName];
  }
  return dest;
}

function allPropsEqual(propNames, props0, props1) {
  for (const propName of propNames) {
    if (props0[propName] !== props1[propName]) {
      return 0;
    }
  }
  return 1;
}

function zeroOutProps(propNames, clearUntilI, props) {
  const copy = {
    ...props
  };
  for (let i = 0; i < clearUntilI; i++) {
    copy[propNames[i]] = 0;
  }
  return copy;
}

function bindArgs(f, ...boundArgs) {
  return (...dynamicArgs) => f(...boundArgs, ...dynamicArgs);
}

function identity(arg) {
  return arg;
}

function noop() {}

function capitalize(s) {
  return s[0].toUpperCase() + s.substring(1);
}

function sortStrings(...strss) {
  return [].concat(...strss).sort();
}

function createRegExp(meat) {
  return new RegExp(`^${meat}$`, "i");
}

function parseSubsecNano(fracStr) {
  return parseInt(fracStr.padEnd(9, "0"));
}

function parseSign(s) {
  return s && "+" !== s ? -1 : 1;
}

function parseInt0(s) {
  return void 0 === s ? 0 : parseInt(s);
}

function padNumber(digits, num) {
  return String(num).padStart(digits, "0");
}

const padNumber2 = /*@__PURE__*/ bindArgs(padNumber, 2);

function compareNumbers(a, b) {
  return Math.sign(a - b);
}

function compareBigInts(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function divFloorBigInt(num, denom) {
  const whole = num / denom;
  return num % denom < 0n ? whole - 1n : whole;
}

function divModFloorBigInt(num, divisor) {
  const quotient = divFloorBigInt(num, divisor);
  return [ quotient, num - quotient * divisor ];
}

function divModFloor(num, divisor) {
  return [ Math.floor(num / divisor), modFloor(num, divisor) ];
}

function modFloor(num, divisor) {
  return (num % divisor + divisor) % divisor;
}

function divTrunc(num, divisor) {
  return Math.trunc(num / divisor) || 0;
}

function modTrunc(num, divisor) {
  return num % divisor || 0;
}

function fabricateNearHalfFraction(halfCompare, sign = 1) {
  return sign * (.5 + halfCompare / 5);
}

function hasHalf(num) {
  return .5 === Math.abs(num % 1);
}

const isoCalendarId = "iso8601";

const gregoryCalendarId = "gregory";

const gregoryEraOrigins = {
  "bce": -1,
  "ce": 0
};

function normalizeEraName(era) {
  const normalized = era.normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g, "");
  return "bc" === normalized || "b" === normalized ? "bce" : "ad" === normalized || "a" === normalized ? "ce" : normalized;
}

const isoCalendarImpl = void 0;

const gregoryCalendarImpl = 0;

function getCalendarSlotId(calendar) {
  return calendar === isoCalendarImpl ? "iso8601" : 0 === calendar ? "gregory" : calendar.id;
}

const monthCodeRegExp = /^M(\d{2})(L?)$/;

function parseMonthCode(monthCode) {
  const m = monthCodeRegExp.exec(monthCode);
  return m || throwRangeError((monthCode => `Invalid monthCode: ${monthCode}`)(monthCode)), 
  [ parseInt(m[1]), Boolean(m[2]) ];
}

function formatMonthCode(monthCodeNumber, isLeapMonth) {
  return "M" + padNumber2(monthCodeNumber) + (isLeapMonth ? "L" : "");
}

function monthCodeNumberToMonth(monthCodeNumber, isLeapMonth, leapMonth) {
  return monthCodeNumber + (isLeapMonth || leapMonth && monthCodeNumber >= leapMonth ? 1 : 0);
}

const unitNameMap = {
  nanosecond: 0,
  microsecond: 1,
  millisecond: 2,
  second: 3,
  minute: 4,
  hour: 5,
  day: 6,
  week: 7,
  month: 8,
  year: 9
};

const unitNamesAsc = /*@__PURE__*/ Object.keys(unitNameMap);

const nanoInMicro = nanoInMicro$1;

const nanoInMilli = nanoInMilli$1;

const nanoInSec = nanoInSec$1;

const nanoInMinute = nanoInMinute$1;

const nanoInHour = nanoInHour$1;

const nanoInUtcDay = 864e11;

const unitNanoMap = [ 1, nanoInMicro, nanoInMilli, nanoInSec, nanoInMinute, nanoInHour, nanoInUtcDay ];

const bigNanoInMicro = /*@__PURE__*/ BigInt(nanoInMicro);

const bigNanoInMilli = /*@__PURE__*/ BigInt(nanoInMilli);

const bigNanoInSec = /*@__PURE__*/ BigInt(nanoInSec);

const bigNanoInMinute = /*@__PURE__*/ BigInt(nanoInMinute);

const bigNanoInHour = /*@__PURE__*/ BigInt(nanoInHour);

const bigNanoInUtcDay = /*@__PURE__*/ BigInt(nanoInUtcDay);

function divideBigNanoToExactNumber(bigNano, divisorNano) {
  const days = Number(bigNano / bigNanoInUtcDay);
  const timeNano = Number(bigNano % bigNanoInUtcDay);
  return days * (nanoInUtcDay / divisorNano) + (Math.trunc(timeNano / divisorNano) + timeNano % divisorNano / divisorNano);
}

const timeFieldNamesAsc = /*@__PURE__*/ unitNamesAsc.slice(0, 6);

const timeGetters = /*@__PURE__*/ createPropGetters(timeFieldNamesAsc);

const yearFieldNamesAsc = [ "year" ];

const dayFieldNamesAsc = [ "day" ];

const calendarDateFieldNamesAsc = [ "day", "month", "year" ];

const offsetFieldNames = [ "offset" ];

const timeZoneFieldNames = [ "timeZone" ];

const eraYearFieldNames = [ "era", "eraYear" ];

const allYearFieldNames = [ "era", "eraYear", "year" ];

const monthFieldNames = [ "month", "monthCode" ];

const monthDayFieldNames = [ "day", "month", "monthCode" ];

const timeFieldNamesAlpha = /*@__PURE__*/ sortStrings(timeFieldNamesAsc);

const yearFieldNamesWithEraAlpha = /*@__PURE__*/ sortStrings(eraYearFieldNames, yearFieldNamesAsc);

const yearMonthFieldNamesAlpha = /*@__PURE__*/ sortStrings(monthFieldNames, yearFieldNamesAsc);

const yearMonthFieldNamesWithEraAlpha = /*@__PURE__*/ sortStrings(eraYearFieldNames, yearMonthFieldNamesAlpha);

const yearMonthCodeFieldNamesAlpha = /*@__PURE__*/ sortStrings([ "monthCode" ], yearFieldNamesAsc);

const yearMonthCodeFieldNamesWithEraAlpha = /*@__PURE__*/ sortStrings(eraYearFieldNames, yearMonthCodeFieldNamesAlpha);

const monthCodeDayFieldNamesAlpha = /*@__PURE__*/ sortStrings(dayFieldNamesAsc, [ "monthCode" ]);

const dateFieldNamesAlpha = /*@__PURE__*/ sortStrings(dayFieldNamesAsc, yearMonthFieldNamesAlpha);

const dateFieldNamesWithEraAlpha = /*@__PURE__*/ sortStrings(dayFieldNamesAsc, eraYearFieldNames, yearMonthFieldNamesAlpha);

const dateTimeFieldNamesAlpha = /*@__PURE__*/ sortStrings(dateFieldNamesAlpha, timeFieldNamesAsc);

const dateTimeFieldNamesWithEraAlpha = /*@__PURE__*/ sortStrings(dateFieldNamesWithEraAlpha, timeFieldNamesAsc);

const dateTimeAndOffsetFieldNamesAlpha = /*@__PURE__*/ sortStrings(dateFieldNamesAlpha, timeFieldNamesAsc, offsetFieldNames);

const dateTimeAndOffsetFieldNamesWithEraAlpha = /*@__PURE__*/ sortStrings(dateFieldNamesWithEraAlpha, timeFieldNamesAsc, offsetFieldNames);

const dateTimeAndZoneFieldNamesAlpha = /*@__PURE__*/ sortStrings(dateFieldNamesAlpha, timeFieldNamesAsc, offsetFieldNames, timeZoneFieldNames);

const dateTimeAndZoneFieldNamesWithEraAlpha = /*@__PURE__*/ sortStrings(dateFieldNamesWithEraAlpha, timeFieldNamesAsc, offsetFieldNames, timeZoneFieldNames);

const yearMonthCodeDayFieldNamesAlpha = /*@__PURE__*/ sortStrings(dayFieldNamesAsc, yearMonthCodeFieldNamesAlpha);

const yearMonthCodeDayFieldNamesWithEraAlpha = /*@__PURE__*/ sortStrings(dayFieldNamesAsc, eraYearFieldNames, yearMonthCodeFieldNamesAlpha);

const timeFieldDefaults = /*@__PURE__*/ zipPropsConst(timeFieldNamesAsc, 0);

function validateTimeFields(timeFields) {
  return constrainTimeFields(timeFields, 1), timeFields;
}

const maxValues = {
  hour: 23,
  minute: 59,
  second: 59
};

function constrainTimeFields(timeFields, overflow) {
  const constrainedFields = {};
  for (const fieldName of timeFieldNamesAsc) {
    constrainedFields[fieldName] = clampEntity(fieldName, timeFields[fieldName], 0, maxValues[fieldName] || 999, overflow);
  }
  return constrainedFields;
}

function timeFieldsToNano(timeFields) {
  return timeFieldsToSec(timeFields) * nanoInSec + timeFieldsToSubsecNano(timeFields);
}

function timeFieldsToMilli(timeFields) {
  return 1e3 * timeFieldsToSec(timeFields) + timeFields.millisecond;
}

function timeFieldsToSec(timeFields) {
  return 3600 * timeFields.hour + 60 * timeFields.minute + timeFields.second;
}

function timeFieldsToSubsecNano(timeFields) {
  return timeFields.millisecond * nanoInMilli + timeFields.microsecond * nanoInMicro + timeFields.nanosecond;
}

function nanoToTimeAndDay(nano) {
  const [dayDelta, timeNano] = divModFloor(nano, nanoInUtcDay);
  return [ nanoToTimeFields(timeNano), dayDelta ];
}

function nanoToTimeFields(timeNano) {
  const [timeMilli, nanoAfterMilli] = divModFloor(timeNano, nanoInMilli);
  const [microsecond, nanosecond] = divModFloor(nanoAfterMilli, nanoInMicro);
  return milliToTimeFields(timeMilli, microsecond, nanosecond);
}

function milliToTimeFields(timeMilli, microsecond = 0, nanosecond = 0) {
  const [hour, milliAfterHour] = divModFloor(timeMilli, 36e5);
  const [minute, milliAfterMinute] = divModFloor(milliAfterHour, 6e4);
  const [second, millisecond] = divModFloor(milliAfterMinute, 1e3);
  return {
    hour: hour,
    minute: minute,
    second: second,
    millisecond: millisecond,
    microsecond: microsecond,
    nanosecond: nanosecond
  };
}

function epochNanoToSecMod(epochNano) {
  const [epochSec, nano] = divModFloorBigInt(epochNano, bigNanoInSec);
  return [ Number(epochSec), Number(nano) ];
}

function isoDateTimeToEpochNano(isoDateTime) {
  return isoDateToEpochNano(isoDateTime) + BigInt(timeFieldsToNano(isoDateTime));
}

function isoDateTimeToEpochMilli(isoDateTime) {
  return isoDateToEpochMilli(isoDateTime) + timeFieldsToMilli(isoDateTime);
}

function isoDateToEpochNano(isoDate) {
  return BigInt(isoDateToEpochDays(isoDate)) * bigNanoInUtcDay;
}

function isoDateToEpochMilli(isoDate) {
  return 864e5 * isoDateToEpochDays(isoDate);
}

function isoDateToEpochDays(isoDate) {
  return isoArgsToEpochDays(isoDate.year, isoDate.month, isoDate.day);
}

function isoArgsToEpochDays(isoYear, isoMonth = 1, isoDay = 1) {
  const monthIndex = isoMonth - 1;
  return isoYear += Math.floor(monthIndex / 12), isoMonth = modFloor(monthIndex, 12), 
  Date.UTC(isoYear % 400 - 400, isoMonth, 0) / 864e5 + 146097 * (divTrunc(isoYear, 400) + 1) + isoDay;
}

function epochNanoToIsoDateTime(epochNano) {
  const [epochDays, nanoAfterDay] = divModFloorBigInt(epochNano, bigNanoInUtcDay);
  return {
    ...epochDaysToIsoDate(Number(epochDays)),
    ...nanoToTimeFields(Number(nanoAfterDay))
  };
}

function epochDaysToIsoDate(epochDays) {
  const legacyDate = new Date(864e5 * modFloor(epochDays, 146097));
  return {
    year: legacyDate.getUTCFullYear() + 400 * Math.floor(epochDays / 146097),
    month: legacyDate.getUTCMonth() + 1,
    day: legacyDate.getUTCDate()
  };
}

const isoEpochFirstLeapYear = 1972;

function computeIsoMonthCodeParts(month) {
  return [ month, 0 ];
}

function computeIsoYearMonthFieldsForMonthDay(monthCodeNumber, isLeapMonth) {
  if (!isLeapMonth) {
    return {
      year: 1972,
      month: monthCodeNumber
    };
  }
}

function computeIsoFieldsFromParts(year, month, day) {
  return {
    year: year,
    month: month,
    day: day
  };
}

function computeIsoDaysInMonth(year, month) {
  switch (month) {
   case 2:
    return computeIsoInLeapYear(year) ? 29 : 28;

   case 4:
   case 6:
   case 9:
   case 11:
    return 30;
  }
  return 31;
}

function computeIsoDaysInYear(year) {
  return computeIsoInLeapYear(year) ? 366 : 365;
}

function computeIsoInLeapYear(year) {
  return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
}

function addIsoMonths(year, month, monthDelta) {
  return year += divTrunc(monthDelta, 12), (month += modTrunc(monthDelta, 12)) < 1 ? (year--, 
  month += 12) : month > 12 && (year++, month -= 12), {
    year: year,
    month: month
  };
}

function diffIsoMonthSlots(year0, month0, year1, month1) {
  return 12 * (year1 - year0) + month1 - month0;
}

function computeIsoDayOfWeek(isoDateFields) {
  return modFloor(isoArgsToEpochDays(isoDateFields.year, isoDateFields.month, isoDateFields.day) + 4, 7) || 7;
}

function computeIsoDayOfYear(isoDateFields) {
  return isoArgsToEpochDays(isoDateFields.year, isoDateFields.month, isoDateFields.day) - isoArgsToEpochDays(isoDateFields.year) + 1;
}

function computeIsoWeekFields(isoDateFields) {
  let yearOfWeek = isoDateFields.year;
  let weekOfYear = Math.floor((computeIsoDayOfYear(isoDateFields) - computeIsoDayOfWeek(isoDateFields) + 10) / 7);
  let weeksInYear = computeIsoWeeksInYear(yearOfWeek);
  return weekOfYear < 1 ? weekOfYear = weeksInYear = computeIsoWeeksInYear(--yearOfWeek) : weekOfYear > weeksInYear && (weekOfYear = 1, 
  weeksInYear = computeIsoWeeksInYear(++yearOfWeek)), {
    weekOfYear: weekOfYear,
    yearOfWeek: yearOfWeek,
    Be: weeksInYear
  };
}

function computeIsoWeeksInYear(year) {
  const y0DayOfWeek = computeIsoDayOfWeek({
    year: year,
    month: 1,
    day: 1
  });
  return 4 === y0DayOfWeek || 3 === y0DayOfWeek && computeIsoInLeapYear(year) ? 53 : 52;
}

function computeGregoryEraFields({year: year}) {
  return year < 1 ? {
    era: "bce",
    eraYear: 1 - year
  } : {
    era: "ce",
    eraYear: year
  };
}

function validateIsoDateTimeFields(isoDateTime) {
  return validateIsoDateFields(isoDateTime), validateTimeFields(isoDateTime);
}

function validateIsoDateFields(isoInternals) {
  return constrainIsoDateFields(isoInternals, 1), isoInternals;
}

function isIsoDateFieldsValid(isoDate) {
  return allPropsEqual(calendarDateFieldNamesAsc, isoDate, constrainIsoDateFields(isoDate));
}

function constrainIsoDateFields(isoDate, overflow) {
  const {year: year} = isoDate;
  const month = clampProp(isoDate, "month", 1, 12, overflow);
  return {
    year: year,
    month: month,
    day: clampProp(isoDate, "day", 1, computeIsoDaysInMonth(year, month), overflow)
  };
}

function computeCalendarDateFields(calendar, isoDate) {
  return calendar ? calendar.ae(isoDate) : isoDate;
}

function computeCalendarMonthCodeParts(calendar, year, month) {
  return calendar ? calendar.L(year, month) : computeIsoMonthCodeParts(month);
}

function computeCalendarEraFields(calendar, isoDate) {
  return 0 === calendar ? computeGregoryEraFields(isoDate) : calendar && calendar.h?.(isoDate) || {};
}

function computeCalendarIsoFieldsFromParts(calendar, year, month, day) {
  return calendar ? calendar.de(year, month, day) : computeIsoFieldsFromParts(year, month, day);
}

function computeCalendarMonthsInYearForYear(calendar, year) {
  return calendar ? calendar.j(year) : 12;
}

function computeCalendarDaysInMonthForYearMonth(calendar, year, month) {
  return calendar ? calendar.o(year, month) : computeIsoDaysInMonth(year, month);
}

function computeCalendarMonthCode(calendar, isoDate) {
  const {year: year, month: month} = computeCalendarDateFields(calendar, isoDate);
  const [monthCodeNumber, isLeapMonth] = computeCalendarMonthCodeParts(calendar, year, month);
  return formatMonthCode(monthCodeNumber, isLeapMonth);
}

function computeCalendarInLeapYear(calendar, isoDate) {
  const {year: year} = computeCalendarDateFields(calendar, isoDate);
  return calendar ? calendar.q(year) : computeIsoInLeapYear(year);
}

function computeCalendarMonthsInYear(calendar, isoDate) {
  const {year: year} = computeCalendarDateFields(calendar, isoDate);
  return computeCalendarMonthsInYearForYear(calendar, year);
}

function computeCalendarDaysInMonth(calendar, isoDate) {
  const {year: year, month: month} = computeCalendarDateFields(calendar, isoDate);
  return computeCalendarDaysInMonthForYearMonth(calendar, year, month);
}

function computeCalendarDaysInYear(calendar, isoDate) {
  const {year: year} = computeCalendarDateFields(calendar, isoDate);
  return calendar ? calendar.i(year) : computeIsoDaysInYear(year);
}

function computeCalendarDayOfYear(calendar, isoDate) {
  if (!calendar) {
    return computeIsoDayOfYear(isoDate);
  }
  const {year: year} = computeCalendarDateFields(calendar, isoDate);
  const yearStartIsoDate = computeCalendarIsoFieldsFromParts(calendar, year, 1, 1);
  return isoDateToEpochDays(isoDate) - isoDateToEpochDays(yearStartIsoDate) + 1;
}

function computeCalendarWeekOfYear(calendar, isoDate) {
  return calendar === isoCalendarImpl ? computeIsoWeekFields(isoDate).weekOfYear : void 0;
}

function computeCalendarYearOfWeek(calendar, isoDate) {
  return calendar === isoCalendarImpl ? computeIsoWeekFields(isoDate).yearOfWeek : void 0;
}

const durationFieldNamesAsc = /*@__PURE__*/ unitNamesAsc.map(unitName => unitName + "s");

const durationGetters = /*@__PURE__*/ createPropGetters(durationFieldNamesAsc);

const durationFieldNamesAlpha = /*@__PURE__*/ sortStrings(durationFieldNamesAsc);

const durationTimeFieldNamesAsc = /*@__PURE__*/ durationFieldNamesAsc.slice(0, 6);

const durationDateFieldNamesAsc = /*@__PURE__*/ durationFieldNamesAsc.slice(6);

const durationCalendarFieldNamesAsc = /*@__PURE__*/ durationDateFieldNamesAsc.slice(1);

const durationFieldDefaults = /*@__PURE__*/ zipPropsConst(durationFieldNamesAsc, 0);

const durationTimeFieldDefaults = /*@__PURE__*/ zipPropsConst(durationTimeFieldNamesAsc, 0);

const clearDurationFields = /*@__PURE__*/ bindArgs(zeroOutProps, durationFieldNamesAsc);

function requirePropDefined(optionName, optionVal) {
  return null == optionVal && throwRangeError(missingField(optionName)), optionVal;
}

const requireString = /*@__PURE__*/ bindArgs(requireType, "string");

function requireType(typeName, arg, entityName = typeName) {
  return typeof arg !== typeName && throwTypeError(invalidEntity(entityName, arg)), 
  arg;
}

function requireNumberIsInteger(num, entityName = "number") {
  return Number.isInteger(num) || throwRangeError(((entityName, num) => `Non-integer ${entityName}: ${num}`)(entityName, num)), 
  num || 0;
}

function toString(arg) {
  return "symbol" == typeof arg && throwTypeError("Cannot convert Symbol to string"), 
  String(arg);
}

function toStringViaPrimitive(arg, entityName) {
  return isObjectLike$1(arg) ? String(arg) : requireString(arg, entityName);
}

function toBigInt(bi) {
  return "boolean" == typeof bi ? BigInt(bi ? 1 : 0) : "string" == typeof bi ? BigInt(bi) : ("bigint" != typeof bi && throwTypeError(`Invalid bigint: ${bi}`), 
  bi);
}

function toStrictInteger(arg, entityName) {
  return requireNumberIsInteger(toFiniteNumber(arg, entityName), entityName);
}

function normalizeOptionsOrString(options, optionName) {
  return "string" == typeof options ? ((optionName, optionVal) => {
    const res = Object.create(null);
    return res[optionName] = optionVal, res;
  })(optionName, options) : requireObjectLike(options);
}

const smallestUnitStr = "smallestUnit";

const overflowMap = {
  constrain: 0,
  reject: 1
};

const epochDisambigMap = {
  compatible: 0,
  reject: 1,
  earlier: 2,
  later: 3
};

const offsetDisambigMap = {
  reject: 0,
  use: 1,
  prefer: 2,
  ignore: 3
};

const calendarDisplayMap = {
  auto: 0,
  never: 1,
  critical: 2,
  always: 3
};

const timeZoneDisplayMap = {
  auto: 0,
  never: 1,
  critical: 2
};

const offsetDisplayMap = {
  auto: 0,
  never: 1
};

const roundingModeMap = {
  floor: 0,
  halfFloor: 1,
  ceil: 2,
  halfCeil: 3,
  trunc: 4,
  halfTrunc: 5,
  expand: 6,
  halfExpand: 7,
  halfEven: 8
};

const roundingModeFuncs = [ Math.floor, num => hasHalf(num) ? Math.floor(num) : Math.round(num), Math.ceil, num => hasHalf(num) ? Math.ceil(num) : Math.round(num), Math.trunc, num => hasHalf(num) ? Math.trunc(num) || 0 : Math.round(num), num => num < 0 ? Math.floor(num) : Math.ceil(num), num => Math.sign(num) * Math.round(Math.abs(num)) || 0, num => hasHalf(num) ? (num = Math.trunc(num) || 0) + num % 2 : Math.round(num) ];

const directionMap = {
  previous: -1,
  next: 1
};

function coerceRoundingIncInteger(options) {
  const roundingInc = options.roundingIncrement;
  return void 0 === roundingInc ? 1 : toIntegerWithTrunc(roundingInc, "roundingIncrement");
}

function coerceFractionalSecondDigits(options) {
  let subsecDigits = options.fractionalSecondDigits;
  if (void 0 !== subsecDigits) {
    if ("number" != typeof subsecDigits) {
      if ("auto" === toString(subsecDigits)) {
        return;
      }
      throwRangeError(invalidEntity("fractionalSecondDigits", subsecDigits));
    }
    subsecDigits = clampEntity("fractionalSecondDigits", Math.floor(subsecDigits), 0, 9, 1);
  }
  return subsecDigits;
}

function coerceUnitOption(optionName, options, minUnit = 0, ensureDefined) {
  let unitStr = options[optionName];
  if (void 0 === unitStr) {
    return ensureDefined ? minUnit : void 0;
  }
  if (unitStr = toString(unitStr), "auto" === unitStr) {
    return ensureDefined ? minUnit : null;
  }
  let unit = unitNameMap[unitStr];
  return void 0 === unit && (unit = durationFieldNamesAsc.indexOf(unitStr)), unit < 0 && throwRangeError(invalidChoice(optionName, unitStr, unitNameMap)), 
  unit;
}

function coerceChoiceOption(optionName, enumNameMap, options, defaultChoice = 0) {
  const enumArg = options[optionName];
  if (void 0 === enumArg) {
    return defaultChoice;
  }
  const enumStr = toString(enumArg);
  const enumNum = enumNameMap[enumStr];
  return void 0 === enumNum && throwRangeError(invalidChoice(optionName, enumStr, enumNameMap)), 
  enumNum;
}

const coerceSmallestUnit = /*@__PURE__*/ bindArgs(coerceUnitOption, smallestUnitStr);

const coerceLargestUnit = /*@__PURE__*/ bindArgs(coerceUnitOption, "largestUnit");

const coerceTotalUnit = /*@__PURE__*/ bindArgs(coerceUnitOption, "unit");

const coerceOverflow = /*@__PURE__*/ bindArgs(coerceChoiceOption, "overflow", overflowMap);

const coerceEpochDisambig = /*@__PURE__*/ bindArgs(coerceChoiceOption, "disambiguation", epochDisambigMap);

const coerceOffsetDisambig = /*@__PURE__*/ bindArgs(coerceChoiceOption, "offset", offsetDisambigMap);

const coerceCalendarDisplay = /*@__PURE__*/ bindArgs(coerceChoiceOption, "calendarName", calendarDisplayMap);

const coerceTimeZoneDisplay = /*@__PURE__*/ bindArgs(coerceChoiceOption, "timeZoneName", timeZoneDisplayMap);

const coerceOffsetDisplay = /*@__PURE__*/ bindArgs(coerceChoiceOption, "offset", offsetDisplayMap);

const coerceRoundingMode = /*@__PURE__*/ bindArgs(coerceChoiceOption, "roundingMode", roundingModeMap);

const coerceDirection = /*@__PURE__*/ bindArgs(coerceChoiceOption, "direction", directionMap);

function validateRoundingInc(roundingInc, smallestUnit, allowManyLargeUnits, solarMode) {
  const upUnitNano = solarMode ? nanoInUtcDay : unitNanoMap[smallestUnit + 1];
  if (upUnitNano) {
    const unitNano = unitNanoMap[smallestUnit];
    upUnitNano % ((roundingInc = clampEntity("roundingIncrement", roundingInc, 1, upUnitNano / unitNano - (solarMode ? 0 : 1), 1)) * unitNano) && throwRangeError(invalidEntity("roundingIncrement", roundingInc));
  } else {
    roundingInc = clampEntity("roundingIncrement", roundingInc, 1, allowManyLargeUnits ? 10 ** 9 : 1, 1);
  }
  return roundingInc;
}

function validateUnitRange(optionName, unit, minUnit, maxUnit) {
  return null != unit && clampEntity(optionName, unit, minUnit, maxUnit, 1, unitNamesAsc), 
  unit;
}

function checkLargestSmallestUnit(largestUnit, smallestUnit) {
  smallestUnit > largestUnit && throwRangeError("smallestUnit > largestUnit");
}

function refineDiffOptions(roundingModeInvert, options, defaultLargestUnit, maxUnit = 9, minUnit = 0, defaultRoundingMode = 4) {
  options = normalizeOptions(options);
  let largestUnit = coerceLargestUnit(options, minUnit);
  let roundingInc = coerceRoundingIncInteger(options);
  let roundingMode = coerceRoundingMode(options, defaultRoundingMode);
  let smallestUnit = coerceSmallestUnit(options, minUnit, 1);
  return largestUnit = validateUnitRange("largestUnit", largestUnit, minUnit, maxUnit), 
  smallestUnit = validateUnitRange(smallestUnitStr, smallestUnit, minUnit, maxUnit), 
  null == largestUnit ? largestUnit = Math.max(defaultLargestUnit, smallestUnit) : checkLargestSmallestUnit(largestUnit, smallestUnit), 
  roundingInc = validateRoundingInc(roundingInc, smallestUnit, 1), roundingModeInvert && (roundingMode = (roundingMode => roundingMode < 4 ? (roundingMode + 2) % 4 : roundingMode)(roundingMode)), 
  [ largestUnit, smallestUnit, roundingInc, roundingMode ];
}

function refineRoundingOptions(options, maxUnit = 6, solarMode) {
  let roundingInc = coerceRoundingIncInteger(options = normalizeOptionsOrString(options, smallestUnitStr));
  const roundingMode = coerceRoundingMode(options, 7);
  let smallestUnit = coerceSmallestUnit(options);
  return smallestUnit = requirePropDefined(smallestUnitStr, smallestUnit), smallestUnit = validateUnitRange(smallestUnitStr, smallestUnit, 0, maxUnit), 
  roundingInc = validateRoundingInc(roundingInc, smallestUnit, void 0, solarMode), 
  [ smallestUnit, roundingInc, roundingMode ];
}

function combineDateAndTime(isoDate, time) {
  return pluckProps(calendarDateFieldNamesAsc, isoDate, pluckProps(timeFieldNamesAsc, time));
}

function refineOverflowOptions(options) {
  return void 0 === options ? 0 : coerceOverflow(requireObjectLike(options));
}

function refineZonedFieldOptions(options, defaultOffsetDisambig = 0) {
  options = normalizeOptions(options);
  const epochDisambig = coerceEpochDisambig(options);
  const offsetDisambig = coerceOffsetDisambig(options, defaultOffsetDisambig);
  return [ coerceOverflow(options), offsetDisambig, epochDisambig ];
}

const epochNanoMax = /*@__PURE__*/ BigInt(1e8) * bigNanoInUtcDay;

const epochNanoMin = /*@__PURE__*/ BigInt(-1e8) * bigNanoInUtcDay;

const plainDateEpochNanoMin = epochNanoMin - bigNanoInUtcDay;

const isoYearMonthIndexMin = -3261848;

function checkIsoYearMonthInBounds(isoDate) {
  const isoYearMonthIndex = 12 * isoDate.year + isoDate.month;
  return (isoYearMonthIndex < isoYearMonthIndexMin || isoYearMonthIndex > 3309129) && throwRangeError(outOfBoundsDate), 
  isoDate;
}

function checkIsoDateInBounds(isoDate, allowPlainDateLowerEdge = 1) {
  return checkIsoDateEpochNanoInBounds(isoDateToEpochNano(isoDate), allowPlainDateLowerEdge), 
  isoDate;
}

function checkIsoDateTimeInBounds(isoDateTime) {
  const epochNano = isoDateToEpochNano(isoDateTime);
  return checkIsoDateEpochNanoInBounds(epochNano), epochNano !== plainDateEpochNanoMin || timeFieldsToNano(isoDateTime) || throwRangeError(outOfBoundsDate), 
  isoDateTime;
}

function checkIsoDateEpochNanoInBounds(epochNano, allowPlainDateLowerEdge = 1) {
  (epochNano < (allowPlainDateLowerEdge ? plainDateEpochNanoMin : epochNanoMin) || epochNano > epochNanoMax) && throwRangeError(outOfBoundsDate);
}

function checkEpochNanoInBounds(epochNano) {
  return (epochNano < epochNanoMin || epochNano > epochNanoMax) && throwRangeError(outOfBoundsDate), 
  epochNano;
}

function isoDateTimeAndOffsetToEpochNano(isoDateTime, offsetNano) {
  return checkEpochNanoInBounds(isoDateToEpochNano(isoDateTime) + BigInt(timeFieldsToNano(isoDateTime) - offsetNano));
}

function createEpochNanoSlots(epochNano) {
  return {
    epochNanoseconds: epochNano
  };
}

function createZonedEpochNanoSlots(epochNano, timeZone, calendar) {
  return {
    calendar: calendar,
    timeZone: timeZone,
    epochNanoseconds: epochNano
  };
}

function createDateTimeSlots(isoDateTime, calendar) {
  return pluckProps(timeFieldNamesAsc, isoDateTime, createDateSlots(isoDateTime, calendar));
}

function createDateSlots(isoDate, calendar) {
  return pluckProps(calendarDateFieldNamesAsc, isoDate, {
    calendar: calendar
  });
}

function createTimeSlots(time) {
  return pluckProps(timeFieldNamesAsc, time);
}

function createDurationSlots(durationFields) {
  return pluckProps(durationFieldNamesAsc, durationFields, {
    sign: computeDurationSign(durationFields)
  });
}

function getEpochMilli(slots) {
  return epochNano = slots.epochNanoseconds, Number(divFloorBigInt(epochNano, bigNanoInMilli));
  var epochNano;
}

function getEpochNano(slots) {
  return slots.epochNanoseconds;
}

function totalDuration(refineRelativeTo, slots, options) {
  const maxDurationUnit = getMaxDurationUnit(slots);
  const [totalUnit, relativeToSlots] = ((options, refineRelativeTo) => {
    const relativeToInternals = refineRelativeTo((options = normalizeOptionsOrString(options, "unit")).relativeTo);
    let totalUnit = coerceTotalUnit(options);
    return totalUnit = requirePropDefined("unit", totalUnit), [ totalUnit, relativeToInternals ];
  })(options, refineRelativeTo);
  const maxUnit = Math.max(totalUnit, maxDurationUnit);
  const isZoned = relativeToSlots && isZonedEpochSlots(relativeToSlots);
  if (!relativeToSlots && isUniformUnit(maxUnit, isZoned)) {
    return totalDayTimeDuration(slots, totalUnit);
  }
  if (relativeToSlots || throwRangeError("Missing relativeTo"), !slots.sign && isUniformUnit(totalUnit, isZoned)) {
    return 0;
  }
  const [balancedDuration, endEpochNano, relativeOps] = spanRelativeDuration(relativeToSlots, slots, totalUnit);
  return isUniformUnit(totalUnit, isZoned) ? totalDayTimeDuration(balancedDuration, totalUnit) : totalRelativeDuration(balancedDuration, endEpochNano, totalUnit, relativeOps);
}

function totalRelativeDuration(durationFields, endEpochNano, totalUnit, relativeOps) {
  const sign = computeDurationSign(durationFields) || 1;
  const nudgeWindow = clampRelativeDuration(clearDurationFields(totalUnit, durationFields), totalUnit, sign, relativeOps, endEpochNano);
  const epochNano0 = nudgeWindow.ee;
  const epochNano1 = nudgeWindow.te;
  const denom = Number(epochNano1 - epochNano0);
  const numerator = Number(endEpochNano - epochNano0);
  return nudgeWindow.pe[durationFieldNamesAsc[totalUnit]] + numerator / denom * sign;
}

function totalDayTimeDuration(durationFields, totalUnit) {
  return divideBigNanoToExactNumber(durationDayTimeToBigNano(durationFields), unitNanoMap[totalUnit]);
}

function clampRelativeDuration(durationFields, clampUnit, clampDistance, relativeOps, epochNanoProgress) {
  const unitName = durationFieldNamesAsc[clampUnit];
  let startDurationFields = durationFields;
  let shifted = 0;
  let window = computeRelativeDurationWindow(startDurationFields, unitName, clampDistance, relativeOps);
  return epochNanoProgress && !((epochNanoProgress, epochNano0, epochNano1, sign) => sign > 0 ? compareBigInts(epochNano0, epochNanoProgress) <= 0 && compareBigInts(epochNanoProgress, epochNano1) <= 0 : compareBigInts(epochNano1, epochNanoProgress) <= 0 && compareBigInts(epochNanoProgress, epochNano0) <= 0)(epochNanoProgress, window.ee, window.te, Math.sign(clampDistance)) && (startDurationFields = {
    ...durationFields,
    [unitName]: durationFields[unitName] + clampDistance
  }, shifted = 1, window = computeRelativeDurationWindow(startDurationFields, unitName, clampDistance, relativeOps)), 
  {
    ...window,
    pe: startDurationFields,
    Ae: shifted
  };
}

function computeRelativeDurationWindow(startDurationFields, unitName, clampDistance, relativeOps) {
  const endDurationFields = {
    ...startDurationFields,
    [unitName]: startDurationFields[unitName] + clampDistance
  };
  return {
    ee: moveRelativeToEpochNano(relativeOps, startDurationFields),
    te: moveRelativeToEpochNano(relativeOps, endDurationFields),
    se: endDurationFields
  };
}

function computeEpochNanoFrac(epochNanoProgress, epochNano0, epochNano1) {
  const denomBig = epochNano1 - epochNano0;
  const numeratorBig = epochNanoProgress - epochNano0;
  if (!numeratorBig) {
    return 0;
  }
  const absNumerator = numeratorBig < 0n ? -numeratorBig : numeratorBig;
  const absDenom = denomBig < 0n ? -denomBig : denomBig;
  const fracSign = compareBigInts(numeratorBig, 0n) === compareBigInts(denomBig, 0n) ? 1 : -1;
  return compareBigInts(absNumerator, absDenom) <= 0 ? absNumerator === absDenom ? fracSign : fabricateNearHalfFraction(compareBigInts(2n * absNumerator, absDenom), fracSign) : Number(numeratorBig) / Number(denomBig);
}

function roundZonedEpochSlotsToUnit(slots, smallestUnit, roundingInc, roundingMode) {
  let {epochNanoseconds: epochNanoseconds} = slots;
  const {timeZone: timeZone, calendar: calendar} = slots;
  if (0 === smallestUnit && 1 === roundingInc) {
    return {
      epochNanoseconds: epochNanoseconds,
      timeZone: timeZone,
      calendar: calendar
    };
  }
  if (6 === smallestUnit) {
    const isoFields0 = combineDateAndTime(zonedEpochSlotsToIso(slots), timeFieldDefaults);
    const isoFields1 = combineDateAndTime(moveByDays(isoFields0, 1), timeFieldDefaults);
    const epochNano0 = getStartOfDayInstantFor(timeZone, isoFields0);
    const epochNano1 = getStartOfDayInstantFor(timeZone, isoFields1);
    epochNanoseconds = roundWithMode(computeZonedDayRoundFrac(epochNanoseconds, epochNano0, epochNano1), roundingMode) ? epochNano1 : epochNano0;
  } else {
    const isoDateTime = zonedEpochSlotsToIso(slots);
    const offsetNano = isoDateTime.offsetNanoseconds;
    epochNanoseconds = getMatchingInstantFor(timeZone, roundDateTimeToNano(isoDateTime, computeNanoInc(smallestUnit, roundingInc), roundingMode), offsetNano, 2, 0, 1);
  }
  return {
    epochNanoseconds: epochNanoseconds,
    timeZone: timeZone,
    calendar: calendar
  };
}

function computeZonedHoursInDay(slots) {
  const {timeZone: timeZone} = slots;
  const isoFields0 = combineDateAndTime(zonedEpochSlotsToIso(slots), timeFieldDefaults);
  const isoFields1 = combineDateAndTime(moveByDays(isoFields0, 1), timeFieldDefaults);
  const epochNano0 = getStartOfDayInstantFor(timeZone, isoFields0);
  return divideBigNanoToExactNumber(getStartOfDayInstantFor(timeZone, isoFields1) - epochNano0, nanoInHour);
}

function computeZonedStartOfDay(slots) {
  const {timeZone: timeZone, calendar: calendar} = slots;
  return createZonedEpochNanoSlots(getStartOfDayInstantFor(timeZone, combineDateAndTime(zonedEpochSlotsToIso(slots), timeFieldDefaults)), timeZone, calendar);
}

function computeZonedDayRoundFrac(epochNano, epochNano0, epochNano1) {
  return computeEpochNanoFrac(epochNano < epochNano1 ? epochNano : epochNano1 - 1n, epochNano0, epochNano1);
}

function roundDateTimeToNano(isoDateTime, nanoInc, roundingMode) {
  const [roundedTimeFields, dayDelta] = roundTimeToNano(isoDateTime, nanoInc, roundingMode);
  const roundedIsoDateTime = combineDateAndTime(moveByDays(isoDateTime, dayDelta), roundedTimeFields);
  return checkIsoDateTimeInBounds(roundedIsoDateTime), roundedIsoDateTime;
}

function roundTimeToNano(timeFields, nanoInc, roundingMode) {
  return nanoToTimeAndDay(roundNumberToInc(timeFieldsToNano(timeFields), nanoInc, roundingMode));
}

function roundToMinute(offsetNano) {
  return roundNumberToInc(offsetNano, nanoInMinute, 7);
}

function computeNanoInc(smallestUnit, roundingInc) {
  return unitNanoMap[smallestUnit] * roundingInc;
}

function computeBigNanoInc(smallestUnit, roundingInc) {
  return BigInt(unitNanoMap[smallestUnit]) * BigInt(roundingInc);
}

function roundDayTimeDurationByInc(durationFields, nanoInc, roundingMode) {
  const maxUnit = Math.min(getMaxDurationUnit(durationFields), 6);
  return nanoToDurationDayTimeFields(roundBigNanoToInc(durationDayTimeToBigNano(durationFields), BigInt(nanoInc), roundingMode), maxUnit);
}

function roundRelativeDuration(durationFields, endEpochNano, largestUnit, smallestUnit, roundingInc, roundingMode, relativeOps, isZoned) {
  if (0 === smallestUnit && 1 === roundingInc) {
    return durationFields;
  }
  const sign = computeDurationSign(durationFields) || 1;
  const nudgeFunc = isUniformUnit(smallestUnit, isZoned) ? isZoned && smallestUnit < 6 && largestUnit >= 6 ? nudgeZonedTimeDuration : nudgeDayTimeDuration : nudgeRelativeDuration;
  let [roundedDurationFields, roundedEpochNano, grewBigUnit] = nudgeFunc(sign, durationFields, endEpochNano, largestUnit, smallestUnit, roundingInc, roundingMode, relativeOps);
  return grewBigUnit && 7 !== smallestUnit && (roundedDurationFields = ((durationFields, endEpochNano, largestUnit, smallestUnit, sign, relativeOps) => {
    for (let currentUnit = smallestUnit + 1; currentUnit <= largestUnit; currentUnit++) {
      if (7 === currentUnit && 7 !== largestUnit) {
        continue;
      }
      const baseDurationFields = clearDurationFields(currentUnit, durationFields);
      baseDurationFields[durationFieldNamesAsc[currentUnit]] += sign;
      const thresholdCompare = compareBigInts(endEpochNano, moveRelativeToEpochNano(relativeOps, baseDurationFields));
      if (thresholdCompare && thresholdCompare !== sign) {
        break;
      }
      durationFields = baseDurationFields;
    }
    return durationFields;
  })(roundedDurationFields, roundedEpochNano, largestUnit, Math.max(6, smallestUnit), sign, relativeOps)), 
  roundedDurationFields;
}

function roundBigNanoToInc(bigNano, bigNanoInc, roundingMode) {
  return roundBigNanoToIncWithTail(bigNano, bigNanoInc, roundingMode, bigNano / bigNanoInc % 2n);
}

function roundBigNanoToDayOriginInc(bigNano, bigNanoInc, roundingMode) {
  const [day, timeNano] = divModFloorBigInt(bigNano, bigNanoInUtcDay);
  const dayOriginNano = day * bigNanoInUtcDay;
  return dayOriginNano + roundBigNanoToIncWithTail(timeNano, bigNanoInc, roundingMode, (dayOriginNano / bigNanoInc + timeNano / bigNanoInc) % 2n);
}

function roundBigNanoToIncWithTail(bigNano, bigNanoInc, roundingMode, quotientTail) {
  const quotient = bigNano / bigNanoInc;
  const remainder = bigNano % bigNanoInc;
  let fraction = 0;
  remainder && (fraction = fabricateNearHalfFraction(compareBigInts(2n * (remainder < 0n ? -remainder : remainder), bigNanoInc), Math.sign(Number(remainder))));
  const roundedTail = roundWithMode(Number(quotientTail) + fraction, roundingMode);
  return (quotient - quotientTail + BigInt(roundedTail)) * bigNanoInc;
}

function roundNumberToInc(num, roundingInc, roundingMode) {
  return roundWithMode(num / roundingInc, roundingMode) * roundingInc;
}

function roundWithMode(num, roundingMode) {
  return roundingModeFuncs[roundingMode](num);
}

function nudgeDayTimeDuration(sign, durationFields, endEpochNano, largestUnit, smallestUnit, roundingInc, roundingMode) {
  const bigNano = durationDayTimeToBigNano(durationFields);
  const roundedBigNano = roundBigNanoToInc(bigNano, computeBigNanoInc(smallestUnit, roundingInc), roundingMode);
  const nanoDiff = roundedBigNano - bigNano;
  const expandedBigUnit = Math.sign(Number(roundedBigNano / bigNanoInUtcDay) - Number(bigNano / bigNanoInUtcDay)) === sign;
  const roundedDayTimeFields = nanoToDurationDayTimeFields(roundedBigNano, Math.min(largestUnit, 6));
  return [ {
    ...durationFields,
    ...roundedDayTimeFields
  }, endEpochNano + nanoDiff, expandedBigUnit ];
}

function nudgeZonedTimeDuration(sign, durationFields, endEpochNano, _largestUnit, smallestUnit, roundingInc, roundingMode, relativeOps) {
  const timeNano = Number(durationTimeToBigNano(durationFields));
  const nanoInc = computeNanoInc(smallestUnit, roundingInc);
  let roundedTimeNano = roundNumberToInc(timeNano, nanoInc, roundingMode);
  const dayWindow = clampRelativeDuration({
    ...durationFields,
    ...durationTimeFieldDefaults
  }, 6, sign, relativeOps, endEpochNano);
  const dayEpochNano0 = dayWindow.ee;
  const dayEpochNano1 = dayWindow.te;
  const beyondDayNano = roundedTimeNano - Number(dayEpochNano1 - dayEpochNano0);
  let dayDelta = 0;
  beyondDayNano && Math.sign(beyondDayNano) !== sign ? endEpochNano = dayEpochNano0 + BigInt(roundedTimeNano) : (dayDelta += sign, 
  roundedTimeNano = roundNumberToInc(beyondDayNano, nanoInc, roundingMode), endEpochNano = dayEpochNano1 + BigInt(roundedTimeNano));
  const durationTimeFields = nanoToDurationTimeFields(roundedTimeNano);
  return [ {
    ...durationFields,
    ...durationTimeFields,
    days: durationFields.days + dayDelta
  }, endEpochNano, Boolean(dayDelta) ];
}

function nudgeRelativeDuration(sign, durationFields, endEpochNano, _largestUnit, smallestUnit, roundingInc, roundingMode, relativeOps) {
  const smallestUnitFieldName = durationFieldNamesAsc[smallestUnit];
  const baseDurationFields = clearDurationFields(smallestUnit, durationFields);
  7 === smallestUnit && (durationFields = {
    ...durationFields,
    weeks: durationFields.weeks + Math.trunc(durationFields.days / 7)
  });
  const truncedVal = divTrunc(durationFields[smallestUnitFieldName], roundingInc) * roundingInc;
  baseDurationFields[smallestUnitFieldName] = truncedVal;
  const nudgeWindow = clampRelativeDuration(baseDurationFields, smallestUnit, roundingInc * sign, relativeOps, endEpochNano);
  const epochNano0 = nudgeWindow.ee;
  const epochNano1 = nudgeWindow.te;
  const frac = computeEpochNanoFrac(endEpochNano, epochNano0, epochNano1);
  const windowStartVal = nudgeWindow.pe[smallestUnitFieldName];
  const windowEndVal = nudgeWindow.se[smallestUnitFieldName];
  const roundedVal = roundNumberToInc(windowStartVal + frac * sign * roundingInc, roundingInc, roundingMode);
  const roundedToEnd = roundedVal === windowEndVal;
  return baseDurationFields[smallestUnitFieldName] = roundedVal, [ baseDurationFields, roundedToEnd ? epochNano1 : epochNano0, nudgeWindow.Ae || roundedToEnd ];
}

function getTimeZoneTransitionEpochNanoseconds(slots, options) {
  return slots.timeZone.O(slots.epochNanoseconds, (options => {
    const normalizedOptions = normalizeOptionsOrString(options, "direction");
    const res = coerceDirection(normalizedOptions, 0);
    return res || throwRangeError(invalidEntity("direction", res)), res;
  })(options));
}

const zonedEpochSlotsToIso = /*@__PURE__*/ memoize(_zonedEpochSlotsToIso, WeakMap);

function _zonedEpochSlotsToIso(slots) {
  const {epochNanoseconds: epochNanoseconds, timeZone: timeZone} = slots;
  const offsetNanoseconds = timeZone.B(epochNanoseconds);
  return {
    ...epochNanoToIsoDateTime(epochNanoseconds + BigInt(offsetNanoseconds)),
    offsetNanoseconds: offsetNanoseconds
  };
}

function getMatchingInstantFor(timeZone, isoDateTime, offsetNano, offsetDisambig = 0, epochDisambig = 0, epochFuzzy, hasZ) {
  if (void 0 !== offsetNano && 1 === offsetDisambig && (1 === offsetDisambig || hasZ)) {
    return isoDateTimeAndOffsetToEpochNano(isoDateTime, offsetNano);
  }
  2 !== offsetDisambig && 0 !== offsetDisambig || checkIsoDateInBounds(isoDateTime, 0);
  const possibleEpochNanos = timeZone.N(isoDateTime);
  if (void 0 !== offsetNano && 3 !== offsetDisambig) {
    const matchingEpochNano = ((possibleEpochNanos, isoDateTime, offsetNano, fuzzy) => {
      const zonedEpochNano = isoDateTimeToEpochNano(isoDateTime);
      fuzzy && (offsetNano = roundToMinute(offsetNano));
      for (const possibleEpochNano of possibleEpochNanos) {
        let possibleOffsetNano = Number(zonedEpochNano - possibleEpochNano);
        if (fuzzy && (possibleOffsetNano = roundToMinute(possibleOffsetNano)), possibleOffsetNano === offsetNano) {
          return possibleEpochNano;
        }
      }
    })(possibleEpochNanos, isoDateTime, offsetNano, epochFuzzy);
    if (void 0 !== matchingEpochNano) {
      return matchingEpochNano;
    }
    0 === offsetDisambig && throwRangeError("Invalid TimeZone offset");
  }
  return hasZ ? isoDateTimeToEpochNano(isoDateTime) : getSingleInstantFor(timeZone, isoDateTime, epochDisambig, possibleEpochNanos);
}

function getSingleInstantFor(timeZone, isoDateTime, disambig = 0, possibleEpochNanos = timeZone.N(isoDateTime)) {
  if (1 === possibleEpochNanos.length) {
    return possibleEpochNanos[0];
  }
  if (1 === disambig && throwRangeError("Ambiguous offset"), possibleEpochNanos.length) {
    return possibleEpochNanos[3 === disambig ? 1 : 0];
  }
  const zonedEpochNano = isoDateTimeToEpochNano(isoDateTime);
  const gapNano = ((timeZone, zonedEpochNano) => {
    const startOffsetNano = timeZone.B(zonedEpochNano - bigNanoInUtcDay);
    return (gapNano => (gapNano > nanoInUtcDay && throwRangeError("Out-of-bounds TimeZone gap"), 
    gapNano))(timeZone.B(zonedEpochNano + bigNanoInUtcDay) - startOffsetNano);
  })(timeZone, zonedEpochNano);
  const shiftedIsoDateTime = epochNanoToIsoDateTime(zonedEpochNano + BigInt(gapNano * (2 === disambig ? -1 : 1)));
  return (possibleEpochNanos = timeZone.N(shiftedIsoDateTime))[2 === disambig ? 0 : possibleEpochNanos.length - 1];
}

function getStartOfDayInstantFor(timeZone, isoDateTime) {
  const possibleEpochNanos = timeZone.N(isoDateTime);
  if (possibleEpochNanos.length) {
    return possibleEpochNanos[0];
  }
  const zonedEpochNanoDayBefore = isoDateTimeToEpochNano(isoDateTime) - bigNanoInUtcDay;
  return timeZone.O(zonedEpochNanoDayBefore, 1);
}

function moveYearMonth(doSubtract, calendar, isoDateFields, durationSlots, options) {
  const overflow = refineOverflowOptions(options);
  durationSlots.sign && getMaxDurationUnit(durationSlots) < 8 && throwRangeError("Cannot use small units");
  const startOfMonthFields = checkIsoDateInBounds(moveToStartOfMonth(calendar, isoDateFields));
  return moveToStartOfMonth(calendar, dateAddWithOverflow(calendar, startOfMonthFields, doSubtract ? negateDurationFields(durationSlots) : durationSlots, overflow));
}

function moveEpochNano(epochNano, durationFields) {
  return checkEpochNanoInBounds(epochNano + (durationHasDateParts(fields = durationFields) && throwRangeError("Cannot use large units"), 
  durationTimeToBigNano(fields)));
  var fields;
}

function moveZonedEpochSlots(slots, durationFields, options) {
  const {calendar: calendar, epochNanoseconds: epochNano, timeZone: timeZone} = slots;
  const timeOnlyNano = durationTimeToBigNano(durationFields);
  let movedEpochNano = epochNano;
  if (durationHasDateParts(durationFields)) {
    const isoDateTime = zonedEpochSlotsToIso(slots);
    movedEpochNano = getSingleInstantFor(timeZone, combineDateAndTime(moveDate(calendar, isoDateTime, {
      ...durationFields,
      ...durationTimeFieldDefaults
    }, options), isoDateTime)) + timeOnlyNano;
  } else {
    movedEpochNano += timeOnlyNano, refineOverflowOptions(options);
  }
  return {
    ...slots,
    epochNanoseconds: checkEpochNanoInBounds(movedEpochNano)
  };
}

function moveDateTime(calendar, isoDateTimeFields, durationFields, options) {
  const [movedTimeFields, dayDelta] = moveTime(isoDateTimeFields, durationFields);
  return checkIsoDateTimeInBounds(combineDateAndTime(moveDate(calendar, isoDateTimeFields, {
    ...durationFields,
    ...durationTimeFieldDefaults,
    days: durationFields.days + dayDelta
  }, options), movedTimeFields));
}

function moveDate(calendar, isoDateFields, durationFields, options) {
  if (durationFields.years || durationFields.months || durationFields.weeks) {
    return dateAddWithOverflow(calendar, isoDateFields, durationFields, refineOverflowOptions(options));
  }
  refineOverflowOptions(options);
  const days = durationFields.days + Number(durationTimeToBigNano(durationFields) / bigNanoInUtcDay);
  return days ? checkIsoDateInBounds(moveByDays(isoDateFields, days)) : isoDateFields;
}

function moveToStartOfMonth(calendar, isoDateFields) {
  return moveByDays(isoDateFields, 1 - computeCalendarDateFields(calendar, isoDateFields).day);
}

function moveTime(timeFields, durationFields) {
  const durationBigNano = durationTimeToBigNano(durationFields);
  const durDays = Number(durationBigNano / bigNanoInUtcDay);
  const durTimeNano = Number(durationBigNano % bigNanoInUtcDay);
  const [newTimeFields, overflowDays] = nanoToTimeAndDay(timeFieldsToNano(timeFields) + durTimeNano);
  return [ newTimeFields, durDays + overflowDays ];
}

function moveByDays(isoDate, days) {
  return days ? epochDaysToIsoDate(isoDateToEpochDays(isoDate) + days) : isoDate;
}

function dateAddWithOverflow(calendar, isoDateFields, durationFields, overflow) {
  let {years: years, months: months, weeks: weeks, days: days} = durationFields;
  let isoDate;
  if (days += Number(durationTimeToBigNano(durationFields) / bigNanoInUtcDay), years || months) {
    isoDate = addDateMonths(calendar, isoDateFields, years, months, overflow);
  } else {
    if (!weeks && !days) {
      return isoDateFields;
    }
    isoDate = isoDateFields;
  }
  return (weeks || days) && (isoDate = moveByDays(isoDate, 7 * weeks + days)), checkIsoDateInBounds(isoDate);
}

function addDateMonths(calendar, isoDateFields, years, months, overflow) {
  const dateParts = computeCalendarDateFields(calendar, isoDateFields);
  let {year: year, month: month, day: day} = dateParts;
  if (years) {
    const [monthCodeNumber, isLeapMonth] = computeCalendarMonthCodeParts(calendar, year, month);
    year += years, month = computeYearMovedMonth(calendar, monthCodeNumber, isLeapMonth, calendar ? calendar.p(year) : void 0, overflow), 
    month = clampEntity("month", month, 1, computeCalendarMonthsInYearForYear(calendar, year), overflow);
  }
  if (months) {
    const yearMonthParts = calendar ? calendar.K(year, month, months) : addIsoMonths(year, month, months);
    ({year: year, month: month} = yearMonthParts);
  }
  return day = clampEntity("day", day, 1, computeCalendarDaysInMonthForYearMonth(calendar, year, month), overflow), 
  computeCalendarIsoFieldsFromParts(calendar, year, month, day);
}

function computeYearMovedMonth(calendar, monthCodeNumber, isLeapMonth, targetLeapMonth, overflow) {
  if (isLeapMonth) {
    const leapMonthMeta = calendar ? calendar.l : void 0;
    return void 0 !== targetLeapMonth && (leapMonthMeta < 0 || targetLeapMonth === monthCodeNumber + 1) ? targetLeapMonth : (1 === overflow && throwRangeError(invalidLeapMonth), 
    leapMonthMeta < 0 ? -leapMonthMeta : monthCodeNumber);
  }
  return monthCodeNumberToMonth(monthCodeNumber, 0, targetLeapMonth);
}

function getCommonCalendar(a, b) {
  return getCalendarSlotId(a) !== getCalendarSlotId(b) && throwRangeError("Mismatching Calendars"), 
  a;
}

function getCommonTimeZone(a, b) {
  return a.m !== b.m && throwRangeError("Mismatching TimeZones"), 
  a;
}

function getZonedTimeZoneId(slots) {
  return slots.timeZone.id;
}

function diffInstants(invert, instantSlots0, instantSlots1, options) {
  const [largestUnit, smallestUnit, roundingInc, roundingMode] = refineDiffOptions(invert, options, 3, 5);
  const durationFields = diffEpochNanos(instantSlots0.epochNanoseconds, instantSlots1.epochNanoseconds, largestUnit, smallestUnit, roundingInc, roundingMode);
  return createDurationSlots(invert ? negateDurationFields(durationFields) : durationFields);
}

function diffZonedDateTimes(invert, calendar, slots0, slots1, options) {
  const [largestUnit, smallestUnit, roundingInc, roundingMode] = refineDiffOptions(invert, options, 5);
  const epochNano0 = slots0.epochNanoseconds;
  const epochNano1 = slots1.epochNanoseconds;
  let durationFields;
  if (compareBigInts(epochNano1, epochNano0)) {
    if (largestUnit < 6) {
      durationFields = diffEpochNanos(epochNano0, epochNano1, largestUnit, smallestUnit, roundingInc, roundingMode);
    } else {
      const timeZone = getCommonTimeZone(slots0.timeZone, slots1.timeZone);
      durationFields = diffZonedEpochsExact(timeZone, calendar, slots0, slots1, largestUnit), 
      durationFields = roundRelativeDuration(durationFields, epochNano1, largestUnit, smallestUnit, roundingInc, roundingMode, createZonedRelativeOps(calendar, timeZone, slots0), 1);
    }
  } else {
    durationFields = durationFieldDefaults;
  }
  return createDurationSlots(invert ? negateDurationFields(durationFields) : durationFields);
}

function diffPlainDateTimes(invert, calendar, plainDateTimeSlots0, plainDateTimeSlots1, options) {
  const [largestUnit, smallestUnit, roundingInc, roundingMode] = refineDiffOptions(invert, options, 6);
  const startEpochNano = isoDateTimeToEpochNano(plainDateTimeSlots0);
  const endEpochNano = isoDateTimeToEpochNano(plainDateTimeSlots1);
  const sign = compareBigInts(endEpochNano, startEpochNano);
  let durationFields;
  return sign ? largestUnit <= 6 ? durationFields = diffEpochNanos(startEpochNano, endEpochNano, largestUnit, smallestUnit, roundingInc, roundingMode) : (durationFields = diffDateTimesBig(calendar, plainDateTimeSlots0, plainDateTimeSlots1, sign, largestUnit), 
  durationFields = roundRelativeDuration(durationFields, endEpochNano, largestUnit, smallestUnit, roundingInc, roundingMode, createDateTimeRelativeOps(calendar, plainDateTimeSlots0))) : durationFields = durationFieldDefaults, 
  createDurationSlots(invert ? negateDurationFields(durationFields) : durationFields);
}

function diffPlainDates(invert, calendar, plainDateSlots0, plainDateSlots1, options) {
  const [largestUnit, smallestUnit, roundingInc, roundingMode] = refineDiffOptions(invert, options, 6, 9, 6);
  return diffDateLike(invert, calendar, plainDateSlots0, plainDateSlots1, largestUnit, smallestUnit, roundingInc, roundingMode);
}

function diffPlainYearMonth(invert, calendar, plainYearMonthSlots0, plainYearMonthSlots1, options) {
  const [largestUnit, smallestUnit, roundingInc, roundingMode] = refineDiffOptions(invert, options, 9, 9, 8);
  const firstOfMonth0 = moveToStartOfMonth(calendar, plainYearMonthSlots0);
  const firstOfMonth1 = moveToStartOfMonth(calendar, plainYearMonthSlots1);
  return compareIsoDate(firstOfMonth0, firstOfMonth1) ? diffDateLike(invert, calendar, checkIsoDateInBounds(firstOfMonth0), checkIsoDateInBounds(firstOfMonth1), largestUnit, smallestUnit, roundingInc, roundingMode, 8) : createDurationSlots(durationFieldDefaults);
}

function diffDateLike(invert, calendar, startIsoDate, endIsoDate, largestUnit, smallestUnit, roundingInc, roundingMode, smallestPrecision = 6) {
  const startEpochNano = isoDateToEpochNano(startIsoDate);
  const endEpochNano = isoDateToEpochNano(endIsoDate);
  let durationFields;
  return compareBigInts(endEpochNano, startEpochNano) ? 6 === largestUnit ? durationFields = diffEpochNanos(startEpochNano, endEpochNano, largestUnit, smallestUnit, roundingInc, roundingMode) : (durationFields = diffCalendarDates(calendar, startIsoDate, endIsoDate, largestUnit), 
  smallestUnit === smallestPrecision && 1 === roundingInc || (durationFields = roundRelativeDuration(durationFields, endEpochNano, largestUnit, smallestUnit, roundingInc, roundingMode, createDateRelativeOps(calendar, startIsoDate)))) : durationFields = durationFieldDefaults, 
  createDurationSlots(invert ? negateDurationFields(durationFields) : durationFields);
}

function diffPlainTimes(invert, plainTimeSlots0, plainTimeSlots1, options) {
  const [largestUnit, smallestUnit, roundingInc, roundingMode] = refineDiffOptions(invert, options, 5, 5);
  const timeDiffNano = roundNumberToInc(timeFieldsToNano(plainTimeSlots1) - timeFieldsToNano(plainTimeSlots0), computeNanoInc(smallestUnit, roundingInc), roundingMode);
  const durationFields = {
    ...durationFieldDefaults,
    ...nanoToDurationTimeFields(timeDiffNano, largestUnit)
  };
  return createDurationSlots(invert ? negateDurationFields(durationFields) : durationFields);
}

function diffZonedEpochsExact(timeZone, calendar, slots0, slots1, largestUnit) {
  const sign = compareBigInts(slots1.epochNanoseconds, slots0.epochNanoseconds);
  if (!sign) {
    return durationFieldDefaults;
  }
  if (largestUnit < 6) {
    return {
      ...durationFieldDefaults,
      ...nanoToDurationDayTimeFields(slots1.epochNanoseconds - slots0.epochNanoseconds, largestUnit)
    };
  }
  if (!compareIsoDate(zonedEpochSlotsToIso(slots0), zonedEpochSlotsToIso(slots1))) {
    return {
      ...durationFieldDefaults,
      ...nanoToDurationDayTimeFields(slots1.epochNanoseconds - slots0.epochNanoseconds, 5)
    };
  }
  const [isoFields0, isoFields1, remainderNano] = prepareZonedEpochDiff(timeZone, slots0, slots1, sign);
  return {
    ...6 === largestUnit ? {
      ...durationFieldDefaults,
      days: diffDays(isoFields0, isoFields1)
    } : diffCalendarDates(calendar, isoFields0, isoFields1, largestUnit),
    ...nanoToDurationTimeFields(remainderNano)
  };
}

function diffDateTimesExact(calendar, startIsoDateTime, endIsoDateTime, largestUnit) {
  const startEpochNano = isoDateTimeToEpochNano(startIsoDateTime);
  const endEpochNano = isoDateTimeToEpochNano(endIsoDateTime);
  const sign = compareBigInts(endEpochNano, startEpochNano);
  return sign ? largestUnit <= 6 ? {
    ...durationFieldDefaults,
    ...nanoToDurationDayTimeFields(endEpochNano - startEpochNano, largestUnit)
  } : diffDateTimesBig(calendar, startIsoDateTime, endIsoDateTime, sign, largestUnit) : durationFieldDefaults;
}

function diffDateTimesBig(calendar, startIsoDateTime, endIsoDateTime, sign, largestUnit) {
  let diffEndDate = endIsoDateTime;
  let timeNano = timeFieldsToNano(endIsoDateTime) - timeFieldsToNano(startIsoDateTime);
  return Math.sign(timeNano) === -sign && (diffEndDate = moveByDays(endIsoDateTime, -sign), 
  timeNano += nanoInUtcDay * sign), {
    ...diffCalendarDates(calendar, startIsoDateTime, diffEndDate, largestUnit),
    ...nanoToDurationTimeFields(timeNano)
  };
}

function diffCalendarDates(calendar, startIsoDate, endIsoDate, largestUnit) {
  if (largestUnit <= 7) {
    const days = diffDays(startIsoDate, endIsoDate);
    return 7 === largestUnit ? {
      ...durationFieldDefaults,
      weeks: divTrunc(days, 7),
      days: modTrunc(days, 7)
    } : {
      ...durationFieldDefaults,
      days: days
    };
  }
  const yearMonthDayStart = computeCalendarDateFields(calendar, startIsoDate);
  const yearMonthDayEnd = computeCalendarDateFields(calendar, endIsoDate);
  if (8 === largestUnit) {
    const {year: year0, month: month0, day: day0} = yearMonthDayStart;
    const {year: year1, month: month1, day: day1} = yearMonthDayEnd;
    const sign = Math.sign(compareNumbers(year1, year0) || compareNumbers(month1, month0) || diffDays(startIsoDate, endIsoDate));
    let months = 0;
    let days = 0;
    if (sign) {
      months = calendar ? calendar._(year0, month0, year1, month1) : diffIsoMonthSlots(year0, month0, year1, month1);
      let anchorIsoDate = addDateMonths(calendar, startIsoDate, 0, months, 0);
      sign * compareNumbers(day0, day1) > 0 && (months -= sign, anchorIsoDate = addDateMonths(calendar, startIsoDate, 0, months, 0)), 
      days = diffDays(anchorIsoDate, endIsoDate);
    }
    return {
      ...durationFieldDefaults,
      months: months,
      days: days
    };
  }
  const {year: year0, month: month0, day: day0} = yearMonthDayStart;
  let {year: year1, month: month1, day: day1} = yearMonthDayEnd;
  let yearDiff = year1 - year0;
  let monthDiff = month1 - month0;
  let dayDiff = day1 - day0;
  if (yearDiff || monthDiff) {
    const sign = Math.sign(yearDiff || monthDiff);
    let daysInMonth1 = computeCalendarDaysInMonthForYearMonth(calendar, year1, month1);
    let dayCorrect = 0;
    if (Math.sign(day1 - day0) === -sign) {
      const origDaysInMonth1 = daysInMonth1;
      const yearMonthParts = calendar ? calendar.K(year1, month1, -sign) : addIsoMonths(year1, month1, -sign);
      (({year: year1, month: month1} = yearMonthParts)), yearDiff = year1 - year0, monthDiff = month1 - month0, 
      daysInMonth1 = computeCalendarDaysInMonthForYearMonth(calendar, year1, month1), 
      dayCorrect = sign < 0 ? -origDaysInMonth1 : daysInMonth1;
    }
    if (dayDiff = day1 - Math.min(day0, daysInMonth1) + dayCorrect, yearDiff) {
      const [monthCodeNumber0, isLeapMonth0] = computeCalendarMonthCodeParts(calendar, year0, month0);
      const [monthCodeNumber1, isLeapMonth1] = computeCalendarMonthCodeParts(calendar, year1, month1);
      const leapMonthMeta = calendar ? calendar.l : void 0;
      if (monthDiff = void 0 !== leapMonthMeta && isLeapMonth0 && !isLeapMonth1 && (leapMonthMeta < 0 ? sign > 0 && monthCodeNumber1 === -leapMonthMeta : sign < 0 && monthCodeNumber1 === monthCodeNumber0) ? 0 : monthCodeNumber1 - monthCodeNumber0 || Number(isLeapMonth1) - Number(isLeapMonth0), 
      Math.sign(monthDiff) === -sign) {
        const monthCorrect = sign < 0 && -computeCalendarMonthsInYearForYear(calendar, year1);
        year1 -= sign, yearDiff = year1 - year0, monthDiff = month1 - computeYearMovedMonth(calendar, monthCodeNumber0, isLeapMonth0, calendar ? calendar.p(year1) : void 0, 0) + (monthCorrect || computeCalendarMonthsInYearForYear(calendar, year1));
      } else if (calendar) {
        const month0Projected = computeYearMovedMonth(calendar, monthCodeNumber0, isLeapMonth0, calendar.p(year1), 0);
        monthDiff = calendar._(year1, month0Projected, year1, month1);
      }
    }
  }
  return {
    ...durationFieldDefaults,
    years: yearDiff,
    months: monthDiff,
    days: dayDiff
  };
}

function compareIsoDate(isoDate0, isoDate1) {
  return compareNumbers(isoDate0.year, isoDate1.year) || compareNumbers(isoDate0.month, isoDate1.month) || compareNumbers(isoDate0.day, isoDate1.day);
}

function prepareZonedEpochDiff(timeZone, slots0, slots1, sign) {
  const startIsoDate = zonedEpochSlotsToIso(slots0);
  const endIsoDate = zonedEpochSlotsToIso(slots1);
  const endEpochNano = slots1.epochNanoseconds;
  let dayCorrection = 0;
  const timeDiffNano = timeFieldsToNano(endIsoDate) - timeFieldsToNano(startIsoDate);
  Math.sign(timeDiffNano) === -sign && dayCorrection++;
  const maxDayCorrection = dayCorrection + (sign > 0 ? 1 : 0);
  for (;dayCorrection <= maxDayCorrection; dayCorrection++) {
    const midIsoDate = moveByDays(endIsoDate, dayCorrection * -sign);
    const midEpochNano = getSingleInstantFor(timeZone, combineDateAndTime(midIsoDate, startIsoDate));
    if (compareBigInts(endEpochNano, midEpochNano) !== -sign) {
      return [ startIsoDate, midIsoDate, Number(endEpochNano - midEpochNano) ];
    }
  }
}

function diffEpochNanos(startEpochNano, endEpochNano, largestUnit, smallestUnit, roundingInc, roundingMode) {
  return {
    ...durationFieldDefaults,
    ...nanoToDurationDayTimeFields(roundBigNanoToInc(endEpochNano - startEpochNano, computeBigNanoInc(smallestUnit, roundingInc), roundingMode), largestUnit)
  };
}

function diffDays(startIsoDate, endIsoDate) {
  return isoDateToEpochDays(endIsoDate) - isoDateToEpochDays(startIsoDate);
}

function createDateRelativeOps(calendar, origin) {
  return {
    origin: origin,
    ie: isoDateToEpochNano(origin),
    calendar: calendar,
    he: isoDateToEpochNano
  };
}

function createDateTimeRelativeOps(calendar, origin) {
  return {
    origin: origin,
    ie: isoDateTimeToEpochNano(origin),
    calendar: calendar,
    he: movedIsoDate => isoDateTimeToEpochNano(combineDateAndTime(movedIsoDate, origin))
  };
}

function createZonedRelativeOps(calendar, timeZone, slots) {
  const origin = zonedEpochSlotsToIso(slots);
  return {
    origin: origin,
    ie: slots.epochNanoseconds,
    calendar: calendar,
    he: movedIsoDate => getSingleInstantFor(timeZone, combineDateAndTime(movedIsoDate, origin))
  };
}

function moveRelativeToEpochNano(relativeOps, dateDuration) {
  return durationHasDateParts(dateDuration) ? relativeOps.he(moveDate(relativeOps.calendar, relativeOps.origin, dateDuration)) : relativeOps.ie;
}

function spanRelativeDuration(relativeToSlots, durationFields, largestUnit) {
  const {calendar: calendar} = relativeToSlots;
  if (isZonedEpochSlots(relativeToSlots)) {
    const {timeZone: timeZone} = relativeToSlots;
    const endSlots = moveZonedEpochSlots(relativeToSlots, durationFields);
    return [ diffZonedEpochsExact(timeZone, calendar, relativeToSlots, endSlots, largestUnit), endSlots.epochNanoseconds, createZonedRelativeOps(calendar, timeZone, relativeToSlots) ];
  }
  const origin = checkIsoDateTimeInBounds(combineDateAndTime(relativeToSlots, timeFieldDefaults));
  const end = moveDateTime(calendar, origin, durationFields);
  return [ diffDateTimesExact(calendar, origin, end, largestUnit), isoDateTimeToEpochNano(end), createDateRelativeOps(calendar, relativeToSlots) ];
}

function moveRelativeEndpointToEpochNano(relativeToSlots, durationFields) {
  return isZonedEpochSlots(relativeToSlots) ? moveZonedEpochSlots(relativeToSlots, durationFields).epochNanoseconds : isoDateTimeToEpochNano(moveDateTime(relativeToSlots.calendar, combineDateAndTime(relativeToSlots, timeFieldDefaults), durationFields));
}

function isZonedEpochSlots(slots) {
  return "timeZone" in slots;
}

function isUniformUnit(unit, isZoned) {
  return unit <= 6 - (isZoned ? 1 : 0);
}

function nanoToGivenFields(nano, largestUnit, fieldNames) {
  const fields = {};
  for (let unit = largestUnit; unit >= 0; unit--) {
    const divisor = unitNanoMap[unit];
    fields[fieldNames[unit]] = divTrunc(nano, divisor), nano = modTrunc(nano, divisor);
  }
  return fields;
}

const maxDurationSeconds = 2 ** 53;

function addDurations(refineRelativeTo, doSubtract, slots, otherSlots, options) {
  const relativeToSlots = refineRelativeTo(normalizeOptions(options).relativeTo);
  const maxUnit = Math.max(getMaxDurationUnit(slots), getMaxDurationUnit(otherSlots));
  return isUniformUnit(maxUnit, relativeToSlots && isZonedEpochSlots(relativeToSlots)) ? addDayTimeDurationsChecked(doSubtract, slots, otherSlots, maxUnit) : (relativeToSlots || throwRangeError("Missing relativeTo"), 
  doSubtract && (otherSlots = negateDurationFields(otherSlots)), createDurationSlots(((relativeToSlots, durationFields0, durationFields1, largestUnit) => {
    const {calendar: calendar} = relativeToSlots;
    if (isZonedEpochSlots(relativeToSlots)) {
      const {timeZone: timeZone} = relativeToSlots;
      const midSlots = moveZonedEpochSlots(relativeToSlots, durationFields0);
      return diffZonedEpochsExact(timeZone, calendar, relativeToSlots, moveZonedEpochSlots(midSlots, durationFields1), largestUnit);
    }
    const origin = combineDateAndTime(relativeToSlots, timeFieldDefaults);
    const mid = moveDateTime(calendar, origin, durationFields0);
    return diffDateTimesExact(calendar, origin, moveDateTime(calendar, mid, durationFields1), largestUnit);
  })(relativeToSlots, slots, otherSlots, maxUnit)));
}

function addDayTimeDurationsChecked(doSubtract, slots, otherSlots, maxUnit) {
  return createDurationSlots(validateDurationFields(((a, b, largestUnit, doSubtract) => {
    const combined = durationDayTimeToBigNano(a) + durationDayTimeToBigNano(b) * BigInt(doSubtract ? -1 : 1);
    return Number.isFinite(Number(combined / bigNanoInUtcDay)) || throwRangeError(outOfBoundsDate), 
    {
      ...durationFieldDefaults,
      ...nanoToDurationDayTimeFields(combined, largestUnit)
    };
  })(slots, otherSlots, maxUnit, doSubtract)));
}

function roundDuration(refineRelativeTo, slots, options) {
  const durationLargestUnit = getMaxDurationUnit(slots);
  const [largestUnit, smallestUnit, roundingInc, roundingMode, relativeToSlots] = ((options, defaultLargestUnit, refineRelativeTo) => {
    options = normalizeOptionsOrString(options, smallestUnitStr);
    let largestUnit = coerceLargestUnit(options);
    const relativeToInternals = refineRelativeTo(options.relativeTo);
    let roundingInc = coerceRoundingIncInteger(options);
    const roundingMode = coerceRoundingMode(options, 7);
    let smallestUnit = coerceSmallestUnit(options);
    return void 0 === largestUnit && void 0 === smallestUnit && throwRangeError("Required smallestUnit or largestUnit"), 
    null == smallestUnit && (smallestUnit = 0), null == largestUnit && (largestUnit = Math.max(smallestUnit, defaultLargestUnit)), 
    checkLargestSmallestUnit(largestUnit, smallestUnit), roundingInc = validateRoundingInc(roundingInc, smallestUnit, 1), 
    roundingInc > 1 && smallestUnit > 5 && largestUnit !== smallestUnit && throwRangeError("For calendar units with roundingIncrement > 1, use largestUnit = smallestUnit"), 
    [ largestUnit, smallestUnit, roundingInc, roundingMode, relativeToInternals ];
  })(options, durationLargestUnit, refineRelativeTo);
  if (!relativeToSlots && Math.max(durationLargestUnit, largestUnit) <= 6) {
    return createDurationSlots(validateDurationFields(((durationFields, largestUnit, smallestUnit, roundingInc, roundingMode) => {
      const roundedBigNano = roundBigNanoToInc(durationDayTimeToBigNano(durationFields), computeBigNanoInc(smallestUnit, roundingInc), roundingMode);
      return {
        ...durationFieldDefaults,
        ...nanoToDurationDayTimeFields(roundedBigNano, largestUnit)
      };
    })(slots, largestUnit, smallestUnit, roundingInc, roundingMode)));
  }
  const isZoned = relativeToSlots && isZonedEpochSlots(relativeToSlots);
  const needsZonedDayLength = isZoned && largestUnit >= 6 && smallestUnit < 6;
  if (!slots.sign && !needsZonedDayLength) {
    return slots;
  }
  relativeToSlots || throwRangeError("Missing relativeTo");
  const [balancedDuration, endEpochNano, relativeOps] = spanRelativeDuration(relativeToSlots, slots, largestUnit);
  return createDurationSlots(roundRelativeDuration(balancedDuration, endEpochNano, largestUnit, smallestUnit, roundingInc, roundingMode, relativeOps, isZoned));
}

function absDuration(slots) {
  return -1 === slots.sign ? negateDuration(slots) : slots;
}

function negateDuration(slots) {
  return createDurationSlots(negateDurationFields(slots));
}

function negateDurationFields(fields) {
  const res = {};
  for (const fieldName of durationFieldNamesAsc) {
    res[fieldName] = -1 * fields[fieldName] || 0;
  }
  return res;
}

function computeDurationSign(fields, fieldNames = durationFieldNamesAsc) {
  let sign = 0;
  for (const fieldName of fieldNames) {
    const fieldSign = Math.sign(fields[fieldName]);
    fieldSign && (sign && sign !== fieldSign && throwRangeError("Cannot mix duration signs"), 
    sign = fieldSign);
  }
  return sign;
}

function validateDurationFields(fields) {
  for (const calendarUnit of durationCalendarFieldNamesAsc) {
    clampEntity(calendarUnit, fields[calendarUnit], -4294967295, 4294967295, 1);
  }
  const bigNano = durationDayTimeToBigNano(fields);
  return validateDurationTimeUnit(Number(bigNano / bigNanoInSec)), fields;
}

function validateDurationTimeUnit(n) {
  Number.isSafeInteger(n) || throwRangeError("Out-of-bounds duration");
}

function durationDayTimeToBigNano(fields) {
  return BigInt(fields.days) * bigNanoInUtcDay + durationTimeToBigNano(fields);
}

function durationTimeToBigNano(fields) {
  return BigInt(fields.hours) * bigNanoInHour + BigInt(fields.minutes) * bigNanoInMinute + durationSubMinuteToBigNano(fields);
}

function durationSubMinuteToBigNano(fields) {
  return BigInt(fields.seconds) * bigNanoInSec + BigInt(fields.milliseconds) * bigNanoInMilli + BigInt(fields.microseconds) * bigNanoInMicro + BigInt(fields.nanoseconds);
}

function nanoToDurationDayTimeFields(bigNano, largestUnit = 6) {
  const days = Number(bigNano / bigNanoInUtcDay);
  const timeNano = Number(bigNano % bigNanoInUtcDay);
  const unitNano = unitNanoMap[largestUnit];
  const largestUnitVal = largestUnit <= 3 ? Number(bigNano / BigInt(unitNano)) : days * (nanoInUtcDay / unitNano) + divTrunc(timeNano, unitNano);
  Number.isFinite(largestUnitVal) || throwRangeError(outOfBoundsDate), largestUnit <= 3 && Math.abs(largestUnitVal) / (nanoInSec / unitNanoMap[largestUnit]) >= maxDurationSeconds && throwRangeError(outOfBoundsDate);
  const dayTimeFields = nanoToGivenFields(timeNano, largestUnit, durationFieldNamesAsc);
  return dayTimeFields[durationFieldNamesAsc[largestUnit]] = largestUnitVal, dayTimeFields;
}

function nanoToDurationTimeFields(nano, largestUnit = 5) {
  return nanoToGivenFields(nano, largestUnit, durationFieldNamesAsc);
}

function durationHasDateParts(fields) {
  return Boolean(computeDurationSign(fields, durationDateFieldNamesAsc));
}

function getMaxDurationUnit(fields) {
  let unit = 9;
  for (;unit > 0 && !fields[durationFieldNamesAsc[unit]]; unit--) {}
  return unit;
}

function compareZonedEpochSlots(zonedEpochSlots0, zonedEpochSlots1) {
  return compareBigInts(zonedEpochSlots0.epochNanoseconds, zonedEpochSlots1.epochNanoseconds);
}

function compareDurations(refineRelativeTo, durationSlots0, durationSlots1, options) {
  const relativeToSlots = refineRelativeTo(normalizeOptions(options).relativeTo);
  const maxUnit = Math.max(getMaxDurationUnit(durationSlots0), getMaxDurationUnit(durationSlots1));
  return allPropsEqual(durationFieldNamesAsc, durationSlots0, durationSlots1) ? 0 : isUniformUnit(maxUnit, relativeToSlots && isZonedEpochSlots(relativeToSlots)) ? compareBigInts(durationDayTimeToBigNano(durationSlots0), durationDayTimeToBigNano(durationSlots1)) : (relativeToSlots || throwRangeError("Missing relativeTo"), 
  compareBigInts(moveRelativeEndpointToEpochNano(relativeToSlots, durationSlots0), moveRelativeEndpointToEpochNano(relativeToSlots, durationSlots1)));
}

function compareIsoDateTimeFields(isoDateTime0, isoDateTime1) {
  return compareIsoDateFields(isoDateTime0, isoDateTime1) || compareTimeFields(isoDateTime0, isoDateTime1);
}

function compareIsoDateFields(isoFields0, isoFields1) {
  return compareNumbers(isoDateToEpochDays(isoFields0), isoDateToEpochDays(isoFields1));
}

function compareTimeFields(isoFields0, isoFields1) {
  return compareNumbers(timeFieldsToNano(isoFields0), timeFieldsToNano(isoFields1));
}

function instantsEqual(instantSlots0, instantSlots1) {
  return !compareZonedEpochSlots(instantSlots0, instantSlots1);
}

function zonedDateTimesEqual(zonedDateTimeSlots0, zonedDateTimeSlots1) {
  return !compareZonedEpochSlots(zonedDateTimeSlots0, zonedDateTimeSlots1) && zonedDateTimeSlots0.timeZone.m === zonedDateTimeSlots1.timeZone.m && zonedDateTimeSlots0.calendar === zonedDateTimeSlots1.calendar;
}

function plainDateTimesEqual(plainDateTimeSlots0, plainDateTimeSlots1) {
  return !compareIsoDateTimeFields(plainDateTimeSlots0, plainDateTimeSlots1) && plainDateTimeSlots0.calendar === plainDateTimeSlots1.calendar;
}

function plainDatesEqual(plainDateSlots0, plainDateSlots1) {
  return !compareIsoDateFields(plainDateSlots0, plainDateSlots1) && plainDateSlots0.calendar === plainDateSlots1.calendar;
}

function plainYearMonthsEqual(plainYearMonthSlots0, plainYearMonthSlots1) {
  return !compareIsoDateFields(plainYearMonthSlots0, plainYearMonthSlots1) && plainYearMonthSlots0.calendar === plainYearMonthSlots1.calendar;
}

function plainMonthDaysEqual(plainMonthDaySlots0, plainMonthDaySlots1) {
  return !compareIsoDateFields(plainMonthDaySlots0, plainMonthDaySlots1) && plainMonthDaySlots0.calendar === plainMonthDaySlots1.calendar;
}

function plainTimesEqual(plainTimeSlots0, plainTimeSlots1) {
  return !compareTimeFields(plainTimeSlots0, plainTimeSlots1);
}

function getCalendarEraOrigins(calendar) {
  return 0 === calendar ? gregoryEraOrigins : calendar ? calendar.k : void 0;
}

function getCalendarFieldNames(calendar, fieldNames, fieldNamesWithEra = fieldNames) {
  return getCalendarEraOrigins(calendar) ? fieldNamesWithEra : fieldNames;
}

function resolveCalendarYear(calendar, fields) {
  const exoticCalendar = calendar || void 0;
  const eraOrigins = getCalendarEraOrigins(calendar);
  let {era: era, eraYear: eraYear, year: year} = fields;
  if (void 0 !== year && (year = toIntegerWithTrunc(year, "year")), void 0 !== eraYear && (eraYear = toIntegerWithTrunc(eraYear, "eraYear")), 
  void 0 !== era || void 0 !== eraYear) {
    void 0 !== era && void 0 !== eraYear || throwTypeError("Mismatching era/eraYear"), 
    eraOrigins || throwRangeError("Forbidden era/eraYear");
    const normalizedEra = normalizeEraName(era);
    const eraOrigin = eraOrigins[normalizedEra];
    void 0 === eraOrigin && throwRangeError((era => `Invalid era: ${era}`)(era));
    const yearByEra = exoticCalendar?.$ ? exoticCalendar.$(eraYear, normalizedEra, eraOrigin) : eraYearToYear(eraYear, eraOrigin);
    void 0 !== year && year !== yearByEra && throwRangeError("Mismatching year/eraYear"), 
    year = yearByEra;
  } else {
    void 0 === year && throwTypeError(missingYear(eraOrigins));
  }
  return year;
}

function resolveCalendarMonth(calendar, fields, year, overflow, monthCodeParts) {
  let {month: month, monthCode: monthCode} = fields;
  if (void 0 !== monthCode) {
    const monthByCode = ((calendar, monthCode, year, overflow, monthCodeParts = parseMonthCode(monthCode)) => {
      const leapMonth = calendar ? calendar.p(year) : void 0;
      const [monthCodeNumber, wantsLeapMonth] = monthCodeParts;
      let month = monthCodeNumberToMonth(monthCodeNumber, wantsLeapMonth, leapMonth);
      if (wantsLeapMonth) {
        const leapMonthMeta = calendar ? calendar.l : void 0;
        void 0 === leapMonthMeta && throwRangeError(invalidLeapMonth), leapMonthMeta > 0 ? (month > leapMonthMeta && throwRangeError(invalidLeapMonth), 
        leapMonth !== month && (1 === overflow && throwRangeError(invalidLeapMonth), month = monthCodeNumberToMonth(monthCodeNumber, 0, leapMonth))) : (month !== -leapMonthMeta && throwRangeError(invalidLeapMonth), 
        void 0 === leapMonth && 1 === overflow && throwRangeError(invalidLeapMonth));
      }
      return month;
    })(calendar, monthCode, year, overflow, monthCodeParts);
    void 0 !== month && month !== monthByCode && throwRangeError("Mismatching month/monthCode"), 
    month = monthByCode, overflow = 1;
  } else {
    void 0 === month && throwTypeError("Missing month/monthCode");
  }
  return clampEntity("month", month, 1, computeCalendarMonthsInYearForYear(calendar, year), overflow);
}

function resolveCalendarDay(calendar, fields, month, year, overflow) {
  return clampProp(fields, "day", 1, computeCalendarDaysInMonthForYearMonth(calendar, year, month), overflow);
}

function eraYearToYear(eraYear, eraOrigin) {
  return (eraOrigin + eraYear) * (Math.sign(eraOrigin) || 1) || 0;
}

function resolveTimeFields(fields, overflow) {
  return constrainTimeFields(pluckProps(timeFieldNamesAsc, {
    ...timeFieldDefaults,
    ...fields
  }), overflow);
}

const offsetRegExp = /*@__PURE__*/ createRegExp("([+-])(\\d{2})(?::?(\\d{2})(?::?(\\d{2})(?:[.,](\\d{1,9}))?)?)?");

function parseOffsetNano(s) {
  const offsetNano = parseOffsetNanoMaybe(s);
  return void 0 === offsetNano && throwRangeError(failedParse(s)), offsetNano;
}

function parseOffsetNanoMaybe(s, onlyHourMinute) {
  const parts = offsetRegExp.exec(s);
  if (parts && (s => (s => {
    "T" !== s[0] && "t" !== s[0] || (s = s.slice(1));
    const fractionIndex = s.search(/[.,]/);
    const main = fractionIndex < 0 ? s : s.slice(0, fractionIndex);
    const parts = main.split(":");
    return 1 === parts.length ? /^(?:\d{2}|\d{4}|\d{6})$/i.test(main) : (2 === parts.length || 3 === parts.length) && parts.every(part => 2 === part.length && /^\d{2}$/i.test(part));
  })(s.slice(1)))(parts[0])) {
    return ((parts, onlyHourMinute) => {
      const firstSubMinutePart = parts[4] || parts[5];
      onlyHourMinute && firstSubMinutePart && throwRangeError(invalidSubstring(firstSubMinutePart));
      const offsetNanoPos = parseInt0(parts[2]) * nanoInHour + parseInt0(parts[3]) * nanoInMinute + parseInt0(parts[4]) * nanoInSec + parseSubsecNano(parts[5] || "");
      return offsetNano = offsetNanoPos * parseSign(parts[1]), Math.abs(offsetNano) >= nanoInUtcDay && throwRangeError("Out-of-bounds offset"), 
      offsetNano;
      var offsetNano;
    })(parts, onlyHourMinute);
  }
}

const dateFieldRefiners = {
  era: toStringViaPrimitive,
  month: toPositiveIntegerWithTruncation,
  monthCode(monthCode, entityName) {
    if ("string" == typeof monthCode) {
      return monthCode;
    }
    if (monthCode && "object" == typeof monthCode) {
      const monthCodeToString = monthCode.toString;
      if ("function" == typeof monthCodeToString) {
        return requireString(monthCodeToString.call(monthCode), entityName);
      }
    }
    return requireString(monthCode, entityName);
  },
  day: toPositiveIntegerWithTruncation
};

const timeFieldRefiners = /*@__PURE__*/ zipPropsConst(timeFieldNamesAsc, toIntegerWithTrunc);

const durationFieldRefiners = /*@__PURE__*/ zipPropsConst(durationFieldNamesAsc, toStrictInteger);

const dateTimeFieldRefiners = /*@__PURE__*/ Object.assign({}, dateFieldRefiners, timeFieldRefiners);

const zonedDateTimeFieldRefiners = {
  offset(offsetString) {
    return parseOffsetNano(toStringViaPrimitive(offsetString));
  },
  ...dateTimeFieldRefiners
};

function readAndRefineBagFields(bag, validFieldNames, fieldRefiners, requiredFieldNames, disallowEmpty = !requiredFieldNames) {
  const res = {};
  let anyMatching = 0;
  for (const fieldName of validFieldNames) {
    let fieldVal = bag[fieldName];
    if (void 0 !== fieldVal) {
      anyMatching = 1;
      const refiner = fieldRefiners[fieldName];
      refiner && (fieldVal = refiner(fieldVal, fieldName)), res[fieldName] = fieldVal;
    } else {
      requiredFieldNames && requiredFieldNames.includes(fieldName) && throwTypeError(missingField(fieldName));
    }
  }
  return disallowEmpty && !anyMatching && throwTypeError(noValidFields(validFieldNames)), 
  res;
}

function createPlainDateTimeFromRefinedFields(isoDate, time = timeFieldDefaults, calendar) {
  const isoDateTime = combineDateAndTime(isoDate, time);
  return checkIsoDateTimeInBounds(isoDateTime), createDateTimeSlots(isoDateTime, calendar);
}

function createPlainDateFromFields(calendar, fields, options) {
  return createPlainDateFromPreparedFields(calendar, fields, prepareDateFields(calendar, fields), refineOverflowOptions(options));
}

function createPlainDateFromFieldsWithOptionsRefiner(calendar, fields, refineOptions) {
  const prepared = prepareDateFields(calendar, fields);
  const refinedOptions = refineOptions();
  return [ createPlainDateFromPreparedFields(calendar, fields, prepared, refinedOptions[0]), ...refinedOptions ];
}

function createPlainDateFromPreparedFields(calendar, fields, prepared, overflow) {
  const year = prepared[1];
  const month = resolveCalendarMonth(calendar, fields, year, overflow, prepared[0]);
  return createDateSlots(checkIsoDateInBounds(computeCalendarIsoFieldsFromParts(calendar, year, month, resolveCalendarDay(calendar, fields, month, year, overflow))), calendar);
}

function parseMonthCodeField(fields) {
  if (void 0 !== fields.monthCode) {
    return parseMonthCode(fields.monthCode);
  }
}

function prepareDateFields(calendar, fields) {
  const eraOrigins = getCalendarEraOrigins(calendar);
  return void 0 !== fields.year || void 0 !== fields.era && void 0 !== fields.eraYear || throwTypeError(missingYear(eraOrigins)), 
  void 0 === fields.monthCode && void 0 === fields.month && throwTypeError("Missing month/monthCode"), 
  void 0 === fields.day && throwTypeError(missingField("day")), [ parseMonthCodeField(fields), resolveCalendarYear(calendar, fields) ];
}

function createPlainYearMonthFromFields(calendar, fields, options) {
  const eraOrigins = getCalendarEraOrigins(calendar);
  void 0 !== fields.year || void 0 !== fields.era && void 0 !== fields.eraYear || throwTypeError(missingYear(eraOrigins)), 
  void 0 === fields.monthCode && void 0 === fields.month && throwTypeError("Missing month/monthCode");
  const monthCodeParts = parseMonthCodeField(fields);
  const year = resolveCalendarYear(calendar, fields);
  return createDateSlots(checkIsoYearMonthInBounds(computeCalendarIsoFieldsFromParts(calendar, year, resolveCalendarMonth(calendar, fields, year, refineOverflowOptions(options), monthCodeParts), 1)), calendar);
}

function createPlainMonthDayFromFields(calendar, fields, options) {
  const isIso = calendar === isoCalendarImpl;
  const eraOrigins = getCalendarEraOrigins(calendar);
  void 0 === fields.day && throwTypeError(missingField("day")), isIso || void 0 === fields.month || void 0 !== fields.year || void 0 !== fields.era && void 0 !== fields.eraYear || throwTypeError(missingYear(eraOrigins));
  const monthCodeParts = parseMonthCodeField(fields);
  let yearMaybe = void 0 !== fields.eraYear || void 0 !== fields.year ? resolveCalendarYear(calendar, fields) : void 0;
  const overflow = refineOverflowOptions(options);
  let day;
  let monthCodeNumber;
  let isLeapMonth;
  if (void 0 === yearMaybe && isIso && (yearMaybe = 1972), void 0 !== yearMaybe) {
    isIso || checkIsoDateInBounds(computeCalendarIsoFieldsFromParts(calendar, yearMaybe, 1, 1));
    const month = resolveCalendarMonth(calendar, fields, yearMaybe, overflow, monthCodeParts);
    day = resolveCalendarDay(calendar, fields, month, yearMaybe, overflow), [monthCodeNumber, isLeapMonth] = computeCalendarMonthCodeParts(calendar, yearMaybe, month);
  } else {
    void 0 === fields.monthCode && throwTypeError("Missing month/monthCode"), [monthCodeNumber, isLeapMonth] = monthCodeParts;
    const referenceYear = calendar ? calendar.ne : 1972;
    if (void 0 !== referenceYear) {
      day = resolveCalendarDay(calendar, fields, resolveCalendarMonth(calendar, fields, referenceYear, overflow, monthCodeParts), referenceYear, overflow);
    } else {
      const constrainedDay = 0 === overflow && calendar ? calendar.fe?.(monthCodeNumber, isLeapMonth, fields.day) : void 0;
      day = void 0 !== constrainedDay ? constrainedDay : fields.day;
    }
  }
  isLeapMonth && ((calendar && calendar.U?.[monthCodeNumber]) ?? 1 / 0) < fields.day && (1 === overflow && throwRangeError(invalidLeapMonth), 
  isLeapMonth = 0, day = constrainToRange(fields.day, 1, (calendar && calendar.R) ?? 1 / 0));
  let res = calendar ? calendar.u(monthCodeNumber, Boolean(isLeapMonth), day) : computeIsoYearMonthFieldsForMonthDay(monthCodeNumber, Boolean(isLeapMonth));
  for (;!res && 0 === overflow && day > 1; ) {
    day--, res = calendar ? calendar.u(monthCodeNumber, Boolean(isLeapMonth), day) : computeIsoYearMonthFieldsForMonthDay(monthCodeNumber, Boolean(isLeapMonth));
  }
  res || throwRangeError("Cannot guess year");
  const {year: finalYear, month: finalMonth} = res;
  return createDateSlots(checkIsoDateInBounds(computeCalendarIsoFieldsFromParts(calendar, finalYear, finalMonth, day)), calendar);
}

const RawDateTimeFormat = Intl.DateTimeFormat;

function formatEpochMilliToPartsRecord(intlFormat, epochMilli) {
  epochMilli < -864e13 && throwRangeError(outOfBoundsDate);
  const parts = intlFormat.formatToParts(epochMilli);
  const hash = {};
  for (const part of parts) {
    hash[part.type] = part.value;
  }
  return hash;
}

const timeZonePeriodDaysByName = {
  "El_Aaiun": 17,
  "Tucuman": 12,
  "Tirane": 11,
  "Riga": 10,
  "Simferopol": 9,
  "Vienna": 9,
  "Tunis": 8,
  "Boa_Vista": 6,
  "Fortaleza": 6,
  "Maceio": 6,
  "Noronha": 6,
  "Recife": 6,
  "Gaza": 6,
  "Hebron": 6,
  "DeNoronha": 6
};

const minPossibleTransitionSec = -388152e4;

function refineTimeDisplayTuple(options, maxSmallestUnit = 4) {
  const subsecDigits = coerceFractionalSecondDigits(options);
  const roundingMode = coerceRoundingMode(options, 4);
  const smallestUnit = coerceSmallestUnit(options);
  return [ roundingMode, ...resolveSmallestUnitAndSubsecDigits(validateUnitRange(smallestUnitStr, smallestUnit, 0, maxSmallestUnit), subsecDigits) ];
}

function refineDateDisplayOptions(options) {
  return coerceCalendarDisplay(normalizeOptions(options));
}

function refineTimeDisplayOptions(options, maxSmallestUnit) {
  return refineTimeDisplayTuple(normalizeOptions(options), maxSmallestUnit);
}

function resolveSmallestUnitAndSubsecDigits(smallestUnit, subsecDigits) {
  return null != smallestUnit ? [ unitNanoMap[smallestUnit], smallestUnit < 4 ? 9 - 3 * smallestUnit : -1 ] : [ void 0 === subsecDigits ? 1 : 10 ** (9 - subsecDigits), subsecDigits ];
}

function formatInstantIso(refineTimeZoneString, instantSlots, options) {
  const [timeZoneArg, roundingMode, nanoInc, subsecDigits] = (options => {
    const subsecDigits = coerceFractionalSecondDigits(options = normalizeOptions(options));
    const roundingMode = coerceRoundingMode(options, 4);
    const smallestUnit = coerceSmallestUnit(options);
    return [ options.timeZone, roundingMode, ...resolveSmallestUnitAndSubsecDigits(validateUnitRange(smallestUnitStr, smallestUnit, 0, 4), subsecDigits) ];
  })(options);
  const providedTimeZone = void 0 !== timeZoneArg;
  return ((providedTimeZone, timeZone, epochNano, roundingMode, nanoInc, subsecDigits) => {
    epochNano = roundBigNanoToDayOriginInc(epochNano, BigInt(nanoInc), roundingMode);
    const offsetNano = timeZone.B(epochNano);
    return formatIsoDateTimeFields(epochNanoToIsoDateTime(epochNano + BigInt(offsetNano)), subsecDigits) + (providedTimeZone ? formatOffsetNano(roundToMinute(offsetNano)) : "Z");
  })(providedTimeZone, queryTimeZone(providedTimeZone ? refineTimeZoneString(timeZoneArg) : "UTC"), instantSlots.epochNanoseconds, roundingMode, nanoInc, subsecDigits);
}

function formatZonedDateTimeIso(zonedDateTimeSlots0, options) {
  const displayOptions = (options => {
    options = normalizeOptions(options);
    const calendarDisplay = coerceCalendarDisplay(options);
    const subsecDigits = coerceFractionalSecondDigits(options);
    const offsetDisplay = coerceOffsetDisplay(options);
    const roundingMode = coerceRoundingMode(options, 4);
    const smallestUnit = coerceSmallestUnit(options);
    return [ calendarDisplay, coerceTimeZoneDisplay(options), offsetDisplay, roundingMode, ...resolveSmallestUnitAndSubsecDigits(validateUnitRange(smallestUnitStr, smallestUnit, 0, 4), subsecDigits) ];
  })(options);
  return ((calendar, timeZoneId, timeZone, epochNano, calendarDisplay, timeZoneDisplay, offsetDisplay, roundingMode, nanoInc, subsecDigits) => {
    epochNano = roundBigNanoToDayOriginInc(epochNano, BigInt(nanoInc), roundingMode);
    const offsetNano = timeZone.B(epochNano);
    return formatIsoDateTimeFields(epochNanoToIsoDateTime(epochNano + BigInt(offsetNano)), subsecDigits) + formatOffsetNano(roundToMinute(offsetNano), offsetDisplay) + formatTimeZone(timeZoneId, timeZoneDisplay) + formatCalendar(calendar, calendarDisplay);
  })(zonedDateTimeSlots0.calendar, zonedDateTimeSlots0.timeZone.id, zonedDateTimeSlots0.timeZone, zonedDateTimeSlots0.epochNanoseconds, ...displayOptions);
}

function formatPlainDateTimeIso(plainDateTimeSlots0, options) {
  const displayOptions = (options => (options = normalizeOptions(options), [ coerceCalendarDisplay(options), ...refineTimeDisplayTuple(options) ]))(options);
  return ((calendar, isoDateTime, calendarDisplay, roundingMode, nanoInc, subsecDigits) => formatIsoDateTimeFields(roundDateTimeToNano(isoDateTime, nanoInc, roundingMode), subsecDigits) + formatCalendar(calendar, calendarDisplay))(plainDateTimeSlots0.calendar, plainDateTimeSlots0, ...displayOptions);
}

function formatPlainDateIso(plainDateSlots, options) {
  return calendar = plainDateSlots.calendar, isoDate = plainDateSlots, calendarDisplay = refineDateDisplayOptions(options), 
  formatIsoDateFields(isoDate) + formatCalendar(calendar, calendarDisplay);
  var calendar, isoDate, calendarDisplay;
}

function formatPlainYearMonthIso(plainYearMonthSlots, options) {
  return formatDateLikeIso(plainYearMonthSlots.calendar, formatIsoYearMonthFields, plainYearMonthSlots, refineDateDisplayOptions(options));
}

function formatPlainMonthDayIso(plainMonthDaySlots, options) {
  return formatDateLikeIso(plainMonthDaySlots.calendar, formatIsoMonthDayFields, plainMonthDaySlots, refineDateDisplayOptions(options));
}

function formatDateLikeIso(calendar, formatSimple, isoDate, calendarDisplay) {
  const showCalendar = calendarDisplay > 1 || 0 === calendarDisplay && calendar !== isoCalendarImpl;
  return 1 === calendarDisplay ? calendar === isoCalendarImpl ? formatSimple(isoDate) : formatIsoDateFields(isoDate) : showCalendar ? formatIsoDateFields(isoDate) + formatCalendarId(getCalendarSlotId(calendar), 2 === calendarDisplay) : formatSimple(isoDate);
}

function formatPlainTimeIso(slots, options) {
  return ((fields, roundingMode, nanoInc, subsecDigits) => formatTimeFields(roundTimeToNano(fields, nanoInc, roundingMode)[0], subsecDigits))(slots, ...refineTimeDisplayOptions(options));
}

function formatDurationIso(slots, options) {
  const [roundingMode, nanoInc, subsecDigits] = refineTimeDisplayOptions(options, 3);
  return nanoInc > 1 && validateDurationFields(slots = {
    ...slots,
    ...roundDayTimeDurationByInc(slots, nanoInc, roundingMode)
  }), formatDurationSlots(slots, subsecDigits);
}

function formatDurationSlots(durationSlots, subsecDigits) {
  const {sign: sign} = durationSlots;
  const abs = -1 === sign ? negateDurationFields(durationSlots) : durationSlots;
  const {hours: hours, minutes: minutes} = abs;
  const bigNano = durationSubMinuteToBigNano(abs);
  const wholeSec = Number(bigNano / bigNanoInSec);
  const subsecNano = Number(bigNano % bigNanoInSec);
  validateDurationTimeUnit(wholeSec);
  const subsecNanoString = formatSubsecNano(subsecNano, subsecDigits);
  const forceSec = subsecDigits >= 0 || !sign || subsecNanoString;
  return (sign < 0 ? "-" : "") + "P" + formatDurationFragments({
    "Y": formatDurationNumber(abs.years),
    "M": formatDurationNumber(abs.months),
    "W": formatDurationNumber(abs.weeks),
    "D": formatDurationNumber(abs.days)
  }) + (hours || minutes || wholeSec || forceSec ? "T" + formatDurationFragments({
    "H": formatDurationNumber(hours),
    "M": formatDurationNumber(minutes),
    "S": formatDurationNumber(wholeSec, forceSec) + subsecNanoString
  }) : "");
}

function formatDurationFragments(fragObj) {
  const parts = [];
  for (const fragName in fragObj) {
    const fragVal = fragObj[fragName];
    fragVal && parts.push(fragVal, fragName);
  }
  return parts.join("");
}

function formatDurationNumber(n, force) {
  if (!n && !force) {
    return "";
  }
  const options = Object.create(null);
  return options.useGrouping = 0, n.toLocaleString("fullwide", options);
}

function formatIsoDateTimeFields(isoDateTime, subsecDigits) {
  return formatIsoDateFields(isoDateTime) + "T" + formatTimeFields(isoDateTime, subsecDigits);
}

function formatIsoDateFields(isoDateFields) {
  return formatIsoYearMonthFields(isoDateFields) + "-" + padNumber2(isoDateFields.day);
}

function formatIsoYearMonthFields(isoDateFields) {
  const {year: year} = isoDateFields;
  return (year < 0 || year > 9999 ? getSignStr(year) + padNumber(6, Math.abs(year)) : padNumber(4, year)) + "-" + padNumber2(isoDateFields.month);
}

function formatIsoMonthDayFields(isoDateFields) {
  return padNumber2(isoDateFields.month) + "-" + padNumber2(isoDateFields.day);
}

function formatTimeFields(timeFields, subsecDigits) {
  const parts = [ padNumber2(timeFields.hour), padNumber2(timeFields.minute) ];
  return -1 !== subsecDigits && parts.push(padNumber2(timeFields.second) + ((millisecond, microsecond, nanosecond, subsecDigits) => formatSubsecNano(millisecond * nanoInMilli + microsecond * nanoInMicro + nanosecond, subsecDigits))(timeFields.millisecond, timeFields.microsecond, timeFields.nanosecond, subsecDigits)), 
  parts.join(":");
}

function formatOffsetNano(offsetNano, offsetDisplay = 0) {
  if (1 === offsetDisplay) {
    return "";
  }
  const [hour, nanoRemainder0] = divModFloor(Math.abs(offsetNano), nanoInHour);
  const [minute, nanoRemainder1] = divModFloor(nanoRemainder0, nanoInMinute);
  const [second, nanoRemainder2] = divModFloor(nanoRemainder1, nanoInSec);
  return getSignStr(offsetNano) + padNumber2(hour) + ":" + padNumber2(minute) + (second || nanoRemainder2 ? ":" + padNumber2(second) + formatSubsecNano(nanoRemainder2) : "");
}

function formatTimeZone(timeZoneId, timeZoneDisplay) {
  return 1 !== timeZoneDisplay ? "[" + (2 === timeZoneDisplay ? "!" : "") + timeZoneId + "]" : "";
}

function formatCalendar(calendar, calendarDisplay) {
  return calendarDisplay > 1 || 0 === calendarDisplay && calendar !== isoCalendarImpl ? formatCalendarId(getCalendarSlotId(calendar), 2 === calendarDisplay) : "";
}

function formatCalendarId(calendarId, isCritical) {
  return "[" + (isCritical ? "!" : "") + "u-ca=" + calendarId + "]";
}

const trailingZerosRE = /0+$/;

function formatSubsecNano(totalNano, subsecDigits) {
  let s = padNumber(9, totalNano);
  return s = void 0 === subsecDigits ? s.replace(trailingZerosRE, "") : s.slice(0, subsecDigits), 
  s ? "." + s : "";
}

function getSignStr(num) {
  return num < 0 ? "-" : "+";
}

const icuRegExp = /^(AC|AE|AG|AR|AS|BE|BS|CA|CN|CS|CT|EA|EC|IE|IS|JS|MI|NE|NS|PL|PN|PR|PS|SS|VS)T$/;

const badCharactersRegExp = /[^\w\/:+-]+/;

function refineTimeZoneId(rawId) {
  return resolveTimeZoneId(requireString(rawId));
}

function resolveTimeZoneId(rawId) {
  return resolveTimeZoneRecord(rawId).id;
}

function resolveTimeZoneRecord(rawId) {
  const upperRawId = rawId.toUpperCase();
  const offsetRecord = (upperRawId => {
    const offsetNano = parseOffsetNanoMaybe(upperRawId, 1);
    if (void 0 !== offsetNano) {
      return {
        id: formatOffsetNano(offsetNano),
        X: offsetNano,
        m: offsetNano
      };
    }
  })(upperRawId);
  if (offsetRecord) {
    return {
      kind: "fixed",
      ...offsetRecord
    };
  }
  const normId = "UTC" === upperRawId ? "UTC" : (rawId => (badCharactersRegExp.test(rawId) && throwRangeError(invalidTimeZone(rawId)), 
  icuRegExp.test(rawId) && throwRangeError("Forbidden ICU TimeZone"), rawId.toLowerCase().split("/").map((part, partI) => (part.length <= 3 || /\d/.test(part)) && !/etc|yap/.test(part) ? part.toUpperCase() : part.replace(/baja|dumont|[a-z]+/g, (a, i) => a.length <= 2 && !partI || "in" === a || "chat" === a ? a.toUpperCase() : a.length > 2 || !i ? capitalize(a).replace(/island|noronha|murdo|rivadavia|urville/, capitalize) : a)).join("/")))(rawId);
  return queryNamedTimeZoneRecord(normId);
}

const queryNamedTimeZoneRecord = /*@__PURE__*/ memoize(normId => {
  if ("UTC" === normId) {
    return {
      kind: "utc",
      id: normId,
      m: normId
    };
  }
  const upperNormId = normId.toUpperCase();
  const format = queryTimeZoneIntlFormat(upperNormId);
  return {
    kind: "named",
    id: normId,
    format: format,
    m: format.resolvedOptions().timeZone
  };
});

const queryTimeZoneIntlFormat = /*@__PURE__*/ memoize(upperNormId => new RawDateTimeFormat("en-u-hc-h23", {
  calendar: "iso8601",
  timeZone: upperNormId,
  era: "short",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
}));

function queryTimeZone(rawTimeZoneId) {
  const record = resolveTimeZoneRecord(rawTimeZoneId);
  return queryTimeZoneRecord(record.id, record);
}

const queryTimeZoneRecord = /*@__PURE__*/ memoize((normTimeZoneId, record) => "named" === record.kind ? new IntlTimeZone(normTimeZoneId, record.m, record.format) : new FixedTimeZone(normTimeZoneId, record.m, "fixed" === record.kind ? record.X : 0));

class FixedTimeZone {
  constructor(id, compareKey, offsetNano) {
    this.id = id, this.m = compareKey, this.X = offsetNano;
  }
  B() {
    return this.X;
  }
  N(isoDateTime) {
    return [ isoDateTimeAndOffsetToEpochNano(isoDateTime, this.X) ];
  }
  O() {}
}

class IntlTimeZone {
  constructor(id, compareKey, format) {
    this.id = id, this.m = compareKey, this.ke = ((computeOffsetSec, periodDays) => {
      const getSample = memoize(computeOffsetSec);
      const getSplit = memoize(createSplitTuple);
      const periodSec = 86400 * periodDays;
      function getOffsetSec(epochSec) {
        const [startEpochSec, endEpochSec] = computePeriod(epochSec, periodSec);
        const clampedStartEpochSec = clampIntlSampleEpochSec(startEpochSec);
        const clampedEndEpochSec = clampIntlSampleEpochSec(endEpochSec);
        const startOffsetSec = getSample(clampedStartEpochSec);
        const endOffsetSec = getSample(clampedEndEpochSec);
        return startOffsetSec === endOffsetSec ? startOffsetSec : pinch(getSplit(clampedStartEpochSec, clampedEndEpochSec), startOffsetSec, endOffsetSec, epochSec);
      }
      function pinch(split, startOffsetSec, endOffsetSec, forEpochSec) {
        let offsetSec;
        let splitDurSec;
        for (;(void 0 === forEpochSec || void 0 === (offsetSec = forEpochSec < split[0] ? startOffsetSec : forEpochSec >= split[1] ? endOffsetSec : void 0)) && (splitDurSec = split[1] - split[0]); ) {
          const middleEpochSec = split[0] + Math.floor(splitDurSec / 2);
          computeOffsetSec(middleEpochSec) === endOffsetSec ? split[1] = middleEpochSec : split[0] = middleEpochSec + 1;
        }
        return offsetSec;
      }
      return {
        xe(zonedEpochSec) {
          const wideOffsetSec0 = getOffsetSec(zonedEpochSec - 86400);
          const wideOffsetSec1 = getOffsetSec(zonedEpochSec + 86400);
          const wideUtcEpochSec0 = zonedEpochSec - wideOffsetSec0;
          const wideUtcEpochSec1 = zonedEpochSec - wideOffsetSec1;
          if (wideOffsetSec0 === wideOffsetSec1) {
            return [ wideUtcEpochSec0 ];
          }
          const narrowOffsetSec0 = getOffsetSec(wideUtcEpochSec0);
          return narrowOffsetSec0 === getOffsetSec(wideUtcEpochSec1) ? [ zonedEpochSec - narrowOffsetSec0 ] : wideOffsetSec0 > wideOffsetSec1 ? [ wideUtcEpochSec0, wideUtcEpochSec1 ] : [];
        },
        we: getOffsetSec,
        O: function getTransition(epochSec, direction) {
          if (direction > 0 && epochSec >= 864e10) {
            return;
          }
          if (direction < 0) {
            if (epochSec <= minPossibleTransitionSec) {
              return;
            }
            const lookaheadEpochSec = getCurrentEpochSec() + 94867200;
            if (epochSec > lookaheadEpochSec) {
              return getTransition(lookaheadEpochSec, -1);
            }
          }
          const searchEpochSec = direction > 0 ? Math.max(epochSec, minPossibleTransitionSec) : epochSec;
          let [startEpochSec, endEpochSec] = computePeriod(searchEpochSec, periodSec);
          const inc = periodSec * direction;
          const searchLimit = direction > 0 ? Math.max(epochSec, getCurrentEpochSec()) + 94867200 : minPossibleTransitionSec;
          const inBounds = () => direction < 0 ? endEpochSec > searchLimit : startEpochSec < searchLimit;
          for (;inBounds(); ) {
            const clampedStartEpochSec = clampIntlSampleEpochSec(startEpochSec);
            const clampedEndEpochSec = clampIntlSampleEpochSec(endEpochSec);
            const startOffsetSec = getSample(clampedStartEpochSec);
            const endOffsetSec = getSample(clampedEndEpochSec);
            if (startOffsetSec !== endOffsetSec) {
              const split = getSplit(clampedStartEpochSec, clampedEndEpochSec);
              pinch(split, startOffsetSec, endOffsetSec);
              const transitionEpochSec = split[0];
              if ((compareNumbers(transitionEpochSec, epochSec) || 1) === direction) {
                return transitionEpochSec;
              }
            }
            startEpochSec += inc, endEpochSec += inc;
          }
        }
      };
    })((format => epochSec => {
      const intlParts = formatEpochMilliToPartsRecord(format, 1e3 * epochSec);
      return 86400 * isoArgsToEpochDays((intlParts => {
        const relatedYear = intlParts.relatedYear;
        if (void 0 !== relatedYear) {
          return parseInt(relatedYear);
        }
        const year = parseInt(intlParts.year);
        return void 0 !== intlParts.era && "bce" === normalizeEraName(intlParts.era) ? 1 - year : year;
      })(intlParts), parseInt(intlParts.month), parseInt(intlParts.day)) + 3600 * parseInt(intlParts.hour) + 60 * parseInt(intlParts.minute) + parseInt(intlParts.second) - epochSec;
    })(format), (timeZoneId => {
      const timeZoneName = timeZoneId.split("/").pop();
      return timeZonePeriodDaysByName[timeZoneName] || 60;
    })(id));
  }
  B(epochNano) {
    return this.ke.we((epochNano => epochNanoToSecMod(epochNano)[0])(epochNano)) * nanoInSec;
  }
  N(isoDateTime) {
    const zonedEpochSec = 86400 * isoDateToEpochDays(isoDateTime) + timeFieldsToSec(isoDateTime);
    const subsecNano = timeFieldsToSubsecNano(isoDateTime);
    return this.ke.xe(zonedEpochSec).map(epochSec => checkEpochNanoInBounds(BigInt(epochSec) * bigNanoInSec + BigInt(subsecNano)));
  }
  O(epochNano, direction) {
    const [epochSec, subsecNano] = epochNanoToSecMod(epochNano);
    const resEpochSec = this.ke.O(epochSec + (direction > 0 || subsecNano ? 1 : 0), direction);
    if (void 0 !== resEpochSec) {
      return BigInt(resEpochSec) * bigNanoInSec;
    }
  }
}

function getCurrentEpochSec() {
  return Math.floor(Date.now() / 1e3);
}

function createSplitTuple(startEpochSec, endEpochSec) {
  return [ startEpochSec, endEpochSec ];
}

function computePeriod(epochSec, periodSec) {
  const startEpochSec = Math.floor(epochSec / periodSec) * periodSec;
  return [ startEpochSec, startEpochSec + periodSec ];
}

function clampIntlSampleEpochSec(epochSec) {
  return constrainToRange(epochSec, -1e10, 864e10);
}

function refineMaybeZonedDateTimeObjectLike(refineTimeZoneString, calendar, bag) {
  const fields = readAndRefineBagFields(bag, getCalendarFieldNames(calendar, dateTimeAndZoneFieldNamesAlpha, dateTimeAndZoneFieldNamesWithEraAlpha), zonedDateTimeFieldRefiners, [], 0);
  if (void 0 !== fields.timeZone) {
    const isoDateFields = createPlainDateFromFields(calendar, fields);
    const timeFields = resolveTimeFields(fields);
    const timeZone = queryTimeZone(refineTimeZoneString(fields.timeZone));
    return {
      epochNanoseconds: getMatchingInstantFor(timeZone, combineDateAndTime(isoDateFields, timeFields), fields.offset),
      timeZone: timeZone,
      calendar: calendar
    };
  }
  return createPlainDateFromFields(calendar, fields);
}

function refineZonedDateTimeObjectLike(refineTimeZoneString, calendar, bag, options) {
  const fields = readAndRefineBagFields(bag, getCalendarFieldNames(calendar, dateTimeAndZoneFieldNamesAlpha, dateTimeAndZoneFieldNamesWithEraAlpha), zonedDateTimeFieldRefiners, timeZoneFieldNames, 0);
  const timeZoneId = refineTimeZoneString(fields.timeZone);
  const [isoDateFields, overflow, offsetDisambig, epochDisambig] = createPlainDateFromFieldsWithOptionsRefiner(calendar, fields, () => refineZonedFieldOptions(options));
  const timeFields = resolveTimeFields(fields, overflow);
  const timeZone = queryTimeZone(timeZoneId);
  return createZonedEpochNanoSlots(getMatchingInstantFor(timeZone, combineDateAndTime(isoDateFields, timeFields), fields.offset, offsetDisambig, epochDisambig), timeZone, calendar);
}

function refinePlainDateTimeObjectLike(calendar, bag, options) {
  const fields = readAndRefineBagFields(bag, getCalendarFieldNames(calendar, dateTimeFieldNamesAlpha, dateTimeFieldNamesWithEraAlpha), dateTimeFieldRefiners, [], 0);
  const [isoDateInternals, overflow] = createPlainDateFromFieldsWithOptionsRefiner(calendar, fields, () => [ refineOverflowOptions(options) ]);
  return createPlainDateTimeFromRefinedFields(isoDateInternals, resolveTimeFields(fields, overflow), calendar);
}

function refinePlainDateObjectLike(calendar, bag, options, requireFields = []) {
  return createPlainDateFromFields(calendar, readAndRefineBagFields(bag, getCalendarFieldNames(calendar, dateFieldNamesAlpha, dateFieldNamesWithEraAlpha), dateFieldRefiners, requireFields), options);
}

function refinePlainYearMonthObjectLike(calendar, bag, options, requireFields) {
  return createPlainYearMonthFromFields(calendar, readAndRefineBagFields(bag, getCalendarFieldNames(calendar, yearMonthFieldNamesAlpha, yearMonthFieldNamesWithEraAlpha), dateFieldRefiners, requireFields), options);
}

function refinePlainMonthDayObjectLike(calendar, calendarAbsent, bag, options) {
  const fields = readAndRefineBagFields(bag, getCalendarFieldNames(calendar, dateFieldNamesAlpha, dateFieldNamesWithEraAlpha), dateFieldRefiners, dayFieldNamesAsc, 0);
  return calendarAbsent && void 0 !== fields.month && void 0 === fields.monthCode && void 0 === fields.year && (fields.year = 1972), 
  createPlainMonthDayFromFields(calendar, fields, options);
}

function refinePlainTimeObjectLike(bag, options) {
  return resolveTimeFields(readAndRefineBagFields(bag, timeFieldNamesAlpha, timeFieldRefiners, [], 1), refineOverflowOptions(options));
}

function refineDurationObjectLike(bag) {
  const durationFields = readAndRefineBagFields(bag, durationFieldNamesAlpha, durationFieldRefiners);
  return createDurationSlots(validateDurationFields({
    ...durationFieldDefaults,
    ...durationFields
  }));
}

function throwFailedParse(s) {
  throwRangeError(failedParse(s));
}

function parseInstant(s) {
  const organized = parseDateTimeLike(s = toStringViaPrimitive(s));
  let offsetNano;
  return organized || throwFailedParse(s), organized.C ? offsetNano = 0 : organized.offset ? offsetNano = parseOffsetNano(organized.offset) : throwFailedParse(s), 
  organized.timeZoneId && parseOffsetNanoMaybe(organized.timeZoneId, 1), validateIsoDateTimeFields(organized), 
  createEpochNanoSlots(isoDateTimeAndOffsetToEpochNano(organized, offsetNano));
}

function parseRelativeToSlots(s, resolveCalendar) {
  const organized = parseDateTimeLike(requireString(s));
  return organized || throwFailedParse(s), organized.timeZoneId ? finalizeZonedDateTime(organized, resolveCalendar, void 0) : (organized.C && throwFailedParse(s), 
  finalizeDate(organized, resolveCalendar));
}

function parseZonedDateTime(s, resolveCalendar, options) {
  const organized = parseDateTimeLike(requireString(s));
  return organized && organized.timeZoneId || throwFailedParse(s), finalizeZonedDateTime(organized, resolveCalendar, options);
}

function parsePlainDateTime(s, resolveCalendar) {
  const organized = parseDateTimeLike(requireString(s));
  return organized && !organized.C || throwFailedParse(s), finalizeDateTime(organized, resolveCalendar);
}

function parsePlainDate(s, resolveCalendar) {
  const slots = finalizeDateLike(parsePlainDateLike(requireString(s)), void 0, resolveCalendar);
  return createDateSlots(slots, slots.calendar);
}

function parsePlainYearMonth(s, resolveCalendar) {
  const organized = parseYearMonthOnly(requireString(s));
  if (organized) {
    return requireIsoCalendar(organized), createDateSlots(checkIsoYearMonthInBounds(validateIsoDateFields(organized)), resolveCalendar(organized.calendarId));
  }
  const dateSlots = finalizeDateLike(parsePlainDateLike(s), projectIsoYearMonthDate, resolveCalendar);
  const {calendar: calendar} = dateSlots;
  return createDateSlots(moveToStartOfMonth(calendar, dateSlots), calendar);
}

function requireIsoCalendar(organized) {
  "iso8601" !== organized.calendarId && throwRangeError(invalidSubstring(organized.calendarId));
}

function parsePlainMonthDay(s, resolveCalendar) {
  const organized = parseMonthDayOnly(requireString(s));
  if (organized) {
    return requireIsoCalendar(organized), createDateSlots(validateIsoDateFields(organized), resolveCalendar(organized.calendarId));
  }
  const dateSlots = finalizeDateLike(parsePlainDateLike(s), projectIsoMonthDayDate, resolveCalendar);
  const {calendar: calendar} = dateSlots;
  const {year: origYear, month: origMonth, day: day} = computeCalendarDateFields(calendar, dateSlots);
  const [monthCodeNumber, isLeapMonth] = computeCalendarMonthCodeParts(calendar, origYear, origMonth);
  const {year: year, month: month} = ((calendar, monthCodeNumber, isLeapMonth, day) => {
    const yearMonthFields = calendar ? calendar.u(monthCodeNumber, isLeapMonth, day) : computeIsoYearMonthFieldsForMonthDay(monthCodeNumber, isLeapMonth);
    return yearMonthFields || throwRangeError("Cannot guess year"), yearMonthFields;
  })(calendar, monthCodeNumber, isLeapMonth, day);
  return createDateSlots(checkIsoDateInBounds(computeCalendarIsoFieldsFromParts(calendar, year, month, day)), calendar);
}

function parsePlainTime(s) {
  let organized = (s => {
    const parts = parseTimeOnlyParts(s);
    return parts ? (organizeAnnotationParts(parts[13]), organizeTimeParts(parts, 1)) : void 0;
  })(s = requireString(s));
  if (!organized) {
    const dateTime = parseDateTimeLike(s);
    dateTime && dateTime.re || throwFailedParse(s), dateTime.C && throwRangeError(invalidSubstring("Z")), 
    requireIsoCalendar(dateTime), organized = dateTime;
  }
  let altParsed;
  return (altParsed = parseYearMonthOnly(s)) && isIsoDateFieldsValid(altParsed) && throwFailedParse(s), 
  (altParsed = parseMonthDayOnly(s)) && isIsoDateFieldsValid(altParsed) && throwFailedParse(s), 
  createTimeSlots(validateTimeFields(organized));
}

function parseDuration(s) {
  const parts = durationRegExp.exec(requireString(s));
  return parts || throwFailedParse(s), createDurationSlots(validateDurationFields((parts => {
    let hasAny = 0;
    let hasAnyFrac = 0;
    let leftoverNano = 0;
    let durationFields = {
      years: parseUnit(parts[2]),
      months: parseUnit(parts[3]),
      weeks: parseUnit(parts[4]),
      days: parseUnit(parts[5]),
      hours: parseUnit(parts[6], parts[7], 5),
      minutes: parseUnit(parts[8], parts[9], 4),
      seconds: parseUnit(parts[10], parts[11], 3),
      ...nanoToGivenFields(leftoverNano, 2, durationFieldNamesAsc)
    };
    return hasAny || throwRangeError(noValidFields(durationFieldNamesAsc)), parseSign(parts[1]) < 0 && (durationFields = negateDurationFields(durationFields)), 
    durationFields;
    function parseUnit(wholeStr, fracStr, timeUnit) {
      let leftoverUnits = 0;
      let wholeUnits = 0;
      return timeUnit && ([leftoverUnits, leftoverNano] = divModFloor(leftoverNano, unitNanoMap[timeUnit])), 
      void 0 !== wholeStr && (hasAnyFrac && throwRangeError(invalidSubstring(wholeStr)), 
      wholeUnits = (s => {
        const n = parseInt(s);
        return Number.isFinite(n) || throwRangeError(invalidSubstring(s)), n;
      })(wholeStr), hasAny = 1, fracStr && (leftoverNano = parseSubsecNano(fracStr) * (unitNanoMap[timeUnit] / nanoInSec), 
      hasAnyFrac = 1)), leftoverUnits + wholeUnits;
    }
  })(parts)));
}

function parseCalendarId(s) {
  const res = parseDateTimeLike(s) || parseYearMonthOnly(s) || parseMonthDayOnly(s);
  if (res) {
    return res.calendarId;
  }
  const timeParts = parseTimeOnlyParts(s);
  return timeParts ? organizeAnnotationParts(timeParts[13]).calendarId : s;
}

function parseTimeZoneId(s) {
  const parsed = parseDateTimeLike(s);
  return parsed && (parsed.timeZoneId || parsed.C && "UTC" || parsed.offset) || s;
}

function parsePlainDateLike(s) {
  const organized = parseDateTimeLike(s);
  return organized && !organized.C || throwFailedParse(s), organized;
}

function finalizeDateLike(organized, isoDateProjector, resolveCalendar) {
  return isoDateProjector && "iso8601" === organized.calendarId ? (validateIsoDateFields(organized), 
  organized.re && validateTimeFields(organized), finalizeDate(isoDateProjector(organized), resolveCalendar)) : organized.re ? finalizeDateTime(organized, resolveCalendar) : finalizeDate(organized, resolveCalendar);
}

function projectIsoYearMonthDate(organized) {
  const day = 12 * organized.year + organized.month === isoYearMonthIndexMin ? 20 : 1;
  return {
    ...organized,
    day: day
  };
}

function projectIsoMonthDayDate(organized) {
  return {
    ...organized,
    year: 1972
  };
}

function finalizeZonedDateTime(organized, resolveCalendar, options) {
  const timeZone = queryTimeZone(resolveTimeZoneId(organized.timeZoneId));
  let epochNano;
  if (validateIsoDateTimeFields(organized), organized.re) {
    const offsetNano = organized.offset ? parseOffsetNano(organized.offset) : void 0;
    const [, offsetDisambig, epochDisambig] = refineZonedFieldOptions(options);
    epochNano = getMatchingInstantFor(timeZone, organized, offsetNano, offsetDisambig, epochDisambig, !(timeZone.X || void 0 === organized.offset || (offset = organized.offset, 
    offset.replace(/\D/g, "").length > 4)), organized.C);
  } else {
    refineZonedFieldOptions(options), epochNano = getStartOfDayInstantFor(timeZone, organized);
  }
  var offset;
  return checkEpochNanoInBounds(epochNano), createZonedEpochNanoSlots(epochNano, timeZone, resolveCalendar(organized.calendarId));
}

function finalizeDateTime(organized, resolveCalendar) {
  return validateIsoDateTimeFields(organized), checkIsoDateTimeInBounds(organized), 
  {
    ...combineDateAndTime(organized, organized),
    calendar: resolveCalendar(organized.calendarId)
  };
}

function finalizeDate(organized, resolveCalendar) {
  return validateIsoDateFields(organized), checkIsoDateInBounds(organized), {
    calendar: resolveCalendar(organized.calendarId),
    year: organized.year,
    month: organized.month,
    day: organized.day
  };
}

function timeRegExpStr(separatorIndex) {
  return `(\\d{2})(?:(:?)(\\d{2})(?:\\${separatorIndex}(\\d{2})(?:[.,](\\d{1,9}))?)?)?`;
}

const dateTimeRegExpStr = "(?:(?:([+-])(\\d{6}))|(\\d{4}))(-?)(\\d{2})\\4(\\d{2})(?:[T ]" + timeRegExpStr(8) + "(Z|([+-])" + timeRegExpStr(15) + ")?)?";

const yearMonthRegExp = /*@__PURE__*/ createRegExp("(?:(?:([+-])(\\d{6}))|(\\d{4}))-?(\\d{2})((?:\\[(!?)([^\\]]*)\\]){0,9})");

const monthDayRegExp = /*@__PURE__*/ createRegExp("(?:--)?(\\d{2})-?(\\d{2})((?:\\[(!?)([^\\]]*)\\]){0,9})");

const dateTimeRegExp = /*@__PURE__*/ createRegExp(dateTimeRegExpStr + "((?:\\[(!?)([^\\]]*)\\]){0,9})");

const timeRegExp = /*@__PURE__*/ createRegExp("T?" + timeRegExpStr(2) + `(([+-])${timeRegExpStr(9)})?((?:\\[(!?)([^\\]]*)\\]){0,9})`);

const annotationRegExp = /*@__PURE__*/ new RegExp("\\[(!?)([^\\]]*)\\]", "g");

const durationRegExp = /*@__PURE__*/ createRegExp("([+-])?P(\\d+Y)?(\\d+M)?(\\d+W)?(\\d+D)?(?:T(?!$)(?:(\\d+)(?:[.,](\\d{1,9}))?H)?(?:(\\d+)(?:[.,](\\d{1,9}))?M)?(?:(\\d+)(?:[.,](\\d{1,9}))?S)?)?");

function parseDateTimeLike(s) {
  const parts = dateTimeRegExp.exec(s);
  return parts ? (parts => {
    const zOrOffset = parts[12];
    const hasZ = "Z" === (zOrOffset || "").toUpperCase();
    return {
      year: organizeIsoYearParts(parts),
      month: parseInt(parts[5]),
      day: parseInt(parts[6]),
      ...organizeTimeParts(parts, 7),
      ...organizeAnnotationParts(parts[19]),
      re: Boolean(parts[7]),
      C: hasZ,
      offset: hasZ ? void 0 : zOrOffset
    };
  })(parts) : void 0;
}

function parseYearMonthOnly(s) {
  const parts = yearMonthRegExp.exec(s);
  if (parts) {
    return (parts => ({
      year: organizeIsoYearParts(parts),
      month: parseInt(parts[4]),
      day: 1,
      ...organizeAnnotationParts(parts[5])
    }))(parts);
  }
}

function parseMonthDayOnly(s) {
  const parts = monthDayRegExp.exec(s);
  return parts ? (parts => ({
    year: 1972,
    month: parseInt(parts[1]),
    day: parseInt(parts[2]),
    ...organizeAnnotationParts(parts[3])
  }))(parts) : void 0;
}

function parseTimeOnlyParts(s) {
  const parts = timeRegExp.exec(s);
  if (parts) {
    return parts[6] && parseOffsetNano(parts[6]), parts;
  }
}

function organizeTimeParts(parts, hourIndex) {
  const second = parseInt0(parts[hourIndex + 3]);
  return {
    ...nanoToTimeAndDay(parseSubsecNano(parts[hourIndex + 4] || ""))[0],
    hour: parseInt0(parts[hourIndex]),
    minute: parseInt0(parts[hourIndex + 2]),
    second: 60 === second ? 59 : second
  };
}

function organizeIsoYearParts(parts) {
  const yearSign = parseSign(parts[1]);
  const year = parseInt(parts[2] || parts[3]);
  return yearSign < 0 && !year && throwRangeError(invalidSubstring(-0)), yearSign * year;
}

function organizeAnnotationParts(s) {
  let calendarIsCritical;
  let timeZoneId;
  const calendarIds = [];
  return s.replace(annotationRegExp, (whole, criticalStr, mainStr) => {
    const isCritical = Boolean(criticalStr);
    const [val, name] = mainStr.split("=").reverse();
    return name ? "u-ca" === name ? (calendarIds.push(val.toLowerCase()), calendarIsCritical || (calendarIsCritical = isCritical)) : (isCritical || /[A-Z]/.test(name)) && throwRangeError(invalidSubstring(whole)) : (timeZoneId && throwRangeError(invalidSubstring(whole)), 
    timeZoneId = val), "";
  }), calendarIds.length > 1 && calendarIsCritical && throwRangeError(invalidSubstring(s)), 
  {
    timeZoneId: timeZoneId,
    calendarId: calendarIds[0] || "iso8601"
  };
}

function mergeCalendarFields(calendar, baseFields, additionalFields) {
  const merged = Object.assign(Object.create(null), baseFields);
  return spliceFields(merged, additionalFields, monthFieldNames), getCalendarEraOrigins(calendar) && (spliceFields(merged, additionalFields, allYearFieldNames), 
  calendar && calendar.ge && spliceFields(merged, additionalFields, monthDayFieldNames, eraYearFieldNames)), 
  merged;
}

function spliceFields(dest, additional, allPropNames, deletablePropNames) {
  let anyMatching = 0;
  const nonMatchingPropNames = [];
  for (const propName of allPropNames) {
    void 0 !== additional[propName] ? anyMatching = 1 : nonMatchingPropNames.push(propName);
  }
  if (Object.assign(dest, additional), anyMatching) {
    for (const deletablePropName of deletablePropNames || nonMatchingPropNames) {
      delete dest[deletablePropName];
    }
  }
}

function mergeZonedDateTimeFields(zonedDateTimeSlots, modFields, options) {
  const {calendar: calendar, timeZone: timeZone} = zonedDateTimeSlots;
  const validFieldNames = getCalendarFieldNames(calendar, dateTimeAndOffsetFieldNamesAlpha, dateTimeAndOffsetFieldNamesWithEraAlpha);
  const zonedSlots = zonedEpochSlotsToIso(zonedDateTimeSlots);
  const {year: year, month: month, day: day} = computeCalendarDateFields(calendar, zonedSlots);
  const origFields = {
    year: year,
    monthCode: computeMonthCode(calendar, year, month),
    day: day,
    hour: zonedSlots.hour,
    minute: zonedSlots.minute,
    second: zonedSlots.second,
    millisecond: zonedSlots.millisecond,
    microsecond: zonedSlots.microsecond,
    nanosecond: zonedSlots.nanosecond,
    offset: zonedSlots.offsetNanoseconds
  };
  const partialFields = readAndRefineBagFields(modFields, validFieldNames, zonedDateTimeFieldRefiners);
  const mergedCalendarFields = mergeCalendarFields(calendar, origFields, partialFields);
  const mergedAllFields = {
    ...origFields,
    ...partialFields
  };
  const [isoDateFields, overflow, offsetDisambig, epochDisambig] = createPlainDateFromFieldsWithOptionsRefiner(calendar, mergedCalendarFields, () => refineZonedFieldOptions(options, 2));
  return createZonedEpochNanoSlots(getMatchingInstantFor(timeZone, combineDateAndTime(isoDateFields, constrainTimeFields(mergedAllFields, overflow)), mergedAllFields.offset, offsetDisambig, epochDisambig), timeZone, calendar);
}

function mergePlainDateTimeFields(plainDateTimeSlots, modFields, options) {
  const {calendar: calendar} = plainDateTimeSlots;
  const validFieldNames = getCalendarFieldNames(calendar, dateTimeFieldNamesAlpha, dateTimeFieldNamesWithEraAlpha);
  const {year: year, month: month, day: day} = computeCalendarDateFields(calendar, plainDateTimeSlots);
  const origFields = {
    year: year,
    monthCode: computeMonthCode(calendar, year, month),
    day: day,
    hour: plainDateTimeSlots.hour,
    minute: plainDateTimeSlots.minute,
    second: plainDateTimeSlots.second,
    millisecond: plainDateTimeSlots.millisecond,
    microsecond: plainDateTimeSlots.microsecond,
    nanosecond: plainDateTimeSlots.nanosecond
  };
  const partialFields = readAndRefineBagFields(modFields, validFieldNames, dateTimeFieldRefiners);
  const mergedCalendarFields = mergeCalendarFields(calendar, origFields, partialFields);
  const mergedAllFields = {
    ...origFields,
    ...partialFields
  };
  const [plainDateSlots, overflow] = createPlainDateFromFieldsWithOptionsRefiner(calendar, mergedCalendarFields, () => [ refineOverflowOptions(options) ]);
  return createPlainDateTimeFromRefinedFields(plainDateSlots, constrainTimeFields(mergedAllFields, overflow), calendar);
}

function mergePlainDateFields(plainDateSlots, modFields, options) {
  const {calendar: calendar} = plainDateSlots;
  const validFieldNames = getCalendarFieldNames(calendar, dateFieldNamesAlpha, dateFieldNamesWithEraAlpha);
  const {year: year, month: month, day: day} = computeCalendarDateFields(calendar, plainDateSlots);
  return createPlainDateFromFields(calendar, mergeCalendarFields(calendar, {
    year: year,
    monthCode: computeMonthCode(calendar, year, month),
    day: day
  }, readAndRefineBagFields(modFields, validFieldNames, dateFieldRefiners)), options);
}

function mergePlainYearMonthFields(plainYearMonthSlots, modFields, options) {
  const {calendar: calendar} = plainYearMonthSlots;
  const validFieldNames = getCalendarFieldNames(calendar, yearMonthFieldNamesAlpha, yearMonthFieldNamesWithEraAlpha);
  const {year: year, month: month} = computeCalendarDateFields(calendar, plainYearMonthSlots);
  return createPlainYearMonthFromFields(calendar, mergeCalendarFields(calendar, {
    year: year,
    monthCode: computeMonthCode(calendar, year, month)
  }, readAndRefineBagFields(modFields, validFieldNames, dateFieldRefiners)), options);
}

function mergePlainMonthDayFields(plainMonthDaySlots, modFields, options) {
  const {calendar: calendar} = plainMonthDaySlots;
  const validFieldNames = getCalendarFieldNames(calendar, dateFieldNamesAlpha, dateFieldNamesWithEraAlpha);
  const {year: year, month: month, day: day} = computeCalendarDateFields(calendar, plainMonthDaySlots);
  return createPlainMonthDayFromFields(calendar, mergeCalendarFields(calendar, {
    monthCode: computeMonthCode(calendar, year, month),
    day: day
  }, readAndRefineBagFields(modFields, validFieldNames, dateFieldRefiners)), options);
}

function mergePlainTimeFields(initialFields, mod, options) {
  return ((initialFields, modFields, options) => resolveTimeFields({
    ...pluckProps(timeFieldNamesAlpha, initialFields),
    ...readAndRefineBagFields(modFields, timeFieldNamesAlpha, timeFieldRefiners)
  }, refineOverflowOptions(options)))(initialFields, mod, options);
}

function mergeDurationFields(slots, fields) {
  return createDurationSlots((initialFields = slots, modFields = fields, validateDurationFields({
    ...initialFields,
    ...readAndRefineBagFields(modFields, durationFieldNamesAlpha, durationFieldRefiners)
  })));
  var initialFields, modFields;
}

function computeMonthCode(calendar, year, month) {
  const [monthCodeNumber, isLeapMonth] = computeCalendarMonthCodeParts(calendar, year, month);
  return formatMonthCode(monthCodeNumber, isLeapMonth);
}

function instantToZonedDateTime(instantSlots, timeZone, calendar) {
  return createZonedEpochNanoSlots(instantSlots.epochNanoseconds, timeZone, calendar);
}

function zonedDateTimeToInstant(zonedDateTimeSlots0) {
  return createEpochNanoSlots(zonedDateTimeSlots0.epochNanoseconds);
}

function zonedDateTimeToPlainDateTime(zonedDateTimeSlots0) {
  return createDateTimeSlots(zonedEpochSlotsToIso(zonedDateTimeSlots0), zonedDateTimeSlots0.calendar);
}

function zonedDateTimeToPlainDate(zonedDateTimeSlots0) {
  return createDateSlots(zonedEpochSlotsToIso(zonedDateTimeSlots0), zonedDateTimeSlots0.calendar);
}

function zonedDateTimeToPlainTime(zonedDateTimeSlots0) {
  return createTimeSlots(zonedEpochSlotsToIso(zonedDateTimeSlots0));
}

function plainDateTimeToZonedDateTime(plainDateTimeSlots, timeZone, options) {
  const epochNano = getSingleInstantFor(timeZone, plainDateTimeSlots, (options => coerceEpochDisambig(normalizeOptions(options)))(options));
  return createZonedEpochNanoSlots(checkEpochNanoInBounds(epochNano), timeZone, plainDateTimeSlots.calendar);
}

function plainDateToZonedDateTime(refineTimeZoneString, refinePlainTimeArg, plainDateSlots, options) {
  const timeZoneId = refineTimeZoneString(options.timeZone);
  const plainTimeArg = options.plainTime;
  const timeFields = void 0 !== plainTimeArg ? refinePlainTimeArg(plainTimeArg) : void 0;
  const timeZone = queryTimeZone(timeZoneId);
  let epochNano;
  return epochNano = timeFields ? getSingleInstantFor(timeZone, combineDateAndTime(plainDateSlots, timeFields)) : getStartOfDayInstantFor(timeZone, combineDateAndTime(plainDateSlots, timeFieldDefaults)), 
  createZonedEpochNanoSlots(epochNano, timeZone, plainDateSlots.calendar);
}

function convertPlainYearMonthToDate(calendar, input, bag) {
  return createPlainDateFromMergedFields(calendar, pluckProps(getCalendarFieldNames(calendar, yearMonthCodeFieldNamesAlpha, yearMonthCodeFieldNamesWithEraAlpha), input), readAndRefineBagFields(requireObjectLike(bag), dayFieldNamesAsc, dateFieldRefiners, []));
}

function convertPlainMonthDayToDate(calendar, input, bag) {
  const extraFieldNames = getCalendarFieldNames(calendar, yearFieldNamesAsc, yearFieldNamesWithEraAlpha);
  return createPlainDateFromMergedFields(calendar, pluckProps(monthCodeDayFieldNamesAlpha, input), readAndRefineBagFields(requireObjectLike(bag), extraFieldNames, dateFieldRefiners, []));
}

function convertToPlainMonthDay(calendar, input) {
  return createPlainMonthDayFromFields(calendar, readAndRefineBagFields(input, monthCodeDayFieldNamesAlpha, dateFieldRefiners));
}

function convertToPlainYearMonth(calendar, input, options) {
  return createPlainYearMonthFromFields(calendar, readAndRefineBagFields(input, getCalendarFieldNames(calendar, yearMonthCodeFieldNamesAlpha, yearMonthCodeFieldNamesWithEraAlpha), dateFieldRefiners), options);
}

function createPlainDateFromMergedFields(calendar, inputFields, extraFields) {
  const mergedFieldNames = getCalendarFieldNames(calendar, yearMonthCodeDayFieldNamesAlpha, yearMonthCodeDayFieldNamesWithEraAlpha);
  let mergedFields = mergeCalendarFields(calendar, inputFields, extraFields);
  return mergedFields = readAndRefineBagFields(mergedFields, mergedFieldNames, dateFieldRefiners, []), 
  createPlainDateFromFields(calendar, mergedFields);
}

function epochMilliToInstant(epochMilli) {
  return createEpochNanoSlots(checkEpochNanoInBounds(BigInt(toStrictInteger(epochMilli)) * bigNanoInMilli));
}

function epochNanoToInstant(epochNano) {
  return createEpochNanoSlots(checkEpochNanoInBounds(toBigInt(epochNano)));
}

function applyPlainFormatTimeZone(options) {
  return options.timeZone = "UTC", [ "full", "long" ].includes(options.timeStyle) && (options.timeStyle = "medium"), 
  options;
}

function applyZonedFormatTimeZone(options, timeZoneId) {
  return void 0 !== options.timeZone && throwTypeError("Cannot specify TimeZone"), 
  options.timeZone = timeZoneId, options;
}

function checkResolvedCalendarCompatible(format, slots, strictCalendarCheck) {
  const resolvedCalendarId = format.resolvedOptions().calendar;
  !strictCalendarCheck && slots.calendar === isoCalendarImpl || getCalendarSlotId(slots.calendar) === resolvedCalendarId || throwRangeError("Mismatching Calendars");
}

function createOptionsTransformer(shapeFieldNames, invalidShapeFieldNames, ignoredFieldNames, defaultShapeFields, dateStyleReplacementFields) {
  const shapeFieldNameSet = new Set(shapeFieldNames);
  const invalidShapeFieldNameSet = new Set(invalidShapeFieldNames);
  const ignoredFieldNameSet = new Set(ignoredFieldNames);
  return (options, allowPartialOverlap) => {
    let dateStyle;
    let timeStyle;
    const granularShapeFields = {};
    const modifierFields = {};
    const otherFields = {};
    let hasInvalidGranularShapeFields = 0;
    let hasInvalidStyleFields = 0;
    for (const name of Object.keys(options)) {
      const value = options[name];
      void 0 === value || ignoredFieldNameSet.has(name) || (shapeFieldNameSet.has(name) ? "dateStyle" === name ? dateStyle = value : "timeStyle" === name ? timeStyle = value : granularShapeFields[name] = value : "era" === name ? modifierFields[name] = value : invalidShapeFieldNameSet.has(name) ? "dateStyle" === name || "timeStyle" === name ? hasInvalidStyleFields = 1 : hasInvalidGranularShapeFields = 1 : otherFields[name] = value);
    }
    const hasDateStyle = void 0 !== dateStyle;
    const hasTimeStyle = void 0 !== timeStyle;
    const hasAnyStyle = hasDateStyle || hasTimeStyle;
    const hasGranularShapeFields = Object.keys(granularShapeFields).length > 0;
    const hasInvalids = hasInvalidGranularShapeFields || hasInvalidStyleFields;
    const hasShapeFields = hasGranularShapeFields || hasDateStyle || hasTimeStyle;
    const hasModifierFields = Object.keys(modifierFields).length > 0;
    (!allowPartialOverlap && hasInvalids || allowPartialOverlap && hasInvalids && !hasShapeFields || hasAnyStyle && (hasGranularShapeFields || hasModifierFields || hasInvalidGranularShapeFields)) && throwTypeError("Invalid formatting options");
    const transformedOptions = {};
    return hasAnyStyle || hasShapeFields || Object.assign(transformedOptions, defaultShapeFields), 
    Object.assign(transformedOptions, granularShapeFields, modifierFields, otherFields), 
    hasDateStyle && (dateStyleReplacementFields ? Object.assign(transformedOptions, dateStyleReplacementFields[dateStyle]) : transformedOptions.dateStyle = dateStyle), 
    hasTimeStyle && (transformedOptions.timeStyle = timeStyle), transformedOptions;
  };
}

const dateDefaultShapeFields = {
  year: "numeric",
  month: "numeric",
  day: "numeric"
};

const timeDefaultShapeFields = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
};

const dateTimeDefaultShapeFields = /*@__PURE__*/ Object.assign({}, dateDefaultShapeFields, timeDefaultShapeFields);

const dateShapeFieldNames = [ "weekday", "year", "month", "day", "dateStyle" ];

const timeShapeFieldNames = [ "dayPeriod", "hour", "minute", "second", "fractionalSecondDigits", "timeStyle" ];

const dateTimeShapeFieldNames = /*@__PURE__*/ dateShapeFieldNames.concat(timeShapeFieldNames);

const yearMonthIgnoredFieldNames = /*@__PURE__*/ [ "weekday", "day" ].concat(timeShapeFieldNames);

const monthDayIgnoredFieldNames = /*@__PURE__*/ [ "weekday", "year" ].concat(timeShapeFieldNames);

const transformInstantOptions = /*@__PURE__*/ createOptionsTransformer(dateTimeShapeFieldNames, [], [], dateTimeDefaultShapeFields);

const transformZonedOptions = /*@__PURE__*/ createOptionsTransformer(dateTimeShapeFieldNames, [], [], {
  ...dateTimeDefaultShapeFields,
  timeZoneName: "short"
});

const transformDateTimeOptions = /*@__PURE__*/ createOptionsTransformer(dateTimeShapeFieldNames, [], [ "timeZoneName" ], dateTimeDefaultShapeFields);

const transformDateOptions = /*@__PURE__*/ createOptionsTransformer(dateShapeFieldNames, timeShapeFieldNames, [ "timeZoneName" ], dateDefaultShapeFields);

const transformTimeOptions = /*@__PURE__*/ createOptionsTransformer(timeShapeFieldNames, dateShapeFieldNames, [ "timeZoneName", "era" ], timeDefaultShapeFields);

const transformYearMonthOptions = /*@__PURE__*/ createOptionsTransformer([ "year", "month", "dateStyle" ], yearMonthIgnoredFieldNames, [ "timeZoneName" ], {
  year: "numeric",
  month: "numeric"
}, {
  full: {
    year: "numeric",
    month: "long"
  },
  long: {
    year: "numeric",
    month: "long"
  },
  medium: {
    year: "numeric",
    month: "short"
  },
  short: {
    year: "2-digit",
    month: "numeric"
  }
});

const transformMonthDayOptions = /*@__PURE__*/ createOptionsTransformer([ "month", "day", "dateStyle" ], monthDayIgnoredFieldNames, [ "timeZoneName", "era" ], {
  month: "numeric",
  day: "numeric"
}, {
  full: {
    month: "long",
    day: "numeric"
  },
  long: {
    month: "long",
    day: "numeric"
  },
  medium: {
    month: "short",
    day: "numeric"
  },
  short: {
    month: "numeric",
    day: "numeric"
  }
});

function zonedDateTimeWithPlainTime(zonedDateTimeSlots, plainTimeFields) {
  const {timeZone: timeZone} = zonedDateTimeSlots;
  const isoDateTime = zonedEpochSlotsToIso(zonedDateTimeSlots);
  const {offsetNanoseconds: offsetNanoseconds} = isoDateTime;
  const time = plainTimeFields || timeFieldDefaults;
  let epochNano;
  return epochNano = plainTimeFields ? getMatchingInstantFor(timeZone, combineDateAndTime(isoDateTime, time), offsetNanoseconds, 2) : getStartOfDayInstantFor(timeZone, combineDateAndTime(isoDateTime, time)), 
  createZonedEpochNanoSlots(epochNano, timeZone, zonedDateTimeSlots.calendar);
}

function getCurrentIsoDateTime(timeZone) {
  const epochNano = getCurrentEpochNano();
  const offsetNano = timeZone.B(epochNano);
  return epochNanoToIsoDateTime(epochNano + BigInt(offsetNano));
}

function getCurrentEpochNano() {
  return BigInt(Date.now()) * bigNanoInMilli;
}

function getCurrentTimeZoneId() {
  return (new RawDateTimeFormat).resolvedOptions().timeZone;
}

function createDateTimeFormatShell(createArgsProvider, transformOptions = identity) {
  const internalsMap = new WeakMap;
  function getInternals(format) {
    const internals = internalsMap.get(format);
    return internals || throwTypeError("Invalid calling context"), internals;
  }
  class ShimDateTimeFormat {
    constructor(locales, options = Object.create(null)) {
      const transformedOptions = transformOptions(options);
      const observedOptionNames = [];
      const trackedOptions = new Proxy(Object.create(null), {
        get(_target, name) {
          const value = transformedOptions[name];
          return void 0 !== value && observedOptionNames.push(name), value;
        }
      });
      const baseFormat = new RawDateTimeFormat(locales, trackedOptions);
      const resolvedOptions = baseFormat.resolvedOptions();
      const copiedOptions = pluckProps(observedOptionNames, resolvedOptions);
      internalsMap.set(this, {
        Z: createArgsProvider({
          t: baseFormat,
          ze: resolvedOptions.locale,
          F: copiedOptions,
          Ce: transformedOptions
        }),
        t: baseFormat
      });
    }
    get format() {
      const internals = getInternals(this);
      return internals.qe || (internals.qe = record => {
        const [format, ...rest] = internals.Z.A(record);
        return format.format(...rest);
      });
    }
    formatToParts(record) {
      const {Z: argsProvider} = getInternals(this);
      const [format, ...rest] = argsProvider.A(record);
      return format.formatToParts(...rest);
    }
    resolvedOptions() {
      return getInternals(this).t.resolvedOptions();
    }
  }
  const {prototype: prototype} = ShimDateTimeFormat;
  function DateTimeFormat(locales, options) {
    return new ShimDateTimeFormat(locales, options);
  }
  RawDateTimeFormat.prototype.formatRange && Object.defineProperties(prototype, createPropDescriptors({
    formatRange(record0, record1) {
      const {Z: argsProvider} = getInternals(this);
      const [format, epochMilli0, epochMilli1] = argsProvider.v(record0, record1);
      return format.formatRange(epochMilli0, epochMilli1);
    },
    formatRangeToParts(record0, record1) {
      const {Z: argsProvider} = getInternals(this);
      const [format, epochMilli0, epochMilli1] = argsProvider.v(record0, record1);
      return format.formatRangeToParts(epochMilli0, epochMilli1);
    }
  }));
  const rawStaticDescriptors = Object.getOwnPropertyDescriptors(RawDateTimeFormat);
  return rawStaticDescriptors.prototype.value = prototype, Object.defineProperties(DateTimeFormat, rawStaticDescriptors), 
  prototype.constructor = DateTimeFormat, Object.defineProperties(prototype, createStringTagDescriptors("Intl.DateTimeFormat")), 
  DateTimeFormat;
}

const NativeTemporal = globalThis.Temporal;

const PlainYearMonthBranding = "PlainYearMonth";

const PlainMonthDayBranding = "PlainMonthDay";

const PlainDateBranding = "PlainDate";

const PlainDateTimeBranding = "PlainDateTime";

const PlainTimeBranding = "PlainTime";

const ZonedDateTimeBranding = "ZonedDateTime";

const InstantBranding = "Instant";

const DurationBranding = "Duration";

function defineTemporalClass(branding, cls, getSlots, ...getterMaps) {
  return Object.defineProperties(cls, createNameDescriptors(branding)), Object.defineProperties(cls.prototype, createStringTagDescriptors("Temporal." + branding)), 
  Object.defineProperties(cls.prototype, mapProps(getter => ({
    get() {
      return getter(getSlots(this));
    },
    configurable: 1
  }), Object.assign({}, ...getterMaps))), cls;
}

const attachDebugString = "noop" === noop.name ? instance => {
  Object.defineProperty(instance, "_str_", {
    value: instance.toJSON()
  });
} : noop;

function invalidRecordType() {
  throwTypeError(invalidCallingContext);
}

function forbiddenValueOf() {
  throwTypeError(forbiddenValueOf$1);
}

const yearMonthFieldGetters$1 = {
  era(slots) {
    return computeCalendarEraFields(slots.calendar, slots).era;
  },
  eraYear(slots) {
    return computeCalendarEraFields(slots.calendar, slots).eraYear;
  },
  year(slots) {
    return computeCalendarDateFields(slots.calendar, slots).year;
  },
  month(slots) {
    return computeCalendarDateFields(slots.calendar, slots).month;
  },
  monthCode(slots) {
    return computeCalendarMonthCode(slots.calendar, slots);
  }
};

const dateFieldGetters$1 = {
  era(slots) {
    return computeCalendarEraFields(slots.calendar, slots).era;
  },
  eraYear(slots) {
    return computeCalendarEraFields(slots.calendar, slots).eraYear;
  },
  year(slots) {
    return computeCalendarDateFields(slots.calendar, slots).year;
  },
  month(slots) {
    return computeCalendarDateFields(slots.calendar, slots).month;
  },
  monthCode(slots) {
    return computeCalendarMonthCode(slots.calendar, slots);
  },
  day(slots) {
    return computeCalendarDateFields(slots.calendar, slots).day;
  }
};

const monthDayFieldGetters$1 = {
  monthCode(slots) {
    return computeCalendarMonthCode(slots.calendar, slots);
  },
  day(slots) {
    return computeCalendarDateFields(slots.calendar, slots).day;
  }
};

const yearMonthDerivedGetters = {
  daysInMonth(slots) {
    return computeCalendarDaysInMonth(slots.calendar, slots);
  },
  daysInYear(slots) {
    return computeCalendarDaysInYear(slots.calendar, slots);
  },
  monthsInYear(slots) {
    return computeCalendarMonthsInYear(slots.calendar, slots);
  },
  inLeapYear(slots) {
    return computeCalendarInLeapYear(slots.calendar, slots);
  }
};

const dateDerivedGetters = {
  dayOfWeek(slots) {
    return computeIsoDayOfWeek(slots);
  },
  dayOfYear(slots) {
    return computeCalendarDayOfYear(slots.calendar, slots);
  },
  weekOfYear(slots) {
    return computeCalendarWeekOfYear(slots.calendar, slots);
  },
  yearOfWeek(slots) {
    return computeCalendarYearOfWeek(slots.calendar, slots);
  },
  daysInWeek() {
    return 7;
  },
  daysInMonth(slots) {
    return computeCalendarDaysInMonth(slots.calendar, slots);
  },
  daysInYear(slots) {
    return computeCalendarDaysInYear(slots.calendar, slots);
  },
  monthsInYear(slots) {
    return computeCalendarMonthsInYear(slots.calendar, slots);
  },
  inLeapYear(slots) {
    return computeCalendarInLeapYear(slots.calendar, slots);
  }
};

function createNativeGetters(shimGetters) {
  return createPropGetters(Object.keys(shimGetters));
}

createNativeGetters(yearMonthDerivedGetters), createNativeGetters(dateDerivedGetters);

function createDateTimeFormatClass(getTemporalBrandingAndSlots) {
  return createDateTimeFormatShell(internals => {
    const getTemporalFormat = memoize(branding => {
      let options;
      switch (branding) {
       case InstantBranding:
        options = transformInstantOptions(internals.F, 1);
        break;

       case PlainDateTimeBranding:
        options = applyPlainFormatTimeZone(transformDateTimeOptions(internals.F, 1));
        break;

       case PlainDateBranding:
        options = applyPlainFormatTimeZone(transformDateOptions(internals.F, 1));
        break;

       case PlainTimeBranding:
        options = applyPlainFormatTimeZone(transformTimeOptions(internals.F, 1));
        break;

       case PlainYearMonthBranding:
        options = applyPlainFormatTimeZone(transformYearMonthOptions(internals.F, 1));
        break;

       case PlainMonthDayBranding:
        options = applyPlainFormatTimeZone(transformMonthDayOptions(internals.F, 1));
        break;

       default:
        throwTypeError(invalidFormatType(branding));
      }
      return new RawDateTimeFormat(internals.ze, options);
    });
    return {
      A(formattable) {
        if (void 0 === formattable) {
          return [ internals.t ];
        }
        const brandingAndSlots = getTemporalBrandingAndSlots(formattable);
        if (!brandingAndSlots) {
          return [ internals.t, Number(formattable) ];
        }
        const [branding, slots] = brandingAndSlots;
        const format = getTemporalFormat(branding);
        return checkTemporalDateTimeFormatCompatible(format, branding, slots), [ format, temporalDateTimeToEpochMilli(branding, slots) ];
      },
      v(start, end) {
        void 0 !== start && void 0 !== end || throwTypeError(mismatchingFormatTypes);
        const startBrandingAndSlots = getTemporalBrandingAndSlots(start);
        const startEpochMilli = startBrandingAndSlots ? void 0 : Number(start);
        const endBrandingAndSlots = getTemporalBrandingAndSlots(end);
        const endEpochMilli = endBrandingAndSlots ? void 0 : Number(end);
        if (!startBrandingAndSlots && !endBrandingAndSlots) {
          return [ internals.t, startEpochMilli, endEpochMilli ];
        }
        startBrandingAndSlots && endBrandingAndSlots || throwTypeError(mismatchingFormatTypes);
        const [startBranding, startSlots] = startBrandingAndSlots;
        const [endBranding, endSlots] = endBrandingAndSlots;
        startBranding !== endBranding && throwTypeError(mismatchingFormatTypes);
        const format = getTemporalFormat(startBranding);
        return checkTemporalDateTimeFormatCompatible(format, startBranding, startSlots), 
        checkTemporalDateTimeFormatCompatible(format, startBranding, endSlots), [ format, temporalDateTimeToEpochMilli(startBranding, startSlots), temporalDateTimeToEpochMilli(startBranding, endSlots) ];
      }
    };
  });
}

function checkTemporalDateTimeFormatCompatible(format, branding, slots) {
  switch (branding) {
   case InstantBranding:
   case PlainTimeBranding:
    return;

   case PlainDateTimeBranding:
   case PlainDateBranding:
    return void checkResolvedCalendarCompatible(format, slots);

   case PlainYearMonthBranding:
   case PlainMonthDayBranding:
    return void checkResolvedCalendarCompatible(format, slots, 1);

   default:
    throwTypeError(invalidFormatType(branding));
  }
}

function temporalDateTimeToEpochMilli(branding, slots) {
  switch (branding) {
   case InstantBranding:
    return getEpochMilli(slots);

   case PlainDateTimeBranding:
    return isoDateTimeToEpochMilli(slots);

   case PlainDateBranding:
   case PlainYearMonthBranding:
   case PlainMonthDayBranding:
    return isoDateToEpochMilli(slots);

   case PlainTimeBranding:
    return timeFieldsToMilli(slots);

   default:
    throwTypeError(invalidFormatType(branding));
  }
}

function resolveBasicCalendarId(rawCalendarId) {
  const lowerRawCalendarId = requireString(rawCalendarId).toLowerCase();
  return lowerRawCalendarId === isoCalendarId ? isoCalendarImpl : lowerRawCalendarId === gregoryCalendarId ? gregoryCalendarImpl : void throwRangeError(exoticCalendarRequired(rawCalendarId, "temporal-polyfill/full"));
}

function resolveBasicCalendarArg(rawCalendarId = isoCalendarId) {
  return resolveBasicCalendarId(rawCalendarId);
}

const zonedDateTimeSlotsMap = /*@__PURE__*/ new WeakMap;

const ZonedDateTime = /*@__PURE__*/ defineTemporalClass(ZonedDateTimeBranding, class {
  constructor(epochNanoseconds, timeZoneId, calendar = void 0) {
    const epochNano = checkEpochNanoInBounds(toBigInt(epochNanoseconds));
    const timeZone = queryTimeZone(refineTimeZoneId(timeZoneId));
    const calendarImpl = resolveBasicCalendarArg(calendar);
    initZonedDateTime(this, createZonedEpochNanoSlots(epochNano, timeZone, calendarImpl));
  }
  static from(arg, options = void 0) {
    return createZonedDateTime(toZonedDateTimeSlots(arg, options));
  }
  static compare(arg0, arg1) {
    return compareZonedEpochSlots(toZonedDateTimeSlots(arg0), toZonedDateTimeSlots(arg1));
  }
  get calendarId() {
    return getCalendarSlotId(getZonedDateTimeSlots(this).calendar);
  }
  get timeZoneId() {
    return getZonedDateTimeSlots(this).timeZone.id;
  }
  get epochMilliseconds() {
    return getEpochMilli(getZonedDateTimeSlots(this));
  }
  get epochNanoseconds() {
    return getEpochNano(getZonedDateTimeSlots(this));
  }
  get offset() {
    return formatOffsetNano(zonedEpochSlotsToIso(getZonedDateTimeSlots(this)).offsetNanoseconds);
  }
  get offsetNanoseconds() {
    return zonedEpochSlotsToIso(getZonedDateTimeSlots(this)).offsetNanoseconds;
  }
  get hoursInDay() {
    return computeZonedHoursInDay(getZonedDateTimeSlots(this));
  }
  with(mod, options = void 0) {
    return createZonedDateTime(mergeZonedDateTimeFields(getZonedDateTimeSlots(this), validateBag(mod), options));
  }
  withCalendar(calendarArg) {
    return createZonedDateTime({
      ...getZonedDateTimeSlots(this),
      calendar: refineCalendarArg(calendarArg)
    });
  }
  withTimeZone(timeZoneArg) {
    return createZonedDateTime({
      ...getZonedDateTimeSlots(this),
      timeZone: queryTimeZone(refineTimeZoneArg(timeZoneArg))
    });
  }
  withPlainTime(plainTimeArg = void 0) {
    return createZonedDateTime(zonedDateTimeWithPlainTime(getZonedDateTimeSlots(this), optionalToPlainTimeFields(plainTimeArg)));
  }
  add(durationArg, options = void 0) {
    const slots = getZonedDateTimeSlots(this);
    return createZonedDateTime(moveZonedEpochSlots(slots, toDurationSlots(durationArg), options));
  }
  subtract(durationArg, options = void 0) {
    const slots = getZonedDateTimeSlots(this);
    return createZonedDateTime(moveZonedEpochSlots(slots, negateDurationFields(toDurationSlots(durationArg)), options));
  }
  until(otherArg, options = void 0) {
    const slots = getZonedDateTimeSlots(this);
    const other = toZonedDateTimeSlots(otherArg);
    const calendar = getCommonCalendar(slots.calendar, other.calendar);
    return createDuration(createDurationSlots(diffZonedDateTimes(0, calendar, slots, other, options)));
  }
  since(otherArg, options = void 0) {
    const slots = getZonedDateTimeSlots(this);
    const other = toZonedDateTimeSlots(otherArg);
    const calendar = getCommonCalendar(slots.calendar, other.calendar);
    return createDuration(createDurationSlots(diffZonedDateTimes(1, calendar, slots, other, options)));
  }
  round(options) {
    const slots = getZonedDateTimeSlots(this);
    const [smallestUnit, roundingInc, roundingMode] = refineRoundingOptions(options);
    return createZonedDateTime(roundZonedEpochSlotsToUnit(slots, smallestUnit, roundingInc, roundingMode));
  }
  startOfDay() {
    return createZonedDateTime(computeZonedStartOfDay(getZonedDateTimeSlots(this)));
  }
  equals(otherArg) {
    return zonedDateTimesEqual(getZonedDateTimeSlots(this), toZonedDateTimeSlots(otherArg));
  }
  toInstant() {
    return createInstant(zonedDateTimeToInstant(getZonedDateTimeSlots(this)));
  }
  toPlainDateTime() {
    return createPlainDateTime(zonedDateTimeToPlainDateTime(getZonedDateTimeSlots(this)));
  }
  toPlainDate() {
    return createPlainDate(zonedDateTimeToPlainDate(getZonedDateTimeSlots(this)));
  }
  toPlainTime() {
    return createPlainTime(zonedDateTimeToPlainTime(getZonedDateTimeSlots(this)));
  }
  toLocaleString(locales = void 0, options = {}) {
    const slots = getZonedDateTimeSlots(this);
    const format = new RawDateTimeFormat(locales, applyZonedFormatTimeZone(transformZonedOptions(options), getZonedTimeZoneId(slots)));
    return checkResolvedCalendarCompatible(format, slots), format.format(getEpochMilli(slots));
  }
  toString(options = void 0) {
    return formatZonedDateTimeIso(getZonedDateTimeSlots(this), options);
  }
  toJSON() {
    return formatZonedDateTimeIso(getZonedDateTimeSlots(this));
  }
  getTimeZoneTransition(options) {
    const slots = getZonedDateTimeSlots(this);
    const newEpochNano = getTimeZoneTransitionEpochNanoseconds(slots, options);
    return newEpochNano ? createZonedDateTime({
      ...slots,
      epochNanoseconds: newEpochNano
    }) : null;
  }
  valueOf() {
    return forbiddenValueOf();
  }
}, getZonedDateTimeIsoSlots, dateFieldGetters$1, dateDerivedGetters, timeGetters);

function createZonedDateTime(slots) {
  return initZonedDateTime(Object.create(ZonedDateTime.prototype), slots);
}

function getZonedDateTimeSlots(obj) {
  return getZonedDateTimeSlotsIfPresent(obj) || invalidRecordType();
}

function getZonedDateTimeIsoSlots(obj) {
  const slots = getZonedDateTimeSlots(obj);
  return {
    ...zonedEpochSlotsToIso(slots),
    calendar: slots.calendar
  };
}

function getZonedDateTimeSlotsIfPresent(obj) {
  return zonedDateTimeSlotsMap.get(obj);
}

function toZonedDateTimeSlots(arg, options) {
  if (isObjectLike(arg)) {
    const ownSlots = getZonedDateTimeSlotsIfPresent(arg);
    if (ownSlots) {
      return refineZonedFieldOptions(options), ownSlots;
    }
    const calendar = getCalendarFromBag(arg);
    return refineZonedDateTimeObjectLike(refineTimeZoneArg, calendar, arg, options);
  }
  return parseZonedDateTime(arg, resolveBasicCalendarId, options);
}

function initZonedDateTime(instance, slots) {
  return zonedDateTimeSlotsMap.set(instance, slots), attachDebugString(instance), 
  instance;
}

function refineTimeZoneArg(arg) {
  if (isObjectLike(arg)) {
    const slots = getZonedDateTimeSlotsIfPresent(arg);
    return slots || throwTypeError(invalidTimeZone(arg)), slots.timeZone.id;
  }
  return (arg => resolveTimeZoneId(parseTimeZoneId(requireString(arg))))(arg);
}

const instantSlotsMap = /*@__PURE__*/ new WeakMap;

const Instant = /*@__PURE__*/ defineTemporalClass(InstantBranding, class {
  constructor(epochNanoseconds) {
    const epochNano = checkEpochNanoInBounds(toBigInt(epochNanoseconds));
    initInstant(this, createEpochNanoSlots(epochNano));
  }
  static from(arg) {
    return createInstant(toInstantSlots(arg));
  }
  static fromEpochMilliseconds(epochMilli) {
    return createInstant(epochMilliToInstant(epochMilli));
  }
  static fromEpochNanoseconds(epochNano) {
    return createInstant(epochNanoToInstant(epochNano));
  }
  static compare(a, b) {
    return compareZonedEpochSlots(toInstantSlots(a), toInstantSlots(b));
  }
  get epochMilliseconds() {
    return getEpochMilli(getInstantSlots(this));
  }
  get epochNanoseconds() {
    return getEpochNano(getInstantSlots(this));
  }
  add(durationArg) {
    const slots = getInstantSlots(this);
    return createInstant(createEpochNanoSlots(moveEpochNano(slots.epochNanoseconds, toDurationSlots(durationArg))));
  }
  subtract(durationArg) {
    const slots = getInstantSlots(this);
    return createInstant(createEpochNanoSlots(moveEpochNano(slots.epochNanoseconds, negateDurationFields(toDurationSlots(durationArg)))));
  }
  until(otherArg, options = void 0) {
    return createDuration(diffInstants(0, getInstantSlots(this), toInstantSlots(otherArg), options));
  }
  since(otherArg, options = void 0) {
    return createDuration(diffInstants(1, getInstantSlots(this), toInstantSlots(otherArg), options));
  }
  round(options) {
    const slots = getInstantSlots(this);
    const [smallestUnit, roundingInc, roundingMode] = refineRoundingOptions(options, 5, 1);
    return createInstant(createEpochNanoSlots(roundBigNanoToDayOriginInc(slots.epochNanoseconds, computeBigNanoInc(smallestUnit, roundingInc), roundingMode)));
  }
  equals(otherArg) {
    return instantsEqual(getInstantSlots(this), toInstantSlots(otherArg));
  }
  toZonedDateTimeISO(timeZoneArg) {
    return createZonedDateTime(instantToZonedDateTime(getInstantSlots(this), queryTimeZone(refineTimeZoneArg(timeZoneArg))));
  }
  toLocaleString(locales = void 0, options = {}) {
    const slots = getInstantSlots(this);
    return new RawDateTimeFormat(locales, transformInstantOptions(options)).format(getEpochMilli(slots));
  }
  toString(options = void 0) {
    return formatInstantIso(refineTimeZoneArg, getInstantSlots(this), options);
  }
  toJSON() {
    return formatInstantIso(refineTimeZoneArg, getInstantSlots(this));
  }
  valueOf() {
    return forbiddenValueOf();
  }
});

function createInstant(slots) {
  return initInstant(Object.create(Instant.prototype), slots);
}

function getInstantSlots(obj) {
  return getInstantSlotsIfPresent(obj) || invalidRecordType();
}

function getInstantSlotsIfPresent(obj) {
  return instantSlotsMap.get(obj);
}

function toInstantSlots(arg) {
  if (isObjectLike(arg)) {
    const ownSlots = getInstantSlotsIfPresent(arg);
    if (ownSlots) {
      return ownSlots;
    }
    const zonedDateTimeSlots = getZonedDateTimeSlotsIfPresent(arg);
    if (zonedDateTimeSlots) {
      return createEpochNanoSlots(zonedDateTimeSlots.epochNanoseconds);
    }
  }
  return parseInstant(arg);
}

const {toTemporalInstant: toTemporalInstant} = {
  toTemporalInstant() {
    const epochMilli = Date.prototype.valueOf.call(this);
    return createInstant(createEpochNanoSlots(BigInt(requireNumberIsInteger(epochMilli)) * bigNanoInMilli));
  }
};

function initInstant(instance, slots) {
  return instantSlotsMap.set(instance, slots), attachDebugString(instance), instance;
}

const plainMonthDaySlotsMap = /*@__PURE__*/ new WeakMap;

const PlainMonthDay = /*@__PURE__*/ defineTemporalClass(PlainMonthDayBranding, class {
  constructor(isoMonth, isoDay, calendar = void 0, referenceIsoYear) {
    const isoMonthInt = toIntegerWithTrunc(isoMonth);
    const isoDayInt = toIntegerWithTrunc(isoDay);
    const calendarImpl = resolveBasicCalendarArg(calendar);
    const isoYearInt = toIntegerWithTrunc(referenceIsoYear ?? isoEpochFirstLeapYear);
    const fields = checkIsoDateInBounds(validateIsoDateFields({
      year: isoYearInt,
      month: isoMonthInt,
      day: isoDayInt
    }));
    initPlainMonthDay(this, createDateSlots(fields, calendarImpl));
  }
  static from(arg, options = void 0) {
    return createPlainMonthDay(toPlainMonthDaySlots(arg, options));
  }
  get calendarId() {
    return getCalendarSlotId(getPlainMonthDaySlots(this).calendar);
  }
  with(mod, options = void 0) {
    return createPlainMonthDay(mergePlainMonthDayFields(getPlainMonthDaySlots(this), validateBag(mod), options));
  }
  equals(otherArg) {
    return plainMonthDaysEqual(getPlainMonthDaySlots(this), toPlainMonthDaySlots(otherArg));
  }
  toPlainDate(bag) {
    const slots = getPlainMonthDaySlots(this);
    return createPlainDate(convertPlainMonthDayToDate(slots.calendar, this, bag));
  }
  toLocaleString(locales = void 0, options = {}) {
    const slots = getPlainMonthDaySlots(this);
    const format = new RawDateTimeFormat(locales, applyPlainFormatTimeZone(transformMonthDayOptions(options)));
    return checkResolvedCalendarCompatible(format, slots, 1), format.format(isoDateToEpochMilli(slots));
  }
  toString(options = void 0) {
    return formatPlainMonthDayIso(getPlainMonthDaySlots(this), options);
  }
  toJSON() {
    return formatPlainMonthDayIso(getPlainMonthDaySlots(this));
  }
  valueOf() {
    return forbiddenValueOf();
  }
}, getPlainMonthDaySlots, monthDayFieldGetters$1);

function createPlainMonthDay(slots) {
  return initPlainMonthDay(Object.create(PlainMonthDay.prototype), slots);
}

function getPlainMonthDaySlots(obj) {
  return getPlainMonthDaySlotsIfPresent(obj) || invalidRecordType();
}

function getPlainMonthDaySlotsIfPresent(obj) {
  return plainMonthDaySlotsMap.get(obj);
}

function toPlainMonthDaySlots(arg, options) {
  if (isObjectLike(arg)) {
    const ownSlots = getPlainMonthDaySlotsIfPresent(arg);
    if (ownSlots) {
      return refineOverflowOptions(options), ownSlots;
    }
    const calendarMaybe = extractCalendarFromBag(arg);
    return refinePlainMonthDayObjectLike(void 0 === calendarMaybe ? isoCalendarImpl : calendarMaybe, void 0 === calendarMaybe, arg, options);
  }
  const res = parsePlainMonthDay(arg, resolveBasicCalendarId);
  return refineOverflowOptions(options), res;
}

function initPlainMonthDay(instance, slots) {
  return plainMonthDaySlotsMap.set(instance, slots), attachDebugString(instance), 
  instance;
}

const plainYearMonthSlotsMap = /*@__PURE__*/ new WeakMap;

const PlainYearMonth = /*@__PURE__*/ defineTemporalClass(PlainYearMonthBranding, class {
  constructor(isoYear, isoMonth, calendar = void 0, referenceIsoDay) {
    const isoYearInt = toIntegerWithTrunc(isoYear);
    const isoMonthInt = toIntegerWithTrunc(isoMonth);
    const calendarImpl = resolveBasicCalendarArg(calendar);
    const isoDayInt = toIntegerWithTrunc(referenceIsoDay ?? 1);
    const fields = checkIsoYearMonthInBounds(validateIsoDateFields({
      year: isoYearInt,
      month: isoMonthInt,
      day: isoDayInt
    }));
    initPlainYearMonth(this, createDateSlots(fields, calendarImpl));
  }
  static from(arg, options = void 0) {
    return createPlainYearMonth(toPlainYearMonthSlots(arg, options));
  }
  static compare(arg0, arg1) {
    return compareIsoDateFields(toPlainYearMonthSlots(arg0), toPlainYearMonthSlots(arg1));
  }
  get calendarId() {
    return getCalendarSlotId(getPlainYearMonthSlots(this).calendar);
  }
  with(mod, options = void 0) {
    return createPlainYearMonth(mergePlainYearMonthFields(getPlainYearMonthSlots(this), validateBag(mod), options));
  }
  add(durationArg, options = void 0) {
    const slots = getPlainYearMonthSlots(this);
    return createPlainYearMonth(createDateSlots(moveYearMonth(0, slots.calendar, slots, toDurationSlots(durationArg), options), slots.calendar));
  }
  subtract(durationArg, options = void 0) {
    const slots = getPlainYearMonthSlots(this);
    return createPlainYearMonth(createDateSlots(moveYearMonth(1, slots.calendar, slots, toDurationSlots(durationArg), options), slots.calendar));
  }
  until(otherArg, options = void 0) {
    const slots = getPlainYearMonthSlots(this);
    const other = toPlainYearMonthSlots(otherArg);
    const calendar = getCommonCalendar(slots.calendar, other.calendar);
    return createDuration(diffPlainYearMonth(0, calendar, slots, other, options));
  }
  since(otherArg, options = void 0) {
    const slots = getPlainYearMonthSlots(this);
    const other = toPlainYearMonthSlots(otherArg);
    const calendar = getCommonCalendar(slots.calendar, other.calendar);
    return createDuration(diffPlainYearMonth(1, calendar, slots, other, options));
  }
  equals(otherArg) {
    return plainYearMonthsEqual(getPlainYearMonthSlots(this), toPlainYearMonthSlots(otherArg));
  }
  toPlainDate(bag) {
    const slots = getPlainYearMonthSlots(this);
    return createPlainDate(convertPlainYearMonthToDate(slots.calendar, this, bag));
  }
  toLocaleString(locales = void 0, options = {}) {
    const slots = getPlainYearMonthSlots(this);
    const format = new RawDateTimeFormat(locales, applyPlainFormatTimeZone(transformYearMonthOptions(options)));
    return checkResolvedCalendarCompatible(format, slots, 1), format.format(isoDateToEpochMilli(slots));
  }
  toString(options = void 0) {
    return formatPlainYearMonthIso(getPlainYearMonthSlots(this), options);
  }
  toJSON() {
    return formatPlainYearMonthIso(getPlainYearMonthSlots(this));
  }
  valueOf() {
    return forbiddenValueOf();
  }
}, getPlainYearMonthSlots, yearMonthFieldGetters$1, yearMonthDerivedGetters);

function createPlainYearMonth(slots) {
  return initPlainYearMonth(Object.create(PlainYearMonth.prototype), slots);
}

function getPlainYearMonthSlots(obj) {
  return getPlainYearMonthSlotsIfPresent(obj) || invalidRecordType();
}

function getPlainYearMonthSlotsIfPresent(obj) {
  return plainYearMonthSlotsMap.get(obj);
}

function toPlainYearMonthSlots(arg, options) {
  if (isObjectLike(arg)) {
    const ownSlots = getPlainYearMonthSlotsIfPresent(arg);
    if (ownSlots) {
      return refineOverflowOptions(options), ownSlots;
    }
    const calendar = getCalendarFromBag(arg);
    return refinePlainYearMonthObjectLike(calendar, arg, options);
  }
  const res = parsePlainYearMonth(arg, resolveBasicCalendarId);
  return refineOverflowOptions(options), res;
}

function initPlainYearMonth(instance, slots) {
  return plainYearMonthSlotsMap.set(instance, slots), attachDebugString(instance), 
  instance;
}

function getTemporalBrandingAndSlots(obj) {
  if (!isObjectLike(obj)) {
    return;
  }
  let slots = getInstantSlotsIfPresent(obj);
  return slots ? [ InstantBranding, slots ] : (slots = getZonedDateTimeSlotsIfPresent(obj), 
  slots ? [ ZonedDateTimeBranding, slots ] : (slots = getPlainDateTimeSlotsIfPresent(obj), 
  slots ? [ PlainDateTimeBranding, slots ] : (slots = getPlainDateSlotsIfPresent(obj), 
  slots ? [ PlainDateBranding, slots ] : (slots = getPlainTimeSlotsIfPresent(obj), 
  slots ? [ PlainTimeBranding, slots ] : (slots = getPlainYearMonthSlotsIfPresent(obj), 
  slots ? [ PlainYearMonthBranding, slots ] : (slots = getPlainMonthDaySlotsIfPresent(obj), 
  slots ? [ PlainMonthDayBranding, slots ] : (slots = getDurationSlotsIfPresent(obj), 
  slots ? [ DurationBranding, slots ] : void 0)))))));
}

function validateBag(bag) {
  return (getTemporalBrandingAndSlots(bag) || void 0 !== bag.calendar || void 0 !== bag.timeZone) && throwTypeError(invalidBag), 
  bag;
}

const plainTimeSlotsMap = /*@__PURE__*/ new WeakMap;

const PlainTime = /*@__PURE__*/ defineTemporalClass(PlainTimeBranding, class {
  constructor(hour = 0, minute = 0, second = 0, millisecond = 0, microsecond = 0, nanosecond = 0) {
    const fields = validateTimeFields(mapProps(toIntegerWithTrunc, {
      hour: hour,
      minute: minute,
      second: second,
      millisecond: millisecond,
      microsecond: microsecond,
      nanosecond: nanosecond
    }));
    initPlainTime(this, createTimeSlots(fields));
  }
  static from(arg, options = void 0) {
    return createPlainTime(toPlainTimeSlots(arg, options));
  }
  static compare(arg0, arg1) {
    return compareTimeFields(toPlainTimeSlots(arg0), toPlainTimeSlots(arg1));
  }
  with(mod, options = void 0) {
    return createPlainTime(mergePlainTimeFields(getPlainTimeSlots(this), validateBag(mod), options));
  }
  add(durationArg) {
    const slots = getPlainTimeSlots(this);
    return createPlainTime(moveTime(slots, toDurationSlots(durationArg))[0]);
  }
  subtract(durationArg) {
    const slots = getPlainTimeSlots(this);
    return createPlainTime(moveTime(slots, negateDurationFields(toDurationSlots(durationArg)))[0]);
  }
  until(otherArg, options = void 0) {
    return createDuration(diffPlainTimes(0, getPlainTimeSlots(this), toPlainTimeSlots(otherArg), options));
  }
  since(otherArg, options = void 0) {
    return createDuration(diffPlainTimes(1, getPlainTimeSlots(this), toPlainTimeSlots(otherArg), options));
  }
  round(options) {
    const slots = getPlainTimeSlots(this);
    const [smallestUnit, roundingInc, roundingMode] = refineRoundingOptions(options, 5);
    return createPlainTime(roundTimeToNano(slots, computeNanoInc(smallestUnit, roundingInc), roundingMode)[0]);
  }
  equals(other) {
    return plainTimesEqual(getPlainTimeSlots(this), toPlainTimeSlots(other));
  }
  toLocaleString(locales = void 0, options = {}) {
    const slots = getPlainTimeSlots(this);
    return new RawDateTimeFormat(locales, applyPlainFormatTimeZone(transformTimeOptions(options))).format(timeFieldsToMilli(slots));
  }
  toString(options = void 0) {
    return formatPlainTimeIso(getPlainTimeSlots(this), options);
  }
  toJSON() {
    return formatPlainTimeIso(getPlainTimeSlots(this));
  }
  valueOf() {
    return forbiddenValueOf();
  }
}, getPlainTimeSlots, timeGetters);

function createPlainTime(slots) {
  return initPlainTime(Object.create(PlainTime.prototype), slots);
}

function getPlainTimeSlots(obj) {
  return getPlainTimeSlotsIfPresent(obj) || invalidRecordType();
}

function getPlainTimeSlotsIfPresent(obj) {
  return plainTimeSlotsMap.get(obj);
}

function toPlainTimeSlots(arg, options) {
  if (isObjectLike(arg)) {
    const ownSlots = getPlainTimeSlotsIfPresent(arg);
    if (ownSlots) {
      return refineOverflowOptions(options), ownSlots;
    }
    const dateTimeSlots = getPlainDateTimeSlotsIfPresent(arg);
    if (dateTimeSlots) {
      return refineOverflowOptions(options), createTimeSlots(dateTimeSlots);
    }
    const zonedDateTimeSlots = getZonedDateTimeSlotsIfPresent(arg);
    return zonedDateTimeSlots ? (refineOverflowOptions(options), zonedDateTimeToPlainTime(zonedDateTimeSlots)) : refinePlainTimeObjectLike(arg, options);
  }
  const timeSlots = parsePlainTime(arg);
  return refineOverflowOptions(options), timeSlots;
}

function optionalToPlainTimeFields(timeArg) {
  return void 0 === timeArg ? void 0 : toPlainTimeSlots(timeArg);
}

function initPlainTime(instance, slots) {
  return plainTimeSlotsMap.set(instance, slots), attachDebugString(instance), instance;
}

const plainDateTimeSlotsMap = /*@__PURE__*/ new WeakMap;

const PlainDateTime = /*@__PURE__*/ defineTemporalClass(PlainDateTimeBranding, class {
  constructor(isoYear, isoMonth, isoDay, hour = 0, minute = 0, second = 0, millisecond = 0, microsecond = 0, nanosecond = 0, calendar = void 0) {
    const fields = checkIsoDateTimeInBounds(validateIsoDateTimeFields(mapProps(toIntegerWithTrunc, {
      year: isoYear,
      month: isoMonth,
      day: isoDay,
      hour: hour,
      minute: minute,
      second: second,
      millisecond: millisecond,
      microsecond: microsecond,
      nanosecond: nanosecond
    })));
    const calendarImpl = resolveBasicCalendarArg(calendar);
    initPlainDateTime(this, createDateTimeSlots(fields, calendarImpl));
  }
  static from(arg, options = void 0) {
    return createPlainDateTime(toPlainDateTimeSlots(arg, options));
  }
  static compare(arg0, arg1) {
    const slots0 = toPlainDateTimeSlots(arg0);
    const slots1 = toPlainDateTimeSlots(arg1);
    return compareIsoDateTimeFields(slots0, slots1);
  }
  get calendarId() {
    return getCalendarSlotId(getPlainDateTimeSlots(this).calendar);
  }
  with(mod, options = void 0) {
    return createPlainDateTime(mergePlainDateTimeFields(getPlainDateTimeSlots(this), validateBag(mod), options));
  }
  withCalendar(calendarArg) {
    const slots = getPlainDateTimeSlots(this);
    return createPlainDateTime(createDateTimeSlots(slots, refineCalendarArg(calendarArg)));
  }
  withPlainTime(plainTimeArg = void 0) {
    const slots = getPlainDateTimeSlots(this);
    return createPlainDateTime(createPlainDateTimeFromRefinedFields(slots, optionalToPlainTimeFields(plainTimeArg), slots.calendar));
  }
  add(durationArg, options = void 0) {
    const slots = getPlainDateTimeSlots(this);
    return createPlainDateTime(createDateTimeSlots(moveDateTime(slots.calendar, slots, toDurationSlots(durationArg), options), slots.calendar));
  }
  subtract(durationArg, options = void 0) {
    const slots = getPlainDateTimeSlots(this);
    return createPlainDateTime(createDateTimeSlots(moveDateTime(slots.calendar, slots, negateDurationFields(toDurationSlots(durationArg)), options), slots.calendar));
  }
  until(otherArg, options = void 0) {
    const slots = getPlainDateTimeSlots(this);
    const other = toPlainDateTimeSlots(otherArg);
    const calendar = getCommonCalendar(slots.calendar, other.calendar);
    return createDuration(diffPlainDateTimes(0, calendar, slots, other, options));
  }
  since(otherArg, options = void 0) {
    const slots = getPlainDateTimeSlots(this);
    const other = toPlainDateTimeSlots(otherArg);
    const calendar = getCommonCalendar(slots.calendar, other.calendar);
    return createDuration(diffPlainDateTimes(1, calendar, slots, other, options));
  }
  round(options) {
    const slots = getPlainDateTimeSlots(this);
    const [smallestUnit, roundingInc, roundingMode] = refineRoundingOptions(options);
    return createPlainDateTime(createDateTimeSlots(roundDateTimeToNano(slots, computeNanoInc(smallestUnit, roundingInc), roundingMode), slots.calendar));
  }
  equals(otherArg) {
    return plainDateTimesEqual(getPlainDateTimeSlots(this), toPlainDateTimeSlots(otherArg));
  }
  toZonedDateTime(timeZoneArg, options = void 0) {
    return createZonedDateTime(plainDateTimeToZonedDateTime(getPlainDateTimeSlots(this), queryTimeZone(refineTimeZoneArg(timeZoneArg)), options));
  }
  toPlainDate() {
    const slots = getPlainDateTimeSlots(this);
    return createPlainDate(createDateSlots(slots, slots.calendar));
  }
  toPlainTime() {
    return createPlainTime(createTimeSlots(getPlainDateTimeSlots(this)));
  }
  toLocaleString(locales = void 0, options = {}) {
    const slots = getPlainDateTimeSlots(this);
    const format = new RawDateTimeFormat(locales, applyPlainFormatTimeZone(transformDateTimeOptions(options)));
    return checkResolvedCalendarCompatible(format, slots), format.format(isoDateTimeToEpochMilli(slots));
  }
  toString(options = void 0) {
    return formatPlainDateTimeIso(getPlainDateTimeSlots(this), options);
  }
  toJSON() {
    return formatPlainDateTimeIso(getPlainDateTimeSlots(this));
  }
  valueOf() {
    return forbiddenValueOf();
  }
}, getPlainDateTimeSlots, dateFieldGetters$1, dateDerivedGetters, timeGetters);

function createPlainDateTime(slots) {
  return initPlainDateTime(Object.create(PlainDateTime.prototype), slots);
}

function getPlainDateTimeSlots(obj) {
  return getPlainDateTimeSlotsIfPresent(obj) || invalidRecordType();
}

function getPlainDateTimeSlotsIfPresent(obj) {
  return plainDateTimeSlotsMap.get(obj);
}

function toPlainDateTimeSlots(arg, options) {
  if (isObjectLike(arg)) {
    const ownSlots = getPlainDateTimeSlotsIfPresent(arg);
    if (ownSlots) {
      return refineOverflowOptions(options), ownSlots;
    }
    const dateSlots = getPlainDateSlotsIfPresent(arg);
    if (dateSlots) {
      return refineOverflowOptions(options), createDateTimeSlots(combineDateAndTime(dateSlots, timeFieldDefaults), dateSlots.calendar);
    }
    const zonedDateTimeSlots = getZonedDateTimeSlotsIfPresent(arg);
    if (zonedDateTimeSlots) {
      return refineOverflowOptions(options), zonedDateTimeToPlainDateTime(zonedDateTimeSlots);
    }
    const calendar = getCalendarFromBag(arg);
    return refinePlainDateTimeObjectLike(calendar, arg, options);
  }
  const res = parsePlainDateTime(arg, resolveBasicCalendarId);
  return refineOverflowOptions(options), res;
}

function initPlainDateTime(instance, slots) {
  return plainDateTimeSlotsMap.set(instance, slots), attachDebugString(instance), 
  instance;
}

const plainDateSlotsMap = /*@__PURE__*/ new WeakMap;

const PlainDate = /*@__PURE__*/ defineTemporalClass(PlainDateBranding, class {
  constructor(isoYear, isoMonth, isoDay, calendar = void 0) {
    const fields = checkIsoDateInBounds(validateIsoDateFields(mapProps(toIntegerWithTrunc, {
      year: isoYear,
      month: isoMonth,
      day: isoDay
    })));
    const calendarImpl = resolveBasicCalendarArg(calendar);
    initPlainDate(this, createDateSlots(fields, calendarImpl));
  }
  static from(arg, options = void 0) {
    return createPlainDate(toPlainDateSlots(arg, options));
  }
  static compare(arg0, arg1) {
    return compareIsoDateFields(toPlainDateSlots(arg0), toPlainDateSlots(arg1));
  }
  get calendarId() {
    return getCalendarSlotId(getPlainDateSlots(this).calendar);
  }
  with(mod, options = void 0) {
    const slots = getPlainDateSlots(this);
    return createPlainDate(mergePlainDateFields(slots, validateBag(mod), options));
  }
  withCalendar(calendarArg) {
    const slots = getPlainDateSlots(this);
    return createPlainDate(createDateSlots(slots, refineCalendarArg(calendarArg)));
  }
  add(durationArg, options = void 0) {
    const slots = getPlainDateSlots(this);
    return createPlainDate(createDateSlots(moveDate(slots.calendar, slots, toDurationSlots(durationArg), options), slots.calendar));
  }
  subtract(durationArg, options = void 0) {
    const slots = getPlainDateSlots(this);
    return createPlainDate(createDateSlots(moveDate(slots.calendar, slots, negateDurationFields(toDurationSlots(durationArg)), options), slots.calendar));
  }
  until(otherArg, options = void 0) {
    const slots = getPlainDateSlots(this);
    const other = toPlainDateSlots(otherArg);
    const calendar = getCommonCalendar(slots.calendar, other.calendar);
    return createDuration(diffPlainDates(0, calendar, slots, other, options));
  }
  since(otherArg, options = void 0) {
    const slots = getPlainDateSlots(this);
    const other = toPlainDateSlots(otherArg);
    const calendar = getCommonCalendar(slots.calendar, other.calendar);
    return createDuration(diffPlainDates(1, calendar, slots, other, options));
  }
  equals(otherArg) {
    return plainDatesEqual(getPlainDateSlots(this), toPlainDateSlots(otherArg));
  }
  toZonedDateTime(options) {
    const optionsObj = isObjectLike(options) ? {
      timeZone: options.timeZone,
      plainTime: options.plainTime
    } : {
      timeZone: options
    };
    return createZonedDateTime(plainDateToZonedDateTime(refineTimeZoneArg, toPlainTimeSlots, getPlainDateSlots(this), optionsObj));
  }
  toPlainDateTime(plainTimeArg = void 0) {
    const slots = getPlainDateSlots(this);
    return createPlainDateTime(createPlainDateTimeFromRefinedFields(slots, optionalToPlainTimeFields(plainTimeArg), slots.calendar));
  }
  toPlainYearMonth() {
    const slots = getPlainDateSlots(this);
    return createPlainYearMonth(convertToPlainYearMonth(slots.calendar, this));
  }
  toPlainMonthDay() {
    const slots = getPlainDateSlots(this);
    return createPlainMonthDay(convertToPlainMonthDay(slots.calendar, this));
  }
  toLocaleString(locales = void 0, options = {}) {
    const slots = getPlainDateSlots(this);
    const format = new RawDateTimeFormat(locales, applyPlainFormatTimeZone(transformDateOptions(options)));
    return checkResolvedCalendarCompatible(format, slots), format.format(isoDateToEpochMilli(slots));
  }
  toString(options = void 0) {
    return formatPlainDateIso(getPlainDateSlots(this), options);
  }
  toJSON() {
    return formatPlainDateIso(getPlainDateSlots(this));
  }
  valueOf() {
    return forbiddenValueOf();
  }
}, getPlainDateSlots, dateFieldGetters$1, dateDerivedGetters);

function createPlainDate(slots) {
  return initPlainDate(Object.create(PlainDate.prototype), slots);
}

function getPlainDateSlots(obj) {
  return getPlainDateSlotsIfPresent(obj) || invalidRecordType();
}

function getPlainDateSlotsIfPresent(obj) {
  return plainDateSlotsMap.get(obj);
}

function toPlainDateSlots(arg, options) {
  if (isObjectLike(arg)) {
    const ownSlots = getPlainDateSlotsIfPresent(arg);
    if (ownSlots) {
      return refineOverflowOptions(options), ownSlots;
    }
    const dateTimeSlots = getPlainDateTimeSlotsIfPresent(arg);
    if (dateTimeSlots) {
      return refineOverflowOptions(options), createDateSlots(dateTimeSlots, dateTimeSlots.calendar);
    }
    const zonedDateTimeSlots = getZonedDateTimeSlotsIfPresent(arg);
    if (zonedDateTimeSlots) {
      return refineOverflowOptions(options), zonedDateTimeToPlainDate(zonedDateTimeSlots);
    }
    const calendar = getCalendarFromBag(arg);
    return refinePlainDateObjectLike(calendar, arg, options);
  }
  const res = parsePlainDate(arg, resolveBasicCalendarId);
  return refineOverflowOptions(options), res;
}

function initPlainDate(instance, slots) {
  return plainDateSlotsMap.set(instance, slots), attachDebugString(instance), instance;
}

function getCalendarFromBag(bag) {
  const calendar = extractCalendarFromBag(bag);
  return void 0 === calendar ? isoCalendarImpl : calendar;
}

function extractCalendarFromBag(bag) {
  const {calendar: calendarArg} = bag;
  if (void 0 !== calendarArg) {
    return refineCalendarArg(calendarArg);
  }
}

function refineCalendarArg(arg) {
  if (isObjectLike(arg)) {
    const slots = getPlainDateSlotsIfPresent(arg) || getPlainDateTimeSlotsIfPresent(arg) || getZonedDateTimeSlotsIfPresent(arg) || getPlainMonthDaySlotsIfPresent(arg) || getPlainYearMonthSlotsIfPresent(arg);
    return slots || throwTypeError(invalidCalendar(arg)), slots.calendar;
  }
  return (arg => resolveBasicCalendarId(parseCalendarId(requireString(arg))))(arg);
}

const durationSlotsMap = /*@__PURE__*/ new WeakMap;

const Duration = /*@__PURE__*/ defineTemporalClass(DurationBranding, class {
  constructor(years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0, microseconds = 0, nanoseconds = 0) {
    const fields = validateDurationFields(mapProps(toStrictInteger, {
      years: years,
      months: months,
      weeks: weeks,
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      milliseconds: milliseconds,
      microseconds: microseconds,
      nanoseconds: nanoseconds
    }));
    initDuration(this, createDurationSlots(fields));
  }
  static from(arg) {
    return createDuration(toDurationSlots(arg));
  }
  static compare(durationArg0, durationArg1, options = void 0) {
    return compareDurations(refinePublicRelativeTo, toDurationSlots(durationArg0), toDurationSlots(durationArg1), options);
  }
  get sign() {
    return getDurationSlots(this).sign;
  }
  get blank() {
    return !getDurationSlots(this).sign;
  }
  with(mod) {
    return createDuration(mergeDurationFields(getDurationSlots(this), mod));
  }
  negated() {
    return createDuration(negateDuration(getDurationSlots(this)));
  }
  abs() {
    return createDuration(absDuration(getDurationSlots(this)));
  }
  add(otherArg, options = void 0) {
    return createDuration(addDurations(refinePublicRelativeTo, 0, getDurationSlots(this), toDurationSlots(otherArg), options));
  }
  subtract(otherArg, options = void 0) {
    return createDuration(addDurations(refinePublicRelativeTo, 1, getDurationSlots(this), toDurationSlots(otherArg), options));
  }
  round(roundTo) {
    return createDuration(roundDuration(refinePublicRelativeTo, getDurationSlots(this), roundTo));
  }
  total(totalOf) {
    return totalDuration(refinePublicRelativeTo, getDurationSlots(this), totalOf);
  }
  toLocaleString(locales = void 0, options) {
    const slots = getDurationSlots(this);
    return Intl.DurationFormat ? new Intl.DurationFormat(locales, options).format(slots) : formatDurationIso(slots, options);
  }
  toString(options = void 0) {
    return formatDurationIso(getDurationSlots(this), options);
  }
  toJSON() {
    return formatDurationIso(getDurationSlots(this));
  }
  valueOf() {
    return forbiddenValueOf();
  }
}, getDurationSlots, durationGetters);

function createDuration(slots) {
  return initDuration(Object.create(Duration.prototype), slots);
}

function getDurationSlots(obj) {
  return getDurationSlotsIfPresent(obj) || invalidRecordType();
}

function getDurationSlotsIfPresent(obj) {
  return durationSlotsMap.get(obj);
}

function toDurationSlots(arg) {
  if (isObjectLike(arg)) {
    return getDurationSlotsIfPresent(arg) || refineDurationObjectLike(arg);
  }
  return parseDuration(arg);
}

function refinePublicRelativeTo(relativeTo) {
  if (void 0 !== relativeTo) {
    if (isObjectLike(relativeTo)) {
      const zonedDateTimeSlots = getZonedDateTimeSlotsIfPresent(relativeTo);
      if (zonedDateTimeSlots) {
        return zonedDateTimeSlots;
      }
      const dateSlots = getPlainDateSlotsIfPresent(relativeTo);
      if (dateSlots) {
        return dateSlots;
      }
      const dateTimeSlots = getPlainDateTimeSlotsIfPresent(relativeTo);
      if (dateTimeSlots) {
        return createDateSlots(dateTimeSlots, dateTimeSlots.calendar);
      }
      const calendar = getCalendarFromBag(relativeTo);
      return refineMaybeZonedDateTimeObjectLike(refineTimeZoneArg, calendar, relativeTo);
    }
    return parseRelativeToSlots(relativeTo, resolveBasicCalendarId);
  }
}

function initDuration(instance, slots) {
  return durationSlotsMap.set(instance, slots), attachDebugString(instance), instance;
}

const Now = /*@__PURE__*/ Object.defineProperties({}, {
  ...createStringTagDescriptors("Temporal.Now"),
  ...createPropDescriptors({
    timeZoneId() {
      return getCurrentTimeZoneId();
    },
    instant() {
      return createInstant(createEpochNanoSlots(getCurrentEpochNano()));
    },
    zonedDateTimeISO(timeZoneArg = getCurrentTimeZoneId()) {
      const timeZone = queryTimeZone(refineTimeZoneArg(timeZoneArg));
      return createZonedDateTime(createZonedEpochNanoSlots(getCurrentEpochNano(), timeZone));
    },
    plainDateTimeISO(timeZoneArg = getCurrentTimeZoneId()) {
      const isoDateTime = getCurrentIsoDateTime(queryTimeZone(refineTimeZoneArg(timeZoneArg)));
      return createPlainDateTime(createDateTimeSlots(isoDateTime));
    },
    plainDateISO(timeZoneArg = getCurrentTimeZoneId()) {
      const isoDateTime = getCurrentIsoDateTime(queryTimeZone(refineTimeZoneArg(timeZoneArg)));
      return createPlainDate(createDateSlots(isoDateTime));
    },
    plainTimeISO(timeZoneArg = getCurrentTimeZoneId()) {
      const isoDateTime = getCurrentIsoDateTime(queryTimeZone(refineTimeZoneArg(timeZoneArg)));
      return createPlainTime(createTimeSlots(isoDateTime));
    }
  })
});

const Temporal$1 = /*@__PURE__*/ Object.defineProperties({}, {
  ...createStringTagDescriptors("Temporal"),
  ...createPropDescriptors({
    PlainYearMonth: PlainYearMonth,
    PlainMonthDay: PlainMonthDay,
    PlainDate: PlainDate,
    PlainTime: PlainTime,
    PlainDateTime: PlainDateTime,
    ZonedDateTime: ZonedDateTime,
    Instant: Instant,
    Duration: Duration,
    Now: Now
  })
});

const DateTimeFormat = /*@__PURE__*/ createDateTimeFormatClass(getTemporalBrandingAndSlots);

function installImplementation() {
  Object.defineProperties(globalThis, createPropDescriptors({
    Temporal: Temporal$1
  })), Object.defineProperties(Intl, createPropDescriptors({
    DateTimeFormat: DateTimeFormat
  })), Object.defineProperties(Date.prototype, createPropDescriptors({
    toTemporalInstant: toTemporalInstant
  }));
}

function install() {
  NativeTemporal || installImplementation();
}

install();

/**
 * java.lang.Math.toRadians
 * @private
 * @param degrees
 */
function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}
/**
 * java.lang.Math.toDegrees
 * @private
 * @param radians
 */
function radiansToDegrees(radians) {
    return (radians * 180) / Math.PI;
}
/**
 * A class that contains location information such as latitude and longitude required for astronomical calculations. The
 * elevation field may not be used by some calculation engines and would be ignored if set.
 *
 * @author &copy; Eliyahu Hershfeld 2004 - 2016
 * @version 1.1
 */
class GeoLocation {
    /**
     * GeoLocation constructor with parameters for all required fields.
     *
     * @param {string} name
     *            The location name for display use such as &quot;Lakewood, NJ&quot;
     * @param {number} latitude
     *            the latitude in a double format such as 40.095965 for Lakewood, NJ.
     *            <b>Note: </b> For latitudes south of the equator, a negative value should be used.
     * @param {number} longitude
     *            double the longitude in a double format such as -74.222130 for Lakewood, NJ.
     *            <b>Note: </b> For longitudes west of the <a href="http://en.wikipedia.org/wiki/Prime_Meridian">Prime
     *            Meridian </a> (Greenwich), a negative value should be used.
     * @param {number} elevation
     *            the elevation above sea level in Meters. Elevation is not used in most algorithms used for calculating
     *            sunrise and set.
     * @param {string} timeZoneId
     *            the <code>TimeZone</code> for the location.
     */
    constructor(name, latitude, longitude, elevation, timeZoneId) {
        this.setLocationName(name);
        this.setLatitude(latitude);
        this.setLongitude(longitude);
        this.setElevation(elevation);
        this.setTimeZone(timeZoneId);
    }
    latitude;
    longitude;
    locationName = null;
    timeZoneId;
    elevation;
    /**
     * Method to get the elevation in Meters.
     *
     * @return {number} Returns the elevation in Meters.
     */
    getElevation() {
        return this.elevation;
    }
    /**
     * Method to set the elevation in Meters <b>above </b> sea level.
     *
     * @param {number} elevation
     *            The elevation to set in Meters. An Error will be thrown if the value is a negative.
     */
    setElevation(elevation) {
        if (typeof elevation !== 'number')
            throw new TypeError('Invalid elevation');
        if (elevation < 0) {
            throw new RangeError(`elevation ${elevation} must be zero or positive`);
        }
        this.elevation = elevation;
    }
    setLatitude(latitude) {
        if (typeof latitude !== 'number')
            throw new TypeError('Invalid latitude');
        if (latitude < -90 || latitude > 90) {
            throw new RangeError(`Latitude ${latitude} out of range [-90,90]`);
        }
        this.latitude = latitude;
    }
    /**
     * @return {number} Returns the latitude.
     */
    getLatitude() {
        return this.latitude;
    }
    setLongitude(longitude) {
        if (typeof longitude !== 'number')
            throw new TypeError('Invalid longitude');
        if (longitude < -180 || longitude > 180) {
            throw new RangeError(`Longitude ${longitude} out of range [-180,180]`);
        }
        this.longitude = longitude;
    }
    /**
     * @return {number} Returns the longitude.
     */
    getLongitude() {
        return this.longitude;
    }
    /**
     * @return {string|null} Returns the location name.
     */
    getLocationName() {
        return this.locationName;
    }
    /**
     * @param {string|null} name
     *            The setter method for the display name.
     */
    setLocationName(name) {
        this.locationName = name;
    }
    /**
     * @return {string} Returns the timeZone.
     */
    getTimeZone() {
        return this.timeZoneId;
    }
    /**
     * Method to set the TimeZone.
     * @param {string} timeZoneId
     *            The timeZone to set.
     */
    setTimeZone(timeZoneId) {
        if (!timeZoneId) {
            throw new RangeError('Invalid timeZoneId');
        }
        this.timeZoneId = timeZoneId;
    }
}
/**
 * The commonly used average solar refraction. Calendrical Calculations lists a more accurate global average of
 * 34.478885263888294
 * @private
 */
const refraction = 34 / 60;
// private double refraction = 34.478885263888294 / 60d;
/**
 * The commonly used average solar radius in minutes of a degree.
 * @private
 */
const solarRadius = 16 / 60;
/**
 * The commonly used average earth radius in KM. At this time, this only affects elevation adjustment and not the
 * sunrise and sunset calculations. The value currently defaults to 6356.9 KM.
 * @private
 */
const earthRadius = 6356.9; // in KM
/**
 * Implementation of sunrise and sunset methods to calculate astronomical times based on the <a
 * href="http://noaa.gov">NOAA</a> algorithm. This calculator uses the Java algorithm based on the implementation by <a
 * href="http://noaa.gov">NOAA - National Oceanic and Atmospheric Administration</a>'s <a href =
 * "http://www.srrb.noaa.gov/highlights/sunrise/sunrise.html">Surface Radiation Research Branch</a>. NOAA's <a
 * href="http://www.srrb.noaa.gov/highlights/sunrise/solareqns.PDF">implementation</a> is based on equations from <a
 * href="http://www.willbell.com/math/mc1.htm">Astronomical Algorithms</a> by <a
 * href="http://en.wikipedia.org/wiki/Jean_Meeus">Jean Meeus</a>. Added to the algorithm is an adjustment of the zenith
 * to account for elevation. The algorithm can be found in the <a
 * href="http://en.wikipedia.org/wiki/Sunrise_equation">Wikipedia Sunrise Equation</a> article.
 *
 * @author &copy; Eliyahu Hershfeld 2011 - 2019
 */
class NOAACalculator {
    /**
     * A constructor that takes in <a href="http://en.wikipedia.org/wiki/Geolocation">geolocation</a> information as a
     * parameter.
     *
     * @param {GeoLocation} geoLocation
     *            The location information used for calculating astronomical sun times.
     * @param {Temporal.PlainDate} date
     */
    constructor(geoLocation, date) {
        this.date = date;
        this.geoLocation = geoLocation;
    }
    /**
     * The zenith of astronomical sunrise and sunset. The sun is 90&deg; from the vertical 0&deg;
     * @private
     */
    static GEOMETRIC_ZENITH = 90;
    /**
     * Default value for Sun's zenith and true rise/set Zenith (used in this class and subclasses) is the angle that the
     * center of the Sun makes to a line perpendicular to the Earth's surface. If the Sun were a point and the Earth
     * were without an atmosphere, true sunset and sunrise would correspond to a 90&deg; zenith. Because the Sun is not
     * a point, and because the atmosphere refracts light, this 90&deg; zenith does not, in fact, correspond to true
     * sunset or sunrise, instead the center of the Sun's disk must lie just below the horizon for the upper edge to be
     * obscured. This means that a zenith of just above 90&deg; must be used. The Sun subtends an angle of 16 minutes of
     * arc, and atmospheric refraction accounts for
     * 34 minutes or so, giving a total of 50
     * arcminutes. The total value for ZENITH is 90+(5/6) or 90.8333333&deg; for true sunrise/sunset.
     */
    // const ZENITH: number = GEOMETRIC_ZENITH + 5.0 / 6.0;
    /** Sun's zenith at civil twilight (96&deg;). */
    static CIVIL_ZENITH = 96;
    /** Sun's zenith at nautical twilight (102&deg;). */
    static NAUTICAL_ZENITH = 102;
    /** Sun's zenith at astronomical twilight (108&deg;). */
    static ASTRONOMICAL_ZENITH = 108;
    /**
     * The Java Calendar encapsulated by this class to track the current date used by the class
     * @private
     */
    date;
    /**
     * the {@link GeoLocation} used for calculations.
     * @private
     */
    geoLocation;
    /**
     * The getSunrise method Returns a `Date` representing the
     * {@link getElevationAdjustment elevation adjusted} sunrise time. The zenith used
     * for the calculation uses {@link GEOMETRIC_ZENITH geometric zenith} of 90&deg; plus
     * {@link getElevationAdjustment}. This is adjusted
     * to add approximately 50/60 of a degree to account for 34 archminutes of refraction
     * and 16 archminutes for the sun's radius for a total of {@link adjustZenith 90.83333&deg;}.
     *
     * @return {Temporal.ZonedDateTime | null} the `Date` representing the exact sunrise time. If the calculation can't be computed such as
     *         in the Arctic Circle where there is at least one day a year where the sun does not rise, and one where it
     *         does not set, a null will be returned. See detailed explanation on top of the page.
     * @see adjustZenith
     * @see getSeaLevelSunrise()
     * @see getUTCSunrise
     */
    getSunrise() {
        const sunrise = this.getUTCSunrise0(NOAACalculator.GEOMETRIC_ZENITH);
        if (isNaN(sunrise))
            return null;
        return this.getDateFromTime(sunrise, true);
    }
    /**
     * A method that returns the sunrise without {@link getElevationAdjustment elevation
     * adjustment}. Non-sunrise and sunset calculations such as dawn and dusk, depend on the amount of visible light,
     * something that is not affected by elevation. This method returns sunrise calculated at sea level. This forms the
     * base for dawn calculations that are calculated as a dip below the horizon before sunrise.
     *
     * @return {Temporal.ZonedDateTime | null} the `Date` representing the exact sea-level sunrise time. If the calculation can't be computed
     *         such as in the Arctic Circle where there is at least one day a year where the sun does not rise, and one
     *         where it does not set, a null will be returned. See detailed explanation on top of the page.
     * @see getSunrise
     * @see getUTCSeaLevelSunrise
     * @see getSeaLevelSunset()
     */
    getSeaLevelSunrise() {
        const sunrise = this.getUTCSeaLevelSunrise(NOAACalculator.GEOMETRIC_ZENITH);
        if (isNaN(sunrise))
            return null;
        return this.getDateFromTime(sunrise, true);
    }
    /**
     * A method that returns the beginning of civil twilight (dawn) using a zenith of {@link CIVIL_ZENITH 96&deg;}.
     *
     * @return {Temporal.ZonedDateTime | null} The `Date` of the beginning of civil twilight using a zenith of 96&deg;. If the calculation
     *         can't be computed, null will be returned. See detailed explanation on top of the page.
     * @see CIVIL_ZENITH
     */
    getBeginCivilTwilight() {
        return this.getSunriseOffsetByDegrees(NOAACalculator.CIVIL_ZENITH);
    }
    /**
     * A method that returns the beginning of nautical twilight using a zenith of {@link NAUTICAL_ZENITH 102&deg;}.
     *
     * @return {Temporal.ZonedDateTime | null} The `Date` of the beginning of nautical twilight using a zenith of 102&deg;. If the
     *         calculation can't be computed null will be returned. See detailed explanation on top of the page.
     * @see NAUTICAL_ZENITH
     */
    getBeginNauticalTwilight() {
        return this.getSunriseOffsetByDegrees(NOAACalculator.NAUTICAL_ZENITH);
    }
    /**
     * A method that returns the beginning of astronomical twilight using a zenith of {@link ASTRONOMICAL_ZENITH
     * 108&deg;}.
     *
     * @return {Temporal.ZonedDateTime | null} The `Date` of the beginning of astronomical twilight using a zenith of 108&deg;. If the
     *         calculation can't be computed, null will be returned. See detailed explanation on top of the page.
     * @see ASTRONOMICAL_ZENITH
     */
    getBeginAstronomicalTwilight() {
        return this.getSunriseOffsetByDegrees(NOAACalculator.ASTRONOMICAL_ZENITH);
    }
    /**
     * The getSunset method Returns a `Date` representing the
     * {@link getElevationAdjustment elevation adjusted} sunset time. The zenith used for
     * the calculation uses {@link GEOMETRIC_ZENITH geometric zenith} of 90&deg; plus
     * {@link getElevationAdjustment}. This is adjusted
     * to add approximately 50/60 of a degree to account for 34 archminutes of refraction
     * and 16 archminutes for the sun's radius for a total of {@link adjustZenith 90.83333&deg;}.
     * Note:
     * In certain cases the calculates sunset will occur before sunrise. This will typically happen when a timezone
     * other than the local timezone is used (calculating Los Angeles sunset using a GMT timezone for example). In this
     * case the sunset date will be incremented to the following date.
     *
     * @return {Temporal.ZonedDateTime | null} The `Date` representing the exact sunset time. If the calculation can't be computed such as in
     *         the Arctic Circle where there is at least one day a year where the sun does not rise, and one where it
     *         does not set, a null will be returned. See detailed explanation on top of the page.
     * @see adjustZenith
     * @see getSeaLevelSunset()
     * @see getUTCSunset
     */
    getSunset() {
        const sunset = this.getUTCSunset0(NOAACalculator.GEOMETRIC_ZENITH);
        if (isNaN(sunset))
            return null;
        return this.getDateFromTime(sunset, false);
    }
    /**
     * A method that returns the sunset without {@link getElevationAdjustment elevation
     * adjustment}. Non-sunrise and sunset calculations such as dawn and dusk, depend on the amount of visible light,
     * something that is not affected by elevation. This method returns sunset calculated at sea level. This forms the
     * base for dusk calculations that are calculated as a dip below the horizon after sunset.
     *
     * @return {Temporal.ZonedDateTime | null} The `Date` representing the exact sea-level sunset time. If the calculation can't be computed
     *         such as in the Arctic Circle where there is at least one day a year where the sun does not rise, and one
     *         where it does not set, a null will be returned. See detailed explanation on top of the page.
     * @see getSunset
     * @see getUTCSeaLevelSunset
     */
    getSeaLevelSunset() {
        const sunset = this.getUTCSeaLevelSunset(NOAACalculator.GEOMETRIC_ZENITH);
        if (isNaN(sunset))
            return null;
        return this.getDateFromTime(sunset, false);
    }
    /**
     * A method that returns the end of civil twilight using a zenith of {@link CIVIL_ZENITH 96&deg;}.
     *
     * @return {Temporal.ZonedDateTime | null} The `Date` of the end of civil twilight using a zenith of {@link CIVIL_ZENITH 96&deg;}. If
     *         the calculation can't be computed, null will be returned. See detailed explanation on top of the page.
     * @see CIVIL_ZENITH
     */
    getEndCivilTwilight() {
        return this.getSunsetOffsetByDegrees(NOAACalculator.CIVIL_ZENITH);
    }
    /**
     * A method that returns the end of nautical twilight using a zenith of {@link NAUTICAL_ZENITH 102&deg;}.
     *
     * @return {Temporal.ZonedDateTime | null} The `Date` of the end of nautical twilight using a zenith of {@link NAUTICAL_ZENITH 102&deg;}
     *         . If the calculation can't be computed, null will be returned. See detailed explanation on top of the
     *         page.
     * @see NAUTICAL_ZENITH
     */
    getEndNauticalTwilight() {
        return this.getSunsetOffsetByDegrees(NOAACalculator.NAUTICAL_ZENITH);
    }
    /**
     * A method that returns the end of astronomical twilight using a zenith of {@link ASTRONOMICAL_ZENITH 108&deg;}.
     *
     * @return {Temporal.ZonedDateTime | null} The `Date` of the end of astronomical twilight using a zenith of {@link ASTRONOMICAL_ZENITH
     *         108&deg;}. If the calculation can't be computed, null will be returned. See detailed explanation on top
     *         of the page.
     * @see ASTRONOMICAL_ZENITH
     */
    getEndAstronomicalTwilight() {
        return this.getSunsetOffsetByDegrees(NOAACalculator.ASTRONOMICAL_ZENITH);
    }
    /**
     * A utility method that returns a date offset by the offset time passed in. Please note that the level of light
     * during twilight is not affected by elevation, so if this is being used to calculate an offset before sunrise or
     * after sunset with the intent of getting a rough "level of light" calculation, the sunrise or sunset time passed
     * to this method should be sea level sunrise and sunset.
     *
     * @param {Temporal.ZonedDateTime | null} time
     *            the start time
     * @param {number} offset
     *            the offset in milliseconds to add to the time.
     * @return {Temporal.ZonedDateTime | null} the `Date` with the offset in milliseconds added to it
     */
    static getTimeOffset(time, offset) {
        if (time === null || isNaN(offset)) {
            return null;
        }
        return time.add({ milliseconds: offset });
    }
    /**
     * A utility method that returns the time of an offset by degrees below or above the horizon of
     * {@link getSunrise() sunrise}. Note that the degree offset is from the vertical, so for a calculation of 14&deg;
     * before sunrise, an offset of 14 + {@link GEOMETRIC_ZENITH} = 104 would have to be passed as a parameter.
     *
     * @param {number} offsetZenith
     *            the degrees before {@link getSunrise} to use in the calculation. For time after sunrise use
     *            negative numbers. Note that the degree offset is from the vertical, so for a calculation of 14&deg;
     *            before sunrise, an offset of 14 + {@link GEOMETRIC_ZENITH} = 104 would have to be passed as a
     *            parameter.
     * @return {Temporal.ZonedDateTime | null} The `Date` of the offset after (or before) {@link getSunrise}. If the calculation
     *         can't be computed such as in the Arctic Circle where there is at least one day a year where the sun does
     *         not rise, and one where it does not set, a null will be returned. See detailed explanation on top of the
     *         page.
     */
    getSunriseOffsetByDegrees(offsetZenith) {
        const dawn = this.getUTCSunrise0(offsetZenith);
        if (isNaN(dawn))
            return null;
        return this.getDateFromTime(dawn, true);
    }
    /**
     * A utility method that returns the time of an offset by degrees below or above the horizon of {@link getSunset()
     * sunset}. Note that the degree offset is from the vertical, so for a calculation of 14&deg; after sunset, an
     * offset of 14 + {@link GEOMETRIC_ZENITH} = 104 would have to be passed as a parameter.
     *
     * @param {number} offsetZenith
     *            the degrees after {@link getSunset} to use in the calculation. For time before sunset use negative
     *            numbers. Note that the degree offset is from the vertical, so for a calculation of 14&deg; after
     *            sunset, an offset of 14 + {@link GEOMETRIC_ZENITH} = 104 would have to be passed as a parameter.
     * @return {Temporal.ZonedDateTime | null} The `Date`of the offset after (or before) {@link getSunset}. If the calculation can't
     *         be computed such as in the Arctic Circle where there is at least one day a year where the sun does not
     *         rise, and one where it does not set, a null will be returned. See detailed explanation on top of the
     *         page.
     */
    getSunsetOffsetByDegrees(offsetZenith) {
        const sunset = this.getUTCSunset0(offsetZenith);
        if (isNaN(sunset))
            return null;
        return this.getDateFromTime(sunset, false);
    }
    /**
     * A method that returns the sunrise in UTC time without correction for time zone offset from GMT and without using
     * daylight savings time.
     *
     * @param {number} zenith
     *            the degrees below the horizon. For time after sunrise use negative numbers.
     * @return {number} The time in the format: 18.75 for 18:45:00 UTC/GMT. If the calculation can't be computed such as in the
     *         Arctic Circle where there is at least one day a year where the sun does not rise, and one where it does
     *         not set, `NaN` will be returned. See detailed explanation on top of the page.
     */
    getUTCSunrise0(zenith) {
        return this.getUTCSunrise(this.getAdjustedDate(), this.geoLocation, zenith, true);
    }
    /**
     * A method that returns the sunrise in UTC time without correction for time zone offset from GMT and without using
     * daylight savings time. Non-sunrise and sunset calculations such as dawn and dusk, depend on the amount of visible
     * light, something that is not affected by elevation. This method returns UTC sunrise calculated at sea level. This
     * forms the base for dawn calculations that are calculated as a dip below the horizon before sunrise.
     *
     * @param {number} zenith
     *            the degrees below the horizon. For time after sunrise use negative numbers.
     * @return {number} The time in the format: 18.75 for 18:45:00 UTC/GMT. If the calculation can't be computed such as in the
     *         Arctic Circle where there is at least one day a year where the sun does not rise, and one where it does
     *         not set, `NaN` will be returned. See detailed explanation on top of the page.
     * @see getUTCSunrise
     * @see getUTCSeaLevelSunset
     */
    getUTCSeaLevelSunrise(zenith) {
        return this.getUTCSunrise(this.getAdjustedDate(), this.geoLocation, zenith, false);
    }
    /**
     * A method that returns the sunset in UTC time without correction for time zone offset from GMT and without using
     * daylight savings time.
     *
     * @param {number} zenith
     *            the degrees below the horizon. For time after sunset use negative numbers.
     * @return {number} The time in the format: 18.75 for 18:45:00 UTC/GMT. If the calculation can't be computed such as in the
     *         Arctic Circle where there is at least one day a year where the sun does not rise, and one where it does
     *         not set, `NaN` will be returned. See detailed explanation on top of the page.
     * @see getUTCSeaLevelSunset
     */
    getUTCSunset0(zenith) {
        return this.getUTCSunset(this.getAdjustedDate(), this.geoLocation, zenith, true);
    }
    /**
     * A method that returns the sunset in UTC time without correction for elevation, time zone offset from GMT and
     * without using daylight savings time. Non-sunrise and sunset calculations such as dawn and dusk, depend on the
     * amount of visible light, something that is not affected by elevation. This method returns UTC sunset calculated
     * at sea level. This forms the base for dusk calculations that are calculated as a dip below the horizon after
     * sunset.
     *
     * @param {number} zenith
     *            the degrees below the horizon. For time before sunset use negative numbers.
     * @return {number} The time in the format: 18.75 for 18:45:00 UTC/GMT. If the calculation can't be computed such as in the
     *         Arctic Circle where there is at least one day a year where the sun does not rise, and one where it does
     *         not set, `NaN` will be returned. See detailed explanation on top of the page.
     * @see getUTCSunset
     * @see getUTCSeaLevelSunrise
     */
    getUTCSeaLevelSunset(zenith) {
        return this.getUTCSunset(this.getAdjustedDate(), this.geoLocation, zenith, false);
    }
    /**
     * Adjusts the <code>Calendar</code> to deal with edge cases where the location crosses the antimeridian.
     * @private
     * @see GeoLocation#getAntimeridianAdjustment()
     * @return the adjusted Calendar
     */
    getAdjustedDate() {
        return this.date;
    }
    /**
     * Method to return the adjustment to the zenith required to account for the elevation. Since a person at a higher
     * elevation can see farther below the horizon, the calculation for sunrise / sunset is calculated below the horizon
     * used at sea level. This is only used for sunrise and sunset and not times before or after it such as
     * {@link getBeginNauticalTwilight() nautical twilight} since those
     * calculations are based on the level of available light at the given dip below the horizon, something that is not
     * affected by elevation, the adjustment should only made if the zenith == 90&deg; {@link adjustZenith adjusted}
     * for refraction and solar radius. The algorithm used is
     *
     * <pre>
     * elevationAdjustment = Math.toDegrees(Math.acos(earthRadiusInMeters / (earthRadiusInMeters + elevationMeters)));
     * </pre>
     *
     * The source of this algorithm is <a href="http://www.calendarists.com">Calendrical Calculations</a> by Edward M.
     * Reingold and Nachum Dershowitz. An alternate algorithm that produces an almost identical (but not accurate)
     * result found in Ma'aglay Tzedek by Moishe Kosower and other sources is:
     *
     * <pre>
     * elevationAdjustment = 0.0347 * Math.sqrt(elevationMeters);
     * </pre>
     *
     * @param {number} elevation
     *            elevation in Meters.
     * @return {number} the adjusted zenith
     */
    getElevationAdjustment(elevation) {
        // double elevationAdjustment = 0.0347 * Math.sqrt(elevation);
        const elevationAdjustment = radiansToDegrees(Math.acos(earthRadius / (earthRadius + elevation / 1000)));
        return elevationAdjustment;
    }
    /**
     * Adjusts the zenith of astronomical sunrise and sunset to account for solar refraction, solar radius and
     * elevation. The value for Sun's zenith and true rise/set Zenith (used in this class and subclasses) is the angle
     * that the center of the Sun makes to a line perpendicular to the Earth's surface. If the Sun were a point and the
     * Earth were without an atmosphere, true sunset and sunrise would correspond to a 90&deg; zenith. Because the Sun
     * is not a point, and because the atmosphere refracts light, this 90&deg; zenith does not, in fact, correspond to
     * true sunset or sunrise, instead the centre of the Sun's disk must lie just below the horizon for the upper edge
     * to be obscured. This means that a zenith of just above 90&deg; must be used. The Sun subtends an angle of 16
     * minutes of arc, and atmospheric refraction
     * accounts for 34 minutes or so, giving a total
     * of 50 arcminutes. The total value for ZENITH is 90+(5/6) or 90.8333333&deg; for true sunrise/sunset. Since a
     * person at an elevation can see blow the horizon of a person at sea level, this will also adjust the zenith to
     * account for elevation if available. Note that this will only adjust the value if the zenith is exactly 90 degrees.
     * For values below and above this no correction is done. As an example, astronomical twilight is when the sun is
     * 18&deg; below the horizon or {@link ASTRONOMICAL_ZENITH 108&deg;
     * below the zenith}. This is traditionally calculated with none of the above mentioned adjustments. The same goes
     * for various <em>tzais</em> and <em>alos</em> times such as the
     * {@link ZmanimCalendar#ZENITH_16_POINT_1 16.1&deg;} dip used in
     * {@link ComplexZmanimCalendar#getAlos16Point1Degrees}.
     *
     * @param {number} zenith
     *            the azimuth below the vertical zenith of 90&deg;. For sunset typically the {@link adjustZenith
     *            zenith} used for the calculation uses geometric zenith of 90&deg; and {@link adjustZenith adjusts}
     *            this slightly to account for solar refraction and the sun's radius. Another example would be
     *            {@link getEndNauticalTwilight} that passes
     *            {@link NAUTICAL_ZENITH} to this method.
     * @param {number} elevation
     *            elevation in Meters.
     * @return {number} The zenith adjusted to include the sun's radius, refracton
     *         and {@link getElevationAdjustment elevation} adjustment. This will only be adjusted for
     *         sunrise and sunset (if the zenith == 90&deg;)
     * @see getElevationAdjustment
     */
    adjustZenith(zenith, elevation) {
        let adjustedZenith = zenith;
        if (zenith === NOAACalculator.GEOMETRIC_ZENITH) {
            // only adjust if it is exactly sunrise or sunset
            adjustedZenith =
                zenith +
                    (solarRadius + refraction + this.getElevationAdjustment(elevation));
        }
        return adjustedZenith;
    }
    /**
     * The <a href="http://en.wikipedia.org/wiki/Julian_day">Julian day</a> of January 1, 2000
     * @private
     */
    static JULIAN_DAY_JAN_1_2000 = 2451545;
    /**
     * Julian days per century
     * @private
     */
    static JULIAN_DAYS_PER_CENTURY = 36525;
    /**
     * A method that calculates UTC sunrise as well as any time based on an angle above or below sunrise.
     * @param date
     *            Used to calculate day of year.
     * @param geoLocation
     *            The location information used for astronomical calculating sun times.
     * @param zenith
     *            the azimuth below the vertical zenith of 90 degrees. for sunrise typically the {@link adjustZenith
     *            zenith} used for the calculation uses geometric zenith of 90&deg; and {@link adjustZenith adjusts}
     *            this slightly to account for solar refraction and the sun's radius. Another example would be
     *            {@link getBeginNauticalTwilight} that passes
     *            {@link NAUTICAL_ZENITH} to this method.
     * @param adjustForElevation
     *            Should the time be adjusted for elevation
     * @return The UTC time of sunrise in 24 hour format. 5:45:00 AM will return 5.75.0. If an error was encountered in
     *         the calculation (expected behavior for some locations such as near the poles,
     *         `NaN` will be returned.
     */
    getUTCSunrise(date, geoLocation, zenith, adjustForElevation) {
        const elevation = adjustForElevation
            ? geoLocation.getElevation()
            : 0;
        const adjustedZenith = this.adjustZenith(zenith, elevation);
        let sunrise = NOAACalculator.getSunriseUTC(NOAACalculator.getJulianDay(date), geoLocation.getLatitude(), -geoLocation.getLongitude(), adjustedZenith);
        sunrise = sunrise / 60;
        // ensure that the time is >= 0 and < 24
        while (sunrise < 0) {
            sunrise += 24;
        }
        while (sunrise >= 24) {
            sunrise -= 24;
        }
        return sunrise;
    }
    /**
     * A method that calculates UTC sunset as well as any time based on an angle above or below sunset.
     * @param date
     *            Used to calculate day of year.
     * @param geoLocation
     *            The location information used for astronomical calculating sun times.
     * @param zenith
     *            the azimuth below the vertical zenith of 90&deg;. For sunset typically the {@link adjustZenith
     *            zenith} used for the calculation uses geometric zenith of 90&deg; and {@link adjustZenith adjusts}
     *            this slightly to account for solar refraction and the sun's radius. Another example would be
     *            {@link getEndNauticalTwilight} that passes
     *            {@link NAUTICAL_ZENITH} to this method.
     * @param adjustForElevation
     *            Should the time be adjusted for elevation
     * @return The UTC time of sunset in 24 hour format. 5:45:00 AM will return 5.75.0. If an error was encountered in
     *         the calculation (expected behavior for some locations such as near the poles,
     *         `NaN` will be returned.
     */
    getUTCSunset(date, geoLocation, zenith, adjustForElevation) {
        const elevation = adjustForElevation
            ? geoLocation.getElevation()
            : 0;
        const adjustedZenith = this.adjustZenith(zenith, elevation);
        let sunset = NOAACalculator.getSunsetUTC(NOAACalculator.getJulianDay(date), geoLocation.getLatitude(), -geoLocation.getLongitude(), adjustedZenith);
        sunset = sunset / 60;
        // ensure that the time is >= 0 and < 24
        while (sunset < 0) {
            sunset += 24;
        }
        while (sunset >= 24) {
            sunset -= 24;
        }
        return sunset;
    }
    /**
     * A utility method that will allow the calculation of a temporal (solar) hour based on the sunrise and sunset
     * passed as parameters to this method. An example of the use of this method would be the calculation of a
     * non-elevation adjusted temporal hour by passing in {@link getSeaLevelSunrise() sea level sunrise} and
     * {@link getSeaLevelSunset() sea level sunset} as parameters.
     *
     * @param {Temporal.ZonedDateTime | null} startOfDay
     *            The start of the day.
     * @param {Temporal.ZonedDateTime | null} endOfDay
     *            The end of the day.
     *
     * @return {number} the <code>long</code> millisecond length of the temporal hour. If the calculation can't be computed a
     *         `NaN` will be returned. See detailed explanation on top of the page.
     *
     * @see getTemporalHour()
     */
    getTemporalHour(startOfDay = this.getSeaLevelSunrise(), endOfDay = this.getSeaLevelSunset()) {
        if (startOfDay === null || endOfDay === null) {
            return NaN;
        }
        const delta = endOfDay.epochMilliseconds - startOfDay.epochMilliseconds;
        return Math.floor(delta / 12);
    }
    /**
     * A method that returns sundial or solar noon. It occurs when the Sun is <a href
     * ="http://en.wikipedia.org/wiki/Transit_%28astronomy%29">transiting</a> the <a
     * href="http://en.wikipedia.org/wiki/Meridian_%28astronomy%29">celestial meridian</a>. In this class it is
     * calculated as halfway between the sunrise and sunset passed to this method. This time can be slightly off the
     * real transit time due to changes in declination (the lengthening or shortening day).
     *
     * @param {Temporal.ZonedDateTime | null} startOfDay
     *            the start of day for calculating the sun's transit. This can be sea level sunrise, visual sunrise (or
     *            any arbitrary start of day) passed to this method.
     * @param {Temporal.ZonedDateTime | null} endOfDay
     *            the end of day for calculating the sun's transit. This can be sea level sunset, visual sunset (or any
     *            arbitrary end of day) passed to this method.
     *
     * @return {Temporal.ZonedDateTime | null} The `Date` representing Sun's transit. If the calculation can't be computed such as in the
     *         Arctic Circle where there is at least one day a year where the sun does not rise, and one where it does
     *         not set, null will be returned. See detailed explanation on top of the page.
     */
    getSunTransit(startOfDay = this.getSeaLevelSunrise(), endOfDay = this.getSeaLevelSunset()) {
        const temporalHour = this.getTemporalHour(startOfDay, endOfDay);
        return NOAACalculator.getTimeOffset(startOfDay, temporalHour * 6);
    }
    /**
     * A method that returns a `Date` from the time passed in as a parameter.
     * @protected
     * @param {number} time
     *            The time to be set as the time for the `Date`. The time expected is in the format: 18.75
     *            for 6:45:00 PM.
     * @param {boolean} isSunrise true if the time is sunrise, and false if it is sunset
     * @return {Temporal.ZonedDateTime | null} The Date.
     */
    getDateFromTime(time, isSunrise) {
        const epochMillis = this.getEpochMillisFromTime(time, isSunrise);
        if (isNaN(epochMillis)) {
            return null;
        }
        return Temporal.Instant.fromEpochMilliseconds(epochMillis).toZonedDateTimeISO(this.geoLocation.getTimeZone());
    }
    /**
     * The instant that {@link getDateFromTime} describes, as milliseconds since
     * the epoch, without building a `Temporal.ZonedDateTime`.
     *
     * Constructing a `ZonedDateTime` costs roughly 750ns because the IANA zone
     * has to be resolved, and that dominates this calculation. Callers that only
     * want an instant — a `Date`, or the difference between two times — can skip
     * it. Deriving the instant arithmetically also avoids a `PlainTime`
     * allocation and turns the day rollover into a subtraction rather than a
     * ~610ns `PlainDate.add({days})`.
     *
     * @param {number} time
     *            The time in the format 18.75 for 6:45:00 PM, as returned by
     *            {@link getUTCSunrise} / {@link getUTCSunset}, i.e. already
     *            normalized to `[0, 24)`.
     * @param {boolean} isSunrise true if the time is sunrise, and false if it is sunset
     * @return {number} milliseconds since the epoch, or `NaN` if `time` is `NaN`
     */
    getEpochMillisFromTime(time, isSunrise) {
        if (isNaN(time)) {
            return NaN;
        }
        let calculatedTime = time;
        const cal = this.getAdjustedDate();
        const hours = Math.trunc(calculatedTime); // retain only the hours
        calculatedTime -= hours;
        const minutes = Math.trunc((calculatedTime *= 60)); // retain only the minutes
        calculatedTime -= minutes;
        const seconds = Math.trunc((calculatedTime *= 60)); // retain only the seconds
        calculatedTime -= seconds; // remaining milliseconds
        // Check if a date transition has occurred, or is about to occur - this indicates the date of the event is
        // actually not the target date, but the day prior or after
        const localTimeHours = Math.trunc(this.geoLocation.getLongitude() / 15);
        let dayOffset = 0;
        if (isSunrise && localTimeHours + hours > 18) {
            dayOffset = -1;
        }
        else if (!isSunrise && localTimeHours + hours < 6) {
            dayOffset = 1;
        }
        const year = cal.year;
        let millis = Date.UTC(year, cal.month - 1, cal.day, hours, minutes, seconds, Math.trunc(calculatedTime * 1000));
        if (year >= 0 && year < 100) {
            // Date.UTC() maps years 0-99 onto 1900-1999; setUTCFullYear() does not.
            // Worth the branch (about 3ns): @hebcal/core computes candle-lighting
            // times for early historical years rather than suppressing them.
            const d = new Date(millis);
            d.setUTCFullYear(year);
            millis = d.getTime();
        }
        return millis + dayOffset * 86400000;
    }
    /**
     * Return the <a href="http://en.wikipedia.org/wiki/Julian_day">Julian day</a> from a Java Calendar
     * @private
     * @param {Temporal.ZonedDateTime} date
     *            The Java Calendar
     * @return the Julian day corresponding to the date Note: Number is returned for start of day. Fractional days
     *         should be added later.
     */
    static getJulianDay(date) {
        let { year, month } = date;
        const { day } = date;
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        const a = Math.trunc(year / 100);
        const b = Math.trunc(2 - a + a / 4);
        return (Math.floor(365.25 * (year + 4716)) +
            Math.floor(30.6001 * (month + 1)) +
            day +
            b -
            1524.5);
    }
    /**
     * Convert <a href="http://en.wikipedia.org/wiki/Julian_day">Julian day</a> to centuries since J2000.0.
     * @private
     * @param julianDay
     *            the Julian Day to convert
     * @return the centuries since 2000 Julian corresponding to the Julian Day
     */
    static getJulianCenturiesFromJulianDay(julianDay) {
        return ((julianDay - NOAACalculator.JULIAN_DAY_JAN_1_2000) /
            NOAACalculator.JULIAN_DAYS_PER_CENTURY);
    }
    /**
     * Convert centuries since J2000.0 to <a href="http://en.wikipedia.org/wiki/Julian_day">Julian day</a>.
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @return the Julian Day corresponding to the Julian centuries passed in
     */
    static getJulianDayFromJulianCenturies(julianCenturies) {
        return (julianCenturies * NOAACalculator.JULIAN_DAYS_PER_CENTURY +
            NOAACalculator.JULIAN_DAY_JAN_1_2000);
    }
    /**
     * Returns the Geometric <a href="http://en.wikipedia.org/wiki/Mean_longitude">Mean Longitude</a> of the Sun.
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @return the Geometric Mean Longitude of the Sun in degrees
     */
    static getSunGeometricMeanLongitude(julianCenturies) {
        let longitude = 280.46646 + julianCenturies * (36000.76983 + 0.0003032 * julianCenturies);
        while (longitude > 360) {
            longitude -= 360;
        }
        while (longitude < 0) {
            longitude += 360;
        }
        return longitude; // in degrees
    }
    /**
     * Returns the Geometric <a href="http://en.wikipedia.org/wiki/Mean_anomaly">Mean Anomaly</a> of the Sun.
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @return the Geometric Mean Anomaly of the Sun in degrees
     */
    static getSunGeometricMeanAnomaly(julianCenturies) {
        return (357.52911 + julianCenturies * (35999.05029 - 0.0001537 * julianCenturies)); // in degrees
    }
    /**
     * Return the <a href="http://en.wikipedia.org/wiki/Eccentricity_%28orbit%29">eccentricity of earth's orbit</a>.
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @return the unitless eccentricity
     */
    static getEarthOrbitEccentricity(julianCenturies) {
        return (0.016708634 -
            julianCenturies * (0.000042037 + 0.0000001267 * julianCenturies)); // unitless
    }
    /**
     * Returns the <a href="http://en.wikipedia.org/wiki/Equation_of_the_center">equation of center</a> for the sun.
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @return the equation of center for the sun in degrees
     */
    static getSunEquationOfCenter(julianCenturies) {
        const m = NOAACalculator.getSunGeometricMeanAnomaly(julianCenturies);
        const mrad = degreesToRadians(m);
        const sinm = Math.sin(mrad);
        const sin2m = Math.sin(mrad + mrad);
        const sin3m = Math.sin(mrad + mrad + mrad);
        return (sinm *
            (1.914602 - julianCenturies * (0.004817 + 0.000014 * julianCenturies)) +
            sin2m * (0.019993 - 0.000101 * julianCenturies) +
            sin3m * 0.000289); // in degrees
    }
    /**
     * Return the true longitude of the sun
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @return the sun's true longitude in degrees
     */
    static getSunTrueLongitude(julianCenturies) {
        const sunLongitude = NOAACalculator.getSunGeometricMeanLongitude(julianCenturies);
        const center = NOAACalculator.getSunEquationOfCenter(julianCenturies);
        return sunLongitude + center; // in degrees
    }
    /**
     * Return the apparent longitude of the sun
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @return sun's apparent longitude in degrees
     */
    static getSunApparentLongitude(julianCenturies) {
        const sunTrueLongitude = NOAACalculator.getSunTrueLongitude(julianCenturies);
        const omega = 125.04 - 1934.136 * julianCenturies;
        const lambda = sunTrueLongitude - 0.00569 - 0.00478 * Math.sin(degreesToRadians(omega));
        return lambda; // in degrees
    }
    /**
     * Returns the mean <a href="http://en.wikipedia.org/wiki/Axial_tilt">obliquity of the ecliptic</a> (Axial tilt).
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @return the mean obliquity in degrees
     */
    static getMeanObliquityOfEcliptic(julianCenturies) {
        const seconds = 21.448 -
            julianCenturies *
                (46.815 + julianCenturies * (0.00059 - julianCenturies * 0.001813));
        return 23 + (26 + seconds / 60) / 60; // in degrees
    }
    /**
     * Returns the corrected <a href="http://en.wikipedia.org/wiki/Axial_tilt">obliquity of the ecliptic</a> (Axial
     * tilt).
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @return the corrected obliquity in degrees
     */
    static getObliquityCorrection(julianCenturies) {
        const obliquityOfEcliptic = NOAACalculator.getMeanObliquityOfEcliptic(julianCenturies);
        const omega = 125.04 - 1934.136 * julianCenturies;
        return obliquityOfEcliptic + 0.00256 * Math.cos(degreesToRadians(omega)); // in degrees
    }
    /**
     * Return the <a href="http://en.wikipedia.org/wiki/Declination">declination</a> of the sun.
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @return
     *            the sun's declination in degrees
     */
    static getSunDeclination(julianCenturies) {
        const obliquityCorrection = NOAACalculator.getObliquityCorrection(julianCenturies);
        const lambda = NOAACalculator.getSunApparentLongitude(julianCenturies);
        const sint = Math.sin(degreesToRadians(obliquityCorrection)) *
            Math.sin(degreesToRadians(lambda));
        const theta = radiansToDegrees(Math.asin(sint));
        return theta; // in degrees
    }
    /**
     * Return the <a href="http://en.wikipedia.org/wiki/Equation_of_time">Equation of Time</a> - the difference between
     * true solar time and mean solar time
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @return equation of time in minutes of time
     */
    static getEquationOfTime(julianCenturies) {
        const epsilon = NOAACalculator.getObliquityCorrection(julianCenturies);
        const geomMeanLongSun = NOAACalculator.getSunGeometricMeanLongitude(julianCenturies);
        const eccentricityEarthOrbit = NOAACalculator.getEarthOrbitEccentricity(julianCenturies);
        const geomMeanAnomalySun = NOAACalculator.getSunGeometricMeanAnomaly(julianCenturies);
        let y = Math.tan(degreesToRadians(epsilon) / 2);
        y *= y;
        const sin2l0 = Math.sin(2 * degreesToRadians(geomMeanLongSun));
        const sinm = Math.sin(degreesToRadians(geomMeanAnomalySun));
        const cos2l0 = Math.cos(2 * degreesToRadians(geomMeanLongSun));
        const sin4l0 = Math.sin(4 * degreesToRadians(geomMeanLongSun));
        const sin2m = Math.sin(2 * degreesToRadians(geomMeanAnomalySun));
        const equationOfTime = y * sin2l0 -
            2 * eccentricityEarthOrbit * sinm +
            4 * eccentricityEarthOrbit * y * sinm * cos2l0 -
            0.5 * y * y * sin4l0 -
            1.25 * eccentricityEarthOrbit * eccentricityEarthOrbit * sin2m;
        return radiansToDegrees(equationOfTime) * 4; // in minutes of time
    }
    /**
     * Return the <a href="http://en.wikipedia.org/wiki/Hour_angle">hour angle</a> of the sun at sunrise for the
     * latitude.
     * @private
     * @param {number} lat
     *            , the latitude of observer in degrees
     * @param solarDec
     *            the declination angle of sun in degrees
     * @param {number} zenith
     *            the zenith
     * @return hour angle of sunrise in radians
     */
    static getSunHourAngleAtSunrise(lat, solarDec, zenith) {
        const latRad = degreesToRadians(lat);
        const sdRad = degreesToRadians(solarDec);
        return Math.acos(Math.cos(degreesToRadians(zenith)) /
            (Math.cos(latRad) * Math.cos(sdRad)) -
            Math.tan(latRad) * Math.tan(sdRad)); // in radians
    }
    /**
     * Returns the <a href="http://en.wikipedia.org/wiki/Hour_angle">hour angle</a> of the sun at sunset for the
     * latitude.
     * @private
     * @param {number} lat
     *            the latitude of observer in degrees
     * @param solarDec
     *            the declination angle of sun in degrees
     * @param {number} zenith
     *            the zenith
     * @return the hour angle of sunset in radians
     */
    static getSunHourAngleAtSunset(lat, solarDec, zenith) {
        const latRad = degreesToRadians(lat);
        const sdRad = degreesToRadians(solarDec);
        const hourAngle = Math.acos(Math.cos(degreesToRadians(zenith)) /
            (Math.cos(latRad) * Math.cos(sdRad)) -
            Math.tan(latRad) * Math.tan(sdRad));
        return -hourAngle; // in radians
    }
    /**
     * Return the <a href="http://en.wikipedia.org/wiki/Celestial_coordinate_system">Solar Elevation</a> for the
     * horizontal coordinate system at the given location at the given time. Can be negative if the sun is below the
     * horizon. Not corrected for altitude.
     *
     * @param {Temporal.ZonedDateTime} date
     *            time of calculation
     * @param {number} lat
     *            latitude of location for calculation
     * @param {number} lon
     *            longitude of location for calculation
     * @return {number} solar elevation in degrees - horizon is 0 degrees, civil twilight is -6 degrees
     */
    static getSolarElevation(date, lat, lon) {
        const julianDay = NOAACalculator.getJulianDay(date.toPlainDate());
        const julianCenturies = NOAACalculator.getJulianCenturiesFromJulianDay(julianDay);
        const equationOfTime = NOAACalculator.getEquationOfTime(julianCenturies);
        let longitude = date.hour + 12 + (date.minute + equationOfTime + date.second / 60) / 60;
        longitude = -((longitude * 360) / 24) % 360;
        const hourAngleRad = degreesToRadians(lon - longitude);
        const declination = NOAACalculator.getSunDeclination(julianCenturies);
        const decRad = degreesToRadians(declination);
        const latRad = degreesToRadians(lat);
        return radiansToDegrees(Math.asin(Math.sin(latRad) * Math.sin(decRad) +
            Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngleRad)));
    }
    /**
     * Return the <a href="http://en.wikipedia.org/wiki/Celestial_coordinate_system">Solar Azimuth</a> for the
     * horizontal coordinate system at the given location at the given time. Not corrected for altitude. True south is 0
     * degrees.
     *
     * @param {Temporal.ZonedDateTime} date
     *            time of calculation
     * @param {number} latitude
     *            latitude of location for calculation
     * @param {number} lon
     *            longitude of location for calculation
     * @return {number}
     */
    static getSolarAzimuth(date, latitude, lon) {
        const julianDay = NOAACalculator.getJulianDay(date.toPlainDate());
        const julianCenturies = NOAACalculator.getJulianCenturiesFromJulianDay(julianDay);
        const equationOfTime = NOAACalculator.getEquationOfTime(julianCenturies);
        let longitude = date.hour + 12 + (date.minute + equationOfTime + date.second / 60) / 60;
        longitude = -((longitude * 360) / 24) % 360;
        const hourAngleRad = degreesToRadians(lon - longitude);
        const declination = NOAACalculator.getSunDeclination(julianCenturies);
        const decRad = degreesToRadians(declination);
        const latRad = degreesToRadians(latitude);
        return (radiansToDegrees(Math.atan(Math.sin(hourAngleRad) /
            (Math.cos(hourAngleRad) * Math.sin(latRad) -
                Math.tan(decRad) * Math.cos(latRad)))) + 180);
    }
    /**
     * Return the <a href="http://en.wikipedia.org/wiki/Universal_Coordinated_Time">Universal Coordinated Time</a> (UTC)
     * of sunrise for the given day at the given location on earth
     * @private
     * @param julianDay
     *            the Julian day
     * @param {number} latitude
     *            the latitude of observer in degrees
     * @param {number} longitude
     *            the longitude of observer in degrees
     * @param {number} zenith
     *            the zenith
     * @return the time in minutes from zero UTC
     */
    static getSunriseUTC(julianDay, latitude, longitude, zenith) {
        const julianCenturies = NOAACalculator.getJulianCenturiesFromJulianDay(julianDay);
        // Find the time of solar noon at the location, and use that declination. This is better than start of the
        // Julian day
        const noonmin = NOAACalculator.getSolarNoonUTC(julianCenturies, longitude);
        const tnoon = NOAACalculator.getJulianCenturiesFromJulianDay(julianDay + noonmin / 1440);
        // First pass to approximate sunrise (using solar noon)
        let eqTime = NOAACalculator.getEquationOfTime(tnoon);
        let solarDec = NOAACalculator.getSunDeclination(tnoon);
        let hourAngle = NOAACalculator.getSunHourAngleAtSunrise(latitude, solarDec, zenith);
        let delta = longitude - radiansToDegrees(hourAngle);
        let timeDiff = 4 * delta; // in minutes of time
        let timeUTC = 720 + timeDiff - eqTime; // in minutes
        // Second pass includes fractional Julian Day in gamma calc
        const newt = NOAACalculator.getJulianCenturiesFromJulianDay(NOAACalculator.getJulianDayFromJulianCenturies(julianCenturies) +
            timeUTC / 1440);
        eqTime = NOAACalculator.getEquationOfTime(newt);
        solarDec = NOAACalculator.getSunDeclination(newt);
        hourAngle = NOAACalculator.getSunHourAngleAtSunrise(latitude, solarDec, zenith);
        delta = longitude - radiansToDegrees(hourAngle);
        timeDiff = 4 * delta;
        timeUTC = 720 + timeDiff - eqTime; // in minutes
        return timeUTC;
    }
    /**
     * Return the <a href="http://en.wikipedia.org/wiki/Universal_Coordinated_Time">Universal Coordinated Time</a> (UTC)
     * of <a href="http://en.wikipedia.org/wiki/Noon#Solar_noon">solar noon</a> for the given day at the given location
     * on earth.
     * @private
     * @param julianCenturies
     *            the number of Julian centuries since J2000.0
     * @param {number} longitude
     *            the longitude of observer in degrees
     * @return the time in minutes from zero UTC
     */
    static getSolarNoonUTC(julianCenturies, longitude) {
        // First pass uses approximate solar noon to calculate eqtime
        const tnoon = NOAACalculator.getJulianCenturiesFromJulianDay(NOAACalculator.getJulianDayFromJulianCenturies(julianCenturies) +
            longitude / 360);
        let eqTime = NOAACalculator.getEquationOfTime(tnoon);
        const solNoonUTC = 720 + longitude * 4 - eqTime; // min
        const newt = NOAACalculator.getJulianCenturiesFromJulianDay(NOAACalculator.getJulianDayFromJulianCenturies(julianCenturies) -
            0.5 +
            solNoonUTC / 1440);
        eqTime = NOAACalculator.getEquationOfTime(newt);
        return 720 + longitude * 4 - eqTime; // min
    }
    /**
     * Return the <a href="http://en.wikipedia.org/wiki/Universal_Coordinated_Time">Universal Coordinated Time</a> (UTC)
     * of sunset for the given day at the given location on earth
     * @private
     * @param julianDay
     *            the Julian day
     * @param {number} latitude
     *            the latitude of observer in degrees
     * @param {number} longitude
     *            : longitude of observer in degrees
     * @param {number} zenith
     *            the zenith
     * @return the time in minutes from zero Universal Coordinated Time (UTC)
     */
    static getSunsetUTC(julianDay, latitude, longitude, zenith) {
        const julianCenturies = NOAACalculator.getJulianCenturiesFromJulianDay(julianDay);
        // Find the time of solar noon at the location, and use that declination. This is better than start of the
        // Julian day
        const noonmin = NOAACalculator.getSolarNoonUTC(julianCenturies, longitude);
        const tnoon = NOAACalculator.getJulianCenturiesFromJulianDay(julianDay + noonmin / 1440);
        // First calculates sunrise and approx length of day
        let eqTime = NOAACalculator.getEquationOfTime(tnoon);
        let solarDec = NOAACalculator.getSunDeclination(tnoon);
        let hourAngle = NOAACalculator.getSunHourAngleAtSunset(latitude, solarDec, zenith);
        let delta = longitude - radiansToDegrees(hourAngle);
        let timeDiff = 4 * delta;
        let timeUTC = 720 + timeDiff - eqTime;
        // Second pass includes fractional Julian Day in gamma calc
        const newt = NOAACalculator.getJulianCenturiesFromJulianDay(NOAACalculator.getJulianDayFromJulianCenturies(julianCenturies) +
            timeUTC / 1440);
        eqTime = NOAACalculator.getEquationOfTime(newt);
        solarDec = NOAACalculator.getSunDeclination(newt);
        hourAngle = NOAACalculator.getSunHourAngleAtSunset(latitude, solarDec, zenith);
        delta = longitude - radiansToDegrees(hourAngle);
        timeDiff = 4 * delta;
        timeUTC = 720 + timeDiff - eqTime; // in minutes
        return timeUTC;
    }
}

var citiesJson = [
    "Ashdod|IL|31.79213|34.64966|Asia/Jerusalem|27",
    "Atlanta|US|33.749|-84.38798|America/New_York|336",
    "Austin|US|30.26715|-97.74306|America/Chicago|165",
    "Baghdad|IQ|33.34058|44.40088|Asia/Baghdad|41",
    "Beer Sheva|IL|31.25181|34.7913|Asia/Jerusalem|285",
    "Berlin|DE|52.52437|13.41053|Europe/Berlin|43",
    "Baltimore|US|39.29038|-76.61219|America/New_York|35",
    "Bogota|CO|4.60971|-74.08175|America/Bogota|2582",
    "Boston|US|42.35843|-71.05977|America/New_York|38",
    "Budapest|HU|47.49801|19.03991|Europe/Budapest|104",
    "Buenos Aires|AR|-34.61315|-58.37723|America/Argentina/Buenos_Aires|31",
    "Buffalo|US|42.88645|-78.87837|America/New_York|191",
    "Chicago|US|41.85003|-87.65005|America/Chicago|180",
    "Cincinnati|US|39.162|-84.45689|America/New_York|267",
    "Cleveland|US|41.4995|-81.69541|America/New_York|204",
    "Dallas|US|32.78306|-96.80667|America/Chicago|139",
    "Denver|US|39.73915|-104.9847|America/Denver|1636",
    "Detroit|US|42.33143|-83.04575|America/Detroit|192",
    "Eilat|IL|29.55805|34.94821|Asia/Jerusalem|63",
    "Gibraltar|GI|36.14474|-5.35257|Europe/Gibraltar|11",
    "Haifa|IL|32.81841|34.9885|Asia/Jerusalem|40",
    "Hawaii|US|21.30694|-157.85833|Pacific/Honolulu|18",
    "Helsinki|FI|60.16952|24.93545|Europe/Helsinki|26",
    "Houston|US|29.76328|-95.36327|America/Chicago|30",
    "Jerusalem|IL|31.76904|35.21633|Asia/Jerusalem|786",
    "Johannesburg|ZA|-26.20227|28.04363|Africa/Johannesburg|1767",
    "Kiev|UA|50.45466|30.5238|Europe/Kiev|187",
    "La Paz|BO|-16.5|-68.15|America/La_Paz|3782",
    "Livingston|US|40.79593|-74.31487|America/New_York|98",
    "Las Vegas|US|36.17497|-115.13722|America/Los_Angeles|613",
    "London|GB|51.50853|-0.12574|Europe/London|25",
    "Los Angeles|US|34.05223|-118.24368|America/Los_Angeles|96",
    "Marseilles|FR|43.29695|5.38107|Europe/Paris|28",
    "Miami|US|25.77427|-80.19366|America/New_York|25",
    "Minneapolis|US|44.97997|-93.26384|America/Chicago|262",
    "Melbourne|AU|-37.814|144.96332|Australia/Melbourne|25",
    "Mexico City|MX|19.42847|-99.12766|America/Mexico_City|2240",
    "Montreal|CA|45.50884|-73.58781|America/Toronto|216",
    "Moscow|RU|55.75222|37.61556|Europe/Moscow|144",
    "New York|US|40.71427|-74.00597|America/New_York|57",
    "Omaha|US|41.25861|-95.93779|America/Chicago|315",
    "Ottawa|CA|45.41117|-75.69812|America/Toronto|71",
    "Panama City|PA|8.9936|-79.51973|America/Panama|17",
    "Paris|FR|48.85341|2.3488|Europe/Paris|42",
    "Pawtucket|US|41.87871|-71.38256|America/New_York|0",
    "Petach Tikvah|IL|32.08707|34.88747|Asia/Jerusalem|54",
    "Philadelphia|US|39.95233|-75.16379|America/New_York|8",
    "Phoenix|US|33.44838|-112.07404|America/Phoenix|366",
    "Pittsburgh|US|40.44062|-79.99589|America/New_York|239",
    "Providence|US|41.82399|-71.41283|America/New_York|0",
    "Portland|US|45.52345|-122.67621|America/Los_Angeles|15",
    "Saint Louis|US|38.62727|-90.19789|America/Chicago|149",
    "Saint Petersburg|RU|59.93863|30.31413|Europe/Moscow|11",
    "San Diego|US|32.71533|-117.15726|America/Los_Angeles|20",
    "San Francisco|US|37.77493|-122.41942|America/Los_Angeles|28",
    "Sao Paulo|BR|-23.5475|-46.63611|America/Sao_Paulo|769",
    "Seattle|US|47.60621|-122.33207|America/Los_Angeles|56",
    "Sydney|AU|-33.86785|151.20732|Australia/Sydney|58",
    "Tel Aviv|IL|32.08088|34.78057|Asia/Jerusalem|15",
    "Tiberias|IL|32.79221|35.53124|Asia/Jerusalem|0",
    "Toronto|CA|43.70011|-79.4163|America/Toronto|175",
    "Vancouver|CA|49.24966|-123.11934|America/Vancouver|70",
    "White Plains|US|41.03399|-73.76291|America/New_York|82",
    "Washington DC|US|38.89511|-77.03637|America/New_York|6",
    "Worcester|US|42.26259|-71.80229|America/New_York|164"
];

class QuickLRU extends Map {
	#size = 0;
	#cache = new Map();
	#oldCache = new Map();
	#maxSize;
	#maxAge;
	#onEviction;

	constructor(options = {}) {
		super();

		if (!(options.maxSize && options.maxSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		if (typeof options.maxAge === 'number' && options.maxAge === 0) {
			throw new TypeError('`maxAge` must be a number greater than 0');
		}

		this.#maxSize = options.maxSize;
		this.#maxAge = options.maxAge || Number.POSITIVE_INFINITY;
		this.#onEviction = options.onEviction;
	}

	// For tests.
	get __oldCache() {
		return this.#oldCache;
	}

	#emitEvictions(cache) {
		if (typeof this.#onEviction !== 'function') {
			return;
		}

		for (const [key, item] of cache) {
			this.#onEviction(key, item.value);
		}
	}

	#deleteIfExpired(key, item) {
		if (typeof item.expiry === 'number' && item.expiry <= Date.now()) {
			if (typeof this.#onEviction === 'function') {
				this.#onEviction(key, item.value);
			}

			return this.delete(key);
		}

		return false;
	}

	#getOrDeleteIfExpired(key, item) {
		const deleted = this.#deleteIfExpired(key, item);
		if (deleted === false) {
			return item.value;
		}
	}

	#getItemValue(key, item) {
		return item.expiry ? this.#getOrDeleteIfExpired(key, item) : item.value;
	}

	#peek(key, cache) {
		const item = cache.get(key);
		return this.#getItemValue(key, item);
	}

	#set(key, value) {
		this.#cache.set(key, value);
		this.#size++;

		if (this.#size >= this.#maxSize) {
			this.#size = 0;
			this.#emitEvictions(this.#oldCache);
			this.#oldCache = this.#cache;
			this.#cache = new Map();
		}
	}

	#moveToRecent(key, item) {
		this.#oldCache.delete(key);
		this.#set(key, item);
	}

	* #entriesAscending() {
		for (const item of this.#oldCache) {
			const [key, value] = item;
			if (!this.#cache.has(key)) {
				const deleted = this.#deleteIfExpired(key, value);
				if (deleted === false) {
					yield item;
				}
			}
		}

		for (const item of this.#cache) {
			const [key, value] = item;
			const deleted = this.#deleteIfExpired(key, value);
			if (deleted === false) {
				yield item;
			}
		}
	}

	get(key) {
		if (this.#cache.has(key)) {
			const item = this.#cache.get(key);
			return this.#getItemValue(key, item);
		}

		if (this.#oldCache.has(key)) {
			const item = this.#oldCache.get(key);
			if (this.#deleteIfExpired(key, item) === false) {
				this.#moveToRecent(key, item);
				return item.value;
			}
		}
	}

	set(key, value, {maxAge = this.#maxAge} = {}) {
		const expiry = typeof maxAge === 'number' && maxAge !== Number.POSITIVE_INFINITY
			? (Date.now() + maxAge)
			: undefined;

		if (this.#cache.has(key)) {
			this.#cache.set(key, {
				value,
				expiry,
			});
		} else {
			this.#set(key, {value, expiry});
		}

		return this;
	}

	has(key) {
		if (this.#cache.has(key)) {
			return !this.#deleteIfExpired(key, this.#cache.get(key));
		}

		if (this.#oldCache.has(key)) {
			return !this.#deleteIfExpired(key, this.#oldCache.get(key));
		}

		return false;
	}

	peek(key) {
		if (this.#cache.has(key)) {
			return this.#peek(key, this.#cache);
		}

		if (this.#oldCache.has(key)) {
			return this.#peek(key, this.#oldCache);
		}
	}

	expiresIn(key) {
		const item = this.#cache.get(key) ?? this.#oldCache.get(key);
		if (item) {
			return item.expiry ? item.expiry - Date.now() : Number.POSITIVE_INFINITY;
		}
	}

	delete(key) {
		const deleted = this.#cache.delete(key);
		if (deleted) {
			this.#size--;
		}

		return this.#oldCache.delete(key) || deleted;
	}

	clear() {
		this.#cache.clear();
		this.#oldCache.clear();
		this.#size = 0;
	}

	resize(newSize) {
		if (!(newSize && newSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		const items = [...this.#entriesAscending()];
		const removeCount = items.length - newSize;
		if (removeCount < 0) {
			this.#cache = new Map(items);
			this.#oldCache = new Map();
			this.#size = items.length;
		} else {
			if (removeCount > 0) {
				this.#emitEvictions(items.slice(0, removeCount));
			}

			this.#oldCache = new Map(items.slice(removeCount));
			this.#cache = new Map();
			this.#size = 0;
		}

		this.#maxSize = newSize;
	}

	evict(count = 1) {
		const requested = Number(count);
		if (!requested || requested <= 0) {
			return;
		}

		const items = [...this.#entriesAscending()];
		const evictCount = Math.trunc(Math.min(requested, Math.max(items.length - 1, 0)));
		if (evictCount <= 0) {
			return;
		}

		this.#emitEvictions(items.slice(0, evictCount));
		this.#oldCache = new Map(items.slice(evictCount));
		this.#cache = new Map();
		this.#size = 0;
	}

	* keys() {
		for (const [key] of this) {
			yield key;
		}
	}

	* values() {
		for (const [, value] of this) {
			yield value;
		}
	}

	* [Symbol.iterator]() {
		for (const item of this.#cache) {
			const [key, value] = item;
			const deleted = this.#deleteIfExpired(key, value);
			if (deleted === false) {
				yield [key, value.value];
			}
		}

		for (const item of this.#oldCache) {
			const [key, value] = item;
			if (!this.#cache.has(key)) {
				const deleted = this.#deleteIfExpired(key, value);
				if (deleted === false) {
					yield [key, value.value];
				}
			}
		}
	}

	* entriesDescending() {
		let items = [...this.#cache];
		for (let i = items.length - 1; i >= 0; --i) {
			const item = items[i];
			const [key, value] = item;
			const deleted = this.#deleteIfExpired(key, value);
			if (deleted === false) {
				yield [key, value.value];
			}
		}

		items = [...this.#oldCache];
		for (let i = items.length - 1; i >= 0; --i) {
			const item = items[i];
			const [key, value] = item;
			if (!this.#cache.has(key)) {
				const deleted = this.#deleteIfExpired(key, value);
				if (deleted === false) {
					yield [key, value.value];
				}
			}
		}
	}

	* entriesAscending() {
		for (const [key, value] of this.#entriesAscending()) {
			yield [key, value.value];
		}
	}

	get size() {
		if (!this.#size) {
			return this.#oldCache.size;
		}

		let oldCacheSize = 0;
		for (const key of this.#oldCache.keys()) {
			if (!this.#cache.has(key)) {
				oldCacheSize++;
			}
		}

		return Math.min(this.#size + oldCacheSize, this.#maxSize);
	}

	get maxSize() {
		return this.#maxSize;
	}

	get maxAge() {
		return this.#maxAge;
	}

	entries() {
		return this.entriesAscending();
	}

	forEach(callbackFunction, thisArgument = this) {
		for (const [key, value] of this.entriesAscending()) {
			callbackFunction.call(thisArgument, value, key, this);
		}
	}

	get [Symbol.toStringTag]() {
		return 'QuickLRU';
	}

	toString() {
		return `QuickLRU(${this.size}/${this.maxSize})`;
	}

	[Symbol.for('nodejs.util.inspect.custom')]() {
		return this.toString();
	}
}

/*
    Hebcal - A Jewish Calendar Generator
    Copyright (c) 1994-2020 Danny Sadinoff
    Portions copyright Eyal Schachter and Michael J. Radwin

    https://github.com/hebcal/hebcal-es6

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation; either version 2
    of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
const classicCities = new Map();
// Zip-Codes.com TimeZone IDs
const ZIPCODES_TZ_MAP = {
    '0': 'UTC',
    '4': 'America/Puerto_Rico', // Atlantic (GMT -04:00)
    '5': 'America/New_York', //    Eastern  (GMT -05:00)
    '6': 'America/Chicago', //     Central  (GMT -06:00)
    '7': 'America/Denver', //      Mountain (GMT -07:00)
    '8': 'America/Los_Angeles', // Pacific  (GMT -08:00)
    '9': 'America/Anchorage', //   Alaska   (GMT -09:00)
    '10': 'Pacific/Honolulu', //   Hawaii-Aleutian Islands (GMT -10:00)
    '11': 'Pacific/Pago_Pago', //  American Samoa (GMT -11:00)
    '13': 'Pacific/Funafuti', //   Marshall Islands (GMT +12:00)
    '14': 'Pacific/Guam', //       Guam     (GMT +10:00)
    '15': 'Pacific/Palau', //      Palau    (GMT +9:00)
    '16': 'Pacific/Chuuk', //      Micronesia (GMT +11:00)
};
/** @private */
const timeFormatCache = new QuickLRU({
    maxSize: 120,
});
/**
 * Gets a 24-hour time formatter (e.g. 07:41 or 20:03) from cache
 * or makes a new one if needed
 * @private
 */
function getFormatter(tzid) {
    const fmt = timeFormatCache.get(tzid);
    if (fmt)
        return fmt;
    const f = new Intl.DateTimeFormat('en-US', {
        timeZone: tzid,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    });
    timeFormatCache.set(tzid, f);
    return f;
}
function initClassicCities() {
    for (const entry of citiesJson) {
        const [cityName, cc, lat, lng, tzid, elev] = entry.split('|');
        const location = new Location(+lat, +lng, cc === 'IL', tzid, cityName, cc, undefined, +elev);
        Location.addLocation(cityName, location);
    }
}
/**
 * Class representing a geographic location for use with candle-lighting,
 * havdalah, and zmanim calculations.
 *
 * Extends {@link GeoLocation} from `@hebcal/noaa` with Jewish-calendar
 * specific data: an Israel/Diaspora flag, ISO country code, and an optional
 * geographic identifier. Also provides {@link Location.lookup} for the 65
 * built-in "classic" Hebcal cities.
 *
 * @example
 * import {Location} from '@hebcal/core';
 *
 * // Create a location for a custom address
 * const loc = new Location(
 *   41.85003,    // latitude
 *   -87.65005,   // longitude
 *   false,       // not in Israel
 *   'America/Chicago',
 *   'Chicago, Illinois, USA',
 *   'US'
 * );
 *
 * // Or look up a built-in classic city
 * const tlv = Location.lookup('Tel Aviv');
 */
class Location extends GeoLocation {
    /**
     * Initialize a Location instance
     * @param latitude - Latitude as a decimal, valid range -90 thru +90 (e.g. 41.85003)
     * @param longitude - Longitude as a decimal, valid range -180 thru +180 (e.g. -87.65005)
     * @param il - in Israel (true) or Diaspora (false)
     * @param tzid - Olson timezone ID, e.g. "America/Chicago"
     * @param [cityName] - optional descriptive city name
     * @param [countryCode] - ISO 3166 alpha-2 country code (e.g. "FR")
     * @param [geoid] - optional string or numeric geographic ID
     * @param [elevation] - in meters (default `0`)
     */
    constructor(latitude, longitude, il, tzid, cityName, countryCode, geoid, elevation) {
        const lat = typeof latitude === 'number' ? latitude : parseFloat(latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
            throw new RangeError(`Latitude ${latitude} out of range [-90,90]`);
        }
        const long = typeof longitude === 'number' ? longitude : parseFloat(longitude);
        if (isNaN(long) || long < -180 || long > 180) {
            throw new RangeError(`Longitude ${longitude} out of range [-180,180]`);
        }
        if (!tzid) {
            throw new RangeError('Invalid timezone');
        }
        const elev = typeof elevation === 'number' && elevation > 0 ? elevation : 0;
        if (cityName && typeof cityName !== 'string') {
            cityName = String(cityName);
        }
        super(cityName || null, lat, long, elev, tzid);
        this.il = Boolean(il);
        this.cc = countryCode;
        if (countryCode === 'IL') {
            this.il = true;
        }
        this.geoid = geoid;
    }
    /**
     * Returns `true` if this location is in Israel (uses the Israeli holiday
     * and Torah-reading schedule), `false` for the Diaspora.
     */
    getIsrael() {
        return this.il;
    }
    /**
     * Returns the full descriptive location name passed to the constructor,
     * or `null` if no name was provided.
     *
     * Note that the built-in classic cities are named by city alone, so
     * `getName()` and {@link getShortName} return the same string for them.
     * @example
     * const loc = new Location(41.85003, -87.65005, false,
     *   'America/Chicago', 'Chicago, Illinois, USA', 'US');
     * loc.getName(); // 'Chicago, Illinois, USA'
     * Location.lookup('San Francisco')?.getName(); // 'San Francisco'
     */
    getName() {
        return this.getLocationName();
    }
    /**
     * Returns the location name truncated at the first comma. Useful for
     * compact display where only the city name is desired.
     *
     * Special-cased so that US locations of the form `"Washington, DC ..."` or
     * `"Washington, D.C., ..."` keep the `DC` / `D.C.` suffix attached.
     * @example
     * const chi = new Location(41.85003, -87.65005, false,
     *   'America/Chicago', 'Chicago, Illinois, USA', 'US');
     * chi.getShortName(); // 'Chicago'
     * const dc = new Location(38.89511, -77.03637, false,
     *   'America/New_York', 'Washington, D.C., USA', 'US');
     * dc.getShortName(); // 'Washington, D.C.'
     */
    getShortName() {
        const name = this.getLocationName();
        if (!name)
            return name;
        const comma = name.indexOf(', ');
        if (comma === -1)
            return name;
        if (this.cc === 'US' && name[comma + 2] === 'D') {
            if (name[comma + 3] === 'C') {
                return name.substring(0, comma + 4);
            }
            if (name[comma + 3] === '.' && name[comma + 4] === 'C') {
                return name.substring(0, comma + 6);
            }
        }
        return name.substring(0, comma);
    }
    /**
     * Returns the ISO 3166 alpha-2 country code (e.g. `"US"`, `"IL"`, `"FR"`)
     * passed to the constructor, or `undefined` if none was provided.
     */
    getCountryCode() {
        return this.cc;
    }
    /**
     * Returns the Olson timezone identifier (e.g. `"America/Chicago"`).
     * Alias for `getTimeZone()` from the parent `GeoLocation` class.
     */
    getTzid() {
        return this.getTimeZone();
    }
    /**
     * Returns a cached 24-hour `Intl.DateTimeFormat` (e.g. `07:41` or `20:03`)
     * configured for this location's timezone. Formatters are memoized by
     * timezone so repeated calls do not allocate.
     * @example
     * const loc = Location.lookup('Tel Aviv')!;
     * const fmt = loc.getTimeFormatter();
     * fmt.format(new Date()); // e.g. '18:42'
     */
    getTimeFormatter() {
        return getFormatter(this.getTimeZone());
    }
    /**
     * Returns the optional geographic identifier passed to the constructor
     * (typically a GeoNames numeric ID or a US Zip Code string), or
     * `undefined` if none was provided.
     */
    getGeoId() {
        return this.geoid;
    }
    /**
     * Creates a location object from one of 65 "classic" Hebcal city names.
     * The following city names are supported:
     * 'Ashdod', 'Atlanta', 'Austin', 'Baghdad', 'Beer Sheva',
     * 'Berlin', 'Baltimore', 'Bogota', 'Boston', 'Budapest',
     * 'Buenos Aires', 'Buffalo', 'Chicago', 'Cincinnati', 'Cleveland',
     * 'Dallas', 'Denver', 'Detroit', 'Eilat', 'Gibraltar', 'Haifa',
     * 'Hawaii', 'Helsinki', 'Houston', 'Jerusalem', 'Johannesburg',
     * 'Kiev', 'La Paz', 'Livingston', 'Las Vegas', 'London', 'Los Angeles',
     * 'Marseilles', 'Miami', 'Minneapolis', 'Melbourne', 'Mexico City',
     * 'Montreal', 'Moscow', 'New York', 'Omaha', 'Ottawa', 'Panama City',
     * 'Paris', 'Pawtucket', 'Petach Tikvah', 'Philadelphia', 'Phoenix',
     * 'Pittsburgh', 'Providence', 'Portland', 'Saint Louis', 'Saint Petersburg',
     * 'San Diego', 'San Francisco', 'Sao Paulo', 'Seattle', 'Sydney',
     * 'Tel Aviv', 'Tiberias', 'Toronto', 'Vancouver', 'White Plains',
     * 'Washington DC', 'Worcester'
     *
     * Lookups are case-insensitive. Returns `undefined` if the name is not
     * recognized. The list can be extended with {@link Location.addLocation}.
     * @example
     * const loc = Location.lookup('San Francisco');
     * console.log(loc?.getTzid()); // 'America/Los_Angeles'
     * @param name case-insensitive classic city name
     */
    static lookup(name) {
        if (classicCities.size === 0) {
            initClassicCities();
        }
        return classicCities.get(name.toLowerCase());
    }
    /**
     * Returns a JSON-serialized representation of this Location.
     * Useful for debugging and structured logging.
     */
    toString() {
        return JSON.stringify(this);
    }
    /**
     * Converts a legacy Hebcal-style timezone (a numeric GMT offset plus a
     * coarse DST region) to a standard IANA/Olson timezone ID.
     *
     * This exists to migrate data from older Hebcal versions that stored
     * timezones as GMT offset + DST scheme rather than as a full tzid.
     * @example
     * Location.legacyTzToTzid(2, 'israel'); // 'Asia/Jerusalem'
     * Location.legacyTzToTzid(0, 'eu');     // 'Europe/London'
     * Location.legacyTzToTzid(0, 'none');   // 'UTC'
     * Location.legacyTzToTzid(-5, 'none');  // 'Etc/GMT-5'
     * @param tz integer, GMT offset in hours
     * @param dst 'none', 'eu', 'usa', or 'israel'
     */
    static legacyTzToTzid(tz, dst) {
        tz = +tz;
        if (dst === 'none') {
            if (tz === 0) {
                return 'UTC';
            }
            const plus = tz > 0 ? '+' : '';
            return `Etc/GMT${plus}${tz}`;
        }
        if (tz === 2 && dst === 'israel') {
            return 'Asia/Jerusalem';
        }
        if (dst === 'eu') {
            switch (tz) {
                case -2:
                    return 'Atlantic/Cape_Verde';
                case -1:
                    return 'Atlantic/Azores';
                case 0:
                    return 'Europe/London';
                case 1:
                    return 'Europe/Paris';
                case 2:
                    return 'Europe/Athens';
            }
        }
        if (dst === 'usa') {
            return ZIPCODES_TZ_MAP[String(tz * -1)];
        }
        return undefined;
    }
    /**
     * Converts timezone info from Zip-Codes.com to a standard Olson tzid.
     * @example
     * Location.getUsaTzid('AZ', 7, 'Y') // 'America/Denver'
     * @param state two-letter all-caps US state abbreviation like 'CA'
     * @param tz positive number, 5=America/New_York, 8=America/Los_Angeles
     * @param dst single char 'Y' or 'N'
     */
    static getUsaTzid(state, tz, dst) {
        tz = +tz;
        if (tz === 10 && state === 'AK') {
            return 'America/Adak';
        }
        if (tz === 7 && state === 'AZ') {
            return dst === 'Y' ? 'America/Denver' : 'America/Phoenix';
        }
        return ZIPCODES_TZ_MAP[tz];
    }
    /**
     * Registers a new named location with the built-in `Location.lookup()`
     * registry. Names are stored case-insensitively. Returns `false` if a
     * location with the same (lower-cased) name is already registered, and
     * `true` if successfully added.
     *
     * Use this to extend the built-in set of 65 classic Hebcal cities with
     * your own custom locations.
     * @example
     * const tlv = new Location(32.0853, 34.7818, true,
     *   'Asia/Jerusalem', 'My Office, Tel Aviv', 'IL');
     * Location.addLocation('My Office', tlv);   // true
     * Location.lookup('my office')?.getTzid();  // 'Asia/Jerusalem'
     * @param cityName name to register the location under (case insensitive)
     * @param location the `Location` instance to register
     */
    static addLocation(cityName, location) {
        const name = cityName.toLowerCase();
        if (classicCities.has(name)) {
            return false;
        }
        classicCities.set(name, location);
        return true;
    }
}

const hour12cc = {
    US: 1,
    CA: 1,
    BR: 1,
    AU: 1,
    NZ: 1,
    DO: 1,
    PR: 1,
    GR: 1,
    IN: 1,
    KR: 1,
    NP: 1,
    ZA: 1,
};
/**
 * Helper function to format a 24-hour (00:00-23:59) time string in either
 * 12-hour US format (e.g. `"8:13pm"`) or keep it in 24-hour format (e.g.
 * `"20:13"`) for any other locale or country.
 *
 * The locale (and therefore default behavior) is derived from
 * `options.location` / `options.locale`. The `options.hour12` override
 * takes precedence: if `false`, locale is ignored and the result is always
 * 24-hour; if `true`, locale is ignored and the result is always 12-hour.
 * @example
 * import {reformatTimeStr, Location} from '@hebcal/core';
 * const opts = {location: Location.lookup('Chicago')};
 * reformatTimeStr('20:30', 'pm', opts);          // '8:30pm'
 * reformatTimeStr('20:30', 'pm', {hour12: false}); // '20:30'
 * @param timeStr - original time like "20:30"
 * @param suffix - "p" or "pm" or " P.M.". Add leading space if you want it
 * @param options optional; `location`, `locale` and `hour12` are consulted
 */
function reformatTimeStr(timeStr, suffix, options) {
    if (typeof timeStr !== 'string')
        throw new TypeError(`Bad timeStr: ${timeStr}`);
    const cc = options?.location?.getCountryCode() || (options?.il ? 'IL' : 'US');
    const hour12 = options?.hour12;
    if (hour12 !== undefined && !hour12) {
        return timeStr;
    }
    if (!hour12 && hour12cc[cc] === undefined) {
        return timeStr;
    }
    const hm = timeStr.split(':');
    let hour = parseInt(hm[0], 10);
    if (hour < 12 && suffix) {
        suffix = suffix.replace('p', 'a').replace('P', 'A');
        if (hour === 0) {
            hour = 12;
        }
    }
    else if (hour > 12) {
        hour = hour % 12;
    }
    else if (hour === 0) {
        hour = '00';
    }
    return `${hour}:${hm[1]}${suffix}`;
}

/*
 * Includes code ported from KosherJava, copyright 2004 Eliyahu Hershfeld,
 * released under LGPL 2.1.
 */
/**
 * the Jewish epoch using the RD (Rata Die/Fixed Date or Reingold Dershowitz) day used in Calendrical Calculations.
 * Day 1 is January 1, 0001 of the Gregorian calendar
 */
const JEWISH_EPOCH = -1373429;
/** The number of _chalakim_ (18) in a minute. */
const CHALAKIM_PER_MINUTE = 18;
/** The number of _chalakim_ (1080) in an hour. */
const CHALAKIM_PER_HOUR = 1080;
/** The number of _chalakim_ (25,920) in a 24-hour day. */
const CHALAKIM_PER_DAY = 25920; // 24 * 1080
/** The number of _chalakim_ in an average Jewish month. A month has 29 days, 12 hours and 793
 * _chalakim_ (44 minutes and 3.3 seconds) for a total of 765,433 _chalakim_ */
const CHALAKIM_PER_MONTH = 765433; // (29 * 24 + 12) * 1080 + 793
/**
 * Days from the beginning of Sunday till _molad BaHaRaD_. Calculated as 1 day, 5 hours and 204 _chalakim_ =
 * (24 + 5) * 1080 + 204 = 31524
 */
const CHALAKIM_MOLAD_TOHU = 31524;
/**
 * Converts the NISSAN-based constants used by this class to numeric month starting from
 * TISHREI. This is required for _molad_ calculations.
 */
function getJewishMonthOfYear(year, month) {
    const leap = isLeapYear(year);
    return ((month + (leap ? 6 : 5)) % (leap ? 13 : 12)) + 1;
}
/**
 * Returns the number of _chalakim_ (parts - 1080 to the hour) from
 * the original hypothetical _Molad Tohu_ to the year and month
 * passed in.
 */
function getChalakimSinceMoladTohu(year, month) {
    // Jewish lunar month = 29 days, 12 hours and 793 chalakim
    // chalakim since Molad Tohu BeHaRaD - 1 day, 5 hours and 204 chalakim
    const monthOfYear = getJewishMonthOfYear(year, month);
    const monthsElapsed = 235 * Math.trunc((year - 1) / 19) + // Months in complete 19-year lunar (Metonic) cycles so far
        12 * ((year - 1) % 19) + // Regular months in this cycle
        Math.trunc((7 * ((year - 1) % 19) + 1) / 19) + // Leap months this cycle
        (monthOfYear - 1); // add elapsed months till the start of the molad of the month
    // return chalakim prior to BeHaRaD + number of chalakim since
    return CHALAKIM_MOLAD_TOHU + CHALAKIM_PER_MONTH * monthsElapsed;
}
/**
 * Returns the number of days from the Jewish epoch from the number of chalakim from the epoch passed in.
 * @param chalakim the number of _chalakim_ since the beginning of Sunday prior to BaHaRaD
 * @return the number of days from the Jewish epoch
 */
function moladToAbsDate(chalakim) {
    return Math.trunc(chalakim / CHALAKIM_PER_DAY) + JEWISH_EPOCH;
}
/**
 * Calculates the molad (birth of the new moon) for a Hebrew month using
 * traditional chalakim arithmetic.
 *
 * Returns the raw components — day of week, hour, minutes and chalakim. Use
 * {@link Molad} for a higher-level interface with rendering and Kiddush Levana
 * times.
 * @param year Hebrew year
 * @param month Hebrew month (see `months` from `@hebcal/hdate`)
 * @return the components of the molad for that month
 */
function calculateMolad(year, month) {
    const chalakim = getChalakimSinceMoladTohu(year, month);
    const absDate = moladToAbsDate(chalakim);
    let hd = new HDate(absDate);
    const conjunctionDay = Math.trunc(chalakim / CHALAKIM_PER_DAY);
    const conjunctionParts = Math.trunc(chalakim - conjunctionDay * CHALAKIM_PER_DAY);
    let adjustedChalakim = conjunctionParts;
    let hour = Math.trunc(adjustedChalakim / CHALAKIM_PER_HOUR);
    adjustedChalakim = adjustedChalakim - hour * CHALAKIM_PER_HOUR;
    const minutes = Math.trunc(adjustedChalakim / CHALAKIM_PER_MINUTE);
    if (hour >= 6) {
        hd = hd.next();
    }
    hour = (hour + 18) % 24;
    const m = {
        hdate: hd,
        hour,
        minutes,
        chalakim: adjustedChalakim - minutes * CHALAKIM_PER_MINUTE,
    };
    return m;
}

/** constant for milliseconds in a minute (60,000) */
const MINUTE_MILLIS = 60 * 1000;
/**
 * A method that will return the location's local mean time offset in milliseconds from local
 * [standard time](https://en.wikipedia.org/wiki/Standard_time). The globe is split into 360°, with
 * 15° per hour of the day. For a locale that is at a longitude that is evenly divisible by 15
 * (longitude % 15 == 0), at solar noon (with adjustment for the
 * [equation of time](https://en.wikipedia.org/wiki/Equation_of_time)) the sun should be directly overhead,
 * so a user who is 1° west of this will have noon at 4 minutes after standard time noon, and conversely, a user
 * who is 1° east of the 15° longitude will have noon at 11:56 AM. Lakewood, N.J., whose longitude is
 * -74.222, is 0.778 away from the closest multiple of 15 at -75°. This is multiplied by 4 to yield 3 minutes
 * and 10 seconds earlier than standard time. The offset returned does not account for the
 * [Daylight saving time](https://en.wikipedia.org/wiki/Daylight_saving_time) offset since this function is
 * unaware of dates.
 *
 * @param dt the date used to resolve the timezone offset
 * @param longitude the location's longitude
 * @param tzid IANA timezone identifier
 * @return the offset in milliseconds not accounting for Daylight saving time. A positive value will be returned
 *         East of the 15° timezone line, and a negative value West of it.
 */
function getLocalMeanTimeOffset(dt, longitude, tzid) {
    const offset = -1 * getTimezoneOffset(tzid, dt);
    const d = longitude * 4 * MINUTE_MILLIS - offset * MINUTE_MILLIS;
    return Math.trunc(d);
}
/**
 * Returns the moment of the molad as a `Temporal.ZonedDateTime` in the `UTC` zone.
 *
 * The molad is computed in Jerusalem *standard* time and then converted, so the
 * returned instant is correct year-round; only the zone of the returned object
 * is `UTC`. This method subtracts 20.94 minutes (20 minutes and 56.496 seconds)
 * from the computed time — Har Habayis, at longitude 35.2354°, is 5.2354° away
 * from the multiple-of-15 timezone longitude — to get to standard time. Daylight
 * savings time is intentionally not applied; adjust when formatting for display.
 *
 * @param molad the molad to convert
 * @return the `Temporal.ZonedDateTime` representing the moment of the molad
 */
function getMoladAsDate(molad) {
    const moladSeconds = (molad.chalakim * 10) / 3;
    const millis = Math.trunc(1000 * (moladSeconds - Math.trunc(moladSeconds)));
    const dt = molad.hdate.greg();
    // The raw molad Date (point in time) must be generated using standard time. Using "Asia/Jerusalem" timezone will result in the time
    // being incorrectly off by an hour in the summer due to DST. Proper adjustment for the actual time in DST will be done by the date
    // formatter class used to display the Date.
    const tzid = 'Etc/GMT+2';
    const zdt = Temporal.ZonedDateTime.from({
        year: dt.getFullYear(),
        month: dt.getMonth() + 1,
        day: dt.getDate(),
        hour: molad.hour,
        minute: molad.minutes,
        second: Math.trunc(moladSeconds),
        millisecond: millis,
        timeZone: tzid,
    });
    const longitude = 35.2354; // Har Habayis longitude
    const offset = getLocalMeanTimeOffset(dt, longitude, tzid);
    // subtract local time difference of 20.94 minutes (20 minutes and 56.496 seconds) to get to Standard time
    const zdt2 = zdt.subtract({ milliseconds: offset });
    return zdt2.withTimeZone('UTC');
}

function smartApostrophe(str) {
    return str.replaceAll("'", '’');
}
function urlFriendly(str) {
    return str.toLowerCase().replaceAll("'", '').replaceAll(' ', '-');
}

const enDoW = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
const heDayNames = [
    'רִאשׁוֹן',
    'שֵׁנִי',
    'שְׁלִישִׁי',
    'רְבִיעִי',
    'חֲמִישִׁי',
    'שִׁישִּׁי',
    'שַׁבָּת',
];
const frDoW = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
];
const night = 'בַּלַּ֥יְלָה';
function getDayNames(locale) {
    if (Locale.isHebrewLocale(locale)) {
        return heDayNames;
    }
    if (locale === 'fr') {
        return frDoW;
    }
    return enDoW;
}
function getHebrewTimeOfDay(hour) {
    if (hour < 5)
        return night;
    if (hour < 12)
        return 'בַּבֹּקֶר';
    if (hour < 17)
        return 'בַּצׇּהֳרַיִים';
    if (hour < 21)
        return 'בָּעֶרֶב';
    return night;
}
/**
 * Represents a *molad* — the calculated moment when the new moon is "born"
 * for a given Hebrew month.
 *
 * The molad is announced in synagogue on Shabbat Mevarchim (the Shabbat
 * before Rosh Chodesh) and is the anchor point for Kiddush Levana zmanim.
 * Calculations use the traditional chalakim arithmetic
 * (1 hour = 1080 chalakim) anchored to *Molad Tohu BaHaRaD*.
 *
 * @example
 * import {Molad, months} from '@hebcal/core';
 * const m = new Molad(5784, months.NISAN);
 * console.log(m.getMonthName()); // 'Nisan'
 * console.log(m.getHour(), m.getMinutes(), m.getChalakim()); // 22 57 7
 * console.log(m.render('en')); // 'Molad Nisan: Monday, 10:57pm and 7 chalakim'
 */
class Molad {
    /**
     * Calculates the molad for a given Hebrew year and month.
     * @param year Hebrew year
     * @param month 1=NISAN, 7=TISHREI (uses Nisan-based numbering)
     */
    constructor(year, month) {
        this.m = calculateMolad(year, month);
        this.year = year;
        this.month = month;
    }
    /**
     * The exact Hebrew date of the molad, which often falls on the
     * 28th or 30th of the preceeding month, occasionally on the first of the
     * month, and in extremely rare circumstances the 27th of the month.
     * - Molad Shevat 5541 occured on 27 Tevet / 1781-01-24T19:57:20.170Z
     * - Molad Shevat 5788 will occur on 27 Tevet / 2028-01-26T19:07:03.504Z
     * - Molad Nissan 5866 will occur on 27 Adar II / 2106-04-03T21:08:46.837Z
     */
    getMoladDate() {
        return this.m.hdate;
    }
    /**
     * The year of the molad (as constructed)
     */
    getYear() {
        return this.year;
    }
    /**
     * The month (1=NISSAN, 7=TISHREI) as constructed
     */
    getMonth() {
        return this.month;
    }
    /**
     * Returns a transliterated string name of the molad's Hebrew month,
     * for example 'Elul' or 'Cheshvan'.
     */
    getMonthName() {
        return HDate.getMonthName(this.month, this.year);
    }
    /**
     * @returns Day of Week (0=Sunday, 6=Saturday)
     */
    getDow() {
        return this.m.hdate.getDay();
    }
    /**
     * @returns hour of day (0-23)
     */
    getHour() {
        return this.m.hour;
    }
    /**
     * @returns minutes past hour (0-59)
     */
    getMinutes() {
        return this.m.minutes;
    }
    /**
     * @returns parts of a minute (0-17)
     */
    getChalakim() {
        return this.m.chalakim;
    }
    /**
     * Returns the moment of the molad as a `Temporal.ZonedDateTime` in the `UTC` zone.
     *
     * The molad is computed in Jerusalem *standard* time and then converted, so the
     * returned instant is correct year-round; only the zone of the returned object
     * is `UTC`. This method subtracts 20.94 minutes (20 minutes and 56.496 seconds)
     * from the computed time — Har Habayis, at longitude 35.2354°, is 5.2354° away
     * from the multiple-of-15 timezone longitude — to get to standard time. Daylight
     * savings time is intentionally not applied; adjust when formatting for display.
     *
     * The returned value is cached after the first call.
     * @example
     * import {Molad, months} from '@hebcal/core';
     * const m = new Molad(5784, months.NISAN);
     * const zdt = m.getInstant();
     * console.log(zdt.toString()); // '2024-04-08T20:36:26.837+00:00[UTC]'
     * @return the `Temporal.ZonedDateTime` representing the moment of the molad
     */
    getInstant() {
        this.instant ??= getMoladAsDate(this.m);
        return this.instant;
    }
    /**
     * Returns the earliest time of _Kiddush Levana_ calculated as 3 days after the molad. This method returns the time
     * even if it is during the day when _Kiddush Levana_ can't be said. Callers of this method should consider
     * displaying the next _tzais_ if the zman is between _alos_ and _tzais_.
     *
     * @return the Temporal.ZonedDateTime representing the moment 3 days after the molad.
     */
    getTchilasZmanKidushLevana3Days() {
        const zdt = this.getInstant();
        return zdt.add({ hours: 72 });
    }
    /**
     * Returns the earliest time of Kiddush Levana calculated as 7 days after the molad as mentioned by the
     * [Mechaber](https://en.wikipedia.org/wiki/Yosef_Karo). See the
     * [Bach's](https://en.wikipedia.org/wiki/Yoel_Sirkis) opinion on this time. This method returns the time
     * even if it is during the day when _Kiddush Levana_ can't be said. Callers of this method should consider
     * displaying the next _tzais_ if the zman is between _alos_ and _tzais_.
     *
     * @return the Temporal.ZonedDateTime representing the moment 7 days after the molad.
     */
    getTchilasZmanKidushLevana7Days() {
        const zdt = this.getInstant();
        return zdt.add({ hours: 168 });
    }
    /**
     * Returns the latest time of Kiddush Levana according to the
     * [Maharil's](https://en.wikipedia.org/wiki/Yaakov_ben_Moshe_Levi_Moelin) opinion that it is calculated as
     * halfway between molad and molad. This adds half the 29 days, 12 hours and 793 chalakim time between molad and
     * molad (14 days, 18 hours, 22 minutes and 666 milliseconds) to the month's molad. This method returns the time
     * even if it is during the day when _Kiddush Levana_ can't be said. Callers of this method should consider
     * displaying _alos_ before this time if the zman is between _alos_ and _tzais_.
     *
     * @return the Temporal.ZonedDateTime representing the moment halfway between molad and molad.
     */
    getSofZmanKidushLevanaBetweenMoldos() {
        const zdt = this.getInstant();
        // add half the time between molad and molad (half of 29 days, 12 hours and 793 chalakim (44 minutes, 3.3
        // seconds), or 14 days, 18 hours, 22 minutes and 666 milliseconds). Add it as hours, not days, to avoid
        // DST/ST crossover issues.
        return zdt.add({
            hours: 24 * 14 + 18,
            minutes: 22,
            seconds: 1,
            milliseconds: 666,
        });
    }
    /**
     * Returns the latest time of Kiddush Levana calculated as 15 days after the molad. This is the opinion brought down
     * in the Shulchan Aruch (Orach Chaim 426). It should be noted that some opinions hold that the
     * [Rema](https://en.wikipedia.org/wiki/Moses_Isserles) who brings down the opinion of the
     * [Maharil's](https://en.wikipedia.org/wiki/Yaakov_ben_Moshe_Levi_Moelin) of calculating
     * {@link Molad.getSofZmanKidushLevanaBetweenMoldos | half way between molad and molad} is of the opinion that Mechaber
     * agrees to his opinion. Also see the Aruch Hashulchan. For additional details on the subject, See Rabbi Dovid
     * Heber's very detailed writeup in Siman Daled (chapter 4) of
     * [Shaarei Zmanim](https://www.worldcat.org/oclc/461326125). This method returns the time even if it is during
     * the day when _Kiddush Levana_ can't be said. Callers of this method should consider displaying _alos_
     * before this time if the zman is between _alos_ and _tzais_.
     *
     * @return the Temporal.ZonedDateTime representing the moment 15 days after the molad.
     */
    getSofZmanKidushLevana15Days() {
        const zdt = this.getInstant();
        // 15 days after the molad. Add it as hours, not days, to avoid DST/ST crossover issues.
        return zdt.add({ hours: 24 * 15 });
    }
    /**
     * Returns a human-readable, localized string announcing the molad —
     * suitable for use on Shabbat Mevarchim. The format includes the Hebrew
     * month name, day of week, hour : minute, and chalakim if non-zero.
     *
     * Time format honors `options.hour12` and `options.location` (12-hour vs.
     * 24-hour); see {@link reformatTimeStr}.
     * @example
     * import {Molad, months} from '@hebcal/core';
     * const m = new Molad(5784, months.NISAN);
     * m.render('en', {hour12: true});
     * // => 'Molad Nisan: Monday, 10:57pm and 7 chalakim'
     * m.render('en', {hour12: false});
     * // => 'Molad Nisan: Monday, 22:57 and 7 chalakim'
     * m.render('he');
     * // => 'מוֹלָד הָלְּבָנָה נִיסָן יִהְיֶה בַּיּוֹם שֵׁנִי בשָׁבוּעַ, …'
     * @param [locale] Optional locale name (defaults to empty locale)
     * @param options used for time formatting (12-hour vs 24-hour)
     */
    render(locale, options) {
        const monthName = Locale.gettext(this.getMonthName(), locale);
        const dayNames = getDayNames(locale);
        const dow = dayNames[this.getDow()];
        const minutes = this.getMinutes();
        const hour = this.getHour();
        const chalakim = this.getChalakim();
        const moladStr = Locale.gettext('Molad', locale);
        const minutesStr = Locale.lookupTranslation('min', locale) ?? 'minutes';
        const chalakimStr = Locale.gettext('chalakim', locale);
        const and = Locale.gettext('and', locale);
        if (Locale.isHebrewLocale(locale)) {
            const ampm = getHebrewTimeOfDay(hour);
            let result = `${moladStr} ${monthName} יִהְיֶה בַּיּוֹם ${dow} בשָׁבוּעַ, ` +
                `בְּשָׁעָה ${hour} ${ampm}, ` +
                `ו-${minutes} ${minutesStr}`;
            if (chalakim !== 0) {
                result += ` ו-${chalakim} ${chalakimStr}`;
            }
            if (locale.toLocaleLowerCase() === 'he-x-nonikud') {
                return Locale.hebrewStripNikkud(result);
            }
            return result;
        }
        const fmtTime = reformatTimeStr(`${hour}:${pad2(minutes)}`, 'pm', options);
        const month = smartApostrophe(monthName);
        const result = `${moladStr} ${month}: ${dow}, ${fmtTime}`;
        if (chalakim === 0) {
            return result;
        }
        return result + ` ${and} ${chalakim} ${chalakimStr}`;
    }
}
/** Represents a Molad announcement on Shabbat Mevarchim */
class MoladEvent extends Event {
    /**
     * @param date Hebrew date event occurs
     * @param hyear molad year
     * @param hmonth molad month
     * @param options
     */
    constructor(date, hyear, hmonth, options) {
        const m = new Molad(hyear, hmonth);
        const monthName = m.getMonthName();
        super(date, `Molad ${monthName} ${hyear}`, flags.MOLAD);
        this.molad = m;
        this.options = options;
    }
    /**
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    render(locale) {
        return this.molad.render(locale, this.options);
    }
}

/**
 * Converts an instant to a `Date`, discarding milliseconds.
 *
 * Zmanim are read out to the minute, and every accessor here reduces to an
 * instant, so we ask `@hebcal/noaa` for epoch milliseconds rather than a
 * `Temporal.ZonedDateTime`. Resolving the IANA zone to build a
 * `ZonedDateTime` costs roughly 750ns and nothing downstream uses it, which
 * made it the single most expensive step in a sunrise/sunset calculation.
 * @private
 */
function millisToDate(millis) {
    const res = new Date(millis);
    res.setMilliseconds(0);
    return res;
}
/**
 * The zenith of astronomical sunrise and sunset. The sun is 90° from the vertical 0°
 */
const GEOMETRIC_ZENITH = 90;
/**
 * The zenith of 1.583° below geometric zenith (90°). This calculation is used for
 * calculating _netz amiti_ (sunrise) and _shkiah amiti_ (sunset) based on the opinion of the
 * [Baal Hatanya](https://en.wikipedia.org/wiki/Shneur_Zalman_of_Liadi).
 *
 * @see Zmanim.sunriseBaalHatanya
 * @see Zmanim.sunsetBaalHatanya
 */
const ZENITH_1_POINT_583 = GEOMETRIC_ZENITH + 1.583;
/**
 * The zenith of civil twilight; the sun is 6° below the horizon.
 * Matches `NOAACalculator.CIVIL_ZENITH`.
 */
const CIVIL_ZENITH = GEOMETRIC_ZENITH + 6;
/**
 * Length of one temporal (halachic) hour in milliseconds, i.e. one twelfth of
 * the day. Mirrors `NOAACalculator.getTemporalHour()`, including its floor, so
 * that results stay identical to the `ZonedDateTime` code path.
 * @private
 */
function temporalHourMillis(startOfDay, endOfDay) {
    return Math.floor((endOfDay - startOfDay) / 12);
}
/**
 * Calculate halachic times (zmanim / זְמַנִּים) for a given day and location.
 * Calculations are available for tzeit / tzais (nightfall),
 * shkiah (sunset) and more.
 *
 * Zmanim are estimated using an algorithm published by the US National Oceanic
 * and Atmospheric Administration. The NOAA solar calculator is based on equations
 * from _Astronomical Algorithms_ by Jean Meeus.
 *
 * The sunrise and sunset results are theoretically accurate to within a minute for
 * locations between +/- 72° latitude, and within 10 minutes outside of those latitudes.
 * However, due to variations in atmospheric composition, temperature, pressure and
 * conditions, observed values may vary from calculations.
 * https://gml.noaa.gov/grad/solcalc/calcdetails.html
 *
 * @example
 * import {GeoLocation, Zmanim} from '@hebcal/core';
 * const latitude = 41.822232;
 * const longitude = -71.448292;
 * const tzid = 'America/New_York';
 * const friday = new Date(2023, 8, 8);
 * const gloc = new GeoLocation(null, latitude, longitude, 0, tzid);
 * const zmanim = new Zmanim(gloc, friday, false);
 * const candleLighting = zmanim.sunsetOffset(-18, true);
 * const timeStr = Zmanim.formatISOWithTimeZone(tzid, candleLighting);
 * // '2023-09-08T18:49:00-04:00'
 */
class Zmanim {
    /**
     * Initialize a Zmanim instance.
     * @param gloc GeoLocation including latitude, longitude, and timezone
     * @param date Regular or Hebrew Date. If `date` is a regular `Date`,
     *    hours, minutes, seconds and milliseconds are ignored.
     * @param useElevation use elevation for calculations (default `false`).
     *    If `true`, use elevation to affect the calculation of all sunrise/sunset based
     *    zmanim. Note: there are some zmanim such as degree-based zmanim that are driven
     *    by the amount of light in the sky and are not impacted by elevation.
     *    These zmanim intentionally do not support elevation adjustment.
     */
    constructor(gloc, date, useElevation) {
        this.hdate = new HDate(date);
        const dt = isDate(date) ? date : this.hdate.greg();
        // The constructor is ~1.8x cheaper than PlainDate.from(), which has to
        // walk a property bag and apply overflow handling. The fields come from a
        // real Date, so they are always in range and never need constraining.
        this.plainDate = new Temporal.PlainDate(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
        this.gloc = gloc;
        this.noaa = new NOAACalculator(gloc, this.plainDate);
        this.useElevation = Boolean(useElevation);
    }
    /**
     * Returns `true` if this instance uses the location's elevation when
     * calculating sunrise/sunset-based zmanim.
     */
    getUseElevation() {
        return this.useElevation;
    }
    /**
     * Enables or disables elevation adjustment for sunrise/sunset-based zmanim.
     *
     * Degree-based zmanim (such as {@link alotHaShachar} or {@link tzeit})
     * estimate the amount of light in the sky and are never affected by this
     * setting.
     * @param useElevation `true` to include the location's elevation
     */
    setUseElevation(useElevation) {
        this.useElevation = useElevation;
    }
    /**
     * Convenience function to get the time when sun is above or below the horizon
     * for a certain angle (in degrees).
     * This function does not support elevation adjustment.
     * @param angle degrees of solar depression below the horizon; for example
     *  `8.5` means the center of the sun is 8.5° below the horizon
     * @param rising `true` for the morning (before sunrise), `false` for the
     *  evening (after sunset)
     */
    timeAtAngle(angle, rising) {
        const offsetZenith = GEOMETRIC_ZENITH + angle;
        return millisToDate(rising
            ? this.sunriseMillis(offsetZenith, true)
            : this.sunsetMillis(offsetZenith, true));
    }
    /**
     * Sunrise for a given zenith as epoch milliseconds, mirroring what
     * `NOAACalculator.getSunrise()` / `getSeaLevelSunrise()` /
     * `getSunriseOffsetByDegrees()` compute, minus the `ZonedDateTime`.
     *
     * Note that noaa's degree-based accessors pass `adjustForElevation = true`
     * as well; the adjustment is a no-op unless the zenith is exactly
     * {@link GEOMETRIC_ZENITH}, which is why degree-based zmanim are unaffected
     * by elevation.
     * @private
     */
    sunriseMillis(zenith, useElevation) {
        const utc = useElevation
            ? this.noaa.getUTCSunrise0(zenith)
            : this.noaa.getUTCSeaLevelSunrise(zenith);
        return this.noaa.getEpochMillisFromTime(utc, true);
    }
    /**
     * Sunset counterpart of {@link sunriseMillis}.
     * @private
     */
    sunsetMillis(zenith, useElevation) {
        const utc = useElevation
            ? this.noaa.getUTCSunset0(zenith)
            : this.noaa.getUTCSeaLevelSunset(zenith);
        return this.noaa.getEpochMillisFromTime(utc, false);
    }
    /**
     * Upper edge of the Sun appears over the eastern horizon in the morning (0.833° above horizon)
     * If elevation is enabled, this function will include elevation in the calculation.
     */
    sunrise() {
        return millisToDate(this.sunriseMillis(GEOMETRIC_ZENITH, this.useElevation));
    }
    /**
     * Upper edge of the Sun appears over the eastern horizon in the morning (0.833° above horizon).
     * This function does not support elevation adjustment.
     */
    seaLevelSunrise() {
        return millisToDate(this.sunriseMillis(GEOMETRIC_ZENITH, false));
    }
    /**
     * When the upper edge of the Sun disappears below the horizon (0.833° below horizon).
     * If elevation is enabled, this function will include elevation in the calculation.
     */
    sunset() {
        return millisToDate(this.sunsetMillis(GEOMETRIC_ZENITH, this.useElevation));
    }
    /**
     * When the upper edge of the Sun disappears below the horizon (0.833° below horizon).
     * This function does not support elevation adjustment.
     */
    seaLevelSunset() {
        return millisToDate(this.sunsetMillis(GEOMETRIC_ZENITH, false));
    }
    /**
     * Civil dawn; Sun is 6° below the horizon in the morning.
     * Because degree-based functions estimate the amount of light in the sky,
     * the result is not impacted by elevation.
     */
    dawn() {
        return millisToDate(this.sunriseMillis(CIVIL_ZENITH, true));
    }
    /**
     * Civil dusk; Sun is 6° below the horizon in the evening.
     * Because degree-based functions estimate the amount of light in the sky,
     * the result is not impacted by elevation.
     */
    dusk() {
        return millisToDate(this.sunsetMillis(CIVIL_ZENITH, true));
    }
    /**
     * Returns sunset for the previous day.
     * If elevation is enabled, this function will include elevation in the calculation.
     */
    gregEve() {
        const prev0 = this.plainDate.subtract({ days: 1 });
        const prev = new Date(prev0.year, prev0.month - 1, prev0.day);
        const zman = new Zmanim(this.gloc, prev, this.useElevation);
        return zman.sunset();
    }
    /**
     * Length in milliseconds of one halachic hour of the night, calculated as
     * one twelfth of the time between the previous day's sunset and this
     * day's sunrise. Used internally by {@link chatzotNight}.
     */
    nightHour() {
        return (this.sunrise().getTime() - this.gregEve().getTime()) / 12; // ms in hour
    }
    /**
     * Midday – Chatzot; Sunrise plus 6 halachic hours.
     *
     * Unlike most sunrise/sunset-based zmanim, this is always computed from
     * sea-level sunrise and sunset, so it is not affected by the
     * `useElevation` setting.
     */
    chatzot() {
        const startOfDay = this.sunriseMillis(GEOMETRIC_ZENITH, false);
        const endOfDay = this.sunsetMillis(GEOMETRIC_ZENITH, false);
        // NOAACalculator.getSunTransit(): sunrise plus 6 temporal hours
        return millisToDate(startOfDay + temporalHourMillis(startOfDay, endOfDay) * 6);
    }
    /**
     * Midnight – Chatzot; Sunset plus 6 halachic hours.
     * If elevation is enabled, this function will include elevation in the calculation.
     */
    chatzotNight() {
        return new Date(this.sunrise().getTime() - this.nightHour() * 6);
    }
    /**
     * Dawn – Alot haShachar; Sun is 16.1° below the horizon in the morning.
     * Because degree-based functions estimate the amount of light in the sky,
     * the result is not impacted by elevation.
     */
    alotHaShachar() {
        return this.timeAtAngle(16.1, true);
    }
    /**
     * Dawn – Alot haShachar; calculated as 72 minutes before sunrise or
     * sea level sunrise.
     */
    alotHaShachar72() {
        return this.sunriseOffset(-72, false, false);
    }
    /**
     * Same as {@link alotHaShachar72}, but returns a `Temporal.ZonedDateTime`
     * with seconds precision (instead of a `Date` rounded to the minute), or
     * `null` if sunrise cannot be calculated for this date and location.
     */
    alotHaShachar72zdt() {
        const zdt = this.useElevation
            ? this.noaa.getSunrise()
            : this.noaa.getSeaLevelSunrise();
        if (!zdt) {
            return null;
        }
        return zdt.subtract({ minutes: 72 });
    }
    /**
     * Earliest talis & tefillin – Misheyakir; Sun is 11.5° below the horizon in the morning.
     * Because degree-based functions estimate the amount of light in the sky,
     * the result is not impacted by elevation.
     */
    misheyakir() {
        return this.timeAtAngle(11.5, true);
    }
    /**
     * Earliest talis & tefillin – Misheyakir Machmir; Sun is 10.2° below the horizon in the morning.
     * Because degree-based functions estimate the amount of light in the sky,
     * the result is not impacted by elevation.
     */
    misheyakirMachmir() {
        return this.timeAtAngle(10.2, true);
    }
    getShaahZmanisBasedZmanMillis(startOfDay, endOfDay, hours) {
        const offset = Math.trunc(temporalHourMillis(startOfDay, endOfDay) * hours);
        return startOfDay + offset;
    }
    /**
     * Utility method for using elevation-aware sunrise/sunset
     * @param hours number of _shaos zmaniyos_ (solar hours) after sunrise
     */
    getShaahZmanisBasedZman(hours) {
        const startOfDay = this.sunriseMillis(GEOMETRIC_ZENITH, this.useElevation);
        const endOfDay = this.sunsetMillis(GEOMETRIC_ZENITH, this.useElevation);
        return millisToDate(this.getShaahZmanisBasedZmanMillis(startOfDay, endOfDay, hours));
    }
    /**
     * Latest Shema (Gra); Sunrise plus 3 halachic hours, according to the Gra.
     * If elevation is enabled, this function will include elevation in the calculation.
     */
    sofZmanShma() {
        // Gra
        return this.getShaahZmanisBasedZman(3);
    }
    /**
     * Latest Shacharit (Gra); Sunrise plus 4 halachic hours, according to the Gra.
     *
     * This method returns the latest *zman tfila* (time to recite the morning prayers)
     * that is 4 *shaos zmaniyos* (solar hours) after sunrise or sea level sunrise
     * (depending on the `useElevation` setting), according
     * to the [GRA](https://en.wikipedia.org/wiki/Vilna_Gaon).
     *
     * If elevation is enabled, this function will include elevation in the calculation.
     */
    sofZmanTfilla() {
        // Gra
        return this.getShaahZmanisBasedZman(4);
    }
    /**
     * This method returns the latest time for burning _chametz_ on _Erev Pesach_ according to the opinion
     * of the [GRA](https://en.wikipedia.org/wiki/Vilna_Gaon). This time is 5 halachic hours into the day, based on
     * the opinion of the GRA that the day is calculated from sunrise to sunset.
     *
     * If elevation is enabled, this function will include elevation in the calculation.
     * @return the `Date` of the latest time for burning _chametz_ on _Erev Pesach_. If the calculation can't be
     *         computed, such as in the Arctic Circle where there is at least one day a year where the sun does not
     *         rise and one where it does not set, an `Invalid Date` will be returned.
     */
    sofZmanBiurChametzGRA() {
        return this.getShaahZmanisBasedZman(5);
    }
    /**
     * Returns a 2-element array with alot (a `Date`, 72 minutes before sunrise)
     * and the length in milliseconds of one halachic hour of the resulting day.
     * Used internally by the Magen Avraham zmanim.
     * @param forceSeaLevel ignore the `useElevation` setting and use sea-level
     *  sunrise and sunset
     */
    getTemporalHour72(forceSeaLevel) {
        const alot72 = this.sunriseOffset(-72, false, forceSeaLevel);
        const tzeit72 = this.sunsetOffset(72, false, forceSeaLevel);
        const temporalHour = (tzeit72.getTime() - alot72.getTime()) / 12;
        return [alot72, temporalHour];
    }
    /**
     * Returns a 2-element array with alot (a `Date`, when the sun is `angle`
     * degrees below the horizon in the morning) and the length in milliseconds
     * of one halachic hour of the resulting day. Used internally by the
     * degree-based Magen Avraham zmanim.
     * @param angle degrees of solar depression below the horizon
     */
    getTemporalHourByDeg(angle) {
        const alot = this.timeAtAngle(angle, true);
        const tzeit = this.timeAtAngle(angle, false);
        const temporalHour = (tzeit.getTime() - alot.getTime()) / 12;
        return [alot, temporalHour];
    }
    /**
     * Latest Shema (MGA); Sunrise plus 3 halachic hours, according to Magen Avraham.
     * Based on the opinion of the MGA that the day is calculated from
     * dawn being fixed 72 minutes before sea-level sunrise, and nightfall is fixed
     * 72 minutes after sea-level sunset.
     */
    sofZmanShmaMGA() {
        // Magen Avraham
        const [alot72, temporalHour] = this.getTemporalHour72(true);
        const offset = Math.floor(3 * temporalHour);
        return new Date(alot72.getTime() + offset);
    }
    /**
     * Latest Shema (MGA); Sunrise plus 3 halachic hours, according to Magen Avraham.
     * Based on the opinion of the MGA that the day is calculated from
     * dawn to nightfall with both being 16.1° below the horizon.
     */
    sofZmanShmaMGA16Point1() {
        const [alot, temporalHour] = this.getTemporalHourByDeg(16.1);
        const offset = Math.floor(3 * temporalHour);
        return new Date(alot.getTime() + offset);
    }
    /**
     * Latest Shema (MGA); Sunrise plus 3 halachic hours, according to Magen Avraham.
     * Based on the opinion of the MGA that the day is calculated from
     * dawn to nightfall with both being 19.8° below the horizon.
     *
     * This calculation is based on the position of the sun 90 minutes after sunset in Jerusalem
     * around the equinox / equilux which calculates to 19.8° below geometric zenith.
     * https://kosherjava.com/2022/01/12/equinox-vs-equilux-zmanim-calculations/
     */
    sofZmanShmaMGA19Point8() {
        const [alot, temporalHour] = this.getTemporalHourByDeg(19.8);
        const offset = Math.floor(3 * temporalHour);
        return new Date(alot.getTime() + offset);
    }
    /**
     * Latest Shacharit (MGA); Sunrise plus 4 halachic hours, according to Magen Avraham
     */
    sofZmanTfillaMGA() {
        // Magen Avraham
        const [alot72, temporalHour] = this.getTemporalHour72(true);
        const offset = Math.floor(4 * temporalHour);
        return new Date(alot72.getTime() + offset);
    }
    /**
     * Latest Shacharit (MGA); Sunrise plus 4 halachic hours, according to Magen Avraham.
     * Based on the opinion of the MGA that the day is calculated from
     * dawn to nightfall with both being 16.1° below the horizon.
     */
    sofZmanTfillaMGA16Point1() {
        const [alot, temporalHour] = this.getTemporalHourByDeg(16.1);
        const offset = Math.floor(4 * temporalHour);
        return new Date(alot.getTime() + offset);
    }
    /**
     * Latest Shacharit (MGA); Sunrise plus 4 halachic hours, according to Magen Avraham.
     * Based on the opinion of the MGA that the day is calculated from
     * dawn to nightfall with both being 19.8° below the horizon.
     *
     * This calculation is based on the position of the sun 90 minutes after sunset in Jerusalem
     * around the equinox / equilux which calculates to 19.8° below geometric zenith.
     * https://kosherjava.com/2022/01/12/equinox-vs-equilux-zmanim-calculations/
     */
    sofZmanTfillaMGA19Point8() {
        const [alot, temporalHour] = this.getTemporalHourByDeg(19.8);
        const offset = Math.floor(4 * temporalHour);
        return new Date(alot.getTime() + offset);
    }
    /**
     * Earliest Mincha – Mincha Gedola (GRA); Sunrise plus 6.5 halachic hours.
     * If elevation is enabled, this function will include elevation in the calculation.
     *
     * This method returns *mincha gedola*, the earliest time one can pray mincha,
     * that is 6.5 shaos zmaniyos (solar hours) after sunrise or sea level sunrise
     * (depending on the `useElevation` setting), according
     * to the [GRA](https://en.wikipedia.org/wiki/Vilna_Gaon).
     *
     * The Ramba"m is of the opinion that it is better to delay *mincha* until
     * *mincha ketana* while the Ra"sh, Tur, GRA and others are of the
     * opinion that *mincha* can be prayed *lechatchila* starting at *mincha gedola*.
     */
    minchaGedola() {
        return this.getShaahZmanisBasedZman(6.5);
    }
    /**
     * Earliest Mincha – Mincha Gedola (MGA); Sunrise plus 6.5 halachic hours.
     * If elevation is enabled, this function will include elevation in the calculation.
     *
     * This method returns the time of *mincha gedola* according to the Magen Avraham
     * with the day starting 72 minutes before sunrise and ending 72 minutes after sunset.
     * This is the earliest time to pray *mincha*.
     */
    minchaGedolaMGA() {
        const [alot72, temporalHour] = this.getTemporalHour72(false);
        const offset = Math.floor(6.5 * temporalHour);
        return new Date(alot72.getTime() + offset);
    }
    /**
     * Preferable earliest time to recite Minchah – Mincha Ketana; Sunrise plus 9.5 halachic hours.
     * If elevation is enabled, this function will include elevation in the calculation.
     *
     * This method returns *mincha ketana*, the preferred earliest time to pray *mincha* in the
     * opinion of the [Rambam](https://en.wikipedia.org/wiki/Maimonides) and others,
     * that is 9.5 *shaos zmaniyos* (solar hours) after sunrise or sea level sunrise
     * (depending on the `useElevation` setting), according
     * to the [GRA](https://en.wikipedia.org/wiki/Vilna_Gaon).
     */
    minchaKetana() {
        return this.getShaahZmanisBasedZman(9.5);
    }
    /**
     * This method returns the time of *mincha ketana* according to the Magen Avraham
     * with the day starting 72 minutes before sunrise and ending 72 minutes after sunset.
     * This is the preferred earliest time to pray *mincha* according to the opinion of
     * the [Rambam](https://en.wikipedia.org/wiki/Maimonides) and others.
     *
     * If elevation is enabled, this function will include elevation in the calculation.
     */
    minchaKetanaMGA() {
        const [alot72, temporalHour] = this.getTemporalHour72(false);
        return new Date(alot72.getTime() + Math.floor(9.5 * temporalHour));
    }
    /**
     * Plag haMincha; Sunrise plus 10.75 halachic hours.
     * If elevation is enabled, this function will include elevation in the calculation.
     */
    plagHaMincha() {
        return this.getShaahZmanisBasedZman(10.75);
    }
    /**
     * Nightfall – Tzeit HaKochavim; the sun is `angle` degrees below the
     * horizon in the evening.
     *
     * Because degree-based functions estimate the amount of light in the sky,
     * the result is not impacted by elevation.
     * @param [angle=8.5] optional time for solar depression.
     *   Default is 8.5 degrees for 3 small stars, use 7.083 degrees for 3 medium-sized stars.
     */
    tzeit(angle = 8.5) {
        return this.timeAtAngle(angle, false);
    }
    /**
     * Nightfall – Tzeit HaKochavim; calculated as 72 minutes after sunset
     * (or sea-level sunset, depending on the `useElevation` setting).
     *
     * Returns a `Temporal.ZonedDateTime` with seconds precision, or `null` if
     * sunset cannot be calculated for this date and location.
     */
    tzeit72() {
        const zdt = this.useElevation
            ? this.noaa.getSunset()
            : this.noaa.getSeaLevelSunset();
        if (!zdt) {
            return null;
        }
        return zdt.add({ minutes: 72 });
    }
    /**
     * Alias for sunrise
     */
    neitzHaChama() {
        return this.sunrise();
    }
    /**
     * Alias for sunset
     */
    shkiah() {
        return this.sunset();
    }
    /**
     * Rabbeinu Tam holds that bein hashmashos is a specific time
     * between sunset and tzeis hakochavim.
     * One opinion on how to calculate this time is that
     * it is 13.5 minutes before tzies 7.083.
     * Because degree-based functions estimate the amount of light in the sky,
     * the result is not impacted by elevation.
     */
    beinHaShmashos() {
        const tzeit = this.tzeit(7.083);
        const millis = tzeit.getTime();
        if (isNaN(millis)) {
            return tzeit;
        }
        return new Date(millis - 13.5 * 60 * 1000);
    }
    /**
     * Used by Molad based _zmanim_ to determine if _zmanim_ occur during the current day.
     * @return previous midnight
     */
    getMidnightLastNight() {
        // reset hour, minutes, seconds and millis
        return this.plainDate.toZonedDateTime({
            timeZone: this.gloc.getTimeZone(),
        });
    }
    /**
     * Used by Molad based _zmanim_ to determine if _zmanim_ occur during the current day.
     * @return following midnight
     */
    getMidnightTonight() {
        return this.plainDate.add({ days: 1 }).toZonedDateTime({
            timeZone: this.gloc.getTimeZone(),
        });
    }
    /**
     * Returns the Date of the _molad_ based time if it occurs on the current date. Since _Kiddush Levana_
     * can only be said during the day, there are parameters to limit it to between _alos_ and _tzais_. If
     * the time occurs between _alos_ and _tzais_, _tzais_ will be returned.
     *
     * @param moladBasedTime
     *            the _molad_ based time such as _molad_, _tchilas_ and _sof zman Kiddush Levana_
     * @param alos
     *            optional start of day to limit _molad_ times to the end of the night before or beginning of the next night.
     *            Ignored if either _alos_ or _tzais_ are null.
     * @param tzais
     *            optional end of day to limit _molad_ times to the end of the night before or beginning of the next night.
     *            Ignored if either _tzais_ or _alos_ are null
     * @param techila
     *            is it the start of _Kiddush Levana_ time or the end? If it is start roll it to the next _tzais_,
     *            and if it is the end, return the end of the previous night (_alos_ passed in). Ignored if either
     *            _alos_ or _tzais_ are null.
     * @return the _molad_ based time. If the _zman_ does not occur during the current date, `null` will be
     *         returned.
     */
    getMoladBasedTime(moladBasedTime, alos, tzais, techila) {
        const lastMidnight = this.getMidnightLastNight();
        const midnightTonight = this.getMidnightTonight();
        if (Temporal.ZonedDateTime.compare(moladBasedTime, lastMidnight) < 0 ||
            Temporal.ZonedDateTime.compare(moladBasedTime, midnightTonight) > 0) {
            return null; // Invalid time, bailout
        }
        if (alos === null || tzais === null) {
            return moladBasedTime.withTimeZone(this.gloc.getTimeZone()); // Not enough info to adjust
        }
        if (Temporal.ZonedDateTime.compare(moladBasedTime, alos) > 0 &&
            Temporal.ZonedDateTime.compare(moladBasedTime, tzais) < 0) {
            // It's the daytime (after alos but before tzais)
            // get the next/prev night
            return techila ? tzais : alos;
        }
        // It's the night, the provided time is valid
        return moladBasedTime.withTimeZone(this.gloc.getTimeZone());
    }
    /**
     * Returns the latest time of Kiddush Levana according to the
     * [Maharil's](https://en.wikipedia.org/wiki/Yaakov_ben_Moshe_Levi_Moelin) opinion that it is calculated as
     * halfway between _molad_ and _molad_. This adds half the 29 days, 12 hours and 793 chalakim time between
     * _molad_ and _molad_ (14 days, 18 hours, 22 minutes and 666 milliseconds) to the month's _molad_.
     *
     * The _sof zman Kiddush Levana_ will be returned even if it occurs during the day, unless both `alos` and
     * `tzais` are supplied.
     *
     * @param alos
     *            the beginning of the Jewish day. If _Kidush Levana_ occurs during the day (starting at _alos_ and
     *            ending at _tzais_), the time returned will be alos. If either the _alos_ or _tzais_ parameters
     *            are null, no daytime adjustment will be made.
     * @param tzais
     *            the end of the Jewish day. If Kidush Levana occurs during the day (starting at alos and ending at
     *            tzais), the time returned will be alos. If either the alos or tzais parameters are null, no daytime
     *            adjustment will be made.
     * @return the `Temporal.ZonedDateTime` representing the moment halfway between molad and molad. If the time
     *         occurs between _alos_ and _tzais_, _alos_ will be returned. If the _zman_ will not occur on this
     *         day, `null` will be returned.
     */
    getSofZmanKidushLevanaBetweenMoldos(alos = null, tzais = null) {
        const hd = this.hdate;
        // Do not calculate for impossible dates, but account for extreme cases. In the extreme case of Rapa Iti in French
        // Polynesia on Dec 2027 when kiddush Levana 3 days can be said on _Rosh Chodesh_, the sof zman Kiddush Levana
        // will be on the 12th of the Teves. In the case of Anadyr, Russia on Jan, 2071, sof zman Kiddush Levana between the
        // moldos will occur is on the night of 17th of Shevat. See Rabbi Dovid Heber's Shaarei Zmanim chapter 4 (pages 28 and 32).
        if (hd.getDate() < 11 || hd.getDate() > 16) {
            return null;
        }
        const molad = new Molad(hd.getFullYear(), hd.getMonth());
        return this.getMoladBasedTime(molad.getSofZmanKidushLevanaBetweenMoldos(), alos, tzais, false);
    }
    /**
     * Returns the latest time of _Kiddush Levana_ calculated as 15 days after the molad. This is the opinion of
     * the Shulchan Aruch (Orach Chaim 426). It should be noted that some opinions hold that the
     * [Rema](https://en.wikipedia.org/wiki/Moses_Isserles), who brings down the opinion of the
     * [Maharil](https://en.wikipedia.org/wiki/Yaakov_ben_Moshe_Levi_Moelin) of calculating
     * {@link getSofZmanKidushLevanaBetweenMoldos half way between _molad_ and _molad_}, is of
     * the opinion that the Mechaber agrees to his opinion. Also see the Aruch Hashulchan. For additional details on
     * the subject, see Rabbi Dovid Heber's very detailed write-up in Siman Daled (chapter 4) of
     * [Shaarei Zmanim](https://hebrewbooks.org/53000).
     *
     * The _sof zman Kiddush Levana_ will be returned even if it occurs during the day, unless both `alos` and
     * `tzais` are supplied.
     *
     * @param alos
     *            the beginning of the Jewish day. If either the _alos_ or _tzais_ parameters are null, no daytime
     *            adjustment will be made.
     * @param tzais
     *            the end of the Jewish day. If either the _alos_ or _tzais_ parameters are null, no daytime
     *            adjustment will be made.
     * @return the `Temporal.ZonedDateTime` representing the moment 15 days after the _molad_. If the time occurs
     *         between _alos_ and _tzais_, _alos_ will be returned. If the _zman_ will not occur on this day,
     *         `null` will be returned.
     */
    getSofZmanKidushLevana15Days(alos = null, tzais = null) {
        const hd = this.hdate;
        // Do not calculate for impossible dates, but account for extreme cases. In the extreme case of Rapa Iti in
        // French Polynesia on Dec 2027 when kiddush Levana 3 days can be said on _Rosh Chodesh_, the sof zman Kiddush
        // Levana will be on the 12th of the Teves. in the case of Anadyr, Russia on Jan, 2071, sof zman kiddush levana will
        // occur after midnight on the 17th of Shevat. See Rabbi Dovid Heber's Shaarei Zmanim chapter 4 (pages 28 and 32).
        if (hd.getDate() < 11 || hd.getDate() > 17) {
            return null;
        }
        const molad = new Molad(hd.getFullYear(), hd.getMonth());
        return this.getMoladBasedTime(molad.getSofZmanKidushLevana15Days(), alos, tzais, false);
    }
    /**
     * Returns the earliest time of _Kiddush Levana_ according to
     * [Rabbeinu Yonah](https://en.wikipedia.org/wiki/Yonah_Gerondi)'s opinion that it can be said 3 days after the _molad_.
     * If the time of _tchilas zman Kiddush Levana_ occurs during the day (between _alos_ and _tzais_ passed to
     * this method) it will return the following _tzais_. If null is passed for either _alos_ or _tzais_, the actual
     * _tchilas zman Kiddush Levana_ will be returned, regardless of if it is during the day or not.
     *
     * @param alos
     *            the beginning of the Jewish day. If Kidush Levana occurs during the day (starting at _alos_ and ending
     *            at _tzais_), the time returned will be _tzais_. If either the _alos_ or _tzais_ parameters
     *            are null, no daytime adjustment will be made.
     * @param tzais
     *            the end of the Jewish day. If _Kidush Levana_ occurs during the day (starting at _alos_ and ending at
     *            _tzais_), the time returned will be _tzais_. If either the _alos_ or _tzais_ parameters
     *            are null, no daytime adjustment will be made.
     *
     * @return the `Temporal.ZonedDateTime` representing the moment 3 days after the molad. If the time occurs
     *         between _alos_ and _tzais_, _tzais_ will be returned. If the _zman_ will not occur on this day,
     *         `null` will be returned.
     */
    getTchilasZmanKidushLevana3Days(alos = null, tzais = null) {
        const hd = this.hdate;
        // Do not calculate for impossible dates, but account for extreme cases. Tchilas zman kiddush Levana 3 days for
        // the extreme case of Rapa Iti in French Polynesia on Dec 2027 when kiddush Levana 3 days can be said on the evening
        // of the 30th, the second night of Rosh Chodesh. The 3rd day after the _molad_ will be on the 4th of the month.
        // In the case of Anadyr, Russia on Jan, 2071, when sof zman kiddush levana is on the 17th of the month, the 3rd day
        // from the molad will be on the 5th day of Shevat. See Rabbi Dovid Heber's Shaarei Zmanim chapter 4 (pages 28 and 32).
        if (hd.getDate() > 5 && hd.getDate() < 30) {
            return null;
        }
        const molad = new Molad(hd.getFullYear(), hd.getMonth());
        let zman = this.getMoladBasedTime(molad.getTchilasZmanKidushLevana3Days(), alos, tzais, true);
        // Get the following month's zman kiddush Levana for the extreme case of Rapa Iti in French Polynesia on Dec 2027 when
        // kiddush Levana can be said on Rosh Chodesh (the evening of the 30th). See Rabbi Dovid Heber's Shaarei Zmanim chapter 4 (page 32)
        if (zman === null && hd.getDate() === 30) {
            const hd2 = hd.add(1, 'week');
            const molad2 = new Molad(hd2.getFullYear(), hd2.getMonth());
            zman = this.getMoladBasedTime(molad2.getTchilasZmanKidushLevana3Days(), null, null, true);
        }
        return zman;
    }
    /**
     * Returns the point in time of the _Molad_, if it occurs on this date. For the traditional day of week, hour,
     * minute and chalakim, see {@link Molad} and its {@link Molad.render} method.
     *
     * @return the `Temporal.ZonedDateTime` representing the moment of the molad. If the _molad_ does not occur on
     *         this day, `null` will be returned.
     */
    getZmanMolad() {
        const hd = this.hdate;
        // Optimize to not calculate for impossible dates, but account for extreme cases. The molad in the extreme case of Rapa
        // Iti in French Polynesia on Dec 2027 occurs on the night of the 27th of Kislev. In the case of Anadyr, Russia on
        // Jan 2071, the molad will be on the 2nd day of Shevat. See Rabbi Dovid Heber's Shaarei Zmanim chapter 4 (pages 28 and 32).
        if (hd.getDate() > 2 && hd.getDate() < 27) {
            return null;
        }
        const molad = new Molad(hd.getFullYear(), hd.getMonth());
        let zman = this.getMoladBasedTime(molad.getInstant(), null, null, true);
        // deal with molad that happens on the end of the previous month
        if (zman === null && hd.getDate() > 26) {
            const hd2 = hd.add(1, 'week');
            const molad2 = new Molad(hd2.getFullYear(), hd2.getMonth());
            zman = this.getMoladBasedTime(molad2.getInstant(), null, null, true);
        }
        return zman;
    }
    /**
     * Returns the earliest time of _Kiddush Levana_ according to the opinions that it should not be said until 7
     * days after the _molad_. The time will be returned even if it occurs during the day when _Kiddush Levana_
     * can't be recited, unless both `alos` and `tzais` are supplied.
     *
     * @param alos
     *            the beginning of the Jewish day. If _Kidush Levana_ occurs during the day (starting at _alos_ and
     *            ending at _tzais_), the time returned will be _tzais_. If either the _alos_ or _tzais_ parameters
     *            are null, no daytime adjustment will be made.
     * @param tzais
     *            the end of the Jewish day. If either the _alos_ or _tzais_ parameters are null, no daytime
     *            adjustment will be made.
     * @return the `Temporal.ZonedDateTime` representing the moment 7 days after the molad. If the _zman_
     *         will not occur on this day, `null` will be returned.
     */
    getTchilasZmanKidushLevana7Days(alos = null, tzais = null) {
        const hd = this.hdate;
        // Optimize to not calculate for impossible dates, but account for extreme cases. Tchilas zman kiddush Levana 7 days for
        // the extreme case of Rapa Iti in French Polynesia on Jan 2028 (when kiddush Levana 3 days can be said on the evening
        // of the 30th, the second night of Rosh Chodesh), the 7th day after the molad will be on the 4th of the month.
        // In the case of Anadyr, Russia on Jan, 2071, when sof zman kiddush levana is on the 17th of the month, the 7th day
        // from the molad will be on the 9th day of Shevat. See Rabbi Dovid Heber's Shaarei Zmanim chapter 4 (pages 28 and 32).
        if (hd.getDate() < 4 || hd.getDate() > 9) {
            return null;
        }
        const molad = new Molad(hd.getFullYear(), hd.getMonth());
        return this.getMoladBasedTime(molad.getTchilasZmanKidushLevana7Days(), alos, tzais, true);
    }
    /**
     * A method that returns the [Baal Hatanya](https://en.wikipedia.org/wiki/Shneur_Zalman_of_Liadi)'s
     * _netz amiti_ (sunrise) without
     * elevation adjustment. This forms the base for the Baal Hatanya's dawn-based calculations that are
     * calculated as a dip below the horizon before sunrise.
     *
     * According to the Baal Hatanya, _netz amiti_, or true (halachic) sunrise, is when the top of the sun's
     * disk is visible at an elevation similar to the mountains of Eretz Yisrael. The time is calculated as the point at which
     * the center of the sun's disk is 1.583° below the horizon. This degree-based calculation can be found in Rabbi Shalom
     * DovBer Levine's commentary on
     * [The Baal Hatanya's Seder Hachnasas Shabbos](https://www.chabadlibrary.org/books/pdf/Seder-Hachnosas-Shabbos.pdf).
     * From an elevation of 546 meters, the top of [Har Hacarmel](https://en.wikipedia.org/wiki/Mount_Carmel),
     * the sun disappears when it is 1° 35' or 1.583° below the sea level horizon. This in turn is based on the Gemara
     * [Shabbos 35a](https://hebrewbooks.org/shas.aspx?mesechta=2&daf=35). There are other opinions brought down by
     * Rabbi Levine, including Rabbi Yosef Yitzchok Feigelstock who calculates it as the degrees below the horizon 4 minutes after
     * sunset in Yerushalayim (on the equinox). That is brought down as 1.583°. This is identical to the 1° 35' _zman_
     * and is probably a typo and should be 1.683°. These calculations are used by most
     * [Chabad](https://en.wikipedia.org/wiki/Chabad) calendars that use the Baal Hatanya's _zmanim_. See
     * [About Our Zmanim Calculations @ Chabad.org](https://www.chabad.org/library/article_cdo/aid/3209349/jewish/About-Our-Zmanim-Calculations.htm).
     *
     * Note: _netz amiti_ is used only for calculating certain _zmanim_, and is intentionally unpublished. For
     * practical purposes, daytime _mitzvos_ like _shofar_ and _lulav_ should not be done until after the
     * published time for _netz_ / sunrise.
     *
     * @return the exact sea level _netz amiti_ (sunrise) time. If the calculation can't be
     *         computed, such as in the Arctic Circle where there is at least one day a year where the sun does not rise, and one
     *         where it does not set, `null` will be returned.
     */
    getSunriseBaalHatanya() {
        return this.sunriseMillis(ZENITH_1_POINT_583, true);
    }
    /**
     * A method that returns the [Baal Hatanya](https://en.wikipedia.org/wiki/Shneur_Zalman_of_Liadi)'s
     * _shkiah amiti_ (sunset) without
     * elevation adjustment. This forms the base for the Baal Hatanya's dusk-based calculations that are calculated
     * as a dip below the horizon after sunset.
     *
     * According to the Baal Hatanya, _shkiah amiti_, true (_halachic_) sunset, is when the top of the
     * sun's disk disappears from view at an elevation similar to the mountains of _Eretz Yisrael_.
     * This time is calculated as the point at which the center of the sun's disk is 1.583 degrees below the horizon.
     *
     * Note: _shkiah amiti_ is used only for calculating certain _zmanim_, and is intentionally unpublished. For
     * practical purposes, all daytime mitzvos should be completed before the published time for _shkiah_ / sunset.
     *
     * For further explanation of the calculations used for the Baal Hatanya's _zmanim_ in this library, see
     * [About Our Zmanim Calculations @ Chabad.org](https://www.chabad.org/library/article_cdo/aid/3209349/jewish/About-Our-Zmanim-Calculations.htm).
     *
     * @return the exact sea level _shkiah amiti_ (sunset) time. If the calculation
     *         can't be computed, such as in the Arctic Circle where there is at least one day a year where the sun does not
     *         rise, and one where it does not set, `null` will be returned.
     */
    getSunsetBaalHatanya() {
        return this.sunsetMillis(ZENITH_1_POINT_583, true);
    }
    /**
     * Returns the [Baal Hatanya](https://en.wikipedia.org/wiki/Shneur_Zalman_of_Liadi)'s _alos_
     * (dawn) calculated as the time when the sun is 16.9° below the eastern geometric horizon
     * before {@link sunrise}.
     *
     * The zenith of 16.9° below is based on the calculation that the time between dawn
     * and _netz amiti_ (sunrise) is 72 minutes, the time that it takes to walk 4 mil at 18 minutes
     * a mil ([Rambam](https://en.wikipedia.org/wiki/Maimonides) and others). The sun's position at 72
     * minutes before _netz amiti_ (sunrise) in Jerusalem
     * [around the equinox / equilux](https://kosherjava.com/2022/01/12/equinox-vs-equilux-zmanim-calculations/)
     * is 16.9° below geometric zenith.
     *
     * @return the `Date` of dawn. If the calculation can't be computed, such as in northern and southern
     *         locations even south of the Arctic Circle and north of the Antarctic Circle where the sun may not reach
     *         low enough below the horizon for this calculation, an `Invalid Date` will be returned.
     */
    alosBaalHatanya() {
        return this.timeAtAngle(16.9, true);
    }
    getShaahZmanisBaalHatanya(hours) {
        return millisToDate(this.getShaahZmanisBasedZmanMillis(this.getSunriseBaalHatanya(), this.getSunsetBaalHatanya(), hours));
    }
    /**
     * This method returns the latest _zman krias shema_ (time to recite Shema in the morning). This time is 3
     * _shaos zmaniyos_ (solar hours) after _netz amiti_ (sunrise), based on the opinion of the Baal Hatanya
     * that the day is calculated from _netz amiti_ (sunrise) to _shkiah amiti_ (sunset).
     *
     * @return the `Date` of the latest _zman shema_ according to the Baal Hatanya. If the calculation
     *         can't be computed, such as in the Arctic Circle where there is at least one day a year where the sun does
     *         not rise and one where it does not set, an `Invalid Date` will be returned.
     */
    sofZmanShmaBaalHatanya() {
        return this.getShaahZmanisBaalHatanya(3);
    }
    /**
     * This method returns the latest _zman tfilah_ (time to recite the morning prayers). This time is 4
     * halachic hours into the day, based on the opinion of the Baal Hatanya that the day is
     * calculated from _netz amiti_ (sunrise) to _shkiah amiti_ (sunset).
     *
     * @return the `Date` of the latest _zman tfilah_. If the calculation can't be computed, such as in
     *         the Arctic Circle where there is at least one day a year where the sun does not rise and one where it does
     *         not set, an `Invalid Date` will be returned.
     */
    sofZmanTfilaBaalHatanya() {
        return this.getShaahZmanisBaalHatanya(4);
    }
    /**
     * This method returns the time of _mincha gedola_. _Mincha gedola_ is the earliest time one can pray
     * _mincha_. The [Rambam](https://en.wikipedia.org/wiki/Maimonides) is of the opinion that it is
     * better to delay _mincha_ until {@link minchaKetanaBaalHatanya | _mincha ketana_} while the
     * [Ra"sh](https://en.wikipedia.org/wiki/Asher_ben_Jehiel),
     * [Tur](https://en.wikipedia.org/wiki/Jacob_ben_Asher),
     * [GRA](https://en.wikipedia.org/wiki/Vilna_Gaon) and others are of the opinion that _mincha_ can be prayed
     * _lechatchila_ starting at _mincha gedola_. This is calculated as 6.5 sea level solar hours after
     * _netz amiti_ (sunrise), based on the opinion of the Baal Hatanya that the day is calculated from
     * _netz amiti_ (sunrise) to _shkiah amiti_ (sunset).
     * @return the `Date` of the time of _mincha gedola_ according to the Baal Hatanya. If the calculation
     *         can't be computed, such as in the Arctic Circle where there is at least one day a year where the sun does not rise
     *         and one where it does not set, an `Invalid Date` will be returned.
     */
    minchaGedolaBaalHatanya() {
        return this.getShaahZmanisBaalHatanya(6.5);
    }
    /**
     * This method returns the time of _mincha ketana_. This is the preferred earliest time to pray
     * _mincha_ in the opinion of the [Rambam](https://en.wikipedia.org/wiki/Maimonides) and others.
     * For more information on this see the documentation on {@link minchaGedolaBaalHatanya | _mincha gedola_}.
     * This is calculated as 9.5 sea level solar hours after _netz amiti_ (sunrise), based on the opinion of
     * the Baal Hatanya that the day is calculated from _netz amiti_ (sunrise) to _shkiah amiti_ (sunset).
     *
     * @return the `Date` of the time of _mincha ketana_. If the calculation can't be computed, such as
     *         in the Arctic Circle where there is at least one day a year where the sun does not rise and one where it
     *         does not set, an `Invalid Date` will be returned.
     */
    minchaKetanaBaalHatanya() {
        return this.getShaahZmanisBaalHatanya(9.5);
    }
    /**
     * This method returns the time of _plag hamincha_. This is calculated as 10.75 sea level solar hours
     * after _netz amiti_ (sunrise), based on the opinion of the Baal Hatanya that the day is calculated
     * from _netz amiti_ (sunrise) to _shkiah amiti_ (sunset).
     *
     * @return the `Date` of the time of _plag hamincha_ according to the Baal Hatanya. If the calculation
     *         can't be computed, such as in the Arctic Circle where there is at least one day a year where the sun does
     *         not rise and one where it does not set, an `Invalid Date` will be returned.
     */
    plagHaminchaBaalHatanya() {
        return this.getShaahZmanisBaalHatanya(10.75);
    }
    /**
     * A method that returns _tzais_ (nightfall) when the sun is 6° below the western geometric horizon
     * (90°) after {@link sunset}. This is the time the Baal Hatanya calls _shkiah amiti_ plus the
     * interval it takes the sun to descend a further 6°.
     *
     * @return the `Date` of nightfall. If the calculation can't be computed, such as in northern and southern
     *         locations — even south of the Arctic Circle and north of the Antarctic Circle — where the sun may not
     *         reach low enough below the horizon for this calculation, an `Invalid Date` will be returned.
     */
    tzaisBaalHatanya() {
        return this.timeAtAngle(6, false);
    }
    /**
     * Uses timeFormat to return a date like '20:34'.
     * Returns `XX:XX` if the date is invalid.
     * @param dt the time to format
     * @param timeFormat formatter to use, e.g. from
     *   {@link Location.getTimeFormatter}
     */
    static formatTime(dt, timeFormat) {
        if (isNaN(dt.getTime())) {
            return 'XX:XX'; // Invalid Date
        }
        const time = timeFormat.format(dt);
        // Rewrite the h24 midnight ("24:15") that some locales produce. Checking
        // the two leading characters avoids the throwaway array that split(':')
        // allocated on every event; this runs once per timed event, and the
        // Intl.format() call above is already the expensive part.
        if (time.charCodeAt(0) === 0x32 && // '2'
            time.charCodeAt(1) === 0x34 && // '4'
            time.charCodeAt(2) === 0x3a // ':'
        ) {
            return '00' + time.substring(2);
        }
        return time;
    }
    /**
     * Discards seconds, rounding to nearest minute.
     * @param dt
     */
    static roundTime(dt) {
        const millis = dt.getTime();
        if (isNaN(millis)) {
            return dt;
        }
        // Round up to next minute if needed
        const millisOnly = dt.getMilliseconds();
        const seconds = dt.getSeconds();
        if (seconds === 0 && millisOnly === 0) {
            return dt;
        }
        const secAndMillis = seconds * 1000 + millisOnly;
        const delta = secAndMillis >= 30000 ? 60000 - secAndMillis : -1 * secAndMillis;
        return new Date(millis + delta);
    }
    /**
     * Get offset string (like "+05:00" or "-08:00") from tzid (like "Europe/Moscow")
     * @param tzid
     * @param date
     */
    static timeZoneOffset(tzid, date) {
        const offset = getTimezoneOffset(tzid, date);
        const offsetAbs = Math.abs(offset);
        const hours = Math.floor(offsetAbs / 60);
        const minutes = offsetAbs % 60;
        return (offset < 0 ? '+' : '-') + pad2(hours) + ':' + pad2(minutes);
    }
    /**
     * Returns a string like "2022-04-01T13:06:00-11:00"
     * @param tzid
     * @param date
     */
    static formatISOWithTimeZone(tzid, date) {
        if (isNaN(date.getTime())) {
            return '0000-00-00T00:00:00Z';
        }
        return (getPseudoISO(tzid, date).substring(0, 19) + Zmanim.timeZoneOffset(tzid, date));
    }
    /**
     * Returns sunrise + `offset` minutes (either positive or negative).
     * If elevation is enabled, this function will include elevation in the calculation
     *  unless `forceSeaLevel` is `true`.
     * @param offset minutes
     * @param roundMinute round time to nearest minute (default true)
     * @param forceSeaLevel use sea-level sunrise (default false)
     */
    sunriseOffset(offset, roundMinute = true, forceSeaLevel = false) {
        const sunrise = forceSeaLevel ? this.seaLevelSunrise() : this.sunrise();
        if (isNaN(sunrise.getTime())) {
            return sunrise;
        }
        if (roundMinute) {
            // For positive offsets only, round up to next minute if needed
            if (offset > 0 && sunrise.getSeconds() >= 30) {
                offset++;
            }
            sunrise.setSeconds(0, 0);
        }
        return new Date(sunrise.getTime() + offset * 60 * 1000);
    }
    /**
     * Returns sunset + `offset` minutes (either positive or negative).
     * If elevation is enabled, this function will include elevation in the calculation
     *  unless `forceSeaLevel` is `true`.
     * @param offset minutes
     * @param roundMinute round time to nearest minute (default true)
     * @param forceSeaLevel use sea-level sunset (default false)
     */
    sunsetOffset(offset, roundMinute = true, forceSeaLevel = false) {
        const sunset = forceSeaLevel ? this.seaLevelSunset() : this.sunset();
        if (isNaN(sunset.getTime())) {
            return sunset;
        }
        if (roundMinute) {
            // For Havdalah only, round up to next minute if needed
            if (offset > 0 && sunset.getSeconds() >= 30) {
                offset++;
            }
            sunset.setSeconds(0, 0);
        }
        return new Date(sunset.getTime() + offset * 60 * 1000);
    }
    /**
     * Returns the Hebrew date relative to the specified location and Gregorian date,
     * taking into consideration whether the time is before or after sunset.
     *
     * For example, if the given date and is `2024-09-22T10:35` (before sunset), and
     * sunset for the specified location is **19:04**, then this function would
     * return a Hebrew date of `19th of Elul, 5784`.
     * If the given date is the same Gregorian day after sunset
     * (for example `2024-09-22T20:07`), this function would return a
     * Hebrew date of `20th of Elul, 5784`.
     * @example
     * import {GeoLocation, Zmanim, HDate} from '@hebcal/core';
     * const latitude = 48.85341;
     * const longitude = 2.3488;
     * const timezone = 'Europe/Paris';
     * const gloc = new GeoLocation(null, latitude, longitude, 0, timezone);
     * const before = Zmanim.makeSunsetAwareHDate(gloc, new Date('2024-09-22T17:38:46.123Z'), false);
     * console.log(before.toString()); // '19 Elul 5784'
     * const after = Zmanim.makeSunsetAwareHDate(gloc, new Date('2024-09-22T23:45:18.345Z'), false);
     * console.log(after.toString()); // '20 Elul 5784'
     */
    static makeSunsetAwareHDate(gloc, date, useElevation) {
        const zmanim = new Zmanim(gloc, date, useElevation);
        const sunset = zmanim.sunset();
        let hd = new HDate(date);
        const sunsetMillis = sunset.getTime();
        if (isNaN(sunsetMillis)) {
            return hd;
        }
        if (date.getTime() >= sunsetMillis) {
            hd = hd.next();
        }
        return hd;
    }
}

const SUN$1 = 0;
const TUE$1 = 2;
const FRI$2 = 5;
const SAT$3 = 6;
const NISAN$3 = months.NISAN;
const IYYAR$1 = months.IYYAR;
/**
 * Yom HaShoah first observed in 1951.
 * When the actual date of Yom Hashoah falls on a Friday, the
 * state of Israel observes Yom Hashoah on the preceding
 * Thursday. When it falls on a Sunday, Yom Hashoah is observed
 * on the following Monday.
 * http://www.ushmm.org/remembrance/dor/calendar/
 * @private
 * @param year
 */
function dateYomHaShoah(year) {
    if (year < 5711) {
        return null;
    }
    let nisan27dt = new HDate(27, NISAN$3, year);
    if (nisan27dt.getDay() === FRI$2) {
        nisan27dt = new HDate(26, NISAN$3, year);
    }
    else if (nisan27dt.getDay() === SUN$1) {
        nisan27dt = new HDate(28, NISAN$3, year);
    }
    return nisan27dt;
}
/**
 * Yom HaAtzma'ut only celebrated after 1948
 * @private
 * @param year
 */
function dateYomHaZikaron(year) {
    if (year < 5708) {
        return null;
    }
    let day;
    const pesach = new HDate(15, NISAN$3, year);
    const pdow = pesach.getDay();
    if (pdow === SUN$1) {
        day = 2;
    }
    else if (pdow === SAT$3) {
        day = 3;
    }
    else if (year < 5764) {
        day = 4;
    }
    else if (pdow === TUE$1) {
        day = 5;
    }
    else {
        day = 4;
    }
    return new HDate(day, IYYAR$1, year);
}

/*
    Hebcal - A Jewish Calendar Generator
    Copyright (c) 1994-2020 Danny Sadinoff
    Portions copyright Eyal Schachter and Michael J. Radwin

    https://github.com/hebcal/hebcal-es6

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation; either version 2
    of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
/*
 * Many of the following algorithms were taken from hebrew calendar
 * routines by Maimonedes, from his Mishneh Torah, and implemented by
 *  Nachum Dershowitz                Department of Computer Science
 *  (217) 333-4219                   University of Illinois at Urbana-Champaign
 *  nachum@cs.uiuedu               1304 West Springfield Avenue
 *                                   Urbana, Illinois 61801
 *
 * The routines were included in the emacs 19 distribution.
 *
 */
const INCOMPLETE = 0;
const REGULAR = 1;
const COMPLETE = 2;
function yearType(hyear) {
    const longC = HDate.longCheshvan(hyear);
    const shortK = HDate.shortKislev(hyear);
    if (longC && !shortK) {
        return COMPLETE;
    }
    if (!longC && shortK) {
        return INCOMPLETE;
    }
    return REGULAR;
}
/**
 * Represents the weekly Torah-reading (Parashat HaShavua) schedule for an
 * entire Hebrew year.
 *
 * The schedule depends on the year's *keviyah* — the day of week of Rosh
 * Hashana, whether the year is leap, whether Cheshvan/Kislev are long or
 * short, and whether the schedule is for Israel or the Diaspora (since
 * Israel and the Diaspora diverge in some years when the 8th day of Pesach
 * or the 2nd day of Shavuot fall on Shabbat).
 *
 * Prefer {@link getSedra} over
 * calling this constructor directly, since both cache their results.
 *
 * @example
 * import {Sedra, HDate, months} from '@hebcal/core';
 * const sedra = new Sedra(5784, false);
 * const result = sedra.lookup(new HDate(15, months.CHESHVAN, 5784));
 * console.log(result.parsha); // ['Vayera']
 */
class Sedra {
    /**
     * Calculates the Parashat HaShavua schedule for an entire Hebrew year.
     * @param hyear - Hebrew year (e.g. 5749)
     * @param il - Use Israel sedra schedule (false for Diaspora)
     */
    constructor(hyear, il) {
        hyear = +hyear;
        this.year = hyear;
        const rh0 = new HDate(1, months.TISHREI, hyear);
        const rh = (this.rh = rh0.abs());
        const rhDay = rh0.getDay() + 1;
        // find the first Saturday on or after Rosh Hashana
        this.firstSaturday = HDate.dayOnOrBefore(6, rh + 6);
        const leap = +HDate.isLeapYear(hyear);
        this.il = Boolean(il);
        const type = yearType(hyear);
        let key = `${leap}${rhDay}${type}`;
        if (types[key]) {
            this.theSedraArray = types[key];
            this.yearKey = key;
        }
        else {
            key = key + +this.il; // cast to num, then concat
            this.theSedraArray = types[key];
            this.yearKey = key;
        }
        if (!this.theSedraArray) {
            throw new Error(`improper sedra year type ${key} calculated for ${hyear}`);
        }
    }
    /**
     * Returns the date a parsha is read this year, or `null` if it does not
     * occur in this year's schedule.
     *
     * A doubled parsha (e.g. `'Matot-Masei'`) will only return a date in years
     * where that pair is actually read together; in years where they are read
     * separately, this returns `null`. Use {@link findContaining} to find the
     * date a parsha is read regardless of whether it is doubled.
     *
     * Throws `RangeError` for an out-of-range numeric input or an invalid
     * doubled-parsha pair, and `TypeError` for a malformed array argument.
     * @example
     * import {Sedra} from '@hebcal/core';
     * const sedra = new Sedra(5784, false);
     * sedra.find('Noach')?.toString();        // '6 Cheshvan 5784'
     * sedra.find(1)?.toString();              // '6 Cheshvan 5784', by 0-based index
     * // Matot and Masei are doubled in 5784, so the pair has a date...
     * sedra.find('Matot-Masei')?.toString();  // '28 Tamuz 5784'
     * sedra.find(['Matot', 'Masei'])?.toString(); // '28 Tamuz 5784'
     * // ...but neither half is read on its own that year:
     * sedra.find('Matot');                    // null
     * @param parsha if a `string`, specified with Sephardic transliterations
     *  like `'Noach'` or `'Matot-Masei'`. If an array, must be a 1- or 2-element
     *  array such as `['Noach']` or `['Matot', 'Masei']`. If a `number`, should
     *  be a 0-based parsha index (`0` for Bereshit, `1` for Noach) or a negative
     *  number for a doubled parsha (e.g. `-21` for Vayakhel-Pekudei).
     *  Note that this index is 0-based, unlike {@link SedraResult.num} which
     *  is 1-based.
     */
    find(parsha) {
        if (typeof parsha === 'number') {
            if (parsha >= parshiot.length || (parsha < 0 && !isValidDouble(parsha))) {
                throw new RangeError(`Invalid parsha number: ${parsha}`);
            }
            return this.findInternal(parsha);
        }
        if (typeof parsha === 'string') {
            const num = parsha2id.get(parsha);
            if (typeof num === 'number') {
                return this.find(num);
            }
            if (parsha.includes('-')) {
                if (parsha === CHMPESACH || parsha === CHMSUKOT) {
                    return this.findInternal(parsha);
                }
                return this.find(parsha.split('-'));
            }
            // try to find Saturday holiday like 'Yom Kippur'
            return this.findInternal(parsha);
        }
        if (Array.isArray(parsha)) {
            const plen = parsha.length;
            if ((plen !== 1 && plen !== 2) || typeof parsha[0] !== 'string') {
                throw new TypeError(`Invalid parsha argument: ${JSON.stringify(parsha)}`);
            }
            if (plen === 1) {
                return this.find(parsha[0]);
            }
            const p1 = parsha[0];
            const p2 = parsha[1];
            const num1 = parsha2id.get(p1);
            const num2 = parsha2id.get(p2);
            if (typeof num1 !== 'number' ||
                typeof num2 !== 'number' ||
                num2 !== num1 + 1 ||
                !isValidDouble(-num1)) {
                throw new RangeError(`Unrecognized parsha name: ${p1}-${p2}`);
            }
            return this.find(-num1);
        }
        return null; /* NOTREACHED */
    }
    findInternal(parsha) {
        const idx = this.theSedraArray.indexOf(parsha);
        if (idx === -1) {
            return null; // doesn't occur this year
        }
        return new HDate(this.firstSaturday + idx * 7);
    }
    /**
     * Returns the date a parsha is read this year, looking through both
     * single and doubled forms.
     *
     * For example, if `'Matot'` is read individually this year, this returns
     * its date; if it is read as part of `'Matot-Masei'` this year, this
     * returns the date of `'Matot-Masei'` (and similarly for `'Masei'`).
     * Conversely, asking for `'Matot-Masei'` in a year where they are split
     * will return the date of `'Matot'` alone.
     * @example
     * import {Sedra} from '@hebcal/core';
     * // Matot and Masei are doubled in 5784, so each half resolves to the
     * // date of the combined reading:
     * const sedra = new Sedra(5784, false);
     * sedra.findContaining('Matot')?.toString();        // '28 Tamuz 5784'
     * sedra.findContaining('Masei')?.toString();        // '28 Tamuz 5784'
     * @example
     * import {Sedra} from '@hebcal/core';
     * // They are read separately in 5795, so each half has its own date, and
     * // asking for the doubled name returns the date of the first half:
     * const sedra = new Sedra(5795, false);
     * sedra.findContaining('Matot')?.toString();        // '21 Tamuz 5795'
     * sedra.findContaining('Masei')?.toString();        // '28 Tamuz 5795'
     * sedra.findContaining('Matot-Masei')?.toString();  // '21 Tamuz 5795'
     */
    findContaining(parsha) {
        const hdate = this.find(parsha);
        if (hdate) {
            return hdate;
        }
        if (typeof parsha === 'number') {
            // a valid negative number (double parsha in a year where they are
            // combined) would've been found above, and a invalid negative number
            // would've thrown an error, so this parsha must be a positive number
            // representing either p1 or p2
            const p1 = -parsha;
            if (isValidDouble(p1)) {
                return this.find(p1);
            }
            else {
                // this must be the second individual parsha of a doubled pair
                // for example 29 for Kedoshim, so check for -28 for Achrei Mot-Kedoshim
                return this.find(p1 + 1);
            }
        }
        else {
            const num = parsha2id.get(parsha);
            if (num) {
                // parsha is either the first or second individual parsha of
                // a pair that is doubled this year
                const p1 = -num;
                if (isValidDouble(p1)) {
                    return this.find(p1);
                }
                else {
                    return this.find(p1 + 1);
                }
            }
            else {
                // this was indeed a doubled parsha, so return date of the first half
                const [p1] = parsha.split('-');
                return this.find(p1);
            }
        }
    }
    /**
     * Returns the underlying annual reading schedule as an array, where each
     * entry corresponds to one Saturday (starting from the first Shabbat on
     * or after Rosh Hashana). Entries are either:
     * - a non-negative `number`: a 0-based parsha index (e.g. `0` for
     *   *Bereshit*)
     * - a negative `number`: the negated first index of a doubled parsha
     *   (e.g. `-21` for *Vayakhel-Pekudei*)
     * - a `string`: a holiday name when a Yom Tov displaces the weekly reading
     *   (e.g. `'Pesach Shabbat Chol ha-Moed'`, `'Yom Kippur'`)
     *
     * Used by `@hebcal/triennial`.
     */
    getSedraArray() {
        return this.theSedraArray;
    }
    /**
     * Returns the R.D. (Rata Die / Fixed Date) absolute day number of the
     * first Saturday on or after Rosh Hashana of this year. This is the
     * anchor point for {@link getSedraArray} — index `0` of that array
     * corresponds to this date.
     */
    getFirstSaturday() {
        return this.firstSaturday;
    }
    /** Returns the Hebrew year this `Sedra` instance covers. */
    getYear() {
        return this.year;
    }
    /**
     * Returns details about the parsha read on the first Saturday on or after
     * `hd`. If `hd` is itself a Saturday, the reading for that date is
     * returned; otherwise the reading for the upcoming Saturday is returned.
     *
     * If the given date falls in the final days of the Hebrew year (after
     * the last reading of this year's schedule), this method transparently
     * delegates to the next year's `Sedra`.
     * @example
     * import {Sedra, HDate, months} from '@hebcal/core';
     * const sedra = new Sedra(5784, false);
     * // A Friday — returns the upcoming Shabbat's reading
     * const result = sedra.lookup(new HDate(12, months.CHESHVAN, 5784));
     * console.log(result.parsha); // ['Lech-Lecha']
     * console.log(result.chag);   // false
     * console.log(result.hdate.toString()); // '13 Cheshvan 5784' (Saturday)
     * @param hd Hebrew date or R.D. days
     */
    lookup(hd) {
        const abs = typeof hd === 'number' ? hd : HDate.isHDate(hd) ? hd.abs() : NaN;
        if (isNaN(abs)) {
            throw new TypeError(`Bad date argument: ${hd}`);
        }
        if (abs < this.rh) {
            throw new RangeError(`Date ${hd} before start of Hebrew year ${this.year}`);
        }
        // find the first saturday on or after today's date
        const saturday = HDate.dayOnOrBefore(6, abs + 6);
        const weekNum = (saturday - this.firstSaturday) / 7;
        const index = this.theSedraArray[weekNum];
        if (index === undefined) {
            const sedra = getSedra(this.year + 1, this.il);
            return sedra.lookup(saturday); // must be next year
        }
        const hdate = new HDate(saturday);
        if (typeof index === 'string') {
            // Shabbat has a chag. Return a description
            return { parsha: [index], chag: true, hdate, il: this.il, num: 0 };
        }
        if (index >= 0) {
            return {
                parsha: [parshiot[index]],
                chag: false,
                num: index + 1,
                hdate,
                il: this.il,
            };
        }
        const p1 = D(index); // undouble the parsha
        return {
            parsha: [parshiot[p1], parshiot[p1 + 1]],
            chag: false,
            num: [p1 + 1, p1 + 2],
            hdate,
            il: this.il,
        };
    }
    /**
     * Returns details about the parsha read on Monday or Thursday for `hd`, or
     * `undefined` if `hd` is not a Monday or Thursday.
     *
     * Weekday Torah readings generally begin the upcoming Shabbat parsha. When
     * the upcoming Shabbat is a holiday, this method returns the next regular
     * parsha instead.
     *
     * For the Tishrei weekdays before Sukkot or Simchat Torah, the weekday
     * reading is *Vezot Haberakhah* even though it is not read on Shabbat.
     * @example
     * import {Sedra, HDate, months} from '@hebcal/core';
     * const sedra = new Sedra(5784, false);
     * // Monday 8 Cheshvan — begins the upcoming Shabbat's parsha
     * sedra.lookupWeekday(new HDate(8, months.CHESHVAN, 5784))?.parsha; // ['Lech-Lecha']
     * // Tuesday is neither Monday nor Thursday
     * sedra.lookupWeekday(new HDate(9, months.CHESHVAN, 5784)); // undefined
     * // Thursday 17 Nisan — the upcoming Shabbat is Chol ha-Moed Pesach,
     * // so the next regular parsha is returned instead
     * sedra.lookupWeekday(new HDate(17, months.NISAN, 5784))?.parsha; // ['Achrei Mot']
     * @param hd Hebrew date or R.D. days
     */
    lookupWeekday(hd) {
        const abs = typeof hd === 'number' ? hd : HDate.isHDate(hd) ? hd.abs() : NaN;
        if (isNaN(abs)) {
            throw new TypeError(`Bad date argument: ${hd}`);
        }
        if (abs < this.rh) {
            throw new RangeError(`Date ${hd} before start of Hebrew year ${this.year}`);
        }
        const hdate = new HDate(abs);
        const day = hdate.getDay();
        if (day !== 1 && day !== 4) {
            return undefined;
        }
        const saturday = new HDate(HDate.dayOnOrBefore(6, abs + 6));
        const parsha = this.lookup(saturday);
        if (!parsha.chag) {
            return parsha;
        }
        return this.findWeekdayParsha(saturday);
    }
    findWeekdayParsha(saturday) {
        const hyear = saturday.getFullYear();
        const il = this.il;
        if (saturday.getMonth() === months.TISHREI) {
            const dd = saturday.getDate();
            const simchatTorah = il ? 22 : 23;
            if (dd > 2 && dd <= simchatTorah) {
                return {
                    parsha: ['Vezot Haberakhah'],
                    chag: false,
                    num: 54,
                    hdate: saturday,
                    il,
                };
            }
        }
        const sedra = hyear === this.year ? this : getSedra(hyear, il);
        const endOfYear = new HDate(1, months.TISHREI, hyear + 1).abs() - 1;
        const endAbs = endOfYear + 30;
        for (let sat2 = saturday.abs() + 7; sat2 <= endAbs; sat2 += 7) {
            const sedra2 = sat2 > endOfYear ? getSedra(hyear + 1, il) : sedra;
            const parsha2 = sedra2.lookup(sat2);
            if (!parsha2.chag) {
                return parsha2;
            }
        }
        /* NOTREACHED */
        throw new Error(`can't find weekday parsha for ${saturday}/${il}`);
    }
}
/**
 * The 54 parshiyot of the Torah as transilterated strings.
 * * parshiot[0] == `Bereshit`
 * * parshiot[1] == `Noach`
 * * parshiot[52] == `Ha'azinu`
 * * parshiot[53] == `Vezot Haberakhah`
 * @readonly
 * @type {string[]}
 */
const parshiot = [
    'Bereshit',
    'Noach',
    'Lech-Lecha',
    'Vayera',
    'Chayei Sara',
    'Toldot',
    'Vayetzei',
    'Vayishlach',
    'Vayeshev',
    'Miketz',
    'Vayigash',
    'Vayechi',
    'Shemot',
    'Vaera',
    'Bo',
    'Beshalach',
    'Yitro',
    'Mishpatim',
    'Terumah',
    'Tetzaveh',
    'Ki Tisa',
    'Vayakhel',
    'Pekudei',
    'Vayikra',
    'Tzav',
    'Shmini',
    'Tazria',
    'Metzora',
    'Achrei Mot',
    'Kedoshim',
    'Emor',
    'Behar',
    'Bechukotai',
    'Bamidbar',
    'Nasso',
    "Beha'alotcha",
    "Sh'lach",
    'Korach',
    'Chukat',
    'Balak',
    'Pinchas',
    'Matot',
    'Masei',
    'Devarim',
    'Vaetchanan',
    'Eikev',
    "Re'eh",
    'Shoftim',
    'Ki Teitzei',
    'Ki Tavo',
    'Nitzavim',
    'Vayeilech',
    "Ha'azinu",
    'Vezot Haberakhah',
];
// 0-based parsha IDs
const parsha2id = new Map();
for (let id = 0; id < parshiot.length; id++) {
    const name = parshiot[id];
    parsha2id.set(name, id);
}
// 0-based parsha IDs
const doubles = new Set([
    21, // Vayakhel-Pekudei
    26, // Tazria-Metzora
    28, // Achrei Mot-Kedoshim
    31, // Behar-Bechukotai
    38, // Chukat-Balak
    41, // Matot-Masei
    50, // Nitzavim-Vayeilech
]);
/**
 * @private
 * @param id a negative number
 */
function isValidDouble(id) {
    return doubles.has(-id);
}
/**
 * parsha doubler/undoubler
 * @private
 * @param p
 */
function D(p) {
    return -p;
}
const RH = 'Rosh Hashana'; // 0
const YK = 'Yom Kippur'; // 1
const SUKKOT = 'Sukkot'; // 0
const CHMSUKOT = 'Sukkot Shabbat Chol ha-Moed'; // 0
const SHMINI = 'Shmini Atzeret'; // 0
const PESACH = 'Pesach'; // 25
const PESACH1 = 'Pesach I';
const CHMPESACH = 'Pesach Shabbat Chol ha-Moed'; // 25
const PESACH7 = 'Pesach VII'; // 25
const PESACH8 = 'Pesach VIII';
const SHAVUOT$1 = 'Shavuot'; // 33
/**
 * Returns an array from start to end
 * @private
 * @param start beginning number, inclusive
 * @param stop ending number, inclusive
 */
function range$1(start, stop) {
    return Array.from({ length: stop - start + 1 }, (v, k) => k + start);
}
const yearStartVayeilech = [51, 52, CHMSUKOT];
const yearStartHaazinu = [52, YK, CHMSUKOT];
const yearStartRH = [RH, 52, SUKKOT, SHMINI];
const r020 = range$1(0, 20);
const r027 = range$1(0, 27);
const r3340 = range$1(33, 40);
const r4349 = range$1(43, 49);
const r4350 = range$1(43, 50);
/**
 * The ordinary year types (keviot)
 * names are leap/nonleap - day - incomplete/regular/complete - diaspora/Israel
 * @private
 * @readonly
 */
const types = {
    /* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
     * Kislev each have 29 days), and has Passover start on Tuesday. */
    // e.g. 5753
    '020': yearStartVayeilech.concat(r020, D(21), 23, 24, CHMPESACH, 25, D(26), D(28), 30, D(31), r3340, D(41), r4349, D(50)),
    /* Hebrew year that starts on Monday, is `complete' (Heshvan and
     * Kislev each have 30 days), and has Passover start on Thursday. */
    // e.g. 5756
    '0220': yearStartVayeilech.concat(r020, D(21), 23, 24, CHMPESACH, 25, D(26), D(28), 30, D(31), 33, SHAVUOT$1, range$1(34, 37), D(38), 40, D(41), r4349, D(50)),
    /* Hebrew year that starts on Thursday, is `regular' (Heshvan has 29
     * days and Kislev has 30 days), and has Passover start on Saturday. */
    // e.g. 5701
    '0510': yearStartHaazinu.concat(r020, D(21), 23, 24, PESACH1, PESACH8, 25, D(26), D(28), 30, D(31), r3340, D(41), r4350),
    /* Hebrew year that starts on Thursday, is `regular' (Heshvan has 29
     * days and Kislev has 30 days), and has Passover start on Saturday. */
    // e.g. 5745
    '0511': yearStartHaazinu.concat(r020, D(21), 23, 24, PESACH, 25, D(26), D(28), range$1(30, 40), D(41), r4350),
    /* Hebrew year that starts on Thursday, is `complete' (Heshvan and
     * Kislev each have 30 days), and has Passover start on Sunday. */
    // e.g. 5754
    '052': yearStartHaazinu.concat(range$1(0, 24), PESACH7, 25, D(26), D(28), 30, D(31), r3340, D(41), r4350),
    /* Hebrew year that starts on Saturday, is `incomplete' (Heshvan and Kislev
     * each have 29 days), and has Passover start on Sunday. */
    // e.g. 5761
    '070': yearStartRH.concat(r020, D(21), 23, 24, PESACH7, 25, D(26), D(28), 30, D(31), r3340, D(41), r4350),
    /* Hebrew year that starts on Saturday, is `complete' (Heshvan and
     * Kislev each have 30 days), and has Passover start on Tuesday. */
    // e.g. 5716
    '072': yearStartRH.concat(r020, D(21), 23, 24, CHMPESACH, 25, D(26), D(28), 30, D(31), r3340, D(41), r4349, D(50)),
    /* --  The leap year types (keviot) -- */
    /* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
     * Kislev each have 29 days), and has Passover start on Thursday. */
    // e.g. 5746
    '1200': yearStartVayeilech.concat(r027, CHMPESACH, range$1(28, 33), SHAVUOT$1, range$1(34, 37), D(38), 40, D(41), r4349, D(50)),
    /* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
     * Kislev each have 29 days), and has Passover start on Thursday. */
    // e.g. 5746
    '1201': yearStartVayeilech.concat(r027, CHMPESACH, range$1(28, 40), D(41), r4349, D(50)),
    /* Hebrew year that starts on Monday, is `complete' (Heshvan and
     * Kislev each have 30 days), and has Passover start on Saturday. */
    // e.g.5752
    '1220': yearStartVayeilech.concat(r027, PESACH1, PESACH8, range$1(28, 40), D(41), r4350),
    /* Hebrew year that starts on Monday, is `complete' (Heshvan and
     * Kislev each have 30 days), and has Passover start on Saturday. */
    // e.g.5752
    '1221': yearStartVayeilech.concat(r027, PESACH, range$1(28, 50)),
    /* Hebrew year that starts on Thursday, is `incomplete' (Heshvan and
     * Kislev both have 29 days), and has Passover start on Sunday. */
    // e.g. 5768
    '150': yearStartHaazinu.concat(range$1(0, 28), PESACH7, range$1(29, 50)),
    /* Hebrew year that starts on Thursday, is `complete' (Heshvan and
     * Kislev both have 30 days), and has Passover start on Tuesday. */
    // eg. 5771
    '152': yearStartHaazinu.concat(range$1(0, 28), CHMPESACH, range$1(29, 49), D(50)),
    /* Hebrew year that starts on Saturday, is `incomplete' (Heshvan and
     * Kislev each have 29 days), and has Passover start on Tuesday. */
    // e.g.5757
    '170': yearStartRH.concat(r027, CHMPESACH, range$1(28, 40), D(41), r4349, D(50)),
    /* Hebrew year that starts on Saturday, is `complete' (Heshvan and
     * Kislev each have 30 days), and has Passover start on Thursday. */
    '1720': yearStartRH.concat(r027, CHMPESACH, range$1(28, 33), SHAVUOT$1, range$1(34, 37), D(38), 40, D(41), r4349, D(50)),
};
/* Hebrew year that starts on Monday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Thursday. */
types['0221'] = types['020'];
/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Thursday. */
// e.g. 5715
types['0310'] = types['0220'];
/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Thursday. */
types['0311'] = types['020'];
/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Saturday. */
// e.g. 5715
types['1310'] = types['1220'];
/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Saturday. */
types['1311'] = types['1221'];
/* Hebrew year that starts on Saturday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Thursday. */
types['1721'] = types['170'];
const sedraCache = new QuickLRU({ maxSize: 120 });
/**
 * Convenience function to create an instance of {@link Sedra} or reuse a
 * previously created and cached instance for the same year and schedule.
 *
 * Prefer this over `new Sedra(...)` when calling repeatedly — an internal
 * LRU cache (~120 entries) avoids recomputing the keviyah-specific schedule.
 * @example
 * import {getSedra, HDate, months} from '@hebcal/core';
 * const sedra = getSedra(5784, false);
 * const {parsha} = sedra.lookup(new HDate(15, months.CHESHVAN, 5784));
 * console.log(parsha); // ['Vayera']
 * @param hyear Hebrew year
 * @param il Use Israel sedra schedule (`false` for Diaspora)
 */
function getSedra(hyear, il) {
    const cacheKey = `${hyear}-${il ? 1 : 0}`;
    let sedra = sedraCache.get(cacheKey);
    if (!sedra) {
        sedra = new Sedra(hyear, il);
        sedraCache.set(cacheKey, sedra);
    }
    return sedra;
}

const Nisan = months.NISAN;
const Iyyar = months.IYYAR;
const Sivan = months.SIVAN;
const Tamuz = months.TAMUZ;
const Av = months.AV;
const Elul = months.ELUL;
const Tishrei = months.TISHREI;
const Cheshvan = months.CHESHVAN;
const Kislev = months.KISLEV;
const Shvat = months.SHVAT;
const Adar2 = months.ADAR_II;
const CHAG$1 = flags.CHAG;
const LIGHT_CANDLES$3 = flags.LIGHT_CANDLES;
const YOM_TOV_ENDS$1 = flags.YOM_TOV_ENDS;
const CHUL_ONLY$1 = flags.CHUL_ONLY;
const IL_ONLY$2 = flags.IL_ONLY;
const LIGHT_CANDLES_TZEIS$3 = flags.LIGHT_CANDLES_TZEIS;
const MAJOR_FAST$2 = flags.MAJOR_FAST;
const MINOR_HOLIDAY$2 = flags.MINOR_HOLIDAY;
const EREV$3 = flags.EREV;
const CHOL_HAMOED$1 = flags.CHOL_HAMOED;
const emojiPesach = '🫓';
const emojiSukkot = '🌿🍋';
const ROSH_HASHANA_II = 'Rosh Hashana II';
const EREV_YOM_KIPPUR = 'Erev Yom Kippur';
const YOM_KIPPUR = 'Yom Kippur';
const EREV_SUKKOT = 'Erev Sukkot';
const SUKKOT_I = 'Sukkot I';
const SUKKOT_II = 'Sukkot II';
const SUKKOT_III_CHM = "Sukkot III (CH''M)";
const SUKKOT_IV_CHM = "Sukkot IV (CH''M)";
const SUKKOT_V_CHM = "Sukkot V (CH''M)";
const SUKKOT_VI_CHM = "Sukkot VI (CH''M)";
const SHMINI_ATZERET = 'Shmini Atzeret';
const SIMCHAT_TORAH = 'Simchat Torah';
const SUKKOT_II_CHM = "Sukkot II (CH''M)";
const SUKKOT_VII_HOSHANA_RABA = 'Sukkot VII (Hoshana Raba)';
const CHANUKAH_1_CANDLE = 'Chanukah: 1 Candle';
const TU_BISHVAT = 'Tu BiShvat';
const EREV_PURIM = 'Erev Purim';
const PURIM = 'Purim';
const SHUSHAN_PURIM = 'Shushan Purim';
const EREV_PESACH = 'Erev Pesach';
const PESACH_I = 'Pesach I';
const PESACH_II = 'Pesach II';
const PESACH_II_CHM = "Pesach II (CH''M)";
const PESACH_III_CHM = "Pesach III (CH''M)";
const PESACH_IV_CHM = "Pesach IV (CH''M)";
const PESACH_V_CHM = "Pesach V (CH''M)";
const PESACH_VI_CHM = "Pesach VI (CH''M)";
const PESACH_VII = 'Pesach VII';
const PESACH_VIII = 'Pesach VIII';
const PESACH_SHENI = 'Pesach Sheni';
const LAG_BAOMER = 'Lag BaOmer';
const EREV_SHAVUOT = 'Erev Shavuot';
const SHAVUOT = 'Shavuot';
const SHAVUOT_I = 'Shavuot I';
const SHAVUOT_II = 'Shavuot II';
const TU_BAV = "Tu B'Av";
const ROSH_HASHANA_LABEHEMOT = 'Rosh Hashana LaBehemot';
const EREV_ROSH_HASHANA = 'Erev Rosh Hashana';
const YOM_YERUSHALAYIM = 'Yom Yerushalayim';
const BEN_GURION_DAY = 'Ben-Gurion Day';
const FAMILY_DAY = 'Family Day';
const YITZHAK_RABIN_MEMORIAL_DAY = 'Yitzhak Rabin Memorial Day';
const HERZL_DAY = 'Herzl Day';
const JABOTINSKY_DAY = 'Jabotinsky Day';
const SIGD = 'Sigd';
const YOM_HAALIYAH = 'Yom HaAliyah';
const YOM_HAALIYAH_SCHOOL_OBSERVANCE = 'Yom HaAliyah School Observance';
const HEBREW_LANGUAGE_DAY = 'Hebrew Language Day';
const CANDLE_LIGHTING$1 = 'Candle lighting';
const HAVDALAH$1 = 'Havdalah';
const FAST_BEGINS$1 = 'Fast begins';
const FAST_ENDS$1 = 'Fast ends';
const BIUR_CHAMETZ = 'Biur Chametz';
const SOF_ZMAN_ACHILAT_CHAMETZ = 'Finish eating chametz';
const YIZKOR$1 = 'Yizkor';
/**
 * Transliterated names of holidays, used by `Event.getDesc()`
 */
const holidayDesc = {
    /** Asara B'Tevet */
    ASARA_BTEVET: "Asara B'Tevet",
    /** Birkat Hachamah */
    BIRKAT_HACHAMAH: 'Birkat Hachamah',
    /** Chag HaBanot */
    CHAG_HABANOT: 'Chag HaBanot',
    /** Chanukah: 8th Day */
    CHANUKAH_8TH_DAY: 'Chanukah: 8th Day',
    /** Erev Tish'a B'Av */
    EREV_TISHA_BAV: "Erev Tish'a B'Av",
    /** Leil Selichot */
    LEIL_SELICHOT: 'Leil Selichot',
    /** Purim Katan */
    PURIM_KATAN: 'Purim Katan',
    /** Purim Meshulash */
    PURIM_MESHULASH: 'Purim Meshulash',
    /** Shabbat Chazon */
    SHABBAT_CHAZON: 'Shabbat Chazon',
    /** Shabbat HaChodesh */
    SHABBAT_HACHODESH: 'Shabbat HaChodesh',
    /** Shabbat HaGadol */
    SHABBAT_HAGADOL: 'Shabbat HaGadol',
    /** Shabbat Nachamu */
    SHABBAT_NACHAMU: 'Shabbat Nachamu',
    /** Shabbat Parah */
    SHABBAT_PARAH: 'Shabbat Parah',
    /** Shabbat Shekalim */
    SHABBAT_SHEKALIM: 'Shabbat Shekalim',
    /** Shabbat Shirah */
    SHABBAT_SHIRAH: 'Shabbat Shirah',
    /** Shabbat Shuva */
    SHABBAT_SHUVA: 'Shabbat Shuva',
    /** Shabbat Zachor */
    SHABBAT_ZACHOR: 'Shabbat Zachor',
    /** Shushan Purim Katan */
    SHUSHAN_PURIM_KATAN: 'Shushan Purim Katan',
    /** Ta'anit Bechorot */
    TAANIT_BECHOROT: "Ta'anit Bechorot",
    /** Ta'anit BeHaB */
    TAANIT_BEHAB: "Ta'anit BeHaB",
    /** Ta'anit Esther */
    TAANIT_ESTHER: "Ta'anit Esther",
    /** Tish'a B'Av */
    TISHA_BAV: "Tish'a B'Av",
    /** Tzom Gedaliah */
    TZOM_GEDALIAH: 'Tzom Gedaliah',
    /** Tzom Tammuz */
    TZOM_TAMMUZ: 'Tzom Tammuz',
    /** Yom HaAtzma'ut */
    YOM_HAATZMA_UT: "Yom HaAtzma'ut",
    /** Yom HaShoah */
    YOM_HASHOAH: 'Yom HaShoah',
    /** Yom HaZikaron */
    YOM_HAZIKARON: 'Yom HaZikaron',
    /** Ben-Gurion Day */
    BEN_GURION_DAY,
    /** Chanukah: 1 Candle */
    CHANUKAH_1_CANDLE,
    /** Erev Pesach */
    EREV_PESACH,
    /** Erev Purim */
    EREV_PURIM,
    /** Erev Rosh Hashana */
    EREV_ROSH_HASHANA,
    /** Erev Shavuot */
    EREV_SHAVUOT,
    /** Erev Sukkot */
    EREV_SUKKOT,
    /** Erev Yom Kippur */
    EREV_YOM_KIPPUR,
    /** Family Day */
    FAMILY_DAY,
    /** Hebrew Language Day */
    HEBREW_LANGUAGE_DAY,
    /** Herzl Day */
    HERZL_DAY,
    /** Jabotinsky Day */
    JABOTINSKY_DAY,
    /** Lag BaOmer */
    LAG_BAOMER,
    /** Pesach I */
    PESACH_I,
    /** Pesach II */
    PESACH_II,
    /** Pesach III (CH''M) */
    PESACH_III_CHM,
    /** Pesach II (CH''M) */
    PESACH_II_CHM,
    /** Pesach IV (CH''M) */
    PESACH_IV_CHM,
    /** Pesach Sheni */
    PESACH_SHENI,
    /** Pesach VII */
    PESACH_VII,
    /** Pesach VIII */
    PESACH_VIII,
    /** Pesach VI (CH''M) */
    PESACH_VI_CHM,
    /** Pesach V (CH''M) */
    PESACH_V_CHM,
    /** Purim */
    PURIM,
    /** Rosh Hashana II */
    ROSH_HASHANA_II,
    /** Rosh Hashana LaBehemot */
    ROSH_HASHANA_LABEHEMOT,
    /** Shavuot */
    SHAVUOT,
    /** Shavuot I */
    SHAVUOT_I,
    /** Shavuot II */
    SHAVUOT_II,
    /** Shmini Atzeret */
    SHMINI_ATZERET,
    /** Shushan Purim */
    SHUSHAN_PURIM,
    /** Sigd */
    SIGD,
    /** Simchat Torah */
    SIMCHAT_TORAH,
    /** Sukkot I */
    SUKKOT_I,
    /** Sukkot II */
    SUKKOT_II,
    /** Sukkot III (CH''M) */
    SUKKOT_III_CHM,
    /** Sukkot II (CH''M) */
    SUKKOT_II_CHM,
    /** Sukkot IV (CH''M) */
    SUKKOT_IV_CHM,
    /** Sukkot VII (Hoshana Raba) */
    SUKKOT_VII_HOSHANA_RABA,
    /** Sukkot VI (CH''M) */
    SUKKOT_VI_CHM,
    /** Sukkot V (CH''M) */
    SUKKOT_V_CHM,
    /** Tu B\'Av */
    TU_BAV,
    /** Tu BiShvat */
    TU_BISHVAT,
    /** Yitzhak Rabin Memorial Day */
    YITZHAK_RABIN_MEMORIAL_DAY,
    /** Yom HaAliyah */
    YOM_HAALIYAH,
    /** Yom HaAliyah School Observance */
    YOM_HAALIYAH_SCHOOL_OBSERVANCE,
    /** Yom Kippur */
    YOM_KIPPUR,
    /** Yom Yerushalayim */
    YOM_YERUSHALAYIM,
    /** Candle lighting */
    CANDLE_LIGHTING: CANDLE_LIGHTING$1,
    /** Havdalah */
    HAVDALAH: HAVDALAH$1,
    /** Fast begins */
    FAST_BEGINS: FAST_BEGINS$1,
    /** Fast ends */
    FAST_ENDS: FAST_ENDS$1,
    /** Biur Chametz */
    BIUR_CHAMETZ,
    /** Finish eating chametz */
    SOF_ZMAN_ACHILAT_CHAMETZ,
    /** Yizkor */
    YIZKOR: YIZKOR$1,
};
const staticHolidays = [
    {
        mm: Tishrei,
        dd: 2,
        desc: ROSH_HASHANA_II,
        flags: CHAG$1 | YOM_TOV_ENDS$1,
        emoji: '🍏🍯',
    },
    { mm: Tishrei, dd: 9, desc: EREV_YOM_KIPPUR, flags: EREV$3 | LIGHT_CANDLES$3 },
    {
        mm: Tishrei,
        dd: 10,
        desc: YOM_KIPPUR,
        flags: CHAG$1 | MAJOR_FAST$2 | YOM_TOV_ENDS$1,
    },
    {
        mm: Tishrei,
        dd: 14,
        desc: EREV_SUKKOT,
        flags: CHUL_ONLY$1 | EREV$3 | LIGHT_CANDLES$3,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 15,
        desc: SUKKOT_I,
        flags: CHUL_ONLY$1 | CHAG$1 | LIGHT_CANDLES_TZEIS$3,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 16,
        desc: SUKKOT_II,
        flags: CHUL_ONLY$1 | CHAG$1 | YOM_TOV_ENDS$1,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 17,
        desc: SUKKOT_III_CHM,
        flags: CHUL_ONLY$1 | CHOL_HAMOED$1,
        chmDay: 1,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 18,
        desc: SUKKOT_IV_CHM,
        flags: CHUL_ONLY$1 | CHOL_HAMOED$1,
        chmDay: 2,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 19,
        desc: SUKKOT_V_CHM,
        flags: CHUL_ONLY$1 | CHOL_HAMOED$1,
        chmDay: 3,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 20,
        desc: SUKKOT_VI_CHM,
        flags: CHUL_ONLY$1 | CHOL_HAMOED$1,
        chmDay: 4,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 22,
        desc: SHMINI_ATZERET,
        flags: CHUL_ONLY$1 | CHAG$1 | LIGHT_CANDLES_TZEIS$3,
    },
    {
        mm: Tishrei,
        dd: 23,
        desc: SIMCHAT_TORAH,
        flags: CHUL_ONLY$1 | CHAG$1 | YOM_TOV_ENDS$1,
    },
    {
        mm: Tishrei,
        dd: 14,
        desc: EREV_SUKKOT,
        flags: IL_ONLY$2 | EREV$3 | LIGHT_CANDLES$3,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 15,
        desc: SUKKOT_I,
        flags: IL_ONLY$2 | CHAG$1 | YOM_TOV_ENDS$1,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 16,
        desc: SUKKOT_II_CHM,
        flags: IL_ONLY$2 | CHOL_HAMOED$1,
        chmDay: 1,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 17,
        desc: SUKKOT_III_CHM,
        flags: IL_ONLY$2 | CHOL_HAMOED$1,
        chmDay: 2,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 18,
        desc: SUKKOT_IV_CHM,
        flags: IL_ONLY$2 | CHOL_HAMOED$1,
        chmDay: 3,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 19,
        desc: SUKKOT_V_CHM,
        flags: IL_ONLY$2 | CHOL_HAMOED$1,
        chmDay: 4,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 20,
        desc: SUKKOT_VI_CHM,
        flags: IL_ONLY$2 | CHOL_HAMOED$1,
        chmDay: 5,
        emoji: emojiSukkot,
    },
    {
        mm: Tishrei,
        dd: 22,
        desc: SHMINI_ATZERET,
        flags: IL_ONLY$2 | CHAG$1 | YOM_TOV_ENDS$1,
    },
    {
        mm: Tishrei,
        dd: 21,
        desc: SUKKOT_VII_HOSHANA_RABA,
        flags: LIGHT_CANDLES$3 | CHOL_HAMOED$1,
        chmDay: -1,
        emoji: emojiSukkot,
    },
    { mm: Shvat, dd: 15, desc: TU_BISHVAT, flags: MINOR_HOLIDAY$2, emoji: '🌳' },
    {
        mm: Adar2,
        dd: 13,
        desc: EREV_PURIM,
        flags: EREV$3 | MINOR_HOLIDAY$2,
        emoji: '🎭️📜',
    },
    { mm: Adar2, dd: 14, desc: PURIM, flags: MINOR_HOLIDAY$2, emoji: '🎭️📜' },
    {
        mm: Adar2,
        dd: 15,
        desc: SHUSHAN_PURIM,
        flags: MINOR_HOLIDAY$2,
        emoji: '🎭️📜',
    },
    // Pesach Israel
    {
        mm: Nisan,
        dd: 14,
        desc: EREV_PESACH,
        flags: IL_ONLY$2 | EREV$3 | LIGHT_CANDLES$3,
        emoji: '🫓🍷',
    },
    {
        mm: Nisan,
        dd: 15,
        desc: PESACH_I,
        flags: IL_ONLY$2 | CHAG$1 | YOM_TOV_ENDS$1,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 16,
        desc: PESACH_II_CHM,
        flags: IL_ONLY$2 | CHOL_HAMOED$1,
        chmDay: 1,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 17,
        desc: PESACH_III_CHM,
        flags: IL_ONLY$2 | CHOL_HAMOED$1,
        chmDay: 2,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 18,
        desc: PESACH_IV_CHM,
        flags: IL_ONLY$2 | CHOL_HAMOED$1,
        chmDay: 3,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 19,
        desc: PESACH_V_CHM,
        flags: IL_ONLY$2 | CHOL_HAMOED$1,
        chmDay: 4,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 20,
        desc: PESACH_VI_CHM,
        flags: IL_ONLY$2 | CHOL_HAMOED$1 | LIGHT_CANDLES$3,
        chmDay: 5,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 21,
        desc: PESACH_VII,
        flags: IL_ONLY$2 | CHAG$1 | YOM_TOV_ENDS$1,
        emoji: emojiPesach,
    },
    // Pesach chutz l'aretz
    {
        mm: Nisan,
        dd: 14,
        desc: EREV_PESACH,
        flags: CHUL_ONLY$1 | EREV$3 | LIGHT_CANDLES$3,
        emoji: '🫓🍷',
    },
    {
        mm: Nisan,
        dd: 15,
        desc: PESACH_I,
        flags: CHUL_ONLY$1 | CHAG$1 | LIGHT_CANDLES_TZEIS$3,
        emoji: '🫓🍷',
    },
    {
        mm: Nisan,
        dd: 16,
        desc: PESACH_II,
        flags: CHUL_ONLY$1 | CHAG$1 | YOM_TOV_ENDS$1,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 17,
        desc: PESACH_III_CHM,
        flags: CHUL_ONLY$1 | CHOL_HAMOED$1,
        chmDay: 1,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 18,
        desc: PESACH_IV_CHM,
        flags: CHUL_ONLY$1 | CHOL_HAMOED$1,
        chmDay: 2,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 19,
        desc: PESACH_V_CHM,
        flags: CHUL_ONLY$1 | CHOL_HAMOED$1,
        chmDay: 3,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 20,
        desc: PESACH_VI_CHM,
        flags: CHUL_ONLY$1 | CHOL_HAMOED$1 | LIGHT_CANDLES$3,
        chmDay: 4,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 21,
        desc: PESACH_VII,
        flags: CHUL_ONLY$1 | CHAG$1 | LIGHT_CANDLES_TZEIS$3,
        emoji: emojiPesach,
    },
    {
        mm: Nisan,
        dd: 22,
        desc: PESACH_VIII,
        flags: CHUL_ONLY$1 | CHAG$1 | YOM_TOV_ENDS$1,
        emoji: emojiPesach,
    },
    { mm: Iyyar, dd: 14, desc: PESACH_SHENI, flags: MINOR_HOLIDAY$2 },
    { mm: Iyyar, dd: 18, desc: LAG_BAOMER, flags: MINOR_HOLIDAY$2, emoji: '🔥' },
    {
        mm: Sivan,
        dd: 5,
        desc: EREV_SHAVUOT,
        flags: EREV$3 | LIGHT_CANDLES$3,
        emoji: '⛰️🌸',
    },
    {
        mm: Sivan,
        dd: 6,
        desc: SHAVUOT,
        flags: IL_ONLY$2 | CHAG$1 | YOM_TOV_ENDS$1,
        emoji: '⛰️🌸',
    },
    {
        mm: Sivan,
        dd: 6,
        desc: SHAVUOT_I,
        flags: CHUL_ONLY$1 | CHAG$1 | LIGHT_CANDLES_TZEIS$3,
        emoji: '⛰️🌸',
    },
    {
        mm: Sivan,
        dd: 7,
        desc: SHAVUOT_II,
        flags: CHUL_ONLY$1 | CHAG$1 | YOM_TOV_ENDS$1,
        emoji: '⛰️🌸',
    },
    { mm: Av, dd: 15, desc: TU_BAV, flags: MINOR_HOLIDAY$2, emoji: '❤️' },
    {
        mm: Elul,
        dd: 1,
        desc: ROSH_HASHANA_LABEHEMOT,
        flags: MINOR_HOLIDAY$2,
        emoji: '🐑',
    },
    {
        mm: Elul,
        dd: 29,
        desc: EREV_ROSH_HASHANA,
        flags: EREV$3 | LIGHT_CANDLES$3,
        emoji: '🍏🍯',
    },
];
const staticModernHolidays = [
    { firstYear: 5727, mm: Iyyar, dd: 28, desc: YOM_YERUSHALAYIM, chul: true },
    {
        firstYear: 5737,
        mm: Kislev,
        dd: 6,
        desc: BEN_GURION_DAY,
        satPostponeToSun: true,
        friPostponeToSun: true,
    },
    { firstYear: 5750, mm: Shvat, dd: 30, desc: FAMILY_DAY },
    {
        firstYear: 5758,
        mm: Cheshvan,
        dd: 12,
        desc: YITZHAK_RABIN_MEMORIAL_DAY,
        friSatMovetoThu: true,
    },
    { firstYear: 5764, mm: Iyyar, dd: 10, desc: HERZL_DAY, satPostponeToSun: true },
    {
        firstYear: 5765,
        mm: Tamuz,
        dd: 29,
        desc: JABOTINSKY_DAY,
        satPostponeToSun: true,
    },
    {
        firstYear: 5769,
        mm: Cheshvan,
        dd: 29,
        desc: SIGD,
        chul: true,
        suppressEmoji: true,
        friSatMovetoThu: true,
    },
    { firstYear: 5777, mm: Nisan, dd: 10, desc: YOM_HAALIYAH, chul: true },
    { firstYear: 5777, mm: Cheshvan, dd: 7, desc: YOM_HAALIYAH_SCHOOL_OBSERVANCE },
    // https://www.gov.il/he/departments/policies/2012_des5234
    {
        firstYear: 5773,
        mm: months.TEVET,
        dd: 21,
        desc: HEBREW_LANGUAGE_DAY,
        friSatMovetoThu: true,
    },
];

/**
 * Represents a built-in holiday like Pesach, Purim or Tu BiShvat.
 *
 * Most holiday-related events emitted by {@link calendar}
 * are instances of `HolidayEvent` or one of its subclasses
 * ({@link ChanukahEvent}, {@link AsaraBTevetEvent},
 * {@link RoshHashanaEvent}, {@link RoshChodeshEvent}).
 *
 * Adds two notable behaviors over the base {@link Event}:
 *
 * - {@link HolidayEvent.basename} strips qualifiers like `Erev `, ` I`/`II`,
 *   `(CH''M)`, `(observed)`, candle counts, etc. (e.g. `"Erev Pesach"` →
 *   `"Pesach"`).
 * - {@link HolidayEvent.url} returns a `https://www.hebcal.com/holidays/...`
 *   link for the holiday.
 */
class HolidayEvent extends Event {
    constructor(date, desc, mask = 0, attrs) {
        super(date, desc, mask, attrs);
        if (typeof attrs === 'object' && attrs !== null) {
            Object.assign(this, attrs);
        }
    }
    /**
     * Returns a simplified (untranslated) name for this holiday, stripping
     * qualifiers so that related events group under one name.
     *
     * Strips trailing 4-digit years, `(CH''M)`, `(observed)`, `(Hoshana Raba)`,
     * Roman-numeral day numbers (` I`, ` II`, ...), Chanukah candle counts,
     * `: 8th Day`, and a leading `"Erev "`.
     * @example
     * // 'Erev Pesach'           => 'Pesach'
     * // 'Sukkot III (CH''M)'    => 'Sukkot'
     * // 'Chanukah: 5 Candles'   => 'Chanukah'
     * // 'Rosh Hashana 5784'     => 'Rosh Hashana'
     */
    basename() {
        return this.getDesc()
            .replace(/ \d{4}$/, '')
            .replace(/ \(CH''M\)$/, '')
            .replace(/ \(observed\)$/, '')
            .replace(/ \(Hoshana Raba\)$/, '')
            .replace(/ [IV]+$/, '')
            .replace(/: \d Candles?$/, '')
            .replace(/: 8th Day$/, '')
            .replace(/^Erev /, '');
    }
    /**
     * Returns a `https://www.hebcal.com/holidays/...` URL for more detail on
     * this holiday. Israel-only holidays get an `?i=on` query parameter.
     * Returns `undefined` for years outside `[100, 2999]`.
     */
    url() {
        const year = this.greg().getFullYear();
        if (year < 100 || year > 2999) {
            return undefined;
        }
        const url = 'https://www.hebcal.com/holidays/' +
            urlFriendly(this.basename()) +
            '-' +
            this.urlDateSuffix();
        return this.getFlags() & flags.IL_ONLY ? url + '?i=on' : url;
    }
    /**
     * The date portion of {@link url}. For most holidays this is just the
     * Gregorian year; subclasses override it when a year alone is ambiguous.
     */
    urlDateSuffix() {
        const year = this.greg().getFullYear();
        return String(year);
    }
    getEmoji() {
        if (this.emoji) {
            return this.emoji;
        }
        if (this.getFlags() & flags.SPECIAL_SHABBAT) {
            return '🕍';
        }
        return '✡️';
    }
    getCategories() {
        if (this.cholHaMoedDay) {
            return ['holiday', 'major', 'cholhamoed'];
        }
        const cats = super.getCategories();
        if (cats[0] !== 'unknown') {
            return cats;
        }
        // Don't depend on flags.MINOR_HOLIDAY always being set. Look for minor holidays.
        const desc = this.getDesc();
        switch (desc) {
            case holidayDesc.LAG_BAOMER:
            case holidayDesc.LEIL_SELICHOT:
            case holidayDesc.PESACH_SHENI:
            case holidayDesc.EREV_PURIM:
            case holidayDesc.PURIM_KATAN:
            case holidayDesc.SHUSHAN_PURIM:
            case holidayDesc.TU_BAV:
            case holidayDesc.TU_BISHVAT:
            case holidayDesc.ROSH_HASHANA_LABEHEMOT:
                return ['holiday', 'minor'];
        }
        return ['holiday', 'major'];
    }
    /**
     * Returns (translated) description of this event
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    render(locale) {
        const str = super.render(locale);
        return smartApostrophe(str);
    }
    /**
     * Returns a brief (translated) description of this event.
     * For most events, this is the same as render(). For some events, it procudes
     * a shorter text (e.g. without a time or added description).
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    renderBrief(locale) {
        const str = super.renderBrief(locale);
        return smartApostrophe(str);
    }
}
/**
 * Because Asara B'Tevet often occurs twice in the same Gregorian year,
 * we subclass HolidayEvent to generate the correct URL.
 */
class AsaraBTevetEvent extends HolidayEvent {
    /** Full `YYYYMMDD` date, since the Gregorian year alone is ambiguous here */
    urlDateSuffix() {
        const isoDate = isoDateString(this.greg());
        return isoDate.replaceAll('-', '');
    }
}
const chanukahEmoji = '🕎';
const KEYCAP_DIGITS = [
    '0️⃣',
    '1️⃣',
    '2️⃣',
    '3️⃣',
    '4️⃣',
    '5️⃣',
    '6️⃣',
    '7️⃣',
    '8️⃣',
    '9️⃣',
];
/**
 * Because Chanukah sometimes starts in December and ends in January,
 * we subclass HolidayEvent to generate the correct URL.
 */
class ChanukahEvent extends HolidayEvent {
    /**
     * @param chanukahDay should be undefined for 1st night of Chanukah
     */
    constructor(date, desc, mask, chanukahDay) {
        super(date, desc, mask);
        this.chanukahDay = chanukahDay;
        this.emoji = chanukahEmoji;
        if (chanukahDay !== 8) {
            const candles = chanukahDay ? chanukahDay + 1 : 1;
            this.emoji += KEYCAP_DIGITS[candles];
        }
    }
    urlDateSuffix() {
        const dt = this.greg();
        let year = dt.getFullYear();
        if (dt.getMonth() === 0) {
            year--;
        }
        return String(year);
    }
}
/** Represents Rosh Hashana, the Jewish New Year */
class RoshHashanaEvent extends HolidayEvent {
    /**
     * Normally created by {@link calendar} rather than directly.
     * @param date Hebrew date event occurs
     * @param hyear Hebrew year
     * @param mask optional holiday flags
     */
    constructor(date, hyear, mask) {
        super(date, `Rosh Hashana ${hyear}`, mask);
        this.hyear = hyear;
    }
    /**
     * Returns (translated) description of this event
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    render(locale) {
        return Locale.gettext('Rosh Hashana', locale) + ' ' + this.hyear;
    }
    getEmoji() {
        return '🍏🍯';
    }
}
const roshChodeshStr = 'Rosh Chodesh';
/** Represents Rosh Chodesh, the beginning of a new month */
class RoshChodeshEvent extends HolidayEvent {
    /**
     * Constructs Rosh Chodesh event
     * @param date Hebrew date event occurs
     * @param monthName Hebrew month name (not translated)
     */
    constructor(date, monthName) {
        super(date, `${roshChodeshStr} ${monthName}`, flags.ROSH_CHODESH);
    }
    /**
     * Returns (translated) description of this event
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    render(locale) {
        const monthName = this.getDesc().substring(roshChodeshStr.length + 1);
        const monthName0 = Locale.gettext(monthName, locale);
        const monthName1 = smartApostrophe(monthName0);
        return Locale.gettext(roshChodeshStr, locale) + ' ' + monthName1;
    }
    basename() {
        return this.getDesc();
    }
    getEmoji() {
        return this.emoji || '🌒';
    }
}

const ykk = 'Yom Kippur Katan';
/** YKK is minor day of atonement on the day preceeding each Rosh Chodesh */
class YomKippurKatanEvent extends HolidayEvent {
    /**
     * Normally created by {@link calendar} (via
     * `options.yomKippurKatan`) rather than directly.
     * @param date Hebrew date event occurs
     * @param nextMonthName name of the upcoming month
     */
    constructor(date, nextMonthName) {
        super(date, `${ykk} ${nextMonthName}`, flags.MINOR_FAST | flags.YOM_KIPPUR_KATAN);
        this.nextMonthName = nextMonthName;
        this.memo = `Minor Day of Atonement on the day preceeding Rosh Chodesh ${nextMonthName}`;
    }
    basename() {
        return this.getDesc();
    }
    /**
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    render(locale) {
        const monthName0 = Locale.gettext(this.nextMonthName, locale);
        const monthName = smartApostrophe(monthName0);
        return Locale.gettext(ykk, locale) + ' ' + monthName;
    }
    /**
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    renderBrief(locale) {
        return Locale.gettext(ykk, locale);
    }
    url() {
        return undefined;
    }
}

/*
    Hebcal - A Jewish Calendar Generator
    Copyright (c) 1994-2020 Danny Sadinoff
    Portions copyright Eyal Schachter and Michael J. Radwin

    https://github.com/hebcal/hebcal-es6

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation; either version 2
    of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Returns an array of holiday Events that occur on the given date, or
 * `undefined` if no holidays occur that day.
 *
 * When `il` is omitted, both Diaspora-only and Israel-only events are
 * returned (e.g. on the second day of a Yom Tov, both `"Pesach II"` for
 * Diaspora and any Israel-only events). Pass `true` or `false` to filter
 * to a single schedule.
 * @example
 * import {getHolidaysOnDate, HDate, months} from '@hebcal/core';
 * const events = getHolidaysOnDate(new HDate(15, months.NISAN, 5784), false);
 * events?.map(ev => ev.getDesc()); // ['Pesach I']
 * @param date Hebrew Date, Gregorian date, or absolute R.D. day number
 * @param [il] use the Israeli schedule for holidays
 */
function getHolidaysOnDate(date, il) {
    const hd = HDate.isHDate(date) ? date : new HDate(date);
    const hdStr = hd.toString();
    const yearMap = getHolidaysForYear_(hd.getFullYear());
    const events = yearMap.get(hdStr);
    // if il isn't a boolean return both diaspora + IL for day
    if (il === undefined || events === undefined) {
        return events;
    }
    const filtered = events.filter(ev => ev.observedIn(il));
    return filtered;
}
const CHAG = flags.CHAG;
const IL_ONLY$1 = flags.IL_ONLY;
const LIGHT_CANDLES_TZEIS$2 = flags.LIGHT_CANDLES_TZEIS;
const CHANUKAH_CANDLES$1 = flags.CHANUKAH_CANDLES;
const BEHAB$1 = flags.BEHAB;
const MINOR_FAST$1 = flags.MINOR_FAST;
const SPECIAL_SHABBAT$1 = flags.SPECIAL_SHABBAT;
const MODERN_HOLIDAY$1 = flags.MODERN_HOLIDAY;
const MAJOR_FAST$1 = flags.MAJOR_FAST;
const MINOR_HOLIDAY$1 = flags.MINOR_HOLIDAY;
const EREV$2 = flags.EREV;
const SUN = 0;
const TUE = 2;
const THU = 4;
const FRI$1 = 5;
const SAT$2 = 6;
const NISAN$2 = months.NISAN;
const IYYAR = months.IYYAR;
const TAMUZ$1 = months.TAMUZ;
const AV$1 = months.AV;
const TISHREI$1 = months.TISHREI;
const CHESHVAN = months.CHESHVAN;
const KISLEV = months.KISLEV;
const TEVET = months.TEVET;
const ADAR_I = months.ADAR_I;
const ADAR_II = months.ADAR_II;
const emojiIsraelFlag = { emoji: '🇮🇱' };
const yearCache = new QuickLRU({ maxSize: 120 });
/**
 * Lower-level holidays interface, which returns a `Map` of `Event`s indexed by
 * `HDate.toString()`. These events must filtered especially for `flags.IL_ONLY`
 * or `flags.CHUL_ONLY` depending on Israel vs. Diaspora holiday scheme.
 * @private
 */
function getHolidaysForYear_(year) {
    if (typeof year !== 'number') {
        throw new TypeError(`bad Hebrew year: ${year}`);
    }
    if (year < 1 || year > 32658) {
        throw new RangeError(`Hebrew year ${year} out of range 1-32658`);
    }
    const cached = yearCache.get(year);
    if (cached) {
        return cached;
    }
    const RH = new HDate(1, TISHREI$1, year);
    const pesach = new HDate(15, NISAN$2, year);
    const map = new Map();
    function add(...events) {
        for (const ev of events) {
            const key = ev.date.toString();
            const arr = map.get(key);
            if (typeof arr === 'object') {
                if (arr[0].getFlags() & EREV$2) {
                    arr.unshift(ev);
                }
                else {
                    arr.push(ev);
                }
            }
            else {
                map.set(key, [ev]);
            }
        }
    }
    for (const h of staticHolidays) {
        const hd = new HDate(h.dd, h.mm, year);
        const attrs = {};
        if (h.emoji)
            attrs.emoji = h.emoji;
        if (h.chmDay)
            attrs.cholHaMoedDay = h.chmDay;
        const ev = new HolidayEvent(hd, h.desc, h.flags, attrs);
        add(ev);
    }
    // standard holidays that don't shift based on year
    add(new RoshHashanaEvent(RH, year, CHAG | LIGHT_CANDLES_TZEIS$2));
    // Variable date holidays
    const tzomGedaliahDay = RH.getDay() === THU ? 4 : 3;
    add(new HolidayEvent(new HDate(tzomGedaliahDay, TISHREI$1, year), holidayDesc.TZOM_GEDALIAH, MINOR_FAST$1));
    // first SAT after RH
    add(new HolidayEvent(new HDate(HDate.dayOnOrBefore(SAT$2, 7 + RH.abs())), holidayDesc.SHABBAT_SHUVA, SPECIAL_SHABBAT$1));
    const rchTevet = HDate.shortKislev(year)
        ? new HDate(1, TEVET, year)
        : new HDate(30, KISLEV, year);
    add(new HolidayEvent(rchTevet, holidayDesc.CHAG_HABANOT, MINOR_HOLIDAY$1));
    add(new ChanukahEvent(new HDate(24, KISLEV, year), holidayDesc.CHANUKAH_1_CANDLE, EREV$2 | MINOR_HOLIDAY$1 | CHANUKAH_CANDLES$1, undefined));
    // yes, we know Kislev 30-32 are wrong
    // HDate() corrects the month automatically
    for (let candles = 2; candles <= 8; candles++) {
        const hd = new HDate(23 + candles, KISLEV, year);
        add(new ChanukahEvent(hd, `Chanukah: ${candles} Candles`, MINOR_HOLIDAY$1 | CHANUKAH_CANDLES$1, candles - 1));
    }
    add(new ChanukahEvent(new HDate(32, KISLEV, year), holidayDesc.CHANUKAH_8TH_DAY, MINOR_HOLIDAY$1, 8));
    add(new AsaraBTevetEvent(new HDate(10, TEVET, year), holidayDesc.ASARA_BTEVET, MINOR_FAST$1));
    const pesachAbs = pesach.abs();
    add(new HolidayEvent(new HDate(HDate.dayOnOrBefore(SAT$2, pesachAbs - 43)), holidayDesc.SHABBAT_SHEKALIM, SPECIAL_SHABBAT$1), new HolidayEvent(new HDate(HDate.dayOnOrBefore(SAT$2, pesachAbs - 30)), holidayDesc.SHABBAT_ZACHOR, SPECIAL_SHABBAT$1), new HolidayEvent(new HDate(pesachAbs - (pesach.getDay() === TUE ? 33 : 31)), holidayDesc.TAANIT_ESTHER, MINOR_FAST$1));
    const haChodeshAbs = HDate.dayOnOrBefore(SAT$2, pesachAbs - 14);
    add(new HolidayEvent(new HDate(haChodeshAbs - 7), holidayDesc.SHABBAT_PARAH, SPECIAL_SHABBAT$1), new HolidayEvent(new HDate(haChodeshAbs), holidayDesc.SHABBAT_HACHODESH, SPECIAL_SHABBAT$1), new HolidayEvent(new HDate(HDate.dayOnOrBefore(SAT$2, pesachAbs - 1)), holidayDesc.SHABBAT_HAGADOL, SPECIAL_SHABBAT$1), new HolidayEvent(
    // if the fast falls on Shabbat, move to Thursday
    pesach.prev().getDay() === SAT$2
        ? pesach.onOrBefore(THU)
        : new HDate(14, NISAN$2, year), holidayDesc.TAANIT_BECHOROT, MINOR_FAST$1));
    add(new HolidayEvent(new HDate(HDate.dayOnOrBefore(SAT$2, new HDate(1, TISHREI$1, year + 1).abs() - 4)), holidayDesc.LEIL_SELICHOT, MINOR_HOLIDAY$1, { emoji: '🕍' }));
    if (pesach.getDay() === SUN) {
        add(new HolidayEvent(new HDate(16, ADAR_II, year), holidayDesc.PURIM_MESHULASH, MINOR_HOLIDAY$1));
    }
    if (HDate.isLeapYear(year)) {
        add(new HolidayEvent(new HDate(14, ADAR_I, year), holidayDesc.PURIM_KATAN, MINOR_HOLIDAY$1, { emoji: '🎭️' }));
        add(new HolidayEvent(new HDate(15, ADAR_I, year), holidayDesc.SHUSHAN_PURIM_KATAN, MINOR_HOLIDAY$1, { emoji: '🎭️' }));
    }
    const nisan27dt = dateYomHaShoah(year);
    if (nisan27dt) {
        add(new HolidayEvent(nisan27dt, holidayDesc.YOM_HASHOAH, MODERN_HOLIDAY$1));
    }
    const yomHaZikaronDt = dateYomHaZikaron(year);
    if (yomHaZikaronDt) {
        add(new HolidayEvent(yomHaZikaronDt, holidayDesc.YOM_HAZIKARON, MODERN_HOLIDAY$1, emojiIsraelFlag), new HolidayEvent(yomHaZikaronDt.next(), holidayDesc.YOM_HAATZMA_UT, MODERN_HOLIDAY$1, emojiIsraelFlag));
    }
    for (const h of staticModernHolidays) {
        if (year >= h.firstYear) {
            let hd = new HDate(h.dd, h.mm, year);
            const dow = hd.getDay();
            if (h.friSatMovetoThu && (dow === FRI$1 || dow === SAT$2)) {
                hd = hd.onOrBefore(THU);
            }
            else if (h.friPostponeToSun && dow === FRI$1) {
                hd = new HDate(hd.abs() + 2);
            }
            else if (h.satPostponeToSun && dow === SAT$2) {
                hd = hd.next();
            }
            const mask = h.chul ? MODERN_HOLIDAY$1 : MODERN_HOLIDAY$1 | IL_ONLY$1;
            const ev = new HolidayEvent(hd, h.desc, mask);
            if (!h.suppressEmoji) {
                ev.emoji = '🇮🇱';
            }
            add(ev);
        }
    }
    let tamuz17 = new HDate(17, TAMUZ$1, year);
    let tamuz17attrs;
    if (tamuz17.getDay() === SAT$2) {
        tamuz17 = new HDate(18, TAMUZ$1, year);
        tamuz17attrs = { observed: true };
    }
    add(new HolidayEvent(tamuz17, holidayDesc.TZOM_TAMMUZ, MINOR_FAST$1, tamuz17attrs));
    let av9dt = new HDate(9, AV$1, year);
    let av9title = holidayDesc.TISHA_BAV;
    let av9attrs;
    if (av9dt.getDay() === SAT$2) {
        av9dt = av9dt.next();
        av9attrs = { observed: true };
        av9title += ' (observed)';
    }
    const av9abs = av9dt.abs();
    add(new HolidayEvent(new HDate(HDate.dayOnOrBefore(SAT$2, av9abs)), holidayDesc.SHABBAT_CHAZON, SPECIAL_SHABBAT$1), new HolidayEvent(av9dt.prev(), holidayDesc.EREV_TISHA_BAV, EREV$2 | MAJOR_FAST$1, av9attrs), new HolidayEvent(av9dt, av9title, MAJOR_FAST$1, av9attrs), new HolidayEvent(new HDate(HDate.dayOnOrBefore(SAT$2, av9abs + 7)), holidayDesc.SHABBAT_NACHAMU, SPECIAL_SHABBAT$1));
    const monthsInYear = HDate.monthsInYear(year);
    for (let month = 1; month <= monthsInYear; month++) {
        const monthName = HDate.getMonthName(month, year);
        if ((month === NISAN$2
            ? HDate.daysInMonth(HDate.monthsInYear(year - 1), year - 1)
            : HDate.daysInMonth(month - 1, year)) === 30) {
            add(new RoshChodeshEvent(new HDate(1, month, year), monthName));
            add(new RoshChodeshEvent(new HDate(30, month - 1, year), monthName));
        }
        else if (month !== TISHREI$1) {
            add(new RoshChodeshEvent(new HDate(1, month, year), monthName));
        }
    }
    // Begin: Yom Kippur Katan
    // start at Iyyar because one may not fast during Nisan
    for (let month = months.IYYAR; month <= monthsInYear; month++) {
        const nextMonth = month + 1;
        // Yom Kippur Katan is not observed on the day before Rosh Hashanah.
        // Not observed prior to Rosh Chodesh Cheshvan because Yom Kippur has just passed.
        // Not observed before Rosh Chodesh Tevet, because that day is Hanukkah.
        if (nextMonth === TISHREI$1 ||
            nextMonth === months.CHESHVAN ||
            nextMonth === TEVET) {
            continue;
        }
        let ykk = new HDate(29, month, year);
        const dow = ykk.getDay();
        if (dow === FRI$1 || dow === SAT$2) {
            ykk = ykk.onOrBefore(THU);
        }
        const nextMonthName = HDate.getMonthName(nextMonth, year);
        const ev = new YomKippurKatanEvent(ykk, nextMonthName);
        add(ev);
    }
    for (const month of [CHESHVAN, IYYAR]) {
        const roshChodesh = new HDate(1, month, year);
        let shabbos = new HDate(HDate.dayOnOrBefore(SAT$2, roshChodesh.abs() + 6));
        if (shabbos.abs() === roshChodesh.abs()) {
            shabbos = new HDate(shabbos.abs() + 7);
        }
        const fastDays = [2, 5, 9].map(offset => new HDate(shabbos.abs() + offset));
        if (month === IYYAR && fastDays[2].getDate() === 14) {
            fastDays[2] = new HDate(17, IYYAR, year);
        }
        for (const hd of fastDays) {
            add(new HolidayEvent(hd, holidayDesc.TAANIT_BEHAB, MINOR_FAST$1 | BEHAB$1));
        }
    }
    const sedra = getSedra(year, false);
    const beshalachHd = sedra.find(15);
    add(new HolidayEvent(beshalachHd, holidayDesc.SHABBAT_SHIRAH, SPECIAL_SHABBAT$1));
    // Birkat Hachamah appears only once every 28 years
    const birkatHaChama = getBirkatHaChama(year);
    if (birkatHaChama) {
        const hd = new HDate(birkatHaChama);
        add(new HolidayEvent(hd, holidayDesc.BIRKAT_HACHAMAH, MINOR_HOLIDAY$1, { emoji: '☀️' }));
    }
    yearCache.set(year, map);
    return map;
}
/**
 * Birkat Hachamah appears only once every 28 years.
 * Although almost always in Nisan, it can occur in Adar II.
 *   - 27 Adar II 5461 (Gregorian year 1701)
 *   - 29 Adar II 5993 (Gregorian year 2233)
 *
 * Due to drift, this will eventually slip into Iyyar
 *   - 2 Iyyar 7141 (Gregorian year 3381)
 * @private
 */
function getBirkatHaChama(year) {
    const leap = HDate.isLeapYear(year);
    const startMonth = leap ? ADAR_II : NISAN$2;
    const startDay = leap ? 20 : 1;
    const baseRd = HDate.hebrew2abs(year, startMonth, startDay);
    for (let day = 0; day <= 40; day++) {
        const abs = baseRd + day;
        const elapsed = abs + 1373429;
        if (elapsed % 10227 === 172) {
            return abs;
        }
    }
    return 0;
}
/**
 * Returns a sorted array of holidays observed during the given Hebrew year,
 * filtered by Israel vs. Diaspora schedule.
 *
 * Includes Rosh Chodesh, fasts, special Shabbatot, modern holidays, etc.,
 * but does not generate candle-lighting times, Torah readings, or Omer days.
 * Use {@link calendar} for those.
 * @example
 * import {getHolidaysForYearArray} from '@hebcal/core';
 * const events = getHolidaysForYearArray(5784, false);
 * console.log(events[0].getDesc()); // 'Rosh Hashana 5784'
 * @param year Hebrew year
 * @param il use the Israeli schedule for holidays
 */
function getHolidaysForYearArray(year, il) {
    const yearMap = getHolidaysForYear_(year);
    const startAbs = HDate.hebrew2abs(year, TISHREI$1, 1);
    const endAbs = HDate.hebrew2abs(year + 1, TISHREI$1, 1) - 1;
    let events = [];
    for (let absDt = startAbs; absDt <= endAbs; absDt++) {
        const hd = new HDate(absDt);
        const holidays = yearMap.get(hd.toString());
        if (holidays) {
            const filtered = holidays.filter(ev => ev.observedIn(il));
            events = events.concat(filtered);
        }
    }
    return events;
}

const LIGHT_CANDLES$2 = flags.LIGHT_CANDLES | flags.LIGHT_CANDLES_TZEIS;
function isTomorrowShabbosOrYomTov(dow, events) {
    if (dow === 5) {
        return true;
    }
    const erev = events.find(ev => ev.getFlags() & LIGHT_CANDLES$2);
    if (erev) {
        return true;
    }
    return false;
}
/**
 * Returns true if it is _Shabbos_ or if it is a _Yom Tov_ day that has a
 * _melacha_ (work) prohibition.
 *
 * @param dow day of week, where `6` is Shabbos
 * @param events events occurring on the day
 * @return `true` if the day is a _Yom Tov_ that is _assur bemlacha_, or _Shabbos_
 */
function isTodayAssurBemelacha(dow, events) {
    if (dow === 6) {
        return true;
    }
    const chag = events.find(ev => ev.getFlags() & flags.CHAG);
    if (chag) {
        return true;
    }
    return false;
}
/**
 * Returns `true` if the given moment (date + time) falls within a period
 * when *melacha* (work) is prohibited — i.e. Shabbat or a Yom Tov.
 *
 * The Shabbat/Yom Tov window is taken to begin at sunset (shkiah) on the
 * preceding day (Erev Shabbat / Erev Yom Tov / Yom Tov sheni) and to end
 * at *tzais* (nightfall) on the day itself. *Tzais* is calculated using a
 * solar depression of 8.5° for simplicity; consult a halachic authority
 * for more stringent opinions.
 *
 * `useElevation` controls whether the location's elevation is taken into
 * account when computing sunset (it has no effect on the degree-based
 * tzais calculation). The Israel/Diaspora schedule comes from
 * `location.getIsrael()`.
 *
 * Throws if sunset cannot be calculated for the given location
 * (e.g. polar regions).
 * @example
 * import {isAssurBemlacha, Location} from '@hebcal/core';
 * const loc = Location.lookup('Jerusalem')!;
 * // Friday after sunset:
 * isAssurBemlacha(new Date('2024-04-26T18:00:00Z'), loc, false); // true
 * @param currentTime the moment to test (with hour/minute)
 * @param location geographic location (also supplies Israel/Diaspora flag and tzid)
 * @param useElevation include elevation when computing sunset
 * @return `true` if *melacha* is prohibited, `false` if it is not
 */
function isAssurBemlacha(currentTime, location, useElevation) {
    // Determine the calendar date in the location's timezone, not the
    // timezone of the computer running this code. Otherwise the day-of-week,
    // Hebrew date and sunset/tzais times would depend on the machine's
    // local timezone, giving different (incorrect) results near midnight.
    const isoDate = getPseudoISO(location.getTzid(), currentTime);
    const year = parseInt(isoDate.substring(0, 4), 10);
    const month = parseInt(isoDate.substring(5, 7), 10);
    const day = parseInt(isoDate.substring(8, 10), 10);
    const hd = new HDate(new Date(year, month - 1, day));
    const zmanim = new Zmanim(location, hd, useElevation);
    // erev shabbos, YT or YT sheni and after shkiah
    const sunset = zmanim.sunset();
    const sunsetMillis = sunset.getTime();
    if (isNaN(sunsetMillis)) {
        throw new Error('Could not determine sunset');
    }
    // erev shabbos, YT or YT sheni and after shkiah
    const il = location.getIsrael();
    const currentMillis = currentTime.getTime();
    const dow = hd.getDay();
    const events = getHolidaysOnDate(hd, il) || [];
    if (isTomorrowShabbosOrYomTov(dow, events) && currentMillis >= sunsetMillis) {
        return true;
    }
    // is shabbos or YT and it is before tzais
    if (isTodayAssurBemelacha(dow, events)) {
        const tzais = zmanim.tzeit();
        const tzaisMillis = tzais.getTime();
        return currentMillis <= tzaisMillis;
    }
    return false;
}

const NISAN$1 = months.NISAN;
const SIVAN$1 = months.SIVAN;
const TAMUZ = months.TAMUZ;
const AV = months.AV;
const SAT$1 = 6;
function getHDate(date) {
    return HDate.isHDate(date) ? date : new HDate(date);
}
function isSefiratHaOmer(hd) {
    const hyear = hd.getFullYear();
    const beginOmer = new HDate(16, NISAN$1, hyear).abs();
    const endOmer = new HDate(5, SIVAN$1, hyear).abs();
    const abs = hd.abs();
    return abs >= beginOmer && abs <= endOmer;
}
function isBeinHaMetzarim(hd) {
    const hyear = hd.getFullYear();
    const begin = new HDate(17, TAMUZ, hyear).abs();
    const tishaBav = new HDate(9, AV, hyear);
    const end = tishaBav.getDay() === SAT$1 ? new HDate(10, AV, hyear).abs() : tishaBav.abs();
    const abs = hd.abs();
    return abs >= begin && abs <= end;
}
/**
 * Returns `true` if the given date falls within a public period of communal
 * mourning — specifically:
 *
 * - **Sefirat HaOmer**: 16 Nisan through 5 Sivan (the 49 days of the Omer).
 * - **Bein HaMetzarim** ("between the straits"): 17 Tammuz through 9 Av
 *   (10 Av when 9 Av is postponed because it falls on Shabbat).
 *
 * This is a broad helper — it does not attempt to model minhag-specific
 * exceptions within those periods (e.g. Lag BaOmer, Rosh Chodesh Iyar,
 * the distinction between Sephardic and Ashkenazic customs on which
 * portion of the Omer is observed as mourning, etc.).
 * @example
 * import {isAveilut, HDate, months} from '@hebcal/core';
 * isAveilut(new HDate(20, months.NISAN, 5784)); // true (Omer)
 * isAveilut(new HDate(25, months.TAMUZ, 5784)); // true (Three Weeks)
 * isAveilut(new HDate(15, months.AV, 5784));    // false
 * @param date Hebrew Date, Gregorian date, or absolute R.D. day number
 * @return `true` if the date is during a mourning period
 */
function isAveilut(date) {
    const hd = getHDate(date);
    return isSefiratHaOmer(hd) || isBeinHaMetzarim(hd);
}

const FAST_DAY = flags.MAJOR_FAST | flags.MINOR_FAST;
const EREV$1 = flags.EREV;
/**
 * Returns `true` if the given date is observed as a major or minor fast day.
 *
 * Major fasts: Yom Kippur, Tish'a B'Av.
 * Minor fasts: Tzom Gedaliah, Asara B'Tevet, Ta'anit Esther, Ta'anit
 * Bechorot, Tzom Tammuz (plus BeHaB fasts when enabled).
 *
 * Erev Tish'a B'Av — even though the fast begins at sunset — is *not*
 * counted here: only the actual fast day itself returns `true`.
 * Postponed fasts return `true` on the actual observed date (e.g. when
 * 17 Tammuz falls on Shabbat and is observed on the 18th).
 * @example
 * import {isFastDay, HDate, months} from '@hebcal/core';
 * isFastDay(new HDate(10, months.TISHREI, 5784)); // true  (Yom Kippur)
 * isFastDay(new HDate(11, months.TISHREI, 5784)); // false
 * @param date Hebrew Date, Gregorian date, or absolute R.D. day number
 * @param il optional; use the Israeli schedule for holidays (default Diaspora)
 * @return `true` if the date is a major or minor fast day
 */
function isFastDay(date, il) {
    const events = getHolidaysOnDate(date, il) || [];
    const fastDay = events.find(ev => {
        const mask = ev.getFlags();
        return mask & FAST_DAY && !(mask & EREV$1);
    });
    return Boolean(fastDay);
}

const HAVDALAH = holidayDesc.HAVDALAH;
const CANDLE_LIGHTING = holidayDesc.CANDLE_LIGHTING;
/**
 * Base class for events that have an associated wall-clock time and
 * geographic location — for example, candle lighting, havdalah, and
 * fast begin/end times.
 *
 * Stores both a `Date` (`eventTime`) and pre-formatted 24-hour
 * (`eventTimeStr`) and locale-aware (`fmtTime`) strings. May reference a
 * "linked" event such as the holiday whose candle-lighting time this
 * represents.
 */
class TimedEvent extends Event {
    /**
     * Normally created by {@link calendar} rather than directly.
     * @param date Hebrew date the event occurs
     * @param desc Description (not translated)
     * @param mask optional holiday flags
     * @param eventTime the exact moment of the event
     * @param location geographic location used to format the time
     * @param linkedEvent optional event this time is associated with
     * @param options optional; `locale` and `hour12` affect {@link fmtTime}
     */
    constructor(date, desc, mask, eventTime, location, linkedEvent, options) {
        super(date, desc, mask);
        this.eventTime = Zmanim.roundTime(eventTime);
        this.location = location;
        const timeFormat = location.getTimeFormatter();
        this.eventTimeStr = Zmanim.formatTime(this.eventTime, timeFormat);
        const opts = { ...options, location };
        this.fmtTime = reformatTimeStr(this.eventTimeStr, 'pm', opts);
        if (linkedEvent !== undefined) {
            this.linkedEvent = linkedEvent;
        }
    }
    /**
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    render(locale) {
        return Locale.gettext(this.getDesc(), locale) + ': ' + this.fmtTime;
    }
    /**
     * Returns translation of "Candle lighting" without the time.
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    renderBrief(locale) {
        return Locale.gettext(this.getDesc(), locale);
    }
    getCategories() {
        const desc = this.getDesc();
        switch (desc) {
            // LIGHT_CANDLES or LIGHT_CANDLES_TZEIS
            case CANDLE_LIGHTING:
                return ['candles'];
            // YOM_TOV_ENDS
            case HAVDALAH:
                return ['havdalah'];
            // flags.MINOR_FAST or flags.MAJOR_FAST
            case holidayDesc.FAST_BEGINS:
            case holidayDesc.FAST_ENDS:
                return ['zmanim', 'fast'];
            case holidayDesc.SOF_ZMAN_ACHILAT_CHAMETZ:
                return ['zmanim', 'achilasChametz'];
            case holidayDesc.BIUR_CHAMETZ:
                return ['zmanim', 'biurChametz'];
        }
        /* NOTREACHED */
        return ['unknown'];
    }
}
/**
 * Candle-lighting event for the eve of Shabbat or a Yom Tov.
 *
 * Generated by {@link calendar} when `options.candlelighting`
 * is `true` and `options.location` is provided. By default candle lighting
 * occurs 18 minutes before sundown in the Diaspora and 20 minutes before
 * sundown in Israel (40 minutes in Jerusalem; 30 minutes in Haifa and
 * Zikhron Ya'akov), configurable via `options.candleLightingMins`.
 */
class CandleLightingEvent extends TimedEvent {
    constructor(date, mask, eventTime, location, linkedEvent, options) {
        super(date, CANDLE_LIGHTING, mask, eventTime, location, linkedEvent, options);
    }
    getEmoji() {
        return '🕯️';
    }
}
/**
 * Havdalah event marking the end of Shabbat or a Yom Tov.
 *
 * Generated by {@link calendar} when `options.candlelighting`
 * is `true` and `options.location` is provided. By default Havdalah is
 * calculated by *tzeit hakochavim* (8.5° solar depression); pass
 * `options.havdalahMins` to use a fixed minute offset instead, or
 * `options.havdalahDeg` to use a different degree.
 */
class HavdalahEvent extends TimedEvent {
    constructor(date, mask, eventTime, location, havdalahMins, linkedEvent, options) {
        super(date, HAVDALAH, mask, eventTime, location, linkedEvent, options);
        if (havdalahMins) {
            this.havdalahMins = havdalahMins;
        }
    }
    /**
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    render(locale) {
        return this.renderBrief(locale) + ': ' + this.fmtTime;
    }
    /**
     * Returns translation of "Havdalah" without the time.
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    renderBrief(locale) {
        let str = Locale.gettext(this.getDesc(), locale);
        if (this.havdalahMins) {
            const min = Locale.gettext('min', locale);
            str += ` (${this.havdalahMins} ${min})`;
        }
        return str;
    }
    getEmoji() {
        return '✨';
    }
}

const LIGHT_CANDLES$1 = flags.LIGHT_CANDLES;
const LIGHT_CANDLES_TZEIS$1 = flags.LIGHT_CANDLES_TZEIS;
/**
 * @private
 */
function makeCandleEvent(ev, hd, options, isFriday, isSaturday) {
    let havdalahTitle = false;
    let useHavdalahOffset = isSaturday;
    let mask = ev ? ev.getFlags() : LIGHT_CANDLES$1;
    if (ev !== undefined) {
        // if linked event && dow == FRI, use Candle lighting time & title
        if (!isFriday) {
            if (mask & (LIGHT_CANDLES_TZEIS$1 | flags.CHANUKAH_CANDLES)) {
                useHavdalahOffset = true;
            }
            else if (mask & flags.YOM_TOV_ENDS) {
                havdalahTitle = true;
                useHavdalahOffset = true;
            }
        }
    }
    else if (isSaturday) {
        havdalahTitle = true;
        mask = LIGHT_CANDLES_TZEIS$1;
    }
    // if Havdalah offset is 0 or undefined, we'll use tzeit time
    const offset = useHavdalahOffset
        ? Number(options.havdalahMins)
        : Number(options.candleLightingMins);
    const location = options.location;
    const useElevation = Boolean(options.useElevation);
    const zmanim = new Zmanim(location, hd, useElevation);
    const time = useHavdalahOffset && !offset
        ? zmanim.tzeit(options.havdalahDeg)
        : zmanim.sunsetOffset(offset, true);
    if (isNaN(time.getTime())) {
        return undefined; // no sunset
    }
    if (havdalahTitle) {
        return new HavdalahEvent(hd, mask, time, location, options.havdalahMins, ev, options);
    }
    else {
        mask |= LIGHT_CANDLES$1;
        return new CandleLightingEvent(hd, mask, time, location, ev, options);
    }
}
const FAST_BEGINS = holidayDesc.FAST_BEGINS;
const FAST_ENDS = holidayDesc.FAST_ENDS;
/**
 * Tzeit HaKochavim as calculated by Rabbi Yechiel Michel Tucazinsky,
 * 6.45° below geometric zenith. Default end time for Tish'a B'Av.
 * @private
 */
const TZEIT_TUCAZINSKY = 6.45;
/**
 * Observation of 3 medium-sized stars, 7.0833333° below geometric zenith.
 * Default end time for minor fasts in the Diaspora.
 * @private
 */
const TZEIT_3MEDIUM_STARS = 7.0833333;
/**
 * Minutes after sunset that minor fasts (including Yom Kippur Katan) end in
 * Israel by default, following Rabbi Deblitzky's practice.
 * @see {https://www.yeshiva.org.il/calendar/timeprinciples}
 * @private
 */
const MINOR_FAST_END_MINUTES_IL = 15;
/**
 * Computes the "Fast ends" time for a fast day.
 *
 * Tish'a B'Av always ends at tzeit 6.45° (Rabbi Yechiel Michel Tucazinsky),
 * regardless of `options`.
 *
 * For minor fasts: when `options.fastEndMins` is a nonzero number, the fast
 * ends that many minutes after sunset; otherwise, when `options.fastEndDeg` is
 * a nonzero number, the fast ends at tzeit for that solar depression angle.
 * When neither is specified, the default depends on `options.il`:
 * - In Israel, minor fasts end 15 minutes after sunset (Rabbi Deblitzky's practice).
 * - Elsewhere, minor fasts end at tzeit 7.083° (3 medium-sized stars).
 * @private
 */
function makeFastEndTime(zmanim, isTishaBav, options) {
    if (isTishaBav) {
        return zmanim.tzeit(TZEIT_TUCAZINSKY);
    }
    const fastEndMins = options.fastEndMins;
    if (typeof fastEndMins === 'number' && fastEndMins !== 0) {
        return zmanim.sunsetOffset(Math.abs(fastEndMins), true);
    }
    const fastEndDeg = options.fastEndDeg;
    if (typeof fastEndDeg === 'number' && fastEndDeg !== 0) {
        return zmanim.tzeit(Math.abs(fastEndDeg));
    }
    if (options.il) {
        return zmanim.sunsetOffset(MINOR_FAST_END_MINUTES_IL, true);
    }
    return zmanim.tzeit(TZEIT_3MEDIUM_STARS);
}
/**
 * A fast day holiday with attached start and end time events.
 *
 * Wraps an underlying fast-day {@link HolidayEvent} and (when computable
 * for the given location) exposes a "Fast begins" and "Fast ends"
 * {@link TimedEvent}. Generated by {@link calendar} when
 * `options.candlelighting` is `true` and `options.location` is provided.
 *
 * - Minor fasts (including Yom Kippur Katan) begin at *Alot HaShachar*
 *   (16.1° below horizon in the morning). By default they end at tzeit
 *   7.083° (3 medium-sized stars) in the Diaspora, or 15 minutes after
 *   sunset in Israel (Rabbi Deblitzky's practice). This can be overridden
 *   via `options.fastEndDeg` or `options.fastEndMins`.
 * - Tish'a B'Av begins at sunset on the previous day and always ends at tzeit
 *   6.45° below horizon (Rabbi Yechiel Michel Tucazinsky), regardless of
 *   `options.fastEndDeg` / `options.fastEndMins`.
 * - When a minor fast falls on a Friday, the end time is suppressed
 *   (Shabbat begins before nightfall).
 */
class FastDayEvent extends HolidayEvent {
    constructor(linkedEvent, startEvent, endEvent) {
        super(linkedEvent.getDate(), linkedEvent.getDesc(), linkedEvent.getFlags());
        this.linkedEvent = linkedEvent;
        this.startEvent = startEvent;
        this.endEvent = endEvent;
    }
    render(locale) {
        return this.linkedEvent.render(locale);
    }
    renderBrief(locale) {
        return this.linkedEvent.renderBrief(locale);
    }
    urlDateSuffix() {
        return this.linkedEvent.urlDateSuffix();
    }
    url() {
        return this.linkedEvent.url();
    }
    getEmoji() {
        return this.linkedEvent.getEmoji();
    }
    getCategories() {
        return this.linkedEvent.getCategories();
    }
}
/**
 * Makes a pair of events representing fast start and end times
 * @private
 */
function makeFastStartEnd(ev, options) {
    const desc = ev.getDesc();
    if (desc === 'Yom Kippur') {
        throw new RangeError('YK does not require this function');
    }
    const hd = ev.getDate();
    const dt = hd.greg();
    const location = options.location;
    const useElevation = Boolean(options.useElevation);
    const zmanim = new Zmanim(location, dt, useElevation);
    let startEvent;
    let endEvent;
    if (desc === "Erev Tish'a B'Av") {
        const sunset = zmanim.sunset();
        if (!isNaN(sunset.getTime())) {
            startEvent = makeTimedEvent(ev, sunset, FAST_BEGINS, options);
        }
    }
    else if (desc.startsWith("Tish'a B'Av")) {
        const fastEnd = makeFastEndTime(zmanim, true, options);
        if (!isNaN(fastEnd.getTime())) {
            endEvent = makeTimedEvent(ev, fastEnd, FAST_ENDS, options);
        }
    }
    else {
        const dawn = zmanim.alotHaShachar();
        if (!isNaN(dawn.getTime())) {
            startEvent = makeTimedEvent(ev, dawn, FAST_BEGINS, options);
        }
        if (dt.getDay() !== 5 &&
            !(hd.getDate() === 14 && hd.getMonth() === months.NISAN)) {
            const fastEnd = makeFastEndTime(zmanim, false, options);
            if (!isNaN(fastEnd.getTime())) {
                endEvent = makeTimedEvent(ev, fastEnd, FAST_ENDS, options);
            }
        }
    }
    const ev2 = new FastDayEvent(ev, startEvent, endEvent);
    // copy properties such as memo or emoji
    Object.assign(ev2, ev);
    return ev2;
}
/**
 * @private
 */
function makeTimedEvent(ev, time, desc, options) {
    const location = options.location;
    const hd = ev.getDate();
    return new TimedEvent(hd, desc, ev.getFlags(), time, location, ev, options);
}
/**
 * A Chanukah candle-lighting event that carries a specific time of day.
 *
 * Generated by {@link calendar} when both `options.candlelighting`
 * and `options.location` are set. On weekdays the time is Bein HaShmashos
 * (13.5 minutes before the sun is 7.083° below the horizon in the evening);
 * on Friday it is regular candle-lighting time, and on Saturday night it is
 * regular Havdalah time.
 */
class TimedChanukahEvent extends ChanukahEvent {
    /**
     * Normally created by {@link calendar} rather than directly.
     * @param ev the untimed Chanukah event this is derived from
     * @param eventTime time at which candles are lit
     * @param location location used to format the time
     */
    constructor(ev, eventTime, location) {
        super(ev.getDate(), ev.getDesc(), ev.getFlags(), ev.chanukahDay);
        this.eventTime = Zmanim.roundTime(eventTime);
        const timeFormat = location.getTimeFormatter();
        this.eventTimeStr = Zmanim.formatTime(this.eventTime, timeFormat);
        this.location = location;
        this.emoji = ev.emoji;
    }
}
/**
 * Makes a candle-lighting event for Chankah (not on Friday/Saturday).
 * At one point this used civil dusk (6 degrees below horizon).
 * Another source suggests 4.6667 degrees below horizon.
 * @private
 */
function makeWeekdayChanukahCandleLighting(ev, options) {
    const hd = ev.getDate();
    const location = options.location;
    const useElevation = Boolean(options.useElevation);
    const zmanim = new Zmanim(location, hd.greg(), useElevation);
    const candleLightingTime = zmanim.beinHaShmashos();
    if (isNaN(candleLightingTime.getTime())) {
        return null;
    }
    return new TimedChanukahEvent(ev, candleLightingTime, location);
}

var sefira = {
    "ps67lines": [
        "אֱלֹהִים יְחָנֵּנוּ וִיבָרְכֵנוּ יָאֵר־פָּנָיו אִתָּנוּ סֶלָה",
        "לָדַעַת בָּאָרֶץ דַּרְכֶּךָ בְּכָל־גּוֹיִם יְשׁוּעָתֶךָ",
        "יוֹדוּךָ עַמִּים אֱלֹהִים יוֹדוּךָ עַמִּים כֻּלָּם",
        "יִשְׂמְחוּ וִירַנְּנוּ לְאֻמִּים כִּי־תִשְׁפֹּט עַמִּים מִישׁוֹר וּלְאֻמִּים בָּאָרֶץ תַּנחֵם סֶלָה",
        "יוֹדוּךָ עַמִּים אֱלֹהִים יוֹדוּךָ עַמִּים כֻּלָּם",
        "אֶרֶץ נָתְנָה יְבוּלָהּ יְבָרְכֵנוּ אֱלֹהִים אֱלֹהֵינוּ",
        "יְבָרְכֵנוּ אֱלֹהִים וְיִירְאוּ אוֹתוֹ כָּל־אַפְסֵי־אָרֶץ"
    ],
    "lamnatzeachLetters": "ישמחווירננולאמיםכיתשפוטעמיםמישורולאמיםבארץתנחםסלה",
    "anaBekoach": [
        "אָנָּא",
        "בְּכֹחַ",
        "גְּדֻלַּת",
        "יְמִינְךָ",
        "תַּתִּיר",
        "צְרוּרָה",
        "אב״ג ית״ץ",
        "קַבֵּל",
        "רִנַּת",
        "עַמְּךָ",
        "שַׂגְּבֵנוּ",
        "טַהֲרֵנוּ",
        "נוֹרָא",
        "קר״ע שט״ן",
        "נָא",
        "גִבּוֹר",
        "דּוֹרְשֵׁי",
        "יִחוּדְךָ",
        "כְּבָבַת",
        "שָׁמְרֵם",
        "נג״ד יכ״ש",
        "בָּרְכֵם",
        "טַהֲרֵם",
        "רַחֲמֵי",
        "צִדְקָתְךָ",
        "תָּמִיד",
        "גָּמְלֵם",
        "בט״ר צת״ג",
        "חֲסִין",
        "קָדוֹשׁ",
        "בְּרֹב",
        "טוּבְךָ",
        "נַהֵל",
        "עֲדָתֶךָ",
        "חק״ב תנ״ע",
        "יָחִיד",
        "גֵּאֶה",
        "לְעַמְּךָ",
        "פְּנֵה",
        "זוֹכְרֵי",
        "קְדֻשָּׁתֶךָ",
        "יג״ל פז״ק",
        "שַׁוְעָתֵנוּ",
        "קַבֵּל",
        "וּשְׁמַע",
        "צַעֲקָתֵנוּ",
        "יוֹדֵעַ",
        "תַּעֲלוּמוֹת",
        "שק״ו צי״ת"
    ]
};

const sefirot = {
    en: {
        infix: 'within ',
        infix26: 'within ',
        words: [
            '',
            'Lovingkindness',
            'Might',
            'Beauty',
            'Eternity',
            'Splendor',
            'Foundation',
            'Majesty',
        ],
        pfxWords: null,
    },
    he: {
        infix: null,
        infix26: null,
        words: [
            '',
            'חֶֽסֶד',
            'גְּבוּרָה',
            'תִּפְאֶֽרֶת',
            'נֶּֽצַח',
            'הוֹד',
            'יְּסוֹד',
            'מַלְכוּת',
        ],
        pfxWords: [
            '',
            'שֶׁבְּחֶֽסֶד',
            'שֶׁבִּגְבוּרָה',
            'שֶׁבְּתִפְאֶֽרֶת',
            'שֶׁבְּנֶֽצַח',
            'שֶׁבְּהוֹד',
            'שֶׁבִּיְסוֹד',
            'שֶׁבְּמַלְכוּת',
        ],
    },
    translit: {
        infix: "sheb'",
        infix26: 'shebi',
        words: [
            '',
            'Chesed',
            'Gevurah',
            'Tiferet',
            'Netzach',
            'Hod',
            'Yesod',
            'Malkhut',
        ],
        pfxWords: null,
    },
};
function checkDay(omerDay) {
    if (omerDay < 1 || omerDay > 49) {
        throw new RangeError(`Invalid Omer day ${omerDay}`);
    }
}
function getWeeks(omerDay) {
    const weekNum = Math.floor((omerDay - 1) / 7) + 1;
    const daysWithinWeeks = omerDay % 7 || 7;
    return [weekNum, daysWithinWeeks];
}
function omerTodayIsEn(omerDay) {
    const [weekNumber, daysWithinWeeks] = getWeeks(omerDay);
    const totalDaysStr = omerDay === 1 ? 'day' : 'days';
    let str = `Today is ${omerDay} ${totalDaysStr}`;
    if (weekNumber > 1 || omerDay === 7) {
        const day7 = daysWithinWeeks === 7;
        const numWeeks = day7 ? weekNumber : weekNumber - 1;
        const weeksStr = numWeeks === 1 ? 'week' : 'weeks';
        str += `, which are ${numWeeks} ${weeksStr}`;
        if (!day7) {
            const daysStr = daysWithinWeeks === 1 ? 'day' : 'days';
            str += ` and ${daysWithinWeeks} ${daysStr}`;
        }
    }
    return str + ' of the Omer';
}
// adapted from pip hdate package (GPL)
// https://github.com/py-libhdate/py-libhdate/blob/master/hdate/date.py
const tens = ['', 'עֲשָׂרָה', 'עֶשְׂרִים', 'שְׁלוֹשִׁים', 'אַרְבָּעִים'];
const ones = [
    '',
    'אֶחָד',
    'שְׁנַיִם',
    'שְׁלוֹשָׁה',
    'אַרְבָּעָה',
    'חֲמִשָּׁה',
    'שִׁשָּׁה',
    'שִׁבְעָה',
    'שְׁמוֹנָה',
    'תִּשְׁעָה',
];
const shnei = 'שְׁנֵי';
const yamim = 'יָמִים';
const shneiYamim = shnei + ' ' + yamim;
const shavuot = 'שָׁבוּעוֹת';
const yom = 'יוֹם';
const yomEchad = yom + ' ' + ones[1];
const asar = 'עָשָׂר';
function omerTodayIsHe(omerDay) {
    const ten = Math.floor(omerDay / 10);
    const one = omerDay % 10;
    let str = 'הַיּוֹם ';
    if (omerDay === 11) {
        str += 'אַחַד ' + asar;
    }
    else if (omerDay === 12) {
        str += 'שְׁנֵים ' + asar;
    }
    else if (12 < omerDay && omerDay < 20) {
        str += ones[one] + ' ' + asar;
    }
    else if (omerDay > 9) {
        str += ones[one];
        if (one) {
            str += ' ';
            str += ten === 3 ? 'וּ' : 'וְ';
        }
    }
    if (omerDay > 2) {
        if (omerDay > 20 || omerDay === 10 || omerDay === 20) {
            str += tens[ten];
        }
        if (omerDay < 11) {
            str += ones[one] + ' ' + yamim + ' ';
        }
        else {
            str += ' ' + yom + ' ';
        }
    }
    else if (omerDay === 1) {
        str += yomEchad + ' ';
    }
    else {
        // omer == 2
        str += shneiYamim + ' ';
    }
    if (omerDay > 6) {
        str = str.trim(); // remove trailing space before comma
        str += ', שֶׁהֵם ';
        const weeks = Math.floor(omerDay / 7);
        const days = omerDay % 7;
        if (weeks > 2) {
            str += ones[weeks] + ' ' + shavuot + ' ';
        }
        else if (weeks === 1) {
            str += 'שָׁבֽוּעַ' + ' ' + ones[1] + ' ';
        }
        else {
            // weeks == 2
            str += shnei + ' ' + shavuot + ' ';
        }
        if (days) {
            if (days === 2 || days === 3) {
                str += 'וּ';
            }
            else if (days === 5) {
                str += 'וַ';
            }
            else {
                str += 'וְ';
            }
            if (days > 2) {
                str += ones[days] + ' ' + yamim + ' ';
            }
            else if (days === 1) {
                str += yomEchad + ' ';
            }
            else {
                // days == 2
                str += shneiYamim + ' ';
            }
        }
    }
    str += 'לָעֽוֹמֶר';
    return str.normalize();
}
const anaBekoach = sefira.anaBekoach;
const ps67lines = sefira.ps67lines;
const lamnatzeach = ps67lines.flatMap((x) => x.split(/[ ־]/));
const lamnatzeachLetters = sefira.lamnatzeachLetters.split('');
/**
 * Represents one of the 49 days of counting the Omer between Pesach and
 * Shavuot (16 Nisan through 5 Sivan).
 *
 * Each day has an associated Sefirah pairing (e.g. *Chesed shebiGevurah*),
 * a word from Psalm 67 (Lamnatzeach), a letter from verse 5 of Psalm 67,
 * and a word/acrostic from the Ana BeKoach prayer — all accessible via
 * the methods on this class.
 *
 * @example
 * import {OmerEvent, HDate, months} from '@hebcal/core';
 * const ev = new OmerEvent(new HDate(16, months.NISAN, 5784), 1);
 * ev.render('en');        // '1st day of the Omer'
 * ev.render('he');        // 'א׳ בָּעוֹמֶר'
 * ev.sefira('translit');  // "Chesed sheb'Chesed"
 * ev.getTodayIs('en');    // 'Today is 1 day of the Omer'
 */
class OmerEvent extends Event {
    /**
     * Constructs an Omer event for a given day (1–49).
     *
     * Throws `RangeError` if `omerDay` is outside 1–49.
     * @param date Hebrew date this Omer day is counted on (the evening of)
     * @param omerDay day of the Omer, 1 through 49
     */
    constructor(date, omerDay) {
        super(date, `Omer ${omerDay}`, flags.OMER_COUNT);
        checkDay(omerDay);
        this.weekNumber = Math.floor((omerDay - 1) / 7) + 1;
        this.daysWithinWeeks = omerDay % 7 || 7;
        this.omer = omerDay;
    }
    /**
     * Returns the Sefirah pairing associated with this Omer day —
     * one of the seven lower Sefirot within another, calculated as
     * `day-within-week` of `week-within-cycle`. For example, on day 8
     * (week 2, day 1):
     *  * חֶֽסֶד שֶׁבִּגְבוּרָה
     *  * Chesed shebiGevurah
     *  * Lovingkindness within Might
     * @example
     * import {OmerEvent, HDate, months} from '@hebcal/core';
     * const day8 = new OmerEvent(new HDate(23, months.NISAN, 5784), 8);
     * day8.sefira('en');        // 'Lovingkindness within Might'
     * day8.sefira('he');        // 'חֶֽסֶד שֶׁבִּגְבוּרָה'
     * day8.sefira('translit');  // 'Chesed shebiGevurah'
     * @param lang `en` (English), `he` (Hebrew with nikud), or `translit` (Hebrew in Sephardic transliteration)
     * @returns a string such as `Lovingkindness within Might` or `חֶֽסֶד שֶׁבִּגְבוּרָה`
     */
    sefira(lang = 'en') {
        if (lang !== 'he' && lang !== 'translit') {
            lang = 'en';
        }
        const [weekNum, daysWithinWeeks] = getWeeks(this.omer);
        const config = sefirot[lang];
        const pfxWords = config.pfxWords;
        const words = config.words;
        const week = pfxWords ? pfxWords[weekNum] : words[weekNum];
        const dayWithinWeek = words[daysWithinWeeks];
        const infix = pfxWords
            ? ''
            : weekNum === 2 || weekNum === 6
                ? config.infix26
                : config.infix;
        return (dayWithinWeek + ' ' + infix + week).normalize();
    }
    /**
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    render(locale) {
        const isHebrewLocale = Locale.isHebrewLocale(locale);
        const omer = this.omer;
        const nth = isHebrewLocale ? gematriya(omer) : Locale.ordinal(omer, locale);
        return nth + ' ' + Locale.gettext('day of the Omer', locale);
    }
    /**
     * Returns translation of "Omer day 22" without ordinal numbers.
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    renderBrief(locale) {
        return (Locale.gettext('Omer', locale) +
            ' ' +
            Locale.gettext('day', locale) +
            ' ' +
            this.omer);
    }
    /**
     * Returns an emoji number symbol with a circle, for example `㊲`
     *  from the “Enclosed CJK Letters and Months” block of the Unicode standard
     * @returns a single Unicode character from `①` through `㊾`
     */
    getEmoji() {
        if (typeof this.emoji === 'string')
            return this.emoji;
        let codePoint;
        const omerDay = this.omer;
        if (omerDay <= 20) {
            codePoint = 9312 + omerDay - 1;
        }
        else if (omerDay <= 35) {
            // between 21 and 35 inclusive
            codePoint = 12881 + omerDay - 21;
        }
        else {
            // between 36 and 49 inclusive
            codePoint = 12977 + omerDay - 36;
        }
        return String.fromCodePoint(codePoint);
    }
    /**
     * Number of *completed* weeks of the Omer. On day 7 this returns `1`; on
     * day 8 it also returns `1`, because the second week is still in progress.
     * Pair with {@link getDaysWithinWeeks} to render "N weeks and M days".
     */
    getWeeks() {
        const day7 = this.daysWithinWeeks === 7;
        return day7 ? this.weekNumber : this.weekNumber - 1;
    }
    /**
     * Day within the current week, from `1` through `7`.
     */
    getDaysWithinWeeks() {
        return this.daysWithinWeeks;
    }
    /**
     * Returns a sentence with that evening's omer count
     * @example
     * import {OmerEvent, HDate, months} from '@hebcal/core';
     * const ev = new OmerEvent(new HDate(25, months.NISAN, 5784), 10);
     * ev.getTodayIs('en');
     * // => 'Today is 10 days, which are 1 week and 3 days of the Omer'
     * ev.getTodayIs('he');
     * // => 'הַיּוֹם עֲשָׂרָה יָמִים, שֶׁהֵם שָׁבֽוּעַ אֶחָד וּשְׁלוֹשָׁה יָמִים לָעֽוֹמֶר'
     * @param locale locale name; Hebrew locales (`he`, `he-x-NoNikud`) produce
     *  the Hebrew formula, anything else produces English. Defaults to `en`
     *  when empty.
     */
    getTodayIs(locale) {
        locale = (locale || 'en').toLowerCase();
        const isHebrew = Locale.isHebrewLocale(locale);
        const str = isHebrew ? omerTodayIsHe(this.omer) : omerTodayIsEn(this.omer);
        if (locale === 'he-x-nonikud') {
            return Locale.hebrewStripNikkud(str);
        }
        return str;
    }
    url() {
        const year = this.getDate().getFullYear();
        if (year < 5000 || year > 6759) {
            return undefined;
        }
        return `https://www.hebcal.com/omer/${year}/${this.omer}`;
    }
    /**
     * Returns the word from Psalm 67 (לַמְנַצֵּחַ, "Lamnatzeach") corresponding
     * to this Omer day. Psalm 67 contains 49 words (excluding its opening verse),
     * one for each day of the Omer. The words are taken from verses 2–8, split on
     * spaces and maqef (־).
     * @returns a Hebrew word from Psalm 67
     * @example
     * const ev = new OmerEvent(new HDate(16, 'Nisan', 5785), 1);
     * ev.getLamnatzeachWord(); // 'אֱלֹהִים' (day 1, first word of verse 2)
     * @example
     * const ev = new OmerEvent(new HDate(3, 'Sivan', 5785), 49);
     * ev.getLamnatzeachWord(); // 'אָרֶץ' (day 49, last word of verse 8)
     */
    getLamnatzeachWord() {
        return lamnatzeach[this.omer - 1];
    }
    /**
     * Returns the letter from verse 5 of Psalm 67 corresponding to this Omer day.
     * Verse 5 (יִשְׂמְחוּ וִירַנְּנוּ לְאֻמִּים…) contains exactly 49 letters,
     * one for each day of the Omer, and is used as a Kabbalistic meditation during
     * the counting.
     * @returns a single Hebrew letter from verse 5 of Psalm 67
     * @example
     * const ev = new OmerEvent(new HDate(16, 'Nisan', 5785), 1);
     * ev.getLamnatzeachLetter(); // 'י' (day 1, first letter of verse 5)
     * @example
     * const ev = new OmerEvent(new HDate(3, 'Sivan', 5785), 49);
     * ev.getLamnatzeachLetter(); // 'ה' (day 49, last letter of verse 5)
     */
    getLamnatzeachLetter() {
        return lamnatzeachLetters[this.omer - 1];
    }
    /**
     * Returns the word from the Ana BeKoach prayer (אָנָּא בְּכֹחַ) corresponding
     * to this Omer day. Ana BeKoach is a 42-word Kabbalistic prayer whose initial
     * letters spell out the 42-letter name of God. The prayer has 7 verses of
     * 6 words each; the 7th entry of each group is the abbreviation of the acrostic
     * letters for that verse (e.g. `אב״ג ית״ץ` for verse 1). Together the 49
     * entries (7 verses × 7 entries) align with the 49 days of the Omer, connecting
     * each day to one of the lower seven Sefirot within a Sefirah.
     * @returns a Hebrew word or verse-abbreviation string from Ana BeKoach
     * @example
     * const ev = new OmerEvent(new HDate(16, 'Nisan', 5785), 1);
     * ev.getAnaBekoachWord(); // 'אָנָּא' (day 1, first word of verse 1)
     * @example
     * const ev = new OmerEvent(new HDate(22, 'Nisan', 5785), 7);
     * ev.getAnaBekoachWord(); // 'אב״ג ית״ץ' (day 7, acrostic abbreviation for verse 1)
     * @example
     * const ev = new OmerEvent(new HDate(3, 'Sivan', 5785), 49);
     * ev.getAnaBekoachWord(); // 'שק״ו צי״ת' (day 49, acrostic abbreviation for verse 7)
     */
    getAnaBekoachWord() {
        return anaBekoach[this.omer - 1].normalize();
    }
}

function range(start, end) {
    const arr = [];
    for (let i = start; i <= end; i++) {
        arr.push(i);
    }
    return arr;
}
const NONE$1 = {
    shacharit: false,
    mincha: false,
    allCongs: false,
};
/**
 * Return details on what Tachanun (or Tzidchatcha on Shabbat) is said on `hdate`.
 *
 * Tachanun is not said on Rosh Chodesh, the month of Nisan, Lag Baomer,
 * Rosh Chodesh Sivan until Isru Chag, Tisha B'av, 15 Av, Erev Rosh Hashanah,
 * Rosh Hashanah, Erev Yom Kippur until after Simchat Torah, Chanukah,
 * Tu B'shvat, Purim and Shushan Purim, and Purim and Shushan Purim Katan.
 *
 * In some congregations Tachanun is not said until from Rosh Chodesh Sivan
 * until 14th Sivan, Sukkot until after Rosh Chodesh Cheshvan, Pesach Sheini,
 * Yom Ha'atzmaut, and Yom Yerushalayim.
 *
 * Tachanun is not said at Mincha on days before it is not said at Shacharit.
 *
 * Tachanun is not said at Shacharit on Shabbat, but is at Mincha, usually.
 */
function tachanun(hdate, il) {
    return tachanun0(hdate, il, true);
}
function tachanun0(hdate, il, checkNext) {
    const year = hdate.yy;
    const dates = tachanunYear(year, il);
    const abs = hdate.abs();
    if (dates.none.includes(abs)) {
        return NONE$1;
    }
    const dow = hdate.getDay();
    const ret = {
        shacharit: false,
        mincha: false,
        allCongs: false,
    };
    if (!dates.some.includes(abs)) {
        ret.allCongs = true;
    }
    if (dow !== 6) {
        ret.shacharit = true;
    }
    const tomorrow = abs + 1;
    if (checkNext && !dates.yesPrev.includes(tomorrow)) {
        const tmp = tachanun0(new HDate(tomorrow), il, false);
        ret.mincha = tmp.shacharit;
    }
    else {
        ret.mincha = dow !== 5;
    }
    if (ret.allCongs && !ret.mincha && !ret.shacharit) {
        return NONE$1;
    }
    return ret;
}
function tachanunYear(year, il) {
    const leap = HDate.isLeapYear(year);
    const monthsInYear = HDate.monthsInYear(year);
    let av9dt = new HDate(9, months.AV, year);
    if (av9dt.getDay() === 6) {
        av9dt = av9dt.next();
    }
    let shushPurim = new HDate(15, months.ADAR_II, year);
    if (shushPurim.getDay() === 6) {
        shushPurim = shushPurim.next();
    }
    const none = [
        new HDate(2, months.TISHREI, year), // Rosh Hashana II
    ].concat(
    // Rosh Chodesh - 1st of every month. Also includes RH day 1 (1 Tishrei)
    range(1, monthsInYear).map(month => new HDate(1, month, year)), 
    // Rosh Chodesh - 30th of months that have one
    range(1, monthsInYear)
        .filter(month => HDate.daysInMonth(month, year) === 30)
        .map(month => new HDate(30, month, year)), 
    // entire month of Nisan
    range(1, HDate.daysInMonth(months.NISAN, year)).map(mday => new HDate(mday, months.NISAN, year)), new HDate(18, months.IYYAR, year), // Lag BaOmer
    // Rosh Chodesh Sivan thru Isru Chag
    range(1, 8 - (il ? 1 : 0)).map(mday => new HDate(mday, months.SIVAN, year)), av9dt, // Tisha B'Av
    new HDate(15, months.AV, year), // Tu B'Av
    new HDate(29, months.ELUL, year), // Erev Rosh Hashanah
    // Erev Yom Kippur thru Isru Chag
    range(9, 24 - (il ? 1 : 0)).map(mday => new HDate(mday, months.TISHREI, year)), 
    // Chanukah
    range(25, 33).map(mday => new HDate(mday, months.KISLEV, year)), new HDate(15, months.SHVAT, year), // Tu BiShvat
    new HDate(14, months.ADAR_II, year), // Purim
    shushPurim, leap ? new HDate(14, months.ADAR_I, year) : [] // Purim Katan
    );
    const some = [
        new HDate(14, months.IYYAR, year), // Pesach Sheini
    ].concat(
    // Until 14 Sivan
    range(1, 13).map(mday => new HDate(mday, months.SIVAN, year)), 
    // Until after Rosh Chodesh Cheshvan
    range(20, 31).map(mday => new HDate(mday, months.TISHREI, year)), 
    // Yom HaAtzma'ut, which changes based on day of week
    year >= 5708 ? dateYomHaZikaron(year).next() : [], 
    // Yom Yerushalayim
    year >= 5727 ? new HDate(28, months.IYYAR, year) : []);
    const yesPrev = [
        new HDate(29, months.ELUL, year - 1), // Erev Rosh Hashanah
        new HDate(9, months.TISHREI, year), // Erev Yom Kippur
        new HDate(14, months.IYYAR, year), // Pesach Sheini
    ];
    return {
        none: none.map(hd => hd.abs()).sort((a, b) => a - b),
        some: some.map(hd => hd.abs()).sort((a, b) => a - b),
        yesPrev: yesPrev.map(hd => hd.abs()).sort((a, b) => a - b),
    };
}

/** @private */
function renderParshaName(parsha, locale) {
    let name = Locale.gettext(parsha[0], locale);
    if (parsha.length === 2) {
        const hyphen = Locale.isHebrewLocale(locale) ? '־' : '-';
        name += hyphen + Locale.gettext(parsha[1], locale);
    }
    name = smartApostrophe(name);
    const str = Locale.gettext('Parashat', locale) + ' ' + name;
    return str.normalize();
}

/**
 * Represents one of 54 weekly Torah portions, always on a Saturday.
 *
 * `ParshaEvent` is for regular Parashat HaShavua readings. For Shabbatot
 * with holiday readings such as Shabbat Chol ha-Moed, use
 * `getHolidaysOnDate()` from `@hebcal/core`, or `getLeyningOnDate()` from
 * `@hebcal/leyning` when the display title and exact Torah readings are needed.
 */
class ParshaEvent extends Event {
    /**
     * Normally created by {@link calendar} (via `options.sedrot`)
     * rather than directly.
     * @param parsha result from {@link Sedra.lookup}
     * @throws {TypeError} if called with anything other than exactly one argument
     * @throws {TypeError} if `parsha` is not a valid {@link SedraResult} — it must
     *   have an `HDate` and one or two parsha names
     */
    constructor(parsha) {
        // eslint-disable-next-line prefer-rest-params
        if (arguments.length !== 1) {
            throw new TypeError(`ParshaEvent constructor takes a single SedraResult argument; ` +
                `got ${arguments.length} arguments`);
        }
        if (typeof parsha !== 'object' ||
            parsha === null ||
            !Array.isArray(parsha.parsha) ||
            parsha.parsha.length === 0 ||
            parsha.parsha.length > 2 ||
            !HDate.isHDate(parsha.hdate)) {
            throw new TypeError(`Invalid SedraResult argument: ${JSON.stringify(parsha)}`);
        }
        const desc = 'Parashat ' + parsha.parsha.join('-');
        super(parsha.hdate, desc, flags.PARSHA_HASHAVUA);
        this.p = parsha;
    }
    /**
     * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to empty locale.
     */
    render(locale) {
        return renderParshaName(this.p.parsha, locale);
    }
    basename() {
        return this.p.parsha.join('-');
    }
    url() {
        const year = this.greg().getFullYear();
        if (year < 100 || year > 2999) {
            return undefined;
        }
        const dt = this.urlDateSuffix();
        const url = 'https://www.hebcal.com/sedrot/' + urlFriendly(this.basename()) + '-' + dt;
        return this.p.il ? url + '?i=on' : url;
    }
    /**
     * The date portion of {@link url}, as `YYYYMMDD` — a parsha name recurs every
     * year, so the full date is needed to identify the reading.
     */
    urlDateSuffix() {
        const isoDate = isoDateString(this.greg());
        return isoDate.replaceAll('-', '');
    }
    /** convenience function for compatibility with previous implementation */
    get parsha() {
        return this.p.parsha;
    }
}

/**
 * Calculates the weekly Torah Reading (Parashat HaShavua) on Saturdays for
 * an entire Hebrew year.
 *
 * Saturdays on which a Yom Tov reading displaces the regular parsha
 * (e.g. Shabbat Chol ha-Moed Pesach/Sukkot, Yom Kippur on Shabbat) are
 * skipped — for those use {@link getHolidaysOnDate} or
 * {@link Sedra.lookup}.
 * @example
 * import {parshaYear} from '@hebcal/core';
 * const events = parshaYear(5784, false);
 * events[0].render('en'); // 'Parashat Ha’azinu'
 * events[0].getDate().toString(); // '8 Tishrei 5784'
 * @param year Hebrew year
 * @param il Israel (false for Diaspora)
 * @returns an array of `ParshaEvent` occurring on Saturdays that contain a regular
 *  (non-holiday) Parashat HaShavua
 */
function parshaYear(year, il) {
    const sedra = getSedra(year, il);
    const startAbs = sedra.getFirstSaturday();
    const endAbs = HDate.hebrew2abs(year, months.ELUL, 29);
    const events = [];
    for (let absDt = startAbs; absDt <= endAbs; absDt += 7) {
        const parsha = sedra.lookup(absDt);
        if (!parsha.chag) {
            const ev = new ParshaEvent(parsha);
            events.push(ev);
        }
    }
    return events;
}

const TISHREI = months.TISHREI;
/**
 * Gets the R.D. days for a number, Date, or HDate
 * @private
 */
function getAbs(d) {
    if (typeof d === 'number')
        return d;
    if (isDate(d))
        return greg2abs(d);
    if (HDate.isHDate(d))
        return d.abs();
    throw new TypeError(`Invalid date type: ${d}`);
}
function getYear(options) {
    if (options.year !== undefined) {
        return Number(options.year);
    }
    return options.isHebrewYear
        ? new HDate().getFullYear()
        : new Date().getFullYear();
}
const MAX_NUM_YEARS = 2000;
/**
 * Parse options object to determine start & end days
 * @private
 */
function getStartAndEnd(options) {
    const hasStart = options.start !== undefined;
    const hasEnd = options.end !== undefined;
    if (hasStart !== hasEnd) {
        throw new TypeError('options.start requires options.end');
    }
    if (hasStart && hasEnd) {
        const start = getAbs(options.start), end = getAbs(options.end);
        if (end - start > 365 * MAX_NUM_YEARS) {
            throw new RangeError(`Date range exceeds ${MAX_NUM_YEARS} years`);
        }
        return [start, end];
    }
    const isHebrewYear = Boolean(options.isHebrewYear);
    const theYear = getYear(options);
    if (isNaN(theYear)) {
        throw new RangeError(`Invalid year ${options.year}`);
    }
    if (isHebrewYear && theYear < 1) {
        throw new RangeError(`Invalid Hebrew year ${theYear}`);
    }
    const theMonth = getMonth(options);
    const numYears = Number(options.numYears) || 1;
    if (numYears > MAX_NUM_YEARS) {
        throw new RangeError(`options.numYears exceeds ${MAX_NUM_YEARS}`);
    }
    if (isHebrewYear) {
        return startEndHebrew(theMonth, theYear, numYears);
    }
    else {
        return startEndGregorian(theMonth, theYear, numYears);
    }
}
function getMonth(options) {
    if (options.month) {
        if (options.isHebrewYear) {
            return HDate.monthNum(options.month);
        }
        if (typeof options.month === 'number') {
            return options.month;
        }
    }
    return NaN;
}
function startEndGregorian(theMonth, theYear, numYears) {
    const gregMonth = theMonth ? theMonth - 1 : 0;
    const startGreg = new Date(theYear, gregMonth, 1);
    if (theYear < 100) {
        startGreg.setFullYear(theYear);
    }
    const startAbs = greg2abs(startGreg);
    let endAbs;
    if (theMonth) {
        endAbs = startAbs + daysInGregMonth(theMonth, theYear) - 1;
    }
    else {
        const endYear = theYear + numYears;
        const endGreg = new Date(endYear, 0, 1);
        if (endYear < 100) {
            endGreg.setFullYear(endYear);
        }
        endAbs = greg2abs(endGreg) - 1;
    }
    return [startAbs, endAbs];
}
function startEndHebrew(theMonth, theYear, numYears) {
    const startDate = new HDate(1, theMonth || TISHREI, theYear);
    let startAbs = startDate.abs();
    const endAbs = theMonth
        ? startAbs + startDate.daysInMonth()
        : new HDate(1, TISHREI, theYear + numYears).abs() - 1;
    // for full Hebrew year, start on Erev Rosh Hashana which
    // is technically in the previous Hebrew year
    // (but conveniently lets us get candle-lighting time for Erev)
    if (!theMonth && theYear > 1) {
        startAbs--;
    }
    return [startAbs, endAbs];
}

const cals = new Map();
/**
 * Plug-in registry for daily learning calendars such as Daf Yomi (Bavli),
 * Yerushalmi Yomi, Mishna Yomi, Nach Yomi, etc.
 *
 * `@hebcal/core` itself contains no learning schedules — they are provided
 * by the {@link https://github.com/hebcal/hebcal-learning @hebcal/learning}
 * package, which calls {@link DailyLearning.addCalendar} on import. After
 * `@hebcal/learning` is loaded, `calendar()` will emit
 * learning events when the corresponding `options.dailyLearning` flag is set.
 *
 * @example
 * import '@hebcal/learning';
 * import {DailyLearning, HDate} from '@hebcal/core';
 *
 * const ev = DailyLearning.lookup('dafYomi', new HDate(), false);
 * console.log(ev?.render('en')); // e.g. 'Daf Yomi: Berakhot 2'
 */
class DailyLearning {
    /**
     * Registers a new learning calendar.
     *
     * The provided function is called whenever a caller asks for an event
     * from this calendar; if no learning occurs that day (e.g. the date is
     * before the cycle's start) it should return `null`.
     * @example
     * DailyLearning.addCalendar(
     *   'myCalendar',
     *   (hd, il) => new Event(hd, 'Today\'s learning', 0),
     *   new HDate(1, 'Tishrei', 5780),
     * );
     * @param name case insensitive
     * @param calendar a function that returns an `Event` or `null`
     * @param startDate the first date for which this calendar is valid
     */
    static addCalendar(name, calendar, startDate) {
        if (typeof calendar !== 'function') {
            throw new TypeError(`Invalid calendar function: ${calendar}`);
        }
        cals.set(name.toLowerCase(), {
            fn: calendar,
            startDate: startDate,
        });
    }
    /**
     * Returns the learning event for the given date from the named calendar,
     * or `null` if there is no learning that day (or the named calendar is
     * not registered).
     * @example
     * import '@hebcal/learning';
     * import {DailyLearning, HDate, months} from '@hebcal/core';
     * DailyLearning.lookup('dafYomi', new HDate(15, months.CHESHVAN, 5784), false);
     * @param name case insensitive
     * @param hd Hebrew Date
     * @param il true for Israel, false for Diaspora
     */
    static lookup(name, hd, il) {
        const cal = cals.get(name.toLowerCase());
        if (typeof cal === 'object') {
            return cal.fn(hd, il);
        }
        return null;
    }
    /**
     * Returns the first Hebrew date for which the named learning calendar
     * is valid (as registered by {@link addCalendar}), or `undefined` if the
     * calendar was not registered with a start date or is not registered at all.
     * @param name case insensitive
     */
    static getStartDate(name) {
        const cal = cals.get(name.toLowerCase());
        if (typeof cal === 'object') {
            return cal.startDate;
        }
        return undefined;
    }
    /**
     * Returns `true` if a learning calendar with the given name has been
     * registered via {@link addCalendar}.
     * @param name case insensitive
     */
    static has(name) {
        return cals.has(name.toLowerCase());
    }
    /**
     * Returns the (lower-cased) names of all currently-registered learning
     * calendars.
     */
    static getCalendars() {
        return Array.from(cals.keys());
    }
}

const mevarchimChodeshStr = 'Shabbat Mevarchim Chodesh';
/** Represents Mevarchim haChodesh, the announcement of the new month */
class MevarchimChodeshEvent extends Event {
    /**
     * Constructs Mevarchim haChodesh event
     * @param date Hebrew date event occurs
     * @param monthName Hebrew month name (not translated)
     * @param memo text for the event memo. When falsy, a memo announcing the
     *   molad of the upcoming month is generated automatically
     * @param locale Optional locale name
     */
    constructor(date, monthName, memo, locale) {
        super(date, `${mevarchimChodeshStr} ${monthName}`, flags.SHABBAT_MEVARCHIM);
        this.monthName = Locale.gettext(monthName, locale);
        if (memo) {
            this.memo = memo;
        }
        else {
            const hyear = date.getFullYear();
            const hmonth = date.getMonth();
            const monNext = hmonth === HDate.monthsInYear(hyear) ? months.NISAN : hmonth + 1;
            const molad = new Molad(hyear, monNext);
            this.memo = molad.render('en', { hour12: false });
        }
    }
    basename() {
        return this.getDesc();
    }
    /**
     * Returns (translated) description of this event
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    render(locale) {
        const monthName0 = Locale.gettext(this.monthName, locale);
        const monthName = smartApostrophe(monthName0);
        return Locale.gettext(mevarchimChodeshStr, locale) + ' ' + monthName;
    }
    /**
     * Returns (translated) description of this event
     * @param [locale] Optional locale name (defaults to empty locale)
     */
    renderBrief(locale) {
        const str = this.render(locale);
        const space = str.indexOf(' ');
        return str.substring(space + 1);
    }
}

/**
 * Calculates holidays and other Hebrew calendar events based on {@link CalOptions}.
 *
 * Each holiday is represented by an {@link Event} object which includes a date,
 * a description, flags and optional attributes.
 * If given no options, returns holidays for the Diaspora for the current Gregorian year.
 *
 * The date range returned by this function can be controlled by:
 * * `options.year` - Gregorian (e.g. 1993) or Hebrew year (e.g. 5749)
 * * `options.isHebrewYear` - to interpret `year` as Hebrew year
 * * `options.numYears` - generate calendar for multiple years (default 1, maximum 2000)
 * * `options.month` - Gregorian or Hebrew month (to filter results to a single month)
 *
 * Alternatively, specify start and end days with `Date` or {@link HDate} instances:
 * * `options.start` - use specific start date (requires `end` date)
 * * `options.end` - use specific end date (requires `start` date)
 *
 * Unless `options.noHolidays == true`, default holidays include:
 * * Major holidays - Rosh Hashana, Yom Kippur, Pesach, Sukkot, etc.
 * * Minor holidays - Purim, Chanukah, Tu BiShvat, Lag BaOmer, etc.
 * * Minor fasts - Ta'anit Esther, Tzom Gedaliah, etc. (unless `options.noMinorFast`)
 * * Special Shabbatot - Shabbat Shekalim, Zachor, etc. (unless `options.noSpecialShabbat`)
 * * Modern Holidays - Yom HaShoah, Yom HaAtzma'ut, etc. (unless `options.noModern`)
 * * Rosh Chodesh (unless `options.noRoshChodesh`)
 *
 * Holiday and Torah reading schedules differ between Israel and the Disapora.
 * Set `options.il=true` to use the Israeli schedule.
 *
 * Additional non-default event types can be specified:
 * * Parashat HaShavua - weekly Torah Reading on Saturdays (`options.sedrot`)
 * * Counting of the Omer (`options.omer`)
 * * Shabbat Mevarchim HaChodesh on Saturday before Rosh Chodesh (`options.shabbatMevarchim`)
 * * Molad announcement on Saturday before Rosh Chodesh (`options.molad`)
 * * Yom Kippur Katan (`options.yomKippurKatan`)
 * * BeHaB fast days after Pesach and Sukkot (`options.behab`)
 * * Yizkor (`options.yizkor`)
 *
 * Daily Study of texts are supported by the
 * {@link https://github.com/hebcal/hebcal-learning @hebcal/learning} package,
 * for example:
 * * Babylonian Talmud Daf Yomi (`options.dailyLearning.dafYomi`)
 * * Jerusalem Talmud (Yerushalmi) Yomi (`options.dailyLearning.yerushalmi`)
 * * Mishna Yomi (`options.dailyLearning.mishnaYomi`)
 * * Nach Yomi (`options.dailyLearning.nachYomi`)
 *
 * Candle-lighting and Havdalah times are approximated using latitude and longitude
 * specified by the {@link Location} class. The `Location` class contains a small
 * database of cities with their associated geographic information and time-zone information.
 * If you ever have any doubts about Hebcal's times, consult your local halachic authority.
 * If you enter geographic coordinates above the arctic circle or antarctic circle,
 * the times are guaranteed to be wrong.
 *
 * To add candle-lighting options, set `options.candlelighting=true` and set
 * `options.location` to an instance of `Location`. By default, candle lighting
 * time is 18 minutes before sundown in the Diaspora and 20 minutes before
 * sundown in Israel (40 minutes for Jerusalem,
 * 30 minutes for Haifa and Zikhron Ya'akov) and Havdalah is
 * calculated according to Tzeit Hakochavim - Nightfall (the point when 3 small stars
 * are observable in the night time sky with the naked eye). The default Havdalah
 * option (Tzeit Hakochavim) is calculated when the sun is 8.5° below the horizon.
 * These defaults can be changed using these options:
 * * `options.candleLightingMins` - minutes before sundown to light candles
 * * `options.havdalahMins` - minutes after sundown for Havdalah (typical values are 42, 50, or 72).
 *    Havdalah times are suppressed when `options.havdalahMins=0`.
 * * `options.havdalahDeg` - degrees for solar depression for Havdalah.
 *    Default is 8.5 degrees for 3 small stars. Use 7.083 degrees for 3 medium-sized stars.
 *    Havdalah times are suppressed when `options.havdalahDeg=0`.
 *
 * If both `options.candlelighting=true` and `options.location` is specified,
 * Chanukah candle-lighting times and minor fast start/end times will also be generated.
 * Chanukah candle-lighting is at Bein HaShmashos (13.5 minutes before
 * the sun is 7.083° below the horizon in the evening)
 * on weekdays, at regular candle-lighting time on Fridays, and at regular Havdalah time on
 * Saturday night (see above).
 *
 * Minor fasts begin at Alot HaShachar (sun is 16.1° below the horizon in the morning).
 * They end when 3 medium-sized stars are observable in the night sky (sun is 7.083°
 * below the horizon in the evening) in the Diaspora, or 15 minutes after sunset in
 * Israel (Rabbi Deblitzky's practice). Override with:
 * * `options.fastEndDeg` - degrees of solar depression for the end of a minor fast
 * * `options.fastEndMins` - minutes after sunset for the end of a minor fast
 *   (mutually exclusive with `options.fastEndDeg`)
 *
 * Tish'a B'Av is different: it begins at sunset on the previous day and always ends
 * at tzeit 6.45° (Rabbi Yechiel Michel Tucazinsky), ignoring `options.fastEndDeg`
 * and `options.fastEndMins`. When a minor fast falls on a Friday the end time is
 * suppressed, because Shabbat begins before nightfall.
 *
 * Two options also exist for generating an Event with the Hebrew date:
 * * `options.addHebrewDates` - print the Hebrew date for the entire date range
 * * `options.addHebrewDatesForEvents` - print the Hebrew date for dates with some events
 *
 * Lastly, translation and transliteration of event titles is controlled by
 * `options.locale` and the {@link Locale} API.
 * `@hebcal/core` supports three locales by default:
 * * `en` - default, Sephardic transliterations (e.g. "Shabbat")
 * * `ashkenazi` - Ashkenazi transliterations (e.g. "Shabbos")
 * * `he` - Hebrew (e.g. "שַׁבָּת")
 *
 * Additional locales (such as `ru` or `fr`) are supported by the
 * {@link https://github.com/hebcal/hebcal-locales @hebcal/locales} package
 *
 * @example
 * import {calendar, Location} from '@hebcal/core';
 * const options: CalOptions = {
 *   year: 1981,
 *   isHebrewYear: false,
 *   candlelighting: true,
 *   location: Location.lookup('San Francisco'),
 *   sedrot: true,
 *   omer: true,
 * };
 * const events = calendar(options);
 * for (const ev of events) {
 *   const hd = ev.getDate();
 *   const date = hd.greg();
 *   console.log(date.toLocaleDateString(), ev.render('en'), hd.toString());
 * }
 */
function calendar(options = {}) {
    options = { ...options }; // so we can modify freely
    checkCandleOptions(options);
    const location = (options.location = options.location || defaultLocation);
    const il = (options.il = options.il || location.getIsrael() || false);
    const hasUserMask = typeof options.mask === 'number';
    options.mask = getMaskFromOptions(options);
    if (options.locale) {
        const locale = options.locale;
        if (locale && typeof locale !== 'string') {
            throw new TypeError(`Invalid options.locale: ${locale}`);
        }
        if (!Locale.hasLocale(locale)) {
            throw new TypeError(`Locale '${locale}' not found; did you forget to import @hebcal/locales?`);
        }
    }
    else if (options.ashkenazi) {
        options.locale = 'ashkenazi';
    }
    else {
        options.locale = 'en';
    }
    const evts = [];
    let sedra;
    let holidaysYear;
    let beginOmer = -1;
    let endOmer = -1;
    let currentYear = -1;
    const startAndEnd = getStartAndEnd(options);
    warnUnrecognizedOptions(options);
    const startAbs = startAndEnd[0];
    const endAbs = startAndEnd[1];
    const startGreg = abs2greg(startAbs);
    const startGregYear = startGreg.getFullYear();
    if (startGregYear < 100 || startGregYear > 9999) {
        options.candlelighting = false;
        options.sedrot = false;
        options.dailyLearning = {};
    }
    for (let abs = startAbs; abs <= endAbs; abs++) {
        const hd = new HDate(abs);
        const hyear = hd.getFullYear();
        if (hyear !== currentYear) {
            currentYear = hyear;
            holidaysYear = getHolidaysForYear_(currentYear);
            if (options.sedrot) {
                sedra = getSedra(currentYear, il);
            }
            if (options.omer) {
                beginOmer = HDate.hebrew2abs(currentYear, NISAN, 16);
                endOmer = HDate.hebrew2abs(currentYear, SIVAN, 5);
            }
        }
        const prevEventsLength = evts.length;
        const dow = hd.getDay();
        const isFriday = dow === FRI;
        const isSaturday = dow === SAT;
        let candlesEv;
        const holidays0 = holidaysYear.get(hd.toString()) || [];
        const holidays = holidays0.filter(ev => ev.observedIn(il));
        for (const ev of holidays) {
            candlesEv = appendHolidayAndRelated(candlesEv, evts, ev, options, isFriday, isSaturday, hasUserMask);
        }
        const mm = hd.getMonth();
        const dd = hd.getDate();
        // When Erev Pesach falls on Shabbat, burning chametz is moved to Friday.
        if (isFriday && options.candlelighting && mm === months.NISAN && dd === 13) {
            const biurEv = makeBiurChametzEvent(hd, options);
            if (biurEv) {
                evts.push(biurEv);
            }
        }
        if (options.sedrot && isSaturday) {
            const parsha0 = sedra.lookup(abs);
            if (!parsha0.chag) {
                evts.push(new ParshaEvent(parsha0));
            }
        }
        if (options.yizkor) {
            if ((mm === months.TISHREI && (dd === 10 || dd === 22)) ||
                (mm === NISAN && dd === (il ? 21 : 22)) ||
                (mm === SIVAN && dd === (il ? 6 : 7))) {
                const linkedEvent = holidays[0];
                const ev = new Event(hd, holidayDesc.YIZKOR, flags.YIZKOR, {
                    emoji: '🕯️',
                    linkedEvent,
                });
                evts.push(ev);
            }
        }
        const dailyLearning = options.dailyLearning;
        let numDailyLearning = 0;
        if (typeof dailyLearning === 'object' && dailyLearning !== null) {
            const events = makeDailyLearning(hd, dailyLearning, il);
            numDailyLearning = events.length;
            if (numDailyLearning) {
                evts.push(...events);
            }
        }
        if (options.omer && abs >= beginOmer && abs <= endOmer) {
            const omer = abs - beginOmer + 1;
            const omerEv = makeOmerEvent(hd, omer, options);
            evts.push(omerEv);
        }
        if (isSaturday && (options.molad || options.shabbatMevarchim)) {
            const events = makeMoladAndMevarchimChodesh(hd, options);
            evts.push(...events);
        }
        if (!candlesEv && options.candlelighting && (isFriday || isSaturday)) {
            candlesEv = makeCandleEvent(undefined, hd, options, isFriday, isSaturday);
            if (isFriday && candlesEv && sedra) {
                const parsha = sedra.lookup(abs);
                if (!parsha.chag) {
                    const pe = new ParshaEvent(parsha);
                    candlesEv.memo = pe.render(options.locale);
                }
                else {
                    candlesEv.memo = Locale.gettext(parsha.parsha[0], options.locale);
                }
            }
        }
        // suppress Havdalah when options.havdalahMins=0 or options.havdalahDeg=0
        if (candlesEv instanceof HavdalahEvent &&
            (options.havdalahMins === 0 || options.havdalahDeg === 0)) {
            candlesEv = undefined;
        }
        if (candlesEv) {
            evts.push(candlesEv);
        }
        if (options.addHebrewDates ||
            (options.addHebrewDatesForEvents &&
                prevEventsLength !== evts.length - numDailyLearning)) {
            const e2 = new HebrewDateEvent(hd);
            if (prevEventsLength === evts.length) {
                evts.push(e2);
            }
            else {
                evts.splice(prevEventsLength, 0, e2);
            }
        }
    }
    return evts;
}
const FRI = 5;
const SAT = 6;
const NISAN = months.NISAN;
const SIVAN = months.SIVAN;
const ELUL = months.ELUL;
const LIGHT_CANDLES = flags.LIGHT_CANDLES;
const YOM_TOV_ENDS = flags.YOM_TOV_ENDS;
const CHUL_ONLY = flags.CHUL_ONLY;
const IL_ONLY = flags.IL_ONLY;
const LIGHT_CANDLES_TZEIS = flags.LIGHT_CANDLES_TZEIS;
const CHANUKAH_CANDLES = flags.CHANUKAH_CANDLES;
const MINOR_FAST = flags.MINOR_FAST;
const SPECIAL_SHABBAT = flags.SPECIAL_SHABBAT;
const MODERN_HOLIDAY = flags.MODERN_HOLIDAY;
const MAJOR_FAST = flags.MAJOR_FAST;
const ROSH_CHODESH = flags.ROSH_CHODESH;
const PARSHA_HASHAVUA = flags.PARSHA_HASHAVUA;
const DAF_YOMI = flags.DAF_YOMI;
const MISHNA_YOMI = flags.MISHNA_YOMI;
const NACH_YOMI = flags.NACH_YOMI;
const YERUSHALMI_YOMI = flags.YERUSHALMI_YOMI;
const OMER_COUNT = flags.OMER_COUNT;
const SHABBAT_MEVARCHIM = flags.SHABBAT_MEVARCHIM;
const MINOR_HOLIDAY = flags.MINOR_HOLIDAY;
const EREV = flags.EREV;
const CHOL_HAMOED = flags.CHOL_HAMOED;
const YOM_KIPPUR_KATAN = flags.YOM_KIPPUR_KATAN;
const YIZKOR = flags.YIZKOR;
const BEHAB = flags.BEHAB;
const unrecognizedAlreadyWarned = new Set();
const RECOGNIZED_OPTIONS = {
    location: 1,
    year: 1,
    isHebrewYear: 1,
    month: 1,
    numYears: 1,
    start: 1,
    end: 1,
    candlelighting: 1,
    candleLightingMins: 1,
    havdalahMins: 1,
    havdalahDeg: 1,
    fastEndDeg: 1,
    fastEndMins: 1,
    sedrot: 1,
    il: 1,
    noMinorFast: 1,
    noModern: 1,
    shabbatMevarchim: 1,
    noRoshChodesh: 1,
    noSpecialShabbat: 1,
    noHolidays: 1,
    omer: 1,
    molad: 1,
    ashkenazi: 1,
    locale: 1,
    addHebrewDates: 1,
    addHebrewDatesForEvents: 1,
    mask: 1,
    yomKippurKatan: 1,
    behab: 1,
    hour12: 1,
    dailyLearning: 1,
    useElevation: 1,
    yizkor: 1,
};
/**
 * @private
 */
function warnUnrecognizedOptions(options) {
    for (const k of Object.keys(options)) {
        if (RECOGNIZED_OPTIONS[k] === undefined && !unrecognizedAlreadyWarned.has(k)) {
            console.warn(`Ignoring unrecognized HebrewCalendar option: ${k}`);
            unrecognizedAlreadyWarned.add(k);
        }
    }
    if (options.dailyLearning) {
        for (const [k, val] of Object.entries(options.dailyLearning)) {
            // Resolve aliases (e.g. `yerushalmi` -> `yerushalmi-vilna`) the same way
            // makeDailyLearning() does, so a valid option doesn't warn spuriously.
            const name = dailyLearningName(k, val);
            if (!unrecognizedAlreadyWarned.has(k) && !DailyLearning.has(name)) {
                console.warn(`Ignoring unrecognized DailyLearning calendar: ${k}`);
                unrecognizedAlreadyWarned.add(k);
            }
        }
    }
}
const israelCityOffset = {
    Jerusalem: 40,
    Haifa: 30,
    "Zikhron Ya'aqov": 30,
    "Zikhron Ya'akov": 30,
    'Zikhron Yaakov': 30,
    "Zichron Ya'akov": 30,
    'Zichron Yaakov': 30,
};
const geoIdCandleOffset = {
    '281184': 40, // Jerusalem
    '294801': 30, // Haifa
    '293067': 30, // Zikhron Yaakov
};
/**
 * @private
 * @constant
 * This calculation is based on the position of the sun 36 minutes after sunset in Jerusalem
 * around the equinox / equilux, which is 8.5° below geometric zenith.
 * The Ohr Meir considers this the time that 3 small stars are visible,
 * which is later than the required 3 medium stars.
 * @see {https://kosherjava.com/zmanim/docs/api/com/kosherjava/zmanim/ZmanimCalendar.html#ZENITH_8_POINT_5}
 */
const TZEIT_3SMALL_STARS = 8.5;
/**
 * Modifies options in-place
 * @private
 */
function checkCandleOptions(options) {
    if (!options.candlelighting) {
        return;
    }
    const location = options.location;
    if (location === undefined || !(location instanceof Location)) {
        throw new TypeError('options.candlelighting requires valid options.location');
    }
    if (typeof options.havdalahMins === 'number' &&
        typeof options.havdalahDeg === 'number') {
        throw new TypeError('options.havdalahMins and options.havdalahDeg are mutually exclusive');
    }
    if (typeof options.fastEndDeg === 'number' &&
        typeof options.fastEndMins === 'number') {
        throw new TypeError('options.fastEndDeg and options.fastEndMins are mutually exclusive');
    }
    const min0 = options.candleLightingMins;
    let min = typeof min0 === 'number' && !isNaN(min0) ? Math.trunc(min0) : 18;
    if (location.getIsrael() && Math.abs(min) === 18) {
        min = overrideIsraelCandleMins(location);
    }
    options.candleLightingMins = -1 * Math.abs(min);
    if (typeof options.havdalahMins === 'number') {
        options.havdalahMins = Math.trunc(Math.abs(options.havdalahMins));
    }
    else if (typeof options.havdalahDeg === 'number') {
        options.havdalahDeg = Math.abs(options.havdalahDeg);
    }
    else {
        options.havdalahDeg = TZEIT_3SMALL_STARS;
    }
    if (typeof options.fastEndDeg === 'number') {
        options.fastEndDeg = Math.abs(options.fastEndDeg);
    }
    if (typeof options.fastEndMins === 'number') {
        options.fastEndMins = Math.trunc(Math.abs(options.fastEndMins));
    }
}
function overrideIsraelCandleMins(location) {
    const geoid = location.getGeoId();
    if (geoid) {
        const offset = geoIdCandleOffset[geoid];
        if (typeof offset === 'number') {
            return offset;
        }
    }
    const shortName = location.getShortName();
    if (shortName) {
        const offset = israelCityOffset[shortName];
        if (typeof offset === 'number') {
            return offset;
        }
    }
    return 20;
}
/**
 * Mask to filter Holiday array
 * @private
 */
function getMaskFromOptions(options) {
    if (typeof options.mask === 'number') {
        return setOptionsFromMask(options);
    }
    const il = options.il || options.location?.getIsrael() || false;
    let mask = 0;
    // default options
    if (!options.noHolidays) {
        mask |=
            ROSH_CHODESH |
                YOM_TOV_ENDS |
                MINOR_FAST |
                SPECIAL_SHABBAT |
                MODERN_HOLIDAY |
                MAJOR_FAST |
                MINOR_HOLIDAY |
                EREV |
                CHOL_HAMOED |
                LIGHT_CANDLES |
                LIGHT_CANDLES_TZEIS |
                CHANUKAH_CANDLES;
    }
    if (options.candlelighting) {
        mask |= LIGHT_CANDLES | LIGHT_CANDLES_TZEIS | YOM_TOV_ENDS;
    }
    // suppression of defaults
    if (options.noRoshChodesh) {
        mask &= ~ROSH_CHODESH;
    }
    if (options.noModern) {
        mask &= ~MODERN_HOLIDAY;
    }
    if (options.noMinorFast) {
        mask &= ~MINOR_FAST;
    }
    if (options.noSpecialShabbat) {
        mask &= ~SPECIAL_SHABBAT;
        mask &= ~SHABBAT_MEVARCHIM;
    }
    if (il) {
        mask |= IL_ONLY;
    }
    else {
        mask |= CHUL_ONLY;
    }
    // non-default options
    if (options.sedrot) {
        mask |= PARSHA_HASHAVUA;
    }
    if (options.omer) {
        mask |= OMER_COUNT;
    }
    if (options.shabbatMevarchim) {
        mask |= SHABBAT_MEVARCHIM;
    }
    if (options.yomKippurKatan) {
        mask |= YOM_KIPPUR_KATAN;
    }
    if (options.behab) {
        mask |= BEHAB;
    }
    if (options.yizkor) {
        mask |= YIZKOR;
    }
    const dailyLearning = options.dailyLearning;
    if (typeof dailyLearning === 'object' && dailyLearning !== null) {
        if (dailyLearning.dafYomi) {
            mask |= DAF_YOMI;
        }
        if (dailyLearning.mishnaYomi) {
            mask |= MISHNA_YOMI;
        }
        if (dailyLearning.nachYomi) {
            mask |= NACH_YOMI;
        }
        if (dailyLearning.yerushalmi) {
            mask |= YERUSHALMI_YOMI;
        }
    }
    return mask;
}
const MASK_LIGHT_CANDLES = LIGHT_CANDLES | LIGHT_CANDLES_TZEIS | CHANUKAH_CANDLES | YOM_TOV_ENDS;
const defaultLocation = new Location(0, 0, false, 'UTC');
/**
 * @private
 */
function setOptionsFromMask(options) {
    const m = options.mask || 0;
    if (m & ROSH_CHODESH)
        delete options.noRoshChodesh;
    if (m & MODERN_HOLIDAY)
        delete options.noModern;
    if (m & MINOR_FAST)
        delete options.noMinorFast;
    if (m & SPECIAL_SHABBAT)
        delete options.noSpecialShabbat;
    if (m & PARSHA_HASHAVUA)
        options.sedrot = true;
    if (m & (DAF_YOMI | MISHNA_YOMI | NACH_YOMI | YERUSHALMI_YOMI)) {
        options.dailyLearning = options.dailyLearning || {};
        if (m & DAF_YOMI) {
            options.dailyLearning.dafYomi = true;
        }
        if (m & MISHNA_YOMI) {
            options.dailyLearning.mishnaYomi = true;
        }
        if (m & NACH_YOMI) {
            options.dailyLearning.nachYomi = true;
        }
        if (m & YERUSHALMI_YOMI) {
            options.dailyLearning.yerushalmi = 1;
        }
    }
    if (m & OMER_COUNT)
        options.omer = true;
    if (m & SHABBAT_MEVARCHIM)
        options.shabbatMevarchim = true;
    if (m & YOM_KIPPUR_KATAN)
        options.yomKippurKatan = true;
    if (m & BEHAB)
        options.behab = true;
    if (m & YIZKOR)
        options.yizkor = true;
    return m;
}
/**
 * Appends the Event `ev` to the `events` array. Also may add related
 * timed events like candle-lighting or fast start/end
 * @private
 */
function appendHolidayAndRelated(candlesEv, events, ev, options, isFriday, isSaturday, hasUserMask) {
    const il = options.il || false;
    if (!ev.observedIn(il)) {
        return candlesEv; // holiday isn't observed here; bail out early
    }
    const eFlags = ev.getFlags();
    if ((!options.yomKippurKatan && eFlags & YOM_KIPPUR_KATAN) ||
        (!options.behab && eFlags & BEHAB) ||
        (options.noModern && eFlags & MODERN_HOLIDAY)) {
        return candlesEv; // bail out early
    }
    if (options.candlelighting && ev.getDesc() === holidayDesc.EREV_PESACH) {
        const evts = makeErevPesachChametzEvents(ev, options);
        if (evts.length) {
            events.push(...evts);
        }
    }
    const isMajorFast = Boolean(eFlags & MAJOR_FAST);
    const isMinorFast = Boolean(eFlags & MINOR_FAST);
    let fastEv;
    if (options.candlelighting &&
        (isMajorFast || isMinorFast) &&
        ev.getDesc() !== holidayDesc.YOM_KIPPUR) {
        ev = fastEv = makeFastStartEnd(ev, options);
        if (fastEv.startEvent &&
            (isMajorFast || (isMinorFast && !options.noMinorFast))) {
            events.push(fastEv.startEvent);
        }
    }
    if (eFlags & Number(options.mask) || (!eFlags && !hasUserMask)) {
        if (options.candlelighting && eFlags & MASK_LIGHT_CANDLES) {
            const hd = ev.getDate();
            candlesEv = makeCandleEvent(ev, hd, options, isFriday, isSaturday);
            if (eFlags & CHANUKAH_CANDLES && candlesEv && !options.noHolidays) {
                // Replace Chanukah event with a clone that includes candle lighting time.
                // For clarity, allow a "duplicate" candle lighting event to remain for Shabbat
                const chanukahEv = makeWeekdayChanukahCandleLighting(ev, options);
                if (chanukahEv) {
                    if (isFriday || isSaturday) {
                        chanukahEv.eventTime = candlesEv.eventTime;
                        chanukahEv.eventTimeStr = candlesEv.eventTimeStr;
                    }
                    ev = chanukahEv;
                }
                candlesEv = undefined;
            }
        }
        if (!options.noHolidays ||
            (options.yomKippurKatan && eFlags & YOM_KIPPUR_KATAN) ||
            (options.behab && eFlags & BEHAB)) {
            events.push(ev); // the original event itself
        }
    }
    if ((isMajorFast || (isMinorFast && !options.noMinorFast)) && fastEv?.endEvent) {
        events.push(fastEv.endEvent);
    }
    return candlesEv;
}
function makeMoladAndMevarchimChodesh(hd, options) {
    const evts = [];
    const hmonth = hd.getMonth();
    const hdate = hd.getDate();
    if (hmonth !== ELUL && hdate >= 23 && hdate <= 29) {
        const hyear = hd.getFullYear();
        const monNext = hmonth === HDate.monthsInYear(hyear) ? NISAN : hmonth + 1;
        if (options.molad) {
            evts.push(new MoladEvent(hd, hyear, monNext, options));
        }
        if (options.shabbatMevarchim) {
            const nextMonthName = HDate.getMonthName(monNext, hyear);
            const molad = new Molad(hyear, monNext);
            const memo = molad.render(options.locale, options);
            evts.push(new MevarchimChodeshEvent(hd, nextMonthName, memo, options.locale));
        }
    }
    return evts;
}
function dailyLearningName(key, val) {
    if (key === 'yerushalmi') {
        return val === 2 ? 'yerushalmi-schottenstein' : 'yerushalmi-vilna';
    }
    return key;
}
function makeDailyLearning(hd, dailyLearning, il) {
    const evts = [];
    for (const [key, val] of Object.entries(dailyLearning)) {
        if (val) {
            const name = dailyLearningName(key, val);
            const learningEv = DailyLearning.lookup(name, hd, il);
            if (learningEv) {
                evts.push(learningEv);
            }
        }
    }
    return evts;
}
function makeOmerEvent(hd, omerDay, options) {
    const omerEv = new OmerEvent(hd, omerDay);
    if (options.candlelighting) {
        const location = options.location;
        const zmanim = new Zmanim(location, hd.prev(), false);
        const tzeit = zmanim.tzeit(7.0833);
        if (!isNaN(tzeit.getTime())) {
            omerEv.alarm = tzeit;
        }
    }
    return omerEv;
}
function makeErevPesachChametzEvents(erevPesachEv, options) {
    const evts = [];
    const location = options.location;
    const useElevation = Boolean(options.useElevation);
    const hd = erevPesachEv.getDate();
    const zmanim = new Zmanim(location, hd, useElevation);
    const zmanAchilas = zmanim.sofZmanTfilla(); // Gra
    if (isNaN(zmanAchilas.getTime())) {
        return [];
    }
    const zmanAchilasEv = new TimedEvent(hd, holidayDesc.SOF_ZMAN_ACHILAT_CHAMETZ, 0, zmanAchilas, location, undefined, options);
    zmanAchilasEv.emoji = '🍞';
    evts.push(zmanAchilasEv);
    // When Erev Pesach falls on Shabbat, chametz cannot be burned on Shabbat,
    // so Biur Chametz is emitted on the Friday before (see makeBiurChametzEvent
    // called from the main calendar loop). Skip it here in that case.
    if (hd.getDay() !== SAT) {
        const biurEv = makeBiurChametzEvent(hd, options);
        if (biurEv) {
            evts.push(biurEv);
        }
    }
    return evts;
}
function makeBiurChametzEvent(hd, options) {
    const location = options.location;
    const useElevation = Boolean(options.useElevation);
    const zmanim = new Zmanim(location, hd, useElevation);
    const time = zmanim.sofZmanBiurChametzGRA();
    if (isNaN(time.getTime())) {
        return undefined;
    }
    const biurChametzEv = new TimedEvent(hd, holidayDesc.BIUR_CHAMETZ, 0, time, location, undefined, options);
    biurChametzEv.emoji = '🔥';
    return biurChametzEv;
}

const NONE = 0;
const HALF = 1;
const WHOLE = 2;
/**
 * @private
 */
function hallel_(events, hdate) {
    const abs = hdate.abs();
    for (const ev of events) {
        const hd = ev.getDate();
        if (hd.abs() !== abs) {
            continue;
        }
        const desc = ev.getDesc();
        const month = hd.getMonth();
        const mday = hd.getDate();
        const mask = ev.getFlags();
        if (desc.startsWith('Chanukah') ||
            desc.startsWith('Shavuot') ||
            desc.startsWith('Sukkot') ||
            (month === months.NISAN &&
                (mday === 15 || mday === 16) &&
                mask & flags.CHAG) || // Pesach
            desc === holidayDesc.YOM_HAATZMA_UT ||
            desc === holidayDesc.YOM_YERUSHALAYIM) {
            return WHOLE;
        }
        if (mask & flags.ROSH_CHODESH ||
            (desc.startsWith('Pesach') &&
                desc !== holidayDesc.PESACH_I &&
                desc !== holidayDesc.PESACH_II)) {
            return HALF;
        }
    }
    return NONE;
}

/*
    Hebcal - A Jewish Calendar Generator
    Copyright (c) 1994-2020 Danny Sadinoff
    Portions copyright Eyal Schachter and Michael J. Radwin

    https://github.com/hebcal/hebcal-es6

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation; either version 2
    of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * HebrewCalendar is the main interface to the `@hebcal/core` library.
 * This namespace is used to calculate holidays, rosh chodesh, candle lighting & havdalah times,
 * Parashat HaShavua, Daf Yomi, days of the omer, and the molad.
 * Event names can be rendered in several languges using the `locale` option.
 */
class HebrewCalendar {
    constructor() { }
    /**
     * Calculates holidays and other Hebrew calendar events based on {@link CalOptions}.
     *
     * Each holiday is represented by an {@link Event} object which includes a date,
     * a description, flags and optional attributes.
     * If given no options, returns holidays for the Diaspora for the current Gregorian year.
     *
     * This is a convenience wrapper around the standalone {@link calendar} function.
     * See {@link calendar} for the complete list of supported options, the
     * candle-lighting and Havdalah defaults, and notes on locales.
     *
     * @example
     * import {HebrewCalendar, Location} from '@hebcal/core';
     * const options: CalOptions = {
     *   year: 1981,
     *   isHebrewYear: false,
     *   candlelighting: true,
     *   location: Location.lookup('San Francisco'),
     *   sedrot: true,
     *   omer: true,
     * };
     * const events = HebrewCalendar.calendar(options);
     * for (const ev of events) {
     *   const hd = ev.getDate();
     *   const date = hd.greg();
     *   console.log(date.toLocaleDateString(), ev.render('en'), hd.toString());
     * }
     */
    static calendar(options = {}) {
        return calendar(options);
    }
    /**
     * Calculates a birthday or anniversary (non-yahrzeit).
     * Returns `undefined` when `hyear` precedes the original year of `gdate`.
     *
     * When `hyear` is the original year, the original date is returned unchanged —
     * a "0th birthday" is a meaningful thing to ask for. This differs from
     * {@link getYahrzeit}, which returns `undefined` for the original year,
     * because a yahrzeit only has meaning from the first anniversary onward.
     *
     * Hebcal uses the algorithm defined in "Calendrical Calculations"
     * by Edward M. Reingold and Nachum Dershowitz.
     *
     * The birthday of someone born in Adar of an ordinary year or Adar II of
     * a leap year is also always in the last month of the year, be that Adar
     * or Adar II. The birthday in an ordinary year of someone born during the
     * first 29 days of Adar I in a leap year is on the corresponding day of Adar;
     * in a leap year, the birthday occurs in Adar I, as expected.
     *
     * Someone born on the thirtieth day of Marcheshvan, Kislev, or Adar I
     * has his birthday postponed until the first of the following month in
     * years where that day does not occur. [Calendrical Calculations p. 111]
     * @example
     * import {HebrewCalendar} from '@hebcal/core';
     * const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
     * const hd = HebrewCalendar.getBirthdayOrAnniversary(5780, dt); // '1 Nisan 5780'
     * console.log(hd.greg().toLocaleDateString('en-US')); // '3/26/2020'
     * @param hyear Hebrew year
     * @param gdate Gregorian or Hebrew date of event
     * @returns anniversary occurring in `hyear`
     */
    static getBirthdayOrAnniversary(hyear, gdate) {
        return birthdayOrAnniversary(hyear, gdate);
    }
    /**
     * Calculates yahrzeit.
     * `hyear` must be after original `gdate` of death.
     * Returns `undefined` when requested year preceeds or is same as original year.
     *
     * Hebcal uses the algorithm defined in "Calendrical Calculations"
     * by Edward M. Reingold and Nachum Dershowitz.
     *
     * The customary anniversary date of a death is more complicated and depends
     * also on the character of the year in which the first anniversary occurs.
     * There are several cases:
     *
     * * If the date of death is Marcheshvan 30, the anniversary in general depends
     *   on the first anniversary; if that first anniversary was not Marcheshvan 30,
     *   use the day before Kislev 1.
     * * If the date of death is Kislev 30, the anniversary in general again depends
     *   on the first anniversary — if that was not Kislev 30, use the day before
     *   Tevet 1.
     * * If the date of death is Adar II, the anniversary is the same day in the
     *   last month of the Hebrew year (Adar or Adar II).
     * * If the date of death is Adar I 30, the anniversary in a Hebrew year that
     *   is not a leap year (in which Adar only has 29 days) is the last day in
     *   Shevat.
     * * In all other cases, use the normal (that is, same month number) anniversary
     *   of the date of death. [Calendrical Calculations p. 113]
     * @example
     * import {HebrewCalendar} from '@hebcal/core';
     * const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
     * const hd = HebrewCalendar.getYahrzeit(5780, dt); // '30 Sh\'vat 5780'
     * console.log(hd.greg().toLocaleDateString('en-US')); // '2/25/2020'
     * @param hyear Hebrew year
     * @param gdate Gregorian or Hebrew date of death
     * @returns anniversary occurring in hyear
     */
    static getYahrzeit(hyear, gdate) {
        return yahrzeit(hyear, gdate);
    }
    /**
     * Lower-level holidays interface, which returns a `Map` of `Event`s indexed by
     * `HDate.toString()`. These events must be filtered for `flags.IL_ONLY`
     * or `flags.CHUL_ONLY` depending on Israel vs. Diaspora holiday scheme.
     *
     * Includes Rosh Chodesh, fasts, Yom Kippur Katan, Special Shabbatot, etc.,
     * but does not generate candle-lighting times, Torah readings, or Omer days.
     * The result is cached in an internal LRU.
     * @example
     * import {HebrewCalendar} from '@hebcal/core';
     * const map = HebrewCalendar.getHolidaysForYear(5784);
     * for (const [hdStr, events] of map.entries()) {
     *   for (const ev of events) {
     *     console.log(hdStr, ev.getDesc());
     *   }
     * }
     * @param year Hebrew year
     */
    static getHolidaysForYear(year) {
        return getHolidaysForYear_(year);
    }
    /**
     * Returns a sorted array of holidays observed during the given Hebrew year.
     *
     * Events are pre-filtered by Israel vs. Diaspora schedule, so callers do not
     * need to inspect `flags.IL_ONLY` / `flags.CHUL_ONLY` themselves.
     * Includes Rosh Chodesh, fasts, modern holidays, special Shabbatot, etc.,
     * but does not generate candle-lighting times, Torah readings, or Omer days.
     * @example
     * import {HebrewCalendar} from '@hebcal/core';
     * const events = HebrewCalendar.getHolidaysForYearArray(5784, false);
     * console.log(events[0].getDesc()); // 'Rosh Hashana 5784'
     * @param year Hebrew year
     * @param il use the Israeli schedule for holidays
     */
    static getHolidaysForYearArray(year, il) {
        return getHolidaysForYearArray(year, il);
    }
    /**
     * Returns an array of holiday Events that occur on the given date,
     * or `undefined` if no holidays occur that day.
     *
     * When `il` is omitted, both Diaspora-only and Israel-only events are
     * returned; pass `true` or `false` to filter to a single schedule.
     * @example
     * import {HebrewCalendar, HDate, months} from '@hebcal/core';
     * const hd = new HDate(15, months.NISAN, 5784);
     * const events = HebrewCalendar.getHolidaysOnDate(hd, false);
     * console.log(events?.map(ev => ev.getDesc())); // ['Pesach I']
     * @param date Hebrew Date, Gregorian date, or absolute R.D. day number
     * @param [il] use the Israeli schedule for holidays
     */
    static getHolidaysOnDate(date, il) {
        return getHolidaysOnDate(date, il);
    }
    /**
     * Returns `true` if Eruv Tavshilin should be prepared on the given date.
     *
     * Eruv Tavshilin is prepared when a Yom Tov falls on Friday (so cooking
     * for Shabbat that begins Friday night may continue from Yom Tov into
     * Shabbat). This requires the day before to be a weekday (Wednesday or
     * Thursday), the following Friday to be Yom Tov, and the day after Friday
     * (Shabbat) to also be a sacred day.
     * @example
     * import {HebrewCalendar} from '@hebcal/core';
     * // Wednesday October 16, 2024 is Erev Sukkot 5785. In the Diaspora,
     * // Sukkot I falls on Thursday and Sukkot II on Friday, so Eruv
     * // Tavshilin is prepared on Wednesday:
     * HebrewCalendar.eruvTavshilin(new Date(2024, 9, 16), false); // true
     * // In Israel there is only one day of Yom Tov, so Friday is a weekday:
     * HebrewCalendar.eruvTavshilin(new Date(2024, 9, 16), true); // false
     * @param date Gregorian or Hebrew date to test
     * @param il use the Israeli holiday schedule
     */
    static eruvTavshilin(date, il) {
        if (date.getDay() < 3 || date.getDay() > 4) {
            return false;
        }
        const today = new HDate(date);
        const friday = today.after(5);
        const tomorrow = today.next();
        if (!isChag(friday, il) || isChag(today, il) || !isChag(tomorrow, il)) {
            return false;
        }
        return true;
    }
    /**
     * Helper function to format a 24-hour (00:00-23:59) time string in either
     * 12-hour US format (e.g. `"8:13pm"`) or keep it in 24-hour format (e.g.
     * `"20:13"`) for any other locale or country.
     *
     * The locale (and therefore default behavior) is derived from
     * `options.location` / `options.locale`. The `options.hour12` override
     * takes precedence: if `false`, locale is ignored and the result is always
     * 24-hour; if `true`, locale is ignored and the result is always 12-hour.
     * @example
     * import {HebrewCalendar, Location} from '@hebcal/core';
     * const opts = {location: Location.lookup('Chicago')};
     * HebrewCalendar.reformatTimeStr('20:30', 'pm', opts);          // '8:30pm'
     * HebrewCalendar.reformatTimeStr('20:30', 'pm', {hour12: false}); // '20:30'
     * @param timeStr - original time like "20:30"
     * @param suffix - "p" or "pm" or " P.M.". Add leading space if you want it
     * @param options optional; `location`, `locale` and `hour12` are consulted
     */
    static reformatTimeStr(timeStr, suffix, options) {
        return reformatTimeStr(timeStr, suffix, options);
    }
    /**
     * Returns the semantic version string of the `@hebcal/core` package
     * (e.g. `"6.8.2"`). Useful for logging or feature detection.
     */
    static version() {
        return version;
    }
    /**
     * Convenience function to create an instance of {@link Sedra} or reuse a
     * previously created and cached instance for the same year + schedule.
     *
     * Use this in preference to `new Sedra(...)` when calling repeatedly,
     * since an internal LRU cache (~120 entries) avoids recomputing the
     * keviyah-specific reading pattern.
     * @example
     * import {HebrewCalendar, HDate} from '@hebcal/core';
     * const sedra = HebrewCalendar.getSedra(5784, false);
     * const result = sedra.lookup(new HDate(15, 'Cheshvan', 5784));
     * console.log(result.parsha); // ['Vayera']
     * @param hyear Hebrew year
     * @param il Use Israel sedra schedule (`false` for Diaspora)
     */
    static getSedra(hyear, il) {
        return getSedra(hyear, il);
    }
    /**
     * Determines which form of Hallel (if any) is recited
     * on a given Hebrew date.
     *
     * Returns 0 (none), 1 (half Hallel), or 2 (whole Hallel).
     *
     * Whole Hallel is said on Chanukah, the first Yom Tov of Pesach, Shavuot, Sukkot,
     * Yom Ha'atzmaut, and Yom Yerushalayim.
     *
     * Half Hallel is said on Rosh Chodesh (not Rosh Hashanah), and the last 6 days of Pesach.
     * @example
     * import {HebrewCalendar, HDate, months} from '@hebcal/core';
     * HebrewCalendar.hallel(new HDate(25, months.KISLEV, 5784), false); // 2 (Chanukah)
     * HebrewCalendar.hallel(new HDate(1, months.SHVAT, 5784), false);   // 1 (Rosh Chodesh)
     * HebrewCalendar.hallel(new HDate(2, months.SHVAT, 5784), false);   // 0
     * @param hdate Hebrew date to test
     * @param il use the Israeli holiday schedule
     * @returns 0 for no Hallel, 1 for half Hallel, 2 for whole Hallel
     */
    static hallel(hdate, il) {
        const events = getHolidaysOnDate(hdate, il);
        if (!events) {
            return 0;
        }
        return hallel_(events, hdate);
    }
    /**
     * Return details on what Tachanun (or Tzidchatcha on Shabbat) is said on `hdate`.
     *
     * Tachanun is not said on Rosh Chodesh, the month of Nisan, Lag Baomer,
     * Rosh Chodesh Sivan until Isru Chag, Tisha B'av, 15 Av, Erev Rosh Hashanah,
     * Rosh Hashanah, Erev Yom Kippur until after Simchat Torah, Chanukah,
     * Tu B'shvat, Purim and Shushan Purim, and Purim and Shushan Purim Katan.
     *
     * In some congregations Tachanun is not said until from Rosh Chodesh Sivan
     * until 14th Sivan, Sukkot until after Rosh Chodesh Cheshvan, Pesach Sheini,
     * Yom Ha'atzmaut, and Yom Yerushalayim.
     *
     * Tachanun is not said at Mincha on days before it is not said at Shacharit.
     *
     * Tachanun is not said at Shacharit on Shabbat, but is at Mincha, usually.
     * @example
     * import {HebrewCalendar, HDate, months} from '@hebcal/core';
     * // Regular weekday — Tachanun is said at both services
     * HebrewCalendar.tachanun(new HDate(4, months.SHVAT, 5784), false);
     * // => { shacharit: true, mincha: true, allCongs: true }
     *
     * // Friday 2 Sh'vat — said at Shacharit, but not at Mincha (erev Shabbat)
     * HebrewCalendar.tachanun(new HDate(2, months.SHVAT, 5784), false);
     * // => { shacharit: true, mincha: false, allCongs: true }
     *
     * // Rosh Chodesh — no Tachanun
     * HebrewCalendar.tachanun(new HDate(1, months.SHVAT, 5784), false);
     * // => { shacharit: false, mincha: false, allCongs: false }
     * @param hdate Hebrew date to test
     * @param il use the Israeli holiday schedule
     */
    static tachanun(hdate, il) {
        return tachanun(hdate, il);
    }
}
/**
 * @private
 */
function isChag(date, il) {
    const events = getHolidaysOnDate(date, il) || [];
    const chag = events.filter(ev => ev.getFlags() & flags.CHAG);
    return chag.length !== 0;
}

exports.AsaraBTevetEvent = AsaraBTevetEvent;
exports.CandleLightingEvent = CandleLightingEvent;
exports.ChanukahEvent = ChanukahEvent;
exports.DailyLearning = DailyLearning;
exports.Event = Event;
exports.FastDayEvent = FastDayEvent;
exports.GeoLocation = GeoLocation;
exports.HDate = HDate;
exports.HavdalahEvent = HavdalahEvent;
exports.HebrewCalendar = HebrewCalendar;
exports.HebrewDateEvent = HebrewDateEvent;
exports.HolidayEvent = HolidayEvent;
exports.Locale = Locale;
exports.Location = Location;
exports.MevarchimChodeshEvent = MevarchimChodeshEvent;
exports.Molad = Molad;
exports.MoladEvent = MoladEvent;
exports.NOAACalculator = NOAACalculator;
exports.OmerEvent = OmerEvent;
exports.ParshaEvent = ParshaEvent;
exports.RoshChodeshEvent = RoshChodeshEvent;
exports.RoshHashanaEvent = RoshHashanaEvent;
exports.Sedra = Sedra;
exports.TimedChanukahEvent = TimedChanukahEvent;
exports.TimedEvent = TimedEvent;
exports.YomKippurKatanEvent = YomKippurKatanEvent;
exports.Zmanim = Zmanim;
exports.calculateMolad = calculateMolad;
exports.calendar = calendar;
exports.flags = flags;
exports.gematriya = gematriya;
exports.gematriyaStrToNum = gematriyaStrToNum;
exports.getHolidaysOnDate = getHolidaysOnDate;
exports.getMoladAsDate = getMoladAsDate;
exports.getSedra = getSedra;
exports.holidayDesc = holidayDesc;
exports.isAssurBemlacha = isAssurBemlacha;
exports.isAveilut = isAveilut;
exports.isFastDay = isFastDay;
exports.months = months;
exports.parshaYear = parshaYear;
exports.parshiot = parshiot;
exports.reformatTimeStr = reformatTimeStr;
exports.tachanun = tachanun;
exports.version = version;

return exports;

})({});
//# sourceMappingURL=bundle.js.map
