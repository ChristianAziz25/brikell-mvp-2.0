'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';

export default function DataSourcesPage() {
  const [simulateErrors, setSimulateErrors] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        simulateErrors={simulateErrors}
        onToggleErrors={() => setSimulateErrors((prev) => !prev)}
      />
      <div className="ml-0 md:ml-[60px]">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Data Sources
          </h1>
          <p className="text-muted-foreground mb-8">
            Manage your data sources and connections
          </p>
          <div className="border border-gray-200 rounded-lg p-8 text-center text-muted-foreground">
            <p>No data sources configured yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
