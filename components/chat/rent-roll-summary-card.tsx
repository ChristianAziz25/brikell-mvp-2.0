'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Table2 } from 'lucide-react';
import { RentRollResult, RentRollRow, UnitTypeStat } from '@/lib/rent-roll-service';
import {
  formatDanishNumber,
  formatCompactDKK,
  formatArea,
  formatRentPerSqm,
  formatPercentage,
  formatRentPerUnit,
  extractPropertyInfo,
} from '@/lib/format-utils';
import { downloadCleanedExcel } from '@/lib/excel-export';

interface RentRollSummaryCardProps {
  result: RentRollResult;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function CategoryStats({
  label,
  stat,
}: {
  label: string;
  stat: UnitTypeStat;
}) {
  const vacancyRate = stat.count > 0 ? (stat.vacant / stat.count) * 100 : 0;
  const rentPerSqm = stat.sqm > 0 ? stat.rent / stat.sqm : 0;

  return (
    <div className="py-3">
      <h4 className="text-xs font-semibold text-gray-700 mb-1">{label}</h4>
      <div className="space-y-0">
        <StatRow label="Antal lejemål" value={`${formatDanishNumber(stat.count)} enheder`} />
        <StatRow label="Areal" value={formatArea(stat.sqm)} />
        <StatRow label="Årlig leje" value={formatCompactDKK(stat.rent)} />
        <StatRow label="Leje/enhed" value={formatRentPerUnit(stat.rent, stat.count)} />
        <StatRow label="Leje/m²" value={formatRentPerSqm(rentPerSqm)} />
        <StatRow label="Tomgang" value={formatPercentage(vacancyRate)} />
      </div>
    </div>
  );
}

function DataTable({ rows, columns }: { rows: RentRollRow[]; columns: string[] }) {
  return (
    <div className="overflow-x-auto border border-gray-100 rounded mt-4 max-h-96 overflow-y-auto">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-2 py-1.5 text-left font-medium text-gray-600 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {row.raw.map((cell, i) => (
                <td key={i} className="px-2 py-1.5 text-gray-600 whitespace-nowrap">
                  {cell || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RentRollSummaryCard({ result }: RentRollSummaryCardProps) {
  const [showTable, setShowTable] = useState(false);

  const { summary, columns, rows, filename } = result;
  const breakdown = summary.unit_type_breakdown;

  // Extract property info from first row
  const propertyInfo = extractPropertyInfo(rows, columns, result.column_mapping);

  // Calculate total vacancy rate
  const totalVacancyRate = summary.total_units > 0
    ? (summary.total_vacant / summary.total_units) * 100
    : 0;

  // Calculate total rent per sqm
  const totalRentPerSqm = summary.total_sqm > 0
    ? summary.total_annual_rent / summary.total_sqm
    : 0;

  const handleDownload = () => {
    downloadCleanedExcel(result);
  };

  // Build display name
  const displayName = propertyInfo.propertyName || filename.replace(/\.[^.]+$/, '');

  // Build location string
  const locationParts: string[] = [];
  if (propertyInfo.address) locationParts.push(propertyInfo.address);
  if (propertyInfo.postalCode) locationParts.push(propertyInfo.postalCode);
  const locationString = locationParts.length > 0 ? locationParts.join(' · ') : null;

  return (
    <div className="bg-white rounded-lg p-5 max-w-md">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">{displayName}</h2>
        {locationString && (
          <p className="text-xs text-gray-400 mt-0.5">{locationString}</p>
        )}
      </div>

      {/* Total stats section */}
      <div className="border-b border-gray-100 pb-3 mb-3">
        <StatRow label="Antal lejemål" value={`${formatDanishNumber(summary.total_units)} enheder`} />
        <StatRow label="Areal" value={formatArea(summary.total_sqm)} />
        <StatRow label="Årlig leje" value={formatCompactDKK(summary.total_annual_rent)} />
        <StatRow label="Leje/enhed" value={formatRentPerUnit(summary.total_annual_rent, summary.total_units)} />
        <StatRow label="Leje/m²" value={formatRentPerSqm(totalRentPerSqm)} />
        <StatRow label="Tomgang" value={formatPercentage(totalVacancyRate)} />
      </div>

      {/* Fordeling section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Fordeling</h3>
        <div className="divide-y divide-gray-100">
          <CategoryStats label="Bolig" stat={breakdown.bolig} />
          <CategoryStats label="Erhverv" stat={breakdown.erhverv} />
          <CategoryStats label="Parkering" stat={breakdown.parkering} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => setShowTable((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
        >
          <Table2 className="h-3.5 w-3.5" />
          {showTable ? 'Skjul data' : 'Se alle data'}
          {showTable ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download Excel
        </button>
      </div>

      {/* Expandable table */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showTable ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {showTable && <DataTable rows={rows} columns={columns} />}
      </div>
    </div>
  );
}
