// import { useContext, useMemo } from 'react';
// import { EntityContext } from './EntityContext';

// // Map numberFormat to separator style
// const getSeparatorStyle = (numberFormat: string): { thousand: string; decimal: string } => {
//   switch (numberFormat) {
//     case 'US':
//       return { thousand: ',', decimal: '.' };
//     case 'EU':
//       return { thousand: '.', decimal: ',' };
//     case 'UK':
//       return { thousand: ',', decimal: '.' };
//     default:
//       return { thousand: ',', decimal: '.' };
//   }
// };

// // Helper to pad numbers
// const pad = (num: number, size: number = 2): string => num.toString().padStart(size, '0');

// export const useEntityFormatter = () => {
//   const { entity } = useContext(EntityContext);

//   const formatters = useMemo(() => {
//     const {
//       dateFormat = 'yyyy-MM-dd',
//       dateTimeFormat = 'dd-MM-yyyy HH:mm:ss',
//       decimalToValue = 5,
//       decimalToQty = 5,
//       currencyId = '',
//       numberFormat = 'US',
//     } = entity;

//     const separatorStyle = getSeparatorStyle(numberFormat);

//     /**
//      * Format a date according to the entity's dateFormat.
//      * @param date - Date object, timestamp, or ISO string
//      * @param customFormat - optional override format
//      */
//     const formatDate = (date: Date | number | string, customFormat?: string): string => {
//       const d = new Date(date);
//       if (isNaN(d.getTime())) return '';

//       const format = customFormat ?? dateFormat;
//       const day = pad(d.getDate());
//       const month = pad(d.getMonth() + 1);
//       const year = d.getFullYear().toString();

//       return format
//         .replace(/dd/g, day)
//         .replace(/MM/g, month)
//         .replace(/yyyy/g, year);
//     };

//     /**
//      * Format a date and time according to the entity's dateTimeFormat.
//      * Handles special reversed time format (ss:mm:HH).
//      */
//     const formatDateTime = (date: Date | number | string, customFormat?: string): string => {
//       const d = new Date(date);
//       if (isNaN(d.getTime())) return '';

//       let format = customFormat ?? dateTimeFormat;
//       const day = pad(d.getDate());
//       const month = pad(d.getMonth() + 1);
//       const year = d.getFullYear().toString();

//       let hours = d.getHours();
//       const minutes = d.getMinutes();
//       const seconds = d.getSeconds();
//       const hours12 = hours % 12 || 12;
//       const ampm = hours >= 12 ? 'PM' : 'AM';

//       // Check if format contains the reversed time pattern
//       const isReversedTime = format.includes('ss:mm:HH');

//       let hoursStr = pad(hours);
//       const minutesStr = pad(minutes);
//       let secondsStr = pad(seconds);
//       const hours12Str = pad(hours12);

//       if (isReversedTime) {
//         // Swap hours and seconds for display (ss:mm:HH -> actual seconds:minutes:hours)
//         hoursStr = pad(seconds);
//         secondsStr = pad(hours);
//       }

//       return format
//         .replace(/dd/g, day)
//         .replace(/MM/g, month)
//         .replace(/yyyy/g, year)
//         .replace(/HH/g, hoursStr)
//         .replace(/hh/g, hours12Str)
//         .replace(/mm/g, minutesStr)
//         .replace(/ss/g, secondsStr)
//         .replace(/a/g, ampm);
//     };

//     /**
//      * Format a numeric amount (e.g., currency) using entity decimal places and thousand separator.
//      */
//     const formatAmount = (value: number | string, decimals?: number): string => {
//   const num = typeof value === 'string' ? parseFloat(value) : value;
//   if (isNaN(num) || num === null || num === undefined) return "0.0";
//   const places = decimals ?? decimalToValue;


//  const formatted = num.toFixed(places);
      
//       // Only replace the decimal point if separatorStyle.decimal is different from '.'
//       if (separatorStyle.decimal !== '.') {
//         return formatted.replace('.', separatorStyle.decimal);
//       }
      
//       return formatted;
//     };


