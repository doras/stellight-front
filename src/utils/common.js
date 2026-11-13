import { DateTime } from "luxon";

export const getUTF8Length = str => new TextEncoder().encode(str).length;
export const requiredRule = v => !!v || '필수 값입니다.';
export function hasKoreanBatchim(korean) {
    if (typeof korean !== 'string') return null;

    const lastChar = korean[korean.length - 1];
    const unicode = lastChar.charCodeAt(0);
    if (unicode < 0xac00 || unicode > 0xd7a3) return null;
    return (unicode - 44032) % 28 !== 0;
}
export function maxBytesRuleFactory(maxBytes, label = "해당 값") {
    return v => getUTF8Length(v) <= maxBytes || `${label}${hasKoreanBatchim(label) ? "은" : "는"} ${maxBytes} Bytes 까지만 입력 가능합니다.`;
}

export const formatDateTime = dateTime => dateTime.toISO().substring(0, 19);

export const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

// Returns a sort group number for a stellar (lower = earlier in list)
// Active by generation (gen > 0) → active staff (gen 0) → graduated by generation → graduated staff
export function getStellarGroupRank(stellar) {
  if (!stellar.isGraduated && stellar.generation > 0) return 0;
  if (!stellar.isGraduated && stellar.generation === 0) return 1;
  if (stellar.isGraduated && stellar.generation > 0)  return 2;
  return 3; // isGraduated && generation === 0
}

export const findStellar = (stellars, stellarId) => stellars.find(s => s.id === stellarId) || null;

// Short Korean name for compact labels; falls back to the full name when not set
export const getStellarShortName = stellar => stellar?.nameKorShort || stellar?.nameKor || '';

export const formatScheduleTime = startDateTime =>
  DateTime.fromISO(startDateTime).toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

// Day off (휴방) has no API field. By convention, it is a schedule without a fixed time
// whose title starts with "휴방".
export const isDayOff = schedule => !schedule.isFixedTime && schedule.title.trim().startsWith('휴방');

// WCAG relative luminance of a hex color ("RRGGBB" or "#RRGGBB")
function getRelativeLuminance(hex) {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => {
    const c = parseInt(value.substring(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Returns pure "#000" or "#fff", whichever has the higher contrast on the given background.
// Keep the result opaque and unmodified: the contrast is only guaranteed for these exact colors.
export function getContrastTextColor(backgroundHex) {
  const luminance = getRelativeLuminance(backgroundHex);
  const contrastWithBlack = (luminance + 0.05) / 0.05;
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithBlack >= contrastWithWhite ? '#000' : '#fff';
}
