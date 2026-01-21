'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp, Download, Table2, AlertCircle } from 'lucide-react';
import { CombinedAnalysisResult, ProcessingStatus } from '@/lib/types';
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
import { cn } from '@/lib/utils';

interface CombinedAnalysisCardProps {
  result: CombinedAnalysisResult;
  isProcessing?: boolean;
}

function ProcessingLoadingView({ status }: { status: ProcessingStatus }) {
  return (
    <div className="py-4">
      <p className="text-xs text-gray-400 mb-2">{status.currentStep}</p>
      <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${status.progress}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-300 mt-1.5">{status.progress}%</p>
    </div>
  );
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

function RentRollTab({ result, showTable, setShowTable }: {
  result: RentRollResult;
  showTable: boolean;
  setShowTable: (show: boolean) => void;
}) {
  const { summary, columns, rows, filename } = result;
  const breakdown = summary.unit_type_breakdown;

  const propertyInfo = extractPropertyInfo(rows, columns, result.column_mapping);

  const totalVacancyRate = summary.total_units > 0
    ? (summary.total_vacant / summary.total_units) * 100
    : 0;

  const totalRentPerSqm = summary.total_sqm > 0
    ? summary.total_annual_rent / summary.total_sqm
    : 0;

  const handleDownload = () => {
    downloadCleanedExcel(result);
  };

  const displayName = propertyInfo.propertyName || filename.replace(/\.[^.]+$/, '');

  const locationParts: string[] = [];
  if (propertyInfo.address) locationParts.push(propertyInfo.address);
  if (propertyInfo.postalCode) locationParts.push(propertyInfo.postalCode);
  const locationString = locationParts.length > 0 ? locationParts.join(' · ') : null;

  return (
    <div>
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
          onClick={() => setShowTable(!showTable)}
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

function MemoTab({ content }: { content: string }) {
  return (
    <div className="text-foreground prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="font-semibold text-xl mt-8 mb-3 first:mt-0 pb-2 border-b border-gray-200 text-gray-900">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-semibold text-base mt-4 mb-2 text-gray-800">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 space-y-2 my-3">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 leading-relaxed pl-1">{children}</li>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-relaxed text-gray-700">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function ErrorTab({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-md">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function CombinedAnalysisCard({ result, isProcessing }: CombinedAnalysisCardProps) {
  const [activeTab, setActiveTab] = useState<'rentroll' | 'memo'>('rentroll');
  const [showTable, setShowTable] = useState(false);

  const { rentRoll, investmentMemo, processingStatus } = result;

  // Show only loading bar while processing
  if (isProcessing && processingStatus.progress < 100) {
    return <ProcessingLoadingView status={processingStatus} />;
  }

  const hasRentRoll = !!rentRoll;
  const hasMemo = !!investmentMemo;
  const rentRollError = processingStatus.excelError;
  const memoError = processingStatus.pdfError;

  return (
    <div className="bg-white rounded-lg p-5 max-w-2xl">
      {/* Tab navigation */}
      <div className="flex gap-1 mb-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('rentroll')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'rentroll'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Rent Roll
          {rentRollError && (
            <AlertCircle className="inline-block h-3 w-3 ml-1.5 text-red-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('memo')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'memo'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Investment Memo
          {memoError && (
            <AlertCircle className="inline-block h-3 w-3 ml-1.5 text-red-500" />
          )}
        </button>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'rentroll' && (
          <>
            {rentRollError ? (
              <ErrorTab message={rentRollError} />
            ) : hasRentRoll ? (
              <RentRollTab result={rentRoll} showTable={showTable} setShowTable={setShowTable} />
            ) : (
              <div className="text-gray-500 text-sm">Ingen rent roll data</div>
            )}
          </>
        )}

        {activeTab === 'memo' && (
          <>
            {memoError ? (
              <ErrorTab message={memoError} />
            ) : hasMemo ? (
              <MemoTab content={investmentMemo} />
            ) : (
              <div className="text-gray-500 text-sm">Ingen investment memo data</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
