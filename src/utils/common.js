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