//     /**
//      * Format a quantity using entity decimal places for quantity and thousand separator.
//      */
//     const formatQuantity = (value: number, decimals?: number): string => {
//       const places = decimals ?? decimalToQty;
//       const fixed = value.toFixed(places);
//       const [intPart, fracPart] = fixed.split('.');

//       const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separatorStyle.thousand);
//       return fracPart ? `${withThousands}${separatorStyle.decimal}${fracPart}` : withThousands;
//     };

//     /**
//      * Get the currency symbol based on currencyId (add more as needed).
//      */
//     const getCurrencySymbol = (): string => {
//       const map: Record<string, string> = {
//         OMR: 'ر.ع.',
//         USD: '$',
//         EUR: '€',
//         GBP: '£',
//         INR: '₹',
//         AED: 'د.إ',
//       };
//       return map[currencyId] || currencyId;
//     };

//     /**
//      * Parse a date string using the entity's dateFormat (or custom format).
//      * Returns a Date object or null if parsing fails.
//      */
//     const parseDate = (dateStr: string, customFormat?: string): Date | null => {
//       const format = customFormat ?? dateFormat;

//       // Escape regex special characters and replace tokens with capture groups
//       const escapedFormat = format
//         .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex chars
//         .replace(/dd/g, '(\\d{2})')
//         .replace(/MM/g, '(\\d{2})')
//         .replace(/yyyy/g, '(\\d{4})');

//       const regex = new RegExp(`^${escapedFormat}$`);
//       const match = dateStr.match(regex);
//       if (!match) return null;

//       // Determine positions: we need to know which token is which
//       // Simple approach: assume order dd, MM, yyyy as they appear
//       // This may fail if format has different order; we need a token parser.
//       // For simplicity, we'll assume the format string's tokens appear in the order they are.
//       // We'll extract groups based on the order of tokens.
//       const tokens = format.match(/(dd|MM|yyyy)/g) || [];
//       const values: Record<string, string> = {};
//       tokens.forEach((token, index) => {
//         values[token] = match[index + 1];
//       });

//       const day = values['dd'] ? parseInt(values['dd'], 10) : 1;
//       const month = values['MM'] ? parseInt(values['MM'], 10) - 1 : 0; // month is 0-indexed
//       const year = values['yyyy'] ? parseInt(values['yyyy'], 10) : 1970;

//       const parsed = new Date(year, month, day);
//       return isNaN(parsed.getTime()) ? null : parsed;
//     };

//     return {
//       formatDate,
//       formatDateTime,
//       formatAmount,
//       formatQuantity,
//       getCurrencySymbol,
//       parseDate,
//     };
//   }, [entity]);

//   return formatters;
// };

import { useContext, useMemo } from 'react';
import { EntityContext } from './EntityContext';

// Map numberFormat to separator style
const getSeparatorStyle = (numberFormat: string): { thousand: string; decimal: string } => {
  switch (numberFormat) {
    case 'US':
      return { thousand: ',', decimal: '.' };
    case 'EU':
      return { thousand: '.', decimal: ',' };
    case 'UK':
      return { thousand: ',', decimal: '.' };
    default:
      return { thousand: ',', decimal: '.' };
  }
};

// Helper to pad numbers
const pad = (num: number, size: number = 2): string => num.toString().padStart(size, '0');

