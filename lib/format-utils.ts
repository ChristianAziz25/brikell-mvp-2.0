import { RentRollRow } from './rent-roll-service';

/**
 * Format number with Danish thousands separator (dot)
 */
export function formatDanishNumber(n: number): string {
  return n.toLocaleString('da-DK');
}

/**
 * Format large numbers with suffix (m for million, k for thousand)
 */
export function formatCompactDKK(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString('da-DK', { maximumFractionDigits: 2 })}m kr`;
  }
  if (n >= 1_000) {
    return `${formatDanishNumber(Math.round(n))} kr`;
  }
  return `${n} kr`;
}

/**
 * Format area with Danish locale
 */
export function formatArea(sqm: number): string {
  return `${formatDanishNumber(Math.round(sqm))} m²`;
}

/**
 * Format average rent per sqm
 */
export function formatRentPerSqm(rate: number): string {
  return `${formatDanishNumber(Math.round(rate))} kr/m²`;
}

/**
 * Format a percentage with Danish locale (comma as decimal separator)
 */
export function formatPercentage(value: number): string {
  return value.toLocaleString('da-DK', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }) + '%';
}

/**
 * Format rent per unit
 */
export function formatRentPerUnit(rent: number, units: number): string {
  if (units === 0) return '0 kr';
  return formatDanishNumber(Math.round(rent / units)) + ' kr';
}

/**
 * Extract property info from first row using column mapping
 */
export function extractPropertyInfo(
  rows: RentRollRow[],
  columns: string[],
  columnMapping: Record<string, string>
): {
  propertyName: string | null;
  address: string | null;
  postalCode: string | null;
} {
  if (rows.length === 0) {
    return { propertyName: null, address: null, postalCode: null };
  }

  const firstRow = rows[0].raw;

  // Find column indices based on standardized mapping
  const reverseMapping: Record<string, number> = {};
  columns.forEach((col, idx) => {
    const standardName = columnMapping[col];
    if (standardName) {
      reverseMapping[standardName] = idx;
    }
  });

  const getValue = (standardName: string): string | null => {
    const idx = reverseMapping[standardName];
    if (idx !== undefined && firstRow[idx]) {
      return String(firstRow[idx]).trim() || null;
    }
    return null;
  };

  return {
    propertyName: getValue('property_name'),
    address: getValue('address') || getValue('unit_address'),
    postalCode: getValue('postal_code') || getValue('unit_zipcode'),
  };
}
