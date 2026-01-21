/**
 * Service for parsing rent roll files via the Python backend
 */

const BACKEND_URL = 'http://localhost:8000';

export interface RentRollRow {
  raw: string[];
  source: string;
  row_num: number;
  rent_type: string | null;
}

export interface UnitTypeStat {
  count: number;
  sqm: number;
  rent: number;
  vacant: number;
}

export interface UnitTypeBreakdown {
  bolig: UnitTypeStat;
  erhverv: UnitTypeStat;
  parkering: UnitTypeStat;
  andet: UnitTypeStat;
}

export interface SummaryStats {
  total_units: number;
  total_sqm: number;
  total_annual_rent: number;
  avg_rent_per_sqm: number;
  units_with_rent: number;
  units_with_sqm: number;
  total_vacant: number;
  unit_type_breakdown: UnitTypeBreakdown;
}

export interface SuspiciousRow {
  row_num: number;
  issue: string;
  value: number;
  unit: string;
}

export interface DataQuality {
  rows_missing_sqm: number[];
  rows_missing_rent: number[];
  rows_suspicious: SuspiciousRow[];
  unmapped_columns: string[];
}

export interface RentRollResult {
  success: true;
  filename: string;
  file_type: 'excel' | 'pdf';
  source_info: {
    sheets_found?: string[];
    sheets_used?: string[];
    pages?: number;
    tables_found?: number;
    ocr_used?: boolean;
  };
  header_row: number;
  columns: string[];
  column_mapping: Record<string, string>;
  rows: RentRollRow[];
  total_rows: number;
  parse_warnings: string[];
  confidence: 'high' | 'medium' | 'low';
  summary: SummaryStats;
  data_quality: DataQuality;
}

export interface RentRollError {
  success: false;
  error: string;
  message: string;
}

export type RentRollResponse = RentRollResult | RentRollError;

/**
 * Check if the backend is healthy
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Parse a rent roll file (Excel or PDF)
 */
export async function parseRentRoll(file: File): Promise<RentRollResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${BACKEND_URL}/parse`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'connection_error',
      message: 'Could not connect to backend. Is the server running at localhost:8000?',
    };
  }
}

/**
 * Check if a file is a supported rent roll format (Excel only)
 */
export function isRentRollFile(file: File): boolean {
  const ext = file.name.toLowerCase().split('.').pop();
  return ext === 'xlsx' || ext === 'xls';
}

/**
 * Check if a file is a PDF (for investment memo analysis)
 */
export function isPdfFile(file: File): boolean {
  const ext = file.name.toLowerCase().split('.').pop();
  return ext === 'pdf';
}

/**
 * Format a number using Danish locale (dots for thousands)
 */
function formatDKK(n: number): string {
  return n.toLocaleString('da-DK');
}

/**
 * Format the rent roll response for display in chat
 */
export function formatRentRollForChat(result: RentRollResult): string {
  const { summary, data_quality } = result;
  const lines: string[] = [];

  // Header
  lines.push(`## 📊 ${result.filename}\n`);

  // Summary stats table (Danish formatting)
  lines.push(`### Nøgletal\n`);
  lines.push(`| Enheder | Areal | Årlig leje | Gns. kr/m² |`);
  lines.push(`|---------|-------|------------|------------|`);
  lines.push(
    `| **${summary.total_units}** | **${formatDKK(Math.round(summary.total_sqm))} m²** | **${formatDKK(Math.round(summary.total_annual_rent))} kr** | **${formatDKK(Math.round(summary.avg_rent_per_sqm))} kr/m²** |`
  );

  // Unit type breakdown
  const breakdown = summary.unit_type_breakdown;
  const breakdownItems: string[] = [];
  if (breakdown.bolig.count > 0) breakdownItems.push(`Bolig: ${breakdown.bolig.count} enheder`);
  if (breakdown.erhverv.count > 0) breakdownItems.push(`Erhverv: ${breakdown.erhverv.count} enheder`);
  if (breakdown.parkering.count > 0) breakdownItems.push(`Parkering: ${breakdown.parkering.count} enheder`);
  if (breakdown.andet.count > 0) breakdownItems.push(`Andet: ${breakdown.andet.count} enheder`);

  if (breakdownItems.length > 0) {
    lines.push(`\n### Fordeling\n`);
    breakdownItems.forEach((item) => lines.push(`- ${item}`));
  }

  // Data quality warnings
  if (data_quality.rows_suspicious.length > 0) {
    lines.push(`\n### ⚠️ Bemærkninger\n`);
    data_quality.rows_suspicious.forEach((s) => {
      lines.push(`- **Række ${s.row_num}**: ${s.issue} (${s.value} ${s.unit})`);
    });
  }

  // Missing data
  const missingCount = data_quality.rows_missing_rent.length;
  if (missingCount > 0) {
    lines.push(`\n> ${missingCount} rækker mangler lejebeløb`);
  }

  // Column mapping
  lines.push(`\n### Kolonner genkendt\n`);
  Object.entries(result.column_mapping).forEach(([dk, std]) => {
    lines.push(`- ${dk} → ${std}`);
  });

  if (data_quality.unmapped_columns.length > 0) {
    lines.push(
      `\n*Ikke genkendt: ${data_quality.unmapped_columns.join(', ')}*`
    );
  }

  // OCR note if applicable
  if (result.source_info.ocr_used) {
    lines.push(`\n> ⚠️ OCR blev brugt (scannet PDF) - lavere sikkerhed`);
  }

  // Parse warnings
  if (result.parse_warnings.length > 0) {
    lines.push('\n### Parser advarsler\n');
    result.parse_warnings.forEach((w) => lines.push(`- ${w}`));
  }

  return lines.join('\n');
}
