// Currency formatting utilities

/**
 * Format a number as Korean currency with commas
 * @param value - Number to format
 * @returns Formatted string (e.g., "1,000,000")
 */
export const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : value;
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString('ko-KR');
};

/**
 * Parse a formatted currency string to a number
 * @param value - Formatted string (e.g., "1,000,000")
 * @returns Number value
 */
export const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
};

/**
 * Format a number as Korean currency with "원" suffix
 * @param value - Number to format
 * @returns Formatted string with suffix (e.g., "1,000,000원")
 */
export const formatCurrencyWithSuffix = (value: number | string): string => {
    return `${formatCurrency(value)}원`;
};