export const useEntityFormatter = () => {
  const { entity } = useContext(EntityContext);

  const formatters = useMemo(() => {
    const {
      dateFormat = 'yyyy-MM-dd',
      dateTimeFormat = 'dd-MM-yyyy HH:mm:ss',
      decimalToValue = 5,
      decimalToQty = 5,
      currencyId = '',
      numberFormat = 'US',
    } = entity;

    const separatorStyle = getSeparatorStyle(numberFormat);

    /**
     * Format a date according to the entity's dateFormat.
     * @param date - Date object, timestamp, or ISO string
     * @param customFormat - optional override format
     */
    const formatDate = (date: Date | number | string, customFormat?: string): string => {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';

      const format = customFormat ?? dateFormat;
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear().toString();

      return format
        .replace(/dd/g, day)
        .replace(/MM/g, month)
        .replace(/yyyy/g, year);
    };

    /**
     * Format a date and time according to the entity's dateTimeFormat.
     * Handles special reversed time format (ss:mm:HH).
     */
    const formatDateTime = (date: Date | number | string, customFormat?: string): string => {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';

      let format = customFormat ?? dateTimeFormat;
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear().toString();

      let hours = d.getHours();
      const minutes = d.getMinutes();
      const seconds = d.getSeconds();
      const hours12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';

      // Check if format contains the reversed time pattern
      const isReversedTime = format.includes('ss:mm:HH');

      let hoursStr = pad(hours);
      const minutesStr = pad(minutes);
      let secondsStr = pad(seconds);
      const hours12Str = pad(hours12);

      if (isReversedTime) {
        // Swap hours and seconds for display (ss:mm:HH -> actual seconds:minutes:hours)
        hoursStr = pad(seconds);
        secondsStr = pad(hours);
      }

      return format
        .replace(/dd/g, day)
        .replace(/MM/g, month)
        .replace(/yyyy/g, year)
        .replace(/HH/g, hoursStr)
        .replace(/hh/g, hours12Str)
        .replace(/mm/g, minutesStr)
        .replace(/ss/g, secondsStr)
        .replace(/a/g, ampm);
    };

    /**
     * Format a numeric amount (e.g., currency) using entity decimal places.
     * Removed thousand separator to avoid commas.
     */
    const formatAmount = (value: number | string, decimals?: number): string => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num) || num === null || num === undefined) return "0.0";
      const places = decimals ?? decimalToValue;
      
      // Format without thousand separators
      // Just use toFixed and replace the decimal point if needed
      const formatted = num.toFixed(places);
      
      // Only replace the decimal point if separatorStyle.decimal is different from '.'
      if (separatorStyle.decimal !== '.') {
        return formatted.replace('.', separatorStyle.decimal);
      }
      
      return formatted;
    };

    /**
     * Format a quantity using entity decimal places for quantity.
     * Optionally remove thousand separator if needed.
     */
    const formatQuantity = (value: number, decimals?: number): string => {
      const places = decimals ?? decimalToQty;
      const fixed = value.toFixed(places);
      const [intPart, fracPart] = fixed.split('.');

      // Remove thousand separator from integer part
      const withoutThousands = intPart; // No thousand separators added
      return fracPart ? `${withoutThousands}${separatorStyle.decimal}${fracPart}` : withoutThousands;
    };

    /**
     * Get the currency symbol based on currencyId (add more as needed).
     */
    const getCurrencySymbol = (): string => {
      const map: Record<string, string> = {
        OMR: 'ر.ع.',
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        AED: 'د.إ',
      };
      return map[currencyId] || currencyId;
    };

    /**
     * Parse a date string using the entity's dateFormat (or custom format).
     * Returns a Date object or null if parsing fails.
     */
    const parseDate = (dateStr: string, customFormat?: string): Date | null => {
      const format = customFormat ?? dateFormat;

      // Escape regex special characters and replace tokens with capture groups
      const escapedFormat = format
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex chars
        .replace(/dd/g, '(\\d{2})')
        .replace(/MM/g, '(\\d{2})')
        .replace(/yyyy/g, '(\\d{4})');

      const regex = new RegExp(`^${escapedFormat}$`);
      const match = dateStr.match(regex);
      if (!match) return null;

      // Determine positions: we need to know which token is which
      // Simple approach: assume order dd, MM, yyyy as they appear
      // This may fail if format has different order; we need a token parser.
      // For simplicity, we'll assume the format string's tokens appear in the order they are.
      // We'll extract groups based on the order of tokens.
      const tokens = format.match(/(dd|MM|yyyy)/g) || [];
      const values: Record<string, string> = {};
      tokens.forEach((token, index) => {
        values[token] = match[index + 1];
      });

      const day = values['dd'] ? parseInt(values['dd'], 10) : 1;
      const month = values['MM'] ? parseInt(values['MM'], 10) - 1 : 0; // month is 0-indexed
      const year = values['yyyy'] ? parseInt(values['yyyy'], 10) : 1970;

      const parsed = new Date(year, month, day);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    return {
      formatDate,
      formatDateTime,
      formatAmount,
      formatQuantity,
      getCurrencySymbol,
      parseDate,
    };
  }, [entity]);

  return formatters;
};