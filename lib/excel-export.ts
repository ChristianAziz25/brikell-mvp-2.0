import * as XLSX from 'xlsx';
import { RentRollResult } from './rent-roll-service';

/**
 * Download the cleaned/mapped rent roll data as an Excel file
 */
export function downloadCleanedExcel(result: RentRollResult): void {
  const { rows, columns, column_mapping, filename } = result;

  // Build header row using standardized names where available
  const headers = columns.map((col) => column_mapping[col] || col);

  // Build data rows
  const data = rows.map((row) => row.raw);

  // Create worksheet with headers first, then data
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Style header row (optional: set column widths)
  const colWidths = headers.map((h) => ({ wch: Math.max(h.length, 12) }));
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rent Roll');

  // Generate clean filename
  const cleanFilename = filename.replace(/\.[^.]+$/, '') + '_cleaned.xlsx';

  // Trigger download
  XLSX.writeFile(wb, cleanFilename);
}
